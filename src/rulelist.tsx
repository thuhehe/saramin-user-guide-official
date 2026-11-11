import { useEffect, useMemo, useRef, useState } from 'react'
import { RULE_COUNT, anchorId, groupAnchor, rulesByGroup, type RuleEntry, type RuleGroup } from './rules'
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
 * filter chips and a type tag on every row; on a page of 54 rules all of that
 * sat between the reader and the first rule. What survives is what a reader
 * uses: a contents list to jump with, a search box, and the rules.
 *
 * THE CONTENTS LIST IS A SIDEBAR, not a block at the top. The page is tens of
 * thousands of pixels long, so a contents list that scrolls away is one a
 * reader can only use once. On a wide screen it sits to the right and sticks;
 * narrower than that there is no room beside the text, so it falls back to the
 * block at the top — navigation that exists at every width beats navigation
 * that is prettier at one.
 *
 * NO ROW CARRIES A MARK at the moment. `Lệch` (agreed rule and running code
 * disagree) and `Chưa chốt` still render, because a register that cannot say
 * "this one is not settled" quietly turns every open question into a decision.
 * But where a rule is settled, the disagreement with the build belongs on the
 * module's Logic page next to what a reader would do about it, not as a badge
 * on a list — which is where the last few went.
 */

/** Number a group keeps wherever it is drawn, so the sidebar and the headings agree. */
function useGroupIndex() {
  const all = useMemo(() => rulesByGroup(), [])
  return useMemo(() => new Map(all.map((g, i) => [g.group, i + 1])), [all])
}

/*
 * Which section is being read. A scroll listener rather than IntersectionObserver:
 * the question is "which heading did I last pass", which is one comparison per
 * section, while an observer answers "what is on screen" and needs a second pass
 * to turn several intersecting sections back into one answer.
 */
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState('')
  const frame = useRef(0)
  useEffect(() => {
    const read = () => {
      frame.current = 0
      let found = ids[0] ?? ''
      for (const id of ids) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= 96) found = id
      }
      setActive(found)
    }
    const onScroll = () => {
      if (frame.current) return
      frame.current = requestAnimationFrame(read)
    }
    read()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [ids.join('|')])
  return active
}

/* Not smooth: the last sections are tens of thousands of pixels down, and an
   animated scroll over that reads as the page having hung. The rest of the
   site jumps too. */
function jump(e: React.MouseEvent, id: string) {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
  e.preventDefault()
  window.history.replaceState(null, '', `#${id}`)
  document.getElementById(id)?.scrollIntoView({ block: 'start' })
}

function Contents({
  groups, index, active, side,
}: { groups: RuleGroup[]; index: Map<string, number>; active: string; side?: boolean }) {
  return (
    <ol className={side ? 'mt-2 space-y-0.5' : 'mt-2.5 grid grid-cols-1 gap-x-7 gap-y-1 sm:grid-cols-2'}>
      {groups.map((g) => {
        const id = groupAnchor(g.group)
        const on = side && active === id
        return (
          <li key={g.group}>
            <a
              href={`#${id}`}
              onClick={(e) => jump(e, id)}
              aria-current={on ? 'true' : undefined}
              className={`flex items-baseline gap-2 no-underline ${
                side
                  ? `border-l-2 py-[3px] pl-2.5 pr-1 text-[12px] leading-snug transition-colors ${
                      on ? 'border-brand font-semibold text-ink' : 'border-transparent text-muted hover:border-line hover:text-ink'
                    }`
                  : 'py-0.5 text-[12.5px] text-ink/85 hover:text-brand'
              }`}
            >
              <span className={`font-mono text-[10.5px] ${on ? 'text-brand' : 'text-faint'}`}>
                {String(index.get(g.group) ?? 0).padStart(2, '0')}
              </span>
              <span className="min-w-0 flex-1 truncate">{g.group}</span>
              <span className="font-mono text-[10.5px] text-faint">{g.rules.length}</span>
            </a>
          </li>
        )
      })}
    </ol>
  )
}

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
  const index = useGroupIndex()

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
  const active = useActiveSection(groups.map((g) => groupAnchor(g.group)))

  return (
    <div className="flex gap-10">
      <div className="min-w-0 flex-1 space-y-8">
        <header>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-brand">Rule đang chạy · nghiệp vụ và as-built</p>
          <h1 className="mt-1 text-[26px] font-bold leading-tight tracking-tight">Danh sách rules</h1>
        </header>

        {/* Narrow screens have no room for the sidebar, so the contents list rides along here. */}
        <nav aria-label="Mục lục" className="border-y border-line py-4 xl:hidden">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-faint">Mục lục · {RULE_COUNT} rule</p>
          <Contents groups={groups} index={index} active={active} />
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
                {String(index.get(g.group) ?? 0).padStart(2, '0')}
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
          <span className="font-mono">saramin-vn-admin</span> nhánh <span className="font-mono">dev</span>.
          <br />
          <br />
          Rule <strong>hiển thị CV phía NTD theo từng trường hợp</strong> — rút đơn, thu hồi, xoá tài khoản, chặn công ty,
          Talent Pool — cố tình không có ở đây: BA đang chốt riêng theo hướng mới ngày 10/11 (vẫn cho NTD mở CV, che
          thông tin định danh). Phần đã chốt nằm ở trang <strong>Delete account &amp; Delete CV</strong>; chốt xong sẽ gom
          về danh sách này.
        </footer>
      </div>

      <aside className="hidden w-[196px] shrink-0 xl:block print:hidden">
        <nav aria-label="Mục lục" className="sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-faint">Mục lục · {RULE_COUNT} rule</p>
          <Contents groups={groups} index={index} active={active} side />
        </nav>
      </aside>
    </div>
  )
}

/** Same slug App.tsx builds its /logic/… addresses from. */
const slugOf = (g: string) => g.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
