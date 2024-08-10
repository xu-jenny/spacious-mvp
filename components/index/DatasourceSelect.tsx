"use client";

import { Dropdown } from "flowbite-react";
import { Dispatch, SetStateAction } from "react";
import { USDatasetSource } from "./SearchButton";
import { useRouter } from 'next/navigation';

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
  const router = useRouter();
  const currentLabel = dataSource ? dataSourceLabels[dataSource] : "Any";

  const handleSelect = (value: string) => {
    router.push('/');
    setDataSource(value as USDatasetSource);
  };
  return (
    <Dropdown
      label={currentLabel}
      color="light"
      theme={{
        floating: {
          target:
            "shadow block w-full text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500",
          item: {
            base: "px-0 py-0 text-left hover:bg-blue-200 w-full rounded dark:hover:bg-blue-600 dark:text-blue-300",
          },
        },
      }}
    >
      {/* TODO: map this on datasourceLabels */}
      <Dropdown.Item onClick={() => handleSelect("ANY")}>ALL</Dropdown.Item>
      <Dropdown.Item onClick={() => handleSelect("PFAS")}>PFAS</Dropdown.Item>
      <Dropdown.Item onClick={() => handleSelect("USGS_WATER")}>USGS Water</Dropdown.Item>
      <Dropdown.Item onClick={() => handleSelect("NC_DEQ_WATERSUPPLY")}>
        NC DEQ Water Supply
      </Dropdown.Item>
      <Dropdown.Item onClick={() => handleSelect("USGS")}>USGS</Dropdown.Item>
      <Dropdown.Item onClick={() => handleSelect("LASERFICHE")}>
        NC DEQ
      </Dropdown.Item>
      <Dropdown.Item onClick={() => handleSelect("USGOV")}>
        US Gov
      </Dropdown.Item>
      <Dropdown.Item onClick={() => handleSelect("NYOPEN")}>
        NY Open Data
      </Dropdown.Item>
    </Dropdown>
  );
};

export default DatasourceSelect;
