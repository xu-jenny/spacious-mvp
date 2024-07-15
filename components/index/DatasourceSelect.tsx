"use client";

import { Dropdown } from "flowbite-react";
import { Dispatch, SetStateAction } from "react";
import { USDatasetSource } from "./EditTagButton";

type Props = {
  dataSource: USDatasetSource | null;
  setDataSource: Dispatch<SetStateAction<USDatasetSource>>;
};
const DatasourceSelect = ({ dataSource, setDataSource }: Props) => {
  return (
    <Dropdown
      label={dataSource ?? "Any"}
      color="light"
      theme={{
        floating: {
          target:
            "shadow block w-full text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500",
          item: {
            base: "px-3 py-1 text-left hover:bg-gray-300 w-full rounded-lg dark:hover:bg-blue-600 dark:text-blue-300",
          },
        },
      }}
    >
      <Dropdown.Item onClick={() => setDataSource("ANY")}>ALL</Dropdown.Item>
      <Dropdown.Item onClick={() => setDataSource("PFAS")}>PFAS</Dropdown.Item>
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
