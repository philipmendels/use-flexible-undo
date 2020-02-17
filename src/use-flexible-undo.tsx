import { useState, useCallback, useRef, useMemo } from 'react';

import {
  ActionUnion,
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
  UndoableHandlerWithMeta,
  UndoableHandlerWithMetaAndType,
  UndoableHandlerWithMetaByType,
  UndoableUActionCreatorsByType,
  ValueOf,
  Stack,
  PBT_ALL_NN,
  UFUProps,
  CB_ArgsWithMeta,
} from './index.types';
import { useLatest } from './hooks/use-latest';
import { mapObject } from './util-internal';

export const useFlexibleUndo = <
  PBT_All extends PayloadByType | undefined = undefined,
  MR extends MetaActionReturnTypes = undefined
>({ callbacks = {} }: UFUProps<PBT_ALL_NN<PBT_All>, MR> = {}) => {
  type PBT_Inferred = PBT_All extends undefined ? PayloadByType : PBT_All;
  type PBT_Partial = Partial<PBT_Inferred>;
  type P_All = ValueOf<PBT_Inferred>;
  type NMR = NonNullable<MR>;

  type Handlers = UndoableHandlerWithMetaByType<PBT_Inferred, MR>;

  const handlersRef = useRef<Handlers>({} as Handlers);

  const { onMakeUndoable, onDo, onRedo, onUndo, onDoRedo, latest } = callbacks;
  const latestCallbacksRef = useLatest(latest);

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
        const onUndoLatest = latestCallbacksRef.current?.onUndo;
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
  }, [canUndo, onUndo, getMAH, latestCallbacksRef]);

  const redo = useCallback(() => {
    if (canRedo) {
      setStack(prev => {
        const lastIndex = prev.future.length - 1;
        const action = prev.future[lastIndex];
        const onRedoLatest = latestCallbacksRef.current?.onRedo;
        const onDoRedoLatest = latestCallbacksRef.current?.onDoRedo;
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
        handlersRef.current[action.type].redo(action.payload);
        return {
          past: [action, ...prev.past],
          future: prev.future.slice(0, lastIndex),
        };
      });
    }
  }, [canRedo, getMAH, onRedo, onDoRedo, latestCallbacksRef]);

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
      latestCallbacksRef.current?.onMakeUndoable?.(anyType);
      return (payload: P) => {
        const action = {
          type: anyType,
          payload: payload as any,
          created: new Date(),
        };
        const onDoLatest = latestCallbacksRef.current?.onDo;
        const onDoRedoLatest = latestCallbacksRef.current?.onDoRedo;
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
        handler.redo(payload);
        setStack(prev => ({
          past: [action, ...prev.past],
          future: [],
        }));
      };
    },
    [getMAH, onMakeUndoable, onDo, onDoRedo, latestCallbacksRef]
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
          redo: payload => dispatch(action.redo(payload)),
          undo: payload => dispatch(action.undo(payload)),
          ...(metaActionHandlers.length
            ? { meta: metaActionHandlers[0]![type] }
            : {}),
        } as UndoableHandlerWithMeta<PBT[typeof type], typeof type, MR>),
      ]),
    [registerHandler]
  );

  // TODO: Think about passing an action by ref / id / global index;
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
