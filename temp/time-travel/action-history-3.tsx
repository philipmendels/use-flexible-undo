import React, { FC, useState } from 'react';
import {
  PayloadFromTo,
  useFlexibleUndo,
  makeUndoableFTHandler,
  makeUndoableHandler,
  invertHandlers,
} from '../../.';
import { rootClass, uiContainerClass, getStackItemClass } from '../styles';
import { NumberInput } from '../components/number-input';

type Nullber = number | null;

interface PayloadByType1 {
  add: number;
  subtract: number;
}

interface PayloadByType2 {
  updateAmount: PayloadFromTo<Nullber>;
}

type PayloadByTypeTotal = PayloadByType1 & PayloadByType2;

const startTime = new Date();

export const ActionHistory3: FC = () => {
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
  } = useFlexibleUndo<PayloadByTypeTotal>();

  const undoableAddHandler = makeUndoableHandler(setCount)(
    amount => prev => prev + amount,
    amount => prev => prev - amount
  );

  const { add, subtract } = makeUndoables<PayloadByType1>({
    add: undoableAddHandler,
    subtract: invertHandlers(undoableAddHandler),
  });

  const { updateAmount } = makeUndoables<PayloadByType2>({
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
      <div>
        {stack.future.concat(stack.past).map((action, index) => (
          <div
            key={index}
            className={getStackItemClass({
              active: index === stack.future.length,
              range: index < stack.future.length ? 'future' : 'past',
            })}
            onClick={() => timeTravel('full', index)}
          >
            {action.type === 'add'
              ? `Increase count by ${action.payload}`
              : JSON.stringify(action)}
          </div>
        ))}
      </div>
      <div
        className={getStackItemClass({
          active: stack.past.length === 0,
          range: 'past',
        })}
        onClick={() => timeTravel('past', stack.past.length)}
      >
        {JSON.stringify({
          type: 'start',
          created: startTime,
        })}
      </div>
    </div>
  );
};
