import { useCallback, useRef } from 'react';

import { useLatest } from './hooks/use-latest';
import { useUndoRedo } from './hooks/use-undo-redo';

import { makeUndoableHandlersFromDispatch } from './util';

import {
  ExtractKeyByValue,
  MetaActionHandlersByType,
  MetaActionReturnTypes,
  PayloadByType,
  StringOnlyKeyOf,
  UDispatch,
  UndoableHandlerWithMeta,
  UndoableHandlerWithMetaAndType,
  UndoableHandlerWithMetaByType,
  UndoableUActionCreatorsByType,
  ValueOf,
  UFUProps,
  HandlersWithUndefinedByType,
  PayloadHandlerWithUndefined,
  PBT_Inferred,
} from './index.types';

export const useFlexibleUndo = <
  PBT_All extends PayloadByType | undefined = undefined,
  MR extends MetaActionReturnTypes = undefined
>({ callbacks = {}, ...rest }: UFUProps<PBT_Inferred<PBT_All>, MR> = {}) => {
  type PBT_Inf = PBT_Inferred<PBT_All>;
  type PBT_Partial = Partial<PBT_Inf>;
  type P_All = ValueOf<PBT_Inf>;
  type NMR = NonNullable<MR>;

  type Handlers = UndoableHandlerWithMetaByType<PBT_Inf, MR>;

  const handlersRef = useRef<Handlers>({} as Handlers);

  const { onMakeUndoables, latest = {}, ...callbacksRest } = callbacks;
  const { onMakeUndoables: onMakeUndoablesLatest, ...latestRest } = latest;
  const onMakeUndoablesLatestRef = useLatest(onMakeUndoablesLatest);

  const { createUndoables, ...undoRedoRest } = useUndoRedo({
    handlers: handlersRef,
    callbacks: { ...callbacksRest, latest: latestRest },
    ...rest,
  });

  const makeUndoables = useCallback(
    <PBT extends PBT_Partial>(
      handlers: {
        [K in StringOnlyKeyOf<PBT>]: UndoableHandlerWithMeta<PBT[K], K, MR>;
      }
    ): HandlersWithUndefinedByType<PBT> => {
      handlersRef.current = { ...handlersRef.current, ...handlers };
      const types = Object.keys(handlers) as StringOnlyKeyOf<PBT_Inf>[];
      onMakeUndoables?.(types);
      onMakeUndoablesLatestRef.current?.(types);
      return createUndoables(handlers) as HandlersWithUndefinedByType<PBT>;
    },
    [onMakeUndoables, onMakeUndoablesLatestRef, createUndoables]
  );

  const makeUndoable = useCallback(
    <P extends P_All>(
      handler: UndoableHandlerWithMetaAndType<
        P,
        ExtractKeyByValue<PBT_Inf, P>,
        MR
      >
    ): PayloadHandlerWithUndefined<P> => {
      const { type, ...rest } = handler;
      return makeUndoables({ [type]: rest } as any)[type as any];
    },
    [makeUndoables]
  );

  const makeUndoablesFromDispatch = useCallback(
    <PBT extends PBT_Partial>(
      dispatch: UDispatch<PBT>,
      actionCreators: UndoableUActionCreatorsByType<PBT>,
      ...metaActionHandlers: MR extends undefined
        ? []
        : [MetaActionHandlersByType<PBT, NMR>]
    ): HandlersWithUndefinedByType<PBT> =>
      makeUndoables(
        makeUndoableHandlersFromDispatch(
          dispatch,
          actionCreators,
          ...metaActionHandlers
        )
      ),
    [makeUndoables]
  );

  return {
    makeUndoable,
    makeUndoables,
    makeUndoablesFromDispatch,
    ...undoRedoRest,
  };
};
