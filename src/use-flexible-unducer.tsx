import { useCallback, useMemo } from 'react';

import {
  PayloadByType,
  HandlersByType,
  History,
  BranchSwitchModus,
  UseUnducerProps,
  UReducer,
  UActionUnion,
} from './index.types';
import { mapObject } from './util-internal';
import {
  getCurrentBranch,
  getCurrentIndex,
  updatePath,
  createInitialHistory,
  createAction,
  isUndoPossible,
  isRedoPossible,
  addAction,
  undoUpdater,
  redoUpdater,
  getNewPosition,
  getBranchSwitchProps,
  getActionForRedo,
} from './updaters';
import { defaultOptions } from './constants';
import { makeReducer } from './util';
import { useBoundReducer } from './use-bound-reducer';

type PBT_Unducer<PBT extends PayloadByType> = {
  doUndoable: {
    action: UActionUnion<PBT>;
    clearFutureOnDo?: boolean;
  };
  undo: void;
  redo: void;
  timeTravelCurrentBranch: number;
  switchToBranch: {
    branchId: string;
    travelTo?: BranchSwitchModus;
  };
};

interface UnducerState<S, PBT> {
  history: History<PBT>;
  state: S;
}

const timeTravelCurrentBranch = <S, PBT extends PayloadByType>(
  prevState: UnducerState<S, PBT>,
  newIndex: number,
  reducer: UReducer<S, PBT>
): UnducerState<S, PBT> => {
  const prev = prevState.history;
  const currentIndex = getCurrentIndex(prev);
  const currentStack = getCurrentBranch(prev).stack;
  if (newIndex === currentIndex) {
    return prevState;
  } else if (newIndex > currentStack.length - 1 || newIndex < -1) {
    throw new Error(`Invalid index ${newIndex}`);
  } else {
    let newState = prevState.state;
    if (newIndex < currentIndex) {
      const actions = currentStack
        .slice(newIndex + 1, currentIndex + 1)
        .reverse();
      newState = actions.reduce(
        (acc, action) =>
          reducer(acc, {
            type: action.type,
            payload: action.payload,
            meta: {
              isUndo: true,
            },
          } as UActionUnion<PBT>),
        prevState.state
      );
    } else if (newIndex > currentIndex) {
      const actions = currentStack.slice(currentIndex + 1, newIndex + 1);
      newState = actions.reduce(
        (acc, action) =>
          reducer(acc, {
            type: action.type,
            payload: action.payload,
          } as UActionUnion<PBT>),
        prevState.state
      );
    }
    return {
      history: {
        ...prev,
        currentPosition: getNewPosition(newIndex)(currentStack),
      },
      state: newState,
    };
  }
};

const makeUnducer = <S, PBT extends PayloadByType>(reducer: UReducer<S, PBT>) =>
  makeReducer<UnducerState<S, PBT>, PBT_Unducer<PBT>>({
    doUndoable: payload => prevState => {
      const actionOriginal = payload.action;
      const historyItem = createAction(
        actionOriginal.type,
        actionOriginal.payload
      );
      return {
        history: addAction(
          historyItem,
          payload.clearFutureOnDo || false
        )(prevState.history),
        state: reducer(prevState.state, historyItem),
      };
    },
    undo: () => prevState => {
      const stack = getCurrentBranch(prevState.history).stack;
      const actionU = stack[getCurrentIndex(prevState.history)];
      return {
        history: undoUpdater(prevState.history),
        state: reducer(prevState.state, {
          type: actionU.type,
          payload: actionU.payload,
          meta: {
            isUndo: true,
          },
        } as UActionUnion<PBT>),
      };
    },
    redo: () => prevState => {
      const actionR = getActionForRedo(prevState.history);
      return {
        history: redoUpdater(prevState.history),
        state: reducer(prevState.state, {
          type: actionR.type,
          payload: actionR.payload,
        } as UActionUnion<PBT>),
      };
    },
    timeTravelCurrentBranch: payload => prevState =>
      timeTravelCurrentBranch(prevState, payload, reducer),

    switchToBranch: payload => prevState => {
      const travelTo = payload.travelTo || 'LAST_COMMON_ACTION_IF_PAST';
      const branchId = payload.branchId;
      const history = prevState.history;
      let newState: UnducerState<S, PBT> = prevState;
      if (branchId === history.currentBranchId) {
        throw new Error('You cannot switch to the current branch.');
      } else {
        const targetBranch = history.branches[branchId];
        const { caIndex, path, parentIndex } = getBranchSwitchProps(
          history,
          branchId
        );
        if (
          caIndex < history.currentPosition.globalIndex ||
          travelTo === 'LAST_COMMON_ACTION'
        ) {
          newState = timeTravelCurrentBranch(newState, caIndex, reducer);
        }
        newState = {
          ...newState,
          history: updatePath(path.map(b => b.id))(newState.history),
        };
        // current branch is updated
        if (travelTo === 'LAST_KNOWN_POSITION_ON_BRANCH') {
          newState = timeTravelCurrentBranch(
            newState,
            targetBranch.lastPosition!.globalIndex,
            reducer
          );
        } else if (travelTo === 'HEAD_OF_BRANCH') {
          newState = timeTravelCurrentBranch(
            newState,
            parentIndex + targetBranch.stack.length,
            reducer
          );
        }
        return newState;
      }
    },
  });

