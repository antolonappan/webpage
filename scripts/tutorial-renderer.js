const mathPattern = /(\$\$[\s\S]+?\$\$|\$[^$]+?\$|\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\))/g;

const labelId = (label = "") => `tutorial-${String(label).replace(/[^a-zA-Z0-9_-]+/g, "-")}`;

const slugify = (value = "") => String(value)
  .toLowerCase()
  .replace(/\\[a-zA-Z]+\*?/g, " ")
  .replace(/[$\\{}[\]_^~]/g, " ")
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "") || "section";

const readBraced = (value, openIndex) => {
  if (value[openIndex] !== "{") {
    return null;
  }

  let depth = 0;
  for (let index = openIndex; index < value.length; index += 1) {
    const character = value[index];
    const previous = index > 0 ? value[index - 1] : "";

    if (character === "{" && previous !== "\\") {
      depth += 1;
    } else if (character === "}" && previous !== "\\") {
      depth -= 1;

      if (depth === 0) {
        return {
          argument: value.slice(openIndex + 1, index),
          end: index + 1
        };
      }
    }
  }

  return null;
};

const readBracketed = (value, openIndex) => {
  if (value[openIndex] !== "[") {
    return null;
  }

  let depth = 0;
  for (let index = openIndex; index < value.length; index += 1) {
    const character = value[index];
    const previous = index > 0 ? value[index - 1] : "";

    if (character === "[" && previous !== "\\") {
      depth += 1;
    } else if (character === "]" && previous !== "\\") {
      depth -= 1;

      if (depth === 0) {
        return {
          argument: value.slice(openIndex + 1, index),
          end: index + 1
        };
      }
    }
  }

  return null;
};

const parseSectionCommand = (line, command) => {
  const trimmed = line.trim();
  const prefix = `\\${command}`;

  if (!trimmed.startsWith(prefix)) {
    return null;
  }

  let index = prefix.length;
  if (trimmed[index] === "*") {
    index += 1;
  }

  while (trimmed[index] === " ") {
    index += 1;
  }

  const parsed = readBraced(trimmed, index);
  if (!parsed) {
    return null;
  }

  return {
    title: parsed.argument,
    rest: trimmed.slice(parsed.end).trim()
  };
};

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

const unescapeLatexText = (value = "") => value
  .replace(/\\_/g, "_")
  .replace(/\\%/g, "%")
  .replace(/\\&/g, "&")
  .replace(/\\#/g, "#")
  .replace(/\\\$/g, "$")
  .replace(/\\\{/g, "{")
  .replace(/\\\}/g, "}")
  .replace(/\\,/g, " ")
  .replace(/\\ /g, " ")
  .replace(/~/g, " ");

const cleanDisplayMath = (value = "") => {
  const labels = [];
  const math = value
    .replace(/\\label\{([^}]+)\}/g, (_, label) => {
      labels.push(label);
      return "";
    })
    .replace(/\\nonumber/g, "")
    .trim();

  return { math, labels };
};

