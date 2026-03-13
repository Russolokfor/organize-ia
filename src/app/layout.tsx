import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Organize.ia | Foco & Produtividade",
  description: "Transforme planos em ação diária.",
};

import { PWARegister } from "@/components/PWARegister";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={`${montserrat.variable} antialiased`}>
        <PWARegister />
        {children}
      </body>
    </html>
  );
}
