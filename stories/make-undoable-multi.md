You can make multiple calls to **makeUndoable** or to any of its variations such as **makeUndoables** or **makeUndoablesFromDispatch**. It is however not possible to have multiple undoable functions with the same action type. Previously made undoable functions with the same type (either the same function in a previous render or a different function in the same render) will be overwritten. It is up to you to avoid conflicts in action types.

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
import { useFlexibleUndo } from '../.';
import { ActionList } from './components/action-list';
import { rootClass, uiContainerClass } from './styles';

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
