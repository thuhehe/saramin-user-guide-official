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
 * dev reads it. The group page below used to be the exception — a technical
 * as-built page about the registry. It is NOT any more: Thu widened the rule to
 * it on 2026-11-21 and it is now written for the people who SELL these boxes.
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
 * SHAPE OF THE BOARD STRIPS PAGE (/trang/board-strips), the same spine over two
 * areas at once — "Tin tuyển dụng nổi bật" and "Đừng bỏ lỡ những tin này!" on
 * the three mega-menu board pages:
 *   1 Tóm lại — one table, a column per strip
 *   2 Ba trang, một màn hình
 *   3 Job nào đủ điều kiện lên dải
 *   4 Xếp theo gì
 *   5 Một công ty tối đa 10% số thẻ
 *   6 Xoay vòng
 *   7 Giao diện
 *
 * KEPT OUT OF THE BOARD STRIPS PAGE, same reasons — they belong to the ticket:
 *   - the band split is enforced by WHICH product ticks which area, not by a
 *     rung test in code, so "Basic Plus trở lên" is a configuration the page
 *     states as a rule and the ticket has to keep true
 *   - today the two areas are cut at items_shown with no rotation at all; the
 *     page states the rotating rule without naming the gap
 *   - 30 / 40 cards read off staging on 2026-11-21 (the trending strip drew
 *     exactly 30, the free strip 23 of its 40 — its pool is smaller)
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
 * Code read from svn-be origin/dev: the Top search page on 2026-11-20, the
 * group page re-read on 2026-11-21 (head 86a1d09bb). NOTE for whoever edits
 * next: the local svn-be checkout sits on a September commit, so read these
 * files with `git show origin/dev:<path>`, never from the working tree.
 */
import type { PageDoc, ModuleDoc } from '../docs'

const STAMP_TOP_SEARCH = 'Cập nhật 21/11/2026.'

const STAMP_GROUP = 'Cập nhật 21/11/2026.'

/* A DATE PER PAGE, never one shared constant: two guide pages are refreshed on
   different days, and a shared stamp would re-date the one nobody touched. */
