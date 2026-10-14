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
          ['**Applications**', '`/recruitment/applications`', 'Một đơn ứng tuyển', 'Xem **vì sao** một hồ sơ còn *Not Sent* (CV Status của nó). Menu ⋮ có **Approve · Reject · Recall** — cùng quyết định trên **phiên bản CV**, áp cho mọi hồ sơ dùng phiên bản đó (*Candidate management §4*). Không có *Chuyển tiếp*.'],
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
          'Tìm bằng ba ô từ khoá (**OR / AND / NOT**, cách nhau bằng dấu phẩy) và bộ lọc. Trên kết quả chỉ có **Save candidate** (và *Dislike* để ẩn người đó khỏi tìm kiếm của công ty — quản lý ở `/search/hidden`).',
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
      '**“Rejected” là CV Status, không phải Application Status.** Application Status chỉ có đúng 3 giá trị: *Not Sent · Sent · Recall*.',
      '**Recall không hoàn tác được** — ứng viên muốn ứng tuyển lại phải nộp hồ sơ mới. Lý do nào cũng cho cùng kết quả: CV Status = Rejected, Application Status = Recall.',
      '**Operator hoặc Admin mở / tải CV không bật flag** Viewed / Downloaded — chỉ hành động của NTD mới bật.',
      '**Flag chỉ đổi trạng thái khi thẻ còn ở cột Application Received.** Thẻ đã sang cột giữa / cuối thì NTD xem hay tải lại CV không đổi gì (flag vẫn được ghi nhận).',
      '**Phiên bản CV khác không bị ảnh hưởng.** Bản 1.1 đã Sent ở công ty A, bản 2.2 bị Reject ở công ty B → hồ sơ ở A **vẫn Sent**.',
    ],
    blocks: [
      { kind: 'p', text: 'Theo tài liệu *Candidate Management: Luồng trạng thái ứng tuyển*, phiên bản 14/10/2026 (Ngô Thái Nguyên, BA/QA). Các điểm **chưa chốt** nằm trong khung vàng. Phần Talent pool (§10) và credit (§11) giữ theo build 08/10/2026.' },
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
          ['**CV Search Status**', 'Talent Pool', 'Showing, Hidden', '*(chờ xác nhận)*'],
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
        heading: 'Application Status — chỉ có đúng 3 giá trị',
        note: '“Rejected” là **CV Status**, không phải Application Status.',
        cols: ['Giá trị', 'Ý nghĩa'],
        rows: [
          ['**Not Sent**', 'CV bị giữ ở Admin. NTD không thấy'],
          ['**Sent**', 'CV Qualified, đã tự động gửi sang NTD và tạo thẻ ở cột Application Received'],
          ['**Recall**', 'CV đã gửi rồi bị thu hồi. CV Status **luôn** là Rejected. Luồng kết thúc, ứng viên phải nộp hồ sơ mới'],
        ],
      },
      {
        kind: 'open',
        text: '**CV Search Status** gắn với **CV**, không gắn với từng lượt ứng tuyển. Đề xuất: chỉ CV Qualified mới có thể *Showing*; CV Cannot Read, Not Enough Information hoặc Rejected luôn *Hidden*. Ai làm thay đổi giá trị này cũng chưa chốt.',
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
          ['10', 'Rejected', 'Recall', 'Giữ vị trí lúc bị thu hồi', 'Application Withdrawn', 'Rejected · Recall · Stage lúc bị thu hồi', 'Không thao tác được (cách hiển thị **chờ xác nhận**)'],
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
          'Recall **không hoàn tác được**. Ứng viên muốn ứng tuyển lại phải nộp hồ sơ mới.',
          'Pipeline Status và 2 flag **giữ nguyên** giá trị tại thời điểm Recall để Admin tra cứu.',
        ],
      },
      {
        kind: 'open',
        text: '**NTD thấy gì với một CV đã Recall.** NTD không thao tác được với CV đã Recall; còn cách hiển thị thì chưa chốt: **gỡ thẻ và gửi thông báo**, hay **giữ thẻ xám, khoá thao tác**.',
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
          ['**Hồ sơ Recall**', '**Không thao tác được** (cách hiển thị chưa chốt — §4).'],
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
          ['4', '**Application Withdrawn**', 'CV thu hồi', 'CV đã gửi rồi bị thu hồi. Kết thúc, ứng viên phải nộp hồ sơ mới'],
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
          ['**NTD**', 'Khi hồ sơ bị thu hồi', 'Thông báo bỏ qua hồ sơ — **chờ xác nhận** kênh và cách hiển thị'],
        ],
      },
      {
        kind: 'diagram',
        id: 'cm-notify',
        heading: 'Ai được báo',
      },

      /* ── §10 Talent pool (build 08/10) ──────────────────────────────────── */
      { kind: 'h', text: '§10 · Tab Talent pool — /applicants?tab=talent-pool', path: '/applicants?tab=talent-pool' },
      {
        kind: 'p',
        text:
          '**Các folder ứng viên đã lưu, mỗi folder một pipeline** — mặc định mở ở *Board view*. Cột trái hiện *Your folders* và hai *Holding boxes*: **Unlocked** (người bạn đã trả tiền mở nhưng chưa xếp vào đâu) và **Archive** (người bạn đã gỡ khỏi một folder). Bảng của một folder: **Saved** (ghim đầu — *“Nobody here has been paid for. Moving a card out spends credits.”*) · các cột của bạn (mặc định *Interview 1 · Interview 2*) · **Final acceptance** (ghim cuối). Mỗi thẻ hiện kinh nghiệm, công ty gần nhất, bậc học cao nhất, vị trí mong muốn — **người chưa mở khoá thì không lộ tên công ty và ngày tháng** công việc.',
      },
      {
        kind: 'p',
        text: '**Trên tab Talent pool, trả tiền khi DI CHUYỂN, không phải khi LƯU.** Lưu là miễn phí, thẻ vào cột *Saved*, vẫn che. Kéo thẻ ra khỏi *Saved* là mở khoá người đó — giá mở khoá của CV (mặc định 1 credit), một lần, vĩnh viễn. Người **tự nộp đơn** ở tab Jobs thì không tốn gì: nộp đơn chính là đồng ý cho xem.',
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
          ['7', '**Nộp đơn** bằng một CV', 'Ứng viên', 'Hồ sơ *Sent* → thẻ ở cột **Application Received**, liên hệ mở sẵn — hoặc *Not Sent* (ứng viên thấy *In Review*) nếu CV đang chờ', 'Web làm mờ mọi CV *Unfinished*. NTD mở CV lần đầu → flag Viewed, ứng viên thấy *Application Viewed*.'],
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
          '**Ô lớn là giá trị nội bộ, dòng nhỏ là thứ người ta thấy.** *Not sent*, *Recall* là thứ hệ thống lưu và **admin** đọc. Dòng nhỏ dưới mỗi trạng thái là nhãn ứng viên thấy ở **My CVs**; ở *Việc đã ứng tuyển* họ thấy một trong 9 trạng thái — với file tải lên đang nghi ngờ là **In Review** (*Candidate management §6*). Nhầm các tầng này là cách đọc sai hay gặp nhất.',
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
        note: 'Cột *My CVs* theo build 08/10; cột *Việc đã ứng tuyển* và *Nhà tuyển dụng* theo tài liệu Candidate management 14/10. Nhà tuyển dụng **không bao giờ** thấy chữ của người duyệt hay lý do Reject / Recall.',
        cols: ['Trạng thái CV', 'Ứng viên — My CVs', 'Ứng viên — Việc đã ứng tuyển', 'Nhà tuyển dụng'],
        rows: [
          ['**Đạt** (Qualified)', 'Không nhãn', '*Application Received* → *Viewed* / *Saved* → *In Process* / *Passed* / *Not This Time*', 'Thẻ ở cột *Application Received* của Kanban, rồi theo cột NTD kéo'],
          ['**Chờ duyệt** (tải lên — Cannot Read / Not Enough Information)', '*Unfinished* nếu lần parse thiếu mục; không nhãn nếu parse đủ hoặc chưa xong', '**In Review**', 'Không thấy hồ sơ — nó chưa được gửi'],
          ['**Unfinished** (Saramin CV)', '*Unfinished* + *Completion N%* + nút *Complete CV*', 'Không có hồ sơ — nút Nộp bị khoá', 'Không có gì'],
          ['**Từ chối** (Rejected)', 'Nhãn **Can’t read** (mọi lý do), lời nhắn khi rê chuột; trong trang sửa: *This CV wasn’t approved* + lời nhắn, **không nút**', 'Hồ sơ chưa gửi: **Invalid Application**. Hồ sơ đã gửi bằng phiên bản này: **Application Withdrawn**', 'Hồ sơ đã Recall: **không thao tác được** (cách hiển thị chờ xác nhận). Lượt mở khoá đã trả được hoàn credit'],
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
          ['05/10', 'Lan nộp đơn vào tin của X bằng chính CV đó', '—', 'Thẻ mới ở tab **Jobs** của X, cột *Application Received*, **không tốn credit**; X mở CV → Lan thấy *Application Viewed*'],
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
          '**Cần chốt với khách.** (1) **Bật máy quét trên production khi nào, ai trực hàng đợi, SLA bao lâu** (DEBT D-RES-19). (2) **Kho tìm kiếm có lọc CV chưa Đạt / bị từ chối không** — requirement nói có, build từ 29/09 nói không. (3) **Tự bật hiển thị** cho file tải lên đầu tiên — có được coi là đồng ý của ứng viên không. (4) Thẻ kết quả `/search` lộ tên công ty / trường. (5) Màn **thay file** (version mới) phía ứng viên chưa có, nên toàn bộ luật version hôm nay chưa ai chạm tới. (6) *Total experience* theo từng CV: backend xong 08/10 (PR #783), web chưa nối. (7) **Nộp đơn bằng file tải lên chưa đạt** — requirement cho nộp rồi giữ đơn, web chặn ở picker: chọn một (§5). (8) **Application status** — tài liệu 14/10 chốt **3 giá trị** (*Not Sent · Sent · Recall*); build 08/10 còn *Rejected* theo từng đơn, cần bỏ (§3). (9) **Gỡ một quyết định** — requirement cho, server cấm (§3). (10) **Ba lỗi version** phải sửa **trước** khi mở màn thay file (§6).',
      },
    ],
  },
}
