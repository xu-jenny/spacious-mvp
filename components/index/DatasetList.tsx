"use client";
import { Tabs } from "flowbite-react";
import { DatasetMetadata } from "../MetadataTable";
import DatasetCard from "./DatasetCard";

export const DatasetList = ({
  primaryDataList,
  tangentialDataList,
}: {
  primaryDataList: DatasetMetadata[];
  tangentialDataList: DatasetMetadata[];
}) => {
  // const searchByTag = () => <>
  //   <EditTagButton
  // </>

  return (
    <div className="px-6">
      {/* <Tabs aria-label="Pills" style="pills" className="max-h-8">
        <Tabs.Item active title="Primary"> */}
      {primaryDataList != null &&
        primaryDataList.length > 0 &&
        primaryDataList.map((data, i) => (
          <DatasetCard key={i} dataset={data} index={i} />
        ))}
      {/* </Tabs.Item>
        <Tabs.Item title="Tangential">
          {tangentialDataList != null &&
            tangentialDataList.length > 0 &&
            tangentialDataList.map((data, i) => (
              <DatasetCard key={i} dataset={data} index={i} />
            ))}
        </Tabs.Item>
      </Tabs> */}
    </div>
  );
};
