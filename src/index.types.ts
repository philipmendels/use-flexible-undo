export type PayloadEffect<P> = (payload: P) => void;
type PayloadHandler<P, S> = (payload: P) => (state: S) => S;

type Undoable<T> = {
  do: T;
  undo: T;
};

export type UndoableEffect<P> = Undoable<PayloadEffect<P>>;

export type UndoableHandler<P, S> = Undoable<PayloadHandler<P, S>>;

export type WithType<O extends object> = O & {
  type: string;
};

export type WithOptionalType<O extends object> = O & {
  type?: string;
};

// export type UndoableEffectWithType<P> = WithType<UndoableEffect<P>>;
// export type UndoableHandlerWithType<P, S> = WithType<UndoableHandler<P, S>>;

export type MetaAction<P = any, R = any> = (payload: P, type: string) => R;

export type MetaActionReturnTypes = Record<string, any> | undefined;

type WithMeta<
  O extends object,
  P,
  MR extends MetaActionReturnTypes
> = MR extends undefined
  ? O
  : O & {
      meta: { [K in keyof MR]: MetaAction<P, MR[K]> };
    };

export type UndoableEffectWithMeta<
  P,
  MR extends MetaActionReturnTypes
> = WithMeta<UndoableEffect<P>, P, MR>;

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

export type PayloadByType<T extends string = string, P = any> = Record<T, P>;

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

export type EffectsByType<PBT extends PayloadByType> = {
  [K in keyof PBT]: PayloadEffect<PBT[K]>;
};
