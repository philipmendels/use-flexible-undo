Full code:

```typescript
import React, { FC, useState } from 'react';
import {
  PayloadFromTo,
  useFlexibleUndo,
  makeHandler,
  makeUndoableFromToHandler,
  combineHandlers,
} from '../.';
import { rootClass, uiContainerClass } from './styles';
import { ActionList } from './components/action-list';
import { NumberInput } from './components/number-input';

type Nullber = number | null;

interface PayloadByType {
  add: number;
  subtract: number;
  updateAmount: PayloadFromTo<Nullber>;
}

interface MetaActionReturnTypes {
  describe: string;
}

export const MakeUndoablesMeta: FC = () => {
  const [count, setCount] = useState(0);
  const [amount, setAmount] = useState<Nullber>(1);

  const {
    makeUndoables,
    canUndo,
    undo,
    canRedo,
    redo,
    stack,
    timeTravel,
    getMetaActionHandlers,
  } = useFlexibleUndo<PayloadByType, MetaActionReturnTypes>();

  const countHandler = makeHandler(setCount);
  const addHandler = countHandler(amount => prev => prev + amount);
  const subHandler = countHandler(amount => prev => prev - amount);

  const { add, subtract, updateAmount } = makeUndoables<PayloadByType>({
    add: {
      redo: addHandler,
      undo: subHandler,
      meta: {
        describe: amount => `Increase count by ${amount}`,
      },
    },
    subtract: {
      ...combineHandlers(subHandler, addHandler),
      meta: {
        describe: amount => `Decrease count by ${amount}`,
      },
    },
    updateAmount: {
      ...makeUndoableFromToHandler(setAmount),
      meta: {
        describe: ({ from, to }) => `Update amount from ${from} to ${to}`,
      },
    },
  });

  return (
    <div className={rootClass}>
      <div>count = {count}</div>
      <div className={uiContainerClass}>
        <label>
          amount:&nbsp;
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
        <button disabled={!canUndo} onClick={() => undo()}>
          undo
        </button>
        <button disabled={!canRedo} onClick={() => redo()}>
          redo
        </button>
      </div>
      <ActionList
        stack={stack}
        timeTravel={timeTravel}
        convert={action => getMetaActionHandlers(action).describe()}
      />
    </div>
  );
};
```
