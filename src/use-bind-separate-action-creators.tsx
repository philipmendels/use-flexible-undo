import { useReducer, useMemo } from 'react';
import {
  PayloadByType,
  UndoableHandlersByType,
  Reducer,
  UndoMap,
  ActionCreatorsByType,
} from './index.types';
import { bindSeparateActionCreators } from './util';

interface Props<S, PBT extends PayloadByType> {
  reducer: Reducer<S, PBT>;
  initialState: S;
  drdoActionCreators: ActionCreatorsByType<PBT>;
  undoActionCreators: UndoMap<PBT>;
}

export const useBindSeparateActionCreators = <S, PBT extends PayloadByType>({
  reducer,
  initialState,
  drdoActionCreators,
  undoActionCreators,
}: Props<S, PBT>): [S, UndoableHandlersByType<PBT>] => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const handlers = useMemo(
    () =>
      bindSeparateActionCreators(
        dispatch,
        drdoActionCreators,
        undoActionCreators
      ),
    [drdoActionCreators, undoActionCreators]
  );
  return [state, handlers];
};
