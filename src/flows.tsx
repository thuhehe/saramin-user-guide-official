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

      {/* ① company — two doors, plus the sign-up drawn DASHED: it places a person into a
          company already on Customers, it is not a third door (08/10/2026) */}
      <Lane y={82} h={176} label="① CÔNG TY — hai cửa vào, một bảng Customers · chỉ Admin tạo công ty" />
      <Box x={30} y={110} w={300} h={42} title="A · Admin tạo: + New company" />
      <Box x={30} y={158} w={300} h={42} title="B · Sales xin từ Free data (2 cấp duyệt)" />
      <Box x={30} y={206} w={300} h={42} title="NTD tự đăng ký → Admin đặt người vào (Sign-ups)" tone="side" />
      <Arrow d="M 330 131 C 375 131, 375 173, 418 173" />
      <Arrow d="M 330 179 L 418 179" />
      <Arrow d="M 330 227 C 375 227, 375 185, 418 185" dashed />
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
/* ── CRM — three drawings, three questions (split 08/10/2026, client feedback) ──
   The old single drawing carried the Free data claim AND the sign-up gates in two
   lanes, and read as one flow: the sign-up's "Free data" case looked like a third
   way out of the pool. They are independent, so each has its own drawing:
     crm-intake  — a COMPANY: how it is created, and Free data → Customers (Assigned)
     crm-signup  — a PERSON: the Sign-ups row and the admin's three actions
     crm-verify  — the company's verification STATUS once someone is inside */
export function CrmIntakeFlow() {
  return (
    <Frame label="Một công ty vào CRM: tạo ở đâu, và đi từ Free data sang Customers (Assigned) bằng đường nào" w={1200} h={424}>
      <Premise title="MỘT BẢNG CÔNG TY, HAI TRẠNG THÁI — Free data (chưa có owner) và Customers · Assigned (có owner)">
        Chỉ <tspan fontWeight={700} fill={INK}>Admin</tspan> tạo công ty. Sales không tạo — chỉ <tspan fontWeight={700} fill={INK}>xin</tspan> một công ty Free data, qua hai cấp duyệt. Sơ đồ này không có người đăng ký: sign-up đi luồng riêng, bên dưới.
      </Premise>

      {/* creation — one form; the owner field decides which state it lands in */}
      <Box x={30} y={84} w={360} h={64} title="Admin · Customers → + New company" sub="tên pháp lý · MST (Check) · xuất hoá đơn · liên hệ" sub2="MST trùng → bị từ chối, nêu công ty đang giữ" tone="brand" />
      <Arrow d="M 180 148 L 180 210" label="để trống sales owner" lx={192} ly={184} anchor="start" />
      <Arrow d="M 390 116 C 900 116, 1005 130, 1005 208" tone="brand" label="có sales owner" lx={760} ly={108} />

      {/* the two states */}
      <Box x={30} y={212} w={300} h={96} title="FREE DATA" sub="chưa có owner · không báo giá được" sub2="Not claimed · Waiting step 1 / 2" tone="wait" />
      <Box x={840} y={212} w={330} h={96} title="CUSTOMERS · Assigned" sub="có sales owner" sub2="báo giá → PO → hoá đơn" tone="money" />

      {/* Free data → Customers, two roads */}
      <text x={400} y={206} fontSize={10.5} fontWeight={800} letterSpacing="0.04em" fill={MUT}>SANG ASSIGNED — 2 ĐƯỜNG</text>
      <Box x={400} y={216} w={370} h={40} title="A · Sales: Ask for this company → Admin → Sales lead" />
      <Box x={400} y={266} w={370} h={40} title="B · Admin: Assign directly (bỏ qua hai cấp duyệt)" />
      <Arrow d="M 330 236 L 398 236" tone="brand" />
      <Arrow d="M 330 286 L 398 286" tone="brand" />
      <Arrow d="M 770 236 C 806 236, 806 252, 838 252" tone="brand" />
      <Arrow d="M 770 286 C 806 286, 806 270, 838 270" tone="brand" />
      <text x={585} y={328} fontSize={10.5} fontWeight={700} textAnchor="middle" fill={AMB}>Cả hai đường đều cần MST — thiếu MST thì nút Approve (lead) / Assign (Admin) bị khoá</text>
      <text x={585} y={344} fontSize={10.5} textAnchor="middle" fill={MUT}>Xong thì công ty rời Free data. Bị từ chối ở bước nào cũng về Not claimed · “Rejected N time(s) before” — không phải một trạng thái.</text>
      <text x={585} y={360} fontSize={10.5} textAnchor="middle" fill={MUT}>Return to the pool đưa một công ty Assigned về lại Free data, kèm lịch sử.</text>

      <rect x={14} y={378} width={1172} height={36} rx={8} fill="#fffbeb" stroke={AMB} strokeWidth={1.2} />
      <text x={30} y={400} fontSize={11} fill={MUT}><tspan fontWeight={800} fill={AMB}>Luật · </tspan>Công ty phải ở <tspan fontWeight={700} fill={INK}>Customers · Assigned</tspan> trước khi bất kỳ ai được đặt vào nó. Công ty không có MST không bao giờ đăng tin công khai hay xuất hoá đơn được.</text>
    </Frame>
  )
}

