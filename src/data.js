// ---------------------------------------------------------------------------
// Edit this file to make the portfolio yours. All translatable text lives here,
// split by locale ("id" = Bahasa Indonesia, "en" = English).
// Shared identity (name, email, socials, …) is not translated.
// ---------------------------------------------------------------------------

const shared = {
  name: "Feril Ferdian",
  initials: "DF",
  location: "Bangkok, Thailand",
  email: "dhilfayyadh@gmail.com",
  socials: [
    { label: "GitHub", href: "https://github.com/" },
    { label: "LinkedIn", href: "https://linkedin.com/" },
    { label: "Twitter", href: "https://twitter.com/" },
    { label: "Dribbble", href: "https://dribbble.com/" },
  ],
};

const en = {
  role: "Full Stack Web Developer",
  roles: ["Full Stack Developer", "Frontend Developer", "Backend Developer"],
  // Wrap words in * * to highlight them in the accent color.
  headline: "Building web apps that are *clear* to use and *solid* to run.",
  availability: "Available for new work",
  keywords: [
    "UI / UX",
    "Design Systems",
    "React",
    "Prototyping",
    "Motion",
    "Branding",
    "Frontend",
    "Interaction",
  ],
  about: {
    statement:
      "I build simple, useful things at the intersection of design and code \u2014 obsessing over clarity, craft, and the small details that make a product feel effortless.",
    paragraphs: [
      "I work across the whole process, from early ideas and wireframes to shipping polished, production-ready interfaces.",
      "Currently focused on design systems and expressive, performant web experiences.",
    ],
  },
  skills: [
    {
      group: "Design",
      items: ["UI / UX", "Prototyping", "Design Systems", "Figma"],
    },
    {
      group: "Frontend",
      items: ["React", "JavaScript", "HTML & CSS", "Tailwind"],
    },
    { group: "Tools", items: ["Git", "Next.js", "Notion", "Vercel"] },
  ],
  services: [
    {
      title: "Product Strategy & UX",
      description: "Turning early ideas and complex requirements into focused product directions, clear flows, and testable prototypes.",
      deliverables: ["Discovery", "UX Audit", "User Flows", "Prototyping"],
    },
    {
      title: "Interface & Design Systems",
      description: "Designing coherent interfaces and reusable foundations that keep products consistent as they grow.",
      deliverables: ["UI Design", "Components", "Design Tokens", "Documentation"],
    },
    {
      title: "Frontend Development",
      description: "Building responsive, accessible interfaces with production-ready code and careful attention to performance.",
      deliverables: ["React", "Next.js", "Responsive UI", "CSS Architecture"],
    },
    {
      title: "Motion & Interaction",
      description: "Using purposeful motion and interaction details to guide attention and make digital products feel considered.",
      deliverables: ["Motion Direction", "Prototyping", "GSAP", "Micro-interactions"],
    },
  ],
  projects: [
    {
      title: "Aurora Design System",
      year: "2025",
      description:
        "A modular component library and design language used across web and mobile products.",
      tags: ["React", "Design System"],
      href: "#",
    },
    {
      title: "Nomad Travel App",
      year: "2024",
      description:
        "A minimal trip-planning app that turns scattered ideas into a clear day-by-day itinerary.",
      tags: ["UI/UX", "Prototype"],
      href: "#",
    },
    {
      title: "Ledger Dashboard",
      year: "2024",
      description:
        "A finance dashboard focused on clarity, with clean data visualization and fast navigation.",
      tags: ["React", "Data Viz"],
      href: "#",
    },
    {
      title: "Personal Portfolio",
      year: "2023",
      description:
        "This very site \u2014 a lightweight, expressive portfolio built with React and Next.js.",
      tags: ["React", "Motion"],
      href: "#",
    },
  ],
  experience: [
    {
      role: "Product Designer",
      company: "Studio Example",
      period: "2023 \u2014 Present",
      description:
        "Lead design for core product surfaces, from research to shipped UI.",
    },
    {
      role: "Frontend Developer",
      company: "Acme Inc.",
      period: "2021 \u2014 2023",
      description:
        "Built and maintained responsive web interfaces in a React codebase.",
    },
    {
      role: "Freelance Designer",
      company: "Self-employed",
      period: "2019 \u2014 2021",
      description:
        "Partnered with startups on branding, websites, and product design.",
    },
  ],
};

