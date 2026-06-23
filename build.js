const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const katex = require("katex");
const { createTutorialRenderer, labelId } = require("./scripts/tutorial-renderer");

const outDir = __dirname;
const rootDir = __dirname;
const config = require(path.join(rootDir, "data/research/config.json"));
const generated = require(path.join(rootDir, "data/research/generated.json"));
const about = require(path.join(rootDir, "data/about.json"));

const SITE_URL = "https://antolonappan.me";
const SITE_TITLE = "Anto Idicherian Lonappan | CMB Cosmology Research";
const SITE_DESCRIPTION = "Research profile of Anto Idicherian Lonappan, Postdoctoral Fellow at UC San Diego, working on CMB polarization, gravitational lensing, cosmic birefringence, and precision cosmology.";
const THEME_COLOR = "#275f9f";
const parseDateValue = (value) => {
    const time = value ? Date.parse(value) : Number.NaN;
    return Number.isNaN(time) ? 0 : time;
};
const GENERATED_UPDATED = new Date(generated.generatedAt || Date.now());
const updatedTimes = [
    parseDateValue(generated.generatedAt),
    parseDateValue(config.profile.statsUpdatedAt)
].filter(Boolean);
const UPDATED = new Date(updatedTimes.length ? Math.max(...updatedTimes) : Date.now());
const CAN_CONVERT_WEBP = (() => {
    try {
        execFileSync("which", ["cwebp"], { stdio: "ignore" });
        return true;
    } catch (error) {
        return false;
    }
})();

const contacts = [
    {
        label: "Email",
        value: "alonappan@ucsd.edu",
        href: "mailto:alonappan@ucsd.edu",
        kind: "email"
    },
    {
        label: "Google Scholar",
        value: "Scholar profile",
        href: config.profile.scholarUrl,
        kind: "scholar"
    },
    {
        label: "GitHub",
        value: "antolonappan",
        href: "https://github.com/antolonappan",
        kind: "github"
    },
    {
        label: "LinkedIn",
        value: "antoilonappan",
        href: "https://linkedin.com/in/antoilonappan",
        kind: "linkedin"
    },
    {
        label: "Instagram",
        value: "@antoilonapppan",
        href: "https://www.instagram.com/antoilonapppan/",
        kind: "instagram"
    },
    {
        label: "Bluesky",
        value: "@antolonappan.me",
        href: "https://bsky.app/profile/antolonappan.me",
        kind: "bluesky"
    }
];

const iconPaths = {
    email: "M4 6.5h16v11H4v-11Zm1.7 1.4 6.3 4.55 6.3-4.55H5.7Zm12.9 8.2V9.3l-6.1 4.4a.85.85 0 0 1-1 0L5.4 9.3v6.8h13.2Z",
    scholar: "M12 3 2.8 8.1 12 13.2l9.2-5.1L12 3Zm-5.8 7.4v4.5c0 2.8 2.6 5.1 5.8 5.1s5.8-2.3 5.8-5.1v-4.5L12 13.6l-5.8-3.2Z",
    github: "M12 2.5a9.5 9.5 0 0 0-3 18.52c.48.09.65-.21.65-.46v-1.62c-2.64.58-3.2-1.13-3.2-1.13-.44-1.1-1.06-1.4-1.06-1.4-.86-.59.07-.58.07-.58.95.07 1.45.98 1.45.98.85 1.45 2.23 1.03 2.77.79.09-.62.33-1.03.6-1.27-2.11-.24-4.33-1.05-4.33-4.7 0-1.04.37-1.89.98-2.55-.1-.24-.42-1.21.09-2.52 0 0 .8-.26 2.61.97A9 9 0 0 1 12 6.2c.81 0 1.62.11 2.38.32 1.81-1.23 2.61-.97 2.61-.97.51 1.31.19 2.28.09 2.52.61.66.98 1.51.98 2.55 0 3.66-2.22 4.46-4.34 4.7.34.29.64.87.64 1.76v2.61c0 .25.17.55.65.46A9.5 9.5 0 0 0 12 2.5Z",
    linkedin: "M5.1 8.6h3.1v10H5.1v-10Zm1.55-4.9a1.8 1.8 0 1 1 0 3.6 1.8 1.8 0 0 1 0-3.6Zm3.5 4.9h3v1.37h.04c.42-.8 1.44-1.64 2.96-1.64 3.16 0 3.75 2.08 3.75 4.78v5.49h-3.1v-4.87c0-1.16-.02-2.65-1.62-2.65-1.62 0-1.87 1.26-1.87 2.57v4.95h-3.16v-10Z",
    instagram: "M8.1 3.8h7.8A4.3 4.3 0 0 1 20.2 8.1v7.8a4.3 4.3 0 0 1-4.3 4.3H8.1a4.3 4.3 0 0 1-4.3-4.3V8.1a4.3 4.3 0 0 1 4.3-4.3Zm0 1.8a2.5 2.5 0 0 0-2.5 2.5v7.8a2.5 2.5 0 0 0 2.5 2.5h7.8a2.5 2.5 0 0 0 2.5-2.5V8.1a2.5 2.5 0 0 0-2.5-2.5H8.1Zm3.9 3.05a3.35 3.35 0 1 1 0 6.7 3.35 3.35 0 0 1 0-6.7Zm0 1.8a1.55 1.55 0 1 0 0 3.1 1.55 1.55 0 0 0 0-3.1Zm4.15-2.2a.8.8 0 1 1 0 1.6.8.8 0 0 1 0-1.6Z",
    bluesky: "M7.7 5.2C9.2 6.35 10.8 8.7 11.4 10c.6-1.3 2.2-3.65 3.7-4.8 1.08-.82 2.82-1.45 2.82.57 0 .4-.23 3.36-.37 3.84-.47 1.68-2.18 2.1-3.7 1.84 2.66.45 3.34 1.95 1.88 3.45-2.77 2.84-3.98-.71-4.29-1.62-.06-.17-.09-.25-.1-.18-.01-.07-.04.01-.1.18-.31.91-1.52 4.46-4.29 1.62-1.46-1.5-.78-3 1.88-3.45-1.52.26-3.23-.16-3.7-1.84-.14-.48-.37-3.44-.37-3.84 0-2.02 1.74-1.39 2.82-.57Z"
};

const iconSvg = (kind) => {
    const pathData = iconPaths[kind] || iconPaths.email;
    return `<svg class="social-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="${pathData}"></path></svg>`;
};

const generatedById = generated.papers.reduce((papers, paper) => {
    papers[paper.arxivId] = paper;
    return papers;
}, {});

const cleanOptionalValue = (value) => typeof value === "string" ? value.trim() : value || "";

const papers = config.papers.map((paper) => {
    const generatedPaper = generatedById[paper.arxivId] || {};
    const doi = cleanOptionalValue(paper.doi) || cleanOptionalValue(generatedPaper.doi);
    const doiUrl = cleanOptionalValue(paper.doiUrl) || cleanOptionalValue(generatedPaper.doiUrl) || (doi ? `https://doi.org/${doi}` : "");

    return {
        ...generatedPaper,
        ...paper,
        title: paper.title || generatedPaper.title || `arXiv:${paper.arxivId}`,
        description: paper.description || generatedPaper.description || "",
        authors: paper.authors || generatedPaper.authors || [],
        figures: paper.figures || generatedPaper.figures || [],
        code: paper.code || generatedPaper.code || [],
        doi,
        doiUrl,
        date: paper.date || generatedPaper.date || "",
        published: generatedPaper.published || "",
        arxivUrl: generatedPaper.arxivUrl || `https://arxiv.org/abs/${paper.arxivId}`,
        pdfUrl: generatedPaper.pdfUrl || `https://arxiv.org/pdf/${paper.arxivId}`,
        htmlUrl: generatedPaper.htmlUrl || `https://arxiv.org/html/${paper.arxivId}`
    };
});

const latestPaper = papers[0];

const ensureDir = (dir) => fs.mkdirSync(dir, { recursive: true });

const copyDir = (source, destination) => {
    if (!fs.existsSync(source)) {
        return;
    }

    fs.rmSync(destination, { recursive: true, force: true });
    fs.cpSync(source, destination, { recursive: true });
};