/* The PERSON's flow. A sign-up never moves a company: it places someone into a
   company that is already Assigned. So Sign-ups has three actions and no merge —
   a Free-data match is two steps, the first one on the Free data company itself.
   The build says exactly this in the Move dialog ("That company is still in Free
   data … Promote it to Customers first, then come back"). */
export function CrmSignupFlow() {
  return (
    <Frame label="Nhà tuyển dụng tự đăng ký: dòng Sign-ups và ba hành động của Admin" w={1200} h={520}>
      <Premise title="SIGN-UP — ĐẶT MỘT NGƯỜI VÀO MỘT CÔNG TY · độc lập với sơ đồ Free data / Customers">
        Xác minh email chỉ chứng minh địa chỉ email — <tspan fontWeight={700} fill={INK}>chưa có login</tspan>. Login chỉ mở khi Admin <tspan fontWeight={700} fill={INK}>Move</tspan> hoặc <tspan fontWeight={700} fill={INK}>Create</tspan>. Archive = không cho vào.
      </Premise>

      <text x={30} y={96} fontSize={10.5} fontWeight={800} letterSpacing="0.04em" fill={MUT}>COMPANY SITE</text>
      <text x={390} y={96} fontSize={10.5} fontWeight={800} letterSpacing="0.04em" fill={MUT}>ADMIN · CRM → SIGN-UPS</text>
      <text x={700} y={96} fontSize={10.5} fontWeight={800} letterSpacing="0.04em" fill={MUT}>3 HÀNH ĐỘNG (menu ⋯)</text>
      <text x={1004} y={96} fontSize={10.5} fontWeight={800} letterSpacing="0.04em" fill={MUT}>KẾT QUẢ</text>

      <Box x={30} y={110} w={160} h={72} title="① Sign up" sub="MST · tên công ty · ERC" sub2="họ tên · email · mật khẩu" />
      <Arrow d="M 190 146 L 208 146" tone="brand" />
      <Box x={210} y={110} w={160} h={72} title="② Xác minh email" sub="chỉ xác thực email" sub2="chưa đăng nhập được" />
      <Arrow d="M 370 146 L 388 146" tone="brand" />
      <Box x={390} y={110} w={200} h={72} title="③ Dòng trên Sign-ups" sub="cột Match: Customers?" sub2="Free data? không có?" tone="brand" />
      <text x={490} y={204} fontSize={10.5} textAnchor="middle" fill={MUT}>Match chỉ gợi ý, không quyết định.</text>
      <text x={490} y={219} fontSize={10.5} textAnchor="middle" fill={MUT}>Dòng chưa xác minh email (Awaiting)</text>
      <text x={490} y={234} fontSize={10.5} textAnchor="middle" fill={MUT}>chỉ Archive được.</text>

      {/* branches */}
      <Arrow d="M 590 128 L 698 128" tone="brand" label="khớp Customers" lx={644} ly={120} />
      <Arrow d="M 590 152 C 640 152, 640 268, 698 268" tone="brand" label="khớp Free data" lx={646} ly={250} />
      <Arrow d="M 576 182 C 600 300, 640 368, 698 368" tone="brand" label="công ty mới thật" lx={624} ly={330} anchor="end" />
      <Arrow d="M 520 242 C 520 440, 620 452, 698 452" tone="stop" label="spam · test · trùng" lx={560} ly={420} anchor="end" />

      <Box x={700} y={104} w={270} h={70} title="Move to existing company" sub="chọn công ty đích (Assigned) + role" sub2="không tạo công ty nào" tone="money" />
      <Box x={700} y={232} w={270} h={74} title="Bước 1 · Đưa công ty sang Assigned" sub="trên hồ sơ Free data: Assign directly" sub2="(cần MST) — rồi quay lại Sign-ups" tone="wait" />
      <Arrow d="M 836 232 L 836 176" tone="brand" label="Bước 2 · Move" lx={846} ly={208} anchor="start" />
      <Box x={700} y={332} w={270} h={74} title="Create company & activate" sub="mở form New company, điền sẵn từ dòng" sub2="lưu = người đó là admin đầu tiên" tone="money" />
      <Box x={700} y={428} w={270} h={50} title="Archive" sub="lý do gửi email · không login, không công ty" tone="stop" />

      <Arrow d="M 970 139 C 1060 139, 1080 190, 1080 222" tone="brand" />
      <Arrow d="M 970 369 C 1060 369, 1080 330, 1080 300" tone="brand" />
      <Box x={1000} y={224} w={176} h={76} title="Login MỞ" sub="email đăng nhập" sub2="→ luồng xác minh công ty" tone="money" />
      <Arrow d="M 970 453 L 998 453" tone="stop" />
      <Box x={1000} y={428} w={176} h={50} title="Không vào được" sub="dòng Archived" tone="stop" />

      <rect x={14} y={488} width={1172} height={26} rx={8} fill="#fffbeb" stroke={AMB} strokeWidth={1.2} />
      <text x={30} y={505} fontSize={11} fill={MUT}><tspan fontWeight={800} fill={AMB}>Luật · </tspan>Đúng 3 hành động. Không có “gộp Free data”: hộp thoại Move dừng ở <tspan fontWeight={700} fill={INK}>“That company is still in Free data”</tspan> — đưa sang Assigned trước, rồi mới Move.</text>
    </Frame>
  )
}

