"use client";
import { InfoDropdown } from "@/components/dataset/InfoDropdown";
import ChatBox from "@/components/index/ChatBox";
import ChatInput, { ChatMessage } from "@/components/index/ChatInput";
import { post } from "@/utils/http";
import { jsonParse } from "@/utils/json";
import { useEffect, useState } from "react";

import { Dataset, getDataset } from "./util";

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
        console.log(result);
        setDataset(result);
      }
    }
    fetchDataset();
  }, [id]);

  const datasetUrls =
    dataset != null && dataset?.datasetUrl != null
      ? jsonParse(dataset?.datasetUrl)
      : [];
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
        fileUrl: datasetUrls[0]["url"],
        query: message.text,
      }
    );
    console.log(response);
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
    }
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
              (
                obj: { name: string; url: string; format: string },
                index: number
              ) => (
                <span key={obj["url"]}>
                  <a
                    href={obj["url"]}
                    className="text-blue-600 dark:text-blue-500 hover:underline">
                    {obj["name"]}
                  </a>
                  {index != datasetUrls.length - 1 && " | "}
                </span>
              )
            )}
          </div>
          <hr className="my-5 border-double" />
          <h3>First 5 rows of dataset</h3>
          <pre>{dataset != null && dataset["df.head"]}</pre>
          <hr className="w-3/4 h-0.5 mx-auto my-4 bg-gray-100 border-0 rounded md:my-10 dark:bg-gray-700" />
          {dataset != null && <InfoDropdown dataset={dataset} />}
        </article>
        {/* <DynamicTable data={JSON.parse(dataset.metadata)} /> */}
      </div>
      <div className="w-1/2 flex flex-col h-full">
        <ChatBox chatHistory={chatHistory} loading={loading} />
        {error != null && <span className="text-red ml-7">{error}</span>}
        <ChatInput sendANewMessage={onNewMessage} />
      </div>
    </div>
  );
}
