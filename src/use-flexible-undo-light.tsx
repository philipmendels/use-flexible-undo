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
} from './updaters';
import { defaultOptions } from './constants';

export const useFlexibleUndoLight = <PBT extends PayloadByType>({
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

  useLayoutEffect(() => {
    queuedSideEffectsRef.current.forEach(se => se());
    queuedSideEffectsRef.current = [];
  });

  const timeTravel = useCallback(
    (newIndex: number) => {
      const currentIndex = getCurrentIndex(history);
      if (newIndex < currentIndex) {
        for (let i = currentIndex; i > newIndex; i--) {
          undo();
        }
      } else if (newIndex > currentIndex) {
        for (let i = currentIndex; i < newIndex; i++) {
          redo();
        }
      }
    },
    [history, redo, undo]
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

  const switchTo = useCallback(
    (branchId: string) => {
      const path = getPathFromCommonAncestor(history, branchId);
      const newIndex = path[0].parent!.position.globalIndex;

      timeTravel(newIndex);

      setHistory(updatePath(path));
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
    switchTo,
    history,
    setHistory,
  };
};
