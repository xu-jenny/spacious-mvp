"use client";

import { USGSWaterSearchResult } from "@/app/search";
import { post } from "@/utils/http";
import Link from "next/link";

type Props = {
  dataset: USGSWaterSearchResult;
};

const USGSWaterDatasetPane = ({ dataset }: Props) => {
  console.log(dataset);
  const downloadCSV = async () => {
    const now = new Date().toISOString();
    const sevenDaysAgo = new Date(
      Date.now() - 7 * 24 * 60 * 60 * 1000
    ).toISOString();
    const response = await post(
      `${process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL}/usgs_water_csv`,
      {
        siteId: dataset.siteId,
        parameterCode: "00045", //dataset.matchingParamCode,
        startTime: sevenDaysAgo,
        endTime: now,
      }
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
  return (
    <div className="flex h-[100vh]">
      <div className="w-full flex flex-col h-full">
        <article className="prose p-4 max-w-none">
          <h3>{dataset.title}</h3>
          <div className="flex gap-4">
            <Link
              href={`https://dashboard.waterdata.usgs.gov/api/gwis/2.1.1/service/site?agencyCode=USGS&siteNumber=${dataset.id.substring(
                5
              )}&open=53764`}
              target="_blank"
              className="no-underline text-blue-600"
            >
              Original Link
            </Link>
            <button onClick={downloadCSV}>Download CSV</button>
          </div>
          <p>Summary: {dataset?.summary}</p>
          {/* <p>Years Available: {dataset?.time_period}</p> */}
          {/* <p className="p-2">CSV Sample</p>
                    <pre className="p-2">{dataset?.sample}</pre> */}
        </article>
      </div>
    </div>
  );
};
export default USGSWaterDatasetPane;
