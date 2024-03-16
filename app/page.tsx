"use client";
import React, { useState } from "react";
import "react-sliding-pane/dist/react-sliding-pane.css";
import DatasetCard from "@/components/index/DatasetCard";
import DatasetPane from "@/components/index/DatasetPane";
import EditTagButton, {
  USDatasetSource,
} from "@/components/index/EditTagButton";
import { DatasetMetadata } from "@/components/MetadataTable";
import SlidingPane from "react-sliding-pane";
import { PaginatedList } from "react-paginated-list";
import DebouncedInput from "@/components/common/DebouncedInput";
import { Spinner } from "flowbite-react";

export default function Home() {
  const [primaryData, setPrimary] = useState<any[]>([]);
  const [interestedLocations, setLocations] = useState<string>("United States");
  const [loading, setLoading] = useState<boolean>(false);
  const [openPanel, setOpenPanel] = useState(false);
  const [currentds, setCurrentds] = useState<DatasetMetadata | null>(null);
  const [dsSource, setDsSource] = useState<USDatasetSource | null>(null);
  const [domain, setDomain] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function setDatasetSelected(ds: DatasetMetadata) {
    setCurrentds(ds);
    setOpenPanel(true);
  }

  return (
    <div className="grid grid-cols-6 h-[100vh]">
      <div className="col-span-1 bg-sky-200 prose">
        {/* <LocationInput setLocations={setLocations} /> */}
        <div className="p-2">
          <h3>Set Location</h3>
          <DebouncedInput
            placeholder="City/State/Region"
            onChange={setLocations}
          />
        </div>
        <h2 className="fixed bottom-5 left-4">Spacious AI</h2>
      </div>
      <div className="col-span-5 flex h-[100vh]">
        {/* <div className="w-1/2 flex flex-col h-full">
          <ChatBox chatHistory={chatHistory} loading={loading} />
          {error != null && <span className="text-red ml-7">{error}</span>}
          <ChatInput sendANewMessage={onNewMessage} />
        </div> */}
        <div className="w-full bg-sky-50 overflow-auto p-2">
          <EditTagButton
            location={interestedLocations}
            setPrimaryData={setPrimary}
            dsSource={dsSource}
            domain={domain}
            setLoading={setLoading}
          />
          {
            loading ? (
              <div className="ml-20 mt-20">
                <Spinner />
              </div>
            ) : primaryData != null && primaryData.length > 0 ? (
              <PaginatedList
                list={primaryData}
                itemsPerPage={20}
                renderList={(list: Array<any>) => (
                  <>
                    {list.map((data, i) => (
                      <DatasetCard
                        key={i}
                        dataset={data}
                        index={i}
                        setSelectedDataset={setDatasetSelected}
                      />
                    ))}
                  </>
                )}
              />
            ) : (
              <p>
                There are no results matching your search, try removing some
                filters or request data through this form
              </p>
            )
            // primaryData.map((data, i) => (
            //   <DatasetCard
            //     key={i}
            //     dataset={data}
            //     index={i}
            //     setSelectedDataset={setDatasetSelected}
            //   />
            // ))
          }
        </div>
      </div>
      {currentds != null && (
        <SlidingPane
          isOpen={openPanel}
          width="70%"
          onRequestClose={() => {
            setOpenPanel(false);
          }}>
          <div>
            <DatasetPane
              dsMetadata={currentds}
              id={currentds.id}
              openModal={openPanel}
              setOpenModal={setOpenPanel}
            />
          </div>
        </SlidingPane>
      )}
    </div>
  );
}

/*
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
*/
