import { useReducer, useMemo, Dispatch } from 'react';
import {
  PayloadByType,
  ActionCreatorsByType,
  HandlersByType,
  Reducer,
  ActionUnion,
} from './index.types';
import { bindActionCreators } from './util';

export const useBoundReducer = <S, PBT extends PayloadByType>(
  reducer: Reducer<S, PBT>,
  initialState: S,
  actionCreators: ActionCreatorsByType<PBT>
): [S, HandlersByType<PBT>, Dispatch<ActionUnion<PBT>>] => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const handlers = useMemo(() => bindActionCreators(dispatch, actionCreators), [
    actionCreators,
  ]);
  return [state, handlers, dispatch];
};
