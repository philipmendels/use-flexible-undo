import React from 'react';
import { storiesOf } from '@storybook/react';

import { ReducerAndMakeUpdaterExample } from './use-reducer';
import ReducerAndMakeUpdaterIntro from './use-reducer.intro.md';
import ReducerAndMakeUpdaterReadme from './use-reducer.md';

import { BindActionCreatorsExample } from './bind-action-creators';
import BindActionCreatorsIntro from './bind-action-creators.intro.md';
import BindActionCreatorsReadme from './bind-action-creators.md';

import { UseBindActionCreatorsExample } from './use-bind-action-creators';
import UseBindActionCreatorsIntro from './use-bind-action-creators.intro.md';
import UseBindActionCreatorsReadme from './use-bind-action-creators.md';

import { BindSeparateActionCreatorsExample } from './bind-separate-action-creators';
import BindSeparateActionCreatorsIntro from './bind-separate-action-creators.intro.md';
import BindSeparateActionCreatorsReadme from './bind-separate-action-creators.md';

import { UseBindSeparateActionCreatorsExample } from './use-bind-seperate-action-creators';
import UseBindSeparateActionCreatorsReadme from './use-bind-seperate-action-creators.md';
import UseBindSeparateActionCreatorsIntro from './use-bind-seperate-action-creators.intro.md';

import { UnducerAndMakeUndoableUpdaterExample } from './use-unducer';
import UnducerAndMakeUndoableUpdaterIntro from './use-unducer-intro.md';
import UnducerAndMakeUndoableUpdaterReadme from './use-unducer.md';

import { BindUndoableActionCreatorsExample } from './bind-undoable-action-creators';
import BindUndoableActionCreatorsIntro from './bind-undoable-action-creators-intro.md';
import BindUndoableActionCreatorsReadme from './bind-undoable-action-creators.md';

import { UseBindUndoableActionCreatorsExample } from './use-bind-undoable-action-creators';
import UseBindUndoableActionCreatorsIntro from './use-bind-undoable-action-creators.intro.md';
import UseBindUndoableActionCreatorsReadme from './use-bind-undoable-action-creators.md';

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
      content: ReducerAndMakeUpdaterIntro,
      sidebar: ReducerAndMakeUpdaterReadme,
    },
  })
  .add(
    'makeReducer & bindActionCreators',
    () => <BindActionCreatorsExample />,
    {
      readme: {
        content: BindActionCreatorsIntro,
        sidebar: BindActionCreatorsReadme,
      },
    }
  )
  .add('useBindActionCreators', () => <UseBindActionCreatorsExample />, {
    readme: {
      content: UseBindActionCreatorsIntro,
      sidebar: UseBindActionCreatorsReadme,
    },
  })
  .add(
    'bindSeparateActionCreators',
    () => <BindSeparateActionCreatorsExample />,
    {
      readme: {
        content: BindSeparateActionCreatorsIntro,
        sidebar: BindSeparateActionCreatorsReadme,
      },
    }
  )
  .add(
    'useBindSeparateActionCreators',
    () => <UseBindSeparateActionCreatorsExample />,
    {
      readme: {
        content: UseBindSeparateActionCreatorsIntro,
        sidebar: UseBindSeparateActionCreatorsReadme,
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
        content: UseBindUndoableActionCreatorsIntro,
        sidebar: UseBindUndoableActionCreatorsReadme,
      },
    }
  )

  .add(
    'combining previous state and payload',
    () => <ReducerWithPreviousStateAndPayloadExample />,
    {
      readme: {
        content: ReducerWithPreviousStateAndPayloadIntro,
        sidebar: ReducerWithPreviousStateAndPayloadReadme,
      },
    }
  )
  .add(
    'combining useReducer and useState',
    () => <ReducerAndUseStateExample />,
    {
      readme: {
        content: ReducerAndUseStateIntro,
        sidebar: ReducerAndUseStateReadme,
      },
    }
  );
