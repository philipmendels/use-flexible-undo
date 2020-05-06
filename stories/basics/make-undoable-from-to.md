If the payload is a decimal number that represents the delta (i.e. the state change), then the resulting state after undo/redo may differ slightly from the original state due to (cumulative) floating point precision-related rounding errors.

Instead you can choose to store the current 'from' state and the new 'to' state in the payload. This makes the payload a bit bigger, but it does give you the guarantee that you can restore the exact same state after undo/redo.

```typescript
const [count, setCount] = useState(1);

const updateCount = makeUndoable<PayloadFromTo<number>>({
  type: 'updateCount',
  drdo: ({ to }) => setCount(to),
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
import { rootClass, uiContainerClass } from '../styles';
import { ActionList } from '../components'/action-list';

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
    drdo: ({ to }) => setCount(to),
    undo: ({ from }) => setCount(from),
  });

  const multiply = (amount: number) =>
    updateCount({ from: count, to: count * amount });
  const divide = (amount: number) =>
    updateCount({ from: count, to: count / amount });

  return (
    <div className={rootClass}>
      <div>count = {count}</div>
      <div className={uiContainerClass}>
        <button onClick={() => multiply(Math.PI)}>multi&pi;</button>
        <button onClick={() => divide(Math.PI)}>di&pi;de</button>
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
