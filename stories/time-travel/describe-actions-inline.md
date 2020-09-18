### Describe actions: inline - Readme & Code

Inside your function component the the action types and payloads are fully typed, which helps when you want to customize the UI per action type. In practice you probably want to extract this code outside your component. You can see variations of how to do that in the next examples.

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
import { BranchNav } from '../components/branch-nav';

const assertNever = (action: never): never => {
  throw new Error('Unexpected action: ' + action);
};

export const DescribeActionsInlineExample: FC = () => {
  const [count, setCount] = useState(0);
  const [amount, setAmount] = useState<number | null>(1);

  const undoableAddHandler = makeUndoableHandler(setCount)(
    addUpdater,
    subtractUpdater
  );

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
      updateAmount: makeUndoableFTHandler(setAmount),
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
        <BranchNav
          history={history}
          switchToBranch={switchToBranch}
          undo={undo}
          redo={redo}
        />
      </div>
      {stack
        .slice()
        .reverse()
        .map((action, index) => (
          <div
            key={action.id}
            onClick={() => timeTravel(stack.length - 1 - index)}
            className={getStackItemStyle({
              active: action.id === currentPosition.actionId,
            })}
          >
            {// Types for actions (type, payload) are fully inferred,
            //  but in practice you probably want to extract this code.
            action.created.toLocaleString() +
              ' - ' +
              (action.type === 'add'
                ? `Add ${action.payload} to count`
                : action.type === 'subtract'
                ? `Subtract ${action.payload} from count`
                : action.type === 'updateAmount'
                ? `Update amount from ${action.payload.from} to ${action.payload.to}`
                : action.type === 'start'
                ? 'Start'
                : assertNever(action))}
          </div>
        ))}
    </div>
  );
};
```
