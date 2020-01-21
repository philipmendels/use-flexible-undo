import React from 'react';
import { storiesOf } from '@storybook/react';
import { MakeUndoableDelta } from './make-undoable-delta.stories';
import { MakeUndoableFromTo } from './make-undoable-from-to.stories';
import { MakeUndoables } from './make-undoables';
import { MakeUndoableMulti } from './make-undoable-multi';
import { MakeUndoableFromToTuple } from './make-undoable-from-to-tuple.stories';
import { MakeUndoablesFromToHandler } from './make-undoables-from-to-handler';
import { MakeUndoablesUtil } from './make-undoables-util';
import { MakeUndoablesInvert } from './make-undoables-invert';
import { MakeUndoablesFromDispatch } from './make-undoables-from-dispatch';

storiesOf('useInfiniteUndo', module)
  .add('makeUndoable-delta', () => <MakeUndoableDelta />)
  .add('makeUndoable-multi', () => <MakeUndoableMulti />)
  .add('makeUndoables', () => <MakeUndoables />)
  .add('makeUndoables-util', () => <MakeUndoablesUtil />)
  .add('makeUndoables-invert', () => <MakeUndoablesInvert />)
  .add('makeUndoable-from-to', () => <MakeUndoableFromTo />)
  .add('makeUndoable-from-to-tuple', () => <MakeUndoableFromToTuple />)
  .add('makeUndoables-FromToHandler', () => <MakeUndoablesFromToHandler />)
  .add('makeUndoablesFromDispatch', () => <MakeUndoablesFromDispatch />);
