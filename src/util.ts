import {
  PayloadFromTo,
  Updater,
  PayloadHandler,
  Undoable,
  PayloadByType,
  MetaActionReturnTypes,
  StringOnlyKeyOf,
  UndoableStateUpdaterWithMeta,
  UReducer,
  UndoableUActionCreatorsByType,
  MetaActionHandlersByType,
  UDispatch,
  UndoableHandlersByType,
  UndoableHandlerWithMeta,
  UpdaterMaker,
} from './index.types';
import { mapObject, makeActionCreator } from './util-internal';

export const merge = <S, P extends Partial<S>>(
  partial: P
): Updater<S> => state => ({
  ...state,
  ...partial,
});

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

export const makeUndoableFTObjHandler = <S, R>(
  stateSetter: (newState: S) => R
) =>
  combineHandlers<PayloadFromTo<S>, R>(
    ({ to }) => stateSetter(to),
    ({ from }) => stateSetter(from)
  );

export const makeUndoableFTTupleHandler = <S, R>(
  stateSetter: (newState: S) => R
) =>
  combineHandlers<[S, S], R>(
    ([_, to]) => stateSetter(to),
    ([from]) => stateSetter(from)
  );

export const makeUndoableStateDepHandler = <S1, S2, P, R>(
  stateUpdaterMaker: (um: UpdaterMaker<S1, S2>) => (payload: P) => R
) => (
  updaterForDrdoMaker: UpdaterMaker<S1, S2>,
  updaterForUndoMaker: UpdaterMaker<S1, S2>
) =>
  combineHandlers<P, R>(
    stateUpdaterMaker(updaterForDrdoMaker),
    stateUpdaterMaker(updaterForUndoMaker)
  );

export const convertHandler = <P, R>(handler: PayloadHandler<P, R>) => <P2 = P>(
  convertor: (p2: P2) => P
) => (payload: P2) => handler(convertor(payload));

export const wrapFTObjHandler = <S, R>(
  handler: PayloadHandler<PayloadFromTo<S>, R>,
  state: S
) => <P = S>(updater: UpdaterMaker<P, S>): PayloadHandler<P, R> => payload =>
  handler({ from: state, to: updater(payload)(state) });

export const wrapFTTupleHandler = <S, R>(
  handler: PayloadHandler<[S, S], R>,
  state: S
) => <P = S>(updater: UpdaterMaker<P, S>): PayloadHandler<P, R> => payload =>
  handler([state, updater(payload)(state)]);

export const combineUHandlerWithMeta = <P, R, MR extends MetaActionReturnTypes>(
  undoableHandlers: Undoable<PayloadHandler<P, R>>,
  meta: MR
) => ({
  ...undoableHandlers,
  meta,
});

export const makeUndoableReducer = <
  S,
  PBT extends PayloadByType,
  MR extends MetaActionReturnTypes = undefined
>(
  stateUpdaters: {
    [K in StringOnlyKeyOf<PBT>]: UndoableStateUpdaterWithMeta<PBT[K], S, MR, K>;
  }
) => ({
  reducer: ((state, { payload, type, meta }) => {
    const updater = stateUpdaters[type];
    return updater
      ? meta && meta.isUndo
        ? updater.undo(payload)(state)
        : updater.drdo(payload)(state)
      : state; // TODO: when no handler found return state or throw error?
  }) as UReducer<S, PBT>,
  actionCreators: mapObject(stateUpdaters, ([type, _]) => [
    type,
    {
      drdo: makeActionCreator(type),
      undo: makeActionCreator(type, true),
    },
  ]) as UndoableUActionCreatorsByType<PBT>,
  ...({
    metaActionHandlers: mapObject(stateUpdaters, ([type, updater]) => [
      type,
      (updater as UndoableStateUpdaterWithMeta<any, any, {}, string>).meta,
    ]),
  } as MR extends undefined
    ? {}
    : {
        metaActionHandlers: MetaActionHandlersByType<PBT, NonNullable<MR>>;
      }),
});

export const bindUndoableActionCreators = <PBT extends PayloadByType>(
  dispatch: UDispatch<PBT>,
  actionCreators: UndoableUActionCreatorsByType<PBT>
): UndoableHandlersByType<PBT> =>
  mapObject(actionCreators, ([type, creator]) => [
    type,
    {
      drdo: payload => dispatch(creator.drdo(payload)),
      undo: payload => dispatch(creator.undo(payload)),
    },
  ]);

export const makeUndoableHandlersFromDispatch = <
  PBT extends PayloadByType,
  MR extends MetaActionReturnTypes
>(
  dispatch: UDispatch<PBT>,
  actionCreators: UndoableUActionCreatorsByType<PBT>,
  ...metaActionHandlers: MR extends undefined
    ? []
    : [MetaActionHandlersByType<PBT, NonNullable<MR>>]
): { [K in StringOnlyKeyOf<PBT>]: UndoableHandlerWithMeta<PBT[K], K, MR> } =>
  mapObject(actionCreators, ([type, action]) => [
    type,
    {
      drdo: payload => dispatch(action.drdo(payload)),
      undo: payload => dispatch(action.undo(payload)),
      ...(metaActionHandlers.length
        ? { meta: metaActionHandlers[0]![type] }
        : {}),
    } as UndoableHandlerWithMeta<PBT[typeof type], typeof type, MR>,
  ]);
