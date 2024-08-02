"use client";
import { PFASSearchResult, SearchResult } from "@/app/search";
import { USDatasetSource } from "../SearchButton";
import SearchResultDatasetPanel from "./SearchResultDatasetPane";
import { SearchResults } from "@/app/page";
import { NCDEQWSSearchResult } from "@/app/NCDEQWSSearch";
import NCDEQWSDatasetPanel from "./NCDEQWSDatasetPane";

import dynamic from 'next/dynamic';
const PFASDatasetPanel = dynamic(() => import('./PFASDatasetPanel'), { ssr: false });

type Props = {
	dataset: SearchResults | null;
	dsSource: USDatasetSource;
	location?: string;
	query?: string;
};

function DatasetPanel({ dataset, dsSource, location, query }: Props) {
	console.log(query, location, dataset?.id, dsSource)
	const searchResultPanel = function(dsType: USDatasetSource){
		switch(dsType){
			case 'PFAS':
				return <PFASDatasetPanel dataset={dataset as PFASSearchResult} />
			case 'NC_DEQ_WATERSUPPLY':
				return <NCDEQWSDatasetPanel dataset={dataset as NCDEQWSSearchResult} location={location} query={query} />
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
