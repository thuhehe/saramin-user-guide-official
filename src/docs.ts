/*
 * Per-page and per-module guidance.
 *
 * TWO LEVELS, ON PURPOSE. A rule that governs one screen belongs on that screen;
 * a rule that governs five belongs once, above all five. Repeating "hoá đơn
 * Issued mới cấp quota" on Quotations, Purchase order and Invoice would be three
 * places to update and two chances to disagree — so the module carries it and the
 * pages point at it.
 *
 * `logic` answers WHY the screen behaves as it does — the part an operator cannot
 * guess and will otherwise learn by getting it wrong. `how` is the short path to
 * a finished job. `watch` is the trap: the thing that looks like a bug and is not,
 * or the mistake that is expensive to undo.
 *
 * Written from the build's own docs (docs/features/*.md "Business rules",
 * docs/business-logic.md, docs/qa/tester-guide) — restated for someone operating
 * the console, not implementing it. Where a page has no entry yet, the UI says so
 * rather than padding it, because a confident-looking empty section is worse than
 * an admitted gap.
 */

export interface PageDoc {
  logic?: string[]
  how?: string[]
  watch?: string[]
}

export interface ModuleDoc {
  /** shown as its own entry at the top of the module's menu */
  title: string
  lead: string
  logic: string[]
  watch?: string[]
}

/* ── Module-level logic ─────────────────────────────────────────────────────── */

