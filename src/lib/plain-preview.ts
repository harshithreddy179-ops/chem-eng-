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
