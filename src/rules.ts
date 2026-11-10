/*
 * Danh sách rules — the register of every rule the system runs on.
 *
 * WHY A SEPARATE PAGE. "Danh sách flow" answers *what happens, in what order*.
 * This answers *what is true, and who decided it*. The client asked for it after
 * a fortnight of the same question arriving three different ways on Slack: a rule
 * agreed in a meeting, written up in one place, built a fourth way, and nobody
 * able to point at a single line and say "this one".
 *
 * TWO KINDS OF RULE, AND BOTH BELONG HERE.
 *   nghiệp vụ — the two sides agreed it. Changing it means telling the client.
 *   as-built  — the code does it. Often never discussed with anyone, and still
 *               the thing CS meets every day, so leaving it out makes the
 *               register a half-truth.
 * A rule where both agree carries both marks. A rule where they DISAGREE is
 * marked `lech`, and the disagreement is stated in `conflict` rather than
 * smoothed over — an unresolved rule written as if settled is how the last
 * round of confusion started.
 *
 * SHAPE. One line per rule plus four or five lines of summary, enough to settle
 * an argument without opening anything else. The detail lives on the module's
 * Logic page (`group` + `heading` below), authored in pagedocs/rules-detail.ts,
 * so a rule is written once and the list only points at it.
 *
 * Sources: spec site (saramin-eta.vercel.app) · Slack #saramin_testing 07/09–10/11/2026 ·
 * svn-be 645398ad5 · svn-web 169a1803c · saramin-vn-admin e5d27825 (all origin/dev).
 */

export type RuleKind = 'nv' | 'ab' | 'both' | 'lech' | 'mo'

export interface RuleEntry {
  /** the rule, as one line */
  title: string
  /** four or five lines: enough to act on without opening the detail */
  summary: string
  kind: RuleKind
  /** stated only on `lech` — what the two sides each believe */
  conflict?: string
  /** module whose Logic page carries the detail */
  group: string
  /** the detail section's heading on that page — the anchor is derived from it */
  heading: string
  /** who decided it, and when */
  src: string
}

export interface RuleCat {
  title: string
  note?: string
  rules: RuleEntry[]
}

