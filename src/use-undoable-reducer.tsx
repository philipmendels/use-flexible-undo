import { useReducer, useMemo, Reducer } from 'react';
import {
  UndoableUActionCreatorsByType,
  UndoableHandlersByType,
  UAction,
} from './index.types';
import { bindUndoableActionCreators } from './util';

export const useUndoableReducer = <S, A extends UAction>(
  reducer: Reducer<S, A>,
  initialState: S,
  actionCreators: UndoableUActionCreatorsByType<A>
): [S, UndoableHandlersByType<A>] => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const handlers = useMemo(
    () => bindUndoableActionCreators(dispatch, actionCreators),
    [actionCreators]
  );
  return [state, handlers];
};
