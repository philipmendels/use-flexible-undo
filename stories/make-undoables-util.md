Extracting functions outside of your function component is good for reusability, testability and possibly performance - but some may find that the added indirection makes the code harder too follow. And if performance is your main reason for extraction: we will look at some of the memoization techniques that React offers in a later example.

```typescript
//outside function component:
const addAmount: CurriedUpdater<number> = amount => prev => prev + amount;
const subAmount: CurriedUpdater<number> = amount => prev => prev - amount;

//inside function component:
const countHandler = makeHandler(setCount);
const addHandler = countHandler(addAmount);
const subHandler = countHandler(subAmount);

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
import { useFlexibleUndo, makeHandler, CurriedUpdater } from '../.';
import { ActionList } from './components/action-list';
import { rootClass, btnContainerClass } from './styles';

interface PayloadByType {
  add: number;
  subtract: number;
}

const addAmount: CurriedUpdater<number> = amount => prev => prev + amount;
const subAmount: CurriedUpdater<number> = amount => prev => prev - amount;

export const MakeUndoablesUtil: FC = () => {
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

  const countHandler = makeHandler(setCount);
  const addHandler = countHandler(addAmount);
  const subHandler = countHandler(subAmount);

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
