You do not necessarily need to call your undoables directly. They are just functions that you can use as you feel fit. For example by wrapping them in another function like we do here. A consequence of this example is that all actions in the history will have the type "add", which may or may not be a problem depending on your use case. Check out the next examples for alternative ways of code reuse.

```typescript
const add = makeUndoable<number>({
  type: 'add',
  redo: amount => setCount(prev => prev + amount),
  undo: amount => setCount(prev => prev - amount),
});

const subtract = (amount: number) => add(-amount);
```

Full code:

```typescript
import React, { FC, useState } from 'react';
import { useFlexibleUndo } from '../.';
import { ActionList } from './components/action-list';
import { rootClass, btnContainerClass } from './styles';

export const MakeUndoableNegate: FC = () => {
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

  const subtract = (amount: number) => add(-amount);

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
