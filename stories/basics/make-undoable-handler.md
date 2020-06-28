### makeUndoableHandler & invertHandlers - Readme & Code

The utility **makeUndoableHandler** takes a state setter function (e.g. the one returned from React.useState) as single argument and returns a function that takes two (do/redo and undo) curried functions for updating the state based on the payload and the previous state. The final return value is an object with do/redo and undo handlers.

The utility **invertHandlers** takes an object with 'drdo' and 'undo' as keys and the handlers as values, and returns and object in wich the values are switched.

```typescript
import React, { FC, useState } from 'react';
import {
  useFlexibleUndo,
  makeUndoableHandler,
  invertHandlers,
} from 'use-flexible-undo';
import { rootStyle, topUIStyle, countStyle, actionsStyle } from '../styles';
import { BranchNav } from '../components/branch-nav';
import { ActionList } from '../components/action-list';

export const MakeUndoableHandlerExample: FC = () => {
  const [count, setCount] = useState(0);

  const undoableAddHandler = makeUndoableHandler(setCount)(
    amount => prev => prev + amount,
    amount => prev => prev - amount
  );

  const {
    undoables,
    undo,
    redo,
    history,
    timeTravel,
    switchToBranch,
  } = useFlexibleUndo({
    handlers: {
      add: undoableAddHandler,
      subtract: invertHandlers(undoableAddHandler),
    },
  });

  const { add, subtract } = undoables;

  return (
    <div className={rootStyle}>
      <div className={topUIStyle}>
        <div className={countStyle}>count = {count}</div>
        <div className={actionsStyle}>
          <button onClick={() => add(1)}>add 1</button>
          <button onClick={() => subtract(2)}>subtract 2</button>
        </div>
        <BranchNav
          history={history}
          switchToBranch={switchToBranch}
          undo={undo}
          redo={redo}
        />
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
