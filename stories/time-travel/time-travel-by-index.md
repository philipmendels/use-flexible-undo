### Time travel by index - Readme & Code

The **timeTravel** function takes as first argument the action index that you want to travel to, and optionally as second argument the id of the branch that you want to travel to. The latter defaults to the id of the current branch. The index is relative to the branch that you want to travel to.

The actions of each branch are stored in an array so travelling by index is the cheapest way. If you don't care about the lookup cost you can use the **timeTravelById** function, which is shown in the next example.

```typescript
import React, { FC, useState } from 'react';
import {
  useUndoableEffects,
  makeUndoableFTHandler,
  makeUndoableHandler,
  invertHandlers,
} from 'use-flexible-undo';
import { addUpdater, subtractUpdater } from '../examples-util';
import {
  rootStyle,
  topUIStyle,
  countStyle,
  actionsStyle,
  getStackItemStyle,
} from '../styles';
import { NumberInput } from '../components/number-input';

export const TimeTravelByIndexExample: FC = () => {
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
  } = useUndoableEffects({
    handlers: {
      add: undoableAddHandler,
      subtract: invertHandlers(undoableAddHandler),
      updateAmount: makeUndoableFTHandler(setAmount),
    },
    options: {
      clearFutureOnDo: true,
    },
  });

  const { add, subtract, updateAmount } = undoables;

  const { branches, currentBranchId, currentPosition } = history;
  const { stack } = branches[currentBranchId];

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
          <button disabled={!canUndo} onClick={undo}>
            undo
          </button>
          <button disabled={!canRedo} onClick={redo}>
            redo
          </button>
        </div>
      </div>

      {stack
        .slice() // copy, because reverse is a mutable operation. You could also
        .reverse() // try to reverse with css or write your own mapReverse function.
        .map(({ id, type, payload }, index) => (
          <div
            key={id}
            // We need to recalculate the index due to the reversal.
            // Or you can use 'timeTravelById' if you do not care about
            // the lookup cost.
            onClick={() => timeTravel(stack.length - 1 - index)}
            className={getStackItemStyle({
              active: id === currentPosition.actionId,
            })}
          >
            {JSON.stringify({ type, payload })}
          </div>
        ))}
    </div>
  );
};
```
