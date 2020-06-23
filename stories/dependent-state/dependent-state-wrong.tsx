import React, { FC, useState } from 'react';
import {
  PayloadFromTo,
  useFlexibleUndo,
  makeUndoableFTObjHandler,
  combineHandlers,
} from '../../.';
import { root, ui } from '../styles';
import { ActionList } from '../components/action-list';
import { NumberInput } from '../components/number-input';

type Nullber = number | null;

interface PayloadByType {
  add: void;
  subtract: void;
  updateAmount: PayloadFromTo<Nullber>;
}

export const DependentStateWrong: FC = () => {
  const [count, setCount] = useState(0);
  const [amount, setAmount] = useState<Nullber>(1);

  //Do NOT do this! Move 'amount' to the action payload or combine it
  //with the 'count' state so that you can get it from the prev state.
  const addHandler = () => amount && setCount(prev => prev + amount);
  const subHandler = () => amount && setCount(prev => prev - amount);

  const {
    undoables,
    canUndo,
    undo,
    canRedo,
    redo,
    history,
    timeTravel,
    switchToBranch,
  } = useFlexibleUndo<PayloadByType>({
    handlers: {
      add: combineHandlers(addHandler, subHandler),
      subtract: combineHandlers(subHandler, addHandler),
      updateAmount: makeUndoableFTObjHandler(setAmount),
    },
  });

  const { add, subtract, updateAmount } = undoables;

  return (
    <div className={root}>
      <div>count = {count}</div>
      <div className={ui}>
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
      <ActionList
        history={history}
        timeTravel={timeTravel}
        switchToBranch={switchToBranch}
      />
    </div>
  );
};
