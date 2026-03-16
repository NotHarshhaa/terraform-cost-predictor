import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Figtree } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const figtree = Figtree({subsets:['latin'],variable:'--font-sans'});

const jetbrainsMono = JetBrains_Mono({subsets:['latin'],variable:'--font-mono'});

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Terraform Cost Predictor",
  description: "ML-powered infrastructure cost prediction from Terraform configurations",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn( jetbrainsMono.variable, "font-sans", figtree.variable)}>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
