import { css } from 'emotion';

export const rootClass = css`
  font-family: Verdana, sans-serif;
  font-size: 14px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
`;

export const uiContainerClass = css`
  margin: 20px 0;
  button,
  input[type='number'] {
    font-size: 14px;
    margin-right: 10px;
    padding: 4px 8px;
    border-radius: 2px;
  }
  input[type='number'] {
    width: 40px;
    border: 1px solid gray;
  }
  button {
    border: 1px solid lightgray;
    &:hover:not(:disabled) {
      background: #f7f8fa;
    }
    cursor: pointer;
    :disabled {
      border-color: #eee;
      cursor: inherit;
    }
  }
`;

export const getStackItemClass = (props: {
  active: boolean;
  range: 'past' | 'future';
}) => css`
  padding: 6px 0;
  cursor: default;
  color: ${props.range === 'future' ? '#BBB' : 'black'};
  ${props.active
    ? 'color: #48a7f6;'
    : `
    cursor: pointer;
    &:hover {
      background: #f7f8fa;
    } 
  `}
`;
