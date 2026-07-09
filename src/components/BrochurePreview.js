"use client";

import { useEffect, useState, useRef } from "react";
import { generateBrochureHtml } from "@/lib/pdf-template";
import { Eye, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";

export default function BrochurePreview({ campaign, products }) {
  const [htmlContent, setHtmlContent] = useState("");
  const [scale, setScale] = useState(0.4); // Default scale factor
  const [isManualScale, setIsManualScale] = useState(false);
  const containerRef = useRef(null);
  const frameAreaRef = useRef(null);

  // Number of pages is read directly from the campaign/template config
  const numPages = parseInt(campaign.brochurePages) || 2;

  const totalHeight = 1123 * numPages;

  // Update scale factor based on container dimensions
  useEffect(() => {
    if (isManualScale) return;

    const handleResize = () => {
      if (frameAreaRef.current) {
        const width = frameAreaRef.current.clientWidth;
        const height = frameAreaRef.current.clientHeight;

        // A4 page reference size (794px width)
        const targetWidth = 794;

        // Scale to fit width
        const widthScale = (width - 32) / targetWidth;

        // Scale to fit height of the active/visible viewport portion (minus padding)
        const heightScale = (height - 32) / 1123;

        // Take the minimum scale so that the brochure fits comfortably in one view
        const fitScale = Math.min(widthScale, heightScale);

        // Clamp scale between 0.15 and 1.0
        setScale(Math.max(Math.min(fitScale, 1), 0.15));
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    // Quick delay to ensure initial DOM layout has completed
    const timeoutId = setTimeout(handleResize, 100);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timeoutId);
    };
  }, [products, campaign, isManualScale, numPages]);

  useEffect(() => {
    const html = generateBrochureHtml(campaign, products);
    setHtmlContent(html);
  }, [campaign, products]);

  return (
    <div
      className="w-full flex flex-col h-full bg-[#f1f1f3]"
      ref={containerRef}
    >
      {/* Tool Header - Styled with manual zoom controls */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-3 mb-4 shrink-0 px-1">
        <h4 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
          <Eye className="h-4 w-4 text-[#f97316]" />
          <span>
            Live Brochure ({numPages} {numPages === 1 ? "Page" : "Pages"})
          </span>
        </h4>

        {/* Zoom Controls */}
        <div className="flex items-center bg-white border border-slate-200 rounded-xl p-0.5 shadow-2xs text-slate-650">
          <button
            type="button"
            onClick={() => {
              setIsManualScale(true);
              setScale((prev) => Math.max(prev - 0.05, 0.1));
            }}
            className="p-1.5 hover:bg-slate-100 rounded-lg cursor-pointer transition text-slate-500 hover:text-slate-800"
            title="Zoom Out"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>

          <span className="text-[10px] font-bold px-1.5 select-none w-10 text-center">
            {Math.round(scale * 100)}%
          </span>

          <button
            type="button"
            onClick={() => {
              setIsManualScale(true);
              setScale((prev) => Math.min(prev + 0.05, 1.5));
            }}
            className="p-1.5 hover:bg-slate-100 rounded-lg cursor-pointer transition text-slate-500 hover:text-slate-800"
            title="Zoom In"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>

          {isManualScale && (
            <button
              type="button"
              onClick={() => {
                setIsManualScale(false);
              }}
              className="ml-1 flex items-center gap-0.5 px-2 py-1 text-[9px] font-bold bg-orange-50 text-[#f97316] rounded-lg cursor-pointer transition hover:bg-orange-100/80"
              title="Reset to Fit Viewport"
            >
              <Maximize2 className="h-2.5 w-2.5" />
              <span>Fit</span>
            </button>
          )}
        </div>
      </div>

      {/* Frame Container - Fitted to match workspace style with vertical scrolling enabled */}
      <div
        ref={frameAreaRef}
        className="grow relative overflow-y-auto flex justify-center bg-slate-900 border border-slate-850 rounded-3xl p-4 sm:p-6 shadow-inner"
      >
        <div
          style={{
            width: "794px",
            height: `${totalHeight}px`,
            transform: `scale(${scale})`,
            transformOrigin: "top center",
            position: "absolute",
          }}
          className="transition-transform duration-200 ease-out shrink-0 rounded-2xl overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.5)] border border-slate-800"
        >
          {htmlContent ? (
            <iframe
              srcDoc={htmlContent}
              style={{ width: "794px", height: `${totalHeight}px` }}
              className="border-0 bg-white pointer-events-none"
              title="Brochure PDF Preview"
              sandbox="allow-same-origin"
            />
          ) : (
            <div className="w-[794px] h-[1123px] bg-white flex items-center justify-center text-slate-400 text-sm font-semibold">
              Generating Live Brochure View...
            </div>
          )}
        </div>

        {/* Visual spacer to preserve vertical scroll scrollbar height */}
        <div
          style={{
            height: `${totalHeight * scale + 24}px`,
            width: "100%",
          }}
          className="pointer-events-none shrink-0"
        />
      </div>
    </div>
  );
}
