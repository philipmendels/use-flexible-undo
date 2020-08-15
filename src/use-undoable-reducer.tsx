import {
  useCallback,
  useMemo,
  Reducer as ReducerReact,
  useReducer,
} from 'react';

import {
  PayloadByType,
  HandlersByType,
  BranchSwitchModus,
  ActionUnion,
  Reducer,
  UseUndoableReducerProps,
  UndoMap,
  UndoableState,
  PBT_UndoableReducer_Common,
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
): ReducerReact<
  UndoableState<S, PBT>,
  | ActionUnion<PBT_UndoableReducer_Common>
  | ActionUnion<PBT, { isUndoable: true; clearFutureOnDo: boolean }>
> => (prevState, reducerAction) => {
  if (reducerAction.meta?.isUndoable) {
    const { history, state } = prevState;
    const { clearFutureOnDo } = reducerAction.meta;
    const historyItem = createHistoryItem(
      reducerAction.type,
      reducerAction.payload
    );
    return {
      history: addHistoryItem(historyItem, clearFutureOnDo)(history),
      state: reducer(state, historyItem),
    };
  } else {
    const ra = reducerAction as ActionUnion<PBT_UndoableReducer_Common>;
    switch (ra.type) {
      case 'undo': {
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
      }
      case 'redo': {
        const { history, state } = prevState;
        const action = getActionForRedo(history);
        return {
          history: redoUpdater(history),
          state: reducer(state, {
            type: action.type,
            payload: action.payload,
          } as ActionUnion<PBT>),
        };
      }
      case 'timeTravel': {
        const { history } = prevState;
        const {
          branchId = history.currentBranchId,
          indexOnBranch,
        } = ra.payload;
        return timeTravel(prevState, reducer, indexOnBranch, branchId, undoMap);
      }
      case 'timeTravelById': {
        const { history } = prevState;
        const { branchId = history.currentBranchId, actionId } = ra.payload;
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
      }
      case 'switchToBranch': {
        const travelTo = ra.payload.travelTo || 'LAST_COMMON_ACTION_IF_PAST';
        const branchId = ra.payload.branchId;
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
      }
      default: {
        return prevState;
      }
    }
  }
};

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

  const unducer = useMemo(() => makeUnducer(reducer, undoActionCreators), [
    reducer,
    undoActionCreators,
  ]);

  const [{ state, history }, dispatch] = useReducer(unducer, {
    state: initialState,
    history: initialHistory,
  });

  const undoables = useMemo(
    () =>
      mapObject(drdoActionCreators)<HandlersByType<PBT>>(([type, creator]) => [
        type,
        payload => {
          dispatch({
            ...creator(payload),
            meta: { isUndoable: true, clearFutureOnDo },
          });
        },
      ]),
    [drdoActionCreators, clearFutureOnDo]
  );

  const canUndo = useMemo(() => isUndoPossible(history), [history]);
  const canRedo = useMemo(() => isRedoPossible(history), [history]);

  const undo = useCallback(() => dispatch({ type: 'undo' }), []);
  const redo = useCallback(() => dispatch({ type: 'redo' }), []);

  const timeTravel = useCallback(
    (indexOnBranch: number, branchId?: string) =>
      dispatch({ type: 'timeTravel', payload: { indexOnBranch, branchId } }),
    []
  );

  const timeTravelById = useCallback(
    (actionId: string, branchId?: string) =>
      dispatch({ type: 'timeTravelById', payload: { actionId, branchId } }),
    []
  );

  const switchToBranch = useCallback(
    (branchId: string, travelTo?: BranchSwitchModus) =>
      dispatch({ type: 'switchToBranch', payload: { branchId, travelTo } }),
    []
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
