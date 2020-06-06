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
  BranchConnection,
  Branch,
} from '../index.types';

import { useLatest } from './use-latest';

import { mapObject, mapFilterObj } from '../util-internal';
import { defaultOptions } from '../constants';
import { mergeDeepC, mergeDeep } from '../util';

const createInitialHistory = <PBT extends PayloadByType>(): History<PBT> => {
  const id = v4();
  return {
    currentPosition: {
      actionId: 'none',
      globalIndex: -1,
    },
    branches: {
      [id]: { id, created: new Date(), stack: [] },
    },
    currentBranchId: id,
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

  const { unstable_callHandlersFrom } = {
    ...defaultOptions,
    ...options,
  };

  const latestCallbacksRef = useLatest(latest);

  const [history, setHistory] = useState(initialHistory);

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
      const index = prev.currentPosition.globalIndex;
      const stack = prev.branches[prev.currentBranchId].stack;
      if (index >= 0) {
        if (!hasSideEffectRun) {
          hasSideEffectRun = true;
          const action = stack[index];
          unstable_callHandlersFrom === 'UPDATER'
            ? handleUndo(action)
            : batchedUpdatesRef.current.push({ type: 'undo', action });
        }
        const newIndex = index - 1;
        return {
          ...prev,
          currentPosition: {
            actionId: newIndex < 0 ? 'none' : stack[newIndex].id,
            globalIndex: newIndex,
          },
        };
      } else {
        return prev;
      }
    });
  }, [handleUndo, unstable_callHandlersFrom]);

  const redo = useCallback(() => {
    let hasSideEffectRun = false;
    setHistory(prev => {
      const index = prev.currentPosition.globalIndex;
      const stack = prev.branches[prev.currentBranchId].stack;
      if (index < stack.length - 1) {
        const newIndex = index + 1;
        const action = stack[newIndex];
        if (!hasSideEffectRun) {
          hasSideEffectRun = true;
          unstable_callHandlersFrom === 'UPDATER'
            ? handleRedo(action)
            : batchedUpdatesRef.current.push({ type: 'redo', action });
        }
        return {
          ...prev,
          currentPosition: {
            actionId: action.id,
            globalIndex: newIndex,
          },
        };
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

  const getSideBranches = useCallback(
    (branchId: string, flatten: boolean) =>
      Object.values(history.branches)
        .filter(b => b.parent?.branchId === branchId)
        .reduce<BranchConnection<PBT>[]>((prev, curr) => {
          const position = curr.parent!.position;
          const connection = prev.find(
            c => c.position.actionId === position.actionId
          );
          const flattenedBranches = flatten
            ? getSideBranches(curr.id, true).flatMap(con => con.branches)
            : [];
          if (connection) {
            connection.branches.push(curr, ...flattenedBranches);
          } else {
            prev.push({
              position,
              branches: [curr, ...flattenedBranches],
            });
          }
          return prev;
        }, []),
    [history.branches]
  );

  useEffect(() => {
    console.log(history);
    console.log(getSideBranches(history.currentBranchId, true));
  }, [getSideBranches, history]);

  const getPathFromCa = useCallback(
    (branchId: string, path: Branch<PBT>[] = []): Branch<PBT>[] => {
      const branch = history.branches[branchId];
      if (branch.parent) {
        const newPath = [...path, branch];
        if (branch.parent.branchId === history.currentBranchId) {
          return newPath;
        } else {
          return getPathFromCa(branch.parent.branchId, newPath);
        }
      }
      throw new Error('you cannot travel to the branch that you are on');
    },
    [history.branches, history.currentBranchId]
  );

  const switchTo = useCallback(
    (branchId: string) => {
      // 1. find common ancestor
      // 2. time-travel to c.a.
      // 3. switch branch
      const path = getPathFromCa(branchId);
      const newIndex = path[0].parent!.position.globalIndex;

      for (let i = history.currentPosition.globalIndex; i > newIndex; i--) {
        undo();
      }
      for (let i = history.currentPosition.globalIndex; i < newIndex; i++) {
        redo();
      }

      setHistory(prevHistory =>
        path.reduce((newHist, pathBranch) => {
          const branch = newHist.branches[newHist.currentBranchId];
          const stack = branch.stack;
          const parent = pathBranch.parent!;
          const newBranchId = pathBranch.id;
          const index = parent.position.globalIndex;
          const reparentedBranches = Object.values(newHist.branches).reduce<
            typeof newHist.branches
          >(
            (repBranches, repBranch) =>
              repBranch.parent?.branchId === parent.branchId &&
              repBranch.parent.position.globalIndex <= index
                ? {
                    ...repBranches,
                    [repBranch.id]: {
                      ...repBranch,
                      parent: {
                        ...repBranch.parent,
                        branchId: newBranchId,
                      },
                    },
                  }
                : repBranches,
            {}
          );
          return {
            ...newHist,
            currentBranchId: newBranchId,
            branches: {
              ...newHist.branches,
              ...reparentedBranches,
              [branch.id]: {
                ...branch,
                stack: stack.slice(index + 1),
                parent: {
                  branchId: newBranchId,
                  position: parent.position,
                },
                lastPosition:
                  branch.id === prevHistory.currentBranchId
                    ? prevHistory.currentPosition
                    : branch.lastPosition,
              },
              [newBranchId]: {
                ...pathBranch,
                stack: stack.slice(0, index + 1).concat(pathBranch.stack),
                parent: undefined,
              },
            },
          };
        }, prevHistory)
      );
    },
    [getPathFromCa, history.currentPosition.globalIndex, redo, undo]
  );

  // const mapStack = useCallback(
  //   <R extends any>(fn: (action: ActionUnion<PBT>) => R) =>
  //     mapReverse(history.branches[history.currentBranchId].stack, fn),
  //   [history.branches, history.currentBranchId]
  // );

  const stack = useMemo(() => {
    const {
      currentBranchId,
      branches,
      currentPosition: { globalIndex },
    } = history;

    const connections = getSideBranches(currentBranchId, true);

    const stack = branches[currentBranchId].stack;

    const mapConnections = (
      cons: BranchConnection<PBT>[],
      list: typeof stack
    ) =>
      list.map(item => ({
        ...item,
        connections: cons.find(c => c.position.actionId === item.id)?.branches,
        switchTo,
      }));

    return {
      past: mapConnections(
        connections,
        stack.slice(0, globalIndex + 1).reverse()
      ),
      future: mapConnections(
        connections,
        stack.slice(globalIndex + 1, stack.length).reverse()
      ),
    };
  }, [getSideBranches, history, switchTo]);

  const canUndo = useMemo(() => Boolean(stack.past.length), [
    stack.past.length,
  ]);
  const canRedo = useMemo(() => Boolean(stack.future.length), [
    stack.future.length,
  ]);

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
    (
      handlers: {
        [K in StringOnlyKeyOf<PBT>]: UndoableHandlerWithMeta<PBT[K], K, MR>;
      }
    ): HandlersByType<PBT> =>
      mapObject(handlers, ([type, handler]) => [
        type,
        payload => {
          const action = ({
            type,
            payload,
            created: new Date(),
            id: v4(),
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

          const gcb = (prev: History<PBT>) =>
            prev.branches[prev.currentBranchId];
          const gi = (prev: History<PBT>) => prev.currentPosition.globalIndex;

          const addAction = (prev: History<PBT>) =>
            mergeDeep(
              {
                currentPosition: {
                  actionId: action.id,
                  globalIndex: gi(prev) + 1,
                },
                branches: {
                  [gcb(prev).id]: {
                    stack: gcb(prev).stack.concat(action) as any,
                  },
                },
              },
              prev
            );

          const getReparentedBranches = (newBranchId: string) => (
            prev: History<PBT>
          ) =>
            mapFilterObj(
              b =>
                b.parent?.branchId === gcb(prev).id &&
                b.parent.position.globalIndex <= gi(prev),
              mergeDeepC({
                parent: {
                  branchId: newBranchId,
                },
              }),
              prev.branches
            );

          const nb = (newBranchId: string) => (prev: History<PBT>) => {
            const branch = gcb(prev);
            const stack = branch.stack;
            const currentPosition = prev.currentPosition;
            const index = gi(prev);
            return mergeDeep(
              {
                currentPosition: {
                  actionId: action.id,
                  globalIndex: gi(prev) + 1,
                },
                currentBranchId: newBranchId,
                branches: {
                  ...getReparentedBranches(newBranchId)(prev),
                  [branch.id]: {
                    ...branch,
                    lastPosition: currentPosition,
                    stack: stack.slice(gi(prev) + 1),
                    parent: {
                      branchId: newBranchId,
                      position: currentPosition,
                    },
                  },
                  [newBranchId]: {
                    created: new Date(),
                    id: newBranchId,
                    stack: stack.slice(0, index + 1).concat(action) as any,
                    parentOriginal: {
                      branchId: branch.id,
                      position: currentPosition,
                    },
                  },
                },
              },
              prev
            );
          };

          setHistory(prev => {
            const branch = prev.branches[prev.currentBranchId];
            const stack = branch.stack;
            const currentPosition = prev.currentPosition;
            const index = currentPosition.globalIndex;
            const newPosition = {
              actionId: action.id,
              globalIndex: index + 1,
            };
            if (index === stack.length - 1) {
              return addAction(prev);
            } else {
              const newBranchId = v4();
              return nb(newBranchId)(prev);
            }
          });
        },
      ]),
    [latestCallbacksRef, onDoRedo, onDo, getMAH]
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
