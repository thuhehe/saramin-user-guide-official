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
        Tìm kiếm cần <tspan fontWeight={700} fill={INK}>cả hai</tspan>: công tắc bật, và CV <tspan fontWeight={700} fill={INK}>Qualified</tspan> (tài liệu Talent pool 16/10).
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
      <Box x={850} y={230} w={320} h={86} title="Có mặt trong kho" sub="tên + liên hệ che tới khi công ty mở khoá" sub2="vào kho Admin" tone="brand" />
      <Box x={850} y={350} w={320} h={76} title="Chỉ Qualified mới Showing" sub="NTD chỉ tìm thấy ứng viên Showing" sub2="nghi ngờ / từ chối → Hidden" tone="money" />
      <Arrow d="M 180 426 L 180 446 L 1010 446 L 1010 428" label="trạng thái CV cũng quyết định tìm kiếm" lx={600} ly={442} />

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

/* ── Master data — sáu sơ đồ theo tài liệu Master data 14/10/2026 ───────────────
   Each drawing answers one question the page's tables cannot show at a glance:
   who writes and who reads; what a delete does, by how a record stores the value;
   the taxonomy tree and what a change does to a job; how a taxonomy import reads a
   row; why Industries is text, not a code; and how Missing skills feeds CVs back. */
export function MdOverviewFlow() {
  const left: [string, string][] = [
    ['Thêm / sửa / xóa từng dòng', 'không ghi Audit log'],
    ['Import / Export', 'xem trước → Apply · ghi master_data.import'],
    ['Duyệt Missing skills', 'Approve + back-fill · ghi skill_gap.adopt'],
  ]
  const right: [string, string][] = [
    ['Form tin đăng', 'ngành nghề, cấp bậc, hợp đồng, kỹ năng, Job tags'],
    ['Trang công ty / CRM', 'Industries, Company tags, Countries, Business forms'],
    ['Đăng ký / hồ sơ ứng viên', 'học vấn, kinh nghiệm, quốc tịch, ngành mong muốn'],
    ['Bộ lọc tìm CV', 'của nhà tuyển dụng'],
    ['Đọc và sàng CV', 'so chữ tự do trong CV với Skills + alias'],
    ['Chấm điểm khớp', 'đọc thứ tự Job levels'],
  ]
  const ly = (i: number) => 100 + i * 100
  const ry = (i: number) => 88 + i * 58
  return (
    <Frame label="Master data: ai ghi, ai đọc" w={1200} h={486}>
      <Premise title="MASTER DATA — một nơi ghi, mọi module chỉ đọc">
        Mọi ô chọn trên hệ thống đọc từ đây. Muốn sửa danh mục thì sửa ở <tspan fontWeight={700} fill={INK}>System › Master data</tspan>, không sửa ở module dùng nó.
      </Premise>
      <text x={30} y={90} fontSize={10.5} fontWeight={800} letterSpacing="0.04em" fill={MUT}>ADMIN › MASTER DATA</text>
      <text x={840} y={80} fontSize={10.5} fontWeight={800} letterSpacing="0.04em" fill={MUT}>CÁC MODULE CHỈ ĐỌC</text>
      {left.map(([t, s], i) => (
        <g key={t}>
          <Box x={30} y={ly(i)} w={300} h={70} title={t} sub={s} />
          <Arrow d={`M 330 ${ly(i) + 35} C 400 ${ly(i) + 35}, 400 236, 468 236`} tone="brand" />
        </g>
      ))}
      <Box x={470} y={186} w={260} h={100} title="Danh mục dùng chung" sub="17 tab · mỗi tab một quyền riêng" sub2="bản ghi lưu MÃ hoặc lưu CHỮ" tone="brand" />
      {right.map(([t, s], i) => (
        <g key={t}>
          <Arrow d={`M 730 236 C 785 236, 785 ${ry(i) + 24}, 838 ${ry(i) + 24}`} />
          <Box x={840} y={ry(i)} w={330} h={48} title={t} sub={s} />
        </g>
      ))}
      <rect x={14} y={444} width={1172} height={32} rx={8} fill="#fffbeb" stroke={AMB} strokeWidth={1.2} />
      <text x={30} y={464} fontSize={11} fill={MUT}><tspan fontWeight={800} fill={AMB}>Luật · </tspan>Thiếu quyền đọc một danh mục thì <tspan fontWeight={700} fill={INK}>chỉ tab đó bị ẩn</tspan>. Mục menu hiện theo <tspan fontWeight={700} fill={INK}>region:read</tspan>. Ô tìm kiếm bị xóa khi chuyển tab.</text>
    </Frame>
  )
}

export function MdDeleteFlow() {
  const rows: { cat: string; s1: string; s2?: string; out: string; o1: string; o2?: string; tone: Tone }[] = [
    { cat: 'Business forms · Job tags', s1: 'chặn xóa khi đang được dùng', out: 'Còn bản ghi dùng → từ chối 409', o1: 'đổi giá trị trên bản ghi trước (Business forms: hoặc tắt Active)', o2: 'không còn ai dùng → xóa được', tone: 'stop' },
    { cat: 'Danh mục lưu MÃ', s1: 'Job taxonomy · Job levels · Job types · Contract types', s2: 'Education · Years of exp. · Nationalities · Countries · Highlights', out: 'Xóa ngay — bản ghi đang dùng hiện trống', o1: 'không khôi phục được', o2: 'đổi tên thì an toàn: bản ghi hiện tên mới', tone: 'stop' },
    { cat: 'Danh mục lưu CHỮ (chỉ là gợi ý)', s1: 'Industries · Benefits · Skills · Company tags', out: 'Xóa ngay — chữ trên bản ghi giữ nguyên', o1: 'chỉ mất gợi ý trong ô chọn', o2: 'đổi tên: bản ghi cũ giữ chữ cũ', tone: 'money' },
    { cat: 'Locations', s1: 'cây khu vực ~3.300 dòng', out: 'Xóa ngay — vùng con bị tách khỏi cha', o1: 'vùng con vẫn còn trong danh mục', tone: 'wait' },
  ]
  const y = (i: number) => 90 + i * 96
  return (
    <Frame label="Xóa một giá trị master data: kết quả theo cách bản ghi lưu giá trị" w={1200} h={530}>
      <Premise title="XÓA MỘT GIÁ TRỊ — kết quả phụ thuộc cách bản ghi lưu giá trị">
        Mọi danh mục đều có nút Xóa. Hệ thống <tspan fontWeight={700} fill={INK}>không kiểm tra giá trị đang được dùng</tspan>, trừ Business forms và Job tags.
      </Premise>
      <Box x={30} y={243} w={180} h={70} title="Xóa một giá trị" sub="ở bất kỳ tab nào" />
      {rows.map((r, i) => (
        <g key={r.cat}>
          <Arrow d={`M 210 278 C 240 278, 240 ${y(i) + 38}, 268 ${y(i) + 38}`} />
          <Box x={270} y={y(i)} w={400} h={76} title={r.cat} sub={r.s1} sub2={r.s2} />
          <Arrow d={`M 670 ${y(i) + 38} L 738 ${y(i) + 38}`} tone={r.tone === 'stop' ? 'stop' : 'plain'} />
          <Box x={740} y={y(i)} w={430} h={76} title={r.out} sub={r.o1} sub2={r.o2} tone={r.tone} />
        </g>
      ))}
      <rect x={14} y={486} width={1172} height={32} rx={8} fill="#fffbeb" stroke={AMB} strokeWidth={1.2} />
      <text x={30} y={506} fontSize={11} fill={MUT}><tspan fontWeight={800} fill={AMB}>Luật · </tspan>Không có Active / Retired chung — chỉ Business forms có công tắc Active. Gộp 2 kỹ năng trùng nghĩa: dùng <tspan fontWeight={700} fill={INK}>alias</tspan>, không xóa rồi sửa tay.</text>
    </Frame>
  )
}

