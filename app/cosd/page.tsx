"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type WorkerInstance = Worker | null;
export default function Page() {
  // const [downloadState, setDownloadState] = useState<boolean>(false);
  const [text1, setText1] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [result, setResult] = useState<boolean | null>(null);
  const [ready, setReady] = useState<boolean | null>(null);

  const worker = useRef<WorkerInstance>(null);

  // We use the `useEffect` hook to set up the worker as soon as the `App` component is mounted.
  useEffect(() => {
    if (!worker.current) {
      worker.current = new Worker(new URL("./worker.tsx", import.meta.url), {
        type: "module",
      });
    }

    // Create a callback function for messages from the worker thread.
    const onMessageReceived = (e: MessageEvent) => {
      console.log(e.data.status);
      switch (e.data.status) {
        case "initiate":
          setReady(false);
          break;
        case "ready":
          setReady(true);
          break;
        case "complete":
          setReady(true);
          setResult(e.data.output);
          break;
      }
    };

    // Attach the callback function as an event listener.
    worker.current.addEventListener("message", onMessageReceived);

    // Define a cleanup function for when the component is unmounted.
    return () =>
      worker.current?.removeEventListener("message", onMessageReceived);
  });

  const classify = useCallback((text1: string, text2: string) => {
    if (worker.current) {
      worker.current.postMessage({ text1, text2 });
    }
  }, []);

  const handleSubmit = () => {
    if (newMessage && newMessage.length > 0 && text1 && text1.length > 0) {
      classify(text1, newMessage);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    // <div>
    //   <h2>Hello</h2>
    //   <div className="w-3/4 h-[50vh] overflow-auto">
    //     {downloadState == true && (
    //       <iframe
    //         src="/downloaded-file.html"
    //         className="p-4 w-full h-full"
    //       ></iframe>
    //     )}
    //   </div>
    //   <button onClick={fetchData}>Chat with Agent</button>
    // </div>
    <main className="flex min-h-screen flex-col items-center justify-center p-12">
      <h2 className="text-2xl mb-4 text-center">
        Find similiar between 2 texts
      </h2>

      <input
        className="w-full max-w-xs p-2 border border-gray-300 rounded mb-4"
        type="text"
        placeholder="Enter text here"
        onChange={(e) => setText1(e.target.value)}
        value={text1}
        onKeyDown={handleKeyDown}
      />

      <input
        className="w-full max-w-xs p-2 border border-gray-300 rounded mb-4"
        type="text"
        placeholder="Enter text here"
        onChange={(e) => setNewMessage(e.target.value)}
        value={newMessage}
        onKeyDown={handleKeyDown}
      />
      <button onClick={() => handleSubmit()}>Calculate Distance</button>

      <pre className="bg-gray-100 p-2 rounded">
        {!ready || !result ? "Loading..." : JSON.stringify(result, null, 2)}
      </pre>
    </main>
  );
}
