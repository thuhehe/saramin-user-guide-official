import { useEffect, useState } from 'react'
import { md } from './md'

/**
 * Danh sách flow — the page a client opens to get hold of their whole system.
 *
 * Written for the CLIENT, not for whoever demos it: what runs end to end, in
 * which order, on which of the three sites, and what "working" looks like at
 * each step. That last column is the test — a client who can tick every row
 * of a flow has checked that flow, without a separate test plan to cross-read.
 *
 * MAIN flows are grouped by the chain they belong to and ordered the way the
 * chain runs (a job cannot be posted before an invoice grants the slot), so the
 * page also answers "what do I need before I can test this". SUB-flows sit under
 * the main flow they vary, not in a list of their own: a variant read away from
 * its main flow is a rule with no context.
 *
 * Every step is checked against saramin-vn-admin origin/dev (447f2365, 07/10/2026)
 * and its shipped strings; a button named here is the label on screen.
 */

type Surface = 'A' | 'C' | 'J'
type Step = { at: Surface; do: string; ok: string; page?: string }
type Sub = { what: string; ok: string; page?: string }
type Flow = {
  id: string
  chain: 'sell' | 'people' | 'base'
  title: string
  short: string
  who: string
  goal: string
  needs: string[]
  steps: Step[]
  key: string
  subs: Sub[]
  logic?: { label: string; href: string }
}

const SURFACE: Record<Surface, { name: string; dot: string }> = {
  A: { name: 'Admin', dot: 'bg-brand' },
  C: { name: 'Company site', dot: 'bg-amber-600' },
  J: { name: 'Jobseeker site', dot: 'bg-sky-600' },
}

const CHAINS = [
  { id: 'sell', title: 'Chuỗi bán hàng', lead: 'Tiền đi từ báo giá tới quyền lợi của khách, rồi tới chỗ hiển thị trên site.' },
  { id: 'people', title: 'Chuỗi ứng viên', lead: 'Người đi từ CV tới bảng ứng viên của nhà tuyển dụng — và chiều ngược lại, nhà tuyển dụng tự đi tìm người.' },
  { id: 'base', title: 'Vận hành nền', lead: 'Không nằm trên một chuỗi nào, nhưng mọi chuỗi đều cần: trang nội dung và quyền của nhân viên.' },
] as const

