import "../src/styles/base.css";
import "../src/styles/chrome.css";
import "../src/styles/home.css";
import "../src/styles/journal.css";
import "../src/styles/motion.css";
import "../src/admin/admin.css";
import RouterBridge from "../src/lib/RouterBridge.jsx";

export const metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
  title: "Feril Ferdian \u2014 Portfolio",
  description: "Personal portfolio of Feril Ferdian",
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f2e9" },
    { media: "(prefers-color-scheme: dark)", color: "#15110c" },
  ],
};

// Set the theme before first paint to avoid a flash of the wrong theme.
const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem("theme");if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark";}document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme="dark";}})();`;
const MOTION_SCRIPT = `(function(){try{var m=localStorage.getItem("portfolio-motion");if(m!=="full"&&m!=="reduced"){m=window.matchMedia("(prefers-reduced-motion: reduce)").matches?"reduced":"full";}document.documentElement.dataset.motion=m;}catch(e){document.documentElement.dataset.motion="full";}})();`;

// The lang attribute defaults to the default locale and is corrected on the
// client per route (see SiteShell). Per-page hreflang alternates are the
// primary multi-language signal for crawlers.
export default function RootLayout({ children }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400;1,6..72,500&display=swap"
        />
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: MOTION_SCRIPT }} />
      </head>
      <body>
        <RouterBridge />
        {children}
      </body>
    </html>
  );
}
