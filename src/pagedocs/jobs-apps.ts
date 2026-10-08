import type { PageDoc, ModuleDoc } from '../docs'

/*
 * Job management + Application management — page keys `jobs`, `how-to-apply`, `applicants`,
 * plus the 'Application management' module page.
 *
 * Each PAGE entry is a FULL replacement for PAGE_DOCS[key] (spread over it). `jobs` keeps the
 * existing Notion-ordered entry (§0–§7) verbatim apart from three corrections, and adds §8–§10.
 * `applicants` and `how-to-apply` are rewritten around what the build does, keeping every
 * existing claim that is still true.
 *
 * Source of truth: origin/dev, checked 08/10/2026 —
 *   saramin-vn-admin 45954108 · svn-be ee1db5ea9 · svn-web d8a43a11.
 * Key files: admin src/modules/recruitment/applicants/*, src/i18n/messages/en/applicants.json,
 * src/configs/admin-pages.config.ts; svn-be JobApplication, ApplicationStatus,
 * ApplicationScreeningStatus, EmployerStageView, WebApplyService, WebApplyController,
 * AdminApplicationScreeningService, CandidateCvModerationService, CandidateLifecycleEffectsAdapter,
 * AdminCandidateService, CandidateAuthService, CandidateDataStopNotifier, EmployerNoticeAnnouncer,
 * CorporateApplicantController, RejectionReason; svn-web features/jobs/detail/ui/apply-button.tsx,
 * features/my-applications/*, features/hiring/applicant/lib/applicant-copy.ts.
 */

