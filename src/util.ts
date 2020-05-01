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
  UActionCreator,
  UpdaterMaker,
} from './index.types';
import { mapObject, makeActionCreator } from './util-internal';

export const makeHandler = <S>(
  stateSetter: (stateUpdater: Updater<S>) => any
) => <P = S>(updaterMaker: UpdaterMaker<P, S>): PayloadHandler<P> => payload =>
  stateSetter(updaterMaker(payload));

export const combineHandlers = <T>(redo: T, undo: T): Undoable<T> => ({
  redo,
  undo,
});

export const makeUndoableFromToHandler = <S, R>(
  stateSetter: (newState: S) => R
): Undoable<PayloadHandler<PayloadFromTo<S>, R>> => ({
  redo: ({ to }) => stateSetter(to),
  undo: ({ from }) => stateSetter(from),
});

export const makeUndoableFromToTupleHandler = <S, R>(
  stateSetter: (newState: S) => R
): Undoable<PayloadHandler<[S, S], R>> => ({
  redo: ([_, to]) => stateSetter(to),
  undo: ([from]) => stateSetter(from),
});

export const makeUndoableHandler = <S, R>(
  stateSetter: (stateUpdater: Updater<S>) => R
) => <P = S>(
  updaterForRedoMaker: UpdaterMaker<P, S>,
  updaterForUndoMaker: UpdaterMaker<P, S>
): Undoable<PayloadHandler<P, R>> => ({
  redo: payload => stateSetter(updaterForRedoMaker(payload)),
  undo: payload => stateSetter(updaterForUndoMaker(payload)),
});

export const makeUndoableDepStateUpdater = <S_Dep, S_Part, S>(
  stateUpdaterMaker: UpdaterMaker<UpdaterMaker<S_Dep, S_Part>, S>
) => (
  updaterForRedoMaker: UpdaterMaker<S_Dep, S_Part>,
  updaterForUndoMaker: UpdaterMaker<S_Dep, S_Part>
): Undoable<() => Updater<S>> => ({
  redo: () => stateUpdaterMaker(updaterForRedoMaker),
  undo: () => stateUpdaterMaker(updaterForUndoMaker),
});

export const invertUndoable = <T>({
  redo,
  undo,
}: Undoable<T>): Undoable<T> => ({
  redo: undo,
  undo: redo,
});

export const wrapFromToHandler = <S>(
  handler: PayloadHandler<PayloadFromTo<S>, any>,
  state: S
) => <P = S>(updater: UpdaterMaker<P, S>): PayloadHandler<P> => payload =>
  handler({ from: state, to: updater(payload)(state) });

export const wrapFromToTupleHandler = <S>(
  handler: PayloadHandler<[S, S]>,
  state: S
) => <P = S>(updater: UpdaterMaker<P, S>): PayloadHandler<P> => payload =>
  handler([state, updater(payload)(state)]);

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
        : updater.redo(payload)(state)
      : state; // TODO: when no handler found return state or throw error?
  }) as UReducer<S, PBT>,
  actionCreators: mapObject(stateUpdaters, ([type, _]) => [
    type,
    {
      redo: makeActionCreator(type) as UActionCreator<PBT, typeof type>,
      undo: makeActionCreator(type, true) as UActionCreator<PBT, typeof type>,
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
      redo: payload => dispatch(creator.redo(payload)),
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
      redo: payload => dispatch(action.redo(payload)),
      undo: payload => dispatch(action.undo(payload)),
      ...(metaActionHandlers.length
        ? { meta: metaActionHandlers[0]![type] }
        : {}),
    } as UndoableHandlerWithMeta<PBT[typeof type], typeof type, MR>,
  ]);
