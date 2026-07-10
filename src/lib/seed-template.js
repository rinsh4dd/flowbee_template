import { dbService } from "./db-service";

export async function seedDynamicTemplate() {
  const templatesToSeed = [
    {
      id: "red_big_deals",
      name: "🔴 Red Big Deals",
      type: "offer_brochure",
      status: "active",
      brochurePages: 2,
      description: "High-impact retail promotional template styled after professional flyer designs. Features a large header red block, calendar-style price badges, and contact details with QR codes.",
      defaultProductsPerPage: 9,
      headerHtml: `
        <div class="red-header">
          <div class="header-top-banner">
            <div class="logo-box">
              {{#logoUrl}}<img src="{{logoUrl}}" alt="Logo" />{{/logoUrl}}
              {{#companyName}}<span class="logo-text">{{companyName}}</span>{{/companyName}}
            </div>
            <div class="curve-dec"></div>
          </div>
          
          <div class="main-title-box">
            <div class="huge-big">BIG</div>
            <div class="deals-stripe">
              <span>DEALS OF OUTSTANDING</span>
            </div>
            <div class="month-title">
              <div class="chevron-indicators-left">
                <span>&gt;</span><span>&gt;</span><span>&gt;</span>
              </div>
              <h1>{{campaignTitle}}</h1>
              <div class="chevron-indicators-right">
                <span>&lt;</span><span>&lt;</span><span>&lt;</span>
              </div>
            </div>
            <div class="subtitle-wrap">
              <p class="subtitle">{{headerTitle}}</p>
              <div class="dotted-line"></div>
            </div>
          </div>
        </div>
      `,
      productCardHtml: `
        <div class="red-card">
          <div class="red-img-wrap">
            <img src="{{imageUrl}}" alt="{{productName}}" />
          </div>
          <div class="red-card-footer">
            <div class="price-badge">
              <div class="price-badge-top">{{currency}}</div>
              <div class="price-badge-body">{{formattedOfferPrice}}</div>
            </div>
            <div class="product-info">
              <h3>{{productName}}</h3>
              <p class="qty">{{quantity}}</p>
            </div>
          </div>
        </div>
      `,
      footerHtml: `
        <div class="red-footer">
          <div class="red-footer-validity">
            <p>Promotion Valid from {{offerStartDate}} to {{offerEndDate}}</p>
          </div>
          
          <div class="red-footer-bar">
            <div class="bar-contact">
              <span class="icon">📞</span>
              <span class="text">{{phone}} • {{whatsapp}}</span>
            </div>
            <div class="bar-web">
              <span>www.flowbee.com</span>
            </div>
            <div class="bar-qr">
              <span class="scan-me">SCAN ME!</span>
              <img src="{{qrCodeSrc}}" alt="QR Code" />
            </div>
          </div>
        </div>
      `,
      css: `
        .page-container {
          background-color: #f8fafc !important;
          color: #0f172a !important;
          font-family: 'Poppins', sans-serif;
        }
        .red-header {
          background: #ffffff;
          display: flex;
          flex-direction: column;
        }
        .header-top-banner {
          background: #e11d48;
          height: 65px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
        }
        .logo-box {
          background: transparent;
          border: 2px solid #ffffff;
          color: #ffffff;
          padding: 4px 8px;
          font-weight: 800;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          max-height: 45px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .logo-box img {
          max-height: 35px;
          object-fit: contain;
        }
        .curve-dec {
          position: absolute;
          right: 0;
          top: 0;
          bottom: 0;
          width: 65px;
          background: #ffffff;
          clip-path: ellipse(100% 100% at 100% 0%);
        }
        .main-title-box {
          text-align: center;
          padding-top: 15px;
        }
        .huge-big {
          font-size: 68px;
          font-weight: 900;
          color: #e11d48;
          line-height: 0.8;
          letter-spacing: -2px;
          margin-bottom: 5px;
        }
        .deals-stripe {
          background: #0f172a;
          color: #ffffff;
          font-size: 11px;
          font-weight: 800;
          padding: 4px 16px;
          display: inline-block;
          letter-spacing: 1px;
          margin-bottom: 5px;
          transform: skewX(-5deg);
        }
        .month-title {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
          margin-bottom: 4px;
        }
        .month-title h1 {
          font-size: 26px;
          font-weight: 900;
          color: #0f172a;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .chevron-indicators-left, .chevron-indicators-right {
          display: flex;
          gap: 2px;
          color: #e11d48;
          font-weight: 900;
          font-size: 14px;
        }
        .subtitle-wrap {
          padding: 0 40px;
        }
        .subtitle-wrap .subtitle {
          font-size: 10px;
          color: #64748b;
          font-weight: 600;
          margin-bottom: 6px;
        }
        .dotted-line {
          border-bottom: 1px dotted #cbd5e1;
          width: 100%;
        }
        .grid-container {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          padding: 15px 24px 20px 24px;
          background: transparent !important;
          flex-grow: 1;
        }
        .red-card {
          background: #ffffff;
          border-radius: 12px;
          padding: 10px;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.03);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: 100%;
          border: 1px solid rgba(15, 23, 42, 0.04);
        }
        .red-img-wrap {
          height: 105px;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 8px;
        }
        .red-img-wrap img {
          max-height: 100%;
          max-width: 100%;
          object-fit: contain;
        }
        .red-card-footer {
          display: flex;
          align-items: center;
          gap: 8px;
          border-top: 1px solid #f1f5f9;
          padding-top: 8px;
        }
        .price-badge {
          background: #e11d48;
          color: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          min-width: 60px;
          border: 1px solid #e11d48;
          box-shadow: 0 2px 4px rgba(225, 29, 72, 0.25);
        }
        .price-badge-top {
          background: #0f172a;
          font-size: 7px;
          font-weight: 800;
          padding: 1.5px 2px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          text-align: center;
        }
        .price-badge-body {
          font-size: 11px;
          font-weight: 900;
          padding: 3px 2px;
          text-align: center;
        }
        .product-info {
          text-align: left;
          min-width: 0;
        }
        .product-info h3 {
          font-size: 10.5px;
          font-weight: 750;
          color: #0f172a;
          margin-bottom: 1.5px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .product-info .qty {
          font-size: 8px;
          color: #64748b;
          font-weight: 600;
        }
        .red-footer {
          background: #ffffff;
          display: flex;
          flex-direction: column;
        }
        .red-footer-validity {
          text-align: center;
          padding: 6px 0;
          font-size: 9px;
          font-weight: 750;
          color: #475569;
          background: #f1f5f9;
          border-top: 1px solid #e2e8f0;
        }
        .red-footer-bar {
          background: #0f172a;
          color: #ffffff;
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 46px;
          padding: 0 24px;
          position: relative;
        }
        .bar-contact {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 9px;
          font-weight: 750;
        }
        .bar-web {
          font-size: 9px;
          font-weight: 700;
          opacity: 0.8;
        }
        .bar-qr {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #e11d48;
          height: 46px;
          padding: 0 12px;
          margin-right: -24px;
          box-shadow: -4px 0 10px rgba(0,0,0,0.15);
        }
        .scan-me {
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 0.5px;
        }
        .bar-qr img {
          height: 32px;
          width: 32px;
          background: #ffffff;
          padding: 1.5px;
          border-radius: 3px;
        }

        /* Dynamic scaling layouts based on products count */
        .grid-container.count-1,
        .grid-container.count-2,
        .grid-container.count-3 {
          grid-template-columns: repeat(2, 1fr) !important;
          align-content: start !important;
          gap: 24px !important;
          padding: 30px 40px !important;
        }
        .grid-container.count-1 {
          grid-template-columns: 1fr !important;
          max-width: 280px;
          margin: 0 auto;
        }
        .grid-container.count-1 .red-card,
        .grid-container.count-2 .red-card,
        .grid-container.count-3 .red-card {
          padding: 20px !important;
          border-width: 2px !important;
          height: 220px !important;
        }
        .grid-container.count-1 .red-img-wrap,
        .grid-container.count-2 .red-img-wrap,
        .grid-container.count-3 .red-img-wrap {
          height: 140px !important;
        }
        .grid-container.count-1 .product-info h3,
        .grid-container.count-2 .product-info h3,
        .grid-container.count-3 .product-info h3 {
          font-size: 14px !important;
        }
        .grid-container.count-1 .product-info .qty,
        .grid-container.count-2 .product-info .qty,
        .grid-container.count-3 .product-info .qty {
          font-size: 10px !important;
        }
        .grid-container.count-1 .price-badge,
        .grid-container.count-2 .price-badge,
        .grid-container.count-3 .price-badge {
          min-width: 80px !important;
        }
        .grid-container.count-1 .price-badge-body,
        .grid-container.count-2 .price-badge-body,
        .grid-container.count-3 .price-badge-body {
          font-size: 14px !important;
          padding: 5px 2px !important;
        }

        .grid-container.count-4,
        .grid-container.count-5,
        .grid-container.count-6 {
          grid-template-columns: repeat(3, 1fr) !important;
          align-content: start !important;
          gap: 16px !important;
          padding: 20px 24px !important;
        }
        .grid-container.count-4 .red-card,
        .grid-container.count-5 .red-card,
        .grid-container.count-6 .red-card {
          padding: 12px !important;
          height: 165px !important;
        }
        .grid-container.count-4 .red-img-wrap,
        .grid-container.count-5 .red-img-wrap,
        .grid-container.count-6 .red-img-wrap {
          height: 100px !important;
        }
        .grid-container.count-4 .product-info h3,
        .grid-container.count-5 .product-info h3,
        .grid-container.count-6 .product-info h3 {
          font-size: 11px !important;
        }
      `
    },
    {
      id: "supermarket_flyer_yellow",
      name: "🟡 Red & Yellow Supermarket",
      type: "offer_brochure",
      status: "active",
      brochurePages: 2,
      description: "Bright, high-impact red & yellow grocery catalog template. Features a large round header badge, a clean 4-column product grid (16 items/page), and a details-rich red footer.",
      defaultProductsPerPage: 16,
      headerHtml: `
        <div class="header">
          <div class="header-left">
            <h1>{{#campaignTitle}}{{campaignTitle}}{{/campaignTitle}}{{^campaignTitle}}Great<br><span class="accent">Price offer</span><br>This week{{/campaignTitle}}</h1>
            <div class="subtext">
              <span>{{#headerTitle}}{{headerTitle}}{{/headerTitle}}{{^headerTitle}}SAVE UP TO 75% DISCOUNT ON GREAT SELECTION{{/headerTitle}}</span>
            </div>
          </div>
          <div class="header-right">
            <div class="badge">
              <div class="mega">Mega<br>Sale</div>
              <div class="disc">Discount up to</div>
              <div class="percent">{{#headerBadgeText}}{{headerBadgeText}}{{/headerBadgeText}}{{^headerBadgeText}}70%{{/headerBadgeText}}</div>
            </div>
          </div>
        </div>
      `,
      productCardHtml: `
        <div class="product-card">
          {{#badgeText}}
          <div class="discount-tag">
            <svg viewBox="0 0 40 40"><path d="M20 0 L40 8 V40 H0 V8 Z" fill="#e2231a"/></svg>
            <div class="tag-text">{{badgeText}}</div>
          </div>
          {{/badgeText}}
          <div class="product-image"><img src="{{imageUrl}}" alt="{{productName}}"></div>
          <div class="product-name">{{productName}}</div>
          {{#oldPrice}}<div class="price-old">{{currency}} {{formattedOldPrice}}</div>{{/oldPrice}}
          <div class="price-new">{{currency}} {{formattedOfferPrice}}</div>
        </div>
      `,
      footerHtml: `
        <div class="footer">
          <div class="footer-left">
            <div class="wa-icon">
              <svg viewBox="0 0 24 24" fill="#25D366"><path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.36 5.07L2 22l5.06-1.33A9.94 9.94 0 0012 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm5.2 14.3c-.22.6-1.28 1.17-1.77 1.24-.45.07-1.02.1-1.65-.1-.38-.12-.87-.28-1.5-.55-2.63-1.14-4.35-3.8-4.48-3.98-.13-.17-1.08-1.43-1.08-2.73 0-1.3.68-1.93.93-2.2.24-.26.53-.33.7-.33h.5c.16 0 .38-.03.58.44.22.53.75 1.83.82 1.96.07.14.11.3.02.48-.09.18-.14.29-.27.45-.14.16-.29.36-.41.48-.14.14-.28.29-.12.57.16.29.72 1.19 1.55 1.93 1.06.95 1.96 1.24 2.24 1.38.28.14.44.12.6-.07.16-.19.68-.79.86-1.06.18-.27.36-.22.6-.13.24.09 1.53.72 1.79.85.26.13.43.19.5.3.06.11.06.63-.16 1.23z"/></svg>
            </div>
            <div class="contact-text">
              <div class="label">For more information</div>
              <div class="phone">{{phone}}</div>
            </div>
          </div>
          <div class="social">
            <a href="#"><svg viewBox="0 0 24 24" fill="#e2231a"><path d="M22 12a10 10 0 10-11.6 9.87v-6.98H7.9V12h2.5V9.8c0-2.47 1.47-3.84 3.72-3.84 1.08 0 2.2.2 2.2.2v2.4h-1.24c-1.22 0-1.6.76-1.6 1.54V12h2.72l-.44 2.89h-2.28v6.98A10 10 0 0022 12z"/></svg></a>
            <a href="#"><svg viewBox="0 0 24 24" fill="#e2231a"><path d="M12 2c2.7 0 3.06.01 4.12.06 1.06.05 1.79.22 2.43.47.66.26 1.22.6 1.77 1.15.55.55.9 1.11 1.15 1.77.25.64.42 1.37.47 2.43.05 1.06.06 1.42.06 4.12s-.01 3.06-.06 4.12c-.05 1.06-.22 1.79-.47 2.43a4.9 4.9 0 01-1.15 1.77c-.55.55-1.11.9-1.77 1.15-.64.25-1.37.42-2.43.47-1.06.05-1.42.06-4.12.06s-3.06-.01-4.12-.06c-1.06-.05-1.79-.22-2.43-.47a4.9 4.9 0 01-1.77-1.15 4.9 4.9 0 01-1.15-1.77c-.25-.64-.42-1.37-.47-2.43C2.01 15.06 2 14.7 2 12s.01-3.06.06-4.12c.05-1.06.22-1.79.47-2.43.26-.66.6-1.22 1.15-1.77A4.9 4.9 0 015.45 2.53c.64-.25 1.37-.42 2.43-.47C8.94 2.01 9.3 2 12 2zm0 5a5 5 0 100 10 5 5 0 000-10zm0 8.2a3.2 3.2 0 110-6.4 3.2 3.2 0 010 6.4zm5.2-8.4a1.2 1.2 0 100-2.4 1.2 1.2 0 000 2.4z"/></svg></a>
            <span class="handle">{{whatsapp}}</span>
          </div>
          <div class="footer-right">
            <div class="scan-text">Scan here</div>
            <div class="qr"><img src="{{qrCodeSrc}}" alt="QR code"></div>
          </div>
        </div>
      `,
      css: `
        .page-container {
          background-color: #ffffff !important;
          color: #1e293b !important;
          font-family: 'Arial', sans-serif;
        }
        .header {
          position: relative;
          display: flex;
          background: #e2231a;
        }
        .header-left {
          flex: 1;
          padding: 36px 32px;
          color: #ffffff;
        }
        .header-left h1 {
          font-size: 42px;
          line-height: 1.15;
          font-weight: 800;
          text-transform: capitalize;
        }
        .header-left h1 .accent {
          color: #ffd400;
        }
        .header-left .subtext {
          margin-top: 15px;
          font-size: 15px;
          font-weight: 700;
          letter-spacing: 0.3px;
        }
        .header-left .subtext span {
          color: #ffd400;
        }
        .header-right {
          width: 220px;
          background: #ffd400;
          position: relative;
        }
        .badge {
          position: absolute;
          top: 36px;
          left: 50%;
          transform: translateX(-50%);
          width: 170px;
          height: 170px;
          background: #ffffff;
          border-radius: 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          box-shadow: 0 0 0 9px #ffd400, 0 0 0 11px #ffffff;
          z-index: 10;
        }
        .badge .mega {
          color: #e2231a;
          font-weight: 800;
          font-size: 22px;
          line-height: 1.1;
        }
        .badge .disc {
          font-size: 13px;
          font-weight: 700;
          color: #333333;
          margin-top: 3px;
        }
        .badge .percent {
          color: #e2231a;
          font-weight: 800;
          font-size: 28px;
          margin-top: 3px;
        }
        .grid-container {
          display: grid;
          grid-template-columns: repeat(4, 1fr) !important;
          gap: 16px !important;
          padding: 24px !important;
          background: #ffffff !important;
          flex-grow: 1;
        }
        .product-card {
          position: relative;
          background: #ffffff;
          border: 1px solid #eeeeee;
          border-radius: 5px;
          padding: 10px 10px 16px;
          text-align: center;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: 100%;
        }
        .discount-tag {
          position: absolute;
          top: -5px;
          right: 6px;
          width: 50px;
          height: 50px;
          z-index: 5;
        }
        .discount-tag svg { width: 100%; height: 100%; }
        .discount-tag .tag-text {
          position: absolute;
          top: 8px;
          left: 0;
          right: 0;
          text-align: center;
          color: #ffffff;
          font-size: 13px;
          font-weight: 800;
        }
        .product-image {
          width: 100%;
          height: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 10px;
          margin-bottom: 10px;
        }
        .product-image img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }
        .product-name {
          font-size: 14px;
          color: #999999;
          font-weight: 600;
          text-transform: capitalize;
          margin-bottom: 4px;
        }
        .price-old {
          font-size: 12px;
          color: #bbbbbb;
          text-decoration: line-through;
          margin-bottom: 2px;
        }
        .price-new {
          font-size: 20px;
          color: #e2231a;
          font-weight: 800;
        }
        .footer {
          display: flex;
          align-items: stretch;
          background: #e2231a;
          height: 75px;
        }
        .footer-left {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 12px 24px;
          color: #ffffff;
        }
        .footer-left .wa-icon {
          width: 50px;
          height: 50px;
          background: #ffffff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .footer-left .wa-icon svg { width: 26px; height: 26px; }
        .footer-left .contact-text .label {
          font-size: 13px;
          font-weight: 600;
        }
        .footer-left .contact-text .phone {
          font-size: 22px;
          font-weight: 800;
        }
        .social {
          display: flex;
          align-items: center;
          gap: 12px;
          padding-right: 15px;
        }
        .social a {
          width: 36px;
          height: 36px;
          background: #ffffff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .social a svg { width: 20px; height: 20px; }
        .social .handle {
          color: #ffffff;
          font-size: 15px;
          font-weight: 600;
          margin-left: 6px;
        }
        .footer-right {
          width: 220px;
          background: #ffd400;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 8px;
        }
        .footer-right .scan-text {
          color: #e2231a;
          font-size: 15px;
          font-weight: 800;
          margin-bottom: 4px;
        }
        .footer-right .qr {
          width: 90px;
          height: 90px;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3px;
          margin-top: -30px;
          border: 3px solid #ffd400;
          box-shadow: 0 -4px 10px rgba(0,0,0,0.1);
          z-index: 10;
        }
        .footer-right .qr img {
          width: 100%;
          height: 100%;
        }

        /* Dynamic count classes to prevent low item stretching */
        .grid-container.count-1,
        .grid-container.count-2,
        .grid-container.count-3,
        .grid-container.count-4 {
          grid-template-columns: repeat(2, 1fr) !important;
          align-content: start !important;
          gap: 20px !important;
          padding: 30px !important;
        }
        .grid-container.count-1 {
          grid-template-columns: 1fr !important;
          max-width: 280px;
          margin: 0 auto;
        }
        .grid-container.count-1 .product-card,
        .grid-container.count-2 .product-card,
        .grid-container.count-3 .product-card,
        .grid-container.count-4 .product-card {
          height: 240px !important;
        }
        .grid-container.count-1 .product-image,
        .grid-container.count-2 .product-image,
        .grid-container.count-3 .product-image,
        .grid-container.count-4 .product-image {
          height: 140px !important;
        }

        .grid-container.count-5,
        .grid-container.count-6,
        .grid-container.count-7,
        .grid-container.count-8 {
          grid-template-columns: repeat(3, 1fr) !important;
          align-content: start !important;
          gap: 16px !important;
        }
        .grid-container.count-5 .product-card,
        .grid-container.count-6 .product-card,
        .grid-container.count-7 .product-card,
        .grid-container.count-8 .product-card {
          height: 190px !important;
        }
        .grid-container.count-5 .product-image,
        .grid-container.count-6 .product-image,
        .grid-container.count-7 .product-image,
        .grid-container.count-8 .product-image {
          height: 100px !important;
        }

        .grid-container.count-9,
        .grid-container.count-10,
        .grid-container.count-11,
        .grid-container.count-12 {
          grid-template-columns: repeat(3, 1fr) !important;
          align-content: start !important;
        }
        .grid-container.count-9 .product-card,
        .grid-container.count-10 .product-card,
        .grid-container.count-11 .product-card,
        .grid-container.count-12 .product-card {
          height: 180px !important;
        }
        .grid-container.count-9 .product-image,
        .grid-container.count-10 .product-image,
        .grid-container.count-11 .product-image,
        .grid-container.count-12 .product-image {
          height: 90px !important;
        }
      `
    },
    {
      id: "grocers_ledger",
      name: "📜 The Grocer's Ledger",
      type: "offer_brochure",
      status: "active",
      brochurePages: 2,
      description: "Classic vintage catalog template with elegant Fraunces serif headers, forest green accents, thin borders, and structured ledger grids.",
      defaultProductsPerPage: 12,
      headerHtml: `
        <div class="flyer-header">
          <div class="logo-block">
            <div class="logo-circle">
              {{#logoUrl}}<img src="{{logoUrl}}" alt="{{companyName}}">{{/logoUrl}}
            </div>
            <div class="company-name">{{companyName}}</div>
          </div>

          <div class="header-badge"><span>{{#headerBadgeText}}{{headerBadgeText}}{{/headerBadgeText}}{{^headerBadgeText}}70%<br>OFF{{/headerBadgeText}}</span></div>

          <div class="campaign-title">{{campaignTitle}}</div>
          <div class="header-title">{{headerTitle}}</div>
          <div class="header-subtitle">{{headerSubtitle}}</div>
        </div>
        <div class="offer-dates">Valid {{offerStartDate}} – {{offerEndDate}}</div>
      `,
      productCardHtml: `
        <div class="product-card">
          {{#badgeText}}
          <div class="badge-ribbon">{{badgeText}}</div>
          {{/badgeText}}
          <div class="product-image"><img src="{{imageUrl}}" alt="{{productName}}"></div>
          <div class="card-rule"></div>
          <div class="product-name">{{productName}}</div>
          <div class="product-quantity">{{quantity}}</div>
          <div class="price-row">
            {{#oldPrice}}<span class="old-price">{{currency}} {{formattedOldPrice}}</span>{{/oldPrice}}
            <span class="offer-price"><span class="currency">{{currency}}</span>{{formattedOfferPrice}}</span>
          </div>
        </div>
      `,
      footerHtml: `
        <div class="flyer-footer">
          <div class="footer-row">
            <div class="footer-contact">
              <div class="item">
                <span class="label">Call</span>
                <span class="value">{{phone}}</span>
              </div>
              <div class="item">
                <span class="label">WhatsApp</span>
                <span class="value">{{whatsapp}}</span>
              </div>
            </div>
            <div class="qr-block">
              <img src="{{qrCodeSrc}}" alt="Scan to WhatsApp">
            </div>
          </div>
          <div class="footer-address">{{footerAddress}}</div>
          <div class="terms-bar">{{terms}}</div>
        </div>
      `,
      css: `
        .page-container {
          background: #faf7f0 !important;
          color: #1b1b18 !important;
          font-family: 'Inter', sans-serif;
        }
        .flyer-header {
          position: relative;
          background: #1f3a2e;
          padding: 40px 32px 30px;
          text-align: center;
          overflow: visible;
        }
        .flyer-header::after {
          content: "";
          position: absolute;
          left: 32px;
          right: 32px;
          bottom: 12px;
          height: 1px;
          background: rgba(216, 189, 142, 0.35);
        }
        .logo-block {
          position: absolute;
          top: -30px;
          left: 32px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          width: 90px;
          z-index: 20;
        }
        .logo-block .logo-circle {
          width: 76px;
          height: 76px;
          border-radius: 50%;
          background: #f4efe4;
          border: 2px solid #b8925a;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          box-shadow: 0 4px 10px rgba(0,0,0,0.25);
        }
        .logo-block img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          padding: 0px;
        }
        .logo-block .company-name {
          font-family: 'Inter', sans-serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1.2px;
          text-transform: uppercase;
          color: #14261e;
          background: #d8bd8e;
          padding: 3px 10px;
          border-radius: 2px;
          white-space: nowrap;
        }
        .campaign-title {
          font-family: 'Fraunces', serif;
          font-weight: 600;
          font-size: 42px;
          color: #f4efe4;
          letter-spacing: 0.5px;
          line-height: 1;
          margin-top: 8px;
          text-transform: capitalize;
        }
        .header-title {
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: #d8bd8e;
          margin-top: 10px;
        }
        .header-subtitle {
          font-family: 'Fraunces', serif;
          font-style: italic;
          font-size: 16px;
          color: rgba(244, 239, 228, 0.75);
          margin-top: 8px;
        }
        .header-badge {
          position: absolute;
          top: -25px;
          right: 32px;
          width: 96px;
          height: 96px;
          border-radius: 50%;
          background: #faf7f0;
          border: 2px solid #b8925a;
          box-shadow: 0 0 0 5px #1f3a2e, 0 5px 12px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          transform: rotate(-6deg);
          z-index: 20;
        }
        .header-badge span {
          font-family: 'Fraunces', serif;
          font-weight: 700;
          font-size: 18px;
          color: #a63d2f;
          line-height: 1.15;
        }
        .offer-dates {
          text-align: center;
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: rgba(27, 27, 24, 0.55);
          padding: 16px 0 6px;
          background: #faf7f0;
        }
        .grid-container {
          display: grid;
          grid-template-columns: repeat(4, 1fr) !important;
          padding: 12px 24px 24px !important;
          background: #faf7f0 !important;
          flex-grow: 1;
          gap: 0px !important;
        }
        .product-card {
          position: relative;
          background: #faf7f0;
          border: 1px solid rgba(27, 27, 24, 0.14);
          padding: 16px 12px 14px;
          text-align: center;
          overflow: hidden;
          margin: -0.5px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: 100%;
        }
        .badge-ribbon {
          position: absolute;
          top: 15px;
          right: -32px;
          width: 120px;
          transform: rotate(40deg);
          background: #a63d2f;
          color: #f4efe4;
          font-family: 'Inter', sans-serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
          text-align: center;
          padding: 4px 0;
          z-index: 5;
        }
        .product-image {
          width: 100%;
          height: 90px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 10px;
        }
        .product-image img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }
        .card-rule {
          width: 30px;
          height: 1.5px;
          background: #b8925a;
          margin: 0 auto 10px;
        }
        .product-name {
          font-family: 'Fraunces', serif;
          font-weight: 500;
          font-size: 14px;
          color: #1b1b18;
          line-height: 1.25;
          min-height: 36px;
        }
        .product-quantity {
          font-family: 'Inter', sans-serif;
          font-size: 10px;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          color: rgba(27, 27, 24, 0.45);
          margin-top: 4px;
          margin-bottom: 12px;
        }
        .price-row {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }
        .old-price {
          font-family: 'Fraunces', serif;
          font-style: italic;
          font-size: 12px;
          color: rgba(27, 27, 24, 0.4);
          text-decoration: line-through;
        }
        .offer-price {
          font-family: 'IBM Plex Mono', monospace;
          font-weight: 600;
          font-size: 18px;
          color: #1f3a2e;
        }
        .offer-price .currency {
          font-size: 11px;
          font-weight: 500;
          vertical-align: super;
          margin-right: 1px;
          color: #a63d2f;
        }
        .flyer-footer {
          background: #1f3a2e;
          padding: 24px 32px 0;
          display: flex;
          flex-direction: column;
        }
        .footer-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding-bottom: 20px;
          border-bottom: 1px solid rgba(216, 189, 142, 0.3);
        }
        .footer-contact {
          display: flex;
          gap: 30px;
        }
        .footer-contact .item {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }
        .footer-contact .label {
          font-family: 'Inter', sans-serif;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: #d8bd8e;
        }
        .footer-contact .value {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 15px;
          font-weight: 600;
          color: #f4efe4;
        }
        .qr-block {
          width: 70px;
          height: 70px;
          background: #f4efe4;
          padding: 5px;
          border: 1px solid #b8925a;
          flex-shrink: 0;
        }
        .qr-block img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        .footer-address {
          text-align: center;
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          letter-spacing: 0.5px;
          color: rgba(244, 239, 228, 0.65);
          padding: 15px 0;
        }
        .terms-bar {
          background: #14261e;
          margin: 0 -32px;
          padding: 10px 32px;
          text-align: center;
          font-family: 'Inter', sans-serif;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: #d8bd8e;
        }

        /* Dynamic count classes to prevent low item stretching */
        .grid-container.count-1,
        .grid-container.count-2,
        .grid-container.count-3,
        .grid-container.count-4 {
          grid-template-columns: repeat(2, 1fr) !important;
          align-content: start !important;
          gap: 20px !important;
          padding: 30px !important;
        }
        .grid-container.count-1 {
          grid-template-columns: 1fr !important;
          max-width: 280px;
          margin: 0 auto;
        }
        .grid-container.count-1 .product-card,
        .grid-container.count-2 .product-card,
        .grid-container.count-3 .product-card,
        .grid-container.count-4 .product-card {
          height: 240px !important;
        }
        .grid-container.count-1 .product-image,
        .grid-container.count-2 .product-image,
        .grid-container.count-3 .product-image,
        .grid-container.count-4 .product-image {
          height: 140px !important;
        }

        .grid-container.count-5,
        .grid-container.count-6,
        .grid-container.count-7,
        .grid-container.count-8 {
          grid-template-columns: repeat(3, 1fr) !important;
          align-content: start !important;
          gap: 16px !important;
        }
        .grid-container.count-5 .product-card,
        .grid-container.count-6 .product-card,
        .grid-container.count-7 .product-card,
        .grid-container.count-8 .product-card {
          height: 190px !important;
        }
        .grid-container.count-5 .product-image,
        .grid-container.count-6 .product-image,
        .grid-container.count-7 .product-image,
        .grid-container.count-8 .product-image {
          height: 100px !important;
        }

        .grid-container.count-9,
        .grid-container.count-10,
        .grid-container.count-11,
        .grid-container.count-12 {
          grid-template-columns: repeat(3, 1fr) !important;
          align-content: start !important;
        }
        .grid-container.count-9 .product-card,
        .grid-container.count-10 .product-card,
        .grid-container.count-11 .product-card,
        .grid-container.count-12 .product-card {
          height: 180px !important;
        }
        .grid-container.count-9 .product-image,
        .grid-container.count-10 .product-image,
        .grid-container.count-11 .product-image,
        .grid-container.count-12 .product-image {
          height: 90px !important;
        }
      `
    }
  ];

  try {
    // Delete unwanted templates
    try {
      await dbService.deleteTemplate("festive_gold_cream");
      await dbService.deleteTemplate("minimal_glass_dark");
      await dbService.deleteTemplate("neo_brutalist_cyber");
      await dbService.deleteTemplate("dynamic_firebase_template");
    } catch (e) {
      console.error("Unwanted template deletion failed:", e);
    }

    for (const t of templatesToSeed) {
      await dbService.createTemplate(t);
    }
    console.log("Successfully seeded dynamic templates.");
  } catch (error) {
    console.error("Seeding dynamic templates failed:", error);
  }
}
