import { UpdaterMaker } from '../.';

export { merge, mapReverse } from '../src/util-internal';

type NumberUpdater = UpdaterMaker<number, number>;

export const addUpdater: NumberUpdater = amount => prev => prev + amount;
export const subtractUpdater: NumberUpdater = amount => prev => prev - amount;
export const multiplyUpdater: NumberUpdater = amount => prev => prev * amount;
export const divideUpdater: NumberUpdater = amount => prev => prev / amount;
