/*
 * Các dải job trên trang chủ, trang Việc làm Hàn Quốc và trang Việc làm nước ngoài.
 *
 * SAME CONTRACT AS /trang/top-search, SET BY THU ON 2026-11-21: this is a USER
 * GUIDE FOR THE CLIENT. Pure description of how the bands behave. None of the
 * following belongs on it — "Bản yêu cầu", status lines, ✅ / 🔶 markers, who
 * decided and when, ticket codes, gap statements ("hiện tại là 8", "khác hiện
 * tại"), production measurements, pool sizes, named employers, config advice,
 * internal to-do lists. That material lives in the spec site and the PM ticket.
 * See the header of job-display-logic.ts for the full statement of the rule.
 *
 * VOICE — RESET 23/11/2026 TO /trang/board-strips, ON THU'S ASK. The readers
 * named are the client's SALES and TESTERS, who have to picture the mechanism
 * and then explain it to their own customers. So: a numbered step per stage of
 * the pipeline, short declarative bullets, one fact per bullet, almost no bold,
 * no backticks around routes, no code identifiers (not `items_shown` but "số
 * thẻ"). Name things the way an operator sees them on screen. Never "vẽ" — use
 * "hiện" / "hiển thị". Jobs are not people, never "ai".
 *
 * SHAPE — the board-strips skeleton, plus two band-specific sections:
 *   1 Tổng quan                                    (+ the three-page table)
 *   2 Tám dải trên một trang                       (band-specific)
 *   3 Bước 1 — Lọc: job nào vào được dải
 *   4 Bước 2 — Xếp hàng chờ lên hiển thị
 *   5 Bước 3 — Bốc từng lượt, 5 phút một lần
 *   6 Bước 4 — Lên lưới: hàng lẻ bị cắt            (band-specific)
 *
 * ──────────────────────────────────────────────────────────────────────────
 * ORDER INSIDE A BAND — REVERSED BY THU ON 23/11/2026. READ THIS BEFORE
 * "CORRECTING" THE PAGE BACK.
 *
 * The page now says the queue is ordered by LATEST REFRESH, newest first. From
 * 21/11 to 23/11 it said the opposite — that refreshing a posting buys nothing
 * on these bands — and that older reasoning is written out below, because it is
 * sound about the BUILD and someone will rediscover it and think the page is
 * wrong. It is not. Thu's ruling governs: "user guide là requirement, cái tôi
 * muốn, ko phải cái thật sự build".
 *
 * Her reason, in her words on 23/11, was structural as much as commercial: with
 * no ordering rule stated, "ko có logic gì xếp hàng cho danh sách job đang chờ
 * ... cứ filter job theo bước 1 rồi bước 2 ko làm gì?" — a step that orders
 * nothing is not a step. Bước 2 had been left holding only the company
 * spreading, which rearranges an order it never establishes.
 *
 * WHAT THE BUILD DOES, unchanged by any of this: every band carries
 * rotation_seconds = 300 (V354), and PeriodicRotation.spreadPage lays the whole
 * pool out afresh each cycle keyed off each posting's own id and company. The
 * incoming order is never consulted — not between companies, not within one —
 * so today refresh does not move a posting on these bands. The pool query's own
 * javadoc ("Ordered by last refresh, not creation: a tier that sells a refresh
 * cadence only means something if a bump actually moves the posting up the areas
 * it feeds") is therefore CONDITIONAL on rotation being off, and today it is on
 * for all eight. So the page is deliberately AHEAD of the build on this point.
 * The gap belongs in the ticket, never in a line on the page.
 *
 * HOW REFRESH AND ROTATION SIT TOGETHER — this is the reconciliation, keep it.
 * Position in the QUEUE decides which turn a posting lands in; the shuffle
 * inside a TURN decides where it sits on screen. Both can hold at once, and the
 * page says so in Bước 2 and Bước 3. Written any other way the two sections
 * read as a contradiction, which is how the 21/11 version got into trouble.
 *
 * AND THE SHUFFLE IS CONSTRAINED, not free. It picks among the arrangements
 * that still keep two cards of one company apart, which is how board-strips
 * words it too. A free shuffle would undo Bước 2's spreading inside the turn
 * and leave the page promising a spacing it then destroys one step later —
 * the two blocks were each defensible alone and contradicted each other.
 *
 * STILL TRUE AND STILL ON THE PAGE: the company spreading is BEST EFFORT, and
 * the reason is the MISSING CAP, not the repair pass. A run of n cards can be
 * arranged with no two of one company adjacent exactly when the largest company
 * holds at most ceil(n/2) of them. These bands cap nobody, so one company can
 * hold most of a band's pool and no algorithm can space it. (The two job-board
 * strips cap a company at 10% of the cards, which keeps every instance far
 * inside that bound, so THEY promise "never adjacent" outright — their cap and
 * their spacing rule hold each other up. Their guarantee also has to be BUILT
 * as a construction — deal each round from scratch, always taking the company
 * with the most cards left — not as a pass that walks an existing order
 * patching collisions forward. The cap pays for the guarantee; only the
 * construction collects it.) Say the cap is what differs if the two pages are
 * ever reconciled; the weaker wording here is not sloppiness on either side.
 * ──────────────────────────────────────────────────────────────────────────
 *
 * THE `cap` COLUMN IN REGISTRY 4.2 DOES NOT APPLY HERE — checked 21/11/2026.
 * That table gives Super hot Large a cap of 20 and Top job / Distinction 96,
 * which reads as "only this many postings ever queue" and would make Bước 3's
 * promise that every posting gets a turn false for three of the eight bands.
 * It is not that. The ceiling belongs to the featured-COMPANIES pool query;
 * the job path passes no limit at all, and the service says so in its own
 * words: the whole pool takes turns, every posting that bought the band is
 * drawn in some period. So the promise holds for all eight. Do not "fix" the
 * page from that column without re-reading which path reads it.
 *
 * PLACEMENT NAMES — taken from the registry on 23/11/2026, on Thu's ask to use
 * the names as they read in Admin → System → Placements. V707 (2026-10-12) sets
 * `name = 'Trang chủ - ' || band`, and the Korea/Global copies take
 * `'Korea - ' || band` / `'Global - ' || band`. V888 and V905 are the only later
 * migrations that rename a placement and neither touches these eight. Read from
 * svn-be origin/dev, NOT from prod-admin — the screenshot Thu referred to as
 * "hình 1" did not come through with her feedback, and prod-admin asks the
 * in-app browser to sign in. If ops has renamed a band by hand in production,
 * production wins and this table needs another pass.
 *
 * SOURCES, read from origin/dev on 2026-11-21 — keep them here, not on the page:
 *   svn-be  docs/architecture/placement-registry.md (registry, 8 bands 1:1 with
 *           8 tiers), V707 (the HOME_ prefix + the KOREA_/GLOBAL_ copies),
 *           V870 (grid_columns / grid_rows / grid_hero / fills_after), V373
 *           (Top job 4 rows + Distinction filling a 6-row block),
 *           PublicReadService (countriesOf, drawJobs, drawnOnPage, leaderCount),
 *           PublicReadRepositoryAdapter (inPlacementPool, feedsPlacement,
 *           coverage_days window, inCountries), CompanyCountryScope,
 *           BandGrid.keep ("lẻ hàng thì cắt"), PeriodicRotation.spreadPage.
 *   svn-web docs/features/home.md, changelog 2026-10-12
 *           feat-korea-global-home-layout.md, dictionaries/vi.json + the live
 *           dev site for the headings a jobseeker actually reads.
 *
 * CUT BY THU ON 23/11/2026, PAGE FEEDBACK — DO NOT RESTORE WITHOUT ASKING:
 *   - "quá hạn nhận hồ sơ" as an entry condition: "ko có khái niệm đó".
 *   - "Công ty đang hoạt động và đã có mã số thuế" — "bỏ lun mst". This is the
 *     same cut she made on the strips page on 22/11, now reaching this one. It
 *     also settles, for this page, the open question in job-display-logic.ts
 *     about whether the tax code belongs in a client guide: it does not.
 *   - The whole "7. Dải không có job thì trang ẩn dải" section. What a reader
 *     actually needs from it survives in §1 — two of the three pages can be
 *     empty while the home page is full.
 *   - §2's three bullets (price order, one tier per band, số thẻ is a ceiling)
 *     and §3's five detail bullets (bậc đang chạy, N-day bands, retired
 *     products, add-ons standing alone). Sales does not read this page for
 *     product mechanics; the product pages carry them.
 *   - Earlier, on the same day: the "1. Tóm lại" recap table, the "Trang này
 *     nói: ..." sentence, and the footer stamp (the header already prints
 *     "Updated" from updated.json). Keeping the stamp off is also why
 *     hideModuleLink is NOT set — the page ends on the module link instead.
 *
 * ADDED 23/11/2026: siteLinks. The page documents three routes and the header
 * printed only "/", so two of the three were unreachable from the page that
 * describes them.
 *
 * KEPT OUT OF THE PAGE, deliberately:
 *   - What the Korea / Global pages hold right now. Observed on dev 21/11/2026:
 *     Korea draws no band at all and Global draws two. That is a selling state,
 *     not logic — it dates the page the moment ops ticks another slot.
 *   - The old country-filtered job board that these two routes used to render
 *     (removed 2026-10-12). A client guide states what the page does now.
 *   - Product codes (JOB-HERO, JOB-SUPERHOT, …). Each band is sold by exactly
 *     one tier of the same name, which is what a reader needs; the code is for
 *     the ticket.
 *
 * NO SCREENSHOTS YET. board-strips opens with two, and this page would read
 * better with one of the homepage showing the bands stacked. public/shots/
 * job-display/ holds only the strips and top-search images; the band shot has
 * to be taken off the dev jobseeker site first.
 */
