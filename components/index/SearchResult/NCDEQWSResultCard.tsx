"use client";

import { Card } from "flowbite-react";
import { logTableInteraction } from "@/utils/supabaseLogger";
import { NCDEQWSSearchResult } from "@/app/search/NCDEQWSSearch";

type Props = {
  dataset: NCDEQWSSearchResult;
  setDatasetSelected: (dataset: NCDEQWSSearchResult) => void;
  index: number;
};

function NCDEQWSResultCard({ dataset, setDatasetSelected, index }: Props) {
  const logLinkClick = (data: NCDEQWSSearchResult, index: number) => {
    logTableInteraction("LinkClick", index, data.title.toString());
    setDatasetSelected(data);
  };

  return (
    <Card className="mt-3 p-4" onClick={() => logLinkClick(dataset, index)}>
      <div className="flex flex-col gap-2">
        <h6
          style={{ cursor: "pointer" }}
          className="text-xl font-bold tracking-tight text-gray-900 dark:text-white"
        >
          {dataset.location} - {dataset.title}
        </h6>
        <p className="font-normal text-gray-700 dark:text-gray-400">
          {dataset.summary}
        </p>
      </div>
    </Card>
  );
}

export default NCDEQWSResultCard;