export function MdTaxonomyFlow() {
  const rows: [string, string, string, Tone][] = [
    ['Đổi tên', 'Tin tự hiện tên mới', 'vì tin lưu mã', 'money'],
    ['Đổi thứ tự', 'Form tin và bộ lọc tìm việc đổi theo', 'thứ tự dòng trong file Import = thứ tự hiển thị', 'plain'],
    ['Chuyển cấp cha', 'Mục hiện ở nhánh mới', 'tin vẫn giữ liên kết', 'brand'],
    ['Xóa', 'Tin đang dùng mất giá trị', '“Jobs using it will show no value.” · không khôi phục', 'stop'],
  ]
  const y = (i: number) => 172 + i * 66
  return (
    <Frame label="Job taxonomy: cây 3 cấp và ảnh hưởng của thay đổi tới tin đăng" w={1200} h={486}>
      <Premise title="JOB TAXONOMY — cây 3 cấp, tin đăng lưu MÃ">
        Nghề và chuyên môn là <tspan fontWeight={700} fill={INK}>2 Group ngang hàng</tspan> dưới cùng một Category, không phải Nghề → Chuyên môn. Role không làm cha; không có cấp 4.
      </Premise>
      <text x={30} y={90} fontSize={10.5} fontWeight={800} letterSpacing="0.04em" fill={MUT}>CÂY DỮ LIỆU (VÍ DỤ)</text>
      <Box x={150} y={100} w={290} h={62} title="Category" sub="Kế toán, Thuế & Tài chính" tone="brand" />
      <Arrow d="M 250 162 C 250 180, 155 180, 155 204" />
      <Arrow d="M 340 162 C 340 180, 435 180, 435 204" />
      <Box x={30} y={206} w={250} h={62} title="Group · Nghề · Vị trí" sub="jobs-occupations" />
      <Box x={310} y={206} w={250} h={62} title="Group · Chuyên môn hóa" sub="specialization" />
      <Arrow d="M 110 268 L 90 314" />
      <Arrow d="M 200 268 L 220 314" />
      <Arrow d="M 435 268 L 435 314" />
      <Box x={30} y={316} w={120} h={58} title="Role" sub="nghề cụ thể" />
      <Box x={160} y={316} w={120} h={58} title="Role" sub="nghề cụ thể" />
      <Box x={310} y={316} w={250} h={58} title="Specialization" sub="chuyên môn cụ thể" />
      <text x={30} y={400} fontSize={10.5} fill={MUT}>~1.075 nhánh · 21 Category · 56 tổ hợp Category + Group · 13 tên Group khác nhau</text>

      <text x={640} y={90} fontSize={10.5} fontWeight={800} letterSpacing="0.04em" fill={MUT}>ẢNH HƯỞNG TỚI TIN ĐĂNG</text>
      <Box x={640} y={100} w={530} h={50} title="Admin thay đổi một mục" tone="wait" />
      <path d={`M 656 150 L 656 ${y(3) + 25}`} fill="none" stroke="#b9b6ae" strokeWidth={1.8} />
      {rows.map(([c, t, s, tone], i) => (
        <g key={c}>
          <Arrow d={`M 656 ${y(i) + 25} L 678 ${y(i) + 25}`} />
          <Box x={680} y={y(i)} w={130} h={50} title={c} />
          <Arrow d={`M 810 ${y(i) + 25} L 838 ${y(i) + 25}`} tone={tone === 'stop' ? 'stop' : 'plain'} />
          <Box x={840} y={y(i)} w={330} h={50} title={t} sub={s} tone={tone} />
        </g>
      ))}
      <rect x={14} y={442} width={1172} height={32} rx={8} fill="#fffbeb" stroke={AMB} strokeWidth={1.2} />
      <text x={30} y={462} fontSize={11} fill={MUT}><tspan fontWeight={800} fill={AMB}>Luật · </tspan>Code cấp 2, cấp 3 trùng được giữa các nhánh (vd jobs-occupations) — một code chỉ xác định đúng 1 mục khi <tspan fontWeight={700} fill={INK}>đi kèm code cấp cha</tspan>.</text>
    </Frame>
  )
}

export function MdTaxonomyImportFlow() {
  return (
    <Frame label="Import Job taxonomy / Industries theo nhánh: hệ thống đọc từng dòng thế nào" w={1200} h={590}>
      <Premise title="IMPORT THEO NHÁNH — mỗi dòng là một nhánh Category → Group → Role (Industries: Industry → Group → Item)">
        File 9 cột: 3 cột Code (không bắt buộc) + tên EN và VI cho 3 cấp. <tspan fontWeight={700} fill={INK}>Thứ tự dòng trong file = thứ tự hiển thị.</tspan>
      </Premise>
      <Box x={30} y={204} w={170} h={70} title="Upload file" sub="template nhánh 9 cột" />
      <Arrow d="M 200 239 L 238 239" />
      <Box x={240} y={204} w={170} h={70} title="Xem trước" sub="báo lỗi theo số dòng" sub2="chưa lưu gì" />
      <Arrow d="M 410 239 L 448 239" />
      <Box x={450} y={204} w={170} h={70} title="Dòng có Code?" tone="wait" />
      <Arrow d="M 535 204 C 535 135, 600 135, 658 135" tone="brand" label="Có" lx={560} ly={150} />
      <Arrow d="M 535 274 C 535 335, 600 335, 658 335" label="Không" lx={560} ly={322} />
      <Box x={660} y={100} w={220} h={70} title="Code tồn tại?" sub="tìm kèm Code cấp cha" tone="wait" />
      <Arrow d="M 880 125 L 918 111" tone="brand" label="Có" lx={898} ly={106} />
      <Arrow d="M 880 145 L 918 159" tone="stop" label="Không" lx={898} ly={168} />
      <Box x={920} y={86} w={250} h={50} title="Cập nhật mục đó" sub="tên và thứ tự" tone="brand" />
      <Box x={920} y={146} w={250} h={50} title="Báo lỗi dòng" sub="không lưu dòng này" tone="stop" />
      <Box x={660} y={300} w={220} h={70} title="Trùng tên trong cấp cha?" sub="so tên EN hoặc VI" tone="wait" />
      <Arrow d="M 880 325 L 918 311" tone="brand" label="Có" lx={898} ly={306} />
      <Arrow d="M 880 345 L 918 359" label="Không" lx={898} ly={368} />
      <Box x={920} y={286} w={250} h={50} title="Dùng lại mục đã có" tone="brand" />
      <Box x={920} y={346} w={250} h={50} title="Tạo mục mới" sub="Code tự sinh từ tên EN" tone="money" />

      <Lane y={412} h={118} label="APPLY — sau khi đọc bản xem trước" />
      <Box x={30} y={444} w={200} h={64} title="Apply" tone="brand" />
      <Arrow d="M 230 476 L 278 476" tone="brand" />
      <Box x={280} y={444} w={270} h={64} title="Dòng hợp lệ: lưu" tone="money" />
      <Box x={580} y={444} w={270} h={64} title="Dòng lỗi: bỏ qua" tone="stop" />
      <Box x={880} y={444} w={290} h={64} title="Mục vắng trong file" sub="KHÔNG bị xóa" sub2="bị đẩy xuống cuối cấp cha" tone="side" />
      <path d="M 130 508 L 130 520 L 1025 520 L 1025 508" fill="none" stroke="#b9b6ae" strokeWidth={1.4} />
      <path d="M 715 520 L 715 508" fill="none" stroke="#b9b6ae" strokeWidth={1.4} />

      <rect x={14} y={544} width={1172} height={36} rx={8} fill="#fffbeb" stroke={AMB} strokeWidth={1.2} />
      <text x={30} y={566} fontSize={11} fill={MUT}><tspan fontWeight={800} fill={AMB}>Luật · </tspan>Code của mục khác → <tspan fontWeight={700} fill={INK}>ghi đè</tspan> lên mục đó. Đổi Code cấp 1 / 2 → mục được <tspan fontWeight={700} fill={INK}>chuyển</tspan> nhánh. Có Code cấp dưới mà thiếu Code cấp trên → lỗi dòng.</text>
    </Frame>
  )
}

export function MdIndustriesFlow() {
  return (
    <Frame label="Industries: tin và công ty lưu chữ, không lưu mã" w={1200} h={400}>
      <Premise title="INDUSTRIES — chỉ là gợi ý: tin và công ty lưu CHỮ (tên VI), không lưu mã">
        Cây 3 cấp Industry → Group → Item: <tspan fontWeight={700} fill={INK}>10 → 67 → 664</tspan> (~740 mục).
      </Premise>
      <Box x={30} y={92} w={300} h={78} title="Item trong Industries" sub="tên VI: khách sạn" sub2="hotels-travel-and-airlines-hotel" tone="brand" />
      <Arrow d="M 330 131 L 428 131" tone="brand" />
      <Box x={430} y={96} w={300} h={70} title="NTD / CRM chọn lĩnh vực" sub="trên form tin / công ty" />
      <Arrow d="M 730 131 L 828 131" tone="brand" />
      <Box x={830} y={96} w={340} h={70} title="Tin / công ty lưu CHỮ" sub="“khách sạn” — không lưu mã" tone="brand" />
      <Arrow d="M 180 170 L 180 218" />
      <Box x={30} y={220} w={300} h={70} title="Admin thay đổi Item" tone="wait" />
      <Arrow d="M 330 245 C 380 245, 380 232, 428 232" label="Đổi tên" lx={380} ly={226} />
      <Arrow d="M 330 265 C 380 265, 380 298, 428 298" label="Xóa" lx={380} ly={300} />
      <Box x={430} y={206} w={740} h={52} title="Bản ghi mới dùng tên mới · bản ghi cũ giữ chữ cũ" />
      <Box x={430} y={272} w={740} h={52} title="Chữ trên bản ghi giữ nguyên · chỉ mất gợi ý trong ô chọn" tone="money" />
      <rect x={14} y={346} width={1172} height={36} rx={8} fill="#fffbeb" stroke={AMB} strokeWidth={1.2} />
      <text x={30} y={368} fontSize={11} fill={MUT}><tspan fontWeight={800} fill={AMB}>Luật · </tspan>Item không làm cha: ô Parent chỉ cho chọn Industry hoặc Group. <tspan fontWeight={700} fill={INK}>New item</tspan> chọn Industry trước, rồi mới chọn Group.</text>
    </Frame>
  )
}

