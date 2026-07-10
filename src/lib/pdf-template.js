import { WeFiveTuesdayMarketTemplate } from "./templates/wefive-tuesday-market";
import { DefaultBrochureTemplate } from "./templates/default-template";

// Template registry mapping
const TEMPLATE_REGISTRY = {
  wefive_tuesday_market: WeFiveTuesdayMarketTemplate,
  default_template: DefaultBrochureTemplate,
};

function getValueCaseInsensitive(obj, path) {
  if (obj === null || obj === undefined) return undefined;
  const parts = path.split(".");
  let current = obj;
  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    const keys = Object.keys(current);
    const targetKey = keys.find(k => k.toLowerCase() === part.toLowerCase());
    if (targetKey) {
      current = current[targetKey];
    } else {
      current = undefined;
    }
  }
  return current;
}

export function interpolate(templateString, data) {
  if (!templateString) return "";
  let result = templateString;
  
  // Replace positive conditional block checks: {{#key}}...{{/key}} (case-insensitive)
  result = result.replace(/\{\{\s*#([\w.]+)\s*\}\}([\s\S]*?)\{\{\s*\/([\w.]+)\s*\}\}/gi, (match, key, content) => {
    const val = getValueCaseInsensitive(data, key);
    return val ? content : "";
  });

  // Replace negative/inverse conditional block checks: {{^key}}...{{/key}} (case-insensitive)
  result = result.replace(/\{\{\s*\^([\w.]+)\s*\}\}([\s\S]*?)\{\{\s*\/([\w.]+)\s*\}\}/gi, (match, key, content) => {
    const val = getValueCaseInsensitive(data, key);
    return !val ? content : "";
  });

  // Replace tag placeholders: {{key}} (case-insensitive)
  return result.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (match, key) => {
    const val = getValueCaseInsensitive(data, key);
    return val !== undefined && val !== null ? String(val) : "";
  });
}

export function makeDynamicTemplate(templateDoc) {
  if (!templateDoc) return null;
  return {
    defaultProductsPerPage: parseInt(templateDoc.defaultProductsPerPage) || 15,
    renderHeader(campaign, pageNum, totalPages) {
      return interpolate(templateDoc.headerHtml, {
        ...campaign,
        pageNum,
        totalPages
      });
    },
    renderProductCard(product, currency) {
      return interpolate(templateDoc.productCardHtml, {
        ...product,
        currency,
        formattedOfferPrice: Number(product.offerPrice || 0).toFixed(3),
        formattedOldPrice: product.oldPrice ? Number(product.oldPrice).toFixed(3) : ""
      });
    },
    renderFooter(campaign, qrCodeSrc, pageNum, totalPages) {
      return interpolate(templateDoc.footerHtml, {
        ...campaign,
        qrCodeSrc,
        pageNum,
        totalPages
      });
    },
    renderPageOverlay() {
      return templateDoc.renderPageOverlay || "";
    },
    css(themeColor, campaign) {
      return interpolate(templateDoc.css, {
        themeColor,
        headerBgColor: campaign.headerBgColor || themeColor,
        accentColor: campaign.accentColor || "#facc15",
        footerBgColor: campaign.footerBgColor || "#1e293b",
        textColor: campaign.textColor || "#1f2937",
        priceColor: campaign.priceColor || themeColor
      });
    }
  };
}

/**
 * Resolves the active template configuration.
 */
export function getTemplate(templateId) {
  return TEMPLATE_REGISTRY[templateId] || WeFiveTuesdayMarketTemplate; // Fallback to WeFive
}

export function calculatePagesCount(campaign, products = [], customTemplate = null) {
  const templateId = campaign.templateId || "wefive_tuesday_market";
  let template = getTemplate(templateId);
  if (customTemplate) {
    template = typeof customTemplate.renderHeader === "function"
      ? customTemplate
      : makeDynamicTemplate(customTemplate);
  }

  const firstPageLimit =
    templateId === "red_big_deals"
      ? 9
      : templateId === "supermarket_flyer_yellow"
      ? 16
      : templateId === "grocers_ledger"
      ? 12
      : parseInt(campaign.productsPerPage) || template.defaultProductsPerPage;
  const subsequentPageLimit =
    templateId === "red_big_deals"
      ? 9
      : templateId === "supermarket_flyer_yellow"
      ? 16
      : templateId === "grocers_ledger"
      ? 12
      : parseInt(campaign.productsPerPageSubsequent) ||
        (templateId === "wefive_tuesday_market"
          ? firstPageLimit + 5
          : firstPageLimit);

  if (!products || products.length === 0) {
    return 1;
  }

  let count = 1;
  if (products.length > firstPageLimit) {
    const remaining = products.length - firstPageLimit;
    count += Math.ceil(remaining / subsequentPageLimit);
  }
  return count;
}

