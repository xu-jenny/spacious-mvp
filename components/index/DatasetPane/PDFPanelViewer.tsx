"use client";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import React, { useEffect, useRef, useState } from "react";
import "react-pdf-highlighter/dist/style.css";
import {
  Highlight,
  IHighlight,
  PdfHighlighter,
  PdfLoader,
  Popup,
  Tip,
} from "react-pdf-highlighter";
import { Spinner } from "flowbite-react/components/Spinner";
import { LaserfichePageResult } from "@/app/search/search";
import { PDFPanelSidebar } from "./PDFPanelSidebar";

const getNextId = () => String(Math.random()).slice(2);

const HighlightPopup = ({
  comment,
}: {
  comment: { text: string; emoji: string };
}) =>
  comment.text ? (
    <div className="Highlight__popup">
      {comment.emoji} {comment.text}
    </div>
  ) : null;

interface PdfViewerProps {
  fileUrl: string;
  pagesToJump: LaserfichePageResult[];
  docBbox: number[];
}

const getBbox = (
  arr: number[],
  page: number,
  docBbox: number[],
  text: string,
  id: string
) => ({
  id,
  content: { text },
  position: {
    boundingRect: {
      x1: arr[0],
      y1: arr[1],
      x2: arr[2],
      y2: arr[3],
      width: docBbox[2], // TODO: add safety check prior
      height: docBbox[3],
      pageNumber: page,
    },
    rects: [
      {
        x1: arr[0],
        y1: arr[1],
        x2: arr[2],
        y2: arr[3],
        width: docBbox[2],
        height: docBbox[3],
        pageNumber: page,
      },
    ],
    pageNumber: page,
  },
  comment: { text: "", emoji: "" },
});

const PDFPanelViewer: React.FC<PdfViewerProps> = ({
  fileUrl,
  pagesToJump,
  docBbox,
}) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const containerRef = useRef<HTMLDivElement>(null);

  let highlights: Array<IHighlight> = [];
  const texts = pagesToJump
    .map((pageResult: LaserfichePageResult) => {
      const id = getNextId();
      if (pageResult.bbox != null) {
        highlights.push(
          getBbox(
            pageResult.bbox,
            pageResult.page,
            docBbox,
            pageResult.text,
            id
          )
        );
      }
      return {
        id,
        text: pageResult.text,
        page: pageResult.page,
      };
    })
    .filter((highlight) => highlight !== undefined || highlight != null);

  const handleJumpToPage = (page: number) => {
    const pageElement = document.querySelector(`[data-page-number="${page}"]`);
    if (pageElement) {
      pageElement.scrollIntoView({ behavior: "smooth", block: "start" });
      setCurrentPage(page); // Update current page on jump
    } else {
      console.log("Page element not found");
    }
  };

  return (
    <>
      <div className="flex flex-row top-0 left-0 w-full relative overflow-hidden">
        <div className="flex flex-row w-full">
          <div className="w-1/4">
            <PDFPanelSidebar
              texts={texts}
              handleJumpToPage={handleJumpToPage}
            />
          </div>
          <div
            ref={containerRef}
            className="overflow-y-scroll w-3/4 absolute left-1/4 top-0 h-full"
          >
            <PdfLoader url={fileUrl} beforeLoad={<Spinner />}>
              {(pdfDocument) => {
                // setTotalPages(pdfDocument.numPages); // Set total number of pages
                return (
                  <PdfHighlighter
                    pdfDocument={pdfDocument}
                    enableAreaSelection={(event) => event.altKey}
                    onScrollChange={() => console.log()}
                    scrollRef={(scrollTo) => {
                      console.log(scrollTo);
                    }}
                    highlightTransform={(
                      highlight,
                      index,
                      setTip,
                      hideTip,
                      viewportToScaled,
                      screenshot,
                      isScrolledTo
                    ) => {
                      const component = (
                        <Highlight
                          isScrolledTo={isScrolledTo}
                          position={highlight.position}
                          comment={highlight.comment}
                        />
                      );

                      return (
                        <Popup
                          popupContent={<HighlightPopup {...highlight} />}
                          onMouseOver={(popupContent) =>
                            setTip(highlight, (highlight) => popupContent)
                          }
                          onMouseOut={hideTip}
                          key={index}
                        >
                          {component}
                        </Popup>
                      );
                    }}
                    highlights={highlights}
                    onSelectionFinished={(
                      position,
                      content,
                      hideTipAndSelection,
                      transformSelection
                    ) => (
                      <Tip
                        onOpen={transformSelection}
                        onConfirm={(comment) => {
                          console.log({ content, position, comment });
                          hideTipAndSelection();
                        }}
                      />
                    )}
                  />
                );
              }}
            </PdfLoader>
          </div>
        </div>
      </div>
    </>
  );
};

export default PDFPanelViewer;
