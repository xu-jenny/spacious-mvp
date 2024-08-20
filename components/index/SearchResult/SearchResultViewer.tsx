import React, { useState, useEffect } from "react";
import { SearchResults } from "@/app/page";
import { USDatasetSource } from "../SearchButton";
import { FaMapMarkedAlt } from "react-icons/fa";
import { Tabs, TabsRef } from "flowbite-react";
import { useRef } from "react";
import { FaList } from "react-icons/fa";
import ListSearchResultViewer from "@/components/index/ListSearchResultViewer";
import PigeonMapViewer from "../PigeonMapViewer";
import { USGSWaterSearchResult } from "@/app/search";
import { useStateContext } from "@/app/StateContext";

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
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (primaryData.length > 0) {
      setShowBanner(true);
    }
  }, [primaryData]);

  return (
    <>
      {dsSource === "USGS_WATER" ? (
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
            {dsSource === "USGS_WATER" && state.location ? (
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

      {/* Conditional rendering of the banner */}
      {showBanner && (
        <div className="fixed bottom-0 w-full bg-gray-200 text-center py-4">
          Not seeing the data you're looking for?{" "}
          <button className="text-blue-600">Request Data</button>
        </div>
      )}
    </>
  );
};

export default SearchResultViewer;
