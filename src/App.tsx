import { useEffect, useMemo, useState } from 'react'
import PAGES from './pages.json'
import { WORKFLOW, adminUrl } from './handbook'
import type { WfBlock, WfSection } from './handbook'
import { MODULE_DOCS, PAGE_DOCS } from './docs'
import type { DocBlock } from './docs'
import { OverviewFlow } from './overview'
import { DIAGRAMS } from './flows'
import { DemoPlan } from './demo'
import { TestPlan } from './testplan'
import { md } from './md'

/* ── Saramin Admin — cẩm nang toàn bộ hệ thống ────────────────────────────────
   A site of its own, not a page on the requirement site. The requirement says
   what SHOULD be built and is read by a BA; this says what IS built and is read
   by whoever has to operate it tomorrow.

   THE RAIL IS THE CONSOLE'S OWN MENU. Every page the admin serves is listed, in
   the admin's own grouping and order, and selecting one shows that page alone.
   A single scrolling document would have meant an operator who needs one screen
   scrolling past fifty — and the thing they came for is always a specific screen.

   LOGIC LIVES AT THE LEVEL IT GOVERNS. A rule about one screen sits on that
   screen; a rule that governs five sits once, at the top of the module, as its
   own menu entry. Repeating "hoá đơn Issued mới cấp quota" on Quotations,
   Purchase order and Invoice would be three places to update and two chances to
   disagree.

   The inventory is generated from the build's navigation.config.tsx and
   route-paths.ts, so it cannot quietly disagree with the console.

   ONE EXCEPTION: Resume management. The client's Notion groups a CV's whole life
   as one module — written by the candidate, checked by HQ, found and paid for by
   the employer — and that spans three sites. So its group borrows the console's
   CV review and Talent pool and adds one page from each of the other two sites,
   marked with `site`.

   AND A SECOND: Mega menu pages. Premium pages, the Jobs boards and Korea/Global
   are jobseeker-site pages that the console only feeds (Zones, Collections,
   placements, a company's country). The client reads them as one module, so they
   sit after Content as their own group, every page marked `site`.

   AND A THIRD: Application management. The client's Notion has it as a module of
   its own: How to apply — a jobseeker-site flow (Apply → Batch apply) — and the
   console's Applications, moved out of the console's Recruitment group. It sits
   right after Resume management, where the CV meets the job. The console's
   Recruitment group, left holding only Jobs, reads as Job management here. */

type Page = {
  group: string; key: string; label: string; path: string
  perm: string; flag: string; what: string; sub: string[]
  /** absent = an Admin console page; set for the few pages that live on another site */
  site?: 'Company site' | 'Jobseeker site'
}
const ALL = PAGES as Page[]
const ADMIN_PAGES = ALL.filter((p) => !p.site)

/* Dev hosts of the other two sites — the same ones the docs name in prose. */
const SITE_BASE = { 'Company site': 'https://dev.hiring.svn.topdev.asia', 'Jobseeker site': 'https://dev.svn.topdev.asia' } as const
const pageUrl = (p: Page) => (p.site ? `${SITE_BASE[p.site]}${p.path}` : adminUrl(p.path))

/** Admin sidebar order, as the console itself renders it — plus Resume management, Application management and Mega menu pages (see above). */
const GROUP_ORDER = [
  'Dashboards', 'Job management', 'Resume management', 'Application management', 'Users', 'Product settings', 'Service delivery',
  'CRM', 'Content', 'Mega menu pages', 'Notifications', 'Organisation', 'System',
]

/** Handbook sections that stand on their own, before the modules. */
const GUIDE_IDS = ['tu-dien', 'chuoi', 'quyen']
const sec = (id: string) => WORKFLOW.sections.find((s) => s.id === id)

/** A selection is either a console page, a module's shared logic, or a handbook section. */
type Sel =
  | { t: 'home' }
  | { t: 'flow' }
  | { t: 'demo' }
  | { t: 'test' }
  | { t: 'page'; key: string }
  | { t: 'module'; group: string }
  | { t: 'guide'; id: string }

const selId = (s: Sel) =>
  s.t === 'home' ? 'home' : s.t === 'flow' ? 'flow' : s.t === 'demo' ? 'demo' : s.t === 'test' ? 'test' : s.t === 'page' ? `p:${s.key}` : s.t === 'module' ? `m:${s.group}` : `g:${s.id}`

/* ── addressing ───────────────────────────────────────────────────────────────
   Every view has its own URL, because the commonest thing anyone does with a
   reference is send one page of it to a colleague. A single-URL document forces
   "open the guide, then CRM, then Invoices" into every such message, and the
   instruction decays the moment the menu is reorganised — which it just was.

   Paths are readable rather than opaque ids: /trang/invoice says what it is in
   the message it is pasted into. The rail's items are real <a href> elements, so
   ⌘-click, middle-click and "copy link address" all work — a link you cannot
   copy out of the browser is only half an address. */
