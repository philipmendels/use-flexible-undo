import { Dispatch } from 'react';

export type PayloadByType<T extends string = string, P = any> = Record<T, P>;

export type PayloadHandler<P, R = void> = (payload: P) => R;

export type HandlersByType<PBT extends PayloadByType> = {
  [K in keyof PBT]: PayloadHandler<PBT[K]>;
};

export type StateUpdater<P, S> = (payload: P) => (state: S) => S;

export type StateUpdatersByType<S, PBT extends PayloadByType> = {
  [K in keyof PBT]: StateUpdater<PBT[K], S>;
};

export type Undoable<T> = {
  drdo: T;
  undo: T;
};

export type UndoableHandler<P, R = void> = Undoable<PayloadHandler<P, R>>;

export type UndoableHandlersByType<PBT extends PayloadByType> = {
  [K in keyof PBT]: UndoableHandler<PBT[K]>;
};

export type UndoableStateUpdater<P, S> = Undoable<StateUpdater<P, S>>;

export type UndoableStateUpdatersByType<S, PBT extends PayloadByType> = {
  [K in keyof PBT]: UndoableStateUpdater<PBT[K], S>;
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

export type ActionCreator<PBT extends PayloadByType, T extends keyof PBT> = (
  payload: PBT[T]
) => BaseAction<T, PBT[T]>;

export type ActionCreatorsByType<PBT extends PayloadByType> = {
  [T in keyof PBT]: ActionCreator<PBT, T>;
};

export type Action<T = string, P = any> = BaseAction<T, P> & {
  created: Date;
  id: string;
};

export type ActionUnion<PBT extends PayloadByType> = {
  [T in keyof PBT]: Action<T, PBT[T]>;
}[keyof PBT];

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

export type UActionUnion<PBT extends PayloadByType> = {
  [T in keyof PBT]: UAction<T, PBT[T]>;
}[keyof PBT];

export type UActionCreator<PBT extends PayloadByType, T extends keyof PBT> = (
  payload: PBT[T]
) => UAction<T, PBT[T]>;

export type UActionCreatorsByType<PBT extends PayloadByType> = {
  [T in keyof PBT]: UActionCreator<PBT, T>;
};

export type UndoableUActionCreatorsByType<PBT extends PayloadByType> = {
  [T in keyof PBT]: Undoable<UActionCreator<PBT, T>>;
};

export type UReducer<S, PBT extends PayloadByType> = (
  state: S,
  action: UActionUnion<PBT>
) => S;

export type Reducer<S, PBT extends PayloadByType> = (
  state: S,
  action: BaseActionUnion<PBT>
) => S;

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

export interface UFUProps<PBT extends PayloadByType> {
  handlers: UndoableHandlersByType<PBT>;
  options?: UFUOptions;
  initialHistory?: History<PBT>;
}

export interface PositionOnBranch {
  globalIndex: number;
  actionId: string;
}

export interface ParentConnection {
  branchId: string;
  position: PositionOnBranch;
}

export interface Branch<PBT extends PayloadByType> {
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
  stack: ActionUnion<PBT>[];
}

export interface BranchConnection<PBT extends PayloadByType> {
  position: PositionOnBranch;
  branches: Branch<PBT>[];
}

export interface History<PBT extends PayloadByType> {
  branches: Record<string, Branch<PBT>>;
  currentBranchId: string;
  currentPosition: PositionOnBranch;
}

export type BranchSwitchModus =
  | 'LAST_COMMON_ACTION_IF_PAST'
  | 'LAST_COMMON_ACTION'
  | 'HEAD_OF_BRANCH'
  | 'LAST_KNOWN_POSITION_ON_BRANCH';

export type UndoMap<PBT extends PayloadByType> = {
  [K in keyof PBT]: (payload: PBT[K]) => BaseActionUnion<PBT>;
};

export interface UseUnducerProps<S, PBT extends PayloadByType> {
  options?: UFUOptions;
  initialHistory?: History<PBT>;
  reducer: UReducer<S, PBT>;
  initialState: S;
  actionCreators: UndoableUActionCreatorsByType<PBT>;
}
