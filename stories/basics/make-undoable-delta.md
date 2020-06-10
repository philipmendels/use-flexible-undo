The custom React hook **useFlexibleUndo** keeps a history of undoable actions - as opposed to a history of snapshots of (a slice of) state. How you manage your state is up to you and independent of the undo mechanism.

The hook returns the function **makeUndoable** which takes an object with an action type and do/redo and undo handlers as single argument. The do/redo and undo handlers take the payload (here named "amount") as single argument and use it to update the state. Here we make a single undoable function "add". Each time we call "add" the do/redo handler will be called once immediately, and an action with type "add" and a simple delta value of type number as payload will be stored in the history, so that we can undo/redo later.

```typescript
```

Full code:

```typescript
import React, { FC, useState } from 'react';
import { ActionList } from '../components/action-list';
import { rootClass, uiContainerClass } from '../styles';
import { useFlexibleUndo } from '../../.';

interface PayloadByType {
  add: number;
  subtract: number;
}

export const MakeUndoableExample: FC = () => {
  const [count, setCount] = useState(0);

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
      add: {
        drdo: amount => setCount(prev => prev + amount),
        undo: amount => setCount(prev => prev - amount),
      },
      subtract: {
        drdo: amount => setCount(prev => prev - amount),
        undo: amount => setCount(prev => prev + amount),
      },
    },
  });

  const { add, subtract } = undoables;

  return (
    <div className={rootClass}>
      <div>count = {count}</div>
      <div className={uiContainerClass}>
        <button onClick={() => add(2)}>add 2</button>
        <button onClick={() => subtract(1)}>subtract 1</button>
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
