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

import { CONTENT_PAGE_DOCS, CONTENT_MODULE_DOCS } from './pagedocs/content'
import { CRM_OPS_PAGE_DOCS } from './pagedocs/crm-ops'
import { CRM_SALES_PAGE_DOCS, CRM_SALES_MODULE_DOCS } from './pagedocs/crm-sales'
import { JOBS_APPS_PAGE_DOCS, JOBS_APPS_MODULE_DOCS } from './pagedocs/jobs-apps'
import { NOTIF_SYSTEM_PAGE_DOCS, NOTIF_SYSTEM_MODULE_DOCS } from './pagedocs/notif-system'
import { PRODUCT_SERVICE_PAGE_DOCS, PRODUCT_SERVICE_MODULE_DOCS } from './pagedocs/product-service'
import { RESUME_PAGE_DOCS, RESUME_MODULE_DOCS } from './pagedocs/resume'
import { USERS_ORG_PAGE_DOCS, USERS_ORG_MODULE_DOCS } from './pagedocs/users-org'

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
  /* A screenshot of the real console. The point of the guide's second half is
     that a reader recognises the screen, so the picture carries the step and the
     prose only says what to look at — never a click-by-click transcript, which
     goes stale the moment a button moves. `where` names the surface, because the
     same flow is three screens on three different sites. */
  | { kind: 'shot'; src: string; caption: string; where?: 'Admin' | 'Company site' | 'Jobseeker site'; note?: string }
  /* A flowchart from flows.tsx, by id. Drawn by hand rather than generated, so
     the boxes carry the console's own nouns in reading order — see flows.tsx. */
  | { kind: 'diagram'; id: string; heading?: string; note?: string }
  /* A numbered section opener, for a module page long enough to need a spine —
     Product settings walks its screens one by one, in the client's own Notion
     order, so a reader moving between the two finds the same section numbers. */
  | { kind: 'h'; text: string; path?: string }

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
  /* Modules rewritten 08/10/2026 against origin/dev live in src/pagedocs/ — edit them there. */
  ...CONTENT_MODULE_DOCS,
  ...CRM_SALES_MODULE_DOCS,
  ...JOBS_APPS_MODULE_DOCS,
  ...NOTIF_SYSTEM_MODULE_DOCS,
  ...PRODUCT_SERVICE_MODULE_DOCS,
  ...RESUME_MODULE_DOCS,
  ...USERS_ORG_MODULE_DOCS,

  'Product settings': {
    title: 'Logic chung — Product settings',
    lead:
      'Product settings là **danh mục bán**: mọi thứ Saramin bán được, giá của nó, và thứ khách thực sự nhận khi hoá đơn được phát hành. Với loại *Job posting*, một product **chính là một bậc tin**. Sáu màn hình trong nhóm này đều là **định nghĩa** — không màn hình nào cộng hay trừ số dư của một khách hàng.',
    headline: [
      '**Type của product quyết định hoá đơn giao cái gì** — lượt đăng tin, credit mở CV, một khung ngày trên vùng banner, hay lượt dịch vụ giao tay. Chọn sai Type là giao sai thứ, **âm thầm**, và chỉ lộ ra lúc phát hành hoá đơn.',
      '**Chỉ hoá đơn GTGT ở trạng thái Issued mới cấp quota.** Báo giá được chấp nhận, PO đã tạo, hoá đơn nháp — đều chưa cấp gì. Và trạng thái thanh toán (Unpaid / Paid) là chuyện riêng: hoá đơn Issued là cấp, kể cả khi khách chưa trả.',
      '**Product đã lên một hoá đơn thì bị khoá phần nó bán** — Type, giá, fulfilment, role và các cờ. Muốn bán khác đi thì **tạo product mới** và chuyển product cũ sang *Inactive*.',
    ],
    blocks: [
      {
        kind: 'diagram',
        id: 'product-chain',
        heading: 'Toàn cảnh — một sản phẩm đi từ catalogue tới tay khách',
        note: 'Đọc từ trên xuống: **khai báo → bán → cấp → tiêu → hiển thị**. Ô xanh lá là **khoảnh khắc duy nhất** có thứ đổi chủ; mọi thứ phía trên nó là định nghĩa, mọi thứ phía dưới là số dư đang được tiêu.',
      },
      {
        kind: 'table',
        heading: 'Sáu màn hình — mỗi màn trả lời một câu hỏi',
        cols: ['Màn hình', 'Trả lời câu hỏi', 'Khi nào phải mở'],
        rows: [
          ['**Products**', 'Bán **cái gì**, giá bao nhiêu, và khách nhận gì khi hoá đơn được phát hành', 'Ra sản phẩm mới, đổi giá, ngừng bán'],
          ['**Packages**', 'Bán **nhiều product chung một giá**, dưới một cái tên', 'Ra gói combo'],
          ['**Posting ladder**', 'Bậc tin nào **đứng trên** bậc nào trong danh sách *Gợi ý*', 'Thêm một bậc mới, hoặc đổi thứ tự bậc'],
          ['**Placements**', 'Các **vùng hiển thị** trên site: kích thước, bao nhiêu thẻ hay slide, xoay vòng bao lâu', 'Hiếm — vùng do team dựng sẵn; ở đây chỉ chỉnh, không tạo hay xoá'],
          ['**Image gallery**', 'Kho ảnh để chọn làm **ảnh thẻ tin**', 'Khi tin ở bậc có perk ảnh cần ảnh'],
          ['**Discount programmes**', 'Các mức **giảm giá có sẵn** mà báo giá áp dụng tự động', 'Đổi mức giảm hoặc thời hạn chương trình'],
        ],
      },
      {
        kind: 'table',
        heading: 'Bốn Type — bốn thứ khác nhau mà khách nhận',
        note: 'Đây là bốn thẻ đầu tiên trên form **New product**. Mỗi Type mở ra một khối *Fulfilment* riêng, và đi theo một cột riêng trong sơ đồ trên.',
        cols: ['Type', 'Hoá đơn cấp gì', 'Tiêu ở đâu', 'Ví dụ (gợi ý trên form)'],
        rows: [
          ['**Job posting**', 'N lượt đăng tin **ở đúng bậc này** — không phải N lượt bất kỳ', '*Recruitment → Jobs → New job* (HQ) hoặc trang công ty (nhà tuyển dụng). Publish trừ 1 lượt', 'Tin tuyển dụng Focus · Grand · Premium'],
          ['**CV search**', 'N credit mở CV; gói chạy 30 hoặc 90 ngày **kể từ lúc kích hoạt**', 'Tìm ứng viên trên trang công ty — mở một CV trừ 1 credit', 'Gói tìm kiếm ứng viên'],
          ['**Placement booking**', 'Một khung ngày trên **một vùng Display**', '*Content → Boosting → New ad*', 'Main banner · Công ty nổi bật · Popup'],
          ['**Manual service**', 'N lượt dịch vụ mà ops phải giao tay', '*Service delivery → Manual services* — ghi nhận từng lần giao', 'Fanpage post · Email marketing'],
        ],
      },
      {
        kind: 'table',
        heading: 'Ai khai cái gì — bốn chỗ hay tìm nhầm',
        note: 'Mỗi dòng là một câu hỏi tester hay đi tìm câu trả lời ở **sai màn hình**.',
        cols: ['Câu hỏi', 'Khai ở đâu', 'Điều đáng biết'],
        rows: [
          ['Tin ở bậc này hiện ở **vùng nào**?', '**Products** → *Placement slots*', 'Không phải trên *Placements* — vùng không tự chọn bậc. Product khai nó nuôi vùng nào.'],
          ['Thẻ tin được mang **perk** gì (tag, ảnh hover, ảnh banner, mô tả hover)?', '**Placements** — mỗi vùng mang sẵn perk của nó, cố định', 'Bậc bán một perk khi **một vùng nó phủ** có perk đó. Vùng có ảnh thì **mọi tin ở bậc đó phải có ảnh mới Publish được**.'],
          ['Bậc nào **đứng trên** bậc nào?', '**Posting ladder**, hoặc ô *Ladder position* trên form product', 'Chỉ đổi thứ tự *Gợi ý* — không đổi giá, quota hay perk của bậc nào.'],
          ['Tin có lên **khu Premium** của trang tìm kiếm không?', '**Packages** → cờ *Premium package*', 'Đi theo **product**, không theo người mua: tin mua lẻ ngoài package cũng lên.'],
        ],
      },
      {
        kind: 'table',
        heading: 'Ba đồng hồ — đừng lẫn',
        note: 'Đồng hồ ② là cái duy nhất có thể âm thầm làm khách **mất thứ đã mua**.',
        cols: ['#', 'Đồng hồ', 'Bắt đầu khi', 'Khai ở đâu', 'Hết thì sao'],
        rows: [
          ['①', 'Cấp quota', 'Hoá đơn **Issued** — nháp không cấp gì', '— tức thì, không có ô nào', 'Quota nằm trên tài khoản, xem ở *Service delivery → Quota usage*'],
          ['②', '**Phải dùng trong**', 'Ngày hoá đơn', 'Trên từng product: *Must be used within* — 6 · 12 · 24 · 36 tháng, mặc định 12. Riêng CV search là *Activation window* — để trống = 12 tháng (3 với trial)', 'Phần chưa dùng **hết hạn**. Không hoàn tiền, không tự gia hạn'],
          ['③', 'Thời gian dùng / hiển thị', 'Tin: lúc Publish. **Gói CV: lúc có người bấm kích hoạt** — không tự chạy. Banner: ngày bắt đầu booking', 'Tin: *Display duration*. Gói CV: *Validity* 30 / 90 ngày. Banner: *Duration (days)*', 'Riêng tin / gói / booking đó kết thúc. Lượt chưa dùng vẫn chạy đồng hồ ②'],
        ],
      },
      {
        kind: 'list',
        heading: 'Vì sao “phải dùng trong” nằm trên từng product',
        items: [
          'Mặc định **12 tháng** theo T&C của khách (điều 4) — form ghi đúng câu đó dưới ô.',
          '12 tháng cho một slot Top Job và 12 tháng cho một tin dùng thử **không phải cùng một cam kết thương mại**: đồ dùng thử mà để dành được cả năm thì không còn là dùng thử. Vì vậy CV search trial mặc định 3 tháng.',
          'Hạn được tính **lúc cấp** — ngày hoá đơn + số tháng — và ghi lên quota của khách. Product đã lên hoá đơn thì khoá phần fulfilment, nên không ai sửa được con số đó cho đơn đã bán.',
          '**Free product không có cửa sổ nào** — nó không bao giờ lên hoá đơn, nên không có ngày nào để đếm.',
        ],
      },
      {
        kind: 'example',
        heading: 'Ví dụ — gói CV search: nút kích hoạt không có đường lui',
        scenario:
          'Khách mua **1 gói CV search**, *Validity* **90 ngày**, *Activation window* để trống (= 12 tháng). Hoá đơn Issued ngày **01/03/2026**.',
        cols: ['Khi', 'Điều gì xảy ra', 'Ai thấy gì'],
        rows: [
          ['01/03 — hoá đơn Issued', 'Gói vào tài khoản nhưng **chưa chạy** — đồng hồ 90 ngày chưa bắt đầu', 'Quota usage có một dòng CV search'],
          ['10/03 — khách bấm kích hoạt', '90 ngày bắt đầu **từ hôm nay**, không phải từ ngày mua. **Không có nút huỷ kích hoạt**', 'Mỗi CV mở ra trừ 1 credit'],
          ['…hoặc HQ bấm **Activate for the customer**', 'Y như trên — nhưng ghi là **HQ bấm, dưới tên người bấm**, không phải khách tự bấm', 'Dùng khi khách nhờ, vì bấm sớm là tự đốt thời hạn của khách'],
          ['01/03/2027 — nếu chưa ai bấm', 'Quá cửa sổ kích hoạt: gói **hết hạn**, không hoàn tiền', 'Đây là trường hợp sales cần gọi trước'],
          ['Bất kỳ lúc nào — HQ bấm **Withdraw this package**', 'Khách **mất ngay** số credit chưa dùng; CV đã mở vẫn mở. Bắt buộc ghi lý do — khách sẽ được báo câu đó', 'Hoàn tiền (nếu có) ghi trên hoá đơn'],
        ],
      },
      {
        kind: 'table',
        heading: 'Trạng thái của product và package',
        cols: ['Đối tượng', 'Trạng thái', 'Nghĩa', 'Vào trạng thái này bằng cách'],
        rows: [
          ['Product', '**Active**', 'Bán được — chọn được trên báo giá', 'Mặc định khi tạo mới. Hệ thống **từ chối** Active khi fulfilment còn thiếu, và nói đúng ô nào'],
          ['Product', '**Draft**', 'Bản nháp — chưa bán được', '**Duplicate** luôn tạo một Draft, không bao giờ tạo ngay một dòng Active thứ hai'],
          ['Product', '**Inactive**', 'Ngừng bán — biến khỏi báo giá. Đơn và gói cũ **không bị ảnh hưởng**', 'Đổi *Status* trên form'],
          ['Package', '**Active / Inactive**', 'Báo giá được / không', 'Tạo mới là Active; đổi bằng **Activate** / **Deactivate** ở cuối dòng'],
        ],
      },
      {
        kind: 'list',
        heading: 'Thứ tự dựng khi ra một bậc tin mới',
        items: [
          '**Placements** — kiểm các vùng bậc mới cần đã có. Vùng không tạo mới được trên màn hình; thiếu vùng là việc của team dev.',
          '**Products → New product** → Type *Job posting* → khai *Placement slots*, *Display duration*, *Auto-refresh*, giá.',
          '**Ladder position** — bắt buộc, chọn ngay trên form; sau này kéo lại trên *Posting ladder* nếu cần.',
          '**Packages** — nếu bậc mới được bán trong một gói.',
          'Kiểm trên **CRM → Quotation**: bậc mới có trong picker. Bán thử tới hoá đơn Issued, đăng thử một tin, rồi xem nó lên đúng vùng trên site.',
        ],
      },

      /* ── The client's Notion page "Products & Packages", section by section ──
         Same numbering as the Notion page, so a tester holding both finds §2.7 in
         either. Every claim was re-checked against saramin-vn-admin origin/dev
         45954108 (08/10/2026); where Notion is behind the build, the build is
         written as the rule and the Notion wording is named in a `warn`. */
      {
        kind: 'p',
        text:
          'Phần dưới đi **theo đúng trang Notion *Products & Packages*** của khách, cùng số mục (§1 … §6), để người cầm cả hai tài liệu tìm được cùng một chỗ. Mọi điều đã được **đối chiếu với build** (`saramin-vn-admin`, 08/10/2026). Chỗ Notion **đi sau build**, trang này ghi theo build và có hộp *lưu ý* nói rõ Notion ghi gì.',
      },
      {
        kind: 'table',
        heading: 'Bốn trang Notion nói tới',
        cols: ['Trang', 'URL', 'Định nghĩa cái gì'],
        rows: [
          ['**Placements**', '`/system/placements`', 'Các vùng hiển thị trên site'],
          ['**Products**', '`/system/products`', 'Cái gì bán được, và mỗi product cấp gì'],
          ['**Posting ladder**', '`/system/product-ladder`', 'Thứ tự các tin trả phí trên Job search'],
          ['**Packages**', '`/system/packages`', 'Nhiều product bán chung một dòng, một giá'],
        ],
      },
      {
        kind: 'p',
        text:
          '**§0 · Các mảnh ghép khớp nhau thế nào** — đọc một lần: mỗi cài đặt bên dưới là **một bước trong chuỗi** ở sơ đồ đầu trang (*khai báo → bán → cấp → tiêu → hiển thị*).',
      },

      /* §1 Placements */
      { kind: 'h', text: '§1 · Placements', path: '/system/placements' },
      {
        kind: 'p',
        text:
          '**Là gì.** Registry các **vùng hiển thị** trên site: mỗi dòng một vùng — một băng ở trang chủ, một dải trong kết quả tìm kiếm, một vùng banner. Nó mô tả **hình dạng** của vùng: hiện bao nhiêu thẻ, creative phải lớn cỡ nào, bao lâu thì xoay.',
      },
      {
        kind: 'p',
        text:
          'Vùng do **team BB seed sẵn**. **Không có Create, không có Delete** — danh sách này *chính là* bố cục của site, thêm một vùng nghĩa là sửa site. Mọi dòng đều sửa được (biểu tượng bút chì).',
      },
      {
        kind: 'table',
        heading: 'Hai loại vùng',
        note: 'Cột **Format** chia registry làm đôi, và drawer sửa **chỉ hiện các ô áp dụng** cho loại đó.',
        cols: ['Format', 'Cái gì lấp vùng', 'Các ô có nghĩa'],
        rows: [
          ['**Job** (content pool)', 'Tin tuyển dụng — qua *Placement slots* của từng product', 'Items shown · Rotation period · Size'],
          ['**Display** (banner / popup)', 'Một creative được đăng dựa trên một booking đã trả tiền', 'Creative width × height · Number of slides · Rotation period (chỉ banner, popup không có)'],
        ],
      },
      {
        kind: 'p',
        text:
          '**Trang có vùng:** Home · Search · Job list · Job detail · Company page · Candidate profile và một số trang khác — kể cả các trang phía nhà tuyển dụng. Danh sách đầy đủ đang bật trên dev nằm ở trang **Placements** của guide này.',
      },
      {
        kind: 'table',
        heading: 'Các cài đặt đáng hiểu',
        cols: ['Cài đặt', 'Nghĩa', 'Kiểm bằng cách'],
        rows: [
          ['**Name**', 'Tên hiển thị tiếng Việt. Sửa được — **cột chữ tự do duy nhất**.', 'Đổi tên một vùng: thay đổi **chỉ trong admin**, không có gì trên site công khai bị đổi tiêu đề.'],
          ['**Key**', 'Khoá máy mà site công khai truy vấn theo (`HOMEPAGE_TOP`). **Cố định — không sửa được.**', '—'],
          ['**Items shown**', '**Chính xác** bao nhiêu thẻ vùng này vẽ ra.', 'Đặt N → vùng hiện đúng N, **không bao giờ nhiều hơn**.'],
          ['**Rotation period (s)**', 'Độ dài của **một chu kỳ**, không phải tốc độ animation. Trong một chu kỳ thứ tự **đứng yên**; sang chu kỳ mới danh sách **dịch đi một chỗ** (A, B, C → B, C, A). Để trống = không bao giờ xoay.', 'Tải lại **trong cùng chu kỳ** → cùng thứ tự. Chờ sang chu kỳ sau → mục đầu chuyển xuống cuối.'],
          ['**Creative size**', 'Chỉ vùng Display. Đặt **cả rộng và cao** để bật chốt chặn upload; để trống cả hai thì nhận mọi kích thước. **Chỉ đặt một trong hai là bị từ chối.**', 'Upload banner sai tỉ lệ → **bị từ chối, không tự cắt**.'],
          ['**Number of slides**', 'Chỉ vùng Display — bao nhiêu booking trả tiền được **chạy chồng nhau** ở vùng này. Để trống = **1**.', 'Đặt banner thứ hai vào vùng 1 slide cho khoảng ngày chồng lấn → **bị chặn**.'],
          ['**Reference image**', 'Ảnh preview **chỉ admin thấy** trên dòng. Không bao giờ hiện công khai.', '—'],
        ],
      },
      {
        kind: 'warn',
        text:
          '**Notion đi sau build ở ba chỗ của §1.** (1) Ô *Pool cap* **đã bỏ** (SRM-824) — vùng Job chỉ còn *Items shown* và vòng xoay. (2) *Concurrent bookings* giờ tên là **Number of slides**. (3) **Không còn ô Status** — mọi vùng đều đang bật, nên phép thử “đặt Inactive thì băng biến mất” **không còn làm được**. Notion cũng ghi chu kỳ mới “xáo lại”; build **dịch đi một chỗ**, không xáo ngẫu nhiên.',
      },

      /* §2 Products */
      { kind: 'h', text: '§2 · Products', path: '/system/products' },
      {
        kind: 'p',
        text:
          '**Là gì.** Catalogue: mọi món bán được, giá của nó, và **fulfilment** — thứ người mua thực sự nhận khi hoá đơn được phát hành. Màn hình này là **định nghĩa**; nó không bao giờ chạm vào số dư của khách.',
      },
      {
        kind: 'p',
        text:
          'Chỉ product **Active** mới báo giá được. **Inactive thay cho xoá**: product biến khỏi báo giá, nhưng mọi đơn cũ trỏ vào nó vẫn nguyên. (Build có thêm nút **Delete**, nhưng chỉ chạy với product **chưa từng lên hoá đơn và không nằm trong package nào**.)',
      },
      {
        kind: 'p',
        text:
          '**§2.1 · Type — ô có tầm với xa nhất.** Type quyết định hoá đơn giao cái gì, và ô fulfilment nào hiện ra bên dưới. Bốn Type ở bảng **“Bốn Type”** phía trên: *Job posting · CV search · Placement booking · Manual service* (Notion gọi loại thứ ba là *Boosting service*; form ghi **Placement booking**). **Sai Type là giao sai thứ** — đây là ô cần kiểm lại trước khi bấm Save.',
      },
      {
        kind: 'table',
        heading: '§2.2 · Identity',
        cols: ['Ô', 'Nghĩa'],
        rows: [
          ['**Name**', '**Một ô duy nhất** — nhãn catalogue mà người vận hành quét trong danh sách, dòng báo giá và đơn hàng. In lên báo giá, PO và hoá đơn. Ký tự đặc biệt không có chữ (`!@#$`) bị từ chối.'],
          ['**Product code**', 'Mã SKU. **Tự sinh từ Type + Name** lúc tạo (tiền tố `JOB` · `SRC` · `PLB` · `MSV`, rồi tên bỏ dấu viết hoa) và **không bao giờ sửa được** — vì nó in lên báo giá, PO và hoá đơn.'],
          ['**Selling unit**', 'Đơn vị in ở cột *Đơn vị tính* của báo giá (*tin, lượt, gói*). **Chỉ để hiển thị** — không gì tính toán từ nó.'],
          ['**Product description**', 'Lời giới thiệu in dưới dòng đó trên báo giá.'],
        ],
      },
      {
        kind: 'warn',
        text:
          '**Notion đi sau build ở hai ô của §2.2.** (1) Notion yêu cầu tên **tiếng Việt và tiếng Anh**; build đã gộp về **một ô Name**. (2) Notion ghi Product ID “sửa được tới lần bán đầu tiên, rồi khoá”. Build: mã **tự sinh và không bao giờ sửa được**, kể cả trước lần bán đầu. Thứ bị khoá sau lần bán đầu là **phần bán** của product — Type, giá, fulfilment, role và các cờ (xem *Đọc trước* ở đầu trang).',
      },
      {
        kind: 'table',
        heading: '§2.3 · Role — Main / Add-on',
        cols: ['Role', 'Nghĩa'],
        rows: [
          ['**Main**', 'Bán độc lập — báo giá được, đặt hàng được, **không bao giờ nằm trong product khác**. Mọi bậc tin đều là Main.'],
          ['**Add-on**', 'Gắn lên trên một tin chính. **Vẫn bán như mọi product**: picker báo giá xếp add-on vào **nhóm riêng**, **giá riêng**, **dòng riêng** trên PO. Trên màn hình đăng tin nó **bị khoá** cho tới khi đã chọn **hoá đơn** và một *Main product*.'],
        ],
      },
      {
        kind: 'table',
        heading: 'Add-on type (chỉ với Role = Add-on)',
        cols: ['Add-on type', 'Làm gì', 'Trạng thái'],
        rows: [
          ['**Label**', 'Một badge trên tin — trong kết quả tìm kiếm và trên trang chủ: *Hot job* hoặc *Super star*', 'Dùng được'],
          ['**Display placement**', 'Đưa tin vào một vị trí cao cấp', '**Chưa dùng được** — form ghi *“Not available yet.”*'],
        ],
      },
      {
        kind: 'table',
        heading: '§2.4 · Trial product',
        note: 'Một checkbox quyết định **báo giá nào được chứa** product này.',
        cols: ['', 'Xuất hiện ở'],
        rows: [
          ['**Tắt** (mặc định)', '**Mọi** báo giá, **trừ** báo giá có *Discount programme* = *Trial package*'],
          ['**Bật**', '**Chỉ** báo giá có *Discount programme* = *Trial package* (Gói dùng thử)'],
        ],
      },
      {
        kind: 'list',
        items: [
          '**Hai tập không bao giờ trộn**: báo giá trial chỉ chào product trial — không chào product thường, và **không chào package** (package không có cờ trial).',
          '**Đổi một báo giá vào hoặc ra khỏi *Trial package* sẽ xoá product trên mọi dòng.**',
          'Chặn **ở phía server**, không chỉ trong picker.',
          'Đây là **một trục hiển thị, không phải giảm giá**: product trial có giá riêng (thấp) và vẫn đi lên PO. Cửa sổ kích hoạt của nó là **3 tháng** thay vì 12.',
        ],
      },
      {
        kind: 'list',
        heading: '§2.5 · Free product — một công tắc trong Pricing. Khi bật:',
        items: [
          'Giá về **0** và **không sửa được**.',
          'HQ đăng hộ được cho **bất kỳ công ty nào**, **không cần hoá đơn, không tiêu quota**.',
          'Đây là thứ lấp lựa chọn *— none (Free job) —* trên màn hình đăng tin (*Main product* khi **chưa chọn hoá đơn**).',
          'Nhà tuyển dụng **không bao giờ thấy** nó trên site công ty — họ chỉ đăng được từ thứ đã mua.',
          'Đây là **một cờ được lưu, không suy ra từ giá 0**: một dòng khuyến mãi có thể 0 ₫ mà vẫn phải đi ra từ một hoá đơn.',
        ],
      },
      {
        kind: 'p',
        text:
          '**§2.6 · Status** — xem bảng **“Trạng thái của product và package”** phía trên. Notion chỉ có hai trạng thái (*Active / Inactive*, và Inactive vừa là “đang viết dở” vừa là “ngừng bán”). Build có thêm **Draft** cho “đang viết dở” — **Duplicate** luôn tạo một Draft. **Active bị từ chối khi fulfilment còn thiếu**, và thông báo nói đúng ô nào.',
      },
      {
        kind: 'table',
        heading: '§2.7 · Fulfilment — Job posting',
        note: 'Khối biến một product loại Job posting **thành** bậc tin của nó.',
        cols: ['Ô', 'Nghĩa'],
        rows: [
          ['**Must be used within**', 'Tính **từ ngày hoá đơn**; chọn 6 · 12 · 24 · 36 tháng, **mặc định 12**. Quota cấp ngay lúc hoá đơn Issued; phần chưa dùng khi cửa sổ đóng thì **hết hạn**.'],
          ['**Display duration (days)**', 'Một tin đã đăng sống bao lâu. Đây là con số màn hình đăng tin hiện cạnh bậc (*Top job · 30 days*). Để trống = không phải bậc tin, **không lên Posting ladder**.'],
          ['**Auto-refresh**', 'Bao lâu một lần tin đã đăng được **đẩy lại lên đầu** các danh sách nó xuất hiện. *No auto-refresh* = không bao giờ.'],
          ['**Placement slots**', 'Tin ở bậc này xuất hiện **ở vùng nào**, và trong bao lâu của cửa sổ hiển thị — *Whole display window* hay *First 5 / 7 / 10 / 15 / 30 days*. Vùng lấy từ registry *Placements*. **Đây chính là định nghĩa của bậc.**'],
          ['**Includes**', 'Các product **được cấp kèm**. Khách thấy **một dòng** — đây **không phải** package. Mỗi product kèm vẫn được cấp riêng. Chỉ chọn được product *Add-on*.'],
          ['**Ladder position**', '**Bắt buộc.** Bậc này đứng đâu so với các bậc khác — bấm *Choose position* rồi kéo. Cùng một thứ tự với màn hình *Posting ladder* (§3).'],
        ],
      },
      {
        kind: 'warn',
        text:
          '**Notion đi sau build ở hai ô của §2.7.** (1) **Card perks không còn tick trên product**: perk (tag, ảnh hover, ảnh banner, mô tả hover) **đi theo vùng** trên *Placements*. Bậc bán một perk khi một vùng trong *Placement slots* của nó có perk đó — và phủ một vùng có ảnh thì **mọi tin ở bậc đó phải có ảnh mới Publish được**. (2) **Ladder rank đã bỏ** cùng với tính năng *Upgrade tier*; *Display order* “chỉ đọc” giờ là ô **Ladder position** bắt buộc ngay trên form.',
      },
      {
        kind: 'table',
        heading: '§2.8 · Fulfilment — ba Type còn lại',
        cols: ['Type', 'Các ô', 'Điều đáng biết'],
        rows: [
          ['**CV search**', 'Credit amount · Validity (30 / 90 days) · Activation window', '*Credit amount* = một lần mua mở được bao nhiêu CV. *Validity* chạy **từ lúc khách bấm Kích hoạt**. *Activation window* = hạn chót để kích hoạt; **để trống = 12 tháng (3 với trial)** theo T&C điều 4. Giá mỗi CV hiện bên dưới là **tính ra**, không gõ.'],
          ['**Placement booking**', 'Must be used within · Placement · Duration (days) · Slots consumed', 'Chỉ chào các vùng **Display**. *Slots consumed* = một lần bán chiếm bao nhiêu slot của vùng; để trống = 1.'],
          ['**Manual service**', 'Must be used within · Quantity · Unit', 'Không cấp quyền lợi tự động — ops giao tay, và ghi nhận từng lượt ở *Service delivery → Manual services*. *Unit* là cách đếm một lần giao (*bài, email, lần*).'],
        ],
      },
      {
        kind: 'warn',
        text:
          'Notion ghi CV search “không có ô *Must be used within*, cửa sổ kích hoạt cố định 12 tháng”. Build có ô **Activation window** — để trống thì vẫn là 12 tháng (3 với trial), nhưng **đặt khác được** trên từng product.',
      },

      /* §3 Posting ladder */
      { kind: 'h', text: '§3 · Posting ladder', path: '/system/product-ladder' },
      {
        kind: 'p',
        text:
          '**Là gì.** Một danh sách các bậc tin trả phí, **bậc trên cùng đứng đầu**. Kéo một bậc (hoặc focus vào tay cầm rồi bấm **↑ / ↓**) để di chuyển. Thứ tự đã lưu **chính là sắp xếp “Gợi ý” (Recommended)** trên Job search: khi tin ở các bậc khác nhau rơi vào cùng một danh sách, tin có bậc **cao hơn trên thang** hiện trước.',
      },
      {
        kind: 'p',
        text:
          'Thứ tự áp dụng cho **Job search, Jobs by location, Jobs by category, Jobs by industry** — mọi danh sách trộn nhiều product trong một vùng.',
      },
      {
        kind: 'list',
        heading: 'Product nào có mặt trên thang',
        items: [
          'Một product là **một bậc** khi nó **loại Job posting**, **Active**, và **có Display duration**. Mọi thứ khác không phải bậc tin và không lên thang.',
          'Danh sách **ngắn có chủ đích** — không bộ lọc, không phân trang.',
        ],
      },
      {
        kind: 'warn',
        text:
          '**Respace the ladder** đánh số lại mọi bậc thành 10, 20, 30… — **cùng thứ tự, khoảng cách mới** — để chèn được một bậc mới vào giữa hai bậc bất kỳ. Nếu hai bậc trùng *Display order*, màn hình **nói rõ và từ chối lưu** cho tới khi bạn respace.',
      },
      {
        kind: 'table',
        heading: 'Kiểm bằng cách',
        cols: ['Làm', 'Đạt khi'],
        rows: [
          ['Kéo bậc B lên trên bậc A → Save', 'Trên Job search, sắp xếp *Gợi ý*: tin của **B nằm trên** tin của A. Giá và perk của product **không đổi**'],
          ['Mở hai tab, sắp lại ở cả hai, lưu cả hai', 'Lần lưu **thứ hai bị từ chối** (*“The ladder changed while you were editing it”*) và màn hình tải lại'],
          ['Chuyển một bậc sang Inactive → rồi Active lại', 'Nó **rời thang**, rồi **quay về đúng Display order cũ**'],
          ['Product Job posting **không có** Display duration', '**Không bao giờ** xuất hiện trên thang'],
        ],
      },

      /* §4 Packages */
      { kind: 'h', text: '§4 · Packages', path: '/system/packages' },
      {
        kind: 'p',
        text:
          '**Là gì.** Nhiều product bán chung **một dòng, một giá**. Package được định giá **như một khối**, không phải bằng tổng những gì nó cấp. Trên báo giá nó là **một dòng**; tới lúc hoá đơn Issued **từng thành phần được cấp riêng**, nên quota của công ty đọc ra là các product lẻ.',
      },
      {
        kind: 'p',
        text:
          'Dùng package khi khách **nên thấy các phần được gộp giá dưới một cái tên**. Khi một product chỉ đơn giản là **đi kèm** vài thứ trong cùng một dòng, dùng **Includes** trên product đó thay vì package.',
      },
      {
        kind: 'table',
        heading: 'Cài đặt',
        cols: ['Ô', 'Nghĩa'],
        rows: [
          ['**Name**', 'Nội bộ — cách console liệt kê nó.'],
          ['**Display name**', 'Khách thấy trên báo giá và site công khai. Để trống = lấy Name.'],
          ['**Components**', '**Ít nhất hai** product, mỗi dòng một số lượng.'],
          ['**Package price (VND)**', 'Điền sẵn bằng tổng các thành phần; sửa về giá bán thật. *Sum of parts* và *Implied discount / markup* cập nhật bên dưới. Có **cảnh báo** nếu giá vượt tổng các phần.'],
          ['**Status**', '*Active / Inactive*. **Kích hoạt thất bại nếu có product thành phần đang Inactive** — thông báo nêu tên nó.'],
        ],
      },
      {
        kind: 'list',
        heading: '§4.1 · Premium package',
        items: [
          'Khi tick, các tin đăng bằng **các product của package này** xuất hiện ở **khu Premium** (khu màu xanh) của trang tìm kiếm công khai.',
          '**Phản trực giác 1 — nó đi theo PRODUCT, không theo người mua.** Nếu package chứa một bậc tin bán rộng rãi, thì **mọi** tin ở bậc đó đều được đẩy lên — kể cả tin **mua lẻ, ngoài package**.',
          '**Phản trực giác 2 — nó không do placement điều khiển.** Tin vào khu Premium là **vì cái tick này**, không vì cài đặt *Placement slots* nào. Tester đi tìm khu Premium trên trang *Placements* sẽ không thấy.',
          'Đây là cách các **gói Unlimited** của hệ thống hiện tại được thể hiện.',
        ],
      },
      {
        kind: 'list',
        heading: '§4.2 · No limit — số lượng không giới hạn',
        items: [
          'Một công tắc **No limit** trên dòng thành phần, **thay cho** số lượng.',
          'Chỉ bật được với product **có thời hạn hiệu lực** — **không giới hạn về số lượng, có giới hạn về thời gian**.',
          '*Sum of parts* **bỏ dòng unlimited ra ngoài** — không có giá nào cho “không giới hạn”. Package bán theo giá bạn đặt; cảnh báo “giá vượt tổng các phần” được thay bằng **một ghi chú nói rõ điều đó**.',
          'Tổng dòng ghi **—**, không phải 0 ₫; cột danh sách ghi **Unlimited**.',
        ],
      },
      {
        kind: 'warn',
        text:
          '**Notion ghi No limit “chỉ cho product Job posting”.** Build cho **cả bốn Type** miễn là product có thời hạn (*“Every service type supports it.”*). Riêng **CV search** còn tuỳ một cấu hình phía server: công tắc bật được, nhưng nếu server không cho thì **lưu sẽ báo lỗi**. Vì vậy phép thử Notion “bật No limit trên dòng CV search → bị từ chối” **không còn là kết quả mong đợi**.',
      },
      {
        kind: 'table',
        heading: 'Kiểm bằng cách',
        cols: ['Làm', 'Đạt khi'],
        rows: [
          ['Dựng package 3 product → bán → hoá đơn Issued', 'Báo giá hiện **1 dòng**; quota của công ty hiện **3 product**'],
          ['Tick *Premium package* trên package chứa bậc X', 'Một tin bậc X **mua ngoài package** cũng xuất hiện ở khu Premium'],
          ['Bật *No limit* trên một product **không có thời hạn**', '**Bị từ chối**: *“A product needs a validity period to be sold unlimited.”*'],
          ['Chuyển một product thành phần sang Inactive → kích hoạt package', '**Thất bại**, nêu đúng tên product đó'],
        ],
      },

      /* §5 Related */
      { kind: 'h', text: '§5 · Những thứ liên quan khách nên biết' },
      {
        kind: 'table',
        note: 'Không nằm trên bốn trang này, nhưng **quyết định** những gì khai ở đây có chạy hay không.',
        cols: ['Ở đâu', 'Vì sao liên quan'],
        rows: [
          ['**Discount programmes** (`/system/discount-programmes`)', 'Chương trình **Trial package** nằm ở đây. Product trial **chỉ hiện** khi báo giá chọn chương trình này.'],
          ['**CRM → Invoice**', '**Phát hành hoá đơn GTGT là lúc quota được cấp.** Không gì trên bốn trang này tự cấp cái gì.'],
          ['**CRM → Customers → Products & billing**', 'Nơi kiểm một product đã về tới công ty: mỗi product kèm số lượt và hạn dùng.'],
          ['**Recruitment → Jobs → New job**', 'Nơi product bị **tiêu**: chọn công ty → chọn **hoá đơn** → danh sách *Main product* chỉ còn các dòng trả phí của hoá đơn đó. Product **Free** chỉ hiện khi **chưa chọn hoá đơn**.'],
          ['**Service delivery → Quota usage**', 'Gói CV đã mua mà chưa dùng, và **nơi duy nhất thu hồi một gói** (*Withdraw this package*).'],
          ['**Site jobseeker**', 'Bước kiểm cuối: một tin đã đăng xuất hiện **đúng** các vùng mà *Placement slots* của bậc nó liệt kê, và tắt *Exposure* là nó **biến khỏi mọi vùng**.'],
        ],
      },
      {
        kind: 'warn',
        text:
          'Notion ghi màn đăng tin “chọn **PO**” — build giờ chọn **hoá đơn** (*Invoice*). Notion còn trỏ tới *Products & Packages → CV search usage*; trang đó đã được thay bằng **Service delivery → Quota usage** (đường dẫn cũ tự chuyển sang).',
      },

      /* §6 E2E */
      { kind: 'h', text: '§6 · Kịch bản test gợi ý (end-to-end)' },
      {
        kind: 'example',
        heading: 'Mỗi kịch bản cắt qua nhiều màn hình — chỗ bug hay nấp',
        scenario: 'Danh sách ngắn để làm nền cho test plan. Làm trên dev, với product và công ty tạo riêng để test.',
        cols: ['Kịch bản', 'Đạt khi'],
        rows: [
          ['Tạo product Job posting cho một **bậc mới**, *Placement slots* = *Home — Việc làm nổi bật* (*Whole display window*), bán nó, phát hành hoá đơn, đăng một tin', 'Tin xuất hiện ở băng đó và **không ở đâu khác**; số lượt của công ty **giảm 1**'],
          ['Kéo bậc mới lên **đầu** *Posting ladder*', 'Tin của nó dẫn đầu sắp xếp *Gợi ý* trên Search; giá product **không đổi**'],
          ['Tick *Free product* trên bậc Basic; đăng một tin **không chọn hoá đơn**', '*— none (Free job) —* chào nó; đăng được mà **không trừ quota**; nhà tuyển dụng trên site công ty **không bao giờ thấy** nó'],
          ['Tick *Trial product*; mở một báo giá thường, rồi một báo giá có *Discount programme = Trial package*', '**Ẩn** ở báo giá đầu; là thứ **duy nhất** được chào ở báo giá sau'],
          ['Dựng *Premium package* chứa bậc X; bán **lẻ** bậc X cho một công ty khác', 'Tin bậc X của công ty đó **cũng** lên khu Premium'],
          ['Vùng Job có 30 tin đủ điều kiện, *Items shown* = 8, *Rotation period* = 60 s', 'Đúng **8 thẻ**; tải lại trong cùng phút → **cùng thứ tự**; sang phút sau → **mục đầu chuyển xuống cuối**'],
        ],
        note: 'Notion còn một kịch bản “đổi *Ladder rank* rồi thử *Upgrade tier*” — **đã bỏ**: build không còn Ladder rank lẫn Upgrade tier.',
      },
    ],
  },

  'Job management': {
    title: 'Logic chung — Job management',
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
          ['Closed', 'Đã hết hạn hoặc đóng tay, giữ lại để báo cáo', '**Reopen** → về Draft; đăng lại tốn một slot mới. Không có đường thẳng về Open'],
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
          'Sửa một tin **Open là tự do**, trừ **bậc (Main product)** — bậc cố định từ lúc đăng, *Upgrade tier* đã bỏ. Requirement còn khoá **tiêu đề sau 72 giờ** với tin công ty tự đăng; **chưa xác nhận đã build** (xem *Jobs* → điểm cần chốt).',
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
          '**Phúc lợi (Benefits) là một ô chữ tự do**, như Description — từ 28/09 không còn danh sách chọn điền sẵn từ bộ phúc lợi của công ty (SRM-742). Tin mới **không** tự chép phúc lợi của công ty; phúc lợi cũ đã được gộp thành chữ, không mất gì. Vì là chữ tự do, phúc lợi **không còn là bộ lọc** trên site ứng viên.',
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
          'Đây là nguồn nhầm lẫn lớn nhất ở khâu tuyển dụng. Ba trục **độc lập**, do **ba bên khác nhau** sở hữu, và chặn **ba thứ khác nhau**. Một CV có thể Đạt, Bình thường, mà vẫn không ai tìm thấy — vì ứng viên để Ẩn.',
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

  /* Carries the client's Notion "Resume management" page — a parent with four
     children (Create CV · CV review · Talent pool · Candidate management), one per
     page of this group. Written as BUILT, checked against origin/dev on 2026-10-08:
     svn-be 664b8a6ec · svn-web d8a43a11 · saramin-vn-admin 45954108. */




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



}

