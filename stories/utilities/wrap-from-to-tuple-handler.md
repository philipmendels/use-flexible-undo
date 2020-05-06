Full code:

```typescript
import React, { useState } from 'react';
import {
  useFlexibleUndo,
  makeUndoableFTTupleHandler,
  wrapFTTupleHandler,
} from 'use-flexible-undo';
import { rootClass, uiContainerClass } from '../styles';
import { ActionList } from '../components'/action-list';

interface PayloadByType {
  updateCount: [number, number];
}

export const WrapFTTupleHandlerExample: React.FC = () => {
  const [count, setCount] = useState(1);

  const {
    makeUndoables,
    canUndo,
    undo,
    canRedo,
    redo,
    stack,
    timeTravel,
  } = useFlexibleUndo();

  const { updateCount } = makeUndoables<PayloadByType>({
    updateCount: makeUndoableFTTupleHandler(setCount),
  });

  const countHandler = wrapFTTupleHandler(updateCount, count);
  const multiply = countHandler(amount => prev => prev * amount);
  const divide = countHandler(amount => prev => prev / amount);

  return (
    <div className={rootClass}>
      <div>count = {count}</div>
      <div className={uiContainerClass}>
        <button onClick={() => multiply(Math.PI)}>multi&pi;</button>
        <button onClick={() => divide(Math.PI)}>di&pi;de</button>
        <button disabled={!canUndo} onClick={() => undo()}>
          undo
        </button>
        <button disabled={!canRedo} onClick={() => redo()}>
          redo
        </button>
      </div>
      <ActionList stack={stack} timeTravel={timeTravel} />
    </div>
  );
};
```
