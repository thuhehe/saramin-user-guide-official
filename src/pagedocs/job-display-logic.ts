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
 *   §1 Tóm lại            a four-row table: điều kiện → thứ tự → cắt → vẽ
 *   §2 Job nào đủ điều kiện
 *   §3 Thứ tự và số job được giữ
 *   §4 Front end vẽ ô khi nào
 *   §5 Xoay vòng trên ô này
 *   §6 Sales bán được gì — và không được hứa gì
 *   §7 Những gì chưa có
 *
 * WRITTEN AS-BUILT. Read from origin/dev on 2026-11-20:
 *   svn-be  785c698d7
 *   svn-web ed538a26e
 *   saramin-vn-admin a63d271d
 * Production figures read the same day from prod-admin.saramin.vn
 * (/api/admin/placements, /api/admin/jobs/placement-load, the public
 * /api/vi/jobs/search behind the same host).
 */
import type { PageDoc, ModuleDoc } from '../docs'

const STAMP =
  'Viết theo **code đang chạy** trên nhánh `dev`, đọc ngày 20/11/2026 (svn-be `785c698d7` · svn-web `ed538a26e` · admin `a63d271d`), số liệu đo thẳng trên **production** cùng ngày. Đây là mô tả *cái đang chạy*, không phải bản yêu cầu.'

