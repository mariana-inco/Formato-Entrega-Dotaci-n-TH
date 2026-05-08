import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Entrega de dotación TH",
  description: "Formulario para entrega de dotación de talento humano",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
