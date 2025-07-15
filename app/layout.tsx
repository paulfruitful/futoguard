import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FUTO Guardian - Campus Security System",
  description:
    "AI-powered blockchain-backed campus emergency response platform",
  manifest: "/manifest.json",
  // themeColor: "#dc2626",
  // viewport:
  //   "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
  // generator: "v0.dev",
};
// app/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary>
          <Providers>
            {children}
            <Toaster />
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}

function ErrorBoundary({ children }: { children: React.ReactNode }) {
  try {
    return <>{children}</>;
  } catch (error) {
    console.error("Layout error:", error);
    return <div>Error occurred - check console</div>;
  }
}