const FLOWS: Flow[] = [
  /* ── Chuỗi bán hàng ───────────────────────────────────────────────────────── */
  {
    id: 'S1',
    chain: 'sell',
    title: 'Khai báo sản phẩm sẽ bán',
    short: 'Khai báo sản phẩm',
    who: 'Product / Sales ops',
    goal: 'Có sẵn trong catalogue thứ sales sẽ báo giá — và định nghĩa luôn khách nhận gì khi hoá đơn được phát hành. Làm một lần, trước mọi lần bán.',
    needs: ['Quyền sửa Products'],
    steps: [
      { at: 'A', do: 'Mở **Placements**, xem các vùng hiển thị đang có', ok: 'Mỗi vùng có kích thước, số thẻ hoặc số slide, vòng xoay. Vùng **không tạo mới** được ở đây', page: 'placements' },
      { at: 'A', do: '**Products → New product** → chọn **Type** *Job posting*', ok: 'Khối *Fulfilment · Job posting* hiện ra bên dưới', page: 'products' },
      { at: 'A', do: 'Điền Name, Selling unit, **Placement slots**, *Display duration*, *Auto-refresh*, giá', ok: '*Product code* tự sinh từ Type + Name, không sửa được', page: 'products' },
      { at: 'A', do: 'Chọn **Ladder position** → kéo product tới chỗ của nó → lưu', ok: 'Product **Active**; có mặt trên *Posting ladder*', page: 'product-ladder' },
      { at: 'A', do: 'Mở một báo giá bất kỳ, tìm product vừa tạo trong picker', ok: 'Product **có** trong danh sách chọn', page: 'quotations' },
    ],
    key: '**Type quyết định hoá đơn giao cái gì.** Với Job posting, product **chính là** một bậc tin — bậc đó hiện ở vùng nào là do *Placement slots* trên product, không phải do màn Placements.',
    subs: [
      { what: 'Tạo product **CV search**', ok: 'Có ô *Credit amount*, *Validity* 30 / 90 ngày, *Activation window*; dòng giá mỗi CV tự tính', page: 'products' },
      { what: 'Để trống một ô fulfilment bắt buộc rồi lưu Active', ok: '**Bị từ chối**, báo đúng ô còn thiếu', page: 'products' },
      { what: 'Sửa giá một product **đã lên hoá đơn**', ok: 'Bị khoá, có băng *“This product has already been invoiced”*', page: 'products' },
      { what: 'Dựng **package** từ 2+ product', ok: 'Một dòng, một giá; *Sum of parts* để đối chiếu', page: 'packages' },
      { what: 'Đánh dấu **Trial product**', ok: 'Chỉ hiện trong báo giá chọn *Trial package*', page: 'products' },
    ],
    logic: { label: 'Logic chung — Product settings', href: '/logic/product-settings' },
  },
  {
    id: 'S2',
    chain: 'sell',
    title: 'Khách hàng vào hệ thống — hai cửa',
    short: 'Khách hàng vào hệ thống',
    who: 'Sales · nhà tuyển dụng tự đăng ký',
    goal: 'Có một công ty **có sales phụ trách** và **đủ hồ sơ xuất hoá đơn** — điều kiện để bán được bất cứ thứ gì.',
    needs: [],
    steps: [
      { at: 'A', do: '**Cửa của sales:** CRM → Companies → **Free data** → xin nhận một công ty', ok: 'Yêu cầu nằm ở *Claim requests*, chờ duyệt', page: 'companies' },
      { at: 'A', do: 'Người duyệt chấp thuận yêu cầu', ok: 'Công ty có **sales owner**, chuyển sang Customers', page: 'company-claims' },
      { at: 'C', do: '**Cửa của khách:** nhà tuyển dụng tự đăng ký trên Company site', ok: 'Một dòng mới ở **Sign-ups**, trạng thái *New*, có cột khớp MST', page: 'sign-ups' },
      { at: 'A', do: 'Sign-ups → **Move to existing company** (hoặc **Create company & activate**)', ok: 'Dòng sang *Resolved*; người đó nhận email đăng nhập bằng mật khẩu đã chọn lúc đăng ký', page: 'sign-ups' },
      { at: 'A', do: 'Mở hồ sơ công ty, kiểm **MST** và thông tin xuất hoá đơn', ok: 'MST ghi *“Verified against the national business register.”*', page: 'companies' },
    ],
    key: '**Công ty ở Free data không có ai phụ trách, nên chưa bán được** — và cũng không nhận được người đăng ký vào. Phải nhận về (claim) trước.',
    subs: [
      { what: 'Sign-up có MST **chưa khớp công ty nào**', ok: 'Bị chặn: *“This tax code reaches no company yet”* — tạo công ty trước', page: 'sign-ups' },
      { what: 'Sign-up khớp một công ty **còn ở Free data**', ok: 'Bị chặn — phải đưa công ty sang Customers trước', page: 'sign-ups' },
      { what: 'Upload danh sách công ty từ file', ok: 'Vào Free data, không có owner; MST đã có thì **bỏ qua, không ghi đè**', page: 'companies' },
      { what: '**Archive** một sign-up rác', ok: 'Dòng sang *Archived*, không tạo gì', page: 'sign-ups' },
      { what: 'Giấy ĐKKD công ty', ok: 'Xem ở thẻ *Company documents* trên hồ sơ; quyết định duy nhất là **Verify company** — không còn hàng đợi duyệt riêng', page: 'companies' },
    ],
    logic: { label: 'Logic chung — CRM', href: '/logic/crm' },
  },
  {
    id: 'S3',
    chain: 'sell',
    title: 'Bán một gói — từ báo giá tới lúc khách có quota',
    short: 'Bán gói',
    who: 'Sales → Kế toán',
    goal: 'Chứng minh chuỗi tiền chạy thật: báo giá → PO → hoá đơn → quyền lợi vào tài khoản khách.',
    needs: ['S1 — có product Active', 'S2 — có công ty có sales owner'],
    steps: [
      { at: 'A', do: 'Mở hồ sơ công ty → tab **Products & billing** — ghi lại số dư hiện có', ok: 'Có mốc để so sánh sau khi bán', page: 'companies' },
      { at: 'A', do: '**Create quotation** ngay trong hồ sơ công ty → 1–3 option, chọn *Discount programme*', ok: 'Công ty được chọn sẵn. Option là **phương án thay thế nhau**, khách chọn một', page: 'quotations' },
      { at: 'A', do: 'Đánh dấu option khách chấp nhận → **Issue PO**', ok: 'PO *Active*. **Khách vẫn CHƯA có gì** — PO chỉ đóng băng sẽ cấp những gì', page: 'purchase-order' },
      { at: 'A', do: 'Trên PO → **Request official invoice**', ok: 'Hoá đơn ở *Invoice requested*, chờ kế toán', page: 'purchase-order' },
      { at: 'A', do: 'Kế toán mở hoá đơn → **Issue**', ok: 'Hoá đơn *Issued*, có số hoá đơn hợp pháp', page: 'invoice' },
      { at: 'A', do: 'Quay lại **Products & billing**, hoặc *Service delivery → Quota usage*', ok: 'Quota **đã vào** ngay — kèm *Valid until*', page: 'quota-usage' },
    ],
    key: '**Chỉ hoá đơn Issued mới cấp quota** — cùng một giao dịch, không độ trễ. PO đã tạo, tiền đã về mà hoá đơn chưa Issued thì khách vẫn chưa có gì. Ngược lại, hoá đơn Issued là cấp, kể cả khi khách chưa trả tiền.',
    subs: [
      { what: 'Giảm giá vượt ngưỡng của chương trình', ok: 'Chờ duyệt: dưới ngưỡng *Sales lead*, từ ngưỡng trở lên *Sales manager*', page: 'quotations' },
      { what: 'Báo giá **Trial package**', ok: 'Chỉ chào product trial, không package; giảm giá khoá ở 0', page: 'discount-programmes' },
      { what: 'Bán một **package**', ok: 'Báo giá **1 dòng**; sau hoá đơn, Quota usage hiện **từng thành phần**', page: 'packages' },
      { what: 'PO không xuất hoá đơn trong tháng', ok: 'Tự hết hạn **cuối tháng** — không có nút huỷ', page: 'purchase-order' },
      { what: 'Gói **CV search** sau khi cấp', ok: 'Chưa chạy cho tới khi kích hoạt; HQ bấm hộ được bằng *Activate for the customer*', page: 'quota-usage' },
      { what: '**Manual service** sau khi cấp', ok: 'Có ở *Manual services*; ops **Record delivery** từng lần, số còn lại tự trừ', page: 'manual-services' },
      { what: 'Theo dõi cơ hội bán', ok: 'Deal hiện trên *Pipeline*', page: 'pipeline' },
    ],
    logic: { label: 'Logic chung — CRM', href: '/logic/crm' },
  },
  {
    id: 'S4',
    chain: 'sell',
    title: 'Tiêu quota để đăng tin — và thấy tin lên đúng chỗ trên site',
    short: 'Đăng tin',
    who: 'HQ đăng hộ · hoặc nhà tuyển dụng tự đăng',
    goal: 'Chứng minh phần đã bán tự biến thành vị trí hiển thị — không ai gán tay tin nào vào vùng nào.',
    needs: ['S3 — hoá đơn Issued có product Job posting'],
    steps: [
      { at: 'A', do: '**Jobs → New job** → chọn công ty vừa bán', ok: 'Mục *Posting setup*', page: 'jobs' },
      { at: 'A', do: 'Chọn **Invoice** vừa phát hành', ok: '*Product* chỉ còn **các bậc của hoá đơn đó còn lượt**', page: 'jobs' },
      { at: 'A', do: 'Chọn bậc, điền nội dung → **Post now**', ok: 'Tin *Open*; quota **giảm đúng 1 lượt của bậc đó**', page: 'jobs' },
      { at: 'J', do: 'Mở site jobseeker, tới các vùng của bậc đó', ok: 'Tin xuất hiện **đúng** các vùng trong *Placement slots* của bậc', page: 'placements' },
      { at: 'A', do: 'Tắt **Exposure** → tải lại trang công khai', ok: 'Tin biến mất dù vẫn *Open*', page: 'jobs' },
    ],
    key: 'Tin lên đúng những vùng mà **bậc tin** đó mua quyền xuất hiện — khai một lần trên product, không khai lại cho từng tin. Trong danh sách *Gợi ý*, bậc cao hơn trên *Posting ladder* đứng trước.',
    subs: [
      { what: 'Để trống hoá đơn — chọn *none (Free job)*', ok: 'Chỉ còn product **Free**; **không trừ quota** của ai', page: 'jobs' },
      { what: 'Thêm **Add-on — Label** (*Hot job*, *Super star*)', ok: 'Khoá cho tới khi đã chọn hoá đơn và Main product', page: 'jobs' },
      { what: 'Nhà tuyển dụng tự đăng trên Company site', ok: 'Chỉ chọn được gói **còn lượt**; Publish trừ 1', page: 'jobs' },
      { what: 'Công ty duyệt tin bằng tay', ok: 'Tin công ty đăng vào *In review*; HQ **Approve / Reject**', page: 'jobs' },
      { what: 'Hẹn giờ đăng', ok: 'Tin ở *Schedule*, tự lên *Open* đúng giờ', page: 'jobs' },
      { what: 'Công ty chưa có MST hoặc đã archived', ok: 'Không lên Open được — chỉ lưu nháp', page: 'jobs' },
      { what: 'Kéo lại **Posting ladder**', ok: 'Thứ tự *Gợi ý* trên trang tìm việc đổi theo', page: 'product-ladder' },
      { what: 'Bậc nằm trong **Premium package**', ok: 'Tin lên khu Premium của trang tìm kiếm — kể cả tin mua lẻ', page: 'packages' },
    ],
    logic: { label: 'Logic chung — Job management', href: '/logic/job-management' },
  },
  {
    id: 'S5',
    chain: 'sell',
    title: 'Bán và chạy banner (Boosting)',
    short: 'Banner',
    who: 'Sales / Marketing ops',
    goal: 'Nhánh bán song song, không liên quan tin tuyển dụng: một khung ngày trên một vùng hiển thị.',
    needs: ['S3 — hoá đơn có product Placement booking (hoặc dùng product free)'],
    steps: [
      { at: 'A', do: '**Placements** → mở một vùng *Display*', ok: 'Kích thước creative, **Number of slides**, vòng xoay', page: 'placements' },
      { at: 'A', do: '**Content → Boosting → New ad** → chọn công ty → chọn dòng PO', ok: 'Dòng ghi *“x of y bookings left”*', page: 'boosting' },
      { at: 'A', do: 'Tải creative, chọn ngày → xuất bản', ok: 'Sai tỉ lệ thì **bị từ chối, không tự cắt**', page: 'boosting' },
      { at: 'A', do: 'Đặt thêm booking cho cùng vùng, cùng ngày, tới khi đầy', ok: 'Booking vượt *Number of slides* **bị từ chối vì đầy**', page: 'boosting' },
      { at: 'J', do: 'Mở trang công khai có vùng đó', ok: 'Banner chạy; nhiều banner thì thay phiên theo *Rotation period*', page: 'placements' },
    ],
    key: 'Sức chứa là **cam kết bán được**: hệ thống không cho bán chồng quá số slide đã khai, nên không bao giờ hứa cho hai khách cùng một chỗ.',
    subs: [
      { what: 'Chọn *— No order (free) —*', ok: 'HQ cấp một product placement **free** cho công ty, không cần PO', page: 'boosting' },
      { what: 'Popup thay vì banner', ok: 'Vùng popup nhận mọi kích thước', page: 'boosting' },
      { what: 'Ảnh cho thẻ tin / banner', ok: 'Chọn từ *Image gallery*', page: 'image-gallery' },
    ],
  },

  /* ── Chuỗi ứng viên ───────────────────────────────────────────────────────── */
  {
    id: 'P1',
    chain: 'people',
    title: 'Ứng viên nộp đơn — CV qua vòng duyệt — đơn tới nhà tuyển dụng',
    short: 'Ứng tuyển & duyệt CV',
    who: 'Ứng viên → HQ duyệt CV → nhà tuyển dụng',
    goal: 'Chứng minh chuỗi người, và cho thấy việc duyệt CV quyết định cả loạt đơn cùng lúc.',
    needs: ['S4 — có tin đang Open', 'Một tài khoản ứng viên'],
    steps: [
      { at: 'J', do: 'Ứng viên tải lên một CV **thiếu dữ kiện** (khai *Experienced* nhưng không có kinh nghiệm nào)', ok: 'Máy quét ghi **Chưa đủ thông tin** ngay khi lưu', page: 'cv-review' },
      { at: 'J', do: 'Ứng viên vẫn **nộp đơn vào 2–3 tin**', ok: 'Nộp **thành công**, ứng viên thấy “Đã nộp” như bình thường', page: 'applicants' },
      { at: 'A', do: 'Admin mở **Applications**', ok: 'Các đơn nằm ở **Chưa gửi** — nhà tuyển dụng chưa thấy gì', page: 'applicants' },
      { at: 'A', do: '**CV review** → mở CV → **Approve**', ok: 'Mọi đơn đang chờ CV đó **được gửi cùng lúc**', page: 'cv-review' },
      { at: 'C', do: 'Nhà tuyển dụng mở bảng ứng viên', ok: 'Cả loạt đơn xuất hiện **cùng một lúc**', page: 'applicants' },
    ],
    key: 'Người duyệt **duyệt CV, không bao giờ duyệt từng đơn**. Vì vậy không có nút “Gửi” ở trang đơn — và một hàng đợi bị bỏ quên là sự cố mà **ứng viên** chịu.',
    subs: [
      { what: '**Từ chối** một CV đã từng gửi đi', ok: 'Đơn đang giữ → mất; đơn đã gửi bằng đúng version đó → **thu hồi**', page: 'cv-review' },
      { what: 'Ứng viên thay file → **v.2**', ok: 'Quét lại; version mới **không xoá** được lần từ chối cũ', page: 'cv-review' },
      { what: 'CV **Saramin** thiếu dữ kiện', ok: '**Không nộp đơn được** — khác CV tải lên (vẫn nộp được, chỉ bị giữ)', page: 'cv-review' },
      { what: 'Từ chối riêng **một đơn** ở khâu sàng lọc', ok: 'Phán xét về đơn, không đụng tới CV', page: 'applicants' },
      { what: 'Nhà tuyển dụng chuyển chặng tuyển dụng', ok: 'Mỗi tin một bảng; *Hired / Rejected* là điểm cuối', page: 'applicants' },
      { what: 'Khoá / xoá tài khoản ứng viên', ok: 'Khoá **không** từ chối CV, nhưng **rút** đơn đang xử lý (đơn đã xong ở lại)', page: 'jobseeker-users' },
    ],
    logic: { label: 'Logic chung — Job management', href: '/logic/job-management' },
  },
  {
    id: 'P2',
    chain: 'people',
    title: 'Nhà tuyển dụng tự đi tìm ứng viên và trả credit để mở khoá',
    short: 'Tìm & mở khoá CV',
    who: 'Nhà tuyển dụng',
    goal: 'Mặt hàng thứ hai: bán quyền tiếp cận ứng viên, không chỉ bán chỗ đăng tin.',
    needs: ['S3 — hoá đơn có product CV search, gói đã kích hoạt'],
    steps: [
      { at: 'C', do: 'Company site → **Tìm ứng viên**, lọc vài tiêu chí', ok: 'Tên bị che dạng `Long T***` — che cả nơi từng làm và trường học', page: 'talent-pool' },
      { at: 'C', do: '**Lưu** một ứng viên vào folder', ok: 'Thẻ vào cột *Saved*, **vẫn che, chưa mất credit**', page: 'talent-pool' },
      { at: 'C', do: 'Kéo thẻ **ra khỏi** cột Saved', ok: 'Hộp thoại xác nhận trừ credit → lộ tên, điện thoại, email', page: 'talent-pool' },
      { at: 'C', do: 'Lưu đúng người đó vào folder thứ hai rồi kéo ra', ok: '**Miễn phí** — một credit mua một người, vĩnh viễn, cho cả công ty', page: 'talent-pool' },
      { at: 'A', do: '*Service delivery → Quota usage* — đối chiếu', ok: '*Used / total* khớp với thao tác vừa rồi', page: 'quota-usage' },
    ],
    key: 'Tính tiền đúng **lúc lộ danh tính** — không phải lúc tìm hay lúc lưu. Nên nhà tuyển dụng duyệt thoải mái mà không sợ tốn.',
    subs: [
      { what: 'Gói hết hạn dùng', ok: 'Không mở thêm được; CV đã mở vẫn mở', page: 'talent-pool' },
      { what: 'HQ **Withdraw this package**', ok: 'Khách mất ngay credit chưa dùng; bắt buộc ghi lý do', page: 'quota-usage' },
    ],
  },

  /* ── Vận hành nền ─────────────────────────────────────────────────────────── */
  {
    id: 'B1',
    chain: 'base',
    title: 'Dựng một trang Premium cho khách lớn',
    short: 'Trang Premium',
    who: 'Content / Marketing',
    goal: 'Làm được trang thương hiệu riêng cho khách mà không cần lập trình.',
    needs: ['Có tin đang Open của khách đó'],
    steps: [
      { at: 'A', do: 'Tạo **Collection** kiểu *Saved search* (bộ lọc) và một kiểu *Hand-picked* (ghim tay)', ok: 'Ô **Preview** đếm sống số tin khớp', page: 'collections' },
      { at: 'A', do: 'Publish cả hai collection', ok: 'Một chiều: *Draft → Active → Archived*', page: 'collections' },
      { at: 'A', do: 'Tạo **Zone**: địa chỉ, tiêu đề, banner, thanh tìm kiếm, trỏ hai danh sách vào hai collection', ok: 'Panel **Page order** liệt kê các khối và giá trị hiện tại', page: 'zones' },
      { at: 'A', do: '**Publish** → Preview', ok: 'Trang công khai mang thương hiệu khách', page: 'zones' },
      { at: 'J', do: 'Mở địa chỉ của zone trên site', ok: 'Đúng tin, đúng thứ tự của hai collection', page: 'zones' },
    ],
    key: 'Zone **không chứa tin** — nó trỏ vào collection. Trang hiện sai công ty luôn là lỗi của collection; sửa một chỗ là mọi trang dùng nó đổi theo.',
    subs: [
      { what: 'Publish zone khi chưa có banner slide nào', ok: 'Bị chặn — cần ít nhất một slide đã lưu', page: 'zones' },
      { what: 'Preview một zone còn nháp', ok: 'Chưa có — Preview chỉ chạy khi zone đã Published', page: 'zones' },
      { what: 'Đưa zone lên menu', ok: '*Site navigation* trỏ được vào collection và zone đã publish', page: 'site-navigation' },
    ],
    logic: { label: 'Logic chung — Content', href: '/logic/content' },
  },
  {
    id: 'B2',
    chain: 'base',
    title: 'Phân quyền nhân sự nội bộ',
    short: 'Phân quyền',
    who: 'Admin hệ thống',
    goal: 'Trả lời câu hỏi khách luôn hỏi: ai thấy được dữ liệu của ai.',
    needs: [],
    steps: [
      { at: 'A', do: 'Tạo phòng ban và team bên trong', ok: 'Cây **hai tầng**, không có tầng ba', page: 'departments' },
      { at: 'A', do: 'Tạo vai trò, tick quyền theo từng trang', ok: '**Create không bao hàm Read**; **Export tách khỏi Read**', page: 'roles' },
      { at: 'A', do: 'Mời một người: phòng ban + vai trò + **phạm vi dữ liệu**', ok: 'Ba lựa chọn: tất cả / team của họ / chỉ của riêng họ', page: 'users' },
      { at: 'A', do: 'Đăng nhập bằng tài khoản đó', ok: 'Chỉ thấy các trang vai trò mở ra, và chỉ các bản ghi phạm vi cho phép', page: 'users' },
    ],
    key: 'Ba câu hỏi tách bạch: **ngồi ở đâu** (phòng ban) × **được làm gì** (vai trò) × **trên dữ liệu nào** (phạm vi). Làm leader **không** tự cấp thêm quyền nào.',
    subs: [
      { what: 'Tự sửa vai trò của chính mình', ok: 'Không được', page: 'users' },
      { what: 'Gửi lại lời mời liên tục', ok: 'Có thời gian chờ 60 giây giữa hai lần gửi', page: 'users' },
      { what: 'Ai làm gì, lúc nào', ok: 'Ghi ở *Audit log*', page: 'audit-log' },
    ],
    logic: { label: 'Logic chung — Organisation', href: '/logic/organisation' },
  },
]

