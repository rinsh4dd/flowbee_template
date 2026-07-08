import puppeteer from 'puppeteer';
import { generateBrochureHtml } from './src/lib/pdf-template.js';

const campaign = {
  campaignTitle: 'Test Campaign',
  companyName: 'Test Co',
  headerTitle: 'Test',
  headerSubtitle: 'Subtitle',
  headerBadgeText: 'Valid now',
  offerStartDate: '2026-07-01',
  offerEndDate: '2026-07-10',
  logoUrl: '',
  footerAddress: 'Address',
  phone: '+1234567890',
  whatsapp: '+1234567890',
  qrCodeUrl: '',
  terms: 'Terms',
  templateId: 'hypermarket_offer',
  themeColor: '#facc15',
  headerBgColor: '#dc2626',
  accentColor: '#facc15',
  footerBgColor: '#1e293b',
  textColor: '#1f2937',
  currency: 'INR',
  productsPerPage: 8,
  productsPerPageSubsequent: 10,
  layoutOrder: ['header', 'products', 'footer'],
};
const products = [{ productName:'P', quantity:'1', offerPrice:'10', oldPrice:'12', badgeText:'Hot' }];

const html = generateBrochureHtml(campaign, products);
console.log('HTML length', html.length);

const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'] });
const page = await browser.newPage();
await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 });
await page.setContent(html, { waitUntil: 'networkidle0' });
const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true, margin: { top:'0px', right:'0px', bottom:'0px', left:'0px' } });
await browser.close();
console.log('PDF size', pdfBuffer.length);
