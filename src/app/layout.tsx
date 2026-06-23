import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RideApp – Motorrad Community Schweiz",
  description: "Plane deine Motorrad-Touren, bewerte Fahrer und vernetze dich mit der Biker-Community in der Schweiz.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className="h-full antialiased">
      <body className="min-h-full flex flex-col gradient-bg">{children}</body>
    </html>
  );
}
