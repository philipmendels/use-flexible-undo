# useFlexibleUndo

This library allows you to add a branching undo history to your React project. Because ... the very first thing every user will demand for any kind of app is a branching undo history.

<img src="https://github.com/philipmendels/use-flexible-undo/raw/master/assets/countfive.gif" width="426"/>

All jokes aside, like me you might be interested in experimenting with undo/redo UI 😎 and implementation 🤓. This lib gives you two [React hooks](https://reactjs.org/docs/hooks-custom.html) to do so. They keep track of a history of undoable actions (as opposed to a history of snapshots of app state). Both hooks offer identical functionality and an almost identical API, but they differ in how they integrate with your app state:

- **useUndoableEffects** allows you to add undo/redo functionality on top of existing state, which means that the undo history state and your app state are managed separately. You can use this hook together with (multiple calls to) useState, useReducer or any combination thereof. Quite nice for prototyping.
- **useUndoableReducer** manages your application state and undo history state together. This hook takes an undoable reducer which can be created with the included utility **makeUndoableReducer**.

Check out the StoryBook for a wide range of examples with documentation and source code.

## useUndoableEffects

```typescript
import React, { FC, useState } from 'react';
import { useUndoableEffects } from 'use-flexible-undo';

type nullber = number | null;

// action Payload By action Type
interface PBT {
  add: number;
  subtract: number;
  updateAmount: {
    from: nullber;
    to: nullber;
  };
}

export const MyFunctionComponent: FC = () => {
  const [count, setCount] = useState(0);
  const [amount, setAmount] = useState<nullber>(1);

  const {
    undoables,
    canUndo,
    undo,
    canRedo,
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
      updateAmount: {
        drdo: ({ to }) => setAmount(to),
        undo: ({ from }) => setAmount(from),
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
  useUndoableEffects,
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

  const { undoables, ...etc } = useUndoableEffects({
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
  useUndoableEffects,
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

  const { undoables, ...etc } = useUndoableEffects({
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

## useUndoableReducer

```typescript
import React, { FC } from 'react';
import {
  makeUnducer,
  invertHandlers,
  makeUndoableFTHandler,
  makeUndoableUpdater,
  makeUndoableReducer,
  useUndoableReducer,
} from 'use-flexible-undo';
import { merge } from '../examples-util';

type nullber = number | null;

interface State {
  count: number;
  amount: nullber;
}

interface PayloadByType {
  add: void;
  subtract: void;
  updateAmount: {
    from: nullber;
    to: nullber;
  };
}

const undoableAddHandler = makeUndoableUpdater(
  (state: State) => state.count,
  count => merge({ count })
)(() => state => state.amount || 0)(
  amount => prev => prev + amount,
  amount => prev => prev - amount
);

const { reducer, actionCreators } = makeUnducer<State, PayloadByType>({
  add: undoableAddHandler,
  subtract: invertHandlers(undoableAddHandler),
  updateAmount: makeUndoableFTHandler(amount => merge({ amount })),
});

const undoableReducer = makeUndoableReducer(reducer);

export const MyFunctionComponent: FC = () => {
  const { state, undoables, ...etc } = useUndoableReducer({
    reducer: undoableReducer,
    initialState: {
      count: 0,
      amount: 1,
    },
    actionCreators,
  });

  const { count, amount } = state;

  const { add, subtract, updateAmount } = undoables;

  return <> your UI here </>;
};
```
