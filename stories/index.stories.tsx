import React from 'react';
import { storiesOf } from '@storybook/react';
import { MakeUndoableDelta } from './make-undoable-delta.stories';
import MakeUndoableDeltaIntro from './make-undoable-delta-intro.md';
import MakeUndoableDeltaReadme from './make-undoable-delta.md';
import { MakeUndoableMulti } from './make-undoable-multi';
import MakeUndoableMultiIntro from './make-undoable-multi-intro.md';
import MakeUndoableMultiReadme from './make-undoable-multi.md';
import { MakeUndoables } from './make-undoables';
import MakeUndoablesIntro from './make-undoables-intro.md';
import MakeUndoablesReadme from './make-undoables.md';
import { MakeUndoableNegate } from './make-undoable-negate';
import MakeUndoableNegateIntro from './make-undoable-negate-intro.md';
import MakeUndoableNegateReadme from './make-undoable-negate.md';
import { MakeUndoablesUtil } from './make-undoables-util';
import MakeUndoablesUtilIntro from './make-undoables-util-intro.md';
import MakeUndoablesUtilReadme from './make-undoables-util.md';
import { MakeUndoablesExtract } from './make-undoables-extract';
import MakeUndoablesExtractIntro from './make-undoables-extract-intro.md';
import MakeUndoablesExtractReadme from './make-undoables-extract.md';
import { MakeUndoablesInvert } from './make-undoables-invert';
import MakeUndoablesInvertIntro from './make-undoables-invert-intro.md';
import MakeUndoablesInvertReadme from './make-undoables-invert.md';
import { MakeUndoableFromTo } from './make-undoable-from-to.stories';
import MakeUndoableFromToIntro from './make-undoable-from-to-intro.md';
import MakeUndoableFromToReadme from './make-undoable-from-to.md';
import { MakeUndoableFromToTuple } from './make-undoable-from-to-tuple.stories';
import MakeUndoableFromToTupleIntro from './make-undoable-from-to-tuple-intro.md';
import MakeUndoableFromToTupleReadme from './make-undoable-from-to-tuple.md';
import { MakeUndoablesUtils } from './make-undoables-utils';
import MakeUndoablesUtilsIntro from './make-undoables-utils-intro.md';
import MakeUndoablesUtilsReadme from './make-undoables-utils.md';
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
  .add('makeUndoable-from-to', () => <MakeUndoableFromTo />, {
    readme: {
      content: MakeUndoableFromToIntro,
      sidebar: MakeUndoableFromToReadme,
    },
  })
  .add('makeUndoable-from-to-tuple', () => <MakeUndoableFromToTuple />, {
    readme: {
      content: MakeUndoableFromToTupleIntro,
      sidebar: MakeUndoableFromToTupleReadme,
    },
  })
  .add('makeUndoable-multi', () => <MakeUndoableMulti />, {
    readme: {
      content: MakeUndoableMultiIntro,
      sidebar: MakeUndoableMultiReadme,
    },
  })
  .add('makeUndoables', () => <MakeUndoables />, {
    readme: {
      content: MakeUndoablesIntro,
      sidebar: MakeUndoablesReadme,
    },
  })
  .add('makeUndoable-negate', () => <MakeUndoableNegate />, {
    readme: {
      content: MakeUndoableNegateIntro,
      sidebar: MakeUndoableNegateReadme,
    },
  })
  .add('makeUndoables-extract', () => <MakeUndoablesExtract />, {
    readme: {
      content: MakeUndoablesExtractIntro,
      sidebar: MakeUndoablesExtractReadme,
    },
  })
  .add('makeUndoables-invert', () => <MakeUndoablesInvert />, {
    readme: {
      content: MakeUndoablesInvertIntro,
      sidebar: MakeUndoablesInvertReadme,
    },
  })
  .add('makeUndoables-utils', () => <MakeUndoablesUtils />, {
    readme: {
      content: MakeUndoablesUtilsIntro,
      sidebar: MakeUndoablesUtilsReadme,
    },
  })
  .add('makeUndoables-util', () => <MakeUndoablesUtil />, {
    readme: {
      content: MakeUndoablesUtilIntro,
      sidebar: MakeUndoablesUtilReadme,
    },
  })
  .add('makeUndoablesFromDispatch', () => <MakeUndoablesFromDispatch />)
  .add('bindUndoableActionCreators', () => <BindUndoableActionCreators />)
  .add('useUndoableReducer', () => <UseUndoableReducer />)
  .add('makeUndoables-meta', () => <MakeUndoablesMeta />);
