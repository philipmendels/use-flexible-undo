import { useState, useCallback, useRef } from 'react';
import {
  CustomActionsDefinition,
  InferredAction,
  UndoStackItem,
  CustomAction,
  WrappedCustomActions,
  UndoStackSetter,
} from './index.types';

export const useInfiniteUndo = <
  C extends CustomActionsDefinition | undefined = undefined
>() => {
  const actionsRef = useRef<Record<string, InferredAction<any, C>>>({});

  const [past, setPast] = useState<UndoStackItem[]>([]);
  const [future, setFuture] = useState<UndoStackItem[]>([]);

  const undo = useCallback(() => {
    shiftStack(past, setPast, setFuture, type => actionsRef.current[type].undo);
  }, [past]);

  const redo = useCallback(() => {
    shiftStack(future, setFuture, setPast, type => actionsRef.current[type].do);
  }, [future]);

  const makeUndoable = useCallback(
    <P extends any>(action: InferredAction<P, C>) => {
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

  //No need to infer the Payload here
  const getCustomActions = useCallback((item: UndoStackItem) => {
    //Use an empty object as C to let TypeScript infer action.custom
    const action = actionsRef.current[item.type] as InferredAction<any, {}>;
    if (!action.custom) {
      throw new Error(
        `You are getting custom actions for action ${item.type}, but none are registered.`
      );
    }
    return Object.fromEntries(
      Object.entries(action.custom).map(([key, value]) => [
        key,
        () => (value as CustomAction)(item.payload, item.type),
      ])
    ) as WrappedCustomActions<C>;
  }, []);

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
    getCustomActions,
  };
};

const shiftStack = (
  from: UndoStackItem[],
  setFrom: UndoStackSetter,
  setTo: UndoStackSetter,
  action: (type: string) => (payload: any) => void
) => {
  if (from.length) {
    const [item, ...rest] = from;
    action(item.type)(item.payload);
    setFrom(rest);
    setTo(to => [item, ...to]);
  }
};
