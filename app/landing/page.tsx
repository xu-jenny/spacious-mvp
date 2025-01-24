"use client";
import React, { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import { EB_Garamond } from "@next/font/google";
import { Duru_Sans } from "@next/font/google";
import { FiSearch, FiArrowRight } from "react-icons/fi";
import Image from "next/image";
const ebGaramond = EB_Garamond({ subsets: ["latin"], weight: ["400", "700"] });
const duruSans = Duru_Sans({ subsets: ["latin"], weight: ["400"] });

const searchQueries = [
  "Show me all NOVs issued in Durham County.",
  "Find groundwater permit violations in Wake County.",
  "List facilities in Orange County with stormwater violations.",
  "Identify sites in North Carolina with recent EPA actions.",
  "Search for hazardous waste permits in Mecklenburg County.",
];

// Query Animation Component
const QueryTypingAnimation = () => {
  const [queryIndex, setQueryIndex] = useState(0);
  const [typedQuery, setTypedQuery] = useState("");

  useEffect(() => {
    const currentQuery = searchQueries[queryIndex];
    let charIndex = 0;
    let animationFrame: number;

    const typeCharacters = () => {
      if (charIndex < currentQuery.length) {
        // Only add the character if it exists
        const nextChar = currentQuery[charIndex];
        if (nextChar !== undefined) {
          setTypedQuery((prev) => prev + nextChar);
        }
        charIndex++;
        animationFrame = requestAnimationFrame(typeCharacters);
      } else {
        setTimeout(() => {
          setQueryIndex((prev) => (prev + 1) % searchQueries.length);
          setTypedQuery("");
        }, 2000);
      }
    };

    typeCharacters();

    return () => {
      cancelAnimationFrame(animationFrame);
      setTypedQuery("");
    };
  }, [queryIndex]);

  return (
    <div className="relative mt-6 w-full max-w-xl h-12 bg-white rounded-lg shadow-md flex items-center px-6 overflow-hidden">
      <FiSearch />
      <div className="ml-4 text-gray-700">{typedQuery}</div>
    </div>
  );
};

// Pipeline Animation Component
const DataPipelineAnimation: React.FC = () => {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <style>{`
		  .platform-icon {
			width: 80px;
			height: 80px;
			position: absolute;
			background: white;
			border-radius: 8px;
			box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
			display: flex;
			align-items: center;
			justify-content: center;
		  }
  
		  .path {
			fill: none;
			stroke: #E5E7EB;
			stroke-width: 8;
		  }
  
		  .dot {
			fill: #2563EB;
			animation: moveDot 3s linear infinite;
		  }
  
		  @keyframes moveDot {
			0% {
			  offset-distance: 0%;
			}
			100% {
			  offset-distance: 100%;
			}
		  }
		`}</style>

      <div className="relative h-[200px]">
        <svg width="100%" height="100%" viewBox="0 0 400 200">
          {/* Paths */}
          <path className="path" d="M5,100 C80,50 150,50 200,0" />
          <path className="path" d="M200,100 C200,50 200,50 200,0" />
          <path className="path" d="M395,100 C320,50 250,50 200,0" />

          {/* Animated dots */}
          <circle
            className="dot"
            r="6"
            style={{ offsetPath: 'path("M5,100 C80,50 150,50 200,0")' }}
          />
          <circle
            className="dot"
            r="6"
            style={{
              offsetPath: 'path("M200,100 C200,50 200,50 200,0")',
              animationDelay: "1s",
            }}
          />
          <circle
            className="dot"
            r="6"
            style={{
              offsetPath: 'path("M395,100 C320,50 250,50 200,0")',
              animationDelay: "2s",
            }}
          />
        </svg>

        {/* Source Icons */}
        <div
          className="platform-icon"
          style={{
            top: "105px", // Matches the start of the left path
            left: "5px",
            transform: "translate(-50%, -10%)",
          }}
        >
          <Image
            src="/deq-logo 1.png"
            alt="NC DEQ"
            width={200}
            height={50}
            className="w-24 h-24 object-contain"
          />
        </div>
        <div
          className="platform-icon"
          style={{
            top: "105px", // Matches the start of the middle path
            left: "200px",
            transform: "translate(-50%, -10%)",
          }}
        >
          <Image
            src="/usgs_logo_navy_blue 1.png"
            alt="USGS"
            width={200}
            height={50}
            className="w-24 h-24 object-contain"
          />
        </div>
        <div
          className="platform-icon"
          style={{
            top: "105px", // Matches the start of the right path
            left: "395px",
            transform: "translate(-50%, -10%)",
          }}
        >
          <Image
            src="/nc_one_logo_navy_blue 1.png"
            alt="NC OneMap"
            width={200}
            height={50}
            className="w-24 h-24 object-contain"
          />
        </div>
      </div>
    </div>
  );
};

export default function Landing() {
  return (
    <div className="bg-[#FFFCF0] min-h-screen">
      <Header />
      <main className="flex flex-col items-center justify-center text-center px-6 pt-24">
        <h1 className="text-[85px] leading-[1.1] text-black font-serif">
          Find Environmental <br />
          Compliance Data <br />
          in <span className="font-bold">Seconds</span>
        </h1>
        <p className="text-[25px] text-gray-600 mt-4">
          Access data across North Carolina public sources
        </p>

        {/* Query Typing Animation */}

        <QueryTypingAnimation />

        {/* Pipeline Section */}
        <div className="relative flex flex-col items-center mb-2">
          <DataPipelineAnimation />
        </div>

        {/* Buttons */}
        <div className="relative mt-6 w-auto max-w-xl h-12 bg-white rounded-lg shadow-md flex items-center overflow-hidden">
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-grow text-gray-700 px-6 h-full focus:outline-none border-none"
          />
          <button className="bg-blue-600 text-white px-6 h-full text-sm font-medium hover:bg-blue-700 transition">
            Join Waitlist
          </button>
        </div>
      </main>
    </div>
  );
}
