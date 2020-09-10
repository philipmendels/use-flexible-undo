import { Dispatch, Reducer as ReducerReact } from 'react';

export type PayloadByType<T extends string = string, P = any> = Record<T, P>;

export type PayloadHandler<P, R = void> = (payload: P) => R;

export type HandlersByType<PBT extends PayloadByType> = {
  [K in keyof PBT]: PayloadHandler<PBT[K]>;
};

export type HandlersWithOptionsByType<PBT extends PayloadByType> = {
  [K in keyof PBT]: (payload: PBT[K], clearFutureOnDo?: boolean) => void;
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

type Meta<M> = M extends void | undefined
  ? {
      meta?: M;
    }
  : {
      meta: M;
    };

export type Action<T = string, P = any, M = undefined> = P extends
  | void
  | undefined
  ? {
      type: T;
      payload?: P;
    } & Meta<M>
  : {
      type: T;
      payload: P;
    } & Meta<M>;

export type ActionUnion<PBT extends PayloadByType, M = undefined> = {
  [T in keyof PBT]: Action<T, PBT[T], M>;
}[keyof PBT];

export type ActionCreator<PBT extends PayloadByType, T extends keyof PBT> = (
  payload: PBT[T]
) => Action<T, PBT[T]>;

export type ActionCreatorsByType<PBT extends PayloadByType> = {
  [T in keyof PBT]: ActionCreator<PBT, T>;
};

export type HistoryItem<T = string, P = any> = Action<T, P> & {
  created: Date;
  id: string;
};

export type HistoryItemUnion<PBT extends PayloadByType> =
  | {
      [T in keyof PBT]: HistoryItem<T, PBT[T]>;
    }[keyof PBT]
  | HistoryItem<'start', void>;

export type UAction<T = string, P = any> = Action<
  T,
  P,
  {
    isUndo?: boolean;
  }
>;

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

export type URActionUnion<PBT extends PayloadByType> = ActionUnion<
  PBT,
  { isUndoable: true; clearFutureOnDo?: boolean }
>;

export type Unducer<S, PBT extends PayloadByType> = (
  state: S,
  action: UActionUnion<PBT>
) => S;

export type Reducer<S, PBT extends PayloadByType, M = undefined> = (
  state: S,
  action: ActionUnion<PBT, M>
) => S;

export type UDispatch<PBT extends PayloadByType> = Dispatch<UActionUnion<PBT>>;
export type DispatchPBT<PBT extends PayloadByType> = Dispatch<ActionUnion<PBT>>;

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

interface UFUCommonProps<PBT extends PayloadByType> {
  options?: UFUOptions;
  initialHistory?: History<PBT>;
}
export type UFUProps<PBT extends PayloadByType> = UFUCommonProps<PBT> &
  (
    | {
        handlers: UndoableHandlersByType<PBT>;
        drdoHandlers?: undefined;
        undoHandlers?: undefined;
      }
    | {
        handlers?: undefined;
        drdoHandlers: HandlersByType<PBT>;
        undoHandlers: HandlersByType<PBT>;
      }
  );

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
  stack: HistoryItemUnion<PBT>[];
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
  [K in keyof PBT]: (payload: PBT[K]) => ActionUnion<PBT>;
};

export type UndoableReducer<S, PBT extends PayloadByType> = ReducerReact<
  UndoableState<S, PBT>,
  ActionUnion<PBT_UndoableReducer> | URActionUnion<PBT>
>;

export interface UseUndoableReducerProps<S, PBT extends PayloadByType>
  extends UFUCommonProps<PBT> {
  initialState: S;
  undoableReducer: UndoableReducer<S, PBT>;
  actionCreators:
    | ActionCreatorsByType<PBT>
    | UndoableUActionCreatorsByType<PBT>;
}

export interface UndoableState<S, PBT> {
  history: History<PBT>;
  state: S;
}

export interface PBT_UndoableReducer {
  undo: void;
  redo: void;
  timeTravel: {
    indexOnBranch: number;
    branchId?: string;
  };
  timeTravelById: {
    actionId: string;
    branchId?: string;
  };
  switchToBranch: {
    branchId: string;
    travelTo?: BranchSwitchModus;
  };
}
