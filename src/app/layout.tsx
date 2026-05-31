import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import type React from "react"; // Import React
import { cn } from "@/lib/utils";

const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Money Tracker 🤑",
  description:
    "El control de tus gastos, en un solo lugar. Registrá tus gastos mensuales y anuales de forma ágil y visual.",
  keywords: [
    "money tracker",
    "finanzas",
    "gastos",
    "presupuesto",
    "control de gastos",
    "nextjs",
    "react",
    "postgres",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn(bricolageGrotesque.className, "antialiased")}>
        {children}
      </body>
    </html>
  );
}
