import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ola",
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
      <body className={`flex antialiased justify-center !bg-black w-full h-dvh`}>
        {children}
      </body>
    </html>
  );
}

//!bg-{color}: la exclamación marca como regla !important