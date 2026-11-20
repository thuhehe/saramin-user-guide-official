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
 * THE FIXED SHAPE OF A PLACEMENT PAGE — keep it when adding the next one:
 *   §1 Tóm lại            a four-row table: điều kiện → thứ tự → cắt → hiện
 *   §2 Job nào đủ điều kiện
 *   §3 Thứ tự và số job được giữ
 *   §4 Khi nào dải hiện ra
 *   §5 Xoay vòng trên ô này
 *
 * VOCABULARY. Never "vẽ" for what the user sees — it reads as jargon. Use
 * "hiện" / "hiển thị". Never "ai" for jobs; jobs are not people.
 *
 * MOSTLY AS-BUILT, WITH TWO EXCEPTIONS. The Top search page carries two rules
 * that are AGREED but NOT on production, both in task SRM-1739: the strip is
 * filtered by keyword AND the search-bar filters, and the strip rotates
 * conveyor-style. Every place that states them is marked SRM-1739; nothing
 * else on the page describes anything but running code.
 *
 * Read from origin/dev on 2026-11-20:
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

const STAMP_ASBUILT = `${STAMP} Đây là mô tả *cái đang chạy*, không phải bản yêu cầu.`

const STAMP_TOP_SEARCH = `${STAMP} Riêng **hai luật đã chốt mà code chưa làm** — lọc theo bộ lọc và xoay vòng băng chuyền — được ghi rõ là **theo task SRM-1739**; mọi chỗ khác trên trang là cái đang chạy.`

