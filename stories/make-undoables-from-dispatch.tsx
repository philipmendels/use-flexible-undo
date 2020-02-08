import React, { useReducer } from 'react';
import { useFlexibleUndo, makeUndoableReducer } from '../src';
import { uiContainerClass } from './styles';

interface State {
  count: number;
}

interface PayloadByType {
  add: number;
  subtract: number;
}

const { reducer, actionCreators } = makeUndoableReducer<State, PayloadByType>({
  add: {
    redo: n => state => ({ count: state.count + n }),
    undo: n => state => ({ count: state.count - n }),
  },
  subtract: {
    redo: n => state => ({ count: state.count - n }),
    undo: n => state => ({ count: state.count + n }),
  },
});

export const MakeUndoablesFromDispatch: React.FC = () => {
  const [{ count }, dispatch] = useReducer(reducer, { count: 0 });

  const {
    makeUndoablesFromDispatch,
    canUndo,
    undo,
    canRedo,
    redo,
  } = useFlexibleUndo();

  const { add, subtract } = makeUndoablesFromDispatch(dispatch, actionCreators);

  return (
    <>
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
    </>
  );
};
