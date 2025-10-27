import type { Metadata } from "next";
import "./globals.css";
import Header from "../components/Header";
import { Sansation, Poppins } from "next/font/google";

export const metadata: Metadata = {
  title: "Pro Nano Chile",
  description: "Proyecto TSI",
};

const sansation = Sansation({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-sansation",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-poppins",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`flex flex-col antialiased w-full h-dvh ${sansation.variable} ${poppins.variable}`}>
          <Header/>
        {children}
      </body>
    </html>
  );
}