/* ── Page-level guidance ────────────────────────────────────────────────────── */

export const PAGE_DOCS: Record<string, PageDoc> = {
  /* Pages rewritten 08/10/2026 against origin/dev live in src/pagedocs/, one file per module — edit them there. */
  ...CONTENT_PAGE_DOCS,
  ...CRM_OPS_PAGE_DOCS,
  ...CRM_SALES_PAGE_DOCS,
  ...JOBS_APPS_PAGE_DOCS,
  ...NOTIF_SYSTEM_PAGE_DOCS,
  ...PRODUCT_SERVICE_PAGE_DOCS,
  ...RESUME_PAGE_DOCS,
  ...USERS_ORG_PAGE_DOCS,

  /* ── Call center ─────────────────────────────────────────────────────────── */
  'call-ranking': {
    logic: ['Xếp hạng nhân viên theo hoạt động gọi trong kỳ.'],
    how: ['Chọn kỳ → đọc bảng xếp hạng.'],
  },

  /* ── Content ─────────────────────────────────────────────────────────────── */
  /* The client's Notion "Premium pages" page (user's own workspace,
     …3e9b88bd999780ffb9bfe0deb291bd14, written 28/09 against admin 6c238663 ·
     svn-web c86b94d1 · svn-be a855faee3), carried in full in Notion's own
     Part / section numbering. Re-checked 08/10/2026 against admin 45954108 ·
     svn-web d8a43a11: the one change since is the Partners strip (SRM-790,
     29/09), written in as built and flagged where Notion is silent. The
     admin-screen view of the same feature stays on `zones` and `collections`;
     this page is the jobseeker-side reading of it, start to finish. */
  'premium-pages': {
    logic: [
      'Một **Premium page** là **trang tuyển dụng có thương hiệu** cho một nhà tuyển dụng hoặc một chủ đề — banner, vài khối nội dung, một thanh tìm kiếm và **hai danh sách tin**. Trong admin nó tên là **Zone** (KR: 채용관).',
      'Template **cố định**: topbar + 7 khối, luôn đúng thứ tự. Admin chỉ **đổ nội dung** vào khối — không sửa code cho mỗi chiến dịch.',
      '**Zone không chứa tin.** Hai danh sách của nó trỏ vào **Collection** — trang hiện sai tin thì sửa collection, không sửa zone.',
    ],
    blocks: [
      {
        kind: 'p',
        text:
          '**Trang này nói gì.** Một Premium page được dựng thế nào trong admin và từng phần hiện ra sao trên site jobseeker. Ví dụ đang sống: **MB Bank** và **Korean companies (NIPA)**. **Phần 1** giải thích cách nó hoạt động; **Phần 2** là từng bước, kèm ảnh màn hình thật; **Phần 3** đi sâu vào trang Collections.',
      },
      {
        kind: 'warn',
        text:
          '**Nguồn và độ mới.** Mang từ trang Notion *Premium pages* (viết 28/09, theo admin `6c238663` · svn-web `c86b94d1` · svn-be `a855faee3`). Kiểm lại ngày **08/10/2026** với admin `45954108` · svn-web `d8a43a11`; ảnh chụp mới cùng ngày trên `dev.admin-svn.topdev.asia` và `dev.svn.topdev.asia`. **Thay đổi duy nhất từ sau Notion: khối Partners** (dải logo dưới banner, 29/09) — Notion chưa có, trang này đã ghi theo build.',
      },

      /* ── Part 1 ── */
      { kind: 'h', text: 'Phần 1 · Premium page hoạt động thế nào' },

      { kind: 'h', text: '§1 · Nó là gì' },
      {
        kind: 'p',
        text:
          'Một Premium page là **trang tuyển dụng có thương hiệu** cho một nhà tuyển dụng hoặc một chủ đề — một banner, vài đoạn nội dung, một thanh tìm kiếm và hai danh sách tin. Nó có **địa chỉ riêng** trên site jobseeker, và admin dựng nó **bằng nội dung**: không sửa code cho mỗi chiến dịch.',
      },
      {
        kind: 'table',
        cols: ['Ở đâu', 'Tên gọi', 'Địa chỉ'],
        rows: [
          ['**Admin**', '**Content → Zones**', '`dev.admin-svn.topdev.asia/content/zones`'],
          ['**Site jobseeker**', 'trang zone', 'VN `/khu-tuyen-dung/<address>` · EN `/zones/<address>` · KO `/채용관/<address>`'],
          ['Ví dụ', '**MB Bank**', '`dev.svn.topdev.asia/khu-tuyen-dung/mb-bank`'],
          ['Ví dụ', '**Korean companies (NIPA)**', '`dev.svn.topdev.asia/khu-tuyen-dung/nipa`'],
        ],
      },

      { kind: 'h', text: '§2 · Template cố định — topbar + 7 khối, luôn đúng thứ tự này' },
      {
        kind: 'p',
        text:
          '**Không có layout tuỳ biến.** Bạn đổ nội dung vào khối; khối tuỳ chọn để trống thì **đơn giản là không được vẽ** — không có ô rỗng, không có tiêu đề rỗng.',
      },
      {
        kind: 'table',
        cols: ['#', 'Khối', 'Bắt buộc?', 'Khách thăm thấy gì', 'Đặt ở đâu trong admin'],
        rows: [
          ['0', '**Topbar**', 'Tuỳ chọn', 'Logo đối tác × saramin, cộng các link trong trang (*Giới thiệu · Việc làm nổi bật · Tất cả việc làm · Thông tin thêm*)', 'Topbar → Partner logo'],
          ['1', '**Banner**', '**Bắt buộc để xuất bản**', 'Slider tràn màn hình, **5 giây mỗi slide**, mỗi slide một ảnh desktop và một ảnh mobile (tối đa 10 slide)', 'Banner → Slides'],
          ['1b', '**Partners** *(mới, 29/09)*', 'Tuỳ chọn', 'Một hàng logo các nhà tuyển dụng ngay dưới banner — **chỉ là hình**, không chữ, không bấm được', 'Partners → Partner logos'],
          ['2', '**Top block**', 'Tuỳ chọn', 'Đoạn giới thiệu hoặc một ảnh, giữa banner và thanh tìm kiếm', 'Top block'],
          ['3', '**Search bar**', '**Ít nhất 1 bộ lọc**', 'Tỉnh/TP · Ngành nghề · Cấp bậc · Từ khoá — chỉ **thu hẹp** danh sách tin bên dưới', 'Search bar'],
          ['4', '**Featured jobs**', 'Tuỳ chọn', 'Một hàng thẻ tin', 'The two lists → Featured jobs'],
          ['5', '**Job list**', '**Bắt buộc**', 'Danh sách tin đầy đủ, có phân trang và ô sắp xếp', 'The two lists → Job list'],
          ['6', '**Bottom block**', 'Tuỳ chọn', 'Chữ hoặc một ảnh dưới danh sách tin', 'Bottom block'],
          ['7', '**Company link**', 'Tuỳ chọn', 'Một link sang website của nhà tuyển dụng, kèm ảnh tuỳ chọn', 'Company link'],
        ],
      },
      {
        kind: 'list',
        items: [
          'Các **link trong trang ở topbar chỉ hiện cho những khối thực sự được vẽ** — không có link trỏ vào khối rỗng. (NIPA không có Top block, nên topbar của nó không có *Giới thiệu*.)',
          'Trang hiện theo **ngôn ngữ của người xem**: tiêu đề, khối và chữ link đều có ô VI / EN / KO; **tiếng Việt là bắt buộc**.',
        ],
      },
      {
        kind: 'warn',
        text:
          '**Khối Partners chưa có trong Notion.** Thêm ngày 29/09 (SRM-790): tối đa **30 logo**, mỗi logo **cắt theo khung 160 × 48** lúc upload, sắp lại bằng cách **kéo tay cầm**. Trên site là một hàng **6 ô cố định**, quá 6 logo thì cả hàng **đổi lượt theo nhịp**; ≤ 6 logo thì đứng yên. Logo **không có tên, không có link**. Panel *Page order* bên phải editor **chưa liệt kê** khối này — vẫn chỉ 8 phần.',
      },

      { kind: 'h', text: '§3 · Tin đến từ Collection — zone chỉ trỏ vào đó' },
      {
        kind: 'p',
        text:
          'Zone **không lưu tin**. Hai danh sách của nó trỏ vào **Collection** (*Content → Collections*) — những danh sách đã lưu, tự tồn tại riêng với địa chỉ `/bo-suu-tap/<address>`.',
      },
      {
        kind: 'table',
        cols: ['Loại collection', 'Chứa gì', 'Dùng cho'],
        rows: [
          ['**Saved search**', 'Một bộ lọc (công ty, ngành nghề, cấp bậc, tỉnh/TP, từ khoá…), **chạy lại mỗi lượt truy cập** — tin mới tự vào', '**Job list** (bắt buộc)'],
          ['**Hand-picked**', '**Đúng** những tin bạn ghim, theo thứ tự bạn xếp — không gì được thêm tự động', '**Featured jobs** (tuỳ chọn)'],
        ],
      },
      {
        kind: 'list',
        items: [
          '**Dựng collection trước, rồi mới dựng zone.** Picker của zone chỉ chào collection tin **đúng loại**, xuất bản **từ chối** collection không Active, và **hai danh sách phải là hai collection khác nhau**.',
          'Khách thăm **không bao giờ** thấy được tin nằm ngoài collection: thanh tìm kiếm trên trang **chỉ thu hẹp** nó.',
          'Tin được ghim nhưng **đã đóng hoặc bị ẩn** hiện cờ **Not visible** trong collection và **bị bỏ qua** trên site. Nếu **mọi** tin ghim đều bị ẩn thì khối Featured **tự ẩn**.',
        ],
      },
      {
        kind: 'table',
        heading: 'Từ collection tới trang — đường đi của một tin',
        cols: ['Bước', 'Ở đâu', 'Chuyện gì xảy ra'],
        rows: [
          ['1', '**Collection Saved search** (vd. `/mb-jobs`)', 'Bộ lọc chọn ra mọi tin khớp, mỗi lượt truy cập'],
          ['2', '**Collection Hand-picked** (vd. `/mb-featured`)', 'Đúng những tin đã ghim; tin đóng/ẩn bị bỏ qua'],
          ['3', '**Zone → The two lists**', 'Job list trỏ vào (1), Featured jobs trỏ vào (2)'],
          ['4', '**Trang công khai**', 'Featured jobs vẽ (2) thành hàng thẻ, *Tất cả việc làm* vẽ (1) có phân trang; thanh tìm kiếm thu hẹp (1)'],
        ],
      },

      { kind: 'h', text: '§4 · Trạng thái và việc mỗi trạng thái cho phép' },
      {
        kind: 'table',
        cols: ['Trạng thái', 'Trên site jobseeker', 'Nút trong panel Actions'],
        rows: [
          ['**Draft**', 'Không hiện (địa chỉ trả “không tìm thấy”)', 'Publish · Delete'],
          ['**Published**', '**Sống** tại địa chỉ của nó', 'Unpublish · Archive'],
          ['**Archived**', 'Không hiện; **địa chỉ vẫn được giữ chỗ**', 'Restore to draft'],
        ],
      },
      {
        kind: 'list',
        items: [
          '**Save không bao giờ xuất bản.** Publish là nút riêng. Trên zone đã Published, **Save cập nhật thẳng trang đang sống** — không có bản nháp song song — và khách thấy trong khoảng **một phút**.',
          'Publish cần **ít nhất một banner slide**, và cả hai danh sách phải vẫn là collection **Active, đúng loại**.',
          '**Address không bao giờ đổi** sau khi tạo. Địa chỉ mới nghĩa là zone mới.',
          '**Archived không quay thẳng lại sống** — *Restore to draft* trước, kiểm, rồi mới Publish.',
          '**Chỉ Draft mới xoá được**; xoá thì địa chỉ được giải phóng.',
          '**Preview** (góc trên phải) mở **trang công khai thật**, nên chỉ chạy trên zone đã Published — **chưa có preview cho bản nháp**.',
        ],
      },

      /* ── Part 2 ── */
      { kind: 'h', text: 'Phần 2 · Từng bước' },
      {
        kind: 'p',
        text:
          '**Ai làm được.** Zone cần quyền `zone` (read · create · update), mặc định cấp cho vai trò **HQ admin**. Collection cần quyền `job_collection`. Cả hai cấp được cho vai trò khác ở *Organisation → Roles & permissions*.',
      },

      { kind: 'h', text: 'A · Chuẩn bị hai collection', path: '/content/collections' },
      {
        kind: 'shot',
        src: '/shots/pp-collections-list.jpg',
        where: 'Admin',
        caption: '**Content → Collections.** Mỗi collection có địa chỉ `/bo-suu-tap/<address>`, một loại (*Saved search* = “Filters”, *Hand-picked* = “Pinned”) và một trạng thái.',
      },
      {
        kind: 'list',
        heading: 'Job list — một collection Saved search',
        items: [
          'Bấm **New collection**.',
          '**Lists: Jobs** · **Membership: Saved search**. Cả hai **cố định sau khi tạo**.',
          '**Address** (vd. `mb-jobs`) và **Name** ở VI / EN / KO — **cả ba tên đều bắt buộc**.',
          '**Filters** — vd. *Employer → Companies* = nhà tuyển dụng, hoặc *Posting → Job role / Province / Keyword*. Mọi thứ khớp đều nằm trong danh sách, **kiểm lại mỗi lượt truy cập**.',
          'Xem số **Preview** bên phải (nó liệt kê vài kết quả đầu), rồi **Save**, rồi **Publish** ở panel Actions.',
        ],
      },
      {
        kind: 'shot',
        src: '/shots/pp-collection-employer.jpg',
        where: 'Admin',
        caption: 'Collection Saved search `mb-jobs` — bộ lọc bên trái (*Employer → Companies*), **số khớp sống** bên phải.',
      },
      {
        kind: 'list',
        heading: 'Featured jobs — một collection Hand-picked',
        items: [
          '**New collection** → **Lists: Jobs** · **Membership: Hand-picked**.',
          '**Address** (vd. `mb-featured`) và **Name**.',
          '**Pinned items** → tìm tin theo tiêu đề hoặc công ty → **Add**. Sắp lại bằng ↑ ↓; **thứ tự ở đây là thứ tự trên trang**.',
          '**Save** → **Publish**.',
        ],
      },
      {
        kind: 'shot',
        src: '/shots/pp-collection-pinned.jpg',
        where: 'Admin',
        caption: 'Collection Hand-picked — tin ghim theo thứ tự; tin đã đóng hoặc bị ẩn bị gắn cờ **Not visible** và bị bỏ qua trên site.',
        note: 'Dữ liệu dev 08/10: *“7 of 10 pinned items are not shown on the site”* — nên trang MB Bank chỉ còn **3** thẻ nổi bật (Notion 28/09 ghi 10 ghim, 9 hiện).',
      },
      {
        kind: 'warn',
        text:
          '**Collection đã publish thì address cố định và không quay về Draft được.** Zone hiện **đúng** những gì collection chứa — nếu trang Premium hiện tin của **sai công ty**, sửa **collection**, không sửa zone. (Trên dev hôm nay, hai collection của MB Bank gồm cả tin VPBank, Cathay Life và TSB — dữ liệu test.)',
      },

      { kind: 'h', text: 'B · Tạo zone', path: '/content/zones' },
      {
        kind: 'shot',
        src: '/shots/pp-zones-list.jpg',
        where: 'Admin',
        caption: '**Content → Zones** — địa chỉ, hai collection mỗi zone dùng (*Job list: /mb-jobs · Featured: /mb-featured*), banner đã upload chưa, và trạng thái.',
      },
      {
        kind: 'list',
        items: [
          '**Content → Zones → New zone**.',
          '**Address** — chữ thường, số và gạch ngang, **2–63 ký tự**. Nó thành URL công khai và **không đổi được sau này**.',
          '**Title** — tiếng Việt bắt buộc; tiếng Anh và tiếng Hàn tuỳ chọn (tab VI / EN / KO).',
          '**Owner company** — tuỳ chọn; dùng làm link website công ty dự phòng.',
          '**Save** → zone ra đời ở trạng thái **Draft** (*“Draft created. Add a banner, then publish.”*).',
        ],
      },
      {
        kind: 'shot',
        src: '/shots/pp-zone-editor.jpg',
        where: 'Admin',
        caption: 'Editor của zone — form bên trái theo đúng thứ tự trang; panel phải có **Page order**, **Actions** và **Timestamps**.',
      },

      { kind: 'h', text: 'C · Đổ các khối, từ trên xuống' },
      {
        kind: 'list',
        heading: 'Topbar và banner',
        items: [
          '**Topbar → Partner logo** — PNG hoặc SVG **trong suốt**, dáng ngang, cao khoảng **30 px**. Tuỳ chọn: không có thì topbar chỉ hiện logo saramin.',
          '**Banner → Add slide** — upload ảnh **Desktop** (và tuỳ chọn ảnh **Mobile**; không có thì điện thoại dùng ảnh desktop). Tối đa **10 slide**; slide đầu hiện trước; dùng *Move earlier / Move later* để sắp lại.',
          '**Alt text** (trình đọc màn hình đọc thay ảnh) và **Banner link** (tuỳ chọn, `https://`, dùng cho mọi slide).',
        ],
      },
      {
        kind: 'shot',
        src: '/shots/pp-zone-banner.jpg',
        where: 'Admin',
        caption: 'Banner — mỗi slide một dòng, mỗi dòng một ảnh desktop và một ảnh mobile; slide đổi mỗi 5 giây.',
      },
      {
        kind: 'p',
        text:
          '**Kích thước ảnh.** Banner là một băng cố định: **1260 × 400** trên desktop (63 : 20) và **720 × 600** trên mobile (6 : 5). Ảnh khác tỉ lệ bị **cắt cho vừa**, nên giữ chữ và logo tránh xa mép.',
      },
      {
        kind: 'list',
        heading: 'Partners (mới — chưa có trong Notion)',
        items: [
          '**Partners → Add logo** — upload logo của từng nhà tuyển dụng; ảnh được **cắt theo khung 160 × 48** của dải ngay lúc upload. Tối đa **30**.',
          '**Kéo logo bằng tay cầm** để sắp lại (focus tay cầm rồi dùng phím mũi tên cũng được).',
          'Không có ô tên hay link — dải này **chỉ để giới thiệu ai đang tuyển**, không phải hàng điều hướng.',
        ],
      },
      {
        kind: 'shot',
        src: '/shots/pp-zone-partners.jpg',
        where: 'Admin',
        caption: 'Khối **Partners** trên zone MB Bank — chưa có logo nào. *“Artwork only — no caption, not clickable.”*',
      },
      {
        kind: 'list',
        heading: 'Top block và bottom block',
        items: [
          'Bật **Show this block**. **Tắt đi thì lưu xong sẽ xoá sạch khối đó.**',
          '**Content**: *Text* hoặc *Image* (một ảnh cho mọi ngôn ngữ).',
          'Với text, chọn **Editing**: *Rich text* để soạn tại chỗ, hoặc *HTML* để dán một đoạn có sẵn. Tiếng Việt bắt buộc.',
          'HTML được **làm sạch khi lưu**: bỏ script, style, iframe, form và inline style; giới hạn **20.000 ký tự sau khi làm sạch**. Ô *Preview (server rules)* bên dưới cho thấy phần nào sẽ sống sót.',
          '**Insert image** giờ có ở **cả hai** chế độ, kể cả HTML (từ 29/09). Ảnh chỉ được chèn khi URL **đã kiểm là phục vụ được** — trước đó ảnh chèn có thể biến mất sau khi tải lại.',
        ],
      },
      {
        kind: 'list',
        heading: 'Search bar và hai danh sách',
        items: [
          '**Search bar** — tick **ít nhất một** bộ lọc: Province · Job category · Job level · Keyword.',
          '**The two lists → Featured jobs**: chọn collection hand-picked (tuỳ chọn) · **Job list**: chọn collection saved-search (bắt buộc).',
        ],
      },
      {
        kind: 'shot',
        src: '/shots/pp-zone-lists.jpg',
        where: 'Admin',
        caption: 'Search bar và hai danh sách — *Featured jobs* nhận collection hand-picked, *Job list* nhận collection saved-search.',
      },
      {
        kind: 'list',
        heading: 'Company link',
        items: [
          'Bật **Show a company link** → **Link** (`https://`, website của chính nhà tuyển dụng) → **Link text** (tuỳ chọn; để trống thì in URL) → **Image** (tuỳ chọn, rộng ít nhất **1600 px**).',
          '**Tắt**: trang link sang website của **Owner company**, nếu có.',
        ],
      },
      {
        kind: 'p',
        text:
          '**Mẹo.** Panel **Page order** bên phải liệt kê từng phần kèm giá trị hiện tại (*“3 slides on a rotating slider”*, *“/mb-jobs”*, *“Not shown”*…). Đọc nó trước khi xuất bản — đó là cách nhanh nhất để thấy trang **sẽ thực sự hiện gì**. (Riêng khối Partners chưa có trong danh sách này.)',
      },

      { kind: 'h', text: 'D · Xuất bản và kiểm trang công khai' },
      {
        kind: 'list',
        items: [
          '**Save**.',
          'Panel phải, **Actions → Publish** → xác nhận *Publish this zone?* Nó lưu thay đổi, rồi mở địa chỉ cho mọi người.',
          'Dòng trạng thái đổi thành *Live at https://dev.svn.topdev.asia/khu-tuyen-dung/<address>*. Bấm **Preview** (góc trên phải) để mở.',
        ],
      },
      {
        kind: 'shot',
        src: '/shots/pp-web-mb-top.jpg',
        where: 'Jobseeker site',
        caption: 'Trang công khai MB Bank — topbar (*MB × saramin* với các link trong trang), banner, rồi Top block.',
      },
      {
        kind: 'shot',
        src: '/shots/pp-web-mb-lists.jpg',
        where: 'Jobseeker site',
        caption: 'Thanh tìm kiếm, **Việc làm nổi bật** (collection hand-picked) phía trên **Tất cả việc làm** (collection saved-search, có phân trang và sắp xếp).',
      },
      {
        kind: 'shot',
        src: '/shots/pp-web-nipa-top.jpg',
        where: 'Jobseeker site',
        caption: 'Cùng template, thương hiệu khác — **Korean companies (NIPA)**: không có logo đối tác nên topbar chỉ có saramin; **dải Partners** chạy ngay dưới banner; thanh tìm kiếm có **3 bộ lọc** (không có cấp bậc).',
      },

      { kind: 'h', text: 'E · Gắn vào menu site (tuỳ chọn)', path: '/content/navigation' },
      {
        kind: 'p',
        text:
          '**Content → Site navigation** → thêm một mục menu → đích **Zone** → chọn zone. **Chỉ zone đã Published mới chọn được.** Nếu sau này zone bị unpublish, mục menu đó **lặng lẽ biến mất** khỏi menu công khai, và dòng trong admin ghi rõ điều đó.',
      },

      { kind: 'h', text: 'F · Sửa, gỡ xuống, cho nghỉ hưu' },
      {
        kind: 'table',
        cols: ['Tôi muốn…', 'Làm gì', 'Chuyện gì xảy ra'],
        rows: [
          ['Sửa nội dung trên trang đang sống', 'Sửa khối → **Save**', 'Trang sống cập nhật trong khoảng một phút'],
          ['Tạm gỡ trang xuống', '**Unpublish**', 'Về Draft; địa chỉ trả “không tìm thấy”'],
          ['Cho một chiến dịch nghỉ', '**Archive**', 'Offline; **địa chỉ vẫn giữ chỗ**'],
          ['Đưa trang đã archive trở lại', '**Restore to draft** → kiểm → **Publish**', 'Không bao giờ quay thẳng lại sống'],
          ['Bỏ một bản nháp', '**Delete** (chỉ Draft)', 'Xoá hẳn; **địa chỉ được giải phóng**'],
        ],
      },

      { kind: 'h', text: 'G · Gỡ rối' },
      {
        kind: 'table',
        cols: ['Triệu chứng', 'Nguyên nhân và cách xử lý'],
        rows: [
          ['Publish bị mờ, hoặc báo *“Add at least one banner slide and save before publishing.”*', 'Thêm một banner slide có ảnh desktop, **Save**, rồi Publish.'],
          ['Publish lỗi *“The collection ‘…’ is not active”*', 'Một collection phía sau danh sách đã bị archive hoặc chưa bao giờ publish. Publish lại collection đó, hoặc chọn collection khác.'],
          ['Trang công khai báo “không tìm thấy”', 'Zone đang Draft hoặc Archived, hoặc gõ sai địa chỉ. Nhớ đường dẫn tiếng Việt là `/khu-tuyen-dung/<address>`.'],
          ['Nút **Preview** bị mờ', 'Zone **chưa** Published — chưa có preview cho bản nháp. Trên bản dựng chưa cấu hình địa chỉ site công khai, nút cũng mờ và nói rõ.'],
          ['Trang hiện tin của **sai công ty**', 'Zone hiện **đúng những gì collection chứa**. Sửa bộ lọc (Saved search) hoặc danh sách ghim (Hand-picked).'],
          ['Hàng **Featured jobs** biến mất', 'Collection hand-picked rỗng, hoặc **mọi** tin ghim đã đóng/ẩn — khối tự ẩn.'],
          ['Ảnh trông trắng trong editor', 'Không hẳn là mất: ảnh được chuyển đổi ngầm vài giây sau khi upload. Kiểm trên trang công khai.'],
          ['Ảnh chèn vào Top/Bottom block **mất sau khi tải lại**', 'Lỗi cũ, đã sửa 29/09: editor giờ chỉ chèn URL đã kiểm. Markup **đã lưu trước đó** của `mb-bank` mất `src` lúc ghi và **không khôi phục được** — phải soạn lại khối đó.'],
          ['Các picker của thanh tìm kiếm không hiện số đếm', '**Đúng như hiện tại**: số đếm trên trang tìm kiếm chính là toàn site, nên trang zone không hiện.'],
        ],
      },

      /* ── Part 3 ── */
      { kind: 'h', text: 'Phần 3 · Trang Collections, chi tiết', path: '/content/collections' },
      {
        kind: 'p',
        text:
          '**Vì sao nằm ở đây.** Premium page **không bao giờ tự chứa tin** — cả hai danh sách của nó là Collection. Một collection là **danh sách tin (hoặc công ty) đã lưu**, có địa chỉ công khai riêng `/bo-suu-tap/<address>`. **Cùng một collection có thể nuôi nhiều Premium page và nhiều mục menu cùng lúc**, nên sửa một collection là đổi **mọi** trang đang dùng nó.',
      },

      { kind: 'h', text: '§1 · Danh sách' },
      {
        kind: 'table',
        cols: ['Cột', 'Nó nói gì'],
        rows: [
          ['**Collection**', 'Tên, và địa chỉ công khai `/bo-suu-tap/<address>` bên dưới'],
          ['**Lists**', 'Jobs hoặc Companies'],
          ['**Membership**', 'Saved search → *Filters: 1 · Newest first* (mấy bộ lọc, và thứ tự đã lưu). Hand-picked → *Pinned: 10*. *“No filters / Nothing pinned — resolves to nothing”* nghĩa là collection **rỗng**'],
          ['**Status**', 'Draft · Active · Archived'],
          ['**Actions ⋮**', '**Hover** mới mở. *Edit* luôn có · **Draft** thêm *Publish* (mờ tới khi có một bộ lọc hoặc một tin ghim) và *Delete* · **Active** thêm *Archive*'],
        ],
        note: 'Tìm theo address hoặc tên; lọc theo loại (Jobs / Companies) và trạng thái. Danh sách luôn **mới cập nhật trước**. Muốn biết Premium page nào dùng collection nào: mở **Content → Zones**, cột *Lists* in ra `Job list: /mb-jobs · Featured: /mb-featured`.',
      },

      { kind: 'h', text: '§2 · Hai lựa chọn chỉ làm một lần' },
      {
        kind: 'table',
        note: 'Cả hai **cố định sau khi tạo** — chúng quyết định form hiện những ô nào.',
        cols: ['Lists', 'Membership', 'Có?', 'Dùng trên Premium page'],
        rows: [
          ['Jobs', 'Saved search', 'Có', '**Job list** (khối bắt buộc)'],
          ['Jobs', 'Hand-picked', 'Có', '**Featured jobs** (khối tuỳ chọn)'],
          ['Companies', 'Hand-picked', 'Có', '**Không dùng được trong zone** — zone chỉ chào collection tin. Dùng cho menu'],
          ['Companies', 'Saved search', '**Không có**', '— (bộ lọc mô tả tin, không mô tả công ty)'],
        ],
      },
      {
        kind: 'shot',
        src: '/shots/pp-collection-head.jpg',
        where: 'Admin',
        caption: 'Đầu form collection — **Address**, **Lists** và **Membership** (khoá sau khi tạo), rồi tên VI / EN / KO. **Preview** và **Actions** ở bên phải.',
      },

      { kind: 'h', text: '§3 · Saved search — bộ lọc, thứ tự và giới hạn' },
      {
        kind: 'p',
        text:
          'Mọi thứ khớp bộ lọc đều nằm trong collection, **kiểm lại mỗi lượt truy cập**: tin mới tự vào, tin đóng hoặc bị ẩn tự rớt ra.',
      },
      {
        kind: 'table',
        cols: ['Nhóm', 'Bộ lọc'],
        rows: [
          ['**Employer** — ai đang tuyển', 'Company tag · Company country · Company size · Industry · **Companies** (chọn đích danh công ty)'],
          ['**Posting** — bản thân tin', 'Job role · Job level · Work type · Contract type · Benefit · Province · **Keyword** (khớp giống hệt tìm kiếm công khai)'],
        ],
      },
      {
        kind: 'list',
        items: [
          'Bộ lọc chạy **như tìm kiếm công khai**: chọn **nhiều giá trị trong một bộ lọc** thì **mở rộng** (bất kỳ giá trị nào), **thêm một bộ lọc nữa** thì **thu hẹp** (phải khớp tất cả).',
          '**Order** — *No saved order · Newest first · Relevance · Highest salary · Lowest salary · Most viewed · Recently posted · Closing soonest.* Đây là **thứ tự mặc định** mà Job list của Premium page hiện; khách xem vẫn tự sắp lại được cho riêng họ.',
          '**Item limit** — số món nhiều nhất một khách thăm từng thấy. Để trống = không giới hạn.',
          '**Preview** (panel phải) — số khớp sống và vài kết quả đầu, cập nhật theo mỗi lần đổi bộ lọc. **Kiểm nó trước khi publish**: collection không khớp gì **vẫn lưu và publish được**, và trang sẽ rỗng. Ở mức 0 nó cảnh báo *“Nothing matches…”*.',
        ],
      },
      {
        kind: 'shot',
        src: '/shots/pp-collection-posting.jpg',
        where: 'Admin',
        caption: 'Bộ lọc **Posting**, **Keyword**, **Order** và **Item limit**; số Preview cập nhật bên phải.',
      },

      { kind: 'h', text: '§4 · Hand-picked — tin ghim' },
      {
        kind: 'list',
        items: [
          '**Pinned items** → tìm tin theo tiêu đề hoặc công ty → **Add**. Sắp lại bằng ↑ ↓, xoá bằng thùng rác. **Thứ tự ở đây là thứ tự trên trang** — không có ô sắp xếp riêng.',
          '**Cờ Not visible:** một tin chỉ hiện khi nó **đang mở, đang được phơi (exposed) và còn trong cửa sổ đăng** (một công ty: **Active và có MST**). Dòng bị gắn cờ **bị bỏ qua trên site mà không báo gì cho khách**, nên trang ngắn đi một thẻ — dòng vàng phía trên danh sách đếm giúp (*“7 of 10 pinned items are not shown on the site”*).',
          '**Item limit** dùng được ở đây nữa.',
          'Tin ghim **không tự làm mới**: khi một tin featured đóng lại, phải thay bằng tay.',
        ],
      },

      { kind: 'h', text: '§5 · Trạng thái collection' },
      {
        kind: 'table',
        cols: ['Trạng thái', 'Trên site', 'Làm được gì'],
        rows: [
          ['**Draft**', 'Không hiện (địa chỉ trả “không tìm thấy”)', 'Sửa mọi thứ **kể cả address** · Publish · Delete'],
          ['**Active**', 'Sống tại `/bo-suu-tap/<address>`, zone và menu dùng được', 'Sửa bộ lọc / tin ghim / tên · Archive'],
          ['**Archived**', 'Offline; địa chỉ vẫn giữ chỗ', '**Không gì đưa nó trở lại** — admin không có nút Restore; dựng collection mới'],
        ],
      },
      {
        kind: 'list',
        items: [
          '**Một chiều duy nhất: Draft → Active → Archived.** Collection đã publish không quay lại Draft được.',
          '**Saved search cần ít nhất một bộ lọc**, **Hand-picked cần ít nhất một tin ghim** — nếu không thì không lưu được.',
          '**Save không bao giờ publish** — Publish nằm ở thẻ Actions bên phải (nó tự lưu trước).',
          '**Address đóng băng khi publish**, nên một menu hay một zone đang trỏ vào nó không thể bị đổi hướng âm thầm.',
          '**Archive** đưa danh sách offline và các mục menu trỏ vào nó thành rỗng. Nó **bị từ chối khi một zone đã publish còn liệt kê collection**: *“A published zone still lists this collection. Unpublish that zone, or point it at another collection, before archiving this one.”*',
          '**Delete** chỉ có cho Draft; địa chỉ được giải phóng.',
          '**Preview** (góc trên phải) mở trang công khai của chính collection — chỉ với collection Active.',
        ],
      },

      { kind: 'h', text: '§6 · Trước khi động vào một collection mà Premium page đang dùng' },
      {
        kind: 'list',
        items: [
          'Mở **Content → Zones → cột Lists** để xem **những zone nào** đang dùng nó.',
          'Mọi chỉnh sửa (bộ lọc, tin ghim, thứ tự, giới hạn) **sống ngay lập tức trên mọi trang dùng nó**.',
          'Muốn cho một collection mà zone đã publish đang dùng nghỉ hưu: **tạo và publish collection thay thế → chuyển zone sang nó (Zone editor → The two lists → Save) → rồi mới archive cái cũ.** Hệ thống chặn việc archive sớm hơn.',
          'Một zone **chỉ (tái) xuất bản được khi cả hai collection của nó đang Active** — publish với một collection đã archive thì lỗi *“The collection ‘…’ is not active”*.',
        ],
      },
    ],
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
}
