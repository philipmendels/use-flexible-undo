import { useReducer, useMemo, Reducer } from 'react';
import {
  UndoableHandlersByType,
  ActionCreatorsByType,
  BaseAction,
} from './index.types';
import { bindActionCreatorsAndUndoMap } from './util';

export const useReducerWithUndoMap = <S, A extends BaseAction>(
  reducer: Reducer<S, A>,
  initialState: S,
  actionCreators: ActionCreatorsByType<A>,
  undoMap: ActionCreatorsByType<A>
): [S, UndoableHandlersByType<A>] => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const handlers = useMemo(
    () => bindActionCreatorsAndUndoMap(dispatch, actionCreators, undoMap),
    [actionCreators, undoMap]
  );
  return [state, handlers];
};
