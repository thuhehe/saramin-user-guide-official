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
      'Một thư viện, hai loại CV: **Saramin CV** (soạn trong form của Saramin) và **Upload CV** (file **PDF hoặc DOCX**, tối đa **10 MB**). Cả hai nằm chung một danh sách ở **My CVs** (tiêu đề trang đọc *Resume Management*).',
      '**Không giới hạn số CV** — trần 10 CV đã bỏ từ V315. Mỗi CV là một món riêng: tên riêng, trạng thái riêng, số đơn đã nộp riêng.',
      'Mỗi CV khai **Experienced** hoặc **No experience** (Fresher). Khai báo **đi theo CV, không theo người dùng** — một người có thể có một CV Fresher và một CV Experienced — và nó quyết định CV cần gì để *Đạt*.',
      '**Đạt** nghĩa là: **luôn có ≥ 1 học vấn**, và **≥ 1 kinh nghiệm** trừ khi CV khai *No experience*. Kỹ năng, dự án, tổng số năm kinh nghiệm **không** tham gia.',
      'Chỉ một CV được **hiện cho nhà tuyển dụng** (*Show CV to employers*) tại một thời điểm — đó cũng chính là “CV mặc định” trong code (`searchable`). Các CV khác vẫn dùng để nộp đơn bình thường.',
    ],
    how: [
      'Vào **My CVs** (`/my-profile/cv-resume`). Khung *Want to create your CV?* có hai nút: **Create Saramin CV** (`/my-profile/cv/create`) hoặc **Upload file** (`/my-profile/cv/upload`).',
      '**Saramin CV:** chọn **Experienced** / **No experience** ở ô *Work experience* cạnh tên. Có sẵn một CV đã được đọc, hoặc một file PDF? Bấm **Import CV** để máy điền sẵn form — import **ghi đè** những gì đang có trong form, và chưa lưu gì cho tới khi bấm Save.',
      'Điền theo thanh **CV completeness** bên phải. Các mục tuỳ chọn (*Certificates · Awards · Activities · References*) chỉ hiện trong CV khi bấm **+** ở thanh đó.',
      '**Upload CV:** tải file vào ô *Resume file* — **CV được tạo ngay khi file tải xong**; bấm Save chỉ để đặt tên, chọn Experienced / No experience và trả lời câu hỏi hiển thị.',
      'Lúc Save (cả hai loại), form **bắt buộc trả lời** có hiện CV này cho nhà tuyển dụng không: *Show this CV to recruiters* / *Show no CV* — hoặc, khi đã có CV khác đang hiện, *Keep that CV* / *Switch to this CV*.',
    ],
    watch: [
      '**CV completeness 100% chính là *Đạt*** — không phải một điểm “đẹp”. Thanh chỉ tính **hai** mục có trọng số; tám mục còn lại là checklist để nhảy tới, **không** đổi con số.',
      '**Chỉ một CV được hiện cho nhà tuyển dụng tại một thời điểm.** Bật *Show CV to employers* trên CV này là **tắt** nó trên CV đang giữ trước đó.',
      '**CV có nhãn *Unfinished* thì không chọn được ở bước nộp đơn** — kể cả file tải lên (picker của svn-web làm mờ mọi CV *Unfinished*). Ứng viên phải bổ sung rồi lưu, hoặc dùng CV khác.',
      '**File Word đời cũ (.doc) bị server từ chối** dù giao diện ghi *PDF or Word*. Chỉ **.pdf** và **.docx** qua được. Nhãn chọn file ở hộp *File attachment* lại chỉ ghi *PDF* — ba câu chữ, ba con số khác nhau.',
      '**Tổng kinh nghiệm (chip *Total experience*) không phải khai báo Fresher.** Sửa con số đó không đổi kết quả *Đạt*; chỉ ô *Experienced / No experience* mới đổi.',
    ],
    blocks: [
      { kind: 'h', text: '§1 · Hai cách tạo CV' },
      {
        kind: 'table',
        cols: ['', 'Saramin CV', 'Upload CV'],
        rows: [
          ['**Đường dẫn**', '`/my-profile/cv/create` · sửa: `/my-profile/cv/:id`', '`/my-profile/cv/upload` · sửa: `?id=`'],
          ['**Nội dung là**', 'Các trường ứng viên tự gõ — hệ thống render ra PDF', 'File gốc của ứng viên — hệ thống **đọc (parse)** file để lấy các mục'],
          ['**File nhận**', '—', '**PDF, DOCX**, ≤ **10 MB**. Lỗi: *The file must be a PDF or Word document, no larger than 10 MB.*'],
          ['**Điền sẵn**', '**Import CV** (*Auto-fill your profile with your uploaded CV in minutes.*): chọn một CV đã được đọc, hoặc tải một **PDF** chỉ để điền — file đó **không** vào thư viện. Hỏi trước: *Import this resume over your current one?*', 'Không cần — file tự được đọc ngay khi vào thư viện'],
          ['**Ai chấm Đạt**', 'Tính **ngay** từ các trường đã nhập (không qua máy quét)', 'Tính từ **kết quả parse** của file; với cờ quét đang tắt thì file **mặc định Đạt** — xem §4'],
          ['**Sửa thì sao**', 'Lưu lại là xong — vẫn là CV đó', 'Đổi tên / Experienced / hiển thị. **Không có màn thay file** trên web (API có, xem §7)'],
        ],
      },
      {
        kind: 'p',
        text:
          'Có thêm lối `/my-profile/cv/new` (*Upload a CV* / *Create a Saramin CV*) — gọi từ menu đầu trang và trang công ty, không từ My CVs. Nhánh upload ở đó có thêm bước gợi ý *Convert to Saramin template*.',
      },
      { kind: 'h', text: '§2 · Form Saramin CV — các mục' },
      {
        kind: 'table',
        cols: ['Mục', 'Bắt buộc?', 'Ghi chú'],
        rows: [
          ['**About**', 'Không', '—'],
          ['**Work experience**', '**Có — trừ khi** CV khai *No experience*', 'Khai *No experience* thì mục Education tự lên trên Work experience.'],
          ['**Education**', '**Luôn có**', 'Hộp *Highest education* chọn mục nào là bậc cao nhất; mục chưa có bậc thì mờ: *This entry has no education level yet — add one to pick it.*'],
          ['**Highlight projects**', 'Không', 'Đếm nhưng không quyết định.'],
          ['**Skills**', 'Không', 'Tối đa **20**. Không còn chặn Đạt từ 11/09/2026.'],
          ['**Foreign languages**', 'Không', '—'],
          ['*Certificates · Awards · Activities · References*', 'Không', 'Tuỳ chọn, thêm bằng **+**, gỡ được.'],
        ],
      },
      {
        kind: 'list',
        heading: 'Lưu bị chặn khi',
        items: [
          'Thiếu mục bắt buộc: *Please fill in {sections} before you finish.*',
          'Còn mục đang mở sửa chưa lưu: *Please save everything you are still editing before you finish.*',
          'Chưa trả lời câu hỏi hiển thị: *Please choose whether to show your CV to recruiters.*',
          'Để trống tên CV thì hệ thống tự đặt: *{name}’s CV – {experience} of experience* (hoặc *– No experience yet*).',
        ],
      },
      { kind: 'h', text: '§3 · Experienced / No experience và Total experience — hai thứ khác nhau' },
      {
        kind: 'table',
        cols: ['', '*Experienced / No experience*', 'Chip *Total experience*'],
        rows: [
          ['**Là gì**', 'Lời khai “tôi đã đi làm chưa”', 'Một con số năm + tháng hiện cạnh tiêu đề Work experience'],
          ['**Ảnh hưởng Đạt?**', '**Có** — quyết định có cần kinh nghiệm không', '**Không**'],
          ['**Lưu ở đâu**', 'Saramin CV: `yearsOfExp = 0` trên résumé của CV. Upload CV: cờ `fresher` trên chính dòng CV', 'Web hiện tại (d8a43a11): con số **cấp tài khoản**. Backend từ **08/10/2026** (PR #783, V692) đã có chỗ lưu **theo từng CV** — web chưa nối'],
          ['**Mặc định**', 'CV mới lấy theo câu trả lời onboarding; *No experience yet* hoặc chưa trả lời → *No experience*', 'Ẩn khi CV chưa có dòng kinh nghiệm nào'],
          ['**Các chế độ**', '—', '*Enter manually* (gõ năm/tháng; tháng 0–11, sai thì *Months must be between 0 and 11.*) · tự tính **gộp khoảng trùng** (*Exclude overlapping periods*) · tự tính **cộng dồn**'],
        ],
      },
      {
        kind: 'p',
        text:
          'Đổi *Experienced ↔ No experience* trên một CV là hệ thống **chấm lại cả thư viện** của ứng viên ngay lúc lưu — một CV đang *Unfinished* có thể thành *Đạt* chỉ bằng cách khai *No experience*, nếu đã có học vấn.',
      },
      { kind: 'h', text: '§4 · Tiêu chí để một CV Đạt' },
      {
        kind: 'table',
        note: 'Đúng như trong code: `CvQualificationRule.evaluateResume` (svn-be, không đổi từ 24/09/2026 — PR #783 ngày 08/10 **không** chạm quy tắc) và `cv-completeness.ts` (svn-web). Saramin CV được chấm **ngay** từ các field đã nhập; Upload CV được chấm từ **lần parse mới nhất** của chính file đó — không bao giờ mượn dữ liệu hồ sơ.',
        cols: ['CV khai', 'Bắt buộc', 'CV completeness'],
        rows: [
          ['**No experience** (Fresher)', '≥ 1 **Education**', 'Điền xong Education → **100%**. Lỡ thêm một dòng kinh nghiệm thì thanh chuyển sang công thức 50/50.'],
          ['**Experienced**', '≥ 1 **Work experience** và ≥ 1 **Education**', 'Mỗi mục **50%** — xong cả hai → 100%'],
        ],
      },
      {
        kind: 'table',
        heading: 'Ứng viên thấy gì trên danh sách CV',
        note: 'Chip phía ứng viên chỉ có **ba** giá trị (`QUALIFIED` · `NOT_ENOUGH_INFORMATION` · `REJECTED`) — HQ thấy bốn. Chip được tính **trực tiếp** mỗi lần mở danh sách, không phụ thuộc cờ quét.',
        cols: ['Trạng thái', 'Khi nào', 'Nhãn trước tên CV', 'Nút trên dòng'],
        rows: [
          ['**Đạt**', 'Đủ field bắt buộc', 'Không có nhãn', '*Edit*'],
          ['**Chưa đủ** (`NOT_ENOUGH_INFORMATION`)', 'Thiếu field bắt buộc — Saramin CV, hoặc file tải lên đã parse mà thiếu (kể cả file scan không ra chữ)', '**Unfinished** (*Chưa hoàn thiện*) + thanh *Completion N%*', '*Complete CV*'],
          ['**Bị HQ từ chối** (`REJECTED`)', 'Chỉ khi một người ở HQ từ chối', '**Can’t read** (*Không đọc được*) — **cho mọi lý do từ chối**; lời nhắn của người duyệt chỉ hiện khi **rê chuột** lên nhãn', '*Complete CV*; trong trang sửa có khung *This CV wasn’t approved* + lời nhắn, **không có nút hành động**'],
          ['File **đang được đọc**', 'Parse chưa xong', 'Không có nhãn — chưa có gì để chấm', '*Edit*'],
        ],
      },
      {
        kind: 'p',
        text:
          '**§4.1 – 4.2 · Đạt và chưa đạt làm được gì** — nộp đơn, bật hiển thị, ai đưa CV về *Đạt*, Saramin CV cạnh file tải lên: một bảng ở **Logic chung §5**, vì nó áp cho cả bốn trang. Điểm cần nhớ ở đây: trên web, CV *Unfinished* — **cả file tải lên** — mờ trong picker nộp đơn và không bật hiển thị được.',
      },
      { kind: 'h', text: '§5 · Show CV to employers — CV mặc định' },
      {
        kind: 'table',
        cols: ['Tình huống', 'Điều gì xảy ra'],
        rows: [
          ['Bật trên một CV', 'Ô chọn trên dòng: *Show CV to employers* / *Hide CV from employers*. CV đó thành **CV mặc định**, **lên thẻ nổi bật** đầu trang (*Employers see this CV*), và CV đang giữ cờ trước đó **tự tắt**. Không hỏi xác nhận.'],
          ['Tắt', 'Hỏi trước: *If you’re job hunting right now, keep offers open too* — nút mặc định là *Keep my CV visible*, nút kia *Hide my CV*.'],
          ['Không CV nào đang hiện', 'Khung *CV hidden from employers* với ô *Choose a CV* và nút *Let employers find me*.'],
          ['Bật CV làm hồ sơ chính', 'Bật một CV cũng **nạp nội dung parse của CV đó vào hồ sơ** của ứng viên (chạy nền, lỗi thì CV vẫn là mặc định).'],
          ['File tải lên **đầu tiên**', 'Khi ứng viên **chưa có CV nào đang hiện**, file đầu tiên parse xong được hệ thống **tự đặt làm CV mặc định** (`autoDefaultIfCandidateHasNoDefaultYet`). Từ SRM-777 (29/09) như vậy là **đã vào kho tìm kiếm** của nhà tuyển dụng — xem cảnh báo dưới.'],
          ['Hệ quả phía nhà tuyển dụng', 'Ứng viên có một CV đang hiện = **có mặt** ở `/search` của site công ty, tên che tới khi họ mở khoá — xem **Talent pool** và **Candidate management**.'],
        ],
      },
      {
        kind: 'warn',
        text:
          '**Từ 29/09/2026 (SRM-777) kho tìm kiếm chỉ hỏi “có CV nào đang bật không” — không hỏi CV đó *Đạt* chưa.** Một CV đang chờ duyệt, hoặc đã bị HQ từ chối mà ứng viên chưa tắt, **vẫn đưa ứng viên vào `/search`**. Requirement nói ngược lại — so sánh hai bên ở **Logic chung §2**.',
      },
      { kind: 'h', text: '§6 · Danh sách My CVs — một dòng' },
      {
        kind: 'table',
        cols: ['Phần', 'Nghĩa'],
        rows: [
          ['**Nhãn trạng thái**', '*Unfinished* / *Can’t read* — chỉ trên CV chưa đạt (xem §4).'],
          ['**Tên CV** · chip nguồn', 'Tên (hoặc tên file), bấm để mở trang sửa. Chip *Saramin CV* / *Uploaded*.'],
          ['**Bốn ô thông tin**', '*Total years of experience* · *Education* · *Latest job title* · *Skills* — lấy từ **chính CV đó**, không từ hồ sơ chung.'],
          ['**Applications N ›**', 'Số đơn đã nộp **bằng CV này** — chỉ hiện trên CV đạt.'],
          ['**Modified {date}**', 'Hiện khi rê chuột.'],
          ['**Ghi chú**', 'Ô ghi nhớ — **chỉ lưu trong trình duyệt**, mất khi tải lại trang.'],
          ['**Menu ⋯**', 'Chỉ **Download** và **Delete** (Print, Duplicate, Rename đã gỡ ngày 30/09). CV cuối cùng không có Delete.'],
          ['**Bộ lọc**', '*Total {n}* · *All / Saramin CV / Uploaded*.'],
        ],
      },
      {
        kind: 'warn',
        text:
          '**Xoá một CV là rút các đơn đang chạy đã nộp bằng nó.** Hộp xác nhận nói rõ: đơn đang xử lý **bị rút**, công ty **được báo** và **không xem được CV nữa** (chính sách riêng tư VN 21/09). File của các đơn đã gửi bị xoá theo. Xoá CV đang hiện còn xoá luôn các mục hồ sơ đã được đọc từ nó. **Không hoàn tác.**',
      },
      { kind: 'h', text: '§7 · Giới hạn và version' },
      {
        kind: 'table',
        cols: ['Giới hạn', 'Giá trị', 'Nguồn'],
        rows: [
          ['Số CV mỗi ứng viên', '**Không giới hạn** (từ V315). Hai câu báo “tối đa 10 CV” còn sót trong từ điển nhưng không bao giờ hiện', '`CandidateCvLibraryService.addToLibrary`'],
          ['Định dạng file', '**PDF · DOCX**. Import / điền sẵn chỉ nhận **PDF**', '`MediaKind.CV_FILE`'],
          ['Dung lượng', '**10 MB**', 'như trên'],
          ['Số lần parse một CV', 'Không giới hạn (bỏ cùng V315)', '`ParseCvVersionService`'],
          ['Số CV đang hiện', '**1**', 'unique index V145'],
          ['Version (v.1, v.2…)', 'Mỗi CV bắt đầu ở **v.1**. Thay file tạo **version** mới của cùng CV — nhưng **web chưa có màn thay file** (`POST /me/cvs/{id}/versions/{ticketId}` có, không có nút gọi). Thực tế mọi CV tải lên hiện là **v.1**; Saramin CV không bao giờ có version', 'svn-web d8a43a11'],
        ],
      },
      {
        kind: 'open',
        text:
          '**Ba điểm cần chốt.** (1) **Tự bật hiển thị** cho file tải lên đầu tiên (§5) giờ đồng nghĩa với vào kho tìm kiếm — có đúng ý sản phẩm không, khi requirement coi hiển thị là đồng ý chủ động của ứng viên? Chưa xác minh trường hợp ứng viên chọn *Show no CV* lúc lưu rồi parse xong sau đó. (2) Ứng viên bị từ chối thấy chữ **Can’t read** cho cả lý do *Not a CV* / *Not enough information* và không có nút sửa — cần thiết kế lại câu và nút. (3) Chip *Total experience* theo từng CV: backend xong 08/10, web chưa dùng.',
      },
    ],
  },

  /* ────────────────────────────────────────────────────────────────────────── */
  'cv-review': {
    logic: [
      'Hàng đợi CV cần **người** xem. CV nào máy quét tự thấy đạt thì **không bao giờ** vào đây — nó đi thẳng vào kho ứng viên. Đó là thứ giữ cho hàng đợi này hữu hạn.',
      'Máy quét chạy lại **mỗi lần CV được lưu**, nên phần lớn CV tự thoát khỏi nghi ngờ: ứng viên bổ sung phần còn thiếu, lưu, CV đạt ngay tại chỗ.',
      'Máy quét **không bao giờ ghi “Từ chối”**. Từ chối chỉ tồn tại như một quyết định của con người.',
      '**Quyết định của người duyệt là chung cuộc.** Một CV đã có người quyết thì server trả **409** *This CV has already been reviewed* cho mọi lần duyệt/từ chối tiếp theo — kể cả “gỡ từ chối”. Đường quay lại duy nhất là **một version mới** của CV.',
      'Ba tab: *Needs review* (chờ lâu nhất lên trước) · *Approved* · *Rejected* (hai tab sau mới nhất lên trước). Giữ **toàn bộ lịch sử**, không cắt 30 ngày.',
      'Quyền: xem cần `cv_review:read`, quyết cần `cv_review:decide`. Seed V336 cấp **cả hai** cho `hq_admin`, `vn_ops`, `vn_sales`.',
    ],
    how: [
      'Bật **Overview** để xem bốn thẻ: *Overdue · 24h* (số lẽ ra phải bằng 0) · *Decided · 7 days* · *Rejected · 7 days* · *Avg time to decide*.',
      'Ở tab *Needs review*, đọc từ trên xuống — dòng trên cùng là CV **chờ lâu nhất**. Lọc theo *CV status* (*Can’t read* / *Not enough information*), *Used to apply*, *In talent pool*; tìm theo tên ứng viên hoặc tên file.',
      'Đọc hai cột **Used to apply** và **In talent pool** trước khi quyết: chúng cho biết **tầm với** của quyết định.',
      'Bấm một dòng → hộp thoại duyệt: *Original file* bên trái; *What the scan said*, *The only question* và *This decision affects* bên phải. ⌘/Ctrl-click mở `/cv-review/:cvId` ở tab mới.',
      '**Duyệt**: *Approve → sent + showing* → nhập ghi chú nội bộ → xác nhận. **Nhập ghi chú dù ô ghi *optional*** — xem *watch*.',
      '**Từ chối**: chọn **lý do** trước (lý do viết lại câu gửi cho ứng viên), sửa **lời nhắn** (bắt buộc, ≤ 300 ký tự), chọn **nút** cho ứng viên, nhập **ghi chú nội bộ** (bắt buộc, ≤ 500), rồi *Reject CV*.',
    ],
    watch: [
      '**CV chưa được quyết thì MỌI đơn ứng tuyển gắn CV đó bị giữ ở “Chưa gửi”, vô thời hạn.** Không có cơ chế tự gửi sau 24h, không có gì tự giải phóng — **chỉ người duyệt**. Hàng đợi bỏ quên ở đây không phải backlog nội bộ, nó là sự cố mà ứng viên chịu.',
      'Vì vậy dòng hiển thị **tuổi chờ**, không phải đếm ngược — không có hạn nào để đếm ngược tới.',
      '**Chọn lý do trước rồi mới sửa lời nhắn.** Đổi lý do sẽ **viết đè** lời nhắn — một lời nhắn còn sót lại từ lý do chọn trước đó là lỗi duy nhất không thể nhìn ra khi đọc form.',
      '**Ô ghi chú khi Duyệt đọc *Internal note (optional)* nhưng server bắt buộc** (`ApproveCandidateCvRequest`, `@NotBlank`). Để trống → lỗi 400 *an internal note is required*. Luôn ghi một câu.',
      '**Nút *Approve → undo the rejection* (và *Approve CV — undo the rejection…* trong ⋯) không chạy** — server trả 409 vì CV đã có người quyết. Đừng hứa với ứng viên là “sẽ gỡ”; bảo họ tải một bản khác (khi web có màn thay file) hoặc dùng CV khác.',
      'Duyệt một file **Không đọc được** vẫn làm nó *Đạt*, nhưng hệ thống **không trích được chữ nào** từ nó — nên nó vô hình với tìm kiếm theo kỹ năng, mặt mà nhà tuyển dụng dùng nhiều nhất. Cân nhắc xin ứng viên một file PDF có chữ.',
      '**Cột liên hệ bị giấu vĩnh viễn** ở màn hình này. Đó là chủ đích, không phải thiếu dữ liệu. Mỗi lần mở danh sách và mỗi lần mở một CV đều được ghi audit (`candidate_cv.read`).',
    ],
    blocks: [
      { kind: 'h', text: '§1 · Hàng đợi này đang rỗng — vì sao' },
      {
        kind: 'table',
        heading: 'Cờ quét `SVN_CV_QUALIFICATION_ENABLED` — mặc định TẮT',
        note: 'Nguồn: `application.yml` (svn-be ee1db5ea9) — *“Turning it on makes doubt hold applications, so it is a product decision, not a deploy detail.”* Không profile, file compose hay workflow nào đặt biến này (DEBT D-RES-19). Màn admin **không hiện gì** cho biết cờ đang tắt.',
        cols: ['', 'Cờ TẮT (hiện tại, mọi môi trường)', 'Cờ BẬT'],
        rows: [
          ['File mới tải lên', 'Sinh ra ở **Đạt** (`APPROVED`) — gửi được, tìm được ngay', 'Sinh ra ở **chờ** (`PENDING`), máy quét chấm khi parse xong'],
          ['Máy quét ghi kết quả', '**Không ghi gì** — `recordParseOutcome` và chấm lại đều bỏ qua', 'Ghi *Đạt* / *Not enough information* / *Can’t read*'],
          ['CV vào *Needs review* bằng cách nào', 'Gần như không: chỉ khi **thay file** một CV tải lên (version mới luôn về chờ, kể cả khi cờ tắt) — mà web chưa có nút thay file', 'Mọi file tải lên mà quét thấy thiếu'],
          ['Đơn bị giữ *Chưa gửi*', 'Chỉ với đơn gắn CV đang chờ (trường hợp trên)', 'Mọi đơn gắn CV đang nghi ngờ'],
          ['Chip *Unfinished* phía ứng viên', '**Vẫn hiện** — tính trực tiếp từ lần parse, không đọc cờ', 'Hiện'],
        ],
      },
      {
        kind: 'warn',
        text:
          '**Bật cờ không tự kéo CV cũ về hàng đợi.** CV tải lên trước đó đều đã `APPROVED` mà chưa ai đọc (dev, 03/09: 401/403 CV). Muốn giữ chúng lại phải chạy tay `scripts/hold-unscreened-cvs.sql` **cùng lúc** bật cờ — chạy khi cờ đang tắt là bỏ mọi ứng viên kẹt sau một hàng đợi không ai làm.',
      },
      {
        kind: 'p',
        text:
          '**Quy tắc máy quét, bốn trạng thái CV, Saramin CV so với file tải lên, version và mỗi bên nhìn thấy gì** áp cho cả bốn trang của nhóm, nên nằm một chỗ: **Logic chung — Resume management** §2–§6. Trang này chỉ giữ phần của riêng màn CV review.',
      },
      { kind: 'h', text: '§2 · Hộp thoại Từ chối' },
      {
        kind: 'table',
        heading: 'Bốn lý do — và câu chúng điền sẵn',
        note: 'Lý do là **nội bộ** (ứng viên không thấy mã), nhưng nó điền sẵn lời nhắn và nút. Danh mục lấy từ server (`GET /api/admin/candidate-cvs/reject-reasons`, `CvRejectMessages`). **CV Saramin chỉ nhận hai lý do cuối** — server từ chối hai lý do đầu với CV soạn trong form.',
        cols: ['Lý do (UI)', 'Lời nhắn điền sẵn', 'Nút mặc định', 'Câu công ty thấy trên dòng hoàn credit'],
        rows: [
          ['*Can’t read*', '“Hệ thống không đọc được nội dung trong file này. Bạn thử tải lên bản PDF xuất trực tiếp từ Word hoặc Google Docs giúp nhé.”', '*Upload another CV*', '“File là bản scan, hệ thống không đọc được nội dung.”'],
          ['*Not a CV*', '“File bạn tải lên không phải một CV…”', '*Upload another CV*', '“File này không phải một CV.”'],
          ['*CV but not enough information* *(chọn sẵn)*', '“Hồ sơ chưa đủ thông tin để gửi tới nhà tuyển dụng. CV cần có ít nhất một kinh nghiệm làm việc — hoặc học vấn nếu bạn chưa đi làm…”', '*Update profile*', '“CV chưa đủ thông tin.”'],
          ['*Other*', '**Không soạn sẵn** — phải tự viết', '*No button*', '“Saramin đã thu hồi CV này.”'],
        ],
      },
      {
        kind: 'list',
        heading: 'Các ô còn lại',
        items: [
          '**The candidate sees this**: tag *Chưa được duyệt* (chỉ đọc) và **Message to the candidate** — bắt buộc, ≤ 300 ký tự.',
          '**Button**: *Upload another CV* · *Update profile* · *Contact support* · *No button*. Server lưu lựa chọn này, nhưng **web ứng viên hiện không vẽ nút nào** (gỡ 14/09).',
          '**Internal note**: bắt buộc, ≤ 500 ký tự, chỉ HQ đọc (nằm trong audit, không trên dòng CV).',
          '**Khối hậu quả** (server: `/reject-impact`): bao nhiêu đơn đang giữ sẽ thành *Không được gửi*, bao nhiêu đơn đã gửi bằng version này sẽ **bị thu hồi**, bao nhiêu đơn gửi bằng version **cũ hơn** được **giữ nguyên**.',
        ],
      },
      {
        kind: 'warn',
        text:
          '**Lời nhắn điền sẵn của *CV but not enough information* mô tả sai quy tắc**: nó nói “ít nhất một kinh nghiệm — hoặc học vấn nếu chưa đi làm”, trong khi quy tắc là **luôn cần học vấn**, cộng kinh nghiệm nếu không phải Fresher. Sửa câu trước khi gửi.',
      },
      { kind: 'h', text: '§3 · Màn hình — từng phần' },
      {
        kind: 'table',
        cols: ['Phần', 'Chi tiết'],
        rows: [
          ['**Tab**', '*Needs review* · *Approved* · *Rejected* (`?tab=`). Tab không còn số đếm từ 23/09.'],
          ['**Cột**', '*Candidate* (bấm mở hồ sơ ứng viên ở tab mới) · *CV* (tên + nhãn *Saramin CV* + version; biểu tượng file mờ *File not available.* khi không có link) · *Basic information* · *Work preference* · *Contact* (luôn giấu) · *CV status* · *Used to apply* · *In talent pool* · *CV content* · *Updated* · *Actions*.'],
          ['**Tìm** · **Lọc**', '*Search candidate, file…* · *CV status* (chỉ tab đầu) · *Reject reason* (chỉ tab Rejected) · *Used to apply* · *In talent pool* (*Picked* / *Not picked*).'],
          ['**Sắp xếp**', '*Default* (thứ tự server: tab đầu cũ nhất trước, hai tab sau mới nhất trước) · *Newest first* · *Candidate A → Z* · *Z → A*.'],
          ['**Version**', '`v.N/M` — vàng khi đang xem bản cũ hơn bản hiện tại (*An older version — the candidate has replaced this file since*).'],
          ['**Đường dẫn con**', '`/:cvId` → chuyển về `?view=<cvId>` (chỉ mở được CV có trên trang đang tải, và không tự chọn tab — CV ở tab đã quyết thường báo *That CV could not be opened*) · `/:cvId/detail` → trang chi tiết toàn màn hình, chú thích *Version at review*.'],
          ['**Export**', 'Có nút Export (cần `cv_review:read`).'],
          ['**Không có**', 'Badge số trên menu · nút *Rescan held CVs* (API `POST /api/admin/cv-qualification/rescan` có, UI chưa nối) · con số cụ thể trong khối *This decision affects*.'],
        ],
      },
      { kind: 'h', text: '§4 · Một quyết định, ba màn hình' },
      {
        kind: 'table',
        heading: 'Ba màn hình, một quyết định',
        cols: ['Màn hình', 'Đường dẫn', 'Một dòng là…', 'Làm gì ở đây'],
        rows: [
          ['**CV review**', '`/recruitment/cv-review`', 'Một CV đang/đã cần người nhìn', '**Chỗ chính.** Duyệt, hoặc từ chối kèm lý do, lời nhắn và nút.'],
          ['**Applications**', '`/recruitment/applications`', 'Một đơn ứng tuyển', 'Xem **vì sao** một đơn còn *Not sent* (trạng thái CV của nó), mở sang CV review. Không có *Chuyển tiếp*.'],
          ['**Talent pool**', '`/recruitment/talent-pool`', 'Một ứng viên có CV đang bật', 'Duyệt / từ chối nhanh kèm ghi chú nội bộ — **không lý do, không lời nhắn**; nhảy sang CV review.'],
        ],
      },
      {
        kind: 'example',
        heading: 'Ví dụ — một lần duyệt mở khoá bao nhiêu đơn',
        scenario:
          'Ứng viên A có một CV đang chờ duyệt từ **02/03**. Từ 02/03 tới 09/03, A nộp đơn bằng nó vào **4 tin tuyển dụng** của 3 công ty.',
        cols: ['Ngày', 'Việc xảy ra', 'Nhà tuyển dụng thấy gì'],
        rows: [
          ['02/03', 'CV vào *Needs review*', '—'],
          ['03/03 – 09/03', 'A nộp 4 đơn', '**Không thấy đơn nào.** Cả 4 đơn nằm ở “Chưa gửi”'],
          ['Suốt thời gian đó', 'Không có gì tự chạy', 'A tưởng đã nộp xong và đang chờ hồi âm'],
          ['10/03 — người duyệt bấm Approve', 'CV thành **Đạt**', '**Cả 4 đơn được gửi đi cùng một lúc**, mỗi công ty được báo ngay lúc đó'],
        ],
        note:
          'Một lần bấm giải phóng **mọi** đơn đang chờ CV đó. Để một dòng nằm trong hàng đợi một tuần không phải là chậm một dòng — nó là bốn cơ hội việc làm bị giữ lại mà cả hai phía đều không biết.',
      },
      { kind: 'h', text: '§5 · Câu hỏi hay gặp' },
      {
        kind: 'table',
        cols: ['Câu hỏi', 'Trả lời'],
        rows: [
          ['Vì sao *Needs review* rỗng trên dev và production?', 'Vì **cờ quét đang tắt** (§1): file mới sinh ra ở *Đạt*, máy quét không ghi gì. Bản trước của trang này đổ cho `AlwaysCleanCvScreeningAdapter` — lớp đó **không còn trong code**. Muốn thấy dữ liệu mẫu: cờ `MODULE_FLAGS.cvReviewSampleQueue` của admin (mặc định tắt) hiện dòng mẫu, nút quyết bị khoá.'],
          ['Tôi từ chối nhầm. Gỡ được không?', '**Không.** Server trả 409 *This CV has already been reviewed* dù UI có nút *undo the rejection*. Đường duy nhất: ứng viên tải một version mới (khi web có màn thay file) — CV về *Needs review* và một người quyết lại.'],
          ['Một CV dùng cho 10 tin và đang chờ. 10 NTD thấy gì?', '**Không thấy gì.** Duyệt một lần → cả 10 *Đã gửi*; từ chối một lần → cả 10 *Không được gửi*.'],
          ['Tôi từ chối một CV; NTD đã nhận nó hai tuần trước. Đơn đó có bị thu hồi?', '**Chỉ khi** NTD đang giữ đúng version bạn từ chối. Khối hậu quả trong hộp từ chối đếm sẵn cả ba nhóm.'],
          ['Ứng viên xoá tài khoản. NTD có mất CV không?', 'Thứ đã tới tay NTD giữ nguyên, gắn nhãn tài khoản đã xoá; lượt mở khoá cũ vẫn giữ. Ứng viên rời tìm kiếm CV, đơn đang giữ không bao giờ đi.'],
          ['Ứng viên xoá chính CV đó?', 'Đơn **đang chạy** nộp bằng CV đó bị **rút**, công ty được báo và không xem được CV nữa — khác với xoá tài khoản.'],
        ],
      },
      {
        kind: 'open',
        text:
          '**Cần chốt (kiểm 08/10/2026, admin 45954108 · svn-be ee1db5ea9).** (1) **Bật cờ quét khi nào, ai trực hàng đợi, SLA bao lâu** — ba câu DEBT D-RES-19 nêu từ 03/09, vẫn chưa có. (2) **Gỡ quyết định**: UI có nút, server cấm — chọn một. (3) **Ghi chú khi duyệt**: UI ghi *optional* (SRM-745), server bắt buộc — chọn một. (4) **Kho tìm kiếm có nên lọc CV chưa Đạt / bị từ chối không** (xem **Logic chung §2**) — nếu có, cần sửa cả SRM-777 lẫn cột *CV search status*. (5) Màn thay file phía ứng viên chưa có, nên toàn bộ phần version hôm nay chưa ai dùng được.',
      },
      {
        kind: 'p',
        text: '**Màn hình thật** — chụp trên dev ngày 08/10/2026.',
      },
      {
        kind: 'shot',
        src: '/shots/rec/cv-review.jpg',
        where: 'Admin',
        caption: '**CV review**, tab *Needs review*: bốn ô (*Overdue 24h · Decided 7 days · Rejected 7 days · Avg time to decide*), cột *CV status* (máy quét nói gì), *Used to apply* (có đơn nào đang chờ CV này không), *In talent pool*.',
      },
      {
        kind: 'shot',
        src: '/shots/rec/cv-review-dialog.jpg',
        where: 'Admin',
        caption: 'Bấm một dòng → hộp duyệt: file gốc bên trái (mở file là hành động PII, **có ghi log**), bên phải *What the scan said* · *The only question* · *This decision affects*. Hai nút: **Reject** và **Approve → sent + showing**.',
        note: 'Một quyết định chuyển **mọi đơn** đang chờ CV đó cùng lúc — duyệt CV, không bao giờ duyệt từng đơn.',
      },
    ],
  },

  /* ────────────────────────────────────────────────────────────────────────── */
  'talent-pool': {
    logic: [
      'Màn của **HQ**: mọi ứng viên **đang bật một CV** cho nhà tuyển dụng (*Show CV to employers*) — không phải mọi ứng viên trong hệ thống. Một dòng một ứng viên, kèm **đúng CV đang bật** và trạng thái của CV đó.',
      'Từ **29/09/2026 (SRM-777)** “có mặt trong kho” chỉ còn **một câu hỏi: có CV nào đang bật không**. Cờ đồng ý cũ (`candidate_profile.search_visible`) không còn quyết định gì — trước đó hai cờ lệch nhau làm ứng viên “bật rồi mà không ai thấy”.',
      'Quyền: xem cần `resume:read` (seed: `hq_admin`, `vn_ops`). Duyệt / từ chối từ đây dùng quyền của CV review — `cv_review:decide`. Mỗi lần mở một CV từ đây đều được ghi log (*These records contain PII — every CV opened from here is logged.*).',
    ],
    how: [
      'Bật **Overview** để xem bốn thẻ: *Searchable* (đạt / tổng) · *Needs a look* · *New · 7 days* · *Untouched 90+ days*.',
      'Tìm theo tên, email hoặc vị trí mong muốn (*Search by name, email or desired role…*). Lọc theo *Status* và *CV search status*.',
      'Bấm một dòng → hộp thoại chi tiết chỉ đọc. *View detail ↗* mở trang `/:candidateId/detail` (chú thích *Latest version*) ở tab mới.',
      'Trên dòng chưa đạt, **Open in CV review ↗** nhảy thẳng tới CV đó trong hàng đợi — làm ở đó khi lý do và lời nhắn quan trọng.',
    ],
    watch: [
      'Đây là màn của **HQ**. Kho mà **nhà tuyển dụng** tìm là `/search` trên site công ty — cùng những ứng viên này, nhưng tên bị che tới khi họ mở khoá.',
      '**Cột *CV search status* tự suy ra: *Showing* chỉ khi CV *Qualified*, *Hidden* với mọi giá trị khác — nhưng `/search` của nhà tuyển dụng không còn đọc trạng thái CV** (SRM-777). Một dòng *Hidden* ở đây vẫn có thể **ra kết quả** cho nhà tuyển dụng. Tin vào cột này là trả lời sai câu “vì sao khách thấy / không thấy người này”.',
      '**Duyệt / từ chối ở đây gửi ngay — không bước xác nhận, không lý do, không lời nhắn.** Từ chối ở đây lưu lý do *Other*: ứng viên **không nhận được câu nào**, và dòng hoàn credit của công ty chỉ đọc “Saramin đã thu hồi CV này.” Khi lý do quan trọng, hãy quyết ở **CV review**.',
      '**Quyết rồi là xong.** Một CV đã có người duyệt hoặc từ chối thì mọi quyết định tiếp theo bị server từ chối (409) — dù menu vẫn chào “phép đảo ngược”.',
    ],
    blocks: [
      { kind: 'h', text: '§1 · Ai có mặt trong kho' },
      {
        kind: 'table',
        heading: 'Cổng vào — chạy trước mọi bộ lọc và mọi xếp hạng',
        note: 'Cùng một điều kiện ở **cả ba chỗ** từ SRM-777: màn HQ này (`AdminTalentPoolQueryAdapter`), tìm kiếm của nhà tuyển dụng (`PgFtsCandidateSearchAdapter`, index ES) và cổng mở khoá (`TalentPoolService.requireUnlockableCandidate`).',
        cols: ['Điều kiện', 'Ai đặt', 'Ghi chú'],
        rows: [
          ['Có **một CV đang bật** (`candidate_cv.searchable`)', '**Ứng viên** — *Show CV to employers*; hoặc hệ thống tự bật cho file tải lên đầu tiên khi chưa có CV nào đang bật', 'HQ **không bật hộ** được.'],
          ['Tài khoản **Active**', 'Hệ thống / HQ ở Jobseeker users', 'Deactivated, Deleted, chưa xác thực → ra khỏi kho ở mọi màn.'],
          ['Résumé **không bị ẩn**', 'HQ (`is_hidden`)', '—'],
          ['~~CV phải *Đạt*~~', '—', '**Không còn là cổng** ở phía nhà tuyển dụng. Màn HQ vẫn hiện trạng thái CV, nhưng chỉ để xem.'],
        ],
      },
      {
        kind: 'p',
        text:
          'Hồ sơ là **LEFT join**: người bật CV trước khi từng điền hồ sơ vẫn có mặt, chỉ có các ô nhân khẩu học trống. Ba điều kiện trên là **cổng nhị phân**. Không bao giờ được gắn cổng vào một trường nghiệp vụ như lương hay số năm kinh nghiệm — mỗi trường đó đều có thể làm rỗng kết quả mà không giải thích được vì sao.',
      },

      { kind: 'h', text: '§2 · Màn hình' },
      {
        kind: 'table',
        cols: ['Phần', 'Chi tiết'],
        rows: [
          ['**Cột**', '*Candidate* · *CV* · *Basic information* · *Work preference* · *Contact* · *CV status* (kèm **lý do máy quét ghi** bên dưới) · *CV search status* · *CV content* · *Unlocks* · *Updated* · *Actions*.'],
          ['**Filter**', '*Status*: *Approved / Pending review / Rejected / Not enough information / Can’t read* · *CV search status*: *Showing / Hidden*. Hai bộ lọc thu hẹp **cùng một sự thật** — cặp mâu thuẫn báo *These filters match nothing together. Clear one of them.* và ẩn Export.'],
          ['**Sắp xếp**', '*Default* (thứ tự server) · *Candidate A → Z* · *Z → A*. Sắp và cắt trang trên **toàn kho**, không trên từng trang.'],
          ['**Unlocks**', 'Số công ty đã mở khoá. CV chưa *Qualified* thì đọc “—” với chú thích *Not showing in CV search, so it cannot be unlocked by an employer.* — **câu này sai từ SRM-777**, xem *watch*.'],
          ['**⋯ (một form nhỏ)**', '*View detail ↗* · *Approve CV… → Qualified* / *Reject CV… → Rejected* tuỳ trạng thái · *Open in CV review ↗* (chỉ dòng chưa đạt) · ô **Internal note** bắt buộc.'],
          ['**Đường dẫn con**', '`/:candidateId` → mở hộp thoại (`?view=`) · `/:candidateId/detail?cv=` → trang chi tiết.'],
          ['**Export**', 'Loại `TALENT_POOL`, cần `resume:read` phạm vi `all`.'],
          ['**New resume**', 'Nút tạo résumé tay — cần `resume:create`. Résumé HQ tạo **không có chủ**, nên **không bao giờ** vào kho tìm kiếm.'],
        ],
      },
      {
        kind: 'table',
        heading: 'Duyệt / Từ chối từ đây làm gì',
        cols: ['Hành động', 'Điều kiện', 'Hệ quả'],
        rows: [
          ['**Approve CV…**', 'CV chưa có người quyết; có ghi chú nội bộ', 'CV → *Đạt*; mọi đơn đang giữ bằng CV đó **được gửi**, công ty được báo. Ghi audit `candidate_cv.approve` (surface `talent-pool`).'],
          ['**Reject CV…**', 'CV chưa có người quyết (kể cả CV *Đạt* mặc định chưa ai xem); có ghi chú', 'CV → *Từ chối*, lý do lưu *Other*. Đơn đã gửi bằng version này **bị thu hồi**; lượt mở khoá của mọi công ty trên ứng viên này **được hoàn credit**; đơn đang giữ thành *Không được gửi*. **Không tắt** cờ hiển thị.'],
        ],
      },

      { kind: 'h', text: '§3 · Phía nhà tuyển dụng — `/search`' },
      {
        kind: 'list',
        heading: 'Từng bước (trang Notion *Talent pool*)',
        items: [
          'Vào **site công ty** → **Kho ứng viên / Talent pool** trên thanh đầu trang (`/search`; Notion ghi `/talent-pool`). Cần quyền *Search resumes* — **không cần gói** để tìm.',
          'Tìm bằng ba ô từ khoá (**OR / AND / NOT**, cách nhau bằng dấu phẩy — luật chi tiết ở bảng *Ba ô từ khoá* bên dưới) và bộ lọc. Trên kết quả chỉ có **Save candidate** (và *Dislike* để ẩn người đó khỏi tìm kiếm của công ty — quản lý ở `/search/hidden`).',
          'Mở chi tiết CV (`/search/candidates/:resumeId`) → **Unlock** để xem **tên, số điện thoại, email** và file gốc.',
          'Phần còn lại — folder, cột *Saved*, lần di chuyển tốn credit — ở trang **Candidate management**.',
        ],
      },
      {
        kind: 'table',
        heading: 'Trang tìm kiếm — từng phần',
        cols: ['Phần', 'Chi tiết'],
        rows: [
          ['**Bộ lọc**', 'Danh sách do server trả. Gồm: Job role · Industry · Location · Contract type · Salary (VND/USD) · Nationality · Gender · Age · Highest education · Years of experience · Skill · Language (kèm trình độ) · Last updated.'],
          ['**Sắp xếp**', '*Recommended* (mặc định — theo độ khớp khi có từ khoá, không có thì mới nhất) · *Update date* mới / cũ.'],
          ['**Khoảng cập nhật**', '3 / 7 ngày, 1 / 2 / 3 / 6 / 12 / 24 tháng, hoặc *Any update time* — **mặc định 24 tháng**.'],
          ['**Hai ô tick**', '*New talent* (CV lần đầu được bật trong tuần qua — tính theo ngày tạo của **CV đang bật**) · *Exclude viewed* (công ty đã xem trong 3 tháng).'],
          ['**Một trang**', '**10** kết quả.'],
          ['**Thẻ kết quả**', 'Tên che (`maskedName`, hoặc *Ứng viên #{alias}*), giới tính · tuổi · kinh nghiệm, công việc gần nhất (công ty · chức danh · thời gian · mô tả), tối đa 2 việc cũ, trường, tối đa 5 kỹ năng, *Updated {date}*. Không ảnh. **Không còn nút Unlock trên thẻ** — chỉ trên trang CV.'],
          ['**Tìm kiếm đã lưu**', 'Lưu bộ lọc vào một folder; có tab tìm “từ một tin tuyển dụng của tôi”.'],
        ],
      },
      {
        kind: 'table',
        heading: 'Ba ô từ khoá OR · AND · NOT — Quy tắc chung (cả 3 ô)',
        note: 'Đọc từ build ngày 14/10/2026 (svn-be `KeywordQuery` / `TsQuery`, `EsCandidateQueryBuilder`, `PgFtsCandidateSearchAdapter`).',
        cols: ['Quy tắc', 'Chi tiết'],
        rows: [
          ['**Tách từ khóa**', 'Bằng **dấu phẩy** hoặc **xuống dòng**. **Dấu cách không tách**: nó nằm trong từ khóa.'],
          ['**Từ khóa nhiều chữ = cụm từ**', '`Data Mining` chỉ khớp CV có đúng cụm “data mining” liền nhau, không khớp CV chỉ có chữ “data”. Muốn tìm rời từng chữ thì gõ `data, mining`.'],
          ['**Không phân biệt dấu, hoa thường**', '`dieu duong` = `Điều Dưỡng` = `điều dưỡng`'],
          ['**Ký tự đặc biệt**', 'Bị bỏ (`& | ! ( ) " \'` …), nên không dùng được toán tử tự gõ. `a & b` được hiểu là cụm `a b`.'],
          ['**Từ khóa trùng / rỗng**', 'Gộp lại hoặc bỏ qua (`y tá, y tá` → 1 từ; `a, , b` → `a`, `b`)'],
          ['**Ô chỉ có ký tự đặc biệt**', 'Coi như ô trống, không lọc gì'],
          ['**Kết hợp 3 ô**', '**(OR1 hoặc OR2 …) VÀ AND1 VÀ AND2 … VÀ KHÔNG NOT1 VÀ KHÔNG NOT2 …**'],
          ['**Sắp xếp**', 'Khi có từ khóa ở bất kỳ ô nào, mặc định sắp theo **mức độ liên quan**'],
        ],
      },
      {
        kind: 'p',
        text: '**Ví dụ:** OR = `điều dưỡng, y tá` · AND = `JCI` · NOT = `thực tập` → CV có (“điều dưỡng” **hoặc** “y tá”) **và** có “JCI” **và không** có “thực tập”.',
      },
      {
        kind: 'table',
        heading: 'Từng ô',
        cols: ['Ô', 'Ý nghĩa', 'Ghi chú'],
        rows: [
          ['**OR**', 'Có **ít nhất 1** từ khóa', 'Mở rộng kết quả. Đây là ô tìm kiếm chính.'],
          ['**AND**', 'Phải có **tất cả** từ khóa', 'Thu hẹp kết quả'],
          ['**NOT**', '**Không được có** từ khóa nào', 'Loại trừ. **Phạm vi đọc khác nhau theo môi trường**, xem *lưu ý* bên dưới.'],
        ],
      },
      {
        kind: 'list',
        heading: 'Từ khoá đọc ở đâu — trọng số (Elasticsearch)',
        items: [
          '**Headline ×8** — chức danh ứng viên tự đặt, dòng dưới tên (vd. “Product Designer”) · **kỹ năng ×6** · **chức danh từng làm ×5** · **vị trí mong muốn ×4** · **công ty từng làm ×3** · **học vấn ×2.5** · **chứng chỉ, dự án, giải thưởng ×2** · **giới thiệu ×1.5** · **mô tả công việc ×1**.',
          'Thông tin cơ bản (ngày sinh, giới tính, quốc tịch…) **không** tìm bằng từ khoá — dùng bộ lọc.',
        ],
      },
      {
        kind: 'warn',
        text:
          '**Hai bộ máy tìm kiếm cho kết quả khác nhau — và mỗi môi trường chạy một bộ.** dev (`dev-hiring.saramin.vn`) dùng **Postgres** (`SVN_ES_SERVING=false`), staging dùng **Elasticsearch** (`true`). (1) **NOT** trên Postgres đọc **toàn bộ CV**, trên Elasticsearch chỉ đọc **headline và chức danh từng làm** — nên NOT `thực tập` trên dev loại cả người viết “hướng dẫn thực tập sinh”. (2) Postgres còn khớp **một phần headline** cho ô OR (`market` ra “Marketing”), nhưng lấy **cả ô OR làm một chuỗi** nên chỉ có tác dụng khi OR có một từ khoá. (3) Giới hạn **16 từ khoá chỉ có trên Elasticsearch**. **Đừng so số kết quả giữa dev và staging** cho tới khi hai bên được thống nhất.',
      },
      {
        kind: 'table',
        heading: 'Trang CV — ba mức đọc (`CvReadAccessService`)',
        cols: ['Mức', 'Khi nào', 'Thấy gì'],
        rows: [
          ['**FULL**', 'Công ty đã mở khoá ứng viên này', 'File gốc, tên, điện thoại, email, link.'],
          ['**REDACTED**', 'Công ty có **gói CV search đang chạy** — hoặc còn **lượt xem miễn phí**', 'Bản đã **tô che liên hệ**. Giới tính, tuổi còn; ngày sinh, quốc tịch ẩn.'],
          ['**BLURRED**', 'Không gói, đã dùng hết **10 lượt xem miễn phí**', 'Không có tài liệu — bức tường: *You’ve used all your free resume views…* · *View talent-pool plans*.'],
        ],
      },
      {
        kind: 'p',
        text:
          '**10 lượt xem miễn phí** (`svn.billing.cv-preview.free-opens`, mặc định 10) tính theo **số CV khác nhau**: mở lại một CV đã xem không tốn lượt; công ty đang có gói thì **không** tiêu lượt nào. Con số 10 không hiện cho khách.',
      },
      {
        kind: 'table',
        heading: 'Họ làm gì với kho này — và tốn gì',
        cols: ['Hành động', 'Tốn gì', 'Chi tiết'],
        rows: [
          ['**Tìm và lọc**', '**Miễn phí**', 'Không cần gói.'],
          ['**Mở trang CV**', 'Miễn phí — trừ **lượt xem** khi không có gói', 'Xem bảng ba mức đọc.'],
          ['**Save candidate**', '**Miễn phí**', 'Xếp vào **một hoặc nhiều folder**. Thẻ rơi vào cột *Saved*, vẫn che.'],
          ['**Unlock** (hoặc kéo thẻ ra khỏi *Saved*)', '**Giá mở khoá của CV** — mặc định **1 credit** (`unlock_price`, từ V221)', '*Unlock this CV?* — *Unlock · {price} credits*. **Một lần, vĩnh viễn, cho cả công ty**. 0 credit thì mở hộp *Not enough credits* dẫn sang trang mua.'],
          ['**Di chuyển người đã mở khoá**', '**Miễn phí**', '*Already unlocked — this move is free.*'],
        ],
      },
      {
        kind: 'table',
        heading: 'Khi nào mở khoá bị từ chối',
        cols: ['Tình huống', 'Server trả'],
        rows: [
          ['Hết credit', '`INSUFFICIENT_CREDIT` — *You are out of credits. Top up to continue.*'],
          ['Còn credit nhưng mọi gói đã hết hạn', '`SEARCH_QUOTA_LAPSED` — *Your CV search package has expired…*; credit còn lại **đóng băng, không mất**.'],
          ['Ứng viên đã **xoá tài khoản**', '`CANDIDATE_ACCOUNT_DELETED` — trừ khi công ty **đã mở khoá từ trước**.'],
          ['Ứng viên **không còn CV nào đang bật**', '`CANDIDATE_NOT_SEARCHABLE` — trừ khi đã mở khoá từ trước, hoặc người đó **đã nộp đơn và đơn đã tới** công ty này.'],
        ],
      },
      {
        kind: 'warn',
        text:
          '**Dòng khoá không được để lộ danh tính — và build hiện chưa che đủ.** Che tên là không đủ: “Điều dưỡng trưởng khoa Ngoại · BV Quốc tế Mỹ · nữ · 34” chỉ cách cái tên đúng một lần tìm kiếm. Requirement đòi giấu tới khi mở khoá: họ tên, **tên công ty từng làm**, **tên trường**, ảnh, liên hệ, file CV. Trên `/search` hôm nay (svn-web d8a43a11) **tên công ty và tên trường trên thẻ kết quả vẫn hiện** — chỉ tên và liên hệ bị che. (Bảng folder thì đã giấu tên công ty với người chưa mở khoá, từ 06/10.)',
      },
      {
        kind: 'warn',
        text:
          '**Ứng viên đã xoá tài khoản thì không mở khoá lần đầu được nữa** — thẻ đang khoá không rời cột *Saved* được. Người **đã từng được mở khoá** thì không bị ảnh hưởng.',
      },
      {
        kind: 'open',
        text:
          '**Cần chốt (svn-be ee1db5ea9 · admin 45954108 · svn-web d8a43a11).** (1) Kho tìm kiếm có lọc CV chưa *Đạt* / bị từ chối không — build hiện **không** lọc, màn HQ vẫn ghi như có lọc. (2) Thẻ kết quả để lộ tên công ty và trường. (3) Từ chối ở đây không có lý do và không lời nhắn cho ứng viên — có nên bỏ hẳn hành động này khỏi màn kho, để mọi từ chối đi qua CV review?',
      },
      {
        kind: 'p',
        text: '**Màn hình thật** — chụp trên dev ngày 08/10/2026.',
      },
      {
        kind: 'shot',
        src: '/shots/rec/talent-pool.jpg',
        where: 'Admin',
        caption: '**Talent pool**: bốn ô (*Searchable 38 / 128 · Needs a look · New 7 days · Untouched 90+ days*), lọc theo *Status* và *CV search status*, nút **New resume**. Cột *Unlocks* đếm số lượt CV đó đã được mở khoá.',
      },
    ],
  },

  /* ────────────────────────────────────────────────────────────────────────── */
  'candidate-management': {
    logic: [
      '**Hai tab, hai tập người khác nhau.** *Jobs* = người **nộp đơn** vào tin của bạn. *Talent pool* = người bạn **lưu từ tìm kiếm CV**. Một lần vào folder không bao giờ là một đơn ứng tuyển — cùng một người có thể ở cả hai, thành hai dòng riêng.',
      '**Người nộp đơn tới nơi đã được Saramin gửi, và liên hệ mở sẵn.** Chỉ đơn Saramin đã *gửi* mới tới bảng của bạn. Nộp đơn là đồng ý của ứng viên — trên tab Jobs **không có gì để mở khoá, không có gì để trả**.',
      '**Trên tab Talent pool, trả tiền khi DI CHUYỂN, không phải khi LƯU.** Lưu là miễn phí, thẻ vào cột *Saved*, vẫn che. Kéo thẻ ra khỏi *Saved* là mở khoá người đó — **giá mở khoá của CV (mặc định 1 credit), một lần, vĩnh viễn**. Người đã mở khoá thì di chuyển miễn phí.',
      '**Pipeline thuộc về tin (hoặc folder), và hai đầu bị ghim.** Mỗi tin có cột riêng — mặc định *CV screening · Interview 1 · Interview 2 · Final acceptance* — cộng *Hired* và *Rejected* cố định. Cột đầu và cột cuối đổi tên được, không xoá, không dời được.',
    ],
    how: [
      'Vào **site công ty** → `/applicants`. Chọn một tin ở cột trái (hoặc *All openings*); đổi *List view / Board view*.',
      'Muốn xem CV một người nộp đơn: bấm tên → mở trang CV (`/search/candidates/:resumeId?applicationId=…`). **Lần mở đầu tiên đánh dấu đơn là *Viewed*.**',
      'Chuyển chặng bằng dropdown, kéo thẻ ở Board view, hoặc chọn nhiều → *Move to next step* (tối đa 200 người một lượt).',
      'Tab **Talent pool**: chọn folder ở cột trái; kéo thẻ ra khỏi *Saved* khi đã sẵn sàng trả để xem liên hệ.',
    ],
    watch: [
      '**Mở CV của người nộp đơn là đánh dấu *Viewed*** — dòng rời danh sách “chưa xem” ở trang chủ console. Không có cách bỏ đánh dấu.',
      '**Hired / Rejected là điểm cuối** — server từ chối mọi lần chuyển tiếp: *This application is closed*.',
      '**Hộp *Disqualification* báo rằng loại một người chưa được xem sẽ chuyển đơn sang *Viewed* và gửi email** — câu chép từ bản Hàn, hành vi phía Việt Nam **chưa xác minh**.',
      '**Save all không mã hoá file Excel.** Mật khẩu hỏi ở bước cuối là **mật khẩu tài khoản của chính bạn**, để xác nhận danh tính — sai 5 lần thì bị khoá.',
    ],
    blocks: [
      {
        kind: 'table',
        heading: 'Các trang',
        cols: ['Trang', 'Đường dẫn', 'Là gì'],
        rows: [
          ['Candidate management — tab **Jobs**', '`/applicants`', 'Người đã nộp đơn vào tin của bạn, mỗi tin một pipeline'],
          ['Candidate management — tab **Talent pool**', '`/applicants?tab=talent-pool`', 'Người bạn đi tìm — lưu từ tìm kiếm CV vào folder, mỗi folder một pipeline'],
          ['**Talent pool** (tìm kiếm CV)', '`/search` *(Notion ghi `/talent-pool`)*', 'Nơi tìm ra và lưu ứng viên — nguồn của tab thứ hai'],
          ['**Trang CV**', '`/search/candidates/:resumeId`', 'Chung cho cả hai nguồn: CV, nút *Unlock*, *Remaining quota*, panel *History* (ai trong công ty đã xem / mở khoá / lưu)'],
          ['**Credits**', '`/hiring/credits`', 'Số dư (*Current balance: {balance} credits*) và *Your CV search packages*'],
        ],
      },
      {
        kind: 'table',
        heading: 'Quyền của thành viên công ty',
        note: 'Nhãn đúng như trong màn *Roles* của site công ty (svn-web d8a43a11). Người chỉ có quyền xem thấy bảng ở chế độ đọc; tab folder ghi *Your role cannot manage the talent pool.*',
        cols: ['Quyền', 'Cho phép'],
        rows: [
          ['*See applications*', 'Xem tab Jobs'],
          ['*Handle applicants (move stages, rate)*', 'Chuyển chặng, gắn sao, loại'],
          ['*Search resumes*', 'Dùng `/search`'],
          ['*Unlock a resume (spends credit)*', 'Tiêu credit — *Spends 1 CV unlock and reveals contact details · audited*'],
        ],
      },

      { kind: 'h', text: '§1 · Tab Jobs — /applicants', path: '/applicants' },
      {
        kind: 'p',
        text:
          '**Một tin một lúc.** Cột trái liệt kê các tin (hoặc *All openings*); đầu trang hiện tin, số ứng viên và địa điểm; thanh công cụ đổi *List view / Board view*, tìm ứng viên, lọc (*Candidate classification*: *All / Bookmarked*) và sắp xếp (*Newest applied* mặc định · nhiều / ít kinh nghiệm · học vấn cao / thấp). Dưới đó mỗi chặng một chip kèm số đếm — bấm để lọc, kéo để đổi thứ tự, **+** để thêm. **Chặng của một người chỉ hiện ở dải chip / cột board**, không còn cột riêng trên bảng.',
      },
      {
        kind: 'table',
        heading: 'Một dòng hiện gì',
        note: 'Cột theo svn-web d8a43a11 (`candidate-table.tsx`). Bản trước của trang này còn ghi cột *Stage* và *Hiring status* (placeholder) — cả hai đã bỏ; *Desired role & Skills* giờ là dữ liệu thật (06/10).',
        cols: ['Cột', 'Nghĩa'],
        rows: [
          ['**Candidate**', 'Tên, giới tính · tuổi, và một ngôi sao (bookmark). Bấm tên mở trang CV.'],
          ['**Experience**', 'Tổng kinh nghiệm, công ty gần nhất và thời gian ở đó — hoặc *Entry level*. Sắp xếp được bằng tiêu đề cột.'],
          ['**Education**', 'Bậc **cao nhất** và trường. Sắp xếp được.'],
          ['**Desired role & Skills**', 'Vị trí mong muốn (đậm), rồi các chip kỹ năng, tràn thì *+N*.'],
          ['**Days in stage**', 'Ứng viên đã chờ ở chặng hiện tại bao lâu. Chuyển lại **đúng chặng đó** không reset bộ đếm.'],
        ],
      },
      {
        kind: 'table',
        heading: 'Ba trạng thái đặc biệt của một dòng',
        cols: ['Trạng thái', 'Nghĩa', 'Còn làm được gì'],
        rows: [
          ['**Recalled by Saramin**', 'Saramin đã gửi đơn này rồi **từ chối CV** (version đó). Liên hệ và CV bị ẩn; ba cột CV đọc *Withheld*. ', '**Không gì cả** — dòng chỉ để tham chiếu (không menu, không đổi sao, không chọn).'],
          ['**Deleted candidate**', 'Ứng viên đã đóng tài khoản Saramin. Tên đọc *Deleted candidate*; nhãn *Account deleted* nằm trên trang CV. Ba cột CV đọc *Withheld*.', 'Chuyển chặng, gắn sao, chọn. Không mở được CV.'],
          ['**CV deleted**', 'Ứng viên đã xoá CV dùng để nộp đơn này — đơn **đang chạy** thì bị rút, và công ty được báo.', 'Như dòng bình thường, chỉ thiếu tài liệu (*Withheld*).'],
        ],
      },
      {
        kind: 'table',
        heading: 'Thao tác',
        cols: ['Thao tác', 'Ở đâu', 'Điều gì xảy ra'],
        rows: [
          ['**Move stage**', 'Dropdown · kéo ở Board view · *Multi-select → Move to next step* (≤ 200)', 'Đơn đổi cột; số trên chip cập nhật. Ứng viên thấy chặng mới ở *My applications* (bằng chữ của Saramin).'],
          ['**Hired / Rejected**', 'Hai cột cố định', '**Đóng** đơn. Không chuyển được nữa — *This application is closed*.'],
          ['**Failure**', '*Multi-select → Failure*', 'Hộp *Disqualification*: một trong sáu lý do (Does not meet the required competencies · Not a fit · Withdrew / no-show · Declined the offer · Could not agree on terms · Other) + ghi chú tự do ≤ 2000 ký tự → *Reject*. Lý do **chỉ thành viên của bạn thấy**.'],
          ['**Delete**', '*Multi-select → Delete*', 'Ứng viên rời bảng của bạn; họ vẫn giữ lịch sử nộp đơn, vẫn ở tìm kiếm CV (che lại, trừ khi bạn đã mở khoá) và nộp lại được.'],
          ['**Star**', 'Trên dòng', 'Bookmark; lọc *Candidate classification → Bookmarked*.'],
          ['**Save all**', 'Thanh công cụ / thanh chọn', 'Tải Excel qua ba bước: chọn lý do (*Selection management / Data backup / Inspection and response / Other*) → xác nhận bằng **mật khẩu tài khoản** → tải. File **không** có mật khẩu. Có chọn = các dòng đó; không chọn = cả danh sách.'],
          ['**Select**', 'Trên dòng', '**Chưa có** — *Not available yet*. (*Send offer* và *More* đã gỡ hẳn.)'],
        ],
      },
      {
        kind: 'table',
        heading: 'Luật chặng',
        cols: ['Luật', 'Chi tiết'],
        rows: [
          ['**Theo tin**', 'Mỗi tin sở hữu chặng của riêng nó. Thêm *Technical test* vào một tin không thêm vào các tin khác.'],
          ['**Mặc định**', '*CV screening · Interview 1 · Interview 2 · Final acceptance* — **tối đa 8 chặng**; *Hired* và *Rejected* cố định, luôn có. Đơn mới (hoặc đơn vừa được Saramin duyệt CV) rơi vào **cột đầu**.'],
          ['**Ghim hai đầu**', 'Cột đầu và cột cuối **chỉ đổi tên được**.'],
          ['**Đổi tên · đổi thứ tự · xoá**', 'Từ menu của chip (*Modify stage name · Move order left / right · Delete step*) hoặc kéo chip. **Chặng còn ứng viên thì không xoá được**.'],
          ['**Được nhảy cóc**', '*CV screening → Final acceptance* một bước là hợp lệ.'],
          ['**Đã đóng là đóng**', '*Hired* và *Rejected* là điểm cuối. Không có mở lại.'],
        ],
      },

      { kind: 'h', text: '§2 · Tab Talent pool — /applicants?tab=talent-pool', path: '/applicants?tab=talent-pool' },
      {
        kind: 'p',
        text:
          '**Các folder ứng viên đã lưu, mỗi folder một pipeline** — mặc định mở ở *Board view*. Cột trái hiện *Your folders* và hai *Holding boxes*: **Unlocked** (người bạn đã trả tiền mở nhưng chưa xếp vào đâu) và **Archive** (người bạn đã gỡ khỏi một folder). Bảng của một folder: **Saved** (ghim đầu — *“Nobody here has been paid for. Moving a card out spends credits.”*) · các cột của bạn (mặc định *Interview 1 · Interview 2*) · **Final acceptance** (ghim cuối). Mỗi thẻ hiện kinh nghiệm, công ty gần nhất, bậc học cao nhất, vị trí mong muốn — **người chưa mở khoá thì không lộ tên công ty và ngày tháng** công việc.',
      },
      {
        kind: 'table',
        heading: 'Lần di chuyển tốn tiền',
        cols: ['Di chuyển', 'Phí', 'Màn hình làm gì'],
        rows: [
          ['*Saved* → cột khác, ứng viên **chưa** mở khoá', '**Giá mở khoá của CV** (mặc định 1 credit)', 'Hộp *Moving this card spends a credit*, số dư còn lại, *Spend credits and move* / *Keep in Saved*. Xong thì tên và liên hệ lộ ra **ở mọi nơi**.'],
          ['Cùng di chuyển đó, ứng viên **đã** mở khoá', 'Miễn phí — *Already unlocked — this move is free.*', 'Không có hộp thoại.'],
          ['Mọi di chuyển giữa các cột khác', 'Miễn phí', '—'],
          ['**Quay lại** *Saved*', 'Không cho', '*A card cannot be moved back to Saved once it has left it.*'],
          ['Ra khỏi *Saved* khi **hết credit**', 'Bị từ chối', '*You are out of credits. Top up to continue.* — thẻ ở lại *Saved*.'],
          ['Ra khỏi *Saved* khi gói **đã hết hạn**', 'Bị từ chối', '*Your package term has ended. Renew it to use the opens you still hold.*'],
          ['Ra khỏi *Saved* khi ứng viên **đã xoá tài khoản** hoặc **đã tắt CV**', 'Bị từ chối', 'Không mở khoá **lần đầu** được nữa. Người đã mở khoá từ trước thì không ảnh hưởng.'],
        ],
      },
      {
        kind: 'p',
        text:
          '**Một lần mở khoá mua người đó, vĩnh viễn:** mở lại CV, xếp vào folder thứ hai, archive rồi lưu lại — **không lần nào tính tiền nữa**. Nếu sau đó Saramin **từ chối CV** của người này, credit đã trả được **hoàn** vào số dư, kèm lý do trên dòng lịch sử sử dụng.',
      },
      {
        kind: 'table',
        heading: 'Thao tác khác trong một folder',
        cols: ['Thao tác', 'Điều gì xảy ra'],
        rows: [
          ['**Star / Bookmarked only**', 'Bookmark một thẻ; lọc bảng theo bookmark.'],
          ['**Multi-select → Unlock**', 'Mở khoá các thẻ đã chọn một lượt — **không giới hạn số lượng** (web tự gửi theo lô 50). Thẻ đã mở bị bỏ qua, không tính tiền; hết credit giữa chừng thì phần còn lại bị từ chối — **không có gì bị trừ nửa vời**.'],
          ['**Move to another folder**', 'Ứng viên **chuyển** (không phải chép) sang folder bạn chọn — tạo folder mới ngay trong hộp thoại.'],
          ['**Delete** (trong folder)', 'Người đó sang *Archive*. Tìm lại được, không bao giờ tính tiền lại.'],
          ['**Delete** (từ Archive)', 'Gỡ khỏi danh sách đã lưu. **Không hoàn tác** — nhưng lượt mở khoá vẫn giữ.'],
          ['**Rename / delete folder**', 'Xoá folder là gỡ chỗ của mọi người trong đó; credit đã tiêu **không hoàn**.'],
          ['**Search candidate**', 'Theo tên — **chỉ tìm ra người đã mở khoá**.'],
          ['**Save all**', 'Cùng luồng ba bước. Câu chữ đang **tự mâu thuẫn**: bước chọn ghi *Only candidates you have unlocked are included.*, toast lại nói *{count} of them are locked, so their contacts are blank*.'],
        ],
      },
      {
        kind: 'list',
        heading: 'Thử bằng cách',
        items: [
          'Lưu một ứng viên từ tìm kiếm CV vào **hai** folder → có ở *Saved* trong cả hai; số dư không đổi.',
          'Kéo ra khỏi *Saved* ở folder A → hộp thoại, xác nhận, số dư **−1**, tên lộ ra. Kéo ra khỏi *Saved* ở folder B → **miễn phí**.',
          'Đặt credit của công ty về 0, kéo một thẻ đang khoá ra khỏi *Saved* → bị từ chối; thẻ vẫn ở *Saved*.',
          'Cho ứng viên tắt *Show CV to employers*, rồi kéo thẻ đang khoá của họ → bị từ chối (`CANDIDATE_NOT_SEARCHABLE`).',
          'Tìm trong folder bằng tên thật của một người đang che → không ra; tìm một người đã mở khoá → ra.',
        ],
      },

      { kind: 'h', text: '§3 · Credit — là gì và từ đâu ra' },
      {
        kind: 'table',
        cols: ['', 'Chi tiết'],
        rows: [
          ['**Một credit mua gì**', 'Danh tính và liên hệ của **một ứng viên** (tên, điện thoại, email, file CV, link) — một lần, cho **cả công ty**.'],
          ['**Giá**', 'Mỗi CV có giá riêng (`unlock_price`) — hiện **1** cho mọi CV (từ V221). Hộp thoại luôn in đúng giá.'],
          ['**Từ đâu ra**', 'Một product **CV search** bán qua CRM. Credit về số dư khi **kế toán phát hành hoá đơn**; gói chạy **30 hoặc 90 ngày** kể từ khi bắt đầu (*Start this package* ở `/hiring/credits`, không hoàn tác).'],
          ['**Trạng thái gói**', '*Not started · Running · Fully used · Expired · Withdrawn*.'],
          ['**Cái gì tiêu**', '*Unlock* trên trang CV · kéo thẻ ra khỏi *Saved* · *Multi-select → Unlock*.'],
          ['**Cái gì KHÔNG bao giờ tiêu**', 'Mọi thứ trên tab Jobs · tìm kiếm · lưu · archive · mở lại một CV đã mở khoá · di chuyển một người đã mở khoá.'],
          ['**Gói hết hạn**', 'Credit còn lại bị **đóng băng, không mất**.'],
          ['**Số dư hiện ở**', 'Trang CV (*Remaining quota*, hoặc *Unlimited*), các hộp tính phí, `/hiring/credits`. **Không** còn trên trang `/search`.'],
        ],
      },

      { kind: 'h', text: '§4 · Những thứ liên quan khách cần biết' },
      {
        kind: 'table',
        cols: ['Ở đâu', 'Vì sao quan trọng ở đây'],
        rows: [
          ['**Admin → Applications**', 'Tầng của Saramin: một đơn là *Sent*, *Not sent* (CV đang chờ duyệt hoặc bị từ chối) hoặc *Recalled*. Chỉ đơn *Sent* tới tab Jobs; thu hồi làm dòng chỉ đọc. HQ **không bao giờ** chạm vào chặng của khách.'],
          ['**Admin → CV review**', 'Nơi một đơn đang giữ được giải phóng — hoặc một đơn đã gửi bị thu hồi.'],
          ['**Talent pool** (tìm kiếm CV)', 'Nguồn của tab Talent pool, và là nơi thứ hai tiêu credit. Luật ba mức đọc và **10 lượt xem miễn phí** nằm ở trang **Talent pool**.'],
          ['**Job postings**', 'Chặng nằm trên tin — tab Jobs đọc và sửa chính quy trình tuyển dụng của tin.'],
          ['**Jobseeker → My applications**', 'Ứng viên thấy chặng bạn đặt (bằng chữ của Saramin); **không bao giờ** thấy lý do loại.'],
        ],
      },
      {
        kind: 'open',
        text:
          '**Điểm cần chốt với khách (svn-web d8a43a11).** (1) **Chặng mặc định khác requirement** — requirement ghi *New → Reviewing → Shortlisted → Interview*; build ship *CV screening · Interview 1 · Interview 2 · Final acceptance*. (2) **Select** vẫn *Not available yet* — ẩn đi hay định nghĩa. (3) **Câu thông báo khi loại** (*“status changes to ‘Viewed’… and an email is sent”*) chép từ sản phẩm Hàn — xác nhận email tiếng Việt trước khi khách test. (4) **Save all ở folder** tự mâu thuẫn về người chưa mở khoá. (5) Trang CV **không hiện version** đơn đã gửi (*v.1/2*) cho nhà tuyển dụng — chỉ admin thấy.',
      },

      { kind: 'h', text: '§5 · Kịch bản test đầu-cuối gợi ý' },
      {
        kind: 'table',
        cols: ['#', 'Kịch bản', 'Đạt khi'],
        rows: [
          ['1', 'Ứng viên nộp đơn bằng một CV *Đạt*', 'Dòng hiện trên bảng của tin ở cột đầu **ngay phút đó**, liên hệ đọc được, không tốn credit'],
          ['2', 'Mở CV của dòng đó lần đầu', 'Đơn thành *Viewed*; rời danh sách chưa xem ở trang chủ console'],
          ['3', 'Saramin thu hồi một đơn đã gửi', 'Dòng ở lại với *Recalled by Saramin*, các ô đọc *Withheld*, mọi thao tác trên nó bị từ chối'],
          ['4', 'Chuyển một ứng viên *CV screening → Interview 2 → Hired*', 'Cả hai lần chuyển thành công; kéo tiếp bị từ chối; *My applications* của ứng viên hiện chặng tương ứng'],
          ['5', 'Thêm chặng *Technical test* vào tin A', 'Bảng của tin B **không đổi**'],
          ['6', 'Lưu một kết quả tìm kiếm vào folder, rồi kéo ra khỏi *Saved*', 'Hộp xác nhận hiện số dư; sau khi xác nhận số dư **−1** và tên lộ ra trên thẻ, trong tìm kiếm CV và trên trang CV'],
          ['7', 'Cùng ứng viên đó lưu vào folder thứ hai rồi kéo', 'Không hộp thoại, không tính phí'],
          ['8', 'Công ty có 0 credit bấm *Unlock* trên trang CV', 'Hộp *Not enough credits*, *Confirm* dẫn sang trang mua; không trừ gì'],
          ['9', '*Save all* với mật khẩu sai 5 lần', 'Bị khoá thao tác; file không tải'],
          ['10', 'Ứng viên xoá tài khoản Saramin', 'Tab Jobs: dòng ở lại, tên đọc *Deleted candidate*, vẫn chuyển chặng được. Folder: thẻ đang khoá không rời *Saved* được nữa; thẻ đã mở không ảnh hưởng'],
          ['11', 'HQ từ chối CV của một người công ty đã mở khoá', 'Số dư **+1** (hoàn), dòng lịch sử sử dụng ghi lý do'],
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
      '**Trạng thái CV là sự thật duy nhất được lưu về chất lượng.** Đơn có được gửi không suy ra từ nó; không màn hình nào đặt tay “Đã gửi”. Nhưng **có mặt trong tìm kiếm CV thì từ 29/09 (SRM-777) chỉ đọc cờ *Show CV to employers*** — không đọc trạng thái CV.',
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
          ['1', '**Tạo**: soạn **Saramin CV** hoặc **tải file** (PDF/DOCX ≤ 10 MB); chọn *Experienced* / *No experience*', 'Ứng viên', 'Một CV trong thư viện, **v.1**', 'Không giới hạn số CV. File tải lên được **parse** ngay.'],
          ['2', '**Bật**: *Show CV to employers* — một CV tại một thời điểm', 'Ứng viên (hoặc hệ thống, cho file tải lên đầu tiên)', 'CV mặc định; ứng viên **vào kho tìm kiếm**', 'Từ SRM-777, đây là **cổng duy nhất** của kho.'],
          ['3', '**Quét**: chấm theo quy tắc mỗi lần lưu / parse', 'Hệ thống', '*Đạt* · *Chưa đủ thông tin* · *Không đọc được*', 'Cờ **tắt**: file sinh ra *Đạt*, máy không ghi gì. Saramin CV luôn chấm trực tiếp, không qua máy quét.'],
          ['4', '**Duyệt**: CV nghi ngờ vào hàng đợi', 'HQ — CV review', 'Approve → *Đạt* · Reject → *Từ chối*', '**Chung cuộc** — không gỡ được (409).'],
          ['5', '**Có mặt trong kho**', '—', 'Hiện ở `/search`, **tên và liên hệ che**', 'Thẻ vẫn lộ tên công ty, tên trường.'],
          ['6', '**Nhà tuyển dụng tìm thấy**: xem (10 lượt miễn phí nếu không gói) · **Save** vào folder (miễn phí) · **Unlock** / kéo ra khỏi *Saved*', 'Nhà tuyển dụng', 'Lộ tên, điện thoại, email, file gốc', '1 credit, một lần, cho cả công ty.'],
          ['7', '**Nộp đơn** bằng một CV', 'Ứng viên', 'Đơn *Sent* → tab **Jobs**, liên hệ mở sẵn — hoặc *Not sent* nếu CV đang chờ duyệt', 'Web làm mờ mọi CV *Unfinished*. Công ty mở CV lần đầu → đơn *Viewed*.'],
        ],
      },
      { kind: 'h', text: '§2 · Trạng thái CV quyết định cái gì' },
      {
        kind: 'diagram',
        id: 'cv-status',
        note: 'Theo requirement *How CV status drives Application status and CV search status*, vẽ lại **theo build** (svn-be ee1db5ea9, 08/10/2026). Khác biệt duy nhất là cột tìm kiếm — ô đứt nét.',
      },
      {
        kind: 'list',
        heading: 'Đọc sơ đồ thế nào',
        items: [
          '**Chỉ đọc từ trái sang phải.** Trạng thái đơn là **hình chiếu** của trạng thái CV; CV mới là bản ghi. Màn hình nào cho đặt tay *Sent* là đã tạo lại nguồn sự thật thứ hai mà mô hình này sinh ra để bỏ.',
          '**Ô lớn là giá trị nội bộ, dòng nhỏ là thứ người ta thấy.** *Not sent*, *Recall* là thứ hệ thống lưu và **admin** đọc. Ứng viên thấy dòng nhỏ dưới mỗi trạng thái — với file tải lên đang nghi ngờ, đơn của họ vẫn đọc *Applied* như mọi đơn khác. Nhầm hai tầng này là cách đọc sai hay gặp nhất.',
          '**Hai dòng nghi ngờ hệ quả y hệt** — có chủ đích. *Chưa đủ thông tin* và *Không đọc được* khác nhau ở thứ HQ phải **nhìn**, không bao giờ ở thứ ứng viên hay công ty trải qua.',
          '**Recall chỉ có ở nơi CV đã được giao.** Từ chối một CV còn đang nghi ngờ thì không thu hồi gì — đơn chưa từng *Sent*, nên nó ở lại *Not sent* và không công ty nào được báo. Đọc *Recall* là việc từ chối làm với **thứ đã ra khỏi cửa**, không phải việc từ chối luôn làm.',
          '**Cả hai cửa đóng mặc định.** Requirement đã bỏ cơ chế tự gửi sau 24h: không đơn nào, không CV nào được thả ra theo giờ — chỉ người. Cái giá chuyển sang Saramin: hàng đợi không ai làm là **chặn đơn của ứng viên**, nên người trực hàng đợi không còn là tuỳ chọn.',
        ],
      },
      {
        kind: 'warn',
        text:
          '**Cột tìm kiếm CV là chỗ build và requirement tách nhau.** Requirement: tìm kiếm CV cũng là hình chiếu của trạng thái CV — *Showing* chỉ khi *Đạt*, mọi trạng thái khác *Hidden*, và từ chối đưa ứng viên **rời kho**. Build từ **29/09/2026 (SRM-777)**: kho chỉ hỏi “ứng viên có CV nào đang bật *Show CV to employers* không” (`PgFtsCandidateSearchAdapter` đọc `candidate_cv.searchable`; `cvQualified` trong index ghi rõ *“it is NOT a gate”*), và từ chối **không tắt** công tắc. Nên một CV đang nghi ngờ hoặc đã bị từ chối mà ứng viên vẫn bật thì **vẫn ra ở `/search`** và vẫn mở khoá được — lượt mở khoá **trước** lúc từ chối được hoàn credit, lượt **sau** thì không. Nút *Approve → sent + showing* và dòng *Whether this CV enters employer CV search* trong hộp duyệt vẫn tả quy tắc cũ.',
      },
      {
        kind: 'table',
        heading: 'Mỗi bên nhìn thấy gì',
        note: 'Theo build 08/10. Nhà tuyển dụng **không bao giờ** thấy chữ của người duyệt — chỉ một câu cố định theo lý do (bảng lý do ở **CV review §2**).',
        cols: ['Trạng thái CV', 'Ứng viên — My CVs', 'Ứng viên — My applications', 'Nhà tuyển dụng'],
        rows: [
          ['**Đạt**', 'Không nhãn', '*Applied*, rồi các chặng của NTD', 'Một dòng bình thường ở tab *Jobs*'],
          ['**Chờ duyệt** (tải lên)', '*Unfinished* nếu lần parse thiếu mục; không nhãn nếu parse đủ hoặc chưa xong', '*Applied* như mọi đơn — không cảnh báo', 'Không thấy đơn — nó chưa được gửi'],
          ['**Unfinished** (Saramin CV)', '*Unfinished* + *Completion N%* + nút *Complete CV*', 'Không có đơn — không chọn được CV đó', 'Không có gì'],
          ['**Từ chối**', 'Nhãn **Can’t read** (mọi lý do), lời nhắn khi rê chuột; trong trang sửa: *This CV wasn’t approved* + lời nhắn, **không nút**', 'Đơn đang giữ: không bao giờ tới NTD. Đơn đã gửi bằng version này: bị thu hồi', 'Dòng thành *Recalled by Saramin*, các ô CV đọc *Withheld*. Lượt mở khoá đã trả được hoàn credit'],
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
        heading: 'Application status — requirement ba giá trị, build bốn',
        note: 'Requirement cố ý không có *Pending*: một đơn trên CV nghi ngờ đọc là *Not sent*, vì chép sự nghi ngờ lần thứ hai vào một cột vốn đã đọc từ CV là cách hai bản của một sự thật bắt đầu lệch nhau. *Not sent* vì thế gồm cả “đang chờ duyệt” lẫn “bị từ chối trước khi giao” — **cột CV status ngay bên trái** cho biết là cái nào. Màn **Applications** của Admin dùng đúng bốn giá trị dưới đây.',
        cols: ['Giá trị', 'Nghĩa', 'Requirement', 'Build'],
        rows: [
          ['*Sent*', 'Công ty đang có đơn', 'Có', 'Có (`FORWARDED`)'],
          ['*Not sent*', 'Công ty chưa thấy — CV đang chờ, hoặc bị từ chối trước khi giao', 'Có', 'Có (`PENDING`)'],
          ['*Recall*', 'Đã giao, rồi bị Saramin kéo lại vì CV mang đúng version đó bị từ chối', 'Có', 'Có (`RECALLED`)'],
          ['*Rejected*', 'HQ từ chối **riêng đơn này**, trước khi giao', '**Không** — HQ quyết CV, không quyết đơn', 'Có — ⋯ → *Reject* trên một dòng *Not sent*'],
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
          '***Đạt* → *Từ chối*** dành cho thứ máy quét không thấy: CV parse hoàn hảo nhưng là spam, giả, hoặc bị công ty báo. Requirement có thêm ***Từ chối* → *Đạt*** để gỡ một quyết định sai — **build cấm**: server trả 409 *This CV has already been reviewed* (xem CV review §5).',
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
          '**Cờ quét đang TẮT ở mọi môi trường** (`SVN_CV_QUALIFICATION_ENABLED=false`): file mới sinh ra ở *Đạt*, máy không ghi gì — bảng tắt / bật đầy đủ ở **CV review §1**. Cờ chỉ chặn đường **ghi**; đường **đọc** thì không, nên cổng nộp đơn bằng Saramin CV vẫn trả 409 `CV_NOT_QUALIFIED` dù cờ tắt. Tắt / bật vì thế **không phải một công tắc sạch**.',
      },
      { kind: 'h', text: '§5 · Saramin CV và CV tải lên — trong một bảng' },
      {
        kind: 'table',
        note: 'Hai loại CV, **một** quy tắc, **một** field nó ghi. Mọi thứ phía sau — đơn có được gửi không — **đọc** từ field đó và không được quyết ở đâu khác. Cột phải ghi cả requirement khi build làm khác.',
        cols: ['', 'Saramin CV (soạn trong form)', 'CV tải lên (PDF / DOCX)'],
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
          ['05/10', 'Lan nộp đơn vào tin của X bằng chính CV đó', '—', 'Dòng mới ở tab **Jobs** của X, cột *CV screening*, **không tốn credit**; X mở CV → đơn *Viewed*'],
        ],
        note:
          'Hai dòng của cùng một người ở hai tab là đúng thiết kế. Nếu ngày 06/10 HQ từ chối CV đang bật của Lan, X được **hoàn 1 credit**, nhưng Lan vẫn có mặt trong kho cho tới khi chính chị tắt CV — xem cảnh báo dưới.',
      },
      {
        kind: 'warn',
        text:
          '**Notion lệch build — nhóm này ghi theo build.** (1) Notion *CV review* ghi *“ít nhất một kinh nghiệm hoặc một học vấn”*; build từ **24/09/2026**: luôn cần học vấn, cần thêm kinh nghiệm trừ khi Fresher (`CvQualificationRule.evaluateResume`, không đổi tới ee1db5ea9). (2) Notion *Create CV* ghi CV chưa đạt thì **không nộp đơn được** — đúng trên web cho **cả hai loại** CV (picker làm mờ mọi CV *Unfinished*); server thì vẫn nhận file tải lên và giữ đơn. (3) Notion ghi trang tìm kiếm CV ở `/talent-pool`; site công ty phục vụ nó ở **`/search`**. (4) Requirement: CV bị từ chối **rời kho**; build từ SRM-777 không lọc theo trạng thái CV.',
      },
      {
        kind: 'warn',
        text:
          '**Sửa so với bản trước của trang này:** quyết định của HQ **không gỡ được** (trước ghi “Duyệt — gỡ từ chối”); ứng viên bị từ chối thấy nhãn **Can’t read** chứ không phải *Chưa được duyệt*, và không có nút sửa; định dạng là PDF/**DOCX** (không .doc); số CV không giới hạn; tìm kiếm CV **không** còn đòi CV *Đạt*.',
      },
      {
        kind: 'open',
        text:
          '**Cần chốt với khách.** (1) **Bật máy quét trên production khi nào, ai trực hàng đợi, SLA bao lâu** (DEBT D-RES-19). (2) **Kho tìm kiếm có lọc CV chưa Đạt / bị từ chối không** — requirement nói có, build từ 29/09 nói không. (3) **Tự bật hiển thị** cho file tải lên đầu tiên — có được coi là đồng ý của ứng viên không. (4) Thẻ kết quả `/search` lộ tên công ty / trường. (5) Màn **thay file** (version mới) phía ứng viên chưa có, nên toàn bộ luật version hôm nay chưa ai chạm tới. (6) *Total experience* theo từng CV: backend xong 08/10 (PR #783), web chưa nối. (7) **Nộp đơn bằng file tải lên chưa đạt** — requirement cho nộp rồi giữ đơn, web chặn ở picker: chọn một (§5). (8) **Application status** — requirement ba giá trị, build thêm *Rejected* theo từng đơn, ngược với “HQ quyết CV, không quyết đơn” (§3). (9) **Gỡ một quyết định** — requirement cho, server cấm (§3). (10) **Ba lỗi version** phải sửa **trước** khi mở màn thay file (§6).',
      },
    ],
  },
}
