import { useMemo, useState } from 'react'
import PAGES from './pages.json'
import { WORKFLOW, adminUrl } from './handbook'
import type { WfBlock, WfSection } from './handbook'

/* ── Saramin Admin — cẩm nang toàn bộ hệ thống ────────────────────────────────
   A site of its own, deliberately NOT a page on the requirement site. The two
   answer opposite questions: the requirement says what SHOULD be built and is
   read by a BA, this says what IS built and is read by whoever has to operate it
   tomorrow. Sharing a site would have meant sharing a nav, and a Sales operator
   scrolling past forty module specs to find the one screen they need is how a
   handbook stops being opened.

   TWO HALVES, ONE SOURCE.
     · Toàn bộ trang — every page the console serves, generated from the build's
       own `navigation.config.tsx` + `route-paths.ts` rather than retyped, so the
       inventory cannot quietly disagree with the app it describes.
     · Cẩm nang — the operating knowledge that no page inventory can carry: what
       the words mean, which order things happen in, and the rules that cause
       every support call when unknown.

   The Sales / Developer switch filters blocks rather than swapping documents.
   Two documents drift, and the rule they disagree on is always the one that
   mattered. */

type Page = {
  group: string
  key: string
  label: string
  path: string
  perm: string
  flag: string
  what: string
  sub: string[]
}
const ALL = PAGES as Page[]

/** Admin sidebar order, as the console itself renders it. */
const GROUP_ORDER = [
  'Analytics', 'Recruitment', 'Resume Management', 'User',
  'Products & Packages', 'Call center', 'CRM', 'Content', 'System',
]

/** Handbook deep-dives, shown inside the admin group they belong to. */
const DEEP_DIVES: Record<string, string[]> = {
  Analytics: ['dashboard'],
  Recruitment: ['jobs', 'applicants'],
  User: ['jobseeker-users'],
  'Products & Packages': ['products-quota'],
  CRM: ['companies', 'bao-gia', 'claim'],
}
const GUIDE_IDS = ['tu-dien', 'chuoi', 'quyen']
const sec = (id: string) => WORKFLOW.sections.find((s) => s.id === id)

