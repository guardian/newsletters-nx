import { useMemo } from 'react';
import type { Column } from 'react-table';
import type { Newsletter } from '@newsletters-nx/newsletters-data-client';
import { Table } from './Table';

interface Props {
	newsletters: Newsletter[];
}

export const NewslettersTable = ({newsletters}: Props) => {
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
