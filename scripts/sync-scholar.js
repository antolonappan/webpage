const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const configPath = path.join(root, "data/research/config.json");

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

const cleanText = (value = "") => decodeEntities(value)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const monthYear = (date) => new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric",
    timeZone: "UTC"
}).format(date);

const fetchScholarHtml = async (url) => {
    const response = await fetch(url, {
        headers: {
            "User-Agent": "Mozilla/5.0 (compatible; antolonappan.me scholar metrics sync; +https://antolonappan.me/)",
            "Accept-Language": "en-US,en;q=0.9"
        }
    });

    if (!response.ok) {
        throw new Error(`Google Scholar returned ${response.status} ${response.statusText}`);
    }

    return response.text();
};

const parseMetrics = (html) => {
    const wanted = new Map([
        ["citations", "Citations"],
        ["h-index", "h-index"],
        ["i10-index", "i10-index"]
    ]);
    const metrics = {};
    const rowPattern = /<tr[^>]*>\s*<td[^>]*class=["'][^"']*gsc_rsb_sc1[^"']*["'][^>]*>([\s\S]*?)<\/td>\s*<td[^>]*class=["'][^"']*gsc_rsb_std[^"']*["'][^>]*>([\s\S]*?)<\/td>/gi;

    for (const match of html.matchAll(rowPattern)) {
        const rawLabel = cleanText(match[1]).toLowerCase();
        const label = wanted.get(rawLabel);
        const value = cleanText(match[2]).replace(/,/g, "");

        if (label && /^\d+$/.test(value)) {
            metrics[label] = value;
        }
    }

    const missing = [...wanted.values()].filter((label) => !metrics[label]);
    if (missing.length > 0) {
        throw new Error(`Could not parse Google Scholar metrics: ${missing.join(", ")}`);
    }

    return metrics;
};

const main = async () => {
    const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    const scholarUrl = config.profile && config.profile.scholarUrl;

    if (!scholarUrl) {
        throw new Error("Missing profile.scholarUrl in data/research/config.json");
    }

    const html = await fetchScholarHtml(scholarUrl);
    const metrics = parseMetrics(html);
    const currentStats = config.profile.scholarStats || [];
    let changed = false;

    config.profile.scholarStats = ["Citations", "h-index", "i10-index"].map((label) => {
        const current = currentStats.find((stat) => stat.label === label) || { label, value: "" };
        const nextValue = metrics[label];

        if (String(current.value) !== String(nextValue)) {
            changed = true;
        }

        return {
            ...current,
            label,
            value: nextValue
        };
    });

    if (!config.profile.statsUpdatedAt) {
        changed = true;
    }

    if (changed) {
        const now = new Date();
        config.profile.statsUpdated = monthYear(now);
        config.profile.statsUpdatedAt = now.toISOString();
        fs.writeFileSync(configPath, `${JSON.stringify(config, null, 4)}\n`);
        console.log(`Updated Google Scholar metrics: ${config.profile.scholarStats.map((stat) => `${stat.label}=${stat.value}`).join(", ")}`);
    } else {
        console.log("Google Scholar metrics are already up to date.");
    }
};

main().catch((error) => {
    const message = error.message || String(error);

    if (process.env.ALLOW_SCHOLAR_FAILURE === "1") {
        console.warn(`Google Scholar metrics sync skipped: ${message}`);
        console.warn("Keeping checked-in Scholar metrics.");
        process.exit(0);
    }

    console.error(message);
    process.exit(1);
});
