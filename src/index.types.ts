import { Dispatch, Reducer } from 'react';

export type PayloadByType<T extends string = string, P = any> = Record<T, P>;

export type PayloadHandler<P, R = void> = (payload: P) => R;

export type HandlersByType<A extends BaseAction> = {
  [T in A['type']]: PayloadHandler<IsA<T, A>['payload']>;
};

export type StateUpdater<P, S> = (payload: P) => (state: S) => S;

export type StateUpdatersByType<S, A extends BaseAction> = {
  [T in A['type']]: StateUpdater<IsA<T, A>['payload'], S>;
};

export type Undoable<T> = {
  drdo: T;
  undo: T;
};

export type UndoableHandler<P, R = void> = Undoable<PayloadHandler<P, R>>;

export type UndoableHandlersByType<A extends BaseAction> = {
  [T in A['type']]: UndoableHandler<IsA<T, A>['payload']>;
};

export type UndoableStateUpdater<P, S> = Undoable<StateUpdater<P, S>>;

export type UndoableStateUpdatersByType<S, A extends UAction> = {
  [T in A['type']]: UndoableStateUpdater<IsA<T, A>['payload'], S>;
};

// Not a generic solution, just ok for this project
export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends Array<any>
    ? T[K]
    : T[K] extends {} | undefined
    ? DeepPartial<T[K]>
    : T[K];
};

export type BaseAction<T = string, P = any> = P extends void | undefined
  ? {
      type: T;
      payload?: P;
    }
  : {
      type: T;
      payload: P;
    };

export type BaseActionUnion<PBT extends PayloadByType> = {
  [T in keyof PBT]: BaseAction<T, PBT[T]>;
}[keyof PBT];

export type ActionCreator<P, T> = (payload: P) => BaseAction<T, P>;

type IsA<T, A> = A extends Record<'type', T> ? A : never;

export type ActionCreatorsByType<A extends BaseAction> = {
  [T in A['type']]: ActionCreator<IsA<T, A>['payload'], T>;
};

export type UActionCreator<P, T> = (payload: P) => UAction<T, P>;

export type UActionCreatorsByType<A extends UAction> = {
  [T in A['type']]: UActionCreator<IsA<T, A>['payload'], T>;
};

export type UndoableUActionCreatorsByType<A extends UAction> = {
  [T in A['type']]: Undoable<UActionCreator<IsA<T, A>['payload'], T>>;
};

export type Action<T = string, P = any> = BaseAction<T, P> & {
  created: Date;
  id: string;
};

export type ActionUnion<PBT extends PayloadByType> = {
  [T in keyof PBT]: Action<T, PBT[T]>;
}[keyof PBT];

// export type UAction<T = string, P = any> = BaseAction<T, P> & {
//   meta?: {
//     isUndo?: boolean;
//   };
// };

export type UAction<T = string, P = any> = P extends void | undefined
  ? {
      type: T;
      payload?: P;
      meta?: {
        isUndo?: boolean;
      };
    }
  : {
      type: T;
      payload: P;
      meta?: {
        isUndo?: boolean;
      };
    };

export type UFUA<A> = {
  action: A;
  created: Date;
  id: string;
};

export type UActionUnion<PBT extends PayloadByType> = {
  [T in keyof PBT]: UAction<T, PBT[T]>;
}[keyof PBT];

export type UReducer<S, PBT extends PayloadByType> = (
  state: S,
  action: UActionUnion<PBT>
) => S;

// export type Reducer<S, PBT extends PayloadByType> = (
//   state: S,
//   action: BaseActionUnion<PBT>
// ) => S;

export type UDispatch<PBT extends PayloadByType> = Dispatch<UActionUnion<PBT>>;
export type DispatchPBT<PBT extends PayloadByType> = Dispatch<
  BaseActionUnion<PBT>
>;

export type ValueOf<T> = T[keyof T];

export type Entry<O extends Object> = { [K in keyof O]: [K, O[K]] }[keyof O];

export interface PayloadFromTo<T> {
  from: T;
  to: T;
}

export type Updater<T> = (prev: T) => T;
export type CurriedUpdater<T> = (payload: T) => Updater<T>;
export type UpdaterMaker<P, S = P> = (payload: P) => Updater<S>;

export interface UFUOptions {
  clearFutureOnDo?: boolean;
}

export interface UFUProps<A extends BaseAction> {
  handlers: UndoableHandlersByType<A>;
  options?: UFUOptions;
  initialHistory?: History<A>;
}

export interface PositionOnBranch {
  globalIndex: number;
  actionId: string;
}

export interface ParentConnection {
  branchId: string;
  position: PositionOnBranch;
}

export interface Branch<A> {
  id: string;
  number: number;
  parent?: {
    branchId: string;
    position: PositionOnBranch;
  };
  parentOriginal?: {
    branchId: string;
    position: PositionOnBranch;
  };
  lastPosition?: PositionOnBranch;
  created: Date;
  stack: UFUA<A>[];
}

export interface BranchConnection<A> {
  position: PositionOnBranch;
  branches: Branch<A>[];
}

export interface History<A> {
  branches: Record<string, Branch<A>>;
  currentBranchId: string;
  currentPosition: PositionOnBranch;
}

export type BranchSwitchModus =
  | 'LAST_COMMON_ACTION_IF_PAST'
  | 'LAST_COMMON_ACTION'
  | 'HEAD_OF_BRANCH'
  | 'LAST_KNOWN_POSITION_ON_BRANCH';

export type UndoMap<A extends BaseAction> = {
  [T in A['type']]: A extends Record<'type', T> ? A : never;
};

export type PBT2<A extends UAction<string, any>> = {
  [T in A['type']]: (A extends Record<'type', T> ? A : never)['payload'];
};

export interface UseUnducerProps<S, A extends UAction<string, any>> {
  options?: UFUOptions;
  initialHistory?: History<A>;
  reducer: Reducer<S, A>;
  initialState: S;
  actionCreators: UndoableUActionCreatorsByType<A>;
}
