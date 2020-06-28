import {
  PayloadFromTo,
  Updater,
  PayloadHandler,
  Undoable,
  PayloadByType,
  UReducer,
  UndoableUActionCreatorsByType,
  UDispatch,
  UndoableHandlersByType,
  UpdaterMaker,
  UndoableStateUpdatersByType,
} from './index.types';
import { mapObject, makeActionCreator } from './util-internal';
import { SetStateAction } from 'react';

export const combineHandlers = <P, R>(
  drdo: PayloadHandler<P, R>,
  undo: PayloadHandler<P, R>
): Undoable<PayloadHandler<P, R>> => ({
  drdo,
  undo,
});

export const invertHandlers = <P, R>({
  drdo,
  undo,
}: Undoable<PayloadHandler<P, R>>) => combineHandlers(undo, drdo);

export const makeHandler = <S, R>(
  stateSetter: (stateUpdater: Updater<S>) => R
) => <P = S>(
  updaterMaker: UpdaterMaker<P, S>
): PayloadHandler<P, R> => payload => stateSetter(updaterMaker(payload));

export const makeUndoableHandler = <S, R>(
  stateSetter: (stateUpdater: Updater<S>) => R
) => <P = S>(
  updaterForDrdoMaker: UpdaterMaker<P, S>,
  updaterForUndoMaker: UpdaterMaker<P, S>
) =>
  combineHandlers<P, R>(
    payload => stateSetter(updaterForDrdoMaker(payload)),
    payload => stateSetter(updaterForUndoMaker(payload))
  );

type InferState<S> = S extends SetStateAction<infer S2> ? S2 : S;

export const makeUndoableFTObjHandler = <S, R>(stateSetter: (s: S) => R) =>
  combineHandlers<PayloadFromTo<InferState<S>>, R>(
    ({ to }) => stateSetter(to),
    ({ from }) => stateSetter(from)
  );

export const makeUndoableFTTupleHandler = <S, R>(
  stateSetter: (s: SetStateAction<S>) => R
) =>
  combineHandlers<[S, S], R>(
    ([_, to]) => stateSetter(to),
    ([from]) => stateSetter(from)
  );

export const makeUndoableStateDepHandler = <S1, S2, P, R>(
  stateUpdaterMaker: (um: UpdaterMaker<S1, S2>) => (payload: P) => R
) => (
  updaterForDrdoMaker: UpdaterMaker<S1, S2>,
  updaterForUndoMaker: UpdaterMaker<S1, S2>
) =>
  combineHandlers<P, R>(
    stateUpdaterMaker(updaterForDrdoMaker),
    stateUpdaterMaker(updaterForUndoMaker)
  );

export const convertHandler = <P, R>(handler: PayloadHandler<P, R>) => <P2 = P>(
  convertor: (p2: P2) => P
) => (payload: P2) => handler(convertor(payload));

export const wrapFTObjHandler = <S, R>(
  handler: PayloadHandler<PayloadFromTo<S>, R>,
  state: S
) => <P = S>(updater: UpdaterMaker<P, S>): PayloadHandler<P, R> => payload =>
  handler({ from: state, to: updater(payload)(state) });

export const wrapFTTupleHandler = <S, R>(
  handler: PayloadHandler<[S, S], R>,
  state: S
) => <P = S>(updater: UpdaterMaker<P, S>): PayloadHandler<P, R> => payload =>
  handler([state, updater(payload)(state)]);

export const makeUndoableReducer = <S, PBT extends PayloadByType>(
  stateUpdaters: UndoableStateUpdatersByType<S, PBT>
) => ({
  reducer: ((state, { payload, type, meta }) => {
    const updater = stateUpdaters[type];
    return updater
      ? meta && meta.isUndo
        ? updater.undo(payload)(state)
        : updater.drdo(payload)(state)
      : state; // TODO: when no handler found return state or throw error?
  }) as UReducer<S, PBT>,
  actionCreators: mapObject(stateUpdaters)<UndoableUActionCreatorsByType<PBT>>(
    ([type, _]) => [
      type,
      {
        drdo: makeActionCreator(type),
        undo: makeActionCreator(type, true),
      },
    ]
  ),
});

export const bindUndoableActionCreators = <PBT extends PayloadByType>(
  dispatch: UDispatch<PBT>,
  actionCreators: UndoableUActionCreatorsByType<PBT>
): UndoableHandlersByType<PBT> =>
  mapObject(actionCreators)<UndoableHandlersByType<PBT>>(([type, creator]) => [
    type,
    {
      drdo: payload => dispatch(creator.drdo(payload)),
      undo: payload => dispatch(creator.undo(payload)),
    },
  ]);
