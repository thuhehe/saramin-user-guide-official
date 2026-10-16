/*
 * CẨM NANG THAO TÁC — the operating handbook for the real Admin console.
 *
 * WHAT THIS IS NOT. It is not the requirement (src/data/build/*) which says why a
 * module behaves as it does, and it is not the per-module user guide
 * (src/data/guides/*) which walks one module's screens. This is the CROSS-MODULE
 * handbook a Sales or ops person reads once before touching the console: what the
 * words mean, which order things happen in, and the two or three rules that cause
 * every support call when they are not known.
 *
 * ONE DOCUMENT, TWO AUDIENCES. Blocks marked `dev: true` are hidden in the Sales
 * view and shown in the Developer view. Writing two documents guarantees they
 * disagree within a month — the operator's version silently loses a rule the
 * developer's version gained — so the audience is a filter over one source, never
 * a second copy.
 *
 * Content is written from the BUILD repos (SARAMIN_BUILD/saramin-vn-admin: docs/
 * business-logic.md, docs/qa/tester-guide/, src/configs/navigation.config.tsx),
 * not from this site's spec. Paths below are the ones the console actually serves.
 */
/** A value grid. Inlined rather than imported: this site has one table shape. */
export interface SpecTable {
  cols: string[]
  rows: string[][]
}

/** The deployed admin this handbook describes. Every deep link is built from it. */
export const ADMIN_BASE = 'https://dev.admin-svn.topdev.asia'
export const adminUrl = (path: string) => `${ADMIN_BASE}${path}`

export type WfBlock =
  /** a paragraph */
  | { kind: 'p'; text: string; dev?: boolean }
  /** numbered actions — what to DO, in order */
  | { kind: 'steps'; heading?: string; items: string[]; dev?: boolean }
  /** a value grid — the default for anything with more than three cases */
  | { kind: 'table'; heading?: string; note?: string; table: SpecTable; dev?: boolean }
  /** the one rule of the section that, unknown, produces a wrong outcome */
  | { kind: 'warn'; text: string; dev?: boolean }
  /** deep links into the live console */
  | { kind: 'links'; items: { label: string; path: string }[]; dev?: boolean }

export interface WfSection {
  /** anchor id — stable once published */
  id: string
  /** sidebar group heading */
  group: string
  /** short badge in the sidebar, as in the client's layout */
  code: string
  /** sidebar label */
  label: string
  title: string
  /** where in the console this lives */
  where?: string
  lead?: string
  blocks: WfBlock[]
  /** whole section hidden from the Sales view */
  dev?: boolean
}

export interface Workflow {
  title: string
  lead: string
  /** the three "I want to…" cards above the fold */
  quick: { q: string; a: string }[]
  keyFact: { heading: string; text: string }
  links: { label: string; path: string }[]
  sections: WfSection[]
}