const id = {
  role: "Full Stack Web Developer",
  roles: ["Full Stack Developer", "Frontend Developer", "Backend Developer"],
  headline:
    "Membangun aplikasi web yang *jelas* dipakai dan *andal* dijalankan.",
  availability: "Terbuka untuk proyek baru",
  keywords: [
    "UI / UX",
    "Design System",
    "React",
    "Prototipe",
    "Motion",
    "Branding",
    "Frontend",
    "Interaksi",
  ],
  about: {
    statement:
      "Saya membangun hal-hal sederhana dan berguna di persimpangan desain dan kode \u2014 terobsesi pada kejernihan, ketelitian, dan detail kecil yang membuat sebuah produk terasa mulus.",
    paragraphs: [
      "Saya terlibat di sepanjang proses, dari ide awal dan wireframe hingga merilis antarmuka yang matang dan siap produksi.",
      "Saat ini berfokus pada design system serta pengalaman web yang ekspresif dan berperforma tinggi.",
    ],
  },
  skills: [
    {
      group: "Desain",
      items: ["UI / UX", "Prototipe", "Design System", "Figma"],
    },
    {
      group: "Frontend",
      items: ["React", "JavaScript", "HTML & CSS", "Tailwind"],
    },
    { group: "Peralatan", items: ["Git", "Next.js", "Notion", "Vercel"] },
  ],
  services: [
    {
      title: "Strategi Produk & UX",
      description: "Mengubah ide awal dan kebutuhan yang kompleks menjadi arah produk yang fokus, alur yang jelas, dan prototipe yang dapat diuji.",
      deliverables: ["Discovery", "Audit UX", "User Flow", "Prototipe"],
    },
    {
      title: "Interface & Design System",
      description: "Merancang antarmuka yang koheren serta fondasi reusable agar produk tetap konsisten ketika berkembang.",
      deliverables: ["Desain UI", "Komponen", "Design Token", "Dokumentasi"],
    },
    {
      title: "Frontend Development",
      description: "Membangun antarmuka responsif dan aksesibel dengan kode siap produksi serta perhatian pada performa.",
      deliverables: ["React", "Next.js", "UI Responsif", "Arsitektur CSS"],
    },
    {
      title: "Motion & Interaction",
      description: "Menggunakan motion yang terarah dan detail interaksi untuk memandu perhatian serta memberi rasa matang pada produk digital.",
      deliverables: ["Motion Direction", "Prototipe", "GSAP", "Micro-interaction"],
    },
  ],
  projects: [
    {
      title: "Aurora Design System",
      year: "2025",
      description:
        "Pustaka komponen modular dan bahasa desain yang dipakai lintas produk web dan mobile.",
      tags: ["React", "Design System"],
      href: "#",
    },
    {
      title: "Nomad Travel App",
      year: "2024",
      description:
        "Aplikasi perencana perjalanan minimalis yang mengubah ide-ide berserakan menjadi itinerari harian yang jelas.",
      tags: ["UI/UX", "Prototipe"],
      href: "#",
    },
    {
      title: "Ledger Dashboard",
      year: "2024",
      description:
        "Dasbor keuangan yang mengutamakan kejernihan, dengan visualisasi data yang bersih dan navigasi cepat.",
      tags: ["React", "Data Viz"],
      href: "#",
    },
    {
      title: "Personal Portfolio",
      year: "2023",
      description:
        "Situs ini sendiri \u2014 portofolio ringan dan ekspresif yang dibangun dengan React dan Next.js.",
      tags: ["React", "Motion"],
      href: "#",
    },
  ],
  experience: [
    {
      role: "Desainer Produk",
      company: "Studio Example",
      period: "2023 \u2014 Sekarang",
      description:
        "Memimpin desain untuk permukaan produk inti, dari riset hingga UI yang dirilis.",
    },
    {
      role: "Pengembang Frontend",
      company: "Acme Inc.",
      period: "2021 \u2014 2023",
      description:
        "Membangun dan merawat antarmuka web responsif dalam basis kode React.",
    },
    {
      role: "Desainer Lepas",
      company: "Wiraswasta",
      period: "2019 \u2014 2021",
      description:
        "Bermitra dengan startup untuk branding, situs web, dan desain produk.",
    },
  ],
};

const byLocale = { id, en };

// Returns the full content bundle for a locale, in the shape the site expects.
export function getData(locale) {
  const key = byLocale[locale] ? locale : "id";
  const d = byLocale[key];
  return {
    profile: {
      name: shared.name,
      initials: shared.initials,
      location: shared.location,
      email: shared.email,
      socials: shared.socials,
      role: d.role,
      roles: d.roles,
      headline: d.headline,
      availability: d.availability,
    },
    keywords: d.keywords,
    about: d.about,
    skills: d.skills,
    services: d.services,
    projects: d.projects,
    experience: d.experience,
  };
}