export function MdMissingSkillsFlow() {
  return (
    <Frame label="Skills và Missing skills: từ CV được đọc tới CV được nhả" w={1200} h={486}>
      <Premise title="SKILLS + MISSING SKILLS — kỹ năng trong CV thật mà danh mục chưa có">
        Khi đọc CV, hệ thống so chữ tự do trong CV với danh sách kỹ năng và <tspan fontWeight={700} fill={INK}>alias</tspan>. Cái không khớp được đưa vào tab Missing skills để Admin duyệt.
      </Premise>
      <Box x={30} y={92} w={220} h={64} title="CV được đọc" />
      <Arrow d="M 250 124 L 308 124" />
      <Box x={310} y={92} w={260} h={64} title="Khớp Skills hoặc alias?" tone="wait" />
      <Arrow d="M 570 124 L 638 124" tone="brand" label="Có" lx={604} ly={116} />
      <Box x={640} y={92} w={530} h={64} title="Gắn kỹ năng vào CV" tone="money" />
      <Arrow d="M 440 156 L 440 208" label="Không" lx={452} ly={186} anchor="start" />
      <Box x={310} y={210} w={260} h={80} title="Missing skills" sub="kèm số CV có kỹ năng đó" sub2="và số CV đang bị giữ" />
      <Arrow d="M 570 250 L 638 250" />
      <Box x={640} y={215} w={220} h={70} title="Admin Approve" sub="sửa danh sách cách viết" tone="wait" />
      <Arrow d="M 860 240 L 918 220" tone="brand" />
      <Arrow d="M 860 260 L 918 272" tone="brand" />
      <Box x={920} y={198} w={250} h={44} title="Thêm alias" sub="của kỹ năng có sẵn" />
      <Box x={920} y={250} w={250} h={44} title="Tạo kỹ năng mới" />
      <path d="M 1170 220 L 1180 220 L 1180 310 L 1045 310" fill="none" stroke={BR} strokeWidth={1.8} />
      <Arrow d="M 1045 294 L 1045 334" tone="brand" />
      <Box x={310} y={336} w={860} h={80} title="Add and back-fill — trong cùng một lần" sub="gắn lại kỹ năng cho các CV liên quan · sàng lại các CV đó · nhả CV đang bị giữ nếu nay đã đủ điều kiện" sub2="thông báo: số alias thêm · số hồ sơ cập nhật · số CV được nhả" tone="brand" />
      <Arrow d="M 310 376 L 252 376" tone="brand" />
      <Box x={30} y={336} w={220} h={80} title="CV đủ điều kiện" sub="được nhả" tone="money" />
      <rect x={14} y={436} width={1172} height={36} rx={8} fill="#fffbeb" stroke={AMB} strokeWidth={1.2} />
      <text x={30} y={458} fontSize={11} fill={MUT}><tspan fontWeight={800} fill={AMB}>Luật · </tspan>Chỉ Skills có alias. CV viết khác chính tả → thêm alias, <tspan fontWeight={700} fill={INK}>không tạo kỹ năng mới</tspan>. Duyệt có ghi Audit log (skill_gap.adopt).</text>
    </Frame>
  )
}

export function MdCandidateFlow() {
  return (
    <Frame label="Education levels, Years of experience, Nationalities: ứng viên chọn, nhà tuyển dụng lọc" w={1200} h={300}>
      <Premise title="DANH MỤC CỦA ỨNG VIÊN — cùng một giá trị, hai phía dùng">
        Ứng viên chọn giá trị khi đăng ký / sửa hồ sơ; nhà tuyển dụng lọc CV bằng <tspan fontWeight={700} fill={INK}>chính các giá trị đó</tspan>. Hồ sơ lưu mã.
      </Premise>
      <Box x={30} y={110} w={320} h={90} title="Education levels" sub="Years of experience" sub2="Nationalities · tên VI / EN / KO" tone="brand" />
      <Arrow d="M 350 130 C 400 130, 400 112, 448 112" tone="brand" />
      <Arrow d="M 350 180 C 400 180, 400 208, 838 208" />
      <Box x={450} y={84} w={320} h={60} title="Ứng viên chọn" sub="khi đăng ký / sửa hồ sơ" />
      <Arrow d="M 770 114 C 805 114, 805 160, 838 160" tone="brand" />
      <Box x={840} y={130} w={330} h={90} title="NTD lọc khi tìm CV" sub="hồ sơ khớp giá trị đã chọn" sub2="mới ra trong kết quả" />
      <rect x={14} y={248} width={1172} height={36} rx={8} fill="#fffbeb" stroke={AMB} strokeWidth={1.2} />
      <text x={30} y={270} fontSize={11} fill={MUT}><tspan fontWeight={800} fill={AMB}>Luật · </tspan>Xóa một giá trị: hồ sơ đang dùng <tspan fontWeight={700} fill={INK}>mất giá trị</tspan>, không khôi phục được. Đổi tên: hồ sơ hiện tên mới.</text>
    </Frame>
  )
}

export function MdLocationsFlow() {
  return (
    <Frame label="Locations: xóa khu vực cha thì vùng con bị tách khỏi cha" w={1200} h={300}>
      <Premise title="LOCATIONS — xóa khu vực cha không xóa vùng con">
        Cây khoảng <tspan fontWeight={700} fill={INK}>3.300 dòng</tspan>, lọc theo cấp, dùng ở mọi ô chọn địa điểm.
      </Premise>
      <text x={30} y={92} fontSize={10.5} fontWeight={800} letterSpacing="0.04em" fill={MUT}>TRƯỚC KHI XÓA</text>
      <Box x={150} y={100} w={240} h={50} title="Khu vực cha" tone="brand" />
      <Arrow d="M 230 150 L 150 186" />
      <Arrow d="M 310 150 L 390 186" />
      <Box x={30} y={188} w={220} h={46} title="Vùng con" />
      <Box x={290} y={188} w={220} h={46} title="Vùng con" />
      <Arrow d="M 540 168 L 638 168" tone="stop" label="Xóa khu vực cha" lx={589} ly={160} />
      <text x={660} y={92} fontSize={10.5} fontWeight={800} letterSpacing="0.04em" fill={MUT}>SAU KHI XÓA</text>
      <Box x={780} y={100} w={240} h={50} title="Khu vực cha — đã xóa" tone="side" />
      <Box x={660} y={188} w={220} h={46} title="Vùng con" sub="không còn cha" tone="wait" />
      <Box x={920} y={188} w={220} h={46} title="Vùng con" sub="không còn cha" tone="wait" />
      <rect x={14} y={248} width={1172} height={36} rx={8} fill="#fffbeb" stroke={AMB} strokeWidth={1.2} />
      <text x={30} y={270} fontSize={11} fill={MUT}><tspan fontWeight={800} fill={AMB}>Luật · </tspan>Vùng con <tspan fontWeight={700} fill={INK}>vẫn còn trong danh mục</tspan>, chỉ bị tách khỏi cha — không bị xóa theo.</text>
    </Frame>
  )
}

/* ── Candidate management — luồng trạng thái ứng tuyển (tài liệu 14/10/2026) ────
   Seven drawings, one per Flow in the client document: the whole chain across
   three sites; the five legal (CV · Application) pairs; the CV check; an Admin
   decision fanned out by CV version; the Kanban; how the candidate's label is
   computed; and who gets told. Statuses keep their English names exactly as the
   screens print them. */
