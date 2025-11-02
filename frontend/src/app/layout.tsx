import type { Metadata } from "next";
import "./globals.css";
import Header from "../components/Header";
import Footer from "@/components/Footer";
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
        <div className="w-full h-8 content-center bg-black relative shadow-[0px_1px_0px_0px_rgba(255,255,255,0.35)] z-60">
          <div className="opacity-70 justify-self-center text-zinc-100 text-xl font-bold font-['Poppins']">Envios gratuitos a partir de $20.000 </div>
        </div>
        <Header/>
        {children}
        <Footer/>
      </body>
    </html>
  );
}