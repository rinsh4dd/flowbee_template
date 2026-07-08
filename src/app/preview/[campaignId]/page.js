"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { dbService } from "@/lib/db-service";
import { generateBrochureHtml } from "@/lib/pdf-template";
import { Printer, ArrowLeft, FileDown } from "lucide-react";
import { ProtectedRoute } from "@/components/AuthGuard";
import FlowbeeLoader from "@/components/FlowbeeLoader";
import Link from "next/link";

function CampaignPreviewPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.campaignId;

  const [campaign, setCampaign] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [htmlContent, setHtmlContent] = useState("");
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (campaignId) {
      loadData(campaignId);
    }
  }, [campaignId]);

  const loadData = async (id) => {
    try {
      const camp = await dbService.getCampaign(id);
      if (camp) {
        setCampaign(camp);
        const prodList = await dbService.getProducts(id);
        setProducts(prodList);
        
        // Generate and set brochure HTML
        const html = generateBrochureHtml(camp, prodList);
        setHtmlContent(html);
      } else {
        alert("Campaign not found");
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Failed to load campaign preview:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!campaign) return;
    setDownloading(true);
    try {
      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          campaign,
          products,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${campaign.campaignTitle.toLowerCase().replace(/\s+/g, "-")}-brochure.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("Failed to generate PDF");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return <FlowbeeLoader />;
  }

  return (
    <div className="min-h-screen bg-[#fafafb] flex flex-col font-sans">
      {/* Print styles */}
      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background-color: transparent !important;
            padding: 0 !important;
            margin: 0 !important;
          }
        }
      `}</style>
      
      {/* Top action bar - matching workspace theme */}
      <div className="no-print bg-white/90 backdrop-blur-md border-b border-slate-200/60 shadow-xs px-6 sm:px-12 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push("/dashboard")}
            className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-xl transition text-slate-500 hover:text-slate-800 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="text-left">
            <h1 className="font-bold text-sm text-slate-900">
              {campaign?.campaignTitle}
            </h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{campaign?.companyName}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-50 border border-slate-200 hover:border-slate-300 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-800 transition cursor-pointer"
          >
            <Printer className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Print</span>
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={downloading}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#f97316] hover:bg-[#ea580c] rounded-xl text-xs font-bold text-white transition disabled:opacity-50 cursor-pointer shadow-xs"
          >
            {downloading ? (
              <>
                <span className="inline-block animate-spin border-2 border-white border-t-transparent rounded-full h-3.5 w-3.5"></span>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <FileDown className="h-3.5 w-3.5" />
                <span>Download PDF</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Embedded Brochure Render */}
      <div className="grow overflow-y-auto p-6 sm:p-10 flex justify-center bg-[#f1f1f3]">
        <div className="shadow-xl rounded-2xl overflow-hidden border border-slate-200/60 bg-white">
          <iframe
            srcDoc={htmlContent}
            className="w-[210mm] h-[calc(297mm_*_2)] border-0" 
            style={{ height: "auto", minHeight: "1123px" }}
            title="Brochure Full Layout"
            sandbox="allow-same-origin"
            onLoad={(e) => {
              // Adjust iframe height dynamically to match its contents if possible
              try {
                const iframe = e.target;
                if (iframe.contentWindow?.document?.body) {
                  iframe.style.height = `${iframe.contentWindow.document.body.scrollHeight}px`;
                }
              } catch (err) {
                console.error("Failed to resize preview iframe:", err);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default ProtectedRoute(CampaignPreviewPage);
