import React from 'react';
import { storiesOf } from '@storybook/react';

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

storiesOf('useFlexibleUndo/reducer', module)
  //@ts-ignore
  .addParameters({ options: { theme: {} } })
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
  });
