"use client";

import Link from "next/link";
import { NCDEQWSSearchResult } from "@/app/NCDEQWSSearch";
import { useStateContext } from "@/app/StateContext";

type Props = {
    dataset: NCDEQWSSearchResult;
};

const NCDEQWSDatasetPanel = ({ dataset }: Props) => {
    const bucketUrl = process.env.NEXT_PUBLIC_S3_NC_WATERSUPPLY_URL;
    const { state } = useStateContext();
    const copySharableLink = async () => {
        if ('clipboard' in navigator) {
          try {
            await navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_DOMAIN}/?loc=${state.location?.name}&q=${state.searchValue}&source=nc_deq_watersupply&id=${dataset.id}`);
          } catch (err) {
            console.error('Failed to copy text: ', err);
          }
        } else {
          document.execCommand('copy', true, `${process.env.NEXT_PUBLIC_DOMAIN}/?loc=${state.location?.name}&q=${state.searchValue}&source=nc_deq_watersupply&id=${dataset.id}`);
        }
      };

    return (
        <div className="flex h-[100vh]">
            <div className="w-full flex flex-col h-full">
                <article className="prose p-4 max-w-none">
                    <h3>{dataset.location} - {dataset?.title}</h3>
                    <div className="flex gap-4">
                        {dataset.id != null && dataset.csv_filename && (
                            <Link
                                href={`${bucketUrl}/${dataset.csv_filename.replace(' ', '+').replace(',', '%2C')}`}
                                target="_blank"
                                download={dataset?.title}
                                className="no-underline text-green-500"
                            >
                                Download CSV
                            </Link>
                        )}
                        <Link
                            href={dataset.originalUrl}
                            target="_blank"
                            className="no-underline text-blue-600">
                            Original Link
                        </Link>
                        <button onClick={copySharableLink}>Copy Sharable Link</button>
                    </div>
                    <p>Summary: {dataset?.summary}</p>
                    {/* <p>Years Available: {dataset?.time_period}</p> */}
                    <p className="p-2">CSV Sample</p>
                    <pre className="p-2">{dataset?.sample}</pre>
                </article>
            </div>
        </div>
    );
};
export default NCDEQWSDatasetPanel;
