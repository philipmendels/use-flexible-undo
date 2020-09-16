### Describe actions: details in payload - Readme & Code

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

type PBTWithStart = PayloadByType & {
  start: void;
};

type OperationDescribers = {
  [K in Operation]: (amount: number) => ReactNode;
};

type PayloadDescribers = {
  [K in keyof PBTWithStart]: (payload: PBTWithStart[K]) => ReactNode;
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
  start: () => 'Start',
};

const describeAction = ({ type, payload }: HistoryItemUnion<PayloadByType>) =>
  (payloadDescribers[type] as any)(payload);

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