const createTutorialRenderer = ({ katex, pictureMarkup, escapeHtml, escapeAttribute, resolveReference = null }) => {
  const renderMath = (math, displayMode = false) => katex.renderToString(math, {
    displayMode,
    throwOnError: false,
    strict: false
  });

  const renderTextSegment = (value = "") => {
    let output = "";
    let index = 0;

    while (index < value.length) {
      if (value.startsWith("$$", index)) {
        const end = value.indexOf("$$", index + 2);
        if (end !== -1) {
          output += renderMath(value.slice(index + 2, end), true);
          index = end + 2;
          continue;
        }
      }

      if (value[index] === "$") {
        const end = value.indexOf("$", index + 1);
        if (end !== -1) {
          output += renderMath(value.slice(index + 1, end), false);
          index = end + 1;
          continue;
        }
      }

      if (value.startsWith("\\[", index)) {
        const end = value.indexOf("\\]", index + 2);
        if (end !== -1) {
          output += renderMath(value.slice(index + 2, end), true);
          index = end + 2;
          continue;
        }
      }

      if (value.startsWith("\\(", index)) {
        const end = value.indexOf("\\)", index + 2);
        if (end !== -1) {
          output += renderMath(value.slice(index + 2, end), false);
          index = end + 2;
          continue;
        }
      }

      const character = value[index];

      if (character !== "\\") {
        if (value.startsWith("``", index)) {
          output += "&ldquo;";
          index += 2;
        } else if (value.startsWith("''", index)) {
          output += "&rdquo;";
          index += 2;
        } else if (value.startsWith("---", index)) {
          output += "&mdash;";
          index += 3;
        } else if (value.startsWith("--", index)) {
          output += "&ndash;";
          index += 2;
        } else if (character === "~") {
          output += " ";
          index += 1;
        } else {
          output += escapeHtml(character);
          index += 1;
        }
        continue;
      }

      const next = value[index + 1] || "";

      if (next === " ") {
        output += " ";
        index += 2;
        continue;
      }

      if ("_%&#${}".includes(next)) {
        output += escapeHtml(next);
        index += 2;
        continue;
      }

      if (next === "\\") {
        output += "<br>";
        index += 2;
        continue;
      }

      const commandMatch = value.slice(index + 1).match(/^[a-zA-Z]+/);
      if (!commandMatch) {
        output += escapeHtml(character);
        index += 1;
        continue;
      }

      const command = commandMatch[0];
      let cursor = index + 1 + command.length;

      while (value[cursor] === " ") {
        cursor += 1;
      }

      if (["noindent", "small", "normalsize", "footnotesize", "displaystyle"].includes(command)) {
        index = cursor;
        continue;
      }

      if (command === "LaTeX") {
        output += "LaTeX";
        index = cursor;
        continue;
      }

      if (command === "ldots" || command === "dots") {
        output += "...";
        index = cursor;
        continue;
      }

      if (command === "quad" || command === "qquad") {
        output += " ";
        index = cursor;
        continue;
      }

      if (command === "cref" || command === "ref") {
        const reference = readBraced(value, cursor);
        if (reference) {
          const firstLabel = reference.argument.split(",")[0].trim();
          const href = resolveReference ? resolveReference(firstLabel) : `#${labelId(firstLabel)}`;
          output += `<a class="tutorial-xref" href="${escapeAttribute(href)}">Eq.</a>`;
          index = reference.end;
          continue;
        }
      }

      if (command === "href") {
        const href = readBraced(value, cursor);
        const text = href ? readBraced(value, href.end) : null;
        if (href && text) {
          output += `<a href="${escapeAttribute(href.argument)}" target="_blank" rel="noopener noreferrer">${renderInline(text.argument)}</a>`;
          index = text.end;
          continue;
        }
      }

      if (command === "url") {
        const url = readBraced(value, cursor);
        if (url) {
          output += `<a href="${escapeAttribute(url.argument)}" target="_blank" rel="noopener noreferrer">${escapeHtml(url.argument)}</a>`;
          index = url.end;
          continue;
        }
      }

      const argument = readBraced(value, cursor);
      if (argument) {
        if (command === "emph" || command === "textit") {
          output += `<em>${renderInline(argument.argument)}</em>`;
          index = argument.end;
          continue;
        }

        if (command === "textbf") {
          output += `<strong>${renderInline(argument.argument)}</strong>`;
          index = argument.end;
          continue;
        }

        if (command === "texttt") {
          output += `<code>${escapeHtml(unescapeLatexText(argument.argument))}</code>`;
          index = argument.end;
          continue;
        }

        if (command === "textsuperscript") {
          output += `<sup>${renderInline(argument.argument)}</sup>`;
          index = argument.end;
          continue;
        }
      }

      output += escapeHtml(command);
      index = cursor;
    }

    return output;
  };

  const renderInline = (value = "") => {
    if (!value) {
      return "";
    }

    return renderTextSegment(value);
  };

  const renderCodeBlock = (code, title = "Python", language = "python") => `
                    <div class="tutorial-code" data-code-block>
                        <div class="tutorial-code-header">
                            <span>${renderInline(title)}</span>
                            <button type="button" data-copy-code>Copy</button>
                        </div>
                        <pre><code class="language-${escapeAttribute(language)}">${escapeHtml(code.replace(/\s+$/g, ""))}</code></pre>
                    </div>`;

  const renderDisplayMath = (rawMath, environment = "equation") => {
    const { math, labels } = cleanDisplayMath(rawMath);
    const renderedMath = environment.startsWith("align")
      ? renderMath(`\\begin{aligned}\n${math}\n\\end{aligned}`, true)
      : renderMath(math, true);
    const id = labels[0] ? ` id="${escapeAttribute(labelId(labels[0]))}"` : "";
    const extraAnchors = labels.slice(1).map((label) => `<span class="tutorial-anchor" id="${escapeAttribute(labelId(label))}"></span>`).join("");

    return `
                    <div class="tutorial-math"${id}>
                        ${extraAnchors}
                        ${renderedMath}
                    </div>`;
  };

  const tutorialFigureSrc = (source = "") => {
    const fileName = source.replace(/^figures\//, "").replace(/\.pdf$/i, ".png");
    return `assets/tutorials/cmb/figures/${fileName}`;
  };

  const renderFigure = (centerLines) => {
    const content = centerLines.join("\n");
    const figureMatch = content.match(/\\includegraphics(?:\[[^\]]*\])?\{([^}]+)\}/);

    if (!figureMatch) {
      return renderBlocks(centerLines).html;
    }

    const source = figureMatch[1];
    const imageSource = tutorialFigureSrc(source);
    const isPlanck = source.includes("planck_sky");
    const captionSource = content
      .replace(/\\includegraphics(?:\[[^\]]*\])?\{[^}]+\}/, "")
      .replace(/\\\\/g, "")
      .replace(/\\small/g, "")
      .trim();
    const caption = isPlanck
      ? `Planck CMB temperature map. Credit: <a href="https://planck.ipac.caltech.edu/image/planck13-002a" target="_blank" rel="noopener noreferrer">ESA and the Planck Collaboration / U.S. Planck Data Center</a>.`
      : renderInline(captionSource);
    const alt = isPlanck
      ? "Planck cosmic microwave background temperature map"
      : source.replace(/^figures\//, "").replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ");

    return `
                    <figure class="tutorial-figure${isPlanck ? " tutorial-figure-planck" : ""}">
                        ${pictureMarkup({
                          src: imageSource,
                          alt,
                          loading: "lazy",
                          decoding: "async"
                        })}
                        ${caption ? `<figcaption>${caption}</figcaption>` : ""}
                    </figure>`;
  };

  const collectUntil = (lines, startIndex, endTest) => {
    const collected = [];
    let index = startIndex;

    while (index < lines.length && !endTest(lines[index].trim())) {
      collected.push(lines[index]);
      index += 1;
    }

    return { collected, index };
  };

  const parseItemLine = (line) => {
    let rest = line.trim().replace(/^\\item\b/, "").trimStart();
    let label = "";

    if (rest.startsWith("[")) {
      const parsed = readBracketed(rest, 0);
      if (parsed) {
        label = parsed.argument;
        rest = rest.slice(parsed.end).trimStart();
      }
    }

    return { label, rest };
  };

  const renderList = (environment, lines, startIndex) => {
    const items = [];
    let current = null;
    let index = startIndex + 1;

    while (index < lines.length) {
      const trimmed = lines[index].trim();

      if (trimmed === `\\end{${environment}}`) {
        if (current) {
          items.push(current);
        }
        break;
      }

      if (trimmed.startsWith("\\item")) {
        if (current) {
          items.push(current);
        }

        const parsed = parseItemLine(lines[index]);
        current = { label: parsed.label, lines: parsed.rest ? [parsed.rest] : [] };
      } else if (current) {
        current.lines.push(lines[index]);
      }

      index += 1;
    }

    const tag = environment === "enumerate" ? "ol" : "ul";
    const className = environment === "description" ? "tutorial-description-list" : "tutorial-list-block";

    if (environment === "description") {
      return {
        html: `
                    <dl class="${className}">
                        ${items.map((item) => `
                        <dt>${renderInline(item.label)}</dt>
                        <dd>${renderBlocks(item.lines).html}</dd>`).join("")}
                    </dl>`,
        index
      };
    }

    return {
      html: `
                    <${tag} class="${className}">
                        ${items.map((item) => `<li>${renderBlocks(item.lines).html}</li>`).join("")}
                    </${tag}>`,
      index
    };
  };

  const renderBlocks = (linesInput) => {
    const lines = Array.isArray(linesInput) ? linesInput : String(linesInput).split(/\r?\n/);
    const html = [];
    const paragraph = [];
    let codeTitle = "";

    const flushParagraph = () => {
      const text = paragraph.join(" ").replace(/\s+/g, " ").trim();
      paragraph.length = 0;

      if (text) {
        html.push(`<p>${renderInline(text)}</p>`);
      }
    };

    for (let index = 0; index < lines.length; index += 1) {
      let line = lines[index];
      let trimmed = line.trim();

      if (!trimmed || trimmed.startsWith("%")) {
        flushParagraph();
        continue;
      }

      if (trimmed.startsWith("\\addcontentsline") || trimmed.startsWith("\\label{")) {
        continue;
      }

      if (trimmed === "\\noindent\\hrulefill" || trimmed === "\\hrulefill") {
        flushParagraph();
        html.push("<hr class=\"tutorial-rule\">");
        continue;
      }

      line = line.replace(/^\\noindent\s*/, "");
      trimmed = line.trim();

      const section = parseSectionCommand(trimmed, "section");
      if (section) {
        flushParagraph();
        html.push(`<h2>${renderInline(section.title)}</h2>`);
        if (section.rest) {
          paragraph.push(section.rest);
        }
        continue;
      }

      const subsection = parseSectionCommand(trimmed, "subsection");
      if (subsection) {
        flushParagraph();
        html.push(`<h3>${renderInline(subsection.title)}</h3>`);
        if (subsection.rest) {
          paragraph.push(subsection.rest);
        }
        continue;
      }

      const paragraphCommand = parseSectionCommand(trimmed, "paragraph");
      if (paragraphCommand) {
        flushParagraph();
        html.push(`<h4>${renderInline(paragraphCommand.title)}</h4>`);
        if (paragraphCommand.rest) {
          paragraph.push(paragraphCommand.rest);
        }
        continue;
      }

      const codeboxMatch = trimmed.match(/^\\begin\{codebox\}(?:\[(.*)\])?/);
      if (codeboxMatch) {
        flushParagraph();
        codeTitle = codeboxMatch[1] || "Python";
        continue;
      }

      if (trimmed === "\\end{codebox}") {
        codeTitle = "";
        continue;
      }

      const listingMatch = trimmed.match(/^\\begin\{lstlisting\}/);
      if (listingMatch) {
        flushParagraph();
        const { collected, index: endIndex } = collectUntil(lines, index + 1, (value) => value === "\\end{lstlisting}");
        html.push(renderCodeBlock(collected.join("\n"), codeTitle || "Python", "python"));
        index = endIndex;
        continue;
      }

      if (trimmed === "\\begin{verbatim}") {
        flushParagraph();
        const { collected, index: endIndex } = collectUntil(lines, index + 1, (value) => value === "\\end{verbatim}");
        html.push(renderCodeBlock(collected.join("\n"), "Output", "text"));
        index = endIndex;
        continue;
      }

      const mathEnvironment = trimmed.match(/^\\begin\{(equation\*?|align\*?)\}/);
      if (mathEnvironment) {
        flushParagraph();
        const environment = mathEnvironment[1];
        const { collected, index: endIndex } = collectUntil(lines, index + 1, (value) => value === `\\end{${environment}}`);
        html.push(renderDisplayMath(collected.join("\n"), environment));
        index = endIndex;
        continue;
      }

      if (trimmed === "\\[") {
        flushParagraph();
        const { collected, index: endIndex } = collectUntil(lines, index + 1, (value) => value === "\\]");
        html.push(renderDisplayMath(collected.join("\n"), "equation"));
        index = endIndex;
        continue;
      }

      const listEnvironment = trimmed.match(/^\\begin\{(itemize|enumerate|description)\}/);
      if (listEnvironment) {
        flushParagraph();
        const rendered = renderList(listEnvironment[1], lines, index);
        html.push(rendered.html);
        index = rendered.index;
        continue;
      }

      if (trimmed === "\\begin{center}") {
        flushParagraph();
        const { collected, index: endIndex } = collectUntil(lines, index + 1, (value) => value === "\\end{center}");
        html.push(renderFigure(collected));
        index = endIndex;
        continue;
      }

      const callout = trimmed.match(/^\\begin\{(aside|physinsight)\}(?:\[(.*)\])?/);
      if (callout) {
        flushParagraph();
        const environment = callout[1];
        const title = callout[2] || "";
        const { collected, index: endIndex } = collectUntil(lines, index + 1, (value) => value === `\\end{${environment}}`);
        html.push(`
                    <aside class="tutorial-callout tutorial-callout-${environment}">
                        ${title ? `<strong>${renderInline(title)}</strong>` : ""}
                        ${renderBlocks(collected).html}
                    </aside>`);
        index = endIndex;
        continue;
      }

      if (trimmed.startsWith("\\end{")) {
        flushParagraph();
        continue;
      }

      paragraph.push(line);
    }

    flushParagraph();

    return { html: html.join("\n") };
  };

  const firstSectionTitle = (tex = "") => {
    const lines = tex.split(/\r?\n/);
    for (const line of lines) {
      const section = parseSectionCommand(line.trim(), "section");
      if (section) {
        return unescapeLatexText(section.title.replace(/\$+/g, ""));
      }
    }
    return "";
  };

  return {
    renderInline,
    renderBlocks,
    firstSectionTitle,
    slugify
  };
};

module.exports = {
  createTutorialRenderer,
  labelId
};
