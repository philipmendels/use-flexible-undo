import { useEffect, useRef } from 'react';

export const useLatest = <T extends any>(value?: T) => {
  const valueRef = useRef<T | undefined>(value);
  useEffect(() => {
    valueRef.current = value;
  }, [value]);
  return valueRef;
};
