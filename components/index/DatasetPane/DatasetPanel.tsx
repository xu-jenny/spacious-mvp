"use client";
import { PFASSearchResult, SearchResult } from "@/app/search";
import { USDatasetSource } from "../SearchButton";
import PFASDatasetPanel from "./PFASDatasetPanel";
import SearchResultDatasetPanel from "./SearchResultDatasetPane";
import { SearchResults } from "@/app/page";
import { NCDEQWSSearchResult } from "@/app/NCDEQWSSearch";
import NCDEQWSDatasetPanel from "./NCDEQWSDatasetPane";

type Props = {
	dataset: SearchResults | null;
	dsSource: USDatasetSource;
};

function DatasetPanel({ dataset, dsSource }: Props) {
	const searchResultPanel = function(dsType: USDatasetSource){
		switch(dsType){
			case 'PFAS':
				return <PFASDatasetPanel dataset={dataset as PFASSearchResult} />
			case 'NC_DEQ_WATERSUPPLY':
				return <NCDEQWSDatasetPanel dataset={dataset as NCDEQWSSearchResult} />
			default:
				return <SearchResultDatasetPanel dsMetadata={dataset as SearchResult} />
			
		}
	}
	return (
        <>
		    {searchResultPanel(dsSource)}
        </>
	);
}

export default DatasetPanel;
