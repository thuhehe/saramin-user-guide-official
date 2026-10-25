/*
 * Screenshot one admin screen in the browser opened by scripts/browser.mjs.
 *
 *   node scripts/shot.mjs <path|-> <out.jpg|-> [step ...]
 *   node scripts/shot.mjs --text [chars]      # dump the current page's text
 *   node scripts/shot.mjs --eval '<js expr>'  # evaluate in the page, print the result
 *
 * Steps run in order before the shot:
 *   click:<text>   first visible element containing the text
 *   exact:<text>   first visible element whose text is exactly this
 *   css:<sel>      first visible element matching the selector
 *   row:<n>        the n-th table body row (1-based)
 *   fill:<css>|<text>  type into a field and press Enter
 *   wait:<ms> · scroll:<px> (innermost scroller, dialog first) · js:<code> · full
 * Path "-" keeps the current page; out "-" takes no picture.
 */
const [, , a, b, ...steps] = process.argv
const job = a === '--eval' ? { eval: b } : a === '--text' ? { text: Number(b ?? 4000) } : { path: a, out: b === '-' ? null : b && new URL(b, 'file://' + process.cwd() + '/').pathname, steps }
const r = await fetch(`http://127.0.0.1:${process.env.PW_PORT ?? 9334}`, { method: 'POST', body: JSON.stringify(job) })
console.log(await r.text())
