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
 * WHO READS THESE PAGES. Thu settled this on 2026-11-21, the same rule the Job
 * display logic group carries: these are a USER GUIDE FOR THE CLIENT. They
 * describe the logic and nothing else. None of this belongs on them:
 *   - "Bản yêu cầu", status lines, who decided and when
 *   - ticket codes
 *   - gap statements comparing today's build to the target
 *   - internal to-do lists for the team
 * That material lives in the spec site and the PM ticket.
 *
 * VOICE, all five pages rewritten 2026-11-21 to match the Top search page:
 *   - sections are "1." "2.", plain statements, never "§1 · Bước 1 — …"
 *   - table cells are a few words; anything longer goes in a list under it
 *   - one fact per line, flat. Examples one line: "VD: … → …"
 *   - no code identifiers in reader-facing text
 *
 * Re-read from origin/dev on 2026-11-21: svn-be 86a1d09bb, svn-web 649353f24.
 * Corrected against that read: the relax step drops the PROVINCE gate only (the
 * category gate is never dropped), the pool is 30, the similar-jobs list is
 * reused for an hour at the server and fifteen minutes at the page, and the
 * job-to-job weights are 45/15/15/10/8/4/3 with the group rung at 32.
 *
 * The onboarding pages used to be written as build-vs-target comparisons. They
 * now state the agreed rule as the single truth, the way Top search does; the
 * build gap lives in the spec site and the ticket.
 */
import type { PageDoc, ModuleDoc } from '../docs'

