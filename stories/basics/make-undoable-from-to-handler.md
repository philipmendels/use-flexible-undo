### makeUndoableFTHandler & wrapFTHandler - Readme & Code

The utility **makeUndoableFTHandler** takes a state setter function (e.g. the one returned from React.useState) as single argument. It returns an object with do/redo and undo handlers that take an object with the current "from" state and the new "to" state as payload.

The utility **wrapFTHandler** takes as first argument a function that expects as payload an object with "from" and "to" state, and as second argument the current state. It returns a function that takes a curried function for updating the state based on the payload and the previous state.

And again for TypeScript users: Note that we do not need to type anything anymore. The payload type for add, subtract, multiply and divide is inferred from "updateCount" which in turn infers it from "setCount" which in turn infers it from the initial state passed to useState. You can however still type the hook with a record of payload by type (see previous example) if you want, for some extra guidance and safety.

```typescript
import React, { useState } from 'react';
import {
  useUndoableEffects,
  makeUndoableFTHandler,
  wrapFTHandler,
} from 'use-flexible-undo';
import {
  addUpdater,
  subtractUpdater,
  multiplyUpdater,
  divideUpdater,
} from '../examples-util';
import { rootStyle, topUIStyle, countStyle, actionsStyle } from '../styles';
import { BranchNav } from '../components/branch-nav';
import { ActionList } from '../components/action-list';

export const MakeUndoableFTHandlerExample: React.FC = () => {
  const [count, setCount] = useState(0);

  const {
    undoables,
    undo,
    redo,
    history,
    timeTravel,
    switchToBranch,
  } = useUndoableEffects({
    handlers: {
      updateCount: makeUndoableFTHandler(setCount),
    },
  });

  const { updateCount } = undoables;

  const countHandler = wrapFTHandler(updateCount, count);

  const add = countHandler(addUpdater);
  const subtract = countHandler(subtractUpdater);
  const multiply = countHandler(multiplyUpdater);
  const divide = countHandler(divideUpdater);

  return (
    <div className={rootStyle}>
      <div className={topUIStyle}>
        <div className={countStyle}>count = {count}</div>
        <div className={actionsStyle}>
          <button onClick={() => add(Math.PI)}>add PI</button>
          <button onClick={() => subtract(Math.PI)}>subtract PI</button>
          <button onClick={() => multiply(Math.PI)}>multiPI</button>
          <button onClick={() => divide(Math.PI)}>diPIde</button>
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
