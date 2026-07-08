import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata = {
  title: "Flowbee Templates - Instant Brochure & Catalog Generator",
  description: "Create professional retail flyers, brochure catalogs and high-quality print ready PDFs in seconds.",
  icons: {
    icon: "/flowbeeWhatsappNotification_logo.jpeg",
    shortcut: "/flowbeeWhatsappNotification_logo.jpeg",
    apple: "/flowbeeWhatsappNotification_logo.jpeg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} h-full antialiased`}
    >
      <head>
        <link rel="icon" href="/flowbeeWhatsappNotification_logo.jpeg" />
        <link rel="apple-touch-icon" href="/flowbeeWhatsappNotification_logo.jpeg" />
      </head>
      <body className="min-h-full flex flex-col bg-slate-950 text-white font-sans">
        {children}
      </body>
    </html>
  );
}
