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
    'makeUndoableReducer & useUndoableReducer',
    () => <UseUndoableReducerExample />,
    {
      readme: {
        content: UseUndoableReducerIntro,
        sidebar: UseUndoableReducerReadme,
      },
    }
  )
  .add(
    'makeUndoableReducer with an unducer',
    () => <UseUndoableUnducerExample />,
    {
      readme: {
        content: UseUndoableUnducerIntro,
        sidebar: UseUndoableUnducerReadme,
      },
    }
  );
