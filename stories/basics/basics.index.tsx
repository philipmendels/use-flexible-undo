import React from 'react';
import { storiesOf } from '@storybook/react';

import { MakeUndoableExample } from './make-undoable-delta';
import MakeUndoableDeltaIntro from './make-undoable-delta-intro.md';
import MakeUndoableDeltaReadme from './make-undoable-delta.md';
// import { MakeUndoableFromToExample } from './make-undoable-from-to';
// import MakeUndoableFromToIntro from './make-undoable-from-to-intro.md';
// import MakeUndoableFromToReadme from './make-undoable-from-to.md';
// import { MakeUndoableFromToTuple } from './make-undoable-from-to-tuple';
// import MakeUndoableFromToTupleIntro from './make-undoable-from-to-tuple-intro.md';
// import MakeUndoableFromToTupleReadme from './make-undoable-from-to-tuple.md';
// import { MakeUndoableMulti } from './make-undoable-multi';
// import MakeUndoableMultiIntro from './make-undoable-multi-intro.md';
// import MakeUndoableMultiReadme from './make-undoable-multi.md';
// import { MakeUndoables } from './make-undoables';
// import MakeUndoablesIntro from './make-undoables-intro.md';
// import MakeUndoablesReadme from './make-undoables.md';
// import { MakeUndoableNegate } from './make-undoable-negate';
// import MakeUndoableNegateIntro from './make-undoable-negate-intro.md';
// import MakeUndoableNegateReadme from './make-undoable-negate.md';
// import { MakeUndoablesExtract } from './make-undoables-extract';
// import MakeUndoablesExtractIntro from './make-undoables-extract-intro.md';
// import MakeUndoablesExtractReadme from './make-undoables-extract.md';

storiesOf('useFlexibleUndo/basics', module)
  //@ts-ignore
  .addParameters({ options: { theme: {} } })
  .add(
    'makeUndoable',

    () => <MakeUndoableExample />,
    {
      readme: {
        content: MakeUndoableDeltaIntro,
        sidebar: MakeUndoableDeltaReadme,
      },
    }
  );
// .add(
//   'object payload with from and to state',
//   () => <MakeUndoableFromToExample />,
//   {
//     readme: {
//       content: MakeUndoableFromToIntro,
//       sidebar: MakeUndoableFromToReadme,
//     },
//   }
// )
// .add(
//   'tuple payload with from and to state',
//   () => <MakeUndoableFromToTuple />,
//   {
//     readme: {
//       content: MakeUndoableFromToTupleIntro,
//       sidebar: MakeUndoableFromToTupleReadme,
//     },
//   }
// )
// .add('multiple calls to makeUndoable', () => <MakeUndoableMulti />, {
//   readme: {
//     content: MakeUndoableMultiIntro,
//     sidebar: MakeUndoableMultiReadme,
//   },
// })
// .add('makeUndoables', () => <MakeUndoables />, {
//   readme: {
//     content: MakeUndoablesIntro,
//     sidebar: MakeUndoablesReadme,
//   },
// })
// .add('wrap undoable function', () => <MakeUndoableNegate />, {
//   readme: {
//     content: MakeUndoableNegateIntro,
//     sidebar: MakeUndoableNegateReadme,
//   },
// })
// .add('reuse handlers', () => <MakeUndoablesExtract />, {
//   readme: {
//     content: MakeUndoablesExtractIntro,
//     sidebar: MakeUndoablesExtractReadme,
//   },
// });
