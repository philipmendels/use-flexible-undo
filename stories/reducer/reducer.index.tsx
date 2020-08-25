import React from 'react';
import { storiesOf } from '@storybook/react';

import { ReducerAndMakeUndoableUpdaterExample } from './use-reducer';
import ReducerAndMakeUndoableUpdaterIntro from './use-reducer-intro.md';
import ReducerAndMakeUndoableUpdaterReadme from './use-reducer.md';

import { BindUndoableActionCreatorsExample } from './bind-undoable-action-creators';
import BindUndoableActionCreatorsIntro from './bind-undoable-action-creators-intro.md';
import BindUndoableActionCreatorsReadme from './bind-undoable-action-creators.md';

import { UseUndoableReducerExample } from './use-undoable-reducer';
import UseUndoableReducerIntro from './use-undoable-reducer-intro.md';
import UseUndoableReducerReadme from './use-undoable-reducer.md';

import { ReducerWithPreviousStateAndPayloadExample } from './reducer-with-previous-state-and-payload';
import ReducerWithPreviousStateAndPayloadIntro from './reducer-with-previous-state-and-payload-intro.md';
import ReducerWithPreviousStateAndPayloadReadme from './reducer-with-previous-state-and-payload.md';

import { ReducerAndUseStateExample } from './reducer-and-use-state';
import ReducerAndUseStateIntro from './reducer-and-use-state-intro.md';
import ReducerAndUseStateReadme from './reducer-and-use-state.md';

import { BindActionCreatorsAndUndoMapExample } from './bind-action-creators-and-undo-map';
import BindActionCreatorsAndUndoMapReadme from './bind-action-creators-and-undo-map.md';

import { UseReducerWithUndoMapExample } from './use-reducer-with-undo-map';
import UseReducerWithUndoMapReadme from './use-reducer-with-undo-map.md';

storiesOf('useUndoableEffects/reducer', module)
  //@ts-ignore
  .addParameters({ options: { theme: {} } })
  .add(
    'reducer & makeUndoableUpdater',
    () => <ReducerAndMakeUndoableUpdaterExample />,
    {
      readme: {
        content: ReducerAndMakeUndoableUpdaterIntro,
        sidebar: ReducerAndMakeUndoableUpdaterReadme,
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
  .add('useBoundUnducer', () => <UseUndoableReducerExample />, {
    readme: {
      content: UseUndoableReducerIntro,
      sidebar: UseUndoableReducerReadme,
    },
  })
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
  })
  .add(
    'bindActionCreatorsAndUndoMap',
    () => <BindActionCreatorsAndUndoMapExample />,
    {
      readme: {
        // content: ReducerAndUseStateIntro,
        sidebar: BindActionCreatorsAndUndoMapReadme,
      },
    }
  )
  .add('useBoundReducerWithUndoMap', () => <UseReducerWithUndoMapExample />, {
    readme: {
      // content: ReducerAndUseStateIntro,
      sidebar: UseReducerWithUndoMapReadme,
    },
  });
