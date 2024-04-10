"use client";

import { Dropdown } from "flowbite-react";
import { Dispatch, SetStateAction } from "react";
import { USDatasetSource } from "./EditTagButton";

type Props = {
    dataSource: USDatasetSource;
  setDataSource: Dispatch<SetStateAction<USDatasetSource | null>>;
}
const DatasourceSelect = ({ dataSource, setDataSource }: Props) => {
  return (
    <div className="p-3 mt-3">
      <Dropdown label={dataSource} inline>
        <Dropdown.Item onClick={() => setDataSource('USGS')}>USGS</Dropdown.Item>
        <Dropdown.Item onClick={() => setDataSource('LASERFICHE')}>LaserFiche</Dropdown.Item>
        <Dropdown.Item onClick={() => setDataSource('USGOV')}>US Gov</Dropdown.Item>
        <Dropdown.Item onClick={() => setDataSource('NYOPEN')}>Ny Open Data</Dropdown.Item>
      </Dropdown>
    </div>
  );
};

export default DatasourceSelect;
