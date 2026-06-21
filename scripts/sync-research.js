const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const configPath = path.join(root, "data/research/config.json");
const outputPath = path.join(root, "data/research/generated.json");
const publicRoot = root;
const researchAssetsRoot = path.join(publicRoot, "assets/research");
const canConvertWebp = (() => {
    try {
        execFileSync("which", ["cwebp"], { stdio: "ignore" });
        return true;
    } catch (error) {
        return false;
    }
})();

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const decodeEntities = (value = "") => {
    const entities = {
        amp: "&",
        lt: "<",
        gt: ">",
        quot: "\"",
        apos: "'",
        nbsp: " "
    };

    return value
        .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
        .replace(/&#x([0-9a-fA-F]+);/g, (_, code) => String.fromCharCode(parseInt(code, 16)))
        .replace(/&([a-zA-Z]+);/g, (_, entity) => entities[entity] || `&${entity};`);
};

const normalizeSpace = (value = "") => {
    return decodeEntities(value)
        .replace(/\s+/g, " ")
        .trim();
};

const cleanHtmlText = (html = "") => {
    return normalizeSpace(
        html
            .replace(/<annotation-xml\b[\s\S]*?<\/annotation-xml>/gi, "")
            .replace(/<annotation\b[\s\S]*?<\/annotation>/gi, "")
            .replace(/<math\b[^>]*alttext="([^"]*)"[^>]*>[\s\S]*?<\/math>/gi, (_, alt) => ` $${decodeEntities(alt)}$ `)
            .replace(/<script\b[\s\S]*?<\/script>/gi, "")
            .replace(/<style\b[\s\S]*?<\/style>/gi, "")
            .replace(/<[^>]+>/g, " ")
    );
};

const getTag = (xml, tag) => {
    const match = xml.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, "i"));
    return match ? normalizeSpace(match[1]) : "";
};

const getNamespacedTag = (xml, tag) => {
    const match = xml.match(new RegExp(`<(?:\\w+:)?${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/(?:\\w+:)?${tag}>`, "i"));
    return match ? normalizeSpace(match[1]) : "";
};

const getAttribute = (tag, attribute) => {
    const match = tag.match(new RegExp(`${attribute}=["']([^"']+)["']`, "i"));
    return match ? decodeEntities(match[1]) : "";
};

const normalizeArxivId = (id) => id.replace(/^arXiv:/i, "").replace(/v\d+$/i, "");

const safeId = (id) => normalizeArxivId(id).replace(/[^a-zA-Z0-9.-]/g, "_");

const cleanOptionalValue = (value) => typeof value === "string" ? value.trim() : value || "";

const formatDate = (isoDate) => {
    if (!isoDate) {
        return "";
    }

    return new Intl.DateTimeFormat("en", {
        month: "short",
        year: "numeric",
        timeZone: "UTC"
    }).format(new Date(isoDate));
};

const fetchText = async (url) => {
    const response = await fetch(url, {
        headers: {
            "User-Agent": "antolonappan.me research metadata sync (mailto:alonappan@ucsd.edu)"
        }
    });

    if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
    }

    return response.text();
};

const parseAtomEntries = (xml) => {
    return [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map((entryMatch) => {
        const entry = entryMatch[1];
        const idUrl = getTag(entry, "id");
        const arxivIdWithVersion = idUrl.split("/abs/")[1] || "";
        const arxivId = normalizeArxivId(arxivIdWithVersion);
        const allAuthors = [...entry.matchAll(/<author>\s*<name>([\s\S]*?)<\/name>\s*<\/author>/g)].map((match) => normalizeSpace(match[1]));
        const authors = allAuthors.length > 10 ? [...allAuthors.slice(0, 10), "et al."] : allAuthors;
        const doi = getNamespacedTag(entry, "doi");
        const doiUrl = doi ? `https://doi.org/${doi}` : "";

        return {
            arxivId,
            arxivVersion: arxivIdWithVersion,
            title: getTag(entry, "title"),
            description: getTag(entry, "summary"),
            authors,
            published: getTag(entry, "published"),
            updated: getTag(entry, "updated"),
            date: formatDate(getTag(entry, "published")),
            doi,
            doiUrl,
            arxivUrl: `https://arxiv.org/abs/${arxivIdWithVersion || arxivId}`,
            pdfUrl: `https://arxiv.org/pdf/${arxivIdWithVersion || arxivId}`,
            htmlUrl: `https://arxiv.org/html/${arxivIdWithVersion || arxivId}`
        };
    });
};

const fetchAtomMetadata = async (ids) => {
    const query = ids.map(normalizeArxivId).join(",");
    const xml = await fetchText(`https://export.arxiv.org/api/query?id_list=${encodeURIComponent(query)}&max_results=${ids.length}`);
    const entries = parseAtomEntries(xml);

    return entries.reduce((metadata, entry) => {
        metadata[entry.arxivId] = entry;
        return metadata;
    }, {});
};

const resolveHtmlAssetUrl = (html, htmlUrl, src) => {
    const baseMatch = html.match(/<base\b[^>]*href=["']([^"']+)["'][^>]*>/i);
    const baseUrl = baseMatch ? new URL(decodeEntities(baseMatch[1]), htmlUrl).toString() : htmlUrl;

    return new URL(decodeEntities(src), baseUrl).toString();
};

const extensionFromUrl = (url, contentType) => {
    const extension = path.extname(new URL(url).pathname).replace(/[^.\w]/g, "");
    if (extension) {
        return extension;
    }

    if (contentType && contentType.includes("svg")) {
        return ".svg";
    }

    if (contentType && contentType.includes("jpeg")) {
        return ".jpg";
    }

    return ".png";
};

const downloadImage = async (url, destinationBase) => {
    const response = await fetch(url, {
        headers: {
            "User-Agent": "antolonappan.me research figure sync (mailto:alonappan@ucsd.edu)"
        }
    });

    if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
    }

    const extension = extensionFromUrl(url, response.headers.get("content-type"));
    const destination = `${destinationBase}${extension}`;
    const bytes = Buffer.from(await response.arrayBuffer());
    fs.writeFileSync(destination, bytes);
    createWebpIfPossible(destination);

    return destination;
};

