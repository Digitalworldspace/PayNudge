import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PayNudge – automatic invoice reminders for freelancers",
  description:
    "PayNudge emails polite, then firmer, payment reminders for your unpaid invoices, so you get paid without the awkward follow-ups.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,800&family=Figtree:wght@400;500;600&family=JetBrains+Mono:wght@500&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
