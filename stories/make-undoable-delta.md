**useFlexibleUndo** is a custom hook that that keeps a history of undoable actions - as opposed to a history of snapshots of (a slice of) state. How you manage your state is up to you and independent of the undo mechanism.

**makeUndoable** takes an object with an action type and redo/undo handlers. The redo and undo handlers take the payload (here named "amount") as single argument and use it to update the state. Here we make a single undoable function "add". Each time we call "add" the redo handler will be called once immediately, and an action with type "add" and a simple delta value of type number as payload will be stored in the history, so that we can undo/redo later.

```typescript
const add = makeUndoable<number>({
  type: 'add',
  redo: amount => setCount(prev => prev + amount),
  undo: amount => setCount(prev => prev - amount),
});
```

Full code:

```typescript
import React, { FC, useState } from 'react';
import { useFlexibleUndo } from '../.';
import { ActionList } from './components/action-list';
import { rootClass, uiContainerClass } from './styles';

export const MakeUndoableDelta: FC = () => {
  const [count, setCount] = useState(0);

  const {
    makeUndoable,
    canUndo,
    undo,
    canRedo,
    redo,
    stack,
    timeTravel,
  } = useFlexibleUndo();

  const add = makeUndoable<number>({
    type: 'add',
    redo: amount => setCount(prev => prev + amount),
    undo: amount => setCount(prev => prev - amount),
  });

  return (
    <div className={rootClass}>
      <div>count = {count}</div>
      <div className={uiContainerClass}>
        <button onClick={() => add(1)}>add 1</button>
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
