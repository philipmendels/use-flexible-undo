import { Dispatch } from 'react';

import {
  PayloadByType,
  ActionUnion,
  Reducer,
  UndoMap,
  UndoableState,
  PBT_UndoableReducer,
  Unducer,
  UActionUnion,
  HistoryItemUnion,
  URActionUnion,
  ActionCreatorsByType,
  HandlersWithOptionsByType,
  UndoableReducer,
  UndoableUActionCreatorsByType,
} from './index.types';
import {
  getCurrentBranch,
  getCurrentIndex,
  updatePath,
  createHistoryItem,
  addHistoryItem,
  undoUpdater,
  redoUpdater,
  getNewPosition,
  getBranchSwitchProps,
  getActionForRedo,
  getTTActions,
} from './updaters';
import { mapObject } from './util-internal';

const reduce = <S, PBT extends PayloadByType>(
  reducer: Reducer<S, PBT> | Unducer<S, PBT>,
  isUndo: boolean,
  { type, payload }: URActionUnion<PBT> | HistoryItemUnion<PBT>,
  state: S,
  undoMap?: UndoMap<PBT>
) =>
  undoMap
    ? (reducer as Reducer<S, PBT>)(
        state,
        isUndo
          ? undoMap[type](payload)
          : ({
              type,
              payload,
            } as ActionUnion<PBT>)
      )
    : (reducer as Unducer<S, PBT>)(state, {
        type,
        payload,
        meta: { isUndo },
      } as UActionUnion<PBT>);

const timeTravelCurrentBranch = <S, PBT extends PayloadByType>(
  prevState: UndoableState<S, PBT>,
  newIndex: number,
  reducer: Reducer<S, PBT> | Unducer<S, PBT>,
  undoMap?: UndoMap<PBT>
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
        (acc, action) =>
          reduce(reducer, direction === 'undo', action, acc, undoMap),
        state
      ),
    };
  }
};

const timeTravel = <S, PBT extends PayloadByType>(
  prevState: UndoableState<S, PBT>,
  reducer: Reducer<S, PBT> | Unducer<S, PBT>,
  indexOnBranch: number,
  branchId: string,
  undoMap?: UndoMap<PBT>
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

export const makeUndoableReducer = <S, PBT extends PayloadByType>(
  reducer: Reducer<S, PBT> | Unducer<S, PBT>,
  undoMap?: UndoMap<PBT>
): UndoableReducer<S, PBT> => (prevState, reducerAction) => {
  if (reducerAction.meta?.isUndoable) {
    const { history, state } = prevState;
    const clearFutureOnDo = reducerAction.meta.clearFutureOnDo || false;
    const { type, payload } = reducerAction;
    const historyItem = createHistoryItem(type, payload);
    return {
      history: addHistoryItem(historyItem, clearFutureOnDo)(history),
      state: reduce(reducer, false, reducerAction, state, undoMap),
    };
  } else {
    const ra = reducerAction as ActionUnion<PBT_UndoableReducer>;
    switch (ra.type) {
      case 'undo': {
        const { history, state } = prevState;
        const stack = getCurrentBranch(history).stack;
        const action = stack[getCurrentIndex(history)];
        return {
          history: undoUpdater(history),
          state: reduce(reducer, true, action, state, undoMap),
        };
      }
      case 'redo': {
        const { history, state } = prevState;
        const action = getActionForRedo(history);
        return {
          history: redoUpdater(history),
          state: reduce(reducer, false, action, state, undoMap),
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

export const bindActionCreators = <PBT extends PayloadByType>(
  dispatch: Dispatch<URActionUnion<PBT>>,
  actionCreators: ActionCreatorsByType<PBT> | UndoableUActionCreatorsByType<PBT>
) =>
  mapObject(actionCreators as ActionCreatorsByType<PBT>)<
    HandlersWithOptionsByType<PBT>
  >(([type]) => [
    type,
    (payload, clearFutureOnDo) => {
      // TODO: call actionCreator?
      dispatch({
        type,
        payload,
        meta: { isUndoable: true, clearFutureOnDo },
      } as URActionUnion<PBT>);
    },
  ]);
