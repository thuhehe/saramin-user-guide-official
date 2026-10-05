/**
 * The doc's tiny inline markup: `**bold**`, `*italic*`, `` `code` ``.
 *
 * Two passes, not one alternation: bold is matched first and NON-GREEDY, then
 * its contents are re-scanned for italics. A single flat regex cannot do this —
 * `**a *b* c**` either loses the inner italic, or the italic branch eats the
 * opening stars of the bold run and the rest of the line prints its asterisks.
 * Italic carries the UI's own vocabulary throughout (status names, button
 * labels), so it sits inside bold constantly.
 *
 * Lives in its own module because every view needs it. It was copied into a
 * second file once, the copy silently lacked the italic pass, and that page
 * printed its asterisks — one owner is the fix.
 */
function mdItalic(s: string, k: number) {
  return s.split(/(\*[^*\n]+\*)/g).map((p, j) =>
    p.startsWith('*') && p.endsWith('*') && p.length > 2
      ? <i key={`${k}-${j}`} className="not-italic font-medium text-ink/90">{p.slice(1, -1)}</i>
      : p,
  )
}

export function md(s: string) {
  return s.split(/(\*\*[\s\S]+?\*\*|`[^`]+`)/g).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4)
      return <b key={i} className="font-semibold text-ink">{mdItalic(part.slice(2, -2), i)}</b>
    if (part.startsWith('`') && part.endsWith('`'))
      return <code key={i} className="font-mono text-[11.5px] text-brand">{part.slice(1, -1)}</code>
    return mdItalic(part, i)
  })
}
