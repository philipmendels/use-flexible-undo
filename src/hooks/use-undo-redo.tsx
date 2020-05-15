import {
  useState,
  useMemo,
  useRef,
  useCallback,
  useEffect,
  useLayoutEffect,
} from 'react';

import { v4 } from 'uuid';

import {
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
  History,
} from '../index.types';

import { useLatest } from './use-latest';

import { mapObject } from '../util-internal';
import { defaultOptions } from '../constants';

const createInitialHistory = <PBT extends PayloadByType>(): History<PBT> => {
  const id = v4();
  return {
    currentBranchId: id,
    currentIndex: -1,
    branches: {
      [id]: { id, created: new Date(), stack: [] },
    },
    mainBranchId: id,
  };
};

export const useUndoRedo = <
  PBT extends PayloadByType,
  MR extends MetaActionReturnTypes = undefined
>({
  handlers,
  callbacks = {},
  options,
  initialHistory = createInitialHistory(),
}: UseUndoRedoProps<PBT, MR>) => {
  type NMR = NonNullable<MR>;

  const { onDo, onRedo, onUndo, onDoRedo, latest } = callbacks;

  const { storeActionCreatedDate, unstable_callHandlersFrom } = {
    ...defaultOptions,
    ...options,
  };

  const latestCallbacksRef = useLatest(latest);

  const [history, setHistory] = useState(initialHistory);

  useEffect(() => console.log(history), [history]);

  const stack = useMemo(() => {
    let stack: ActionUnion<PBT>[] = [];
    const { currentBranchId, mainBranchId, branches, currentIndex } = history;
    let branch = branches[mainBranchId];
    while (true) {
      if (branch.nextChild) {
        stack = stack.concat(
          branch.stack.slice(0, branch.nextChild.actionIndex + 1)
        );
        branch = branches[branch.nextChild.branchId];
      } else {
        stack = stack.concat(branch.stack);
        break;
      }
    }

    let globalIndex = currentIndex;
    branch = branches[currentBranchId];
    while (true) {
      if (branch.parent) {
        globalIndex += branch.parent.actionIndex + 1;
        branch = branches[branch.parent.branchId];
      } else {
        break;
      }
    }
    return {
      past: stack.slice(0, globalIndex + 1).reverse(),
      future: stack.slice(globalIndex + 1, stack.length).reverse(),
    };
  }, [history]);

  const canUndo = useMemo(() => Boolean(stack.past.length), [
    stack.past.length,
  ]);
  const canRedo = useMemo(() => Boolean(stack.future.length), [
    stack.future.length,
  ]);

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

  // For unstable_callHandlersFrom === 'EFFECT' | 'LAYOUT_EFFECT'
  const batchedUpdatesRef = useRef<
    { type: 'undo' | 'redo'; action: ActionUnion<PBT> }[]
  >([]);

  const undo = useCallback(() => {
    let hasSideEffectRun = false;
    setHistory(prev => {
      const index = prev.currentIndex;
      const branch = prev.branches[prev.currentBranchId];
      const parent = branch.parent;
      if (index < 0) {
        return prev;
      } else {
        if (!hasSideEffectRun) {
          hasSideEffectRun = true;
          const action = branch.stack[index];
          unstable_callHandlersFrom === 'UPDATER'
            ? handleUndo(action)
            : batchedUpdatesRef.current.push({ type: 'undo', action });
        }
        if (index === 0 && parent) {
          return {
            ...prev,
            currentIndex: parent.actionIndex,
            currentBranchId: parent.branchId,
          };
        } else {
          return {
            ...prev,
            currentIndex: index - 1,
          };
        }
      }
    });
  }, [handleUndo, unstable_callHandlersFrom]);

  const redo = useCallback(() => {
    let hasSideEffectRun = false;
    setHistory(prev => {
      const index = prev.currentIndex;
      const branch = prev.branches[prev.currentBranchId];
      if (index < branch.stack.length - 1) {
        if (branch.nextChild?.actionIndex === index) {
          if (!hasSideEffectRun) {
            hasSideEffectRun = true;
            const action = prev.branches[branch.nextChild.branchId].stack[0];
            unstable_callHandlersFrom === 'UPDATER'
              ? handleRedo(action)
              : batchedUpdatesRef.current.push({ type: 'redo', action });
          }
          return {
            ...prev,
            currentBranchId: branch.nextChild.branchId,
            currentIndex: 0,
          };
        } else {
          if (!hasSideEffectRun) {
            hasSideEffectRun = true;
            const action = branch.stack[index + 1];
            unstable_callHandlersFrom === 'UPDATER'
              ? handleRedo(action)
              : batchedUpdatesRef.current.push({ type: 'redo', action });
          }
          return {
            ...prev,
            currentIndex: index + 1,
          };
        }
      } else {
        return prev;
      }
    });
  }, [handleRedo, unstable_callHandlersFrom]);

  const handleUndoRedoFromEffect = useCallback(() => {
    while (batchedUpdatesRef.current.length) {
      const { action, type } = batchedUpdatesRef.current.shift()!;
      type === 'undo' ? handleUndo(action) : handleRedo(action);
    }
  }, [handleRedo, handleUndo]);

  useEffect(() => {
    if (unstable_callHandlersFrom === 'EFFECT') {
      handleUndoRedoFromEffect();
    }
  });

  useLayoutEffect(() => {
    if (unstable_callHandlersFrom === 'LAYOUT_EFFECT') {
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
          setHistory(prev => {
            const branch = prev.branches[prev.currentBranchId];
            const stack = branch.stack;
            const index = prev.currentIndex;
            if (index === stack.length - 1) {
              return {
                ...prev,
                currentIndex: index + 1,
                branches: {
                  ...prev.branches,
                  [branch.id]: {
                    ...branch,
                    stack: stack.concat(action),
                  },
                },
              };
            } else {
              const newBranchId = v4();
              return {
                ...prev,
                currentIndex: 0,
                currentBranchId: newBranchId,
                branches: {
                  ...prev.branches,
                  [branch.id]: {
                    ...branch,
                    nextChild: {
                      branchId: newBranchId,
                      actionIndex: index,
                    },
                  },
                  [newBranchId]: {
                    created: new Date(),
                    id: newBranchId,
                    stack: [action],
                    parent: {
                      branchId: branch.id,
                      actionIndex: index,
                    },
                  },
                },
              };
            }
          });
        },
      ]),
    [latestCallbacksRef, onDoRedo, onDo, getMAH, storeActionCreatedDate]
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
    setHistory,
  };
};
