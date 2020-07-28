import { useState, useCallback, useRef, useLayoutEffect, useMemo } from 'react';

import {
  UFUProps,
  HandlersByType,
  History,
  Updater,
  BranchSwitchModus,
  BaseAction,
} from './index.types';
import { mapObject } from './util-internal';
import {
  getCurrentBranch,
  getCurrentIndex,
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
  getBranchSwitchProps,
} from './updaters';
import { defaultOptions } from './constants';

export const useFlexibleUndo = <A extends BaseAction>({
  handlers,
  options,
  initialHistory = createInitialHistory(),
}: UFUProps<A>) => {
  const [history, setHistory] = useState(initialHistory);

  const { clearFutureOnDo } = {
    ...defaultOptions,
    ...options,
  };

  const undoables = useMemo(
    () =>
      mapObject(handlers)<HandlersByType<A>>(([type, handler]) => [
        type,
        payload => {
          const action = createAction({ type, payload } as A);
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
      isPossible: (history: History<A>) => boolean,
      getSideEffect: (history: History<A>) => () => void,
      updater: Updater<History<A>>
    ) => {
      let isSideEffectQueued = false;
      setHistory(prev => {
        if (isPossible(prev)) {
          if (!isSideEffectQueued) {
            isSideEffectQueued = true;
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

  const timeTravelCurrentBranch = useCallback(
    (newIndex: number) => {
      let areSideEffectsQueued = false;
      setHistory(prev => {
        const currentIndex = getCurrentIndex(prev);
        const currentStack = getCurrentBranch(prev).stack;
        if (newIndex === currentIndex) {
          return prev;
        } else if (newIndex > currentStack.length - 1 || newIndex < -1) {
          throw new Error(`Invalid index ${newIndex}`);
        } else {
          if (!areSideEffectsQueued) {
            areSideEffectsQueued = true;
            if (newIndex < currentIndex) {
              const actions = currentStack
                .slice(newIndex + 1, currentIndex + 1)
                .reverse();
              actions.forEach(action => {
                queuedSideEffectsRef.current.push(
                  getSideEffectForUndoAction(handlers)(action.action)
                );
              });
            } else if (newIndex > currentIndex) {
              const actions = currentStack.slice(
                currentIndex + 1,
                newIndex + 1
              );
              actions.forEach(action => {
                queuedSideEffectsRef.current.push(
                  getSideEffectForRedoAction(handlers)(action.action)
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

  const timeTravel = useCallback(
    (indexOnBranch: number, branchId = history.currentBranchId) => {
      if (branchId === history.currentBranchId) {
        timeTravelCurrentBranch(indexOnBranch);
      } else {
        const { caIndex, path, parentIndex } = getBranchSwitchProps(
          history,
          branchId
        );
        if (caIndex < history.currentPosition.globalIndex) {
          timeTravelCurrentBranch(caIndex);
        }
        setHistory(updatePath(path.map(b => b.id)));
        // current branch is updated
        timeTravelCurrentBranch(parentIndex + 1 + indexOnBranch);
      }
    },
    [history, timeTravelCurrentBranch]
  );

  const timeTravelById = useCallback(
    (actionId: string, branchId = history.currentBranchId) => {
      const index = history.branches[branchId].stack.findIndex(
        action => action.id === actionId
      );
      if (index >= 0) {
        timeTravel(index, branchId);
      } else {
        throw new Error(
          `action with id ${actionId} not found on branch with id ${branchId}${
            branchId === history.currentBranchId ? '(current branch)' : ''
          }`
        );
      }
    },
    [history, timeTravel]
  );

  const switchToBranch = useCallback(
    (
      branchId: string,
      travelTo: BranchSwitchModus = 'LAST_COMMON_ACTION_IF_PAST'
    ) => {
      if (branchId === history.currentBranchId) {
        throw new Error('You cannot switch to the current branch.');
      } else {
        const targetBranch = history.branches[branchId];
        const { caIndex, path, parentIndex } = getBranchSwitchProps(
          history,
          branchId
        );
        if (
          caIndex < history.currentPosition.globalIndex ||
          travelTo === 'LAST_COMMON_ACTION'
        ) {
          timeTravelCurrentBranch(caIndex);
        }
        setHistory(updatePath(path.map(b => b.id)));
        // current branch is updated
        if (travelTo === 'LAST_KNOWN_POSITION_ON_BRANCH') {
          timeTravelCurrentBranch(targetBranch.lastPosition!.globalIndex);
        } else if (travelTo === 'HEAD_OF_BRANCH') {
          timeTravelCurrentBranch(parentIndex + targetBranch.stack.length);
        }
      }
    },
    [history, timeTravelCurrentBranch]
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