export const MATCHING_PAGE_DOCS: Record<string, PageDoc> = {
  /* ────────────────────────────────────────────────────────────────────────── */
  'recommended-jobs': {
    blocks: [
      {
        kind: 'p',
        text: 'Hệ thống gợi ý việc làm làm ba việc, theo đúng thứ tự: chọn ra nhóm job để xét, chấm điểm từng job, rồi hiện ra những job điểm cao nhất. Trang này đi qua ba bước đó.',
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '1. Bước 1 — Chọn ra nhóm job để xét' },
      {
        kind: 'p',
        text: 'Bước này đọc **Work preference** — phần ứng viên tự khai lúc đăng ký hoặc sửa trong hồ sơ — **cộng thêm** những gì hệ thống học được từ hành vi 90 ngày gần nhất. Không đọc tỉnh ứng viên đang sống.',
      },
      {
        kind: 'table',
        cols: ['Hệ thống đọc gì', 'Lọc thế nào'],
        rows: [
          ['**Vị trí mong muốn** — tối đa 3 **job role**', 'Lấy **job category** của từng job role đó, rồi giữ mọi job thuộc các job category ấy'],
          ['**Địa điểm mong muốn**', 'Giữ job ở các tỉnh đó. Job **remote** luôn được giữ, dù ở tỉnh nào'],
          ['**Hành vi 90 ngày** — nộp đơn 1 job, lưu 1 job, hoặc mở xem 3 job khác nhau', 'Cộng job category và tỉnh của những job đó vào tập lọc ở trên. Tối đa 3 job role · 3 job category · 3 tỉnh hay gặp nhất'],
          ['**Không khai gì, chưa có hành vi gì**', '**Không lọc gì.** Lấy toàn bộ job đang tuyển'],
        ],
      },
      {
        kind: 'warn',
        text: '**Lọc theo job category, KHÔNG lọc theo job role.** Ứng viên khai *Senior Frontend Engineer* thì hệ thống lấy **mọi job thuộc job category Lập trình / Phần mềm** — Backend, QA, DevOps đều vào, không chỉ job tên Frontend.\n\nLý do: lọc đúng job role thì một người ở vị trí hẹp chỉ còn vài job. Job role được dùng ở **bước chấm điểm**, nơi nó đáng giá nhiều điểm nhất.',
      },
      {
        kind: 'list',
        heading: 'Ba luật còn lại của bước lọc',
        items: [
          '**Lọc xong còn dưới 6 job thì nới theo hai bước.** Bỏ điều kiện tỉnh, chạy lại; vẫn dưới 6 thì bỏ cả điều kiện job category. Riêng **trang chi tiết job không bao giờ nới** — dưới 6 job thì ẩn hẳn phần gợi ý.',
          '**Job trùng nhau chỉ tính một.** Cùng công ty, cùng tiêu đề, cùng tỉnh là một tin đăng hai lần — giữ job mới đăng nhất.',
          '**Còn hơn 500 job thì chỉ 500 job được chấm.** Ưu tiên job trùng job role ứng viên quan tâm, sau đó job mới đăng.',
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '2. Bước 2 — Chấm điểm, thang 100' },
      {
        kind: 'p',
        text: 'Mỗi job còn lại được so với ứng viên trên **7 tiêu chí**. Càng khớp càng nhiều điểm. **Không có điểm sàn** — điểm chỉ quyết định thứ tự, không loại job nào. Thiếu dữ liệu để so thì tiêu chí đó bằng **0**, và thang điểm **không** chia lại.',
      },
      {
        kind: 'table',
        cols: ['Tiêu chí', 'Điểm', 'Được tối đa khi', 'Các nấc thấp hơn'],
        rows: [
          ['**Job role & job category**', '**42**', 'Job đúng **job role** ứng viên khai', 'Cùng nhóm nghề → **30** · cùng **job category** → **17** · khác → **0**'],
          ['**Địa điểm & job type**', '**20**', 'Đúng tỉnh **và** đúng job type. Job **remote** luôn được 20', 'Đúng tỉnh, khác job type → **14** · tỉnh lân cận → **10** · khác → **0**'],
          ['**Kinh nghiệm**', '**14**', 'Số năm của ứng viên nằm trong dải job yêu cầu, hoặc job ghi *không yêu cầu*', 'Thừa ≤ 2 năm → **10** · thiếu ≤ 1 năm → **7** · thừa > 2 năm → **5** · thiếu > 1 năm → **0**'],
          ['**Lương**', '**12**', 'Lương mong muốn nằm trong dải job trả, hoặc job trả cao hơn', 'Đòi hơn ≤ 10 % → **8** · hơn 10–20 % → **4** · một bên ghi *Thỏa thuận* → **6** · hơn 20 % → **0**'],
          ['**Industry**', '**5**', 'Trùng industry ứng viên khai', 'Cùng ngành cha → **3** · khác → **0**'],
          ['**Kỹ năng**', '**4**', 'CV có đủ kỹ năng job yêu cầu', 'Khớp một phần → chia theo tỷ lệ. Kỹ năng **bắt buộc** tính đôi'],
          ['**Học vấn**', '**3**', 'Đạt yêu cầu, hoặc job ghi *không yêu cầu*', 'Thấp hơn 1 bậc → **1** · còn lại → **0**'],
          ['**Tổng**', '**100**', '', ''],
        ],
      },
      {
        kind: 'list',
        heading: 'Ba luật cần nhớ',
        items: [
          '**Tự khai ăn điểm đầy đủ, hệ thống tự đoán chỉ ăn 80 %.** Job khớp job role ứng viên **tự khai** được **42**; job khớp job role hệ thống **đoán ra từ hành vi** được **34**. Các nấc khác cũng vậy: 30 → 24, 20 → 16, 17 → 14.',
          '**Hai nguồn dùng cùng lúc, không thay nhau.** Không phải cứ không khai mới lấy hành vi — khai rồi thì hành vi vẫn được cộng thêm vào. Riêng **industry** thì không có nhánh đoán: chỉ lấy đúng ô *Ngành mong muốn*.',
          '**Ứng viên có nhiều CV thì chấm từng CV**, mỗi job giữ điểm cao nhất trong các CV. Không gộp CV lại.',
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '3. Bước 3 — Chọn job để hiện' },
      {
        kind: 'list',
        items: [
          'Giữ **30 job điểm cao nhất**.',
          '**Một công ty tối đa 3 job**, và hai job cùng công ty cách nhau ít nhất **6 vị trí** — nên dải 6 thẻ không bao giờ có hai job cùng công ty. Luật này áp ở onboarding, trang cá nhân và trang chi tiết job; **popup sau khi nộp đơn không áp**.',
          '**Ở những màn có xáo trộn, job đúng job role ứng viên khai luôn đứng trước** job chỉ cùng job category — dù job kia hơn điểm lương hay địa điểm. Xáo trộn chỉ diễn ra **bên trong từng nấc** ấy. Đây là phép sắp xếp, không loại job nào.',
          '**Thứ tự ổn định trong ngày.** Thứ tự được gieo theo ứng viên + ngày + màn hình, nên ba màn hình không bao giờ ra cùng một bộ thẻ, tải lại trang không đổi, và sang hôm sau mới đảo bộ khác.',
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '4. Gợi ý hiện ra ở đâu' },
      {
        kind: 'table',
        note: 'Cùng một phép tính, chỉ khác số thẻ và cách sắp. Ứng viên **không bao giờ** thấy điểm, % phù hợp hay lý do khớp trên thẻ.',
        cols: ['Nơi hiển thị', 'Ai thấy', 'Số thẻ', 'Thứ tự'],
        rows: [
          ['**Onboarding** — *những việc phù hợp nhất*', 'Ứng viên vừa xong wizard', 'tối đa 30, mỗi trang 6 thẻ — nhiều nhất 5 trang', 'Đúng thứ tự điểm'],
          ['**Trang cá nhân** — *Việc làm phù hợp với bạn*', 'Đã đăng nhập', '6, carousel hiện 3 thẻ một lúc', 'Xáo trộn theo ngày, nhưng job đúng job role vẫn lên trước'],
          ['**Chi tiết job** — *Gợi ý việc làm cho bạn*', 'Đã đăng nhập', '6', 'Như trên, và bỏ hết job đang hiện ở phần *Similar jobs* ngay trên'],
          ['**Chi tiết job** — *Có thể bạn quan tâm*', 'Chưa đăng nhập', '6', 'Lấy tiếp dòng 7–12 của *Similar jobs* — không chấm điểm theo người, vì hệ thống chưa biết họ là ai'],
          ['**Popup sau khi nộp đơn**', 'Người vừa nộp đơn', 'tối đa 30', 'Đúng thứ tự điểm. Không giới hạn số job một công ty — chỉ không để hai job cùng công ty đứng liền nhau'],
          ['**Email gợi ý hằng tuần**', 'Ứng viên chưa tắt công tắc nhận mail', '6', 'Đúng thứ tự điểm, và không gửi lại job đã nằm trong email trước'],
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '5. Một ví dụ' },
      {
        kind: 'example',
        heading: 'Linh và ba job',
        scenario:
          '**Linh** khai trong Work preference: job role **Marketing Executive**, job category **Marketing**, địa điểm **Hồ Chí Minh**, lương **20 triệu**. Hồ sơ ghi **3 năm** kinh nghiệm, CV có 3 kỹ năng và bằng **Đại học**. Cô **không khai industry**. Trong 90 ngày qua cô nộp đơn 1 job *Chuyên viên Marketing* và lưu 1 job *Content Marketing*.',
        cols: ['Tiêu chí', 'A · Content Marketing · HCM', 'B · Chuyên viên MKT · Bình Dương', 'C · Marketing Executive · HCM'],
        rows: [
          ['Job role · 42', 'Đúng job role, nhưng hệ thống **đoán ra** từ job đã lưu → **34**', 'Đoán ra từ job đã nộp → **34**', 'Đúng job role Linh **tự khai** → **42**'],
          ['Địa điểm · 20', 'HCM, tự khai → **20**', 'Bình Dương, đoán ra → **16**', 'HCM → **20**'],
          ['Kinh nghiệm · 14', '**14**', '**14**', 'Thừa 1 năm → **10**'],
          ['Lương · 12', '**12**', '**12**', 'Trả thấp hơn 25 % → **0**'],
          ['Industry · 5', 'Không khai → **0**', '**0**', '**0**'],
          ['Kỹ năng · 4', 'Khớp 2/3 → **2,7**', 'Khớp đủ → **4**', 'Không khớp → **0**'],
          ['Học vấn · 3', '**3**', 'Job không khai → **0**', '**3**'],
          ['**Tổng**', '**86**', '**80**', '**75**'],
        ],
        note:
          '**Ba điều đọc ra từ ví dụ này.** Job C chỉ được 75 điểm dù nó là **đúng job role Linh tự gõ vào** — trả lương hụt 25 % và không một kỹ năng chung kéo nó xuống. Job B có mặt trong danh sách **chỉ nhờ hành vi**: Bình Dương không nằm ở đâu trong Work preference của Linh. Và cả ba job đều 0 điểm industry vì Linh bỏ trống ô đó — một ô trống bên phía ứng viên trừ **mọi job như nhau**, nên thứ tự không hề đổi.',
      },
    ],
  },

  /* ────────────────────────────────────────────────────────────────────────── */
  'similar-jobs': {
    blocks: [
      {
        kind: 'p',
        text: 'Carousel **Các công việc tương tự** nằm trên trang chi tiết job. Nó so **job với job** — không đọc hồ sơ người xem, nên **mọi người đều thấy cùng một danh sách** cho cùng một job: khách chưa đăng nhập cũng thấy y hệt người đã đăng nhập.\n\nTrang này nói: lấy job nào, chấm theo bảng nào, khi nào đổi tiêu đề, và người đã đăng nhập thấy khác gì.',
      },
      {
        kind: 'shot',
        src: '/shots/matching/job-detail-two-blocks.jpg',
        where: 'Jobseeker site',
        caption: 'Carousel **Các công việc tương tự** là khối trên — đó là thứ trang này mô tả.',
        note: 'Khối ngay dưới chạy theo luật khác hẳn. Xem mục 5.',
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '1. Tóm lại' },
      {
        kind: 'table',
        cols: ['Hạng mục', 'Hệ thống chạy thế nào'],
        rows: [
          ['So cái gì với cái gì', '**Job đang xem** với **mọi job đang sống** trên site'],
          ['Có đọc hồ sơ người xem không', 'Không'],
          ['Có lọc theo nghề không', '**Không.** Mọi job đều được chấm'],
          ['Bảng điểm', '7 tiêu chí, tổng **100 điểm** — **khác** bảng của Recommended jobs'],
          ['Một công ty', 'Tối đa **2 job**'],
          ['Giữ lại', '**20 job**, giao diện lấy 6 thẻ cho carousel'],
          ['Khi không job nào thật sự giống', 'Đổi tiêu đề, **vẫn hiện đủ 6 thẻ**'],
          ['Làm mới', 'Danh sách dùng lại trong **1 giờ**, trang dùng lại trong **15 phút**'],
        ],
      },
      {
        kind: 'list',
        heading: 'Hai điều dễ hiểu nhầm',
        items: [
          '**Đây là bảng điểm riêng.** Đừng dùng bảng của *Recommended jobs* để giải thích kết quả ở đây. Hai bảng khác trọng số, khác câu hỏi.',
          '**Sửa nội dung một job không làm danh sách đổi ngay.** Phải chờ hết thời gian dùng lại — chậm nhất khoảng **75 phút**.',
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '2. Lấy job nào ra chấm' },
      {
        kind: 'list',
        items: [
          'Lấy **mọi job đang sống** trên site. **Không có điều kiện cùng nghề**, không giới hạn theo ngày đăng.',
          '**Luôn loại:** chính job đang xem · job đã đóng hoặc hết hạn · job tắt hiển thị · công ty không còn hoạt động.',
          'Job gốc phải đang **mở hoặc đã đóng** và còn bật hiển thị. Không thì trang trả về **404**.',
          'Chấm xong thì **bỏ job trùng** — cùng công ty, cùng tiêu đề, cùng tỉnh.',
          '**Tối đa 2 job một công ty.** Giới hạn, không loại hẳn: một công ty có thể là đơn vị tuyển chính trong một ngách hẹp.',
          'Sắp theo **điểm ↓ → ngày đăng ↓**, giữ **20 job**.',
          '**Không có điểm sàn.** Danh sách luôn đủ 6 thẻ chừng nào thị trường còn 6 job.',
        ],
      },
      {
        kind: 'p',
        text: 'Không lọc theo nghề là **chủ ý**. Bắt buộc cùng nghề sẽ có những job **không có việc tương tự nào để hiện**, và một khối rỗng là kết cục tính năng này không được phép tạo ra. Chấm hết mọi job thì không bao giờ rỗng: một job không có gì cùng nghề vẫn ăn điểm địa điểm, cấp bậc, lương và hình thức — thành ra *cùng thành phố, cùng cấp bậc, lương tương đương*.',
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '3. Bảng điểm job ↔ job' },
      {
        kind: 'table',
        note: 'Trọng số **cố định**, admin không chỉnh được. Thiếu dữ liệu ở **bất kỳ phía nào** là 0 điểm, không chia lại thang.',
        cols: ['Tiêu chí', 'Tối đa', 'Các bậc'],
        rows: [
          ['**Vị trí & nghề**', '**45**', 'Cùng vị trí **45** · cùng nhóm vị trí **32** · cùng nghề **18** · khác nghề **0**'],
          ['**Cấp bậc**', '**15**', 'Cùng bậc **15** · lệch 1 bậc **9** · lệch 2 bậc **4** · từ 3 bậc **0**'],
          ['**Địa điểm**', '**15**', 'Cùng tỉnh, hoặc một bên là job remote **15** · khác tỉnh **0**'],
          ['**Lương**', '**10**', 'Hai dải giao nhau **10** · lệch trong 20 % **5** · không giao **0**. Quy về lương tháng và quy đổi tiền tệ trước khi so'],
          ['**Kỹ năng**', '**8**', '8 × (số kỹ năng chung ÷ số kỹ năng của **job đang xem**)'],
          ['**Ngành**', '**4**', 'Cùng ngành **4** · cùng nhóm ngành cha **2**'],
          ['**Hình thức làm việc**', '**3**', 'Cùng hình thức **3** · remote ↔ hybrid **2**'],
        ],
      },
      {
        kind: 'list',
        items: [
          '**Job đăng nhiều vị trí lấy quan hệ mạnh nhất, không lấy trung bình.** Job liệt kê năm vị trí không bị phạt vì đăng rộng, và cũng không tự nâng điểm bằng cách liệt kê thêm.',
          '**Job khai càng ít thì trần điểm càng thấp**, nên danh sách của nó hay rơi vào tiêu đề *Việc làm khác tại {tỉnh}* hơn.',
          '**Không vào điểm:** quy mô công ty · phúc lợi · học vấn · loại hợp đồng · **tuổi job**. Tuổi job chỉ dùng để phá hoà khi hai job bằng điểm.',
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '4. Khi không tìm được job nào thật sự giống' },
      {
        kind: 'list',
        items: [
          'Job cao điểm nhất vẫn **dưới 40** → tiêu đề đổi thành **“Việc làm khác tại {tỉnh}”**.',
          '**Vẫn hiện đủ 6 thẻ.** Không ẩn khối, không giảm số thẻ. Chỉ lời hứa trong tiêu đề là thay đổi.',
          'Dưới 40 điểm nghĩa là nghề gần như không đóng góp gì, các thẻ chỉ còn được gắn với nhau bằng địa điểm và cấp bậc.',
          'Ứng viên **không bao giờ thấy điểm**.',
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '5. Khối ngay dưới carousel' },
      {
        kind: 'table',
        cols: ['Người xem', 'Khối thứ hai là gì', 'Lấy từ đâu'],
        rows: [
          ['**Đã đăng nhập**', '*Gợi ý việc làm cho bạn*', 'Bộ máy **Recommended jobs** — so hồ sơ với job'],
          ['**Chưa đăng nhập**', '*Có thể bạn quan tâm*', '**Dòng 7–12 của chính danh sách này**'],
        ],
        note: 'Hai khối **không bao giờ trùng job**: carousel lấy trước, khối dưới bỏ các job đã hiện.',
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '6. Người đã đăng nhập thấy gì' },
      {
        kind: 'p',
        text: 'Người đã đăng nhập không nên được mời một việc họ đã nộp đơn. Hệ thống **bớt các dòng đó đi**. Không đổi gì khác: cùng điểm, cùng thứ tự, cùng thẻ.',
      },
      {
        kind: 'table',
        cols: ['Người đọc', 'Thấy gì'],
        rows: [
          ['Chưa đăng nhập', 'Toàn bộ danh sách. Hệ thống không biết họ là ai'],
          ['Đã đăng nhập, chưa nộp job nào trong đó', 'Giống hệt mọi người'],
          ['Đã đăng nhập, đã nộp một vài job trong đó', 'Cùng danh sách, trừ những job đó. Phần còn lại giữ nguyên vị trí'],
        ],
      },
      {
        kind: 'list',
        items: [
          'Server gửi **một danh sách dùng chung** cho tất cả mọi người. **Trình duyệt** mới là chỗ bỏ các dòng của riêng người đọc — lọc ở server sẽ biến mỗi trang chi tiết job thành một trang riêng cho từng người.',
          'Giao diện xin **khoảng 12 dòng** cho một hàng 6 thẻ, nên bỏ vài dòng thì hàng vẫn đầy.',
          '**Thẻ không biến mất trước mắt người đọc:** hàng chỉ được vẽ sau khi đã biết họ nộp những job nào.',
          '**Job đã rút đơn hiện lại ở carousel này** và nộp lại được, trong khi ở *Recommended jobs* và các email thì vẫn bị ẩn. Cùng một job có thể thấy ở chỗ này mà không thấy ở chỗ kia.',
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '7. Ví dụ chạy thật' },
      {
        kind: 'example',
        heading: 'Người đọc đang xem một job Senior Frontend Engineer',
        scenario:
          'Job đang xem: **Senior Frontend Engineer · FPT Software · Hồ Chí Minh · Senior · IT/Phần mềm · 30–45 triệu**, khai **5 kỹ năng**: React · TypeScript · Git · Docker · AWS. Con số 5 này là mẫu số của tiêu chí kỹ năng.',
        cols: ['Job ứng viên', 'Vị trí 45', 'Cấp bậc 15', 'Địa điểm 15', 'Lương 10', 'Kỹ năng 8', 'Ngành 4 + HT 3', 'Tổng'],
        rows: [
          ['**React Developer** · Tiki · HCM · Senior · 32–48tr · chung React, TypeScript, Git', 'cùng vị trí **45**', '**15**', '**15**', '**10**', '3/5 → **4,8**', '**7**', '**97**'],
          ['**Frontend Engineer** · VNG · **Hà Nội** · Senior · 30–45tr · chung React, TypeScript', 'cùng vị trí **45**', '**15**', 'khác tỉnh **0**', '**10**', '2/5 → **3,2**', '**7**', '**80**'],
          ['**Frontend Intern** · Base.vn · HCM · **Intern** · 8–12tr · chung React', 'cùng vị trí **45**', 'lệch 3 bậc **0**', '**15**', 'không giao **0**', '1/5 → **1,6**', '**7**', '**69**'],
          ['**Backend Engineer** · Shopee · HCM · Senior · 30–45tr · chung Docker', 'cùng nghề **18**', '**15**', '**15**', '**10**', '1/5 → **1,6**', '**7**', '**67**'],
          ['**Data Engineer** · MoMo · HCM · Senior · 35–50tr · chung AWS', 'cùng nghề **18**', '**15**', '**15**', '**10**', '1/5 → **1,6**', '**7**', '**67**'],
          ['**Kế toán trưởng** · VNG · HCM · Manager · 30–45tr · không chung gì', 'khác nghề **0**', 'lệch 1 bậc **9**', '**15**', '**10**', '**0**', '**3**', '**37**'],
        ],
        note:
          '**Ba điều rút ra. (1)** Job **Intern** (69) vượt Backend và Data Engineer (67) dù lương chỉ bằng một phần năm: **cùng vị trí và cùng thành phố thắng cùng nghề**. **(2)** Shopee và MoMo bằng điểm nhau, phải phá hoà bằng ngày đăng — vì bậc *cùng nhóm vị trí* (32 điểm) hiện chưa chạy được, nên Backend Engineer chỉ ăn 18 như Data Engineer. **(3)** Job **Kế toán trưởng** vẫn nằm trong danh sách ở 37 điểm, và đó là cố ý: nếu thị trường chỉ có sáu job này thì người đọc vẫn thấy sáu thẻ. Khi có năm chục job IT thì nó không bao giờ xuất hiện.',
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '8. Câu hỏi hay gặp' },
      {
        kind: 'list',
        items: [
          '**Bậc “cùng nhóm vị trí” (32 điểm) hiện chưa đạt được** vì dữ liệu phân nhóm ba tầng chưa có. Thực tế thang vị trí chạy hai bậc: cùng vị trí **45**, hoặc cùng nghề **18**.',
          '**Vì sao hai khối cạnh nhau cho kết quả khác nhau?** Carousel so job với job; khối dưới so hồ sơ với job. Hai câu hỏi khác nhau thì hai câu trả lời khác nhau.',
          '**Vì sao một job cũ đứng trên một job mới?** Tuổi job không ăn điểm. Một job cũ nhưng giống hệt vẫn đứng trên một job mới nhưng khác ngành.',
        ],
      },

    ],
  },

  /* ────────────────────────────────────────────────────────────────────────── */
  'recommended-candidates': {
    blocks: [
      {
        kind: 'p',
        text: 'Khối **Recommended talent** nằm trên Company Home của site nhà tuyển dụng. Nó gợi ý ứng viên cho **một tin tuyển dụng cụ thể** — không phải cho một thư mục talent pool.\n\nTrang này nói: khối neo vào tin nào, ai được đem ra chấm, chấm xong chọn ai hiện, và khi không ai đạt thì khối làm gì.',
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '1. Tóm lại' },
      {
        kind: 'table',
        cols: ['Hạng mục', 'Hệ thống chạy thế nào'],
        rows: [
          ['Neo vào', 'Một **tin tuyển dụng**, chọn từ dropdown'],
          ['Đọc gì của ứng viên', '**Chỉ dữ liệu tự khai** — hồ sơ và CV'],
          ['Bảng điểm', 'Cùng bảng 7 tiêu chí / 100 điểm của *Recommended jobs*'],
          ['Điểm sàn', '**40.** Không ai đạt → khối đổi sang *Hồ sơ mới cập nhật*'],
          ['Giữ lại', '**30 người** điểm cao nhất, bốc ra **3 thẻ**'],
          ['Đổi thẻ', 'Mỗi ngày một lần'],
          ['Bấm vào thẻ', 'Trừ **một lượt mở CV**'],
        ],
      },
      {
        kind: 'list',
        heading: 'Hai điều dễ hiểu nhầm',
        items: [
          '**Thư mục talent pool không sinh ra danh sách này.** Thư mục chỉ có tên và ngày tạo — không vị trí, không cấp bậc, không địa điểm, nên không có gì để so. Thư mục là nơi **lưu** kết quả, không phải đề bài.',
          '**Hành vi của ứng viên không bao giờ sang phía nhà tuyển dụng.** Việc họ xem job gì, lưu job gì, nộp đơn ở đâu là dữ liệu cá nhân, chỉ dùng để xếp danh sách gợi ý của chính họ.',
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '2. Khối neo vào tin nào' },
      {
        kind: 'p',
        text: 'Nhà tuyển dụng chọn tin từ dropdown. Không chọn thì hệ thống lấy **tin thật nhất**, không phải tin mới nhất: **trạng thái quyết định bậc, trong cùng bậc thì tin sửa gần nhất thắng**.',
      },
      {
        kind: 'table',
        cols: ['Ưu tiên', 'Trạng thái tin', 'Vì sao nằm ở bậc này'],
        rows: [
          ['**1**', '**Đang mở**, chưa quá hạn', 'Đang tuyển thật. Ai hiện ra cho tin này thì liên hệ được ngay hôm nay'],
          ['**2**', '**Hẹn đăng**', 'Đã chốt và duyệt xong, chỉ còn chờ tới ngày'],
          ['**3**', '**Nháp**', 'Có thể không bao giờ đăng, nhưng vẫn hơn là không có gì để neo'],
          ['—', '**Đã đóng**', '**Không bao giờ neo.** Tin đã đóng thì không còn tuyển'],
          ['—', 'Không có tin nào ở cả ba bậc', 'Tiêu đề đổi thành **Hồ sơ mới cập nhật** — xem mục 5'],
        ],
      },
      {
        kind: 'list',
        items: [
          '**Trong cùng một bậc, sắp theo lần sửa cuối — không phải ngày tạo.** Công ty có hai mươi tin đang mở sẽ không hiểu vì sao *tin mới nhất* được chọn, còn *tin bạn vừa sửa* thì tự giải thích.',
          '**Tin đang mở nhưng quá hạn bị coi như đã đóng** và rơi khỏi bậc 1.',
          '**Tiêu đề khối in tên tin**, để nhà tuyển dụng thấy ngay danh sách này đang trả lời cho tin nào.',
          '**Tin tắt hiển thị vẫn neo bình thường.** Cờ hiển thị chỉ ẩn tin khỏi *ứng viên*; đây là dashboard của chính công ty.',
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '3. Ai được đem ra chấm' },
      {
        kind: 'p',
        text: 'Trước khi chấm, tập người được thu về những ai **có khả năng là ứng viên của tin này**. Lấy một người khi **bất kỳ** điều nào sau đây đúng, rồi cắt còn **500 người**.',
      },
      {
        kind: 'table',
        note: 'Là **hoặc**, không phải **và**.',
        cols: ['Đọc từ tin', 'So với ứng viên'],
        rows: [
          ['Mọi **vị trí** gắn trên tin', '**Vị trí mong muốn** của ứng viên (tối đa 3)'],
          ['**Nghề** của tin', '**Nghề mong muốn** trên hồ sơ'],
          ['**Kỹ năng** của tin', '**Kỹ năng trên CV** của ứng viên'],
        ],
      },
      {
        kind: 'list',
        items: [
          '**Không có bước này thì điểm số cho người lạ lọt qua.** Địa điểm 20 + kinh nghiệm 14 + lương 12 là **46**, đã trên sàn 40 — một người cùng thành phố, đúng số năm, đúng mức lương sẽ đủ điểm cho một tin thuộc ngành hoàn toàn không liên quan.',
          '**Là “hoặc” vì đây là gợi ý, không phải tìm kiếm.** Quăng lưới rộng rồi để điểm số xếp hạng. Dùng “và” thì gần như không ra ai.',
          '**Khớp cả thứ họ muốn lẫn thứ họ làm được.** Vị trí và nghề mong muốn nói họ đang tìm gì; kỹ năng trên CV nói họ làm được gì.',
          '**Tin nháp sơ sài tự giải quyết.** Tin không vị trí, không nghề, không kỹ năng thì không khớp ai → danh sách rỗng → khối rơi xuống chế độ ở mục 5. Không cần luật riêng cho tin nháp.',
          '**Người đã bị bỏ qua 3 lần rời tập trước khi cắt 500**, không phải sau.',
          '**Ứng viên gõ tay kỹ năng không khớp master data thì nhánh kỹ năng không chạy cho họ.** Họ phải khai vị trí hoặc nghề mới vào được vòng chấm — mất nhiều hơn hẳn 4 điểm kỹ năng.',
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '4. Chấm xong thì chọn ai hiện' },
      {
        kind: 'list',
        items: [
          'Chấm bằng **cùng bảng 7 tiêu chí** của *Recommended jobs*, chỉ trên dữ liệu tự khai.',
          '**Tiêu chí mà tin không khai thì mọi ứng viên đều 0 điểm ở đó**, và số điểm đó không chia sang tiêu chí khác. Một tin sơ sài **cố ý** có trần điểm thấp.',
          '**Giữ 30 người điểm cao nhất**, rồi bốc **3 người** theo công ty và ngày. Cùng ba người đó suốt cả ngày — nhà tuyển dụng thấy một người sáng nay thì chiều phải tìm lại được.',
          '**Trong ba thẻ vẫn sắp theo điểm.** Phép bốc quyết định **ai** xuất hiện, không quyết định **thứ tự**.',
          '**Người đã hiện 3 lần mà không ai bấm bị loại trước khi bốc**, không phải sau.',
          '**Chỉ hai người qua sàn thì hiện hai thẻ.** Không bù thêm người dưới sàn cho đủ hàng — đó đúng là thứ điểm sàn sinh ra để chặn.',
          '**Ai được phép xuất hiện:** ứng viên cho phép nhà tuyển dụng tìm thấy mình · CV **Đạt** · **chưa nằm trong talent pool** của công ty.',
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '5. Khi không ai đạt sàn — “Hồ sơ mới cập nhật”' },
      {
        kind: 'p',
        text: 'Người cao điểm nhất dưới **40** thì khối **vẫn hiện**, nhưng **tiêu đề đổi**. Vấn đề chưa bao giờ là hiện người trong khi không có tin; vấn đề là **hứa một kết quả khớp mà thực ra không có**.',
      },
      {
        kind: 'table',
        cols: ['Bước', 'Luật'],
        rows: [
          ['1 · Lọc', 'Các điều kiện cứng ở mục 4. Ngoài những người đó ra, không ai được hiện'],
          ['2 · Ưu tiên', 'Người có ngành hoặc nghề mong muốn trùng **ngành của chính công ty** lên trước'],
          ['3 · Sắp xếp', 'CV cập nhật gần nhất trước — CV mới nghĩa là người đang thật sự tìm việc'],
          ['4 · Dàn đều', '**Mỗi nghề một người**, không thì cả hàng ra ba bạn cùng một nghề'],
          ['5 · Xoay vòng', 'Hằng ngày, cùng luật chọn ba người như chế độ chấm điểm'],
        ],
      },
      {
        kind: 'list',
        items: [
          '**Không nhãn Top pick, không phần trăm ở chế độ này.** Ở đây không có điểm, nên một nhãn độ khớp sẽ là một lời nói dối.',
          '**Đừng dùng số năm kinh nghiệm làm thước đo chất lượng**, và tuyệt đối không dùng tuổi hay giới tính. Nhiều năm hơn không phải là tốt hơn, chỉ là khác.',
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '6. Bấm vào thẻ' },
      {
        kind: 'list',
        items: [
          'Mở **đúng trang CV che thông tin cá nhân** của Search talent, không phải một trang riêng. Thông tin liên hệ che y như khi tìm ứng viên.',
          '**Trừ một lượt mở CV miễn phí**, cùng luật với mọi lần mở CV khác.',
          'Hết lượt thì thẻ **vẫn hiện**, mở ra là CV che hết chi tiết. **Thẻ không bao giờ bị ẩn vì hết lượt.**',
          '**Lượt bấm được ghi lại** và nuôi luật *3 lần không bấm thì loại*. Nhà tuyển dụng không có quyền tìm ứng viên thì lượt bấm không được ghi.',
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '7. Phần trăm trên bảng ứng viên' },
      {
        kind: 'p',
        text: 'Bảng ứng viên của một tin dùng **cùng phép chấm** này, cũng chỉ trên dữ liệu tự khai. Đây là màn hình **duy nhất in phần trăm** ra cho người đọc — ứng viên thì không bao giờ thấy.',
      },
      {
        kind: 'list',
        items: [
          '**So được dưới 4 trong 7 tiêu chí thì không in %.** Một con số dựng trên hai ba tiêu chí gây hiểu nhầm nặng hơn là để trống.',
          '**Ô trống không có nghĩa là 0 %.** In nhầm thành 0 biến một hồ sơ chưa chấm được thành một hồ sơ bị loại.',
          '**Thứ tự trên bảng không đổi vì luật thiếu dữ liệu là 0:** mọi ứng viên của cùng một tin đều chia cho cùng một số. Chỉ **con số in ra** thấp đi, và chỉ với tin khai ít.',
          '**Đơn đã rút không còn trên bảng.**',
          '**Kỹ năng trong CV không khớp master data tính là “không có kỹ năng”** — mất điểm tiêu chí kỹ năng, và vẫn tính là một tiêu chí đã so được.',
        ],
      },

    ],
  },

  /* ────────────────────────────────────────────────────────────────────────── */
  'onboarding-job-count': {
    blocks: [
      {
        kind: 'p',
        text: 'Trong wizard onboarding, câu dẫn ở **bước 3** và **bước 4** in ra một con số: *có bao nhiêu việc làm khớp với những gì bạn vừa chọn*.\n\nĐây là một **phép đếm**, không phải một phép chấm điểm. Không trọng số, không xếp hạng, không thẻ việc làm — chỉ một con số.',
      },
      {
        kind: 'list',
        heading: 'Không phải cùng một câu hỏi với Recommended jobs',
        items: [
          '*Recommended jobs* trả lời **“job nào hợp với người này”** — nó đọc CV, hồ sơ, trọng số.',
          'Con số trong wizard trả lời **“có bao nhiêu job hợp với bộ câu trả lời này”**. Lúc đó ứng viên chưa có CV, chưa lưu hồ sơ.',
          'Vì không đọc hồ sơ ai cả nên con số này **chạy được cho cả khách chưa đăng nhập**.',
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '1. Hai con số đếm gì' },
      {
        kind: 'table',
        note: 'Mỗi con số tính trên những câu trả lời **đã xong trước bước đó**, nên nó đứng yên trong lúc ứng viên đang gõ ở bước hiện tại.',
        cols: ['Con số', 'Hiện ở', 'Đếm job khớp với'],
        rows: [
          ['**Số thứ nhất**', 'Bước 3 — số năm kinh nghiệm', 'Vị trí · ngành · loại hợp đồng · nơi làm việc — tức **bước 1 + 2**'],
          ['**Số thứ hai**', 'Bước 4 — trình độ học vấn', 'Như trên, **cộng số năm kinh nghiệm** — bước 1 + 2 + **3**'],
        ],
      },
      {
        kind: 'list',
        items: [
          '**Học vấn và mức lương không làm đổi con số nào.** Chúng được trả lời ở bước 4 và 5, sau đó không còn câu dẫn nào nữa.',
          '**Không có luật “đã ứng tuyển”** như ở Recommended jobs — ứng viên vừa đăng ký vài phút trước.',
          'Job được đếm phải **đang mở** · đã đăng · chưa hết hạn · còn bật hiển thị · công ty đang hoạt động và công khai.',
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '2. Luật cốt lõi — job bỏ trống thì không bị loại' },
      {
        kind: 'warn',
        text: '**Job bỏ trống một trường thì KHÔNG BAO GIỜ bị loại vì trường đó. Chỉ loại khi job GHI RÕ một điều trái với câu trả lời.**',
      },
      {
        kind: 'p',
        text: 'Phần lớn job ở Việt Nam bỏ trống ngành, loại hợp đồng và dải kinh nghiệm. Nếu so khớp kiểu bằng-nhau, tất cả những job đó biến mất ngay khi ứng viên trả lời bước 3, và con số thứ hai **bằng 0 với gần như mọi người** — vừa sai vừa làm nản lòng đúng lúc người dùng cần được khuyến khích đi tiếp.',
      },
      {
        kind: 'table',
        note: '**VÀ giữa các tiêu chí, HOẶC bên trong một tiêu chí** — chọn 3 thành phố nghĩa là job ở bất kỳ thành phố nào trong ba.',
        cols: ['Ứng viên chọn', 'Job được tính khi', 'Chỉ bị loại khi'],
        rows: [
          ['Luôn luôn', 'Job **đang mở** · đã đăng · còn bật hiển thị · công ty công khai', '—'],
          ['**Vị trí** (≤3)', 'Job thuộc **nghề** của vị trí đó, **hoặc** job không gắn nghề nào', 'Nghề của job không nằm trong nghề của các vị trí đã chọn'],
          ['**Ngành** (≤3)', 'Trùng ngành, **hoặc** job không ghi ngành', 'Job **có ghi** ngành và không nằm trong danh sách đã chọn'],
          ['**Loại hợp đồng**', 'Nằm trong tập đã chọn, **hoặc** job không khai', 'Job **có ghi** và không trùng'],
          ['**Nơi làm việc** (≤3)', 'Job **remote** (qua từ mọi nơi), **hoặc** tỉnh của job hoặc của công ty nằm trong tập, **hoặc** job không ghi địa điểm', 'Job **có ghi** tỉnh và không tỉnh nào được chọn'],
          ['**Số năm kinh nghiệm**', 'Dải năm của job bao được số năm ứng viên; job bỏ trống dải năm thì xét cấp bậc', 'Ứng viên thấp hơn mức job yêu cầu'],
          ['Học vấn', 'Luôn được tính', '**Không** là điều kiện đếm'],
        ],
      },
      {
        kind: 'list',
        items: [
          '**Vị trí so ở mức nghề, không so đúng vị trí.** So đúng vị trí thì một vị trí hẹp ra con số kiểu *2 job*, và wizard biến thành một lời từ chối.',
          '**Thừa kinh nghiệm hoặc thừa cấp bậc không bao giờ bị loại.** Giới hạn trên trong job Việt Nam là đỉnh dải quảng cáo, không phải trần tuyển dụng — người 10 năm vẫn đếm được job ghi cấp *Nhân viên*.',
        ],
      },
      {
        kind: 'p',
        text: '**Kinh nghiệm đọc hai nguồn, theo đúng thứ tự này.** Job khai **dải năm** thì so thẳng số năm với số năm. **Chỉ khi job bỏ trống dải năm** mới đọc tới **cấp bậc**: quy số năm ứng viên ra bậc theo bảng dưới, rồi giữ job có bậc không cao hơn ứng viên quá **1 bậc**. Job không khai cả hai thì **luôn được tính**.',
      },
      {
        kind: 'table',
        heading: 'Quy số năm ra cấp bậc',
        note: 'Bảng này dùng chung cho chỗ đếm onboarding và cho tiêu chí kinh nghiệm khi chấm điểm, để hai chỗ không bất đồng về ai là người thiếu kinh nghiệm.',
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

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '3. Con số in ra như thế nào' },
      {
        kind: 'p',
        text: '**Số ở bước 4 không bao giờ lớn hơn số ở bước 3.** Lọc kiểu VÀ thì thêm một tiêu chí chỉ có thể **bớt** job đi. *Khớp chính xác hơn* nghĩa là chính xác hơn, không phải nhiều hơn.',
      },
      {
        kind: 'table',
        cols: ['Tình huống', 'Câu dẫn hiện gì'],
        rows: [
          ['Số bước 4 nhỏ hơn số bước 3', 'In con số'],
          ['**Hai số bằng nhau**', '**Câu không có số.** In lại cùng một con số làm người dùng tưởng hệ thống đứng im'],
          ['Dưới **5** job tại tỉnh đã chọn', 'Bỏ điều kiện **nơi làm việc**, đếm toàn quốc, và **nói rõ trong câu**: *“Chỉ có 3 job ở Đà Nẵng — 128 job trên cả nước”*'],
          ['Nới rồi vẫn không có gì', 'Câu không có số'],
          ['Hơn **500** job', 'In **“500+”**, không in con số thật'],
          ['Chưa chọn gì, hoặc lỗi kết nối', 'Câu không có số — không vòng xoay, không số **0**'],
        ],
      },
      {
        kind: 'list',
        items: [
          '**Chỉ được nới lỏng khi câu chữ nói ra điều đó**, và chỉ nới **một lần**, chỉ nới **nơi làm việc**. Âm thầm bỏ điều kiện rồi báo một con số to hơn là nói dối về chính thứ vừa đo.',
          '**Không bao giờ in số 0.** Ở màn hình thứ hai ứng viên nhìn thấy, số 0 đọc như một lời phán về con người chứ không phải về dữ liệu.',
        ],
      },
      {
        kind: 'example',
        heading: 'Nam chọn QA Engineer tại Đà Nẵng',
        scenario:
          'Bước 1 Nam chọn vị trí *QA Engineer*; bước 2 chọn *Đà Nẵng*; bước 3 chọn loại hợp đồng *Fulltime*; bước 4 khai **4 năm** kinh nghiệm.',
        cols: ['Bước', 'Đếm trên', 'Kết quả'],
        rows: [
          ['Bước 3', 'Nghề IT (từ vị trí QA Engineer) + Đà Nẵng', '**3 job** — dưới 5 nên câu thêm con số toàn quốc: *toàn quốc có 128 việc*'],
          ['Bước 4', 'Thêm điều kiện Fulltime và 4 năm kinh nghiệm', '**3 job** — bằng bước 3 nên **không in số**'],
        ],
        note:
          'Bước 4 ra đúng bằng bước 3 vì cả ba job đều hoặc khai Fulltime, hoặc **không khai loại hợp đồng** (vẫn được giữ), và đều có dải năm bắt đầu từ ≤ 4. Đây là trường hợp bình thường, không phải lỗi đếm.',
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '4. Vì sao con số này không khớp trang tìm việc' },
      {
        kind: 'table',
        note: 'Bốn khác biệt có chủ đích. Onboarding rộng hơn vì mục đích của nó là khuyến khích đi tiếp; trang tìm việc hẹp hơn vì người dùng ở đó đang thật sự tìm việc. **Đừng đối chiếu hai con số** — chúng không bao giờ bằng nhau.',
        cols: ['Điểm khác', 'Câu dẫn onboarding', 'Trang tìm việc'],
        rows: [
          ['Job để trống loại hợp đồng', '**Giữ lại**', 'Loại bỏ'],
          ['Lọc ngành theo', 'Ngành của **job**', 'Ngành của **công ty**'],
          ['Job remote', '**Luôn được tính**, ở mọi tỉnh', 'Không có luật này'],
          ['Kinh nghiệm', 'Quy số năm ra **cấp bậc**', 'Không quy đổi'],
        ],
      },

    ],
  },

  /* ────────────────────────────────────────────────────────────────────────── */
  'onboarding-role-strip': {
    blocks: [
      {
        kind: 'p',
        text: 'Màn kết quả onboarding có **hai khối**. Khối trên là *những việc phù hợp nhất* — bộ máy gợi ý có chấm điểm. Khối dưới là dải **“Việc làm cho {vị trí}”**, và đó là thứ trang này mô tả.\n\nDải này **không chấm điểm**. Nó là một lượt **tìm kiếm thường**: lấy job đúng vị trí ứng viên vừa chọn, mới nhất trước.',
      },
      {
        kind: 'shot',
        src: '/shots/matching/onboarding-role-strip.jpg',
        where: 'Jobseeker site',
        caption: 'Màn kết quả onboarding. Khối trong khung đỏ là dải *“Việc làm cho {vị trí}”*.',
        note: 'Nó nằm dưới lưới *những việc phù hợp nhất* và trên nút *Hoàn tất CV và ứng tuyển*.',
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '1. Hai khối, hai nguồn khác hẳn nhau' },
      {
        kind: 'table',
        note: 'Hai khối nằm sát nhau nên rất dễ bị đọc là một. Chúng **không** chia sẻ luật nào — ngoài việc khối 2 phải bỏ những job khối 1 đang hiện.',
        cols: ['', 'Khối 1 — những việc phù hợp nhất', 'Khối 2 — Việc làm cho {vị trí}'],
        rows: [
          ['Nguồn', 'Bộ máy **Recommended jobs** (có chấm điểm)', '**Tìm kiếm thuần**'],
          ['Đọc gì của ứng viên', 'CV · hồ sơ · hành vi · trọng số', '**Đúng một thứ**: vị trí đã chọn ở bước 1'],
          ['Thứ tự', 'Điểm cao nhất trước', '**Mới nhất trước**'],
          ['Số thẻ', 'tối đa 30, chia 6 thẻ một trang', '3 thẻ một hàng, có phân trang'],
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '2. Chỉ job đúng vị trí' },
      {
        kind: 'list',
        items: [
          'Danh sách chỉ chứa job có vị trí **đúng bằng** tên in trên tiêu đề.',
          '**Không bao giờ nới lên nghề.** Không lấy thêm job của các vị trí anh em cùng nghề.',
          'VD: tiêu đề *“Việc làm cho Hành chính marketing”* → bên dưới chỉ có job **Hành chính marketing**. Thẻ lạc vị trí là lỗi.',
          'Không đọc CV, không đọc hồ sơ, không xáo trộn, không ưu tiên gói dịch vụ.',
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '3. Vị trí nào được in lên tiêu đề' },
      {
        kind: 'list',
        items: [
          'Trong tối đa 3 vị trí ứng viên chọn ở bước 1, lấy vị trí **có nhiều job đang mở nhất**.',
          'Đếm job của **chính vị trí đó**, **không** đếm cả nghề.',
          'Hoà nhau → lấy vị trí ứng viên chọn trước.',
        ],
      },
      {
        kind: 'example',
        heading: 'Vì sao phải đếm theo vị trí, không đếm theo nghề',
        scenario: 'Ứng viên chọn hai vị trí ở bước 1: **Hành chính marketing** (nghề *Marketing · Truyền thông*) và **Nhân viên kinh doanh** (nghề *Kinh doanh & Thương mại*).',
        cols: ['Vị trí chọn ở bước 1', 'Job đang mở đúng vị trí đó', 'Job đang mở của cả nghề'],
        rows: [
          ['Hành chính marketing', '**40**', '520'],
          ['Nhân viên kinh doanh', '25', '1.150'],
        ],
        note: 'Đếm **cột giữa**: *Hành chính marketing* có 40 job, nhiều hơn 25 → tiêu đề in *“Việc làm cho Hành chính marketing”*, và bên dưới là đúng 40 job đó.\n\nĐếm cột phải thì ngược lại: nghề *Kinh doanh & Thương mại* có 1.150 job → tiêu đề in *“Việc làm cho Nhân viên kinh doanh”*, nhưng bên dưới chỉ có 25 job đúng vị trí đó. Chọn tiêu đề bằng một con số rồi lấp bằng một con số khác.',
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '4. Dưới 3 job thì ẩn cả khối' },
      {
        kind: 'list',
        items: [
          'Đếm **sau khi** đã bỏ những job khối 1 đang hiện.',
          'Còn **0, 1 hoặc 2 job thì không hiện gì cả** — không tiêu đề, không lưới, không khoảng trắng.',
          'Lưới ba cột đứng mỗi một thẻ trông như trang bị hỏng.',
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '5. Câu hỏi hay gặp' },
      {
        kind: 'list',
        items: [
          '**Vì sao con số ở wizard không khớp số thẻ ở dải này?** Con số ở bước 3 / bước 4 của wizard đếm theo **nghề**; dải này lọc theo **vị trí**. Hai phép đếm khác nhau, và đó là đúng thiết kế.',
          '**Vì sao hai khối trên màn kết quả cho job khác nhau?** Khối 1 chấm điểm theo hồ sơ, khối 2 chỉ lọc theo một vị trí. Hai câu hỏi khác nhau.',
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
    hidePageList: true,
    title: 'Matching & gợi ý — sáu chỗ, sáu cách tính',
    lead:
      'Saramin tự chọn job để hiện ở **sáu chỗ**, và **không chỗ nào tính giống chỗ nào**. Cùng một ứng viên, cùng một lúc, sáu chỗ đó có thể ra sáu danh sách khác nhau — **đúng thiết kế**, không phải lỗi.\n\nNên câu hỏi “sao chỗ này hiện khác chỗ kia” hầu như luôn là đang so nhầm hai chỗ với nhau. Bảng dưới đây là **toàn bộ danh sách**: mỗi chỗ nhìn vào đâu, tìm ra gì, và trang nào nói kỹ về nó.',
    headline: [],
    blocks: [
      { kind: 'h', text: 'Sáu chỗ hệ thống tự chọn job để hiện' },
      {
        kind: 'table',
        note: 'Mỗi chỗ có một trang riêng đi sâu vào cách tính — tên trang ghi ngay dưới tên khối.',
        cols: ['Chỗ gợi ý', 'Người dùng thấy ở đâu', 'Nhìn vào đâu → tìm ra gì', 'Đọc hồ sơ?'],
        rows: [
          ['**Gợi ý việc làm cho bạn**\n`/trang/recommended-jobs`', 'Trang cá nhân · trang chi tiết job · màn kết quả onboarding · popup sau khi nộp đơn · email hằng tuần', 'Nhìn **hồ sơ của ứng viên** → tìm ra **job** hợp với họ', 'Có'],
          ['**Các công việc tương tự**\n`/trang/similar-jobs`', 'Carousel dưới trang chi tiết job', 'Nhìn **job đang mở** → tìm ra **job khác** giống nó', 'Không'],
          ['**Recommended talent**\n`/trang/recommended-candidates`', 'Company Home của nhà tuyển dụng · % trên bảng ứng viên', 'Nhìn **job đang tuyển** → tìm ra **ứng viên** hợp với job', 'Có — chỉ phần ứng viên tự khai'],
          ['**Số việc ở onboarding**\n`/trang/onboarding-job-count`', 'Câu dẫn ở bước 3 và bước 4 của wizard', 'Không tìm ai cả, chỉ **đếm**: có bao nhiêu job lọt qua bộ lọc', 'Không'],
          ['**Dải “Việc làm cho {vị trí}”**\n`/trang/onboarding-role-strip`', 'Màn kết quả onboarding, dưới lưới *những việc phù hợp nhất*', 'Nhìn **vị trí ứng viên vừa chọn** → tìm ra **job** đúng vị trí đó, mới nhất trước', 'Không'],
          ['**Việc gợi ý trong email sau khi nộp đơn**\n*chưa có trang riêng*', 'Email *Bạn đã ứng tuyển thành công*', 'Nhìn **job vừa nộp đơn** → tìm ra **job khác** giống nó', 'Không'],
        ],
      },
      {
        kind: 'list',
        heading: 'Ranh giới giữa các chỗ',
        items: [
          '**Hai khối trên trang chi tiết job không bao giờ trùng job.** Carousel *Các công việc tương tự* lấy trước; khối *Gợi ý việc làm cho bạn* bỏ đi những job carousel đã hiện. Khách **chưa đăng nhập** thấy phần còn lại của chính danh sách carousel, dưới tiêu đề *Có thể bạn quan tâm*.',
          '***Các công việc tương tự* được cache 1 giờ** (chậm nhất ~75 phút mới đổi), nên mọi người mở cùng một job đều thấy cùng một danh sách.',
          '***Recommended talent* dùng cùng bảng điểm với *Gợi ý việc làm cho bạn***, nhưng **chỉ đọc dữ liệu ứng viên tự khai** — hành vi xem job, lưu job, nộp đơn **không bao giờ** đi sang phía nhà tuyển dụng.',
          '**Trang chủ và trang tìm việc không có khối gợi ý cá nhân nào.**',
        ],
      },

      {
        kind: 'shot',
        src: '/shots/matching/job-detail-two-blocks.jpg',
        where: 'Jobseeker site',
        caption: 'Hai khối nằm trên cùng một trang chi tiết job, và đây là chỗ hay bị nhầm nhất. **Các công việc tương tự** ở trên so **job với job** — ai mở cũng thấy cùng danh sách. **Có thể bạn quan tâm** ở dưới là phần còn lại của chính danh sách đó (khách chưa đăng nhập); người **đã đăng nhập** thấy *Gợi ý việc làm cho bạn* ở đúng chỗ này, và khối đó mới là khối đọc hồ sơ.',
        note: 'Ảnh dev ngày 17/11. Thẻ thứ hai trong carousel là **cùng công ty, cùng tiêu đề, cùng tỉnh** với chính job đang xem — luật bỏ job trùng lẽ ra phải loại nó.',
      },

      {
        kind: 'p',
        text: '*Viết theo code đang chạy trên bản dev, đọc ngày 16/11/2026.*',
      },
    ],
  },
}
