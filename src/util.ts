import {
  PayloadFromTo,
  Updater,
  PayloadHandler,
  Undoable,
  PayloadByType,
  Unducer,
  UndoableUActionCreatorsByType,
  UDispatch,
  UndoableHandlersByType,
  UpdaterMaker,
  UndoableStateUpdatersByType,
  StateUpdatersByType,
  ActionCreatorsByType,
  UndoMap,
  DispatchPBT,
  Reducer,
  HandlersByType,
  URActionUnion,
  HandlersWithOptionsByType,
} from './index.types';
import {
  mapObject,
  makeUActionCreator,
  makeActionCreator,
} from './util-internal';
import { SetStateAction, Dispatch } from 'react';

export const combineHandlers = <P, R>(
  drdo: PayloadHandler<P, R>,
  undo: PayloadHandler<P, R>
): Undoable<PayloadHandler<P, R>> => ({
  drdo,
  undo,
});

export const invertHandlers = <P, R>({
  drdo,
  undo,
}: Undoable<PayloadHandler<P, R>>) => combineHandlers(undo, drdo);

export const invertFTPayload = <P>({ from, to }: PayloadFromTo<P>) => ({
  from: to,
  to: from,
});

export const invertFTHandler = <P, R>(
  handler: PayloadHandler<PayloadFromTo<P>, R>
) => (payload: PayloadFromTo<P>) => handler(invertFTPayload(payload));

export const makeHandler = <S, R>(
  stateSetter: (stateUpdater: Updater<S>) => R
) => <P = S>(
  updaterMaker: UpdaterMaker<P, S>
): PayloadHandler<P, R> => payload => stateSetter(updaterMaker(payload));

export const makeUndoableHandler = <S, R>(
  stateSetter: (stateUpdater: Updater<S>) => R
) => <P = S>(
  updaterForDrdoMaker: UpdaterMaker<P, S>,
  updaterForUndoMaker: UpdaterMaker<P, S>
) =>
  combineHandlers<P, R>(
    payload => stateSetter(updaterForDrdoMaker(payload)),
    payload => stateSetter(updaterForUndoMaker(payload))
  );

type InferState<S> = S extends SetStateAction<infer S2> ? S2 : S;

export const makeFTHandler = <S, R>(
  stateSetter: (s: S) => R
): PayloadHandler<PayloadFromTo<InferState<S>>, R> => ({ to }) =>
  stateSetter(to);

export const makeUndoableFTHandler = <S, R>(stateSetter: (s: S) => R) =>
  combineHandlers<PayloadFromTo<InferState<S>>, R>(
    ({ to }) => stateSetter(to),
    ({ from }) => stateSetter(from)
  );

export const makeUndoableSetter = <S, R>(
  stateSetter: (stateUpdater: Updater<S>) => R
) => <S_PART>(
  getter: (state: S) => S_PART,
  setter: (newState: S_PART) => (state: S) => S
) => <P, INPUT>(selector: (payload: P) => (state: S) => INPUT) => (
  updaterForDrdoMaker: UpdaterMaker<INPUT, S_PART>,
  updaterForUndoMaker: UpdaterMaker<INPUT, S_PART>
) =>
  combineHandlers<P, R>(
    payload =>
      stateSetter(prev =>
        setter(updaterForDrdoMaker(selector(payload)(prev))(getter(prev)))(prev)
      ),
    payload =>
      stateSetter(prev =>
        setter(updaterForUndoMaker(selector(payload)(prev))(getter(prev)))(prev)
      )
  );

export const makeUpdater = <S, S_PART>(
  getter: (state: S) => S_PART,
  setter: (newState: S_PART) => (state: S) => S
) => <P, INPUT>(
  selector: (payload: P) => (state: S) => INPUT,
  condition: (payload: P) => (state: S) => boolean
) => (
  updaterMaker: UpdaterMaker<INPUT, S_PART>
): PayloadHandler<P, Updater<S>> => payload => prev =>
  condition(payload)(prev)
    ? setter(updaterMaker(selector(payload)(prev))(getter(prev)))(prev)
    : prev;

export const makeUndoableUpdater = <S, S_PART>(
  getter: (state: S) => S_PART,
  setter: (newState: S_PART) => (state: S) => S
) => <P, INPUT>(
  selector: (payload: P) => (state: S) => INPUT,
  condition: (payload: P) => (state: S) => boolean
) => (
  updaterForDrdoMaker: UpdaterMaker<INPUT, S_PART>,
  updaterForUndoMaker: UpdaterMaker<INPUT, S_PART>
) =>
  combineHandlers<P, Updater<S>>(
    payload => prev =>
      condition(payload)(prev)
        ? setter(updaterForDrdoMaker(selector(payload)(prev))(getter(prev)))(
            prev
          )
        : prev,
    payload => prev =>
      condition(payload)(prev)
        ? setter(updaterForUndoMaker(selector(payload)(prev))(getter(prev)))(
            prev
          )
        : prev
  );

