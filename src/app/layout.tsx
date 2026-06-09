import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Workforce Modeling Command Center | DHS HQ OCFO",
  description:
    "Resource Management Division decision-support demo — workforce, grade mix, hiring scenarios, budget variance, and mission staffing modeling.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