export function CmOverviewFlow() {
  return (
    <Frame label="Trạng thái ứng tuyển: từ lúc ứng viên nộp tới Kanban của nhà tuyển dụng" w={1200} h={762}>
      <Premise title="MỘT HỒ SƠ ỨNG TUYỂN — chỉ tới nhà tuyển dụng khi CV Status = Qualified">
        Mọi CV phải qua bước kiểm tra ở Admin. CV không đạt bị giữ ở <tspan fontWeight={700} fill={INK}>Not Sent</tspan> và ẩn hoàn toàn khỏi NTD cho tới khi Operator duyệt tay.
      </Premise>

      <Lane y={82} h={100} label="① ỨNG VIÊN" />
      <Box x={30} y={112} w={260} h={56} title="Saramin CV" sub="form, đủ trường bắt buộc" />
      <Box x={330} y={112} w={220} h={56} title="File upload" sub="PDF / Word" />

      <Lane y={198} h={380} label="② ADMIN — kiểm tra CV, Operator, Admin / CS" />
      <path d="M 160 168 L 160 186 L 1045 186 L 1045 292" fill="none" stroke={BR} strokeWidth={1.8} markerEnd="url(#pf-b)" />
      <text x={760} y={181} fontSize={10} fontWeight={600} textAnchor="middle" fill={BR} {...HALO}>Saramin CV: luôn Qualified · Sent</text>
      <Arrow d="M 440 168 L 440 226" />
      <Box x={330} y={228} w={220} h={52} title="Bóc tách 10 trường" sub="khoảng 3 phút" />
      <Arrow d="M 440 280 L 440 298" />
      <Box x={330} y={300} w={220} h={60} title="Đọc được?" sub="mở được, không mật khẩu" tone="wait" />
      <Arrow d="M 550 324 L 608 324" tone="brand" label="Có" lx={579} ly={316} />
      <Box x={610} y={294} w={250} h={72} title="Đủ trường bắt buộc?" sub="Experienced: Edu + Work" sub2="No experience: Edu" tone="wait" />
      <Arrow d="M 860 320 L 918 320" tone="brand" label="Có" lx={889} ly={312} />
      <Box x={920} y={294} w={250} h={72} title="Qualified · Sent" sub="tự tạo thẻ bên NTD" tone="money" />
      <Arrow d="M 440 360 L 440 390" label="Không" lx={450} ly={380} anchor="start" />
      <Box x={330} y={392} w={220} h={56} title="Cannot Read" sub="Application: Not Sent" tone="wait" />
      <Arrow d="M 735 366 L 735 390" label="Không" lx={745} ly={382} anchor="start" />
      <Box x={610} y={392} w={250} h={56} title="Not Enough Information" sub="Application: Not Sent" tone="wait" />
      <Arrow d="M 1045 366 L 1045 390" tone="stop" dashed label="thu hồi sau khi đã gửi" lx={1055} ly={382} anchor="start" />
      <Box x={920} y={392} w={250} h={56} title="Admin / CS Recall" sub="Rejected · Recall — kết thúc" tone="stop" />
      <Arrow d="M 440 448 C 440 514, 440 514, 468 514" />
      <Arrow d="M 735 448 C 735 470, 690 470, 690 484" />
      <Box x={470} y={486} w={250} h={56} title="Operator xem tay" sub="hàng đợi Not Sent" tone="wait" />
      <path d="M 720 514 L 890 514 L 890 356 L 918 356" fill="none" stroke={BR} strokeWidth={1.8} markerEnd="url(#pf-b)" />
      <text x={805} y={508} fontSize={10} fontWeight={600} textAnchor="middle" fill={BR} {...HALO}>Approve</text>
      <Arrow d="M 470 514 L 292 514" tone="stop" label="Reject" lx={380} ly={506} />
      <Box x={30} y={486} w={260} h={56} title="Rejected · Not Sent" sub="kết thúc — NTD không bao giờ thấy" tone="stop" />

      <path d="M 1170 330 L 1182 330 L 1182 586 L 230 586 L 230 624" fill="none" stroke={BR} strokeWidth={1.8} markerEnd="url(#pf-b)" />
      <text x={700} y={582} fontSize={10} fontWeight={600} textAnchor="middle" fill={BR} {...HALO}>tạo thẻ ở cột đầu</text>
      <Lane y={594} h={110} label="③ EMPLOYER DASHBOARD" />
      <Box x={30} y={626} w={260} h={56} title="Application Received" sub="cột đầu cố định" tone="brand" />
      <Arrow d="M 290 654 L 328 654" />
      <Box x={330} y={626} w={260} h={56} title="Các cột giữa" sub="do NTD tạo — In Process" />
      <Arrow d="M 590 646 L 628 646" />
      <Box x={630} y={626} w={250} h={56} title="Passed" sub="cột cuối cố định" tone="money" />
      <path d="M 460 682 L 460 696 L 1045 696 L 1045 684" fill="none" stroke="#b9b6ae" strokeWidth={1.8} markerEnd="url(#pf-p)" />
      <Box x={920} y={626} w={250} h={56} title="Not This Time" sub="cột cuối cố định" tone="side" />

      <rect x={14} y={716} width={1172} height={36} rx={8} fill="#fffbeb" stroke={AMB} strokeWidth={1.2} />
      <text x={30} y={738} fontSize={11} fill={MUT}><tspan fontWeight={800} fill={AMB}>Luật · </tspan>Approve / Reject / Recall áp cho <tspan fontWeight={700} fill={INK}>mọi hồ sơ dùng cùng phiên bản CV</tspan>, ở mọi công ty. Ứng viên không tự thu hồi được hồ sơ — chỉ Admin / CS.</text>
    </Frame>
  )
}

export function CmStatesFlow() {
  return (
    <Frame label="Năm tổ hợp hợp lệ của CV Status và Application Status" w={1200} h={392}>
      <Premise title="CV STATUS · APPLICATION STATUS — chỉ 5 tổ hợp hợp lệ">
        Mỗi hồ sơ lưu trạng thái <tspan fontWeight={700} fill={INK}>một lần</tspan>; Admin, NTD và ứng viên chỉ là các góc nhìn khác nhau của cùng dữ liệu đó.
      </Premise>
      <Box x={30} y={176} w={180} h={60} title="Nộp hồ sơ" />
      <Arrow d="M 210 196 C 270 196, 270 130, 328 130" tone="brand" />
      <Arrow d="M 210 216 C 270 216, 270 285, 328 285" />
      <Box x={330} y={100} w={260} h={60} title="Qualified · Sent" sub="đã đạt và đã gửi" tone="money" />
      <Box x={330} y={250} w={260} h={70} title="Cannot Read / Not Enough Info" sub="· Not Sent" sub2="chờ Operator xử lý" tone="wait" />
      <Arrow d="M 460 250 L 460 162" tone="brand" label="Approve" lx={470} ly={210} anchor="start" />
      <Arrow d="M 590 130 L 798 130" tone="stop" label="Recall · hoặc cùng bản CV bị Reject" lx={694} ly={122} />
      <Box x={800} y={100} w={370} h={60} title="Rejected · Recall" sub="đã gửi rồi bị thu hồi — kết thúc" tone="stop" />
      <Arrow d="M 590 285 L 798 285" tone="stop" label="Reject" lx={694} ly={277} />
      <Box x={800} y={255} w={370} h={60} title="Rejected · Not Sent" sub="bị từ chối trước khi gửi — kết thúc" tone="stop" />
      <rect x={14} y={340} width={1172} height={36} rx={8} fill="#fffbeb" stroke={AMB} strokeWidth={1.2} />
      <text x={30} y={362} fontSize={11} fill={MUT}><tspan fontWeight={800} fill={AMB}>Luật · </tspan>Không có tổ hợp nào khác: Qualified · Not Sent, Rejected · Sent hay Qualified · Recall đều là <tspan fontWeight={700} fill={INK}>dữ liệu sai</tspan>. “Rejected” là CV Status, không phải Application Status.</text>
    </Frame>
  )
}

export function CmReviewFlow() {
  return (
    <Frame label="Kiểm tra CV upload: đọc được, rồi đủ trường bắt buộc" w={1200} h={400}>
      <Premise title="KIỂM TRA CV — file upload qua 2 bước theo thứ tự; Saramin CV không qua bước này">
        Saramin CV luôn <tspan fontWeight={700} fill={INK}>Qualified · Sent</tspan>: nút Lưu / Nộp bị khóa cho tới khi điền đủ trường bắt buộc.
      </Premise>
      <Box x={30} y={100} w={150} h={60} title="Upload file" sub="PDF / Word" />
      <Arrow d="M 180 130 L 208 130" />
      <Box x={210} y={100} w={160} h={60} title="Bóc tách" sub="10 trường · ~3 phút" />
      <Arrow d="M 370 130 L 398 130" />
      <Box x={400} y={100} w={190} h={60} title="Mở được?" sub="không hỏng, không mật khẩu" tone="wait" />
      <Arrow d="M 590 130 L 618 130" tone="brand" label="Có" lx={604} ly={122} />
      <Arrow d="M 495 160 L 495 208" label="Không" lx={505} ly={188} anchor="start" />
      <Box x={400} y={210} w={190} h={60} title="Cannot Read" sub="Not Sent · hàng đợi Operator" tone="wait" />
      <Box x={620} y={100} w={150} h={60} title="Experienced?" sub="theo lựa chọn của ứng viên" tone="wait" />
      <Arrow d="M 770 118 L 798 94" label="Có" lx={784} ly={98} />
      <Arrow d="M 770 142 L 798 192" label="Không" lx={780} ly={178} anchor="end" />
      <Box x={800} y={60} w={170} h={56} title="Có Edu và Work?" tone="wait" />
      <Box x={800} y={172} w={170} h={56} title="Có Edu?" tone="wait" />
      <Arrow d="M 970 96 L 998 130" tone="brand" label="Có" lx={986} ly={106} anchor="end" />
      <Arrow d="M 970 192 L 998 158" tone="brand" label="Có" lx={986} ly={190} anchor="end" />
      <Box x={1000} y={116} w={170} h={56} title="Qualified · Sent" sub="tạo thẻ bên NTD" tone="money" />
      <Arrow d="M 885 228 L 885 268" label="Không" lx={895} ly={252} anchor="start" />
      <path d="M 970 70 L 1186 70 L 1186 298 L 1172 298" fill="none" stroke="#b9b6ae" strokeWidth={1.8} markerEnd="url(#pf-p)" />
      <text x={1178} y={250} fontSize={10} fontWeight={600} textAnchor="end" fill={MUT} {...HALO}>Không</text>
      <Box x={800} y={270} w={370} h={56} title="Not Enough Information · Not Sent" sub="vào hàng đợi Operator" tone="wait" />
      <rect x={14} y={348} width={1172} height={36} rx={8} fill="#fffbeb" stroke={AMB} strokeWidth={1.2} />
      <text x={30} y={370} fontSize={11} fill={MUT}><tspan fontWeight={800} fill={AMB}>Luật · </tspan>Không đạt bước 1 thì dừng, không chạy bước 2. Not Sent: <tspan fontWeight={700} fill={INK}>không tạo thẻ</tspan> bên NTD, hồ sơ vào hàng đợi của Operator.</text>
    </Frame>
  )
}

