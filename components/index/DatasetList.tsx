"use client";
import { Tabs } from "flowbite-react";
import { DatasetMetadata } from "../MetadataTable";
import DatasetCard from "./DatasetCard";
import EditTagButton from "./EditTagButton";

export const DatasetList = ({
  primaryDataList,
  tangentialDataList,
  location,
  setPrimaryData,
}: {
  primaryDataList: DatasetMetadata[];
  tangentialDataList: DatasetMetadata[];
  location: string;
  setPrimaryData: (data: any[]) => void;
}) => {
  return (
    <div>
      <Tabs aria-label="Pills" style="pills" className="max-h-8">
        <Tabs.Item active title="Primary">
          {primaryDataList == null ||
            (primaryDataList.length == 0 && (
              <>
                <span className="p-2">If you know the keyword you are looking for, search here!</span>
                <EditTagButton
                  location={location}
                  setPrimaryData={setPrimaryData}
                  placeHolder="Search with Keyword"
                />
              </>
            ))}
          {primaryDataList != null &&
            primaryDataList.length > 0 &&
            primaryDataList.map((data, i) => (
              <DatasetCard key={i} dataset={data} index={i} />
            ))}
        </Tabs.Item>
        <Tabs.Item title="Tangential">
          {tangentialDataList != null &&
            tangentialDataList.length > 0 &&
            tangentialDataList.map((data, i) => (
              <DatasetCard key={i} dataset={data} index={i} />
            ))}
        </Tabs.Item>
      </Tabs>
    </div>
  );
};
