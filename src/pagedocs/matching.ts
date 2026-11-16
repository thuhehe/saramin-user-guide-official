/*
 * Matching & gợi ý — the four scored surfaces plus the shared module page.
 *
 * WHY THIS GROUP EXISTS AND IS NOT A CONSOLE MENU. Matching has no admin screen
 * of its own: the weights live in code, admin only reads them back. But it is the
 * part of the product the client asks about most often, it runs on three sites at
 * once, and until now the register said "logic chưa có" — which stopped being
 * true on 05/11. So the group follows the feature, not the console's sidebar,
 * the same way Resume management and Application management already do.
 *
 * WRITTEN AS-BUILT. Read from origin/dev on 2026-11-16:
 *   svn-be  58e37d05a
 *   svn-web e3ff8df46
 *   saramin-vn-admin d0be92d3
 * Includes SRM-1330 (1338 · 1331 · 1345 · 1347, merged 05/11, fixed 12/11),
 * SRM-1433 (10/11), SRM-1491 (16/11) and SRM-1551 (16/11).
 *
 * Where a decision is newer than the code, the decision is written as the rule
 * and a `warn` says what dev still does — never the other way round, because a
 * reader checking the live site has to be able to tell which one they are seeing.
 */
import type { PageDoc, ModuleDoc } from '../docs'

const STAMP =
  'Viết theo **code đang chạy** trên nhánh `dev`, đọc ngày 16/11/2026 (svn-be `58e37d05a` · svn-web `e3ff8df46`). Đây là mô tả *cái đang chạy*, không phải bản yêu cầu.'

