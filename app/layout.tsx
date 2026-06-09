import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Baojai",
  description:
    "Baojai is a Thai wellness app for nutrition labels, meal planning, food logs, glucose trends, and health dashboards."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
