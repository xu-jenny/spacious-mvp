"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { logTableInteraction } from "@/utils/supabaseLogger";
import { PFASSearchResult } from "@/app/search";

import { Document, Page, pdfjs } from "react-pdf";

interface PdfViewerProps {
  fileUrl: string;
  pagesToJump: number[];
}

export const PDFViewer: React.FC<PdfViewerProps> = ({ fileUrl, pagesToJump }) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
      setNumPages(numPages);
  };

  // useEffect(() => {
  //   if (typeof window !== 'undefined') {
  //     pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  //       'pdfjs-dist/build/pdf.worker.min.mjs',
  //       import.meta.url,
  //     ).toString();      
  //   }
  // }, []);

  const handleJumpToPage = (page: number) => {
      if (numPages && page >= 1 && page <= numPages) {
          const pageElement = document.getElementById(`page_${page}`);
          if (pageElement && containerRef.current) {
              containerRef.current.scrollTo({
                  top: pageElement.offsetTop,
                  behavior: 'smooth',
              });
          }
      }
  };

  return (
      <div>
          <div className="p-2">
              Potential Matches: {pagesToJump.map((page) => (
                  <span key={page} onClick={() => handleJumpToPage(page)} className="text-cyan-500 cursor-pointer underline underline-offset-4 mx-2">
                      Page {page}
                  </span>
              ))}
          </div>
          <div
              ref={containerRef}
              className="m-2 w-fit flex ml-auto mr-auto"
              style={{
                  height: '80vh',
                  overflowY: 'scroll',
                  border: '1px solid #ccc',
              }}
          >
              <Document
                  file={fileUrl}
                  onLoadSuccess={onDocumentLoadSuccess}
              >
                  {numPages &&
                      Array.from(new Array(numPages), (el, index) => (
                          <div id={`page_${index + 1}`} key={`page_${index + 1}`} className="flex justify-center mb-2">
                              <Page pageNumber={index + 1} renderTextLayer={false} className="ml-auto mr-auto"/>
                          </div>
                      ))}
              </Document>
          </div>
      </div>
  );
};

type Props = {
  dataset: PFASSearchResult;
};

const PFASDatasetPanel = ({ dataset }: Props) => {
  const displaySummary = (summary: string) => {
    const sentences = summary.match(/[^\.!\?]+[\.!\?]+/g);
    if (!sentences || sentences.length <= 4) {
      return summary;
    }
    return sentences.slice(0, 4).join(" ");
  };

  return (
    <div className="flex h-[100vh]">
      <div className="w-full flex flex-col h-full">
        <article className="prose p-4 max-w-none">
          <h3>{dataset?.title}</h3>
          {dataset.id != null && (
            <Link
              href={"/NCS000050_MONITORING INFO_20181028.pdf"}
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
          <p>Summary: {displaySummary(dataset?.summary)}</p>
          {dataset?.lastUpdated != null && (
            <p>Last updated: {dataset?.lastUpdated}</p>
          )}
          <PDFViewer fileUrl={"/NCS000050_MONITORING INFO_20181028.pdf"} pagesToJump={[6, 12, 30, 44, 66, 86, 95, 112, 129, 131]}/>
        </article>
      </div>
    </div>
  );
};
export default PFASDatasetPanel;
