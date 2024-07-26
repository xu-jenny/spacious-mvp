"use client";

import { Dropdown } from "flowbite-react";
import { Dispatch, SetStateAction } from "react";
import { USDatasetSource } from "./SearchButton";

type Props = {
  dataSource: USDatasetSource | null;
  setDataSource: Dispatch<SetStateAction<USDatasetSource>>;
};

const dataSourceLabels: { [key in USDatasetSource]: string } = {
  ANY: "ALL",
  PFAS: "PFAS",
  USGS: "USGS",
  LASERFICHE: "NC DEQ",
  USGOV: "US Gov",
  USGS_WATER: "USGS Water",
  NYOPEN: "NY Open Data",
  NC_DEQ_WATERSUPPLY: "NC DEQ Water Supply"
};

const DatasourceSelect = ({ dataSource, setDataSource }: Props) => {
  const currentLabel = dataSource ? dataSourceLabels[dataSource] : "Any";
  return (
    <Dropdown
      label={currentLabel}
      color="light"
      theme={{
        floating: {
          target:
            "shadow block w-full text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500",
          item: {
            base: "px-3 py-1 text-left hover:bg-blue-200 w-full rounded dark:hover:bg-blue-600 dark:text-blue-300",
          },
        },
      }}
    >
      {/* TODO: map this on datasourceLabels */}
      <Dropdown.Item onClick={() => setDataSource("ANY")}>ALL</Dropdown.Item>
      <Dropdown.Item onClick={() => setDataSource("PFAS")}>PFAS</Dropdown.Item>
      <Dropdown.Item onClick={() => setDataSource("USGS_WATER")}>USGS Water</Dropdown.Item>
      <Dropdown.Item onClick={() => setDataSource("NC_DEQ_WATERSUPPLY")}>
        NC Deq Water Supply
      </Dropdown.Item>
      <Dropdown.Item onClick={() => setDataSource("USGS")}>USGS</Dropdown.Item>
      <Dropdown.Item onClick={() => setDataSource("LASERFICHE")}>
        NC DEQ
      </Dropdown.Item>
      <Dropdown.Item onClick={() => setDataSource("USGOV")}>
        US Gov
      </Dropdown.Item>
      <Dropdown.Item onClick={() => setDataSource("NYOPEN")}>
        NY Open Data
      </Dropdown.Item>
    </Dropdown>
  );
};

export default DatasourceSelect;