/* Screens no flow above walks through — still part of the system, and still to
   be opened once during testing. Grouped by what they serve. */
const SUPPORT: { group: string; items: [string, string, string][] }[] = [
  {
    group: 'Nội dung site',
    items: [
      ['Menu đầu trang · chân trang', 'Trỏ được vào collection và zone đã publish', 'site-navigation'],
      ['Thông báo & sự kiện · FAQ', 'Nội dung biên tập thuần', 'site-notices'],
      ['Trang tĩnh · bảng tin · blog', 'Nội dung biên tập thuần', 'pages'],
    ],
  },
  {
    group: 'Thông báo tự động',
    items: [
      ['Automation rules', 'Khi nào hệ thống tự gửi', 'notification-rules'],
      ['Send manually · Delivery history', 'Gửi tay, và xem cái gì đã tới', 'notification-send'],
      ['Message templates · Zalo ZNS', 'Nội dung từng kênh', 'notification-templates'],
    ],
  },
  {
    group: 'Tổng đài',
    items: [
      ['Call logs', 'Cuộc gọi đồng bộ từ Callio, gắn vào công ty', 'call-logs'],
      ['Ranking', 'Xếp hạng nhân viên theo hoạt động gọi trong kỳ', 'call-ranking'],
    ],
  },
  {
    group: 'Hệ thống',
    items: [
      ['Master data', 'Nguồn của mọi dropdown — sửa một giá trị là đổi mọi màn hình dùng nó', 'master-data'],
      ['Membership tiers', 'Hạng thành viên của khách', 'membership-tiers'],
      ['Export history · Search & card logs', 'Mang dữ liệu ra ngoài là hành vi được ghi lại', 'export-history'],
      ['Dashboards', 'Sales · planning · marketing · product — số liệu phụ thuộc dữ liệu đang có', 'dashboard-sales'],
    ],
  },
]

