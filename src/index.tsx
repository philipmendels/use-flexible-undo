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
    shiftStack(past, setPast, setFuture, type => actionsRef.current[type].undo);
  }, [past]);

  const redo = useCallback(() => {
    shiftStack(future, setFuture, setPast, type => actionsRef.current[type].do);
  }, [future]);

  const makeUndoable = useCallback(
    <P extends any>(action: UndoableAction<P>) => {
      const { type } = action;
      console.log('MAKE UNDOABLE', type);
      actionsRef.current[type] = action;
      return (payload: P) => {
        action.do(payload);
        setPast(past => [{ type, payload }, ...past]);
        setFuture([]);
      };
    },
    []
  );

  return {
    makeUndoable,
    undo,
    redo,
    canUndo: () => Boolean(past.length),
    canRedo: () => Boolean(future.length),
    stack: {
      past: [...past],
      future: [...future].reverse(),
    },
  };
};

type Setter = React.Dispatch<React.SetStateAction<StackItem[]>>;

const shiftStack = (
  from: StackItem[],
  setFrom: Setter,
  setTo: Setter,
  action: (type: string) => (payload: any) => void
) => {
  if (from.length) {
    const [item, ...rest] = from;
    action(item.type)(item.payload);
    setFrom(rest);
    setTo(to => [item, ...to]);
  }
};