const slug = (g: string) => g.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const GROUP_BY_SLUG = new Map(GROUP_ORDER.map((g) => [slug(g), g]))
/* Groups renamed after their links were shared — the old address still lands. */
GROUP_BY_SLUG.set('recruitment', 'Job management')
GROUP_BY_SLUG.set('jobs-module', 'Job management')

function href(s: Sel): string {
  if (s.t === 'home') return '/'
  if (s.t === 'flow') return '/toan-canh'
  if (s.t === 'demo') return '/demo'
  if (s.t === 'test') return '/test'
  if (s.t === 'guide') return `/huong-dan/${s.id}`
  if (s.t === 'module') return `/logic/${slug(s.group)}`
  return `/trang/${s.key}`
}

function parse(pathname: string): Sel {
  const [, kind, rest] = pathname.replace(/\/+$/, '').split('/')
  if (kind === 'toan-canh') return { t: 'flow' }
  if (kind === 'demo') return { t: 'demo' }
  if (kind === 'test') return { t: 'test' }
  if (kind === 'trang' && rest && ALL.some((p) => p.key === rest)) return { t: 'page', key: rest }
  if (kind === 'logic' && rest && GROUP_BY_SLUG.has(rest)) return { t: 'module', group: GROUP_BY_SLUG.get(rest)! }
  if (kind === 'huong-dan' && rest && WORKFLOW.sections.some((x) => x.id === rest)) return { t: 'guide', id: rest }
  return { t: 'home' }
}

