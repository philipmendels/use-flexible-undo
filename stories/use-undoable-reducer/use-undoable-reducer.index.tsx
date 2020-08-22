import React from 'react';
import { storiesOf } from '@storybook/react';
import { UseUndoableUnducerExample } from './use-undoable-unducer';
import UseUndoableUnducerReadme from './use-undoable-unducer.md';
import { UseUndoableReducerExample } from './use-undoable-reducer';
import UseUndoableReducerReadme from './use-undoable-reducer.md';

storiesOf('useUndoableReducer', module)
  //@ts-ignore
  .addParameters({ options: { theme: {} } })
  .add('useUndoableUnducer', () => <UseUndoableUnducerExample />, {
    readme: {
      // content: UsingReducerIntro,
      sidebar: UseUndoableUnducerReadme,
    },
  })
  .add('useUndoableReducer', () => <UseUndoableReducerExample />, {
    readme: {
      // content: UsingReducerIntro,
      sidebar: UseUndoableReducerReadme,
    },
  });
