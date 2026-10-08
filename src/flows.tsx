/*
 * Module-level flowcharts — the "big picture" drawing at the top of a module's
 * Logic chung page, in the same hand-drawn style as the requirement site's flow
 * drawings (JobCreateFlow, SharedQuotaFlow): a premise bar, numbered lanes, and
 * one amber box of rules that always hold.
 *
 * Every box is a fact the build already enforces; the drawing adds none of its
 * own. If a box and a table on the page ever disagree, the table is checked
 * against the build first and this file is the one to fix. Labels are Vietnamese
 * like the rest of the guide; screen and button names stay in English exactly as
 * the console prints them, so a reader can find them.
 */
import type { ReactNode } from 'react'

const INK = 'var(--color-ink)'
const MUT = 'var(--color-muted)'
const BR = 'var(--color-brand)'
const AMB = '#b45309'
const GRN = '#047857'

type Tone = 'plain' | 'brand' | 'money' | 'side' | 'stop' | 'wait'

/* A text halo in the page colour, so a label stays legible where an arrow has to
   pass under it — drawn after the arrow, it reads as the arrow ducking behind. */
const HALO = { stroke: 'var(--color-surface)', strokeWidth: 5, strokeLinejoin: 'round' as const, paintOrder: 'stroke' }

function Box({ x, y, w, h, title, sub, sub2, tone = 'plain' }: {
  x: number; y: number; w: number; h: number; title: string; sub?: string; sub2?: string; tone?: Tone
}) {
  const fill = tone === 'brand' ? 'var(--color-brand-soft)' : tone === 'money' ? '#ecfdf5' : tone === 'stop' ? '#fff1f2' : tone === 'wait' ? '#fffbeb' : 'var(--color-surface)'
  const stroke = tone === 'brand' ? BR : tone === 'money' ? GRN : tone === 'stop' ? '#e11d48' : tone === 'wait' ? AMB : 'var(--color-line)'
  const tc = tone === 'brand' ? BR : tone === 'money' ? GRN : tone === 'stop' ? '#be123c' : tone === 'wait' ? AMB : INK
  const lines = [sub, sub2].filter(Boolean) as string[]
  const top = y + h / 2 - (lines.length * 15) / 2 + 2
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={10} fill={fill} stroke={stroke} strokeWidth={1.5}
            strokeDasharray={tone === 'side' ? '5 4' : undefined} />
      <text x={x + w / 2} y={top} fontSize={12.5} fontWeight={700} textAnchor="middle" fill={tc}>{title}</text>
      {lines.map((l, i) => (
        <text key={i} x={x + w / 2} y={top + 16 + i * 15} fontSize={10.5} textAnchor="middle" fill={MUT}>{l}</text>
      ))}
    </g>
  )
}

function Arrow({ d, label, lx, ly, tone = 'plain', anchor = 'middle', dashed }: {
  d: string; label?: string; lx?: number; ly?: number; tone?: 'plain' | 'brand' | 'stop'; anchor?: 'start' | 'middle' | 'end'; dashed?: boolean
}) {
  const c = tone === 'brand' ? BR : tone === 'stop' ? '#e11d48' : '#b9b6ae'
  return (
    <g>
      <path d={d} fill="none" stroke={c} strokeWidth={1.8} strokeDasharray={dashed ? '5 4' : undefined}
            markerEnd={`url(#pf-${tone === 'brand' ? 'b' : tone === 'stop' ? 's' : 'p'})`} />
      {label && <text x={lx} y={ly} fontSize={10} fontWeight={600} textAnchor={anchor} fill={tone === 'brand' ? BR : tone === 'stop' ? '#be123c' : MUT} {...HALO}>{label}</text>}
    </g>
  )
}

function Lane({ y, h, label, children, w = 1172 }: { y: number; h: number; label: string; children?: ReactNode; w?: number }) {
  return (
    <g>
      <rect x={14} y={y} width={w} height={h} rx={10} fill="none" stroke="var(--color-line)" strokeWidth={1} strokeDasharray="2 5" />
      <text x={30} y={y + 20} fontSize={10.5} fontWeight={800} letterSpacing="0.04em" fill={MUT} {...HALO}>{label}</text>
      {children}
    </g>
  )
}

