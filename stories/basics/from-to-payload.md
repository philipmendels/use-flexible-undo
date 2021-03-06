### From-To state as payload - Readme & Code

If the payload is a decimal number that represents the delta (i.e. the state change), then the resulting state after undo/redo may differ slightly from the original state due to (cumulative) floating point precision-related rounding errors.

Instead you can choose to store the current state and the new state in the payload. This makes the payload a bit bigger, but it does give you the guarantee that you can restore the exact same state after undo/redo. Here the payload is shaped as an object with "from" and "to" keys, but you are free to choose your own payload shape, such as a tuple. Also, you could opt to store the current state and the delta, or the new state and the delta.

Finally note that the actions in the history now all have the same type "updateCount", which makes sense because they are technically equivalent. If you still want to be able to distinguish the different operations within the history than you can either add an additional description to the payload, or you will need to create separate undoable functions (separate action types) that all re-use the same do/redo & undo handlers.

```typescript
import React, { useState } from 'react';
import { useUndoableEffects, PayloadFromTo } from 'use-flexible-undo';
import { rootStyle, topUIStyle, countStyle, actionsStyle } from '../styles';
import { BranchNav } from '../components/branch-nav';
import { ActionList } from '../components/action-list';

// action Payload By action Type
interface PBT {
  // an object with 'from' and 'to' fields of type number:
  updateCount: PayloadFromTo<number>;
}

export const FromToPayloadExample: React.FC = () => {
  const [count, setCount] = useState(0);

  const {
    undoables,
    undo,
    redo,
    history,
    timeTravel,
    switchToBranch,
  } = useUndoableEffects<PBT>({
    handlers: {
      updateCount: {
        drdo: ({ to }) => setCount(to),
        undo: ({ from }) => setCount(from),
      },
    },
  });

  const { updateCount } = undoables;

  const add = (amount: number) =>
    updateCount({ from: count, to: count + amount });
  const subtract = (amount: number) =>
    updateCount({ from: count, to: count - amount });
  const multiply = (amount: number) =>
    updateCount({ from: count, to: count * amount });
  const divide = (amount: number) =>
    updateCount({ from: count, to: count / amount });

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
