const dateFormat = /^\d\d\d\d-\d\d-\d\dT\d\d:\d\d:\d\d.\d\d\dZ$/;

export const reviver = (_: string, value: string) =>
  typeof value === 'string' && dateFormat.test(value) ? new Date(value) : value;
