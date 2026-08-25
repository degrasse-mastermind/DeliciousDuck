/**
 * Whitespace/comment stripping for the small bootstrap fragments we inline into
 * the document head.
 *
 * Those fragments have to stay inline — they set the analytics disable flag
 * before any tag is requested — but their authored formatting (indentation and
 * explanatory comments) shipped on every server-rendered page and pushed a few
 * hub pages under a healthy text-to-code ratio. This keeps the source readable
 * and the shipped bytes lean.
 *
 * Deliberately conservative: it only removes block comments, blank lines,
 * whole-line `//` comments, and per-line indentation. Newlines are preserved so
 * statement boundaries never depend on automatic semicolon insertion, and a
 * `//` inside a string literal (e.g. a `https://` URL) is left alone because
 * only lines that *start* with `//` are dropped.
 *
 * Callers must not pass source whose string literals contain the sequence
 * `/*` — the bootstrap fragments in this project do not.
 */
export function minifyInlineScript(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("//"))
    .join("\n");
}
