import React, { useState } from 'react';
import { useInfiniteUndo } from '../src';
import { btnContainerStyle } from './styles';
import { makeHandler, invertUndoableHandler } from '../src/util';
import { CurriedUpdater, UndoableHandler } from '../src/index.types';

interface PayloadByType {
  add: number;
  subtract: number;
}

const incr: CurriedUpdater<number> = n => prev => prev + n;
const decr: CurriedUpdater<number> = n => prev => prev - n;

export const MakeUndoablesInvert: React.FC = () => {
  const [count, setCount] = useState(0);

  const { makeUndoables, canUndo, undo, canRedo, redo } = useInfiniteUndo();

  const undoableAddHandler: UndoableHandler<number> = {
    do: makeHandler(setCount)(incr),
    undo: makeHandler(setCount)(decr),
  };

  const { add, subtract } = makeUndoables<PayloadByType>({
    add: undoableAddHandler,
    subtract: invertUndoableHandler(undoableAddHandler),
  });

  return (
    <>
      <div>count = {count}</div>
      <div style={btnContainerStyle}>
        <button onClick={() => add(1)}>add 1</button>
        <button onClick={() => subtract(2)}>subtract 2</button>
        <button disabled={!canUndo} onClick={() => undo()}>
          undo
        </button>
        <button disabled={!canRedo} onClick={() => redo()}>
          redo
        </button>
      </div>
    </>
  );
};
