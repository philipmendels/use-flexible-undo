import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { useInfiniteUndo } from '../.';
import { useState, useMemo } from 'react';

const App = () => {
  const [count, setCount] = useState(0);
  const { undo, redo, makeUndoable } = useInfiniteUndo();
  const increment = makeUndoable<number>({
    type: 'INCREMENT',
    do: n => setCount(count => count + n),
    undo: n => setCount(count => count - n),
  });

  const decrement = useMemo(
    () =>
      makeUndoable<number>({
        type: 'DECREMENT',
        do: n => setCount(count => count - n),
        undo: n => setCount(count => count + n),
      }),
    [makeUndoable]
  );

  return (
    <div>
      <button onClick={() => increment(3)}> increment </button>
      <button onClick={() => decrement(2)}> decrement </button>
      <button onClick={() => undo()}> undo </button>
      <button onClick={() => redo()}> redo </button>
      count: {count}
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