export const MATCHING_PAGE_DOCS: Record<string, PageDoc> = {
  /* ────────────────────────────────────────────────────────────────────────── */
  'recommended-jobs': {
    logic: [
      '**Gợi ý việc làm cho một ứng viên cụ thể.** Hệ thống đọc hồ sơ của ứng viên, chấm từng tin tuyển dụng trên **thang 100 điểm** gồm **7 tín hiệu**, rồi chọn thẻ để hiện. Đây là bộ máy dùng ở **sáu** chỗ khác nhau trên site ứng viên.',
      '**Lọc và chấm điểm là hai việc khác nhau — đừng nhầm.** Điều kiện ứng viên **tự khai** là *cổng lọc*: tin không qua thì **không bao giờ** xuất hiện, dù điểm cao đến đâu. Mọi thứ còn lại chỉ **đổi thứ tự**, không loại tin nào.',
      '**Tính mới mỗi lần mở trang.** Không có danh sách gợi ý nào được lưu sẵn cho từng người. Đổi Work preference là lần tải trang sau đã khác.',
      '**Ứng viên không bao giờ nhìn thấy điểm.** Không có % trên thẻ, không có điểm sàn, và mỗi màn hình chỉ có **một tiêu đề cố định** — hệ thống không đổi tiêu đề theo chất lượng kết quả.',
      '**Hành vi (xem tin, lưu tin, nộp đơn) không cộng điểm.** Nó chỉ mở rộng tập đem ra so khớp và dùng để phá hoà. Hành vi của ứng viên **không bao giờ** được dùng ở phía nhà tuyển dụng.',
    ],
    how: [
      'Xem nhanh nhất ở **trang cá nhân** của ứng viên (`/ho-so-ca-nhan`), khối *Việc làm phù hợp với bạn* — 6 thẻ, cố định suốt cả ngày.',
      'Xem bản **đúng thứ tự điểm** (không xáo trộn) ở **popup sau khi nộp đơn** (Batch apply) hoặc ở **màn kết quả onboarding** ngay sau khi hoàn tất wizard.',
      'Muốn biết vì sao một tin hiện ra: đối chiếu hồ sơ ứng viên với **§3 Điều kiện lọc** trước (tin có bị loại không), rồi mới tới **§4 Bảy tín hiệu**.',
    ],
    watch: [
      '**Tin đã nộp đơn biến mất vĩnh viễn khỏi mọi gợi ý** — tính cả đơn đã bị từ chối và đơn đã thu hồi. Đây là nguyên nhân số một của câu hỏi “sao tin này không còn hiện nữa”.',
      '**Ứng viên không khai địa điểm mong muốn thì tín hiệu địa điểm bằng 0**, kể cả với tin remote. Đây là hành vi **cố ý** (chốt 12/11), không phải lỗi.',
      '**Ở trang chi tiết tin, hệ thống không bao giờ nới điều kiện.** Nếu không còn tin nào cùng ngành nghề, khối gợi ý **ẩn hẳn** chứ không lấp bằng tin không liên quan.',
      '**Thấy đúng 6 thẻ đó suốt cả ngày là đúng thiết kế**, không phải cache hỏng. Reload không đổi; sang ngày hôm sau mới đảo bộ khác.',
      '**Bậc “cùng nhóm vị trí” (30 điểm) chưa bao giờ đạt được** vì dữ liệu taxonomy ba tầng chưa có. Thực tế thang vị trí chỉ chạy hai bậc: cùng vị trí 42, hoặc cùng ngành nghề 17.',
    ],
    blocks: [
      { kind: 'p', text: STAMP },

      /* ── §1 ─────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '§1 · Sáu nơi dùng bộ máy này' },
      {
        kind: 'table',
        note: 'Cùng một phép tính, khác tham số `surface` — nên thứ tự hiển thị và số thẻ khác nhau, còn cách chấm điểm thì giống hệt.',
        cols: ['Nơi hiển thị', 'Ai thấy', 'Số thẻ', 'Thứ tự'],
        rows: [
          ['**Onboarding** — khối “những việc phù hợp nhất”', 'Ứng viên vừa xong wizard', '30 tin, giao diện chia 6/trang (tối đa 5 trang)', '**Đúng thứ tự điểm**, một công ty một hàng'],
          ['**Trang cá nhân** — *Việc làm phù hợp với bạn*', 'Đã đăng nhập', '6', 'Xáo trộn **trong từng bậc vị trí** (§5)'],
          ['**Chi tiết tin** — *Gợi ý việc làm cho bạn*', 'Đã đăng nhập', '6', 'Xáo trộn trong từng bậc vị trí; **neo** theo ngành nghề của tin đang xem'],
          ['**Popup sau khi nộp đơn** (Batch apply)', 'Người vừa nộp đơn', '30', '**Đúng thứ tự điểm**, không xáo, không neo ngành nghề'],
          ['**Email JS 3** — gợi ý hằng tuần, thứ Hai 07:00', 'Mọi ứng viên đang hoạt động chưa tắt công tắc nhận mail', '6', '**Đúng thứ tự điểm**, một công ty một hàng'],
          ['**Trang tìm kiếm** — không có khối gợi ý', '—', '—', 'Backend có sẵn một `surface=SEARCH` nhưng **giao diện không bao giờ gọi nó** — hiện **không có strip gợi ý nào** trên trang tìm việc. Chữ `SEARCH` trong code của trang này là **nhãn analytics** cho kết quả tìm kiếm thường, không phải một khối gợi ý'],
        ],
      },
      {
        kind: 'warn',
        text: '**Trang chủ không có khối gợi ý cá nhân nào.** Component cũ còn trong code nhưng không trang nào render, và placement `placement_home_hot_jobs` đã bị gỡ. Tài liệu nào còn nói “block Recommended ở trang chủ là placement” là tài liệu cũ.',
      },

      /* ── §2 ─────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '§2 · Hệ thống biết gì về ứng viên' },
      {
        kind: 'table',
        note: 'Giá trị **tự khai** ăn điểm đầy đủ. Giá trị **suy ra** chỉ ăn **80 %** của bậc tương ứng (làm tròn): 42→34 · 30→24 · 20→16 · 17→14 · 5→4.',
        cols: ['Nguồn', 'Lấy gì', 'Loại'],
        rows: [
          ['**Vị trí mong muốn** (tối đa 3) trong Work preference', 'Vị trí, và ngành nghề của vị trí đó', 'Tự khai'],
          ['**Ngành nghề · Địa điểm mong muốn · Ngành mong muốn**', 'Ngành nghề, tỉnh, ngành', 'Tự khai'],
          ['**Hành vi 90 ngày gần nhất** — nộp đơn hoặc lưu tin (**1 lần là đủ**), xem tin (**3 tin khác nhau**)', 'Vị trí · ngành nghề · tỉnh của những tin đó, giữ **top 3** mỗi loại', 'Suy ra'],
          ['**Tiêu đề CV** — chỉ khi ứng viên **không khai cả** vị trí lẫn ngành nghề', 'Vị trí có tên hoặc tên gọi khác nằm trọn trong tiêu đề; cụm dài nhất thắng', 'Suy ra — **không** bật cổng lọc'],
        ],
      },
      {
        kind: 'list',
        heading: 'Ba điều dễ hiểu nhầm',
        items: [
          '**Hành vi không cộng điểm.** Nó làm hai việc: mở rộng tập so khớp, và phá hoà — hai tin bằng điểm thì tin ứng viên **chưa xem** đứng trước.',
          '**Vị trí suy từ tiêu đề CV không bật cổng lọc.** Nó chỉ dùng để chấm điểm, nên một ứng viên chưa khai gì vẫn nhìn thấy tập tin rộng nhất.',
          '**Ngành chỉ lấy từ trường “Ngành mong muốn”** trong Work preference (chốt 16/11). Hệ thống **không** suy ngành từ công ty ghi trong CV.',
        ],
      },
      {
        kind: 'warn',
        text: '**Địa điểm chỉ lấy từ Work preference** (chốt 16/11). Bản trên `dev` ngày 16/11 còn một đường dự phòng đọc **tỉnh cư trú** trong Profile khi ứng viên không khai địa điểm mong muốn — đường này đang được gỡ. Khi gỡ xong, ứng viên không khai địa điểm mong muốn sẽ được **0 điểm địa điểm**.',
      },

      /* ── §3 ─────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '§3 · Điều kiện lọc — tin nào không bao giờ hiện' },
      {
        kind: 'table',
        cols: ['Điều kiện', 'Bật khi nào', 'Loại tin nào'],
        rows: [
          ['**Tin còn sống**', 'Luôn luôn', 'Tin đã đóng · hết hạn · tắt hiển thị · công ty không công khai; **tin đã từng nộp đơn** (mọi trạng thái, kể cả đã rút); tin ứng viên đã bấm **bỏ qua**'],
          ['**Ngành nghề**', 'Khi ứng viên đã khai vị trí **hoặc** ngành nghề', 'Tin ngoài tập ngành nghề (khai ∪ hành vi)'],
          ['**Địa điểm**', 'Khi đã khai tỉnh **và không** tick *sẵn sàng chuyển chỗ ở*', 'Tin ngoài các tỉnh đó — **trừ tin remote**, tin remote luôn qua cổng này'],
          ['**Neo theo tin đang xem**', 'Chỉ ở trang chi tiết tin', 'Tin khác ngành nghề với tin đang xem — và **không bao giờ nới**'],
          ['Ngành · hình thức · lương · kinh nghiệm · học vấn · kỹ năng', '**Không bao giờ lọc**', 'Chỉ ảnh hưởng điểm số'],
        ],
      },
      {
        kind: 'list',
        heading: 'Ba luật đi kèm',
        items: [
          '**Không khai gì thì không bật cổng nào** — tập tin rộng nhất có thể. Hệ thống không bao giờ trả về danh sách rỗng chỉ vì hồ sơ trống.',
          '**Cắt còn 500 tin trước khi chấm.** Ưu tiên tin trùng vị trí ứng viên đã khai, rồi tin mới nhất. Việc có bị cắt hay không được ghi vào log (`pool_capped`).',
          '**Dưới 6 tin thì nới hai bước:** bỏ điều kiện tỉnh, chạy lại; vẫn dưới 6 thì bỏ luôn điều kiện ngành nghề. **Tiêu đề khối không đổi** — hệ thống không thông báo là đã nới. Riêng trang chi tiết tin thì không bao giờ nới.',
        ],
      },

      /* ── §4 ─────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '§4 · Bảy tín hiệu, thang 100' },
      {
        kind: 'table',
        note: 'Trọng số **phiên bản v4**, cố định trong code. Admin **không chỉnh được** — tab chỉnh trọng số đã bỏ khỏi console ngày 05/11. Mỗi điểm số ghi log kèm số phiên bản.',
        cols: ['Tín hiệu', 'Tối đa', 'Các bậc'],
        rows: [
          ['**Vị trí & ngành nghề**', '**42**', 'Cùng vị trí 42 · cùng nhóm vị trí 30 · cùng ngành nghề 17 · khác 0. Lấy **một** bậc cao nhất, **không cộng dồn**'],
          ['**Địa điểm & hình thức**', '**20**', 'Đúng tỉnh + đúng hình thức 20 · tin remote 20 · đúng tỉnh khác hình thức 14 · khác 0. Ứng viên **không khai tỉnh thì không so**, tin remote cũng 0'],
          ['**Kinh nghiệm**', '**14**', 'Trong dải, hoặc tin ghi “không yêu cầu” 14 · thừa ≤ 2 năm 10 · thiếu ≤ 1 năm 7 · thừa > 2 năm 5 · thiếu > 1 năm 0. Tin **chỉ khai cấp bậc** thì quy năm của ứng viên ra bậc (bảng ở trang *Logic chung*): cùng bậc 14 · lệch 1 bậc 7 · còn lại 0'],
          ['**Lương**', '**12**', 'Trong dải, hoặc tin trả cao hơn mong muốn 12 · ứng viên đòi hơn ≤ 10 % 8 · ≤ 20 % 4 · một bên để “Thỏa thuận” 6 · hơn 20 % 0'],
          ['**Ngành**', '**5**', 'Trùng ngành 5 · cùng ngành cha 3 · khác 0'],
          ['**Kỹ năng**', '**4**', '4 × (số kỹ năng khớp ÷ số kỹ năng tin yêu cầu). Kỹ năng tin đánh dấu **bắt buộc** tính đôi ở cả hai vế'],
          ['**Học vấn**', '**3**', 'Đạt, hoặc tin ghi “không yêu cầu” 3 · thấp hơn 1 bậc 1 · còn lại 0'],
        ],
      },
      {
        kind: 'list',
        heading: 'Bốn luật chấm điểm',
        items: [
          '**Thiếu dữ liệu là 0 điểm, không chia lại thang.** Tin không ghi lương, hoặc ứng viên không khai lương, thì tín hiệu lương bằng 0 — 12 điểm đó **không** được chia sang tín hiệu khác. Đúng cho cả hai phía.',
          '**Ứng viên có nhiều CV:** chấm **từng CV**, mỗi tin giữ **điểm cao nhất** trong các CV.',
          '**Tổng luôn trên thang 100 và chỉ làm tròn một lần ở tổng** — không làm tròn từng tín hiệu.',
          '**Khác tiền tệ thì quy đổi theo tỷ giá admin nhập, dùng hai chiều.** Không có tỷ giá thì tín hiệu lương bằng 0. Đây là **thứ duy nhất** liên quan matching mà admin chỉnh được.',
        ],
      },
      {
        kind: 'warn',
        text: '**Kỹ năng ứng viên gõ tay mà không khớp master data được tính là “không có kỹ năng”** — mất điểm tín hiệu kỹ năng, và vẫn tính là một tín hiệu đã so được. Trường hợp này khá phổ biến với CV tải lên.',
      },

      /* ── §5 ─────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '§5 · Chọn thẻ để hiện' },
      {
        kind: 'list',
        items: [
          '**Bỏ tin trùng** — cùng công ty + cùng tiêu đề + cùng tỉnh thì giữ tin mới nhất.',
          '**Lấy 50 tin điểm cao nhất làm “rổ”** (chốt 16/11: 80 quá rộng, lọt nhiều tin không liên quan). **Không có điểm sàn** — rổ luôn đầy nếu có đủ tin.',
          '**Một công ty một hàng.** Mỗi hàng 6 thẻ, gặp công ty đã có trong hàng thì lấy thẻ kế tiếp. Hết công ty khác nhau thì **vẫn lấp đủ 6** (chấp nhận lặp công ty) để các hàng sau không lệch vị trí.',
          '**Tin đang xem và bản trùng của nó** bị loại khỏi rổ ở trang chi tiết tin và ở popup sau khi nộp đơn — không bao giờ gợi ý lại đúng tin vừa nộp.',
        ],
      },
      {
        kind: 'table',
        heading: 'Thứ tự theo từng màn hình',
        cols: ['Màn hình', 'Thứ tự'],
        rows: [
          ['Popup sau khi nộp đơn', '**Đúng thứ tự điểm**, không gom theo công ty (đây là danh sách, không phải hàng thẻ)'],
          ['Onboarding · Email JS 3', '**Điểm cao nhất trước**, một công ty một hàng'],
          ['Trang cá nhân · Chi tiết tin', '**Xáo trộn trong từng bậc vị trí** — xem dưới'],
        ],
      },
      {
        kind: 'list',
        heading: 'Xáo trộn trong từng bậc vị trí (SRM-1491, 16/11)',
        items: [
          'Rổ được xếp theo **điểm của riêng tín hiệu vị trí**: vị trí **khai** 42 → vị trí **suy từ hành vi** 34 → nhóm vị trí 30 / 24 → ngành nghề 17 / 14 → còn lại 0. Rồi **chỉ xáo bên trong mỗi bậc**.',
          'Hệ quả: **tin đúng vị trí ứng viên đã khai không bao giờ đứng sau tin chỉ cùng ngành nghề**, dù tin kia hơn điểm địa điểm hay lương.',
          'Lý do có luật này: QA báo một QA Engineer nhìn thấy Sysadmin, Helpdesk và Data Engineer đứng trước tin QA.',
          '**Hạt giống** = ứng viên + ngày + màn hình (+ tin đang xem ở trang chi tiết). Cùng một màn hình thì **ổn định cả ngày**, reload không đổi; mỗi màn hình đảo một kiểu khác; hôm sau mới khác. **Không bao giờ random thuần.**',
        ],
      },
      {
        kind: 'warn',
        text: '**Rổ 50 là con số đã chốt ngày 16/11.** Code trên `dev` lúc kiểm tra tối 16/11 vẫn đang là **80**; bản sửa xuống 50 chưa lên `dev`. Trong lúc chờ, danh sách xáo trộn trên dev sẽ đa dạng hơn (và lẫn nhiều tin xa hơn) so với mô tả ở đây.',
      },

      /* ── §6 ─────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '§6 · Một ví dụ chạy thật' },
      {
        kind: 'example',
        heading: 'Linh xem một tin QA Engineer ở Hà Nội',
        scenario:
          'Ứng viên **Linh**: khai vị trí mong muốn *QA Engineer*, địa điểm *Hà Nội* (không tick sẵn sàng chuyển chỗ), hình thức *Fulltime*, **4 năm** kinh nghiệm, mong muốn **20–25 triệu**, ngành mong muốn *Phần mềm*, học vấn *Đại học*, kỹ năng khai trong CV: *Selenium*, *Jira*. — Tin: **QA Engineer**, Hà Nội, Fulltime, yêu cầu **3–5 năm**, **18–25 triệu**, ngành *Phần mềm*, yêu cầu *Selenium* (bắt buộc) và *Postman*, học vấn *Đại học*.',
        cols: ['Tín hiệu', 'So sánh', 'Điểm'],
        rows: [
          ['Vị trí & ngành nghề', 'Cùng vị trí *QA Engineer* — bậc cao nhất', '42 / 42'],
          ['Địa điểm & hình thức', 'Đúng tỉnh Hà Nội **và** đúng hình thức Fulltime', '20 / 20'],
          ['Kinh nghiệm', '4 năm nằm trong dải 3–5', '14 / 14'],
          ['Lương', 'Dải tin 18–25 chạm dải mong muốn 20–25', '12 / 12'],
          ['Ngành', 'Trùng ngành *Phần mềm*', '5 / 5'],
          ['Kỹ năng', '*Selenium* là kỹ năng bắt buộc nên tính đôi → khớp 2 trên 3 phần yêu cầu; *Postman* không có', '2,7 / 4'],
          ['Học vấn', 'Đại học — đạt yêu cầu', '3 / 3'],
          ['**Tổng**', 'Làm tròn **một lần** ở tổng', '**99 / 100**'],
        ],
        note:
          'Ba điều cần rút ra: **(1)** Linh **không bao giờ nhìn thấy con số 99** — ứng viên không được hiển thị %. **(2)** Nếu tin này **không ghi lương**, tín hiệu lương bằng 0 và tổng còn 87 — 12 điểm đó không được chia lại cho các tín hiệu khác. **(3)** Nếu Linh **đã từng nộp đơn** vào tin này, dù đơn đã bị từ chối, tin bị loại ở **§3** và không bao giờ được chấm.',
      },

      /* ── §7 ─────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '§7 · Hệ thống ghi lại gì' },
      {
        kind: 'list',
        items: [
          '**Mỗi thẻ hiện ra là một dòng log**: ứng viên · tin · điểm · phiên bản trọng số · màn hình · vị trí trong danh sách · có nới điều kiện không · có bị cắt 500 không. Email JS 3 ghi log **sau khi** gửi.',
          '**Bấm vào thẻ** ghi thời điểm click vào chính dòng log đó — đây là dữ liệu để sau này đánh giá chất lượng gợi ý.',
          '**Bấm bỏ qua** loại tin vĩnh viễn khỏi mọi danh sách gợi ý, y như tin đã nộp đơn.',
        ],
      },
    ],
  },

  /* ────────────────────────────────────────────────────────────────────────── */
  'similar-jobs': {
    logic: [
      '**So tin với tin, không đọc hồ sơ người xem.** Vì vậy **mọi người đều thấy cùng một danh sách** cho cùng một tin — khách chưa đăng nhập cũng thấy y hệt người đã đăng nhập.',
      '**Đây là bảng điểm riêng**, khác bảng của *Recommended jobs*: 45 / 15 / 15 / 10 / 8 / 4 / 3, trên cùng thang 100. Đừng dùng bảng của bên kia để giải thích kết quả bên này.',
      '**Kết quả được cache 1 giờ cho mỗi tin** và chỉ tính lại ở lượt xem đầu tiên sau khi cache hết hạn — thực tế làm mới chậm nhất khoảng **75 phút**.',
      '**Không có cổng lọc ngành nghề — và đó là cả mục đích của thiết kế này.** Bản nháp cũ bắt buộc cùng ngành nghề rồi bỏ hết phần còn lại; làm vậy sẽ có những tin **không có việc tương tự nào để hiện**, và một khối rỗng là kết cục mà tính năng này không được phép tạo ra. Chấm hết mọi tin thì không bao giờ rỗng, và phần dự phòng tự nó hợp lý: một tin không có gì cùng ngành nghề vẫn ăn điểm địa điểm, cấp bậc, lương và hình thức — thành ra *cùng thành phố, cùng cấp bậc, lương tương đương*.',
      '**Hệ thống không hứa “tương tự” khi nó không tương tự:** điểm cao nhất dưới 40 thì giao diện đổi tiêu đề thành *Việc làm khác tại {tỉnh}* — nhưng vẫn hiện đủ 6 thẻ.',
    ],
    how: [
      'Mở bất kỳ **trang chi tiết tin** nào trên site ứng viên và kéo xuống carousel *Việc làm tương tự*.',
      'Ngay dưới carousel là khối thứ hai. **Đã đăng nhập** thì khối đó là *Gợi ý việc làm cho bạn* (bộ máy **Recommended jobs**, đọc hồ sơ). **Chưa đăng nhập** thì khối đó lấy **dòng 7–12 của chính danh sách này** và mang tiêu đề *Có thể bạn quan tâm*.',
      'Muốn biết vì sao một tin lọt vào: so hai tin với nhau theo bảng ở §2 — không cần biết người xem là ai. Có ví dụ chạy đủ số ở §7.',
    ],
    watch: [
      '**Hai khối cạnh nhau, hai bộ máy khác nhau.** *Việc làm tương tự* so tin với tin; *Gợi ý việc làm cho bạn* so hồ sơ với tin. Hai khối **không bao giờ trùng tin**: carousel lấy trước, khối dưới bỏ các id đã hiện.',
      '**Tin đã nộp đơn vẫn nằm trong danh sách dùng chung** — giao diện mới là chỗ ẩn nó đi cho người đã đăng nhập (§6). Nên danh sách gốc không đổi theo từng người.',
      '**Từ 16/11, tin đã rút đơn hiện lại trên carousel này** và nộp lại được, trong khi ở *Recommended jobs* và các email thì vẫn bị ẩn. Cùng một tin có thể thấy ở chỗ này mà không thấy ở chỗ kia — đây là hệ quả cố ý của quyết định “rút đơn là dứt khoát và giải phóng tin”.',
      '**Sửa nội dung một tin không làm danh sách đổi ngay** — phải chờ cache hết hạn.',
      '**Tuổi tin không ăn điểm**, chỉ dùng để phá hoà cuối cùng. Một tin cũ nhưng giống hệt vẫn đứng trên một tin mới nhưng khác ngành.',
    ],
    blocks: [
      { kind: 'p', text: STAMP },

      { kind: 'h', text: '§1 · Luồng chạy' },
      {
        kind: 'list',
        items: [
          'Tin gốc phải đang **mở hoặc đã đóng**, còn bật hiển thị, công ty công khai — không thì trả về **404**.',
          'Đọc **một câu truy vấn** lấy thông tin tin gốc và **mọi tin đang sống** — không có cổng ngành nghề, không giới hạn theo ngày đăng.',
          'Chấm điểm trong bộ nhớ → **bỏ tin trùng** (cùng công ty + tiêu đề + tỉnh) và bỏ bản trùng của chính tin gốc → **tối đa 2 tin mỗi công ty** → sắp **điểm ↓ → ngày đăng ↓ → id ↓** → giữ **20 id** → dựng thẻ và kiểm tra lại tin còn sống.',
          'Giao diện xin khoảng **12 dòng**: 6 cho carousel, dòng 7–12 cho khối thứ hai của khách chưa đăng nhập.',
          '**Luôn loại:** chính tin đang xem · tin đã đóng hoặc hết hạn · tin tắt hiển thị · công ty không còn hoạt động.',
          '**Không có điểm sàn.** Danh sách luôn đủ 6 thẻ chừng nào thị trường còn 6 tin để đưa — một danh sách điểm thấp vẫn là 6 tin liên quan nhất đang tồn tại, và như vậy vẫn hơn một khối rỗng.',
          '**Cùng công ty bị giới hạn, không bị loại.** Hai tin là đủ để một nhà tuyển dụng không chiếm hết hàng; loại hẳn sẽ vứt đi những tin thật sự phù hợp khi công ty đó là đơn vị tuyển chính trong một ngách hẹp.',
        ],
      },

      { kind: 'h', text: '§2 · Bảng điểm tin ↔ tin' },
      {
        kind: 'table',
        note: 'Trọng số **phiên bản v3**, cố định trong code. Thiếu dữ liệu ở **bất kỳ phía nào** là 0 điểm, không chia lại thang (§4).',
        cols: ['Tín hiệu', 'Tối đa', 'Các bậc'],
        rows: [
          ['**Ngành nghề**', '**45**', 'Cùng vị trí 45 · cùng nhóm vị trí 32 · cùng ngành nghề 18. Lấy quan hệ **mạnh nhất** giữa mọi cặp vị trí của hai tin'],
          ['**Cấp bậc**', '**15**', 'Cùng bậc 15 · lệch 1 bậc 9 · lệch 2 bậc 4 · từ 3 bậc trở lên 0'],
          ['**Địa điểm**', '**15**', 'Cùng tỉnh, hoặc một bên là tin remote 15 · khác tỉnh 0'],
          ['**Lương**', '**10**', 'Hai dải giao nhau 10 · lệch trong 20 % 5 · không giao 0. Quy về **lương tháng** và quy đổi tiền tệ trước khi so'],
          ['**Kỹ năng**', '**8**', '8 × (số kỹ năng chung ÷ số kỹ năng của **tin đang xem**)'],
          ['**Ngành**', '**4**', 'Cùng ngành 4 · cùng nhóm ngành cha 2'],
          ['**Hình thức làm việc**', '**3**', 'Cùng hình thức 3 · remote ↔ hybrid 2'],
        ],
      },
      {
        kind: 'warn',
        text: '**Bậc “cùng nhóm vị trí” (32 điểm) chưa bao giờ đạt được** — dữ liệu taxonomy ba tầng chưa có (SRM-1315). Thực tế thang ngành nghề chạy hai bậc: 45 hoặc 18. Xem §7 để thấy điều này đổi thứ hạng như thế nào.',
      },

      { kind: 'h', text: '§3 · Vì sao các con số như vậy' },
      {
        kind: 'list',
        items: [
          '**Ngành nghề là xương sống, và tầng giữa mới là chỗ quan trọng.** Với 21 ngành nghề và 477 vị trí, nhảy thẳng từ “cùng vị trí” xuống “cùng ngành nghề” là bước quá dài — 42 vị trí cùng nằm trong *IT Development · Data*, mà một Frontend Developer không phải một Data Engineer. **Nhóm vị trí** là nấc thang còn thiếu.',
          '**Tin đăng nhiều vị trí lấy quan hệ mạnh nhất, không lấy trung bình.** So mọi cặp vị trí của hai tin rồi giữ cặp gần nhau nhất. Nhờ vậy một tin liệt kê năm vị trí **không bị phạt vì đăng rộng**, và cũng **không tự nâng điểm** bằng cách liệt kê thêm vị trí.',
          '**Địa điểm ăn điểm thật, không phải chỉ để phá hoà.** Một tin Senior ở Hà Nội không thay thế được cho người đang đọc một tin ở Hồ Chí Minh, dù tiêu đề giống nhau đến đâu. Ứng viên lọc theo địa điểm gắt hơn mọi tiêu chí khác. **Đây là nút vặn đầu tiên** nếu danh sách chạy ra sai cảm giác: nâng từ 15 lên 20 là “cùng thành phố, nghề gần” thắng “cùng nghề, ở xa”.',
          '**Kỹ năng cố ý nhỏ — 8 trên 100.** Hai bên đều chọn từ một danh mục chung nên so sánh là chính xác, nhưng độ chồng lấn thực tế rất mỏng: một tin thường khai 5–6 kỹ năng và hai tin liên quan chỉ chung hai ba cái. Ở mức 8 điểm, chồng lấn mạnh đủ để tách hai tin xấp xỉ nhau nhưng **không đủ lật ngược quan hệ ngành nghề** — và nó hỏng an toàn trong lúc danh mục kỹ năng đang được xây lại: một ngành nghề có ít kỹ năng chỉ đơn giản gần 0 ở tiêu chí này, chứ không hành xử khác phần còn lại.',
          '**Những gì KHÔNG vào điểm:** quy mô công ty · phúc lợi · học vấn · loại hợp đồng · **tuổi tin**. Tuổi tin chỉ là phá hoà cuối cùng. Những thứ này hoặc lặp lại một tín hiệu đã tính, hoặc không đổi việc một tin có thay thế được tin kia hay không.',
        ],
      },

      { kind: 'h', text: '§4 · Thiếu dữ liệu — ai bị trừ, ai không' },
      {
        kind: 'table',
        note: 'Hai tin hiếm khi khai cùng một bộ trường. **Một luật duy nhất**, giống hệt hai bộ máy chấm điểm còn lại: tín hiệu nào không so được thì 0 điểm, tổng vẫn trên thang 100.',
        cols: ['Trường hợp', 'Làm gì', 'Vì sao'],
        rows: [
          ['**Tin đang xem không khai** trường đó', 'Mọi tin ứng viên đều **0** ở tín hiệu đó. Tổng vẫn trên thang 100, **không chia lại**', 'Thứ tự không đổi dù chia lại hay không — mọi dòng đều mất đúng số điểm ấy. Chia lại chỉ đẻ thêm một luật thứ hai'],
          ['Tin đang xem có khai, **tin kia không**', 'Tin kia **0** ở tín hiệu đó. Không chia lại', 'Tin gốc đặt ra một câu hỏi mà tin kia không trả lời, nên nó thật sự kém so sánh hơn'],
          ['**Cả hai đều không khai**', '**0**, như dòng đầu', 'Không có gì để so'],
        ],
      },
      {
        kind: 'list',
        items: [
          '**Cái giá phải trả:** một tin khai càng ít thì **trần điểm của nó càng thấp**, nên danh sách của nó hay rơi vào tiêu đề *Việc làm khác tại {tỉnh}* hơn (§5). Đó là sự thật chứ không phải lỗi — những tin đó thật sự được gắn với nhau bằng ít thông tin hơn.',
          '**Lương khác tiền tệ** được quy đổi theo tỷ giá admin **trước khi** so, không bao giờ so số thô. Không có tỷ giá thì tín hiệu lương bằng 0.',
        ],
      },

      { kind: 'h', text: '§5 · Khi không tìm được tin nào thật sự giống' },
      {
        kind: 'list',
        items: [
          'API trả về danh sách thẻ **kèm một cờ `weak`**, và **không trả điểm**.',
          '`weak` bật khi **tin cao điểm nhất vẫn dưới 40**. Giao diện khi đó đổi tiêu đề thành **“Việc làm khác tại {tỉnh}”**.',
          '**Vẫn hiện đủ 6 thẻ** — không ẩn khối, không giảm số thẻ. Chỉ lời hứa trong tiêu đề là thay đổi.',
          'Dưới 40 điểm nghĩa là **ngành nghề gần như không đóng góp gì** và các thẻ chỉ còn được gắn với nhau bằng địa điểm và cấp bậc. Đổi tiêu đề thay vì giấu danh sách là cách trung thực hơn.',
        ],
      },

      { kind: 'h', text: '§6 · Người đã đăng nhập thấy gì' },
      {
        kind: 'p',
        text: 'Người đã đăng nhập không nên được mời một việc họ đã nộp đơn — mở ra cũng chỉ thấy nút ứng tuyển từ chối. Nên hệ thống **bớt các dòng đó đi**. Không đổi gì khác: cùng điểm, cùng thứ tự, cùng thẻ.',
      },
      {
        kind: 'table',
        cols: ['Người đọc', 'Thấy gì'],
        rows: [
          ['Chưa đăng nhập', 'Toàn bộ danh sách, đúng như bản cache. Không giấu gì — hệ thống không biết họ là ai'],
          ['Đã đăng nhập, chưa nộp tin nào trong đó', 'Giống hệt mọi người'],
          ['Đã đăng nhập, đã nộp một vài tin trong đó', 'Cùng danh sách, trừ những tin đó. Phần còn lại giữ nguyên vị trí'],
        ],
      },
      {
        kind: 'list',
        items: [
          '**Server gửi MỘT danh sách cache cho tất cả mọi người; trình duyệt mới là chỗ bỏ các dòng của riêng người đọc.** Trang chi tiết tin vốn đã phải hỏi “tôi nộp tin này chưa” để vẽ nút Apply, nên câu trả lời đang trên đường tới rồi — không tốn thêm lượt gọi nào. Lọc ở server sẽ biến mỗi trang chi tiết tin thành một trang riêng cho từng người và **mất sạch cache**.',
          '**Xin nhiều dòng hơn số thẻ hiện ra** — khoảng 12 dòng cho một hàng 6 thẻ. Bỏ hai ba dòng trong mười hai thì hàng vẫn đầy; bỏ hai ba dòng trong đúng sáu thì hàng ngắn thấy rõ.',
          '**Không để thẻ biến mất trước mắt người đọc.** Vẽ hàng sau khi đã biết họ nộp những tin nào — trang vốn đã chờ câu trả lời đó. Hiện 6 thẻ rồi xoá đi 2 làm trang nhảy và trông y như một lỗi.',
        ],
      },

      { kind: 'h', text: '§7 · Ví dụ chạy thật' },
      {
        kind: 'example',
        heading: 'Người đọc đang xem một tin Senior Frontend Engineer',
        scenario:
          'Tin đang xem: **Senior Frontend Engineer · FPT Software · Hồ Chí Minh · Senior · IT/Phần mềm · 30–45 triệu**, khai **5 kỹ năng**: React · TypeScript · Git · Docker · AWS. Con số 5 này là mẫu số của tín hiệu kỹ năng.',
        cols: ['Tin ứng viên', 'Ngành nghề 45', 'Cấp bậc 15', 'Địa điểm 15', 'Lương 10', 'Kỹ năng 8', 'Ngành 4 + HT 3', 'Tổng'],
        rows: [
          ['**React Developer** · Tiki · HCM · Senior · 32–48tr · chung React, TypeScript, Git', 'cùng vị trí **45**', '**15**', '**15**', '**10**', '3/5 → **4,8**', '**7**', '**97**'],
          ['**Backend Engineer** · Shopee · HCM · Senior · 30–45tr · chung Docker', 'cùng nhóm **32**', '**15**', '**15**', '**10**', '1/5 → **1,6**', '**7**', '**81**'],
          ['**Frontend Engineer** · VNG · **Hà Nội** · Senior · 30–45tr · chung React, TypeScript', 'cùng vị trí **45**', '**15**', 'khác tỉnh **0**', '**10**', '2/5 → **3,2**', '**7**', '**80**'],
          ['**Frontend Intern** · Base.vn · HCM · **Intern** · 8–12tr · chung React', 'cùng vị trí **45**', 'lệch 3 bậc **0**', '**15**', 'không giao **0**', '1/5 → **1,6**', '**7**', '**69**'],
          ['**Data Engineer** · MoMo · HCM · Senior · 35–50tr · chung AWS', 'cùng ngành nghề **18**', '**15**', '**15**', '**10**', '1/5 → **1,6**', '**7**', '**67**'],
          ['**Kế toán trưởng** · VNG · HCM · Manager · 30–45tr · không chung gì', 'khác ngành nghề **0**', 'lệch 1 bậc **9**', '**15**', '**10**', '**0**', '**3**', '**37**'],
        ],
        note:
          '**Thứ tự theo tài liệu:** Tiki 97 · Shopee 81 · VNG 80 · Base.vn 69 · MoMo 67 · Kế toán 37. — ⚠ **Trên build hôm nay thì khác**: bậc *cùng nhóm vị trí* chưa chạy, nên Shopee chỉ được **18** chứ không phải 32, tổng còn **67** — **bằng đúng MoMo**, và hai tin phải phá hoà bằng ngày đăng. Đây chính là cái giá của việc thiếu tầng taxonomy giữa (§2). — Ba điều khác đáng rút ra: **(1)** Shopee 81 nhỉnh hơn VNG 80 **một điểm** là thiết kế đang chạy đúng — “khác vị trí, cùng thành phố” và “cùng vị trí, khác vùng” thật sự xấp xỉ nhau. **(2)** Tin **Intern** (69) vượt Data Engineer (67) dù lương bằng một phần năm: cùng vị trí và cùng thành phố thắng cùng ngành nghề. Nếu thấy sai thì vặn **Cấp bậc** từ 15 lên 20, **đừng lọc bỏ cấp bậc** — làm vậy là đem khối rỗng quay lại. **(3)** Tin **Kế toán trưởng** vẫn nằm đó ở 37 điểm, và đó là cố ý: nếu thị trường chỉ có sáu tin này thì người đọc vẫn thấy sáu thẻ. Khi có năm chục tin IT thì nó không bao giờ xuất hiện.',
      },

      { kind: 'h', text: '§8 · Phase 2, và chỗ build khác tài liệu' },
      {
        kind: 'table',
        heading: 'Hai thay đổi đã lên kế hoạch — chưa làm',
        cols: ['Khi nào', 'Đổi gì', 'Vì sao phải chờ'],
        rows: [
          ['Danh mục kỹ năng xây lại xong và các tin thường xuyên khai từ 5 kỹ năng trở lên', 'Nâng **Kỹ năng** từ 8 lên khoảng **15**, lấy điểm từ **Ngành nghề** (45 → 38)', 'Chồng lấn kỹ năng chỉ đáng tin khi cả hai bên đều thật sự có kỹ năng. Nâng sớm sẽ khiến vài ngành nghề đã soạn kỹ năng hành xử khác hẳn phần còn lại'],
          ['Log gợi ý đã đủ dữ liệu click', 'Tinh chỉnh **toàn bộ trọng số** theo dữ liệu đó, cùng cách làm với bên Recommended jobs', 'Các con số hiện nay là điểm khởi đầu có lý lẽ, không phải kết quả nghiên cứu. Chúng là cấu hình và chỉ nên đổi theo bằng chứng'],
        ],
      },
      {
        kind: 'warn',
        text: '**Trọng số: tài liệu nói một đằng, build làm một nẻo.** Tài liệu yêu cầu coi trọng số là **cấu hình** — đổi được mà không cần deploy, có ghi phiên bản để trả lời được “vì sao danh sách này đổi”. Build đang để **cố định trong code** (`RelevantJobsWeights`, phiên bản `v3`), nên đổi một con số là một lần deploy. Giống hệt bên Recommended jobs.',
      },
      {
        kind: 'warn',
        text: '**Bậc “tỉnh lân cận” (9 điểm)** vẫn còn trong tài liệu và còn cả hằng số trong code, nhưng **chưa bao giờ đạt được** vì chưa có bảng tỉnh lân cận trong master data. BA chốt **bỏ hẳn** ngày 12/11 — khác tỉnh là 0. Thứ hạng thực tế không đổi.',
      },
      {
        kind: 'p',
        text: '**Điểm số không bao giờ rời khỏi backend.** Không có % trên thẻ, không có trường điểm trong response, và điểm cũng không được lưu lại. Người đọc so hai tin không cần một con số, còn in nó ra chỉ mời thêm tranh cãi về một mô hình vốn đã là ước lượng.',
      },
    ],
  },

  /* ────────────────────────────────────────────────────────────────────────── */
  'recommended-candidates': {
    logic: [
      '**Khối này neo vào MỘT TIN TUYỂN DỤNG, không neo vào thư mục.** Thư mục talent pool chỉ có tên và ngày tạo — không có vị trí, không cấp bậc, không địa điểm, nên không có gì để so. Thư mục là nơi **lưu** kết quả, không phải đề bài sinh ra kết quả.',
      '**Một phép tính duy nhất — tin nháp không phải trường hợp riêng.** Không có cổng “tin nháp đủ thông tin chưa”. Tin khai thiếu thì **tự khắc điểm thấp**, vì tín hiệu tin không khai được 0 điểm.',
      '**Chỉ đọc dữ liệu ứng viên tự khai** — hồ sơ và CV. Hành vi xem tin, lưu tin, nộp đơn **không bao giờ** sang phía nhà tuyển dụng; đó là dữ liệu cá nhân, đọc để xếp feed của chính người đó chứ không cho việc gì khác.',
      '**Có điểm sàn 40 đặt trên KẾT QUẢ.** Người cao điểm nhất dưới 40 nghĩa là tin này không sinh ra được gì dùng được → đổi hẳn sang chế độ *Hồ sơ mới cập nhật*. Phía ứng viên không có sàn nào.',
      '**Điểm chọn ra rổ, phép xáo trộn gieo theo ngày chọn ai hiện hôm nay.** Áp dụng cho **cả hai** chế độ, không phải mẹo riêng của chế độ dự phòng.',
    ],
    how: [
      'Vào **Company Home** của site nhà tuyển dụng (`/hiring`), khối *Recommended talent*. Cần quyền tìm kiếm ứng viên.',
      'Dropdown ở đầu khối chọn tin để so. Không chọn thì hệ thống tự lấy theo thứ tự ở §1. Tiêu đề khối **in tên tin** — NTD phải thấy được danh sách này đang trả lời cho tin nào mà không cần bấm gì.',
      'Muốn biết vì sao một người lọt vào: xem **§3** trước (họ có qua được bước lọc không), rồi mới tới **§4** (họ ăn bao nhiêu điểm).',
    ],
    watch: [
      '**Bấm thẻ là tốn một lượt mở CV miễn phí** (chốt 16/11). Hết lượt thì thẻ **vẫn hiện**, nhưng mở ra là CV che hết chi tiết.',
      '**Một hồ sơ hiện 3 lần mà không ai bấm thì bị loại** khỏi gợi ý của công ty đó — và bị loại **trước** khi xáo trộn, không phải sau.',
      '**Rổ nhỏ hơn một hàng thẻ không phải lỗi.** Chỉ 2 người qua sàn thì hiện 2 người, mỗi ngày, cho tới khi dữ liệu đổi. **Không bù** bằng người dưới sàn — đó đúng là thứ mà điểm sàn sinh ra để chặn.',
      '**Chế độ *Hồ sơ mới cập nhật* không in % và không gắn nhãn Top pick.** Ở đó không có điểm, nên một nhãn tự tin là một lời nói dối.',
      '**Cờ `exposure` không liên quan ở đây.** Nó ẩn tin khỏi *ứng viên*; đây là dashboard của chính công ty, nên tin tắt hiển thị vẫn neo bình thường — họ vẫn đang tuyển, chỉ là không quảng cáo.',
    ],
    blocks: [
      { kind: 'p', text: STAMP },

      /* ── §1 ─────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '§1 · Khối neo vào đâu — một tin, chọn theo trạng thái rồi tới lần sửa cuối' },
      {
        kind: 'p',
        text: 'NTD chọn tin từ dropdown. Không chọn thì hệ thống lấy **tin thật nhất**, không phải tin mới nhất: **trạng thái quyết định bậc, trong cùng một bậc thì tin sửa gần nhất thắng**.',
      },
      {
        kind: 'table',
        cols: ['Ưu tiên', 'Trạng thái tin', 'Vì sao nằm ở bậc này'],
        rows: [
          ['**1**', '**Đang mở**, chưa quá hạn', 'Đang tuyển thật. Ai hiện ra cho tin này thì liên hệ được ngay hôm nay.'],
          ['**2**', '**Hẹn đăng**', 'Đã chốt và duyệt xong, chỉ còn chờ tới ngày.'],
          ['**3**', '**Nháp**', 'Có thể không bao giờ đăng, nhưng vẫn hơn là không có gì để neo.'],
          ['—', '**Đã đóng**', '**Không bao giờ neo.** Tin đã đóng thì không còn tuyển.'],
          ['—', 'Không có tin nào ở cả ba bậc', 'Tiêu đề đổi thành **Hồ sơ mới cập nhật** — xem §6.'],
        ],
      },
      {
        kind: 'list',
        items: [
          '**TRONG CÙNG MỘT BẬC, SẮP THEO LẦN SỬA CUỐI — KHÔNG PHẢI NGÀY TẠO.** Việc này quan trọng hơn vẻ ngoài của nó: công ty có hai mươi tin đang mở sẽ không hiểu vì sao “tin mới nhất” được chọn, còn “tin bạn vừa sửa” thì tự giải thích trong một câu. Nó cũng chặn một tin nháp bỏ quên sáu tháng trước vượt lên trên tin NTD vừa động vào sáng nay.',
          '**TIN ĐANG MỞ NHƯNG QUÁ HẠN BỊ COI NHƯ ĐÃ ĐÓNG** và rơi khỏi bậc 1 — nếu không thì Home đi mời ứng viên cho một tin không ai nộp đơn được nữa.',
          '**TIÊU ĐỀ IN TÊN TIN.** NTD phải nhìn ra danh sách này đang trả lời cho tin nào mà không phải bấm gì cả.',
          '**THƯ MỤC KHÔNG BIẾN MẤT — NÓ ĐỔI VAI.** Trước là đề bài, giờ là đích đến: nút “Lưu vào thư mục…” nằm trên từng thẻ.',
        ],
      },

      /* ── §2 ─────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '§2 · Một phép tính duy nhất — tin nháp không phải trường hợp riêng' },
      {
        kind: 'p',
        text: 'Tin nháp và tin đã đăng đi qua **đúng cùng một phép chấm**. Không có bước kiểm “tin nháp này đủ thông tin chưa”, không có nhánh code thứ hai. Tin nháp khai nửa vời **không bị loại** — nó chỉ **tự khắc điểm thấp**, nhờ luật ở §4. Toàn bộ cơ chế chỉ có thế.',
      },
      {
        kind: 'list',
        items: [
          '**VÌ SAO KHÔNG ĐẶT CỔNG.** Một cái cổng là luật thứ hai phải nuôi, phải cãi nhau và phải giữ cho khớp với luật thứ nhất — và nó buộc phải trả lời câu “bao nhiêu thông tin thì đủ?”, câu mà không ai trả lời được. Để điểm tự tụt thì không cần trả lời gì, cũng không cần thêm dòng code nào.',
          '**TIN NHÁP ĐÁNG ĐỂ NEO.** Lúc NTD đang viết tin là thời điểm tốt nhất trong cả phễu để cho họ thấy người phù hợp. Không lộ gì cả: đó là tin nháp của chính công ty họ.',
          '**CÙNG MỘT BỘ CHẤM ĐIỂM VỚI PHÍA ỨNG VIÊN** — bảy tín hiệu đó, số điểm đó, các bậc đó, chỉ đọc ngược từ đầu kia. Nó không quan tâm tin đã đăng hay chưa.',
        ],
      },

      /* ── §3 ─────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '§3 · Ai được coi là ứng viên của tin này — bước mang toàn bộ logic' },
      {
        kind: 'p',
        text: 'Trước khi chấm bất cứ thứ gì, tập người được thu về những ai **có khả năng là ứng viên CỦA TIN NÀY**. Đây không phải mẹo tối ưu tốc độ — đây là định nghĩa. Lấy một người khi **BẤT KỲ** điều nào sau đây đúng, rồi cắt còn **500 người** trước khi chấm.',
      },
      {
        kind: 'table',
        cols: ['Đọc từ tin', 'So với ứng viên'],
        rows: [
          ['Mọi **vị trí** gắn trên tin', '**Vị trí mong muốn** của ứng viên (tối đa 3)'],
          ['**Ngành nghề** của tin', '**Ngành nghề mong muốn** trên hồ sơ'],
          ['**Kỹ năng** của tin', '**Kỹ năng trên CV** của ứng viên'],
        ],
      },
      {
        kind: 'list',
        items: [
          '**KHÔNG CÓ BƯỚC NÀY THÌ ĐIỂM SỐ CHO NGƯỜI LẠ LỌT QUA.** Địa điểm 20 + kinh nghiệm 14 + lương 12 là **46** — đã trên sàn 40 ở §5. Nghĩa là một người cùng thành phố, đúng số năm, đúng mức lương sẽ đủ điểm cho một tin thuộc ngành hoàn toàn không liên quan. Điểm sàn không bắt được chuyện đó; chỉ bước này bắt được.',
          '**LÀ “HOẶC”, KHÔNG PHẢI “VÀ”.** Đây là gợi ý, không phải tìm kiếm: quăng lưới rộng ở đây rồi để điểm số ở §4 xếp hạng. Dùng “và” thì trên một cơ sở dữ liệu cỡ Việt Nam sẽ gần như không ra ai.',
          '**ĐÂY CŨNG LÀ THỨ LÀM TIN NHÁP SƠ SÀI TỰ GIẢI QUYẾT.** Tin nháp không vị trí, không ngành nghề, không kỹ năng thì không khớp ai ở bước này → danh sách rỗng → khối rơi xuống chế độ ở §6. Không cần một luật riêng nào cho tin nháp, đúng như §2.',
          '**KHỚP CẢ THỨ HỌ MUỐN LẪN THỨ HỌ LÀM ĐƯỢC.** Vị trí và ngành nghề mong muốn nói họ đang tìm gì; kỹ năng trên CV nói họ làm được gì. NTD cần cả hai đúng, nên cả hai đều được quyền đưa một người vào vòng chấm, và cả hai đều được chấm ở bước sau.',
          '**NGƯỜI ĐÃ BỊ “LỜ ĐI” 3 LẦN RỜI TẬP TRƯỚC KHI CẮT 500**, không phải sau — nếu không thì họ vẫn chiếm chỗ trong 500 người được chấm.',
          '⚠ **MẶT TRÁI CỦA NHÁNH KỸ NĂNG:** ứng viên gõ tay kỹ năng không khớp master data thì nhánh thứ ba **không bao giờ chạy** cho họ. Họ phải khai vị trí hoặc ngành nghề mới vào được vòng chấm — mất nhiều hơn hẳn 4 điểm kỹ năng.',
        ],
      },

      /* ── §4 ─────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '§4 · Tín hiệu tin không khai được 0 điểm — không bị loại khỏi mẫu số' },
      {
        kind: 'p',
        text: 'Đây là chỗ dễ hiểu sai nhất, và mọi thứ ở trên dựa vào nó. Phép chấm **không chia lại thang**: tín hiệu tin không khai **không** bị bỏ ra để kéo các trọng số còn lại lên 100. Mỗi tín hiệu giữ nguyên trọng số của nó, tin không khai thì ăn **0** của phần đó, và tổng **luôn trên cùng một thang 100**. Trọng số dùng **chung một bảng** với *Recommended jobs*.',
      },
      {
        kind: 'table',
        note: 'Cột cuối đọc một tin nháp chỉ khai mỗi địa điểm — để thấy vì sao không cần cổng kiểm tin nháp.',
        cols: ['Tín hiệu', 'Điểm', 'Đọc từ tin', 'Đọc từ ứng viên — chỉ dữ liệu tự khai', 'Nháp chỉ khai địa điểm'],
        rows: [
          ['Vị trí & ngành nghề', '**42**', 'Vị trí gắn trên tin + ngành nghề', 'Vị trí mong muốn (≤3) + ngành nghề mong muốn. Trống cả hai → **tiêu đề CV** (suy ra → 34). **Không đọc hành vi**', '0'],
          ['Địa điểm & hình thức', '**20**', 'Tỉnh + hình thức làm việc', 'Địa điểm mong muốn + hình thức', '**20**'],
          ['Kinh nghiệm', '**14**', 'Dải năm, không có thì cấp bậc', 'Số năm trên hồ sơ; trống thì tính từ CV', '0'],
          ['Lương', '**12**', 'Dải lương + tiền tệ', 'Lương mong muốn + tiền tệ — quy đổi trước khi so', '0'],
          ['Ngành', '**5**', 'Ngành của công ty', 'Ngành mong muốn', '0'],
          ['Kỹ năng', '**4**', 'Kỹ năng của tin', 'Kỹ năng trên CV', '0'],
          ['Học vấn', '**3**', 'Mức yêu cầu', 'Học vấn trên CV', '0'],
          ['**Tổng**', '**100**', '', '', '**20**'],
        ],
      },
      {
        kind: 'list',
        items: [
          '**ĐÓ CHÍNH LÀ MỤC ĐÍCH:** một tin nháp chỉ có mỗi thành phố thì **không bao giờ** sinh ra được thẻ trên 20 %, nên nó không bao giờ trông giống một kết quả chắc chắn. Con số tự nói thật, không cần ai gác.',
          '**CÁC BẬC NẰM Ở TRANG *Recommended jobs*** — cùng vị trí 42, cùng ngành nghề 17, trong dải năm 14, lệch một bậc 7… Một bảng, một chỗ; đừng chép lại ở đây. Luật trừ 20 % cho giá trị suy ra cũng áp dụng y như vậy.',
          '**CHỈ DỮ LIỆU TỰ KHAI.** Feed của ứng viên có mở rộng tập vị trí và tỉnh từ những gì họ xem, lưu, nộp đơn. Hành vi đó **không bao giờ** được nối vào bất cứ thứ gì phía nhà tuyển dụng, nên phép chấm ở đây chỉ đọc trường tự khai và các đường dự phòng từ CV.',
          '**NÓ CÒN SỬA MỘT LỖI THẬT.** Nếu chia lại thang, hai thẻ nằm cạnh nhau trong cùng một hàng **không cùng một thang**: một thẻ chấm trên 4 tín hiệu, thẻ kia trên 7, mà cả hai đều in ra phần trăm. **Tin khai ÍT hơn lại được điểm CAO hơn.** Chấm tuyệt đối đặt mọi thẻ lên cùng một thang 100.',
        ],
      },

      /* ── §5 ─────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '§5 · Một điểm sàn, đặt trên kết quả — không đặt trên tin nháp' },
      {
        kind: 'p',
        text: 'Vì tin sơ sài **cố ý** bị điểm thấp, phải có một mốc mà dưới đó thì hàng thẻ không đáng hiện. Đây là sàn đặt trên **kết quả**, và nó áp dụng cho tin đã đăng y hệt như cho tin nháp — **không phải luật riêng của tin nháp**. LUẬT: người cao điểm nhất dưới **40** nghĩa là tin này không sinh ra được gì dùng được → rơi xuống §6 và đổi tiêu đề.',
      },
      {
        kind: 'list',
        items: [
          '**VÌ SAO CẦN SÀN:** ở mức 15 % các thẻ không sai, chúng **vô nghĩa** — và một hàng thẻ vô nghĩa nằm dưới một tiêu đề tự tin chính là cách NTD học được thói quen bỏ qua khu vực đó của trang.',
          '**40 NẰM TRONG CẤU HÌNH, KHÔNG PHẢI HẰNG SỐ CỨNG** (`svn.recruitment.recommended-candidates.floor`, mặc định 40) — đổi được mà không phải sửa code. Nhưng **không có màn hình admin** cho nó; đổi vẫn cần một lần triển khai.',
          '**MỘT LUẬT, HAI TRƯỜNG HỢP.** Tin đã đăng mà không khai gì bị đối xử y như tin nháp sơ sài. Không nhánh, không ngoại lệ.',
        ],
      },

      /* ── §6 ─────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '§6 · Khi không có tin dùng được — “Hồ sơ mới cập nhật”' },
      {
        kind: 'p',
        text: 'Khối **vẫn hiện**. Nó không để trống và cũng không hiện trạng thái rỗng — nhưng **tiêu đề đổi**, vì nội dung đã đổi. Vấn đề gốc chưa bao giờ là “hiện người trong khi không có tin”; vấn đề là **hứa một kết quả khớp mà thực ra không có**. Đổi tên khối là vấn đề biến mất.',
      },
      {
        kind: 'table',
        cols: ['Bước', 'Luật'],
        rows: [
          ['1 · Lọc', 'Các bộ lọc cứng ở §8. Ngoài những người đó ra, không ai được hiện.'],
          ['2 · Ưu tiên', 'Người có ngành hoặc ngành nghề mong muốn trùng **ngành của chính công ty** lên trước. Không có tin nào thì ít nhất ta vẫn biết họ làm nghề gì.'],
          ['3 · Sắp xếp', 'CV cập nhật gần nhất trước — CV mới nghĩa là người đang thật sự tìm việc.'],
          ['4 · Dàn đều', '**Mỗi ngành nghề một người**, không thì cả hàng ra ba bạn QA tester.'],
          ['5 · Xoay vòng', 'Hằng ngày, theo luật chung ở §7 — không phải hành vi riêng của chế độ dự phòng.'],
        ],
      },
      {
        kind: 'list',
        items: [
          '**KHÔNG NHÃN “TOP PICK”, KHÔNG PHẦN TRĂM Ở CHẾ ĐỘ NÀY.** Ở đây không có điểm, nên một nhãn thể hiện độ tự tin sẽ là một lời nói dối. Nhãn đó chỉ thuộc về §1–§5.',
          '**ĐỪNG DÙNG SỐ NĂM KINH NGHIỆM LÀM THƯỚC ĐO CHẤT LƯỢNG**, và tuyệt đối không dùng tuổi hay giới tính. Nhiều năm hơn không phải là tốt hơn, chỉ là khác, và nó phụ thuộc hoàn toàn vào vị trí.',
        ],
      },

      /* ── §7 ─────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '§7 · Danh sách đổi mỗi ngày — luật chung cho CẢ HAI chế độ' },
      {
        kind: 'p',
        text: 'NTD mở Home gần như mỗi sáng. Nếu ba gương mặt đó ngồi nguyên cả tuần thì khối trở thành giấy dán tường, và tới đúng ngày nó có người đáng xem thì không ai nhìn nữa. LUẬT, cùng hình dạng với feed của ứng viên: **điểm chọn ra RỔ, phép xáo trộn gieo theo ngày hôm nay chọn AI được hiện từ rổ đó**.',
      },
      {
        kind: 'table',
        cols: ['', 'Chế độ chấm điểm', 'Chế độ Hồ sơ mới cập nhật'],
        rows: [
          ['**Rổ**', 'Mọi người trên sàn 40, cắt còn **top 30**', 'Mọi người qua §8, sắp theo CV mới nhất, cắt còn **top 30**'],
          ['**Hôm nay hiện ai**', 'Một phép xáo trộn trên rổ đó, gieo theo **công ty + ngày hôm nay**', 'Cùng cơ chế, cùng hạt giống'],
          ['**Mở lại lúc trưa**', 'Vẫn đúng những người đó — hạt giống chưa đổi', 'Vẫn đúng những người đó'],
          ['**Ngày mai**', 'Một lượt bốc khác từ cùng cái rổ', 'Một lượt bốc khác'],
        ],
      },
      {
        kind: 'list',
        items: [
          '**GIEO HẠT, KHÔNG BAO GIỜ RANDOM THUẦN.** Hai lý do, đều rất thực tế: NTD nhìn thấy một người sáng nay thì chiều phải tìm lại được, và khi họ hỏi “thứ Ba các anh hiện ai cho chúng tôi?” thì phải trả lời được. Random làm cả hai thành bất khả. Gieo theo công ty + ngày thì câu trả lời tái lập được mãi mãi.',
          '**TRONG TẬP ĐÃ BỐC, VẪN SẮP THEO ĐIỂM.** Phép xáo trộn quyết định **ai** xuất hiện; nó không quyết định **thứ tự** xuất hiện. Đây là chỗ duy nhất khối này khác hàng thẻ của ứng viên, và là cố ý: bên kia là một hàng dài nên vị trí ít quan trọng, bên này chỉ có ba thẻ nên người khớp nhất phải đọc được trước.',
          '**NÓ GHÉP VỚI LUẬT “LỜ ĐI”, VÀ THỨ TỰ QUAN TRỌNG:** loại người đã hiện 3 lần mà không ai bấm **TRƯỚC**, rồi mới xáo phần còn lại. Xáo trước thì hệ thống cứ chia đi chia lại đúng những người NTD đã bỏ qua.',
          '**RỔ NHỎ HƠN MỘT HÀNG THẺ KHÔNG PHẢI LỖI.** Chỉ hai người qua sàn thì hiện hai người, mỗi ngày, cho tới khi dữ liệu đổi. **Không bù thêm người dưới sàn** cho đủ hàng — đó đúng là thất bại mà điểm sàn sinh ra để chặn.',
          '**VÌ SAO 30 MÀ KHÔNG PHẢI 50 NHƯ PHÍA ỨNG VIÊN.** Feed ứng viên giữ 50 vì nhiều màn hình cùng rút từ đó. Ở đây chỉ có một màn hình hiện ba thẻ, nên 30 cho khoảng mười ngày đa dạng trước khi có người lặp lại, mà không phải với tay quá sâu xuống dưới bảng xếp hạng tới mức hàng thẻ thôi còn là gợi ý.',
        ],
      },

      /* ── §8 ─────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '§8 · Ai được phép xuất hiện' },
      {
        kind: 'p',
        text: 'Các bộ lọc này chạy **TRƯỚC** mọi phép chấm và mọi phép sắp xếp, ở **cả hai** chế độ. Trượt bất kỳ dòng nào là không có mặt trong rổ.',
      },
      {
        kind: 'table',
        cols: ['Bộ lọc', 'Vì sao'],
        rows: [
          ['Ứng viên đã **bật** cho NTD tìm thấy mình', 'Ta không có quyền hiện một người chưa đồng ý cho người khác tìm ra. Không thương lượng.'],
          ['CV ở trạng thái **Đạt**', 'Cổng chất lượng CV đã có sẵn. Một CV hệ thống còn không đọc được thì không bao giờ được lên Company Home.'],
          ['CV có **kinh nghiệm và học vấn**', 'Dưới mức đó thì NTD chẳng có gì để đánh giá, điểm cao tới đâu cũng vậy. **Kỹ năng KHÔNG bắt buộc** ở đây — chỉ 26 % vị trí có kỹ năng được biên soạn, đòi kỹ năng là làm rỗng rổ cho ba phần tư danh mục.'],
          ['**Chưa nằm trong talent pool** của công ty', 'Người công ty đã lưu rồi thì không còn là một khám phá. Hiện lại là phí mất một chỗ.'],
        ],
      },
      {
        kind: 'list',
        items: [
          '**THẺ HIỂN THỊ NHỮNG GÌ KHÔNG PHẢI VIỆC CỦA TRANG NÀY.** Trang này quyết định **ai** xuất hiện và theo thứ tự nào; bố cục thẻ là việc của thiết kế. Không có dòng nào ở đây thêm, bớt hay đổi tên một trường trên thẻ.',
        ],
      },

      /* ── §9 ─────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '§9 · Bấm vào thẻ — có trừ một lượt mở CV' },
      {
        kind: 'list',
        items: [
          '**MỞ ĐÚNG TRANG CV CHE THÔNG TIN CÁ NHÂN CỦA SEARCH TALENT**, không phải một trang riêng. Thông tin liên hệ che y như trang `/search`.',
          '**CÓ TRỪ MỘT LƯỢT MỞ CV MIỄN PHÍ** (chốt 16/11), cùng luật với mọi lần mở CV khác. Hết lượt thì thẻ vẫn hiện, mở ra là CV che hết chi tiết — **thẻ không bao giờ bị ẩn vì hết lượt**.',
          '**LƯỢT BẤM ĐƯỢC GHI LẠI** và nuôi luật “3 lần không bấm thì loại” ở §7. NTD không có quyền tìm ứng viên thì lượt bấm không được ghi.',
        ],
      },

      /* ── §10 ────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '§10 · % trên bảng ứng viên của một tin — chỗ duy nhất con số được in ra' },
      {
        kind: 'p',
        text: 'Bảng ứng viên của một tin dùng **cùng phép chấm** này, cũng **chỉ trên dữ liệu tự khai**. Đây là màn hình duy nhất in phần trăm ra cho người đọc; ứng viên thì không bao giờ thấy.',
      },
      {
        kind: 'list',
        items: [
          '**SO ĐƯỢC DƯỚI 4 TRONG 7 TÍN HIỆU THÌ KHÔNG IN %.** Một con số dựng trên hai ba tín hiệu gây hiểu nhầm nặng hơn là để trống. Đây là **ngoại lệ duy nhất** của luật “thiếu dữ liệu là 0”.',
          '**Ô TRỐNG KHÔNG CÓ NGHĨA LÀ 0 %.** In nhầm thành 0 là sai nghiêm trọng: nó biến một hồ sơ chưa chấm được thành một hồ sơ bị loại.',
          '**THỨ TỰ TRÊN BẢNG KHÔNG ĐỔI** vì luật “thiếu dữ liệu là 0”: mọi ứng viên của cùng một tin đều chia cho cùng một số. Chỉ **con số in ra** thấp đi, và chỉ với tin khai ít.',
          '**ĐƠN ĐÃ RÚT KHÔNG CÒN TRÊN BẢNG** (SRM-1551, 16/11).',
        ],
      },
      {
        kind: 'warn',
        text: '**Kỹ năng trong CV không khớp master data được tính là “không có kỹ năng”** — mất điểm tín hiệu kỹ năng, **và vẫn tính là một tín hiệu đã so được**. Tài liệu yêu cầu nói nên tính là “chưa biết” và chia lại. Build giữ cách hiện tại: nếu tính là “chưa biết”, ứng viên vẫn mất đúng số điểm đó (thiếu dữ liệu = 0, không chia lại) nhưng lại dễ tụt xuống dưới mốc 4/7 và **mất luôn cả con số %** — một bảng đầy ô trống khó đọc hơn một % thấp hơn 4 điểm. **Chưa chốt.**',
      },
    ],
  },

  /* ────────────────────────────────────────────────────────────────────────── */
  'onboarding-job-count': {
    logic: [
      '**Đây là một phép đếm, không phải một phép chấm điểm.** Không trọng số, không xếp hạng, không ngưỡng, không thẻ việc làm — chỉ một con số trên câu dẫn của wizard.',
      '**Hai câu hỏi khác nhau.** *Recommended jobs* trả lời “tin nào hợp với **người này**” — nó đọc CV, hồ sơ, trọng số. Con số trong wizard trả lời “có bao nhiêu tin hợp với **bộ câu trả lời này**”. Lúc đó ứng viên chưa có CV, chưa lưu hồ sơ, nên câu hỏi thứ nhất chưa trả lời được.',
      '**Vì không đọc hồ sơ ai cả nên API là public** — chạy được cho khách chưa đăng nhập, và không ghi log hiển thị nào.',
      '**Luật cốt lõi: tin bỏ trống một trường thì không bao giờ bị loại vì trường đó.** Chỉ loại khi tin **ghi rõ** một điều trái với câu trả lời.',
      '**Chỉ hai bước có số: bước 3 và bước 4.** Bước 3 đếm trên lựa chọn của bước 1 + 2; bước 4 đếm trên bước 1 + 2 + 3. Học vấn và mức lương **không làm đổi con số nào**.',
    ],
    how: [
      'Chạy wizard onboarding trên site ứng viên (`/welcome`) và đọc câu dẫn ở **bước 3** rồi **bước 4**.',
      'Muốn kiểm con số: đếm trực tiếp trên dữ liệu theo bảng điều kiện ở §3 — **không** đối chiếu với trang tìm việc (§6).',
      'Muốn thử nhanh: gọi thẳng `GET /onboarding/job-count?roleIds=…&regionIds=…&years=…` — không cần token.',
    ],
    watch: [
      '**Số ở bước 4 bằng số ở bước 3 thì không in lại.** In lại cùng một con số làm người dùng tưởng hệ thống đứng im. Các bước khác không có số.',
      '**Bằng 0 thì không in số 0** — chỉ in câu “toàn quốc có X” nếu có. API lỗi thì in câu không có số.',
      '**Quá 500 tin thì in “500+”**, không in con số thật.',
      '**Thừa kinh nghiệm không bao giờ bị loại.** Giới hạn trên trong tin tuyển dụng VN là đỉnh dải quảng cáo, không phải trần — người 10 năm vẫn đếm được tin ghi cấp “Nhân viên”.',
      '**Khác trang tìm việc là đúng thiết kế** (§6), không phải lỗi. Test case yêu cầu hai con số phải khớp đã được bỏ ngày 12/11.',
    ],
    blocks: [
      { kind: 'p', text: STAMP },

      /* ── §1 ─────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '§1 · Vì sao đếm chứ không chấm điểm' },
      {
        kind: 'p',
        text: 'Bản dựng đầu tiên gọi chính engine chấm điểm của *Recommended jobs* rồi đếm số tin đạt **≥ 50/100 điểm**. Cách đó sai bản chất câu hỏi, chứ không phải sai ngưỡng.',
      },
      {
        kind: 'table',
        cols: ['', 'Recommended jobs', 'Con số trong wizard'],
        rows: [
          ['Trả lời câu hỏi', 'Tin nào hợp với **người này**?', 'Có bao nhiêu tin hợp với **bộ câu trả lời này**?'],
          ['Đọc gì', 'CV · hồ sơ · hành vi · trọng số', 'Chỉ các trường trên **tin tuyển dụng**'],
          ['Cần đăng nhập', 'Có', '**Không** — endpoint public'],
          ['Người dùng lúc đó', 'Đã có hồ sơ và CV', 'Vừa mở wizard, **chưa có gì cả**'],
        ],
      },
      {
        kind: 'list',
        heading: 'Ba hệ quả của việc tách ra',
        items: [
          '**Không cần đăng nhập** — bộ đếm chạy trên trường của tin, không đọc candidate id nào.',
          '**Không ghi log hiển thị.** Đây không phải một lượt hiện tin, nên không có dòng impression nào được ghi.',
          '**Không phụ thuộc feature flag của Recommended jobs.** Hai thuật toán tách hẳn; bật tắt bên kia không làm mất con số bên này.',
        ],
      },

      /* ── §2 ─────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '§2 · Hai con số đếm gì' },
      {
        kind: 'table',
        note: 'Mỗi banner tính trên những câu trả lời **đã xong trước bước đó** — nên con số đứng yên trong lúc ứng viên đang gõ ở bước hiện tại.',
        cols: ['Con số', 'Hiện ở', 'Đếm tin khớp với'],
        rows: [
          ['**N₃**', 'Bước 3 — số năm kinh nghiệm', 'Vị trí · ngành · loại hợp đồng · nơi làm việc — tức **bước 1 + 2**'],
          ['**N₄**', 'Bước 4 — trình độ học vấn', 'Như trên, **cộng số năm kinh nghiệm** — bước 1 + 2 + **3**'],
        ],
      },
      {
        kind: 'list',
        items: [
          '**Bước 4 ghi công cho kinh nghiệm, không phải học vấn** — câu chữ của nó nói vậy, và học vấn đang được trả lời *tại* bước 4 nên chưa thể tính vào.',
          '**Học vấn và mức lương không làm đổi con số nào.** Chúng được trả lời ở bước 4 và 5, sau đó không còn banner nào nữa. Đây là hệ quả của việc chỉ có hai banner, không phải thiếu sót.',
          '**Không có luật “đã ứng tuyển”** như ở Recommended jobs — ứng viên vừa đăng ký vài phút trước, chưa nộp đơn vào đâu cả.',
          'Tin được đếm phải: **đang mở** · đã publish · chưa hết hạn · còn bật hiển thị · công ty active và công khai.',
        ],
      },

      /* ── §3 ─────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '§3 · Luật cốt lõi — bỏ trống thì không loại' },
      {
        kind: 'warn',
        text: '**Tin nào bỏ trống một trường thì KHÔNG BAO GIỜ bị loại vì trường đó. Chỉ loại khi tin GHI RÕ một điều trái với câu trả lời.**',
      },
      {
        kind: 'p',
        text: 'Phần lớn tin tuyển dụng ở VN bỏ trống ngành, loại hợp đồng và dải kinh nghiệm. Nếu so khớp kiểu bằng-nhau, tất cả những tin đó biến mất ngay khi ứng viên trả lời bước 3, và **N₄ = 0 với gần như mọi người** — một con số vừa sai vừa làm nản lòng đúng lúc người dùng cần được khuyến khích đi tiếp.',
      },
      {
        kind: 'table',
        note: '**AND giữa các tiêu chí, OR bên trong một tiêu chí** — chọn 3 thành phố nghĩa là tin ở bất kỳ thành phố nào trong ba.',
        cols: ['Ứng viên chọn', 'Tin được tính khi', 'Chỉ bị loại khi'],
        rows: [
          ['Luôn luôn', 'Tin **đang mở** · đã đăng · còn bật hiển thị · công ty công khai', '—'],
          ['**Vị trí** (≤3)', 'Tin thuộc **ngành nghề** của vị trí đó, **hoặc** tin không gắn ngành nghề nào', 'Ngành nghề của tin không nằm trong ngành nghề của các vị trí đã chọn'],
          ['**Ngành** (≤3)', 'Trùng ngành, **hoặc** tin không ghi ngành — tin công ty tự đăng không có ô ngành nên luôn qua', 'Tin **có ghi** ngành và không nằm trong danh sách đã chọn'],
          ['**Loại hợp đồng**', 'Nằm trong tập đã chọn, **hoặc** tin không khai', 'Tin **có ghi** và không trùng'],
          ['**Nơi làm việc** (≤3)', 'Tin **remote** (qua từ mọi nơi), **hoặc** tỉnh của tin / của công ty nằm trong tập, **hoặc** tin không ghi địa điểm', 'Tin **có ghi** tỉnh và không tỉnh nào được chọn'],
          ['**Số năm kinh nghiệm** (chỉ N₄)', 'Xem §4 — đọc hai nguồn', 'Ứng viên thấp hơn mức tin yêu cầu'],
          ['Học vấn', 'Luôn được tính', '**Không** là điều kiện đếm'],
        ],
      },
      {
        kind: 'list',
        heading: 'Hai chi tiết quyết định con số',
        items: [
          '**Vị trí so ở mức ngành nghề, KHÔNG so đúng vị trí.** So đúng vị trí thì một vị trí hẹp ra con số kiểu “2 tin”, và wizard biến thành một lời từ chối.',
          '**Thừa kinh nghiệm hoặc thừa cấp bậc không bao giờ bị loại.** Giới hạn trên trong tin VN là đỉnh dải quảng cáo, không phải trần tuyển dụng.',
        ],
      },

      /* ── §4 ─────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '§4 · Kinh nghiệm đọc hai nguồn, không phải một' },
      {
        kind: 'p',
        text: 'Dải năm kinh nghiệm **không bắt buộc** trên form đăng tin và bị bỏ trống ở hầu hết tin tự đăng. Nếu chỉ đọc cột đó thì **N₄ = N₃ gần như mọi lần** — bước 4 in lại con số của bước 3 trong khi câu chữ hứa “khớp chính xác hơn”. Nên bộ đếm đọc hai nguồn, theo thứ tự.',
      },
      {
        kind: 'table',
        cols: ['Thứ tự', 'Nguồn trên tin', 'Loại tin khi'],
        rows: [
          ['**1**', 'Dải năm kinh nghiệm', 'Ứng viên **thấp hơn** mức tối thiểu tin ghi'],
          ['**2 — dự phòng**', 'Cấp bậc của tin', 'Bậc ứng viên thấp hơn **từ 2 bậc trở lên** so với cấp thấp nhất tin ghi. **Lệch 1 bậc thì giữ**'],
          ['—', 'Tin không ghi cả hai', '**Không bao giờ loại.** Form quy ước **để trống cấp bậc = “Mọi cấp bậc”**'],
        ],
      },
      {
        kind: 'list',
        items: [
          '**Một tin chỉ thoát khỏi tiêu chí kinh nghiệm khi NTD không nói gì ở cả hai trường** — tập đó nhỏ hơn nhiều so với “bỏ trống dải năm”. Đó chính là thứ làm N₄ khác được N₃.',
          '**Tin ghi nhiều cấp bậc thì so với cấp thấp nhất** — tin mở cho cả Junior lẫn Senior vẫn đếm cho người ở bậc Junior.',
          '**Dung sai 1 bậc trùng đúng với dung sai của phần chấm điểm**, để hai chỗ không mâu thuẫn về việc ai “chưa đủ”. Bảng quy đổi năm → bậc nằm ở **một chỗ duy nhất**, dùng chung với Recommended jobs và Recommended candidates (xem trang *Logic chung*).',
        ],
      },
      {
        kind: 'example',
        heading: 'Ba trường hợp kinh nghiệm',
        scenario: 'Tin chỉ ghi **cấp bậc**, không ghi dải năm — nên bộ đếm rơi xuống nguồn dự phòng.',
        cols: ['Ứng viên', 'Tin ghi cấp', 'Chênh', 'Kết quả'],
        rows: [
          ['3 năm → bậc **mid (4)**', 'Senior (5)', 'Lệch 1', '**Vẫn đếm** — với tới được'],
          ['1 năm → bậc **junior (3)**', 'Senior (5)', 'Lệch 2', '**Bị loại**'],
          ['10 năm → bậc **lead (6)**', 'Intern (1)', 'Thừa 5 bậc', '**Vẫn đếm** — thừa không bao giờ loại'],
        ],
      },

      /* ── §5 ─────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '§5 · Con số in ra như thế nào' },
      {
        kind: 'p',
        text: '**N₄ không bao giờ lớn hơn N₃.** Lọc kiểu AND thì thêm một tiêu chí chỉ có thể **bớt** tin đi. “Khớp chính xác hơn” nghĩa là *chính xác hơn*, không phải *nhiều hơn* — bản Figma vẽ con số tăng từ 2 lên 20 chỉ là **số minh hoạ**, và không có luật nào được cài để con số tăng lên.',
      },
      {
        kind: 'table',
        cols: ['Tình huống', 'Banner hiện gì'],
        rows: [
          ['N₄ < N₃', 'Con số, như thiết kế'],
          ['**N₄ = N₃**', '**Câu không có số.** Bước 4 thôi không nhận công nữa'],
          ['Dưới **5** tin tại tỉnh đã chọn', 'Bỏ bộ lọc **nơi làm việc**, đếm toàn quốc, và **nói rõ trong câu**: “Chỉ có 3 tin ở Đà Nẵng — **128** tin trên cả nước”'],
          ['Nới rồi vẫn không có gì', 'Câu không có số'],
          ['Hơn **500** tin', 'In **“500+”**, không in con số thật'],
          ['Chưa chọn gì · API lỗi', 'Câu không có số — không spinner, không `0`'],
        ],
      },
      {
        kind: 'list',
        heading: 'Ba luật dễ bị bỏ qua',
        items: [
          '**N₄ = N₃ → bước 4 hiện câu không có số.** Trông như một edge case nhưng chính nó làm cho trường hợp dữ liệu xấu trở nên **vô hình thay vì nói dối**.',
          '**Chỉ được nới lỏng khi câu chữ nói ra điều đó**, và chỉ nới **một lần**, chỉ nới **nơi làm việc**. Âm thầm bỏ bộ lọc rồi báo một con số to hơn là nói dối về chính thứ vừa đo.',
          '**Không bao giờ in `0`.** Ở màn hình thứ hai mà ứng viên nhìn thấy, số 0 đọc như một lời phán về con người chứ không phải về dữ liệu.',
        ],
      },
      {
        kind: 'example',
        heading: 'Nam chọn QA Engineer tại Đà Nẵng',
        scenario:
          'Bước 1 Nam chọn vị trí *QA Engineer*; bước 2 chọn *Đà Nẵng*; bước 3 chọn loại hợp đồng *Fulltime*; bước 4 khai **4 năm** kinh nghiệm.',
        cols: ['Bước', 'Đếm trên', 'Kết quả'],
        rows: [
          ['Bước 3', 'Ngành nghề IT (từ vị trí QA Engineer) + Đà Nẵng', '**3 tin** — dưới 5 nên câu thêm con số toàn quốc: “toàn quốc có 128 việc”'],
          ['Bước 4', 'Thêm điều kiện Fulltime và 4 năm kinh nghiệm', '**3 tin** — bằng bước 3 nên **không in số**'],
        ],
        note:
          'Bước 4 ra đúng bằng bước 3 vì cả ba tin đều hoặc khai Fulltime, hoặc **không khai loại hợp đồng** (vẫn được giữ), và đều có dải năm bắt đầu từ ≤ 4. Đây là trường hợp bình thường, không phải lỗi đếm.',
      },

      /* ── §6 ─────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '§6 · Vì sao không khớp trang tìm việc' },
      {
        kind: 'table',
        note: 'Bốn khác biệt có chủ đích. Onboarding rộng hơn vì mục đích của nó là khuyến khích đi tiếp; trang tìm việc hẹp hơn vì người dùng ở đó đang thật sự tìm việc.',
        cols: ['Điểm khác', 'Banner onboarding', 'Trang tìm việc'],
        rows: [
          ['Tin để trống loại hợp đồng', '**Giữ lại**', 'Loại bỏ'],
          ['Lọc ngành theo', 'Ngành của **tin**', 'Ngành của **công ty**'],
          ['Tin remote', '**Luôn được tính**, ở mọi tỉnh', 'Không có luật này'],
          ['Kinh nghiệm', 'Quy số năm ra **cấp bậc**', 'Không quy đổi'],
        ],
      },
      {
        kind: 'warn',
        text: 'Ticket gốc SRM-1347 từng yêu cầu con số này **kiểm chứng được bằng trang tìm việc** (test case #13). **Quyết định của BA ngày 12/11 đã bỏ yêu cầu đó** — QA kiểm bằng dữ liệu trực tiếp. Bốn khác biệt ở trên là lý do: hai bộ lọc không bao giờ ra cùng một con số.',
      },

      /* ── §7 ─────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '§7 · Giao diện gọi bộ đếm như thế nào' },
      {
        kind: 'list',
        items: [
          '**Gửi cả 3 vị trí** ứng viên đã chọn, không chỉ vị trí đầu tiên. Tham số đi dạng danh sách: `roleIds` · `industryIds` · `contractTypeIds` · `regionIds` · `years`, tất cả optional.',
          '**Debounce ~300 ms** và **bỏ qua response về trễ** (sai thứ tự) — bộ đếm bắn theo từng lượt chọn, nên chọn/bỏ chọn liên tục chỉ sinh một hai request thực sự.',
          '**Gọi lại khi bất kỳ câu trả lời nào ở bước 1–3 đổi, và không cache** (`cache: "no-store"`).',
          '**Lỗi thì rơi êm về câu không có số** — không vỡ wizard, không spinner ở chỗ con số.',
        ],
      },
    ],
  },
}

/* ────────────────────────────────────────────────────────────────────────────
 * Module page — the rules that would otherwise be repeated on all four pages.
 * ──────────────────────────────────────────────────────────────────────────── */

export const MATCHING_MODULE_DOCS: Record<string, ModuleDoc> = {
  Matching: {
    title: 'Matching & gợi ý — năm bộ máy, không phải một',
    lead:
      'Không có **một** thuật toán gợi ý. Có **năm bộ máy riêng biệt**, mỗi bộ trả lời một câu hỏi khác nhau, và **không bộ nào nuôi hai chỗ cùng một câu trả lời**. Nhầm hai bộ với nhau là nguyên nhân của gần như mọi câu hỏi “sao chỗ này hiện thế này mà chỗ kia hiện thế kia”. Trang này giữ những luật dùng chung; bốn trang con mô tả từng bộ máy.',
    headline: [
      '**Hai khối nằm cạnh nhau trên trang chi tiết tin là hai bộ máy khác nhau.** *Việc làm tương tự* so **tin với tin** (không đọc hồ sơ, cache 1 giờ, bảng 45/15/15/10/8/4/3). *Gợi ý việc làm cho bạn* so **hồ sơ với tin** (bảng 42/20/14/12/5/4/3). Hai khối không bao giờ trùng tin.',
      '**“Đã ứng tuyển” nghĩa là có BẤT KỲ dòng đơn nào** cho cặp (ứng viên, tin) — mọi trạng thái, kể cả đã bị từ chối. Tin đó biến mất khỏi gợi ý và khỏi cả ba loại email. Một ngoại lệ từ 16/11: **đơn đã rút** không còn khoá carousel *Việc làm tương tự*.',
      '**Thiếu dữ liệu là 0 điểm, không chia lại thang** — ở cả ba bộ máy có chấm điểm. Ngoại lệ duy nhất là **cách in %** trên bảng ứng viên của nhà tuyển dụng.',
      '**Trọng số nằm trong code và admin không chỉnh được.** Tab chỉnh trọng số đã bỏ khỏi console ngày 05/11; màn hình System → General settings chỉ **đọc** lại trọng số. Thứ duy nhất chỉnh được là **tỷ giá USD/VND**.',
    ],
    blocks: [
      { kind: 'p', text: STAMP },

      /* ── §0 ─────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '§0 · Bản đồ năm bộ máy' },
      {
        kind: 'table',
        cols: ['Bộ máy', 'So cái gì với cái gì', 'Hiện ở đâu', 'Có đọc hồ sơ không'],
        rows: [
          ['**A — Recommended jobs**', 'Người ↔ tin', 'Onboarding · trang cá nhân · chi tiết tin · popup sau khi nộp đơn · email gợi ý hằng tuần', 'Có — khai **và** hành vi'],
          ['**B — Similar jobs**', 'Tin ↔ tin', 'Carousel *Việc làm tương tự* dưới trang chi tiết tin', 'Không'],
          ['**C — Recommended candidates**', 'Tin ↔ người', 'Company Home của NTD · % trên bảng ứng viên của một tin', 'Có — **chỉ dữ liệu tự khai**'],
          ['**D — Onboarding job count**', 'Bộ lọc, không chấm điểm', 'Con số ở bước 3 và bước 4 của wizard', 'Không — chạy cho cả khách'],
          ['**E — Việc làm giống tin vừa nộp**', 'Tin ↔ tin, chạy trên Elasticsearch', 'Khối 4 việc trong email *đã ứng tuyển thành công* (JS 4 / JS 5)', 'Không'],
        ],
      },
      {
        kind: 'warn',
        text: '**Bộ máy E không phải bộ máy A.** Khối gợi ý trong email sau khi nộp đơn có công thức riêng, chạy trên Elasticsearch, **không đọc hồ sơ ứng viên** và không ghi log impression. Nó chỉ tìm tin **giống tin vừa nộp**.',
      },

      /* ── §1 ─────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '§1 · Mười luật dùng chung' },
      {
        kind: 'list',
        items: [
          '**“Đã ứng tuyển” = có bất kỳ dòng đơn nào** cho cặp (ứng viên, tin), mọi trạng thái. Tin biến mất khỏi bộ máy A ở **mọi** màn hình và khỏi email JS 3 / JS 4 / JS 5.',
          '**Ngoại lệ từ 16/11 (SRM-1551):** rút đơn là dứt khoát và **giải phóng tin** — tin đã rút hiện lại trên carousel *Việc làm tương tự* và nộp lại được (thành một đơn mới, snapshot mới). Đơn bị **thu hồi** hoặc bị **từ chối** thì vẫn khoá.',
          '**Tin ứng viên bấm “bỏ qua”** bị xử lý y như tin đã nộp đơn: loại vĩnh viễn khỏi mọi danh sách gợi ý.',
          '**Thiếu dữ liệu là 0 điểm, không chia lại thang** — ở A, B và C. Ngoại lệ duy nhất là cách **in** % trên bảng ứng viên của NTD (dưới 4/7 tín hiệu thì không in).',
          '**Trọng số nằm trong code, có đánh số phiên bản** — `v4` cho người ↔ tin, `v3` cho tin ↔ tin. Mỗi điểm số và mỗi lần hiển thị đều ghi log kèm phiên bản, để sau này trả lời được “vì sao hôm đó tin này hiện ra”.',
          '**Tỷ giá USD/VND do admin nhập** là thứ duy nhất liên quan matching mà chỉnh được từ giao diện. Dùng **hai chiều**; thiếu tỷ giá thì tín hiệu lương bằng 0 ở cả A, B và C.',
          '**Ứng viên không bao giờ thấy %.** NTD thấy % trên bảng ứng viên của một tin, và **không** thấy % ở chế độ *Hồ sơ mới cập nhật*.',
          '**Một bảng quy đổi năm kinh nghiệm ra cấp bậc** dùng chung cho A, C và D (§2).',
          '**Một công ty một hàng 6 thẻ** ở mọi màn hình có hàng thẻ — trừ popup Batch apply, vì đó là một danh sách dài chứ không phải hàng thẻ.',
          '**Một công tắc email duy nhất** — *Nhận email thông báo từ hệ thống* trong trang Thông tin tài khoản, **mặc định bật** — chi phối cả email gợi ý hằng tuần lẫn khối gợi ý trong email sau khi nộp đơn.',
        ],
      },

      /* ── §2 ─────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '§2 · Bảng quy đổi năm kinh nghiệm ra cấp bậc' },
      {
        kind: 'table',
        note: 'Dùng chung cho Recommended jobs, Recommended candidates và Onboarding job count. **Lệch 1 bậc** là “với tới được”; **lệch từ 2 bậc** là không hợp.',
        cols: ['Số năm kinh nghiệm', 'Cấp bậc'],
        rows: [
          ['Dưới 1 năm (kể cả fresher, 0 năm)', '2'],
          ['1 – 2 năm', '3'],
          ['3 – 4 năm', '4'],
          ['5 – 7 năm', '5'],
          ['8 – 11 năm', '6'],
          ['12 – 14 năm', '7'],
          ['Từ 15 năm', '8'],
          ['Không khai', 'Không có bậc → không so (A, C) · không lọc (D)'],
        ],
      },

      /* ── §3 ─────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '§3 · Bộ máy E — khối gợi ý trong email sau khi nộp đơn' },
      {
        kind: 'p',
        text: 'Khối *việc làm gợi ý* nằm dưới dòng “Bạn đã ứng tuyển thành công” trong email **JS 4** và **JS 5** (SRM-1433, 10/11). Vì không có trang riêng nên nó được mô tả ở đây.',
      },
      {
        kind: 'table',
        cols: ['Bước', 'Luật'],
        rows: [
          ['**Khi nào có khối**', 'Ứng viên chưa tắt công tắc *Nhận email thông báo từ hệ thống*. Môi trường không chạy Elasticsearch thì **không có khối** — không có bản thay thế'],
          ['**Tin gốc**', 'JS 4: tin vừa nộp. JS 5 (nộp hàng loạt): tin **chọn cuối cùng** trong lượt đó'],
          ['**Tin nào được xét**', 'Tin đang sống, và phải **chung ≥ 1 kỹ năng VÀ ≥ 1 tỉnh** với tin gốc. Lấy **50** tin khớp nhất'],
          ['**Điểm xếp hạng**', '**0,5 × Liên quan + 0,25 × Công bằng + 0,15 × Hạng gói + 0,1 × Độ mới**'],
          ['Công bằng', 'Công ty đang mở càng nhiều tin thì mỗi tin càng nhẹ điểm — để một công ty lớn không chiếm hết bốn chỗ'],
          ['Hạng gói', 'Distinction / Top job / Hero cao nhất → Basic plus → Basic → tin miễn phí'],
          ['Độ mới', 'Gần như phẳng, chỉ dùng để phá hoà'],
          ['**Lọc cuối**', 'Bỏ mọi tin ứng viên **đã từng nộp** (mọi trạng thái, kể cả đã rút) và tin đã đóng, rồi giữ **4 tin đầu**'],
          ['**Không đủ tin**', 'Có 1–3 tin thì in đúng số đó. **Không có tin nào thì ẩn cả khối** — phần xác nhận ứng tuyển vẫn gửi bình thường. **Không có cơ chế bù tin**'],
        ],
      },

      /* ── §4 ─────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '§4 · Những gì KHÔNG còn nữa' },
      {
        kind: 'list',
        heading: 'Có trong bản v3 cũ, đã bỏ ở v4 (05/11)',
        items: [
          '**Ngưỡng điểm 50 / 60** để một tin được phép hiện — không còn ngưỡng nào ở phía ứng viên.',
          '**Bốn cấp tiêu đề** đổi theo chất lượng kết quả — mỗi màn hình nay chỉ có **một tiêu đề cố định**.',
          '**Xoay vòng trong dải 5 điểm** và **giáng hạng sau 3 lần hiện** ở phía ứng viên (luật “3 lần không bấm” chỉ còn ở phía nhà tuyển dụng).',
          '**Chia lại thang khi thiếu dữ liệu** — nay thiếu là 0, dứt khoát.',
          '**Tab chỉnh trọng số trong admin** — đã gỡ; endpoint ghi trọng số đã xoá. Link cũ `?tab=recommended-jobs` rơi về tab đầu tiên.',
        ],
      },

      /* ── §5 ─────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '§5 · Thang ngành nghề ba tầng' },
      {
        kind: 'p',
        text: 'Cả ba bộ máy có chấm điểm đều viết sẵn thang **Vị trí › Nhóm vị trí › Ngành nghề**. Tầng giữa — *nhóm vị trí* — **chưa có dữ liệu** trong hệ thống (SRM-1315), nên bậc 30 điểm (bộ máy A) và 32 điểm (bộ máy B) **chưa bao giờ đạt được**. Thực tế thang chạy hai bậc: cùng vị trí, hoặc cùng ngành nghề.',
      },
      {
        kind: 'open',
        text: '**Còn chờ quyết định:** kỹ năng ứng viên gõ tay mà không khớp master data hiện được tính là “không có kỹ năng”. Hướng xử lý gốc không nằm ở cách chấm mà ở chỗ **nhận dạng kỹ năng** — khớp theo tên gọi khác trước khi bỏ qua, và một màn hình admin liệt kê các kỹ năng ứng viên gõ nhiều nhất nhưng chưa có trong master data.',
      },
    ],
  },
}
