import React, { FC, useState } from 'react';
import {
  PayloadFromTo,
  useFlexibleUndo,
  makeUndoableFromToHandler,
  makeUndoableHandler,
} from '../.';
import { rootClass, uiContainerClass } from './styles';
import { ActionList } from './components/action-list';

type Nullber = number | null;

interface PayloadByType {
  add: undefined;
  subtract: undefined;
  updateAmount: PayloadFromTo<Nullber>;
}

export const NoPayload: FC = () => {
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
  } = useFlexibleUndo();

  //Do NOT do this! - Do not use external state or props in your redo/undo handlers.
  //Refactor your actions so that you can get dependent state (here: 'amount')
  //from the action payload or refactor your state so that you can get it
  //from the previous state.
  const addHandler = () => amount && setCount(prev => prev + amount);
  const subHandler = () => amount && setCount(prev => prev - amount);

  const { add, subtract, updateAmount } = makeUndoables<PayloadByType>({
    add: makeUndoableHandler(addHandler, subHandler),
    subtract: makeUndoableHandler(subHandler, addHandler),
    updateAmount: makeUndoableFromToHandler(setAmount),
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
        <button disabled={!amount} onClick={() => amount && add(undefined)}>
          add
        </button>
        <button
          disabled={!amount}
          onClick={() => amount && subtract(undefined)}
        >
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
