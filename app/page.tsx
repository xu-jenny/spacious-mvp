"use client";
import React, { useState } from "react";
import "react-sliding-pane/dist/react-sliding-pane.css";
import SearchButton, {
  USDatasetSource,
} from "@/components/index/SearchButton";
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

export type SearchResults =
  | SearchResult
  | PFASSearchResult
  | USGSWaterSearchResult
  | NCDEQWSSearchResult;
import OpenLinkButton from "@/components/index/RequestDataButton";
import DatasetPanel from "@/components/index/DatasetPane/DatasetPanel";
import logo from "../public/logo.jpeg";
import { NCDEQWSSearchResult } from "./NCDEQWSSearch";

const dummyData: NCDEQWSSearchResult[] = [{"id": "c4696eff-d719-4e5d-b013-0c2dc8233521", "dataType": "table", "title": "Water Use Information, Service Area", "originalUrl": "https://www.ncwater.org/WUDC/app/LWSP/report.php?pwsid=03-63-045&year=1997", "summary": "This csv contains Water Use Information, Service Area info for years 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010, 2009, 2008, 2007, 2002, 1997 in Moore County Public Utilities-Vass. It has columns ['Sub-Basin(s)', '% of Service Population', 'year']. Approx file size: 4 KB", "location": "Moore County Public Utilities-Vass", "time_period": "['2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016', '2015', '2014', '2013', '2012', '2011', '2010', '2009', '2008', '2007', '2002', '1997']", "csv_filename": "Moore County Public Utilities-Vass - Water Use Information, Service Area.csv"}]

export default function Home() {
  const [primaryData, setPrimary] = useState<SearchResults[] | null>(dummyData);
  const [interestedLocations, setLocations] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [openPanel, setOpenPanel] = useState(false);
  const [currentds, setCurrentds] = useState<SearchResults | null>(null);
  const [dsSource, setDsSource] = useState<USDatasetSource>("NC_DEQ_WATERSUPPLY");

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
          <img
            src={logo.src}
            alt="Spacious AI"
            className="object-contain w-full mt-5"
          />
        </div>
        <div className="p-2 border-t ">
          <h4 className="mt-1">Set Location</h4>
          <DebouncedInput
            placeholder="City/State/Lat,Lng"
            onChange={setLocations}
          />
        </div>
        <div className="p-2">
          <h4>Specify Data Source</h4>
          <DatasourceSelect dataSource={dsSource} setDataSource={setDsSource} />
        </div>
        {dsSource == 'USGS_WATER' && <div className="p-2">
          <h4>Select Date Range</h4>
          <DateRangeSelector
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
          />
        </div>}
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
            <DatasetPanel
              dataset={currentds}
              dsSource={dsSource}
            />
          </div>
        </SlidingPane>
      )}
    </div>
  );
}
