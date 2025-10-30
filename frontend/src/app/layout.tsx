import type { Metadata } from "next";
import "./globals.css";
import Header from "../components/layout/Header";
import { Poppins } from "next/font/google";

//Ajustes de la fuente
const poppins = Poppins(
  {
    subsets: ["latin"],
    weight: ["400", "700"]
  });

export const metadata: Metadata = {
  title: "Pro Nano Chile",
  description: "Proyecto TSI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head></head>
      <body className={`${poppins.className} flex flex-col min-h-screen antialiased`}>
          <Header/>
        <main className="flex-grow w-full pt-17"> 
          {children}
        </main>
      </body>
    </html>
  );
}