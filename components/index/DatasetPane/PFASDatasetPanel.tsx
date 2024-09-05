"use client";

import { LaserficheSearchResult } from "@/app/search/search";
import { logTableInteraction } from "@/utils/supabaseLogger";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { Document, Page } from "react-pdf";

interface PdfViewerProps {
  fileUrl: string;
  pagesToJump: number[];
}

export const PDFPanelViewer: React.FC<PdfViewerProps> = ({
  fileUrl,
  pagesToJump,
}) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [fileData, setFileData] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const handleJumpToPage = (page: number) => {
    if (numPages && page >= 1 && page <= numPages) {
      const pageElement = document.getElementById(`page_${page}`);
      if (pageElement && containerRef.current) {
        containerRef.current.scrollTo({
          top: pageElement.offsetTop - 200,
          behavior: "smooth",
        });
      }
    }
  };

  useEffect(() => {
    const fetchPDF = async () => {
      try {
        const response = await fetch(fileUrl);
        const blob = await response.blob();
        const objectURL = URL.createObjectURL(blob);
        setFileData(objectURL);
      } catch (error) {
        console.error("Error fetching the PDF:", error);
      }
    };

    fetchPDF();
  }, [fileUrl]);

  return (
    <div>
      <div className="p-2">
        Potential Matches:{" "}
        {pagesToJump.map((page) => (
          <span
            key={page}
            onClick={() => handleJumpToPage(page)}
            className="text-cyan-500 cursor-pointer underline underline-offset-4 mx-2"
          >
            Page {page}
          </span>
        ))}
      </div>
      <div
        ref={containerRef}
        className="m-2 w-fit flex ml-auto mr-auto"
        style={{
          height: "80vh",
          overflowY: "scroll",
          border: "1px solid #ccc",
        }}
      >
        {fileData && (
          <Document file={fileUrl} onLoadSuccess={onDocumentLoadSuccess}>
            {numPages &&
              Array.from(new Array(numPages), (el, index) => (
                <div
                  id={`page_${index + 1}`}
                  key={`page_${index + 1}`}
                  className="flex justify-center mb-2"
                >
                  <Page
                    pageNumber={index + 1}
                    renderTextLayer={false}
                    className="ml-auto mr-auto"
                  />
                </div>
              ))}
          </Document>
        )}
      </div>
    </div>
  );
};

type Props = {
  dataset: LaserficheSearchResult;
  pages: number[];
};

const PFASDatasetPanel = ({ dataset, pages = [] }: Props) => {
  const displaySummary = (summary: string) => {
    const sentences = summary.match(/[^\.!\?]+[\.!\?]+/g);
    if (!sentences || sentences.length <= 4) {
      return summary;
    }
    return sentences.slice(0, 4).join(" ");
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
                    "OriginalUrlClick",
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
                  "OriginalUrlClick",
                  dataset.id,
                  dataset?.title
                );
              }
            }}
          >
            Download All Tables
          </Link>
          )}
          {/* {dataset?.summary != null && <p>Summary: {displaySummary(dataset?.summary)}</p>}
          {dataset?.lastUpdated != null && (
            <p>Last updated: {dataset?.lastUpdated}</p>
          )} */}
          <PDFPanelViewer fileUrl={pdfUrl} pagesToJump={pages} />
        </article>
      </div>
    </div>
  );
};
export default PFASDatasetPanel;
