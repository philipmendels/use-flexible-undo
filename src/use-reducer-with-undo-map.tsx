import { useReducer, useMemo } from 'react';
import {
  PayloadByType,
  UndoableHandlersByType,
  UndoMap,
  ActionCreatorsByType,
  Reducer,
} from './index.types';
import { bindActionCreatorsAndUndoMap } from './util';

export const useReducerWithUndoMap = <S, PBT extends PayloadByType>(
  reducer: Reducer<S, PBT>,
  initialState: S,
  actionCreators: ActionCreatorsByType<PBT>,
  undoMap: UndoMap<PBT>
): [S, UndoableHandlersByType<PBT>] => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const handlers = useMemo(
    () => bindActionCreatorsAndUndoMap(dispatch, actionCreators, undoMap),
    [actionCreators, undoMap]
  );
  return [state, handlers];
};
