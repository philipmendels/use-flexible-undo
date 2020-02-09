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
  add: number;
  subtract: number;
  updateAmount: PayloadFromTo<Nullber>;
}

const reducer: UReducer<State, PayloadByType> = (state, action) => {
  const { count } = state;
  const isUndo = action.meta?.isUndo;
  switch (action.type) {
    case 'add':
      return { ...state, count: count + action.payload };
    case 'subtract':
      return { ...state, count: count - action.payload };
    case 'updateAmount':
      const { from, to } = action.payload;
      return { ...state, amount: isUndo ? from : to };
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
      redo: payload => dispatch({ type: 'add', payload }),
      undo: payload => dispatch({ type: 'subtract', payload }),
    },
    subtract: {
      redo: payload => dispatch({ type: 'subtract', payload }),
      undo: payload => dispatch({ type: 'add', payload }),
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
      <ActionList stack={stack} timeTravel={timeTravel} />
    </div>
  );
};