/** Wide drawings scroll sideways on a phone instead of shrinking their type. */
function Frame({ label, w, h, children }: { label: string; w: number; h: number; children: ReactNode }) {
  return (
    <div className="max-w-[1100px] overflow-x-auto rounded-lg border border-line bg-surface p-3">
      <p className="mb-1 text-[11px] text-faint sm:hidden">Sơ đồ rộng — kéo ngang để xem hết →</p>
      <svg viewBox={`0 0 ${w} ${h}`} className="h-auto w-full min-w-[880px]" role="img" aria-label={label}>
        <defs>
          {[['p', '#b9b6ae'], ['b', BR], ['s', '#e11d48']].map(([k, c]) => (
            <marker key={k} id={`pf-${k}`} viewBox="0 0 10 10" refX={9} refY={5} markerWidth={6} markerHeight={6} orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill={c} />
            </marker>
          ))}
        </defs>
        {children}
      </svg>
    </div>
  )
}

/* ── Product settings — từ catalogue tới tay khách ─────────────────────────────
   Five lanes, top to bottom, because that is the order things happen in and the
   order a tester walks: declare → sell → grant → spend → show. The one box in
   green is the only moment anything changes hands; everything above it is a
   definition, everything below it is a balance being spent. */
export function ProductFlow() {
  const col = [30, 320, 610, 900] // four Type columns, lanes ③–④
  const cw = 260
  const mid = (i: number) => col[i] + cw / 2
  return (
    <Frame label="Một sản phẩm đi từ lúc khai báo tới lúc khách dùng và hiện trên site" w={1200} h={938}>
      {/* premise */}
      <rect x={14} y={10} width={1172} height={56} rx={10} fill="var(--color-canvas)" stroke="var(--color-line)" strokeWidth={1.5} />
      <text x={32} y={34} fontSize={13} fontWeight={800} fill={INK}>MỘT SẢN PHẨM — khai một lần, bán qua CRM, cấp lúc phát hành hoá đơn, tiêu ở bốn nơi khác nhau</text>
      <text x={32} y={53} fontSize={11} fill={MUT}>
        Nhóm <tspan fontWeight={700} fill={INK}>Product settings</tspan> chỉ là <tspan fontWeight={700} fill={INK}>định nghĩa</tspan> — không màn hình nào ở đây cộng hay trừ số dư của khách.
        Field <tspan fontWeight={700} fill={INK}>Type</tspan> của product quyết định nó đi theo cột nào ở bước ③ và ④.
      </text>

      {/* ① declare */}
      <Lane y={82} h={150} label="① KHAI BÁO — Product settings · làm một lần, trước khi bán" />
      <Box x={30} y={116} w={210} h={74} title="Placements" sub="các vùng hiển thị trên site" sub2="mỗi vùng mang sẵn perk của thẻ tin" />
      <Arrow d="M 240 153 L 318 153" label="Placement slots" lx={279} ly={145} />
      <Box x={320} y={108} w={300} h={90} title="Product" sub="Type quyết định hoá đơn sẽ giao cái gì" sub2="Job posting: product CHÍNH LÀ một bậc tin" tone="brand" />
      <Arrow d="M 698 153 L 622 153" label="Ladder position" lx={660} ly={145} />
      <Box x={700} y={116} w={200} h={74} title="Posting ladder" sub="bậc nào đứng trên bậc nào" sub2="→ thứ tự Gợi ý trên site" />
      <path d="M 470 198 C 470 222, 1035 222, 1035 194" fill="none" stroke="#b9b6ae" strokeWidth={1.8} markerEnd="url(#pf-p)" />
      <text x={760} y={226} fontSize={10} fontWeight={600} textAnchor="middle" fill={MUT}>≥ 2 product gộp thành</text>
      <Box x={930} y={116} w={210} h={74} title="Package" sub="nhiều product · một dòng · một giá" sub2="cấp riêng từng thành phần" />

      {/* ② sell */}
      <Lane y={248} h={130} label="② BÁN — CRM · chỉ product và package đang Active mới chọn được" />
      <Arrow d="M 470 198 L 470 290" tone="brand" label="Active" lx={492} ly={262} anchor="start" />
      <Box x={30} y={292} w={210} h={70} title="Discount programmes" sub="mức giảm có sẵn, áp lên" sub2="cả báo giá — không gõ tay %" tone="side" />
      <Arrow d="M 240 327 L 318 327" />
      <Box x={320} y={292} w={300} h={70} title="Quotation" sub="1–3 option · khách chấp nhận một" sub2="báo giá Trial package chỉ chào product trial" />
      <Arrow d="M 620 327 L 668 327" tone="brand" label="chấp nhận" lx={644} ly={319} />
      <Box x={670} y={292} w={220} h={70} title="Purchase order" sub="đóng băng SẼ cấp những gì" sub2="— chưa cấp gì cả" />
      <Arrow d="M 890 327 L 928 327" tone="brand" />
      <Box x={930} y={286} w={240} h={82} title="Hoá đơn GTGT · Issued" sub="★ quota vào tài khoản NGAY lúc này" sub2="kế toán phát hành · không huỷ trong admin" tone="money" />

      {/* ③ grant — the bus from the invoice fans out to the four Types */}
      <Lane y={394} h={150} label="③ CẤP — theo Type, cùng một lần với phát hành hoá đơn · xem ở Service delivery → Quota usage" />
      <path d={`M 1050 368 L 1050 420 M ${mid(0)} 420 L 1050 420`} fill="none" stroke={GRN} strokeWidth={1.8} />
      {[0, 1, 2, 3].map((i) => (
        <path key={i} d={`M ${mid(i)} 420 L ${mid(i)} 436`} fill="none" stroke={GRN} strokeWidth={1.8} markerEnd="url(#pf-p)" />
      ))}
      <Box x={col[0]} y={440} w={cw} h={72} title="Job posting → N lượt đăng" sub="đúng bậc đã mua, không phải lượt bất kỳ" sub2="dùng trong 6–36 tháng từ ngày hoá đơn" />
      <Box x={col[1]} y={440} w={cw} h={72} title="CV search → N credit mở CV" sub="kích hoạt (khách bấm, hoặc HQ bấm hộ)" sub2="rồi chạy 30 hoặc 90 ngày" />
      <Box x={col[2]} y={440} w={cw} h={72} title="Placement booking → 1 khung ngày" sub="trên một vùng hiển thị" sub2="chiếm Slots consumed của vùng" />
      <Box x={col[3]} y={440} w={cw} h={72} title="Manual service → N lượt giao" sub="việc không tự động được —" sub2="ops giao tay rồi ghi nhận" />

      {/* ④ spend — arrows first, so the lane label and the note above sit over them */}
      {[0, 1, 2, 3].map((i) => (
        <path key={i} d={`M ${mid(i)} 512 L ${mid(i)} 594`} fill="none" stroke="#b9b6ae" strokeWidth={1.8} markerEnd="url(#pf-p)" />
      ))}
      <text x={30} y={533} fontSize={10.5} fill={MUT} {...HALO}>
        <tspan fontWeight={700} fill={INK}>Includes</tspan> cấp kèm thành dòng riêng, ghi “Included free” ·
        <tspan fontWeight={700} fill={INK}> Package</tspan> cấp từng thành phần thành dòng riêng ·
        <tspan fontWeight={700} fill={INK}> No limit</tspan> hiện “Unlimited” — không giới hạn số lượng, vẫn giới hạn thời gian.
      </text>
      <Lane y={560} h={140} label="④ TIÊU — mỗi Type tiêu ở một màn hình khác" />
      <Box x={col[0]} y={598} w={cw} h={82} title="Recruitment → Jobs → New job" sub="chọn công ty → Hoá đơn → Main product" sub2="Publish trừ đúng 1 lượt của bậc đó" />
      <Box x={col[1]} y={598} w={cw} h={82} title="Company site → Tìm ứng viên" sub="mở một CV = 1 credit" sub2="mở rồi là của cả công ty, vĩnh viễn" />
      <Box x={col[2]} y={598} w={cw} h={82} title="Content → Boosting → New ad" sub="chọn dòng PO còn lượt đặt" sub2="vùng đã đủ booking ngày đó → bị từ chối" />
      <Box x={col[3]} y={598} w={cw} h={82} title="Service delivery → Manual services" sub="giao xong → ghi nhận 1 lượt" sub2="số còn lại tự trừ" />

      {/* ⑤ show */}
      <Arrow d={`M ${mid(0)} 680 L ${mid(0)} 750`} tone="brand" />
      <Arrow d={`M ${mid(2)} 680 L ${mid(2)} 750`} tone="brand" />
      <Lane y={716} h={120} label="⑤ HIỂN THỊ — Jobseeker site · không ai gán tay tin nào vào vùng nào" />
      <Box x={30} y={754} w={550} h={66} title="Tin tự lên đúng các vùng trong Placement slots của bậc" sub="thứ tự trong danh sách Gợi ý theo Posting ladder · được đẩy lên đầu theo Auto-refresh" tone="brand" />
      <Box x={610} y={754} w={550} h={66} title="Banner / popup lên vùng Display đã đặt" sub="nhiều booking cùng ngày thì thay phiên dẫn đầu theo Rotation period" tone="brand" />

      {/* rules that always hold */}
      <rect x={14} y={852} width={1172} height={76} rx={10} fill="#fffbeb" stroke={AMB} strokeWidth={1.5} />
      <text x={32} y={874} fontSize={11.5} fontWeight={800} fill={AMB}>Những điều luôn đúng</text>
      <text x={32} y={893} fontSize={11} fill={MUT}>
        PO chưa cấp gì — chỉ hoá đơn <tspan fontWeight={700} fill={INK}>Issued</tspan> mới cấp · Product đã lên hoá đơn thì <tspan fontWeight={700} fill={INK}>khoá</tspan> Type, giá, fulfilment, role và cờ — muốn bán thứ khác thì tạo product mới · <tspan fontWeight={700} fill={INK}>Inactive</tspan> chỉ ngừng bán — đơn cũ vẫn nguyên.
      </text>
      <text x={32} y={911} fontSize={11} fill={MUT}>
        <tspan fontWeight={700} fill={INK}>Free product</tspan>: HQ đăng hộ bất kỳ công ty nào, không cần hoá đơn, không trừ quota — nhà tuyển dụng không bao giờ thấy nó · <tspan fontWeight={700} fill={INK}>Trial product</tspan> chỉ xuất hiện trong báo giá Trial package, và báo giá đó không chào gì khác.
      </text>
    </Frame>
  )
}


