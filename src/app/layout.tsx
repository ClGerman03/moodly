import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

// Outfit es una tipografía moderna, geométrica y elegante
const outfit = Outfit({ 
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Moodly - Crea tu tablero",
  description: "Crea tableros Moodly en segundos sin registrarte",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={outfit.className}>{children}</body>
    </html>
  );
}
