import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { StateProvider } from "./StateContext";
import Head from "next/head";
import { Analytics } from "@vercel/analytics/react"

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
      <Head>
        <script
          async
          defer
          src="https://cloud.umami.is/script.js"
          data-website-id="f4aa2798-a10d-4984-abd8-d7677dfd2b02"
        ></script>
      </Head>
      <body className={inter.className}>
        <StateProvider>{children}</StateProvider>
        <Analytics />
      </body>
    </html>
  );
}