export const useFlexibleUnducer = <S, PBT extends PayloadByType>({
  initialHistory = createInitialHistory(),
  reducer,
  initialState,
  actionCreators,
  options,
}: UseUnducerProps<S, PBT>) => {
  const { clearFutureOnDo } = {
    ...defaultOptions,
    ...options,
  };

  const {
    reducer: unducer,
    actionCreators: unducerActionCreators,
  } = useMemo(() => makeUnducer(reducer), [reducer]);

  const [
    { state, history },
    {
      doUndoable,
      redo: boundRedo,
      undo: boundUndo,
      switchToBranch: boundSwitchToBranchDispatch,
      timeTravelCurrentBranch: timeTravel,
    },
  ] = useBoundReducer(
    unducer,
    {
      state: initialState,
      history: initialHistory,
    },
    unducerActionCreators
  );

  const undoables = useMemo(
    () =>
      mapObject(actionCreators)<HandlersByType<PBT>>(([type, creator]) => [
        type,
        payload => {
          doUndoable({
            action: creator.drdo(payload),
            clearFutureOnDo,
          });
        },
      ]),
    [actionCreators, clearFutureOnDo, doUndoable]
  );

  const canUndo = useMemo(() => isUndoPossible(history), [history]);
  const canRedo = useMemo(() => isRedoPossible(history), [history]);

  const undo = useCallback(() => boundUndo(), [boundUndo]);
  const redo = useCallback(() => boundRedo(), [boundRedo]);

  const switchToBranch = useCallback(
    (branchId: string, travelTo?: BranchSwitchModus) =>
      boundSwitchToBranchDispatch({ branchId, travelTo }),
    [boundSwitchToBranchDispatch]
  );

  // const timeTravel = useCallback(
  //   (indexOnBranch: number, branchId = history.currentBranchId) => {
  //     if (branchId === history.currentBranchId) {
  //       timeTravelCurrentBranch(indexOnBranch);
  //     } else {
  //       const { caIndex, path, parentIndex } = getBranchSwitchProps(
  //         history,
  //         branchId
  //       );
  //       if (caIndex < history.currentPosition.globalIndex) {
  //         timeTravelCurrentBranch(caIndex);
  //       }
  //       setHistory(updatePath(path.map(b => b.id)));
  //       // current branch is updated
  //       timeTravelCurrentBranch(parentIndex + 1 + indexOnBranch);
  //     }
  //   },
  //   [history, timeTravelCurrentBranch]
  // );

  // const timeTravelById = useCallback(
  //   (actionId: string, branchId = history.currentBranchId) => {
  //     const index = history.branches[branchId].stack.findIndex(
  //       action => action.id === actionId
  //     );
  //     if (index >= 0) {
  //       timeTravel(index, branchId);
  //     } else {
  //       throw new Error(
  //         `action with id ${actionId} not found on branch with id ${branchId}${
  //           branchId === history.currentBranchId ? '(current branch)' : ''
  //         }`
  //       );
  //     }
  //   },
  //   [history, timeTravel]
  // );

  return {
    undoables,
    canUndo,
    canRedo,
    undo,
    redo,
    state,
    history,
    timeTravel,
    switchToBranch,
  };
};
