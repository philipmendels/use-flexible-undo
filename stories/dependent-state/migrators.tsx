import React, { FC, useState } from 'react';
import {
  useUndoableEffects,
  makeUndoableFTHandler,
  makeUndoableHandler,
  invertHandlers,
} from '../../src';
import { rootStyle, topUIStyle, actionsStyle } from '../styles';
import { ActionList } from '../components/action-list';
import { NumberInput } from '../components/number-input';
import { BranchNav } from '../components/branch-nav';

export const MigratorsExample: FC = () => {
  const [count, setCount] = useState<number | null>(0);

  const undoableAddHandler = makeUndoableHandler(setCount)(
    (amount: number) => prev => (prev === null ? null : prev + amount),
    (amount: number) => prev => (prev === null ? null : prev - amount)
  );

  const {
    undoables,
    undo,
    redo,
    history,
    timeTravel,
    switchToBranch,
    skip,
  } = useUndoableEffects({
    handlers: {
      add: undoableAddHandler,
      subtract: invertHandlers(undoableAddHandler),
      updateCount: makeUndoableFTHandler(setCount),
    },
    migrators: {
      add: amount => ({
        updateCount: ({ from, to }) => ({
          newPayload: { from: from === null ? null : from - amount, to },
          isReady: true,
        }),
      }),
    },
  });

  const { add, subtract, updateCount } = undoables;

  return (
    <div className={rootStyle}>
      <div className={topUIStyle}>
        <div className={actionsStyle}>
          <label>
            count =&nbsp;&nbsp;
            <NumberInput
              value={count}
              onChange={value =>
                updateCount({
                  from: count,
                  to: value,
                })
              }
            />
          </label>
          <button
            disabled={count === null}
            onClick={() => count !== null && add(2)}
          >
            add 2
          </button>
          <button
            disabled={count === null}
            onClick={() => count !== null && subtract(1)}
          >
            subtract 1
          </button>
          <button onClick={() => skip()}>skip selected action</button>
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
