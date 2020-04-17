import React from 'react';
import { storiesOf } from '@storybook/react';
import { MakeUndoableDelta } from './make-undoable-delta.stories';
import MakeUndoableDeltaIntro from './make-undoable-delta-intro.md';
import MakeUndoableDeltaReadme from './make-undoable-delta.md';
import { MakeUndoableMulti } from './make-undoable-multi';
import MakeUndoableMultiIntro from './make-undoable-multi-intro.md';
import MakeUndoableMultiReadme from './make-undoable-multi.md';
import { MakeUndoables } from './make-undoables';
import MakeUndoablesIntro from './make-undoables-intro.md';
import MakeUndoablesReadme from './make-undoables.md';
import { MakeUndoableNegate } from './make-undoable-negate';
import MakeUndoableNegateIntro from './make-undoable-negate-intro.md';
import MakeUndoableNegateReadme from './make-undoable-negate.md';
import { MakeUndoablesUtil } from './make-undoables-util';
import MakeUndoablesUtilIntro from './make-undoables-util-intro.md';
import MakeUndoablesUtilReadme from './make-undoables-util.md';
import { MakeUndoablesExtract } from './make-undoables-extract';
import MakeUndoablesExtractIntro from './make-undoables-extract-intro.md';
import MakeUndoablesExtractReadme from './make-undoables-extract.md';
import { MakeUndoablesInvert } from './make-undoables-invert';
import MakeUndoablesInvertIntro from './make-undoables-invert-intro.md';
import MakeUndoablesInvertReadme from './make-undoables-invert.md';
import { MakeUndoableFromTo } from './make-undoable-from-to.stories';
import MakeUndoableFromToIntro from './make-undoable-from-to-intro.md';
import MakeUndoableFromToReadme from './make-undoable-from-to.md';
import { MakeUndoableFromToTuple } from './make-undoable-from-to-tuple.stories';
import MakeUndoableFromToTupleIntro from './make-undoable-from-to-tuple-intro.md';
import MakeUndoableFromToTupleReadme from './make-undoable-from-to-tuple.md';
import { MakeUndoablesUtils } from './make-undoables-utils';
import MakeUndoablesUtilsIntro from './make-undoables-utils-intro.md';
import MakeUndoablesUtilsReadme from './make-undoables-utils.md';
import { DependentStateWrong } from './dependent-state-wrong';
import DependentStateWrongIntro from './dependent-state-wrong-intro.md';
import DependentStateWrongReadme from './dependent-state-wrong.md';
import { DependentStateRight1 } from './dependent-state-right-1';
import DependentStateRight1Intro from './dependent-state-right-1-intro.md';
import DependentStateRight1Readme from './dependent-state-right-1.md';
import { DependentStateRight2 } from './dependent-state-right';
import DependentStateRightIntro from './dependent-state-right-intro.md';
import DependentStateRightReadme from './dependent-state-right.md';
import { UsingReducer } from './use-reducer';
import UsingReducerIntro from './use-reducer-intro.md';
import UsingReducerReadme from './use-reducer.md';
import { MakeUndoablesFromDispatch1 } from './make-undoables-from-dispatch-1';
import MakeUndoablesFromDispatch1Readme from './make-undoables-from-dispatch-1.md';
import { MakeUndoablesFromDispatch2 } from './make-undoables-from-dispatch-2';
import MakeUndoablesFromDispatch2Readme from './make-undoables-from-dispatch-2.md';
import { MakeUndoablesFromDispatch3 } from './make-undoables-from-dispatch-3';
import MakeUndoablesFromDispatch3Readme from './make-undoables-from-dispatch-3.md';
import { BindUndoableActionCreators } from './bind-undoable-action-creators';
import BindUndoableActionCreatorsReadme from './bind-undoable-action-creators.md';
import { UseUndoableReducer } from './use-undoable-reducer';
import UseUndoableReducerReadme from './use-undoable-reducer.md';
import { ActionHistory } from './action-history';
import ActionHistoryReadme from './action-history.md';
import { ActionHistory2 } from './action-history-2';
import { MakeUndoablesMeta1 } from './make-undoables-meta-1';
import MakeUndoablesMeta1Readme from './make-undoables-meta-1.md';
import { MakeUndoablesMeta } from './make-undoables-meta';
import MakeUndoablesMetaReadme from './make-undoables-meta.md';
//
import { NoPayloadLight } from './no-payload-light';
import { NoPayload2Light } from './no-payload-2-light';

