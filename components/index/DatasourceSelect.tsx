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
    <div className="p-3 mt-3">
      <span>Specify Data Source</span>
      <Dropdown label={"Any"} inline>
        <Dropdown.Item onClick={() => setDataSource("ANY")}>ALL</Dropdown.Item>
        <Dropdown.Item onClick={() => setDataSource("PFAS")}>
          PFAS
        </Dropdown.Item>
        <Dropdown.Item onClick={() => setDataSource("USGS")}>
          USGS
        </Dropdown.Item>
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
    </div>
  );
};

export default DatasourceSelect;
