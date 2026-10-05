import { md } from './md'

/**
 * Danh sách flow cho buổi demo + lượt test cuối.
 *
 * Hai người đọc, một trang: tester chạy từ trên xuống để soát, người demo bám
 * vào đúng thứ tự đó để kể chuyện. Vì vậy mỗi flow mang cả **bước bấm** lẫn
 * **câu chốt** — một checklist thuần sẽ không giúp người đứng trước khách, và
 * một kịch bản thuần sẽ không giúp người đi soát.
 *
 * Thứ tự các flow chính LÀ thứ tự nên demo: chúng nối nhau thành một câu chuyện
 * (bán → giao → dùng → kết quả), nên chạy lệch thứ tự sẽ phải giải thích ngược.
 */

type Step = { do: string; see: string; page?: string }
type Flow = {
  id: string
  title: string
  goal: string
  surfaces: string[]
  minutes: number
  steps: Step[]
  punch: string
  fragile?: string
}

const PAGE = (k: string) => `/trang/${k}`

const MAIN: Flow[] = [
  {
    id: 'F1',
    title: 'Bán một gói đăng tuyển — từ báo giá tới lúc khách có quota',
    goal: 'Chứng minh chuỗi tiền chạy thật: báo giá → PO → hoá đơn → quyền lợi về tài khoản khách.',
    surfaces: ['Admin'],
    minutes: 6,
    steps: [
      { do: 'Mở hồ sơ một công ty **đang ACTIVE**, xem tab Products & billing **trước** khi bán', see: 'Ghi lại số slot hiện tại — không có mốc trước thì không chứng minh được sau', page: 'companies' },
      { do: 'Create quotation → dựng 2 option khác giá', see: 'Option là **phương án thay thế nhau**, khách chọn một, không cộng dồn', page: 'quotations' },
      { do: 'Khách chấp nhận một option → **Issue PO**', see: 'PO sang ACTIVE. Nói rõ: **tới đây khách vẫn CHƯA có gì** — PO mới chỉ đóng băng kế hoạch', page: 'purchase-order' },
      { do: 'Request official invoice → **Issue official invoice**', see: 'Nhận số hoá đơn hợp pháp', page: 'invoice' },
      { do: 'Quay lại Company → Products & billing', see: 'Số slot **đã tăng**, kèm hạn dùng', page: 'companies' },
    ],
    punch: 'Phát hành hoá đơn và cấp quyền lợi xảy ra **trong cùng một giao dịch** — không có độ trễ, khách đăng tin được ngay giây đó. Đây là mốc quan trọng nhất của toàn hệ thống.',
    fragile: 'Ba trang danh sách CRM từng sập vì dữ liệu seed hỏng (xem phần Rủi ro). **Vào bằng đường Company → Create quotation** thay vì bấm menu Quotations, an toàn hơn.',
  },
  {
    id: 'F2',
    title: 'Tiêu quota để đăng tin — và thấy tin lên đúng chỗ trên site',
    goal: 'Chứng minh phần đã bán tự biến thành vị trí hiển thị, không ai gán tay.',
    surfaces: ['Admin', 'Jobseeker site'],
    minutes: 7,
    steps: [
      { do: 'Jobs → New job → chọn đúng công ty vừa bán', see: 'Mục **Posting setup**', page: 'jobs' },
      { do: 'Chọn **PO** vừa phát hành', see: 'Danh sách Main product **thu lại chỉ còn các dòng đã trả tiền của PO đó**', page: 'jobs' },
      { do: 'Chọn bậc tin, điền nội dung, **Post now**', see: 'Tin sang OPEN; quota **giảm đúng 1 slot của bậc đó**', page: 'jobs' },
      { do: 'Mở site jobseeker, tới dải tương ứng', see: 'Tin xuất hiện — **không cấu hình gì thêm cho riêng tin này**', page: 'placements' },
      { do: 'Tắt **Exposure** rồi tải lại trang công khai', see: 'Tin biến mất dù vẫn đang OPEN', page: 'jobs' },
    ],
    punch: 'Tin lên đúng những vùng mà **bậc tin** đó mua quyền xuất hiện — quan hệ đó khai một lần trên sản phẩm (Placement slots), không phải khai lại cho từng tin.',
    fragile: 'Cache trang công khai khoảng 60 giây — đừng bấm tải lại liên tục rồi kết luận là lỗi. Tin chỉ vào được OPEN khi **công ty đang ACTIVE**.',
  },
  {
    id: 'F3',
    title: 'Nâng bậc một tin đang chạy',
    goal: 'Cho thấy khách mua thêm thì tin leo lên ngay, không phải đăng lại.',
    surfaces: ['Admin', 'Jobseeker site'],
    minutes: 3,
    steps: [
      { do: 'Mở một tin OPEN → **Upgrade tier**', see: 'Chỉ chào các bậc **cao hơn** trên thang', page: 'jobs' },
      { do: 'Chọn bậc cao hơn → xác nhận', see: 'Dòng **Current tier** đổi; trừ quota của bậc mới', page: 'jobs' },
      { do: 'Mở lại site công khai', see: 'Tin đã sang dải cao cấp hơn', page: 'product-ladder' },
    ],
    punch: 'Mỗi lần nâng tạo một bản ghi vị trí **mới** và huỷ bản cũ — lịch sử “tin này từng ở bậc nào, do đơn hàng nào” không bao giờ mất.',
    fragile: 'Không hạ bậc được. Tin **miễn phí không nâng lên bậc trả phí được** — đừng chọn nhầm tin free để demo.',
  },
  {
    id: 'F4',
    title: 'Ứng viên nộp đơn — CV qua vòng duyệt — đơn tới nhà tuyển dụng',
    goal: 'Chứng minh chuỗi người, và cho thấy việc duyệt CV quyết định cả loạt đơn cùng lúc.',
    surfaces: ['Jobseeker site', 'Admin', 'Company site'],
    minutes: 8,
    steps: [
      { do: 'Ứng viên tải lên một CV **thiếu dữ kiện** (không kinh nghiệm, không dự án)', see: 'Máy quét ghi **Chưa đủ thông tin** ngay khi lưu', page: 'cv-review' },
      { do: 'Ứng viên vẫn **nộp đơn vào 2–3 tin**', see: 'Nộp **thành công**, ứng viên thấy “Đã nộp” như bình thường', page: 'applicants' },
      { do: 'Admin mở Applications', see: 'Các đơn nằm ở **Chưa gửi** — nhà tuyển dụng chưa thấy gì', page: 'applicants' },
      { do: 'Admin mở CV review → đọc cột **Dùng để ứng tuyển** → **Duyệt**', see: 'Toast in ra **số đơn vừa được giải phóng**', page: 'cv-review' },
      { do: 'Mở bảng ứng viên phía công ty', see: 'Cả loạt đơn xuất hiện **cùng một lúc**', page: 'applicants' },
    ],
    punch: 'Người duyệt **duyệt CV, không bao giờ duyệt từng đơn**. Vì vậy không có nút “Gửi” ở trang đơn — và một hàng đợi bị bỏ quên là sự cố mà **ứng viên** chịu, không phải backlog nội bộ.',
    fragile: '**Rủi ro lớn nhất của buổi demo.** Trên dev, bộ quét đang cho qua mọi CV, nên hàng đợi CV review **tự nhiên sẽ rỗng**. Phải chuẩn bị sẵn một CV đang chờ duyệt **trước** buổi demo, nếu không flow này không có gì để chạy.',
  },
  {
    id: 'F5',
    title: 'Nhà tuyển dụng tự đi tìm ứng viên và trả credit để mở khoá',
    goal: 'Cho thấy mặt hàng thứ hai: bán quyền tiếp cận ứng viên, không chỉ bán chỗ đăng tin.',
    surfaces: ['Company site', 'Admin'],
    minutes: 6,
    steps: [
      { do: 'Company site → Tìm ứng viên, lọc vài tiêu chí', see: 'Tên bị che dạng `Long T***` — **che cả nơi từng làm và trường học**, không chỉ tên', page: 'talent-pool' },
      { do: '**Lưu** một ứng viên vào folder', see: 'Thẻ vào cột *Saved*, **vẫn che, chưa mất tiền**', page: 'talent-pool' },
      { do: 'Kéo thẻ **ra khỏi** cột Saved', see: 'Hộp thoại xác nhận trừ credit → lộ tên, điện thoại, email', page: 'talent-pool' },
      { do: 'Lưu đúng người đó vào folder thứ hai rồi kéo ra', see: '**Miễn phí** — một credit mua một người, vĩnh viễn, cho cả công ty', page: 'talent-pool' },
      { do: 'Admin → đối chiếu số credit đã dùng', see: 'Khớp với thao tác vừa rồi', page: 'quota-usage' },
    ],
    punch: 'Tính tiền đúng **lúc lộ danh tính**, không phải lúc tìm hay lúc lưu — nên nhà tuyển dụng duyệt thoải mái mà không sợ tốn.',
    fragile: 'Tab kho ứng viên phía công ty từng báo “không tải được folder” cho tới khi bấm chọn một folder ở thanh bên. **Bấm sẵn một folder trước khi chiếu màn hình.**',
  },
  {
    id: 'F6',
    title: 'Đặt chỗ banner (Boosting)',
    goal: 'Cho thấy nhánh bán hàng song song, không liên quan tin tuyển dụng.',
    surfaces: ['Admin', 'Jobseeker site'],
    minutes: 5,
    steps: [
      { do: 'Mở registry vùng hiển thị, chỉ một vùng **Display**', see: 'Kích thước creative, **số booking được chồng nhau**, vòng xoay', page: 'placements' },
      { do: 'Tạo booking cho một công ty trong một khoảng ngày', see: 'Hệ thống **chặn thật** khi vượt sức chứa của vùng đó', page: 'boosting' },
      { do: 'Tải creative đúng kích thước → xuất bản', see: 'Sai tỉ lệ thì **bị từ chối, không tự cắt**', page: 'boosting' },
      { do: 'Mở trang công khai', see: 'Banner chạy, xoay theo chu kỳ đã đặt', page: 'placements' },
    ],
    punch: 'Sức chứa là **cam kết bán được**: hệ thống không cho bán chồng quá số đã khai, nên không bao giờ hứa cho hai khách cùng một chỗ.',
    fragile: 'Chuẩn bị sẵn file ảnh **đúng kích thước** của vùng định demo — upload sai tỉ lệ bị chặn ngay trước mặt khách.',
  },
  {
    id: 'F7',
    title: 'Dựng một trang Premium cho khách lớn',
    goal: 'Cho thấy làm được trang thương hiệu riêng mà không cần lập trình.',
    surfaces: ['Admin', 'Jobseeker site'],
    minutes: 6,
    steps: [
      { do: 'Tạo **Collection** kiểu *Saved search* (bộ lọc) và một kiểu *Hand-picked* (ghim tay)', see: 'Ô **Preview** đếm sống số tin khớp', page: 'collections' },
      { do: 'Publish cả hai collection', see: 'Một chiều: Draft → Active → Archived', page: 'collections' },
      { do: 'Tạo **Zone**: địa chỉ, tiêu đề, banner, thanh tìm kiếm, trỏ hai danh sách vào hai collection', see: 'Panel **Page order** liệt kê cả 8 khối và giá trị hiện tại', page: 'zones' },
      { do: '**Publish** → bấm Preview', see: 'Trang công khai có thương hiệu khách', page: 'zones' },
    ],
    punch: 'Zone **không chứa tin** — nó trỏ vào collection. Nên “trang hiện sai công ty” luôn là lỗi của collection, sửa một chỗ là mọi trang dùng nó đổi theo.',
    fragile: 'Publish **đòi ít nhất một banner slide đã lưu** và cả hai collection phải Active. **Preview chỉ chạy khi zone đã Published** — chưa có preview cho bản nháp.',
  },
  {
    id: 'F8',
    title: 'Phân quyền nhân sự nội bộ',
    goal: 'Trả lời câu hỏi khách luôn hỏi: ai thấy được dữ liệu của ai.',
    surfaces: ['Admin'],
    minutes: 5,
    steps: [
      { do: 'Tạo phòng ban và team bên trong', see: 'Cây **hai tầng**, không có tầng ba', page: 'departments' },
      { do: 'Tạo vai trò, tick quyền theo từng trang', see: '**Create không bao hàm Read**; **Export tách khỏi Read** có chủ đích', page: 'roles' },
      { do: 'Mời một người: phòng ban + vai trò + **phạm vi dữ liệu**', see: 'Ba lựa chọn: tất cả / team của họ / chỉ của riêng họ', page: 'users' },
      { do: 'Đăng nhập bằng tài khoản đó (hoặc giải thích)', see: 'Chỉ thấy các trang vai trò mở ra, và chỉ các bản ghi phạm vi cho phép', page: 'users' },
    ],
    punch: 'Ba câu hỏi tách bạch: **ngồi ở đâu** (phòng ban) × **được làm gì** (vai trò) × **trên dữ liệu nào** (phạm vi). Làm leader **không** tự cấp thêm quyền nào.',
    fragile: 'Không tự sửa được vai trò của chính mình. Lời mời có **cooldown 60 giây** — bấm gửi lại nhanh quá sẽ báo lỗi, đừng tưởng hỏng.',
  },
]

