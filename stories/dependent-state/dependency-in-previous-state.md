### Dependency in previous state - Readme & Code

As an alternative to passing a state dependency as (part of) the action payload, you can store all dependent state together and get the dependencies from the previous state in your do/redo & undo handlers. In this example and the following two examples we use useState to define our combined state. In the next chapter we take a look at useReducer.

The utility function **makeUndoableFTHandler** is explained in the previous chapter. The only difference is that we use it here to update a slice of the combined state object. We use a simple utility **merge** to merge the slice into the combined state, in stead of writing "prev => ({ ...prev, amount })".

The utility function **makeUndoableHandler** is also explained in the previous chapter. Again the difference is that we use it here to update a slice of the combined state object. Note that there is quite some repetition between the two (do/redo & undo) updater functions that are passed to it. In the next example we use a utility function for removing this repetition.

```typescript
import React, { FC, useState } from 'react';
import {
  useFlexibleUndo,
  makeUndoableFTHandler,
  makeUndoableHandler,
  invertHandlers,
} from 'use-flexible-undo';
import { merge } from '../examples-util';
import { rootStyle, topUIStyle, countStyle, actionsStyle } from '../styles';
import { ActionList } from '../components/action-list';
import { NumberInput } from '../components/number-input';
import { BranchNav } from '../components/branch-nav';

type Nullber = number | null;

interface State {
  count: number;
  amount: Nullber;
}

export const DependencyInPreviousStateExample: FC = () => {
  const [{ count, amount }, setState] = useState<State>({
    count: 0,
    amount: 1,
  });

  const undoableAddHandler = makeUndoableHandler(setState)<void>(
    () => prev =>
      prev.amount ? { ...prev, count: prev.count + prev.amount } : prev,
    () => prev =>
      prev.amount ? { ...prev, count: prev.count - prev.amount } : prev
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
      updateAmount: makeUndoableFTHandler((amount: Nullber) =>
        setState(merge({ amount }))
      ),
    },
  });

  const { add, subtract, updateAmount } = undoables;

  return (
    <div className={rootStyle}>
      <div className={topUIStyle}>
        <div className={countStyle}>count &nbsp;= &nbsp;{count}</div>
        <div className={actionsStyle}>
          <label>
            amount =&nbsp;
            <NumberInput
              value={amount}
              onChange={value =>
                updateAmount({
                  from: amount,
                  to: value,
                })
              }
            />
          </label>
          <button disabled={!amount} onClick={() => add()}>
            add
          </button>
          <button disabled={!amount} onClick={() => subtract()}>
            subtract
          </button>
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