/** Same rule as App.tsx's own anchorId — a heading's words become its address. */
export function anchorId(text: string): string {
  const s = text
    .replace(/[*`§]/g, '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64)
    .replace(/-+$/, '')
  return /^\d/.test(s) ? `muc-${s}` : s
}

export const RULE_CATS: RuleCat[] = [
  {
    title: 'Vòng đời & trạng thái',
    note: 'Nhóm gây tranh cãi nhiều nhất. Gần như mọi câu hỏi “sao nó lại thế này” cuối cùng đều quy về một trong bảy vòng đời dưới đây.',
    rules: [
      {
        title: 'CV có bốn trạng thái, và chỉ con người mới chuyển được sang Rejected',
        summary:
          'Qualified · Not Enough Information · Cannot Read · Rejected. CV upload được kiểm hai bước theo thứ tự: đọc được file trước, đủ trường bắt buộc sau. Saramin CV thì luôn Qualified vì nút Lưu bị khoá cho tới khi điền đủ. Hệ thống chỉ **cảnh báo**, không bao giờ tự từ chối — chuyển sang Rejected là thao tác của Operator/CS. Ở phase này ứng viên không nhìn thấy trạng thái Not Enough Information.',
        kind: 'both', group: 'Resume management', heading: 'Rule — Bốn trạng thái CV và hai bước kiểm',
        src: 'BA chốt 16/10 · meeting 23/10 · build khớp',
      },
      {
        title: 'Đơn ứng tuyển có hai trục trạng thái, không phải một',
        summary:
          'CV status và Application status là hai thứ riêng, hiển thị riêng. Đơn chỉ tới được công ty **sau khi CV đã duyệt** — trước đó nó nằm ở Not Sent dù ứng viên đã bấm nộp. Trên Kanban của NTD, cột đầu và hai cột cuối cố định, các cột giữa NTD tự thêm bớt. Trạng thái Pipeline luôn đè lên Viewed/Saved: khi hồ sơ đã vào Pipeline thì NTD xem hay tải lại CV không làm đổi trạng thái nữa.',
        kind: 'both', group: 'Application management', heading: 'Rule — Hai trục trạng thái và thứ tự đè',
        src: 'meeting 09/10 · SRM-926',
      },
      {
        title: 'Tin tuyển dụng không còn hàng đợi duyệt',
        summary:
          'Draft · Scheduled · Open · Closed · Expired, cùng ba thao tác Reopen, Duplicate và Warranty. Luồng duyệt job **đã bị gỡ bỏ** từ 09/09: công ty tự publish là lên thẳng, và trạng thái Archived không còn tồn tại. `REVIEW` vẫn là một JobStatus và trang chi tiết vẫn render nút Approve/Reject, nhưng không còn luồng nào đẩy job vào đó — nhìn màn hình sẽ tưởng tính năng còn chạy.',
        kind: 'ab', group: 'Job management', heading: 'Rule — Vòng đời tin tuyển dụng và luồng duyệt đã gỡ',
        src: 'svn-be V468, 09/09',
      },
      {
        title: 'Tài khoản ứng viên: xoá là xoá mềm, 72 giờ sau mới xoá thật',
        summary:
          'Active · Deactivated · Deleted · Erased. Deactivate là **rút lui**, không phải xoá: tài khoản ngừng hoạt động và CV rời CV search ngay, nhưng đơn đã gửi vẫn ở lại phía NTD. Delete thì dòng tài khoản giữ vĩnh viễn để giữ chỗ địa chỉ email — email đó không bao giờ đăng ký lại được, kể cả qua Google hay Facebook. Chỉ HQ admin khôi phục được, và chỉ trong vòng 72 giờ.',
        kind: 'both', group: 'Users', heading: 'Rule — Bốn trạng thái tài khoản và cửa sổ 72 giờ',
        src: 'spec + svn-be',
      },
      {
        title: 'Công ty đã Verified thì NTD chỉ được xem',
        summary:
          'Not verified · Waiting to verify · Verified. Khách hàng chỉ sửa được thông tin công ty khi còn ở hai trạng thái đầu; một khi đã Verified thì mọi field chuyển sang chỉ đọc và chỉ Admin sửa được. Đây là rule hay bị hỏi lại nhất khi NTD gọi lên CS phàn nàn “tôi không sửa được tên công ty”.',
        kind: 'nv', group: 'CRM', heading: 'Rule — Ba trạng thái xác minh công ty',
        src: 'tran.nguyen chốt · nhắc lại 28/10',
      },
      {
        title: 'Chuỗi chứng từ CRM đi một chiều, không quay lại được',
        summary:
          'Quotation → PO → Invoice, mỗi bước tạo ra từ bước trước. Quotation chỉ sửa được khi **chưa** xuất PO; PO thì không cho sửa, và không có thao tác huỷ trên PO. Huỷ tác động lên chứng từ thuế chứ không lên đơn — huỷ invoice xong PO vẫn đọc là Issued invoice. PO hết hạn vào **cuối tháng**, không phải 30 ngày trượt: issued 05/07 và 28/07 cùng hết hạn 31/07.',
        kind: 'both', group: 'CRM', heading: 'Rule — Chuỗi chứng từ và các mốc hết hạn',
        src: '12/10 · crm4 · build khớp',
      },
      {
        title: 'Overdue tính từ lúc xuất hoá đơn chính thức, không từ Expected payment date',
        summary:
          'Unpaid · Partially paid · Paid · Overdue · Expired. PO phải xuất hoá đơn chính thức rồi mới có Overdue, sau đó Unpaid đủ 30 ngày mới chuyển. PO chưa xuất hoá đơn thì cuối tháng tự expire. **Expected payment date chỉ báo ngày mã QR hết hạn** — không dùng để tính Overdue. Rule này đã đổi ba lần trong bảy ngày đầu tháng 11 trước khi quay về đúng bản cũ.',
        kind: 'both', group: 'CRM', heading: 'Rule — Khi nào PO và hoá đơn chuyển Overdue',
        src: 'chốt lại 04/11 (chị Trân) · SRM-1080 · build khớp',
      },
    ],
  },
  {
    title: 'Tiền & quota',
    rules: [
      {
        title: 'Quota chỉ vào ví khi admin xác nhận đã nhận tiền',
        summary:
          'Không phải lúc công ty bấm mua. Thấy Credits = 0 ngay sau khi đặt mua thường là đơn còn chờ thanh toán, không phải lỗi ví — nên màn hình số dư phải hiện **trạng thái đơn** bên cạnh con số, nếu không người vừa trả tiền sẽ tưởng mất tiền. Chỉ hoá đơn GTGT ở trạng thái Issued mới cấp quota; báo giá được chấp nhận hay PO đã tạo đều chưa cấp gì.',
        kind: 'ab', group: 'Product settings', heading: 'Rule — Quota vào ví ở thời điểm nào',
        src: 'svn-be CV_UNLOCK_AND_QUOTA',
      },
      {
        title: 'Một lần unlock trừ đúng 1 quota, và mở lại cùng một CV không trừ lần hai',
        summary:
          'Giá mở khoá cố định bằng CHECK trong DB, không thay đổi theo CV. Thao tác idempotent theo cặp (CV, công ty): bấm nhiều lần hay hai tab cùng bấm đều chỉ trừ một lần. Admin mở khoá hộ thì tiêu credit của **công ty được chọn**, không phải của admin — admin không có số dư. Thiếu số dư trả 409.',
        kind: 'ab', group: 'Resume management', heading: 'Rule — Một unlock trừ bao nhiêu, và trừ của ai',
        src: 'svn-be · admin resumes',
      },
      {
        title: 'Gói CV search có hai mốc thời gian, tính từ hai thời điểm khác nhau',
        summary:
          'Activation period tính từ lúc **xuất hoá đơn**; Validity period tính từ lúc **activate gói**. Cả hai hết hạn vào cuối ngày 23:59. Ví dụ: xuất hoá đơn 9/11/2026 thì activation period là 9/11/2026–9/11/2027; activate ngày 9/11/2027 thì validity period là 9/11/2027–9/2/2028. Chỉ gói CV search có bước Activate; mọi sản phẩm khác không có.',
        kind: 'nv', group: 'Product settings', heading: 'Rule — Hai mốc thời gian của gói CV search',
        src: 'chốt 09/11',
      },
      {
        title: 'Chiết khấu trên 10% do Sales manager duyệt, từ 10% trở xuống do Sales lead',
        summary:
          'Ngưỡng cấu hình là 10. Hệ thống chỉ có **một VAT rate duy nhất** — không có Mixed VAT — và không có trường hợp báo giá chỉ gồm sản phẩm quà tặng. Luồng 0 đồng vẫn chạy đầy đủ: vẫn tạo PO và Invoice 0 đồng, vẫn có bước confirm payment 0 đồng. Chỉ Sales owner của công ty mới được tạo báo giá và xuất PO.',
        kind: 'nv', group: 'CRM', heading: 'Rule — Ngưỡng duyệt chiết khấu, VAT và luồng 0 đồng',
        src: '01/10 · 23/09 · 26/10',
      },
      {
        title: 'Huỷ hoá đơn thì vô hiệu hoá quota, nhưng EasyInvoice không tự đổi theo',
        summary:
          'Theo nguyên tắc không cho huỷ hoá đơn đã xuất; nếu bất khả kháng thì quota bị inactive **ngay khi** huỷ. Trên CRM hoá đơn mang trạng thái Cancelled, nhưng bên EasyInvoice thì không được cập nhật — kế toán phải tự sang đó điều chỉnh theo nguyên tắc kế toán. Lý do: EasyInvoice không có thao tác huỷ, phải điều chỉnh hoặc thay thế, và số case thực tế rất ít.',
        kind: 'nv', group: 'CRM', heading: 'Rule — Huỷ hoá đơn, quota và EasyInvoice',
        src: 'tran.nguyen 06/11 · Thu 06/11',
      },
      {
        title: 'Share quota vẫn có trong build nhưng đang tạm ẩn',
        summary:
          'Rule đã thống nhất: chỉ cần trong setting có share quota với công ty thụ hưởng thì công ty đó được **toàn quyền** dùng các hoá đơn của công ty tài trợ. Nhưng phía khách yêu cầu ẩn bảng Share quota, bảng Shared with other Companies và checkbox Split usage by company ở phase này vì “chưa có rule, cần thời gian design lại”. Tính năng còn nguyên trong code, chỉ không hiện và không test.',
        kind: 'nv', group: 'Service delivery', heading: 'Rule — Share quota và lý do đang tạm ẩn',
        src: 'Minh Hoa 27/10',
      },
    ],
  },
  {
    title: 'Hiển thị & xếp hạng',
    rules: [
      {
        title: 'Posting ladder: số rank lớn nhất đứng trên cùng',
        summary:
          'Ladder rank quyết định job của sản phẩm nào hiển thị trên sản phẩm nào — Top Job trên Distinction, Distinction trên Basic plus, và cứ thế. Áp dụng ở Job search results và các trang Jobs by category / industry / location. Thao tác “Respace the ladder” tính lại số thứ tự cho chẵn (7, 8, 10 thành 10, 20, 30) và **ghi giá trị mới ngược lại vào Product**, chứ không chỉ đổi cách hiển thị.',
        kind: 'nv', group: 'Job management', heading: 'Rule — Posting ladder và thao tác Respace',
        src: 'Thu 24/09',
      },
      {
        title: 'Placement quyết định job lên chỗ nào, và Premium chỉ nhận job trong 10 ngày đầu',
        summary:
          'Job basic có lên trang chủ hay không hoàn toàn phụ thuộc placement đã set cho product đó. Section Premium jobs chỉ hiển thị job trong **10 ngày đầu** kể từ khi đăng — nên với dữ liệu cũ, section sẽ trông như thiếu job dù job vẫn còn hiệu lực. Block Recommended job khi chưa đăng nhập cũng là một placement lấy từ Products, không phải thuật toán gợi ý.',
        kind: 'nv', group: 'Product settings', heading: 'Rule — Placement, Premium 10 ngày và khối Recommended',
        src: '27/10 · 05/11',
      },
      {
        title: 'Banner: số lượng upload không giới hạn, số slide hiển thị thì có',
        summary:
          'Hai cột dễ nhầm. **ITEMS SHOWN** là số banner có thể upload — không giới hạn, với mọi loại banner. **NUMBER OF SLIDES** là số banner hiển thị cùng lúc; hết lượt thì rotation đẩy ảnh ở hàng chờ lên. Mỗi vùng còn có `concurrentSlots` (NULL đọc là 1) và `rotationSeconds`. Kích thước banner lấy trực tiếp từ Admin ▸ System ▸ Placements, **không** theo tài liệu hướng dẫn.',
        kind: 'both', group: 'Content', heading: 'Rule — Giới hạn banner và cách rotation chạy',
        src: '30/10 · 02/10 · build khớp',
      },
      {
        title: '“Các công việc tương tự” và “Gợi ý việc làm” không bao giờ trùng nhau',
        summary:
          'Mục đầu là job giống job đang xem; mục sau là job liên quan đến CV của ứng viên. Ưu tiên hiển thị mục đầu theo logic của nó, và job nào đã hiện ở đó thì **không hiện lại** ở mục sau. Nếu đổi “Các công việc tương tự” thành “Việc làm cùng công ty” thì phải biết: mục đầu luôn có job để hiện, còn “cùng công ty” mà ít hơn 3 job thì không hiển thị gì cả.',
        kind: 'nv', group: 'Job management', heading: 'Rule — Hai khối gợi ý job và quy tắc không trùng',
        src: 'Thu 10/10 · 13/10',
      },
      {
        title: 'Search box lấy 2 + 2 + 2, thiếu thì bù cho đủ 6',
        summary:
          'Hai kết quả từ Master data (Job categories), hai từ Công ty, hai từ Jobs; group nào thiếu thì bù từ group khác cho đủ sáu, xếp theo độ phù hợp với từ khoá. Nếu từ khoá **không khớp** master data thì tắt hẳn popup gợi ý — không hiện dòng “No suggestions”, vì nó làm người dùng tưởng không có kết quả tìm kiếm. Đây cũng là cách Saramin Hàn đang làm.',
        kind: 'nv', group: 'Job management', heading: 'Rule — Nguồn gợi ý của ô tìm kiếm',
        src: 'Thu 23/10 · 28/10',
      },
    ],
  },
  {
    title: 'Matching & gợi ý',
    note: 'Nhóm yếu nhất. Phần lớn logic đã hứa nhưng chưa được viết ra, và đang chờ master data để test trên dữ liệu thật.',
    rules: [
      {
        title: 'Recommend job theo profile, recommend ứng viên theo job — logic chưa có',
        summary:
          '“Tin tuyển dụng phù hợp” là gợi ý dựa trên **profile** của user; kết quả tìm kiếm ở trang chủ thì không liên quan profile. Nhưng đến 04/11 phía BB xác nhận khu vực recommend ứng viên “đang chưa có logic”. Hai điều kiện để hoàn thiện: data migration (đã xong) và master data job category / industry (đang chờ khách). Đây là rule phải chốt trước khi đánh giá chất lượng gợi ý.',
        kind: 'mo', group: 'Resume management', heading: 'Rule — Gợi ý job và gợi ý ứng viên',
        src: 'Thu 27/10, 04/11 — quá hạn tự hứa',
      },
      {
        title: 'Match score: một cổng cứng, rồi mới tới thang 0–100 có trọng số',
        summary:
          'Mô hình đã đề xuất trong spec: lọc qua một điều kiện bắt buộc trước, phần còn lại chấm theo trọng số. Hai phía nhìn thấy hai thứ khác nhau — ứng viên và NTD không đọc cùng một con số. Skill gợi ý khi tạo job và tạo CV lấy theo **Job category cấp 3**. Từ khoá khớp các trường theo thứ hạng chứ không ngang nhau, và có những trường chỉ dùng để lọc, không bao giờ đánh index.',
        kind: 'nv', group: 'Resume management', heading: 'Rule — Mô hình match score và nguồn skill gợi ý',
        src: 'spec resume-management · 20/10',
      },
      {
        title: '% match giữa CV và JD là Phase 2, và `null` không phải 0',
        summary:
          'Con số phần trăm trên màn hình apply **chưa làm trong phase 1**. Ở phía Admin, `matchScore: null` nghĩa là tin tuyển dụng không nêu yêu cầu nào để chấm — không phải “khớp 0%”, và hiển thị nhầm thành 0 là sai nghiêm trọng vì nó biến một hồ sơ chưa chấm thành một hồ sơ bị loại.',
        kind: 'both', group: 'Application management', heading: 'Rule — Phần trăm khớp và ý nghĩa của null',
        src: 'Thu 29/09 · admin applicants',
      },
    ],
  },
  {
    title: 'Phân quyền & phạm vi dữ liệu',
    rules: [
      {
        title: 'Quyền cấp theo từng trang Admin, không phải cây checkbox',
        summary:
          'Một role là tập quyền trên các trang của console, dựng từ một bộ permission ngắn. Có thứ tự bắt buộc khi setup: phòng ban trước, người sau, role sau cùng. Role do team quản lý chứ không tập trung một đầu mối. Mã role bất biến sau khi tạo — sinh từ tên, cắt xuống 64 ký tự, hậu tố chống trùng nằm trong giới hạn đó.',
        kind: 'both', group: 'Organisation', heading: 'Rule — Mô hình quyền theo trang',
        src: 'spec admin-access · admin roles',
      },
      {
        title: 'Không ai cấp được quyền mà chính mình không có',
        summary:
          'Kiểm theo từng tuple, vi phạm trả 403. Tương tự, không gán được role chứa quyền mình không có — nhưng chỉ xét trên các role **được thêm**, nên gỡ bớt role của người có quyền cao hơn mình vẫn làm được. Quyền phạm vi company hoặc own không gán được cho role GLOBAL. Xoá role thì cascade quyền của nó nhưng **không** cascade người đang giữ, nên còn người giữ là chặn.',
        kind: 'ab', group: 'Organisation', heading: 'Rule — Trần quyền khi cấp và khi gán',
        src: 'svn-be · admin roles · V101',
      },
      {
        title: 'Không có quyền thì ẩn khỏi giao diện, không báo lỗi',
        summary:
          'Áp dụng cho cả nút lẫn cả trang: user được set quyền nào thì chỉ nhìn thấy quyền đó. Trước đây hệ thống vẫn hiện nút rồi báo lỗi permission khi bấm, gây nhầm lẫn — đã đổi và push lên dev ngày 23/10. Riêng màn Applications gác bằng quyền **job**, không phải `application`; Approve/Reject gác bằng `cv_review:decide`, Recall bằng `cv_review:recall` ở phạm vi all.',
        kind: 'both', group: 'Organisation', heading: 'Rule — Ẩn thay vì báo lỗi, và quyền của màn Applications',
        src: 'Minh Hoa 23/10 · admin applicants',
      },
      {
        title: 'Data reach quyết định ai nhìn thấy công ty nào — và đang được đề xuất bỏ',
        summary:
          'Sale member chỉ thấy công ty của mình, Sale leader thấy cả team, Sale manager thấy tất cả. Phạm vi này quyết định luôn ai tạo được báo giá cho công ty nào. Thu đã đề xuất **bỏ hẳn Data reach** vì console nay đã có bộ lọc Mine / My team / All và quyền tạo báo giá thì luôn thuộc về Sales owner — nhưng đề xuất này chưa được chốt, nên cả hai cơ chế vẫn đang tồn tại song song.',
        kind: 'nv', group: 'Organisation', heading: 'Rule — Data reach và đề xuất bỏ nó',
        src: 'Thu 28/10 — đề xuất treo',
      },
      {
        title: 'Che thông tin liên hệ làm ở server, không ở client',
        summary:
          'Caller phạm vi global nhận dữ liệu thật; caller phạm vi company hoặc own bị che ở **server**, bất kể client làm gì — nên không có cách nào xem trộm bằng devtools. Khi CV chưa unlock thì `fullName` trả về `null` chứ không phải chuỗi che kiểu `N***** T** H**`; màn hình hiển thị `Ứng viên #{alias}`. Trạng thái khoá chỉ đọc từ cờ `unlocked`, không suy ra từ việc thiếu field.',
        kind: 'ab', group: 'Resume management', heading: 'Rule — Che thông tin liên hệ và cờ unlocked',
        src: 'svn-be ResumeContactGate · CV_UNLOCK_AND_QUOTA',
      },
    ],
  },
  {
    title: 'Master data',
    rules: [
      {
        title: 'Code chỉ cần không trùng trong cùng một cấp cha',
        summary:
          'Level 1 và Level 2 trùng code là hợp lệ, vì chúng là hai cấp khác nhau. Code là bắt buộc — nó là ID để map dữ liệu — nhưng hệ thống **tự sinh từ Name_EN**, nên màn hình bắt nhập tay là bug. Không phải tab nào trong Master data cũng có Import/Export Excel: tab ít giá trị hoặc nhiều cấp thì sửa trực tiếp nhanh hơn. Làm kỹ phần import cho Job Taxonomy và Industries.',
        kind: 'nv', group: 'System', heading: 'Rule — Quy tắc Code và phạm vi trùng',
        src: '19/10 · 22/10',
      },
      {
        title: 'File import: để trống Code là tạo mới, điền Code là cập nhật bản cũ',
        summary:
          'Mục mới thì để trống cả Group Code lẫn Item Code, hệ thống tự tạo. Dùng code của Group cũ nhưng đổi tên thì hệ thống hiểu là **đổi tên Group cũ**, không phải tạo nhóm mới — đây là chỗ dễ làm hỏng dữ liệu nhất. Import dòng trùng với dữ liệu đã có thì không tạo bản trùng, chỉ nhận ra là mục cũ và báo số lượng bị coi là trùng.',
        kind: 'nv', group: 'System', heading: 'Rule — Quy tắc file import Master data',
        src: 'Ngô Thái Nguyên 19/10',
      },
      {
        title: 'Chỉ còn tiếng Anh và tiếng Việt',
        summary:
          'Ngôn ngữ phía Jobseeker chỉ có hai, nên cột tiếng Hàn đã bỏ khỏi cả UI lẫn file import. Với mọi field nội dung: **VI bắt buộc, EN trống thì fallback về VI**. Riêng mô tả sản phẩm thì tiếng Việt bắt buộc, tiếng Anh không — nhưng mô tả EN lại là bắt buộc nếu muốn báo giá hiển thị song ngữ, nên thực tế vẫn nên điền.',
        kind: 'nv', group: 'System', heading: 'Rule — Ngôn ngữ của master data và nội dung',
        src: 'Thu 22/10 · 23/09',
      },
      {
        title: 'Job taxonomy là master data, không phải chữ tự gõ',
        summary:
          'Mỗi Job category có nhiều Job group cấp 2 gồm Job roles, Specializations, Work tools. Onboarding và Work preference cho user chọn hết các mục cấp 2, theo cách Saramin Hàn làm. Skills quản lý theo từng dòng Job category **cấp 3** để gợi ý được skill liên quan. Benefits cũng là danh sách chọn chứ không phải đoạn văn, và working location là một văn phòng có tên, lưu trên công ty.',
        kind: 'nv', group: 'System', heading: 'Rule — Cấu trúc taxonomy và các danh sách chọn',
        src: 'Thu 20/10 · spec job-management',
      },
    ],
  },
  {
    title: 'Giới hạn & validation',
    note: 'Nhóm QA cần nhất, và cũng là nhóm có nhiều con số bị ghi sai trong biên bản nhất.',
    rules: [
      {
        title: 'Mỗi ứng viên tối đa 20 Saramin CV và 20 Upload CV — tổng 40',
        summary:
          'Hai hạn mức **riêng biệt, mỗi loại 20**, không cộng gộp thành một con số chung. Tách riêng vì Phase 1 **không cho xoá CV** và **không chuyển đổi được** giữa hai loại. Chạm giới hạn của một loại thì ứng viên không tạo thêm loại đó được nữa mà phải **Edit** một CV cũ cùng loại. Trường hợp vượt ngưỡng là edge case để Phase 2.',
        kind: 'lech',
        conflict:
          'Rule Phase 1: 20 Saramin CV **và** 20 Upload CV. Build hiện tại: 20 Saramin CV (migration V806), còn thư viện CV tải lên **không giới hạn** sau khi hạn mức 10 file cũ bị gỡ (V315). Cần mở task thêm lại hạn mức 20 cho Upload CV trước go-live, và sửa dòng text đang ghi “không giới hạn” trên giao diện.',
        group: 'Resume management', heading: 'Rule — Giới hạn số CV và cách đếm',
        src: 'Phase 1 chốt 04/11 · tài liệu 10/11',
      },
      {
        title: 'Batch apply tối đa 5 job một lần',
        summary:
          'Theo Saramin Hàn. Khi ứng tuyển hàng loạt, email gợi ý việc làm gửi sau đó lấy theo **job cuối cùng được chọn**, tối đa 4 job, có loại trừ job đã ứng tuyển và tin đã hết hạn; không đủ việc phù hợp thì ẩn cả khối chứ không hiện số ít hơn.',
        kind: 'nv', group: 'Application management', heading: 'Rule — Giới hạn ứng tuyển hàng loạt',
        src: 'Thu 05/11 · Danh Đinh 10/11',
      },
      {
        title: 'Job title 120 ký tự, job level chọn tối đa 3',
        summary:
          'Tiêu đề dài quá 120 ký tự thì không hiển thị hết ở cả Job detail lẫn Job list, và Job detail chỉ hiện tối đa 3 dòng — nên không nên cho gõ dài hơn mức hiển thị được. Job level là multi-select, tối đa 3 giá trị. Dải lương một phía là hợp lệ: “Từ 15 triệu” là một tin đăng đúng. Đơn vị tiền có VND và USD, nhưng USD chỉ là đơn vị **hiển thị**.',
        kind: 'both', group: 'Job management', heading: 'Rule — Giới hạn trên form tin tuyển dụng',
        src: 'Thu 16/10 · SRM-736 · spec',
      },
      {
        title: 'Ảnh upload tối đa 20MB, hệ thống tự chuyển WebP',
        summary:
          'Không cần resize trước khi upload. Hệ thống tự chuyển sang WebP cho nhẹ, kể cả ảnh nhỏ, nên hiển thị nhanh mà không vỡ. Riêng FAQ ở Company information thì **không** chèn được ảnh hay bảng — theo Saramin Hàn, đó là dạng hỏi đáp nhanh cần text gọn, khác Help center trên trang jobseeker vốn là dạng bài viết.',
        kind: 'both', group: 'Content', heading: 'Rule — Giới hạn ảnh và nơi được chèn ảnh',
        src: 'Văn Thương Đào 28/10 · Thu 09/11',
      },
      {
        title: 'Tổng số năm kinh nghiệm: mặc định loại bỏ khoảng thời gian trùng',
        summary:
          'Tính cả tháng bắt đầu và tháng kết thúc; “Present” tính đến tháng hiện tại. Có tick “Exclude overlapping periods” (mặc định) thì khoảng trùng chỉ tính một lần; bỏ tick thì cộng dồn. Khoảng thời gian ghi ngược như “2014 – 2012” bị coi là không hợp lệ và **bỏ qua cả job đó**. Saramin CV cho chọn nhập trực tiếp hay tự động tính; CV upload thì luôn tự động tính.',
        kind: 'both', group: 'Resume management', heading: 'Rule — Cách tính tổng số năm kinh nghiệm',
        src: 'Ngô Thái Nguyên 28/10, 03/11',
      },
      {
        title: 'Bài test tính cách: một tháng một lần, và dữ liệu nằm bên Hàn',
        summary:
          'Mã test do Saramin Hàn Quốc cấp, mỗi tài khoản một mã. Muốn làm lại phải cấp mã khác, mà mã khác thì coi như chưa từng làm bài — nên **lịch sử bài test cũ không còn hiển thị**. Ngày làm bài cũng lấy từ DB phía Hàn, không chỉnh được từ phía mình, kể cả để test. Muốn làm nhiều lần mà vẫn giữ lịch sử thì phải hỏi team Saramin Hàn xem có tài liệu không.',
        kind: 'nv', group: 'Resume management', heading: 'Rule — Bài test tính cách và giới hạn một tháng',
        src: 'Long Nguyen 16/10',
      },
    ],
  },
  {
    title: 'Thông báo & email',
    rules: [
      {
        title: 'Không gửi email lẻ mỗi lần đổi trạng thái — chỉ một bản tổng hợp cuối tuần',
        summary:
          'Ứng viên nhận **một** email tổng hợp mỗi tuần, gồm bốn nhóm: Đã gửi đến NTD, NTD đã lưu, Đang xử lý, Không phù hợp. Trang “Việc đã ứng tuyển” thì cập nhật real-time. Tiêu đề email xác nhận ứng tuyển giữ là “Bạn đã ứng tuyển thành công”, **không** dùng “Hồ sơ đã được gửi đến Nhà tuyển dụng”, vì hồ sơ có thể còn đang chờ kiểm duyệt CV.',
        kind: 'nv', group: 'Notifications', heading: 'Rule — Nhịp gửi email cho ứng viên',
        src: 'meeting 09/10 · Danh Đinh 09/11',
      },
      {
        title: 'Một rule chỉ thêm kênh, không tắt được in-app feed',
        summary:
          'Backend luôn ghi vào feed trong ứng dụng; rule thông báo chỉ có quyền **thêm** kênh gửi, không có quyền tắt kênh nào. Gửi thủ công thì chỉ hỗ trợ EMAIL — ba kênh còn lại trả 400. Event code là contract của backend, không còn catalog sự kiện trên Admin để sửa. Mỗi event cố định một loại người nhận: Jobseeker, Company hoặc Admin.',
        kind: 'ab', group: 'Notifications', heading: 'Rule — Rule thông báo thêm được gì và không tắt được gì',
        src: 'admin notifications · svn-be V418',
      },
      {
        title: 'Email báo ứng viên xoá tài khoản không tắt được',
        summary:
          'Gửi cho **mọi công ty đang giữ dữ liệu** của ứng viên: công ty mà HQ đã gửi đơn tới, và công ty có lượt unlock CV còn hiệu lực. Trong mỗi công ty, người nhận là mọi thành viên có quyền quản lý ứng viên. Operator sửa được nội dung trong catalogue template nhưng **không tắt được** — đây không phải workflow rule mà là nghĩa vụ pháp lý. Một email cho mỗi công ty, không bao giờ gửi hai lần.',
        kind: 'ab', group: 'Notifications', heading: 'Rule — Email thông báo xoá tài khoản',
        src: 'svn-be §5b',
      },
      {
        title: 'Bell không bao giờ deep-link tới hồ sơ ứng viên',
        summary:
          'Các dòng thông báo loại xoá tài khoản và xoá CV trỏ tới đơn đã rời board hoặc đã bị ẩn danh, nên chỉ link về board chứ không mở modal ứng viên. Các dòng “có đơn mới” cũ của cùng ứng viên vẫn giữ chỗ nhưng **mất tên** kể từ thời điểm xoá, không phải sau 72 giờ. HQ khôi phục tài khoản cũng không trả lại tên cho các dòng cũ.',
        kind: 'ab', group: 'Notifications', heading: 'Rule — Hành vi của chuông thông báo sau khi xoá',
        src: 'svn-be §5b',
      },
      {
        title: '“English Below” luôn hiển thị sẵn, và xưng hô dùng một format duy nhất',
        summary:
          'Thiết kế Figma để phần tiếng Anh dạng thu gọn mở rộng, nhưng Gmail chặn tương tác đó nên nút sẽ không hoạt động. Vì vậy phần tiếng Anh **luôn nằm sẵn** bên dưới phần tiếng Việt, nhãn “English Below” chỉ là đường phân cách. Áp dụng cho tất cả email ứng viên và nhà tuyển dụng. Xưng hô: “Dear Quý khách hàng & Tên công ty (full legal name)”, dù gửi một hay nhiều địa chỉ.',
        kind: 'nv', group: 'Notifications', heading: 'Rule — Song ngữ và xưng hô trong email',
        src: 'Danh Đinh 10/11 · Minh Hoa 09/11',
      },
    ],
  },
  {
    title: 'Pháp lý & dữ liệu cá nhân',
    note: 'Nhóm chưa ai viết thành tài liệu, và đang chặn quyết định về xoá CV.',
    rules: [
      {
        title: 'Nền pháp lý: policy 09-21, Luật BVDLCN 2025 và Nghị định 356/2025',
        summary:
          'Mục c của policy 09-21 quy định cách xử lý khi ứng viên yêu cầu rút đơn, xoá CV hoặc xoá tài khoản — và chính mục này đang mâu thuẫn với hướng xử lý mà hai bên bàn hồi đầu tháng 11. Nghị định 356/2025 đặt thời hạn xử lý yêu cầu xoá dữ liệu là **20 ngày**. Các điều cần Legal phía khách xác nhận: Điều 25.1, Điều 14, Điều 10 của Luật, và Điều 5.2, 5.4, Điều 6 của Nghị định.',
        kind: 'nv', group: 'Users', heading: 'Rule — Nền pháp lý cho xoá dữ liệu cá nhân',
        src: 'policy KH · BB rà soát 05/11',
      },
      {
        title: 'Xoá tài khoản là cửa một chiều, và email không bao giờ dùng lại được',
        summary:
          'Dòng tài khoản giữ vĩnh viễn — đó chính là thứ giữ chỗ địa chỉ email. Sau **72 giờ** một job quét chạy mỗi 5 phút sẽ xoá dữ liệu cá nhân: hồ sơ, mọi CV đã parse, thư viện CV và file, câu trả lời onboarding, lịch sử duyệt web, và cả ghi chú mà công ty viết **về** người đó. Khôi phục chỉ làm được trong 72 giờ đó và chỉ HQ admin mới làm được.',
        kind: 'ab', group: 'Users', heading: 'Rule — Xoá tài khoản, cửa sổ khôi phục và lần quét xoá',
        src: 'svn-be CANDIDATE_ACCOUNT_DELETION',
      },
      {
        title: 'Xoá tài khoản: NTD mất quyền xem CV, nhưng đơn KHÔNG bị rút',
        summary:
          'Tài khoản vô hiệu hoá ngay. NTD **không còn xem được CV** — kể cả CV trong đơn đã nộp và CV đã trả tiền mở khoá — và **mất lượt quota** đã dùng để unlock, điều này đã được chấp nhận. Nhưng **đơn ứng tuyển không bị rút**: dòng ứng tuyển chuyển sang UI *“Tài khoản đã bị xóa”*. NTD nhận email **CO 11**, ứng viên nhận **JS 8**, và dữ liệu cá nhân bị xoá vĩnh viễn sau **72 giờ**.',
        kind: 'lech',
        conflict:
          'Build đang **tự rút đơn đang xử lý** và cho đơn rời board, còn đơn đã kết thúc thì ẩn danh — ngược với quyết định Phase 1 là giữ đơn và hiện *“Tài khoản đã bị xóa”*. Ngoài ra nội dung email **JS 8** hiện vẫn còn câu “Các đơn ứng tuyển bạn đã thực hiện đã được rút lại”, cần sửa theo quyết định 04/11.',
        group: 'Users', heading: 'Rule — Công ty thấy gì sau khi ứng viên xoá tài khoản',
        src: 'Phase 1 chốt 04/11 · luồng ghi nhận 06/11 · svn-be §5',
      },
      {
        title: 'Phase 1: ứng viên không xoá được CV',
        summary:
          'Chốt ngày **04/11/2026** bởi Saramin VN. Ứng viên chỉ **Edit**, **Download** và **bật / tắt hiển thị**; nút Delete bị ẩn trên cả hai loại CV. Lý do: hệ thống Saramin hiện tại cũng không cho xoá, giữ nguyên Policy để khỏi phải sửa trước go-live, và tránh làm mất đơn ứng tuyển cùng CV nhà tuyển dụng đã trả tiền mở khoá. Vì vậy **đơn ứng tuyển, Talent Pool và CV đã unlock không bao giờ bị ảnh hưởng bởi thao tác xoá CV**. Mọi mở rộng để Phase 2.',
        kind: 'lech',
        conflict:
          'Build vẫn còn đường xoá CV, và nó **rút các đơn đã nộp bằng CV đó** rồi gửi email yêu cầu công ty xoá dữ liệu — đúng với policy 09-21 nhưng ngược với quyết định Phase 1. Trước go-live 21/11 cần ẩn nút Delete và chặn cả endpoint, nếu không một thao tác không còn được phép vẫn rút được đơn thật.',
        group: 'Resume management', heading: 'Rule — Phase 1 không cho xoá CV',
        src: 'Phase 1 chốt 04/11 · tài liệu 10/11 · svn-be §5c',
      },
    ],
  },
  {
    title: 'Tích hợp bên thứ ba',
    rules: [
      {
        title: 'Zalo OTP chỉ gửi qua số điện thoại, không còn kênh email',
        summary:
          'Kênh EMAIL và cơ chế dự phòng “gửi mail khi SMS không tới” đã bị gỡ. Tài khoản không có số trên hồ sơ thì không lấy được mã; không có nhà cung cấp Zalo thì trả 503. Mã sống 180 giây, gửi lại được sau 60 giây. Mọi ứng viên đều phải xác thực số điện thoại qua Zalo, **kể cả người nước ngoài** — checkbox “I live abroad” đã bỏ, và email thì không verify.',
        kind: 'both', group: 'Users', heading: 'Rule — Xác thực qua Zalo OTP',
        src: 'SRM-903 09/10 · Thu 09/10',
      },
      {
        title: 'Callio không có API để gọi điện',
        summary:
          'Không có endpoint nào quay số, và `tel:` cố tình **không** dùng làm phương án dự phòng. Việc ghép cuộc gọi với công ty được thử lại ở mỗi lượt chiếu — 10 phút một lần, hoặc khi bấm Sync — nên một cuộc gọi chưa ghép được hôm nay có thể tự ghép sau khi contact được lưu. Archive đưa cuộc gọi ra khỏi hàng đợi khi đó không phải việc của sales.',
        kind: 'ab', group: 'CRM', heading: 'Rule — Giới hạn tích hợp Callio',
        src: 'admin calls · SRM-754',
      },
      {
        title: 'Verify mã số thuế — đang có hai phiên bản ngược nhau',
        summary:
          'Bản 01/10: bỏ verify phía company user, verify chỉ để **tham chiếu** trên Admin, thành công hay không đều không cản trở việc tạo công ty. Bản 02/11: Thu đề xuất ngược lại — bắt buộc kiểm tra và chỉ cho tạo khi kết quả là “Đang hoạt động”. Lý do bỏ ràng buộc hồi tháng 10 vẫn còn nguyên: công ty mới thành lập một hai ngày chưa có trên API tra cứu.',
        kind: 'lech',
        conflict:
          'Chốt 01/10 (Thu thống nhất với tran.nguyen) và đề xuất 02/11 (Thu) nói ngược nhau; tran.nguyen chưa confirm bản mới. Nếu siết lại thì phải có đường đi cho công ty mới thành lập, nếu không Admin sẽ bị chặn tạo công ty thật.',
        group: 'CRM', heading: 'Rule — Kiểm tra mã số thuế khi tạo công ty',
        src: '01/10 vs 02/11 — chưa chốt',
      },
    ],
  },
  {
    title: 'Nội dung & vận hành',
    rules: [
      {
        title: 'Nhiều khu vực đang set cứng theo Saramin Hàn',
        summary:
          'Section trên Employer home và các card ở giữa đều set cứng, follow Saramin Hàn; chỉ user đăng nhập bằng tài khoản Employer mới thấy. Footer của cả trang jobseeker lẫn trang employer cũng giữ theo thiết kế Saramin Hàn. Bảng màu lấy **trực tiếp từ CSS đang chạy trên saramin.co.kr** nên khớp 100%: Brand #2D67FF, Success #00BE4C, Warning #FF9A03, Error #FF5656, Info #02C6FF.',
        kind: 'nv', group: 'Content', heading: 'Rule — Những khu vực set cứng theo Saramin Hàn',
        src: 'Thu 26/10 · Danh Đinh 03/11',
      },
      {
        title: 'Trang Salary & Insight tạm ẩn, không xoá',
        summary:
          'Ẩn qua Content ▸ Navigation. Team phía khách sẽ thu thập dữ liệu rồi triển khai sau, và đã đề xuất vài event liên quan đến trang này. Cùng nhóm: dropdown phía jobseeker tạm ẩn “Salary Insight”, tắt “Quản lý hồ sơ” và bổ sung “test tính cách”. Trang tạo product động thì làm **sau** ngày launch 14/11, hiện set cứng trước.',
        kind: 'nv', group: 'Content', heading: 'Rule — Những trang đang tạm ẩn ở phase này',
        src: 'Danh Đinh 02/11, 10/11 · Thu 26/10',
      },
      {
        title: 'Logo công ty phải crop sát bốn cạnh',
        summary:
          'Cách chỉnh logo sau khi upload đã đổi: phải crop sát trên dưới trái phải của logo, để khi hiển thị có thể canh giữa hay canh trái đều được. Một file, hai khung cố định, kích thước đã tinh chỉnh để đứng cạnh logo của công ty khác không bị lệch. Mục “Quy định” của doanh nghiệp chỉ hiện tên công ty và email tuyển dụng — field contact person và số điện thoại đã bỏ hẳn.',
        kind: 'nv', group: 'CRM', heading: 'Rule — Logo công ty và mục Quy định',
        src: 'Thu 01/11 · Danh Đinh 30/10',
      },
      {
        title: 'Nhiều màn hình của admin cũ cố tình không được port sang',
        summary:
          'Wizard 9 nhóm của AMS, bộ 52 field “meta wizard” của Saramin Hàn, pipeline AI giả, và các số liệu bịa ra từ hash — tất cả đã **bỏ hẳn chứ không stub**. Lý do ghi trong `docs/warnings.md` của repo admin. Hệ quả cần biết: sửa một job cũ qua form mới sẽ làm mất meta blob cũ mà job đó còn mang, và điều này được cảnh báo bằng banner trong drawer sửa chứ không giấu.',
        kind: 'ab', group: 'System', heading: 'Rule — Những gì cố tình không port từ admin cũ',
        src: 'admin docs/warnings.md · admin jobs',
      },
    ],
  },
  {
    title: 'Migrate dữ liệu',
    note: 'Chỉ chạy một lần, nhưng sai là hỏng dữ liệu thật của khách.',
    rules: [
      {
        title: 'Open to work của hệ thống cũ map sang CV nào',
        summary:
          'Hệ thống cũ bật Open to work cho **cả tài khoản**; hệ thống mới thì ứng viên chọn từng CV. Quy tắc đã chốt: đang bật Open to work thì bật hiển thị cho **CV dùng để ứng tuyển gần nhất**; chưa từng ứng tuyển hoặc CV đó đã xoá thì lấy CV cập nhật gần nhất; không có CV nào thì coi như đang tắt. Đang tắt Open to work thì không bật CV nào.',
        kind: 'nv', group: 'Resume management', heading: 'Rule — Migrate Open to work sang chọn CV',
        src: 'Danh Đinh 23/10',
      },
      {
        title: 'CV chưa hoàn thiện sau migrate vẫn giữ lựa chọn hiển thị',
        summary:
          'Theo quy tắc mới, CV chỉ lên Talent pool khi đạt Qualified. CV được chọn mà sau migrate còn thiếu kinh nghiệm hoặc học vấn thì **vẫn giữ lựa chọn hiển thị** nhưng chưa lên Talent pool, cho tới khi ứng viên bổ sung đủ và được duyệt. Ứng viên đổi sang CV khác hoặc tắt hiển thị bất cứ lúc nào trong trang Quản lý CV.',
        kind: 'nv', group: 'Resume management', heading: 'Rule — CV chưa hoàn thiện sau khi migrate',
        src: 'Danh Đinh 23/10',
      },
      {
        title: 'Hệ thống cũ: jobseeker dùng SSO, nhưng DB vẫn còn tài khoản email + mật khẩu',
        summary:
          'Trên saramin.vn hiện tại, company có mật khẩu còn jobseeker đăng ký bằng social login nên không có mật khẩu. Nhưng trong database **vẫn có** một số user jobseeker đăng nhập bằng email và mật khẩu — số lượng ít, và vẫn phải test luồng reset password khi chuyển sang hệ thống mới. Cách tạo case test: đăng ký bằng social rồi dùng AMS set mật khẩu.',
        kind: 'nv', group: 'Users', heading: 'Rule — Migrate mật khẩu từ hệ thống cũ',
        src: 'Thu · Buu Pham 28/10',
      },
      {
        title: 'Bản Job category v1.2 và Industry bản 29/10 là bản chốt',
        summary:
          'Bản Job category v1.2 đã được duyệt thì giữ nguyên. Skills hiển thị cả hai cách: ưu tiên related skill trước, bên dưới là các skill còn lại trong danh sách. File Industry phải sửa **15 tên tiếng Anh dịch máy sai** từ tiếng Hàn trước khi import — ví dụ 여신 (cấp tín dụng) bị dịch thành “goddess”, 제지 (sản xuất giấy) thành “restraint”.',
        kind: 'nv', group: 'System', heading: 'Rule — Bản chốt của Job category và Industry',
        src: 'Huyền Bùi 27/10 · Danh Đinh 29/10',
      },
    ],
  },
]

export const RULE_COUNT = RULE_CATS.reduce((n, c) => n + c.rules.length, 0)
