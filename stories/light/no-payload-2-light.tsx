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

interface State {
  count: number;
  amount: Nullber;
}

interface PayloadByType {
  add: void;
  subtract: void;
  updateAmount: PayloadFromTo<Nullber>;
}

export const NoPayload2Light: FC = () => {
  const [{ count, amount }, setState] = useState<State>({
    count: 0,
    amount: 1,
  });

  const addHandler = () =>
    setState(prev =>
      prev.amount ? { ...prev, count: prev.count + prev.amount } : prev
    );
  const subHandler = () =>
    setState(prev =>
      prev.amount ? { ...prev, count: prev.count - prev.amount } : prev
    );

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
      updateAmount: makeUndoableFTObjHandler(amount =>
        setState(prev => ({ ...prev, amount }))
      ),
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
