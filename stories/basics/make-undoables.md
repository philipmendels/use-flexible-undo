Instead of making multiple calls to **makeUndoable** you can use **makeUndoables** to make multiple undoable functions at once. It takes an object with as keys action types and as values objects with do/redo and undo handlers. It returns an object with undoable functions by action type.

```typescript
interface PayloadByType {
  add: number;
  subtract: number;
}

const [count, setCount] = useState(0);

const { add, subtract } = makeUndoables<PayloadByType>({
  add: {
    drdo: amount => setCount(prev => prev + amount),
    undo: amount => setCount(prev => prev - amount),
  },
  subtract: {
    drdo: amount => setCount(prev => prev - amount),
    undo: amount => setCount(prev => prev + amount),
  },
});
```

Full code:

```typescript
import React, { FC, useState } from 'react';
import { useFlexibleUndo } from 'use-flexible-undo';
import { ActionList } from '../components'/action-list';
import { rootClass, uiContainerClass } from '../styles';

interface PayloadByType {
  add: number;
  subtract: number;
}

export const MakeUndoables: FC = () => {
  const [count, setCount] = useState(0);

  const {
    makeUndoables,
    canUndo,
    undo,
    canRedo,
    redo,
    stack,
    timeTravel,
  } = useFlexibleUndo();

  const { add, subtract } = makeUndoables<PayloadByType>({
    add: {
      drdo: amount => setCount(prev => prev + amount),
      undo: amount => setCount(prev => prev - amount),
    },
    subtract: {
      drdo: amount => setCount(prev => prev - amount),
      undo: amount => setCount(prev => prev + amount),
    },
  });

  return (
    <div className={rootClass}>
      <div>count = {count}</div>
      <div className={uiContainerClass}>
        <button onClick={() => add(1)}>add 1</button>
        <button onClick={() => subtract(2)}>subtract 2</button>
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