/* The company's verification status, once someone is inside. One stored verdict;
   Waiting is derived from a document being on file (svn-be V482), so no arrow
   here is "set the status" — an upload, a Verify press or an admin edit moves it. */
export function CrmVerifyFlow() {
  const gate = (x: number, rows: [string, 'ok' | 'no' | 'admin'][]) => (
    <g>
      <rect x={x} y={300} width={320} height={rows.length * 22 + 14} rx={8} fill="none" stroke="var(--color-line)" strokeWidth={1} />
      {rows.map(([t, s], i) => (
        <g key={t}>
          <text x={x + 14} y={320 + i * 22} fontSize={12} fontWeight={800} fill={s === 'ok' ? GRN : s === 'admin' ? AMB : '#be123c'}>{s === 'ok' ? '✓' : s === 'admin' ? '●' : '✕'}</text>
          <text x={x + 32} y={320 + i * 22} fontSize={11} fill={INK}>{t}</text>
        </g>
      ))}
    </g>
  )
  return (
    <Frame label="Trạng thái xác minh công ty: Unverified, Waiting to verify, Verified" w={1200} h={470}>
      <Premise title="XÁC MINH CÔNG TY — 3 TRẠNG THÁI · bắt đầu sau khi người đăng ký đã vào (Move / Create)">
        Không ai “chọn” trạng thái: <tspan fontWeight={700} fill={INK}>tải giấy ĐKKD</tspan>, nút <tspan fontWeight={700} fill={INK}>Verify company</tspan> và việc Admin <tspan fontWeight={700} fill={INK}>sửa dữ liệu định danh</tspan> làm nhãn đổi theo.
      </Premise>

      <Box x={30} y={100} w={320} h={92} title="Unverified" sub="chưa có giấy ĐKKD trên hồ sơ" sub2="chờ KHÁCH tải lên" tone="side" />
      <Arrow d="M 350 146 L 438 146" tone="brand" label="tải ERC" lx={394} ly={138} />
      <text x={394} y={164} fontSize={10} textAnchor="middle" fill={MUT} {...HALO}>khách / admin</text>
      <Box x={440} y={100} w={320} h={92} title="Waiting to verify" sub="đã có giấy, chưa ai xét" sub2="chờ ADMIN đối chiếu và bấm Verify" tone="wait" />
      <Arrow d="M 760 146 L 848 146" tone="brand" label="Verify" lx={804} ly={138} />
      <text x={804} y={164} fontSize={10} textAnchor="middle" fill={MUT} {...HALO}>Admin</text>
      <Box x={850} y={100} w={320} h={92} title="Verified" sub="Admin đã đối chiếu giấy với hồ sơ" sub2="không chờ ai" tone="money" />
      <Arrow d="M 1010 192 C 1010 250, 640 250, 600 196" tone="stop" dashed />
      <text x={800} y={246} fontSize={10.5} fontWeight={600} textAnchor="middle" fill="#be123c" {...HALO}>Admin sửa tên pháp lý / MST / địa chỉ đăng ký + Save → về Waiting to verify</text>
      <text x={190} y={214} fontSize={10.5} textAnchor="middle" fill={MUT}>Bấm Verify ở đây → “There is no paperwork</text>
      <text x={190} y={229} fontSize={10.5} textAnchor="middle" fill={MUT}>to rule on yet” → Company documents</text>

      <text x={30} y={290} fontSize={10.5} fontWeight={800} letterSpacing="0.04em" fill={MUT}>MỖI TRẠNG THÁI CHO LÀM GÌ</text>
      {gate(30, [['Đăng nhập · đọc · tải giấy', 'ok'], ['Sửa Company information', 'ok'], ['Đăng tin — kể cả lưu nháp', 'no'], ['Sales: Request official invoice', 'no']])}
      {gate(440, [['Đăng nhập · đọc · tải thêm giấy', 'ok'], ['Sửa Company information', 'ok'], ['Đăng tin — kể cả lưu nháp', 'no'], ['Sales: Request official invoice', 'no'], ['Admin: Verify company bấm được', 'admin']])}
      {gate(850, [['Đăng nhập · đọc · tải thêm giấy', 'ok'], ['Company information: chỉ đọc', 'no'], ['Đăng tin', 'ok'], ['Sales: Request official invoice', 'ok']])}

      <rect x={14} y={432} width={1172} height={30} rx={8} fill="#fffbeb" stroke={AMB} strokeWidth={1.2} />
      <text x={30} y={451} fontSize={11} fill={MUT}><tspan fontWeight={800} fill={AMB}>Luật · </tspan>Verified gate <tspan fontWeight={700} fill={INK}>đúng hai việc</tspan>: khách đăng tin · sales xin hoá đơn chính. Không có “Rejected” — không Verify được thì giữ nguyên; dừng hẳn thì Archive công ty.</text>
    </Frame>
  )
}

