import type { Metadata } from "next";
import "./globals.css";
import { ShowcaseSwitcher } from "../components/showcase-switcher";
export const metadata: Metadata = {
  title: "Rota — Proje panosu",
  icons: { icon: `${process.env.LAB_BASE || ""}/rota/favicon.svg` },
  description:
    "Projelerini planla, görevlerini düzenle ve sütunlarını PDF olarak indir.",
};
export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr">
      <body>
        <link rel="stylesheet" href="./assets/showcase-switcher.css" />
        {children}
        <ShowcaseSwitcher current="rota" />
      </body>
    </html>
  );
}
