"use client";
import React from 'react';
import { pdfjs } from 'react-pdf';
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
import Image from "next/image";

export default function Home() {
  return (
    <div className="relative h-screen flex items-center justify-center bg-black">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/sp.png" // Make sure your image is in the /public folder
          alt="Background"
          layout="fill"
          objectFit="cover"
          quality={100}
          priority
          className="opacity-70"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 text-white text-center space-y-12 px-6">
        <h1 className="text-5xl font-bold">
          Find the government data you need in seconds.
        </h1>

        <div className="flex justify-center space-x-12 text-xl">
          {/* Search with Ease */}
          <div className="max-w-xs">
            <div className="flex justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="h-10 w-10"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 20l5-5m0 0l5 5m-5-5V10m0 0l5-5m-5 5L5 5"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold">Search with Ease</h2>
            <p className="mt-2">
              Search across publicly available datasets with natural language.
            </p>
          </div>

          {/* Determine Relevance */}
          <div className="max-w-xs">
            <div className="flex justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="h-10 w-10"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 20l5-5m0 0l5 5m-5-5V10m0 0l5-5m-5 5L5 5"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold">Determine Relevance</h2>
            <p className="mt-2">
              We use AI to return the most relevant datasets.
            </p>
          </div>

          {/* Direct Access */}
          <div className="max-w-xs">
            <div className="flex justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="h-10 w-10"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 20l5-5m0 0l5 5m-5-5V10m0 0l5-5m-5 5L5 5"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold">Direct Access</h2>
            <p className="mt-2">
              Download directly from Spacious or from the original source.
            </p>
          </div>
        </div>

        {/* Email Form */}
        <div className="flex justify-center mt-6">
          <input
            type="email"
            placeholder="Enter your email"
            className="text-black px-4 py-2 rounded-l-md focus:outline-none w-80"
          />
          <button className="bg-blue-600 text-white px-6 py-2 rounded-r-md hover:bg-blue-700">
            Join waitlist
          </button>
        </div>
      </div>
    </div>
  );
}