/** The one-line premise at the top of every drawing. */
function Premise({ title, children }: { title: string; children: ReactNode }) {
  return (
    <g>
      <rect x={14} y={10} width={1172} height={56} rx={10} fill="var(--color-canvas)" stroke="var(--color-line)" strokeWidth={1.5} />
      <text x={32} y={34} fontSize={13} fontWeight={800} fill={INK}>{title}</text>
      <text x={32} y={53} fontSize={11} fill={MUT}>{children}</text>
    </g>
  )
}

function Chip({ x, y, w, label, tone = 'plain' }: { x: number; y: number; w: number; label: string; tone?: Tone }) {
  const fill = tone === 'money' ? '#ecfdf5' : tone === 'stop' ? '#fff1f2' : tone === 'brand' ? 'var(--color-brand-soft)' : 'var(--color-surface)'
  const stroke = tone === 'money' ? GRN : tone === 'stop' ? '#e11d48' : tone === 'brand' ? BR : 'var(--color-line)'
  const tc = tone === 'money' ? GRN : tone === 'stop' ? '#be123c' : tone === 'brand' ? BR : INK
  return (
    <g>
      <rect x={x} y={y} width={w} height={26} rx={13} fill={fill} stroke={stroke} strokeWidth={1.3} />
      <text x={x + w / 2} y={y + 17} fontSize={10.5} fontWeight={700} textAnchor="middle" fill={tc}>{label}</text>
    </g>
  )
}

