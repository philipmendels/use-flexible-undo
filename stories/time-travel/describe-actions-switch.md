### Describe actions: switch statement - Readme & Code

You can use the generic type **HistoryItemUnion** to convert a record of payload by type to a union of history items. A history item has a type and payload, as well as a unique **id** and a **created** date. The history item with type 'start' is automatically defined, so you should not include this in you record of payload by type.

```typescript
import React, { FC, useState, ReactNode } from 'react';
import {
  PayloadFromTo,
  useUndoableEffects,
  makeUndoableFTHandler,
  makeUndoableHandler,
  invertHandlers,
  HistoryItemUnion,
} from 'use-flexible-undo';
import {
  rootStyle,
  topUIStyle,
  countStyle,
  actionsStyle,
  getStackItemStyle,
} from '../styles';
import { NumberInput } from '../components/number-input';
import { BranchNav } from '../components/branch-nav';

type Nullber = number | null;

interface PayloadByType {
  add: number;
  subtract: number;
  updateAmount: PayloadFromTo<Nullber>;
}

const describeAction = (action: HistoryItemUnion<PayloadByType>): ReactNode => {
  switch (action.type) {
    case 'add':
      return `Increase count by ${action.payload}`;
    case 'subtract':
      return `Decrease count by ${action.payload}`;
    case 'updateAmount':
      const { from, to } = action.payload;
      return `Update amount from ${from} to ${to}`;
    case 'start':
      return 'Start';
  }
};

export const DescribeActionsSwitch: FC = () => {
  const [count, setCount] = useState(0);
  const [amount, setAmount] = useState<Nullber>(1);

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
    // types can be inferred, but since we already have
    // 'PayloadByType' defined, we can just as well add it.
  } = useUndoableEffects<PayloadByType>({
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
            {action.created.toLocaleString() + ' - ' + describeAction(action)}
          </div>
        ))}
    </div>
  );
};
```
