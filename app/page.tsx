"use client";

import MetadataTable from "@/components/MetadataTable";
import ChatInput, { ChatMessage } from "@/components/index/ChatInput";
import { post } from "@/utils/http";
import { useEffect, useState } from "react";
import { jsonParse } from "@/utils/json";
import { getSupabaseData } from "./indexUtils";
import ChatBox from "@/components/index/ChatBox";
import LocationInput from "@/components/index/LocationInput";
import { addQueries } from "@/clients/supabase";

export default function Home() {
  let [primaryData, setPrimary] = useState([]);
  let [tangentialData, setTangential] = useState([]);
  let [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  let [interestedLocations, setLocations] = useState<string[] | null>(null);
  let [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const chatWithAgent = async (
    message: ChatMessage,
    interestedLocations: string[]
  ) => {
    let newChatHistory = [...chatHistory, message];
    setChatHistory(newChatHistory);
    let response = await post(
      // process.env.NEXT_PUBLIC_BACKEND_SERVER_URL + "/chat",
      "http://127.0.0.1:5000/chat",
      {
        query: message,
        chatHistory: newChatHistory,
      }
    );
    console.log(response);
    if (response != null && "output" in response) {
      let output = response["output"] as string;
      // check if answer contain tags
      let d = jsonParse(output);
      console.log(d);
      if (d != null) {
        let data = await getSupabaseData(d, interestedLocations.join(","));
        console.log(data);
        if (data != null && "primaryData" in data) {
          setPrimary(data["primaryData"]);
          if ("tangentialData" in data && data["tangentialData"] != null) {
            setTangential(data["tangentialData"]);
          }
          setChatHistory([
            ...newChatHistory,
            {
              text: `I think the primary dataset you're interested in has tag ${d["primary_tag"]}. Tangential datasets have tags: ${d["tangential_tags"]}`,
              isChatOwner: false,
              sentAt: new Date(),
            } as ChatMessage,
          ]);
        }
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
    } else {
      setChatHistory([
        ...newChatHistory,
        {
          text: "I'm sorry, but we couldn't find any data results for that query. Please try again.",
          isChatOwner: false,
          sentAt: new Date(),
        } as ChatMessage,
      ]);
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

  // useEffect(() => {
  //   if (chatHistory.length % 2 == 0 && chatHistory.length > 0) {
  //     console.log("calling addQueries", chatHistory, interestedLocations);
  //     addQueries(chatHistory, interestedLocations);
  //   }
  // }, [chatHistory]);

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
            <MetadataTable data={primaryData} paginate={true} />
          </div>
          <hr />
          <div className="p-4 overflow-auto">
            <h2 className="text-2xl font-semi-bold p-2">Tangential Data</h2>
            <MetadataTable data={tangentialData} paginate={true} />
          </div>
        </div>
      </div>
    </div>
  );
}
