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
 * STILL TO DO: onboarding-job-count and onboarding-role-strip are still written
 * as build-vs-target comparisons and need the same pass.
 *
 * VOICE of recommended-jobs, rewritten 2026-11-21 to match the Top search page:
 *   - sections are "1." "2.", plain statements, never "§1 · Bước 1 — …"
 *   - table cells are a few words; anything longer goes in a list under it
 *   - one fact per line, flat. Examples one line: "VD: … → …"
 *   - no code identifiers in reader-facing text
 *
 * recommended-jobs re-read from origin/dev on 2026-11-21:
 *   svn-be  86a1d09bb   svn-web 649353f24
 * Two things changed since the 16/11 read and are now in the page: the relax
 * step drops the PROVINCE gate only — the category gate is never dropped — and
 * the pool is 30.
 */
import type { PageDoc, ModuleDoc } from '../docs'

const STAMP =
  'Viết theo **code đang chạy** trên nhánh `dev`, đọc ngày 16/11/2026 (svn-be `58e37d05a` · svn-web `e3ff8df46`).'

export const MATCHING_PAGE_DOCS: Record<string, PageDoc> = {
  /* ────────────────────────────────────────────────────────────────────────── */
  'recommended-jobs': {
    blocks: [
      {
        kind: 'p',
        text: 'Gợi ý việc làm chạy **ba bước**: lọc ra tập job đem đi chấm, chấm điểm từng job với thông tin ứng viên, rồi giữ lại job điểm cao nhất và rải ra các màn hình.\n\nTrang này đi đúng ba bước đó. Đọc hết mục 1–4 là hiểu toàn bộ cách chọn job. Mục 5 nói từng màn hình hiện bao nhiêu thẻ, mục 6 là một ví dụ chạy đủ số.',
      },
      {
        kind: 'table',
        heading: 'Ba chữ dùng suốt trang này',
        cols: ['Chữ', 'Trường trong master data', 'Ví dụ'],
        rows: [
          ['**Vị trí**', '*Job role*', 'Senior Frontend Engineer'],
          ['**Nghề**', '*Job category*', 'Lập trình / Phần mềm'],
          ['**Ngành**', '*Industry*', 'Công nghệ thông tin'],
        ],
        note: 'Bước lọc **chỉ lọc theo Nghề**. **Ngành không dùng để lọc** — job khác ngành vẫn vào danh sách bình thường, ngành chỉ là một tiêu chí **5 điểm** ở bước chấm.',
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '1. Tóm lại' },
      {
        kind: 'table',
        cols: ['Hạng mục', 'Hệ thống chạy thế nào'],
        rows: [
          ['Lấy job từ đâu', 'Toàn bộ job đang mở trên site'],
          ['Bước 1 — Lọc', 'Theo **nghề** và **tỉnh** ứng viên khai trong Work preference'],
          ['Bước 1 — Cắt', 'Tối đa **500 job** được đem đi chấm'],
          ['Bước 2 — Chấm điểm', '**7 tiêu chí**, tổng **100 điểm**'],
          ['Bước 3 — Giữ lại', '**30 job** điểm cao nhất'],
          ['Một công ty trong 30 job', 'Tối đa **3 job**, hai job cách nhau ít nhất **6 vị trí**'],
          ['Ứng viên có thấy điểm không', 'Không. Không có %, không có điểm sàn'],
          ['Danh sách có lưu sẵn không', 'Không. Tính lại **mỗi lần mở trang**'],
        ],
      },
      {
        kind: 'list',
        heading: 'Lọc và chấm điểm là hai việc khác nhau',
        items: [
          '**Lọc** là **có hoặc không**. Job không qua thì **không bao giờ** xuất hiện, điểm cao đến mấy cũng vậy.',
          '**Chấm điểm** chỉ **đổi thứ tự**. Không loại job nào. Job thiếu lương, thiếu kỹ năng vẫn ở trong danh sách, chỉ đứng thấp hơn.',
          'Job biến mất là chuyện của **bước lọc**, không phải của điểm số.',
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '2. Bước 1 — Lọc: job nào được đem đi chấm' },
      {
        kind: 'p',
        text: 'Thông tin lọc lấy từ **Work preference** của ứng viên. Không lấy từ CV, không lấy từ tỉnh ứng viên đang sống.',
      },
      {
        kind: 'table',
        note: 'Job phải qua **tất cả** điều kiện đang bật.',
        cols: ['Điều kiện', 'Bật khi nào', 'Loại job nào'],
        rows: [
          ['**Job đang mở**', 'Luôn luôn', 'Job đã đóng, hết hạn, chưa tới giờ đăng, tắt hiển thị, công ty không công khai'],
          ['**Chưa nộp đơn**', 'Luôn luôn', 'Mọi job ứng viên đã nộp đơn — kể cả đơn bị từ chối và đơn đã thu hồi'],
          ['**Nghề**', 'Khi ứng viên khai **vị trí** hoặc **nghề** mong muốn', 'Job không thuộc nghề nào ứng viên quan tâm'],
          ['**Tỉnh**', 'Khi ứng viên khai **địa điểm** mong muốn **và không** tick *sẵn sàng chuyển chỗ ở*', 'Job ngoài các tỉnh đó. **Job remote luôn qua**'],
          ['**Cùng nghề với job đang xem**', 'Chỉ ở trang chi tiết job', 'Job không chung nghề nào với job đang xem'],
          ['**Ngành · hình thức · lương · kinh nghiệm · học vấn · kỹ năng**', '**Không bao giờ lọc**', 'Không loại job nào. Chỉ ảnh hưởng **điểm số** ở bước 2'],
        ],
      },
      {
        kind: 'list',
        heading: '2a. Điều kiện nghề lấy ra sao',
        items: [
          '**Nghề lấy từ vị trí ứng viên khai.** Ứng viên khai tối đa **3 vị trí** mong muốn. Hệ thống lấy **nghề của từng vị trí đó**, cộng thêm ô **Nghề mong muốn** nếu có khai. Ba vị trí thuộc ba nghề khác nhau → tập lọc có **3 nghề**.',
          '**Lọc theo nghề, không lọc theo vị trí.** Job chỉ cần thuộc **một trong các nghề** đó là qua.',
          'VD: ứng viên khai *Senior Frontend Engineer* → lấy **mọi job thuộc nghề Lập trình / Phần mềm**: Backend, QA, DevOps đều vào. Không chỉ job tên Frontend.',
          '**Vị trí không dùng để lọc.** Vị trí chỉ dùng ở bước chấm điểm, và để chọn 500 job (mục 2c).',
          '**Tỉnh lấy từ Địa điểm mong muốn** trong Work preference. Tick *sẵn sàng chuyển chỗ ở* thì bỏ hẳn điều kiện tỉnh.',
          '**Không khai thì không lọc.** Không khai vị trí lẫn nghề → không có điều kiện nghề. Không khai tỉnh → không có điều kiện tỉnh. Không khai gì cả → lấy **toàn bộ** job đang mở.',
          '**Điều kiện bật theo cái ứng viên khai, nhưng khi đã bật thì nhận thêm cái học từ hành vi.** VD: khai nghề Marketing, 90 ngày qua hay mở job nghề Truyền thông → job nghề Truyền thông cũng qua được.',
        ],
      },
      {
        kind: 'list',
        heading: '2b. Khi lọc xong còn quá ít job',
        items: [
          'Còn **dưới 6 job** → **bỏ điều kiện tỉnh**, chạy lại. Chỉ nới đúng một bước này.',
          '**Không bao giờ bỏ điều kiện nghề.** Ít job đúng nghề vẫn hơn một màn đầy job nghề khác.',
          'Tiêu đề khối **không đổi** — ứng viên không được báo là đã nới.',
          '**Trang chi tiết job không nới gì cả.** Hết job cùng nghề thì khối gợi ý **ẩn hẳn**, không lấp bằng job không liên quan.',
          'Nghĩa là ứng viên ở một nghề rất hẹp **có thể thấy ít hơn 6 job**. Đây là chủ ý, không phải lỗi.',
        ],
      },
      {
        kind: 'list',
        heading: '2c. Cắt còn 500 job',
        items: [
          'Lọc xong còn hơn 500 job thì chỉ **500 job được đem đi chấm**.',
          'Thứ tự chọn 500: **① job có vị trí trùng vị trí ứng viên quan tâm** đứng trước; **② trong mỗi nhóm, job đăng mới nhất đứng trước**.',
          'Đây là một phép **sắp xếp**, không phải một phép chấm điểm thứ hai. Không so job với hồ sơ, không trọng số.',
          'Khoá ① là **có hoặc không**. Job trúng 3 vị trí đứng **ngang hàng** job trúng 1 vị trí.',
          'Job bị cắt bỏ là job **không trúng vị trí nào** và **đăng cũ nhất** trong nhóm đó.',
          'Ứng viên chưa khai vị trí nào và chưa có hành vi → khoá ① không phân biệt được gì, còn lại đúng *mới nhất trước*.',
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '3. Bước 2 — Chấm điểm từng job' },
      {
        kind: 'p',
        text: 'Mỗi job trong tập vừa lọc được so với thông tin ứng viên trên **7 tiêu chí**, tổng **100 điểm**. Thông tin ứng viên lấy từ **ba nguồn**: Work preference, CV, và hành vi của ứng viên trên site.',
      },
      {
        kind: 'table',
        heading: '3a. Ba nguồn thông tin',
        cols: ['Nguồn', 'Lấy gì', 'Loại'],
        rows: [
          ['**Work preference**', 'Vị trí mong muốn (tối đa 3) và nghề của chúng · nghề mong muốn · địa điểm · ngành · lương · hình thức làm việc', '**Tự khai**'],
          ['**Hành vi 90 ngày gần nhất** — nộp đơn hoặc lưu job (1 lần là đủ), xem job (**3 job khác nhau cùng mang giá trị đó**)', 'Vị trí · nghề · tỉnh của những job đó, giữ **top 3** mỗi loại', '**Học được**'],
          ['**CV**', 'Số năm kinh nghiệm · kỹ năng · học vấn', 'Tự khai'],
          ['**Tiêu đề CV**', 'Vị trí đọc ra từ tiêu đề — **chỉ dùng khi** ứng viên không khai cả vị trí lẫn nghề', '**Học được**'],
        ],
        note: 'Giá trị **tự khai** ăn điểm đầy đủ. Giá trị **học được** chỉ ăn **80 %** của bậc tương ứng: 42→34 · 30→24 · 20→16 · 17→14 · 5→4.',
      },
      {
        kind: 'list',
        heading: '3b. Khai và hành vi dùng CÙNG LÚC, không thay nhau',
        items: [
          'Hai nguồn **gộp lại thành một tập**. Mỗi giá trị trong tập mang một nhãn: **tự khai** hoặc **học được**.',
          '**Không phải** cứ không khai mới lấy hành vi. Khai rồi thì hành vi vẫn được cộng thêm vào tập.',
          'Một giá trị vừa khai vừa học được thì tính là **tự khai** — nhãn mạnh hơn thắng.',
          'Khi chấm một job, hệ thống lấy **bậc cao nhất** job đó chạm tới, và tính theo nhãn của giá trị trúng.',
          'VD: ứng viên khai *Marketing Executive*, hành vi học thêm *Content Marketing*. Job *Marketing Executive* → **42**. Job *Content Marketing* → **34**. Job nghề Marketing nhưng vị trí khác → **17**.',
          '**Chỉ có hai chỗ là "không có thì mới lấy cái khác":** vị trí đọc từ tiêu đề CV (chỉ khi không khai vị trí lẫn nghề), và số năm kinh nghiệm (lấy Hồ sơ trước, trống mới tính từ CV).',
          '**Hành vi không tự cộng điểm.** Nó làm hai việc: **mở rộng** tập đem ra so khớp, và **phá hoà** — hai job bằng điểm thì job ứng viên chưa xem đứng trước.',
          '**Hành vi của ứng viên không bao giờ hiện ra phía nhà tuyển dụng.** Bảng điểm nhà tuyển dụng thấy chỉ dùng thông tin tự khai.',
        ],
      },
      {
        kind: 'table',
        heading: '3c. Bảy tiêu chí',
        note: 'Đọc **theo hàng ngang**: cột giữa là hệ thống lấy thông tin ứng viên ở đâu, cột phải là job khớp thì ăn bao nhiêu điểm. Trọng số **cố định**, admin không chỉnh được.',
        cols: ['Tiêu chí', 'Điểm', 'Lấy từ ứng viên', 'Job ăn bao nhiêu'],
        rows: [
          ['**Vị trí & nghề**', '**42**',
           'Khai: vị trí mong muốn (≤3) + nghề mong muốn.\nHọc được: vị trí / nghề của job đã nộp, đã lưu, hoặc xem ≥ 3 job cùng vị trí / nghề đó.\nCả hai rỗng: vị trí đọc từ tiêu đề CV.',
           'Cùng **vị trí** → **42** khai / **34** học được\nCùng **nhóm vị trí** → **30** / **24**\nCùng **nghề**, khác vị trí → **17** / **14**\nKhác nghề → **0**'],
          ['**Địa điểm & hình thức**', '**20**',
           'Khai: tỉnh mong muốn + hình thức làm việc.\nHọc được: tỉnh của job đã nộp, đã lưu, hoặc xem ≥ 3 job cùng tỉnh đó.\nKhông khai gì: không so.',
           'Đúng tỉnh **và** đúng hình thức → **20** khai / **16** học được\nJob **remote** → **20**, từ mọi nơi\nĐúng tỉnh, khác hình thức → **14**\nTỉnh khác → **0**'],
          ['**Kinh nghiệm**', '**14**',
           'Số năm trên **Hồ sơ**.\nTrống thì tính từ lịch sử làm việc trong CV.',
           'Trong dải job yêu cầu → **14**\nJob ghi *không yêu cầu* → **14**\nThừa ≤ 2 năm → **10**\nThiếu ≤ 1 năm → **7**\nThừa > 2 năm → **5**\nThiếu > 1 năm → **0**\n\nJob không khai dải năm nhưng khai **cấp bậc**: cùng bậc **14** · lệch 1 bậc **7** · xa hơn **0**'],
          ['**Lương**', '**12**',
           'Lương mong muốn + tiền tệ trong Work preference.\n**Không có đường dự phòng.**',
           'Trong dải, hoặc dải job cao hơn hẳn → **12**\nĐòi hơn ≤ 10 % → **8**\nĐòi hơn 10–20 % → **4**\nMột bên ghi *Thỏa thuận* → **6**\nĐòi hơn > 20 % → **0**\nKhác tiền tệ → quy đổi theo tỷ giá admin rồi mới so; không có tỷ giá → **0**'],
          ['**Ngành**', '**5**',
           'Ô **Ngành mong muốn** trong Work preference.\n**Không suy từ công ty trong CV.**',
           'Trùng ngành → **5**\nCùng ngành cha → **3**\nKhác → **0**'],
          ['**Kỹ năng**', '**4**',
           'Kỹ năng trên CV — phải chọn từ master data, không nhận chữ gõ tay.',
           'Khớp hết kỹ năng job yêu cầu → **4**\nKhớp một phần → 4 × (khớp ÷ yêu cầu); kỹ năng **bắt buộc** tính đôi ở cả hai vế\nKhông có kỹ năng chung → **0**'],
          ['**Học vấn**', '**3**',
           'Học vấn trên CV.',
           'Đạt hoặc hơn yêu cầu → **3**\nJob ghi *không yêu cầu* → **3**\nThấp hơn 1 bậc → **1**\nThấp hơn từ 2 bậc → **0**'],
          ['**Tổng**', '**100**', '', ''],
        ],
      },
      {
        kind: 'list',
        heading: '3d. Bốn luật chấm điểm',
        items: [
          '**Thiếu dữ liệu là 0 điểm, không chia lại thang.** Job không ghi lương, hoặc ứng viên không khai lương → tiêu chí lương bằng 0, và 12 điểm đó **không** chia sang tiêu chí khác. Chia lại thang là thưởng cho job khai thiếu.',
          '**Ô trống bên phía ứng viên không gây hại.** Nó trừ đúng số điểm đó của **mọi job như nhau**, nên thứ tự không đổi.',
          '**Ứng viên có nhiều CV:** chấm **từng CV**, mỗi job giữ **điểm cao nhất**. Job chỉ xuất hiện một lần, mang điểm của CV hợp với nó nhất. Hệ thống **không** trộn các CV lại trước khi chấm.',
          '**Kỹ năng gõ tay không khớp master data tính là không có kỹ năng** — mất điểm tiêu chí kỹ năng. Khá phổ biến với CV tải lên.',
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '4. Bước 3 — Giữ 30 job rồi sắp xếp' },
      {
        kind: 'list',
        items: [
          '**Bỏ job trùng** — cùng công ty, cùng tiêu đề, cùng tỉnh thì giữ job mới nhất.',
          '**Giữ 30 job điểm cao nhất.** Không có điểm sàn: đủ job thì luôn đủ 30.',
          '**Một công ty tối đa 3 job.** Đi từ trên xuống, gặp job thứ 4 của cùng công ty thì bỏ qua. Không xếp lại, không đổi điểm.',
          '**Hai job cùng công ty cách nhau ít nhất 6 vị trí.** Đếm theo vị trí trong danh sách, nên không phụ thuộc bề ngang màn hình.',
          'Không còn job nào hợp lệ để giữ khoảng cách thì **vẫn lấp đủ chỗ** — bỏ trống một vị trí sẽ đẩy lệch mọi thẻ phía sau.',
          '**Job đang xem và bản trùng của nó** bị loại ở trang chi tiết job và ở popup sau khi nộp đơn.',
        ],
      },
      {
        kind: 'list',
        heading: '4a. Thứ tự thẻ: xáo trộn trong từng bậc vị trí',
        items: [
          '30 job được chia bậc theo **điểm của riêng tiêu chí vị trí**: vị trí khai **42** → vị trí học được **34** → nhóm vị trí **30 / 24** → nghề **17 / 14** → còn lại **0**.',
          '**Chỉ xáo bên trong mỗi bậc.** Job đúng vị trí ứng viên khai **không bao giờ** đứng sau job chỉ cùng nghề, dù job kia hơn điểm địa điểm hay lương.',
          'Thứ tự **ổn định cả ngày**: cùng một màn hình thì tải lại không đổi. Mỗi màn hình đảo một kiểu khác. Sang hôm sau mới đảo bộ mới.',
          '**Không bao giờ random thuần.**',
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '5. Năm nơi dùng kết quả này' },
      {
        kind: 'table',
        note: 'Cùng một phép tính, khác màn hình nên **số thẻ, giới hạn công ty và thứ tự** khác nhau. Cách chấm điểm thì giống hệt.\n\nMàn chỉ hiện 6 thẻ thì giới hạn công ty **tự động thành 1**: hai job cùng công ty phải cách nhau ≥ 6 vị trí, mà cả màn chỉ có 6 thẻ. Nên giới hạn 3 chỉ thực sự có hiệu lực ở onboarding.',
        cols: ['Nơi hiển thị', 'Ai thấy', 'Số thẻ', 'Tối đa / công ty', 'Thứ tự'],
        rows: [
          ['**Onboarding** — khối *những việc phù hợp nhất*', 'Ứng viên vừa xong wizard', 'tối đa 30, chia 6 thẻ một trang', '**3**', '**Đúng thứ tự điểm**, cách nhau ≥ 6 vị trí'],
          ['**Trang cá nhân** — *Việc làm phù hợp với bạn*', 'Đã đăng nhập', '6 (carousel hiện 3)', '**1**', 'Xáo trộn trong từng bậc vị trí'],
          ['**Chi tiết job** — *Gợi ý việc làm cho bạn*', 'Đã đăng nhập', '6', '**1**', 'Xáo trộn trong từng bậc vị trí, **chỉ lấy job cùng nghề** với job đang xem'],
          ['**Popup sau khi nộp đơn**', 'Người vừa nộp đơn', 'tối đa 30', 'không giới hạn — chỉ không đứng liền nhau', '**Đúng thứ tự điểm**, không xáo'],
          ['**Email gợi ý hằng tuần** — thứ Hai 07:00', 'Ứng viên đang hoạt động, chưa tắt công tắc nhận mail', '6', '**1**', '**Đúng thứ tự điểm**'],
        ],
      },
      {
        kind: 'list',
        items: [
          'Khối thứ hai ở onboarding — *Việc làm cho {vị trí}* — **không** dùng bộ máy này. Nó là một lượt tìm kiếm thuần.',
          '**Trang tìm việc không có khối gợi ý.**',
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '6. Ví dụ chạy thật' },
      {
        kind: 'example',
        heading: 'Linh và ba job — đọc theo hàng ngang',
        scenario:
          '**Linh** khai trong Work preference: **Marketing Executive · Marketing · Hồ Chí Minh · 20 triệu**. Hồ sơ ghi **3 năm**. CV có *Facebook Ads · Google Analytics · Content Writing*, bằng **Đại học** — nhưng cô **không khai Ngành mong muốn**. Trong 90 ngày qua cô **nộp đơn 1 job** (Chuyên viên Marketing · Shopee), **lưu 1 job** (Content Marketing) và **mở 6 job**, trong đó 4 job ở Bình Dương.',
        cols: ['Tiêu chí', 'Linh có gì', 'A · Content Marketing · Lazada · HCM', 'B · Chuyên viên MKT · Lazada · Bình Dương', 'C · Marketing Executive · VNG · HCM'],
        rows: [
          ['Vị trí & nghề · 42', 'Khai: **Marketing Executive**. Học được: Chuyên viên Marketing, Content Marketing', 'Đúng vị trí, nhưng **học được** → **34**', 'Đúng vị trí, **học được** → **34**', 'Đúng vị trí cô **tự khai** → **42**'],
          ['Địa điểm · 20', 'Khai: **Hồ Chí Minh**. Học được: Bình Dương', 'HCM, tự khai → **20**', 'Bình Dương, học được → **16**', 'HCM, tự khai → **20**'],
          ['Kinh nghiệm · 14', '3 năm', 'Job cần 2–4 → **14**', 'Job cần 3–5 → **14**', 'Job cần 1–2, thừa 1 năm → **10**'],
          ['Lương · 12', '20 triệu', '18–25 → **12**', '20–28 → **12**', 'Trần 16, đòi cao hơn 25 % → **0**'],
          ['Ngành · 5', 'Không khai', '**0**', '**0**', '**0**'],
          ['Kỹ năng · 4', '3 kỹ năng trên CV', 'Khớp 2 trong 3 → **2,7**', 'Khớp cả hai → **4**', 'Job đòi Google Ads → **0**'],
          ['Học vấn · 3', 'Đại học', 'Job cần Đại học → **3**', 'Job **không khai** → **0**', 'Job cần Đại học → **3**'],
          ['**Tổng**', '', '**86**', '**80**', '**75**'],
        ],
        note:
          '**Bốn điều rút ra.** **(1)** Job C giữ 42 trong 75 điểm chỉ nhờ một sự thật: Marketing Executive là vị trí Linh **tự khai**. Lương hụt 25 %, không kỹ năng chung, vẫn 75 điểm. **(2)** Job A và B ăn **34** chứ không phải 42 — đúng vị trí, nhưng học từ hành vi nên chỉ 80 %. Job B có mặt **chỉ nhờ hành vi**: Bình Dương không nằm ở đâu trong Work preference của Linh. **(3)** Cả ba job đều 0 điểm ngành vì Linh bỏ trống Ngành mong muốn — ô trống bên phía ứng viên trừ **mọi job như nhau**, thứ tự không đổi. **(4)** Job Shopee cô đã nộp đơn **không có mặt** ở cột nào, vì đã nộp là loại hẳn — nhưng chính nó là lý do A và B được 34 điểm vị trí.',
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '7. Câu hỏi hay gặp' },
      {
        kind: 'list',
        items: [
          '**Sao job này không còn hiện nữa?** Nộp đơn rồi thì job biến mất khỏi mọi gợi ý, vĩnh viễn — kể cả khi đơn bị từ chối hoặc đã thu hồi.',
          '**Ứng viên không khai địa điểm thì sao?** Tiêu chí địa điểm bằng **0** cho mọi job, kể cả job remote. Thứ tự không đổi vì mọi job bị trừ như nhau.',
          '**Thấy đúng 6 thẻ đó suốt cả ngày là lỗi cache?** Không. Thứ tự chốt theo ngày, tải lại không đổi, hôm sau mới đảo bộ khác.',
          '**Ở trang chi tiết job, hết job cùng nghề thì sao?** Khối gợi ý **ẩn hẳn**. Không lấp bằng job không liên quan.',
          '**Bậc "cùng nhóm vị trí" (30 điểm) hiện chưa đạt được** vì dữ liệu phân nhóm ba tầng chưa có. Thực tế thang vị trí chạy hai bậc: cùng vị trí **42**, hoặc cùng nghề **17**.',
          '**Dấu *cho nhà tuyển dụng thấy CV này* không liên quan tới gợi ý việc làm.** Gợi ý dùng mọi CV, bật hay tắt đều như nhau.',
        ],
      },

      { kind: 'p', text: '*Cập nhật 21/11/2026.*' },
    ],
  },

  /* ────────────────────────────────────────────────────────────────────────── */
  'similar-jobs': {
    logic: [
      '**So job với job, không đọc hồ sơ người xem.** Vì vậy **mọi người đều thấy cùng một danh sách** cho cùng một job — khách chưa đăng nhập cũng thấy y hệt người đã đăng nhập.',
      '**Đây là bảng điểm riêng**, khác bảng của *Recommended jobs*: 45 / 15 / 15 / 10 / 8 / 4 / 3, trên cùng thang 100. Đừng dùng bảng của bên kia để giải thích kết quả bên này.',
      '**Kết quả được cache 1 giờ cho mỗi job** và chỉ tính lại ở lượt xem đầu tiên sau khi cache hết hạn — thực tế làm mới chậm nhất khoảng **75 phút**.',
      '**Không có cổng lọc nghề — và đó là cả mục đích của thiết kế này.** Bản nháp cũ bắt buộc cùng nghề rồi bỏ hết phần còn lại; làm vậy sẽ có những job **không có việc tương tự nào để hiện**, và một khối rỗng là kết cục mà tính năng này không được phép tạo ra. Chấm hết mọi job thì không bao giờ rỗng, và phần dự phòng tự nó hợp lý: một job không có gì cùng nghề vẫn ăn điểm địa điểm, cấp bậc, lương và hình thức — thành ra *cùng thành phố, cùng cấp bậc, lương tương đương*.',
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
          'Đọc **một câu truy vấn** lấy thông tin job gốc và **mọi job đang sống** — không có cổng nghề, không giới hạn theo ngày đăng.',
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
        cols: ['Tiêu chí', 'Tối đa', 'Các bậc'],
        rows: [
          ['**Nghề**', '**45**', 'Cùng vị trí 45 · cùng nhóm vị trí 32 · cùng nghề 18. Lấy quan hệ **mạnh nhất** giữa mọi cặp vị trí của hai job'],
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
        text: '**Bậc “cùng nhóm vị trí” (32 điểm) chưa bao giờ đạt được** — dữ liệu taxonomy ba tầng chưa có. Thực tế thang nghề chạy hai bậc: 45 hoặc 18. Xem §5 để thấy điều này đổi thứ hạng như thế nào.',
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
          'Dưới 40 điểm nghĩa là **nghề gần như không đóng góp gì** và các thẻ chỉ còn được gắn với nhau bằng địa điểm và cấp bậc. Đổi tiêu đề thay vì giấu danh sách là cách trung thực hơn.',
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
          'Job đang xem: **Senior Frontend Engineer · FPT Software · Hồ Chí Minh · Senior · IT/Phần mềm · 30–45 triệu**, khai **5 kỹ năng**: React · TypeScript · Git · Docker · AWS. Con số 5 này là mẫu số của tiêu chí kỹ năng.',
        cols: ['Job ứng viên', 'Nghề 45', 'Cấp bậc 15', 'Địa điểm 15', 'Lương 10', 'Kỹ năng 8', 'Ngành 4 + HT 3', 'Tổng'],
        rows: [
          ['**React Developer** · Tiki · HCM · Senior · 32–48tr · chung React, TypeScript, Git', 'cùng vị trí **45**', '**15**', '**15**', '**10**', '3/5 → **4,8**', '**7**', '**97**'],
          ['**Backend Engineer** · Shopee · HCM · Senior · 30–45tr · chung Docker', 'cùng nhóm **32**', '**15**', '**15**', '**10**', '1/5 → **1,6**', '**7**', '**81**'],
          ['**Frontend Engineer** · VNG · **Hà Nội** · Senior · 30–45tr · chung React, TypeScript', 'cùng vị trí **45**', '**15**', 'khác tỉnh **0**', '**10**', '2/5 → **3,2**', '**7**', '**80**'],
          ['**Frontend Intern** · Base.vn · HCM · **Intern** · 8–12tr · chung React', 'cùng vị trí **45**', 'lệch 3 bậc **0**', '**15**', 'không giao **0**', '1/5 → **1,6**', '**7**', '**69**'],
          ['**Data Engineer** · MoMo · HCM · Senior · 35–50tr · chung AWS', 'cùng nghề **18**', '**15**', '**15**', '**10**', '1/5 → **1,6**', '**7**', '**67**'],
          ['**Kế toán trưởng** · VNG · HCM · Manager · 30–45tr · không chung gì', 'khác nghề **0**', 'lệch 1 bậc **9**', '**15**', '**10**', '**0**', '**3**', '**37**'],
        ],
        note:
          '**Thứ tự theo tài liệu:** Tiki 97 · Shopee 81 · VNG 80 · Base.vn 69 · MoMo 67 · Kế toán 37. — ⚠ **Trên build hôm nay thì khác**: bậc *cùng nhóm vị trí* chưa chạy, nên Shopee chỉ được **18** chứ không phải 32, tổng còn **67** — **bằng đúng MoMo**, và hai job phải phá hoà bằng ngày đăng. Đây chính là cái giá của việc thiếu tầng taxonomy giữa (§2). — Ba điều khác đáng rút ra: **(1)** Shopee 81 nhỉnh hơn VNG 80 **một điểm** là thiết kế đang chạy đúng — “khác vị trí, cùng thành phố” và “cùng vị trí, khác vùng” thật sự xấp xỉ nhau. **(2)** Job **Intern** (69) vượt Data Engineer (67) dù lương bằng một phần năm: cùng vị trí và cùng thành phố thắng cùng nghề. Nếu thấy sai thì vặn **Cấp bậc** từ 15 lên 20, **đừng lọc bỏ cấp bậc** — làm vậy là đem khối rỗng quay lại. **(3)** Job **Kế toán trưởng** vẫn nằm đó ở 37 điểm, và đó là cố ý: nếu thị trường chỉ có sáu job này thì người đọc vẫn thấy sáu thẻ. Khi có năm chục job IT thì nó không bao giờ xuất hiện.',
      },

    ],
  },

  /* ────────────────────────────────────────────────────────────────────────── */
  'recommended-candidates': {
    logic: [
      '**Khối này neo vào MỘT TIN TUYỂN DỤNG, không neo vào thư mục.** Thư mục talent pool chỉ có tên và ngày tạo — không có vị trí, không cấp bậc, không địa điểm, nên không có gì để so. Thư mục là nơi **lưu** kết quả, không phải đề bài sinh ra kết quả.',
      '**Một phép tính duy nhất — job nháp không phải trường hợp riêng.** Không có cổng “job nháp đủ thông tin chưa”. Job khai thiếu thì **tự khắc điểm thấp**, vì tiêu chí job không khai được 0 điểm.',
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
      '**Bấm thẻ là tốn một lượt mở CV miễn phí**. Hết lượt thì thẻ **vẫn hiện**, nhưng mở ra là CV che hết chi tiết.',
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
          ['**Nghề** của job', '**Nghề mong muốn** trên hồ sơ'],
          ['**Kỹ năng** của job', '**Kỹ năng trên CV** của ứng viên'],
        ],
      },
      {
        kind: 'list',
        items: [
          '**KHÔNG CÓ BƯỚC NÀY THÌ ĐIỂM SỐ CHO NGƯỜI LẠ LỌT QUA.** Địa điểm 20 + kinh nghiệm 14 + lương 12 là **46** — đã trên sàn 40. Nghĩa là một người cùng thành phố, đúng số năm, đúng mức lương sẽ đủ điểm cho một job thuộc ngành hoàn toàn không liên quan. Điểm sàn không bắt được chuyện đó; chỉ bước này bắt được.',
          '**LÀ “HOẶC”, KHÔNG PHẢI “VÀ”.** Đây là gợi ý, không phải tìm kiếm: quăng lưới rộng ở đây rồi để điểm số xếp hạng. Dùng “và” thì trên một cơ sở dữ liệu cỡ Việt Nam sẽ gần như không ra ai.',
          '**ĐÂY CŨNG LÀ THỨ LÀM TIN NHÁP SƠ SÀI TỰ GIẢI QUYẾT.** Job nháp không vị trí, không nghề, không kỹ năng thì không khớp ai ở bước này → danh sách rỗng → khối rơi xuống chế độ ở §3. Không cần một luật riêng nào cho job nháp.',
          '**KHỚP CẢ THỨ HỌ MUỐN LẪN THỨ HỌ LÀM ĐƯỢC.** Vị trí và nghề mong muốn nói họ đang tìm gì; kỹ năng trên CV nói họ làm được gì. NTD cần cả hai đúng, nên cả hai đều được quyền đưa một người vào vòng chấm, và cả hai đều được chấm ở bước sau.',
          '**NGƯỜI ĐÃ BỊ “LỜ ĐI” 3 LẦN RỜI TẬP TRƯỚC KHI CẮT 500**, không phải sau — nếu không thì họ vẫn chiếm chỗ trong 500 người được chấm.',
          '⚠ **MẶT TRÁI CỦA NHÁNH KỸ NĂNG:** ứng viên gõ tay kỹ năng không khớp master data thì nhánh thứ ba **không bao giờ chạy** cho họ. Họ phải khai vị trí hoặc nghề mới vào được vòng chấm — mất nhiều hơn hẳn 4 điểm kỹ năng.',
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
          ['2 · Ưu tiên', 'Người có ngành hoặc nghề mong muốn trùng **ngành của chính công ty** lên trước. Không có job nào thì ít nhất ta vẫn biết họ làm nghề gì.'],
          ['3 · Sắp xếp', 'CV cập nhật gần nhất trước — CV mới nghĩa là người đang thật sự tìm việc.'],
          ['4 · Dàn đều', '**Mỗi nghề một người**, không thì cả hàng ra ba bạn QA tester.'],
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
          '**CÓ TRỪ MỘT LƯỢT MỞ CV MIỄN PHÍ**, cùng luật với mọi lần mở CV khác. Hết lượt thì thẻ vẫn hiện, mở ra là CV che hết chi tiết — **thẻ không bao giờ bị ẩn vì hết lượt**.',
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
          '**SO ĐƯỢC DƯỚI 4 TRONG 7 TÍN HIỆU THÌ KHÔNG IN %.** Một con số dựng trên hai ba tiêu chí gây hiểu nhầm nặng hơn là để trống. Đây là **ngoại lệ duy nhất** của luật “thiếu dữ liệu là 0”.',
          '**Ô TRỐNG KHÔNG CÓ NGHĨA LÀ 0 %.** In nhầm thành 0 là sai nghiêm trọng: nó biến một hồ sơ chưa chấm được thành một hồ sơ bị loại.',
          '**THỨ TỰ TRÊN BẢNG KHÔNG ĐỔI** vì luật “thiếu dữ liệu là 0”: mọi ứng viên của cùng một job đều chia cho cùng một số. Chỉ **con số in ra** thấp đi, và chỉ với job khai ít.',
          '**ĐƠN ĐÃ RÚT KHÔNG CÒN TRÊN BẢNG.**',
        ],
      },
      {
        kind: 'warn',
        text: '**Kỹ năng trong CV không khớp master data được tính là “không có kỹ năng”** — mất điểm tiêu chí kỹ năng, **và vẫn tính là một tiêu chí đã so được**. Tài liệu yêu cầu nói nên tính là “chưa biết” và chia lại. Build giữ cách hiện tại: nếu tính là “chưa biết”, ứng viên vẫn mất đúng số điểm đó (thiếu dữ liệu = 0, không chia lại) nhưng lại dễ tụt xuống dưới mốc 4/7 và **mất luôn cả con số %** — một bảng đầy ô trống khó đọc hơn một % thấp hơn 4 điểm. **Chưa chốt.**',
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
          ['**Vị trí** (≤3)', 'Job thuộc **nghề** của vị trí đó, **hoặc** job không gắn nghề nào', 'Nghề của job không nằm trong nghề của các vị trí đã chọn'],
          ['**Ngành** (≤3)', 'Trùng ngành, **hoặc** job không ghi ngành — job công ty tự đăng không có ô ngành nên luôn qua', 'Job **có ghi** ngành và không nằm trong danh sách đã chọn'],
          ['**Loại hợp đồng**', 'Nằm trong tập đã chọn, **hoặc** job không khai', 'Job **có ghi** và không trùng'],
          ['**Nơi làm việc** (≤3)', 'Job **remote** (qua từ mọi nơi), **hoặc** tỉnh của job / của công ty nằm trong tập, **hoặc** job không ghi địa điểm', 'Job **có ghi** tỉnh và không tỉnh nào được chọn'],
          ['**Số năm kinh nghiệm** (chỉ N₄)', 'Dải năm của job bao được số năm ứng viên; job bỏ trống dải năm thì xét cấp bậc — xem đoạn dưới bảng', 'Ứng viên thấp hơn mức job yêu cầu'],
          ['Học vấn', 'Luôn được tính', '**Không** là điều kiện đếm'],
        ],
      },
      {
        kind: 'list',
        heading: 'Hai chi tiết quyết định con số',
        items: [
          '**Vị trí so ở mức nghề, KHÔNG so đúng vị trí.** So đúng vị trí thì một vị trí hẹp ra con số kiểu “2 job”, và wizard biến thành một lời từ chối.',
          '**Thừa kinh nghiệm hoặc thừa cấp bậc không bao giờ bị loại.** Giới hạn trên trong job VN là đỉnh dải quảng cáo, không phải trần tuyển dụng.',
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      {
        kind: 'p',
        text: '**Kinh nghiệm đọc hai nguồn, theo đúng thứ tự này.** Job khai **dải năm** thì so thẳng số năm với số năm — giữ job có mức tối thiểu không cao hơn số năm ứng viên chọn. **Chỉ khi job bỏ trống dải năm** mới đọc tới **cấp bậc**: quy số năm ứng viên ra bậc theo bảng dưới, rồi giữ job có bậc không cao hơn ứng viên quá **1 bậc**. Job không khai cả hai thì **luôn được tính**.',
      },
      {
        kind: 'table',
        heading: 'Quy số năm ra cấp bậc — chỉ dùng khi job bỏ trống dải năm',
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
          ['Bước 3', 'Nghề IT (từ vị trí QA Engineer) + Đà Nẵng', '**3 job** — dưới 5 nên câu thêm con số toàn quốc: “toàn quốc có 128 việc”'],
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
      '**Con số ở bước 3 / bước 4 của wizard đếm theo nghề, còn dải này lọc theo vị trí** — nên hai con số không khớp nhau, và đó là đúng thiết kế.',
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
      { kind: 'h', text: '§2 · Chỉ job đúng vị trí — không bao giờ nới lên nghề' },
      {
        kind: 'p',
        text: 'Danh sách chỉ chứa job có vị trí **đúng bằng** tên in trên tiêu đề. Bản đang chạy còn đọc thêm một lượt nữa, lấy job của các vị trí **anh em cùng nghề** rồi ghép vào — lượt đó bỏ.',
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
        text: 'Trong tối đa 3 vị trí chọn ở bước 1, lấy vị trí **có nhiều job đang mở nhất**. Cách chọn không đổi, chỉ đổi cái đem ra đếm: đếm job của **chính vị trí đó**, không đếm cả nghề như bản đang chạy. Hoà nhau → lấy vị trí ứng viên chọn trước.',
      },
      {
        kind: 'example',
        heading: 'Hai cách đếm, hai tiêu đề khác nhau',
        scenario: 'Ứng viên chọn hai vị trí ở bước 1: **Hành chính marketing** (ngành *Marketing · Truyền thông*) và **Nhân viên kinh doanh** (ngành *Kinh doanh & Thương mại*).',
        cols: ['Vị trí chọn ở bước 1', 'Job đang mở đúng vị trí đó', 'Job đang mở của cả nghề'],
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
