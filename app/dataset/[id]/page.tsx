"use client";
import {
  JSXElementConstructor,
  PromiseLikeOfReactNode,
  ReactElement,
  ReactNode,
  ReactPortal,
  useEffect,
  useState,
} from "react";
import dynamic from "next/dynamic";
import ChatBox from "@/components/index/ChatBox";
import ChatInput, { ChatMessage } from "@/components/index/ChatInput";
import { supabaseClient } from "@/clients/supabase";
import { jsonParse } from "@/utils/json";
import { Dataset, getDataset } from "./util";
import { post } from "@/utils/http";
import { InfoDropdown } from "@/components/dataset/InfoDropdown";

const Example = {
  "id": 1056,
  "created_at": "2024-01-14T02:19:16.716423+00:00",
  "title": "NCHS - Death rates and life expectancy at birth",
  "summary": "This dataset collects information on death rates and life expectancy at birth in the United States from 1900 to 1904. It includes data by race, sex, and state, and provides information on age-adjusted death rates and average life expectancy. This dataset can be used to analyze trends in life expectancy over time, examine racial and sexual disparities in mortality rates, and explore the impact of urbanization, medical advancements, and socioeconomic factors on mortality. Additionally, it can be used to compare mortality rates across different states and investigate the effects of historical events like World Wars on mortality rates.",
  "datasetUrl": "[{'name': 'Comma Separated Values File', 'format': 'CSV', 'url': 'https://data.cdc.gov/api/views/w9j2-ggv5/rows.csv?accessType=DOWNLOAD'}, {'name': 'RDF File', 'format': 'RDF', 'url': 'https://data.cdc.gov/api/views/w9j2-ggv5/rows.rdf?accessType=DOWNLOAD'}, {'name': 'JSON File', 'format': 'JSON', 'url': 'https://data.cdc.gov/api/views/w9j2-ggv5/rows.json?accessType=DOWNLOAD'}, {'name': 'XML File', 'format': 'XML', 'url': 'https://data.cdc.gov/api/views/w9j2-ggv5/rows.xml?accessType=DOWNLOAD'}]",
  "license": "{'title': 'other-license-specified'}",
  "publisher": "{'name': 'U.S. Department of Health & Human Services', 'contact': 'cdcinfo@cdc.gov'}",
  "firstPublished": "2020-11-10T16:17:32.287839",
  "lastUpdated": "2022-04-21T01:30:47.842337",
  "location": "United States",
  "locationType": "National",
  "topic": "Mortality Rates",
  "subtags": "['Death Rates', 'Life Expectancy', 'Demographics']",
  "ds_tags": "['death-rates', 'life-expectancy', 'mortality', 'nchs', 'united-states']",
  "topic_fts_index": "'mortal':1 'rate':2",
  "df.head": "Year       Race         Sex  Average Life Expectancy (Years)  Age-adjusted Death Rate\n0  1900  All Races  Both Sexes                             47.3                   2518.0\n1  1901  All Races  Both Sexes                             49.1                   2473.1\n2  1902  All Races  Both Sexes                             51.5                   2301.3\n3  1903  All Races  Both Sexes                             50.5                   2379.0\n4  1904  All Races  Both Sexes                             47.6                   2502.5",
  "df.shape": "(1071, 5)",
  "df.info": "<class 'pandas.core.frame.DataFrame'>\nRangeIndex: 1071 entries, 0 to 1070\nData columns (total 5 columns):\n #   Column                           Non-Null Count  Dtype  \n---  ------                           --------------  -----  \n 0   Year                             1071 non-null   int64  \n 1   Race                             1071 non-null   object \n 2   Sex                              1071 non-null   object \n 3   Average Life Expectancy (Years)  1065 non-null   float64\n 4   Age-adjusted Death Rate          1071 non-null   float64\ndtypes: float64(2), int64(1), object(2)\nmemory usage: 42.0+ KB\n",
  "corr": "{\"Life<>Year\": 0.870212, \"Expectancy<>Year\": -0.885913, \"Expectancy<>Age-adjusted\": -0.885913, \"(Years)<>Average\": 0.870212, \"(Years)<>Age-adjusted\": -0.987863, \"Death<>Average\": -0.987863}",
  "df.desc": "Year  Average Life Expectancy (Years)  Age-adjusted Death Rate\ncount  1071.000000                      1065.000000              1071.000000\nmean   1959.000000                        64.500188              1593.061625\nstd      34.367176                        11.843765               682.369379\nmin    1900.000000                        29.100000               611.300000\n25%    1929.000000                        57.100000              1012.950000\n50%    1959.000000                        66.800000              1513.700000\n75%    1989.000000                        73.900000              2057.150000\nmax    2018.000000                        81.400000              3845.700000",
  "df.nunique": "Year                                119\nRace                                  3\nSex                                   3\nAverage Life Expectancy (Years)     379\nAge-adjusted Death Rate            1039",
  "df.value_counts": "Value counts for column Race:\nAll Races    357\nBlack        357\nWhite        357\n\nValue counts for column Sex:\nBoth Sexes    357\nFemale        357\nMale          357\n\n",
  "df.isna": "Year                               0\nRace                               0\nSex                                0\nAverage Life Expectancy (Years)    6\nAge-adjusted Death Rate            0"
}

