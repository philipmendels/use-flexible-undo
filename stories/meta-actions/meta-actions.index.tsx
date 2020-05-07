import React from 'react';
import { storiesOf } from '@storybook/react';

import { MakeUndoablesMeta1 } from './make-undoables-meta-1';
import MakeUndoablesMeta1Readme from './make-undoables-meta-1.md';
import { MakeUndoablesMeta } from './make-undoables-meta';
import MakeUndoablesMetaReadme from './make-undoables-meta.md';
import { CombineUHandlerWithMetaExample } from './combine-uhandler-with-meta';
import CombineUHandlerWithMetaReadme from './combine-uhandler-with-meta.md';

storiesOf('useFlexibleUndo/meta actions', module)
  //@ts-ignore
  .addParameters({ options: { theme: {} } })
  .add('makeUndoables meta 1 ', () => <MakeUndoablesMeta1 />, {
    readme: {
      sidebar: MakeUndoablesMeta1Readme,
    },
  })
  .add('makeUndoables meta 2', () => <MakeUndoablesMeta />, {
    readme: {
      sidebar: MakeUndoablesMetaReadme,
    },
  })
  .add('combineUHandlerWithMeta', () => <CombineUHandlerWithMetaExample />, {
    readme: {
      sidebar: CombineUHandlerWithMetaReadme,
    },
  });
