import { useCallback, useMemo } from 'react';

import {
  PayloadByType,
  HandlersByType,
  BranchSwitchModus,
  UseUndoableUnducerProps,
  Unducer,
  UActionUnion,
  UndoableState,
  PBT_UndoableUnducer,
} from './index.types';
import { mapObject } from './util-internal';
import {
  getCurrentBranch,
  getCurrentIndex,
  updatePath,
  createInitialHistory,
  createHistoryItem,
  isUndoPossible,
  isRedoPossible,
  addHistoryItem,
  undoUpdater,
  redoUpdater,
  getNewPosition,
  getBranchSwitchProps,
  getActionForRedo,
  getTTActions,
} from './updaters';
import { defaultOptions } from './constants';
import { makeReducer } from './util';
import { useBoundReducer } from './use-bound-reducer';

const timeTravelCurrentBranch = <S, PBT extends PayloadByType>(
  prevState: UndoableState<S, PBT>,
  newIndex: number,
  reducer: Unducer<S, PBT>
): UndoableState<S, PBT> => {
  const { state, history } = prevState;
  const { direction, actions } = getTTActions(newIndex)(history);
  if (direction === 'none') {
    return prevState;
  } else {
    return {
      history: {
        ...history,
        currentPosition: getNewPosition(newIndex)(
          getCurrentBranch(history).stack
        ),
      },
      state: actions.reduce(
        (acc, { type, payload }) =>
          reducer(acc, {
            type,
            payload,
            meta: {
              isUndo: direction === 'undo',
            },
          } as UActionUnion<PBT>),
        state
      ),
    };
  }
};

const timeTravel = <S, PBT extends PayloadByType>(
  prevState: UndoableState<S, PBT>,
  reducer: Unducer<S, PBT>,
  indexOnBranch: number,
  branchId: string
): UndoableState<S, PBT> => {
  const { history } = prevState;
  let newState: UndoableState<S, PBT> = prevState;
  if (branchId === history.currentBranchId) {
    newState = timeTravelCurrentBranch(prevState, indexOnBranch, reducer);
  } else {
    const { caIndex, path, parentIndex } = getBranchSwitchProps(
      history,
      branchId
    );
    if (caIndex < history.currentPosition.globalIndex) {
      newState = timeTravelCurrentBranch(newState, caIndex, reducer);
    }
    newState = {
      ...newState,
      history: updatePath(path.map(b => b.id))(newState.history),
    };
    // current branch is updated
    newState = timeTravelCurrentBranch(
      newState,
      parentIndex + 1 + indexOnBranch,
      reducer
    );
  }
  return newState;
};

const makeUnducer = <S, PBT extends PayloadByType>(reducer: Unducer<S, PBT>) =>
  makeReducer<UndoableState<S, PBT>, PBT_UndoableUnducer<PBT>>({
    doUndoable: payload => prevState => {
      const { history, state } = prevState;
      const { action, clearFutureOnDo } = payload;
      const historyItem = createHistoryItem(action.type, action.payload);
      return {
        history: addHistoryItem(historyItem, clearFutureOnDo || false)(history),
        state: reducer(state, action),
      };
    },
    undo: () => prevState => {
      const { history, state } = prevState;
      const stack = getCurrentBranch(history).stack;
      const action = stack[getCurrentIndex(history)];
      return {
        history: undoUpdater(history),
        state: reducer(state, {
          type: action.type,
          payload: action.payload,
          meta: {
            isUndo: true,
          },
        } as UActionUnion<PBT>),
      };
    },
    redo: () => prevState => {
      const { history, state } = prevState;
      const action = getActionForRedo(history);
      return {
        history: redoUpdater(history),
        state: reducer(state, {
          type: action.type,
          payload: action.payload,
          meta: {
            isUndo: false,
          },
        } as UActionUnion<PBT>),
      };
    },
    timeTravel: payload => prevState => {
      const { history } = prevState;
      const { branchId = history.currentBranchId, indexOnBranch } = payload;
      return timeTravel(prevState, reducer, indexOnBranch, branchId);
    },
    timeTravelById: payload => prevState => {
      const { history } = prevState;
      const { branchId = history.currentBranchId, actionId } = payload;
      const index = history.branches[branchId].stack.findIndex(
        action => action.id === actionId
      );
      if (index >= 0) {
        return timeTravel(prevState, reducer, index, branchId);
      } else {
        throw new Error(
          `action with id ${actionId} not found on branch with id ${branchId}${
            branchId === history.currentBranchId ? '(current branch)' : ''
          }`
        );
      }
    },
    switchToBranch: payload => prevState => {
      const travelTo = payload.travelTo || 'LAST_COMMON_ACTION_IF_PAST';
      const branchId = payload.branchId;
      const history = prevState.history;
      let newState: UndoableState<S, PBT> = prevState;
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

export const useUndoableUnducer = <S, PBT extends PayloadByType>({
  initialHistory = createInitialHistory(),
  reducer,
  initialState,
  actionCreators,
  options,
}: UseUndoableUnducerProps<S, PBT>) => {
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
      timeTravel: boundTimeTravel,
      timeTravelById: boundTimeTravelById,
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

  const timeTravel = useCallback(
    (indexOnBranch: number, branchId?: string) =>
      boundTimeTravel({ indexOnBranch, branchId }),
    [boundTimeTravel]
  );

  const timeTravelById = useCallback(
    (actionId: string, branchId?: string) =>
      boundTimeTravelById({
        actionId,
        branchId,
      }),
    [boundTimeTravelById]
  );

  const switchToBranch = useCallback(
    (branchId: string, travelTo?: BranchSwitchModus) =>
      boundSwitchToBranchDispatch({ branchId, travelTo }),
    [boundSwitchToBranchDispatch]
  );

  return {
    undoables,
    canUndo,
    canRedo,
    undo,
    redo,
    state,
    history,
    timeTravel,
    timeTravelById,
    switchToBranch,
  };
};
