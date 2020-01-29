useFlexibleUndo is a custom hook that that keeps a **history of undoable actions** - as opposed to a history of snapshots of (a slice of) application state or a history of snapshots of the state managed by a specific reducer. **How you manage your state is up to you** and independent of the undo mechanism.

Here we create a single undoable function **add** that generates an action with type "add" and a simple delta value of type number as payload.

```typescript
const add = makeUndoable<number>({
  type: 'add',
  do: amount => setCount(prev => prev + amount),
  undo: amount => setCount(prev => prev - amount),
});
```

Full code:

```typescript
import React, { FC, useState } from 'react';
import { useFlexibleUndo } from '../.';
import { ActionList } from './components/action-list';
import { btnContainerClass, rootClass } from './styles';

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
    do: amount => setCount(prev => prev + amount),
    undo: amount => setCount(prev => prev - amount),
  });

  return (
    <div className={rootClass}>
      <div>count = {count}</div>
      <div className={btnContainerClass}>
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
