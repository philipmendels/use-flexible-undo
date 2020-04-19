import {
  PayloadFromTo,
  Updater,
  CurriedUpdater,
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
} from './index.types';
import { mapObject, makeActionCreator } from './util-internal';

export const makeHandler = <T extends any>(
  setter: (updater: Updater<T>) => any
) => (createUpdater: CurriedUpdater<T>): PayloadHandler<T> => val => {
  setter(createUpdater(val));
};

export const makeUndoableHandler = <T>(
  redo: (payload: T) => any,
  undo: (payload: T) => any
) => ({ redo, undo });

export const makeUndoableDeltaHandler = <T extends any>(
  setter: (updater: Updater<T>) => any
) => (
  createRedoUpdater: CurriedUpdater<T>,
  createUndoUpdater: CurriedUpdater<T>
): Undoable<PayloadHandler<T>> => ({
  redo: val => {
    setter(createRedoUpdater(val));
  },
  undo: val => {
    setter(createUndoUpdater(val));
  },
});

export const makeUndoableStateUpdater = <T, S>(
  redo: (payload: T) => Updater<S>,
  undo: (payload: T) => Updater<S>
) => ({ redo, undo });

// handler normally should return void, but let's use any to keep it flexible
export const makeUndoableFromToHandler = <T>(handler: (payload: T) => any) => ({
  redo: ({ to }: PayloadFromTo<T>) => handler(to),
  undo: ({ from }: PayloadFromTo<T>) => handler(from),
});

export const makeUndoableFromToStateUpdater = <T, S>(
  handler: (payload: T) => Updater<S>
) => ({
  redo: ({ to }: PayloadFromTo<T>) => handler(to),
  undo: ({ from }: PayloadFromTo<T>) => handler(from),
});

export const invertUndoable = <T>(undoable: Undoable<T>): Undoable<T> => ({
  redo: undoable.undo,
  undo: undoable.redo,
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