export function CmDecisionFlow() {
  return (
    <Frame label="Approve, Reject, Recall áp cho mọi hồ sơ dùng cùng phiên bản CV" w={1200} h={486}>
      <Premise title="APPROVE · REJECT · RECALL — quyết trên PHIÊN BẢN CV, không trên một hồ sơ">
        Mỗi hồ sơ lưu phiên bản CV lúc nộp. Application Status và Pipeline Status vẫn lưu <tspan fontWeight={700} fill={INK}>theo từng hồ sơ</tspan> — mỗi công ty xử lý độc lập.
      </Premise>
      <Box x={30} y={176} w={200} h={80} title="Operator / Admin" sub="thao tác trên 1 hồ sơ" tone="wait" />
      <Arrow d="M 230 200 C 260 200, 260 126, 288 126" tone="brand" label="Approve" lx={252} ly={150} anchor="end" />
      <Arrow d="M 230 232 C 260 232, 260 294, 288 294" tone="stop" label="Reject / Recall" lx={256} ly={280} anchor="end" />
      <Box x={290} y={96} w={230} h={60} title="Tìm mọi hồ sơ" sub="dùng cùng phiên bản CV" tone="brand" />
      <Arrow d="M 520 126 L 568 126" />
      <Box x={570} y={96} w={200} h={60} title="Đang chờ xử lý?" sub="Cannot Read / NEI · Not Sent" tone="wait" />
      <Arrow d="M 770 116 L 828 95" tone="brand" label="Có" lx={800} ly={98} />
      <Arrow d="M 770 136 L 828 152" label="Không" lx={800} ly={158} />
      <Box x={830} y={70} w={340} h={50} title="Qualified · Sent" sub="thẻ ở Application Received của từng công ty" tone="money" />
      <Box x={830} y={132} w={340} h={40} title="Không đổi" sub="đã Rejected, hoặc đã Sent" />
      <Box x={290} y={264} w={230} h={60} title="Tìm mọi hồ sơ" sub="dùng cùng phiên bản CV" tone="stop" />
      <Arrow d="M 520 294 L 568 294" />
      <Box x={570} y={264} w={200} h={60} title="Đã gửi?" tone="wait" />
      <Arrow d="M 770 284 L 828 265" label="Chưa" lx={800} ly={268} />
      <Arrow d="M 770 304 L 828 327" tone="stop" label="Đã gửi" lx={800} ly={330} />
      <Box x={830} y={240} w={340} h={50} title="Rejected · Not Sent" sub="ứng viên: Invalid Application" tone="stop" />
      <Box x={830} y={302} w={340} h={50} title="Rejected · Recall" sub="ứng viên: Application Withdrawn" tone="stop" />
      <Box x={290} y={376} w={880} h={44} title="Phiên bản CV khác (kể cả của cùng CV) và CV khác của cùng ứng viên: không đổi" tone="side" />
      <rect x={14} y={436} width={1172} height={36} rx={8} fill="#fffbeb" stroke={AMB} strokeWidth={1.2} />
      <text x={30} y={458} fontSize={11} fill={MUT}><tspan fontWeight={800} fill={AMB}>Luật · </tspan>Hộp thoại hiện <tspan fontWeight={700} fill={INK}>số hồ sơ và số công ty</tspan> bị ảnh hưởng trước khi xác nhận. 2 Operator cùng xử lý 1 CV: người sau nhận “CV đã được xử lý”.</text>
    </Frame>
  )
}

export function CmKanbanFlow() {
  return (
    <Frame label="Kanban của nhà tuyển dụng: cột đầu cố định, cột giữa linh hoạt, hai cột cuối cố định" w={1200} h={370}>
      <Premise title="KANBAN — 1 cột đầu cố định · các cột giữa do NTD tạo · 2 cột cuối cố định">
        Mỗi lần kéo thẻ cập nhật <tspan fontWeight={700} fill={INK}>Pipeline Status</tspan>; với cột giữa, hệ thống lưu thêm id cột.
      </Premise>
      <Box x={30} y={150} w={160} h={60} title="Hồ sơ Sent" />
      <Arrow d="M 190 180 L 238 180" tone="brand" />
      <Box x={240} y={140} w={240} h={80} title="Application Received" sub="cột đầu cố định" sub2="không xóa, không đổi tên" tone="brand" />
      <Arrow d="M 480 180 L 538 180" />
      <Box x={540} y={140} w={260} h={80} title="Các cột giữa" sub="NTD thêm / xóa / đổi tên" sub2="Pipeline: In Process" />
      <Arrow d="M 800 166 L 878 124" />
      <Arrow d="M 800 194 L 878 236" />
      <Arrow d="M 360 140 C 360 76, 700 76, 878 112" dashed />
      <Arrow d="M 360 220 C 360 290, 700 290, 878 250" dashed />
      <Box x={880} y={90} w={290} h={60} title="Passed" sub="cột cuối cố định" tone="money" />
      <Box x={880} y={210} w={290} h={60} title="Not This Time" sub="cột cuối cố định" tone="side" />
      <rect x={14} y={318} width={1172} height={36} rx={8} fill="#fffbeb" stroke={AMB} strokeWidth={1.2} />
      <text x={30} y={340} fontSize={11} fill={MUT}><tspan fontWeight={800} fill={AMB}>Luật · </tspan>Hồ sơ Not Sent <tspan fontWeight={700} fill={INK}>không bao giờ</tspan> lên Kanban (đếm, tìm, lọc, Download All) — chặn ở API. Cột giữa mới chèn trước Passed. Thẻ kéo vào / ra Passed, Not This Time được.</text>
    </Frame>
  )
}

export function CmCandidateStatusFlow() {
  const rows: [string, string, Tone, string][] = [
    ['Application Status = Recall?', 'Application Withdrawn', 'stop', 'kiểm trước Rejected — hồ sơ bị thu hồi luôn hiện Withdrawn'],
    ['CV Status = Rejected?', 'Invalid Application', 'stop', 'CV chưa gửi bị từ chối — kết thúc'],
    ['Application Status = Not Sent?', 'In Review', 'wait', 'chờ Operator — NTD chưa thấy'],
    ['Thẻ đã rời cột Application Received?', 'In Process / Passed / Not This Time', 'brand', 'pipeline luôn đè lên — xem / tải lại CV không đổi gì'],
    ['Có downloaded_at?', 'Application Saved', 'money', 'Saved > Viewed: xem lại không làm tụt về Viewed'],
    ['Có viewed_at?', 'Application Viewed', 'money', ''],
    ['Còn lại', 'Application Received', 'money', ''],
  ]
  const y = (i: number) => 86 + i * 60
  return (
    <Frame label="Cách tính trạng thái ứng viên nhìn thấy, kiểm từ trên xuống" w={1200} h={552}>
      <Premise title="TRẠNG THÁI ỨNG VIÊN THẤY — kiểm từ trên xuống, gặp điều kiện đúng đầu tiên thì dừng">
        Giá trị do hệ thống tính; màn <tspan fontWeight={700} fill={INK}>Việc đã ứng tuyển</tspan> chỉ hiển thị. Flag chỉ đổi trạng thái khi thẻ còn ở cột Application Received.
      </Premise>
      {rows.map(([q, out, tone, note], i) => (
        <g key={q}>
          <Box x={30} y={y(i)} w={330} h={44} title={q} tone={i === rows.length - 1 ? 'plain' : 'wait'} />
          {i < rows.length - 1 && <Arrow d={`M 195 ${y(i) + 44} L 195 ${y(i + 1) - 2}`} label="Không" lx={205} ly={y(i) + 56} anchor="start" />}
          <Arrow d={`M 360 ${y(i) + 22} L 418 ${y(i) + 22}`} tone={tone === 'stop' ? 'stop' : 'brand'} label={i === rows.length - 1 ? undefined : 'Có'} lx={389} ly={y(i) + 14} />
          <Box x={420} y={y(i)} w={320} h={44} title={out} tone={tone} />
          {note && <text x={770} y={y(i) + 26} fontSize={11} fill={MUT}>{note}</text>}
        </g>
      ))}
      <rect x={14} y={506} width={1172} height={36} rx={8} fill="#fffbeb" stroke={AMB} strokeWidth={1.2} />
      <text x={30} y={528} fontSize={11} fill={MUT}><tspan fontWeight={800} fill={AMB}>Luật · </tspan>Flag lưu <tspan fontWeight={700} fill={INK}>lần đầu</tspan>, theo từng hồ sơ, không ghi đè, không reset. Chỉ hành động của NTD mới bật flag — Operator / Admin mở hay tải CV thì không.</text>
    </Frame>
  )
}

