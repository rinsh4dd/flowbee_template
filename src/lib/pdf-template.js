import { WeFiveTuesdayMarketTemplate } from "./templates/wefive-tuesday-market";
import { DefaultBrochureTemplate } from "./templates/default-template";

// Template registry mapping
const TEMPLATE_REGISTRY = {
  wefive_tuesday_market: WeFiveTuesdayMarketTemplate,
  default_template: DefaultBrochureTemplate,
};

/**
 * Resolves the active template configuration.
 */
export function getTemplate(templateId) {
  return TEMPLATE_REGISTRY[templateId] || WeFiveTuesdayMarketTemplate; // Fallback to WeFive
}

/**
 * Main Layout Generator.
 * Compiles campaign and products schema into dynamic A4 A-grade print layout.
 */
export function generateBrochureHtml(campaign, products = []) {
  const templateId = campaign.templateId || "wefive_tuesday_market";
  const template = getTemplate(templateId);

  // Theme Color Configurations (Dynamic based on selected template)
  const themeColor =
    campaign.themeColor ||
    (templateId === "wefive_tuesday_market" ? "#065f46" : "#dc2626");

  // Distribute products sequentially based on first page vs subsequent page limits
  const firstPageLimit =
    parseInt(campaign.productsPerPage) || template.defaultProductsPerPage;
  const subsequentPageLimit =
    parseInt(campaign.productsPerPageSubsequent) ||
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
            const gridClass =
              templateId === "wefive_tuesday_market"
                ? "grid-container wefive-grid"
                : "grid-container";
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