const TEST_DATA: [string, string][] = [
  ['Một **công ty Customers** có sales owner, MST đã xác minh và đủ thông tin xuất hoá đơn', 'S3 trở đi'],
  ['Tài khoản **Sales** và tài khoản **kế toán** riêng — hoá đơn do kế toán phát hành', 'S3'],
  ['Một **tài khoản nhà tuyển dụng** của công ty đó trên Company site', 'S4, P1, P2'],
  ['Một **tài khoản ứng viên** và một file CV', 'P1'],
  ['File ảnh **đúng kích thước** của vùng banner định test', 'S5'],
  ['**Ghi lại số dư** của công ty trước khi bắt đầu', 'mọi flow có quota'],
]

/* ── progress ────────────────────────────────────────────────────────────────
   Ticks live in this browser only — a tester's own checklist, not shared state.
   Storage can be unavailable (private window), so every access is guarded and
   the page works the same without it. */
const STORE = 'flow-checks-v2'
function useChecks() {
  const [done, setDone] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem(STORE) ?? '[]')) } catch { return new Set() }
  })
  useEffect(() => {
    try { localStorage.setItem(STORE, JSON.stringify([...done])) } catch { /* not persisted */ }
  }, [done])
  const toggle = (k: string) => setDone((d) => { const n = new Set(d); n.has(k) ? n.delete(k) : n.add(k); return n })
  return { done, toggle, reset: () => setDone(new Set()) }
}
const keysOf = (f: Flow) => [...f.steps.map((_, i) => `${f.id}:s${i}`), ...f.subs.map((_, i) => `${f.id}:x${i}`)]

