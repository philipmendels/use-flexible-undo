/**
 * Base action map with unique type and do/undo actions.
 */
export interface UndoableAction<P> {
  type: string; //unique name
  do: (payload: P) => void;
  undo: (payload: P) => void;
}

/**
 * Definition for extending the base action map
 * with custom actions. Keys are mapped to
 * action names and values to action return types.
 */
export interface CustomActionsDefinition {
  [key: string]: any;
}

export type InferredAction<
  P,
  C extends CustomActionsDefinition | undefined
> = C extends undefined
  ? UndoableAction<P>
  : UndoableAction<P> & CustomActions<P, C>;

export interface CustomActions<
  P,
  C extends CustomActionsDefinition | undefined
> {
  custom: {
    [K in keyof C]: CustomAction<P, C[K]>;
  };
}

export type CustomAction<P = any, R = any> = (payload: P, type: string) => R;

export type WrappedCustomActions<C> = {
  [K in keyof C]: () => C[K];
};

export interface UndoStackItem<P = any> {
  type: string;
  payload: P;
}

export type UndoStackSetter = React.Dispatch<
  React.SetStateAction<UndoStackItem[]>
>;
