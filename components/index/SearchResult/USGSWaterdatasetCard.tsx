"use client";

import { Badge, Button, Card } from "flowbite-react";
import { logTableInteraction } from "@/utils/supabaseLogger";
import {
	USGSWaterSearchResult,
} from "@/app/search";
type Props = {
	dataset: USGSWaterSearchResult;
	index: number;
};
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
	Label,
} from "recharts";
import Link from "next/link";
import moment from "moment";

const DataChart = ({
	data,
	unit
}: {
	data: {
		datetime: string;
		value: number;
	}[];
	unit: string
}) => {
	return (
		<ResponsiveContainer width="100%" height={400}>
			<LineChart
				data={data}
				margin={{
					top: 20,
					right: 30,
					left: 20,
					bottom: 5,
				}}
			>
				<CartesianGrid strokeDasharray="3 3" />
				<XAxis dataKey="datetime" tickFormatter={(tick) => moment(tick).format('YYYY-MM-DD')} />
				<YAxis dataKey={"value"}>
				</YAxis>
				<Tooltip />
				<Legend payload={[{value: unit, type:"line", color: '#8884d8'}]} />
				<Line type="monotone" dataKey="value" stroke="#8884d8" />
			</LineChart>
		</ResponsiveContainer>
	);
};

type DownloadButtonProps = {
	url: string;
	filename: string;
};

const DownloadButton: React.FC<DownloadButtonProps> = ({ url, filename }) => {
	const handleDownload = () => {
		const link = document.createElement("a");
		link.href = url;
		link.download = filename;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	return <Button className="w-fit" onClick={handleDownload}>Download CSV</Button>;
};

function USGSWaterDatasetCard({ dataset, index }: Props) {
	const logLinkClick = (data: USGSWaterSearchResult, index: number) => {
		logTableInteraction("LinkClick", index, data.title.toString());
	};

	const longStringShortener = (str: string) =>
		str != null && str.length > 300 ? `${str.substring(0, 300)}...` : str;

	return (
		<Card className="mt-3">
			<div className="flex justify-between">
				<h6
					style={{ cursor: "pointer" }}
					onClick={() => logLinkClick(dataset, index)}
					className="text-xl font-bold tracking-tight text-gray-900 dark:text-white"
				>
					<Link href={`https://dashboard.waterdata.usgs.gov/api/gwis/2.1.1/service/site?agencyCode=USGS&siteNumber=${dataset.id.substring(5)}&open=53764`} rel="noopener noreferrer" target="_blank">{dataset.title}</Link>
				</h6>
				<span>{index == 0 && <Badge color="info">Closest Station</Badge>}{dataset.distanceFromInput} mi </span>
			</div>
					{dataset.csv_dl_link != null && (
				<DownloadButton url={dataset.csv_dl_link} filename={"result.csv"} />
			)}
			<p className="font-normal text-gray-700 dark:text-gray-400">
				{longStringShortener(dataset.summary)}
			</p>

				{dataset.sample_df != null && <DataChart data={dataset.sample_df} unit={dataset.unit ?? "value"} />}
		</Card>
	);
}

export default USGSWaterDatasetCard;
