Full code:

```typescript
import React, { FC, useState } from 'react';
import {
  PayloadFromTo,
  useFlexibleUndo,
  makeUndoableFTObjHandler,
  makeUndoableHandler,
  invertHandlers,
} from 'use-flexible-undo';
import { rootClass, uiContainerClass, getStackItemClass } from '../styles';
import { NumberInput } from '../components'/number-input';

type Nullber = number | null;

interface PayloadByType {
  add: number;
  subtract: number;
  updateAmount: PayloadFromTo<Nullber>;
}

const startTime = new Date();

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

  const undoableAddHandler = makeUndoableHandler(setCount)(
    amount => prev => prev + amount,
    amount => prev => prev - amount
  );

  const { add, subtract, updateAmount } = makeUndoables<PayloadByType>({
    add: undoableAddHandler,
    subtract: invertHandlers(undoableAddHandler),
    updateAmount: makeUndoableFTObjHandler(setAmount),
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
            {JSON.stringify(action)}
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
```
