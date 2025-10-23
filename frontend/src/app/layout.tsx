import type { Metadata } from "next";
import "./globals.css";
import Header from "../components/Header";

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
      <body className={"flex flex-col antialiased justify-center w-full h-dvh"}>
          <Header/>
        {children}
      </body>
    </html>
  );
}