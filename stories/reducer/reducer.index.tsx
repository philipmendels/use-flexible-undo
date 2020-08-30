import React from 'react';
import { storiesOf } from '@storybook/react';

import { ReducerAndMakeUpdaterExample } from './use-reducer';
// import ReducerAndMakeUndoableUpdaterIntro from './use-unducer-intro.md';
import ReducerAndMakeUpdaterReadme from './use-reducer.md';

import { UnducerAndMakeUndoableUpdaterExample } from './use-unducer';
import UnducerAndMakeUndoableUpdaterIntro from './use-unducer-intro.md';
import UnducerAndMakeUndoableUpdaterReadme from './use-unducer.md';

import { BindUndoableActionCreatorsExample } from './bind-undoable-action-creators';
import BindUndoableActionCreatorsIntro from './bind-undoable-action-creators-intro.md';
import BindUndoableActionCreatorsReadme from './bind-undoable-action-creators.md';

import { BindSeparateActionCreatorsExample } from './bind-separate-action-creators';
import BindSeparateActionCreatorsReadme from './bind-separate-action-creators.md';

import { UseBoundUnducerExample } from './use-bound-unducer';
import UseBoundUnducerIntro from './use-bound-unducer-intro.md';
import UseBoundUnducerReadme from './use-bound-unducer.md';

import { UseBoundUnducerWithSepActionCreatorsExample } from './use-bound-unducer-with-sep-action-creators';
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
      // content: ReducerAndMakeUpdaterIntro,
      sidebar: ReducerAndMakeUpdaterReadme,
    },
  })
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
    'makeReducer & bindSeparateActionCreators',
    () => <BindSeparateActionCreatorsExample />,
    {
      readme: {
        // content: ReducerAndUseStateIntro,
        sidebar: BindSeparateActionCreatorsReadme,
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
  .add('useBoundUnducer', () => <UseBoundUnducerExample />, {
    readme: {
      content: UseBoundUnducerIntro,
      sidebar: UseBoundUnducerReadme,
    },
  })
  .add(
    'useBoundUnducer with separate action creators',
    () => <UseBoundUnducerWithSepActionCreatorsExample />,
    {
      readme: {
        // content: ReducerAndUseStateIntro,
        sidebar: UseBoundUnducerWithSepActionCreatorsReadme,
      },
    }
  )
  .add(
    'useBoundUnducer with previous state and payload',
    () => <ReducerWithPreviousStateAndPayloadExample />,
    {
      readme: {
        content: ReducerWithPreviousStateAndPayloadIntro,
        sidebar: ReducerWithPreviousStateAndPayloadReadme,
      },
    }
  )
  .add('useBoundUnducer and useState', () => <ReducerAndUseStateExample />, {
    readme: {
      content: ReducerAndUseStateIntro,
      sidebar: ReducerAndUseStateReadme,
    },
  });
