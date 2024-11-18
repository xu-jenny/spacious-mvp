"use client";

import { Dropdown } from "flowbite-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStateContext } from "@/app/StateContext";
import { USDatasetSource } from "../SearchButton";

const dataSourceLabels: { [key in USDatasetSource]: string } = {
  ANY: "ALL",
  PFAS: "NC DEQ Laserfiche",
  USGS: "USGS",
  LASERFICHE: "NC DEQ",
  USGOV: "US Gov",
  USGS_WATER: "USGS Water",
  NYOPEN: "NY Open Data",
  NC_DEQ_WATERSUPPLY: "NC DEQ Water Supply",
};

const DatasourceSelect = () => {
  const router = useRouter();
  const { state, dispatch } = useStateContext();
  const [dataSource, setDataSource] = useState<USDatasetSource>(
    state.dataSource
  );
  const currentLabel = dataSource ? dataSourceLabels[dataSource] : "Any";

  const handleSelect = (value: string) => {
    setDataSource(value as USDatasetSource);
    dispatch({ type: "resetState", datasource: value as USDatasetSource }); // Reset state when switching data sources
    router.push("/app"); // Reset URL
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
      <Dropdown.Item onClick={() => handleSelect("USGS_WATER")}>
        USGS Water
      </Dropdown.Item>
      <Dropdown.Item onClick={() => handleSelect("PFAS")}>
        NC DEQ Laserfiche
      </Dropdown.Item>
      <Dropdown.Item onClick={() => handleSelect("NC_DEQ_WATERSUPPLY")}>
        NC DEQ Water Supply
      </Dropdown.Item>
    </Dropdown>
  );
};

export default DatasourceSelect;
