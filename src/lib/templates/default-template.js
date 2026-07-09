/**
 * Default Brochure Template configuration.
 */
export const DefaultBrochureTemplate = {
  id: "default_template",
  name: "Classic Brochure Layout",
  defaultProductsPerPage: 12,

  renderPageOverlay() {
    return "";
  },

  renderHeader(campaign, pageNumber, totalPages) {
    const logoSrc = campaign.logoUrl || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=200";
    return `
      <div style="padding: 20px; border-bottom: 2px solid var(--primary-color); display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; align-items: center; gap: 15px;">
          <img src="${logoSrc}" alt="Logo" style="height: 55px; max-width: 125px; object-fit: contain;" />
          <div>
            <h1 style="font-size: 21px; font-weight: 700; color: var(--primary-color); margin: 0; font-family: 'Poppins', sans-serif;">${campaign.campaignTitle || "PROMO CAMPAIGN"}</h1>
            <p style="font-size: 12px; color: #6b7280; margin: 2px 0 0 0; font-family: 'Poppins', sans-serif;">${campaign.headerTitle || ""}</p>
          </div>
        </div>
        <div style="text-align: right; font-size: 11px; color: #4b5563; font-weight: 600; background: #f3f4f6; padding: 6px 12px; border-radius: 6px; font-family: 'Poppins', sans-serif;">
          Page ${pageNumber} of ${totalPages}
        </div>
      </div>
    `;
  },

  renderFooter(campaign, qrCodeSrc, pageNumber = 1, totalPages = 1) {
    const whatsappNum = campaign.whatsapp || "+91 8943313300";
    const phoneNum = campaign.phone || "+91 8086313300";
    return `
      <div class="footer">
        <div class="footer-address">
          <strong>${campaign.companyName || "STORE BRAND"}</strong>
          <p>${campaign.footerAddress || "Store location address details"}</p>
          <p style="font-size: 8px; color: #94a3b8; margin-top: 4px;">${campaign.terms || "Terms & Conditions apply."}</p>
        </div>
        <div class="footer-contact">
          <div style="font-size: 9px; font-weight: 700; color: var(--accent-color); border: 1px solid rgba(255,255,255,0.15); border-radius: 4px; padding: 4px 8px; background: rgba(255,255,255,0.05); text-align: center; white-space: nowrap; line-height: 1; align-self: center;">
            PAGE ${pageNumber} OF ${totalPages}
          </div>
          <div class="contact-item contact-phone">
            <span class="contact-icon">📞</span>
            <span>${phoneNum}</span>
          </div>
          <div class="contact-item contact-whatsapp">
            <span class="contact-icon">💬</span>
            <span>${whatsappNum}</span>
          </div>
          <div class="footer-qr">
            <img src="${qrCodeSrc}" alt="QR Link" />
          </div>
        </div>
      </div>
    `;
  },

  renderProductCard(product, currency = "INR") {
    const imageSrc = product.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=150";
    const oldPriceHtml = product.oldPrice 
      ? `<span class="old-price">${currency === 'INR' ? '₹' : currency} ${Number(product.oldPrice).toFixed(3)}</span>`
      : "";
    const badgeHtml = product.badgeText 
      ? `<span class="badge">${product.badgeText}</span>`
      : "";

    return `
      <div style="border: 1px solid #e5e7eb; border-radius: 12px; padding: 12px; display: flex; flex-direction: column; height: 100%; justify-content: space-between; background: white; position: relative;">
        ${badgeHtml}
        <div class="product-image-container">
          <img src="${imageSrc}" alt="${product.productName}" class="product-image" />
        </div>
        <div class="product-details">
          <div class="product-title">${product.productName}</div>
          ${product.quantity ? `<div class="product-quantity">${product.quantity}</div>` : ""}
          <div class="price-box">
            ${oldPriceHtml}
            <span class="offer-price"><span class="currency">${currency === 'INR' ? '₹' : currency}</span>${Number(product.offerPrice).toFixed(3)}</span>
          </div>
        </div>
      </div>
    `;
  },

  css(themeColor, campaign) {
    return `
    .grid-container {
      display: grid;
      flex-grow: 1;
      grid-template-columns: repeat(4, 1fr);
      grid-gap: 16px;
      padding: 20px;
      align-content: start;
      background-color: var(--bg-light);
    }
    .badge {
      position: absolute;
      top: 6px;
      right: 6px;
      background: var(--primary-color);
      color: white;
      font-size: 10px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 4px;
      z-index: 10;
      text-transform: uppercase;
    }
    .product-image-container {
      width: 100%;
      height: 110px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 8px;
      position: relative;
    }
    .product-image {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }
    .product-details {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      flex-grow: 1;
    }
    .product-title {
      font-size: 12px;
      font-weight: 600;
      color: #1f2937;
      line-height: 1.3;
      height: 32px;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
    .product-quantity {
      font-size: 10px;
      color: #6b7280;
      margin-top: 1px;
      font-weight: 500;
    }
    .price-box {
      margin-top: 6px;
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      background: #fef2f2;
      padding: 6px 8px;
      border-radius: 6px;
      border: 1px solid #fee2e2;
    }
    .old-price {
      font-size: 11px;
      color: #9ca3af;
      text-decoration: line-through;
      font-weight: 500;
    }
    .offer-price {
      font-size: 16px;
      font-weight: 800;
      color: var(--primary-color);
    }
    .currency {
      font-size: 9px;
      font-weight: 600;
      margin-right: 1px;
    }
    .footer {
      background-color: var(--dark-slate);
      color: white;
      padding: 16px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 4px solid var(--accent-color);
    }
    .footer-address {
      font-size: 10px;
      color: #94a3b8;
      max-width: 60%;
      line-height: 1.4;
    }
    .footer-address p {
      margin-bottom: 2px;
    }
    .footer-address strong {
      color: var(--accent-color);
      font-size: 11px;
    }
    .footer-contact {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .contact-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      font-weight: 600;
      background: rgba(255, 255, 255, 0.05);
      padding: 4px 10px;
      border-radius: 6px;
    }
    .contact-phone {
      color: #60a5fa;
    }
    .contact-whatsapp {
      color: #4ade80;
    }
    .footer-qr {
      background: white;
      padding: 4px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 56px;
      height: 56px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
    }
    .footer-qr img {
      width: 100%;
      height: 100%;
    }
    `;
  }
};
