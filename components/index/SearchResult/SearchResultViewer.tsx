import { USDatasetSource } from "../SearchButton";

import { FaMapMarkedAlt } from "react-icons/fa";
import { Tabs, TabsRef } from "flowbite-react";
import { useRef } from "react";
import { FaList } from "react-icons/fa";
import ListSearchResultViewer from "@/components/index/ListSearchResultViewer";
import PigeonMapViewer from "../PigeonMapViewer";
import { useStateContext } from "@/app/StateContext";
import { SearchResults } from "@/app/app/page";
import { USGSWaterSearchResult } from "@/app/search/usgsSearch";

interface Props {
  primaryData: SearchResults[];
  setDatasetSelected: (ds: SearchResults) => void;
  panelIsOpen: boolean; // hacky way to hide badges when panel is open
}

const SearchResultViewer = ({
  primaryData,
  setDatasetSelected,
  panelIsOpen,
}: Props) => {
  const tabsRef = useRef<TabsRef>(null);
  const { state } = useStateContext();

  return (
    <>
      {state.dataSource == "USGS_WATER" ? (
        <Tabs aria-label="Default tabs" ref={tabsRef}>
          <Tabs.Item
            active
            title="List"
            icon={(props) => <FaList {...props} className="mr-2" />}
          >
            <ListSearchResultViewer
              primaryData={primaryData}
              setDatasetSelected={setDatasetSelected}
              dsSource={state.dataSource}
              startTime={state.startDate}
              endTime={state.endDate}
              panelIsOpen={panelIsOpen}
            />
          </Tabs.Item>
          <Tabs.Item
            title="Map"
            icon={(props) => <FaMapMarkedAlt {...props} className="mr-2" />}
          >
            {state.dataSource == "USGS_WATER" && state.location ? (
              <PigeonMapViewer
                data={primaryData as USGSWaterSearchResult[]}
                location={[
                  Number(state.location.lat),
                  Number(state.location.lon),
                ]}
                startTime={state.startDate}
                endTime={state.endDate}
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
          dsSource={state.dataSource}
          startTime={state.startDate}
          endTime={state.endDate}
          panelIsOpen={panelIsOpen}
        />
      )}
    </>
  );
};

export default SearchResultViewer;
