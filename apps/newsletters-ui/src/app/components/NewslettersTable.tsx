import { useMemo } from 'react';
import type { Column } from 'react-table';
import { Table } from './Table';

export const NewslettersTable = () => {
  const data = useMemo<object[]>(
    () => [
      {
        col1: 'Hello',
        col2: 'World',
      },
      {
        col1: 'react-table',
        col2: 'rocks',
      },
      {
        col1: 'whatever',
        col2: 'you want',
      },
    ],
    [],
  );
  const columns = useMemo<Column[]>(
    () => [
      {
        Header: 'Column 1',
        accessor: 'col1',
      },
      {
        Header: 'Column 2',
        accessor: 'col2',
      },
    ],
    [],
  );
	return <Table data={data} columns={columns}/>
}
