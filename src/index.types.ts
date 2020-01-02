export type PayloadByType<T extends string = string, P = any> = Record<T, P>;

type PayloadEffect<P> = (payload: P) => void;

export type EffectsByType<PBT extends PayloadByType> = {
  [K in keyof PBT]: PayloadEffect<PBT[K]>;
};

type PayloadHandler<P, S> = (payload: P) => (state: S) => S;

type Undoable<T> = {
  do: T;
  undo: T;
};

type UndoableEffect<P> = Undoable<PayloadEffect<P>>;

type UndoableHandler<P, S> = Undoable<PayloadHandler<P, S>>;

type WithType<O extends object> = O & {
  type: string;
};

export type MetaActionReturnTypes = Record<string, any> | undefined;

export type MetaAction<P = any, R = any> = (payload: P, type: string) => R;

type MetaActions<P, MR extends MetaActionReturnTypes> = {
  [K in keyof MR]: MetaAction<P, MR[K]>;
};

export type MetaActionsByType<
  PBT extends PayloadByType,
  MR extends MetaActionReturnTypes
> = { [K in keyof PBT]: MetaActions<PBT[K], MR> };

type WithMeta<
  O extends object,
  P,
  MR extends MetaActionReturnTypes
> = MR extends undefined
  ? O
  : O & {
      meta: MetaActions<P, MR>;
    };

export type UndoableEffectWithMeta<
  P,
  MR extends MetaActionReturnTypes
> = WithMeta<UndoableEffect<P>, P, MR>;

export type UndoableEffectWithMetaAndType<
  P,
  MR extends MetaActionReturnTypes
> = WithType<UndoableEffectWithMeta<P, MR>>;

export type UndoableHandlerWithMeta<
  P,
  S,
  MR extends MetaActionReturnTypes
> = WithMeta<UndoableHandler<P, S>, P, MR>;

export type LinkedMetaActions<MR extends MetaActionReturnTypes> = {
  [K in keyof MR]: () => MR[K];
};

export interface UndoStackItem<P = any> {
  type: string;
  payload: P;
}

export type UndoStackSetter = React.Dispatch<
  React.SetStateAction<UndoStackItem[]>
>;

export interface UndoableAction<T, P> {
  type: T;
  payload: P;
  undo?: boolean;
}

// typing action param as UAction<T, PBT[T]> is good enough for
// directly calling the reducer but not good enough for calling the
// dispatch function that is returned from useReducer.
export type UActions<PBT extends PayloadByType> = {
  [T in keyof PBT]: UndoableAction<T, PBT[T]>;
}[keyof PBT];

export type UActionCreatorsByType<PBT extends PayloadByType> = {
  [T in keyof PBT]: (
    payload: PBT[T],
    undo?: boolean
  ) => UndoableAction<T, PBT[T]>;
};
