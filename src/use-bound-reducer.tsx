import { useReducer, useMemo } from 'react';
import {
  UReducer,
  PayloadByType,
  ActionCreatorsByType,
  HandlersByType,
} from './index.types';
import { bindActionCreators } from './util';

export const useBoundReducer = <S, PBT extends PayloadByType>(
  reducer: UReducer<S, PBT>,
  initialState: S,
  actionCreators: ActionCreatorsByType<PBT>
): [S, HandlersByType<PBT>] => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const handlers = useMemo(() => bindActionCreators(dispatch, actionCreators), [
    actionCreators,
  ]);
  return [state, handlers];
};
