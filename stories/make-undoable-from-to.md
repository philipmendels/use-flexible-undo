If you model the payload as a single (possibly) decimal number that represents the delta (state change), the resulting state after (multiple levels of) undo/redo may differ slightly from the original state due to (cumulative) floating point precision related rounding errors. Instead you can choose to store the previous state and the new state in the payload (or the previous state and the delta). This makes the payload a bit bigger, but it does give you the guarantee that you can restore the exact previous state.

```typescript
const updateCount = makeUndoable<PayloadFromTo<number>>({
  type: 'updateCount',
  redo: ({ to }) => setCount(to),
  undo: ({ from }) => setCount(from),
});

const multiply = (amount: number) =>
  updateCount({ from: count, to: count * amount });
const divide = (amount: number) =>
  updateCount({ from: count, to: count / amount });
```

Full code:

```typescript
import React, { useState } from 'react';
import { useFlexibleUndo, PayloadFromTo } from '../.';
import { rootClass, btnContainerClass } from './styles';
import { ActionList } from './components/action-list';

export const MakeUndoableFromTo: React.FC = () => {
  const [count, setCount] = useState(1);

  const {
    makeUndoable,
    canUndo,
    undo,
    canRedo,
    redo,
    stack,
    timeTravel,
  } = useFlexibleUndo();

  const updateCount = makeUndoable<PayloadFromTo<number>>({
    type: 'updateCount',
    redo: ({ to }) => setCount(to),
    undo: ({ from }) => setCount(from),
  });

  const multiply = (amount: number) =>
    updateCount({ from: count, to: count * amount });
  const divide = (amount: number) =>
    updateCount({ from: count, to: count / amount });

  return (
    <div className={rootClass}>
      <div>count = {count}</div>
      <div className={btnContainerClass}>
        <button onClick={() => multiply(Math.PI)}>multiPI</button>
        <button onClick={() => divide(Math.PI)}>diPIde</button>
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
