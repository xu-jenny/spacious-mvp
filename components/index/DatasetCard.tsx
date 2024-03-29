"use client";

import { Badge, Card } from "flowbite-react";
import { DatasetMetadata } from "../MetadataTable";
import { logTableInteraction } from "@/utils/supabaseLogger";
import { jsonParse } from "@/utils/json";
type Props = {
  dataset: DatasetMetadata;
  index: number;
  setSelectedDataset: (x: DatasetMetadata) => void;
};

function DatasetCard({ dataset, index, setSelectedDataset }: Props) {
  const logLinkClick = (data: DatasetMetadata, index: number) => {
    logTableInteraction("LinkClick", index, data.title.toString());
    setSelectedDataset(dataset);
    console.log("dataset clicked", dataset);
  };

  const longStringShortener = (str: string) =>
    str != null && str.length > 300 ? `${str.substring(0, 300)}...` : str;

  const showSubtags = (subtagStr: string) => {
    let tags = jsonParse(subtagStr);
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
  const showPublisher = (pubStr: string) => {
    try {
      const publisher = jsonParse(pubStr);
      if ("contact" in publisher && publisher.contact != null) {
        return (
          <a
            href={"mailto:" + publisher.contact}
            className="font text-blue-500">
            {publisher.name} |{" "}
          </a>
        );
      } else if ("name" in publisher && publisher.name != null) {
        return <span>{publisher.name} | </span>;
      } else {
        return <span>{publisher} | </span>;
      }
    } catch (e) {
      // console.error("Error parsing publlisher for dataset: ", dataset?.id);
      return <span>{pubStr} | </span>;
    }
  };
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
        {/* {dataset?.publisher != null && showPublisher(dataset?.publisher)} */}
        {dataset.location}
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
