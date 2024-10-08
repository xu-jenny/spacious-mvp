"use client";

import { LaserficheSearchResult } from "@/app/search/search";
import { logTableInteraction } from "@/utils/supabaseLogger";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";

import { Document, Page } from "react-pdf";

interface PdfViewerProps {
  fileUrl: string;
  pagesToJump: number[];
}

export const PDFPanelViewer: React.FC<PdfViewerProps> = ({ fileUrl, pagesToJump }) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [fileData, setFileData] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);

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
          top: pageElement.offsetTop - pageElement.getBoundingClientRect().height,
          behavior: 'smooth',
        });
      }
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    const fetchPDF = async () => {
      try {
        const response = await fetch(fileUrl, {
          headers: {
            Range: "bytes=0-10000000",
          },
          signal,
        });
        const blob = await response.blob();
        const objectURL = URL.createObjectURL(blob);
        setFileData(objectURL);
      } catch (error) {
        console.error('Error fetching the PDF:', error);
      }
    };
    fetchPDF();
  }, [fileUrl]);

  // IntersectionObserver to detect current page in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Sort entries by visibility so the most visible page is handled first
        const visiblePages = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visiblePages.length > 0) {
          const mostVisiblePage = visiblePages[0];
          const pageNumber = Number(mostVisiblePage.target.getAttribute('data-page-number'));
          setCurrentPage(pageNumber);
        }
      },
      {
        root: containerRef.current,
        threshold: [0.25, 0.5, 0.75], // Trigger when at least 25%, 50%, or 75% of a page is visible
      }
    );

    pageRefs.current.forEach((pageRef) => {
      if (pageRef) observer.observe(pageRef);
    });

    return () => {
      observer.disconnect();
    };
  }, [numPages]);

  return (
    <div>
      <div className="p-2">
        Potential Matches:{' '}
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
      <header style={{ padding: '10px', textAlign: 'center' }}>
        <h4>
          Page {currentPage} of {numPages || 'Loading...'}
        </h4>
      </header>
      <div
        ref={containerRef}
        className="m-2 w-fit flex ml-auto mr-auto"
        style={{
          height: '80vh',
          overflowY: 'scroll',
          border: '1px solid #ccc',
        }}
      >
        {fileData && (
          <Document file={fileUrl} onLoadSuccess={onDocumentLoadSuccess}>
            {numPages &&
              Array.from(new Array(numPages), (el, index) => (
                <div
                  id={`page_${index + 1}`}
                  key={`page_${index + 1}`}
                  ref={(el) => (pageRefs.current[index] = el)}
                  data-page-number={index + 1}
                  className={`flex justify-center h-full`}
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
          {dataset?.metadata != null && displayMetadata(dataset.metadata)}
          <PDFPanelViewer fileUrl={pdfUrl} pagesToJump={pages} />
        </article>
      </div>
    </div>
  );
};
export default PFASDatasetPanel;
