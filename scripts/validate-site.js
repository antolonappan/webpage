const fs = require("fs");

const pages = ["index.html", "publications/index.html", "research/index.html", "contact/index.html"];
const requiredTags = [
    ["title", /<title>[^<]{10,}<\/title>/],
    ["description", /<meta name="description" content="[^"]{50,}">/],
    ["robots", /<meta name="robots" content="index, follow, max-image-preview:large">/],
    ["canonical", /<link rel="canonical" href="https:\/\/antolonappan\.me\//],
    ["manifest", /<link rel="manifest" href="\/site\.webmanifest">/],
    ["og:title", /<meta property="og:title" content="[^"]+">/],
    ["og:description", /<meta property="og:description" content="[^"]+">/],
    ["og:url", /<meta property="og:url" content="https:\/\/antolonappan\.me\//],
    ["og:image", /<meta property="og:image" content="https:\/\/antolonappan\.me\/assets\/images\/cmb\.jpg">/],
    ["twitter:card", /<meta name="twitter:card" content="summary_large_image">/],
    ["json-ld", /<script type="application\/ld\+json">/]
];

const existing = new Set();
const errors = [];

const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.name === ".git" || entry.name === "node_modules") {
            continue;
        }

        const file = `${dir}/${entry.name}`;
        if (entry.isDirectory()) {
            walk(file);
        } else {
            existing.add(file.replace(/^\.\//, ""));
        }
    }
};

walk(".");

const validatePage = (file) => {
    const html = fs.readFileSync(file, "utf8");
    const missing = requiredTags.filter(([, pattern]) => !pattern.test(html)).map(([name]) => name);
    const h1Count = [...html.matchAll(/<h1\b/g)].length;
    const descriptions = [...html.matchAll(/<meta name="description" content="([^"]+)">/g)];
    const canonicals = [...html.matchAll(/<link rel="canonical" href="([^"]+)">/g)];
    const jsonLdBlocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((match) => match[1]);

    if (h1Count !== 1) {
        missing.push(`h1 count ${h1Count}`);
    }

    if (descriptions.length !== 1) {
        missing.push(`description count ${descriptions.length}`);
    }

    if (canonicals.length !== 1) {
        missing.push(`canonical count ${canonicals.length}`);
    }

    for (const json of jsonLdBlocks) {
        try {
            const parsed = JSON.parse(json);
            const graph = parsed["@graph"] || [];

            for (const type of ["WebSite", "Person", "ProfilePage", "ItemList"]) {
                if (!graph.some((item) => item["@type"] === type)) {
                    missing.push(`schema:${type}`);
                }
            }
        } catch (error) {
            missing.push(`json-ld parse error: ${error.message}`);
        }
    }

    const refs = [...html.matchAll(/\b(?:href|src|srcset)="([^"]+)"/g)].map((match) => match[1].split(/\s+/)[0]);
    for (const ref of refs) {
        if (/^(https?:|mailto:|#)/.test(ref) || ref === "/") {
            continue;
        }

        const clean = decodeURIComponent(ref.split("#")[0].split("?")[0]).replace(/^\//, "");
        if (clean.endsWith("/")) {
            if (!existing.has(`${clean}index.html`)) {
                missing.push(`missing local ref ${ref}`);
            }
        } else if (!existing.has(clean)) {
            missing.push(`missing local ref ${ref}`);
        }
    }

    if (missing.length > 0) {
        errors.push(`${file}: ${missing.join(", ")}`);
    }
};

for (const page of pages) {
    validatePage(page);
}

for (const file of ["site.webmanifest", "favicon/site.webmanifest"]) {
    const manifest = JSON.parse(fs.readFileSync(file, "utf8"));
    if (!manifest.name || !manifest.short_name || !manifest.theme_color || !manifest.icons || manifest.icons.length === 0) {
        errors.push(`${file}: incomplete manifest`);
    }
}

const sitemap = fs.readFileSync("sitemap.xml", "utf8");
const robots = fs.readFileSync("robots.txt", "utf8");
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
const expectedUrls = [
    "https://antolonappan.me/",
    "https://antolonappan.me/publications/",
    "https://antolonappan.me/research/",
    "https://antolonappan.me/contact/"
];

for (const expected of expectedUrls) {
    if (!urls.includes(expected)) {
        errors.push(`sitemap missing ${expected}`);
    }
}

if (!/User-agent:\s*\*/.test(robots) || !/Allow:\s*\//.test(robots) || !/Sitemap:\s*https:\/\/antolonappan\.me\/sitemap\.xml/.test(robots)) {
    errors.push("robots.txt missing expected allow/sitemap directives");
}

if (errors.length > 0) {
    console.error(errors.join("\n"));
    process.exit(1);
}

console.log("Site validation passed.");
