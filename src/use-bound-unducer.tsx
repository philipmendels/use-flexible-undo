import { useReducer, useMemo } from 'react';
import {
  Unducer,
  PayloadByType,
  UndoableUActionCreatorsByType,
  UndoableHandlersByType,
  Reducer,
  UndoMap,
  ActionCreatorsByType,
} from './index.types';
import { bindUndoableActionCreators, bindSeparateActionCreators } from './util';

type Props<S, PBT extends PayloadByType> =
  | {
      reducer: Reducer<S, PBT>;
      initialState: S;
      drdoActionCreators: ActionCreatorsByType<PBT>;
      undoActionCreators: UndoMap<PBT>;
      actionCreators?: undefined;
    }
  | {
      reducer: Unducer<S, PBT>;
      initialState: S;
      actionCreators: UndoableUActionCreatorsByType<PBT>;
      drdoActionCreators?: undefined;
      undoActionCreators?: undefined;
    };

export const useBoundUnducer = <S, PBT extends PayloadByType>(
  props: Props<S, PBT>
): [S, UndoableHandlersByType<PBT>] => {
  const { reducer, initialState } = props;
  const [state, dispatch] = useReducer(reducer, initialState);

  const handlers = useMemo(
    () =>
      props.undoActionCreators
        ? bindSeparateActionCreators(
            dispatch,
            props.drdoActionCreators,
            props.undoActionCreators
          )
        : bindUndoableActionCreators(dispatch, props.actionCreators),
    [props.actionCreators, props.drdoActionCreators, props.undoActionCreators]
  );
  return [state, handlers];
};
