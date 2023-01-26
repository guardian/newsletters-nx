import { useMemo } from 'react';
import type { Column } from 'react-table';
import type { Newsletter } from '@newsletters-nx/newsletters-data-client';
import { Table } from './Table';

interface Props {
	newsletters: Newsletter[];
}

export const NewslettersTable = ({newsletters}: Props) => {
  const data = useMemo<object[]>(
    () => newsletters,
    [newsletters],
  );
  const columns = useMemo<Column[]>(
    () => [
      {
        Header: 'Newsletter ID',
        accessor: 'identityName',
				
      },
      {
        Header: 'Newsletter Name',
        accessor: 'name',
      },
    ],
    [],
  );
	return <Table data={data} columns={columns}/>
}
