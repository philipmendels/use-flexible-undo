import React from 'react';
import { storiesOf } from '@storybook/react';

import { ReducerAndMakeUpdaterExample } from './use-reducer';
// import ReducerAndMakeUndoableUpdaterIntro from './use-unducer-intro.md';
import ReducerAndMakeUpdaterReadme from './use-reducer.md';

import { BindActionCreatorsExample } from './bind-action-creators';
import BindActionCreatorsReadme from './bind-action-creators.md';

import { UseBindActionCreatorsExample } from './use-bind-action-creators';
import UseBindActionCreatorsReadme from './use-bind-action-creators.md';

import { UnducerAndMakeUndoableUpdaterExample } from './use-unducer';
import UnducerAndMakeUndoableUpdaterIntro from './use-unducer-intro.md';
import UnducerAndMakeUndoableUpdaterReadme from './use-unducer.md';

import { BindUndoableActionCreatorsExample } from './bind-undoable-action-creators';
import BindUndoableActionCreatorsIntro from './bind-undoable-action-creators-intro.md';
import BindUndoableActionCreatorsReadme from './bind-undoable-action-creators.md';

import { BindSeparateActionCreatorsExample } from './bind-separate-action-creators';
import BindSeparateActionCreatorsReadme from './bind-separate-action-creators.md';

import { UseBindUndoableActionCreatorsExample } from './use-bound-unducer';
import UseBoundUnducerIntro from './use-bound-unducer-intro.md';
import UseBoundUnducerReadme from './use-bound-unducer.md';

import { UseBindSeparateActionCreatorsExample } from './use-bound-unducer-with-sep-action-creators';
import UseBoundUnducerWithSepActionCreatorsReadme from './use-bound-unducer-with-sep-action-creators.md';

import { ReducerWithPreviousStateAndPayloadExample } from './reducer-with-previous-state-and-payload';
import ReducerWithPreviousStateAndPayloadIntro from './reducer-with-previous-state-and-payload-intro.md';
import ReducerWithPreviousStateAndPayloadReadme from './reducer-with-previous-state-and-payload.md';

import { ReducerAndUseStateExample } from './reducer-and-use-state';
import ReducerAndUseStateIntro from './reducer-and-use-state-intro.md';
import ReducerAndUseStateReadme from './reducer-and-use-state.md';

storiesOf('useUndoableEffects/combination with a reducer', module)
  //@ts-ignore
  .addParameters({ options: { theme: {} } })
  .add('reducer & makeUpdater', () => <ReducerAndMakeUpdaterExample />, {
    readme: {
      // content:
      sidebar: ReducerAndMakeUpdaterReadme,
    },
  })
  .add(
    'makeReducer & bindActionCreators',
    () => <BindActionCreatorsExample />,
    {
      readme: {
        // content:
        sidebar: BindActionCreatorsReadme,
      },
    }
  )
  .add('useBindActionCreators', () => <UseBindActionCreatorsExample />, {
    readme: {
      // content:
      sidebar: UseBindActionCreatorsReadme,
    },
  })
  .add(
    'bindSeparateActionCreators',
    () => <BindSeparateActionCreatorsExample />,
    {
      readme: {
        // content: ReducerAndUseStateIntro,
        sidebar: BindSeparateActionCreatorsReadme,
      },
    }
  )
  .add(
    'useBindSeparateActionCreators',
    () => <UseBindSeparateActionCreatorsExample />,
    {
      readme: {
        // content: ReducerAndUseStateIntro,
        sidebar: UseBoundUnducerWithSepActionCreatorsReadme,
      },
    }
  )
  .add(
    'unducer & makeUndoableUpdater',
    () => <UnducerAndMakeUndoableUpdaterExample />,
    {
      readme: {
        content: UnducerAndMakeUndoableUpdaterIntro,
        sidebar: UnducerAndMakeUndoableUpdaterReadme,
      },
    }
  )

  .add(
    'makeUnducer & bindUndoableActionCreators',
    () => <BindUndoableActionCreatorsExample />,
    {
      readme: {
        content: BindUndoableActionCreatorsIntro,
        sidebar: BindUndoableActionCreatorsReadme,
      },
    }
  )
  .add(
    'useBindUndoableActionCreators',
    () => <UseBindUndoableActionCreatorsExample />,
    {
      readme: {
        content: UseBoundUnducerIntro,
        sidebar: UseBoundUnducerReadme,
      },
    }
  )

  .add(
    'previous state and payload',
    () => <ReducerWithPreviousStateAndPayloadExample />,
    {
      readme: {
        content: ReducerWithPreviousStateAndPayloadIntro,
        sidebar: ReducerWithPreviousStateAndPayloadReadme,
      },
    }
  )
  .add('reducer and useState', () => <ReducerAndUseStateExample />, {
    readme: {
      content: ReducerAndUseStateIntro,
      sidebar: ReducerAndUseStateReadme,
    },
  });
