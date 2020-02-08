Extracting functions outside of your component is good for reusability, testability and possibly performance - but some may find that the added indirection makes the code harder too follow or may dislike the fact that extraction requires a bit more static typing.

If performance is your main reason for extraction: we will look at some of the memoization techniques that React offers for improving the performance of your function components in later examples.

```typescript
//outside function component:
const addAmount: CurriedUpdater<number> = amount => prev => prev + amount;
const subAmount: CurriedUpdater<number> = amount => prev => prev - amount;

//inside function component:
const countHandler = makeHandler(setCount);
const addHandler = countHandler(addAmount);
const subHandler = countHandler(subAmount);

const { add, subtract } = makeUndoables<PayloadByType>({
  add: makeUndoableHandler(addHandler, subHandler),
  subtract: makeUndoableHandler(subHandler, addHandler),
});
```

Full code:

```typescript
import React, { FC, useState } from 'react';
import {
  CurriedUpdater,
  useFlexibleUndo,
  makeHandler,
  makeUndoableHandler,
} from '../.';
import { ActionList } from './components/action-list';
import { rootClass, uiContainerClass } from './styles';

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
    add: makeUndoableHandler(addHandler, subHandler),
    subtract: makeUndoableHandler(subHandler, addHandler),
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