export const MODULE_DOCS: Record<string, ModuleDoc> = {
  CRM: {
    title: 'Logic chung — CRM',
    lead:
      'CRM là luồng bán, và nó là một chuỗi chứng từ nối tiếp: Công ty → Báo giá → PO → Hoá đơn. Mỗi chứng từ chỉ dựng được từ chứng từ trước, và chỉ chứng từ cuối cùng mới đổi được quyền sử dụng của khách.',
    logic: [
      '**Hoá đơn Issued là mốc cấp quota — không phải PO, không phải “đã thanh toán”.** Đây là quy tắc chi phối toàn bộ hệ thống. Khách ký PO, chuyển tiền, mọi thứ xong xuôi — nhưng tới khi kế toán bấm phát hành hoá đơn thì công ty vẫn có 0 lượt đăng tin.',
      '**Báo giá có 1–3 option, và các option thay thế nhau.** Khách chấp nhận option 2 nghĩa là option 1 và 3 bị loại, không phải mua cả ba. PO dựng từ đúng option đã Accepted — dựng nhầm option là sai cả số tiền lẫn quota.',
      '**Mọi thứ bán được đều treo vào một công ty.** Không có báo giá trôi nổi: luôn bắt đầu từ hồ sơ công ty, vì hoá đơn và quota sau này gắn vào chính công ty đó.',
      '**MST là khoá chống trùng công ty.** Tạo công ty với MST đã tồn tại sẽ bị từ chối, và hệ thống chỉ thẳng sang công ty đang giữ MST đó. Mở công ty đó ra, đừng tạo bản thứ hai.',
      '**Công ty phải được xác minh trước khi đăng tin.** Ba mức: No paperwork → Waiting to verify → Verified. Sales nộp giấy tờ, Sales Admin duyệt.',
      '**Chiết khấu có hai cấp duyệt.** Tổng đơn giảm ≤ 10% do Sales Leader duyệt; trên 10% phải chuyển Sales Manager.',
      '**Pipeline không có bản ghi riêng.** Một thẻ trên Pipeline mở ra chính báo giá của nó — không tồn tại “deal” tách biệt để sửa.',
    ],
    watch: [
      'Câu hỏi “khách mua rồi mà sao không đăng tin được” gần như luôn dừng ở một chỗ: mở hoá đơn của đơn đó ra xem đã Issued chưa.',
      'Sửa công ty và sửa trang công ty công khai là hai quyền khác nhau. Mọi Sales đều sửa được hồ sơ công ty; đăng trang công khai thì không.',
    ],
  },

  Recruitment: {
    title: 'Logic chung — Recruitment',
    lead:
      'Đây là chặng tiêu quota. Tin tuyển dụng nối trực tiếp với thứ khách đã mua: đăng một tin dưới tier nào thì tiêu một slot của đúng tier đó, và tin tự lên đúng những khu vực mà tier đó mua quyền xuất hiện.',
    logic: [
      '**Quota đếm theo từng tier, không dùng chéo.** Mua 5 tin Top job là 5 slot Top job. Hết slot Top job thì không đăng được tin Top job, dù tổng số slot của công ty còn nhiều.',
      '**Với loại Job posting, Product chính là Tier.** Không phải hai thứ tách rời: “Top job 30 ngày” vừa là món bán vừa là bậc tin.',
      '**Status suy ra từ ngày, không gõ tay.** Draft → Schedule → Open → Closed. Đặt ngày bắt đầu tương lai thì tin ở Schedule và tự lên Open đúng ngày; qua ngày kết thúc thì tự Closed. Không có ai bấm tay để đổi.',
      '**Exposure là công tắc riêng, độc lập với status.** Tin có thể Open mà vẫn không ai thấy nếu Exposure tắt. Đây là cách gỡ một tin khỏi trang jobseeker mà không kết thúc booking.',
      '**Tin lên khu vực nào là tự động.** Không ai gõ tay “tin này thuộc banner nào” — tier quyết định, qua cấu hình ở Products và Placements.',
      '**Địa điểm làm việc là của CÔNG TY, tin chỉ tham chiếu.** Sửa địa chỉ thì sửa ở hồ sơ công ty, không sửa trong từng tin.',
      '**Hồ sơ ứng viên là dữ liệu cá nhân.** Mở chi tiết và xuất danh sách đều bị ghi log ở server. Chỉ mở khi có lý do công việc.',
    ],
    watch: [
      'Khách báo “tin không hiện” thì kiểm Exposure TRƯỚC, rồi mới kiểm status và ngày.',
      'Luồng duyệt tin (approval) đã được gỡ bỏ từ 09/2026 — tin không còn đi qua bước chờ duyệt nữa.',
    ],
  },

  'Products & Packages': {
    title: 'Logic chung — Products & Packages',
    lead:
      'Đây là nơi khai báo bán cái gì, và mỗi thứ bán ra thì giao cái gì. Mọi dòng báo giá đều trỏ vào một Product khai ở đây — không gõ tay tên sản phẩm ở chỗ khác.',
    logic: [
      '**Product là món bán được; Package (bundle) là nhiều Product bán chung một giá, một dòng.**',
      '**Field `Type` của Product quyết định “gói này giao cái gì” (fulfilment).** Job posting thì giao quota theo tier; Placement booking thì giao một chỗ hiển thị trong một khoảng thời gian; Manual service thì giao bằng tay và ghi nhật ký.',
      '**Placement là khu vực hiển thị trên trang jobseeker** — kích thước, hiện bao nhiêu cái, bao lâu xoay một lần. Product trỏ vào Placement; đừng khai lại kích thước trong từng lần bán.',
      '**Kho vị trí là không giới hạn.** Trang web hiển thị một số vị trí cố định nhưng phía sau xoay vòng bao nhiêu banner cũng được — nên vị trí không bao giờ “đầy”. Bán thêm không hết chỗ, mà làm mỏng tỉ lệ hiển thị của những khách đã mua.',
      '**Danh mục (Products) khác với thứ khách đang giữ (Quota).** Products trả lời “chúng ta bán gì”; quota của một công ty xem ở hồ sơ công ty, tab Products & billing.',
    ],
    watch: [
      '“Placement” có ba nghĩa khác nhau trong hệ thống — xem mục Từ điển. Đây là nguồn nhầm lẫn số 1.',
    ],
  },

  User: {
    title: 'Logic chung — User',
    lead:
      'Hai loại tài khoản hoàn toàn khác nhau nằm cạnh nhau: người tìm việc (ứng viên) và người của công ty khách hàng. Tài khoản nhân viên Saramin không ở đây — nó ở System → Users.',
    logic: [
      '**4 trạng thái ở API hiện thành 5 trạng thái trên màn hình.** Active · Unverified · Withdrawn · Deactivated · Deleted.',
      '**Withdrawn và Deactivated là cùng một trạng thái phía API,** phân biệt bằng AI là người đổi: chính ứng viên tự tắt thì là Withdrawn, admin khoá thì là Deactivated.',
      '**Xoá là xoá mềm.** Tài khoản Deleted vẫn còn 30 ngày rồi mới bị purge thật; trong thời gian đó khôi phục được.',
      '**Mở hồ sơ và xuất dữ liệu đều được audit.** Quyền xuất (`candidate:manage`) khác quyền đọc (`candidate:read`).',
    ],
    watch: [
      'Đừng “reactivate” một tài khoản Withdrawn như thể HQ khoá nhầm — người dùng tự tắt nó.',
      'Tab Withdrawn query cùng tập dữ liệu với tab Deactivated; phân biệt nằm ở cột trạng thái từng dòng.',
    ],
  },

  Content: {
    title: 'Logic chung — Content',
    lead:
      'Mọi thứ hiển thị trên trang jobseeker mà không phải tin tuyển dụng: banner, popup, bộ sưu tập tin, trang chiến dịch, menu và chân trang.',
    logic: [
      '**Banner và Popup là hai tab của cùng một trang Displays,** không phải hai trang. Chúng cùng vòng đời Draft → Schedule → Open → Expired và cùng có công tắc Exposure riêng.',
      '**Banner có hai nguồn: Sold (khách mua, gắn PO) và House (Saramin tự chạy).** Banner nội bộ vẫn chiếm chỗ xoay vòng y như banner bán — nó là thứ giữ cho vị trí không trống.',
      '**Popup khác banner ở ba điểm:** nhắm theo nhóm người xem, có giới hạn tần suất, và chỉ một popup hiện tại một thời điểm nên cần thứ tự ưu tiên.',
      '**Collection là bộ tin đã lưu; Zone là trang chiến dịch ghép từ collection.** Sửa collection thì mọi zone dùng nó đổi theo.',
      '**Menu và footer của site jobseeker sửa ở đây,** mỗi tab là một vùng menu.',
    ],
  },

  System: {
    title: 'Logic chung — System',
    lead:
      'Cấu hình nền của cả hệ thống: ai được làm gì, dữ liệu danh mục dùng chung, và các thiết lập ảnh hưởng mọi module.',
    logic: [
      '**Quyền có dạng `resource:action` kèm phạm vi.** Ba phạm vi: `all` (không giới hạn) · `company` (chỉ công ty được giao) · `own` (chỉ dữ liệu của chính mình).',
      '**Server mới là nơi chặn thật.** Giao diện chỉ ẩn nút bạn không dùng được; mọi kiểm tra thật nằm ở backend. Vì vậy nút bị ẩn = thiếu quyền, gần như không bao giờ là bug.',
      '**Master data là dữ liệu nền dùng chung** — ngành nghề, kỹ năng, cấp bậc, khu vực. Mỗi tab một nhóm và mỗi nhóm có quyền riêng, nên thiếu quyền một tab thì tab đó trống chứ cả trang không lỗi.',
      '**Users ở đây là nhân viên Saramin,** khác hẳn tài khoản ứng viên ở nhóm User.',
      '**Audit log ghi lại thao tác chạm dữ liệu nhạy cảm** — mở hồ sơ ứng viên, xuất dữ liệu, phát hành hoá đơn.',
      '**Mọi ngày giờ hiển thị theo giờ Việt Nam,** không theo múi giờ máy người xem.',
    ],
    watch: [
      'Sửa vai trò của một người đang đăng nhập thì quyền mới chỉ áp sau khi phiên của họ nạp lại — bảo họ đăng xuất vào lại nếu thấy chưa đổi.',
    ],
  },

  Analytics: {
    title: 'Logic chung — Analytics',
    lead: 'Ba báo cáo tách theo câu hỏi cần trả lời, không tách theo phòng ban.',
    logic: [
      '**Sales report** — ai bán được bao nhiêu, đang ở chặng nào.',
      '**Recruit report** — tin tuyển dụng và ứng tuyển chạy ra sao.',
      '**Revenue report** — tiền thực thu theo kỳ. Doanh thu tính theo hoá đơn đã phát hành, nên con số ở đây đi cùng mốc Issued chứ không đi cùng PO.',
      '**Mọi mốc thời gian theo giờ Việt Nam.** Báo cáo “hôm nay” là hôm nay ở VN.',
    ],
  },

  'Call center': {
    title: 'Logic chung — Call center',
    lead:
      'Dữ liệu cuộc gọi đồng bộ từ tổng đài Callio. Admin không tạo cuộc gọi — nó chỉ đọc lại và xếp hạng.',
    logic: [
      '**Dữ liệu là bản sao từ Callio,** không phải nguồn gốc. Sai lệch thì sửa ở tổng đài, không sửa ở đây.',
      '**Sync health là nơi kiểm khi nghi ngờ thiếu cuộc gọi** — trước khi kết luận nhân viên không gọi.',
    ],
  },
}

