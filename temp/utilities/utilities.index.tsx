import React from 'react';
import { storiesOf } from '@storybook/react';

import { MakeUndoablesUtil } from './make-undoables-util';
import MakeUndoablesUtilIntro from './make-undoables-util-intro.md';
import MakeUndoablesUtilReadme from './make-undoables-util.md';

import { MakeUndoableFTObjHandlerExample } from './make-undoable-from-to-handler';
import MakeUndoableFromToHandlerIntro from './make-undoable-from-to-handler-intro.md';
import MakeUndoableFromToHandlerReadme from './make-undoable-from-to-handler.md';

import { MakeUndoableFTTupleHandlerExample } from './make-undoable-from-to-tuple-handler';
import MakeUndoableFTTupleHandlerReadme from './make-undoable-from-to-tuple-handler.md';

import { WrapFTObjHandlerExample } from './wrap-from-to-handler';
import WrapFromToHandlerReadme from './wrap-from-to-handler.md';

import { WrapFTTupleHandlerExample } from './wrap-from-to-tuple-handler';
import WrapFTTupleHandlerReadme from './wrap-from-to-tuple-handler.md';

import { ConvertHandlerExample } from './convert-handler';
import ConvertHandlerReadme from './convert-handler.md';

import { MakeUndoableHandlerExample } from './make-undoable-handler';
import MakeUndoableHandlerIntro from './make-undoable-handler-intro.md';
import MakeUndoableHandlerReadme from './make-undoable-handler.md';
import { InvertHandlersExample } from './make-undoables-invert';
import MakeUndoablesInvertIntro from './make-undoables-invert-intro.md';
import MakeUndoablesInvertReadme from './make-undoables-invert.md';
import { MakeUndoablesUtils } from './make-undoables-utils';
import MakeUndoablesUtilsIntro from './make-undoables-utils-intro.md';
import MakeUndoablesUtilsReadme from './make-undoables-utils.md';

storiesOf('useFlexibleUndo/utilities', module)
  //@ts-ignore
  .addParameters({ options: { theme: {} } })
  .add('invertHandlers', () => <InvertHandlersExample />, {
    readme: {
      content: MakeUndoablesInvertIntro,
      sidebar: MakeUndoablesInvertReadme,
    },
  })
  .add('makeHandler and combineHandlers', () => <MakeUndoablesUtils />, {
    readme: {
      content: MakeUndoablesUtilsIntro,
      sidebar: MakeUndoablesUtilsReadme,
    },
  })
  .add('makeUndoableHandler', () => <MakeUndoableHandlerExample />, {
    readme: {
      content: MakeUndoableHandlerIntro,
      sidebar: MakeUndoableHandlerReadme,
    },
  })
  .add('extract updater functions', () => <MakeUndoablesUtil />, {
    readme: {
      content: MakeUndoablesUtilIntro,
      sidebar: MakeUndoablesUtilReadme,
    },
  })
  .add('makeUndoableFTObjHandler', () => <MakeUndoableFTObjHandlerExample />, {
    readme: {
      content: MakeUndoableFromToHandlerIntro,
      sidebar: MakeUndoableFromToHandlerReadme,
    },
  })
  .add(
    'makeUndoableFTTupleHandler',
    () => <MakeUndoableFTTupleHandlerExample />,
    {
      readme: {
        sidebar: MakeUndoableFTTupleHandlerReadme,
      },
    }
  )
  .add('wrapFTObjHandler', () => <WrapFTObjHandlerExample />, {
    readme: {
      sidebar: WrapFromToHandlerReadme,
    },
  })
  .add('wrapFTTupleHandler', () => <WrapFTTupleHandlerExample />, {
    readme: {
      sidebar: WrapFTTupleHandlerReadme,
    },
  })
  .add('convertHandler', () => <ConvertHandlerExample />, {
    readme: {
      sidebar: ConvertHandlerReadme,
    },
  });