export const convertHandler = <P, R>(handler: PayloadHandler<P, R>) => <P2 = P>(
  convertor: (p2: P2) => P
) => (payload: P2) => handler(convertor(payload));

export const wrapFTHandler = <S, R>(
  handler: PayloadHandler<PayloadFromTo<S>, R>,
  state: S
) => <P = S>(updater: UpdaterMaker<P, S>): PayloadHandler<P, R> => payload =>
  handler({ from: state, to: updater(payload)(state) });

export const makeUnducer = <S, PBT extends PayloadByType>(
  stateUpdaters: UndoableStateUpdatersByType<S, PBT>
) => ({
  reducer: ((state, { payload, type, meta }) => {
    const updater = stateUpdaters[type];
    return updater
      ? meta && meta.isUndo
        ? updater.undo(payload)(state)
        : updater.drdo(payload)(state)
      : state; // TODO: when no handler found return state or throw error?
  }) as Unducer<S, PBT>,
  actionCreators: mapObject(stateUpdaters)<UndoableUActionCreatorsByType<PBT>>(
    ([type, _]) => [
      type,
      {
        drdo: makeUActionCreator(type),
        undo: makeUActionCreator(type, true),
      },
    ]
  ),
});

export const makeReducer = <S, PBT extends PayloadByType>(
  stateUpdaters: StateUpdatersByType<S, PBT>
) => ({
  reducer: ((state, { payload, type }) => {
    const updater = stateUpdaters[type];
    return updater ? updater(payload)(state) : state;
  }) as Reducer<S, PBT>,
  actionCreators: mapObject(stateUpdaters)<ActionCreatorsByType<PBT>>(
    ([type, _]) => [type, makeActionCreator(type)]
  ),
});

export const bindActionCreators = <PBT extends PayloadByType>(
  dispatch: DispatchPBT<PBT>,
  actionCreators: ActionCreatorsByType<PBT>
) =>
  mapObject(actionCreators)<HandlersByType<PBT>>(([type, creator]) => [
    type,
    payload => dispatch(creator(payload)),
  ]);

export const bindUndoableActionCreators = <PBT extends PayloadByType>(
  dispatch: UDispatch<PBT>,
  actionCreators: UndoableUActionCreatorsByType<PBT>
) =>
  mapObject(actionCreators)<UndoableHandlersByType<PBT>>(([type, creator]) => [
    type,
    {
      drdo: payload => dispatch(creator.drdo(payload)),
      undo: payload => dispatch(creator.undo(payload)),
    },
  ]);

export const bindSeparateActionCreators = <PBT extends PayloadByType>(
  dispatch: DispatchPBT<PBT>,
  drdoActionCreators: ActionCreatorsByType<PBT>,
  undoActionCreators: UndoMap<PBT>
) =>
  mapObject(drdoActionCreators)<UndoableHandlersByType<PBT>>(
    ([type, creator]) => [
      type,
      {
        drdo: payload => dispatch(creator(payload)),
        undo: payload => dispatch(undoActionCreators[type](payload)),
      },
    ]
  );

export const combineHandlersByType = <PBT extends PayloadByType>(
  drdoHandlers: HandlersByType<PBT>,
  undoHandlers: HandlersByType<PBT>
) =>
  mapObject(drdoHandlers)<UndoableHandlersByType<PBT>>(([type, handler]) => [
    type,
    combineHandlers(handler, undoHandlers[type]),
  ]);

export const bindActionCreatorsWithOptions = <PBT extends PayloadByType>(
  dispatch: Dispatch<URActionUnion<PBT>>,
  actionCreators: ActionCreatorsByType<PBT> | UndoableUActionCreatorsByType<PBT>
) =>
  mapObject(actionCreators as ActionCreatorsByType<PBT>)<
    HandlersWithOptionsByType<PBT>
  >(([type]) => [
    type,
    (payload, clearFutureOnDo) => {
      // TODO: call actionCreator?
      dispatch({
        type,
        payload,
        meta: { isUndoable: true, clearFutureOnDo },
      } as URActionUnion<PBT>);
    },
  ]);