type Sub = { group: string; items: { what: string; why: string; page?: string }[] }

const SUB: Sub[] = [
  {
    group: 'Nhánh của chuỗi bán hàng',
    items: [
      { what: 'Tin **miễn phí** — HQ đăng hộ, không chọn PO', why: 'Danh sách sản phẩm chỉ còn dòng Free; **không trừ quota của ai**', page: 'jobs' },
      { what: 'Báo giá **gói dùng thử** (Trial package)', why: 'Chỉ chào sản phẩm trial, **không trộn** với sản phẩm thường và không có package', page: 'discount-programmes' },
      { what: '**Package** nhiều sản phẩm một giá', why: 'Một dòng trên báo giá, nhưng cấp **riêng từng thành phần** lúc phát hành hoá đơn', page: 'packages' },
      { what: '**Premium package**', why: 'Đi theo **sản phẩm**, không theo người mua — tin mua lẻ cùng bậc cũng được đẩy lên khu Premium', page: 'packages' },
      { what: 'Kéo lại **thang bậc tin**', why: 'Đổi thứ tự “Gợi ý” trên trang tìm việc ngay', page: 'product-ladder' },
      { what: 'PO **hết hạn cuối tháng**', why: 'Không phải 30 ngày trôi — PO ngày 05 và ngày 28 cùng hết hạn ngày cuối tháng', page: 'purchase-order' },
      { what: '**Nạp credit** phía công ty', why: 'Đặt hàng → chờ chuyển khoản → **admin xác nhận** mới cấp credit', page: 'quota-usage' },
      { what: '**Manual service**', why: 'Không cấp gì tự động — mở một việc cho ops làm tay', page: 'manual-services' },
    ],
  },
  {
    group: 'Nhánh của chuỗi ứng viên',
    items: [
      { what: '**Từ chối** một CV đã từng gửi đi', why: 'Đơn đang giữ → mất hẳn; đơn **đã gửi bằng đúng version đó** → **thu hồi**, hoàn lại lượt mở khoá', page: 'cv-review' },
      { what: 'Ứng viên thay file → **v.2**', why: 'Quét lại; **version mới không rửa được lần từ chối cũ**', page: 'cv-review' },
      { what: 'CV **Saramin** thiếu dữ kiện', why: '**Không nộp đơn được** — khác hẳn CV tải lên (vẫn nộp được, chỉ bị giữ)', page: 'cv-review' },
      { what: 'Từ chối riêng **một đơn** ở khâu sàng lọc', why: 'Phán xét về đơn, không phải về CV', page: 'applicants' },
      { what: 'Khoá / xoá tài khoản ứng viên', why: 'Khoá **không** từ chối CV và **không** thu hồi đơn đã giao — hai quyết định riêng', page: 'jobseeker-users' },
      { what: 'Chặng tuyển dụng phía công ty', why: 'Mỗi tin một bảng riêng; **Hired/Rejected là điểm cuối**, không mở lại', page: 'applicants' },
    ],
  },
  {
    group: 'Khách hàng & tiếp nhận',
    items: [
      { what: '**Sign-up** từ site nhà tuyển dụng', why: 'Hàng đợi duyệt công ty mới', page: 'sign-ups' },
      { what: '**Claim** một công ty đã có sẵn', why: 'Có bước duyệt riêng', page: 'company-claims' },
      { what: '**Hồ sơ pháp lý** công ty', why: 'Giấy tờ đính kèm phục vụ xuất hoá đơn', page: 'company-documents' },
      { what: '**Hạng thành viên**', why: 'Ngưỡng tự động theo doanh số', page: 'membership-tiers' },
      { what: '**Pipeline** bán hàng', why: 'Bức tranh cơ hội đang chạy', page: 'pipeline' },
    ],
  },
  {
    group: 'Nội dung site',
    items: [
      { what: 'Menu đầu trang / chân trang', why: 'Trỏ được vào collection và zone đã publish', page: 'site-navigation' },
      { what: 'Thông báo site · FAQ · trang tĩnh · blog', why: 'Nội dung biên tập thuần', page: 'site-notices' },
      { what: '**Thư viện ảnh**', why: 'Nguồn ảnh dùng lại cho thẻ tin và banner', page: 'image-gallery' },
    ],
  },
  {
    group: 'Vận hành & hệ thống',
    items: [
      { what: 'Thông báo: quy tắc · gửi tay · lịch sử · mẫu · Zalo ZNS', why: 'Bốn trang một bộ', page: 'notification-rules' },
      { what: 'Tổng đài: nhật ký · xếp hạng · tình trạng đồng bộ', why: '**Extension trên tài khoản** là thứ nối cuộc gọi về đúng người', page: 'call-logs' },
      { what: '**Master data**', why: 'Nguồn của mọi dropdown — sửa một giá trị là đổi mọi màn hình dùng nó', page: 'master-data' },
      { what: '**Audit log**', why: 'Ai làm gì, lúc nào — câu trả lời cho mọi câu hỏi trách nhiệm', page: 'audit-log' },
      { what: 'Lịch sử export · log phân tích', why: 'Mang dữ liệu ra ngoài là hành vi được ghi lại', page: 'export-history' },
      { what: '**Dashboard** sales / marketing / sản phẩm', why: 'Mở đầu buổi demo được, nhưng số liệu phụ thuộc dữ liệu dev', page: 'dashboard-sales' },
    ],
  },
]

