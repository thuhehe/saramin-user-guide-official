import { useMemo, useState } from 'react'
import { RULE_CATS, RULE_COUNT, anchorId, type RuleEntry, type RuleKind } from './rules'
import { md } from './md'

/*
 * Danh sách rules — the page.
 *
 * Reads as a register, not a dashboard: one line per rule, a short paragraph
 * under it, and a link into the module page that carries the detail. The filter
 * exists because the two audiences want different halves — the client reads the
 * nghiệp vụ rules to check what was agreed, CS and QA read the as-built ones to
 * answer a customer today.
 *
 * A `lech` rule prints the disagreement instead of picking a side. That is the
 * whole point of the page: the last round of confusion came from a register that
 * stated an unresolved rule as if it were settled.
 */

const KIND: Record<RuleKind, { label: string; cls: string }> = {
  nv: { label: 'Nghiệp vụ', cls: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' },
  ab: { label: 'As-built', cls: 'bg-violet-50 text-violet-700 ring-violet-600/20' },
  both: { label: 'Nghiệp vụ', cls: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' },
  lech: { label: 'Lệch', cls: 'bg-rose-50 text-rose-700 ring-rose-600/20' },
  mo: { label: 'Chưa chốt', cls: 'bg-amber-50 text-amber-800 ring-amber-600/20' },
}

type Filter = 'all' | 'nv' | 'ab' | 'lech'

const matches = (r: RuleEntry, f: Filter) =>
  f === 'all' ? true
  : f === 'nv' ? r.kind === 'nv' || r.kind === 'both'
  : f === 'ab' ? r.kind === 'ab' || r.kind === 'both'
  : r.kind === 'lech'

function Tag({ kind }: { kind: RuleKind }) {
  const k = KIND[kind]
  return (
    <span className={`shrink-0 rounded px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-wider ring-1 ring-inset ${k.cls}`}>
      {k.label}
    </span>
  )
}

export function RuleList({ onOpen }: { onOpen: (group: string, anchor: string) => void }) {
  const [f, setF] = useState<Filter>('all')
  const [q, setQ] = useState('')

  const cats = useMemo(() => {
    const t = q.trim().toLowerCase()
    return RULE_CATS.map((c) => ({
      ...c,
      rules: c.rules.filter(
        (r) =>
          matches(r, f) &&
          (!t || [r.title, r.summary, r.conflict ?? '', r.group, r.src, c.title].join(' ').toLowerCase().includes(t)),
      ),
    })).filter((c) => c.rules.length)
  }, [f, q])

  const shown = cats.reduce((n, c) => n + c.rules.length, 0)
  const counts = useMemo(() => {
    const all = RULE_CATS.flatMap((c) => c.rules)
    return {
      nv: all.filter((r) => r.kind === 'nv' || r.kind === 'both').length,
      ab: all.filter((r) => r.kind === 'ab' || r.kind === 'both').length,
      lech: all.filter((r) => r.kind === 'lech').length,
      mo: all.filter((r) => r.kind === 'mo').length,
    }
  }, [])

  return (
    <div className="space-y-9">
      <header>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-brand">Rule đang chạy · nghiệp vụ và as-built</p>
        <h1 className="mt-1 text-[26px] font-bold leading-tight tracking-tight">Danh sách rules</h1>
        <p className="mt-2 max-w-[74ch] text-[13.5px] leading-[1.75] text-ink/75">
          <strong>{RULE_COUNT} rule</strong> hệ thống đang chạy, gom thành <strong>{RULE_CATS.length} nhóm</strong>.
          Mỗi dòng là một rule kèm vài dòng tóm tắt đủ để giải quyết một tranh luận; bấm <em>Xem chi tiết</em> để
          sang trang Logic của module tương ứng, nơi có đầy đủ ngoại lệ, mã lỗi và ngày thay đổi.
        </p>
        <p className="mt-2 max-w-[74ch] text-[13px] leading-[1.7] text-ink/70">
          Hai loại rule đều nằm ở đây. <strong>Nghiệp vụ</strong> là điều hai bên đã thoả thuận — đổi thì phải báo
          và chốt lại. <strong>As-built</strong> là điều code đang làm, thường chưa từng trao đổi với ai, nhưng vẫn
          là thứ CS gặp mỗi ngày. Chỗ nào hai bên đang nói khác nhau thì đánh dấu <strong>Lệch</strong> và ghi rõ
          mỗi bên đang hiểu thế nào, thay vì chọn bừa một bên.
        </p>
      </header>

      <div className="sticky top-0 z-10 -mx-1 border-b border-line bg-canvas/95 px-1 py-2.5 backdrop-blur print:hidden">
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm rule…"
            className="min-w-0 flex-1 rounded-md border border-line bg-surface px-2.5 py-1.5 text-[12.5px] placeholder:text-faint focus:border-brand focus:outline-none"
          />
          {([
            ['all', `Tất cả ${RULE_COUNT}`],
            ['nv', `Nghiệp vụ ${counts.nv}`],
            ['ab', `As-built ${counts.ab}`],
            ['lech', `Lệch ${counts.lech}`],
          ] as [Filter, string][]).map(([k, label]) => (
            <button
              key={k}
              onClick={() => setF(k)}
              aria-pressed={f === k}
              className={`rounded-full border px-2.5 py-1 text-[11.5px] transition-colors ${
                f === k ? 'border-ink bg-ink text-canvas' : 'border-line bg-surface text-muted hover:border-line-soft hover:text-ink'
              }`}
            >
              {label}
            </button>
          ))}
          <span className="ml-auto font-mono text-[11px] text-faint">{shown}/{RULE_COUNT}</span>
        </div>
      </div>

      {!cats.length && <p className="py-10 text-[13px] text-faint">Không có rule nào khớp.</p>}

      {cats.map((c, ci) => (
        <section key={c.title}>
          <div className="flex items-baseline gap-2.5 border-b-2 border-ink pb-1.5">
            <span className="font-mono text-[11px] font-bold text-brand">{String(RULE_CATS.indexOf(RULE_CATS[ci]) + 1).padStart(2, '0')}</span>
            <h2 className="text-[17px] font-bold tracking-tight">{c.title}</h2>
            <span className="ml-auto font-mono text-[10.5px] text-faint">{c.rules.length} rule</span>
          </div>
          {c.note && <p className="mt-2 max-w-[74ch] text-[12.5px] leading-[1.65] text-muted">{c.note}</p>}

          <ul className="mt-1">
            {c.rules.map((r) => (
              <li key={r.title} className="border-b border-line-soft py-4 last:border-0">
                <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                  <h3 className="min-w-0 flex-1 text-[14px] font-semibold leading-snug">{md(r.title)}</h3>
                  <Tag kind={r.kind} />
                  {r.kind === 'both' && <Tag kind="ab" />}
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
                    Xem chi tiết → {r.group}
                  </a>
                  <span className="text-[11px] text-faint">{r.src}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <footer className="border-t border-line pt-4 text-[11.5px] leading-[1.7] text-faint">
        Rule nghiệp vụ lấy từ spec site và kênh Slack #saramin_testing (07/09–10/11/2026); rule as-built đối chiếu
        trực tiếp với mã nguồn <span className="font-mono">svn-be</span>, <span className="font-mono">svn-web</span>,{' '}
        <span className="font-mono">saramin-vn-admin</span> nhánh <span className="font-mono">dev</span>. Mỗi rule
        đánh dấu <strong>Lệch</strong> cần một câu trả lời bằng văn bản trước khi dev đi tiếp.
      </footer>
    </div>
  )
}

/** Same slug App.tsx builds its /logic/… addresses from. */
const slugOf = (g: string) => g.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
