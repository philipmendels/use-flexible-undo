import React, { useState } from 'react';
import {
  useUndoableEffects,
  makeUndoableFTHandler,
  wrapFTHandler,
} from 'use-flexible-undo';
import {
  addUpdater,
  subtractUpdater,
  multiplyUpdater,
  divideUpdater,
} from '../examples-util';
import { rootStyle, topUIStyle, countStyle, actionsStyle } from '../styles';
import { BranchNav } from '../components/branch-nav';
import { ActionList } from '../components/action-list';

export const MakeUndoableFTHandlerExample: React.FC = () => {
  const [count, setCount] = useState(0);

  const {
    undoables,
    undo,
    redo,
    history,
    timeTravel,
    switchToBranch,
  } = useUndoableEffects({
    handlers: {
      updateCount: makeUndoableFTHandler(setCount),
    },
  });

  const { updateCount } = undoables;

  const countHandler = wrapFTHandler(updateCount, count);

  const add = countHandler(addUpdater);
  const subtract = countHandler(subtractUpdater);
  const multiply = countHandler(multiplyUpdater);
  const divide = countHandler(divideUpdater);

  return (
    <div className={rootStyle}>
      <div className={topUIStyle}>
        <div className={countStyle}>count = {count}</div>
        <div className={actionsStyle}>
          <button onClick={() => add(Math.PI)}>add PI</button>
          <button onClick={() => subtract(Math.PI)}>subtract PI</button>
          <button onClick={() => multiply(Math.PI)}>multiPI</button>
          <button onClick={() => divide(Math.PI)}>diPIde</button>
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
