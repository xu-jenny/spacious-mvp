import { useEffect, useState } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { Table } from "./common/Table";
import { logTableInteraction } from "@/utils/supabaseLogger";
import Link from "next/link";
import { jsonParse } from "@/utils/json";

type LocationGranularity = "county" | "country" | "state" | "town" | "zip";
type DatasetType = "csv" | "pdf";
type DatasetMetadata = {
  id: number;
  created_at: string;
  title: string;
  summary: string;
  lastUpdated: string;
  location: string;
  locationGranularity: LocationGranularity;
  metadata: string | null;
  datasetUrl: string;
  publisher: string;
  topic: string;
  subtags: string;
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
    if (process.env.NODE_ENV === "production") {
      logTableInteraction("LinkClick", index, data.title.toString());
    }
  };

  const columns = [
    columnHelper.accessor("title", {
      cell: (props) => (
        <Link
          style={{ color: "blue" }}
          href={"/dataset/" + props.row.original.id}
          onClick={() => logLinkClick(props.row.original, props.row.index)}
        >
          {props.getValue()}
        </Link>
      ),
    }),
    columnHelper.accessor("summary", {
      cell: (info) => longStringShortener(info.getValue()),
    }),
    columnHelper.accessor("location", {
      cell: (info) => info.getValue(),
    }),
    // columnHelper.accessor("publisher", {
    //   cell: (info) => info.getValue() != null ? jsonParse(info.getValue())['name'] : "",
    // }),
  ];

  return (
    <div className="p-2">
      <Table data={data} columns={columns} paginate={paginate} />
    </div>
  );
};

export default MetadataTable;
