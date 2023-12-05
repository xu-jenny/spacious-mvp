import { useEffect, useState } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { Table } from "./common/Table";

export type DatasetMetadata = {
  id: number;
  created_at: string;
  title: string;
  summary: string;
  lastUpdated: string;
  location: string;
  metadata: string;
  dataseturl: string;
  publisher: string;
  primary_tag: string;
  tangential_tag: string;
};

const MetadataTable = ({
  data,
  paginate = false,
}: {
  data: DatasetMetadata[];
  paginate?: boolean;
}) => {
  const columnHelper = createColumnHelper<DatasetMetadata>();

  const longStringShortener = (str: string) =>
    str != null && str.length > 180 ? `${str.substring(0, 180)}...` : str;

  const logLinkClick = async (data: DatasetMetadata) => {
    
  };

  const columns = [
    columnHelper.accessor("title", {
      cell: (props) => (
        <a
          style={{ color: "blue" }}
          href={props.row.original.dataseturl}
          onClick={() => logLinkClick(props.row.original)}
        >
          {props.getValue()}
        </a>
      ),
    }),
    columnHelper.accessor("summary", {
      cell: (info) => longStringShortener(info.getValue()),
    }),
    columnHelper.accessor("location", {
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("publisher", {
      cell: (info) => info.getValue(),
    }),
  ];

  return (
    <div className="p-2">
      <Table data={data} columns={columns} paginate={paginate} />
    </div>
  );
};

export default MetadataTable;