/* ── CRM — một công ty, ba chứng từ, một khoảnh khắc cấp quota ──────────────────
   Lanes top to bottom in the order a deal lives: the company has to exist and
   be owned before anything can be quoted; the three documents follow each other;
   the invoice's issue is the single green box; and the two axes that people
   wire to the documents by mistake (pipeline, payment) get a lane of their own
   so the drawing itself shows they run beside the chain, not inside it. */
export function CrmFlow() {
  return (
    <Frame label="CRM: từ một công ty tới lúc sản phẩm vào tài khoản khách" w={1200} h={860}>
      <Premise title="CRM — một công ty, ba chứng từ, đúng một khoảnh khắc cấp quota">
        Báo giá → PO → hoá đơn GTGT: mỗi chứng từ dựng từ chứng từ trước, <tspan fontWeight={700} fill={INK}>không gõ lại gì</tspan>, và tổng tiền phải khớp tới từng đồng.
        Chỉ <tspan fontWeight={700} fill={INK}>hoá đơn Issued</tspan> mới cấp quota.
      </Premise>

      {/* ① company — the three doors stacked, so each arrow has its own path in */}
      <Lane y={82} h={176} label="① CÔNG TY — ba cửa vào, một bảng Customers · chỉ Admin tạo công ty" />
      <Box x={30} y={110} w={300} h={42} title="A · Admin tạo: + New company" />
      <Box x={30} y={158} w={300} h={42} title="B · Sales xin từ Free data (2 cấp duyệt)" />
      <Box x={30} y={206} w={300} h={42} title="C · NTD tự đăng ký → Sign-ups" />
      <Arrow d="M 330 131 C 375 131, 375 173, 418 173" />
      <Arrow d="M 330 179 L 418 179" />
      <Arrow d="M 330 227 C 375 227, 375 185, 418 185" />
      <Box x={420} y={140} w={280} h={78} title="Customers — có sales owner" sub="đủ MST + hồ sơ xuất hoá đơn" sub2="Free data (chưa có owner): chưa bán được" tone="brand" />
      <Arrow d="M 700 179 L 758 179" />
      <Box x={760} y={134} w={410} h={90} title="Verified?" sub="Admin bấm Verify company, đối chiếu giấy ĐKKD (ERC)" sub2="chỉ khoá 2 việc: NTD đăng tin · sales xin hoá đơn chính thức" tone="wait" />

      {/* ② the document chain */}
      <Arrow d="M 560 218 C 560 262, 150 256, 150 306" tone="brand" label="+ Create quotation (trên hồ sơ công ty)" lx={420} ly={252} />
      <Lane y={268} h={196} label="② BÁN — chuỗi chứng từ · mỗi bước dựng từ bước trước, không sửa được sau khi phát hành" />
      <Box x={30} y={308} w={240} h={82} title="Quotation" sub="1–3 option, khách chọn MỘT" sub2="Draft → Sent → Issued to PO" />
      <Arrow d="M 270 349 L 328 349" tone="brand" label="Issue PO" lx={299} ly={341} />
      <Box x={330} y={308} w={230} h={82} title="Purchase order" sub="chép đúng option đã chấp nhận" sub2="Active = deal thắng · CHƯA cấp gì" />
      <Arrow d="M 560 349 L 698 349" tone="brand" />
      <text x={629} y={328} fontSize={10} fontWeight={700} textAnchor="middle" fill={BR}>Request official</text>
      <text x={629} y={341} fontSize={10} fontWeight={700} textAnchor="middle" fill={BR}>invoice · cần Verified</text>
      <Box x={700} y={308} w={180} h={82} title="Invoice requested" sub="hàng đợi của kế toán" sub2="vẫn chưa cấp gì" />
      <Arrow d="M 880 349 L 918 349" tone="brand" label="Issue" lx={899} ly={341} />
      <Box x={920} y={300} w={250} h={98} title="Hoá đơn GTGT · Issued" sub="★ chỉ kế toán bấm được" sub2="số pháp lý do nhà cung cấp HĐĐT cấp" tone="money" />
      <text x={1045} y={384} fontSize={10.5} textAnchor="middle" fill={MUT}>không có nút huỷ trong admin</text>
      <Arrow d="M 150 390 L 150 402" dashed />
      <Arrow d="M 445 390 L 445 402" dashed />
      <Arrow d="M 790 390 L 790 402" dashed />
      <Box x={30} y={404} w={850} h={48} title="Chưa thành hoá đơn trước CUỐI THÁNG → tự hết hạn" sub="báo giá Expired · PO Expired · hoá đơn nháp Archived — không cấp gì, nên không có gì để thu hồi" tone="side" />

      {/* ③ what issue does */}
      <Lane y={480} h={120} label="③ CÙNG MỘT LÚC KHI HOÁ ĐƠN ISSUED — không hàng đợi, không bấm lần hai" />
      <path d="M 1045 398 L 1045 504 M 155 504 L 1045 504" fill="none" stroke={GRN} strokeWidth={1.8} />
      {[155, 445, 745, 1045].map((x) => (
        <path key={x} d={`M ${x} 504 L ${x} 520`} fill="none" stroke={GRN} strokeWidth={1.8} markerEnd="url(#pf-p)" />
      ))}
      <Box x={30} y={524} w={250} h={62} title="Quota vào tài khoản" sub="Company → Products & billing" />
      <Box x={320} y={524} w={250} h={62} title="Khách New → Existing" sub="Customer since được ghi" />
      <Box x={620} y={524} w={250} h={62} title="Pipeline → Invoice · thắng" sub="thẻ không kéo được nữa" />
      <Box x={920} y={524} w={250} h={62} title="Đồng hồ “phải dùng trong” chạy" sub="từ ngày hoá đơn — mặc định 12 tháng" />

      {/* ④ the axes that run beside the chain */}
      <Lane y={616} h={150} label="④ HAI TRỤC CHẠY BÊN CẠNH — không trục nào kéo chứng từ, chứng từ cũng không kéo chúng" />
      <text x={30} y={662} fontSize={11} fontWeight={700} fill={INK}>Pipeline</text>
      <Chip x={110} y={647} w={96} label="Proposal" />
      <Chip x={222} y={647} w={96} label="Qualified" />
      <Chip x={334} y={647} w={110} label="Negotiation" />
      <Chip x={460} y={647} w={60} label="PO" tone="brand" />
      <Chip x={536} y={647} w={80} label="Invoice" tone="money" />
      <Chip x={652} y={647} w={70} label="Lost" tone="stop" />
      <text x={110} y={692} fontSize={10.5} fill={MUT}>Sales kéo 3 cột đầu · PO và Invoice chỉ hệ thống đặt · Lost luôn kèm lý do · tối đa MỘT deal mở mỗi công ty</text>
      <text x={30} y={728} fontSize={11} fontWeight={700} fill={INK}>Thanh toán</text>
      <Chip x={110} y={713} w={80} label="Unpaid" />
      <Chip x={206} y={713} w={120} label="Partially paid" />
      <Chip x={342} y={713} w={60} label="Paid" tone="money" />
      <text x={420} y={730} fontSize={10.5} fill={MUT}>kế toán xác nhận chuyển khoản · <tspan fontWeight={700} fill={INK}>không bao giờ chặn hoá đơn</tspan>, và không cấp quota lần nữa</text>
      <text x={30} y={756} fontSize={10.5} fill={MUT}>Mất deal không đổi trạng thái khách hàng · báo giá hết hạn KHÔNG phải Lost — công ty chỉ rời bảng, deal vẫn giữ chặng của nó.</text>

      {/* rules */}
      <rect x={14} y={782} width={1172} height={68} rx={10} fill="#fffbeb" stroke={AMB} strokeWidth={1.5} />
      <text x={32} y={804} fontSize={11.5} fontWeight={800} fill={AMB}>Những điều luôn đúng</text>
      <text x={32} y={823} fontSize={11} fill={MUT}>
        PO chưa cấp gì · tiền về chưa cấp gì · hoá đơn nháp chưa cấp gì — chỉ <tspan fontWeight={700} fill={INK}>Issued</tspan> · Không có nút Huỷ cho PO lẫn hoá đơn · Báo giá và PO hết hạn <tspan fontWeight={700} fill={INK}>cuối tháng</tspan>, không phải sau 30 ngày.
      </text>
      <text x={32} y={841} fontSize={11} fill={MUT}>
        Sales không tạo công ty, không phát hành hoá đơn · Người có chỉ tiêu theo deal không phải người bấm nút giao hàng — quyền <tspan fontWeight={700} fill={INK}>invoice:issue</tspan> chỉ kế toán / HQ admin giữ.
      </text>
    </Frame>
  )
}

