import type { Metadata } from "next";
import "./globals.css";
import { Sansation, Poppins } from "next/font/google";

export const metadata: Metadata = {
  title: "ola",
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
      <body className={`flex antialiased justify-center !bg-neutral-950 w-full h-dvh ${sansation.variable} ${poppins.variable}`}>
        {children}
      </body>
    </html>
  );
}

//!bg-{color}: la exclamación marca como regla !important