"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export default function Page() {
  // const [downloadState, setDownloadState] = useState<boolean>(false);
  const [result, setResult] = useState<boolean | null>(null);
  const [ready, setReady] = useState<boolean | null>(null);

  // useEffect(() => {
  //   const fetchData = async () => {
  //     let response = await fetch("/api/test")
  //     const data = await response.json();
  //     setDownloadState(true)
  //     console.log(data, downloadState)
  //   };
  //   fetchData()
  // }, []);

  const worker = useRef(null);

  // We use the `useEffect` hook to set up the worker as soon as the `App` component is mounted.
  useEffect(() => {
    if (!worker.current) {
      // Create the worker if it does not yet exist.
      worker.current = new Worker(new URL("./worker.tsx", import.meta.url), {
        type: "module",
      });
    }

    // Create a callback function for messages from the worker thread.
    const onMessageReceived = (e) => {
      /* TODO: See below */
      console.log(e.message);
      console.log(e.output);
    };

    // Attach the callback function as an event listener.
    worker.current.addEventListener("message", onMessageReceived);

    // Define a cleanup function for when the component is unmounted.
    return () =>
      worker.current.removeEventListener("message", onMessageReceived);
  });

  const classify = useCallback((text: string) => {
    if (worker.current) {
      worker.current.postMessage({ text });
    }
  }, []);

  const onMessageReceived = (e) => {
    switch (e.data.status) {
      case "initiate":
        setReady(false);
        break;
      case "ready":
        setReady(true);
        break;
      case "complete":
        setResult(e.data.output[0]);
        break;
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
      <h1 className="text-5xl font-bold mb-2 text-center">Transformers.js</h1>
      <h2 className="text-2xl mb-4 text-center">Next.js template</h2>

      <input
        className="w-full max-w-xs p-2 border border-gray-300 rounded mb-4"
        type="text"
        placeholder="Enter text here"
        onInput={(e) => {
          classify(e.target.value);
        }}
      />

      {ready !== null && (
        <pre className="bg-gray-100 p-2 rounded">
          {!ready || !result ? "Loading..." : JSON.stringify(result, null, 2)}
        </pre>
      )}
    </main>
  );
}