/* ── CRM intake — hai cửa có duyệt: Free data và Sign-ups ─────────────────────── */
export function CrmIntakeFlow() {
  return (
    <Frame label="Hai cửa vào có duyệt: nhận công ty từ Free data, và nhà tuyển dụng tự đăng ký" w={1200} h={600}>
      <Premise title="HAI CỬA CÓ DUYỆT — sales xin công ty, nhà tuyển dụng tự đăng ký">
        Free data là cùng bảng Customers nhưng <tspan fontWeight={700} fill={INK}>chưa có ai phụ trách</tspan> — không báo giá được. Người tự đăng ký đi qua <tspan fontWeight={700} fill={INK}>hai cổng</tspan>, theo đúng thứ tự.
      </Premise>

      {/* Free data claim */}
      <Lane y={82} h={226} label="CỬA B — NHẬN CÔNG TY TỪ FREE DATA · hai cấp duyệt, mỗi lúc chỉ một yêu cầu mở" />
      <Box x={30} y={114} w={200} h={70} title="Sales: Ask for this company" sub="lý do · loại khách · bằng chứng" />
      <Arrow d="M 230 149 L 248 149" tone="brand" />
      <Box x={250} y={114} w={210} h={70} title="Waiting · step 1 · Admin" sub="người khác không xin được nữa" tone="wait" />
      <Arrow d="M 460 149 L 558 149" tone="brand" label="Approve · Admin" lx={509} ly={141} />
      <Box x={560} y={114} w={220} h={70} title="Waiting · step 2 · Sales lead" sub="cần MST mới Approve được" tone="wait" />
      <Arrow d="M 780 149 L 838 149" tone="brand" label="Approve" lx={809} ly={141} />
      <Box x={840} y={106} w={330} h={86} title="Customers — rep là sales owner" sub="người liên hệ trên form thành liên hệ #1" sub2="mọi yêu cầu mở khác bị từ chối" tone="money" />
      <Arrow d="M 355 184 L 355 228" tone="stop" label="Reject" lx={375} ly={210} anchor="start" />
      <Arrow d="M 670 184 L 670 228" tone="stop" label="Reject — dừng hẳn, không trả về Admin" lx={690} ly={210} anchor="start" />
      <Box x={250} y={230} w={530} h={56} title="Quay về Not claimed · “Rejected N time(s) before”" sub="ai cũng xin lại được, kể cả rep cũ — bị từ chối KHÔNG phải một trạng thái" tone="stop" />
      <Arrow d="M 1005 286 L 1005 196" dashed label="Admin: Assign directly — bỏ qua cả hai cấp" lx={995} ly={268} anchor="end" />

      {/* Sign-up two gates */}
      <Lane y={326} h={200} label="CỬA C — NHÀ TUYỂN DỤNG TỰ ĐĂNG KÝ · cổng ① mở đăng nhập, cổng ② mở đăng tin và hoá đơn" />
      <Box x={30} y={358} w={160} h={72} title="① Đăng ký" sub="Company site: MST, ERC," sub2="tài khoản, mật khẩu" />
      <Arrow d="M 190 394 L 208 394" />
      <Box x={210} y={358} w={160} h={72} title="② Xác minh email" sub="dòng mới ở Sign-ups" sub2="vẫn chưa đăng nhập được" />
      <Arrow d="M 370 394 L 388 394" />
      <Box x={390} y={350} w={210} h={88} title="CỔNG ① · Admin xử lý" sub="Move to existing company" sub2="hoặc Create company & activate" tone="brand" />
      <Arrow d="M 600 394 L 658 394" tone="brand" label="mở login" lx={629} ly={386} />
      <Box x={660} y={358} w={140} h={72} title="Unverified" sub="đăng nhập được," sub2="Post job bị khoá" tone="wait" />
      <Arrow d="M 800 394 L 858 394" label="tải ERC" lx={829} ly={386} />
      <Box x={860} y={358} w={140} h={72} title="Waiting to verify" sub="hàng đợi của Admin" tone="wait" />
      <Arrow d="M 1000 394 L 1018 394" />
      <Box x={1020} y={350} w={150} h={88} title="CỔNG ② · Verified" sub="Admin bấm Verify" sub2="→ đăng tin + xin HĐ" tone="money" />
      <Arrow d="M 1095 438 C 1095 486, 930 486, 930 432" tone="stop" label="Admin sửa tên pháp lý / MST / địa chỉ → rơi về Waiting" lx={1010} ly={500} />
      <text x={390} y={470} fontSize={10.5} fill={MUT}>Archive = từ chối (lý do gửi qua email) — không tạo login, không tạo công ty.</text>
      <text x={390} y={486} fontSize={10.5} fill={MUT}>Cột <tspan fontWeight={700} fill={INK}>Match</tspan> chỉ gợi ý, không quyết định gì. Email gmail không bao giờ khớp.</text>

      <rect x={14} y={540} width={1172} height={50} rx={10} fill="#fffbeb" stroke={AMB} strokeWidth={1.5} />
      <text x={32} y={561} fontSize={11.5} fontWeight={800} fill={AMB}>Không ai được đặt vào một công ty không tồn tại hoặc chưa có owner</text>
      <text x={32} y={579} fontSize={11} fill={MUT}>
        Move bị chặn khi MST chưa khớp công ty nào (“tạo công ty trước”) hoặc công ty còn ở Free data (“đưa sang Customers trước”). Dòng chưa xác minh email chỉ Archive được.
      </text>
    </Frame>
  )
}

export const DIAGRAMS: Record<string, () => JSX.Element> = {
  'product-chain': ProductFlow,
  'crm-chain': CrmFlow,
  'crm-intake': CrmIntakeFlow,
}
