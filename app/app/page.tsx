"use client";
import React, { useEffect, useState } from "react";
import "react-sliding-pane/dist/react-sliding-pane.css";

import DatasetPanel from "@/components/index/DatasetPane/DatasetPanel";
import OpenLinkButton from "@/components/index/RequestData/RequestDataButton";
import SearchButton, {
  search,
  USDatasetSource,
} from "@/components/index/SearchButton";
import SearchResultViewer from "@/components/index/SearchResult/SearchResultViewer";
import { logTableInteraction } from "@/utils/supabaseLogger";
import { useSearchParams } from "next/navigation";
import SlidingPane from "react-sliding-pane";
import {
  LaserficheSearchResult,
  GenericSearchResult,
  USGSWaterSearchResult,
} from "../search/search";
import { NCDEQWSSearchResult } from "../search/NCDEQWSSearch";
import { useStateContext } from "../StateContext";
import { pdfjs } from "react-pdf";
// import PDFPanelViewer from "@/components/index/DatasetPane/PDFPanelViewer";
import Sidebar from "@/components/index/Sidebar/Sidebar";
import Spinner from "@/components/common/Spinner";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export type SearchResults =
  | GenericSearchResult
  | USGSWaterSearchResult
  | NCDEQWSSearchResult
  | LaserficheSearchResult;

export default function Home() {
  const searchParams = useSearchParams();
  const { state } = useStateContext();
  const [primaryData, setPrimary] = useState<SearchResults[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [openPanel, setOpenPanel] = useState(false);
  const [currentds, setCurrentds] = useState<SearchResults | null>();

  function setDatasetSelected(ds: SearchResults) {
    setCurrentds(ds);
    setOpenPanel(true);
  }

  useEffect(() => {
    async function performSearch() {
      const loc = {
        display_name: searchParams.get("loc")!,
        name: searchParams.get("loc")!,
        lat: 0.0,
        lon: 0.0,
        addresstype: "city",
      };
      return await search(
        state.searchValue,
        loc,
        state.dataSource,
        state.startDate,
        state.endDate
      );
    }
    async function fetchData() {
      if (state.searchValue != null && searchParams.get("loc") != null) {
        let result = await performSearch();
        setPrimary(result);
        if (searchParams.get("id") != null) {
          let ds = result?.filter(
            (r: { id: string | null }) => r.id == searchParams.get("id")
          );
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
      <Sidebar setPrimary={setPrimary} />
      {/* content */}
      <div className="col-span-5 flex h-[100vh] relative">
        <div className="w-full bg-sky-50 overflow-auto p-2">
          <SearchButton
            setPrimaryData={setPrimary}
            setLoading={setLoading}
            loading={loading}
          />
          {/* <PDFPanelViewer fileUrl={"/WI0500447_Staff Report_20200911.pdf"} pagesToJump={[{
            page: 1,
            score: 10,
            bbox: [182.0, 697.3308020882772, 710.0, 873.4143331751305],
          }]}
          docBbox={[0, 0, 1054, 807]}
          /> */}
          {loading ? (
            <div className="ml-20 mt-20">
              <Spinner />
            </div>
          ) : primaryData != null && primaryData.length > 0 ? (
            <SearchResultViewer
              primaryData={primaryData}
              setDatasetSelected={setDatasetSelected}
              panelIsOpen={openPanel}
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
          <DatasetPanel dataset={currentds} />
        </SlidingPane>
      )}
    </div>
  );
}
