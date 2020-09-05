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
import { getLastItem } from '../components/util';

export const SwitchToBranchExample: FC = () => {
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
    timeTravel,
    switchToBranch,
  } = useUndoableEffects({
    handlers: {
      add: undoableAddHandler,
      subtract: invertHandlers(undoableAddHandler),
      updateAmount: makeUndoableFTHandler(setAmount),
    },
    options: {
      clearFutureOnDo: false, // this is the default
    },
  });

  const { add, subtract, updateAmount } = undoables;

  const { branches, currentBranchId, currentPosition } = history;
  const { stack } = branches[currentBranchId];

  const branchList = Object.values(branches).sort(
    (a, b) =>
      getLastItem(b.stack).created.getTime() -
      getLastItem(a.stack).created.getTime()
  );

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
          <select
            value={currentBranchId}
            onChange={e => switchToBranch(e.target.value, 'HEAD_OF_BRANCH')}
          >
            {branchList.map(b => (
              <option key={b.id} value={b.id}>
                Branch {b.number}
              </option>
            ))}
          </select>
          <button disabled={!canUndo} onClick={undo}>
            undo
          </button>
          <button disabled={!canRedo} onClick={redo}>
            redo
          </button>
        </div>
      </div>

      {stack
        .slice()
        .reverse()
        .map(({ id, type, payload }, index) => (
          <div
            key={id}
            onClick={() => timeTravel(stack.length - 1 - index)}
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