const escapeHtml = (value = "") => String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const escapeAttribute = (value = "") => escapeHtml(value).replace(/`/g, "&#96;");

const plainText = (value = "") => String(value)
    .replace(/\$+/g, "")
    .replace(/\\[a-zA-Z]+/g, " ")
    .replace(/[{}]/g, "")
    .replace(/\s+/g, " ")
    .trim();

const paperId = (arxivId = "") => `paper-${String(arxivId).replace(/[^a-zA-Z0-9_-]+/g, "-")}`;

const cleanPlainLatexText = (value = "") => value
    .replace(/\\%/g, "%")
    .replace(/\\,/g, " ")
    .replace(/~/g, " ");

const mathPattern = /(\$\$[\s\S]+?\$\$|\$[^$]+?\$|\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\))/g;

const trimDelimiter = (value) => {
    if (value.startsWith("$$") && value.endsWith("$$")) {
        return { math: value.slice(2, -2), displayMode: true };
    }

    if (value.startsWith("$") && value.endsWith("$")) {
        return { math: value.slice(1, -1), displayMode: false };
    }

    if (value.startsWith("\\[") && value.endsWith("\\]")) {
        return { math: value.slice(2, -2), displayMode: true };
    }

    if (value.startsWith("\\(") && value.endsWith("\\)")) {
        return { math: value.slice(2, -2), displayMode: false };
    }

    return { math: value, displayMode: false };
};

const renderLatexText = (value = "") => {
    if (!value) {
        return "";
    }

    return value.split(mathPattern).map((part) => {
        if (!part) {
            return "";
        }

        if (!part.match(mathPattern)) {
            return escapeHtml(cleanPlainLatexText(part));
        }

        const { math, displayMode } = trimDelimiter(part);

        return katex.renderToString(math, {
            displayMode,
            throwOnError: false,
            strict: false
        });
    }).join("");
};

const assetPath = (src = "") => {
    const normalized = src.replace(/^\/?assets\//, "assets/");
    return normalized.startsWith("/") ? normalized : `/${normalized}`;
};

const webpAssetPath = (src = "") => assetPath(src).replace(/\.(png|jpe?g)$/i, ".webp");

const pictureMarkup = ({ src, alt, className = "", loading = "lazy", decoding = "async", width = "", height = "", fetchpriority = "" }) => {
    const fallback = assetPath(src);
    const attributes = [
        className ? `class="${escapeAttribute(className)}"` : "",
        `src="${escapeAttribute(fallback)}"`,
        `alt="${escapeAttribute(alt)}"`,
        loading ? `loading="${escapeAttribute(loading)}"` : "",
        decoding ? `decoding="${escapeAttribute(decoding)}"` : "",
        width ? `width="${escapeAttribute(width)}"` : "",
        height ? `height="${escapeAttribute(height)}"` : "",
        fetchpriority ? `fetchpriority="${escapeAttribute(fetchpriority)}"` : ""
    ].filter(Boolean).join(" ");

    const webpFallback = webpAssetPath(src);
    const hasWebpVariant = fs.existsSync(path.join(outDir, webpFallback.replace(/^\//, "")));

    if ((!CAN_CONVERT_WEBP && !hasWebpVariant) || !fallback.match(/\.(png|jpe?g)$/i)) {
        return `<img ${attributes}>`;
    }

    return `<picture${className === "hero-picture" ? " class=\"hero-picture\"" : ""}>
                            <source srcset="${escapeAttribute(webpFallback)}" type="image/webp">
                            <img ${attributes}>
                        </picture>`;
};

let tutorialReferenceHrefByLabel = {};

function tutorialReferenceHref(label) {
    return tutorialReferenceHrefByLabel[label] || `#${labelId(label)}`;
}

const tutorialRenderer = createTutorialRenderer({
    katex,
    pictureMarkup,
    escapeHtml,
    escapeAttribute,
    resolveReference: tutorialReferenceHref
});

const formatUpdated = new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC"
}).format(GENERATED_UPDATED);

const publicationStatsMarkup = config.profile.scholarStats.map((stat) => `
                    <div class="publication-stat">
                        <strong>${escapeHtml(stat.value)}</strong>
                        <span>${escapeHtml(stat.label)}</span>
                    </div>`).join("");

const interestMarkup = config.interests.map((interest) => `
                    <li>${escapeHtml(interest)}</li>`).join("");

const linkMarkup = (href, label, className = "paper-link") => {
    if (!href) {
        return "";
    }

    return `<a class="${className}" href="${escapeAttribute(href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>`;
};

const codeMarkup = (paper) => {
    if (!paper.code || paper.code.length === 0) {
        return "";
    }

    return `
                            <div class="code-links">
                                ${paper.code.map((code) => `
                                <a href="${escapeAttribute(code.url)}" target="_blank" rel="noopener noreferrer">
                                    <span>GitHub</span>
                                    <strong>${escapeHtml(code.label)}</strong>
                                    ${code.description ? `<small>${escapeHtml(code.description)}</small>` : ""}
                                </a>`).join("")}
                            </div>`;
};

const figureMarkup = (paper) => {
    if (!paper.figures || paper.figures.length === 0) {
        return "";
    }

    return `
                        <div class="figure-carousel" data-carousel>
                            <div class="figure-stage">
                                ${paper.figures.map((figure, index) => `
                                <figure class="paper-figure${index === 0 ? " is-active" : ""}" data-slide>
                                    ${pictureMarkup({
                                        src: figure.src,
                                        alt: figure.alt || plainText(figure.caption) || paper.title
                                    })}
                                    <figcaption>${renderLatexText(figure.caption)}</figcaption>
                                </figure>`).join("")}
                            </div>
                            ${paper.figures.length > 1 ? `
                            <div class="figure-controls">
                                <button type="button" data-carousel-prev aria-label="Previous figure">
                                    <span aria-hidden="true">←</span>
                                </button>
                                <span data-carousel-count>1 / ${paper.figures.length}</span>
                                <button type="button" data-carousel-next aria-label="Next figure">
                                    <span aria-hidden="true">→</span>
                                </button>
                            </div>` : ""}
                        </div>`;
};

const paperSearchText = (paper) => [
    paper.title,
    paper.description,
    paper.venue,
    paper.date,
    paper.arxivId,
    ...(paper.authors || []),
    ...(paper.code || []).map((code) => `${code.label} ${code.description || ""}`)
].join(" ").toLowerCase();

const paperMarkup = papers.map((paper, index) => {
    const authors = paper.authors && paper.authors.length ? paper.authors.join(", ") : "";
    const thumbnail = paper.figures && paper.figures[0];
    const links = [
        linkMarkup(paper.arxivUrl, "arXiv", "theme-button"),
        linkMarkup(paper.pdfUrl, "PDF", "theme-button"),
        linkMarkup(paper.htmlUrl, "HTML", "theme-button"),
        linkMarkup(paper.doiUrl, "DOI", "theme-button")
    ].filter(Boolean).join("");
    const codeLinks = paper.code && paper.code.length > 0 ? paper.code.map((code) => (
        linkMarkup(code.url, code.label || "Code", "theme-button theme-button-code")
    )).join("") : "";

    return `
                    <article class="publication-card" id="${escapeAttribute(paperId(paper.arxivId))}" data-paper data-search="${escapeAttribute(paperSearchText(paper))}">
                        <a class="publication-thumb" href="${escapeAttribute(paper.arxivUrl)}" target="_blank" rel="noopener noreferrer" aria-label="Open ${escapeAttribute(plainText(paper.title))} on arXiv">
                            ${thumbnail ? pictureMarkup({
                                src: thumbnail.src,
                                alt: thumbnail.alt || plainText(thumbnail.caption) || paper.title
                            }) : `<span>${escapeHtml(paper.date || paper.arxivId)}</span>`}
                        </a>
                        <div class="publication-body">
                            <div class="publication-meta">
                                <span>${escapeHtml(paper.date || "Research")}</span>
                                ${paper.venue ? `<span>${escapeHtml(paper.venue)}</span>` : ""}
                                <span>arXiv:${escapeHtml(paper.arxivId)}</span>
                                ${index === 0 ? "<span>Latest</span>" : ""}
                            </div>
                            <h3><a href="${escapeAttribute(paper.arxivUrl)}" target="_blank" rel="noopener noreferrer">${renderLatexText(paper.title)}</a></h3>
                            ${authors ? `<p class="authors">${escapeHtml(authors)}</p>` : ""}
                            <div class="publication-actions">${links}${codeLinks}</div>
                            ${paper.description ? `
                            <details class="publication-details">
                                <summary>Abstract and figures</summary>
                                <p>${renderLatexText(paper.description)}</p>
                                ${codeMarkup(paper)}
                                ${figureMarkup(paper)}
                            </details>` : ""}
                        </div>
                    </article>`;
}).join("");

const latestFigure = latestPaper.figures && latestPaper.figures[0];
const bannerFigure = latestPaper.figures && (latestPaper.figures[2] || latestPaper.figures[0]);

