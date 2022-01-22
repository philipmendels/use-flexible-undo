import { useState, useMemo } from 'react';

import {
  makeUndoableEffects,
  MakeUndoableEffectsProps,
  PayloadConfigByType,
  CustomData,
  OmitStrict,
  History,
} from 'undomundo';

export const useFlexibleUndo = <
  PBT extends PayloadConfigByType,
  CBD extends CustomData = {}
>({
  actionConfigs,
  options,
  initialHistory,
  initBranchData,
}: OmitStrict<MakeUndoableEffectsProps<PBT, CBD>, 'onChange'>) => {
  const [history, setHistory] = useState(initialHistory);

  const { getCurrentHistory, ...returnValues } = useMemo(
    () =>
      makeUndoableEffects({
        // Pass 'history' instead of 'initialHistory' so that the internal state
        // of 'makeUndoableEffects' stays in sync with the history state.
        initialHistory: history,
        actionConfigs,
        initBranchData,
        options,
        onChange: evt => setHistory(evt.newHistory),
      }),
    // Do not add 'history' to dependency array - that would create a cycle.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // [actionConfigs, initBranchData, options]
    //
    // MakeUndoableEffects' will run on every state change, unless the user
    // memoizes the actionConfigs and either memoizes the other deps or defines
    // the other deps as constants outside of a component. For now let's
    // choose to simply use an empty dependency array here, which means
    // that changes to props such as 'options' after initialization will be ignored.
    //
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  return {
    ...returnValues,
    history,
    setHistory: (history: History<PBT, CBD>) => {
      returnValues.setHistory(history);
      // setHistory returned by makeUndoableEffects does not trigger
      // an onChange event, so we need to update the react state manually:
      setHistory(history);
    },
  };
};
