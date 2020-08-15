import { useCallback, useMemo, useReducer } from 'react';

import {
  PayloadByType,
  HandlersByType,
  BranchSwitchModus,
  UseUndoableReducerProps,
} from './index.types';
import { mapObject } from './util-internal';
import {
  createInitialHistory,
  isUndoPossible,
  isRedoPossible,
} from './updaters';
import { defaultOptions } from './constants';
import { makeUndoableReducer } from './make-undoable-reducer';

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

  const undoableReducer = useMemo(
    () => makeUndoableReducer(reducer, undoActionCreators),
    [reducer, undoActionCreators]
  );

  const [{ state, history }, dispatch] = useReducer(undoableReducer, {
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
