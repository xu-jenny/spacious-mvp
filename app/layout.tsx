import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { StateProvider } from "./StateContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Spacious",
  description: "Spacious LLC 2023. contact: logan@spaciousai.com",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <StateProvider>{children}</StateProvider>
      </body>
    </html>
  );
}
