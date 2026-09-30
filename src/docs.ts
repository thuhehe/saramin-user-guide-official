/*
 * Per-page and per-module guidance.
 *
 * TWO LEVELS, ON PURPOSE. A rule that governs one screen belongs on that screen;
 * a rule that governs five belongs once, above all five. Repeating "hoá đơn
 * Issued mới cấp quota" on Quotations, Purchase order and Invoice would be three
 * places to update and two chances to disagree — so the module carries it and the
 * pages point at it.
 *
 * WHERE THE DEPTH COMES FROM. The admin repo's docs are written for whoever is
 * implementing a screen: terse about the commercial reasoning, precise about the
 * code. The REQUIREMENT spec (SARAMIN_REQUIREMENT/src/data/build/*.ts, ~14,900
 * lines) is the opposite — it is where the distinctions that cost money are
 * actually argued out, and it is what the client's own Notion tree names as the
 * source for its "Logic" pages. Module logic below is distilled from it; the
 * page-level `how` stays sourced from the build, because that is what the screens
 * actually do today.
 *
 * `logic` answers WHY the screen behaves as it does. `how` is the short path to a
 * finished job. `watch` is the trap: the thing that looks like a bug and is not,
 * or the mistake that is expensive to undo. An `open` block is a question with no
 * answer yet, and is never dressed up as a decision.
 */

export interface PageDoc {
  logic?: string[]
  how?: string[]
  watch?: string[]
  /* Deep blocks for a page whose logic does not fit in bullets — the same block
     vocabulary the module pages use. Rendered after `watch`, so the short answer
     still comes first for a reader who only needed that. */
  blocks?: DocBlock[]
}

/** A block of module logic. Tables carry the distinctions a bullet list flattens. */
export type DocBlock =
  | { kind: 'p'; text: string }
  | { kind: 'table'; heading?: string; note?: string; cols: string[]; rows: string[][] }
  | { kind: 'list'; heading?: string; items: string[] }
  | { kind: 'warn'; text: string }
  | { kind: 'open'; text: string }
  /* A worked example: one concrete case traced end to end. The requirement leans
     on these heavily and for good reason — a rule stated abstractly gets agreed
     to and then misapplied, while the same rule shown running on real dates and
     real numbers is a version the reader can check their own case against. */
  | { kind: 'example'; heading: string; scenario: string; cols: string[]; rows: string[][]; note?: string }

export interface ModuleDoc {
  /** shown as its own entry at the top of the module's menu */
  title: string
  lead: string
  /** the two or three facts that, unknown, produce a wrong outcome — read first */
  headline: string[]
  blocks: DocBlock[]
}

/* ── Module-level logic ─────────────────────────────────────────────────────── */

