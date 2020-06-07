You **_should not_** make your redo/undo handlers depend on external state, but you can if you set the option **unstable_waitForNextUpdate** to true.

```typescript
type Nullber = number | null;

const [count, setCount] = useState(0);
const [amount, setAmount] = useState<Nullber>(1);

//Do NOT do this! Move 'amount' to the action payload or combine it
//with the 'count' state so that you can get it from the prev state.
const addHandler = () => amount && setCount(prev => prev + amount);
const subHandler = () => amount && setCount(prev => prev - amount);

const { add, subtract, updateAmount } = makeUndoables<PayloadByType>({
  add: combineHandlers(addHandler, subHandler),
  subtract: combineHandlers(subHandler, addHandler),
  updateAmount: makeUndoableFTObjHandler(setAmount),
});
```

Full code:

```typescript
import React, { FC, useState } from 'react';
import {
  PayloadFromTo,
  useFlexibleUndo,
  makeUndoableFTObjHandler,
  combineHandlers,
} from 'use-flexible-undo';
import { rootClass, uiContainerClass } from '../styles';
import { ActionList } from '../components/action-list';
import { NumberInput } from '../components/number-input';

type Nullber = number | null;

interface PayloadByType {
  add: void;
  subtract: void;
  updateAmount: PayloadFromTo<Nullber>;
}

export const WaitForUpdateExample: FC = () => {
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
  } = useFlexibleUndo({
    options: {
      unstable_waitForNextUpdate: true,
    },
  });

  //Do NOT do this! Move 'amount' to the action payload or combine it
  //with the 'count' state so that you can get it from the prev state.
  const addHandler = () => amount && setCount(prev => prev + amount);
  const subHandler = () => amount && setCount(prev => prev - amount);

  const { add, subtract, updateAmount } = makeUndoables<PayloadByType>({
    add: combineHandlers(addHandler, subHandler),
    subtract: combineHandlers(subHandler, addHandler),
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
        <button disabled={!amount} onClick={() => add()}>
          add
        </button>
        <button disabled={!amount} onClick={() => subtract()}>
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
