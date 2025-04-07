import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { Toaster as HotToaster } from "react-hot-toast";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Metadata } from "next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "स्नेहबंध पंढरपूर २०२५ | Arya Vaishya Komati Samaj",
    template: "%s | स्नेहबंध पंढरपूर २०२५",
  },
  description:
    "आर्य वैश्य कोमटी समाज, पंढरपूर संचलित स्नेहबंध २०२५ - स्व. सुरेश (आबा) कौलवार यांच्या स्मरणार्थ. 13 एप्रिल 2025 रोजी पंढरपूर येथे होणारा स्नेहबंध मेळावा.",
  keywords: [
    "स्नेहबंध",
    "पंढरपूर",
    "आर्य वैश्य कोमटी समाज",
    "स्नेहबंध 2025",
    "पंढरपूर मेळावा",
    "वैश्य समाज",
    "मैत्री मेळावा",
    "पंढरपूर स्नेहबंध",
  ],
  authors: [{ name: "Arya Vaishya Komati Samaj, Pandharpur" }],
  creator: "Arya Vaishya Komati Samaj",
  publisher: "Arya Vaishya Komati Samaj",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://snehband-pandharpur-2025.vercel.app/"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://snehband-pandharpur-2025.vercel.app/",
    title: "स्नेहबंध पंढरपूर २०२५ | Arya Vaishya Komati Samaj",
    description:
      "आर्य वैश्य कोमटी समाज, पंढरपूर संचलित स्नेहबंध २०२५ - स्व. सुरेश (आबा) कौलवार यांच्या स्मरणार्थ",
    siteName: "स्नेहबंध पंढरपूर २०२५",
    images: [
      {
        url: "https://res.cloudinary.com/ddrxbg3h9/image/upload/v1741503397/Sneh_melava_brpsgc.png",
        width: 1000,
        height: 400,
        alt: "स्नेहबंध मेळावा",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "स्नेहबंध पंढरपूर २०२५ | Arya Vaishya Komati Samaj",
    description:
      "आर्य वैश्य कोमटी समाज, पंढरपूर संचलित स्नेहबंध २०२५ - स्व. सुरेश (आबा) कौलवार यांच्या स्मरणार्थ",
    images: [
      "https://res.cloudinary.com/ddrxbg3h9/image/upload/v1741503397/Sneh_melava_brpsgc.png",
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [{ url: "/favicon.ico" }, { url: "/icon.png", type: "image/png" }],
    apple: [{ url: "/apple-icon.png" }],
    other: [
      {
        rel: "apple-touch-icon-precomposed",
        url: "/apple-touch-icon-precomposed.png",
      },
    ],
  },
  manifest: "/manifest.json",
  category: "event",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <SpeedInsights />
        <SessionProvider>
          <Nav />
          <main className="flex-1">{children}</main>
          <Footer />
          <Toaster />
          <HotToaster position="bottom-right" />
        </SessionProvider>
      </body>
    </html>
  );
}
