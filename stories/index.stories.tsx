import React from 'react';
import { storiesOf } from '@storybook/react';
import { Basic } from './basic.stories';
import { FromTo } from './from-to.stories';

storiesOf('use-infinite-undo', module)
  .add('Basic', () => <Basic />)
  .add('FromTo', () => <FromTo />);
