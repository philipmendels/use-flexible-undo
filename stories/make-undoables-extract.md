It's up to you how you define your redo/undo handlers. You can define them inline as in the previous examples, or you can extract them for reuse. Here we extract them because the two functions "add" and "subtract" are the inverse of each other - so we can use the undo handler of one as the redo handler of the other (and vice versa).

```typescript
const addHandler = (amount: number) => setCount(prev => prev + amount);
const subHandler = (amount: number) => setCount(prev => prev - amount);

const { add, subtract } = makeUndoables<PayloadByType>({
  add: {
    redo: addHandler,
    undo: subHandler,
  },
  subtract: {
    redo: subHandler,
    undo: addHandler,
  },
});
```

Full code:

```typescript
import React, { FC, useState } from 'react';
import { useFlexibleUndo } from '../.';
import { ActionList } from './components/action-list';
import { rootClass, uiContainerClass } from './styles';

interface PayloadByType {
  add: number;
  subtract: number;
}

export const MakeUndoablesExtract: FC = () => {
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

  const addHandler = (amount: number) => setCount(prev => prev + amount);
  const subHandler = (amount: number) => setCount(prev => prev - amount);

  const { add, subtract } = makeUndoables<PayloadByType>({
    add: {
      redo: addHandler,
      undo: subHandler,
    },
    subtract: {
      redo: subHandler,
      undo: addHandler,
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
