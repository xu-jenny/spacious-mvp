import { useEffect, useState } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { Table } from './common/Table';

export type DatasetMetadata = {
    id: number
    created_at: string
    title: string
    summary: string
    lastUpdated: string
    location: string
    metadata: string
    datasetUrl: string
    publisher: string
    primary_tag: string
    tangential_tag: string
  }

const MetadataTable = ({ data } :{ data: DatasetMetadata[] }) => {
  const columnHelper = createColumnHelper<DatasetMetadata>();

  const columns = [
    columnHelper.accessor('title', {
      cell: (props) => <a style={{color: 'blue'}} href={props.row.original.datasetUrl}>{props.getValue()}</a>,
    }),
    columnHelper.accessor('summary', {
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('location', {
      cell: (info) => info.getValue(),
    }),
  ];

  return (
    <div className="p-2">
      <Table data={data} columns={columns} />
    </div>
  );
};

export default MetadataTable;