export const JOBS_APPS_PAGE_DOCS: Record<string, PageDoc> = {
  /* ── Jobs ── the existing Notion-ordered entry (§0–§7) kept verbatim except three
     corrections (Schedule/Open sweep timing, Closed → company-site Reopen, the Notion warn),
     plus two watch bullets and §8–§10 from the build. */
  jobs: {
    logic: [
      '**Tin đăng TIÊU quota, không bao giờ TẠO ra quota.** Quota có khi CRM phát hành hoá đơn GTGT cho một product (*Products & Packages*). Tin chọn đúng hoá đơn đó và một dòng đã trả tiền trên nó. Không chọn hoá đơn thì chỉ còn product **Free** — và **chỉ HQ** đăng được tin Free.',
      '**Lưu nháp không tốn gì; Post tốn một slot.** Nháp cần 3 field (Company · Title · Working location); Post cần **10 field**, và thanh bên liệt kê những gì còn thiếu. Post thất bại (hết quota, tier hết chỗ) thì **bản nháp vẫn còn**.',
      '**Status và Exposure là hai công tắc khác nhau.** Status là vòng đời Draft → Schedule → Open → Closed. Exposure là On / Off và chỉ có nghĩa khi tin Open. Ứng viên thấy tin **chỉ khi Open + Exposure On + công ty Active** (server còn đòi công ty **có MST** — xem §5).',
      '**Sản phẩm quyết định tin xuất hiện ở đâu và cao tới đâu** — thời lượng hiển thị, các khu vực, vị trí trong sắp xếp *Recommended*, quyền có ảnh thẻ, tất cả lấy từ *Main product* chọn ở Posting setup. Tin **kế thừa**, và **không field nào trên tin ghi đè được**. Bậc **cố định từ lúc đăng** — *Upgrade tier* đã bỏ (28/09/2026).',
      'Không còn tab **In review** từ 09/09/2026 — tin của công ty lên thẳng, y như tin HQ đăng, đúng như requirement luôn ghi.',
    ],
    how: [
      'Kiểm công ty **Active**, có **MST**, và **đã Verified** (chưa Verified thì phía công ty còn không lưu nháp được).',
      '**New job** → mục **Posting setup**: chọn công ty → chọn **Invoice** (chỉ hiện hoá đơn **đã phát hành, còn quota đăng tin** của chính công ty đó) → chọn **Main product**.',
      'Điền **Job information** — chọn **Job category TRƯỚC** (hoặc dùng **Quick pick** chọn ngành, vị trí, chuyên môn trong một bảng), vì job roles và specialisations bên dưới lấy theo nó.',
      'Chọn **người nhận hồ sơ** ở mục Applications — người đầu tiên là tên ứng viên nhìn thấy.',
      'Viết **Description**, **Requirements** (bản VI bắt buộc) và **Benefits** (tuỳ chọn).',
      'Để trống **Publish at** = đăng ngay; đặt giờ tương lai = Schedule.',
      '**Post.** Kiểm lại slot của công ty ở **CRM → Customers → Products & billing** đã giảm đúng 1.',
    ],
    watch: [
      '**Ba điều kiện để tin hiện công khai: Open · Exposure On · công ty Active** (và công ty có MST). Thiếu một cái là tin vô hình **mà không có lỗi nào hiện ra**. Đây là checklist cho mọi câu hỏi “sao tin không thấy”, theo đúng thứ tự đó.',
      '**Công ty không Active thì tin còn không vào nổi Open** — thao tác bị từ chối. Trên trang chi tiết, nút **Post now** bị khoá sẵn, rê chuột vào thì thấy lý do.',
      '**Không có nút Xoá.** Tin là bản ghi đã trả tiền và đã xuất bản; **Close là kết thúc lượt chạy**. Thấy nút Delete ở đâu thì **đó mới là bug**.',
      '**Expiry date là ngày tin THÔI HIỂN THỊ và tự đóng** (`postingExpiresAt`), không phải hạn nhận hồ sơ — hạn nhận hồ sơ cũ đã bỏ từ 10/08/2026. Admin sửa được ngày này; sửa tay chỉ kéo dài **thời gian hiển thị**, **không** kéo dài phần đẩy hạng của tier.',
      'Post báo **mọi field còn thiếu cùng lúc**, không phải mỗi lần một cái.',
      '**Reopen ở hai nơi làm hai việc khác nhau.** Ở Admin, *Reopen* đưa tin **về Draft** — chưa ai thấy, *Post* lại mới lên. Ở trang công ty, *Reopen* của nhà tuyển dụng đưa tin **thẳng về Open** và trừ ngay một slot. Không đường nào mở lại miễn phí, và **không thao tác nào hoàn slot** (xem §10).',
      '**Tin đóng không làm mất đơn.** Đơn đã nhận vẫn nằm ở *Applications* và trên bảng của nhà tuyển dụng; họ xử lý tiếp bình thường sau khi tin *Closed*.',
    ],
    blocks: [
      /* ── The client's Notion page "Job management", section by section ──
         Same numbering as the Notion page (§0 … §7), so a tester holding both
         finds §2.5 in either. Every claim was re-checked against saramin-vn-admin
         origin/dev 45954108 (08/10/2026); where Notion (24/09/2026) is behind the
         build, the build is written as the rule and the Notion wording is named
         in a `warn`. */
      {
        kind: 'p',
        text:
          'Phần dưới đi **theo đúng trang Notion *Job management*** của khách (viết trên dev 24/09/2026), cùng số mục (§0 … §7), để người cầm cả hai tài liệu tìm được cùng một chỗ. Mọi điều đã được **đối chiếu với build** (`saramin-vn-admin` `origin/dev`, 08/10/2026). Chỗ Notion **đi sau build**, trang này ghi theo build và có hộp *lưu ý* nói rõ Notion ghi gì.',
      },
      {
        kind: 'table',
        heading: 'Bốn trang Notion nói tới',
        cols: ['Trang', 'URL', 'Định nghĩa cái gì'],
        rows: [
          ['**Jobs**', '`/recruitment/jobs`', 'Mọi tin của mọi công ty — tìm một tin, đọc trạng thái, ẩn / hiện hoặc đóng nó'],
          ['**New job posting**', '`/recruitment/jobs/new`', 'Đăng hộ công ty: hoá đơn và product nó tiêu, rồi tới nội dung ứng viên đọc'],
          ['**Job detail**', '`/recruitment/jobs/:id`', 'Một tin đang làm gì lúc này — tier, hiển thị, bộ đếm, add-on, đóng / mở lại'],
          ['**Jobseeker site**', '`dev.svn.topdev.asia`', 'Nơi tin xuất hiện — bước kiểm cuối cùng'],
        ],
      },
      {
        kind: 'warn',
        text:
          '**Từ 24/09 tới 08/10 build đã đổi khá nhiều — Notion chưa theo kịp.** Đã bỏ: **Upgrade tier** (28/09). Đã đổi: **Benefits là ô chữ tự do** như Description, không còn danh sách chọn điền sẵn từ công ty (SRM-742) · trình soạn thảo cho **in đậm, đánh số, gạch đầu dòng 2 cấp** (SRM-743) · **Expiry date** là ngày tin thôi hiển thị và **admin sửa được** (SRM-638, SRM-741) · picker Invoice / Main product **ẩn hẳn dòng hết quota** (SRM-767) · tin **Closed mở lại được** (về Draft). Mới có: **Add add-on** cho tin đang Open (SRM-740) · **Post anonymously** (SRM-737) · ô **Locations** (danh sách tỉnh thành) · **Job level chọn tới 3** (SRM-736) · **Quick pick** (SRM-735) · **Edit ngay từ danh sách** và **đổi công ty khi tin còn là Draft** (SRM-718, SRM-719) · cột **Link job** (SRM-746) · bốn ô **Overview** trên danh sách.',
      },
      {
        kind: 'p',
        text:
          '**§0 · Các mảnh ghép khớp nhau thế nào** — đọc một lần: mỗi màn hình bên dưới là một bước trong chuỗi *hoá đơn cấp quota → tin tiêu một slot → product quyết định tin hiện ở đâu*. Bốn điều cần nắm nằm ở **Logic phía sau** đầu trang.',
      },

      /* §1 Jobs */
      { kind: 'h', text: '§1 · Jobs', path: '/recruitment/jobs' },
      {
        kind: 'p',
        text:
          '**Là gì.** Danh sách gốc của mọi tin tuyển dụng của mọi công ty, mỗi dòng một tin, mới nhất trước. HQ đọc nó để giám sát; trang công ty hiện đúng những dòng này nhưng chỉ của một công ty. Tab theo vòng đời: **All · Draft · Schedule · Open · Closed** — không còn tab *In review*. Danh sách **phân trang phía server** (giới hạn 500 dòng Notion nhắc đã không còn).',
      },
      {
        kind: 'table',
        heading: 'Những cột cần hiểu',
        cols: ['Cột', 'Nghĩa'],
        rows: [
          ['**Job ID**', 'Link **vào console** — mở trang chi tiết. Tiêu đề hay trùng; ID mới chỉ đúng một tin.'],
          ['**Job title**', 'Đi **thẳng ra tin công khai** trên site jobseeker (tab mới). Chỉ tin Open — tiêu đề tin Draft / Schedule là chữ thường, xem trước từ trang chi tiết.'],
          ['**Link job**', 'Đường dẫn công khai của tin (bản VI), bấm được, **chỉ tin Open**. Để CS / Sales kiểm nội dung và chép link mà không phải mở form sửa.'],
          ['**Category · Product · Job type**', 'Ngành từ cây phân loại. **Product** là bậc tin chạy. **Job type** là *Paid* hoặc *Free* — Free chỉ khi product được đánh dấu Free; mã bậc catalogue không nhận ra thì đọc là *Paid*. Tin đã **Closed vẫn giữ** Product và Job type của lượt chạy cuối (SRM-759).'],
          ['**Company · Company ID · Type of customer**', '`CO-XXXXXXX`. *New / Existing / Churn* là sự thật về **công ty** (Existing từ hoá đơn điện tử GTGT đầu tiên), không phải về tin.'],
          ['**Job location**', 'Các văn phòng của công ty mà tin tham chiếu, gộp theo tỉnh.'],
          ['**Created by**', '*Company* (HR của họ tự đăng) · *Admin* (HQ đăng hộ). **Không bên nào đi qua bước duyệt.**'],
          ['**Status · Exposure**', 'Công tắc Exposure **chỉ hiện ở dòng Open**. Status khác thì ô ghi *“Exposure applies only to open jobs”*.'],
          ['**Expiry date**', 'Ngày tin **thôi hiển thị và tự đóng**. Có chip **Edited** khi admin đặt tay. Ô *Expiring · 7 days* đếm theo đúng ngày này.'],
          ['**Posted**', 'Ngày đăng.'],
          ['**Views · Saves · Applied**', 'Ba bộ đếm thật duy nhất. Không có số nào suy diễn.'],
          ['**Sent CV · Not sent CV**', 'Hai phép đếm **độc lập**: *Sent* = đã chuyển tới nhà tuyển dụng, *Not sent* = còn chờ HQ duyệt CV. **Không phải chia đôi Applied** — đơn bị thu hồi hoặc bị từ chối không nằm ở cột nào, nên **1 / 1 bên cạnh Applied 3 là đúng**. *Not sent* khác 0 là việc tồn của HQ, tô màu cảnh báo.'],
        ],
      },
      {
        kind: 'list',
        heading: 'Lọc, sắp xếp, thao tác',
        items: [
          '**Ô tìm kiếm** khớp tiêu đề, mã tin và tên công ty. Lọc ngay trên **đầu cột** (tiêu đề, Job ID, công ty, ngành, product, người tạo, exposure, job type, địa điểm, loại khách) và theo **Created between**. Sắp xếp: *Newest · Most viewed · Most applied · Most saved · Expiring soon*.',
          'Nút **Overview** mở bốn ô: *Expiring · 7 days* (cuộc gọi gia hạn) · *Open, no applicants* (live 7+ ngày mà chưa ai nộp — tin không hiệu quả) · *Applications · 7 days* · *Paid and running*.',
          '**Chọn cột** để ẩn cột không cần. **Export** tải file Excel — file do server dựng, **không theo cột đang hiện**, và có thêm Package, Job type, Link job.',
          'Menu **⋮** ở mỗi dòng: **Edit** cho **mọi** trạng thái; dòng Open thêm **Show publicly / Hide from public** (công tắc Exposure) và **Close posting**. Đóng tin hỏi một lần: *“It will stop accepting applications and come off the public site immediately.”*',
          'Tick các dòng **Open** rồi bấm **Set expiry date (n)** để đặt **một ngày hết hạn cho nhiều tin**: tin hiện tới **hết ngày đó** (giờ Việt Nam) rồi tự đóng. Dòng nào không còn Open thì bị bỏ qua, thông báo nói rõ bao nhiêu.',
        ],
      },
      {
        kind: 'warn',
        text:
          '**Không có xoá.** Tin là bản ghi đã trả tiền, đã xuất bản; **Close** là kết thúc. Nút xoá ở bất kỳ đâu mới là bug, không phải việc thiếu nó.',
      },
      {
        kind: 'list',
        heading: 'Thử bằng cách',
        items: [
          'Ẩn một tin Open → tin rời **mọi** khu vực trên site jobseeker sau một lần tải lại; status **vẫn Open**.',
          'Bấm tiêu đề một tin Draft → chữ thường, không có link; bấm **Job ID** của chính tin đó → mở trang chi tiết trong console.',
          'Một tin có *Applied 3, Sent CV 1, Not sent 1* → **đúng, không phải bug**: một đơn đã bị thu hồi hoặc bị từ chối.',
          'Tick hai tin Open + một tin vừa Closed → **Set expiry date** → hai tin đổi ngày, có chip *Edited*; thông báo ghi 1 tin bị bỏ qua.',
        ],
      },
      {
        kind: 'shot',
        src: '/shots/50-jobs-list.jpg',
        where: 'Admin',
        caption: 'Danh sách tin. Tab trạng thái là **4 giá trị**: `DRAFT · SCHEDULE · OPEN · CLOSED`.',
        note: 'Ảnh chụp 08/09/2026 — trước khi có cột *Link job*, ô checkbox và nút *Overview*. **Không còn hàng đợi duyệt tin và không còn trạng thái Archived** (svn-be V468, 09/09/2026).',
      },

      /* §2 New job posting */
      { kind: 'h', text: '§2 · New job posting', path: '/recruitment/jobs/new' },
      {
        kind: 'p',
        text:
          '**Là gì.** Một form, bảy mục: **1** Posting setup · **2** Job information · **3** Applications · **4** Job content · **5** Card artwork · **6** Candidate expectation · **7** Internal (HQ only). Thanh bên phải **tính điểm** — *N of 10 done to post* — với danh sách **Still missing**: chip màu chặn **lưu**, chip xám *· to publish* chặn **Post**.',
      },
      {
        kind: 'p',
        text:
          '**Trang công ty có cùng form, khác hai chỗ:** công ty cố định là nhà tuyển dụng đang đăng nhập, và **không có ô chọn hoá đơn** — nhà tuyển dụng đăng từ các product công ty đang giữ, và **không bao giờ thấy bậc Free**.',
      },
      {
        kind: 'table',
        heading: '§2.1 · Posting setup — phần tiền',
        cols: ['Field', 'Nghĩa', 'Thử bằng cách'],
        rows: [
          ['**Company**', 'Tìm theo tên hoặc ID (`CO-XXXXXXX`). Thẻ tóm tắt hiện ID, trụ sở và link *Open company →*. Công ty **không có MST** hoặc **đã archived** vẫn lưu nháp được nhưng **không lên live được** — form nói rõ. **Đổi công ty được khi tin còn là Draft và chưa có đơn ứng tuyển**; đổi thì xoá địa điểm, hoá đơn, product và người nhận hồ sơ của công ty cũ.', 'Chọn công ty chưa có MST → Post bị từ chối, *Save as draft* vẫn chạy. Mở một tin Open → ô Company bị khoá, có ghi lý do.'],
          ['**Invoice**', 'Chỉ hoá đơn **đã khai (declared)**, **còn quota đăng tin**, mới nhất trước — và chỉ của **chính công ty này**. Đơn chưa trả tiền không mua được gì. Chọn *— none (Free job) —* cho tin miễn phí.', 'Chọn hoá đơn của công ty A rồi đổi sang công ty B → hoá đơn của A phải biến mất.'],
          ['**Main product**', 'Bậc tin chạy, kèm thời lượng hiển thị (*30 days*). Có hoá đơn thì chỉ còn **các dòng đăng tin của hoá đơn đó mà công ty còn quota** — dòng hết slot, hết hạn hoặc là dịch vụ thủ công (*Quảng cáo Facebook*) bị **ẩn hẳn**, không phải hiện mờ. Dòng gợi ý đổi từ *Free tier (no invoice)* sang *This invoice’s job-posting products the company still has quota for* — đó là phép kiểm màn hình nối dây đúng.', 'Chọn hoá đơn → danh sách đúng bằng các dòng còn quota của hoá đơn đó. Đổi hoá đơn → product cũ bị **xoá**, không giữ lại.'],
          ['**Add-on — Label**', 'Badge gắn trên tin (*Hot job*, *Super star*). Đến từ dòng riêng trên hoá đơn, hoặc từ một product trên hoá đơn có kèm nó.', 'Chọn add-on trước Main product → bị chặn: *“Pick an invoice and a main product first”*.'],
          ['**Add-on — Display placement**', 'Ghi nhận việc mua vị trí cao cấp. Cùng điều kiện như Label. **Hiện mới trừ quota, chưa đổi gì trên site** — registry vị trí chưa có khối cho add-on.', 'Như trên.'],
          ['**Publish at**', 'Để trống = đăng ngay. Giờ tương lai = **Schedule**; đổi sau thì dời lịch.', 'Đặt giờ trong quá khứ → bị từ chối: *“Publish time must be in the future.”*'],
          ['**Exposure**', 'On / Off, độc lập với status.', 'Post với Exposure Off → status Open, **không thấy trên site**.'],
          ['**Post anonymously** *(mới)*', 'Ứng viên thấy *“Saramin’s Client”* và logo Saramin thay cho công ty — không tên, logo, địa chỉ, thông tin hay tag công ty. **Hồ sơ vẫn về công ty.** Mọi product, kể cả Free; sửa được cả khi tin Open. Console vẫn hiện công ty thật, trang chi tiết có tag **Anonymous**.', 'Bật → Post → trang công khai không có tên công ty; trong console tin có tag *Anonymous*.'],
        ],
      },
      {
        kind: 'p',
        text:
          '*“Products come from the selected invoice. With no invoice, only free products are offered.”* — dòng chữ dưới ô chính là luật. **HQ đăng tin Free cho một công ty là cách duy nhất có tin miễn phí**; trang công ty không bao giờ chào bậc đó. Khi không bậc nào của công ty dùng được, form nói thẳng tin **chưa đăng được** và trỏ sang việc cấp quota trên trang công ty.',
      },
      {
        kind: 'shot',
        src: '/shots/53-job-new-posting-setup.jpg',
        where: 'Admin',
        caption: 'Form tạo tin, mục **Posting setup** — nơi tin gặp phần đã bán.',
      },
      {
        kind: 'shot',
        src: '/shots/54-job-po-selected.jpg',
        where: 'Admin',
        caption: 'Chọn công ty rồi chọn **Invoice**.',
        note: 'Ảnh chụp 08/09/2026, khi ô này còn tên **PO**. Build giờ chọn **hoá đơn** (*Invoice*), và chỉ hiện hoá đơn còn quota đăng tin.',
      },
      {
        kind: 'shot',
        src: '/shots/55-job-main-product-from-po.jpg',
        where: 'Admin',
        caption: 'Sau khi chọn hoá đơn, **Main product chỉ còn các dòng đăng tin của hoá đơn đó mà công ty còn quota**.',
        note: 'Không chọn hoá đơn thì danh sách chỉ còn các product **Free** — lane “HQ đăng hộ miễn phí”, không trừ quota của ai.',
      },
      {
        kind: 'table',
        heading: '§2.2 · Job information — những gì ứng viên lọc và tìm',
        cols: ['Field', 'Nghĩa'],
        rows: [
          ['**Title**', 'VI **bắt buộc** (đây là thứ chặn Post); EN tuỳ chọn, thiếu thì lấy bản VI. Tối đa 120 ký tự.'],
          ['**Quick pick** *(mới)*', 'Một bảng chọn **ngành, vị trí, chuyên môn** cùng lúc, có ô tìm (không dấu cũng tìm được). Bấm *Apply* chỉ **điền vào ba ô bên dưới** — vẫn sửa được từng ô. *Clear all* rồi *Apply* thì xoá cả ba.'],
          ['**Job category**', 'Chọn **trước** — job roles và specialisations bên dưới là những cái thuộc nó. Bắt buộc để Post; nháp lưu không cần. Đổi ngành thì xoá các vị trí đã chọn theo ngành cũ.'],
          ['**Job roles**', 'Ít nhất 1 để đăng, **tối đa 3**. Theo ngành. Đây là **chức danh công việc** (*Backend developer*), không liên quan gì tới role của admin.'],
          ['**Specialisations**', 'Cấp thứ ba của cây phân loại, chia nhóm theo ngành — *Chuyên môn, Tech stack, Công cụ, Chuyên khoa…* **Tối đa 3 mỗi nhóm**; chip đã chọn ghi *“nhóm · giá trị”* để biết nhóm nào đầy. Tuỳ chọn. Có để **ứng viên lọc**, không để hiển thị.'],
          ['**Work type · Contract type**', 'Hai câu hỏi, hai field. *Work type* = nơi / cách làm (*In office · Remote · Hybrid · Oversea*). *Contract type* = quan hệ lao động (*Fulltime · Part-time · Contract · Internship · Probation · Freelance · Seasonal*). *Fulltime + Remote* là tin bình thường.'],
          ['**Job level · Industry**', 'Job level: *Intern / Fresher / Experienced / Manager / Director and above* — **chọn tới 3** (SRM-736); để trống đọc là *Any level*. Industry là lĩnh vực của công ty, một trục khác với Job category.'],
          ['**Locations** *(mới)*', 'Danh sách **tỉnh thành** tin tuyển ở đó, tối đa 10, chia theo ba miền. **Khác ô Working locations**: ô này nói tin mở ở thành phố nào; site jobseeker đọc nó trước, trống thì mới lấy theo văn phòng. Tuỳ chọn, không chặn Post.'],
          ['**Skills**', 'Tối đa 10, **chỉ chọn từ danh mục** — không gõ tự do. Có vị trí thì *Suggested for the selected roles* lên đầu, rồi tới gợi ý theo ngành, *Other skills* ở dưới; tìm được theo tên khác (gõ *ReactJS* ra *React*). Kỹ năng chữ tự do cũ hiện *“· unrecognised — replace”* và **không bao giờ bị bỏ lặng lẽ**. **Kỹ năng chỉ xếp hạng ứng viên, không loại ai.**'],
          ['**Working locations**', 'Chọn từ **văn phòng của chính công ty**, tối đa 3. Cái chọn đầu tiên là cái hiện trên thẻ và kết quả tìm kiếm (*Shown on cards*). *New location* tạo văn phòng ngay tại chỗ; văn phòng của công ty khác bị từ chối.'],
          ['**Salary range**', '*Negotiable*, hoặc *From / To* — để trống một đầu được: chỉ From → *Từ 15 triệu*, chỉ To → *Lên đến 25 triệu*. Tiền VND hoặc USD (tin USD in thêm dòng *trả bằng VND theo tỉ giá ngày ký hợp đồng*). **Show to Job Seekers** quyết định có in con số ra không.'],
        ],
      },
      {
        kind: 'p',
        text:
          '**§2.3 · Applications — ai nhận hồ sơ.** Một ô chọn trong **người liên hệ của công ty**. Mọi người được chọn đều **nhận hồ sơ qua email**; người chọn đầu tiên còn là **tên ứng viên thấy trên tin** (*Candidates will see: …*). Lựa chọn được **chép**, không liên kết — đổi tên người liên hệ ở CRM sau này **không** viết lại tin đang chạy. Người liên hệ **chưa có email** thì mở ra để sửa thay vì được chọn. *New contact* tạo người mới ngay tại chỗ.',
      },
      {
        kind: 'p',
        text:
          '**§2.4 · Job content — thứ ứng viên đọc.** Ba ô **Description**, **Requirements** và **Benefits**, mỗi ô có tab VI và EN. Description và Requirements cần bản **tiếng Việt** để Post; Benefits tuỳ chọn; bản tiếng Anh thiếu thì lấy bản tiếng Việt. Trình soạn thảo cho **đoạn văn, gạch đầu dòng hai cấp** (Tab thụt vào, Shift+Tab lùi ra), **đánh số** và **in đậm** — không nghiêng, không link, không tiêu đề, để mọi tin trên site cùng một kiểu chữ. Dán từ Word vào thì sạch định dạng.',
      },
      {
        kind: 'warn',
        text:
          '**Notion đi sau build ở §2.4 và §2.2.** (1) Notion ghi trình soạn thảo “chỉ có cấu trúc — không in đậm”: từ 28/09 build cho **in đậm và gạch đầu dòng 2 cấp** (SRM-743). (2) Notion mô tả **Benefits** là danh sách chọn, *điền sẵn từ bộ phúc lợi của công ty*, mỗi dòng một loại cố định + mô tả, có nút *Back to company defaults*: build đã thay bằng **một ô chữ tự do** dưới Job content (SRM-742) — tin mới **không còn điền sẵn**, các phúc lợi cũ đã được gộp thành chữ, không mất gì.',
      },
      {
        kind: 'table',
        heading: '§2.5 · Card artwork — chỉ hiện cho thứ product có bán',
        note: 'Mục này **chỉ xuất hiện khi Main product đã chọn có bao gồm nó**; tin Basic không có mục artwork và sẽ không bao giờ có. Artwork **không bắt buộc để Post** — khung trống thì thẻ để trơn, không chặn.',
        cols: ['Khung', 'Là gì'],
        rows: [
          ['**Card photo (at rest)**', '596 × 258 — thẻ trên các dải trả phí. Chọn từ **thư viện ảnh có bản quyền** (ảnh hợp ngành lên trước, *show all* để mở rộng) hoặc tải lên.'],
          ['**Card photo (on hover)**', '600 × 1120 — thẻ cao khi rê chuột.'],
          ['**Short description**', 'Tối đa 400 ký tự, hiện khi rê chuột.'],
          ['**Card tag**', 'Mỗi lúc một pill, xoay qua ba nhóm — **Company tag** (ngày 1–10), **Job tag** (ngày 11–20), **Benefit tag** (ngày 21–30). Chọn từ danh mục **Job tags** theo **tiêu chí** của nó, không gõ.'],
        ],
      },
      {
        kind: 'table',
        heading: '§2.6 · Candidate expectation — dùng để ghép và lọc, không hiện như yêu cầu',
        cols: ['Field', 'Luật'],
        rows: [
          ['**Number of headcount**', 'Tuỳ chọn.'],
          ['**Years of experience (min – max)**', '**Bắt buộc** — chọn từ các mốc trong master data (*No experience, Less than 1 year, từng năm, Over 20 years*), hoặc tick **No experience required**: ghi 0 không trần và in *“Không yêu cầu kinh nghiệm”* trên trang việc làm.'],
          ['**Minimum education level**', '**Bắt buộc** — trang việc làm luôn in nó. Tin mới **mặc định *No requirement***; các mức xếp theo thang (*No requirement, High school, Vocational, College, Bachelor, Master, PhD*).'],
          ['**Nationality · Gender · Age**', 'Tuỳ chọn, mỗi ô có công tắc **Show to Job Seekers** riêng. **Nhạy cảm về pháp lý** trong tin tuyển dụng ở Việt Nam — cần khách quyết có thu và có hiển thị không. *Marital status* đã bỏ từ 21/09.'],
          ['**Cover letter requirement**', '*Always required · Optional · Never required*.'],
        ],
      },
      {
        kind: 'p',
        text: '**§2.7 · Internal (HQ only).** Ghi chú **không bao giờ hiện công khai** — chỉ người vận hành HQ đọc được.',
      },
      {
        kind: 'table',
        heading: '§2.8 · Lưu nháp và Post',
        cols: ['', 'Save as draft', 'Post'],
        rows: [
          ['Cần', 'Công ty · Tiêu đề (VI) · Địa điểm làm việc', 'Ba cái đó **cộng** Main product · Job category · Job role · Skill · Lương · Description (VI) · Requirements (VI) — **10 field**'],
          ['Tốn', 'Không gì cả', '**Một slot** của Main product, trừ ngay khi tin lên Open (hoặc được hẹn lịch)'],
          ['Thất bại thì', '—', 'Nháp được giữ. Hết quota → cấp / bán thêm rồi thử lại ngay trên màn hình đó. Tier hết chỗ → chọn tier khác'],
        ],
      },
      {
        kind: 'p',
        text:
          'Post báo **mọi field còn thiếu cùng lúc**. Trình duyệt còn **tự lưu**: tải lại trang giữa chừng sẽ hiện *Unsaved changes recovered* với *Restore* và *Discard*. Rời trang khi còn chỗ chưa lưu thì form hỏi trước.',
      },

      /* §3 Job detail */
      { kind: 'h', text: '§3 · Job detail', path: '/recruitment/jobs/:id' },
      {
        kind: 'p',
        text: '**Là gì.** Một màn hình trả lời câu hỏi *tin này đang làm gì lúc này*.',
      },
      {
        kind: 'table',
        heading: 'Các khung',
        cols: ['Khung', 'Đọc để biết'],
        rows: [
          ['**Posting state**', '*Exposure*, **Current tier**, **Add-ons** (các add-on đang chạy, *“HOT JOB TAG · until 27/11/2026”*), *Publish at*, **End date** (ngày giờ tin thôi hiển thị; chip *Edited* khi admin đặt tay; tin Open có biểu tượng bút để sửa). *Current tier* phải bằng Main product chọn ở Posting setup — đây là nơi lộ ra một product chọn sai.'],
          ['**Engagement**', '*Views · Saves · Applications* — ba bộ đếm thật.'],
          ['**Classification · Hiring brief**', 'Tin đòi hỏi gì, nói lại — gồm mọi *Job level* và dòng *Locations*.'],
          ['**Card artwork**', 'Các khung tin vẽ trên dải trả phí. **Chỉ có ở các bậc trên cùng**; không có artwork thì khung không hiện, và đó là bình thường.'],
          ['**Nội dung**', 'Description, Requirements và Benefits, tab VI / EN.'],
        ],
      },
      {
        kind: 'table',
        heading: 'Thao tác ở đầu trang — tuỳ trạng thái',
        cols: ['Thao tác', 'Khi nào', 'Làm gì'],
        rows: [
          ['**Edit**', 'Mọi trạng thái', 'Mở form. Tin cũ có cảnh báo một dòng: *“Saving replaces the description; structured details carried over from the previous admin are not kept.”*'],
          ['**Applications (N)**', 'Mọi trạng thái', 'Danh sách ứng viên của tin này.'],
          ['**Preview draft**', 'Draft · Schedule', 'Mở tin chưa đăng đúng như ứng viên sẽ thấy. Tin Open thì xem trang thật từ danh sách.'],
          ['**Post now**', 'Draft · Schedule', 'Đăng. Chưa chọn bậc thì mở hộp *Choose a posting tier*. Công ty thiếu MST hoặc không Active thì nút **khoá sẵn**, rê chuột thấy lý do.'],
          ['**Add add-on** *(mới)*', 'Open, đang có lượt chạy', 'Thêm *Display placement* và / hoặc *Label* cho tin đang chạy — xem bảng dưới. Chỉ ở Admin; trang công ty không có.'],
          ['**Close job**', 'Open', 'Ngừng nhận hồ sơ và gỡ tin khỏi site **ngay lập tức**.'],
          ['**Reopen**', 'Closed', 'Đưa tin **về Draft** — vẫn chưa ai thấy. **Đăng lại thì tốn một slot.**'],
        ],
      },
      {
        kind: 'table',
        heading: 'Add add-on — thêm badge / vị trí cho tin đang chạy',
        cols: ['Điều', 'Luật'],
        rows: [
          ['Lấy từ đâu', 'Chọn một **hoá đơn đã khai** còn add-on mà tin này nhận được; mặc định là hoá đơn của chính tin. Add-on miễn phí luôn được.'],
          ['Mỗi loại một cái', 'Loại nào **đang chạy** thì bị khoá, ghi *“running until …”*; hết hạn rồi mới thêm được cái khác. Đầu hộp thoại liệt kê các add-on đang chạy.'],
          ['Chạy bao lâu', 'Bắt đầu **ngay**, chạy đủ số ngày của nó, nhưng **không quá ngày tin hết hạn**. Tin hết trước thì hộp thoại **cảnh báo** (*“The posting ends in 3 days — … will only run 3 days”*) — vẫn cho làm.'],
          ['Giá', 'Bước xác nhận ghi từng add-on *“uses 1 unit from invoice X”* (hoặc *free*) và ngày kết thúc. **Không hoàn tác, không hoàn tiền.**'],
        ],
      },
      {
        kind: 'warn',
        text:
          '**Notion vẫn mô tả *Upgrade tier* — build đã bỏ nó từ 28/09/2026.** Hộp thoại nâng bậc (*Currently published under X*, bốn trạng thái *Available / No slots left / Not purchased / Expired*) **không còn**; bậc của tin **cố định từ lúc đăng**. Muốn đọc quota của khách theo từng bậc thì xem **CRM → Customers → Products & billing**. Bốn trạng thái đó giờ chỉ còn trong hộp *Choose a posting tier* khi Post một nháp chưa chọn bậc. Notion cũng ghi *Posting valid until …* ở đầu trang — nó đã chuyển thành dòng **End date** trong khung *Posting state*.',
      },
      {
        kind: 'p',
        text:
          '**Post, Add add-on và Close đều có chặn bấm đúp.** Nếu bấm đúp nhanh mà quota bị trừ hai lần thì báo bug.',
      },
      {
        kind: 'shot',
        src: '/shots/51-job-detail.jpg',
        where: 'Admin',
        caption: 'Chi tiết một tin. Dòng **Current tier** là bậc tin đang chiếm.',
        note: 'Ảnh chụp 08/09/2026 — trước khi có dòng *Add-ons*, *End date* và nút *Add add-on*; nút *Upgrade tier* trong ảnh **đã bỏ**. **Exposure độc lập với status**: tin có thể đang `OPEN` mà vẫn không ai thấy, nếu Exposure tắt.',
      },

      /* §4 Status and Exposure */
      { kind: 'h', text: '§4 · Status và Exposure — hai công tắc, một luật' },
      {
        kind: 'table',
        heading: 'Status',
        cols: ['Status', 'Nghĩa', 'Trên trang jobseeker', 'Rời trạng thái khi'],
        rows: [
          ['Draft', 'Đã lưu, chưa từng đăng (hoặc vừa được mở lại)', 'Không có mặt', 'Post → Open, hoặc đặt Publish at tương lai → Schedule'],
          ['Schedule', 'Sẽ đăng vào giờ đã chọn (slot **đã trừ** lúc hẹn)', 'Chưa có mặt', 'Tới giờ → **tự** thành Open — sweep chạy **mỗi phút**. Lúc đó công ty không còn Active + MST thì tin **nằm lại Schedule**, thử lại phút sau (§9)'],
          ['**Open**', 'Đã đăng và còn trong hạn', 'Đang chạy — liệt kê, tìm được, ứng tuyển được **nếu Exposure On**', 'Qua *End date* → **tự** Closed (sweep **mỗi giờ**, nên status có thể trễ tới 1 giờ — nhưng tin thôi hiện và thôi nhận đơn đúng giờ), hoặc bấm Close'],
          ['Closed', 'Hết hạn, hoặc đóng tay', 'Chỉ còn thông báo, không ứng tuyển được', 'Admin: **Reopen** → Draft (đăng lại tốn một slot). Trang công ty: *Reopen* → **Open ngay**, tốn một slot'],
        ],
      },
      {
        kind: 'warn',
        text:
          '**Notion ghi “vòng đời chỉ đi tới, không có mở lại — tin tương tự là một tin mới”.** Build có **Reopen** trên tin Closed (SRM-501): tin quay về **Draft**, không tự lên lại; muốn chạy thì **Post** như một nháp và **tốn một slot mới**. Ở console Admin không có đường nào đưa tin Closed thẳng về Open — **trang công ty thì có**: *Reopen* của nhà tuyển dụng đưa tin lên Open ngay và trừ một slot (§10). *(Sửa 08/10: bản trước của trang này ghi “không có đường nào”, chỉ đúng với Admin.)*',
      },
      {
        kind: 'table',
        heading: 'Exposure',
        cols: ['Status', 'Exposure hiện', 'Nghĩa'],
        rows: [
          ['Open', 'On / Off', 'On = công khai. Off = tin **vẫn Open** (hồ sơ đã nhận vẫn giữ) nhưng biến khỏi **mọi** danh sách, tìm kiếm và dải hiển thị.'],
          ['Draft · Schedule · Closed', '—', 'Không áp dụng — không có gì để hiện.'],
        ],
      },
      {
        kind: 'p',
        text:
          '**Ba điều kiện để công khai: Open và Exposure On và công ty Active** — server còn đòi công ty **có MST** và tin còn trong hạn hiển thị. Thiếu một là tin vô hình, **không có lỗi ở đâu cả**. Tin của công ty không Active còn không vào nổi Open — thao tác bị từ chối. Đây là checklist cho mọi câu hỏi *“sao tin của tôi không hiện”*, theo đúng thứ tự đó.',
      },

      /* §5 Jobseeker site — checked against svn-be 664b8a6ec + svn-web d8a43a11
         (origin/dev, 08/10/2026): PgFtsSearchAdapter / EsJobQueryBuilder,
         search-results-page.tsx, premium-jobs-band.tsx. */
      { kind: 'h', text: '§5 · Tin đi đâu trên site jobseeker' },
      {
        kind: 'table',
        heading: 'Năm câu hỏi',
        cols: ['Câu hỏi', 'Trả lời', 'Đặt ở đâu'],
        rows: [
          ['**Những khu vực nào?**', 'Đúng các khu vực trong *Placement slots* của bậc — một dải trang chủ, dải trong tìm kiếm. Không thiếu, không thừa.', 'Products & Packages → product'],
          ['**Cao tới đâu trong Job search?**', 'Sắp xếp mặc định *Recommended* nhóm kết quả theo **bậc trả phí**, đúng thứ tự *Posting ladder*, cao trước; trong một bậc xếp theo **điểm khớp từ khoá**; hoà thì **auto-refresh** mới nhất trước. *Latest*, *Date posted* và *Closing soonest* bỏ qua bậc.', 'Posting ladder · *Auto-refresh* của product'],
          ['**Lọc ra bằng gì?**', 'Bộ chọn *Select a job* — vị trí, chuyên môn, kỹ năng tick trong đó là **HOẶC**. Mọi bộ lọc khác là **VÀ**: ngành, tỉnh thành, cấp bậc, work type, contract type, lương, kinh nghiệm, học vấn, lĩnh vực, loại công ty. Tỉnh thành đọc ô **Locations** của tin trước; trống thì mới lấy theo văn phòng.', 'Job information'],
          ['**Tìm ra bằng từ khoá nào?**', 'Tiêu đề nặng nhất, rồi kỹ năng, rồi vị trí / ngành / tên công ty / cấp bậc (ngang nhau), nhẹ nhất là nội dung (mô tả + yêu cầu + phúc lợi). Trong nội dung chỉ khớp **đúng cụm từ** đã gõ. Từ chỉ có trong nội dung **vẫn tìm ra tin**, nhưng ở cuối. Chuyên môn **không** phải chữ tìm được. Tin **ẩn danh** không tìm ra bằng tên công ty.', 'Job information · Job content'],
          ['**Bao lâu?**', '*Display duration* của product — tin tự đóng ở *End date*. Admin dời *End date* thì kéo dài **thời gian hiển thị**, không kéo dài phần đẩy hạng của bậc.', 'Products & Packages → product · Job detail → End date'],
        ],
      },
      {
        kind: 'warn',
        text:
          '**Điều kiện công khai trong code chặt hơn ba điều Notion nêu.** Ngoài *Open + Exposure On + công ty Active*, server còn đòi **công ty có MST** và tin **còn trong hạn hiển thị**. Một công ty Active mà thiếu MST thì tin không hiện — và cũng không Post được.',
      },
      {
        kind: 'table',
        heading: '§5.1 · Trang tìm kiếm việc làm — ba khu vực, một tập kết quả, ba thứ tự',
        note: 'Cả ba khu vực **bắt đầu từ cùng một tập**: mọi tin khớp từ khoá. Khác nhau ở **lấy tin nào** và **xếp thế nào**.',
        cols: ['Khu vực', 'Lấy tin nào', 'Xếp theo', 'Quy tắc riêng'],
        rows: [
          ['**(1) Top section** — code gọi là *Top search*, tiêu đề *“{từ khoá} jobs for you”*', 'Tin có product phủ vùng **Top search** trong *Placement slots* — đặt trên **product**, không bao giờ trên tin', '**Làm mới gần nhất** (auto-refresh của product), không phải lần sửa cuối', 'Carousel, tối đa 8 tin. **Chỉ có khi gõ từ khoá**, và chỉ theo từ khoá — **không áp các bộ lọc khác**. Không có tin nào thì khu vực không hiện'],
          ['**(2) Danh sách kết quả** (mặc định *Recommended*)', '**Mọi** tin khớp (và qua bộ lọc)', '1 · Nhóm theo **thang bậc product**, cao trước · 2 · Trong nhóm: **điểm khớp có trọng số** — khớp tiêu đề nặng nhất, nội dung nhẹ nhất · 3 · Hoà thì auto-refresh mới nhất trước', '**Super star và Hot job là badge, KHÔNG đổi thứ tự**. Chọn *Latest* / *Date posted* / *Closing soonest* thì bỏ qua bậc hoàn toàn'],
          ['**(3) Blue zone** — code gọi là *premium band*, tiêu đề *“Lựa chọn tạo nên khác biệt”*', 'Tin khớp mà product nằm trong một **gói Premium** đã duyệt (ô *Premium package* trên Packages)', 'Xen kẽ **theo công ty** (A, B, C, A, B…) để một khách lớn không chiếm hết dải, rồi mới tới làm mới gần nhất', 'Chèn **sau dòng kết quả thứ 3**, **chỉ ở trang 1**, tối đa 12 tin. **Ẩn khi không có tin nào**'],
        ],
      },
      {
        kind: 'warn',
        text:
          '**Notion đi trước build ở §5.1 ba chỗ — trang này ghi theo build.** (1) Notion: Blue zone **ẩn khi chưa đủ 3 tin**, tiêu đề **nêu tên công ty** (*Jobs for MB Bank & NIPPA*). Build: dải **hiện từ 1 tin**, tiêu đề **cố định**. (2) Notion: trong một bậc xếp **cứng** tiêu đề → kỹ năng → ngành → công ty → mô tả. Build: một **điểm có trọng số** (ngành, vị trí, công ty, cấp bậc **ngang nhau**), nên một tin khớp nhiều trường nhẹ có thể vượt tin khớp một trường nặng hơn. (3) Notion liệt kê **phúc lợi** là bộ lọc: server có nhận, nhưng **site không gửi** — Benefits giờ là chữ tự do. Notion cũng ghi ngành nằm trong nhóm HOẶC của *Select a job*; build lọc ngành bằng **VÀ**. Đã đọc thẳng `svn-be` / `svn-web` `origin/dev` ngày 08/10/2026.',
      },
      {
        kind: 'warn',
        text:
          '**“Làm mới gần nhất” là AUTO-REFRESH của product, không phải lần sửa cuối.** Vị trí một tin chỉ nhúc nhích khi product của nó tự làm mới — **không bao giờ vì ai đó sửa tin**. Nếu không thì sáng nào mọi nhà tuyển dụng cũng sửa một dấu phẩy để leo hạng.',
      },
      {
        kind: 'list',
        heading: 'Thử bằng cách',
        items: [
          'Tìm *UX*. Một tin Top job mà product **không** phủ vùng Top search → có trong danh sách kết quả, dưới bậc của nó, nhưng **không** có ở Top section.',
          'Hai tin Top job cùng khớp: tin có từ khoá **trong tiêu đề** thường đứng trên tin chỉ khớp một kỹ năng, kể cả khi tin kia mới được làm mới hơn — vì khớp tiêu đề nặng gấp đôi khớp kỹ năng.',
          'Sửa mô tả một tin khớp → vị trí **không đổi**. Chờ auto-refresh của product → nó nhích lên trong nhóm.',
          'Một tin gói Premium khớp → Blue zone **đã hiện**, sau dòng thứ 3, chỉ ở trang 1. Thêm tin của công ty khác → các công ty xen kẽ.',
          'Tìm có từ khoá **kèm** một bộ lọc tỉnh thành → Top section **không** áp bộ lọc đó (vẫn có thể hiện tin ở tỉnh khác); danh sách kết quả thì có.',
          'Đổi sắp xếp sang *Date posted* → Top job và Basic trộn tự do theo ngày; Top section và Blue zone **không đổi**.',
        ],
      },
      {
        kind: 'shot',
        src: '/shots/61-web-job-bands.jpg',
        where: 'Jobseeker site',
        caption: 'Các dải tin trên site jobseeker — mỗi dải là một khu vực mà bậc của tin phải mua quyền xuất hiện.',
      },

      /* §6 Related */
      { kind: 'h', text: '§6 · Những thứ liên quan khách cần biết' },
      {
        kind: 'table',
        note: 'Không nằm trên các màn hình này, nhưng quyết định việc làm ở đây có chạy hay không.',
        cols: ['Ở đâu', 'Vì sao quan trọng ở đây'],
        rows: [
          ['**Products & Packages → Products**', 'Một product *Job posting* **là** bậc của tin: thời lượng hiển thị, *Placement slots*, auto-refresh, card perks, vị trí trên ladder. Mọi thứ tin kế thừa đều đặt ở đó.'],
          ['**CRM → Invoice**', 'Phát hành hoá đơn GTGT là **lúc quota được cấp**. Ô *Invoice* ở Posting setup chỉ chào hoá đơn đã phát hành.'],
          ['**CRM → Customers → Products & billing**', 'Nơi **kiểm quota trước và sau** một lần Post hoặc Add add-on: từng product còn bao nhiêu slot, hết hạn khi nào.'],
          ['**System → Master data**', 'Ngành, vị trí, chuyên môn · Kỹ năng · Mốc kinh nghiệm · Trình độ học vấn · Job tags — mọi danh sách form chọn từ đó. Thêm một giá trị là **đổi dữ liệu**, không phải một bản phát hành.'],
          ['**Company site → Create job**', 'Bản form của nhà tuyển dụng: công ty cố định, không có ô hoá đơn, bậc chào từ những gì công ty đang giữ kèm quota còn lại, không có bậc Free. Công ty **chưa xác minh** thì còn không lưu nháp được.'],
          ['**Jobseeker site**', 'Bước kiểm cuối: tin hiện **đúng** các khu vực bậc của nó liệt kê, và Exposure Off gỡ nó khỏi **tất cả**.'],
        ],
      },
      {
        kind: 'open',
        text:
          '**Bốn điểm cần chốt với khách.** (1) **Khoá tiêu đề sau 72 giờ** với tin do công ty đăng (HQ miễn) — requirement có, cần xác nhận đã build trên trang công ty chưa trước khi viết test. (2) **Ngành Y tế chưa có job role nào** (nhóm “medical professionals” bị import thành nhóm lọc), nên **bệnh viện không đăng tin được** vì thiếu field bắt buộc *Job role*. Cần quyết trước khi nạp master data. (3) **Bậc cố định sau khi đăng** — *Upgrade tier* đã bỏ, nên tin Free cũng không bao giờ lên bậc trả phí được; chỉ thêm được add-on. Khách có đồng ý không, hay cần lại một cách nâng bậc? (4) **Duplicate tin** (chép thành một Draft mới) có trong requirement nhưng **console chưa làm** — có nằm trong đợt này không.',
      },

      /* §7 Test scenarios */
      { kind: 'h', text: '§7 · Kịch bản test đầu-cuối gợi ý' },
      {
        kind: 'table',
        note: 'Danh sách ngắn để mồi cho test plan — mỗi kịch bản đi qua nhiều màn hình, vì bug hay nấp ở chỗ nối.',
        cols: ['#', 'Kịch bản', 'Đạt khi'],
        rows: [
          ['1', 'Phát hành hoá đơn có 2 tin *Basic Plus*; đăng một tin trên nó', '*Main product* có *Basic Plus · 30 days*; sau Post, *Products & billing* của công ty ghi **1 of 2 posts used**'],
          ['2', 'Lưu sẵn một nháp trên *Basic Plus*; đăng thêm một tin để dùng hết 2 slot; rồi Post nháp kia', 'Post bị từ chối với thông báo hết quota; **nháp vẫn còn**. Mở một tin mới với cùng hoá đơn → *Basic Plus* **không còn được chào**'],
          ['3', 'Đăng cho một công ty mà không chọn hoá đơn', 'Chỉ còn product **Free**; tin lên mà **không trừ gì**; *Job type* ghi **Free**; nhà tuyển dụng không bao giờ thấy lựa chọn này trên trang công ty'],
          ['4', 'Post với Exposure Off, rồi bật On từ danh sách', 'Lúc Off không thấy trên site; bật On thì hiện ở các khu vực của bậc sau một lần tải lại; status **Open suốt**'],
          ['5', 'Đặt *Publish at* 09:00 ngày mai', 'Status *Schedule*, tiêu đề không có link, *Preview draft* chạy; tới 09:00 **tự** lên Open'],
          ['6', 'Thêm *Label: Hot job* cho một tin Basic đang Open bằng **Add add-on**', 'Hộp thoại nói slot lấy từ hoá đơn nào; dòng *Add-ons* hiện *HOT JOB TAG · until …*; slot add-on của công ty giảm **đúng 1**; bấm đúp chỉ trừ một lần; thử thêm Label lần hai → bị khoá *“running until …”*'],
          ['7', 'Chọn ngành IT, 2 vị trí, 4 chuyên môn tech-stack', 'Lựa chọn tech-stack thứ 4 bị khoá ở 3; trên site jobseeker tin tìm ra được bằng bất kỳ cái nào trong 3, và bằng *Select all IT*'],
          ['8', 'Đăng cho một công ty không có MST, hoặc đã archived', '*Save as draft* chạy; Post bị từ chối và lý do nêu đúng hồ sơ công ty'],
          ['9', 'Đóng một tin Open có 3 ứng viên', 'Biến khỏi mọi khu vực **ngay**; 3 hồ sơ vẫn ở màn *Applications*; không có nút xoá ở đâu cả'],
          ['10', 'Mở lại tin vừa đóng ở kịch bản 9 bằng **Reopen**, rồi Post', 'Reopen đưa tin về **Draft**, chưa ai thấy; Post **tốn một slot mới**; tin Open trở lại'],
          ['11', 'Dời *End date* một tin Open thêm 7 ngày', 'Dòng *End date* đổi, có chip **Edited**; tin hiện thêm 7 ngày rồi tự Closed; hạng trong dải trả phí **không** được kéo dài theo'],
        ],
      },
      {
        kind: 'p',
        text:
          'Notion có kịch bản *“Upgrade a live Basic job to Top Job”* — **đã bỏ** cùng tính năng; kịch bản 6 thay nó bằng *Add add-on*, và kịch bản 10–11 thêm cho hai tính năng mới (*Reopen*, *End date*).',
      },
      /* §8–§10 — not in the client's Notion page; added from the build. Checked against
         origin/dev 08/10/2026: saramin-vn-admin 45954108 · svn-be ee1db5ea9 · svn-web d8a43a11
         (admin-pages.config.ts, JobService, CompanyJobService, JobRunSchedule,
         JobLifecycleSweepService/Job, JobExpiryReminderService, JobPostingExpiryService,
         EmployerNoticeAnnouncer, PublicReadRepositoryAdapter#appliableJob). */
      { kind: 'h', text: '§8 · Quyền — ai bấm được gì trên Jobs' },
      {
        kind: 'p',
        text:
          '§8 – §10 **không có trong trang Notion** — thêm từ build (`saramin-vn-admin` `45954108` · `svn-be` `ee1db5ea9` · `svn-web` `d8a43a11`, 08/10/2026) để trả lời ba câu hay bị hỏi nhất: *ai được bấm*, *hệ thống tự làm gì khi không ai bấm*, và *bấm xong thì cái gì ở module khác đổi theo*.',
      },
      {
        kind: 'table',
        heading: 'Hàng *Jobs* trên ma trận Roles',
        note: 'Ma trận là dữ liệu, sửa ở **System → Roles**. Seed ban đầu: `hq_admin` và `vn_ops` giữ read / create / update trên `job` ở phạm vi *all*; V575 cấp `job:export` cho mọi vai trò HQ đang có `job:read` phạm vi *all*.',
        cols: ['Ô trên ma trận', 'Grant', 'Mở khoá cái gì'],
        rows: [
          ['**Read**', '`job:read`', 'Menu *Jobs* **và** *Applications* (cả hai cùng một grant), trang chi tiết tin, trang chi tiết đơn. Thiếu nó thì cả hai menu biến mất.'],
          ['**Create**', '`job:create`', '*New job* và *Save as draft*.'],
          ['**Update**', '`job:update` (kèm `job:approve`, `job:reject` của luồng duyệt cũ)', '*Edit* · *Post* / *Post now* · *Close* · *Reopen* · công tắc *Exposure* · *Set expiry date* · *Add add-on* — và **Reject một đơn** trên trang *Applications*.'],
          ['**Export**', '`job:export`', 'Nút *Export* trên **cả Jobs lẫn Applications** — một grant cho hai danh sách, không có hàng riêng cho Applications. Chỉ người đọc được phạm vi *all*: admin có phạm vi hẹp không xuất được.'],
          ['**Delete**', '`job:delete`', 'Grant vẫn còn trên ma trận nhưng **console không có nút xoá tin nào** (xem §1). Cấp nó không làm hiện ra nút gì.'],
        ],
      },
      {
        kind: 'p',
        text:
          '**Phạm vi dữ liệu.** Admin có phạm vi hẹp hơn *all* (theo *Departments*) chỉ thấy tin của các công ty trong phạm vi; đọc hay sửa một tin ngoài phạm vi đều bị từ chối. **Luồng duyệt tin đã bỏ (svn-be V468):** giá trị `REVIEW` còn trong từ điển chỉ để đọc tin cũ — không đường nào tạo ra nó nữa, tin của công ty lên thẳng *Open*.',
      },

      { kind: 'h', text: '§9 · Hệ thống tự làm gì — bốn việc chạy theo lịch' },
      {
        kind: 'table',
        note: 'Không ai bấm cả bốn việc này, nên đây là chỗ đầu tiên để nhìn khi *“tin tự đổi trạng thái”* hay *“khách nhận email lạ”*. Mỗi việc có audit riêng với người thực hiện là **hệ thống** (actor trống).',
        cols: ['Việc', 'Chạy khi', 'Làm gì', 'Cần biết'],
        rows: [
          ['**Mở tin hẹn giờ**', '**Mỗi phút**', '*Schedule* → *Open* khi tới *Publish at*. Ghi audit `job.auto_open`; gửi email *tin đã đăng* cho admin công ty nếu đây là lần đăng **đầu tiên**.', 'Lúc tới giờ mà công ty **không còn Active + có MST** thì tin **nằm lại Schedule** và thử lại phút sau — slot đã trừ từ lúc hẹn, không mất. Kích hoạt lại công ty là tin tự lên (muộn).'],
          ['**Đóng tin hết hạn**', '**Mỗi giờ**, phút :00', '*Open* → *Closed* khi qua *End date*. Kết thúc lượt chạy trả phí (vị trí + add-on, nhả chỗ của tier), dừng auto-refresh, ghi audit `job.auto_close`.', 'Status có thể **trễ tới 1 giờ** — nhưng tin đã **thôi hiện và thôi nhận đơn đúng giây hết hạn**, vì site jobseeker và cổng nộp đơn tự so ngày, không đợi sweep.'],
          ['**Auto-refresh**', 'Mỗi giờ, phút :05', 'Đẩy mốc *làm mới* của các tin tới lượt theo lịch của product — thứ quyết định thứ tự trong cùng một bậc (§5).', 'Chỉ tin *Open*, Exposure On, còn hạn. Không ghi audit (một tin Top job được làm mới ~11 lần / 30 ngày).'],
          ['**Nhắc sắp hết hạn**', '**09:15** mỗi sáng (giờ VN)', 'Email cho **admin của công ty**, mỗi tin *Open* hết hạn **đúng 3 ngày nữa** — kèm ngày và các bộ đếm của tin.', 'Một lần cho một hạn. Admin dời *End date* thì tin được nhắc lại theo ngày mới — cuộc gọi gia hạn của Sales nên bám mốc này.'],
        ],
      },

      { kind: 'h', text: '§10 · Mỗi thao tác kéo theo gì ở chỗ khác' },
      {
        kind: 'table',
        note: '**Không thao tác nào hoàn slot.** Đóng sớm, mở lại, ẩn — slot đã trừ là đã tiêu. Câu hỏi *“đóng rồi có được trả lại không”* luôn là **không**.',
        cols: ['Thao tác', 'Quota', 'Site jobseeker', 'Đơn ứng tuyển', 'Thông báo · log'],
        rows: [
          ['**Save as draft**', 'Không', 'Không có mặt', '—', '—'],
          ['**Post** (để trống *Publish at*)', 'Trừ **1 slot** Main product + 1 đơn vị mỗi add-on có phí; giữ một chỗ trong sức chứa của tier', 'Lên ngay **nếu Exposure On**', 'Bắt đầu nhận', 'Email *tin đã đăng* cho admin công ty — **chỉ lần đăng đầu**. Slot lấy từ công ty tài trợ (*Shared quota*) thì nhà tài trợ nhận email báo đã tiêu'],
          ['**Post** với *Publish at* tương lai', 'Trừ **ngay lúc hẹn**', 'Chưa có mặt tới giờ', 'Chưa nhận', 'Email *tin đã đăng* gửi lúc tin tự mở (§9)'],
          ['**Exposure Off**', 'Không', 'Rời **mọi** danh sách, tìm kiếm, dải hiển thị', '**Thôi nhận đơn** — cổng nộp đơn đòi Exposure On, không chỉ danh sách. Đơn đã nhận giữ nguyên', 'Audit `job.toggle_exposure`'],
          ['**Close**', 'Không hoàn', 'Gỡ ngay', 'Thôi nhận đơn mới; **đơn cũ giữ nguyên** trên *Applications* và trên bảng của nhà tuyển dụng, họ xử lý tiếp bình thường', 'Kết thúc vị trí trả phí + add-on (nhả chỗ cho tin khác của tier), dừng auto-refresh. Audit `job.update`'],
          ['**Reopen** (Admin)', 'Không — **Post lại** mới trừ 1 slot mới', 'Không (tin là Draft)', '—', 'Không email (lần đăng đầu đã báo rồi)'],
          ['**Set expiry date**', 'Không', 'Hiện tới hết ngày chọn rồi tự đóng', '—', 'Phần đẩy hạng của tier **giữ hạn cũ**; nhắc T-3 chạy theo ngày mới. Chỉ tin *Open*, chỉ ngày tương lai — ngày quá khứ bị từ chối'],
          ['**Add add-on**', 'Trừ **1 đơn vị** mỗi add-on từ hoá đơn đã chọn (add-on miễn phí: không trừ)', 'Badge / vị trí chạy ngay, tới tối đa ngày tin hết hạn', '—', 'Không hoàn tác'],
        ],
      },
      {
        kind: 'table',
        heading: 'Trang công ty làm cùng việc khác Admin ở đâu',
        note: 'Cùng một tin, cùng một vòng đời — nhưng nhà tuyển dụng tự đăng trên `svn-web` (`/hiring/jobs`) đi đường ngắn hơn ở vài chỗ. Khách gọi lên kể *“tôi bấm Reopen là tin lên luôn”* là **đúng**, không phải bug.',
        cols: ['Việc', 'Admin console', 'Company site'],
        rows: [
          ['**Chọn nguồn quota**', 'Chọn **hoá đơn** rồi product trên hoá đơn đó; không hoá đơn = bậc Free', 'Không có ô hoá đơn: chọn trong các product công ty đang giữ còn quota. **Không bao giờ thấy bậc Free**'],
          ['**Đăng**', 'Ngay, hoặc hẹn giờ (*Schedule*)', '**Chỉ đăng ngay** — nút đăng của công ty không nhận giờ hẹn'],
          ['**Mở lại tin Closed**', '*Reopen* → **Draft**; *Post* lại mới lên và trừ slot', '*Reopen* → **Open ngay**, trừ **1 slot** liền; khung hiển thị mới tính từ lúc mở lại, **ngày đăng gốc giữ nguyên**. Add-on chọn lúc đăng đầu không bị trừ lại'],
          ['**Thêm add-on cho tin đang chạy**', '*Add add-on*', 'Không có'],
          ['**Dời ngày hết hạn**', '*Set expiry date* (một tin hoặc nhiều tin)', 'Không có'],
          ['**Đổi công ty của tin**', 'Được khi tin còn Draft và **chưa có đơn nào**', 'Không (công ty cố định là người đang đăng nhập)'],
          ['**Nhân bản tin**', 'Không có', 'Không có'],
        ],
      },
      {
        kind: 'example',
        heading: 'Ví dụ — một tin Basic Plus 30 ngày, từ lúc đăng tới lúc mở lại',
        scenario:
          'Công ty ABC (Active, có MST) có hoá đơn đã phát hành với **2 slot Basic Plus · 30 days**. HQ đăng tin *Kế toán tổng hợp* lúc 10:00 ngày 01/10, Exposure On.',
        cols: ['Thời điểm', 'Chuyện gì xảy ra', 'Quota Basic Plus còn', 'Tin trên site'],
        rows: [
          ['01/10 10:00 — **Post**', 'Status *Open*; *End date* = 31/10 10:00. Admin công ty nhận email *tin đã đăng*', '1 / 2', 'Hiện, nhận đơn'],
          ['28/10 09:15', 'Sweep nhắc hạn: admin công ty nhận email *còn 3 ngày*', '1 / 2', 'Hiện'],
          ['31/10 10:00', 'Hết hạn hiển thị: tin **biến khỏi site và thôi nhận đơn ngay**', '1 / 2', 'Không còn'],
          ['31/10, sweep kế tiếp (≤ 1 giờ)', 'Sweep đóng tin: status *Closed*, vị trí trả phí kết thúc, audit `job.auto_close`. 12 đơn đã nhận vẫn trên *Applications*', '1 / 2', 'Trang chi tiết còn, ghi đã hết hạn'],
          ['02/11 — Admin **Reopen**', 'Tin về *Draft*. Chưa trừ gì', '1 / 2', 'Không có'],
          ['02/11 — **Post** lại', '*Open* lại, *End date* mới = 02/12. **Không có email** (đã báo lần đầu)', '**0 / 2**', 'Hiện lại, 12 đơn cũ vẫn nguyên'],
        ],
        note: 'Nếu chính nhà tuyển dụng bấm *Reopen* trên trang công ty thì hai dòng 02/11 gộp làm một: tin lên *Open* ngay và trừ slot liền.',
      },
    ],
  },


  /* ── Applications (admin) ─────────────────────────────────────────────────── */
  applicants: {
    logic: [
      '**Một dòng là một ĐƠN, không phải một người.** Ứng viên nộp ba tin là ba dòng. Bảng gom đơn của **mọi công ty** để HQ giám sát **cổng gửi** của Saramin: đơn nào đang bị giữ, đơn nào đã tới nhà tuyển dụng, và nhà tuyển dụng đang làm gì với nó. (Tên cũ *Applicants*, đổi 21/09 — SRM-607; đường dẫn cũ `/recruitment/applicants` vẫn chuyển hướng và **giữ nguyên bộ lọc**.)',
      '**Hai trạng thái, hai chủ.** *Application status* (*Not sent · Sent · Recall · Rejected*) là cổng của Saramin — **hệ thống suy ra** từ phán quyết CV, HQ chỉ tự ghi được đúng một giá trị là *Rejected*. *Stage · employer* là cột trên bảng của **nhà tuyển dụng** — HQ chỉ đọc, không bao giờ ghi.',
      '**Không có nút gửi (Forward).** Đơn tới nhà tuyển dụng **ngay lúc nộp** nếu CV gửi kèm đã được duyệt; nếu chưa thì nằm *Not sent* cho tới khi CV được **duyệt ở CV review** — một lần duyệt giải phóng **mọi** đơn đang chờ CV đó cùng lúc.',
      '**Thứ nhà tuyển dụng nhận bị đóng băng lúc nộp.** File CV và nội dung CV được chụp lại theo đơn; ứng viên sửa hay thay CV sau đó không đổi đơn đã giao. Cột CV ghi `v.1/2` khi nhà tuyển dụng giữ v.1 mà ứng viên đã có v.2.',
      'Mọi bộ lọc nằm trong URL — gửi link cho đồng nghiệp là họ thấy đúng màn hình bạn đang xem.',
    ],
    how: [
      '**Tìm một đơn:** gõ tên / email ứng viên, tên tin hoặc tên công ty vào ô tìm (khớp theo đầu từ, mọi từ phải khớp), hoặc mở **Filters** chọn *Company* / *Job*. Từ trang chi tiết một tin, nút **Applications (N)** mở sẵn bảng này lọc theo tin đó.',
      '**Đọc hai cột cạnh nhau:** *Application status* nói đơn đã tới công ty chưa; *Stage · employer* nói công ty đang để ứng viên ở cột nào. Đơn *Not sent* thì nhìn thêm *CV status* — đơn đang đợi đúng một thứ: phán quyết CV ở **CV review**.',
      '**Mở đơn:** bấm vào dòng (hoặc tên file CV) — trang chi tiết mở ở **tab mới**, danh sách giữ nguyên trang và bộ lọc. Bấm tên ứng viên mở **tài khoản** của họ ở *Jobseeker users*; bấm tên tin / công ty mở tin / hồ sơ công ty.',
      '**Từ chối riêng một đơn chưa gửi:** **⋯ → Reject — choose a reason** → chọn một trong ba lý do → nhập *Internal note* (bắt buộc) → *Reject*. Chỉ hiện trên dòng *Not sent* mà ứng viên chưa rút.',
      '**Tìm việc tồn:** bật **Overview** để xem bốn ô số (đơn quá 24 giờ chưa xử lý, đơn mới 7 ngày, đơn nằm yên ở công ty 7 ngày, thời gian xử lý trung bình). **Export** tải file Excel theo đúng bộ lọc đang chọn.',
    ],
    watch: [
      'Mở hồ sơ ứng viên là chạm dữ liệu cá nhân và **bị ghi log** — cả lần mở danh sách (kèm số dòng) lẫn lần mở từng đơn (`application.read`).',
      'Mở một dòng là **giám sát, không phải cổng duyệt** — trang chi tiết không có nút Duyệt / Từ chối, vì đơn *Sent* thì nhà tuyển dụng đã cầm CV đó rồi. Phán quyết về **CV** ở *CV review*; phán quyết về **riêng đơn này** ở menu ⋯ của dòng.',
      '**Đơn ứng viên đã rút KHÔNG có nhãn riêng trên bảng này.** Không cột nào in `WITHDRAWN`: một đơn đã gửi rồi bị rút vẫn đọc *Sent* với Stage *“employer has not placed this candidate…”*; một đơn chưa gửi bị rút vẫn đọc *Not sent* với gợi ý *“Approve the CV in CV review to send it”* — **duyệt CV cũng không gửi nó đi nữa**. Dấu hiệu duy nhất: menu ⋯ chỉ còn *View details*. Muốn chắc, xem trạng thái tài khoản ở *Jobseeker users*.',
      '**Bộ lọc *Stage* và cột *Stage · employer* nói hai thứ tiếng.** Bộ lọc dùng từ cũ của hệ thống (*New · Reviewing · Shortlisted · Interview · Hired · Rejected*), cột in **tên cột thật của nhà tuyển dụng** (*CV screening*, *Interview 1*, *Final acceptance*…). Lọc *Interview* không có nghĩa là mọi dòng hiện chữ *Interview*.',
      '**Dòng gợi ý *“Candidate sees: …”* trong menu Reject là lời hứa của thiết kế, build chưa làm.** Từ chối một đơn **không gửi gì cho ứng viên**; ở *My applications* họ chỉ thấy *Rejected*, không có lý do. Đừng nói với ứng viên rằng họ đã được hướng dẫn tải file khác.',
      'Cách diễn đạt *Not sent* / *CV đang chờ duyệt* là **chỉ dành cho admin**. Ứng viên ở đầu kia của dòng đó thấy *Applied* bình thường và **không được cho biết** có vòng duyệt nào cả.',
    ],
    blocks: [
      {
        kind: 'p',
        text:
          'Viết theo build `origin/dev` ngày **08/10/2026**: `saramin-vn-admin` `45954108` · `svn-be` `ee1db5ea9` · `svn-web` `d8a43a11`. Vòng đời đầy đủ của một đơn qua ba site nằm ở trang **Logic chung — Application management**; trang này đi sâu vào màn hình Admin.',
      },

      { kind: 'h', text: '§1 · Hai cột trạng thái — đọc đúng chủ của từng cột', path: '/recruitment/applications' },
      {
        kind: 'table',
        heading: 'Ba tầng trạng thái trên một đơn ứng tuyển',
        note: 'Ba tầng, ba chủ sở hữu. HQ **không bao giờ** ghi được tầng 3. Tầng thứ tư — *status* của đơn (*Applied … Withdrawn*), thứ ứng viên thấy — **không có cột trên bảng này** (xem *watch*).',
        cols: ['Tầng', 'Cột trên bảng', 'Ai sở hữu', 'Giá trị', 'HQ sửa được?'],
        rows: [
          ['1 · Trạng thái CV', '*CV status*', 'HQ (CV review) + máy quét', '*Qualified · Not enough information · Can’t read · Rejected*. Trống (*“No uploaded CV on this application”*) khi đơn không gắn file trong thư viện CV', 'Có — ở **CV review** / Talent pool, không ở đây'],
          ['2 · Trạng thái gửi', '*Application status*', 'Saramin — **suy ra**', '*Not sent · Sent · Recall · Rejected*', 'Chỉ **Reject** một đơn *Not sent*'],
          ['3 · Chặng tuyển dụng', '*Stage · employer*', '**Công ty khách**', '*CV screening* · tên cột giữa của công ty · *Final acceptance* · *Hired* · *Rejected*', '**Không** — chỉ đọc'],
        ],
      },
      {
        kind: 'table',
        heading: 'Application status — bốn giá trị (mỗi giá trị một tab)',
        note: 'Tab theo **thứ tự giao hàng**: giữ → đã giao → kéo lại → HQ từ chối. Tab **không có số đếm** (bỏ từ 23/09) — muốn đếm thì nhìn chân bảng hoặc *Overview*.',
        cols: ['Trên màn hình', 'Nghĩa', 'Tới đây bằng cách nào', 'Sau đó'],
        rows: [
          ['*Not sent* (`PENDING`)', 'Đơn đã tạo, **công ty chưa thấy**', 'Nộp bằng CV tải lên **chưa được duyệt**. (Cũng là chỗ đơn nằm lại nếu CV bị từ chối **trước** khi kịp gửi — đơn không tự chuyển sang *Rejected*.)', 'Duyệt CV ở CV review → *Sent* · ⋯ → *Reject* → *Rejected* · ứng viên rút → vẫn *Not sent*, nhưng đã đóng'],
          ['*Sent* (`FORWARDED`)', 'Công ty có đơn trên bảng, ở **cột đầu tiên** của tin', 'Nộp bằng CV đã duyệt (gửi ngay lúc nộp), hoặc CV được duyệt sau ở CV review', 'Công ty chuyển cột, *Hired* / *Rejected*, hoặc xoá khỏi bảng của họ · CV bị từ chối sau đó → *Recall*. **HQ không rút được từng đơn**'],
          ['*Recall* (`RECALLED`)', 'Đã giao rồi **bị Saramin kéo lại**, vì CV đi kèm bị từ chối sau khi gửi', 'Từ chối CV ở CV review / Talent pool — mọi đơn đã gửi bằng CV đó bị kéo lại cùng lúc', '**Điểm cuối.** Công ty vẫn thấy dòng, gắn nhãn *Recalled by Saramin*, CV và liên hệ bị ẩn (*Withheld*), không thao tác được. Lượt mở khoá CV-search của công ty (nếu có) được **hoàn credit**'],
          ['*Rejected* (`REJECTED`)', 'HQ từ chối **riêng đơn này**, trước khi gửi', '⋯ → *Reject — choose a reason* trên một dòng *Not sent*', '**Điểm cuối**, công ty không bao giờ thấy. Ứng viên thấy *Rejected* và **nộp lại được** vào chính tin đó'],
        ],
      },
      {
        kind: 'warn',
        text:
          '*Recall* **không phải** *Rejected* và **không phải** ứng viên rút. Recall nói *“đã tới công ty, rồi Saramin lấy lại”*; Rejected nói *“chưa bao giờ tới”*. Bảng của công ty phải đọc *Recalled by Saramin*, không bao giờ đọc như thể ứng viên tự rút.',
      },
      {
        kind: 'table',
        heading: 'Stage · employer — HQ thấy HÌNH DẠNG phễu của công ty, không thấy chữ tuỳ ý',
        note: 'Mỗi tin có bảng cột riêng do công ty đặt tên. Hai đầu cố định nên gọi tên được xuyên công ty; ở giữa là gì thì in **đúng tên công ty đặt** (*Interview 1*, *Gặp CEO*…). Giá trị suy ra mỗi lần đọc, nên công ty đổi tên hay xoá một cột giữa không làm hỏng gì ở đây.',
        cols: ['Ô hiện', 'Nghĩa'],
        rows: [
          ['*CV screening* (hoặc tên cột đầu của công ty)', 'Vừa được giao — mọi đơn *Sent* bắt đầu ở cột đầu tiên.'],
          ['Tên một cột giữa (token *In progress*)', 'Đang đi qua phễu. Cột đã bị công ty xoá cũng đọc là *In progress*.'],
          ['*Final acceptance* (cột cuối)', 'Ở bước quyết định.'],
          ['*Hired* · *Rejected*', 'Công ty đã chốt — lấy từ trạng thái của đơn, không từ cột.'],
          ['*“Not sent to the employer yet. Approve the CV in CV review to send it.”*', 'Đơn *Not sent* hoặc *Rejected* — công ty **chưa từng thấy**, nên không có chặng nào để in.'],
          ['*“Recalled from the employer after the CV was rejected.”*', 'Đơn *Recall* — chặng nó từng tới là thật, nhưng công ty đã hết làm việc với nó.'],
          ['*“The employer has not placed this candidate in a stage yet.”*', 'Đơn *Sent* mà chưa có cột — hiếm; cũng là thứ một đơn **đã gửi rồi bị ứng viên rút** hiện ra (xem *watch*).'],
        ],
      },

      { kind: 'h', text: '§2 · Danh sách — cột, lọc, sắp xếp, xuất' },
      {
        kind: 'table',
        heading: '12 cột (ẩn bớt bằng *chọn cột*)',
        cols: ['Cột', 'In gì', 'Bấm vào'],
        rows: [
          ['**Candidate**', 'Họ tên trên CV. Tag *Deleted account* khi ứng viên đã xoá tài khoản; sau khi xoá hẳn (72 giờ) tag thay cho tên và không còn link', 'Mở **tài khoản** ở *Jobseeker users* (tab mới) — không phải CV'],
          ['**CV**', 'Dòng 1: tên CV ứng viên đặt (hoặc tên file). Dòng 2: chip nguồn — *Saramin CV* · *Upload* · *Profile* — và phiên bản `v.1/2`', 'Tên CV mở **trang chi tiết đơn** (tab mới)'],
          ['**Basic information**', '*Giới tính · ngày sinh · quốc tịch* trên *học vấn cao nhất · số năm kinh nghiệm* — cùng cách viết với Talent pool và CV review', '—'],
          ['**Work preference**', 'Vị trí / ngành mong muốn trên nơi làm, mức lương, hình thức', '—'],
          ['**Contact**', 'Email trên số điện thoại', '—'],
          ['**Applied to**', 'Tên tin', 'Mở tin trong console (tab mới)'],
          ['**Company**', 'Tên công ty', 'Mở hồ sơ công ty ở CRM (tab mới)'],
          ['**CV status**', 'Tầng 1 — bốn giá trị ở §1', '—'],
          ['**Application status**', 'Tầng 2 — *Not sent · Sent · Recall · Rejected*', '—'],
          ['**Stage · employer**', 'Tầng 3 — chỉ có chữ khi đơn *Sent*', '—'],
          ['**Applied**', 'Bao lâu trước (*3 days ago*); rê chuột thấy giờ chính xác', '—'],
          ['**Actions** (⋯)', '*View details* · và *Reject* khi được phép (§3)', '—'],
        ],
      },
      {
        kind: 'list',
        heading: 'Lọc, tìm, sắp xếp, xuất',
        items: [
          '**Tab** = *Application status*: *All · Not sent · Sent · Recall · Rejected*.',
          '**Ô tìm** (*Search all columns…*): khớp **đầu từ** trong tên + email ứng viên, tên tin và tên công ty; gõ nhiều từ thì **mọi từ** phải khớp ở đâu đó.',
          '**Filters** (số trên nút đếm bộ lọc đang bật): *Company* · *Job* (ô tìm — gõ tên, mã tin hoặc tên công ty; không còn giới hạn 500 tin) · *Stage* · *Location* (tỉnh / thành, so với **địa chỉ tự do trên CV**, không phải địa điểm của tin) · *CV type* (*Saramin CV · Upload · Profile*).',
          '**Applied** ở đầu trang: khoảng ngày nộp — chọn sẵn (*This week*, *This month*…) hoặc tự chọn; mốc chọn sẵn được tính lại mỗi lần mở link, nên link *This month* luôn là tháng hiện tại.',
          '**Sort**: *Newest applied* (mặc định) · *Oldest applied* · *Candidate A → Z* · *Candidate Z → A*. Đơn mà CV đã bị xoá (không còn tên) luôn nằm cuối.',
          '**Chân bảng** in tổng *“applicants across all statuses”* — đếm theo mọi bộ lọc **trừ tab**, nên mở tab *Rejected* không làm con số tụt về như thể hàng đợi đã sạch.',
          '**Export** (cần `job:export`, phạm vi *all*): file Excel do server dựng theo bộ lọc + tab đang chọn, cột *Candidate · Email · Phone · Location · Years of experience · Applied to · Company · Applied via · CV status · Screening status · Stage · Applied at*. Tải về từ *Export history*.',
        ],
      },
      {
        kind: 'table',
        heading: 'Overview — bốn ô số (nút *Overview* ở đầu trang bật / tắt, nhớ theo trình duyệt)',
        note: 'Bốn ô tính trên **cùng bộ lọc với bảng, trừ tab**. Ba trong bốn ô đếm thứ **đã nguội** — điều tab không cho thấy.',
        cols: ['Ô', 'Đếm gì', 'Dùng để'],
        rows: [
          ['**Overdue · 24h**', 'Đơn *Not sent* nằm quá **24 giờ** chưa có phán quyết', 'Việc trễ của người trực CV review'],
          ['**New · 7 days**', 'Đơn nộp trong 7 ngày qua', 'Lượng vào mà cổng phải theo kịp'],
          ['**Waiting on employer**', 'Đơn đã giao mà công ty **7 ngày chưa chuyển cột**', 'Danh sách gọi điện của CS / Sales'],
          ['**Avg time to rule**', 'Số giờ trung bình từ lúc nộp tới phán quyết của HQ, 7 ngày qua. *—* khi 7 ngày không có phán quyết nào (không phải *0*)', 'Đo tốc độ cổng'],
        ],
      },

      { kind: 'h', text: '§3 · Thao tác duy nhất ở đây: Reject một đơn' },
      {
        kind: 'table',
        heading: '⋯ → Reject — choose a reason',
        note: 'Chỉ hiện khi đơn **Not sent** và **ứng viên chưa rút**, và người dùng có Update trên *Jobs* (`job:update`). Bấm lý do mở hộp xác nhận với **Internal note bắt buộc** (tối đa 500 ký tự; để trống thì hộp không đóng và báo *“An internal note is required.”*). Xong: *“Application rejected.”*, dòng chuyển sang tab *Rejected*.',
        cols: ['Lý do (mã)', 'Dùng khi', 'Hộp xác nhận ghi'],
        rows: [
          ['*Can’t read* (`CANT_READ`)', 'File là ảnh scan, không có chữ đọc được', '*“The company never receives this application. Use when the file has no readable text.”*'],
          ['*Not a CV* (`NOT_A_CV`)', 'File không phải CV (ví dụ ảnh CCCD, bảng giá)', '*“… Use when the file is not a CV, such as an ID card.”*'],
          ['*CV but not enough information* (`NOT_ENOUGH_INFORMATION`)', 'CV thật nhưng thiếu thông tin bắt buộc', '*“… Use when the CV lacks required information.”*'],
        ],
      },
      {
        kind: 'list',
        heading: 'Reject làm gì — và không làm gì',
        items: [
          'Đơn → *status* **Rejected**, *Application status* **Rejected**. Lưu người quyết, lúc nào, mã lý do và ghi chú; ghi audit `application.reject` kèm mã lý do (để đếm được *“30 đơn bị từ chối vì scan”*).',
          '**Chỉ đơn này.** CV không đổi trạng thái, các đơn khác dùng cùng CV vẫn chờ. Muốn quyết về **CV** (và mọi đơn của nó) thì vào **CV review** — chính hộp xác nhận cũng nhắc: *“Applies to this application only. To rule on the CV itself, use CV review.”*',
          '**Không gửi gì cho ai.** Ứng viên không nhận email hay thông báo; *My applications* của họ đổi sang *Rejected*. Công ty không biết đơn từng tồn tại.',
          '**Không hoàn tác.** Không có nút mở lại; ứng viên muốn thì nộp lại (đơn *Rejected* giải phóng chỗ cho một đơn mới vào cùng tin).',
          'Đơn *Sent*, *Recall*, *Rejected* hoặc đã bị rút: menu chỉ còn *View details*. Server cũng chặn: đơn đã có quyết định → *“Application screening decision already made”*; đơn ứng viên đã rút → *“The candidate withdrew this application”*.',
        ],
      },

      { kind: 'h', text: '§4 · Trang chi tiết đơn', path: '/recruitment/applications/:id' },
      {
        kind: 'table',
        note: '**Chỉ đọc** — không có nút nào ghi dữ liệu. Mở ở tab mới từ dòng hoặc tên CV. Đơn không tồn tại và đơn ngoài phạm vi của bạn trả **cùng một lỗi** (*“It does not exist, or it is outside the jobs you have access to.”*) — cố ý, để không dò được đơn của công ty khác.',
        cols: ['Khung', 'Đọc để biết'],
        rows: [
          ['**Thẻ ứng viên**', 'Họ tên, ứng tuyển lúc nào, tag *Deleted account* nếu có.'],
          ['**Application**', 'Tên CV (*CV:*), nút *Open file*, chip nguồn, *CV status*, và khối **CV version**: bản nào đang hiển thị trên tổng số bản (`v.1/2`).'],
          ['**Contact**', 'Email, điện thoại, số năm kinh nghiệm. Ba ô *Applications · Saved · Last active* là **ô trống có chú thích** — chưa endpoint nào trả, cố ý không in số 0.'],
          ['**Working preference set by the user**', 'Nghề, ngành, nơi làm, lương, hình thức mong muốn — cùng nguồn với CV review.'],
          ['**CV**', 'File ứng viên **đã gửi** được nhúng ngay trên trang (PDF), rồi các mục CV đã phân tích: giới thiệu, kỹ năng, kinh nghiệm, học vấn, ngoại ngữ, dự án, chứng chỉ…'],
          ['**Cuối trang**', 'Ngày cập nhật CV và hai đoạn nhắc về dữ liệu cá nhân.'],
        ],
      },
      {
        kind: 'warn',
        text:
          '**File và các mục phân tích có thể là hai phiên bản khác nhau.** File nhúng là **đúng bản công ty đã nhận lúc nộp** (`v.1`); các mục phân tích bên dưới đọc CV **hiện tại** của ứng viên (`v.2`) vì server chưa có cách đọc nội dung theo phiên bản. Khi hai bản khác nhau trang nói rõ (*“The attached file is the exact version the employer received at apply time (v.1). The parsed sections below reflect the candidate’s current CV (v.2).”*). Khi tranh chấp *“tôi đã gửi gì”*, **tin file, không tin các mục**.',
      },
      {
        kind: 'list',
        heading: 'Khi file không mở được',
        items: [
          'CV **chưa duyệt**: server không trả link file; khung CV ghi *“The uploaded file is held until this CV is approved. Only the parsed details below are readable for now.”*',
          'CV **đã bị từ chối**: *“This CV was taken down, so the uploaded file can no longer be opened…”* — lý do nằm ở CV review.',
          'Đơn nộp bằng **profile** (không file): *“No file — applied with the profile itself”*.',
          'Ứng viên **đã xoá CV**: đơn vẫn còn, ô CV đọc *“CV deleted by candidate”* — không phải lỗi hiển thị.',
          '**Không có nút *Open in CV review***. Đơn chưa mang mã CV mà CV review dùng, nên phải tìm dòng ở CV review bằng tay (theo tên ứng viên). *Save candidate* / *Unlock* cũng không có — đó là việc của nhà tuyển dụng, HQ đã thấy đủ liên hệ.',
        ],
      },

      { kind: 'h', text: '§5 · Ai đổi được gì trên một đơn' },
      {
        kind: 'table',
        note: 'Không ai có “quyền sửa tay” trạng thái một đơn từ màn hình này. Mọi thay đổi đến từ **một hành động có chủ đích ở đúng chỗ của nó**.',
        cols: ['Ai', 'Làm được', 'Ở đâu', 'Đơn đổi thế nào'],
        rows: [
          ['**Ứng viên**', 'Nộp · nộp lại sau khi đơn cũ đã đóng · xoá CV · khoá hoặc xoá tài khoản', 'Site jobseeker', 'Tạo đơn mới · đơn **đang chạy** gửi bằng CV bị xoá / của tài khoản bị khoá → *Withdrawn*'],
          ['**HQ — CV review**', 'Duyệt / từ chối **CV**', '*CV review* (`cv_review:decide`), *Talent pool*', 'Duyệt: mọi đơn *Not sent* của CV → *Sent*. Từ chối: mọi đơn *Sent* của CV → *Recall*; đơn *Not sent* nằm yên'],
          ['**HQ — Applications**', '**Reject** một đơn *Not sent*', 'Trang này (`job:update`)', '→ *Rejected*, điểm cuối'],
          ['**HQ — Jobseeker users**', '*Deactivate* · *Delete* tài khoản', '*Jobseeker users* (`candidate:manage`)', 'Mọi đơn đang chạy → *Withdrawn*, công ty được báo ngừng dùng dữ liệu (§6)'],
          ['**Nhà tuyển dụng**', 'Chuyển cột · *Hired* / *Rejected* (kèm lý do) · chuyển nhiều đơn một lúc (tối đa 200) · xoá khỏi bảng · ghi chú, gắn sao', 'Company site → *Applicants* (`applicant:manage`)', 'Chỉ trên đơn *Sent*. *Hired* / *Rejected* là điểm cuối. Xoá khỏi bảng: đơn **vẫn còn** ở đây và ở *My applications*'],
          ['**Hệ thống**', 'Gửi ngay lúc nộp khi CV đã duyệt', '—', '*Sent*, vào cột đầu tiên, báo công ty'],
        ],
      },

      { kind: 'h', text: '§6 · Rút đơn — kể cả tự rút khi tài khoản bị khoá' },
      {
        kind: 'table',
        note: '**Chỉ đơn đang chạy bị rút** (*Applied · Screening · Interview · Offered*). Đơn đã *Hired* / *Rejected* giữ nguyên kết quả — viết lại một lần tuyển thành “rút” là làm sai hồ sơ tuyển dụng của công ty. Đơn rút **biến khỏi bảng của công ty**. *Withdrawn* là điểm cuối và **giải phóng chỗ**: ứng viên nộp lại được vào cùng tin.',
        cols: ['Cách', 'Ai bấm', 'Công ty được báo', 'Trên bảng này'],
        rows: [
          ['**Ứng viên tự rút một đơn**', 'Ứng viên — **API có, site chưa có nút** (xem *How to apply*)', 'Có, nếu đơn đã gửi', 'Không nhãn riêng'],
          ['**Ứng viên tự khoá tài khoản**', 'Ứng viên', 'Có — mỗi đơn đã gửi một thông báo *ngừng sử dụng dữ liệu*', 'Không nhãn riêng'],
          ['**Admin *Deactivate***', 'HQ ở *Jobseeker users*', 'Có, như trên', 'Không nhãn riêng'],
          ['**Xoá tài khoản** (ứng viên tự xoá, hoặc Admin *Delete*)', 'Ứng viên / HQ', 'Có — một thông báo *tài khoản đã xoá*; tên ứng viên bị gỡ khỏi các chuông cũ của công ty', 'Tag *Deleted account*; sau 72 giờ dữ liệu cá nhân bị xoá hẳn: tag thay cho tên'],
          ['**Xoá một CV**', 'Ứng viên', 'Có, cho đơn gửi bằng CV đó', '*“CV deleted by candidate”*'],
          ['**Admin *Reactivate* / *Restore***', 'HQ', '—', '**Không khôi phục** đơn đã rút — ứng viên phải nộp lại'],
        ],
      },
      {
        kind: 'warn',
        text:
          '**Khoá một người dùng KHÔNG từ chối CV của họ.** Nó chặn đăng nhập, gỡ họ khỏi CV search, và **rút các đơn đang xử lý** kèm thông báo rút đơn — nhưng trạng thái CV giữ nguyên, và đơn đã xong (tuyển / loại) ở lại. Muốn CV bị từ chối thì phải đặt trạng thái CV thành *Rejected*, bằng **một thao tác riêng, có chủ đích** ở CV review: khoá trả lời “người này có vào được không”, trạng thái CV trả lời “nhà tuyển dụng có nên thấy CV này không”. **Không đơn nào từng hiện chữ “Bị khoá”** — đơn bị rút hiện là rút.',
      },
      {
        kind: 'warn',
        text:
          '**Sửa so với bản trước của trang này.** (1) Bản trước mô tả hai hành động *Thu hồi* và *Khoá người dùng* trên màn hình này — **build không có cái nào ở đây**: thu hồi chỉ xảy ra khi từ chối CV ở CV review (không có nút thu hồi từng đơn), khoá là *Deactivate* ở *Jobseeker users*. (2) Nhãn trạng thái build dùng là *Not sent · Sent · Recall · Rejected* trên cột *Application status* — không phải *Chờ · Đã gửi · Thu hồi · Từ chối* trên cột *Status · Saramin*. (3) Cột *CV status* giờ in **bốn** giá trị (svn-be gửi `cvStatus`), không còn ba. (4) Trang chi tiết **không có** nút *Open in CV review ↗*. (5) Ứng viên xoá tài khoản thì đơn **đang chạy** bị rút và **rời bảng của công ty**; chỉ đơn đã *Hired* / *Rejected* ở lại với tên *Deleted candidate* — và đơn đã đóng thì không chuyển chặng được.',
      },

      { kind: 'h', text: '§7 · Phía nhà tuyển dụng — chuyện gì xảy ra sau khi đơn được gửi' },
      {
        kind: 'table',
        note: '**HQ không bao giờ chạm vào các chặng này.** Mỗi tin có bảng chặng riêng: mặc định *CV screening · Interview 1 · Interview 2 · Final acceptance*, cộng hai cột **cố định** *Hired* và *Rejected*. Tối đa **8 chặng**; **cột đầu và cột cuối chỉ đổi tên được**, không xoá, không di chuyển; **chặng còn người thì không xoá được**.',
        cols: ['Điều', 'Chi tiết'],
        rows: [
          ['**Ứng viên tới bảng đã được kiểm sẵn**', 'Chỉ đơn Saramin **đã gửi** mới tới bảng của nhà tuyển dụng. Nộp đơn **chính là sự đồng ý của ứng viên**, nên liên hệ trên bảng ứng viên **mở sẵn, không tốn credit**.'],
          ['**Nhảy cóc là hợp lệ**', '*CV screening → Final acceptance* trong một bước được phép — thực tế nhà tuyển dụng hay bỏ bước.'],
          ['**Đóng là đóng**', '*Hired* và *Rejected* là **điểm cuối**, không mở lại được — server từ chối mọi lần chuyển tiếp (409).'],
          ['**Chuyển nhiều đơn một lúc**', 'Tối đa **200** đơn; từng đơn thành / bại riêng — một đơn đã đóng không làm hỏng cả lô.'],
          ['**Dòng bị Saramin thu hồi**', 'Gắn nhãn *Recalled by Saramin*, liên hệ và CV bị giấu, các ô đọc là *Withheld*, và **mọi thao tác trên dòng đều bị từ chối** (không di chuyển, không sao, không chọn, không xoá).'],
          ['**Xoá ứng viên khỏi bảng**', 'Một bước, không có lưu trữ. Đơn **vẫn còn** ở *Applications* và ở *My applications* của ứng viên; chỉ các màn hình của công ty thôi trả nó.'],
          ['**Ứng viên rút / khoá / xoá tài khoản**', 'Đơn đang chạy **rời bảng**; công ty nhận email + chuông *ngừng sử dụng dữ liệu*. Đơn đã chốt ở lại, tên đọc *Deleted candidate* khi tài khoản đã xoá.'],
          ['**Lý do loại**', 'Sáu lý do (*không đạt năng lực · không phù hợp · rút lui / không tới phỏng vấn · từ chối offer · không thống nhất điều kiện · khác* — chỉ *khác* có ghi chú). **Chỉ thành viên của nhà tuyển dụng thấy, ứng viên không bao giờ thấy.**'],
          ['**Không báo ứng viên**', 'Chuyển cột, *Hired*, *Rejected* **không gửi gì cho ứng viên** — họ chỉ thấy trạng thái mới khi tự mở *My applications*. (Saramin KR có gửi email ở bước này; bản VN cố ý chưa.)'],
        ],
      },

      {
        kind: 'example',
        heading: 'Ví dụ — một CV, ba đơn, từ lúc nộp tới lúc tài khoản bị khoá',
        scenario:
          'Lan tải lên *CV_Lan.pdf* (v.1), CV đang **chờ duyệt**. Lan nộp tin *Kế toán* của công ty X, rồi Batch apply thêm hai tin của công ty Y và Z — cùng CV.',
        cols: ['Bước', 'Lan thấy (My applications)', 'Applications (Admin)', 'Công ty thấy'],
        rows: [
          ['1 · Nộp ba tin', '*Applied* ×3', '3 dòng *Not sent*, *CV status* chờ duyệt, Stage *“Not sent to the employer yet…”*. Ô *Overdue · 24h* bắt đầu đếm sau 24 giờ', 'Không gì cả'],
          ['2 · HQ **duyệt CV** ở CV review', '*Applied* ×3', 'Cả 3 dòng sang *Sent* **cùng lúc**, Stage *CV screening*', 'X, Y, Z: mỗi công ty một dòng mới ở cột đầu + email cho người nhận hồ sơ của tin'],
          ['3 · Lan thay file (v.2)', 'Không đổi', 'Cột CV: `v.1/2`; trang chi tiết nhúng **v.1**', 'Vẫn giữ **v.1** — không ai được gửi v.2'],
          ['4 · X chuyển Lan sang *Interview 1*', '*Interview*', 'Đơn X: Stage *Interview 1*', 'X: dòng ở cột *Interview 1* — Lan **không** nhận thông báo nào'],
          ['5 · Y bấm *Rejected* (lý do *không phù hợp*)', 'Đơn Y: *Rejected* (không lý do)', 'Đơn Y: Stage *Rejected*', 'Y: lý do chỉ Y thấy'],
          ['6 · HQ **Deactivate** tài khoản Lan', 'Không đăng nhập được', 'Đơn X, Z → status *Withdrawn* — **cột vẫn đọc *Sent***; đơn Y giữ *Rejected*', 'X, Z: đơn rời bảng + email *ngừng sử dụng dữ liệu*. Y: dòng *Rejected* ở lại'],
        ],
        note: 'Bước 6 là chỗ dễ đọc sai nhất: không cột nào trên Applications in chữ *Withdrawn*. Nếu thay vì khoá, HQ **từ chối CV** của Lan ở bước 6 thì đơn X, Z thành *Recall* (công ty còn thấy dòng nhưng bị ẩn), đơn Y vẫn *Rejected*, và tài khoản Lan vẫn dùng được.',
      },

      {
        kind: 'open',
        text:
          '**Những chỗ build còn hở, cần chốt với khách.** (1) Không có cột / nhãn nào cho đơn **ứng viên đã rút** — nên thêm, hoặc ít nhất đổi chữ ở cột Stage. (2) Nút *Open in CV review* đã bỏ vì đơn không mang mã CV; **svn-be giờ đã gửi `cvId`** trên dòng và trang chi tiết (`AdminApplicationRowDto`), nên phía console nối lại được. (3) Gợi ý *“Candidate sees: …”* trong menu Reject chưa có đường tới ứng viên. (4) Bộ lọc theo *CV status* chưa có (server chưa nhận tham số này). (5) Site ứng viên luôn gửi đơn với nguồn `OWN_CV` (kể cả khi chọn Saramin CV trong thư viện), nên chip *Saramin CV* và bộ lọc *CV type = Saramin CV* **có thể không khớp đơn mới nào** — chưa xác minh trên dữ liệu thật.',
      },
    ],
  },

  /* ── How to apply (jobseeker site) ────────────────────────────────────────── */
  /* The client's Notion "How to apply" (Application management, two steps + two
     screenshots), extended from the build: svn-web d8a43a11 (apply-button.tsx, cv-choice.ts,
     job-recommendations/*, my-applications/*, dictionaries) and svn-be ee1db5ea9
     (WebApplyService, WebApplyController, RateLimitProperties, PublicReadRepositoryAdapter). */
  'how-to-apply': {
    logic: [
      'Ứng viên nộp đơn **từ trang chi tiết của một tin** — không có form nộp đơn riêng. Một lần nộp = **một CV** gửi tới **một tin**.',
      'Nộp xong, site mở ngay hộp **Batch apply**: gợi ý các tin **cùng ngành nghề** với tin vừa nộp, cho chọn **tối đa 5** tin để nộp tiếp **bằng chính CV vừa dùng**. Mỗi tin là **một đơn riêng**, qua đúng các kiểm tra của một lần nộp thường.',
      '**Đơn đóng băng đúng bản CV đã chọn.** File và nội dung CV được chụp lại theo đơn ngay trong lúc nộp; ứng viên sửa CV sau đó không đổi thứ công ty đã nhận.',
      '**Nộp được không có nghĩa là đã tới nhà tuyển dụng.** CV đã được duyệt thì đơn đi ngay; CV tải lên còn chờ duyệt thì đơn được tạo nhưng **giữ lại** tới khi HQ duyệt CV — ứng viên vẫn thấy *Applied* như thường.',
      'Mọi đơn đã nộp nằm ở **My applications** (`/my-profile/applications`), mỗi đơn kèm đúng bản CV đã gửi.',
    ],
    how: [
      'Mở trang chi tiết của bất kỳ tin nào → bấm **Apply**. Panel bên phải mở ra: **Selected CV** (đổi bằng **Change CV**), **Cover letter**, ô đồng ý về xử lý dữ liệu cá nhân → bấm **Apply job**.',
      'Nộp xong, hộp **Job application complete!** hiện danh sách tin tương tự. Tick tối đa 5 tin → **Batch apply** → đọc bước xác nhận *Before you apply to {n} jobs* → **Confirm**.',
      'Kiểm tra phía Admin: đơn vừa nộp hiện ở **Applications** (lọc theo tin), *Not sent* hay *Sent* tuỳ trạng thái CV.',
    ],
    watch: [
      '**Chưa đăng nhập, hoặc đang đăng nhập bằng tài khoản nhà tuyển dụng** → bấm Apply chỉ mở lời mời đăng nhập, không mở panel.',
      '**Batch apply gửi cùng một CV và không kèm cover letter**, mỗi tin một đơn riêng. Cây bút cạnh tên CV trong hộp chỉ đổi **tên hiển thị** của CV — **không** đổi CV được gửi đi.',
      '**Hộp Batch apply chỉ hiện khi có gợi ý.** Tin vừa nộp không còn tin Open nào cùng ngành nghề thì nộp xong là xong — không phải lỗi.',
      '**Site làm mờ mọi CV *Not enough information*, kể cả file tải lên** — trong khi server vẫn nhận một file tải lên đang nghi ngờ (chỉ giữ đơn lại). Ứng viên báo *“CV của tôi không chọn được”* thì xem trạng thái CV đó ở *CV review* / *Talent pool*.',
      '**Tin bị ẩn (Exposure Off) cũng không nộp được** — cổng nộp đơn đòi *Open + Exposure On*, y như danh sách công khai. Ứng viên đang mở panel đúng lúc tin bị ẩn sẽ nhận *This job posting is no longer available.*',
    ],
    blocks: [
      {
        kind: 'warn',
        text:
          '**Nguồn và độ mới.** Mang từ trang Notion *How to apply* trong *Application management* (sửa 25/09, ảnh chụp 17/09). Notion chỉ có hai bước — *vào trang tin bấm Apply*, rồi *Batch apply*; phần còn lại viết theo build, kiểm ngày **08/10/2026** với svn-web `d8a43a11` · svn-be `ee1db5ea9`. **Hai ảnh dưới đây là ảnh của Notion** — chữ trên màn hình đã đổi ở vài chỗ, ghi ngay dưới từng ảnh.',
      },

      { kind: 'h', text: '§1 · Nộp đơn từ trang tin', path: '/jobs/:slug' },
      {
        kind: 'shot',
        src: '/shots/apply-01-job-detail-panel.jpg',
        where: 'Jobseeker site',
        caption: 'Trang chi tiết tin → **Apply** → panel bên phải: CV đã chọn, cover letter, ô đồng ý, **Apply job**.',
        note: 'Ảnh Notion 17/09/2026. Từ đó: ô *I agree with Terms of service and Privacy policy* đã thay bằng ô **đồng ý xử lý dữ liệu cá nhân** (SRM-764, 07/10), và tiêu đề *Cover letter* bỏ chữ *(optional)* — có bắt buộc hay không giờ do từng tin quyết.',
      },
      {
        kind: 'table',
        heading: 'Panel Apply — từng phần',
        cols: ['Phần', 'Nghĩa', 'Thử bằng cách'],
        rows: [
          ['**Nút trên trang tin**', '**Apply** → sau khi nộp đổi thành **Applied** (*Đã ứng tuyển*). Tin đã đóng hoặc hết hạn: nút thay bằng nhãn xám **Closed** (*Đã hết hạn*).', 'Nộp một tin → tải lại trang → nút đọc *Applied*. Bấm *Applied* → panel mở lại dạng biên nhận: *You’ve applied for this job* + **Go to My applications**.'],
          ['**Selected CV** · **Change CV**', 'Liệt kê **cả Saramin CV lẫn CV tải lên** trong thư viện CV của ứng viên (CV tải lên có nhãn *Uploaded*), mỗi dòng ghi giờ lưu (*Saved on 2026.09.10 (Thu) 21:01*). **Chỉ CV gửi được mới chọn được** — CV *Not approved* (bị HQ từ chối) hoặc *Not enough info* hiện mờ. Mặc định chọn **CV gửi được đầu tiên** trong danh sách.', 'Tài khoản chưa có CV nào → panel ghi *You don’t have a CV yet! Finish one to apply.* kèm thẻ **Write one yourself**, không có nút nộp.'],
          ['**Cover letter**', 'Tối đa **5.000 ký tự**. Theo cài đặt của **từng tin** (*Candidate expectation → Cover letter requirement*): *bắt buộc* (tiêu đề ghi *(required)*, chưa điền thì không nộp được) · *ẩn hẳn* · hoặc *tuỳ chọn*.', 'Mở một tin cài cover letter bắt buộc → để trống → **Apply job** không chạy.'],
          ['**Ô đồng ý**', '*I confirm that I have carefully read and understood the **provisions** regarding the processing of my personal data* — **bắt buộc**; chưa tick thì **Apply job** bị khoá. Đơn ghi lại **đúng phiên bản** văn bản ứng viên đã đọc. Ngôn ngữ nào chưa có văn bản này thì panel báo không nộp được.', 'Bỏ tick → nút xám.'],
          ['**Apply job**', 'Nộp. Panel đóng, toast *Your application has been submitted.*, nút trên trang đổi thành *Applied* — rồi hộp Batch apply mở (xem §2).', '—'],
        ],
      },
      {
        kind: 'table',
        heading: 'Server kiểm gì khi nhận một lần nộp — theo đúng thứ tự',
        note: 'Mọi kiểm tra chạy **trong một giao dịch**: hỏng ở bước nào thì không có gì được ghi (không đơn nửa vời, không bộ đếm nhảy). Batch apply chạy đúng chuỗi này cho **từng** tin.',
        cols: ['#', 'Kiểm', 'Không đạt thì'],
        rows: [
          ['1', '**Tin còn nhận đơn**: *Open* · Exposure On · công ty Active **và có MST** · chưa qua hạn hiển thị', '*This job posting is no longer available.* — cùng một câu cho tin không tồn tại, bị ẩn hay đã hết hạn; **kể cả người từng nộp tin đó**'],
          ['2', '**Chưa có đơn đang chạy** vào tin này (*Applied · Screening · Interview · Offered*)', '*You have already applied to this job.* Đơn cũ đã *Withdrawn*, *Rejected* hoặc *Hired* thì **nộp lại được**'],
          ['3', '**Đồng ý đúng phiên bản hiện hành** của văn bản xử lý dữ liệu', 'Bị từ chối — phiên bản cũ (mở panel từ trước khi văn bản đổi) không được ghi nhận'],
          ['4', '**CV thuộc đúng ứng viên** và **chưa bị HQ từ chối**', '*That CV can’t be sent yet. Pick another one.* — panel vẫn mở để chọn CV khác'],
          ['5', 'Tạo đơn, **chụp lại** file + nội dung CV theo đơn, ghi nguồn (UTM / referrer lần chạm đầu)', '—'],
          ['6', '**Gửi ngay hay giữ lại**: CV đã duyệt → đơn *Sent*, vào cột đầu tiên của tin, công ty được báo. Chưa duyệt → *Not sent* tới khi HQ duyệt CV', '—'],
        ],
      },
      {
        kind: 'table',
        heading: 'Khi nộp không được',
        cols: ['Tình huống', 'Ứng viên thấy'],
        rows: [
          ['Đã có đơn **đang chạy** vào tin này', '*You have already applied to this job.* Đơn đã *Withdrawn*, *Rejected* hoặc *Hired* thì **nộp lại được**.'],
          ['Tin vừa đóng / hết hạn / bị ẩn trong lúc đang mở panel', '*This job posting is no longer available.*'],
          ['CV không gửi được', '*That CV can’t be sent yet. Pick another one.* — panel vẫn mở để chọn CV khác.'],
          ['Nộp quá **20 lần / phút** (tính theo tài khoản)', '*Too many requests. Please try again in a moment.* Ngoài giới hạn này **không có trần** số đơn.'],
          ['Nội dung quá dài (vượt giới hạn ô)', '*Your input is too long. Please shorten it.*'],
        ],
      },
      {
        kind: 'warn',
        text:
          '**Nộp được không có nghĩa là đã tới nhà tuyển dụng.** Đơn nộp bằng **CV tải lên chưa được HQ duyệt** vẫn được tạo — ứng viên thấy *Applied* bình thường — nhưng nằm ở **Not sent** (*Chưa gửi*) cho tới khi CV được duyệt ở **CV review**; duyệt xong đơn tự đi. CV đó bị từ chối sau khi đã gửi thì đơn bị **thu hồi** (*Recall*). Saramin CV chưa *Đạt* thì không lọt tới bước này — bị chặn ngay ở panel. Xem **Create CV**, **CV review** và **Applications**.',
      },

      { kind: 'h', text: '§2 · Batch apply — nộp tiếp các tin tương tự' },
      {
        kind: 'shot',
        src: '/shots/apply-02-batch-apply.jpg',
        where: 'Jobseeker site',
        caption: 'Ngay sau khi nộp: hộp gợi ý tin tương tự — tick tối đa 5 tin, rồi **Batch apply**.',
        note: 'Ảnh Notion 17/09/2026. Build giờ đọc khác: tiêu đề **Job application complete!** (*Ứng tuyển thành công!*) thay cho *Applied — pick more jobs to apply to*, có thêm dải *Try applying to job postings similar to the one you applied for!*, và nhãn CV là **CV to apply**. Ô sắp xếp mặc định là **Matching**, không phải *By company size*.',
      },
      {
        kind: 'table',
        heading: 'Tin nào được gợi ý',
        note: 'Bề mặt `AFTER_APPLY` của bộ gợi ý việc làm (svn-be `docs/architecture/job-recommendation-matching.md`). Các cổng **không bao giờ nới** cho bề mặt này — thà ít gợi ý còn hơn gợi ý sai.',
        cols: ['Cổng', 'Nghĩa'],
        rows: [
          ['**Tin còn mở**', 'Chỉ tin *Open*, chưa qua hạn nộp. Tin đã đóng không bao giờ được gợi ý.'],
          ['**Chưa đụng tới**', 'Bỏ các tin ứng viên **đã nộp** hoặc **đã ẩn** khỏi gợi ý.'],
          ['**Cùng ngành nghề**', 'Bỏ chính tin vừa nộp; tin gợi ý phải **chung ít nhất một ngành nghề (category)** với nó.'],
          ['**Thứ tự**', 'Lấy tối đa **30** tin, xếp theo **điểm phù hợp** với ứng viên.'],
        ],
      },
      {
        kind: 'table',
        heading: 'Trong hộp Batch apply',
        cols: ['Phần', 'Nghĩa'],
        rows: [
          ['**Sort by**', '**Matching** (mặc định — giữ thứ tự gợi ý) · **By company size** (công ty đông người trước) · **By closing date** (sắp hết hạn trước) · **By registration date** (mới đăng trước).'],
          ['**Ô tick mỗi dòng**', 'Chọn tối đa **5** tin. Đủ 5 thì các ô còn lại khoá, hộp ghi *You can pick at most 5 jobs at a time.* Bấm Batch apply khi chưa chọn gì: *Pick at least one job to apply to.*'],
          ['**Apply** trên một dòng', 'Nộp **riêng tin đó ngay**, không qua bước xác nhận.'],
          ['**Ngôi sao** · **Save all jobs**', 'Lưu một tin / lưu **mọi tin chưa lưu** trong danh sách — lưu, không nộp.'],
          ['**CV to apply** + cây bút', 'CV vừa dùng cho đơn trước — **cố định**, không đổi được ở đây. Cây bút chỉ đổi **tên hiển thị** của CV.'],
          ['**Batch apply**', 'Mở bước xác nhận *Before you apply to {n} jobs* — *Your CV will be sent to {n} employers*, kèm lưu ý: nhà tuyển dụng giữ CV **90 ngày sau khi tin đóng** và **không thu hồi được** khi họ đã mở. **Confirm** → gửi từng đơn một (*Sending {i} of {n} — please keep this window open.*).'],
          ['**Kết quả**', '*Applied to {n} jobs.* — hoặc *Applied to {ok} jobs; {failed} could not be sent.* kèm lý do từng tin. Tin đã nộp rơi khỏi danh sách.'],
        ],
      },
      {
        kind: 'p',
        text:
          '**Trong log hành vi**, đơn từ hộp này được ghi đường nộp `BATCH`, đơn từ trang tin ghi `NORMAL` — đó là cách *Analytics* tách tỉ lệ chuyển đổi của Batch apply. Giới hạn 20 lần / phút tính **chung** cho cả hai đường.',
      },

      { kind: 'h', text: '§3 · Sau khi nộp — My applications', path: '/my-profile/applications' },
      {
        kind: 'table',
        note: 'Đầu trang có dải tổng: *Job applied* · *Selection in progress* · *Selected*. Lọc được theo *Viewed by employer* / *Not viewed by employer* (*NTD đã xem* = một người của công ty **đã mở trang chi tiết** ứng viên, không phải chỉ lướt danh sách) và theo tin *Open / Closed*. **View application** mở đúng bản CV đã gửi, không phải bản đang sửa; đơn nộp trước khi có tính năng chụp CV thì ghi rõ là không còn bản lưu.',
        cols: ['Trạng thái', 'Ứng viên thấy', 'Tiếng Việt'],
        rows: [
          ['`APPLIED`', 'Applied', 'Đã ứng tuyển'],
          ['`SCREENING`', 'Screening', 'Đang sàng lọc'],
          ['`INTERVIEW`', 'Interview', 'Phỏng vấn'],
          ['`OFFERED`', 'Offered', 'Đã nhận offer'],
          ['`REJECTED`', 'Rejected', 'Bị từ chối'],
          ['`HIRED`', 'Hired', 'Đã tuyển dụng'],
          ['`WITHDRAWN`', 'Withdrawn', 'Đã hủy ứng tuyển'],
        ],
      },
      {
        kind: 'table',
        heading: 'Chuyện xảy ra ở phía sau — ứng viên thấy gì',
        note: 'Ứng viên chỉ thấy **một** trạng thái và cờ *đã xem*. Trạng thái gửi của Saramin (*Not sent · Sent · Recall*) **không có trên site ứng viên**.',
        cols: ['Ở phía sau', 'My applications đọc', 'Có thông báo không'],
        rows: [
          ['Nộp xong (gửi ngay hay bị giữ)', '*Applied*', 'Có — thông báo trong site *đã nộp*'],
          ['HQ duyệt CV, đơn tới công ty', '*Applied*', 'Không (ứng viên không được cho biết có vòng duyệt)'],
          ['Công ty chuyển cột giữa', '*Screening* / *Interview* / *Offered* — theo loại của cột', '**Không**'],
          ['Công ty *Hired* / *Rejected*', '*Hired* / *Rejected* (không lý do)', '**Không**'],
          ['HQ *Reject* đơn ở Applications', '*Rejected*', '**Không**'],
          ['HQ từ chối CV sau khi đơn đã gửi (*Recall*)', '**Không đổi** — vẫn trạng thái cũ', '**Không**'],
          ['HQ từ chối CV khi đơn còn bị giữ', '**Vẫn *Applied*** mãi', 'Không ở đơn — ứng viên chỉ thấy CV bị từ chối ở trang CV'],
          ['Tài khoản bị khoá / xoá, CV bị xoá', '*Withdrawn* (đơn đang chạy)', '—'],
          ['Mỗi sáng thứ Hai 08:00', '—', 'Email tổng hợp các đơn trong tuần'],
        ],
      },
      {
        kind: 'open',
        text:
          '**Rút đơn chưa có trên web.** Backend có lệnh rút đơn (`PATCH /me/applications/{id}/withdraw`; đơn đã đóng → 409) và site **từng có** nút *지원 취소* (svn-web `c6e0962b`) nhưng nút đã bị gỡ ở `ea2a72b3` khi trang *My applications* làm lại — nên trạng thái *Withdrawn* hiện chỉ đến từ phía hệ thống (tài khoản bị khoá / xoá, CV bị xoá). Notion không nhắc tới; cần khách quyết có mở lại cho ứng viên hay không.',
      },
      {
        kind: 'open',
        text:
          '**Thư xin việc chưa được lưu lên đơn.** Panel gửi nội dung ô *Cover letter* lên server, nhưng `WebApplyService` chỉ dùng nó khi ứng viên **chưa có CV đại diện nào** (để dựng một hồ sơ tạm) — đơn ứng tuyển không có trường nào giữ thư xin việc, và cột *có thư xin việc* trong file xuất của công ty đọc nội dung hồ sơ, không đọc thư. Với ứng viên đã có CV (gần như mọi người), thư gõ ở panel **không tới nhà tuyển dụng**, kể cả với tin đặt *bắt buộc*. Cần backend thêm trường trên đơn.',
      },
      {
        kind: 'open',
        text:
          '**Ứng viên không thấy đơn bị thu hồi hay bị giữ mãi.** Dữ liệu `/me/applications` chỉ mang trạng thái của đơn, không mang trạng thái gửi: đơn *Recall* vẫn đọc trạng thái cũ (*Applied*, *Interview*…), và đơn bị giữ trên một CV đã bị từ chối đọc *Applied* vĩnh viễn. Code backend có ghi ý định hiện chữ *“Đã thu hồi”* cho ứng viên — chưa làm.',
      },
    ],
  },
}

