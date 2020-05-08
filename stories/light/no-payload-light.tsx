import React, { FC, useState } from 'react';
import {
  PayloadFromTo,
  makeUndoableFTObjHandler,
  useFlexibleUndoLight,
  combineHandlers,
} from '../../.';
import { rootClass, uiContainerClass } from '../styles';
import { ActionList } from '../components/action-list';
import { NumberInput } from '../components/number-input';

type Nullber = number | null;

interface PayloadByType {
  add: void;
  subtract: void;
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
      add: combineHandlers(addHandler, subHandler),
      subtract: combineHandlers(subHandler, addHandler),
      updateAmount: makeUndoableFTObjHandler(setAmount),
    },
  });

  const { add, subtract, updateAmount } = undoables;

  return (
    <div className={rootClass}>
      <div>count = {count}</div>
      <div className={uiContainerClass}>
        <label>
          amount:&nbsp;
          <NumberInput
            value={amount}
            onChange={value =>
              updateAmount({
                from: amount,
                to: value,
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
