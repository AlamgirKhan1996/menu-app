import "./globals.css";
import { AuthProvider } from "@/components/Providers";

export const metadata = {
  title: "Menu — Order via WhatsApp",
  description: "Browse our menu and place your order instantly via WhatsApp.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "OrderFlow Menu",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  themeColor: "#25D366",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="black-translucent" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="OrderFlow Menu" />
        <meta name="mobile-web-app-capable" content="yes" />

      </head>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
        <script dangerouslySetInnerHTML={{
          __html: `
            if ("serviceWorker" in navigator) {
              window.addEventListener("load", function() {
                navigator.serviceWorker.register("/sw.js")
                  .then(function(reg) { console.log("Service Worker registered"); })
                  .catch(function(err) { console.error("SW registration failed", err); });
              });
            }
          `
        }} />
      </body>
    </html>
  );
}
