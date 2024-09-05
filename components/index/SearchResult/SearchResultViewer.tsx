
import { USDatasetSource } from "../SearchButton";

import { FaMapMarkedAlt } from "react-icons/fa";
import { Spinner, Tabs, TabsRef } from "flowbite-react";
import { useRef, useState } from "react";
import { FaList } from "react-icons/fa";
import ListSearchResultViewer from "@/components/index/ListSearchResultViewer";
import PigeonMapViewer from "../PigeonMapViewer";
import { useStateContext } from "@/app/StateContext";
import { USGSWaterSearchResult } from "@/app/search/search";
import { SearchResults } from "@/app/app/page";

interface Props {
  primaryData: SearchResults[];
  dsSource: USDatasetSource;
  setDatasetSelected: (ds: SearchResults) => void;
  startTime: string;
  endTime: string;
}

const SearchResultViewer = ({
  primaryData,
  dsSource,
  setDatasetSelected,
  startTime,
  endTime,
}: Props) => {
  const tabsRef = useRef<TabsRef>(null);
  const { state } = useStateContext();

  return (
    <>
      {dsSource == "USGS_WATER" ? (
        <Tabs aria-label="Default tabs" ref={tabsRef}>
          <Tabs.Item active title="List" icon={FaList}>
            <ListSearchResultViewer
              primaryData={primaryData}
              setDatasetSelected={setDatasetSelected}
              dsSource={dsSource}
              startTime={startTime}
              endTime={endTime}
            />
          </Tabs.Item>
          <Tabs.Item title="Map" icon={FaMapMarkedAlt}>
            {dsSource == "USGS_WATER" && state.location ? (
              <PigeonMapViewer
                data={primaryData as USGSWaterSearchResult[]}
                location={[
                  Number(state.location.lat),
                  Number(state.location.lon),
                ]}
                startTime={startTime}
                endTime={endTime}
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
          startTime={startTime}
          endTime={endTime}
        />
      )}
    </>
  );
};

export default SearchResultViewer;
