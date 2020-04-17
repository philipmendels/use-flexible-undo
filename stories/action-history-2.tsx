import React, { FC, useState } from 'react';
import {
  PayloadFromTo,
  useFlexibleUndo,
  makeHandler,
  makeUndoableHandler,
  makeUndoableFromToHandler,
} from '../.';
import { rootClass, uiContainerClass } from './styles';
import { NumberInput } from './components/number-input';

type Nullber = number | null;

interface PayloadByType {
  add: number;
  subtract: number;
  updateAmount: PayloadFromTo<Nullber>;
}
export const ActionHistory2: FC = () => {
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
  } = useFlexibleUndo<PayloadByType>();

  const countHandler = makeHandler(setCount);
  const addHandler = countHandler(amount => prev => prev + amount);
  const subHandler = countHandler(amount => prev => prev - amount);

  const { add, subtract, updateAmount } = makeUndoables<PayloadByType>({
    add: {
      redo: addHandler,
      undo: subHandler,
    },
    subtract: {
      ...makeUndoableHandler(subHandler, addHandler),
    },
    updateAmount: {
      ...makeUndoableFromToHandler(setAmount),
    },
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
            style={{
              cursor: 'pointer',
              padding: '6px 0',
              opacity: index < stack.future.length ? 0.5 : 1,
            }}
            onClick={() => timeTravel('full', index)}
          >
            {JSON.stringify(action)}
          </div>
        ))}
      </div>
    </div>
  );
};
