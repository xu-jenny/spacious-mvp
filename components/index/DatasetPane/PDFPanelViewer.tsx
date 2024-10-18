"use client";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import React, { useState, useCallback } from "react";
import "react-pdf-highlighter/dist/style.css";
import {
    AreaHighlight,
    Highlight,
    PdfHighlighter,
    PdfLoader,
    Popup,
    Tip,
} from "react-pdf-highlighter";
import type {
    Content,
    IHighlight,
    NewHighlight,
    ScaledPosition,
} from "react-pdf-highlighter";

import { testHighlights as _testHighlights } from "./test-highlights";

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

const initialUrl = "/NCS000050_Fact sheet binder_20230524.pdf";

import { Spinner } from "flowbite-react/components/Spinner";
import { useOCRWorker } from "@/app/hooks/useOcrWorker";
import { createEmbedding } from "@/app/search/indexUtils";
const similarity = require("compute-cosine-similarity");

interface PdfViewerProps {
    fileUrl: string;
    pagesToJump: number[];
    queryEmbedding: Float32Array;
}

const PDFPanelViewer: React.FC<PdfViewerProps> = ({ fileUrl, pagesToJump }) => {
    const worker = useOCRWorker();
    const [highlights, setHighlights] = useState<IHighlight[]>([]);
    const [processedPages, setProcessedPages] = useState<Set<number>>(new Set());

    const handleOCR = useCallback(async (canvas: HTMLCanvasElement, pageNumber: number) => {
        if (!worker) return;
        const queryEmbedding = await createEmbedding("outfalls copper concentration")
        if (pagesToJump.includes(pageNumber) && !processedPages.has(pageNumber)) {
            const startTime = new Date().getTime();
            const ret = await worker.recognize(canvas);
            console.log("finsihed OCR", pageNumber, (new Date().getTime()) - startTime, ret.data)
            let pageLines: { sim: any; text: any; bbox: any; }[] = [];
            for (let i = 0; i < ret.data.length; i++){
                const line = ret.data.lines[i];
                const embedding = await createEmbedding(line.text);
                const sim = similarity(embedding, queryEmbedding)
                pageLines.push({
                    sim: sim,
                    text: line.text,
                    bbox: line.bbox
                })
                if (pageLines.length > 10){
                    break;
                }
            }
            console.log(pageLines)
            console.log(new Date().getTime() - startTime)

            // const words = ret.data.words.map((word: any) => ({
            //     text: word.text.toLowerCase(),
            //     bbox: word.bbox
            // }));

            // const matches = words.filter((word: any) => word.text.includes('copper'));
            // let boundingBoxes: IHighlight[] = matches.map((match: { text?: any; bbox?: any; }) => {
            //     const { bbox } = match;
            //     const scaleX = 1.412;
            //     const scaleY = 1.412;
            //     const x0 = bbox.x0 * scaleX;
            //     const y0 = bbox.y0 * scaleY;
            //     const x1 = bbox.x1 * scaleX;
            //     const y1 = bbox.y1 * scaleY;
    
            //     return {
            //         "content": { "text": match.text },
            //         "position": {
            //             "boundingRect": {
            //                 "x1": x0,
            //                 "y1": y0,
            //                 "x2": x1,
            //                 "y2": y1,
            //                 "width": 866,
            //                 "height": 1120,
            //                 "pageNumber": pageNumber
            //             },
            //             "rects": [{
            //                 "x1": x0,
            //                 "y1": y0,
            //                 "x2": x1,
            //                 "y2": y1,
            //                 "width": 866,
            //                 "height": 1120,
            //                 "pageNumber": pageNumber
            //             }],
            //             "pageNumber": pageNumber
            //         },
            //         "comment": { "text": "initial", "emoji": "💩" },
            //         "id": getNextId(),
            //     };
            // });

            // setHighlights((prev) => [...prev, ...boundingBoxes,]);
            setProcessedPages((prev) => new Set(prev.add(pageNumber)));
            // console.log((new Date().getTime()) - startTime, boundingBoxes);
        }
    }, [pagesToJump, processedPages, worker]);

    const processAllPagesForOCR = useCallback(async (pdfDocument: any) => {
        const numPages = pdfDocument.numPages;
        for (let pageNum = 1; pageNum <= numPages; pageNum++) {
            if (pagesToJump.includes(pageNum)) {
                const page = await pdfDocument.getPage(pageNum);
                const viewport = page.getViewport({ scale: 1 });
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.width = viewport.width;
                canvas.height = viewport.height;

                const renderContext = {
                    canvasContext: context,
                    viewport: viewport,
                };

                await page.render(renderContext).promise;
                handleOCR(canvas, pageNum);
            }
        }
    }, [handleOCR, pagesToJump]);

    const addHighlight = (highlight: NewHighlight) => {
        console.log("Saving highlight", highlight);
        setHighlights((prevHighlights) => [
            { ...highlight, id: getNextId() },
            ...prevHighlights,
        ]);
    };

    const updateHighlight = (
        highlightId: string,
        position: Partial<ScaledPosition>,
        content: Partial<Content>,
    ) => {
        console.log("Updating highlight", highlightId, position, content);
        setHighlights((prevHighlights) =>
            prevHighlights.map((h) => {
                const {
                    id,
                    position: originalPosition,
                    content: originalContent,
                    ...rest
                } = h;
                return id === highlightId
                    ? {
                        id,
                        position: { ...originalPosition, ...position },
                        content: { ...originalContent, ...content },
                        ...rest,
                    }
                    : h;
            }),
        );
    };

    return (
        <div style={{ height: "100vh", width: "75vw", position: "relative" }}>
            <div>{highlights.map(h => <span key={h.id}>[({h.position.boundingRect.x1},{h.position.boundingRect.y1}), ({h.position.boundingRect.x2}, {h.position.boundingRect.y2})]</span>)}</div>
            <PdfLoader url={fileUrl} beforeLoad={<Spinner />}>
                {(pdfDocument) => {
                    processAllPagesForOCR(pdfDocument);
                    return (
                        <PdfHighlighter
                            pdfDocument={pdfDocument}
                            enableAreaSelection={(event) => event.altKey}
                            onScrollChange={resetHash}
                            scrollRef={(scrollTo) => {
                                scrollViewerTo.current = scrollTo;
                                scrollToHighlightFromHash();
                            }}
                            onSelectionFinished={(position, content, hideTipAndSelection, transformSelection) => (
                                <Tip
                                    onOpen={transformSelection}
                                    onConfirm={(comment) => {
                                        addHighlight({ content, position, comment });
                                        hideTipAndSelection();
                                    }}
                                />
                            )}
                            highlightTransform={(highlight, index, setTip, hideTip, viewportToScaled, screenshot, isScrolledTo) => {
                                const isTextHighlight = !highlight.content?.image;
                                const component = isTextHighlight ? (
                                    <Highlight
                                        isScrolledTo={isScrolledTo}
                                        position={highlight.position}
                                        comment={highlight.comment}
                                    />
                                ) : (
                                    <AreaHighlight
                                        isScrolledTo={isScrolledTo}
                                        highlight={highlight}
                                        onChange={(boundingRect) => {
                                            updateHighlight(
                                                highlight.id,
                                                { boundingRect: viewportToScaled(boundingRect) },
                                                { image: screenshot(boundingRect) },
                                            );
                                        }}
                                    />
                                );
                                return (
                                    <Popup
                                        popupContent={<HighlightPopup {...highlight} />}
                                        onMouseOver={(popupContent) => setTip(highlight, () => popupContent)}
                                        onMouseOut={hideTip}
                                        key={index}
                                    >
                                        {component}
                                    </Popup>
                                );
                            }}
                            highlights={highlights}
                        />
                    );
                }}
            </PdfLoader>
        </div>
    );
};


export default PDFPanelViewer