export function App() {
  const [dev, setDev] = useState(false)
  const [q, setQ] = useState('')
  const [active, setActive] = useState('tong-quan')

  const hits = useMemo(() => {
    const t = q.trim().toLowerCase()
    if (!t) return null
    return ALL.filter((p) =>
      [p.label, p.path, p.perm, p.what, p.group, ...p.sub].join(' ').toLowerCase().includes(t),
    )
  }, [q])

  const go = (id: string) => {
    setActive(id)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <div className="mx-auto flex max-w-[1500px] gap-6 px-4 py-4 print:block">
        {/* ── rail ─────────────────────────────────────────────────────────── */}
        <aside className="sticky top-4 hidden h-[calc(100vh-2rem)] w-[248px] shrink-0 overflow-y-auto rounded-2xl bg-[#0f2744] p-3 text-white/90 lg:block print:hidden">
          <div className="px-2 pb-3 pt-1">
            <p className="flex items-center gap-2 text-[14px] font-bold text-white">
              <span className="grid h-6 w-6 place-items-center rounded bg-amber-400 text-[12px] font-black text-[#0f2744]">S</span>
              Saramin Admin
            </p>
            <p className="mt-0.5 pl-8 text-[11px] text-white/55">{dev ? 'Bản Developer' : 'Bản Sales & nghiệp vụ'}</p>
          </div>

          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm trang, đường dẫn, quyền…"
            className="mb-3 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-[12px] text-white placeholder:text-white/40 focus:border-white/40 focus:outline-none"
          />

          <RailItem label="Tổng quan" code="TQ" on={active === 'tong-quan'} onClick={() => go('tong-quan')} />

          <RailGroup label="Cẩm nang" />
          {GUIDE_IDS.map((id) => {
            const s = sec(id)
            return s ? <RailItem key={id} label={s.label} code={s.code} on={active === id} onClick={() => go(id)} /> : null
          })}

          <RailGroup label={`Toàn bộ trang · ${ALL.length}`} />
          {GROUP_ORDER.map((g) => {
            const n = ALL.filter((p) => p.group === g).length
            if (!n) return null
            return <RailItem key={g} label={g} code={String(n)} on={active === `g-${g}`} onClick={() => go(`g-${g}`)} />
          })}

          <RailGroup label="Quản trị" />
          <RailItem label="Điểm cần xác nhận" code="?" on={active === 'can-xac-nhan'} onClick={() => go('can-xac-nhan')} />
        </aside>

        {/* ── page ─────────────────────────────────────────────────────────── */}
        <main className="min-w-0 flex-1">
          <header id="tong-quan" className="scroll-mt-4">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-brand">Cẩm nang hệ thống</p>
                <h1 className="mt-1 max-w-[20ch] text-[34px] font-bold leading-[1.1] tracking-tight">
                  Saramin Admin — toàn bộ trang và quy trình
                </h1>
              </div>
              <div className="flex flex-wrap items-center gap-2 print:hidden">
                <button
                  onClick={() => setDev((v) => !v)}
                  className={cx('rounded-lg px-3 py-2 text-[12.5px] font-semibold transition-opacity',
                    dev ? 'bg-ink text-white' : 'bg-[#0f2744] text-white hover:opacity-90')}
                >
                  {dev ? '← Về bản Sales' : 'Xem bản Developer'}
                </button>
                <button onClick={() => window.print()} className="rounded-lg border border-line bg-surface px-3 py-2 text-[12.5px] font-medium text-muted hover:border-ink/40">In / Lưu PDF</button>
              </div>
            </div>

            <p className="mb-4 max-w-[80ch] text-[14px] leading-relaxed text-ink/75">
              Trang này liệt kê <b>toàn bộ {ALL.length} trang</b> trong {GROUP_ORDER.length} nhóm của Admin console, kèm
              đường dẫn thật, quyền cần có và trang đó dùng để làm gì — cộng với phần cẩm nang giải thích cách các module
              nối vào nhau. Danh sách trang được sinh thẳng từ code của build, không gõ tay.
            </p>

            <div className="mb-4 grid gap-3 md:grid-cols-3">
              {WORKFLOW.quick.map((c) => (
                <div key={c.q} className="rounded-xl border border-line bg-surface p-4">
                  <p className="text-[13.5px] font-bold text-ink">{c.q}</p>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted">{c.a}</p>
                </div>
              ))}
            </div>

            <div className="mb-4 rounded-xl bg-gradient-to-r from-[#0f4c8a] to-[#1466b8] px-5 py-4 text-white">
              <p className="text-[14px] font-bold">{WORKFLOW.keyFact.heading}</p>
              <p className="mt-1.5 max-w-[88ch] text-[13px] leading-relaxed text-white/90">{WORKFLOW.keyFact.text}</p>
            </div>

            <div className="mb-6 flex flex-wrap gap-2 print:hidden">
              <a href={adminUrl('/')} target="_blank" rel="noreferrer" className="rounded-lg bg-brand px-3.5 py-2 text-[12.5px] font-semibold text-white hover:opacity-90">Mở Admin console ↗</a>
              {WORKFLOW.links.map((l) => (
                <a key={l.path} href={adminUrl(l.path)} target="_blank" rel="noreferrer" className="rounded-lg border border-line bg-surface px-3.5 py-2 text-[12.5px] font-medium text-ink/80 hover:border-brand hover:text-brand">{l.label} ↗</a>
              ))}
            </div>
          </header>

          {/* search short-circuits the whole document */}
          {hits ? (
            <section>
              <p className="mb-3 text-[13px] text-muted">
                <b className="text-ink">{hits.length}</b> trang khớp “{q}”.
                <button onClick={() => setQ('')} className="ml-2 text-brand hover:underline">Xoá tìm kiếm</button>
              </p>
              <div className="grid gap-2.5">{hits.map((p) => <PageCard key={p.key} p={p} dev={dev} />)}</div>
            </section>
          ) : (
            <>
              {GUIDE_IDS.map((id) => {
                const s = sec(id)
                return s ? <Section key={id} s={s} dev={dev} /> : null
              })}

              {GROUP_ORDER.map((g) => {
                const pages = ALL.filter((p) => p.group === g)
                if (!pages.length) return null
                return (
                  <section key={g} id={`g-${g}`} className="mb-8 scroll-mt-4">
                    <div className="mb-3 flex flex-wrap items-baseline gap-2 border-b-2 border-line pb-2">
                      <h2 className="text-[20px] font-bold tracking-tight text-ink">{g}</h2>
                      <span className="text-[12px] text-faint">{pages.length} trang</span>
                    </div>
                    <div className="grid gap-2.5">{pages.map((p) => <PageCard key={p.key} p={p} dev={dev} />)}</div>
                    {(DEEP_DIVES[g] ?? []).map((id) => {
                      const s = sec(id)
                      return s ? <div key={id} className="mt-3"><Section s={s} dev={dev} nested /></div> : null
                    })}
                  </section>
                )
              })}

              {(() => { const s = sec('can-xac-nhan'); return s ? <Section s={s} dev={dev} /> : null })()}
            </>
          )}

          <p className="mt-8 border-t border-line pt-3 text-[11px] leading-relaxed text-faint">
            Danh sách trang sinh từ <span className="font-mono">saramin-vn-admin</span> ·{' '}
            <span className="font-mono">src/configs/navigation.config.tsx</span> +{' '}
            <span className="font-mono">route-paths.ts</span>. Nội dung cẩm nang từ{' '}
            <span className="font-mono">docs/business-logic.md</span> và{' '}
            <span className="font-mono">docs/qa/tester-guide</span>. Console đang mô tả:{' '}
            <a href={adminUrl('/')} target="_blank" rel="noreferrer" className="text-brand hover:underline">dev.admin-svn.topdev.asia</a>.
            Build đổi thì trang này là thứ cũ đi trước.
          </p>
        </main>
      </div>
    </div>
  )
}

