"use client";
import { PFASSearchResult, SearchResult, USGSWaterSearchResult } from "@/app/search";
import { USDatasetSource } from "../EditTagButton";
import USGSWaterDatasetCard from "./USGSWaterdatasetCard";
import SearchResultDatasetCard from "./SearchResultDatasetCard";
import PFASSearchResultCard from "./PFASSearchResultCard";
type Props = {
	dataset: SearchResult | PFASSearchResult | USGSWaterSearchResult;
	index: number;
	setSelectedDataset: (x: SearchResult | PFASSearchResult | USGSWaterSearchResult) => void;
	dsSource: USDatasetSource;
};

function DatasetCard({ dataset, index, setSelectedDataset, dsSource }: Props) {
	const searchResultCard = function(){
		switch(dsSource){
			case 'USGS_WATER':
				return <USGSWaterDatasetCard dataset={dataset as USGSWaterSearchResult} index={index} />
			case 'PFAS':
				return <PFASSearchResultCard dataset={dataset as PFASSearchResult} index={index} setSelectedDataset={setSelectedDataset} />
			default:
				return <SearchResultDatasetCard dataset={dataset as SearchResult} index={index} setSelectedDataset={setSelectedDataset} />
			
		}
	}
	return (
		{searchResultCard}
	);
}

export default DatasetCard;
