You can separate your redo/undo handlers from your state update logic by using a reducer. However, as you can see, this involves writing a fair amount of boiler plate code. Check the next example for a utility that makes life easier.

Full code:

```typescript
import React, { FC, useReducer } from 'react';
import { useFlexibleUndo, PayloadFromTo, UReducer } from '../.';
import { ActionList } from './components/action-list';
import { rootClass, uiContainerClass } from './styles';

type Nullber = number | null;

interface State {
  count: number;
  amount: Nullber;
}

interface PayloadByType {
  add: undefined;
  subtract: undefined;
  updateAmount: PayloadFromTo<Nullber>;
}

const reducer: UReducer<State, PayloadByType> = (prevState, action) => {
  const { count, amount } = prevState;
  const isUndo = action.meta?.isUndo;
  switch (action.type) {
    case 'add':
      return amount ? { ...prevState, count: count + amount } : prevState;
    case 'subtract':
      return amount ? { ...prevState, count: count - amount } : prevState;
    case 'updateAmount':
      const { from, to } = action.payload;
      return { ...prevState, amount: isUndo ? from : to };
    default:
      throw new Error();
  }
};

export const UsingReducer: FC = () => {
  const [{ count, amount }, dispatch] = useReducer(reducer, {
    count: 0,
    amount: 1,
  });

  const {
    makeUndoables,
    canUndo,
    undo,
    canRedo,
    redo,
    stack,
    timeTravel,
  } = useFlexibleUndo();

  const { add, subtract, updateAmount } = makeUndoables<PayloadByType>({
    add: {
      redo: () => dispatch({ type: 'add' }),
      undo: () => dispatch({ type: 'subtract' }),
    },
    subtract: {
      redo: () => dispatch({ type: 'subtract' }),
      undo: () => dispatch({ type: 'add' }),
    },
    updateAmount: {
      redo: payload => dispatch({ type: 'updateAmount', payload }),
      undo: payload =>
        dispatch({ type: 'updateAmount', payload, meta: { isUndo: true } }),
    },
  });

  return (
    <div className={rootClass}>
      <div>count = {count}</div>
      <div className={uiContainerClass}>
        <label>
          amount:&nbsp;
          <input
            type="number"
            value={amount === null ? '' : amount}
            onChange={({ target: { value } }) =>
              updateAmount({
                from: amount,
                to: value === '' ? null : Number(value),
              })
            }
          />
        </label>
        <button disabled={!amount} onClick={() => add()}>
          add
        </button>
        <button disabled={!amount} onClick={() => subtract()}>
          subtract
        </button>
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
