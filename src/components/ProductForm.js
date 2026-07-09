"use client";

import { useState } from "react";
import { Plus, Trash2, ArrowUp, ArrowDown, Edit2, Check, X, Image as ImageIcon } from "lucide-react";

export default function ProductForm({ 
  products, 
  onChange, 
  productsPerPage = 15, 
  productsPerPageSubsequent = 20 
}) {
  const [editingId, setEditingId] = useState(null);
  const [selectedViewPage, setSelectedViewPage] = useState(1);
  const [form, setForm] = useState({
    productName: "",
    quantity: "",
    oldPrice: "",
    offerPrice: "",
    badgeText: "",
    imageUrl: ""
  });

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert file to Base64 data URL for local storage fallback
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm(prev => ({ ...prev, imageUrl: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleAddOrUpdate = (e) => {
    e.preventDefault();
    if (!form.productName || !form.offerPrice) {
      alert("Product name and offer price are required!");
      return;
    }

    const maxCapacity = productsPerPage + productsPerPageSubsequent;

    if (editingId) {
      // Update existing
      const updated = products.map(p => 
        p.id === editingId 
          ? { ...p, ...form }
          : p
      );
      onChange(updated);
      setEditingId(null);
    } else {
      // Enforce brochure-wide products capacity limit check
      if (products.length >= maxCapacity) {
        alert(`Maximum brochure layout capacity of ${maxCapacity} products (2 pages limit) has been reached! Please edit or delete existing items first.`);
        return;
      }

      // Create new
      const newProduct = {
        id: Math.random().toString(36).substring(2, 9),
        ...form,
        createdAt: new Date().toISOString()
      };
      onChange([...products, newProduct]);
    }

    // Reset Form
    setForm({
      productName: "",
      quantity: "",
      oldPrice: "",
      offerPrice: "",
      badgeText: "",
      imageUrl: ""
    });
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setForm({
      productName: product.productName,
      quantity: product.quantity || "",
      oldPrice: product.oldPrice || "",
      offerPrice: product.offerPrice,
      badgeText: product.badgeText || "",
      imageUrl: product.imageUrl || ""
    });
  };

  const handleDelete = (id) => {
    onChange(products.filter(p => p.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setForm({
        productName: "",
        quantity: "",
        oldPrice: "",
        offerPrice: "",
        badgeText: "",
        imageUrl: ""
      });
    }
  };

  const moveProduct = (index, direction) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= products.length) return;

    const reordered = [...products];
    const temp = reordered[index];
    reordered[index] = reordered[nextIndex];
    reordered[nextIndex] = temp;
    onChange(reordered);
  };

  const getProductPages = () => {
    const pageGroups = [];
    if (products.length === 0) {
      return [];
    }
    
    // Page 1 gets up to productsPerPage
    const page1Products = products.slice(0, productsPerPage).map((p, idx) => ({ ...p, originalIndex: idx, pageNum: 1 }));
    if (page1Products.length > 0) {
      pageGroups.push({ pageNum: 1, products: page1Products });
    }
    
    let remaining = products.slice(productsPerPage);
    let currentPageNum = 2;
    while (remaining.length > 0) {
      const group = remaining.slice(0, productsPerPageSubsequent).map((p, idx) => ({
        ...p,
        originalIndex: productsPerPage + (currentPageNum - 2) * productsPerPageSubsequent + idx,
        pageNum: currentPageNum
      }));
      pageGroups.push({ pageNum: currentPageNum, products: group });
      remaining = remaining.slice(productsPerPageSubsequent);
      currentPageNum++;
    }
    return pageGroups;
  };
  
  const pageGroups = getProductPages();
  const maxAvailablePage = pageGroups.length > 0 ? pageGroups.length : 1;
  const activePage = Math.min(selectedViewPage, maxAvailablePage);
  const activeGroup = pageGroups.find(g => g.pageNum === activePage) || { products: [] };
  const productsToRender = activeGroup.products;

  return (
    <div className="space-y-6">
      {/* Product Form */}
      <form onSubmit={handleAddOrUpdate} className="bg-slate-50/50 border border-slate-200/80 rounded-2xl p-5 space-y-4 shadow-3xs">
        <h3 className="font-bold text-sm text-slate-800 flex items-center justify-between">
          <span>{editingId ? "Edit Product Details" : "Add New Product Item"}</span>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm({ productName: "", quantity: "", oldPrice: "", offerPrice: "", badgeText: "", imageUrl: "" });
              }}
              className="text-slate-400 hover:text-slate-650 flex items-center gap-1 font-bold text-xs cursor-pointer"
            >
              <X className="h-3 w-3" /> Cancel Edit
            </button>
          )}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-2">Product Name *</label>
            <input
              type="text"
              required
              value={form.productName}
              onChange={(e) => setForm(prev => ({ ...prev, productName: e.target.value }))}
              placeholder="e.g. Fresh Mangoes Pack"
              className="w-full px-3.5 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 focus:outline-none focus:border-[#f97316] text-sm placeholder-slate-400 font-medium transition"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-455 uppercase tracking-wider mb-2">Quantity / Weight</label>
            <input
              type="text"
              value={form.quantity}
              onChange={(e) => setForm(prev => ({ ...prev, quantity: e.target.value }))}
              placeholder="e.g. 1 Bag (Approx 1 Kg)"
              className="w-full px-3.5 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 focus:outline-none focus:border-[#f97316] text-sm placeholder-slate-400 font-medium transition"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-455 uppercase tracking-wider mb-2">Old Price (Before Discount)</label>
            <input
              type="number"
              step="0.001"
              value={form.oldPrice}
              onChange={(e) => setForm(prev => ({ ...prev, oldPrice: e.target.value }))}
              placeholder="e.g. 1.200"
              className="w-full px-3.5 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 focus:outline-none focus:border-[#f97316] text-sm placeholder-slate-400 font-medium transition"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-455 uppercase tracking-wider mb-2">Offer Price *</label>
            <input
              type="number"
              step="0.001"
              required
              value={form.offerPrice}
              onChange={(e) => setForm(prev => ({ ...prev, offerPrice: e.target.value }))}
              placeholder="e.g. 0.790"
              className="w-full px-3.5 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 focus:outline-none focus:border-[#f97316] text-sm placeholder-slate-400 font-medium transition"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-455 uppercase tracking-wider mb-2">Promotion Badge Text</label>
            <input
              type="text"
              value={form.badgeText}
              onChange={(e) => setForm(prev => ({ ...prev, badgeText: e.target.value }))}
              placeholder="e.g. WOW, 25% OFF"
              maxLength={15}
              className="w-full px-3.5 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 focus:outline-none focus:border-[#f97316] text-sm placeholder-slate-400 font-medium transition"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-455 uppercase tracking-wider mb-2">Product Image Upload</label>
            <div className="flex gap-2 items-center">
              <label className="cursor-pointer flex items-center justify-center gap-1.5 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-800 transition grow">
                <ImageIcon className="h-4 w-4 shrink-0 text-slate-400" />
                <span>Select Image File</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
              
              {form.imageUrl && (
                <div className="h-[42px] w-[42px] rounded-xl border border-slate-200 bg-white flex items-center justify-center shrink-0 overflow-hidden relative group">
                  <img src={form.imageUrl} alt="preview" className="max-h-full max-w-full object-contain p-0.5" />
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, imageUrl: "" }))}
                    className="absolute inset-0 bg-red-500/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-150 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {(!editingId && products.length >= (productsPerPage + productsPerPageSubsequent)) && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[10px] text-amber-800 font-semibold flex items-center gap-1.5 shadow-2xs">
            <span>⚠️ Maximum layout capacity of {productsPerPage + productsPerPageSubsequent} items (2 pages limit) has been reached. Please edit or delete existing items to add more.</span>
          </div>
        )}

        <button
          type="submit"
          disabled={!editingId && products.length >= (productsPerPage + productsPerPageSubsequent)}
          className={`w-full py-3 rounded-xl text-xs font-bold text-white transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer ${
            (!editingId && products.length >= (productsPerPage + productsPerPageSubsequent))
              ? "bg-slate-350 cursor-not-allowed opacity-75"
              : "bg-[#f97316] hover:bg-[#ea580c]"
          }`}
        >
          {editingId ? (
            <>
              <Check className="h-4 w-4" /> Save Updated Details
            </>
          ) : products.length >= (productsPerPage + productsPerPageSubsequent) ? (
            <>
              Limit Reached (Max {productsPerPage + productsPerPageSubsequent} Items)
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" /> Add Product Item
            </>
          )}
        </button>
      </form>

      {/* Product List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h4 className="font-bold text-sm text-slate-800">Added Brochure Items ({products.length})</h4>
          {pageGroups.length > 1 && (
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Page {activePage} of {pageGroups.length}
            </span>
          )}
        </div>

        {/* Page Pagination Selector */}
        {pageGroups.length > 1 && (
          <div className="flex flex-wrap items-center gap-1.5 pb-1">
            {pageGroups.map(group => (
              <button
                key={group.pageNum}
                type="button"
                onClick={() => setSelectedViewPage(group.pageNum)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition duration-150 cursor-pointer ${
                  activePage === group.pageNum 
                    ? "bg-[#f97316] text-white shadow-xs" 
                    : "bg-slate-100 hover:bg-slate-200 text-slate-650"
                }`}
              >
                Page {group.pageNum} ({group.products.length})
              </button>
            ))}
          </div>
        )}

        {products.length === 0 ? (
          <div className="text-xs text-slate-400 font-medium bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-8 text-center flex flex-col items-center justify-center gap-2">
            <ImageIcon className="h-7 w-7 text-slate-300" />
            <span>No products added yet. Start by filling the form above!</span>
          </div>
        ) : (
          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {productsToRender.map((product) => (
              <div 
                key={product.id}
                className="bg-white border border-slate-200/80 rounded-xl p-3 flex items-center justify-between gap-3 text-slate-700 hover:shadow-2xs transition duration-150"
              >
                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex flex-col gap-1 shrink-0">
                    <button
                      type="button"
                      disabled={product.originalIndex === 0}
                      onClick={() => moveProduct(product.originalIndex, -1)}
                      className="text-slate-400 hover:text-slate-650 disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={product.originalIndex === products.length - 1}
                      onClick={() => moveProduct(product.originalIndex, 1)}
                      className="text-slate-400 hover:text-slate-650 disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="h-[42px] w-[42px] bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.productName} className="max-h-full max-w-full object-contain p-0.5" />
                    ) : (
                      <span className="text-[9px] text-slate-400 font-bold">No Img</span>
                    )}
                  </div>
                </div>

                <div className="grow min-w-0 text-left">
                  <div className="flex items-center gap-2">
                    <h5 className="font-bold text-xs text-slate-900 truncate">{product.productName}</h5>
                    {product.badgeText && (
                      <span className="text-[8px] bg-orange-50 text-orange-650 border border-orange-100/50 font-bold px-1 rounded-sm uppercase tracking-wide">
                        {product.badgeText}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-455 font-bold">
                    {product.quantity || "No size"} •{" "}
                    <span className="text-slate-900">OMR {Number(product.offerPrice).toFixed(3)}</span>
                    {product.oldPrice && (
                      <span className="text-slate-400 line-through ml-1.5 font-medium">OMR {Number(product.oldPrice).toFixed(3)}</span>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-[9px] font-bold text-slate-400 bg-slate-50 border border-slate-200/60 rounded-md px-1.5 py-0.5 mr-1 select-none">
                    P.{product.pageNum}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleEdit(product)}
                    className="p-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-lg transition cursor-pointer"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(product.id)}
                    className="p-2 bg-slate-50 border border-slate-200 hover:border-red-100 hover:text-red-650 rounded-lg transition cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
