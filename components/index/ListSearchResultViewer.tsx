import { PaginatedList } from "react-paginated-list";
import { USDatasetSource } from "./EditTagButton";
import { logTableInteraction } from "@/utils/supabaseLogger";
import { SearchResults } from "@/app/page";
import USGSWaterDatasetCard from "./SearchResult/USGSWaterdatasetCard";
import { PFASSearchResult, SearchResult, USGSWaterSearchResult } from "@/app/search";
import PFASSearchResultCard from "./SearchResult/PFASSearchResultCard";
import SearchResultDatasetCard from "./SearchResult/SearchResultDatasetCard";

interface Props {
  primaryData: SearchResults[];
  setDatasetSelected: (ds: SearchResults) => void;
  dsSource: USDatasetSource;
}
const ListSearchResultViewer = ({
  primaryData,
  setDatasetSelected,
  dsSource,
}: Props) => {
  const searchResultCard = function(dataset: SearchResults, index: number){
		switch(dsSource){
			case 'USGS_WATER':
				return <USGSWaterDatasetCard key={index} dataset={dataset as USGSWaterSearchResult} index={index} />
			case 'PFAS':
				return <PFASSearchResultCard key={index} dataset={dataset as PFASSearchResult} index={index} setSelectedDataset={setDatasetSelected} />
			default:
				return <SearchResultDatasetCard key={index} dataset={dataset as SearchResult} index={index} setSelectedDataset={setDatasetSelected} />
			
		}
	}
  return (
    <>
      <PaginatedList
        list={primaryData || []}
        itemsPerPage={20}
        renderList={(list: Array<any>) => (
          <>
            {list.map((data, i) => searchResultCard(data, i))}
          </>
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
