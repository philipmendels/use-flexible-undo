If the payload is a decimal number that represents the delta (i.e. the state change), then the resulting state after undo/redo may differ slightly from the original state due to (cumulative) floating point precision-related rounding errors.

Instead you can choose to store the current 'from' state and the new 'to' state in the payload. This makes the payload a bit bigger, but it does give you the guarantee that you can restore the exact same state after undo/redo.

```typescript
```

Full code:

```typescript
import React, { useState } from 'react';
import { useFlexibleUndo, PayloadFromTo } from '../../.';
import { rootClass, uiContainerClass } from '../styles';
import { ActionList } from '../components/action-list';

interface PayloadByType {
  updateCount: PayloadFromTo<number>;
}

export const MakeUndoableFromToExample: React.FC = () => {
  const [count, setCount] = useState(1);

  const {
    undoables,
    canUndo,
    undo,
    canRedo,
    redo,
    history,
    timeTravel,
    switchToBranch,
  } = useFlexibleUndo<PayloadByType>({
    handlers: {
      updateCount: {
        drdo: ({ to }) => setCount(to),
        undo: ({ from }) => setCount(from),
      },
    },
  });

  const { updateCount } = undoables;

  const add = (amount: number) =>
    updateCount({ from: count, to: count + amount });
  const subtract = (amount: number) =>
    updateCount({ from: count, to: count - amount });
  const multiply = (amount: number) =>
    updateCount({ from: count, to: count * amount });
  const divide = (amount: number) =>
    updateCount({ from: count, to: count / amount });

  return (
    <div className={rootClass}>
      <div>count = {count}</div>
      <div className={uiContainerClass}>
        <button onClick={() => add(2)}>add 2</button>
        <button onClick={() => subtract(1)}>subtract 1</button>
        <button onClick={() => multiply(Math.PI)}>multi&pi;</button>
        <button onClick={() => divide(Math.PI)}>di&pi;de</button>
        <button disabled={!canUndo} onClick={() => undo()}>
          undo
        </button>
        <button disabled={!canRedo} onClick={() => redo()}>
          redo
        </button>
      </div>
      <ActionList
        history={history}
        timeTravel={timeTravel}
        switchToBranch={switchToBranch}
      />
    </div>
  );
};
```
