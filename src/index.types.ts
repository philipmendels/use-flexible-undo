import { Dispatch } from 'react';

export type PayloadByType<T extends string = string, P = any> = Record<T, P>;

type PayloadHandler<P> = (payload: P) => void;

export type HandlersByType<PBT extends PayloadByType> = {
  [K in keyof PBT]: PayloadHandler<PBT[K]>;
};

type StateUpdater<P, S> = (payload: P) => (state: S) => S;

type Undoable<T> = {
  do: T;
  undo: T;
};

type UndoableHandler<P> = Undoable<PayloadHandler<P>>;

type UndoableStateUpdater<P, S> = Undoable<StateUpdater<P, S>>;

type WithType<O extends object> = O & {
  type: string;
};

export type MetaActionReturnTypes = Record<string, any> | undefined;

export type MetaActionHandler<P = any, R = any> = (
  payload: P,
  type: string
) => R;

type MetaActionHandlers<P, MR extends MetaActionReturnTypes> = {
  [K in keyof MR]: MetaActionHandler<P, MR[K]>;
};

export type MetaActionHandlersByType<
  PBT extends PayloadByType,
  MR extends MetaActionReturnTypes
> = { [K in keyof PBT]: MetaActionHandlers<PBT[K], MR> };

type WithMeta<
  O extends object,
  P,
  MR extends MetaActionReturnTypes
> = MR extends undefined
  ? O
  : O & {
      meta: MetaActionHandlers<P, MR>;
    };

export type UndoableEffectWithMeta<
  P,
  MR extends MetaActionReturnTypes
> = WithMeta<UndoableHandler<P>, P, MR>;

export type UndoableEffectWithMetaAndType<
  P,
  MR extends MetaActionReturnTypes
> = WithType<UndoableEffectWithMeta<P, MR>>;

export type UndoableStateUpdaterWithMeta<
  P,
  S,
  MR extends MetaActionReturnTypes
> = WithMeta<UndoableStateUpdater<P, S>, P, MR>;

export type LinkedMetaActions<MR extends MetaActionReturnTypes> = {
  [K in keyof MR]: () => MR[K];
};

export interface Action<T = string, P = any> {
  type: T;
  payload: P;
}

export type StackSetter = Dispatch<React.SetStateAction<Action[]>>;

export type UndoableAction<T, P> = Action<T, P> & {
  meta?: {
    isUndo?: boolean;
  };
};

type UndoableActionUnion<PBT extends PayloadByType> = {
  [T in keyof PBT]: UndoableAction<T, PBT[T]>;
}[keyof PBT];

type UndoableActionCreator<PBT extends PayloadByType, T extends keyof PBT> = (
  payload: PBT[T]
) => UndoableAction<T, PBT[T]>;

export type UndoableActionCreatorsByType<PBT extends PayloadByType> = {
  [T in keyof PBT]: Undoable<UndoableActionCreator<PBT, T>>;
};

export type UndoableReducer<S, PBT extends PayloadByType> = (
  state: S,
  action: UndoableActionUnion<PBT>
) => S;

export type UndoableDispatch<PBT extends PayloadByType> = Dispatch<
  UndoableActionUnion<PBT>
>;