storiesOf('useFlexibleUndo', module)
  //@ts-ignore
  .addParameters({ options: { theme: {} } })
  .add('makeUndoable-delta', () => <MakeUndoableDelta />, {
    readme: {
      content: MakeUndoableDeltaIntro,
      sidebar: MakeUndoableDeltaReadme,
    },
  })
  .add('makeUndoable-from-to', () => <MakeUndoableFromTo />, {
    readme: {
      content: MakeUndoableFromToIntro,
      sidebar: MakeUndoableFromToReadme,
    },
  })
  .add('makeUndoable-from-to-tuple', () => <MakeUndoableFromToTuple />, {
    readme: {
      content: MakeUndoableFromToTupleIntro,
      sidebar: MakeUndoableFromToTupleReadme,
    },
  })
  .add('makeUndoable-multi', () => <MakeUndoableMulti />, {
    readme: {
      content: MakeUndoableMultiIntro,
      sidebar: MakeUndoableMultiReadme,
    },
  })
  .add('makeUndoables', () => <MakeUndoables />, {
    readme: {
      content: MakeUndoablesIntro,
      sidebar: MakeUndoablesReadme,
    },
  })
  .add('Negate the payload', () => <MakeUndoableNegate />, {
    readme: {
      content: MakeUndoableNegateIntro,
      sidebar: MakeUndoableNegateReadme,
    },
  })
  .add('Extract redo/undo handlers', () => <MakeUndoablesExtract />, {
    readme: {
      content: MakeUndoablesExtractIntro,
      sidebar: MakeUndoablesExtractReadme,
    },
  })
  .add('makeUndoables-invert', () => <MakeUndoablesInvert />, {
    readme: {
      content: MakeUndoablesInvertIntro,
      sidebar: MakeUndoablesInvertReadme,
    },
  })
  .add('makeUndoables-utils', () => <MakeUndoablesUtils />, {
    readme: {
      content: MakeUndoablesUtilsIntro,
      sidebar: MakeUndoablesUtilsReadme,
    },
  })
  .add('Extract pure functions', () => <MakeUndoablesUtil />, {
    readme: {
      content: MakeUndoablesUtilIntro,
      sidebar: MakeUndoablesUtilReadme,
    },
  })
  .add('dependent state: WRONG', () => <DependentStateWrong />, {
    readme: {
      content: DependentStateWrongIntro,
      sidebar: DependentStateWrongReadme,
    },
  })
  .add('dependent state: RIGHT 1', () => <DependentStateRight1 />, {
    readme: {
      content: DependentStateRight1Intro,
      sidebar: DependentStateRight1Readme,
    },
  })
  .add('dependent state: RIGHT 2', () => <DependentStateRight2 />, {
    readme: {
      content: DependentStateRightIntro,
      sidebar: DependentStateRightReadme,
    },
  })
  .add('Extracting state: useReducer', () => <UsingReducer />, {
    readme: {
      content: UsingReducerIntro,
      sidebar: UsingReducerReadme,
    },
  })
  .add('makeUndoablesFromDispatch 1', () => <MakeUndoablesFromDispatch1 />, {
    readme: {
      sidebar: MakeUndoablesFromDispatch1Readme,
    },
  })
  .add('makeUndoablesFromDispatch 2', () => <MakeUndoablesFromDispatch2 />, {
    readme: {
      sidebar: MakeUndoablesFromDispatch2Readme,
    },
  })
  .add('makeUndoablesFromDispatch 3', () => <MakeUndoablesFromDispatch3 />, {
    readme: {
      sidebar: MakeUndoablesFromDispatch3Readme,
    },
  })
  .add('bindUndoableActionCreators', () => <BindUndoableActionCreators />, {
    readme: {
      sidebar: BindUndoableActionCreatorsReadme,
    },
  })
  .add('useUndoableReducer', () => <UseUndoableReducer />, {
    readme: {
      sidebar: UseUndoableReducerReadme,
    },
  })
  .add('action history', () => <ActionHistory />, {
    readme: {
      sidebar: ActionHistoryReadme,
    },
  })
  .add('action history 2', () => <ActionHistory2 />, {
    readme: {
      // sidebar: ActionHistoryReadme,
    },
  })
  .add('makeUndoables-meta-1', () => <MakeUndoablesMeta1 />, {
    readme: {
      sidebar: MakeUndoablesMeta1Readme,
    },
  })
  .add('makeUndoables-meta', () => <MakeUndoablesMeta />, {
    readme: {
      sidebar: MakeUndoablesMetaReadme,
    },
  });

storiesOf('useFlexibleUndoLight', module)
  //@ts-ignore
  .addParameters({ options: { theme: {} } })
  .add('dependent state: WRONG', () => <NoPayloadLight />, {
    // readme: {
    //   content: MakeUndoablesUtilsIntro,
    //   sidebar: MakeUndoablesUtilsReadme,
    // },
  })
  .add('dependent state: RIGHT', () => <NoPayload2Light />, {
    // readme: {
    //   content: MakeUndoablesUtilsIntro,
    //   sidebar: MakeUndoablesUtilsReadme,
    // },
  });
