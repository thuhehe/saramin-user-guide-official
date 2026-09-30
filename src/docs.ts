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
          {
        kind: 'list',
        heading: 'Một đơn còn “Chờ” — tìm ra vì sao',
        items: [
          'Đọc **Status · Saramin** — cổng của chính Saramin: *Chờ* (đang giữ) · *Đã gửi* · *Thu hồi* · *Từ chối* (HQ từ chối riêng đơn này).',
          'Đọc **CV status** ngay bên cạnh. **Một đơn *Chờ* với CV *đang duyệt* đang đợi đúng MỘT thứ: phán quyết của CV ở CV review.**',
          'Bấm vào dòng (mở đơn ở tab mới). Panel chờ nói rõ điều đó và có nút **Open in CV review ↗**. **Quyết ở đó** — duyệt CV giải phóng **mọi** đơn gắn CV đó, kể cả đơn này.',
          '**⋯ → Reject** trên dòng từ chối **riêng đơn này** ở khâu sàng lọc — đó là phán xét về **đơn**, không phải về CV.',
          'Một đơn nộp bằng **CV Saramin không mang CV status** ở đây — nó chỉ dùng để nộp được vì nó **đã qua quy tắc** từ trước.',
          'Ô CV mở ra **version đã được gửi**, ghi nhãn `v.1/2` khi ứng viên đã thay file từ sau đó — nhà tuyển dụng đang giữ **v.1** và **chưa từng được gửi v.2**.',
        ],
      },
      {
        kind: 'open',
        text:
          '**Sai lệch so với bản dựng hiện tại.** Cột *CV status* ở đây mang **ba** giá trị của backend (*Approved · Under review · Rejected*), **không phải bốn** giá trị của requirement. Và **Open in CV review ↗ chỉ đáp xuống hàng đợi**, chưa nhảy tới đúng CV — đơn ứng tuyển **chưa mang id của CV**, nên tìm dòng theo **tên ứng viên**. Cả hai đã báo cho team backend.',
      },
      {
        kind: 'table',
        heading: 'Phía nhà tuyển dụng — chuyện gì xảy ra sau khi đơn được gửi',
        note: '**HQ không bao giờ chạm vào các chặng này.** Mỗi tin có bảng chặng riêng: mặc định *CV screening · Interview 1 · Interview 2 · Final acceptance*, cộng hai cột **cố định** *Hired* và *Rejected*. Tối đa **8 chặng**; **cột đầu và cột cuối chỉ đổi tên được**, không xoá, không di chuyển; **chặng còn người thì không xoá được**.',
        cols: ['Điều', 'Chi tiết'],
        rows: [
          ['**Ứng viên tới bảng đã được kiểm sẵn**', 'Saramin kiểm CV lúc upload; **chỉ đơn Saramin đã gửi** mới tới bảng của nhà tuyển dụng. Nộp đơn **chính là sự đồng ý của ứng viên**, nên trên tab *Jobs* **không có gì để mở khoá và không tốn credit**.'],
          ['**Nhảy cóc là hợp lệ**', '*CV screening → Final acceptance* trong một bước được phép — thực tế nhà tuyển dụng hay bỏ bước.'],
          ['**Đóng là đóng**', '*Hired* và *Rejected* là **điểm cuối**, không mở lại được; server từ chối với “This application is closed”.'],
          ['**Dòng bị Saramin thu hồi**', 'Gắn nhãn *Recalled by Saramin*, liên hệ và CV bị giấu, các ô đọc là *Withheld*, và **mọi thao tác trên dòng đều bị từ chối** (không di chuyển, không sao, không chọn, không xoá).'],
          ['**Ứng viên xoá tài khoản**', 'Dòng **ở lại**, tên đọc là *Deleted candidate*, liên hệ và CV bị giữ lại — nhưng **vẫn chuyển chặng được**.'],
          ['**Lý do loại**', 'Sáu lý do (*không đạt năng lực · không phù hợp · rút lui / không tới · từ chối offer · không thống nhất điều kiện · khác*). **Chỉ thành viên của nhà tuyển dụng thấy, ứng viên không bao giờ thấy.**'],
        ],
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
          {
        kind: 'table',
        heading: 'Hai cột trạng thái — một là sự thật, một là hình chiếu',
        note: '**Trạng thái tìm kiếm CV không bao giờ đặt bằng tay.** Nó được **tính ra** từ trạng thái CV: *Đang hiển thị* **chỉ khi** CV *Đạt*, *Ẩn* với mọi giá trị còn lại. Bên dưới trạng thái CV có in **lý do máy quét ghi lại**.',
        cols: ['Cột', 'Là gì', 'Đặt tay được?'],
        rows: [
          ['**Trạng thái CV**', 'Bốn giá trị: *Đạt* · *Chưa đủ thông tin* · *Không đọc được* · *Từ chối*', '**Có** — qua Duyệt / Từ chối'],
          ['**Trạng thái tìm kiếm CV**', '*Đang hiển thị* / *Ẩn*', '**Không** — suy ra từ cột bên trái'],
        ],
      },
      {
        kind: 'list',
        heading: 'Làm gì được trên một dòng',
        items: [
          '**⋯** chỉ chào các phán quyết mà trạng thái hiện tại cho phép — một trạng thái **nghi ngờ** chào cả *Duyệt CV…* (→ Đạt) và *Từ chối CV…* (→ Từ chối); một trạng thái **chung cuộc** chỉ chào **phép đảo ngược** của nó. Cả hai đều bắt **ghi chú nội bộ**.',
          '**Từ chối ở đây KHÔNG có bộ chọn lý do** — ứng viên sẽ nhận lời nhắn chung chung. **Khi lý do quan trọng, hãy quyết ở CV review.**',
          '**Open in CV review ↗** xuất hiện trên **mọi dòng không phải *Đạt***, và nhảy thẳng tới mục hàng đợi của CV đó, có file và lý do máy quét ghi bên cạnh.',
          '**Filter** có *Status* và *CV search status*; cả hai thu hẹp **cùng một sự thật**, nên *Đạt* + *Ẩn* **không khớp gì cả** — trạng thái rỗng sẽ nói rõ hai bộ lọc nào đang đánh nhau.',
          '**Cột Unlocks đọc là — khi CV chưa *Đạt***: CV đang ẩn thì không mở khoá được, nên **từ chối ở đây không hoàn tiền gì** trừ khi CV đang *Đang hiển thị*.',
        ],
      },
      {
        kind: 'table',
        heading: 'Phía nhà tuyển dụng — họ làm gì với kho này',
        note: 'Đây là mặt khách hàng của chính kho ứng viên. Hiểu nó để trả lời được “vì sao ứng viên này không ra kết quả tìm kiếm” và “vì sao khách bị trừ credit”.',
        cols: ['Hành động', 'Tốn gì', 'Chi tiết'],
        rows: [
          ['**Tìm và lọc**', '**Miễn phí**', 'Tên bị che (`Long T***`). Công ty **không có gói đang chạy** vẫn đọc được **10 CV**, liên hệ vẫn che.'],
          ['**Save candidate**', '**Miễn phí**', 'Xếp ứng viên vào **một hoặc nhiều folder** (mỗi folder = một vị trí họ đang tuyển). Thẻ rơi vào cột *Saved*, **vẫn che**, gắn badge *Not unlocked*.'],
          ['**Mở khoá CV** (hoặc **kéo thẻ ra khỏi cột Saved**)', '**1 credit**', 'Lộ **tên, số điện thoại, email**, file CV và các link — **một lần, vĩnh viễn, cho cả công ty**. Lúc mở khoá, hệ thống hỏi xếp CV vào folder nào.'],
          ['**Di chuyển một ứng viên đã mở khoá**', '**Miễn phí**', '“Already unlocked — this move is free.” Mở lại CV, xếp vào folder thứ hai, archive rồi lưu lại — **không tính tiền lần nữa**.'],
        ],
      },
      {
        kind: 'table',
        heading: 'Credit — từ đâu ra và cái gì tiêu nó',
        cols: ['', 'Chi tiết'],
        rows: [
          ['**Một credit mua gì**', 'Danh tính và liên hệ của **một ứng viên** — một lần, cho **toàn công ty**. Giá luôn là **1 / ứng viên**.'],
          ['**Từ đâu ra**', 'Một product **CV search** (ví dụ *CV Search 30d · 50 unlocks*) bán qua CRM. Credit về số dư công ty **khi kế toán phát hành hoá đơn** và gói được **kích hoạt**; chúng chạy trong cửa sổ hiệu lực của gói.'],
          ['**Cái gì tiêu**', 'Mở khoá trên kết quả tìm kiếm hoặc trang CV · kéo thẻ ra khỏi cột *Saved* · *Multi-select → Unlock* trong một folder.'],
          ['**Cái gì KHÔNG bao giờ tiêu**', 'Mọi thứ trên tab **Jobs** (người tự nộp đơn) · lưu · archive · mở lại một CV đã mở khoá · di chuyển một người đã mở khoá.'],
          ['**Hết credit**', '“You are out of credits. Top up to continue.” — thẻ **ở lại cột Saved**, không có gì bị trừ nửa vời.'],
          ['**Gói hết hạn**', '“Your package term has ended…” — credit còn lại bị **đóng băng, không mất**.'],
          ['**Gói Unlimited**', 'Hộp thoại đọc là “You have unlimited credits.”'],
        ],
      },
      {
        kind: 'warn',
        text:
          '**Ứng viên đã xoá tài khoản thì không mở khoá lần đầu được nữa** — thẻ đang khoá không rời cột *Saved* được. Người **đã từng được mở khoá** thì không bị ảnh hưởng: nhà tuyển dụng đã trả tiền cho danh tính đó và vẫn giữ nó.',
      },
],
    watch: ['**Chức năng này chưa có API thật ở backend** tại thời điểm viết — màn hình có thể chưa chạy đầy đủ trên môi trường dev.'],
  },
  'cv-review': {
    logic: [
      'Hàng đợi CV cần **người** xem. CV nào máy quét tự thấy đạt thì **không bao giờ** vào đây — nó đi thẳng vào kho ứng viên. Đó là thứ giữ cho hàng đợi này hữu hạn.',
      'Máy quét chạy lại **mỗi lần CV được lưu**, nên phần lớn CV tự thoát khỏi nghi ngờ: ứng viên bổ sung phần còn thiếu, lưu, CV đạt ngay tại chỗ.',
      'Máy quét **không bao giờ ghi “Từ chối”**. Từ chối chỉ tồn tại như một quyết định của con người.',
      'Ba tab: **Cần duyệt** (chờ lâu nhất lên trước) · **Đã duyệt** · **Đã từ chối** (hai tab sau mới nhất lên trước). Giữ **toàn bộ lịch sử**, không cắt 30 ngày.',
      'Thứ tự sắp xếp **cố định ở server**, không đổi được — vì thứ tự ở đây là một quy tắc vận hành, không phải sở thích người xem.',
    ],
    how: [
      'Đọc **thẻ tổng quan** trước: Quá hạn · 24h (số lẽ ra phải bằng 0) · Đã quyết · 7 ngày · Đã từ chối · 7 ngày · Thời gian quyết trung bình.',
      'Ở tab **Cần duyệt**, đọc từ trên xuống — dòng trên cùng là CV **chờ lâu nhất**.',
      'Đọc hai cột **Dùng để ứng tuyển** và **Trong kho ứng viên** trước khi quyết: chúng cho biết **tầm với** của quyết định (duyệt một lần giải phóng bao nhiêu đơn).',
      'Bấm một dòng → hộp thoại duyệt mở ra: file gốc bên trái, **Máy quét nói gì** và **Quyết định này ảnh hưởng tới** bên phải.',
      '**Duyệt**: bấm *Duyệt → gửi + hiển thị* → nhập **ghi chú nội bộ (bắt buộc)** → xác nhận.',
      '**Từ chối**: chọn **lý do** trước (lý do viết lại câu gửi cho ứng viên), sửa **lời nhắn** nếu cần, nhập ghi chú nội bộ, rồi bấm *Từ chối CV*.',
      'Gỡ một quyết định: mở tab tương ứng → **⋯ → Duyệt CV — gỡ từ chối…** (hoặc *Từ chối CV…* trên dòng đã duyệt).',
    ],
    watch: [
      '**CV chưa được quyết thì MỌI đơn ứng tuyển gắn CV đó bị giữ ở “Chưa gửi”, vô thời hạn.** Không có cơ chế tự gửi sau 24h, không có gì tự giải phóng — **chỉ người duyệt**. Hàng đợi bỏ quên ở đây không phải backlog nội bộ, nó là sự cố mà ứng viên chịu.',
      'Vì vậy dòng hiển thị **tuổi chờ**, không phải đếm ngược — không có hạn nào để đếm ngược tới.',
      '**Chọn lý do trước rồi mới sửa lời nhắn.** Đổi lý do sẽ **viết đè** lời nhắn — một lời nhắn còn sót lại từ lý do chọn trước đó là lỗi duy nhất không thể nhìn ra khi đọc form.',
      'Duyệt một file **Không đọc được** vẫn làm nó *Đạt* và *Đang hiển thị*, nhưng hệ thống **không trích được chữ nào** từ nó — nên nó vô hình với tìm kiếm theo kỹ năng, mặt mà nhà tuyển dụng dùng nhiều nhất. Cân nhắc xin ứng viên một file PDF có chữ.',
      '**Cột liên hệ bị giấu vĩnh viễn** ở màn hình này. Đó là chủ đích, không phải thiếu dữ liệu.',
    ],
    blocks: [
      {
        kind: 'table',
        heading: 'Máy quét ghi gì — ba kết quả, không có “từ chối”',
        note: 'Quy tắc là **OR**: có ít nhất **một kinh nghiệm làm việc** *hoặc* **một mục học vấn**. Máy đọc **các trường**, không quan tâm chúng từ đâu ra — một kỹ năng gõ tay tính hệt như một kỹ năng trích từ PDF.',
        cols: ['Kết quả', 'Khi nào', 'Nghĩa là gì'],
        rows: [
          ['**Đạt**', 'Quy tắc được thoả', '**Chung cuộc.** CV gửi được tới nhà tuyển dụng và vào được tìm kiếm CV. Không ai phải xem.'],
          ['**Chưa đủ thông tin**', 'File đọc được nhưng quy tắc không thoả', '**Tạm thời** — là một câu hỏi, chưa phải phán quyết. Chờ ứng viên bổ sung, hoặc chờ người duyệt quyết.'],
          ['**Không đọc được**', 'File không có chữ nào trích ra được (ảnh scan, file hỏng…)', '**Tạm thời** — hệ quả y hệt *Chưa đủ thông tin*. Người có thể đọc được file bình thường; máy thì không trích được gì.'],
        ],
      },
      {
        kind: 'list',
        heading: 'Những gì cố ý KHÔNG nằm trong quy tắc',
        items: [
          '**Kỹ năng không nằm trong quy tắc** (bỏ ngày 11/09/2026). Master data kỹ năng nặng về IT và mỏng ở mọi ngành khác, nên một điều dưỡng hay một kế toán thường không tìm nổi ba kỹ năng có sẵn. Kỹ năng giờ chỉ **xếp hạng** CV trong tìm kiếm; nó không bao giờ chặn.',
          '**Học vấn không bắt buộc với mọi người.** Đã cân nhắc và bác bỏ ngay trong ngày: nó sẽ loại bác tài hay anh tổ trưởng hai mươi năm nghề chưa bao giờ điền ô đó.',
          'Quy tắc **thừa hưởng vùng ngôn ngữ của bộ trích xuất**. CV bằng ngôn ngữ bộ trích không xử lý được thì không ra trường nào → *Chưa đủ thông tin* → xếp hàng chờ một người duyệt đọc được ngôn ngữ đó.',
        ],
      },
      {
        kind: 'table',
        heading: 'Bốn trạng thái CV — và cái gì suy ra từ chúng',
        note: '**Chỉ đọc từ trái sang phải.** Trạng thái đơn ứng tuyển và trạng thái tìm kiếm CV là **hình chiếu** của trạng thái CV. Có đúng **một** thứ người duyệt đổi được — chính CV — mọi thứ khác đi theo. Không màn hình nào cho phép đặt tay “Đã gửi” hay “Đang hiển thị”.',
        cols: ['Trạng thái CV', 'Loại', 'Đơn ứng tuyển dùng CV này', 'Tìm kiếm CV của NTD', 'Người duyệt làm được gì'],
        rows: [
          ['**Đạt**', 'Chung cuộc — máy quét ghi, hoặc người duyệt *Duyệt*', 'Gửi tới nhà tuyển dụng', 'Đang hiển thị (nếu ứng viên bật CV này)', 'Từ chối → *Từ chối*'],
          ['**Chưa đủ thông tin**', 'Nghi ngờ — tạm thời', '**Không gửi** — giữ tới khi CV *Đạt*', 'Ẩn', 'Duyệt → *Đạt* · Từ chối → *Từ chối*'],
          ['**Không đọc được**', 'Nghi ngờ — tạm thời', '**Không gửi** — giữ tới khi CV *Đạt*', 'Ẩn', 'Duyệt → *Đạt* · Từ chối → *Từ chối*'],
          ['**Từ chối**', 'Chung cuộc — **chỉ** người duyệt ghi được', 'Đơn đang giữ: *Không được gửi* vĩnh viễn. Đơn đã gửi bằng version này: **Thu hồi** khỏi NTD', 'Ẩn — rời kho; lượt mở khoá NTD đã trả tiền được **hoàn lại**', 'Duyệt → *Đạt* (gỡ từ chối)'],
        ],
      },
      {
        kind: 'p',
        text:
          'Hai trạng thái nghi ngờ **chỉ khác nhau ở thứ người duyệt phải nhìn**. Với ứng viên và nhà tuyển dụng chúng hành xử y hệt nhau, và không ai ngoài hàng đợi duyệt nhìn thấy chúng.',
      },
      {
        kind: 'table',
        heading: 'CV Saramin và CV tải lên — cùng quy tắc, khác hậu quả',
        note: 'Vì sao lệch nhau: **CV Saramin là các trường ứng viên tự gõ vào form của mình** — lỗi là của họ và sửa mất vài giây. **File tải lên có thể hỏng vì bộ đọc của ta**, nên ứng viên không bao giờ bị chặn nộp đơn; thứ phải chờ là việc *giao*, và nó chờ một con người.',
        cols: ['', 'CV Saramin (soạn trong trình soạn)', 'CV tải lên (PDF / DOC)'],
        rows: [
          ['Quy tắc KHÔNG thoả', 'Trạng thái = *Chưa đủ thông tin*', '*Chưa đủ thông tin*, hoặc *Không đọc được* khi không trích được chữ nào'],
          ['Ứng tuyển được bằng nó?', '**Không.** Không chọn được CV này ở bước nộp (và server từ chối nếu ép).', '**Được.** Đơn nộp thành công và trông bình thường — nhưng CV **không được gửi** tới NTD cho tới khi *Đạt*.'],
          ['Bật tìm kiếm CV được?', 'Không.', 'Được, nhưng CV vẫn **Ẩn** trong kho tới khi *Đạt*. Cái bật ghi lại **ý định**; hiển thị thì đi theo trạng thái.'],
          ['Ai đưa nó về *Đạt*', '**Ứng viên**, ngay trong trình soạn — thêm phần còn thiếu rồi lưu. Không cần người duyệt, không vào hàng đợi.', '**Người duyệt** ở CV review, HOẶC ứng viên thay bằng file khác qua được máy quét.'],
          ['Ứng viên thấy gì', 'Chip vàng *Chưa đủ thông tin* và nút *Cập nhật hồ sơ*, có nói rõ thiếu gì.', '**Không thấy gì.** Nghi ngờ là chuyện của ta — không báo cho ứng viên rằng file của họ có vấn đề trước khi một con người đã nhìn vào.'],
        ],
      },
      {
        kind: 'warn',
        text:
          '**Người duyệt duyệt CV, không bao giờ duyệt đơn ứng tuyển.** Đó là lý do trang Đơn ứng tuyển không có nút *Chuyển tiếp* hay *Gửi*: việc giao là **hệ quả** của phán quyết về CV, quyết một lần ở CV review. Một CV đứng sau mười đơn thì cả mười đơn đọc chung một trạng thái; duyệt một lần, cả mười đơn *Đã gửi* trong cùng một giao dịch, và toast in ra con số thật.',
      },
      {
        kind: 'table',
        heading: 'Version — v.1, v.2 …',
        note: 'CV là món trên kệ của ứng viên: danh tính, tên, lịch sử. **Version** là nội dung của nó tại một thời điểm. Thay file hoặc lưu lại form tạo ra một version mới của **cùng một CV**; CV giữ nguyên tên và lịch sử ứng tuyển.',
        cols: ['Quy tắc', 'Nghĩa'],
        rows: [
          ['Mỗi version mới đều **bị quét lại**', 'Một CV tự đi qua lại giữa *Đạt* và nghi ngờ theo cả hai chiều, không cần ai can thiệp.'],
          ['Version mới **không rửa được** một lần từ chối', 'File mới trên một CV đã *Từ chối* đưa nó về nghi ngờ (trở lại *Cần duyệt*), lần từ chối cũ vẫn nằm trong lịch sử.'],
          ['Đơn ứng tuyển **chụp lại** version đã gửi', 'Trên console đọc là một phân số — **đã gửi / hiện tại**. `v.1/2` nghĩa là NTD đang giữ v.1 và CV đã sang v.2; `v.2/2` nghĩa là họ giữ bản hiện tại.'],
          ['Từ chối chỉ thu hồi **đơn mang version bị từ chối**', 'Nếu v.1 đã gửi rồi ứng viên rút gọn thành v.2 và v.2 bị từ chối, NTD **vẫn giữ nguyên v.1** — họ chưa từng được gửi v.2.'],
          ['Chỉ **version hiện tại** nằm được trong *Cần duyệt*', 'Ứng viên thay v.1 đang nghi ngờ bằng v.2 → dòng v.1 tự rời hàng đợi (bị thay thế). Nếu v.2 qua máy quét, các đơn đang giữ đi luôn với v.2 và CV không bao giờ vào hàng đợi.'],
        ],
      },
      {
        kind: 'example',
        heading: 'Ví dụ — một CV tải lên, hai đơn, một lần từ chối',
        scenario:
          'Thu hồi **chỉ xảy ra khi version đã gửi bị từ chối**. Ở kịch bản dưới, v.2 chưa từng được gửi cho FPT, nên FPT không bị đụng tới.',
        cols: ['#', 'Việc xảy ra', 'CV', 'Đơn tới FPT', 'Đơn tới Tiki'],
        rows: [
          ['1', 'Tải CV lên — 3 kinh nghiệm', 'v.1 · *Đạt*', '—', '—'],
          ['2', 'Nộp FPT; FPT chuyển sang Phỏng vấn', 'v.1 · *Đạt*', 'Đã gửi · v.1 · Phỏng vấn', '—'],
          ['3', 'Thay file bằng bản 1 trang — không kinh nghiệm, không học vấn', 'v.2 · *Chưa đủ thông tin* → vào CV review', 'Đã gửi · v.1 · Phỏng vấn (**không đổi** — là một bản chụp)', '—'],
          ['4', 'Nộp Tiki bằng chính CV đó', 'v.2 · *Chưa đủ thông tin*', 'Đã gửi · v.1 · Phỏng vấn', '**Không gửi** — đang giữ'],
          ['5', 'Người duyệt từ chối — “CV nhưng chưa đủ thông tin”', 'v.2 · *Từ chối*', 'Đã gửi · v.1 · **giữ nguyên** — FPT không được báo gì', '**Không được gửi** (chung cuộc)'],
        ],
        note:
          'Nếu thay vào đó v.2 qua máy quét, được gửi cho Tiki, Tiki báo lại đây không phải CV thật, và người duyệt từ chối v.2 → đơn Tiki bị **Thu hồi**, đơn FPT (v.1) vẫn giữ nguyên.',
      },
      {
        kind: 'table',
        heading: 'Mỗi bên nhìn thấy gì',
        note: '**Một tag, nhiều lời nhắn.** Chip của ứng viên luôn là *Chưa được duyệt* dù lý do là gì; thứ họ hành động được là **lời nhắn người duyệt viết** (điền sẵn theo lý do, sửa được). Nhà tuyển dụng **không bao giờ** thấy chữ của người duyệt — chỉ một câu cố định theo lý do. Dùng “chưa”, không dùng “không”: từ chối là **đảo ngược được**, và phần lớn là lỗi của file chứ không phải của người.',
        cols: ['Trạng thái CV', 'Ứng viên — CV của tôi', 'Ứng viên — Đơn của tôi', 'Nhà tuyển dụng'],
        rows: [
          ['**Đạt**', 'Không chip trạng thái. *Hiển thị trong tìm kiếm CV* trên CV họ đã bật.', '*Đã gửi*, rồi các bước của NTD (Đã xem · Phỏng vấn…)', 'Một dòng bình thường trong Ứng viên; nằm trong kho nếu được bật.'],
          ['**Chưa đủ thông tin / Không đọc được** (tải lên)', 'Không có gì — trông như mọi CV khác.', '*Đã nộp*, như mọi đơn đang chờ. Không cảnh báo, không nhắc gì tới việc đang duyệt.', 'Không có gì — nó chưa từng được gửi, và không nằm trong kho.'],
          ['**Chưa đủ thông tin** (CV Saramin)', 'Chip vàng *⚠ Chưa đủ thông tin* + nút *Cập nhật hồ sơ*', 'Không có đơn nào — không chọn được CV đó để nộp.', 'Không có gì.'],
          ['**Từ chối**', 'Tag *Chưa được duyệt* + lời nhắn của người duyệt + **một** nút hành động (*Tải lên CV khác* · *Cập nhật hồ sơ* · *Liên hệ hỗ trợ*)', 'Đang giữ → *Không được gửi*. Đã gửi bằng version này → *Đã thu hồi*.', 'Dòng đã gửi chuyển thành *Đã thu hồi* kèm **một câu cố định** về tài liệu. Rời kho; lượt mở khoá đã trả tiền được hoàn.'],
        ],
      },
      {
        kind: 'table',
        heading: 'Bốn lý do từ chối — và câu chúng gửi đi',
        note: 'Lý do là **nội bộ** (ứng viên không thấy mã), nhưng nó viết sẵn câu ứng viên nhận được. **CV Saramin chỉ nhận được hai lý do cuối** — nó không có file để mà không đọc được, và nó không thể “không phải CV”.',
        cols: ['Lý do', 'Dùng khi', 'Áp dụng cho'],
        rows: [
          ['**Không đọc được**', 'Không trích được gì; gửi “Hệ thống không đọc được nội dung trong file này…”', 'Chỉ file tải lên'],
          ['**Không phải CV**', 'CMND, bảng giá, bài tập; gửi “File bạn tải lên không phải là một CV…”', 'Chỉ file tải lên'],
          ['**CV nhưng chưa đủ thông tin** *(chọn sẵn)*', 'CV thật nhưng không thoả quy tắc; gửi “Hồ sơ của bạn chưa đủ thông tin để gửi tới nhà tuyển dụng…”', 'Cả hai'],
          ['**Khác**', 'Không điền sẵn gì — phải tự viết lời nhắn.', 'Cả hai'],
        ],
      },
      {
        kind: 'table',
        heading: 'Ba màn hình, một quyết định',
        cols: ['Màn hình', 'Đường dẫn', 'Một dòng là…', 'Làm gì ở đây'],
        rows: [
          ['**CV review**', '`/recruitment/cv-review`', 'Một version CV cần người nhìn — hàng đợi, cộng toàn bộ quyết định đã ra', '**Chỗ chính.** Duyệt, hoặc từ chối kèm lý do và lời nhắn.'],
          ['**Đơn ứng tuyển**', '`/recruitment/applications`', 'Một đơn ứng tuyển', 'Xem **vì sao** một đơn còn *Chờ* (trạng thái CV của nó), mở sang hàng đợi duyệt, từ chối riêng đơn này. Không có *Chuyển tiếp*.'],
          ['**Kho ứng viên**', '`/recruitment/talent-pool`', 'Một ứng viên đã bật tìm kiếm CV, kèm CV đang cho tìm', 'Xem trạng thái CV và trạng thái hiển thị suy ra từ nó; Duyệt / Từ chối kèm ghi chú nội bộ; nhảy sang CV review.'],
        ],
      },
      {
        kind: 'example',
        heading: 'Ví dụ — một lần duyệt mở khoá bao nhiêu đơn',
        scenario:
          'Ứng viên Nguyễn Văn A upload CV ngày **02/03**. Máy quét không đọc được file (ảnh scan mờ) → **Không đọc được**. Từ 02/03 tới 09/03, A nộp đơn vào **4 tin tuyển dụng** của 3 công ty khác nhau.',
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
      {
        kind: 'table',
        heading: 'Câu hỏi hay gặp',
        cols: ['Câu hỏi', 'Trả lời'],
        rows: [
          ['Một CV dùng cho 10 tin và đang *Chưa đủ thông tin*. 10 NTD thấy gì?', '**Không thấy gì.** Cả 10 đơn *Không gửi*; ứng viên thấy *Đã nộp* trên từng đơn. Duyệt một lần → cả 10 *Đã gửi*; từ chối một lần → cả 10 *Không được gửi*.'],
          ['Ứng viên tải file mới sau khi tôi từ chối. Có tự duyệt không?', '**Không.** Version mới không rửa được lần từ chối — nó quay lại *Cần duyệt* (là v.2/2), lần từ chối cũ vẫn trong lịch sử, kể cả khi máy quét cho qua.'],
          ['Tôi từ chối một CV; NTD đã nhận nó hai tuần trước. Đơn đó có bị thu hồi?', '**Chỉ khi** NTD đang giữ đúng version bạn từ chối. Nếu ứng viên đã thay file giữa chừng, bản của NTD (v.1) giữ nguyên như lúc gửi — chân trang hộp thoại từ chối có ghi điều này.'],
          ['Vì sao hàng đợi trên dev rỗng?', 'Máy quét trên dev hiện **cho qua mọi CV** (`AlwaysCleanCvScreeningAdapter`), nên không file nào tự rơi vào *Cần duyệt*. Các dòng thấy ở đó là đưa vào bằng tay hoặc từ cờ sample. Trên production máy quét chạy thật.'],
          ['Ứng viên xoá tài khoản. NTD có mất CV không?', '**Không.** Thứ đã tới tay NTD giữ nguyên như lúc gửi, gắn nhãn *Tài khoản không còn tồn tại*; không thu hồi gì, không hoàn lượt mở khoá nào. CV chỉ rời tìm kiếm CV, và các đơn đang giữ thì không bao giờ đi.'],
        ],
      },
      {
        kind: 'open',
        text:
          '**Sai lệch so với bản dựng hiện tại (kiểm 22/09/2026).** (1) Đường truyền từ server chỉ gửi **ba** giá trị (chờ · đạt · từ chối) — hai trạng thái nghi ngờ gộp chung; phần tách ra hiện chỉ nằm trong đoạn ghi chú chữ tự do, **đừng đọc đoạn đó để suy ra loại nghi ngờ**. (2) Không phải dòng nào cũng có link file, nên có dòng báo không phục vụ được file — dùng *Mở kích thước đầy đủ*. (3) Tab *Đã duyệt* / *Đã từ chối* trên dev trả “Something went wrong”. (4) Lý do máy ghi trên dev vẫn còn “thiếu 1 kỹ năng nữa” — backend vẫn đang đếm kỹ năng, thứ mà requirement đã bỏ khỏi quy tắc từ 11/09/2026; cứ duyệt như bình thường.',
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
      'Đây là **catalogue**: mọi món bán được, giá của nó, và **fulfilment** — thứ khách thực sự nhận khi hoá đơn được phát hành. Màn hình này là **định nghĩa**; nó không bao giờ chạm vào số dư của một khách hàng nào.',
      'Field **Type** quyết định hoá đơn giao cái gì, và quyết định luôn những ô fulfilment nào hiện ra bên dưới.',
      'Với loại **Job posting**, Product **chính là** Tier (Basic · Basic plus · Top job · Distinction · Platinum) — không phải hai thứ.',
      'Chỉ product **Active** mới đưa lên báo giá được. **Inactive thay cho việc xoá**: product biến khỏi báo giá, nhưng mọi đơn cũ trỏ vào nó vẫn phân giải được.',
    ],
    how: [
      '**New product** → chọn **Type** (đây là bước quyết định mọi thứ phía sau).',
      'Điền **Identity**: tên tiếng Việt + tiếng Anh (bắt buộc, in lên báo giá / PO / hoá đơn), **Product ID** (SKU), **đơn vị tính**, mô tả bán hàng.',
      'Chọn **Role**: *Main* (bán độc lập — mọi bậc tin đều là Main) hay *Add-on* (gắn thêm lên một tin đã có bậc chính).',
      'Điền khối **fulfilment** mà Type đó yêu cầu — xem hai bảng bên dưới.',
      'Đặt giá; bật **Free product** nếu là món HQ đăng hộ không cần PO.',
      'Chuyển sang **Active** — hệ thống **từ chối kích hoạt khi fulfilment còn thiếu** và báo đúng tên field còn trống.',
    ],
    watch: [
      'Chọn sai **Type** thì giao sai thứ cho khách, **âm thầm**, và chỉ lộ ra lúc xuất hoá đơn. Đây là field có tầm ảnh hưởng lớn nhất trên màn hình — kiểm lại trước khi Lưu.',
      '**Product ID sửa được tới lần bán đầu tiên, sau đó khoá** — vì nó đã in lên các đơn đã phát hành.',
      'Sản phẩm đã bán rồi mà sửa cửa sổ kích hoạt thì **không** dịch chuyển hạn của quota đã bán — hạn đó đã được chụp lại lúc cấp.',
      '**Free product là một cờ được lưu, không suy ra từ giá 0.** Một dòng khuyến mãi có thể 0 ₫ mà vẫn phải đi ra từ một PO.',
      '**Trial product không phải là giảm giá** — nó là một trục *hiển thị*. Product trial mang giá riêng (thấp) và vẫn lên purchase order; chỉ có cửa sổ kích hoạt là 3 tháng thay vì 12.',
    ],
    blocks: [
      {
        kind: 'table',
        heading: 'Type — field có tầm với xa nhất',
        note: 'Type quyết định **hoá đơn giao cái gì** và **ai tiêu nó**.',
        cols: ['Type', 'Khách nhận gì lúc phát hành hoá đơn', 'Ai tiêu nó'],
        rows: [
          ['**Job posting**', 'N lượt đăng tin ở bậc này', 'Việc đăng một tin'],
          ['**CV search**', 'N lượt mở khoá CV, hạn 30 / 90 ngày kể từ lúc kích hoạt', 'Việc mở một CV'],
          ['**Boosting service**', 'Một vùng hiển thị được giữ trong một khoảng thời gian', 'Lượt đặt chỗ chiếm slot đó'],
          ['**Manual service**', '**Không có gì tự động** — một task vận hành được mở ra thay vào đó', 'Ops giao tay (đăng fanpage, gửi email)'],
        ],
      },
      {
        kind: 'table',
        heading: 'Fulfilment — Job posting: khối biến một product THÀNH một bậc tin',
        cols: ['Cài đặt', 'Nghĩa'],
        rows: [
          ['**Must be used within**', 'Đếm từ **ngày hoá đơn**; mặc định 12 tháng. Quota được cấp ngay lúc hoá đơn phát hành; phần chưa dùng khi cửa sổ này đóng thì **hết hạn**.'],
          ['**Display duration (ngày)**', 'Một tin đã đăng sống bao lâu. Đây là con số màn hình đăng tin hiện bên cạnh bậc (*Top job · 30 ngày*).'],
          ['**Auto-refresh**', 'Bao lâu một lần tin đã đăng được đẩy lại lên đầu các danh sách nó xuất hiện. Để trống = không bao giờ.'],
          ['**Placement slots**', '**Tin bậc này xuất hiện ở đâu**, và chiếm bao nhiêu phần cửa sổ hiển thị — *toàn bộ cửa sổ* hay *10 ngày đầu*. Vùng lấy từ registry Placements. **Đây chính là định nghĩa của bậc.**'],
          ['**Includes**', 'Các product được cấp **kèm** với product này. Khách thấy **một dòng** — đây **không phải** package. Mỗi món kèm vẫn được cấp riêng.'],
          ['**Card perks bậc này bán**', 'Thẻ tin ở bậc này được mang gì (ảnh banner, tag trên thẻ). Product mới **không bán perk nào** cho tới khi tick, dù thứ hạng cao tới đâu. Phủ *Top search* trong Placement slots thì **tự động bán cả hai** — và khi đó mọi tin ở bậc này đều **cần ảnh mới đăng được**.'],
          ['**Ladder rank**', 'Bậc này đứng đâu trong dãy bậc — xem trang *Thang bậc tin*.'],
          ['**Display order**', 'Chỉ đọc ở đây. Đặt ở màn hình *Thang bậc tin*.'],
        ],
      },
      {
        kind: 'table',
        heading: 'Fulfilment — ba Type còn lại',
        cols: ['Type', 'Các ô', 'Điều đáng biết'],
        rows: [
          ['**CV search**', 'Credit amount · Validity (30 / 90 ngày)', '*Credit amount* = một lần mua mở được bao nhiêu CV. Hạn chạy từ lúc khách bấm **Kích hoạt**. **Không có ô “Must be used within”** ở đây: cửa sổ kích hoạt cố định 12 tháng (3 tháng với trial) theo T&C §4. Giá mỗi CV hiện bên dưới là **tính ra**, không gõ.'],
          ['**Placement booking**', 'Placement · Duration (ngày) · Slots consumed', 'Chỉ vùng **Active** mới được chào. *Slots consumed* = một lần bán chiếm bao nhiêu slot của vùng; để trống = 1.'],
          ['**Manual service**', 'Quantity · Unit', 'Không cấp entitlement nào — **mở một task cho ops**. *Unit* là cách đếm task đó (một bài đăng, một lần gửi).'],
        ],
      },
      {
        kind: 'table',
        heading: 'Role và Add-on',
        cols: ['Role', 'Nghĩa'],
        rows: [
          ['**Main**', 'Bán độc lập — báo giá được, đặt hàng được, không bao giờ nằm trong product khác. **Mọi bậc tin đều là Main.**'],
          ['**Add-on**', 'Gắn lên trên một tin chính. Vẫn bán như mọi product: picker báo giá xếp add-on vào nhóm riêng, giá riêng, dòng PO riêng. Trên màn hình đăng tin nó **bị khoá** cho tới khi đã chọn một PO và một product chính.'],
          ['**Add-on type: Status label**', 'Một badge trên tin, hiện trong tìm kiếm và trên trang chủ — *Hot job* hoặc *Super star*. (Hiện có sẵn.)'],
        ],
      },
      {
        kind: 'table',
        heading: 'Hai cờ hay bị hiểu nhầm',
        cols: ['Cờ', 'Bật thì sao', 'Cái bẫy'],
        rows: [
          ['**Trial product**', 'Product **chỉ** xuất hiện trong báo giá có *Discount programme = Trial package (Gói dùng thử)*. Tắt (mặc định): xuất hiện ở **mọi** báo giá **trừ** báo giá trial.', 'Hai tập **không bao giờ trộn**: báo giá trial chỉ chào product trial, không chào product thường và **không chào package** (package không có cờ trial). Đổi một báo giá vào/ra khỏi *Trial package* sẽ **reset product trên mọi dòng**. Chặn ở **server**, không chỉ ở picker.'],
          ['**Free product**', 'Giá về 0 và **không sửa được**. HQ đăng hộ cho bất kỳ công ty nào, **không cần PO, không tiêu quota**. Đây là thứ đổ vào lựa chọn *Free job* trên màn hình đăng tin (Main product, không chọn PO).', 'Nhà tuyển dụng **không bao giờ** thấy nó trên site công ty — họ chỉ đăng được từ thứ đã mua.'],
        ],
      },
      {
        kind: 'warn',
        text:
          '**Những gì một bậc tin cho — thời lượng, nhịp làm mới, thứ hạng tìm kiếm, vị trí trang chủ, badge — đến từ CẤU HÌNH BẬC, không từ sản phẩm.** Nếu để từng sản phẩm tự khai những thứ đó thì hai sản phẩm cùng tên “Top Job” có thể cho hai thứ khác nhau, và không ai phát hiện ra cho tới khi một khách hỏi vì sao tin của họ không giống tin của khách kia.',
      },
      {
        kind: 'table',
        heading: 'Nơi khác quyết định product này có chạy hay không',
        cols: ['Ở đâu', 'Vì sao liên quan'],
        rows: [
          ['**Discount programmes** `/system/discount-programmes`', 'Chương trình *Trial package* nằm ở đây. Product trial chỉ hiện khi một báo giá chọn nó.'],
          ['**CRM → Invoice**', '**Phát hành hoá đơn VAT là thời điểm quota được cấp.** Không gì trên trang này tự cấp cái gì.'],
          ['**CRM → Công ty → Products & billing**', 'Nơi kiểm một product đã về tới công ty chưa: *IN USE* hiện từng product kèm số slot và hạn.'],
          ['**Recruitment → Jobs → New job**', 'Nơi product bị **tiêu**: chọn công ty → chọn PO → danh sách Main product trở thành các dòng đã trả tiền của PO đó. Free product chỉ hiện khi **không** chọn PO.'],
          ['**Site jobseeker**', 'Bước kiểm cuối: một tin đã đăng xuất hiện **đúng** các vùng mà Placement slots của bậc nó liệt kê, và tắt *Exposure* là nó biến khỏi mọi vùng.'],
        ],
      },
    ],
  },
  packages: {
    logic: [
      '**Nhiều product bán chung một dòng, một giá.** Package được định giá **như một khối**, không phải bằng tổng các phần.',
      'Trên báo giá nó là **một dòng**; tới lúc phát hành hoá đơn **từng thành phần được cấp riêng**, nên quota của công ty đọc ra là các product lẻ.',
      'Dùng package khi khách **nên thấy các phần được gộp giá dưới một cái tên**. Khi một product chỉ đơn giản là **kèm thêm** vài thứ trong cùng một dòng, dùng **Includes** trên chính product đó thay vì package.',
    ],
    how: [
      '**New package** → đặt **Name** (nội bộ) và **Display name** (khách thấy; để trống thì lấy Name).',
      'Thêm **Components** — ít nhất **hai** product, mỗi cái một số lượng.',
      'Đặt **Package price (VND)** — điền sẵn bằng tổng thành phần; sửa về giá bán thật. *Sum of parts* và *Implied discount / markup* cập nhật bên dưới.',
      'Tick **Premium package** và/hoặc bật **No limit** trên một dòng nếu cần (xem hai bảng dưới).',
      'Chuyển **Active** — thất bại nếu có thành phần nào đang Inactive, và thông báo **nêu đích danh** product đó.',
    ],
    watch: [
      'Có **cảnh báo** khi giá package **vượt** tổng các phần — không chặn, chỉ nhắc.',
      'Kích hoạt package **thất bại nếu một product thành phần đang Inactive**. Kích hoạt product đó trước.',
      '**Premium package đi theo PRODUCT, không theo người mua** — xem cảnh báo bên dưới, đây là điểm phản trực giác nhất của màn hình.',
    ],
    blocks: [
      {
        kind: 'warn',
        text:
          '**Premium package — hai điều phải test kỹ, vì cả hai đều phản trực giác.** (1) **Nó đi theo các PRODUCT, không theo người mua.** Nếu package chứa một bậc tin bán rộng rãi, thì **mọi** tin ở bậc đó được đẩy lên khu Premium — kể cả tin mua lẻ, ngoài package. (2) **Nó không do placement điều khiển.** Tin vào được khu Premium là **vì cái tick này**, không phải vì bất kỳ cài đặt *Placement slots* nào — người test đi tìm khu Premium trên trang Placements sẽ không thấy gì. Đây là cách biểu diễn các gói *Unlimited* của hệ thống hiện tại.',
      },
      {
        kind: 'table',
        heading: 'No limit — số lượng không giới hạn',
        note: 'Một công tắc **No limit** trên dòng thành phần, **thay cho** ô số lượng.',
        cols: ['Quy tắc', 'Chi tiết'],
        rows: [
          ['Chỉ **Job posting có cửa sổ hiệu lực** mới bán unlimited được', '**Không giới hạn về số lượng, có giới hạn về thời gian.** Công tắc bị khoá với mọi loại khác.'],
          ['*Sum of parts* **bỏ dòng unlimited ra ngoài**', 'Không có giá nào cho “không giới hạn”. Package bán theo giá bạn đặt; cảnh báo “giá vượt tổng các phần” được thay bằng một ghi chú nói rõ điều đó.'],
          ['Hiển thị', 'Tổng dòng đọc là **—**, không phải *0 ₫*; cột trong danh sách đọc là **Unlimited**.'],
        ],
      },
      {
        kind: 'example',
        heading: 'Test nhanh package',
        scenario: 'Bốn phép thử cắt qua nhiều màn hình — chỗ bug hay nấp.',
        cols: ['Làm', 'Đạt khi'],
        rows: [
          ['Dựng package gồm 3 product → bán → phát hành hoá đơn', 'Báo giá hiện **1 dòng**; sau hoá đơn, *Products & billing* của công ty hiện **3 product**'],
          ['Tick *Premium package* trên package chứa bậc X', 'Một tin ở bậc X **mua ngoài package** cũng xuất hiện ở khu Premium'],
          ['Bật *No limit* trên một dòng CV search', '**Từ chối** — cần một Job posting có cửa sổ hiệu lực'],
          ['Chuyển một product thành phần sang Inactive', 'Kích hoạt package **thất bại** và **nêu tên** product đó'],
        ],
      },
    ],
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
          {
        kind: 'table',
        heading: 'Hai loại vùng — Format quyết định form hiện ô nào',
        note: 'Vùng do **team BB seed sẵn**. **Không có Create, không có Delete** — danh sách này *là* bố cục của site, thêm một vùng nghĩa là sửa site. Mọi dòng đều **sửa được** (biểu tượng bút chì).',
        cols: ['Format', 'Cái gì đổ vào', 'Các ô có nghĩa'],
        rows: [
          ['**Job** (content pool)', 'Tin tuyển dụng — qua *Placement slots* của từng product', 'Items shown · Pool cap · Rotation period · Size'],
          ['**Display** (banner / popup)', 'Một creative được đăng dựa trên một lượt đặt chỗ đã trả tiền', 'Creative width × height · **Concurrent bookings** · Rotation period (chỉ banner)'],
        ],
      },
      {
        kind: 'table',
        heading: 'Từng cài đặt — và cách kiểm nó',
        cols: ['Cài đặt', 'Nghĩa', 'Kiểm bằng cách'],
        rows: [
          ['**Name**', 'Tên hiển thị tiếng Việt. **Cột chữ tự do duy nhất sửa được.**', 'Đổi tên một vùng; thay đổi **chỉ trong admin**, không có gì trên site công khai bị đổi tiêu đề.'],
          ['**Key**', 'Khoá máy mà site công khai truy vấn theo (`HOMEPAGE_TOP`). **Cố định — không sửa được.**', '—'],
          ['**Items shown**', '**Chính xác** bao nhiêu thẻ vùng này vẽ ra.', 'Đặt N; vùng hiện đúng N, **không bao giờ nhiều hơn**.'],
          ['**Rotation period (s)**', '**Độ dài của một chu kỳ, không phải tốc độ animation.** Trong một chu kỳ thứ tự **đứng yên**; sang chu kỳ mới thì xáo lại. Để trống = **không bao giờ xáo**.', 'Tải lại trang **trong cùng một chu kỳ** → **cùng thứ tự**. Chờ sang chu kỳ sau → thứ tự mới.'],
          ['**Creative size**', 'Chỉ vùng Display. **Đặt cả rộng và cao** để bật chốt chặn upload; để **trống cả hai** thì nhận mọi kích thước. **Chỉ đặt một trong hai là bị từ chối.**', 'Upload banner sai tỉ lệ → **bị từ chối, không tự cắt**.'],
          ['**Concurrent bookings**', 'Chỉ vùng Display — bao nhiêu lượt đặt chỗ được **chồng nhau** ở đây. Để trống = **1**.', 'Thử đặt banner thứ hai vào vùng 1-slot cho khoảng ngày chồng lấn → **bị chặn**.'],
          ['**Reference image**', 'Ảnh preview **chỉ dành cho admin** trên dòng. **Không bao giờ** hiện công khai.', '—'],
          ['**Status**', '**Inactive → vùng không hiện gì cả**, kể cả khi vẫn có tin đủ điều kiện.', 'Đặt Inactive; băng đó **biến khỏi** trang công khai.'],
        ],
      },
      {
        kind: 'p',
        text:
          'Các trang **có vùng**: Home · Search · Job list · Job detail · Company page · Candidate profile và một số trang khác. *(Danh sách placement đầy đủ chốt vào 25/09.)*',
      },
      {
        kind: 'table',
        heading: 'Hai băng “Mega menu” — nguồn của các trang Jobs by roles / locations / industries / Korea / Global',
        note: '**Băng không tự chọn tin.** Nó vẽ **mọi** tin đang mở và đang được phơi mà **product của tin đó phủ vùng placement tương ứng**. Đây là lý do không có và **không nên có** cờ “featured trên trang Roles”: thứ tự chính là thứ các bậc tin được bán.',
        cols: ['Băng trên site', 'Vùng placement', 'Sức chứa tối đa'],
        rows: [
          ['**Đừng bỏ lỡ các việc làm này!**', '`Mega menu page - Don\'t miss these jobs`', '**48 slot** — 12 hàng × 4 thẻ'],
          ['**Việc làm xu hướng**', '`Mega menu page - Trending jobs`', '**30 slot** — 10 hàng × 3 thẻ'],
        ],
      },
      {
        kind: 'table',
        heading: 'Thứ tự bên trong một băng — ba dòng sắp xếp, theo trục riêng của từng trang',
        cols: ['#', 'Dòng sắp xếp', 'Nghĩa'],
        rows: [
          ['1', '**Nhóm đông tin nhất lên trước**', 'Trên *Roles*, ngành nghề đang có nhiều tin nhất dẫn đầu; trên *Location* là tỉnh/TP; trên *Industry* là ngành. **Đếm sống**, không phải danh sách cố định'],
          ['2', 'Rồi tới **thứ hạng của product**', 'Trong một nhóm, bậc **cao hơn trên Thang bậc tin** đứng trước: Top Job trên Distinction trên Basic Plus'],
          ['3', 'Rồi tới **lần auto-refresh gần nhất**', 'Trong một bậc, tin **vừa được product đẩy lên** dẫn đầu — **không phải** tin sửa gần nhất'],
          ['—', '**Quy tắc trải đều**', 'Trong một băng, **không công ty nào chiếm quá ~10 % số thẻ** — một nhà tuyển dụng lớn không thể lấp kín cả băng'],
        ],
        note: '**Korea** và **Global** sắp theo tỉnh/TP (chúng là bảng Location có thêm bộ lọc quốc gia). **Roles** sắp theo ngành nghề. Công ty vào **Korea** khi *CRM → Company → Country* = Hàn Quốc; **mọi quốc gia khác, kể cả để trống, rơi vào Global**.',
      },
      {
        kind: 'table',
        heading: 'HQ điều khiển các trang bảng tin ở đâu',
        cols: ['Cài đặt', 'Ở đâu trong Admin', 'Tác dụng'],
        rows: [
          ['Bậc nào xuất hiện trong băng nào', '**Products → product → Placement slots**', 'Tick / bỏ tick vùng Mega menu tương ứng'],
          ['Băng hiện bao nhiêu thẻ', '**System → Placements → Items shown**', '**Đổi kích thước băng đó trên mọi trang bảng tin cùng lúc**'],
          ['Bậc nào dẫn đầu trong một nhóm', '**System → Thang bậc tin** — kéo thả', 'Dòng sắp xếp 2'],
          ['Tin được đẩy lên bao lâu một lần', '**Products → product → Auto-refresh**', 'Dòng sắp xếp 3'],
          ['Nhà tuyển dụng nào tính là Hàn Quốc', '**CRM → Company → Country**', 'Korea giữ KR; các nước khác rơi về Global'],
        ],
        note: '**Không gì khác dịch chuyển được các trang này.** Không có bộ chọn tin riêng cho từng trang.',
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
      'Một **collection** là **danh sách tin (hoặc công ty) đã lưu lại**, có địa chỉ công khai riêng `/bo-suu-tap/<address>`.',
      'Đây là thứ mà một mục menu như “Korea” hay “Big company”, và **cả hai danh sách của một trang Premium**, thực chất trỏ vào. **Trang Premium không bao giờ tự chứa tin.**',
      '**Cùng một collection có thể nuôi nhiều trang Premium và nhiều mục menu cùng lúc** — nên sửa một collection là đổi **mọi** trang đang dùng nó, **ngay lập tức**.',
      'Hai lựa chọn — **Lists** (Jobs / Companies) và **Membership** (Saved search / Hand-picked) — **cố định sau khi tạo**, vì chúng quyết định form hiện những ô nào.',
    ],
    how: [
      '**New collection** → **Address** → **Lists** → **Membership** → tên VI / EN / KO (**cả ba đều bắt buộc**).',
      '**Saved search**: đặt bộ lọc theo hai nhóm — *Employer* (company tag, quốc gia, quy mô, ngành, chọn đích danh công ty) và *Posting* (ngành nghề, cấp bậc, hình thức, loại hợp đồng, phúc lợi, tỉnh/TP, từ khoá). Chọn **Order** và **Item limit**.',
      '**Hand-picked**: **Pinned items** → tìm tin theo tiêu đề hoặc công ty → **Add**. Sắp lại bằng ↑ ↓ — **thứ tự ở đây là thứ tự trên trang**.',
      'Đọc **Preview** ở panel phải — số khớp **sống** và vài kết quả đầu, cập nhật theo mỗi lần đổi bộ lọc.',
      '**Save**, rồi **Publish** ở panel Actions (Publish tự lưu trước).',
    ],
    watch: [
      '**Một chiều duy nhất: Draft → Active → Archived.** Collection đã publish **không quay lại Draft được**, và **Archived không có nút Restore** — muốn dùng lại thì dựng collection mới.',
      '**Address đóng băng khi publish**, nên một menu hay một zone đang trỏ vào nó không thể bị đổi hướng âm thầm.',
      '**Kiểm Preview trước khi publish**: một collection không khớp gì **vẫn lưu và publish được**, và trang sẽ rỗng. Ở mức 0 nó cảnh báo “Nothing matches…”.',
      '**Archive bị từ chối khi một zone đã publish còn liệt kê collection này** — thông báo yêu cầu unpublish zone đó hoặc trỏ nó sang collection khác trước.',
      'Tin ghim **không tự làm mới**: khi một tin featured đóng lại, phải thay bằng tay.',
    ],
    blocks: [
      {
        kind: 'table',
        heading: 'Bốn tổ hợp — cái nào dùng được ở đâu',
        cols: ['Lists', 'Membership', 'Có?', 'Dùng trên trang Premium'],
        rows: [
          ['Jobs', 'Saved search', 'Có', '**Job list** (khối bắt buộc)'],
          ['Jobs', 'Hand-picked', 'Có', '**Featured jobs** (khối tuỳ chọn)'],
          ['Companies', 'Hand-picked', 'Có', '**Không dùng được trong zone** — zone chỉ chào collection tin. Dùng cho menu.'],
          ['Companies', 'Saved search', '**Không có**', '— (bộ lọc mô tả tin, không mô tả công ty)'],
        ],
      },
      {
        kind: 'table',
        heading: 'Cột trong danh sách',
        cols: ['Cột', 'Nó nói gì'],
        rows: [
          ['**Collection**', 'Tên, và địa chỉ công khai `/bo-suu-tap/<address>` bên dưới'],
          ['**Lists**', 'Jobs hoặc Companies'],
          ['**Membership**', 'Saved search → *Filters: 1 · Newest first* (mấy bộ lọc, và thứ tự đã lưu). Hand-picked → *Pinned: 10*. “No filters / Nothing pinned — resolves to nothing” nghĩa là collection **rỗng**'],
          ['**Status**', 'Draft · Active · Archived'],
          ['**⋮**', 'Hover mới mở. *Edit* luôn có · **Draft** thêm *Publish* (mờ tới khi có ít nhất một bộ lọc hoặc một tin ghim) và *Delete* · **Active** thêm *Archive*'],
        ],
        note: 'Danh sách luôn xếp **mới cập nhật trước**. Muốn biết trang Premium nào dùng collection nào: mở **Content → Zones**, cột *Lists* in ra `Job list: /mb-jobs · Featured: /mb-featured`.',
      },
      {
        kind: 'list',
        heading: 'Saved search — bộ lọc hoạt động như tìm kiếm công khai',
        items: [
          'Chọn **nhiều giá trị trong cùng một bộ lọc** thì **mở rộng** (bất kỳ giá trị nào); **thêm một bộ lọc nữa** thì **thu hẹp** (phải khớp tất cả).',
          'Mọi thứ khớp bộ lọc đều nằm trong collection, **kiểm lại mỗi lượt truy cập**: tin mới tự vào, tin đóng hoặc bị ẩn tự rớt ra.',
          '**Order** — *No saved order · Newest first · Relevance · Highest salary · Lowest salary · Most viewed · Recently posted · Closing soonest.* Đây là **thứ tự mặc định** mà Job list của một trang Premium hiện; khách xem vẫn tự sắp lại được cho riêng họ.',
          '**Item limit** — số món nhiều nhất một khách thăm từng thấy. Để trống = không giới hạn.',
        ],
      },
      {
        kind: 'warn',
        text:
          '**Cờ “Not visible” trên một tin ghim.** Một tin chỉ hiện khi nó **đang mở, đang được phơi (exposed) và còn trong cửa sổ đăng**, và công ty của nó **Active + có MST**. Dòng bị gắn cờ **bị bỏ qua trên site mà không báo gì cho khách thăm**, nên trang ngắn đi một thẻ — dòng vàng phía trên danh sách đếm giúp (“1 of 10 pinned items are not shown on the site”).',
      },
      {
        kind: 'table',
        heading: 'Trạng thái collection',
        cols: ['Trạng thái', 'Trên site', 'Làm được gì'],
        rows: [
          ['**Draft**', 'Không hiện (địa chỉ trả “không tìm thấy”)', 'Sửa mọi thứ **kể cả address** · Publish · Delete'],
          ['**Active**', 'Sống tại `/bo-suu-tap/<address>`, zone và menu dùng được', 'Sửa bộ lọc / tin ghim / tên · Archive'],
          ['**Archived**', 'Offline; địa chỉ vẫn giữ chỗ', '**Không gì đưa nó trở lại** — admin không có nút Restore; dựng collection mới'],
        ],
        note: '**Saved search cần ít nhất một bộ lọc**, **Hand-picked cần ít nhất một tin ghim** — nếu không thì không lưu được. **Save không bao giờ publish**; Publish nằm ở thẻ Actions bên phải (nó tự lưu trước). **Preview** (góc trên phải) mở trang công khai của chính collection — chỉ với collection Active.',
      },
      {
        kind: 'list',
        heading: 'Trước khi động vào một collection mà trang Premium đang dùng',
        items: [
          'Mở **Content → Zones → cột Lists** để xem **những zone nào** đang dùng nó.',
          'Mọi chỉnh sửa (bộ lọc, tin ghim, thứ tự, giới hạn) **sống ngay lập tức trên mọi trang dùng nó**.',
          'Muốn cho một collection nghỉ hưu khi một zone đã publish đang dùng: **tạo và publish collection thay thế → chuyển zone sang nó (Zone editor → The two lists → Save) → rồi mới archive cái cũ.** Hệ thống chặn việc archive sớm hơn.',
          'Một zone **chỉ (tái) xuất bản được khi cả hai collection của nó đang Active**.',
        ],
      },
    ],
  },
  zones: {
    logic: [
      'Một **zone** (KR: 채용관, khách gọi là **Premium page**) là **trang tuyển dụng có thương hiệu** cho một nhà tuyển dụng hoặc một chủ đề: banner, vài khối nội dung, một thanh tìm kiếm và **hai danh sách tin**. Nó có địa chỉ riêng trên site jobseeker, và admin dựng nó **hoàn toàn bằng nội dung** — không sửa code cho mỗi chiến dịch.',
      '**Không có layout tuỳ biến.** Template cố định: một topbar + **7 khối**, luôn theo đúng thứ tự này. Khối tuỳ chọn để trống thì **không được vẽ ra** — không có ô rỗng, không có tiêu đề rỗng.',
      'Zone **không chứa tin**. Hai danh sách của nó **trỏ vào Collection** — vì vậy muốn sửa “trang Premium hiện sai công ty”, sửa **collection**, không sửa zone.',
      'Khách thăm không bao giờ thấy được tin nằm ngoài collection: thanh tìm kiếm trên trang **chỉ thu hẹp** danh sách đó.',
      'Trang hiện theo **ngôn ngữ của người xem**: tiêu đề, khối và chữ link đều có ô VI / EN / KO; **tiếng Việt là bắt buộc**.',
    ],
    how: [
      '**Dựng hai collection trước** (Content → Collections): một *Saved search* cho **Job list** (bắt buộc) và một *Hand-picked* cho **Featured jobs** (tuỳ chọn).',
      '**Content → Zones → New zone** → đặt **address** (chữ thường, số, gạch ngang, 2–63 ký tự — đây chính là URL công khai) → **Title** (VI bắt buộc) → *Owner company* (tuỳ chọn, dùng làm link website dự phòng) → **Save** → zone ra đời ở trạng thái **Draft**.',
      'Đổ các khối từ trên xuống: **Topbar → Partner logo** (PNG/SVG trong suốt, cao ~30px) · **Banner → Add slide** (ảnh desktop bắt buộc, ảnh mobile tuỳ chọn, tối đa 10 slide) · **Top block** · **Search bar** (tick ít nhất 1 bộ lọc) · **The two lists** · **Bottom block** · **Company link**.',
      'Đọc **Page order** ở panel phải trước khi xuất bản — nó liệt kê cả 8 phần kèm giá trị hiện tại (“3 slides on a rotating slider”, “/mb-jobs”, “Not shown”…). Đây là cách nhanh nhất để thấy trang **sẽ thực sự hiện gì**.',
      '**Save** → **Actions → Publish** → xác nhận. Dòng trạng thái đổi thành *Live at …*; bấm **Preview** (góc trên phải) để mở trang thật.',
      'Gắn vào menu (tuỳ chọn): **Content → Site navigation** → thêm mục → đích **Zone** → chọn zone. **Chỉ zone đã Published mới chọn được.**',
    ],
    watch: [
      '**Save không bao giờ xuất bản.** Publish là nút riêng. Trên zone đã Published, **Save cập nhật thẳng trang đang sống** — không có bản nháp song song — và khách thấy trong khoảng một phút.',
      '**Address không đổi được sau khi tạo.** Đổi địa chỉ nghĩa là làm một zone mới.',
      '**Archived không bao giờ quay thẳng lại sống**: phải *Restore to draft*, kiểm, rồi mới Publish.',
      '**Preview chỉ chạy trên zone đã Published** — chưa có preview cho bản nháp.',
      'Một tin được ghim nhưng đã đóng hoặc bị ẩn sẽ hiện **Not visible** trong collection và **bị bỏ qua** trên site (ví dụ MB Bank: ghim 10, hiện 9). Nếu **mọi** tin ghim đều bị ẩn thì khối Featured **tự ẩn mình**.',
      'Ảnh trông trắng trong trình soạn **không hẳn là mất**: ảnh được chuyển đổi ngầm vài giây sau khi upload. Kiểm trên trang công khai.',
    ],
    blocks: [
      {
        kind: 'table',
        heading: 'Template cố định — topbar + 7 khối, luôn đúng thứ tự này',
        cols: ['#', 'Khối', 'Bắt buộc?', 'Khách thăm thấy gì', 'Đặt ở đâu trong admin'],
        rows: [
          ['0', '**Topbar**', 'Tuỳ chọn', 'Logo đối tác × saramin, cộng các link trong trang (Overview · Featured jobs · All jobs · More information)', 'Topbar → Partner logo'],
          ['1', '**Banner**', '**Bắt buộc để xuất bản**', 'Slider tràn màn hình, **5 giây mỗi slide**, mỗi slide một ảnh desktop và một ảnh mobile (tối đa 10 slide)', 'Banner → Slides'],
          ['2', '**Top block**', 'Tuỳ chọn', 'Đoạn giới thiệu hoặc một ảnh, nằm giữa banner và thanh tìm kiếm', 'Top block'],
          ['3', '**Search bar**', '**Ít nhất 1 bộ lọc**', 'Tỉnh/TP · Ngành nghề · Cấp bậc · Từ khoá — chỉ **thu hẹp** danh sách tin bên dưới', 'Search bar'],
          ['4', '**Featured jobs**', 'Tuỳ chọn', 'Một hàng thẻ tin', 'The two lists → Featured jobs'],
          ['5', '**Job list**', '**Bắt buộc**', 'Danh sách tin đầy đủ, có phân trang và ô sắp xếp', 'The two lists → Job list'],
          ['6', '**Bottom block**', 'Tuỳ chọn', 'Chữ hoặc một ảnh dưới danh sách tin', 'Bottom block'],
          ['7', '**Company link**', 'Tuỳ chọn', 'Một link sang website của nhà tuyển dụng, kèm ảnh tuỳ chọn', 'Company link'],
        ],
      },
      {
        kind: 'p',
        text:
          'Các **link trong trang ở topbar chỉ xuất hiện cho những khối thực sự được vẽ** — không có link nào trỏ tới một khối rỗng.',
      },
      {
        kind: 'table',
        heading: 'Hai danh sách — mỗi cái cần một loại collection riêng',
        note: 'Dựng collection **trước**, rồi mới dựng zone. Picker của zone **chỉ chào collection loại tin đúng kiểu**, xuất bản **từ chối** collection không Active, và **hai danh sách phải là hai collection khác nhau**.',
        cols: ['Khối', 'Loại collection', 'Vì sao'],
        rows: [
          ['**Job list** (bắt buộc)', '**Saved search** — một bộ lọc, chạy lại mỗi lượt truy cập', 'Tin mới **tự vào**; tin đóng/ẩn tự rớt ra. Danh sách chính không nên phải chăm bằng tay.'],
          ['**Featured jobs** (tuỳ chọn)', '**Hand-picked** — đúng những tin bạn ghim, theo thứ tự bạn xếp', 'Chỗ này là **biên tập**. Tin ghim **không tự làm mới**: khi một tin featured đóng lại, phải thay bằng tay.'],
        ],
      },
      {
        kind: 'table',
        heading: 'Trạng thái zone và việc nó cho phép gì',
        cols: ['Trạng thái', 'Trên site jobseeker', 'Nút trong panel Actions'],
        rows: [
          ['**Draft**', 'Không hiện (địa chỉ trả “không tìm thấy”)', 'Publish · Delete'],
          ['**Published**', '**Sống** tại địa chỉ của nó', 'Unpublish · Archive'],
          ['**Archived**', 'Không hiện; **địa chỉ vẫn được giữ chỗ**', 'Restore to draft'],
        ],
      },
      {
        kind: 'list',
        heading: 'Điều kiện xuất bản',
        items: [
          'Có **ít nhất một banner slide** (đã lưu).',
          'Cả **hai danh sách** phải đang trỏ vào collection **Active** và **đúng loại**.',
          '**Chỉ Draft mới xoá được** — xoá thì địa chỉ được giải phóng.',
        ],
      },
      {
        kind: 'table',
        heading: 'Địa chỉ công khai — ba ngôn ngữ, ba tiền tố',
        cols: ['Ngôn ngữ', 'Đường dẫn'],
        rows: [
          ['Tiếng Việt', '`/khu-tuyen-dung/<address>`'],
          ['English', '`/zones/<address>`'],
          ['한국어', '`/채용관/<address>`'],
        ],
        note: 'Ví dụ đang sống: **MB Bank** (`/zones/mb-bank`) và **Korean companies — NIPA** (`/zones/nipa`). NIPA không có logo đối tác nên topbar chỉ hiện saramin; thanh tìm kiếm của nó có 3 bộ lọc (không có cấp bậc).',
      },
      {
        kind: 'table',
        heading: 'Kích thước ảnh và xử lý HTML',
        cols: ['Chỗ', 'Quy tắc'],
        rows: [
          ['**Banner**', 'Băng cố định: **1260 × 400** trên desktop (63:20) và **720 × 600** trên mobile (6:5). Ảnh khác tỉ lệ bị **cắt cho vừa** — giữ chữ và logo tránh xa mép. Không có ảnh mobile thì ảnh desktop được dùng luôn trên điện thoại.'],
          ['**Top / Bottom block**', 'Bật *Show this block*; **tắt đi là lưu xong sẽ xoá sạch nội dung khối đó**. Chọn *Text* hay *Image*. Với text, chọn *Rich text* để soạn tại chỗ hoặc *HTML* để dán đoạn có sẵn.'],
          ['**HTML dán vào**', 'Được **làm sạch khi lưu**: bỏ script, style, iframe, form và inline style; giới hạn **20.000 ký tự sau khi làm sạch**. Ô *Preview (server rules)* bên dưới cho thấy phần nào sẽ sống sót.'],
          ['**Partner logo**', 'PNG hoặc SVG **trong suốt**, cao khoảng **30 px**.'],
          ['**Company link image**', 'Tuỳ chọn, rộng **ít nhất 1600 px**.'],
        ],
      },
      {
        kind: 'table',
        heading: 'Đổi, gỡ, nghỉ hưu một trang',
        cols: ['Tôi muốn…', 'Làm gì', 'Chuyện gì xảy ra'],
        rows: [
          ['Sửa nội dung trên trang đang sống', 'Sửa khối → **Save**', 'Trang sống cập nhật trong khoảng một phút'],
          ['Tạm gỡ trang xuống', '**Unpublish**', 'Về Draft; địa chỉ trả “không tìm thấy”'],
          ['Cho một chiến dịch nghỉ', '**Archive**', 'Offline; **địa chỉ vẫn giữ chỗ**'],
          ['Đưa trang đã archive trở lại', '**Restore to draft** → kiểm → **Publish**', 'Không bao giờ quay thẳng lại sống'],
          ['Bỏ một bản nháp', '**Delete** (chỉ Draft)', 'Xoá hẳn; **địa chỉ được giải phóng**'],
        ],
      },
      {
        kind: 'table',
        heading: 'Gỡ rối',
        cols: ['Triệu chứng', 'Nguyên nhân và cách xử lý'],
        rows: [
          ['Publish bị mờ / báo “Add at least one banner slide and save before publishing.”', 'Thêm một banner slide có ảnh desktop, **Save**, rồi Publish.'],
          ['Publish lỗi “The collection … is not active”', 'Một collection phía sau danh sách đã bị archive hoặc chưa bao giờ publish. Publish lại collection đó, hoặc chọn collection khác.'],
          ['Trang công khai báo “không tìm thấy”', 'Zone đang Draft/Archived, hoặc gõ sai địa chỉ. Nhớ đường dẫn tiếng Việt là `/khu-tuyen-dung/<address>`.'],
          ['Nút Preview bị mờ', 'Zone **chưa** Published — chưa có preview cho bản nháp. Trên bản dựng chưa cấu hình địa chỉ site công khai, nút cũng mờ và nói rõ điều đó.'],
          ['Trang hiện tin của **sai công ty**', 'Zone hiện **đúng những gì collection chứa**. Sửa bộ lọc (Saved search) hoặc danh sách ghim (Hand-picked) — **không sửa zone**.'],
          ['Hàng **Featured jobs** biến mất', 'Collection hand-picked rỗng, hoặc **mọi** tin ghim đã đóng/ẩn — khối tự ẩn mình.'],
          ['Ảnh trông trắng trong trình soạn', 'Không hẳn là mất: ảnh đang được chuyển đổi ngầm vài giây. Kiểm trên trang công khai.'],
          ['Các picker của thanh tìm kiếm không hiện số đếm', '**Đúng như thiết kế hiện tại**: số đếm trên trang tìm kiếm chính là toàn site, nên trang zone không hiện.'],
        ],
      },
      {
        kind: 'open',
        text:
          '**Quyền.** Zone cần quyền `zone` (read · create · update), mặc định cấp cho vai trò HQ admin. Collection cần quyền `job_collection`. Cả hai cấp được cho vai trò khác ở *Roles & permissions*. — **Dữ liệu dev:** hai collection của MB Bank trên dev hiện gồm cả tin của VPBank, Cathay Life và TSB; đó là dữ liệu test.',
      },
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
    logic: [
      'Sơ đồ tổ chức nội bộ của Saramin: **cây hai tầng** — một phòng ban, và các team bên trong nó. **Một team đơn giản là một phòng ban có cha** — cùng trang, cùng quyền. **Không có tầng thứ ba.**',
      'Phòng ban trả lời câu hỏi **“người này ngồi ở đâu”**. Nó là một trong ba mảnh ghép: *phòng ban* (ngồi ở đâu) × *vai trò* (được làm gì) × *phạm vi dữ liệu* (trên dữ liệu nào).',
      'Trang này **chỉ nói về nhân viên Saramin (HQ operator)**. Người dùng phía công ty trên site nhà tuyển dụng có vai trò riêng và **không bao giờ xuất hiện ở đây**.',
    ],
    how: [
      '**New department** để tạo phòng ban gốc; mở phòng ban đó rồi **Add team** để tạo team bên trong.',
      'Bấm một nút để mở trang của nó (`/system/departments/:id`): danh sách thành viên (mỗi người link sang trang tài khoản), các team con, và hai nút *Add team* / *Delete*.',
      'Đặt **Leader** cho từng nút — **sau khi** đã có người, vì leader phải là một operator đang hoạt động.',
    ],
    watch: [
      '**Làm leader của một nút không cấp thêm quyền gì cả.** Ô Leader là **thông tin danh bạ**. Thứ một leader nhìn thấy đến từ **vai trò và phạm vi dữ liệu** của họ, không bao giờ từ việc được đặt tên làm leader.',
      '**Parent chỉ chọn được lúc tạo và không đổi được sau đó — không có thao tác “move”.** Muốn chuyển một team sang phòng ban khác: tạo team mới dưới phòng ban đúng → chuyển người sang → xoá team cũ.',
      '**Xoá một nút thì người vẫn còn.** Thành viên giữ nguyên tài khoản và chỉ đơn giản là **không thuộc phòng ban nào**. Hộp thoại xác nhận có nói rõ.',
      '**Phòng ban còn team thì không xoá được.** Xoá hoặc làm rỗng các team trước — tái cơ cấu **không bao giờ là một thao tác dây chuyền**.',
      'Tên chỉ cần **duy nhất trong cùng một cấp** — hai phòng ban đều có thể có một team tên “Team A”.',
    ],
    blocks: [
      {
        kind: 'table',
        heading: 'Ba câu hỏi, ba nơi trả lời',
        note: '**Người dùng là nơi ba thứ gặp nhau.** Một phòng ban tự thân không cấp gì; một vai trò tự thân không với tới ai. Cái một operator thấy hằng ngày là: *các trang vai trò của họ mở ra* × *các bản ghi phạm vi của họ cho phép*, trong đó “team” nghĩa là phòng ban hoặc team họ đang ngồi.',
        cols: ['Câu hỏi', 'Trả lời ở', 'Ví dụ'],
        rows: [
          ['**Người này ngồi ở đâu?**', '*Departments* → rồi chọn trên người dùng', 'Sales › Sales SVN 2'],
          ['**Họ được làm gì?**', '*Roles* → rồi gán trên người dùng', 'Sale member: đọc + sửa Company accounts, tạo Quotes…'],
          ['**Trên dữ liệu nào?**', '**Phạm vi dữ liệu** chọn lúc gán vai trò', 'All data · Their team only · Only their own'],
        ],
      },
      {
        kind: 'table',
        heading: 'Thứ tự dựng — mỗi bước cần bước trước',
        cols: ['#', 'Bước', 'Ở đâu', 'Vì sao đúng thứ tự này'],
        rows: [
          ['1', 'Tạo phòng ban, rồi tạo team bên trong', 'Departments → *New department*, rồi *Add team*', 'Chỉ đặt người vào được một nút **đã tồn tại**'],
          ['2', 'Tạo vai trò và tick quyền', 'Roles → *New role*', 'Một lời mời **bắt buộc** mang ít nhất một vai trò'],
          ['3', 'Mời người', 'Users → *Invite user*', 'Chọn phòng ban, vai trò và phạm vi **trong cùng một form**'],
          ['4', 'Đặt leader cho từng phòng ban / team', 'Departments → mở nút → *Leader*', 'Leader phải là operator **đang hoạt động** — người đó phải tồn tại trước'],
        ],
      },
      {
        kind: 'table',
        heading: 'Các cột trong danh sách',
        cols: ['Cột', 'Nghĩa'],
        rows: [
          ['**Department**', 'Tên — tag *Team* đánh dấu một dòng là team'],
          ['**Teams**', 'Phòng ban này có mấy team (trên một dòng team thì là **—**)'],
          ['**Members**', 'Số operator **đặt trực tiếp** trên nút này. Số của một phòng ban **không bao gồm** thành viên của các team con'],
          ['**Leader**', 'Leader của nút, hoặc *No leader*'],
        ],
      },
      {
        kind: 'example',
        heading: 'Ví dụ — dựng một team sales',
        scenario: 'Kết quả: nhân viên sales thấy khách của chính mình; team leader thấy của cả team; quản lý thấy toàn bộ Sales. Chuyển một nhân viên sang team kia **chỉ là một thay đổi** — phòng ban trên trang người dùng của họ.',
        cols: ['#', 'Trang', 'Làm gì'],
        rows: [
          ['1', 'Departments', 'Tạo **Sales**; bên trong thêm team **Sales SVN 1** và **Sales SVN 2**'],
          ['2', 'Roles', 'Tạo **Sale member** (Company accounts: Read + Update · Quotes: Create + Read + Update · **không** Export), rồi **Duplicate** thành **Sale leader** và thêm *Daily activities: Read*, *Dashboards ▸ Sales: Read*'],
          ['3', 'Users', 'Mời **quản lý** vào *Sales* với vai trò *Sale leader* ở phạm vi **All data**'],
          ['4', 'Users', 'Mời **từng leader** vào team của họ với *Sale leader* ở phạm vi **Their team only**'],
          ['5', 'Users', 'Mời **từng nhân viên** vào team của họ với *Sale member* ở phạm vi **Only their own**'],
          ['6', 'Departments', 'Mở Sales SVN 1 và 2 → đặt **Leader** cho mỗi team'],
        ],
      },
    ],
  },
  users: {
    logic: [
      'Tài khoản **nhân viên Saramin (HQ operator)** — khác hẳn tài khoản ứng viên (nhóm User) và tài khoản khách hàng (Company users). Ba tập này **không bao giờ lẫn vào nhau**.',
      'Người dùng là **nơi ba mảnh gặp nhau**: phòng ban (ngồi ở đâu) × vai trò (được làm gì) × **phạm vi dữ liệu** chọn lúc gán vai trò (trên dữ liệu nào).',
      '**Không có ô mật khẩu.** Tài khoản được tạo ra **không có mật khẩu** và người đó nhận một **link dùng một lần** để tự đặt. Không ai khác từng biết mật khẩu đó.',
    ],
    how: [
      '**Invite user** → họ tên · email · số điện thoại · chức danh · **phòng ban** · **extension** (cho tổng đài) · **ít nhất một vai trò**, mỗi vai trò kèm **phạm vi dữ liệu** của nó.',
      'Lọc danh sách (tìm theo tên hoặc email — **không phân biệt dấu**; lọc theo phòng ban — chọn một phòng ban **bao gồm cả các team của nó**; lọc theo vai trò; và các tab trạng thái) rồi bấm một dòng.',
      'Trang của một người (`/system/users/:id`): hồ sơ bên trái (phòng ban, chức danh, điện thoại, extension); bên phải là các hành động tài khoản, khối **Roles & data reach** có nút Save riêng, và **10 hành động gần nhất** của người đó lấy từ audit log.',
    ],
    watch: [
      '**Bạn không đổi được vai trò của chính mình** — phải nhờ một admin khác.',
      '**Chỉ HQ Admin mới phong được HQ Admin cho người khác.** Và một admin không phải HQ **không gán được vai trò mang quyền mà chính họ không có**.',
      '**Không ai gõ mật khẩu hộ người khác.** Người được mời bấm link và tự đặt mật khẩu.',
      'Đổi vai trò của người đang đăng nhập thì họ phải đăng xuất vào lại mới thấy quyền mới.',
      '**Resend invite có cooldown 60 giây** cho mỗi người — bấm lại quá nhanh sẽ nhận “try again shortly”.',
    ],
    blocks: [
      {
        kind: 'table',
        heading: 'Ba trạng thái tài khoản',
        cols: ['Trạng thái', 'Nghĩa', 'Hành động có trên dòng'],
        rows: [
          ['**Pending**', 'Đã mời, **chưa đặt mật khẩu** — chưa đăng nhập được', '*Resend invite link*'],
          ['**Active**', 'Đã đặt mật khẩu, tài khoản đang chạy', '*Reset password* — **xoá mật khẩu, gửi link mới, và đăng xuất họ ở mọi nơi**'],
          ['**Inactive**', 'Bị admin vô hiệu hoá', '*Activate*'],
        ],
      },
      {
        kind: 'table',
        heading: 'Deactivate và Delete — hai nút, hai nghĩa khác hẳn',
        note: '**Dòng cuối là chủ đích:** lịch sử “ai đã làm việc này” **bắt buộc phải sống sót**. Người đã từng làm việc trong hệ thống thì **chỉ vô hiệu hoá được**, không xoá được.',
        cols: ['', '**Deactivate**', '**Delete**'],
        rows: [
          ['Tác dụng', 'Giữ tài khoản, không đăng nhập được, liệt kê là *Inactive*', '**Xoá hẳn tài khoản**, giải phóng email'],
          ['Dùng cho', 'Người đã nghỉ hoặc đang tạm dừng', 'Lời mời gõ nhầm, trùng lặp, người chưa từng đăng nhập'],
          ['Bị từ chối khi', 'Chính bạn · super-admin gốc · **HQ Admin đang hoạt động cuối cùng**', 'Y như trên, **cộng thêm** bất kỳ ai đã từng làm việc trong hệ thống (tạo công ty, báo giá, đơn hàng…)'],
        ],
      },
      {
        kind: 'table',
        heading: 'Phạm vi dữ liệu — nơi Departments và Roles gặp nhau',
        note: 'Vậy **phòng ban chọn trên người dùng là thứ định nghĩa “team của họ”**, còn **phạm vi chọn trên vai trò là độ vươn của quyền đó**. Đổi một trong hai thì tầm nhìn của người đó đổi theo. **Một người giữ được hai vai trò ở hai phạm vi khác nhau** — ví dụ Sales ở *Only their own* và Marketing ở *All data*.',
        cols: ['Phạm vi', 'Người đó thấy', 'Ai thường giữ'],
        rows: [
          ['**All data**', 'Mọi bản ghi mà các trang của vai trò đó hiện', 'HQ Admin, quản lý, vận hành'],
          ['**Their team only**', 'Bản ghi thuộc về người trong **chính phòng ban / team của họ** — **và các team bên dưới nó**', 'Team leader'],
          ['**Only their own**', 'Bản ghi được gán **cho đích danh họ** (công ty của họ, báo giá của họ)', 'Nhân viên sales'],
        ],
      },
      {
        kind: 'table',
        heading: 'Hai nhóm người dùng không bao giờ lẫn vào nhau',
        cols: ['Nhóm', 'Là ai', 'Làm việc ở đâu'],
        rows: [
          ['**Operator**', 'Nhân viên Saramin (nội bộ HQ)', 'Admin console — chính là trang này'],
          ['**Company user**', 'Nhân sự của khách hàng', 'Site nhà tuyển dụng, có bộ vai trò **riêng hoàn toàn**'],
        ],
      },
      {
        kind: 'table',
        heading: 'Các thông báo bạn sẽ gặp',
        cols: ['Thông báo', 'Vì sao', 'Làm gì'],
        rows: [
          ['“N operators still hold this role”', 'Vai trò đang có người giữ', 'Gỡ vai trò khỏi những người đó trước'],
          ['Xoá vai trò toàn quyền cuối cùng bị từ chối', 'Nó sẽ khoá cả console', 'Cấp toàn quyền cho một vai trò khác trước'],
          ['“You cannot change your own role assignments”', 'Bảo vệ chống tự phong quyền', 'Nhờ một admin khác'],
          ['Xoá user bị từ chối, có bản ghi tham chiếu tới họ', 'Họ đã từng làm việc trong hệ thống', '**Deactivate** thay vì xoá'],
          ['Xoá phòng ban bị từ chối', 'Nó vẫn còn team', 'Xoá hoặc làm rỗng các team trước'],
          ['“An admin user with this email already exists”', 'Lời mời đã gửi rồi', 'Tìm dòng **Pending** → *Resend invite link*'],
          ['Resend invite → “try again shortly”', '**Cooldown 60 giây** cho mỗi người', 'Chờ một phút'],
        ],
      },
      {
        kind: 'table',
        heading: 'Nơi khác liên quan',
        cols: ['Ở đâu', 'Vì sao quan trọng ở đây'],
        rows: [
          ['**System → Audit log**', '**Mọi** thay đổi vai trò, thay đổi quyền, lời mời, vô hiệu hoá và xoá đều được ghi kèm **ai đã làm** — trang người dùng hiện 10 cái gần nhất'],
          ['**CRM → Customers**', '*Only their own* và *Their team only* quyết định nhân viên sales và leader thấy khách nào — **phạm vi cảm nhận rõ nhất ở đây**'],
          ['**Call centre**', '**Extension** trên người dùng là thứ nối các cuộc gọi về đúng họ'],
          ['**Company users** (site nhà tuyển dụng)', 'Một tập tài khoản và vai trò **riêng**; không gì trên ba trang này chạm tới nó'],
        ],
      },
      {
        kind: 'open',
        text:
          '**Khác biệt so với tài liệu cũ.** Bản mô tả cũ nói trình tự là *danh bạ nhân sự → vai trò → operator → gán vai trò → gửi lời mời* (5 bước). Bản dựng hiện tại gom lại thành **một form Invite user duy nhất** (phòng ban + vai trò + phạm vi cùng lúc), và thứ tự dựng là **phòng ban → vai trò → mời người → đặt leader**. Dùng trình tự mới.',
      },
    ],
  },
  roles: {
    logic: [
      'Một **vai trò** là một cái tên, một mô tả, và **một lưới quyền**. Danh sách hiện số quyền mỗi vai trò cấp và **bao nhiêu operator đang giữ** nó.',
      '**Mọi vai trò đều sửa được** — kể cả các vai trò có sẵn như *HQ Admin*: đổi tên, đổi quyền, nhân bản, xoá. **Không có loại “vai trò hệ thống” bị khoá cứng.**',
      'Quyền dạng `resource:action` kèm phạm vi `all` · `company` · `own`. **Phạm vi không đặt ở đây** — nó được chọn lúc **gán vai trò cho một người** ở trang Users.',
      '**Mỗi trang admin là một dòng** trên lưới, gom theo module.',
    ],
    how: [
      '**New role** → đặt tên và mô tả → tick quyền trên lưới theo từng trang → lưu một lần.',
      'Gần giống một vai trò có sẵn thì **Duplicate** — cách nhanh nhất để làm một biến thể, nó sao chép **toàn bộ** quyền.',
      'Dùng **dòng nhóm** và **Apply to all pages** để tick một hành động trên nhiều trang cùng lúc. Bộ đếm *X / N pages granted* cập nhật ngay.',
      'Gán vai trò cho người: làm ở **Users**, không làm ở đây.',
    ],
    watch: [
      '**Create không bao hàm Read.** Bốn cột C · R · U · D **độc lập** — tick từng cái vai trò cần.',
      '**Export tách khỏi Read có chủ đích**: nhìn thấy các dòng và **mang tất cả chúng ra ngoài** là hai quyết định khác nhau.',
      '**Bạn không cấp được thứ bạn không có.** Một operator không phải HQ Admin chỉ tick được những quyền chính họ đang giữ.',
      '**Vai trò đang có người giữ thì không xoá được** — nút nói rõ bao nhiêu người. Gán lại cho họ trước.',
      '**Vai trò toàn quyền cuối cùng không xoá và không tước được** (toàn quyền = được sửa vai trò và người dùng). Đây là thứ giữ cho console không khoá hết mọi người ra ngoài.',
      '**Hai người sửa cùng một vai trò: lần lưu sau thắng, không cảnh báo gì.** Thống nhất ai sửa.',
    ],
    blocks: [
      {
        kind: 'table',
        heading: 'Các cột trên lưới quyền',
        cols: ['Cột', 'Nghĩa'],
        rows: [
          ['**None**', 'Trạng thái rỗng — tick vào đây là **xoá sạch cả dòng**'],
          ['**Create · Read · Update · Delete**', '**Độc lập với nhau.** Create không bao hàm Read; tick từng cái vai trò cần'],
          ['**Export**', 'Tải danh sách ra file. **Tách khỏi Read có chủ đích** — nhìn thấy và mang đi là hai quyết định'],
        ],
      },
      {
        kind: 'table',
        heading: 'Những thứ trên lưới trông lạ nhưng là chủ đích',
        cols: ['Bạn thấy', 'Nó nghĩa là'],
        rows: [
          ['Một **dấu gạch** trong ô', 'Hành động đó **không tồn tại** cho trang này (Orders không xoá được; số dư dịch chuyển qua đơn hàng, không sửa tay)'],
          ['**Not grantable** trên một dòng', 'Trang đó **chưa có quyền riêng**, hoặc **đi nhờ quyền của trang khác** (Applicants và Job approval đi nhờ Jobs)'],
          ['**Limited** trên một dòng', 'Chỉ **một phần** hành động tồn tại (Company activities: Create + Read — feed là một bản ghi, không bao giờ sửa)'],
          ['**Partial** trên một dòng', 'Một vai trò cũ đang giữ **một phần** các quyền nằm sau một ô. Lưu lại sẽ **giữ nguyên** nó trừ khi bạn động vào ô đó'],
          ['Không có cột **Approve / confirm / mark paid / unlock CV**', 'Chúng **gộp vào Update** trên chính trang của chúng — không có cột “Approve” riêng'],
        ],
      },
      {
        kind: 'warn',
        text:
          'Quyền hiển thị ở giao diện chỉ là **trải nghiệm** — nó ẩn nút người dùng không bấm được. **Chặn thật nằm ở server, trên MỌI lời gọi**, kèm cả kiểm tra phạm vi theo từng dòng. Đừng bao giờ coi việc ẩn nút là một lớp bảo mật. Gỡ một vai trò là **vô hiệu hoá, không bao giờ xoá cứng**, để dấu vết truy vết còn nguyên — và **mọi** thay đổi vai trò đều vào audit log.',
      },
      {
        kind: 'table',
        heading: 'Kịch bản test nên chạy',
        cols: ['Kịch bản', 'Đạt khi'],
        rows: [
          ['Mời một người với đúng một vai trò', 'Họ hiện ở **Pending**; email tới; sau khi đặt mật khẩu họ thành **Active** và **chỉ thấy các trang vai trò đó mở ra**'],
          ['Bỏ tick *Company accounts: Read* trên vai trò của họ', 'Trang đó **biến khỏi menu của họ** ở lần tải trang kế tiếp'],
          ['Một sales ở *Only their own*, một sales khác ở *Their team only*, cùng một team', 'Người đầu thấy khách của mình; người sau thấy khách của **cả hai**'],
          ['Chuyển một user từ Sales SVN 1 sang Sales SVN 2', 'Tầm nhìn “team” của họ **chuyển sang bản ghi của team mới**'],
          ['Thử xoá một vai trò 2 người đang giữ', '**Từ chối**, kèm con số'],
          ['Thử xoá một user đã từng tạo một báo giá', '**Từ chối**; *Deactivate* thì được'],
          ['Thử sửa vai trò của chính mình', '**Từ chối** kèm thông báo'],
          ['Xoá một phòng ban còn team', '**Từ chối**; sau khi xoá hết team thì thành công và **thành viên của nó bị bỏ trống phòng ban**'],
          ['Đặt leader phòng ban là người **không phải thành viên**', '**Cho phép**; và leader đó **không có thêm tầm nhìn nào** từ việc này'],
          ['Mở *Reset password* trên một user Active', 'Họ **bị đăng xuất ở mọi nơi** và nhận link mới; dòng chuyển về **Pending**'],
        ],
      },
      {
        kind: 'open',
        text:
          '**Trên dev hiện có 19 vai trò**, gồm *HQ Admin* (287 quyền, 15 operator), *VN Sales Staff*, *VN Sales Leader*, *Sale manager / Sale leader / Sale member*, *Operation*, *Customer Service Role*, *Marketing*, *SEO* và vài vai trò test. **Ma trận vai trò cuối cùng vẫn là quyết định của khách hàng** — lưới thì đã có, ma trận được điền ở tài liệu này chứ không nằm trong code.',
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
    blocks: [
      {
        kind: 'list',
        heading: 'Product nào có mặt trên thang',
        items: [
          'Một product là **một bậc** khi nó **loại Job posting**, **Active**, và **có Display duration**. Mọi thứ khác **không phải bậc tin** và không lên thang.',
          'Danh sách **ngắn có chủ đích** — không bộ lọc, không phân trang.',
          'Chuyển một bậc sang **Inactive** thì nó **rời thang**. Kích hoạt lại thì nó **quay về đúng Display order cũ**.',
          'Product **không có Display duration** thì **không bao giờ** xuất hiện, dù thứ hạng đặt là gì.',
        ],
      },
      {
        kind: 'p',
        text:
          'Kéo một bậc (hoặc focus vào tay cầm rồi bấm **↑ / ↓**). Thứ tự đã lưu **chính là sắp xếp “Gợi ý” trên trang tìm việc**: khi tin ở các bậc khác nhau rơi vào cùng một danh sách, tin có bậc **đứng cao hơn trên thang** hiện cao hơn. Áp dụng cho **Job search**, **Jobs by location**, **Jobs by category**, **Jobs by industry** — mọi danh sách trộn nhiều product trong một placement.',
      },
      {
        kind: 'warn',
        text:
          '**Respace the ladder** đánh số lại **toàn bộ** các bậc thành 10, 20, 30… — **cùng thứ tự, khoảng cách mới** — để chèn được một bậc mới vào giữa hai bậc bất kỳ. Nếu hai bậc trùng Display order, màn hình **nói rõ và từ chối lưu** cho tới khi bạn respace.',
      },
      {
        kind: 'table',
        heading: 'Kiểm bằng cách',
        cols: ['Làm', 'Đạt khi'],
        rows: [
          ['Kéo bậc B lên trên bậc A → Lưu', 'Trên Job search, sắp xếp *Gợi ý*: tin của **B nằm trên** tin của A. **Giá, thứ hạng và perk của product không đổi**'],
          ['Mở hai tab, sắp lại ở cả hai, lưu cả hai', 'Lần lưu **thứ hai bị từ chối** với “the ladder changed while you were editing”, và màn hình **tải lại**'],
          ['Đổi Ladder rank của bậc B xuống dưới bậc A, rồi thử **Upgrade tier** một tin từ A lên B', '**Upgrade bị từ chối** — chỉ được nâng lên bậc **cao hơn**'],
          ['Kéo Distinction lên trên Top Job', 'Trong cùng một ngành nghề, tin Distinction giờ **nằm trên** Top Job trong băng *Việc làm xu hướng*'],
        ],
      },
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
