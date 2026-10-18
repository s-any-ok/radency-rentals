import { ReactNode } from 'react';

export type DataGridColumn<T> = {
  key: string;
  title: string;
  /** Relative column width. */
  flex?: number;
  align?: 'left' | 'right';
  /** When set, tapping the header asks the server to sort by this key. */
  sortKey?: string;
  render: (row: T) => ReactNode;
};

export type DataGridSort = {
  sortBy: string;
  direction: 'Asc' | 'Desc';
  onChange: (sortBy: string, direction: 'Asc' | 'Desc') => void;
};
