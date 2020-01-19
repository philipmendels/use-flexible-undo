import React from 'react';
import { storiesOf } from '@storybook/react';
import { MakeUndoableDelta } from './make-undoable-delta.stories';
import { MakeUndoableFromTo } from './make-undoable-from-to.stories';
import { MakeUndoables } from './make-undoables';
import { MakeUndoableMulti } from './make-undoable-multi';
import { MakeUndoableFromToTuple } from './make-undoable-from-to-tuple.stories';
import { MakeUndoablesFromToHandler } from './make-undoables-from-to-handler';

storiesOf('useInfiniteUndo', module)
  .add('makeUndoable-delta', () => <MakeUndoableDelta />)
  .add('makeUndoable-from-to', () => <MakeUndoableFromTo />)
  .add('makeUndoable-from-to-tuple', () => <MakeUndoableFromToTuple />)
  .add('makeUndoable-multi', () => <MakeUndoableMulti />)
  .add('makeUndoables', () => <MakeUndoables />)
  .add('makeUndoables-FromToHandler', () => <MakeUndoablesFromToHandler />);
