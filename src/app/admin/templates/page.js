"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/auth-service";
import { dbService } from "@/lib/db-service";
import { 
  Plus, 
  Check, 
  Palette,
  Layers,
  Edit2,
  Trash2,
  Compass,
  Link2,
  LogOut,
  ArrowUp,
  ArrowDown,
  X,
  Settings,
  Grid,
  FileText,
  GripVertical
} from "lucide-react";
import { AdminRoute } from "@/components/AuthGuard";

function RealBrochureThumbnail({ template }) {
  const [htmlContent, setHtmlContent] = useState("");

  useEffect(() => {
    const mockCamp = {
      companyName: "preview store",
      campaignTitle: "weekend offer",
      offerStartDate: new Date().toISOString().split("T")[0],
      offerEndDate: new Date(Date.now() + 3*24*60*60*1000).toISOString().split("T")[0],
      logoUrl: "https://flowbee.io/images/logo.png",
      footerAddress: "Muscat branch, Sultanate of Oman",
      phone: "+968 9000 0000",
      whatsapp: "+968 9000 0000",
      terms: "Offers valid until stock lasts.",
      templateId: template.id,
      themeColor: template.themeColor || "#dc2626",
      headerBgColor: template.headerBgColor || "#dc2626",
      accentColor: template.accentColor || "#facc15",
      textColor: template.textColor || "#1f2937",
      priceColor: template.priceColor || "#dc2626",
      footerBgColor: template.footerBgColor || "#1e293b",
      oldPriceColor: template.oldPriceColor || "#9ca3af",
      layoutOrder: template.layoutOrder || ['header', 'products', 'footer']
    };

    const mockProds = [
      { id: "1", productName: "Fresh Red Apples", quantity: "1 Bag (Approx 1 Kg)", oldPrice: 1.200, offerPrice: 0.790, imageUrl: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=150", sortOrder: 0 },
      { id: "2", productName: "Cooking Oil Blend", quantity: "1.5 Litres Bottle", oldPrice: 2.100, offerPrice: 1.490, imageUrl: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=150", sortOrder: 1 },
      { id: "3", productName: "Long Grain Rice", quantity: "5 Kg Value Bag", oldPrice: 4.800, offerPrice: 3.490, imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=150", sortOrder: 2 },
      { id: "4", productName: "Fresh Orange Juice", quantity: "1 Litre Carafe", oldPrice: 0.950, offerPrice: 0.650, imageUrl: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=150", sortOrder: 3 }
    ];

    import("@/lib/pdf-template").then(({ generateBrochureHtml }) => {
      const html = generateBrochureHtml(mockCamp, mockProds);
      setHtmlContent(html);
    });
  }, [template]);

  if (!htmlContent) {
    return (
      <div className="w-[120px] h-[170px] bg-slate-50 animate-pulse rounded-lg border border-slate-200 flex items-center justify-center text-[10px] text-slate-400">
        loading...
      </div>
    );
  }

  return (
    <div className="w-[120px] h-[170px] border border-slate-200 rounded-lg shadow-sm bg-white overflow-hidden relative select-none pointer-events-none">
      <iframe
        srcDoc={htmlContent}
        style={{
          width: "794px",
          height: "1123px",
          transform: "scale(0.151)",
          transformOrigin: "top left",
          border: "none",
          overflow: "hidden"
        }}
        title={`brochure-admin-${template.id}`}
        sandbox="allow-same-origin"
      />
    </div>
  );
}

function TemplateSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-700 font-sans flex flex-col">
      <header className="border-b border-slate-200/80 bg-white px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-slate-200 rounded-xl animate-pulse" />
          <div>
            <div className="h-5 w-40 bg-slate-200 rounded animate-pulse mb-1.5" />
            <div className="h-3.5 w-64 bg-slate-200 rounded animate-pulse" />
          </div>
        </div>
      </header>
      <main className="grow max-w-6xl w-full mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-md space-y-5">
            <div className="h-6 w-32 bg-slate-200 rounded animate-pulse mb-6" />
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 w-16 bg-slate-200 rounded animate-pulse" />
                <div className="h-10 w-full bg-slate-200 rounded-xl animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

function AdminTemplatesPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState("details"); // details, layout, colors
  const [draggedIndex, setDraggedIndex] = useState(null);

  const [form, setForm] = useState({
    id: "",
    name: "",
    type: "offer_brochure",
    status: "active",
    productsPerPage: 8,
    productsPerPageSubsequent: 10,
    description: "",
    themeColor: "#dc2626",
    headerBgColor: "#dc2626",
    accentColor: "#facc15",
    textColor: "#1f2937",
    priceColor: "#dc2626",
    footerBgColor: "#1e293b",
    oldPriceColor: "#9ca3af",
    layoutOrder: ["header", "products", "footer"],
    thumbnailUrl: ""
  });

  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const unsubscribe = authService.subscribeToAuthChanges((currentUser) => {
      if (!currentUser) {
        router.push("/login");
      } else {
        setUser(currentUser);
        loadTemplates();
      }
    });

    return () => unsubscribe();
  }, [router]);

  const loadTemplates = async () => {
    try {
      const data = await dbService.getTemplates();
      setTemplates(data);
    } catch (error) {
      console.error("Failed to load templates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.id) {
      alert("Template ID and Name are required!");
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await dbService.updateTemplate(editingId, form);
        setTemplates(templates.map(t => t.id === editingId ? { ...t, ...form } : t));
        setEditingId(null);
        setEditModalOpen(false);
      } else {
        const created = await dbService.createTemplate(form);
        setTemplates([...templates, created]);
      }

      setForm({
        id: "",
        name: "",
        type: "offer_brochure",
        status: "active",
        productsPerPage: 8,
        productsPerPageSubsequent: 10,
        description: "",
        themeColor: "#dc2626",
        headerBgColor: "#dc2626",
        accentColor: "#facc15",
        textColor: "#1f2937",
        priceColor: "#dc2626",
        footerBgColor: "#1e293b",
        oldPriceColor: "#9ca3af",
        layoutOrder: ["header", "products", "footer"],
        thumbnailUrl: ""
      });
    } catch (error) {
      console.error("Failed to save template:", error);
      alert("Failed to save template");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (template) => {
    setEditingId(template.id);
    setForm({
      ...template,
      productsPerPageSubsequent: template.productsPerPageSubsequent || 10,
      headerBgColor: template.headerBgColor || template.themeColor || "#dc2626",
      accentColor: template.accentColor || "#facc15",
      textColor: template.textColor || "#1f2937",
      priceColor: template.priceColor || template.themeColor || "#dc2626",
      footerBgColor: template.footerBgColor || "#1e293b",
      oldPriceColor: template.oldPriceColor || "#9ca3af",
      layoutOrder: template.layoutOrder || ["header", "products", "footer"]
    });
    setModalTab("details");
    setEditModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this template layout preset? This action cannot be undone.")) return;

    try {
      await dbService.deleteTemplate(id);
      setTemplates(templates.filter(t => t.id !== id));
      if (editingId === id) {
        setEditingId(null);
        setEditModalOpen(false);
      }
    } catch (error) {
      console.error("Failed to delete template:", error);
      alert("Failed to delete template");
    }
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const reordered = [...form.layoutOrder];
    const draggedItem = reordered[draggedIndex];
    reordered.splice(draggedIndex, 1);
    reordered.splice(index, 0, draggedItem);

    setForm(prev => ({
      ...prev,
      layoutOrder: reordered
    }));
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const moveComponent = (index, direction) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= form.layoutOrder.length) return;

    const reordered = [...form.layoutOrder];
    const temp = reordered[index];
    reordered[index] = reordered[nextIndex];
    reordered[nextIndex] = temp;
    
    setForm(prev => ({
      ...prev,
      layoutOrder: reordered
    }));
  };

  const componentNames = {
    header: "Branding Header Section",
    products: "Products Grid Section",
    footer: "Contacts Footer Section"
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-750 font-sans flex flex-col selection:bg-[#f97316] selection:text-white">
      {/* Header */}
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-xs">
        <div className="flex items-center gap-3">
          <img 
            src="https://flowbee.io/images/logo.png" 
            alt="flowbee admin logo" 
            className="h-6 w-auto object-contain shrink-0" 
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 tracking-tight lowercase">
                flowbee <span className="text-[9px] font-bold text-[#f97316] bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-full uppercase ml-1">admin console</span>
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">define brochure layout rules & moveable elements.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-full px-3.5 py-1.5 text-[10px] text-slate-500 font-bold shadow-2xs">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Presets: {templates.length}</span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 border border-red-100/85 hover:border-red-200 text-red-650 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="grow max-w-7xl w-full mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Register New Template Form (Only Creation) */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs sticky top-24">
            <h2 className="text-base font-bold text-slate-900 mb-6 flex items-center gap-1.5">
              <Compass className="h-4.5 w-4.5 text-[#f97316]" />
              <span>Register New Template</span>
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Template ID</label>
                <input
                  type="text"
                  required
                  value={form.id}
                  onChange={(e) => setForm(prev => ({ ...prev, id: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, "") }))}
                  placeholder="e.g. fashion_catalog"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 focus:outline-none focus:border-[#f97316] focus:bg-white text-xs placeholder-slate-400 font-medium transition"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Template Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Premium Fashion Flyer"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 focus:outline-none focus:border-[#f97316] focus:bg-white text-xs placeholder-slate-400 font-medium transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Category</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 focus:outline-none focus:border-[#f97316] focus:bg-white text-xs font-semibold cursor-pointer"
                  >
                    <option value="offer_brochure">Offer Brochure</option>
                    <option value="product_catalog">Product Catalog</option>
                    <option value="food_flyer">Food Flyer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 focus:outline-none focus:border-[#f97316] focus:bg-white text-xs font-semibold cursor-pointer"
                  >
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 bg-[#f97316] hover:bg-[#ea580c] rounded-xl text-xs font-bold text-white transition flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-xs cursor-pointer"
              >
                <Plus className="h-4 w-4" /> 
                <span>Register Layout Template</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Columns: Active Templates List Grid */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-base font-bold text-slate-900 tracking-tight">Active Configured Templates</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            {templates.map((template) => (
              <div 
                key={template.id}
                className="bg-white border border-slate-200 rounded-[24px] p-5 flex flex-col justify-between hover:border-slate-350 transition duration-200 relative overflow-hidden group shadow-xs hover:shadow-sm"
              >
                <div>
                  {/* Miniature template brochure preview */}
                  <div className="h-56 border border-slate-100 bg-slate-50 rounded-2xl mb-4 overflow-hidden relative flex justify-center items-center">
                    {template.thumbnailUrl ? (
                      <div className="w-full h-full relative flex items-center justify-center">
                        <img 
                          src={template.thumbnailUrl} 
                          alt={template.name} 
                          className="w-full h-full object-cover transition duration-300 group-hover:scale-105" 
                          onError={(e) => {
                            e.target.style.display = 'none';
                            const fallback = e.target.nextSibling;
                            if (fallback) e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div className="absolute inset-0 flex justify-center items-center hidden bg-slate-50">
                          <RealBrochureThumbnail template={template} />
                        </div>
                      </div>
                    ) : (
                      <RealBrochureThumbnail template={template} />
                    )}

                    <div className="absolute bottom-2 right-2 text-[8px] font-bold text-slate-550 bg-white/95 border border-slate-250 px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                      A4 PRINT TEMPLATE
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-50 border border-slate-200 text-slate-500 uppercase tracking-wider">
                      {template.type.replace('_', ' ')}
                    </span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                      template.status === "active" 
                        ? "bg-emerald-50 border-emerald-250 text-emerald-600" 
                        : "bg-slate-50 border-slate-200 text-slate-400"
                    }`}>
                      {template.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm mt-3 text-slate-900">{template.name}</h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed line-clamp-2 font-medium">
                    {template.description || "No layout description provided."}
                  </p>
                </div>

                <div className="mt-5 border-t border-slate-100 pt-4 flex flex-col gap-3">
                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-[10px] font-bold text-slate-450 uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                      <Layers className="h-3.5 w-3.5 text-slate-400" />
                      <span>Pages: {template.productsPerPage}/{template.productsPerPageSubsequent || 10} Items</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Palette className="h-3.5 w-3.5 text-slate-400" />
                      <span className="flex items-center gap-1 lowercase">
                        color: 
                        <span 
                          style={{ backgroundColor: template.themeColor }} 
                          className="h-2.5 w-2.5 rounded-full border border-slate-200 inline-block shrink-0"
                        />
                        {template.themeColor}
                      </span>
                    </div>
                  </div>

                  {/* Display moveable order list summary */}
                  <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200/50 flex flex-wrap gap-1 text-[9px] font-bold text-slate-455 uppercase">
                    <span className="mr-1">Order:</span>
                    {(template.layoutOrder || ["header", "products", "footer"]).map((s, idx) => (
                      <span key={s} className="text-slate-650">
                        {s} {idx < (template.layoutOrder || ["header", "products", "footer"]).length - 1 && "→"}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
                    <button
                      onClick={() => handleEdit(template)}
                      className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-350 text-slate-500 hover:text-slate-800 rounded-xl transition duration-150 cursor-pointer shadow-2xs"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    
                    <button
                      onClick={() => handleDelete(template.id)}
                      className="p-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-500 rounded-xl transition duration-150 cursor-pointer shadow-2xs"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Edit Design Configuration Modal Overlay */}
      {editModalOpen && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4">
          {/* Backdrop overlay */}
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300 opacity-100"
            onClick={() => setEditModalOpen(false)}
          />

          {/* Modal Container */}
          <div className="relative bg-white border border-slate-200/60 w-full max-w-lg p-6 sm:p-10 shadow-2xl rounded-3xl z-10 transition-all duration-300">
            {/* Close Button */}
            <button 
              onClick={() => setEditModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            {/* Title */}
            <h2 className="text-lg font-bold text-slate-900 mb-4 text-left flex items-center gap-1.5">
              <Settings className="h-5 w-5 text-[#f97316]" />
              <span>Customize Design: {form.name}</span>
            </h2>

            {/* Modal Tabs */}
            <div className="flex border-b border-slate-200 mb-6 gap-2">
              <button
                type="button"
                onClick={() => setModalTab("details")}
                className={`pb-2.5 px-3 font-bold text-xs flex items-center gap-1 border-b-2 transition cursor-pointer ${
                  modalTab === "details" ? "border-[#f97316] text-[#f97316]" : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Details</span>
              </button>

              <button
                type="button"
                onClick={() => setModalTab("layout")}
                className={`pb-2.5 px-3 font-bold text-xs flex items-center gap-1 border-b-2 transition cursor-pointer ${
                  modalTab === "layout" ? "border-[#f97316] text-[#f97316]" : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                <Grid className="h-3.5 w-3.5" />
                <span>Structure</span>
              </button>

              <button
                type="button"
                onClick={() => setModalTab("colors")}
                className={`pb-2.5 px-3 font-bold text-xs flex items-center gap-1 border-b-2 transition cursor-pointer ${
                  modalTab === "colors" ? "border-[#f97316] text-[#f97316]" : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                <Palette className="h-3.5 w-3.5" />
                <span>Colors</span>
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="space-y-5 text-left">
              {/* Tab 1: Details */}
              {modalTab === "details" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">Template ID</label>
                      <input
                        type="text"
                        disabled
                        value={form.id}
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-550 text-xs font-semibold opacity-70"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">Template Name</label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 focus:outline-none focus:border-[#f97316] focus:bg-white text-xs font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">Description</label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                      rows={2}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 focus:outline-none focus:border-[#f97316] focus:bg-white text-xs resize-none font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">Thumbnail URL</label>
                    <input
                      type="text"
                      value={form.thumbnailUrl || ""}
                      onChange={(e) => setForm(prev => ({ ...prev, thumbnailUrl: e.target.value }))}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 focus:outline-none focus:border-[#f97316] focus:bg-white text-xs font-medium"
                    />
                  </div>
                </div>
              )}

              {/* Tab 2: Layout & structure */}
              {modalTab === "layout" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">Page 1 Max Items</label>
                      <input
                        type="number"
                        min="4"
                        max="30"
                        value={form.productsPerPage}
                        onChange={(e) => setForm(prev => ({ ...prev, productsPerPage: parseInt(e.target.value) || 8 }))}
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 focus:outline-none focus:border-[#f97316] focus:bg-white text-xs font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">Page 2+ Max Items</label>
                      <input
                        type="number"
                        min="4"
                        max="30"
                        value={form.productsPerPageSubsequent}
                        onChange={(e) => setForm(prev => ({ ...prev, productsPerPageSubsequent: parseInt(e.target.value) || 10 }))}
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 focus:outline-none focus:border-[#f97316] focus:bg-white text-xs font-semibold"
                      />
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/50 space-y-3">
                    <div className="flex flex-col gap-0.5 text-left border-b border-slate-200 pb-2 mb-2">
                      <span className="block text-[9px] font-bold text-slate-450 uppercase tracking-widest">Reorder Brochure Components</span>
                      <span className="block text-[8px] text-slate-400 font-bold uppercase tracking-wider">Drag and drop rows below to rearrange catalog structure layout</span>
                    </div>
                    <div className="space-y-2">
                      {form.layoutOrder.map((section, index) => (
                        <div 
                          key={section}
                          draggable="true"
                          onDragStart={(e) => handleDragStart(e, index)}
                          onDragOver={(e) => handleDragOver(e, index)}
                          onDragEnd={handleDragEnd}
                          onDrop={(e) => handleDrop(e, index)}
                          className={`bg-white border rounded-xl p-3 flex items-center justify-between shadow-2xs cursor-grab active:cursor-grabbing transition duration-150 ${
                            draggedIndex === index 
                              ? "border-[#f97316]/65 bg-orange-50/15 opacity-55 scale-[0.99] select-none" 
                              : "border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <GripVertical className="h-4 w-4 text-slate-400 shrink-0 cursor-grab" />
                            <span className="text-[11px] font-bold text-slate-800">{componentNames[section]}</span>
                          </div>
                          <span className="text-[9px] font-extrabold text-slate-400 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md uppercase tracking-wider select-none">
                            Pos {index + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Colors */}
              {modalTab === "colors" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Theme Color</label>
                    <div className="flex gap-1.5 items-center bg-slate-50 border border-slate-200 rounded-xl p-2">
                      <input
                        type="color"
                        value={form.themeColor}
                        onChange={(e) => setForm(prev => ({ ...prev, themeColor: e.target.value }))}
                        className="h-8 w-8 border border-slate-200 rounded-lg cursor-pointer bg-white"
                      />
                      <input
                        type="text"
                        value={form.themeColor}
                        onChange={(e) => setForm(prev => ({ ...prev, themeColor: e.target.value }))}
                        className="w-full px-2 py-1.5 border border-slate-200 rounded-xl bg-white text-slate-900 text-[10px] font-semibold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Accent Color</label>
                    <div className="flex gap-1.5 items-center bg-slate-50 border border-slate-200 rounded-xl p-2">
                      <input
                        type="color"
                        value={form.accentColor}
                        onChange={(e) => setForm(prev => ({ ...prev, accentColor: e.target.value }))}
                        className="h-8 w-8 border border-slate-200 rounded-lg cursor-pointer bg-white"
                      />
                      <input
                        type="text"
                        value={form.accentColor}
                        onChange={(e) => setForm(prev => ({ ...prev, accentColor: e.target.value }))}
                        className="w-full px-2 py-1.5 border border-slate-200 rounded-xl bg-white text-slate-900 text-[10px] font-semibold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Header BG</label>
                    <div className="flex gap-1.5 items-center bg-slate-50 border border-slate-200 rounded-xl p-2">
                      <input
                        type="color"
                        value={form.headerBgColor}
                        onChange={(e) => setForm(prev => ({ ...prev, headerBgColor: e.target.value }))}
                        className="h-8 w-8 border border-slate-200 rounded-lg cursor-pointer bg-white"
                      />
                      <input
                        type="text"
                        value={form.headerBgColor}
                        onChange={(e) => setForm(prev => ({ ...prev, headerBgColor: e.target.value }))}
                        className="w-full px-2 py-1.5 border border-slate-200 rounded-xl bg-white text-slate-900 text-[10px] font-semibold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Footer BG</label>
                    <div className="flex gap-1.5 items-center bg-slate-50 border border-slate-200 rounded-xl p-2">
                      <input
                        type="color"
                        value={form.footerBgColor}
                        onChange={(e) => setForm(prev => ({ ...prev, footerBgColor: e.target.value }))}
                        className="h-8 w-8 border border-slate-200 rounded-lg cursor-pointer bg-white"
                      />
                      <input
                        type="text"
                        value={form.footerBgColor}
                        onChange={(e) => setForm(prev => ({ ...prev, footerBgColor: e.target.value }))}
                        className="w-full px-2 py-1.5 border border-slate-200 rounded-xl bg-white text-slate-900 text-[10px] font-semibold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Title Text</label>
                    <div className="flex gap-1.5 items-center bg-slate-50 border border-slate-200 rounded-xl p-2">
                      <input
                        type="color"
                        value={form.textColor}
                        onChange={(e) => setForm(prev => ({ ...prev, textColor: e.target.value }))}
                        className="h-8 w-8 border border-slate-200 rounded-lg cursor-pointer bg-white"
                      />
                      <input
                        type="text"
                        value={form.textColor}
                        onChange={(e) => setForm(prev => ({ ...prev, textColor: e.target.value }))}
                        className="w-full px-2 py-1.5 border border-slate-200 rounded-xl bg-white text-slate-900 text-[10px] font-semibold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Offer Price</label>
                    <div className="flex gap-1.5 items-center bg-slate-50 border border-slate-200 rounded-xl p-2">
                      <input
                        type="color"
                        value={form.priceColor}
                        onChange={(e) => setForm(prev => ({ ...prev, priceColor: e.target.value }))}
                        className="h-8 w-8 border border-slate-200 rounded-lg cursor-pointer bg-white"
                      />
                      <input
                        type="text"
                        value={form.priceColor}
                        onChange={(e) => setForm(prev => ({ ...prev, priceColor: e.target.value }))}
                        className="w-full px-2 py-1.5 border border-slate-200 rounded-xl bg-white text-slate-900 text-[10px] font-semibold"
                      />
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 mt-4 bg-[#f97316] hover:bg-[#ea580c] rounded-xl text-xs font-bold text-white transition flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-xs cursor-pointer"
              >
                {saving ? (
                  <span className="inline-block animate-spin border-2 border-white border-t-transparent rounded-full h-4 w-4"></span>
                ) : (
                  <>
                    <Check className="h-4 w-4" /> Save Template Changes
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminRoute(AdminTemplatesPage);
