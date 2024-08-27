"use client";

import Link from "next/link";
import { NCDEQWSSearchResult } from "@/app/NCDEQWSSearch";
import { useStateContext } from "@/app/StateContext";
import { MdOutlineFileDownload, MdContentCopy } from "react-icons/md";
import { CiShare1 } from "react-icons/ci";

type Props = {
  dataset: NCDEQWSSearchResult;
};

const NCDEQWSDatasetPanel = ({ dataset }: Props) => {
  const bucketUrl = process.env.NEXT_PUBLIC_S3_NC_WATERSUPPLY_URL;
  const { state } = useStateContext();

  const copySharableLink = async () => {
    const link = `${process.env.NEXT_PUBLIC_DOMAIN}/?loc=${state.location?.name}&q=${state.searchValue}&source=nc_deq_watersupply&id=${dataset.id}`;
    if ("clipboard" in navigator) {
      try {
        await navigator.clipboard.writeText(link);
        alert("Link copied to clipboard!");
      } catch (err) {
        console.error("Failed to copy text: ", err);
      }
    } else {
      document.execCommand("copy", true, link);
    }
  };

  return (
    <div className="flex h-[100vh]">
      <div className="w-full flex flex-col h-full">
        <article className="prose p-4 max-w-none">
          <h3>
            {dataset.location} - {dataset?.title}
          </h3>
          <div className="flex gap-4">
            {dataset.id != null && dataset.csv_filename && (
              <Link
                href={`${bucketUrl}/${dataset.csv_filename
                  .replace(" ", "+")
                  .replace(",", "%2C")}`}
                target="_blank"
                download={dataset?.title}
                className="flex items-center text-green-500 hover:text-green-600"
              >
                <MdOutlineFileDownload className="mr-1" size={16} />
                Download CSV
              </Link>
            )}
            <Link
              href={dataset.originalUrl}
              target="_blank"
              className="flex items-center text-blue-600 hover:text-blue-700"
            >
              <CiShare1 className="mr-1" size={16} />
              Original Link
            </Link>
            <button
              onClick={copySharableLink}
              className="flex items-center text-gray-700 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <MdContentCopy className="mr-1" size={16} />
              Copy Sharable Link
            </button>
          </div>
          <p>Summary: {dataset?.summary}</p>
          <p className="p-2">CSV Sample</p>
          <pre className="p-2">{dataset?.sample}</pre>
        </article>
      </div>
    </div>
  );
};

export default NCDEQWSDatasetPanel;
