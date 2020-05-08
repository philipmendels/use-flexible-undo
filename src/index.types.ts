import { Dispatch } from 'react';

export type PayloadByType<T extends string = string, P = any> = Record<T, P>;

export type PBT_Inferred<
  PBT_All extends PayloadByType | undefined
> = PBT_All extends undefined ? PayloadByType : PBT_All;

export type PayloadHandler<P, R = void> = (payload: P) => R;

export type HandlersByType<PBT extends PayloadByType> = {
  [K in StringOnlyKeyOf<PBT>]: PayloadHandler<PBT[K]>;
};

type StateUpdater<P, S> = (payload: P) => (state: S) => S;

export type Undoable<T> = {
  drdo: T;
  undo: T;
};

export type UndoableHandler<P, R = void> = Undoable<PayloadHandler<P, R>>;

export type UndoableHandlersByType<PBT extends PayloadByType> = {
  [K in StringOnlyKeyOf<PBT>]: UndoableHandler<PBT[K]>;
};

type UndoableStateUpdater<P, S> = Undoable<StateUpdater<P, S>>;

type WithType<O extends object, T extends string> = O & {
  type: T;
};

export type MetaActionReturnTypes = Record<string, any> | undefined;

type MetaActionHandler<P = any, R = any, T extends string = string> = (
  payload: P,
  type: T
) => R;

export type MetaActionHandlers<
  P,
  MR extends NonNullable<MetaActionReturnTypes>,
  T extends string
> = {
  [K in StringOnlyKeyOf<MR>]: MetaActionHandler<P, MR[K], T>;
};

export type MetaActionHandlersByType<
  PBT extends PayloadByType,
  MR extends NonNullable<MetaActionReturnTypes>
> = { [K in StringOnlyKeyOf<PBT>]: MetaActionHandlers<PBT[K], MR, K> };

type WithMeta<
  O extends object,
  P,
  MR extends MetaActionReturnTypes,
  T extends string
> = MR extends undefined
  ? O
  : O & {
      meta: MetaActionHandlers<P, NonNullable<MR>, T>;
    };

export type UndoableHandlerWithMeta<
  P,
  T extends string,
  MR extends MetaActionReturnTypes
> = WithMeta<UndoableHandler<P>, P, MR, T>;

export type UndoableHandlerWithMetaByType<
  PBT extends PayloadByType,
  MR extends MetaActionReturnTypes
> = {
  [K in StringOnlyKeyOf<PBT>]: UndoableHandlerWithMeta<PBT[K], K, MR>;
};

export type UndoableHandlerWithMetaAndType<
  P,
  T extends string,
  MR extends MetaActionReturnTypes
> = WithType<UndoableHandlerWithMeta<P, T, MR>, T>;

export type UndoableStateUpdaterWithMeta<
  P,
  S,
  MR extends MetaActionReturnTypes,
  T extends string
> = WithMeta<UndoableStateUpdater<P, S>, P, MR, T>;

export type LinkedMetaActions<MR extends NonNullable<MetaActionReturnTypes>> = {
  [K in StringOnlyKeyOf<MR>]: () => MR[K];
};

export type Action<T = string, P = any> = {
  type: T;
  created?: Date;
} & (P extends void | undefined
  ? {
      payload?: P;
    }
  : {
      payload: P;
    });

export type ActionUnion<PBT extends PayloadByType> = {
  [T in StringOnlyKeyOf<PBT>]: Action<T, PBT[T]>;
}[StringOnlyKeyOf<PBT>];

export type StackSetter<A extends Action> = Dispatch<React.SetStateAction<A[]>>;

export type UAction<T, P> = Action<T, P> & {
  meta?: {
    isUndo?: boolean;
  };
};

type UActionUnion<PBT extends PayloadByType> = {
  [T in StringOnlyKeyOf<PBT>]: UAction<T, PBT[T]>;
}[StringOnlyKeyOf<PBT>];

export type UActionCreator<
  PBT extends PayloadByType,
  T extends StringOnlyKeyOf<PBT>
> = (payload: PBT[T]) => UAction<T, PBT[T]>;

export type UndoableUActionCreatorsByType<PBT extends PayloadByType> = {
  [T in StringOnlyKeyOf<PBT>]: Undoable<UActionCreator<PBT, T>>;
};