export const MODULE_DOCS: Record<string, ModuleDoc> = {
  CRM: {
    title: 'Logic chung — CRM',
    lead:
      'CRM là luồng bán: một chuỗi chứng từ nối tiếp, mỗi chứng từ chỉ dựng được từ chứng từ trước nó. Công ty → Báo giá → PO → Hoá đơn GTGT. Chỉ mắt xích cuối cùng mới đổi được quyền sử dụng của khách.',
    headline: [
      '**Chỉ hoá đơn GTGT CHÍNH THỨC mới cấp quota.** Hoá đơn nháp không cấp gì cả. PO đã duyệt, tiền đã về — vẫn chưa có gì.',
      '**PO và hoá đơn GTGT là hai chứng từ khác nhau, không phải hai tên của một thứ.** Gửi PO cho khách mà nói đó là hoá đơn là sai lầm đắt nhất ở đây: khách không kê khai VAT được.',
      '**Công ty có HAI trạng thái độc lập** — trạng thái pipeline và trạng thái khách hàng. Đừng nối chúng vào nhau.',
    ],
    blocks: [
      {
        kind: 'table',
        heading: 'Chuỗi chứng từ — ai tạo, tạo ở đâu, để lại gì',
        note: 'Mỗi bước dựng từ bước trước. Không nhảy cóc được, và cũng không nên.',
        cols: ['Bước', 'Tạo ở đâu', 'Ai làm', 'Để lại gì'],
        rows: [
          ['Công ty', 'CRM → Companies → Create company', 'Sales', 'Hồ sơ có MST, chờ xác minh'],
          ['Báo giá', 'Trong hồ sơ công ty → Create quotation', 'Sales', '1–3 option để khách chọn một'],
          ['PO', 'Từ option khách đã Accepted', 'Sales', 'Cam kết mua + yêu cầu thanh toán. **Chưa cấp quota**'],
          ['Hoá đơn GTGT', 'Trang chi tiết PO', 'Kế toán', 'Phát hành chính thức → **quota vào tài khoản ngay**'],
        ],
      },
      {
        kind: 'table',
        heading: 'Hai nút tạo, hai chỗ ở — và vì sao đặt vậy',
        note:
          'Hai nút tạo nằm ở hai chỗ khác nhau có chủ đích: một cái **lúc nào cũng hợp lệ**, cái kia **gần như không bao giờ**. Đặt mỗi nút ở nơi nó luôn có nghĩa thì không cần một nút xám phải tự đi giải thích tại sao nó bị khoá.',
        cols: ['Hành động', 'Nằm ở', 'Khi nào dùng được', 'Vì sao ở đó'],
        rows: [
          [
            'Tạo báo giá',
            'Header hồ sơ công ty (+ đầu danh sách Quotations)',
            '**Luôn luôn** — mọi công ty, mọi trạng thái',
            'Báo giá đầu cho khách mới, gia hạn cho khách cũ, kéo lại khách đã rời — cả ba đều hợp lệ. **Không có công ty nào mà mình không được phép báo giá.**',
          ],
          [
            'Tạo PO',
            'Đúng dòng báo giá đã được chấp nhận',
            'Chỉ khi báo giá có option Accepted và **chưa hết hiệu lực**',
            'PO chép **một** option đã chấp nhận sang. Báo giá đã accepted là ngữ cảnh duy nhất làm được điều đó, nên nút thuộc về chính nó.',
          ],
        ],
      },
      {
        kind: 'list',
        heading: 'Hệ quả của cách đặt nút đó',
        items: [
          'Header hồ sơ công ty vì vậy chỉ có **đúng một** nút tạo — Tạo báo giá. Không có nút “Tạo PO”, cũng không có nút “Chuyển thành khách hàng”: **hoá đơn** mới là thứ chuyển trạng thái, không phải một nút ai đó bấm trên hồ sơ.',
          'Mở Tạo báo giá **từ trong công ty** thì công ty được chọn sẵn; mở từ danh sách Quotations thì phải chọn công ty. Kiểu gì báo giá cũng gắn vào một công ty — **không bao giờ trôi nổi**.',
          'Form tạo PO **chép nguyên** option đã chấp nhận: dòng hàng (kể cả dòng tặng 0 ₫), số lượng, đơn giá, VAT, tổng sau VAT, cộng thông tin xuất hoá đơn đọc từ hồ sơ công ty — tên pháp lý, địa chỉ đăng ký, MST. **Không gõ lại gì cả**, vì đây chính là các giá trị mà hoá đơn điện tử sau này phải khớp.',
          'PO hỏi thêm thứ mà báo giá không có: **điều khoản thanh toán** (mặc định 100% trả trước) và **số PO của chính khách** kèm file, cho những khách có bộ phận mua hàng tự phát hành PO. Khách không có quy trình mua hàng thì chỉ cần xác nhận đơn mình gửi.',
          '**Báo giá đã hết hiệu lực thì không dựng PO được**, dù option đã accepted — phải gia hạn hiệu lực hoặc phát hành lại bản v2. Điều này chặn ở server, không phải chỉ ẩn nút.',
        ],
      },
      {
        kind: 'table',
        heading: 'PO và Hoá đơn GTGT khác nhau chỗ nào',
        note: 'PO nói “anh đã đồng ý mua, vui lòng thanh toán”. Hoá đơn nói “anh đã trả tiền, và đây là chứng từ cơ quan thuế công nhận”.',
        cols: ['', 'PO / Đơn hàng', 'Hoá đơn GTGT'],
        rows: [
          ['Bản chất', 'Chứng từ thương mại — cam kết + yêu cầu trả tiền', 'Chứng từ thuế — bằng chứng pháp lý một giao dịch chịu thuế đã xảy ra'],
          ['Ràng buộc giữa', 'Mình và khách', 'Mình và **cơ quan thuế**'],
          ['Đánh số', 'Dãy số của mình — PO-005864-08-2026', 'Số pháp lý do **nhà cung cấp hoá đơn điện tử cấp tự động** khi phát hành — **không ai gõ tay**. Mình vẫn giữ mã nội bộ INV-… cấp từ lúc nháp'],
          ['Sửa được?', 'Không — phát hành PO mới', '**Không bao giờ.** Và trên build hiện tại **không có nút Huỷ** — sai thì sửa trên cổng của nhà cung cấp hoá đơn điện tử'],
          ['Huỷ được?', 'Không — PO không dùng thì tự hết hiệu lực **cuối tháng**', '**Không có trong admin.** Đính chính thực hiện ngoài hệ thống, trên cổng nhà cung cấp'],
          ['Hết hạn', 'Cuối tháng phát hành', 'Không — đã phát hành là vĩnh viễn, trừ khi huỷ'],
          ['Ai sở hữu', 'Sales', '**Chỉ kế toán**'],
          ['Tác dụng', 'Deal = thắng', 'Chỉ bản CHÍNH THỨC: khách thành **New** · **cấp quota ngay** · bắt đầu đồng hồ kích hoạt. Bản nháp không có tác dụng gì'],
        ],
      },
      {
        kind: 'table',
        heading: 'Phát hành hoá đơn thì khách nhận được gì',
        note: 'Đây là mô tả “cấp quota” thực sự nghĩa là gì, theo từng dòng trên PO.',
        cols: ['Dòng trên PO', 'Cấp cái gì'],
        rows: [
          ['Dịch vụ tin đăng (Basic / Basic Plus / Premium) × N', '+N slot đăng tin ở đúng bậc đó'],
          ['Dịch vụ tin đăng … (Tặng) × N', '+N slot y hệt — dòng tặng 0 ₫ vẫn cấp quota như thường'],
          ['Dịch vụ tìm kiếm hồ sơ (30 / 90 ngày)', '+N lượt mở CV, kèm cửa sổ dùng 30 hoặc 90 ngày'],
          ['Employer Branding Page', 'Bật trang công ty công khai'],
          ['Lần mua đầu tiên', 'Tạo tài khoản · tạo login đầu tiên (HR Manager, đúng 1) · tạo trang công ty'],
        ],
      },
      {
        kind: 'list',
        heading: 'Cấp quota ≠ kích hoạt — hai sự kiện, hai đồng hồ',
        items: [
          '**Cấp quota:** quota vào tài khoản đúng lúc hoá đơn chính thức phát hành. Chưa có gì chạy cả.',
          '**Kích hoạt:** khách dùng một slot. Phải dùng trong cửa sổ khai trên chính sản phẩm đó — mặc định 12 tháng, tính **từ ngày hoá đơn**. Quá hạn thì quota chưa dùng **mất, không hoàn tiền**.',
          '**Sử dụng:** slot đã kích hoạt thì chạy 30 ngày.',
          'Nên khách mua 10 slot hôm nay, dùng 1 tuần sau và 1 sau tám tháng là hoàn toàn bình thường: cấp một lần cả 10, mỗi slot kích hoạt riêng và đốt cửa sổ riêng của nó.',
        ],
      },
      {
        kind: 'example',
        heading: 'Ví dụ chạy thật — một đơn hàng, ba đồng hồ',
        scenario:
          'Công ty Vạn Phát chốt mua **10 slot Top Job**. Sales dựng PO ngày **05/01/2026**, khách chuyển tiền ngày **12/01**, kế toán phát hành hoá đơn GTGT ngày **20/01/2026**. Sản phẩm Top Job khai cửa sổ kích hoạt **12 tháng**, thời lượng hiển thị **30 ngày**.',
        cols: ['Mốc', 'Ngày', 'Quota khách có', 'Vì sao'],
        rows: [
          ['Dựng PO', '05/01', '**0**', 'PO là cam kết, không cấp gì. Deal chuyển thành “thắng”, chỉ vậy thôi.'],
          ['Tiền về tài khoản', '12/01', '**0**', 'Thanh toán **không** phải sự kiện cấp quota. Khách gọi hỏi lúc này là đúng — và câu trả lời là “chờ kế toán phát hành hoá đơn”.'],
          ['Phát hành hoá đơn GTGT', '**20/01**', '**10 slot**', 'Đây là mốc duy nhất cấp quota. Cấp **ngay**, không hàng đợi, không bấm lần hai.'],
          ['Hạn phải kích hoạt', '**20/01/2027**', '—', 'Ngày hoá đơn + 12 tháng. Tính từ **ngày hoá đơn**, không phải ngày PO (05/01) và không phải ngày trả tiền (12/01) — lệch 15 ngày.'],
          ['Đăng tin thứ nhất', '03/02', '9 slot còn', 'Tin đó chạy 30 ngày, tới 05/03. Chín slot còn lại **vẫn đứng yên**, vẫn đếm tới 20/01/2027.'],
          ['Đăng tin thứ hai', '10/09', '8 slot còn', 'Tám tháng sau vẫn hợp lệ — vẫn trong cửa sổ 12 tháng.'],
          ['Tới hạn còn 3 slot chưa dùng', '20/01/2027', '**0**', 'Ba slot **hết hiệu lực, không hoàn tiền**. Khách đã trả tiền cho chúng.'],
        ],
        note:
          'Ba con số dễ bị lấy nhầm làm mốc bắt đầu: ngày PO, ngày tiền về, ngày hoá đơn. Chỉ **ngày hoá đơn** đúng. Lấy nhầm ngày PO là tính hạn sớm hơn thực tế 15 ngày, và đó là 15 ngày quota của khách.',
      },
      {
        kind: 'table',
        heading: 'Đánh số — hai loại mã, hai luật ngược nhau',
        note:
          'Mã **bản ghi** (công ty) phải **không đoán được**, vì nó sống lâu và dãy số sẽ để lộ mình có bao nhiêu khách. Mã **chứng từ** phải **liên tục và có ngày**, vì đó là thứ làm nó lưu trữ được, gọi điện đọc cho nhau được, và — với hoá đơn GTGT — hợp pháp.',
        cols: ['Loại', 'Định dạng', 'Ví dụ', 'Liên tục?'],
        rows: [
          ['Công ty (bản ghi)', 'CO- + 6 ký tự mã hoá + 1 ký tự kiểm tra', 'CO-P9FCEPD', '**Không** — xáo trộn có chủ đích'],
          ['Báo giá', 'QUO-{6 số}-{tháng}-{năm}', 'QUO-009909-07-2026', 'Có'],
          ['PO', 'PO-{6 số}-{tháng}-{năm}', 'PO-005864-08-2026', 'Có'],
          ['Hoá đơn GTGT', 'Dãy số của nhà cung cấp hoá đơn điện tử', '1C26TTD-173', 'Có — **liên tục không đứt, luật bắt buộc**'],
          ['Số PO của chính khách', 'Chữ tự do, ghi đúng như khách đưa', 'PO-VP/2026/044', 'Của khách, không phải của mình'],
        ],
      },
      {
        kind: 'list',
        heading: 'Vài điều về mã số mà ít người để ý',
        items: [
          'Mọi mã đều do hệ thống cấp và **không sửa được** — trừ số PO của chính khách, cái đó gõ đúng như khách đưa.',
          'Công ty nhận mã `CO-` **ngay khi bản ghi được tạo**: một lead đã có mã trước khi thành khách hàng, và mã đó **không đổi** suốt lead → khách hàng → rời bỏ → quay lại.',
          'Số liên tục **có** để lộ sản lượng: khách cầm QUO-009909 suy ra được mình đã phát hành khoảng bao nhiêu báo giá, và hai chứng từ cách nhau một tháng để lộ tốc độ. Điều này được chấp nhận với chứng từ, và **không tránh được** với dãy số pháp lý.',
          'Báo giá là thứ **lộ nhiều nhất**, vì báo giá gửi cho mọi khách tiềm năng — kể cả những khách đang so sánh mình với đối thủ — trong khi hoá đơn chỉ gửi cho khách đã mua. Nó cũng là số **duy nhất không bị luật ràng buộc**, nên nếu khách muốn thì đây là số duy nhất có thể xáo trộn được.',
        ],
      },
      {
        kind: 'table',
        heading: 'Công ty có hai trạng thái — trả lời hai câu hỏi khác nhau',
        cols: ['Trục', 'Trả lời câu hỏi', 'Giá trị'],
        rows: [
          ['Trạng thái pipeline', '“Đang có cơ hội bán nào không, và đang ở đâu?”', 'Not in pipeline · Proposal · Qualified · Negotiation · PO · Invoice'],
          ['Trạng thái khách hàng', '“Đã từng trả tiền chưa, và còn đang dùng không?”', 'New · Existing · Churn'],
        ],
      },
      {
        kind: 'warn',
        text:
          'Hai trục này **độc lập, không được nối vào nhau**. Mất một deal không làm đổi trạng thái khách hàng; thắng một deal cũng không tự làm khách thành Existing — **hoá đơn** mới làm điều đó. Một công ty vừa Existing vừa đang Negotiation là một tài khoản khoẻ mạnh, không phải lỗi dữ liệu.',
      },
      {
        kind: 'list',
        heading: 'Báo giá — option là phương án thay thế nhau',
        items: [
          'Một báo giá có **1–3 option**, khách chọn đúng **một**. Chấp nhận option 2 nghĩa là option 1 và 3 bị loại, **không phải** mua cả ba.',
          'Mỗi dòng trong option trỏ vào một **Product** hoặc **Bundle** đã khai ở Products — không gõ tay tên sản phẩm, vì dòng báo giá là thứ sau này quyết định cấp quota gì.',
          'Chiết khấu tổng đơn ≤ 10% do **Sales Leader** duyệt; trên 10% phải chuyển **Sales Manager**.',
          'Báo giá và PO đều in **cửa sổ kích hoạt** ngay cạnh dòng hàng, để khách đồng ý trước khi mua — điều kiện này không bao giờ được xuất hiện lần đầu trên hoá đơn.',
        ],
      },
      {
        kind: 'list',
        heading: 'MST — khoá chống trùng, và cái nút Verify chỉ để biết',
        items: [
          'MST là khoá chống trùng công ty. Tạo công ty với MST đã tồn tại sẽ bị từ chối kèm link sang công ty đang giữ MST đó.',
          'Nút **Verify** chỉ để **biết**, không phải cổng chặn — kết quả hiện ra dưới dạng chip thông tin.',
          '**Loại công ty** (trong nước / nước ngoài) quyết định ô MST nghĩa là gì và gate các phân loại người mua ở phần xuất hoá đơn. Công ty nước ngoài không có MST Việt Nam để kiểm.',
          'Danh sách “trùng 10 số gốc MST” là gợi ý liên kết chi nhánh / công ty mẹ — chỉ áp dụng cho công ty trong nước.',
        ],
      },
      {
        kind: 'table',
        heading: 'Năm trục trạng thái trên một công ty — không trục nào kéo trục nào',
        note: 'Mỗi trục do **một bên khác nhau** đặt. Đây là bảng nên dùng để viết test case.',
        cols: ['Trục', 'Giá trị', 'Ai đặt', 'Ghi chú'],
        rows: [
          ['**Company status**', 'Active · Archived', 'Admin / Sales lead', 'Active là mặc định, **kể cả khách đã rời**. Archive cần **lý do từ danh sách cố định**, và khôi phục được. **Không tồn tại trạng thái “Inactive”**'],
          ['**Customer status**', 'New · Existing · Churn', '**Chỉ hệ thống**', 'New từ lúc tạo → **Existing khi hoá đơn GTGT đầu tiên phát hành** → Churn sau 12 tháng không có đơn mới. Kéo lại được khách thì về **Existing**, không về New'],
          ['**Verification**', 'Unverified · Waiting to verify · Verified', 'Admin (nút Verify)', 'Suy ra mỗi lần đọc: có ERC mà chưa duyệt = Waiting; chưa có giấy = Unverified'],
          ['**Pipeline**', 'Not in pipeline · Proposal · Qualified · Negotiation · PO · Invoice', 'Sales (3 chặng đầu) · Hệ thống (PO, Invoice)', '**“Lost” không phải một chặng** — deal thua giữ nguyên chặng nó chết'],
          ['**Sales owner**', 'chưa gán (Free data) · một rep', 'Admin / duyệt claim / bàn giao', 'Mọi thay đổi ghi vào Owner history'],
        ],
      },
      {
        kind: 'table',
        heading: 'Hạng thành viên — trục duy nhất thuần số học',
        note: 'Tính theo giá trị đơn đã thanh toán trong năm chương trình.',
        cols: ['Hạng', 'Từ', 'Dưới'],
        rows: [
          ['— (chưa có hạng)', '0 ₫', '30.000.000 ₫'],
          ['Member', '30.000.000 ₫', '50.000.000 ₫'],
          ['Bronze', '50.000.000 ₫', '100.000.000 ₫'],
          ['Silver', '100.000.000 ₫', '200.000.000 ₫'],
          ['Gold', '200.000.000 ₫', '300.000.000 ₫'],
          ['Diamond', '300.000.000 ₫', '—'],
        ],
      },
      {
        kind: 'table',
        heading: 'Xác minh công ty gate ĐÚNG HAI thứ — không hơn',
        note: 'Đây là chỗ hay bị hiểu rộng ra. Chưa Verified thì khách vẫn đăng nhập, đọc, sửa thông tin, nhận báo giá và ký PO bình thường.',
        cols: ['Hành động', 'Chưa Verified', 'Đã Verified'],
        rows: [
          ['Khách đăng tin (Publish **hoặc** lưu nháp)', '**Bị chặn** — trang đòi giấy ĐKKD', 'Được'],
          ['Sales bấm **Request official invoice** trên PO', '**Bị chặn**, có tooltip giải thích (chặn cả ở server)', 'Được'],
          ['Đăng nhập · đọc · tải ERC lên · sửa Company information · báo giá · ký PO · **admin đăng tin hộ khách**', 'Được', 'Được'],
        ],
      },
      {
        kind: 'warn',
        text:
          '**Admin sửa dữ liệu định danh của một công ty đã Verified (tên pháp lý, MST, địa chỉ đăng ký) sẽ đẩy nó về Waiting to verify** — lặng lẽ, chỉ đổi cái nhãn. Lúc đó khách **mất quyền đăng tin** và sales **mất nút xin hoá đơn**, cho tới khi có người bấm Verify lại.',
      },
      {
        kind: 'table',
        heading: 'Ai làm được gì',
        cols: ['Vai trò', 'Làm được', 'KHÔNG làm được'],
        rows: [
          ['Sales rep', 'Xin công ty ở Free data · tạo/gửi báo giá · Issue PO · xin hoá đơn · ghi hoạt động · kéo thẻ 3 chặng đầu · đóng deal thua', '**Tạo công ty** · duyệt claim · gán owner · Verify · **phát hành hoá đơn** · sửa báo giá đã Sent hoặc bất kỳ PO nào'],
          ['Sales lead', 'Mọi thứ rep làm được, trên sổ của team · **duyệt claim bước 2** · duyệt chiết khấu ≤ 10% · Archive công ty', 'Phát hành hoá đơn · duyệt claim bước 1'],
          ['Sales manager', 'Duyệt chiết khấu **> 10%**', '—'],
          ['Admin (HQ)', 'Tạo công ty · **duyệt claim bước 1** · gán/đổi owner · xử lý Sign-ups · **Verify** · Archive/Restore', 'Phát hành hoá đơn (trừ khi kiêm kế toán)'],
          ['Kế toán', '**Phát hành hoá đơn** · gửi mail hoá đơn · xác nhận thanh toán · duyệt Company documents', '**Tạo hoặc sửa** bất kỳ chứng từ nào trong ba loại'],
        ],
      },
      {
        kind: 'warn',
        text:
          'Quyền phát hành hoá đơn **cố tình không giao cho sales**: người có chỉ tiêu phụ thuộc vào việc chốt deal **không được** là người bấm nút giao hàng cho khách.',
      },
      {
        kind: 'list',
        heading: 'Người liên hệ ≠ tài khoản đăng nhập',
        items: [
          'Hai danh sách **độc lập**. Người liên hệ là người mình gọi; tài khoản đăng nhập là người dùng được hệ thống.',
          'Một người có thể là liên hệ mà không có login, và ngược lại. Xoá liên hệ không xoá tài khoản.',
        ],
      },
      {
        kind: 'open',
        text:
          '**Chưa chốt — quota hết hạn thì xử lý thế nào.** Hết im lặng · cảnh báo khách ở mốc 60/30/7 ngày · hay để sales gia hạn. Để quota đã trả tiền hết hạn mà không báo trước là phương án dễ sinh tranh chấp nhất, nên tối thiểu cần một job nhắc hạn. Cũng cần chốt: hết hạn rồi có khôi phục được trong thời gian ân hạn không.',
      },
      {
        kind: 'open',
        text:
          '**Chưa chốt — quy trình đính chính hoá đơn.** Requirement mô tả huỷ hoá đơn kèm thu hồi quota; **build đã bỏ hẳn chức năng huỷ**, đính chính làm trên cổng nhà cung cấp. Câu hỏi thu hồi quota đã tiêu một phần vì thế **không còn hiệu lực trên dev** — nhưng cần khách xác nhận “sửa trên cổng” là quy trình chính thức.',
      },
    ],
  },

  'Product settings': {
    title: 'Logic chung — Product settings',
    lead:
      'Phía danh mục của việc kiếm tiền: **bán cái gì, và giá bao nhiêu**. Bán nó (báo giá → PO → hoá đơn) nằm ở CRM; thứ khách giữ sau đó nằm trên tài khoản của khách.',
    headline: [
      '**Không có gì được cấp nếu không có đơn đã thanh toán.** Admin không bao giờ tự tay gán sản phẩm cho một tài khoản — quota xuất hiện như hệ quả của việc trả tiền.',
      '**`Type` là field có tầm ảnh hưởng lớn nhất.** Chọn sai Type thì giao sai thứ cho khách, âm thầm, đúng lúc xuất hoá đơn.',
      '**Có BA đồng hồ, không phải một.** Cấp quota, cửa sổ kích hoạt, và thời gian sử dụng. Lẫn lộn ba cái này là cách làm mất quota khách đã trả tiền.',
    ],
    blocks: [
      {
        kind: 'table',
        heading: 'Ba đồng hồ',
        note: 'Đồng hồ ② là cái duy nhất có thể âm thầm huỷ quota khách đã mua.',
        cols: ['#', 'Đồng hồ', 'Bắt đầu khi', 'Đặt ở đâu', 'Hết thì sao'],
        rows: [
          ['①', 'Cấp quota', 'Hoá đơn GTGT **chính thức** phát hành — bản nháp không cấp gì', '— tức thì, không có field', 'Quota nằm trên tài khoản. Khách đăng tin / mở CV được ngay'],
          ['②', '**Cửa sổ kích hoạt**', 'Ngày hoá đơn', 'Khai trên **từng sản phẩm** (mặc định 12 tháng)', 'Quota chưa dùng **hết hiệu lực**. Không hoàn tiền, không tự gia hạn'],
          ['③', 'Sử dụng / hiển thị', 'Tin đăng: ngày publish. **Gói CV: ngày ai đó bấm Kích hoạt** — không có gì tự chạy', 'Khai trên sản phẩm (tin 30 ngày, gói CV 30/90 ngày)', 'Riêng slot/gói đó kết thúc. Các slot chưa dùng vẫn chạy đồng hồ ②'],
        ],
      },
      {
        kind: 'list',
        heading: 'Vì sao cửa sổ kích hoạt nằm trên sản phẩm, không nằm ở cấu hình chung',
        items: [
          'Mặc định **12 tháng** theo T&C của khách (điều 4). Các lựa chọn: 3 · 6 · 12 · 18 · 24 tháng.',
          '12 tháng trên một slot Top Job 13.800.000 ₫ và 12 tháng trên một tin đăng dùng thử **không phải cùng một cam kết thương mại** — bản dùng thử để 3 tháng chính vì lý do đó: đồ tặng mà để dành được cả năm là gánh nặng, không phải động lực dùng thử.',
          'Hạn được **chụp lại** lên gói của khách lúc cấp quota (ngày hoá đơn + số tháng). Sửa sản phẩm sau đó **không được** dịch chuyển hạn của quota đã bán.',
          'Cửa sổ này không dừng vì bất cứ lý do gì. Cần dời hạn cho một khách thì đó là một lần gia hạn **có ghi log**, không phải sửa field này.',
          'Sản phẩm “luôn có sẵn” không có cửa sổ nào cả — chúng không bao giờ được xuất hoá đơn nên không có ngày nào để đếm.',
        ],
      },
      {
        kind: 'example',
        heading: 'Ví dụ — vì sao gói CV phải bấm mà tin đăng thì không',
        scenario:
          'Khách mua **2 gói COMBO 50** (50 lượt mở CV, dùng trong 30 ngày) trên cùng một hoá đơn phát hành **01/03/2026**. Cửa sổ kích hoạt của sản phẩm là **12 tháng**.',
        cols: ['Ngày', 'Gói A', 'Gói B', 'Điều gì đang xảy ra'],
        rows: [
          ['01/03', 'Chưa kích hoạt', 'Chưa kích hoạt', 'Cả hai đã trả tiền, đã cấp. **Chưa mở được CV nào** — chưa ai bấm.'],
          ['05/03 — bấm Kích hoạt gói A', '**Đang dùng** (tới 04/04)', 'Chưa kích hoạt', 'Đồng hồ ③ của gói A chạy. Gói B **không bấm được** — chỉ một gói Đang dùng tại một thời điểm.'],
          ['04/04 — gói A hết hạn dùng, còn 12 lượt', 'Đã kết thúc', 'Chưa kích hoạt', '12 lượt của gói A **mất**. Và đúng lúc này gói B **mới bấm được**.'],
          ['10/04 — bấm Kích hoạt gói B', 'Đã kết thúc', '**Đang dùng** (tới 09/05)', 'Đồng hồ ③ của gói B chạy từ ngày bấm, không phải từ ngày mua.'],
          ['01/03/2027 — nếu gói B chưa bao giờ bấm', '—', '**Hết hạn kích hoạt**', 'Quá 12 tháng. Mất trọn 50 lượt, **không hoàn tiền**.'],
        ],
        note:
          'Đây là lý do gói CV có nút Kích hoạt còn tin đăng thì không: tin đăng tự bắt đầu đồng hồ ③ khi publish, nên người mua không bao giờ phải nghĩ tới việc bàn giao. Gói CV thì việc bàn giao **là một cái nút** — và vì chỉ một gói chạy được tại một thời điểm, bấm sớm là tự đốt thời hạn của mình. Khách mua hai gói nên được nhắc bấm gói sau **ngay khi** gói trước kết thúc.',
      },
      {
        kind: 'list',
        heading: 'Năm loại sản phẩm và mỗi loại cấp cái gì',
        items: [
          '**Posting tier** — N slot đăng tin ở một bậc. Tiêu bằng cách publish một tin. Những gì bậc đó cho (thời lượng, nhịp làm mới, kiểu tiêu đề, thứ hạng tìm kiếm, vị trí trang chủ, badge) đến từ **cấu hình bậc**, không phải từ SKU — nếu không thì hai sản phẩm Top Job có thể cho hai thứ khác nhau.',
          '**Placement booking** — một khu vực hiển thị đã đặt tên, bán theo kỳ. Tiêu bằng việc booking chiếm chỗ đó.',
          '**Credit pack** — một hạn mức lượt dùng có thời hạn. Ví dụ COMBO 50: 50 lượt mở CV / 30 ngày.',
          '**Add-on (chỉ gắn kèm)** — đi kèm một bậc chính, **không bán rời được**. Sức chứa hữu hạn nên nó đặt chỗ giống placement.',
          '**Manual service** — việc do đội ops làm tay. Trả tiền **không** cấp quota; nó mở ra một nhiệm vụ giao hàng (Yêu cầu → Lên lịch → Đã giao) cần bằng chứng đã giao thì dòng đó mới tính là hoàn thành.',
          'Bốn trong năm loại quy về cùng một hình dạng: (sản phẩm, quota còn lại, thời hạn). **Manual service là ngoại lệ** — và chính ngoại lệ đó là lý do nó là một loại riêng chứ không phải một cờ.',
        ],
      },
      {
        kind: 'table',
        heading: 'Bốn trạng thái của một gói CV search',
        note: 'Trạng thái nằm trên **gói khách đã mua**, không nằm trên sản phẩm. Cùng một SKU bán cho hai khách sẽ ở hai trạng thái khác nhau.',
        cols: ['Trạng thái', 'Nghĩa là', 'Đồng hồ đang chạy', 'Thoát khi'],
        rows: [
          ['Chưa kích hoạt', 'Đã thanh toán, chưa bấm. Không mở được CV nào.', 'Cửa sổ kích hoạt', 'Bấm **Kích hoạt** → Đang dùng. Hoặc quá hạn → Hết hạn kích hoạt'],
          ['Đang dùng', 'Là gói duy nhất đang được tiêu. Mỗi lần mở CV trừ vào đây.', 'Thời hạn sử dụng', 'Hết quota, hoặc hết hạn dùng → Đã kết thúc'],
          ['Đã kết thúc', 'Xong, vì hết quota **hoặc** hết hạn. Có lưu lý do.', '— không còn', 'Trạng thái cuối. Đây là lúc gói Chưa kích hoạt kế tiếp bấm được'],
          ['**Hết hạn kích hoạt**', 'Chưa bao giờ được bấm và đã quá hạn. **Mất tiền, không hoàn.**', '— không còn', 'Chỉ thoát bằng một lần gia hạn có ghi log'],
        ],
      },
      {
        kind: 'warn',
        text:
          '**“Hết hạn kích hoạt” tách riêng là có lý do:** đó là trạng thái duy nhất khách **mất tiền mà chưa dùng gì**. Gộp nó vào “Đã kết thúc” là bỏ mất đúng con số cần cảnh báo trước hạn và cần báo lại cho sales. Và chỉ **một gói được Đang dùng tại một thời điểm** — gói sau chỉ bấm được khi gói trước đã kết thúc.',
      },
      {
        kind: 'list',
        heading: 'Cần job nhắc hạn cho cả hai đồng hồ',
        items: [
          'Sắp hết **cửa sổ kích hoạt**: nhắc ở 60 / 30 / 7 ngày.',
          'Sắp hết **thời hạn sử dụng** khi vẫn còn quota chưa dùng: nhắc ở 7 ngày. Đồng hồ này gấp hơn nhiều — 90 ngày mà còn 40 CV chưa mở là **một cuộc gọi của sales**, không phải một email.',
        ],
      },
      {
        kind: 'list',
        heading: 'Placement — sức chứa CÓ bị chặn, và vòng xoay chỉ đổi thứ tự',
        items: [
          'Placement là **khu vực hiển thị**: kích thước, sức chứa, vòng xoay. Khai một lần ở đây, sản phẩm trỏ vào — không khai lại trong từng lần bán.',
          '**Sức chứa được hệ thống chặn thật.** Một booking chỉ đăng được nếu vùng còn chỗ **cho MỌI ngày trong dải ngày của nó**; không thì admin từ chối và nói khi nào trống: *“… is full for those dates (1 of 1 slots booked). Free from 16 Oct 2026.”*',
          '**Sức chứa là độ phủ, không phải độc quyền.** Vùng một-ô sức chứa 6 nghĩa là sáu khách cùng chạy trong những ngày đó, nhưng người xem thấy **một cái mỗi lượt xoay**. Bán “banner duy nhất” thì vùng đó phải **không chứa gì khác** trong dải ngày ấy.',
          '“Placement” có **ba nghĩa** trong hệ thống: khu vực hiển thị (master data) · bậc mà một tin cụ thể đang chiếm · một booking banner mua đứt. Đây là nguồn nhầm lẫn số 1 — xem Từ điển.',
        ],
      },
      {
        kind: 'list',
        heading: 'Bundle là bao bì bán hàng, không phải entitlement',
        items: [
          'Gói (bundle) gộp nhiều sản phẩm thành một giá, một dòng trên báo giá. Nhưng khi cấp quota thì nó **bung ra thành từng phần riêng** — khách không giữ “một bundle”, khách giữ các sản phẩm bên trong.',
        ],
      },
    ],
  },

  Recruitment: {
    title: 'Logic chung — Recruitment',
    lead:
      'Đây là chặng **tiêu** quota. Tin tuyển dụng nối trực tiếp với thứ khách đã mua: đăng một tin dưới bậc nào thì tiêu một slot của đúng bậc đó, và tin tự lên đúng những khu vực mà bậc đó mua quyền xuất hiện.',
    headline: [
      '**Quota đếm theo từng bậc, không dùng chéo.** Mua 5 tin Top job là 5 slot Top job — hết slot bậc đó thì không đăng được bậc đó, dù tổng slot còn nhiều.',
      '**Chỉ Open + Exposure On mới hiển thị công khai.** Hai thứ này độc lập; một tin Open mà Exposure Off thì không ai thấy.',
      '**Tin đăng được từ HAI cửa** — Admin và trang công ty — nhưng là **một thực thể, một vòng đời**.',
    ],
    blocks: [
      {
        kind: 'table',
        heading: 'Vòng đời tin đăng — suy ra từ ngày, không gõ tay',
        cols: ['Trạng thái', 'Nghĩa', 'Chuyển tiếp'],
        rows: [
          ['Draft', 'Đã tạo, chưa đăng', 'Publish → Open (nếu để trống ngày bắt đầu) hoặc Schedule'],
          ['Schedule', 'Trước ngày bắt đầu đã đặt', 'Tới ngày → **tự** thành Open'],
          ['Open', 'Trong khoảng ngày chạy — là thứ ứng viên thấy', 'Qua ngày kết thúc → **tự** thành Closed'],
          ['Closed', 'Đã hết hạn, giữ lại để báo cáo', 'Không quay lại Open được — đăng tin mới'],
        ],
      },
      {
        kind: 'warn',
        text:
          '**Exposure là công tắc riêng, không phải trạng thái thứ năm.** Nó tắt/bật hiển thị mà không đổi trạng thái và không kết thúc booking — tin vẫn chạy và vẫn hết hạn đúng ngày. Khi khách báo “tin không hiện”, kiểm Exposure **trước tiên**.',
      },
      {
        kind: 'list',
        heading: 'Sửa tin đang chạy',
        items: [
          'Sửa một tin **Open là tự do** — trừ **tiêu đề tin sau 72 giờ**, và ràng buộc đó chỉ áp cho phía công ty tự sửa.',
          'Muốn gỡ tin khỏi trang jobseeker mà không kết thúc booking: tắt **Exposure**. Đó là cách duy nhất — không phải sửa nội dung, không phải đóng tin sớm.',
        ],
      },
      {
        kind: 'list',
        heading: 'Những field hay bị gộp làm một',
        items: [
          '**Work type** (nơi làm: tại văn phòng · remote · hybrid · nước ngoài) và **Contract type** (loại hợp đồng: toàn thời gian · bán thời gian · thời vụ · thực tập…) là **hai field riêng**. Gộp lại là mất một nửa thông tin lọc của ứng viên.',
          '**Địa điểm làm việc là một VĂN PHÒNG CÓ TÊN, lưu trên công ty** — tin chỉ tham chiếu tới nó. Sửa địa chỉ thì sửa ở hồ sơ công ty, một lần, không sửa trong từng tin.',
          '**Phân loại tin là master data, không phải chữ tự do.** Ngành nghề, vị trí, kỹ năng đều chọn từ danh mục — vì đó là thứ bộ lọc và gợi ý việc đọc.',
          '**Phúc lợi là một DANH SÁCH chọn, không phải đoạn văn.** Tin mới bắt đầu bằng bản sao bộ phúc lợi của công ty, rồi sửa tự do theo từng tin.',
        ],
      },
      {
        kind: 'list',
        heading: 'Lương',
        items: [
          'Hai đơn vị: **VND và USD**. USD là **đơn vị hiển thị** — hệ thống vẫn quy đổi để so sánh và xếp hạng, dùng tỉ giá khai ở System → General settings.',
          '**Dải lương một phía là hợp lệ:** “Từ 15 triệu” là một tin đăng đúng luật, không phải dữ liệu thiếu.',
        ],
      },
      {
        kind: 'table',
        heading: 'Ba trục đều bị gọi là “trạng thái CV” — và chúng khác nhau',
        note:
          'Đây là nguồn nhầm lẫn lớn nhất ở nhóm Recruitment. Ba trục **độc lập**, do **ba bên khác nhau** sở hữu, và chặn **ba thứ khác nhau**. Một CV có thể Đạt, Bình thường, mà vẫn không ai tìm thấy — vì ứng viên để Ẩn.',
        cols: ['Trục', 'Giá trị', 'Ai sở hữu', 'Chặn cái gì', 'Xem ở đâu'],
        rows: [
          [
            '**Chất lượng CV**',
            'Đạt · Không đọc được · Chưa đủ thông tin · Từ chối',
            'HQ (người duyệt)',
            '**Chặn ĐƠN ỨNG TUYỂN** — đơn nằm ở “Chưa gửi”',
            'CV review',
          ],
          [
            '**Kiểm duyệt**',
            'Bình thường · Bị gắn cờ · Gỡ khỏi kho',
            'HQ',
            '**Chặn TÌM KIẾM** — không chặn ứng tuyển',
            'Resumes',
          ],
          [
            '**Hiển thị**',
            'Cho tìm thấy · Ẩn',
            '**Chỉ ứng viên** — HQ không bao giờ đổi được',
            '**Chặn TÌM KIẾM**',
            'Talent pool (đọc), ứng viên tự đổi',
          ],
        ],
      },
      {
        kind: 'warn',
        text:
          '**Kiểm duyệt chỉ trừ đi được, không cộng thêm.** HQ gỡ một CV khỏi kho tìm kiếm được, nhưng **không** làm một ứng viên đang để Ẩn hiện ra được, **không** sửa nội dung CV, và **không** đổi lựa chọn hiển thị của ứng viên. “Gỡ khỏi kho” là gỡ **khả năng được tìm thấy**, không phải gỡ con người: ứng viên vẫn giữ CV và vẫn ứng tuyển bằng nó bình thường.',
      },
      {
        kind: 'list',
        heading: 'Hồ sơ ứng viên là dữ liệu cá nhân',
        items: [
          'Mở chi tiết ứng viên và xuất danh sách đều **bị ghi log ở server**. Chỉ mở khi có lý do công việc.',
          'Quyền **xuất** dữ liệu tách khỏi quyền **đọc** — đọc được không đương nhiên xuất được.',
          'Mở khoá một CV cho công ty **trừ credit** của công ty đó; giá có thể được đặt riêng theo từng CV.',
        ],
      },
      {
        kind: 'example',
        heading: 'Ví dụ — quota theo bậc, và vì sao “còn slot” không đủ để trả lời',
        scenario:
          'Công ty FPT mua: **5 slot Top Job** và **10 slot Basic**. Đã dùng 5 Top Job và 2 Basic. HR gọi lên hỏi: “bên em còn 8 slot mà sao đăng tin Top Job không được?”',
        cols: ['Bậc', 'Đã mua', 'Đã dùng', 'Còn', 'Đăng được không'],
        rows: [
          ['Top Job', '5', '5', '**0**', '**Không** — hết slot bậc này'],
          ['Basic', '10', '2', '8', 'Được — nhưng là tin Basic'],
          ['**Tổng**', '15', '7', '**8**', '← con số làm HR hiểu nhầm'],
        ],
        note:
          'Con số “còn 8 slot” đúng về mặt số học và vô dụng về mặt vận hành. Quota **không dùng chéo bậc được**: 8 slot Basic không mua nổi một tin Top Job. Khi khách hỏi “còn bao nhiêu”, luôn trả lời **theo từng bậc** — và nếu họ cần thêm Top Job thì đó là một cơ hội bán, không phải một lỗi hệ thống.',
      },
      {
        kind: 'warn',
        text:
          'Luồng **duyệt tin (approval) đã được gỡ bỏ từ 09/2026**. Tin không còn đi qua bước chờ duyệt — tài liệu cũ nào còn mô tả bước đó là đã lỗi thời.',
      },
    ],
  },

  Users: {
    title: 'Logic chung — Users',
    lead:
      'Hai loại tài khoản hoàn toàn khác nhau nằm cạnh nhau: người tìm việc và người của công ty khách hàng. Tài khoản nhân viên Saramin **không** ở đây — nó ở Organisation → Users.',
    headline: [
      '**Ba trạng thái, không phải bốn.** Active · Deactivated · Deleted. **Không tồn tại “Unverified”** — tài khoản chỉ ra đời khi mã xác thực nhập xong, nên trạng thái đầu tiên luôn là Active.',
      '**Deactivate là khoá cửa; Delete là cánh cửa một chiều.** Xoá thì dữ liệu cá nhân huỷ trong **72 giờ**, và chỉ khôi phục được **bên trong 72 giờ đó**.',
    ],
    blocks: [
      {
        kind: 'table',
        heading: 'Ba loại tài khoản, đừng lẫn',
        cols: ['Loại', 'Là ai', 'Ở đâu'],
        rows: [
          ['**Jobseeker users**', 'Ứng viên', 'Nhóm Users'],
          ['**Company users**', 'Người của khách hàng — một dòng là **một tư cách thành viên trong một công ty**', 'Nhóm Users'],
          ['**Users**', 'Nhân viên Saramin', '**Organisation**, không ở đây'],
        ],
      },
      {
        kind: 'table',
        heading: 'Trạng thái tài khoản ứng viên',
        note: '**Withdrawn** và **Deactivated** là **cùng một cái khoá**, phân biệt bằng **ai là người khoá**.',
        cols: ['Trạng thái', 'Ai gây ra', 'Mở lại được?'],
        rows: [
          ['**Active**', 'Hệ thống, khi đăng ký hoàn tất', '—'],
          ['**Deactivated**', 'HQ khoá (bắt buộc lý do)', 'Có — HQ mở lại'],
          ['**Withdrawn**', '**Chính ứng viên tự tạm dừng**', 'Có — khi ứng viên yêu cầu'],
          ['**Deleted**', 'Ứng viên (kèm OTP), hoặc HQ theo yêu cầu pháp lý', '**Chỉ trong 72 giờ**'],
        ],
      },
      {
        kind: 'warn',
        text:
          'Đừng “reactivate” một tài khoản **Withdrawn** như thể HQ khoá nhầm — **chính người dùng đã tắt nó**. Và **khoá một người không từ chối CV của họ**: muốn gỡ CV khỏi vòng duyệt là **một quyết định riêng** ở màn hình CV review.',
      },
      {
        kind: 'list',
        heading: 'Riêng tư và giới hạn của HQ',
        items: [
          'Lý do nhập khi khoá/xoá là **ghi chú nội bộ**, người dùng không bao giờ thấy.',
          '**HQ không bao giờ xem hoặc đặt mật khẩu** — chỉ gửi được **link đặt lại**.',
          'HQ **không sửa CV, hồ sơ hay nguyện vọng** của ứng viên, và **không bật hiển thị CV hộ** họ.',
          'Mở CV hoặc bỏ che thông tin liên hệ từ Admin là **thao tác chạm dữ liệu cá nhân và luôn được ghi log kèm tên người thao tác**.',
        ],
      },
      {
        kind: 'warn',
        text:
          'Nhân viên **khách** nghỉ việc thì **Deactivate, không xoá** — và **chính người đó không tự khoá mình được**, vì chỗ ngồi thuộc về công ty. Deactivate **giải phóng chỗ ngồi**; Reactivate **chiếm lại một chỗ** và bị chặn nếu công ty đã dùng hết.',
      },
    ],
  },

  Content: {
    title: 'Logic chung — Content',
    lead:
      'Nội dung biên tập trên trang jobseeker: bộ sưu tập tin, trang chiến dịch, menu, chân trang, thông báo và FAQ. **Banner và popup không còn ở đây** — chúng đã chuyển sang Service delivery → Boosting, vì chúng là thứ khách **mua**, không phải thứ mình **viết**.',
    headline: [
      '**Collection lưu ĐIỀU KIỆN, không lưu danh sách.** Tin mới khớp thì tự vào, tin hết hạn thì tự rơi ra — nên một mục menu có thể rỗng đi mà không ai đụng vào.',
      '**Sửa một collection là sửa mọi nơi đang dùng nó.** Menu, zone, trang chiến dịch — tất cả đổi theo.',
    ],
    blocks: [
      {
        kind: 'table',
        heading: 'Ba lớp, và lớp nào chứa nội dung thật',
        note: 'Chỉ lớp đầu chứa điều kiện chọn tin. Hai lớp sau chỉ **bố cục** và **trỏ tới**.',
        cols: ['Lớp', 'Là gì', 'Chứa gì'],
        rows: [
          ['**Collection**', 'Bộ tin / bộ công ty đã đặt tên, gọi theo slug', '**Điều kiện lọc** — đây là nơi nội dung thật sự được quyết định'],
          ['**Zone**', 'Trang chiến dịch có đường dẫn công khai riêng', 'Bố cục các khối, mỗi khối trỏ vào một collection'],
          ['**Site navigation**', 'Menu đầu trang', 'Các mục, mỗi mục có thể trỏ vào một collection'],
        ],
      },
      {
        kind: 'warn',
        text:
          'Vì collection lưu **điều kiện** chứ không lưu danh sách, nó **rỗng đi được mà không ai đụng vào**: điều kiện quá hẹp, hoặc các tin khớp hết hạn cùng lúc. Một mục menu trỏ vào collection rỗng **vẫn hiện trên site** và dẫn người dùng tới trang trắng. Preview lúc tạo chỉ nói được hôm nay, không nói được tháng sau.',
      },
      {
        kind: 'list',
        heading: 'Slug là hợp đồng với site công khai',
        items: [
          'Slug của collection và zone là thứ **site công khai gọi** — đổi slug là **gãy mọi link đã phát ra ngoài**.',
          'Một số slug bị **giữ chỗ** và không dùng được — trùng vào thì lưu hỏng.',
          'Zone trông rỗng thường **không phải lỗi của zone**: kiểm các collection bên trong nó trước.',
        ],
      },
      {
        kind: 'list',
        heading: 'Phần chưa chạy trên nền mới',
        items: [
          '**Pages · Boards · Blog** chưa có backend thật — chúng bị tắt bằng cờ tính năng. Thấy chúng trống hoặc lỗi thì đó là **chưa làm xong**, không phải hỏng.',
        ],
      },
    ],
  },

  System: {
    title: 'Logic chung — System',
    lead: 'Cấu hình nền của cả hệ thống: ai được làm gì, dữ liệu danh mục dùng chung, và các thiết lập ảnh hưởng mọi module.',
    headline: [
      '**Server mới là nơi chặn thật.** Giao diện chỉ ẩn nút bạn không dùng được — nên nút bị ẩn gần như luôn là thiếu quyền, không phải bug.',
      '**Issuer identity là pháp nhân CỦA SARAMIN**, không phải hồ sơ khách. Sai ở đó là sai trên mọi hoá đơn xuất ra.',
    ],
    blocks: [
      {
        kind: 'table',
        heading: 'Quyền — `resource:action` kèm phạm vi',
        cols: ['Phạm vi', 'Nghĩa'],
        rows: [
          ['`all`', 'Không giới hạn — thấy mọi dòng'],
          ['`company`', 'Chỉ những công ty được giao'],
          ['`own`', 'Chỉ dữ liệu của chính người đó'],
        ],
      },
      {
        kind: 'list',
        heading: 'Dữ liệu nền',
        items: [
          '**Master data** là danh mục dùng chung: ngành nghề, kỹ năng, cấp bậc, khu vực. Mỗi tab một nhóm và **mỗi nhóm một quyền riêng** — thiếu quyền một tab thì chỉ tab đó trống, cả trang vẫn chạy.',
          'Tab **kỹ năng còn thiếu** nhận đầu vào từ trang Search quality: từ khoá người dùng tìm mà danh mục chưa có.',
          '**General settings** giữ trọng số gợi ý việc và **tỉ giá USD→VND** — tỉ giá này là thứ mà so sánh lương trong gợi ý việc đọc.',
        ],
      },
      {
        kind: 'warn',
        text: 'Đổi vai trò của một người **đang đăng nhập** thì quyền mới chỉ áp sau khi phiên của họ nạp lại — bảo họ đăng xuất vào lại nếu thấy chưa đổi.',
      },
      {
        kind: 'list',
        heading: 'Ghi vết',
        items: [
          '**Audit log** ghi thao tác chạm dữ liệu nhạy cảm: mở hồ sơ ứng viên, xuất dữ liệu, phát hành hoá đơn. Đây là nơi tra khi có khiếu nại “ai đã xem/sửa cái này”.',
          'Mọi ngày giờ trong hệ thống hiển thị theo **giờ Việt Nam**, không theo máy người xem.',
        ],
      },
    ],
  },

  Dashboards: {
    title: 'Logic chung — Dashboards',
    lead:
      'Bốn bảng theo dõi, mỗi bảng cho một đội — Sales · Sales planning · Marketing · Product — cộng bảng xếp hạng gọi. Mỗi bảng có **quyền riêng**, nên đội này không mặc nhiên thấy số của đội kia.',
    headline: [
      '**Doanh thu tính theo hoá đơn đã phát hành.** PO đã ký nhưng chưa phát hành hoá đơn thì chưa vào doanh thu.',
      '**Mỗi bảng một quyền.** Không thấy một bảng trong menu là **thiếu quyền**, không phải bảng đó chưa làm.',
    ],
    blocks: [
      {
        kind: 'table',
        heading: 'Năm bảng và câu hỏi mỗi bảng trả lời',
        cols: ['Bảng', 'Trả lời câu hỏi', 'Quyền'],
        rows: [
          ['**Sales**', 'Ai bán được bao nhiêu, đang ở chặng nào', '`dashboard_sales:read`'],
          ['**Sales planning**', 'Kế hoạch và chỉ tiêu so với thực tế', '`dashboard_sales_planning:read`'],
          ['**Marketing**', 'Hoạt động marketing chạy ra sao', '`dashboard_marketing:read`'],
          ['**Product**', 'Sản phẩm và tin đăng chạy ra sao', '`dashboard_product:read`'],
          ['**Ranking**', 'Xếp hạng nhân viên theo hoạt động gọi', '`telephony_call:read`'],
        ],
      },
      {
        kind: 'warn',
        text:
          'Mọi báo cáo phải đọc **ngày hoá đơn**, không bao giờ đọc ngày dự kiến ghi trên PO — PO ghi ngày *kế hoạch*, hoá đơn ghi ngày *sự thật*, và chính ngày hoá đơn khởi động đồng hồ kích hoạt. Mọi mốc thời gian theo **giờ Việt Nam**.',
      },
      {
        kind: 'warn',
        text:
          'Bốn bảng này nằm ở `/dashboards/*` và **khác với trang chủ** của admin ở `/`. Trang chủ là màn hình chung sau khi đăng nhập; bốn bảng này là báo cáo theo đội.',
      },
    ],
  },

  'Service delivery': {
    title: 'Logic chung — Service delivery',
    lead:
      'Mặt **sau khi bán** của mọi sản phẩm: khách đã được cấp những gì, dùng tới đâu, và những thứ phải giao bằng tay. Bán hàng nằm ở CRM; danh mục nằm ở Product settings; phần này là “chúng ta đã giao chưa”.',
    headline: [
      '**Một dòng Quota usage = một quyền lợi do MỘT hoá đơn đã phát hành cấp ra.** Không có hoá đơn thì không có dòng nào — đúng nguyên tắc “không gì được cấp nếu chưa thanh toán”.',
      '**Manual service không tự giao được.** Trả tiền chỉ mở ra một nhiệm vụ; phải có người ghi nhận đã giao thì dòng đó mới tính là xong.',
    ],
    blocks: [
      {
        kind: 'table',
        heading: 'Ba trang, ba câu hỏi',
        cols: ['Trang', 'Trả lời câu hỏi'],
        rows: [
          ['**Quota usage**', 'Khách đã được cấp gì, còn bao nhiêu, hạn tới khi nào'],
          ['**Manual services**', 'Còn nợ khách buổi giao nào chưa làm'],
          ['**Boosting**', 'Banner và popup nào đang chạy ở vị trí nào'],
        ],
      },
      {
        kind: 'warn',
        text:
          'Hai đồng hồ cần canh trên Quota usage: **cửa sổ kích hoạt** (quota chưa dùng sẽ hết hiệu lực) và **thời hạn sử dụng** (gói đang chạy sắp hết). Đồng hồ thứ hai gấp hơn — còn 40 lượt CV chưa mở mà gói hết hạn trong 7 ngày là **một cuộc gọi của sales**, không phải một email.',
      },
    ],
  },

  Notifications: {
    title: 'Logic chung — Notifications',
    lead:
      'Bốn trang cho một cỗ máy gửi tin, cộng trang riêng cho mẫu Zalo. Trước đây là **một trang bốn tab**; giờ mỗi phần là một mục menu và **mỗi phần có quyền riêng**.',
    headline: [
      '**Mẫu và quy tắc tách nhau.** Một mẫu dùng cho nhiều quy tắc — nên sửa mẫu là sửa **mọi** nơi đang gửi nó.',
      '**Mẫu Zalo không soạn ở đây.** Zalo duyệt mẫu; mình chỉ khai mã mẫu ứng với hành động nào.',
    ],
    blocks: [
      {
        kind: 'table',
        heading: 'Bốn trang, và thứ tự nên dùng chúng',
        cols: ['Trang', 'Dùng khi', 'Quyền'],
        rows: [
          ['**Message templates**', '**Làm trước** — soạn nội dung, kiểm phần xem trước', '`notification_template:read`'],
          ['**Automation rules**', 'Nối sự kiện → mẫu → người nhận', '`notification_workflow:read`'],
          ['**Send manually**', 'Gửi một lần, không đáng tạo quy tắc', '`notification_send:create`'],
          ['**Delivery history**', 'Kiểm một thông báo có thật sự đi hay không', '`notification_history:read`'],
        ],
      },
      {
        kind: 'warn',
        text:
          'Quyền **gửi tay** là `create`, không phải `read` — gửi tin cho khách là một hành động, không phải một lần xem. Người xem được lịch sử chưa chắc gửi được.',
      },
    ],
  },

  Organisation: {
    title: 'Logic chung — Organisation',
    lead:
      'Ba trang quản trị **người của Saramin**: phòng ban, tài khoản nhân viên, và vai trò. Tách khỏi System vì đây là con người, còn System là cấu hình.',
    headline: [
      '**Đây là nhân viên Saramin, không phải khách.** Tài khoản khách ở Users → Company users; tài khoản ứng viên ở Users → Jobseeker users.',
      '**Thứ tự tạo là bắt buộc:** danh bạ → vai trò → operator → gán vai trò → gửi mời.',
    ],
    blocks: [
      {
        kind: 'table',
        heading: 'Thứ tự tạo một operator',
        note: 'Bỏ bước là kẹt ở bước sau: chưa có vai trò thì không gán được, chưa gán thì mời ra một tài khoản không làm được gì.',
        cols: ['Bước', 'Việc'],
        rows: [
          ['1', 'Thêm người vào **danh bạ nhân sự** (một lần cho mỗi người)'],
          ['2', 'Định nghĩa **vai trò** ở Roles & permissions'],
          ['3', 'Tạo **operator** — chọn người từ danh bạ'],
          ['4', 'Gán **vai trò đã lưu**'],
          ['5', 'Gửi **lời mời**'],
        ],
      },
      {
        kind: 'warn',
        text:
          '**Không ai gõ mật khẩu hộ người khác.** Người được mời bấm link và tự đặt mật khẩu. Trạng thái: **Pending** (đã mời) → **Active** (đã bấm link và đặt mật khẩu) — giống hệt luồng mời bên phía công ty khách.',
      },
      {
        kind: 'list',
        heading: 'Vai trò do team tự quản',
        items: [
          'Có sẵn vài vai trò mặc định, nhưng chúng là **vai trò bình thường, sửa được** — không có “vai trò hệ thống” bị khoá cứng.',
          '**Không xoá được vai trò đang có người giữ.** Gỡ người ra trước.',
          '**Luôn phải còn ít nhất một vai trò giữ toàn quyền**, để không ai tự khoá mình ra khỏi hệ thống.',
          'Gỡ = **vô hiệu hoá, không xoá cứng**. Mọi thay đổi vai trò và operator đều được ghi log.',
        ],
      },
    ],
  },
}