/**
 * Main Layout Generator.
 * Compiles campaign and products schema into dynamic A4 A-grade print layout.
 */
export function generateBrochureHtml(campaign, products = [], customTemplate = null) {
  const templateId = campaign.templateId || "wefive_tuesday_market";
  let template = getTemplate(templateId);
  if (customTemplate) {
    template = typeof customTemplate.renderHeader === "function"
      ? customTemplate
      : makeDynamicTemplate(customTemplate);
  }

  // Theme Color Configurations (Dynamic based on selected template)
  const themeColor =
    campaign.themeColor ||
    (templateId === "wefive_tuesday_market" ? "#065f46" : "#dc2626");

  // Distribute products sequentially based on first page vs subsequent page limits
  const firstPageLimit =
    templateId === "red_big_deals"
      ? 9
      : templateId === "supermarket_flyer_yellow"
      ? 16
      : templateId === "grocers_ledger"
      ? 12
      : parseInt(campaign.productsPerPage) || template.defaultProductsPerPage;
  const subsequentPageLimit =
    templateId === "red_big_deals"
      ? 9
      : templateId === "supermarket_flyer_yellow"
      ? 16
      : templateId === "grocers_ledger"
      ? 12
      : parseInt(campaign.productsPerPageSubsequent) ||
        (templateId === "wefive_tuesday_market"
          ? firstPageLimit + 5
          : firstPageLimit);
  const pages = [];

  if (products.length === 0) {
    pages.push({ pageNumber: 1, products: [] });
  } else {
    // Page 1 gets up to firstPageLimit
    const page1Products = products.slice(0, firstPageLimit);
    pages.push({
      pageNumber: 1,
      products: page1Products,
    });

    // Subsequent pages get up to subsequentPageLimit
    let remainingProducts = products.slice(firstPageLimit);
    let pageNum = 2;
    while (remainingProducts.length > 0) {
      const pageProducts = remainingProducts.slice(0, subsequentPageLimit);
      pages.push({
        pageNumber: pageNum,
        products: pageProducts,
      });
      remainingProducts = remainingProducts.slice(subsequentPageLimit);
      pageNum++;
    }
  }

  // Generate WhatsApp link or Fallback URL inside QR Code
  const qrCodeSrc =
    campaign.qrCodeUrl ||
    `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
      campaign.whatsapp
        ? `https://wa.me/${campaign.whatsapp.replace(/\D/g, "")}`
        : `https://flowbee-templates.vercel.app`,
    )}`;

  // Compile full page templates list
  const currency = campaign.currency || "OMR";
  const layoutOrder = campaign.layoutOrder || ["header", "products", "footer"];

  const renderedPagesHtml = pages
    .map((page) => {
      const sectionsHtml = layoutOrder
        .map((sectionId) => {
          if (sectionId === "header") {
            if (page.pageNumber === 1) {
              return template.renderHeader(
                campaign,
                page.pageNumber,
                pages.length,
              );
            }
            return "";
          }
          if (sectionId === "products") {
            const countClass = `count-${page.products.length}`;
            const gridClass =
              templateId === "wefive_tuesday_market"
                ? `grid-container wefive-grid ${countClass}`
                : `grid-container ${countClass}`;
            return `
          <div class="${gridClass}">
            ${page.products.map((p) => template.renderProductCard(p, currency)).join("")}
          </div>
        `;
          }
          if (sectionId === "footer") {
            return template.renderFooter(
              campaign,
              qrCodeSrc,
              page.pageNumber,
              pages.length,
            );
          }
          return "";
        })
        .join("");

      const pageClass =
        templateId === "wefive_tuesday_market"
          ? "page-container wefive-page-container"
          : "page-container";
      const overlayHtml = template.renderPageOverlay
        ? template.renderPageOverlay()
        : "";

      return `
      <div class="${pageClass}">
        ${overlayHtml}
        ${sectionsHtml}
      </div>
    `;
    })
    .join("");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${campaign.campaignTitle || "Promo flyer"}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=Baloo+Chettan+2:wght@600;700;800&family=Manjari:wght@400;700&display=swap" rel="stylesheet">
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

    ${template.css(themeColor, campaign)}
  </style>
</head>
<body>
  ${renderedPagesHtml}
</body>
</html>
  `;
}