/* ── render ─────────────────────────────────────────────────────────────────── */

function Dot({ s }: { s: Surface }) {
  return <span title={SURFACE[s].name} className={`inline-block h-2 w-2 shrink-0 rounded-full ${SURFACE[s].dot}`} />
}

function SurfaceTag({ s }: { s: Surface }) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-[10.5px] text-muted">
      <Dot s={s} />{SURFACE[s].name}
    </span>
  )
}

function Tick({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      title={on ? 'Bỏ đánh dấu' : 'Đánh dấu đã kiểm'}
      className={`flex h-[18px] w-[18px] items-center justify-center rounded border text-[11px] leading-none transition-colors ${
        on ? 'border-brand bg-brand text-white' : 'border-line bg-surface text-transparent hover:border-brand'
      }`}
    >
      ✓
    </button>
  )
}

function PageLink({ k, onPick, children }: { k?: string; onPick: (key: string) => void; children: React.ReactNode }) {
  if (!k) return null
  return (
    <a
      href={`/trang/${k}`}
      onClick={(e) => { if (!e.metaKey && !e.ctrlKey && e.button === 0) { e.preventDefault(); onPick(k) } }}
      className="whitespace-nowrap font-mono text-[10.5px] text-brand hover:underline"
    >
      {children}
    </a>
  )
}