/* ── Module page ──────────────────────────────────────────────────────────────── */

export const JOBS_APPS_MODULE_DOCS: Record<string, ModuleDoc> = {
  /* Written as BUILT, checked against origin/dev on 2026-10-08:
     svn-be ee1db5ea9 · svn-web d8a43a11 · saramin-vn-admin 45954108. */
  'Application management': {
    title: 'Application management — một đơn đi qua ba site',
    lead:
      'Đời một đơn ứng tuyển: **ứng viên** nộp từ trang tin ở site jobseeker → **Saramin** giữ đơn lại nếu CV đi kèm chưa được duyệt, gửi đi khi CV được duyệt → **nhà tuyển dụng** kéo ứng viên qua các cột trên bảng của họ tới *Hired* hoặc *Rejected*. HQ đứng giữa, **giám sát** ở *Applications* và **quyết về CV** ở *CV review* — không bao giờ kéo cột thay công ty.',
    headline: [
      '**Một đơn mang ba trạng thái riêng, do ba bên giữ.** *Status* (*Applied … Withdrawn* — thứ ứng viên thấy), *trạng thái gửi* (*Not sent · Sent · Recall · Rejected* — cổng của Saramin) và *cột* trên bảng nhà tuyển dụng. HQ chỉ tự tay ghi được **một** thứ: *Reject* một đơn chưa gửi.',
      '**Đơn chỉ tới nhà tuyển dụng khi CV đi kèm đã được duyệt** — ngay lúc nộp nếu CV đã duyệt sẵn, hoặc đúng lúc HQ duyệt CV ở *CV review* (một lần duyệt gửi **mọi** đơn đang chờ CV đó). Từ chối CV sau khi đã gửi thì Saramin **kéo lại** (*Recall*) mọi đơn của CV đó.',
      '**Thứ nhà tuyển dụng nhận bị đóng băng lúc nộp** (file + nội dung CV, bản `v.n`). Sửa CV không đổi đơn đã giao; **xoá CV, khoá hay xoá tài khoản** thì mọi đơn **đang chạy** bị rút và từng công ty đang giữ đơn được báo ngừng dùng dữ liệu.',
    ],
    blocks: [
      { kind: 'h', text: '§0 · Ba site, năm màn hình' },
      {
        kind: 'table',
        cols: ['Màn hình', 'Site · đường dẫn', 'Ai dùng', 'Trả lời câu hỏi'],
        rows: [
          ['**How to apply**', 'Jobseeker site · `/jobs/:slug` (+ hộp Batch apply)', 'Ứng viên', 'Tôi nộp tin này bằng CV nào, và nộp thêm tin tương tự thế nào?'],
          ['**My applications**', 'Jobseeker site · `/my-profile/applications`', 'Ứng viên', 'Đơn của tôi tới đâu rồi, công ty đã xem chưa?'],
          ['**Applications**', 'Admin · `/recruitment/applications`', 'HQ', 'Đơn nào đang bị giữ, đơn nào đã tới công ty, công ty đang làm gì với nó?'],
          ['**CV review**', 'Admin · `/recruitment/cv-review`', 'HQ', 'CV đang nghi ngờ này có gửi được không? — quyết định này kéo theo mọi đơn của CV'],
          ['**Bảng ứng viên**', 'Company site · `/hiring/applicants`, `/hiring/jobs/:id/applicants`', 'Nhà tuyển dụng', 'Ai đã nộp tin của tôi, đang ở cột nào, chốt thế nào?'],
        ],
      },

      { kind: 'h', text: '§1 · Chuỗi một đơn, từng chặng' },
      {
        kind: 'table',
        cols: ['#', 'Chặng', 'Ai', 'Kết quả'],
        rows: [
          ['1', 'Bấm **Apply** trên tin *Open*, chọn CV trong thư viện, tick đồng ý, **Apply job**', 'Ứng viên', 'Một đơn *Applied*; file + nội dung CV chụp lại theo đơn'],
          ['2a', 'CV đã duyệt → **gửi ngay**', 'Hệ thống', '*Sent*, vào **cột đầu tiên** của tin; công ty được báo'],
          ['2b', 'CV tải lên còn chờ duyệt → **giữ lại**', 'Hệ thống', '*Not sent* — công ty không thấy gì'],
          ['3', 'Duyệt CV ở **CV review**', 'HQ', 'Mọi đơn *Not sent* của CV → *Sent* cùng lúc; công ty được báo'],
          ['3′', '…hoặc **Reject** riêng đơn ở *Applications*', 'HQ', '*Rejected* — điểm cuối, công ty không bao giờ thấy'],
          ['4', 'Kéo qua các cột giữa (*Interview 1*, *Final acceptance*…)', 'Nhà tuyển dụng', 'Status ứng viên thấy đổi theo loại cột: *Screening* / *Interview* / *Offered*'],
          ['5', '**Hired** hoặc **Rejected** (kèm một trong sáu lý do)', 'Nhà tuyển dụng', 'Điểm cuối; ứng viên được nộp lại tin đó'],
        ],
      },

      { kind: 'h', text: '§2 · Ba trạng thái trên một đơn' },
      {
        kind: 'table',
        note: 'Đây là bảng nên dùng để viết test case. Ba trục **không kéo nhau**: công ty chuyển cột không đổi trạng thái gửi; Saramin thu hồi không đổi status ứng viên thấy.',
        cols: ['Trục', 'Giá trị', 'Ai ghi', 'Ai thấy'],
        rows: [
          ['**Status**', '*Applied · Screening · Interview · Offered* (đang chạy) · *Hired · Rejected · Withdrawn* (đã đóng)', 'Ứng viên (nộp), nhà tuyển dụng (cột, chốt), HQ (*Reject*), hệ thống (*Withdrawn* khi khoá / xoá tài khoản, xoá CV)', '**Ứng viên** (*My applications*), công ty. Admin: **không có cột** cho nó'],
          ['**Trạng thái gửi**', '*Not sent · Sent · Recall · Rejected*', 'Hệ thống, theo phán quyết CV; HQ chỉ ghi *Rejected*', '**Chỉ HQ** (*Applications*). Công ty thấy gián tiếp: có dòng hay không, dòng có bị *Recalled* không'],
          ['**Cột của công ty**', 'Cột đầu · các cột giữa do công ty đặt tên · cột cuối · *Hired* / *Rejected*', '**Chỉ nhà tuyển dụng**', 'Công ty; HQ đọc ở *Stage · employer*'],
        ],
      },
      {
        kind: 'table',
        heading: 'Mỗi sự việc đổi trục nào',
        cols: ['Sự việc', 'Status', 'Trạng thái gửi', 'Cột', 'Công ty thấy'],
        rows: [
          ['Nộp, CV đã duyệt', '*Applied*', '*Sent*', 'Cột đầu', 'Dòng mới + email'],
          ['Nộp, CV tải lên chờ duyệt', '*Applied*', '*Not sent*', '—', 'Không gì'],
          ['HQ duyệt CV', '*Applied*', '*Not sent* → *Sent*', 'Cột đầu', 'Dòng mới + email'],
          ['HQ từ chối CV, đơn đã gửi', 'Giữ nguyên', '*Sent* → *Recall*', 'Bỏ khỏi cột', 'Dòng *Recalled by Saramin*, CV + liên hệ bị ẩn, khoá thao tác'],
          ['HQ từ chối CV, đơn chưa gửi', 'Giữ nguyên (*Applied*)', 'Giữ *Not sent*', '—', 'Không gì'],
          ['HQ *Reject* đơn', '*Rejected*', '*Rejected*', '—', 'Không gì'],
          ['Công ty chuyển cột giữa', 'Theo loại cột', 'Giữ *Sent*', 'Cột mới', '—'],
          ['Công ty *Hired* / *Rejected*', '*Hired* / *Rejected*', 'Giữ *Sent*', 'Cột cố định', 'Dòng ở cột chốt'],
          ['Công ty xoá ứng viên khỏi bảng', 'Giữ nguyên', 'Giữ nguyên', '—', 'Dòng biến mất (chỉ phía công ty)'],
          ['Rút: khoá / xoá tài khoản, xoá CV (chỉ đơn đang chạy)', '*Withdrawn*', 'Giữ nguyên', 'Bỏ khỏi cột', 'Dòng biến mất + email / chuông *ngừng dùng dữ liệu*'],
        ],
      },

      { kind: 'h', text: '§3 · Ai đổi được gì' },
      {
        kind: 'table',
        cols: ['Ai', 'Được', 'Không được'],
        rows: [
          ['**Ứng viên**', 'Nộp; nộp lại khi đơn cũ đã đóng; xoá CV; khoá / xoá tài khoản', 'Rút từng đơn trên web (API có, **chưa có nút**); đổi CV của đơn đã nộp'],
          ['**HQ**', 'Duyệt / từ chối **CV** (*CV review*, `cv_review:decide`); *Reject* đơn chưa gửi (*Applications*, `job:update`); khoá / xoá tài khoản (*Jobseeker users*, `candidate:manage`)', 'Gửi tay một đơn (đã bỏ); thu hồi từng đơn; chuyển cột; đặt *Withdrawn*; đụng vào đơn ứng viên đã rút'],
          ['**Nhà tuyển dụng**', 'Chuyển cột, *Hired* / *Rejected* + lý do, chuyển ≤ 200 đơn một lúc, xoá khỏi bảng, ghi chú, gắn sao (`applicant:manage`); xem (`applicant:read`)', 'Đụng vào đơn *Not sent* (không thấy), đơn *Recall* (chỉ đọc), đơn đã chốt (không mở lại)'],
        ],
      },

      { kind: 'h', text: '§4 · Ai được báo, lúc nào' },
      {
        kind: 'table',
        note: 'Mọi thông báo gửi **sau khi** thao tác đã lưu xong, và theo kiểu *cố gắng hết sức*: một email hỏng không bao giờ làm hỏng lần nộp hay lần duyệt.',
        cols: ['Sự kiện', 'Ai nhận', 'Kênh'],
        rows: [
          ['Nộp đơn thành công', 'Ứng viên', 'Thông báo trong site'],
          ['Đơn **tới công ty** (lúc nộp, hoặc lúc HQ duyệt CV)', 'Thành viên công ty có quyền xem ứng viên; email tới **người nhận hồ sơ** đặt trên tin (mục *Applications* của form tin) — tin không đặt ai thì tới chính các thành viên đó', 'Email + chuông'],
          ['Đơn bị **giữ** (*Not sent*)', 'Không ai', '—'],
          ['Công ty chuyển cột / *Hired* / *Rejected*', '**Không ai** — ứng viên tự xem ở *My applications*', '—'],
          ['HQ *Reject* đơn · HQ từ chối CV (*Recall*)', '**Không ai** được báo về đơn (ứng viên thấy CV bị từ chối ở trang CV của họ)', '—'],
          ['Ứng viên rút / khoá / xoá tài khoản / xoá CV', 'Thành viên công ty có quyền quản lý ứng viên — **chỉ công ty đang giữ đơn đã gửi**', 'Email + chuông *ngừng sử dụng dữ liệu*'],
          ['Sáng thứ Hai 08:00', 'Ứng viên', 'Email tổng hợp đơn trong tuần'],
        ],
      },

      { kind: 'h', text: '§5 · Đơn mang theo CV nào' },
      {
        kind: 'list',
        items: [
          '**Ứng viên chọn trong thư viện CV** (Saramin CV hoặc file tải lên). CV bị HQ từ chối thì không chọn được; CV *Not enough information* bị làm mờ trên site.',
          '**Lúc nộp, đơn giữ lại đúng file** đã chọn và **một bản chụp nội dung CV** theo ngôn ngữ lúc nộp. Ứng viên thay file (v.2) thì công ty vẫn giữ v.1 — Admin hiện `v.1/2` ở cột CV.',
          '**Ứng viên đọc lại được** đúng bản đã gửi qua *View application*. Đơn nộp trước khi có bản chụp (V607) ghi rõ là không còn bản lưu — nội dung đó không dựng lại được.',
          '**Xoá CV** là ngoại lệ duy nhất làm đơn đổi: đơn đang chạy bị rút, mọi đơn thôi trỏ tới file, công ty được báo xoá bản sao của họ.',
        ],
      },

      {
        kind: 'example',
        heading: 'Ví dụ — vì sao “đã nộp” mà công ty nói chưa thấy',
        scenario:
          'Ứng viên Minh gọi CS: *“Tôi nộp tin Kế toán của ABC từ thứ Hai, trang của tôi ghi Đã ứng tuyển, mà ABC nói không thấy hồ sơ.”*',
        cols: ['Kiểm ở đâu', 'Thấy gì', 'Nghĩa là'],
        rows: [
          ['*Applications*, lọc *Job* = tin Kế toán, tìm *Minh*', '*Application status* **Not sent**, *CV status* đang chờ duyệt', 'Đơn bị giữ — đúng như thiết kế, ABC chưa từng nhận'],
          ['*Overview* → *Overdue · 24h*', 'Đơn của Minh nằm trong số đếm', 'Hàng đợi CV review đang trễ'],
          ['*CV review*, tìm theo tên Minh', 'CV *CV_Minh.pdf* chờ quyết', 'Một lần **Duyệt** là đơn này — và mọi đơn khác Minh nộp bằng CV đó — đi ngay'],
          ['Sau khi duyệt: *Applications*', '**Sent**, Stage *CV screening*', 'ABC có dòng mới ở cột đầu và người nhận hồ sơ của tin có email'],
        ],
        note: 'Nếu thay vào đó *Application status* là **Sent** mà ABC vẫn nói không thấy: xem *Stage · employer* — có thể ABC đã **xoá ứng viên khỏi bảng** (đơn vẫn còn ở Admin), hoặc người ABC hỏi không có quyền xem ứng viên. Nếu là **Recall**: CV của Minh đã bị từ chối sau khi gửi.',
      },

      {
        kind: 'open',
        text:
          '**Những điểm cần khách quyết.** (1) **Rút đơn trên web** — có mở lại nút *지원 취소* không. (2) **Báo ứng viên khi công ty đổi chặng / chốt** — Saramin KR có gửi email, bản VN cố ý chưa (svn-be D-EJOB-4). (3) **Cho ứng viên thấy đơn bị thu hồi** và đơn bị giữ trên CV đã bị từ chối — hiện họ thấy *Applied* mãi. (4) **Thư xin việc** chưa được lưu lên đơn (xem *How to apply*). (5) **Máy quét CV tự động mặc định tắt** — khi tắt, rất ít đơn bị giữ; bật lên là từ lúc đó đơn bắt đầu nằm *Not sent* chờ người trực CV review (xem *Resume management*).',
      },
    ],
  },
}
