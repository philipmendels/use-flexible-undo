The utility **makeUndoableFTObjHandler** takes a state setter function (e.g. the one returned from React.useState) as single argument. It returns an object with do/redo and undo handlers that take an object with the current 'from' state and the new 'to' state as payload.

```typescript
const [count, setCount] = useState(1);

const { updateCount } = makeUndoables<PayloadByType>({
  updateCount: makeUndoableFTObjHandler(setCount),
});

const multiply = (amount: number) =>
  updateCount({ from: count, to: count * amount });
const divide = (amount: number) =>
  updateCount({ from: count, to: count / amount });
```

Full code:

```typescript
import React, { useState } from 'react';
import { useFlexibleUndo, PayloadFromTo, makeUndoableFTObjHandler } from '../.';
import { rootClass, uiContainerClass } from './styles';
import { ActionList } from './components/action-list';

interface PayloadByType {
  updateCount: PayloadFromTo<number>;
}

export const MakeUndoableFTObjHandlerExample: React.FC = () => {
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
    updateCount: makeUndoableFTObjHandler(setCount),
  });

  const multiply = (amount: number) =>
    updateCount({ from: count, to: count * amount });
  const divide = (amount: number) =>
    updateCount({ from: count, to: count / amount });

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