export type UReducer<S, PBT extends PayloadByType> = (
  state: S,
  action: UActionUnion<PBT>
) => S;

export type UDispatch<PBT extends PayloadByType> = Dispatch<UActionUnion<PBT>>;

export type ValueOf<T> = T[StringOnlyKeyOf<T>];

export type ExtractKeyByValue<T, V extends ValueOf<T>> = Extract<
  StringOnlyKeyOf<T>,
  {
    [K in StringOnlyKeyOf<T>]: T[K] extends V ? K : never;
  }[StringOnlyKeyOf<T>]
>;

export type StringOnlyKeyOf<T> = Extract<keyof T, string>;

export type Entry<O extends Object> = { [K in keyof O]: [K, O[K]] }[keyof O];

export interface PayloadFromTo<T> {
  from: T;
  to: T;
}

export type PayloadTupleFromTo<T> = [T, T];

export type Updater<T> = (prev: T) => T;
export type CurriedUpdater<T> = (payload: T) => Updater<T>;
export type UpdaterMaker<P, S = P> = (payload: P) => Updater<S>;

export type TimeTravelFn = (
  direction: 'past' | 'future',
  index: number
) => void;

export type Stack<T = Action> = {
  past: T[];
  future: T[];
};

export type PBT_ALL_NN<
  PBT_All extends PayloadByType | undefined
> = PBT_All extends undefined ? PayloadByType : PBT_All;

export type EventName = 'do' | 'undo' | 'redo';

export interface CB_Args<
  PBT_Inferred extends PayloadByType,
  E extends EventName
> {
  action: ActionUnion<PBT_Inferred>;
  eventName: E;
}

export type CB_ArgsWithMeta<
  PBT_Inferred extends PayloadByType,
  MR extends MetaActionReturnTypes,
  E extends EventName
> = MR extends undefined
  ? CB_Args<PBT_Inferred, E>
  : CB_Args<PBT_Inferred, E> & { meta: LinkedMetaActions<NonNullable<MR>> };

export type CB<
  PBT_Inferred extends PayloadByType = PayloadByType,
  MR extends MetaActionReturnTypes = undefined,
  E extends EventName = EventName
> = (args: CB_ArgsWithMeta<PBT_Inferred, MR, E>) => any;

export interface CallbacksLight<
  PBT_Inferred extends PayloadByType,
  MR extends MetaActionReturnTypes
> {
  onDo?: CB<PBT_Inferred, MR, 'do'>;
  onRedo?: CB<PBT_Inferred, MR, 'redo'>;
  onUndo?: CB<PBT_Inferred, MR, 'undo'>;
  onDoRedo?: CB<PBT_Inferred, MR, 'do' | 'redo'>;
}

export type Callbacks<
  PBT_Inferred extends PayloadByType,
  MR extends MetaActionReturnTypes
> = CallbacksLight<PBT_Inferred, MR> & {
  onMakeUndoables?: (types: StringOnlyKeyOf<PBT_Inferred>[]) => any;
};

export interface UFUOptions {
  storeActionCreatedDate?: boolean;
  unstable_callHandlersFrom?: 'UPDATER' | 'EFFECT' | 'LAYOUT_EFFECT';
}

export interface UFUProps<
  PBT extends PayloadByType,
  MR extends MetaActionReturnTypes
> {
  callbacks?: Callbacks<PBT, MR> & {
    latest?: Callbacks<PBT, MR>;
  };
  options?: UFUOptions;
}

export interface UFULightProps<
  PBT extends PayloadByType,
  MR extends MetaActionReturnTypes
> {
  handlers: UndoableHandlerWithMetaByType<PBT, MR>;
  callbacks?: CallbacksLight<PBT, MR> & {
    latest?: CallbacksLight<PBT, MR>;
  };
  options?: UFUOptions;
}

export interface UseUndoRedoProps<
  PBT extends PayloadByType,
  MR extends MetaActionReturnTypes
> {
  handlers: {
    current: UndoableHandlerWithMetaByType<PBT, MR>;
  };
  callbacks?: CallbacksLight<PBT, MR> & {
    latest?: CallbacksLight<PBT, MR>;
  };
  options?: UFUOptions;
}