const jump = (id: string) => document.getElementById(`flow-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

/** The map: one row per chain, each flow a chip, arrows only where order matters. */
function FlowMap({ done }: { done: Set<string> }) {
  return (
    <div className="space-y-3">
      {CHAINS.map((c) => {
        const flows = FLOWS.filter((f) => f.chain === c.id)
        return (
          <div key={c.id} className="rounded-lg border border-line bg-surface p-4">
            <div className="flex flex-wrap items-baseline gap-x-3">
              <h3 className="text-[13.5px] font-bold">{c.title}</h3>
              <p className="text-[12px] text-muted">{c.lead}</p>
            </div>
            <div className="mt-3 flex flex-wrap items-stretch gap-y-2">
              {flows.map((f, i) => {
                const ks = keysOf(f)
                const n = ks.filter((k) => done.has(k)).length
                const surfaces = [...new Set(f.steps.map((s) => s.at))]
                return (
                  <div key={f.id} className="flex items-stretch">
                    {i > 0 && (
                      <span className="flex items-center px-1.5 text-[14px] text-faint" aria-hidden>
                        {c.id === 'base' ? '·' : '→'}
                      </span>
                    )}
                    <button
                      onClick={() => jump(f.id)}
                      className="min-w-[132px] rounded-md border border-line bg-canvas px-3 py-2 text-left transition-colors hover:border-brand hover:bg-brand-soft/40"
                    >
                      <span className="flex items-center gap-1.5">
                        <span className="font-mono text-[10.5px] font-bold text-brand">{f.id}</span>
                        <span className="ml-auto flex gap-1">{surfaces.map((s) => <Dot key={s} s={s} />)}</span>
                      </span>
                      <span className="mt-0.5 block text-[12.5px] font-semibold leading-snug">{f.short}</span>
                      <span className="mt-1 block font-mono text-[10px] text-faint">
                        {n === ks.length ? '✓ đã kiểm hết' : `${n}/${ks.length} đã kiểm`}
                      </span>
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
      <p className="flex flex-wrap gap-x-5 gap-y-1 pt-1">
        {(Object.keys(SURFACE) as Surface[]).map((s) => <SurfaceTag key={s} s={s} />)}
        <span className="text-[10.5px] text-faint">— chấm màu cho biết flow chạy qua site nào</span>
      </p>
    </div>
  )
}

function FlowCard({ f, done, toggle, onPick }: { f: Flow; done: Set<string>; toggle: (k: string) => void; onPick: (key: string) => void }) {
  const ks = keysOf(f)
  const n = ks.filter((k) => done.has(k)).length
  return (
    <article id={`flow-${f.id}`} className="scroll-mt-6 rounded-lg border border-line bg-surface">
      <header className="border-b border-line-soft p-5 pb-4">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="font-mono text-[12px] font-bold text-brand">{f.id}</span>
          <h3 className="text-[16px] font-bold leading-tight tracking-tight">{f.title}</h3>
          <span className="ml-auto font-mono text-[10.5px] text-faint">{n}/{ks.length} đã kiểm</span>
        </div>
        <p className="mt-2 max-w-[76ch] text-[13px] leading-[1.65] text-ink/80">{md(f.goal)}</p>
        <dl className="mt-3 grid gap-x-6 gap-y-1.5 text-[12px] sm:grid-cols-[auto_1fr]">
          <dt className="font-mono text-[9.5px] uppercase tracking-wider text-faint sm:pt-[3px]">Ai làm</dt>
          <dd className="text-ink/80">{f.who}</dd>
          <dt className="font-mono text-[9.5px] uppercase tracking-wider text-faint sm:pt-[3px]">Cần có trước</dt>
          <dd className="flex flex-wrap gap-x-3 gap-y-1 text-ink/80">
            {f.needs.length ? f.needs.map((x) => {
              const ref = x.match(/^([SPB]\d)\b/)?.[1]
              return ref
                ? <button key={x} onClick={() => jump(ref)} className="text-left text-brand hover:underline">{x}</button>
                : <span key={x}>{x}</span>
            }) : <span className="text-muted">Không — bắt đầu được ngay</span>}
          </dd>
        </dl>
      </header>

      {/* Steps: the "Kết quả đúng" column IS the test. */}
      <div className="overflow-x-auto px-5 pt-3">
        <table className="w-full min-w-[640px] border-collapse text-left">
          <thead>
            <tr>
              <th className="w-[26px] py-1.5" />
              <th className="w-[118px] py-1.5 pr-4 font-mono text-[9.5px] font-semibold uppercase tracking-wider text-faint">Ở đâu</th>
              <th className="py-1.5 pr-4 font-mono text-[9.5px] font-semibold uppercase tracking-wider text-faint">Làm</th>
              <th className="py-1.5 pr-4 font-mono text-[9.5px] font-semibold uppercase tracking-wider text-faint">Kết quả đúng</th>
              <th className="w-[28px] py-1.5" />
            </tr>
          </thead>
          <tbody>
            {f.steps.map((s, i) => {
              const k = `${f.id}:s${i}`
              return (
                <tr key={i} className={`border-t border-line-soft align-top ${done.has(k) ? 'opacity-55' : ''}`}>
                  <td className="py-2.5 font-mono text-[10.5px] text-faint">{String(i + 1).padStart(2, '0')}</td>
                  <td className="py-2.5 pr-4"><SurfaceTag s={s.at} /></td>
                  <td className="py-2.5 pr-4 text-[12.5px] leading-[1.55] text-ink/90">{md(s.do)}</td>
                  <td className="py-2.5 pr-4 text-[12.5px] leading-[1.55] text-ink/70">
                    {md(s.ok)} <PageLink k={s.page} onPick={onPick}>↗</PageLink>
                  </td>
                  <td className="py-2"><Tick on={done.has(k)} onClick={() => toggle(k)} /></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="px-5 pt-3">
        <p className="max-w-[78ch] border-l-2 border-brand/60 bg-brand-soft/40 py-2 pl-3 pr-3 text-[12.5px] leading-[1.65] text-ink/85">
          <span className="mr-1.5 font-mono text-[9.5px] uppercase tracking-wider text-brand">điểm mấu chốt</span>
          {md(f.key)}
        </p>
      </div>

      {f.subs.length > 0 && (
        <div className="overflow-x-auto px-5 pt-4">
          <h4 className="text-[12.5px] font-bold">
            Luồng phụ <span className="font-normal text-muted">— biến thể của flow này, test sau khi flow chính chạy được</span>
          </h4>
          <table className="mt-1.5 w-full min-w-[560px] border-collapse text-left">
            <tbody>
              {f.subs.map((x, i) => {
                const k = `${f.id}:x${i}`
                return (
                  <tr key={i} className={`border-t border-line-soft align-top ${done.has(k) ? 'opacity-55' : ''}`}>
                    <td className="w-[42%] py-2 pr-4 text-[12.5px] font-medium leading-[1.55] text-ink">{md(x.what)}</td>
                    <td className="py-2 pr-4 text-[12.5px] leading-[1.55] text-ink/70">
                      {md(x.ok)} <PageLink k={x.page} onPick={onPick}>↗</PageLink>
                    </td>
                    <td className="w-[28px] py-1.5"><Tick on={done.has(k)} onClick={() => toggle(k)} /></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <footer className="mt-4 flex flex-wrap gap-x-5 gap-y-1 border-t border-line-soft px-5 py-3">
        {f.logic && (
          <a
            href={f.logic.href}
            onClick={(e) => {
              if (e.metaKey || e.ctrlKey || e.button !== 0) return
              e.preventDefault()
              // the app routes on popstate, so a push + event is an in-app navigation
              window.history.pushState({}, '', f.logic!.href)
              window.dispatchEvent(new PopStateEvent('popstate'))
              window.scrollTo(0, 0)
            }}
            className="text-[12px] font-medium text-brand hover:underline"
          >
            {f.logic.label} →
          </a>
        )}
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-[12px] text-muted hover:text-ink">
          ↑ Về bản đồ
        </button>
      </footer>
    </article>
  )
}

export function DemoPlan({ onPick }: { onPick: (key: string) => void }) {
  const { done, toggle, reset } = useChecks()
  const all = FLOWS.flatMap(keysOf)
  const n = all.filter((k) => done.has(k)).length
  const subs = FLOWS.reduce((a, f) => a + f.subs.length, 0)
  return (
    <div className="space-y-10">
      <header>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-brand">Làm chủ hệ thống · kiểm từng luồng</p>
        <h1 className="mt-1 text-[26px] font-bold leading-tight tracking-tight">Danh sách flow</h1>
        <p className="mt-2 max-w-[74ch] text-[13.5px] leading-[1.75] text-ink/75">
          Toàn bộ những gì hệ thống làm, gom thành <strong>{FLOWS.length} flow chính</strong> và{' '}
          <strong>{subs} luồng phụ</strong>, chạy qua ba site: <strong>Admin</strong> (nhân viên Saramin),{' '}
          <strong>Company site</strong> (nhà tuyển dụng) và <strong>Jobseeker site</strong> (người tìm việc).
          Mỗi bước có cột <em>Kết quả đúng</em> — đó chính là điều cần kiểm. Kiểm xong bước nào thì đánh dấu bước đó.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="h-1.5 w-56 overflow-hidden rounded-full bg-line">
            <div className="h-full bg-brand transition-all" style={{ width: `${all.length ? (n / all.length) * 100 : 0}%` }} />
          </div>
          <span className="font-mono text-[11px] text-muted">{n}/{all.length} mục đã kiểm</span>
          {n > 0 && <button onClick={reset} className="text-[11.5px] text-muted underline-offset-2 hover:text-ink hover:underline">Xoá đánh dấu</button>}
          <span className="text-[11px] text-faint">Đánh dấu chỉ lưu trên trình duyệt này.</span>
        </div>
      </header>

      <section>
        <h2 className="text-[19px] font-bold tracking-tight">Bản đồ luồng</h2>
        <p className="mt-1 max-w-[74ch] text-[13px] leading-[1.7] text-ink/75">
          Ba nhóm. Trong mỗi chuỗi, <strong>đi theo chiều mũi tên</strong> là thứ tự nên test — dữ liệu flow trước
          tạo ra là thứ flow sau dùng. Điều kiện bắt buộc của từng flow ghi ở dòng <em>Cần có trước</em>. Bấm một ô
          để tới flow đó.
        </p>
        <div className="mt-4"><FlowMap done={done} /></div>
      </section>

      <section className="rounded-lg border border-line bg-surface p-5">
        <h2 className="text-[15px] font-bold tracking-tight">Dữ liệu cần có trước khi test</h2>
        <ul className="mt-3 space-y-1.5">
          {TEST_DATA.map(([a, b], i) => (
            <li key={i} className="flex flex-wrap gap-x-3 text-[13px] leading-[1.6]">
              <span className="text-ink/85">{md(a)}</span>
              <span className="font-mono text-[10.5px] leading-[2] text-faint">{b}</span>
            </li>
          ))}
        </ul>
      </section>

      {CHAINS.map((c) => (
        <section key={c.id}>
          <h2 className="text-[19px] font-bold tracking-tight">{c.title}</h2>
          <p className="mt-1 max-w-[74ch] text-[13px] leading-[1.7] text-ink/75">{c.lead}</p>
          <div className="mt-4 space-y-6">
            {FLOWS.filter((f) => f.chain === c.id).map((f) => (
              <FlowCard key={f.id} f={f} done={done} toggle={toggle} onPick={onPick} />
            ))}
          </div>
        </section>
      ))}

      <section>
        <h2 className="text-[19px] font-bold tracking-tight">Màn hình hỗ trợ</h2>
        <p className="mt-1 max-w-[74ch] text-[13px] leading-[1.7] text-ink/75">
          Không flow nào ở trên đi qua, nhưng vẫn là một phần của hệ thống — mở mỗi màn một lần khi test.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {SUPPORT.map((g) => (
            <div key={g.group} className="rounded-lg border border-line bg-surface p-4">
              <h3 className="text-[13px] font-bold">{g.group}</h3>
              <ul className="mt-2 space-y-1.5">
                {g.items.map(([what, why, k]) => (
                  <li key={what} className="text-[12.5px] leading-[1.55]">
                    <span className="font-medium text-ink">{what}</span>{' '}
                    <span className="text-ink/65">— {why}</span>{' '}
                    <PageLink k={k} onPick={onPick}>↗</PageLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
