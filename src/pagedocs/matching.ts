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
      '**Chiều ngược lại của Recommended jobs:** từ một tin tuyển dụng, tìm ứng viên phù hợp. Dùng **cùng bảng điểm 100 điểm (v4)**, đọc ngược từ phía tin.',
      '**Chỉ đọc dữ liệu ứng viên tự khai** — hồ sơ và CV. Hành vi xem tin, lưu tin, nộp đơn của ứng viên **không bao giờ** được dùng ở phía nhà tuyển dụng, vì đó là dữ liệu cá nhân.',
      '**Có điểm sàn 40**, khác phía ứng viên (không có sàn). Không ai đạt 40 thì khối **đổi hẳn chế độ** sang *Hồ sơ mới cập nhật* thay vì hiện danh sách kém.',
      '**Mỗi ngày một “ván bài”:** từ 30 người đạt sàn, hệ thống bốc **3 người** theo hạt giống công ty + ngày. Cùng 3 người suốt cả ngày, hôm sau mới khác.',
      '**Bấm vào thẻ có trừ một lượt mở CV miễn phí** (chốt 16/11) — y như mọi lần mở CV khác trên Search talent.',
    ],
    how: [
      'Vào **Company Home** của site nhà tuyển dụng (`/hiring`), khối *Recommended talent*. Cần quyền tìm kiếm ứng viên.',
      'Dropdown ở đầu khối chọn **tin tuyển dụng** để so. Không chọn thì hệ thống tự lấy tin **đang mở** chưa quá hạn, rồi tin **hẹn đăng**, rồi tin **nháp** — trong mỗi loại lấy tin sửa gần nhất.',
      'Tiêu đề khối in **tên tin** đang so, để NTD biết 3 hồ sơ này được chọn cho tin nào.',
    ],
    watch: [
      '**Bấm thẻ là tốn một lượt mở CV.** Hết lượt thì NTD vẫn thấy thẻ, nhưng mở ra là CV che hết chi tiết. Thẻ **không bao giờ bị ẩn** vì hết lượt.',
      '**Một hồ sơ hiện 3 lần mà không ai bấm thì bị loại** khỏi danh sách gợi ý của công ty đó.',
      '**Người đã nằm trong talent pool của công ty không xuất hiện** — họ đã được lưu rồi, gợi ý lại là thừa.',
      '**Chế độ *Hồ sơ mới cập nhật* không in %.** Đó là danh sách CV mới, không phải kết quả chấm điểm — in % ở đó sẽ là một con số vô nghĩa.',
      '**Trên bảng ứng viên của một tin, % không in ra khi so được dưới 4 trong 7 tín hiệu.** Ô trống ở đó nghĩa là “chưa đủ dữ liệu để chấm”, **không phải “khớp 0 %”**.',
    ],
    blocks: [
      { kind: 'p', text: STAMP },

      { kind: 'h', text: '§1 · Từ một tin tới ba thẻ' },
      {
        kind: 'table',
        cols: ['Bước', 'Luật'],
        rows: [
          ['**Chọn tin**', 'NTD chọn từ dropdown. Không chọn thì mặc định: tin **đang mở** chưa quá hạn → tin **hẹn đăng** → tin **nháp**; trong mỗi loại lấy tin sửa gần nhất'],
          ['**Ai được đem ra chấm**', 'Ứng viên **mong muốn đúng vị trí hoặc ngành nghề của tin**, **hoặc** CV **có ít nhất một kỹ năng** của tin. Bắt buộc thêm: cho phép NTD tìm thấy mình · CV **Đạt** (có kinh nghiệm và học vấn) · **chưa nằm trong talent pool** của công ty'],
          ['**Cắt tập**', 'Giữ tối đa **500 người** trước khi chấm. Người đã bị “lờ đi” 3 lần rời tập **trước** khi cắt'],
          ['**Chấm điểm**', 'Cùng bảng 7 tín hiệu của *Recommended jobs*, nhưng **chỉ dữ liệu tự khai**. Không khai vị trí thì suy từ **tiêu đề CV** (ăn 80 % bậc)'],
          ['**Rổ của ngày**', '**Top 30** người có điểm **≥ 40**'],
          ['**Hiển thị**', 'Bốc **3 người** theo hạt giống (công ty + ngày), **điểm cao nhất trước**. Thẻ đầu tiên gắn nhãn **Top pick**'],
          ['**Không ai đạt 40**', 'Chuyển chế độ **Hồ sơ mới cập nhật**: CV mới nhất, ưu tiên **ngành của công ty**, **mỗi ngành nghề một người**, **không in %**'],
        ],
      },
      {
        kind: 'warn',
        text: '**Nhánh “CV có một kỹ năng của tin” mở rộng tập được chấm** so với tài liệu yêu cầu (chỉ nói theo vị trí / ngành nghề). Nó **không đổi cách chấm điểm**, chỉ đưa thêm người vào vòng chấm. Mặt trái: ứng viên gõ tay kỹ năng không khớp master data thì nhánh này **không bao giờ chạy** — họ phải khai vị trí hoặc ngành nghề mới vào được vòng chấm.',
      },

      { kind: 'h', text: '§2 · Bấm vào thẻ' },
      {
        kind: 'list',
        items: [
          'Mở **đúng trang CV che thông tin cá nhân của Search talent** — không phải một trang riêng. Thông tin liên hệ che y như trang `/search`.',
          '**Có trừ một lượt mở CV miễn phí** (chốt 16/11), cùng luật với mọi lần mở CV khác.',
          'Lượt bấm được ghi lại và dùng cho luật **“3 lần không bấm thì loại”**. NTD không có quyền tìm ứng viên thì lượt bấm không được ghi.',
        ],
      },

      { kind: 'h', text: '§3 · % phù hợp trên bảng ứng viên của một tin' },
      {
        kind: 'list',
        items: [
          'Dùng **cùng phép chấm** này, cũng **chỉ trên dữ liệu tự khai**.',
          '**So được dưới 4 trong 7 tín hiệu thì không in %.** Một con số dựng trên hai ba tín hiệu sẽ gây hiểu nhầm nặng hơn là để trống.',
          '**Ô trống không có nghĩa là 0 %.** Hiển thị nhầm thành 0 là sai nghiêm trọng: nó biến một hồ sơ chưa chấm được thành một hồ sơ bị loại.',
          '**Đơn đã rút không còn trên bảng** (SRM-1551, 16/11).',
        ],
      },
      {
        kind: 'warn',
        text: '**Kỹ năng trong CV không khớp master data được tính là “không có kỹ năng”** — mất điểm tín hiệu kỹ năng, **và vẫn tính là một tín hiệu đã so được**. Đây là lựa chọn có chủ đích: nếu tính là “chưa biết”, ứng viên vẫn mất đúng số điểm đó (thiếu dữ liệu = 0, không chia lại) nhưng lại dễ tụt xuống dưới mốc 4/7 và **mất luôn cả con số %** — một bảng đầy ô trống khó đọc hơn một % thấp hơn 4 điểm.',
      },
    ],
  },

  /* ────────────────────────────────────────────────────────────────────────── */
  'onboarding-job-count': {
    logic: [
      '**Đây là một phép đếm, không phải một phép chấm điểm.** Không có trọng số, không có xếp hạng, không có thẻ việc làm — chỉ một con số trên câu dẫn của wizard.',
      '**Chạy cho khách chưa có tài khoản.** Người dùng đang làm wizard thì chưa đăng nhập, nên API này là public và không đọc hồ sơ ai cả.',
      '**Mọi điều kiện đều GIỮ LẠI tin không khai trường đó.** Một tin không ghi loại hợp đồng vẫn được tính — không có thông tin không có nghĩa là không phù hợp.',
      '**Chỉ hai bước có số: bước 3 và bước 4.** Bước 3 đếm trên lựa chọn của bước 1 + 2; bước 4 đếm trên bước 1 + 2 + 3.',
      '**Con số này cố ý không khớp trang tìm việc.** Mục đích của nó là cho người dùng thấy có việc để đi tiếp, không phải trả về kết quả tìm kiếm.',
    ],
    how: [
      'Chạy wizard onboarding trên site ứng viên (`/welcome`) và đọc câu dẫn ở **bước 3** rồi **bước 4**.',
      'Muốn kiểm con số: đếm trực tiếp trên dữ liệu theo bảng điều kiện ở §1 — **không** đối chiếu với trang tìm việc.',
    ],
    watch: [
      '**Số ở bước 4 bằng số ở bước 3 thì không in lại.** In lại cùng một con số làm người dùng tưởng hệ thống đứng im. Các bước khác không có số.',
      '**Bằng 0 thì không in số 0** — chỉ in câu “toàn quốc có X” nếu có. API lỗi thì in câu không có số.',
      '**Quá 500 tin thì in “500+”**, không in con số thật.',
      '**Khác trang tìm việc là đúng thiết kế** (§3), không phải lỗi. Test case yêu cầu hai con số phải khớp đã được bỏ ngày 12/11.',
    ],
    blocks: [
      { kind: 'p', text: STAMP },

      { kind: 'h', text: '§1 · Điều kiện đếm' },
      {
        kind: 'table',
        note: 'Đọc cột phải cho kỹ: mỗi dòng đều có nhánh **“hoặc tin không khai trường đó”**. Đó là điều làm con số này rộng hơn trang tìm việc.',
        cols: ['Ứng viên chọn', 'Tin được tính khi'],
        rows: [
          ['Luôn luôn', 'Tin **đang mở** · đã đăng · còn bật hiển thị · công ty công khai'],
          ['**Vị trí**', 'Tin thuộc **ngành nghề** của vị trí đó, **hoặc** tin không gắn ngành nghề nào. Đếm ở mức ngành nghề nên một vị trí hẹp vẫn ra con số có ý nghĩa'],
          ['**Ngành**', 'Trùng ngành, **hoặc** tin không có ngành — tin công ty tự đăng không có ô ngành nên luôn qua'],
          ['**Loại hợp đồng**', 'Nằm trong tập đã chọn, **hoặc** tin không khai'],
          ['**Địa điểm**', 'Tin **remote**, **hoặc** tỉnh của tin / của công ty nằm trong tập, **hoặc** tin không có địa điểm'],
          ['**Số năm kinh nghiệm**', 'Tin khai **dải năm** → chỉ cần mức tối thiểu ≤ số năm của ứng viên. Tin chỉ khai **cấp bậc** → giữ tin có bậc không cao hơn ứng viên quá **1 bậc**. Tin không khai gì → giữ'],
          ['Học vấn', '**Không** là điều kiện đếm'],
        ],
      },

      { kind: 'h', text: '§2 · Con số in ra như thế nào' },
      {
        kind: 'list',
        items: [
          '**Cap 500** — hơn 500 tin thì in **“500+”**.',
          '**Có chọn tỉnh mà dưới 5 tin** thì đếm thêm một lần **không có điều kiện tỉnh**, và câu chữ nói rõ con số **toàn quốc** — để một tỉnh ít tin không làm người dùng bỏ dở wizard.',
          '**Bước 4 bằng bước 3 thì không in số.**',
          '**Bằng 0 thì không in số 0.** API lỗi thì câu dẫn hiện không kèm số.',
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

      { kind: 'h', text: '§3 · Vì sao không khớp trang tìm việc' },
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
        kind: 'p',
        text: 'Quyết định của BA ngày **12/11**: QA kiểm con số này **bằng dữ liệu trực tiếp**, không bằng trang tìm việc; test case số 13 của SRM-1347 (yêu cầu hai con số phải khớp) đã được bỏ.',
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
