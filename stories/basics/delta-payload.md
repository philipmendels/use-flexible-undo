### State delta as payload - Readme & Code

In the previous example there were only basic undo and redo buttons. Here we use the **history** state and the **switchToBranch** and **timeTravel** functions returned by **useUndoableEffects** to create an interactive, branching undo history. The UI for this is not part of the library, but we will address the functionality in more detail in "time travel" chapter. Finally note that we do not necessarily need to use the **canUndo** and **canRedo** booleans. They are returned by the hook for convenience, but you can derive them yourself from the **history** state as well. Here this is hidden within the "BranchNav" component.

```typescript
import React, { FC, useState } from 'react';
import { useUndoableEffects } from 'use-flexible-undo';
import { rootStyle, topUIStyle, countStyle, actionsStyle } from '../styles';
import { BranchNav } from '../components/branch-nav';
import { ActionList } from '../components/action-list';

// action Payload By action Type
interface PBT {
  add: number;
  subtract: number;
}

export const DeltaPayloadExample: FC = () => {
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
      add: {
        drdo: amount => setCount(prev => prev + amount),
        undo: amount => setCount(prev => prev - amount),
      },
      subtract: {
        drdo: amount => setCount(prev => prev - amount),
        undo: amount => setCount(prev => prev + amount),
      },
    },
  });

  const { add, subtract } = undoables;

  return (
    <div className={rootStyle}>
      <div className={topUIStyle}>
        <div className={countStyle}>count = {count}</div>
        <div className={actionsStyle}>
          <button onClick={() => add(2)}>add 2</button>
          <button onClick={() => subtract(1)}>subtract 1</button>
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
