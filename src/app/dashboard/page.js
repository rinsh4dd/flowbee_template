"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/auth-service";
import { dbService } from "@/lib/db-service";
import { seedDynamicTemplate } from "@/lib/seed-template";
import { 
  Plus, 
  LogOut, 
  Trash2, 
  Edit3, 
  Eye, 
  FileText, 
  FolderPlus, 
  FileDown, 
  Calendar, 
  X,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  Info,
  Search,
  Filter,
  ArrowUpRight,
  BarChart3,
  Layers
} from "lucide-react";
import Link from "next/link";
import FlowbeeLoader from "@/components/FlowbeeLoader";

function TemplateCardPreview({ template }) {
  const [htmlContent, setHtmlContent] = useState("");
  const [scale, setScale] = useState(0.3);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        const targetWidth = 794;
        setScale(width / targetWidth);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    const timeoutId = setTimeout(handleResize, 100);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    let mockCamp = {
      companyName: "Hypermarket",
      campaignTitle: "Weekly Offers",
      offerStartDate: new Date().toISOString().split("T")[0],
      offerEndDate: new Date(Date.now() + 3*24*60*60*1000).toISOString().split("T")[0],
      logoUrl: "https://flowbee.io/images/logo.png",
      footerAddress: "Muscat, Sultanate of Oman",
      phone: "+968 9000 0000",
      whatsapp: "+968 9000 0000",
      terms: "Offers valid until stock lasts.",
      templateId: template.id,
      themeColor: template.themeColor || "#dc2626"
    };

    if (template.id === "red_big_deals") {
      mockCamp = {
        ...mockCamp,
        companyName: "DEMO STORE",
        campaignTitle: "SEPTEMBER",
        headerTitle: "Bigger and Better deals are back",
        themeColor: "#e11d48"
      };
    } else if (template.id === "supermarket_flyer_yellow") {
      mockCamp = {
        ...mockCamp,
        campaignTitle: "Great Price Offer This Week",
        headerTitle: "SAVE UP TO 75% DISCOUNT ON GREAT SELECTION",
        headerBadgeText: "70%",
        phone: "0123 456 7890",
        whatsapp: "Loremipsum",
        themeColor: "#e2231a"
      };
    }

    const mockProds = [
      { id: "1", productName: "Fresh Red Apples", quantity: "1 Bag (Approx 1 Kg)", oldPrice: 1.200, offerPrice: 0.790, imageUrl: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=150", sortOrder: 0 },
      { id: "2", productName: "Cooking Oil Blend", quantity: "1.5 Litres Bottle", oldPrice: 2.100, offerPrice: 1.490, imageUrl: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=150", sortOrder: 1 },
      { id: "3", productName: "Long Grain Rice", quantity: "5 Kg Value Bag", oldPrice: 4.800, offerPrice: 3.490, imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=150", sortOrder: 2 },
      { id: "4", productName: "Fresh Orange Juice", quantity: "1 Litre Carafe", oldPrice: 0.950, offerPrice: 0.650, imageUrl: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=150", sortOrder: 3 }
    ];

    import("@/lib/pdf-template").then(({ generateBrochureHtml }) => {
      const isCustom = template.id !== "wefive_tuesday_market" && template.id !== "default_template";
      const html = generateBrochureHtml(mockCamp, mockProds, isCustom ? template : null);
      setHtmlContent(html);
    });
  }, [template]);

  if (!htmlContent) {
    return (
      <div className="w-full h-full bg-slate-50 animate-pulse flex items-center justify-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
        loading preview...
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="w-full h-full bg-white overflow-hidden relative select-none pointer-events-none"
    >
      <iframe
        srcDoc={htmlContent}
        style={{
          width: "794px",
          height: "1123px",
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          border: "none",
          overflow: "hidden",
          position: "absolute",
          top: 0,
          left: 0
        }}
        title={`template-card-${template.id}`}
        sandbox="allow-same-origin"
      />
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authChecking, setAuthChecking] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Authenticate user
  useEffect(() => {
    const unsubscribe = authService.subscribeToAuthChanges((currentUser) => {
      setAuthChecking(false);
      if (!currentUser) {
        router.push("/login");
      } else {
        setUser(currentUser);
        loadCampaigns(currentUser.uid);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const loadCampaigns = async (userId) => {
    try {
      // Seed dynamic templates in database if not present
      await seedDynamicTemplate();

      const [data, tpls] = await Promise.all([
        dbService.getCampaigns(userId),
        dbService.getTemplates()
      ]);
      const activeTemplates = tpls.filter(t => t.status === "active");
      setCampaigns(data);
      setTemplates(activeTemplates);
      if (!selectedTemplateId && activeTemplates.length > 0) {
        setSelectedTemplateId(activeTemplates[0].id);
      }
    } catch (error) {
      console.error("Failed to load campaigns:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleDelete = async (campaignId) => {
    if (!confirm("Are you sure you want to delete this campaign? All products inside will be permanently deleted.")) {
      return;
    }
    
    setDeletingId(campaignId);
    try {
      await dbService.deleteCampaign(campaignId);
      setCampaigns(campaigns.filter(c => c.id !== campaignId));
    } catch (error) {
      console.error("Failed to delete campaign:", error);
      alert("Failed to delete campaign");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownloadPdf = async (campaign) => {
    setDownloadingId(campaign.id);
    try {
      const products = await dbService.getProducts(campaign.id);
      
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
      console.error("PDF download failed:", error);
      alert("Failed to generate and download PDF. Ensure the server is running and puppeteer is installed.");
    } finally {
      setDownloadingId(null);
    }
  };

  // Filter campaigns list based on Search & Status Filters
  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = 
      campaign.campaignTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (campaign.companyName && campaign.companyName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = 
      statusFilter === "all" ? true : campaign.status === statusFilter;
      
    return matchesSearch && matchesStatus;
  });

  if (authChecking || loading) {
    return <FlowbeeLoader />;
  }

  // Statistics
  const totalCampaigns = campaigns.length;
  const completedCampaigns = campaigns.filter(c => c.status === "completed").length;
  const draftCampaigns = campaigns.filter(c => c.status === "draft").length;

  return (
    <div className="min-h-screen bg-[#fafafb] text-[#1e293b] font-sans selection:bg-[#f97316] selection:text-white flex flex-col justify-between">
      
      {/* Top Header Navbar matching Homepage */}
      <nav className="fixed top-0 left-0 right-0 w-full px-6 sm:px-12 z-40 bg-white/90 border-b border-slate-200/60 backdrop-blur-md shadow-xs py-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/">
            <img 
              src="https://flowbee.io/images/logo.png" 
              alt="flowbee logo" 
              className="h-4.5 w-auto object-contain" 
            />
          </Link>
        </div>

        {/* Center Navigation Links */}
        <div className="absolute left-1/2 -translate-x-1/2 hidden sm:flex items-center gap-8">
          <Link 
            href="/#templates" 
            className="text-[10px] font-bold tracking-widest text-slate-450 hover:text-slate-900 transition duration-200 uppercase"
          >
            TEMPLATES
          </Link>
          <Link 
            href="/dashboard" 
            className="text-[10px] font-bold tracking-widest text-slate-900 transition duration-200 uppercase"
          >
            WORKSPACE
          </Link>
        </div>

        {/* Right User Actions profile */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setProfileOpen(true)}
            className="h-9 w-9 rounded-full bg-slate-950 hover:bg-slate-800 text-white flex items-center justify-center font-bold text-xs border border-slate-200/50 shadow-sm transition duration-200 cursor-pointer"
            title={user?.email || "Profile"}
          >
            <span>{user?.email ? user.email[0].toUpperCase() : "U"}</span>
          </button>
        </div>
      </nav>

      {/* Page Content */}
      <main className="max-w-7xl w-full mx-auto px-6 sm:px-12 pt-28 pb-16 grow">
        
        {/* Welcome Section Banner */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200/60 rounded-3xl p-6 md:p-8 shadow-xs relative overflow-hidden">
          {/* Subtle decoration background grids */}
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial-gradient from-orange-500/5 to-transparent pointer-events-none" />
          
          <div className="text-left space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 lowercase">
              hello, {user?.email ? user.email.split('@')[0] : "creator"}
            </h1>
            <p className="text-slate-500 text-xs font-medium leading-relaxed max-w-xl">
              Welcome back to your campaign workspace. All templates are ready. You have generated {completedCampaigns} print-ready catalog files.
            </p>
          </div>

          <div className="flex flex-col items-end gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setShowTemplateSelector(prev => !prev)}
              className="inline-flex items-center gap-1.5 bg-[#f97316] hover:bg-[#ea580c] text-white text-xs font-bold px-5 py-3 rounded-2xl shadow-sm transition hover:scale-[1.01]"
            >
              <Plus className="h-4 w-4" />
              <span>Create Campaign</span>
            </button>

            {showTemplateSelector && (
              <div 
                className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
                style={{ animation: "fadeIn 0.2s ease-out" }}
              >
                {/* Animated Backdrop */}
                <div 
                  className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
                  onClick={() => setShowTemplateSelector(false)}
                  style={{ animation: "fadeIn 0.15s ease-out" }}
                />

                {/* Modal Container */}
                <div 
                  className="relative w-full max-w-5xl rounded-[32px] border border-white/20 bg-white shadow-2xl overflow-hidden"
                  style={{ animation: "slideUp 0.3s cubic-bezier(0.16,1,0.3,1)" }}
                >
                  {/* Gradient Header */}
                  <div className="relative bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100 px-8 py-7 overflow-hidden border-b border-emerald-200/60">
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-emerald-300/15 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-green-400/10 to-transparent rounded-full translate-y-1/2 -translate-x-1/2" />
                    
                    <div className="relative flex items-start justify-between gap-4">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-600/70 mb-2 block">New Campaign</span>
                        <h3 className="text-xl font-bold text-emerald-900 tracking-tight">Choose a Template</h3>
                        <p className="text-xs text-emerald-700/60 mt-1 font-medium max-w-md">Select a design layout to start building your promotional brochure. Each template is fully customizable.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowTemplateSelector(false)}
                        className="p-2.5 rounded-2xl bg-emerald-900/8 hover:bg-emerald-900/15 text-emerald-700/60 hover:text-emerald-900 transition-all duration-200 cursor-pointer shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Template Cards Grid */}
                  <div className="p-6 bg-gradient-to-b from-slate-50/80 to-white">
                    <div className="grid max-h-[55vh] grid-cols-1 gap-4 overflow-y-auto pr-1 sm:grid-cols-2 xl:grid-cols-3 scrollbar-thin">
                      {templates.map((template) => {
                        const isSelected = selectedTemplateId === template.id;
                        return (
                          <button
                            key={template.id}
                            type="button"
                            onClick={() => {
                              setSelectedTemplateId(template.id);
                              setShowTemplateSelector(false);
                              router.push(`/campaigns/new?templateId=${template.id}`);
                            }}
                            className={`group overflow-hidden rounded-2xl border-2 text-left transition-all duration-250 cursor-pointer hover:-translate-y-0.5 ${
                              isSelected
                                ? "border-orange-400 bg-gradient-to-b from-orange-50/80 to-white shadow-lg shadow-orange-200/50 ring-2 ring-orange-200/50"
                                : "border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/60"
                            }`}
                          >
                            {/* Template Preview */}
                            <div className="relative h-48 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-50">
                              <TemplateCardPreview template={template} />
                              
                              {/* Hover Overlay */}
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                                <span className="inline-flex items-center gap-1.5 bg-white/95 backdrop-blur-sm text-slate-900 text-[11px] font-bold px-4 py-2 rounded-xl shadow-lg">
                                  <ArrowRight className="h-3 w-3" />
                                  Use This Template
                                </span>
                              </div>

                              {/* Selected Badge */}
                              {isSelected && (
                                <div className="absolute top-3 right-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg shadow-md shadow-orange-500/30">
                                  ✓ Selected
                                </div>
                              )}

                              {/* Template Type Badge */}
                              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-slate-600 text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg shadow-sm border border-white/50">
                                {template.type === 'offer_brochure' ? '📄 Offer Brochure' : template.type}
                              </div>
                            </div>

                            {/* Template Info */}
                            <div className="p-4">
                              <div className="flex items-center justify-between gap-2 mb-1.5">
                                <h4 className="text-sm font-bold text-slate-900 group-hover:text-orange-600 transition-colors">{template.name}</h4>
                              </div>
                              <p className="text-[11px] leading-relaxed text-slate-500 font-medium line-clamp-2">
                                {template.description || "Ready to customize for your promotional campaign."}
                              </p>
                              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-3 text-[10px] font-semibold text-slate-400">
                                  <span className="flex items-center gap-1">
                                    <Layers className="h-3 w-3" />
                                    {template.productsPerPage || 8} items/page
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <FileText className="h-3 w-3" />
                                    A4 Print
                                  </span>
                                </div>
                                <ArrowUpRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-orange-500 transition-colors" />
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Empty State */}
                    {templates.length === 0 && (
                      <div className="text-center py-16">
                        <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                          <FileText className="h-6 w-6 text-slate-350" />
                        </div>
                        <p className="text-sm font-bold text-slate-600 mb-1">No Templates Available</p>
                        <p className="text-xs text-slate-400 font-medium">Templates will appear here once configured by an admin.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Keyframe Animations */}
                <style>{`
                  @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                  }
                  @keyframes slideUp {
                    from { opacity: 0; transform: translateY(24px) scale(0.97); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                  }
                `}</style>
              </div>
            )}
          </div>
        </div>

        {/* Analytics Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          
          {/* Card 1: Total campaigns */}
          <div className="bg-white border border-slate-200/60 rounded-3xl p-6 flex items-center justify-between shadow-xs hover:shadow-sm transition">
            <div className="space-y-1">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Active Campaigns</p>
              <h3 className="text-3xl font-bold text-slate-900">{totalCampaigns}</h3>
              <p className="text-[10px] text-slate-450 font-medium">Total registered files</p>
            </div>
            <div className="p-3.5 bg-orange-50 rounded-2xl border border-orange-100/50 text-[#f97316]">
              <FolderPlus className="h-5 w-5" />
            </div>
          </div>

          {/* Card 2: Drafts */}
          <div className="bg-white border border-slate-200/60 rounded-3xl p-6 flex items-center justify-between shadow-xs hover:shadow-sm transition">
            <div className="space-y-1">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Pending Drafts</p>
              <h3 className="text-3xl font-bold text-amber-600">{draftCampaigns}</h3>
              <p className="text-[10px] text-slate-450 font-medium">Work in progress</p>
            </div>
            <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-100/50 text-amber-500">
              <FileText className="h-5 w-5" />
            </div>
          </div>

          {/* Card 3: Completed */}
          <div className="bg-white border border-slate-200/60 rounded-3xl p-6 flex items-center justify-between shadow-xs hover:shadow-sm transition">
            <div className="space-y-1">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Exported PDFs</p>
              <h3 className="text-3xl font-bold text-emerald-600">{completedCampaigns}</h3>
              <p className="text-[10px] text-slate-450 font-medium">Ready flyer catalogs</p>
            </div>
            <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-100/50 text-emerald-500">
              <ShoppingBag className="h-5 w-5" />
            </div>
          </div>

        </div>

        {/* Campaigns Section - Full Width */}
        <div className="space-y-6 mb-14">
            
          {/* List Header, Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
            <h2 className="text-lg font-bold tracking-tight text-slate-900">Your Campaigns</h2>
              
            {/* Search and filter inputs */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search campaigns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#f97316] w-48 transition"
                />
              </div>
                
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-3 pr-8 py-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-800 focus:outline-none focus:border-[#f97316] appearance-none cursor-pointer font-semibold transition"
                >
                  <option value="all">All status</option>
                  <option value="completed">Completed</option>
                  <option value="draft">Drafts</option>
                </select>
                <Filter className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Campaign Cards list */}
          {filteredCampaigns.length === 0 ? (
            <div className="bg-white border border-slate-200/60 rounded-3xl p-16 text-center flex flex-col items-center justify-center shadow-xs">
              <FileText className="h-10 w-10 text-slate-300 mb-3" />
              <h3 className="font-bold text-base text-slate-800">No campaigns found</h3>
              <p className="text-slate-450 text-xs max-w-xs mt-1 leading-relaxed">
                {searchTerm || statusFilter !== "all" 
                  ? "No files match your search criteria. Try updating filters." 
                  : "You haven't created any campaigns yet. Pick a template below to start!"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCampaigns.map((campaign) => (
                <div 
                  key={campaign.id}
                  className="bg-white border border-slate-200/60 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-xs hover:translate-y-[-1px] hover:shadow-sm transition duration-200"
                >
                  {/* Left: Mock Thumbnail illustration & metadata details */}
                  <div className="flex items-center gap-4">
                    {/* Mini Mock brochure illustration */}
                    <div className="hidden xs:flex h-16 w-12 rounded-lg border border-slate-200 bg-slate-50 p-1 flex-col justify-between shrink-0 select-none">
                      <div className="h-1 w-full bg-[#f97316]/30 rounded-xs" />
                      <div className="grid grid-cols-2 gap-0.5">
                        <div className="h-5 bg-slate-200/80 rounded-xs" />
                        <div className="h-5 bg-slate-200/80 rounded-xs" />
                        <div className="h-5 bg-slate-200/80 rounded-xs" />
                        <div className="h-5 bg-slate-200/80 rounded-xs" />
                      </div>
                      <div className="h-1 w-2/3 bg-slate-300/40 rounded-xs self-start" />
                    </div>

                    <div className="space-y-1 text-left">
                      <div className="flex items-center flex-wrap gap-2">
                        <span className="font-bold text-slate-900 text-sm">{campaign.campaignTitle}</span>
                        <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full border tracking-wide uppercase ${
                          campaign.status === "completed" 
                            ? "bg-emerald-50 border-emerald-100 text-emerald-600" 
                            : "bg-amber-50 border-amber-100 text-amber-600"
                        }`}>
                          {campaign.status === "completed" ? "Completed" : "Draft"}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{campaign.companyName || "ABC Super Market"}</p>
                        
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium pt-0.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>
                          {campaign.offerStartDate && new Date(campaign.offerStartDate).toLocaleDateString()} - {campaign.offerEndDate && new Date(campaign.offerEndDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Quick actions buttons */}
                  <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3 sm:border-t-0 sm:pt-0 justify-end">
                    <Link 
                      href={`/preview/${campaign.id}`}
                      target="_blank"
                      className="flex items-center gap-1 bg-slate-50 border border-slate-200 hover:border-slate-350 hover:bg-slate-100 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-800 transition"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Preview</span>
                    </Link>

                    <Link 
                      href={`/campaigns/new?id=${campaign.id}`}
                      className="flex items-center gap-1 bg-slate-50 border border-slate-200 hover:border-slate-350 hover:bg-slate-100 px-3.5 py-2 rounded-xl text-xs font-bold text-blue-600 hover:text-blue-700 transition"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      <span>Edit</span>
                    </Link>

                    <button
                      onClick={() => handleDownloadPdf(campaign)}
                      disabled={downloadingId === campaign.id}
                      className="flex items-center gap-1.5 bg-[#f97316] hover:bg-[#ea580c] px-4 py-2 rounded-xl text-xs font-bold text-white transition disabled:opacity-50 cursor-pointer shadow-xs"
                    >
                      {downloadingId === campaign.id ? (
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

                    <button
                      onClick={() => handleDelete(campaign.id)}
                      disabled={deletingId === campaign.id}
                      className="flex items-center justify-center p-2 bg-slate-50 border border-slate-200 hover:border-red-200 hover:text-red-500 rounded-xl transition text-slate-400 cursor-pointer"
                      title="Delete Campaign"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Available Templates - Full Width Grid */}
        <div className="space-y-6 text-left">
          <h2 className="text-lg font-bold tracking-tight text-slate-900">Available Templates</h2>
            
          {templates.length === 0 ? (
            <div className="bg-white border border-slate-200/60 rounded-3xl p-12 text-center flex flex-col items-center justify-center shadow-xs">
              <Layers className="h-8 w-8 text-slate-300 mb-2" />
              <p className="text-slate-400 text-xs font-bold">No templates available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {templates.map((template) => (
                <div 
                  key={template.id} 
                  className="group border border-slate-200/80 hover:border-slate-300/40 rounded-3xl overflow-hidden bg-white hover:shadow-[0_20px_45px_-15px_rgba(0,0,0,0.08)] hover:scale-[1.01] hover:-translate-y-1 transition-all duration-300 ease-out flex flex-col justify-between"
                >
                  {/* Top Preview Card Viewport */}
                  <div className="h-64 relative w-full overflow-hidden shrink-0 border-b border-slate-100/80 bg-slate-50">
                    <div className="absolute inset-0 group-hover:scale-[1.04] transition-transform duration-500 ease-out z-10">
                      <TemplateCardPreview template={template} />
                    </div>
                    {/* Badge Overlay: Category type */}
                    <span className="absolute top-4 left-4 text-white font-extrabold text-[8px] uppercase tracking-widest bg-slate-900/90 border border-slate-800/35 px-3 py-1.5 rounded-xl shadow-md z-20 select-none">
                      {template.type === 'offer_brochure' ? 'Offer Brochure' : template.type}
                    </span>
                    {/* Badge Overlay: Print specification */}
                    <div className="absolute top-4 right-4 text-[8px] font-extrabold text-white bg-gradient-to-r from-emerald-500 to-teal-500 border border-emerald-400/25 px-3 py-1.5 rounded-xl shadow-md z-20 uppercase tracking-widest select-none">
                      A4 Layout
                    </div>
                  </div>

                  {/* Bottom details card metadata and CTA trigger */}
                  <div className="p-6 flex flex-col justify-between grow">
                    <div className="text-left">
                      <h3 className="font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-[#f97316] transition-colors duration-250">
                        {template.name}
                      </h3>
                      <p className="text-[11px] text-slate-450 mt-2 leading-relaxed font-semibold line-clamp-2">
                        {template.description}
                      </p>
                    </div>
                    <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                      <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-extrabold uppercase tracking-widest select-none">
                        <Layers className="h-4 w-4 text-slate-300" />
                        <span>{template.defaultProductsPerPage || 8} products per page</span>
                      </div>
                      <Link
                        href={`/campaigns/new?templateId=${template.id}`}
                        className="flex items-center gap-1 bg-gradient-to-r from-[#f97316] to-[#ea580c] hover:from-[#ea580c] hover:to-[#ea580c] text-white font-extrabold text-[9px] uppercase tracking-widest px-4 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform group-hover:scale-[1.02]"
                      >
                        <span>Use layout</span>
                        <ArrowUpRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* User profile detail dropdown modal right drawer */}
      {user && (
        <div className={`fixed inset-0 z-50 transition-all duration-300 ${profileOpen ? "visible" : "invisible"}`}>
          {/* Backdrop overlay */}
          <div 
            className={`fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300 ${
              profileOpen ? "opacity-100" : "opacity-0"
            }`}
            onClick={() => setProfileOpen(false)}
          />
          {/* Drawer Panel */}
          <div className={`fixed right-0 top-0 h-full w-96 max-w-full bg-white border-l border-slate-200 shadow-2xl z-55 p-6 flex flex-col justify-between transform transition-transform duration-300 ${
            profileOpen ? "translate-x-0" : "translate-x-full"
          }`}>
            <div>
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                <h3 className="font-bold text-slate-855 text-[10px] tracking-widest uppercase">User Details</h3>
                <button 
                  onClick={() => setProfileOpen(false)}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Info details */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-slate-950 text-white flex items-center justify-center font-bold text-base border border-slate-200 shadow-sm">
                    {user.email ? user.email[0].toUpperCase() : "U"}
                  </div>
                  <div className="text-left">
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Logged In As</p>
                    <p className="text-xs font-bold text-slate-900 truncate max-w-45">{user.email}</p>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3 text-left">
                  <div>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Account Role</p>
                    <p className="text-xs font-bold text-slate-800 uppercase mt-0.5 tracking-wide">
                      {user.role || "User"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">User ID</p>
                    <p className="text-[9px] font-mono text-slate-500 mt-0.5 truncate">{user.uid}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action panel */}
            <div className="space-y-3">
              <Link 
                href="/dashboard"
                className="flex items-center justify-center gap-1.5 w-full bg-[#111111] hover:bg-slate-800 text-white py-3 rounded-xl text-xs font-bold transition duration-200"
                onClick={() => setProfileOpen(false)}
              >
                <span>Go to Workspace</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              
              {user.role === "admin" && (
                <Link 
                  href="/admin/templates"
                  className="flex items-center justify-center gap-1.5 w-full bg-slate-100 hover:bg-slate-200 text-slate-800 py-3 rounded-xl text-xs font-bold transition duration-200"
                  onClick={() => setProfileOpen(false)}
                >
                  <span>Admin Settings</span>
                </Link>
              )}

              <button
                onClick={async () => {
                  setProfileOpen(false);
                  await handleLogout();
                }}
                className="flex items-center justify-center gap-1.5 w-full border border-slate-200 hover:bg-red-50 hover:border-red-200 text-slate-700 hover:text-red-600 py-3 rounded-xl text-xs font-bold transition duration-200 cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Section */}
      <footer className="bg-slate-50 border-t border-slate-200/80 w-full py-12">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-medium">
          <p>© 2026 flowbee. striking concepts in brochure layout design.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-650 transition">Terms of Service</a>
            <a href="#" className="hover:text-slate-650 transition">Privacy Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