const latestMarkup = `
                <section class="feature-panel" aria-labelledby="latest-title">
                    <div>
                        <p class="section-kicker">Latest Work</p>
                        <h2 id="latest-title">${renderLatexText(latestPaper.title)}</h2>
                        <p>${renderLatexText(latestPaper.description.split(". ").slice(0, 2).join(". "))}.</p>
                        <div class="feature-links">
                            ${linkMarkup(latestPaper.arxivUrl, "Read on arXiv", "theme-button")}
                            ${linkMarkup(latestPaper.pdfUrl, "PDF", "theme-button")}
                            ${latestPaper.code && latestPaper.code[0] ? linkMarkup(latestPaper.code[0].url, "Associated Code", "theme-button theme-button-code") : ""}
                        </div>
                    </div>
                    ${latestFigure ? `
                    <figure>
                        ${pictureMarkup({
                            src: latestFigure.src,
                            alt: latestFigure.alt || latestPaper.title
                        })}
                        <figcaption>${renderLatexText(latestFigure.caption)}</figcaption>
                    </figure>` : ""}
                </section>`;

const sidebarLinksMarkup = contacts.map((contact) => `
                    <a href="${escapeAttribute(contact.href)}" ${contact.kind === "email" ? "" : "target=\"_blank\" rel=\"noopener noreferrer\""}>
                        ${iconSvg(contact.kind)}
                        <span>
                            <em>${escapeHtml(contact.label)}</em>
                            <strong>${escapeHtml(contact.value)}</strong>
                        </span>
                    </a>`).join("");

const sameAs = [
    config.profile.scholarUrl,
    "https://github.com/antolonappan",
    "https://linkedin.com/in/antoilonappan",
    "https://www.instagram.com/antoilonapppan/",
    "https://bsky.app/profile/antolonappan.me"
];

const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
        {
            "@type": "WebSite",
            "@id": `${SITE_URL}/#website`,
            "url": `${SITE_URL}/`,
            "name": "Anto Idicherian Lonappan",
            "description": SITE_DESCRIPTION,
            "inLanguage": "en"
        },
        {
            "@type": "Person",
            "@id": `${SITE_URL}/#person`,
            "name": "Anto Idicherian Lonappan",
            "url": `${SITE_URL}/`,
            "image": `${SITE_URL}/assets/images/anto.jpg`,
            "jobTitle": "Postdoctoral Fellow",
            "affiliation": {
                "@type": "CollegeOrUniversity",
                "name": "University of California, San Diego",
                "url": "https://ucsd.edu/"
            },
            "alumniOf": {
                "@type": "CollegeOrUniversity",
                "name": "SISSA"
            },
            "email": "mailto:alonappan@ucsd.edu",
            "sameAs": sameAs,
            "knowsAbout": config.interests
        },
        {
            "@type": "ProfilePage",
            "@id": `${SITE_URL}/#profile`,
            "url": `${SITE_URL}/`,
            "name": SITE_TITLE,
            "description": SITE_DESCRIPTION,
            "dateModified": UPDATED.toISOString(),
            "mainEntity": {
                "@id": `${SITE_URL}/#person`
            }
        },
        {
            "@type": "ItemList",
            "@id": `${SITE_URL}/#publications`,
            "name": "Selected Publications",
            "itemListElement": papers.map((paper, index) => {
                const article = {
                    "@type": "ScholarlyArticle",
                    "@id": `${SITE_URL}/#${paperId(paper.arxivId)}`,
                    "headline": plainText(paper.title),
                    "abstract": plainText(paper.description),
                    "url": paper.arxivUrl,
                    "sameAs": [paper.arxivUrl, paper.pdfUrl, paper.htmlUrl].filter(Boolean),
                    "identifier": [`arXiv:${paper.arxivId}`, paper.doi ? `doi:${paper.doi}` : ""].filter(Boolean),
                    "author": paper.authors.map((name) => ({
                        "@type": "Person",
                        "name": name
                    })),
                    "datePublished": paper.published || undefined,
                    "image": paper.figures.map((figure) => `${SITE_URL}${assetPath(figure.src)}`)
                };

                if (paper.doi) {
                    article.doi = paper.doi;
                }

                return {
                    "@type": "ListItem",
                    "position": index + 1,
                    "item": article
                };
            })
        }
    ]
};

const pageUrl = (pathName) => `${SITE_URL}${pathName}`;

const navItems = [
    { key: "home", label: "Home", href: "/" },
    { key: "publications", label: "Publications", href: "/publications/" },
    { key: "research", label: "Research", href: "/research/" },
    { key: "tutorial", label: "Tutorial", href: "/tutorial/" },
    { key: "cv", label: "CV", href: "/assets/files/Anto.pdf" },
    { key: "contact", label: "Contact", href: "/contact/" }
];

const renderNav = (activeKey) => navItems.map((item) => `
            <a href="${escapeAttribute(item.href)}"${item.key === activeKey ? " class=\"is-active\"" : ""}>${escapeHtml(item.label)}</a>`).join("");

const renderSidebar = () => `
        <aside class="profile-sidebar" aria-label="Profile summary">
            <div class="avatar-wrap">
                ${pictureMarkup({
                    src: "assets/images/anto.jpg",
                    alt: "Portrait of Anto Idicherian Lonappan",
                    className: "avatar",
                    loading: "",
                    decoding: "async",
                    width: "1060",
                    height: "1200",
                    fetchpriority: "high"
                })}
            </div>
            <h1 id="page-title">Anto Idicherian Lonappan</h1>
            <p class="role">Postdoctoral Fellow</p>
            <p class="affiliation">University of California, San Diego</p>
            <p class="tagline">CMB polarization · gravitational lensing · cosmic birefringence · precision cosmology</p>
            <div class="sidebar-links">
                ${sidebarLinksMarkup}
            </div>
        </aside>`;

const renderBanner = () => `
    <div class="banner" aria-hidden="true">
        ${pictureMarkup({
            src: "assets/images/cmb.jpg",
            alt: "",
            className: "banner-image",
            loading: "",
            decoding: "async",
            fetchpriority: "high"
        })}
    </div>`;

const renderPage = ({ title, description, pathName, activeKey, content }) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeAttribute(description)}">
    <meta name="author" content="Anto Idicherian Lonappan">
    <meta name="robots" content="index, follow, max-image-preview:large">
    <meta name="theme-color" content="${THEME_COLOR}">
    <link rel="canonical" href="${pageUrl(pathName)}">
    <link rel="preload" as="image" href="/assets/images/cmb.jpg">
    <link rel="preload" as="image" href="/assets/images/anto.jpg">
    <link rel="stylesheet" href="/assets/vendor/katex/katex.min.css">
    <link rel="stylesheet" href="/assets/css/styles.css">
    <link rel="icon" href="/favicon/favicon.ico">
    <link rel="apple-touch-icon" href="/favicon/apple-touch-icon.png">
    <link rel="manifest" href="/site.webmanifest">
    <meta property="og:type" content="profile">
    <meta property="og:title" content="${escapeAttribute(title)}">
    <meta property="og:description" content="${escapeAttribute(description)}">
    <meta property="og:url" content="${pageUrl(pathName)}">
    <meta property="og:image" content="${SITE_URL}/assets/images/cmb.jpg">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeAttribute(title)}">
    <meta name="twitter:description" content="${escapeAttribute(description)}">
    <meta name="twitter:image" content="${SITE_URL}/assets/images/cmb.jpg">
    <script type="application/ld+json">${JSON.stringify(structuredData).replace(/</g, "\\u003c")}</script>
</head>
<body>
    <a class="skip-link" href="#main">Skip to content</a>

    <header class="site-header" id="top">
        <a class="site-name" href="/">Anto Idicherian Lonappan</a>
        <nav aria-label="Primary navigation">
${renderNav(activeKey)}
        </nav>
    </header>

${renderBanner()}

    <main id="main" class="page-shell">
${renderSidebar()}
        <div class="content-column">
${content}
        </div>
    </main>

    <footer class="site-footer">
        <p>© ${new Date().getUTCFullYear()} Anto Idicherian Lonappan</p>
        <a href="#top">Back to top</a>
    </footer>

    <script src="/assets/js/app.js" defer></script>
