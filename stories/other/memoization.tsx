import React, { FC, useState } from 'react';
import {
  useFlexibleUndo,
  invertHandlers,
  makeUndoableHandler,
  UFUOptions,
  UndoableHandlersByType,
} from '../../.';
import { ActionList } from '../components/action-list';
import { rootClass, uiContainerClass } from '../styles';
import { useMemo } from '@storybook/addons';

interface PayloadByType {
  add: number;
  subtract: number;
}

// Define the options outside of the component,
// or if the use can change them then wrap them in useMemo.
const options: UFUOptions = {
  clearFutureOnDo: false,
};

export const MakeUndoableHandlerExample: FC = () => {
  const [count, setCount] = useState(0);

  const handlers: UndoableHandlersByType<PayloadByType> = useMemo(() => {
    const undoableAddHandler = makeUndoableHandler(setCount)(
      amount => prev => prev + amount,
      amount => prev => prev - amount
    );
    return {
      add: undoableAddHandler,
      subtract: invertHandlers(undoableAddHandler),
    };
  }, []);

  const {
    undoables,
    canUndo,
    undo,
    canRedo,
    redo,
    history,
    timeTravel,
    switchToBranch,
    // No need to add the payload types, they will be inferred from the handlers:
  } = useFlexibleUndo({
    handlers,
    options,
  });

  const { add, subtract } = undoables;

  return (
    <div className={rootClass}>
      <div>count = {count}</div>
      <div className={uiContainerClass}>
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
