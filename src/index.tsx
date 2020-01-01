import { useState, useCallback, useRef, Dispatch } from 'react';
import {
  CustomActionsDefinition,
  InferredAction,
  UndoStackItem,
  CustomAction,
  WrappedCustomActions,
  UndoStackSetter,
  PartialBy,
  PayloadByType,
  UActions,
  UActionCreatorsByType,
  UAction,
  InferredActionHandler,
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

export const makeUndoableReducer = <
  S,
  PBT extends PayloadByType,
  MBN extends CustomActionsDefinition | undefined = undefined
>(
  map: { [K in keyof PBT]: InferredActionHandler<PBT[K], S, MBN> }
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
  ...({
    metaActions: Object.fromEntries(
      Object.keys(map).map(<T extends keyof PBT>(type: T) => [
        type,
        (map[type] as InferredActionHandler<any, any, {}>).custom,
      ])
    ),
  } as MBN extends undefined
    ? {}
    : {
        metaActions: {
          [T in keyof PBT]: { [N in keyof MBN]: CustomAction<PBT[T], MBN[N]> };
        };
      }),
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
