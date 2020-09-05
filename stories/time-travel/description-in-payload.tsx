import React, { FC, useState, ReactNode } from 'react';
import {
  PayloadFromTo,
  useUndoableEffects,
  makeUndoableFTHandler,
  ActionUnion,
} from 'use-flexible-undo';
import { rootStyle, topUIStyle, countStyle, actionsStyle } from '../styles';
import { NumberInput } from '../components/number-input';
import { BranchNav } from '../components/branch-nav';
import { ActionList } from '../components/action-list';

type Nullber = number | null;

interface PayloadByType {
  updateCount: {
    from: number;
    to: number;
    userAction: 'Add' | 'Subtract';
  };
  updateAmount: PayloadFromTo<Nullber>;
}

type PayloadDescribers = {
  [K in keyof PayloadByType]: (payload: PayloadByType[K]) => ReactNode;
} & {
  start: () => ReactNode;
};

const payloadDescribers: PayloadDescribers = {
  updateCount: ({ from, to, userAction }) =>
    `${userAction} ${Math.abs(to - from)} to count`,
  updateAmount: ({ from, to }) => `Update amount from ${from} to ${to}`,
  start: () => 'Start',
};

const describeAction = (action: ActionUnion<PayloadByType>) =>
  payloadDescribers[action.type](action.payload as any);

export const DescriptionInPayloadExample: FC = () => {
  const [count, setCount] = useState(0);
  const [amount, setAmount] = useState<Nullber>(1);

  const {
    undoables,
    undo,
    redo,
    history,
    timeTravel,
    switchToBranch,
  } = useUndoableEffects<PayloadByType>({
    handlers: {
      updateCount: makeUndoableFTHandler(setCount),
      updateAmount: makeUndoableFTHandler(setAmount),
    },
  });

  const { updateCount, updateAmount } = undoables;

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
          <button
            disabled={!amount}
            onClick={() =>
              amount &&
              updateCount({
                from: count,
                to: count + amount,
                userAction: 'Add',
              })
            }
          >
            add
          </button>
          <button
            disabled={!amount}
            onClick={() =>
              amount &&
              updateCount({
                from: count,
                to: count - amount,
                userAction: 'Subtract',
              })
            }
          >
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
        describeAction={describeAction}
      />
    </div>
  );
};
