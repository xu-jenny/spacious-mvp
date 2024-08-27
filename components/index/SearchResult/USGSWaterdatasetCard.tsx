"use client";

import { Badge, Tooltip as FlowTooltip, Card } from "flowbite-react";
import { logTableInteraction } from "@/utils/supabaseLogger";
import { USGSWaterSearchResult } from "@/app/search";

import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Legend,
	ResponsiveContainer,
	Tooltip,
	Label,
} from "recharts";
import { MdKeyboardArrowRight, MdOutlineFileDownload } from "react-icons/md";
import { CiShare1 } from "react-icons/ci";
import { FcCollapse, FcExpand } from "react-icons/fc";
import moment from "moment";
import Link from "next/link";
import { useState } from "react";

const DataChart = ({
	data,
	unit,
}: {
	data: {
		datetime: string;
		value: number;
	}[];
	unit: string;
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
				<XAxis
					dataKey="datetime"
					tickFormatter={(tick) => moment(tick).format("YYYY-MM-DD")}
				/>
				<YAxis dataKey={"value"}></YAxis>
				<Tooltip />
				<Legend payload={[{ value: unit, type: "line", color: "#8884d8" }]} />
				<Line type="monotone" dataKey="value" stroke="#8884d8" />
			</LineChart>
		</ResponsiveContainer>
	);
};

type Props = {
	dataset: USGSWaterSearchResult;
	index: number;
	setDatasetSelected: (dataset: USGSWaterSearchResult) => void;
	startTime: string;
	endTime: string;
};

function USGSWaterDatasetCard({
	dataset,
	index,
	setDatasetSelected,
	startTime,
	endTime,
}: Props) {
	const [chart, setChart] = useState(dataset.sample_df ?? []);
	const [expanded, setExpanded] = useState(chart.length > 0 ? true : false)
	const logLinkClick = (data: USGSWaterSearchResult, index: number) => {
		logTableInteraction("LinkClick", index, data.title.toString());
		// setDatasetSelected(data);
	};

	const longStringShortener = (str: string) =>
		str != null && str.length > 300 ? `${str.substring(0, 300)}...` : str;

	const handleDownload = async (isDailySum = false) => {
		const endpoint = isDailySum ? "usgs_water_dailysum_csv" : "usgs_water_csv"
		const response = await fetch(
			`${process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL}/${endpoint}/?siteId=${dataset.siteId}&paramCode=${dataset.matchingParamCode[1]}&startTime=${startTime}&endTime=${endTime}`
		);
		const blob = await response.blob();
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "data.csv";
		document.body.appendChild(a);
		a.click();
		a.remove();
		window.URL.revokeObjectURL(url);
	};

	const toggleSample = async () => {
		if (expanded == false && chart.length == 0) {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL}/usgs_water_detail/?siteId=${dataset.siteId}&paramCode=${dataset.matchingParamCode[1]}&startTime=${startTime}&endTime=${endTime}`
			).then((resp) => resp.json());
			setChart(response.data)
			console.log(response.data)
		}
		setExpanded(!expanded)
	}

	return (
		<Card className="mt-3">
			<div className="flex justify-between">
				<div className="flex items-center">
					<h6
						style={{ cursor: "pointer" }}
						// onClick={() => logLinkClick(dataset, index)}
						onClick={() => toggleSample()}
						className="text-xl font-bold tracking-tight text-gray-900 dark:text-white"
					>
						{dataset.title}
					</h6>
					<FlowTooltip content={`Visit USGS url`}>
						<Link href={`https://dashboard.waterdata.usgs.gov/api/gwis/2.1.1/service/site?agencyCode=USGS&siteNumber=${dataset.id.substring(5)}&open=53764`} rel="noopener noreferrer" target="_blank">
							<CiShare1 size={24} className="cursor-pointer mx-2" />
						</Link>
					</FlowTooltip>
					<FlowTooltip content={`Download CSV for ${dataset.matchingParamCode[0]}`}>
						<MdOutlineFileDownload
							onClick={() => handleDownload(false)}
							className="text-emerald-400 cursor-pointer mx-1"
							size={30}
						/>
					</FlowTooltip>
					<FlowTooltip content={`Download Daily Sums CSV for ${dataset.matchingParamCode[0]}`}>
						<MdOutlineFileDownload
							color="blue"
							onClick={() => handleDownload(true)}
							className="text-emerald-400 cursor-pointer mx-1"
							size={30}
						/>
					</FlowTooltip>
				</div>
				<span>
					{index == 0 && <Badge color="info">Closest Station</Badge>}
					{dataset.distanceFromInput} mi{" "}
				</span>
			</div>
			<p className="font-normal text-gray-700 dark:text-gray-400 cursor-pointer" onClick={() => toggleSample()}>
				{expanded ? (
					<>
						<span>{dataset.summary}</span>
						<FcExpand onClick={() => toggleSample()} className="inline-flex ml-2 text-gray-500" size={20} />
					</>
				) : (
					<>
						<span>{longStringShortener(dataset.summary)}</span>
						<FcCollapse onClick={() => toggleSample()} className="inline-flex ml-2 text-gray-500" size={20} />
					</>
				)}
				{expanded && <DataChart data={chart} unit={dataset.unit ?? "value"} />}
			</p>
		</Card>
	);
}

export default USGSWaterDatasetCard;
