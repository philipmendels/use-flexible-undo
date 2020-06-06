import { mapFilterObj } from './util-internal';
import { mergeDeepC, mergeDeep } from './util';
import {
  History,
  PayloadByType,
  ActionUnion,
  Branch,
  Action,
  UndoableHandlersByType,
} from './index.types';
import { v4 } from 'uuid';

export const createInitialHistory = <
  PBT extends PayloadByType
>(): History<PBT> => {
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

export const undoUpdater = <PBT extends PayloadByType>(prev: History<PBT>) => {
  const newIndex = getCurrentIndex(prev) - 1;
  const stack = getCurrentBranch(prev).stack;
  return {
    ...prev,
    currentPosition: {
      actionId: newIndex < 0 ? 'none' : stack[newIndex].id,
      globalIndex: newIndex,
    },
  };
};

export const getSideEffectForUndo = <PBT extends PayloadByType>(
  handlers: UndoableHandlersByType<PBT>
) => (history: History<PBT>) => {
  const stack = getCurrentBranch(history).stack;
  const { type, payload } = stack[getCurrentIndex(history)];
  return () => handlers[type].undo(payload);
};

export const redoUpdater = <PBT extends PayloadByType>(prev: History<PBT>) => ({
  ...prev,
  currentPosition: {
    actionId: actionSelectorForRedo(prev).id,
    globalIndex: getNewIndexForRedo(prev),
  },
});

const getNewIndexForRedo = <PBT extends PayloadByType>(history: History<PBT>) =>
  getCurrentIndex(history) + 1;

const actionSelectorForRedo = <PBT extends PayloadByType>(
  history: History<PBT>
) => {
  const stack = getCurrentBranch(history).stack;
  return stack[getNewIndexForRedo(history)];
};

export const getSideEffectForRedo = <PBT extends PayloadByType>(
  handlers: UndoableHandlersByType<PBT>
) => (history: History<PBT>) => {
  const { type, payload } = actionSelectorForRedo(history);
  return () => handlers[type].drdo(payload);
};

export const getPathFromCommonAncestor = <PBT extends PayloadByType>(
  history: History<PBT>,
  branchId: string,
  path: Branch<PBT>[] = []
): Branch<PBT>[] => {
  const branch = history.branches[branchId];
  if (branch.parent) {
    const newPath = [...path, branch];
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
  throw new Error('you cannot travel to the branch that you are on');
};

export const updatePath = <PBT extends PayloadByType>(path: Branch<PBT>[]) => (
  prevHistory: History<PBT>
) =>
  path.reduce((newHist, pathBranch) => {
    const branch = newHist.branches[newHist.currentBranchId];
    const stack = branch.stack;
    const parent = pathBranch.parent!;
    const newBranchId = pathBranch.id;
    const index = parent.position.globalIndex;
    const reparentedBranches = getReparentedBranches(
      newBranchId,
      parent.branchId,
      index
    );
    return mergeDeep(
      {
        currentBranchId: newBranchId,
        branches: {
          ...reparentedBranches,
          [branch.id]: {
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
