/*
 * Resume management — Create CV · CV review · Talent pool · Candidate management,
 * plus the module page. Full replacements for the matching PAGE_DOCS / MODULE_DOCS
 * entries in docs.ts.
 *
 * Checked against origin/dev on 2026-10-08:
 *   svn-be ee1db5ea9 (PR #783 merged — per-CV total experience, V692)
 *   svn-web d8a43a11
 *   saramin-vn-admin 45954108
 *
 * The rule itself (CvQualificationRule) has not moved since 24/09 (69f0c3fb5). What
 * moved underneath the old text: SRM-777 (29/09) made "a CV is turned on" the only
 * gate of employer search; a human verdict became final (409 CV_ALREADY_DECIDED);
 * the web's apply picker greys out every "Unfinished" CV, uploads included; and the
 * scan flag is still off by default, which decides most of what ops actually sees.
 */
import type { PageDoc, ModuleDoc } from '../docs'

export const RESUME_PAGE_DOCS: Record<string, PageDoc> = {
  /* ────────────────────────────────────────────────────────────────────────── */
  'create-cv': {
    logic: [
      '**Một thư viện, hai loại CV:** **Saramin CV** (ứng viên soạn trong form của Saramin) và **Upload CV** (ứng viên tải file **PDF / Word** lên). Cả hai nằm chung một danh sách ở **My CVs** (tiêu đề trang: *Resume Management*).',
      '**Không giới hạn số CV.** Mỗi CV là một bản riêng: tên riêng, trạng thái riêng, số đơn đã nộp riêng.',
      '**Mỗi CV tự khai *Experienced* hoặc *No experience*.** Khai báo này quyết định CV cần những mục nào để **Đạt**: luôn cần **Education**, cần thêm **Work experience** nếu khai *Experienced*.',
      '**Total experience** (số năm kinh nghiệm) là con số hiển thị **của từng CV**, **độc lập** với khai báo *Experienced / No experience* — nó không ảnh hưởng kết quả Đạt.',
      '**Chỉ một CV được hiển thị cho nhà tuyển dụng (NTD)** tìm kiếm tại một thời điểm. Các CV khác vẫn dùng để nộp đơn bình thường.',
    ],
    how: [
      'Vào **My CVs** (`/my-profile/cv-resume`). Khung *Want to create your CV?* có hai nút: **Create Saramin CV** (`/my-profile/cv/create`) và **Upload file** (`/my-profile/cv/upload`).',
      '**Saramin CV:** chọn *Experienced / No experience* ở ô cạnh tên → điền các mục theo thanh **CV completeness** (100% = Đạt). Có sẵn một CV đã tải lên hoặc một file PDF? Bấm **Import CV** để điền sẵn — import **ghi đè** nội dung đang có trong form.',
      '**Upload CV:** chọn *Experienced / No experience* → tải file vào ô **Resume file**. **CV được tạo ngay khi file tải xong**; hệ thống đọc file để lấy các mục.',
      '**Save** (cả hai loại): đặt **CV Title** (để trống thì tự đặt), và **bắt buộc chọn** có hiển thị CV này cho NTD không.',
    ],
    watch: [
      '**CV completeness 100% chính là Đạt.** Thanh chỉ tính các mục bắt buộc; các mục còn lại là danh sách để bấm nhảy tới, không đổi con số %.',
      '**Experienced / No experience và Total experience là hai thứ khác nhau.** CV có Total experience 11 năm nhưng khai *No experience* vẫn hiển thị **11 năm** — và chỉ cần Education để Đạt.',
      '**Bật *Show CV to employers* trên một CV là tự tắt CV đang hiển thị trước đó** — không hỏi xác nhận.',
      '**CV *Unfinished* bị làm mờ ở bước nộp đơn** và không bật hiển thị được. Ứng viên phải bổ sung rồi lưu, hoặc dùng CV khác.',
      '**Xoá một CV rút các đơn đang xử lý đã nộp bằng nó** — công ty được thông báo và không xem được CV nữa. Không hoàn tác.',
    ],
    blocks: [
      { kind: 'p', text: 'Theo tài liệu *Resume Management · Create CV*, cập nhật 15/10/2026. Ảnh chụp trên dev ngày 15/10/2026.' },
      {
        kind: 'diagram',
        id: 'cv-create',
        heading: 'Tổng quan luồng',
        note: 'Hai cửa vào, một thư viện. Chấm Đạt chạy **mỗi lần lưu**, nên CV *Unfinished* tự thành Đạt ngay khi ứng viên bổ sung đủ mục rồi lưu.',
      },

      /* ── §1 ─────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '§1 · Trang My CVs', path: '/my-profile/cv-resume' },
      {
        kind: 'shot',
        src: '/shots/cv/cv-library-overview.png',
        where: 'Jobseeker site',
        caption: 'Đầu trang My CVs: **CV viewing status** (số công ty đã mở CV — §8), **Want to create your CV?** với hai nút *Create Saramin CV* · *Upload file*, và **Work preference** (§7).',
      },
      {
        kind: 'shot',
        src: '/shots/cv/cv-featured-card.png',
        where: 'Jobseeker site',
        caption: 'CV đang hiển thị cho NTD nằm ở thẻ nổi bật **Employers see this CV**, với hai bộ đếm: **CV viewing status** (số công ty đã xem CV) và **Job application** (số đơn đã nộp bằng CV này).',
      },
      {
        kind: 'shot',
        src: '/shots/cv/cv-list-row.png',
        where: 'Jobseeker site',
        caption: 'Một dòng trong danh sách CV: tên CV · nhãn *Uploaded*, ô **Show CV to employers**, bốn ô thông tin, **Applications N ›**, nút *Edit* và ô ghi chú.',
      },
      {
        kind: 'table',
        heading: 'Một dòng trong danh sách CV',
        cols: ['Phần', 'Ý nghĩa'],
        rows: [
          ['**Nhãn trạng thái**', '**Unfinished** hoặc **Can’t read** — chỉ hiện trên CV chưa đạt (§5)'],
          ['**Tên CV · nhãn nguồn**', 'Bấm tên để mở trang sửa. Nhãn **Saramin CV** hoặc **Uploaded** cho biết loại CV'],
          ['**Show / Hide CV from employers**', 'Bật / tắt hiển thị CV cho NTD (§6)'],
          ['**Bốn ô thông tin**', '**Total years of experience** · **Education** · **Latest job title** · **Skills** — lấy từ **chính CV đó**. *Latest job title* là chức danh ở công việc mới nhất trong Work experience'],
          ['**Applications N ›**', 'Số đơn đã nộp bằng CV này. Chỉ hiện trên CV đạt'],
          ['**Ghi chú**', 'Ô ghi nhớ của ứng viên cho CV này'],
          ['**Menu ⋯**', '**Download** và **Delete**. CV cuối cùng không xoá được'],
          ['**Bộ lọc**', '**Total {n}** · *All / Saramin CV / Uploaded*'],
        ],
      },
      {
        kind: 'shot',
        src: '/shots/cv/cv-list-note.png',
        where: 'Jobseeker site',
        caption: 'Khung **Please note** cuối trang: không giới hạn số CV; đúng một CV là CV để NTD tìm thấy; bật *Show CV to employers* trên CV này là tắt trên CV trước đó.',
        note: 'Dòng cuối của khung ghi *“preview, download or delete”* — menu ⋯ thật chỉ có **Download** và **Delete** (Preview nằm ở danh sách chọn CV khi nộp đơn — xem **How to apply**).',
      },
      {
        kind: 'warn',
        text: '**Xoá một CV** sẽ rút các đơn đang xử lý đã nộp bằng CV đó: công ty được thông báo và **không xem được CV nữa**. Không hoàn tác được.',
      },

      /* ── §2 ─────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '§2 · Tạo Saramin CV', path: '/my-profile/cv/create' },
      {
        kind: 'shot',
        src: '/shots/cv/saramin-cv-header.png',
        where: 'Jobseeker site',
        caption: 'Đầu form: ô **Experienced / No experience** cạnh tên (§4) và khung **Import CV** — *Auto-fill your profile with your uploaded CV in minutes.*',
      },
      {
        kind: 'list',
        items: [
          '**Experienced / No experience:** chọn ở ô cạnh tên ứng viên (§4).',
          '**Import CV:** điền sẵn form từ một CV đã tải lên, hoặc từ một file **PDF** (file này chỉ dùng để điền, **không vào thư viện**). Hệ thống hỏi trước *Import this resume over your current one?* vì import **ghi đè** nội dung đang có trong form. Chưa lưu gì cho tới khi bấm **Save**.',
          'Sửa một Saramin CV: `/my-profile/cv/:id`.',
        ],
      },
      {
        kind: 'shot',
        src: '/shots/cv/saramin-cv-work-education.png',
        where: 'Jobseeker site',
        caption: 'Mục **Work experience** (nhãn *Required*, chip **Total experience** và bút chì để sửa — §4) và **Education** (chip bậc học cao nhất, ví dụ *Bachelor*).',
      },
      {
        kind: 'table',
        heading: 'Các mục của form',
        cols: ['Mục', 'Bắt buộc?', 'Ghi chú'],
        rows: [
          ['**About**', 'Không', 'Tóm tắt nghề nghiệp và mục tiêu'],
          ['**Work experience**', '**Có, trừ khi** CV khai *No experience*', 'Có chip **Total experience** và bút chì để sửa (§4). Khai *No experience* thì mục Education lên trên Work experience'],
          ['**Education**', '**Luôn bắt buộc**', 'Chọn mục nào là bậc học cao nhất'],
          ['**Highlight projects**', 'Không', '—'],
          ['**Skills**', 'Không', 'Tối đa **20** kỹ năng'],
          ['**Foreign languages**', 'Không', '—'],
          ['*Certificates · Awards · Activities · References*', 'Không', 'Tuỳ chọn, thêm bằng nút **+** ở thanh CV completeness'],
        ],
      },
      {
        kind: 'shot',
        src: '/shots/cv/saramin-cv-completeness.png',
        where: 'Jobseeker site',
        caption: 'Thanh **CV completeness** — **100% nghĩa là CV Đạt** (*your CV is ready!*). Chỉ *Work experience* và *Education* (*Required*) được tính; các mục còn lại là danh sách để bấm nhảy tới, bốn mục cuối thêm bằng **+**.',
      },
      {
        kind: 'shot',
        src: '/shots/cv/saramin-cv-show-choice.png',
        where: 'Jobseeker site',
        caption: 'Khi lưu mà đã có CV khác đang hiển thị: **Keep that CV** / **Switch to this CV** — bắt buộc chọn một.',
      },
      {
        kind: 'shot',
        src: '/shots/cv/saramin-cv-save-bar.png',
        where: 'Jobseeker site',
        caption: 'Thanh lưu: **CV Title** (*if left blank, a default title is saved automatically*), **Resume preview**, **Save**.',
      },
      {
        kind: 'list',
        heading: 'Lưu CV',
        items: [
          'Khi lưu, ứng viên **bắt buộc chọn** có hiển thị CV này cho NTD không: **Show this CV to recruiters** / **Show no CV** — hoặc, khi đã có CV khác đang hiển thị, **Keep that CV** / **Switch to this CV**.',
          '**CV Title** để trống thì hệ thống tự đặt: *{tên}’s CV – {số năm} of experience*, hoặc *– No experience yet* khi CV chưa có số năm kinh nghiệm. Số năm lấy từ **Total experience của chính CV đó**.',
          '**Resume preview:** xem trước CV với nội dung đang soạn.',
        ],
      },
      {
        kind: 'list',
        heading: 'Không lưu được khi',
        items: [
          'Thiếu mục bắt buộc: *Please fill in {sections} before you finish.*',
          'Còn mục đang mở sửa chưa lưu: *Please save everything you are still editing before you finish.*',
          'Chưa chọn có hiển thị CV hay không: *Please choose whether to show your CV to recruiters.*',
        ],
      },
      {
        kind: 'open',
        text: '**Lỗi đã báo dev, đang chờ sửa.** Upload CV có **Total years of experience = 4 months** nhưng tên tự đặt là *“– 2 years of experience”* — tên đang lấy số năm mặc định (Onboarding), không lấy Total experience **của chính CV đó** như §2 mô tả.',
      },

      /* ── §3 ─────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '§3 · Tải CV lên (Upload CV)', path: '/my-profile/cv/upload' },
      {
        kind: 'shot',
        src: '/shots/cv/upload-experienced.png',
        where: 'Jobseeker site',
        caption: 'Trang Upload khi chọn **Experienced**: khung **What your file should include** ghi *Required* cho **Work experience** và **Education**.',
      },
      {
        kind: 'shot',
        src: '/shots/cv/upload-no-experience.png',
        where: 'Jobseeker site',
        caption: 'Cùng trang khi chọn **No experience**: chỉ **Education** ghi *Required*.',
      },
      {
        kind: 'list',
        items: [
          'Trang Upload **chỉ có tải file**: ứng viên chọn *Experienced / No experience* và tải file vào ô **Resume file**.',
          '**File nhận:** PDF hoặc Word, tối đa **10 MB**, 1 file. File sai định dạng hoặc quá dung lượng: *The file must be a PDF or Word document, no larger than 10 MB.*',
          'Khung **What your file should include** bên phải nhắc file cần có những mục nào, theo khai báo.',
        ],
      },
      {
        kind: 'shot',
        src: '/shots/cv/upload-file-preview.png',
        where: 'Jobseeker site',
        caption: 'File đã tải lên: ô Resume file chuyển sang **File preview**.',
      },
      {
        kind: 'list',
        items: [
          '**CV được tạo ngay khi file tải xong.** Hệ thống đọc (parse) file để lấy các mục: kinh nghiệm, học vấn, kỹ năng…',
          'Bấm **Save** để đặt tên CV, chọn *Experienced / No experience* và chọn có hiển thị CV cho NTD không (như Saramin CV).',
          '**Total experience** của Upload CV lấy từ kinh nghiệm đọc được trong file.',
        ],
      },
      {
        kind: 'table',
        heading: 'So sánh hai loại CV',
        cols: ['', 'Saramin CV', 'Upload CV'],
        rows: [
          ['**Nội dung**', 'Ứng viên tự gõ trong form; hệ thống tạo ra file PDF', 'File gốc của ứng viên; hệ thống đọc file để lấy các mục'],
          ['**File nhận**', '—', 'PDF, Word, ≤ 10 MB'],
          ['**Điền sẵn**', '**Import CV** từ CV đã tải lên hoặc file PDF', 'Không cần, file tự được đọc'],
          ['**Chấm Đạt**', 'Ngay từ các mục đã nhập', 'Từ kết quả đọc file'],
          ['**Total experience**', 'Sửa ở chip Total experience', 'Lấy từ file'],
        ],
      },

      /* ── §4 ─────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '§4 · Experienced / No experience và Total experience' },
      {
        kind: 'table',
        heading: 'Hai thứ khác nhau, độc lập với nhau',
        note: 'Ví dụ: CV có Total experience **11 năm** nhưng khai *No experience* vẫn hiển thị **11 năm**.',
        cols: ['', 'Experienced / No experience', 'Total experience'],
        rows: [
          ['**Là gì**', 'Lời khai “tôi đã đi làm chưa”', 'Số năm + tháng kinh nghiệm của CV'],
          ['**Dùng để**', '**Chỉ** để chấm CV Đạt: có cần mục Work experience hay không', '**Hiển thị** kinh nghiệm của ứng viên ở mọi nơi'],
          ['**Hiển thị như kinh nghiệm?**', '**Không**', 'Có'],
          ['**Ảnh hưởng CV Đạt?**', 'Có', 'Không'],
        ],
      },
      {
        kind: 'shot',
        src: '/shots/cv/edit-total-experience.png',
        where: 'Jobseeker site',
        caption: 'Hộp **Edit total experience** (bút chì cạnh chip Total experience): *Enter manually* (năm + tháng) hoặc *Calculate automatically*, kèm ô *Exclude overlapping periods*.',
      },
      {
        kind: 'table',
        heading: 'Cách tính Total experience',
        cols: ['Tình huống', 'Total experience'],
        rows: [
          ['Onboarding: ô **“Số năm kinh nghiệm của bạn”**', 'Ứng viên tự gõ số năm'],
          ['CV đầu tiên', 'Lấy số năm ở Onboarding làm mặc định'],
          ['Bỏ qua Onboarding', 'Hiển thị **“--”** (chưa có thông tin)'],
          ['Sửa trên một CV', 'Chỉ đổi CV đó. Con số mới thành mặc định cho các CV tạo sau'],
          ['**Enter manually**', 'Đúng con số ứng viên gõ (năm và tháng; tháng từ 0 đến 11)'],
          ['**Calculate automatically**', 'Cộng thời gian các công việc trong Work experience'],
          ['*Exclude overlapping periods*: **bật**', 'Khoảng thời gian trùng chỉ tính 1 lần. Ví dụ 2 công việc 3 tháng làm song song → **3 tháng**'],
          ['*Exclude overlapping periods*: **tắt**', 'Cộng dồn tất cả. Ví dụ trên → **6 tháng**'],
        ],
      },
      {
        kind: 'p',
        text: '**Phía NTD** (Talent Pool, xem chi tiết CV): số năm kinh nghiệm hiển thị kèm tooltip, ghi rõ con số do ứng viên tự khai và có thể khác với kinh nghiệm thực tế liệt kê trong CV.',
      },

      /* ── §5 ─────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '§5 · CV Đạt và chưa đạt' },
      {
        kind: 'table',
        heading: 'Tiêu chí Đạt',
        cols: ['CV khai', 'Bắt buộc', 'CV completeness'],
        rows: [
          ['**No experience**', 'Ít nhất 1 **Education**', 'Có Education → **100%**'],
          ['**Experienced**', 'Ít nhất 1 **Work experience** và 1 **Education**', 'Mỗi mục **50%**, đủ cả hai → **100%**'],
        ],
      },
      {
        kind: 'list',
        items: [
          'Skills, Highlight projects và Total experience **không** ảnh hưởng tới kết quả Đạt.',
          'Đổi *Experienced ↔ No experience* thì CV được **chấm lại ngay khi lưu**. Ví dụ CV đang *Unfinished* vì thiếu Work experience có thể thành Đạt khi đổi sang *No experience*, nếu đã có Education.',
        ],
      },
      {
        kind: 'table',
        heading: 'Ứng viên thấy gì',
        note: 'CV chưa đạt **không dùng để nộp đơn được** và **không bật hiển thị cho NTD được** (§6; nộp đơn: **How to apply**).',
        cols: ['Trạng thái', 'Khi nào', 'Nhãn trước tên CV', 'Nút trên dòng'],
        rows: [
          ['**Đạt**', 'Đủ mục bắt buộc', 'Không có nhãn', '*Edit*'],
          ['**Chưa đủ**', 'Thiếu mục bắt buộc (Saramin CV), hoặc file đã đọc nhưng thiếu mục (kể cả file scan không đọc ra chữ)', '**Unfinished** + thanh *Completion N%*', '*Complete CV*'],
          ['**Bị từ chối**', 'Bộ phận kiểm duyệt của Saramin từ chối CV', '**Can’t read**; rê chuột lên nhãn để xem lời nhắn', '*Complete CV*. Trang sửa có khung **This CV wasn’t approved** (lời nhắn trong khung **chưa có**)'],
          ['**Đang đọc file**', 'File tải lên chưa đọc xong', 'Không có nhãn', '*Edit*'],
        ],
      },
      {
        kind: 'shot',
        src: '/shots/cv/cv-not-approved.png',
        where: 'Jobseeker site',
        caption: 'CV bị từ chối: trang sửa có khung **This CV wasn’t approved**.',
        note: 'Lời nhắn của người duyệt bên trong khung **chưa được làm** — hiện khung chỉ có tiêu đề.',
      },
      {
        kind: 'open',
        text: '**Hai tài liệu đang nói khác nhau về file upload thiếu mục.** Tài liệu này: CV *Unfinished* — **kể cả file upload** — **không nộp đơn được**. Tài liệu *Candidate Management* (14/10): file upload thiếu trường bắt buộc vẫn nộp được, hồ sơ giữ ở *Not Sent* và ứng viên thấy *In Review* (AC3). Cần chốt một bên.',
      },

      /* ── §6 ─────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '§6 · Hiển thị CV cho nhà tuyển dụng (Show CV to employers)' },
      {
        kind: 'table',
        note: '**Chỉ một CV hiển thị tại một thời điểm.** Bật một CV hiển thị cũng cập nhật hồ sơ của ứng viên theo nội dung CV đó.',
        cols: ['Tình huống', 'Điều gì xảy ra'],
        rows: [
          ['**Bật trên một CV**', 'Chọn **Show CV to employers** ở dòng CV. CV đó lên thẻ **Employers see this CV**; CV đang hiển thị trước đó tự tắt. Không hỏi xác nhận'],
          ['**Tắt**', 'Hệ thống hỏi trước: *If you’re job hunting right now, keep offers open too*, với 2 lựa chọn **Keep my CV visible** (mặc định) và **Hide my CV**'],
          ['**Không CV nào đang hiển thị**', 'Khung **CV hidden from employers**, chọn CV ở ô *Choose a CV* rồi bấm **Let employers find me**'],
          ['**File tải lên đầu tiên**', 'Nếu ứng viên chưa có CV nào đang hiển thị, file tải lên đầu tiên đọc xong được **tự đặt làm CV hiển thị**'],
          ['**Phía NTD**', 'Ứng viên có CV đang hiển thị — và CV đó *Qualified* — thì xuất hiện trong Talent Pool của NTD. Tên và thông tin liên hệ được che tới khi NTD mở khoá (xem **Talent pool**)'],
        ],
      },

      /* ── §7 ─────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '§7 · Work preference' },
      {
        kind: 'shot',
        src: '/shots/cv/work-preference.png',
        where: 'Jobseeker site',
        caption: 'Trang **Edit work preference** (bấm *Edit work preference* trên My CVs). Dùng để gợi ý tin tuyển dụng và lời mời phù hợp — **độc lập với CV**.',
      },
      {
        kind: 'table',
        cols: ['Trường', 'Bắt buộc', 'Tối đa', 'Chọn từ'],
        rows: [
          ['**Job role**', 'Có', '3', 'Danh mục ngành nghề (Ngành › Vị trí) — master data *Job taxonomy*'],
          ['**Work location**', 'Có', '3', 'North / Central / South › tỉnh / thành phố'],
          ['**Industry**', 'Không', '3', 'Danh mục lĩnh vực — master data *Industries*'],
          ['**Contract type**', 'Có', '3', 'Fulltime, Part-time, Freelance, Fixed-term contract, Internship, Probation, Seasonal / Temp'],
          ['**Monthly salary**', 'Không', '—', 'Số tiền, VND hoặc USD'],
        ],
      },
      {
        kind: 'shot',
        src: '/shots/cv/work-preference-job-role.png',
        where: 'Jobseeker site',
        caption: 'Chọn **Job role**: ngành bên trái, vị trí bên phải, tối đa 3 (*selected 1/3*).',
      },
      {
        kind: 'shot',
        src: '/shots/cv/work-preference-location.png',
        where: 'Jobseeker site',
        caption: 'Chọn **Work location**: *North / Central / South* bên trái, tỉnh / thành phố bên phải, tối đa 3.',
      },

      /* ── §8 ─────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '§8 · CV viewing status' },
      {
        kind: 'shot',
        src: '/shots/cv/cv-viewing-status.png',
        where: 'Jobseeker site',
        caption: 'Trang **CV viewing status**: 3 bộ đếm (*Companies view CV · Companies saved CV · Companies unlocked CV*), 3 tab (*All viewing · Saved · Unlocked*), lọc theo thời gian (*Last 6 months*), mỗi công ty một dòng kèm số lần xem và nút *View jobs*.',
      },
      {
        kind: 'list',
        items: [
          'Ứng viên xem những công ty đã tương tác với CV của mình trong Talent Pool: **đã xem**, **đã lưu**, **đã mở khoá** thông tin liên hệ.',
          'Lịch sử lưu tối đa **180 ngày**. Lọc theo thời gian (ví dụ *Last 6 months*).',
        ],
      },

    ],
  },

  /* ────────────────────────────────────────────────────────────────────────── */
  'cv-review': {
    logic: [
      '**Mọi CV đều được kiểm tra trước khi tới nhà tuyển dụng (NTD).** CV đạt thì tự động gửi đi. CV đáng ngờ (không đọc được, thiếu thông tin) vào **hàng đợi chờ người duyệt**.',
      '**Duyệt CV, không duyệt từng đơn.** Mỗi quyết định áp dụng cho **mọi hồ sơ dùng cùng phiên bản CV** đó, ở mọi công ty.',
      '**Đơn gắn CV đang chờ duyệt bị giữ ở *Not Sent*, vô thời hạn.** Không có cơ chế tự gửi sau một khoảng thời gian; chỉ người duyệt mới giải phóng được. Hàng đợi bị bỏ quên nghĩa là ứng viên và NTD đều đang chờ mà không biết.',
      '**Quyết định duyệt / từ chối là chung cuộc** — không gỡ được. Muốn xét lại, ứng viên cần tải lên CV khác hoặc phiên bản mới.',
      'Hồ sơ đã gửi tới NTD có thể kết thúc sớm theo 2 cách: **Recall CV** (CV bị từ chối sau khi đã gửi) và **Withdraw application** (ứng viên xin rút đơn — **đang triển khai, chưa có trên màn hình**).',
      'Hai màn hình: **CV review** (`/recruitment/cv-review`) — hàng đợi chính, mỗi dòng một CV; và **Applications** (`/recruitment/applications`) — mỗi dòng một đơn, thao tác nhanh qua menu ⋮. Ai dùng: Admin, Operator, CS; cần quyền xem CV review và quyền duyệt CV.',
    ],
    how: [
      'Mở **CV review** → tab **Needs review**, đọc từ trên xuống — dòng trên cùng là CV **chờ lâu nhất**.',
      'Xem cột **Used to apply** và **In talent pool** trước khi quyết: chúng cho biết quyết định ảnh hưởng tới bao nhiêu đơn và có chạm kho tìm kiếm không.',
      'Bấm một dòng mở hộp duyệt: file gốc bên trái; bên phải **What the scan said** · **The only question** · **This decision affects**. Chọn **Approve → sent + showing** (§4) hoặc **Reject** (§5).',
      'Trên **Applications**: menu ⋮ của hồ sơ đang chờ có **Approve CV…** / **Reject CV…**; của hồ sơ đã gửi có **Recall** (§6).',
    ],
    watch: [
      '**Xử lý hàng đợi hằng ngày.** Thẻ **Overdue · 24h** nên luôn bằng 0 — mỗi CV chờ có thể đang giữ nhiều đơn ở nhiều công ty.',
      '**Reject CV: chọn lý do trước, rồi mới sửa lời nhắn.** Đổi lý do sẽ **ghi đè** lời nhắn đang soạn.',
      '**Lời nhắn soạn sẵn của *CV but not enough information*** ghi “ít nhất một kinh nghiệm — hoặc học vấn nếu chưa đi làm”. Quy tắc đúng là **luôn cần học vấn**, cộng kinh nghiệm nếu ứng viên khai *Experienced*. Sửa câu trước khi gửi.',
      '**Approve một file không đọc được** vẫn làm CV đạt, nhưng hệ thống không lấy được chữ nào từ file — NTD không tìm thấy CV này khi tìm theo kỹ năng. Nên xin ứng viên một file PDF có chữ.',
      '**Quyết định không gỡ được.** Đừng hứa với ứng viên là “sẽ gỡ”; hướng dẫn ứng viên tải CV khác.',
      '**Thông tin liên hệ luôn ẩn trên màn CV review.** Mỗi lần mở danh sách hoặc mở file CV đều được ghi log.',
    ],
    blocks: [
      { kind: 'p', text: 'Theo tài liệu *Resume Management · CV review*, cập nhật 15/10/2026. Ảnh chụp trên dev ngày 15/10/2026. Mọi chỗ ghi **đang triển khai** là hành vi đã chốt nhưng **chưa có trên màn hình** — chưa test được.' },
      {
        kind: 'diagram',
        id: 'cvr-overview',
        heading: 'Tổng quan',
        note: 'Ô và mũi tên **đứt nét** là *Withdraw application* — **đang triển khai**.',
      },

      /* ── §1 ─────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '§1 · Các trạng thái' },
      {
        kind: 'p',
        text: 'Mỗi hồ sơ ứng tuyển có **2 trạng thái trên Admin**: **CV Status** (kết quả kiểm tra CV) và **Application Status** (hồ sơ đã tới NTD hay chưa). Cạnh đó là **Stage · Employer** (vị trí thẻ trên Kanban của NTD), và từ ba thứ này hệ thống tính ra **trạng thái ứng viên thấy**.',
      },
      {
        kind: 'shot',
        src: '/shots/cvr/applications-status-columns.png',
        where: 'Admin',
        caption: 'Ba cột **CV Status · Application Status · Stage · Employer** trên màn Applications. Hồ sơ chưa gửi hiện “—” ở Stage.',
      },
      {
        kind: 'table',
        heading: '§1.1 · CV Status — kết quả kiểm tra CV',
        cols: ['CV Status', 'Nghĩa là', 'Vì sao có', 'Thao tác được'],
        rows: [
          ['**Qualified**', 'CV đạt', 'Saramin CV đủ mục bắt buộc; file tải lên đọc được và đủ mục bắt buộc; hoặc được **Approve**', 'Recall CV · Withdraw application *(đang triển khai)*'],
          ['**Cannot Read**', 'Không đọc được', 'File hỏng, có mật khẩu, hoặc là bản scan không có chữ', 'Approve CV · Reject CV · Withdraw application *(đang triển khai)*'],
          ['**Not Enough Information**', 'Thiếu thông tin', 'Đọc được nhưng thiếu mục bắt buộc: *Experienced* cần Học vấn + Kinh nghiệm; *No experience* cần Học vấn', 'Approve CV · Reject CV · Withdraw application *(đang triển khai)*'],
          ['**Rejected**', 'Bị từ chối', 'Người duyệt **Reject CV** hoặc **Recall CV**', 'Chỉ xem'],
        ],
      },
      {
        kind: 'table',
        heading: '§1.2 · Application Status — hồ sơ đã tới NTD hay chưa',
        cols: ['Application Status', 'Nghĩa là', 'NTD thấy hồ sơ?'],
        rows: [
          ['**Not Sent**', 'Hồ sơ bị giữ ở Admin: đang chờ duyệt, hoặc CV đã bị từ chối', 'Không'],
          ['**Sent**', 'Hồ sơ đã gửi tới NTD, thẻ nằm ở cột *Application Received*', 'Có'],
          ['**Recall**', 'Hồ sơ đã gửi rồi bị thu hồi vì CV bị từ chối', 'Thấy nhãn thu hồi, thông tin CV bị khoá'],
          ['**Withdrawn** — *đang triển khai*', 'Ứng viên xin rút đơn khỏi job, CS thực hiện', 'Thấy nhãn thu hồi, thông tin CV bị khoá'],
        ],
      },
      {
        kind: 'table',
        heading: '§1.3 · Stage · Employer — vị trí thẻ trên Kanban của NTD',
        note: 'Chỉ NTD đổi được (kéo thẻ). Admin chỉ đọc. Chi tiết Kanban: **Candidate management §5**.',
        cols: ['Stage', 'Nghĩa là'],
        rows: [
          ['**Application Received**', 'Cột đầu cố định — mọi hồ sơ vừa *Sent* vào đây'],
          ['**In Process**', 'Thẻ ở bất kỳ cột giữa nào do NTD tạo (Interview 1, Test…)'],
          ['**Passed**', 'Cột cuối cố định Passed'],
          ['**Not This Time**', 'Cột cuối cố định Not This Time'],
          ['**—**', 'Hồ sơ chưa gửi — NTD chưa có thẻ nào'],
        ],
      },
      {
        kind: 'table',
        heading: '§1.4 · Tổ hợp có thể gặp — và ứng viên thấy gì',
        note: '*Application Received trở đi* = *Application Received · Application Viewed · Application Saved · In Process · Passed · Not This Time*, theo thẻ và flag — 9 trạng thái ứng viên thấy nằm ở **Candidate management §6**.',
        cols: ['CV Status · Application Status', 'Nghĩa là', 'Ứng viên thấy'],
        rows: [
          ['Qualified · Sent', 'Đã đạt, đã gửi', 'Application Received trở đi'],
          ['Cannot Read · Not Sent', 'Chờ duyệt', 'In Review'],
          ['Not Enough Information · Not Sent', 'Chờ duyệt', 'In Review'],
          ['Rejected · Not Sent', 'Bị từ chối trước khi gửi, kết thúc', 'Invalid Application'],
          ['Rejected · Recall', 'Đã gửi rồi bị thu hồi, kết thúc', 'Application Withdrawn'],
          ['Qualified / Cannot Read / Not Enough Information · Withdrawn — *đang triển khai*', 'Ứng viên rút đơn, kết thúc', 'Application Withdrawn'],
        ],
      },
      {
        kind: 'table',
        heading: '§1.5 · Thao tác theo trạng thái (menu ⋮)',
        cols: ['CV Status · Application Status', 'Thao tác'],
        rows: [
          ['Cannot Read / Not Enough Information · Not Sent', 'View details · **Approve CV** · **Reject CV** · Withdraw application *(đang triển khai)*'],
          ['Qualified · Sent', 'View details · **Recall CV** · Withdraw application *(đang triển khai)*'],
          ['Rejected · Not Sent / Rejected · Recall / … · Withdrawn', 'Chỉ View details'],
        ],
      },
      {
        kind: 'shot',
        src: '/shots/cvr/menu-waiting.png',
        where: 'Admin',
        caption: 'Menu ⋮ của hồ sơ **đang chờ duyệt**: *View details* · **Approve CV…** · **Reject CV…**',
      },
      {
        kind: 'shot',
        src: '/shots/cvr/menu-sent.png',
        where: 'Admin',
        caption: 'Menu ⋮ của hồ sơ **đã gửi**: *View details* · **Recall**',
      },
      {
        kind: 'list',
        items: [
          '**Reject CV** dùng cho hồ sơ **chưa gửi**. **Recall CV** dùng cho hồ sơ **đã gửi**. Cả hai đều là từ chối CV; tên thao tác theo trạng thái của hồ sơ đang thao tác.',
          '**Withdraw application** *(đang triển khai)* không đánh giá CV, chỉ rút **đúng một** hồ sơ theo yêu cầu ứng viên.',
        ],
      },

      /* ── §2 ─────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '§2 · Màn CV review', path: '/recruitment/cv-review' },
      {
        kind: 'list',
        heading: 'Logic',
        items: [
          'Mỗi dòng là **một CV** cần người xem, không phải một đơn ứng tuyển.',
          'CV tự đạt **không bao giờ vào hàng đợi** — nó được gửi đi ngay.',
          'CV được kiểm tra lại mỗi khi ứng viên lưu. Nhiều CV **tự rời hàng đợi** khi ứng viên bổ sung phần còn thiếu.',
          'Hệ thống **không bao giờ tự từ chối**. Từ chối luôn là quyết định của người duyệt.',
        ],
      },
      {
        kind: 'table',
        heading: 'Màn hình',
        cols: ['Phần', 'Chi tiết'],
        rows: [
          ['**Tab**', '**Needs review** (chờ lâu nhất lên trước) · **Approved** · **Rejected** (mới nhất lên trước). Giữ toàn bộ lịch sử'],
          ['**Overview**', '4 thẻ: **Overdue · 24h** (CV chờ quá 24 giờ, mục tiêu luôn bằng 0) · **Decided · 7 days** · **Rejected · 7 days** · **Avg time to decide**'],
          ['**Cột**', 'Candidate · CV (tên, nhãn nguồn, phiên bản) · Basic information · Work preference · Contact (luôn ẩn) · CV status · **Used to apply** · **In talent pool** · CV content · Updated · Actions'],
          ['**Tìm · Lọc**', 'Tìm theo tên ứng viên hoặc tên file. Lọc theo CV status, Used to apply, In talent pool, lý do từ chối (tab Rejected)'],
          ['**Phiên bản**', 'Ghi `v.N/M`. Hiện **màu vàng** khi đang xem bản cũ hơn bản hiện tại của ứng viên'],
          ['**Export**', 'Có nút Export'],
        ],
      },
      {
        kind: 'example',
        heading: 'Một lần duyệt giải phóng bao nhiêu đơn',
        scenario: 'CV của ứng viên A vào *Needs review* ngày **02/03**. Từ 03/03 tới 09/03, A nộp 4 đơn vào 4 job của 3 công ty bằng chính CV đó.',
        cols: ['Ngày', 'Việc xảy ra', 'NTD thấy gì'],
        rows: [
          ['02/03', 'CV của A vào *Needs review*', '—'],
          ['03/03 – 09/03', 'A nộp 4 đơn', '**Không thấy đơn nào** — cả 4 đơn ở *Not Sent*'],
          ['10/03', 'Người duyệt bấm **Approve**', '**Cả 4 đơn được gửi cùng lúc**, mỗi công ty nhận thông báo'],
        ],
      },

      /* ── §3 ─────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '§3 · Màn Applications', path: '/recruitment/applications' },
      {
        kind: 'p',
        text: 'Mỗi dòng là **một đơn ứng tuyển**. Dùng để xem vì sao một hồ sơ còn *Not Sent*, và thao tác nhanh trên từng hồ sơ. Chi tiết đầy đủ ở trang **Applications**.',
      },
      {
        kind: 'shot',
        src: '/shots/cvr/applications-overview.png',
        where: 'Admin',
        caption: 'Bốn thẻ tổng quan: **Overdue · 24h** (đơn chờ quá 24 giờ chưa xử lý) · **New · 7 days** (đơn mới trong 7 ngày) · **Waiting on employer** (đơn đã gửi, NTD chưa xử lý) · **Avg time to rule** (thời gian trung bình để ra quyết định).',
      },
      {
        kind: 'list',
        items: [
          '**Tab** (lọc theo Application Status): *All · Not sent · Sent · Recall* · *Withdrawn* (**đang triển khai**).',
          '**Bộ lọc** theo CV Status: chọn được nhiều giá trị. Xem hàng đợi chờ duyệt: tab *Not sent* + CV Status = *Cannot Read*, *Not Enough Information*.',
          '**View details** mở trang chi tiết hồ sơ: thông tin ứng viên, mong muốn công việc, file CV, thông tin liên hệ và CV status của đơn.',
        ],
      },
      {
        kind: 'shot',
        src: '/shots/cvr/application-detail.png',
        where: 'Admin',
        caption: 'Trang chi tiết một hồ sơ **Sent**: thông tin ứng viên, *Working preference set by the user*, khung *Contact* (đã che trong ảnh) và khung *Application* với file CV và **CV status**.',
        note: 'Khung *Application* ghi CV status là *Approved* — chỗ khác trên Admin dùng chữ **Qualified**.',
      },

      /* ── §4 ─────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '§4 · Approve CV' },
      {
        kind: 'p',
        text: '**Dùng khi:** CV đang chờ duyệt (*Cannot Read / Not Enough Information · Not Sent*) nhưng thực ra dùng được.',
      },
      {
        kind: 'shot',
        src: '/shots/cvr/approve-dialog.png',
        where: 'Admin',
        caption: 'Hộp **Send this CV to the employer?** cho biết phiên bản CV này đang chờ ở bao nhiêu đơn và sẽ gửi tới bao nhiêu công ty, kèm phiên bản file (*v.1*). CV cũng vào kho tìm kiếm của NTD nếu ứng viên đã bật hiển thị. Nút **Approve and send**.',
      },
      {
        kind: 'table',
        heading: 'Kết quả',
        cols: ['', 'Sau Approve'],
        rows: [
          ['**Hồ sơ đang chờ dùng cùng phiên bản CV**', '**Qualified · Sent**, tất cả được gửi cùng lúc'],
          ['**NTD**', 'Thẻ mới ở cột *Application Received*, nhận email báo đơn mới'],
          ['**Ứng viên**', '*Application Received*'],
          ['**Kho tìm kiếm**', 'CV xuất hiện nếu ứng viên đã bật hiển thị'],
        ],
      },

      /* ── §5 ─────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '§5 · Reject CV' },
      {
        kind: 'p',
        text: '**Dùng khi:** CV đang chờ duyệt và không thể gửi tới NTD.',
      },
      {
        kind: 'shot',
        src: '/shots/cvr/reject-dialog-not-enough-info.png',
        where: 'Admin',
        caption: 'Hộp **Reject this CV**, lý do *CV but not enough information* (chọn sẵn): khối vàng *The candidate sees this* (tag, lời nhắn, nút), *Internal note*, và khối ảnh hưởng ngay trên nút **Reject CV**.',
      },
      {
        kind: 'list',
        heading: 'Các bước',
        items: [
          '**Chọn lý do trước.** Lý do là nội bộ, ứng viên không thấy, nhưng nó **điền sẵn lời nhắn và nút** cho ứng viên.',
          '**Sửa lời nhắn** gửi ứng viên (bắt buộc, tối đa **300** ký tự).',
          '**Chọn nút** hiện cho ứng viên: *Upload another CV · Update profile · Contact support · No button*.',
          '**Nhập ghi chú nội bộ** (bắt buộc, tối đa **500** ký tự). Chỉ Admin đọc được.',
          'Kiểm tra **khối ảnh hưởng** (bao nhiêu đơn bị từ chối), rồi bấm **Reject CV**.',
        ],
      },
      {
        kind: 'table',
        heading: 'Bốn lý do',
        note: 'Saramin CV (soạn trong form) chỉ nhận 2 lý do cuối: *CV but not enough information*, *Other*.',
        cols: ['Lý do', 'Lời nhắn điền sẵn cho ứng viên', 'Nút mặc định'],
        rows: [
          ['**Can’t read**', '“Hệ thống không đọc được nội dung trong file này. Bạn thử tải lên bản PDF xuất trực tiếp từ Word hoặc Google Docs giúp nhé.”', 'Upload another CV'],
          ['**Not a CV**', '“File bạn tải lên không phải một CV. Bạn kiểm tra và tải lại đúng file giúp nhé.”', 'Upload another CV'],
          ['**CV but not enough information** *(chọn sẵn)*', '“Hồ sơ chưa đủ thông tin để gửi tới nhà tuyển dụng…”', 'Upload another CV'],
          ['**Other**', 'Không soạn sẵn, phải tự viết', 'No button'],
        ],
      },
      {
        kind: 'shot',
        src: '/shots/cvr/reject-dialog-cant-read.png',
        where: 'Admin',
        caption: 'Lý do **Can’t read** — lời nhắn điền sẵn, nút *Upload another CV*.',
      },
      {
        kind: 'shot',
        src: '/shots/cvr/reject-dialog-not-a-cv.png',
        where: 'Admin',
        caption: 'Lý do **Not a CV** — lời nhắn điền sẵn, nút *Upload another CV*.',
      },
      {
        kind: 'shot',
        src: '/shots/cvr/reject-dialog-other.png',
        where: 'Admin',
        caption: 'Lý do **Other** — không có lời nhắn soạn sẵn, phải tự viết; nút mặc định *No button*.',
      },
      {
        kind: 'table',
        heading: 'Kết quả',
        note: '**Không gửi email tự động** cho ứng viên khi bị từ chối.',
        cols: ['', 'Sau Reject CV'],
        rows: [
          ['**Hồ sơ chưa gửi dùng cùng phiên bản CV**', '**Rejected · Not Sent**. NTD không bao giờ thấy'],
          ['**Hồ sơ đã gửi dùng cùng phiên bản CV**', '**Rejected · Recall** (xử lý như §6)'],
          ['**Hồ sơ dùng phiên bản CV khác**', 'Không đổi'],
          ['**Ứng viên**', '**Invalid Application** (hồ sơ chưa gửi) · **Application Withdrawn** (hồ sơ đã gửi)'],
        ],
      },
      {
        kind: 'open',
        text: '**Chữ trên hộp Reject đang nói khác tài liệu — cần dev hoặc BA chốt.** (1) Chân hộp ghi *“Waiting applications close whatever file they used. Ones a company already holds are never taken back by a reject.”* — tức Reject **không** thu hồi hồ sơ đã gửi và đóng hồ sơ chờ **bất kể phiên bản**; tài liệu ghi hồ sơ đã gửi cùng phiên bản thành **Rejected · Recall** và phiên bản khác **không đổi**. (2) Ứng viên thấy nhãn gì: hộp ghi tag **“Chưa được duyệt”** (*every reason uses this tag*), còn danh sách CV của ứng viên hiện nhãn **Can’t read** cho mọi lý do (xem **Create CV §5**).',
      },

      /* ── §6 ─────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '§6 · Recall CV' },
      {
        kind: 'p',
        text: '**Dùng khi:** CV **đã gửi** tới NTD (*Qualified · Sent*, ở bất kỳ cột nào) nhưng sau đó phát hiện không hợp lệ: file rác, gian lận, không phải CV. **Ai làm:** chỉ Admin / CS.',
      },
      {
        kind: 'shot',
        src: '/shots/cvr/recall-step-1.png',
        where: 'Admin',
        caption: '**Bước 1 / 2** — hộp *Recall application*: chọn lý do (*Can’t read · Not a CV · CV but not enough information · Other*). *“Takes this CV back from every company it was sent to with the same file.”*',
      },
      {
        kind: 'shot',
        src: '/shots/cvr/recall-step-2.png',
        where: 'Admin',
        caption: '**Bước 2 / 2** — nhập ghi chú nội bộ (bắt buộc, tối đa 500 ký tự). Hộp cho biết số đơn và số công ty bị ảnh hưởng (*Affects 1 application at 1 company*). Chọn *Other* thì có thêm ô nhập lý do.',
      },
      {
        kind: 'table',
        heading: 'Kết quả',
        cols: ['', 'Sau Recall CV'],
        rows: [
          ['**Hồ sơ đã gửi dùng cùng phiên bản CV**', '**Rejected · Recall**'],
          ['**Hồ sơ chưa gửi dùng cùng phiên bản CV**', '**Rejected · Not Sent**'],
          ['**Hồ sơ đã Withdrawn** *(đang triển khai)*', 'Không đổi'],
          ['**NTD**', 'Nhãn thu hồi, **toàn bộ thông tin CV bị khoá** (không xem, không tải, không kéo thẻ), nhận email thông báo'],
          ['**Ứng viên**', '**Application Withdrawn**. Không nộp lại được vào job đó'],
          ['**Admin**', 'Chuyển sang tab *Recall*. Vị trí thẻ và 2 flag *Viewed / Downloaded* giữ nguyên để tra cứu'],
        ],
      },
      {
        kind: 'list',
        items: [
          '**Lý do nào cũng cho cùng kết quả.** Lý do và ghi chú chỉ lưu nội bộ.',
          '**Không hoàn tác được.**',
        ],
      },
      {
        kind: 'open',
        text: '**Nộp lại sau khi bị Recall.** Tài liệu này ghi ứng viên **không nộp lại được** vào job đó (mỗi job chỉ nộp 1 lần). Nhưng hộp Recall bước 2 ghi *“the candidate must apply again”*, và tài liệu *Candidate management* (14/10) ghi “ứng viên phải nộp hồ sơ mới”. Cần sửa câu trên hộp hoặc chốt lại luật.',
      },

      /* ── §7 ─────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '§7 · Withdraw application — đang triển khai' },
      {
        kind: 'warn',
        text: 'Tính năng này **đang được triển khai, chưa có trên màn hình** — chưa có nút, chưa có tab *Withdrawn*, chưa test được. Mô tả dưới đây là **hành vi đã chốt**.',
      },
      {
        kind: 'list',
        items: [
          '**Dùng khi:** ứng viên liên hệ CS xin **rút đơn khỏi một job**. Ứng viên **không tự rút được** trên hệ thống.',
          '**Ai làm:** chỉ Admin / CS.',
          '**Áp dụng cho:** hồ sơ **đã gửi** (*Qualified · Sent*, bất kỳ cột nào), hoặc **đang chờ duyệt** (*Cannot Read / Not Enough Information · Not Sent*).',
          '**Các bước:** chọn **Withdraw application** trong menu ⋮ → hộp thoại hiện tên công ty, tên job → nhập **ghi chú nội bộ** (bắt buộc: kênh và thời điểm ứng viên yêu cầu) → xác nhận. Không có danh sách lý do.',
        ],
      },
      {
        kind: 'table',
        heading: 'Khác Recall thế nào',
        cols: ['', 'Recall CV', 'Withdraw application'],
        rows: [
          ['**Lý do**', 'CV không hợp lệ', 'Ứng viên tự muốn rút'],
          ['**CV Status**', 'Rejected', '**Giữ nguyên**'],
          ['**Phạm vi**', 'Mọi hồ sơ dùng cùng phiên bản CV', '**Chỉ hồ sơ đang thao tác**'],
          ['**Áp dụng cho**', 'Hồ sơ đã gửi', 'Hồ sơ đã gửi hoặc đang chờ duyệt'],
        ],
      },
      {
        kind: 'table',
        heading: 'Kết quả',
        note: '**Không hoàn tác được.**',
        cols: ['', 'Sau Withdraw application'],
        rows: [
          ['**Hồ sơ đang thao tác**', 'Application Status = **Withdrawn**, CV Status giữ nguyên'],
          ['**Hồ sơ khác** (kể cả cùng phiên bản CV)', 'Không đổi. Các quyết định sau đó trên phiên bản CV **bỏ qua** hồ sơ Withdrawn'],
          ['**NTD** (hồ sơ đã gửi)', 'Nhãn **“Ứng viên đã thu hồi đơn ứng tuyển”**, toàn bộ thông tin CV bị khoá, nhận email'],
          ['**NTD** (hồ sơ chưa gửi)', 'Không thấy gì'],
          ['**Ứng viên**', '**Application Withdrawn**'],
          ['**Admin**', 'Tab *Withdrawn*. Hồ sơ đang chờ duyệt rời hàng đợi'],
        ],
      },

      /* ── §8 ─────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '§8 · Tóm tắt: mỗi thao tác, mỗi bên thấy gì' },
      {
        kind: 'table',
        note: 'Mọi thao tác trên đều **không hoàn tác được**, và ứng viên **không nộp lại được** vào job đó (mỗi job chỉ nộp 1 lần).',
        cols: ['Thao tác', 'Áp dụng cho', 'Phạm vi', 'Admin', 'NTD', 'Ứng viên'],
        rows: [
          ['**Approve CV**', 'Hồ sơ chờ duyệt', 'Mọi hồ sơ cùng phiên bản CV đang chờ', 'Qualified · Sent', 'Nhận hồ sơ, email đơn mới', 'Application Received'],
          ['**Reject CV**', 'Hồ sơ chờ duyệt', 'Mọi hồ sơ cùng phiên bản CV', 'Rejected · Not Sent (đã gửi: Recall)', 'Không thấy (đã gửi: bị khoá, email)', 'Invalid Application (đã gửi: Application Withdrawn)'],
          ['**Recall CV**', 'Hồ sơ đã gửi', 'Mọi hồ sơ cùng phiên bản CV', 'Rejected · Recall (chưa gửi: Not Sent)', 'Nhãn thu hồi, CV bị khoá, email', 'Application Withdrawn'],
          ['**Withdraw application** *(đang triển khai)*', 'Hồ sơ đã gửi hoặc chờ duyệt', 'Chỉ hồ sơ đó', '… · Withdrawn', 'Đã gửi: nhãn, CV bị khoá, email', 'Application Withdrawn'],
        ],
      },
    ],
  },

  /* ────────────────────────────────────────────────────────────────────────── */
  'talent-pool': {
    logic: [
      '**Talent pool là kho các ứng viên đã bật một CV cho nhà tuyển dụng (NTD) tìm** (*Show CV to employers*) — không phải mọi ứng viên trong hệ thống.',
      '**Phía NTD** (`/search` trên site công ty): công ty tìm ứng viên **chưa ứng tuyển vào mình**. Đọc được nội dung CV, nhưng **tên, số điện thoại, email, link và file gốc bị che** cho tới khi NTD **mở khoá (Unlock)**.',
      '**Phía Admin** (`/recruitment/talent-pool`): góc nhìn của Saramin vào cùng kho đó, **mỗi dòng một ứng viên**, kèm CV đang bật và kết quả kiểm duyệt. Dùng để biết kho đang có ai, kiểm soát chất lượng CV, theo dõi mức độ sử dụng, và **duyệt / từ chối CV** bằng cùng hộp thoại như Applications.',
      '**Mỗi ứng viên chỉ bật 1 CV** cho NTD tìm tại một thời điểm.',
      '**Ứng tuyển và Talent pool tách biệt:** đơn ứng viên tự nộp, NTD xem **miễn phí** trong Candidate management. NTD tự tìm trong Talent pool thì **phải mở khoá**, kể cả khi ứng viên đã nộp đơn vào chính công ty đó. **Mở khoá một lần, dùng vĩnh viễn**, cho cả công ty.',
      'Ai dùng màn Admin: HQ Admin, VN Ops. Duyệt / từ chối cần thêm **quyền duyệt CV**.',
    ],
    how: [
      'Bật **Overview** để xem 4 thẻ: *Searchable* · *Needs a look* · *New · 7 days* · *Untouched 90+ days*.',
      'Tìm theo tên, email hoặc vị trí mong muốn; lọc theo **Status** và **CV search status**.',
      'Đọc cột **CV content** để biết CV thiếu mục bắt buộc nào (✓ / ✗).',
      'Bấm **tên ứng viên** để mở hồ sơ ở *Users › Jobseeker users* (tab mới). Menu ⋮: **View detail ↗** · **Approve CV** · **Reject CV** · **Open in CV review** (§2.5).',
    ],
    watch: [
      '**“Needs a look” cao nghĩa là nhiều ứng viên trong kho có CV chưa đạt.** Ưu tiên những CV đã được dùng để ứng tuyển, vì đơn của họ đang bị giữ.',
      '**Chọn lý do trước, rồi mới sửa lời nhắn.** Đổi lý do sẽ ghi đè lời nhắn đang soạn.',
      '**Reject một CV đã gửi tới NTD sẽ thu hồi đơn ở mọi công ty đang giữ phiên bản CV đó.** Đọc kỹ khối ảnh hưởng trước khi bấm.',
      '**Ghi chú nội bộ luôn bắt buộc:** ghi rõ vì sao quyết định và đã thấy gì trong file.',
      '**Approve một file không đọc được** vẫn làm CV đạt, nhưng NTD không tìm thấy CV đó khi tìm theo kỹ năng, vì hệ thống không lấy được chữ từ file.',
      '**Ứng viên đã xoá tài khoản:** công ty chưa mở khoá thì không mở khoá được nữa; thẻ đang lưu không chuyển ra khỏi cột *Saved* được. Công ty đã mở khoá từ trước không bị ảnh hưởng.',
    ],
    blocks: [
      { kind: 'p', text: 'Theo tài liệu *Resume Management · Talent pool*, cập nhật 16/10/2026 (phiên bản sau khi sửa).' },
      {
        kind: 'diagram',
        id: 'tp-overview',
        heading: 'Tổng quan',
      },
      {
        kind: 'table',
        heading: 'Khác các màn khác thế nào',
        cols: ['Màn hình', 'Một dòng là', 'Dùng để'],
        rows: [
          ['**CV review**', 'Một CV cần người duyệt', 'Duyệt đầy đủ: lý do, lời nhắn và nút cho ứng viên'],
          ['**Applications**', 'Một đơn ứng tuyển', 'Theo dõi từng đơn, Approve / Reject / Recall'],
          ['**Talent pool**', 'Một ứng viên đang bật CV', 'Xem kho NTD tìm kiếm, duyệt / từ chối CV'],
        ],
      },

      /* ── §1 ─────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '§1 · Ai có mặt trong kho' },
      {
        kind: 'table',
        heading: 'Ứng viên có mặt trong kho khi đủ cả 3 điều kiện',
        cols: ['Điều kiện', 'Ai đặt', 'Ghi chú'],
        rows: [
          ['**Có 1 CV đang bật** cho NTD', 'Ứng viên bật **Show CV to employers**. Nếu ứng viên chưa bật CV nào, file tải lên đầu tiên được hệ thống **tự bật**', 'Admin **không bật hộ** được'],
          ['**Tài khoản đang hoạt động**', 'Hệ thống, hoặc Admin ở màn *Jobseeker users*', 'Tài khoản bị khoá, đã xoá hoặc chưa xác thực thì **rời kho ở mọi màn**'],
          ['**Hồ sơ không bị Admin ẩn**', 'Admin', '—'],
        ],
      },
      {
        kind: 'list',
        items: [
          'Ứng viên bật CV nhưng chưa điền hồ sơ **vẫn có mặt**; các ô thông tin cá nhân để trống.',
          'Các trường như mức lương, số năm kinh nghiệm **không bao giờ** quyết định ai có mặt trong kho; chúng chỉ dùng để lọc.',
          '**CV search status** cho biết ứng viên có ra kết quả trên `/search` của NTD không: **Showing** khi CV *Qualified*, **Hidden** với mọi trạng thái khác (§2.2). NTD chỉ tìm thấy ứng viên *Showing*.',
        ],
      },

      /* ── §2 ─────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '§2 · Màn Talent pool trên Admin', path: '/recruitment/talent-pool' },
      {
        kind: 'table',
        heading: '§2.1 · Thẻ tổng quan',
        note: 'Nút **Overview** ẩn / hiện các thẻ.',
        cols: ['Thẻ', 'Ý nghĩa'],
        rows: [
          ['**Searchable**', 'Số ứng viên có CV **Qualified** / tổng số ứng viên trong kho. Ví dụ *42 / 130*'],
          ['**Needs a look**', 'Số ứng viên trong kho có CV chưa đạt, cần xem lại'],
          ['**New · 7 days**', 'Số ứng viên mới vào kho trong 7 ngày'],
          ['**Untouched 90+ days**', 'Số ứng viên không cập nhật CV hơn 90 ngày'],
        ],
      },
      {
        kind: 'shot',
        src: '/shots/rec/talent-pool.jpg',
        where: 'Admin',
        caption: '**Talent pool**: bốn thẻ tổng quan, lọc theo *Status* và *CV search status*, nút **New resume**.',
        note: 'Ảnh chụp trên dev ngày 08/10/2026, **trước khi sửa** — chưa có cột *CV content* dạng checklist và chưa đổi hộp thoại duyệt / từ chối.',
      },
      {
        kind: 'table',
        heading: '§2.2 · Danh sách ứng viên',
        cols: ['Cột', 'Ý nghĩa'],
        rows: [
          ['**Candidate**', 'Tên ứng viên. Bấm để mở **trang hồ sơ ứng viên** ở *Users › Jobseeker users* (tab mới) — §2.4'],
          ['**CV**', 'CV đang bật: tên file, nguồn (*Upload / Saramin CV*), phiên bản'],
          ['**Basic information**', 'Giới tính, ngày sinh, quốc tịch, học vấn cao nhất, số năm kinh nghiệm'],
          ['**Work preference**', 'Nghề mong muốn, nơi làm việc, mức lương, hình thức làm việc'],
          ['**Contact**', 'Email, số điện thoại (Admin thấy đầy đủ)'],
          ['**CV status**', 'Chỉ hiện nhãn: *Qualified / Not enough information / Cannot Read / Rejected*'],
          ['**CV search status**', '**Showing** khi CV *Qualified*, **Hidden** với mọi trạng thái khác'],
          ['**CV content**', 'Checklist các mục bắt buộc theo khai báo của CV (§2.3)'],
          ['**Unlocks**', 'Số công ty đã mở khoá ứng viên này. CV chưa *Qualified* hiện “—”'],
          ['**Updated**', 'Lần cập nhật CV gần nhất'],
          ['**Actions**', 'Menu ⋮ (§2.5)'],
        ],
      },
      {
        kind: 'list',
        heading: 'Tìm · Lọc · Sắp xếp · Export',
        items: [
          '**Tìm** theo tên, email hoặc vị trí mong muốn.',
          '**Lọc** theo **Status** (*Approved, Pending review, Rejected, Not enough information, Can’t read*) và **CV search status** (*Showing, Hidden*). Chọn 2 bộ lọc mâu thuẫn nhau thì màn hình báo *These filters match nothing together. Clear one of them.*',
          '**Sắp xếp:** mặc định, hoặc theo tên A → Z / Z → A. Sắp xếp trên **toàn kho**, không chỉ trang đang xem.',
          '**Export Excel** xuất danh sách đang lọc.',
          '**New resume:** tạo hồ sơ thủ công từ Admin. Hồ sơ này không thuộc ứng viên nào nên **không vào kho tìm kiếm** của NTD.',
        ],
      },
      {
        kind: 'table',
        heading: '§2.3 · Cột CV content — checklist mục bắt buộc',
        note: 'Theo đúng quy tắc kiểm tra CV: **No experience** cần ít nhất 1 Education; **Experienced** cần ít nhất 1 Education **và** ít nhất 1 Work experience. Kỹ năng, dự án, số năm kinh nghiệm **không** ảnh hưởng tới kết quả. ✓ xanh lá: đã có · ✗ đỏ: còn thiếu. Có ít nhất 1 ✗ thì CV status là **Not enough information**; đủ hết thì **Qualified**. CV status ở Talent pool **luôn khớp** với CV review và Applications.',
        cols: ['Trường hợp', 'CV content'],
        rows: [
          ['CV khai *No experience*', '✓ / ✗ Education'],
          ['CV khai *Experienced*', '✓ / ✗ Education · ✓ / ✗ Work experience'],
          ['CV status = *Cannot Read*', '—'],
          ['CV status = *Rejected*', '—'],
        ],
      },
      {
        kind: 'example',
        heading: 'CV status và CV content của 7 ứng viên',
        scenario: 'Cùng một quy tắc, đọc trên 7 dòng khác nhau của màn Talent pool.',
        cols: ['Ứng viên', 'CV khai', 'CV status', 'CV content'],
        rows: [
          ['A', 'No experience', 'Qualified', '✓ Education'],
          ['B', 'No experience', 'Not enough information', '✗ Education'],
          ['C', 'Experienced', 'Qualified', '✓ Education · ✓ Work experience'],
          ['D', 'Experienced', 'Not enough information', '✓ Education · ✗ Work experience'],
          ['E', 'Experienced', 'Not enough information', '✗ Education · ✓ Work experience'],
          ['F', 'Experienced', 'Cannot Read', '—'],
          ['G', 'Experienced', 'Rejected', '—'],
        ],
      },
      {
        kind: 'table',
        heading: '§2.4 · Hồ sơ ứng viên',
        note: 'Bấm **tên ứng viên** ở cột Candidate để mở **trang hồ sơ ứng viên** tại *Users › Jobseeker users* (`/users/jobseekers/{id}`), ở **tab mới**. Danh sách Talent pool giữ nguyên trang, bộ lọc và vị trí cuộn.',
        cols: ['Phần', 'Nội dung'],
        rows: [
          ['**Đầu trang**', 'Tên, email, trạng thái tài khoản (*Active*…), ngày tham gia, lần hoạt động gần nhất'],
          ['**Profile information**', 'Họ tên, email đăng nhập, số điện thoại, giới tính, ngày sinh, quốc tịch, ảnh'],
          ['**Work preference**', 'Nhóm nghề › vị trí, nơi làm việc, lĩnh vực, loại hợp đồng, mức lương mong muốn, tổng số năm kinh nghiệm, học vấn cao nhất'],
          ['**Thao tác**', '*Send password reset* · *Deactivate* · *Delete* (theo quyền của Admin)'],
        ],
      },
      {
        kind: 'list',
        items: [
          'Tài khoản Admin **không có quyền xem Jobseeker users**: tên ứng viên hiện dạng chữ thường, không bấm được.',
          '**View detail ↗** trong menu ⋮ mở **trang chi tiết CV** (phiên bản CV mới nhất), không phải trang hồ sơ ứng viên.',
          'Mỗi lần mở một CV từ màn Talent pool đều **được ghi log**, vì CV chứa thông tin cá nhân.',
        ],
      },

      { kind: 'h', text: '§2.5 · Duyệt và từ chối CV' },
      {
        kind: 'table',
        heading: 'Menu ⋮ — cùng hộp thoại với Applications và CV review',
        cols: ['CV', 'Menu ⋮'],
        rows: [
          ['**Chưa đạt** (*Not enough information, Cannot Read*)', 'View detail · **Approve CV** · **Reject CV** · Open in CV review'],
          ['**Đã đạt** (*Qualified*)', 'View detail · **Reject CV**'],
        ],
      },
      {
        kind: 'list',
        heading: 'Approve CV',
        items: [
          'Mở hộp thoại xác nhận: số hồ sơ đang chờ dùng phiên bản CV này, số công ty sẽ nhận, phiên bản file.',
          'Nhập **ghi chú nội bộ** (bắt buộc, tối đa 500 ký tự), rồi xác nhận.',
          '**Kết quả:** CV thành *Qualified*, mọi hồ sơ đang chờ dùng phiên bản CV này được gửi tới NTD, công ty nhận email.',
        ],
      },
      {
        kind: 'list',
        heading: 'Reject CV — các bước',
        items: [
          '**Chọn lý do** (bắt buộc): *Can’t read · Not a CV · CV but not enough information · Other*. Lý do là nội bộ, ứng viên không thấy, nhưng nó điền sẵn lời nhắn.',
          '**Phần ứng viên thấy:** tag **“Chưa được duyệt”** và **lời nhắn** cho ứng viên (bắt buộc, tối đa 300 ký tự, sửa được).',
          '**Ghi chú nội bộ** (bắt buộc, tối đa 500 ký tự). Chỉ Admin đọc được.',
          'Kiểm tra **khối ảnh hưởng**: số hồ sơ bị từ chối, số hồ sơ bị thu hồi, số công ty.',
          'Bấm **Reject CV**.',
        ],
      },
      {
        kind: 'table',
        heading: 'Lời nhắn soạn sẵn theo lý do',
        cols: ['Lý do', 'Lời nhắn soạn sẵn cho ứng viên'],
        rows: [
          ['**Can’t read**', '“Hệ thống không đọc được nội dung trong file này. Bạn thử tải lên bản PDF xuất trực tiếp từ Word hoặc Google Docs giúp nhé.”'],
          ['**Not a CV**', '“File bạn tải lên không phải một CV. Bạn kiểm tra và tải lại đúng file giúp nhé.”'],
          ['**CV but not enough information**', '“Hồ sơ chưa đủ thông tin để gửi tới nhà tuyển dụng. CV cần có học vấn, và có thêm kinh nghiệm làm việc nếu bạn đã đi làm. Bạn tải lên bản đầy đủ hơn, hoặc tạo CV trên Saramin giúp nhé.”'],
          ['**Other**', 'Không soạn sẵn, phải tự viết'],
        ],
      },
      {
        kind: 'table',
        heading: 'Kết quả của Reject CV',
        cols: ['Hồ sơ dùng cùng phiên bản CV', 'Sau Reject CV'],
        rows: [
          ['**Đang chờ** (*Not Sent*)', '*Rejected · Not Sent*. NTD không bao giờ thấy. Ứng viên thấy **Invalid Application**'],
          ['**Đã gửi tới NTD** (*Sent*, bất kỳ cột nào)', '**Tự động Recall**: *Rejected · Recall*. NTD thấy nhãn thu hồi, toàn bộ thông tin CV bị khoá, nhận email. Ứng viên thấy **Application Withdrawn**'],
          ['**Đã Withdrawn** *(đang triển khai)*', 'Không đổi'],
        ],
      },
      {
        kind: 'list',
        items: [
          'Reject được cả CV **đã Qualified** và đã dùng để ứng tuyển. Các đơn đã gửi tới NTD được **thu hồi tự động**, không cần làm thêm bước Recall.',
          'Lượt mở khoá của các công ty trên ứng viên này được **hoàn credit**.',
          'Mọi quyết định **không hoàn tác được** — CV đã có người duyệt hoặc từ chối thì không quyết lại được ở bất kỳ màn nào.',
          'Ứng viên **không nộp lại được** vào các job đã nộp (mỗi job chỉ nộp 1 lần).',
          '**Open in CV review:** mở đúng CV đó ở màn CV review.',
        ],
      },
      {
        kind: 'open',
        text: '**Lời nhắn soạn sẵn của *CV but not enough information*** trong tài liệu này đã sửa đúng quy tắc (*“CV cần có học vấn, và có thêm kinh nghiệm làm việc nếu bạn đã đi làm”*). Hộp Reject chụp ngày 15/10 ở **CV review §5** vẫn hiện câu cũ (*“ít nhất một kinh nghiệm — hoặc học vấn nếu chưa đi làm”*) — kiểm lại khi test.',
      },

      /* ── §3 · phía NTD (tài liệu Talent pool phía nhà tuyển dụng, 16/10) ── */
      { kind: 'h', text: '§3 · Phía NTD — kho tìm kiếm `/search`' },
      {
        kind: 'p',
        text: 'Theo tài liệu *Resume Management · Talent pool (phía nhà tuyển dụng)*, cập nhật 16/10/2026. Đường vào: thanh đầu trang › **Talent pool** (tìm kiếm) · **Candidate management** › tab **Talent pool** (folder). Ai dùng: người dùng của công ty có quyền **Search resumes**.',
      },
      {
        kind: 'list',
        items: [
          'NTD tìm được cả những ứng viên **chưa ứng tuyển vào công ty mình**.',
          'Tìm kiếm và lọc **miễn phí**, không cần gói.',
          'Ứng viên **chưa mở khoá**: tên, số điện thoại, email, link và file CV gốc bị che.',
          '**Mở khoá (Unlock)** tốn credit, **một lần, dùng vĩnh viễn** cho cả công ty.',
          '**Save candidate** lưu ứng viên vào folder, **không tốn credit**. Chỉ tốn khi mở khoá, hoặc khi kéo thẻ chưa mở khoá ra khỏi cột Saved.',
          'Ứng viên đã **nộp đơn** vào công ty: xem miễn phí trong **Candidate management › Jobs**. Tìm thấy họ trong Talent pool thì vẫn cần mở khoá.',
        ],
      },
      {
        kind: 'diagram',
        id: 'tpe-search',
        heading: 'Tìm, lưu, mở khoá',
      },

      { kind: 'h', text: '§3.1 · Tìm kiếm ứng viên' },
      {
        kind: 'shot',
        src: '/shots/tp/search-page.png',
        where: 'Company site',
        caption: 'Trang tìm kiếm: ba ô **OR · AND · NOT** và nút **Search**; *Reset · Load search criteria · Save search conditions* ở góc phải; dưới đó số kết quả (*79 candidates*), sắp xếp, *New talent*, *Exclude viewed*, khoảng cập nhật (*Within 24 months*), và khung **Filter** bên trái.',
      },
      {
        kind: 'table',
        heading: 'Thanh tìm kiếm',
        cols: ['Phần', 'Chi tiết'],
        rows: [
          ['**OR**', 'Có ít nhất 1 từ khoá. Ô tìm kiếm chính, mở rộng kết quả'],
          ['**AND**', 'Phải có tất cả từ khoá. Thu hẹp kết quả'],
          ['**NOT**', 'Không được có từ khoá nào. Loại trừ'],
          ['**Search**', 'Chạy tìm kiếm'],
          ['**Reset**', 'Xoá toàn bộ từ khoá và bộ lọc'],
          ['**Save search conditions**', 'Lưu bộ từ khoá và bộ lọc hiện tại để dùng lại'],
          ['**Load search criteria**', 'Mở lại một bộ điều kiện đã lưu'],
        ],
      },
      {
        kind: 'table',
        heading: 'Quy tắc từ khoá',
        cols: ['Quy tắc', 'Chi tiết'],
        rows: [
          ['**Tách từ khoá**', 'Bằng dấu phẩy hoặc xuống dòng. Dấu cách **không** tách từ khoá'],
          ['**Từ khoá nhiều chữ**', 'Tìm đúng cụm liền nhau. `Data Mining` không khớp CV chỉ có chữ “data”. Muốn tìm rời thì gõ `data, mining`'],
          ['**Dấu, hoa thường**', 'Không phân biệt: `dieu duong` = `Điều Dưỡng`'],
          ['**Ký tự đặc biệt**', 'Bị bỏ qua (`&`, `|`, `!`, `(`, `)`, `"`, `\'`…)'],
          ['**Kết hợp 3 ô**', '(OR1 hoặc OR2 …) **và** AND1 **và** AND2 … **và không** NOT1 **và không** NOT2 …'],
        ],
      },
      {
        kind: 'example',
        heading: 'Kết hợp ba ô từ khoá',
        scenario: 'NTD tìm điều dưỡng có chứng chỉ JCI, bỏ người đang thực tập.',
        cols: ['Ô', 'Gõ', 'Nghĩa'],
        rows: [
          ['OR', '`điều dưỡng, y tá`', 'CV có “điều dưỡng” **hoặc** “y tá”'],
          ['AND', '`JCI`', '**và** có “JCI”'],
          ['NOT', '`thực tập`', '**và không** có “thực tập”'],
        ],
      },
      {
        kind: 'table',
        heading: 'Danh sách kết quả',
        cols: ['Phần', 'Chi tiết'],
        rows: [
          ['**Số kết quả**', 'Ví dụ *79 candidates*'],
          ['**Sắp xếp**', '**Recommended** (mặc định: theo độ khớp khi có từ khoá, không có thì mới nhất) · **Update date** (ngày cập nhật CV)'],
          ['**New talent**', 'Chỉ hiện ứng viên mới bật CV trong tuần'],
          ['**Exclude viewed**', 'Bỏ ứng viên công ty đã xem trong 3 tháng'],
          ['**Khoảng cập nhật**', '3 / 7 ngày; 1 / 2 / 3 / 6 / 12 / 24 tháng; hoặc bất kỳ. Mặc định *Within 24 months*'],
          ['**Một trang**', '10 kết quả, có phân trang'],
          ['**Manage disliked candidates**', 'Danh sách ứng viên công ty đã ẩn khỏi kết quả tìm kiếm'],
        ],
      },
      {
        kind: 'shot',
        src: '/shots/tp/search-result-card.png',
        where: 'Company site',
        caption: 'Thẻ ứng viên trong kết quả: tên đã che, giới tính · tuổi · số năm kinh nghiệm, công việc gần nhất, trường (năm tốt nghiệp), tối đa 5 kỹ năng (*+N*), *Updated*, nút **Save candidate** và ô chọn.',
      },
      {
        kind: 'table',
        heading: 'Thẻ kết quả',
        cols: ['Phần', 'Chi tiết'],
        rows: [
          ['**Tên**', 'Đã che (ví dụ `Nguyễn***`)'],
          ['**Thông tin chung**', 'Giới tính · tuổi · số năm kinh nghiệm'],
          ['**Công việc gần nhất**', 'Công ty · chức danh (thời gian)'],
          ['**Công việc trước đó**', 'Tối đa 2 công việc'],
          ['**Học vấn**', 'Trường (năm tốt nghiệp)'],
          ['**Kỹ năng**', 'Tối đa 5 kỹ năng, phần còn lại hiện *+N*'],
          ['**Updated**', 'Ngày cập nhật CV'],
          ['**Save candidate**', 'Lưu ứng viên vào folder (§3.3)'],
          ['**Ô chọn**', 'Chọn nhiều ứng viên để thao tác cùng lúc'],
        ],
      },
      {
        kind: 'shot',
        src: '/shots/tp/search-pagination.png',
        where: 'Company site',
        caption: 'Phân trang (*Previous · 1 2 … 8 · Next*) và nút **Manage disliked candidates**.',
      },

      { kind: 'h', text: '§3.2 · Bộ lọc' },
      {
        kind: 'p',
        text: 'Bộ lọc nằm bên trái trang kết quả, chia **2 nhóm**. **Reset** ở đầu khung Filter xoá mọi bộ lọc.',
      },
      {
        kind: 'shot',
        src: '/shots/tp/search-filters-work-preference.png',
        where: 'Company site',
        caption: 'Nhóm **Work preference** (mong muốn công việc của ứng viên): *Job role · Industry · Location* (bấm *Add*), *Contract type*, *Salary* (VND / USD).',
      },
      {
        kind: 'table',
        heading: 'Work preference',
        cols: ['Bộ lọc', 'Cách chọn'],
        rows: [
          ['**Job role**', 'Bấm *Add* để mở hộp chọn (bên dưới)'],
          ['**Industry**', 'Bấm *Add* để mở hộp chọn'],
          ['**Location**', 'Bấm *Add* để mở hộp chọn'],
          ['**Contract type**', 'Tick: Part-time, Fulltime, Freelance, Fixed-term contract, Internship, Probation… (*See more*)'],
          ['**Salary**', 'Khoảng From – To, chọn VND hoặc USD'],
        ],
      },
      {
        kind: 'shot',
        src: '/shots/tp/search-filters-candidate-information.png',
        where: 'Company site',
        caption: 'Nhóm **Candidate information** (thông tin của ứng viên): *Nationality · Gender · Age · Highest education · Years of experience · Skill · Language*.',
      },
      {
        kind: 'table',
        heading: 'Candidate information',
        cols: ['Bộ lọc', 'Cách chọn'],
        rows: [
          ['**Nationality**', 'Vietnam / International'],
          ['**Gender**', 'Male / Female / Other'],
          ['**Age**', 'Khoảng From – To'],
          ['**Highest education**', 'High school, Vocational, College / Associate, Bachelor, Master, Doctorate (PhD)… (*See more*)'],
          ['**Years of experience**', 'Khoảng từ – đến'],
          ['**Skill**', 'Bấm *Add* để chọn kỹ năng'],
          ['**Language**', 'Chọn ngôn ngữ và trình độ'],
        ],
      },
      {
        kind: 'table',
        heading: 'Hộp chọn Job role, Industry, Location',
        note: 'Ba hộp chọn dùng chung cách làm: ô tìm kiếm ở trên, danh sách theo cấp, khung hiện mục đã chọn, nút **Reset**, **Cancel**, **Save**. Danh sách đọc từ master data *Job taxonomy*, *Industries*, *Locations*.',
        cols: ['Hộp', 'Cấp', 'Cách chọn'],
        rows: [
          ['**Job role**', 'Nhóm nghề › Vị trí', 'Chọn nhóm nghề bên trái, tick vị trí bên phải. **All** chọn cả nhóm'],
          ['**Industry**', 'Ngành › Nhóm › Mục', 'Chọn ngành, rồi nhóm, rồi tick mục. **All** chọn cả nhóm'],
          ['**Location**', 'Miền › Tỉnh / thành', 'Chọn North / Central / South, rồi tick tỉnh / thành. **All** chọn cả miền'],
        ],
      },
      {
        kind: 'shot',
        src: '/shots/tp/picker-job-role.png',
        where: 'Company site',
        caption: 'Hộp **Job role**: nhóm nghề bên trái, vị trí bên phải, **All** chọn cả nhóm.',
      },
      {
        kind: 'shot',
        src: '/shots/tp/picker-industry.png',
        where: 'Company site',
        caption: 'Hộp **Industry**: ngành › nhóm › mục (3 cột).',
      },
      {
        kind: 'shot',
        src: '/shots/tp/picker-location.png',
        where: 'Company site',
        caption: 'Hộp **Location**: *North / Central / South* bên trái, tỉnh / thành bên phải.',
      },

      { kind: 'h', text: '§3.3 · Lưu ứng viên (Save candidate)' },
      {
        kind: 'shot',
        src: '/shots/tp/save-candidate.png',
        where: 'Company site',
        caption: 'Hộp **Save candidate**: *“Pick the folders to file this candidate into. They land in Saved — you only pay when you move them forward.”* Folder đã có ứng viên này hiện tick mờ kèm *Added*.',
      },
      {
        kind: 'list',
        items: [
          'Bấm **Save candidate** ở thẻ kết quả hoặc ở trang CV.',
          'Tick một hoặc nhiều **folder** để lưu ứng viên vào. Ứng viên nằm ở cột **Saved** của folder.',
          '**Lưu không tốn credit.** Chỉ tốn khi kéo thẻ chưa mở khoá ra khỏi Saved (§3.5) hoặc khi bấm Unlock.',
          'Folder đã có ứng viên này hiện tick mờ kèm chữ *Added*, không chọn lại được.',
          '**Search for positions:** tìm folder. **Add position:** tạo folder mới ngay trong hộp thoại.',
          'Bấm **Add** để lưu.',
        ],
      },

      { kind: 'h', text: '§3.4 · Trang CV và mở khoá', path: '/search/candidates/:resumeId' },
      {
        kind: 'shot',
        src: '/shots/tp/cv-detail-header.png',
        where: 'Company site',
        caption: 'Đầu trang CV: tên, điện thoại, email **đã che**, *Applications N · Saved N*, *Total experience*, *Last active*, *Updated*; **Remaining quota** (*42 / 50*); nút **Save candidate** · **Unlock**; *Screen fit view · Full screen view · Print*.',
      },
      {
        kind: 'table',
        heading: 'Trang CV',
        cols: ['Phần', 'Chi tiết'],
        rows: [
          ['**Đầu trang**', 'Tên (đã che), số điện thoại và email (đã che), *Applications N · Saved N*, Total experience, Last active, Updated'],
          ['**Remaining quota**', 'Số lượt mở khoá còn lại của công ty, ví dụ *42 / 50*'],
          ['**Save candidate · Unlock**', 'Lưu vào folder · mở khoá ứng viên'],
          ['**Tóm tắt**', 'Work experience, Education, Desired job role, Desired salary, Preferred location'],
          ['**CV file**', 'File CV; phần thông tin liên hệ hiện *Unlock to view* khi chưa mở khoá. Có Screen fit view, Full screen view, Print'],
          ['**History** (bên phải)', '**Views & unlocks:** công ty đã xem / mở khoá ứng viên này khi nào. **Applications to your jobs:** các đơn ứng viên đã nộp vào công ty, kèm trạng thái. **Saved for positions:** các folder đang lưu ứng viên'],
        ],
      },
      {
        kind: 'shot',
        src: '/shots/tp/cv-detail-summary.png',
        where: 'Company site',
        caption: 'Các ô tóm tắt: *Work experience · Education · Desired job role · Desired salary · Preferred location*.',
      },
      {
        kind: 'shot',
        src: '/shots/tp/cv-detail-history.png',
        where: 'Company site',
        caption: 'Khung **History**: *Views & unlocks*, *Applications to your jobs* (kèm trạng thái, ví dụ *Application Received*), *Saved for positions*. Chú thích cuối: chỉ hoạt động của công ty mình, mỗi lần xem / mở khoá là thao tác PII có ghi log.',
      },
      {
        kind: 'list',
        items: [
          'History chỉ hiện hoạt động của **công ty mình**, không bao giờ hiện hoạt động của công ty khác.',
          'Mỗi lần xem hoặc mở khoá đều **được ghi log**.',
        ],
      },
      {
        kind: 'shot',
        src: '/shots/tp/unlock-dialog.png',
        where: 'Company site',
        caption: 'Hộp **Unlock this CV?** — *“You’ll see the candidate’s name, contact details and full CV.”* — nút **Unlock · 1 credits**.',
      },
      {
        kind: 'list',
        heading: 'Mở khoá (Unlock)',
        items: [
          'Bấm **Unlock** → hộp thoại **“Unlock this CV?”** cho biết sẽ thấy tên, thông tin liên hệ và CV đầy đủ, kèm số credit (mặc định **1 credit**).',
          'Bấm **Unlock · 1 credits** để mở khoá. **Một lần, vĩnh viễn, cho cả công ty.**',
        ],
      },
      {
        kind: 'table',
        heading: 'Mức xem CV',
        note: 'Mỗi công ty có **10 lượt xem miễn phí**, tính theo số CV khác nhau. Mở lại CV đã xem không tốn lượt; công ty đang có gói thì không dùng lượt.',
        cols: ['Mức', 'Khi nào', 'NTD thấy gì'],
        rows: [
          ['**Đầy đủ**', 'Công ty đã mở khoá ứng viên', 'File gốc, tên, số điện thoại, email, link'],
          ['**Che liên hệ**', 'Có gói tìm kiếm CV đang chạy, hoặc còn lượt xem miễn phí', 'CV đã che thông tin liên hệ. Giới tính, tuổi vẫn hiện; ngày sinh, quốc tịch ẩn'],
          ['**Khoá**', 'Không có gói và đã hết lượt xem miễn phí', 'Không xem được CV, kèm lời mời mua gói'],
        ],
      },
      {
        kind: 'table',
        heading: 'Khi nào không mở khoá được',
        cols: ['Tình huống', 'Kết quả'],
        rows: [
          ['**Hết credit**', 'Báo hết credit, mời nạp thêm'],
          ['**Gói đã hết hạn**', 'Báo gói hết hạn. Credit còn lại được giữ, không mất'],
          ['**Ứng viên đã xoá tài khoản**', 'Không mở khoá được, trừ khi công ty đã mở khoá từ trước'],
          ['**Ứng viên không còn CV nào đang bật**', 'Không mở khoá được, trừ khi đã mở khoá từ trước, hoặc ứng viên đã nộp đơn tới công ty'],
        ],
      },

      { kind: 'h', text: '§3.5 · Folder Talent pool' },
      {
        kind: 'shot',
        src: '/shots/tp/folder-kanban.png',
        where: 'Company site',
        caption: 'Kanban của một folder: **Saved · Interview 1 · Interview 2 · + · Passed · Not This Time**. Thẻ chưa mở khoá hiện tên che (`Nguyễn***`).',
      },
      {
        kind: 'list',
        items: [
          'Cấu trúc cột **giống Kanban của job**: *Saved* (cột đầu, cố định) · cột giữa NTD thêm / xoá / đổi tên (cột mới chèn trước Passed) · *Passed* và *Not This Time* (cột cuối, cố định, kéo vào / ra được). Folder mới mặc định: Saved · Interview 1 · Interview 2 · Passed · Not This Time.',
          '**Kéo thẻ chưa mở khoá ra khỏi Saved** là mở khoá và **trừ credit**; thẻ đã mở khoá, hoặc kéo giữa các cột khác, không trừ.',
          'Thẻ trong folder **không phải đơn ứng tuyển**: kéo thẻ không đổi trạng thái gì phía ứng viên.',
          'Chi tiết màn folder, thẻ ứng viên và hộp *Moving this card spends a credit*: **Candidate management §10**.',
        ],
      },
      {
        kind: 'shot',
        src: '/shots/tp/move-card-credit.png',
        where: 'Company site',
        caption: 'Kéo thẻ chưa mở khoá ra khỏi Saved: hộp **Moving this card spends a credit** kèm số credit còn lại — **Don’t move** · **Spend credits and move**.',
      },
    ],
  },

  /* ────────────────────────────────────────────────────────────────────────── */
  'candidate-management': {
    logic: [
      '**Mọi CV phải qua bước kiểm tra ở Admin trước khi tới tay nhà tuyển dụng (NTD).** Saramin VN chạy nhiều khuyến mãi và voucher, nên có ứng viên nộp hồ sơ rác (file trắng, PDF hỏng, có mật khẩu, hoá đơn) chỉ để nhận quà.',
      '**Một CV chỉ tới được NTD khi CV Status = Qualified.** CV không đạt bị giữ lại (*Not Sent*) và **ẩn hoàn toàn** khỏi NTD cho tới khi Operator duyệt tay.',
      'Sau khi CV đã gửi sang NTD, trạng thái ứng viên nhìn thấy đi theo **vị trí thẻ trên Kanban** của NTD và **2 flag** (NTD đã xem, NTD đã tải CV).',
      '**Một nguồn dữ liệu duy nhất:** mỗi hồ sơ ứng tuyển lưu trạng thái một lần. Admin, NTD và ứng viên chỉ là các góc nhìn khác nhau của cùng dữ liệu đó — không có trạng thái riêng cho từng màn hình.',
      '**Quyết định theo phiên bản CV:** Approve, Reject và Recall áp dụng cho **mọi hồ sơ dùng cùng phiên bản CV**, ở mọi công ty (§4).',
      '**Ứng viên không tự thu hồi được hồ sơ.** Chỉ Admin / CS được thu hồi (*Recall*).',
      '**Hai tab, hai tập người khác nhau** trên console của NTD: *Jobs* = người **nộp đơn** vào tin; *Talent pool* = người NTD **lưu từ tìm kiếm CV** (§10). Một lần vào folder không bao giờ là một đơn ứng tuyển.',
    ],
    how: [
      '**NTD:** vào site công ty → `/applicants` → chọn một tin. Thẻ mới luôn ở cột **Application Received**; kéo sang các cột giữa, rồi **Passed** hoặc **Not This Time**.',
      '**Operator:** Admin › Recruitment › **Applications** → tab *Not sent* → lọc *CV Status = Cannot Read* hoặc *Not Enough Information* → menu ⋮ → **Approve** hoặc **Reject** (bắt buộc chọn lý do). Đọc số hồ sơ và số công ty bị ảnh hưởng trong hộp thoại trước khi xác nhận.',
      '**Admin / CS thu hồi:** trên hồ sơ *Sent* → ⋮ → **Recall** → chọn 1 trong 4 lý do → ghi chú nội bộ (bắt buộc, ≤ 500 ký tự) → xác nhận. Không hoàn tác.',
      '**Ứng viên:** Jobseeker › **Việc đã ứng tuyển** — mỗi hồ sơ hiện 1 trong 9 trạng thái (§6).',
    ],
    watch: [
      '**Hồ sơ Not Sent không bao giờ xuất hiện trên Kanban** — kể cả ô đếm số ứng viên, tìm kiếm, filter, Download All. Hệ thống chặn ở tầng API, không chỉ ẩn trên giao diện.',
      '**“Rejected” là CV Status, không phải Application Status.** Application Status có 3 giá trị *Not Sent · Sent · Recall* — cộng *Withdrawn* khi *Withdraw application* triển khai xong.',
      '**Recall không hoàn tác được**, và ứng viên không nộp lại được vào job đó (*CV review §6*). Lý do nào cũng cho cùng kết quả: CV Status = Rejected, Application Status = Recall.',
      '**Operator hoặc Admin mở / tải CV không bật flag** Viewed / Downloaded — chỉ hành động của NTD mới bật.',
      '**Flag chỉ đổi trạng thái khi thẻ còn ở cột Application Received.** Thẻ đã sang cột giữa / cuối thì NTD xem hay tải lại CV không đổi gì (flag vẫn được ghi nhận).',
      '**Phiên bản CV khác không bị ảnh hưởng.** Bản 1.1 đã Sent ở công ty A, bản 2.2 bị Reject ở công ty B → hồ sơ ở A **vẫn Sent**.',
    ],
    blocks: [
      { kind: 'p', text: 'Theo tài liệu *Candidate Management: Luồng trạng thái ứng tuyển*, phiên bản 14/10/2026 (Ngô Thái Nguyên, BA/QA). Các điểm **chưa chốt** nằm trong khung vàng. Tab Talent pool (§10) theo tài liệu phía nhà tuyển dụng 16/10/2026; phần credit (§11) giữ theo build 08/10/2026.' },
      {
        kind: 'table',
        heading: 'Các màn hình liên quan',
        cols: ['Màn hình', 'Site · đường dẫn', 'Ai dùng', 'Làm gì'],
        rows: [
          ['**Kanban của job** — tab *Jobs*', 'Company site · `/applicants`', 'NTD', 'Người đã nộp đơn vào tin, mỗi tin một Kanban (§5)'],
          ['**Applications**', 'Admin · Recruitment › Applications · `/recruitment/applications`', 'Operator, Admin / CS', 'Xem CV Status, Application Status, Stage, 2 flag; **Approve · Reject · Recall** (§4, §7)'],
          ['**Việc đã ứng tuyển**', 'Jobseeker · `/my-profile/applications`', 'Ứng viên', '1 trong 9 trạng thái cho mỗi hồ sơ (§6, §8)'],
          ['**Tab *Talent pool***', 'Company site · `/applicants?tab=talent-pool`', 'NTD', 'Người NTD lưu từ tìm kiếm CV vào folder (§10)'],
          ['**Trang CV**', 'Company site · `/search/candidates/:resumeId`', 'NTD', 'Xem CV — **lần mở đầu tiên bật flag Viewed** khi mở từ một hồ sơ ứng tuyển'],
          ['**Credits**', 'Company site · `/hiring/credits`', 'NTD', 'Số dư credit và gói CV search (§11)'],
        ],
      },
      {
        kind: 'table',
        heading: 'Quyền của thành viên công ty',
        note: 'Nhãn đúng như trong màn *Roles* của site công ty. Người chỉ có quyền xem thấy bảng ở chế độ đọc.',
        cols: ['Quyền', 'Cho phép'],
        rows: [
          ['*See applications*', 'Xem tab Jobs'],
          ['*Handle applicants (move stages, rate)*', 'Kéo thẻ giữa các cột, gắn sao'],
          ['*Search resumes*', 'Dùng `/search`'],
          ['*Unlock a resume (spends credit)*', 'Tiêu credit — *Spends 1 CV unlock and reveals contact details · audited*'],
        ],
      },

      /* ── §1 ─────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '§1 · Bức tranh tổng quan' },
      {
        kind: 'diagram',
        id: 'cm-overview',
        heading: 'Từ lúc nộp hồ sơ tới Kanban của NTD',
        note: 'Đọc từ trên xuống: **ứng viên → Admin → Employer Dashboard**. Ô xanh lá là khoảnh khắc duy nhất hồ sơ tới tay NTD.',
      },

      /* ── §2 ─────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '§2 · Các nhóm trạng thái' },
      {
        kind: 'table',
        heading: '4 nhóm trạng thái và 2 flag trên mỗi hồ sơ',
        cols: ['Nhóm trạng thái', 'Nơi dùng', 'Giá trị', 'Ai làm thay đổi'],
        rows: [
          ['**CV Status**', 'Admin (kiểm tra CV)', 'Qualified, Cannot Read, Not Enough Information, Rejected', 'Hệ thống (tự động), Operator (Approve / Reject), Admin / CS (Recall)'],
          ['**Application Status**', 'Admin', 'Not Sent, Sent, Recall', 'Hệ thống (Sent khi Qualified), Admin / CS (Recall)'],
          ['**CV Search Status**', 'Talent Pool', 'Showing, Hidden', 'Hệ thống — **Showing** khi CV Qualified, **Hidden** với mọi trạng thái khác (*Talent pool*, 16/10)'],
          ['**Pipeline Status**', 'Employer Kanban', 'Application Received, In Process, Passed, Not This Time', 'NTD (kéo thẻ)'],
        ],
      },
      {
        kind: 'table',
        heading: 'CV Status',
        cols: ['Giá trị', 'Ý nghĩa', 'Application Status đi kèm'],
        rows: [
          ['**Qualified**', 'Saramin CV, hoặc file upload đọc được và đủ trường bắt buộc, hoặc Operator Approve', 'Sent'],
          ['**Cannot Read**', 'File lỗi, hỏng hoặc có mật khẩu', 'Not Sent'],
          ['**Not Enough Information**', 'Đọc được nhưng thiếu trường bắt buộc', 'Not Sent'],
          ['**Rejected**', 'Bị Operator Reject hoặc Admin / CS Recall. Luồng kết thúc', 'Not Sent nếu chưa gửi; Recall nếu đã gửi'],
        ],
      },
      {
        kind: 'table',
        heading: 'Application Status — 3 giá trị (thêm Withdrawn khi triển khai xong)',
        note: '“Rejected” là **CV Status**, không phải Application Status.',
        cols: ['Giá trị', 'Ý nghĩa'],
        rows: [
          ['**Not Sent**', 'CV bị giữ ở Admin. NTD không thấy'],
          ['**Sent**', 'CV Qualified, đã tự động gửi sang NTD và tạo thẻ ở cột Application Received'],
          ['**Recall**', 'CV đã gửi rồi bị thu hồi. CV Status **luôn** là Rejected. Luồng kết thúc; không nộp lại được vào job đó (*CV review §6*)'],
          ['**Withdrawn** — *đang triển khai*', 'Ứng viên xin rút đơn, Admin / CS thực hiện (*Withdraw application*, **CV review §7**). CV Status giữ nguyên, chỉ hồ sơ đó. Kết thúc'],
        ],
      },
      {
        kind: 'p',
        text: '**CV Search Status** gắn với **CV**, không gắn với từng lượt ứng tuyển — **hệ thống tự suy ra**: chỉ CV *Qualified* mới *Showing*; CV *Cannot Read*, *Not Enough Information* hoặc *Rejected* luôn *Hidden*, và NTD chỉ tìm thấy ứng viên *Showing* (chốt ở tài liệu *Talent pool* 16/10).',
      },
      {
        kind: 'table',
        heading: 'Pipeline Status',
        cols: ['Giá trị', 'Thẻ nằm ở'],
        rows: [
          ['**Application Received**', 'Cột đầu cố định (tên cũ “CV screening”)'],
          ['**In Process**', 'Bất kỳ cột giữa nào do NTD tạo. Chỉ dùng cho cột giữa'],
          ['**Passed**', 'Cột cuối cố định Passed (tên cũ “Final acceptance”)'],
          ['**Not This Time**', 'Cột cuối cố định Not This Time (cột mới)'],
        ],
      },
      {
        kind: 'p',
        text: '**2 flag:** `viewed_at` (lần đầu NTD mở xem CV) và `downloaded_at` (lần đầu NTD tải CV). Không phải một nhóm trạng thái; chỉ dùng để tính trạng thái hiển thị cho ứng viên khi thẻ còn ở cột Application Received (§6).',
      },
      {
        kind: 'table',
        heading: 'Tổ hợp hợp lệ của CV Status và Application Status',
        note: 'Không có tổ hợp nào khác. Ví dụ *Qualified · Not Sent*, *Rejected · Sent* hoặc *Qualified · Recall* đều là **dữ liệu sai**.',
        cols: ['CV Status', 'Application Status', 'Nghĩa là'],
        rows: [
          ['Qualified', 'Sent', 'Đã đạt và đã gửi'],
          ['Cannot Read', 'Not Sent', 'Chờ Operator xử lý'],
          ['Not Enough Information', 'Not Sent', 'Chờ Operator xử lý'],
          ['Rejected', 'Not Sent', 'Bị từ chối trước khi gửi, kết thúc'],
          ['Rejected', 'Recall', 'Đã gửi rồi bị thu hồi, kết thúc'],
        ],
      },
      {
        kind: 'diagram',
        id: 'cm-states',
        heading: 'Năm tổ hợp và đường đi giữa chúng',
      },
      {
        kind: 'table',
        heading: 'Mỗi vai trò thấy gì',
        cols: ['Vai trò', 'Thấy', 'Không thấy'],
        rows: [
          ['**Ứng viên**', '1 trong 9 trạng thái hiển thị (§6)', 'CV Status, Application Status, tên cột do NTD đặt, 2 flag, lý do Reject / Recall'],
          ['**Operator**', 'CV Status, hàng đợi chờ xử lý, Approve / Reject', 'Thao tác của NTD'],
          ['**Admin / CS**', 'CV Status, Application Status, Stage · Employer, Viewed, Downloaded', '—'],
          ['**NTD**', 'Thẻ trên Kanban với tên cột do NTD đặt, chỉ cho hồ sơ Sent. Talent Pool chỉ có CV Showing', 'CV Status, Application Status, mọi hồ sơ Not Sent'],
        ],
      },
      {
        kind: 'table',
        heading: 'Cùng một hồ sơ, mỗi bên thấy gì',
        cols: ['#', 'CV Status', 'Application Status', 'Vị trí thẻ / flag', 'Ứng viên thấy', 'Admin thấy (CV · Application · Stage)', 'NTD thấy'],
        rows: [
          ['1', 'Qualified', 'Sent', 'Cột Application Received, chưa flag', 'Application Received', 'Qualified · Sent · Application Received', 'Thẻ ở cột Application Received'],
          ['2', 'Qualified', 'Sent', 'Cột Application Received, có `viewed_at`', 'Application Viewed', '… · Application Received, ✓ Viewed', 'Thẻ ở cột Application Received'],
          ['3', 'Qualified', 'Sent', 'Cột Application Received, có `downloaded_at`', 'Application Saved', '… · Application Received, ✓ Downloaded', 'Thẻ ở cột Application Received'],
          ['4', 'Qualified', 'Sent', 'Cột giữa', 'In Process', 'Qualified · Sent · In Process', 'Thẻ ở cột do NTD đặt tên'],
          ['5', 'Qualified', 'Sent', 'Cột Passed', 'Passed', 'Qualified · Sent · Passed', 'Thẻ ở Passed'],
          ['6', 'Qualified', 'Sent', 'Cột Not This Time', 'Not This Time', 'Qualified · Sent · Not This Time', 'Thẻ ở Not This Time'],
          ['7', 'Cannot Read', 'Not Sent', '—', 'In Review', 'Cannot Read · Not Sent · —', 'Không thấy'],
          ['8', 'Not Enough Information', 'Not Sent', '—', 'In Review', 'Not Enough Information · Not Sent · —', 'Không thấy'],
          ['9', 'Rejected', 'Not Sent', '—', 'Invalid Application', 'Rejected · Not Sent · —', 'Không thấy'],
          ['10', 'Rejected', 'Recall', 'Giữ vị trí lúc bị thu hồi', 'Application Withdrawn', 'Rejected · Recall · Stage lúc bị thu hồi', 'Nhãn thu hồi, toàn bộ thông tin CV **bị khoá** (không xem, không tải, không kéo thẻ), nhận email'],
        ],
      },

      /* ── §3 ─────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '§3 · Kiểm tra CV (CV Review)' },
      {
        kind: 'list',
        heading: 'Saramin CV (form online)',
        items: [
          'Không qua bước kiểm tra, luôn là **Qualified · Sent**.',
          'Lý do: nút Lưu / Nộp bị khoá cho tới khi điền đủ trường bắt buộc — chọn “Chưa có kinh nghiệm”: bắt buộc **Education**; chọn “Đã có kinh nghiệm”: bắt buộc **Education và Work Experience**.',
        ],
      },
      {
        kind: 'table',
        heading: 'File upload (PDF / Word) — bóc tách 10 trường, rồi kiểm tra 2 bước theo thứ tự',
        cols: ['Bước', 'Kiểm tra', 'Không đạt', 'Đạt'],
        rows: [
          ['1. Đọc được', 'File mở được, không hỏng, không có mật khẩu', 'Cannot Read · Not Sent', 'Sang bước 2'],
          ['2. Đủ trường bắt buộc', 'Experienced: cần **Edu + Work**. No experience: chỉ cần **Edu**', 'Not Enough Information · Not Sent', 'Qualified · Sent'],
        ],
      },
      {
        kind: 'list',
        items: [
          'Không đạt bước 1 thì dừng, không chạy bước 2.',
          'Experienced / No experience lấy theo lựa chọn của ứng viên trong hồ sơ.',
          '**Qualified · Sent:** tự động tạo thẻ ở cột Application Received bên NTD.',
          '**Not Sent:** không tạo thẻ bên NTD, hồ sơ vào hàng đợi của Operator.',
        ],
      },
      {
        kind: 'open',
        text: '**Hồ sơ nộp trong lúc CV đang được bóc tách** (bóc tách mất khoảng 3 phút) — hai phương án: (1) **chặn nút tạo CV** cho tới khi bóc tách xong; hoặc (2) cho tạo CV và nộp ngay, hồ sơ **giữ ở Not Sent** cho tới khi bóc tách xong rồi hệ thống tự xử lý theo kết quả.',
      },
      {
        kind: 'diagram',
        id: 'cm-review',
        heading: 'Kiểm tra một file upload',
      },

      /* ── §4 ─────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '§4 · Xử lý tại Admin: Approve, Reject, Recall' },
      {
        kind: 'table',
        heading: 'Thao tác theo trạng thái (menu ⋮ trên màn Applications)',
        cols: ['CV Status · Application Status', 'View details', 'Approve', 'Reject', 'Recall'],
        rows: [
          ['Cannot Read · Not Sent', 'Có', 'Có', 'Có', 'Không'],
          ['Not Enough Information · Not Sent', 'Có', 'Có', 'Có', 'Không'],
          ['Qualified · Sent', 'Có', 'Không', 'Không', 'Có (chỉ Admin / CS)'],
          ['Rejected · Not Sent', 'Có', 'Không', 'Không', 'Không'],
          ['Rejected · Recall', 'Có', 'Không', 'Không', 'Không'],
        ],
      },
      {
        kind: 'list',
        heading: 'Quyết định theo phiên bản CV',
        items: [
          'Approve, Reject và Recall là quyết định trên **phiên bản CV**, áp dụng cho **mọi hồ sơ dùng cùng phiên bản CV** đó, ở mọi công ty, trong cùng một lần lưu.',
          'Mỗi hồ sơ lưu lại phiên bản CV tại thời điểm nộp.',
          'Phiên bản CV khác (kể cả của cùng CV) và CV khác của cùng ứng viên **không bị ảnh hưởng**.',
          'Application Status và Pipeline Status vẫn lưu theo từng hồ sơ: mỗi công ty xử lý độc lập.',
        ],
      },
      {
        kind: 'table',
        heading: 'Một thao tác làm gì với các hồ sơ dùng cùng phiên bản CV',
        cols: ['Thao tác', 'Hồ sơ dùng cùng phiên bản CV đang là', 'Sau thao tác', 'Ứng viên thấy'],
        rows: [
          ['**Approve**', 'Đang chờ xử lý (Cannot Read / Not Enough Information · Not Sent)', 'Qualified · Sent, tạo thẻ ở cột Application Received của từng công ty', 'Application Received'],
          ['**Approve**', 'Rejected, hoặc đã Sent', 'Không đổi', 'Không đổi'],
          ['**Reject / Recall**', 'Chưa gửi (Not Sent)', 'Rejected · Not Sent', 'Invalid Application'],
          ['**Reject / Recall**', 'Đã gửi (Sent, bất kỳ cột nào)', 'Rejected · Recall', 'Application Withdrawn'],
        ],
      },
      {
        kind: 'example',
        heading: 'Hai phiên bản của cùng một CV, hai công ty',
        scenario: 'Ứng viên nộp CV bản **1.1** vào **công ty A**, rồi cập nhật CV và dùng bản **2.2** nộp vào **công ty B**.',
        cols: ['Bước', 'Việc xảy ra', 'Hồ sơ ở A', 'Hồ sơ ở B'],
        rows: [
          ['1', 'Nộp A bằng bản 1.1', 'Qualified · **Sent**', '—'],
          ['2', 'Nộp B bằng bản 2.2', 'Qualified · Sent', 'Not Enough Information · Not Sent'],
          ['3', 'Admin Reject hồ sơ ở B', '**Vẫn Sent** — dùng phiên bản CV khác', 'Rejected · Not Sent'],
        ],
      },
      {
        kind: 'list',
        heading: 'Reject',
        items: [
          '**Bắt buộc chọn lý do.**',
          'Hồ sơ chưa gửi: **Rejected · Not Sent**. NTD không bao giờ thấy.',
          'Hồ sơ đã gửi dùng cùng phiên bản CV: chuyển thành **Rejected · Recall**.',
        ],
      },
      {
        kind: 'list',
        heading: 'Recall',
        items: [
          'Chỉ **Admin / CS**, và chỉ thực hiện từ hồ sơ đã **Sent**, ở bất kỳ cột nào trên Kanban.',
          'Hai bước: (1) chọn 1 trong 4 lý do — *Can’t read · Not a CV · CV but not enough information · Khác*; (2) nhập **ghi chú nội bộ** (bắt buộc, tối đa 500 ký tự). Chọn *Khác* thì có thêm ô nhập lý do (bắt buộc, tối đa 200 ký tự).',
          '**Lý do nào cũng cho cùng kết quả:** CV Status = Rejected, Application Status = Recall.',
          'Lý do và ghi chú **chỉ lưu nội bộ**, không hiển thị cho ứng viên hay NTD.',
          'Recall **không hoàn tác được**, và ứng viên không nộp lại được vào job đó (*CV review §6*).',
          'Pipeline Status và 2 flag **giữ nguyên** giá trị tại thời điểm Recall để Admin tra cứu.',
        ],
      },
      {
        kind: 'p',
        text: '**NTD thấy gì với một CV đã Recall** (chốt ở tài liệu *CV review* 15/10): thẻ **ở lại** với **nhãn thu hồi**, toàn bộ thông tin CV **bị khoá** — không xem, không tải, không kéo thẻ — và NTD **nhận email** thông báo.',
      },
      {
        kind: 'list',
        heading: 'Quy tắc khác',
        items: [
          'Hộp thoại Approve, Reject, Recall hiện **số hồ sơ và số công ty bị ảnh hưởng** trước khi xác nhận.',
          '2 Operator cùng xử lý 1 CV: thao tác đầu tiên được lưu, người sau nhận thông báo *“CV đã được xử lý”*.',
          'Lưu lịch sử của từng hồ sơ: ai thao tác, lúc nào, lý do, theo hồ sơ nào.',
          'Operator hoặc Admin mở / tải CV **không** bật flag Viewed / Downloaded.',
        ],
      },
      {
        kind: 'diagram',
        id: 'cm-decision',
        heading: 'Một thao tác, mọi hồ sơ cùng phiên bản CV',
      },

      /* ── §5 ─────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '§5 · Employer Dashboard: Kanban', path: '/applicants' },
      {
        kind: 'table',
        heading: '3 vùng: 1 cột đầu cố định, các cột giữa linh hoạt, 2 cột cuối cố định',
        cols: ['Vùng', 'Cột', 'Trước đây', 'NTD được sửa', 'Pipeline Status', 'Ứng viên thấy'],
        rows: [
          ['Cột đầu', '**Application Received**', '“CV screening”', 'Không', 'Application Received', 'Application Received / Viewed / Saved'],
          ['Cột giữa', 'Do NTD đặt tên (Interview 1, Test, HR…)', 'Interview 1, Interview 2, nút +', 'Thêm, xóa, đổi tên', 'In Process', 'In Process'],
          ['Cột cuối', '**Passed**', '“Final acceptance”', 'Không', 'Passed', 'Passed'],
          ['Cột cuối', '**Not This Time**', 'Chưa có', 'Không', 'Not This Time', 'Not This Time'],
        ],
      },
      {
        kind: 'list',
        items: [
          '**Cột Application Received:** luôn là cột đầu, không xóa, không đổi tên, không đổi vị trí. Chỉ chứa hồ sơ Application Status = Sent.',
          '**Hồ sơ Not Sent không bao giờ xuất hiện trên Kanban**, kể cả trong ô đếm số ứng viên, tìm kiếm, filter, Download All. Hệ thống chặn ở tầng API, không chỉ ẩn trên giao diện.',
          '**Cột giữa:** NTD thêm (nút +), xóa, đổi tên. Cột giữa mới luôn được chèn **trước Passed**.',
          '**Passed và Not This Time:** luôn nằm cuối bảng theo thứ tự Passed rồi Not This Time, không xóa, không đổi tên. NTD vẫn **kéo thẻ vào và kéo ra** được.',
          '**Mỗi lần kéo thẻ** cập nhật Pipeline Status. Với cột giữa, hệ thống lưu thêm id cột.',
          '**Job cũ:** CV screening đổi tên thành Application Received, Final acceptance đổi tên thành Passed, thêm cột Not This Time. Thẻ giữ nguyên vị trí.',
          '**Job mới:** mặc định có Application Received, Interview 1, Interview 2, Passed, Not This Time.',
        ],
      },
      {
        kind: 'diagram',
        id: 'cm-kanban',
        heading: 'Thẻ đi qua Kanban',
      },
      {
        kind: 'p',
        text:
          '**Màn hình tab Jobs.** Cột trái liệt kê các tin (hoặc *All openings*); đầu trang hiện tin, số ứng viên và địa điểm; thanh công cụ đổi *List view / Board view*, tìm ứng viên, lọc (*Candidate classification*: *All / Bookmarked*) và sắp xếp (*Newest applied* mặc định · nhiều / ít kinh nghiệm · học vấn cao / thấp). Dưới đó mỗi cột một chip kèm số đếm — bấm để lọc.',
      },
      {
        kind: 'table',
        heading: 'Một dòng hiện gì (List view)',
        cols: ['Cột', 'Nghĩa'],
        rows: [
          ['**Candidate**', 'Tên, giới tính · tuổi, và một ngôi sao (bookmark). Bấm tên mở trang CV — **lần mở đầu tiên bật flag Viewed**.'],
          ['**Experience**', 'Tổng kinh nghiệm, công ty gần nhất và thời gian ở đó — hoặc *Entry level*. Sắp xếp được.'],
          ['**Education**', 'Bậc **cao nhất** và trường. Sắp xếp được.'],
          ['**Desired role & Skills**', 'Vị trí mong muốn (đậm), rồi các chip kỹ năng, tràn thì *+N*.'],
          ['**Days in stage**', 'Ứng viên đã chờ ở cột hiện tại bao lâu.'],
        ],
      },
      {
        kind: 'table',
        heading: 'Thao tác khác của NTD',
        cols: ['Thao tác', 'Điều gì xảy ra'],
        rows: [
          ['**Kéo thẻ**', 'Dropdown · kéo ở Board view · chọn nhiều → *Move to next step* (≤ 200). Cập nhật Pipeline Status; ứng viên thấy trạng thái mới ngay (§6).'],
          ['**Tải CV**', 'Từng file hoặc **Download All** — bật flag Downloaded **cho từng CV** trong lựa chọn.'],
          ['**Star**', 'Bookmark; lọc *Candidate classification → Bookmarked*.'],
          ['**Delete**', 'Ứng viên rời bảng của bạn; họ vẫn giữ lịch sử nộp đơn.'],
          ['**Save all**', 'Tải Excel qua ba bước: chọn lý do → xác nhận bằng **mật khẩu tài khoản** (sai 5 lần thì bị khoá) → tải. File **không** có mật khẩu.'],
          ['**Hồ sơ Recall**', 'Nhãn thu hồi, toàn bộ thông tin CV **bị khoá** (không xem, không tải, không kéo thẻ), nhận email (§4).'],
          ['**Hồ sơ Withdrawn** — *đang triển khai*', 'Nhãn **“Ứng viên đã thu hồi đơn ứng tuyển”**, thông tin CV bị khoá, nhận email (**CV review §7**).'],
          ['**Hồ sơ In Review / Invalid Application / Application Withdrawn**', 'Mọi thao tác của NTD **bị từ chối**, trạng thái không đổi (AC12).'],
        ],
      },
      {
        kind: 'open',
        text: '**Chưa map vào Kanban mới:** thao tác *Failure* (hộp *Disqualification*, 6 lý do loại) của bản build 08/10 kéo thẻ về cột *Rejected* cũ — nay không còn cột này. Cần chốt: *Failure* có thành kéo thẻ sang **Not This Time** (kèm lý do) hay bỏ hẳn. Nút *Select* vẫn *Not available yet*.',
      },

      /* ── §6 ─────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '§6 · Trạng thái ứng viên nhìn thấy' },
      {
        kind: 'table',
        heading: '9 trạng thái',
        cols: ['#', 'Trạng thái (EN)', 'Nhãn (VI)', 'Ý nghĩa'],
        rows: [
          ['1', '**Application Received**', 'NTD nhận CV', 'CV đạt, đã gửi sang NTD, NTD chưa mở hay tải'],
          ['2', '**In Review**', 'CV đang xử lý', 'CV đang chờ Operator xem tay, chưa gửi sang NTD'],
          ['3', '**Invalid Application**', 'CV không hợp lệ', 'CV chưa gửi bị từ chối. Kết thúc'],
          ['4', '**Application Withdrawn**', 'CV thu hồi', 'CV đã gửi rồi bị thu hồi — hoặc ứng viên xin rút đơn (*Withdraw application*, đang triển khai). Kết thúc'],
          ['5', '**Application Viewed**', 'NTD xem CV', 'NTD đã mở xem khi thẻ còn ở cột Application Received'],
          ['6', '**Application Saved**', 'NTD lưu CV', 'NTD đã tải CV khi thẻ còn ở cột Application Received'],
          ['7', '**In Process**', 'Đang xử lý', 'Thẻ ở một cột giữa'],
          ['8', '**Passed**', 'Đạt tuyển chọn / Mời nhận việc', 'Thẻ ở cột Passed'],
          ['9', '**Not This Time**', 'Không đạt', 'Thẻ ở cột Not This Time'],
        ],
      },
      {
        kind: 'table',
        heading: '2 flag',
        cols: ['Flag', 'Bật khi', 'Lưu'],
        rows: [
          ['**Viewed**', 'NTD mở chi tiết CV', 'Thời điểm đầu tiên (`viewed_at`)'],
          ['**Downloaded**', 'NTD tải CV, từng file hoặc Download All (bật cho từng CV trong lựa chọn)', 'Thời điểm đầu tiên (`downloaded_at`)'],
        ],
      },
      {
        kind: 'list',
        items: [
          'Flag lưu theo **từng hồ sơ ứng tuyển**, không theo CV.',
          'Chỉ lưu lần đầu, không ghi đè, **không bao giờ reset**.',
          'Flag được ghi nhận ở mọi cột, nhưng **chỉ làm đổi trạng thái** khi thẻ còn ở cột Application Received.',
          'Chỉ hành động của NTD mới bật flag.',
        ],
      },
      {
        kind: 'table',
        heading: 'Cách tính trạng thái — kiểm tra từ trên xuống, gặp điều kiện đúng đầu tiên thì dừng',
        note: 'Khi thẻ còn ở cột Application Received: **Saved > Viewed > Received** — xem lại CV đã Saved không làm tụt về Viewed. Khi thẻ đã rời cột này: trạng thái pipeline **luôn đè lên**. Recall được kiểm tra **trước** Rejected, nên hồ sơ bị thu hồi luôn hiện *Application Withdrawn* dù CV Status = Rejected.',
        cols: ['Bước', 'Điều kiện', 'Trạng thái'],
        rows: [
          ['1', 'Application Status = Recall', 'Application Withdrawn'],
          ['2', 'CV Status = Rejected', 'Invalid Application'],
          ['3', 'Application Status = Not Sent', 'In Review'],
          ['4', 'Thẻ không còn ở cột Application Received', 'Theo cột: In Process / Passed / Not This Time'],
          ['5', 'Có `downloaded_at`', 'Application Saved'],
          ['6', 'Có `viewed_at`', 'Application Viewed'],
          ['7', 'Còn lại', 'Application Received'],
        ],
      },
      {
        kind: 'diagram',
        id: 'cm-candidate-status',
        heading: 'Cách tính, dạng sơ đồ',
      },
      {
        kind: 'table',
        heading: 'Tình huống mẫu',
        cols: ['Tình huống', 'Ứng viên thấy'],
        rows: [
          ['CV vừa sang NTD, chưa ai mở', 'Application Received'],
          ['NTD mở CV', 'Application Viewed'],
          ['NTD mở rồi tải CV', 'Application Saved'],
          ['NTD tải CV rồi mở lại', 'Application Saved'],
          ['Thẻ được kéo sang Interview 1', 'In Process'],
          ['Thẻ đang ở Interview 1, NTD tải lại CV', 'In Process'],
          ['Thẻ được kéo sang Passed', 'Passed'],
          ['Thẻ được kéo sang Not This Time', 'Not This Time'],
          ['Admin / CS Recall hồ sơ đã gửi', 'Application Withdrawn'],
          ['Cùng phiên bản CV được Approve từ hồ sơ khác, hồ sơ này đang chờ', 'Application Received'],
          ['Cùng phiên bản CV bị Reject ở hồ sơ khác, hồ sơ này chưa gửi', 'Invalid Application'],
          ['Cùng phiên bản CV bị Reject / Recall ở hồ sơ khác, hồ sơ này đã gửi', 'Application Withdrawn'],
          ['Phiên bản CV khác bị Reject / Recall', 'Không đổi'],
        ],
      },

      /* ── §7 ─────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '§7 · Màn Admin: Recruitment › Applications', path: '/recruitment/applications' },
      {
        kind: 'table',
        heading: 'Cột trạng thái trên bảng',
        note: 'Thứ tự cột: CV Status · Application Status · Stage · Employer · Viewed · Downloaded. 2 cột flag chỉ đọc, hover hiện đầy đủ ngày giờ. Hiện tên từng vòng ở Stage (ví dụ “In Process · Interview 1”) là **giai đoạn 2**. Chi tiết đầy đủ của màn hình ở trang **Applications**.',
        cols: ['Cột', 'Hiển thị'],
        rows: [
          ['**CV Status**', 'Qualified, Cannot Read, Not Enough Information, Rejected'],
          ['**Application Status**', 'Chỉ Not Sent, Sent, Recall. **Không bao giờ hiện Rejected**'],
          ['**Stage · Employer**', 'Vị trí thẻ: Application Received, In Process (gom mọi cột giữa), Passed, Not This Time. “—” khi Not Sent'],
          ['**Viewed**', '✓ kèm ngày lần đầu NTD mở xem. “—” nếu chưa hoặc Not Sent'],
          ['**Downloaded**', '✓ kèm ngày lần đầu NTD tải. “—” nếu chưa hoặc Not Sent'],
        ],
      },
      {
        kind: 'table',
        heading: 'Tab',
        note: 'Không có tab *Rejected*. Xem CV bị từ chối: tab *Not sent* rồi lọc CV Status = Rejected. Xem hàng đợi chờ Operator: tab *Not sent* rồi lọc CV Status = Cannot Read hoặc Not Enough Information. Bộ lọc theo **CV Status** (chọn nhiều), **Viewed** (Có / Chưa), **Downloaded** (Có / Chưa). **Export Excel** có thêm 4 cột: Viewed (Yes / No), Viewed at, Downloaded (Yes / No), Downloaded at.',
        cols: ['Tab', 'Điều kiện lọc'],
        rows: [
          ['**All**', 'Tất cả'],
          ['**Not sent**', 'Application Status = Not Sent (gồm Cannot Read, Not Enough Information, Rejected)'],
          ['**Sent**', 'Application Status = Sent'],
          ['**Recall**', 'Application Status = Recall'],
        ],
      },

      /* ── §8 ─────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '§8 · Màn Jobseeker: Việc đã ứng tuyển', path: '/my-profile/applications' },
      {
        kind: 'list',
        items: [
          'Mỗi hồ sơ hiện **1 trong 9 trạng thái** (§6) dạng nhãn có màu, thay cho chữ “Applied” cố định trước đây. Giá trị do hệ thống tính, màn hình chỉ hiển thị.',
          'Nhãn hiển thị theo ngôn ngữ trang (EN / VI). Hover hoặc bấm vào nhãn hiện mô tả ngắn.',
          'Ứng viên **không thấy**: CV Status, Application Status, tên cột do NTD đặt, thời điểm NTD xem / tải, lý do Reject / Recall, ghi chú nội bộ.',
          '**Không có** nút sửa, thu hồi hay xóa hồ sơ ở bất kỳ trạng thái nào. Nút *View application* giữ ở mọi trạng thái.',
          'Trạng thái cập nhật **không cần tải lại trang** khi có thay đổi.',
        ],
      },
      {
        kind: 'table',
        heading: '3 thẻ tổng hợp — đếm theo bộ lọc thời gian đang chọn',
        cols: ['Thẻ', 'Đếm'],
        rows: [
          ['**Job applied** (Việc đã ứng tuyển)', 'Tất cả hồ sơ, mọi trạng thái'],
          ['**Selection in progress** (Đang tuyển chọn)', 'Hồ sơ In Process'],
          ['**Selected** (Đạt tuyển chọn)', 'Hồ sơ Passed'],
        ],
      },
      {
        kind: 'table',
        heading: 'Bộ lọc',
        cols: ['Bộ lọc', 'Logic'],
        rows: [
          ['**Thời gian**', 'Giữ như hiện tại'],
          ['**Tất cả trạng thái**', '9 trạng thái, theo thứ tự 1 đến 9'],
          ['**Trạng thái tin đăng**', 'Job còn mở / đã đóng, không liên quan tới trạng thái hồ sơ'],
          ['**Tìm kiếm**', 'Giữ như hiện tại'],
        ],
      },

      /* ── §9 ─────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '§9 · Thông báo' },
      {
        kind: 'table',
        cols: ['Đối tượng', 'Khi nào', 'Kênh'],
        rows: [
          ['**Ứng viên**', 'Mỗi khi trạng thái hiển thị thay đổi', 'Cập nhật ngay trên “Việc đã ứng tuyển”. **Không** gửi email lẻ cho mỗi lần đổi trạng thái'],
          ['**Ứng viên**', 'Hàng tuần', '1 email tổng hợp cuối tuần, gom theo nhóm trạng thái'],
          ['**NTD**', 'Khi hồ sơ chuyển sang **Sent** (CV đạt lúc nộp, hoặc Operator Approve sau đó)', 'Email báo có đơn ứng tuyển mới. Hồ sơ Not Sent không gửi email'],
          ['**NTD**', 'Khi hồ sơ bị thu hồi', '**Email** thông báo; thẻ mang nhãn thu hồi, thông tin CV bị khoá'],
        ],
      },
      {
        kind: 'diagram',
        id: 'cm-notify',
        heading: 'Ai được báo',
      },

      /* ── §10 Talent pool (tài liệu phía NTD 16/10) ──────────────────────── */
      { kind: 'h', text: '§10 · Tab Talent pool — folder ứng viên đã lưu', path: '/applicants?tab=talent-pool' },
      {
        kind: 'p',
        text: 'Theo tài liệu *Resume Management · Talent pool (phía nhà tuyển dụng)*, cập nhật 16/10/2026. Đường vào: thanh đầu trang › **Candidate management** › tab **Talent pool**. Ai dùng: người dùng của công ty có **quyền quản lý ứng viên**.',
      },
      {
        kind: 'list',
        items: [
          'NTD tìm ứng viên trong kho tìm kiếm (`/search` — trang **Talent pool**), bấm **Save candidate** để lưu ứng viên vào **folder**.',
          'Mỗi folder là một **bảng Kanban** để theo dõi ứng viên qua từng vòng tuyển dụng, **cùng cấu trúc với Kanban của job** (§5).',
          'Ứng viên **chưa mở khoá** thì tên và thông tin liên hệ bị che. **Kéo thẻ ra khỏi cột Saved** là mở khoá và **trừ credit** (trừ khi đã mở khoá từ trước).',
          'Thẻ trong folder Talent pool **không phải đơn ứng tuyển**: kéo thẻ không đổi trạng thái gì phía ứng viên.',
        ],
      },
      {
        kind: 'diagram',
        id: 'tpe-flow',
        heading: 'Từ Save candidate tới các vòng tuyển dụng',
      },
      {
        kind: 'shot',
        src: '/shots/tp/folder-kanban.png',
        where: 'Company site',
        caption: '**Candidate management › Talent pool**: thanh công cụ (chế độ xem, *Search candidate*, *Filter*, *Multi-select*, *Save all*) và bảng Kanban của folder đang mở — **Saved · Interview 1 · Interview 2 · + · Passed · Not This Time**. Thẻ chưa mở khoá hiện tên che (`Nguyễn***`).',
      },
      {
        kind: 'table',
        heading: 'Màn hình',
        cols: ['Phần', 'Chi tiết'],
        rows: [
          ['**Jobs / Talent pool**', 'Chuyển giữa ứng viên theo job (đơn ứng tuyển — §5) và ứng viên trong Talent pool'],
          ['**Position, candidate search**', 'Tìm folder hoặc ứng viên'],
          ['**Danh sách folder**', 'Các folder công ty đã tạo (ví dụ *test folder, BA, BE Afdit…*)'],
          ['**Search candidate**', 'Tìm ứng viên trong folder đang mở'],
          ['**Filter**', 'Lọc ứng viên trong folder'],
          ['**Chế độ xem**', 'Dạng danh sách hoặc dạng Kanban (2 biểu tượng cạnh ô tìm kiếm)'],
          ['**Multi-select**', 'Chọn nhiều thẻ cùng lúc để thao tác'],
          ['**Save all**', 'Tải về CV của các ứng viên'],
        ],
      },
      {
        kind: 'table',
        heading: 'Cấu trúc cột',
        note: 'Passed và Not This Time luôn nằm cuối bảng, theo thứ tự Passed rồi Not This Time — không xoá, không đổi tên, không đổi vị trí; vẫn **kéo thẻ vào và kéo ra** được. Folder mới mặc định: **Saved · Interview 1 · Interview 2 · Passed · Not This Time**. Số cạnh tên cột là số ứng viên trong cột; cột trống hiện *“No candidates”*.',
        cols: ['Vùng', 'Cột', 'NTD được sửa'],
        rows: [
          ['Cột đầu', '**Saved** — ứng viên vừa lưu từ tìm kiếm', 'Không'],
          ['Cột giữa', '**Interview 1, Interview 2…**', 'Thêm (nút **+**), xoá, đổi tên. Cột mới chèn **trước Passed**'],
          ['Cột cuối', '**Passed** (nền xanh dương)', 'Không'],
          ['Cột cuối', '**Not This Time** (nền đỏ nhạt)', 'Không'],
        ],
      },
      {
        kind: 'table',
        heading: 'Thẻ ứng viên',
        cols: ['Phần', 'Ý nghĩa'],
        rows: [
          ['**Tên**', 'Tên đã che (ví dụ `Nguyễn***`) khi chưa mở khoá; tên đầy đủ sau khi mở khoá'],
          ['**Thời gian ở cột**', 'Ứng viên đã nằm ở cột hiện tại bao lâu (*Today*, số ngày) — để biết hồ sơ nào đang bị để lâu, cần xử lý'],
          ['**Số năm kinh nghiệm**', 'Ví dụ *9 yrs exp.*'],
          ['**Ngôi sao**', 'Đánh dấu ứng viên yêu thích'],
        ],
      },
      {
        kind: 'shot',
        src: '/shots/tp/move-card-credit.png',
        where: 'Company site',
        caption: 'Kéo thẻ **chưa mở khoá** ra khỏi Saved: hộp **Moving this card spends a credit** — ứng viên chưa được mở khoá, chuyển cột sẽ hiện thông tin và trừ credit, kèm số credit còn lại (*You have 42 credits left.*). Hai nút **Don’t move** · **Spend credits and move**.',
      },
      {
        kind: 'table',
        heading: 'Kéo thẻ và chi phí credit',
        cols: ['Trường hợp', 'Kết quả'],
        rows: [
          ['Kéo thẻ **chưa mở khoá** ra khỏi cột Saved', 'Hiện hộp **“Moving this card spends a credit”** kèm số credit còn lại'],
          ['Bấm **Spend credits and move**', 'Trừ credit, mở khoá ứng viên (thấy tên, liên hệ, file CV), thẻ chuyển sang cột mới'],
          ['Bấm **Don’t move**', 'Thẻ ở lại cột Saved, không trừ credit'],
          ['Kéo thẻ **đã mở khoá**', 'Chuyển cột ngay, **không trừ credit**'],
          ['Kéo thẻ giữa các cột (không phải từ Saved)', 'Không trừ credit'],
        ],
      },
      {
        kind: 'list',
        items: [
          'Mở khoá **một lần, dùng vĩnh viễn** cho cả công ty. Ứng viên đã mở khoá ở folder này thì ở folder khác cũng **không bị trừ lại**.',
          '**Hết credit:** hệ thống báo không đủ credit và mời mua thêm.',
          '**Gói tìm kiếm CV đã hết hạn:** không mở khoá được; credit còn lại được giữ, không mất.',
          '**Ứng viên đã xoá tài khoản:** nếu công ty chưa mở khoá thì không mở khoá được nữa và thẻ không chuyển ra khỏi Saved được. Công ty đã mở khoá từ trước không bị ảnh hưởng.',
          'Nếu sau đó Saramin **từ chối CV** của ứng viên đã mở khoá, credit đã trả được **hoàn** vào số dư (xem **Talent pool §2.5**).',
        ],
      },
      {
        kind: 'list',
        heading: 'Lưu ý khi sử dụng',
        items: [
          '**Kéo thẻ từ Saved là trừ credit** nếu ứng viên chưa mở khoá. Đọc kỹ hộp thoại trước khi bấm *Spend credits and move*.',
          '**Tên folder và cột giữa đặt theo quy trình của công ty**; Saved, Passed, Not This Time là cột cố định, giống mọi folder và mọi job.',
          '**Folder Talent pool khác danh sách ứng viên của job:** ứng viên tự nộp đơn xem **miễn phí** ở tab **Jobs**; ứng viên NTD tự tìm và lưu thì cần mở khoá.',
        ],
      },

      /* ── §11 Credit (build 08/10) ───────────────────────────────────────── */
      { kind: 'h', text: '§11 · Credit — là gì và từ đâu ra' },
      {
        kind: 'table',
        cols: ['', 'Chi tiết'],
        rows: [
          ['**Một credit mua gì**', 'Danh tính và liên hệ của **một ứng viên** (tên, điện thoại, email, file CV, link) — một lần, cho **cả công ty**.'],
          ['**Giá**', 'Mỗi CV có giá riêng (`unlock_price`) — hiện **1** cho mọi CV. Hộp thoại luôn in đúng giá.'],
          ['**Từ đâu ra**', 'Một product **CV search** bán qua CRM. Credit về số dư khi **kế toán phát hành hoá đơn**; gói chạy **30 hoặc 90 ngày** kể từ khi bắt đầu (*Start this package* ở `/hiring/credits`, không hoàn tác).'],
          ['**Trạng thái gói**', '*Not started · Running · Fully used · Expired · Withdrawn*.'],
          ['**Cái gì tiêu**', '*Unlock* trên trang CV · kéo thẻ ra khỏi *Saved* · *Multi-select → Unlock*.'],
          ['**Cái gì KHÔNG bao giờ tiêu**', 'Mọi thứ trên tab Jobs · tìm kiếm · lưu · archive · mở lại một CV đã mở khoá · di chuyển một người đã mở khoá.'],
          ['**Gói hết hạn**', 'Credit còn lại bị **đóng băng, không mất**.'],
          ['**Số dư hiện ở**', 'Trang CV (*Remaining quota*, hoặc *Unlimited*), các hộp tính phí, `/hiring/credits`.'],
        ],
      },
      {
        kind: 'table',
        heading: 'Kịch bản test — Talent pool và credit',
        cols: ['#', 'Kịch bản', 'Đạt khi'],
        rows: [
          ['1', 'Lưu một kết quả tìm kiếm vào folder, rồi kéo ra khỏi *Saved*', 'Hộp xác nhận hiện số dư; sau khi xác nhận số dư **−1** và tên lộ ra trên thẻ, trong tìm kiếm CV và trên trang CV'],
          ['2', 'Cùng ứng viên đó lưu vào folder thứ hai rồi kéo', 'Không hộp thoại, không tính phí'],
          ['3', 'Công ty có 0 credit bấm *Unlock* trên trang CV', 'Hộp *Not enough credits*, *Confirm* dẫn sang trang mua; không trừ gì'],
          ['4', 'Cho ứng viên tắt *Show CV to employers*, rồi kéo thẻ đang khoá của họ', 'Bị từ chối (`CANDIDATE_NOT_SEARCHABLE`)'],
          ['5', 'HQ từ chối CV của một người công ty đã mở khoá', 'Số dư **+1** (hoàn), dòng lịch sử sử dụng ghi lý do'],
        ],
      },

      /* ── §12 Tiêu chí nghiệm thu ────────────────────────────────────────── */
      { kind: 'h', text: '§12 · Tiêu chí nghiệm thu' },
      {
        kind: 'table',
        cols: ['AC', 'Nội dung'],
        rows: [
          ['**AC1** · Saramin CV luôn hợp lệ', 'Còn trường bắt buộc trống thì nút Lưu / Nộp bị khoá. Điền đủ và nộp: Qualified, ứng viên thấy Application Received'],
          ['**AC2** · File upload đạt', 'File đọc được và đủ trường bắt buộc: Application Received, thẻ ở cột Application Received'],
          ['**AC3** · File upload cần xem lại', 'File lỗi, có mật khẩu hoặc thiếu trường bắt buộc: In Review, không xuất hiện trên Kanban'],
          ['**AC4** · Operator Approve', 'Hồ sơ đang chờ: thành Qualified · Sent, thẻ ở cột Application Received. Mọi hồ sơ khác dùng cùng phiên bản CV đang chờ cũng được gửi tới công ty tương ứng'],
          ['**AC5** · Operator Reject', 'Hồ sơ đang chờ: thành Rejected · Not Sent, ứng viên thấy Invalid Application, NTD không bao giờ thấy. Mọi hồ sơ khác dùng cùng phiên bản CV: chưa gửi thì Rejected · Not Sent, đã gửi thì Rejected · Recall'],
          ['**AC6** · Recall', 'Hồ sơ đã gửi, ở bất kỳ cột nào: chọn lý do, nhập ghi chú, bấm Recall thì CV Status = Rejected, Application Status = Recall, ứng viên thấy Application Withdrawn. Lý do nào cũng cùng kết quả. Hồ sơ chưa gửi không Recall được. Áp dụng cho mọi hồ sơ dùng cùng phiên bản CV'],
          ['**AC7** · Xem CV bật flag', 'NTD mở CV khi thẻ ở cột Application Received: lưu `viewed_at`, ứng viên thấy Application Viewed'],
          ['**AC8** · Tải CV bật flag', 'NTD tải CV (từng file hoặc Download All) khi thẻ ở cột Application Received: lưu `downloaded_at` cho từng CV, ứng viên thấy Application Saved'],
          ['**AC9** · Saved không bị tụt', 'Hồ sơ đang Application Saved, NTD mở xem lại: vẫn Application Saved'],
          ['**AC10** · Pipeline đè lên', 'Thẻ ở cột giữa hoặc cột cuối, NTD xem / tải CV: trạng thái không đổi. Flag vẫn được ghi nhận'],
          ['**AC11** · Cấu trúc Kanban', 'Cột Application Received cố định, cột giữa NTD thêm / xóa / đổi tên, 2 cột cuối cố định Passed và Not This Time'],
          ['**AC12** · Thao tác bị chặn', 'Hồ sơ In Review, Invalid Application hoặc Application Withdrawn: mọi thao tác của NTD bị từ chối, trạng thái không đổi'],
          ['**AC13** · Admin hiển thị 2 flag', 'Cột Viewed, Downloaded kèm thời gian, có bộ lọc, có trong file Export, hiện “—” với hồ sơ chưa gửi'],
          ['**AC14** · Nhãn thống nhất', 'Không còn nhãn “CV screening” trên Kanban và trên cột Stage của Admin'],
          ['**AC15** · Thông báo', 'Ứng viên thấy thay đổi ngay trên “Việc đã ứng tuyển”, không có email lẻ, có email tổng hợp cuối tuần'],
          ['**AC16** · Quyết định theo phiên bản CV', 'Approve / Reject / Recall một hồ sơ thì mọi hồ sơ dùng cùng phiên bản CV đổi cùng lúc. Phiên bản CV khác và CV khác của cùng ứng viên không đổi. Ví dụ: bản 1.1 đã Sent ở công ty A, bản 2.2 bị Reject ở công ty B, thì hồ sơ ở công ty A vẫn Sent'],
        ],
      },
    ],
  },
}

/* ── Module ───────────────────────────────────────────────────────────────── */
/* Carries the client's Notion "Resume management" page — a parent with four
   children (Create CV · CV review · Talent pool · Candidate management). Written
   as BUILT, origin/dev 2026-10-08: svn-be ee1db5ea9 · svn-web d8a43a11 ·
   saramin-vn-admin 45954108. */
export const RESUME_MODULE_DOCS: Record<string, ModuleDoc> = {
  'Resume management': {
    title: 'Resume management — một CV đi qua ba site',
    lead:
      'Đời một CV: **ứng viên** soạn hoặc tải lên ở site ứng viên → **bật** cho nhà tuyển dụng thấy → **máy quét** chấm (khi cờ quét bật) → **HQ** quyết những CV còn nghi ngờ ở *CV review* → ứng viên có mặt trong **kho** → **nhà tuyển dụng** tìm, lưu, mở khoá → hoặc nhận nó qua **đơn ứng tuyển**. Nhóm này đi theo đúng trang Notion *Resume management* của khách — Create CV · CV review · Talent pool · Candidate management.',
    headline: [
      '**Trạng thái CV là sự thật duy nhất được lưu về chất lượng.** Đơn có được gửi không suy ra từ nó; không màn hình nào đặt tay “Đã gửi”. Tìm kiếm CV cũng đọc nó: ứng viên phải **bật *Show CV to employers*** để vào kho, và NTD chỉ tìm thấy khi CV đang bật là ***Qualified*** (*Showing*) — theo tài liệu *Talent pool* 16/10.',
      '**Quy tắc Đạt đi theo từng CV, không theo người:** luôn cần **≥ 1 học vấn**; cần thêm **≥ 1 kinh nghiệm** trừ khi CV khai *No experience* (Fresher). Kỹ năng, dự án, tổng số năm kinh nghiệm **không** chặn.',
      '**Máy quét đang TẮT ở mọi môi trường** (`SVN_CV_QUALIFICATION_ENABLED`, mặc định `false`). File tải lên sinh ra ở *Đạt*, hàng đợi CV review gần như rỗng. Bật nó là **quyết định sản phẩm**, không phải việc deploy.',
      '**Nhà tuyển dụng trả tiền khi MỞ KHOÁ một người, không phải khi lưu** — giá của CV (hiện 1 credit), một lần, cho cả công ty. Người **tự nộp đơn** thì không tốn gì: nộp đơn chính là đồng ý cho xem.',
    ],
    blocks: [
      { kind: 'h', text: '§0 · Bốn trang, ba site' },
      {
        kind: 'table',
        cols: ['Trang', 'Site · đường dẫn', 'Ai dùng', 'Trả lời câu hỏi'],
        rows: [
          ['**Create CV**', 'Jobseeker site · `/my-profile/cv-resume`', 'Ứng viên', 'CV của tôi đã đủ để nộp đơn chưa, và CV nào đang cho nhà tuyển dụng thấy?'],
          ['**CV review**', 'Admin · `/recruitment/cv-review` · `cv_review:read` / `decide`', 'HQ (`hq_admin`, `vn_ops`, `vn_sales`)', 'CV đang nghi ngờ này có phải một CV thật, đọc được không?'],
          ['**Talent pool**', 'Admin · `/recruitment/talent-pool` · `resume:read` — và `/search` ở site công ty', 'HQ · nhà tuyển dụng', 'Ai đang có mặt cho nhà tuyển dụng tìm — và nếu không, vì sao?'],
          ['**Candidate management**', 'Company site · `/applicants`', 'Nhà tuyển dụng', 'Làm gì với người đã nộp đơn, và với người tôi đã lưu?'],
        ],
      },
      { kind: 'h', text: '§1 · Chuỗi một CV, từng chặng' },
      {
        kind: 'table',
        cols: ['#', 'Chặng', 'Ai', 'Kết quả', 'Ghi chú build'],
        rows: [
          ['1', '**Tạo**: soạn **Saramin CV** hoặc **tải file** (PDF / Word ≤ 10 MB); chọn *Experienced* / *No experience*', 'Ứng viên', 'Một CV trong thư viện, **v.1**', 'Không giới hạn số CV. File tải lên được **parse** ngay.'],
          ['2', '**Bật**: *Show CV to employers* — một CV tại một thời điểm', 'Ứng viên (hoặc hệ thống, cho file tải lên đầu tiên)', 'CV mặc định; ứng viên **vào kho tìm kiếm**', 'Vào kho Admin. NTD chỉ tìm thấy khi CV đang bật *Qualified* (*Showing*).'],
          ['3', '**Quét**: chấm theo quy tắc mỗi lần lưu / parse', 'Hệ thống', '*Đạt* · *Chưa đủ thông tin* · *Không đọc được*', 'Cờ **tắt**: file sinh ra *Đạt*, máy không ghi gì. Saramin CV luôn chấm trực tiếp, không qua máy quét.'],
          ['4', '**Duyệt**: CV nghi ngờ vào hàng đợi', 'HQ — CV review', 'Approve → *Đạt* · Reject → *Từ chối*', '**Chung cuộc** — không gỡ được (409).'],
          ['5', '**Có mặt trong kho**', '—', 'Hiện ở `/search` khi CV *Qualified* (*Showing*), **tên và liên hệ che**', 'Thẻ vẫn lộ tên công ty, tên trường.'],
          ['6', '**Nhà tuyển dụng tìm thấy**: xem (10 lượt miễn phí nếu không gói) · **Save** vào folder (miễn phí) · **Unlock** / kéo ra khỏi *Saved*', 'Nhà tuyển dụng', 'Lộ tên, điện thoại, email, file gốc', '1 credit, một lần, cho cả công ty.'],
          ['7', '**Nộp đơn** bằng một CV', 'Ứng viên', 'Hồ sơ *Sent* → thẻ ở cột **Application Received**, liên hệ mở sẵn — hoặc *Not Sent* (ứng viên thấy *In Review*) nếu CV đang chờ', 'Web làm mờ mọi CV *Unfinished*. NTD mở CV lần đầu → flag Viewed, ứng viên thấy *Application Viewed*.'],
        ],
      },
      { kind: 'h', text: '§2 · Trạng thái CV quyết định cái gì' },
      {
        kind: 'diagram',
        id: 'cv-status',
        note: 'Theo requirement *How CV status drives Application status and CV search status*, cột tìm kiếm theo tài liệu *Talent pool* 16/10: chỉ CV *Qualified* mới *Showing*.',
      },
      {
        kind: 'list',
        heading: 'Đọc sơ đồ thế nào',
        items: [
          '**Chỉ đọc từ trái sang phải.** Trạng thái đơn là **hình chiếu** của trạng thái CV; CV mới là bản ghi. Màn hình nào cho đặt tay *Sent* là đã tạo lại nguồn sự thật thứ hai mà mô hình này sinh ra để bỏ.',
          '**Ô lớn là giá trị nội bộ, dòng nhỏ là thứ người ta thấy.** *Not sent*, *Recall* là thứ hệ thống lưu và **admin** đọc. Dòng nhỏ dưới mỗi trạng thái là nhãn ứng viên thấy ở **My CVs**; ở *Việc đã ứng tuyển* họ thấy một trong 9 trạng thái — với file tải lên đang nghi ngờ là **In Review** (*Candidate management §6*). Nhầm các tầng này là cách đọc sai hay gặp nhất.',
          '**Hai dòng nghi ngờ hệ quả y hệt** — có chủ đích. *Chưa đủ thông tin* và *Không đọc được* khác nhau ở thứ HQ phải **nhìn**, không bao giờ ở thứ ứng viên hay công ty trải qua.',
          '**Recall chỉ có ở nơi CV đã được giao.** Từ chối một CV còn đang nghi ngờ thì không thu hồi gì — đơn chưa từng *Sent*, nên nó ở lại *Not sent* và không công ty nào được báo. Đọc *Recall* là việc từ chối làm với **thứ đã ra khỏi cửa**, không phải việc từ chối luôn làm.',
          '**Cả hai cửa đóng mặc định.** Requirement đã bỏ cơ chế tự gửi sau 24h: không đơn nào, không CV nào được thả ra theo giờ — chỉ người. Cái giá chuyển sang Saramin: hàng đợi không ai làm là **chặn đơn của ứng viên**, nên người trực hàng đợi không còn là tuỳ chọn.',
        ],
      },
      {
        kind: 'p',
        text:
          '**Tìm kiếm CV đi theo trạng thái CV.** *CV search status* là hình chiếu của trạng thái CV: **Showing** chỉ khi *Qualified*, mọi trạng thái khác **Hidden**, và NTD chỉ tìm thấy ứng viên *Showing*. CV đang chờ duyệt hoặc bị từ chối **không ra** ở `/search`, dù ứng viên vẫn bật *Show CV to employers*.',
      },
      {
        kind: 'table',
        heading: 'Mỗi bên nhìn thấy gì',
        note: 'Cột *My CVs* theo build 08/10; cột *Việc đã ứng tuyển* và *Nhà tuyển dụng* theo tài liệu Candidate management 14/10. Nhà tuyển dụng **không bao giờ** thấy chữ của người duyệt hay lý do Reject / Recall.',
        cols: ['Trạng thái CV', 'Ứng viên — My CVs', 'Ứng viên — Việc đã ứng tuyển', 'Nhà tuyển dụng'],
        rows: [
          ['**Đạt** (Qualified)', 'Không nhãn', '*Application Received* → *Viewed* / *Saved* → *In Process* / *Passed* / *Not This Time*', 'Thẻ ở cột *Application Received* của Kanban, rồi theo cột NTD kéo'],
          ['**Chờ duyệt** (tải lên — Cannot Read / Not Enough Information)', '*Unfinished* nếu lần parse thiếu mục; không nhãn nếu parse đủ hoặc chưa xong', '**In Review**', 'Không thấy hồ sơ — nó chưa được gửi'],
          ['**Unfinished** (Saramin CV)', '*Unfinished* + *Completion N%* + nút *Complete CV*', 'Không có hồ sơ — nút Nộp bị khoá', 'Không có gì'],
          ['**Từ chối** (Rejected)', 'Nhãn **Can’t read** (mọi lý do), lời nhắn khi rê chuột; trong trang sửa: *This CV wasn’t approved* + lời nhắn, **không nút**', 'Hồ sơ chưa gửi: **Invalid Application**. Hồ sơ đã gửi bằng phiên bản này: **Application Withdrawn**', 'Hồ sơ đã Recall: nhãn thu hồi, thông tin CV **bị khoá**, nhận email. Lượt mở khoá đã trả được hoàn credit'],
        ],
      },
      { kind: 'h', text: '§3 · Trạng thái CV — một field, bốn giá trị, hai cái tạm thời' },
      {
        kind: 'p',
        text:
          '**Hai lớp.** Lớp 1 là **máy quét** lúc lưu / parse: ghi *Đạt*, hoặc một trong hai trạng thái **nghi ngờ** — tạm thời ngay từ tên gọi, là một câu hỏi chứ chưa phải phán quyết. Lớp 2 là **HQ**, mà toàn bộ việc là đưa nghi ngờ về một trạng thái chung cuộc: *Approve* → *Đạt*, *Reject* → *Từ chối*. Việc giao đơn đọc từ trạng thái này và **không lưu riêng ở đâu cả**.',
      },
      {
        kind: 'table',
        note: '**Chỉ đọc từ trái sang phải.** Trạng thái đơn ứng tuyển là **hình chiếu** của trạng thái CV — không màn hình nào cho đặt tay “Đã gửi”. Tìm kiếm CV **không** nằm trong bảng này — xem §2.',
        cols: ['Trạng thái CV', 'Loại · ai ghi', 'Đơn ứng tuyển dùng CV này', 'Người duyệt làm được gì'],
        rows: [
          ['**Đạt** — chưa ai xem', 'Máy quét ghi, hoặc mặc định khi cờ tắt', 'Gửi tới nhà tuyển dụng', 'Từ chối (từ *Talent pool*) → *Từ chối*'],
          ['**Đạt** — người duyệt', 'Chung cuộc — *Approve*', 'Gửi; mọi đơn đang giữ **đi cùng lúc**', '**Không gì nữa** (409)'],
          ['**Chưa đủ thông tin**', 'Nghi ngờ — tạm thời', '**Không gửi** — giữ tới khi CV *Đạt*', 'Duyệt → *Đạt* · Từ chối → *Từ chối*'],
          ['**Không đọc được**', 'Nghi ngờ — tạm thời', '**Không gửi** — giữ tới khi CV *Đạt*', 'Duyệt → *Đạt* · Từ chối → *Từ chối*'],
          ['**Từ chối**', 'Chung cuộc — **chỉ** người duyệt ghi', 'Đơn đang giữ: *Không được gửi* vĩnh viễn. Đơn đã gửi bằng version này: **Thu hồi**. Lượt mở khoá NTD đã trả cho ứng viên này: **hoàn credit**', '**Không gì nữa** (409) — chỉ version mới đưa CV về chờ'],
        ],
      },
      {
        kind: 'table',
        heading: 'Application status — đúng 3 giá trị',
        note: 'Theo tài liệu Candidate management 14/10/2026. Không có *Pending*: một hồ sơ trên CV nghi ngờ đọc là *Not Sent*, vì chép sự nghi ngờ lần thứ hai vào một cột vốn đã đọc từ CV là cách hai bản của một sự thật bắt đầu lệch nhau. *Not Sent* vì thế gồm cả “đang chờ duyệt” lẫn “bị từ chối trước khi giao” — **cột CV Status ngay bên trái** cho biết là cái nào. **“Rejected” là CV Status, không phải Application Status** — giá trị *Rejected* theo từng đơn của build 08/10 không còn.',
        cols: ['Giá trị', 'Nghĩa', 'Ứng viên thấy'],
        rows: [
          ['*Not Sent*', 'Công ty chưa thấy — CV đang chờ, hoặc bị từ chối trước khi giao', '*In Review* (đang chờ) · *Invalid Application* (bị từ chối)'],
          ['*Sent*', 'Công ty đang có hồ sơ trên Kanban', 'Theo cột và flag'],
          ['*Recall*', 'Đã giao, rồi bị Saramin kéo lại — Admin / CS Recall, hoặc phiên bản CV đó bị Reject. CV Status luôn là *Rejected*', '*Application Withdrawn*'],
        ],
      },
      {
        kind: 'list',
        heading: 'Luật của trạng thái',
        items: [
          '**Một CV, nhiều đơn.** Một CV có thể đứng sau ba mươi đơn, cả ba mươi đọc chung một trạng thái — nên một lần *Approve* / *Reject* giải quyết hết, và HQ quyết trên **CV**, không trên đơn.',
          '**Nhưng từ chối chỉ thu hồi đơn mang ĐÚNG version bị từ chối.** Phép thử là một phép so sánh: version đơn này đang giữ có trùng version vừa bị từ chối không? Trùng → *Recall*. Khác → để nguyên. Lý do: ứng viên làm CV xấu đi **sau** khi gửi thì công ty không bị phạt vì một việc họ không thấy và không làm. Những ca đáng thu hồi vẫn thu hồi — CV máy quét cho qua nhầm, CV giả phát hiện sau, CV bị công ty báo — vì ở cả ba, version đã gửi **chính là** version bị từ chối. Build làm đúng luật này (khối hậu quả `/reject-impact` đếm sẵn ba nhóm).',
          '**Máy quét được nghi ngờ; chỉ người được từ chối.** Hệ thống không bao giờ ghi *Từ chối* — một máy chấm tự động được giữ một câu hỏi mở, không được chấm dứt việc giao đơn của một ứng viên.',
          '**Không gì được thả theo giờ.** Đơn *Not sent* trên CV nghi ngờ nằm đó tới khi version hiện tại *Đạt*. Vì vậy dòng mang **tuổi chờ** (*waiting 5h*), không phải đếm ngược — tuổi chờ là thứ duy nhất còn kêu khi hàng đợi bị bỏ quên.',
          '***Đạt* → *Từ chối*** dành cho thứ máy quét không thấy: CV parse hoàn hảo nhưng là spam, giả, hoặc bị công ty báo. Requirement có thêm ***Từ chối* → *Đạt*** để gỡ một quyết định sai — **build cấm**: server trả 409 *This CV has already been reviewed* — CV review: *“Quyết định không gỡ được”*.',
          '**Mọi thao tác của HQ cần một ghi chú nội bộ** — để quyết định soát lại được sau nhiều tháng. Ứng viên không bao giờ thấy nó.',
          '**Trạng thái tìm kiếm chỉ có nghĩa với CV đang bật.** Các CV khác trên kệ vẫn có trạng thái CV (vẫn cần nó để nộp đơn), nhưng không phải ứng viên cho kho.',
        ],
      },
      { kind: 'h', text: '§4 · Máy quét — quy tắc Đạt' },
      {
        kind: 'table',
        heading: 'Ba kết quả, không có “từ chối”',
        note: 'Quy tắc **đúng như trong code** (`CvQualificationRule.evaluateResume`, từ 24/09/2026, không đổi tới ee1db5ea9): **≥ 1 học vấn luôn bắt buộc**; **≥ 1 kinh nghiệm** cũng bắt buộc, **trừ khi CV khai *No experience*** (Fresher). Khai báo này nằm **trên từng CV**, không trên người dùng — xem trang **Create CV**. Kỹ năng và dự án vẫn được đếm và nhập vào, nhưng **không bao giờ** quyết định. Máy đọc **các trường**, không quan tâm chúng từ đâu ra. Không có file đọc được chữ → **Không đọc được**.',
        cols: ['Kết quả', 'Khi nào', 'Nghĩa là gì'],
        rows: [
          ['**Đạt**', '`học vấn ≥ 1` **và** (`kinh nghiệm ≥ 1` **hoặc** CV khai *No experience*)', '**Chung cuộc.** CV gửi được tới nhà tuyển dụng. Không ai phải xem.'],
          ['**Chưa đủ thông tin**', 'File đọc được nhưng **không** thoả công thức trên', '**Tạm thời** — là một câu hỏi, chưa phải phán quyết. Chờ ứng viên bổ sung, hoặc chờ người duyệt quyết.'],
          ['**Không đọc được**', 'Parse **không ra mục nào** (ảnh scan, file hỏng…) — kiểm **trước** mọi điều kiện khác, và chỉ quyết được **lúc parse**', '**Tạm thời** — hệ quả y hệt *Chưa đủ thông tin*. Chấm lại không xoá được nhãn này; chỉ một lần parse mới.'],
        ],
      },
      {
        kind: 'list',
        heading: 'Những gì cố ý KHÔNG nằm trong quy tắc',
        items: [
          '**Kỹ năng không còn nằm trong quy tắc.** Quy tắc cũ đòi thêm **≥ 3 kỹ năng**; commit `fix(recruitment): the CV scan no longer requires three skills` (11/09/2026) đã bỏ hẳn. Kỹ năng giờ chỉ **xếp hạng** CV trong tìm kiếm.',
          '**Tổng số năm kinh nghiệm không nằm trong quy tắc.** PR #783 (08/10) thêm *total experience* theo từng CV vào cột riêng (`total_exp_*`), **tách khỏi** `years_of_exp` — cột khai Fresher mà quy tắc đọc. Commit ghi rõ lý do: “0 năm 6 tháng” ghi vào cột cũ sẽ bị đọc thành Fresher.',
          '**Quy tắc này thay hai bản trước.** Trước 23/09: *kinh nghiệm HOẶC (học vấn VÀ dự án)*; 23/09: *kinh nghiệm HOẶC học vấn*; từ **24/09/2026**: *học vấn, cộng kinh nghiệm trừ khi Fresher*. Hệ quả: một bác tài hai mươi năm nghề **không điền học vấn** rơi vào *Chưa đủ thông tin*. Trang Notion *CV review* vẫn ghi bản 23/09.',
          'Quy tắc **thừa hưởng vùng ngôn ngữ của bộ trích xuất**. CV bằng ngôn ngữ bộ trích không xử lý được thì không ra trường nào → *Không đọc được* → chờ một người duyệt đọc được ngôn ngữ đó.',
        ],
      },
      {
        kind: 'warn',
        text:
          '**Requirement chưa theo kịp quy tắc này.** Bảng *In one table* và mục *The automatic evaluation* của requirement vẫn ghi `≥ 1 kinh nghiệm HOẶC ≥ 1 học vấn` (bỏ dự án 25/09) và “không có công tắc Fresher / Experienced ở đâu trong ba repo” (kiểm 25/09). Build đã đổi từ **24/09**: học vấn luôn bắt buộc, kinh nghiệm bắt buộc trừ khi CV khai *No experience*. Trang này ghi theo build.',
      },
      {
        kind: 'p',
        text:
          '**Cờ quét đang TẮT ở mọi môi trường** (`SVN_CV_QUALIFICATION_ENABLED=false`): file mới sinh ra ở *Đạt*, máy không ghi gì (theo build 08/10). Cờ chỉ chặn đường **ghi**; đường **đọc** thì không, nên cổng nộp đơn bằng Saramin CV vẫn trả 409 `CV_NOT_QUALIFIED` dù cờ tắt. Tắt / bật vì thế **không phải một công tắc sạch**.',
      },
      { kind: 'h', text: '§5 · Saramin CV và CV tải lên — trong một bảng' },
      {
        kind: 'table',
        note: 'Hai loại CV, **một** quy tắc, **một** field nó ghi. Mọi thứ phía sau — đơn có được gửi không — **đọc** từ field đó và không được quyết ở đâu khác. Cột phải ghi cả requirement khi build làm khác.',
        cols: ['', 'Saramin CV (soạn trong form)', 'CV tải lên (PDF / Word)'],
        rows: [
          ['**Máy kiểm gì**', 'Học vấn, cộng kinh nghiệm trừ khi CV khai *No experience* — tính **trực tiếp** từ các trường, không qua máy quét', '**Cùng quy tắc**, trên các trường **parse** từ chính file đó'],
          ['**Thoả quy tắc**', '*Đạt*', '*Đạt*'],
          ['**Không thoả**', 'Chip *Unfinished* phía ứng viên; **không bao giờ vào hàng đợi**', 'Cờ bật: *Chưa đủ thông tin* — hoặc *Không đọc được* khi file không có chữ — → *Needs review*. Cờ tắt: vẫn *Đạt* ở tầng duyệt, chỉ có chip *Unfinished*'],
          ['**CV Đạt thì…**', 'Nộp đơn → *Sent* · bật hiển thị được', 'Nộp đơn → *Sent* · bật hiển thị được'],
          ['**CV chưa đạt thì…**', '**Không** nộp đơn được (picker mờ; server trả `CV_NOT_QUALIFIED`) · ô hiển thị ẩn', 'Web: **không** nộp được — picker mờ mọi CV *Unfinished* · ô hiển thị ẩn. Server / API: **nhận và giữ ở *Not sent***. Requirement: **nộp được**, đơn giữ lại; bật được nhưng *Hidden*'],
          ['**CV bị từ chối thì…**', 'Không nộp, không bật được', 'Như bên trái — trạng thái **duy nhất** hành xử giống nhau trên hai đường. Đơn đã giao bằng version đó → *Recall*; đơn đang giữ → không bao giờ đi'],
          ['**Lý do từ chối dùng được**', 'Chỉ *CV but not enough information* và *Other*', 'Cả bốn'],
          ['**Ai đưa nó về *Đạt***', '**Ứng viên**, trong form — không HQ, không hàng đợi', '**HQ** duyệt ở CV review, hoặc một **version mới** qua được máy quét (web chưa có màn thay file)'],
        ],
      },
      {
        kind: 'list',
        items: [
          '**Sự lệch giữa hai đường là có chủ đích trong requirement**: Saramin CV nghi ngờ không nộp được (ứng viên sửa trong vài giây), file tải lên nghi ngờ thì nộp được — vì lỗi có thể nằm ở **bộ đọc của Saramin**, không ở tài liệu của họ. **Web đã xoá sự lệch này**: picker làm mờ mọi CV *Unfinished*, cả file tải lên. Cần chốt — xem cuối trang.',
          '**Không có trạng thái “Pass / Fail” nào được lưu** — đó là kết quả của một lần quét. Thứ được lưu là một trong bốn trạng thái CV: *Pass* chính là *Đạt*, *Fail* là một trong hai trạng thái nghi ngờ. Màn hay bảng nào còn ghi Pass/Fail là đang tả lần quét, không phải bản ghi.',
          '**Phía ứng viên là ràng buộc, không phải mục tiêu.** Việc chấm CV tồn tại để bảo vệ hai mặt công ty chạm vào — đơn họ nhận và kho họ trả tiền tìm. Ràng buộc tự đặt: không ứng viên nào bị chặn vì lỗi **của Saramin**, và mọi lần từ chối đều nêu lý do kèm cách sửa.',
        ],
      },
      {
        kind: 'warn',
        text:
          '**Người duyệt duyệt CV, không bao giờ duyệt đơn ứng tuyển.** Đó là lý do trang *Applications* không có nút *Chuyển tiếp* hay *Gửi*: việc giao là **hệ quả** của phán quyết về CV. Một CV đứng sau mười đơn thì cả mười đơn đọc chung một trạng thái; duyệt một lần, cả mười *Đã gửi* trong cùng một giao dịch, và công ty được báo **đúng lúc đó**.',
      },
      { kind: 'h', text: '§6 · Một dòng là gì — và version' },
      {
        kind: 'p',
        text:
          '**Ba danh sách, ba đơn vị khác nhau** — và phân số `v.N/M` cho biết bạn đang nhìn đơn vị nào: version **của dòng này** trên version **hiện tại** của CV. Nhầm đơn vị sinh ra một trong hai lỗi: **việc ảo** (người duyệt quyết một version không ai còn thấy) hoặc **đơn mất** (một đơn đợi một version ứng viên đã thay).',
      },
      {
        kind: 'table',
        heading: 'Mỗi màn hình, một dòng là gì',
        cols: ['Màn hình', 'Một dòng là', 'Version nào', 'Có đọc `v.1/2` được không?'],
        rows: [
          ['**CV review**', 'Một **CV** cần / đã cần người nhìn. Build: một dòng một CV (`FROM candidate_cv`); thay file thì **sửa chính dòng đó**, không sinh dòng thứ hai', '*Needs review*: chỉ version **hiện tại** được chờ. *Approved* / *Rejected*: version lúc quyết', '*Needs review*: không bao giờ — luôn N/N. Hai tab đã quyết: có — `v.1/2` nghĩa là ứng viên đã đi tiếp sau quyết định đó'],
          ['**Talent pool** (Admin)', 'Một **ứng viên** có CV đang bật, kèm đúng CV đó', 'Luôn version **hiện tại** — kho không phục vụ version nào khác', 'Không — luôn N/N'],
          ['**Applications** (Admin) · tab **Jobs** (công ty)', 'Một **đơn ứng tuyển**', 'Đã giao: version **đã giao**, đóng băng. Đang giữ: requirement — chưa có version, đi theo CV; build — xem cảnh báo dưới', 'Đơn đã giao: có. Đơn đang giữ: không'],
        ],
      },
      {
        kind: 'table',
        heading: 'Version — luật',
        note: 'CV là món trên kệ của ứng viên: danh tính, tên, lịch sử. **Version** là nội dung của nó tại một thời điểm. Thay file tạo một version mới của **cùng một CV**; CV giữ nguyên tên và lịch sử ứng tuyển. **Web ứng viên chưa có màn thay file**, nên hôm nay gần như mọi dòng là `v.1/1`.',
        cols: ['Quy tắc', 'Nghĩa'],
        rows: [
          ['Version mới **luôn về chờ**', '`replacedWith` ghi `PENDING` và xoá dấu đã duyệt — **kể cả khi cờ quét tắt**. Khi cờ bật, máy quét chấm lại; khi cờ tắt, nó nằm ở *Needs review* cho tới khi có người quyết.'],
          ['Version mới **không rửa được** một lần từ chối', 'Nó đưa CV về chờ, không bao giờ thẳng về *Đạt*; lần từ chối cũ vẫn trong lịch sử (`cv_review`).'],
          ['Đơn ứng tuyển **chụp lại** version đã gửi', 'Đọc là **đã gửi / hiện tại**: `v.1/2` = NTD giữ v.1, CV đã sang v.2.'],
          ['Từ chối chỉ thu hồi **đơn mang version bị từ chối**', 'v.1 đã gửi, v.2 bị từ chối → NTD **vẫn giữ v.1**.'],
          ['Saramin CV', 'Không có version: sửa form là render lại **cùng** CV, vẫn `APPROVED`.'],
        ],
      },
      {
        kind: 'list',
        heading: 'Đơn đang giữ và version — luật của requirement',
        items: [
          '**Đơn đang giữ chưa có version.** Giao hàng mới là lúc chụp, nên đơn *Not sent* trôi theo CV và đi với version **hiện tại** lúc CV *Đạt* — dù HQ duyệt, hay ứng viên thay bằng một version qua được máy quét. Kết quả y như ứng viên nộp bằng version mới, đúng điều họ muốn.',
          '**Version cũ đang nghi ngờ bị thay thế, không bị duyệt.** Khi CV sang v.2, dòng v.1 ở *Needs review* không còn gì phụ thuộc vào nó: tự rời hàng đợi, không cần ai quyết, hồ sơ ghi *superseded* (`v.1/2`). *Needs review* có tối đa **một dòng mỗi CV**.',
          '**Version cũ bị từ chối thì ở lại hồ sơ** — quyết định của người không bao giờ tự đóng. v.2 vào *Needs review* là `v.2/2` **kể cả khi máy quét cho qua**, vì version mới không rửa được lần từ chối.',
          '**Vì sao không gắn đơn đang giữ vào version lúc nộp:** sẽ bắt HQ duyệt một version đã bị thay chỉ vì một đơn, và duyệt nó thì giao cho công ty một file ứng viên đã bỏ. Gắn lúc giao thì không tốn gì và ra đúng kết quả mọi bên muốn.',
        ],
      },
      {
        kind: 'example',
        heading: 'Ví dụ — tình huống khách hỏi: v.1 đang nghi ngờ, một đơn đang giữ, ứng viên cập nhật',
        scenario: 'Ứng viên nộp một đơn bằng CV v.1 đang *Chưa đủ thông tin*. Rồi họ thay file thành v.2, và máy quét cho v.2 qua.',
        cols: ['', 'Requirement', 'Build hôm nay (08/10)'],
        rows: [
          ['Đơn đang giữ', '**Giao với v.2** ngay lúc v.2 *Đạt*', '**Kẹt ở *Not sent*** — lỗi (1) và (2) dưới'],
          ['Dòng v.1 ở *Needs review*', '**Bị thay thế**, rời hàng đợi; hồ sơ ghi `v.1/2`', 'Dòng được **sửa tại chỗ** sang v.2'],
          ['v.2 trên CV review', '**Không xuất hiện** — máy quét đã cho qua', 'Version mới **luôn về chờ** → nằm ở *Needs review*'],
          ['Talent pool', 'Một dòng, `v.2/2`', 'Một dòng'],
        ],
        note: 'Hai trường hợp kề bên thì có hai dòng thật: v.2 cũng bị nghi ngờ → *Needs review* hiện `v.2/2`, đơn tiếp tục chờ; v.1 đã bị từ chối từ trước → đơn đã *Not sent* chung cuộc, v.2 vào *Needs review* là `v.2/2` và tab *Rejected* giữ `v.1/2`.',
      },
      {
        kind: 'warn',
        text:
          '**Build: một đơn đang giữ mà CV bị thay file thì KẸT — ba lỗi, một gốc.** Requirement ghi từ 26/09; kiểm lại svn-be `origin/dev` ngày 08/10: **chưa sửa**. Gốc: đơn lưu `applied_cv_media_key` đóng băng lúc nộp, không có `cvVersionId`, và không gì nối khoá đó qua các version. **(1)** Thả đơn tìm theo khoá của version **hiện tại** (`CandidateCvModerationService`) — đơn đóng băng trên khoá cũ không được tìm thấy: nộp lúc nghi ngờ → thay file → HQ duyệt → đơn nằm *Not sent* **mãi mãi**. **(2)** Đường tự động không giao gì — `CvQualificationService` chuyển CV sang *Đạt* nhưng không nắm kho đơn, nên ứng viên tự sửa cho qua máy quét thì đơn đang giữ **không** đi; chỉ HQ *Approve* mới thả. **(3)** Cột *Used to apply* và khối hậu quả chỉ đếm version hiện tại — CV có 3 đơn trên v.1 và 1 đơn trên v.2 đọc là **1**. Cả ba hôm nay còn **ngủ** vì web chưa có màn thay file; chúng thức dậy cùng màn đó. **Đừng sửa (1) bằng cách giao file cũ** — đơn phải đi với version hiện tại và đã *Đạt*; thứ hỏng là phép **tìm** đơn, không phải tài liệu nó mang.',
      },
      {
        kind: 'example',
        heading: 'Ví dụ — một CV tải lên, hai đơn, một lần từ chối (khi web có màn thay file và cờ quét bật)',
        scenario:
          'Thu hồi **chỉ xảy ra khi version đã gửi bị từ chối**. Ở kịch bản dưới, v.2 chưa từng được gửi cho FPT, nên FPT không bị đụng tới.',
        cols: ['#', 'Việc xảy ra', 'CV', 'Đơn tới FPT', 'Đơn tới Tiki'],
        rows: [
          ['1', 'Tải CV lên — 3 kinh nghiệm, 1 học vấn', 'v.1 · *Đạt*', '—', '—'],
          ['2', 'Nộp FPT; FPT chuyển sang Interview 1', 'v.1 · *Đạt*', 'Đã gửi · v.1', '—'],
          ['3', 'Thay file bằng bản 1 trang — không kinh nghiệm, không học vấn', 'v.2 · *Chưa đủ thông tin* → *Needs review*', 'Đã gửi · v.1 (**không đổi** — là bản chụp)', '—'],
          ['4', 'Nộp Tiki bằng CV đó qua API (web làm mờ CV *Unfinished*)', 'v.2 · *Chưa đủ thông tin*', 'Đã gửi · v.1', '**Không gửi** — đang giữ'],
          ['5', 'Người duyệt từ chối — *CV but not enough information*', 'v.2 · *Từ chối* (chung cuộc)', 'Đã gửi · v.1 · **giữ nguyên**', '**Không được gửi**'],
        ],
        note:
          'Nếu v.2 qua máy quét, được gửi cho Tiki, rồi người duyệt từ chối v.2 → đơn Tiki bị **Thu hồi**, đơn FPT (v.1) vẫn giữ nguyên.',
      },
      { kind: 'h', text: '§7 · Hai cửa vào console của nhà tuyển dụng' },
      {
        kind: 'table',
        cols: ['', 'Tab Jobs', 'Tab Talent pool'],
        rows: [
          ['Ai ở đây', 'Người **tự nộp đơn** vào một tin', 'Người nhà tuyển dụng **tìm ra và lưu** từ tìm kiếm CV'],
          ['Tốn credit?', '**Không bao giờ**', '**Giá của CV** (1 credit) khi thẻ rời cột *Saved* lần đầu'],
          ['Liên hệ', 'Mở sẵn', 'Che tới khi mở khoá'],
          ['Pipeline', 'Theo **tin** tuyển dụng', 'Theo **folder**'],
          ['Saramin can thiệp?', 'Có — đơn chỉ tới khi CV được gửi; từ chối CV **thu hồi** đơn', 'Có — từ chối CV **hoàn** credit đã mở khoá'],
        ],
      },
      {
        kind: 'p',
        text:
          'Một người có thể ở **cả hai** — thành **hai dòng riêng**. Một lần vào folder không bao giờ là một đơn ứng tuyển, và một người nộp đơn không nằm trong folder nào. Nhưng một đơn **đã tới** công ty là đủ để công ty đó mở khoá người này kể cả khi họ đã tắt hiển thị CV.',
      },
      {
        kind: 'example',
        heading: 'Ví dụ — một ứng viên, từ lúc tải CV tới lúc được gọi',
        scenario:
          'Chị Lan (kế toán, 6 năm) đăng ký ngày **01/10**, cờ quét đang **tắt** như hiện nay. Công ty X có gói CV Search 50 lượt.',
        cols: ['Ngày', 'Việc xảy ra', 'Trạng thái CV', 'Kho / công ty X thấy gì'],
        rows: [
          ['01/10', 'Soạn **Saramin CV**, chọn *Experienced*, điền 3 kinh nghiệm, **quên học vấn**', 'v.1 · *Unfinished* (50%)', 'Chưa có mặt — ô *Show CV* bị ẩn trên CV chưa đạt'],
          ['01/10', 'Thử nộp tin của công ty Y', '—', 'Không được — CV *Unfinished* mờ trong picker'],
          ['02/10', 'Thêm một học vấn, lưu, bật *Show CV to employers*', '*Đạt* (100%)', '**Có mặt** ở `/search` của X, tên che'],
          ['03/10', 'X mở trang CV (bản che liên hệ), **Save** vào folder “Kế toán tổng hợp”', '—', 'Thẻ ở *Saved*, số dư X **không đổi**'],
          ['04/10', 'X kéo thẻ sang *Interview 1*', '—', 'Số dư **−1**; tên, điện thoại, email lộ ra ở mọi nơi trong X'],
          ['05/10', 'Lan nộp đơn vào tin của X bằng chính CV đó', '—', 'Thẻ mới ở tab **Jobs** của X, cột *Application Received*, **không tốn credit**; X mở CV → Lan thấy *Application Viewed*'],
        ],
        note:
          'Hai dòng của cùng một người ở hai tab là đúng thiết kế. Nếu ngày 06/10 HQ từ chối CV đang bật của Lan, X được **hoàn 1 credit**, nhưng Lan vẫn có mặt trong kho cho tới khi chính chị tắt CV — xem cảnh báo dưới.',
      },
      {
        kind: 'warn',
        text:
          '**Notion lệch build — nhóm này ghi theo build.** (1) Notion *CV review* ghi *“ít nhất một kinh nghiệm hoặc một học vấn”*; build từ **24/09/2026**: luôn cần học vấn, cần thêm kinh nghiệm trừ khi Fresher (`CvQualificationRule.evaluateResume`, không đổi tới ee1db5ea9). (2) Notion *Create CV* ghi CV chưa đạt thì **không nộp đơn được** — đúng trên web cho **cả hai loại** CV (picker làm mờ mọi CV *Unfinished*); server thì vẫn nhận file tải lên và giữ đơn. (3) Notion ghi trang tìm kiếm CV ở `/talent-pool`; site công ty phục vụ nó ở **`/search`**.',
      },
      {
        kind: 'warn',
        text:
          '**Sửa so với bản trước của trang này:** quyết định của HQ **không gỡ được** (trước ghi “Duyệt — gỡ từ chối”); ứng viên bị từ chối thấy nhãn **Can’t read** chứ không phải *Chưa được duyệt*, và không có nút sửa; định dạng là PDF hoặc **Word**; số CV không giới hạn; tìm kiếm CV **không** còn đòi CV *Đạt*.',
      },
      {
        kind: 'open',
        text:
          '**Cần chốt với khách.** (1) **Bật máy quét trên production khi nào, ai trực hàng đợi, SLA bao lâu** (DEBT D-RES-19). (2) **Tự bật hiển thị** cho file tải lên đầu tiên — có được coi là đồng ý của ứng viên không. (3) Thẻ kết quả `/search` lộ tên công ty / trường. (4) Màn **thay file** (version mới) phía ứng viên chưa có, nên toàn bộ luật version hôm nay chưa ai chạm tới. (5) *Total experience* theo từng CV: đã có trên web (tài liệu *Create CV* 15/10) — nhưng tên CV tự đặt có thể vẫn lấy số năm mặc định thay vì của chính CV (xem *Create CV* §2). (6) **Nộp đơn bằng file tải lên chưa đạt** — requirement cho nộp rồi giữ đơn, web chặn ở picker: chọn một (§5). (7) **Application status** — tài liệu 14/10 chốt **3 giá trị** (*Not Sent · Sent · Recall*); build 08/10 còn *Rejected* theo từng đơn, cần bỏ (§3). (8) **Gỡ một quyết định** — requirement cho, server cấm (§3). (9) **Ba lỗi version** phải sửa **trước** khi mở màn thay file (§6).',
      },
    ],
  },
}
