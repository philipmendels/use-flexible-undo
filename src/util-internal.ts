import { Entry, UAction, BaseAction } from './index.types';

export const mapObject = <O extends object, O2 extends object>(
  obj: O,
  mapFn: (e: Entry<O>) => Entry<O2>
) => fromEntries<O2>(toEntries(obj).map(mapFn));

const toEntries = <O extends object>(obj: O) =>
  Object.entries(obj) as Entry<O>[];

const fromEntries = <O extends object>(entries: Entry<O>[]) =>
  Object.fromEntries(entries) as O;

export const makeActionCreator = <T extends string>(
  type: T,
  isUndo?: boolean
) => <P extends any>(payload: P) =>
  (({
    type,
    payload,
    ...(isUndo ? { meta: { isUndo } } : {}),
  } as BaseAction) as UAction<T, P>);
