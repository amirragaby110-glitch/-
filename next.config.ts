import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // سرورهای توسعه باید اجازهٔ میزبان‌های پروکسی (مثل پیش‌نمایش Arena / Vercel) را داشته باشند
  allowedDevOrigins: ["*.e2b.app", "*.vercel.app"],
  experimental: {
    optimizePackageImports: ["three", "gsap", "lucide-react"],
  },
};

export default nextConfig;
