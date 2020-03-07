If you combine your dependent state in one state object, then you can get it from the previous state in your redo/undo handlers instead of getting it from the action payload.

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
  add: makeUndoableHandler(addHandler, subHandler),
  subtract: makeUndoableHandler(subHandler, addHandler),
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
  makeUndoableHandler,
} from '../.';
import { rootClass, uiContainerClass } from './styles';
import { ActionList } from './components/action-list';

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

export const DependentStateRight: FC = () => {
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
    add: makeUndoableHandler(addHandler, subHandler),
    subtract: makeUndoableHandler(subHandler, addHandler),
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
          <input
            type="number"
            value={amount === null ? '' : amount}
            onChange={({ target: { value } }) =>
              updateAmount({
                from: amount,
                to: value === '' ? null : Number(value),
              })
            }
          />
        </label>
        <button disabled={!amount} onClick={() => amount && add()}>
          add
        </button>
        <button disabled={!amount} onClick={() => amount && subtract()}>
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
