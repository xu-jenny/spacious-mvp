import { PaginatedList } from "react-paginated-list";
import { USDatasetSource } from "./SearchButton";
import { logTableInteraction } from "@/utils/supabaseLogger";
import USGSWaterDatasetCard from "./SearchResult/USGSWaterdatasetCard";
import PFASSearchResultCard from "./SearchResult/PFASSearchResultCard";
import SearchResultDatasetCard from "./SearchResult/SearchResultDatasetCard";
import NCDEQWSResultCard from "./SearchResult/NCDEQWSResultCard";
import { NCDEQWSSearchResult } from "@/app/search/NCDEQWSSearch";
import { SearchResults } from "@/app/app/page";
import { PFASSearchResult, SearchResult, USGSWaterSearchResult } from "@/app/search/search";

interface Props {
  primaryData: SearchResults[];
  setDatasetSelected: (ds: SearchResults) => void;
  dsSource: USDatasetSource;
  startTime: string;
  endTime: string;
}
const ListSearchResultViewer = ({
  primaryData,
  setDatasetSelected,
  dsSource,
  startTime,
  endTime,
}: Props) => {
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
          <PFASSearchResultCard
            key={index}
            dataset={dataset as PFASSearchResult}
            index={index}
            setSelectedDataset={setDatasetSelected}
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
      default:
        return (
          <SearchResultDatasetCard
            key={index}
            dataset={dataset as SearchResult}
            index={index}
            setSelectedDataset={setDatasetSelected}
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
            logTableInteraction(
              "NextPage",
              newPage,
              newItems.length.toString()
            );
          }
        }}
      />
      <div className="bottom-0 w-[82%] absolute bg-white flex justify-center"></div>
    </>
  );
};

export default ListSearchResultViewer;
