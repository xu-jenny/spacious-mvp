"use client";

import { LaserfichePageResult, LaserficheSearchResult } from "@/app/search/search";
import { logTableInteraction } from "@/utils/supabaseLogger";
import { Card } from "flowbite-react";

type Props = {
  dataset: LaserficheSearchResult;
  index: number;
  setSelectedDataset: (x: LaserficheSearchResult) => void;
};

function LaserficheSearchResultCard({ dataset, index, setSelectedDataset }: Props) {
  const logLinkClick = (data: LaserficheSearchResult, index: number) => {
    logTableInteraction("LinkClick", index, data.title.toString());
    setSelectedDataset(data);
  };
  const longStringShortener = (str: string) =>
    str != null && str.length > 300 ? `${str.substring(0, 300)}...` : str;

  const showNodes = (nodes: LaserfichePageResult[]) => {
    return <p>We found {nodes.length} potential matches in this document</p>;
  };

  return (
    <Card className="p-3 mt-3" onClick={() => logLinkClick(dataset, index)}>
      <h6
        style={{ cursor: "pointer" }}
        className="text-xl font-bold tracking-tight text-gray-900 dark:text-white"
      >
        {dataset.title}
      </h6>
      {dataset.nodes != null &&
        "nodes" in dataset &&
        dataset["nodes"].length > 0 &&
        showNodes(dataset?.nodes)}
    </Card>
  );
}

export default LaserficheSearchResultCard;
