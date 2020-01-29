import React, { useReducer } from 'react';
import {
  useFlexibleUndo,
  makeUndoableReducer,
  bindUndoableActionCreators,
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

export const BindUndoableActionCreators: React.FC = () => {
  const [{ count }, dispatch] = useReducer(reducer, { count: 0 });
  const boundActionCreators = bindUndoableActionCreators(
    dispatch,
    actionCreators
  );

  const { makeUndoables, canUndo, undo, canRedo, redo } = useFlexibleUndo();

  const { add, subtract } = makeUndoables<PayloadByType>(boundActionCreators);

  return (
    <>
      <div>count = {count}</div>
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
