import { mapFilterObj } from './util-internal';
import { mergeDeepC, mergeDeep } from './util';
import {
  History,
  PayloadByType,
  ActionUnion,
  Branch,
  Action,
  UndoableHandlersByType,
  BranchConnection,
  PositionOnBranch,
} from './index.types';
import { v4 } from 'uuid';

const NONE = 'none';

export const createInitialHistory = <
  PBT extends PayloadByType
>(): History<PBT> => {
  const id = v4();
  return {
    currentPosition: {
      actionId: NONE,
      globalIndex: -1,
    },
    branches: {
      [id]: { id, created: new Date(), stack: [] },
    },
    currentBranchId: id,
  };
};

export const getCurrentBranch = <PBT extends PayloadByType>(
  prev: History<PBT>
) => prev.branches[prev.currentBranchId];

export const getCurrentIndex = <PBT extends PayloadByType>(
  prev: History<PBT>
) => prev.currentPosition.globalIndex;

export const addAction = <PBT extends PayloadByType>(
  action: ActionUnion<PBT>,
  clearFutureOnDo: boolean
) => (prev: History<PBT>) => {
  if (isAtHead(prev)) {
    return addActionToCurrentBranch(action)(prev);
  } else {
    if (clearFutureOnDo) {
      return addActionToCurrentBranch(action)(clearFuture(prev));
    } else {
      return addActionToNewBranch(action)(prev);
    }
  }
};

export const addActionToCurrentBranch = <PBT extends PayloadByType>(
  action: ActionUnion<PBT>
) => (prev: History<PBT>) => {
  const currentIndex = getCurrentIndex(prev);
  const currentBranch = getCurrentBranch(prev);
  return mergeDeep(
    {
      currentPosition: {
        actionId: action.id,
        globalIndex: currentIndex + 1,
      },
      branches: {
        [currentBranch.id]: {
          stack: currentBranch.stack.concat(action),
        },
      },
    },
    prev
  );
};

const clearFuture = <PBT extends PayloadByType>(prev: History<PBT>) => {
  const currentIndex = getCurrentIndex(prev);
  const currentBranch = getCurrentBranch(prev);
  // TODO: delete orphan branches
  return mergeDeep(
    {
      branches: {
        [currentBranch.id]: {
          stack: currentBranch.stack.slice(0, currentIndex + 1),
        },
      },
    },
    prev
  );
};

export const getReparentedBranches = (
  newBranchId: string,
  branchId: string,
  index: number
) => <PBT extends PayloadByType>(prev: History<PBT>) =>
  mapFilterObj(
    b =>
      b.parent?.branchId === branchId && b.parent.position.globalIndex <= index,
    mergeDeepC({
      parent: {
        branchId: newBranchId,
      },
    }),
    prev.branches
  );

export const addActionToNewBranch = <PBT extends PayloadByType>(
  action: ActionUnion<PBT>
) => (prev: History<PBT>) => {
  const currentIndex = getCurrentIndex(prev);
  const currentBranch = getCurrentBranch(prev);
  const currentStack = currentBranch.stack;
  const currentPosition = prev.currentPosition;
  const newBranchId = v4();
  const reparentedBranches = getReparentedBranches(
    newBranchId,
    currentBranch.id,
    currentIndex
  )(prev);
  return mergeDeep(
    {
      currentPosition: {
        actionId: action.id,
        globalIndex: currentIndex + 1,
      },
      currentBranchId: newBranchId,
      branches: {
        ...reparentedBranches,
        [currentBranch.id]: {
          lastPosition: prev.currentPosition,
          stack: currentStack.slice(currentIndex + 1),
          parent: {
            branchId: newBranchId,
            position: currentPosition,
          },
        },
        [newBranchId]: {
          created: new Date(),
          id: newBranchId,
          stack: currentStack.slice(0, currentIndex + 1).concat(action),
          parentOriginal: {
            branchId: currentBranch.id,
            position: currentPosition,
          },
        },
      },
    },
    prev
  );
};

export const getNewPosition = (newIndex: number) => <PBT extends PayloadByType>(
  stack: ActionUnion<PBT>[]
): PositionOnBranch => ({
  actionId: newIndex < 0 ? NONE : stack[newIndex].id,
  globalIndex: newIndex,
});

export const undoUpdater = <PBT extends PayloadByType>(prev: History<PBT>) => {
  const newIndex = getCurrentIndex(prev) - 1;
  const stack = getCurrentBranch(prev).stack;
  return {
    ...prev,
    currentPosition: getNewPosition(newIndex)(stack),
  };
};

