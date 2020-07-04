import React from 'react';
import { storiesOf } from '@storybook/react';

import { WrongHandlerExample } from './dependent-state-wrong';
import DependentStateWrongIntro from './dependent-state-wrong-intro.md';
import DependentStateWrongReadme from './dependent-state-wrong.md';

import { DependencyInPayloadExample } from './dependency-in-payload';
import DependencyInPayloadIntro from './dependency-in-payload-intro.md';
import DependencyInPayloadReadme from './dependency-in-payload.md';

import { DependencyInPreviousStateExample } from './dependency-in-previous-state';
import DependencyInPreviousStateIntro from './dependency-in-previous-state-intro.md';
import DependencyInPreviousStateReadme from './dependency-in-previous-state.md';

import { MakeUndoablePartialStateHandlerExample } from './make-undoable-partial-state-handler';
import MakeUndoablePartialStateHandlerIntro from './make-undoable-partial-state-handler-intro.md';
import MakeUndoablePartialStateHandlerReadme from './make-undoable-partial-state-handler.md';

import { PreviousStateAndPayloadExample } from './previous-state-and-payload';
import PreviousStateAndPayloadIntro from './previous-state-and-payload-intro.md';
import PreviousStateAndPayloadReadme from './previous-state-and-payload.md';

storiesOf('useFlexibleUndo/dependent state', module)
  //@ts-ignore
  .addParameters({ options: { theme: {} } })
  .add(`don't do this`, () => <WrongHandlerExample />, {
    readme: {
      content: DependentStateWrongIntro,
      sidebar: DependentStateWrongReadme,
    },
  })
  .add('dependency in payload', () => <DependencyInPayloadExample />, {
    readme: {
      content: DependencyInPayloadIntro,
      sidebar: DependencyInPayloadReadme,
    },
  })
  .add(
    'dependency in previous state',
    () => <DependencyInPreviousStateExample />,
    {
      readme: {
        content: DependencyInPreviousStateIntro,
        sidebar: DependencyInPreviousStateReadme,
      },
    }
  )
  .add(
    'makeUndoablePartialStateHandler',
    () => <MakeUndoablePartialStateHandlerExample />,
    {
      readme: {
        content: MakeUndoablePartialStateHandlerIntro,
        sidebar: MakeUndoablePartialStateHandlerReadme,
      },
    }
  )
  .add('previous state and payload', () => <PreviousStateAndPayloadExample />, {
    readme: {
      content: PreviousStateAndPayloadIntro,
      sidebar: PreviousStateAndPayloadReadme,
    },
  });
