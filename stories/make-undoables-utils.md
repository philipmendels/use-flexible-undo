The library exposes various utilities to construct your redo/undo handlers.

- **makeHandler** is a curried function that takes a function that sets the state (e.g. the one returned from React.useState) and returns a function that takes a curried function that converts the previous state to the new state.
- **makeUndoableHandler** takes the redo handler as first argument and the undo handler as second argument, and returns an object with redo and undo as keys and the handlers as values.
- **makeUndoableFromToHandler** takes a function that sets the state and returns an object with redo/undo handlers that expect a payload that containes the previous state and the new state.

```typescript
const countHandler = makeHandler(setCount);
const addHandler = countHandler(amount => prev => prev + amount);
const subHandler = countHandler(amount => prev => prev - amount);

const { add, subtract, updateAmount } = makeUndoables<PayloadByType>({
  add: makeUndoableHandler(addHandler, subHandler),
  subtract: makeUndoableHandler(subHandler, addHandler),
  updateAmount: makeUndoableFromToHandler(setAmount),
});
```

Full code:

```typescript
import React, { FC, useState } from 'react';
import {
  PayloadFromTo,
  useFlexibleUndo,
  makeHandler,
  makeUndoableHandler,
  makeUndoableFromToHandler,
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

export const MakeUndoablesUtils: FC = () => {
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

  const countHandler = makeHandler(setCount);
  const addHandler = countHandler(amount => prev => prev + amount);
  const subHandler = countHandler(amount => prev => prev - amount);

  const { add, subtract, updateAmount } = makeUndoables<PayloadByType>({
    add: makeUndoableHandler(addHandler, subHandler),
    subtract: makeUndoableHandler(subHandler, addHandler),
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
