export const incr = (n: number) => (prev: number) => prev + n;
export const decr = (n: number) => (prev: number) => prev - n;
export const makeHandler = <T extends any>(
  setter: React.Dispatch<React.SetStateAction<T>>,
  updater: (val: T) => (prev: T) => T
) => (input: T) => setter(updater(input));
