import React from 'react';
import { storiesOf } from '@storybook/react';

import { UsingReducer } from './use-reducer';
import UsingReducerIntro from './use-reducer-intro.md';
import UsingReducerReadme from './use-reducer.md';
import { MakeUndoablesFromDispatchExample2 } from './make-undoables-from-dispatch-2';
import MakeUndoablesFromDispatch2Readme from './make-undoables-from-dispatch-2.md';
import { MakeUndoablesFromDispatchWithPayloadExample } from './make-undoables-from-dispatch-with-payload';
import MakeUndoablesFromDispatchWithPayloadReadme from './make-undoables-from-dispatch-with-payload.md';
import { MakeUndoablesFromDispatchExample3 } from './make-undoables-from-dispatch-3';
import MakeUndoablesFromDispatch3Readme from './make-undoables-from-dispatch-3.md';
import { UseUndoableReducer } from './use-undoable-reducer';
import UseUndoableReducerReadme from './use-undoable-reducer.md';

storiesOf('useFlexibleUndo/reducer', module)
  //@ts-ignore
  .addParameters({ options: { theme: {} } })
  .add('useReducer and manual dispatch', () => <UsingReducer />, {
    readme: {
      content: UsingReducerIntro,
      sidebar: UsingReducerReadme,
    },
  })
  .add(
    'makeUndoableReducer & bindUndoableActionCreators',
    () => <MakeUndoablesFromDispatchExample2 />,
    {
      readme: {
        sidebar: MakeUndoablesFromDispatch2Readme,
      },
    }
  )
  .add('useUndoableReducer', () => <UseUndoableReducer />, {
    readme: {
      sidebar: UseUndoableReducerReadme,
    },
  })
  .add(
    'additional payload',
    () => <MakeUndoablesFromDispatchWithPayloadExample />,
    {
      readme: {
        sidebar: MakeUndoablesFromDispatchWithPayloadReadme,
      },
    }
  )
  .add(
    'using both a reducer and useState',
    () => <MakeUndoablesFromDispatchExample3 />,
    {
      readme: {
        sidebar: MakeUndoablesFromDispatch3Readme,
      },
    }
  );
