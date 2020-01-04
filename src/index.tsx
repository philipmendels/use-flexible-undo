import { useState, useCallback, useRef, useReducer, useMemo } from 'react';
import {
  MetaActionReturnTypes,
  UndoableEffectWithMeta,
  Action,
  PayloadByType,
  HandlersByType,
  UndoableActionCreatorsByType,
  MetaActionHandler,
  LinkedMetaActions,
  StackSetter,
  UndoableStateUpdaterWithMeta,
  MetaActionHandlersByType,
  UndoableEffectWithMetaAndType,
  UndoableDispatch,
  UndoableReducer,
} from './index.types';

export const useInfiniteUndo = <
  MR extends MetaActionReturnTypes = undefined
>() => {
  const actionsRef = useRef<
    Record<string, UndoableEffectWithMetaAndType<any, MR>>
  >({});

  const [past, setPast] = useState<Action[]>([]);
  const [future, setFuture] = useState<Action[]>([]);

  const undo = useCallback(() => {
    shiftStack(past, setPast, setFuture, type => actionsRef.current[type].undo);
  }, [past]);

  const redo = useCallback(() => {
    shiftStack(future, setFuture, setPast, type => actionsRef.current[type].do);
  }, [future]);

  const makeUndoable = useCallback(
    <P extends any>(effect: UndoableEffectWithMetaAndType<P, MR>) => {
      const { type } = effect;
      console.log('MAKE UNDOABLE', type);
      actionsRef.current[type] = effect;
      return (payload: P) => {
        effect.do(payload);
        setPast(past => [{ type, payload }, ...past]);
        setFuture([]);
      };
    },
    []
  );

  const makeUndoables = useCallback(
    <PBT extends PayloadByType>(
      effects: {
        [K in keyof PBT]: UndoableEffectWithMeta<PBT[K], MR>;
      }
    ) =>
      Object.fromEntries(
        Object.entries(effects).map(([type, effect]) => [
          type,
          //TODO: make this work without type casting
          makeUndoable({ type, ...effect }),
        ])
      ) as HandlersByType<PBT>,
    [makeUndoable]
  );

  const makeUndoablesFromDispatch = useCallback(
    <PBT extends PayloadByType>(
      dispatch: UndoableDispatch<PBT>,
      actionCreators: UndoableActionCreatorsByType<PBT>,
      ...metaActionHandlers: MR extends undefined
        ? []
        : [MetaActionHandlersByType<PBT, MR>]
    ) =>
      Object.fromEntries(
        Object.entries(actionCreators).map(([type, action]) => [
          type,
          //TODO: make this work without type casting
          makeUndoable({
            type,
            do: (payload: any) => dispatch(action.do(payload)),
            undo: (payload: any) => dispatch(action.undo(payload)),
            ...(metaActionHandlers
              ? { meta: metaActionHandlers[0]![type] }
              : {}),
          } as any),
        ])
      ) as HandlersByType<PBT>,
    [makeUndoable]
  );

  //No need to infer the Payload here
  const getMetaActionHandlers = useCallback((item: Action) => {
    //Use an empty object as MR to let TypeScript infer action.custom
    const action = actionsRef.current[item.type] as UndoableEffectWithMeta<
      any,
      {}
    >;
    if (!action.meta) {
      throw new Error(
        `You are getting metaActionHandlers for action '${item.type}', but none are registered.`
      );
    }
    return Object.fromEntries(
      Object.entries(action.meta).map(([key, value]) => [
        key,
        () => (value as MetaActionHandler)(item.payload, item.type),
      ])
    ) as LinkedMetaActions<MR>;
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
    getMetaActionHandlers,
  };
};

const shiftStack = (
  from: Action[],
  setFrom: StackSetter,
  setTo: StackSetter,
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
  MR extends MetaActionReturnTypes = undefined
>(
  stateUpdaters: {
    [K in keyof PBT]: UndoableStateUpdaterWithMeta<PBT[K], S, MR>;
  }
) => ({
  reducer: ((state, { payload, type, meta }) => {
    const updater = stateUpdaters[type];
    return updater
      ? meta && meta.isUndo
        ? updater.undo(payload)(state)
        : updater.do(payload)(state)
      : state; // TODO: when no handler found return state or throw error?
  }) as UndoableReducer<S, PBT>,
  actionCreators: Object.fromEntries(
    Object.keys(stateUpdaters).map(type => [
      type,
      {
        do: payload => ({
          type,
          payload,
        }),
        undo: payload => ({
          type,
          payload,
        }),
      },
    ])
  ) as UndoableActionCreatorsByType<PBT>,
  ...({
    metaActionHandlers: Object.fromEntries(
      Object.keys(stateUpdaters).map(<T extends keyof PBT>(type: T) => [
        type,
        (stateUpdaters[type] as UndoableStateUpdaterWithMeta<any, any, {}>)
          .meta,
      ])
    ),
  } as MR extends undefined
    ? {}
    : {
        metaActionHandlers: MetaActionHandlersByType<PBT, MR>;
      }),
});

export const bindUndoableActionCreators = <PBT extends PayloadByType>(
  dispatch: UndoableDispatch<PBT>,
  actionCreators: UndoableActionCreatorsByType<PBT>
) =>
  (Object.fromEntries(
    Object.entries(actionCreators).map(([type, creator]) => [
      type,
      {
        do: (payload: any) => dispatch(creator.do(payload)),
        undo: (payload: any) => dispatch(creator.undo(payload)),
      },
    ])
  ) as any) as HandlersByType<PBT>;

export const useUndoableReducer = <S, PBT extends PayloadByType>(
  reducer: UndoableReducer<S, PBT>,
  initialState: S,
  actionCreators: UndoableActionCreatorsByType<PBT>
) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  // Is it ok to memoize in a custom hook, i.e. to assume
  // that the user does not mutate actionCreators?
  const boundActionCreators = useMemo(
    () => bindUndoableActionCreators(dispatch, actionCreators),
    [actionCreators]
  );
  return {
    state,
    boundActionCreators,
  };
};
