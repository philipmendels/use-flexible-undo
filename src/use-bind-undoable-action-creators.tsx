import { useReducer, useMemo } from 'react';
import {
  Unducer,
  PayloadByType,
  UndoableUActionCreatorsByType,
  UndoableHandlersByType,
} from './index.types';
import { bindUndoableActionCreators } from './util';

interface Props<S, PBT extends PayloadByType> {
  unducer: Unducer<S, PBT>;
  initialState: S;
  actionCreators: UndoableUActionCreatorsByType<PBT>;
}

export const useBindUndoableActionCreators = <S, PBT extends PayloadByType>({
  unducer,
  initialState,
  actionCreators,
}: Props<S, PBT>): [S, UndoableHandlersByType<PBT>] => {
  const [state, dispatch] = useReducer(unducer, initialState);

  const handlers = useMemo(
    () => bindUndoableActionCreators(dispatch, actionCreators),
    [actionCreators]
  );
  return [state, handlers];
};
