### Describe actions: details in payload - Readme & Code

The way that you model your actions for undo/redo purposes (e.g. absolute vs relative state values in the payload) may not necessarily be the best fit for describing the action from the user's point of view. In the case that a single action type (like "updateCount") is too generic for the user then you can either create separate undoable functions ("add", "subtract", etc.) that all re-use the same do/redo & undo handlers, or you can add additional info to the action payload like we do in this example. It's up to you how exact you want to be regarding undoing/redoing and describing the user's actions, and how small you need your action payloads to be.

```typescript
import React, { FC, useState, ReactNode } from 'react';
import {
  PayloadFromTo,
  useUndoableEffects,
  makeUndoableFTHandler,
  HistoryItemUnion,
  wrapFTHandler,
} from 'use-flexible-undo';
import {
  addUpdater,
  subtractUpdater,
  multiplyUpdater,
  divideUpdater,
} from '../examples-util';
import { rootStyle, topUIStyle, countStyle, actionsStyle } from '../styles';
import { NumberInput } from '../components/number-input';
import { BranchNav } from '../components/branch-nav';
import { ActionList } from '../components/action-list';

type Operation = 'add' | 'subtract' | 'multiply' | 'divide';

interface UpdateCountDetails {
  operation: Operation;
  amount: number;
}

type Nullber = number | null;

interface PayloadByType {
  updateCount: PayloadFromTo<number> & UpdateCountDetails;
  updateAmount: PayloadFromTo<Nullber>;
}

type OperationDescribers = {
  [K in Operation]: (amount: number) => ReactNode;
};

type PayloadDescribers = {
  [K in keyof PayloadByType]: (payload: PayloadByType[K]) => ReactNode;
};

const operationDescribers: OperationDescribers = {
  add: amount => `Add ${amount} to count`,
  subtract: amount => `Subtract ${amount} from count`,
  multiply: amount => `Multiply count by ${amount}`,
  divide: amount => `Divide count by ${amount}`,
};

const payloadDescribers: PayloadDescribers = {
  updateCount: ({ from, to, operation, amount }) =>
    operationDescribers[operation](amount) + ` (update from ${from} to ${to})`,
  updateAmount: ({ from, to }) => `Update amount from ${from} to ${to}`,
};

const describeAction = ({
  type,
  payload,
}: HistoryItemUnion<PayloadByType>): ReactNode =>
  type === 'start' ? 'Start' : (payloadDescribers[type] as any)(payload);

const withDescription = (
  fn: (amount: number, description: UpdateCountDetails) => void
) => (operation: Operation) => (amount: number) =>
  fn(amount, { operation, amount });

export const DescriptionInPayloadExample: FC = () => {
  const [count, setCount] = useState(0);
  const [amount, setAmount] = useState<Nullber>(1);

  const {
    undoables,
    undo,
    redo,
    history,
    timeTravel,
    switchToBranch,
    // PayloadByType is needed because the
    // details for updateCount cannot be inferred
  } = useUndoableEffects<PayloadByType>({
    handlers: {
      updateCount: makeUndoableFTHandler(setCount),
      updateAmount: makeUndoableFTHandler(setAmount),
    },
  });

  const { updateCount, updateAmount } = undoables;

  const countHandler = wrapFTHandler(updateCount, count);

  const add = withDescription(countHandler(addUpdater))('add');
  const subtract = withDescription(countHandler(subtractUpdater))('subtract');
  const multiply = withDescription(countHandler(multiplyUpdater))('multiply');
  const divide = withDescription(countHandler(divideUpdater))('divide');

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
        </div>
        <div className={actionsStyle}>
          <button disabled={!amount} onClick={() => amount && add(amount)}>
            add
          </button>
          <button disabled={!amount} onClick={() => amount && subtract(amount)}>
            subtract
          </button>
          <button disabled={!amount} onClick={() => amount && multiply(amount)}>
            multiply
          </button>
          <button disabled={!amount} onClick={() => amount && divide(amount)}>
            divide
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
        describeAction={describeAction}
      />
    </div>
  );
};
```
