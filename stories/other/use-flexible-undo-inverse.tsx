import React, { FC, useState } from 'react';
import { makeHandler, invertFTHandler } from '../../.';
import { addUpdater, subtractUpdater } from '../examples-util';
import { rootStyle, topUIStyle, countStyle, actionsStyle } from '../styles';
import { ActionList } from '../components/action-list';
import { NumberInput } from '../components/number-input';
import { BranchNav } from '../components/branch-nav';
import { useFlexibleUndoInverse } from '../../src/use-flexible-undo-inverse';
import { makeFTHandler } from '../../src';

export const UseFlexibleUndoInverseExample: FC = () => {
  const [count, setCount] = useState(0);
  const [amount, setAmount] = useState<number | null>(1);

  const countHandler = makeHandler(setCount);
  const addHandler = countHandler(addUpdater);
  const subHandler = countHandler(subtractUpdater);
  const updateAmountHandler = makeFTHandler(setAmount);

  const {
    undoables,
    undo,
    redo,
    history,
    timeTravel,
    switchToBranch,
  } = useFlexibleUndoInverse({
    drdoHandlers: {
      add: addHandler,
      subtract: subHandler,
      updateAmount: updateAmountHandler,
    },
    undoHandlers: {
      add: subHandler,
      subtract: addHandler,
      updateAmount: invertFTHandler(updateAmountHandler),
    },
  });

  const { add, subtract, updateAmount } = undoables;

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
        <BranchNav
          history={history}
          switchToBranch={switchToBranch}
          undo={undo}
          redo={redo}
        />
      </div>
      <ActionList
        history={history}
        timeTravel={timeTravel}
        switchToBranch={switchToBranch}
      />
    </div>
  );
};