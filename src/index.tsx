import { useState, useCallback, useRef, Dispatch } from 'react';
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

  const makeUndoablesFromDispatch = useCallback(
    <PBT extends PayloadByType>(
      dispatch: Dispatch<UActions<PBT>>,
      actionsByType: UActionCreatorsByType<PBT>,
      ...metaActionsByType: C extends undefined
        ? []
        : [{ [T in keyof PBT]: { [N in keyof C]: CustomAction<PBT[T], C[N]> } }]
    ) =>
      Object.fromEntries(
        Object.entries(actionsByType).map(([type, action]) => [
          type,
          //TODO: make this work without type casting
          makeUndoable({
            type,
            do: payload => dispatch(action(payload)),
            undo: payload => dispatch(action(payload, true)),
            ...(metaActionsByType
              ? { custom: metaActionsByType[0]![type] }
              : {}),
          } as InferredAction<any, C>),
        ])
      ) as { [K in keyof PBT]: (p: PBT[K]) => void },
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
    makeUndoablesFromDispatch,
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

type PayloadByType<T extends string = string, P = any> = Record<T, P>;

// typing action param as UAction<T, PBT[T]> is good enough for
// directly calling the reducer but not good enough for calling the
// dispatch function that is returned from useReducer.
type UActions<PBT extends PayloadByType> = {
  [T in keyof PBT]: UAction<T, PBT[T]>;
}[keyof PBT];

type UActionCreatorsByType<PBT extends PayloadByType> = {
  [T in keyof PBT]: (payload: PBT[T], undo?: boolean) => UAction<T, PBT[T]>;
};

export const makeUndoableReducer = <S, PBT extends PayloadByType>(
  map: { [K in keyof PBT]: UndoableActionHandler<PBT[K], S> }
) => ({
  reducer: (state: S, { payload, type, undo }: UActions<PBT>) => {
    const handler = map[type];
    return handler
      ? undo
        ? handler.undo(payload)(state)
        : handler.do(payload)(state)
      : state; // TODO: when no handler found return state or throw error?
  },
  actions: Object.fromEntries(
    Object.keys(map).map(<T extends keyof PBT>(type: T) => [
      type,
      (payload: PBT[T], undo?: boolean) => ({
        type,
        payload,
        undo,
      }),
    ])
  ) as UActionCreatorsByType<PBT>,
});

export const useDispatchUndo = <D extends Dispatch<UAction<string, any>>>(
  dispatch: D
) =>
  useCallback(
    (action: Parameters<D>[0]) => {
      dispatch({ ...action, undo: true });
    },
    // Dispatch is stable but linter does not know
    [dispatch]
  );
