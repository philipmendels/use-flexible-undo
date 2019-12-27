import { useState, useCallback, useRef } from 'react';

export interface UndoableAction<P> {
  type: string;
  describe?: (payload: P) => string;
  do: (payload: P) => void;
  undo: (payload: P) => void;
}

type ActionsRecord = Record<string, UndoableAction<any>>;

interface StackItem {
  type: string;
  payload: any;
}

export const useInfiniteUndo = () => {
  const actionsRef = useRef<ActionsRecord>({});

  const [past, setPast] = useState<StackItem[]>([]);
  const [future, setFuture] = useState<StackItem[]>([]);

  const undo = useCallback(() => {
    if (past.length) {
      const item = past[past.length - 1];
      actionsRef.current[item.type].undo(item.payload);
      setPast(past.slice(0, past.length - 1));
      setFuture(future => [item, ...future]);
    }
  }, [past]);

  const redo = useCallback(() => {
    if (future.length) {
      const [item, ...rest] = future;
      actionsRef.current[item.type].do(item.payload);
      setFuture(rest);
      setPast(past => [...past, item]);
    }
  }, [future]);

  const makeUndoable = useCallback(
    <P extends any>(action: UndoableAction<P>) => {
      const { type } = action;
      console.log('MAKE UNDOABLE', type);
      actionsRef.current[type] = action;
      return (payload: P) => {
        action.do(payload);
        setPast(past => [...past, { type, payload }]);
        setFuture([]);
      };
    },
    []
  );

  return {
    makeUndoable,
    undo,
    redo,
    stack: {
      past,
      future,
    },
  };
};
