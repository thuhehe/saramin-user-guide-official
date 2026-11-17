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
      '**Gợi ý việc làm cho một ứng viên cụ thể.** Hệ thống đọc hồ sơ của ứng viên, chấm từng job trên **thang 100 điểm** gồm **7 tín hiệu**, rồi chọn thẻ để hiện. Cùng một cách tính đó chạy ở **năm** chỗ khác nhau trên site ứng viên.',
      '**Lọc và chấm điểm là hai việc khác nhau — đừng nhầm.** Điều kiện ứng viên **tự khai** là *cổng lọc*: job không qua thì **không bao giờ** xuất hiện, dù điểm cao đến đâu. Mọi thứ còn lại chỉ **đổi thứ tự**, không loại job nào.',
      '**Tính mới mỗi lần mở trang.** Không có danh sách gợi ý nào được lưu sẵn cho từng người. Đổi Work preference là lần tải trang sau đã khác.',
      '**Ứng viên không bao giờ nhìn thấy điểm.** Không có % trên thẻ, không có điểm sàn, và mỗi màn hình chỉ có **một tiêu đề cố định** — hệ thống không đổi tiêu đề theo chất lượng kết quả.',
      '**Hành vi (xem job, lưu job, nộp đơn) không cộng điểm.** Nó chỉ mở rộng tập đem ra so khớp và dùng để phá hoà. Hành vi của ứng viên **không bao giờ** được dùng ở phía nhà tuyển dụng.',
    ],
    watch: [
      '**Job đã nộp đơn biến mất vĩnh viễn khỏi mọi gợi ý** — tính cả đơn đã bị từ chối và đơn đã thu hồi. Đây là nguyên nhân số một của câu hỏi “sao job này không còn hiện nữa”.',
      '**Ứng viên không khai địa điểm mong muốn thì tín hiệu địa điểm bằng 0**, kể cả với job remote. Đây là hành vi **cố ý** (chốt 12/11), không phải lỗi.',
      '**Ở trang chi tiết job, hệ thống không bao giờ nới điều kiện.** Nếu không còn job nào cùng ngành nghề, khối gợi ý **ẩn hẳn** chứ không lấp bằng job không liên quan.',
      '**Thấy đúng 6 thẻ đó suốt cả ngày là đúng thiết kế**, không phải cache hỏng. Reload không đổi; sang ngày hôm sau mới đảo bộ khác.',
      '**Bậc “cùng nhóm vị trí” (30 điểm) chưa bao giờ đạt được** vì dữ liệu taxonomy ba tầng chưa có. Thực tế thang vị trí chỉ chạy hai bậc: cùng vị trí 42, hoặc cùng ngành nghề 17.',
    ],
    blocks: [
      { kind: 'p', text: STAMP },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '§1 · Ý tưởng trong một phút' },
      {
        kind: 'p',
        text: 'Hệ thống biết hai điều về một ứng viên: **những gì họ khai** (hồ sơ, Work preference, CV) và **những gì họ thực sự làm** (job họ mở, lưu, nộp đơn). Ghép lại thành một *chân dung công việc họ muốn*.\n\nTừ chân dung đó, bốn việc theo đúng thứ tự này: **loại** những job họ đã nộp đơn, đã bấm bỏ qua hoặc đã đóng → **chấm** những job còn lại trên thang 100 điểm → **giữ 30 job cao nhất** làm pool, tối đa 3 job một công ty → **rải** pool đó ra các màn hình có khối gợi ý.',
      },
      {
        kind: 'table',
        note: 'Nếu chỉ cần hiểu ý tưởng thì đọc bảng này rồi dừng. Phần còn lại của trang là chi tiết của bốn bước đó.',
        cols: ['Bước', 'Một dòng', 'Chi tiết ở'],
        rows: [
          ['**1 · Người này là ai?**', 'Những gì họ **khai** cộng với những gì **hành vi** của họ nói. Ra một tập vị trí, ngành nghề và tỉnh rộng hơn phần họ tự gõ.', '§3'],
          ['**2 · Job nào được dự thi?**', 'Cổng lọc cắt bỏ job đã nộp đơn, job khác ngành nghề đã khai, job khác tỉnh đã khai.', '§4'],
          ['**3 · Job nào hợp?**', 'Chấm từng job còn lại trên **thang 100 điểm, 7 tín hiệu**.', '§5'],
          ['**4 · Hiện ra sao?**', 'Giữ **30 job điểm cao nhất** làm pool, **tối đa 3 job một công ty**, rồi mỗi màn hình rút thẻ ra theo cách riêng của nó.', '§6'],
        ],
      },
      {
        kind: 'list',
        heading: 'Vì sao phải có một “pool” rồi mới rải ra, thay vì in top 6 ở mọi nơi',
        items: [
          'In đúng top 6 ở cả năm màn hình thì **bốn màn hình kia thành thừa** — ứng viên gặp lại đúng sáu tấm thẻ vừa lướt qua.',
          'Rải từ một pool chung thì mỗi màn hình đưa ra thứ họ **chưa lướt qua**, mà vẫn nằm trong 30 job tốt nhất của chính họ — nên không có job kém nào lọt ra.',
          'Riêng **popup sau khi nộp đơn** thì **không xáo**: đó là màn hình duy nhất mà thứ tự quyết định ứng viên thật sự nộp vào job nào, nên thứ hạng ở đó phải trung thực.',
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '§2 · Năm nơi dùng cùng một cách tính — và một nơi không dùng' },
      {
        kind: 'table',
        note: 'Cùng một phép tính, khác tham số `surface` — nên thứ tự hiển thị và số thẻ khác nhau, còn cách chấm điểm thì giống hệt.',
        cols: ['Nơi hiển thị', 'Ai thấy', 'Số thẻ', 'Thứ tự'],
        rows: [
          ['**Onboarding** — khối “những việc phù hợp nhất”\n\n*Khối thứ hai ngay dưới — “Việc làm cho {vị trí}” — **không** dùng bộ máy này; nó là một lượt tìm kiếm thuần, có trang riêng.*', 'Ứng viên vừa xong wizard', 'tối đa 30 thẻ, giao diện chia 6/trang (tối đa 5 trang)', '**Đúng thứ tự điểm**, cap 3 job/công ty, cách nhau ≥ 6 vị trí'],
          ['**Trang cá nhân** — *Việc làm phù hợp với bạn*', 'Đã đăng nhập', '6', 'Xáo trộn **trong từng bậc vị trí** (§6)'],
          ['**Chi tiết job** — *Gợi ý việc làm cho bạn*', 'Đã đăng nhập', '6', 'Xáo trộn trong từng bậc vị trí; **neo** theo ngành nghề của job đang xem'],
          ['**Popup sau khi nộp đơn** (Batch apply)', 'Người vừa nộp đơn', '30', '**Đúng thứ tự điểm**, không xáo, không neo ngành nghề'],
          ['**Email JS 3** — gợi ý hằng tuần, thứ Hai 07:00', 'Mọi ứng viên đang hoạt động chưa tắt công tắc nhận mail', '6', '**Đúng thứ tự điểm**, một công ty một hàng'],
          ['**Trang tìm kiếm** — không có khối gợi ý', '—', '—', 'Backend có sẵn một `surface=SEARCH` nhưng **giao diện không bao giờ gọi nó** — hiện **không có strip gợi ý nào** trên trang tìm việc. Chữ `SEARCH` trong code của trang này là **nhãn analytics** cho kết quả tìm kiếm thường, không phải một khối gợi ý'],
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '§3 · Hệ thống biết gì về ứng viên' },
      {
        kind: 'table',
        note: 'Giá trị **tự khai** ăn điểm đầy đủ. Giá trị **suy ra** chỉ ăn **80 %** của bậc tương ứng (làm tròn): 42→34 · 30→24 · 20→16 · 17→14 · 5→4.',
        cols: ['Nguồn', 'Lấy gì', 'Loại'],
        rows: [
          ['**Vị trí mong muốn** (tối đa 3) trong Work preference', 'Vị trí, và ngành nghề của vị trí đó', 'Tự khai'],
          ['**Ngành nghề · Địa điểm mong muốn · Ngành mong muốn**', 'Ngành nghề, tỉnh, ngành', 'Tự khai'],
          ['**Hành vi 90 ngày gần nhất** — nộp đơn hoặc lưu job (**1 lần là đủ**), xem job (**3 job khác nhau**)', 'Vị trí · ngành nghề · tỉnh của những job đó, giữ **top 3** mỗi loại', 'Suy ra'],
          ['**Tiêu đề CV** — chỉ khi ứng viên **không khai cả** vị trí lẫn ngành nghề', 'Vị trí có tên hoặc tên gọi khác nằm trọn trong tiêu đề; cụm dài nhất thắng', 'Suy ra — **không** bật cổng lọc'],
        ],
      },
      {
        kind: 'list',
        heading: 'Ba điều dễ hiểu nhầm',
        items: [
          '**Hành vi không cộng điểm.** Nó làm hai việc: mở rộng tập so khớp, và phá hoà — hai job bằng điểm thì job ứng viên **chưa xem** đứng trước.',
          '**Vị trí suy từ tiêu đề CV không bật cổng lọc.** Nó chỉ dùng để chấm điểm, nên một ứng viên chưa khai gì vẫn nhìn thấy tập job rộng nhất.',
          '**Ngành chỉ lấy từ trường “Ngành mong muốn”** trong Work preference (chốt 16/11). Hệ thống **không** suy ngành từ công ty ghi trong CV.',
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '§4 · Điều kiện lọc — job nào không bao giờ hiện' },
      {
        kind: 'table',
        cols: ['Điều kiện', 'Bật khi nào', 'Loại job nào'],
        rows: [
          ['**Job còn sống**', 'Luôn luôn', 'Job đã đóng · hết hạn · tắt hiển thị · công ty không công khai; **job đã từng nộp đơn** (mọi trạng thái, kể cả đã rút); job ứng viên đã bấm **bỏ qua**'],
          ['**Ngành nghề**', 'Khi ứng viên đã khai vị trí **hoặc** ngành nghề', 'Job ngoài tập ngành nghề (khai ∪ hành vi)'],
          ['**Địa điểm**', 'Khi đã khai tỉnh **và không** tick *sẵn sàng chuyển chỗ ở*', 'Job ngoài các tỉnh đó — **trừ job remote**, job remote luôn qua cổng này'],
          ['**Neo theo job đang xem**', 'Chỉ ở trang chi tiết job', 'Job khác ngành nghề với job đang xem — và **không bao giờ nới**'],
          ['Ngành · hình thức · lương · kinh nghiệm · học vấn · kỹ năng', '**Không bao giờ lọc**', 'Chỉ ảnh hưởng điểm số'],
        ],
      },
      {
        kind: 'list',
        heading: 'Ba luật đi kèm',
        items: [
          '**Không khai gì thì không bật cổng nào** — tập job rộng nhất có thể. Hệ thống không bao giờ trả về danh sách rỗng chỉ vì hồ sơ trống.',
          '**Cắt còn 500 job trước khi chấm — và luật chọn ra 500 job đó là một phép SẮP XẾP, không phải một phép chấm điểm thứ hai.** Sắp theo đúng hai khoá, theo thứ tự:\n\n**① Job có ít nhất một vị trí nằm trong tập vị trí của ứng viên** (tập đã khai ∪ tập suy từ hành vi) đứng trước — tất cả, không giới hạn số lượng.\n**② Trong mỗi nhóm, job đăng mới nhất đứng trước.**\n\nRồi lấy 500 dòng đầu. Ứng viên chưa khai vị trí nào và chưa có hành vi thì khoá ① không phân biệt được job nào với job nào, nên còn lại đúng “mới nhất trước”.\n\nVì sao cắt như vậy là an toàn: job không trúng vị trí nào thì nhiều nhất cũng chỉ ăn 17 trong 42 điểm của tiêu chí vị trí, nên gần như không bao giờ lọt nổi vào pool 30 — cắt chúng trước không làm mất job tốt nào. Hệ thống xin **501** dòng chỉ để biết có bị cắt hay không, và ghi cờ `pool_capped` vào log.',
          '**Dưới 6 job thì nới hai bước:** bỏ điều kiện tỉnh, chạy lại; vẫn dưới 6 thì bỏ luôn điều kiện ngành nghề. **Tiêu đề khối không đổi** — hệ thống không thông báo là đã nới. Riêng trang chi tiết job thì không bao giờ nới.',
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '§5 · Bảy tiêu chí, tổng 100 điểm' },
      {
        kind: 'table',
        note: 'Đọc **theo hàng ngang**: cột giữa là hệ thống lấy thông tin của ứng viên ở đâu, cột phải là job khớp thì ăn bao nhiêu điểm. Trọng số **phiên bản v4**, cố định trong code; admin **không chỉnh được** — tab chỉnh đã bỏ khỏi console ngày 05/11. Mỗi điểm số ghi log kèm số phiên bản.',
        cols: ['Tín hiệu', 'Điểm', 'Lấy từ ứng viên', 'Job ăn bao nhiêu'],
        rows: [
          ['**Vị trí & ngành nghề**', '**42**',
           '**Khai:** vị trí mong muốn (≤3) + ngành nghề mong muốn.\n**Hành vi:** vị trí / ngành nghề của job đã nộp, đã lưu, hoặc xem ≥ 3 job — dùng **cùng lúc** với phần khai.\n**Chỉ khi cả hai rỗng:** vị trí đọc từ tiêu đề CV.',
           'Cùng **vị trí** → **42** khai / **34** suy ra\nCùng **nhóm vị trí**, khác vị trí → **30** / **24**\nCùng **ngành nghề**, khác nhóm → **17** / **14**\nKhác ngành nghề → **0**'],
          ['**Địa điểm & hình thức**', '**20**',
           '**Khai:** tỉnh mong muốn + hình thức làm việc.\n**Hành vi:** tỉnh của job đã nộp, đã lưu, hoặc xem ≥ 3 job.\n**Không khai gì:** không so.',
           'Đúng tỉnh **và** đúng hình thức → **20** khai / **16** suy ra\nJob **remote** → **20**, từ mọi nơi\nĐúng tỉnh, khác hình thức → **14**\nTỉnh khác → **0**'],
          ['**Kinh nghiệm**', '**14**',
           'Số năm kinh nghiệm trên **Hồ sơ**.\n**Nếu trống:** tính từ lịch sử làm việc trong CV.',
           'Trong dải job yêu cầu → **14**\nJob ghi “không yêu cầu” → **14**\nThừa ≤ 2 năm → **10**\nThiếu ≤ 1 năm → **7**\nThừa > 2 năm → **5**\nThiếu > 1 năm → **0**\n\n**Job không khai dải năm nhưng khai CẤP BẬC:** quy số năm ra bậc — cùng bậc **14** · lệch 1 bậc **7** · xa hơn **0**'],
          ['**Lương**', '**12**',
           'Lương mong muốn + tiền tệ trong Work preference.\n**Không có đường dự phòng** — không ai đoán được con số này.',
           'Trong dải, hoặc dải job nằm hoàn toàn cao hơn → **12**\nĐòi hơn ≤ 10 % → **8**\nĐòi hơn 10–20 % → **4**\nMột bên ghi “Thỏa thuận” → **6**\nĐòi hơn > 20 % → **0**\nKhác tiền tệ → quy đổi dải của **job** theo tỷ giá admin rồi mới so; không có tỷ giá → **0**'],
          ['**Ngành**', '**5**',
           'Trường **Ngành mong muốn** trong Work preference.\n**Không có đường dự phòng** — không suy từ công ty trong CV.',
           'Trùng ngành → **5**\nCùng ngành cha → **3**\nKhác → **0**'],
          ['**Kỹ năng**', '**4**',
           'Kỹ năng trên CV — phải là **id trong master data**, không nhận chữ gõ tay.\n**Không có đường dự phòng.**',
           'Khớp hết kỹ năng job yêu cầu → **4**\nKhớp một phần → 4 × (khớp ÷ yêu cầu); kỹ năng **bắt buộc** tính đôi ở cả hai vế\nKhông có kỹ năng nào chung → **0**'],
          ['**Học vấn**', '**3**',
           'Học vấn trên CV.\n**Không có đường dự phòng.**',
           'Đạt hoặc hơn yêu cầu → **3**\nJob ghi “không yêu cầu” → **3**\nThấp hơn 1 bậc → **1**\nThấp hơn từ 2 bậc → **0**'],
          ['**Tổng**', '**100**', '', ''],
        ],
      },
      {
        kind: 'list',
        heading: 'Thứ tự đọc của mỗi tín hiệu — ba bước',
        items: [
          '**① Gộp khai và hành vi lại với nhau** thành một tập. Hai nguồn này luôn dùng **cùng lúc**, không phải cái này thay cái kia.',
          '**② Chỉ khi tập đó rỗng** mới đọc tới dòng dự phòng — tiêu đề CV cho vị trí, CV cho số năm kinh nghiệm.',
          '**③ Vẫn không có gì** thì tín hiệu đó **0 điểm**. Lương, ngành, kỹ năng, học vấn **không có dòng dự phòng nào** — không ai đoán được những thứ đó.',
        ],
      },
      {
        kind: 'list',
        heading: 'Bốn luật chấm điểm',
        items: [
          '**Thiếu dữ liệu là 0 điểm, không chia lại thang.** Job không ghi lương, hoặc ứng viên không khai lương, thì tín hiệu lương bằng 0 — 12 điểm đó **không** được chia sang tín hiệu khác. Đúng cho cả hai phía.',
          '**Ứng viên có nhiều CV:** chấm **từng CV**, mỗi job giữ **điểm cao nhất** trong các CV.',
          '**Tổng luôn trên thang 100 và chỉ làm tròn một lần ở tổng** — không làm tròn từng tín hiệu.',
          '**Khác tiền tệ thì quy đổi theo tỷ giá admin nhập, dùng hai chiều.** Không có tỷ giá thì tín hiệu lương bằng 0. Đây là **thứ duy nhất** liên quan matching mà admin chỉnh được.',
        ],
      },
      {
        kind: 'warn',
        text: '**Kỹ năng ứng viên gõ tay mà không khớp master data được tính là “không có kỹ năng”** — mất điểm tín hiệu kỹ năng, và vẫn tính là một tín hiệu đã so được. Trường hợp này khá phổ biến với CV tải lên.',
      },

      /* ───────────────────────────────────────────────────────────────── */
      {
        kind: 'list',
        heading: 'Bốn điều hay bị hiểu nhầm',
        items: [
          '**Thiếu dữ liệu là 0 điểm, và 0 điểm đó không được chia cho tiêu chí khác.** Job không ghi lương thì tổng chỉ còn tối đa 88. Nếu chia lại thang, một job bỏ trống ba trường sẽ **vượt lên trên** một job khai đủ — tức là thưởng cho job giấu thông tin.',
          '**Ô trống bên phía ứng viên không gây hại gì.** Nó trừ đúng số điểm đó của **mọi job như nhau**, nên thứ tự không đổi chút nào — và ứng viên vốn không nhìn thấy con số. Khai thêm chỉ làm kết quả chính xác hơn, không phải điều kiện để dùng được.',
          '**Ứng viên có nhiều CV: mỗi job giữ điểm cao nhất trong các CV.** Một job chỉ xuất hiện **một lần** trong danh sách, mang điểm của CV hợp với nó nhất. Hệ thống **không** trộn các CV lại thành một trước khi chấm — trộn CV Developer với CV Sales ra một chân dung không phải cái nào cả.',
          '**Dấu *“cho nhà tuyển dụng thấy CV này”* không liên quan gì tới gợi ý việc làm** — nó chỉ ảnh hưởng tìm kiếm của nhà tuyển dụng. Feed dùng mọi CV, bật hay tắt đều như nhau.',
        ],
      },

      { kind: 'h', text: '§6 · Chọn thẻ để hiện' },
      {
        kind: 'list',
        items: [
          '**Bỏ job trùng** — cùng công ty + cùng tiêu đề + cùng tỉnh thì giữ job mới nhất.',
          '**Lấy 30 job điểm cao nhất làm “pool”.** Con số này đổi hai lần trong hai ngày: 80 → **50** (16/11 — 80 quá rộng, lọt nhiều job không liên quan) → **30** (17/11). **Không có điểm sàn** — pool luôn đầy nếu có đủ job.',
          '**Tối đa 3 job một công ty trong pool** (chốt 17/11) — áp cho trang cá nhân, chi tiết job và onboarding. Đi từ trên xuống, gặp job **thứ 4** của cùng một công ty thì bỏ qua: không xếp lại, không đổi điểm, không giữ chỗ cho ai. **Popup Batch apply không áp luật này.**\n\n3 ≈ **10% của pool 30** — đó là cách *chọn* con số, không phải cách *tính* nó: trong code nó là hằng số `3`, pool đổi thì chốt lại bằng tay. Nếu để code tự nhân 10% thì lúc pool mỏng (còn 8 job) cap tự tụt xuống 1, và mỗi màn hình rút số thẻ khác nhau nên mỗi nơi lại ra một con số khác.',
          '**Hai job cùng công ty cách nhau ít nhất 6 vị trí** (chốt 17/11). Luật này **thay cho** “một công ty một hàng” trước đây — một *hàng* là bố cục chứ không phải luật: trên điện thoại một hàng là một thẻ, nên luật cũ không bảo vệ được gì ở đó. Đếm theo **vị trí** trong danh sách thì không phụ thuộc bề ngang màn hình.\n\nDựng danh sách từng vị trí một: lấy job xếp cao nhất còn lại mà công ty của nó **chưa xuất hiện trong 5 vị trí gần nhất**. Không còn job nào hợp lệ thì **vẫn lấp** (và ghi cờ vào log) — bỏ trống một vị trí sẽ đẩy lệch mọi thẻ phía sau. Có cap ở trên thì gần như không bao giờ chạy tới đường lùi này.',
          '**Job đang xem và bản trùng của nó** bị loại khỏi pool ở trang chi tiết job và ở popup sau khi nộp đơn — không bao giờ gợi ý lại đúng job vừa nộp.',
        ],
      },
      {
        kind: 'table',
        heading: 'Thứ tự theo từng màn hình',
        cols: ['Màn hình', 'Thứ tự'],
        rows: [
          ['Popup sau khi nộp đơn', '**Đúng thứ tự điểm**, **không cap công ty** — nhưng không để hai job cùng công ty đứng liền nhau: gặp job trùng công ty với job vừa đặt thì nhìn xuống **tối đa 3 dòng** để đổi chỗ, cả 3 cũng trùng thì chấp nhận lặp. Không thẻ nào xê dịch quá 3 bậc so với hạng của nó, nên thứ tự vẫn trung thực với điểm'],
          ['Onboarding · Email JS 3', '**Điểm cao nhất trước**, cap 3 job/công ty, cách nhau ≥ 6 vị trí'],
          ['Trang cá nhân · Chi tiết job', '**Xáo trộn trong từng bậc vị trí** — xem dưới'],
        ],
      },
      {
        kind: 'table',
        heading: 'Ứng viên thấy tối đa bao nhiêu job của cùng một công ty',
        cols: ['Màn hình', 'Số thẻ hiện ra', 'Tối đa / công ty'],
        rows: [
          ['**Onboarding** — khối “những việc phù hợp nhất”', 'tối đa 30 thẻ (6/trang × 5 trang)', '**3** — và chắc chắn không hai thẻ cùng một trang'],
          ['**Chi tiết job** — “Recommended jobs”', '6 thẻ', '**1**'],
          ['**Trang cá nhân** — “Việc làm phù hợp với bạn”', '6 thẻ (carousel hiện 3)', '**1**'],
          ['**Email JS 3** — gợi ý hằng tuần', '6 thẻ', '**1**'],
          ['**Popup Batch apply**', 'tối đa 30 dòng', 'không giới hạn — chỉ không đứng liền nhau'],
        ],
        note: 'Ba màn 6 thẻ ra **1** là hệ quả tự động của luật khoảng cách, không phải một luật riêng: 6 vị trí không lọt vừa trong 6 thẻ. Cap 3 vì thế chỉ thực sự có hiệu lực ở **onboarding** — màn duy nhất hiện đủ 30 thẻ. Và 3 thẻ cách nhau ≥ 6 vị trí trong 30 vị trí thì rơi vào 3 trang khác nhau.',
      },
      {
        kind: 'list',
        heading: 'Xáo trộn trong từng bậc vị trí (SRM-1491, 16/11)',
        items: [
          'Pool được xếp theo **điểm của riêng tín hiệu vị trí**: vị trí **khai** 42 → vị trí **suy từ hành vi** 34 → nhóm vị trí 30 / 24 → ngành nghề 17 / 14 → còn lại 0. Rồi **chỉ xáo bên trong mỗi bậc**.',
          'Hệ quả: **job đúng vị trí ứng viên đã khai không bao giờ đứng sau job chỉ cùng ngành nghề**, dù job kia hơn điểm địa điểm hay lương.',
          'Lý do có luật này: QA báo một QA Engineer nhìn thấy Sysadmin, Helpdesk và Data Engineer đứng trước job QA.',
          '**Hạt giống** = ứng viên + ngày + màn hình (+ job đang xem ở trang chi tiết). Cùng một màn hình thì **ổn định cả ngày**, reload không đổi; mỗi màn hình đảo một kiểu khác; hôm sau mới khác. **Không bao giờ random thuần.**',
        ],
      },
      {
        kind: 'warn',
        text: '**Pool 50 là con số đã chốt ngày 16/11.** Code trên `dev` lúc kiểm tra tối 16/11 vẫn đang là **80**; bản sửa xuống 50 chưa lên `dev`. Trong lúc chờ, danh sách xáo trộn trên dev sẽ đa dạng hơn (và lẫn nhiều job xa hơn) so với mô tả ở đây.',
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '§7 · Ví dụ chạy thật — Linh và ba job' },
      {
        kind: 'example',
        heading: 'Linh và ba job — đọc theo hàng ngang',
        scenario:
          '**Linh** gõ vào Work preference: **Marketing Executive · Marketing · Hồ Chí Minh · 20 triệu**. Hồ sơ ghi **3 năm**. CV có *Facebook Ads · Google Analytics · Content Writing*, bằng **Đại học**, và một công ty thương mại điện tử — nhưng cô **chưa bao giờ khai Ngành mong muốn**. Trong 90 ngày qua cô **nộp đơn 1 job** (Chuyên viên Marketing · Shopee), **lưu 1 job** (Content Marketing) và **mở 6 job**, trong đó 4 job ở Bình Dương.',
        cols: ['Tín hiệu', 'Linh có gì', 'A · Content Marketing · Lazada · HCM', 'B · Chuyên viên MKT · Lazada · Bình Dương', 'C · Marketing Executive · VNG · HCM'],
        rows: [
          ['Vị trí & ngành nghề · 42', 'Gõ: **Marketing Executive**. Hành vi: Chuyên viên Marketing (đã nộp), Content Marketing (đã lưu)', 'Content Marketing — đúng vị trí, nhưng **suy ra** → **34**', 'Chuyên viên MKT — đúng vị trí, **suy ra** → **34**', 'Marketing Executive — đúng vị trí cô **tự gõ** → **42**'],
          ['Địa điểm · 20', 'Gõ: **Hồ Chí Minh**. Hành vi: Bình Dương (mở 4 job ở đó)', 'HCM, tự khai → **20**', 'Bình Dương, suy ra → 80 % → **16**', 'HCM, tự khai → **20**'],
          ['Kinh nghiệm · 14', '3 năm (Hồ sơ)', 'Job cần 2–4 → **14**', 'Job cần 3–5 → **14**', 'Job cần 1–2, cô thừa 1 năm → **10**'],
          ['Lương · 12', '20 triệu', '18–25 → **12**', '20–28 → **12**', 'Trần 16 — cô đòi cao hơn 25 % → **0**'],
          ['Ngành · 5', '**Không khai Ngành mong muốn.** Build **không** suy ngành từ công ty trong CV', '**0**', '**0**', '**0**'],
          ['Kỹ năng · 4', 'Facebook Ads · Google Analytics · Content Writing (CV)', 'Khớp 2 trong 3 job đòi → **2,7**', 'Khớp cả hai job đòi → **4**', 'Job đòi Google Ads → **0**'],
          ['Học vấn · 3', 'Đại học (CV)', 'Job cần Đại học → **3**', 'Job **không khai** → **0**, không chia lại', 'Job cần Đại học → **3**'],
          ['**Tổng**', '', '**85,7 → 86**', '**80**', '**75**'],
        ],
        note:
          '**Năm điều rút ra.** **(1) Job C giữ 42 trong 75 điểm chỉ nhờ một sự thật** — Marketing Executive là vị trí Linh **tự gõ**. Trả lương hụt 25 %, không một kỹ năng chung, không điểm ngành nào — ở ví dụ này không job nào có — vậy mà vẫn 75: thứ ứng viên nói mình muốn thắng gần như mọi thứ khác. **(2) Job A và B ăn 34 chứ không phải 42** — đúng vị trí, nhưng học được từ một job đã nộp và một job đã lưu, nên chỉ 80 %. Job B có mặt trong danh sách **chỉ nhờ hành vi**: Bình Dương không nằm ở đâu trong hồ sơ của Linh. **(3) Cả ba job đều 0 điểm ngành** vì Linh bỏ trống Ngành mong muốn — một ô trống **bên phía ứng viên** trừ điểm **mọi job như nhau**, nên **thứ tự không hề đổi**. **(4) Job B mất 3 điểm vì một ô nhà tuyển dụng bỏ trống**, và 3 điểm đó **không** được chia cho tín hiệu khác — chia thì B đọc ra 80 ÷ 97 = **82 %** thay vì 80, tức là con số cao hơn chỉ nhờ **khai ít hơn**. Ở ví dụ này 82 vẫn chưa đủ vượt A (86); **§4a** mới là ca nó lật hẳn thứ tự. **(5) Linh không bao giờ thấy con số nào.** Cả ba job vào pool của cô; popup sau khi nộp đơn liệt kê A, B, C đúng thứ tự đó; trang cá nhân và chi tiết job rút thẻ xáo trộn từ cùng pool ấy — và vì A với B cùng là Lazada nên **hai thẻ phải cách nhau ít nhất 6 vị trí** — trên một dải 6 thẻ thì nghĩa là không bao giờ thấy cả hai cùng lúc. Job Shopee cô đã nộp đơn không có mặt ở cột nào vì **đã nộp là mất hẳn** (§4) — nhưng chính nó là lý do A và B được 34 điểm vị trí.',
      },

      /* ───────────────────────────────────────────────────────────────── */
    ],
  },

  /* ────────────────────────────────────────────────────────────────────────── */
  'similar-jobs': {
    logic: [
      '**So job với job, không đọc hồ sơ người xem.** Vì vậy **mọi người đều thấy cùng một danh sách** cho cùng một job — khách chưa đăng nhập cũng thấy y hệt người đã đăng nhập.',
      '**Đây là bảng điểm riêng**, khác bảng của *Recommended jobs*: 45 / 15 / 15 / 10 / 8 / 4 / 3, trên cùng thang 100. Đừng dùng bảng của bên kia để giải thích kết quả bên này.',
      '**Kết quả được cache 1 giờ cho mỗi job** và chỉ tính lại ở lượt xem đầu tiên sau khi cache hết hạn — thực tế làm mới chậm nhất khoảng **75 phút**.',
      '**Không có cổng lọc ngành nghề — và đó là cả mục đích của thiết kế này.** Bản nháp cũ bắt buộc cùng ngành nghề rồi bỏ hết phần còn lại; làm vậy sẽ có những job **không có việc tương tự nào để hiện**, và một khối rỗng là kết cục mà tính năng này không được phép tạo ra. Chấm hết mọi job thì không bao giờ rỗng, và phần dự phòng tự nó hợp lý: một job không có gì cùng ngành nghề vẫn ăn điểm địa điểm, cấp bậc, lương và hình thức — thành ra *cùng thành phố, cùng cấp bậc, lương tương đương*.',
      '**Hệ thống không hứa “tương tự” khi nó không tương tự:** điểm cao nhất dưới 40 thì giao diện đổi tiêu đề thành *Việc làm khác tại {tỉnh}* — nhưng vẫn hiện đủ 6 thẻ.',
    ],
    how: [
      'Mở bất kỳ **trang chi tiết job** nào trên site ứng viên và kéo xuống carousel *Các công việc tương tự*.',
      'Ngay dưới carousel là khối thứ hai. **Đã đăng nhập** thì khối đó là *Gợi ý việc làm cho bạn* (**Gợi ý việc làm cho bạn**, có đọc hồ sơ). **Chưa đăng nhập** thì khối đó lấy **dòng 7–12 của chính danh sách này** và mang tiêu đề *Có thể bạn quan tâm*.',
      'Muốn biết vì sao một job lọt vào: so hai job với nhau theo bảng ở §2 — không cần biết người xem là ai. Có ví dụ chạy đủ số ở §5.',
    ],
    watch: [
      '**Hai khối cạnh nhau, hai cách tính khác nhau.** *Các công việc tương tự* so job với job; *Gợi ý việc làm cho bạn* so hồ sơ với job. Hai khối **không bao giờ trùng job**: carousel lấy trước, khối dưới bỏ các id đã hiện.',
      '**Job đã nộp đơn vẫn nằm trong danh sách dùng chung** — giao diện mới là chỗ ẩn nó đi cho người đã đăng nhập (§4). Nên danh sách gốc không đổi theo từng người.',
      '**Từ 16/11, job đã rút đơn hiện lại trên carousel này** và nộp lại được, trong khi ở *Recommended jobs* và các email thì vẫn bị ẩn. Cùng một job có thể thấy ở chỗ này mà không thấy ở chỗ kia — đây là hệ quả cố ý của quyết định “rút đơn là dứt khoát và giải phóng job”.',
      '**Sửa nội dung một job không làm danh sách đổi ngay** — phải chờ cache hết hạn.',
      '**Tuổi job không ăn điểm**, chỉ dùng để phá hoà cuối cùng. Một job cũ nhưng giống hệt vẫn đứng trên một job mới nhưng khác ngành.',
    ],
    blocks: [
      { kind: 'p', text: STAMP },

      { kind: 'h', text: '§1 · Luồng chạy' },
      {
        kind: 'shot',
        src: '/shots/matching/job-detail-two-blocks.jpg',
        where: 'Jobseeker site',
        caption: 'Carousel **Các công việc tương tự** (khối trên) là thứ trang này mô tả. Khối **Có thể bạn quan tâm** ngay dưới lấy các dòng tiếp theo của cùng danh sách khi người xem **chưa đăng nhập**; đã đăng nhập thì chỗ đó là *Gợi ý việc làm cho bạn*, một cách tính khác hẳn.',
      },
      {
        kind: 'list',
        items: [
          'Job gốc phải đang **mở hoặc đã đóng**, còn bật hiển thị, công ty công khai — không thì trả về **404**.',
          'Đọc **một câu truy vấn** lấy thông tin job gốc và **mọi job đang sống** — không có cổng ngành nghề, không giới hạn theo ngày đăng.',
          'Chấm điểm trong bộ nhớ → **bỏ job trùng** (cùng công ty + tiêu đề + tỉnh) và bỏ bản trùng của chính job gốc → **tối đa 2 job mỗi công ty** → sắp **điểm ↓ → ngày đăng ↓ → id ↓** → giữ **20 id** → dựng thẻ và kiểm tra lại job còn sống.',
          'Giao diện xin khoảng **12 dòng**: 6 cho carousel, dòng 7–12 cho khối thứ hai của khách chưa đăng nhập.',
          '**Luôn loại:** chính job đang xem · job đã đóng hoặc hết hạn · job tắt hiển thị · công ty không còn hoạt động.',
          '**Không có điểm sàn.** Danh sách luôn đủ 6 thẻ chừng nào thị trường còn 6 job để đưa — một danh sách điểm thấp vẫn là 6 job liên quan nhất đang tồn tại, và như vậy vẫn hơn một khối rỗng.',
          '**Cùng công ty bị giới hạn, không bị loại.** Hai job là đủ để một nhà tuyển dụng không chiếm hết hàng; loại hẳn sẽ vứt đi những job thật sự phù hợp khi công ty đó là đơn vị tuyển chính trong một ngách hẹp.',
        ],
      },

      { kind: 'h', text: '§2 · Bảng điểm job ↔ job' },
      {
        kind: 'table',
        note: 'Trọng số **phiên bản v3**, cố định trong code. Thiếu dữ liệu ở **bất kỳ phía nào** là 0 điểm, không chia lại thang.',
        cols: ['Tín hiệu', 'Tối đa', 'Các bậc'],
        rows: [
          ['**Ngành nghề**', '**45**', 'Cùng vị trí 45 · cùng nhóm vị trí 32 · cùng ngành nghề 18. Lấy quan hệ **mạnh nhất** giữa mọi cặp vị trí của hai job'],
          ['**Cấp bậc**', '**15**', 'Cùng bậc 15 · lệch 1 bậc 9 · lệch 2 bậc 4 · từ 3 bậc trở lên 0'],
          ['**Địa điểm**', '**15**', 'Cùng tỉnh, hoặc một bên là job remote 15 · khác tỉnh 0'],
          ['**Lương**', '**10**', 'Hai dải giao nhau 10 · lệch trong 20 % 5 · không giao 0. Quy về **lương tháng** và quy đổi tiền tệ trước khi so'],
          ['**Kỹ năng**', '**8**', '8 × (số kỹ năng chung ÷ số kỹ năng của **job đang xem**)'],
          ['**Ngành**', '**4**', 'Cùng ngành 4 · cùng nhóm ngành cha 2'],
          ['**Hình thức làm việc**', '**3**', 'Cùng hình thức 3 · remote ↔ hybrid 2'],
        ],
      },
      {
        kind: 'warn',
        text: '**Bậc “cùng nhóm vị trí” (32 điểm) chưa bao giờ đạt được** — dữ liệu taxonomy ba tầng chưa có (SRM-1315). Thực tế thang ngành nghề chạy hai bậc: 45 hoặc 18. Xem §5 để thấy điều này đổi thứ hạng như thế nào.',
      },

      {
        kind: 'list',
        heading: 'Ba điều cần biết về bảng này',
        items: [
          '**Job đăng nhiều vị trí lấy quan hệ mạnh nhất, không lấy trung bình.** Nhờ vậy một job liệt kê năm vị trí **không bị phạt vì đăng rộng**, và cũng **không tự nâng điểm** bằng cách liệt kê thêm vị trí.',
          '**Thiếu dữ liệu là 0 điểm, không chia lại thang** — dù bên nào thiếu. Cái giá phải trả: job khai càng ít thì **trần điểm càng thấp**, nên danh sách của nó hay rơi vào tiêu đề *Việc làm khác tại {tỉnh}* hơn. Đó là sự thật chứ không phải lỗi.',
          '**Những gì KHÔNG vào điểm:** quy mô công ty · phúc lợi · học vấn · loại hợp đồng · **tuổi job**. Tuổi job chỉ dùng để phá hoà. Những thứ này hoặc lặp lại một tiêu chí đã tính, hoặc không đổi việc một job có thay thế được job kia hay không.',
        ],
      },

      { kind: 'h', text: '§3 · Khi không tìm được job nào thật sự giống' },
      {
        kind: 'list',
        items: [
          'API trả về danh sách thẻ **kèm một cờ `weak`**, và **không trả điểm**.',
          '`weak` bật khi **job cao điểm nhất vẫn dưới 40**. Giao diện khi đó đổi tiêu đề thành **“Việc làm khác tại {tỉnh}”**.',
          '**Vẫn hiện đủ 6 thẻ** — không ẩn khối, không giảm số thẻ. Chỉ lời hứa trong tiêu đề là thay đổi.',
          'Dưới 40 điểm nghĩa là **ngành nghề gần như không đóng góp gì** và các thẻ chỉ còn được gắn với nhau bằng địa điểm và cấp bậc. Đổi tiêu đề thay vì giấu danh sách là cách trung thực hơn.',
        ],
      },

      { kind: 'h', text: '§4 · Người đã đăng nhập thấy gì' },
      {
        kind: 'p',
        text: 'Người đã đăng nhập không nên được mời một việc họ đã nộp đơn — mở ra cũng chỉ thấy nút ứng tuyển từ chối. Nên hệ thống **bớt các dòng đó đi**. Không đổi gì khác: cùng điểm, cùng thứ tự, cùng thẻ.',
      },
      {
        kind: 'table',
        cols: ['Người đọc', 'Thấy gì'],
        rows: [
          ['Chưa đăng nhập', 'Toàn bộ danh sách, đúng như bản cache. Không giấu gì — hệ thống không biết họ là ai'],
          ['Đã đăng nhập, chưa nộp job nào trong đó', 'Giống hệt mọi người'],
          ['Đã đăng nhập, đã nộp một vài job trong đó', 'Cùng danh sách, trừ những job đó. Phần còn lại giữ nguyên vị trí'],
        ],
      },
      {
        kind: 'list',
        items: [
          '**Server gửi MỘT danh sách cache cho tất cả mọi người; trình duyệt mới là chỗ bỏ các dòng của riêng người đọc.** Trang chi tiết job vốn đã phải hỏi “tôi nộp job này chưa” để vẽ nút Apply, nên câu trả lời đang trên đường tới rồi — không tốn thêm lượt gọi nào. Lọc ở server sẽ biến mỗi trang chi tiết job thành một trang riêng cho từng người và **mất sạch cache**.',
          '**Xin nhiều dòng hơn số thẻ hiện ra** — khoảng 12 dòng cho một hàng 6 thẻ. Bỏ hai ba dòng trong mười hai thì hàng vẫn đầy; bỏ hai ba dòng trong đúng sáu thì hàng ngắn thấy rõ.',
          '**Không để thẻ biến mất trước mắt người đọc.** Vẽ hàng sau khi đã biết họ nộp những job nào — trang vốn đã chờ câu trả lời đó. Hiện 6 thẻ rồi xoá đi 2 làm trang nhảy và trông y như một lỗi.',
        ],
      },

      { kind: 'h', text: '§5 · Ví dụ chạy thật' },
      {
        kind: 'example',
        heading: 'Người đọc đang xem một job Senior Frontend Engineer',
        scenario:
          'Job đang xem: **Senior Frontend Engineer · FPT Software · Hồ Chí Minh · Senior · IT/Phần mềm · 30–45 triệu**, khai **5 kỹ năng**: React · TypeScript · Git · Docker · AWS. Con số 5 này là mẫu số của tín hiệu kỹ năng.',
        cols: ['Job ứng viên', 'Ngành nghề 45', 'Cấp bậc 15', 'Địa điểm 15', 'Lương 10', 'Kỹ năng 8', 'Ngành 4 + HT 3', 'Tổng'],
        rows: [
          ['**React Developer** · Tiki · HCM · Senior · 32–48tr · chung React, TypeScript, Git', 'cùng vị trí **45**', '**15**', '**15**', '**10**', '3/5 → **4,8**', '**7**', '**97**'],
          ['**Backend Engineer** · Shopee · HCM · Senior · 30–45tr · chung Docker', 'cùng nhóm **32**', '**15**', '**15**', '**10**', '1/5 → **1,6**', '**7**', '**81**'],
          ['**Frontend Engineer** · VNG · **Hà Nội** · Senior · 30–45tr · chung React, TypeScript', 'cùng vị trí **45**', '**15**', 'khác tỉnh **0**', '**10**', '2/5 → **3,2**', '**7**', '**80**'],
          ['**Frontend Intern** · Base.vn · HCM · **Intern** · 8–12tr · chung React', 'cùng vị trí **45**', 'lệch 3 bậc **0**', '**15**', 'không giao **0**', '1/5 → **1,6**', '**7**', '**69**'],
          ['**Data Engineer** · MoMo · HCM · Senior · 35–50tr · chung AWS', 'cùng ngành nghề **18**', '**15**', '**15**', '**10**', '1/5 → **1,6**', '**7**', '**67**'],
          ['**Kế toán trưởng** · VNG · HCM · Manager · 30–45tr · không chung gì', 'khác ngành nghề **0**', 'lệch 1 bậc **9**', '**15**', '**10**', '**0**', '**3**', '**37**'],
        ],
        note:
          '**Thứ tự theo tài liệu:** Tiki 97 · Shopee 81 · VNG 80 · Base.vn 69 · MoMo 67 · Kế toán 37. — ⚠ **Trên build hôm nay thì khác**: bậc *cùng nhóm vị trí* chưa chạy, nên Shopee chỉ được **18** chứ không phải 32, tổng còn **67** — **bằng đúng MoMo**, và hai job phải phá hoà bằng ngày đăng. Đây chính là cái giá của việc thiếu tầng taxonomy giữa (§2). — Ba điều khác đáng rút ra: **(1)** Shopee 81 nhỉnh hơn VNG 80 **một điểm** là thiết kế đang chạy đúng — “khác vị trí, cùng thành phố” và “cùng vị trí, khác vùng” thật sự xấp xỉ nhau. **(2)** Job **Intern** (69) vượt Data Engineer (67) dù lương bằng một phần năm: cùng vị trí và cùng thành phố thắng cùng ngành nghề. Nếu thấy sai thì vặn **Cấp bậc** từ 15 lên 20, **đừng lọc bỏ cấp bậc** — làm vậy là đem khối rỗng quay lại. **(3)** Job **Kế toán trưởng** vẫn nằm đó ở 37 điểm, và đó là cố ý: nếu thị trường chỉ có sáu job này thì người đọc vẫn thấy sáu thẻ. Khi có năm chục job IT thì nó không bao giờ xuất hiện.',
      },

    ],
  },

  /* ────────────────────────────────────────────────────────────────────────── */
  'recommended-candidates': {
    logic: [
      '**Khối này neo vào MỘT TIN TUYỂN DỤNG, không neo vào thư mục.** Thư mục talent pool chỉ có tên và ngày tạo — không có vị trí, không cấp bậc, không địa điểm, nên không có gì để so. Thư mục là nơi **lưu** kết quả, không phải đề bài sinh ra kết quả.',
      '**Một phép tính duy nhất — job nháp không phải trường hợp riêng.** Không có cổng “job nháp đủ thông tin chưa”. Job khai thiếu thì **tự khắc điểm thấp**, vì tín hiệu job không khai được 0 điểm.',
      '**Chỉ đọc dữ liệu ứng viên tự khai** — hồ sơ và CV. Hành vi xem job, lưu job, nộp đơn **không bao giờ** sang phía nhà tuyển dụng; đó là dữ liệu cá nhân, đọc để xếp feed của chính người đó chứ không cho việc gì khác.',
      '**Có điểm sàn 40 đặt trên KẾT QUẢ.** Người cao điểm nhất dưới 40 nghĩa là job này không sinh ra được gì dùng được → đổi hẳn sang chế độ *Hồ sơ mới cập nhật*. Phía ứng viên không có sàn nào.',
      '**Điểm chọn ra pool, phép xáo trộn gieo theo ngày chọn ai hiện hôm nay.** Áp dụng cho **cả hai** chế độ, không phải mẹo riêng của chế độ dự phòng.',
    ],
    how: [
      'Vào **Company Home** của site nhà tuyển dụng (`/hiring`), khối *Recommended talent*. Cần quyền tìm kiếm ứng viên.',
      'Dropdown ở đầu khối chọn job để so. Không chọn thì hệ thống tự lấy theo thứ tự ở §1. Tiêu đề khối **in tên job** — NTD phải thấy được danh sách này đang trả lời cho job nào mà không cần bấm gì.',
      'Muốn biết vì sao một người lọt vào: xem mục **Ai được coi là ứng viên của job này** trước (họ có qua được bước lọc không), rồi mới tới bảng 7 tiêu chí ở trang *Recommended jobs* (họ ăn bao nhiêu điểm).',
    ],
    watch: [
      '**Bấm thẻ là tốn một lượt mở CV miễn phí** (chốt 16/11). Hết lượt thì thẻ **vẫn hiện**, nhưng mở ra là CV che hết chi tiết.',
      '**Một hồ sơ hiện 3 lần mà không ai bấm thì bị loại** khỏi gợi ý của công ty đó — và bị loại **trước** khi xáo trộn, không phải sau.',
      '**Pool nhỏ hơn một hàng thẻ không phải lỗi.** Chỉ 2 người qua sàn thì hiện 2 người, mỗi ngày, cho tới khi dữ liệu đổi. **Không bù** bằng người dưới sàn — đó đúng là thứ mà điểm sàn sinh ra để chặn.',
      '**Chế độ *Hồ sơ mới cập nhật* không in % và không gắn nhãn Top pick.** Ở đó không có điểm, nên một nhãn tự job là một lời nói dối.',
      '**Cờ `exposure` không liên quan ở đây.** Nó ẩn job khỏi *ứng viên*; đây là dashboard của chính công ty, nên job tắt hiển thị vẫn neo bình thường — họ vẫn đang tuyển, chỉ là không quảng cáo.',
    ],
    blocks: [
      { kind: 'p', text: STAMP },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '§1 · Khối gắn với một job' },
      {
        kind: 'p',
        text: 'NTD chọn job từ dropdown. Không chọn thì hệ thống lấy **job thật nhất**, không phải job mới nhất: **trạng thái quyết định bậc, trong cùng một bậc thì job sửa gần nhất thắng**.',
      },
      {
        kind: 'table',
        cols: ['Ưu tiên', 'Trạng thái job', 'Vì sao nằm ở bậc này'],
        rows: [
          ['**1**', '**Đang mở**, chưa quá hạn', 'Đang tuyển thật. Ai hiện ra cho job này thì liên hệ được ngay hôm nay.'],
          ['**2**', '**Hẹn đăng**', 'Đã chốt và duyệt xong, chỉ còn chờ tới ngày.'],
          ['**3**', '**Nháp**', 'Có thể không bao giờ đăng, nhưng vẫn hơn là không có gì để neo.'],
          ['—', '**Đã đóng**', '**Không bao giờ neo.** Job đã đóng thì không còn tuyển.'],
          ['—', 'Không có job nào ở cả ba bậc', 'Tiêu đề đổi thành **Hồ sơ mới cập nhật** — xem §3.'],
        ],
      },
      {
        kind: 'list',
        items: [
          '**TRONG CÙNG MỘT BẬC, SẮP THEO LẦN SỬA CUỐI — KHÔNG PHẢI NGÀY TẠO.** Việc này quan trọng hơn vẻ ngoài của nó: công ty có hai mươi job đang mở sẽ không hiểu vì sao “job mới nhất” được chọn, còn “job bạn vừa sửa” thì tự giải thích trong một câu. Nó cũng chặn một job nháp bỏ quên sáu tháng trước vượt lên trên job NTD vừa động vào sáng nay.',
          '**TIN ĐANG MỞ NHƯNG QUÁ HẠN BỊ COI NHƯ ĐÃ ĐÓNG** và rơi khỏi bậc 1 — nếu không thì Home đi mời ứng viên cho một job không ai nộp đơn được nữa.',
          '**TIÊU ĐỀ IN TÊN TIN.** NTD phải nhìn ra danh sách này đang trả lời cho job nào mà không phải bấm gì cả.',
          '**THƯ MỤC KHÔNG BIẾN MẤT — NÓ ĐỔI VAI.** Trước là đề bài, giờ là đích đến: nút “Lưu vào thư mục…” nằm trên từng thẻ.',
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '§2 · Ai được đem ra chấm' },
      {
        kind: 'p',
        text: 'Trước khi chấm bất cứ thứ gì, tập người được thu về những ai **có khả năng là ứng viên CỦA TIN NÀY**. Đây không phải mẹo tối ưu tốc độ — đây là định nghĩa. Lấy một người khi **BẤT KỲ** điều nào sau đây đúng, rồi cắt còn **500 người** trước khi chấm.',
      },
      {
        kind: 'table',
        cols: ['Đọc từ job', 'So với ứng viên'],
        rows: [
          ['Mọi **vị trí** gắn trên job', '**Vị trí mong muốn** của ứng viên (tối đa 3)'],
          ['**Ngành nghề** của job', '**Ngành nghề mong muốn** trên hồ sơ'],
          ['**Kỹ năng** của job', '**Kỹ năng trên CV** của ứng viên'],
        ],
      },
      {
        kind: 'list',
        items: [
          '**KHÔNG CÓ BƯỚC NÀY THÌ ĐIỂM SỐ CHO NGƯỜI LẠ LỌT QUA.** Địa điểm 20 + kinh nghiệm 14 + lương 12 là **46** — đã trên sàn 40. Nghĩa là một người cùng thành phố, đúng số năm, đúng mức lương sẽ đủ điểm cho một job thuộc ngành hoàn toàn không liên quan. Điểm sàn không bắt được chuyện đó; chỉ bước này bắt được.',
          '**LÀ “HOẶC”, KHÔNG PHẢI “VÀ”.** Đây là gợi ý, không phải tìm kiếm: quăng lưới rộng ở đây rồi để điểm số xếp hạng. Dùng “và” thì trên một cơ sở dữ liệu cỡ Việt Nam sẽ gần như không ra ai.',
          '**ĐÂY CŨNG LÀ THỨ LÀM TIN NHÁP SƠ SÀI TỰ GIẢI QUYẾT.** Job nháp không vị trí, không ngành nghề, không kỹ năng thì không khớp ai ở bước này → danh sách rỗng → khối rơi xuống chế độ ở §3. Không cần một luật riêng nào cho job nháp.',
          '**KHỚP CẢ THỨ HỌ MUỐN LẪN THỨ HỌ LÀM ĐƯỢC.** Vị trí và ngành nghề mong muốn nói họ đang tìm gì; kỹ năng trên CV nói họ làm được gì. NTD cần cả hai đúng, nên cả hai đều được quyền đưa một người vào vòng chấm, và cả hai đều được chấm ở bước sau.',
          '**NGƯỜI ĐÃ BỊ “LỜ ĐI” 3 LẦN RỜI TẬP TRƯỚC KHI CẮT 500**, không phải sau — nếu không thì họ vẫn chiếm chỗ trong 500 người được chấm.',
          '⚠ **MẶT TRÁI CỦA NHÁNH KỸ NĂNG:** ứng viên gõ tay kỹ năng không khớp master data thì nhánh thứ ba **không bao giờ chạy** cho họ. Họ phải khai vị trí hoặc ngành nghề mới vào được vòng chấm — mất nhiều hơn hẳn 4 điểm kỹ năng.',
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      {
        kind: 'list',
        heading: 'Hai luật đi kèm',
        items: [
          '**Tiêu chí mà job không khai thì mọi ứng viên đều 0 điểm ở đó**, và số điểm đó không chia sang tiêu chí khác. Một job sơ sài **cố ý** có trần điểm thấp — đó là cách job nháp và job khai thiếu tự rơi xuống, không cần một luật riêng cho chúng.',
          '**Người cao điểm nhất dưới 40 thì khối chuyển sang chế độ *Hồ sơ mới cập nhật*** (mục dưới). Ở mức 15 % thì các thẻ không sai, chúng **vô nghĩa** — và một hàng thẻ vô nghĩa dưới một tiêu đề tự job chính là cách nhà tuyển dụng học được thói quen bỏ qua khu vực đó. Mốc 40 nằm trong cấu hình, nhưng **không có màn hình admin** để đổi.',
        ],
      },

      { kind: 'h', text: '§3 · Khi không ai đạt sàn — “Hồ sơ mới cập nhật”' },
      {
        kind: 'p',
        text: 'Khối **vẫn hiện**. Nó không để trống và cũng không hiện trạng thái rỗng — nhưng **tiêu đề đổi**, vì nội dung đã đổi. Vấn đề gốc chưa bao giờ là “hiện người trong khi không có job”; vấn đề là **hứa một kết quả khớp mà thực ra không có**. Đổi tên khối là vấn đề biến mất.',
      },
      {
        kind: 'table',
        cols: ['Bước', 'Luật'],
        rows: [
          ['1 · Lọc', 'Các bộ lọc cứng ở mục trên. Ngoài những người đó ra, không ai được hiện.'],
          ['2 · Ưu tiên', 'Người có ngành hoặc ngành nghề mong muốn trùng **ngành của chính công ty** lên trước. Không có job nào thì ít nhất ta vẫn biết họ làm nghề gì.'],
          ['3 · Sắp xếp', 'CV cập nhật gần nhất trước — CV mới nghĩa là người đang thật sự tìm việc.'],
          ['4 · Dàn đều', '**Mỗi ngành nghề một người**, không thì cả hàng ra ba bạn QA tester.'],
          ['5 · Xoay vòng', 'Hằng ngày, theo cùng luật chọn ba người — không phải hành vi riêng của chế độ dự phòng.'],
        ],
      },
      {
        kind: 'list',
        items: [
          '**KHÔNG NHÃN “TOP PICK”, KHÔNG PHẦN TRĂM Ở CHẾ ĐỘ NÀY.** Ở đây không có điểm, nên một nhãn thể hiện độ tự job sẽ là một lời nói dối. Nhãn đó chỉ thuộc về chế độ có chấm điểm.',
          '**ĐỪNG DÙNG SỐ NĂM KINH NGHIỆM LÀM THƯỚC ĐO CHẤT LƯỢNG**, và tuyệt đối không dùng tuổi hay giới tính. Nhiều năm hơn không phải là tốt hơn, chỉ là khác, và nó phụ thuộc hoàn toàn vào vị trí.',
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      {
        kind: 'list',
        heading: 'Chọn ra ba người, và giữ nguyên cả ngày',
        items: [
          '**Giữ 30 người điểm cao nhất**, rồi bốc **3** người trong đó theo công ty và ngày. Cùng ba người đó suốt cả ngày, hôm sau mới đổi — nhà tuyển dụng nhìn thấy một người sáng nay thì chiều phải tìm lại được.',
          '**Trong ba thẻ vẫn sắp theo điểm.** Phép bốc quyết định **ai** xuất hiện, không quyết định **thứ tự** — chỉ có ba thẻ nên người khớp nhất phải đọc được trước.',
          '**Người đã hiện 3 lần mà không ai bấm bị loại trước khi bốc**, không phải sau. Bốc trước thì hệ thống cứ chia đi chia lại đúng những người nhà tuyển dụng đã bỏ qua.',
          '**Chỉ hai người qua sàn thì hiện hai thẻ** — không bù thêm người dưới sàn cho đủ hàng.',
          '**Ai được phép xuất hiện:** ứng viên cho phép nhà tuyển dụng tìm thấy mình · CV **Đạt** · **chưa nằm trong talent pool** của công ty.',
        ],
      },

      { kind: 'h', text: '§4 · Bấm vào thẻ — có trừ một lượt mở CV' },
      {
        kind: 'list',
        items: [
          '**MỞ ĐÚNG TRANG CV CHE THÔNG TIN CÁ NHÂN CỦA SEARCH TALENT**, không phải một trang riêng. Thông tin liên hệ che y như trang `/search`.',
          '**CÓ TRỪ MỘT LƯỢT MỞ CV MIỄN PHÍ** (chốt 16/11), cùng luật với mọi lần mở CV khác. Hết lượt thì thẻ vẫn hiện, mở ra là CV che hết chi tiết — **thẻ không bao giờ bị ẩn vì hết lượt**.',
          '**LƯỢT BẤM ĐƯỢC GHI LẠI** và nuôi luật “3 lần không bấm thì loại”. NTD không có quyền tìm ứng viên thì lượt bấm không được ghi.',
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '§5 · % trên bảng ứng viên — chỗ duy nhất con số được in ra' },
      {
        kind: 'p',
        text: 'Bảng ứng viên của một job dùng **cùng phép chấm** này, cũng **chỉ trên dữ liệu tự khai**. Đây là màn hình duy nhất in phần trăm ra cho người đọc; ứng viên thì không bao giờ thấy.',
      },
      {
        kind: 'list',
        items: [
          '**SO ĐƯỢC DƯỚI 4 TRONG 7 TÍN HIỆU THÌ KHÔNG IN %.** Một con số dựng trên hai ba tín hiệu gây hiểu nhầm nặng hơn là để trống. Đây là **ngoại lệ duy nhất** của luật “thiếu dữ liệu là 0”.',
          '**Ô TRỐNG KHÔNG CÓ NGHĨA LÀ 0 %.** In nhầm thành 0 là sai nghiêm trọng: nó biến một hồ sơ chưa chấm được thành một hồ sơ bị loại.',
          '**THỨ TỰ TRÊN BẢNG KHÔNG ĐỔI** vì luật “thiếu dữ liệu là 0”: mọi ứng viên của cùng một job đều chia cho cùng một số. Chỉ **con số in ra** thấp đi, và chỉ với job khai ít.',
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
      '**Hai câu hỏi khác nhau.** *Recommended jobs* trả lời “job nào hợp với **người này**” — nó đọc CV, hồ sơ, trọng số. Con số trong wizard trả lời “có bao nhiêu job hợp với **bộ câu trả lời này**”. Lúc đó ứng viên chưa có CV, chưa lưu hồ sơ, nên câu hỏi thứ nhất chưa trả lời được.',
      '**Vì không đọc hồ sơ ai cả nên API là public** — chạy được cho khách chưa đăng nhập, và không ghi log hiển thị nào.',
      '**Luật cốt lõi: job bỏ trống một trường thì không bao giờ bị loại vì trường đó.** Chỉ loại khi job **ghi rõ** một điều trái với câu trả lời.',
      '**Chỉ hai bước có số: bước 3 và bước 4.** Bước 3 đếm trên lựa chọn của bước 1 + 2; bước 4 đếm trên bước 1 + 2 + 3. Học vấn và mức lương **không làm đổi con số nào**.',
    ],
    how: [
      'Chạy wizard onboarding trên site ứng viên (`/welcome`) và đọc câu dẫn ở **bước 3** rồi **bước 4**.',
      'Muốn kiểm con số: đếm trực tiếp trên dữ liệu theo bảng điều kiện ở §2 — **không** đối chiếu với trang tìm việc (§4).',
      'Muốn thử nhanh: gọi thẳng `GET /onboarding/job-count?roleIds=…&regionIds=…&years=…` — không cần token.',
    ],
    watch: [
      '**Số ở bước 4 bằng số ở bước 3 thì không in lại.** In lại cùng một con số làm người dùng tưởng hệ thống đứng im. Các bước khác không có số.',
      '**Bằng 0 thì không in số 0** — chỉ in câu “toàn quốc có X” nếu có. API lỗi thì in câu không có số.',
      '**Quá 500 job thì in “500+”**, không in con số thật.',
      '**Thừa kinh nghiệm không bao giờ bị loại.** Giới hạn trên trong job VN là đỉnh dải quảng cáo, không phải trần — người 10 năm vẫn đếm được job ghi cấp “Nhân viên”.',
      '**Khác trang tìm việc là đúng thiết kế** (§4), không phải lỗi. Test case yêu cầu hai con số phải khớp đã được bỏ ngày 12/11.',
    ],
    blocks: [
      { kind: 'p', text: STAMP },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '§1 · Hai con số đếm gì' },
      {
        kind: 'table',
        note: 'Mỗi banner tính trên những câu trả lời **đã xong trước bước đó** — nên con số đứng yên trong lúc ứng viên đang gõ ở bước hiện tại.',
        cols: ['Con số', 'Hiện ở', 'Đếm job khớp với'],
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
          'Job được đếm phải: **đang mở** · đã publish · chưa hết hạn · còn bật hiển thị · công ty active và công khai.',
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '§2 · Luật cốt lõi — job bỏ trống thì không bị loại' },
      {
        kind: 'warn',
        text: '**Job nào bỏ trống một trường thì KHÔNG BAO GIỜ bị loại vì trường đó. Chỉ loại khi job GHI RÕ một điều trái với câu trả lời.**',
      },
      {
        kind: 'p',
        text: 'Phần lớn job ở VN bỏ trống ngành, loại hợp đồng và dải kinh nghiệm. Nếu so khớp kiểu bằng-nhau, tất cả những job đó biến mất ngay khi ứng viên trả lời bước 3, và **N₄ = 0 với gần như mọi người** — một con số vừa sai vừa làm nản lòng đúng lúc người dùng cần được khuyến khích đi tiếp.',
      },
      {
        kind: 'table',
        note: '**AND giữa các tiêu chí, OR bên trong một tiêu chí** — chọn 3 thành phố nghĩa là job ở bất kỳ thành phố nào trong ba.',
        cols: ['Ứng viên chọn', 'Job được tính khi', 'Chỉ bị loại khi'],
        rows: [
          ['Luôn luôn', 'Job **đang mở** · đã đăng · còn bật hiển thị · công ty công khai', '—'],
          ['**Vị trí** (≤3)', 'Job thuộc **ngành nghề** của vị trí đó, **hoặc** job không gắn ngành nghề nào', 'Ngành nghề của job không nằm trong ngành nghề của các vị trí đã chọn'],
          ['**Ngành** (≤3)', 'Trùng ngành, **hoặc** job không ghi ngành — job công ty tự đăng không có ô ngành nên luôn qua', 'Job **có ghi** ngành và không nằm trong danh sách đã chọn'],
          ['**Loại hợp đồng**', 'Nằm trong tập đã chọn, **hoặc** job không khai', 'Job **có ghi** và không trùng'],
          ['**Nơi làm việc** (≤3)', 'Job **remote** (qua từ mọi nơi), **hoặc** tỉnh của job / của công ty nằm trong tập, **hoặc** job không ghi địa điểm', 'Job **có ghi** tỉnh và không tỉnh nào được chọn'],
          ['**Số năm kinh nghiệm** (chỉ N₄)', 'Quy số năm ra cấp bậc — xem đoạn dưới bảng', 'Ứng viên thấp hơn mức job yêu cầu'],
          ['Học vấn', 'Luôn được tính', '**Không** là điều kiện đếm'],
        ],
      },
      {
        kind: 'list',
        heading: 'Hai chi tiết quyết định con số',
        items: [
          '**Vị trí so ở mức ngành nghề, KHÔNG so đúng vị trí.** So đúng vị trí thì một vị trí hẹp ra con số kiểu “2 job”, và wizard biến thành một lời từ chối.',
          '**Thừa kinh nghiệm hoặc thừa cấp bậc không bao giờ bị loại.** Giới hạn trên trong job VN là đỉnh dải quảng cáo, không phải trần tuyển dụng.',
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      {
        kind: 'p',
        text: '**Kinh nghiệm đọc hai nguồn.** Job khai **dải năm** thì so thẳng với số năm ứng viên chọn. Job chỉ khai **cấp bậc** — phần lớn job tự đăng — thì quy số năm ra cấp bậc (bảng ở trang *Logic chung*) rồi mới so, và giữ job có bậc không cao hơn ứng viên quá **1 bậc**.',
      },

      { kind: 'h', text: '§3 · Con số in ra như thế nào' },
      {
        kind: 'p',
        text: '**N₄ không bao giờ lớn hơn N₃.** Lọc kiểu AND thì thêm một tiêu chí chỉ có thể **bớt** job đi. “Khớp chính xác hơn” nghĩa là *chính xác hơn*, không phải *nhiều hơn* — bản Figma vẽ con số tăng từ 2 lên 20 chỉ là **số minh hoạ**, và không có luật nào được cài để con số tăng lên.',
      },
      {
        kind: 'table',
        cols: ['Tình huống', 'Banner hiện gì'],
        rows: [
          ['N₄ < N₃', 'Con số, như thiết kế'],
          ['**N₄ = N₃**', '**Câu không có số.** Bước 4 thôi không nhận công nữa'],
          ['Dưới **5** job tại tỉnh đã chọn', 'Bỏ bộ lọc **nơi làm việc**, đếm toàn quốc, và **nói rõ trong câu**: “Chỉ có 3 job ở Đà Nẵng — **128** job trên cả nước”'],
          ['Nới rồi vẫn không có gì', 'Câu không có số'],
          ['Hơn **500** job', 'In **“500+”**, không in con số thật'],
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
          ['Bước 3', 'Ngành nghề IT (từ vị trí QA Engineer) + Đà Nẵng', '**3 job** — dưới 5 nên câu thêm con số toàn quốc: “toàn quốc có 128 việc”'],
          ['Bước 4', 'Thêm điều kiện Fulltime và 4 năm kinh nghiệm', '**3 job** — bằng bước 3 nên **không in số**'],
        ],
        note:
          'Bước 4 ra đúng bằng bước 3 vì cả ba job đều hoặc khai Fulltime, hoặc **không khai loại hợp đồng** (vẫn được giữ), và đều có dải năm bắt đầu từ ≤ 4. Đây là trường hợp bình thường, không phải lỗi đếm.',
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '§4 · Vì sao không khớp trang tìm việc' },
      {
        kind: 'table',
        note: 'Bốn khác biệt có chủ đích. Onboarding rộng hơn vì mục đích của nó là khuyến khích đi tiếp; trang tìm việc hẹp hơn vì người dùng ở đó đang thật sự tìm việc.',
        cols: ['Điểm khác', 'Banner onboarding', 'Trang tìm việc'],
        rows: [
          ['Job để trống loại hợp đồng', '**Giữ lại**', 'Loại bỏ'],
          ['Lọc ngành theo', 'Ngành của **job**', 'Ngành của **công ty**'],
          ['Job remote', '**Luôn được tính**, ở mọi tỉnh', 'Không có luật này'],
          ['Kinh nghiệm', 'Quy số năm ra **cấp bậc**', 'Không quy đổi'],
        ],
      },
      {
        kind: 'warn',
        text: 'Ticket gốc SRM-1347 từng yêu cầu con số này **kiểm chứng được bằng trang tìm việc** (test case #13). **Quyết định của BA ngày 12/11 đã bỏ yêu cầu đó** — QA kiểm bằng dữ liệu trực tiếp. Bốn khác biệt ở trên là lý do: hai bộ lọc không bao giờ ra cùng một con số.',
      },

      /* ───────────────────────────────────────────────────────────────── */
    ],
  },

  /* ─────────────────────────────────────────────────────────────────
     DẢI "VIỆC LÀM CHO {VỊ TRÍ}" — khối thứ hai của màn kết quả onboarding.
     Không phải một bộ máy gợi ý: một lượt tìm kiếm thuần. Tách khỏi
     SRM-1338 ngày 17/11 thành SRM-1596, vì nằm chung thì luật của nó bị
     đọc nhầm thành luật của Recommended jobs.
     ───────────────────────────────────────────────────────────────── */
  'onboarding-role-strip': {
    logic: [
      '**Khối này không chấm điểm.** Nó chỉ là một lượt **tìm kiếm thường**: lấy job đúng vị trí ứng viên vừa chọn, mới nhất trước. Không đọc CV, không đọc hồ sơ, không xáo trộn, không ưu tiên gói dịch vụ.',
      '**Tiêu đề in tên vị trí nào thì mọi thẻ bên dưới phải đúng vị trí đó.** *“Việc làm cho Hành chính marketing”* → bên dưới chỉ có job **Hành chính marketing**. Thẻ lạc vị trí là lỗi.',
      '**Dưới 3 job thì ẩn cả khối**, đếm sau khi đã bỏ những job khối 1 đang hiện.',
      '**Con số ở bước 3 / bước 4 của wizard đếm theo ngành nghề, còn dải này lọc theo vị trí** — nên hai con số không khớp nhau, và đó là đúng thiết kế.',
    ],
    blocks: [
      {
        kind: 'shot',
        src: '/shots/matching/onboarding-role-strip.jpg',
        where: 'Jobseeker site',
        caption: 'Màn kết quả onboarding (`/chao-mung`). Khối trong khung đỏ chính là dải *“Việc làm cho {vị trí}”* — nằm dưới lưới “những việc phù hợp nhất” và trên nút *Hoàn tất CV và ứng tuyển*.',
        note: 'Ảnh production ngày 17/11, và nó đang sai hai chỗ: tiêu đề in *Hành chính marketing* nhưng thẻ bên dưới là *Platform Operations Specialist*, và chỉ một thẻ thì lẽ ra phải ẩn cả khối.',
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '§1 · Màn kết quả có hai khối, hai nguồn khác hẳn nhau' },
      {
        kind: 'table',
        cols: ['', 'Khối 1 — “những việc phù hợp nhất”', 'Khối 2 — “Việc làm cho {vị trí}”'],
        rows: [
          ['Nguồn', 'Bộ máy **Recommended jobs** (chấm điểm)', '**Tìm kiếm thuần** trên `/jobs/search`'],
          ['Đọc gì của ứng viên', 'CV · hồ sơ · hành vi · trọng số', '**Đúng một thứ**: vị trí đã chọn ở bước 1'],
          ['Thứ tự', 'Điểm cao nhất trước', '**Mới nhất trước**'],
          ['Số thẻ', 'tối đa 30 (6/trang)', '3 thẻ một hàng, phân trang'],
          ['Ticket', 'SRM-1338', '**SRM-1596**'],
        ],
        note: 'Hai khối nằm sát nhau nên rất dễ bị đọc là một. Chúng **không** chia sẻ luật nào — ngoài việc khối 2 phải bỏ những job khối 1 đang hiện.',
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '§2 · Chỉ job đúng vị trí — không bao giờ nới lên ngành nghề' },
      {
        kind: 'p',
        text: 'Danh sách chỉ chứa job có vị trí **đúng bằng** tên in trên tiêu đề. Bản đang chạy còn đọc thêm một lượt nữa, lấy job của các vị trí **anh em cùng ngành nghề** rồi ghép vào — lượt đó bỏ.',
      },
      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '§3 · Dưới 3 job thì ẩn cả khối' },
      {
        kind: 'p',
        text: 'Đếm **sau khi** đã bỏ những job khối 1 đang hiện. Còn **0, 1 hoặc 2 job thì không vẽ gì cả** — không tiêu đề, không lưới, không khoảng trắng. Lưới ba cột đứng mỗi một thẻ trông như trang bị hỏng.',
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '§4 · Vị trí nào được in lên tiêu đề' },
      {
        kind: 'p',
        text: 'Trong tối đa 3 vị trí chọn ở bước 1, lấy vị trí **có nhiều job đang mở nhất**. Cách chọn không đổi, chỉ đổi cái đem ra đếm: đếm job của **chính vị trí đó**, không đếm cả ngành nghề như bản đang chạy. Hoà nhau → lấy vị trí ứng viên chọn trước.',
      },
      {
        kind: 'example',
        heading: 'Hai cách đếm, hai tiêu đề khác nhau',
        scenario: 'Ứng viên chọn hai vị trí ở bước 1: **Hành chính marketing** (ngành *Marketing · Truyền thông*) và **Nhân viên kinh doanh** (ngành *Kinh doanh & Thương mại*).',
        cols: ['Vị trí chọn ở bước 1', 'Job đang mở đúng vị trí đó', 'Job đang mở của cả ngành nghề'],
        rows: [
          ['Hành chính marketing', '**40**', '520'],
          ['Nhân viên kinh doanh', '25', '**1.150**'],
        ],
        note: '**Luật chốt 17/11 — đếm cột giữa:** *Hành chính marketing* có **40** job, nhiều hơn 25 → tiêu đề in **“Việc làm cho Hành chính marketing”**, bên dưới là đúng 40 job đó.\n\n**Bản đang chạy — đếm cột phải:** ngành *Kinh doanh & Thương mại* có **1.150** job, nhiều hơn 520 → tiêu đề in **“Việc làm cho Nhân viên kinh doanh”**, nhưng bên dưới chỉ có **25** job đúng vị trí đó. Chọn tiêu đề bằng một con số rồi lấp bằng một con số khác.',
      },

      /* ───────────────────────────────────────────────────────────────── */
    ],
  },
}

/* ────────────────────────────────────────────────────────────────────────────
 * Module page — the rules that would otherwise be repeated on all four pages.
 * ──────────────────────────────────────────────────────────────────────────── */

export const MATCHING_MODULE_DOCS: Record<string, ModuleDoc> = {
  Matching: {
    title: 'Matching & gợi ý — năm chỗ, năm cách tính',
    lead:
      'Trang này mô tả **cách hệ thống đang chạy trên bản build**, không phải bản yêu cầu.\n\nSaramin có **năm chỗ gợi ý việc làm**, và mỗi chỗ tính theo một cách riêng. Phần lớn câu hỏi “sao chỗ này hiện khác chỗ kia” là do nhầm hai chỗ với nhau. Bốn chỗ đầu có trang riêng; chỗ thứ năm — khối gợi ý trong email sau khi nộp đơn — mô tả ở cuối trang này.',
    headline: [
      '**Trang chi tiết job có hai khối gợi ý nằm cạnh nhau, và chúng tính theo hai cách khác nhau.** Khối trên (*Các công việc tương tự*) so **job với job**. Khối dưới (*Gợi ý việc làm cho bạn*) so **hồ sơ ứng viên với job**.',
      '**Job ứng viên đã nộp đơn thì không bao giờ hiện lại trong gợi ý** — kể cả khi đơn đã bị từ chối. Đây là lý do phổ biến nhất của câu hỏi “sao job này biến mất”.',
    ],
    blocks: [
      { kind: 'h', text: 'Năm chỗ gợi ý việc làm' },
      {
        kind: 'table',
        cols: ['Chỗ gợi ý', 'Người dùng thấy ở đâu', 'So cái gì với cái gì', 'Đọc hồ sơ?'],
        rows: [
          ['**Gợi ý việc làm cho bạn**', 'Trang cá nhân · trang chi tiết job · màn kết quả onboarding · popup sau khi nộp đơn · email hằng tuần', 'Hồ sơ ứng viên ↔ job', 'Có'],
          ['**Các công việc tương tự**', 'Carousel dưới trang chi tiết job', 'Job ↔ job', 'Không'],
          ['**Recommended talent**', 'Company Home của nhà tuyển dụng · % trên bảng ứng viên', 'Job ↔ hồ sơ ứng viên', 'Có — chỉ phần ứng viên tự khai'],
          ['**Số việc ở onboarding**', 'Câu dẫn ở bước 3 và bước 4 của wizard', 'Chỉ đếm theo bộ lọc, không chấm điểm', 'Không'],
          ['**Việc gợi ý trong email sau khi nộp đơn**', 'Email *Bạn đã ứng tuyển thành công*', 'Job ↔ job', 'Không'],
        ],
      },
      {
        kind: 'p',
        text: '**Trang chủ và trang tìm việc không có khối gợi ý cá nhân nào.**',
      },

      {
        kind: 'shot',
        src: '/shots/matching/job-detail-two-blocks.jpg',
        where: 'Jobseeker site',
        caption: 'Hai khối nằm trên cùng một trang chi tiết job, và đây là chỗ hay bị nhầm nhất. **Các công việc tương tự** ở trên so **job với job** — ai mở cũng thấy cùng danh sách. **Có thể bạn quan tâm** ở dưới là phần còn lại của chính danh sách đó (khách chưa đăng nhập); người **đã đăng nhập** thấy *Gợi ý việc làm cho bạn* ở đúng chỗ này, và khối đó mới là khối đọc hồ sơ.',
        note: 'Ảnh dev ngày 17/11. Thẻ thứ hai trong carousel là **cùng công ty, cùng tiêu đề, cùng tỉnh** với chính job đang xem — luật bỏ job trùng lẽ ra phải loại nó.',
      },

      { kind: 'h', text: 'Quy số năm kinh nghiệm ra cấp bậc' },
      {
        kind: 'p',
        text: 'Nhiều job tự đăng chỉ khai **cấp bậc**, không khai số năm. Khi đó hệ thống quy số năm của ứng viên ra cấp bậc rồi mới so. Một bảng duy nhất, dùng chung cho cả ba chỗ có so kinh nghiệm.',
      },
      {
        kind: 'table',
        note: '**Lệch 1 bậc** là “với tới được”; **lệch từ 2 bậc** là không hợp.',
        cols: ['Số năm kinh nghiệm', 'Cấp bậc'],
        rows: [
          ['Dưới 1 năm (kể cả fresher)', '2'],
          ['1 – 2 năm', '3'],
          ['3 – 4 năm', '4'],
          ['5 – 7 năm', '5'],
          ['8 – 11 năm', '6'],
          ['12 – 14 năm', '7'],
          ['Từ 15 năm', '8'],
          ['Không khai', 'Không có bậc → không so được tiêu chí kinh nghiệm'],
        ],
      },

      { kind: 'h', text: 'Việc gợi ý trong email sau khi nộp đơn' },
      {
        kind: 'p',
        text: 'Khối bốn việc nằm dưới dòng “Bạn đã ứng tuyển thành công”. Nó **không đọc hồ sơ ứng viên** — chỉ tìm job **giống job họ vừa nộp**. Vì không có trang riêng nên mô tả ở đây.',
      },
      {
        kind: 'list',
        items: [
          '**Job gốc** là job vừa nộp. Nếu nộp hàng loạt thì lấy job **chọn cuối cùng** trong lượt đó — mỗi job có kỹ năng và khu vực khác nhau nên phải chọn một job làm gốc.',
          '**Chỉ xét job chung ít nhất 1 kỹ năng và ít nhất 1 tỉnh** với job gốc.',
          '**Xếp theo bốn yếu tố**, nặng nhất là độ giống job gốc, rồi **độ công bằng giữa các công ty** — công ty đang mở càng nhiều job thì mỗi job càng nhẹ điểm, để một công ty lớn không chiếm hết bốn chỗ — rồi hạng gói dịch vụ, cuối cùng là job mới hơn.',
          '**Giữ 4 job**, sau khi bỏ mọi job ứng viên đã từng nộp và job đã đóng.',
          '**Có 1–3 job thì in đúng số đó; không có job nào thì ẩn cả khối** — phần xác nhận ứng tuyển vẫn gửi bình thường. Không có cơ chế bù cho đủ 4.',
          '**Tắt công tắc *Nhận email thông báo từ hệ thống*** (mặc định bật) là không có khối này, và cũng không có email gợi ý hằng tuần.',
        ],
      },

      {
        kind: 'p',
        text: '*Viết theo code đang chạy trên bản dev, đọc ngày 16/11/2026.*',
      },
    ],
  },
}
