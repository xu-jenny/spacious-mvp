"use client";

import { LaserficheSearchResult } from "@/app/search/search";
import { logTableInteraction } from "@/utils/supabaseLogger";
import Link from "next/link";
import { useState } from "react";
import { FcCollapse, FcExpand } from "react-icons/fc";
import PDFPanelViewer from "./PDFPanelViewer";

type Props = {
  dataset: LaserficheSearchResult;
};

const PFASDatasetPanel = ({ dataset }: Props) => {
  const [isMetadataOpen, setIsMetadataOpen] = useState(false);

  const displayMetadata = (md: string) => {
    try {
      const jsonObject: { [key: string]: string } = JSON.parse(
        md.replace(/'/g, '"')
      );

      const additionalMetadata = {
        Owner: dataset?.owner ?? "N/A",
        "Last Updated": dataset?.lastUpdated ?? "N/A",
        "First Published": dataset?.firstPublished ?? "N/A",
      };

      // Combine manually added metadata with the original metadata
      const combinedMetadata = { ...jsonObject, ...additionalMetadata };
      const entries = Object.entries(combinedMetadata);

      return (
        <div className="mt-6">
          <button
            className="flex items-center justify-between mb-4 cursor-pointer"
            onClick={() => setIsMetadataOpen(!isMetadataOpen)}
          >
            <strong>Metadata</strong>
            {isMetadataOpen ? <FcCollapse size={20} /> : <FcExpand size={20} />}
          </button>
          {isMetadataOpen && (
            <div className="grid grid-cols-2 gap-2 mt-2 border p-2 border-gray-200 rounded">
              {entries.map(([key, value]) => (
                <div
                  key={key}
                  className="flex flex-col p-1 border border-gray-100 rounded"
                >
                  <strong className="text-sm font-medium">{key}</strong>
                  <span className="text-sm">{value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    } catch {
      console.error("Failed to parse metadata JSON:", md);

      // If parsing fails, just display Owner, Last Updated, and First Published
      const fallbackMetadata = {
        Owner: dataset?.owner ?? "N/A",
        "Last Updated": dataset?.lastUpdated ?? "N/A",
        "First Published": dataset?.firstPublished ?? "N/A",
      };
      const entries = Object.entries(fallbackMetadata);

      return (
        <div className="mt-6">
          <button
            className="flex items-center justify-between mb-4 cursor-pointer"
            onClick={() => setIsMetadataOpen(!isMetadataOpen)}
          >
            <strong>Metadata</strong>
            {isMetadataOpen ? <FcCollapse size={20} /> : <FcExpand size={20} />}
          </button>
          {isMetadataOpen && (
            <div className="grid grid-cols-2 gap-2 mt-2 border p-2 border-gray-200 rounded">
              {entries.map(([key, value]) => (
                <div
                  key={key}
                  className="flex flex-col p-1 border border-gray-100 rounded"
                >
                  <strong className="text-sm font-medium">{key}</strong>
                  <span className="text-sm">{value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
  };

  const downloadImages = async (imageNames: string[]) => {
    console.log("downloadImages", imageNames);
    let response = await fetch(
      `${process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL}/download-images`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.NEXT_PUBLIC_BACKEND_API_KEY ?? "",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ imageNames }),
      }
    )
      .then((response) => response.blob())
      .catch((error) => {
        console.error(error);
      });

    if (response) {
      const url = window.URL.createObjectURL(response);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "images.zip");
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
  };

  const pdfUrl = `${process.env.NEXT_PUBLIC_S3_LASERFICHE_BUCKET}/${dataset.id}.pdf`;
  console.log(dataset);
  return (
    <div className="flex h-[100vh] z-[1000] top-0 left-0 w-full">
      <div className="w-full flex flex-col h-full">
        <article className="prose p-4 max-w-none">
          <h3>{dataset?.title}</h3>
          <div className="flex items-center space-x-3 mb-4">
            {dataset.id != null && (
              <Link
                href={pdfUrl}
                target="_blank"
                download={dataset?.title}
                className="no-underline text-blue-600"
                onClick={() => {
                  if (process.env.NODE_ENV === "production") {
                    logTableInteraction(
                      "DownloadUrlClick",
                      dataset.id,
                      dataset?.title
                    );
                  }
                }}
              >
                Download PDF
              </Link>
            )}
            {dataset.containsTable && (
              <Link
                href={`${process.env.NEXT_PUBLIC_S3_LASERFICHE_BUCKET}/${dataset.id}.xlsx`}
                target="_blank"
                download={`${dataset?.title}_tables`}
                className="no-underline text-green-500"
                onClick={() => {
                  if (process.env.NODE_ENV === "production") {
                    logTableInteraction(
                      "TableDownload",
                      dataset.id,
                      dataset?.title
                    );
                  }
                }}
              >
                Download All Tables
              </Link>
            )}
            {dataset.originalUrl != null && (
              <Link
                href={dataset.originalUrl}
                target="_blank"
                className="no-underline text-gray-600"
                onClick={() => {
                  if (process.env.NODE_ENV === "production") {
                    logTableInteraction(
                      "OriginalUrlClick",
                      dataset.id,
                      dataset?.title
                    );
                  }
                }}
              >
                Original Url
              </Link>
            )}
            {dataset.images != null && dataset.images.length > 0 && (
              <Link
                href={
                  dataset.images.length === 1
                    ? new URL(
                        `${process.env.NEXT_PUBLIC_S3_LASERFICHE_BUCKET}/images/${dataset.images[0]}`
                      )
                    : "#"
                }
                target="_blank"
                className="no-underline text-gray-600"
                onClick={(e) => {
                  if (dataset.images && dataset.images.length > 1) {
                    e.preventDefault();
                    downloadImages(dataset.images);
                  }
                }}
              >
                Export Images
              </Link>
            )}
          </div>

          {dataset?.facilityName != null && (
            <div className="mb-4">
              <strong>Facility Name:</strong> {dataset?.facilityName}
            </div>
          )}
          {dataset?.metadata != null && displayMetadata(dataset.metadata)}
          <PDFPanelViewer
            fileUrl={pdfUrl}
            pagesToJump={dataset.nodes ?? []}
            docBbox={dataset.page_bbox ?? [0, 0, 612, 792]}
          />
        </article>
      </div>
    </div>
  );
};

export default PFASDatasetPanel;
