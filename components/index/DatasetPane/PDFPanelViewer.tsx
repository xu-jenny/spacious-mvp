"use client";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import React, { useRef } from "react";
import "react-pdf-highlighter/dist/style.css";
import {
    Highlight,
    PdfHighlighter,
    PdfLoader,
    Popup,
    Tip,
} from "react-pdf-highlighter";
import { Spinner } from "flowbite-react/components/Spinner";
import { LaserfichePageResult } from "@/app/search/search";

const getNextId = () => String(Math.random()).slice(2);

const parseIdFromHash = () =>
    document.location.hash.slice("#highlight-".length);

const resetHash = () => {
    document.location.hash = "";
};

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

const getBbox = (arr: number[], page: number, docBbox: number[]) => ({
    "content": { "text": "text" },
    "position": {
        "boundingRect": {
            "x1": arr[0],
            "y1": arr[1],
            "x2": arr[2],
            "y2": arr[3],
            "width": docBbox[2],    // TODO: add safety check prior
            "height": docBbox[3],
            "pageNumber": page
        },
        "rects": [{
            "x1": arr[0],
            "y1": arr[1],
            "x2": arr[2],
            "y2": arr[3],
            "width": docBbox[2],
            "height": docBbox[3],
            "pageNumber": page
        }],
        "pageNumber": page
    },
    "comment": { "text": "", "emoji": "" },
    "id": getNextId(),
})

const PDFPanelViewer: React.FC<PdfViewerProps> = ({ fileUrl, pagesToJump, docBbox }) => {
    const initalHighlights = pagesToJump
        .map((pageResult: LaserfichePageResult) => {
            if (pageResult.bbox != null) {
                return getBbox(pageResult.bbox, pageResult.page, docBbox);
            }
            return undefined; 
        })
        .filter((highlight) => highlight !== undefined);
    const containerRef = useRef<HTMLDivElement>(null);

    const includedPages = pagesToJump.map((pg) => pg.page);

    const handleJumpToPage = (page: number) => {
        const pageElement = document.querySelector(`[data-page-number="${page}"]`);
        if (pageElement) {
            pageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            console.log('Page element not found');
        }
    };
    return (
        <div style={{ height: "80vh", width: "75vw", position: "relative" }}>
            <div className="p-2">
                Potential Matches:{' '}
                {includedPages.map((page) => (
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
                style={{ position: "absolute", top: '7rem', left: 0, right: 0, bottom: 0 }}
            >
                <PdfLoader url={fileUrl} beforeLoad={<Spinner />} >
                    {(pdfDocument) => {
                        return (
                            <PdfHighlighter
                                pdfDocument={pdfDocument}
                                enableAreaSelection={(event) => event.altKey}
                                onScrollChange={resetHash}
                                scrollRef={(scrollTo) => {
                                    console.log(scrollTo)
                                }}
                                highlightTransform={(
                                    highlight,
                                    index,
                                    setTip,
                                    hideTip,
                                    viewportToScaled,
                                    screenshot,
                                    isScrolledTo,
                                ) => {
                                    const component =
                                        <Highlight
                                            isScrolledTo={isScrolledTo}
                                            position={highlight.position}
                                            comment={highlight.comment}
                                        />

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
                                highlights={initalHighlights}
                                onSelectionFinished={(
                                    position,
                                    content,
                                    hideTipAndSelection,
                                    transformSelection,
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
    );
};



export default PDFPanelViewer