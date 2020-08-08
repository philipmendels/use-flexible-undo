import { useCallback, useMemo } from 'react';

import {
  PayloadByType,
  HandlersByType,
  BranchSwitchModus,
  ActionUnion,
  Reducer,
  UseUndoableReducerProps,
  UndoMap,
  UndoableState,
  PBT_UndoableReducer,
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
  reducer: Reducer<S, PBT>,
  undoMap: UndoMap<PBT>
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
          reducer(
            acc,
            direction === 'undo'
              ? undoMap[type](payload)
              : ({
                  type,
                  payload,
                } as ActionUnion<PBT>)
          ),
        state
      ),
    };
  }
};

const timeTravel = <S, PBT extends PayloadByType>(
  prevState: UndoableState<S, PBT>,
  reducer: Reducer<S, PBT>,
  indexOnBranch: number,
  branchId: string,
  undoMap: UndoMap<PBT>
): UndoableState<S, PBT> => {
  const { history } = prevState;
  let newState: UndoableState<S, PBT> = prevState;
  if (branchId === history.currentBranchId) {
    newState = timeTravelCurrentBranch(
      prevState,
      indexOnBranch,
      reducer,
      undoMap
    );
  } else {
    const { caIndex, path, parentIndex } = getBranchSwitchProps(
      history,
      branchId
    );
    if (caIndex < history.currentPosition.globalIndex) {
      newState = timeTravelCurrentBranch(newState, caIndex, reducer, undoMap);
    }
    newState = {
      ...newState,
      history: updatePath(path.map(b => b.id))(newState.history),
    };
    // current branch is updated
    newState = timeTravelCurrentBranch(
      newState,
      parentIndex + 1 + indexOnBranch,
      reducer,
      undoMap
    );
  }
  return newState;
};

const makeUnducer = <S, PBT extends PayloadByType>(
  reducer: Reducer<S, PBT>,
  undoMap: UndoMap<PBT>
) =>
  makeReducer<UndoableState<S, PBT>, PBT_UndoableReducer<PBT>>({
    doUndoable: payload => prevState => {
      const { history, state } = prevState;
      const { action, clearFutureOnDo } = payload;
      const historyItem = createHistoryItem(action.type, action.payload);
      return {
        history: addHistoryItem(historyItem, clearFutureOnDo || false)(history),
        state: reducer(state, historyItem),
      };
    },
    undo: () => prevState => {
      const { history, state } = prevState;
      const stack = getCurrentBranch(history).stack;
      const action = stack[getCurrentIndex(history)];
      return {
        history: undoUpdater(history),
        state: reducer(
          state,
          undoMap[action.type](action.payload) as ActionUnion<PBT>
        ),
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
        } as ActionUnion<PBT>),
      };
    },
    timeTravel: payload => prevState => {
      const { history } = prevState;
      const { branchId = history.currentBranchId, indexOnBranch } = payload;
      return timeTravel(prevState, reducer, indexOnBranch, branchId, undoMap);
    },
    timeTravelById: payload => prevState => {
      const { history } = prevState;
      const { branchId = history.currentBranchId, actionId } = payload;
      const index = history.branches[branchId].stack.findIndex(
        action => action.id === actionId
      );
      if (index >= 0) {
        return timeTravel(prevState, reducer, index, branchId, undoMap);
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
          newState = timeTravelCurrentBranch(
            newState,
            caIndex,
            reducer,
            undoMap
          );
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
            reducer,
            undoMap
          );
        } else if (travelTo === 'HEAD_OF_BRANCH') {
          newState = timeTravelCurrentBranch(
            newState,
            parentIndex + targetBranch.stack.length,
            reducer,
            undoMap
          );
        }
        return newState;
      }
    },
  });

export const useUndoableReducer = <S, PBT extends PayloadByType>({
  initialHistory = createInitialHistory(),
  reducer,
  initialState,
  undoActionCreators,
  drdoActionCreators,
  options,
}: UseUndoableReducerProps<S, PBT>) => {
  const { clearFutureOnDo } = {
    ...defaultOptions,
    ...options,
  };

  const {
    reducer: unducer,
    actionCreators: unducerActionCreators,
  } = useMemo(() => makeUnducer(reducer, undoActionCreators), [
    reducer,
    undoActionCreators,
  ]);

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
      mapObject(drdoActionCreators)<HandlersByType<PBT>>(([type, creator]) => [
        type,
        payload => {
          doUndoable({
            action: creator(payload),
            clearFutureOnDo,
          });
        },
      ]),
    [drdoActionCreators, clearFutureOnDo, doUndoable]
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
