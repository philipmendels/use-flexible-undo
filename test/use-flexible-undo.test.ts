import { renderHook, act } from '@testing-library/react-hooks';
import { vAdd, vScale } from 'vec-la-fp';

import { useFlexibleUndo } from '../src';

type Vector2d = [number, number];

type PayloadConfigByType = {
  setColor: {
    payload: string;
  };
  moveBy: {
    payload: Vector2d;
    isCustom: true;
  };
};

const useFakeState = <T>(initial: T) => {
  const state = { current: initial };
  const setter = (valueOrUpdater: T | ((prev: T) => T)) => {
    if (typeof valueOrUpdater === 'function') {
      state.current = (valueOrUpdater as (prev: T) => T)(state.current);
    } else {
      state.current = valueOrUpdater as T;
    }
  };
  return [state, setter] as const;
};

describe('use-flexible-undo', () => {
  test('undo/redo', () => {
    const [color, _setColor] = useFakeState('red');
    const [position, _setPosition] = useFakeState<Vector2d>([10, 20]);

    const { result } = renderHook(() =>
      useFlexibleUndo<PayloadConfigByType>({
        actionConfigs: {
          setColor: {
            updateState: _setColor,
          },
          moveBy: {
            updateState: delta => _setPosition(vAdd(delta)),
            makeActionForUndo: ({ type, payload }) => ({
              type,
              payload: vScale(-1, payload),
            }),
          },
        },
      })
    );
    expect(result.current.getCurrentBranch().stack.length).toBe(0);
    expect(result.current.canRedo()).toBe(false);
    expect(result.current.canUndo()).toBe(false);

    act(() => {
      result.current.undoables.moveBy([200, 100]);
      result.current.undoables.setColor(color.current, 'black');
    });

    expect(position.current).toStrictEqual([210, 120]);
    expect(color.current).toBe('black');

    act(() => {
      result.current.undo();
    });
    expect(position.current).toStrictEqual([210, 120]);
    expect(color.current).toBe('red');
    expect(result.current.canRedo()).toBe(true);
    expect(result.current.canUndo()).toBe(true);

    act(() => {
      result.current.undo();
    });
    expect(position.current).toStrictEqual([10, 20]);
    expect(color.current).toBe('red');
    expect(result.current.canUndo()).toBe(false);

    act(() => {
      result.current.redo();
    });
    expect(position.current).toStrictEqual([210, 120]);
    expect(color.current).toBe('red');

    act(() => {
      result.current.redo();
    });
    expect(position.current).toStrictEqual([210, 120]);
    expect(color.current).toBe('black');
    expect(result.current.canRedo()).toBe(false);
  });

  test('time travel and branching', () => {
    const [color, _setColor] = useFakeState('red');
    const [position, _setPosition] = useFakeState<Vector2d>([10, 20]);

    const { result } = renderHook(() =>
      useFlexibleUndo<PayloadConfigByType>({
        actionConfigs: {
          setColor: {
            updateState: _setColor,
          },
          moveBy: {
            updateState: delta => _setPosition(vAdd(delta)),
            makeActionForUndo: ({ type, payload }) => ({
              type,
              payload: vScale(-1, payload),
            }),
          },
        },
        options: {
          useBranchingHistory: true,
          maxHistoryLength: 100,
        },
      })
    );

    act(() => {
      result.current.undoables.moveBy([200, 100]);
      result.current.undoables.setColor(color.current, 'black');
      result.current.undoables.setColor(color.current, 'pink');
    });

    expect(result.current.getCurrentBranch().stack.length).toBe(3);

    act(() => {
      result.current.timeTravel(-1);
    });
    expect(position.current).toStrictEqual([10, 20]);
    expect(color.current).toBe('red');

    act(() => {
      result.current.timeTravel(0);
    });

    expect(position.current).toStrictEqual([210, 120]);
    expect(color.current).toBe('red');
    expect(Object.values(result.current.history.branches).length).toBe(1);

    const firstBranchId = result.current.history.currentBranchId;

    act(() => {
      result.current.undoables.setColor(color.current, 'green');
    });
    const secondBranchId = result.current.history.currentBranchId;
    expect(Object.values(result.current.history.branches).length).toBe(2);
    expect(firstBranchId).not.toBe(secondBranchId);

    act(() => {
      result.current.switchToBranch(firstBranchId, 'HEAD_OF_BRANCH');
    });
    expect(color.current).toBe('pink');

    act(() => {
      result.current.switchToBranch(secondBranchId, 'HEAD_OF_BRANCH');
    });
    expect(color.current).toBe('green');

    act(() => {
      result.current.timeTravel(0, firstBranchId);
    });
    expect(color.current).toBe('black');
  });
});