export default function DatasetPage({
  params: { id },
}: {
  params: { id: number };
}) {
  let [chatWithAgent, setChatWithAgent] = useState<boolean>(false);
  let [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  let [dataset, setDataset] = useState<Dataset | null>(Example);
  let [error, setError] = useState<string | null>(null);

  // useEffect(() => {
  //   async function fetchDataset() {
  //     let result = await getDataset(id);
  //     if (result == null) {
  //       setError("There was no dataset corresponding to the specified ID.");
  //     } else {
  //       console.log(result);
  //       setDataset(result);
  //     }
  //   }
  //   fetchDataset();
  // }, [id]);

  const datasetUrls =
    dataset != null && dataset?.datasetUrl != null ? jsonParse(dataset?.datasetUrl) : [];
  const onNewMessage = async () => {
    let response = await post("/api/csvagent", {
      filename: `${dataset?.title}.csv`,
      fileUrl: datasetUrls[0]["url"],
      // query: "which year had the most sales?",
      query: "what is the time range of the dataset?",
    });
    console.log(response);
  };

  const showPublisher = (pubStr: string) => {
    const publisher = jsonParse(pubStr);
    return publisher.contact != null ? (
      <a href={publisher.contact} className="font">
        {publisher.name}
      </a>
    ) : (
      <span>{publisher.name}</span>
    );
  };

  return (
    <div className="flex h-[100vh]">
      <div className="w-1/2 flex flex-col h-full">
        <article className="prose p-4 max-w-none">
          <h3>{dataset?.title}</h3>
          <p>Summary: {dataset?.summary}</p>
          <p>Location: {dataset?.location}</p>
          <p>Last updated: {dataset?.lastUpdated}</p>
          <p>
            Publisher:{" "}
            {dataset?.publisher != null && showPublisher(dataset?.publisher)}
          </p>
          <p>Topic: {dataset?.topic}</p>
          <div>
            <span>Dataset Download Links: </span>
            {datasetUrls.map(
                (obj: { name: string; url: string; format: string }, index: number) => (
                  <span key={obj["name"]}>
                    <a
                      href={obj["url"]}
                      className="text-blue-600 dark:text-blue-500 hover:underline"
                    >
                      {obj["name"]}
                    </a>
                    {index != datasetUrls.length-1 && " | "}
                  </span>
                )
              )}
          </div>
          <hr />
          <InfoDropdown dataset={dataset} />
          {/* <pre>{dataset != null && dataset['df.head']}</pre>
          {dataset != null && "df.info" in dataset && dfInfo(dataset['df.info'])}
          <pre>{dataset != null && dataset['corr']}</pre>
          <pre>{dataset != null && dataset['df.desc']}</pre>
          <pre>{dataset != null && dataset['df.value_counts']}</pre>
          <pre>{dataset != null && dataset['df.nunique']}</pre> */}
        </article>
        {/* <DynamicTable data={JSON.parse(dataset.metadata)} /> */}
      </div>
      {/* {dataset.datasetType == "csv" && (
        <div className="w-3/4 h-[50vh] overflow-auto">
          {reportDownloadState ? (
            <iframe
              src="/downloaded-file.html"
              className="p-4 w-full h-full"
            ></iframe>
          ) : (
            <p>Loading Report...</p>
          )}
        </div>
      )} */}
      <div className="w-1/2 flex flex-col h-full">
        <ChatBox chatHistory={chatHistory} loading={false} />
        {error != null && <span className="text-red ml-7">{error}</span>}
        <ChatInput sendANewMessage={onNewMessage} />
      </div>
      {/* <div>
        {chatWithAgent == false ? (
          <Button
            onClick={() => setChatWithAgent(true)}
            text="Chat With Agent"
          ></Button>
        ) : (
          <div className="">
            <ChatBox chatHistory={chatHistory} loading={false} />
            <ChatInput sendANewMessage={onNewMessage} />
          </div>
        )}
      </div> */}
    </div>
  );
}
