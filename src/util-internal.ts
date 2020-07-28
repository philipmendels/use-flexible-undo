import { Entry, Updater, DeepPartial, UAction } from './index.types';
import { mergeDeepLeft } from 'ramda';

export const makeActionCreator = <A extends UAction>(
  type: A['type'],
  isUndo?: boolean
) => (payload: A['payload']) =>
  ({
    type,
    payload,
    ...(isUndo ? { meta: { isUndo } } : {}),
  } as UAction<A['type'], A['payload']>);

export const merge = <S, P extends Partial<S>>(
  partial: P
): Updater<S> => state => ({
  ...state,
  ...partial,
});

export const mergeDeepC = <S, P extends DeepPartial<S>>(
  deepPartial: P
): Updater<S> => mergeDeepLeft(deepPartial as any) as Updater<S>;

export const mergeDeep = <S>(deepPartial: DeepPartial<S>, state: S): S =>
  mergeDeepLeft(deepPartial as any, state as any) as S;

export const mapReverse = <T, R>(arr: T[], fn: (t: T) => R) =>
  arr.map((_, idx, arr) => fn(arr[arr.length - 1 - idx]));

type ObjMap<V> = { [key: string]: V };

// for mapping to an object with the same keys but different value types
export const mapObject = <O extends object>(obj: O) => <O2 extends object>(
  mapFn: (e: Entry<O>) => Entry<O2>
) => fromEntries<O2>(toEntries(obj).map(mapFn));

const toEntries = <O extends object>(obj: O) =>
  Object.entries(obj) as Entry<O>[];

const fromEntries = <O extends object>(entries: Entry<O>[]) =>
  Object.fromEntries(entries) as O;

// for mapping to an object with the same keys and the same value types
export const mapObjMap = <V>(
  updater: Updater<V>
): Updater<ObjMap<V>> => objMap =>
  Object.fromEntries(Object.entries(objMap).map(([k, v]) => [k, updater(v)]));

export const mapFilterObj = <V>(
  selector: (value: V) => boolean,
  updater: Updater<V>,
  obj: ObjMap<V>
): ObjMap<V> => mapObjMap<V>(v => (selector(v) ? updater(v) : v))(obj);

// curried version
export const mapFilterObjC = <V>(
  selector: (value: V) => boolean,
  updater: Updater<V>
): Updater<ObjMap<V>> => mapObjMap(v => (selector(v) ? updater(v) : v));
