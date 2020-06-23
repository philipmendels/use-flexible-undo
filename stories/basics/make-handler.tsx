import React, { FC, useState } from 'react';
import { useFlexibleUndo, makeHandler, combineHandlers } from '../../.';
import { root, ui } from '../styles';
import { ActionList } from '../components/action-list';

interface PayloadByType {
  add: number;
  subtract: number;
}

export const MakeHandlerExample: FC = () => {
  const [count, setCount] = useState(0);

  const countHandler = makeHandler(setCount);
  const addHandler = countHandler(amount => prev => prev + amount);
  const subHandler = countHandler(amount => prev => prev - amount);

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
    },
  });

  const { add, subtract } = undoables;

  return (
    <div className={root}>
      <div>count = {count}</div>
      <div className={ui}>
        <button onClick={() => add(1)}>add 1</button>
        <button onClick={() => subtract(2)}>subtract 2</button>
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
