import { useEffect, useState } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { Table } from "./common/Table";
import { logTableInteraction } from "@/utils/supabaseLogger";

type LocationGranularity = "county" | "country" | "state" | "town" | "zip"
type DatasetType = "csv" | "pdf"
export type DatasetMetadata = {
  id: number;
  created_at: string;
  title: string;
  summary: string;
  lastUpdated: string;
  location: string;
  locationGranularity: LocationGranularity;
  metadata: string | null;
  datasetUrl: string;
  publisher: {
    name: string;
    url?: string
  };
  primary_tag: string;
  tangential_tag: string;
  datasetType: DatasetType;
  reportS3Key?: string;
};

const MetadataTable = ({
  data,
  tableName,
  paginate = false,
}: {
  data: DatasetMetadata[];
  tableName: string;
  paginate?: boolean;
}) => {
  const columnHelper = createColumnHelper<DatasetMetadata>();

  const longStringShortener = (str: string) =>
    str != null && str.length > 180 ? `${str.substring(0, 180)}...` : str;

  const logLinkClick = (data: DatasetMetadata, index: number) => {
    logTableInteraction("LinkClick", index, data.title.toString());
  };

  const columns = [
    columnHelper.accessor("title", {
      cell: (props) => (
        <a
          style={{ color: "blue" }}
          href={props.row.original.dataseturl}
          onClick={() => logLinkClick(props.row.original, props.row.index)}
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
