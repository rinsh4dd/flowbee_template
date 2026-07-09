"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authService } from "@/lib/auth-service";
import { dbService } from "@/lib/db-service";
import { seedDynamicTemplate } from "@/lib/seed-template";
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
  Edit2,
  Settings,
  Image as ImageIcon,
  Trash2,
  Calendar,
  Coins,
  Layers,
  Check,
  Info
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
  const [mobileView, setMobileView] = useState("form"); // form, preview

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
    rawLogoUrl: "",
    footerLogoUrl: "",
    rawFooterLogoUrl: "",
    footerBrandName1: "",
    footerBrandName2: "",
    footerBrandSub: "",
    footerAddress: "",
    phone: "",
    whatsapp: "",
    qrCodeUrl: "",
    terms: "",
    templateId: "wefive_tuesday_market",
    themeColor: "#065f46",
    headerBgColor: "#064e3b",
    accentColor: "#facc15",
    footerBgColor: "#064e3b",
    textColor: "#1f2937",
    currency: "INR",
    brochurePages: 1,
    productsPerPage: 15,
    productsPerPageSubsequent: 20,
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
        // Seed dynamic test template from Firebase/LocalStorage
        seedDynamicTemplate();

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
              themeColor: selectedTemplate?.themeColor || "#065f46",
              headerBgColor: selectedTemplate?.themeColor || "#064e3b",
              accentColor: "#facc15",
              footerBgColor: "#064e3b",
              textColor: "#1f2937",
              companyName: "DEMO STORE",
              campaignTitle: "Onam Special Offer",
              headerTitle: "ഓണം ഓഫർ",
              headerSubtitle: "Onam Special Savings",
              headerBadgeText: "LIMITED TIME OFFER",
              offerStartDate: new Date().toISOString().split("T")[0],
              offerEndDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
              footerAddress: "# 123, MAIN ROAD, CITY 600001",
              phone: "+91 9000000001",
              whatsapp: "+91 9000000000",
              terms: "Bulk purchase not allowed. Offer valid till stock last. All pictures shown are for illustration purpose only.",
              currency: "INR",
              brochurePages: selectedTemplate?.brochurePages || 1
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

  const handleLogoUpload = (e, target = "headerLogo") => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (target === "headerLogo") {
        setCampaign(prev => ({
          ...prev,
          logoUrl: reader.result,
          rawLogoUrl: reader.result,
        }));
      } else {
        setCampaign(prev => ({
          ...prev,
          footerLogoUrl: reader.result,
          rawFooterLogoUrl: reader.result,
        }));
      }
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
        triggerToast("Brochure successfully published!");
        window.setTimeout(() => router.push("/dashboard"), 1200);
      } else {
        triggerToast("Draft successfully saved!");
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
    <div className="min-h-screen bg-[#fafafb] text-[#1f2937] font-sans flex flex-col select-none antialiased">
      {/* Toast Notification */}
      {toast.visible && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl bg-emerald-950/95 border border-emerald-500/20 px-5 py-3.5 text-xs font-bold text-white shadow-2xl backdrop-blur-md flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4 text-yellow-400" />
          {toast.message}
        </div>
      )}

      {/* Modern WeFive Gradient Header Bar */}
      <header className="border-b border-emerald-850 bg-gradient-to-r from-emerald-900 to-green-950 text-white px-4 sm:px-8 py-4 flex flex-col sm:flex-row items-center justify-between sticky top-0 z-50 shadow-md gap-4">
        <div className="flex items-center gap-3">
          <Link 
            href="/dashboard"
            className="p-2.5 bg-white/10 hover:bg-white/20 active:bg-white/30 border border-white/10 rounded-xl transition-all text-white/80 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="min-w-0 text-left">
            <span className="bg-emerald-800 text-yellow-300 font-extrabold text-[10px] px-2 py-0.5 rounded-full border border-yellow-400/20 uppercase tracking-widest leading-none block w-max mb-1">
              Active Studio Session
            </span>
            <h1 className="font-extrabold text-lg text-white truncate leading-none">
              {campaignId ? "Update Brochure Draft" : "New Campaign Generator"}
            </h1>
          </div>
        </div>

        {/* Global Control Button Stack */}
        <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto justify-end">
          <button
            onClick={() => handleSave("draft")}
            disabled={saving}
            className="flex-1 sm:flex-none px-4 py-2 bg-white/10 hover:bg-white/15 active:bg-white/25 border border-white/10 rounded-xl text-xs font-bold text-white transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            <Save className="h-4 w-4 text-emerald-400" />
            <span>Save Draft</span>
          </button>
          
          <button
            onClick={() => handleSave("completed")}
            disabled={saving}
            className="flex-1 sm:flex-none px-4 py-2 bg-yellow-400 hover:bg-yellow-300 active:bg-yellow-500 text-emerald-950 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-md shadow-yellow-950/20"
          >
            <Sparkles className="h-4 w-4" />
            <span>Finish & Publish</span>
          </button>

          <button
            onClick={handleGeneratePdf}
            disabled={downloading}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 rounded-xl text-xs font-bold text-white transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-md shadow-sky-950/25"
          >
            {downloading ? (
              <span className="inline-block animate-spin border-2 border-white border-t-transparent rounded-full h-3.5 w-3.5"></span>
            ) : (
              <FileDown className="h-4 w-4" />
            )}
            <span>Export PDF</span>
          </button>
        </div>
      </header>

      {/* Mobile Screen Responsive Tab Selector */}
      <div className="lg:hidden flex bg-white border-b border-slate-200 p-1 shrink-0">
        <button
          onClick={() => setMobileView("form")}
          className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-1.5 transition rounded-xl ${
            mobileView === "form" 
              ? "bg-emerald-800/10 text-emerald-900" 
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <Edit2 className="h-4 w-4" />
          <span>Editor Workspace</span>
        </button>
        <button
          onClick={() => setMobileView("preview")}
          className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-1.5 transition rounded-xl ${
            mobileView === "preview" 
              ? "bg-emerald-800/10 text-emerald-900" 
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <Eye className="h-4 w-4" />
          <span>Visual Live Preview</span>
        </button>
      </div>

      {/* Editor Main Content Area */}
      <div className="grow grid grid-cols-1 lg:grid-cols-[460px_1fr] min-h-0 h-[calc(100vh-69px-45px)] lg:h-[calc(100vh-69px)]">
        
        {/* LEFT WORKSPACE SIDEBAR */}
        <div className={`min-h-0 overflow-y-auto p-4 sm:p-6 border-r border-slate-200 bg-white flex flex-col ${
          mobileView === "form" ? "flex" : "hidden lg:flex"
        }`}>
          
          {/* Section Selector Tabs styled with WeFive Emerald Theme */}
          <div className="flex bg-slate-50 p-1.5 rounded-xl border border-slate-100 mb-6 shrink-0 gap-1">
            <button
              onClick={() => setActiveTab("header")}
              className={`flex-1 py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                activeTab === "header" 
                  ? "bg-emerald-800 text-white shadow-sm" 
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              }`}
            >
              <Heading className="h-3.5 w-3.5" />
              Campaign
            </button>
            <button
              onClick={() => setActiveTab("products")}
              className={`flex-1 py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                activeTab === "products" 
                  ? "bg-emerald-800 text-white shadow-sm" 
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              }`}
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              Products ({products.length})
            </button>
            <button
              onClick={() => setActiveTab("footer")}
              className={`flex-1 py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                activeTab === "footer" 
                  ? "bg-emerald-800 text-white shadow-sm" 
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              }`}
            >
              <MapPin className="h-3.5 w-3.5" />
              Footer
            </button>
          </div>

          {/* ACTIVE TAB CUSTOMIZERS */}
          <div className="grow space-y-6">
            
            {/* BRANDING & IDENTITY */}
            {activeTab === "header" && (
              <div className="space-y-5">
                
                {/* Visual Section Indicator Card */}
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex gap-3 text-xs text-emerald-800 items-start">
                  <Info className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Flyer Header & Styling Details</p>
                    <p className="mt-0.5 text-emerald-700/90 leading-relaxed">
                      Customise primary headings, language badges, and core palette variables below. All changes propagate in real-time.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Campaign Title (Document Level) */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Brochure Campaign Title
                    </label>
                    <input
                      type="text"
                      value={campaign.campaignTitle || ""}
                      onChange={(e) => setCampaign(prev => ({ ...prev, campaignTitle: e.target.value }))}
                      placeholder="e.g. Tuesday Market Offer"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white text-slate-950 focus:outline-none focus:border-emerald-600 text-xs font-bold transition-all shadow-inner"
                    />
                  </div>

                  {/* Company Name */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Company / Store Name
                    </label>
                    <input
                      type="text"
                      value={campaign.companyName}
                      onChange={(e) => setCampaign(prev => ({ ...prev, companyName: e.target.value }))}
                      placeholder="e.g. WEFIVE HYPERMARKET"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white text-slate-950 focus:outline-none focus:border-emerald-600 text-xs font-extrabold tracking-wide uppercase transition-all shadow-inner"
                    />
                  </div>

                  {/* Header Title */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Poster Header Title
                    </label>
                    <input
                      type="text"
                      value={campaign.headerTitle || ""}
                      onChange={(e) => setCampaign(prev => ({ ...prev, headerTitle: e.target.value }))}
                      placeholder="e.g. ചൊവ്വാ ചന്ത"
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white text-slate-950 focus:outline-none focus:border-emerald-600 text-sm font-black transition-all shadow-inner"
                    />
                  </div>

                  {/* Header Subtitle */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Poster Header Subtitle
                    </label>
                    <input
                      type="text"
                      value={campaign.headerSubtitle || ""}
                      onChange={(e) => setCampaign(prev => ({ ...prev, headerSubtitle: e.target.value }))}
                      placeholder="e.g. Tuesday Market savings"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white text-slate-950 focus:outline-none focus:border-emerald-600 text-xs font-semibold transition-all shadow-inner"
                    />
                  </div>

                  {/* Header Badge text */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Date Badge Text
                    </label>
                    <input
                      type="text"
                      value={campaign.headerBadgeText || ""}
                      onChange={(e) => setCampaign(prev => ({ ...prev, headerBadgeText: e.target.value }))}
                      placeholder="e.g. ONLY ON 16 JUNE 2026"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white text-slate-950 focus:outline-none focus:border-emerald-600 text-xs font-extrabold uppercase tracking-wide transition-all shadow-inner"
                    />
                  </div>

                  {/* Date Ranges */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={campaign.offerStartDate}
                        onChange={(e) => setCampaign(prev => ({ ...prev, offerStartDate: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white text-xs font-bold transition-all shadow-inner"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={campaign.offerEndDate}
                        onChange={(e) => setCampaign(prev => ({ ...prev, offerEndDate: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white text-xs font-bold transition-all shadow-inner"
                      />
                    </div>
                  </div>

                  {/* Theme Colors Sub-Grid */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    {/* Primary Theme Colour */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Theme Base Color
                      </label>
                      <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 border border-slate-200 rounded-lg shadow-inner">
                        <input
                          type="color"
                          value={campaign.themeColor || "#065f46"}
                          onChange={(e) => setCampaign(prev => ({ ...prev, themeColor: e.target.value, headerBgColor: e.target.value }))}
                          className="h-6 w-6 border border-slate-200 rounded-md cursor-pointer bg-transparent"
                        />
                        <input
                          type="text"
                          value={campaign.themeColor || "#065f46"}
                          onChange={(e) => setCampaign(prev => ({ ...prev, themeColor: e.target.value, headerBgColor: e.target.value }))}
                          className="w-full border-none bg-transparent text-[10px] font-mono font-bold uppercase text-slate-700 outline-none"
                        />
                      </div>
                    </div>

                    {/* Accent Color */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Gold / Accent Color
                      </label>
                      <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 border border-slate-200 rounded-lg shadow-inner">
                        <input
                          type="color"
                          value={campaign.accentColor || "#facc15"}
                          onChange={(e) => setCampaign(prev => ({ ...prev, accentColor: e.target.value }))}
                          className="h-6 w-6 border border-slate-200 rounded-md cursor-pointer bg-transparent"
                        />
                        <input
                          type="text"
                          value={campaign.accentColor || "#facc15"}
                          onChange={(e) => setCampaign(prev => ({ ...prev, accentColor: e.target.value }))}
                          className="w-full border-none bg-transparent text-[10px] font-mono font-bold uppercase text-slate-700 outline-none"
                        />
                      </div>
                    </div>

                    {/* Price Tag Highlight */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Price Color
                      </label>
                      <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 border border-slate-200 rounded-lg shadow-inner">
                        <input
                          type="color"
                          value={campaign.priceColor || "#065f46"}
                          onChange={(e) => setCampaign(prev => ({ ...prev, priceColor: e.target.value }))}
                          className="h-6 w-6 border border-slate-200 rounded-md cursor-pointer bg-transparent"
                        />
                        <input
                          type="text"
                          value={campaign.priceColor || "#065f46"}
                          onChange={(e) => setCampaign(prev => ({ ...prev, priceColor: e.target.value }))}
                          className="w-full border-none bg-transparent text-[10px] font-mono font-bold uppercase text-slate-700 outline-none"
                        />
                      </div>
                    </div>

                    {/* Currency selection */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Currency
                      </label>
                      <select
                        value={campaign.currency || "INR"}
                        onChange={(e) => setCampaign(prev => ({ ...prev, currency: e.target.value }))}
                        className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-lg shadow-inner text-xs font-bold text-slate-800 focus:outline-none"
                      >
                        <option value="INR">₹ (INR)</option>
                        <option value="OMR">OMR (Omani Rial)</option>
                        <option value="AED">AED (UAE Dirham)</option>
                        <option value="USD">$ (US Dollar)</option>
                        <option value="EUR">€ (Euro)</option>
                      </select>
                    </div>
                  </div>

                  {/* Logo Upload Section */}
                  <div className="border border-slate-200 rounded-xl bg-slate-50 p-4 mt-3">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Store / Brand Logo</label>
                    <div className="flex items-center gap-3">
                      <div className="h-14 w-14 bg-white border border-slate-200 rounded-lg flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
                        {campaign.logoUrl ? (
                          <img src={campaign.logoUrl} alt="Logo" className="max-h-[90%] max-w-[90%] object-contain" />
                        ) : (
                          <ImageIcon className="h-5 w-5 text-slate-300" />
                        )}
                      </div>
                      <div className="grow flex flex-wrap gap-2 items-center">
                        <label className="cursor-pointer bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-100 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 transition">
                          Upload Custom Logo
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* PRODUCT DEALS EDITOR */}
            {activeTab === "products" && (
              <div className="space-y-4">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-inner">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Products Per Page Limit (First Page)</h4>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Define maximum items on Page 1. Subsequent pages automatically fit 5 more items (no header).</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="25"
                      value={campaign.productsPerPage ?? ""}
                      onChange={(e) => {
                        const rawVal = e.target.value;
                        if (rawVal === "") {
                          setCampaign(prev => ({
                            ...prev,
                            productsPerPage: null,
                            productsPerPageSubsequent: null
                          }));
                          return;
                        }
                        const val = Math.min(25, Math.max(1, parseInt(rawVal) || 15));
                        setCampaign(prev => ({ 
                          ...prev, 
                          productsPerPage: val,
                          productsPerPageSubsequent: val + 5 
                        }));
                      }}
                      className="w-20 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-center text-slate-800 bg-white focus:outline-none focus:border-emerald-600 transition"
                    />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Items / Page</span>
                  </div>
                </div>

                <ProductForm 
                  products={products}
                  onChange={setProducts}
                  productsPerPage={campaign.productsPerPage}
                  productsPerPageSubsequent={campaign.productsPerPageSubsequent}
                  onLimitChange={(limitType, val) => {
                    setCampaign(prev => ({
                      ...prev,
                      [limitType]: val
                    }));
                  }}
                />
              </div>
            )}

            {/* FOOTER & ADDRESS CHANNELS */}
            {activeTab === "footer" && (
              <div className="space-y-4">
                
                {/* Custom Footer Brand Logo */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Custom Footer Brand Logo
                  </label>
                  <div className="flex items-center gap-4 border border-slate-200 rounded-xl bg-slate-50 p-4">
                    <div className="h-16 w-16 bg-white border border-slate-200 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
                      {campaign.footerLogoUrl ? (
                        <img src={campaign.footerLogoUrl} alt="Footer Logo" className="max-h-full max-w-full object-contain p-1" />
                      ) : (
                        <Plus className="h-5 w-5 text-slate-300" />
                      )}
                    </div>
                    <div className="grow flex flex-wrap gap-2 items-center">
                      <label className="cursor-pointer bg-white border border-slate-200 hover:border-slate-350 hover:bg-slate-50 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 transition inline-block">
                        Upload Footer Logo
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleLogoUpload(e, "footerLogo")}
                          className="hidden"
                        />
                      </label>
                      <p className="text-[10px] text-slate-400 w-full mt-1.5 font-semibold">Square or landscape logo works best.</p>
                    </div>
                  </div>
                </div>

                {/* Text Logo Brand inputs */}
                {!campaign.footerLogoUrl && (
                  <div className="grid grid-cols-3 gap-2 border border-slate-200 rounded-xl bg-slate-50 p-4">
                    <div className="col-span-3 text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-0.5">
                      Footer Text Logo Branding
                    </div>
                    <div>
                      <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Logo Part 1
                      </label>
                      <input
                        type="text"
                        value={campaign.footerBrandName1 || ""}
                        onChange={(e) => setCampaign(prev => ({ ...prev, footerBrandName1: e.target.value }))}
                        placeholder="We"
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Logo Part 2
                      </label>
                      <input
                        type="text"
                        value={campaign.footerBrandName2 || ""}
                        onChange={(e) => setCampaign(prev => ({ ...prev, footerBrandName2: e.target.value }))}
                        placeholder="Five"
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Logo Subtitle
                      </label>
                      <input
                        type="text"
                        value={campaign.footerBrandSub || ""}
                        onChange={(e) => setCampaign(prev => ({ ...prev, footerBrandSub: e.target.value }))}
                        placeholder="HYPERMARKET"
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600 transition"
                      />
                    </div>
                  </div>
                )}

                {/* Store Phone */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Store Contact Phone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={campaign.phone}
                      onChange={(e) => setCampaign(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+91 9000000001"
                      className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600 transition"
                    />
                  </div>
                </div>

                {/* WhatsApp */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    WhatsApp Hotline
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={campaign.whatsapp}
                      onChange={(e) => setCampaign(prev => ({ ...prev, whatsapp: e.target.value }))}
                      placeholder="+91 9000000000"
                      className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600 transition"
                    />
                  </div>
                </div>

                {/* Store Name / Address Header */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Store Name (Address Header)
                  </label>
                  <input
                    type="text"
                    value={campaign.companyName || ""}
                    onChange={(e) => setCampaign(prev => ({ ...prev, companyName: e.target.value }))}
                    placeholder="e.g. DEMO STORE"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600 transition"
                  />
                </div>

                {/* Store Location */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Physical Store Address
                  </label>
                  <textarea
                    value={campaign.footerAddress}
                    onChange={(e) => setCampaign(prev => ({ ...prev, footerAddress: e.target.value }))}
                    placeholder="e.g. # 123, MAIN ROAD, CITY 600001"
                    rows={2}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white text-xs font-medium text-slate-900 focus:outline-none focus:border-emerald-600 transition resize-none leading-relaxed shadow-inner"
                  />
                </div>

                {/* Offer Terms */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Legal / Campaign Disclaimer
                  </label>
                  <textarea
                    value={campaign.terms}
                    onChange={(e) => setCampaign(prev => ({ ...prev, terms: e.target.value }))}
                    placeholder="e.g. Bulk purchase not allowed. Offer valid till stock last."
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white text-xs font-medium text-slate-900 focus:outline-none focus:border-emerald-600 transition resize-none leading-relaxed shadow-inner"
                  />
                </div>

              </div>
            )}
          </div>
        </div>

        {/* RIGHT VISUAL PREVIEW DISPLAY AREA */}
        <div className={`min-h-0 bg-[#f1f1f3] p-4 sm:p-6 flex flex-col overflow-hidden items-center justify-center ${
          mobileView === "preview" ? "flex" : "hidden lg:flex"
        }`}>
          
          <div className="w-full h-full max-w-[800px] flex flex-col justify-between">
            <BrochurePreview 
              campaign={campaign}
              products={products}
            />
          </div>
          
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
