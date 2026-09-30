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
          ['Đánh số', 'Dãy số của mình — PO-005864-08-2026', 'Dãy số pháp lý của nhà cung cấp — liên tục, nhà nước quản lý'],
          ['Sửa được?', 'Không — phát hành PO mới', '**Không bao giờ** — huỷ + credit note + phát hành lại'],
          ['Huỷ được?', 'Không — PO không dùng thì tự hết hiệu lực', 'Có — đây là chỗ một giao dịch được huỷ bỏ'],
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
          '**Chưa chốt — huỷ hoá đơn thì thu hồi quota thế nào,** khi khách đã tiêu một phần. Ba hướng: thu hồi phần chưa dùng · để nguyên và đối trừ trên credit note · chặn huỷ khi đã tiêu bất kỳ phần nào. Đây là tình huống sẽ xảy ra thật, vì huỷ hoá đơn tồn tại chính cho trường hợp phát hành trước khi thu tiền.',
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
        heading: 'Placement — kho xoay vòng không giới hạn',
        items: [
          'Placement là **khu vực hiển thị** trên trang jobseeker: kích thước, hiện bao nhiêu cái cùng lúc, bao lâu xoay một lần. Khai một lần ở đây, sản phẩm trỏ vào — không khai lại trong từng lần bán.',
          'Trang hiển thị một số vị trí cố định nhưng phía sau xoay vòng **bao nhiêu banner cũng được**. Nên vị trí không bao giờ “đầy”, và bán thêm không hết chỗ — nó làm **mỏng tỉ lệ hiển thị** của những khách đã mua.',
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
      'Hai loại tài khoản hoàn toàn khác nhau nằm cạnh nhau: người tìm việc và người của công ty khách hàng. Tài khoản nhân viên Saramin **không** ở đây — nó ở System → Users.',
    headline: [
      '**Bốn trạng thái ở API hiện thành năm trạng thái trên màn hình.** Cặp hay nhầm là Withdrawn và Deactivated.',
      '**Xoá là xoá mềm.** Bản ghi vẫn còn 30 ngày nên luôn khôi phục được trong thời gian đó.',
    ],
    blocks: [
      {
        kind: 'table',
        heading: 'Năm trạng thái',
        cols: ['Hiện trên UI', 'Nghĩa', 'Ai gây ra', 'Làm được gì'],
        rows: [
          ['Active', 'Đang dùng bình thường', '—', 'Deactivate · Delete'],
          ['Unverified', 'Đăng ký nhưng chưa xác thực', '—', 'Gửi lại xác thực · Delete'],
          ['**Withdrawn**', 'Người dùng **tự** tắt tài khoản', 'Chính ứng viên', 'Reactivate · Delete'],
          ['**Deactivated**', 'Bị HQ khoá', 'Admin', 'Reactivate · Delete'],
          ['Deleted', 'Xoá mềm, purge sau 30 ngày', 'Admin hoặc ứng viên', 'Restore'],
        ],
      },
      {
        kind: 'warn',
        text:
          'Withdrawn và Deactivated là **cùng một trạng thái phía API**, phân biệt bằng **ai là người đổi**. Vì thế tab Withdrawn query cùng tập dữ liệu với tab Deactivated, và phân biệt nằm ở cột trạng thái từng dòng. Đừng “reactivate” một tài khoản Withdrawn như thể HQ khoá nhầm — chính người dùng đã tắt nó.',
      },
      {
        kind: 'list',
        heading: 'Ba loại tài khoản, đừng lẫn',
        items: [
          '**Jobseeker users** — ứng viên. Ở nhóm User.',
          '**Company users** — người của khách hàng; một dòng là một tư cách thành viên trong một công ty. Cũng ở nhóm User.',
          '**Users** — nhân viên Saramin. Ở **System**, không ở đây.',
        ],
      },
      { kind: 'list', heading: 'Riêng tư', items: ['Lý do nhập khi khoá/xoá là **ghi chú nội bộ**, người dùng không bao giờ thấy.'] },
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
    blocks: [
      {
        kind: 'table',
        heading: 'Hai cửa đăng tin — và mỗi cửa được dùng sản phẩm nào',
        note:
          'Tin là **một thực thể, một vòng đời** dù đăng từ đâu. Nhưng **quyền đăng thì khác nhau**, và điều đó đến từ cấu hình của sản phẩm — không bao giờ đến từ tên sản phẩm.',
        cols: ['Cửa', 'Được đăng từ', 'Quy tắc'],
        rows: [
          [
            'Admin (HQ)',
            'Bất kỳ sản phẩm nào — kể cả **bậc miễn phí chỉ Admin có**, hoặc bất kỳ dòng nào trên PO còn hiệu lực của công ty',
            'Bậc miễn phí **không cần PO và không giới hạn**: HQ đăng cho bất kỳ công ty nào, bất kỳ lúc nào, không điều kiện gì.',
          ],
          [
            'Trang công ty',
            'Chỉ những sản phẩm công ty **đã mua** (dòng PO còn hiệu lực)',
            'Nhà tuyển dụng **không bao giờ** đăng được tin miễn phí — bậc miễn phí không xuất hiện trên trang công ty.',
          ],
        ],
      },
      {
        kind: 'warn',
        text:
          '**Tin miễn phí có năm hệ quả cần biết trước khi hứa với khách:** không gắn PO nào · không tiêu quota · **bị loại khỏi báo cáo doanh thu** · **không nâng lên bậc trả phí được về sau** · và **không có vị trí hiển thị cao cấp nào** (chỉ nằm trong danh sách mặc định). Đăng miễn phí để chiều khách rồi tháng sau phải giải thích vì sao nó không lên trang chủ là tình huống hay xảy ra nhất.',
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
      'Một tài khoản **Active mà CV đang ẩn** là trạng thái **bình thường**, không phải lỗi — hai thứ đó độc lập hoàn toàn.',
    ],
    blocks: [
      {
        kind: 'table',
        heading: 'HQ làm được gì và không làm được gì',
        cols: ['HQ làm được', 'HQ không bao giờ làm được'],
        rows: [
          ['Tìm kiếm tài khoản, xem chi tiết', '**Xem hoặc đặt mật khẩu** — không bao giờ'],
          ['Khoá / mở lại (kèm lý do)', 'Đọc bất kỳ thông tin đăng nhập nào'],
          ['Gửi link đặt lại mật khẩu', 'Bật hiển thị CV hộ ứng viên'],
        ],
      },
      {
        kind: 'warn',
        text:
          'Mở CV hoặc thông tin liên hệ của ứng viên từ Admin là **thao tác chạm dữ liệu cá nhân và luôn được ghi log**. Hỗ trợ người quên mật khẩu thì **gửi link đặt lại** — không ai gõ mật khẩu hộ người khác, ở bất kỳ vai trò nào.',
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
      'Khai báo các khu vực hiển thị trên trang jobseeker: kích thước, hiện bao nhiêu cái cùng lúc, bao lâu xoay một lần.',
      'Product trỏ vào một Placement — kích thước khai một lần ở đây, không lặp lại trong từng lần bán.',
    ],
    how: ['Mở một vị trí → sửa trong drawer.', 'Drawer chỉ hiện đúng phần thuộc loại vị trí đó (banner hay nội dung).'],
    watch: [
      '“Hiện bao nhiêu cái” là số vị trí render **cùng lúc**, không phải giới hạn số banner được đặt — kho xoay vòng là không giới hạn.',
      '“Placement” có **ba nghĩa** trong hệ thống — xem bảng dưới.',
    ],
    blocks: [
      {
        kind: 'table',
        heading: '“Placement” — ba nghĩa, ba nơi, ba vòng đời',
        note: 'Đây là nguồn nhầm lẫn số 1 trong toàn hệ thống: ba thứ khác nhau cùng mang một cái tên.',
        cols: ['Nghĩa', 'Là gì', 'Xem ở đâu', 'Vòng đời'],
        rows: [
          ['**Khu vực hiển thị**', 'Cấu hình thuần: kích thước, hiện bao nhiêu cái, xoay bao lâu một lần', '**Trang này**', 'Gần như không đổi'],
          ['**Bậc một tin đang chiếm**', 'Một giao dịch: tin nào, bậc nào, từ ngày nào tới ngày nào, gắn PO nào', 'Trong chi tiết tin — **không có trang riêng**', 'Theo từng tin'],
          ['**Booking banner**', 'Mua đứt một chỗ hiển thị trong một kỳ. **Không liên quan tin tuyển dụng**', 'Content → Displays', 'Theo từng booking'],
        ],
      },
      {
        kind: 'warn',
        text:
          'Một vị trí có thể được lấp từ **hai nguồn**: **theo bậc tin** (tự động, không ai đặt) và **mua đứt** (bán rời). Vị trí nào có cả hai nguồn thì **bắt buộc phải có quy tắc ưu tiên rõ ràng**, nếu không những chỗ hữu hạn sẽ bị bán vượt — và chuyện đó chỉ lộ ra trên trang thật.',
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
      '**Hoá đơn đã phát hành thì không sửa được, không bao giờ.** Sai thì huỷ + credit note + phát hành lại — đó là quy định, không phải giới hạn của phần mềm.',
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
        kind: 'open',
        text:
          '**Chưa chốt — phát hành trùng.** Sự kiện “hoá đơn đã phát hành” **có thể bắn hai lần** (nhà cung cấp hoá đơn timeout rồi thử lại là chuyện bình thường). Việc cấp quota phải khoá theo mã hoá đơn, nếu không khách **âm thầm nhận gấp đôi quota**. Đây là lỗi production dễ xảy ra nhất trong cả chuỗi.',
      },
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
      'Banner và Popup nay là **MỘT danh sách gộp**, không còn hai tab. Nút **New** hỏi **vùng hiển thị trước** (banner và popup chung một danh sách chọn — popup chỉ là một loại vị trí khác), rồi mới mở đúng form tương ứng.',
      'Mỗi banner có nguồn **Sold** (khách mua, gắn PO) hoặc **House** (Saramin tự chạy). Banner nội bộ vẫn chiếm chỗ xoay vòng như banner bán.',
      'Cùng vòng đời Draft → Schedule → Open → Expired và cùng có **Exposure** riêng.',
    ],
    how: [
      'Bấm **New** → **chọn vùng hiển thị trước** → form banner hoặc popup tự mở theo vùng đã chọn.',
      'Banner bán: chọn công ty → PO → sản phẩm, rồi đặt ngày bắt đầu và tải ảnh.',
      'Banner nội bộ: chọn thẳng vị trí, tự đặt **cả hai** ngày, và ghi **mục đích**.',
      'Gỡ khỏi site mà không kết thúc booking: tắt **Exposure**.',
    ],
    watch: [
      'Ảnh phải đúng kích thước của vị trí — sai tỉ lệ sẽ bị từ chối khi lưu, không tự cắt.',
      'Banner Open mà Exposure Off thì không hiển thị — giống hệt cơ chế của tin tuyển dụng.',
    ],
    blocks: [
      {
        kind: 'table',
        heading: 'Banner bán và banner nội bộ — khác nhau ở đâu',
        note: 'Chỉ khác ở **phía tiền**. Phía hiển thị thì giống hệt nhau.',
        cols: ['', 'Sold — khách mua', 'House — nội bộ'],
        rows: [
          ['Chuỗi để đăng', 'Công ty → PO → dòng sản phẩm', 'Chọn thẳng vị trí'],
          ['Cần hoá đơn đã thanh toán?', '**Có** — PO chưa xuất hoá đơn thì không đăng được', 'Không — không có gì để xuất hoá đơn'],
          ['Ngày kết thúc', 'Suy ra từ thời lượng của sản phẩm', '**Gõ tay** — không sản phẩm nào định nghĩa thời lượng'],
          ['Chiếm chỗ xoay vòng', 'Có', '**Có — y hệt banner bán**'],
          ['Tính vào doanh thu vị trí', 'Có', 'Không'],
          ['Field bắt buộc thêm', '—', '**Mục đích** — lý do nó đang chạy'],
        ],
      },
      {
        kind: 'warn',
        text:
          '**Banner nội bộ tiêu sức chứa y như banner bán.** Nếu loại nó ra khỏi phép đếm thì booking bán thứ N sẽ không có chỗ để render, và chuyện đó chỉ lộ ra trên trang thật. **Mục đích** là field bắt buộc chính vì không có PO: với banner bán thì đơn hàng giải thích tại sao nó tồn tại; với banner nội bộ thì **không gì giải thích cả trừ khi có người viết ra**.',
      },
      {
        kind: 'table',
        heading: 'Đăng một banner — hai quyết định, và thứ bị khoá lại',
        note: 'Sản phẩm đã cố định kích thước, thời lượng và vị trí từ lúc bán. Nên lúc đăng chỉ hỏi **hai** thứ: bắt đầu khi nào, và chạy ảnh nào.',
        cols: ['Trạng thái', 'Sửa được ngày bắt đầu / ảnh?', 'Vì sao'],
        rows: [
          ['Draft', 'Cả hai — thoải mái', 'Chưa hứa gì với ai'],
          ['Schedule', 'Cả hai — thoải mái', 'Chưa lên màn hình, chưa phục vụ lượt nào'],
          ['**Open**', '**Cả hai đều KHOÁ**', 'Khách trả tiền cho đúng cái ảnh đang chạy. Đổi giữa chừng thì số lượt đã đếm được quy về một tấm ảnh không ai lấy lại được'],
          ['Expired', 'Chỉ đọc', 'Booking đã đóng là một bản ghi. Muốn chạy lại thì đăng cái mới'],
        ],
      },
      {
        kind: 'warn',
        text:
          'Đừng bao giờ cho đổi ảnh trên banner đang Open, và **đừng mô hình hoá Exposure thành trạng thái thứ năm**. Cả hai sai lầm dẫn tới cùng một hậu quả: số lượt hiển thị và click đã phục vụ không còn truy về được tấm ảnh đã phục vụ chúng. Muốn gỡ banner xuống giữa chừng thì **tắt Exposure** — đó là cách duy nhất, vì ảnh và ngày đều đã khoá.',
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