const STAMP_BOARD_STRIPS = 'Cập nhật 21/11/2026.'

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
  /* ────────────────────────────────────────────────────────────────────────── */
  'board-strips': {
    blocks: [
      {
        kind: 'p',
        text: 'Ba trang bảng tin của mega menu — **Theo khu vực**, **Theo ngành nghề**, **Theo ngành** — mỗi trang có **hai dải thẻ việc làm** nằm dưới thanh tìm kiếm: *Tin tuyển dụng nổi bật* ở trên, *Đừng bỏ lỡ những tin này!* ở dưới.\n\nHai dải là **hai ô có bán khác nhau**, không phải hai nửa của một ô. Job lên một dải khi bậc tin đang chạy của job có bán đúng ô đó.\n\nTrang này nói: job nào lên dải nào, xếp theo gì, hiện bao nhiêu thẻ, xoay vòng ra sao, và trên màn hình dải gồm những gì.',
      },
      {
        kind: 'shot',
        src: '/shots/job-display/board-trending.jpg',
        where: 'Jobseeker site',
        caption: 'Dải **Tin tuyển dụng nổi bật** là khung đỏ. Nằm dưới thanh tìm kiếm, lưới **3 cột**.',
      },
      {
        kind: 'shot',
        src: '/shots/job-display/board-announcement.jpg',
        where: 'Jobseeker site',
        caption: 'Dải **Đừng bỏ lỡ những tin này!** là khung đỏ. Nằm **dưới** dải Nổi bật, lưới **4 cột**.',
        note: 'Hai ảnh để thấy **vị trí** của hai dải trên trang.',
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '1. Tóm lại' },
      {
        kind: 'table',
        note: '**“Đủ điều kiện”** ở trang này nghĩa là job đạt **cả ba** điều: đang hiển thị bình thường trên site, khớp từ khoá và bộ lọc trên trang, và bậc tin đang chạy của job có bán đúng ô của dải. Mục 3 nói rõ từng điều.\n\n**Số thẻ** do người vận hành đặt cho từng ô trong Admin. Đổi số thẻ là đổi luôn trần của một công ty, vì trần đó là 10% số thẻ.',
        cols: ['Hạng mục', 'Tin tuyển dụng nổi bật', 'Đừng bỏ lỡ những tin này!'],
        rows: [
          ['Vị trí trên trang', 'Dải trên', 'Dải dưới'],
          ['Bậc tin vào được', 'Basic Plus trở lên', 'Basic và Free'],
          ['Số thẻ', '30', '40'],
          ['Lưới trên máy tính', '3 cột', '4 cột'],
          ['Lọc theo', 'Từ khoá và bộ lọc của trang', 'Như dải trên'],
          ['Nhóm lên trước', 'Nhóm đang có nhiều tin nhất', 'Như dải trên'],
          ['Một công ty tối đa', '3 thẻ', '4 thẻ'],
          ['Xoay vòng', 'Theo chu kỳ đặt cho ô', 'Theo chu kỳ đặt cho ô'],
          ['Nút Xem thêm', 'Không có', 'Không có'],
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '2. Ba trang, một màn hình' },
      {
        kind: 'table',
        note: 'Ba trang dùng **cùng một màn hình**: cùng thanh tìm kiếm, cùng hai dải, cùng khối quảng cáo cuối trang. Khác nhau đúng một chỗ là **trục nhóm** của hai dải. Nhóm được **đếm sống** trên tin đang hiển thị, không phải danh sách cố định — một tỉnh nhỏ nhiều tin lên thì nhóm đó lên trước.',
        cols: ['Trang', 'Đường dẫn', 'Hai dải nhóm theo'],
        rows: [
          ['**Theo khu vực**', '`/viec-lam/dia-diem`', 'Tỉnh/TP đang có nhiều tin nhất'],
          ['**Theo ngành nghề**', '`/viec-lam/nganh-nghe`', 'Ngành nghề đang có nhiều tin nhất'],
          ['**Theo ngành**', '`/viec-lam/nganh`', 'Ngành của công ty đang có nhiều tin nhất'],
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '3. Job nào đủ điều kiện lên dải' },
      {
        kind: 'table',
        note: 'Job phải đạt **cả ba**. Rớt một điều kiện là không lên dải nào, dù job mới đăng đến đâu.',
        cols: ['Điều kiện', 'Nội dung'],
        rows: [
          ['1. Đang hiển thị bình thường', 'Job đang mở, đang bật hiển thị, còn trong hạn nhận hồ sơ. Công ty đang hoạt động và đã có mã số thuế'],
          ['2. Khớp từ khoá và bộ lọc', 'Theo đúng luật tìm kiếm thường. Chưa gõ, chưa lọc thì không loại job nào'],
          ['3. Bậc tin có bán ô của dải', 'Mỗi dải là **một ô riêng** trong Admin. Bậc tin đang chạy của job có bán ô nào thì job lên dải đó'],
        ],
      },
      {
        kind: 'list',
        items: [
          'Bậc đang chạy: bậc **cao nhất** job đang giữ, còn trong hạn.',
          'Hai dải **không giao nhau**. Một job chỉ ở một trong hai, không bao giờ ở cả hai.',
          'Ranh giới là **Basic Plus**: từ Basic Plus trở lên vào dải Nổi bật, Basic và Free vào dải Đừng bỏ lỡ. Ranh giới này do việc bậc nào bán ô nào quyết định, sửa được trong Admin.',
          'Product đã archive: job rớt khỏi cả hai dải, dù bậc còn hạn.',
          '**Không** mượn job của dải kia để lấp cho đủ số thẻ. Ít job đủ điều kiện thì hiện bấy nhiêu.',
          'Dải không còn job nào thì **ẩn hẳn** — không có tiêu đề trên một lưới trống.',
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '4. Xếp theo gì' },
      {
        kind: 'table',
        cols: ['#', 'Khoá xếp', 'Nghĩa'],
        rows: [
          ['1', '**Nhóm đông tin nhất**', 'Theo trục nhóm của trang — tỉnh, ngành nghề hoặc ngành đang có nhiều tin hiển thị nhất lên trước'],
          ['2', '**Bậc tin**', 'Bậc cao đứng trước bậc thấp, theo thang bậc kéo trong Admin'],
          ['3', '**Trải đều công ty**', 'Mỗi công ty một tin tốt nhất, rồi tới vòng hai'],
          ['4', '**Lần làm mới gần nhất**', 'Không phải ngày đăng, cũng không phải lần sửa tin'],
        ],
      },
      {
        kind: 'list',
        items: [
          'Hai dải dùng **cùng bốn khoá** này. Chỉ khác nhau ở chỗ bậc tin nào được vào.',
          'Menu sắp xếp của người dùng (VD *Lương cao nhất*) **không** đổi thứ tự hai dải. Nó chỉ đổi danh sách kết quả bên dưới.',
          'Hàng job được **chốt ở đầu mỗi chu kỳ**. Job làm mới giữa chu kỳ vào hàng từ chu kỳ sau — không cướp lượt của job đang chờ.',
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '5. Một công ty tối đa 10% số thẻ' },
      {
        kind: 'list',
        items: [
          'Trần là **10% số thẻ, làm tròn xuống**, và thấp nhất là 1 thẻ.',
          'VD: dải 30 thẻ → 3 thẻ một công ty. Dải 40 thẻ → 4 thẻ.',
          'Quá trần thì các thẻ tiếp theo của công ty đó **xuống sau mọi công ty khác**, chứ không bị bỏ ra khỏi dải.',
          '**Không để dải thiếu thẻ** vì luật này. Hết công ty khác thì một công ty vẫn lấp tiếp.',
        ],
      },
      {
        kind: 'warn',
        text: '**Trần không có nghĩa là thẻ của một công ty nằm cách xa nhau.** Bậc tin xếp **trước** việc trải đều công ty, nên một công ty đang giữ bậc cao hơn mọi công ty khác sẽ có cả 3 (hoặc 4) thẻ đứng liền nhau ở đầu dải — vẫn đúng trần. Hai công ty **cùng nhóm, cùng bậc** thì vẫn xen kẽ nhau bình thường: cái dải không làm được là rải **giữa các bậc** và **giữa các nhóm**. Muốn thẻ của họ nằm cách xa nhau thì phải **thu hẹp danh sách bậc tin được bán ô này**; trần 10% không làm được việc đó.',
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '6. Xoay vòng' },
      {
        kind: 'list',
        items: [
          'Toàn bộ job đủ điều kiện của dải xếp thành **một hàng**, theo đúng bốn khoá ở mục 4.',
          'Dải hiện **trang đầu** của hàng. Mỗi chu kỳ, dải lật sang **trang tiếp theo**.',
          'Đi hết hàng thì **quay lại đầu hàng**.',
          'Trong một vòng, **mỗi job đủ điều kiện lên đúng một lần** — kể cả job ở tỉnh ít tin.',
          'Mọi người mở trang **trong cùng một chu kỳ** đều thấy **cùng một danh sách**.',
          'Trong một trang đang hiện, bậc cao vẫn đứng trước bậc thấp, và trần một công ty vẫn giữ.',
          'Độ dài chu kỳ đặt riêng cho từng dải trong Admin. **Để trống thì dải không xoay vòng**: mọi lần tải ra đúng một danh sách, và job nằm sau thẻ cuối không bao giờ lên.',
        ],
      },
      {
        kind: 'example',
        heading: 'VD: dải 30 thẻ, 300 job đủ điều kiện, chu kỳ 5 phút',
        scenario: 'Ứng viên mở trang, rồi tải lại sau mỗi 5 phút.',
        cols: ['Lần tải', 'Dải hiện job nào'],
        rows: [
          ['Mở trang', 'Job 1–30'],
          ['Sau 5 phút', 'Job 31–60'],
          ['Sau 10 phút', 'Job 61–90'],
          ['…', '…'],
          ['Sau 45 phút', 'Job 271–300'],
          ['Sau 50 phút', 'Quay lại job 1–30'],
        ],
        note: 'Hàng 300 job, dải 30 thẻ → một vòng đúng **10 chu kỳ**, tức 50 phút. Hàng càng dài so với số thẻ thì một vòng càng lâu.',
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '7. Giao diện dải' },
      {
        kind: 'list',
        items: [
          'Dải là **một lưới tĩnh**: mọi thẻ hiện cùng lúc. Không tự chạy, không mũi tên, không bộ đếm slide.',
          'Trên máy tính: dải Nổi bật **3 cột**, dải Đừng bỏ lỡ **4 cột**. Màn hình hẹp hơn xuống 2 cột, rồi 1 cột.',
          '**Không có nút Xem thêm**, cũng không phân trang. Hết số thẻ là hết dải.',
          'Ứng viên đã đăng nhập: tiêu đề dải Đừng bỏ lỡ **gọi tên** họ — *“{tên} ơi, đừng bỏ lỡ những tin này!”*. Khách chưa đăng nhập thấy tiêu đề thường.',
          'Danh sách kết quả tìm kiếm chỉ hiện **sau khi bấm Tìm**, và nằm dưới hai dải.',
        ],
      },

      { kind: 'p', text: `*${STAMP_BOARD_STRIPS}*` },
    ],
  },
}

/* ────────────────────────────────────────────────────────────────────────────
 * Group page — the common model, written for the people who SELL these boxes.
 *
 * SAME CONTRACT AS THE PAGES UNDER IT, set by Thu on 2026-11-21 and widened to
 * this page on the same day: a USER GUIDE FOR THE CLIENT, not a requirement for
 * the dev, and now in the voice of /trang/top-search. The old version of this
 * page was the exception — a technical as-built page about the registry, full of
 * column names and API paths. That exception is GONE. No code identifiers, no
 * ticket codes, no decision markers, no gap statements, no production figures.
 *
 * SHAPE:
 *   1 Tóm lại
 *   2 Khách mua gì khi mua một ô
 *   3 Năm luật đúng với mọi ô
 *   4 Một công ty được giữ mấy thẻ trong một ô
 *   5 Xoay vòng — bao lâu thì tới lượt tin của khách
 *   6 Giống nhau chỗ nào, khác nhau chỗ nào
 *   7 Tra cứu nhanh: tin của khách đang ở đâu
 *   8 Bán được gì, và không hứa gì
 *   9 Các trang trong nhóm này
 *
 * THE THREE THINGS THU ASKED THIS PAGE TO SETTLE (2026-11-21): how the
 * same-company rules differ between placements, how rotation works, and what is
 * common to every placement against what is special to one.
 *
 * SOURCES, read from svn-be origin/dev on 2026-11-21 — keep them here:
 *   - PeriodicRotation: `rotate` (banners, company strips: one position per
 *     period), `spreadPage` (job bands: pool laid out per cycle, one page per
 *     period, each owner's items spaced (k+offset)/m, then runs broken),
 *     `spreadSlides` (Top search: one owner per slide of 4, best effort),
 *     `conveyorWindow` / `conveyorPeriods`.
 *   - PublicReadService.drawJobs / drawnOnPage / rotate, BandGrid.keep.
 *   - TopSearchCycle (STEP 4, frozen line, window), TopSearchLineService,
 *     PgTopSearchLineAdapter, V927.
 *   - JobBoardSection.companyCap = max(1, pageSize / 10) — the brief's "trong 1
 *     section 1 công ty ko chiếm quá 10% jobs"; TopCompaniesOrder.arrange (the
 *     cap outranks the spacing; over-cap postings drop behind every other
 *     employer's, they are not removed); EsGroupedSections.order for the ES side.
 *   - SearchService.searchSpreadingEmployers (header preview + top-companies
 *     strip reuse the same 10% rule).
 *   - ORDER_LATEST_ROUND: the Mới nhất list is newest day first, then employer
 *     rounds — every company's freshest posting of the day, then every
 *     company's second.
 *   - JobFeed on dev: COMPANY_CAP 3, COMPANY_GAP 6, ROW 6 (job alert + search),
 *     seed = (candidate, day, surface, anchor). These surfaces are NOT sold.
 *   - PlacementLoadService: the two mega-menu strips are replayed with no
 *     rotation; Top search is replayed off the frozen line.
 *
 * KEPT OUT OF THE PAGE, deliberately:
 *   - Counts of placement rows (47 / 28 / 19) and any production measurement.
 *     They date the page and sales does not sell by them.
 *   - That the strip asks the search for 8 cards in today's build while the
 *     agreed rule is 20 across 5 slides. A build gap belongs in the ticket.
 *   - The premium band on the search page ("The choice that sets you apart",
 *     12 postings after the third result): it is not a registry placement, and
 *     it has no page in this group yet.
 * ──────────────────────────────────────────────────────────────────────────── */

export const JOB_DISPLAY_MODULE_DOCS: Record<string, ModuleDoc> = {
  'Job display logic': {
    title: 'Logic hiển thị job — ô nào lấy tin nào, và mỗi công ty được mấy thẻ',
    lead:
      '**Tóm lại:** mọi chỗ hiện việc làm trên site ứng viên — dải trên trang chủ, dải trên trang kết quả tìm kiếm, dải trên các trang danh sách việc làm, banner — đều là **một ô có bán**. Khách mua một ô là mua **một suất trong hàng chờ của ô đó**, không phải mua một vị trí cố định.\n\nTrang này viết cho người đi bán: luật **chung cho mọi ô**, chỗ **khác nhau** giữa các ô, và hai câu khách hỏi nhiều nhất — *một công ty được chiếm mấy thẻ* và *bao lâu thì tin của tôi được hiện*.',
    headline: [
      '**Một ô hiển thị là một cái hộp trên một trang** — không phải một sản phẩm, không phải một tin. Tin vào ô khi bậc tin đang chạy của tin có bán ô đó, hoặc khi tin có add-on hiển thị.',
      '**Không ô nào bán vị trí.** Trong cùng một ô, mọi tin đã trả cùng một giá cho cùng một chỗ, nên thứ tự do luật của ô quyết định — không ai mua được chỗ đầu.',
      '**Mỗi ô có luật riêng về số thẻ một công ty được giữ**, và **không phải ô nào cũng xoay vòng**. Hai điều này là gốc của gần hết câu hỏi *“sao tin này không hiện”* — mục 4 và mục 5.',
    ],
    blocks: [
      {
        kind: 'p',
        text: 'Trang này nói phần **chung cho mọi ô**. Mỗi ô có trang riêng nói cách ô đó chọn và xếp tin — xem mục 9.\n\nBa câu hỏi trang này trả lời: tin vào ô bằng đường nào, một công ty được giữ mấy thẻ trong một ô, và bao lâu thì tới lượt tin của khách.',
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '1. Tóm lại' },
      {
        kind: 'table',
        cols: ['Hạng mục', 'Luật chung cho mọi ô'],
        rows: [
          ['Ô hiển thị là gì', 'Một hộp trên một trang. Trang chủ có 8 dải, trang kết quả tìm kiếm có dải Top search, các trang danh sách việc làm có 2 dải, ngoài ra là banner'],
          ['Tin vào ô bằng', 'Bậc tin đang chạy có bán ô đó, **hoặc** add-on hiển thị gắn vào tin'],
          ['Tính từ lúc', 'Đăng tin — không phải lúc chọn gói trên form'],
          ['Thiếu tin thì', 'Hiện ít thẻ hơn. **Không** lấy tin chưa mua ô vào cho đủ'],
          ['Thứ tự cơ bản', 'Tin làm mới gần nhất đứng trước'],
          ['Vị trí', 'Không bán riêng — không ai mua được chỗ đầu'],
          ['Một công ty giữ mấy thẻ', 'Mỗi ô một luật — mục 4'],
          ['Bao lâu đổi lượt', 'Ô có xoay vòng: 5 phút. Có ô không xoay vòng — mục 5'],
          ['Ai thấy gì', 'Cùng một thời điểm, mọi ứng viên thấy **cùng một danh sách**. Trừ các ô gợi ý theo hồ sơ'],
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '2. Khách mua gì khi mua một ô' },
      {
        kind: 'table',
        note: 'Hai đường **không giao nhau**: form product chỉ cho tick những ô bán qua bậc tin; ô banner chỉ vào được bằng đơn đặt chỗ.',
        cols: ['', 'Mua qua bậc tin', 'Mua thẳng khung thời gian'],
        rows: [
          ['Khách trả tiền cho', 'Một **bậc tin**, hoặc một **add-on hiển thị**', 'Một **ô banner trong một khoảng ngày**'],
          ['Tin vào ô vì', 'Gói của tin **có tick** ô đó', 'Có một **đơn đặt chỗ đã duyệt** trên ô đó'],
          ['Dùng cho', 'Các dải thẻ việc làm', 'Banner và popup'],
          ['Nhiều khách cùng lúc', 'Bao nhiêu tin mua cũng được — ô chỉ hiện đủ số thẻ của nó, phần còn lại xếp hàng', 'Giới hạn bằng số chỗ đặt cùng lúc của ô'],
        ],
      },
      {
        kind: 'list',
        heading: '2a · Bốn điều hay bị hiểu nhầm',
        items: [
          'Mua ô **không phải** mua chỗ. Mua ô là **được xếp vào hàng** của ô đó.',
          'Dải cùng tên ở trang khác là **ô khác**. Dải trên trang chủ và dải cùng tên ở trang Việc làm Hàn Quốc / nước ngoài phải **tick riêng từng ô**.',
          'Một bậc tin thường bán **một dải**. Muốn tin có mặt ở thêm dải thì mua **add-on hiển thị**, không cần đổi bậc.',
          'Có ô chỉ bán **N ngày đầu**. Hết số ngày đó tin rời ô, nhưng tin **vẫn đăng bình thường** ở mọi chỗ khác.',
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '3. Năm luật đúng với mọi ô' },
      {
        kind: 'list',
        items: [
          '**Tin phải đang hiển thị bình thường**: tin đang mở, đang bật hiển thị, chưa hết hạn; công ty đang hoạt động và đã có mã số thuế. Rớt một điều là không vào ô nào cả.',
          '**Tin phải đã mua đúng ô đó** — qua bậc tin đang chạy, hoặc qua add-on hiển thị. Bậc đang chạy là bậc **cao nhất** tin đang giữ và còn trong hạn.',
          '**Không lấp chỗ.** Ô thiếu tin thì hiện ít thẻ hơn; dải trên trang chủ không còn tin nào thì trang **ẩn luôn dải**. Không bao giờ lấy tin chưa mua ô vào cho đủ.',
          '**Thứ tự không bốc thăm theo từng người.** Cùng một thời điểm, hai ứng viên mở cùng một trang thấy **cùng một danh sách** — nên khách báo gì cũng tra lại được.',
          '**Làm mới tin là cách duy nhất tự đẩy tin lên đầu hàng** ở những ô xếp theo lần làm mới. Không phải ngày đăng, và sửa nội dung tin **không** tính.',
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '4. Một công ty được giữ mấy thẻ trong một ô' },
      {
        kind: 'p',
        text: 'Đây là chỗ mỗi ô làm một kiểu. Luật sinh ra để **một công ty nhiều tin không chiếm hết một ô**, nhưng mỗi ô cân giữa *rải đều* và *không để trống* theo một cách khác nhau.',
      },
      {
        kind: 'table',
        note: 'VD luật 10%: dải 40 thẻ → mỗi công ty nhiều nhất **4 thẻ**; dải 15 thẻ → **1 thẻ**. VD Top search: 20 thẻ chia 5 slide → một công ty nhiều nhất **5 thẻ**, mỗi slide một thẻ.\n\nDanh sách kết quả tìm kiếm để mặc định ở *Đề xuất* — bậc tin trước, rồi độ khớp từ khoá, rồi lần làm mới — và ở chế độ đó **không có luật công ty nào**. Cách xếp theo vòng trong bảng là của lựa chọn *Mới nhất*.\n\n**Riêng hai dải trên trang danh sách việc làm: 10% là trần, không phải lệnh rải đều.** Dải xếp theo **bậc tin trước**, luật công ty mới tính sau — nên một công ty giữ bậc cao hơn mọi công ty khác có thể đứng **liền nhau ngay đầu dải**, đủ số thẻ trần của mình, mà vẫn đúng luật. Hai công ty **cùng một nhóm và cùng bậc** thì vẫn xen kẽ nhau bình thường — nhóm ở đây là tỉnh, ngành nghề hay lĩnh vực, tuỳ trang đang mở. Cái dải **không** làm được là rải **giữa các bậc** và **giữa các nhóm**. Muốn thật sự rải ra thì phải **thu hẹp những bậc tin bán hai dải này**, chứ luật công ty không làm thay được.',
        cols: ['Ô hiển thị', 'Một công ty được giữ', 'Khi không đủ công ty để chia'],
        rows: [
          ['**Top search** — đầu trang kết quả tìm kiếm', 'Nhiều nhất **1 thẻ trong mỗi slide 4 thẻ**', 'Rải xa nhất có thể, rồi vẫn lấp cho đủ — không để slide thiếu thẻ'],
          ['**8 dải trang chủ · Hàn Quốc · nước ngoài**', '**Không có trần.** Tin của một công ty được **rải đều cả hàng**, hai tin cùng công ty không đứng cạnh nhau', 'Còn công ty khác thì kéo lên chen vào; hết công ty khác thì chấp nhận đứng cạnh nhau'],
          ['**Trending jobs · Don’t miss these jobs** — các trang danh sách việc làm', 'Nhiều nhất **10% số thẻ của dải**, làm tròn xuống, ít nhất 1 thẻ', 'Tin vượt trần **tụt xuống sau** tin của mọi công ty khác — không bị loại ra khỏi dải'],
          ['**Gợi ý nhanh dưới thanh tìm kiếm** và dải **Công ty hàng đầu**', 'Cũng **10%**, **và** hai thẻ đứng cạnh nhau không cùng một công ty khi còn công ty khác để xếp', 'Hết công ty khác thì mới chấp nhận đứng cạnh nhau'],
          ['**Danh sách kết quả tìm kiếm**, sắp xếp *Mới nhất*', 'Không có trần. Xếp **theo vòng**: tin mới nhất trong ngày của **mỗi** công ty trước, hết một lượt mới tới tin thứ hai của từng công ty', 'Không cần — cách xếp này tự cân'],
          ['**Việc làm gợi ý theo hồ sơ** *(không bán)*', 'Nhiều nhất **3 tin một công ty**, và hai tin cùng công ty cách nhau **ít nhất 6 vị trí**', 'Hết công ty khác thì vẫn lấp cho đủ thẻ'],
        ],
      },
      {
        kind: 'list',
        heading: '4a · Khi một công ty nắm phần lớn kho tin của ô',
        items: [
          'Luật công ty là **cố gắng tối đa**, không phải lời hứa tuyệt đối. Khi một công ty nắm phần lớn số tin đủ điều kiện của ô thì **không có cách xếp nào** vừa giữ được luật vừa không để chỗ trống.',
          'Khi đó ô **giữ đủ thẻ trước**: rải xa nhất có thể, chứ không bỏ bớt tin ra khỏi ô và không để ô thiếu thẻ.',
          'VD: một slide cần 4 công ty khác nhau, kho chỉ còn 2 công ty → slide vẫn đủ 4 thẻ, và có công ty xuất hiện hai lần.',
          '**Hệ quả phải nói trước với khách:** luật chia lượt **theo công ty**, không theo số tin. Công ty mua **nhiều tin** trong cùng một ô thì **mỗi tin** tới lượt **thưa hơn** tin của công ty chỉ mua một. Mua thêm tin là mua thêm **chỗ trong hàng**, không nhân lên số lượt hiện của từng tin.',
        ],
      },
      {
        kind: 'example',
        heading: 'VD: hai khách cùng nằm trong dải Top search',
        scenario: 'Dải 20 thẻ chia 5 slide, mỗi slide tối đa 1 thẻ của một công ty. Công ty A có 40 tin đủ điều kiện, công ty B có 2 tin.',
        cols: ['', 'Công ty A — 40 tin', 'Công ty B — 2 tin'],
        rows: [
          ['Luật áp vào', 'Mỗi slide nhiều nhất 1 thẻ của A', 'Mỗi slide nhiều nhất 1 thẻ của B'],
          ['Trên một màn hình 20 thẻ', 'Nhiều nhất **5 thẻ**', 'Cả **2 tin** đều có chỗ'],
          ['Mỗi tin tới lượt', '**Thưa** — 40 tin chia nhau 5 chỗ', '**Gần như mọi lượt**'],
        ],
        note: 'Cả hai khách đều được đối xử đúng luật. Nhưng khách A sẽ tự so và thấy mỗi tin của mình ít lượt hơn — nói trước, đừng để khách phát hiện sau.',
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '5. Xoay vòng — bao lâu thì tới lượt tin của khách' },
      {
        kind: 'p',
        text: '**Xoay vòng là gì:** một ô chỉ hiện được vài chục thẻ, nhưng có thể có hàng trăm tin đã mua ô đó. Thay vì luôn hiện mấy tin đầu hàng, ô **đổi sang nhóm tin tiếp theo** sau mỗi nhịp. Đi hết một vòng thì **mọi tin trong hàng đều đã được hiện**.',
      },
      {
        kind: 'table',
        cols: ['Ô hiển thị', 'Có xoay vòng', 'Mỗi nhịp đổi gì'],
        rows: [
          ['**8 dải trang chủ · Hàn Quốc · nước ngoài**', 'Có — **5 phút**', 'Lật sang nhóm tin tiếp theo trong hàng; hết hàng thì quay lại đầu'],
          ['**Top search**', 'Có — **5 phút**', 'Hàng tịnh tiến **4 tin**: slide 2 lên slide 1, 4 tin kế tiếp vào slide cuối'],
          ['**Banner**', 'Có — theo nhịp đặt trên từng ô', 'Dịch **1 vị trí**: banner thứ hai lên đầu'],
          ['**Trending jobs · Don’t miss these jobs**', '**Không**', 'Thứ tự chỉ đổi khi có tin được làm mới, hoặc có tin mới mua dải'],
          ['**Danh sách kết quả tìm kiếm**', '**Không**', 'Như trên'],
          ['**Việc làm gợi ý theo hồ sơ** *(không bán)*', 'Đổi **mỗi ngày**', 'Mỗi ứng viên một thứ tự riêng, giữ nguyên trong ngày'],
        ],
      },
      {
        kind: 'list',
        items: [
          '**Một vòng dài bao lâu = số tin trong hàng ÷ số tin đổi mỗi nhịp × nhịp.** VD dải 30 thẻ đang có 80 tin → 3 nhịp là hết một vòng, tức **15 phút**.',
          'Ô càng bán được nhiều tin thì vòng càng dài. Đây là câu trả lời thật cho *“bao lâu tin tôi được hiện”*: **mỗi vòng một lần**, chứ không phải lúc nào cũng có mặt.',
          'Nhịp đặt trên **từng ô**, người vận hành sửa được, không cần dev.',
          'Ô **không xoay vòng** thì tin nằm ngoài số thẻ đầu hàng **không được hiện** cho tới khi hàng đổi — hàng chỉ đổi khi có tin được làm mới hoặc có tin mới mua dải. Với hai dải trên trang danh sách việc làm, hôm nay là như vậy: thứ tự ở đó do bậc tin và lần làm mới quyết định.',
          'Top search **chốt hàng ở đầu mỗi vòng**: tin đăng hoặc làm mới giữa vòng vào hàng từ **vòng sau**, để tin đang chờ không bị cướp lượt.',
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '6. Giống nhau chỗ nào, khác nhau chỗ nào' },
      {
        kind: 'table',
        note: '**Giống nhau:** điều kiện tin được hiển thị, cách tin vào ô, không lấp chỗ, và cùng một thời điểm mọi người thấy như nhau. **Khác nhau** đúng bốn cột bên phải — và gần hết câu hỏi *“sao tin này không hiện”* nằm ở một trong bốn cột đó.',
        cols: ['Ô hiển thị', 'Lấy tin từ đâu', 'Đọc từ khoá ứng viên gõ', 'Thứ tự', 'Xoay vòng'],
        rows: [
          ['**8 dải trang chủ · Hàn Quốc · nước ngoài**', 'Kho tin đã mua đúng ô đó', 'Không', 'Làm mới gần nhất', 'Có'],
          ['**Top search**', 'Ô tìm kiếm, lọc trong các tin đã mua ô', '**Có**', 'Làm mới gần nhất', 'Có'],
          ['**Trending jobs · Don’t miss these jobs**', 'Ô tìm kiếm của trang danh sách việc làm', '**Có** — theo trang đang mở', 'Tin vượt trần công ty xuống cuối, rồi nhóm đông tin nhất, rồi bậc tin, rồi rải công ty, rồi làm mới', 'Không'],
          ['**Banner · popup**', 'Đơn đặt chỗ đã duyệt', 'Không', 'Theo nhịp của ô', 'Có'],
          ['**Việc làm gợi ý theo hồ sơ** *(không bán)*', 'Toàn bộ tin đang mở, chấm theo hồ sơ ứng viên', 'Không', 'Điểm phù hợp', 'Đổi mỗi ngày'],
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '7. Tra cứu nhanh: tin của khách đang ở đâu' },
      {
        kind: 'p',
        text: '**Product settings → Placement load** trong Admin dựng lại từng ô đúng như site đang hiện, rồi xếp mọi tin đủ điều kiện vào bốn nhóm. Đây là chỗ nhanh nhất để trả lời khách.',
      },
      {
        kind: 'table',
        note: 'Số liệu ở đây dựng theo **một lượt xem không từ khoá, không bộ lọc**. Với các ô có đọc từ khoá, đó là **trần trên**: một lượt tìm kiếm thật bao giờ cũng ít tin tranh nhau hơn.',
        cols: ['Nhóm', 'Nghĩa', 'Nói với khách'],
        rows: [
          ['**Showing now**', 'Ô đang hiện tin này ngay lúc này', '*Tin đang hiện*'],
          ['**Waiting for a turn**', 'Tin sẽ tới lượt ở một nhịp sau', '*Tin đang trong hàng, tới lượt trong vòng này*'],
          ['**Never shown**', 'Tin đủ điều kiện nhưng ô không xoay vòng nên chưa tới lượt', 'Chỉ gặp ở hai dải trang danh sách việc làm. **Không phải lỗi** — ô đó không xoay vòng'],
          ['**Empty slot**', 'Ô còn chỗ trống vì chưa đủ tin', '*Ô này còn chỗ bán*'],
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '8. Bán được gì, và không hứa gì' },
      {
        kind: 'table',
        cols: ['Hứa được', 'Không hứa'],
        rows: [
          ['Tin sẽ vào hàng của đúng ô đã mua', 'Tin luôn nằm ở thẻ đầu, hay ở slide 1'],
          ['Ô có xoay vòng: mỗi vòng tin đều tới lượt', 'Tin lúc nào cũng có mặt trên màn hình'],
          ['Cùng một thời điểm, mọi ứng viên thấy như nhau', 'Thứ tự riêng cho từng ứng viên'],
          ['Làm mới tin đưa tin lên đầu hàng', 'Trả thêm tiền để chen lên trước trong cùng một ô'],
          ['Mua add-on hiển thị để có mặt ở thêm ô', 'Mua nhiều tin thì mỗi tin được hiện nhiều hơn'],
          ['Số thẻ và nhịp của ô sửa được, không cần dev', 'Tin lên ô ngay khi ký — phải **đăng tin** trước'],
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '9. Các trang trong nhóm này' },
      {
        kind: 'table',
        note: 'Trang này nói phần **chung cho mọi ô**. Mỗi trang bên dưới nói cách một ô **chọn và xếp tin** của riêng nó.',
        cols: ['Ô', 'Ở đâu trên site', 'Trang riêng'],
        rows: [
          ['**Top search**', 'Dải thẻ trên đầu trang kết quả tìm kiếm', '`/trang/top-search`'],
          ['**8 dải trang chủ · Hàn Quốc · nước ngoài**', 'Việc làm Premium · Top Việc Làm Hấp Dẫn · Việc làm Tiêu Điểm · Việc Làm Mới Nhất · Mạng Lưới Việc Làm …', '`/trang/home-job-bands`'],
          ['**Trending jobs · Don’t miss these jobs**', 'Hai dải trên các trang danh sách việc làm trong mega menu', '`/trang/board-strips`'],
          ['**Banner và popup**', 'Trang chủ, trang công ty, trang cá nhân, trang đăng nhập', '*xem nhóm Content*'],
        ],
      },

      { kind: 'p', text: `*${STAMP_GROUP}*` },
    ],
  },
}
