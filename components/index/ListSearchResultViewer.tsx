import { PaginatedList } from "react-paginated-list";
import { USDatasetSource } from "./SearchButton";
import { useLogger } from "@/utils/supabaseLogger";
import USGSWaterDatasetCard from "./SearchResult/USGSWaterdatasetCard";
import LaserficheSearchResultCard from "./SearchResult/LaserficheSearchResultCard";
import NCDEQWSResultCard from "./SearchResult/NCDEQWSResultCard";
import { NCDEQWSSearchResult } from "@/app/search/NCDEQWSSearch";
import { SearchResults } from "@/app/app/page";
import {
  LaserficheSearchResult,
  GenericSearchResult,
  USGSWaterSearchResult,
} from "@/app/search/search";

interface Props {
  primaryData: SearchResults[];
  setDatasetSelected: (ds: SearchResults) => void;
  dsSource: USDatasetSource;
  startTime: string;
  endTime: string;
  panelIsOpen: boolean;
}
const ListSearchResultViewer = ({
  primaryData,
  setDatasetSelected,
  dsSource,
  startTime,
  endTime,
  panelIsOpen,
}: Props) => {
  const logger = useLogger();

  const searchResultCard = function (dataset: SearchResults, index: number) {
    switch (dsSource) {
      case "USGS_WATER":
        return (
          <USGSWaterDatasetCard
            key={index}
            dataset={dataset as USGSWaterSearchResult}
            index={index}
            setDatasetSelected={setDatasetSelected}
            startTime={startTime}
            endTime={endTime}
          />
        );
      case "PFAS":
        return (
          <LaserficheSearchResultCard
            key={index}
            dataset={dataset as LaserficheSearchResult}
            index={index}
            setSelectedDataset={setDatasetSelected}
            panelIsOpen={panelIsOpen}
          />
        );
      case "NC_DEQ_WATERSUPPLY":
        return (
          <NCDEQWSResultCard
            key={index}
            dataset={dataset as NCDEQWSSearchResult}
            index={index}
            setDatasetSelected={setDatasetSelected}
          />
        );
    }
  };
  return (
    <>
      <PaginatedList
        list={primaryData || []}
        itemsPerPage={20}
        renderList={(list: Array<any>) => (
          <>{list.map((data, i) => searchResultCard(data, i))}</>
        )}
        onPageChange={(newItems, newPage) => {
          if (process.env.NODE_ENV === "production") {
            logger.log("NextPage", newItems.length.toString());
          }
        }}
      />
      <div className="bottom-0 w-[82%] absolute bg-white flex justify-center"></div>
    </>
  );
};

export default ListSearchResultViewer;