/* ── Resume management — trạng thái CV quyết định cái gì ───────────────────────
   The requirement's "How CV status drives Application status and CV search
   status", drawn AS BUILT. Rows are the four CV statuses, read left to right
   only. The search column no longer hangs off the status column: since SRM-777
   (29/09) presence in /search reads the candidate's own switch, so the drawing
   shows that switch feeding it and keeps the requirement's gate as one dashed
   box — a difference a tester has to see, not discover. */
export function CvStatusFlow() {
  const rows = [106, 190, 274, 358]
  const mid = (i: number) => rows[i] + 34
  const status: { title: string; sub: string; sub2: string; tone: Tone }[] = [
    { title: 'Đạt', sub: 'máy quét · mặc định khi cờ tắt · HQ Approve', sub2: 'ứng viên thấy: không nhãn', tone: 'money' },
    { title: 'Chưa đủ thông tin', sub: 'máy quét — tạm thời, là câu hỏi', sub2: 'ứng viên thấy: Unfinished', tone: 'wait' },
    { title: 'Không đọc được', sub: 'máy quét, chỉ file tải lên — tạm thời', sub2: 'ứng viên thấy: Unfinished', tone: 'wait' },
    { title: 'Từ chối', sub: 'chỉ HQ — chung cuộc', sub2: 'ứng viên thấy: Can’t read + lời nhắn', tone: 'stop' },
  ]
  const app: { title: string; sub: string; sub2?: string; tone: Tone }[] = [
    { title: 'Sent', sub: 'tới tab Jobs của công ty ngay', sub2: 'liên hệ mở sẵn, không tốn credit', tone: 'money' },
    { title: 'Not sent', sub: 'giữ lại — không gì tự gửi theo giờ', sub2: 'chỉ HQ Approve thả ra', tone: 'wait' },
    { title: 'Not sent', sub: 'giữ lại — y hệt dòng trên', sub2: 'khác nhau chỉ ở thứ HQ phải nhìn', tone: 'wait' },
    { title: 'Not sent · Recall', sub: 'đang giữ: không bao giờ gửi', sub2: 'đã gửi đúng version này: kéo lại', tone: 'stop' },
  ]
  return (
    <Frame label="Trạng thái CV quyết định đơn ứng tuyển; công tắc Show CV quyết định tìm kiếm CV" w={1200} h={560}>
      <Premise title="MỘT TRẠNG THÁI, MỘT CÔNG TẮC — trạng thái CV quyết định đơn; công tắc của ứng viên quyết định tìm kiếm">
        Đọc <tspan fontWeight={700} fill={INK}>từ trái sang phải</tspan>. Không mũi tên nào quay lại — bên phải không có gì để đặt tay.
        Ô đứt nét là <tspan fontWeight={700} fill={INK}>requirement</tspan>, build đã bỏ từ 29/09 (SRM-777).
      </Premise>

      <text x={30} y={94} fontSize={10.5} fontWeight={800} letterSpacing="0.04em" fill={MUT}>TRẠNG THÁI CV · thứ duy nhất được lưu</text>
      <text x={470} y={94} fontSize={10.5} fontWeight={800} letterSpacing="0.04em" fill={MUT}>ĐƠN ỨNG TUYỂN · suy ra, theo từng đơn</text>
      <text x={850} y={94} fontSize={10.5} fontWeight={800} letterSpacing="0.04em" fill={MUT}>TÌM KIẾM CV CỦA CÔNG TY · /search</text>

      {status.map((s, i) => (
        <g key={i}>
          <Box x={30} y={rows[i]} w={300} h={68} title={s.title} sub={s.sub} sub2={s.sub2} tone={s.tone} />
          <Arrow d={`M 330 ${mid(i)} L 468 ${mid(i)}`} tone={i === 0 ? 'brand' : i === 3 ? 'stop' : 'plain'} />
          <Box x={470} y={rows[i]} w={300} h={68} title={app[i].title} sub={app[i].sub} sub2={app[i].sub2} tone={app[i].tone} />
        </g>
      ))}

      {/* the build's search: the candidate's switch, nothing else */}
      <Box x={850} y={106} w={320} h={68} title="Show CV to employers" sub="ứng viên bật · một CV một lúc" sub2="hoặc hệ thống, cho file tải lên đầu tiên" tone="brand" />
      <Arrow d="M 1010 174 L 1010 228" tone="brand" label="bật" lx={1022} ly={205} anchor="start" />
      <Box x={850} y={230} w={320} h={86} title="Có mặt trong kho" sub="tên + liên hệ che tới khi công ty mở khoá" sub2="KHÔNG đọc trạng thái CV" tone="brand" />
      <Box x={850} y={350} w={320} h={76} title="Requirement: chỉ Đạt mới Showing" sub="nghi ngờ / từ chối → Hidden, rời kho" sub2="build bỏ cổng này từ 29/09" tone="side" />
      <Arrow d="M 180 426 L 180 446 L 1010 446 L 1010 428" dashed label="requirement: trạng thái CV cũng quyết định tìm kiếm" lx={600} ly={442} />

      <rect x={14} y={470} width={1172} height={80} rx={10} fill="#fffbeb" stroke={AMB} strokeWidth={1.5} />
      <text x={32} y={491} fontSize={11.5} fontWeight={800} fill={AMB}>Bốn điều luôn đúng</text>
      <text x={32} y={509} fontSize={11} fill={MUT}>
        ① HQ quyết <tspan fontWeight={700} fill={INK}>CV</tspan>, không bao giờ quyết đơn — một lần Approve thả mọi đơn đang giữ.
        ② Máy quét chỉ được <tspan fontWeight={700} fill={INK}>nghi ngờ</tspan>; Từ chối chỉ do người ghi.
      </text>
      <text x={32} y={527} fontSize={11} fill={MUT}>
        ③ <tspan fontWeight={700} fill={INK}>Recall</tspan> chỉ có khi đơn đã được GỬI rồi CV mới bị từ chối — từ chối một CV còn nghi ngờ thì đơn chỉ ở lại Not sent.
      </text>
      <text x={32} y={543} fontSize={11} fill={MUT}>
        ④ Không gì được thả theo giờ — hàng đợi không ai làm là ứng viên bị chặn, không phải việc tồn nội bộ.
      </text>
    </Frame>
  )
}

export const DIAGRAMS: Record<string, () => JSX.Element> = {
  'product-chain': ProductFlow,
  'crm-chain': CrmFlow,
  'crm-intake': CrmIntakeFlow,
  'crm-signup': CrmSignupFlow,
  'crm-verify': CrmVerifyFlow,
  'cv-status': CvStatusFlow,
}
