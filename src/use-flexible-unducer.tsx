import { useCallback, useMemo, useReducer, Reducer } from 'react';

import {
  HandlersByType,
  History,
  BranchSwitchModus,
  UseUnducerProps,
  UAction,
  PBT2,
} from './index.types';
import { mapObject } from './util-internal';
import {
  getCurrentBranch,
  getCurrentIndex,
  updatePath,
  createInitialHistory,
  isUndoPossible,
  isRedoPossible,
  addAction,
  undoUpdater,
  redoUpdater,
  getNewPosition,
  getBranchSwitchProps,
  getActionForRedo,
  createAction,
} from './updaters';
import { defaultOptions } from './constants';

type UFUAction<A extends UAction<string, any>> =
  | {
      type: 'undo';
    }
  | {
      type: 'redo';
    }
  | {
      type: 'timeTravelCurrentBranch';
      payload: number;
    }
  | {
      type: 'switchToBranch';
      payload: {
        branchId: string;
        travelTo?: BranchSwitchModus;
      };
    }
  | {
      type: 'do';
      payload: {
        action: A;
        clearFutureOnDo?: boolean;
      };
    };

interface State<S, A> {
  history: History<A>;
  state: S;
}

const timeTravelCurrentBranch = <S, A extends UAction<string, any>>(
  prevState: State<S, A>,
  newIndex: number,
  reducer: Reducer<S, A>
): State<S, A> => {
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
            ...action.action,
            meta: {
              ...action.action.meta,
              isUndo: true,
            },
          }),
        prevState.state
      );
    } else if (newIndex > currentIndex) {
      const actions = currentStack.slice(currentIndex + 1, newIndex + 1);
      newState = actions.reduce(
        (acc, action) => reducer(acc, action.action),
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

// type WithOptions<A> = A & { meta?: { clearFutureOnDo?: boolean } };

const makeReducer = <S, A extends UAction<string, any>>(
  reducer: Reducer<S, A>
) => (prevState: State<S, A>, action: UFUAction<A>): State<S, A> => {
  switch (action.type) {
    case 'undo':
      const stack = getCurrentBranch(prevState.history).stack;
      const actionU = stack[getCurrentIndex(prevState.history)].action;
      return {
        history: undoUpdater(prevState.history),
        state: reducer(prevState.state, {
          ...actionU,
          meta: {
            ...actionU.meta,
            isUndo: true,
          },
        }),
      };
    case 'redo':
      const actionR = getActionForRedo(prevState.history).action;
      return {
        history: redoUpdater(prevState.history),
        state: reducer(prevState.state, actionR),
      };
    case 'timeTravelCurrentBranch':
      return timeTravelCurrentBranch(prevState, action.payload, reducer);
    case 'switchToBranch':
      const travelTo = action.payload.travelTo || 'LAST_COMMON_ACTION_IF_PAST';
      const branchId = action.payload.branchId;
      const history = prevState.history;
      let newState: State<S, A> = prevState;
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
    default:
      const action2 = createAction(action.payload.action);
      return {
        history: addAction(
          action2,
          action.payload.clearFutureOnDo || false
        )(prevState.history),
        state: reducer(prevState.state, action.payload.action),
      };
  }
};

export const useFlexibleUnducer = <S, A extends UAction<string, any>>({
  initialHistory = createInitialHistory(),
  reducer,
  initialState,
  actionCreators,
  options,
}: UseUnducerProps<S, A>) => {
  type PBT = PBT2<A>;
  const { clearFutureOnDo } = {
    ...defaultOptions,
    ...options,
  };

  const red = useMemo(() => makeReducer(reducer), [reducer]);
  const [state, dispatch] = useReducer(red, {
    state: initialState,
    history: initialHistory,
  });

  const undoables = useMemo(
    () =>
      mapObject(actionCreators)<HandlersByType<PBT>>(([type, creator]) => [
        type,
        payload => {
          const action = creator.drdo(payload);
          dispatch({
            type: 'do',
            payload: {
              action: (action as UAction<string, any>) as A,
              clearFutureOnDo,
            },
          });
        },
      ]),
    [actionCreators, clearFutureOnDo]
  );
  const history = state.history;

  const canUndo = useMemo(() => isUndoPossible(history), [history]);

  const canRedo = useMemo(() => isRedoPossible(history), [history]);

  const undo = useCallback(() => dispatch({ type: 'undo' }), []);

  const redo = useCallback(() => dispatch({ type: 'redo' }), []);

  const timeTravel = useCallback(
    (index: number) =>
      dispatch({ type: 'timeTravelCurrentBranch', payload: index }),
    []
  );

  const switchToBranch = useCallback(
    (branchId: string, travelTo?: BranchSwitchModus) =>
      dispatch({ type: 'switchToBranch', payload: { branchId, travelTo } }),
    []
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
    state: state.state,
    history,
    timeTravel,
    switchToBranch,
  };
};
