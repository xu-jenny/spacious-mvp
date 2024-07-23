"use client";

import { Badge, Card } from "flowbite-react";
import { logTableInteraction } from "@/utils/supabaseLogger";
import { PFASNodeResult, PFASSearchResult, SearchResult } from "@/app/search";

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
		<Card className="mt-3" onClick={() => logLinkClick(dataset, index)}>
			<h6
				style={{ cursor: "pointer" }}
				className="text-xl font-bold tracking-tight text-gray-900 dark:text-white"
			>
				{dataset.title}
			</h6>
			<p className="font-normal text-gray-700 dark:text-gray-400">
				{longStringShortener(dataset.summary)}
			</p>
			<div className="flex align-middle items-center gap-2">
				{dataset?.publisher != null &&
					dataset?.publisher.length > 1 &&
					`${dataset?.publisher} | `}
			</div>
			<div>
				{"nodes" in dataset &&
					dataset["nodes"].length > 0 &&
					showNodes(dataset.nodes)}
			</div>
			</Card>
	);
}

export default PFASSearchResultCard;
