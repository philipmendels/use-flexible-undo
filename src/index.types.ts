export interface UndoableAction<P> {
  type: string;
  do: (payload: P) => void;
  undo: (payload: P) => void;
}

export interface CustomActions<
  P,
  C extends CustomActionsDefinition | undefined
> {
  custom: {
    [K in keyof C]: (payload: P, type: string) => C[K];
  };
}

export interface CustomActionsDefinition {
  [key: string]: any;
}

export type CustomAction<P = any, R = any> = (payload: P, type: string) => R;

export type WrappedCustomActions<C> = {
  [K in keyof C]: () => C[K];
};

export interface UndoStackItem<P = any> {
  type: string;
  payload: P;
}

export type InferredAction<
  P,
  C extends CustomActionsDefinition | undefined
> = C extends undefined
  ? UndoableAction<P>
  : UndoableAction<P> & CustomActions<P, C>;

export type UndoStackSetter = React.Dispatch<
  React.SetStateAction<UndoStackItem[]>
>;
