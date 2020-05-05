import React from 'react';
import { storiesOf } from '@storybook/react';
import { MakeUndoableExample } from './make-undoable-delta';
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

import { MakeUndoableFTObjHandlerExample } from './make-undoable-from-to-handler';
import MakeUndoableFromToHandlerIntro from './make-undoable-from-to-handler-intro.md';
import MakeUndoableFromToHandlerReadme from './make-undoable-from-to-handler.md';

import { WrapFTObjHandlerExample } from './wrap-from-to-handler';
// import MakeUndoableFromToHandlerIntro from './make-undoable-from-to-handler-intro.md';
import WrapFromToHandlerReadme from './wrap-from-to-handler.md';

import { MakeUndoableHandlerExample } from './make-undoable-handler';
import MakeUndoableHandlerIntro from './make-undoable-handler-intro.md';
import MakeUndoableHandlerReadme from './make-undoable-handler.md';
import { MakeUndoablesExtract } from './make-undoables-extract';
import MakeUndoablesExtractIntro from './make-undoables-extract-intro.md';
import MakeUndoablesExtractReadme from './make-undoables-extract.md';
import { InvertHandlersExample } from './make-undoables-invert';
import MakeUndoablesInvertIntro from './make-undoables-invert-intro.md';
import MakeUndoablesInvertReadme from './make-undoables-invert.md';
import { MakeUndoableFromToExample } from './make-undoable-from-to';
import MakeUndoableFromToIntro from './make-undoable-from-to-intro.md';
import MakeUndoableFromToReadme from './make-undoable-from-to.md';
import { MakeUndoableFromToTuple } from './make-undoable-from-to-tuple';
import MakeUndoableFromToTupleIntro from './make-undoable-from-to-tuple-intro.md';
import MakeUndoableFromToTupleReadme from './make-undoable-from-to-tuple.md';
import { MakeUndoablesUtils } from './make-undoables-utils';
import MakeUndoablesUtilsIntro from './make-undoables-utils-intro.md';
import MakeUndoablesUtilsReadme from './make-undoables-utils.md';
import { DependentStateWrong } from './dependent-state-wrong';
import DependentStateWrongIntro from './dependent-state-wrong-intro.md';
import DependentStateWrongReadme from './dependent-state-wrong.md';
import { DependentStateRight1Example } from './dependent-state-right-1';
import DependentStateRight1Intro from './dependent-state-right-1-intro.md';
import DependentStateRight1Readme from './dependent-state-right-1.md';
import { DependentStateRight2Example } from './dependent-state-right-2';
import DependentStateRight2Intro from './dependent-state-right-2-intro.md';
import DependentStateRight2Readme from './dependent-state-right-2.md';
import { DependentStateRight3Example } from './dependent-state-right-3';
import DependentStateRight3Readme from './dependent-state-right-3.md';
import { DependentStateRight4Example } from './dependent-state-right-4';
import DependentStateRight4Readme from './dependent-state-right-4.md';
import { UsingReducer } from './use-reducer';
import UsingReducerIntro from './use-reducer-intro.md';
import UsingReducerReadme from './use-reducer.md';
import { MakeUndoablesFromDispatchExample } from './make-undoables-from-dispatch';
import MakeUndoablesFromDispatchReadme from './make-undoables-from-dispatch.md';
import { MakeUndoablesFromDispatchExample2 } from './make-undoables-from-dispatch-2';
import MakeUndoablesFromDispatch2Readme from './make-undoables-from-dispatch-2.md';
import { MakeUndoablesFromDispatchWithPayloadExample } from './make-undoables-from-dispatch-with-payload';
import MakeUndoablesFromDispatchWithPayloadReadme from './make-undoables-from-dispatch-with-payload.md';
import { MakeUndoablesFromDispatchExample3 } from './make-undoables-from-dispatch-3';
import MakeUndoablesFromDispatch3Readme from './make-undoables-from-dispatch-3.md';
import { BindUndoableActionCreators } from './bind-undoable-action-creators';
import BindUndoableActionCreatorsReadme from './bind-undoable-action-creators.md';
import { UseUndoableReducer } from './use-undoable-reducer';
import UseUndoableReducerReadme from './use-undoable-reducer.md';
import { ActionHistory } from './action-history';
import ActionHistoryReadme from './action-history.md';
import { ActionHistory1 } from './action-history-1';
import ActionHistory1Readme from './action-history-1.md';
import { ActionHistory2 } from './action-history-2';
import ActionHistory2Readme from './action-history-2.md';
import { ActionHistory3 } from './action-history-3';
import ActionHistory3Readme from './action-history-3.md';
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
  .add('makeUndoable', () => <MakeUndoableExample />, {
    readme: {
      content: MakeUndoableDeltaIntro,
      sidebar: MakeUndoableDeltaReadme,
    },
  })
  .add(
    'object payload with from and to state',
    () => <MakeUndoableFromToExample />,
    {
      readme: {
        content: MakeUndoableFromToIntro,
        sidebar: MakeUndoableFromToReadme,
      },
    }
  )
  .add(
    'tuple payload with from and to state',
    () => <MakeUndoableFromToTuple />,
    {
      readme: {
        content: MakeUndoableFromToTupleIntro,
        sidebar: MakeUndoableFromToTupleReadme,
      },
    }
  )
  .add('multiple calls to makeUndoable', () => <MakeUndoableMulti />, {
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
  .add('wrap undoable function', () => <MakeUndoableNegate />, {
    readme: {
      content: MakeUndoableNegateIntro,
      sidebar: MakeUndoableNegateReadme,
    },
  })
  .add('reuse handlers', () => <MakeUndoablesExtract />, {
    readme: {
      content: MakeUndoablesExtractIntro,
      sidebar: MakeUndoablesExtractReadme,
    },
  })
  .add('invertHandlers', () => <InvertHandlersExample />, {
    readme: {
      content: MakeUndoablesInvertIntro,
      sidebar: MakeUndoablesInvertReadme,
    },
  })
  .add('makeHandler and combineHandlers', () => <MakeUndoablesUtils />, {
    readme: {
      content: MakeUndoablesUtilsIntro,
      sidebar: MakeUndoablesUtilsReadme,
    },
  })
  .add('makeUndoableHandler', () => <MakeUndoableHandlerExample />, {
    readme: {
      content: MakeUndoableHandlerIntro,
      sidebar: MakeUndoableHandlerReadme,
    },
  })
  .add('makeUndoableFTObjHandler', () => <MakeUndoableFTObjHandlerExample />, {
    readme: {
      content: MakeUndoableFromToHandlerIntro,
      sidebar: MakeUndoableFromToHandlerReadme,
    },
  })
  .add('wrapFTObjHandler', () => <WrapFTObjHandlerExample />, {
    readme: {
      // content: WrapFromToHandlerIntro,
      sidebar: WrapFromToHandlerReadme,
    },
  })
  .add('extract updater functions', () => <MakeUndoablesUtil />, {
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
  .add('dependent state: RIGHT 1', () => <DependentStateRight1Example />, {
    readme: {
      content: DependentStateRight1Intro,
      sidebar: DependentStateRight1Readme,
    },
  })
  .add('dependent state: RIGHT 2', () => <DependentStateRight2Example />, {
    readme: {
      content: DependentStateRight2Intro,
      sidebar: DependentStateRight2Readme,
    },
  })
  .add('dependent state: RIGHT 3', () => <DependentStateRight3Example />, {
    readme: {
      sidebar: DependentStateRight3Readme,
    },
  })
  .add('dependent state: RIGHT 4', () => <DependentStateRight4Example />, {
    readme: {
      sidebar: DependentStateRight4Readme,
    },
  })
  .add('use with useReducer', () => <UsingReducer />, {
    readme: {
      content: UsingReducerIntro,
      sidebar: UsingReducerReadme,
    },
  })
  .add(
    'makeUndoablesFromDispatch 1',
    () => <MakeUndoablesFromDispatchExample />,
    {
      readme: {
        sidebar: MakeUndoablesFromDispatchReadme,
      },
    }
  )
  .add(
    'makeUndoablesFromDispatch 2',
    () => <MakeUndoablesFromDispatchExample2 />,
    {
      readme: {
        sidebar: MakeUndoablesFromDispatch2Readme,
      },
    }
  )
  .add(
    'makeUndoablesFromDispatch with payload',
    () => <MakeUndoablesFromDispatchWithPayloadExample />,
    {
      readme: {
        sidebar: MakeUndoablesFromDispatchWithPayloadReadme,
      },
    }
  )
  .add(
    'makeUndoablesFromDispatch 3',
    () => <MakeUndoablesFromDispatchExample3 />,
    {
      readme: {
        sidebar: MakeUndoablesFromDispatch3Readme,
      },
    }
  )
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
  .add('action history 1', () => <ActionHistory1 />, {
    readme: {
      sidebar: ActionHistory1Readme,
    },
  })
  .add('action history 2', () => <ActionHistory />, {
    readme: {
      sidebar: ActionHistoryReadme,
    },
  })
  .add('action history 3', () => <ActionHistory2 />, {
    readme: {
      sidebar: ActionHistory2Readme,
    },
  })
  .add('action history 4', () => <ActionHistory3 />, {
    readme: {
      sidebar: ActionHistory3Readme,
    },
  })
  .add('makeUndoables meta 1 ', () => <MakeUndoablesMeta1 />, {
    readme: {
      sidebar: MakeUndoablesMeta1Readme,
    },
  })
  .add('makeUndoables meta 2', () => <MakeUndoablesMeta />, {
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