export const getSideEffectForUndo = <PBT extends PayloadByType>(
  handlers: UndoableHandlersByType<PBT>
) => (history: History<PBT>) => {
  const stack = getCurrentBranch(history).stack;
  const action = stack[getCurrentIndex(history)];
  return getSideEffectForUndoAction(handlers)(action);
};

export const getSideEffectForUndoAction = <PBT extends PayloadByType>(
  handlers: UndoableHandlersByType<PBT>
) => (action: ActionUnion<PBT>) => {
  const { type, payload } = action;
  return () => handlers[type].undo(payload);
};

export const redoUpdater = <PBT extends PayloadByType>(prev: History<PBT>) => ({
  ...prev,
  currentPosition: {
    actionId: getActionForRedo(prev).id,
    globalIndex: getNewIndexForRedo(prev),
  },
});

const getNewIndexForRedo = <PBT extends PayloadByType>(history: History<PBT>) =>
  getCurrentIndex(history) + 1;

const getActionForRedo = <PBT extends PayloadByType>(history: History<PBT>) => {
  const stack = getCurrentBranch(history).stack;
  return stack[getNewIndexForRedo(history)];
};

export const getSideEffectForRedo = <PBT extends PayloadByType>(
  handlers: UndoableHandlersByType<PBT>
) => (history: History<PBT>) => {
  const action = getActionForRedo(history);
  return getSideEffectForRedoAction(handlers)(action);
};

export const getSideEffectForRedoAction = <PBT extends PayloadByType>(
  handlers: UndoableHandlersByType<PBT>
) => (action: ActionUnion<PBT>) => {
  const { type, payload } = action;
  return () => handlers[type].drdo(payload);
};

export const getPathFromCommonAncestor = <PBT extends PayloadByType>(
  history: History<PBT>,
  branchId: string,
  path: Branch<PBT>[] = []
): Branch<PBT>[] => {
  const branch = history.branches[branchId];
  if (branch.parent) {
    const newPath = [branch, ...path];
    if (branch.parent.branchId === history.currentBranchId) {
      return newPath;
    } else {
      return getPathFromCommonAncestor(
        history,
        branch.parent.branchId,
        newPath
      );
    }
  }
  // TODO: proper error message
  throw new Error('you cannot travel to the branch that you are on');
};

export const updatePath = (path: string[]) => <PBT extends PayloadByType>(
  prevHistory: History<PBT>
) =>
  path.reduce((newHist, pathBranchId) => {
    const branch = newHist.branches[newHist.currentBranchId];
    const stack = branch.stack;
    const pathBranch = newHist.branches[pathBranchId];
    const parent = pathBranch.parent!;

    const newBranchId = pathBranch.id;
    const index = parent.position.globalIndex;

    const reparentedBranches = getReparentedBranches(
      newBranchId,
      parent.branchId,
      index
    )(newHist);

    return mergeDeep(
      {
        currentBranchId: newBranchId,
        branches: {
          ...reparentedBranches,
          [branch.id]: {
            stack: stack.slice(index + 1),
            parent: {
              branchId: newBranchId,
              position: { ...parent.position },
            },
            lastPosition:
              branch.id === prevHistory.currentBranchId
                ? { ...prevHistory.currentPosition }
                : branch.lastPosition,
          },
          [newBranchId]: {
            stack: stack.slice(0, index + 1).concat(pathBranch.stack),
            parent: undefined,
          },
        },
      },
      newHist
    );
  }, prevHistory);

export const createAction = <
  T extends string,
  P,
  PBT extends PayloadByType<T, P>
>(
  type: T,
  payload: P
) =>
  (({
    type,
    payload,
    created: new Date(),
    id: v4(),
  } as Action) as ActionUnion<PBT>);

export const isUndoPossible = <PBT extends PayloadByType>(
  history: History<PBT>
) => getCurrentIndex(history) >= 0;

export const isRedoPossible = <PBT extends PayloadByType>(
  history: History<PBT>
) => {
  const index = getCurrentIndex(history);
  const stack = getCurrentBranch(history).stack;
  return index < stack.length - 1;
};

export const isAtHead = <PBT extends PayloadByType>(history: History<PBT>) => {
  const index = getCurrentIndex(history);
  const stack = getCurrentBranch(history).stack;
  return index === stack.length - 1;
};

export const getSideBranches = (branchId: string, flatten: boolean) => <
  PBT extends PayloadByType
>(
  history: History<PBT>
): BranchConnection<PBT>[] =>
  Object.values(history.branches)
    .filter(b => b.parent?.branchId === branchId)
    .map(b => {
      const flattenedBranches = flatten
        ? getSideBranches(b.id, true)(history).flatMap(con => con.branches)
        : [];
      return {
        position: b.parent!.position,
        branches: [b, ...flattenedBranches],
      };
    });
