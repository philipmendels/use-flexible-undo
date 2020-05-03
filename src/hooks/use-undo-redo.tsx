import {
  useState,
  useMemo,
  useRef,
  useCallback,
  useEffect,
  useLayoutEffect,
} from 'react';

import {
  Stack,
  ActionUnion,
  UndoableHandlerWithMeta,
  MetaActionHandlers,
  LinkedMetaActions,
  CB_ArgsWithMeta,
  PayloadByType,
  MetaActionReturnTypes,
  HandlersByType,
  UseUndoRedoProps,
  StringOnlyKeyOf,
  Action,
} from '../index.types';

import { useLatest } from './use-latest';

import { mapObject } from '../util-internal';
import { defaultOptions } from '../constants';

export const useUndoRedo = <
  PBT extends PayloadByType,
  MR extends MetaActionReturnTypes = undefined
>({
  handlers,
  callbacks = {},
  options,
}: UseUndoRedoProps<PBT, MR>) => {
  type NMR = NonNullable<MR>;

  const { onDo, onRedo, onUndo, onDoRedo, latest } = callbacks;

  const { callHandlersFrom, storeActionCreatedDate } = {
    ...defaultOptions,
    ...options,
  };

  const latestCallbacksRef = useLatest(latest);

  const [stack, setStack] = useState<Stack<ActionUnion<PBT>>>({
    past: [],
    future: [],
  });

  const canUndo = useMemo(() => Boolean(stack.past.length), [
    stack.past.length,
  ]);
  const canRedo = useMemo(() => Boolean(stack.future.length), [
    stack.future.length,
  ]);

  const undoActionsRef = useRef<ActionUnion<PBT>[]>([]);
  const redoActionsRef = useRef<ActionUnion<PBT>[]>([]);

  // For internal use
  const getMAH = useCallback(
    <A extends ActionUnion<PBT>>(action: A) => {
      type P = A['payload'];
      type T = A['type'];
      const storedAction = handlers.current[
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
    [handlers]
  );

  const getMetaActionHandlers = useCallback(
    <A extends ActionUnion<PBT>>(action: A): LinkedMetaActions<NMR> => {
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

  const handleUndo = useCallback(
    (action: ActionUnion<PBT>) => {
      const onUndoLatest = latestCallbacksRef.current?.onUndo;
      if (onUndo || onUndoLatest) {
        const meta = getMAH(action);
        const event = {
          action,
          eventName: 'undo',
          ...(meta ? { meta } : {}),
        } as CB_ArgsWithMeta<PBT, MR, 'undo'>;
        onUndo?.(event);
        onUndoLatest?.(event);
      }
      handlers.current[action.type].undo(action.payload);
    },
    [latestCallbacksRef, onUndo, getMAH, handlers]
  );

  const handleRedo = useCallback(
    (action: ActionUnion<PBT>) => {
      const onRedoLatest = latestCallbacksRef.current?.onRedo;
      const onDoRedoLatest = latestCallbacksRef.current?.onDoRedo;
      if (onRedo || onDoRedo || onRedoLatest || onDoRedoLatest) {
        const meta = getMAH(action);
        const event = {
          action,
          eventName: 'redo',
          ...(meta ? { meta } : {}),
        } as CB_ArgsWithMeta<PBT, MR, 'redo'>;
        onRedo?.(event);
        onDoRedo?.(event);
        onRedoLatest?.(event);
        onDoRedoLatest?.(event);
      }
      handlers.current[action.type].drdo(action.payload);
    },
    [latestCallbacksRef, onRedo, onDoRedo, getMAH, handlers]
  );

  const undo = useCallback(() => {
    let updaterCalledAmount = 0;
    setStack(prev => {
      if (prev.past.length) {
        const [action, ...rest] = prev.past;
        updaterCalledAmount++;
        if (updaterCalledAmount === 1) {
          callHandlersFrom === 'UPDATER'
            ? handleUndo(action)
            : undoActionsRef.current.push(action);
        }
        return {
          past: rest,
          future: [...prev.future, action],
        };
      }
      return prev;
    });
  }, [handleUndo, callHandlersFrom]);

  const redo = useCallback(() => {
    let updaterCalledAmount = 0;
    setStack(prev => {
      if (prev.future.length) {
        const lastIndex = prev.future.length - 1;
        const action = prev.future[lastIndex];
        updaterCalledAmount++;
        if (updaterCalledAmount === 1) {
          callHandlersFrom === 'UPDATER'
            ? handleRedo(action)
            : redoActionsRef.current.push(action);
        }
        return {
          past: [action, ...prev.past],
          future: prev.future.slice(0, lastIndex),
        };
      }
      return prev;
    });
  }, [handleRedo, callHandlersFrom]);

  const handleUndoRedoFromEffect = useCallback(() => {
    while (redoActionsRef.current.length) {
      const action = redoActionsRef.current.shift()!;
      handleRedo(action);
    }
    while (undoActionsRef.current.length) {
      const action = undoActionsRef.current.shift()!;
      handleUndo(action);
    }
  }, [handleRedo, handleUndo]);

  useEffect(() => {
    if (callHandlersFrom === 'EFFECT') {
      handleUndoRedoFromEffect();
    }
  });

  useLayoutEffect(() => {
    if (callHandlersFrom === 'LAYOUT_EFFECT') {
      handleUndoRedoFromEffect();
    }
  });

  const timeTravel = useCallback(
    (range: 'past' | 'future' | 'full', index: number) => {
      const lastFutureIndex = stack.future.length - 1;
      if (range === 'full') {
        if (index > lastFutureIndex) {
          range = 'past';
          index = index - stack.future.length;
        } else {
          range = 'future';
        }
      }
      if (range === 'past') {
        for (let i = 0; i < index; i++) {
          undo();
        }
      } else if (range === 'future') {
        for (let i = lastFutureIndex; i >= index; i--) {
          redo();
        }
      }
    },
    [undo, redo, stack.future.length]
  );

  const createUndoables = useCallback(
    <PBT2 extends Partial<PBT>>(
      handlers: {
        [K in StringOnlyKeyOf<PBT2>]: UndoableHandlerWithMeta<PBT2[K], K, MR>;
      }
    ): HandlersByType<PBT2> =>
      mapObject(handlers, ([type, handler]) => [
        type,
        payload => {
          const action = ({
            type,
            payload,
            ...(storeActionCreatedDate ? { created: new Date() } : {}),
          } as Action) as ActionUnion<PBT>;
          const onDoLatest = latestCallbacksRef.current?.onDo;
          const onDoRedoLatest = latestCallbacksRef.current?.onDoRedo;
          if (onDo || onDoRedo || onDoLatest || onDoRedoLatest) {
            const meta = getMAH(action);
            const event = {
              action,
              eventName: 'do',
              ...(meta ? { meta } : {}),
            } as CB_ArgsWithMeta<PBT, MR, 'do'>;
            onDo?.(event);
            onDoRedo?.(event);
            onDoLatest?.(event);
            onDoRedoLatest?.(event);
          }
          handler.drdo(payload);
          setStack(prev => ({
            past: [action, ...prev.past],
            future: [],
          }));
        },
      ]),
    [
      latestCallbacksRef,
      onDoRedo,
      onDo,
      getMAH,
      storeActionCreatedDate,
      setStack,
    ]
  );

  return {
    undo,
    redo,
    canUndo,
    canRedo,
    stack,
    timeTravel,
    getMetaActionHandlers,
    createUndoables,
  };
};
