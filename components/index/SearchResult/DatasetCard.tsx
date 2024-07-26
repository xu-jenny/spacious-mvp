"use client";
import { PFASSearchResult, SearchResult, USGSWaterSearchResult } from "@/app/search";
import { USDatasetSource } from "../SearchButton";
import USGSWaterDatasetCard from "./USGSWaterdatasetCard";
import SearchResultDatasetCard from "./SearchResultDatasetCard";
import PFASSearchResultCard from "./PFASSearchResultCard";
import { NCDEQWSSearchResult } from "@/app/NCDEQWSSearch";
import NCDEQWSResultCard from "./NCDEQWSResultCard";
import { SearchResults } from "@/app/page";
type Props = {
	dataset: SearchResult | PFASSearchResult | USGSWaterSearchResult;
	index: number;
	setSelectedDataset: (x: SearchResults) => void;
	dsSource: USDatasetSource;
};

function DatasetCard({ dataset, index, setSelectedDataset, dsSource }: Props) {
	const searchResultCard = function(){
		switch(dsSource){
			case 'USGS_WATER':
				return <USGSWaterDatasetCard dataset={dataset as USGSWaterSearchResult} index={index} />
			case 'PFAS':
				return <PFASSearchResultCard dataset={dataset as PFASSearchResult} index={index} setSelectedDataset={setSelectedDataset} />
			case 'NC_DEQ_WATERSUPPLY':
				return <NCDEQWSResultCard dataset={dataset as NCDEQWSSearchResult} setDatasetSelected={setSelectedDataset} index={index} />
			default:
				return <SearchResultDatasetCard dataset={dataset as SearchResult} index={index} setSelectedDataset={setSelectedDataset} />
			
		}
	}
	return (
		{searchResultCard}
	);
}

export default DatasetCard;
