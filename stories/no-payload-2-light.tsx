import React, { FC, useState } from 'react';
import {
  PayloadFromTo,
  makeUndoableFromToHandler,
  makeUndoableHandler,
  useFlexibleUndoLight,
} from '../.';
import { rootClass, uiContainerClass } from './styles';
import { ActionList } from './components/action-list';

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
      add: makeUndoableHandler(addHandler, subHandler),
      subtract: makeUndoableHandler(subHandler, addHandler),
      updateAmount: makeUndoableFromToHandler(amount =>
        setState(prev => ({ ...prev, amount }))
      ),
    },
    options: {
      callHandlersFrom: 'UPDATER',
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
        {/* <button disabled={!canUndo} onClick={() => setTimeout(undo, 1000)}>
          undo
        </button>
        <button disabled={!canRedo} onClick={() => setTimeout(redo, 1000)}>
          redo
        </button> */}
      </div>
      <ActionList stack={stack} timeTravel={timeTravel} />
    </div>
  );
};
