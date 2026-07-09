import { dbService } from "./db-service";

export async function seedDynamicTemplate() {
  const templatesToSeed = [
    {
      id: "festive_gold_cream",
      name: "✨ Gold & Cream Festive",
      type: "offer_brochure",
      status: "active",
      brochurePages: 2,
      description: "Luxurious cream-themed festive layout with gold accents, Playfair Display serif headers, elegant borders, and gold-accented pricing fields.",
      defaultProductsPerPage: 15,
      headerHtml: `
        <div class="luxury-header">
          <div class="luxury-header-border"></div>
          <div class="luxury-title-wrap">
            <h1>{{campaignTitle}}</h1>
            <p class="subtitle">{{headerTitle}}</p>
            {{#headerSubtitle}}<p class="desc">{{headerSubtitle}}</p>{{/headerSubtitle}}
          </div>
        </div>
      `,
      productCardHtml: `
        <div class="luxury-card">
          {{#badgeText}}<span class="luxury-badge">{{badgeText}}</span>{{/badgeText}}
          <div class="luxury-img-wrap">
            <img src="{{imageUrl}}" alt="{{productName}}" />
          </div>
          <div class="luxury-info">
            <h3>{{productName}}</h3>
            <p class="qty">{{quantity}}</p>
            <div class="prices">
              <span class="offer">{{currency}} {{formattedOfferPrice}}</span>
              {{#oldPrice}}<span class="old">{{currency}} {{formattedOldPrice}}</span>{{/oldPrice}}
            </div>
          </div>
        </div>
      `,
      footerHtml: `
        <div class="luxury-footer">
          <div class="luxury-footer-left">
            <h4>{{footerBrandName1}} {{footerBrandName2}}</h4>
            <p class="footer-sub">{{footerBrandSub}}</p>
            <p class="contact">📞 {{phone}} • 💬 WhatsApp: {{whatsapp}}</p>
          </div>
          <div class="luxury-footer-right">
            <img src="{{qrCodeSrc}}" alt="QR Code" />
          </div>
        </div>
      `,
      css: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,800;1,400&display=swap');
        
        .page-container {
          background-color: #faf6f0 !important;
          color: #2c2520 !important;
          border: 10px solid #d4af37;
        }
        .luxury-header {
          padding: 30px 24px 20px 24px;
          text-align: center;
          position: relative;
        }
        .luxury-header-border {
          position: absolute;
          top: 15px;
          left: 15px;
          right: 15px;
          bottom: 15px;
          border: 1px solid rgba(212, 175, 55, 0.4);
          pointer-events: none;
        }
        .luxury-title-wrap h1 {
          font-family: 'Playfair Display', serif;
          font-size: 32px;
          font-weight: 800;
          color: #8c6212;
          letter-spacing: 1px;
          text-transform: uppercase;
          margin-bottom: 6px;
        }
        .luxury-title-wrap .subtitle {
          font-size: 13px;
          font-weight: 600;
          color: #bfa054;
          letter-spacing: 3px;
          text-transform: uppercase;
          margin-bottom: 4px;
        }
        .luxury-title-wrap .desc {
          font-size: 10px;
          color: #6e6053;
          font-style: italic;
        }
        .grid-container {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          padding: 10px 25px 20px 25px;
          background: transparent !important;
          flex-grow: 1;
        }
        .luxury-card {
          background: #ffffff;
          border: 1px solid rgba(212, 175, 55, 0.25);
          border-radius: 8px;
          padding: 14px;
          text-align: center;
          position: relative;
          box-shadow: 0 4px 10px rgba(140, 98, 18, 0.04);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: 100%;
        }
        .luxury-badge {
          position: absolute;
          top: 8px;
          right: 8px;
          background: #8c6212;
          color: #ffffff;
          font-size: 8px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 20px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .luxury-img-wrap {
          height: 110px;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 10px;
        }
        .luxury-img-wrap img {
          max-height: 100%;
          max-width: 100%;
          object-fit: contain;
        }
        .luxury-info h3 {
          font-family: 'Playfair Display', serif;
          font-size: 12px;
          font-weight: 700;
          color: #2c2520;
          margin-bottom: 3px;
          line-height: 1.3;
        }
        .luxury-info .qty {
          font-size: 9px;
          color: #8c7f72;
          margin-bottom: 8px;
          font-weight: 500;
        }
        .luxury-info .prices {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .luxury-info .offer {
          font-size: 14px;
          font-weight: 800;
          color: #8c6212;
        }
        .luxury-info .old {
          font-size: 10px;
          text-decoration: line-through;
          color: #b0a396;
        }
        .luxury-footer {
          background: #2c2520;
          color: #faf6f0;
          padding: 20px 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 2px solid #d4af37;
        }
        .luxury-footer-left {
          text-align: left;
        }
        .luxury-footer-left h4 {
          font-family: 'Playfair Display', serif;
          font-size: 15px;
          color: #d4af37;
          margin-bottom: 2px;
        }
        .luxury-footer-left .footer-sub {
          font-size: 9px;
          color: #bfa054;
          letter-spacing: 1px;
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        .luxury-footer-left .contact {
          font-size: 9px;
          opacity: 0.8;
        }
        .luxury-footer-right img {
          height: 52px;
          width: 52px;
          border: 2px solid #d4af37;
          border-radius: 4px;
          background: white;
          padding: 2px;
        }
      `
    },
    {
      id: "minimal_glass_dark",
      name: "🌌 Glassmorphic Dark",
      type: "offer_brochure",
      status: "active",
      brochurePages: 2,
      description: "Sleek, futuristic dark-themed template featuring semi-transparent glassmorphic cards, custom typography, and neon cyber accents.",
      defaultProductsPerPage: 15,
      headerHtml: `
        <div class="glass-header">
          <div class="glass-header-glow"></div>
          <div class="glass-title-wrap">
            <span class="tag">Exclusive Campaign</span>
            <h1>{{campaignTitle}}</h1>
            <p class="subtitle">{{headerTitle}}</p>
          </div>
        </div>
      `,
      productCardHtml: `
        <div class="glass-card">
          {{#badgeText}}<span class="glass-badge">{{badgeText}}</span>{{/badgeText}}
          <div class="glass-img-wrap">
            <img src="{{imageUrl}}" alt="{{productName}}" />
          </div>
          <div class="glass-info">
            <h3>{{productName}}</h3>
            <p class="qty">{{quantity}}</p>
            <div class="prices">
              <span class="offer">{{currency}} {{formattedOfferPrice}}</span>
              {{#oldPrice}}<span class="old">{{currency}} {{formattedOldPrice}}</span>{{/oldPrice}}
            </div>
          </div>
        </div>
      `,
      footerHtml: `
        <div class="glass-footer">
          <div class="glass-footer-left">
            <h4>{{footerBrandName1}} <span>{{footerBrandName2}}</span></h4>
            <p class="sub">{{footerBrandSub}}</p>
            <p class="info">Call: {{phone}} • WhatsApp: {{whatsapp}}</p>
          </div>
          <div class="glass-footer-right">
            <img src="{{qrCodeSrc}}" alt="QR Code" />
          </div>
        </div>
      `,
      css: `
        .page-container {
          background: #0d0e12 !important;
          color: #f3f4f6 !important;
          font-family: 'Poppins', sans-serif;
        }
        .glass-header {
          padding: 35px 25px 25px 25px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .glass-header-glow {
          position: absolute;
          top: -50px;
          left: 20%;
          right: 20%;
          height: 100px;
          background: radial-gradient(circle, rgba(14, 165, 233, 0.15) 0%, rgba(0,0,0,0) 70%);
          pointer-events: none;
        }
        .glass-title-wrap .tag {
          font-size: 8px;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: #38bdf8;
          font-weight: 800;
          margin-bottom: 6px;
          display: inline-block;
        }
        .glass-title-wrap h1 {
          font-size: 28px;
          font-weight: 800;
          color: #ffffff;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
          background: linear-gradient(135deg, #ffffff 30%, #94a3b8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .glass-title-wrap .subtitle {
          font-size: 11px;
          color: #94a3b8;
          font-weight: 500;
        }
        .grid-container {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          padding: 10px 24px 24px 24px;
          background: transparent !important;
          flex-grow: 1;
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.03) !important;
          border: 1px solid rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(16px);
          border-radius: 12px;
          padding: 12px;
          text-align: center;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: 100%;
        }
        .glass-badge {
          position: absolute;
          top: 8px;
          right: 8px;
          background: linear-gradient(135deg, #38bdf8, #0284c7);
          color: #ffffff;
          font-size: 7px;
          font-weight: 800;
          padding: 2px 6px;
          border-radius: 6px;
          text-transform: uppercase;
        }
        .glass-img-wrap {
          height: 110px;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.015);
          border-radius: 8px;
          margin-bottom: 8px;
          padding: 6px;
          border: 1px solid rgba(255, 255, 255, 0.02);
        }
        .glass-img-wrap img {
          max-height: 100%;
          max-width: 100%;
          object-fit: contain;
        }
        .glass-info h3 {
          font-size: 11px;
          font-weight: 600;
          color: #f3f4f6;
          margin-bottom: 2px;
          line-height: 1.4;
        }
        .glass-info .qty {
          font-size: 8px;
          color: #64748b;
          margin-bottom: 6px;
          font-weight: 500;
        }
        .glass-info .prices {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .glass-info .offer {
          font-size: 13px;
          font-weight: 700;
          color: #38bdf8;
        }
        .glass-info .old {
          font-size: 9px;
          text-decoration: line-through;
          color: #475569;
        }
        .glass-footer {
          background: rgba(255, 255, 255, 0.01);
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          padding: 16px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .glass-footer-left {
          text-align: left;
        }
        .glass-footer-left h4 {
          font-size: 14px;
          color: #ffffff;
          font-weight: 700;
        }
        .glass-footer-left h4 span {
          color: #38bdf8;
        }
        .glass-footer-left .sub {
          font-size: 8px;
          color: #64748b;
          letter-spacing: 1px;
          text-transform: uppercase;
          margin-bottom: 4px;
        }
        .glass-footer-left .info {
          font-size: 8px;
          color: #94a3b8;
        }
        .glass-footer-right img {
          height: 48px;
          width: 48px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          background: #ffffff;
          padding: 2px;
        }
      `
    },
    {
      id: "neo_brutalist_cyber",
      name: "⚡ Brutalist Cyberpunk",
      type: "offer_brochure",
      status: "active",
      brochurePages: 2,
      description: "High-impact, trendsetting neo-brutalist theme. Bold chunky borders, flat drop shadows, and a punchy cyber-yellow palette.",
      defaultProductsPerPage: 15,
      headerHtml: `
        <div class="brutal-header">
          <div class="brutal-header-card">
            <h1>{{campaignTitle}}</h1>
            <p class="subtitle">{{headerTitle}}</p>
          </div>
        </div>
      `,
      productCardHtml: `
        <div class="brutal-card">
          {{#badgeText}}<span class="brutal-badge">{{badgeText}}</span>{{/badgeText}}
          <div class="brutal-img-wrap">
            <img src="{{imageUrl}}" alt="{{productName}}" />
          </div>
          <div class="brutal-info">
            <h3>{{productName}}</h3>
            <p class="qty">{{quantity}}</p>
            <div class="prices">
              <span class="offer">{{currency}} {{formattedOfferPrice}}</span>
              {{#oldPrice}}<span class="old">{{currency}} {{formattedOldPrice}}</span>{{/oldPrice}}
            </div>
          </div>
        </div>
      `,
      footerHtml: `
        <div class="brutal-footer">
          <div class="brutal-footer-card">
            <div class="info">
              <h4>{{footerBrandName1}} {{footerBrandName2}}</h4>
              <p class="sub">{{footerBrandSub}}</p>
              <p class="contact">CALL: {{phone}} • WHATSAPP: {{whatsapp}}</p>
            </div>
            <img src="{{qrCodeSrc}}" alt="QR Code" />
          </div>
        </div>
      `,
      css: `
        .page-container {
          background-color: #fef08a !important;
          color: #000000 !important;
          font-family: 'Poppins', sans-serif;
        }
        .brutal-header {
          padding: 30px 24px 15px 24px;
        }
        .brutal-header-card {
          background: #ffffff;
          border: 3px solid #000000;
          box-shadow: 5px 5px 0px #000000;
          padding: 16px;
          text-align: center;
        }
        .brutal-header-card h1 {
          font-size: 26px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: -0.5px;
          margin-bottom: 2px;
        }
        .brutal-header-card .subtitle {
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #f97316;
        }
        .grid-container {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          padding: 10px 24px 20px 24px;
          background: transparent !important;
          flex-grow: 1;
        }
        .brutal-card {
          background: #ffffff;
          border: 3px solid #000000;
          box-shadow: 4px 4px 0px #000000;
          border-radius: 0px;
          padding: 12px;
          text-align: center;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: 100%;
        }
        .brutal-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          background: #f97316;
          color: #ffffff;
          font-size: 7px;
          font-weight: 900;
          padding: 3px 6px;
          border: 2px solid #000000;
          text-transform: uppercase;
          transform: rotate(2deg);
        }
        .brutal-img-wrap {
          height: 100px;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          border-bottom: 2px solid #000000;
          margin-bottom: 8px;
          padding-bottom: 8px;
        }
        .brutal-img-wrap img {
          max-height: 100%;
          max-width: 100%;
          object-fit: contain;
        }
        .brutal-info h3 {
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          color: #000000;
          margin-bottom: 2px;
          line-height: 1.3;
        }
        .brutal-info .qty {
          font-size: 8px;
          color: #555555;
          margin-bottom: 6px;
          font-weight: 700;
        }
        .brutal-info .prices {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .brutal-info .offer {
          font-size: 13px;
          font-weight: 900;
          color: #ffffff;
          background: #000000;
          padding: 2px 6px;
          border: 1px solid #000000;
        }
        .brutal-info .old {
          font-size: 9px;
          text-decoration: line-through;
          color: #888888;
          font-weight: 700;
        }
        .brutal-footer {
          padding: 15px 24px 30px 24px;
        }
        .brutal-footer-card {
          background: #ffffff;
          border: 3px solid #000000;
          box-shadow: 4px 4px 0px #000000;
          padding: 12px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .brutal-footer-card .info {
          text-align: left;
        }
        .brutal-footer-card h4 {
          font-size: 14px;
          font-weight: 900;
          text-transform: uppercase;
        }
        .brutal-footer-card .sub {
          font-size: 8px;
          font-weight: 700;
          color: #666666;
          margin-bottom: 4px;
          text-transform: uppercase;
        }
        .brutal-footer-card .contact {
          font-size: 8px;
          font-weight: 800;
        }
        .brutal-footer-card img {
          height: 44px;
          width: 44px;
          border: 2px solid #000000;
          background: #ffffff;
          padding: 2px;
        }
      `
    },
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
          gap: 24px !important;
          padding: 30px 40px !important;
        }
        .grid-container.count-1 {
          grid-template-columns: 1fr !important;
          max-width: 400px;
          margin: 0 auto;
        }
        .grid-container.count-1 .red-card,
        .grid-container.count-2 .red-card,
        .grid-container.count-3 .red-card {
          padding: 20px !important;
          border-width: 2px !important;
          min-height: 250px !important;
        }
        .grid-container.count-1 .red-img-wrap,
        .grid-container.count-2 .red-img-wrap,
        .grid-container.count-3 .red-img-wrap {
          height: 160px !important;
        }
        .grid-container.count-1 .product-info h3,
        .grid-container.count-2 .product-info h3,
        .grid-container.count-3 .product-info h3 {
          font-size: 15px !important;
        }
        .grid-container.count-1 .product-info .qty,
        .grid-container.count-2 .product-info .qty,
        .grid-container.count-3 .product-info .qty {
          font-size: 11px !important;
        }
        .grid-container.count-1 .price-badge,
        .grid-container.count-2 .price-badge,
        .grid-container.count-3 .price-badge {
          min-width: 80px !important;
        }
        .grid-container.count-1 .price-badge-body,
        .grid-container.count-2 .price-badge-body,
        .grid-container.count-3 .price-badge-body {
          font-size: 15px !important;
          padding: 5px 2px !important;
        }

        .grid-container.count-4,
        .grid-container.count-5,
        .grid-container.count-6 {
          grid-template-columns: repeat(2, 1fr) !important;
          gap: 20px !important;
          padding: 20px 30px !important;
        }
        .grid-container.count-4 .red-card,
        .grid-container.count-5 .red-card,
        .grid-container.count-6 .red-card {
          padding: 16px !important;
          min-height: 200px !important;
        }
        .grid-container.count-4 .red-img-wrap,
        .grid-container.count-5 .red-img-wrap,
        .grid-container.count-6 .red-img-wrap {
          height: 130px !important;
        }
        .grid-container.count-4 .product-info h3,
        .grid-container.count-5 .product-info h3,
        .grid-container.count-6 .product-info h3 {
          font-size: 12px !important;
        }
      `
    }
  ];

  try {
    for (const t of templatesToSeed) {
      await dbService.createTemplate(t);
    }
    console.log("Successfully seeded dynamic templates.");
  } catch (error) {
    console.error("Seeding dynamic templates failed:", error);
  }
}
