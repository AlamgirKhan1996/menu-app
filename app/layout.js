import "./globals.css";

export const metadata = {
  title: "Menu — Order via WhatsApp",
  description: "Browse our menu and place your order instantly via WhatsApp.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
