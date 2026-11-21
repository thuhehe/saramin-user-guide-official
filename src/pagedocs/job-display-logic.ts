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
 *   4 Xếp hàng — và vì sao bậc tin không còn xếp thứ tự
 *   5 Cắt hàng thành lượt: chia bài, không cắt khúc
 *   6 Trần 10% và luật không đứng cạnh nhau
 *   7 Cứ 5 phút đổi cả cụm
 *   8 Mỗi tin được hiện bao lâu một lần
 *   9 Giao diện
 *
 * WHICH RULES THESE PAGES STATE. Thu settled this on 2026-11-21: the pages
 * state THE RULES WE WANT — the agreed target — not the behaviour deployed
 * today. So a page may describe something the build has not caught up with,
 * and that is correct, not a bug in the page. It still names no gap (see the
 * list above): the client reads one set of rules, stated plainly, and the
 * distance to today's build lives in the ticket.
 *
 * SECTIONS 4-8 WERE REDESIGNED ON 2026-11-21 (Thu's brief, from SRM-1742 plus
 * four wants: company ≤10%, never adjacent, whole-batch swap every 5 min, equal
 * exposure). Three moves, and each one is load-bearing:
 *   - TIER LEFT THE SORT KEYS. It only gates WHICH strip a posting may enter.
 *     This is the precondition for the other two: while tier sorts first, a
 *     company on the top rung has its 3 cards dragged adjacent to the head of
 *     the strip — inside the 10% cap and still wrong. Thu reached the same
 *     conclusion independently ("nếu muốn rotate thì ko cần posting ladder").
 *   - DEAL, DON'T SLICE. Rounds are dealt round-robin off the queue, not cut
 *     from it in consecutive blocks. Same-company postings cluster in the
 *     queue because they are published in one batch; dealing is what pulls a
 *     cluster apart, and it treats the cause rather than the symptom.
 *   - FREQUENCY REPLACED RANK as what a product buys. Cycle length =
 *     (pool ÷ cards) × 5 min, so narrowing which rungs sell a slot is now the
 *     only lever that makes a posting appear more often. That is the sales
 *     story once everyone is guaranteed a turn.
 * ONE TRADE-OFF IS STILL THU'S TO SETTLE and the page currently takes the
 * first option: the group key ("nhóm đông tin nhất") keeps big provinces at
 * the top of every round, so a posting in a small province gets equal AIRTIME
 * but never the top slot. Strict slot-equality would mean dropping the group
 * key. Asked 2026-11-21; if Thu picks slot-equality, section 4 key 1 goes and
 * section 8's "Đổi chỗ giữa các vòng" widens from within-group to whole-strip.
 *
 * KEPT OUT OF THE BOARD STRIPS PAGE, same reasons — they belong to the ticket:
 *   - the band split is enforced by WHICH product ticks which area, not by a
 *     rung test in code, so "Basic Plus trở lên" is a configuration the page
 *     states as a rule and the ticket has to keep true
 *   - today the two areas are cut at items_shown with no rotation at all, tier
 *     still sorts, and the cap only demotes; the page states the target rules
 *     without naming any of that
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
          ['Một công ty tối đa', '3 thẻ mỗi lượt', '4 thẻ mỗi lượt'],
          ['Bậc tin xếp thứ tự', 'Không — chỉ quyết định ai vào dải', 'Không — chỉ quyết định ai vào dải'],
          ['Xoay vòng', 'Đổi cả 30 thẻ mỗi 5 phút', 'Đổi cả 40 thẻ mỗi 5 phút'],
          ['Một vòng', 'Tới khi mọi tin đã lên đúng một lần', 'Như dải trên'],
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
      { kind: 'h', text: '4. Xếp hàng — và vì sao bậc tin không còn xếp thứ tự' },
      {
        kind: 'table',
        note: 'Hàng này **không phải thứ tự trên màn hình**. Nó là thứ tự **xếp hàng**: đứng đâu trong hàng quyết định job rơi vào lượt nào và nằm chỗ nào trong lượt đó. Mục 5 nói cách cắt hàng thành các lượt.',
        cols: ['#', 'Khoá xếp hàng', 'Nghĩa'],
        rows: [
          ['1', '**Nhóm đông tin nhất**', 'Theo trục nhóm của trang — tỉnh, ngành nghề hoặc ngành đang có nhiều tin hiển thị nhất đứng trước'],
          ['2', '**Lần làm mới gần nhất**', 'Không phải ngày đăng, cũng không phải lần sửa tin'],
          ['3', '*Mã tin*', 'Chỉ để hai tin làm mới cùng một giây không đảo chỗ ngẫu nhiên giữa các lần tải'],
        ],
      },
      {
        kind: 'list',
        heading: 'Bậc tin đã rời khỏi danh sách khoá xếp',
        items: [
          'Bậc tin chỉ còn **một việc duy nhất**: quyết định job vào được dải nào (mục 3). Vào được rồi thì mọi job trong dải xếp hàng như nhau — Premium và Basic Plus đứng chung một hàng, không ai được ưu tiên.',
          'Đây không phải chuyện bỏ bớt cho gọn. **Giữ bậc tin làm khoá xếp thì luật không đứng cạnh nhau không chạy được**: một công ty đang giữ bậc cao hơn mọi công ty khác sẽ bị bậc kéo cả 3 thẻ lên đầu dải, đứng liền nhau — vẫn đúng trần 10% nhưng sai luật khoảng cách. Bỏ bậc khỏi khoá xếp là **điều kiện cần** để hai luật ở mục 6 làm được việc.',
          'Cái khách mua bằng bậc cao không còn là *đứng trước*, mà là **được vào ô mà ít tin vào được**. Bể càng ít tin thì vòng càng ngắn, tin càng được hiện thường xuyên — mục 8 có con số.',
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '5. Cắt hàng thành lượt: chia bài, không cắt khúc' },
      {
        kind: 'p',
        text: 'Dải chỉ có **30 thẻ** (Nổi bật) hoặc **40 thẻ** (Đừng bỏ lỡ), trong khi hàng có thể dài vài trăm tin. Hàng được cắt thành nhiều **lượt**, mỗi lượt đúng bằng số thẻ của dải, và cứ 5 phút dải đổi sang lượt kế tiếp.\n\nCách cắt là chỗ quan trọng nhất của trang này, vì nó quyết định luôn hai luật ở mục 6.',
      },
      {
        kind: 'table',
        note: 'Lý do phải chia bài: tin của cùng một công ty thường được **đăng hàng loạt trong một lần**, nên trong hàng xếp theo lần làm mới chúng nằm sát nhau. Cắt khúc giữ nguyên cụm đó; chia bài tách cụm ra.',
        cols: ['Cách cắt', 'Làm gì', 'Kết quả'],
        rows: [
          ['**Cắt khúc** — không dùng', 'Lượt 1 lấy 30 tin đầu hàng, lượt 2 lấy 30 tin tiếp theo, cứ thế', 'Một công ty đăng 12 tin cùng lúc thì cả 12 rơi vào đúng một lượt'],
          ['**Chia bài** — dùng cách này', 'Tin thứ 1 về lượt 1, tin thứ 2 về lượt 2, … hết lượt cuối thì quay lại lượt 1', 'Cụm 12 tin đó rải đều ra khắp các lượt, mỗi lượt 1–2 thẻ'],
        ],
      },
      {
        kind: 'list',
        items: [
          'Số lượt của một vòng = **số tin trong hàng chia cho số thẻ của dải**, làm tròn lên.',
          'Trong một lượt, các thẻ giữ **đúng thứ tự hàng**. Nhóm đông tin nhất vẫn nằm trên.',
          'Vì chia bài lấy đều khắp hàng nên **mỗi lượt có cùng tỉ lệ nhóm như cả hàng**. Không có lượt nào toàn tỉnh lớn, cũng không có lượt nào toàn tỉnh nhỏ.',
        ],
      },
      {
        kind: 'example',
        heading: 'VD: một công ty đăng 12 tin cùng một buổi',
        scenario: 'Dải Nổi bật 30 thẻ, hàng có 300 tin đủ điều kiện → 10 lượt một vòng. Công ty FPT đăng 12 tin liền nhau, nên 12 tin này nằm sát nhau ở vị trí 41–52 trong hàng.',
        cols: ['Cách cắt', '12 tin của FPT rơi vào đâu', 'Lượt đông nhất có mấy thẻ FPT'],
        rows: [
          ['Cắt khúc', 'Cả 12 tin nằm gọn trong lượt 2 (tin 31–60)', '**12 thẻ** — chiếm 40% dải'],
          ['Chia bài', 'Lượt 1 và lượt 2 mỗi lượt 2 tin, 8 lượt còn lại mỗi lượt 1 tin', '**2 thẻ** — dưới trần 3 thẻ'],
        ],
        note: 'Chia bài xử lý đúng nguyên nhân: nó không cần biết công ty nào đang đông tin, chỉ cần biết tin đăng cùng lúc thì nằm cạnh nhau trong hàng.',
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '6. Trần 10% và luật không đứng cạnh nhau' },
      {
        kind: 'table',
        note: 'Hai luật này **khác nhau**: trần nói *bao nhiêu thẻ*, luật khoảng cách nói *đứng ở đâu*. Phải có cả hai, vì 3 thẻ đứng liền nhau vẫn đúng trần.',
        cols: ['Luật', 'Nội dung'],
        rows: [
          ['**Trần một công ty**', 'Trong **một lượt**, một công ty tối đa **10% số thẻ**, làm tròn xuống, thấp nhất 1 thẻ. Dải 30 thẻ → 3 thẻ. Dải 40 thẻ → 4 thẻ'],
          ['**Giữ trần ngay lúc chia bài**', 'Đang chia bài mà lượt sắp tới đã đủ trần cho công ty đó thì **bỏ qua lượt đó**, đưa tin sang lượt kế tiếp còn chỗ'],
          ['**Không đứng cạnh nhau**', 'Trong một lượt, **không bao giờ xếp hai thẻ cùng công ty liền nhau**. Xếp lần lượt: mỗi bước lấy thẻ của công ty đang còn nhiều thẻ nhất trong lượt đó, và không trùng công ty với thẻ vừa đặt'],
        ],
      },
      {
        kind: 'list',
        items: [
          'Luật không đứng cạnh nhau **chỉ chạy được khi bậc tin không còn xếp thứ tự** (mục 4). Còn bậc xếp trước thì thẻ cùng công ty bị bậc kéo về sát nhau, không tách ra được.',
          'Công ty có nhiều tin hơn **số lượt nhân trần** thì phần dư không lên trong vòng này mà chờ vòng sau — và vòng sau **đổi sang những tin khác** của công ty đó, để trong nội bộ một công ty các tin cũng được chia lượt đều nhau.',
          'Trường hợp đó chỉ xảy ra khi một công ty giữ **hơn 10% toàn bộ tin đủ điều kiện** của trang. Trên trang tỉnh lớn gần như không gặp; trên trang ngành hẹp thì có thể.',
          'Trần là **luật cứng**: thiếu công ty khác thì dải **hiện ít thẻ hơn**, chứ không nới trần để lấp cho đầy và cũng không mượn tin của dải kia.',
          'Luật khoảng cách cũng **cứng**, và nó giữ được là **nhờ có trần**: khi không công ty nào quá 10% số thẻ thì **luôn tồn tại** một cách xếp không có hai thẻ cùng công ty liền nhau. Đây là lý do hai luật ở mục này phải đi với nhau — bỏ trần thì luật khoảng cách thành lời hứa không giữ nổi.',
          'Ngoại lệ duy nhất là **bể quá mỏng**: ít tin tới mức một công ty chiếm hơn nửa số thẻ xếp được. Khi đó dải **bớt thẻ xuống** cho tới khi xếp được, chứ không đặt hai thẻ cùng công ty cạnh nhau.',
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '7. Cứ 5 phút đổi cả cụm' },
      {
        kind: 'list',
        items: [
          'Hết 5 phút, dải chuyển sang lượt kế tiếp và **thay toàn bộ thẻ một lúc**. Không tịnh tiến từng tin, không đẩy một thẻ vào rồi bỏ một thẻ ra.',
          'Trong 5 phút đó dải vẫn là **lưới tĩnh**: không tự chạy, không mũi tên, không bộ đếm. Ứng viên thấy cụm mới khi tải lại trang ở chu kỳ sau.',
          'Mọi người mở trang **trong cùng một chu kỳ 5 phút** đều thấy **cùng một lượt**, cùng thứ tự.',
          'Đi hết lượt cuối là **hết một vòng**. Hệ thống chia bài lại từ bể tin **tại thời điểm đó** — tin mới vào bể, tin hết hạn rời bể.',
          'Trong một vòng, **mỗi tin đủ điều kiện lên đúng một lần** — kể cả tin ở tỉnh ít việc, kể cả tin ở bậc thấp nhất của dải.',
        ],
      },
      {
        kind: 'table',
        note: 'Làm mới tin **không** cho tin lên hai lần trong một vòng. Nó chỉ rút ngắn thời gian chờ tới lượt của tin.',
        cols: ['Tin được làm mới lúc', 'Chuyện gì xảy ra'],
        rows: [
          ['Chưa lên trong vòng này', 'Tin nhảy lên đầu phần hàng còn lại → lên ở **một trong vài lượt gần nhất kế tiếp**, không phải chờ hết vòng'],
          ['Đã lên rồi trong vòng này', 'Tin **chờ vòng sau**, và ở vòng sau nó nằm trong nhóm đầu hàng'],
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '8. Mỗi tin được hiện bao lâu một lần' },
      {
        kind: 'p',
        text: 'Khi mọi tin đều chắc chắn được lên, cái phân biệt tin này với tin kia không còn là **thứ hạng** mà là **tần suất**. Con số đó tính được:\n\n**Một vòng = (số tin đủ điều kiện ÷ số thẻ của dải) × 5 phút**\n\nMỗi tin lên **5 phút mỗi vòng**. Bể càng đông thì vòng càng dài, tin càng ít được hiện.',
      },
      {
        kind: 'table',
        note: 'Tính cho dải **Tin tuyển dụng nổi bật**: 30 thẻ, chu kỳ 5 phút. Dải **Đừng bỏ lỡ** có 40 thẻ nên với cùng số tin thì vòng ngắn hơn khoảng một phần tư.',
        cols: ['Tin đủ điều kiện', 'Số lượt', 'Một vòng', 'Mỗi tin được hiện'],
        rows: [
          ['60', '2', '10 phút', '5 phút mỗi 10 phút'],
          ['150', '5', '25 phút', '5 phút mỗi 25 phút'],
          ['300', '10', '50 phút', '5 phút mỗi 50 phút'],
          ['900', '30', '2 giờ 30 phút', '5 phút mỗi 2 tiếng rưỡi'],
          ['3.000', '100', '8 giờ 20 phút', '5 phút mỗi hơn 8 tiếng'],
        ],
      },
      {
        kind: 'list',
        heading: 'Muốn tin được hiện thường xuyên hơn thì làm gì',
        items: [
          '**Thu hẹp bể**: bớt số bậc tin được bán ô này. Ít tin vào được thì vòng ngắn lại cho tất cả những tin đã vào. Đây là đòn bẩy mạnh nhất, và là chỗ bậc tin còn giá trị bán được.',
          '**Tăng số thẻ** của dải trong Admin. Nhưng tăng số thẻ là tăng luôn trần một công ty, vì trần là 10% số thẻ.',
          'Rút ngắn chu kỳ 5 phút thì **không** ăn thua: cả vòng chạy nhanh hơn nhưng mỗi tin vẫn chỉ lên một lượt mỗi vòng, và lượt đó ngắn lại đúng bằng phần rút.',
        ],
      },
      {
        kind: 'list',
        heading: 'Đổi chỗ giữa các vòng',
        items: [
          'Mỗi vòng mới, điểm bắt đầu chia bài **dịch đi một bước**, để một tin không phải vòng nào cũng rơi đúng vào lượt đó và đúng chỗ đó trong lượt.',
          'Trong phạm vi nhóm của mình, mọi tin đều có vòng được đứng **đầu khối nhóm** đó.',
          'Nghiệm thu: theo dõi 10 vòng liên tiếp của một dải, không tin nào nằm nguyên một vị trí qua cả 10 vòng.',
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '9. Giao diện dải' },
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
 * THE PAGE STATES THE AGREED RULE, NOT TODAY'S BUILD (Thu, 2026-11-21: "user
 * guide là requirement, cái tôi muốn, ko phải cái thật sự build"). Where the
 * two differ the page is ahead on purpose — do NOT edit it back to match code,
 * and do not add a line saying the build differs. The gap belongs in the ticket.
 * The two mega-menu strips are the live case: they rotate on this page because
 * that is the rule Thu signed off on 2026-11-21, while the build still replays
 * them unrotated.
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
      '**Mỗi ô có luật riêng về số thẻ một công ty được giữ**, và **vòng của mỗi ô dài ngắn khác nhau**. Hai điều này là gốc của gần hết câu hỏi *“sao tin này không hiện”* — mục 4 và mục 5.',
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
          ['Thứ tự cơ bản', 'Mỗi ô một kiểu — mục 6. Điểm chung: **bậc tin quyết định tin vào được ô nào, không quyết định tin đứng thứ mấy** ở các dải, slide và banner. Riêng **danh sách kết quả tìm kiếm** ở chế độ mặc định *Đề xuất* thì bậc tin xếp trước'],
          ['Vị trí', 'Không bán riêng — không ai mua được chỗ đầu'],
          ['Một công ty giữ mấy thẻ', 'Mỗi ô một luật — mục 4'],
          ['Bao lâu đổi lượt', 'Ô thẻ việc làm: **5 phút** một lượt. Banner theo nhịp riêng của từng ô — mục 5'],
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
        heading: '2a · Năm điều hay bị hiểu nhầm',
        items: [
          'Mua ô **không phải** mua chỗ. Mua ô là **được xếp vào hàng** của ô đó.',
          'Dải cùng tên ở trang khác là **ô khác**. Dải trên trang chủ và dải cùng tên ở trang Việc làm Hàn Quốc / nước ngoài phải **tick riêng từng ô**.',
          'Một bậc tin thường bán **một dải**. Muốn tin có mặt ở thêm dải thì mua **add-on hiển thị**, không cần đổi bậc.',
          'Có ô chỉ bán **N ngày đầu**. Hết số ngày đó tin rời ô, nhưng tin **vẫn đăng bình thường** ở mọi chỗ khác.',
          'Ở **hai dải trang danh sách việc làm**, khách **không mua thứ hạng** — mọi tin trong dải đều chắc chắn được lên. Cái khách mua là **tần suất**: bậc cao vào được ô ít tin hơn, ô càng ít tin thì vòng càng ngắn và tin càng được hiện thường xuyên.',
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '3. Năm luật đúng với mọi ô' },
      {
        kind: 'list',
        items: [
          '**Tin phải đang hiển thị bình thường**: tin đang mở, đang bật hiển thị, chưa hết hạn; công ty đang hoạt động và đã có mã số thuế. Rớt một điều là không vào ô nào cả.',
          '**Tin phải đã mua đúng ô đó** — qua bậc tin đang chạy, hoặc qua add-on hiển thị. Bậc đang chạy là bậc **cao nhất** tin đang giữ và còn trong hạn. Bậc tin quyết định tin **vào được ô nào**; ở các ô hiển thị — dải, slide, banner — bậc **không** quyết định tin đứng thứ mấy, thứ tự ở đó do luật riêng của từng ô. **Ngoại lệ duy nhất: danh sách kết quả tìm kiếm** ở chế độ mặc định *Đề xuất*, nơi bậc tin xếp trước, rồi tới độ khớp từ khoá và lần làm mới.',
          '**Không lấp chỗ.** Ô thiếu tin thì hiện ít thẻ hơn; dải trên trang chủ không còn tin nào thì trang **ẩn luôn dải**. Không bao giờ lấy tin chưa mua ô vào cho đủ.',
          '**Thứ tự không bốc thăm theo từng người.** Cùng một thời điểm, hai ứng viên mở cùng một trang thấy **cùng một danh sách** — nên khách báo gì cũng tra lại được.',
          '**Làm mới tin là cách duy nhất tự đẩy tin lên trước trong hàng** — nhưng chỉ ở những ô xếp hàng theo lần làm mới: Top search, hai dải trang danh sách việc làm, và danh sách kết quả tìm kiếm. Ở **8 dải trang chủ · Hàn Quốc · nước ngoài** thì **không**: mỗi vòng hàng được xếp lại từ đầu, làm mới không đổi được gì. Không phải ngày đăng, và sửa nội dung tin **không** tính.',
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
        note: 'VD luật 10%: dải 30 thẻ → mỗi công ty nhiều nhất **3 thẻ**; dải 40 thẻ → **4 thẻ**. VD Top search: 20 thẻ chia 5 slide → một công ty nhiều nhất **5 thẻ**, mỗi slide một thẻ.\n\nDanh sách kết quả tìm kiếm để mặc định ở *Đề xuất* — bậc tin trước, rồi độ khớp từ khoá, rồi lần làm mới — và ở chế độ đó **không có luật công ty nào**. Cách xếp theo vòng trong bảng là của lựa chọn *Mới nhất*.\n\n**Riêng hai dải trên trang danh sách việc làm: trần 10% tính trong một lượt, và đi kèm luật khoảng cách.** Hai dải này **không xếp theo bậc tin** — bậc chỉ quyết định tin vào được dải nào, vào rồi thì mọi tin xếp hàng như nhau. Chính vì bỏ bậc ra khỏi thứ tự mà trong một lượt, hai thẻ cùng công ty **không bao giờ đứng cạnh nhau**. Trang *Trending & Đừng bỏ lỡ* nói kỹ.',
        cols: ['Ô hiển thị', 'Một công ty được giữ', 'Khi không đủ công ty để chia'],
        rows: [
          ['**Top search** — đầu trang kết quả tìm kiếm', 'Nhiều nhất **1 thẻ trong mỗi slide 4 thẻ**', 'Rải xa nhất có thể, rồi vẫn lấp cho đủ — không để slide thiếu thẻ'],
          ['**8 dải trang chủ · Hàn Quốc · nước ngoài**', '**Không có trần.** Tin của một công ty được **rải đều cả hàng**, hai tin cùng công ty không đứng cạnh nhau — nhưng là **cố gắng tối đa**', 'Khi một công ty nắm **hơn nửa** số tin của dải thì không còn cách xếp nào tránh được, và dải chấp nhận hai thẻ đứng cạnh nhau'],
          ['**Trending jobs · Don’t miss these jobs** — các trang danh sách việc làm', 'Nhiều nhất **10% số thẻ** trong **mỗi lượt**, làm tròn xuống, ít nhất 1 thẻ — và hai thẻ cùng công ty không đứng cạnh nhau', 'Dải **hiện ít thẻ hơn**. Trần là luật cứng, không nới ra để lấp cho đầy'],
          ['**Gợi ý nhanh dưới thanh tìm kiếm** và dải **Công ty hàng đầu**', 'Cũng **10%**, **và** hai thẻ đứng cạnh nhau không cùng một công ty khi còn công ty khác để xếp', 'Hết công ty khác thì mới chấp nhận đứng cạnh nhau'],
          ['**Danh sách kết quả tìm kiếm**, sắp xếp *Mới nhất*', 'Không có trần. Xếp **theo vòng**: tin mới nhất trong ngày của **mỗi** công ty trước, hết một lượt mới tới tin thứ hai của từng công ty', 'Không cần — cách xếp này tự cân'],
          ['**Việc làm gợi ý theo hồ sơ** *(không bán)*', 'Nhiều nhất **3 tin một công ty**, và hai tin cùng công ty cách nhau **ít nhất 6 vị trí**', 'Hết công ty khác thì vẫn lấp cho đủ thẻ'],
        ],
      },
      {
        kind: 'list',
        heading: '4a · Khi một công ty nắm phần lớn kho tin của ô',
        items: [
          'Với **hầu hết các ô**, luật công ty là **cố gắng tối đa**, không phải lời hứa tuyệt đối: khi một công ty nắm phần lớn số tin đủ điều kiện của ô thì **không có cách xếp nào** vừa giữ được luật vừa không để chỗ trống. *Ngoại lệ là hai dải trên trang danh sách việc làm* — ở đó trần là luật cứng, và dải chấp nhận hiện ít thẻ hơn.',
          'Ở những ô còn lại, ô **giữ đủ thẻ trước**: rải xa nhất có thể, chứ không bỏ bớt tin ra khỏi ô và không để ô thiếu thẻ.',
          '**Vì sao ô có trần thì hứa chắc được, ô không trần thì không:** xếp một dải n thẻ mà không để hai thẻ cùng công ty đứng cạnh nhau là **làm được khi và chỉ khi** công ty đông tin nhất giữ không quá **một nửa** số thẻ. Ô có trần 10% thì luôn nằm sâu trong ngưỡng đó nên hứa được; ô không trần thì một công ty có thể vượt nửa, và lúc đó không thuật toán nào cứu được. **Trần chính là thứ làm cho lời hứa “không đứng cạnh nhau” giữ được.**',
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
          ['**8 dải trang chủ · Hàn Quốc · nước ngoài**', 'Có — **5 phút**', 'Lật sang nhóm tin tiếp theo; lượt cuối thiếu thì lấy thêm từ đầu hàng cho đủ thẻ. Hết vòng thì **xếp lại cả hàng**'],
          ['**Top search**', 'Có — **5 phút**', 'Hàng tịnh tiến **4 tin**: slide 2 lên slide 1, 4 tin kế tiếp vào slide cuối'],
          ['**Banner**', 'Có — theo nhịp đặt trên từng ô', 'Dịch **1 vị trí**: banner thứ hai lên đầu'],
          ['**Trending jobs · Don’t miss these jobs**', 'Có — **5 phút**', 'Đổi **cả cụm thẻ** sang lượt tiếp theo; hết vòng thì chia lại hàng'],
          ['**Danh sách kết quả tìm kiếm**', '**Không**', 'Thứ tự chỉ đổi khi có tin được làm mới, hoặc có tin mới mua ô'],
          ['**Việc làm gợi ý theo hồ sơ** *(không bán)*', 'Đổi **mỗi ngày**', 'Mỗi ứng viên một thứ tự riêng, giữ nguyên trong ngày'],
        ],
      },
      {
        kind: 'list',
        items: [
          '**Một vòng dài bao lâu = số tin trong hàng ÷ số tin đổi mỗi nhịp × nhịp.** VD dải 30 thẻ đang có 80 tin → 3 nhịp là hết một vòng, tức **15 phút**.',
          'Ô càng bán được nhiều tin thì vòng càng dài. Đây là câu trả lời thật cho *“bao lâu tin tôi được hiện”*: **mỗi vòng một lần**, chứ không phải lúc nào cũng có mặt.',
          'Nhịp đặt trên **từng ô**, người vận hành sửa được, không cần dev.',
          'Ô **không xoay vòng** thì tin nằm ngoài số thẻ đầu hàng **không được hiện** cho tới khi hàng đổi — hàng chỉ đổi khi có tin được làm mới hoặc có tin mới mua ô.',
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
          ['**8 dải trang chủ · Hàn Quốc · nước ngoài**', 'Kho tin đã mua đúng ô đó', 'Không', 'Rải đều theo công ty, xếp lại mỗi vòng — **làm mới không đổi được thứ tự**', 'Có'],
          ['**Top search**', 'Ô tìm kiếm, lọc trong các tin đã mua ô', '**Có**', 'Làm mới gần nhất', 'Có'],
          ['**Trending jobs · Don’t miss these jobs**', 'Ô tìm kiếm của trang danh sách việc làm', '**Có** — theo trang đang mở', 'Hàng xếp theo nhóm đông tin nhất, rồi lần làm mới. Rồi **chia bài** ra các lượt — trần 10% và luật không đứng cạnh nhau áp **trong từng lượt**. **Bậc tin không xếp thứ tự**', 'Có'],
          ['**Danh sách kết quả tìm kiếm**', 'Toàn bộ tin đang mở, lọc theo từ khoá và bộ lọc', '**Có**', 'Mặc định *Đề xuất*: **bậc tin trước**, rồi độ khớp từ khoá, rồi làm mới. Chọn *Mới nhất* thì xếp theo vòng công ty', 'Không'],
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
          ['**Never shown**', 'Tin đủ điều kiện nhưng hết cả một vòng vẫn không tới lượt', 'Nhóm này **phải trống**. Mọi ô thẻ việc làm đều xoay vòng, và hết một vòng là mọi tin đã lên — thấy tin nằm đây thì **báo lại**, đừng giải thích với khách là bình thường. Câu hỏi đúng bây giờ không còn là *“tin có được hiện không”* mà là ***“bao lâu một lần”*** — mục 5'],
          ['**Empty slot**', 'Ô còn chỗ trống vì chưa đủ tin', '*Ô này còn chỗ bán*'],
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '8. Bán được gì, và không hứa gì' },
      {
        kind: 'table',
        cols: ['Hứa được', 'Không hứa'],
        rows: [
          ['Tin sẽ vào hàng của đúng ô đã mua', 'Tin luôn nằm ở thẻ đầu, hay ở slide 1 — và **không có cách trả thêm tiền để chen lên trước** trong cùng một ô'],
          ['Mỗi vòng tin **lên đúng một lần** — kể cả tin ở bậc thấp nhất của ô', 'Tin lúc nào cũng có mặt trên màn hình'],
          ['Tính trước được **bao lâu tin lên một lần**: bể càng đông thì vòng càng dài', 'Bậc cao hơn thì hiện **dày hơn** — trong cùng một ô, bậc không đổi được tần suất'],
          ['Hai dải trang danh sách việc làm: trong một lượt **không công ty nào quá 10% số thẻ**', 'Một vị trí cụ thể trong dải'],
          ['Bậc cao hơn **xếp trước** ở danh sách kết quả tìm kiếm, chế độ mặc định *Đề xuất*', 'Bậc cao hơn xếp trước **ở các dải** — ở đó bậc chỉ quyết định vào được dải nào'],
          ['Cùng một thời điểm, mọi ứng viên thấy như nhau', 'Thứ tự riêng cho từng ứng viên'],
          ['Làm mới tin **rút ngắn thời gian chờ** tới lượt ở Top search, hai dải trang danh sách việc làm và danh sách kết quả tìm kiếm', 'Làm mới đẩy được tin lên đầu **8 dải trang chủ · Hàn Quốc · nước ngoài** — hoặc cho tin lên hai lần trong một vòng'],
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
