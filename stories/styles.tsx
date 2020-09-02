import { css } from 'emotion';

export const rootStyle = css`
  font-family: Verdana, sans-serif;
  font-size: 14px;
  margin-top: 20px;
`;

export const topUIStyle = css`
  padding: 20px 0 0;
  border-top: 1px solid #ddd;
  z-index: 1;
  background: white;
  position: sticky;
  top: 0;
  border-bottom: 1px solid #ddd;
  margin: 20px 0;
  select {
    font-size: 14px;
    font-family: Verdana, sans-serif;
    padding: 4px 8px;
    margin-right: 10px;
    width: 200px;
  }
  button,
  input[type='number'] {
    font-size: 14px;
    margin-right: 10px;
    padding: 4px 8px;
    border-radius: 2px;
    font-family: Verdana, sans-serif;
    &:focus {
      outline: 1px solid #48a7f6;
    }
    display: inline-block;
  }
  label {
    font-size: 18px;
    font-family: monospace;
  }
  input[type='number'] {
    width: 84px;
    border: 1px solid gray;
    font-size: 18px;
    font-family: monospace;
    height: 17px;
    padding-left: 10px;
  }
  button {
    border: 1px solid lightgray;
    &:hover:not(:disabled) {
      background: #f7f8fa;
    }
    cursor: pointer;
    :disabled {
      border-color: #ddd;
      cursor: inherit;
    }
    min-width: 95px;
  }
`;

export const countStyle = css`
  font-size: 18px;
  margin-bottom: 20px;
  font-family: monospace;
`;

export const actionsStyle = css`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  white-space: nowrap;
`;

export const getStackItemStyle = (props: { active: boolean }) => css`
  padding: 6px 0;
  cursor: default;
  ${props.active
    ? 'color: #48a7f6;'
    : `
    cursor: pointer;
    &:hover {
      background: #f7f8fa;
    } 
  `}
`;
