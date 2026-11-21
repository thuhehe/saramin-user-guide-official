/*
 * Job display logic — how each display area on the jobseeker site decides which jobs it shows.
 *
 * WHY THIS GROUP EXISTS. Nobody had written down how a placement picks its
 * content. Sales sells "your posting appears in area X" with no statement of
 * what that buys, and the admin Placement load dashboard reports numbers
 * (2.618 "never shown" on Top search) that read as a fault when they are the
 * design. The group answers one question per area, in the same shape every
 * time, so a new area is a new page and nothing else moves.
 *
 * WHO READS THESE PAGES. Thu settled this on 2026-11-21: the per-area pages
 * (/trang/top-search and the ones that follow it) are a USER GUIDE FOR THE
 * CLIENT. They describe the logic of an area and nothing else. They are NOT a
 * requirement for the dev, so none of the following belongs on them:
 *   - "Bản yêu cầu", status lines, ✅ / 🔶 markers, who decided and when
 *   - ticket codes
 *   - gap statements: "hiện tại là 8", "đổi thành 20 nằm trong task",
 *     "khác hiện tại", anything comparing today's build to the target
 *   - production measurements, pool sizes, named employers, config advice
 *   - internal to-do lists for the team
 * That material lives in the spec site and the PM ticket, which is where the
 * dev reads it. The group index below is the exception: it is the technical
 * as-built page about the registry itself.
 *
 * SHAPE OF THE TOP SEARCH PAGE:
 *   1 Tóm lại — the whole band as one table
 *   2 Khi nào dải hiện, và tiêu đề là gì
 *   3 Job nào được lên dải
 *   4 Xếp theo gì, hiện bao nhiêu thẻ
 *   5 Mỗi slide tối đa một job của một công ty
 *   6 Xoay vòng
 *   7 Giao diện
 *
 * KEPT OUT OF THE PAGE ON 2026-11-21, because they are internal findings and
 * not logic the client needs. Measured on production 20/11/2026; move them to
 * the ticket or the spec site if they still need an owner:
 *   - Product "TOP JOB - TEST" is Active at 3.000.000 đ and sells this slot.
 *     Looks like test data; should be Inactive.
 *   - Placement load counts 2.626 for this slot, the search endpoint returns
 *     2.624 — the dashboard also counts jobs on archived products.
 *   - The "hiển thị trong N ngày đầu" field on the slot row is a no-op here.
 *   - Placement load treats this slot as rotation-free; once the band rotates
 *     that has to change or "Waiting for a turn" reports nonsense.
 *   - The pool is 2.626 postings over 22 companies, 2.592 of them MBBANK's,
 *     so one company per slide holds for about eleven slides and no further.
 *     Narrowing which products sell this slot is the only real fix.
 *
 * VOICE OF THE TOP SEARCH PAGE — Thu picked a colleague's Notion docs as the
 * model on 2026-11-21 and the page is written to match them:
 *   - opens with ONE callout: what the doc covers, then the status line
 *   - sections are "1." "2.", plain statements, never "§1 · Bước 1 — …"
 *   - table cells are a few words; anything longer goes in a list under it
 *   - one fact per line, flat: topic, colon, answer. No reasoning chains
 *   - examples are one line with an arrow: "VD: … → …"
 *   - NO code identifiers in reader-facing text. Not refreshed_at but "lần làm
 *     mới gần nhất"; not items_shown but "số thẻ"; not rotation_seconds but
 *     "chu kỳ". Name things the way an admin sees them on screen. No ticket
 *     codes either.
 * Detail that only makes sense with a code name belongs in the ticket, not here.
 * So do decision markers: a client reading a guide does not care who signed it
 * off, only how the thing works.
 *
 * VOCABULARY. Never "vẽ" for what the user sees — it reads as jargon. Use
 * "hiện" / "hiển thị". Never "ai" for jobs; jobs are not people.
 *
 * Code read from origin/dev on 2026-11-20:
 *   svn-be  785c698d7
 *   svn-web ed538a26e
 *   saramin-vn-admin a63d271d
 * Production figures read the same day from prod-admin.saramin.vn
 * (/api/admin/placements, /api/admin/jobs/placement-load, the public
 * /api/vi/jobs/search behind the same host).
 */
import type { PageDoc, ModuleDoc } from '../docs'

