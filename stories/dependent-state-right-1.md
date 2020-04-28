Passing a state dependency as (part of) the action payload is one way of keeping your redo/undo handlers pure. See the next example for an alternative.

```typescript
const [count, setCount] = useState(0);
const [amount, setAmount] = useState<Nullber>(1);

const addHandler = (amount: number) => setCount(prev => prev + amount);
const subHandler = (amount: number) => setCount(prev => prev - amount);

const { add, subtract, updateAmount } = makeUndoables<PayloadByType>({
  add: combineHandlers(addHandler, subHandler),
  subtract: combineHandlers(subHandler, addHandler),
  updateAmount: makeUndoableFromToHandler(setAmount),
});
```

Full code:

```typescript
import React, { FC, useState } from 'react';
import {
  PayloadFromTo,
  useFlexibleUndo,
  makeUndoableFromToHandler,
  combineHandlers,
} from '../.';
import { rootClass, uiContainerClass } from './styles';
import { ActionList } from './components/action-list';
import { NumberInput } from './components/number-input';

type Nullber = number | null;

interface PayloadByType {
  add: number;
  subtract: number;
  updateAmount: PayloadFromTo<Nullber>;
}

export const DependentStateRight1: FC = () => {
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
  } = useFlexibleUndo();

  const addHandler = (amount: number) => setCount(prev => prev + amount);
  const subHandler = (amount: number) => setCount(prev => prev - amount);

  const { add, subtract, updateAmount } = makeUndoables<PayloadByType>({
    add: combineHandlers(addHandler, subHandler),
    subtract: combineHandlers(subHandler, addHandler),
    updateAmount: makeUndoableFromToHandler(setAmount),
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
      <ActionList stack={stack} timeTravel={timeTravel} />
    </div>
  );
};
```
