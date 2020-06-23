import React, { FC, useState } from 'react';
import {
  useFlexibleUndo,
  makeUndoableReducer,
  makeUndoableFTObjHandler,
  PayloadFromTo,
  Updater,
  invertHandlers,
  makeUndoableHandler,
  useUndoableReducer,
} from '../../.';
import { ActionList } from '../components/action-list';
import { ui, root } from '../styles';
import { NumberInput } from '../components/number-input';

interface State {
  count: number;
}

interface PayloadByType_Reducer {
  add: number;
  subtract: number;
}

type Nullber = number | null;

interface PayloadByType extends PayloadByType_Reducer {
  updateAmount: PayloadFromTo<Nullber>;
}

const makeCountHandler = (
  updater: Updater<number>
): Updater<State> => state => ({
  ...state,
  count: updater(state.count),
});

const undoableAddHandler = makeUndoableHandler(makeCountHandler)(
  amount => prev => prev + amount,
  amount => prev => prev - amount
);

const { reducer, actionCreators } = makeUndoableReducer<
  State,
  PayloadByType_Reducer
>({
  add: undoableAddHandler,
  subtract: invertHandlers(undoableAddHandler),
});

export const MakeUndoablesFromDispatchExample3: FC = () => {
  const [{ count }, handlers] = useUndoableReducer(
    reducer,
    { count: 0 },
    actionCreators
  );
  const [amount, setAmount] = useState<Nullber>(1);

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
    handlers: {
      ...handlers,
      updateAmount: makeUndoableFTObjHandler(setAmount),
    },
  });

  const { add, subtract, updateAmount } = undoables;

  return (
    <div className={root}>
      <div>count = {count}</div>
      <div className={ui}>
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
        <button disabled={!amount} onClick={() => amount && add(amount)}>
          add
        </button>
        <button disabled={!amount} onClick={() => amount && subtract(amount)}>
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