const STAMP =
  'Viết theo **code đang chạy** trên nhánh `dev`, đọc ngày 20/11/2026 (svn-be `785c698d7` · svn-web `ed538a26e` · admin `a63d271d`), số liệu đo thẳng trên **production** cùng ngày.'

const STAMP_ASBUILT = STAMP

const STAMP_TOP_SEARCH = 'Cập nhật 21/11/2026.'

export const JOB_DISPLAY_PAGE_DOCS: Record<string, PageDoc> = {
  /* ────────────────────────────────────────────────────────────────────────── */
  'top-search': {
    blocks: [
      {
        kind: 'p',
        text: 'Dải **Top search** là hàng thẻ việc làm nằm trên đầu trang kết quả tìm kiếm, phía trên danh sách kết quả. Đây là một ô có bán: job chỉ lên dải khi bậc tin của job, hoặc add-on hiển thị gắn vào job, có bán ô này.\n\nTrang này nói: khi nào dải hiện, lấy job nào, xếp theo gì, hiện bao nhiêu thẻ, xoay vòng ra sao, và trên màn hình dải gồm những gì.',
      },
      {
        kind: 'shot',
        src: '/shots/job-display/top-search-on-page.jpg',
        where: 'Jobseeker site',
        caption: 'Dải Top search là khung đỏ. Nó nằm **trên** khối *Kết quả tìm kiếm*.',
        note: 'Ảnh để thấy **vị trí** của dải trên trang.',
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '1. Tóm lại' },
      {
        kind: 'table',
        note: '**“Đủ điều kiện”** ở trang này nghĩa là job đạt **cả ba** điều: đang hiển thị bình thường trên site, khớp từ khoá và bộ lọc ứng viên đang dùng, và đã mua ô Top search — qua bậc tin đang chạy của job, hoặc add-on hiển thị gắn vào job. Mục 3 nói rõ từng điều.',
        cols: ['Hạng mục', 'Dải chạy thế nào'],
        rows: [
          ['Khi nào hiện', 'Luôn hiện, trừ khi không còn job nào **đủ điều kiện**'],
          ['Lọc theo', 'Từ khoá và bộ lọc trên thanh tìm kiếm'],
          ['Số thẻ', '20'],
          ['Chia slide', '5 slide × 4 thẻ'],
          ['Thứ tự', 'Job làm mới gần nhất đứng trước'],
          ['Một công ty trong 1 slide', 'Nhiều nhất 1 thẻ'],
          ['Xoay vòng', '5 phút tịnh tiến 4 job'],
          ['Nút Xem thêm', 'Không có'],
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '2. Khi nào dải hiện, và tiêu đề là gì' },
      {
        kind: 'table',
        cols: ['Người dùng', 'Dải lấy job nào', 'Tiêu đề dải'],
        rows: [
          ['Có từ khoá', 'Khớp từ khoá + bộ lọc', '*Việc {từ khoá} dành cho bạn*'],
          ['Chỉ có bộ lọc', 'Khớp bộ lọc', '*Việc làm dành cho bạn*'],
          ['Không gõ, không lọc', 'Tất cả', '*Việc làm dành cho bạn*'],
          ['Không còn job nào', '—', 'Không hiện dải'],
        ],
      },
      {
        kind: 'list',
        items: [
          'Dải **luôn hiện**. Chỉ ẩn khi không còn job nào đủ điều kiện — tức không còn job nào vừa đang hiển thị, vừa khớp tìm kiếm, vừa đã mua ô này.',
          'Bộ lọc ở đây là đúng các bộ lọc của trang kết quả: khu vực, ngành nghề, vị trí, kỹ năng, cấp bậc, mức lương, loại hợp đồng, kinh nghiệm.',
          'Dải và danh sách kết quả bên dưới luôn trả lời **cùng một câu hỏi**. Đổi một bộ lọc thì cả hai đổi theo.',
        ],
      },
      {
        kind: 'p',
        text: 'Tên bộ lọc **không** ghép vào tiêu đề. Người dùng thường đặt nhiều bộ lọc một lúc — hai khu vực, ba ngành nghề là bình thường — ghép hết vào thì tiêu đề không đọc nổi. Nên không có từ khoá thì tiêu đề để trung tính, dù đã chọn bộ lọc hay chưa.',
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '3. Job nào đủ điều kiện lên dải' },
      {
        kind: 'table',
        note: 'Job phải đạt **cả ba**. Rớt một điều kiện là không lên dải, dù job mới đăng đến đâu.',
        cols: ['Điều kiện', 'Nội dung'],
        rows: [
          ['1. Đang hiển thị bình thường', 'Job đang mở, đang bật hiển thị, chưa hết hạn. Công ty đang hoạt động và đã có mã số thuế'],
          ['2. Khớp từ khoá và bộ lọc', 'Theo đúng luật tìm kiếm thường. Không gõ, không lọc thì không loại ai'],
          ['3. Đã mua ô Top search', 'Bậc tin đang chạy có bán ô này, **hoặc** job có add-on hiển thị còn hạn'],
        ],
      },
      {
        kind: 'list',
        items: [
          'Bậc đang chạy: bậc **cao nhất** job đang giữ, còn trong hạn.',
          'Product đã archive: job rớt khỏi dải, dù bậc còn hạn.',
          'Add-on hiển thị: mua kèm vào job đang chạy bậc bất kỳ, **không cần đổi bậc**.',
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '4. Xếp theo gì, hiện bao nhiêu thẻ' },
      {
        kind: 'list',
        items: [
          'Thứ tự: job **làm mới gần nhất** đứng trước. Không phải ngày đăng.',
          'Menu sắp xếp của người dùng (VD *Lương cao nhất*) **không** đổi thứ tự dải. Nó chỉ đổi danh sách kết quả bên dưới.',
          'Hàng job được **chốt ở đầu mỗi chu kỳ**. Job làm mới giữa chu kỳ vào hàng từ chu kỳ sau — không cướp lượt của job đang chờ.',
          'Số thẻ: **20**, chia **5 slide × 4 thẻ**.',
          'Ít hơn 20 job thì hiện bấy nhiêu. VD: 7 job đủ điều kiện → 2 slide, slide sau 3 thẻ.',
          '**Không** lấy job chưa mua ô này vào cho đủ 20.',
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '5. Mỗi slide tối đa một job của một công ty' },
      {
        kind: 'list',
        items: [
          'Trong một slide 4 thẻ, mỗi công ty nhiều nhất **1 thẻ**.',
          'Trên cả 20 thẻ, một công ty nhiều nhất **5 thẻ**.',
          'Nếu số công ty đang có job trong dải **không đủ** để chia như vậy: rải xa nhất có thể. Còn công ty chưa dùng trong slide thì ưu tiên công ty đó; hết mới chấp nhận một công ty xuất hiện hai lần.',
          '**Không bỏ job** ra khỏi dải để giữ luật này, cũng **không để slide thiếu thẻ**.',
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '6. Xoay vòng: 5 phút tịnh tiến 4 job' },
      {
        kind: 'list',
        items: [
          'Toàn bộ job đủ điều kiện xếp thành **một hàng**. 20 job đầu hàng là 5 slide đang hiện.',
          'Mỗi **5 phút**, cả hàng tịnh tiến **4 chỗ**: slide 2 lên slide 1, 4 job kế tiếp vào slide 5.',
          'Đi hết hàng thì **quay lại đầu hàng**.',
        ],
      },
      {
        kind: 'example',
        heading: 'VD: một hàng 100 job',
        scenario: 'Ứng viên mở trang, rồi tải lại sau mỗi 5 phút.',
        cols: ['Slide', 'Mở trang', 'Sau 5 phút', 'Sau 10 phút'],
        rows: [
          ['Slide 1', 'Job 1–4', 'Job 5–8', 'Job 9–12'],
          ['Slide 2', 'Job 5–8', 'Job 9–12', 'Job 13–16'],
          ['Slide 3', 'Job 9–12', 'Job 13–16', 'Job 17–20'],
          ['Slide 4', 'Job 13–16', 'Job 17–20', 'Job 21–24'],
          ['Slide 5', 'Job 17–20', 'Job 21–24', 'Job 25–28'],
        ],
        note: 'Mỗi nhịp cả bảng dịch lên một dòng. Hết job thứ 100 thì quay lại job 1. Nghĩa là **mọi job trong hàng đều tới lượt**, không chỉ 20 job đầu.',
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '7. Giao diện dải' },
      {
        kind: 'list',
        items: [
          'Dải **tự chạy**, không cần bấm.',
          'Có nút **tạm dừng / chạy tiếp**.',
          'Có **bộ đếm vị trí slide**, dạng *2 / 5*.',
          'Có **mũi tên trái phải**. Mỗi lần nhảy **trọn một slide** 4 thẻ, không trượt từng thẻ.',
          '**Không có nút Xem thêm.**',
        ],
      },

      { kind: 'p', text: `*${STAMP_TOP_SEARCH}*` },
    ],
  },
}

/* ────────────────────────────────────────────────────────────────────────────
 * Module page — the model every placement page builds on.
 * ──────────────────────────────────────────────────────────────────────────── */

export const JOB_DISPLAY_MODULE_DOCS: Record<string, ModuleDoc> = {
  'Job display logic': {
    title: 'Job display logic — mỗi ô hiển thị chọn job theo cách nào',
    lead:
      '**Tóm lại:** mọi khu vực hiện job trên site ứng viên — các dải trên trang chủ, dải trên trang tìm kiếm, dải trên trang bảng tin — đều là **một dòng trong cùng một bảng**. Dòng đó nói ô nằm ở trang nào, hiện mấy job, và **job vào ô bằng đường nào**.\n\nNhưng **không phải ô nào cũng lấy job giống ô nào**, và đó là gốc của gần hết câu hỏi *“sao job này không hiện”*. Trang này nói phần **chung cho mọi ô**; mỗi ô có trang riêng nói phần của nó.',
    headline: [
      '**Một “placement” là một cái hộp trên một trang** — không phải một sản phẩm, không phải một job. Sửa ở **Product settings → Placements**; thêm hay xoá hộp thì phải đụng database, admin không làm được.',
      '**Job vào hộp bằng một trong hai đường:** `TIER` — product của job có **tick** hộp đó; hoặc `BOOKED` — khách **mua thẳng một khung thời gian** trên hộp (chỉ dùng cho banner và popup).',
      '**Trong nhóm TIER còn chia tiếp làm hai, và đây mới là chỗ hay sai:** phần lớn hộp được trang chủ/bảng tin tự lấp và **có xoay vòng**; còn **3 hộp** được lấp bằng chính ô tìm kiếm và **hôm nay không xoay vòng** — `rotation_seconds` đặt trên 3 hộp đó không ai đọc. Riêng **Top search** có luật xoay vòng của riêng nó — xem `/trang/top-search`.',
    ],
    blocks: [
      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '§1 · Một dòng placement gồm những gì' },
      {
        kind: 'table',
        note: 'Trên production hiện có **47 dòng**: 28 dòng `TIER` (1 dòng đang `INACTIVE`, không trang nào hiện) và 19 dòng `BOOKED`. Bản thân **màn hình** sửa các dòng này — cột nào sửa được, kích thước ảnh, sức chứa banner — nằm ở trang `/trang/placements`; ở đây chỉ nói các trường quyết định **job nào được hiện**.',
        cols: ['Trường', 'Nghĩa', 'Ví dụ'],
        rows: [
          ['`slot_key`', 'Tên nghiệp vụ của hộp, người vận hành đọc', '`TOP_SEARCH`'],
          ['`id`', 'Mã kỹ thuật, luôn là `placement_` + `slot_key` viết thường. Cũng là địa chỉ API công khai', '`placement_top_search`'],
          ['`page`', 'Hộp nằm ở trang nào', '`HOME` · `SEARCH` · `KOREA` · `GLOBAL` · `JOB_LIST` · `COMPANY_PAGE` · `PROFILE` · `AUTH`'],
          ['`format`', 'Hộp chứa kiểu nội dung gì', '`CONTENT_POOL` (danh sách job) · `IMAGE_BANNER` · `POPUP`'],
          ['`fill_route`', '**Job/ảnh vào hộp bằng đường nào** — xem §2', '`TIER` · `BOOKED`'],
          ['`items_shown`', 'Hộp hiện bao nhiêu thẻ cùng lúc', '`8`'],
          ['`pool_cap`', 'Trần cũ cho số dòng truy vấn. **Với dải job thì không còn ai đọc** từ 10/11/2026', 'để trống'],
          ['`rotation_seconds`', 'Bao lâu đổi lượt một lần — **chỉ có tác dụng với hộp tier-fed**, xem §4', '`300`'],
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '§2 · Hai đường nội dung vào hộp' },
      {
        kind: 'table',
        note: 'Hai đường **không giao nhau**. Form product lọc đúng theo đó: mục *Placement slots* chỉ hiện hộp **không phải** `BOOKED`; mục *Placement booking* chỉ hiện hộp `BOOKED`.',
        cols: ['', 'TIER — bán qua product', 'BOOKED — bán thẳng khung thời gian'],
        rows: [
          ['Khách mua gì', 'Một **bậc tin** (hoặc một add-on hiển thị)', 'Một **ô banner trong một khoảng ngày**'],
          ['Job/ảnh vào hộp vì', 'Product của job **có tick** hộp đó', 'Có một **booking** đã duyệt trên hộp đó'],
          ['Dùng cho', 'Các dải job', 'Banner và popup'],
          ['Có bao nhiêu hộp', '**28** (1 đang tắt)', '**19**'],
          ['Nhiều khách cùng lúc?', 'Bao nhiêu job mua cũng được — hộp chỉ hiện `items_shown` thẻ', 'Giới hạn bằng `concurrent_slots` trên từng hộp'],
        ],
      },
      {
        kind: 'list',
        heading: '2a · Chuỗi của đường TIER, đọc từ trái sang phải',
        items: [
          '`product_placement_slot` — **bảng nối**: product này tick những hộp nào. Người vận hành tick trong *Product settings → Products → một product → Placement slots*.',
          '`job_placement` — **lượt chạy thật** của một job: job này đang giữ product nào, từ bao giờ tới bao giờ. Sinh ra lúc **publish**, không phải lúc chọn product trên form.',
          '**Hộp hiển thị** — lúc hiển thị, hệ thống hỏi ngược: *“hộp này được những product nào tick, và job nào đang chạy một trong các product đó?”*',
          '**Và một đường tắt: add-on hiển thị** (`DISPLAY_PLACEMENT`). Job gắn add-on sẽ vào hộp mà product của add-on tick, **không cần** đổi bậc.',
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '§3 · Trong nhóm TIER còn hai loại — đây là chỗ hay sai nhất' },
      {
        kind: 'p',
        text: 'Hai loại hộp TIER trông giống hệt nhau trong màn hình Placements — cùng các trường, cùng cách tick product. Nhưng **nội dung đi hai đường khác nhau**, và vì thế **hành xử khác nhau ở bốn điểm**.',
      },
      {
        kind: 'table',
        cols: ['', 'Tier-fed — trang tự lấp', 'Search-fed — ô tìm kiếm lấp'],
        rows: [
          ['Có mấy hộp', '**25**', '**3**'],
          ['Là những hộp nào', 'Toàn bộ dải trang chủ, Korea, Global (8 dải × 3 trang) + 1 hộp trang quên mật khẩu (đang tắt)', '`TOP_SEARCH` · `MEGA_MENU_PAGE_JOB_LIST_TRENDING` · `MEGA_MENU_PAGE_JOB_LIST_ANNOUNCEMENT`'],
          ['Lấy nội dung bằng', '`GET /placements/{id}/jobs`', '`GET /jobs/search` với một cờ riêng'],
          ['Có đọc từ khoá người dùng gõ?', '**Không** — hộp hiện như nhau với mọi người', '**Có** — hộp trả lời chính câu người dùng hỏi'],
          ['Có xoay vòng?', '**Có**, theo `rotation_seconds`', '**Hôm nay chưa** — đường tìm kiếm không có đoạn code xoay vòng nào. Riêng **Top search** có luật xoay vòng riêng, xem `/trang/top-search`'],
          ['Xếp theo', 'Thứ tự xoay vòng của chu kỳ hiện tại', '`refreshed_at` giảm dần — mới làm mới nhất trước'],
        ],
      },
      {
        kind: 'warn',
        text: '**Hộp search-fed vẫn khai fill_route = TIER, và đó không phải nhầm.** Giá trị TIER là **điều kiện để hộp hiện ra trong danh sách tick của form product** — nếu không có nó thì không ai bán được hộp này. Hệ quả: gọi `GET /placements/{id}/jobs` lên một hộp search-fed **vẫn trả về một danh sách job**, nhưng **không màn hình nào hiển thị danh sách đó**. Đừng dùng API này để kiểm tra 3 hộp đó.',
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '§4 · Xoay vòng — ai đọc rotation_seconds' },
      {
        kind: 'list',
        items: [
          '**Xoay vòng là gì:** hộp chỉ hiện `items_shown` thẻ nhưng có thể có hàng trăm job đủ điều kiện. Mỗi chu kỳ (`rotation_seconds` giây) hệ thống **lật sang trang tiếp theo** của tập job đó, nên đi hết một vòng thì **mọi job đều đã được hiện đúng một lần**.',
          '**Thứ tự là hàm của (hộp, chu kỳ thứ mấy)** — không phải ngẫu nhiên theo từng lượt truy cập. Nghĩa là mọi người mở cùng một lúc đều thấy **cùng một danh sách**, và trang có thể cache đúng bằng độ dài một chu kỳ.',
          '**Trong một trang, job của cùng một công ty được rải ra**, không đứng cạnh nhau.',
          '**Chỉ hai chỗ trong hệ thống gọi bộ xoay vòng:** đường đọc dải job (`PublicReadService`) và đường đọc banner (`BannerService`). **Đường tìm kiếm không gọi.**',
        ],
      },
      {
        kind: 'warn',
        text: '**Hôm nay cả 28 hộp TIER đều đang để rotation_seconds = 300** (5 phút) — kể cả 3 hộp search-fed. Với 25 hộp tier-fed, con số đó chạy thật. Với 3 hộp search-fed, nó **chưa làm gì cả**: dải lấy N job đầu theo `refreshed_at` và dừng ở đó, job thứ N+1 trở đi không tới lượt. Với **Top search**, 300 giây chính là chu kỳ xoay vòng của dải — xem `/trang/top-search`.',
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '§5 · Đọc dashboard Placement load cho đúng' },
      {
        kind: 'p',
        text: '**Product settings → Placement load** dựng lại từng hộp đúng như site hiển thị, rồi xếp mọi job đủ điều kiện vào ba nhóm. Nó là chỗ nhanh nhất để trả lời *“job của khách đang ở đâu”* — miễn là đọc đúng nghĩa ba nhóm đó.',
      },
      {
        kind: 'table',
        cols: ['Nhóm', 'Nghĩa', 'Khi nào là bình thường'],
        rows: [
          ['**Showing now**', 'Job hộp đang hiện **ngay lúc này**', 'Luôn luôn'],
          ['**Waiting for a turn**', 'Job sẽ tới lượt ở một chu kỳ sau', 'Chỉ xuất hiện với hộp **có xoay vòng**'],
          ['**Never shown**', 'Job đủ điều kiện nhưng **không bao giờ** được hiện', '**Bình thường với hộp không xoay vòng** — hôm nay là cả 3 hộp search-fed. Con số lớn ở đây **không phải lỗi**'],
          ['**Empty slot**', 'Chỗ trống vì chưa đủ job', 'Hộp mới bán, hoặc hộp chưa product nào tick'],
        ],
      },
      {
        kind: 'warn',
        text: '**Hai điều dashboard này cố tình làm, phải biết trước khi trích số:**\n\n① Với 3 hộp search-fed, nó **ép rotation_seconds về rỗng** rồi mới tính — nếu không nó sẽ báo hàng nghìn job *“đang chờ tới lượt”* mà thực tế không bao giờ tới.\n\n② Nó dựng lại hộp bằng **một lượt tìm kiếm không từ khoá, không bộ lọc**. Với hộp search-fed thì người dùng thật **luôn** gõ từ khoá, nên con số *“đủ điều kiện”* ở đây là **trần trên**, không phải số job tranh nhau một lượt tìm kiếm cụ thể.',
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '§6 · Các trang trong nhóm này' },
      {
        kind: 'table',
        note: 'Trang này nói phần **chung cho mọi hộp**: hộp là gì, nội dung vào hộp bằng đường nào, hộp nào xoay vòng. Mỗi hộp có trang riêng nói cách hộp đó **chọn và xếp job** — hôm nay mới có trang cho Top search.',
        cols: ['Hộp', 'Ở đâu trên site', 'Loại', 'Trang'],
        rows: [
          ['**Tìm kiếm — Top search**', 'Dải job trên đầu trang kết quả tìm kiếm', 'Search-fed', '`/trang/top-search`'],
          ['*Các dải trang chủ · Korea · Global*', 'Super hot · Top job · Distinction · Basic plus · Basic · Free · Recommended', 'Tier-fed', '*chưa có trang riêng*'],
          ['*Mega menu — Trending jobs / Don’t miss these jobs*', 'Hai dải trên các trang bảng tin của mega menu', 'Search-fed', '*chưa có trang riêng — xem /trang/jobs-pages*'],
          ['*Banner và popup*', 'Trang chủ, trang công ty, trang cá nhân, trang đăng nhập', '`BOOKED`', '*xem nhóm Content*'],
        ],
      },

      { kind: 'p', text: `*${STAMP_ASBUILT}*` },
    ],
  },
}
