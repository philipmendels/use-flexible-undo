import { useReducer, useMemo } from 'react';
import {
  PayloadByType,
  UndoableHandlersByType,
  UndoMap,
  ActionCreatorsByType,
  Reducer,
} from './index.types';
import { bindSeparateActionCreators } from './util';

export const useBindSeparateActionCreators = <S, PBT extends PayloadByType>(
  reducer: Reducer<S, PBT>,
  initialState: S,
  drdoActionCreators: ActionCreatorsByType<PBT>,
  undoActionCreators: UndoMap<PBT>
): [S, UndoableHandlersByType<PBT>] => {
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
