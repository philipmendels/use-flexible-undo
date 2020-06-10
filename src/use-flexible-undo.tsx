import { useState, useCallback, useRef, useLayoutEffect, useMemo } from 'react';

import {
  PayloadByType,
  UFULightProps,
  HandlersByType,
  History,
  Updater,
} from './index.types';
import { mapObject } from './util-internal';
import {
  getCurrentBranch,
  getCurrentIndex,
  getPathFromCommonAncestor,
  updatePath,
  createInitialHistory,
  createAction,
  isUndoPossible,
  isRedoPossible,
  addAction,
  undoUpdater,
  redoUpdater,
  getSideEffectForRedo,
  getSideEffectForUndo,
  getSideEffectForUndoAction,
  getSideEffectForRedoAction,
  getNewPosition,
} from './updaters';
import { defaultOptions } from './constants';

export const useFlexibleUndo = <PBT extends PayloadByType>({
  handlers,
  options,
  initialHistory = createInitialHistory(),
}: UFULightProps<PBT>) => {
  const [history, setHistory] = useState(initialHistory);

  const { clearFutureOnDo } = {
    ...defaultOptions,
    ...options,
  };

  const undoables: HandlersByType<PBT> = useMemo(
    () =>
      mapObject(handlers, ([type, handler]) => [
        type,
        payload => {
          const action = createAction(type, payload);
          handler.drdo(payload);
          setHistory(addAction(action, clearFutureOnDo));
        },
      ]),
    [clearFutureOnDo, handlers]
  );

  const canUndo = useMemo(() => isUndoPossible(history), [history]);

  const canRedo = useMemo(() => isRedoPossible(history), [history]);

  const queuedSideEffectsRef = useRef<(() => void)[]>([]);

  useLayoutEffect(() => {
    queuedSideEffectsRef.current.forEach(se => se());
    queuedSideEffectsRef.current = [];
  });

  const handleUndoRedo = useCallback(
    (
      isPossible: (history: History<PBT>) => boolean,
      getSideEffect: (history: History<PBT>) => () => void,
      updater: Updater<History<PBT>>
    ) => {
      let hasSideEffectRun = false;
      setHistory(prev => {
        if (isPossible(prev)) {
          if (!hasSideEffectRun) {
            hasSideEffectRun = true;
            queuedSideEffectsRef.current.push(getSideEffect(prev));
          }
          return updater(prev);
        } else {
          return prev;
        }
      });
    },
    []
  );

  const undo = useCallback(() => {
    handleUndoRedo(isUndoPossible, getSideEffectForUndo(handlers), undoUpdater);
  }, [handleUndoRedo, handlers]);

  const redo = useCallback(() => {
    handleUndoRedo(isRedoPossible, getSideEffectForRedo(handlers), redoUpdater);
  }, [handleUndoRedo, handlers]);

  const timeTravel = useCallback(
    (newIndex: number) => {
      let hasSideEffectRun = false;
      setHistory(prev => {
        const currentIndex = getCurrentIndex(prev);
        const currentStack = getCurrentBranch(prev).stack;
        if (newIndex === currentIndex) {
          return prev;
        } else if (newIndex > currentStack.length - 1 || newIndex < -1) {
          throw new Error(`Invalid index ${newIndex}`);
        } else {
          if (!hasSideEffectRun) {
            hasSideEffectRun = true;
            if (newIndex < currentIndex) {
              const actions = currentStack
                .slice(newIndex + 1, currentIndex + 1)
                .reverse();
              actions.forEach(action => {
                queuedSideEffectsRef.current.push(
                  getSideEffectForUndoAction(handlers)(action)
                );
              });
            } else if (newIndex > currentIndex) {
              const actions = currentStack.slice(
                currentIndex + 1,
                newIndex + 1
              );
              actions.forEach(action => {
                queuedSideEffectsRef.current.push(
                  getSideEffectForRedoAction(handlers)(action)
                );
              });
            }
          }
          return {
            ...prev,
            currentPosition: getNewPosition(newIndex)(currentStack),
          };
        }
      });
    },
    [handlers]
  );

  const timeTravelById = useCallback(
    (id: string) => {
      const index = getCurrentBranch(history).stack.findIndex(
        action => action.id === id
      );
      if (index >= 0) {
        timeTravel(index);
      } else {
        throw new Error(`action with id ${id} not found on current branch`);
      }
    },
    [history, timeTravel]
  );

  const switchToBranch = useCallback(
    (branchId: string) => {
      const path = getPathFromCommonAncestor(history, branchId);
      const newIndex = path[path.length - 1].parent!.position.globalIndex;
      const ca = path[0].parent!.position.globalIndex;
      timeTravel(ca);
      setHistory(updatePath(path.map(b => b.id)));
      timeTravel(newIndex);
    },
    [history, timeTravel]
  );

  return {
    undoables,
    canUndo,
    canRedo,
    undo,
    redo,
    timeTravel,
    timeTravelById,
    switchToBranch,
    history,
    setHistory,
  };
};
