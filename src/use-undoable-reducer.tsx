import { useReducer, useMemo } from 'react';
import {
  UReducer,
  PayloadByType,
  UndoableUActionCreatorsByType,
  UndoableHandlersByType,
} from './index.types';
import { bindUndoableActionCreators } from './util';

export const useUndoableReducer = <S, PBT extends PayloadByType>(
  reducer: UReducer<S, PBT>,
  initialState: S,
  actionCreators: UndoableUActionCreatorsByType<PBT>
): [S, UndoableHandlersByType<PBT>] => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const handlers = useMemo(
    () => bindUndoableActionCreators(dispatch, actionCreators),
    [actionCreators]
  );
  return [state, handlers];
};
