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

/* ── Page-level guidance ────────────────────────────────────────────────────── */

export const PAGE_DOCS: Record<string, PageDoc> = {
  /* ── Analytics ───────────────────────────────────────────────────────────── */
  dashboard: {
    logic: ['Bốn con số tổng: số công ty, số tin tuyển dụng, số hồ sơ, số lượt ứng tuyển — lấy thẳng từ server, không lọc theo người xem.'],
    how: [
      'Mở sau khi đăng nhập — đây là trang mặc định.',
      'Đọc bốn thẻ KPI để nắm quy mô hiện tại.',
      'Cần chi tiết thì sang ba báo cáo trong cùng nhóm Analytics.',
    ],
  },
  'sales-report': {
    logic: ['Phân bố khách hàng theo từng chặng trong pipeline, kèm ảnh chụp doanh thu.'],
    how: [
      'Chọn kỳ muốn xem.',
      'Đọc phân bố theo chặng để biết cơ hội đang đọng ở đâu.',
      'Đối chiếu với Pipeline nếu thấy một chặng phình bất thường.',
    ],
  },
  'recruit-report': {
    logic: ['Số tin, số hồ sơ, số lượt ứng tuyển, phễu ứng tuyển và các tin nhiều ứng viên nhất.'],
    how: ['Chọn kỳ.', 'Đọc phễu để biết ứng viên rơi ở bước nào.', 'Xem top tin theo lượt ứng tuyển để biết tin nào đang hiệu quả.'],
  },
  'revenue-report': {
    logic: ['Tiền thực thu theo kỳ. Doanh thu tính theo **hoá đơn đã phát hành**, nên số ở đây đi cùng mốc Issued, không đi cùng PO.'],
    how: ['Chọn kỳ.', 'Đối chiếu với danh sách Invoice nếu một con số trông lệch.'],
    watch: ['PO đã ký nhưng chưa phát hành hoá đơn thì **chưa** vào doanh thu ở đây.'],
  },

  /* ── Recruitment ─────────────────────────────────────────────────────────── */
  jobs: {
    logic: [
      'Đăng tin là lúc **tiêu 1 slot** quota của đúng tier chọn.',
      'Status suy ra từ ngày (Draft → Schedule → Open → Closed); **Exposure** là công tắc hiển thị riêng.',
      'Tin lên khu vực nào là tự động theo tier — không gõ tay.',
    ],
    how: [
      'Kiểm trước: công ty đã **Active** và **Verified**, còn slot đúng tier.',
      '**New job** → chọn công ty → điền nội dung tin → chọn **tier**.',
      'Để trống ngày bắt đầu = đăng ngay; đặt ngày tương lai = Schedule.',
      'Publish. Kiểm lại slot của công ty đã giảm 1.',
      'Gỡ tin khỏi trang jobseeker mà không kết thúc booking: tắt **Exposure**.',
    ],
    watch: [
      'Hết slot đúng tier thì không publish được, dù tổng slot còn nhiều.',
      'Tin Open mà Exposure Off thì không ai thấy — kiểm chỗ này đầu tiên khi khách báo tin không hiện.',
      'Luồng duyệt tin đã gỡ bỏ từ 09/2026 — tin không còn đi qua bước chờ duyệt.',
    ],
  },
  applicants: {
    logic: [
      'Một bảng cho toàn bộ lượt ứng tuyển của mọi công ty, có tab trạng thái kèm số đếm.',
      'Mọi bộ lọc nằm trong URL — gửi link cho đồng nghiệp là họ thấy đúng màn hình bạn đang xem.',
    ],
    how: [
      'Lọc theo công ty, theo tin, theo chặng, hoặc theo có/không có CV.',
      'Mở một dòng để xem hồ sơ và xử lý.',
      'Cần chia sẻ: copy nguyên URL, không cần mô tả lại bộ lọc.',
    ],
    watch: ['Mở hồ sơ ứng viên là chạm dữ liệu cá nhân và bị ghi log.'],
  },
  'talent-pool': {
    logic: [
      'Kho ứng viên **đã bật cho tìm kiếm CV** — không phải mọi ứng viên trong hệ thống.',
      'Một dòng một ứng viên, kèm CV đang cho tìm và kết quả kiểm duyệt của CV đó.',
    ],
    how: ['Tìm/lọc ứng viên.', 'Bấm tên ứng viên để mở hộp thoại chi tiết ngay trên danh sách.'],
    watch: ['**Chức năng này chưa có API thật ở backend** tại thời điểm viết — màn hình có thể chưa chạy đầy đủ trên môi trường dev.'],
  },
  'cv-review': {
    logic: [
      'Hàng đợi CV cần **người** xem, gồm ba nhánh: đang chờ quyết, đã duyệt, đã từ chối.',
      'CV nào máy quét tự thấy đạt thì **không** vào đây — nó đi thẳng vào Talent pool. Đó là thứ giữ cho hàng đợi này hữu hạn.',
    ],
    how: [
      'Mở tab hàng chờ.',
      'Bấm một CV để mở hộp thoại review.',
      'Duyệt, hoặc từ chối kèm **lý do** chọn từ danh sách có sẵn.',
      'Kiểm lại ở hai tab kết quả nếu cần xem lại quyết định cũ.',
    ],
  },
  resumes: {
    logic: [
      'Hồ sơ ứng viên do admin quản lý — khác Talent pool ở chỗ đây là bản ghi admin tạo và sửa được.',
      'Có tab hiển thị: Tất cả · Đang cho tìm · Đang ẩn.',
      'Mở khoá một CV cho công ty sẽ **trừ credit** của công ty đó.',
    ],
    how: [
      'Lọc theo nguồn hoặc theo trạng thái hiển thị.',
      'Mở một hồ sơ để xem/sửa.',
      'Mở khoá cho khách: thao tác từ chính hồ sơ đó — credit trừ vào công ty.',
    ],
    watch: ['Giá mở khoá một CV có thể được admin đặt riêng cho từng CV, không phải luôn bằng giá chung.'],
  },

  /* ── Resume Management ───────────────────────────────────────────────────── */
  'search-quality-tracking': {
    logic: [
      'Mọi lượt tìm CV **không ra kết quả** đều được phân vào đúng một trong hai loại: không hiểu từ khoá, hoặc hiểu nhưng kho không có ai.',
      'Hai loại này do hai người khác nhau xử lý: loại đầu là việc của người quản trị danh mục, loại sau là việc của Sales/sourcing.',
    ],
    how: [
      'Đọc danh sách từ khoá trả về 0 kết quả.',
      'Từ nào **không hiểu** → thêm alias hoặc thêm kỹ năng mới ở **Master data**.',
      'Từ nào **hiểu nhưng thiếu người** → chuyển cho Sales/sourcing, không sửa danh mục.',
    ],
  },

  /* ── User ────────────────────────────────────────────────────────────────── */
  'jobseeker-users': {
    logic: [
      '5 trạng thái trên màn hình: Active · Unverified · Withdrawn · Deactivated · Deleted.',
      '**Withdrawn** là ứng viên tự tắt; **Deactivated** là HQ khoá. Cùng một trạng thái phía API, khác nhau ở người thực hiện.',
    ],
    how: [
      'Lọc theo tab trạng thái.',
      'Mở một tài khoản để xem chi tiết (thao tác này được ghi log).',
      'Hành động theo trạng thái: Active → Deactivate/Delete · Unverified → Gửi lại xác thực/Delete · Deactivated → Reactivate/Delete · Deleted → Restore.',
      'Hỗ trợ khách quên mật khẩu: gửi link đặt lại mật khẩu.',
    ],
    watch: [
      'Đừng mở lại một tài khoản Withdrawn như thể bị khoá nhầm — chính người dùng đã tắt nó.',
      'Lý do nhập khi khoá/xoá là ghi chú nội bộ, người dùng không thấy.',
    ],
  },
  'company-users': {
    logic: ['Tài khoản đăng nhập của phía khách hàng, xem xuyên suốt mọi công ty ở một chỗ. Khác hẳn tài khoản ứng viên và tài khoản nhân viên Saramin.'],
    how: ['Tìm theo công ty hoặc theo người.', 'Mở một dòng để xem người đó thuộc công ty nào, vai trò gì.'],
  },
  'deleted-accounts': {
    logic: ['Tài khoản ứng viên đã kết thúc — tự rút hoặc bị HQ xoá. Xoá là **xoá mềm**: bản ghi vẫn còn nên luôn khôi phục được.'],
    how: ['Tìm tài khoản cần tìm lại.', 'Bấm **Restore** để đưa tài khoản trở lại.'],
    watch: ['Sau 30 ngày hệ thống purge thật — lúc đó không khôi phục được nữa.'],
  },

  /* ── Products & Packages ─────────────────────────────────────────────────── */
  products: {
    logic: [
      'Trang có nhiều tab: **Catalog · Bundles · Orders · Credits**. Mỗi tab có quyền riêng — thiếu quyền một tab thì chỉ tab đó không hiện.',
      'Field **Type** của Product quyết định gói đó giao cái gì.',
      'Với loại Job posting thì Product **chính là** Tier (Basic, Top job, Distinction…).',
    ],
    how: [
      'Tab **Catalog** → **New product** → chọn **Type**.',
      'Điền phần fulfilment mà Type đó yêu cầu (tier và số ngày, hoặc vị trí hiển thị, hoặc số lượt giao tay).',
      'Product loại Placement thì trỏ vào một dòng ở **Placements**, không gõ lại kích thước.',
      'Lưu — Product xuất hiện trong danh sách chọn khi lập báo giá.',
    ],
  },
  packages: {
    logic: ['Package (bundle) gộp nhiều Product thành một giá, một dòng trên báo giá.'],
    how: ['**New bundle** → đặt tên → thêm các Product thành phần → đặt giá gói.', 'Lưu. Bundle dùng được như một dòng báo giá.'],
  },
  placements: {
    logic: [
      'Khai báo các khu vực hiển thị trên trang jobseeker: kích thước, hiện bao nhiêu cái cùng lúc, bao lâu xoay một lần.',
      'Product trỏ vào một Placement — kích thước khai một lần ở đây, không lặp lại trong từng lần bán.',
    ],
    how: ['Mở một vị trí → sửa trong drawer.', 'Drawer chỉ hiện đúng phần thuộc loại vị trí đó (banner hay nội dung).'],
    watch: [
      '“Hiện bao nhiêu cái” là số vị trí render **cùng lúc**, không phải giới hạn số banner được đặt — kho xoay vòng là không giới hạn.',
      '“Placement” có ba nghĩa trong hệ thống — xem Từ điển.',
    ],
  },
  'cv-search-usage': {
    logic: ['Khách mua gói tìm CV dùng tới đâu: mua bao nhiêu lượt, đã dùng bao nhiêu, còn bao nhiêu, lần dùng gần nhất.'],
    how: ['Đọc danh sách theo công ty.', 'Chú ý dòng mua nhiều mà dùng ít — gọi khách trước khi tới hạn gia hạn.'],
    watch: ['Khách mua rồi không dùng vẫn hiện “còn nhiều lượt” ở chỗ khác — nhưng ở đây nó là tín hiệu gia hạn sẽ hỏng.'],
  },
  'manual-services': {
    logic: [
      'Dịch vụ hệ thống không tự giao được (đăng bài Facebook, gửi email blast, CSKH) nên phải có người ghi nhận đã giao.',
      'Một dòng là một (công ty × dịch vụ): mua bao nhiêu lượt, còn bao nhiêu, và nhật ký các lần đã giao.',
    ],
    how: ['Tìm công ty cần giao.', 'Giao xong thì **ghi nhận một lượt** kèm mô tả — số còn lại tự trừ.'],
    watch: ['Hết hạn mà chưa giao hết thì lượt còn lại mất — đây là dòng cần xử lý sớm, không để tới hạn.'],
  },
  'image-gallery': {
    logic: ['Kho ảnh dùng chung cho các vị trí hiển thị có ô ảnh.'],
    how: ['Tải ảnh lên, gắn nhãn chủ đề.', 'Khi tin hoặc vị trí cần ảnh thì chọn từ kho này.'],
  },
  'discount-programmes': {
    logic: ['Chương trình chiết khấu áp lên báo giá.'],
    how: ['Mở một chương trình để xem/sửa điều kiện và mức giảm.'],
    watch: ['Mức giảm vẫn chịu hai cấp duyệt như mọi chiết khấu: ≤ 10% Sales Leader, trên 10% Sales Manager.'],
  },

  /* ── Call center ─────────────────────────────────────────────────────────── */
  'call-logs': {
    logic: ['Lịch sử cuộc gọi đồng bộ từ tổng đài **Callio**. Đây là bản sao, không phải nguồn gốc.'],
    how: ['Lọc theo nhân viên hoặc theo kỳ.', 'Cuộc gọi chưa gắn được vào công ty nào thì nằm ở hàng chờ để gắn tay.'],
    watch: ['**Không gọi điện được từ đây.** Callio không có API quay số — admin chỉ đọc lại.'],
  },
  'call-ranking': {
    logic: ['Xếp hạng nhân viên theo hoạt động gọi trong kỳ.'],
    how: ['Chọn kỳ → đọc bảng xếp hạng.'],
    watch: ['Thấy số thấp bất thường thì kiểm **Sync health** trước, đừng vội kết luận nhân viên không gọi.'],
  },
  'call-sync-health': {
    logic: ['Tình trạng đồng bộ với Callio — nơi kiểm khi nghi ngờ dữ liệu cuộc gọi bị thiếu.'],
    how: ['Mở khi số liệu gọi trông sai.', 'Đồng bộ lỗi thì báo kỹ thuật; không sửa số ở Call logs.'],
  },

  /* ── CRM ─────────────────────────────────────────────────────────────────── */
  companies: {
    logic: [
      'Một hồ sơ công ty là gốc của mọi thứ bán được cho khách đó: báo giá, PO, hoá đơn, quota, tin tuyển dụng.',
      'Ba trạng thái công ty nằm trên cùng một mục menu, không phải ba trang.',
      'Quota khách đang giữ xem ở tab **Products & billing** trong chính hồ sơ này.',
    ],
    how: [
      '**Create company** → nhập **Tên pháp lý** và **MST** (hai field bắt buộc).',
      'Bổ sung địa chỉ đăng ký, người liên hệ, sales owner.',
      'Xác minh: khách nộp giấy tờ → duyệt ở **Company documents** → công ty thành **Verified**.',
      'Xem khách đã mua gì và còn bao nhiêu: mở công ty → tab **Products & billing**.',
      'Bán tiếp: từ trong hồ sơ công ty bấm **Create quotation**.',
    ],
    watch: [
      'MST trùng sẽ bị từ chối kèm link sang công ty đang giữ MST đó — mở công ty đó, đừng tạo bản thứ hai.',
      'Công ty chưa **Verified** thì không đăng tin được, dù đã có quota.',
    ],
  },
  pipeline: {
    logic: ['Bảng sáu cột theo chặng bán, kéo thả để chuyển chặng. Một thẻ mở ra chính **báo giá** của nó.'],
    how: ['Kéo thẻ sang cột mới khi cơ hội chuyển chặng.', 'Bấm thẻ để mở báo giá phía sau nó.'],
    watch: ['Không có bản ghi “deal” tách biệt để sửa — mọi nội dung nằm ở báo giá.'],
  },
  quotations: {
    logic: [
      'Một báo giá có **1–3 option**, khách chọn đúng **một**. Các option là phương án thay thế nhau, không cộng dồn.',
      'Mỗi dòng trong option trỏ vào một **Product** hoặc **Bundle** đã khai ở Products — không gõ tay tên sản phẩm.',
    ],
    how: [
      'Tạo từ hồ sơ công ty: mở công ty → **Create quotation** (đừng tạo trôi nổi).',
      'Thêm option, mỗi option thêm các dòng sản phẩm — tổng tiền tự tính.',
      'Gửi khách.',
      'Khách đồng ý → đánh dấu đúng option đó **Accepted**.',
      'Dựng **PO** từ chính option vừa Accepted.',
    ],
    watch: [
      'Chiết khấu tổng đơn ≤ 10% do Sales Leader duyệt, trên 10% phải chuyển Sales Manager.',
      'Dựng PO từ nhầm option là sai cả số tiền lẫn quota sẽ cấp.',
    ],
  },
  'purchase-order': {
    logic: [
      'PO là đơn đã cam kết, dựng từ đúng option khách đã chấp nhận. **PO chưa cấp quota.**',
      'Danh sách chỉ để đọc — không có nút tạo mới ở đây.',
    ],
    how: [
      'Mở PO từ báo giá có option Accepted.',
      'Kiểm nội dung PO.',
      'Trên trang chi tiết PO, **phát hành hoá đơn** từ PO này — đây là nơi hoá đơn được lập.',
    ],
    watch: ['PO đã duyệt mà khách vẫn không đăng tin được là **đúng** — quota chỉ vào khi hoá đơn Issued.'],
  },
  invoice: {
    logic: [
      'Phát hành hoá đơn (**Issued**) là hành động cấp quota cho công ty. Đây là mốc quan trọng nhất toàn hệ thống.',
      'Hoá đơn **không được soạn ở đây**: nó lập từ trang chi tiết PO, trang này chỉ khai báo và theo dõi.',
      'Quyền phát hành tách khỏi quyền đọc — thường chỉ kế toán có.',
    ],
    how: [
      'Mở hoá đơn đã lập từ PO.',
      'Kiểm thông tin xuất hoá đơn: tên đơn vị, MST, địa chỉ.',
      'Khai báo phát hành → tải PDF đã ký → gửi email cho khách (cả ba thao tác ở trang chi tiết).',
      'Kiểm lại: mở công ty → tab **Products & billing** xem quota đã vào chưa.',
    ],
    watch: [
      'Danh sách hoá đơn là **chỉ đọc**; không có “tạo hoá đơn mới”.',
      'Sau khi phát hành, mở lại hồ sơ công ty để xác nhận quota có thật — đừng tin mỗi thông báo thành công.',
    ],
  },
  'company-claims': {
    logic: ['Sales xin nhận một công ty đang nằm ở Free data. Yêu cầu đi qua **hai cấp duyệt** trước khi công ty về tay người xin.'],
    how: ['Sales gửi yêu cầu từ công ty trong Free data.', 'Cấp duyệt thứ nhất xử lý, rồi cấp thứ hai.', 'Duyệt xong công ty mới đổi chủ.'],
  },
  'sign-ups': {
    logic: [
      'Hộp thư của người tự đăng ký trên Company site. **Nộp form không tạo ra gì cả** — không công ty, không tài khoản đăng nhập, không sản phẩm.',
      'Người đăng ký chưa đăng nhập được cho tới khi admin xử lý dòng của họ.',
    ],
    how: [
      'Mở dòng đăng ký, đối chiếu tên công ty và MST với danh sách công ty đã có.',
      'Chọn một trong ba: **Move** (gắn vào công ty đã có) · **Create company & activate** (tạo công ty mới) · **Archive** (bỏ).',
      'Báo lại người đăng ký nếu bạn Archive — họ sẽ không đăng nhập được.',
    ],
    watch: ['Chỉ **Move** và **Create** mới mở được đăng nhập cho người đó.'],
  },
  'company-documents': {
    logic: [
      'Hai tab: **Documents** (giấy tờ xác minh khách nộp lên) và **Legal changes** (yêu cầu đổi thông tin pháp lý dùng để xuất hoá đơn).',
      'Cả hai sắp xếp cũ trước và có cùng hai thao tác duyệt/từ chối.',
    ],
    how: [
      'Mở tab **Documents** → đối chiếu giấy tờ với hồ sơ công ty → duyệt hoặc từ chối.',
      'Duyệt xong thì công ty mới chuyển được sang **Verified**.',
      'Tab **Legal changes** xử lý tương tự — nhưng đây là đổi thông tin in lên hoá đơn nên kiểm kỹ hơn.',
    ],
    watch: ['Duyệt nhầm Legal changes là sai thông tin hoá đơn VAT của khách — kiểm MST và tên pháp lý thật kỹ.'],
  },

  /* ── Content ─────────────────────────────────────────────────────────────── */
  displays: {
    logic: [
      'Banner và Popup là **hai tab** của trang này, không phải hai trang.',
      'Mỗi banner có nguồn **Sold** (khách mua, gắn PO) hoặc **House** (Saramin tự chạy). Banner nội bộ vẫn chiếm chỗ xoay vòng như banner bán.',
      'Cùng vòng đời Draft → Schedule → Open → Expired và cùng có **Exposure** riêng.',
    ],
    how: [
      'Chọn tab **Banners** hoặc **Popups**.',
      'Tạo mới bằng nút trên tab đó — form mở ra ở drawer bên phải.',
      'Banner bán: chọn công ty → PO → sản phẩm, rồi đặt ngày bắt đầu và tải ảnh.',
      'Banner nội bộ: chọn thẳng vị trí, tự đặt **cả hai** ngày, và ghi **mục đích**.',
      'Gỡ khỏi site mà không kết thúc booking: tắt **Exposure**.',
    ],
    watch: [
      'Ảnh phải đúng kích thước của vị trí — sai tỉ lệ sẽ bị từ chối khi lưu, không tự cắt.',
      'Banner Open mà Exposure Off thì không hiển thị — giống hệt cơ chế của tin tuyển dụng.',
    ],
  },
  collections: {
    logic: [
      'Một **collection** là bộ tin hoặc bộ công ty đã đặt tên và lưu lại, site công khai gọi theo slug.',
      'Đây là thứ mà một mục menu như “Korea” hay “Big company” thực chất trỏ vào.',
    ],
    how: ['**New collection** → đặt tên và slug → đặt bộ lọc → xem preview ngay bên cạnh.', 'Lưu. Sau đó gắn vào một mục menu hoặc một zone.'],
    watch: ['Sửa collection thì **mọi** menu và zone đang dùng nó đổi theo.'],
  },
  zones: {
    logic: ['Một **zone** (채용관) là trang chiến dịch có thương hiệu, có đường dẫn công khai riêng, ghép từ các collection.'],
    how: ['**New zone** → đặt slug → chọn các collection đổ vào từng khối → sắp thứ tự khối.', 'Xem preview thứ tự khối bên cạnh rồi lưu.'],
  },
  'site-navigation': {
    logic: ['Menu đầu trang jobseeker. Bốn tab tương ứng bốn vùng menu khác nhau; một tab là một vùng.'],
    how: ['Chọn vùng menu ở tab.', 'Thêm/sửa/sắp xếp mục. Mục có thể trỏ vào một collection.', 'Lưu — thay đổi lên site jobseeker.'],
  },
  'site-footer': {
    logic: ['Chân trang jobseeker: tab **settings** (phần chữ) và tab **groups** (các khối link). Hai phần lưu riêng nhau.'],
    how: ['Sửa phần chữ ở tab settings, lưu.', 'Sửa các khối link ở tab groups, lưu riêng.'],
  },
  pages: { logic: ['Trang tĩnh trên site jobseeker.'], how: ['Mở trang cần sửa → sửa nội dung → lưu.'] },
  boards: { logic: ['Bảng tin / thông báo trên site jobseeker.'], how: ['Tạo hoặc sửa bài trong bảng tin → lưu.'] },
  blog: { logic: ['Bài viết, blog trên site jobseeker.'], how: ['Tạo bài → viết nội dung → xuất bản.'] },

  /* ── System ──────────────────────────────────────────────────────────────── */
  departments: {
    logic: ['Cây phòng ban và thành viên. Một nút là một phòng ban gốc hoặc một team bên trong nó.'],
    how: ['Mở cây phòng ban.', 'Bấm một nút để mở trang của nó: thành viên, các team con, và vòng đời.', 'Bấm tên một người để sang trang tài khoản nhân viên đó.'],
  },
  users: {
    logic: ['Tài khoản **nhân viên Saramin**, khác hẳn tài khoản ứng viên (nhóm User) và tài khoản khách hàng (Company users).'],
    how: [
      'Lọc danh sách rồi bấm một dòng để mở trang của nhân viên đó.',
      'Menu trên dòng có: **Edit** · **Manage roles** (gán lại vai trò) · **Reset password** hoặc **Resend invite** (tuỳ trạng thái) · **Activate/Deactivate** · **Delete**.',
      'Tạo người mới: tạo tài khoản rồi gán vai trò — mời qua email, người đó tự đặt mật khẩu.',
    ],
    watch: ['Đổi vai trò của người đang đăng nhập thì họ phải đăng xuất vào lại mới thấy quyền mới.'],
  },
  roles: {
    logic: [
      'Quyền dạng `resource:action` kèm phạm vi `all` · `company` · `own`.',
      'Giao diện chỉ ẩn nút; chặn thật nằm ở server.',
      'Danh sách hiện: vai trò · số quyền · số người đang giữ · nguồn gốc.',
    ],
    how: [
      '**New role** → đặt tên và mô tả → tick quyền trên lưới theo từng trang → lưu một lần.',
      'Gần giống một vai trò có sẵn thì **Duplicate** rồi sửa, nhanh hơn làm lại từ đầu.',
      'Gán vai trò cho người: làm ở **Users**, không làm ở đây.',
    ],
    watch: ['Vai trò đang có người giữ thì không xoá được — gỡ người ra trước.'],
  },
  'general-settings': {
    logic: ['Một mục menu, mỗi tab một nhóm thiết lập. Hai tab cùng đọc một bản ghi ở server nhưng lưu riêng từng nửa: trọng số gợi ý việc, và tỉ giá USD→VND.'],
    how: ['Chọn tab cần sửa → đổi giá trị → lưu (chỉ nửa đó được lưu).'],
    watch: ['Tỉ giá ảnh hưởng tới cách hệ thống so sánh mức lương — đổi thì ảnh hưởng kết quả gợi ý việc.'],
  },
  'company-information': {
    logic: ['Pháp nhân **của chính Saramin** — bên phát hành hoá đơn. Một bản ghi duy nhất, là cấu hình chứ không phải danh sách.'],
    how: ['Sửa thông tin pháp nhân → lưu.', 'Có lịch sử thay đổi để tra lại.'],
    watch: ['Đây **không phải** hồ sơ khách hàng. Sai ở đây là sai trên mọi hoá đơn xuất ra.'],
  },
  'membership-tiers': {
    logic: ['Hạng thành viên của khách hàng.'],
    how: ['Mở một hạng để xem/sửa điều kiện và quyền lợi.'],
  },
  faq: {
    logic: ['Danh sách câu hỏi hiển thị trên site công khai. Mỗi tab là một vùng hiển thị; hiện mới có một vùng.'],
    how: ['Chọn vùng ở tab → thêm/sửa/sắp xếp câu hỏi → lưu.'],
  },
  'master-data': {
    logic: [
      'Dữ liệu danh mục dùng chung toàn hệ thống: ngành nghề, kỹ năng, cấp bậc, khu vực.',
      'Mỗi tab một nhóm và **mỗi nhóm có quyền riêng**.',
      'Có tab riêng cho **khu vực** và cho **kỹ năng còn thiếu** (từ khoá người dùng tìm mà danh mục chưa có).',
    ],
    how: [
      'Chọn tab của nhóm cần sửa.',
      'Thêm giá trị mới, hoặc gắn alias cho giá trị đã có.',
      'Tab **kỹ năng còn thiếu**: xử lý từ khoá do trang Search quality đẩy sang.',
    ],
    watch: ['Thiếu quyền một tab thì chỉ tab đó trống — không phải cả trang hỏng.'],
  },
  'audit-log': {
    logic: ['Nhật ký thao tác chạm dữ liệu nhạy cảm: mở hồ sơ ứng viên, xuất dữ liệu, phát hành hoá đơn.'],
    how: [
      'Lọc theo hành động, loại đối tượng, người thực hiện, mã đối tượng, hoặc khoảng ngày.',
      'Cần đưa ra ngoài: **xuất CSV** đúng bộ lọc đang xem.',
    ],
    watch: ['Đây là nơi tra khi có khiếu nại “ai đã xem/sửa cái này”.'],
  },
  notifications: {
    logic: ['Bốn tab: **Auto rules** (quy tắc tự gửi) · **Manual** (gửi tay) · **History** (đã gửi) · **Template** (mẫu tin).'],
    how: [
      'Tạo mẫu trước ở tab **Template** — mẫu mở ra trang riêng, có xem trước.',
      'Tạo quy tắc ở tab **Auto rules**: sự kiện nào thì gửi mẫu nào cho ai.',
      'Gửi một lần thì dùng tab **Manual**.',
      'Kiểm đã gửi hay chưa ở tab **History**.',
    ],
  },
  'zalo-templates': {
    logic: ['Ràng buộc mẫu Zalo ZNS theo từng hành động. Mẫu do Zalo duyệt; ở đây chỉ khai mã mẫu ứng với hành động nào.'],
    how: ['Mở hành động cần gắn → điền mã mẫu Zalo đã được duyệt → lưu.'],
    watch: ['Mẫu phải được Zalo duyệt trước; hệ thống không tạo mẫu hộ.'],
  },
  environment: {
    logic: ['Cờ bật/tắt tính năng. Tắt một cờ thì mục tương ứng biến mất khỏi menu của **mọi** người.'],
    how: ['Xem trạng thái cờ.', 'Đổi cờ chỉ khi có yêu cầu rõ ràng từ kỹ thuật.'],
    watch: ['Tắt nhầm một cờ trông hệt như hệ thống mất tính năng — kiểm chỗ này trước khi báo bug “trang biến mất”.'],
  },
}
