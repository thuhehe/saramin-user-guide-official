/**
 * Toàn cảnh — the page a newcomer opens first.
 *
 * Two flowcharts, not one. The system has exactly two chains that matter, they
 * run in opposite directions, and they meet on the company site: money flows
 * Saramin → company → a job on the jobseeker site, and people flow jobseeker →
 * Saramin → the same company's board. Drawing them as one diagram was tried and
 * produces a picture nobody can follow; drawn apart, each is a straight line.
 *
 * The SVGs are hand-authored rather than generated, because the whole value here
 * is that the boxes are the SAME NOUNS the console uses. A layout engine would
 * place them by graph shape, and the reader would lose the left-to-right reading
 * that makes "the invoice is the moment" legible at a glance.
 */

const CHAIN = {
  ink: '#16181d',
  muted: '#5f6570',
  faint: '#9b9fa8',
  line: '#e3e1db',
  brand: '#0f766e',
  brandSoft: '#e6f2f0',
  surface: '#ffffff',
}

function Box({
  x, y, w = 132, h = 46, title, sub, accent, dashed,
}: { x: number; y: number; w?: number; h?: number; title: string; sub?: string; accent?: boolean; dashed?: boolean }) {
  return (
    <g>
      <rect
        x={x} y={y} width={w} height={h} rx={6}
        fill={accent ? CHAIN.brandSoft : CHAIN.surface}
        stroke={accent ? CHAIN.brand : CHAIN.line}
        strokeWidth={accent ? 1.5 : 1}
        strokeDasharray={dashed ? '4 3' : undefined}
      />
      <text x={x + w / 2} y={sub ? y + 20 : y + h / 2 + 4} textAnchor="middle" fontSize="11.5" fontWeight="600" fill={accent ? CHAIN.brand : CHAIN.ink}>
        {title}
      </text>
      {sub && (
        <text x={x + w / 2} y={y + 34} textAnchor="middle" fontSize="9.5" fill={CHAIN.muted}>
          {sub}
        </text>
      )}
    </g>
  )
}

function Arrow({ x1, y1, x2, y2, label, dashed }: { x1: number; y1: number; x2: number; y2: number; label?: string; dashed?: boolean }) {
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={CHAIN.faint} strokeWidth={1.2} strokeDasharray={dashed ? '3 3' : undefined} markerEnd="url(#ar)" />
      {label && (
        <text x={(x1 + x2) / 2} y={y1 === y2 ? y1 - 6 : (y1 + y2) / 2 - 4} textAnchor="middle" fontSize="9" fill={CHAIN.muted}>
          {label}
        </text>
      )}
    </g>
  )
}

function Lane({ y, h, label }: { y: number; h: number; label: string }) {
  return (
    <g>
      <rect x={0} y={y} width={880} height={h} fill="none" stroke={CHAIN.line} strokeWidth={1} strokeDasharray="2 4" rx={4} />
      <text x={8} y={y + 13} fontSize="9" fontWeight="700" letterSpacing="0.08em" fill={CHAIN.faint}>
        {label.toUpperCase()}
      </text>
    </g>
  )
}

const defs = (
  <defs>
    <marker id="ar" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M0,0 L8,4 L0,8 z" fill={CHAIN.faint} />
    </marker>
  </defs>
)

/* ── Chain 1 — money ────────────────────────────────────────────────────────── */

