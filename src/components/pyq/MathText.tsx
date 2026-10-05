import katex from "katex";
import { Fragment } from "react";
import { cn } from "@/lib/utils";

/**
 * Renders plain text with LaTeX math:
 *   inline  — $E = mc^2$
 *   display — $$\int_0^1 x\,dx$$
 * Blank lines separate paragraphs; single newlines become line breaks.
 * Rendered on the server — no KaTeX JavaScript is shipped to the client.
 */
const MATH = /(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$)/g;

function renderMath(src: string, display: boolean) {
  return katex.renderToString(src, {
    displayMode: display,
    throwOnError: false,
    strict: "ignore",
    trust: false,
    output: "htmlAndMathml",
  });
}

function Line({ text }: { text: string }) {
  const parts = text.split(MATH);
  return (
    <>
      {parts.map((part, i) => {
        if (!part) return null;
        if (part.startsWith("$$") && part.endsWith("$$") && part.length > 4) {
          return <span key={i} dangerouslySetInnerHTML={{ __html: renderMath(part.slice(2, -2), true) }} />;
        }
        if (part.startsWith("$") && part.endsWith("$") && part.length > 2) {
          return <span key={i} dangerouslySetInnerHTML={{ __html: renderMath(part.slice(1, -1), false) }} />;
        }
        const lines = part.split("\n");
        return (
          <Fragment key={i}>
            {lines.map((l, j) => (
              <Fragment key={j}>
                {j > 0 && <br />}
                {l}
              </Fragment>
            ))}
          </Fragment>
        );
      })}
    </>
  );
}

export function MathText({ text, className }: { text: string; className?: string }) {
  const paragraphs = text.replace(/\r\n/g, "\n").trim().split(/\n{2,}/);
  return (
    <div className={cn("prose-archive", className)}>
      {paragraphs.map((p, i) => (
        <p key={i}>
          <Line text={p} />
        </p>
      ))}
    </div>
  );
}

/** Plain-text preview of a question (math collapsed), for lists. */
export function plainPreview(text: string, max = 160) {
  const plain = text
    .replace(/\$\$([\s\S]+?)\$\$/g, " $1 ")
    .replace(/\$([^$\n]+?)\$/g, "$1")
    .replace(/\\[a-zA-Z]+/g, "")
    .replace(/[{}^_]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return plain.length > max ? `${plain.slice(0, max).trimEnd()}…` : plain;
}
