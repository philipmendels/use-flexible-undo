import React from 'react';
import { storiesOf } from '@storybook/react';

import { NoPayloadLight } from './no-payload-light';
import { NoPayload2Light } from './no-payload-2-light';

storiesOf('useFlexibleUndoLight', module)
  //@ts-ignore
  .addParameters({ options: { theme: {} } })
  .add('dependent state: WRONG', () => <NoPayloadLight />, {
    // readme: {
    //   content: MakeUndoablesUtilsIntro,
    //   sidebar: MakeUndoablesUtilsReadme,
    // },
  })
  .add('dependent state: RIGHT', () => <NoPayload2Light />, {
    // readme: {
    //   content: MakeUndoablesUtilsIntro,
    //   sidebar: MakeUndoablesUtilsReadme,
    // },
  });
