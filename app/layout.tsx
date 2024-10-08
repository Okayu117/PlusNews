import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "./components/layouts/header/Header";
import { ChakraProvider } from "@chakra-ui/react";
import { Noto_Sans_JP } from 'next/font/google';


const inter = Inter({ subsets: ["latin"] });
const darumadrop = Noto_Sans_JP({ subsets: ["latin"],
  weight: '400' });

  export const metadata: Metadata = {
    title: "ぜったいにおちこまない リアルタイムニュース",
    description: "悲しいニュースは読みたくない！自分を守りたい！そんな感受性豊かな繊細さんのためのニュースアプリです。",
  };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
      </head>
      <body className={`${inter.className} ${darumadrop.className}`}>
        <ChakraProvider>
          <Header />
          {children}
        </ChakraProvider>
      </body>
    </html>
  );
}
