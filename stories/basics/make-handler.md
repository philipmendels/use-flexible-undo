### makeHandler & combineHandlers - Readme & Code

The utility **makeHandler** takes a state setter function (e.g. the one returned from React.useState) as single argument and returns a function that takes a curried function for updating the state based on the payload and the previous state. The final return value is a function that can be used as a do/redo or undo handler.

Note that the curried updater functions (e.g. "amount => prev => prev + amount") that are written inline in this example, are pure and can be extracted and re-used. We will do this in all the following examples.

The simple utility **combineHandlers** takes the do/redo handler as first argument and the undo handler as second argument, and returns an object with 'drdo' and 'undo' as keys and the handlers as values. Use at your own risk: It may save you some lines of code, but you are responsible for passing the arguments in the right order ;)

And for TypeScript users: Note that we do not need to type anything anymore. The payload type is inferred from "setCount" which in turn infers it from the initial state passed to useState. The action types are inferred from the names of the handlers. You can however still type the hook with a record of payload by type (see previous examples) if you want, for some extra guidance and safety.

```typescript
import React, { FC, useState } from 'react';
import {
  useFlexibleUndo,
  makeHandler,
  combineHandlers,
} from 'use-flexible-undo';
import { rootStyle, topUIStyle, actionsStyle, countStyle } from '../styles';
import { BranchNav } from '../components/branch-nav';
import { ActionList } from '../components/action-list';

export const MakeHandlerExample: FC = () => {
  const [count, setCount] = useState(0);

  const countHandler = makeHandler(setCount);
  const addHandler = countHandler(amount => prev => prev + amount);
  const subHandler = countHandler(amount => prev => prev - amount);

  const {
    undoables,
    undo,
    redo,
    history,
    timeTravel,
    switchToBranch,
  } = useFlexibleUndo({
    handlers: {
      add: combineHandlers(addHandler, subHandler),
      subtract: combineHandlers(subHandler, addHandler),
      updateCount: {
        drdo: ({ to }) => setCount(to),
        undo: ({ from }) => setCount(from),
      },
    },
  });

  const { add, subtract } = undoables;

  return (
    <div className={rootStyle}>
      <div className={topUIStyle}>
        <div className={countStyle}>count = {count}</div>
        <div className={actionsStyle}>
          <button onClick={() => add(2)}>add 2</button>
          <button onClick={() => subtract(1)}>subtract 1</button>
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
