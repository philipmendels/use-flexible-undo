import { Entry, UAction, BaseAction, Updater } from './index.types';

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

export const mapReverse = <T, R>(arr: T[], fn: (t: T) => R) =>
  arr.map((_, idx, arr) => fn(arr[arr.length - 1 - idx]));

type ObjMap<V> = { [key: string]: V };

export const mapObjMap = <V>(
  updater: Updater<V>
): Updater<ObjMap<V>> => objMap =>
  Object.fromEntries(Object.entries(objMap).map(([k, v]) => [k, updater(v)]));

export const mapObjMap2 = <K extends string, V, V2>(
  objMap: Record<K, V>,
  updater: (entry: [K, V]) => [K, V2]
) =>
  Object.fromEntries(
    Object.entries(objMap).map(entry => updater(entry as [K, V]))
  );

export const mapFilterObjC = <V>(
  selector: (value: V) => boolean,
  updater: Updater<V>
): Updater<ObjMap<V>> => mapObjMap(v => (selector(v) ? updater(v) : v));

export const mapFilterObj = <V>(
  selector: (value: V) => boolean,
  updater: Updater<V>,
  obj: ObjMap<V>
): ObjMap<V> => mapObjMap<V>(v => (selector(v) ? updater(v) : v))(obj);
