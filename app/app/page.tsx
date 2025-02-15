"use client";
import React, { useEffect, useRef, useState } from "react";
import "react-sliding-pane/dist/react-sliding-pane.css";

import DatasetPanel from "@/components/index/DatasetPane/DatasetPanel";
import OpenLinkButton from "@/components/index/RequestData/RequestDataButton";
import SearchButton, { search } from "@/components/index/SearchButton";
import SearchResultViewer from "@/components/index/SearchResult/SearchResultViewer";
import { useSearchParams } from "next/navigation";
import SlidingPane from "react-sliding-pane";
import { LaserficheSearchResult, GenericSearchResult } from "../search/search";
import { NCDEQWSSearchResult } from "../search/NCDEQWSSearch";
import { useStateContext } from "../StateContext";
import { pdfjs } from "react-pdf";
// import PDFPanelViewer from "@/components/index/DatasetPane/PDFPanelViewer";
import Sidebar from "@/components/index/Sidebar/Sidebar";
import Spinner from "@/components/common/Spinner";
import { useLogger } from "@/utils/supabaseLogger";
import { USGSWaterSearchResult } from "../search/usgsSearch";
import StreamingResponse, {
  StreamingResponseRef,
} from "@/components/index/StreamingResponse";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export type SearchResults =
  | GenericSearchResult
  | USGSWaterSearchResult
  | NCDEQWSSearchResult
  | LaserficheSearchResult;

export default function Home() {
  const searchParams = useSearchParams();
  const { state, dispatch } = useStateContext();
  const [loading, setLoading] = useState<boolean>(false);
  const [openPanel, setOpenPanel] = useState(false);
  const [currentds, setCurrentds] = useState<SearchResults | null>();
  const logger = useLogger();
  const streamingResponseRef = useRef<StreamingResponseRef>(null);

  function setDatasetSelected(ds: SearchResults) {
    setCurrentds(ds);
    setOpenPanel(true);
  }

  useEffect(() => {
    async function performSearch() {
      const loc = {
        display_name: searchParams?.get("loc")!,
        name: searchParams?.get("loc")!,
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
      if (state.searchValue != null && searchParams?.get("loc") != null) {
        let result = await performSearch();
        if (result != undefined) {
          dispatch({
            type: "updateSearchResults",
            payload: result,
          });
        }
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
      <Sidebar />
      <div className="col-span-5 flex h-[100vh] relative">
        <div className="w-full bg-sky-50 overflow-auto p-2">
          <SearchButton
            setLoading={setLoading}
            loading={loading}
            streamingResponseRef={streamingResponseRef}
          />
          <StreamingResponse
            ref={streamingResponseRef}
            setDatasetSelected={setDatasetSelected}
          />
          {loading ? (
            <div className="ml-20 mt-20"> </div>
          ) : state.searchResult != null && state.searchResult.length > 0 ? (
            <SearchResultViewer
              primaryData={state.searchResult}
              setDatasetSelected={setDatasetSelected}
              panelIsOpen={openPanel}
            />
          ) : (
            state.searchResult != null && (
              <>
                <div className="absolute right-0 left-0 bottom-0 w-full bg-white py-4 flex justify-center items-center gap-4 border">
                  {state.dataSource == "USGS_WATER" ? (
                    <span>
                      No stations found for{" "}
                      {state.searchValue ?? "your datatype"} within 50 miles
                      radius of{" "}
                      {state.location?.display_name ?? "your selected location"}
                    </span>
                  ) : (
                    <span>Not seeing the data you&apos;re looking for?</span>
                  )}
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
          className="p-0 m-0"
          width="90%"
          hideHeader={true}
          shouldCloseOnEsc={true}
          onRequestClose={() => {
            setOpenPanel(false);
            if (process.env.NODE_ENV === "production") {
              logger.log("CloseDatasetPanel", currentds.id);
            }
          }}
        >
          <DatasetPanel dataset={currentds} />
        </SlidingPane>
      )}
    </div>
  );
}
