"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authService } from "@/lib/auth-service";
import { dbService } from "@/lib/db-service";
import ProductForm from "@/components/ProductForm";
import BrochurePreview from "@/components/BrochurePreview";
import { 
  ArrowLeft, 
  Save, 
  Heading, 
  ShoppingBag, 
  MapPin, 
  Phone, 
  Plus, 
  Sparkles,
  FileDown,
  Eye,
  Edit2
} from "lucide-react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/AuthGuard";
import FlowbeeLoader from "@/components/FlowbeeLoader";

function CampaignEditor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const campaignId = searchParams.get("id");

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [toast, setToast] = useState({ message: "", visible: false });

  const triggerToast = (message) => {
    setToast({ message, visible: true });
    window.setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 1600);
  };
  
  // Tab states
  const [activeTab, setActiveTab] = useState("header"); // header, products, footer
  const [mobileView, setMobileView] = useState("form"); // form, preview (for mobile responsive tab override)

  // Campaign Header Form State
  const [campaign, setCampaign] = useState({
    companyName: "",
    campaignTitle: "",
    headerTitle: "",
    headerSubtitle: "",
    headerBadgeText: "",
    offerStartDate: "",
    offerEndDate: "",
    logoUrl: "",
    footerAddress: "",
    phone: "",
    whatsapp: "",
    qrCodeUrl: "",
    terms: "",
    templateId: "hypermarket_offer",
    themeColor: "#facc15",
    headerBgColor: "#dc2626",
    accentColor: "#facc15",
    footerBgColor: "#1e293b",
    textColor: "#1f2937",
    currency: "INR",
    productsPerPage: 8,
    productsPerPageSubsequent: 10,
    layoutOrder: ["header", "products", "footer"],
    status: "draft"
  });

  // Campaign Products State
  const [products, setProducts] = useState([]);

  // Authenticate user & load campaign if editing
  useEffect(() => {
    const unsubscribe = authService.subscribeToAuthChanges((currentUser) => {
      if (!currentUser) {
        router.push("/login");
      } else {
        setUser(currentUser);
        if (campaignId) {
          loadCampaignData(campaignId);
        } else {
          // Initialize defaults for a new campaign based on selected template configuration
          const selectedTemplateId = searchParams.get("templateId") || "hypermarket_offer";
          dbService.getTemplates().then((templatesList) => {
            const selectedTemplate = templatesList.find(t => t.id === selectedTemplateId) || templatesList[0];
            setCampaign(prev => ({
              ...prev,
              templateId: selectedTemplateId,
              themeColor: selectedTemplate?.themeColor || "#facc15",
              headerBgColor: selectedTemplate?.themeColor || "#dc2626",
              accentColor: "#facc15",
              footerBgColor: "#1e293b",
              textColor: "#1f2937",
              companyName: "ABC SUPERMARKET",
              campaignTitle: "Weekend Offer",
              headerTitle: "Weekend Offer",
              headerSubtitle: "Special deals for this week",
              headerBadgeText: "Valid this week",
              offerStartDate: new Date().toISOString().split("T")[0],
              offerEndDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
              footerAddress: "Opp. Grand Mall, Al Khuwair, Muscat, Oman",
              phone: "+968 9123 4567",
              whatsapp: "+968 9123 4567",
              terms: "Offers valid till stocks last. Purchase limits apply.",
              currency: "INR"
            }));
            setLoading(false);
          }).catch((err) => {
            console.error("Failed to load templates metadata:", err);
            setLoading(false);
          });
        }
      }
    });

    return () => unsubscribe();
  }, [campaignId, router, searchParams]);

  const loadCampaignData = async (id) => {
    try {
      const campData = await dbService.getCampaign(id);
      if (campData) {
        setCampaign(campData);
        const prodData = await dbService.getProducts(id);
        setProducts(prodData);
      } else {
        alert("Campaign not found");
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Failed to load campaign:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setCampaign(prev => ({ ...prev, logoUrl: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (status = "draft") => {
    if (!user) return;
    setSaving(true);
    try {
      const campaignData = {
        ...campaign,
        status,
        userId: user.uid,
        customerId: user.uid,
      };
      
      if (campaignId) {
        await dbService.updateCampaign(campaignId, campaignData);
        await dbService.saveProducts(campaignId, products);
      } else {
        const newId = await dbService.createCampaign(campaignData);
        if (products.length > 0) {
          await dbService.saveProducts(newId, products);
        }
        if (status !== "completed") {
          router.push(`/campaigns/new?id=${newId}`);
        }
      }
      
      if (status === "completed") {
        triggerToast("ok");
        window.setTimeout(() => router.push("/dashboard"), 1200);
      }
    } catch (error) {
      console.error("Failed to save campaign:", error);
      alert("Failed to save campaign");
    } finally {
      setSaving(false);
    }
  };

  const handleGeneratePdf = async () => {
    setDownloading(true);
    try {
      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaign, products }),
      });

      if (!response.ok) {
        const text = await response.text();
        let errorMessage = `Failed to generate PDF (${response.status})`;
        try {
          const errorBody = JSON.parse(text);
          if (errorBody?.error) errorMessage = errorBody.error;
        } catch (jsonError) {
          if (text) errorMessage = text;
        }
        throw new Error(errorMessage);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(campaign.campaignTitle || "brochure").toLowerCase().replace(/\s+/g, "-")}-brochure.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("PDF download failed:", error);
      alert(`Failed to generate PDF: ${error.message}`);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return <FlowbeeLoader />;
  }

  return (
    <div className="min-h-screen bg-[#fafafb] text-[#1e293b] font-sans flex flex-col selection:bg-[#f97316] selection:text-white">
      {toast.visible && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl bg-slate-950/95 border border-slate-200/10 px-4 py-3 text-sm font-semibold text-white shadow-2xl backdrop-blur-md">
          {toast.message}
        </div>
      )}
      {/* Editor Header */}
      <header className="border-b border-slate-200/60 bg-white/90 backdrop-blur-md px-4 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-50 shadow-xs">
        <div className="flex items-center gap-3">
          <Link 
            href="/dashboard"
            className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-xl transition text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="min-w-0 text-left">
            <h1 className="font-bold text-sm text-slate-900 truncate">
              {campaignId ? "Edit Brochure" : "New Brochure"}
            </h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">{campaign.companyName} • {campaign.campaignTitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => handleSave("draft")}
            disabled={saving}
            className="px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-xl text-[10px] sm:text-xs font-bold text-slate-600 hover:text-slate-800 transition flex items-center gap-1 disabled:opacity-50 cursor-pointer"
          >
            <Save className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Save Draft</span>
          </button>
          
          <button
            onClick={() => handleSave("completed")}
            disabled={saving}
            className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 rounded-xl text-[10px] sm:text-xs font-bold text-emerald-700 transition flex items-center gap-1 disabled:opacity-50 cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Finish</span>
          </button>

          <button
            onClick={handleGeneratePdf}
            disabled={downloading}
            className="px-3.5 py-2 bg-[#f97316] hover:bg-[#ea580c] rounded-xl text-[10px] sm:text-xs font-bold text-white transition flex items-center gap-1 disabled:opacity-50 cursor-pointer shadow-xs"
          >
            {downloading ? (
              <span className="inline-block animate-spin border-2 border-white border-t-transparent rounded-full h-3.5 w-3.5"></span>
            ) : (
              <FileDown className="h-3.5 w-3.5" />
            )}
            <span>PDF</span>
          </button>
        </div>
      </header>

      {/* Mobile Workspace Toggle Bar */}
      <div className="lg:hidden flex bg-white border-b border-slate-200/60 p-1 shrink-0">
        <button
          onClick={() => setMobileView("form")}
          className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-1.5 transition rounded-xl ${
            mobileView === "form" 
              ? "bg-slate-100 text-slate-900" 
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <Edit2 className="h-4 w-4" />
          <span>Edit Details</span>
        </button>
        <button
          onClick={() => setMobileView("preview")}
          className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-1.5 transition rounded-xl ${
            mobileView === "preview" 
              ? "bg-slate-100 text-slate-900" 
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <Eye className="h-4 w-4" />
          <span>Live Preview</span>
        </button>
      </div>

      {/* Editor Body Split Layout */}
      <div className="grow grid grid-cols-1 lg:grid-cols-2 min-h-0 h-[calc(100vh-69px-45px)] lg:h-[calc(100vh-69px)]">
        {/* Left Side: Editor Form */}
        <div className={`min-h-0 overflow-y-auto p-4 sm:p-6 border-r border-slate-200/60 bg-white flex flex-col ${
          mobileView === "form" ? "flex" : "hidden lg:flex"
        }`}>
          {/* Tab Navigation */}
          <div className="flex border-b border-slate-200/60 mb-6 shrink-0 gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab("header")}
              className={`pb-3 px-3.5 font-bold text-xs sm:text-sm flex items-center gap-1.5 border-b-2 transition ${
                activeTab === "header" 
                  ? "border-[#f97316] text-[#f97316]" 
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              <Heading className="h-4 w-4" />
              Branding
            </button>
            <button
              onClick={() => setActiveTab("products")}
              className={`pb-3 px-3.5 font-bold text-xs sm:text-sm flex items-center gap-1.5 border-b-2 transition ${
                activeTab === "products" 
                  ? "border-[#f97316] text-[#f97316]" 
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              <ShoppingBag className="h-4 w-4" />
              Products ({products.length})
            </button>
            <button
              onClick={() => setActiveTab("footer")}
              className={`pb-3 px-3.5 font-bold text-xs sm:text-sm flex items-center gap-1.5 border-b-2 transition ${
                activeTab === "footer" 
                  ? "border-[#f97316] text-[#f97316]" 
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              <MapPin className="h-4 w-4" />
              Contacts
            </button>
          </div>

          {/* Form Content */}
          <div className="grow space-y-6">
            {activeTab === "header" && (
              <div className="space-y-4">
                <div className="rounded-3xl border border-slate-200/80 bg-linear-to-br from-white via-slate-50 to-white p-4 sm:p-5 shadow-[0_10px_30px_-15px_rgba(15,23,42,0.2)]">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-400">Branding</p>
                      <h3 className="mt-1 text-sm font-semibold text-slate-800">Header and brochure identity</h3>
                    </div>
                    <div className="rounded-full border border-orange-100 bg-orange-50 px-2.5 py-1 text-[10px] font-semibold text-orange-600">
                      Modern layout
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Company / Store Name</label>
                    <input
                      type="text"
                      value={campaign.companyName}
                      onChange={(e) => setCampaign(prev => ({ ...prev, companyName: e.target.value }))}
                      placeholder="e.g. Hypermarket LLC"
                      className="w-full px-3.5 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 focus:outline-none focus:border-[#f97316] text-sm placeholder-slate-400 font-medium transition"
                    />
                    <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2">
                      <input
                        type="color"
                        value={campaign.companyColor || campaign.textColor || "#1f2937"}
                        onChange={(e) => setCampaign(prev => ({ ...prev, companyColor: e.target.value }))}
                        className="h-8 w-8 cursor-pointer rounded-lg border border-slate-200 bg-transparent"
                      />
                      <input
                        type="text"
                        value={campaign.companyColor || campaign.textColor || "#1f2937"}
                        onChange={(e) => setCampaign(prev => ({ ...prev, companyColor: e.target.value }))}
                        className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-700"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Header Title</label>
                    <input
                      type="text"
                      value={campaign.headerTitle || campaign.campaignTitle}
                      onChange={(e) => setCampaign(prev => ({ ...prev, headerTitle: e.target.value }))}
                      placeholder="e.g. Super Savings"
                      className="w-full px-3.5 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 focus:outline-none focus:border-[#f97316] text-sm placeholder-slate-400 font-medium transition"
                    />
                    <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2">
                      <input
                        type="color"
                        value={campaign.headerTitleColor || campaign.themeColor || "#dc2626"}
                        onChange={(e) => setCampaign(prev => ({ ...prev, headerTitleColor: e.target.value }))}
                        className="h-8 w-8 cursor-pointer rounded-lg border border-slate-200 bg-transparent"
                      />
                      <input
                        type="text"
                        value={campaign.headerTitleColor || campaign.themeColor || "#dc2626"}
                        onChange={(e) => setCampaign(prev => ({ ...prev, headerTitleColor: e.target.value }))}
                        className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-700"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Header Subtitle</label>
                    <input
                      type="text"
                      value={campaign.headerSubtitle || ""}
                      onChange={(e) => setCampaign(prev => ({ ...prev, headerSubtitle: e.target.value }))}
                      placeholder="e.g. Limited time offers"
                      className="w-full px-3.5 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 focus:outline-none focus:border-[#f97316] text-sm placeholder-slate-400 font-medium transition"
                    />
                    <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2">
                      <input
                        type="color"
                        value={campaign.headerSubtitleColor || campaign.accentColor || "#facc15"}
                        onChange={(e) => setCampaign(prev => ({ ...prev, headerSubtitleColor: e.target.value }))}
                        className="h-8 w-8 cursor-pointer rounded-lg border border-slate-200 bg-transparent"
                      />
                      <input
                        type="text"
                        value={campaign.headerSubtitleColor || campaign.accentColor || "#facc15"}
                        onChange={(e) => setCampaign(prev => ({ ...prev, headerSubtitleColor: e.target.value }))}
                        className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-700"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Header Badge</label>
                    <input
                      type="text"
                      value={campaign.headerBadgeText || ""}
                      onChange={(e) => setCampaign(prev => ({ ...prev, headerBadgeText: e.target.value }))}
                      placeholder="e.g. Valid till stock lasts"
                      className="w-full px-3.5 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 focus:outline-none focus:border-[#f97316] text-sm placeholder-slate-400 font-medium transition"
                    />
                    <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2">
                      <input
                        type="color"
                        value={campaign.headerBadgeColor || campaign.accentColor || "#facc15"}
                        onChange={(e) => setCampaign(prev => ({ ...prev, headerBadgeColor: e.target.value }))}
                        className="h-8 w-8 cursor-pointer rounded-lg border border-slate-200 bg-transparent"
                      />
                      <input
                        type="text"
                        value={campaign.headerBadgeColor || campaign.accentColor || "#facc15"}
                        onChange={(e) => setCampaign(prev => ({ ...prev, headerBadgeColor: e.target.value }))}
                        className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-700"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Offer Start Date</label>
                    <input
                      type="date"
                      value={campaign.offerStartDate}
                      onChange={(e) => setCampaign(prev => ({ ...prev, offerStartDate: e.target.value }))}
                      className="w-full px-3.5 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 focus:outline-none focus:border-[#f97316] text-sm transition"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Offer End Date</label>
                    <input
                      type="date"
                      value={campaign.offerEndDate}
                      onChange={(e) => setCampaign(prev => ({ ...prev, offerEndDate: e.target.value }))}
                      className="w-full px-3.5 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 focus:outline-none focus:border-[#f97316] text-sm transition"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Header Theme Color</label>
                    <div className="flex gap-3 items-center border border-slate-200 rounded-xl bg-slate-50 p-3">
                      <input
                        type="color"
                        value={campaign.themeColor || "#facc15"}
                        onChange={(e) => setCampaign(prev => ({ ...prev, themeColor: e.target.value, headerBgColor: e.target.value }))}
                        className="h-10 w-10 border border-slate-200 rounded-lg cursor-pointer bg-transparent shrink-0"
                      />
                      <input
                        type="text"
                        value={campaign.themeColor || "#facc15"}
                        onChange={(e) => setCampaign(prev => ({ ...prev, themeColor: e.target.value, headerBgColor: e.target.value }))}
                        placeholder="#facc15"
                        className="grow px-3.5 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-900 focus:outline-none focus:border-[#f97316] text-sm placeholder-slate-400 font-medium transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Accent Color</label>
                    <div className="flex gap-3 items-center border border-slate-200 rounded-xl bg-slate-50 p-3">
                      <input
                        type="color"
                        value={campaign.accentColor || "#facc15"}
                        onChange={(e) => setCampaign(prev => ({ ...prev, accentColor: e.target.value }))}
                        className="h-10 w-10 border border-slate-200 rounded-lg cursor-pointer bg-transparent shrink-0"
                      />
                      <input
                        type="text"
                        value={campaign.accentColor || "#facc15"}
                        onChange={(e) => setCampaign(prev => ({ ...prev, accentColor: e.target.value }))}
                        placeholder="#facc15"
                        className="grow px-3.5 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-900 focus:outline-none focus:border-[#f97316] text-sm placeholder-slate-400 font-medium transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Header Background</label>
                    <div className="flex gap-3 items-center border border-slate-200 rounded-xl bg-slate-50 p-3">
                      <input
                        type="color"
                        value={campaign.headerBgColor || campaign.themeColor || "#dc2626"}
                        onChange={(e) => setCampaign(prev => ({ ...prev, headerBgColor: e.target.value }))}
                        className="h-10 w-10 border border-slate-200 rounded-lg cursor-pointer bg-transparent shrink-0"
                      />
                      <input
                        type="text"
                        value={campaign.headerBgColor || campaign.themeColor || "#dc2626"}
                        onChange={(e) => setCampaign(prev => ({ ...prev, headerBgColor: e.target.value }))}
                        placeholder="#dc2626"
                        className="grow px-3.5 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-900 focus:outline-none focus:border-[#f97316] text-sm placeholder-slate-400 font-medium transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Footer Background</label>
                    <div className="flex gap-3 items-center border border-slate-200 rounded-xl bg-slate-50 p-3">
                      <input
                        type="color"
                        value={campaign.footerBgColor || "#1e293b"}
                        onChange={(e) => setCampaign(prev => ({ ...prev, footerBgColor: e.target.value }))}
                        className="h-10 w-10 border border-slate-200 rounded-lg cursor-pointer bg-transparent shrink-0"
                      />
                      <input
                        type="text"
                        value={campaign.footerBgColor || "#1e293b"}
                        onChange={(e) => setCampaign(prev => ({ ...prev, footerBgColor: e.target.value }))}
                        placeholder="#1e293b"
                        className="grow px-3.5 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-900 focus:outline-none focus:border-[#f97316] text-sm placeholder-slate-400 font-medium transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Text Color</label>
                    <div className="flex gap-3 items-center border border-slate-200 rounded-xl bg-slate-50 p-3">
                      <input
                        type="color"
                        value={campaign.textColor || "#1f2937"}
                        onChange={(e) => setCampaign(prev => ({ ...prev, textColor: e.target.value }))}
                        className="h-10 w-10 border border-slate-200 rounded-lg cursor-pointer bg-transparent shrink-0"
                      />
                      <input
                        type="text"
                        value={campaign.textColor || "#1f2937"}
                        onChange={(e) => setCampaign(prev => ({ ...prev, textColor: e.target.value }))}
                        placeholder="#1f2937"
                        className="grow px-3.5 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-900 focus:outline-none focus:border-[#f97316] text-sm placeholder-slate-400 font-medium transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Price Color</label>
                    <div className="flex gap-3 items-center border border-slate-200 rounded-xl bg-slate-50 p-3">
                      <input
                        type="color"
                        value={campaign.priceColor || campaign.themeColor || "#dc2626"}
                        onChange={(e) => setCampaign(prev => ({ ...prev, priceColor: e.target.value }))}
                        className="h-10 w-10 border border-slate-200 rounded-lg cursor-pointer bg-transparent shrink-0"
                      />
                      <input
                        type="text"
                        value={campaign.priceColor || campaign.themeColor || "#dc2626"}
                        onChange={(e) => setCampaign(prev => ({ ...prev, priceColor: e.target.value }))}
                        placeholder="#dc2626"
                        className="grow px-3.5 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-900 focus:outline-none focus:border-[#f97316] text-sm placeholder-slate-400 font-medium transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Currency Type</label>
                    <select
                      value={campaign.currency || "OMR"}
                      onChange={(e) => setCampaign(prev => ({ ...prev, currency: e.target.value }))}
                      className="w-full px-3.5 py-4 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 focus:outline-none focus:border-[#f97316] text-sm font-medium transition"
                    >
                      <option value="OMR">OMR (Omani Rial)</option>
                      <option value="AED">AED (UAE Dirham)</option>
                      <option value="USD">USD (US Dollar)</option>
                      <option value="INR">INR (Indian Rupee)</option>
                      <option value="QAR">QAR (Qatari Riyal)</option>
                      <option value="SAR">SAR (Saudi Riyal)</option>
                      <option value="BHD">BHD (Bahraini Dinar)</option>
                      <option value="KWD">KWD (Kuwaiti Dinar)</option>
                      <option value="EUR">EUR (Euro)</option>
                      <option value="GBP">GBP (British Pound)</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Store Logo</label>
                    <div className="flex items-center gap-4 border border-slate-200 rounded-xl bg-slate-50 p-4">
                      <div className="h-16 w-16 bg-white border border-slate-200 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
                        {campaign.logoUrl ? (
                          <img src={campaign.logoUrl} alt="Logo" className="max-h-full max-w-full object-contain p-1" />
                        ) : (
                          <Plus className="h-5 w-5 text-slate-300" />
                        )}
                      </div>
                      <div className="grow">
                        <label className="cursor-pointer bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-100 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-800 transition inline-block">
                          Upload Custom Logo
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="hidden"
                          />
                        </label>
                        <p className="text-[10px] text-slate-400 mt-1.5 font-bold">PNG or JPEG format. Square size works best.</p>
                      </div>
                    </div>
                  </div>
                </div>
                </div>
              </div>
            )}

            {activeTab === "products" && (
              <ProductForm 
                products={products}
                onChange={setProducts}
              />
            )}

            {activeTab === "footer" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        value={campaign.phone}
                        onChange={(e) => setCampaign(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="+968 9000 0000"
                        className="w-full pl-10 pr-3.5 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 focus:outline-none focus:border-[#f97316] text-sm placeholder-slate-400 font-medium transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">WhatsApp Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        value={campaign.whatsapp}
                        onChange={(e) => setCampaign(prev => ({ ...prev, whatsapp: e.target.value }))}
                        placeholder="+968 9000 0000"
                        className="w-full pl-10 pr-3.5 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 focus:outline-none focus:border-[#f97316] text-sm placeholder-slate-400 font-medium transition"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Store Address / Details</label>
                    <textarea
                      value={campaign.footerAddress}
                      onChange={(e) => setCampaign(prev => ({ ...prev, footerAddress: e.target.value }))}
                      placeholder="e.g. Oman Branch, Muscat City Center, Ground Floor"
                      rows={2}
                      className="w-full px-3.5 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 focus:outline-none focus:border-[#f97316] text-sm placeholder-slate-400 font-medium resize-none transition"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Terms & Conditions / Disclaimer</label>
                    <textarea
                      value={campaign.terms}
                      onChange={(e) => setCampaign(prev => ({ ...prev, terms: e.target.value }))}
                      placeholder="e.g. Terms and conditions apply. Promotion valid until stock lasts."
                      rows={2}
                      className="w-full px-3.5 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 focus:outline-none focus:border-[#f97316] text-sm placeholder-slate-400 font-medium resize-none transition"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Visual Brochure Preview Panel */}
        <div className={`min-h-0 bg-[#f1f1f3] p-4 sm:p-6 flex flex-col overflow-hidden ${
          mobileView === "preview" ? "flex" : "hidden lg:flex"
        }`}>
          <BrochurePreview 
            campaign={campaign}
            products={products}
          />
        </div>
      </div>
    </div>
  );
}

function CampaignEditorPage() {
  return (
    <Suspense fallback={<FlowbeeLoader />}>
      <CampaignEditor />
    </Suspense>
  );
}

export default ProtectedRoute(CampaignEditorPage);
