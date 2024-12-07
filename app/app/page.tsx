"use client";
import React, { useEffect, useState } from "react";
import "react-sliding-pane/dist/react-sliding-pane.css";

import DatasetPanel from "@/components/index/DatasetPane/DatasetPanel";
import OpenLinkButton from "@/components/index/RequestData/RequestDataButton";
import SearchButton, { search } from "@/components/index/SearchButton";
import SearchResultViewer from "@/components/index/SearchResult/SearchResultViewer";
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
import { useLogger } from "@/utils/supabaseLogger";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export type SearchResults =
  | GenericSearchResult
  | USGSWaterSearchResult
  | NCDEQWSSearchResult
  | LaserficheSearchResult;

export default function Home() {
  const searchParams = useSearchParams();
  const { state } = useStateContext();
  const [primaryData, setPrimary] = useState<
    SearchResults[] | null | undefined
  >(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [openPanel, setOpenPanel] = useState(false);
  const [currentds, setCurrentds] = useState<SearchResults | null>();
  const logger = useLogger();

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
          {/* <div className="flex h-[100vh] z-[1000] top-0 left-0 w-full">
            <div className="w-full flex flex-col h-full">
              <article className="prose p-4 max-w-none">
                <PDFPanelViewer
                  fileUrl={"/NCS000050_Permit_Issuance_20230524.pdf"}
                  pagesToJump={[
                    {
                      page: 20,
                      score: 1,
                      bbox: null,
                      text: "The Permittee shall maintain current information about selected BMPs, their implementation, and effectiveness in reducing metals concentrations in the Stormwater Pollution Prevention Plan.\nThat information should include reference to DWR stormwater benchmark concentrations for Total Copper and Total Zinc, currently 10 µg/ L and 126 µg/ L, respectively.",
                    },
                    {
                      page: 15,
                      score: 0.8337184466019402,
                      bbox: null,
                      text: "|\n| C0530                  | Total Suspended  Solids( TSS)                                                                                                 | Quarterly | 100 mg/L         |\n| 00400                  | pH 2                                                                                                                          | Quarterly | 6 s. u.— 9 s. u. |\n| 46529                  | Total Rainfall of  Sampled Event  inches) 3                                                                                   |           |                  |\n| 00552                  | Non\\-  Polar Oil&  Grease for drainage  areas that use> 55 gallons/ month  of oil  on average per EPA Method 1664  SGT\\- HEM) | Quarterly | 15 mg/L          |\n| NCOIL                  | Estimated Average Monthly Oil Usage at the Facility(  gallons)                                                                |           |                  |\n| 00340                  | Chemical Oxygen Demand( COD)                                                                                                  | Quarterly | 120 mg/L         |\n| C0600                  | Total Nitrogen                                                                                                                | Quarterly | 30 mg/ L         |\n| 01097                  | Total Antimony                                                                                                                | Quarterly | 340 lig/  L      |\n| 01042                  | Total Copper                                                                                                                  | Quarterly | 10 gg/L          |\n| 01092                  | Total Zinc                                                                                                                    | Quarterly | 126 µg/L         |\n| 00900                  | Hardness—  Total as[ CaCO3  or( Ca+   Mg)] 4                                                                                  | Quarterly |                  |",
                    },
                    {
                      page: 34,
                      score: 0.5146116504854384,
                      bbox: null,
                      text: "Liquid raw materials, intermediate products, manufactured products, waste materials, or by-products with a single above ground storage container having a capacity of greater than 660 gallons or with multiple above ground storage containers having a total combined storage capacity of greater than 1, 320 gallons.",
                    },
                    {
                      page: 37,
                      score: 0.46270873786407724,
                      bbox: null,
                      text: "I. Is listed in appendix D of 40 CFR part 122 on Table II ( organic priority pollutants), Table III\ncertain metals, cyanides, and phenols) or Table IV (certain toxic pollutants and hazardous substances);\n2. Is Iisted as a hazardous substance pursuant to section 311( b)( 2)( A) of the CWA at 40 CFR\n116. 4; or 3. Is a pollutant for which EPA has published acute or chronic water quality criteria.",
                    },
                    {
                      page: 18,
                      score: 0.4559805825242735,
                      bbox: null,
                      text: "|\n|                               | iv. Conduct  a stormwater management inspection.                                                |\n|                               | v. Identify and evaluate possible  causes ofthe benchmark                                       |\n|                               | exceedance.                                                                                     |\n| Within one month              | vi. Select of specific, feasible courses action to reduce                                       |\n|                               | concentrations ofthe parameter(  s) of concern including, but not                               |\n|                               | limited to, source controls, operational controls, or physical                                  |\n|                               | improvements.                                                                                   |",
                    },
                    {
                      page: 17,
                      score: 0.40696116504854346,
                      bbox: null,
                      text: "Table 2: Tier One Response for a Benchmark Exceedanee\nTimeline\nSampling.\nt'rorra\nResults\nReceipt \nIof \nTier One RequiredRequiredResponse/ Action/Action\nContinuously i. Document the exceedance and each required response/ action in\nthe SWPPP in accordance with Part D- 5 of the permit.\nWithin two weeks ii. Notify the Division' s Raleigh Regional Office of the exceedance\ndate and value via email or, when it is developed, an electronic\nform created by the Division for reporting exceedances.\niii.Conduct a stormwater management inspection.\niv. Identify and evaluate possible causes of the benchmark\nexceedance.\nWithin one month v. Select specific, feasible courses of action to reduce concentrations\nof the parameter( s) of concern including, but not limited to,\nsource controls, operational controls, or physical improvements.\nWithin two months vi.Implement the selected feasible actions.",
                    },
                    {
                      page: 0,
                      score: 0.40696116504854346,
                      bbox: null,
                      text: 'Governor t Interim Director 67evfrortmentalQuaUry ELIZABETH S. BISER\nSecretary DOUGLAS R. ANSEL NORTH CAROLINA\nJill Spaulding SCM Metal Products, Inc.\nPO Box 12166 RTP, NC 27709 Subject: Issued NPDES Stormwater Permit NPDES Permit NCS000050 SCM Metal Products, Inc. Durham County Dear Permittee:\nDivision personnel have reviewed and approved your application for renewal of the subject permit. Accordingly, we are forwarding the attached NPDES permit. This permit is issued pursuant to the requirements of North Carolina General Statute 143- 215. 1 and the Memorandum of Agreement between North Carolina and the U. S. Environmental Protection Agency dated October 15, 2007 ( or as subsequently amended).\nThe final permit maintains the following significant changes from the previous permit:\n1. Monitoring increased from semi- annually to quarterly for all parameters ( qualitative and quantitative).\n2. Units of measure for several benchmarks have been changed from mg/L to µg/L.\n3. " No discharge" clarifications were made.',
                    },
                    {
                      page: 4,
                      score: 0.32333980582524285,
                      bbox: null,
                      text: "C- 1. Visual Inspections C- 2. Qualitative Monitoring Response PART D: ANALYTICAL MONITORING REQUIREMENTS\nD- l. Required Baseline Sampling D- 2. Baseline Sampling Benchmarks D- 3. Methodology for Collecting Samples D- 4. Locations for Collecting Samples D- 5. Tier One Response: Single Benchmark Exceedance D- 6. Tier Two Response: Two Consecutive Benchmark Exceedances D- 7. Tier Three Response: Four Benchmark Exceedances Within 5 Years",
                    },
                    {
                      page: 36,
                      score: 0.28104854368932014,
                      bbox: null,
                      text: 'Supplemental North Carolina water quality classification intended to protect unique and special waters having excellent water quality and being of exceptional state or national, ecological or recreational significance. To qualify, waters must be rated" excellent" by the NC Division of Water Resources, and have one of the following outstanding resource values:',
                    },
                    {
                      page: 38,
                      score: 0.2714368932038852,
                      bbox: null,
                      text: "Supplemental NC water quality classification intended to protect freshwaters for natural trout propagation and survival of stocked trout on a year round basis. This is not the same as the NC Wildlife Resources Commission' s Designated Public Mountain Trout Waters.",
                    },
                  ]}
                  docBbox={[0, 0, 1054, 807]}
                />
              </article>
            </div>
          </div> */}
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
