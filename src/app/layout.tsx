import type { Metadata, Viewport } from "next";
import "./globals.css";
import Root from "@/components/Root";

export const metadata: Metadata = {
  metadataBase: new URL("https://gravity-falls-nexus.vercel.app"),
  title: { default: "گرانش فالز — اولتی‌میت نکسوس | دانشنامهٔ کامل، موزیک، فکت و هوش مصنوعی", template: "%s · گرانش فالز نکسوس" },
  description: "پایگاه دانش هواداری گرانش فالز به فارسی: ۱۱۰ فکت ترسناک، ۲۱۲ فکت جالب، پلیر موزیک با ویژوالایزر، راهنمای ۴۰ قسمت، گالری ۲۰۰+ تصویری، هوش مصنوعی RAG، TTS شخصیت‌ها، تماشای ویدیو، ثبت اطلاعات جدید و PWA آفلاین.",
  keywords: ["گرانش فالز", "Gravity Falls", "بیل سایفر", "انیمیشن", "فکت ترسناک", "آپارات", "هوش مصنوعی", "دانشنامه هواداری"],
  icons: { icon: "/icons/icon-192.png", apple: "/icons/icon-192.png" },
  appleWebApp: { capable: true, title: "GF نکسوس", statusBarStyle: "black-translucent" },
  openGraph: { title: "گرانش فالز — اولتی‌میت نکسوس", description: "هر آنچه دربارهٔ گرانش فالز باید بدانید — فارسی، تعاملی، آفلاین.", type: "website", locale: "fa_IR" },
};
export const viewport: Viewport = {
  width: "device-width", initialScale: 1,
  themeColor: [{ color: "#0a1610", media: "(prefers-color-scheme: dark)" }, { color: "#eef3e6", media: "(prefers-color-scheme: light)" }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="preload" href="/fonts/Vazirmatn-var.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <script dangerouslySetInnerHTML={{
          __html: `try{var s=JSON.parse(localStorage.getItem('gf-nexus-settings')||'null');if(!s||!s.state||(s.state.theme||'dark')==='dark'){document.documentElement.classList.add('dark')}}catch(e){document.documentElement.classList.add('dark')}`,
        }} />
      </head>
      <body className="grain scanlines font-sans antialiased" style={{ fontFamily: "Vazirmatn, Tahoma, sans-serif" }}>
        <Root>{children}</Root>
      </body>
    </html>
  );
}
