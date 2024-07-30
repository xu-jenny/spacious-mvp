"use client";
import React, { useState } from "react";
import "react-sliding-pane/dist/react-sliding-pane.css";
import SearchButton, { USDatasetSource } from "@/components/index/SearchButton";
import SlidingPane from "react-sliding-pane";
import { Spinner } from "flowbite-react";
import { logTableInteraction } from "@/utils/supabaseLogger";
import DatasourceSelect from "@/components/index/DatasourceSelect";
import {
  PFASSearchResult,
  SearchResult,
  USGSWaterSearchResult,
} from "./search";
import DebouncedInput from "@/components/common/DebouncedInput";
import SearchResultViewer from "@/components/index/SearchResult/SearchResultViewer";
import DateRangeSelector from "@/components/index/DateRangeSelector";
import GoogleSearchBar from "@/components/index/GoogleSearchBar";

export type SearchResults =
  | SearchResult
  | PFASSearchResult
  | USGSWaterSearchResult
  | NCDEQWSSearchResult;
import OpenLinkButton from "@/components/index/RequestDataButton";
import DatasetPanel from "@/components/index/DatasetPane/DatasetPanel";
import logo from "../public/logo.jpeg";
import { NCDEQWSSearchResult } from "./NCDEQWSSearch";
import Image from "next/image";

export default function Home() {
  const [primaryData, setPrimary] = useState<SearchResults[] | null>(null);
  const [interestedLocations, setLocations] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [openPanel, setOpenPanel] = useState(false);
  const [currentds, setCurrentds] = useState<SearchResults | null>(null);
  const [dsSource, setDsSource] = useState<USDatasetSource>("USGS_WATER");

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
        <div className="p-2 border-t ">
          <h4 className="mt-1">Set Location</h4>
          {/* <DebouncedInput
            placeholder="City/State/Lat,Lng"
            onChange={setLocations}
          /> */}
          {/* <PeliasAutocomplete
            placeholder="City/State/Lat,Lng"
            onChange={setLocations}
          />*/}
          <GoogleSearchBar
            placeholder="Enter a location"
            value={interestedLocations}
            onChange={setLocations}
          />
        </div>
        <div className="p-2">
          <h4>Specify Data Source</h4>
          <DatasourceSelect dataSource={dsSource} setDataSource={setDsSource} />
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
        <div className="p-2 mt-auto">
          <OpenLinkButton />
        </div>
      </div>
      <div className="col-span-5 flex h-[100vh]">
        <div className="w-full bg-sky-50 overflow-auto p-2">
          <SearchButton
            location={interestedLocations}
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
              location={interestedLocations}
            />
          ) : (
            primaryData != null && (
              <p>
                There are no results matching your search, try removing some
                filters or request data through the bottom banner
              </p>
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
