import { useEffect, useMemo, useState } from 'react'
import { SUITES, ALL_CASES } from './testcases'
import type { Case, Kind } from './testcases'
import { md } from './md'

/**
 * Trang chạy test — không phải một danh sách để đọc, mà một tờ phiếu để tick.
 *
 * Trạng thái lưu trong localStorage của chính trình duyệt người test: cả tuần
 * test thì không ai muốn mất dấu khi đóng tab, và một bảng tính dùng chung sẽ
 * phải đồng bộ tay với trang này. Đổi lại, kết quả là **của riêng từng máy** —
 * nên có nút chép báo cáo để gom về một chỗ. Mọi truy cập localStorage đều bọc
 * try/catch: cửa sổ ẩn danh và trình duyệt chặn site data đều ném lỗi ngay ở
 * bước đọc, và một trang test không được phép trắng vì chuyện đó.
 */

type Status = 'todo' | 'pass' | 'fail'
type Run = Record<string, { s: Status; note?: string }>

const KEY = 'saramin-test-run-v1'

function load(): Run {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Run) : {}
  } catch {
    return {}
  }
}
function save(r: Run) {
  try {
    localStorage.setItem(KEY, JSON.stringify(r))
  } catch {
    /* ngoài tầm kiểm soát — trang vẫn phải chạy */
  }
}

const KIND_LABEL: Record<Kind, string> = {
  happy: 'luồng thuận',
  refuse: 'phải từ chối',
  perm: 'phân quyền',
  data: 'dữ liệu / quy tắc',
}

