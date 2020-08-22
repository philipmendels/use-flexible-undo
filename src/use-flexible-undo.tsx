import { useState, useCallback, useRef, useLayoutEffect, useMemo } from 'react';

import {
  PayloadByType,
  UFUProps,
  HandlersByType,
  History,
  Updater,
  BranchSwitchModus,
} from './index.types';
import { mapObject } from './util-internal';
import {
  getCurrentBranch,
  updatePath,
  createInitialHistory,
  createHistoryItem,
  isUndoPossible,
  isRedoPossible,
  addHistoryItem,
  undoUpdater,
  redoUpdater,
  getSideEffectForRedo,
  getSideEffectForUndo,
  getSideEffectForUndoAction,
  getSideEffectForRedoAction,
  getNewPosition,
  getBranchSwitchProps,
  getTTActions,
} from './helpers';
import { defaultOptions } from './constants';
import { combineHandlersByType } from './util';

export const useFlexibleUndo = <PBT extends PayloadByType>(
  props: UFUProps<PBT>
) => {
  const { options, initialHistory = createInitialHistory() } = props;

  const [history, setHistory] = useState(initialHistory);

  const { clearFutureOnDo } = {
    ...defaultOptions,
    ...options,
  };

  const convertedHandlers = useMemo(
    () =>
      props.handlers
        ? props.handlers
        : combineHandlersByType(props.drdoHandlers, props.undoHandlers),
    [props.handlers, props.drdoHandlers, props.undoHandlers]
  );

  const undoables = useMemo(() => {
    return mapObject(convertedHandlers)<HandlersByType<PBT>>(
      ([type, handler]) => [
        type,
        payload => {
          const action = createHistoryItem(type, payload);
          handler.drdo(payload);
          setHistory(addHistoryItem(action, clearFutureOnDo));
        },
      ]
    );
  }, [clearFutureOnDo, convertedHandlers]);

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
    handleUndoRedo(
      isUndoPossible,
      getSideEffectForUndo(convertedHandlers),
      undoUpdater
    );
  }, [handleUndoRedo, convertedHandlers]);

  const redo = useCallback(() => {
    handleUndoRedo(
      isRedoPossible,
      getSideEffectForRedo(convertedHandlers),
      redoUpdater
    );
  }, [handleUndoRedo, convertedHandlers]);

  const timeTravelCurrentBranch = useCallback(
    (newIndex: number) => {
      let areSideEffectsQueued = false;
      setHistory(prev => {
        const { direction, actions } = getTTActions(newIndex)(prev);
        if (direction === 'none') {
          return prev;
        } else {
          if (!areSideEffectsQueued) {
            areSideEffectsQueued = true;
            if (direction === 'undo') {
              actions.forEach(action => {
                queuedSideEffectsRef.current.push(
                  getSideEffectForUndoAction(convertedHandlers)(action)
                );
              });
            } else {
              actions.forEach(action => {
                queuedSideEffectsRef.current.push(
                  getSideEffectForRedoAction(convertedHandlers)(action)
                );
              });
            }
          }
          return {
            ...prev,
            currentPosition: getNewPosition(newIndex)(
              getCurrentBranch(prev).stack
            ),
          };
        }
      });
    },
    [convertedHandlers]
  );

  const timeTravel = useCallback(
    (indexOnBranch: number, branchId: string = history.currentBranchId) => {
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
    (actionId: string, branchId: string = history.currentBranchId) => {
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
