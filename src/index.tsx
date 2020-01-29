import {
  useState,
  useCallback,
  useRef,
  useReducer,
  useMemo,
  useEffect,
} from 'react';

import {
  ActionUnion,
  Entry,
  ExtractKeyByValue,
  HandlersByType,
  LinkedMetaActions,
  MetaActionHandlers,
  MetaActionHandlersByType,
  MetaActionReturnTypes,
  PayloadByType,
  PayloadHandler,
  StringOnlyKeyOf,
  UDispatch,
  UndoableHandlersByType,
  UndoableHandlerWithMeta,
  UndoableHandlerWithMetaAndType,
  UndoableHandlerWithMetaByType,
  UndoableUActionCreatorsByType,
  UndoableStateUpdaterWithMeta,
  UReducer,
  ValueOf,
  Stack,
} from './index.types';

type PBT_ALL_NN<
  PBT_All extends PayloadByType | undefined
> = PBT_All extends undefined ? PayloadByType : PBT_All;

type EventName = 'do' | 'undo' | 'redo';

interface CB_Args<PBT_Inferred extends PayloadByType, E extends EventName> {
  action: ActionUnion<PBT_Inferred>;
  eventName: E;
}

type CB_ArgsWithMeta<
  PBT_Inferred extends PayloadByType,
  MR extends MetaActionReturnTypes,
  E extends EventName
> = MR extends undefined
  ? CB_Args<PBT_Inferred, E>
  : CB_Args<PBT_Inferred, E> & { meta: LinkedMetaActions<NonNullable<MR>> };

export type CB<
  PBT_Inferred extends PayloadByType = PayloadByType,
  MR extends MetaActionReturnTypes = undefined,
  E extends EventName = EventName
> = (args: CB_ArgsWithMeta<PBT_Inferred, MR, E>) => any;

interface Callbacks<
  PBT_Inferred extends PayloadByType,
  MR extends MetaActionReturnTypes
> {
  onMakeUndoable?: (type: StringOnlyKeyOf<PBT_Inferred>) => any;
  onDo?: CB<PBT_Inferred, MR, 'do'>;
  onRedo?: CB<PBT_Inferred, MR, 'redo'>;
  onUndo?: CB<PBT_Inferred, MR, 'undo'>;
  onDoRedo?: CB<PBT_Inferred, MR, 'do' | 'redo'>;
}

type Options<
  PBT_Inferred extends PayloadByType,
  MR extends MetaActionReturnTypes
> = Callbacks<PBT_Inferred, MR> & {
  escapeClosure?: Callbacks<PBT_Inferred, MR>;
};

const useLatest = <T extends any>(value?: T) => {
  const valueRef = useRef<T | undefined>(value);
  useEffect(() => {
    valueRef.current = value;
  }, [value]);
  return valueRef;
};

export const useFlexibleUndo = <
  PBT_All extends PayloadByType | undefined = undefined,
  MR extends MetaActionReturnTypes = undefined
