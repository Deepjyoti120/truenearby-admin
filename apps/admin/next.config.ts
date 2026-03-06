import type { NextConfig } from "next";
import { resolve } from "node:path";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  turbopack: {
    root: resolve(process.cwd(), "../.."),
  },
};
export default nextConfig;
