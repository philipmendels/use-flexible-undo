### Intro Readme & Code

The **useFlexibleUndo** hook takes a **handlers** object with pairs of do/redo ("drdo") and undo handlers by action type, and returns an **undoables** object with undoable functions by action type. Note that the action types ("add", "subtract") are therefore equal to the function names. Additionally the hook returns **canUndo** and **canRedo** booleans, and of course ... the **undo** and **redo** functions.

If you use TypeScript then you can type **useFlexibleUndo** with a record of payload by action type ("PBT"). Alternatively you could type the payloads within the handlers and let PBT be inferred.

```typescript
import React, { FC, useState } from 'react';
import { rootStyle, topUIStyle, countStyle, actionsStyle } from '../styles';
import { useFlexibleUndo } from 'useFlexibleUndo';

// action Payload By action Type
interface PBT {
  add: number;
  subtract: number;
}

export const IntroExample: FC = () => {
  const [count, setCount] = useState(0);

  const { undoables, canUndo, undo, canRedo, redo } = useFlexibleUndo<PBT>({
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
          <button disabled={!canUndo} onClick={undo}>
            undo
          </button>
          <button disabled={!canRedo} onClick={redo}>
            redo
          </button>
        </div>
      </div>
    </div>
  );
};
```