/* ── Page-level guidance ────────────────────────────────────────────────────── */

export const PAGE_DOCS: Record<string, PageDoc> = {
  /* CRM */
  companies: {
    logic: [
      'Một hồ sơ công ty là gốc của mọi thứ bán được cho khách đó: báo giá, PO, hoá đơn, quota, tin tuyển dụng đều treo vào đây.',
      'Ba tab trạng thái công ty nằm trên cùng một mục menu, không phải ba trang.',
      'Quota khách đang giữ xem ở tab **Products & billing** trong chính hồ sơ này.',
    ],
    how: [
      'Tạo: **Create company** → nhập **Tên pháp lý** và **MST** (hai field bắt buộc) → địa chỉ đăng ký, người liên hệ, sales owner.',
      'Xác minh: nộp giấy tờ ở **Company documents** → Sales Admin chuyển sang **Verified**.',
      'Xem khách đã mua gì: mở công ty → tab **Products & billing**.',
    ],
    watch: [
      'MST trùng sẽ bị từ chối kèm link sang công ty đang giữ MST đó — mở công ty đó, đừng tạo bản thứ hai.',
      'Công ty chưa **Verified** thì không đăng tin được, dù đã có quota.',
    ],
  },
  pipeline: {
    logic: ['Một thẻ trên bảng chính là một báo giá — không có bản ghi “deal” riêng phía sau để sửa.'],
    how: ['Bấm một thẻ để mở thẳng báo giá của nó.'],
  },
  quotations: {
    logic: [
      'Một báo giá có **1–3 option**, khách chọn đúng **một**. Các option là phương án thay thế nhau, không cộng dồn.',
      'Mỗi dòng trong option trỏ vào một **Product** đã khai ở Products — không gõ tay tên sản phẩm.',
    ],
    how: [
      'Tạo từ hồ sơ công ty: mở công ty → **Create quotation**.',
      'Thêm option và các dòng sản phẩm → gửi khách.',
      'Khách đồng ý → đánh dấu option đó **Accepted** → dựng PO từ chính option đó.',
    ],
    watch: [
      'Chiết khấu tổng đơn ≤ 10% do Sales Leader duyệt, trên 10% phải chuyển Sales Manager.',
      'Dựng PO từ nhầm option là sai cả số tiền lẫn quota sẽ cấp.',
    ],
  },
  'purchase-order': {
    logic: ['PO là đơn đã cam kết, dựng từ đúng option khách đã chấp nhận. PO **chưa** cấp quota.'],
    how: ['Từ báo giá có option Accepted → dựng PO → chuyển kế toán phát hành hoá đơn.'],
    watch: ['PO đã duyệt mà khách vẫn không đăng tin được là đúng — quota chỉ vào khi hoá đơn Issued.'],
  },
  invoice: {
    logic: [
      'Phát hành hoá đơn (**Issued**) là hành động cấp quota cho công ty. Đây là mốc quan trọng nhất toàn hệ thống.',
      'Quyền phát hành (`invoice:issue`) tách khỏi quyền đọc — thường chỉ kế toán có.',
    ],
    how: [
      'Mở hoá đơn dựng từ PO → kiểm thông tin xuất hoá đơn (tên đơn vị, MST, địa chỉ) → **Issue**.',
      'Kiểm lại: mở công ty → tab **Products & billing** xem quota đã vào chưa.',
    ],
    watch: ['Sau khi Issue, mở lại hồ sơ công ty để xác nhận quota có thật — đừng tin mỗi thông báo thành công.'],
  },
  'company-claims': {
    logic: ['Sales xin nhận một công ty đang nằm ở Free data. Yêu cầu đi qua **hai cấp duyệt** trước khi công ty về tay người xin.'],
    how: ['Sales gửi yêu cầu từ công ty trong Free data → hai cấp duyệt lần lượt xử lý tại trang này.'],
  },
  'sign-ups': {
    logic: [
      'Khách tự đăng ký từ employer site rơi vào đây để admin phân loại. Đây là cửa vào, chưa phải khách hàng.',
      'Người đăng ký **chưa đăng nhập được** cho tới khi admin xử lý dòng của họ.',
    ],
    how: [
      'Xem dòng đăng ký → chọn một trong ba: **Move** (gắn vào công ty đã có) · **Create company & activate** (tạo công ty mới) · **Archive** (bỏ).',
    ],
    watch: ['Chỉ **Move** và **Create** mới mở được đăng nhập cho người đó; **Archive** thì không.'],
  },
  'company-documents': {
    logic: ['Giấy tờ công ty nộp lên để xác minh. Đây là đầu vào của bước chuyển công ty sang **Verified**.'],
    how: ['Mở giấy tờ chờ duyệt → đối chiếu với hồ sơ công ty → duyệt hoặc từ chối.'],
  },

  /* Recruitment */
  jobs: {
    logic: [
      'Đăng tin là lúc **tiêu 1 slot** quota của đúng tier chọn.',
      'Status suy ra từ ngày (Draft → Schedule → Open → Closed), **Exposure** là công tắc hiển thị riêng.',
      'Tin lên khu vực nào là tự động theo tier — không gõ tay.',
    ],
    how: [
      'Kiểm công ty đã **Active** và **Verified**, còn slot đúng tier.',
      '**New job** → chọn công ty → nội dung tin → chọn **tier**.',
      'Publish. Để trống ngày bắt đầu = đăng ngay; đặt ngày tương lai = Schedule.',
    ],
    watch: [
      'Hết slot đúng tier thì không publish được, dù tổng slot còn nhiều.',
      'Tin Open mà Exposure Off thì không ai thấy — kiểm chỗ này đầu tiên khi khách báo tin không hiện.',
    ],
  },
  applicants: {
    logic: ['Danh sách ứng tuyển theo từng tin. Mỗi dòng là một ứng viên đã nộp vào một tin cụ thể.'],
    how: ['Lọc theo tin hoặc theo công ty → mở dòng để xem hồ sơ ứng viên.'],
    watch: ['Mở hồ sơ ứng viên là chạm dữ liệu cá nhân và bị ghi log.'],
  },
  'talent-pool': {
    logic: [
      'Kho ứng viên **đã bật cho tìm kiếm CV** — không phải mọi ứng viên trong hệ thống.',
      'Một dòng một ứng viên, kèm CV đang cho tìm và kết quả kiểm duyệt của CV đó.',
    ],
  },
  'cv-review': {
    logic: [
      'Hàng đợi CV cần **người** xem, gồm ba nhánh: đang chờ quyết, đã duyệt, đã từ chối.',
      'CV nào máy quét tự thấy đạt thì **không** vào đây — nó đi thẳng vào Talent pool. Đó là thứ giữ cho hàng đợi này hữu hạn.',
    ],
    how: ['Mở CV trong hàng chờ → đọc → duyệt hoặc từ chối kèm lý do.'],
  },
  resumes: {
    logic: [
      'Hồ sơ ứng viên do admin quản lý — khác Talent pool ở chỗ đây là bản ghi admin tạo/sửa được.',
      'Mở khoá một CV cho công ty sẽ **trừ credit** của công ty đó.',
    ],
    watch: ['Giá mở khoá một CV có thể được admin đặt riêng cho từng CV.'],
  },

  /* Products & Packages */
  products: {
    logic: [
      'Mỗi Product là một món bán được. Field **Type** quyết định gói đó giao cái gì.',
      'Với loại Job posting thì Product **chính là** Tier (Basic, Top job, Distinction…).',
    ],
    how: ['New product → chọn **Type** → điền phần fulfilment mà Type đó yêu cầu.'],
  },
  packages: {
    logic: ['Package (bundle) gộp nhiều Product thành một giá, một dòng trên báo giá.'],
  },
  placements: {
    logic: [
      'Khai báo các khu vực hiển thị trên trang jobseeker: kích thước, hiện bao nhiêu cái cùng lúc, bao lâu xoay một lần.',
      'Product trỏ vào một Placement — kích thước khai một lần ở đây, không lặp lại trong từng lần bán.',
    ],
    watch: ['Số “hiện bao nhiêu cái” là số vị trí render cùng lúc, **không** phải giới hạn số banner được đặt.'],
  },
  'cv-search-usage': {
    logic: ['Khách mua gói tìm CV dùng tới đâu: mua bao nhiêu lượt, đã dùng bao nhiêu, còn bao nhiêu.'],
    watch: ['Khách mua nhiều mà không dùng là tín hiệu gia hạn sẽ hỏng — đây là chỗ thấy điều đó sớm.'],
  },
  'manual-services': {
    logic: ['Dịch vụ giao bằng tay: hệ thống không tự giao được nên phải có người ghi nhận đã giao.'],
  },
  'image-gallery': { logic: ['Kho ảnh dùng chung cho các vị trí hiển thị có ô ảnh.'] },
  'discount-programmes': { logic: ['Chương trình chiết khấu áp lên báo giá. Mức giảm vẫn chịu hai cấp duyệt như mọi chiết khấu khác.'] },

  /* User */
  'jobseeker-users': {
    logic: [
      '5 trạng thái trên màn hình: Active · Unverified · Withdrawn · Deactivated · Deleted.',
      '**Withdrawn** là ứng viên tự tắt; **Deactivated** là HQ khoá. Cùng một trạng thái phía API, khác nhau ở người thực hiện.',
    ],
    watch: ['Đừng mở lại một tài khoản Withdrawn như thể bị khoá nhầm — chính người dùng đã tắt nó.'],
  },
  'company-users': { logic: ['Tài khoản đăng nhập của phía khách hàng, xem xuyên suốt mọi công ty ở một chỗ.'] },
  'deleted-accounts': {
    logic: ['Tài khoản ứng viên đã kết thúc. Xoá mềm: còn 30 ngày rồi mới purge thật.'],
    how: ['Trong 30 ngày đó vẫn khôi phục được từ trang này.'],
  },

  /* System */
  roles: {
    logic: [
      'Quyền dạng `resource:action` kèm phạm vi `all` · `company` · `own`.',
      'Giao diện chỉ ẩn nút; chặn thật nằm ở server.',
    ],
    watch: ['Đổi vai trò của người đang đăng nhập thì họ phải đăng xuất vào lại mới thấy quyền mới.'],
  },
  'master-data': {
    logic: ['Dữ liệu danh mục dùng chung toàn hệ thống. Mỗi tab một nhóm, mỗi nhóm một quyền riêng.'],
    watch: ['Thiếu quyền một tab thì chỉ tab đó trống — không phải cả trang hỏng.'],
  },
  users: { logic: ['Tài khoản **nhân viên Saramin**, khác hẳn tài khoản ứng viên ở nhóm User.'] },
  'audit-log': { logic: ['Nhật ký thao tác chạm dữ liệu nhạy cảm: mở hồ sơ ứng viên, xuất dữ liệu, phát hành hoá đơn.'] },
  'company-information': { logic: ['Thông tin pháp nhân Saramin in lên hoá đơn xuất cho khách.'] },
  environment: { logic: ['Cờ bật/tắt tính năng. Tắt một cờ thì mục tương ứng biến mất khỏi menu của mọi người.'] },

  /* Content */
  displays: {
    logic: [
      'Banner và Popup là **hai tab** của trang này.',
      'Mỗi banner có nguồn **Sold** (khách mua, gắn PO) hoặc **House** (Saramin tự chạy). Banner nội bộ vẫn chiếm chỗ xoay vòng như banner bán.',
    ],
    watch: ['Banner Open mà Exposure Off thì không hiển thị — giống hệt cơ chế của tin tuyển dụng.'],
  },
  collections: { logic: ['Bộ tin đã lưu, dùng làm nguồn cho Zone hoặc một mục điều hướng. Sửa collection thì mọi nơi dùng nó đổi theo.'] },
  zones: { logic: ['Trang chiến dịch có thương hiệu, ghép từ các collection.'] },
  'site-navigation': { logic: ['Menu đầu trang jobseeker. Bốn tab tương ứng bốn vùng menu khác nhau.'] },
  'site-footer': { logic: ['Chân trang jobseeker: phần chữ và các khối link, lưu riêng nhau.'] },

  /* Call center */
  'call-logs': { logic: ['Lịch sử cuộc gọi đồng bộ từ Callio. Đây là bản sao, không phải nguồn gốc.'] },
  'call-sync-health': { logic: ['Kiểm khi nghi ngờ thiếu dữ liệu cuộc gọi — trước khi kết luận nhân viên không gọi.'] },
}
