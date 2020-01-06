import { useState, useCallback, useRef, useReducer, useMemo } from 'react';
import {
  MetaActionReturnTypes,
  UndoableHandlerWithMeta,
  Action,
  PayloadByType,
  HandlersByType,
  UndoableUActionCreatorsByType,
  MetaActionHandler,
  LinkedMetaActions,
  StackSetter,
  UndoableStateUpdaterWithMeta,
  MetaActionHandlersByType,
  UndoableHandlerWithMetaAndType,
  UDispatch,
  UReducer,
  ActionUnion,
  ValueOf,
  UndoableHandlerWithMetaAndTypeByType,
  PickByValue,
  StringOnlyKeyOf,
  UndoableHandlersByType,
  Entry,
} from './index.types';

export const useInfiniteUndo = <
  PBT_All extends PayloadByType | undefined = undefined,
  MR extends MetaActionReturnTypes = undefined
>() => {
  type PBT_Inferred = PBT_All extends undefined ? PayloadByType : PBT_All;
  type PBT_Partial = Partial<PBT_Inferred>;
  type P_All = ValueOf<PBT_Inferred>;

  const actionsRef = useRef<
    UndoableHandlerWithMetaAndTypeByType<PBT_Inferred, MR>
  >({} as any);

  const [past, setPast] = useState<ActionUnion<PBT_Inferred>[]>([]);
  const [future, setFuture] = useState<ActionUnion<PBT_Inferred>[]>([]);

  const undo = useCallback(() => {
    shiftStack(past, setPast, setFuture, type => actionsRef.current[type].undo);
  }, [past]);

  const redo = useCallback(() => {
    shiftStack(future, setFuture, setPast, type => actionsRef.current[type].do);
  }, [future]);

  const makeUndoable = useCallback(
    <P extends P_All>(
      handler: PBT_All extends undefined
        ? UndoableHandlerWithMetaAndType<PayloadByType<string, P>, MR>
        : UndoableHandlerWithMetaAndType<PickByValue<PBT_Inferred, P>, MR>
    ) => {
      const { type } = handler;
      console.log('MAKE UNDOABLE', type);
      (actionsRef.current as any)[type] = handler;
      return (payload: P) => {
        handler.do(payload as any);
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
        [K in StringOnlyKeyOf<PBT>]: UndoableHandlerWithMeta<PBT[K], MR>;
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
        : [MetaActionHandlersByType<PBT, MR>]
    ): HandlersByType<PBT> =>
      Object.fromEntries(
        Object.entries(actionCreators).map(([type, action]) => [
          type,
          //TODO: make this work without type casting
          makeUndoable({
            type,
            do: (payload: any) => dispatch((action as any).do(payload)),
            undo: (payload: any) => dispatch((action as any).undo(payload)),
            ...(metaActionHandlers
              ? { meta: (metaActionHandlers[0] as any)[type] }
              : {}),
          } as any),
        ])
      ) as any,
    [makeUndoable]
  );

  //No need to infer the Payload here
  const getMetaActionHandlers = useCallback((action: Action) => {
    //Use an empty object as MR to let TypeScript infer action.custom
    const storedAction = actionsRef.current[
      action.type
    ] as UndoableHandlerWithMeta<any, {}>;
    if (!storedAction.meta) {
      throw new Error(
        `You are getting metaActionHandlers for action '${action.type}', but none are registered.`
      );
    }
    return Object.fromEntries(
      Object.entries(storedAction.meta).map(([key, value]) => [
        key,
        () => (value as MetaActionHandler)(action.payload, action.type),
      ])
    ) as LinkedMetaActions<MR>;
  }, []);

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
    [K in StringOnlyKeyOf<PBT>]: UndoableStateUpdaterWithMeta<PBT[K], S, MR>;
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
      (updater as UndoableStateUpdaterWithMeta<any, any, {}>).meta,
    ]),
  } as MR extends undefined
    ? {}
    : {
        metaActionHandlers: MetaActionHandlersByType<PBT, MR>;
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