export function CmNotifyFlow() {
  return (
    <Frame label="Ai được báo khi hồ sơ đổi trạng thái" w={1200} h={372}>
      <Premise title="THÔNG BÁO — ứng viên xem ngay trên màn hình; NTD chỉ được email khi hồ sơ sang Sent">
        Không gửi email lẻ cho ứng viên mỗi lần đổi trạng thái; thay vào đó <tspan fontWeight={700} fill={INK}>1 email tổng hợp cuối tuần</tspan>.
      </Premise>
      <Box x={30} y={150} w={220} h={64} title="Hồ sơ đổi trạng thái" tone="brand" />
      <Arrow d="M 250 170 C 290 170, 290 105, 328 105" />
      <Arrow d="M 250 182 L 328 182" />
      <Arrow d="M 250 196 C 290 196, 290 262, 328 262" />
      <Box x={330} y={80} w={340} h={50} title="Ứng viên: cập nhật ngay" sub="trên “Việc đã ứng tuyển”, không tải lại trang" />
      <Box x={330} y={157} w={340} h={50} title="Ứng viên: gom vào email cuối tuần" sub="theo nhóm trạng thái" />
      <Box x={330} y={237} w={340} h={50} title="Chuyển sang Sent?" sub="lúc nộp, hoặc Operator Approve" tone="wait" />
      <Arrow d="M 670 252 L 748 228" tone="brand" label="Có" lx={709} ly={232} />
      <Arrow d="M 670 272 L 748 290" label="Không" lx={709} ly={296} />
      <Box x={750} y={204} w={420} h={44} title="NTD: email có đơn ứng tuyển mới" tone="money" />
      <Box x={750} y={266} w={420} h={44} title="Không gửi email cho NTD" sub="hồ sơ Not Sent" tone="side" />
      <rect x={14} y={322} width={1172} height={36} rx={8} fill="#fffbeb" stroke={AMB} strokeWidth={1.2} />
      <text x={30} y={344} fontSize={11} fill={MUT}><tspan fontWeight={800} fill={AMB}>Luật · </tspan>Hồ sơ bị thu hồi: NTD <tspan fontWeight={700} fill={INK}>nhận email</tspan>, thẻ mang nhãn thu hồi và thông tin CV bị khoá.</text>
    </Frame>
  )
}

/* ── Create CV — hai cửa vào, một thư viện (tài liệu 15/10/2026) ───────────────
   The client's overview flow. The loop goes back to Save, not straight to the
   check: an Unfinished CV only becomes Đạt when the candidate saves again. */
export function CvCreateFlow() {
  return (
    <Frame label="Tạo CV: Saramin CV hoặc Upload, lưu vào thư viện, chấm Đạt" w={1200} h={490}>
      <Premise title="CREATE CV — hai cửa vào, một thư viện; mỗi lần lưu là một lần chấm Đạt">
        Mỗi CV tự khai <tspan fontWeight={700} fill={INK}>Experienced / No experience</tspan> — khai báo đó quyết định CV cần mục nào để Đạt.
      </Premise>
      <Box x={30} y={150} w={220} h={70} title="My CVs" sub="Want to create your CV?" />
      <Arrow d="M 250 172 C 285 172, 285 115, 318 115" tone="brand" label="Create Saramin CV" lx={286} ly={132} anchor="middle" />
      <Arrow d="M 250 198 C 285 198, 285 255, 318 255" label="Upload file" lx={286} ly={244} />
      <Box x={320} y={80} w={280} h={70} title="Form Saramin CV" sub="chọn Experienced / No experience" sub2="điền các mục" />
      <Box x={320} y={220} w={280} h={70} title="Trang Upload" sub="chọn Experienced / No experience" sub2="tải file PDF / Word ≤ 10 MB" />
      <Arrow d="M 600 115 C 635 115, 635 172, 668 172" />
      <Arrow d="M 600 255 C 635 255, 635 198, 668 198" />
      <Box x={670} y={150} w={220} h={70} title="Save" sub="đặt tên CV" sub2="chọn có hiển thị cho NTD" tone="brand" />
      <Arrow d="M 890 185 L 958 185" />
      <Box x={960} y={150} w={210} h={70} title="Thư viện My CVs" sub="không giới hạn số CV" />
      <Arrow d="M 1065 220 L 1065 258" />
      <Box x={960} y={260} w={210} h={56} title="CV Đạt?" sub="Education (+ Work nếu Experienced)" tone="wait" />
      <Arrow d="M 1065 316 L 1065 358" tone="brand" label="Đạt" lx={1075} ly={342} anchor="start" />
      <Box x={960} y={360} w={210} h={60} title="Nộp đơn được" sub="bật hiển thị cho NTD được" tone="money" />
      <Arrow d="M 960 288 L 892 288" label="Chưa đạt" lx={926} ly={280} />
      <Box x={640} y={260} w={250} h={56} title="Nhãn Unfinished" sub="bổ sung rồi lưu lại" tone="wait" />
      <Arrow d="M 765 260 L 765 222" dashed label="lưu lại" lx={775} ly={246} anchor="start" />
      <rect x={14} y={440} width={1172} height={36} rx={8} fill="#fffbeb" stroke={AMB} strokeWidth={1.2} />
      <text x={30} y={462} fontSize={11} fill={MUT}><tspan fontWeight={800} fill={AMB}>Luật · </tspan>Chỉ <tspan fontWeight={700} fill={INK}>một CV</tspan> hiển thị cho NTD tại một thời điểm. CV chưa đạt không nộp đơn được và không bật hiển thị được.</text>
    </Frame>
  )
}

/* ── CV review — bốn thao tác, hai trạng thái (tài liệu 15/10/2026) ─────────────
   Withdraw application is drawn dashed throughout: agreed, not yet on screen. */
export function CvReviewFlow() {
  return (
    <Frame label="CV review: Approve, Reject, Recall và Withdraw application" w={1200} h={530}>
      <Premise title="CV REVIEW — duyệt CV, không duyệt từng đơn; mọi quyết định không hoàn tác">
        Mỗi quyết định áp cho <tspan fontWeight={700} fill={INK}>mọi hồ sơ dùng cùng phiên bản CV</tspan>. Riêng Withdraw application (đứt nét, đang triển khai) chỉ rút đúng một hồ sơ.
      </Premise>
      <Box x={30} y={170} w={180} h={60} title="Ứng viên nộp đơn" />
      <Arrow d="M 210 200 L 258 200" />
      <Box x={260} y={170} w={170} h={60} title="CV đạt?" tone="wait" />
      <Arrow d="M 430 190 C 465 190, 465 125, 498 125" tone="brand" label="Đạt" lx={470} ly={150} anchor="start" />
      <Arrow d="M 430 210 C 465 210, 465 295, 498 295" label="Không đọc được / thiếu" lx={448} ly={262} anchor="start" />
      <Box x={500} y={90} w={300} h={70} title="Qualified · Sent" sub="NTD nhận hồ sơ" tone="money" />
      <Box x={500} y={260} w={260} h={70} title="Cannot Read / NEI · Not Sent" sub="chờ người duyệt" tone="wait" />
      <Arrow d="M 630 260 L 630 162" tone="brand" label="Approve CV" lx={640} ly={215} anchor="start" />
      <Arrow d="M 800 125 L 878 125" tone="stop" label="Recall CV" lx={839} ly={117} />
      <Box x={880} y={90} w={290} h={70} title="Rejected · Recall" sub="kết thúc" tone="stop" />
      <Arrow d="M 760 295 L 878 295" tone="stop" label="Reject CV" lx={819} ly={287} />
      <Box x={880} y={260} w={290} h={70} title="Rejected · Not Sent" sub="kết thúc" tone="stop" />
      <Arrow d="M 785 160 L 785 398" dashed />
      <Arrow d="M 630 330 L 630 398" dashed />
      <text x={795} y={372} fontSize={10} fontWeight={600} fill={MUT} {...HALO}>Withdraw application</text>
      <Box x={500} y={400} w={670} h={56} title="CV: giữ nguyên · Application: Withdrawn — kết thúc" sub="ĐANG TRIỂN KHAI — chưa có trên màn hình" tone="side" />
      <rect x={14} y={476} width={1172} height={40} rx={8} fill="#fffbeb" stroke={AMB} strokeWidth={1.2} />
      <text x={30} y={500} fontSize={11} fill={MUT}><tspan fontWeight={800} fill={AMB}>Luật · </tspan>Đơn gắn CV đang chờ bị giữ ở <tspan fontWeight={700} fill={INK}>Not Sent vô thời hạn</tspan> — không gì tự gửi theo giờ. Hệ thống không bao giờ tự từ chối.</text>
    </Frame>
  )
}

