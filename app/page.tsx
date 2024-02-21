"use client";

import MetadataTable from "@/components/MetadataTable";
import ChatInput, { ChatMessage } from "@/components/index/ChatInput";
import { post } from "@/utils/http";
import { useEffect, useState } from "react";
import { processChatResponse } from "./indexUtils";
import ChatBox from "@/components/index/ChatBox";
import LocationInput from "@/components/index/LocationInput";
import RequestDatasetButton from "@/components/index/RequestDatasetButton";
import { addQueries, logError } from "@/utils/supabaseLogger";
import React from "react";
import EditTagButton from "@/components/index/EditTagButton";
import { DatasetList } from "@/components/index/DatasetList";

export default function Home() {
  let [primaryData, setPrimary] = useState<any[]>([]);
  let [tangentialData, setTangential] = useState<any[]>([]);
  let [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  let [interestedLocations, setLocations] = useState<string[] | null>([
    "United States",
  ]);
  let [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [sessionId, setSessionId] = useState<number>(Date.now());

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
    interestedLocations: string
  ) => {
    let newChatHistory = [...chatHistory, message];
    setChatHistory(newChatHistory);
    let response = await post(
      process.env.NODE_ENV == "development"
        ? "http://127.0.0.1:8000/chat"
        : process.env.NEXT_PUBLIC_BACKEND_SERVER_URL + "/chat",
      {
        query: message,
        chatHistory: newChatHistory,
      }
    );
    // let response = {
    //   statusCode: 200,
    //   headers: {
    //     "Access-Control-Allow-Origin": "*",
    //   },
    //   body: {
    //     output: {
    //       primary_tag: "crime data",
    //       tangential_tags:
    //         "crime rates, types of crimes, demographics, law enforcement presence",
    //     },
    //   },
    // };
    console.log("response from flask server: ", response);
    if (
      typeof response === "object" &&
      "statusCode" in response &&
      response["statusCode"] == 200 &&
      response["body"] != null
    ) {
      if ("message" in response["body"]) {
        setChatHistory([
          ...newChatHistory,
          {
            text: response.message,
            isChatOwner: false,
            sentAt: new Date(),
          } as ChatMessage,
        ]);
      } else if ("output" in response["body"]) {
        // check if answer contain tags
        try {
          let d = response["body"]["output"];
          // let d = jsonParse(output);
          if (d != null) {
            let result = await processChatResponse(d, interestedLocations);
            setChatHistory([
              ...newChatHistory,
              {
                text: result.aiMessage,
                isChatOwner: false,
                sentAt: new Date(),
                attachment: (
                  <div className="flex flex-row">
                    <EditTagButton
                      location={interestedLocations}
                      setPrimaryData={setPrimary}
                    />
                    {result.primaryData != null &&
                    result.primaryData.length > 0 ? null : (
                      <RequestDatasetButton
                        query={
                          message.text + `|Location:${interestedLocations}`
                        }
                        aiMessage={result.aiMessage}
                      />
                    )}
                  </div>
                ),
              } as ChatMessage,
            ]);
            setPrimary(result.primaryData);
            setTangential(result.tangentialData);
          } else {
            addErrorMessage(
              "There is an error with the server, please try another message or try again later."
            );
          }
        } catch (e) {
          console.error("error when parsing response", e);
          if (process.env.NODE_ENV != "development") {
            addError(
              newChatHistory,
              `error when parsing response ${response}`,
              e as string
            );
            addErrorMessage(
              "An error happened parsing this response, please try to edit tag!"
            );
          }
        }
      } else {
        console.error("error when parsing response", response);
        if (process.env.NODE_ENV != "development") {
          addError(
            newChatHistory,
            "error when waiting for response from server. Response: ",
            response.toString()
          );
        }
      }
    } else {
      console.error("error when getting response back from server", response);
      if (process.env.NODE_ENV != "development") {
        addError(
          newChatHistory,
          "error when getting response back from server. Response: ",
          response.toString()
        );
      }
    }
  };

  const addErrorMessage = (message: string) => {
    setChatHistory([
      ...chatHistory,
      {
        text: message,
        isChatOwner: false,
        sentAt: new Date(),
        attachment: (
          <EditTagButton
            location={interestedLocations?.join(",") || "United States"}
            setPrimaryData={setPrimary}
          />
        ),
      } as unknown as ChatMessage,
    ]);
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
        interestedLocations.join(", ")
      );
      setLoading(false);
    } else {
      setError("Please set the location!");
    }
  };

  useEffect(() => {
    if (
      chatHistory.length % 2 == 0 &&
      chatHistory.length > 0 &&
      process.env.NODE_ENV === "production"
    ) {
      console.log("calling addQueries", chatHistory, interestedLocations);
      addQueries(chatHistory, interestedLocations?.join(", ") ?? "", sessionId);
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
        <div className="w-1/2 bg-sky-50 overflow-auto p-2">
          <DatasetList
            primaryDataList={primaryData}
            tangentialDataList={tangentialData}
            location={interestedLocations?.join(",") || "United States"}
            setPrimaryData={setPrimary}
          />
          {/* <div className="p-4 overflow-auto h-[50vh]">
            <h2 className="text-2xl font-semi-bold p-2">Primary Data</h2>
            <MetadataTable
              data={primaryData}
              paginate={true}
              tableName="Primary"
            />
          </div>
          <hr />
          <div className="p-4 overflow-auto">
            <h2 className="text-2xl font-semi-bold p-2">Tangential Data</h2>
            <MetadataTable
              data={tangentialData}
              paginate={true}
              tableName="Tangential"
            />
          </div> */}
        </div>
      </div>
    </div>
  );
}