</body>
</html>
`;

const homeContent = `
            <section class="content-section intro-section" aria-labelledby="about-title">
                <p class="section-kicker">About</p>
                <h2 id="about-title">Cosmology from weak signals in the microwave sky.</h2>
                <p class="lead">I work on the faint signals hidden in CMB polarization maps, building analysis methods that help turn precision sky measurements into tests of fundamental physics.</p>
                <div class="profile-copy">
                    <p>${escapeHtml(about.section1)}</p>
                    <p>${escapeHtml(about.section2)}</p>
                </div>
            </section>
            <section class="content-section home-latest-section" aria-labelledby="home-latest-title">
                <p class="section-kicker">Recent Paper</p>
                <h2 id="home-latest-title">Latest publication</h2>
                ${latestMarkup}
            </section>`;

const publicationsContent = `
            <section class="content-section publication-section" aria-labelledby="publications-title">
                <div class="publication-header">
                    <div>
                        <p class="section-kicker">Publications</p>
                        <h2 id="publications-title">Selected papers</h2>
                        <p>arXiv-linked publications with full abstracts, paper figures, DOI links when available, and associated code repositories.</p>
                        <div class="publication-stats" role="group" aria-label="Google Scholar metrics">
                            ${publicationStatsMarkup}
                        </div>
                        <p class="stats-note">Google Scholar metrics updated ${escapeHtml(config.profile.statsUpdated)}.</p>
                    </div>
                    <label class="paper-search">
                        <span>Search publications</span>
                        <input type="search" name="q" placeholder="Title, topic, arXiv, author" autocomplete="off" data-paper-search>
                    </label>
                </div>
                <div class="publication-list">
                    ${paperMarkup}
                </div>
            </section>`;

const researchContent = `
            <section class="content-section research-section" aria-labelledby="research-title">
                <p class="section-kicker">Research</p>
                <h2 id="research-title">Research interests</h2>
                <p class="lead">The work centers on extracting weak cosmological signatures from CMB surveys, with attention to lensing, B-mode polarization, delensing, component separation, likelihoods, and parity-violating physics.</p>
                <ul class="interest-list">
                    ${interestMarkup}
                </ul>
            </section>
            <section class="content-section profile-section" aria-labelledby="profile-title">
                <p class="section-kicker">Profile</p>
                <h2 id="profile-title">Research path</h2>
                <div class="profile-copy">
                    <p>${escapeHtml(about.section3)}</p>
                    <p>${escapeHtml(about.section4)}</p>
                </div>
                <p class="updated-note">Research metadata regenerated ${escapeHtml(formatUpdated)}. Google Scholar metrics updated ${escapeHtml(config.profile.statsUpdated)}.</p>
            </section>`;

const contactCardsMarkup = contacts.map((contact) => `
                    <a href="${escapeAttribute(contact.href)}" ${contact.kind === "email" ? "" : "target=\"_blank\" rel=\"noopener noreferrer\""}>
                        ${iconSvg(contact.kind)}
                        <span>
                            <em>${escapeHtml(contact.label)}</em>
                            <strong>${escapeHtml(contact.value)}</strong>
                        </span>
                    </a>`).join("");

const contactContent = `
            <section class="content-section contact-section" id="contact" aria-labelledby="contact-title">
                <p class="section-kicker">Contact</p>
                <h2 id="contact-title">Research inquiries and collaborations</h2>
                <p class="lead">Seminar invitations, collaboration discussions, and research correspondence are welcome.</p>
                <div class="contact-grid">
                    ${contactCardsMarkup}
                </div>
            </section>`;

const cmbTutorialSourceDir = path.join(rootDir, "data/tutorials/cmb");
const readCmbChapter = (file) => fs.readFileSync(path.join(cmbTutorialSourceDir, file), "utf8");
const CMB_BASE_URL = "/tutorial/cmb/";
const CMB_NOTEBOOK_URL = "/assets/tutorials/cmb/files/cmb_tutorial.ipynb";
const CMB_PDF_URL = "/assets/tutorials/cmb/files/cmb_tutorial.pdf";
const cmbTutorialChapters = [
    { file: "00_home.tex", pathSegment: "home", label: "Home" },
    { file: "00_prerequisites.tex", pathSegment: "prerequisites", label: "Prerequisites" },
    { file: "01_background.tex", pathSegment: "background", label: "1. Background" },
    { file: "02_recombination.tex", pathSegment: "recombination", label: "2. Recombination" },
    { file: "03_perturbations.tex", pathSegment: "perturbations", label: "3. Perturbations" },
    { file: "04_line_of_sight.tex", pathSegment: "line-of-sight", label: "4. Line of sight" },
    { file: "05_power_spectrum.tex", pathSegment: "power-spectra", label: "5. Power spectra" },
    { file: "06_lensing.tex", pathSegment: "lensing", label: "6. Lensing" },
    { file: "07_tensors.tex", pathSegment: "tensors", label: "7. Tensors" }
].map((chapter, index) => {
    const source = readCmbChapter(chapter.file);
    const sectionTitle = tutorialRenderer.firstSectionTitle(source) || chapter.label;

    return {
        ...chapter,
        index,
        source,
        sectionTitle,
        slug: `cmb-${chapter.pathSegment}`,
        pathName: `${CMB_BASE_URL}${chapter.pathSegment}/`,
        output: `tutorial/cmb/${chapter.pathSegment}/index.html`
    };
});

tutorialReferenceHrefByLabel = cmbTutorialChapters.reduce((references, chapter) => {
    chapter.source.replace(/\\label\{([^}]+)\}/g, (_, label) => {
        references[label] = `${chapter.pathName}#${labelId(label)}`;
        return "";
    });

    return references;
}, {});

const cmbNotebookDownloadPanel = `
                        <div class="tutorial-download-panel" aria-labelledby="cmb-download-title">
                            <div>
                                <p class="section-kicker">Companion notebook</p>
                                <h3 id="cmb-download-title">Download the verified notebook</h3>
                                <p>The Jupyter notebook contains the working code cells in order, including the final CAMB validation cells.</p>
                            </div>
                            <div class="tutorial-download-actions">
                                <a class="theme-button theme-button-code" href="${CMB_NOTEBOOK_URL}" download>Download notebook</a>
                                <a class="theme-button" href="${CMB_PDF_URL}" download>Download PDF</a>
                            </div>
                        </div>`;

const cmbChapterNavMarkup = cmbTutorialChapters.map((chapter) => `
                        <a href="${escapeAttribute(chapter.pathName)}">
                            <span>${escapeHtml(chapter.label)}</span>
                            <small>${escapeHtml(plainText(chapter.sectionTitle))}</small>
                        </a>`).join("");

const cmbChapterPager = (chapter) => {
    const previous = cmbTutorialChapters[chapter.index - 1];
    const next = cmbTutorialChapters[chapter.index + 1];

    return `
                    <nav class="tutorial-pager" aria-label="CMB tutorial chapter navigation">
                        ${previous ? `
                        <a href="${escapeAttribute(previous.pathName)}">
                            <span>Previous</span>
                            <strong>${escapeHtml(previous.label)}</strong>
                        </a>` : `
                        <a href="${CMB_BASE_URL}">
                            <span>Contents</span>
                            <strong>CMB tutorial</strong>
                        </a>`}
                        ${next ? `
                        <a href="${escapeAttribute(next.pathName)}">
                            <span>Next</span>
                            <strong>${escapeHtml(next.label)}</strong>
                        </a>` : `
                        <a href="${CMB_BASE_URL}">
                            <span>Back to</span>
                            <strong>Contents</strong>
                        </a>`}
                    </nav>`;
};

const cmbChapterContent = (chapter) => {
    const rendered = tutorialRenderer.renderBlocks(chapter.source).html;
    const isFinalChapter = chapter.index === cmbTutorialChapters.length - 1;

    return `
            <section class="content-section tutorial-reader-section tutorial-chapter-page" aria-label="${escapeAttribute(chapter.label)}">
                <div class="tutorial-chapter-heading">
                    <span>Tutorial / CMB / ${escapeHtml(chapter.label)}</span>
                    <a href="${CMB_BASE_URL}">Contents</a>
                </div>
                <article class="tutorial-chapter" id="${escapeAttribute(chapter.slug)}">
${rendered}
${isFinalChapter ? cmbNotebookDownloadPanel : ""}
                </article>
                ${cmbChapterPager(chapter)}
            </section>`;
};

const cmbChapterPages = cmbTutorialChapters.map((chapter) => ({
    output: chapter.output,
    pathName: chapter.pathName,
    activeKey: "tutorial",
    title: `${plainText(chapter.sectionTitle)} | CMB Tutorial | Anto Idicherian Lonappan`,
    description: `${plainText(chapter.sectionTitle)} in the CMB tutorial by Anto Idicherian Lonappan, with copyable Python code and rendered equations.`,
    content: cmbChapterContent(chapter)
}));

const tutorialIndexContent = `
            <section class="content-section tutorial-index-section" aria-labelledby="tutorial-title">
                <p class="section-kicker">Tutorial</p>
                <h2 id="tutorial-title">Tutorials</h2>
                <p class="lead">Computational notes and notebooks for CMB cosmology. More tutorials can be added here as the collection grows.</p>
                <div class="tutorial-card-list">
                    <article class="tutorial-card">
                        <a class="tutorial-card-media" href="/tutorial/cmb/" aria-label="Open the CMB tutorial">
                            ${pictureMarkup({
                                src: "assets/tutorials/cmb/figures/planck_sky.jpg",
                                alt: "Planck cosmic microwave background temperature map"
                            })}
                        </a>
                        <div class="tutorial-card-body">
                            <p class="section-kicker">CMB</p>
                            <h3><a href="/tutorial/cmb/">A CMB Tutorial</a></h3>
                            <p>From first principles to the temperature, polarisation, lensing, and tensor spectra, with a companion notebook and copyable code blocks.</p>
                            <div class="tutorial-meta-grid" aria-label="CMB tutorial contents">
                                <span><strong>${cmbTutorialChapters.length}</strong> chapters</span>
                                <span><strong>57</strong> copyable blocks</span>
                                <span><strong>1</strong> notebook</span>
                            </div>
                            <div class="feature-links">
                                <a class="theme-button" href="/tutorial/cmb/">Open tutorial</a>
                                <a class="theme-button theme-button-code" href="${CMB_NOTEBOOK_URL}" download>Notebook</a>
                            </div>
                        </div>
                    </article>
                </div>
            </section>`;