/* ── Talent pool — từ công tắc của ứng viên tới lượt mở khoá (tài liệu 16/10/2026) */
export function TalentPoolFlow() {
  return (
    <Frame label="Talent pool: ứng viên bật CV, NTD tìm, đọc, mở khoá" w={1200} h={300}>
      <Premise title="TALENT POOL — tìm là miễn phí; đọc cần gói hoặc lượt xem; thấy tên và liên hệ thì phải Unlock">
        Mở khoá <tspan fontWeight={700} fill={INK}>một lần, dùng vĩnh viễn</tspan>, cho cả công ty — kể cả khi ứng viên đã nộp đơn vào chính công ty đó.
      </Premise>
      <Box x={30} y={110} w={210} h={76} title="Ứng viên bật" sub="Show CV to employers" />
      <Arrow d="M 240 148 L 268 148" />
      <Box x={270} y={110} w={200} h={76} title="Có mặt trong kho" sub="NTD thấy khi CV Qualified" sub2="(CV search status: Showing)" tone="brand" />
      <Arrow d="M 470 148 L 498 148" />
      <Box x={500} y={110} w={210} h={76} title="NTD tìm trên /search" sub="tên và liên hệ bị che" />
      <Arrow d="M 710 148 L 748 148" label="Mở trang CV" lx={729} ly={140} />
      <Box x={750} y={110} w={190} h={76} title="Đọc nội dung CV" sub="cần gói hoặc" sub2="lượt xem miễn phí (10)" tone="wait" />
      <Arrow d="M 940 148 L 978 148" tone="brand" label="Unlock" lx={959} ly={140} />
      <Box x={980} y={110} w={190} h={76} title="Thấy tên, liên hệ, file" sub="trừ 1 credit" sub2="cột Unlocks trên Admin +1" tone="money" />
      <rect x={14} y={212} width={1172} height={60} rx={8} fill="#fffbeb" stroke={AMB} strokeWidth={1.2} />
      <text x={30} y={236} fontSize={11} fill={MUT}><tspan fontWeight={800} fill={AMB}>Luật · </tspan>Mỗi ứng viên chỉ bật <tspan fontWeight={700} fill={INK}>1 CV</tspan>. Đơn ứng viên tự nộp thì NTD xem miễn phí ở Candidate management — Talent pool là đường riêng.</text>
      <text x={30} y={256} fontSize={11} fill={MUT}>Reject CV hoàn credit cho mọi công ty đã mở khoá ứng viên đó.</text>
    </Frame>
  )
}

/* ── Talent pool folder (phía NTD, 16/10/2026) — the only paid move is out of Saved */
export function TalentPoolFolderFlow() {
  return (
    <Frame label="Folder Talent pool: kéo thẻ ra khỏi Saved là mở khoá và trừ credit" w={1200} h={360}>
      <Premise title="FOLDER TALENT POOL — lưu miễn phí; lần kéo đầu tiên ra khỏi Saved là lần trả tiền">
        Thẻ trong folder <tspan fontWeight={700} fill={INK}>không phải đơn ứng tuyển</tspan> — kéo thẻ không đổi gì phía ứng viên.
      </Premise>
      <Box x={30} y={130} w={190} h={70} title="Tìm kiếm" sub="Save candidate" />
      <Arrow d="M 220 165 L 258 165" />
      <Box x={260} y={130} w={200} h={70} title="Folder: cột Saved" sub="tên bị che" />
      <Arrow d="M 460 165 L 518 165" label="kéo sang cột khác" lx={489} ly={157} />
      <text x={489} y={182} fontSize={10} textAnchor="middle" fill={MUT} {...HALO}>(chưa mở khoá)</text>
      <Box x={520} y={130} w={200} h={70} title="Xác nhận trừ credit?" sub="Moving this card spends a credit" tone="wait" />
      <Arrow d="M 720 165 L 778 165" tone="brand" label="Spend credits and move" lx={749} ly={150} />
      <Box x={780} y={124} w={200} h={82} title="Mở khoá" sub="thẻ chuyển cột" sub2="thấy tên, liên hệ, file CV" tone="money" />
      <Arrow d="M 620 200 C 620 250, 360 250, 360 202" label="Don’t move — ở lại Saved, không trừ" lx={490} ly={252} />
      <Arrow d="M 980 165 L 1008 165" />
      <Box x={1010} y={90} w={160} h={44} title="Interview 1, 2…" />
      <Box x={1010} y={146} w={160} h={44} title="Passed" tone="money" />
      <Box x={1010} y={202} w={160} h={44} title="Not This Time" tone="side" />
      <rect x={14} y={284} width={1172} height={60} rx={8} fill="#fffbeb" stroke={AMB} strokeWidth={1.2} />
      <text x={30} y={308} fontSize={11} fill={MUT}><tspan fontWeight={800} fill={AMB}>Luật · </tspan>Thẻ đã mở khoá, hoặc kéo giữa các cột không phải từ Saved: <tspan fontWeight={700} fill={INK}>không trừ credit</tspan>.</text>
      <text x={30} y={328} fontSize={11} fill={MUT}>Mở khoá một lần dùng vĩnh viễn cho cả công ty — folder khác không trừ lại.</text>
    </Frame>
  )
}

/* ── Talent pool search (phía NTD, 16/10/2026) — two roads to the same unlock */
export function TalentPoolSearchFlow() {
  return (
    <Frame label="Tìm kiếm Talent pool: lưu miễn phí, mở khoá từ trang CV hoặc từ folder" w={1200} h={380}>
      <Premise title="TÌM · LƯU · MỞ KHOÁ — hai đường tới cùng một lần trả tiền">
        Tìm, lọc, lưu đều <tspan fontWeight={700} fill={INK}>miễn phí</tspan>. Trả credit khi bấm Unlock trên trang CV, hoặc khi kéo thẻ chưa mở khoá ra khỏi Saved.
      </Premise>
      <Box x={30} y={150} w={200} h={70} title="Tìm kiếm" sub="từ khoá + bộ lọc" />
      <Arrow d="M 230 185 L 278 185" />
      <Box x={280} y={150} w={200} h={70} title="Kết quả" sub="tên bị che" />
      <Arrow d="M 480 172 C 520 172, 520 116, 558 116" label="Mở trang CV" lx={520} ly={132} anchor="middle" />
      <Arrow d="M 480 198 C 520 198, 520 266, 558 266" label="Save candidate (miễn phí)" lx={520} ly={252} anchor="middle" />
      <Box x={560} y={84} w={240} h={64} title="Trang CV" sub="liên hệ bị che" tone="wait" />
      <Box x={560} y={234} w={240} h={64} title="Folder: cột Saved" sub="tên bị che" />
      <Arrow d="M 680 148 L 680 232" label="Save candidate" lx={690} ly={194} anchor="start" />
      <Arrow d="M 800 116 C 850 116, 850 185, 898 185" tone="brand" label="Unlock: 1 credit" lx={858} ly={140} anchor="start" />
      <Arrow d="M 800 266 C 850 266, 850 195, 898 195" tone="brand" label="kéo ra khỏi Saved (chưa mở khoá)" lx={858} ly={262} anchor="start" />
      <Box x={900} y={150} w={270} h={70} title="Thấy tên, liên hệ, file CV" sub="một lần, vĩnh viễn, cho cả công ty" tone="money" />
      <rect x={14} y={318} width={1172} height={48} rx={8} fill="#fffbeb" stroke={AMB} strokeWidth={1.2} />
      <text x={30} y={340} fontSize={11} fill={MUT}><tspan fontWeight={800} fill={AMB}>Luật · </tspan>Ứng viên đã nộp đơn vào công ty thì xem miễn phí ở <tspan fontWeight={700} fill={INK}>Candidate management › Jobs</tspan>; tìm thấy họ trong Talent pool thì vẫn cần mở khoá.</text>
    </Frame>
  )
}

