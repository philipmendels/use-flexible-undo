The utility **makeHandler** takes a state setter function (e.g. the one returned from React.useState) as single argument and returns a function that takes a curried function for updating the state based on the payload and the previous state. The final return value is a function that can be used as a do/redo or undo handler.

The utility **combineHandlers** takes the do/redo handler as first argument and the undo handler as second argument, and returns an object with 'drdo' and 'undo' as keys and the handlers as values.

```typescript
```

Full code:

```typescript
import React, { FC, useState } from 'react';
import { useFlexibleUndo, makeHandler, combineHandlers } from '../../.';
import { rootClass, uiContainerClass } from '../styles';
import { ActionList } from '../components/action-list';

interface PayloadByType {
  add: number;
  subtract: number;
}

export const MakeHandlerExample: FC = () => {
  const [count, setCount] = useState(0);

  const countHandler = makeHandler(setCount);
  const addHandler = countHandler(amount => prev => prev + amount);
  const subHandler = countHandler(amount => prev => prev - amount);

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
      add: combineHandlers(addHandler, subHandler),
      subtract: combineHandlers(subHandler, addHandler),
    },
  });

  const { add, subtract } = undoables;

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
      <ActionList
        history={history}
        timeTravel={timeTravel}
        switchToBranch={switchToBranch}
      />
    </div>
  );
};
```
