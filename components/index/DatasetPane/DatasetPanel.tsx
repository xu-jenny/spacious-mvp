"use client";

import { USDatasetSource } from "../SearchButton";
import SearchResultDatasetPanel from "./SearchResultDatasetPane";
import { NCDEQWSSearchResult } from "@/app/search/NCDEQWSSearch";
import NCDEQWSDatasetPanel from "./NCDEQWSDatasetPane";

import dynamic from "next/dynamic";
import USGSWaterDatasetPane from "./USGSWaterDatasetPane";
import { LaserficheSearchResult, USGSWaterSearchResult, SearchResult } from "@/app/search/search";
import { SearchResults } from "@/app/app/page";

const PFASDatasetPanel = dynamic(() => import("./PFASDatasetPanel"), {
  ssr: false,
});

type Props = {
  dataset: SearchResults | null;
  dsSource: USDatasetSource;
};

function DatasetPanel({ dataset, dsSource }: Props) {
  const searchResultPanel = function (dsType: USDatasetSource) {
    switch (dsType) {
      case "PFAS":
        return (
          <PFASDatasetPanel
            dataset={dataset as LaserficheSearchResult}
            pages={(dataset as LaserficheSearchResult).nodes}
          />
        );
      case "NC_DEQ_WATERSUPPLY":
        return <NCDEQWSDatasetPanel dataset={dataset as NCDEQWSSearchResult} />;
      case "USGS_WATER":
        return (
          <USGSWaterDatasetPane dataset={dataset as USGSWaterSearchResult} />
        );
      default:
        return (
          <SearchResultDatasetPanel dsMetadata={dataset as SearchResult} />
        );
    }
  };
  return <>{searchResultPanel(dsSource)}</>;
}

export default DatasetPanel;
