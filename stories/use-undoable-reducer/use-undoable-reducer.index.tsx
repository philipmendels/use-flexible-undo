import React from 'react';
import { storiesOf } from '@storybook/react';

import { UseUndoableReducerExample } from './use-undoable-reducer';
import UseUndoableReducerReadme from './use-undoable-reducer.md';
import UseUndoableReducerIntro from './use-undoable-reducer.intro.md';

import { UseUndoableUnducerExample } from './use-undoable-unducer';
import UseUndoableUnducerReadme from './use-undoable-unducer.md';
import UseUndoableUnducerIntro from './use-undoable-unducer.intro.md';

storiesOf('useUndoableReducer', module)
  //@ts-ignore
  .addParameters({ options: { theme: {} } })
  .add(
    'useUndoableReducer & makeUndoableReducer',
    () => <UseUndoableReducerExample />,
    {
      readme: {
        content: UseUndoableReducerIntro,
        sidebar: UseUndoableReducerReadme,
      },
    }
  )
  .add('useUndoableUnducer', () => <UseUndoableUnducerExample />, {
    readme: {
      content: UseUndoableUnducerIntro,
      sidebar: UseUndoableUnducerReadme,
    },
  });
