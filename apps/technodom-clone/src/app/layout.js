import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "./providers.js";
import { Header } from "@/presentation/components/Header.js";
import { Footer } from "@/presentation/components/Footer.js";
import "../styles/main.scss";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Technodom Clone Ecosystem",
  description: "Enterprise fintech e-commerce platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
      <Providers>
        <Header/>
        {children}
        <Footer/>
      </Providers>
      </body>
    </html>
  );
}
