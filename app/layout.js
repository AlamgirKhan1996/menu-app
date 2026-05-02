import "./globals.css";
import { AuthProvider } from "@/components/Providers";

export const metadata = {
  title: "Menu — Order via WhatsApp",
  description: "Browse our menu and place your order instantly via WhatsApp.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