export const JOB_DISPLAY_PAGE_DOCS: Record<string, PageDoc> = {
  /* ────────────────────────────────────────────────────────────────────────── */
  'top-search': {
    story:
      'Là người đọc tài liệu này, tôi muốn biết **dải job nằm trên đầu trang tìm kiếm chọn 8 job đó như thế nào**.',
    blocks: [
      {
        kind: 'p',
        text: 'Dải này tên là **Top search**. Nó nằm ngay trên danh sách kết quả tìm kiếm, tiêu đề *“Việc {từ khoá} dành cho bạn”*, 8 thẻ job, trên máy tính chia **2 slide 4 thẻ** và tự chạy mỗi 3 giây.\n\nTrang này đi theo đúng thứ tự hệ thống chạy: **job nào đủ điều kiện → xếp theo gì → giữ mấy job → khi nào dải hiện ra**. Đọc hết §1–§5 là hiểu toàn bộ bộ máy.',
      },
      {
        kind: 'warn',
        text: '**Hai luật trên trang này đã chốt nhưng code chưa làm**, cả hai nằm trong task **SRM-1739**: ① dải lọc theo **từ khoá cộng với các bộ lọc** người dùng đặt trên thanh tìm kiếm (§1, §2, §4); ② dải **xoay vòng** để job sau trong hàng cũng tới lượt (§5).\n\nMọi chỗ viết hai luật này đều ghi kèm *SRM-1739*. Phần còn lại của trang là **cái đang chạy trên production hôm nay**.',
      },
      {
        kind: 'shot',
        src: '/shots/job-display/top-search-on-page.jpg',
        where: 'Jobseeker site',
        caption:
          '**Ô Top search là khung đỏ** — trang kết quả tìm kiếm, từ khoá *ngân hàng*. Ô nằm **trên** khối *Kết quả tìm kiếm*, và chỉ hiện **4 thẻ một lúc**: 8 job chia 2 slide.',
        note:
          'Khối *Kết quả tìm kiếm* ngay dưới là danh sách kết quả bình thường — **không phải** ô này, và chạy theo luật khác hẳn.',
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '§1 · Tóm lại: bốn bước' },
      {
        kind: 'table',
        note: 'Bốn bước này chạy lại **mỗi lần người dùng đổi từ khoá hoặc bộ lọc**. Không có danh sách nào được lưu sẵn. Hàng job đủ điều kiện **xoay vòng theo chu kỳ** (*SRM-1739*) — xem §5.',
        cols: ['Bước', 'Hệ thống làm gì', 'Ra cái gì', 'Đọc chi tiết ở'],
        rows: [
          ['**1 · Lọc**', 'Giữ job **đang hiển thị bình thường** trên site, **khớp từ khoá và các bộ lọc người dùng đặt** (*SRM-1739* — hôm nay mới gửi từ khoá), và **product của job có tick ô Top search** (hoặc job có add-on Top search đang chạy).', 'Tập job đủ điều kiện — **nhiều hay ít tuỳ từ khoá**; tổng số job đã mua ô này hôm nay trên production là **2.624**', '§2'],
          ['**2 · Sắp xếp**', 'Xếp theo **lần làm mới gần nhất** (`refreshed_at`), mới nhất trước. **Đè lên** menu sắp xếp người dùng chọn.', 'Một danh sách có thứ tự', '§3'],
          ['**3 · Cắt**', 'Lấy **8 job đầu**. Không lấp thêm, không bỏ job đã có trong danh sách kết quả bên dưới.', '**8 thẻ**', '§3'],
          ['**4 · Hiện**', 'Dải **chỉ hiện khi có từ khoá**. Trang tìm kiếm gửi lên server **từ khoá cùng các bộ lọc đang đặt** (*SRM-1739* — hôm nay mới gửi từ khoá).', 'Dải trên đầu trang kết quả', '§4'],
        ],
      },
      {
        kind: 'list',
        heading: 'Ba điều dễ hiểu nhầm nhất',
        items: [
          '**Top search không phải một bậc tin.** Nó là một **ô hiển thị** mà product nào cũng có thể được tick vào — trên production hôm nay có **8 product chính và 1 add-on** đang tick nó.',
          '**Dải chạy theo từ khoá *và* bộ lọc.** Luật đã chốt: dải lọc theo **từ khoá người dùng gõ cộng với mọi bộ lọc họ đặt** — địa điểm, ngành nghề, mức lương, hình thức, kinh nghiệm (*SRM-1739*). **Hôm nay giao diện mới chỉ gửi từ khoá**, nên đặt bộ lọc thì danh sách kết quả đổi mà dải đứng yên — đây là giới hạn của giao diện, **không phải** của server (§4).',
          '**Không có từ khoá thì không có dải.** Mở `/search` trống, hay bấm vào một bộ lọc từ trang chủ mà không gõ chữ nào — dải **không xuất hiện**.',
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '§2 · Bước 1 — Job nào đủ điều kiện vào dải' },
      {
        kind: 'p',
        text: 'Ba lớp điều kiện, **và** với nhau. Rớt một lớp là không bao giờ xuất hiện, dù job mới đăng đến đâu.',
      },
      {
        kind: 'table',
        cols: ['Lớp', 'Điều kiện', 'Ghi chú'],
        rows: [
          ['**1 · Hiển thị bình thường**', 'Job `OPEN` · bật hiển thị (`exposure`) · công ty `ACTIVE` và **có mã số thuế** (công ty nước ngoài thì có `foreign_tax_id`) · chưa quá `expire_at` và `posting_expires_at`', 'Đúng bộ điều kiện mọi màn hình công khai dùng — không có ngoại lệ riêng cho dải này'],
          ['**2 · Khớp từ khoá và bộ lọc**', 'Job khớp **từ khoá người dùng gõ** và **mọi bộ lọc họ đặt** trên thanh tìm kiếm — địa điểm, ngành nghề, mức lương, hình thức, kinh nghiệm — theo đúng luật tìm kiếm thường (*SRM-1739*)', 'Hôm nay giao diện **mới chỉ gửi từ khoá**, nên phần bộ lọc chưa chạy — xem §4. Không gõ gì thì server vẫn trả về được, nhưng giao diện **không gọi**'],
          ['**3 · Đã mua ô Top search**', 'Một trong **hai** đường: ① **product của bậc đang chạy** có tick ô Top search; ② job có **add-on hiển thị** (`DISPLAY_PLACEMENT`) đang trong hạn, trên một product `ACTIVE` có tick ô Top search', 'Đường ② mới có từ **17/11/2026**. Trước đó job mua Top search dạng add-on khớp từ khoá, nằm trong danh sách kết quả, nhưng **không bao giờ lên dải**'],
        ],
      },
      {
        kind: 'list',
        heading: '2a · Bốn chi tiết hay bị hỏi',
        items: [
          '**“Bậc đang chạy” là bậc cao nhất job đang giữ.** Job có nhiều lượt chạy cùng lúc thì hệ thống lấy lượt chạy `ACTIVE`, còn trong hạn, có **thứ tự bậc cao nhất**. Product của lượt chạy đó phải đang `ACTIVE` — product đã **archive** thì job rơi khỏi dải, dù lượt chạy vẫn còn hạn.',
          '**Coverage days trên dòng tick không được đọc.** Trong form product, mỗi ô tick có thể đặt “hiển thị trong N ngày đầu”. Với Top search **ô đó không có tác dụng** — code không đọc cột này. Hôm nay mọi dòng đều để trống nên chưa ai thấy; đặt một con số vào đó sẽ **không** giới hạn được gì.',
          '**Dashboard đếm 2.626, ô tìm kiếm trả 2.624 — lệch có lý do.** Dashboard *Placement load* đếm cả job đang chạy trên **product đã archive** (câu truy vấn của nó không lọc trạng thái product), còn dải thật loại chúng ra; cần con số đúng với cái người dùng thấy thì lấy từ ô tìm kiếm.',
          '**Trên production đang có product tên TOP JOB - TEST ở trạng thái ACTIVE**, giá 3.000.000 đ, có tick ô Top search — nếu là dữ liệu thử thì nên chuyển sang *Inactive*, vì product `ACTIVE` là product bán được và job chạy nó lên dải thật.',
        ],
      },
      {
        kind: 'warn',
        text: '**Dải này KHÔNG đi qua API placement.** Mọi ô khác lấy nội dung qua `GET /placements/{id}/jobs`; Top search lấy qua **chính ô tìm kiếm** (`GET /jobs/search?topSearchOnly=true`). Dòng `placement_top_search` khai `fill_route = TIER` **chỉ để** nó hiện ra trong danh sách tick của form product — đó là toàn bộ lý do nó mang giá trị TIER.\n\nHệ quả: gọi `GET /placements/placement_top_search/jobs` vẫn trả về 8 job (thử trên production 20/11: 8 job, đều của MBBANK), nhưng **không màn hình nào hiển thị kết quả đó**. Đừng dùng nó để kiểm tra dải.',
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '§3 · Bước 2 và 3 — Thứ tự, và vì sao chỉ 8 job' },
      {
        kind: 'table',
        cols: ['Câu hỏi', 'Câu trả lời', 'Nghĩa là'],
        rows: [
          ['Xếp theo gì?', '`refreshed_at` giảm dần, hoà thì theo `id`', '**Lần làm mới gần nhất**, không phải ngày đăng. Job nào bấm làm mới (hoặc được làm mới tự động) thì nhảy lên đầu dải'],
          ['Người dùng chọn “Lương cao nhất” thì sao?', 'Dải **không đổi**', 'Thứ tự của dải **đè lên** menu sắp xếp. Menu chỉ điều khiển danh sách kết quả bên dưới'],
          ['Có chia đều cho các công ty không?', '**Không**', 'Dải job *Lựa chọn tạo nên khác biệt* ngay dưới kết quả **có** chia lượt theo công ty; Top search **cố tình không**. Một công ty làm mới job liên tục có thể giữ cả 8 chỗ của **một nhịp** — xoay vòng ở §5 mới là thứ cho các job sau tới lượt'],
          ['Vì sao đúng 8?', '`items_shown = 8` trên dòng registry, và giao diện cũng xin đúng 8', 'Đổi số này ở **Product settings → Placements** thì cả hai phía đổi theo'],
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '§4 · Bước 4 — Khi nào dải hiện ra' },
      {
        kind: 'p',
        text: '**Luật đã chốt:** dải hiện khi người dùng có từ khoá, và trang tìm kiếm gửi lên server **từ khoá cùng mọi bộ lọc đang đặt** trên thanh tìm kiếm (*SRM-1739*).\n\n**Hôm nay chưa như vậy**, và chỗ thiếu nằm ở **giao diện, không phải server**: trang tìm kiếm gọi server bằng đúng **bốn** thông tin — ngôn ngữ, **từ khoá**, cờ `topSearchOnly`, và số lượng 8. Mọi thứ khác trên thanh tìm kiếm **không được gửi đi**, nên đặt bộ lọc thì dải đứng yên.',
      },
      {
        kind: 'table',
        note: 'Cột cuối là luật đã chốt ở **SRM-1739**, chưa lên production.',
        cols: ['Người dùng làm gì', 'Danh sách kết quả', 'Dải — hôm nay', 'Dải — theo SRM-1739'],
        rows: [
          ['Gõ từ khoá', 'Đổi', '**Đổi**', '**Đổi**'],
          ['Chọn địa điểm · ngành nghề · mức lương · hình thức · kinh nghiệm…', 'Đổi', 'Không đổi', '**Đổi theo**'],
          ['Đổi menu sắp xếp', 'Đổi', 'Không đổi', 'Không đổi — thứ tự dải do §3 quyết định, không do menu'],
          ['Sang trang 2, 3, 4…', 'Đổi', 'Không đổi — dải hiện lại y hệt trên mọi trang kết quả', 'Không đổi'],
          ['Không gõ từ khoá nào', 'Vẫn có kết quả', '**Không có dải**', '**Không có dải**'],
        ],
      },
      {
        kind: 'example',
        heading: 'Đo thẳng trên production, 20/11/2026',
        scenario:
          'Gọi đúng API mà trang tìm kiếm gọi, với từ khoá *“ngân hàng”*, rồi gọi lại với thêm điều kiện lương tối thiểu 100 triệu.',
        cols: ['Gọi gì', 'Số job đủ điều kiện', '8 thẻ là của ai'],
        rows: [
          ['Dải, từ khoá *ngân hàng*', '2.592', 'MBBANK × 8'],
          ['Dải, *ngân hàng* + lương ≥ 100tr **(hôm nay giao diện chưa gửi cái này)**', '0', 'không thẻ nào'],
          ['Danh sách kết quả, *ngân hàng* + lương ≥ 100tr', '7', '—'],
          ['Dải, không từ khoá', '2.624', '— (giao diện không gọi)'],
        ],
        note:
          'Dòng thứ hai là bằng chứng: **server hoàn toàn biết lọc**. Khi gửi kèm bộ lọc lương, dải tụt từ 2.592 job xuống 0. Nên **SRM-1739 không phải việc mới ở server** — chỉ là giao diện gửi thêm các bộ lọc đang đặt lên cùng từ khoá.',
      },
      {
        kind: 'list',
        heading: '4a · Ba luật nhỏ đi kèm',
        items: [
          '**Không lấp bù.** Chỉ có 3 job đủ điều kiện thì dải hiện 3 thẻ. Không bao giờ lấy job chưa trả tiền vào cho đủ 8.',
          '**Không loại trùng.** Một job có thể vừa nằm trên dải vừa nằm trong danh sách kết quả ngay bên dưới. Đúng thiết kế.',
          '**Gọi hỏng thì dải biến mất, trang vẫn chạy.** Lỗi của dải không làm hỏng kết quả tìm kiếm.',
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '§5 · Xoay vòng — băng chuyền 4 job một nhịp' },
      {
        kind: 'p',
        text: '**Luật đã chốt** (*SRM-1739*, chưa lên production): xếp **toàn bộ** job đủ điều kiện thành **một hàng**, theo đúng thứ tự ở §3. Bốn job đầu hàng là **slide 1**, bốn job kế tiếp là **slide 2**.\n\nHết **một nhịp** — `rotation_seconds`, production đang để **300 giây** tức 5 phút — cả hàng **dịch lên 4 chỗ**: bốn job của slide 2 lên thành slide 1, bốn job kế tiếp trong hàng vào slide 2. Đi tới cuối hàng thì **quay lại đầu hàng**.',
      },
      {
        kind: 'example',
        heading: '5a · Ví dụ: một từ khoá có 100 job đủ điều kiện',
        scenario:
          'Người dùng mở trang kết quả, rồi tải lại sau mỗi 5 phút. Hàng job đứng yên; cái dịch đi là **cửa sổ 8 chỗ** trượt dọc hàng.',
        cols: ['Lúc nào', 'Slide 1', 'Slide 2'],
        rows: [
          ['Mở trang', 'Job **1–4**', 'Job **5–8**'],
          ['5 phút sau, tải lại', 'Job **5–8**', 'Job **9–12**'],
          ['10 phút sau nữa', 'Job **9–12**', 'Job **13–16**'],
          ['…', '…', '…'],
          ['Hết job thứ 100', 'Quay lại job **1–4**', 'Job **5–8**'],
        ],
        note:
          'Khác với hôm nay ở đúng một chỗ: **mọi job trong hàng đều tới lượt**, thay vì 8 job đầu hàng giữ chỗ mãi còn job thứ 9 trở đi không bao giờ được hiện.',
      },
      {
        kind: 'table',
        heading: '5b · Chỗ nào trong hệ thống đọc rotation_seconds',
        cols: ['Ở đâu', 'Có đọc rotation_seconds không', 'Vì sao'],
        rows: [
          ['Các ô trang chủ / Korea / Global', '**Có**', 'Đi qua `PublicReadService`, hàm này gọi bộ xoay vòng theo chu kỳ'],
          ['Banner và popup', '**Có**', 'Đi qua `BannerService`, cùng bộ xoay vòng'],
          ['**Top search**', '**Có** — theo *SRM-1739*', 'Hôm nay đường tìm kiếm **chưa có** đoạn xoay vòng nào; dựng đoạn đó chính là nội dung task'],
          ['Dashboard *Placement load*', '**Chưa** — đang cố tình ép rỗng', 'Xem cảnh báo ngay dưới'],
        ],
      },
      {
        kind: 'warn',
        text: '**Dashboard *Placement load* đang chắn đường, và dọn nó nằm trong task.** Khi dựng lại 3 ô dạng tìm kiếm, dashboard **ép `rotation_seconds` về rỗng** rồi mới tính — cố ý, vì tới hôm nay các ô đó thật sự không xoay vòng, và không ép thì nó báo hàng nghìn job *“đang chờ tới lượt”* mà không bao giờ tới.\n\nKhi Top search xoay vòng thật, chỗ ép đó làm dashboard **sai theo chiều ngược lại**: nhóm *Waiting for a turn* phải ra số thật thì mới đọc được. Bỏ nó **là một phần của SRM-1739**, không phải việc dọn sau.',
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
      '**Trong nhóm TIER còn chia tiếp làm hai, và đây mới là chỗ hay sai:** phần lớn hộp được trang chủ/bảng tin tự lấp và **có xoay vòng**; còn **3 hộp** được lấp bằng chính ô tìm kiếm và **hôm nay không xoay vòng** — `rotation_seconds` đặt trên 3 hộp đó không ai đọc. Riêng **Top search**, task **SRM-1739** đang làm phần xoay vòng đó — xem `/trang/top-search` §5.',
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
          ['`items_shown`', 'Hộp hiện bao nhiêu thẻ cùng lúc', '`8` với Top search'],
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
          ['Có xoay vòng?', '**Có**, theo `rotation_seconds`', '**Hôm nay chưa** — đường tìm kiếm không có đoạn code xoay vòng nào. Riêng Top search: đang làm ở **SRM-1739**'],
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
        text: '**Hôm nay cả 28 hộp TIER đều đang để rotation_seconds = 300** (5 phút) — kể cả 3 hộp search-fed. Với 25 hộp tier-fed, con số đó chạy thật. Với 3 hộp search-fed, nó **chưa làm gì cả**: dải lấy N job đầu theo `refreshed_at` và dừng ở đó, job thứ N+1 trở đi không tới lượt. Với **Top search**, đó đúng là thứ **SRM-1739** đang sửa — con số 300 sẽ bắt đầu có tác dụng.',
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
        note: 'Mỗi trang đi theo **cùng một bố cục**: §1 Tóm lại → §2 Job nào đủ điều kiện → §3 Thứ tự và số job giữ lại → §4 Khi nào dải hiện ra → §5 Xoay vòng. Thêm hộp mới thì thêm một trang theo đúng bố cục đó.',
        cols: ['Hộp', 'Ở đâu trên site', 'Loại', 'Trang'],
        rows: [
          ['**Tìm kiếm — Top search**', 'Dải 8 thẻ trên đầu trang kết quả tìm kiếm', 'Search-fed', '`/trang/top-search`'],
          ['*Các dải trang chủ · Korea · Global*', 'Super hot · Top job · Distinction · Basic plus · Basic · Free · Recommended', 'Tier-fed', '*chưa có trang riêng*'],
          ['*Mega menu — Trending jobs / Don’t miss these jobs*', 'Hai dải trên các trang bảng tin của mega menu', 'Search-fed', '*chưa có trang riêng — xem /trang/jobs-pages*'],
          ['*Banner và popup*', 'Trang chủ, trang công ty, trang cá nhân, trang đăng nhập', '`BOOKED`', '*xem nhóm Content*'],
        ],
      },

      { kind: 'p', text: `*${STAMP_ASBUILT}*` },
    ],
  },
}
