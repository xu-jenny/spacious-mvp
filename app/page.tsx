"use client";

import MetadataTable from "@/components/MetadataTable";
import ChatInput, { ChatMessage } from "@/components/index/ChatInput";
import { post } from "@/utils/http";
import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { jsonParse } from "@/utils/json";
import {
  IFormInput,
  getSupabaseData,
  parseLocationFormInput,
} from "./indexUtils";
import ChatBox from "@/components/index/ChatBox";
import LocationInput from "@/components/index/LocationInput";

export default function Home() {
  let [primaryData, setPrimary] = useState([]);
  let [tangentialData, setTangential] = useState([]);
  let [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  let [locationFormValues, setLocationFormValues] = useState<IFormInput>({
    address: "",
    region: "",
    latitude: 0,
    longitude: 0,
    radius: 0,
    message: "",
  });
  let [locations, setLocations] = useState<string[] | null>(null);

  const chatWithAgent = async (
    message: ChatMessage,
    interestedLocations: string[]
  ) => {
    let newChatHistory = [...chatHistory, message];
    setChatHistory(newChatHistory);
    let response = await post("http://127.0.0.1:5000/chat", {
      query: message,
      chatHistory: newChatHistory,
    });
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
    }
  };

  const { register, handleSubmit } = useForm<IFormInput>();
  const onSubmit: SubmitHandler<IFormInput> = async (data: IFormInput) => {
    console.log(data);
    const isSameAsPreviousSubmit = Object.keys(data)
      .filter((fieldName) => fieldName !== "message")
      .every((fieldName) => {
        // @ts-ignore
        return data[fieldName] === locationFormValues[fieldName];
      });

    let interestedLocations = null;
    if (isSameAsPreviousSubmit == false) {
      interestedLocations = await parseLocationFormInput(data);
      setLocationFormValues(data);
      setLocations(interestedLocations);
    } else {
      interestedLocations = locations;
    }
    if (interestedLocations != null) {
      console.log(
        "calling chatWithAgent with ",
        interestedLocations,
        data["message"]
      );
      chatWithAgent(
        {
          sentAt: new Date(),
          isChatOwner: true,
          text: data["message"],
        },
        interestedLocations
      );
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <div className="w-1/2 bg-sky-50 overflow-auto">
        <div className="p-4">
          <h2 className="text-2xl font-semi-bold p-2">Primary Data</h2>
          <MetadataTable data={primaryData} paginate={true} />
        </div>
        <hr />
        <div className="p-4">
          <h2 className="text-2xl font-semi-bold p-2">Tangential Data</h2>
          <MetadataTable data={tangentialData} paginate={true} />
        </div>
      </div>
      <div className="w-[2px] bg-gray-200"></div>
      <div className="w-1/2">
          <LocationInput />
          <hr />
          <ChatBox chatHistory={chatHistory} />
          <ChatInput register={register} />
      </div>
    </div>
  );
}