/* ── inventory ──────────────────────────────────────────────────────────────── */

/* One page of the console. The path is a live link rather than text: a reader who
   has found the row almost always wants the screen, and making them retype a path
   is the difference between a reference that gets used and one that gets skimmed. */
function PageCard({ p, dev }: { p: Page; dev: boolean }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-3.5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <a
          href={adminUrl(p.path)}
          target="_blank"
          rel="noreferrer"
          className="text-[14px] font-bold text-ink hover:text-brand hover:underline"
        >
          {p.label} <span className="text-[11px] font-normal text-faint">↗</span>
        </a>
        <code className="font-mono text-[11px] text-muted">{p.path}</code>
      </div>

      {p.what && <p className="mt-1 max-w-[86ch] text-[12.5px] leading-relaxed text-ink/75">{md(p.what)}</p>}

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {p.perm ? (
          <Tag title="Quyền cần có để thấy trang này">🔒 {p.perm}</Tag>
        ) : (
          <Tag title="Không gắn quyền riêng — ai đăng nhập cũng thấy">🔓 không gắn quyền</Tag>
        )}
        {dev && p.flag && <Tag title="Tắt cờ này trong modules.config.ts thì trang biến mất">flag: {p.flag}</Tag>}
        {p.sub.length > 0 && (
          <span className="text-[11px] text-faint">
            + {p.sub.length} trang con:{' '}
            {p.sub.map((s, i) => (
              <span key={s}>
                {i > 0 && ' · '}
                <code className="font-mono text-[10.5px] text-muted">{s}</code>
              </span>
            ))}
          </span>
        )}
      </div>
    </div>
  )
}

function Tag({ children, title }: { children: React.ReactNode; title?: string }) {
  return (
    <span title={title} className="rounded border border-line bg-canvas px-1.5 py-0.5 font-mono text-[10.5px] text-muted">
      {children}
    </span>
  )
}

/* ── handbook ───────────────────────────────────────────────────────────────── */

function Section({ s, dev, nested }: { s: WfSection; dev: boolean; nested?: boolean }) {
  const [open, setOpen] = useState(!nested)
  const blocks = s.blocks.filter((b) => dev || !b.dev)
  return (
    <section id={s.id} className={cx('mb-4 scroll-mt-4 overflow-hidden rounded-2xl border bg-surface', nested ? 'border-brand/25' : 'border-line')}>
      <button onClick={() => setOpen((v) => !v)} className="flex w-full items-start gap-3 px-5 py-3.5 text-left hover:bg-canvas/40">
        <span className="mt-0.5 grid h-6 w-7 shrink-0 place-items-center rounded bg-brand-soft text-[10px] font-bold text-brand">{s.code}</span>
        <span className="min-w-0 flex-1">
          <span className="block text-[16px] font-bold tracking-tight text-ink">{s.title}</span>
          {s.where && <span className="mt-0.5 block font-mono text-[11px] text-faint">{s.where}</span>}
        </span>
        <span className="shrink-0 pt-1 text-[12px] text-muted">{open ? '▾' : '▸'}</span>
      </button>
      {open && (
        <div className="space-y-3.5 border-t border-line-soft px-5 py-4">
          {s.lead && <p className="max-w-[82ch] text-[13px] leading-relaxed text-ink/75">{s.lead}</p>}
          {blocks.map((b, i) => <Block key={i} b={b} />)}
        </div>
      )}
    </section>
  )
}

