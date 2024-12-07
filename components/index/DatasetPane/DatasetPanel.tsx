"use client";

import { USDatasetSource } from "../SearchButton";
import { NCDEQWSSearchResult } from "@/app/search/NCDEQWSSearch";
import NCDEQWSDatasetPanel from "./NCDEQWSDatasetPane";

import dynamic from "next/dynamic";
import USGSWaterDatasetPane from "./USGSWaterDatasetPane";
import {
  LaserficheSearchResult,
  USGSWaterSearchResult,
  GenericSearchResult,
} from "@/app/search/search";
import { SearchResults } from "@/app/app/page";
import { useStateContext } from "@/app/StateContext";

const PFASDatasetPanel = dynamic(() => import("./PFASDatasetPanel"), {
  ssr: false,
});

type Props = {
  dataset: SearchResults | null;
};

function DatasetPanel({ dataset }: Props) {
  const { state } = useStateContext();
  const searchResultPanel = function (dsType: USDatasetSource) {
    switch (dsType) {
      case "PFAS":
        return <PFASDatasetPanel dataset={dataset as LaserficheSearchResult} />;
      case "NC_DEQ_WATERSUPPLY":
        return <NCDEQWSDatasetPanel dataset={dataset as NCDEQWSSearchResult} />;
      case "USGS_WATER":
        return (
          <USGSWaterDatasetPane dataset={dataset as USGSWaterSearchResult} />
        );
    }
  };
  return <>{searchResultPanel(state.dataSource)}</>;
}

export default DatasetPanel;
