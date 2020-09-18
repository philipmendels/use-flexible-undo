### Switch to branch - Readme & Code

You can use the timeTravel and timeTravelById functions to optionally switch to another branch, but these require you to provide a specific action index or id. Alternatively you can use the **switchToBranch** function, which takes as first argument the id of the target branch and as second argument one of the following options:

- 'LAST_COMMON_ACTION_IF_PAST' (default): Switch to the most recent action that the target branch has in common with the current branch (the action where the branches fork), but only if this action is in the past. If it is in the future then only switch to the target branch but stay on the current action (which is part of both branches).
- 'LAST_COMMON_ACTION': Switch to the most recent action that the target branch has is in common with the current branch, irrespective of whether this is in the past or the future.
- 'HEAD_OF_BRANCH': Switch to the head (most recent action) of the target branch.
- 'LAST_KNOWN_POSITION_ON_BRANCH': Switch to the action that was previously 'selected' (the present) on the target branch.

Note that in this example the switchToBranch function is also passed to the ActionList component (not part of the library). Internally this component uses the option 'LAST_COMMON_ACTION' when the user switches to another branch by clicking on one of the small branch icons which are shown next to each point where a branch forks of from the current branch.

```typescript
import React, { FC, useState } from 'react';
import {
  useUndoableEffects,
  makeUndoableFTHandler,
  makeUndoableHandler,
  invertHandlers,
} from 'use-flexible-undo';
import { addUpdater, subtractUpdater } from '../examples-util';
import { rootStyle, topUIStyle, countStyle, actionsStyle } from '../styles';
import { NumberInput } from '../components/number-input';
import { getLastItem } from '../components/util';
import { ActionList } from '../components/action-list';

export const SwitchToBranchExample: FC = () => {
  const [count, setCount] = useState(0);
  const [amount, setAmount] = useState<number | null>(1);

  const undoableAddHandler = makeUndoableHandler(setCount)(
    addUpdater,
    subtractUpdater
  );

  const {
    undoables,
    canUndo,
    undo,
    canRedo,
    redo,
    history,
    timeTravel,
    switchToBranch,
  } = useUndoableEffects({
    handlers: {
      add: undoableAddHandler,
      subtract: invertHandlers(undoableAddHandler),
      updateAmount: makeUndoableFTHandler(setAmount),
    },
    options: {
      clearFutureOnDo: false, // this is the default
    },
  });

  const { add, subtract, updateAmount } = undoables;

  const { branches, currentBranchId } = history;

  // show the last-modified branch on top
  const branchList = Object.values(branches).sort(
    (a, b) =>
      getLastItem(b.stack).created.getTime() -
      getLastItem(a.stack).created.getTime()
  );

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
          <button disabled={!amount} onClick={() => amount && add(amount)}>
            add
          </button>
          <button disabled={!amount} onClick={() => amount && subtract(amount)}>
            subtract
          </button>
        </div>
        <div className={actionsStyle}>
          <select
            value={currentBranchId}
            onChange={e => switchToBranch(e.target.value, 'HEAD_OF_BRANCH')}
          >
            {branchList.map(b => (
              <option key={b.id} value={b.id}>
                Branch {b.number}
              </option>
            ))}
          </select>
          <button disabled={!canUndo} onClick={undo}>
            undo
          </button>
          <button disabled={!canRedo} onClick={redo}>
            redo
          </button>
        </div>
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
