import { PayloadFromTo } from './index.types';

export const makeFromToHandler = <T>(handler: (payload: T) => any) => ({
  do: ({ to }: PayloadFromTo<T>) => handler(to),
  undo: ({ from }: PayloadFromTo<T>) => handler(from),
});
