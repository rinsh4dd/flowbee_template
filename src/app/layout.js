import { Poppins } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata = {
  title: "Flowbee Templates - Instant Brochure & Catalog Generator",
  description: "Create professional retail flyers, brochure catalogs and high-quality print ready PDFs in seconds.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-white font-sans">
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
