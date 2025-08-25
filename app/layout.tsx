import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from '@/contexts/AuthContext';
import { Analytics } from "@vercel/analytics/next"
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tripmate",
  description: "Your travel companion app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
            <Analytics/>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
