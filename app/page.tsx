"use client";
import React, { useState } from "react";
import "react-sliding-pane/dist/react-sliding-pane.css";
import DatasetCard from "@/components/index/DatasetCard";
import DatasetPane from "@/components/index/DatasetPane";
import EditTagButton, {
  USDatasetSource,
} from "@/components/index/EditTagButton";
import SlidingPane from "react-sliding-pane";
import { PaginatedList } from "react-paginated-list";
import DebouncedInput from "@/components/common/DebouncedInput";
import { Spinner } from "flowbite-react";
import { logTableInteraction } from "@/utils/supabaseLogger";
import DatasourceSelect from "@/components/index/DatasourceSelect";
import { PFASSearchResult, SearchResult } from "./search";
import RequestDataBanner from "@/components/index/RequestDataBanner";
import OpenLinkButton from "@/components/index/RequestDataButton";

export default function Home() {
  const [primaryData, setPrimary] = useState<
    SearchResult[] | PFASSearchResult[] | null
  >(null);
  const [interestedLocations, setLocations] = useState<string>("United States");
  const [loading, setLoading] = useState<boolean>(false);
  const [openPanel, setOpenPanel] = useState(false);
  const [currentds, setCurrentds] = useState<
    SearchResult | PFASSearchResult | null
  >(null);
  const [dsSource, setDsSource] = useState<USDatasetSource>("ANY");

  function setDatasetSelected(ds: SearchResult | PFASSearchResult) {
    setCurrentds(ds);
    setOpenPanel(true);
  }

  return (
    <div className="grid grid-cols-6 h-[100vh]">
      <div className="col-span-1 bg-sky-200 prose flex flex-col h-full">
        <h2 className="mt-6 ml-3 mb-2">Spacious AI</h2>
        <div className="p-2">
          <h4>Set Location</h4>
          <DebouncedInput
            placeholder="City/State/Region"
            onChange={setLocations}
          />
        </div>
        <div className="p-2">
          <h4>Specify Data Source</h4>
          <DatasourceSelect dataSource={dsSource} setDataSource={setDsSource} />
        </div>
        <div className="p-2 mt-auto">
          <OpenLinkButton />
        </div>
      </div>
      <div className="col-span-5 flex h-[100vh]">
        <div className="w-full bg-sky-50 overflow-auto p-2">
          <EditTagButton
            location={interestedLocations}
            setPrimaryData={setPrimary}
            dsSource={dsSource}
            setLoading={setLoading}
          />
          {loading ? (
            <div className="ml-20 mt-20">
              <Spinner />
            </div>
          ) : primaryData != null && primaryData.length > 0 ? (
            <>
              <PaginatedList
                list={primaryData || []}
                itemsPerPage={20}
                renderList={(list: Array<any>) => (
                  <>
                    {list.map((data, i) => (
                      <DatasetCard
                        key={data.title + i}
                        dataset={data}
                        index={i}
                        setSelectedDataset={setDatasetSelected}
                        dsSource={dsSource ?? "ANY"}
                      />
                    ))}
                  </>
                )}
                onPageChange={(newItems, newPage) => {
                  if (process.env.NODE_ENV === "production") {
                    logTableInteraction(
                      "NextPage",
                      newPage,
                      newItems.length.toString()
                    );
                  }
                }}
              />
              <div className="bottom-0 w-[82%] absolute bg-white flex justify-center"></div>
            </>
          ) : (
            primaryData != null && (
              <p>
                There are no results matching your search, try removing some
                filters or request data through the bottom banner
              </p>
            )
          )}
        </div>
        {/* <RequestDataBanner /> */}
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
            <DatasetPane
              dsMetadata={currentds}
              openModal={openPanel}
              setOpenModal={setOpenPanel}
              dsSource={dsSource}
            />
          </div>
        </SlidingPane>
      )}
    </div>
  );
}