function MoneyChain() {
  return (
    <svg viewBox="0 0 880 452" className="w-full" role="img" aria-label="Chuỗi từ sản phẩm tới tin hiển thị">
      {defs}

      <Lane y={0} h={78} label="1 · Khai báo — Admin, làm một lần" />
      <Box x={22} y={22} title="Placement" sub="vùng hiển thị trên site" />
      <Arrow x1={154} y1={45} x2={196} y2={45} />
      <Box x={198} y={22} w={168} title="Product = Bậc tin" sub="Placement slots · thời lượng" accent />
      <Arrow x1={366} y1={45} x2={408} y2={45} />
      <Box x={410} y={22} title="Package" sub="gộp nhiều product" dashed />
      <Arrow x1={542} y1={45} x2={584} y2={45} />
      <Box x={586} y={22} w={150} title="Thang bậc tin" sub="bậc nào đứng trên bậc nào" />

      <Lane y={96} h={78} label="2 · Bán — Admin, CRM" />
      <Box x={22} y={118} title="Company" sub="phải ACTIVE" />
      <Arrow x1={154} y1={141} x2={196} y2={141} />
      <Box x={198} y={118} title="Quotation" sub="1–3 option, khách chọn 1" />
      <Arrow x1={330} y1={141} x2={372} y2={141} label="chấp nhận" />
      <Box x={374} y={118} w={150} title="Purchase Order" sub="ACTIVE — chưa cấp gì" />
      <Arrow x1={524} y1={141} x2={566} y2={141} />
      <Box x={568} y={118} w={168} title="Invoice ISSUED" sub="★ thời điểm quyết định" accent />

      <Lane y={192} h={70} label="3 · Cấp quyền — cùng một transaction với Issue" />
      <Arrow x1={652} y1={164} x2={652} y2={210} />
      <Box x={330} y={206} w={300} h={42} title="Quota về tài khoản công ty" sub="N lượt đăng theo TỪNG bậc · hoặc N lượt mở khoá CV" accent />

      <Lane y={280} h={78} label="4 · Dùng — Admin đăng hộ, hoặc công ty tự đăng trên Company site" />
      <Arrow x1={480} y1={248} x2={88} y2={298} />
      <Box x={22} y={302} w={132} title="Tạo tin" sub="chọn PO → product" />
      <Arrow x1={154} y1={325} x2={196} y2={325} label="publish" />
      <Box x={198} y={302} w={172} title="Trừ 1 slot của bậc đó" sub="hết quota → bị từ chối" />
      <Arrow x1={370} y1={325} x2={412} y2={325} />
      <Box x={414} y={302} w={146} title="JobPlacement" sub="tối đa 1 ACTIVE / tin" />

      <Lane y={376} h={76} label="5 · Hiển thị — Jobseeker site, không ai cấu hình thêm" />
      <Arrow x1={487} y1={348} x2={620} y2={394} />
      <Box x={520} y={390} w={286} h={46} title="Tin tự lên đúng các vùng bậc đó mua" sub="Placement đọc theo bậc — không gán tay từng tin" accent />
      <text x={22} y={404} fontSize="10.5" fontWeight="600" fill={CHAIN.ink}>Điều kiện để thấy:</text>
      <text x={22} y={419} fontSize="9.5" fill={CHAIN.muted}>tin OPEN · Exposure bật ·</text>
      <text x={22} y={432} fontSize="9.5" fill={CHAIN.muted}>công ty ACTIVE · còn trong cửa sổ hiển thị</text>
    </svg>
  )
}

/* ── Chain 2 — people ───────────────────────────────────────────────────────── */

function PeopleChain() {
  return (
    <svg viewBox="0 0 880 300" className="w-full" role="img" aria-label="Chuỗi từ CV tới bảng ứng viên">
      {defs}

      <Lane y={0} h={78} label="Jobseeker site" />
      <Box x={22} y={22} title="Tải CV lên" sub="hoặc soạn CV Saramin" />
      <Arrow x1={154} y1={45} x2={196} y2={45} />
      <Box x={198} y={22} w={188} title="Máy quét chạy ngay" sub="mỗi lần lưu, không phải lúc nộp" accent />
      <Arrow x1={386} y1={45} x2={428} y2={45} />
      <Box x={430} y={22} title="Nộp đơn" sub="đơn luôn tạo được" />

      <Lane y={96} h={100} label="Admin — chỉ khi máy quét còn nghi ngờ" />
      <Arrow x1={294} y1={68} x2={294} y2={118} label="nghi ngờ" />
      <Box x={198} y={122} w={188} h={52} title="CV review" sub="người duyệt quyết — không có gì tự thả" accent />
      <text x={410} y={136} fontSize="10" fill={CHAIN.muted}>Duyệt → mọi đơn đang giữ được gửi cùng một lúc</text>
      <text x={410} y={152} fontSize="10" fill={CHAIN.muted}>Từ chối → đơn đang giữ mất, đơn đã gửi bị thu hồi</text>
      <text x={410} y={168} fontSize="10" fontWeight="600" fill={CHAIN.ink}>Duyệt CV, không bao giờ duyệt từng đơn</text>

      <Lane y={214} h={86} label="Company site — bảng ứng viên của nhà tuyển dụng" />
      <Arrow x1={294} y1={174} x2={294} y2={236} label="đã gửi" />
      <Box x={198} y={240} w={188} title="Bảng tuyển dụng" sub="chặng do công ty tự đặt" />
      <Box x={430} y={240} w={188} title="Tìm ứng viên (CV search)" sub="mở khoá 1 credit / người" dashed />
      <Arrow x1={430} y1={263} x2={388} y2={263} label="lưu vào folder" />
      <text x={640} y={258} fontSize="9.5" fill={CHAIN.muted}>Credit đến từ chuỗi bên trên —</text>
      <text x={640} y={271} fontSize="9.5" fill={CHAIN.muted}>sản phẩm CV search trên hoá đơn.</text>
    </svg>
  )
}

