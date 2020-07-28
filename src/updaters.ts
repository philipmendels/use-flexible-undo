import { mapFilterObj } from './util-internal';
import { mergeDeepC, mergeDeep } from './util-internal';
import {
  History,
  Branch,
  BranchConnection,
  PositionOnBranch,
  BaseAction,
  UFUA,
  UndoableHandlersByType,
} from './index.types';
import { v4 } from 'uuid';

const START = 'start';

export const createInitialHistory = <
  A extends BaseAction<string, any>
>(): History<A> => {
  const initialAction = createAction({
    type: START,
    payload: undefined,
  }) as UFUA<A>;
  const initialBranchId = v4();
  return {
    currentPosition: {
      actionId: initialAction.id,
      globalIndex: 0,
    },
    branches: {
      [initialBranchId]: {
        id: initialBranchId,
        created: new Date(),
        stack: [initialAction],
        number: 1,
      },
    },
    currentBranchId: initialBranchId,
  };
};

export const getCurrentBranch = <A extends BaseAction>(prev: History<A>) =>
  prev.branches[prev.currentBranchId];

export const getCurrentIndex = <A extends BaseAction<string, any>>(
  prev: History<A>
) => prev.currentPosition.globalIndex;

export const addAction = <A extends BaseAction<string, any>>(
  action: UFUA<A>,
  clearFutureOnDo: boolean
) => (prev: History<A>) => {
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

export const addActionToCurrentBranch = <A extends BaseAction<string, any>>(
  action: UFUA<A>
) => (prev: History<A>) => {
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

const clearFuture = <A extends BaseAction<string, any>>(prev: History<A>) => {
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
) => <A extends BaseAction<string, any>>(prev: History<A>) =>
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

export const addActionToNewBranch = <A extends BaseAction<string, any>>(
  action: UFUA<A>
) => (prev: History<A>) => {
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
  const newBranch: Branch<A> = {
    created: new Date(),
    id: newBranchId,
    number: Math.max(...Object.values(prev.branches).map(b => b.number)) + 1,
    stack: currentStack.slice(0, currentIndex + 1).concat(action),
    parentOriginal: {
      branchId: currentBranch.id,
      position: currentPosition,
    },
  };
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
        [newBranchId]: newBranch,
      },
    },
    prev
  );
};

export const getNewPosition = (newIndex: number) => <
  A extends BaseAction<string, any>
>(
  stack: UFUA<A>[]
): PositionOnBranch => ({
  actionId: stack[newIndex].id,
  globalIndex: newIndex,
});

export const undoUpdater = <A extends BaseAction<string, any>>(
  prev: History<A>
) => {
  const newIndex = getCurrentIndex(prev) - 1;
  const stack = getCurrentBranch(prev).stack;
  return {
    ...prev,
    currentPosition: getNewPosition(newIndex)(stack),
  };
};

export const getSideEffectForUndo = <A extends BaseAction>(
  handlers: UndoableHandlersByType<A>
) => (history: History<A>) => {
  const stack = getCurrentBranch(history).stack;
  const action = stack[getCurrentIndex(history)];
  return getSideEffectForUndoAction(handlers)(action.action);
};

export const getSideEffectForUndoAction = <A extends BaseAction>(
  handlers: UndoableHandlersByType<A>
) => (action: A) => {
  const { type, payload } = action;
  return () => handlers[type as A['type']].undo(payload);
};

export const redoUpdater = <A extends BaseAction<string, any>>(
  prev: History<A>
) => ({
  ...prev,
  currentPosition: {
    actionId: getActionForRedo(prev).id,
    globalIndex: getNewIndexForRedo(prev),
  },
});

const getNewIndexForRedo = <A extends BaseAction<string, any>>(
  history: History<A>
) => getCurrentIndex(history) + 1;

export const getActionForRedo = <A extends BaseAction<string, any>>(
  history: History<A>
) => {
  const stack = getCurrentBranch(history).stack;
  return stack[getNewIndexForRedo(history)];
};

export const getSideEffectForRedo = <A extends BaseAction<string, any>>(
  handlers: UndoableHandlersByType<A>
) => (history: History<A>) => {
  const action = getActionForRedo(history);
  return getSideEffectForRedoAction(handlers)(action.action);
};

export const getSideEffectForRedoAction = <A extends BaseAction<string, any>>(
  handlers: UndoableHandlersByType<A>
) => (action: A) => {
  const { type, payload } = action;
  return () => handlers[type as A['type']].drdo(payload);
};

export const getPathFromCommonAncestor = <A extends BaseAction<string, any>>(
  history: History<A>,
  branchId: string,
  path: Branch<A>[] = []
): Branch<A>[] => {
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

export const updatePath = (path: string[]) => <
  A extends BaseAction<string, any>
>(
  prevHistory: History<A>
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

export const createAction = <A extends BaseAction<string, any>>(
  action: A
): UFUA<A> => ({
  action,
  created: new Date(),
  id: v4(),
});

export const isUndoPossible = <A extends BaseAction<string, any>>(
  history: History<A>
) => getCurrentIndex(history) > 0;

export const isRedoPossible = <A extends BaseAction<string, any>>(
  history: History<A>
) => {
  const index = getCurrentIndex(history);
  const stack = getCurrentBranch(history).stack;
  return index < stack.length - 1;
};

export const isAtHead = <A extends BaseAction<string, any>>(
  history: History<A>
) => {
  const index = getCurrentIndex(history);
  const stack = getCurrentBranch(history).stack;
  return index === stack.length - 1;
};

export const getSideBranches = (branchId: string, flatten: boolean) => <
  A extends BaseAction<string, any>
>(
  history: History<A>
): BranchConnection<A>[] =>
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

export const getBranchSwitchProps = <A extends BaseAction<string, any>>(
  history: History<A>,
  branchId: string
) => {
  const path = getPathFromCommonAncestor(history, branchId);
  return {
    path,
    parentIndex: path[path.length - 1].parent!.position.globalIndex,
    caIndex: path[0].parent!.position.globalIndex,
  };
};
