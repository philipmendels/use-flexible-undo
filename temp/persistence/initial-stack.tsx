import React, { FC, useState } from 'react';
import {
  PayloadFromTo,
  useFlexibleUndo,
  makeUndoableFTHandler,
  makeUndoableHandler,
  invertHandlers,
} from '../../dist';
import { rootClass, uiContainerClass } from '../../stories/styles';
import { ActionList } from '../../stories/components/action-list';
import { NumberInput } from '../../stories/components/number-input';

type Nullber = number | null;

interface PayloadByType {
  add: number;
  subtract: number;
  updateAmount: PayloadFromTo<Nullber>;
}

export const InitialStackExample: FC = () => {
  const [count, setCount] = useState(0);
  const [amount, setAmount] = useState<Nullber>(1);

  const {
    makeUndoables,
    canUndo,
    undo,
    canRedo,
    redo,
    stack,
    timeTravel,
  } = useFlexibleUndo<PayloadByType>({
    initialStack: {
      past: [],
      future: [
        {
          type: 'subtract',
          payload: 1,
          created: new Date(2020, 4, 12, 18, 41, 30),
        },
        {
          type: 'updateAmount',
          payload: { from: 1, to: 10 },
          created: new Date(2020, 4, 12, 18, 41, 35),
        },
        {
          type: 'add',
          payload: 10,
          created: new Date(2020, 4, 12, 18, 41, 40),
        },
      ],
    },
  });

  const undoableAddHandler = makeUndoableHandler(setCount)(
    amount => prev => prev + amount,
    amount => prev => prev - amount
  );

  const { add, subtract, updateAmount } = makeUndoables<PayloadByType>({
    add: undoableAddHandler,
    subtract: invertHandlers(undoableAddHandler),
    updateAmount: makeUndoableFTHandler(setAmount),
  });

  return (
    <div className={rootClass}>
      <div>count = {count}</div>
      <div className={uiContainerClass}>
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
        history={stack}
        timeTravel={timeTravel}
        startTime={new Date(2020, 4, 12, 18, 41, 30)}
      />
    </div>
  );
};
