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
 *   4 Ba bước, từ bể tin tới màn hình  (+ diagram 'board-strip-queue')
 *   5 Bước 1 — xếp hàng, rồi rải tin cùng công ty ra
 *   6 Bước 2 — cứ 5 phút bốc một lượt
 *   7 Bước 3 — lên màn hình theo thứ tự ngẫu nhiên
 *   8 Mỗi tin được hiện bao lâu một lần
 *   9 Khi ứng viên bấm Tìm: ba khối trên một trang
 *  10 Giao diện dải
 *  11 Nói gì với khách
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
 *   - SPREAD THE QUEUE, THEN SLICE IT (revised 2026-11-22, see below). Spacing
 *     is applied while the queue is BUILT, not while it is cut. Once no two of
 *     a company's postings sit within 10 places of each other, any consecutive
 *     window of 30 holds at most 3 of them, so plain slicing is safe and the
 *     round-robin deal is unnecessary.
 *   - FREQUENCY REPLACED RANK as what a product buys. Cycle length =
 *     (pool ÷ cards) × 5 min, so narrowing which rungs sell a slot is now the
 *     only lever that makes a posting appear more often. That is the sales
 *     story once everyone is guaranteed a turn.
 * THE CAP PAYS FOR THE SPACING GUARANTEE, AND ONLY A CONSTRUCTION COLLECTS IT.
 * Section 6 promises "never adjacent" with no hedge, and it can because the cap
 * holds a company to 3 of 30 cards: a non-adjacent arrangement exists whenever
 * the largest company stays at or under ceil(n/2), and the cap keeps it far
 * inside that. Two things follow, and both are easy to lose in a rewrite:
 *   - DO NOT soften section 6 to match the home bands page. That page says
 *     "best effort" because those bands have NO cap at all, so one company can
 *     hold most of a pool and no algorithm can space it. Different cause, not
 *     a sloppier version of the same rule.
 *   - BUILD IT AS A CONSTRUCTION, NOT A REPAIR. Section 6 says to deal each
 *     round from nothing, always taking the company with the most cards left
 *     and never the company just placed; that is the constructive proof of the
 *     bound and it succeeds on every feasible instance. A repair pass that
 *     walks an existing order patching collisions forward — what the build does
 *     today — can give up on an instance that IS feasible, because it never
 *     looks backward. Implement it that way and the promise on the page quietly
 *     stops being true while both the page and the cap still look correct.
 * Reached with the Home session on 2026-11-21, each of us holding one half.
 *
 * REWRITTEN FOR SALES ON 2026-11-22 from Thu's own Notion page "Job placement"
 * (app.notion.com/p/Job-placement-420b88bd999780849341c969c3b019b9), which she
 * wrote as the explanation a salesperson should be able to give. Her text is
 * the source for four changes, and each one is a RULE change, not a rewording:
 *   - THE SPACING MOVED TO THE QUEUE. "cứ 10 job thì chỉ có 1 job của công ty
 *     đó" is one rule doing both jobs: 1-in-10 along the queue IS the 10% cap
 *     for a 30-card window, and it also guarantees the gap. The old sections 5
 *     and 6 (deal-don't-slice, then a separate per-round cap) collapsed into
 *     section 5. Simpler, and it is hers.
 *   - THE ORDER ON SCREEN IS RANDOM. Her reason is exact: slice a queue in
 *     fixed blocks of 30 and some posting is forever first, another forever
 *     last. The shuffle still may not break the gap rule, so it is a shuffle
 *     over the arrangements that keep same-company cards apart.
 *   - THE OVER-POSTING COMPANY DILUTES ITSELF, and she accepted it in writing:
 *     "chấp nhận xác xuất xuất hiện của job công ty đó sẽ thấp hơn". That
 *     replaces the old "bể quá mỏng → dải bớt thẻ xuống" escape hatch, and it
 *     turns into the sales line in section 11: posting more does not buy more
 *     of the strip, moving up a rung does.
 *   - SEARCH GOT ITS OWN SECTION (9). Her page is explicit that the two strips
 *     FILTER on the search, and that a third block below them returns the
 *     normal search result, placement or not — which is also the one surface
 *     here where tier still sorts.
 * THE GROUP-KEY TRADE-OFF ASKED ON 2026-11-21 IS CLOSED BY THIS. It only
 * mattered because position inside a round was fixed; with the order shuffled
 * every round, the group key picks which ROUND a posting rides in and nothing
 * else, so every posting now has both equal airtime and an equal shot at the
 * top slot. "Nhóm đông tin nhất" left the page; grouping stayed.
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
const STAMP_BOARD_STRIPS = 'Cập nhật 22/11/2026.'

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
        text: 'Ba trang bảng tin của mega menu — **Theo khu vực**, **Theo ngành nghề**, **Theo ngành** — mỗi trang có **hai dải thẻ việc làm** nằm dưới thanh tìm kiếm: *Tin tuyển dụng nổi bật* ở trên, *Đừng bỏ lỡ những tin này!* ở dưới.\n\nHai dải là **hai ô có bán khác nhau**, không phải hai nửa của một ô. Job lên một dải khi bậc tin đang chạy của job có bán đúng ô đó.\n\nTrang này viết cho **người bán**: job nào lên dải nào, ba bước đưa job lên màn hình, một công ty được giữ mấy thẻ, bao lâu thì tới lượt tin của khách — và ở cuối là **một câu để nói với khách**.',
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
          ['Gom nhóm theo', 'Trục của trang — tỉnh, ngành nghề hoặc ngành', 'Như dải trên'],
          ['Một công ty tối đa', '3 thẻ mỗi lượt', '4 thẻ mỗi lượt'],
          ['Thứ tự trên màn hình', 'Ngẫu nhiên, xáo lại mỗi lượt', 'Ngẫu nhiên, xáo lại mỗi lượt'],
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
        note: 'Ba trang dùng **cùng một màn hình**: cùng thanh tìm kiếm, cùng hai dải, cùng khối quảng cáo cuối trang. Khác nhau đúng một chỗ là **trục gom nhóm** của hai dải. Gom nhóm chỉ quyết định tin nào đi cùng một lượt — **không** quyết định tin nào đứng trước trên màn hình (mục 7).',
        cols: ['Trang', 'Đường dẫn', 'Hai dải nhóm theo'],
        rows: [
          ['**Theo khu vực**', '`/viec-lam/dia-diem`', 'Tỉnh/TP của tin'],
          ['**Theo ngành nghề**', '`/viec-lam/nganh-nghe`', 'Ngành nghề của tin'],
          ['**Theo ngành**', '`/viec-lam/nganh`', 'Ngành của công ty đăng tin'],
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
      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '4. Ba bước, từ bể tin tới màn hình' },
      {
        kind: 'p',
        text: 'Cách chạy của hai dải gói gọn trong **ba bước**. Nhớ ba bước này là trả lời được gần hết câu hỏi của khách.\n\n**Bước 1 — Xếp hàng.** Mọi tin đủ điều kiện xếp thành một hàng chờ, và tin của cùng một công ty bị **rải ra xa nhau**.\n\n**Bước 2 — Bốc từng lượt.** Cứ 5 phút, dải lấy **30 tin kế tiếp** trong hàng (dải dưới lấy 40) và thay **toàn bộ** thẻ đang hiện.\n\n**Bước 3 — Xáo chỗ.** 30 tin đó lên màn hình theo **thứ tự ngẫu nhiên**, nên không tin nào luôn đứng đầu và không tin nào luôn đứng cuối.',
      },
      {
        kind: 'diagram',
        id: 'board-strip-queue',
        note: 'Ô màu **A** là tin của một công ty đang đăng rất nhiều tin. Hàng trên là **bước 1** — chúng bị đẩy cách nhau ít nhất 10 chỗ. Hàng dưới là **bước 3** — vẫn đúng 30 tin đó, nhưng thứ tự đã xáo.',
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '5. Bước 1 — xếp hàng, rồi rải tin cùng công ty ra' },
      {
        kind: 'table',
        note: 'Hàng này **không phải thứ tự trên màn hình** — bước 3 mới quyết định chỗ đứng. Hàng chỉ quyết định **tin nào đi cùng một lượt**.',
        cols: ['Thứ tự', 'Hệ thống làm gì', 'Nói với khách thế nào'],
        rows: [
          ['1', 'Gom tin thành nhóm theo trục của trang — tỉnh/TP, ngành nghề, hoặc ngành', 'Tin của anh/chị nằm trong nhóm của tỉnh (hoặc ngành) mà tin đó đăng'],
          ['2', 'Trong mỗi nhóm, tin **làm mới gần đây nhất** đứng trước. Làm mới, không phải ngày đăng, cũng không phải lần sửa tin', 'Làm mới tin là cách đẩy tin lên sớm hơn — và nó **không mất tiền**'],
          ['3', 'Rải tin cùng công ty ra: giữa hai tin của **cùng một công ty** luôn cách nhau **ít nhất 10 chỗ**', 'Không công ty nào chiếm được một mảng lớn của dải'],
        ],
      },
      {
        kind: 'list',
        heading: 'Rải ra xa nhau nghĩa là gì — và cái giá của nó',
        items: [
          '**“Cách nhau 10 chỗ” chính là trần 10%, nói theo cách khác.** Một lượt có 30 thẻ, mà cứ 10 chỗ mới có 1 tin của công ty đó, nên trong 30 thẻ họ nhiều nhất **3 thẻ**; dải dưới 40 thẻ thì **4 thẻ**. Một luật, hai kết quả: vừa không chiếm quá 10%, vừa không đứng cạnh nhau.',
          '**Công ty đăng càng nhiều tin thì mỗi tin của họ càng ít được hiện.** Hàng chỉ nhận 1 tin của họ mỗi 10 chỗ, nên số tin còn lại phải chờ các lượt sau. Đây là điều **đã được chấp nhận** khi chốt luật — Sales cần biết để không hứa ngược.',
          '**Đăng thêm tin không mua được thêm chỗ trên dải.** Phần của một công ty bị chặn ở 10% dù họ có 5 tin hay 500 tin. Muốn tin lên thường xuyên hơn thì **lên bậc cao hơn**, không phải đăng thêm — mục 8 nói vì sao.',
          '**Bậc tin không xếp thứ tự trong hàng.** Bậc chỉ quyết định tin vào được dải nào (mục 3); vào rồi thì Premium và Basic Plus đứng chung một hàng. Nếu để bậc xếp trước thì tin của công ty bậc cao bị kéo về sát nhau ở đầu dải — vẫn đúng trần 10% nhưng phá luật khoảng cách.',
        ],
      },
      {
        kind: 'example',
        heading: 'VD: một công ty có 50 tin trong bể 100 tin',
        scenario: 'Trang **Theo khu vực**, dải *Tin tuyển dụng nổi bật* (30 thẻ). Bể có 100 tin đủ điều kiện, trong đó **50 tin của cùng một công ty** — họ vừa đăng hàng loạt trong một buổi.',
        cols: ['Nếu chỉ xếp theo lần làm mới', 'Có rải — cách nhau 10 chỗ'],
        rows: [
          ['50 tin đó nằm **sát nhau** trong hàng', 'Hàng nhận **1 tin** của họ mỗi 10 chỗ'],
          ['Lượt đầu gần như **toàn tin một công ty**', 'Mỗi lượt nhiều nhất **3 thẻ** của họ'],
          ['Ứng viên thấy một trang toàn một thương hiệu', 'Ứng viên thấy 30 thẻ của **nhiều công ty**'],
          ['Các công ty nhỏ gần như không lên được', '50 tin còn lại **chia nhau** các chỗ còn trống'],
        ],
        note: 'Hệ quả cho công ty đăng 50 tin: họ vẫn giữ 3 thẻ mỗi lượt **như mọi công ty khác**, nhưng 50 tin của họ phải **thay phiên nhau** dùng 3 chỗ đó — nên **mỗi tin tới lượt chậm hơn** tin của một công ty chỉ đăng vài tin. Đây là chủ ý, không phải lỗi.',
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '6. Bước 2 — cứ 5 phút bốc một lượt' },
      {
        kind: 'list',
        items: [
          'Hết 5 phút, dải lấy **30 tin kế tiếp** trong hàng và **thay toàn bộ thẻ một lúc**. Không tịnh tiến từng tin, không đẩy một thẻ vào rồi bỏ một thẻ ra.',
          'Trong 5 phút đó dải là **lưới tĩnh**: không tự chạy, không mũi tên, không bộ đếm. Ứng viên thấy cụm mới khi tải lại trang ở chu kỳ sau.',
          'Mọi người mở trang **trong cùng một chu kỳ 5 phút** đều thấy **cùng một lượt**. Không có chuyện mỗi người một kết quả.',
          'Đi hết hàng là **hết một vòng**, rồi xếp hàng lại từ bể tin **tại thời điểm đó** — tin mới vào bể, tin hết hạn rời bể.',
          'Trong một vòng, **mỗi tin đủ điều kiện được lên đúng một lần** — kể cả tin ở tỉnh ít việc, kể cả tin ở bậc thấp nhất của dải. Đây là lời hứa bán được: **chắc chắn được lên**.',
        ],
      },
      {
        kind: 'table',
        note: 'Làm mới tin **không** cho tin lên hai lần trong một vòng. Nó chỉ rút ngắn thời gian chờ tới lượt.',
        cols: ['Tin được làm mới lúc', 'Chuyện gì xảy ra'],
        rows: [
          ['Chưa lên trong vòng này', 'Tin nhảy lên đầu phần hàng còn lại → lên ở **một trong vài lượt gần nhất kế tiếp**, không phải chờ hết vòng'],
          ['Đã lên rồi trong vòng này', 'Tin **chờ vòng sau**, và ở vòng sau nó nằm trong nhóm đầu hàng'],
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '7. Bước 3 — lên màn hình theo thứ tự ngẫu nhiên' },
      {
        kind: 'p',
        text: '30 tin của một lượt lên màn hình **không theo thứ tự hàng**, mà được **xáo ngẫu nhiên** mỗi lượt.\n\nLý do rất cụ thể: nếu cứ bốc 30 tin theo đúng thứ tự hàng rồi bày lên, thì một tin sẽ **luôn** rơi vào ô đầu tiên và một tin sẽ **luôn** rơi vào ô cuối — vòng nào cũng vậy, mãi mãi. Xáo chỗ bỏ hẳn chuyện đó.',
      },
      {
        kind: 'list',
        items: [
          'Mọi tin trong cùng một lượt có **cơ hội như nhau** được đứng ở ô đầu, ô giữa hay ô cuối.',
          'Xáo **một lần cho mỗi lượt**, không phải mỗi người một kiểu. Hai ứng viên mở trang trong cùng một chu kỳ 5 phút thấy **đúng cùng thứ tự** — nên khi khách gọi lên hỏi, Sales mở ra thấy y như khách.',
          'Xáo ngẫu nhiên **không được phá luật khoảng cách**: xáo xong mà hai thẻ cùng công ty rơi cạnh nhau thì đổi chỗ một thẻ, cho tới khi không còn cặp nào liền nhau.',
          'Vì thứ tự đổi mỗi lượt nên **không bán được “ô số 1”**. Trên hai dải này không tồn tại vị trí cố định để bán.',
          'Nghiệm thu: theo một tin qua 10 vòng liên tiếp — vị trí của nó phải khác nhau, không nằm nguyên một chỗ.',
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '8. Mỗi tin được hiện bao lâu một lần' },
      {
        kind: 'p',
        text: 'Khi mọi tin đều chắc chắn được lên và không ai mua được vị trí, thứ phân biệt tin này với tin kia chỉ còn là **tần suất**. Con số đó tính được:\n\n**Một vòng = (số tin đủ điều kiện ÷ số thẻ của dải) × 5 phút**\n\nMỗi tin lên **5 phút mỗi vòng**. Bể càng đông thì vòng càng dài, tin càng ít được hiện.',
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
          '**Lên bậc cao hơn để vào ô ít tin hơn.** Dải *Nổi bật* chỉ nhận Basic Plus trở lên, nên bể của nó nhỏ hơn hẳn bể của dải dưới — ít tin vào được thì vòng ngắn lại cho tất cả những tin đã vào. Đây là đòn bẩy mạnh nhất, và là cách bậc tin còn tác dụng **trên hai dải này**.',
          '**Làm mới tin.** Không rút ngắn vòng, nhưng đưa tin lên sớm hơn trong vòng đang chạy, và không mất tiền.',
          '**Tăng số thẻ** của dải trong Admin. Nhưng tăng số thẻ là tăng luôn trần một công ty, vì trần là 10% số thẻ.',
          'Rút ngắn chu kỳ 5 phút thì **không** ăn thua: cả vòng chạy nhanh hơn nhưng mỗi tin vẫn chỉ lên một lượt mỗi vòng, và lượt đó ngắn lại đúng bằng phần rút.',
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '9. Khi ứng viên bấm Tìm: ba khối trên một trang' },
      {
        kind: 'table',
        note: 'Chưa gõ gì thì trang chỉ có hai dải. **Bấm Tìm** mới hiện khối thứ ba, nằm **dưới** hai dải.',
        cols: ['Khối', 'Hiện tin nào', 'Xếp theo'],
        rows: [
          ['**Dải Tin tuyển dụng nổi bật**', 'Chỉ tin **vừa khớp tìm kiếm vừa có bậc bán ô này**', 'Ba bước ở trên'],
          ['**Dải Đừng bỏ lỡ những tin này!**', 'Như trên, nhưng bậc Basic và Free', 'Ba bước ở trên'],
          ['**Danh sách kết quả tìm kiếm**', '**Tất cả** tin khớp tìm kiếm — có mua ô hay không cũng vào', 'Luật tìm kiếm thường, **giống hệt** tìm từ thanh tìm kiếm chính'],
        ],
      },
      {
        kind: 'list',
        items: [
          'Hai dải **lọc theo** từ khoá và bộ lọc đang đặt — chúng không đứng ngoài cuộc tìm kiếm.',
          'Khối thứ ba **không phải ô bán**. Tin không mua gì vẫn nằm trong đó.',
          '**Đây là chỗ duy nhất liên quan tới trang này mà bậc tin còn xếp thứ tự**: ở chế độ sắp xếp mặc định *Đề xuất* của danh sách kết quả, bậc cao đứng trước. Trên hai dải thì không.',
          'Khách hỏi “mua rồi thì tìm kiếm có ưu tiên không?” → **có**, nhưng ở **khối kết quả**, không phải ở hai dải.',
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '10. Giao diện dải' },
      {
        kind: 'list',
        items: [
          'Dải là **một lưới tĩnh**: mọi thẻ hiện cùng lúc. Không tự chạy, không mũi tên, không bộ đếm slide.',
          'Trên máy tính: dải Nổi bật **3 cột**, dải Đừng bỏ lỡ **4 cột**. Màn hình hẹp hơn xuống 2 cột, rồi 1 cột.',
          '**Không có nút Xem thêm**, cũng không phân trang. Hết số thẻ là hết dải.',
          'Ứng viên đã đăng nhập: tiêu đề dải Đừng bỏ lỡ **gọi tên** họ — *“{tên} ơi, đừng bỏ lỡ những tin này!”*. Khách chưa đăng nhập thấy tiêu đề thường.',
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '11. Nói gì với khách' },
      {
        kind: 'p',
        text: '**Câu để nói:** *“Tin của anh/chị **chắc chắn được lên** dải, theo lượt xoay vòng — **bậc càng cao thì vòng càng ngắn, tin lên càng thường xuyên**.”*\n\nCâu này bán đúng hai thứ hai dải thật sự có: **sự chắc chắn** và **tần suất**. Nó không hứa vị trí, nên không bị khách bắt lỗi về sau.',
      },
      {
        kind: 'table',
        heading: 'Khách hỏi gì, trả lời sao',
        cols: ['Khách hỏi', 'Trả lời'],
        rows: [
          ['“Tin tôi có được lên đầu không?”', 'Hai dải **không có vị trí cố định** — mỗi lượt thứ tự xáo lại. Đổi lại, tin **chắc chắn được lên**, vòng nào cũng một lần'],
          ['“Sao tôi mở ra không thấy tin tôi?”', 'Dải chỉ hiện 30 (hoặc 40) tin một lúc và **đổi cả cụm mỗi 5 phút**. Tin đang chờ tới lượt — mục 8 có cách tính bao lâu'],
          ['“Tôi đăng 50 tin, sao không thấy nhiều?”', 'Một công ty tối đa **10% số thẻ** mỗi lượt. Đăng thêm **không** mở rộng phần đó — 50 tin thay phiên nhau dùng 3 chỗ'],
          ['“Mua bậc cao hơn thì được gì?”', '**Vào ô ít tin hơn**, nên **tới lượt nhanh hơn**. Đây là thứ thật sự mua được bằng tiền'],
          ['“Làm mới tin có tác dụng không?”', 'Có, và **không mất tiền**: tin chưa lên trong vòng này sẽ lên sớm hơn. Nhưng không lên được hai lần trong một vòng'],
          ['“Tìm kiếm có ưu tiên tin tôi không?”', 'Có — ở **danh sách kết quả tìm kiếm** (mục 9), bậc cao đứng trước ở chế độ *Đề xuất*. Hai dải thì không'],
        ],
      },
      {
        kind: 'list',
        heading: 'Ba điều không được hứa',
        items: [
          'Không hứa **vị trí** — không có ô số 1 để bán.',
          'Không hứa **hiện liên tục** — tin lên theo lượt, mỗi vòng một lần.',
          'Không hứa **đăng nhiều thì hiện nhiều** — trần 10% chặn đúng chỗ đó.',
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
 *   - "công ty đang hoạt động và đã có mã số thuế" as an ENTRY condition, cut
 *     from law 1 on 2026-11-22 under Thu's ruling for the strips page: a
 *     posting cannot be created unless both already hold, so listing them as
 *     entry rules is noise for Sales ("hiển nhiên"). The laws here cover every
 *     placement, so the ruling reaches this page. Do not restore the row.
 *
 * OPEN — AND HER REASON DOES NOT REACH AS FAR AS THE CUT DID (2026-11-22):
 *   Both conditions are re-evaluated on EVERY public read in today's build, not
 *   checked once at posting time. PublicReadRepositoryAdapter.publiclyExposed
 *   (read from svn-be origin/dev, 2026-11-22) is `status == ACTIVE AND (mst
 *   IS NOT NULL OR (kind == FOREIGN AND foreign_tax_id IS NOT NULL))`, its
 *   javadoc calls it decision D-3, and the placement slice
 *   (findOpenJobsByTierCodes / findFeaturedCompaniesByTierCodes) applies the
 *   SAME predicate — so it governs these two strips and the eight bands.
 *   Consequence: archive a company and every posting it has bought leaves every
 *   public surface at once, mid-campaign. The tax-code half is not a formality
 *   either; the javadoc says that without it "every unverified lead would
 *   surface publicly".
 *   So "self-evident at posting time" is true of entry and false of the ongoing
 *   state, and the cut removed both readings. Whether the AGREED rule should say
 *   postings drop off when a company is archived — or run to expiry — is Thu's
 *   call, not the build's. Nothing has been written onto the page either way.
 *   If it is ever written: NOT "phải có mã số thuế" flatly. Foreign customers
 *   have no mst and carry foreign_tax_id instead (V376, after the mst-only
 *   spelling silently hid every foreign company until 2026-10-12).
 *
 * §8 IS NOW THE ONLY DO-NOT-PROMISE LIST IN THIS GROUP (2026-11-22). Thu cut the
 * sales section from the strips page, so the prohibition index that caught §2
 * selling frequency off tier — §8 already forbade it — exists only here. Two
 * consequences. Keep §8 enumerating prohibitions, not just permissions: it is
 * the index every other claim gets read against. And when the strips page makes
 * a claim, check it against §8, because that page can no longer catch itself.
 * The dependency runs one way and did not exist before today.
 *
 * READ THE PAGE'S CLAIMS AGAINST EACH OTHER, not only each block against the
 * rule. §2 and §8 were each defensible alone and contradicted each other for
 * weeks; every check that reads one block at a time passes both.
 *
 * RECEIVED FROM THU 2026-11-22 AND NOT APPLIED HERE — both need her, not a guess:
 *   - Vocabulary: "dải => Section, bậc tin => Placement", annotated on the strips
 *     page. NOT swept here, for two reasons. (a) This page's generic term is "ô"
 *     (93 uses) and "dải" (53) is a SUBTYPE of it; her mapping says what "dải"
 *     becomes and nothing about "ô", and this is the one page that has to name
 *     every kind of box. (b) "Placement" already appears here in the Admin sense
 *     — §7's "Product settings → Placement load" — so renaming the 12 "bậc tin"
 *     to Placement puts one word on two meanings, one of them a screen name.
 *     Ask her which word "ô" takes before touching either.
 *   - Card counts: 30 for the upper strip, 40 for the lower, came off staging on
 *     2026-11-21 and she is asking whether the lower one is 40 or 30. It is a
 *     worked number here, not a rule, and it appears in FIVE places: §4's note
 *     (twice), §4's cap table, §5's cycle-length example, §6's row. Changing it
 *     is five edits, not one. Top search's 20-across-5-slides is a different
 *     number and is not in question.
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
          'Ở **hai dải trang danh sách việc làm**, khách **không mua thứ hạng** — mọi tin trong dải đều chắc chắn được lên. Bậc tin quyết định tin **vào được ô nào**, chỉ vậy thôi. Còn tin lên **thường xuyên đến đâu** thì tuỳ ô đó đang có bao nhiêu tin: ô đông thì vòng dài, ô vắng thì vòng ngắn. Đó là **tình hình thị trường lúc đó**, không phải thứ bán kèm theo bậc — đừng hứa bậc cao thì tin lên dày hơn. *Một điều phải nói trước với khách đăng nhiều tin:* khi tin của một công ty **vượt 10% cả bể tin** của dải thì mỗi vòng chỉ một phần tin của họ được xếp vào hàng, phần còn lại chờ các vòng sau — mục 4 nói vì sao.',
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '3. Năm luật đúng với mọi ô' },
      {
        kind: 'list',
        items: [
          '**Tin phải đang hiển thị bình thường**: tin đang mở, đang bật hiển thị, chưa hết hạn. Rớt một điều là không vào ô nào cả.',
          '**Tin phải đã mua đúng ô đó** — qua bậc tin đang chạy, hoặc qua add-on hiển thị. Bậc đang chạy là bậc **cao nhất** tin đang giữ và còn trong hạn. Bậc tin quyết định tin **vào được ô nào**; ở các ô hiển thị — dải, slide, banner — bậc **không** quyết định tin đứng thứ mấy, thứ tự ở đó do luật riêng của từng ô. **Ngoại lệ duy nhất: danh sách kết quả tìm kiếm** ở chế độ mặc định *Đề xuất*, nơi bậc tin xếp trước, rồi tới độ khớp từ khoá và lần làm mới.',
          '**Không lấp chỗ.** Ô thiếu tin thì hiện ít thẻ hơn; dải trên trang chủ không còn tin nào thì trang **ẩn luôn dải**. Không bao giờ lấy tin chưa mua ô vào cho đủ.',
          '**Thứ tự không bốc thăm theo từng người.** Cùng một thời điểm, hai ứng viên mở cùng một trang thấy **cùng một danh sách** — nên khách báo gì cũng tra lại được. Hai dải *Trending · Đừng bỏ lỡ* có xáo ngẫu nhiên, nhưng **xáo một lần cho cả lượt**, không phải mỗi người một kiểu: trong cùng một chu kỳ 5 phút, Sales mở ra thấy y như khách.',
          '**Làm mới tin là cách duy nhất tự đẩy tin lên trước trong hàng** — nhưng chỉ ở những ô xếp hàng theo lần làm mới: Top search, hai dải trang danh sách việc làm, và danh sách kết quả tìm kiếm. Ở **8 dải trang chủ · Hàn Quốc · nước ngoài** thì **không**: mỗi vòng hàng được xếp lại từ đầu, làm mới không đổi được gì. Không phải ngày đăng, và sửa nội dung tin **không** tính. Riêng ở hai dải trang danh sách việc làm, lực đẩy này **có giới hạn**: công ty đang vượt 10% bể tin thì luật rải có thể chưa xếp tin đó vào hàng của vòng này, nên làm mới xong vẫn phải chờ vòng sau — mục 4.',
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
        note: 'VD luật 10%: dải 30 thẻ → mỗi công ty nhiều nhất **3 thẻ**; dải 40 thẻ → **4 thẻ**. VD Top search: 20 thẻ chia 5 slide → một công ty nhiều nhất **5 thẻ**, mỗi slide một thẻ.\n\nDanh sách kết quả tìm kiếm để mặc định ở *Đề xuất* — bậc tin trước, rồi độ khớp từ khoá, rồi lần làm mới — và ở chế độ đó **không có luật công ty nào**. Cách xếp theo vòng trong bảng là của lựa chọn *Mới nhất*.\n\n**Riêng hai dải trên trang danh sách việc làm, luật đặt ở chỗ khác: ngay khi xếp hàng chờ, hai tin của cùng một công ty đã được rải cách nhau ít nhất 10 chỗ.** Một luật cho hai kết quả — mỗi lượt 30 thẻ thì công ty đó nhiều nhất **3 thẻ** (đúng 10%), **và** không hai thẻ nào của họ đứng cạnh nhau. Hai dải này **không xếp theo bậc tin**: bậc chỉ quyết định tin vào được dải nào, vào rồi thì mọi tin xếp hàng như nhau. Nếu để bậc xếp trước thì tin của một công ty bậc cao bị kéo về sát nhau ở đầu hàng — vẫn đúng 10% số thẻ nhưng phá luật khoảng cách. **Hai con số 10% trên trang này đếm hai thứ khác nhau.** *10% số thẻ* là trần trong một lượt: dải 30 thẻ thì một công ty nhiều nhất 3 thẻ. *10% bể tin* là mốc khác hẳn: công ty giữ quá ngần đó tin thì luật rải không còn xếp hết tin của họ vào hàng của một vòng được nữa, phần còn lại chờ vòng sau. Cùng một luật rải cách nhau 10 chỗ, nhưng đếm trên hai tập khác nhau. Trang *Trending & Đừng bỏ lỡ* nói kỹ.',
        cols: ['Ô hiển thị', 'Một công ty được giữ', 'Khi không đủ công ty để chia'],
        rows: [
          ['**Top search** — đầu trang kết quả tìm kiếm', 'Nhiều nhất **1 thẻ trong mỗi slide 4 thẻ**', 'Rải xa nhất có thể, rồi vẫn lấp cho đủ — không để slide thiếu thẻ'],
          ['**8 dải trang chủ · Hàn Quốc · nước ngoài**', '**Không có trần.** Tin của một công ty được **rải đều cả hàng**, hai tin cùng công ty không đứng cạnh nhau — nhưng là **cố gắng tối đa**', 'Khi một công ty nắm **hơn nửa** số tin của dải thì không còn cách xếp nào tránh được, và dải chấp nhận hai thẻ đứng cạnh nhau'],
          ['**Trending jobs · Don’t miss these jobs** — các trang danh sách việc làm', 'Hàng chờ đã **rải tin cùng công ty cách nhau 10 chỗ** — nên mỗi lượt công ty đó nhiều nhất **10% số thẻ**, làm tròn xuống và ít nhất 1 thẻ (30 thẻ → 3 thẻ, 40 thẻ → 4 thẻ), và không hai thẻ nào của họ đứng cạnh nhau', 'Dải **hiện ít thẻ hơn**. Trần là luật cứng, không nới ra để lấp cho đầy'],
          ['**Gợi ý nhanh dưới thanh tìm kiếm** và dải **Công ty hàng đầu**', 'Cũng **10% số thẻ**, **và** hai thẻ đứng cạnh nhau không cùng một công ty khi còn công ty khác để xếp', 'Hết công ty khác thì mới chấp nhận đứng cạnh nhau'],
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
          '**Vì sao ô có trần thì hứa chắc được, ô không trần thì không:** xếp một dải n thẻ mà không để hai thẻ cùng công ty đứng cạnh nhau là **làm được khi và chỉ khi** công ty đông tin nhất giữ không quá **một nửa** số thẻ. Ô có trần 10% số thẻ thì luôn nằm sâu trong ngưỡng đó nên hứa được; ô không trần thì một công ty có thể vượt nửa, và lúc đó không thuật toán nào cứu được. **Trần chính là thứ làm cho lời hứa “không đứng cạnh nhau” giữ được.**',
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
        text: '**Xoay vòng là gì:** một ô chỉ hiện được vài chục thẻ, nhưng có thể có hàng trăm tin đã mua ô đó. Thay vì luôn hiện mấy tin đầu hàng, ô **đổi sang nhóm tin tiếp theo** sau mỗi nhịp. Đi hết một vòng thì **mọi tin trong hàng đều đã được hiện**. *Riêng hai dải trang danh sách việc làm:* luật rải cách nhau 10 chỗ có thể **chưa xếp hết** tin của một công ty đông tin vào hàng của vòng này — số còn lại vào hàng ở các vòng sau, nên “hàng” và “bể tin” không phải một.',
      },
      {
        kind: 'table',
        cols: ['Ô hiển thị', 'Có xoay vòng', 'Mỗi nhịp đổi gì'],
        rows: [
          ['**8 dải trang chủ · Hàn Quốc · nước ngoài**', 'Có — **5 phút**', 'Lật sang nhóm tin tiếp theo; lượt cuối thiếu thì lấy thêm từ đầu hàng cho đủ thẻ. Hết vòng thì **xếp lại cả hàng**'],
          ['**Top search**', 'Có — **5 phút**', 'Hàng tịnh tiến **4 tin**: slide 2 lên slide 1, 4 tin kế tiếp vào slide cuối'],
          ['**Banner**', 'Có — theo nhịp đặt trên từng ô', 'Dịch **1 vị trí**: banner thứ hai lên đầu'],
          ['**Trending jobs · Don’t miss these jobs**', 'Có — **5 phút**', 'Đổi **cả cụm thẻ** sang lượt tiếp theo, và **xáo lại thứ tự** bên trong lượt; hết vòng thì xếp lại hàng từ bể tin **tại thời điểm đó**'],
          ['**Danh sách kết quả tìm kiếm**', '**Không**', 'Thứ tự chỉ đổi khi có tin được làm mới, hoặc có tin mới mua ô'],
          ['**Việc làm gợi ý theo hồ sơ** *(không bán)*', 'Đổi **mỗi ngày**', 'Mỗi ứng viên một thứ tự riêng, giữ nguyên trong ngày'],
        ],
      },
      {
        kind: 'list',
        items: [
          '**Một vòng dài bao lâu = số tin trong hàng ÷ số tin đổi mỗi nhịp × nhịp.** VD dải 30 thẻ, **hàng** đang có 80 tin → 3 nhịp là hết một vòng, tức **15 phút**. Ở hai dải trang danh sách việc làm, khi có công ty vượt 10% bể tin thì **“số tin trong hàng” ít hơn cả bể** — tin chưa vào được hàng thì chưa tính vào vòng này. **Đừng thay số của cả bể tin vào công thức** — làm vậy ra vòng dài hơn thực tế. Thực tế là **vòng ngắn lại** cho mọi người, còn tin của chính công ty vượt trần thì **lên thưa hơn**: hai điều này đúng cùng một lúc.',
          'Ô càng bán được nhiều tin thì vòng càng dài. Đây là câu trả lời thật cho *“bao lâu tin tôi được hiện”*: **mỗi vòng một lần**, chứ không phải lúc nào cũng có mặt — trừ tin của công ty đang vượt 10% bể tin ở hai dải trang danh sách việc làm: tin của họ lên **thưa hơn hẳn**, và **đừng nói với khách một con số** — chờ bao nhiêu vòng còn tuỳ cách hệ thống xếp hàng, chênh nhau vài lần.',
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
          ['**Trending jobs · Don’t miss these jobs**', 'Ô tìm kiếm của trang danh sách việc làm', '**Có** — theo trang đang mở', 'Hàng gom theo nhóm của trang, trong nhóm theo lần làm mới, rồi **rải tin cùng công ty cách nhau 10 chỗ** — nên mỗi lượt 30 thẻ không công ty nào quá 3 thẻ. Lên màn hình thì **xáo ngẫu nhiên** trong lượt. **Bậc tin không xếp thứ tự**', 'Có'],
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
          ['**Waiting for a turn**', 'Tin sẽ tới lượt ở một nhịp sau', '*Tin đang trong hàng, tới lượt trong vòng này* — **trừ** tin của công ty đang vượt 10% bể tin ở hai dải trang danh sách việc làm: tin đó có thể phải chờ sang vòng sau, **đừng hẹn khách trong vòng này** (mục 4)'],
          ['**Never shown**', 'Tin đủ điều kiện nhưng hết cả một vòng vẫn không tới lượt', 'Nhóm này **phải trống** ở gần hết các ô — **trừ một trường hợp**: ở hai dải trang danh sách việc làm, tin của công ty đang giữ **hơn 10% bể tin** của dải lên **thưa hơn hẳn** — có thể nhiều vòng mới tới lượt, và **đừng đoán ra một con số** cho khách. Đó là **chủ ý của luật rải**, không phải lỗi (mục 4). Ngoài trường hợp đó, thấy tin nằm đây thì **báo lại**, đừng giải thích với khách là bình thường. Câu hỏi đúng bây giờ không còn là *“tin có được hiện không”* mà là ***“bao lâu một lần”*** — mục 5'],
          ['**Empty slot**', 'Ô còn chỗ trống vì chưa đủ tin', '*Ô này còn chỗ bán*'],
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '8. Bán được gì, và không hứa gì' },
      {
        kind: 'table',
        cols: ['Hứa được', 'Không hứa'],
        rows: [
          ['Tin sẽ vào **bể tin** của đúng ô đã mua', 'Tin luôn nằm ở thẻ đầu, hay ở slide 1 — và **không có cách trả thêm tiền để chen lên trước** trong cùng một ô'],
          ['Mỗi vòng tin **lên đúng một lần** — kể cả tin ở bậc thấp nhất của ô. *Trừ* công ty đang vượt 10% bể tin ở hai dải trang danh sách việc làm: tin của họ phải chờ qua vòng (mục 4)', 'Tin lúc nào cũng có mặt trên màn hình'],
          ['Tính trước được **bao lâu tin lên một lần** ở các ô **không có trần công ty**: bể càng đông thì vòng càng dài', 'Bậc cao hơn thì hiện **dày hơn** — trong cùng một ô, bậc không đổi được tần suất'],
          ['Hai dải trang danh sách việc làm: trong một lượt **không công ty nào quá 10% số thẻ**', 'Một vị trí cụ thể trong dải — và với công ty vượt 10% bể tin, **một con số cho câu “bao lâu tin tôi lên một lần”**'],
          ['Bậc cao hơn **xếp trước** ở danh sách kết quả tìm kiếm, chế độ mặc định *Đề xuất*', 'Bậc cao hơn xếp trước **ở các dải** — ở đó bậc chỉ quyết định vào được dải nào'],
          ['Cùng một thời điểm, mọi ứng viên thấy như nhau', 'Thứ tự riêng cho từng ứng viên'],
          ['Làm mới tin **rút ngắn thời gian chờ** tới lượt ở Top search, hai dải trang danh sách việc làm và danh sách kết quả tìm kiếm — ở hai dải, chỉ khi tin đã được xếp vào hàng của vòng này (mục 3)', 'Làm mới đẩy được tin lên đầu **8 dải trang chủ · Hàn Quốc · nước ngoài** — hoặc cho tin lên hai lần trong một vòng'],
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
