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
 * VOICE. Same as the top search page: sections "1." "2.", plain statements,
 * short table cells, one fact per line, examples on one line with an arrow, NO
 * code identifiers (not `items_shown` but "số thẻ"; not `refreshed_at` but "lần
 * làm mới gần nhất"). Name things the way an operator sees them on screen.
 * Never "vẽ" — use "hiện" / "hiển thị". Jobs are not people, so never "ai".
 *
 * SHAPE:
 *   1 Tóm lại
 *   2 Ba trang, một bộ dải — khác nhau ở quốc gia của công ty
 *   3 Tám dải trên một trang
 *   4 Job nào đủ điều kiện lên dải
 *   5 Xếp theo gì, hiện bao nhiêu thẻ
 *   6 Xoay vòng: 5 phút đổi sang nhóm job tiếp theo
 *   7 Khi nào một dải biến mất khỏi trang
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
 * ORDER INSIDE A BAND — corrected 21/11/2026. The first draft said "job làm
 * mới gần nhất đứng trước", carried over from the pool query's ORDER BY. That
 * cannot hold together with the 5-minute rotation the same page describes: a
 * band cannot both show the most recently refreshed N and walk every job in
 * the pool. The rotation wins, and it is also the better rule. Every band
 * carries rotation_seconds = 300 (V354), so spreadPage lays the whole pool out
 * once per cycle keyed off each job's own id and company — the incoming
 * refresh order is discarded — then cuts it into one page per period. So:
 * refreshing a posting buys nothing on these bands, and what a product buys is
 * a better band and more turns, never a place at the head of one. That is the
 * same conclusion the two job-board strips reached on their own redesign
 * (tier out of the sort keys, product buys frequency), so the two pages agree.
 * The company spreading is best effort, and the reason is the MISSING CAP, not
 * the repair pass. A run of n cards can be arranged with no two of one company
 * adjacent exactly when the largest company holds at most ceil(n/2) of them.
 * These bands cap nobody, so one company can hold most of a band's pool and no
 * algorithm can space it. (The two job-board strips cap a company at 10% of the
 * cards, which keeps every instance far inside that bound, so THEY can promise
 * "never adjacent" outright — their cap and their spacing rule hold each other
 * up.) Say the cap is what differs if the two pages are ever reconciled; the
 * weaker wording here is not sloppiness on either side. Their guarantee also
 * has to be BUILT as a construction — deal each round from scratch, always
 * taking the company with the most cards left — and not as a pass that walks
 * an existing order patching collisions forward, which is what the code does
 * today and is not known to be complete even when an arrangement exists. The
 * cap pays for the guarantee; only the construction collects it.
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
 */
import type { PageDoc } from '../docs'

const STAMP_HOME_BANDS = 'Cập nhật 21/11/2026.'

export const HOME_BANDS_PAGE_DOCS: Record<string, PageDoc> = {
  /* ────────────────────────────────────────────────────────────────────────── */
  'home-job-bands': {
    blocks: [
      {
        kind: 'p',
        text: 'Trang chủ, trang **Việc làm Hàn Quốc** và trang **Việc làm nước ngoài** dùng **chung một bố cục**: tám dải thẻ việc làm xếp từ trên xuống. Mỗi dải là một ô có bán — job chỉ lên dải khi bậc tin của job, hoặc add-on hiển thị gắn vào job, có bán **đúng dải đó trên đúng trang đó**.\n\nTrang này nói: ba trang khác nhau chỗ nào, một trang có những dải gì, job nào lên được dải, xếp theo gì, hiện bao nhiêu thẻ, xoay vòng ra sao, và khi nào một dải biến mất khỏi trang.',
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '1. Tóm lại' },
      {
        kind: 'table',
        note: '**“Đủ điều kiện”** ở trang này nghĩa là job đạt **cả ba** điều: đang hiển thị bình thường trên site, đúng nhóm quốc gia của trang, và đã mua đúng dải đó — qua bậc tin đang chạy của job, hoặc add-on hiển thị gắn vào job. Mục 4 nói rõ từng điều.',
        cols: ['Hạng mục', 'Các dải chạy thế nào'],
        rows: [
          ['Dùng chung bố cục', 'Trang chủ · Việc làm Hàn Quốc · Việc làm nước ngoài'],
          ['Mỗi trang có', '8 dải job, xếp từ bậc cao xuống bậc thấp'],
          ['Mỗi dải bán riêng', 'Dải trang chủ và dải cùng tên ở hai trang kia là **ba ô khác nhau**'],
          ['Job lên dải vì', 'Bậc tin, hoặc add-on hiển thị, có bán đúng ô đó'],
          ['Lọc theo', 'Quốc gia của công ty — chỉ ở hai trang Hàn Quốc và nước ngoài'],
          ['Không lọc theo', 'Từ khoá — ba trang này không có ô tìm kiếm dẫn vào dải'],
          ['Thứ tự trong dải', 'Rải đều theo công ty — không job nào được xếp trước vì mới đăng hay mới làm mới'],
          ['Số thẻ', 'Đặt riêng cho từng dải — xem mục 3'],
          ['Xoay vòng', '5 phút đổi sang nhóm job tiếp theo'],
          ['Dải không có job', 'Trang ẩn luôn dải đó'],
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '2. Ba trang, một bộ dải — khác nhau ở quốc gia của công ty' },
      {
        kind: 'table',
        cols: ['Trang', 'Đường dẫn', 'Dải lấy job của công ty nào'],
        rows: [
          ['**Trang chủ**', '`/`', 'Mọi công ty — không lọc quốc gia'],
          ['**Việc làm Hàn Quốc**', '`/viec-lam/han-quoc`', 'Chỉ công ty có **Quốc gia = Hàn Quốc**'],
          ['**Việc làm nước ngoài**', '`/viec-lam/nuoc-ngoai`', 'Mọi công ty còn lại, **kể cả công ty chưa điền quốc gia**'],
        ],
        note: 'Quốc gia đọc ở **CRM → Công ty → Country**. Tin **ẩn danh** không nêu tên công ty nên không có quốc gia để xếp vào Hàn Quốc — tin ẩn danh luôn thuộc nhóm nước ngoài.',
      },
      {
        kind: 'list',
        items: [
          'Ba trang có **ba bộ ô riêng**. Tick một dải cho product ở trang chủ **không** đưa job lên dải cùng tên ở hai trang kia — phải tick riêng từng ô.',
          'Vì vậy hai trang Hàn Quốc / nước ngoài có thể **trống hoàn toàn** trong khi trang chủ vẫn đầy: chưa bán ô nào thì chưa có dải nào.',
          'Lọc quốc gia là **điều kiện bắt buộc**, không phải cách sắp xếp: job của công ty Việt Nam dù đã mua ô trên trang Hàn Quốc cũng **không** lên trang đó.',
          'Banner trên ba trang là **cùng một ô**, chia theo quốc gia của **người mua banner**, không theo công ty của job.',
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '3. Tám dải trên một trang' },
      {
        kind: 'table',
        note: 'Tên dải trong bảng là tên ô ở **Product settings → Placements**. Trên hai trang kia, tám ô này mang tiền tố *Korea -* và *Global -*, mọi thiết lập giống hệt.',
        cols: ['#', 'Dải', 'Tiêu đề ứng viên thấy', 'Số thẻ'],
        rows: [
          ['1', 'Recommended', 'Việc làm Premium', '10'],
          ['2', 'Super hot - Large', 'Top Việc Làm Hấp Dẫn', '1 — thẻ lớn mở đầu dải'],
          ['3', 'Super hot - Image', '*(nằm trong dải trên)*', '30'],
          ['4', 'Top job', '*(khối không có tiêu đề)*', '16'],
          ['5', 'Distinction', '*(lấp tiếp vào khối trên)*', '24'],
          ['6', 'Job card basic plus', 'Việc làm Tiêu Điểm', '24'],
          ['7', 'Job card basic', 'Việc Làm Mới Nhất', '30'],
          ['8', 'Job card free', 'Mạng Lưới Việc Làm', '36'],
        ],
      },
      {
        kind: 'list',
        items: [
          'Thứ tự trên trang là **thứ tự giá giảm dần**: dải đắt nhất nằm trên cùng.',
          '**Mỗi dải do đúng một bậc tin bán**, và bậc tin đó trùng tên với dải. Nên một job bình thường chỉ xuất hiện ở **một dải** trên một trang; mua thêm add-on hiển thị thì có thêm dải.',
          'Số thẻ là **trần của dải**, đặt trên từng ô. Đổi số này là việc của người vận hành, không cần dev.',
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '4. Job nào đủ điều kiện lên dải' },
      {
        kind: 'table',
        note: 'Job phải đạt **cả ba**. Rớt một điều kiện là không lên dải, dù job mới đăng đến đâu.',
        cols: ['Điều kiện', 'Nội dung'],
        rows: [
          ['1. Đang hiển thị bình thường', 'Job đang mở, đang bật hiển thị, chưa quá hạn nhận hồ sơ và chưa hết hạn chạy tin. Công ty đang hoạt động và đã có mã số thuế'],
          ['2. Đúng nhóm quốc gia của trang', 'Trang chủ không lọc. Hàn Quốc giữ công ty Hàn Quốc; nước ngoài giữ phần còn lại'],
          ['3. Đã mua đúng dải đó', 'Bậc tin đang chạy có bán dải này, **hoặc** job có add-on hiển thị còn hạn'],
        ],
      },
      {
        kind: 'list',
        items: [
          'Bậc đang chạy: bậc **cao nhất** job đang giữ, còn trong hạn.',
          'Bậc tin bắt đầu tính từ lúc **đăng tin**, không phải lúc chọn product trên form.',
          '**Có dải chỉ bán trong N ngày đầu.** Hết số ngày đó job rời dải, nhưng tin **vẫn đăng bình thường** ở mọi chỗ khác. Số ngày đặt ở từng ô trong product.',
          'Product đã ngừng bán: job rớt khỏi dải, dù bậc tin còn hạn.',
          'Add-on hiển thị: mua kèm vào job đang chạy bậc bất kỳ, **không cần đổi bậc**.',
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '5. Xếp theo gì, hiện bao nhiêu thẻ' },
      {
        kind: 'list',
        items: [
          'Trong một dải, **không job nào được ưu tiên đứng trước**. Mua bậc cao hơn là mua **dải tốt hơn và nhiều lượt hiện hơn**, không phải mua chỗ đứng đầu dải.',
          '**Bấm làm mới tin không đẩy job lên đầu dải.** Làm mới có tác dụng ở trang tìm kiếm, không có tác dụng ở các dải này.',
          'Hàng chờ của dải được **xếp lại ở mỗi vòng**: job của cùng một công ty bị tách ra, **rải đều khắp hàng** trước khi cắt thành từng lượt. Nhờ vậy một công ty đăng 30 tin cùng lúc không chiếm trọn một lượt hiện.',
          'Số thẻ của dải là trần: ít job hơn thì hiện bấy nhiêu, **không** lấy job chưa mua dải vào cho đủ.',
          '**Hàng cuối lẻ thì bỏ cả hàng.** Các dải xếp theo lưới: *Việc làm Tiêu Điểm* 4 cột, *Việc Làm Mới Nhất* 5 cột, *Mạng Lưới Việc Làm* 6 cột. VD: lưới 4 cột có 13 job → hiện 12, job thứ 13 chờ lượt sau.',
          '**Top job và Distinction nằm chung một khối 6 hàng.** Top job xếp trước, nhiều nhất 4 hàng; Distinction lấp nốt chỗ còn trống của khối. Top job ít job thì Distinction lên sớm hơn, khối vẫn liền mạch, không để hàng hụt.',
          '**Dải Super hot mở đầu bằng một thẻ lớn.** Chưa ai mua thẻ lớn thì chỗ đó để trống, các thẻ thường không tràn sang chiếm.',
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '6. Xoay vòng: 5 phút đổi sang nhóm job tiếp theo' },
      {
        kind: 'list',
        items: [
          'Toàn bộ job đủ điều kiện của một dải xếp thành **một hàng chờ**. Dải hiện phần đầu hàng.',
          'Mỗi **5 phút**, dải **lật sang nhóm tiếp theo** trong hàng. Hết hàng là xong **một vòng**.',
          'Đi hết một vòng thì **mọi job trong hàng đều đã tới lượt** — không job nào bị bỏ qua.',
          'Lượt cuối của vòng nếu không đủ job thì **lấy tiếp từ đầu hàng cho đủ số thẻ** — dải không bao giờ hiện hụt.',
          'Sang vòng mới, **hàng được xếp lại từ đầu**, nên thứ tự vòng này khác vòng trước.',
          'Mọi người mở trang trong cùng một nhịp 5 phút đều thấy **cùng một danh sách**. Thứ tự tính theo đồng hồ, không theo từng lượt truy cập.',
          'Job của **cùng một công ty được tách ra**, không đứng cạnh nhau. Đây là **cố gắng tối đa**, không phải bảo đảm tuyệt đối: các dải này **không giới hạn một công ty được bao nhiêu tin**, nên khi một công ty nắm hơn nửa số job của dải thì không còn cách xếp nào tránh được hai thẻ của họ đứng cạnh nhau.',
          'Thẻ bị cắt vì lẻ hàng ở lượt này sẽ **lên trước ở lượt sau**.',
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
          ['Sau 10 phút', '20 job cuối hàng, lấy thêm **10 job đầu hàng** cho đủ 30 thẻ', '0'],
          ['Sau 15 phút', 'Vòng mới — hàng xếp lại, chạy lại từ đầu', '50'],
        ],
        note: 'Một vòng ở đây dài **15 phút**. Dải càng nhiều job thì vòng càng dài, nhưng job nào cũng tới lượt.',
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '7. Khi nào một dải biến mất khỏi trang' },
      {
        kind: 'list',
        items: [
          'Dải **không còn job nào đủ điều kiện** → trang **ẩn luôn dải đó**, không để khung trống, không để tiêu đề trơ ra.',
          'Trang **không** lấy job của dải khác, hay job chưa mua dải, vào lấp chỗ.',
          'Nên số dải nhìn thấy trên một trang **thay đổi theo những gì đang bán**: có lúc đủ tám dải, có lúc chỉ còn vài dải, có lúc không còn dải nào.',
          'Ẩn dải là **đúng thiết kế**, không phải lỗi. Muốn dải hiện lại thì bán ô đó cho một bậc tin, hoặc chờ có job mua bậc đang bán ô đó.',
        ],
      },

      { kind: 'p', text: `*${STAMP_HOME_BANDS}*` },
    ],
  },
}
