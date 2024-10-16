"use client";
import { useEffect, useRef, useState } from "react";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import { Document, Page } from "react-pdf";

import { createWorker } from 'tesseract.js';

interface PdfViewerProps {
    fileUrl: string;
    pagesToJump: number[];
}


const PDFPanelViewer: React.FC<PdfViewerProps> = ({ fileUrl, pagesToJump }) => {
    const [numPages, setNumPages] = useState<number | null>(null);
    const [fileData, setFileData] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
    const [highlights, setHighlights] = useState<{ [key: number]: Array<{ left: number; top: number; width: number; height: number }> }>({});

    const handleOCR = async (canvas: HTMLCanvasElement, pageNumber: number) => {
        const worker = await createWorker('eng');     // TODO: create one worker only
        const ret = await worker.recognize(canvas);
        
        console.log(pageNumber)
        console.log(ret.data);
        const viewport = canvas.getContext("2d")?.getTransform();
        let boundingBoxes: { left: any; top: any; width: number; height: number; }[] = []
        ret.data.words.forEach((word: any) => {
            if(word.text.toLowerCase().includes('copper')){
                console.log("found matching word")
                boundingBoxes.push({
                    left: word.bbox.x0 * (viewport?.a ?? 1),
                    top: word.bbox.y0 * (viewport?.d ?? 1),
                    width: (word.bbox.x1 - word.bbox.x0) * (viewport?.a ?? 1),
                    height: (word.bbox.y1 - word.bbox.y0) * (viewport?.d ?? 1),
                })
            }
        });
        setHighlights((prev) => ({
            ...prev,
            [pageNumber]: boundingBoxes,
        }));

        console.log('Bounding boxes for page', pageNumber, boundingBoxes);
        await worker.terminate();
    };

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
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

    const handleRenderSuccess = (page: number) => {
        if (pagesToJump.includes(page - 1)) {
            const canvas = document.querySelector(`#page_${page} canvas`) as HTMLCanvasElement;
            if (canvas) {
                handleOCR(canvas, page); // Pass the canvas element to the OCR handler
            }
        }
    };

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
                    Page {currentPage + 1} of {numPages || 'Loading...'}
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
                                    id={`page_${index}`}
                                    key={`page_${index}`}
                                    ref={(el) => (pageRefs.current[index] = el)}
                                    data-page-number={index}
                                    className={`flex justify-center h-full`}
                                >
                                    <Page
                                        pageNumber={index + 1}
                                        renderTextLayer={false}
                                        renderAnnotationLayer={false}
                                        onRenderSuccess={() => handleRenderSuccess(index)}
                                        className="ml-auto mr-auto"
                                    />
                                    {highlights[index + 1] && highlights[index + 1].map((box, i) => (
                                        <div
                                            key={i}
                                            style={{
                                                position: 'absolute',
                                                left: `${box.left}px`,
                                                top: `${box.top}px`,
                                                width: `${box.width}px`,
                                                height: `${box.height}px`,
                                                backgroundColor: 'rgba(255, 255, 0, 0.5)', // Highlight color
                                            }}
                                        />
                                    ))}
                                </div>
                            ))}
                    </Document>

                )}
            </div>
        </div>
    );
};

export default PDFPanelViewer