export function App() {
  const [dev, setDev] = useState(false)
  const [q, setQ] = useState('')
  const [sel, setSel] = useState<Sel>(() => parse(window.location.pathname))

  /* Back / forward must move between pages, not out of the site. */
  useEffect(() => {
    const onPop = () => setSel(parse(window.location.pathname))
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const hits = useMemo(() => {
    const t = q.trim().toLowerCase()
    if (!t) return null
    return ALL.filter((p) => {
      const d = PAGE_DOCS[p.key]
      const extra = d ? [...(d.logic ?? []), ...(d.how ?? []), ...(d.watch ?? [])].join(' ') : ''
      return [p.label, p.path, p.perm, p.what, p.group, extra, ...p.sub].join(' ').toLowerCase().includes(t)
    })
  }, [q])

  const pick = (s: Sel) => {
    const to = href(s)
    if (to !== window.location.pathname) window.history.pushState({}, '', to)
    setSel(s)
    setQ('')
    window.scrollTo({ top: 0 })
  }

  const cur = selId(sel)

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <div className="mx-auto flex max-w-[1340px] gap-10 px-5 print:block">
        {/* ── rail: the console's own menu ───────────────────────────────────── */}
        <aside className="sticky top-0 hidden h-screen w-[262px] shrink-0 overflow-y-auto border-r border-line py-6 pr-5 lg:block print:hidden">
          <button onClick={() => pick({ t: 'home' })} className="block text-left">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-brand">Saramin</p>
            <p className="mt-0.5 text-[15px] font-bold leading-tight tracking-tight">Admin console</p>
            <p className="text-[11px] text-faint">{dev ? 'bản Developer' : 'bản Sales & nghiệp vụ'}</p>
          </button>

          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm trang, path, quyền…"
            className="mt-4 w-full rounded-md border border-line bg-surface px-2.5 py-1.5 text-[12px] placeholder:text-faint focus:border-brand focus:outline-none"
          />

          <RailGroup label="Bắt đầu" />
          <RailItem label="Tổng quan" to={href({ t: 'home' })} on={cur === 'home'} onClick={() => pick({ t: 'home' })} />
          <RailItem label="Toàn cảnh hệ thống" to={href({ t: 'flow' })} accent on={cur === 'flow'} onClick={() => pick({ t: 'flow' })} />
          <RailItem label="Danh sách flow" to={href({ t: 'demo' })} on={cur === 'demo'} onClick={() => pick({ t: 'demo' })} />
          {GUIDE_IDS.map((id) => {
            const s = sec(id)
            return s ? <RailItem key={id} label={s.label} to={href({ t: 'guide', id })} on={cur === `g:${id}`} onClick={() => pick({ t: 'guide', id })} /> : null
          })}

          {GROUP_ORDER.map((g) => {
            const pages = ALL.filter((p) => p.group === g)
            if (!pages.length) return null
            const mod = MODULE_DOCS[g]
            return (
              <div key={g}>
                <RailGroup label={g} n={pages.length} />
                {mod && (
                  <RailItem
                    label="Logic chung"
                    to={href({ t: 'module', group: g })}
                    accent
                    on={cur === `m:${g}`}
                    onClick={() => pick({ t: 'module', group: g })}
                  />
                )}
                {pages.map((p) => (
                  <RailItem key={p.key} label={p.label} to={href({ t: 'page', key: p.key })} on={cur === `p:${p.key}`} onClick={() => pick({ t: 'page', key: p.key })} />
                ))}
              </div>
            )
          })}

          <RailGroup label="Cuối" />
          <RailItem label="Điểm cần xác nhận" to={href({ t: 'guide', id: 'can-xac-nhan' })} on={cur === 'g:can-xac-nhan'} onClick={() => pick({ t: 'guide', id: 'can-xac-nhan' })} />
        </aside>

        {/* ── content ────────────────────────────────────────────────────────── */}
        <main className="min-w-0 flex-1 py-8">
          <div className="mb-5 flex flex-wrap items-center justify-end gap-2 print:hidden">
            <button
              onClick={() => setDev((v) => !v)}
              className={cx('rounded-md border px-3 py-1.5 text-[12px] font-medium transition-colors',
                dev ? 'border-ink bg-ink text-white' : 'border-line bg-surface text-muted hover:border-ink hover:text-ink')}
            >
              {dev ? 'Đang xem: Developer' : 'Xem bản Developer'}
            </button>
            <CopyLink />
            <button onClick={() => window.print()} className="rounded-md border border-line bg-surface px-3 py-1.5 text-[12px] font-medium text-muted hover:border-ink hover:text-ink">In / PDF</button>
          </div>

          {hits ? (
            <SearchResults hits={hits} q={q} onClear={() => setQ('')} onPick={(k) => pick({ t: 'page', key: k })} />
          ) : sel.t === 'home' ? (
            <Home onPick={pick} />
          ) : sel.t === 'flow' ? (
            <OverviewFlow />
          ) : sel.t === 'demo' ? (
            <DemoPlan onPick={(k) => pick({ t: 'page', key: k })} />
          ) : sel.t === 'test' ? (
            <TestPlan onPick={(k) => pick({ t: 'page', key: k })} />
          ) : sel.t === 'guide' ? (
            (() => { const s = sec(sel.id); return s ? <GuideView s={s} dev={dev} /> : null })()
          ) : sel.t === 'module' ? (
            <ModuleView group={sel.group} onPick={(k) => pick({ t: 'page', key: k })} />
          ) : (
            (() => {
              const p = ALL.find((x) => x.key === sel.key)
              return p ? <PageView p={p} dev={dev} onModule={() => pick({ t: 'module', group: p.group })} /> : null
            })()
          )}

          <footer className="mt-14 border-t border-line pt-4 text-[11px] leading-[1.7] text-faint">
            Danh sách trang sinh từ <span className="font-mono text-muted">saramin-vn-admin</span> ·{' '}
            <span className="font-mono text-muted">configs/navigation.config.tsx</span> +{' '}
            <span className="font-mono text-muted">route-paths.ts</span>. Phần logic viết từ{' '}
            <span className="font-mono text-muted">docs/features/*.md</span>,{' '}
            <span className="font-mono text-muted">business-logic.md</span> và{' '}
            <span className="font-mono text-muted">qa/tester-guide</span>. Build đổi thì trang này là thứ cũ đi trước.
          </footer>
        </main>
      </div>
    </div>
  )
}

/* ── home ───────────────────────────────────────────────────────────────────── */

function Home({ onPick }: { onPick: (s: Sel) => void }) {
  return (
    <div>
      <div className="border-b-2 border-ink pb-4">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-brand">Cẩm nang hệ thống</p>
        <h1 className="mt-1.5 max-w-[16ch] text-[40px] font-bold leading-[1.05] tracking-[-0.02em]">
          Admin console, toàn bộ
        </h1>
      </div>

      <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-2 border-b border-line pb-4">
        <Fact k="Trang" v={String(ADMIN_PAGES.length)} />
        <Fact k="Nhóm" v={String(GROUP_ORDER.length)} />
        <Fact k="Trang con" v={String(ADMIN_PAGES.reduce((n, p) => n + p.sub.length, 0))} />
        <Fact k="Console" v="dev.admin-svn.topdev.asia" href={adminUrl('/')} />
      </dl>

      <p className="mt-5 max-w-[74ch] text-[14.5px] leading-[1.7] text-ink/80">
        Cột trái là menu của Admin console — <b>toàn bộ {ADMIN_PAGES.length} trang</b>, đúng nhóm và đúng thứ tự như trong hệ
        thống. Chọn một trang để xem <b>logic phía sau</b> và <b>cách dùng</b>. Nhóm nào có nhiều quy tắc dùng chung
        thì có thêm mục <b>Logic chung</b> ở đầu nhóm. Riêng nhóm <b>Resume management</b> theo một CV đi qua cả ba
        site — nên ngoài CV review và Talent pool của Admin, nó có thêm một trang của site ứng viên và một trang của site
        nhà tuyển dụng. Nhóm <b>Mega menu pages</b> thì là các trang của site ứng viên mà Admin chỉ cấp dữ liệu —
        Premium pages, các bảng Jobs và Korea/Global. Nhóm <b>Application management</b> đi theo đơn ứng tuyển — bắt
        đầu từ <b>How to apply</b> trên site ứng viên.
      </p>

      <div className="mt-5 border-l-2 border-brand bg-brand-soft/50 py-3 pl-4 pr-4">
        <p className="text-[13px] font-bold">{WORKFLOW.keyFact.heading}</p>
        <p className="mt-1 max-w-[80ch] text-[13px] leading-[1.65] text-ink/75">{WORKFLOW.keyFact.text}</p>
      </div>

      <div className="mt-5 grid gap-x-8 gap-y-3 border-t border-line pt-4 sm:grid-cols-3">
        {WORKFLOW.quick.map((c) => (
          <div key={c.q}>
            <p className="text-[13px] font-bold">{c.q}</p>
            <p className="mt-0.5 text-[12.5px] leading-[1.6] text-muted">{c.a}</p>
          </div>
        ))}
      </div>

      {/* Routes the console still serves but no longer offers in its menu. Worth
          stating: a bookmark that still works is not evidence a page is current,
          and someone will arrive on one and assume the guide is missing a page. */}
      <section className="mt-9">
        <h2 className="border-b border-ink pb-1.5 text-[17px] font-bold tracking-tight">Đường dẫn đã rút khỏi menu</h2>
        <p className="mt-2 max-w-[78ch] text-[12.5px] leading-[1.65] text-muted">
          Các đường dẫn dưới đây <b className="text-ink/75">vẫn mở được</b> (bookmark cũ không gãy), nhưng{' '}
          <b className="text-ink/75">không còn trong menu</b> — phần lớn chuyển hướng sang trang thay thế. Bookmark còn
          chạy không có nghĩa là trang đó còn hiện hành.
        </p>
        <div className="mt-2">
          {[
            ['/content/displays · /content/banners · /content/popups', 'Boosting — banner và popup gộp một danh sách'],
            ['/system/notifications', 'Notifications — tách thành 4 mục menu riêng'],
            ['/analytics/sales-report · /analytics/recruit-report · /analytics/revenue-report', 'Dashboards — 4 bảng theo đội'],
            ['/system/cv-search-usage', 'Service delivery → Quota usage'],
            ['/system/faq · /system/zalo-templates', 'Đã chuyển sang Content → FAQ và Notifications → Zalo ZNS'],
            ['/recruitment/resumes · /users/deleted-accounts · /system/environment', 'Còn route nhưng đã rút khỏi menu'],
          ].map(([from, to]) => (
            <div key={from} className="grid grid-cols-1 gap-x-5 border-b border-line-soft py-2 sm:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
              <code className="font-mono text-[11px] leading-relaxed text-faint">{from}</code>
              <span className="text-[12px] text-muted">→ {to}</span>
            </div>
          ))}
        </div>
      </section>

      <h2 className="mt-9 border-b border-ink pb-1.5 text-[17px] font-bold tracking-tight">Các nhóm</h2>
      <div className="mt-1">
        {GROUP_ORDER.map((g, i) => {
          const pages = ALL.filter((p) => p.group === g)
          if (!pages.length) return null
          const mod = MODULE_DOCS[g]
          return (
            <div key={g} className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 border-b border-line-soft py-3">
              <span className="pt-0.5 font-mono text-[11px] text-faint">{String(i + 1).padStart(2, '0')}</span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-baseline gap-x-3">
                  <button onClick={() => onPick(mod ? { t: 'module', group: g } : { t: 'page', key: pages[0].key })}
                          className="text-[14px] font-semibold hover:text-brand hover:underline">{g}</button>
                  <span className="font-mono text-[10.5px] text-faint">{pages.length} trang</span>
                </div>
                {mod && <p className="mt-0.5 max-w-[78ch] text-[12.5px] leading-[1.6] text-muted">{md(mod.lead)}</p>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ── one console page ───────────────────────────────────────────────────────── */

function PageView({ p, dev, onModule }: { p: Page; dev: boolean; onModule: () => void }) {
  const d = PAGE_DOCS[p.key]
  const mod = MODULE_DOCS[p.group]

  return (
    <article>
      <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-faint">{p.group}</p>
      <div className="mt-1 flex flex-wrap items-end justify-between gap-x-6 gap-y-2 border-b-2 border-ink pb-3">
        <h1 className="text-[30px] font-bold leading-[1.1] tracking-[-0.02em]">{p.label}</h1>
        <a href={pageUrl(p)} target="_blank" rel="noreferrer"
           className="rounded-md border border-brand px-3 py-1.5 text-[12px] font-medium text-brand hover:bg-brand hover:text-white">
          Mở trang này ↗
        </a>
      </div>

      <dl className="mt-3 flex flex-wrap gap-x-8 gap-y-2 border-b border-line pb-3">
        <Fact k="Site" v={p.site ?? 'Admin'} />
        <Fact k="Đường dẫn" v={p.path} mono />
        {!p.site && <Fact k="Quyền" v={p.perm || 'không gắn quyền'} mono />}
        {dev && p.flag && <Fact k="Module flag" v={p.flag} mono />}
      </dl>

      {p.what && <p className="mt-4 max-w-[76ch] text-[14.5px] leading-[1.7] text-ink/80">{md(p.what)}</p>}

      <div className="mt-7 space-y-7">
        {d?.logic?.length ? <Bullets title="Logic phía sau" items={d.logic} /> : null}
        {d?.how?.length ? <Steps title="Hướng dẫn sử dụng" items={d.how} /> : null}
        {d?.watch?.length ? <Bullets title="Cần để ý" items={d.watch} warn /> : null}
        {d?.blocks?.map((b, i) => <DocBlockView key={i} b={b} />)}
      </div>

      {p.sub.length > 0 && (
        <section className="mt-7">
          <h2 className="border-b border-ink pb-1.5 text-[15px] font-bold tracking-tight">Trang con</h2>
          <ul className="mt-2">
            {p.sub.map((s) => (
              <li key={s} className="border-b border-line-soft py-1.5 font-mono text-[12px] text-muted">{s}</li>
            ))}
          </ul>
          <p className="mt-1.5 text-[11.5px] text-faint">Các route này không có mục riêng trên menu — mở từ chính trang trên.</p>
        </section>
      )}

      {mod && (
        <button onClick={onModule}
                className="mt-7 block w-full border-l-2 border-brand bg-brand-soft/40 py-2.5 pl-4 pr-4 text-left hover:bg-brand-soft">
          <span className="text-[12.5px] font-semibold text-ink">{mod.title} →</span>
          <span className="mt-0.5 block max-w-[76ch] text-[12px] leading-[1.6] text-muted">{md(mod.lead)}</span>
        </button>
      )}
    </article>
  )
}

/* ── a module's shared logic ────────────────────────────────────────────────── */

function ModuleView({ group, onPick }: { group: string; onPick: (key: string) => void }) {
  const mod = MODULE_DOCS[group]
  const pages = ALL.filter((p) => p.group === group)
  if (!mod) return null
  return (
    <article>
      <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-faint">{group}</p>
      <h1 className="mt-1 border-b-2 border-ink pb-3 text-[30px] font-bold leading-[1.1] tracking-[-0.02em]">{mod.title}</h1>
      <p className="mt-4 max-w-[76ch] text-[14.5px] leading-[1.7] text-ink/80">{md(mod.lead)}</p>

      {/* The two or three facts that, unknown, produce a wrong outcome. They sit
          above everything because a reader who stops after this box has still got
          the part that costs money. */}
      <div className="mt-5 border-l-2 border-brand bg-brand-soft/45 py-3 pl-4 pr-4">
        <p className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-brand">Đọc trước</p>
        <ul className="mt-1.5 max-w-[78ch] space-y-1.5">
          {mod.headline.map((t, i) => (
            <li key={i} className="text-[13px] leading-[1.65] text-ink/85">{md(t)}</li>
          ))}
        </ul>
      </div>

      <div className="mt-7 space-y-7">
        {mod.blocks.map((b, i) => <DocBlockView key={i} b={b} />)}
      </div>

      <section className="mt-7">
        <h2 className="border-b border-ink pb-1.5 text-[15px] font-bold tracking-tight">{pages.length} trang trong nhóm</h2>
        <div className="mt-1">
          {pages.map((p) => (
            <button key={p.key} onClick={() => onPick(p.key)}
                    className="grid w-full grid-cols-[minmax(130px,0.9fr)_minmax(0,2.2fr)] gap-x-5 border-b border-line-soft py-2.5 text-left hover:bg-brand-soft/30">
              <span className="min-w-0">
                <span className="block truncate text-[13.5px] font-semibold">{p.label}</span>
                <code className="block font-mono text-[10.5px] text-faint">{p.path}</code>
              </span>
              <span className="min-w-0 self-center text-[12.5px] leading-[1.55] text-muted">{md(p.what)}</span>
            </button>
          ))}
        </div>
      </section>
    </article>
  )
}

/* ── handbook section ───────────────────────────────────────────────────────── */

function GuideView({ s, dev }: { s: WfSection; dev: boolean }) {
  const blocks = s.blocks.filter((b) => dev || !b.dev)
  return (
    <article>
      <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-faint">Cẩm nang</p>
      <h1 className="mt-1 border-b-2 border-ink pb-3 text-[30px] font-bold leading-[1.1] tracking-[-0.02em]">{s.title}</h1>
      {s.where && <code className="mt-2 block font-mono text-[11px] text-faint">{s.where}</code>}
      {s.lead && <p className="mt-4 max-w-[76ch] text-[14.5px] leading-[1.7] text-ink/80">{md(s.lead)}</p>}
      <div className="mt-5 space-y-5">{blocks.map((b, i) => <Block key={i} b={b} />)}</div>
    </article>
  )
}

/* ── search ─────────────────────────────────────────────────────────────────── */

function SearchResults({ hits, q, onClear, onPick }: { hits: Page[]; q: string; onClear: () => void; onPick: (k: string) => void }) {
  return (
    <div>
      <p className="border-b-2 border-ink pb-3 text-[13px] text-muted">
        <b className="text-[15px] text-ink">{hits.length}</b> trang khớp “{q}”
        <button onClick={onClear} className="ml-3 text-brand hover:underline">Xoá</button>
      </p>
      <div className="mt-1">
        {hits.map((p) => (
          <button key={p.key} onClick={() => onPick(p.key)}
                  className="grid w-full grid-cols-[minmax(140px,1fr)_minmax(0,2.2fr)] gap-x-5 border-b border-line-soft py-2.5 text-left hover:bg-brand-soft/30">
            <span className="min-w-0">
              <span className="block truncate text-[13.5px] font-semibold">{p.label}</span>
              <code className="block font-mono text-[10.5px] text-faint">{p.path}</code>
            </span>
            <span className="min-w-0 self-center">
              <span className="block text-[12.5px] leading-[1.55] text-muted">{md(p.what)}</span>
              <span className="font-mono text-[10.5px] text-faint">{p.group}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

/* ── shared bits ────────────────────────────────────────────────────────────── */

/* A block of module logic. Tables get the same ruled, borderless treatment as the
   rest of the page — a boxed table in a document reads as a widget dropped in, and
   this one is prose that happens to have columns. */
function DocBlockView({ b }: { b: DocBlock }) {
  if (b.kind === 'p') return <p className="max-w-[78ch] text-[13.5px] leading-[1.7] text-ink/80">{md(b.text)}</p>

  if (b.kind === 'list') return <Bullets title={b.heading ?? ''} items={b.items} />

  if (b.kind === 'h') {
    return (
      <h2 className="!mt-12 flex flex-wrap items-baseline gap-x-3 border-b-2 border-ink pb-2 text-[21px] font-bold leading-[1.2] tracking-[-0.015em]">
        {md(b.text)}
        {b.path && <code className="font-mono text-[11px] font-normal text-faint">{b.path}</code>}
      </h2>
    )
  }

  if (b.kind === 'warn') {
    return (
      <p className="max-w-[78ch] border-l-2 border-ink/30 py-1.5 pl-4 text-[13px] leading-[1.7] text-ink/80">
        <span className="mr-1.5 font-mono text-[9.5px] uppercase tracking-wider text-ink/45">lưu ý</span>{md(b.text)}
      </p>
    )
  }

  /* A screenshot is the one block that must survive printing and a narrow
     window, so it is a plain figure: full-width image, caption under it. The
     surface tag matters more than it looks — the same purchase runs across three
     different sites, and a reader who mistakes the company site for the admin
     will look for a button that was never there. */
  if (b.kind === 'shot') {
    return (
      <figure className="max-w-[860px]">
        <img
          src={b.src}
          alt={b.caption}
          loading="lazy"
          className="w-full rounded-lg border border-line bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
        />
        <figcaption className="mt-2 text-[12px] leading-[1.65] text-muted">
          {b.where && (
            <span className="mr-2 rounded border border-line bg-surface px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-wider text-brand">
              {b.where}
            </span>
          )}
          {md(b.caption)}
          {b.note && <span className="mt-1 block text-faint">{md(b.note)}</span>}
        </figcaption>
      </figure>
    )
  }

  if (b.kind === 'diagram') {
    const D = DIAGRAMS[b.id]
    return D ? (
      <section>
        {b.heading && <h2 className="border-b border-ink pb-1.5 text-[15px] font-bold tracking-tight">{b.heading}</h2>}
        {b.note && <p className="mt-2 max-w-[78ch] text-[12.5px] leading-[1.6] text-muted">{md(b.note)}</p>}
        <div className="mt-3">
          <D />
        </div>
      </section>
    ) : null
  }

  if (b.kind === 'open') {
    return (
      <p className="max-w-[78ch] border-l-2 border-amber-500/70 bg-amber-50/60 py-2 pl-4 pr-4 text-[13px] leading-[1.7] text-ink/80">
        <span className="mr-1.5 font-mono text-[9.5px] uppercase tracking-wider text-amber-700">chưa chốt</span>{md(b.text)}
      </p>
    )
  }

  /* A worked example sits apart from the surrounding rules, because it is a
     different kind of claim: the rules say what is true, this says what happens.
     A reader checking their own case wants to find it without reading the rest. */
  if (b.kind === 'example') {
    return (
      <section className="border border-line bg-surface p-4">
        <p className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-brand">Ví dụ</p>
        <h2 className="mt-0.5 text-[15px] font-bold tracking-tight">{b.heading}</h2>
        <p className="mt-2 max-w-[78ch] text-[12.5px] leading-[1.65] text-ink/75">{md(b.scenario)}</p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[620px] border-collapse text-left">
            <thead>
              <tr>
                {b.cols.map((c, i) => (
                  <th key={i} className="border-b border-line py-1.5 pr-5 font-mono text-[9.5px] font-semibold uppercase tracking-wider text-faint last:pr-0">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {b.rows.map((r, i) => (
                <tr key={i} className="border-b border-line-soft last:border-0">
                  {r.map((cell, j) => (
                    <td key={j} className={cx('py-2 pr-5 align-top text-[12.5px] leading-[1.55] last:pr-0', j === 0 ? 'font-semibold text-ink' : 'text-ink/75')}>{md(cell)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {b.note && <p className="mt-3 max-w-[78ch] border-l-2 border-ink/25 pl-3 text-[12.5px] leading-[1.6] text-ink/75">{md(b.note)}</p>}
      </section>
    )
  }

  return (
    <section>
      {b.heading && <h2 className="border-b border-ink pb-1.5 text-[15px] font-bold tracking-tight">{b.heading}</h2>}
      {b.note && <p className="mt-2 max-w-[78ch] text-[12.5px] leading-[1.6] text-muted">{md(b.note)}</p>}
      <div className="mt-2 overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left">
          <thead>
            <tr>
              {b.cols.map((c, i) => (
                <th key={i} className="border-b border-line py-1.5 pr-5 font-mono text-[9.5px] font-semibold uppercase tracking-wider text-faint last:pr-0">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {b.rows.map((r, i) => (
              <tr key={i} className="border-b border-line-soft last:border-0">
                {r.map((cell, j) => (
                  <td key={j} className={cx('py-2.5 pr-5 align-top text-[12.5px] leading-[1.6] last:pr-0', j === 0 ? 'font-semibold text-ink' : 'text-ink/75')}>{md(cell)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function Bullets({ title, items, warn }: { title: string; items: string[]; warn?: boolean }) {
  return (
    <section>
      {title && <h2 className="border-b border-ink pb-1.5 text-[15px] font-bold tracking-tight">{title}</h2>}
      <ul className="mt-2.5 max-w-[78ch] space-y-2">
        {items.map((t, i) => (
          <li key={i} className={cx('text-[13px] leading-[1.7]', warn ? 'border-l-2 border-ink/25 pl-4 text-ink/75' : 'flex gap-3 text-ink/80')}>
            {!warn && <span className="shrink-0 pt-[7px] text-brand"><span className="block h-1 w-1 rounded-full bg-current" /></span>}
            <span className="min-w-0">{md(t)}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

function Steps({ title, items }: { title: string; items: string[] }) {
  return (
    <section>
      {title && <h2 className="border-b border-ink pb-1.5 text-[15px] font-bold tracking-tight">{title}</h2>}
      <ol className="mt-2.5 max-w-[78ch] space-y-2">
        {items.map((t, i) => (
          <li key={i} className="flex gap-3 text-[13px] leading-[1.7] text-ink/80">
            <span className="shrink-0 pt-px font-mono text-[11px] text-brand">{String(i + 1).padStart(2, '0')}</span>
            <span className="min-w-0">{md(t)}</span>
          </li>
        ))}
      </ol>
    </section>
  )
}

function Block({ b }: { b: WfBlock }) {
  const tag = b.dev && <span className="mr-1.5 font-mono text-[9.5px] uppercase tracking-wider text-brand">dev</span>

  if (b.kind === 'p') return <p className="max-w-[78ch] text-[13px] leading-[1.7] text-ink/75">{tag}{md(b.text)}</p>

  if (b.kind === 'steps') return <Steps title={b.heading ?? 'Các bước'} items={b.items} />

  if (b.kind === 'table') {
    return (
      <div>
        {b.heading && <p className="mb-1 text-[13.5px] font-bold">{tag}{b.heading}</p>}
        {b.note && <p className="mb-2 max-w-[78ch] text-[12px] text-muted">{md(b.note)}</p>}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-left">
            <thead>
              <tr>
                {b.table.cols.map((c) => (
                  <th key={c} className="border-b border-ink py-1.5 pr-5 font-mono text-[10px] font-semibold uppercase tracking-wider text-muted last:pr-0">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {b.table.rows.map((r, i) => (
                <tr key={i} className="border-b border-line-soft last:border-0">
                  {r.map((cell, j) => (
                    <td key={j} className={cx('py-2 pr-5 align-top text-[12.5px] leading-[1.6] last:pr-0', j === 0 ? 'font-medium text-ink' : 'text-ink/75')}>{md(cell)}</td>
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
      <p className="max-w-[78ch] border-l-2 border-ink/25 py-1 pl-4 text-[12.5px] leading-[1.65] text-ink/75">
        <span className="mr-1.5 font-mono text-[9.5px] uppercase tracking-wider text-ink/50">lưu ý</span>{tag}{md(b.text)}
      </p>
    )
  }

  return (
    <div className="flex flex-wrap gap-x-5 gap-y-1">
      {b.items.map((l) => (
        <a key={l.path} href={adminUrl(l.path)} target="_blank" rel="noreferrer" className="text-[12px] text-brand hover:underline">
          {l.label} <span className="font-mono text-[10.5px] text-faint">{l.path}</span>
        </a>
      ))}
    </div>
  )
}

function Fact({ k, v, href, mono }: { k: string; v: string; href?: string; mono?: boolean }) {
  return (
    <div className="min-w-0">
      <dt className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-faint">{k}</dt>
      <dd className={cx('truncate text-[13px]', mono ? 'font-mono text-[12px] text-ink/80' : 'font-semibold')}>
        {href ? <a href={href} target="_blank" rel="noreferrer" className="text-brand hover:underline">{v}</a> : v}
      </dd>
    </div>
  )
}

/* Copy the address of whatever is on screen. The URL bar already holds it, but a
   reference gets shared from the page, not from the chrome — and on a phone the
   bar is often not even visible. */
function CopyLink() {
  const [done, setDone] = useState(false)
  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(window.location.href)
          setDone(true)
          setTimeout(() => setDone(false), 1600)
        } catch {
          /* clipboard blocked (http, permissions) — the URL bar still has it */
        }
      }}
      title="Sao chép link trang này"
      className="rounded-md border border-line bg-surface px-2.5 py-1.5 text-[12px] font-medium text-muted hover:border-ink hover:text-ink"
    >
      {done ? '✓ Đã chép' : 'Chép link'}
    </button>
  )
}

function RailGroup({ label, n }: { label: string; n?: number }) {
  return (
    <p className="flex items-baseline gap-2 pb-1 pt-5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-faint">
      <span className="min-w-0 truncate">{label}</span>
      {n != null && <span className="ml-auto shrink-0">{n}</span>}
    </p>
  )
}

/* An <a> with a real href, not a button. The plain click is intercepted so the
   page never reloads, but ⌘-click, middle-click and "copy link address" keep
   working — and those are how a reference actually gets shared.

   Active is an accent RULE, not a filled pill: a pill on every row turns the rail
   into a stack of buttons, and only one of them is ever the answer. */
function RailItem({ label, to, on, onClick, accent }: { label: string; to: string; on: boolean; onClick: () => void; accent?: boolean }) {
  return (
    <a
      href={to}
      onClick={(e) => {
        // let the browser handle any click that means "open somewhere else"
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
        e.preventDefault()
        onClick()
      }}
      className={cx('flex w-full items-baseline gap-2 border-l-2 py-1 pl-2.5 pr-1 text-left text-[12.5px] leading-snug no-underline transition-colors',
        on ? 'border-brand font-semibold text-ink'
           : accent ? 'border-transparent font-medium text-brand hover:border-brand/40'
           : 'border-transparent text-muted hover:border-line hover:text-ink')}
    >
      <span className="min-w-0 truncate">{label}</span>
    </a>
  )
}

/** **bold** and `code` only — enough to mark a field name, not enough to invite prose. */
const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(' ')