function Block({ b }: { b: WfBlock }) {
  /* A dev block keeps its marker even in the Developer view — someone who has
     just switched needs to see WHICH parts appeared, not a page that silently
     got longer. */
  const tag = b.dev && (
    <span className="mb-1 inline-block rounded border border-ink/20 bg-ink/5 px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-wide text-ink/50">Developer</span>
  )

  if (b.kind === 'p') return <div>{tag}<p className="max-w-[82ch] text-[13px] leading-relaxed text-ink/75">{md(b.text)}</p></div>

  if (b.kind === 'steps') {
    return (
      <div>
        {tag}
        {b.heading && <p className="mb-1.5 text-[13px] font-bold text-ink">{b.heading}</p>}
        <ol className="space-y-1.5">
          {b.items.map((it, i) => (
            <li key={i} className="flex gap-2.5 text-[13px] leading-relaxed text-ink/80">
              <span className="mt-0.5 grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full bg-brand-soft text-[10px] font-bold text-brand">{i + 1}</span>
              <span className="min-w-0">{md(it)}</span>
            </li>
          ))}
        </ol>
      </div>
    )
  }

  if (b.kind === 'table') {
    return (
      <div>
        {tag}
        {b.heading && <p className="mb-1 text-[13px] font-bold text-ink">{b.heading}</p>}
        {b.note && <p className="mb-1.5 text-[12px] text-muted">{b.note}</p>}
        <div className="overflow-x-auto rounded-xl border border-line">
          <table className="w-full min-w-[560px] border-collapse text-left">
            <thead>
              <tr className="bg-canvas/60">
                {b.table.cols.map((c) => (
                  <th key={c} className="border-b border-line px-3 py-2 text-[10.5px] font-semibold uppercase tracking-wide text-muted">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {b.table.rows.map((r, i) => (
                <tr key={i} className="border-b border-line-soft last:border-0">
                  {r.map((cell, j) => (
                    <td key={j} className={cx('px-3 py-2 align-top text-[12.5px] leading-relaxed', j === 0 ? 'font-medium text-ink' : 'text-ink/75')}>{md(cell)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  if (b.kind === 'warn') {
    return (
      <p className="flex gap-2 rounded-lg bg-amber-50 px-3.5 py-2.5 text-[12.5px] leading-relaxed text-amber-900">
        <span className="shrink-0">⚠️</span><span>{tag}{md(b.text)}</span>
      </p>
    )
  }

  return (
    <div className="flex flex-wrap gap-2">
      {b.items.map((l) => (
        <a key={l.path} href={adminUrl(l.path)} target="_blank" rel="noreferrer"
           className="rounded-lg border border-line px-3 py-1.5 text-[12px] font-medium text-muted hover:border-brand hover:text-brand">
          {l.label} <span className="font-mono text-[10.5px] text-faint">{l.path}</span> ↗
        </a>
      ))}
    </div>
  )
}

/* ── bits ───────────────────────────────────────────────────────────────────── */

function RailGroup({ label }: { label: string }) {
  return <p className="px-2 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-widest text-white/40">{label}</p>
}

function RailItem({ label, code, on, onClick }: { label: string; code: string; on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cx('flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-[12.5px] transition-colors',
        on ? 'bg-white/15 font-medium text-white' : 'text-white/75 hover:bg-white/10')}
    >
      <span className="w-6 shrink-0 text-[10px] font-bold text-amber-300">{code}</span>
      <span className="min-w-0 truncate">{label}</span>
    </button>
  )
}

/** **bold** and `code` only — enough to mark a field name, not enough to invite prose. */
function md(s: string) {
  return s.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) return <b key={i} className="font-semibold text-ink">{part.slice(2, -2)}</b>
    if (part.startsWith('`') && part.endsWith('`')) return <code key={i} className="rounded bg-canvas px-1 py-0.5 font-mono text-[11.5px] text-ink/80">{part.slice(1, -1)}</code>
    return part
  })
}

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(' ')
