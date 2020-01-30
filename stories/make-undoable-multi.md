You can make multiple separate calls to **makeUndoable** (or any of its variations such as **makeUndoables** or **makeUndoablesFromDispatch**). It is not possible to have multiple undoables with the same action type. Existing undoables with the same type (either created in a separate call in the same render, or from the same call in a previous render) will be overwritten. It is up to you to avoid conflicts in action types.

```typescript
const add = makeUndoable<number>({
  type: 'add',
  redo: amount => setCount(prev => prev + amount),
  undo: amount => setCount(prev => prev - amount),
});
const subtract = makeUndoable<number>({
  type: 'subtract',
  redo: amount => setCount(prev => prev - amount),
  undo: amount => setCount(prev => prev + amount),
});
```

Full code:

```typescript
import React, { FC, useState } from 'react';
import { useFlexibleUndo } from '../src';
import { rootClass, btnContainerClass } from './styles';
import { ActionList } from './components/action-list';

export const MakeUndoableMulti: FC = () => {
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
  const subtract = makeUndoable<number>({
    type: 'subtract',
    redo: amount => setCount(prev => prev - amount),
    undo: amount => setCount(prev => prev + amount),
  });

  return (
    <div className={rootClass}>
      <div>count = {count}</div>
      <div className={btnContainerClass}>
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