export const WORKFLOW: Workflow = {
  title: 'Quy trình Saramin, coi một lần là hiểu',
  lead:
    'Bản này dành cho Sales và các bạn làm nghiệp vụ. Nội dung tập trung vào chuyện cần làm gì, khi nào làm, và làm xong thì hệ thống thay đổi ra sao. Bật “Xem bản Developer” để thấy thêm route, mã lỗi và ràng buộc kỹ thuật.',
  quick: [
    { q: 'Muốn bán sản phẩm?', a: 'Đi theo luồng Báo giá → PO → Hoá đơn. Quota chỉ được cấp khi hoá đơn Issued.' },
    { q: 'Muốn đăng tin tuyển dụng?', a: 'Công ty phải Active, đã xác minh, và còn slot đúng tier muốn đăng.' },
    { q: 'Chưa thấy quyền sử dụng?', a: 'Kiểm hoá đơn đã Issued chưa, rồi mở Company → Products & billing.' },
  ],
  keyFact: {
    heading: 'Điều quan trọng nhất cần nhớ',
    text:
      'Chỉ khi hoá đơn chính thức được phát hành (Issued) thì sản phẩm hoặc số lượt sử dụng mới được cộng vào tài khoản công ty. PO đã duyệt, hay trạng thái “đã thanh toán”, đều KHÔNG tự động cấp quyền sử dụng. Đây là mốc quan trọng nhất trong toàn hệ thống — gần như mọi câu hỏi “sao khách mua rồi mà không đăng tin được” đều dừng ở đây.',
  },
  links: [
    { label: 'Mở CRM', path: '/crm/companies' },
    { label: 'Mở danh sách báo giá', path: '/crm/quotations' },
    { label: 'Mở hoá đơn', path: '/crm/invoices' },
    { label: 'Mở Jobs', path: '/recruitment/jobs' },
    { label: 'Mở Products', path: '/system/products' },
  ],

  sections: [
    /* ── HƯỚNG DẪN ──────────────────────────────────────────────────────────── */
    {
      id: 'tu-dien',
      group: 'Hướng dẫn',
      code: 'TĐ',
      label: 'Từ điển',
      title: 'Từ điển — đọc trước, 5 phút',
      lead:
        'Gần như mọi nhầm lẫn khi dùng hệ thống đến từ năm từ đầu bảng. Đọc một lượt rồi quay lại tra khi cần.',
      blocks: [
        {
          kind: 'table',
          table: {
            cols: ['Từ', 'Nghĩa trong hệ thống này'],
            rows: [
              ['Product', 'Một món bán được, ví dụ “Tin tuyển dụng Top job 30 ngày”. Một dòng báo giá luôn trỏ vào một Product.'],
              ['Tier (bậc tin)', 'Mức của một tin: Basic · Basic plus · Top job · Distinction · Platinum. Với loại Job posting thì **Product chính là Tier**, không phải hai thứ tách rời.'],
              ['Package (bundle)', 'Nhiều Product bán chung một giá, gộp thành một dòng.'],
              ['Placement', 'Một **khu vực hiển thị** trên trang jobseeker. Từ này có 3 nghĩa khác nhau — xem mục ngay dưới.'],
              ['Quota (hạn ngạch)', 'Số lượt đăng tin công ty còn được dùng, **đếm riêng theo từng tier**. Mua 5 tin Top job là có 5 slot Top job, không phải 5 slot bất kỳ.'],
              ['Slot', 'Một lượt trong quota. Đăng một tin tiêu đúng 1 slot của tier đó.'],
              ['Quotation (báo giá)', 'Chứng từ chào giá, có 1–3 **option** để khách chọn 1.'],
              ['Option', 'Một phương án trong báo giá. Các option **thay thế nhau**, không cộng dồn.'],
              ['PO (Purchase Order)', 'Đơn đã cam kết, dựng từ đúng option khách chấp nhận.'],
              ['Invoice', 'Hoá đơn VAT. **Issued là lúc quota được cấp.**'],
              ['Exposure', 'Công tắc cho hiện công khai của một tin. **Độc lập với status** — tin có thể Open mà vẫn không ai thấy nếu Exposure tắt.'],
              ['MST', 'Mã số thuế công ty. Hoá đơn VAT cần nó, và nó là khoá chống trùng công ty.'],
              ['Add-on', 'Món bán thêm gắn lên một tin đã có tier chính, ví dụ nhãn “Hot”.'],
            ],
          },
        },
        {
          kind: 'table',
          heading: 'Bẫy tên gọi: “Placement” có 3 nghĩa',
          note: 'Đây là nguồn nhầm lẫn số 1. Biết có ba thứ khác nhau là đủ.',
          table: {
            cols: ['Tên đầy đủ', 'Là gì', 'Xem ở đâu'],
            rows: [
              ['masterdata.Placement', 'Khu vực hiển thị trên trang jobseeker. Cấu hình thuần: kích thước, hiện bao nhiêu cái, bao lâu xoay một lần.', 'System → Placements'],
              ['recruitment.JobPlacement', 'Tier mà **một tin cụ thể** đang chiếm. Là một giao dịch có ngày bắt đầu/kết thúc, gắn 1 PO.', 'Không có trang riêng — xem ở job detail, dòng Current tier.'],
              ['content.PlacementBooking', 'Mua đứt một banner cụ thể. Cơ chế song song, **không liên quan tin tuyển dụng**.', 'Content → Displays'],
            ],
          },
        },
      ],
    },
    {
      id: 'chuoi',
      group: 'Hướng dẫn',
      code: 'CH',
      label: 'Chuỗi xuyên suốt',
      title: 'Chuỗi xuyên suốt — hai chuỗi gặp nhau ở tin tuyển dụng',
      lead:
        'Hệ thống có **hai chuỗi** chạy song song: chuỗi phía công ty (tiền → quota → tin) và chuỗi phía ứng viên (tài khoản → CV → đơn ứng tuyển). Hai chuỗi gặp nhau ở **tin tuyển dụng** và ở **kho ứng viên**. Biết một câu hỏi “sao chưa thấy gì” đang kẹt ở chặng nào của chuỗi nào là trả lời được gần hết.',
      blocks: [
        {
          kind: 'p',
          text:
            '**Chuỗi A — phía công ty.** Công ty mua gói qua Báo giá → PO → Hoá đơn. Đúng lúc kế toán phát hành hoá đơn VAT (*Issued*), công ty có ngay quota cho đúng tier đã mua (và gói CV search, nếu có mua). Đăng tin dưới tier đó thì tin **tự động** xuất hiện ở đúng những khu vực mà tier đó mua quyền xuất hiện. Không ai gõ tay “tin này thuộc banner nào”.',
        },
        {
          kind: 'table',
          heading: 'Chuỗi A — phía công ty, mỗi chặng làm gì',
          note: 'Cột Trang ghi đúng tên menu console đang hiện (nhóm *Recruitment* trên console là nhóm *Job management* trong tài liệu này).',
          table: {
            cols: ['Chặng', 'Trang (console)', 'Kết quả để lại', 'Hay bị hỏi “sao chưa thấy…”'],
            rows: [
              ['1. Khai báo bán cái gì', 'Product settings → Products (`/system/products`)', 'Có Product/tier để báo giá trỏ vào.', 'Không tìm thấy món để thêm vào báo giá → Product chưa được khai báo.'],
              ['2. Có khách hàng', 'CRM → Companies (`/crm/companies`)', 'Công ty tồn tại, có MST, được xác minh.', 'Không tạo được công ty → MST đã thuộc một công ty khác; mở công ty đó.'],
              ['3. Chào giá', 'CRM → Quotations', 'Báo giá với 1–3 option; khách chấp nhận 1.', 'Option không cộng dồn — khách chọn 1 là 2 cái kia bị loại.'],
              ['4. Chốt đơn', 'CRM → Purchase orders', 'PO dựng từ option đã chấp nhận.', 'PO đã duyệt nhưng khách vẫn chưa có quota → chưa có hoá đơn *Issued*.'],
              ['5. Phát hành hoá đơn', 'CRM → Invoices', '**Issued ⇒ quota tin được cấp vào công ty.** Gói CV search sinh ra ở trạng thái **chờ kích hoạt**, có hạn phải bắt đầu dùng.', '“Đã thanh toán” không cấp gì. Gói CV search xem ở **Service delivery → Quota usage**.'],
              ['6. Đăng tin', 'Recruitment → Jobs (`/recruitment/jobs`)', 'Tiêu 1 slot của đúng tier; tin lên các khu vực của tier đó. **Từ đây tin nhận đơn** — chặng nối sang chuỗi B.', 'Tin Open mà không ai thấy → Exposure đang Off.'],
            ],
          },
        },
        {
          kind: 'warn',
          text:
            'Nhảy cóc là nguyên nhân phổ biến nhất của “hệ thống lỗi”. Không có Product thì không báo giá được; công ty chưa Active thì không đăng tin được; hoá đơn chưa Issued thì quota bằng 0 dù PO đã duyệt.',
        },
        {
          kind: 'p',
          text:
            '**Chuỗi B — phía ứng viên.** Ứng viên tạo tài khoản, làm CV, bật cho nhà tuyển dụng tìm thấy, rồi nộp đơn vào tin. CV được máy quét (hoặc một người ở CV review) chấm **Đạt** thì đơn mới tới tay nhà tuyển dụng. Phần lớn chuỗi này diễn ra **ngoài console** — trên Jobseeker site — nên HQ chỉ nhìn thấy kết quả của từng chặng, không thấy thao tác.',
        },
        {
          kind: 'table',
          heading: 'Chuỗi B — phía ứng viên, mỗi chặng làm gì',
          note: 'Đường dẫn bắt đầu bằng `/auth`, `/my-profile`, `/jobs`, `/help` là trên **Jobseeker site**; `/search`, `/applicants` là trên **site công ty**; còn lại là console.',
          table: {
            cols: ['Chặng', 'Trang', 'Kết quả để lại', 'Hay bị hỏi “sao chưa thấy…”'],
            rows: [
              [
                '1. Đăng ký tài khoản',
                'Jobseeker site `/auth/sign-up` (hoặc Google · Facebook · LinkedIn · GitHub) · Console: **Users → Jobseeker users** (`/users/jobseekers`)',
                'Tài khoản **Active** ngay khi nhập đúng **mã OTP 6 số gửi qua Zalo** tới số điện thoại. Trước khi nhập mã **không có dòng nào** ở console. Từ 08/10/2026 (SRM-903) **chỉ còn kênh Zalo**: bỏ hẳn lựa chọn “Tôi đang sống ở nước ngoài” và mã qua email lúc đăng ký. *Unverified* giờ chỉ sinh ra từ nút **Create** của HQ.',
                'Không thấy ứng viên ở Jobseeker users → họ chưa nhập xong mã. Không có số điện thoại Việt Nam nhận được Zalo → **không đăng ký được**. Console **không còn chip Verified** cạnh email / số điện thoại (bỏ cùng SRM-903).',
              ],
              [
                '2. Tạo CV',
                '*My CVs* `/my-profile/cv-resume` — **Create Saramin CV** hoặc **Upload file** (PDF / Word)',
                'Một CV trong thư viện. **Mỗi CV** khai *Experienced* hoặc *No experience* (Fresher). Thay file của CV tải lên tạo **version** mới (`v.1` → `v.2`) của cùng CV; sửa form của Saramin CV thì CV được dựng lại.',
                'Saramin CV thiếu **Education** (và **Work experience** nếu khai *Experienced*) → **không nộp đơn được** bằng nó — luật này **luôn chạy**, kể cả khi máy quét đang tắt.',
              ],
              [
                '3. Show CV to employers',
                'Công tắc trên từng CV ở *My CVs*',
                'Ứng viên vào **kho ứng viên**. **Mỗi người chỉ một CV** được bật; bật CV khác là tắt CV cũ.',
                'NTD chỉ tìm thấy khi CV đang bật là **Qualified** (*CV search status: Showing*); CV chưa đạt hay bị từ chối thì *Hidden*. CV đã bị *Từ chối* thì không bật được.',
              ],
              [
                '4. Máy quét CV / CV review',
                'Console: **Recruitment → CV review** (`/recruitment/cv-review`)',
                'CV được chấm *Đạt* · *Chưa đủ thông tin* · *Không đọc được*. Luật: **≥ 1 Education**, cộng **≥ 1 Work experience** trừ khi CV khai *No experience*; file không có lớp chữ → *Không đọc được*. CV nghi ngờ vào hàng đợi; người duyệt *Duyệt* hoặc *Từ chối*.',
                '**Máy quét đang TẮT mặc định** (`SVN_CV_QUALIFICATION_ENABLED=false`) → file tải lên **sinh ra đã Đạt**, hàng đợi gần như rỗng. Bật hay không là **quyết định sản phẩm**, chưa ai bật.',
              ],
              [
                '5. Kho ứng viên (Talent pool)',
                'Console: **Recruitment → Talent pool** (`/recruitment/talent-pool`) · Site công ty: tìm kiếm CV `/search`',
                'Console thấy **mọi** ứng viên đã bật một CV, kèm trạng thái CV. Nhà tuyển dụng tìm thấy họ với **tên bị che** tới khi mở khoá.',
                'Thấy ở Talent pool của console **không có nghĩa** là nhà tuyển dụng tìm thấy: tìm kiếm của NTD chỉ lấy tài khoản **Active**, và CV còn nghi ngờ chưa vào chỉ mục tìm kiếm tới khi *Đạt*.',
              ],
              [
                '6. Tìm việc & nộp đơn',
                'Jobseeker site: trang chi tiết tin → **Apply**; nộp xong có hộp **Batch apply**',
                'Một **đơn ứng tuyển** = một CV gửi tới một tin. Đơn **chụp lại** nội dung đã gửi: file CV tại đúng version lúc nộp và các mục của hồ sơ — ứng viên sửa CV sau đó không đổi thứ NTD đã nhận. Batch apply gửi **cùng CV đó**, **không kèm cover letter**, tối đa **5 tin** một lần.',
                'Không nộp được → tin đã đóng / quá hạn / công ty không Active (*no longer available*), hoặc đã có một đơn **đang chạy** vào tin đó. Mỗi job chỉ nộp **1 lần**, kể cả khi đơn cũ đã bị Recall.',
              ],
              [
                '7. Đơn tới nhà tuyển dụng',
                'Console: **Recruitment → Applications** (`/recruitment/applications`) · Site công ty: **Candidate management** `/applicants` (tab *Jobs*)',
                'Console hiện **CV Status** (*Qualified · Cannot Read · Not Enough Information · Rejected*), **Application Status** (*Not Sent · Sent · Recall* — chỉ 3 giá trị), **Stage · Employer** (vị trí thẻ trên Kanban, chỉ đọc) và 2 flag **Viewed / Downloaded**. Đơn chỉ tới NTD khi **Sent**; thẻ vào cột **Application Received**.',
                'NTD không thấy đơn → đơn còn *Not Sent* vì file chưa *Qualified*. Console **không có nút Forward** — Operator **Approve** (⋮ trên Applications) là thứ gửi đi mọi đơn đang chờ dùng cùng phiên bản CV, một lần.',
              ],
              [
                '8. Trạng thái đơn & thông báo',
                'Jobseeker site: *My applications* `/my-profile/applications`',
                'Ứng viên thấy 1 trong 9 trạng thái: *Application Received* · *In Review* · *Invalid Application* · *Application Withdrawn* · *Application Viewed* · *Application Saved* · *In Process* · *Passed* · *Not This Time*. NTD được báo (email) khi đơn **chuyển sang Sent**.',
                'Ứng viên “không nhận được email kết quả” → đúng thiết kế: **không gửi email lẻ** cho mỗi lần đổi trạng thái — trạng thái cập nhật ngay trên *Việc đã ứng tuyển*, và cuối tuần có **1 email tổng hợp**.',
              ],
              [
                '9. Rút đơn · khoá · xoá tài khoản',
                'Console: **Jobseeker users** (*Deactivate* / *Reactivate* / *Restore*) · Jobseeker site: xoá tài khoản ở `/help/withdraw`',
                'Ứng viên tự tắt **hoặc** HQ *Deactivate* → mọi đơn **đang chạy** bị rút khỏi bảng của NTD (trạng thái ứng viên thấy cho trường hợp này **chưa chốt** — không có trong 9 trạng thái), mỗi công ty đã nhận đơn được báo ngừng dùng dữ liệu. Xoá tài khoản → giống vậy, cộng **huỷ dữ liệu cá nhân sau 72 giờ**; NTD thấy dòng “tài khoản đã xoá”.',
                '*Reactivate* **không trả đơn về**. *Restore* chỉ được **trước khi** lần huỷ 72 giờ chạy. Ứng viên **không tự thu hồi được** hồ sơ — không có nút sửa, thu hồi hay xoá ở bất kỳ trạng thái nào; chỉ Admin / CS **Recall**.',
              ],
            ],
          },
        },
        {
          kind: 'table',
          heading: 'Hai chuỗi gặp nhau ở đâu — và ai tiêu gì',
          note: '**Ứng viên không bao giờ trả tiền.** Thứ phía ứng viên “tiêu” của công ty chỉ có một: **mở khoá CV** trên kho ứng viên. Nộp đơn không tiêu gì của ai.',
          table: {
            cols: ['Điểm gặp', 'Phía công ty cần', 'Phía ứng viên cần', 'Tiêu gì'],
            rows: [
              ['**Tin nhận đơn**', 'Tin *Open*, chưa qua hạn nộp, công ty *Active*. Slot tier **đã tiêu lúc đăng tin**.', 'Tài khoản đăng nhập được; một CV gửi được (Saramin CV *Đạt*, hoặc file tải lên chưa bị *Từ chối*).', '**Không gì cả.** Mỗi đơn chỉ tăng bộ đếm ứng tuyển của tin.'],
              ['**Đơn trên bảng NTD** (tab *Jobs*)', 'Một tài khoản công ty có quyền xem ứng viên.', 'CV của đơn đã *Đạt* (đơn *Sent*).', '**Không gì cả.** Người tự nộp đơn thì liên hệ mở sẵn, không phải mở khoá.'],
              ['**Tìm và lưu ứng viên** (`/search`)', 'Gói CV search **đang chạy** → đọc bản che của mọi CV. Không có gói → **10 CV** đọc miễn phí (bản che), sau đó thấy bản mờ.', 'Đã bật *Show CV to employers*, CV *Đạt*, tài khoản *Active*.', '**Miễn phí** — tìm, lọc, lưu vào folder.'],
              ['**Mở khoá CV**', 'Còn lượt trong một gói CV search. Gói **sắp hết hạn trước** trả trước; gói **chưa kích hoạt** tự kích hoạt ở lần mở đầu tiên; hết lượt thì lấy từ công ty bảo trợ (shared quota) nếu có.', '—', '**1 lượt / ứng viên**, một lần, cho cả công ty. Hết lượt: lỗi hết credit; gói đã hết hạn mà còn lượt: báo **gói đã hết hạn**, không phải “hết credit”.'],
              ['**CV bị từ chối sau khi đã mở khoá**', '—', 'HQ *Từ chối* CV ở CV review.', 'Lượt mở khoá của CV đó được **hoàn lại**; đơn đã gửi bằng đúng version bị từ chối chuyển *Recall* (thu hồi).'],
              ['**Ứng viên rút / khoá / xoá**', 'Nhận thông báo ngừng dùng dữ liệu.', 'Tự tắt, bị HQ khoá, hoặc tự xoá tài khoản.', 'Lượt mở khoá **đã trả không hoàn** — công ty vẫn giữ danh tính đã mua.'],
            ],
          },
        },
        {
          kind: 'warn',
          text:
            '**Nhảy cóc phía ứng viên** cũng ra “hệ thống lỗi”: chưa nhập mã Zalo thì **chưa có tài khoản** — console không có dòng nào để tìm; chưa bật *Show CV to employers* thì **không ở trong kho** — NTD tìm không ra dù CV đẹp; Saramin CV thiếu Education (hoặc thiếu Work experience khi khai *Experienced*) thì **không nộp được**; file tải lên còn nghi ngờ thì đơn **nộp được nhưng nằm ở *Not sent*** — NTD không thấy cho tới khi có người duyệt ở CV review; tài khoản *Deactivated* thì **không đăng nhập, không ở trong kết quả tìm kiếm**, và các đơn đang chạy **đã bị rút** — mở lại tài khoản không trả chúng về.',
        },
        {
          kind: 'p',
          dev: true,
          text:
            'Kiểm ngày 08/10/2026 ở `origin/dev`: svn-be `ee1db5ea9` · saramin-vn-admin `45954108` · svn-web `d8a43a11`. Máy quét: `svn.cv.qualification.enabled: ${SVN_CV_QUALIFICATION_ENABLED:false}` trong `svn-bootstrap/.../application.yml`, không profile / deploy nào đặt biến này. Tắt thì `CandidateCv.createNew` ghi `APPROVED` lúc tải lên và `CvQualificationService` không ghi gì; bật thì `createNewHeld` ghi `PENDING`. Luật nằm ở `CvQualificationRule.evaluateResume(counts, fresher)` (Education ≥ 1; Experience ≥ 1 trừ khi `fresher`; skills/projects không chặn). Chặn Saramin CV lúc nộp là `WebApplyService.requireSaraminCvAvailable` → 409 `SVN-5012 CV_NOT_QUALIFIED` — **không** phụ thuộc cờ. CV tải lên bị từ chối → `SVN-5007 CV_NOT_APPROVED` (cả khi nộp lẫn khi bật Show CV).',
        },
        {
          kind: 'p',
          dev: true,
          text:
            'Đọc từ code, **chưa thử trên dev**: `CandidateCv.replacedWith` (thay file của CV tải lên) luôn đưa CV về `PENDING`, còn `CvQualificationService.recordParseOutcome` trả về sớm khi cờ tắt — nên với cờ tắt, một CV **vừa thay file** sẽ đứng ở *Cần duyệt* và các đơn mới bằng nó nằm ở *Not sent* tới khi có người duyệt. Saramin CV dựng lại (`regeneratedWith`) thì giữ `APPROVED`.',
        },
        {
          kind: 'p',
          dev: true,
          text:
            'Thông báo phía ứng viên: chỉ `WebApplyController` (`application.submitted`), kích hoạt tài khoản (`account.activated`) và `AdminJobApplicantController` PATCH `/admin/jobs/{id}/applicants/{appId}` (`application.status_changed`, chỉ khi status thực sự đổi) gọi `NotifyCandidateUseCase`. Console không gọi PATCH đó (`applicants.service.ts` chỉ có list · detail · `reject`), và `CompanyApplicantService.moveToTerminal` không gửi gì. Mở khoá: `CreditService.spend` với `svn.billing.search-quota.spend-from-packages` mặc định `true` → trừ `SearchQuotaGrant` (gói tạo bởi hoá đơn *Issued*, `PENDING` tới khi kích hoạt); lỗi `SVN-4000 INSUFFICIENT_CREDIT` / `SVN-4001 SEARCH_QUOTA_LAPSED`. 10 lượt đọc miễn phí: `svn.billing.cv-preview.free-opens:10` (`CvReadAccessService`). Tìm kiếm của NTD: `PgFtsCandidateSearchAdapter` — `cv.searchable` + `candidate.status = ACTIVE` + `resume.is_hidden = FALSE`; Talent pool của console (`AdminTalentPoolQueryAdapter`) không lọc theo trạng thái tài khoản. Tự động rút đơn: `CandidateLifecyclePort.withdrawActiveApplications` (FR-13) từ cả `deactivateMyAccount`, admin deactivate và xoá tài khoản.',
        },
        {
          kind: 'links',
          items: [
            { label: 'Jobseeker users', path: '/users/jobseekers' },
            { label: 'CV review', path: '/recruitment/cv-review' },
            { label: 'Talent pool', path: '/recruitment/talent-pool' },
            { label: 'Applications', path: '/recruitment/applications' },
            { label: 'Jobs', path: '/recruitment/jobs' },
            { label: 'Invoices', path: '/crm/invoices' },
            { label: 'Quota usage', path: '/system/quota-usage' },
          ],
        },
      ],
    },
    {
      id: 'quyen',
      group: 'Hướng dẫn',
      code: 'R',
      label: 'Quyền theo vai trò',
      title: 'Quyền theo vai trò',
      lead:
        'Quyền của bạn quyết định bạn thấy trang nào. Nếu một trang trong tài liệu này không có trong sidebar của bạn thì đó là **thiếu permission, không phải bug** — báo team gán role.',
      blocks: [
        {
          kind: 'table',
          table: {
            cols: ['Vai trò', 'Phạm vi xem', 'Được làm', 'Không được làm / cần chuyển người khác'],
            rows: [
              ['Sales Member', 'Khách hàng mình phụ trách; dữ liệu team khác ở chế độ chỉ xem', 'Call, meeting, tạo báo giá trong phạm vi được giao', 'Không sửa Company info, không xoá Contact. Thiếu quyền thì chuyển Sales Leader hoặc Sales Admin.'],
              ['Sales Leader', 'Dữ liệu của team và từng thành viên', 'Theo dõi team, duyệt chiết khấu trong hạn mức', 'Chiết khấu vượt hạn mức phải chuyển Sales Manager.'],
              ['Sales Admin', 'Phạm vi quản trị Sales', 'Verify company, xử lý Sign-up, duyệt claim', 'Không đụng các quyền chỉ dành cho System Admin.'],
              ['Accountant / Kế toán', 'Chứng từ tài chính', '**Phát hành hoá đơn (Issued)** — bước cấp quota', 'Không sửa nội dung tin tuyển dụng.'],
              ['Ops / Recruitment', 'Tin tuyển dụng, ứng viên, CV', 'Duyệt và chỉnh tin, xử lý ứng tuyển', 'Không phát hành hoá đơn, không đổi giá.'],
              ['System Admin', 'Toàn hệ thống', 'Users, Roles, Master data, Environment', '—'],
            ],
          },
        },
        {
          kind: 'warn',
          text:
            'Nút bị ẩn gần như luôn là permission, không phải lỗi. Trước khi báo bug, kiểm: trang có trong sidebar của bạn không, và vai trò của bạn có hành động đó trong bảng trên không.',
        },
        {
          kind: 'p',
          dev: true,
          text:
            'Permission có dạng `resource:action` (ví dụ `company:read`, `order:read`), mỗi cái kèm `scope`: `all` (không giới hạn) · `company` (dòng phải thuộc companyId được cấp) · `own` (dòng phải thuộc chính user). **svn-be là nơi duy nhất có thẩm quyền** — nó enforce 401/403 và row-level scope trên mọi call; `usePermission()` / `AppButton` / `PermissionGate` ở FE chỉ là UX (ẩn nút người dùng không bấm được), không bao giờ được coi là lớp bảo vệ.',
        },
        {
          kind: 'p',
          dev: true,
          text:
            'Nguồn sự thật về danh tính và quyền là `GET /api/admin/auth/me`, cache trong `AuthProvider`. Sửa role/permission thì phải invalidate query đó. Hiện chỉ seed một tài khoản `admin@saramin.vn` scope `all`; muốn kiểm hành vi scope `company`/`own` phải tạo user qua `AdminUserController` trước.',
        },
      ],
    },

    /* ── CRM ────────────────────────────────────────────────────────────────── */
    {
      id: 'companies',
      group: 'CRM',
      code: 'C',
      label: 'Companies',
      title: 'Companies — hồ sơ khách hàng',
      where: 'CRM → Companies (/crm/companies)',
      lead: 'Mọi thứ bán được đều treo vào một công ty. Công ty sai hoặc trùng là lỗi đắt nhất, vì hoá đơn và quota đã gắn vào đó.',
      blocks: [
        {
          kind: 'steps',
          heading: 'Tạo công ty',
          items: [
            'Mở **CRM → Companies → Create company**.',
            'Nhập **Tên pháp lý** và **MST** — đây là hai field bắt buộc; mọi thứ khác điền sau được.',
            'Điền địa chỉ đăng ký, người liên hệ, sales owner.',
            'Lưu. Công ty vào trạng thái chưa xác minh cho tới khi có giấy tờ.',
          ],
        },
        {
          kind: 'table',
          heading: 'Xác minh công ty',
          table: {
            cols: ['Trạng thái', 'Nghĩa', 'Ai chuyển'],
            rows: [
              ['No paperwork', 'Chưa có giấy tờ nào', '—'],
              ['Waiting to verify', 'Đã nộp giấy tờ, chờ duyệt', 'Sales nộp'],
              ['Verified', 'Đã xác minh — mới được đăng tin', 'Sales Admin duyệt'],
            ],
          },
        },
        {
          kind: 'warn',
          text:
            'MST là khoá chống trùng. Tạo công ty với MST đã tồn tại sẽ bị từ chối và hệ thống chỉ thẳng sang công ty đang giữ MST đó — hãy mở công ty đó ra thay vì tạo bản thứ hai.',
        },
        {
          kind: 'p',
          dev: true,
          text:
            'Trùng MST trả **409** kèm `{ error, id }` trong `ApiError.details`, `id` là công ty đang tồn tại để client link sang. `id` có thể `null` ở nhánh thua race khi cùng tạo (svn-be F9).',
        },
        { kind: 'links', items: [{ label: 'Companies', path: '/crm/companies' }, { label: 'Sign-ups', path: '/crm/sign-ups' }, { label: 'Company documents', path: '/crm/company-documents' }] },
      ],
    },
    {
      id: 'bao-gia',
      group: 'CRM',
      code: 'đ',
      label: 'Báo giá → Hoá đơn',
      title: 'Báo giá → PO → Hoá đơn',
      where: 'CRM → Quotations / Purchase orders / Invoices',
      lead: 'Đây là luồng bán. Ba chứng từ nối tiếp nhau, và chỉ chứng từ cuối cùng mới đổi được quyền sử dụng của khách.',
      blocks: [
        {
          kind: 'steps',
          heading: 'Các bước',
          items: [
            'Mở công ty → **Create quotation**. Báo giá luôn bắt đầu từ công ty, không tạo trôi nổi.',
            'Thêm **option** (1–3). Mỗi option là một phương án trọn gói; khách chọn **một**.',
            'Mỗi dòng trong option trỏ vào một **Product** — không gõ tay tên sản phẩm.',
            'Gửi khách. Khách chấp nhận một option → option đó chuyển **Accepted**.',
            'Dựng **PO** từ đúng option đã Accepted.',
            'Kế toán phát hành **Invoice**. Ngay khi Invoice **Issued**, quota vào tài khoản công ty.',
          ],
        },
        {
          kind: 'table',
          heading: 'Duyệt chiết khấu',
          table: {
            cols: ['Mức chiết khấu tổng đơn', 'Ai duyệt'],
            rows: [
              ['≤ 10%', 'Sales Leader'],
              ['> 10%', 'Sales Manager'],
            ],
          },
        },
        {
          kind: 'warn',
          text:
            'Các option **thay thế nhau, không cộng dồn**. Khách chấp nhận option 2 nghĩa là option 1 và 3 bị loại, không phải mua cả ba. Dựng PO từ nhầm option là sai số tiền và sai quota.',
        },
        {
          kind: 'table',
          heading: 'Mã lỗi hay gặp',
          dev: true,
          table: {
            cols: ['Status / code', 'Nghĩa', 'Xử lý ở UX'],
            rows: [
              ['409 `SVN-4000`', 'INSUFFICIENT_CREDIT', 'Nhắc nạp thêm credit'],
              ['409 `SVN-1005`', 'Sai chuyển trạng thái', 'Hiện thông báo xung đột'],
              ['400', 'Chưa xác định người trả', 'Hỏi chọn payer'],
              ['404 `SVN-1002`', 'Không tìm thấy', 'Thông báo not found'],
            ],
          },
        },
        { kind: 'links', items: [{ label: 'Quotations', path: '/crm/quotations' }, { label: 'Purchase orders', path: '/crm/purchase-orders' }, { label: 'Invoices', path: '/crm/invoices' }] },
      ],
    },
    {
      id: 'claim',
      group: 'CRM',
      code: '✓',
      label: 'Claim & Sign-up',
      title: 'Claim công ty & Sign-up',
      where: 'CRM → Company claims (/crm/company-claims) · Sign-ups (/crm/sign-ups)',
      lead: 'Hai cửa đưa khách vào hệ thống: khách tự đăng ký, hoặc Sales xin nhận một công ty đang nằm ở Free data.',
      blocks: [
        {
          kind: 'steps',
          heading: 'Sign-up: khách tự đăng ký',
          items: [
            'Người của công ty đăng ký ở employer site → dòng mới xuất hiện ở **CRM → Sign-ups**.',
            'Admin xem dòng đó và chọn một trong ba: **Move** (gắn vào công ty đã có) · **Create company & activate** (tạo mới) · **Archive** (bỏ).',
            'Chỉ sau **Move** hoặc **Create** thì người đó mới đăng nhập được.',
          ],
        },
        {
          kind: 'steps',
          heading: 'Claim: Sales xin nhận công ty',
          items: [
            'Sales mở công ty trong **Free data** → gửi yêu cầu nhận.',
            'Yêu cầu đi qua **hai cấp duyệt** trước khi công ty về tay Sales đó.',
          ],
        },
        { kind: 'links', items: [{ label: 'Sign-ups', path: '/crm/sign-ups' }, { label: 'Company claims', path: '/crm/company-claims' }, { label: 'Pipeline', path: '/crm/pipeline' }] },
      ],
    },
    {
      id: 'products-quota',
      group: 'CRM',
      code: 'P',
      label: 'Products & Quota',
      title: 'Products & Quota — khách đang giữ những gì',
      where: 'System → Products (/system/products) · Company → Products & billing',
      lead: 'Products là danh mục bán. Quota là phần khách đã mua và còn dùng được — hai thứ khác nhau, hay bị hỏi lẫn.',
      blocks: [
        {
          kind: 'table',
          table: {
            cols: ['Câu hỏi', 'Xem ở đâu'],
            rows: [
              ['Chúng ta bán những gì?', 'System → Products'],
              ['Công ty này đã mua gì, còn bao nhiêu lượt?', 'Mở công ty → tab Products & billing'],
              ['Sao mua rồi mà quota vẫn 0?', 'Mở hoá đơn của đơn đó — nhiều khả năng chưa Issued'],
            ],
          },
        },
        {
          kind: 'warn',
          text:
            'Quota đếm **theo từng tier**. Mua 5 tin Top job là 5 slot Top job — không dùng được cho Basic hay Distinction. Hết slot đúng tier thì không đăng được tin tier đó, dù tổng số slot còn nhiều.',
        },
        { kind: 'links', items: [{ label: 'Products', path: '/system/products' }, { label: 'Companies', path: '/crm/companies' }] },
      ],
    },

    /* ── RECRUITMENT ────────────────────────────────────────────────────────── */
    {
      id: 'jobs',
      group: 'Recruitment',
      code: 'J',
      label: 'Jobs',
      title: 'Jobs — đăng và quản tin tuyển dụng',
      where: 'Recruitment → Jobs (/recruitment/jobs)',
      lead: 'Đăng tin là lúc quota bị tiêu. Đây cũng là nơi hai khái niệm hay bị lẫn: status và exposure.',
      blocks: [
        {
          kind: 'steps',
          heading: 'Đăng một tin',
          items: [
            'Kiểm công ty đã **Active** và **Verified**, và còn slot đúng tier muốn đăng.',
            'Mở **Recruitment → Jobs → New job**, chọn công ty.',
            'Điền nội dung tin và chọn **tier**. Tier quyết định tin lên những khu vực nào.',
            'Publish. Hệ thống **tiêu 1 slot** của tier đó.',
          ],
        },
        {
          kind: 'table',
          heading: 'Status và Exposure là hai thứ khác nhau',
          table: {
            cols: ['', 'Status', 'Exposure'],
            rows: [
              ['Là gì', 'Tin đang ở chặng nào: Draft · Schedule · Open · Closed', 'Cho hiện công khai hay không: On / Off'],
              ['Ai đổi', 'Theo ngày và hành động publish — suy ra, không gõ tay', 'Người vận hành bật/tắt'],
              ['Tắt thì sao', 'Closed là kết thúc booking', 'Off là giấu khỏi trang jobseeker nhưng booking vẫn chạy và vẫn hết hạn đúng ngày'],
            ],
          },
        },
        {
          kind: 'warn',
          text:
            'Tin **Open mà Exposure Off thì không ai thấy**. Khi khách báo “tin không hiện”, kiểm Exposure trước khi kiểm bất cứ thứ gì khác.',
        },
        { kind: 'links', items: [{ label: 'Jobs', path: '/recruitment/jobs' }, { label: 'Applicants', path: '/recruitment/applicants' }] },
      ],
    },
    {
      id: 'applicants',
      group: 'Recruitment',
      code: 'A',
      label: 'Applications & CV',
      title: 'Applications & CV / Resumes',
      where: 'Recruitment → Applicants (/recruitment/applicants) · Resumes (/recruitment/resumes)',
      lead: 'Hồ sơ ứng viên là dữ liệu cá nhân. Mọi thao tác mở và xuất đều bị ghi log.',
      blocks: [
        {
          kind: 'table',
          table: {
            cols: ['Việc cần làm', 'Trang'],
            rows: [
              ['Xem ai đã ứng tuyển tin nào', 'Recruitment → Applicants'],
              ['Tra cứu kho CV ứng viên', 'Recruitment → Resumes / candidates'],
              ['Mở khoá một CV cho công ty', 'Từ CV đó — tiêu credit của công ty'],
            ],
          },
        },
        {
          kind: 'warn',
          text:
            'Mở hồ sơ ứng viên và xuất danh sách đều là thao tác chạm dữ liệu cá nhân, được audit ở server. Chỉ mở khi có lý do công việc.',
        },
        {
          kind: 'p',
          dev: true,
          text:
            'Export bị gate bằng `candidate:manage`, không phải `:read`, và được audit dưới sự kiện `candidate.export`. Unlock CV và company unlock đều trừ credit trên số dư công ty qua `/api/admin/companies/{id}/credit`; giá unlock một CV có thể bị admin override theo từng CV.',
        },
        { kind: 'links', items: [{ label: 'Applicants', path: '/recruitment/applicants' }, { label: 'Resumes', path: '/recruitment/resumes' }] },
      ],
    },
    {
      id: 'jobseeker-users',
      group: 'Users',
      code: 'ID',
      label: 'Jobseeker Users',
      title: 'Jobseeker Users — tài khoản người tìm việc',
      where: 'Users → Jobseeker users',
      lead: 'Bốn trạng thái ở API hiện thành năm trạng thái trên màn hình. Cặp hay nhầm là Withdrawn và Deactivated.',
      blocks: [
        {
          kind: 'table',
          table: {
            cols: ['Hiện trên UI', 'Nghĩa', 'Ai gây ra'],
            rows: [
              ['Active', 'Đang dùng bình thường', '—'],
              ['Unverified', 'Chưa có mật khẩu / chưa xác thực — đăng ký tự phục vụ không còn tạo ra nó', 'Chỉ nút Create của HQ'],
              ['Withdrawn', 'Người dùng **tự** tắt tài khoản', 'Chính ứng viên'],
              ['Deactivated', 'Bị HQ khoá', 'Admin'],
              ['Deleted', 'Xoá mềm, huỷ dữ liệu cá nhân sau 72 giờ', 'Admin hoặc ứng viên'],
            ],
          },
        },
        {
          kind: 'warn',
          text:
            'Withdrawn và Deactivated trông giống nhau ở danh sách vì cùng một trạng thái phía API — phân biệt bằng **ai là người đổi**. Đừng “reactivate” một tài khoản Withdrawn như thể HQ đã khoá nhầm.',
        },
        {
          kind: 'p',
          dev: true,
          text:
            '4 API states (`ACTIVE`, `INACTIVE`→hiện “Unverified”, `DEACTIVATED`, `DELETED`) → 5 UI states. `DEACTIVATED` tách bằng `statusChangedBy`: bằng `candidate.id` ⇒ Withdrawn, id khác ⇒ Deactivated. Nguồn duy nhất: `resolveDisplayStatus()` trong `modules/user/jobseekers/jobseekers.types.ts`. Withdrawn **không filter được ở server** — tab của nó query cùng tập `DEACTIVATED`, số đếm lấy từ `/stats`; muốn filter thật cần thêm param ở BE.',
        },
      ],
    },

    /* ── DASHBOARDS ─────────────────────────────────────────────────────────── */
    {
      id: 'dashboard',
      group: 'Dashboards',
      code: 'DB',
      label: 'Dashboard & Analytics',
      title: 'Dashboard & Analytics',
      where: 'Dashboard (/) · Analytics (/analytics/…)',
      lead: 'Ba báo cáo tách theo câu hỏi, không phải theo phòng ban.',
      blocks: [
        {
          kind: 'table',
          table: {
            cols: ['Báo cáo', 'Trả lời câu hỏi', 'Đường dẫn'],
            rows: [
              ['Sales report', 'Ai bán được bao nhiêu, đang ở chặng nào', '/analytics/sales-report'],
              ['Recruit report', 'Tin tuyển dụng và ứng tuyển chạy ra sao', '/analytics/recruit-report'],
              ['Revenue report', 'Tiền thực thu theo kỳ', '/analytics/revenue-report'],
            ],
          },
        },
        {
          kind: 'p',
          dev: true,
          text:
            'Mọi ngày giờ render theo giờ VN — mọi helper trong `shared/utils/format.ts` pin `timeZone: "Asia/Ho_Chi_Minh"`. Không dùng `toLocaleString`/`toLocaleDateString` với timezone ngầm định. Số tiền qua `formatVnd` / `formatInt`.',
        },
        { kind: 'links', items: [{ label: 'Dashboard', path: '/' }, { label: 'Sales report', path: '/analytics/sales-report' }, { label: 'Revenue report', path: '/analytics/revenue-report' }] },
      ],
    },

    /* ── QUẢN TRỊ ───────────────────────────────────────────────────────────── */
    {
      id: 'can-xac-nhan',
      group: 'Quản trị',
      code: '?',
      label: 'Điểm cần xác nhận',
      title: 'Điểm cần xác nhận',
      lead:
        'Những điểm chưa có quyết định cuối. Ghi ở đây để không ai vô tình coi là đã chốt — mỗi dòng cần một người quyết trước khi build theo.',
      blocks: [
        {
          kind: 'table',
          table: {
            cols: ['Vấn đề', 'Đang tạm hiểu là', 'Ai quyết'],
            rows: [
              ['Ngưỡng tỉ lệ hiển thị tối thiểu của một vị trí banner', 'Tạm 50% — là cam kết thương mại, chưa chốt', 'Business'],
              ['Khi vị trí sắp trống, hệ thống tự đẩy banner nội bộ hay chỉ cảnh báo?', 'Chỉ cảnh báo', 'Business + Ops'],
              ['Hạn mức chiết khấu của Sales Leader', 'Tạm ≤ 10%', 'Sales Manager'],
              ['Ai được phát hành hoá đơn ngoài Kế toán?', 'Chưa ai khác', 'Finance'],
            ],
          },
        },
        {
          kind: 'warn',
          text:
            'Trang này mô tả hệ thống trên môi trường dev. Khi build đổi, trang này là thứ cũ đi — đọc kèm ngày cập nhật ở đầu trang.',
        },
      ],
    },
  ],
}

/** Sidebar groups, in the order the handbook reads. */
export const WF_GROUPS = ['Hướng dẫn', 'Dashboards', 'CRM', 'Recruitment', 'Users', 'Quản trị']
