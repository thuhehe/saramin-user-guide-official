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
          ['Thứ tự', 'Job làm mới gần nhất đứng trước'],
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
          'Thứ tự: job **làm mới gần nhất** đứng trước. Không phải ngày đăng — bấm làm mới tin là lên đầu hàng.',
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
          'Toàn bộ job đủ điều kiện của một dải xếp thành **một hàng**. Dải hiện phần đầu hàng.',
          'Mỗi **5 phút**, dải **lật sang nhóm tiếp theo** trong hàng. Hết hàng thì xếp lại từ đầu.',
          'Đi hết một vòng thì **mọi job trong hàng đều đã được hiện đúng một lần** — không job nào bị bỏ qua.',
          'Mọi người mở trang trong cùng một nhịp 5 phút đều thấy **cùng một danh sách**. Thứ tự tính theo đồng hồ, không theo từng lượt truy cập.',
          'Trong một lượt hiện, job của **cùng một công ty được rải ra**, không đứng cạnh nhau.',
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
          ['Sau 10 phút', '20 job cuối hàng', '0'],
          ['Sau 15 phút', 'Quay lại 30 job đầu hàng', '50'],
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
