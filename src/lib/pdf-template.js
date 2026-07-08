/**
 * Brochure PDF rendering engine.
 * Structured to support multiple templates, dynamic layout themes, 
 * page-breaking optimization, and custom color variations.
 */

// Helper to format currency dynamically based on selected type
const formatCurrency = (value, currency = "OMR") => {
  if (value === undefined || value === null || value === "") return "";
  const num = Number(value);
  if (isNaN(num)) return "";
  
  // Decide decimal places based on currency
  const decimals = ["OMR", "BHD", "KWD", "LYD", "IQD", "JOD"].includes(currency.toUpperCase()) ? 3 : 2;
  
  return `<span class="currency">${currency}</span>${num.toFixed(decimals)}`;
};

/**
 * Renders a single product card element.
 */
function renderProductCard(product, currency = "OMR") {
  const badgeHtml = product.badgeText 
    ? `<div class="badge">${product.badgeText}</div>` 
    : "";
  
  const oldPriceHtml = product.oldPrice 
    ? `<div class="old-price">${formatCurrency(product.oldPrice, currency)}</div>` 
    : "";

  const offerPriceHtml = product.offerPrice 
    ? `<div class="offer-price">${formatCurrency(product.offerPrice, currency)}</div>` 
    : `<div class="offer-price">-</div>`;

  const imageSrc = product.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=150";

  return `
    <div class="product-card">
      ${badgeHtml}
      <div class="product-image-container">
        <img class="product-image" src="${imageSrc}" alt="${product.productName || 'Product'}" />
      </div>
      <div class="product-details">
        <div>
          <div class="product-title">${product.productName || "Product"}</div>
          <div class="product-quantity">${product.quantity || ""}</div>
        </div>
        <div class="price-box">
          ${oldPriceHtml}
          ${offerPriceHtml}
        </div>
      </div>
    </div>
  `;
}

/**
 * Renders the top header block for a specific page.
 */
