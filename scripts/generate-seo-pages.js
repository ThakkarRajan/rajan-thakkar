const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const today = "2026-11-17";
const origin = "https://rajan.codes";

function postSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function inlineFormat(text) {
  return escapeHtml(text).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}

function markdownToHtml(markdown) {
  return markdown
    .trim()
    .split(/\n\n+/)
    .map((block) => {
      const trimmed = block.trim();
      if (
        trimmed.startsWith("**") &&
        trimmed.endsWith("**") &&
        trimmed.split("**").length === 3
      ) {
        return `<h2>${inlineFormat(trimmed.replace(/\*\*/g, ""))}</h2>`;
      }
      if (trimmed.startsWith("- ")) {
        const items = trimmed
          .split("\n")
          .filter((line) => line.startsWith("- "))
          .map((line) => `<li>${inlineFormat(line.slice(2))}</li>`)
          .join("");
        return `<ul>${items}</ul>`;
      }
      return `<p>${inlineFormat(trimmed).replace(/\n/g, "<br />")}</p>`;
    })
    .join("\n");
}

function isoDate(value) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return today;
  return parsed.toISOString().slice(0, 10);
}

const blogSrc = fs.readFileSync(path.join(root, "src/components/Blog.js"), "utf8");
const start = blogSrc.indexOf("const blogPosts = ");
const end = blogSrc.indexOf("function postSlug");
if (start < 0 || end < 0) {
  throw new Error("Could not find blogPosts in Blog.js");
}
const expr = blogSrc
  .slice(start + "const blogPosts = ".length, end)
  .trim()
  .replace(/;\s*$/, "");
const blogPosts = eval(expr);

const projects = [
  ["I Love Resumes", "https://iloveresumes.ca", "AI resume tailoring, job matching, and PDF/Word export."],
  ["Zapphir", "https://zapphir.com", "AI-assisted medical care staffing platform, built end to end."],
  ["Harmony Salon", "https://harmonysalon.biz/", "Bridal makeup and salon site with booking paths."],
  ["Circuit", "https://play.google.com/store/apps/details?id=com.snapcycle.circuit", "SnapCycle app: photo an item, get local sorting guidance."],
  ["Selectext", "https://github.com/ThakkarRajan/Selectext", "Mac menu bar app that copies on-screen text with on-device OCR."],
  ["Caliber Construction Dashboard", "https://rajan.codes/#projects", "Construction project dashboard for tasks, progress, and analytics."],
  ["Liftmates Car-pool", "https://github.com/ThakkarRajan/liftmates-master", "Real-time carpooling app with Firebase."],
  ["Harsmo Ventures Website", "https://harsmo-ventures-1syw.vercel.app/", "Import-export company site."],
  ["Lavish Look Salon Website", "https://salon-website-eta.vercel.app/", "Salon site with maps and booking."],
  ["Weather App", "https://github.com/ThakkarRajan/Weather-App", "Local forecasts via the OpenWeather API."],
  ["NaturalWalk", "https://github.com/ThakkarRajan/NaturalWalk-iOS-Application", "iOS walking and mindfulness tracker."],
  ["News App", "https://github.com/ThakkarRajan/News-Application", "Android news reader with a swipeable layout."],
  ["My Alarm", "https://github.com/ThakkarRajan/MyAlarmByRajan", "Android alarm clock with snooze and dark mode."],
];

const pageShell = ({ title, description, canonical, body, jsonLd, ogType = "article" }) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <meta name="author" content="Rajan Thakkar" />
  <meta name="robots" content="index, follow, max-image-preview:large" />
  <link rel="canonical" href="${canonical}" />
  <meta property="og:type" content="${ogType}" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:image" content="${origin}/images/rajan-thakkar-og.jpg" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${origin}/images/rajan-thakkar-og.jpg" />
  <link rel="icon" href="/favicon.ico" />
  <script type="application/ld+json">${jsonLd}</script>
  <style>
    body { margin: 0; background: #0f0f1a; color: #f2f2f5; font-family: system-ui, -apple-system, sans-serif; line-height: 1.65; }
    main { max-width: 42rem; margin: 0 auto; padding: 2rem 1.25rem 4rem; }
    a { color: #8ecbff; }
    h1 { line-height: 1.25; font-size: 2rem; }
    .meta { color: #b7b7c4; }
    nav { margin-bottom: 1.5rem; }
  </style>
</head>
<body>
  <main>
    <nav><a href="${origin}/">Rajan Thakkar</a> · <a href="${origin}/blog/">Blog</a></nav>
    ${body}
  </main>
</body>
</html>
`;

const blogDir = path.join(root, "public/blog");
fs.rmSync(blogDir, { recursive: true, force: true });
fs.mkdirSync(blogDir, { recursive: true });

const entries = blogPosts.map((post) => {
  const slug = postSlug(post.title);
  const url = `${origin}/blog/${slug}/`;
  const published = isoDate(post.date);
  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: published,
    author: { "@id": `${origin}/#person` },
    publisher: { "@id": `${origin}/#person` },
    mainEntityOfPage: url,
    url,
    articleSection: post.category,
    keywords: post.tags.join(", "),
    inLanguage: "en-US",
  });
  const html = pageShell({
    title: `${post.title} | Rajan Thakkar`,
    description: post.excerpt,
    canonical: url,
    jsonLd,
    body: `<article>
      <p class="meta">${escapeHtml(post.category)} · <time datetime="${published}">${escapeHtml(post.date)}</time> · ${escapeHtml(post.readTime)}</p>
      <h1>${escapeHtml(post.title)}</h1>
      <p>By <a href="${origin}/">Rajan Thakkar</a>, full stack developer in Toronto.</p>
      ${markdownToHtml(post.content)}
      <p><a href="${origin}/#contact">Contact Rajan Thakkar</a></p>
    </article>`,
  });
  const dir = path.join(blogDir, slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), html);
  return { ...post, slug, url, published };
});

const indexJsonLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Blog",
  name: "Rajan Thakkar Developer Blog",
  url: `${origin}/blog/`,
  author: { "@id": `${origin}/#person` },
  blogPost: entries.map((post) => ({
    "@type": "BlogPosting",
    headline: post.title,
    url: post.url,
    datePublished: post.published,
  })),
});

const indexHtml = pageShell({
  ogType: "website",
  title: "Developer blog | Rajan Thakkar",
  description:
    "Articles by Rajan Thakkar, full stack developer in Toronto, on hiring, React, and building software.",
  canonical: `${origin}/blog/`,
  jsonLd: indexJsonLd,
  body: `<h1>Developer blog</h1>
    <p>Articles by Rajan Thakkar, full stack developer in Toronto.</p>
    <ul>
      ${entries
        .map(
          (post) =>
            `<li><a href="${post.url}">${escapeHtml(post.title)}</a> — ${escapeHtml(post.excerpt)}</li>`
        )
        .join("\n")}
    </ul>`,
});
fs.writeFileSync(path.join(blogDir, "index.html"), indexHtml);

const snapshot = `<div id="crawl-snapshot">
      <h1>Rajan Thakkar</h1>
      <p>Full stack developer in Toronto, Ontario, Canada. React, Node.js, and TypeScript. Also listed as Thakkar Rajan on some profiles. Official site: <a href="${origin}/">rajan.codes</a>.</p>
      <p>Building software that balances product thinking, technical depth, and real usability. Web and mobile applications designed to perform well, scale cleanly, and deliver value beyond the first release.</p>
      <h2>Experience</h2>
      <ul>
        <li>SnapCycle – Full Stack Developer (Jun 2025 – Present)</li>
        <li>Freelance – Full Stack Developer (Jan 2025 – Present)</li>
        <li>Vosyn – Frontend Developer Intern (Aug 2024 – Jan 2025)</li>
        <li>Inferenz – Machine Learning Intern (Sep 2021 – Jan 2022)</li>
      </ul>
      <h2>Projects</h2>
      <ul>
        ${projects
          .map(([title, href, blurb]) => `<li><a href="${href}">${escapeHtml(title)}</a> — ${escapeHtml(blurb)}</li>`)
          .join("\n        ")}
      </ul>
      <h2>Developer blog</h2>
      <ul>
        ${entries
          .map(
            (post) =>
              `<li><a href="${post.url}">${escapeHtml(post.title)}</a> — ${escapeHtml(post.excerpt)}</li>`
          )
          .join("\n        ")}
      </ul>
      <p><a href="${origin}/blog/">All articles</a> · <a href="${origin}/resume.pdf">Resume (PDF)</a> · <a href="${origin}/#contact">Contact</a></p>
      <p>Email <a href="mailto:rajanthakkar100@gmail.com">rajanthakkar100@gmail.com</a> · +1-437-755-3112</p>
    </div>`;

const indexPath = path.join(root, "public/index.html");
const indexHtmlSource = fs.readFileSync(indexPath, "utf8");
const snapshotPattern = /<!-- seo:snapshot:start -->[\s\S]*<!-- seo:snapshot:end -->/;
if (!snapshotPattern.test(indexHtmlSource)) throw new Error("snapshot markers missing");
const nextIndex = indexHtmlSource.replace(
  snapshotPattern,
  `<!-- seo:snapshot:start -->\n      ${snapshot}\n      <!-- seo:snapshot:end -->`
);
fs.writeFileSync(indexPath, nextIndex);

const urls = [
  { loc: `${origin}/`, priority: "1.0" },
  { loc: `${origin}/blog/`, priority: "0.8" },
  ...entries.map((post) => ({ loc: post.url, priority: "0.7" })),
  { loc: `${origin}/resume.pdf`, priority: "0.4" },
];

const urlset = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (item) => `  <url>
    <loc>${item.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${item.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>
`;
fs.writeFileSync(path.join(root, "public/sitemap-pages.xml"), urlset);

for (const file of ["sitemap.xml", "sitemap-image.xml"]) {
  const full = path.join(root, "public", file);
  const xml = fs
    .readFileSync(full, "utf8")
    .replace(/<lastmod>[\d-]+<\/lastmod>/g, `<lastmod>${today}</lastmod>`);
  fs.writeFileSync(full, xml);
}

console.log(`Wrote ${entries.length} articles + blog index`);
entries.forEach((post) => console.log(post.slug));
