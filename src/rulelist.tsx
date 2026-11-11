import { useMemo, useState } from 'react'
import { RULE_COUNT, anchorId, groupAnchor, rulesByGroup, type RuleEntry } from './rules'
import { md } from './md'

/*
 * Danh sách rules — the page.
 *
 * Grouped by MODULE, in rail order. The register is authored by theme (see
 * rules.ts) but read by screen: someone opens it with a question about a job
 * or an invoice, not about "vòng đời & trạng thái", and the detail for every
 * rule already sits on that module's Logic page.
 *
 * Deliberately plain. An earlier pass carried two paragraphs of preamble, four
 * filter chips and a type tag on every row; on a page of 56 rules all of that
 * sat between the reader and the first rule. What survives is what a reader
 * uses: a contents list to jump with, a search box, and the rules.
 *
 * The one mark left on a row is `Lệch` — where the agreed rule and the running
 * code say different things. That is not decoration, it is the reason several
 * of these rules are on the page at all, so it stays visible and the
 * disagreement is printed in full rather than resolved by guesswork.
 */

function RuleRow({ r, onOpen }: { r: RuleEntry; onOpen: (group: string, anchor: string) => void }) {
  return (
    <li className="border-b border-line-soft py-4 last:border-0">
      <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
        <h3 className="min-w-0 flex-1 text-[14px] font-semibold leading-snug">{md(r.title)}</h3>
        {r.kind === 'lech' && (
          <span className="shrink-0 rounded bg-rose-50 px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-wider text-rose-700 ring-1 ring-inset ring-rose-600/20">
            Lệch
          </span>
        )}
        {r.kind === 'mo' && (
          <span className="shrink-0 rounded bg-amber-50 px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-wider text-amber-800 ring-1 ring-inset ring-amber-600/20">
            Chưa chốt
          </span>
        )}
      </div>

      <p className="mt-1.5 max-w-[78ch] text-[13px] leading-[1.75] text-ink/80">{md(r.summary)}</p>

      {r.conflict && (
        <p className="mt-2 max-w-[78ch] border-l-2 border-rose-500/70 bg-rose-50/60 py-2 pl-4 pr-4 text-[12.5px] leading-[1.7] text-ink/80">
          <span className="mr-1.5 font-mono text-[9.5px] uppercase tracking-wider text-rose-700">đang lệch</span>
          {md(r.conflict)}
        </p>
      )}

      <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <a
          href={`/logic/${slugOf(r.group)}#${anchorId(r.heading)}`}
          onClick={(e) => {
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
            e.preventDefault()
            onOpen(r.group, anchorId(r.heading))
          }}
          className="text-[12px] font-medium text-brand no-underline hover:underline"
        >
          Xem chi tiết →
        </a>
        <span className="text-[11px] text-faint">{r.src}</span>
      </div>
    </li>
  )
}

export function RuleList({ onOpen }: { onOpen: (group: string, anchor: string) => void }) {
  const [q, setQ] = useState('')

  const groups = useMemo(() => {
    const t = q.trim().toLowerCase()
    if (!t) return rulesByGroup()
    return rulesByGroup()
      .map((g) => ({
        ...g,
        rules: g.rules.filter((r) =>
          [r.title, r.summary, r.conflict ?? '', r.group, r.src].join(' ').toLowerCase().includes(t),
        ),
      }))
      .filter((g) => g.rules.length)
  }, [q])

  const shown = groups.reduce((n, g) => n + g.rules.length, 0)
  const full = useMemo(() => rulesByGroup(), [])

  /* A contents entry scrolls rather than navigates: the section is on this very
     page. The hash goes in too, so the address bar can be copied and the entry
     keeps working as a real link for ⌘-click. */
  const jump = (e: React.MouseEvent, id: string) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
    e.preventDefault()
    window.history.replaceState(null, '', `#${id}`)
    /* Not smooth: the page is long enough that the last entries are tens of
       thousands of pixels down, and an animated scroll over that distance reads
       as the page having hung. The rest of the site jumps too. */
    document.getElementById(id)?.scrollIntoView({ block: 'start' })
  }

  return (
    <div className="space-y-8">
      <header>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-brand">Rule đang chạy · nghiệp vụ và as-built</p>
        <h1 className="mt-1 text-[26px] font-bold leading-tight tracking-tight">Danh sách rules</h1>
      </header>

      <nav aria-label="Mục lục" className="border-y border-line py-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-faint">Mục lục · {RULE_COUNT} rule</p>
        <ol className="mt-2.5 grid grid-cols-1 gap-x-7 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
          {full.map((g, i) => (
            <li key={g.group}>
              <a
                href={`#${groupAnchor(g.group)}`}
                onClick={(e) => jump(e, groupAnchor(g.group))}
                className="flex items-baseline gap-2 py-0.5 text-[12.5px] text-ink/85 no-underline hover:text-brand"
              >
                <span className="font-mono text-[10.5px] text-faint">{String(i + 1).padStart(2, '0')}</span>
                <span className="min-w-0 flex-1 truncate">{g.group}</span>
                <span className="font-mono text-[10.5px] text-faint">{g.rules.length}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="flex flex-wrap items-center gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Tìm rule…"
          className="min-w-0 flex-1 rounded-md border border-line bg-surface px-2.5 py-1.5 text-[12.5px] placeholder:text-faint focus:border-brand focus:outline-none"
        />
        {q && <span className="font-mono text-[11px] text-faint">{shown}/{RULE_COUNT}</span>}
      </div>

      {!groups.length && <p className="py-10 text-[13px] text-faint">Không có rule nào khớp.</p>}

      {groups.map((g) => (
        <section key={g.group} id={groupAnchor(g.group)} className="scroll-mt-6">
          <div className="flex items-baseline gap-2.5 border-b-2 border-ink pb-1.5">
            <span className="font-mono text-[11px] font-bold text-brand">
              {String(full.findIndex((x) => x.group === g.group) + 1).padStart(2, '0')}
            </span>
            <h2 className="text-[17px] font-bold tracking-tight">{g.group}</h2>
            <span className="ml-auto font-mono text-[10.5px] text-faint">{g.rules.length} rule</span>
          </div>
          <ul className="mt-1">
            {g.rules.map((r) => <RuleRow key={r.title} r={r} onOpen={onOpen} />)}
          </ul>
        </section>
      ))}

      <footer className="border-t border-line pt-4 text-[11.5px] leading-[1.7] text-faint">
        Rule nghiệp vụ lấy từ spec site và kênh Slack #saramin_testing (07/09–10/11/2026); rule as-built đối chiếu
        trực tiếp với mã nguồn <span className="font-mono">svn-be</span>, <span className="font-mono">svn-web</span>,{' '}
        <span className="font-mono">saramin-vn-admin</span> nhánh <span className="font-mono">dev</span>. Mỗi rule
        đánh dấu <strong>Lệch</strong> cần một câu trả lời bằng văn bản trước khi dev đi tiếp.
        <br />
        <br />
        Rule <strong>hiển thị CV phía NTD theo từng trường hợp</strong> — rút đơn, thu hồi, xoá tài khoản, chặn công ty,
        Talent Pool — cố tình không có ở đây: BA đang chốt riêng theo hướng mới ngày 10/11 (vẫn cho NTD mở CV, che
        thông tin định danh). Phần đã chốt nằm ở trang <strong>Delete account &amp; Delete CV</strong>; chốt xong sẽ gom
        về danh sách này.
      </footer>
    </div>
  )
}

/** Same slug App.tsx builds its /logic/… addresses from. */
const slugOf = (g: string) => g.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
