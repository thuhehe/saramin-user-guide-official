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
 * TWO KINDS OF PAGE LIVE HERE, AND THEY MUST NOT BE CONFUSED.
 *   - The group index below is AS-BUILT: it describes the registry and the two
 *     fill routes as they run today.
 *   - /trang/top-search is a REQUIREMENT, settled 2026-11-21 and built under
 *     SRM-1739. It states rules, not behaviour. Production figures appear on
 *     it only as evidence, each carrying the date it was measured.
 * A page that mixes the two silently is the failure mode to avoid: say which
 * kind it is in the opening paragraph and in the closing stamp.
 *
 * SHAPE OF THE TOP SEARCH REQUIREMENT:
 *   §1 Tóm lại — the six steps as one table
 *   §2 Khi nào dải hiện ra, và tiêu đề là gì
 *   §3 Job nào đủ điều kiện
 *   §4 Thứ tự, và sức chứa
 *   §5 Mỗi slide tối đa một job của một công ty
 *   §6 Xoay vòng
 *   §7 Giao diện
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

const STAMP_ASBUILT = `${STAMP} Đây là mô tả *cái đang chạy*, không phải bản yêu cầu.`

const STAMP_TOP_SEARCH =
  '**Bản yêu cầu đã chốt ngày 21/11/2026**, làm trong task **SRM-1739** — không phải mô tả hành vi đang chạy. Các con số production trên trang là **căn cứ đo ngày 20/11/2026**. Mã nguồn đối chiếu khi viết: svn-be `785c698d7` · svn-web `ed538a26e` · admin `a63d271d`.'

