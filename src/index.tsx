import { useState, useCallback, useRef, useReducer, useMemo } from 'react';
import {
  MetaActionReturnTypes,
  UndoableHandlerWithMeta,
  Action,
  PayloadByType,
  HandlersByType,
  UndoableUActionCreatorsByType,
  LinkedMetaActions,
  StackSetter,
  UndoableStateUpdaterWithMeta,
  MetaActionHandlersByType,
  UDispatch,
  UReducer,
  ActionUnion,
  ValueOf,
  UndoableHandlerWithMetaAndTypeByType,
  StringOnlyKeyOf,
  UndoableHandlersByType,
  Entry,
  MetaActionHandlers,
  UndoableHandlerWithMetaAndType,
  PayloadHandler,
  ExtractKeyByValue,
} from './index.types';

export const useInfiniteUndo = <
  PBT_All extends PayloadByType | undefined = undefined,
  MR extends MetaActionReturnTypes = undefined
>() => {
  type PBT_Inferred = PBT_All extends undefined ? PayloadByType : PBT_All;
  type PBT_Partial = Partial<PBT_Inferred>;
  type P_All = ValueOf<PBT_Inferred>;
  type NMR = NonNullable<MR>;

  const handlersRef = useRef<
    UndoableHandlerWithMetaAndTypeByType<PBT_Inferred, MR>
  >({} as UndoableHandlerWithMetaAndTypeByType<PBT_Inferred, MR>);

  const [past, setPast] = useState<ActionUnion<PBT_Inferred>[]>([]);
  const [future, setFuture] = useState<ActionUnion<PBT_Inferred>[]>([]);

  const undo = useCallback(() => {
    shiftStack(
      past,
      setPast,
      setFuture,
      type => handlersRef.current[type].undo
    );
  }, [past]);

  const redo = useCallback(() => {
    shiftStack(
      future,
      setFuture,
      setPast,
      type => handlersRef.current[type].do
    );
  }, [future]);

  const makeUndoable = useCallback(
    <P extends P_All>(
      handler: UndoableHandlerWithMetaAndType<
        P,
        ExtractKeyByValue<PBT_Inferred, P>,
        MR
      >
    ): PayloadHandler<P> => {
      const { type } = handler;
      console.log('MAKE UNDOABLE', type);
      (handlersRef.current as any)[type] = handler;
      return (payload: P) => {
        handler.do(payload);
        setPast(
          past => [{ type, payload }, ...past] as ActionUnion<PBT_Inferred>[]
        );
        setFuture([]);
      };
    },
    []
  );

  const makeUndoables = useCallback(
    <PBT extends PBT_Partial>(
      handlers: {
        [K in StringOnlyKeyOf<PBT>]: UndoableHandlerWithMeta<PBT[K], K, MR>;
      }
    ): HandlersByType<PBT> =>
      mapObject(handlers, ([type, handler]) => [
        type,
        //TODO: make this work without type casting
        makeUndoable({ type, ...handler } as any),
      ]) as any,
    [makeUndoable]
  );

  const makeUndoablesFromDispatch = useCallback(
    <PBT extends PBT_Partial>(
      dispatch: UDispatch<PBT>,
      actionCreators: UndoableUActionCreatorsByType<PBT>,
      ...metaActionHandlers: MR extends undefined
        ? []
        : [MetaActionHandlersByType<PBT, NMR>]
    ): HandlersByType<PBT> =>
      mapObject(actionCreators, ([type, action]) => [
        type,
        //TODO: make this work without type casting
        makeUndoable({
          type,
          do: (payload: any) => dispatch(action.do(payload)),
          undo: (payload: any) => dispatch(action.undo(payload)),
          ...(metaActionHandlers ? { meta: metaActionHandlers[0]![type] } : {}),
        } as any),
      ]) as any,
    [makeUndoable]
  );

  const getMetaActionHandlers = useCallback(
    <A extends ActionUnion<PBT_Inferred>>(
      action: A
    ): LinkedMetaActions<NMR> => {
      type P = A['payload'];
      type T = A['type'];
      const storedAction = handlersRef.current[
        action.type
      ] as UndoableHandlerWithMetaAndType<P, T, NMR>;

      if (!storedAction.meta) {
        throw new Error(
          `You are getting metaActionHandlers for action '${action.type}', but none are registered.`
        );
      }
      // TODO: why is meta not properly inferred?
      return mapObject(
        storedAction.meta as MetaActionHandlers<P, NMR, T>,
        ([key, value]) => [key, () => value(action.payload, action.type)]
      );
    },
    []
  );

  return {
    makeUndoable,
    makeUndoables,
    makeUndoablesFromDispatch,
    undo,
    redo,
    canUndo: () => Boolean(past.length),
    canRedo: () => Boolean(future.length),
    stack: {
      past: [...past],
      future: [...future].reverse(),
    },
    getMetaActionHandlers,
  };
};

const shiftStack = <A extends Action>(
  from: A[],
  setFrom: StackSetter<A>,
  setTo: StackSetter<A>,
  handler: (type: string) => (payload: any) => void
) => {
  if (from.length) {
    const [item, ...rest] = from;
    handler(item.type)(item.payload);
    setFrom(rest);
    setTo(to => [item, ...to]);
  }
};

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
        : updater.do(payload)(state)
      : state; // TODO: when no handler found return state or throw error?
  }) as UReducer<S, PBT>,
  actionCreators: mapObject(stateUpdaters, ([type, _]) => [
    type,
    {
      do: makeActionCreater(type),
      undo: makeActionCreater(type),
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
      do: payload => dispatch(creator.do(payload)),
      undo: payload => dispatch(creator.undo(payload)),
    },
  ]);

export const useUndoableReducer = <S, PBT extends PayloadByType>(
  reducer: UReducer<S, PBT>,
  initialState: S,
  actionCreators: UndoableUActionCreatorsByType<PBT>
) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  // Is it ok to memoize in a custom hook, i.e. to assume
  // that the user does not mutate actionCreators?
  const boundActionCreators = useMemo(
    () => bindUndoableActionCreators(dispatch, actionCreators),
    [actionCreators]
  );
  return {
    state,
    boundActionCreators,
  };
};

const makeActionCreater = <T extends string>(type: T) => <P extends any>(
  payload: P
) => ({
  type,
  payload,
});

const mapObject = <O extends object, O2 extends object>(
  obj: O,
  mapFn: (e: Entry<O>) => Entry<O2>
) => fromEntries<O2>(toEntries(obj).map(mapFn));

const toEntries = <O extends object>(obj: O) =>
  Object.entries(obj) as Entry<O>[];

const fromEntries = <O extends object>(entries: Entry<O>[]) =>
  Object.fromEntries(entries) as O;