const createWebpIfPossible = (file) => {
    if (!canConvertWebp || !file.match(/\.(png|jpe?g)$/i)) {
        return;
    }

    try {
        execFileSync("cwebp", ["-quiet", "-q", "86", file, "-o", file.replace(/\.(png|jpe?g)$/i, ".webp")], { stdio: "ignore" });
    } catch (error) {
        // Keep the original image fallback when WebP conversion is unavailable.
    }
};

const extractFiguresFromHtml = async (paper, figureLimit) => {
    const candidates = [
        `https://arxiv.org/html/${paper.arxivVersion || paper.arxivId}`,
        `https://ar5iv.labs.arxiv.org/html/${paper.arxivId}`
    ];
    const errors = [];

    for (const htmlUrl of candidates) {
        try {
            const html = await fetchText(htmlUrl);
            const figureMatches = [...html.matchAll(/<figure\b[^>]*>([\s\S]*?)<\/figure>/gi)];
            const outputDir = path.join(researchAssetsRoot, safeId(paper.arxivId));
            const figures = [];

            fs.rmSync(outputDir, { recursive: true, force: true });
            fs.mkdirSync(outputDir, { recursive: true });

            for (const [index, match] of figureMatches.entries()) {
                if (figures.length >= figureLimit) {
                    break;
                }

                const figureHtml = match[1];
                const imgTag = figureHtml.match(/<img\b[^>]*>/i)?.[0];

                if (!imgTag) {
                    continue;
                }

                const src = getAttribute(imgTag, "src");
                const captionHtml = figureHtml.match(/<figcaption\b[^>]*>([\s\S]*?)<\/figcaption>/i)?.[1] || "";

                if (!src || !captionHtml) {
                    continue;
                }

                const imageUrl = resolveHtmlAssetUrl(html, htmlUrl, src);
                const destination = await downloadImage(imageUrl, path.join(outputDir, `figure-${figures.length + 1}`));
                const publicPath = destination.replace(publicRoot, "").split(path.sep).join("/");

                figures.push({
                    src: publicPath,
                    sourceUrl: imageUrl,
                    caption: cleanHtmlText(captionHtml),
                    alt: getAttribute(imgTag, "alt") || "Paper figure"
                });

                if (index < figureMatches.length - 1) {
                    await wait(150);
                }
            }

            return {
                figures,
                htmlUrl
            };
        } catch (error) {
            errors.push(`${htmlUrl}: ${error.message}`);
        }
    }

    if (errors.length > 0) {
        console.warn(`Could not extract figures for ${paper.arxivId}: ${errors.join("; ")}`);
    }

    return {
        figures: [],
        htmlUrl: `https://arxiv.org/html/${paper.arxivId}`
    };
};

const main = async () => {
    const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    const ids = config.papers.map((paper) => normalizeArxivId(paper.arxivId));
    const metadata = await fetchAtomMetadata(ids);
    const figureLimit = config.defaultFigureLimit || 3;
    const papers = [];

    fs.mkdirSync(researchAssetsRoot, { recursive: true });

    for (const paperConfig of config.papers) {
        const arxivId = normalizeArxivId(paperConfig.arxivId);
        const paper = metadata[arxivId] || {
            arxivId,
            title: paperConfig.title || `arXiv:${arxivId}`,
            arxivUrl: `https://arxiv.org/abs/${arxivId}`,
            htmlUrl: `https://arxiv.org/html/${arxivId}`
        };
        const figureData = await extractFiguresFromHtml(paper, paperConfig.figureLimit || figureLimit);
        const doi = cleanOptionalValue(paperConfig.doi) || cleanOptionalValue(paper.doi);

        papers.push({
            ...paper,
            ...figureData,
            arxivId,
            date: paperConfig.date || paper.date,
            venue: paperConfig.venue || "",
            doi,
            doiUrl: doi ? `https://doi.org/${doi}` : ""
        });

        await wait(300);
    }

    const previous = fs.existsSync(outputPath)
        ? JSON.parse(fs.readFileSync(outputPath, "utf8"))
        : {};
    const papersChanged = JSON.stringify(previous.papers || []) !== JSON.stringify(papers);
    const nextOutput = {
        generatedAt: papersChanged ? new Date().toISOString() : previous.generatedAt || new Date().toISOString(),
        papers
    };
    const nextText = `${JSON.stringify(nextOutput, null, 4)}\n`;

    if (fs.existsSync(outputPath) && fs.readFileSync(outputPath, "utf8") === nextText) {
        console.log(`Research metadata already up to date at ${path.relative(root, outputPath)}`);
        return;
    }

    fs.writeFileSync(outputPath, nextText);

    console.log(`Synced ${papers.length} papers to ${path.relative(root, outputPath)}`);
};

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
