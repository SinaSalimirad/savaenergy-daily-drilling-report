import type { Metadata } from "next";
import localFont from "next/font/local";
import "@/styles/global.css";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});


// Self-hosted variable font: one file covers every weight from 200 to 1000. No italic on purpose.
const nunito = localFont({
  variable: "--font-nunito",
  display: "swap",
  src: "../fonts/Nunito-Variable.woff2",
  weight: "200 1000",
  style: "normal",
});

// Used only by the logo, never for body text.
const pacifico = localFont({
  variable: "--font-pacifico",
  display: "swap",
  src: "../fonts/Pacifico-Regular.woff2",
  weight: "400",
  style: "normal",
});

export const metadata: Metadata = {
  title: "Sava Daily Drilling Report",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", nunito.variable, pacifico.variable, "font-sans", inter.variable)}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