export const JOB_DISPLAY_PAGE_DOCS: Record<string, PageDoc> = {
  /* ────────────────────────────────────────────────────────────────────────── */
  'top-search': {
    story:
      'Là người đọc tài liệu này, tôi muốn biết **dải job nằm trên đầu trang tìm kiếm chọn 8 job đó như thế nào**, và **bán được gì trên nó**.',
    blocks: [
      {
        kind: 'p',
        text: 'Dải này tên là **Top search**. Nó nằm ngay trên danh sách kết quả tìm kiếm, tiêu đề *“Việc {từ khoá} dành cho bạn”*, 8 thẻ job, trên máy tính chia **2 slide 4 thẻ** và tự chạy mỗi 3 giây.\n\nTrang này đi theo đúng thứ tự hệ thống chạy: **ai đủ điều kiện → xếp theo gì → giữ mấy job → trang tìm kiếm vẽ khi nào**. Đọc hết §1–§4 là hiểu toàn bộ bộ máy; §6 là phần dành cho Sales.',
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '§1 · Tóm lại: bốn bước' },
      {
        kind: 'table',
        note: 'Bốn bước này chạy lại **mỗi lần có người gõ từ khoá**. Không có danh sách nào được lưu sẵn, và **không có xoay vòng** — xem §5.',
        cols: ['Bước', 'Hệ thống làm gì', 'Ra cái gì', 'Đọc chi tiết ở'],
        rows: [
          ['**1 · Lọc**', 'Giữ job **đang hiển thị bình thường** trên site, **khớp từ khoá người dùng gõ**, và **product của job có tick ô Top search** (hoặc job có add-on Top search đang chạy).', 'Tập job đủ điều kiện — **nhiều hay ít tuỳ từ khoá**; tổng số job đã mua ô này hôm nay trên production là **2.624**', '§2'],
          ['**2 · Sắp xếp**', 'Xếp theo **lần làm mới gần nhất** (`refreshed_at`), mới nhất trước. **Đè lên** menu sắp xếp người dùng chọn.', 'Một danh sách có thứ tự', '§3'],
          ['**3 · Cắt**', 'Lấy **8 job đầu**. Không lấp thêm, không bỏ job đã có trong danh sách kết quả bên dưới.', '**8 thẻ**', '§3'],
          ['**4 · Vẽ**', 'Trang tìm kiếm vẽ dải **chỉ khi có từ khoá**, và gửi lên server **đúng từ khoá** — **bỏ hết mọi bộ lọc khác**.', 'Dải trên đầu trang kết quả', '§4'],
        ],
      },
      {
        kind: 'list',
        heading: 'Ba điều dễ hiểu nhầm nhất',
        items: [
          '**Top search không phải một bậc tin.** Nó là một **ô hiển thị** mà product nào cũng có thể được tick vào — hiện có 8 product chính và 1 add-on tick nó (§6).',
          '**Dải không nghe theo bộ lọc.** Người dùng lọc lương, địa điểm, ngành nghề — danh sách kết quả bên dưới đổi, **dải vẫn y nguyên 8 thẻ cũ**. Đây là quyết định của phía giao diện, không phải giới hạn của server (§4).',
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
          ['**2 · Khớp từ khoá**', 'Job khớp từ khoá người dùng gõ, theo đúng luật tìm kiếm thường', 'Không gõ gì thì server vẫn trả về được, nhưng giao diện **không gọi** — xem §4'],
          ['**3 · Đã mua ô Top search**', 'Một trong **hai** đường: ① **product của bậc đang chạy** có tick ô Top search; ② job có **add-on hiển thị** (`DISPLAY_PLACEMENT`) đang trong hạn, trên một product `ACTIVE` có tick ô Top search', 'Đường ② mới có từ **17/11/2026**. Trước đó job mua Top search dạng add-on khớp từ khoá, nằm trong danh sách kết quả, nhưng **không bao giờ lên dải**'],
        ],
      },
      {
        kind: 'list',
        heading: '2a · Hai chi tiết hay bị hỏi',
        items: [
          '**“Bậc đang chạy” là bậc cao nhất job đang giữ.** Job có nhiều lượt chạy cùng lúc thì hệ thống lấy lượt chạy `ACTIVE`, còn trong hạn, có **thứ tự bậc cao nhất**. Product của lượt chạy đó phải đang `ACTIVE` — product đã **archive** thì job rơi khỏi dải, dù lượt chạy vẫn còn hạn.',
          '**Coverage days trên dòng tick không được đọc.** Trong form product, mỗi ô tick có thể đặt “hiển thị trong N ngày đầu”. Với Top search **ô đó không có tác dụng** — code không đọc cột này. Hôm nay mọi dòng đều để trống nên chưa ai thấy; đặt một con số vào đó sẽ **không** giới hạn được gì.',
        ],
      },
      {
        kind: 'warn',
        text: '**Dải này KHÔNG đi qua API placement.** Mọi ô khác lấy nội dung qua `GET /placements/{id}/jobs`; Top search lấy qua **chính ô tìm kiếm** (`GET /jobs/search?topSearchOnly=true`). Dòng `placement_top_search` khai `fill_route = TIER` **chỉ để** nó hiện ra trong danh sách tick của form product — đó là toàn bộ lý do nó mang giá trị TIER.\n\nHệ quả: gọi `GET /placements/placement_top_search/jobs` vẫn trả về 8 job (thử trên production 20/11: 8 job, đều của MBBANK), nhưng **không màn hình nào vẽ kết quả đó**. Đừng dùng nó để kiểm tra dải.',
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '§3 · Bước 2 và 3 — Thứ tự, và vì sao chỉ 8 job' },
      {
        kind: 'table',
        cols: ['Câu hỏi', 'Câu trả lời', 'Nghĩa là'],
        rows: [
          ['Xếp theo gì?', '`refreshed_at` giảm dần, hoà thì theo `id`', '**Lần làm mới gần nhất**, không phải ngày đăng. Job nào bấm làm mới (hoặc được làm mới tự động) thì nhảy lên đầu dải'],
          ['Người dùng chọn “Lương cao nhất” thì sao?', 'Dải **không đổi**', 'Thứ tự của dải **đè lên** menu sắp xếp. Menu chỉ điều khiển danh sách kết quả bên dưới'],
          ['Có chia đều cho các công ty không?', '**Không**', 'Dải job *Lựa chọn tạo nên khác biệt* ngay dưới kết quả **có** chia lượt theo công ty; Top search **cố tình không**. Một công ty làm mới job liên tục có thể giữ cả 8 chỗ'],
          ['Vì sao đúng 8?', '`items_shown = 8` trên dòng registry, và giao diện cũng xin đúng 8', 'Đổi số này ở **Product settings → Placements** thì cả hai phía đổi theo'],
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '§4 · Bước 4 — Trang tìm kiếm vẽ dải khi nào' },
      {
        kind: 'p',
        text: 'Đây là phần gây bất ngờ nhiều nhất, vì nó **không nằm ở server**. Trang tìm kiếm gọi server bằng đúng **bốn** thông tin: ngôn ngữ, **từ khoá**, cờ `topSearchOnly`, và số lượng 8. Mọi thứ khác trên thanh tìm kiếm **không được gửi đi**.',
      },
      {
        kind: 'table',
        cols: ['Người dùng làm gì', 'Danh sách kết quả', 'Dải Top search'],
        rows: [
          ['Gõ từ khoá', 'Đổi', '**Đổi**'],
          ['Chọn địa điểm · ngành nghề · mức lương · hình thức · kinh nghiệm…', 'Đổi', '**Không đổi**'],
          ['Đổi menu sắp xếp', 'Đổi', '**Không đổi**'],
          ['Sang trang 2, 3, 4…', 'Đổi', '**Không đổi** — dải vẽ lại y hệt trên mọi trang kết quả'],
          ['Không gõ từ khoá nào', 'Vẫn có kết quả', '**Không có dải**'],
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
          ['Dải, *ngân hàng* + lương ≥ 100tr **(giao diện không bao giờ gửi cái này)**', '0', 'không thẻ nào'],
          ['Danh sách kết quả, *ngân hàng* + lương ≥ 100tr', '7', '—'],
          ['Dải, không từ khoá', '2.624', '— (giao diện không gọi)'],
        ],
        note:
          'Dòng thứ hai là bằng chứng: **server hoàn toàn biết lọc**. Khi gửi kèm bộ lọc lương, dải tụt từ 2.592 job xuống 0. Việc dải “không nghe bộ lọc” là vì **giao diện không gửi bộ lọc lên**, chứ không phải server bỏ qua.',
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
      { kind: 'h', text: '§5 · rotation_seconds trên ô này không có tác dụng' },
      {
        kind: 'p',
        text: 'Trong **Product settings → Placements**, ô Top search có trường *Rotation seconds*, và ngày **20/11/2026** nó đang để **300** (5 phút) trên production. **Không dòng code nào đọc con số đó cho ô này.**',
      },
      {
        kind: 'table',
        cols: ['Ở đâu', 'Có đọc rotation_seconds không', 'Vì sao'],
        rows: [
          ['Các ô trang chủ / Korea / Global', '**Có**', 'Chúng đi qua `PublicReadService`, hàm này gọi bộ xoay vòng theo chu kỳ'],
          ['Banner và popup', '**Có**', 'Đi qua `BannerService`, cùng bộ xoay vòng'],
          ['**Top search**', '**Không**', 'Đi qua ô tìm kiếm. Trong đường tìm kiếm **không có** đoạn code xoay vòng nào'],
          ['Dashboard *Placement load*', '**Không** — cố tình', 'Khi dựng lại dải, dashboard **ép** giá trị này về rỗng cho 3 ô dạng tìm kiếm, nếu không nó sẽ báo hàng nghìn job “đang chờ tới lượt” mà thực ra không bao giờ tới'],
        ],
      },
      {
        kind: 'warn',
        text: 'Đặt 300 giây lên ô Top search **không làm job luân phiên nhau**. Trên production, dòng registry ghi `rotationSeconds = 300`, còn dashboard *Placement load* vẫn báo ô này là **không xoay vòng** — hai chỗ đọc cùng một dòng và cho ra hai câu trả lời khác nhau, vì một bên chỉ lưu con số còn bên kia biết là nó vô nghĩa. Muốn bỏ con số đi thì xoá cho đỡ hiểu nhầm, nhưng để lại cũng **không hại gì**.',
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '§6 · Sales bán được gì trên Top search' },
      {
        kind: 'p',
        text: 'Phần này dành cho Sales. Ba câu: **product nào đang có ô này**, **khách được thêm gì trên thẻ job**, và **hứa được tới đâu**.',
      },
      {
        kind: 'table',
        heading: '6a · Product đang có ô Top search (production, 20/11/2026)',
        note:
          'Ngoài 9 product này còn **11 product đã archive** vẫn giữ dòng tick cũ. Product archive thì job chạy trên nó **không lên dải** — đường ① ở §2 đòi product `ACTIVE`.',
        cols: ['Product', 'Loại', 'Giá niêm yết', 'Thời gian hiển thị'],
        rows: [
          ['**NEW Tin Top Job 2026**', 'Product chính', '13.800.000 đ', '30 ngày'],
          ['**NEW Tin Top Job 2026 (Tặng)**', 'Product chính — hàng tặng', '0 đ', '30 ngày'],
          ['**NEW Tin Distinction 2026**', 'Product chính', '12.000.000 đ', '30 ngày'],
          ['**NEW Tin Distinction 2026 (Tặng)**', 'Product chính — hàng tặng', '0 đ', '30 ngày'],
          ['**NEW Tin Distinction 1tr 2026**', 'Product chính', '1.000.000 đ', '30 ngày'],
          ['**NEW Tin Top Job Unlimited 2026**', 'Product chính — không giới hạn', '1.180.000.000 đ', '30 ngày'],
          ['**NEW Tin Unlimited Basic Plus 2026**', 'Product chính — không giới hạn', '348.600.000 đ', '30 ngày'],
          ['**TOP JOB - TEST**', 'Product chính', '3.000.000 đ', '30 ngày'],
          ['**NEW Highlight on the Jobpage 2026**', '**Add-on hiển thị** — mua kèm bất kỳ bậc nào', '0 đ', '10 ngày'],
        ],
      },
      {
        kind: 'list',
        heading: '6b · Hai cách khách lên được dải',
        items: [
          '**Mua một bậc tin có sẵn ô này** — 8 product ở trên. Job tự lên dải ngay khi đăng, suốt thời gian bậc còn hạn.',
          '**Mua add-on “NEW Highlight on the Jobpage 2026”** — gắn thêm vào job đang chạy bậc bất kỳ, kể cả bậc không có ô Top search. Chạy **10 ngày** kể từ khi gắn. Đây là cách duy nhất để một job bậc thấp lên dải.',
        ],
      },
      {
        kind: 'table',
        heading: '6c · Ô này tặng kèm hai thứ trên thẻ job',
        note:
          'Luật chung: product bán perk nào là do **các ô nó tick** quyết định — tick một ô mang perk là bán perk đó, trong form product không phải tick gì thêm.',
        cols: ['Perk', 'Là gì', 'Hệ quả'],
        rows: [
          ['**Nhãn trên thẻ** (`CARD_TAG`)', 'Dòng chữ nhỏ nổi trên thẻ job', 'Không bắt buộc. Không điền thì thẻ không có nhãn'],
          ['**Ảnh banner 596×258** (`PHOTO_LANDSCAPE`)', 'Ảnh ngang in trên thẻ job', '**Bắt buộc** — xem cảnh báo ngay dưới'],
        ],
      },
      {
        kind: 'warn',
        text: '**Bán ảnh banner là bắt ảnh banner.** Khi một product bán khung ảnh nào, job chạy product đó **không publish được nếu thiếu ảnh đó** (lỗi `CARD_ARTWORK_REQUIRED`). Đây là hành vi cố ý — khách đã trả tiền cho khung ảnh.\n\nHôm nay **8 product chính** ở §6a đều đã tick cả ô *Super hot - Image* (ô đó cũng bán ảnh banner), nên tick thêm Top search **không thêm ràng buộc nào** cho chúng. Nhưng **add-on *NEW Highlight on the Jobpage 2026* chỉ tick đúng ô Top search** — nên gắn add-on này vào một job chưa có ảnh 596×258 sẽ **bị chặn**. Sales phải xin ảnh của khách **trước** khi gắn add-on.',
      },
      {
        kind: 'example',
        heading: '6d · Hứa được tới đâu — số thật trên production, 20/11/2026',
        scenario:
          'Dashboard *Placement load* (Product settings → Placement load → Page map → Search) báo: **8 đang hiện · 2.618 không bao giờ hiện · 2.626 đủ điều kiện**. Đây là con số làm nhiều người tưởng hệ thống hỏng. Nó không hỏng — nó đang nói đúng một việc: **8 chỗ, 2.626 job đã mua**.',
        cols: ['Chỉ số', 'Con số', 'Nghĩa với Sales'],
        rows: [
          ['Job đã mua ô Top search', '**2.626**', 'Toàn bộ job đang giữ một product có ô này'],
          ['Chỗ trên dải', '**8**', 'Và chỉ cho **một** từ khoá tại một thời điểm'],
          ['Số công ty trong 2.626 job đó', '**22**', 'Ô này hiện gần như chỉ có vài khách lớn'],
          ['Job của **một** công ty (MBBANK)', '**2.592 — 98,7 %**', 'Với từ khoá phổ thông, cả 8 thẻ là của họ'],
          ['Từ khoá *kế toán*', '2.589 job đủ điều kiện → 8 thẻ', 'Cả 8 của MBBANK'],
          ['Từ khoá *marketing*', '2.605 job đủ điều kiện → 8 thẻ', 'Cả 8 của MBBANK'],
          ['Từ khoá *thiết kế*', '13 job đủ điều kiện → 8 thẻ', '6 công ty khác nhau'],
          ['Từ khoá *tiếng Hàn*', '5 job đủ điều kiện → 5 thẻ', '5 công ty khác nhau'],
        ],
        note:
          'Đọc ra một câu: **ô này chỉ có giá trị với từ khoá hẹp.** Từ khoá càng phổ thông, khách lớn càng chiếm trọn dải.',
      },
      {
        kind: 'table',
        heading: '6e · Hứa được gì — và tuyệt đối không hứa gì',
        cols: ['Hứa được', 'Không được hứa'],
        rows: [
          ['Job **đủ điều kiện** lên dải Top search trong suốt thời gian bậc (hoặc 10 ngày với add-on)', '“Job của anh/chị sẽ **luôn** nằm trên dải”'],
          ['Job **mới làm mới** được ưu tiên đứng trước', '“Mỗi job sẽ **tới lượt** hiện” — ô này **không xoay vòng**'],
          ['Thẻ được **nhãn** và **ảnh banner 596×258**', '“Số lần hiển thị / vị trí cố định / bao nhiêu lượt xem” — hệ thống **không** đong đếm hay giữ chỗ gì cả'],
          ['Dải phản ứng theo **từ khoá** người tìm việc gõ', '“Dải sẽ lọc theo **khu vực / ngành / mức lương** khách chọn” — dải **không** đọc bộ lọc'],
          ['Với **từ khoá hẹp đúng ngành của khách**, cơ hội lên dải là thật', '“Khách sẽ thấy job của anh/chị ở trang tìm kiếm **bất kể** họ tìm gì”'],
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '§7 · Những gì chưa có' },
      {
        kind: 'open',
        text: '**Xoay vòng kiểu băng chuyền — đang bàn, CHƯA LÀM.** Ý tưởng: cửa sổ 8 job, mỗi chu kỳ dịch 4 job, để job nào cũng có lượt nằm trong 4 ô đầu. Hôm nay **không có** gì như vậy trong code: dải lấy 8 job mới nhất và dừng ở đó. Đừng mô tả nó với khách như hành vi đang chạy.',
      },
      {
        kind: 'open',
        text: '**Chia lượt theo công ty trên dải này — chưa làm.** Code có sẵn cách chia (dải premium ngay dưới đang dùng), và chuyển sang chỉ là một dòng. Nhưng bản mô tả của ô này viết là “mới nhất trước”, nên dev **cố ý không** tự đổi. Đây là quyết định của BA/khách, không phải việc dev bỏ sót.',
      },
      {
        kind: 'open',
        text: '**Coverage days chưa được đọc** (xem §2a) — đặt số vào ô đó hiện không giới hạn được gì.',
      },
      {
        kind: 'warn',
        text: '**Hai con số 2.626 và 2.624 lệch nhau — và lệch có lý do.** Dashboard *Placement load* đếm **2.626**, còn ô tìm kiếm trả **2.624**. Dashboard đếm cả job đang chạy trên **product đã archive** (câu truy vấn của nó không lọc trạng thái product), còn dải thật thì loại chúng ra. Chênh lệch hôm nay là 2 job; nó sẽ to lên nếu một product đông job bị archive. Khi cần con số đúng với cái người dùng thấy, lấy từ ô tìm kiếm.',
      },
      {
        kind: 'warn',
        text: '**Trên production đang có product tên TOP JOB - TEST ở trạng thái ACTIVE**, giá 3.000.000 đ, có tick ô Top search. Nếu đây là dữ liệu thử thì nên chuyển sang *Inactive* — product `ACTIVE` là product bán được và job chạy nó lên dải thật.',
      },

      { kind: 'p', text: `*${STAMP}*` },
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
      '**Trong nhóm TIER còn chia tiếp làm hai, và đây mới là chỗ hay sai:** phần lớn hộp được trang chủ/bảng tin tự lấp và **có xoay vòng**; nhưng **3 hộp** được lấp bằng chính ô tìm kiếm và **không xoay vòng bao giờ** — `rotation_seconds` đặt trên 3 hộp đó **không ai đọc**.',
    ],
    blocks: [
      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '§1 · Một dòng placement gồm những gì' },
      {
        kind: 'table',
        note: 'Trên production hiện có **47 dòng**: 28 dòng `TIER` (1 dòng đang `INACTIVE`, không trang nào vẽ) và 19 dòng `BOOKED`. Bản thân **màn hình** sửa các dòng này — cột nào sửa được, kích thước ảnh, sức chứa banner — nằm ở trang `/trang/placements`; ở đây chỉ nói các trường quyết định **job nào được hiện**.',
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
          '**Hộp hiển thị** — khi vẽ, hệ thống hỏi ngược: *“hộp này được những product nào tick, và job nào đang chạy một trong các product đó?”*',
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
          ['Có xoay vòng?', '**Có**, theo `rotation_seconds`', '**Không bao giờ** — không có đoạn code xoay vòng nào trong đường tìm kiếm'],
          ['Xếp theo', 'Thứ tự xoay vòng của chu kỳ hiện tại', '`refreshed_at` giảm dần — mới làm mới nhất trước'],
        ],
      },
      {
        kind: 'warn',
        text: '**Hộp search-fed vẫn khai fill_route = TIER, và đó không phải nhầm.** Giá trị TIER là **điều kiện để hộp hiện ra trong danh sách tick của form product** — nếu không có nó thì không ai bán được hộp này. Hệ quả: gọi `GET /placements/{id}/jobs` lên một hộp search-fed **vẫn trả về một danh sách job**, nhưng **không màn hình nào vẽ danh sách đó**. Đừng dùng API này để kiểm tra 3 hộp đó.',
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
        text: '**Hôm nay cả 28 hộp TIER đều đang để rotation_seconds = 300** (5 phút) — kể cả 3 hộp search-fed. Với 25 hộp tier-fed, con số đó chạy thật. Với 3 hộp search-fed, nó **không làm gì cả**: dải lấy N job đầu theo `refreshed_at` và dừng ở đó, job thứ N+1 trở đi **không bao giờ** tới lượt.',
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '§5 · Đọc dashboard Placement load cho đúng' },
      {
        kind: 'p',
        text: '**Product settings → Placement load** dựng lại từng hộp đúng như site vẽ, rồi xếp mọi job đủ điều kiện vào ba nhóm. Nó là chỗ nhanh nhất để trả lời *“job của khách đang ở đâu”* — miễn là đọc đúng nghĩa ba nhóm đó.',
      },
      {
        kind: 'table',
        cols: ['Nhóm', 'Nghĩa', 'Khi nào là bình thường'],
        rows: [
          ['**Showing now**', 'Job hộp đang vẽ **ngay lúc này**', 'Luôn luôn'],
          ['**Waiting for a turn**', 'Job sẽ tới lượt ở một chu kỳ sau', 'Chỉ xuất hiện với hộp **có xoay vòng**'],
          ['**Never shown**', 'Job đủ điều kiện nhưng **không bao giờ** được vẽ', '**Bình thường với hộp không xoay vòng** — tức cả 3 hộp search-fed. Con số lớn ở đây **không phải lỗi**'],
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
        note: 'Mỗi trang đi theo **cùng một bố cục**: §1 Tóm lại → §2 Job nào đủ điều kiện → §3 Thứ tự và số job giữ lại → §4 Giao diện vẽ khi nào → §5 Xoay vòng → **§6 Sales bán được gì** → §7 Những gì chưa có. Thêm hộp mới thì thêm một trang theo đúng bố cục đó.',
        cols: ['Hộp', 'Ở đâu trên site', 'Loại', 'Trang'],
        rows: [
          ['**Tìm kiếm — Top search**', 'Dải 8 thẻ trên đầu trang kết quả tìm kiếm', 'Search-fed', '`/trang/top-search`'],
          ['*Các dải trang chủ · Korea · Global*', 'Super hot · Top job · Distinction · Basic plus · Basic · Free · Recommended', 'Tier-fed', '*chưa có trang riêng*'],
          ['*Mega menu — Trending jobs / Don’t miss these jobs*', 'Hai dải trên các trang bảng tin của mega menu', 'Search-fed', '*chưa có trang riêng — xem /trang/jobs-pages*'],
          ['*Banner và popup*', 'Trang chủ, trang công ty, trang cá nhân, trang đăng nhập', '`BOOKED`', '*xem nhóm Content*'],
        ],
      },

      { kind: 'p', text: `*${STAMP}*` },
    ],
  },
}