export const JOB_DISPLAY_PAGE_DOCS: Record<string, PageDoc> = {
  /* ────────────────────────────────────────────────────────────────────────── */
  'top-search': {
    story:
      'Là người đọc tài liệu này, tôi muốn biết **dải job trên đầu trang tìm kiếm phải chọn và hiện job theo luật nào**.',
    blocks: [
      {
        kind: 'p',
        text: '**Tóm lại:** *Top search* là dải job nằm ngay trên danh sách kết quả tìm kiếm. Dải **luôn hiện**, kể cả khi người tìm việc chưa gõ chữ nào; nó lấy job từ **chính ô tìm kiếm**, nhiều nhất **20 job** chia **5 slide 4 thẻ**, mỗi slide **không quá một job của cùng một công ty**, và cứ hết một chu kỳ thì **tịnh tiến 4 job** để job phía sau cũng tới lượt.\n\nTrang này là **bản yêu cầu đã chốt ngày 21/11/2026**, làm trong task **SRM-1739** — không phải mô tả cái đang chạy. Các con số production trên trang là **căn cứ**, đều ghi rõ ngày đo.',
      },
      {
        kind: 'shot',
        src: '/shots/job-display/top-search-on-page.jpg',
        where: 'Jobseeker site',
        caption:
          '**Ô Top search là khung đỏ** — nằm **trên** khối *Kết quả tìm kiếm*, và là thứ bản yêu cầu này nói về.',
        note:
          'Ảnh chụp dải **đang chạy hôm nay**: 8 job, 2 slide, chỉ hiện khi có từ khoá. Bản yêu cầu đổi cả ba con số đó — xem §1.',
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '§1 · Tóm lại: sáu bước' },
      {
        kind: 'table',
        note: 'Sáu bước này chạy lại **mỗi lần người dùng đổi từ khoá hoặc bộ lọc**, và chạy lại **mỗi chu kỳ xoay vòng**. Không có danh sách nào được lưu sẵn.',
        cols: ['Bước', 'Hệ thống làm gì', 'Ra cái gì', 'Đọc chi tiết ở'],
        rows: [
          ['**1 · Lọc**', 'Giữ job **đang hiển thị bình thường** trên site, **đã mua ô Top search**, và **khớp từ khoá cùng các bộ lọc người dùng đang đặt**. Không gõ gì, không lọc gì thì giữ **tất cả**.', 'Tập job đủ điều kiện', '§2 · §3'],
          ['**2 · Sắp xếp**', 'Xếp theo **lần làm mới gần nhất**, mới nhất trước. Hàng được **chốt ngay đầu mỗi chu kỳ**.', 'Một hàng có thứ tự', '§4'],
          ['**3 · Rải công ty**', 'Xếp lại sao cho **trong một slide không có hai job của cùng một công ty**.', 'Hàng đã rải đều', '§5'],
          ['**4 · Cắt**', 'Lấy **20 job đầu hàng**, chia **5 slide × 4 thẻ**. Ít job hơn thì ít thẻ hơn — **không lấp bù**.', 'Nhiều nhất 20 thẻ', '§4'],
          ['**5 · Hiện**', 'Hiện dải với **tiêu đề theo từng trường hợp**, tự chạy, có nút tạm dừng và bộ đếm *n / 5*.', 'Dải trên đầu trang kết quả', '§2 · §7'],
          ['**6 · Xoay vòng**', 'Hết một chu kỳ (`rotation_seconds`, hiện để **300 giây**), cả hàng **tịnh tiến 4 job**.', '4 thẻ mới vào slide cuối', '§6'],
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '§2 · Khi nào dải hiện ra, và tiêu đề là gì' },
      {
        kind: 'p',
        text: '**Luật: dải luôn hiện**, miễn là còn **ít nhất một** job đủ điều kiện. Từ khoá và bộ lọc chỉ **thu hẹp** tập job — chúng **không** quyết định dải có xuất hiện hay không.',
      },
      {
        kind: 'table',
        note: 'Đây là chỗ đổi nhiều nhất so với hiện tại: hôm nay **không gõ từ khoá thì không có dải**, kể cả khi người dùng đã chọn khu vực hay ngành nghề.',
        cols: ['Người dùng đang ở trạng thái nào', 'Dải lấy job nào', 'Tiêu đề dải'],
        rows: [
          ['Có **từ khoá**', 'Job khớp từ khoá — **và** khớp các bộ lọc, nếu có đặt', '*“Việc {từ khoá} dành cho bạn”*'],
          ['**Không** từ khoá, **có** bộ lọc (khu vực · ngành nghề · mức lương · hình thức · kinh nghiệm…)', 'Job khớp các bộ lọc đó', '*“Việc làm dành cho bạn”*'],
          ['**Không** từ khoá, **không** bộ lọc', '**Tất cả** job đủ điều kiện', '*“Việc làm dành cho bạn”*'],
          ['Không còn job nào đủ điều kiện', '—', '**Không hiện dải**'],
        ],
      },
      {
        kind: 'open',
        text: '**Tiêu đề khi không có từ khoá — chờ Thu chốt.** Đề xuất trong bảng trên: một tiêu đề trung tính *“Việc làm dành cho bạn”* cho **mọi** trường hợp không có từ khoá, kể cả khi người dùng đã đặt bộ lọc.\n\n**Vì sao đề xuất vậy:** bộ lọc thường được đặt **nhiều cái một lúc** — hai khu vực và ba ngành nghề là chuyện bình thường — ghép hết vào tiêu đề thì ra một câu không ai đọc nổi. Dải tương ứng bên Saramin Hàn Quốc cũng dùng một tiêu đề trung tính.\n\n**Phương án thay thế nếu Thu muốn tiêu đề nói rõ hơn:** khi **đúng một** nhóm bộ lọc được đặt **và** nhóm đó chỉ có **một** giá trị thì gọi tên nó — *“Việc làm tại Đà Nẵng dành cho bạn”* — còn mọi trường hợp khác quay về tiêu đề trung tính. Phương án này tốn thêm **một cách diễn đạt riêng cho mỗi nhóm bộ lọc**, và vẫn phải có tiêu đề trung tính cho phần còn lại.',
      },
      {
        kind: 'warn',
        text: '**Phần lọc không phải việc mới ở server.** Đo trên production ngày 20/11/2026: gọi thẳng API của dải với từ khoá *ngân hàng* kèm mức lương từ 100 triệu, số job đủ điều kiện tụt từ **2.592 xuống 0** — server đã lọc đúng. Phần còn thiếu chỉ là **giao diện gửi bộ lọc lên cùng từ khoá**.',
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '§3 · Job nào đủ điều kiện vào dải' },
      {
        kind: 'p',
        text: 'Ba lớp điều kiện, **và** với nhau. Rớt một lớp là không bao giờ xuất hiện, dù job mới đăng đến đâu.\n\nMột điều hay bị hiểu nhầm trước khi đọc bảng: **Top search không phải một bậc tin.** Nó là một **ô hiển thị** mà product nào cũng có thể được tick vào — trên production hôm nay có **8 product chính và 1 add-on** đang tick nó.',
      },
      {
        kind: 'table',
        cols: ['Lớp', 'Điều kiện', 'Ghi chú'],
        rows: [
          ['**1 · Hiển thị bình thường**', 'Job `OPEN` · bật hiển thị (`exposure`) · công ty `ACTIVE` và **có mã số thuế** (công ty nước ngoài thì có `foreign_tax_id`) · chưa quá `expire_at` và `posting_expires_at`', 'Đúng bộ điều kiện mọi màn hình công khai dùng — không có ngoại lệ riêng cho dải này'],
          ['**2 · Khớp từ khoá và bộ lọc**', 'Job khớp **từ khoá** (nếu người dùng có gõ) và **mọi bộ lọc đang đặt** (nếu có), theo đúng luật tìm kiếm thường', 'Không gõ gì và không lọc gì thì lớp này **không loại ai** — xem §2'],
          ['**3 · Đã mua ô Top search**', 'Một trong **hai** đường: ① **product của bậc đang chạy** có tick ô Top search; ② job có **add-on hiển thị** (`DISPLAY_PLACEMENT`) đang trong hạn, trên một product `ACTIVE` có tick ô Top search', 'Đường ② mới có từ **17/11/2026**. Trước đó job mua Top search dạng add-on khớp từ khoá, nằm trong danh sách kết quả, nhưng **không bao giờ lên dải**'],
        ],
      },
      {
        kind: 'list',
        heading: '3a · Bốn chi tiết hay bị hỏi',
        items: [
          '**“Bậc đang chạy” là bậc cao nhất job đang giữ.** Job có nhiều lượt chạy cùng lúc thì hệ thống lấy lượt chạy `ACTIVE`, còn trong hạn, có **thứ tự bậc cao nhất**. Product của lượt chạy đó phải đang `ACTIVE` — product đã **archive** thì job rơi khỏi dải, dù lượt chạy vẫn còn hạn.',
          '**Coverage days trên dòng tick không được đọc.** Trong form product, mỗi ô tick có thể đặt “hiển thị trong N ngày đầu”. Với Top search **ô đó không có tác dụng** — code không đọc cột này. Hôm nay mọi dòng đều để trống nên chưa ai thấy; đặt một con số vào đó sẽ **không** giới hạn được gì.',
          '**Dashboard đếm 2.626, ô tìm kiếm trả 2.624 — lệch có lý do.** Dashboard *Placement load* đếm cả job đang chạy trên **product đã archive** (câu truy vấn của nó không lọc trạng thái product), còn dải thật loại chúng ra; cần con số đúng với cái người dùng thấy thì lấy từ ô tìm kiếm.',
          '**Trên production đang có product tên TOP JOB - TEST ở trạng thái ACTIVE**, giá 3.000.000 đ, có tick ô Top search — nếu là dữ liệu thử thì nên chuyển sang *Inactive*, vì product `ACTIVE` là product bán được và job chạy nó lên dải thật.',
        ],
      },
      {
        kind: 'warn',
        text: '**Dải này KHÔNG đi qua API placement.** Mọi ô khác lấy nội dung qua `GET /placements/{id}/jobs`; Top search lấy qua **chính ô tìm kiếm**. Dòng `placement_top_search` khai `fill_route = TIER` **chỉ để** nó hiện ra trong danh sách tick của form product — đó là toàn bộ lý do nó mang giá trị TIER.\n\nHệ quả: gọi `GET /placements/placement_top_search/jobs` vẫn trả về một danh sách job, nhưng **không màn hình nào hiển thị kết quả đó**. Đừng dùng nó để kiểm tra dải.',
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '§4 · Thứ tự, và sức chứa của dải' },
      {
        kind: 'table',
        cols: ['Câu hỏi', 'Luật', 'Nghĩa là'],
        rows: [
          ['Xếp theo gì?', '`refreshed_at` giảm dần; hoà thì `id` giảm dần', '**Lần làm mới gần nhất**, không phải ngày đăng. Job nào được làm mới thì nhảy lên đầu hàng'],
          ['Người dùng chọn “Lương cao nhất” thì sao?', 'Thứ tự dải **không đổi**', 'Menu sắp xếp chỉ điều khiển **danh sách kết quả bên dưới**, không điều khiển dải'],
          ['Hàng có đổi giữa chừng không?', '**Không** — hàng được **chốt ở đầu mỗi chu kỳ**', 'Một job được làm mới giữa chu kỳ **không cướp mất lượt** của job đang chờ; nó vào hàng từ chu kỳ sau'],
          ['Hiện bao nhiêu job?', '**Nhiều nhất 20**, chia **5 slide × 4 thẻ**', 'Hôm nay registry để `items_shown = 8`. Đổi thành **20** là một phần của SRM-1739'],
          ['Ít hơn 20 job thì sao?', 'Hiện bấy nhiêu, **không lấp bù**', '7 job đủ điều kiện → 2 slide, slide sau chỉ 3 thẻ. **Không bao giờ** lấy job chưa trả tiền vào cho đủ'],
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '§5 · Mỗi slide tối đa một job của một công ty' },
      {
        kind: 'p',
        text: '**Luật:** trong **một slide 4 thẻ**, mỗi công ty được nhiều nhất **một thẻ**. Trên cả 20 thẻ, một công ty vì thế nhiều nhất **5 thẻ** — mỗi slide một thẻ. Đây là điểm đảo ngược so với hiện tại: hôm nay dải **không** chia lượt theo công ty, nên một công ty làm mới job liên tục có thể giữ cả 8 chỗ.',
      },
      {
        kind: 'warn',
        text: '**Luật này hôm nay không phải lúc nào cũng đạt được, và trang nói thẳng chỗ đó.** Đo trên production 20/11/2026: trong **2.626** job đủ điều kiện có **2.592 job của riêng MBBANK**, cả pool chỉ có **22 công ty** — tức ngoài MBBANK chỉ còn **34 job của 21 công ty**.\n\nMột slide 4 thẻ cần **4 công ty khác nhau**, nên mỗi slide phải lấy **3 job ngoài MBBANK**. Một lần tải trang cần 5 slide, tức **15 job ngoài MBBANK** — **màn đầu vẫn đạt luật**. Chỗ không đạt là **các chu kỳ sau**: cả pool chỉ đủ cho **khoảng 11 slide** xếp được bốn công ty khác nhau, từ đó trở đi băng chuyền đi vào phần toàn job MBBANK và slide buộc phải lặp công ty.\n\n**Cách áp dụng:** rải xa nhất mà pool cho phép — còn công ty nào chưa dùng trong slide đó thì ưu tiên, hết mới chấp nhận lặp. **Không** bỏ job đi chỉ để giữ luật.\n\nCách sửa thật **không nằm ở code**: thu hẹp danh sách product được tick ô Top search. Đó là **quyết định cấu hình của Thu**, không phải việc của Dev.',
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '§6 · Xoay vòng — băng chuyền 4 job một nhịp' },
      {
        kind: 'p',
        text: '**Luật:** xếp toàn bộ job đủ điều kiện thành **một hàng** theo thứ tự ở §4, đã rải công ty theo §5. **20 job đầu hàng** là 5 slide đang hiện.\n\nHết **một nhịp** — `rotation_seconds` trên dòng placement, hiện để **300 giây** tức 5 phút — cả hàng **tịnh tiến 4 chỗ**: slide 2 lên thành slide 1, và 4 job kế tiếp trong hàng vào slide 5. Đi tới cuối hàng thì **quay lại đầu hàng**.',
      },
      {
        kind: 'example',
        heading: '6a · Ví dụ: một hàng 100 job',
        scenario:
          'Người tìm việc mở trang kết quả, rồi tải lại sau mỗi 5 phút. Hàng job đứng yên; cái dịch đi là **cửa sổ 20 chỗ** trượt dọc hàng.',
        cols: ['Slide', 'Lúc mở trang', 'Sau 5 phút', 'Sau 10 phút'],
        rows: [
          ['**Slide 1**', 'Job 1–4', 'Job 5–8', 'Job 9–12'],
          ['**Slide 2**', 'Job 5–8', 'Job 9–12', 'Job 13–16'],
          ['**Slide 3**', 'Job 9–12', 'Job 13–16', 'Job 17–20'],
          ['**Slide 4**', 'Job 13–16', 'Job 17–20', 'Job 21–24'],
          ['**Slide 5**', 'Job 17–20', 'Job 21–24', 'Job 25–28'],
        ],
        note:
          'Mỗi nhịp, **cả bảng dịch lên một dòng**. Đi hết job thứ 100 thì cửa sổ **quay lại đầu hàng**. Nghĩa là **mọi job trong hàng đều tới lượt** — kể cả job thứ 2.000 — chứ không phải chỉ 20 job đầu được hiện mãi.',
      },
      {
        kind: 'warn',
        text: '**Dashboard *Placement load* phải sửa cùng lúc.** Hôm nay khi dựng lại 3 ô dạng tìm kiếm, dashboard **ép `rotation_seconds` về rỗng** rồi mới tính — đúng với hiện tại, vì các ô đó chưa xoay vòng. Khi Top search xoay vòng thật, chỗ ép đó làm nhóm *Waiting for a turn* báo sai. **Bỏ nó là một phần của SRM-1739**, không phải việc dọn sau.',
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '§7 · Giao diện dải' },
      {
        kind: 'p',
        text: 'Mẫu tham chiếu: dải *회원님을 위한 공고* trên trang tìm kiếm của Saramin Hàn Quốc.',
      },
      {
        kind: 'list',
        items: [
          '**Dải tự chạy.** Không cần người dùng bấm gì, slide tự chuyển.',
          '**Có nút tạm dừng / chạy tiếp.** Người dùng dừng được dải để đọc, rồi cho chạy lại.',
          '**Có bộ đếm vị trí slide**, dạng *n / 5* — đang ở slide thứ mấy trên tổng số mấy slide.',
          '**Có mũi tên trái / phải**, mỗi lần nhảy **trọn một slide** (4 thẻ), không trượt từng thẻ.',
          '**Không có nút “Xem thêm”.** Dải bên Saramin Hàn Quốc có nút 더보기; bản này **không lấy** nút đó.',
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
          ['`items_shown`', 'Hộp hiện bao nhiêu thẻ cùng lúc', '`8` với Top search — **thành `20`** theo SRM-1739'],
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
        note: 'Trang **Top search** là **bản yêu cầu đã chốt** cho dải đó (21/11/2026, task SRM-1739) — nó nói dải **phải** chạy thế nào. Trang này, và các trang hộp khác khi viết, mô tả **cái đang chạy**. Mở một trang ra là biết nó thuộc loại nào: câu đầu tiên và dòng cuối trang đều nói rõ.',
        cols: ['Hộp', 'Ở đâu trên site', 'Loại', 'Trang'],
        rows: [
          ['**Tìm kiếm — Top search**', 'Dải job trên đầu trang kết quả tìm kiếm', 'Search-fed', '`/trang/top-search` — **bản yêu cầu**'],
          ['*Các dải trang chủ · Korea · Global*', 'Super hot · Top job · Distinction · Basic plus · Basic · Free · Recommended', 'Tier-fed', '*chưa có trang riêng*'],
          ['*Mega menu — Trending jobs / Don’t miss these jobs*', 'Hai dải trên các trang bảng tin của mega menu', 'Search-fed', '*chưa có trang riêng — xem /trang/jobs-pages*'],
          ['*Banner và popup*', 'Trang chủ, trang công ty, trang cá nhân, trang đăng nhập', '`BOOKED`', '*xem nhóm Content*'],
        ],
      },

      { kind: 'p', text: `*${STAMP_ASBUILT}*` },
    ],
  },
}
