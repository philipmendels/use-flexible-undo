import { useReducer, useMemo } from 'react';
import {
  Unducer,
  PayloadByType,
  UndoableUActionCreatorsByType,
  UndoableHandlersByType,
} from './index.types';
import { bindUndoableActionCreators } from './util';

export const useBoundUnducer = <S, PBT extends PayloadByType>(
  reducer: Unducer<S, PBT>,
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
