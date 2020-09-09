### makeUndoableSetter - Readme & Code

The curried utility function **makeUndoableSetter** takes:

- a function for setting combined state A (e.g. the setter returned from React.useState)  
  ->
- a function for selecting slice B from A.
- a function for updating slice B in A.  
  ->
- a function P -> A -> C for deriving a state change value C based on the action payload and/or the previous state A
- an optional predicate function P -> A -> boolean, for conditionally applying the entire update  
  ->
- a curried updater function C -> B -> B for the do/redo handler
- a curried updater function C -> B -> B for the undo handler

This may not be a one-size-fits-all solution. Feel free to write your own solution, for example using lenses and other functional utilities.

```typescript
import React, { FC, useState } from 'react';
import {
  useUndoableEffects,
  invertHandlers,
  makeUndoableFTHandler,
  makeUndoableSetter,
} from 'use-flexible-undo';
import { merge, addUpdater, subtractUpdater } from '../examples-util';
import { rootStyle, topUIStyle, countStyle, actionsStyle } from '../styles';
import { ActionList } from '../components/action-list';
import { NumberInput } from '../components/number-input';
import { BranchNav } from '../components/branch-nav';

type Nullber = number | null;

interface State {
  count: number;
  amount: Nullber;
}

export const MakeUndoableSetterExample: FC = () => {
  const [{ count, amount }, setState] = useState<State>({
    count: 0,
    amount: 1,
  });

  const selectAmount = (_: void) => (state: State) => state.amount || 0;

  const undoableAddHandler = makeUndoableSetter(setState)(
    state => state.count,
    count => merge({ count })
  )(selectAmount)(addUpdater, subtractUpdater);

  const {
    undoables,
    undo,
    redo,
    history,
    timeTravel,
    switchToBranch,
  } = useUndoableEffects({
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
