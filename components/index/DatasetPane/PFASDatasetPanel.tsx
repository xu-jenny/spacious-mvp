"use client";

import { LaserficheSearchResult } from "@/app/search/search";
import { logTableInteraction } from "@/utils/supabaseLogger";
import Link from "next/link";
import PDFPanelViewer from "./PDFPanelViewer";

type Props = {
  dataset: LaserficheSearchResult;
};

const PFASDatasetPanel = ({ dataset }: Props) => {
  const displaySummary = (summary: string) => {
    const sentences = summary.match(/[^\.!\?]+[\.!\?]+/g);
    if (!sentences || sentences.length <= 4) {
      return summary;
    }
    return sentences.slice(0, 4).join(" ");
  };

  const displayMetadata = (md: string) => {
    try {
      const jsonObject: { [key: string]: string } = JSON.parse(md.replace(/'/g, '"'));
      const entries = Object.entries(jsonObject);
  
      return (
        <div className="px-2">
          <h2 className="text-lg font-semibold mb-4">Meta data</h2>
          <div className="grid grid-cols-2 gap-4">
            {entries.map(([key, value]) => (
              <div key={key} className="flex flex-col p-2 border border-gray-200 rounded">
                <strong className="text-sm font-medium">{key}</strong>
                <span className="text-sm">{value}</span>
              </div>
            ))}
          </div>
        </div>
      );
    } catch {
      console.error("Failed to parse metadata JSON:", md);
      return null;
    }
  };
  
  
  const pdfUrl = `${process.env.NEXT_PUBLIC_S3_LASERFICHE_BUCKET}/${dataset.id}.pdf`;

  return (
    <div className="flex h-[100vh]">
      <div className="w-full flex flex-col h-full">
        <article className="prose p-4 max-w-none">
          <h3>{dataset?.title}</h3>
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
              className="mx-3 no-underline text-green-500"
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
              href={pdfUrl}
              target="_blank"
              download={dataset?.originalUrl}
              className="no-underline text-grey-600 mx-2"
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
          {/* {dataset?.summary != null && <p>Summary: {displaySummary(dataset?.summary)}</p>} */}
          {dataset?.owner != null && (
            <div className="grid grid-cols-[400px,1fr] items-start gap-2 px-2 pt-2">
              <span><strong>Owner</strong>: {dataset?.owner}</span>
              <span><strong>Facility Name:</strong> {dataset?.facilityName}</span>
            </div>
          )}
          {dataset?.lastUpdated != null && (
            <div className="grid grid-cols-[400px,1fr] items-start gap-2 px-2">
              <span><strong>Last Updated</strong>: {dataset?.lastUpdated}</span>
              <span><strong>First Published:</strong> {dataset?.firstPublished}</span>
            </div>
          )}
          {/* {dataset?.metadata != null && displayMetadata(dataset.metadata)} */}
          <PDFPanelViewer fileUrl={pdfUrl} pagesToJump={dataset.nodes} docBbox={dataset.page_bbox ?? [0, 0, 612, 792]} />
        </article>
      </div>
    </div>
  );
};
export default PFASDatasetPanel;