import type { PageDoc } from '../docs'

export const HOME_BANDS_PAGE_DOCS: Record<string, PageDoc> = {
  /* ────────────────────────────────────────────────────────────────────────── */
  'home-job-bands': {
    /* The page documents three routes; one path in the header is a half-truth. */
    siteLinks: [
      { label: 'Trang chủ', path: '/' },
      { label: 'Việc làm Hàn Quốc', path: '/viec-lam/han-quoc' },
      { label: 'Việc làm nước ngoài', path: '/viec-lam/nuoc-ngoai' },
    ],
    blocks: [
      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '1. Tổng quan' },
      {
        kind: 'p',
        text: 'Trang chủ, trang Việc làm Hàn Quốc và trang Việc làm nước ngoài dùng chung một màn hình: tám dải thẻ việc làm xếp từ trên xuống.\n\nMỗi dải là một ô có bán. Job chỉ lên dải khi product của job có bán **đúng dải đó, trên đúng trang đó**.',
      },
      {
        kind: 'table',
        note: 'Ba trang có ba bộ ô riêng. Bán một dải ở trang chủ không đưa job lên dải cùng tên ở hai trang kia — phải bán riêng từng ô.',
        cols: ['Trang', 'Đường dẫn', 'Dải lấy job của công ty nào'],
        rows: [
          ['Trang chủ', '/', 'Mọi công ty, không lọc quốc gia'],
          ['Việc làm Hàn Quốc', '/viec-lam/han-quoc', 'Chỉ công ty có Quốc gia = Hàn Quốc'],
          ['Việc làm nước ngoài', '/viec-lam/nuoc-ngoai', 'Mọi công ty còn lại, kể cả công ty chưa điền quốc gia'],
        ],
      },
      {
        kind: 'list',
        items: [
          'Quốc gia đọc ở CRM → Công ty → Country. Tin ẩn danh không nêu tên công ty nên không có quốc gia để xếp vào Hàn Quốc, luôn thuộc nhóm nước ngoài.',
          'Lọc quốc gia là điều kiện vào dải, không phải cách sắp xếp. Job của công ty Việt Nam có mua ô trên trang Hàn Quốc cũng không lên trang đó.',
          'Hai trang Hàn Quốc và nước ngoài có thể trống hoàn toàn trong khi trang chủ vẫn đầy: chưa bán ô nào thì chưa có dải nào.',
          'Banner trên ba trang là cùng một ô, chia theo quốc gia của người mua banner, không theo công ty của job.',
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '2. Tám dải trên một trang' },
      {
        kind: 'shot',
        src: '/shots/job-display/home-bands.jpg',
        where: 'Jobseeker site',
        caption: 'Trang chủ, từ trên xuống. Số trên mỗi khung đỏ là cột **#** của bảng dưới: **1** Việc làm Premium · **2 · 3** Top Việc Làm Hấp Dẫn (thẻ lớn mở đầu, rồi các thẻ ảnh) · **4 · 5** khối không tiêu đề · **6** Việc làm Tiêu Điểm · **7** Việc Làm Mới Nhất · **8** Mạng Lưới Việc Làm.',
        note: 'Ảnh môi trường dev ngày 25/11/2026, chưa đăng nhập. Dữ liệu thử ít nên các dải chưa đủ số thẻ — số thẻ ở cột cuối của bảng là trần, không phải số luôn có.',
      },
      {
        kind: 'table',
        note: 'Cột Placement là tên ô đúng như trong Admin → System → Placements. Hai trang kia dùng tám ô cùng tên nhưng mang tiền tố Korea - và Global -, ví dụ Korea - Top job, mọi thiết lập giống hệt.',
        cols: ['#', 'Placement', 'Tiêu đề ứng viên thấy', 'Số thẻ'],
        rows: [
          ['1', 'Trang chủ - Recommended', 'Việc làm Premium', '10'],
          ['2', 'Trang chủ - Super hot - Large', 'Top Việc Làm Hấp Dẫn', '1 — thẻ lớn mở đầu dải'],
          ['3', 'Trang chủ - Super hot - Image', '*(nằm trong dải trên)*', '30'],
          ['4', 'Trang chủ - Top job', '*(khối không có tiêu đề)*', '16'],
          ['5', 'Trang chủ - Distinction', '*(lấp tiếp vào khối trên)*', '24'],
          ['6', 'Trang chủ - Job card basic plus', 'Việc làm Tiêu Điểm', '24'],
          ['7', 'Trang chủ - Job card basic', 'Việc Làm Mới Nhất', '30'],
          ['8', 'Trang chủ - Job card free', 'Mạng Lưới Việc Làm', '36'],
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '3. Bước 1 — Lọc: job nào vào được dải' },
      {
        kind: 'list',
        items: [
          'Job đang mở và có placement của đúng dải đó — qua bậc tin đang chạy của job, hoặc add-on hiển thị gắn vào job.',
          'Trang Việc làm Hàn Quốc và Việc làm nước ngoài lọc thêm theo quốc gia của công ty. Trang chủ không lọc.',
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '4. Bước 2 — Xếp hàng chờ lên hiển thị' },
      {
        kind: 'list',
        items: [
          'Mọi job đủ điều kiện của một dải xếp thành một hàng chờ.',
          'Job làm mới gần nhất đứng trước. Job mới vào hàng cũng xếp theo đúng thứ tự đó.',
          'Job của cùng một công ty bị tách ra, rải đều khắp hàng trước khi cắt thành từng lượt. Nhờ vậy một công ty đăng 30 tin cùng lúc không chiếm trọn một lượt hiện.',
          'Tách công ty là cố gắng tối đa, không phải bảo đảm tuyệt đối: các dải này không giới hạn một công ty được bao nhiêu tin, nên khi một công ty nắm hơn nửa số job của dải thì không còn cách xếp nào tránh được hai thẻ của họ đứng cạnh nhau.',
          'Chỗ đứng trong hàng chờ quyết định job vào **lượt nào**. Chỗ đứng trên màn hình trong một lượt thì tính ở Bước 3.',
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '5. Bước 3 — Bốc từng lượt, 5 phút một lần' },
      {
        kind: 'list',
        items: [
          'Dải lấy đúng số thẻ của mình từ đầu hàng, rồi thay cả cụm một lúc chứ không tịnh tiến từng job.',
          'Trong một lượt, thứ tự các thẻ được xáo ngẫu nhiên trước khi lên màn hình, và xáo công bằng: mọi job trong lượt đều có cơ hội đứng đầu, đứng giữa hay đứng cuối như nhau. Qua nhiều lượt, một job được hiện ở nhiều chỗ khác nhau trong dải chứ không đóng đinh một chỗ.',
          'Xáo trong số các cách xếp vẫn tách được job của cùng một công ty, nên việc rải đều ở Bước 2 không bị xáo làm mất.',
          'Vì thứ tự đổi mỗi lượt nên trong dải không có “ô số 1” để bán.',
          'Hết 5 phút lại bốc lượt kế tiếp. Ai mở trang trong cùng 5 phút đó đều thấy cùng một lượt.',
          'Đi hết hàng là hết một vòng. Trong một vòng mọi job trong hàng đều đã tới lượt, không job nào bị bỏ qua.',
          'Lượt cuối của vòng nếu không đủ job thì lấy tiếp từ đầu hàng cho đủ số thẻ — dải không bao giờ hiện hụt.',
          'Sang vòng mới, hàng được xếp lại từ đầu theo lần làm mới mới nhất tại thời điểm đó.',
          'Số thẻ của dải là trần: ít job hơn thì hiện bấy nhiêu, không lấy job chưa mua dải vào cho đủ.',
        ],
      },
      {
        kind: 'example',
        heading: 'VD: dải Việc Làm Mới Nhất, 30 thẻ, đang có 80 job',
        scenario: 'Ứng viên mở trang chủ, rồi tải lại sau mỗi 5 phút.',
        cols: ['Lúc', 'Dải hiện', 'Còn chờ trong hàng'],
        rows: [
          ['Mở trang', '30 job đầu hàng', '50'],
          ['Sau 5 phút', '30 job tiếp theo', '20'],
          ['Sau 10 phút', '20 job cuối hàng, lấy thêm 10 job đầu hàng cho đủ 30 thẻ', '0'],
          ['Sau 15 phút', 'Vòng mới — hàng xếp lại, chạy lại từ đầu', '50'],
        ],
        note: 'Một vòng ở đây dài 15 phút. Dải càng nhiều job thì vòng càng dài, nhưng job nào cũng tới lượt.',
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '6. Bước 4 — Lên lưới: hàng lẻ bị cắt' },
      {
        kind: 'list',
        items: [
          'Các dải xếp theo lưới, và hàng cuối không đủ cột thì bỏ cả hàng. VD lưới 4 cột có 13 job thì hiện 12, job thứ 13 chờ lượt sau.',
          'Số cột: Việc làm Tiêu Điểm 4 cột, Việc Làm Mới Nhất 5 cột, Mạng Lưới Việc Làm 6 cột.',
          'Top job và Distinction nằm chung một khối 6 hàng. Top job xếp trước, nhiều nhất 4 hàng; Distinction lấp nốt chỗ còn trống. Top job ít job thì Distinction lên sớm hơn, khối vẫn liền mạch, không để hàng hụt.',
          'Dải Super hot mở đầu bằng một thẻ lớn. Chưa ai mua thẻ lớn thì chỗ đó để trống, các thẻ thường không tràn sang chiếm.',
          'Thẻ bị cắt vì lẻ hàng ở lượt này sẽ lên trước ở lượt sau.',
        ],
      },
    ],
  },
}
