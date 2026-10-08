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

const isDisplay = (p?: string) => Boolean(p && p.startsWith("$$") && p.endsWith("$$") && p.length > 4);

function Line({ text }: { text: string }) {
  const parts = text.split(MATH);
  return (
    <>
      {parts.map((part, i) => {
        if (!part) return null;
        // A bare line break next to display maths would add an empty line;
        // the display block already starts on its own line.
        if (!part.trim() && (isDisplay(parts[i - 1]) || isDisplay(parts[i + 1]))) return null;
        if (part.startsWith("$$") && part.endsWith("$$") && part.length > 4) {
          return <span key={i} dangerouslySetInnerHTML={{ __html: renderMath(part.slice(2, -2), true) }} />;
        }
        if (part.startsWith("$") && part.endsWith("$") && part.length > 2) {
          return <span key={i} dangerouslySetInnerHTML={{ __html: renderMath(part.slice(1, -1), false) }} />;
        }
        let body = part;
        if (isDisplay(parts[i + 1])) body = body.replace(/\n+$/, "");
        if (isDisplay(parts[i - 1])) body = body.replace(/^\n+/, "");
        const lines = body.split("\n");
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

export { plainPreview } from "@/lib/plain-preview";
