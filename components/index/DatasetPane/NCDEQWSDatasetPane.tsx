"use client";

import Link from "next/link";
import { NCDEQWSSearchResult } from "@/app/NCDEQWSSearch";

type Props = {
    dataset: NCDEQWSSearchResult;
};

const NCDEQWSDatasetPanel = ({ dataset }: Props) => {
    return (
        <div className="flex h-[100vh]">
            <div className="w-full flex flex-col h-full">
                <article className="prose p-4 max-w-none">
                    <h3>{dataset.location} - {dataset?.title}</h3>
                    <div className="flex gap-4">
                        {dataset.id != null && (
                            <Link
                                href={"/sample.csv"}
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
