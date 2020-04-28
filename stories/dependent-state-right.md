As an alternative to passing dependent state as (part of) the action payload, you can store all dependent state together and get it from the previous state in your redo/undo handlers. Here we use useState to store our state, in the following examples we look at useReducer.

```typescript
const [{ count, amount }, setState] = useState<State>({
  count: 0,
  amount: 1,
});

const addHandler = () =>
  setState(prev =>
    prev.amount ? { ...prev, count: prev.count + prev.amount } : prev
  );
const subHandler = () =>
  setState(prev =>
    prev.amount ? { ...prev, count: prev.count - prev.amount } : prev
  );

const { add, subtract, updateAmount } = makeUndoables<PayloadByType>({
  add: combineHandlers(addHandler, subHandler),
  subtract: combineHandlers(subHandler, addHandler),
  updateAmount: makeUndoableFromToHandler(amount =>
    setState(prev => ({ ...prev, amount }))
  ),
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

interface State {
  count: number;
  amount: Nullber;
}

interface PayloadByType {
  add: undefined;
  subtract: undefined;
  updateAmount: PayloadFromTo<Nullber>;
}

export const DependentStateRight2: FC = () => {
  const [{ count, amount }, setState] = useState<State>({
    count: 0,
    amount: 1,
  });

  const {
    makeUndoables,
    canUndo,
    undo,
    canRedo,
    redo,
    stack,
    timeTravel,
  } = useFlexibleUndo();

  const addHandler = () =>
    setState(prev =>
      prev.amount ? { ...prev, count: prev.count + prev.amount } : prev
    );
  const subHandler = () =>
    setState(prev =>
      prev.amount ? { ...prev, count: prev.count - prev.amount } : prev
    );

  const { add, subtract, updateAmount } = makeUndoables<PayloadByType>({
    add: combineHandlers(addHandler, subHandler),
    subtract: combineHandlers(subHandler, addHandler),
    updateAmount: makeUndoableFromToHandler(amount =>
      setState(prev => ({ ...prev, amount }))
    ),
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
