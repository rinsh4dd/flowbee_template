import { NextResponse } from "next/server";
import puppeteer from "puppeteer";
import { generateBrochureHtml } from "@/lib/pdf-template";

export async function POST(request) {
  try {
    const body = await request.json();
    const { campaign, products } = body;

    if (!campaign) {
      return NextResponse.json({ error: "Campaign data is required" }, { status: 400 });
    }

    // Generate the raw flyer HTML
    const htmlContent = generateBrochureHtml(campaign, products);

    // Launch headless Chromium via Puppeteer
    const browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-web-security"
      ]
    });

    const page = await browser.newPage();

    // Set viewport matching standard A4 at 96 DPI
    await page.setViewport({
      width: 794,
      height: 1123,
      deviceScaleFactor: 2 // High resolution rendering
    });

    // Inject our HTML content and wait for network assets/fonts to load
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    // Print A4 PDF
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "0px",
        right: "0px",
        bottom: "0px",
        left: "0px"
      }
    });

    await browser.close();

    // Return print buffer directly
    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${campaign.campaignTitle.toLowerCase().replace(/\s+/g, "-")}-brochure.pdf"`,
        "Content-Length": pdfBuffer.length.toString()
      }
    });
  } catch (error) {
    console.error("PDF Generation Endpoint Error:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF brochure: " + error.message },
      { status: 500 }
    );
  }
}