/* ── Boosting — banner nào hiện, theo thứ tự nào ───────────────────────────────
   Checked against svn-be `BannerService.listVisible` + `PeriodicRotation` and
   svn-web `banner.service.ts` / `banner-deck.tsx` on 16/10/2026. Lane ① is the
   server and is the same for every visitor; lane ② is what each region's page
   does with that list, which is where the regions stop being alike. */
export function BoostOrderFlow() {
  const xs = [30, 262, 494, 726, 958]
  return (
    <Frame label="Hệ thống xếp danh sách banner của một vùng rồi site vẽ theo kiểu từng vùng" w={1200} h={490}>
      <Premise title="BANNER NÀO HIỆN, THEO THỨ TỰ NÀO — tính lại mỗi chu kỳ Rotation period">
        Chu kỳ tính theo <tspan fontWeight={700} fill={INK}>đồng hồ</tspan> (60 s = mỗi phút tròn, 300 s = 10:00–10:05…), không tính từ lúc đăng banner.
        Trong cùng một chu kỳ, <tspan fontWeight={700} fill={INK}>mọi người xem nhận cùng một thứ tự</tspan>.
      </Premise>

      <Lane y={82} h={130} label="① HỆ THỐNG XẾP DANH SÁCH — giống nhau cho mọi người xem" />
      <Box x={30} y={116} w={260} h={80} title="Banner đủ điều kiện" sub="Published · đang trong ngày chạy" sub2="Visible = On" />
      <Arrow d="M 290 156 L 318 156" />
      <Box x={320} y={116} w={260} h={80} title="Thứ tự gốc" sub="Starts mới nhất đứng đầu" sub2="KHÔNG theo ngày tạo banner" />
      <Arrow d="M 580 156 L 608 156" />
      <Box x={610} y={116} w={260} h={80} title="Xoay vòng mỗi chu kỳ" sub="banner đầu chuyển xuống cuối" sub2="A, B, C → B, C, A → C, A, B" tone="brand" />
      <Arrow d="M 870 156 L 898 156" />
      <Box x={900} y={116} w={260} h={80} title="Cắt theo Number of slides" sub="rồi gửi cho site" sub2="site giữ bản này tối đa 60 s" />

      <Lane y={228} h={150} label="② SITE VẼ THEO KIỂU CỦA TỪNG VÙNG" />
      <path d={`M 1030 196 L 1030 250 M ${xs[0] + 107} 250 L 1030 250`} fill="none" stroke="#b9b6ae" strokeWidth={1.8} />
      {xs.map((x) => (
        <path key={x} d={`M ${x + 107} 250 L ${x + 107} 266`} fill="none" stroke="#b9b6ae" strokeWidth={1.8} markerEnd="url(#pf-p)" />
      ))}
      <Box x={xs[0]} y={270} w={214} h={86} title="Vùng 1 ô" sub="hiện banner ĐỨNG ĐẦU" sub2="tải lại trang mới đổi" />
      <Box x={xs[1]} y={270} w={214} h={86} title="Home Hero" sub="mọi banner là một slide" sub2="tự trượt mỗi 3 giây" />
      <Box x={xs[2]} y={270} w={214} h={86} title="My page" sub="2 banner một lúc" sub2="tự lật: chu kỳ ÷ số banner" />
      <Box x={xs[3]} y={270} w={214} h={86} title="Cột phải trang Search" sub="hiện TẤT CẢ, xếp chồng" sub2="chu kỳ đổi ai nằm trên" />
      <Box x={xs[4]} y={270} w={214} h={86} title="Site nhà tuyển dụng [CO]" sub="chọn NGẪU NHIÊN mỗi lần tải" sub2="Rotation period không tác dụng" tone="wait" />

      <rect x={14} y={394} width={1172} height={82} rx={8} fill="#fffbeb" stroke={AMB} strokeWidth={1.2} />
      <text x={30} y={416} fontSize={11} fill={MUT}><tspan fontWeight={800} fill={AMB}>Luôn đúng · </tspan>Qua N chu kỳ, mỗi banner trong N banner đứng đầu <tspan fontWeight={700} fill={INK}>đúng một lần</tspan> — công bằng cho khách, và trả lời được “14:32 tới lượt ai”.</text>
      <text x={30} y={437} fontSize={11} fill={MUT}>Rotation period <tspan fontWeight={700} fill={INK}>để trống</tspan> = không bao giờ xoay: banner có Starts mới nhất luôn đứng đầu. · Visible = Off: không hiện, nhưng <tspan fontWeight={700} fill={INK}>vẫn giữ chỗ</tspan> trong vùng.</text>
      <text x={30} y={458} fontSize={11} fill={MUT}><tspan fontWeight={700} fill={INK}>Popup không xoay</tspan>: Priority nhỏ nhất thắng, hoà thì Starts sớm hơn thắng. · Trang công ty: công ty tự mua thì quảng cáo của họ <tspan fontWeight={700} fill={INK}>thay</tspan> quảng cáo mạng lưới.</text>
    </Frame>
  )
}

/* The rule above, run for four minutes on one box — the picture a client asks
   for when they hear "it rotates every 60 seconds". */
export function BoostRotationFlow() {
  const xs = [40, 330, 620, 910]
  const orders = [['A', 'B', 'C'], ['B', 'C', 'A'], ['C', 'A', 'B'], ['A', 'B', 'C']]
  const times = ['10:00:00 – 10:00:59', '10:01:00 – 10:01:59', '10:02:00 – 10:02:59', '10:03:00 – 10:03:59']
  return (
    <Frame label="Ví dụ xoay vòng ở một vùng một ô, Rotation period 60 giây, trong bốn phút" w={1200} h={350}>
      <Premise title="VÍ DỤ — vùng 1 ô (vd. Job detail · Bottom Banner), 3 banner, Rotation period = 60 giây">
        Starts: A 15/10 · B 10/10 · C 01/10 → thứ tự gốc <tspan fontWeight={700} fill={INK}>A, B, C</tspan>. Mỗi phút, banner đứng đầu chuyển xuống cuối; ô trên site hiện banner đứng đầu.
      </Premise>
      {xs.map((x, i) => (
        <g key={x}>
          <text x={x + 125} y={100} fontSize={12} fontWeight={800} textAnchor="middle" fill={INK}>{times[i]}</text>
          {orders[i].map((b, j) => (
            <g key={b}>
              <rect x={x} y={114 + j * 36} width={250} height={30} rx={6}
                    fill={j === 0 ? 'var(--color-brand-soft)' : 'var(--color-surface)'} stroke={j === 0 ? BR : 'var(--color-line)'} strokeWidth={1.5} />
              <text x={x + 125} y={134 + j * 36} fontSize={12} fontWeight={j === 0 ? 800 : 500} textAnchor="middle" fill={j === 0 ? BR : MUT}>
                {j === 0 ? `Banner ${b} — đang hiện` : `Banner ${b}`}
              </text>
            </g>
          ))}
          {i < 3 && <Arrow d={`M ${x + 256} 165 L ${x + 284} 165`} label="+60 s" lx={x + 270} ly={157} />}
          <Arrow d={`M ${x + 125} 222 L ${x + 125} 246`} tone="brand" />
          <Box x={x} y={250} w={250} h={52} title={`Ai tải trang lúc này`} sub={`đều thấy Banner ${orders[i][0]}`} tone="money" />
        </g>
      ))}
      <text x={30} y={330} fontSize={11} fill={MUT}>
        Đang xem thì banner <tspan fontWeight={700} fill={INK}>không tự đổi</tspan> — phải tải lại trang. Có thể trễ tới ~1 phút vì site giữ danh sách 60 s.
        Chu kỳ nào A đứng đầu là do hệ thống tính; mỗi vùng có điểm xuất phát riêng.
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
  'md-overview': MdOverviewFlow,
  'md-delete': MdDeleteFlow,
  'md-taxonomy': MdTaxonomyFlow,
  'md-taxonomy-import': MdTaxonomyImportFlow,
  'md-industries': MdIndustriesFlow,
  'md-missing-skills': MdMissingSkillsFlow,
  'md-candidate': MdCandidateFlow,
  'md-locations': MdLocationsFlow,
  'cm-overview': CmOverviewFlow,
  'cm-states': CmStatesFlow,
  'cm-review': CmReviewFlow,
  'cm-decision': CmDecisionFlow,
  'cm-kanban': CmKanbanFlow,
  'cm-candidate-status': CmCandidateStatusFlow,
  'cm-notify': CmNotifyFlow,
  'cv-create': CvCreateFlow,
  'cvr-overview': CvReviewFlow,
  'tp-overview': TalentPoolFlow,
  'tpe-flow': TalentPoolFolderFlow,
  'tpe-search': TalentPoolSearchFlow,
  'boost-order': BoostOrderFlow,
  'boost-rotation': BoostRotationFlow,
}
