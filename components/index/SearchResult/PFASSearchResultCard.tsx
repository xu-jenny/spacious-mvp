"use client";

import { PFASNodeResult, PFASSearchResult } from "@/app/search/search";
import { logTableInteraction } from "@/utils/supabaseLogger";
import { Card } from "flowbite-react";

type Props = {
  dataset: PFASSearchResult;
  index: number;
  setSelectedDataset: (x: PFASSearchResult) => void;
};

function PFASSearchResultCard({ dataset, index, setSelectedDataset }: Props) {
  const logLinkClick = (data: PFASSearchResult, index: number) => {
    logTableInteraction("LinkClick", index, data.title.toString());
    setSelectedDataset(data);
  };
  const longStringShortener = (str: string) =>
    str != null && str.length > 300 ? `${str.substring(0, 300)}...` : str;

  const showNodes = (nodes: PFASNodeResult[]) => {
    return <p>We found {nodes.length} matches in this document</p>;
  };

  return (
    <Card className="p-3 mt-3" onClick={() => logLinkClick(dataset, index)}>
      <h6
        style={{ cursor: "pointer" }}
        className="text-xl font-bold tracking-tight text-gray-900 dark:text-white"
      >
        {dataset.title}
      </h6>
      {dataset.summary != null && (
        <p className="font-normal text-gray-700 dark:text-gray-400">
          {longStringShortener(dataset.summary)}
        </p>
      )}
      {dataset.publisher != null && (
        <div className="flex align-middle items-center gap-2">
          {dataset?.publisher != null &&
            dataset?.publisher.length > 1 &&
            `${dataset?.publisher} | `}
        </div>
      )}
      {dataset.nodes != null &&
        "nodes" in dataset &&
        dataset["nodes"].length > 0 &&
        showNodes(dataset.nodes)}
    </Card>
  );
}

export default PFASSearchResultCard;