const cmbTutorialContent = `
            <section class="content-section tutorial-hero-section" id="cmb-tutorial-top" aria-labelledby="cmb-tutorial-title">
                <p class="section-kicker">Tutorial / CMB</p>
                <h2 id="cmb-tutorial-title">A CMB Tutorial: From First Principles to the Power Spectrum</h2>
                <p class="lead">A guided build of a compact CMB Boltzmann pipeline, moving from the expanding background through recombination, perturbations, line-of-sight projection, lensing, and primordial tensor modes.</p>
                <figure class="tutorial-figure tutorial-figure-planck">
                    ${pictureMarkup({
                        src: "assets/tutorials/cmb/figures/planck_sky.jpg",
                        alt: "Planck cosmic microwave background temperature map",
                        loading: "",
                        decoding: "async",
                        fetchpriority: "high"
                    })}
                    <figcaption>Planck CMB temperature map. Credit: <a href="https://planck.ipac.caltech.edu/image/planck13-002a" target="_blank" rel="noopener noreferrer">ESA and the Planck Collaboration / U.S. Planck Data Center</a>.</figcaption>
                </figure>
                <div class="feature-links">
                    <a class="theme-button" href="${escapeAttribute(cmbTutorialChapters[0].pathName)}">Start reading</a>
                    <a class="theme-button theme-button-code" href="${CMB_NOTEBOOK_URL}" download>Download notebook</a>
                </div>
            </section>
            <section class="content-section tutorial-toc-section" aria-labelledby="cmb-contents-title">
                <p class="section-kicker">Contents</p>
                <h2 id="cmb-contents-title">Chapters</h2>
                <nav class="tutorial-chapter-nav" aria-label="CMB tutorial chapters">
                    ${cmbChapterNavMarkup}
                </nav>
            </section>
            <section class="content-section tutorial-reader-section" aria-labelledby="cmb-reader-title">
                <p class="section-kicker">CMB Tutorial</p>
                <h2 id="cmb-reader-title">Read chapter by chapter</h2>
                <p class="lead">Each chapter opens as its own page with copyable code blocks and previous/next navigation.</p>
                <div class="feature-links">
                    <a class="theme-button" href="${escapeAttribute(cmbTutorialChapters[0].pathName)}">Begin with Home</a>
                    <a class="theme-button theme-button-code" href="${CMB_NOTEBOOK_URL}" download>Notebook</a>
                </div>
            </section>`;

const outputPages = [
    {
        output: "index.html",
        pathName: "/",
        activeKey: "home",
        title: SITE_TITLE,
        description: SITE_DESCRIPTION,
        content: homeContent
    },
    {
        output: "publications/index.html",
        pathName: "/publications/",
        activeKey: "publications",
        title: "Publications | Anto Idicherian Lonappan",
        description: "Selected publications by Anto Idicherian Lonappan, with arXiv links, abstracts, figures, DOI records, and associated code repositories.",
        content: publicationsContent
    },
    {
        output: "research/index.html",
        pathName: "/research/",
        activeKey: "research",
        title: "Research | Anto Idicherian Lonappan",
        description: "Research interests and profile for Anto Idicherian Lonappan: CMB polarization, gravitational lensing, cosmic birefringence, delensing, and observational cosmology.",
        content: researchContent
    },
    {
        output: "tutorial/index.html",
        pathName: "/tutorial/",
        activeKey: "tutorial",
        title: "Tutorial | Anto Idicherian Lonappan",
        description: "Computational CMB cosmology tutorials and companion notebooks by Anto Idicherian Lonappan.",
        content: tutorialIndexContent
    },
    {
        output: "tutorial/cmb/index.html",
        pathName: "/tutorial/cmb/",
        activeKey: "tutorial",
        title: "CMB Tutorial | Anto Idicherian Lonappan",
        description: "A CMB tutorial from first principles to power spectra, lensing, tensor modes, and CAMB validation with copyable Python code blocks.",
        content: cmbTutorialContent
    },
    ...cmbChapterPages,
    {
        output: "contact/index.html",
        pathName: "/contact/",
        activeKey: "contact",
        title: "Contact | Anto Idicherian Lonappan",
        description: "Contact information for Anto Idicherian Lonappan, including academic email, Google Scholar, GitHub, LinkedIn, Instagram, and Bluesky.",
        content: contactContent
    }
];

const multiPageSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${outputPages.map((page) => `  <url>
    <loc>${pageUrl(page.pathName)}</loc>
    <lastmod>${UPDATED.toISOString()}</lastmod>
    <priority>${page.pathName === "/" ? "1.00" : "0.80"}</priority>
  </url>`).join("\n")}
</urlset>
`;

const css = `:root {
  --ink: #1f2530;
  --text: #3c4656;
  --muted: #667282;
  --line: #dbe4ef;
  --paper: #ffffff;
  --wash: #f5f7fb;
  --tint: #edf4fb;
  --green: #275f9f;
  --green-dark: #17365f;
  --blue: #6b88b0;
  --gold: #8a6b22;
  --coral: #a95656;
}

* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  color: var(--ink);
  background: var(--wash);
  font-family: "Ubuntu Mono", "Roboto Mono", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "Liberation Mono", monospace;
  line-height: 1.65;
}

img,
picture {
  display: block;
  max-width: 100%;
}

a {
  color: inherit;
}

button,
input {
  font: inherit;
}

h1,
h2,
h3,
p {
  margin-top: 0;
}

.skip-link {
  position: fixed;
  top: 0.75rem;
  left: 0.75rem;
  z-index: 40;
  transform: translateY(-150%);
  background: var(--green-dark);
  color: var(--paper);
  padding: 0.55rem 0.75rem;
  border-radius: 4px;
}

.skip-link:focus {
  transform: translateY(0);
}

.site-header {
  position: sticky;
  top: 0;
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem max(1rem, calc((100vw - 1180px) / 2));
  background: rgba(255, 255, 255, 0.94);
  border-bottom: 1px solid var(--line);
  backdrop-filter: blur(14px);
}

.site-name {
  color: var(--ink);
  font-size: 1.02rem;
  font-weight: 800;
  text-decoration: none;
  white-space: nowrap;
}

.site-header nav {
  display: none;
  align-items: center;
  gap: 0.35rem;
}

.site-header nav a {
  padding: 0.45rem 0.55rem;
  color: var(--muted);
  font-size: 0.93rem;
  font-weight: 700;
  text-decoration: none;
}

.site-header nav a:hover,
.site-header nav a:focus,
.site-header nav a.is-active {
  color: var(--green);
}

.banner {
  position: relative;
  height: 12rem;
  overflow: hidden;
  background: linear-gradient(135deg, var(--green-dark), var(--blue));
}

.banner::after {
  position: absolute;
  inset: 0;
  content: "";
  background:
    linear-gradient(90deg, rgba(23, 54, 95, 0.84), rgba(23, 54, 95, 0.24)),
    linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(23, 54, 95, 0.68));
}

.banner-image {
  width: 100%;
  height: 12rem;
  object-fit: cover;
  object-position: center;
  filter: saturate(0.86) contrast(1.02);
}

.page-shell {
  display: grid;
  gap: 2rem;
  width: min(1180px, calc(100% - 2rem));
  margin: -2.25rem auto 0;
  position: relative;
  z-index: 2;
}

.profile-sidebar,
.content-column {
  min-width: 0;
}

.profile-sidebar {
  align-self: start;
  padding: 1.1rem;
  background: var(--paper);
  border: 1px solid var(--line);
}

.avatar-wrap {
  width: min(11.5rem, 54vw);
  aspect-ratio: 1;
  margin: 0 auto 1rem;
  overflow: hidden;
  border: 6px solid var(--paper);
  box-shadow: 0 0 0 1px var(--line);
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 52% 24%;
}

.profile-sidebar h1 {
  margin-bottom: 0.3rem;
  text-align: center;
  font-size: 1.55rem;
  line-height: 1.2;
}

.role,
.affiliation,
.tagline {
  text-align: center;
}

.role {
  margin-bottom: 0.25rem;
  color: var(--green);
  font-weight: 800;
}

.affiliation {
  margin-bottom: 0.85rem;
  color: var(--muted);
}

