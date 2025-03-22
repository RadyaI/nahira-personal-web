import { Poppins, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { Metadata } from "next";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const instrumentserif = Instrument_Serif({
  variable: "--font-ins-serif",
  subsets: ["latin"],
  weight: ["400"]
})

export const metadata: Metadata = ({
  title: "Na Web"
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} ${instrumentserif.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
