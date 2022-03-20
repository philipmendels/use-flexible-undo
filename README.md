# use-flexible-undo

React hook that lets you use undomundo's branching undo/redo functionality independently of how you structure your application state. Note that for most use cases it's probably better to use undomundo directly, e.g. to use undomundo's `makeUndoableReducer` in combination with React's `useReducer`. That will integrate your app state with the undo history state and enables multi-user undo/redo. See [undomundo](https://github.com/philipmendels/undomundo) for more details.

```TypeScript
import { FC, useState } from 'react';
import { useFlexibleUndo } from 'use-flexible-undo';

// utilities for manipulating vectors:
import { vAdd, vScale } from 'vec-la-fp';

type Vector2d = [number, number];

type PayloadConfigByType = {
  setColor: {
    payload: string;
    // By default actions are considered to be absolute.
  };
  moveBy: {
    payload: Vector2d;
    // If you need to you can define relative actions.
    isRelative: true;
  };
};

export const MyFunctionComponent: FC = () => {
  // Manage state however you like:
  // - separate useState calls
  // - state object in single useState
  // - useReducer
  // - external state management solution
  // - a combination of the above, etc...

  // In this example we prefix the non-undoable setters
  // with _ to differentiate them from the undoable versions,
  // but you're free to use any naming convention.
  const [color, _setColor] = useState('red');
  const [position, _setPosition] = useState<Vector2d>([0, 0]);

  const {
    undoables,
    canUndo,
    undo,
    canRedo,
    redo,
    history,
    timeTravel,
    switchToBranch,
  } = useFlexibleUndo<PayloadConfigByType>({
    // All arguments / options are static, changes after
    // initialization will be ignored.
    actionConfigs:{
      setColor: {
        updateState: _setColor,
      },
      moveBy: {
        updateState: delta => _setPosition(vAdd(delta)),
        // We have no inverse action defined for 'moveBy',
        // so for undo we keep the same action type and negate the payload:
        makeActionForUndo: ({ type, payload }) => ({
          type,
          payload: vScale(-1, payload),
        }),
      },
    },
    options: {
      useBranchingHistory: true, // defaults to false
      maxHistoryLength: 100, // defaults to Infinity
    },
  });

  const { setColor, moveBy } = undoables;

  return (
    <>
      // For an absolute action you need to provide the undo value
      // (current state) and the redo value (new state):
      <button onClick={() => setColor(color, 'black')}>Paint it black!</button>

      // For a relative action you only need to provide the delta:
      <button onClick={() => moveBy([100, 0])}>Move aside!</button>

      <button disabled={!canUndo()} onClick={undo}>undo</button>
      // etc..
    </>
  )
};
```
