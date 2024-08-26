"use client";
import React, { useEffect, useState } from "react";
import "react-sliding-pane/dist/react-sliding-pane.css";
import SearchButton, {
  search,
  USDatasetSource,
} from "@/components/index/SearchButton";
import SlidingPane from "react-sliding-pane";
import { Spinner } from "flowbite-react";
import { logTableInteraction } from "@/utils/supabaseLogger";
import DatasourceSelect from "@/components/index/DatasourceSelect";
import {
  LaserficheSearchResult,
  PFASSearchResult,
  SearchResult,
  USGSWaterSearchResult,
} from "./search";
import SearchResultViewer from "@/components/index/SearchResult/SearchResultViewer";
import DateRangeSelector from "@/components/index/DateRangeSelector";
import OpenLinkButton from "@/components/index/RequestDataButton";
import DatasetPanel from "@/components/index/DatasetPane/DatasetPanel";
import logo from "../public/logo.jpeg";
import { NCDEQWSSearchResult } from "./NCDEQWSSearch";
import Image from "next/image";
import LocationSearchBar, { LaserficheLocationBar } from "@/components/index/LocationSearchBar";
import { useSearchParams } from "next/navigation";
import { useStateContext } from "./StateContext";
import { pdfjs } from 'react-pdf';
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export type SearchResults =
  | SearchResult
  | PFASSearchResult
  | USGSWaterSearchResult
  | NCDEQWSSearchResult
  | LaserficheSearchResult;

function sourceSearchParamToDatasetSource(
  source: string | null
): USDatasetSource {
  if (source == null) {
    return "USGS_WATER";
  }
  switch (source.toLowerCase()) {
    case "usgs_water":
      return "USGS_WATER";
    case "pfas":
      return "PFAS";
    case "nc_deq_watersupply":
      return "NC_DEQ_WATERSUPPLY";
    default:
      return "USGS_WATER";
  }
}

export default function Home() {
  const searchParams = useSearchParams();
  const { state } = useStateContext();
  const [primaryData, setPrimary] = useState<SearchResults[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [openPanel, setOpenPanel] = useState(false);
  const [currentds, setCurrentds] = useState<SearchResults | null>();
  const [dsSource, setDsSource] = useState<USDatasetSource>(
    sourceSearchParamToDatasetSource(searchParams.get("source"))
  );

  function setDatasetSelected(ds: SearchResults) {
    setCurrentds(ds);
    setOpenPanel(true);
  }

  const now = new Date().toISOString();
  const sevenDaysAgo = new Date(
    Date.now() - 7 * 24 * 60 * 60 * 1000
  ).toISOString();

  const [startDate, setStartDate] = useState<string>(sevenDaysAgo);
  const [endDate, setEndDate] = useState<string>(now);

  useEffect(() => {
    async function performSearch() {
      const loc = {
        display_name: searchParams.get("loc")!,
        name: searchParams.get("loc")!,
        lat: 0.0,
        lon: 0.0,
        addresstype: "city",
      };
      return await search(state.searchValue, loc, dsSource, startDate, endDate);
    }
    async function fetchData() {
      if (state.searchValue != null && searchParams.get("loc") != null) {
        let result = await performSearch();
        setPrimary(result);
        if (searchParams.get("id") != null) {
          let ds = result?.filter((r) => r.id == searchParams.get("id"));
          if (ds != undefined && ds.length > 0) {
            setCurrentds(ds[0]);
            setOpenPanel(true);
          }
        }
      }
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]); // DO NOT MODIFY

  return (
    <div className="grid grid-cols-6 h-[100vh]">
      <div className="col-span-1 white prose flex flex-col h-full border-r border-gray-300">
        <div className="p-2">
          <Image
            src={logo.src}
            alt="Spacious AI"
            width="200"
            height="100"
            className="object-contain w-full mt-5"
          />
        </div>
        <div className="p-2 pb-4">
          <h4>Specify Data Source</h4>
          <DatasourceSelect dataSource={dsSource} setDataSource={setDsSource} />
        </div>
        <div className="p-2 border-t ">
          <h4 className="mt-1">Set Location</h4>
          {dsSource == 'PFAS' ? <LaserficheLocationBar /> : <LocationSearchBar />}
        </div>
        {dsSource == "USGS_WATER" && (
          <div className="p-2">
            <h4>Select Date Range</h4>
            <DateRangeSelector
              startDate={startDate}
              setStartDate={setStartDate}
              endDate={endDate}
              setEndDate={setEndDate}
            />
          </div>
        )}
      </div>
      <div className="col-span-5 flex h-[100vh] relative">
        <div className="w-full bg-sky-50 overflow-auto p-2">
          <SearchButton
            setPrimaryData={setPrimary}
            dsSource={dsSource}
            setLoading={setLoading}
            startTime={startDate}
            endTime={endDate}
          />
          {loading ? (
            <div className="ml-20 mt-20">
              <Spinner />
            </div>
          ) : primaryData != null && primaryData.length > 0 ? (
            <SearchResultViewer
              primaryData={primaryData}
              dsSource={dsSource}
              setDatasetSelected={setDatasetSelected}
              startTime={startDate}
              endTime={endDate}
            />
          ) : (
            primaryData != null && (
              <>
                <div className="absolute right-0 left-0 bottom-0 w-full bg-white py-4 flex justify-center items-center gap-4 border">
                  <span>Not seeing the data you&apos;re looking for?</span>
                  <OpenLinkButton />
                </div>
              </>
            )
          )}
        </div>
      </div>
      {currentds != null && (
        <SlidingPane
          isOpen={openPanel}
          width="70%"
          onRequestClose={() => {
            setOpenPanel(false);
            if (process.env.NODE_ENV === "production") {
              logTableInteraction("CloseDatasetPanel", 0, currentds.id);
            }
          }}
        >
          <div>
            <DatasetPanel dataset={currentds} dsSource={dsSource} />
          </div>
        </SlidingPane>
      )}
    </div>
  );
}
