import type { Metadata } from "next";
import localFont from "next/font/local";
import "@/styles/global.css";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

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
    // suppressHydrationWarning: next-themes sets the "dark" class on <html> before hydration.
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "h-full antialiased font-sans",
        nunito.variable,
        pacifico.variable,
      )}
    >
      <body className="min-h-full flex flex-col font-sans">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Toaster>{children}</Toaster>
        </ThemeProvider>
      </body>
    </html>
  );
}