const PREFLIGHT = [
  ['Một công ty **ACTIVE**, có MST, dùng xuyên suốt buổi demo', 'Công ty không ACTIVE thì tin không lên OPEN được'],
  ['Một **CV đang chờ duyệt** trong hàng đợi CV review', 'Bộ quét trên dev cho qua mọi CV — hàng đợi sẽ rỗng nếu không chuẩn bị'],
  ['Hai **collection đã Active** và một **zone đã Published**', 'Preview không chạy trên bản nháp'],
  ['File **creative đúng kích thước** của vùng banner định demo', 'Sai tỉ lệ bị từ chối ngay tại chỗ'],
  ['Một **folder đã chọn sẵn** ở tab kho ứng viên phía công ty', 'Tab này từng báo lỗi cho tới khi bấm một folder'],
  ['Số slot / credit **ghi lại trước khi bắt đầu**', 'Không có mốc trước thì không chứng minh được thay đổi'],
  ['Đăng nhập sẵn **cả ba site** ở ba tab riêng', 'Chuyển mặt giữa chừng mà phải đăng nhập là mất nhịp'],
]

const RISKS: [string, string, string][] = [
  ['Ba trang danh sách CRM (Quotations · Purchase orders · Invoices)', 'Từng sập toàn trang vì vài bản ghi seed hỏng (option không có dòng nào)', 'Đi vào bằng **Company → Create quotation**, hoặc link chéo từ trang chi tiết. Kiểm lại trên dev sáng mai.'],
  ['Tab **All** và **Closed** của danh sách tin', 'Từng trả lỗi vì job seed thiếu ngày publish; số đếm hiện 0', 'Bấm thẳng một tab trạng thái, ví dụ **Open**.'],
  ['Tab **Đã duyệt / Đã từ chối** ở CV review', 'Từng báo “Something went wrong” trên dev', 'Chỉ demo trên tab **Cần duyệt**.'],
  ['Hàng đợi CV review **rỗng**', 'Bộ quét trên dev cho qua mọi CV', '**Phải chuẩn bị trước** — đây là rủi ro số một của buổi demo.'],
  ['Ngành **Y tế** không có job role nào', 'Nhóm vai trò bị nhập nhầm thành nhóm lọc', 'Đừng chọn công ty ngành y tế để demo đăng tin.'],
  ['Banner tiếng Hàn trên trang nhà tuyển dụng', 'Ảnh marketing bản KR chưa thay', 'Biết trước để chủ động nói, đừng để khách hỏi trước.'],
]