export function TestPlan({ onPick }: { onPick: (key: string) => void }) {
  const [run, setRun] = useState<Run>({})
  const [suite, setSuite] = useState<string>('all')
  const [prio, setPrio] = useState<string>('all')
  const [only, setOnly] = useState<'all' | 'todo' | 'fail'>('all')

  useEffect(() => { setRun(load()) }, [])

  const set = (id: string, s: Status) => {
    setRun((r) => {
      const cur = r[id]?.s
      const next: Run = { ...r, [id]: { ...r[id], s: cur === s ? 'todo' : s } }
      save(next)
      return next
    })
  }
  const setNote = (id: string, note: string) => {
    setRun((r) => {
      const next: Run = { ...r, [id]: { s: r[id]?.s ?? 'fail', note } }
      save(next)
      return next
    })
  }

  const stat = useMemo(() => {
    let pass = 0, fail = 0
    for (const c of ALL_CASES) {
      const s = run[c.id]?.s
      if (s === 'pass') pass++
      else if (s === 'fail') fail++
    }
    return { pass, fail, todo: ALL_CASES.length - pass - fail, total: ALL_CASES.length }
  }, [run])

  const visible = (c: Case) => {
    if (prio !== 'all' && String(c.p) !== prio) return false
    const s = run[c.id]?.s ?? 'todo'
    if (only === 'todo' && s !== 'todo') return false
    if (only === 'fail' && s !== 'fail') return false
    return true
  }

  const report = () => {
    const lines: string[] = [`# Kết quả test — ${new Date().toLocaleString('vi-VN')}`, '',
      `Đạt ${stat.pass} · Lỗi ${stat.fail} · Chưa test ${stat.todo} / ${stat.total}`, '']
    for (const s of SUITES) {
      const rows = s.cases.filter((c) => (run[c.id]?.s ?? 'todo') !== 'todo')
      if (!rows.length) continue
      lines.push(`## ${s.module}`, '')
      for (const c of rows) {
        const e = run[c.id]
        lines.push(`- [${e.s === 'pass' ? 'x' : '!'}] **${c.id}** ${c.title}${e.note ? ` — _${e.note}_` : ''}`)
      }
      lines.push('')
    }
    const fails = ALL_CASES.filter((c) => run[c.id]?.s === 'fail')
    if (fails.length) {
      lines.push('## Cần xử lý', '')
      for (const c of fails) lines.push(`- **${c.id}** ${c.title} — kỳ vọng: ${c.expect.replace(/\*\*/g, '')}${run[c.id]?.note ? ` · ghi nhận: ${run[c.id]!.note}` : ''}`)
    }
    const text = lines.join('\n')
    /* `navigator.clipboard?.writeText(x).then(...)` looks safe but is not: when
       clipboard is undefined the optional chain yields undefined and `.then`
       throws. Clipboard is absent outside a secure context — a tester opening
       this over plain http on a LAN address is exactly that case. */
    const p = navigator.clipboard?.writeText(text)
    if (p) p.then(() => alert('Đã chép báo cáo vào clipboard.'), () => window.prompt('Chép thủ công:', text))
    else window.prompt('Chép thủ công:', text)
  }

  const pct = Math.round(((stat.pass + stat.fail) / stat.total) * 100)

  return (
    <div className="space-y-8">
      <header>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-brand">Kế hoạch test</p>
        <h1 className="mt-1 text-[26px] font-bold leading-tight tracking-tight">Bộ test case</h1>
        <p className="mt-2 max-w-[74ch] text-[13.5px] leading-[1.75] text-ink/75">
          <strong>{stat.total} case</strong>, mỗi case có một kỳ vọng <strong>sai được</strong> — đó là thứ phân
          biệt một bộ test với câu “test hết đi”. Gần một nửa là <strong>case từ chối</strong>: phần lớn giá trị
          của hệ thống nằm ở những chỗ nó nói không, và đó cũng là phần hay bị bỏ sót nhất.
        </p>
        <p className="mt-2 max-w-[74ch] text-[12.5px] leading-[1.7] text-muted">
          Tick trực tiếp trên trang. Kết quả lưu trong trình duyệt của bạn, không mất khi đóng tab — nhưng là
          <strong> của riêng máy này</strong>, nên khi xong hãy bấm <em>Chép báo cáo</em> để gộp về một chỗ.
        </p>
      </header>

      <section className="rounded-lg border border-line bg-surface p-5 print:hidden">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <div className="text-[13px]">
            <span className="font-mono text-[20px] font-bold text-ink">{pct}%</span>
            <span className="ml-2 text-muted">đã chạy</span>
          </div>
          <div className="flex gap-4 text-[12.5px]">
            <span><b className="text-emerald-700">{stat.pass}</b> đạt</span>
            <span><b className="text-red-700">{stat.fail}</b> lỗi</span>
            <span><b className="text-ink">{stat.todo}</b> chưa test</span>
          </div>
          <div className="ml-auto flex gap-2">
            <button onClick={report} className="rounded-md border border-line px-3 py-1.5 text-[12px] font-medium text-muted hover:border-ink hover:text-ink">Chép báo cáo</button>
            <button
              onClick={() => { if (confirm('Xoá toàn bộ kết quả đã tick trên máy này?')) { setRun({}); save({}) } }}
              className="rounded-md border border-line px-3 py-1.5 text-[12px] font-medium text-muted hover:border-red-600 hover:text-red-700"
            >Xoá kết quả</button>
          </div>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-canvas">
          <div className="h-full bg-brand transition-[width]" style={{ width: `${pct}%` }} />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-[12px]">
          <Seg label="Tất cả nhóm" on={suite === 'all'} onClick={() => setSuite('all')} />
          {SUITES.map((s) => <Seg key={s.id} label={s.id} on={suite === s.id} onClick={() => setSuite(s.id)} />)}
          <span className="mx-1 h-4 w-px bg-line" />
          {[['all', 'Mọi mức'], ['0', 'P0'], ['1', 'P1'], ['2', 'P2']].map(([v, l]) =>
            <Seg key={v} label={l} on={prio === v} onClick={() => setPrio(v)} />)}
          <span className="mx-1 h-4 w-px bg-line" />
          {([['all', 'Tất cả'], ['todo', 'Chưa test'], ['fail', 'Đang lỗi']] as const).map(([v, l]) =>
            <Seg key={v} label={l} on={only === v} onClick={() => setOnly(v)} />)}
        </div>
      </section>

      {SUITES.filter((s) => suite === 'all' || suite === s.id).map((s) => {
        const rows = s.cases.filter(visible)
        if (!rows.length) return null
        const done = s.cases.filter((c) => (run[c.id]?.s ?? 'todo') !== 'todo').length
        return (
          <section key={s.id}>
            <div className="flex items-baseline gap-3 border-b border-ink/15 pb-2">
              <span className="font-mono text-[11px] font-bold text-brand">{s.id}</span>
              <h2 className="text-[16px] font-bold tracking-tight">{s.module}</h2>
              <span className="ml-auto font-mono text-[10.5px] text-faint">{done}/{s.cases.length}</span>
            </div>
            {s.note && <p className="mt-2 max-w-[74ch] text-[12.5px] leading-[1.65] text-muted">{md(s.note)}</p>}
            <div className="mt-3 divide-y divide-line-soft">
              {rows.map((c) => {
                const st = run[c.id]?.s ?? 'todo'
                return (
                  <div key={c.id} className={cx('py-3', st === 'fail' && 'bg-red-50/40', st === 'pass' && 'opacity-55')}>
                    <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                      <span className="font-mono text-[10.5px] font-semibold text-faint">{c.id}</span>
                      <span className={cx('rounded px-1 font-mono text-[9px] font-bold',
                        c.p === 0 ? 'bg-ink text-white' : c.p === 1 ? 'bg-brand-soft text-brand' : 'bg-canvas text-faint')}>P{c.p}</span>
                      <span className="font-mono text-[9px] uppercase tracking-wider text-faint">{KIND_LABEL[c.kind]}</span>
                      <h3 className="text-[13.5px] font-semibold leading-tight">{c.title}</h3>
                      <div className="ml-auto flex shrink-0 gap-1 print:hidden">
                        <Mark label="Đạt" tone="pass" on={st === 'pass'} onClick={() => set(c.id, 'pass')} />
                        <Mark label="Lỗi" tone="fail" on={st === 'fail'} onClick={() => set(c.id, 'fail')} />
                      </div>
                    </div>
                    <dl className="mt-1.5 space-y-0.5 text-[12.5px] leading-[1.6]">
                      {c.pre && <Line k="tiền đề" v={c.pre} />}
                      <Line k="làm" v={c.steps} />
                      <Line k="kỳ vọng" v={c.expect} strong />
                    </dl>
                    {c.page && (
                      <a
                        href={`/trang/${c.page}`}
                        onClick={(e) => { if (!e.metaKey && !e.ctrlKey && e.button === 0) { e.preventDefault(); onPick(c.page!) } }}
                        className="mt-1 inline-block font-mono text-[10.5px] text-brand hover:underline print:hidden"
                      >logic trang này ↗</a>
                    )}
                    {st === 'fail' && (
                      <input
                        value={run[c.id]?.note ?? ''}
                        onChange={(e) => setNote(c.id, e.target.value)}
                        placeholder="Thực tế thấy gì? (vào báo cáo)"
                        className="mt-2 w-full max-w-[60ch] rounded border border-red-300 bg-white px-2 py-1 text-[12px] placeholder:text-faint focus:border-red-500 focus:outline-none print:hidden"
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}

function Line({ k, v, strong }: { k: string; v: string; strong?: boolean }) {
  return (
    <div className="flex gap-2">
      <dt className="w-[52px] shrink-0 font-mono text-[9px] uppercase tracking-wider text-faint" style={{ paddingTop: 3 }}>{k}</dt>
      <dd className={cx('min-w-0', strong ? 'text-ink/90' : 'text-ink/70')}>{md(v)}</dd>
    </div>
  )
}

function Seg({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={cx('rounded border px-2 py-1 font-medium transition-colors',
      on ? 'border-ink bg-ink text-white' : 'border-line bg-surface text-muted hover:border-ink hover:text-ink')}>{label}</button>
  )
}

function Mark({ label, tone, on, onClick }: { label: string; tone: 'pass' | 'fail'; on: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={cx('rounded border px-2 py-0.5 text-[11px] font-medium transition-colors',
      on
        ? tone === 'pass' ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-red-600 bg-red-600 text-white'
        : 'border-line bg-surface text-muted hover:border-ink hover:text-ink')}>{label}</button>
  )
}

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(' ')
