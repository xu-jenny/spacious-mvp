"use client";

import { LaserficheSearchResult } from "@/app/search";
import { logTableInteraction } from "@/utils/supabaseLogger";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";

import { Document, Page } from "react-pdf";
import { pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

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
  const [renderAllPages, setRenderAllPages] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [startTime, setStartTime] = useState<number>(Date.now());

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    const loadTime = Date.now() - startTime;
    console.log(`First page rendered in ${loadTime} ms.`);
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
    const controller = new AbortController();
    const { signal } = controller;

    const fetchPDF = async () => {
      try {
        console.log("pdf loading");
        const response = await fetch(fileUrl, {
          headers: {
            Range: "bytes=0-10000000",
          },
          signal,
        });
        const blob = await response.blob();
        const objectURL = URL.createObjectURL(blob);
        setFileData(objectURL);

        setStartTime(Date.now());

        setTimeout(() => {
          setRenderAllPages(true);
          console.log(
            `Rendering rest of the pages after ${Date.now() - startTime} ms.`
          );
        }, 500);
      } catch (error) {
        console.error("Error fetching the PDF:", error);
      }
    };
    fetchPDF();
    return () => {
      controller.abort();
    };
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
          <Document
            // options={{
            //   httpHeaders: {
            //     "Content-Type": "application/pdf",
            //     "Accept-Ranges": "bytes",
            //     "Access-Control-Expose-Headers":
            //       "Accept-Ranges , Content-Length, Content-Range",
            //     "Accept-Encoding": "Identity",
            //   },
            // }}
            file={fileUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadProgress={({ loaded, total }) => {
              //   console.log(`Loaded ${loaded} of ${total} bytes`);
            }}
          >
            <Page
              pageNumber={1}
              renderTextLayer={false}
              className="ml-auto mr-auto"
            />
            <Page
              pageNumber={2}
              renderTextLayer={false}
              className="ml-auto mr-auto"
            />
            {renderAllPages &&
              numPages &&
              Array.from(new Array(numPages), (el, index) => (
                <div
                  id={`page_${index + 2}`}
                  key={`page_${index + 2}`}
                  className="flex justify-center mb-2"
                >
                  <Page
                    pageNumber={index + 2}
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
