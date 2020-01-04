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

type WithType<O extends object, T extends string | number | symbol> = O & {
  type: T;
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

export type UndoableHandlerWithMeta<
  P,
  MR extends MetaActionReturnTypes
> = WithMeta<UndoableHandler<P>, P, MR>;

export type UndoableHandlerWithMetaAndTypeByType<
  PBT extends PayloadByType,
  MR extends MetaActionReturnTypes
> = {
  [K in keyof PBT]: WithType<UndoableHandlerWithMeta<PBT[K], MR>, K>;
};

export type UndoableHandlerWithMetaAndType<
  PBT extends PayloadByType,
  MR extends MetaActionReturnTypes
> = UndoableHandlerWithMetaAndTypeByType<PBT, MR>[keyof PBT];

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

export type ActionUnion<PBT extends PayloadByType> = {
  [T in keyof PBT]: Action<T, PBT[T]>;
}[keyof PBT];

// export type ActionUnion<
//   PBT extends PayloadByType | undefined
// > = PBT extends undefined
//   ? Action
//   : {
//       [T in keyof PBT]: Action<T, PBT[T]>;
//     }[keyof PBT];

export type StackSetter<A extends Action> = Dispatch<React.SetStateAction<A[]>>;

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

export type ValueOf<T> = T[keyof T];

export type PickByValue<T, V extends ValueOf<T>> = Pick<
  T,
  {
    [K in keyof T]: T[K] extends V ? K : never;
  }[keyof T]
>;
