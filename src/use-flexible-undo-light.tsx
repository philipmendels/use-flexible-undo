import {
  PayloadByType,
  Stack,
  ActionUnion,
  HandlersByType,
  UFUOptions,
  MetaActionReturnTypes,
  UndoableHandlerWithMeta,
  MetaActionHandlers,
  LinkedMetaActions,
  CB_ArgsWithMeta,
  UFULightProps,
} from './index.types';
import {
  useMemo,
  useState,
  useCallback,
  useRef,
  useEffect,
  useLayoutEffect,
} from 'react';
import { useLatest } from './hooks/use-latest';
import { mapObject } from './util-internal';

const defaultOptions: Required<UFUOptions> = {
  callHandlersFrom: 'UPDATER',
  storeActionCreatedDate: true,
};

export const useFlexibleUndoLight = <
  PBT extends PayloadByType,
  MR extends MetaActionReturnTypes = undefined
>({
  handlers,
  callbacks = {},
  options,
}: UFULightProps<PBT, MR>) => {
  type NMR = NonNullable<MR>;

  const { onDo, onRedo, onUndo, onDoRedo, latest } = callbacks;

  const latestCallbacksRef = useLatest(latest);

  const { callHandlersFrom, storeActionCreatedDate } = {
    ...defaultOptions,
    ...options,
  };

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
      const storedAction = handlers[action.type] as UndoableHandlerWithMeta<
        P,
        T,
        NMR
      >;

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
      handlers[action.type].undo(action.payload);
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
      handlers[action.type].redo(action.payload);
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
  }, [callHandlersFrom, handleUndo]);

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
  }, [callHandlersFrom, handleRedo]);

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

  const undoables = useMemo<HandlersByType<PBT>>(
    () =>
      mapObject(handlers, ([type, handler]) => [
        type,
        payload => {
          const action: ActionUnion<PBT> = {
            type,
            payload,
          };
          if (storeActionCreatedDate) {
            action.created = new Date();
          }
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
          handler.redo(payload);
          setStack(prev => ({
            past: [action, ...prev.past],
            future: [],
          }));
        },
      ]),
    [
      handlers,
      latestCallbacksRef,
      onDoRedo,
      onDo,
      getMAH,
      storeActionCreatedDate,
    ]
  );

  return {
    undoables,
    undo,
    redo,
    canUndo,
    canRedo,
    stack,
    timeTravel,
    getMetaActionHandlers,
  };
};
