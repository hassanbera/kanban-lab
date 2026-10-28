/** @type {import('next').NextConfig} */
const root = (process.env.LAB_BASE || "").replace(/\/$/, "");
export default {
  output: "export",
  trailingSlash: true,
  basePath: root + "/rota",
  images: { unoptimized: true },
  devIndicators: false,
};
