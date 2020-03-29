import React, { FC } from 'react';

type Nullber = number | null;

interface Props {
  value: Nullber;
  onChange: (value: Nullber) => any;
}

export const NumberInput: FC<Props> = ({ value: v, onChange }) => (
  <input
    type="number"
    value={v === null ? '' : v}
    onChange={({ target: { value } }) =>
      onChange(value === '' ? null : Number(value))
    }
  />
);
