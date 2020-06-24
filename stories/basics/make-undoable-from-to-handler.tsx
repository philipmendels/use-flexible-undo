import React, { useState } from 'react';
import {
  useFlexibleUndo,
  PayloadFromTo,
  makeUndoableFTObjHandler,
  wrapFTObjHandler,
} from '../../.';
import {
  rootStyle,
  topUIStyle,
  countStyle,
  actionsStyle,
} from '../../stories/styles';
import { ActionList } from '../../stories/components/action-list';
import { BranchNav } from '../components/branch-nav';

interface PayloadByType {
  updateCount: PayloadFromTo<number>;
}

export const MakeUndoableFTObjHandlerExample: React.FC = () => {
  const [count, setCount] = useState(1);

  const {
    undoables,
    undo,
    redo,
    history,
    timeTravel,
    switchToBranch,
  } = useFlexibleUndo<PayloadByType>({
    handlers: {
      updateCount: makeUndoableFTObjHandler(setCount),
    },
  });

  const { updateCount } = undoables;

  const countHandler = wrapFTObjHandler(updateCount, count);

  const add = countHandler(amount => prev => prev + amount);
  const subtract = countHandler(amount => prev => prev - amount);
  const multiply = countHandler(amount => prev => prev * amount);
  const divide = countHandler(amount => prev => prev / amount);

  return (
    <div className={rootStyle}>
      <div className={topUIStyle}>
        <div className={countStyle}>count = {count}</div>
        <div className={actionsStyle}>
          <button onClick={() => add(2)}>add 2</button>
          <button onClick={() => subtract(1)}>subtract 1</button>
          <button onClick={() => multiply(Math.PI)}>multi&pi;</button>
          <button onClick={() => divide(Math.PI)}>di&pi;de</button>
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
