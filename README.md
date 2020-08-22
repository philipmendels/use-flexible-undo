# useFlexibleUndo

This library allows you to add a branching undo history to your React project. Because ... the very first thing every user will demand for any kind of app is a branching undo history.

No, all jokes aside, like me you might be interested to experiment with undo/redo UI 😎 and implementation 🤓. This lib gives you two [React hooks](https://reactjs.org/docs/hooks-custom.html) to do so. They keep track of a branching history of undoable actions (as opposed to a history of snapshots of app state). Both offer identical functionality and an almost identical API, but they differ in how they integrate with your app state:

- **useUndoableEffects** allows you to add undo/redo functionality on top of existing state, which means that the undo history state and your app state are managed separately. You can use this hook together with (multiple calls to) useState, useReducer or any combination thereof. Quite nice for prototyping.
- **useUndoableReducer** manages your application state and undo history state together. This hook takes an undoable reducer which can be created with the included utility **makeUndoableReducer**.

Check out the StoryBook for a wide range of examples with documentation and source code.

## useUndoableEffects

```typescript
import React, { FC, useState } from 'react';
import { useFlexibleUndo } from 'use-flexible-undo';

// action Payload By action Type
interface PBT {
  add: number;
  subtract: number;
  updateCount: {
    from: number;
    to: number;
  };
}

export const MyFunctionComponent: FC = () => {
  const [count, setCount] = useState(0);
  const [amount, setAmount] = useState<number | null>(1);

  const {
    undoables,
    canUndo,
    undo,
    canRedo,
    redo,
    history,
    timeTravel,
    switchToBranch,
  } = useFlexibleUndo<PBT>({
    handlers: {
      add: {
        drdo: amount => setCount(prev => prev + amount),
        undo: amount => setCount(prev => prev - amount),
      },
      subtract: {
        drdo: amount => setCount(prev => prev - amount),
        undo: amount => setCount(prev => prev + amount),
      },
      updateCount: {
        drdo: ({ to }) => setCount(to),
        undo: ({ from }) => setCount(from),
      },
    },
  });

  const { add, subtract, updateAmount } = undoables;

  return <> your UI here </>;
};
```

```typescript
import React, { FC, useState } from 'react';
import {
  useFlexibleUndo,
  makeUndoableFTHandler,
  makeUndoableHandler,
  invertHandlers,
} from 'use-flexible-undo';

export const MyFunctionComponent: FC = () => {
  const [count, setCount] = useState(0);
  const [amount, setAmount] = useState<number | null>(1);

  const undoableAddHandler = makeUndoableHandler(setCount)(
    amount => prev => prev + amount
    amount => prev => prev - amount
  );

  const { undoables, ...etc } = useFlexibleUndo({
    handlers: {
      add: undoableAddHandler,
      subtract: invertHandlers(undoableAddHandler),
      updateAmount: makeUndoableFTHandler(setAmount),
    },
  });

  const { add, subtract, updateAmount } = undoables;

  return <> your UI here </>;
};
```

```typescript
import React, { FC, useState } from 'react';
import {
  useFlexibleUndo,
  makeHandler,
  makeFTHandler,
  invertFTHandler,
} from 'use-flexible-undo';

export const MyFunctionComponent: FC = () => {
  const [count, setCount] = useState(0);
  const [amount, setAmount] = useState<number | null>(1);

  const countHandler = makeHandler(setCount);
  const addHandler = countHandler(amount => prev => prev + amount);
  const subHandler = countHandler(amount => prev => prev - amount);
  const updateAmountHandler = makeFTHandler(setAmount);

  const { undoables, ...etc } = useFlexibleUndo({
    drdoHandlers: {
      add: addHandler,
      subtract: subHandler,
      updateAmount: updateAmountHandler,
    },
    undoHandlers: {
      add: subHandler,
      subtract: addHandler,
      updateAmount: invertFTHandler(updateAmountHandler),
    },
  });

  const { add, subtract, updateAmount } = undoables;

  return <> your UI here </>;
};
```