.tagline {
  margin: 0 0 1rem;
  color: var(--text);
  font-size: 0.92rem;
}

.theme-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.25rem;
  border: 1px solid var(--green);
  border-radius: 4px;
  color: var(--green);
  font-size: 0.85rem;
  font-weight: 800;
  text-decoration: none;
}

.theme-button:hover,
.theme-button:focus {
  background: var(--green);
  color: var(--paper);
}

.sidebar-links {
  display: grid;
  gap: 0.65rem;
  margin-top: 1.1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--line);
}

.sidebar-links a {
  display: grid;
  grid-template-columns: 1.35rem minmax(0, 1fr);
  align-items: center;
  gap: 0.65rem;
  color: var(--ink);
  text-decoration: none;
}

.social-icon {
  width: 1.2rem;
  height: 1.2rem;
  color: var(--green);
  fill: currentColor;
}

.sidebar-links a:hover strong,
.sidebar-links a:focus strong {
  color: var(--green);
}

.sidebar-links span,
.contact-grid span {
  display: grid;
  min-width: 0;
}

.sidebar-links em,
.contact-grid em {
  color: var(--muted);
  font-size: 0.76rem;
  font-weight: 800;
  font-style: normal;
}

.sidebar-links strong {
  overflow-wrap: anywhere;
  font-size: 0.9rem;
}

.content-column {
  background: var(--paper);
  border: 1px solid var(--line);
}

.content-section {
  padding: 1.4rem;
  border-bottom: 1px solid var(--line);
  scroll-margin-top: 8rem;
  content-visibility: auto;
  contain-intrinsic-size: 760px;
}

.content-section:last-child {
  border-bottom: 0;
}

.section-kicker {
  margin-bottom: 0.55rem;
  color: var(--green);
  font-size: 0.8rem;
  font-weight: 850;
  letter-spacing: 0;
  text-transform: uppercase;
}

.content-section h2 {
  margin-bottom: 0.85rem;
  color: var(--ink);
  font-size: 1.85rem;
  line-height: 1.22;
}

.lead {
  color: var(--text);
  font-size: 1.03rem;
}

.profile-copy {
  display: grid;
  gap: 0.9rem;
}

.profile-copy p,
.publication-header p,
.feature-panel p,
.updated-note {
  color: var(--text);
}

.publication-header {
  display: grid;
  gap: 1rem;
  align-items: end;
  margin-bottom: 0.75rem;
}

.publication-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.6rem;
  margin: 1rem 0 0.55rem;
}

.publication-stat {
  min-width: 0;
  padding: 0.75rem;
  background: var(--tint);
  border-left: 4px solid var(--green);
}

.publication-stat strong {
  display: block;
  color: var(--green-dark);
  font-size: 1.35rem;
  line-height: 1;
}

.publication-stat span {
  display: block;
  margin-top: 0.28rem;
  color: var(--muted);
  font-size: 0.78rem;
  font-weight: 800;
}

.stats-note {
  margin: 0;
  color: var(--muted);
  font-size: 0.82rem;
}

.paper-search {
  display: grid;
  gap: 0.35rem;
}

.paper-search span {
  color: var(--muted);
  font-size: 0.82rem;
  font-weight: 800;
}

.paper-search input {
  width: 100%;
  min-height: 2.6rem;
  border: 1px solid var(--line);
  border-radius: 4px;
  padding: 0 0.78rem;
  background: var(--paper);
  color: var(--ink);
}

.paper-search input:focus {
  outline: 3px solid rgba(39, 95, 159, 0.14);
  border-color: var(--green);
}

.publication-list {
  display: grid;
  gap: 1.6rem;
}

.publication-card {
  display: grid;
  gap: 1rem;
  padding-bottom: 1.6rem;
  border-bottom: 1px solid var(--line);
}

.publication-card:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}

.publication-card[hidden] {
  display: none;
}

.publication-thumb {
  display: block;
  align-self: start;
  aspect-ratio: 4 / 3;
  min-height: 8rem;
  overflow: hidden;
  background: var(--tint);
  border: 1px solid var(--line);
  text-decoration: none;
}

.publication-thumb picture,
.publication-thumb img {
  width: 100%;
  height: 100%;
}

.publication-thumb img {
  aspect-ratio: 4 / 3;
  object-fit: cover;
  object-position: center;
}

.publication-thumb span {
  display: grid;
  min-height: 8rem;
  place-items: center;
  color: var(--green);
  font-weight: 850;
}

.publication-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-bottom: 0.55rem;
}

.publication-meta span {
  color: var(--muted);
  font-size: 0.78rem;
  font-weight: 800;
}

.publication-meta span:not(:last-child)::after {
  content: "·";
  margin-left: 0.4rem;
  color: var(--line);
}

.publication-meta span:last-child:nth-child(4) {
  color: var(--coral);
}

.publication-body h3 {
  margin-bottom: 0.55rem;
  font-size: 1.18rem;
  line-height: 1.35;
}

.publication-body h3 a {
  color: var(--ink);
  text-decoration: none;
}

.publication-body h3 a:hover,
.publication-body h3 a:focus {
  color: var(--green);
}

.authors {
  margin-bottom: 0.7rem;
  color: var(--text);
  font-size: 0.93rem;
}

.publication-actions,
.feature-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  margin-bottom: 0.75rem;
}

.theme-button {
  padding: 0.34rem 0.6rem;
}

.theme-button-code {
  border-color: var(--gold);
  color: var(--gold);
}

.theme-button-code:hover,
.theme-button-code:focus {
  background: var(--gold);
  color: var(--paper);
}

.publication-details {
  color: var(--text);
}

.publication-details summary {
  cursor: pointer;
  color: var(--green);
  font-weight: 850;
}

.publication-details p {
  margin: 0.75rem 0 0;
}

.code-links {
  display: grid;
  gap: 0.65rem;
  margin-top: 1rem;
}

.code-links a {
  display: grid;
  gap: 0.08rem;
  padding: 0.78rem;
  background: var(--wash);
  border-left: 4px solid var(--gold);
  color: var(--ink);
  text-decoration: none;
}

.code-links span {
  color: var(--gold);
  font-size: 0.76rem;
  font-weight: 850;
}

.code-links small {
  color: var(--muted);
}

.figure-carousel {
  margin-top: 1rem;
}

.figure-stage {
  display: grid;
}

.paper-figure {
  display: none;
  margin: 0;
}

.paper-figure.is-active {
  display: block;
}

.paper-figure img {
  width: 100%;
  max-height: 28rem;
  object-fit: contain;
  padding: 0.45rem;
  background: var(--paper);
  border: 1px solid var(--line);
}

figcaption {
  margin-top: 0.65rem;
  color: var(--muted);
  font-size: 0.82rem;
  line-height: 1.55;
}

.figure-controls {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.7rem;
}

.figure-controls button {
  display: inline-grid;
  width: 2.2rem;
  height: 2.2rem;
  place-items: center;
  border: 1px solid var(--line);
  border-radius: 4px;
  background: var(--paper);
  color: var(--green);
  cursor: pointer;
  font-weight: 850;
}

.figure-controls button:hover,
.figure-controls button:focus {
  background: var(--green);
  color: var(--paper);
}

.figure-controls span {
  color: var(--muted);
  font-size: 0.86rem;
  font-weight: 800;
}

.interest-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.55rem;
  padding: 0;
  margin: 1rem 0 1.4rem;
  list-style: none;
}

.interest-list li {
  padding: 0.62rem 0.72rem;
  background: var(--wash);
  border-left: 4px solid var(--green);
  color: var(--text);
  font-size: 0.9rem;
  font-weight: 700;
}

.feature-panel {
  display: grid;
  gap: 1rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--line);
}

.feature-panel h2 {
  font-size: 1.35rem;
}

.feature-panel figure {
  margin: 0;
}

.feature-panel img {
  width: 100%;
  aspect-ratio: 16 / 10;
  object-fit: contain;
  background: var(--paper);
  border: 1px solid var(--line);
}

.contact-grid {
  display: grid;
  gap: 0.8rem;
  margin-top: 1.2rem;
}

.contact-grid a {
  display: grid;
  grid-template-columns: 1.35rem minmax(0, 1fr);
  align-items: center;
  gap: 0.7rem;
  padding: 0.9rem;
  background: var(--wash);
  border-left: 4px solid var(--green);
  color: var(--ink);
  text-decoration: none;
}

.contact-grid a:hover,
.contact-grid a:focus {
  background: var(--tint);
}

.contact-grid strong {
  overflow-wrap: anywhere;
}

.tutorial-card-list {
  display: grid;
  gap: 1rem;
  margin-top: 1.2rem;
}

.tutorial-card {
  display: grid;
  overflow: hidden;
  background: var(--wash);
  border: 1px solid var(--line);
}

