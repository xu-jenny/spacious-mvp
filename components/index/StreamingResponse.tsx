import {
  LaserfichePageResult,
  LaserficheSearchResult,
} from "@/app/search/search";
import { Card, Textarea } from "flowbite-react";
import React from "react";
import { useState, forwardRef, useImperativeHandle } from "react";

interface ChildProps {}

export interface StreamingResponseRef {
  startStream: {
    url: string;
    body: { query: string; location: string };
    setData: (data: any[]) => void;
  };
}

const SimpleFormatter = ({ text }: { text: string }) => {
  // Replace ** with strong tags
  const formattedText = text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`(.*?)`/g, "<code>$1</code>");

  return (
    <div
      className="whitespace-pre-wrap"
      dangerouslySetInnerHTML={{ __html: formattedText }}
    />
  );
};

const StreamingResponse = forwardRef<StreamingResponseRef, ChildProps>(
  (props, ref) => {
    const [response, setResponse] = useState("");
    const [source, setSource] = useState<string[] | null>(null);
    const [searchData, setSearchData] = useState<
      LaserficheSearchResult[] | null
    >(null);

    useImperativeHandle(ref, () => ({
      startStream: async (
        url: string,
        body: { query: string; location: string },
        setData: (data: any[]) => void
      ) => {
        try {
          console.log("start streaming", url, body);
          const res = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
              "x-api-key": process.env.NEXT_PUBLIC_BACKEND_API_KEY ?? "",
            },
            body: JSON.stringify(body),
          });
          setResponse("");

          const reader = res.body.getReader();
          const decoder = new TextDecoder();

          let results: LaserficheSearchResult[] = [];
          let buffer = "";
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            // Append new chunk to buffer
            buffer += decoder.decode(value, { stream: true });

            // Split buffer into complete messages
            const messages = buffer.split("\n\n");
            // Keep the last potentially incomplete message in buffer
            buffer = messages.pop() || "";

            for (const message of messages) {
              if (!message.trim()) continue;

              try {
                const eventData = JSON.parse(message);
                console.log(
                  "Received message type:",
                  eventData.type,
                  eventData.type === "stream_source"
                );
                if (eventData.type === "data_chunk") {
                  results.push(...eventData.data);
                  console.log(
                    `\tProcessed chunk. Total results: ${results.length}`
                  );
                } else if (eventData.type === "data_complete") {
                  console.log("Completed all data chunks stream", results);
                  setData(results);
                } else if (eventData.type === "stream") {
                  setResponse((prev) => prev + eventData.data);
                } else if (eventData.type === "stream_complete") {
                  console.log(eventData.data);
                  setSource(eventData.data);
                } else if (eventData.type === "error") {
                  console.error("Stream error:", eventData.data);
                }
              } catch (e) {
                console.error("Parse error:", e);
                console.log("Message length:", message.length);
                console.log("Raw message:", message);
              }
            }
          }
        } catch (error) {
          console.error("Streaming error:", error);
        }
      },
    }));

    return (
      <>
        {response && (
          <Card className="w-full mx-auto">
            <SimpleFormatter text={response} />
            {source && (
              <div>
                <hr />
                <h3 className="my-2">Sources:</h3>
                {source.map((s, i) => (
                  <p key={s[0]} className="p-2">
                    {i + 1}. <a>{s[0]}</a>: {s[1]}
                  </p>
                ))}
              </div>
            )}
          </Card>
        )}
      </>
    );
  }
);

StreamingResponse.displayName = "StreamingResponse";
export default StreamingResponse;
