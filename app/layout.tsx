import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import { AuthProvider } from "@/lib/auth/context";
import { ToastProvider } from "@/components/ui/Toast";
import { JsonLd } from "@/components/json-ld";
import { APP_NAME, SITE_URL } from "@/lib/config";
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

const DESCRIPTION =
  "Trendy women's clothes at prices you'll love. New drops, cute fits, and bold street style — shop NewFit.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${APP_NAME} — Women's Fashion`,
    template: `%s | ${APP_NAME}`,
  },
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: `${APP_NAME} — Women's Fashion`,
    description: DESCRIPTION,
    url: "/",
    images: [{ url: "/campaign/hero.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${APP_NAME} — Women's Fashion`,
    description: DESCRIPTION,
    images: ["/campaign/hero.png"],
  },
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
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Organization",
            name: APP_NAME,
            url: SITE_URL,
            logo: `${SITE_URL}/logo-primary.svg`,
          }}
        />
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: APP_NAME,
            url: SITE_URL,
            potentialAction: {
              "@type": "SearchAction",
              target: {
                "@type": "EntryPoint",
                urlTemplate: `${SITE_URL}/products?search={search_term_string}`,
              },
              "query-input": "required name=search_term_string",
            },
          }}
        />
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
