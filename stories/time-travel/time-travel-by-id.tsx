import React, { FC, useState } from 'react';
import {
  useUndoableEffects,
  makeUndoableFTHandler,
  makeUndoableHandler,
  invertHandlers,
} from 'use-flexible-undo';
import { addUpdater, subtractUpdater } from '../examples-util';
import {
  rootStyle,
  topUIStyle,
  countStyle,
  actionsStyle,
  getStackItemStyle,
} from '../styles';
import { NumberInput } from '../components/number-input';

export const TimeTravelByIdExample: FC = () => {
  const [count, setCount] = useState(0);
  const [amount, setAmount] = useState<number | null>(1);

  const undoableAddHandler = makeUndoableHandler(setCount)(
    addUpdater,
    subtractUpdater
  );

  const {
    undoables,
    canUndo,
    undo,
    canRedo,
    redo,
    history,
    timeTravelById,
  } = useUndoableEffects({
    handlers: {
      add: undoableAddHandler,
      subtract: invertHandlers(undoableAddHandler),
      updateAmount: makeUndoableFTHandler(setAmount),
    },
    options: {
      clearFutureOnDo: true,
    },
  });

  const { add, subtract, updateAmount } = undoables;

  const { branches, currentBranchId, currentPosition } = history;
  const { stack } = branches[currentBranchId];

  return (
    <div className={rootStyle}>
      <div className={topUIStyle}>
        <div className={countStyle}>count &nbsp;= &nbsp;{count}</div>
        <div className={actionsStyle}>
          <label>
            amount =&nbsp;
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
          <button disabled={!amount} onClick={() => amount && add(amount)}>
            add
          </button>
          <button disabled={!amount} onClick={() => amount && subtract(amount)}>
            subtract
          </button>
        </div>
        <div className={actionsStyle}>
          <button disabled={!canUndo} onClick={undo}>
            undo
          </button>
          <button disabled={!canRedo} onClick={redo}>
            redo
          </button>
        </div>
      </div>

      {stack
        .slice() // copy, because reverse is a mutable operation
        .reverse() // alternatively, you could try to reverse with css :)
        .map(({ id, type, payload }) => (
          <div
            key={id}
            onClick={() => timeTravelById(id)}
            className={getStackItemStyle({
              active: id === currentPosition.actionId,
            })}
          >
            {JSON.stringify({ type, payload })}
          </div>
        ))}
    </div>
  );
};