.tutorial-card-media {
  display: block;
  aspect-ratio: 2 / 1;
  overflow: hidden;
  background: var(--tint);
  border-bottom: 1px solid var(--line);
}

.tutorial-card-media picture,
.tutorial-card-media img {
  width: 100%;
  height: 100%;
}

.tutorial-card-media img {
  object-fit: cover;
}

.tutorial-card-body {
  padding: 1rem;
}

.tutorial-card h3 {
  margin-bottom: 0.55rem;
  font-size: 1.25rem;
  line-height: 1.3;
}

.tutorial-card h3 a {
  color: var(--ink);
  text-decoration: none;
}

.tutorial-card h3 a:hover,
.tutorial-card h3 a:focus {
  color: var(--green);
}

.tutorial-card p {
  color: var(--text);
}

.tutorial-meta-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.55rem;
  margin: 0.9rem 0;
}

.tutorial-meta-grid span {
  min-width: 0;
  padding: 0.65rem;
  background: var(--paper);
  border-left: 4px solid var(--green);
  color: var(--muted);
  font-size: 0.78rem;
  font-weight: 800;
}

.tutorial-meta-grid strong {
  display: block;
  color: var(--green-dark);
  font-size: 1.1rem;
  line-height: 1;
}

.tutorial-figure {
  margin: 1.15rem 0;
}

.tutorial-figure img {
  width: 100%;
  max-height: 34rem;
  object-fit: contain;
  padding: 0.45rem;
  background: var(--paper);
  border: 1px solid var(--line);
}

.tutorial-figure-planck img {
  aspect-ratio: 2 / 1;
  padding: 0;
  object-fit: cover;
}

.tutorial-chapter-nav {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr));
  gap: 0.55rem;
  margin-top: 1rem;
}

.tutorial-chapter-nav a {
  display: grid;
  min-height: 3rem;
  align-items: center;
  padding: 0.62rem 0.72rem;
  background: var(--wash);
  border-left: 4px solid var(--green);
  color: var(--ink);
  text-decoration: none;
}

.tutorial-chapter-nav a:hover,
.tutorial-chapter-nav a:focus {
  background: var(--tint);
}

.tutorial-chapter-nav span {
  font-size: 0.86rem;
  font-weight: 850;
  line-height: 1.25;
}

.tutorial-chapter-nav small {
  display: block;
  margin-top: 0.2rem;
  color: var(--muted);
  font-size: 0.72rem;
  font-weight: 700;
  line-height: 1.35;
}

.tutorial-reader {
  display: grid;
  gap: 2.4rem;
}

.tutorial-chapter {
  min-width: 0;
  padding-top: 1.5rem;
  border-top: 1px solid var(--line);
  scroll-margin-top: 8rem;
}

.tutorial-chapter:first-child {
  padding-top: 0;
  border-top: 0;
}

.tutorial-chapter-page .tutorial-chapter {
  padding-top: 0;
  border-top: 0;
}

.tutorial-chapter-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
  padding-bottom: 0.6rem;
  border-bottom: 1px solid var(--line);
}

.tutorial-chapter-heading span {
  color: var(--green);
  font-size: 0.8rem;
  font-weight: 850;
  text-transform: uppercase;
}

.tutorial-chapter-heading a,
.tutorial-xref {
  color: var(--green);
  font-weight: 850;
  text-decoration: none;
}

.tutorial-chapter-heading a:hover,
.tutorial-chapter-heading a:focus,
.tutorial-xref:hover,
.tutorial-xref:focus {
  text-decoration: underline;
}

.tutorial-chapter h2 {
  margin-top: 1.2rem;
  font-size: 1.55rem;
}

.tutorial-chapter h2:first-of-type {
  margin-top: 0;
}

.tutorial-chapter h3 {
  margin: 1.45rem 0 0.55rem;
  color: var(--ink);
  font-size: 1.16rem;
  line-height: 1.35;
}

.tutorial-chapter h4 {
  margin: 1rem 0 0.35rem;
  color: var(--green-dark);
  font-size: 1rem;
  line-height: 1.4;
}

.tutorial-chapter p,
.tutorial-list-block,
.tutorial-description-list dd,
.tutorial-download-panel p {
  color: var(--text);
}

.tutorial-list-block {
  margin: 0.8rem 0 1rem;
  padding-left: 1.35rem;
}

.tutorial-list-block li + li {
  margin-top: 0.55rem;
}

.tutorial-description-list {
  display: grid;
  gap: 0.65rem;
  margin: 0.9rem 0 1.1rem;
}

.tutorial-description-list dt {
  color: var(--green-dark);
  font-weight: 850;
}

.tutorial-description-list dd {
  margin: -0.45rem 0 0;
  padding-left: 0.8rem;
  border-left: 3px solid var(--line);
}

.tutorial-callout {
  margin: 1.05rem 0;
  padding: 0.95rem 1rem;
  background: var(--tint);
  border-left: 4px solid var(--green);
}

.tutorial-callout-physinsight {
  background: #fff8ed;
  border-left-color: var(--gold);
}

.tutorial-callout > strong {
  display: block;
  margin-bottom: 0.45rem;
  color: var(--green-dark);
}

.tutorial-callout-physinsight > strong {
  color: var(--gold);
}

.tutorial-code {
  margin: 1.05rem 0;
  overflow: hidden;
  background: #101823;
  border: 1px solid #24364f;
}

.tutorial-code-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  min-height: 2.45rem;
  padding: 0.4rem 0.55rem 0.4rem 0.8rem;
  background: #17243a;
  color: #e8edf7;
}

.tutorial-code-header span {
  min-width: 0;
  overflow-wrap: anywhere;
  font-size: 0.78rem;
  font-weight: 850;
}

.tutorial-code-header button {
  flex: 0 0 auto;
  min-height: 1.8rem;
  border: 1px solid rgba(232, 237, 247, 0.38);
  border-radius: 4px;
  padding: 0 0.55rem;
  background: transparent;
  color: #e8edf7;
  cursor: pointer;
  font-size: 0.76rem;
  font-weight: 850;
}

.tutorial-code-header button:hover,
.tutorial-code-header button:focus {
  background: #e8edf7;
  color: #17243a;
}

.tutorial-code pre {
  margin: 0;
  overflow-x: auto;
  padding: 0.95rem;
}

.tutorial-code code {
  font-family: inherit;
}

.tutorial-code pre code {
  display: block;
  color: #eef4ff;
  font-size: 0.82rem;
  line-height: 1.55;
  white-space: pre;
}

.tutorial-math {
  margin: 1rem 0;
  overflow-x: auto;
  padding: 0.75rem;
  background: var(--wash);
  border-left: 4px solid var(--blue);
}

.tutorial-anchor {
  display: block;
  position: relative;
  top: -8rem;
}

.tutorial-rule {
  height: 1px;
  margin: 1.3rem 0;
  border: 0;
  background: var(--line);
}

.tutorial-download-panel {
  display: grid;
  gap: 1rem;
  margin-top: 1.4rem;
  padding: 1rem;
  background: var(--wash);
  border: 1px solid var(--line);
}

.tutorial-download-panel h3 {
  margin: 0 0 0.45rem;
  font-size: 1.15rem;
}

.tutorial-download-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}

.tutorial-pager {
  display: grid;
  gap: 0.75rem;
  margin-top: 1.6rem;
  padding-top: 1rem;
  border-top: 1px solid var(--line);
}

.tutorial-pager a {
  display: grid;
  gap: 0.2rem;
  min-width: 0;
  padding: 0.8rem;
  background: var(--wash);
  border-left: 4px solid var(--green);
  color: var(--ink);
  text-decoration: none;
}

.tutorial-pager a:hover,
.tutorial-pager a:focus {
  background: var(--tint);
}

.tutorial-pager span {
  color: var(--muted);
  font-size: 0.76rem;
  font-weight: 850;
  text-transform: uppercase;
}

.tutorial-pager strong {
  font-size: 0.95rem;
}

.updated-note {
  margin: 1rem 0 0;
  font-size: 0.88rem;
}

.site-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  width: min(1180px, calc(100% - 2rem));
  margin: 0 auto;
  padding: 2rem 0 2.5rem;
  color: var(--muted);
}

.site-footer p {
  margin: 0;
}

.site-footer a {
  color: var(--green);
  font-weight: 800;
  text-decoration: none;
}

