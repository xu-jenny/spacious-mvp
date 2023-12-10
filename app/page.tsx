"use client";

import MetadataTable from "@/components/MetadataTable";
import ChatInput, { ChatMessage } from "@/components/index/ChatInput";
import { post } from "@/utils/http";
import { useEffect, useState } from "react";
import { jsonParse } from "@/utils/json";
import { getSupabaseData, processChatResponse } from "./indexUtils";
import ChatBox from "@/components/index/ChatBox";
import LocationInput from "@/components/index/LocationInput";
import RequestDatasetButton from "@/components/index/RequestDatasetButton";
import { addQueries, logError } from "@/utils/supabaseLogger";

export default function Home() {
  let [primaryData, setPrimary] = useState<any[]>([]);
  let [tangentialData, setTangential] = useState<any[]>([]);
  let [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  let [interestedLocations, setLocations] = useState<string[] | null>(null);
  let [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const addError = (
    newChatHistory: ChatMessage[],
    errorMessage: string,
    error: string
  ) => {
    console.error(errorMessage, error);
    setChatHistory([
      ...newChatHistory,
      {
        text: "I'm sorry, but there was an error processing your request. Please report the error.",
        isChatOwner: false,
        sentAt: new Date(),
      } as ChatMessage,
    ]);
    logError(errorMessage, error);
  };

  const chatWithAgent = async (
    message: ChatMessage,
    interestedLocations: string[]
  ) => {
    let newChatHistory = [...chatHistory, message];
    setChatHistory(newChatHistory);
    let response = await post(
      process.env.NEXT_PUBLIC_BACKEND_SERVER_URL + "/chat",
      // "http://127.0.0.1:5000/chat",
      {
        query: message,
        chatHistory: newChatHistory,
      }
    );
    console.log("response from flask server: ", response);
    if (response != null) {
      if ("message" in response) {
        setChatHistory([
          ...newChatHistory,
          {
            text: response.message,
            isChatOwner: false,
            sentAt: new Date(),
          } as ChatMessage,
        ]);
      } else if ("output" in response) {
        let output = response["output"] as string;
        // check if answer contain tags
        try {
          let d = jsonParse(output);
          if (d != null) {
            let result = await processChatResponse(d, interestedLocations);
            setChatHistory([
              ...newChatHistory,
              {
                text: result.aiMessage,
                isChatOwner: false,
                sentAt: new Date(),
                attachment:
                  result.primaryData != null &&
                  result.primaryData.length > 0 ? null : (
                    <RequestDatasetButton
                      query={
                        message.text +
                        `|Location:${interestedLocations.join(",")}`
                      }
                      aiMessage={result.aiMessage}
                    />
                  ),
              } as ChatMessage,
            ]);
            setPrimary(result.primaryData);
            setTangential(result.tangentialData);

            // let data = await getSupabaseData(d, interestedLocations.join(","));
            // console.log(data);
            // if (
            //   data != null &&
            //   "primaryData" in data &&
            //   data["primaryData"] != null
            // ) {
            //   setPrimary(data["primaryData"]);
            //   if ("tangentialData" in data && data["tangentialData"] != null) {
            //     setTangential(data["tangentialData"]);
            //   }
            //   let aiMessage = `I think the dataset tag you are interested in is ${d["primary_tag"]}. Some suggested tags are ${d["tangential_tags"]},`;
            //   aiMessage +=
            //     data["primaryData"].length > 0
            //       ? `There are ${data["primaryData"].length} records matching the primary tag.`
            //       : `There isn't any corresponding record matching the primary tag. If you believe the dataset tag is correct, please press this button to request the dataset!`;
          } else {
            setChatHistory([
              ...newChatHistory,
              {
                text: output,
                isChatOwner: false,
                sentAt: new Date(),
              } as ChatMessage,
            ]);
          }
        } catch (e) {
          console.error("error when parsing response", e);
          addError(
            newChatHistory,
            `error when parsing response ${response}`,
            e as string
          );
        }
      } else {
        addError(
          newChatHistory,
          "error when waiting for response from server. Response: ",
          response
        );
      }
    }
  };

  const onNewMessage = async (data: ChatMessage) => {
    if (interestedLocations != null) {
      setError(null);
      setLoading(true);
      console.log(
        "calling chatWithAgent with ",
        interestedLocations,
        data["text"]
      );
      await chatWithAgent(
        {
          sentAt: new Date(),
          isChatOwner: true,
          text: data["text"],
        },
        interestedLocations
      );
      setLoading(false);
    } else {
      setError("Please set the location!");
    }
  };

  useEffect(() => {
    if (chatHistory.length % 2 == 0 && chatHistory.length > 0) {
      console.log("calling addQueries", chatHistory, interestedLocations);
      addQueries(chatHistory, interestedLocations, sessionId);
    }
  }, [chatHistory]);

  return (
    <div className="grid grid-cols-6 h-[100vh]">
      <div className="col-span-1 bg-sky-200 prose">
        <LocationInput setLocations={setLocations} />
        <h2 className="fixed bottom-5 left-4">Spacious AI</h2>
      </div>
      <div className="col-span-5 flex h-[100vh]">
        <div className="w-1/2 flex flex-col h-full">
          <ChatBox chatHistory={chatHistory} loading={loading} />
          {error != null && <span className="text-red ml-7">{error}</span>}
          <ChatInput sendANewMessage={onNewMessage} />
        </div>
        <div className="w-1/2 bg-sky-50 overflow-auto">
          <div className="p-4 overflow-auto h-[50vh]">
            <h2 className="text-2xl font-semi-bold p-2">Primary Data</h2>
            <MetadataTable data={primaryData} paginate={true} tableName="Primary"/>
          </div>
          <hr />
          <div className="p-4 overflow-auto">
            <h2 className="text-2xl font-semi-bold p-2">Tangential Data</h2>
            <MetadataTable data={tangentialData} paginate={true} tableName="Tangential"/>
          </div>
        </div>
      </div>
    </div>
  );
}
