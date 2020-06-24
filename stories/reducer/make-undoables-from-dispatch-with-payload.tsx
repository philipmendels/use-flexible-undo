import React, { FC } from 'react';
import {
  useFlexibleUndo,
  makeUndoableReducer,
  PayloadFromTo,
  Updater,
  UpdaterMaker,
  makeUndoableStateDepHandler,
  merge,
  invertHandlers,
  makeUndoableFTObjHandler,
  useUndoableReducer,
} from '../../.';
import { ActionList } from '../components/action-list';
import { topUIStyle, rootStyle } from '../styles';
import { NumberInput } from '../components/number-input';

type Nullber = number | null;

interface State {
  count: number;
  amount: Nullber;
}

interface PayloadByType {
  add: boolean;
  subtract: boolean;
  updateAmount: PayloadFromTo<Nullber>;
}

const makeCountHandler = (um: UpdaterMaker<number>) => (
  shouldDouble: boolean
): Updater<State> => prev =>
  prev.amount
    ? {
        ...prev,
        count: um(shouldDouble ? prev.amount * 2 : prev.amount)(prev.count),
      }
    : prev;

const undoableAddHandler = makeUndoableStateDepHandler(makeCountHandler)(
  amount => prev => prev + amount,
  amount => prev => prev - amount
);

const { reducer, actionCreators } = makeUndoableReducer<State, PayloadByType>({
  add: undoableAddHandler,
  subtract: invertHandlers(undoableAddHandler),
  updateAmount: makeUndoableFTObjHandler(amount => merge({ amount })),
});

export const MakeUndoablesFromDispatchWithPayloadExample: FC = () => {
  const [{ count, amount }, handlers] = useUndoableReducer(
    reducer,
    {
      count: 0,
      amount: 1,
    },
    actionCreators
  );

  const {
    undoables,
    canUndo,
    undo,
    canRedo,
    redo,
    history,
    timeTravel,
    switchToBranch,
  } = useFlexibleUndo<PayloadByType>({
    handlers,
  });

  const { add, subtract, updateAmount } = undoables;

  return (
    <div className={rootStyle}>
      <div>count = {count}</div>
      <div className={topUIStyle}>
        <label>
          amount:&nbsp;
          <NumberInput
            value={amount}
            onChange={value =>
              updateAmount({
                from: amount,
                to: value,
              })
            }
          />
        </label>
        <button disabled={!amount} onClick={() => add(false)}>
          add
        </button>
        <button disabled={!amount} onClick={() => add(true)}>
          add double
        </button>
        <button disabled={!amount} onClick={() => subtract(false)}>
          subtract
        </button>
        <button disabled={!canUndo} onClick={() => undo()}>
          undo
        </button>
        <button disabled={!canRedo} onClick={() => redo()}>
          redo
        </button>
      </div>
      <ActionList
        history={history}
        timeTravel={timeTravel}
        switchToBranch={switchToBranch}
      />
    </div>
  );
};