@media (min-width: 720px) {
  .site-header nav {
    display: flex;
  }

  .banner,
  .banner-image {
    height: 16rem;
  }

  .page-shell {
    grid-template-columns: minmax(15rem, 0.32fr) minmax(0, 0.68fr);
    align-items: start;
  }

  .profile-sidebar {
    position: sticky;
    top: 5.25rem;
  }

  .content-section {
    padding: 1.8rem;
  }

  .publication-header {
    grid-template-columns: minmax(0, 1fr) minmax(15rem, 0.34fr);
  }

  .publication-card {
    grid-template-columns: minmax(10rem, 0.32fr) minmax(0, 0.68fr);
  }

  .publication-thumb {
    height: 10.75rem;
  }

  .feature-panel {
    grid-template-columns: minmax(0, 0.9fr) minmax(16rem, 0.7fr);
    align-items: start;
  }

  .contact-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .tutorial-card {
    grid-template-columns: minmax(14rem, 0.42fr) minmax(0, 0.58fr);
  }

  .tutorial-card-media {
    aspect-ratio: auto;
    min-height: 16rem;
    height: 100%;
    border-right: 1px solid var(--line);
    border-bottom: 0;
  }

  .tutorial-download-panel {
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
  }

  .tutorial-pager {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1040px) {
  .page-shell {
    grid-template-columns: 18rem minmax(0, 1fr);
    gap: 2.2rem;
  }

  .content-section {
    padding: 2rem 2.2rem;
  }
}

@media (max-width: 719px) {
  .site-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .site-header nav {
    display: flex;
    width: 100%;
    overflow-x: auto;
    padding-bottom: 0.15rem;
  }

  .page-shell {
    width: min(100% - 1rem, 44rem);
  }

  .content-section {
    padding: 1.1rem;
  }

  .content-section h2 {
    font-size: 1.55rem;
  }

  .interest-list {
    grid-template-columns: 1fr;
  }

  .site-footer {
    align-items: flex-start;
    flex-direction: column;
  }
}
`;

const js = `(() => {
  const search = document.querySelector("[data-paper-search]");
  const papers = Array.from(document.querySelectorAll("[data-paper]"));

  if (search && papers.length > 0) {
    search.addEventListener("input", () => {
      const query = search.value.trim().toLowerCase();

      papers.forEach((paper) => {
        const visible = !query || paper.dataset.search.includes(query);
        paper.hidden = !visible;
      });
    });
  }

  document.querySelectorAll("[data-carousel]").forEach((carousel) => {
    const slides = Array.from(carousel.querySelectorAll("[data-slide]"));
    const previous = carousel.querySelector("[data-carousel-prev]");
    const next = carousel.querySelector("[data-carousel-next]");
    const counter = carousel.querySelector("[data-carousel-count]");
    let active = 0;

    const render = () => {
      slides.forEach((slide, index) => {
        slide.classList.toggle("is-active", index === active);
      });

      if (counter) {
        counter.textContent = (active + 1) + " / " + slides.length;
      }
    };

    if (previous) {
      previous.addEventListener("click", () => {
        active = active === 0 ? slides.length - 1 : active - 1;
        render();
      });
    }

    if (next) {
      next.addEventListener("click", () => {
        active = active === slides.length - 1 ? 0 : active + 1;
        render();
      });
    }
  });

  const copyText = async (text) => {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }

    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.top = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
  };

  document.querySelectorAll("[data-copy-code]").forEach((button) => {
    const block = button.closest("[data-code-block]");
    const code = block ? block.querySelector("code") : null;

    if (!code) {
      return;
    }

    button.addEventListener("click", async () => {
      const originalLabel = button.textContent;

      try {
        await copyText(code.textContent.replace(/\\n$/, ""));
        button.textContent = "Copied";
      } catch (error) {
        button.textContent = "Failed";
      }

      window.setTimeout(() => {
        button.textContent = originalLabel;
      }, 1400);
    });
  });
})();`;

const manifest = {
    "name": "Anto Idicherian Lonappan",
    "short_name": "Anto Lonappan",
    "description": SITE_DESCRIPTION,
    "start_url": "/",
    "display": "standalone",
    "background_color": "#f5f7fb",
    "theme_color": THEME_COLOR,
    "icons": [
        {
            "src": "favicon/android-chrome-192x192.png",
            "sizes": "192x192",
            "type": "image/png"
        },
        {
            "src": "favicon/android-chrome-512x512.png",
            "sizes": "512x512",
            "type": "image/png"
        }
    ]
};

const robots = `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;

const readme = `# Webpage

This folder is the standalone static website for https://antolonappan.me/.

## Pages

- \`/\`
- \`/publications/\`
- \`/research/\`
- \`/tutorial/\`
- \`/tutorial/cmb/\`
- \`/tutorial/cmb/<chapter>/\`
- \`/contact/\`

## Regenerate

From the project root:

\`\`\`bash
node webpage/build.js
\`\`\`

The generator reads:

- \`components/pages/research/config.json\`
- \`components/pages/research/generated.json\`
- \`components/pages/about/data.json\`
- \`public/assets/research\`
- \`data/tutorials/cmb\`
- \`assets/tutorials/cmb\`

When adding a new arXiv paper, run:

\`\`\`bash
npm run sync:research
node webpage/build.js
\`\`\`

## Preview

Serve the folder:

\`\`\`bash
cd webpage
python3 -m http.server 4173
\`\`\`

Then open \`http://localhost:4173\`.
`;

const write = (file, contents) => {
    ensureDir(path.dirname(file));
    fs.writeFileSync(file, typeof contents === "string" ? contents.replace(/[ \t]+$/gm, "") : contents);
};

const optimizeJpegIfPossible = (file, maxSize) => {
    try {
        execFileSync("sips", ["-Z", String(maxSize), file], { stdio: "ignore" });
    } catch (error) {
        // sips is available on macOS. Keep the copied source image elsewhere.
    }
};

const createWebpIfPossible = (file) => {
    if (!CAN_CONVERT_WEBP || !file.match(/\.(png|jpe?g)$/i)) {
        return;
    }

    const destination = file.replace(/\.(png|jpe?g)$/i, ".webp");
    const quality = file.includes(`${path.sep}research${path.sep}`) ? "86" : "82";

    try {
        if (fs.existsSync(destination) && fs.statSync(destination).mtimeMs >= fs.statSync(file).mtimeMs) {
            return;
        }

        execFileSync("cwebp", ["-quiet", "-q", quality, file, "-o", destination], { stdio: "ignore" });
    } catch (error) {
        // Keep the original image fallback when WebP conversion is unavailable for a file.
    }
};

const walkFiles = (dir) => {
    if (!fs.existsSync(dir)) {
        return [];
    }

    return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const fullPath = path.join(dir, entry.name);
        return entry.isDirectory() ? walkFiles(fullPath) : [fullPath];
    });
};

const main = () => {
    const assetsDir = path.join(outDir, "assets");

    ensureDir(outDir);
    ensureDir(assetsDir);

    fs.rmSync(path.join(outDir, "publications"), { recursive: true, force: true });
    fs.rmSync(path.join(outDir, "research"), { recursive: true, force: true });
    fs.rmSync(path.join(outDir, "tutorial"), { recursive: true, force: true });
    fs.rmSync(path.join(outDir, "contact"), { recursive: true, force: true });
    fs.rmSync(path.join(assetsDir, "css"), { recursive: true, force: true });
    fs.rmSync(path.join(assetsDir, "js"), { recursive: true, force: true });

    ensureDir(path.join(assetsDir, "css"));
    ensureDir(path.join(assetsDir, "js"));
    ensureDir(path.join(assetsDir, "images"));
    ensureDir(path.join(assetsDir, "files"));
    ensureDir(path.join(assetsDir, "research"));
    ensureDir(path.join(assetsDir, "tutorials"));
    ensureDir(path.join(assetsDir, "vendor/katex"));

    optimizeJpegIfPossible(path.join(assetsDir, "images/anto.jpg"), 1200);
    copyDir(path.join(rootDir, "node_modules/katex/dist/fonts"), path.join(assetsDir, "vendor/katex/fonts"));
    walkFiles(path.join(assetsDir, "images")).forEach(createWebpIfPossible);
    walkFiles(path.join(assetsDir, "research")).forEach(createWebpIfPossible);
    walkFiles(path.join(assetsDir, "tutorials")).forEach(createWebpIfPossible);

    const katexCss = path.join(rootDir, "node_modules/katex/dist/katex.min.css");
    if (fs.existsSync(katexCss)) {
        write(path.join(assetsDir, "vendor/katex/katex.min.css"), fs.readFileSync(katexCss, "utf8"));
    }
    write(path.join(assetsDir, "css/styles.css"), css);
    write(path.join(assetsDir, "js/app.js"), js);

    outputPages.forEach((page) => {
        write(path.join(outDir, page.output), renderPage(page));
    });

    write(path.join(outDir, "robots.txt"), robots);
    write(path.join(outDir, "sitemap.xml"), multiPageSitemap);
    write(path.join(outDir, "site.webmanifest"), `${JSON.stringify(manifest, null, 2)}\n`);

    console.log(`Built webpage with ${papers.length} papers across ${outputPages.length} pages in ${path.relative(rootDir, outDir)}`);
};

main();
