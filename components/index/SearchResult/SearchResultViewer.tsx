import { SearchResults } from "@/app/page";
import { USDatasetSource } from "../SearchButton";

import { FaMapMarkedAlt } from "react-icons/fa";
import { Spinner, Tabs, TabsRef } from "flowbite-react";
import { useRef, useState } from "react";
import { FaList } from "react-icons/fa";
import ListSearchResultViewer from "@/components/index/ListSearchResultViewer";
import PigeonMapViewer from "../PigeonMapViewer";
import { USGSWaterSearchResult } from "@/app/search";

interface Props {
  primaryData: SearchResults[];
  dsSource: USDatasetSource;
  location: string;
  setDatasetSelected: (ds: SearchResults) => void;
}

const SearchResultViewer = ({
  primaryData,
  dsSource,
  setDatasetSelected,
  location,
}: Props) => {
  const tabsRef = useRef<TabsRef>(null);

  return (
    <>
      {dsSource == "USGS_WATER" ? (
        <Tabs
          aria-label="Default tabs"
          ref={tabsRef}
        >
          <Tabs.Item active title="List" icon={FaList}>
            <ListSearchResultViewer
              primaryData={primaryData}
              setDatasetSelected={setDatasetSelected}
              dsSource={dsSource}
            />
          </Tabs.Item>
          <Tabs.Item title="Map" icon={FaMapMarkedAlt}>
            {dsSource == "USGS_WATER" ? (
              <PigeonMapViewer
                location={location}
                data={primaryData as USGSWaterSearchResult[]}
              />
            ) : (
              <p>
                Sorry, we do not support map viewer for this data source yet
              </p>
            )}
          </Tabs.Item>
        </Tabs>
      ) : (
        <ListSearchResultViewer
          primaryData={primaryData}
          setDatasetSelected={setDatasetSelected}
          dsSource={dsSource}
        />
      )}
    </>
  );
};

export default SearchResultViewer;
