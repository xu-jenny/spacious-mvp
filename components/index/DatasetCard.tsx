"use client";

import { Badge, Card } from "flowbite-react";
import { logTableInteraction } from "@/utils/supabaseLogger";
import { SearchResult } from "@/app/search";
type Props = {
  dataset: SearchResult;
  index: number;
  setSelectedDataset: (x: SearchResult) => void;
};

function DatasetCard({ dataset, index, setSelectedDataset }: Props) {
  const logLinkClick = (data: SearchResult, index: number) => {
    logTableInteraction("LinkClick", index, data.title.toString());
    setSelectedDataset(data);
  };

  const longStringShortener = (str: string) =>
    str != null && str.length > 300 ? `${str.substring(0, 300)}...` : str;

  const showSubtags = (tags: string[]) => {
    if (tags != null && tags.length > 1) {
      tags = tags.filter((x: string) => x.length < 30).slice(0, 5);
      return tags.map((tag: string, i: number) => (
        <span key={tag} className="text-gray-500">
          {tag}
          {i != tags.length - 1 && ", "}{" "}
        </span>
      ));
    }
  };

  const showLocation = (dataset: SearchResult) => {
    if (dataset.dataset_source !== "LASERFICHE"){
      return dataset.location
    }
    return dataset.location.substring(0, dataset.location.indexOf("|"))
  }
  
  return (
    <Card className="mt-3">
      <h6
        style={{ cursor: "pointer" }}
        // href={"/dataset/" + dataset.id}
        onClick={() => logLinkClick(dataset, index)}
        className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
        {dataset.title}
      </h6>
      <p className="font-normal text-gray-700 dark:text-gray-400">
        {longStringShortener(dataset.summary)}
      </p>
      <div className="flex align-middle items-center gap-2">
        {dataset?.publisher != null && dataset?.publisher.length > 1 && `${dataset?.publisher} | `}{showLocation(dataset)}
        <Badge className="w-fit mt-1">{dataset.topic}</Badge>
      </div>
      <div>
        {"subtags" in dataset &&
          dataset["subtags"] != null &&
          showSubtags(dataset?.subtags)}
      </div>
    </Card>
  );
}

export default DatasetCard;
