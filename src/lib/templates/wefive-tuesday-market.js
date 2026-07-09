/**
 * WeFive Tuesday Market Template configuration.
 */

// Helper to check if text contains Malayalam characters
const hasMalayalam = (text) => /[\u0D00-\u0D7F]/.test(text);

export const WeFiveTuesdayMarketTemplate = {
  id: "wefive_tuesday_market",
  name: "WeFive Tuesday Market",
  defaultProductsPerPage: 19,

  // Leaves overlay HTML for this page
  renderPageOverlay() {
    return `
      <!-- Leaves Background Pattern Overlays (pure CSS) -->
      <div class="wefive-leaves-overlay">
        <div class="wefive-leaf-1"></div>
        <div class="wefive-leaf-2"></div>
        <div class="wefive-leaf-3"></div>
      </div>
    `;
  },

  // custom header renderer
  renderHeader(campaign, pageNumber, totalPages) {
    const logoSrc =
      campaign.logoUrl ||
      "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=200";

    // Formatter for WeFive dynamic date badge range
    const formatWeFiveDates = (startDateStr, endDateStr) => {
      if (!startDateStr) {
        const today = new Date();
        return {
          day: today.toLocaleDateString("en-US", { day: "numeric" }),
          month: today
            .toLocaleDateString("en-US", { month: "short" })
            .toUpperCase(),
          year: today.toLocaleDateString("en-US", { year: "numeric" }),
        };
      }

      const startObj = new Date(startDateStr);
      const startDay = startObj.toLocaleDateString("en-US", { day: "numeric" });
      const startMonth = startObj
        .toLocaleDateString("en-US", { month: "short" })
        .toUpperCase();
      const startYear = startObj.toLocaleDateString("en-US", {
        year: "numeric",
      });

      if (!endDateStr || startDateStr === endDateStr) {
        return {
          day: startDay,
          month: startMonth,
          year: startYear,
        };
      }

      const endObj = new Date(endDateStr);
      const endDay = endObj.toLocaleDateString("en-US", { day: "numeric" });
      const endMonth = endObj
        .toLocaleDateString("en-US", { month: "short" })
        .toUpperCase();
      const endYear = endObj.toLocaleDateString("en-US", { year: "numeric" });

      if (startYear !== endYear) {
        return {
          day: `${startDay} ${startMonth} ${startYear}`,
          month: "TO",
          year: `${endDay} ${endMonth} ${endYear}`,
        };
      }

      if (startMonth !== endMonth) {
        return {
          day: `${startDay} ${startMonth} - ${endDay} ${endMonth}`,
          month: "VALID",
          year: startYear,
        };
      }

      return {
        day: `${startDay} - ${endDay}`,
        month: startMonth,
        year: startYear,
      };
    };

    const dateVal = formatWeFiveDates(
      campaign.offerStartDate,
      campaign.offerEndDate,
    );
    const offerDay = dateVal.day;
    const offerMonth = dateVal.month;
    const offerYear = dateVal.year;
    const dateLabel =
      campaign.headerBadgeText ||
      (campaign.offerEndDate &&
      campaign.offerStartDate !== campaign.offerEndDate
        ? "VALID FROM"
        : "ONLY ON");

    const wefiveLogoHtml = campaign.logoUrl
      ? `<div class="wefive-logo-container"><img class="wefive-logo-img" src="${logoSrc}" alt="Logo" /></div>`
      : `
        <div class="wefive-logo-box">
          <div class="wefive-logo-wrapper">
            <svg class="wefive-logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <div class="wefive-logo-text">
            <span class="wefive-brand-we">Your<span class="wefive-brand-five">Logo</span></span>
            <span class="wefive-brand-sub">STORE</span>
          </div>
        </div>
      `;

    const titleRaw = campaign.campaignTitle || "";
    const subtitleRaw = campaign.headerTitle || "";
    let mainTitle = "";
    let subtitle = "";

    if (titleRaw.includes("/") || titleRaw.includes("|")) {
      const parts = titleRaw.split(/[\/|]/);
      mainTitle = parts[0].trim();
      subtitle = parts[1].trim();
    } else if (subtitleRaw.includes("/") || subtitleRaw.includes("|")) {
      const parts = subtitleRaw.split(/[\/|]/);
      mainTitle = parts[0].trim();
      subtitle = parts[1].trim();
    } else {
      const inputs = [titleRaw, subtitleRaw].filter(Boolean);
      if (inputs.length === 2) {
        const firstHasMal = hasMalayalam(inputs[0]);
        const secondHasMal = hasMalayalam(inputs[1]);
        if (firstHasMal && !secondHasMal) {
          mainTitle = inputs[0];
          subtitle = inputs[1];
        } else if (!firstHasMal && secondHasMal) {
          mainTitle = inputs[1];
          subtitle = inputs[0];
        } else {
          mainTitle = inputs[0];
          subtitle = inputs[1];
        }
      } else {
        mainTitle = titleRaw || subtitleRaw;
        subtitle = "";
      }
    }

    return `
      <div class="wefive-header">
        <div class="wefive-header-logo-area">
          ${wefiveLogoHtml}
        </div>
        <div class="wefive-header-title-area">
          <h1 class="wefive-header-title-malayalam">${mainTitle}</h1>
          <span class="wefive-header-title-english">${subtitle}</span>
        </div>
        <div class="wefive-header-date-area">
          <div class="wefive-date-badge">
            <span class="wefive-date-label">${dateLabel}</span>
            <span class="wefive-date-day">${offerDay}</span>
            <span class="wefive-date-month">${offerMonth}</span>
            <span class="wefive-date-year">${offerYear}</span>
          </div>
        </div>
      </div>
    `;
  },

  // custom footer renderer
  renderFooter(campaign, qrCodeSrc, pageNumber = 1, totalPages = 1) {
    const whatsappNum = campaign.whatsapp || "+91 9000000000";
    const phoneNum = campaign.phone || "+91 9000000001";

    return `
      <div class="footer-wefive">
        <div class="wefive-footer-left">
          ${
            campaign.footerLogoUrl
              ? `
            <div class="wefive-footer-brand-logo">
              <img class="wefive-footer-logo-img" src="${campaign.footerLogoUrl}" alt="Footer Logo" />
            </div>
          `
              : `
            <div class="wefive-footer-brand">
              <span class="wefive-ft-we">${campaign.footerBrandName1 || "Your"}<span class="wefive-ft-five">${campaign.footerBrandName2 || "Logo"}</span></span>
              <span class="wefive-ft-sub">${campaign.footerBrandSub || "STORE"}</span>
            </div>
          `
          }
          <div class="wefive-ft-divider"></div>
          <div class="wefive-footer-address-info">
            <span class="wefive-address-title">${campaign.companyName || "STORE BRAND NAME"}</span>
            <span class="wefive-address-body">${campaign.footerAddress || "# 123, MAIN ROAD, CITY 600001"}</span>
          </div>
        </div>
        
        <p class="wefive-footer-disclaimer">
          ${campaign.terms || "Bulk purchase not allowed. Offer valid till stock last. All pictures shown are for illustration purpose only. Actual product may vary."}
        </p>
        
        <div class="wefive-footer-contacts">
          <div style="font-size: 7.5px; font-weight: 800; color: #fde047; border: 1px solid rgba(253, 224, 71, 0.3); border-radius: 4px; padding: 3px 6px; background: rgba(255,255,255,0.05); text-align: center; white-space: nowrap; line-height: 1;">
            PAGE ${pageNumber} / ${totalPages}
          </div>
          <a href="tel:${phoneNum.replace(/\s+/g, "")}" class="wefive-contact-btn wefive-phone-btn">
            <svg class="wefive-ft-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21.384 17.791l-3.75-1.875a1.5 1.5 0 00-1.834.417l-1.396 1.86a15.228 15.228 0 01-6.554-6.554l1.86-1.396a1.5 1.5 0 00.417-1.834L8.252 2.616A1.5 1.5 0 006.41 1.77L2.25 2.77A1.5 1.5 0 001.12 4.25c0 10.907 8.843 19.75 19.75 19.75a1.5 1.5 0 001.48-1.13l1-4.16a1.5 1.5 0 00-.966-1.919z" />
            </svg>
            <span>${phoneNum}</span>
          </a>
          <a href="https://wa.me/${whatsappNum.replace(/\D/g, "")}" target="_blank" class="wefive-contact-btn wefive-whatsapp-btn">
            <svg class="wefive-ft-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.717-1.454L0 24zm6.59-4.846c1.6.95 3.16 1.449 4.825 1.451 5.423.002 9.835-4.41 9.838-9.83.002-2.628-1.017-5.1-2.868-6.956-1.851-1.856-4.311-2.879-6.943-2.88-5.426 0-9.838 4.412-9.841 9.835-.001 1.761.472 3.481 1.374 5.004l-.947 3.456 3.562-.934z" />
            </svg>
            <span>${whatsappNum}</span>
          </a>
        </div>
      </div>
    `;
  },

  // custom product card renderer
  renderProductCard(product, currency = "OMR") {
    const imageSrc =
      product.imageUrl ||
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=150";

    let nameMalayalam = product.productName || "";
    let nameEnglish = "";
    if (nameMalayalam.includes("/")) {
      const parts = nameMalayalam.split("/");
      nameMalayalam = parts[0].trim();
      nameEnglish = parts[1].trim();
    } else if (nameMalayalam.includes("|")) {
      const parts = nameMalayalam.split("|");
      nameMalayalam = parts[0].trim();
      nameEnglish = parts[1].trim();
    }

    const isWow = product.badgeText === "WOW!";
    const unitTagText = product.quantity
      ? product.quantity.toUpperCase()
      : product.badgeText && !isWow
        ? product.badgeText.toUpperCase()
        : "PER KG";

    const offerPriceVal =
      product.offerPrice !== undefined &&
      product.offerPrice !== null &&
      product.offerPrice !== ""
        ? Number(product.offerPrice)
        : "-";

    const wowBadgeHtml = isWow
      ? `
      <div class="absolute -top-2 -left-2 animate-bounce" style="z-index: 10;">
        <svg class="w-10 h-10 drop-shadow-md text-sky-500 fill-sky-500" viewBox="0 0 24 24" style="width: 40px; height: 40px; fill: #0ea5e9; display: inline-block;">
          <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.4 8.168L12 18.896l-7.334 3.857 1.4-8.168L.132 9.21l8.2-1.192z" />
        </svg>
        <span class="absolute inset-0 flex items-center justify-center text-[8px] font-extrabold text-white uppercase tracking-wider transform rotate-12" style="font-size: 8px; font-weight: 800; color: white;">WOW!</span>
      </div>
    `
      : "";

    return `
      <div class="flex flex-col items-center justify-between text-center relative p-1 transition-transform duration-200 hover:scale-105" style="height: 100%; min-height: 175px; max-height: 220px;">
        <!-- Image & Price tag Container -->
        <div class="relative w-full aspect-square flex items-center justify-center p-2 mb-1 bg-white/20 rounded-2xl shadow-sm border border-white/30 backdrop-blur-xs" style="position: relative; width: 100%; aspect-ratio: 1/1; display: flex; items-center; justify-content: center; padding: 8px; margin-bottom: 4px; background: rgba(255, 255, 255, 0.2); border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.3); backdrop-filter: blur(4px); box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
          <!-- Item Photo -->
          <img 
            src="${imageSrc}" 
            alt="${nameEnglish || nameMalayalam}" 
            class="max-h-[85%] max-w-[85%] object-contain rounded-xl drop-shadow-md"
            style="max-height: 85%; max-width: 85%; object-fit: contain; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.08));"
          />
          
          <!-- WOW! badge -->
          ${wowBadgeHtml}
          
          <!-- Price Badge & Unit Tag -->
          <div class="absolute -bottom-2 right-1 flex flex-col items-end" style="position: absolute; bottom: -8px; right: 4px; display: flex; flex-direction: column; align-items: flex-end; z-index: 10;">
            <!-- Unit Tag -->
            <span class="bg-yellow-400 text-gray-950 font-extrabold text-[8px] px-1.5 py-0.5 rounded-sm shadow-xs transform -rotate-3 border border-yellow-500/30 font-sans" style="background: #facc15; color: #1e293b; font-weight: 800; font-size: 7px; padding: 1px 4px; border-radius: 2px; border: 1px solid rgba(234, 179, 8, 0.3); transform: rotate(-3deg); box-shadow: 0 1px 2px rgba(0,0,0,0.05); display: inline-block;">
              ${unitTagText}
            </span>
            <!-- Price badge -->
            <span class="bg-emerald-800 text-white font-black text-xs md:text-sm px-2.5 py-0.5 rounded-full shadow-md border border-emerald-700 -mt-1 z-10 font-sans flex items-center gap-0.5" style="background: #064e3b; color: white; font-weight: 900; font-size: 11px; padding: 1px 6px; border-radius: 9999px; border: 1px solid #047857; margin-top: -3px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); display: flex; align-items: center; gap: 0.5px;">
              <span class="text-[9px] font-normal font-sans" style="font-size: 8px; font-weight: 400;">${currency === "OMR" ? "₹" : currency}</span>${offerPriceVal}
            </span>
          </div>
        </div>

        <!-- Malayalam Name -->
        <h3 class="font-malayalam-body text-xs md:text-sm font-black text-gray-950 leading-tight tracking-wide min-h-[1.5rem] flex items-center justify-center gap-1" style="font-family: 'Manjari', 'Inter', sans-serif; font-size: 12px; font-weight: 900; color: #030712; line-height: 1.2; min-height: 1.4rem; display: flex; align-items: center; justify-content: center; gap: 2px; margin: 0;">
          <span>${nameMalayalam}</span>
        </h3>
        <!-- English Name (Small) -->
        ${nameEnglish ? `<p class="text-[9px] font-semibold text-gray-600 font-sans tracking-tight -mt-0.5" style="font-size: 8.5px; font-weight: 600; color: #4b5563; letter-spacing: -0.1px; margin: 1px 0 0 0;">${nameEnglish}</p>` : ""}
      </div>
    `;
  },

  // stylesheet rules
  css(themeColor, campaign) {
    return `
    /* --- WEFIVE HYPERMARKET TEMPLATE SPECIFIC STYLES --- */
    .wefive-page-container {
      background: radial-gradient(circle, #f0fdf4 0%, #dcfce7 50%, #bbf7d0 100%) !important;
    }
    
    .wefive-grid {
      display: grid !important;
      flex-grow: 1 !important;
      grid-template-columns: repeat(5, 1fr) !important;
      grid-template-rows: repeat(auto-fill, minmax(180px, 1fr)) !important;
      grid-gap: 8px !important;
      padding: 10px 14px !important;
      background-color: transparent !important;
      align-content: start !important;
    }

    .wefive-header {
      padding: 12px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      background: transparent;
      position: relative;
      height: 135px;
    }
    .wefive-header-logo-area {
      flex-shrink: 0;
    }
    .wefive-logo-box {
      display: flex;
      align-items: center;
      gap: 6px;
      background: rgba(255, 255, 255, 0.45);
      padding: 8px 10px;
      border-radius: 12px;
      backdrop-filter: blur(4px);
      border: 1px solid rgba(255, 255, 255, 0.5);
      box-shadow: 0 2px 5px rgba(0,0,0,0.05);
    }
    .wefive-logo-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      background: #22c55e;
      color: white;
      border-radius: 8px;
      padding: 5px;
      box-shadow: 0 2px 4px rgba(34, 197, 94, 0.3);
      width: 32px;
      height: 32px;
    }
    .wefive-logo-icon {
      width: 20px;
      height: 20px;
      stroke: white;
      stroke-width: 3;
    }
    .wefive-logo-text {
      display: flex;
      flex-direction: column;
    }
    .wefive-brand-we {
      color: #065f46;
      font-weight: 800;
      font-size: 16px;
      line-height: 1;
      font-style: italic;
    }
    .wefive-brand-five {
      color: #f97316;
    }
    .wefive-brand-sub {
      background: #065f46;
      color: #fef08a;
      font-size: 7px;
      font-weight: 700;
      padding: 1px 4px;
      border-radius: 3px;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-top: 2px;
      text-align: center;
    }
    .wefive-logo-container {
      background: rgba(255, 255, 255, 0.45);
      border-radius: 12px;
      padding: 6px;
      border: 1px solid rgba(255, 255, 255, 0.5);
      width: 110px;
      height: 72px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .wefive-logo-img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }
    .wefive-header-title-area {
      flex-grow: 1;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      margin-top: 4px;
    }
    .wefive-header-title-malayalam {
      font-family: "Baloo Chettan 2", "Inter", sans-serif;
      font-size: 36px;
      font-weight: 800;
      color: #facc15;
      text-shadow: 2.5px 2.5px 0px #b91c1c, -1.5px -1.5px 0px #b91c1c, 1.5px -1.5px 0px #b91c1c, -1.5px 1.5px 0px #b91c1c, 0px 3px 5px rgba(0,0,0,0.3);
      letter-spacing: 0.5px;
      line-height: 1.1;
      margin: 0;
    }
    .wefive-header-title-english {
      font-size: 9px;
      font-weight: 700;
      color: #9f1239;
      text-transform: uppercase;
      letter-spacing: 2.5px;
      margin-top: 5px;
      background: rgba(254, 240, 138, 0.4);
      padding: 2px 10px;
      border-radius: 9999px;
      border: 1px solid rgba(253, 224, 71, 0.2);
    }
    .wefive-header-date-area {
      flex-shrink: 0;
    }
    .wefive-date-badge {
      background: #facc15;
      color: #064e3b;
      padding: 6px 12px;
      border-radius: 12px;
      border: 2px solid #fde047;
      text-align: center;
      display: flex;
      flex-direction: column;
      justify-content: center;
      min-width: 90px;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
    }
    .wefive-date-label {
      font-size: 8px;
      font-weight: 800;
      letter-spacing: 1px;
      color: #047857;
    }
    .wefive-date-day {
      font-size: 20px;
      font-weight: 900;
      line-height: 1;
      margin-top: 1px;
      color: #064e3b;
    }
    .wefive-date-month {
      font-size: 11px;
      font-weight: 900;
      letter-spacing: 1px;
      margin-top: 1px;
      color: #047857;
    }
    .wefive-date-year {
      font-size: 9px;
      font-weight: 800;
      letter-spacing: 1px;
      color: #065f46;
      margin-top: 1px;
    }

    /* Leaves Overlays (Pure CSS Animations / Pattern) */
    .wefive-leaves-overlay {
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 1;
      overflow: hidden;
    }
    .wefive-leaf-1 {
      position: absolute;
      top: 5px;
      left: 10px;
      width: 36px;
      height: 36px;
      opacity: 0.15;
      background: radial-gradient(circle at 0% 0%, #15803d 0%, transparent 60%);
      clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%);
      transform: rotate(45deg);
    }
    .wefive-leaf-2 {
      position: absolute;
      bottom: 25px;
      right: 15px;
      width: 48px;
      height: 48px;
      opacity: 0.12;
      background: radial-gradient(circle at 100% 100%, #16a34a 0%, transparent 60%);
      clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%);
      transform: rotate(-15deg);
    }
    .wefive-leaf-3 {
      position: absolute;
      top: 50%;
      left: -8px;
      width: 28px;
      height: 28px;
      opacity: 0.08;
      background: #14532d;
      clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%);
      transform: rotate(115deg);
    }

    /* WeFive Footer styling */
    .footer-wefive {
      background: #064e3b;
      color: white;
      padding: 8px 16px;
      border-top: 2px solid rgba(4, 120, 87, 0.4);
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      height: 60px;
      position: relative;
      width: 100%;
    }
    .wefive-footer-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .wefive-footer-brand {
      display: flex;
      flex-direction: column;
      line-height: 1;
    }
    .wefive-footer-brand-logo {
      display: flex;
      align-items: center;
      justify-content: center;
      max-width: 85px;
      height: 38px;
      overflow: hidden;
      background: transparent;
      border: none;
      padding: 0;
    }
    .wefive-footer-logo-img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }
    .wefive-ft-we {
      font-size: 15px;
      font-weight: 800;
      font-style: italic;
    }
    .wefive-ft-five {
      color: #fb923c;
    }
    .wefive-ft-sub {
      font-size: 6px;
      color: #fde047;
      font-weight: 800;
      letter-spacing: 1px;
      margin-top: 1px;
    }
    .wefive-ft-divider {
      width: 1px;
      height: 24px;
      background: rgba(255, 255, 255, 0.2);
    }
    .wefive-footer-address-info {
      display: flex;
      flex-direction: column;
      gap: 1px;
    }
    .wefive-address-title {
      font-size: 9px;
      font-weight: 800;
      color: #fde047;
      letter-spacing: 0.5px;
    }
    .wefive-address-body {
      font-size: 7.5px;
      color: rgba(255, 255, 255, 0.8);
      font-weight: 550;
    }
    .wefive-footer-disclaimer {
      font-size: 5.5px;
      color: rgba(255, 255, 255, 0.4);
      max-width: 220px;
      line-height: 1.25;
      text-align: center;
      margin: 0;
    }
    .wefive-footer-contacts {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .wefive-contact-btn {
      display: flex;
      align-items: center;
      gap: 3px;
      padding: 3px 6px;
      border-radius: 4px;
      font-size: 8px;
      font-weight: 700;
      color: white;
      text-decoration: none;
      transition: background-color 0.15s;
    }
    .wefive-phone-btn {
      background: rgba(255, 255, 255, 0.1);
    }
    .wefive-whatsapp-btn {
      background: #022c22;
    }
    .wefive-ft-icon {
      width: 10px;
      height: 10px;
      fill: currentColor;
    }
    .wefive-phone-btn .wefive-ft-icon {
      color: #38bdf8;
    }
    .wefive-whatsapp-btn .wefive-ft-icon {
      color: #4ade80;
    }
    `;
  },
};
