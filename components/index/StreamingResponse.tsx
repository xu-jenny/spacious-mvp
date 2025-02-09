import { SearchResults } from "@/app/app/page";
import {
  LaserfichePageResult,
  LaserficheSearchResult,
} from "@/app/search/search";
import { useStateContext } from "@/app/StateContext";
import { Card, Spinner, Textarea } from "flowbite-react";
import React from "react";
import { useState, forwardRef, useImperativeHandle } from "react";

export interface StreamingResponseRef {
  startStream: (
    url: string,
    body: { query: string; location: string }
  ) => Promise<void>;
}

interface StreamingResponseProps {
  setDatasetSelected: (ds: SearchResults) => void;
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

const StreamingResponse = forwardRef<
  StreamingResponseRef,
  StreamingResponseProps
>((props, ref) => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState("");
  const [source, setSource] = useState<any[] | null>(null);
  const { state, dispatch } = useStateContext();

  useImperativeHandle(ref, () => ({
    startStream: async (
      url: string,
      body: { query: string; location: string }
    ) => {
      try {
        console.log("start streaming", url, body);
        setLoading(true);
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

        const reader = res.body?.getReader();
        const decoder = new TextDecoder();

        let results: LaserficheSearchResult[] = [];
        let buffer = "";
        while (true && reader != null) {
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
                dispatch({
                  type: "updateSearchResults",
                  payload: results,
                });
              } else if (eventData.type === "stream") {
                setLoading(false);
                setResponse((prev) => prev + eventData.data);
              } else if (eventData.type === "stream_complete") {
                let sourceDocs: any[] = [];
                eventData.data.forEach((d: string[]) => {
                  const correspondingDs = state.searchResult?.filter(
                    (r) => r.id == d[0]
                  )[0];
                  sourceDocs.push([...d, correspondingDs]);
                });
                console.log(sourceDocs);
                setSource(sourceDocs);
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
      {loading && <Spinner className="p-3 mx-auto" />}
      {response && (
        <Card className="w-full mx-auto">
          <SimpleFormatter text={response} />
          {source != null && (
            <div>
              <hr />
              <h3 className="my-2">Sources:</h3>
              {source.map((s, i) => (
                <p key={`${s[0]}-${s[1]}`} className="p-2">
                  {i + 1}.{" "}
                  <a
                    className="underline cursor-pointer sky-500"
                    onClick={() => props.setDatasetSelected(s[s.length - 1])}
                  >
                    {s[0]}, Page {s[1]}
                  </a>
                  : {s[2]}
                </p>
              ))}
            </div>
          )}
        </Card>
      )}
    </>
  );
});

StreamingResponse.displayName = "StreamingResponse";
export default StreamingResponse;
