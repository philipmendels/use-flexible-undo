import { css } from 'emotion';

export const btnContainerClass = css`
  margin: 20px 0;
  > button {
    font-size: 14px;
    margin-right: 10px;
    padding: 4px 8px;
    border-radius: 2px;
    &:hover:not(:disabled) {
      background: #eee;
    }
    cursor: pointer;
    :disabled {
      border-color: #eee;
      cursor: inherit;
    }
  }
`;

export const rootClass = css`
  font-family: Verdana, sans-serif;
  font-size: 14px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
`;