/* ── Page-level guidance ────────────────────────────────────────────────────── */

export const PAGE_DOCS: Record<string, PageDoc> = {

  /* ── Recruitment ─────────────────────────────────────────────────────────── */
  jobs: {
    logic: [
      '**Tin đăng TIÊU quota, không bao giờ TẠO ra quota.** Quota có khi CRM phát hành hoá đơn GTGT. Tin chọn đúng hoá đơn đó và một dòng đã trả tiền trên nó.',
      '**Lưu nháp không tốn gì; Post tốn một slot.** Nháp cần 3 field; Post cần **10 field**, và thanh bên liệt kê những gì còn thiếu.',
      '**Sản phẩm quyết định tin xuất hiện ở đâu và cao tới đâu** — thời lượng hiển thị, các khu vực, vị trí trong sắp xếp Gợi ý, quyền có ảnh thẻ. Tin **kế thừa**, và **không field nào trên tin ghi đè được**.',
      'Vòng đời **chỉ đi tới**: Draft → Schedule → Open → Closed. **Không có mở lại** — muốn chạy tiếp là tin mới.',
      'Không còn tab **In review** từ 09/09/2026 — tin của công ty lên thẳng, y như tin HQ đăng.',
    ],
    how: [
      'Kiểm công ty **Active**, có **MST**, và **đã Verified** (chưa Verified thì phía công ty còn không lưu nháp được).',
      '**New job** → mục **Posting setup**: chọn công ty → chọn **Invoice** (chỉ hiện hoá đơn **đã phát hành** của chính công ty đó) → chọn **Main product**.',
      'Điền **Job information** — chọn **Job category TRƯỚC**, vì job roles và specialisations bên dưới lấy theo nó.',
      'Chọn **người nhận hồ sơ** ở mục Applications — người đầu tiên là tên ứng viên nhìn thấy.',
      'Viết **Description** và **Requirements** (bản VI bắt buộc).',
      'Để trống **Publish at** = đăng ngay; đặt giờ tương lai = Schedule.',
      '**Post.** Kiểm lại slot của công ty ở **Products & billing** đã giảm đúng 1.',
    ],
    watch: [
      '**Ba điều kiện để tin hiện công khai: Open · Exposure On · công ty Active.** Thiếu một cái là tin vô hình **mà không có lỗi nào hiện ra**. Đây là checklist cho mọi câu hỏi “sao tin không thấy”, theo đúng thứ tự đó.',
      '**Công ty không Active thì tin còn không vào nổi Open** — thao tác bị từ chối.',
      '**Không có nút Xoá.** Tin là bản ghi đã trả tiền và đã xuất bản; **Close là kết thúc**. Thấy nút Delete ở đâu thì **đó mới là bug**.',
      '**Expiry date là hạn nhận hồ sơ**, không phải ngày tier ngừng hiển thị tin. Hai thứ khác nhau.',
      'Post thất bại (hết quota, tier hết chỗ) thì **bản nháp vẫn còn**. Post báo **mọi field còn thiếu cùng lúc**, không phải mỗi lần một cái.',
    ],
    blocks: [
      {
        kind: 'table',
        heading: 'Lưu nháp và Post đòi gì',
        cols: ['', 'Save as draft', 'Post'],
        rows: [
          ['Cần', 'Công ty · Tiêu đề (VI) · Địa điểm làm việc', 'Ba cái đó **cộng** Main product · Job category · Job role · Skill · Lương · Description (VI) · Requirements (VI) — **10 field**'],
          ['Tốn', 'Không gì cả', '**Một slot** của Main product, trừ ngay khi tin lên Open (hoặc được hẹn lịch)'],
          ['Thất bại thì', '—', 'Nháp được giữ. Hết quota → cấp/bán thêm rồi thử lại ngay trên màn hình đó. Tier hết chỗ → chọn tier khác'],
        ],
      },
      {
        kind: 'table',
        heading: 'Status và Exposure — hai công tắc khác nhau',
        cols: ['Status', 'Nghĩa', 'Trên trang jobseeker', 'Rời trạng thái khi'],
        rows: [
          ['Draft', 'Đã lưu, chưa từng đăng', 'Không có mặt', 'Post → Open, hoặc đặt Publish at tương lai → Schedule'],
          ['Schedule', 'Sẽ đăng vào giờ đã chọn', 'Chưa có mặt', 'Tới giờ → **tự** thành Open'],
          ['**Open**', 'Đã đăng và còn trong hạn', 'Đang chạy — **nếu Exposure On**', 'Qua hạn → Closed, hoặc bấm Close'],
          ['Closed', 'Hết hạn, hoặc đóng tay', 'Chỉ còn thông báo, không ứng tuyển được', '**Điểm cuối**'],
        ],
      },
      {
        kind: 'warn',
        text:
          '**Exposure chỉ có nghĩa khi tin đang Open.** Ở Draft · Schedule · Closed thì ô đó đọc là *“Exposure applies only to open jobs”*. Tắt Exposure: tin **vẫn Open**, hồ sơ đã nhận **vẫn giữ**, nhưng nó biến khỏi **mọi** danh sách, tìm kiếm và dải hiển thị.',
      },
      {
        kind: 'table',
        heading: 'Ba cột đếm CV — và vì sao 1 / 1 bên cạnh Applied 3 là đúng',
        note: '**Sent CV** và **Not sent CV** là hai phép đếm độc lập, **không phải chia đôi Applied**.',
        cols: ['Cột', 'Nghĩa'],
        rows: [
          ['**Applied**', 'Tổng số lượt ứng tuyển'],
          ['**Sent CV**', 'Đã chuyển tới nhà tuyển dụng'],
          ['**Not sent CV**', 'Còn chờ HQ duyệt CV — **số khác 0 là việc tồn đọng của HQ**, tô màu cảnh báo'],
          ['Vì sao không cộng lại bằng Applied', 'Đơn **bị thu hồi hoặc bị từ chối** không nằm trong cột nào cả'],
        ],
      },
      {
        kind: 'table',
        heading: 'Upgrade tier — và đây cũng là cách nhanh nhất đọc quota của khách',
        note: 'Hộp thoại ghi *“Currently published under X”* rồi liệt kê các tier cao hơn, mỗi cái ở một trong bốn trạng thái.',
        cols: ['Trạng thái', 'Hiện chữ gì', 'Chọn được?'],
        rows: [
          ['Còn slot', '“N slot còn · tốn 1 slot mỗi lần đăng · từ <hoá đơn/gói>” hoặc “không giới hạn”', '**Được**'],
          ['Hết slot', '“Không còn slot trong gói hiện tại.”', 'Không — nút bị khoá sẵn, **không phải bấm rồi mới báo lỗi**'],
          ['Chưa mua', '“Không có trong gói hiện tại của công ty.”', 'Không'],
          ['Hết hạn', '“Hết hạn ngày dd/mm/yyyy.”', 'Không'],
        ],
      },
      {
        kind: 'warn',
        text:
          '**Nâng tier tiêu một slot của tier mới và KHÔNG hoàn tác được.** Kiểm hai chỗ sau khi bấm: **Current tier** trên tin, và số slot của tier đó ở **Products & billing** phải giảm **đúng 1**. Publish, Upgrade và Close đều có chặn double-click — nếu nháy đúp mà trừ hai lần thì báo bug.',
      },
      {
        kind: 'table',
        heading: 'Trang tìm kiếm việc làm — ba khu vực, một tập kết quả, ba thứ tự',
        note: 'Cả ba khu vực **bắt đầu từ cùng một tập**: mọi tin chứa từ khoá ở ít nhất một trong năm trường (tiêu đề · kỹ năng · ngành-vị trí-chuyên môn · công ty · mô tả+yêu cầu). Khác nhau ở **lấy tin nào** và **xếp thế nào**.',
        cols: ['Khu vực', 'Lấy tin nào', 'Xếp theo', 'Quy tắc riêng'],
        rows: [
          ['**(1) Top section**', 'Tin có sản phẩm bao gồm khu vực đầu trang tìm kiếm', '**Làm mới gần nhất** (auto-refresh của sản phẩm)', 'Carousel có phân trang. **Không có tin nào đủ điều kiện thì khu vực không hiện**'],
          ['**(2) Danh sách kết quả** (mặc định *Recommended*)', '**Mọi** tin khớp', '1 · Nhóm theo **thang bậc sản phẩm**, cao trước · 2 · Trong nhóm: **khớp ở trường nào** — tiêu đề → kỹ năng → ngành/vị trí → công ty → mô tả · 3 · Hoà thì auto-refresh mới nhất trước', '**Super star và Hot job là badge, KHÔNG đổi thứ tự**. Chọn *Date posted* / *Closing soonest* thì bỏ qua tier hoàn toàn'],
          ['**(3) Blue zone**', 'Tin khớp mà sản phẩm nằm trong **gói Premium**', 'Xen kẽ **theo công ty** (A, B, C, A, B…) rồi mới tới làm mới gần nhất', '**Ẩn hoàn toàn nếu chưa đủ 3 tin** — không có dải nửa vời'],
        ],
      },
      {
        kind: 'warn',
        text:
          '**“Làm mới gần nhất” là AUTO-REFRESH của sản phẩm, không phải lần sửa cuối.** Vị trí một tin chỉ nhúc nhích khi sản phẩm của nó tự làm mới — **không bao giờ vì ai đó sửa tin**. Nếu không thì sáng nào mọi nhà tuyển dụng cũng sửa một dấu phẩy để leo hạng.',
      },
      {
        kind: 'list',
        heading: 'Vài field hay hiểu nhầm',
        items: [
          '**Work type** (nơi/cách làm: In office · Remote · Hybrid · Oversea) và **Contract type** (quan hệ lao động: Fulltime · Part-time · Contract · Internship · Probation · Freelance · Seasonal) là **hai câu hỏi khác nhau**. *Fulltime + Remote* là tin bình thường.',
          '**Kỹ năng chỉ XẾP HẠNG ứng viên, không bao giờ LOẠI ai.** Tối đa 10, **chỉ chọn từ danh mục** — kỹ năng chữ tự do cũ hiện “· chưa nhận diện — thay đi”, **không bao giờ bị bỏ lặng lẽ**.',
          '**Địa điểm làm việc lấy từ văn phòng của chính công ty**, tối đa 3; **cái chọn đầu tiên là cái hiện trên thẻ**. Văn phòng của công ty khác bị từ chối.',
          '**Lương một phía là hợp lệ**: chỉ From → “Từ 15 triệu”, chỉ To → “Lên đến 25 triệu”. Tin bằng USD in thêm dòng quy đổi thanh toán bằng VND theo tỉ giá ngày ký.',
          '**Phúc lợi** điền sẵn từ bộ của công ty rồi **sửa tự do cho riêng tin này**. Thứ tự ở đây là thứ tự trên trang việc làm.',
          '**Thẻ trên card xoay theo ngày**: ngày 1–10 tag công ty · 11–20 tag công việc · 21–30 tag phúc lợi. **Chọn từ danh mục, không gõ.**',
        ],
      },
      {
        kind: 'open',
        text:
          '**Bốn điểm cần chốt với khách.** (1) **Khoá tiêu đề sau 72 giờ** với tin do công ty đăng (HQ miễn) — cần xác nhận đã build trên trang công ty chưa. (2) **Ngành Y tế chưa có job role nào** (nhóm “medical professionals” bị import thành nhóm lọc), nên **bệnh viện không đăng tin được** vì thiếu field bắt buộc. (3) **Tin miễn phí không nâng lên tier trả phí được** và không có vị trí cao cấp — khách có đồng ý giới hạn đó không. (4) **Duplicate tin** có trong requirement nhưng **console chưa làm** — có nằm trong đợt này không.',
      },
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
    watch: [
      'Mở hồ sơ ứng viên là chạm dữ liệu cá nhân và bị ghi log.',
      'Mở một dòng là **giám sát, không phải cổng duyệt** — không có nút Duyệt/Từ chối ở đây, vì nhà tuyển dụng đã cầm CV đó rồi.',
      '**Không có cột “sàng lọc”**, vì không tồn tại dữ kiện sàng lọc ở mức từng đơn. Thứ giữ một đơn lại là **trạng thái CV**, và dòng hiện nó dưới dạng “Chưa gửi — CV chờ duyệt” kèm link sang CV.',
    ],
    blocks: [
      {
        kind: 'table',
        heading: 'Ba tầng trạng thái trên một đơn ứng tuyển',
        note: 'Ba tầng, ba chủ sở hữu. HQ **không bao giờ** ghi được tầng 3 — chỉ hiện badge và ghi chú “do công ty sở hữu”.',
        cols: ['Tầng', 'Ai sở hữu', 'Giá trị', 'HQ sửa được?'],
        rows: [
          ['1 · Trạng thái CV', 'HQ (CV review)', 'Đạt · Không đọc được · Chưa đủ thông tin · Từ chối', 'Có — ở CV review'],
          ['2 · Trạng thái gửi', 'Saramin', 'Đã gửi · Chưa gửi · Thu hồi', 'Có — qua Thu hồi'],
          ['3 · Chặng tuyển dụng', '**Công ty khách**', 'Mới · Đang xem · Vào danh sách · Phỏng vấn · Nhận · Loại', '**Không** — chỉ đọc'],
        ],
      },
      {
        kind: 'table',
        heading: 'Tầng 2 — ba giá trị, và cái thứ ba là điểm cuối',
        cols: ['Giá trị', 'Nghĩa', 'Đến từ đâu'],
        rows: [
          ['**Đã gửi**', 'Nhà tuyển dụng thấy ngay. Ghi lúc nộp, sau hai kiểm tra: người dùng chưa bị khoá, và chưa có đơn nào còn sống vào đúng tin này.', 'Hành động nộp'],
          ['**Chưa gửi**', 'CV đang nghi ngờ, hoặc đã bị từ chối trước khi kịp giao.', '**Suy từ trạng thái CV** — không gõ tay được'],
          ['**Thu hồi**', 'CV đã giao rồi mới bị từ chối: HQ kéo khỏi dashboard của nhà tuyển dụng và báo họ bỏ qua. **Điểm cuối** — ứng viên phải nộp lại từ đầu.', 'Hành động Thu hồi'],
        ],
      },
      {
        kind: 'warn',
        text:
          '**Khoá một người dùng là kiểm soát truy cập, hết.** Nó chặn họ đăng nhập — và **không** từ chối CV của họ, **không** thu hồi các đơn đã giao, **không** gỡ họ khỏi CV search. Muốn cả những thứ đó thì phải đặt trạng thái CV thành Từ chối, bằng **một thao tác riêng, có chủ đích**. Một đòn bẩy, một nghĩa: khoá trả lời “người này có vào được không”, trạng thái CV trả lời “nhà tuyển dụng có nên thấy không”. **Không đơn nào từng hiện chữ “Bị khoá”.**',
      },
      {
        kind: 'list',
        heading: 'Hai hành động cần xác nhận trước khi chạy',
        items: [
          '**Thu hồi** — cảnh báo thẳng rằng **email đã gửi cho nhà tuyển dụng thì không rút lại được**; thu hồi chỉ gỡ CV khỏi dashboard và báo cho họ.',
          '**Khoá người dùng** — bắt nhập mã lý do, và nói rõ phạm vi: mọi lần nộp sau đều bị từ chối, và **mọi đơn đã gửi trên mọi tin đều bị thu hồi**.',
        ],
      },
      {
        kind: 'warn',
        text:
          'Cách diễn đạt “Chưa gửi — CV chờ duyệt” là **chỉ dành cho admin**. Ứng viên ở đầu kia của dòng đó thấy một chữ “Đã nộp” bình thường và **không được cho biết** có vòng duyệt nào cả.',
      },
    ],
  },
  'talent-pool': {
    logic: [
      'Kho ứng viên **đã bật cho tìm kiếm CV** — không phải mọi ứng viên trong hệ thống.',
      'Một dòng một ứng viên, kèm CV đang cho tìm và kết quả kiểm duyệt của CV đó.',
    ],
    how: ['Tìm/lọc ứng viên.', 'Bấm tên ứng viên để mở hộp thoại chi tiết ngay trên danh sách.'],
    blocks: [
      {
        kind: 'list',
        heading: 'Cổng vào kho — ai lọt vào trước khi bất kỳ truy vấn nào chạy',
        items: [
          'Ứng viên phải tự để **Cho tìm thấy**. Đây là quyền của ứng viên; HQ không bật hộ được.',
          'CV phải qua được trục **chất lượng** — CV đang nghi ngờ hoặc bị từ chối không vào kho.',
          'CV không bị HQ **gỡ khỏi kho** ở trục kiểm duyệt.',
          'Ba điều kiện trên là **cổng nhị phân**, chạy **trước** mọi bộ lọc và mọi xếp hạng. Không bao giờ được gắn cổng vào một trường nghiệp vụ như lương hay số năm kinh nghiệm — mỗi trường đó đều có thể làm rỗng kết quả mà không giải thích được vì sao.',
        ],
      },
      {
        kind: 'warn',
        text:
          '**Dòng khoá không được để lộ danh tính.** Nhà tuyển dụng mà đoán ra được ứng viên là ai từ dòng chưa mở khoá thì họ lấy được thông tin miễn phí qua LinkedIn/Facebook, và tính năng tính tiền lặng lẽ thành miễn phí. **Che tên là không đủ**: “Điều dưỡng trưởng khoa Ngoại · BV Quốc tế Mỹ · nữ · 34” chỉ cách cái tên đúng một lần tìm kiếm, dù trên thẻ không có tên nào. Thứ phải giấu cho tới khi mở khoá: họ tên (và mọi phần của nó), **tên công ty từng làm**, **tên trường**, ảnh đại diện, mọi thông tin liên hệ và file CV. Giấu tên công ty là cái thực sự bịt lỗ hổng.',
      },
    ],
    watch: ['**Chức năng này chưa có API thật ở backend** tại thời điểm viết — màn hình có thể chưa chạy đầy đủ trên môi trường dev.'],
  },
  'cv-review': {
    logic: [
      'Hàng đợi CV cần **người** xem. CV nào máy quét tự thấy đạt thì **không bao giờ** vào đây — nó đi thẳng vào Talent pool. Đó là thứ giữ cho hàng đợi này hữu hạn.',
      'Một CV vào đây khi nó **đã từng bước vào vòng duyệt tay** — không phải khi nó “chưa được duyệt”. Mọi CV mới upload đều mang trạng thái đã duyệt sẵn, nên lọc theo “chưa duyệt” sẽ trả về cả bảng.',
      'Ba tab: **Cần duyệt** (cũ nhất lên trước) · **Đã duyệt** · **Đã từ chối** (hai tab sau mới nhất lên trước). Giữ **toàn bộ lịch sử**, không cắt 30 ngày.',
      'Thứ tự sắp xếp **cố định ở server**, không đổi được — vì thứ tự ở đây là một quy tắc vận hành, không phải sở thích người xem.',
    ],
    how: [
      'Mở tab **Cần duyệt** — đây là tab duy nhất có badge số, vì chỉ nó là việc tồn đọng.',
      'Đọc từ trên xuống: dòng trên cùng là CV **chờ lâu nhất**.',
      'Bấm một dòng để mở hộp thoại duyệt.',
      'Duyệt, hoặc từ chối kèm **mã lý do** chọn từ danh sách (4 mã, có cả “Khác”).',
      'Cần gỡ một CV đã duyệt: vào tab **Đã duyệt** và từ chối nó — thao tác từ chối vẫn dùng được ở đó.',
    ],
    watch: [
      '**CV chưa được quyết thì MỌI đơn ứng tuyển gắn CV đó bị giữ ở “Chưa gửi”, vô thời hạn.** Không có cơ chế tự gửi sau 24h, không có gì tự giải phóng — **chỉ người duyệt**. Hàng đợi bỏ quên ở đây không phải backlog nội bộ, nó là sự cố mà ứng viên chịu.',
      'Vì vậy dòng hiển thị **tuổi chờ**, không phải đếm ngược — không có hạn nào để đếm ngược tới.',
      '**Cột liên hệ bị giấu vĩnh viễn** ở màn hình này. Đó là chủ đích, không phải thiếu dữ liệu.',
      'Không có cột “lượt mở khoá”, vì CV đang trong hàng duyệt thì **chưa từng** vào CV search của nhà tuyển dụng nên không thể có lượt nào.',
    ],
    blocks: [
      {
        kind: 'table',
        heading: 'Bốn trạng thái CV — và vì sao đường truyền chỉ gửi ba',
        note: 'Trạng thái CV là **sự thật duy nhất được lưu** về chất lượng một CV. Hai trạng thái nghi ngờ là thứ ứng dụng phía ứng viên dựa vào để nói cho họ biết cần sửa gì.',
        cols: ['Trạng thái', 'Nghĩa', 'Đơn ứng tuyển gắn CV này'],
        rows: [
          ['**Đạt**', 'Máy quét hoặc người duyệt xác nhận CV đọc được và đủ thông tin', 'Gửi bình thường'],
          ['**Không đọc được**', 'File hỏng, ảnh scan mờ, không trích được chữ', '**Giữ lại ở “Chưa gửi”**'],
          ['**Chưa đủ thông tin**', 'Đọc được nhưng thiếu dữ kiện tối thiểu', '**Giữ lại ở “Chưa gửi”**'],
          ['**Từ chối**', 'Người duyệt từ chối, kèm mã lý do', 'Không gửi'],
        ],
      },
      {
        kind: 'warn',
        text:
          'Đường truyền từ server chỉ gửi **ba** giá trị (chờ · đạt · từ chối) — hai trạng thái nghi ngờ gộp chung thành “chờ”. Phần tách ra “không đọc được” hay “chưa đủ thông tin” hiện chỉ nằm trong **đoạn ghi chú chữ tự do**. Đừng đọc đoạn chữ đó để suy ra loại nghi ngờ; đây là khoảng trống đã ghi nhận và đang chờ backend bổ sung field riêng.',
      },
      {
        kind: 'example',
        heading: 'Ví dụ — một lần duyệt mở khoá bao nhiêu đơn',
        scenario:
          'Ứng viên Nguyễn Văn A upload CV ngày **02/03**. Máy quét không đọc được file (ảnh scan mờ) → trạng thái **Không đọc được**. Từ 02/03 tới 09/03, A nộp đơn vào **4 tin tuyển dụng** của 3 công ty khác nhau.',
        cols: ['Ngày', 'Việc xảy ra', 'Nhà tuyển dụng thấy gì'],
        rows: [
          ['02/03', 'CV vào hàng đợi Cần duyệt', '—'],
          ['03/03 – 09/03', 'A nộp 4 đơn', '**Không thấy đơn nào.** Cả 4 đơn nằm ở “Chưa gửi”'],
          ['Suốt thời gian đó', 'Không có gì tự chạy', 'A tưởng đã nộp xong và đang chờ hồi âm'],
          ['10/03 — người duyệt bấm Duyệt', 'CV thành **Đạt**', '**Cả 4 đơn được gửi đi cùng một lúc**, trong cùng một giao dịch'],
        ],
        note:
          'Một lần bấm giải phóng **mọi** đơn đang chờ CV đó. Nghĩa là để một dòng nằm trong hàng đợi một tuần không phải là chậm một dòng — nó là bốn cơ hội việc làm của một người bị giữ lại, mà cả hai phía đều không biết. Đó là lý do tab này là chỗ duy nhất trong hệ thống mà **badge số trên menu** thực sự có nghĩa là “có việc phải làm ở đây”.',
      },
    ],
  },


  /* ── User ────────────────────────────────────────────────────────────────── */
  'jobseeker-users': {
    logic: [
      '**BA trạng thái, không phải bốn.** Active · Deactivated · Deleted. **Không tồn tại trạng thái “Unverified”** — ở đâu cũng vậy: tài khoản chỉ ra đời khi mã xác thực được nhập xong, nên **trạng thái đầu tiên một tài khoản từng có là Active**.',
      '**Deactivated là KHOÁ CỬA, không phải thùng rác.** Hồ sơ còn nguyên, mở lại được, và **không đụng gì tới thứ nhà tuyển dụng đã cầm**.',
      '**Delete là cánh cửa một chiều duy nhất.** Dữ liệu cá nhân bị huỷ **trong vòng 72 giờ**, email **không bao giờ dùng lại được**, và HQ chỉ khôi phục được **bên trong cửa sổ 72 giờ đó**.',
      'HQ phân biệt hai loại Deactivated ngay trên màn hình: **Deactivated = HQ khoá**, **Withdrawn = chính ứng viên tự tạm dừng**. Cùng một cái khoá, khác lý do, khác nhãn.',
    ],
    how: [
      'Lọc theo tab trạng thái, tìm theo email hoặc tên; lọc thêm theo cách đăng nhập, nguồn đăng ký, ngày đăng ký.',
      'Mở một tài khoản để xem chi tiết — **thao tác này được ghi log kèm tên người thao tác**.',
      'Tài khoản **Active** → **Deactivate** (bắt buộc nhập lý do) hoặc **gửi link đặt lại mật khẩu**.',
      'Tài khoản **Deactivated** hoặc **Withdrawn** → **Reactivate** (với Withdrawn thì làm khi chính ứng viên yêu cầu).',
      'Tài khoản **Deleted** → **Restore**, **chỉ bật khi còn trong 72 giờ**.',
    ],
    watch: [
      'Một tài khoản **Active mà CV đang ẩn** là trạng thái **bình thường** — công tắc hiển thị CV độc lập hoàn toàn với trạng thái tài khoản.',
      'Lý do nhập khi khoá là **ghi chú nội bộ, ứng viên không bao giờ thấy**.',
      '**Khoá một người KHÔNG từ chối CV của họ.** Muốn gỡ CV khỏi vòng duyệt nữa thì đó là **một quyết định thứ hai, riêng biệt** ở màn hình CV review — hộp thoại khoá chỉ nhắc, nó không tự làm hộ.',
      'Sau 72 giờ thì **không còn gì để khôi phục** — đó là thiết kế, không phải lỗi.',
    ],
    blocks: [
      {
        kind: 'table',
        heading: 'Ba trạng thái',
        cols: ['Trạng thái', 'Nghĩa', 'Ai đặt', 'Mở lại được?', 'Nhà tuyển dụng thấy gì'],
        rows: [
          ['**Active**', 'Dùng site bình thường — **trạng thái đầu tiên một tài khoản từng có**', 'Hệ thống, khi đăng ký hoàn tất', '—', 'Bình thường'],
          ['**Deactivated**', 'Cửa bị khoá. Không đăng nhập được; **hồ sơ còn nguyên**', 'HQ (khoá, bắt buộc lý do) — hoặc chính ứng viên (tạm dừng)', '**Có** — HQ mở lại', '**Không đổi gì cả**'],
          ['**Deleted**', 'Kết thúc hẳn. Dữ liệu cá nhân huỷ trong 72 giờ', 'Ứng viên (kèm OTP) — hoặc HQ theo yêu cầu pháp lý', '**Chỉ HQ, chỉ trong 72 giờ**', 'Đơn đang xử lý **bị rút**; đơn đã xong đọc là *“Ứng viên đã xóa tài khoản”*'],
        ],
      },
      {
        kind: 'table',
        heading: 'Khoá tài khoản đổi gì và KHÔNG đổi gì',
        note: 'Đây là hiểu nhầm phổ biến nhất của module này. Khoá chỉ trả lời **một** câu: người này còn đăng nhập được không.',
        cols: ['', 'Đổi', 'Không đổi'],
        rows: [
          ['Đăng nhập', 'Bị từ chối; **mọi phiên đang mở kết thúc ngay**', '—'],
          ['Thông báo', 'Job alert, cập nhật đơn, marketing — **dừng hết**', '—'],
          ['CV search', '**Rời khỏi kho tìm kiếm ngay lập tức**', '—'],
          ['Đơn đã nộp', '—', '**Ở nguyên với nhà tuyển dụng, đúng chặng cũ**'],
          ['CV nhà tuyển dụng đã mở khoá', '—', '**Vẫn đọc được. Không hoàn tiền, không thu lại**'],
          ['Hồ sơ', '—', 'Giữ nguyên vẹn — tên, CV, lịch sử'],
          ['Email', '—', 'Vẫn thuộc về tài khoản này, **không mở tài khoản mới được**'],
          ['Màn hình nhà tuyển dụng', '—', '**Không gì cả — việc khoá là vô hình với họ**'],
        ],
      },
      {
        kind: 'table',
        heading: 'Khoá và Xoá, đặt cạnh nhau',
        cols: ['', 'Deactivate', 'Delete'],
        rows: [
          ['Ai làm', 'HQ (khoá) hoặc ứng viên (tạm dừng)', 'Ứng viên, kèm mã OTP — HQ chỉ khi có yêu cầu pháp lý'],
          ['Hồ sơ', 'Nguyên vẹn', 'Dữ liệu cá nhân **huỷ trong 72 giờ**; giữ lại dòng đã ẩn danh'],
          ['Quay lại được?', 'Có — HQ mở lại', '**Chỉ HQ, chỉ trong 72 giờ**'],
          ['Đơn đang xử lý', 'Ở nguyên', '**Bị rút**'],
          ['Đơn đã xong', 'Ở nguyên', 'Giữ kết quả, tên thay bằng *“Ứng viên đã xóa tài khoản”*'],
          ['Nhà tuyển dụng có được báo?', '**Không** — vô hình với họ', '**Có — mỗi công ty một email**'],
          ['Email', 'Vẫn là của tài khoản này', 'Giữ lại **mã băm**; **không bao giờ đăng ký lại được**'],
        ],
      },
      {
        kind: 'list',
        heading: 'Trong 72 giờ — cái gì bị huỷ, cái gì giữ lại',
        items: [
          '**Huỷ:** họ tên, email gốc, mật khẩu, số điện thoại, ngày sinh, giới tính, ảnh đại diện · toàn bộ nội dung hồ sơ và mọi file CV · ghi chú nhà tuyển dụng viết về ứng viên · việc đã lưu, thông báo, lịch sử xem.',
          '**Giữ, đã ẩn danh:** ID nội bộ, ngày xoá, mã lý do · **mã băm của email** (để chặn đăng ký lại) · **bản ghi đã mua lượt mở CV** — giữ sự kiện mua, bỏ nội dung · số liệu tổng hợp.',
          'Dòng dữ liệu **ở lại nhưng rỗng người**. Đó là thứ giữ cho email bị khoá và cho phép HQ chứng minh đã xoá những gì.',
          '**Email đã xác thực bị chặn đăng ký lại vĩnh viễn — kể cả biến thể dấu chấm của Gmail.** Chăm sóc khách hàng gỡ chặn được sau khi xác minh danh tính.',
        ],
      },
      {
        kind: 'warn',
        text:
          '**HQ không bao giờ xem hoặc đặt mật khẩu** — hành động duy nhất liên quan tới đăng nhập là **gửi link đặt lại**. HQ cũng **không sửa CV, hồ sơ hay nguyện vọng** của ứng viên, và **không khôi phục được tài khoản đã purge** — sau 72 giờ không còn gì để khôi phục.',
      },
      {
        kind: 'open',
        text:
          '**Hai nguồn đang lệch nhau — cần xác nhận đang chạy bản nào trên dev.** Tài liệu Notion (24/09/2026, theo Privacy Policy 21/09) mô tả **3 trạng thái và purge 72 giờ**, và ghi rõ trạng thái “unverified” **biến mất cùng luồng đăng ký mới**. Tài liệu trong repo build thì vẫn mô tả **4 trạng thái API (có INACTIVE hiện là “Unverified”) và purge 30 ngày**. Trang này viết theo Notion vì nó mới hơn và là bản đã chốt chính sách — nhưng **nếu console bạn đang mở vẫn hiện tab “Unverified” thì build chưa theo kịp**, và con số 72 giờ cũng cần kiểm lại trước khi hứa với ai.',
      },
      {
        kind: 'warn',
        text:
          'Trang **Deleted accounts** (`/users/deleted-accounts`) mà tài liệu Notion mô tả **đã bị rút khỏi menu** ở bản sidebar mới — đường dẫn vẫn mở được. Đó là nơi tra: ngày xoá, ai xoá, lý do, **trạng thái purge** (Pending trong 72 giờ · Purged · Failed) và **email có bị chặn đăng ký lại không**.',
      },
    ],
  },

  'company-users': {
    logic: [
      'Tài khoản đăng nhập của phía khách hàng, xem xuyên suốt mọi công ty ở một chỗ. Khác hẳn tài khoản ứng viên và tài khoản nhân viên Saramin.',
      'Một dòng là **một tư cách thành viên trong một công ty** — cùng một người ở hai công ty là hai dòng.',
      '**Đây không phải danh sách công ty thứ hai.** Nó là danh sách người, xem ngang qua mọi công ty.',
    ],
    how: [
      'Tìm theo công ty hoặc theo người.',
      'Mở một dòng để xem người đó thuộc công ty nào, vai trò gì.',
      'Nhân viên khách nghỉ việc → **Deactivate**, không xoá.',
    ],
    watch: [
      'HQ thấy đúng những gì phía nhà tuyển dụng thấy — không hơn.',
    ],
    blocks: [
      {
        kind: 'table',
        heading: 'Ai được khoá một tài khoản khách — và ai thì không',
        note:
          'Nhân viên khách nghỉ việc thì **Deactivate**, không phải Delete. Đây là bản tương đương của “tự rút tài khoản” bên ứng viên, với một khác biệt có chủ đích: **người dùng không tự khoá mình được**, vì chỗ ngồi đó thuộc về công ty — đúng quy tắc Google Workspace / Slack / M365 dùng.',
        cols: ['Ai', 'Phạm vi', 'Lý do điển hình'],
        rows: [
          ['Company Admin', 'Chỉ người của chính công ty mình', 'Trường hợp bình thường — nhân viên nghỉ việc'],
          ['HQ (Saramin)', 'Người của bất kỳ công ty nào', 'Hỗ trợ (Admin của khách không liên lạc được), hoặc quyết định về an toàn'],
          ['**Chính người đó**', '**Không được phép**', 'Login của công ty là chỗ ngồi của công ty; yêu cầu xoá dữ liệu cá nhân đi qua hỗ trợ, không qua nút tự phục vụ'],
        ],
      },
      {
        kind: 'list',
        heading: 'Deactivate làm gì',
        items: [
          'Chặn đăng nhập **ngay lập tức**.',
          '**Giải phóng chỗ ngồi** để mời người thay thế.',
          'Tin tuyển dụng, ứng viên và các CV đã mở khoá của người đó **vẫn ở lại với tài khoản công ty** — không đi theo người.',
          'Dòng dữ liệu được giữ lại để phục vụ truy vết.',
          '**Đảo ngược được:** Reactivate khôi phục quyền truy cập và **chiếm lại một chỗ ngồi** — bị chặn nếu công ty đã dùng hết số chỗ.',
        ],
      },
    ],
  },

  /* ── Product settings ────────────────────────────────────────────────────── */
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
      'Đặt **cửa sổ kích hoạt** (mặc định 12 tháng) — field quyết định quota của khách hết hạn khi nào.',
      'Lưu — Product xuất hiện trong danh sách chọn khi lập báo giá.',
    ],
    watch: [
      'Chọn sai **Type** thì giao sai thứ cho khách, **âm thầm**, và chỉ lộ ra lúc xuất hoá đơn. Đây là field có tầm ảnh hưởng lớn nhất trên màn hình.',
      'Sản phẩm đã bán rồi mà sửa cửa sổ kích hoạt thì **không** dịch chuyển hạn của quota đã bán — hạn đó đã được chụp lại lúc cấp.',
    ],
    blocks: [
      {
        kind: 'warn',
        text:
          '**Những gì một bậc tin cho — thời lượng, nhịp làm mới, kiểu tiêu đề, thứ hạng tìm kiếm, vị trí trang chủ, badge — đến từ CẤU HÌNH BẬC, không từ sản phẩm.** Nếu để từng sản phẩm tự khai những thứ đó thì hai sản phẩm cùng tên “Top Job” có thể cho hai thứ khác nhau, và không ai phát hiện ra cho tới khi một khách hỏi vì sao tin của họ không giống tin của khách kia.',
      },
    ],
  },
  packages: {
    logic: ['Package (bundle) gộp nhiều Product thành một giá, một dòng trên báo giá.'],
    how: ['**New bundle** → đặt tên → thêm các Product thành phần → đặt giá gói.', 'Lưu. Bundle dùng được như một dòng báo giá.'],
  },
  placements: {
    logic: [
      'Một dòng = **một vùng hiển thị trên một trang**. Đây là **cấu hình thuần** — không đặt chỗ, không bán gì ở đây.',
      'Chỉ dòng có **Format = Display** mới nhận được banner hoặc popup.',
      '**Page, Key và Format là cố định.** Sửa được: kích thước ảnh, **Concurrent bookings** (= sức chứa), **Rotation period**, và ảnh tham chiếu.',
      '**Sức chứa = số quảng cáo được phép chồng nhau trong cùng một ngày** ở vùng đó — và nó **được hệ thống chặn thật** khi đăng.',
      '**Vòng xoay = một lượt quảng cáo kéo dài bao lâu.** Nó quyết định **ai lên trước**, không quyết định ai được chạy.',
    ],
    how: [
      'Mở một dòng **Display** → bấm sửa → chỉnh kích thước, sức chứa, vòng xoay, ảnh tham chiếu.',
      'Muốn nhiều khách chia nhau một vùng: **nâng Concurrent bookings ở đây trước**, rồi mới bán.',
    ],
    watch: [
      '**Điền cả rộng và cao là bật kiểm tra kích thước** cho vùng đó; để trống cả hai thì nhận mọi ảnh. **Điền một nửa thì bị từ chối.**',
      'Tắt một vùng (Inactive) thì Boosting báo “That region is switched off and no page draws it.”',
      '“Placement” có **ba nghĩa** trong hệ thống — xem bảng dưới.',
    ],
    blocks: [
      {
        kind: 'table',
        heading: 'Sức chứa và vòng xoay — đọc kỹ trước khi bán',
        note: 'Hai khái niệm hay bị gộp làm một, và gộp nhầm là hứa sai với khách.',
        cols: ['', 'Sức chứa (Concurrent bookings)', 'Vòng xoay (Rotation period)'],
        rows: [
          ['Trả lời', '**Bao nhiêu quảng cáo được chồng nhau trong cùng ngày**', '**Một lượt kéo dài bao lâu** trước khi đổi sang quảng cáo kế'],
          ['Ảnh hưởng', 'Ai **được chạy** — hệ thống chặn nếu hết chỗ', 'Ai **lên trước** — không chặn ai cả'],
          ['Vùng một-ô', 'Ví dụ sức chứa 6: sáu khách cùng chạy, nhưng người xem **thấy một cái tại một thời điểm**', 'Mỗi 60 s ô đó đổi sang quảng cáo kế; **mọi người trên site trong cùng một lượt thấy cùng một quảng cáo**'],
          ['Vùng slider / cột / hai-cái-một-lúc', 'Mọi quảng cáo đang chạy **đều trên màn hình**', 'Chỉ đổi thứ tự xuất hiện'],
        ],
      },
      {
        kind: 'warn',
        text:
          '**Sức chứa là ĐỘ PHỦ, không phải ĐỘC QUYỀN.** Bán cho khách “banner duy nhất ở trang chi tiết việc làm” nghĩa là vùng đó **không được chứa gì khác** trong những ngày đó — chứ không phải cứ đặt một booking là xong. Chỉ ở vùng **sức chứa = 1** (Home Ribbon, cột phải trang tìm kiếm, trang công ty) thì một booking mới đúng là cả vùng.',
      },
      {
        kind: 'table',
        heading: 'Các vùng đang bật trên dev (30/09/2026)',
        note: 'Cột **Tải lên** là kích thước file nên dùng — **2× ảnh tham chiếu**, sắc nét nhất mà site từng hiển thị. 3× chỉ nặng thêm chứ không đẹp hơn.',
        cols: ['Trang', 'Vùng', 'Kích thước', 'Sức chứa', 'Vòng xoay', 'Người xem thấy gì', 'Tải lên'],
        rows: [
          ['Home', 'Homepage - Home Hero', '614 × 320', '2', '300 s', 'Slider — mỗi quảng cáo là một slide', '1228 × 640'],
          ['Home', 'Homepage - Home Ribbon', '1260 × 48', '1', '60 s', 'Một dải trên header, có màu nền hai bên cho màn rộng', '2520 × 96'],
          ['Home', 'Homepage - Home Middle', '1260 × 60', '2', '60 s', 'Một dải; các quảng cáo thay phiên', '2520 × 120'],
          ['Home', 'Homepage - Popup', 'tuỳ ý', '1', '—', 'Một popup mỗi người xem, chọn theo đối tượng và ưu tiên', '—'],
          ['Search', 'Trang tìm kiếm — Banner cột phải', '273 × 327', '1', '60 s', 'Một cột bên phải — mọi quảng cáo xếp chồng', '546 × 654'],
          ['Job detail', 'Job detail - Bottom Banner', '728 × 90', '6', '60 s', 'Một ô; thay phiên theo lượt', '1456 × 180'],
          ['My page', 'My page banner', '400 × 152', '10', '60 s', 'Hai cái một lúc, còn lại sau mũi tên', '800 × 304'],
          ['Company page', 'Company page - Long banner', '994 × 94', '1', '300 s', 'Một dải trên hồ sơ công ty. **Công ty tự mua thì quảng cáo của họ thay quảng cáo mạng lưới**', '1988 × 188'],
          ['Employer home', 'Home - Top strip', '894 × 64', '6', '60 s', 'Một ô, thay phiên', '1788 × 128'],
          ['Employer home', 'Home - Mid strip', '1200 × 57', '6', '60 s', 'Một ô, thay phiên', '2400 × 114'],
          ['Employer home', 'Home - Right rail banner', '243 × 127', '6', '60 s', 'Một ô, thay phiên', '486 × 254'],
          ['Employer home', 'Home - Recommended talent rail', '282 × 235', '6', '60 s', 'Một ô, thay phiên', '564 × 470'],
          ['Employer home', 'Home - Service promo card', '840 × 150', '6', '60 s', 'Một ô, thay phiên', '1680 × 300'],
          ['Candidate mgmt (employer)', 'Candidate management - Left banner', '258 × 136', '6', '60 s', 'Một ô, thay phiên', '516 × 272'],
        ],
      },
      {
        kind: 'warn',
        text:
          'Các vùng **Job** (Top job, Super hot job, Distinction, Job card, Top search, Mega menu…) **không bán ở Boosting** — chúng là sản phẩm tin đăng, đi theo bậc tin.',
      },
      {
        kind: 'list',
        heading: 'Ảnh phải vừa — ba quy tắc',
        items: [
          'Rộng **tối thiểu bằng** ảnh tham chiếu: *“This region needs at least 994 px wide (yours is 800 px…)”*.',
          'Đúng **tỉ lệ, sai số 2%**: *“This region needs the shape of 994×94 (yours is 1000×300 — any width is fine at that ratio)”*.',
          'Admin **từ chối file sai** — không bao giờ tự kéo giãn hay tự cắt. Form mở khung crop theo tỉ lệ vùng để bạn chọn phần giữ lại; **để chữ tránh xa mép**.',
          'Vùng để **tuỳ ý kích thước** (popup) không kiểm gì cả — tự thống nhất với designer.',
        ],
      },
      {
        kind: 'table',
        heading: '“Placement” — ba nghĩa, ba nơi, ba vòng đời',
        note: 'Đây là nguồn nhầm lẫn số 1 trong toàn hệ thống: ba thứ khác nhau cùng mang một cái tên.',
        cols: ['Nghĩa', 'Là gì', 'Xem ở đâu'],
        rows: [
          ['**Vùng hiển thị**', 'Cấu hình: kích thước, sức chứa, vòng xoay', '**Trang này**'],
          ['**Bậc một tin đang chiếm**', 'Giao dịch: tin nào, bậc nào, ngày nào, gắn PO nào', 'Trong chi tiết tin — không có trang riêng'],
          ['**Booking banner**', 'Mua một chỗ hiển thị trong một kỳ', 'Service delivery → Boosting'],
        ],
      },
      {
        kind: 'warn',
        text:
          '**Lưu ý về Concurrent bookings:** theo ghi chú của team, con số này là **số slide của carousel**, và chỉ áp dụng cho banner có carousel — hiện mới chỉ **Home Hero** có. Ở các vùng còn lại nó đóng vai trò sức chứa. Nếu bạn định bán dựa trên con số này, hỏi lại team trước.',
      },
    ],
  },

  'quota-usage': {
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
    blocks: [
      {
        kind: 'table',
        heading: 'Kiểm MST — bốn kết quả, và chỉ một cái chặn lưu',
        note:
          'Chỉ **trùng nguyên MST đầy đủ** mới là trùng lặp và mới chặn lưu. **Trùng 10 số gốc KHÔNG phải trùng lặp** — đó là chi nhánh của cùng một pháp nhân, hoặc hai công ty tình cờ đụng nhau. Form không phán xét chuyện đó, nó liệt kê ra để rep tự quyết. Chặn ở đây là chặn nhầm một khách hàng mới hợp lệ.',
        cols: ['Kết quả', 'Rep thấy gì', 'Chặn lưu?'],
        rows: [
          ['Trùng nguyên MST', 'Báo lỗi, nêu tên công ty đang tồn tại, kèm link mở nó', '**Có** — công ty này đã có rồi'],
          ['Trùng 10 số gốc', 'Danh sách mọi công ty trên gốc đó: tên, MST đầy đủ, địa điểm, sales owner. Mỗi dòng cho liên kết theo hai chiều.', 'Không'],
          ['Tên pháp lý gần giống, MST khác', 'Cùng danh sách đó, khớp theo tên', 'Không'],
          ['Không trùng gì', 'Không hiện gì cả', 'Không'],
        ],
      },
      {
        kind: 'list',
        heading: 'Liên kết công ty mẹ / công ty con',
        items: [
          'Hai nút trên mỗi dòng có **số lượng khác nhau có chủ đích**: “**là con của**” chỉ đặt được trên **một** dòng (chọn dòng khác thì dòng cũ nhả ra), còn “**là mẹ của**” đặt được trên **nhiều** dòng cùng lúc. Đúng như dữ liệu: một công ty chỉ có một mẹ, nhưng có bao nhiêu con cũng được.',
          'Dùng cả hai chiều cùng lúc là hợp lệ — nghĩa là công ty mới nằm **giữa** một tập đoàn. Hệ thống kiểm cả chuỗi và **từ chối liên kết nào khiến một công ty thành tổ tiên của chính nó**.',
          'Liên kết là **tuỳ chọn và không bao giờ chặn lưu**. Rep bỏ qua danh sách thì tạo ra một bản ghi độc lập — và đó là kết quả **đúng** khi hai công ty thật sự chỉ tình cờ trùng gốc MST.',
          'Chi nhánh (cùng gốc 10 số, đuôi -001) và công ty con (MST khác hẳn) **lưu giống hệt nhau** — cùng một trường công ty mẹ. Nhãn hiển thị là suy ra từ việc so hai mã số thuế.',
        ],
      },
      {
        kind: 'warn',
        text:
          '**Liên kết không kế thừa bất cứ thứ gì, theo bất kỳ chiều nào.** Mỗi bản ghi giữ MST riêng, gói/quota riêng, báo giá riêng, hoá đơn riêng, người dùng riêng và sales owner riêng. **Một chi nhánh không bao giờ tiêu được quota của công ty mẹ.**',
      },
    ],
  },
  pipeline: {
    logic: ['Bảng sáu cột theo chặng bán, kéo thả để chuyển chặng. Một thẻ mở ra chính **báo giá** của nó.'],
    how: ['Kéo thẻ sang cột mới khi cơ hội chuyển chặng.', 'Bấm thẻ để mở báo giá phía sau nó.'],
    watch: [
      'Không có bản ghi “deal” tách biệt để sửa — mọi nội dung nằm ở báo giá.',
      'Kéo thẻ sang cột **Mất** **không** làm khách thành Churn; thắng một deal cũng **không** tự làm khách thành Existing. **Hoá đơn** mới đổi trục đó.',
      'Một công ty vừa **Existing** vừa đang **Negotiation** là tài khoản khoẻ mạnh — khách cũ đang mua tiếp — không phải dữ liệu mâu thuẫn.',
    ],
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
      '**Báo giá hết hiệu lực thì không dựng PO được**, dù option đã accepted. Phải gia hạn hiệu lực hoặc phát hành lại bản v2 — và điều này chặn ở server, không phải chỉ ẩn nút.',
    ],
    blocks: [
      {
        kind: 'table',
        heading: 'Bốn trạng thái báo giá',
        note: 'Chỉ **Draft** sửa được. Từ **Sent** trở đi là bất biến.',
        cols: ['Trạng thái', 'Nghĩa', 'Ra khỏi trạng thái này bằng'],
        rows: [
          ['**Draft**', 'Đang soạn — **trạng thái duy nhất sửa được**. Đã nằm trên pipeline ở chặng Proposal', 'Sales bấm **Mark as sent**'],
          ['**Sent**', 'Đã gửi khách (qua kênh nào cũng được — sales tự khai). **Bất biến từ đây**', 'Sales bấm **Issue PO** và chọn option khách nhận'],
          ['**Issued to PO**', 'Một option đã được nhận và PO đã tồn tại. **Điểm cuối**', '— Issue PO **chỉ dùng được một lần**; lần hai bị từ chối'],
          ['**Expired**', 'Hết tháng mà chưa có PO', '— Hệ thống. Công ty rời pipeline. **Đây KHÔNG phải Lost**: không lý do, không quyết định, trạng thái khách không đổi. Muốn tiếp thì **Duplicate** ra bản nháp mới'],
        ],
      },
      {
        kind: 'warn',
        text:
          '**Hạn báo giá LUÔN là ngày cuối tháng hiện tại** — không phải 30 ngày trượt. Báo giá lập ngày 05/07 và ngày 28/07 **cùng hết hạn 31/07**. Số báo giá cấp lúc lưu, theo dãy liên tục không đứt.',
      },
      {
        kind: 'list',
        heading: 'Vài ràng buộc trên builder',
        items: [
          'Mỗi option phải có **ít nhất một dòng có tính tiền**. Dòng **Gift** giá 0 và **không cho đặt giá**.',
          '**Không có tổng cộng toàn báo giá** và không được cộng các option lại — chúng thay thế nhau.',
          'Một **chương trình chiết khấu** cho cả tài liệu. Định tuyến duyệt đọc **mức % cao nhất** trong tài liệu: ≤ 10% → Sales lead · **> 10% → thẳng Sales manager**, không qua lead. Lead tự đặt ≤ 10% thì không cần ai duyệt.',
          'Đổi % **sau khi đã duyệt** thì **huỷ phê duyệt và định tuyến lại**.',
          'Tên pháp lý, MST, địa chỉ xuất hoá đơn **in từ hồ sơ công ty** — sai thì sửa ở đó, không sửa trên báo giá.',
        ],
      },
      {
        kind: 'example',
        heading: 'Ví dụ — vì sao option là “chọn một”, không phải “mua tất”',
        scenario:
          'Sales gửi Vạn Phát một báo giá ba option: **A** — 5 Top Job (60tr) · **B** — 10 Basic + 2 Top Job (55tr) · **C** — gói 12 tháng (120tr). Khách trả lời “ok em chốt option B”.',
        cols: ['Option', 'Sau khi khách chốt B', 'Nếu dựng PO nhầm từ A'],
        rows: [
          ['A — 5 Top Job', '**Bị loại**', 'PO ghi 60tr thay vì 55tr'],
          ['**B — 10 Basic + 2 Top Job**', '**Accepted** — đây là thứ dựng PO', '—'],
          ['C — gói 12 tháng', '**Bị loại**', '—'],
          ['**Hệ quả nếu nhầm**', '—', 'Khách nhận hoá đơn **sai số tiền**, và khi phát hành thì được cấp **5 slot Top Job** thay vì **10 Basic + 2 Top Job** — sai cả tiền lẫn hàng'],
        ],
        note:
          'Ba option **không cộng dồn**. Sai lầm hay gặp là đọc báo giá như một bảng giá rồi dựng PO từ dòng nào trông quen nhất. PO **chép nguyên** option đã Accepted, nên chọn đúng option ở bước này là chọn đúng cả hoá đơn lẫn quota sẽ cấp.',
      },
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
    watch: [
      'PO đã duyệt mà khách vẫn không đăng tin được là **đúng** — quota chỉ vào khi hoá đơn Issued.',
      'Danh sách **không có nút tạo mới**, và đó là chủ đích: PO chỉ sinh ra từ một option báo giá đã được chấp nhận.',
      'PO **không sửa được** — cần đổi thì phát hành PO mới. Cũng **không huỷ được**: PO không dùng thì tự hết hiệu lực **cuối tháng phát hành**.',
    ],
    blocks: [
      {
        kind: 'list',
        heading: 'Ba việc làm trên trang chi tiết PO',
        items: [
          '**Xem lại nội dung** đã chép từ option báo giá — dòng hàng, số lượng, đơn giá, VAT, tổng, và thông tin xuất hoá đơn đọc từ hồ sơ công ty.',
          '**Ghi số PO của chính khách** (kèm file) nếu bên mua có bộ phận mua hàng tự phát hành PO. Khách không có quy trình đó thì chỉ cần xác nhận đơn mình gửi.',
          '**Phát hành hoá đơn GTGT từ PO này** — đây là nơi hoá đơn được lập, và là mốc duy nhất cấp quota.',
        ],
      },
      {
        kind: 'table',
        heading: 'Năm trạng thái PO — một bước tiến, một lối thoát',
        cols: ['Trạng thái', 'Đạt được bằng', 'Ai'],
        rows: [
          ['**Active**', 'Issue PO từ option đã nhận. **Thắng deal, nhưng cấp 0 thứ**', 'Sales'],
          ['**Draft invoice**', 'Export draft invoice — tài liệu làm việc, **không có số pháp lý**, không cấp gì. Không bắt buộc', 'Sales'],
          ['**Invoice requested**', 'Request official invoice — đẩy sang hàng đợi kế toán', 'Sales — **cần công ty đã Verified**'],
          ['**Issued invoice**', 'Kế toán phát hành hoá đơn chính thức. **Sản phẩm vào tài khoản ngay lúc đó.** Điểm cuối', '**Chỉ kế toán**'],
          ['**Expired**', 'Hết tháng mà chưa có hoá đơn chính thức — từ bất kỳ trạng thái nào ở trên. **Không ai bấm gì cả**', 'Hệ thống (quét theo giờ)'],
        ],
      },
      {
        kind: 'warn',
        text:
          '**Hạn là CUỐI THÁNG, không phải 30 ngày trượt** — PO lập 05/07 và 28/07 cùng hết hạn 31/07, đúng quy tắc của báo giá. Dòng có thể vẫn đọc là Active vài giờ sau cuối tháng trước khi máy quét chạy, nhưng **nút Issue đã từ chối rồi**.',
      },
      {
        kind: 'warn',
        text:
          '**Thanh toán KHÔNG phải một trạng thái.** Nó là nhãn riêng: Unpaid · Partially paid · Paid (· Overdue +N ngày). **Việc xuất hoá đơn không bao giờ bị chặn bởi thanh toán.** Và **sửa dịch vụ chỉ được khi còn Active** — đã đẩy sang kế toán thì các con số đang nằm trên một chứng từ đang được lập.',
      },
      {
        kind: 'warn',
        text:
          '**PO là “đã thắng deal”, không phải “đã giao hàng”.** Nó không tạo tài khoản, không cấp quota, không bật trang công ty. Trạng thái khách hàng cũng **không đổi** ở bước này. Mọi thứ đó chờ kế toán phát hành hoá đơn.',
      },
    ],
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
      '**Hoá đơn đã phát hành thì không sửa được, và trong admin KHÔNG CÓ nút Huỷ.** Sai thì đính chính trên **cổng của nhà cung cấp hoá đơn điện tử**, ngoài hệ thống này. Đừng đi tìm nút huỷ — nó không tồn tại, và đó là chủ đích.',
    ],
    blocks: [
      {
        kind: 'list',
        heading: 'Vì sao trang này không có nút “Tạo hoá đơn”',
        items: [
          'Hoá đơn **không được soạn ra**, nó được **phát hành từ một PO còn hiệu lực**. Đường dẫn `/crm/invoices/new` **không tồn tại** — có nút ở đây nghĩa là mời người ta tạo một chứng từ thuế không gắn cam kết nào.',
          'Số hoá đơn đến từ **nhà cung cấp hoá đơn điện tử**, theo dãy số pháp lý liên tục — không phải mình đánh số. Bản nháp **đã mang sẵn một số**, nên không cần thêm mã nội bộ thứ hai.',
          'Trang này làm ba việc: **khai báo phát hành** · **tải PDF đã ký** · **gửi email cho khách**.',
        ],
      },
      {
        kind: 'warn',
        text:
          '**Bản nháp không cấp gì cả.** Việc cấp quota nghe sự kiện “phát hành **chính thức**”, không nghe bản nháp — và điều đó được đảm bảo ở tầng xử lý sự kiện, không chỉ ở giao diện. Nên một hoá đơn nháp trông đầy đủ vẫn để khách với 0 lượt đăng tin.',
      },
      {
        kind: 'table',
        heading: 'Bốn trạng thái hoá đơn — không cái nào được lưu',
        note: 'Trạng thái hoá đơn **suy ra từ PO của nó mỗi lần đọc**. Không có gì trên màn hình này đặt được nó.',
        cols: ['Hoá đơn', 'PO tương ứng', 'Nghĩa'],
        rows: [
          ['**Draft**', 'Draft invoice', 'Tài liệu làm việc, **không số pháp lý**. Cấp 0 thứ. Xem trước và gửi bản nháp được'],
          ['**Invoice requested**', 'Invoice requested', 'Đang trong hàng đợi kế toán. **Vẫn chưa cấp gì**, và đồng hồ cuối tháng **vẫn chạy**'],
          ['**Issued**', 'Issued invoice', 'Đã khai với nhà cung cấp, **có số pháp lý**, bất biến. **Sản phẩm đã cấp** · deal WON · khách New → Existing · hạn kích hoạt = ngày phát hành + 12 tháng'],
          ['**Archived**', 'Expired', 'PO của nó hết hạn trước. **Chưa từng cấp gì nên không có gì để thu hồi**'],
        ],
      },
      {
        kind: 'list',
        heading: 'Hộp thoại phát hành thực chất là một trình soạn email',
        items: [
          '**To** (liên hệ của công ty) · **CC** (liên hệ + chủ deal) · **file PDF hoá đơn** đính kèm (bản ký của nhà cung cấp sau khi phát hành) · **mã QR thanh toán luôn có** · link điều khoản.',
          '**Số pháp lý do nhà cung cấp hoá đơn điện tử cấp** và trả về kèm mã tra cứu — **không ai gõ**.',
          'Luôn hiện **hai số**: mã nội bộ của mình (INV-…, cấp từ lúc nháp) và **số pháp lý** (về khi phát hành). Bản nháp hết hạn **không tiêu số nào của dãy thuế**.',
          'Bấm lại hộp thoại này trên hoá đơn đã phát hành thì **chỉ gửi lại mail**, không phát hành lần hai.',
          '**Xác nhận chuyển khoản** ghi tiền vào đơn (đợt, số tiền, ngày, mã giao dịch). Nó lật Unpaid → Partially paid / Paid và **không bao giờ cấp thêm quota**.',
        ],
      },
      {
        kind: 'open',
        text:
          '**Chưa chốt — phát hành trùng.** Sự kiện “hoá đơn đã phát hành” **có thể bắn hai lần** (nhà cung cấp hoá đơn timeout rồi thử lại là chuyện bình thường). Việc cấp quota phải khoá theo mã hoá đơn, nếu không khách **âm thầm nhận gấp đôi quota**. Đây là lỗi production dễ xảy ra nhất trong cả chuỗi.',
      },
    ],
  },
  'company-claims': {
    logic: [
      'Đây là **nhật ký của chính rep** về các yêu cầu nhận công ty từ Free data — **không có nút bấm ở đây**, có chủ đích: quyết định nằm trên hồ sơ công ty.',
      'Free data và Customers là **một bảng ở hai mức hoàn thiện**. Dòng Free data chỉ cần tên công ty, không có chủ, **không được tính vào bất kỳ con số CRM nào**, và **không mang nổi báo giá/PO/hoá đơn**.',
      '“Promote” một dòng **không phải là copy** — nó là **hoàn thiện hồ sơ và gán chủ**.',
    ],
    how: [
      'Rep mở công ty trong **Free data** → **Ask for this company** (lý do + đầu mối liên hệ + bằng chứng).',
      '**Admin duyệt bước 1** — đọc lý do và bằng chứng, có thể ghi chú cho rep. Bước này **chưa tạo ra gì**.',
      '**Sales lead duyệt bước 2** — đây mới là lần ghi duy nhất: rep thành sales owner, đầu mối thành liên hệ #1, công ty rời Free data, **mọi yêu cầu đang mở khác bị từ chối**.',
      'Theo dõi kết quả ở trang này.',
    ],
    watch: [
      '**Mỗi lúc chỉ một yêu cầu mở.** Rep khác mở cùng công ty sẽ **không thấy nút Ask**.',
      '**Từ chối không phải một trạng thái của công ty** — công ty quay về *Not claimed* và hiện “đã bị từ chối N lần”. Ai cũng xin lại được, kể cả chính rep đó.',
      '**Cổng MST nằm ở nút TẠO RA CHỦ SỞ HỮU** — tức nút duyệt của lead và nút Assign của admin — **không nằm ở bước 1 của admin**, vì bước đó không tạo gì. Không có MST thì nút duyệt bị khoá; **Reject thì lúc nào cũng bấm được**.',
    ],
    blocks: [
      {
        kind: 'table',
        heading: 'Trạng thái một dòng Free data — và “bị từ chối” không nằm trong đó',
        cols: ['Dòng hiện', 'Nghĩa', 'Xin được không?'],
        rows: [
          ['**Not claimed**', 'Đang trống — chưa ai hỏi', '**Được**'],
          ['**Waiting · bước 1 · Admin**', 'Một rep đã hỏi, Admin chưa quyết', 'Không — nút Ask biến mất với mọi người khác'],
          ['**Waiting · bước 2 · Sales lead**', 'Admin đã chuyển tiếp, lead đang quyết', 'Không'],
          ['*(bị từ chối)*', '**Không phải một trạng thái.** Yêu cầu bị Rejected, công ty về *Not claimed* kèm “Rejected N lần trước đó”', '**Được** — ai cũng xin lại được'],
        ],
      },
      {
        kind: 'warn',
        text:
          '**Admin có đường tắt: “Assign directly”** trên hồ sơ công ty — chọn một rep và gán luôn, **không qua chuỗi duyệt**. Nếu đang có yêu cầu mở thì nó **tự bị từ chối kèm ghi chú nêu tên người được gán**. Trên công ty đã có chủ, cùng cái thẻ đó đọc là **Change sales owner / Reassign**.',
      },
      {
        kind: 'warn',
        text:
          '**Trả công ty về pool** trên một công ty đang có chủ sẽ nhả nó lại Free data. Lần trả đó là **một dòng trong Owner history** (chuỗi hiện *closed* — ngay lúc này không ai chịu trách nhiệm), và dòng về tới pool **mang theo lịch sử** cho người duyệt kế tiếp thấy.',
      },
    ],
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
    watch: [
      'Chỉ **Move** và **Create** mới mở được đăng nhập cho người đó.',
      'Đừng coi một dòng sign-up là một khách hàng. Nó là **một yêu cầu**, và tới khi admin xử lý thì nó chưa là gì trong hệ thống.',
    ],
    blocks: [
      {
        kind: 'table',
        heading: 'Ba lựa chọn — và mỗi lựa chọn tạo ra cái gì',
        note: 'Nộp form **không tạo ra bất cứ thứ gì**: không công ty, không tài khoản đăng nhập, không sản phẩm. Ba nút dưới đây là nơi thứ gì đó thực sự được tạo.',
        cols: ['Lựa chọn', 'Dùng khi', 'Tạo ra gì', 'Người đăng ký đăng nhập được?'],
        rows: [
          ['**Move**', 'Công ty **đã có** trong hệ thống', 'Gắn người này vào công ty đó như một tài khoản đăng nhập', '**Có**'],
          ['**Create company & activate**', 'Công ty **chưa có**', 'Tạo hồ sơ công ty **và** tài khoản đăng nhập đầu tiên', '**Có**'],
          ['**Archive**', 'Rác, trùng, hoặc không phải khách thật', 'Không gì cả — chỉ dọn dòng khỏi hộp thư', '**Không**'],
        ],
      },
      {
        kind: 'warn',
        text:
          'Đối chiếu **MST** trước khi bấm Create — tạo mới trong khi công ty đã tồn tại là tạo ra bản ghi trùng, và sau này hoá đơn với quota sẽ nằm sai chỗ. Nếu MST đã có thì đúng lựa chọn là **Move**, không phải Create.',
      },
      {
        kind: 'warn',
        text:
          '**Cột Match không quyết định gì cả.** Nó chỉ *báo cáo* lúc đọc: mã số thuế (hoặc tên miền email công việc, hoặc tên) đã thuộc về công ty nào chưa, và gắn nhãn Customers hay Free data. Việc duy nhất nó làm là **chọn sẵn công ty trong hộp thoại Move**. Tên miền email công cộng (@gmail.com) **không bao giờ khớp gì**.',
      },
      {
        kind: 'warn',
        text:
          '**Dòng chưa xác thực email vẫn hiện, gắn nhãn “Awaiting”, không bị ẩn.** Nó **archive được nhưng không place được** — server từ chối Move/Create dù giao diện có mời. Hộp thoại Move còn dừng ở hai trường hợp và nói rõ lý do: *“mã số thuế này chưa tới công ty nào”* (→ tạo công ty trước) và *“công ty đó vẫn ở Free data”* (→ mở công ty và promote). **Không ai bị đặt vào một công ty không tồn tại hoặc không có chủ.**',
      },
    ],
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
    watch: [
      'Duyệt nhầm Legal changes là sai thông tin hoá đơn VAT của khách — kiểm MST và tên pháp lý thật kỹ.',
      'Hai tab sắp xếp **cũ trước** có chủ đích: giấy tờ chờ lâu nhất là thứ đang chặn một công ty không đăng tin được.',
    ],
    blocks: [
      {
        kind: 'table',
        heading: 'Hai tab — cùng thao tác, khác hậu quả hoàn toàn',
        cols: ['', 'Documents', 'Legal changes'],
        rows: [
          ['Là gì', 'Giấy tờ khách nộp để xác minh công ty', 'Yêu cầu **đổi thông tin pháp lý** mà hoá đơn được xuất từ đó'],
          ['Duyệt xong thì', 'Công ty chuyển được sang **Verified** → đăng tin được', '**Thông tin in trên hoá đơn VAT đổi theo**'],
          ['Duyệt nhầm thì', 'Một công ty chưa đủ giấy tờ được đăng tin', '**Hoá đơn VAT xuất sai tên hoặc sai MST** — khách không kê khai thuế được'],
          ['Cần kiểm gì', 'Giấy tờ khớp hồ sơ công ty', '**MST và tên pháp lý**, đối chiếu giấy tờ gốc'],
        ],
      },
    ],
  },

  /* ── Content ─────────────────────────────────────────────────────────────── */
  boosting: {
    logic: [
      'Banner và popup **gộp một danh sách duy nhất** (trước là trang Displays hai tab). Nút **New** hỏi **vùng hiển thị trước** — chọn vùng popup thì thành popup, chọn vùng khác thì thành banner.',
      'Một banner **không bao giờ chỉ là “tải ảnh lên”**. Nó cưỡi trên một **booking** — quyền chạy một quảng cáo, ở một vùng, trong một số ngày.',
      '**Hoá đơn GTGT phát hành mới tạo ra booking** (trạng thái *Reserved*). Chưa phát hành thì đơn đó **không hiện ra** trong Boosting để chọn.',
      '**Ngày kết thúc không bao giờ gõ tay** với quảng cáo của khách: = ngày bắt đầu + số ngày đã mua trên dòng hàng. Bán 30 ngày là chạy đúng 30 ngày.',
      'Quảng cáo **nội bộ** (Source = Internal — Saramin VN) **không cần booking** — nhưng **vẫn chiếm chỗ** trong vùng.',
    ],
    how: [
      'Kiểm trước: khách **đã có PO với dòng Placement booking cho đúng vùng**, và **hoá đơn đã phát hành**.',
      'Kiểm booking **chưa hết hạn dùng** — quá cửa sổ “Must be used within” (mặc định 12 tháng từ ngày hoá đơn) thì thành **Lapsed**, không đăng được.',
      'Kiểm vùng **còn chỗ cho đúng dải ngày** muốn chạy — xem cột Region · Status · Starts · Ends trên chính danh sách Boosting.',
      'Chuẩn bị ảnh **đúng tỉ lệ vùng, kích thước 2×**, và link đích.',
      '**+ New** → chọn **Region** → đặt **Banner name** (chỉ admin thấy) và **Purpose**.',
      '**Source = Customer** → chọn công ty → chọn **Order / PO** → chọn **dòng sản phẩm** (dòng này quyết định vùng và số ngày).',
      'Đặt **Start date** (để trống = chạy ngay; ngày kết thúc tự điền) → bật **Visible on the site** → tải ảnh và **crop theo khung vùng** → đặt **Link target**.',
      '**Status → Published** để lên ngay, hoặc **Draft** để lưu rồi đăng sau → **Save**.',
    ],
    watch: [
      '**Ẩn bằng Visible = Off KHÔNG trả lại chỗ.** Chỉ **Draft · Archive · Delete** mới giải phóng vùng.',
      'Đã **Published** thì **vùng, đơn hàng và dòng hàng bị khoá** — muốn đổi thì phải tạo cái mới.',
      '**Xoá một quảng cáo còn hạn sẽ trả booking về *Reserved*** — dùng lại được cho quảng cáo khác.',
      'Admin **từ chối ảnh sai**, không bao giờ tự kéo giãn hay tự cắt. Form mở sẵn khung crop theo tỉ lệ vùng — **để chữ tránh xa mép**.',
      'Đăng rồi mà không thấy trên site: kiểm **Visible** · ngày bắt đầu còn ở tương lai · đã hết hạn · vùng một-ô thì **chờ hết một vòng xoay** (60 s hoặc 300 s).',
    ],
    blocks: [
      {
        kind: 'table',
        heading: 'Một chuỗi, bốn màn hình',
        note: 'Không nhảy cóc được: chưa có vùng thì không có sản phẩm, chưa phát hành hoá đơn thì Boosting không thấy đơn nào để chọn.',
        cols: ['Bước', 'Màn hình', 'Điều gì xảy ra'],
        rows: [
          ['1 · Quảng cáo đặt được ở đâu?', '**Placements**', 'Danh sách vùng trên site: kích thước, sức chứa, vòng xoay. **Chỉ cấu hình — không đặt chỗ ở đây.**'],
          ['2 · Bán cái gì?', '**Products**', 'Một sản phẩm *Placement booking* = một vùng + số ngày + số lượt dùng.'],
          ['3 · Ai mua?', '**Quotations → PO → Invoices**', 'Phát hành hoá đơn GTGT cho dòng sản phẩm đó **tạo ra booking**, trạng thái **Reserved** (đã trả tiền, chưa dùng).'],
          ['4 · Dựng quảng cáo', '**Boosting**', 'Tạo banner/popup, chọn đơn và dòng hàng, đặt ngày bắt đầu, tải ảnh, **Publish**. Booking bắt đầu đếm ngày.'],
        ],
      },
      {
        kind: 'table',
        heading: 'Hai trục trạng thái — của quảng cáo, và của booking',
        note: 'Cột cuối là thứ quyết định vùng còn chỗ hay không.',
        cols: ['Trạng thái booking', 'Nghĩa', 'Chiếm chỗ trong vùng?'],
        rows: [
          ['**Reserved**', 'Đã trả tiền, chưa có quảng cáo nào dựng trên nó — đây chính là thứ danh sách Order / PO đưa ra cho bạn chọn', '**Không**'],
          ['**Scheduled**', 'Quảng cáo đã đăng với ngày bắt đầu ở tương lai', '**Có**'],
          ['**Active**', 'Đang hiển thị', '**Có**'],
          ['**Expired**', 'Hết số ngày — quảng cáo tự rời khỏi site', 'Không'],
          ['**Lapsed**', 'Chưa từng dùng trước hạn “Must be used within”', 'Không'],
        ],
      },
      {
        kind: 'table',
        heading: 'Trạng thái của chính quảng cáo',
        cols: ['Trạng thái', 'Nghĩa'],
        rows: [
          ['Draft', 'Đã lưu, chưa lên site. **Vùng, đơn và dòng hàng vẫn đổi được**'],
          ['Review', 'Lưu để người khác duyệt trước. Chưa lên site, y như Draft'],
          ['**Published**', 'Đang chạy (trong dải ngày, Visible = On). **Vùng, đơn và dòng hàng bị khoá**'],
          ['Archived', 'Đã xong. Rời site và **trả lại chỗ**'],
        ],
      },
      {
        kind: 'warn',
        text:
          'Hệ thống **tự** chuyển booking Scheduled → Active → Expired. **Không ai phải đi tắt quảng cáo.** Và ngược lại: tắt **Visible** chỉ giấu quảng cáo khỏi mắt người xem — **chỗ trong vùng vẫn bị giữ**, nên đơn kế tiếp vẫn bị chặn. Muốn trả chỗ thì **Draft, Archive hoặc Delete**.',
      },
      {
        kind: 'table',
        heading: 'Gặp lỗi thì đọc bảng này',
        cols: ['Bạn thấy', 'Vì sao', 'Làm gì'],
        rows: [
          ['Order / PO chỉ đưa ra “— No order (free) —”', 'Công ty này **không có dòng nào chưa dùng cho vùng đó**: hoá đơn chưa phát hành, dòng mua cho vùng khác, hoặc đã dùng rồi', 'Kiểm PO và hoá đơn ở Purchase orders / Invoices'],
          ['“… is full for those dates (x of y slots booked). Free from …”', 'Sức chứa của vùng đã kín một phần dải ngày bạn chọn', 'Bắt đầu từ ngày hệ thống báo, hoặc chọn vùng khác'],
          ['“… already shows x of y banners over those dates”', 'Các quảng cáo đang chạy (**kể cả quảng cáo nội bộ**) đã lấp đầy vùng', 'Archive hoặc chuyển Draft một cái ở đó, hoặc dời ngày bắt đầu'],
          ['“This region needs at least … px wide”', 'Ảnh hẹp hơn ảnh tham chiếu', 'Xuất lại ở **2×**'],
          ['“This region needs the shape of …”', 'Sai tỉ lệ', 'Crop lại theo đúng tỉ lệ vùng'],
          ['“That region is switched off and no page draws it.”', 'Vùng đang **Inactive** ở Placements', 'Chọn vùng đang bật'],
          ['“A banner scoped to a company page must be booked by that same company.”', '“One company page” trỏ vào công ty khác với công ty đã trả tiền', 'Chọn đúng trang công ty đã mua, hoặc chuyển sang “Every company page”'],
          ['Đã Published mà không thấy trên site', 'Visible = Off · chưa tới ngày bắt đầu · đã hết ngày · vùng một-ô và đang tới lượt quảng cáo khác · trên trang công ty thì công ty đó đang chạy quảng cáo riêng', 'Kiểm Visible/Starts/Ends trên dòng đó, rồi **chờ hết một vòng xoay**'],
        ],
      },
      {
        kind: 'list',
        heading: 'Popup hỏi thêm vài field',
        items: [
          '**Audience** — Guests · Jobseekers · Employers (để trống = mọi người).',
          '**Frequency** — một lần mỗi phiên · một lần mỗi ngày · mỗi lần vào.',
          '**Priority** — **số nhỏ thắng**, vì mỗi người xem chỉ thấy **một** popup.',
          '**CTA** — nhãn nút và link.',
        ],
      },
      {
        kind: 'open',
        text:
          '**Ghi nhận trên dev ngày 30/09/2026 — hai điểm chưa khớp.** (1) Field **Purpose** hiện dấu sao bắt buộc, nhưng dòng gợi ý lại ghi “Optional” — một trong hai sai. (2) **Home Hero có sức chứa 2, nhưng đang có 6 quảng cáo khách được đăng cùng ngày** (dữ liệu demo nạp thẳng vào DB). Site chỉ hiện 2 mỗi vòng — nếu muốn nhiều khách chia nhau hero thì phải **nâng Concurrent bookings ở Placements trước**.',
      },
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
    logic: [
      'Một **zone** (채용관) là trang chiến dịch có thương hiệu, có **đường dẫn công khai riêng**, ghép từ các collection.',
      'Zone không tự chứa tin — nó **bố cục** các collection thành một trang. Nội dung vẫn do collection quyết định.',
    ],
    how: [
      '**New zone** → đặt **slug** (đây chính là đường dẫn công khai).',
      'Chọn collection đổ vào từng khối, rồi sắp thứ tự khối.',
      'Xem preview thứ tự khối bên cạnh rồi lưu.',
    ],
    watch: [
      'Một số slug bị **giữ chỗ** và không dùng được cho zone — trùng vào là lưu hỏng.',
      'Zone trông rỗng thường **không phải lỗi của zone**: kiểm các **collection bên trong** có còn trả về tin không.',
    ],
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
    watch: [
      'Đổi vai trò của người đang đăng nhập thì họ phải đăng xuất vào lại mới thấy quyền mới.',
      '**Không ai gõ mật khẩu hộ người khác.** Người được mời bấm link và tự đặt mật khẩu của mình.',
    ],
    blocks: [
      {
        kind: 'table',
        heading: 'Thứ tự tạo một operator — bắt buộc theo đúng trình tự',
        note: 'Bỏ bước là kẹt ở bước sau: chưa có vai trò thì không gán được, chưa gán thì mời ra một tài khoản không làm được gì.',
        cols: ['Bước', 'Việc'],
        rows: [
          ['1', 'Thêm người vào **danh bạ nhân sự** (chỉ một lần cho mỗi người)'],
          ['2', 'Định nghĩa **vai trò** ở Roles & permissions'],
          ['3', 'Tạo **operator** — chọn người từ danh bạ'],
          ['4', 'Gán **vai trò đã lưu**'],
          ['5', 'Gửi **lời mời**'],
        ],
      },
      {
        kind: 'table',
        heading: 'Hai nhóm người dùng không bao giờ lẫn vào nhau',
        cols: ['Nhóm', 'Là ai', 'Làm việc ở đâu'],
        rows: [
          ['**Operator**', 'Nhân viên Saramin (nội bộ HQ)', 'Admin console'],
          ['**Company user**', 'Nhân sự của khách hàng', 'Trang công ty'],
        ],
      },
      {
        kind: 'warn',
        text:
          'Hai nhóm này **dùng chung một mẫu mời** nhưng **không bao giờ là cùng một danh sách**. Trạng thái cũng giống nhau: **Pending** (đã mời) → **Active** (đã bấm link và đặt mật khẩu).',
      },
    ],
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
    blocks: [
      {
        kind: 'list',
        heading: 'Vai trò do team tự quản — không có vai trò hệ thống bị khoá',
        items: [
          'Hệ thống có sẵn vài vai trò mặc định hợp lý, nhưng chúng là **vai trò bình thường, sửa được** — không có loại “vai trò hệ thống” nào bị khoá cứng.',
          '**Không xoá được vai trò đang có operator giữ.** Gỡ người ra trước.',
          '**Luôn phải còn ít nhất một vai trò giữ toàn quyền**, để không ai tự khoá mình ra khỏi hệ thống.',
          'Gỡ = **vô hiệu hoá, không bao giờ xoá cứng**, để dấu vết truy vết còn nguyên. **Mọi** thay đổi vai trò và operator đều được ghi log.',
        ],
      },
      {
        kind: 'warn',
        text:
          'Quyền hiển thị ở giao diện chỉ là **trải nghiệm** — nó ẩn nút người dùng không bấm được. Chặn thật nằm ở server, trên **mọi** lời gọi, kèm cả kiểm tra phạm vi theo từng dòng. Đừng bao giờ coi việc ẩn nút là một lớp bảo mật.',
      },
    ],
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
    blocks: [
      {
        kind: 'table',
        heading: 'Trạng thái một giá trị danh mục — và vì sao không có nút Xoá',
        cols: ['Trạng thái', 'Nghĩa', 'Quy tắc'],
        rows: [
          ['**Active**', 'Dùng được, hiện trong mọi ô chọn', '**Đổi tên là an toàn** — bản ghi lưu mã số, không lưu chữ hiển thị'],
          ['**Retired**', 'Không còn được chọn mới, nhưng **vẫn đọc được** cho các bản ghi cũ', 'Giá trị đang được dùng thì **cho nghỉ hoặc gộp, không bao giờ xoá cứng**'],
        ],
      },
      {
        kind: 'warn',
        text:
          'Đây là lý do đổi tên một ngành nghề không làm hỏng dữ liệu cũ, còn xoá thì có. Hàng nghìn tin tuyển dụng và CV trỏ vào giá trị đó bằng **mã số**; xoá cứng biến chúng thành trỏ vào hư không, và không có cách nào dựng lại nhãn đã mất. Gộp hai giá trị trùng nghĩa thì dùng **alias**, đừng xoá cái này rồi sửa tay cái kia.',
      },
    ],
  },
  'audit-log': {
    logic: ['Nhật ký thao tác chạm dữ liệu nhạy cảm: mở hồ sơ ứng viên, xuất dữ liệu, phát hành hoá đơn.'],
    how: [
      'Lọc theo hành động, loại đối tượng, người thực hiện, mã đối tượng, hoặc khoảng ngày.',
      'Cần đưa ra ngoài: **xuất CSV** đúng bộ lọc đang xem.',
    ],
    watch: ['Đây là nơi tra khi có khiếu nại “ai đã xem/sửa cái này”.'],
  },
  'zalo-templates': {
    logic: ['Ràng buộc mẫu Zalo ZNS theo từng hành động. Mẫu do Zalo duyệt; ở đây chỉ khai mã mẫu ứng với hành động nào.'],
    how: ['Mở hành động cần gắn → điền mã mẫu Zalo đã được duyệt → lưu.'],
    watch: ['Mẫu phải được Zalo duyệt trước; hệ thống không tạo mẫu hộ.'],
  },
  /* ── Dashboards (new group) ──────────────────────────────────────────────── */
  'dashboard-sales': {
    logic: ['Phễu bán, cơ cấu hoạt động và các chỉ số chính của đội Sales, cộng doanh thu theo nhóm ngành.'],
    how: ['Chọn kỳ → đọc phễu để biết cơ hội đang đọng ở chặng nào.', 'Đối chiếu với **Pipeline** nếu một chặng phình bất thường.'],
    watch: ['Doanh thu ở đây đọc theo **ngày hoá đơn**, không theo ngày PO.'],
  },
  'dashboard-sales-planning': {
    logic: ['Kế hoạch và chỉ tiêu của đội Sales, đặt cạnh kết quả thực tế.'],
    how: ['Chọn kỳ → so chỉ tiêu với thực tế → chỗ lệch nhiều là chỗ cần hỏi.'],
  },
  'dashboard-marketing': {
    logic: ['Bảng theo dõi của đội Marketing.'],
    how: ['Chọn kỳ → đọc các chỉ số của kỳ đó.'],
  },
  'dashboard-product': {
    logic: ['Bảng theo dõi của đội Sản phẩm: sản phẩm và tin đăng chạy ra sao.'],
    how: ['Chọn kỳ → đọc các chỉ số của kỳ đó.'],
  },

  /* ── Product settings ────────────────────────────────────────────────────── */
  'product-ladder': {
    logic: [
      'Thang bậc tin đăng: **bậc nào đứng trên bậc nào**. Vị trí trên thang quyết định thứ tự tin xuất hiện trong danh sách **Gợi ý** công khai, và thứ tự bậc hiện ra ở các màn hình chọn gói.',
      'Vị trí đặt bằng cách **kéo thả** — hệ thống tự tính giá trị nằm giữa hai bậc kề, nên **không bậc nào khác bị xê dịch**.',
    ],
    how: [
      'Mở thang → kéo một bậc tới vị trí mong muốn → lưu.',
      'Cũng đặt được từ chính form sản phẩm, ở ô vị trí thang.',
    ],
    watch: [
      '**Hai bậc đang Active không được trùng vị trí** — hệ thống từ chối.',
      'Khi hết số nguyên trống giữa hai bậc, hệ thống báo cần **giãn lại thang** — lúc đó mới phải sắp lại cả dãy.',
      'Bậc nào lưu mà không đặt vị trí thì bị đẩy **xuống đáy**.',
    ],
  },

  /* ── Content ─────────────────────────────────────────────────────────────── */
  'site-notices': {
    logic: [
      'Bảng thông báo và sự kiện của trung tâm trợ giúp — phần khách truy cập đọc dưới mục 공지/이벤트.',
      'Hai loại nội dung: **thông báo** (có danh mục, ngày, lượt xem) và **sự kiện**.',
    ],
    how: ['**New** → chọn loại → viết nội dung → đặt danh mục và ngày → lưu.'],
  },

  /* ── Notifications (new group) ───────────────────────────────────────────── */
  'notification-rules': {
    logic: [
      'Một quy tắc nối **sự kiện → mẫu → người nhận**. Đây là phần gửi **tự động**.',
      'Quy tắc mở ra **trang riêng, không phải drawer**, vì cần chỗ cho trình soạn nằm cạnh phần xem trước đã dựng.',
    ],
    how: [
      '**Soạn mẫu trước** ở Message templates — quy tắc chỉ trỏ vào mẫu, không chứa nội dung.',
      '**New rule** → chọn sự kiện kích hoạt → chọn mẫu → chọn người nhận → lưu.',
      'Kiểm ở **Delivery history** xem nó có thật sự gửi không.',
    ],
    watch: ['Tắt một quy tắc **không** thu hồi những tin đã gửi — nó chỉ ngừng gửi tiếp.'],
  },
  'notification-send': {
    logic: ['Gửi một lần cho một nhóm người nhận, không tạo quy tắc. Dùng cho thông báo không lặp lại.'],
    how: ['Chọn mẫu → chọn người nhận → xem lại → gửi.'],
    watch: [
      'Quyền ở đây là **`create`, không phải `read`** — gửi tin cho khách là một hành động, nên người xem được lịch sử chưa chắc gửi được.',
      '**Gửi rồi thì không rút lại được.** Xem kỹ danh sách người nhận trước khi bấm.',
    ],
  },
  'notification-history': {
    logic: ['Lịch sử mọi tin đã gửi — cả tự động lẫn gửi tay. Đây là nơi trả lời “khách có nhận được không”.'],
    how: ['Lọc theo kỳ, theo mẫu hoặc theo người nhận → mở một dòng để xem trạng thái gửi.'],
    watch: ['Khách báo không nhận được thì kiểm ở đây **trước**, rồi mới nghi ngờ quy tắc hay mẫu.'],
  },
  'notification-templates': {
    logic: [
      'Mẫu nội dung dùng chung cho các quy tắc tự động và các lần gửi tay.',
      'Mẫu **tách khỏi** quy tắc: một mẫu dùng cho nhiều quy tắc.',
    ],
    how: ['**New template** → soạn nội dung → **kiểm phần xem trước với dữ liệu thật** → lưu.'],
    watch: ['Sửa một mẫu là đổi nội dung của **mọi** quy tắc đang dùng nó — kiểm trước xem có những quy tắc nào.'],
  },

  /* ── System ──────────────────────────────────────────────────────────────── */
  'analytics-logs': {
    logic: [
      'Log **thô** của tìm kiếm và thẻ hiển thị trên site. Hai tab: **Search log** và **Card & behaviour log**.',
      '**Giai đoạn 1 chỉ hiện những gì đã thu được, đúng như đã thu** — chưa có tỉ lệ, chưa có CTR, chưa phân tích theo thứ hạng. Xử lý số liệu là giai đoạn 2, đã quyết như vậy.',
    ],
    how: [
      'Chọn kỳ và công tắc lọc bot ở đầu trang.',
      'Đọc các thẻ đếm, rồi mở tab cần xem.',
      'Bấm một mã phiên để lần theo hành vi của phiên đó.',
    ],
    watch: ['Đừng đọc trang này như một báo cáo — nó là **dữ liệu thô**. Con số ở đây chưa loại nhiễu và chưa quy đổi thành tỉ lệ nào.'],
  },
  'export-history': {
    logic: [
      'Mọi lần xuất dữ liệu đều **chạy nền ở server**, không xuất ngay tại chỗ. Trang này là danh sách các lần xuất **của chính bạn** và nơi tải lại file đã xong.',
      'Bấm Export ở một danh sách là **xếp hàng một việc**, không phải tải ngay — file về khi server làm xong.',
    ],
    how: [
      'Bấm **Export** trên danh sách cần xuất (Quota usage, Audit log, Jobseeker users…).',
      'Mở trang này để xem việc đó xong chưa.',
      'Xong thì tải file về.',
    ],
    watch: ['Xuất dữ liệu có chứa thông tin cá nhân là **thao tác được ghi log**, và thường cần quyền riêng — không phải ai đọc được cũng xuất được.'],
  },
}
