import { useCallback, useRef } from 'react';

import { useLatest } from './hooks/use-latest';
import { useUndoRedo } from './hooks/use-undo-redo';

import { makeUndoableHandlersFromDispatch } from './util';

import {
  ExtractKeyByValue,
  HandlersByType,
  MetaActionHandlersByType,
  MetaActionReturnTypes,
  PayloadByType,
  PayloadHandler,
  StringOnlyKeyOf,
  UDispatch,
  UndoableHandlerWithMeta,
  UndoableHandlerWithMetaAndType,
  UndoableHandlerWithMetaByType,
  UndoableUActionCreatorsByType,
  ValueOf,
  UFUProps,
} from './index.types';

export const useFlexibleUndo = <
  PBT_All extends PayloadByType | undefined = undefined,
  MR extends MetaActionReturnTypes = undefined
>({ callbacks = {}, ...rest }: UFUProps<NonNullable<PBT_All>, MR> = {}) => {
  type PBT_Inferred = PBT_All extends undefined ? PayloadByType : PBT_All;
  type PBT_Partial = Partial<PBT_Inferred>;
  type P_All = ValueOf<PBT_Inferred>;
  type NMR = NonNullable<MR>;

  type Handlers = UndoableHandlerWithMetaByType<PBT_Inferred, MR>;

  const handlersRef = useRef<Handlers>({} as Handlers);

  const { createUndoables, ...undoRedoRest } = useUndoRedo({
    handlers: handlersRef,
    ...rest,
  });

  const { onMakeUndoables, latest } = callbacks;
  const onMakeUndoablesLatestRef = useLatest(latest?.onMakeUndoables);

  const makeUndoables = useCallback(
    <PBT extends PBT_Partial>(
      handlers: {
        [K in StringOnlyKeyOf<PBT>]: UndoableHandlerWithMeta<PBT[K], K, MR>;
      }
    ): HandlersByType<PBT> => {
      handlersRef.current = { ...handlersRef.current, ...handlers };
      const types = Object.keys(handlers) as StringOnlyKeyOf<PBT_All>[];
      onMakeUndoables?.(types);
      onMakeUndoablesLatestRef.current?.(types);
      return createUndoables(handlers) as HandlersByType<PBT>;
    },
    [onMakeUndoables, onMakeUndoablesLatestRef, createUndoables]
  );

  const makeUndoable = useCallback(
    <P extends P_All>(
      handler: UndoableHandlerWithMetaAndType<
        P,
        ExtractKeyByValue<PBT_Inferred, P>,
        MR
      >
    ): PayloadHandler<P> => {
      const { type, ...rest } = handler;
      return makeUndoables({ [type as any]: rest } as any)[type as any];
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
    ): HandlersByType<PBT> =>
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