/* ── the page ───────────────────────────────────────────────────────────────── */

export function OverviewFlow() {
  return (
    <div className="space-y-10">
      <header>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-brand">Đọc trước</p>
        <h1 className="mt-1 text-[26px] font-bold leading-tight tracking-tight">Toàn cảnh hệ thống</h1>
        <p className="mt-2 max-w-[74ch] text-[13.5px] leading-[1.75] text-ink/75">
          Hệ thống có <strong>ba mặt</strong> — Admin (nhân viên Saramin), Company site (nhà tuyển dụng) và
          Jobseeker site (người tìm việc) — và <strong>đúng hai chuỗi</strong> chạy xuyên qua chúng. Hiểu hai
          chuỗi này thì mọi module còn lại chỉ là một chặng trên đó.
        </p>
      </header>

      <section>
        <h2 className="text-[17px] font-bold tracking-tight">Chuỗi 1 — tiền đi tới chỗ hiển thị</h2>
        <p className="mt-1.5 max-w-[74ch] text-[13px] leading-[1.7] text-ink/75">
          Công ty mua gói đăng tuyển. Đúng lúc kế toán <strong>phát hành hoá đơn VAT</strong>, công ty có ngay
          quota cho đúng bậc đã mua. Đăng tin dưới bậc đó thì tin <strong>tự</strong> xuất hiện ở đúng những vùng
          mà bậc đó mua quyền xuất hiện. Không ai gõ tay “tin này thuộc banner nào”.
        </p>
        <div className="mt-4 rounded-lg border border-line bg-surface p-4">
          <MoneyChain />
        </div>
        <p className="mt-3 max-w-[74ch] border-l-2 border-ink/30 py-1.5 pl-4 text-[13px] leading-[1.7] text-ink/80">
          <span className="mr-1.5 font-mono text-[9.5px] uppercase tracking-wider text-ink/45">điểm hẹp</span>
          Mọi con đường từ tiền tới quyền lợi đi qua <strong>đúng một chỗ</strong>: lúc hoá đơn được phát hành.
          Purchase Order ở trạng thái <em>ACTIVE</em> mới chỉ <strong>đóng băng kế hoạch sẽ cấp gì</strong> — nó
          không cấp gì cả. Đây là câu trả lời cho hầu hết các câu hỏi dạng “khách mua rồi mà sao chưa đăng tin được”.
        </p>
      </section>

      <section>
        <h2 className="text-[17px] font-bold tracking-tight">Chuỗi 2 — người đi tới bảng ứng viên</h2>
        <p className="mt-1.5 max-w-[74ch] text-[13px] leading-[1.7] text-ink/75">
          Ứng viên tải CV lên, máy quét chạy ngay tại chỗ. CV đạt thì đi thẳng; CV còn nghi ngờ thì{' '}
          <strong>đơn vẫn nộp được nhưng việc giao đơn bị giữ lại</strong> cho tới khi một người duyệt CV. Chiều
          ngược lại, nhà tuyển dụng tự đi tìm người trong kho ứng viên và trả credit để mở khoá.
        </p>
        <div className="mt-4 rounded-lg border border-line bg-surface p-4">
          <PeopleChain />
        </div>
        <p className="mt-3 max-w-[74ch] border-l-2 border-ink/30 py-1.5 pl-4 text-[13px] leading-[1.7] text-ink/80">
          <span className="mr-1.5 font-mono text-[9.5px] uppercase tracking-wider text-ink/45">điểm hẹp</span>
          Trạng thái CV là <strong>sự thật duy nhất được lưu</strong>. Việc đơn có tới tay nhà tuyển dụng không, và
          CV có hiện trong tìm kiếm không, đều là <strong>hình chiếu</strong> của nó — không màn hình nào đặt tay
          được hai thứ đó.
        </p>
      </section>

      <section>
        <h2 className="text-[17px] font-bold tracking-tight">Mỗi module là một chặng</h2>
        <p className="mt-1.5 max-w-[74ch] text-[13px] leading-[1.7] text-ink/75">
          Một quy tắc cho mỗi module — cái mà nếu không biết thì sẽ làm sai.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-[12.5px]">
            <thead>
              <tr className="border-b border-ink/15 text-left">
                <th className="py-2 pr-4 font-semibold">Module</th>
                <th className="py-2 pr-4 font-semibold">Chặng nào</th>
                <th className="py-2 font-semibold">Quy tắc quyết định tất cả</th>
              </tr>
            </thead>
            <tbody className="align-top">
              {MODULE_RULES.map(([m, stage, rule]) => (
                <tr key={m} className="border-b border-line-soft">
                  <td className="py-2.5 pr-4 font-semibold whitespace-nowrap">{m}</td>
                  <td className="py-2.5 pr-4 text-ink/70">{stage}</td>
                  <td className="py-2.5 leading-[1.65] text-ink/80">{rule}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-[17px] font-bold tracking-tight">Trông nó ra sao</h2>
        <p className="mt-1.5 max-w-[74ch] text-[13px] leading-[1.7] text-ink/75">
          Hai đầu của chuỗi, để nhận ra mình đang ở đâu. Phần hướng dẫn dùng của từng module nằm ở
          cuối trang module đó — ảnh màn hình thật, không phải hướng dẫn bấm từng nút.
        </p>
        <div className="mt-4 space-y-6">
          <figure>
            <img src="/shots/02-dashboard-nav.jpg" alt="Sidebar và dashboard admin" loading="lazy"
                 className="w-full max-w-[820px] rounded-lg border border-line bg-surface" />
            <figcaption className="mt-2 max-w-[74ch] text-[12px] leading-[1.65] text-muted">
              <span className="mr-2 rounded border border-line bg-surface px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-wider text-brand">Admin</span>
              Sidebar gom theo domain. <strong>Quyền của bạn quyết định bạn thấy trang nào</strong> — một trang có
              trong tài liệu mà không có trong sidebar của bạn là <strong>thiếu permission, không phải bug</strong>.
            </figcaption>
          </figure>
          <figure>
            <img src="/shots/60-web-home-top.jpg" alt="Trang chủ jobseeker" loading="lazy"
                 className="w-full max-w-[820px] rounded-lg border border-line bg-surface" />
            <figcaption className="mt-2 max-w-[74ch] text-[12px] leading-[1.65] text-muted">
              <span className="mr-2 rounded border border-line bg-surface px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-wider text-brand">Jobseeker site</span>
              Đầu kia của chuỗi. Mọi thứ cấu hình ở Admin cuối cùng hiện ra ở đây — và đây cũng là chỗ để
              kiểm một thay đổi có thật sự đi tới nơi hay không.
            </figcaption>
          </figure>
        </div>
        <figure className="mt-6">
          <img src="/shots/co-00-landing.jpg" alt="Trang nhà tuyển dụng, chưa đăng nhập" loading="lazy"
               className="w-full max-w-[820px] rounded-lg border border-line bg-surface" />
          <figcaption className="mt-2 max-w-[74ch] text-[12px] leading-[1.65] text-muted">
            <span className="mr-2 rounded border border-line bg-surface px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-wider text-brand">Company site</span>
            Mặt ở giữa — nơi khách hàng tự phục vụ. Thanh menu trên cùng là toàn bộ việc một nhà tuyển
            dụng làm được: <strong>Tin tuyển dụng · Kho ứng viên · Quản lý ứng viên · Sản phẩm tuyển dụng</strong>.
          </figcaption>
        </figure>
        <p className="mt-4 max-w-[74ch] border-l-2 border-amber-500/70 bg-amber-50/60 py-2 pl-4 pr-4 text-[13px] leading-[1.7] text-ink/80">
          <span className="mr-1.5 font-mono text-[9.5px] uppercase tracking-wider text-amber-700">còn thiếu</span>
          <strong>Các màn hình Company site sau khi đăng nhập chưa chụp được</strong> — bảng ứng viên, kho ứng
          viên và folder, tìm/mở khoá CV, nạp credit, thành viên và phân quyền. Chúng cần một phiên đăng nhập
          bằng tài khoản nhà tuyển dụng trên dev; hiện mới có hai trang công khai ở trên. Mô tả bằng lời của
          những màn đó nằm ở <em>Applications</em>, <em>Kho ứng viên</em> và <em>Company users</em>.
        </p>
      </section>

      <section>
        <h2 className="text-[17px] font-bold tracking-tight">Ba mặt, ba tập tài khoản</h2>
        <p className="mt-1.5 max-w-[74ch] text-[13px] leading-[1.7] text-ink/75">
          Ba tập này <strong>không bao giờ lẫn vào nhau</strong>, kể cả khi cùng một người giữ hai tài khoản.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {SURFACES.map(([name, who, what]) => (
            <div key={name} className="rounded-lg border border-line bg-surface p-4">
              <p className="font-mono text-[9.5px] uppercase tracking-wider text-brand">{name}</p>
              <p className="mt-1 text-[13px] font-semibold">{who}</p>
              <p className="mt-1.5 text-[12px] leading-[1.6] text-muted">{what}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

const MODULE_RULES: [string, string, string][] = [
  ['Product settings', 'Khai báo bán cái gì', 'Field Type quyết định hoá đơn giao cái gì. Với loại Job posting, product CHÍNH LÀ bậc tin — và Placement slots trên product là thứ định nghĩa bậc đó hiện ở đâu.'],
  ['CRM', 'Bán và thu tiền', 'Phát hành hoá đơn là thời điểm cấp quota — không phải lúc chốt PO. PO hết hạn vào cuối THÁNG, không phải sau 30 ngày.'],
  ['Service delivery', 'Theo dõi đã giao gì', 'Quota đếm theo TỪNG bậc. Mua 5 tin Top job là 5 slot Top job, không phải 5 slot bất kỳ.'],
  ['Recruitment · Jobs', 'Tiêu quota để đăng tin', 'Exposure độc lập với status: tin có thể OPEN mà vẫn không ai thấy. Và tin chỉ vào được OPEN khi công ty đang ACTIVE.'],
  ['Recruitment · CV review', 'Gác cổng chất lượng CV', 'Duyệt CV, không bao giờ duyệt từng đơn. Một lần duyệt giải phóng mọi đơn đang chờ CV đó; không có gì tự thả sau N giờ.'],
  ['Recruitment · Kho ứng viên', 'Bán quyền tiếp cận ứng viên', 'Một credit mua một người, vĩnh viễn, cho cả công ty. Lưu là miễn phí; mở khoá mới mất tiền.'],
  ['Users', 'Tài khoản ứng viên', 'Khoá một người là kiểm soát truy cập, hết — nó không từ chối CV và không thu hồi đơn đã giao.'],
  ['Content', 'Trang chiến dịch và menu', 'Zone không chứa tin. Cả hai danh sách của nó trỏ vào Collection — sai công ty thì sửa collection, không sửa zone.'],
  ['Organisation', 'Ai được làm gì', 'Phòng ban (ngồi đâu) × vai trò (làm gì) × phạm vi dữ liệu (trên dữ liệu nào). Làm leader không cấp thêm quyền nào.'],
  ['System', 'Dữ liệu nền', 'Master data là thứ mọi dropdown đọc. Sửa một giá trị là đổi mọi màn hình đang dùng nó.'],
]

const SURFACES: [string, string, string][] = [
  ['Admin', 'Nhân viên Saramin', 'Bán gói, tạo và quản tin, duyệt CV, cấu hình chỗ hiển thị. Chính là console mà tài liệu này mô tả.'],
  ['Company site', 'Nhà tuyển dụng (khách hàng)', 'Tự đăng tin bằng gói đã mua, quản bảng ứng viên, tìm và mở khoá CV bằng credit.'],
  ['Jobseeker site', 'Người tìm việc', 'Xem tin, soạn hoặc tải CV, nộp đơn. Đây là nơi kết quả của mọi cấu hình phía trên hiện ra.'],
]
