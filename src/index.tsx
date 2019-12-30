import { useState, useCallback, useRef } from 'react';
import {
  CustomActionsDefinition,
  InferredAction,
  UndoStackItem,
  CustomAction,
  WrappedCustomActions,
  UndoStackSetter,
  PartialBy,
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

  const makeUndoables = useCallback(
    <PR extends Record<string, any>>(
      map: { [K in keyof PR]: PartialBy<InferredAction<PR[K], C>, 'type'> }
    ) =>
      Object.fromEntries(
        Object.entries(map).map(([key, value]) => [
          key,
          //TODO: make this work without type casting
          makeUndoable({ type: key, ...value } as InferredAction<any, C>),
        ])
      ) as { [K in keyof PR]: (p: PR[K]) => void },
    [makeUndoable]
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
    makeUndoables,
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

type Handler<P, S> = (payload: P) => (state: S) => S;

interface UndoableActionHandler<P, S> {
  do: Handler<P, S>;
  undo: Handler<P, S>;
}

interface UAction<T, P> {
  type: T;
  payload: P;
  undo?: boolean;
}

export const makeUndoableReducer = <
  S extends any,
  PR extends Record<string, any>
>(
  map: { [K in keyof PR]: UndoableActionHandler<PR[K], S> }
) => ({
  reducer: <T extends keyof PR>(
    state: S,
    { payload, type, undo }: UAction<T, PR[T]>
  ) => {
    const handler = map[type];
    return handler
      ? undo
        ? handler.undo(payload)(state)
        : handler.do(payload)(state)
      : state; // TODO: when no handler found return state or throw error?
  },
  actions: Object.fromEntries(
    Object.keys(map).map(<T extends keyof PR>(type: T) => [
      type,
      (payload: PR[T], undo?: boolean) => ({
        type,
        payload,
        undo,
      }),
    ])
  ) as {
    [T in keyof PR]: (payload: PR[T], undo?: boolean) => UAction<T, PR[T]>;
  },
});
