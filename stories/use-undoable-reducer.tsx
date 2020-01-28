import React from 'react';
import {
  useInfiniteUndo,
  makeUndoableReducer,
  useUndoableReducer,
} from '../src';
import { btnContainerClass } from './styles';

interface State {
  count: number;
}

interface PayloadByType {
  add: number;
  subtract: number;
}

const { reducer, actionCreators } = makeUndoableReducer<State, PayloadByType>({
  add: {
    do: n => state => ({ count: state.count + n }),
    undo: n => state => ({ count: state.count - n }),
  },
  subtract: {
    do: n => state => ({ count: state.count - n }),
    undo: n => state => ({ count: state.count + n }),
  },
});

export const UseUndoableReducer: React.FC = () => {
  const { state, boundActionCreators } = useUndoableReducer(
    reducer,
    { count: 0 },
    actionCreators
  );

  const { makeUndoables, canUndo, undo, canRedo, redo } = useInfiniteUndo();

  const { add, subtract } = makeUndoables<PayloadByType>(boundActionCreators);

  return (
    <>
      <div>count = {state.count}</div>
      <div className={btnContainerClass}>
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