/* ── render ─────────────────────────────────────────────────────────────────── */

function Pill({ s }: { s: string }) {
  return (
    <span className="rounded border border-line bg-surface px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-wider text-brand">
      {s}
    </span>
  )
}

export function DemoPlan({ onPick }: { onPick: (key: string) => void }) {
  const total = MAIN.reduce((a, f) => a + f.minutes, 0)
  return (
    <div className="space-y-10">
      <header>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-brand">Demo · soát lần cuối</p>
        <h1 className="mt-1 text-[26px] font-bold leading-tight tracking-tight">Danh sách flow</h1>
        <p className="mt-2 max-w-[74ch] text-[13.5px] leading-[1.75] text-ink/75">
          <strong>{MAIN.length} flow chính</strong> (khoảng {total} phút nếu chạy liền) và{' '}
          <strong>{SUB.reduce((a, g) => a + g.items.length, 0)} flow phụ</strong>. Thứ tự các flow chính{' '}
          <strong>chính là thứ tự nên demo</strong> — chúng nối nhau thành một câu chuyện: bán → giao → dùng →
          kết quả trên site. Tester chạy từ trên xuống; người demo bám vào cột <em>Câu chốt</em>.
        </p>
      </header>

      <section className="rounded-lg border border-amber-500/50 bg-amber-50/50 p-5">
        <h2 className="text-[15px] font-bold tracking-tight">Chuẩn bị trước khi mở máy</h2>
        <p className="mt-1 text-[12.5px] text-ink/70">Bảy thứ phải có sẵn. Thiếu một là flow tương ứng không chạy được trước mặt khách.</p>
        <ul className="mt-3 space-y-2">
          {PREFLIGHT.map(([a, b], i) => (
            <li key={i} className="flex gap-3 text-[13px] leading-[1.6]">
              <span className="mt-[3px] font-mono text-[10px] text-amber-700">{String(i + 1).padStart(2, '0')}</span>
              <span className="text-ink/85">
                {md(a)} <span className="text-muted">— {b}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-[19px] font-bold tracking-tight">Flow chính</h2>
        <div className="mt-4 space-y-7">
          {MAIN.map((f) => (
            <article key={f.id} className="rounded-lg border border-line bg-surface p-5">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="font-mono text-[12px] font-bold text-brand">{f.id}</span>
                <h3 className="text-[15.5px] font-bold leading-tight tracking-tight">{f.title}</h3>
                <span className="ml-auto flex items-center gap-1.5">
                  {f.surfaces.map((s) => <Pill key={s} s={s} />)}
                  <span className="font-mono text-[10px] text-faint">~{f.minutes}′</span>
                </span>
              </div>
              <p className="mt-2 max-w-[74ch] text-[12.5px] leading-[1.65] text-muted">{f.goal}</p>

              <ol className="mt-4 space-y-2.5">
                {f.steps.map((s, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="mt-[2px] font-mono text-[10px] text-faint">{String(i + 1).padStart(2, '0')}</span>
                    <div className="min-w-0 text-[13px] leading-[1.6]">
                      <p className="text-ink/90">{md(s.do)}</p>
                      <p className="text-ink/65">
                        <span className="mr-1.5 font-mono text-[9.5px] uppercase tracking-wider text-faint">thấy</span>
                        {md(s.see)}
                        {s.page && (
                          <>
                            {' '}
                            <a
                              href={PAGE(s.page)}
                              onClick={(e) => { if (!e.metaKey && !e.ctrlKey && e.button === 0) { e.preventDefault(); onPick(s.page!) } }}
                              className="text-brand hover:underline"
                            >
                              chi tiết ↗
                            </a>
                          </>
                        )}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>

              <p className="mt-4 max-w-[74ch] border-l-2 border-brand/60 bg-brand-soft/40 py-2 pl-3 pr-3 text-[12.5px] leading-[1.65] text-ink/85">
                <span className="mr-1.5 font-mono text-[9.5px] uppercase tracking-wider text-brand">câu chốt</span>
                {md(f.punch)}
              </p>
              {f.fragile && (
                <p className="mt-2 max-w-[74ch] border-l-2 border-amber-500/70 py-1.5 pl-3 text-[12.5px] leading-[1.65] text-ink/80">
                  <span className="mr-1.5 font-mono text-[9.5px] uppercase tracking-wider text-amber-700">dễ vỡ</span>
                  {md(f.fragile)}
                </p>
              )}
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-[19px] font-bold tracking-tight">Flow phụ</h2>
        <p className="mt-1 max-w-[74ch] text-[13px] leading-[1.7] text-ink/75">
          Các nhánh và màn hình hỗ trợ. Tester soát hết; người demo chỉ mở khi khách hỏi tới — mỗi dòng là một
          câu trả lời có sẵn.
        </p>
        <div className="mt-4 space-y-6">
          {SUB.map((g) => (
            <div key={g.group}>
              <h3 className="text-[13.5px] font-bold">{g.group}</h3>
              <table className="mt-2 w-full border-collapse text-left">
                <tbody>
                  {g.items.map((it, i) => (
                    <tr key={i} className="border-b border-line-soft last:border-0">
                      <td className="w-[40%] py-2 pr-5 align-top text-[12.5px] font-medium leading-[1.55] text-ink">{md(it.what)}</td>
                      <td className="py-2 pr-5 align-top text-[12.5px] leading-[1.55] text-ink/70">{md(it.why)}</td>
                      <td className="w-[80px] py-2 align-top text-right">
                        {it.page && (
                          <a
                            href={PAGE(it.page)}
                            onClick={(e) => { if (!e.metaKey && !e.ctrlKey && e.button === 0) { e.preventDefault(); onPick(it.page!) } }}
                            className="font-mono text-[10.5px] text-brand hover:underline"
                          >
                            mở ↗
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-[19px] font-bold tracking-tight">Rủi ro đã biết</h2>
        <p className="mt-1 max-w-[74ch] text-[13px] leading-[1.7] text-ink/75">
          Ghi nhận từ tài liệu QA và nhật ký build của bản <strong>11/09/2026</strong> — gần một tháng trước.
          <strong> Phải kiểm lại từng dòng trên dev trước buổi demo</strong>: có thứ đã sửa, có thứ chưa.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-left text-[12.5px]">
            <thead>
              <tr className="border-b border-ink/15">
                <th className="py-2 pr-5 font-mono text-[9.5px] font-semibold uppercase tracking-wider text-faint">Chỗ nào</th>
                <th className="py-2 pr-5 font-mono text-[9.5px] font-semibold uppercase tracking-wider text-faint">Triệu chứng</th>
                <th className="py-2 font-mono text-[9.5px] font-semibold uppercase tracking-wider text-faint">Đi vòng</th>
              </tr>
            </thead>
            <tbody>
              {RISKS.map(([a, b, c], i) => (
                <tr key={i} className="border-b border-line-soft last:border-0">
                  <td className="py-2.5 pr-5 align-top font-medium leading-[1.55] text-ink">{md(a)}</td>
                  <td className="py-2.5 pr-5 align-top leading-[1.55] text-ink/70">{md(b)}</td>
                  <td className="py-2.5 align-top leading-[1.55] text-ink/80">{md(c)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
