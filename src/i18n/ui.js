// UI string dictionary — the built-in DEFAULTS for interface copy.
// At runtime these can be overridden per-locale from the dashboard (stored in
// the Supabase `translations` table); see mergeUI below. Translated *content*
// (about, projects, experience, skills, hero copy) lives in ../data.js.
import { defaultLocale } from "./config.js";

export const dict = {
  id: {
    lang: { name: "Indonesia", short: "ID" },
    nav: {
      work: "Karya",
      about: "Tentang",
      services: "Layanan",
      experience: "Pengalaman",
      journal: "Jurnal",
      contact: "Kontak",
    },
    hero: {
      viewWork: "Lihat karya pilihan",
      getInTouch: "Hubungi saya",
      scroll: "Gulir",
    },
    sections: {
      about: "(Tentang)",
      work: "(Karya Pilihan)",
      workTitle: "Hal yang saya bangun",
      experience: "(Pengalaman)",
      experienceTitle: "Tempat saya berkarya",
      contact: "(Kontak)",
      contactTitle: "Mari ciptakan sesuatu yang hebat.",
    },
    services: {
      label: "(Layanan)",
      meta: "Kapabilitas",
      title: "Yang bisa saya kerjakan",
      intro: "Saya membantu mengubah ide yang kompleks menjadi produk digital yang jelas, matang, dan siap digunakan.",
      cta: "Mulai percakapan",
      scopeLabel: "Cakupan",
      empty: "Daftar layanan akan segera hadir.",
    },
    blog: {
      label: "(Jurnal)",
      title: "Tulisan & catatan",
      loading: "Memuat\u2026",
      empty: "Belum ada tulisan yang terbit \u2014 nantikan segera.",
      back: "\u2190 Semua tulisan",
      notFound: "Tulisan tidak ditemukan.",
    },
    footer: { dashboard: "Dasbor", backToTop: "Kembali ke atas \u2191" },
    curtain: { home: "Beranda", journal: "Jurnal", reading: "Membaca" },
    theme: {
      toLight: "Beralih ke mode terang",
      toDark: "Beralih ke mode gelap",
    },
    accessibility: {
      title: "Aksesibilitas",
      open: "Buka menu aksesibilitas",
      motion: "Animasi & transisi",
      motionDesc:
        "Matikan transisi halaman, smooth scroll, dan animasi dekoratif.",
      enabled: "Aktif",
      disabled: "Nonaktif",
    },
    a11y: {
      backToTop: "Kembali ke atas",
      openMenu: "Buka menu",
      closeMenu: "Tutup menu",
    },
    meta: {
      homeTitle: "Feril Ferdian \u2014 Desainer & Pengembang Produk",
      homeDesc:
        "Portofolio pribadi Feril Ferdian \u2014 merancang produk digital yang matang dengan kejernihan dan ketelitian.",
      blogTitle: "Jurnal \u2014 Feril Ferdian",
      blogDesc: "Tulisan & catatan oleh Feril Ferdian.",
      postFallback: "Tulisan \u2014 Feril Ferdian",
    },
  },
  en: {
    lang: { name: "English", short: "EN" },
    nav: {
      work: "Work",
      about: "About",
      services: "Services",
      experience: "Experience",
      journal: "Journal",
      contact: "Contact",
    },
    hero: {
      viewWork: "View selected work",
      getInTouch: "Get in touch",
      scroll: "Scroll",
    },
    sections: {
      about: "(About)",
      work: "(Selected Work)",
      workTitle: "Things I\u2019ve built",
      experience: "(Experience)",
      experienceTitle: "Where I\u2019ve worked",
      contact: "(Contact)",
      contactTitle: "Let\u2019s make something great.",
    },
    services: {
      label: "(Services)",
      meta: "Capabilities",
      title: "What I can help with",
      intro: "I help turn complex ideas into clear, considered digital products that are ready to use.",
      cta: "Start a conversation",
      scopeLabel: "Scope",
      empty: "Service details are coming soon.",
    },
    blog: {
      label: "(Journal)",
      title: "Writing & notes",
      loading: "Loading\u2026",
      empty: "No posts published yet \u2014 check back soon.",
      back: "\u2190 All posts",
      notFound: "Post not found.",
    },
    footer: { dashboard: "Dashboard", backToTop: "Back to top \u2191" },
    curtain: { home: "Home", journal: "Journal", reading: "Reading" },
    theme: { toLight: "Switch to light mode", toDark: "Switch to dark mode" },
    accessibility: {
      title: "Accessibility",
      open: "Open accessibility menu",
      motion: "Animations & transitions",
      motionDesc:
        "Disable page transitions, smooth scrolling, and decorative motion.",
      enabled: "On",
      disabled: "Off",
    },
    a11y: {
      backToTop: "Back to top",
      openMenu: "Open menu",
      closeMenu: "Close menu",
    },
    meta: {
      homeTitle: "Feril Ferdian \u2014 Product Designer & Developer",
      homeDesc:
        "Personal portfolio of Feril Ferdian \u2014 designing thoughtful digital products with clarity and craft.",
      blogTitle: "Journal \u2014 Feril Ferdian",
      blogDesc: "Writing & notes by Feril Ferdian.",
      postFallback: "Post \u2014 Feril Ferdian",
    },
  },
};

export function getUI(locale) {
  return dict[locale] || dict[defaultLocale];
}

function isPlainObject(v) {
  return v && typeof v === "object" && !Array.isArray(v);
}

// Deep-merge dashboard overrides onto the built-in defaults. Empty strings in
// the overrides are ignored so a blank field falls back to the default copy.
function deepMerge(base, over) {
  if (!isPlainObject(over)) return base;
  const out = { ...base };
  for (const key of Object.keys(over)) {
    const ov = over[key];
    if (isPlainObject(out[key]) && isPlainObject(ov)) {
      out[key] = deepMerge(out[key], ov);
    } else if (typeof ov === "string") {
      if (ov !== "") out[key] = ov;
    } else if (ov !== undefined && ov !== null) {
      out[key] = ov;
    }
  }
  return out;
}

// The interface copy the app should actually use for a locale: defaults with
// the dashboard overrides layered on top.
export function mergeUI(locale, overrides) {
  return deepMerge(getUI(locale), overrides || {});
}
