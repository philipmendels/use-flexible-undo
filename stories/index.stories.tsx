import React from 'react';
import { storiesOf } from '@storybook/react';
import { MakeUndoableDelta } from './make-undoable-delta.stories';
import MakeUndoableDeltaIntro from './make-undoable-delta-intro.md';
import MakeUndoableDeltaReadme from './make-undoable-delta.md';
import { MakeUndoableFromTo } from './make-undoable-from-to.stories';
import { MakeUndoables } from './make-undoables';
import { MakeUndoableMulti } from './make-undoable-multi';
import MakeUndoableMultiIntro from './make-undoable-multi-intro.md';
import MakeUndoableMultiReadme from './make-undoable-multi.md';
import { MakeUndoableFromToTuple } from './make-undoable-from-to-tuple.stories';
import { MakeUndoablesFromToHandler } from './make-undoables-from-to-handler';
import { MakeUndoablesUtil } from './make-undoables-util';
import { MakeUndoablesInvert } from './make-undoables-invert';
import { MakeUndoablesFromDispatch } from './make-undoables-from-dispatch';
import { UseUndoableReducer } from './use-undoable-reducer';
import { BindUndoableActionCreators } from './bind-undoable-action-creators';
import { MakeUndoablesMeta } from './make-undoables-meta';

storiesOf('useInfiniteUndo', module)
  //@ts-ignore
  .addParameters({ options: { theme: {} } })
  .add('makeUndoable-delta', () => <MakeUndoableDelta />, {
    readme: {
      content: MakeUndoableDeltaIntro,
      sidebar: MakeUndoableDeltaReadme,
    },
  })
  .add('makeUndoable-multi', () => <MakeUndoableMulti />, {
    readme: {
      content: MakeUndoableMultiIntro,
      sidebar: MakeUndoableMultiReadme,
    },
  })
  .add('makeUndoables', () => <MakeUndoables />)
  .add('makeUndoables-util', () => <MakeUndoablesUtil />)
  .add('makeUndoables-invert', () => <MakeUndoablesInvert />)
  .add('makeUndoable-from-to', () => <MakeUndoableFromTo />)
  .add('makeUndoable-from-to-tuple', () => <MakeUndoableFromToTuple />)
  .add('makeUndoables-FromToHandler', () => <MakeUndoablesFromToHandler />)
  .add('makeUndoablesFromDispatch', () => <MakeUndoablesFromDispatch />)
  .add('bindUndoableActionCreators', () => <BindUndoableActionCreators />)
  .add('useUndoableReducer', () => <UseUndoableReducer />)
  .add('makeUndoables-meta', () => <MakeUndoablesMeta />);
