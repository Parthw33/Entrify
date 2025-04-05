import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { Toaster as HotToaster } from "react-hot-toast";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
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
