import { useReducer, useMemo } from 'react';
import {
  PayloadByType,
  ActionCreatorsByType,
  HandlersByType,
  Reducer,
} from './index.types';
import { bindActionCreators } from './util';

interface Props<S, PBT extends PayloadByType> {
  reducer: Reducer<S, PBT>;
  initialState: S;
  actionCreators: ActionCreatorsByType<PBT>;
}

export const useBindActionCreators = <S, PBT extends PayloadByType>({
  reducer,
  initialState,
  actionCreators,
}: Props<S, PBT>): [S, HandlersByType<PBT>] => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const handlers = useMemo(() => bindActionCreators(dispatch, actionCreators), [
    actionCreators,
  ]);
  return [state, handlers];
};
