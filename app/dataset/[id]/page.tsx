"use client";
import { InfoDropdown } from "@/components/dataset/InfoDropdown";
import ChatBox from "@/components/index/ChatBox";
import ChatInput, { ChatMessage } from "@/components/index/ChatInput";
import { post } from "@/utils/http";
import { jsonParse } from "@/utils/json";
import { useEffect, useState } from "react";

import { Dataset, getDataset } from "./util";
import { addQueries } from "@/utils/supabaseLogger";

export default function DatasetPage({
  params: { id },
}: {
  params: { id: number };
}) {
  let [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  let [dataset, setDataset] = useState<Dataset | null>(null);
  let [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    async function fetchDataset() {
      let result = await getDataset(id);
      if (result == null) {
        setError("There was no dataset corresponding to the specified ID.");
      } else {
        setDataset(result);
        console.log(result);
      }
    }
    fetchDataset();
  }, [id]);

  const onNewMessage = async (message: ChatMessage) => {
    let newChatHistory = [...chatHistory, message];
    setChatHistory(newChatHistory);
    setLoading(true);
    let response = await post(
      process.env.NODE_ENV == "development"
        ? "http://127.0.0.1:3000/chat-csv"
        : process.env.NEXT_PUBLIC_LAMBDA_URL + "/chat-csv",
      {
        filename: `${dataset?.title}.csv`,
        fileUrl: dataset?.csv_url,
        query: message.text,
      }
    );
    console.log("response from server", response);
    if (typeof response === "object" && "message" in response) {
      setChatHistory([
        ...newChatHistory,
        {
          text: response["message"] as string,
          isChatOwner: false,
          sentAt: new Date(),
          // attachment: <AiMessageDetail response={data} />,
        } as ChatMessage,
      ]);
      setLoading(false);
    } else {
      setChatHistory([
        ...newChatHistory,
        {
          text: "Sorry, there is a problem with the server. Could you please contact the administrator?",
          isChatOwner: false,
          sentAt: new Date(),
        } as ChatMessage,
      ]);
    }
  };

  useEffect(() => {
    if (
      chatHistory.length % 2 == 0 &&
      chatHistory.length > 0 &&
      process.env.NODE_ENV === "production"
    ) {
      console.log("calling addQueries", chatHistory);
      addQueries(chatHistory, `dataset-${id}`, Date.now());
    }
  }, [chatHistory, id]);

  const showPublisher = (pubStr: string) => {
    try {
      const publisher = jsonParse(pubStr);
      if ("contact" in publisher && publisher.contact != null) {
        return (
          <a href={"mailto:" + publisher.contact} className="font">
            {publisher.name}
          </a>
        );
      } else if ("name" in publisher && publisher.name != null) {
        return <span>{publisher.name}</span>;
      } else {
        return <span>{publisher}</span>;
      }
    } catch (e) {
      console.error("Error parsing publlisher for dataset: ", id);
      return <span>{pubStr}</span>;
    }
  };

  const showDatasetUrls = () => {
    try {
      const datasetUrls =
        dataset != null && dataset?.datasetUrl != null
          ? jsonParse(dataset?.datasetUrl)
          : [];
      if (datasetUrls == null || datasetUrls.length == 0) {
        return null;
      }
      if (Array.isArray(datasetUrls)) {
        return datasetUrls.map((obj, index) => (
          <span key={obj["url"]}>
            <a
              href={obj["url"]}
              className="text-blue-600 dark:text-blue-500 hover:underline"
            >
              {obj["name"]}
            </a>
            {index != datasetUrls.length - 1 && " | "}
          </span>
        ));
      } else {
        return (
          <span>
            <a
              href={datasetUrls["url"]}
              className="text-blue-600 dark:text-blue-500 hover:underline"
            >
              {datasetUrls["name"]}
            </a>
          </span>
        );
      }
    } catch (e) {
      console.error("Error parsing datasetUrl for dataset: ", id);
      return <span>{dataset?.datasetUrl}</span>;
    }
  };

  return (
    <div className="flex h-[100vh]">
      <div className="w-1/2 flex flex-col h-full">
        <article className="prose p-4 max-w-none">
          <h3>{dataset?.title}</h3>
          <p>Summary: {dataset?.summary}</p>
          <p>Location: {dataset?.location}</p>
          {dataset?.lastUpdated != null && (
            <p>Last updated: {dataset?.lastUpdated}</p>
          )}
          {dataset?.publisher != null && (
            <p>
              Publisher:{" "}
              {dataset?.publisher != null && showPublisher(dataset?.publisher)}
            </p>
          )}
          <p>Topic: {dataset?.topic}</p>
          <div>
            <span>Dataset Download Links: </span>
            {showDatasetUrls()}
          </div>
          {dataset?.firstPublished != null && (
            <span>First published: {dataset.firstPublished}</span>
          )}
          {dataset?.lastUpdated != null && (
            <span>Last Updated: {dataset.lastUpdated}</span>
          )}
          {dataset?.csv_url != null && dataset["df.head"] != null && (
            <>
              <hr className="my-5 border-double" />
              <h3>First 5 rows of dataset</h3>
              <pre>{dataset != null && dataset["df.head"]}</pre>
              <hr className="w-3/4 h-0.5 mx-auto my-4 bg-gray-100 border-0 rounded md:my-10 dark:bg-gray-700" />
              <InfoDropdown dataset={dataset} />
            </>
          )}
        </article>
        {/* <DynamicTable data={JSON.parse(dataset.metadata)} /> */}
      </div>
      {dataset?.csv_url != null && (
        <div className="w-1/2 flex flex-col h-full">
          <ChatBox chatHistory={chatHistory} loading={loading} />
          {error != null && <span className="text-red ml-7">{error}</span>}
          <ChatInput sendANewMessage={onNewMessage} />
        </div>
      )}
    </div>
  );
}
