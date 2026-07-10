import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import { AuthProvider } from "@/lib/auth/context";
import { APP_NAME } from "@/lib/config";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} — Women's Fashion`,
    template: `%s | ${APP_NAME}`,
  },
  description:
    "Trendy women's clothes at prices you'll love. New drops, cute fits, and bold street style — shop NewFit.",
  icons: {
    icon: [
      {
        url: "/favicon.svg",
        type: "image/svg+xml",
      },
      {
        url: "/favicon-32.png",
        sizes: "32x32",
      },
    ],
    apple: "/apple-touch-icon-180.png",
  },
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#FAF6F0",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} bg-background`}
    >
      <body className="font-sans antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
