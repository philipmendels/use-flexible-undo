import React, { FC, useState } from 'react';
import {
  PayloadFromTo,
  makeUndoableFromToHandler,
  makeUndoableHandler,
  useFlexibleUndoLight,
} from '..';
import { rootClass, uiContainerClass } from './styles';
import { ActionList } from './components/action-list';

type Nullber = number | null;

interface PayloadByType {
  add: undefined;
  subtract: undefined;
  updateAmount: PayloadFromTo<Nullber>;
}

export const NoPayloadLight: FC = () => {
  const [count, setCount] = useState(0);
  const [amount, setAmount] = useState<Nullber>(1);

  //Do NOT do this! - Do not use external state or props in your redo/undo handlers.
  //Refactor your actions so that you can get dependent state (here: 'amount')
  //from the action payload or refactor your state so that you can get it
  //from the previous state.
  const addHandler = () => {
    amount && setCount(prev => prev + amount);
  };

  const subHandler = () => {
    amount && setCount(prev => prev - amount);
  };

  const {
    undoables,
    canUndo,
    undo,
    canRedo,
    redo,
    stack,
    timeTravel,
  } = useFlexibleUndoLight<PayloadByType>({
    handlers: {
      add: makeUndoableHandler(addHandler, subHandler),
      subtract: makeUndoableHandler(subHandler, addHandler),
      updateAmount: makeUndoableFromToHandler(setAmount),
    },
    options: {
      callHandlersFrom: 'EFFECT',
    },
  });

  const { add, subtract, updateAmount } = undoables;

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
        <button disabled={!amount} onClick={() => amount && add()}>
          add
        </button>
        <button disabled={!amount} onClick={() => amount && subtract()}>
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
