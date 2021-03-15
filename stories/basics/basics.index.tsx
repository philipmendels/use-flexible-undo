import React from 'react';
import { storiesOf } from '@storybook/react';

import { IntroExample } from './intro';
import IntroExampleIntro from './intro.intro.md';
import IntroExampleReadme from './intro.md';

import { DeltaPayloadExample } from './delta-payload';
import DeltaPayloadIntro from './delta-payload-intro.md';
import DeltaPayloadReadme from './delta-payload.md';

import { MakeHandlerExample } from './make-handler';
import MakeHandlerIntro from './make-handler-intro.md';
import MakeHandlerReadme from './make-handler.md';

import { MakeUndoableHandlerExample } from './make-undoable-handler';
import MakeUndoableHandlerIntro from './make-undoable-handler-intro.md';
import MakeUndoableHandlerReadme from './make-undoable-handler.md';

import { SeparateDrdoAndUndoHandlersExample } from './make-handler-separate';
import MakeHandlerSeparateIntro from './make-handler-separate-intro.md';
import MakeHandlerSeparateReadme from './make-handler-separate.md';

import { FromToPayloadExample } from './from-to-payload';
import FromToPayloadIntro from './from-to-payload-intro.md';
import FromToPayloadReadme from './from-to-payload.md';

import { MakeUndoableFTHandlerExample } from './make-undoable-from-to-handler';
import MakeUndoableFromToHandlerIntro from './make-undoable-from-to-handler-intro.md';
import MakeUndoableFromToHandlerReadme from './make-undoable-from-to-handler.md';

import { InvertFTHandlerExample } from './invert-from-to-handler';
import InvertFTHandlerIntro from './invert-from-to-handler-intro.md';
import InvertFTHandlerReadme from './invert-from-to-handler.md';

import { SkipExample } from './skip';

storiesOf('useUndoableEffects/payload & handlers', module)
  //@ts-ignore
  .addParameters({ options: { theme: {} } })
  .add('intro', () => <IntroExample />, {
    readme: {
      content: IntroExampleIntro,
      sidebar: IntroExampleReadme,
    },
  })
  .add('state delta as payload', () => <DeltaPayloadExample />, {
    readme: {
      content: DeltaPayloadIntro,
      sidebar: DeltaPayloadReadme,
    },
  })
  .add('makeHandler & combineHandlers', () => <MakeHandlerExample />, {
    readme: {
      content: MakeHandlerIntro,
      sidebar: MakeHandlerReadme,
    },
  })
  .add(
    'makeUndoableHandler & invertHandlers',
    () => <MakeUndoableHandlerExample />,
    {
      readme: {
        content: MakeUndoableHandlerIntro,
        sidebar: MakeUndoableHandlerReadme,
      },
    }
  )
  .add(
    'separate drdoHandlers and undoHandlers',
    () => <SeparateDrdoAndUndoHandlersExample />,
    {
      readme: {
        content: MakeHandlerSeparateIntro,
        sidebar: MakeHandlerSeparateReadme,
      },
    }
  )
  .add('from- and to-state as payload', () => <FromToPayloadExample />, {
    readme: {
      content: FromToPayloadIntro,
      sidebar: FromToPayloadReadme,
    },
  })
  .add(
    'makeUndoableFTHandler & wrapFTHandler',
    () => <MakeUndoableFTHandlerExample />,
    {
      readme: {
        content: MakeUndoableFromToHandlerIntro,
        sidebar: MakeUndoableFromToHandlerReadme,
      },
    }
  )
  .add('makeFTHandler & invertFTHandler', () => <InvertFTHandlerExample />, {
    readme: {
      content: InvertFTHandlerIntro,
      sidebar: InvertFTHandlerReadme,
    },
  })
  .add('skip', () => <SkipExample />, {
    // readme: {
    //   content: InvertFTHandlerIntro,
    //   sidebar: InvertFTHandlerReadme,
    // },
  });