function renderHeader(campaign, pageNumber, totalPages) {
  const isFirstPage = pageNumber === 1;
  const logoSrc = campaign.logoUrl || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=200";

  const start = campaign.offerStartDate
    ? new Date(campaign.offerStartDate).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })
    : "";
  const end = campaign.offerEndDate
    ? new Date(campaign.offerEndDate).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })
    : "";
  const dateRangeText = [start ? `FROM ${start.toUpperCase()}` : "", end ? `TO ${end.toUpperCase()}` : ""].filter(Boolean).join(" ");
  const badgeText = campaign.headerBadgeText?.trim();
  const validity = badgeText && dateRangeText
    ? `VALID ${dateRangeText} • ${badgeText}`
    : (dateRangeText ? `VALID ${dateRangeText}` : (badgeText || "SPECIAL OFFERS"));

  if (isFirstPage) {
    return `
      <div class="header-main">
        <div class="logo-container">
          <img class="logo-img" src="${logoSrc}" alt="Logo" />
        </div>
        <div class="campaign-info">
          <div class="campaign-title" style="color:${campaign.titleColor || campaign.headerTitleColor || "#ffffff"};">${campaign.headerTitle || campaign.campaignTitle || campaign.companyName || "Promo Offers"}</div>
          ${campaign.headerSubtitle ? `<div class="campaign-subtitle" style="color:${campaign.headerSubtitleColor || campaign.accentColor || "#facc15"};">${campaign.headerSubtitle}</div>` : ""}
        </div>
        <div class="date-badge" style="background:${campaign.headerBadgeColor || campaign.accentColor || "#facc15"}; color:${campaign.headerBadgeTextColor || campaign.footerBgColor || "#1e293b"};">
          ${validity}
        </div>
      </div>
    `;
  }

  return `
    <div class="header-sub">
      <div class="header-sub-branding">
        <div class="logo-container-small">
          <img class="logo-img" src="${logoSrc}" alt="Logo" />
        </div>
        <div>
          <span class="header-sub-title" style="color:${campaign.headerTitleColor || campaign.accentColor || "#facc15"};">${campaign.headerTitle || campaign.campaignTitle || campaign.companyName || "Offers"}</span>
        </div>
      </div>
      <div class="header-sub-page">
        Page ${pageNumber} of ${totalPages}
      </div>
    </div>
  `;
}

/**
 * Renders the bottom contact branding footer for a specific page.
 */
function renderFooter(campaign, qrCodeSrc) {
  const phoneHtml = campaign.phone ? `
    <div class="contact-item contact-phone">
      <svg class="contact-icon" fill="currentColor" viewBox="0 0 20 20">
        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 6V3z"></path>
      </svg>
      <span>${campaign.phone}</span>
    </div>
  ` : "";

  const whatsappHtml = campaign.whatsapp ? `
    <div class="contact-item contact-whatsapp">
      <svg class="contact-icon" fill="currentColor" viewBox="0 0 24 24">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.197 1.45 4.817 1.458 5.463 0 9.907-4.447 9.91-9.913.002-2.65-1.02-5.14-2.877-6.998C16.592 1.844 14.1 .816 11.448.817 5.984.817 1.54 5.263 1.537 10.73c0 1.705.446 3.376 1.293 4.867l-.986 3.6 3.69-.968c1.47.802 3.12 1.226 4.741 1.228h.01zm11.285-7.391c-.302-.152-1.791-.883-2.059-.982-.268-.099-.463-.148-.658.148-.195.297-.756.982-.926 1.18-.17.198-.341.223-.644.072-.303-.152-1.278-.471-2.433-1.502-.899-.802-1.505-1.793-1.681-2.097-.176-.303-.019-.467.132-.617.136-.135.303-.353.454-.53.151-.177.202-.303.303-.505.101-.202.051-.378-.025-.53-.076-.151-.658-1.586-.901-2.172-.236-.57-.496-.492-.68-.501-.19-.009-.409-.011-.628-.011-.219 0-.576.082-.878.411-.303.33-1.159 1.133-1.159 2.763 0 1.63 1.187 3.203 1.353 3.424.165.223 2.336 3.567 5.66 5.002.79.341 1.41.544 1.892.7.796.253 1.52.217 2.09.132.637-.095 1.792-.732 2.046-1.439.254-.707.254-1.314.178-1.44-.076-.124-.282-.198-.584-.349z"/></svg>
      <span>${campaign.whatsapp}</span>
    </div>
  ` : "";

  return `
    <div class="footer">
      <div class="footer-address">
        <strong>${campaign.companyName || "Our Shop"}</strong>
        <p>${campaign.footerAddress || "Promotion offers. Terms & conditions apply."}</p>
      </div>
      <div class="footer-contact">
        ${phoneHtml}
        ${whatsappHtml}
      </div>
      <div class="footer-qr">
        <img src="${qrCodeSrc}" alt="Scan" />
      </div>
    </div>
  `;
}

/**
 * Main Layout Generator.
 * Compiles campaign and products schema into dynamic A4 A-grade print layout.
 */
export function generateBrochureHtml(campaign, products = []) {
  // Theme Color Configurations (Dynamic based on selected template)
  const themeColor = campaign.themeColor || "#dc2626";

  // Calculate items per page based on template settings
  const productsPerPageFirst = parseInt(campaign.productsPerPage) || 8;
  const productsPerPageSubsequent = parseInt(campaign.productsPerPageSubsequent) || 10;
  const productsPerPage = Math.max(1, productsPerPageFirst);
  
  const pages = [];
  let currentProductIndex = 0;
  
  while (currentProductIndex < products.length || pages.length === 0) {
    const isFirstPage = pages.length === 0;
    const limit = isFirstPage ? productsPerPageFirst : productsPerPageSubsequent;
    const pageProducts = products.slice(currentProductIndex, currentProductIndex + limit);
    pages.push({
      pageNumber: pages.length + 1,
      products: pageProducts
    });
    currentProductIndex += limit;
    
    if (pageProducts.length === 0 && currentProductIndex >= products.length) {
      break;
    }
  }

  // Generate WhatsApp link or Fallback URL inside QR Code
  const qrCodeSrc = campaign.qrCodeUrl || 
    `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
      campaign.whatsapp ? `https://wa.me/${campaign.whatsapp.replace(/\D/g, "")}` : `https://flowbee-templates.vercel.app`
    )}`;

  // Compile full page templates list
  const currency = campaign.currency || "OMR";
  const layoutOrder = campaign.layoutOrder || ["header", "products", "footer"];

  const renderedPagesHtml = pages.map((page) => {
    const sectionsHtml = layoutOrder.map(sectionId => {
      if (sectionId === "header") {
        return renderHeader(campaign, page.pageNumber, pages.length);
      }
      if (sectionId === "products") {
        return `
          <div class="grid-container">
            ${page.products.map(p => renderProductCard(p, currency)).join("")}
          </div>
        `;
      }
      if (sectionId === "footer") {
        return renderFooter(campaign, qrCodeSrc);
      }
      return "";
    }).join("");

    return `
      <div class="page-container">
        ${sectionsHtml}
      </div>
    `;
  }).join("");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${campaign.campaignTitle || "Promo flyer"}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary-color: ${themeColor};
      --header-bg-color: ${campaign.headerBgColor || themeColor};
      --accent-color: ${campaign.accentColor || "#facc15"};
      --dark-slate: ${campaign.footerBgColor || "#1e293b"};
      --bg-white: #ffffff;
      --bg-light: #fafafa;
      --border-gray: #e5e7eb;
      --text-color: ${campaign.textColor || "#1f2937"};
      --price-color: ${campaign.priceColor || themeColor};
      --old-price-color: ${campaign.oldPriceColor || "#9ca3af"};
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Poppins', sans-serif;
      background-color: #f3f4f6;
      color: #1f2937;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .page-container {
      width: 210mm;
      height: 297mm;
      background: var(--bg-white);
      position: relative;
      margin: 0 auto;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      overflow: hidden;
    }

    @media print {
      body {
        background-color: transparent;
      }
      .page-container {
        margin: 0;
        box-shadow: none;
        page-break-after: always;
        height: 297mm;
        width: 210mm;
      }
    }
    
    /* Header main styles */
    .header-main {
      background: linear-gradient(135deg, var(--header-bg-color) 0%, var(--header-bg-color)dd 100%);
      color: white;
      padding: 24px;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 6px solid var(--accent-color);
    }

    .header-sub {
      background: linear-gradient(135deg, var(--dark-slate) 0%, #0f172a 100%);
      color: white;
      padding: 12px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 4px solid var(--accent-color);
    }

    .header-sub-branding {
      display: flex; 
      align-items: center; 
      gap: 10px;
    }

    .header-sub-company {
      font-weight: 700; 
      font-size: 14px; 
      text-transform: uppercase;
    }

    .header-sub-separator {
      color: var(--accent-color);
      font-size: 14px;
      margin: 0 4px;
    }

    .header-sub-title {
      color: var(--accent-color); 
      font-size: 12px;
      font-weight: 600;
    }

    .header-sub-page {
      font-size: 10px; 
      opacity: 0.8; 
      font-weight: 600;
    }

    .logo-container {
      background: white;
      padding: 8px;
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      width: 80px;
      height: 80px;
    }

    .logo-container-small {
      background: white;
      padding: 4px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
    }

    .logo-img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }

    .campaign-info {
      flex-grow: 1;
      margin-left: 20px;
    }

    .campaign-title {
      font-size: 32px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: -0.5px;
      line-height: 1.1;
      text-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }

    .campaign-subtitle {
      margin-top: 6px;
      font-size: 12px;
      font-weight: 500;
      opacity: 0.95;
      text-transform: uppercase;
      letter-spacing: 0.6px;
    }

    .company-name {
      font-size: 16px;
      font-weight: 600;
      color: var(--accent-color);
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 4px;
    }

    .date-badge {
      background: var(--accent-color);
      color: var(--dark-slate);
      font-weight: 700;
      font-size: 11px;
      padding: 6px 14px;
      border-radius: 9999px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    /* Product Grid layout */
    .grid-container {
      flex-grow: 1;
      padding: 16px;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      grid-gap: 12px;
      align-content: start;
      background-color: var(--bg-light);
    }
    
    /* Product Card styling */
    .product-card {
      background: var(--bg-white);
      border: 1px solid var(--border-gray);
      border-radius: 8px;
      padding: 10px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      transition: all 0.2s;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
      height: 240px;
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
    
    /* Footer branding styles */
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

    .contact-icon {
      width: 14px;
      height: 14px;
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
  </style>
</head>
<body>
  ${renderedPagesHtml}
</body>
</html>
  `;
}
