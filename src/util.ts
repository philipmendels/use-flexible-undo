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

export const combineHandlers = <P>(
  redo: PayloadHandler<P, any>,
  undo: PayloadHandler<P, any>
): Undoable<PayloadHandler<P, any>> => ({ redo, undo });

export const combineUpdaters = <P, S>(
  redo: PayloadHandler<P, Updater<S>>,
  undo: PayloadHandler<P, Updater<S>>
): Undoable<PayloadHandler<P, Updater<S>>> => ({ redo, undo });

export const makeUndoableFromToHandler = <S>(
  stateSetter: (newState: S) => any
): Undoable<PayloadHandler<PayloadFromTo<S>>> => ({
  redo: ({ to }) => stateSetter(to),
  undo: ({ from }) => stateSetter(from),
});

export const makeUndoableFromToUpdater = <S_Part, S>(
  stateUpdaterMaker: UpdaterMaker<S_Part, S>
): Undoable<PayloadHandler<PayloadFromTo<S_Part>, Updater<S>>> => ({
  redo: ({ to }) => stateUpdaterMaker(to),
  undo: ({ from }) => stateUpdaterMaker(from),
});

export const makeUndoableHandler = <S>(
  stateSetter: (stateUpdater: Updater<S>) => any
) => <P = S>(
  updaterForRedoMaker: UpdaterMaker<P, S>,
  updaterForUndoMaker: UpdaterMaker<P, S>
): Undoable<PayloadHandler<P>> => ({
  redo: payload => stateSetter(updaterForRedoMaker(payload)),
  undo: payload => stateSetter(updaterForUndoMaker(payload)),
});

export const makeUndoableUpdater = <S_Part, S>(
  stateUpdaterMaker: UpdaterMaker<Updater<S_Part>, S>
) => <P = S_Part>(
  updaterForRedoMaker: UpdaterMaker<P, S_Part>,
  updaterForUndoMaker: UpdaterMaker<P, S_Part>
): Undoable<UpdaterMaker<P, S>> => ({
  redo: payload => stateUpdaterMaker(updaterForRedoMaker(payload)),
  undo: payload => stateUpdaterMaker(updaterForUndoMaker(payload)),
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