>(
  options: Options<PBT_ALL_NN<PBT_All>, MR> = {}
) => {
  const {
    onMakeUndoable,
    onDo,
    onRedo,
    onUndo,
    onDoRedo,
    escapeClosure,
  } = options;
  type PBT_Inferred = PBT_All extends undefined ? PayloadByType : PBT_All;
  type PBT_Partial = Partial<PBT_Inferred>;
  type P_All = ValueOf<PBT_Inferred>;
  type NMR = NonNullable<MR>;

  type Handlers = UndoableHandlerWithMetaByType<PBT_Inferred, MR>;

  const handlersRef = useRef<Handlers>({} as Handlers);

  //TODO: Think about tradeoffs of using a single list with present-index,
  //versus past + future lists
  const [stack, setStack] = useState<Stack<ActionUnion<PBT_Inferred>>>({
    past: [],
    future: [],
  });

  const canUndo = useMemo(() => Boolean(stack.past.length), [
    stack.past.length,
  ]);
  const canRedo = useMemo(() => Boolean(stack.future.length), [
    stack.future.length,
  ]);

  const callbacksRef = useLatest(escapeClosure);

  // For internal use
  const getMAH = useCallback(
    <A extends ActionUnion<PBT_Inferred>>(action: A) => {
      type P = A['payload'];
      type T = A['type'];
      const storedAction = handlersRef.current[
        action.type
      ] as UndoableHandlerWithMeta<P, T, NMR>;

      if (!storedAction.meta) {
        return undefined;
      }
      return mapObject(
        storedAction.meta as MetaActionHandlers<P, NMR, T>,
        ([key, value]) => [key, () => value(action.payload, action.type)]
      ) as LinkedMetaActions<NMR>;
    },
    []
  );

  const getMetaActionHandlers = useCallback(
    <A extends ActionUnion<PBT_Inferred>>(
      action: A
    ): LinkedMetaActions<NMR> => {
      const meta = getMAH(action);
      if (!meta) {
        throw new Error(
          `You are getting metaActionHandlers for action '${action.type}', but none are registered.`
        );
      }
      return meta;
    },
    [getMAH]
  );

  const undo = useCallback(() => {
    if (canUndo) {
      setStack(prev => {
        const [action, ...rest] = prev.past;
        const onUndoLatest = callbacksRef.current?.onUndo;
        if (onUndo || onUndoLatest) {
          const meta = getMAH(action);
          const event = {
            action,
            eventName: 'undo',
            ...(meta ? { meta } : {}),
          } as CB_ArgsWithMeta<PBT_Inferred, MR, 'undo'>;
          onUndo?.(event);
          onUndoLatest?.(event);
        }
        handlersRef.current[action.type].undo(action.payload);
        return {
          past: rest,
          future: [...prev.future, action],
        };
      });
    }
  }, [canUndo, onUndo, getMAH, callbacksRef]);

  const redo = useCallback(() => {
    if (canRedo) {
      setStack(prev => {
        const lastIndex = prev.future.length - 1;
        const action = prev.future[lastIndex];
        const onRedoLatest = callbacksRef.current?.onRedo;
        const onDoRedoLatest = callbacksRef.current?.onDoRedo;
        if (onRedo || onDoRedo || onRedoLatest || onDoRedoLatest) {
          const meta = getMAH(action);
          const event = {
            action,
            eventName: 'redo',
            ...(meta ? { meta } : {}),
          } as CB_ArgsWithMeta<PBT_Inferred, MR, 'redo'>;
          onRedo?.(event);
          onDoRedo?.(event);
          onRedoLatest?.(event);
          onDoRedoLatest?.(event);
        }
        handlersRef.current[action.type].do(action.payload);
        return {
          past: [action, ...prev.past],
          future: prev.future.slice(0, lastIndex),
        };
      });
    }
  }, [canRedo, getMAH, onRedo, onDoRedo, callbacksRef]);

  // For internal use only. Loosely typed so that TS does not
  // complain when calling it from the makeUndoableX functions.
  const registerHandler = useCallback(
    <
      T extends string,
      P extends any,
      H extends UndoableHandlerWithMeta<P, T, MR>
    >(
      type: T,
      handler: H
    ): PayloadHandler<P> => {
      (handlersRef.current as Record<string, any>)[type] = handler;
      const anyType = type as any;
      onMakeUndoable?.(anyType);
      callbacksRef.current?.onMakeUndoable?.(anyType);
      return (payload: P) => {
        const action = {
          type: anyType,
          payload: payload as any,
          created: new Date(),
        };
        const onDoLatest = callbacksRef.current?.onDo;
        const onDoRedoLatest = callbacksRef.current?.onDoRedo;
        if (onDo || onDoRedo || onDoLatest || onDoRedoLatest) {
          const meta = getMAH(action);
          const event = {
            action,
            eventName: 'do',
            ...(meta ? { meta } : {}),
          } as CB_ArgsWithMeta<PBT_Inferred, MR, 'do'>;
          onDo?.(event);
          onDoRedo?.(event);
          onDoLatest?.(event);
          onDoRedoLatest?.(event);
        }
        handler.do(payload);
        setStack(prev => ({
          past: [action, ...prev.past],
          future: [],
        }));
      };
    },
    [getMAH, onMakeUndoable, onDo, onDoRedo, callbacksRef]
  );

  const makeUndoable = useCallback(
    <P extends P_All>(
      handler: UndoableHandlerWithMetaAndType<
        P,
        ExtractKeyByValue<PBT_Inferred, P>,
        MR
      >
    ): PayloadHandler<P> => {
      const { type, ...rest } = handler as UndoableHandlerWithMetaAndType<
        P,
        ExtractKeyByValue<PBT_Inferred, P>,
        {}
      >;
      return registerHandler(
        type,
        rest as UndoableHandlerWithMeta<P, typeof type, MR>
      );
    },
    [registerHandler]
  );

  const makeUndoables = useCallback(
    <PBT extends PBT_Partial>(
      handlers: {
        [K in StringOnlyKeyOf<PBT>]: UndoableHandlerWithMeta<PBT[K], K, MR>;
      }
    ): HandlersByType<PBT> =>
      mapObject(handlers, ([type, handler]) => [
        type,
        registerHandler(type, handler),
      ]),
    [registerHandler]
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
        registerHandler(type, {
          do: payload => dispatch(action.do(payload)),
          undo: payload => dispatch(action.undo(payload)),
          ...(metaActionHandlers.length
            ? { meta: metaActionHandlers[0]![type] }
            : {}),
        } as UndoableHandlerWithMeta<PBT[typeof type], typeof type, MR>),
      ]),
    [registerHandler]
  );

  //TODO: Think about passing an action by ref / id / global index;
  const timeTravel = useCallback(
    (direction: 'past' | 'future', index: number) => {
      if (direction === 'past') {
        for (let i = 0; i <= index; i++) {
          undo();
        }
      } else if (direction === 'future') {
        const lastIndex = stack.future.length - 1;
        for (let i = lastIndex; i >= index; i--) {
          redo();
        }
      }
    },
    [undo, redo, stack.future.length]
  );

  return {
    makeUndoable,
    makeUndoables,
    makeUndoablesFromDispatch,
    undo,
    redo,
    canUndo,
    canRedo,
    stack,
    getMetaActionHandlers,
    timeTravel,
  };
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
      undo: makeActionCreater(type, true),
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

const makeActionCreater = <T extends string>(type: T, isUndo?: boolean) => <
  P extends any
>(
  payload: P
) => ({
  type,
  payload,
  ...(isUndo ? { meta: { isUndo } } : {}),
});

const mapObject = <O extends object, O2 extends object>(
  obj: O,
  mapFn: (e: Entry<O>) => Entry<O2>
) => fromEntries<O2>(toEntries(obj).map(mapFn));

const toEntries = <O extends object>(obj: O) =>
  Object.entries(obj) as Entry<O>[];

const fromEntries = <O extends object>(entries: Entry<O>[]) =>
  Object.fromEntries(entries) as O;
