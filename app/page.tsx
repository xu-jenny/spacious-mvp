"use client";

import { post } from "@/utils/http";
import { useState } from "react";

export default function Home() {
  let [message, setMessage] = useState("");

  const handleSubmit = async () => {
    console.log("submit", message);
    let response = await post("/api/location", {
      address: message,
      radius: 2000,
    });
    console.log(response);
  };

  const handleEnter = (e: any) => {
    if (e.key === "Enter" && message) {
      handleSubmit();
    } else if (e.key == "Enter") {
      e.preventDefault();
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <input
          type="search"
          id="default-search"
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleEnter}
          className="block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          placeholder="Search Mockups, Logos..."
          required
        />
        <button
          type="submit"
          onClick={() => handleSubmit()}
          className="text-white absolute right-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
          Search
        </button>
      </div>
    </main>
  );
}
