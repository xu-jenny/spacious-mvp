"use client";

import { JSX, SetStateAction, useEffect, useState } from "react";
import { jsonParse } from "@/utils/json";
import { InfoDropdown } from "../dataset/InfoDropdown";
import Link from "next/link";
import { logTableInteraction } from "@/utils/supabaseLogger";
import { PFASNodeResult, PFASSearchResult, SearchResult } from "@/app/search";
import { Dataset, getDataset } from "@/clients/supabase";
import { USDatasetSource } from "./EditTagButton";

type Props = {
  dsMetadata: SearchResult | PFASSearchResult;
  openModal: boolean | undefined;
  setOpenModal: (value: SetStateAction<boolean>) => void;
  dsSource: USDatasetSource;
};

export const openInNewTab = (url: string): void => {
  const newWindow = window.open(url, "_blank", "noopener,noreferrer");
  if (newWindow) newWindow.opener = null;
};

const DatasetPanel = ({
  dsMetadata,
  dsSource,
  openModal,
  setOpenModal,
}: Props) => {
  let [dataset, setDataset] = useState<Dataset | PFASSearchResult | null>(null);
  let [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const id = dsMetadata.id;

  useEffect(() => {
    async function fetchDataset() {
      let result = await getDataset(dsMetadata as SearchResult);
      if (result == null) {
        setError("There was no dataset corresponding to the specified ID.");
      } else {
        setDataset(result);
        console.log(result);
      }
    }
    if (dsSource != "PFAS") {
      fetchDataset();
    } else {
      console.log(dsMetadata);
      setDataset(dsMetadata as PFASSearchResult);
    }
  }, [dsMetadata, dsSource]);

  const showPublisher = (pubStr: string) => {
    try {
      const publisher = jsonParse(pubStr);
      if ("contact" in publisher && publisher.contact != null) {
        return (
          <a href={publisher.contact} className="font">
            {publisher.name}
          </a>
        );
      } else if ("name" in publisher && publisher.name != null) {
        return <span>{publisher.name}</span>;
      } else {
        return <span>{publisher}</span>;
      }
    } catch (e) {
      console.error("Error parsing publlisher for dataset: ", id);
      return <span>{pubStr}</span>;
    }
  };

  const showDatasetUrls = () => {
    try {
      const datasetUrls =
        dataset != null && (dataset as Dataset)?.datasetUrl != null
          ? jsonParse((dataset as Dataset)?.datasetUrl ?? "")
          : [];
      if (datasetUrls == null || datasetUrls.length == 0) {
        return null;
      }
      if (Array.isArray(datasetUrls)) {
        return datasetUrls.map((obj, index) => (
          <span key={obj["url"]}>
            <a
              href={obj["url"]}
              className="text-blue-600 dark:text-blue-500 hover:underline"
            >
              {obj["name"]}
            </a>
            {index != datasetUrls.length - 1 && " | "}
          </span>
        ));
      } else {
        return (
          <span>
            Dataset Download Links:
            <a
              href={datasetUrls["url"]}
              className="text-blue-600 dark:text-blue-500 hover:underline"
              onClick={() => {
                if (process.env.NODE_ENV === "production") {
                  logTableInteraction(
                    "DownloadUrlClick",
                    id,
                    datasetUrls["url"]
                  );
                }
              }}
            >
              {datasetUrls["name"]}
            </a>
          </span>
        );
      }
    } catch (e) {
      console.error("Error parsing datasetUrl for dataset: ", id);
      return (
        <span>Dataset Download Links: {(dataset as Dataset)?.datasetUrl}</span>
      );
    }
  };

  const showLocation = (location: string) => {
    if (dsSource !== "NC DEQ") {
      return location;
    }
    return location.substring(location.indexOf("|") + 1);
  };

  const showNodes = (nodes: PFASNodeResult[]) => {
    let textNodes: JSX.Element[] = [];
    let tableNodes: JSX.Element[] = [];
    nodes.forEach((node: PFASNodeResult) => {
      if (node.node_type == "text") {
        console.log(node.content);
        textNodes.push(
          <>
            <p>Text Match {textNodes.length + 1}:</p>
            <p>{node.content}</p>
          </>
        );
      } else if (node.node_type == "table") {
        tableNodes.push(
          <>
            <p>Table Match {tableNodes.length + 1}</p>
            <pre>{node.content}</pre>
          </>
        );
      }
    });
    return [...textNodes, ...tableNodes];
  };

  return (
    <div className="flex h-[100vh]">
      <div className="w-full flex flex-col h-full">
        <article className="prose p-4 max-w-none">
          <h3>{dataset?.title}</h3>
          {dataset != null && (
            <Link
              href={dataset?.originalUrl}
              target="_blank"
              className="no-underline text-blue-600"
              onClick={() => {
                if (process.env.NODE_ENV === "production") {
                  logTableInteraction("OriginalUrlClick", id, dataset?.title);
                }
              }}
            >
              Original Dataset Link
            </Link>
          )}
          <p>Summary: {dataset?.summary}</p>
          {dsSource != "PFAS" && (
            <p>
              Location: {showLocation((dataset as Dataset)?.location ?? "")}
            </p>
          )}
          {dataset?.lastUpdated != null && (
            <p>Last updated: {dataset?.lastUpdated}</p>
          )}
          {/* {dataset?.publisher != null && (
            <p>
              Publisher:{" "}
              {dataset?.publisher != null && showPublisher(dataset?.publisher)}
            </p>
          )} */}
          {dsSource != "PFAS" && (
            <>
              <p>Topic: {(dataset as Dataset)?.topic}</p>
              {(dataset as Dataset)?.length != null && (
                <p>Report Length: {(dataset as Dataset)?.length} </p>
              )}
              <div>{showDatasetUrls()}</div>
              {(dataset as Dataset)?.csv_url != null &&
                (dataset as Dataset)["df.head"] != null && (
                  <>
                    <hr className="my-5 border-double" />
                    <h3>First 5 rows of dataset</h3>
                    <pre>
                      {dataset != null && (dataset as Dataset)["df.head"]}
                    </pre>
                    <hr className="w-3/4 h-0.5 mx-auto my-4 bg-gray-100 border-0 rounded md:my-10 dark:bg-gray-700" />
                    <InfoDropdown dataset={dataset as Dataset} />
                  </>
                )}
            </>
          )}
          {dsSource == "PFAS" &&
            dataset != null &&
            "nodes" in dataset &&
            showNodes((dataset as PFASSearchResult).nodes)}
        </article>
        {/* <DynamicTable data={JSON.parse(dataset.metadata)} /> */}
      </div>
    </div>
  );
};
export default DatasetPanel;
