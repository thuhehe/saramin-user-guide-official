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
        src: '/shots/rec/jobs-list.jpg',
        where: 'Admin',
        caption: 'Danh sách tin: bốn ô *Overview* (*Expiring 7 days · Open, no applicants · Applications 7 days · Paid and running*), tab **All · Draft · Schedule · Open · Closed**, cột *Link job* mở tin trên site công khai, cột *Job type* là *Paid* / *Free*.',
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
        src: '/shots/rec/job-new-top.jpg',
        where: 'Admin',
        caption: '**New job posting** — mục *Posting setup*: *Company*, *Publish at* (để trống = đăng ngay), *Invoice* (mặc định *— none (Free job) —*), *Main product*, hai ô add-on (khoá cho tới khi có hoá đơn và Main product), *Exposure*, *Post anonymously*.',
      },
      {
        kind: 'shot',
        src: '/shots/rec/job-new-product.jpg',
        where: 'Admin',
        caption: 'Chọn công ty → thẻ công ty hiện ra; chọn **Invoice** *1C26TTD/0170* → *Main product* chỉ còn **các dòng đăng tin của hoá đơn đó còn quota** (ở đây: Tiêu Điểm 30 ngày và dòng tặng 15 ngày). Bên phải: danh sách *Still missing* trước khi Post được.',
        note: 'Băng vàng là một chốt thật: **công ty không có MST thì tin không lên Open được** — chỉ lưu nháp. Google Việt Nam là công ty nước ngoài, đã Verified và đã có hoá đơn, nhưng vẫn bị chặn ở đây.',
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
        src: '/shots/rec/job-detail.jpg',
        where: 'Admin',
        caption: 'Chi tiết một tin đang **Open**: nút *Edit · Applications · Add add-on · Close job* — không còn *Upgrade tier*. Khung *Posting state*: Exposure, **Current tier**, Add-ons, Publish at, **End date** (sửa được bằng bút chì).',
        note: '**Exposure độc lập với status**: tin có thể đang *Open* mà vẫn không ai thấy, nếu Exposure tắt.',
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
      '**Một dòng là một HỒ SƠ ỨNG TUYỂN, không phải một người.** Ứng viên nộp ba tin là ba dòng. Bảng gom hồ sơ của **mọi công ty** để Operator và Admin / CS giữ **cổng gửi** của Saramin: hồ sơ nào đang bị giữ, hồ sơ nào đã tới nhà tuyển dụng (NTD), và NTD đang để thẻ ở đâu. (Tên cũ *Applicants*; đường dẫn cũ `/recruitment/applicants` vẫn chuyển hướng và **giữ nguyên bộ lọc**.)',
      '**Một nguồn dữ liệu, nhiều góc nhìn.** Mỗi hồ sơ lưu trạng thái một lần; màn này đọc đúng dữ liệu mà NTD và ứng viên đọc. Bốn thứ hiện cạnh nhau: **CV Status** (*Qualified · Cannot Read · Not Enough Information · Rejected*), **Application Status** (*Not Sent · Sent · Recall* — chỉ 3 giá trị), **Stage · Employer** (vị trí thẻ trên Kanban của NTD, chỉ đọc) và **2 flag** *Viewed* / *Downloaded*.',
      '**Không có nút gửi tay.** Hồ sơ tới NTD **ngay lúc nộp** khi CV là *Qualified*; nếu không thì nằm *Not Sent* cho tới khi Operator **Approve** — một lần Approve gửi **mọi** hồ sơ đang chờ dùng cùng phiên bản CV, ở mọi công ty.',
      '**Approve, Reject, Recall là quyết định trên PHIÊN BẢN CV**, không trên riêng một hồ sơ: chúng áp cho mọi hồ sơ dùng cùng phiên bản CV đó. Phiên bản CV khác và CV khác của cùng ứng viên không đổi. Chi tiết: **Candidate management §4**.',
      '**Thứ NTD nhận bị đóng băng lúc nộp.** File CV và nội dung CV được chụp lại theo hồ sơ; ứng viên sửa hay thay CV sau đó không đổi hồ sơ đã gửi. Cột CV ghi `v.1/2` khi NTD giữ v.1 mà ứng viên đã có v.2.',
      'Mọi bộ lọc nằm trong URL — gửi link cho đồng nghiệp là họ thấy đúng màn hình bạn đang xem.',
    ],
    how: [
      '**Tìm một hồ sơ:** gõ tên / email ứng viên, tên tin hoặc tên công ty vào ô tìm (khớp theo đầu từ, mọi từ phải khớp), hoặc mở **Filters** chọn *Company* / *Job*. Từ trang chi tiết một tin, nút **Applications (N)** mở sẵn bảng này lọc theo tin đó.',
      '**Hàng đợi của Operator:** tab **Not sent** → lọc *CV Status = Cannot Read* hoặc *Not Enough Information* → ⋮ → **Approve** hoặc **Reject** (bắt buộc chọn lý do). Đọc **số hồ sơ và số công ty bị ảnh hưởng** trong hộp thoại trước khi xác nhận.',
      '**Thu hồi một hồ sơ đã gửi (Admin / CS):** trên dòng *Sent* → ⋮ → **Recall** → chọn 1 trong 4 lý do → ghi chú nội bộ (bắt buộc, ≤ 500 ký tự) → xác nhận. **Không hoàn tác.**',
      '**Xem CV bị từ chối:** tab *Not sent* → lọc *CV Status = Rejected*. Không có tab *Rejected*.',
      '**Mở hồ sơ:** bấm vào dòng (hoặc tên file CV) — trang chi tiết mở ở **tab mới**, danh sách giữ nguyên trang và bộ lọc. Bấm tên ứng viên mở **tài khoản** của họ ở *Jobseeker users*.',
      '**Tìm việc tồn:** bật **Overview** để xem bốn ô số. **Export** tải file Excel theo đúng bộ lọc đang chọn.',
    ],
    watch: [
      '**“Rejected” là CV Status, không phải Application Status.** Cột *Application Status* chỉ in *Not Sent · Sent · Recall*, không bao giờ in *Rejected*.',
      '**Operator hoặc Admin mở / tải CV ở đây KHÔNG bật flag** Viewed / Downloaded — hai cột này chỉ phản ánh hành động của NTD.',
      '**Recall không hoàn tác được** — ứng viên không nộp lại được vào job đó (*CV review §6*). Recall chỉ làm được từ hồ sơ *Sent*, và chỉ Admin / CS.',
      'Hai Operator cùng xử lý 1 CV: thao tác đầu tiên được lưu, người sau nhận *“CV đã được xử lý”*.',
      'Mở hồ sơ ứng viên là chạm dữ liệu cá nhân và **bị ghi log** — cả lần mở danh sách (kèm số dòng) lẫn lần mở từng hồ sơ (`application.read`).',
      'Cách diễn đạt *Not Sent* / *Cannot Read* / *Not Enough Information* là **chỉ dành cho Admin**. Ứng viên ở đầu kia của dòng đó thấy **In Review**.',
    ],
    blocks: [
      {
        kind: 'p',
        text:
          'Trạng thái và thao tác theo tài liệu *Candidate Management: Luồng trạng thái ứng tuyển* (14/10/2026). Phần còn lại của màn hình (tìm, Overview, trang chi tiết) theo build 08/10/2026: `saramin-vn-admin` `45954108` · `svn-be` `ee1db5ea9`. Toàn bộ luồng qua ba site nằm ở trang **Candidate management**.',
      },

      { kind: 'h', text: '§1 · Các cột trạng thái — đọc đúng chủ của từng cột', path: '/recruitment/applications' },
      {
        kind: 'table',
        heading: 'Trạng thái trên một hồ sơ ứng tuyển',
        note: 'Thứ tự cột: **CV Status · Application Status · Stage · Employer · Viewed · Downloaded**. Admin không bao giờ ghi được Stage hay 2 flag.',
        cols: ['Cột', 'Ai làm thay đổi', 'Giá trị'],
        rows: [
          ['**CV Status**', 'Hệ thống (tự động), Operator (Approve / Reject), Admin / CS (Recall)', 'Qualified · Cannot Read · Not Enough Information · Rejected'],
          ['**Application Status**', 'Hệ thống (Sent khi Qualified), Admin / CS (Recall)', 'Not Sent · Sent · Recall — **3 giá trị**; thêm *Withdrawn* khi *Withdraw application* triển khai xong'],
          ['**Stage · Employer**', '**NTD** (kéo thẻ) — Admin chỉ đọc', 'Application Received · In Process (gom mọi cột giữa) · Passed · Not This Time. “—” khi Not Sent'],
          ['**Viewed**', 'NTD mở chi tiết CV (lần đầu)', '✓ kèm ngày. “—” nếu chưa hoặc Not Sent'],
          ['**Downloaded**', 'NTD tải CV, từng file hoặc Download All (lần đầu)', '✓ kèm ngày. “—” nếu chưa hoặc Not Sent'],
        ],
      },
      {
        kind: 'table',
        heading: 'Năm tổ hợp hợp lệ (CV Status · Application Status)',
        note: 'Không có tổ hợp nào khác — *Qualified · Not Sent*, *Rejected · Sent*, *Qualified · Recall* đều là **dữ liệu sai**; gặp thì báo lỗi.',
        cols: ['CV Status', 'Application Status', 'Nghĩa là', 'Ứng viên thấy'],
        rows: [
          ['Qualified', 'Sent', 'Đã đạt và đã gửi; thẻ ở Kanban của NTD', 'Theo thẻ và flag (Application Received / Viewed / Saved / In Process / Passed / Not This Time)'],
          ['Cannot Read', 'Not Sent', 'Chờ Operator xử lý', 'In Review'],
          ['Not Enough Information', 'Not Sent', 'Chờ Operator xử lý', 'In Review'],
          ['Rejected', 'Not Sent', 'Bị từ chối trước khi gửi, kết thúc', 'Invalid Application'],
          ['Rejected', 'Recall', 'Đã gửi rồi bị thu hồi, kết thúc', 'Application Withdrawn'],
        ],
      },
      {
        kind: 'warn',
        text:
          '**Recall không phải ứng viên tự rút.** Recall nói *“đã tới công ty, rồi Saramin lấy lại”* — ứng viên **không tự thu hồi được** hồ sơ. Pipeline Status và 2 flag **giữ nguyên** giá trị lúc Recall để Admin tra cứu, nên cột Stage vẫn hiện vị trí thẻ lúc bị thu hồi.',
      },

      { kind: 'h', text: '§2 · Danh sách — cột, tab, lọc, xuất' },
      {
        kind: 'table',
        heading: 'Cột (ẩn bớt bằng *chọn cột*)',
        cols: ['Cột', 'In gì', 'Bấm vào'],
        rows: [
          ['**Candidate**', 'Họ tên trên CV. Tag *Deleted account* khi ứng viên đã xoá tài khoản; sau khi xoá hẳn (72 giờ) tag thay cho tên và không còn link', 'Mở **tài khoản** ở *Jobseeker users* (tab mới) — không phải CV'],
          ['**CV**', 'Dòng 1: tên CV ứng viên đặt (hoặc tên file). Dòng 2: chip nguồn — *Saramin CV* · *Upload* · *Profile* — và phiên bản `v.1/2`', 'Tên CV mở **trang chi tiết** (tab mới)'],
          ['**Basic information**', '*Giới tính · ngày sinh · quốc tịch* trên *học vấn cao nhất · số năm kinh nghiệm*', '—'],
          ['**Work preference**', 'Vị trí / ngành mong muốn trên nơi làm, mức lương, hình thức', '—'],
          ['**Contact**', 'Email trên số điện thoại', '—'],
          ['**Applied to**', 'Tên tin', 'Mở tin trong console (tab mới)'],
          ['**Company**', 'Tên công ty', 'Mở hồ sơ công ty ở CRM (tab mới)'],
          ['**CV Status** · **Application Status** · **Stage · Employer** · **Viewed** · **Downloaded**', 'Năm cột trạng thái ở §1, đúng thứ tự này. 2 cột flag chỉ đọc, **hover hiện đầy đủ ngày giờ**', '—'],
          ['**Applied**', 'Bao lâu trước (*3 days ago*); rê chuột thấy giờ chính xác', '—'],
          ['**Actions** (⋮)', '*View details* · *Approve* · *Reject* · *Recall* — theo trạng thái (§3)', '—'],
        ],
      },
      {
        kind: 'table',
        heading: 'Tab',
        cols: ['Tab', 'Điều kiện lọc'],
        rows: [
          ['**All**', 'Tất cả'],
          ['**Not sent**', 'Application Status = Not Sent (gồm Cannot Read, Not Enough Information, Rejected)'],
          ['**Sent**', 'Application Status = Sent'],
          ['**Recall**', 'Application Status = Recall'],
          ['**Withdrawn** — *đang triển khai*', 'Application Status = Withdrawn (ứng viên xin rút đơn, CS thực hiện — **CV review §7**)'],
        ],
      },
      {
        kind: 'list',
        heading: 'Lọc, tìm, sắp xếp, xuất',
        items: [
          '**Không có tab *Rejected*.** Xem CV bị từ chối: tab *Not sent* rồi lọc *CV Status = Rejected*. Xem hàng đợi chờ Operator: tab *Not sent* rồi lọc *CV Status = Cannot Read* hoặc *Not Enough Information*.',
          '**Ô tìm** (*Search all columns…*): khớp **đầu từ** trong tên + email ứng viên, tên tin và tên công ty; gõ nhiều từ thì **mọi từ** phải khớp ở đâu đó.',
          '**Filters**: *Company* · *Job* · **CV Status** (chọn nhiều giá trị) · **Viewed** (Có / Chưa) · **Downloaded** (Có / Chưa) · *Stage* · *Location* (so với **địa chỉ tự do trên CV**, không phải địa điểm của tin) · *CV type* (*Saramin CV · Upload · Profile*).',
          '**Applied** ở đầu trang: khoảng ngày nộp — chọn sẵn (*This week*, *This month*…) hoặc tự chọn.',
          '**Sort**: *Newest applied* (mặc định) · *Oldest applied* · *Candidate A → Z* · *Candidate Z → A*.',
          '**Export** (cần `job:export`): file Excel theo bộ lọc + tab đang chọn, có thêm **4 cột** *Viewed (Yes / No)*, *Viewed at*, *Downloaded (Yes / No)*, *Downloaded at*. Tải về từ *Export history*.',
        ],
      },
      {
        kind: 'table',
        heading: 'Overview — bốn ô số (nút *Overview* ở đầu trang bật / tắt, nhớ theo trình duyệt)',
        note: 'Bốn ô tính trên **cùng bộ lọc với bảng, trừ tab**.',
        cols: ['Ô', 'Đếm gì', 'Dùng để'],
        rows: [
          ['**Overdue · 24h**', 'Hồ sơ *Not Sent* nằm quá **24 giờ** chưa có quyết định', 'Việc trễ của Operator'],
          ['**New · 7 days**', 'Hồ sơ nộp trong 7 ngày qua', 'Lượng vào mà cổng phải theo kịp'],
          ['**Waiting on employer**', 'Hồ sơ đã gửi mà NTD **7 ngày chưa kéo thẻ**', 'Danh sách gọi điện của CS / Sales'],
          ['**Avg time to rule**', 'Số giờ trung bình từ lúc nộp tới quyết định của Operator, 7 ngày qua. *—* khi 7 ngày không có quyết định nào', 'Đo tốc độ cổng'],
        ],
      },

      { kind: 'h', text: '§3 · Thao tác: Approve, Reject, Recall (menu ⋮)' },
      {
        kind: 'table',
        heading: 'Thao tác theo trạng thái',
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
        kind: 'table',
        heading: 'Một thao tác làm gì với mọi hồ sơ dùng cùng phiên bản CV',
        cols: ['Thao tác', 'Hồ sơ đang là', 'Sau thao tác', 'Ứng viên thấy'],
        rows: [
          ['**Approve**', 'Đang chờ (Cannot Read / Not Enough Information · Not Sent)', 'Qualified · Sent, tạo thẻ ở cột Application Received của từng công ty; NTD nhận email', 'Application Received'],
          ['**Approve**', 'Rejected, hoặc đã Sent', 'Không đổi', 'Không đổi'],
          ['**Reject / Recall**', 'Chưa gửi (Not Sent)', 'Rejected · Not Sent', 'Invalid Application'],
          ['**Reject / Recall**', 'Đã gửi (Sent, bất kỳ cột nào)', 'Rejected · Recall', 'Application Withdrawn'],
        ],
      },
      {
        kind: 'list',
        heading: 'Luật của từng thao tác',
        items: [
          '**Reject:** bắt buộc chọn lý do. Hồ sơ chưa gửi → Rejected · Not Sent, NTD không bao giờ thấy. Hồ sơ đã gửi dùng cùng phiên bản CV → Rejected · Recall.',
          '**Recall:** chỉ Admin / CS, chỉ từ hồ sơ *Sent* (ở bất kỳ cột nào). Chọn 1 trong 4 lý do — *Can’t read · Not a CV · CV but not enough information · Khác* — rồi nhập **ghi chú nội bộ** (bắt buộc, ≤ 500 ký tự); *Khác* có thêm ô lý do (bắt buộc, ≤ 200 ký tự). **Lý do nào cũng cùng kết quả.** Lý do và ghi chú chỉ lưu nội bộ.',
          '**Hộp thoại** của cả ba thao tác hiện **số hồ sơ và số công ty bị ảnh hưởng** trước khi xác nhận.',
          '**Lịch sử** của từng hồ sơ: ai thao tác, lúc nào, lý do, theo hồ sơ nào.',
        ],
      },

      { kind: 'h', text: '§4 · Trang chi tiết hồ sơ', path: '/recruitment/applications/:id' },
      {
        kind: 'table',
        note: 'Mở ở tab mới từ dòng hoặc tên CV. Hồ sơ không tồn tại và hồ sơ ngoài phạm vi của bạn trả **cùng một lỗi** (*“It does not exist, or it is outside the jobs you have access to.”*) — cố ý, để không dò được hồ sơ của công ty khác.',
        cols: ['Khung', 'Đọc để biết'],
        rows: [
          ['**Thẻ ứng viên**', 'Họ tên, ứng tuyển lúc nào, tag *Deleted account* nếu có.'],
          ['**Application**', 'Tên CV (*CV:*), nút *Open file*, chip nguồn, *CV Status*, và khối **CV version**: bản nào đang hiển thị trên tổng số bản (`v.1/2`).'],
          ['**Contact**', 'Email, điện thoại, số năm kinh nghiệm.'],
          ['**Working preference set by the user**', 'Nghề, ngành, nơi làm, lương, hình thức mong muốn.'],
          ['**CV**', 'File ứng viên **đã gửi** được nhúng ngay trên trang (PDF), rồi các mục CV đã phân tích.'],
        ],
      },
      {
        kind: 'warn',
        text:
          '**File và các mục phân tích có thể là hai phiên bản khác nhau.** File nhúng là **đúng bản NTD đã nhận lúc nộp** (`v.1`); các mục phân tích bên dưới đọc CV **hiện tại** của ứng viên (`v.2`). Khi tranh chấp *“tôi đã gửi gì”*, **tin file, không tin các mục**.',
      },

      { kind: 'h', text: '§5 · Ai đổi được gì trên một hồ sơ' },
      {
        kind: 'table',
        cols: ['Ai', 'Làm được', 'Hồ sơ đổi thế nào'],
        rows: [
          ['**Ứng viên**', 'Nộp · xoá CV · khoá hoặc xoá tài khoản. **Không** tự thu hồi được hồ sơ', 'Tạo hồ sơ mới'],
          ['**Hệ thống**', 'Kiểm tra CV lúc nộp', 'Qualified → *Sent*, tạo thẻ ở Application Received, email cho NTD · Cannot Read / Not Enough Information → *Not Sent*'],
          ['**Operator**', '**Approve** / **Reject** hồ sơ đang chờ', 'Áp cho mọi hồ sơ cùng phiên bản CV (§3)'],
          ['**Admin / CS**', '**Recall** hồ sơ đã gửi (cùng Approve / Reject)', '→ Rejected · Recall, áp cho mọi hồ sơ cùng phiên bản CV. Không hoàn tác'],
          ['**NTD**', 'Kéo thẻ giữa các cột · mở / tải CV', 'Đổi Pipeline Status · bật flag Viewed / Downloaded (lần đầu). Chỉ trên hồ sơ *Sent*'],
        ],
      },

      { kind: 'h', text: '§6 · Khoá / xoá tài khoản, xoá CV' },
      {
        kind: 'table',
        note: 'Theo build 08/10/2026. Hồ sơ **đang chạy** bị rút khỏi bảng của NTD; hồ sơ đã ở cột cuối giữ nguyên.',
        cols: ['Cách', 'Ai bấm', 'NTD được báo', 'Trên bảng này'],
        rows: [
          ['**Ứng viên tự khoá tài khoản**', 'Ứng viên', 'Có — mỗi hồ sơ đã gửi một thông báo *ngừng sử dụng dữ liệu*', 'Không nhãn riêng'],
          ['**Admin *Deactivate***', 'HQ ở *Jobseeker users*', 'Có, như trên', 'Không nhãn riêng'],
          ['**Xoá tài khoản** (ứng viên tự xoá, hoặc Admin *Delete*)', 'Ứng viên / HQ', 'Có — một thông báo *tài khoản đã xoá*', 'Tag *Deleted account*; sau 72 giờ dữ liệu cá nhân bị xoá hẳn: tag thay cho tên'],
          ['**Xoá một CV**', 'Ứng viên', 'Có, cho hồ sơ gửi bằng CV đó', '*“CV deleted by candidate”*'],
          ['**Admin *Reactivate* / *Restore***', 'HQ', '—', '**Không khôi phục** hồ sơ đã rút — ứng viên phải nộp lại'],
        ],
      },
      {
        kind: 'open',
        text: '**Hồ sơ bị rút do khoá / xoá tài khoản hoặc xoá CV chưa có trong 9 trạng thái ứng viên thấy.** *Application Withdrawn* trong tài liệu 14/10 chỉ dành cho hồ sơ bị **Recall**. Cần chốt: các hồ sơ này hiện trạng thái gì, Application Status là gì, và có nhãn riêng trên bảng này không.',
      },
      {
        kind: 'warn',
        text:
          '**Khoá một người dùng KHÔNG từ chối CV của họ.** Nó chặn đăng nhập, gỡ họ khỏi CV search và rút các hồ sơ đang xử lý — nhưng CV Status giữ nguyên. Muốn CV bị từ chối thì phải **Reject / Recall** — một thao tác riêng, có chủ đích.',
      },

      { kind: 'h', text: '§7 · Phía NTD — chuyện gì xảy ra sau khi hồ sơ được gửi' },
      {
        kind: 'table',
        note: '**Admin không bao giờ kéo thẻ thay NTD.** Kanban của mỗi tin: **Application Received** (cột đầu cố định) · các cột giữa do NTD thêm / xóa / đổi tên (*In Process*) · **Passed** và **Not This Time** (2 cột cuối cố định). Job mới mặc định: Application Received, Interview 1, Interview 2, Passed, Not This Time. Chi tiết: **Candidate management §5**.',
        cols: ['Điều', 'Chi tiết'],
        rows: [
          ['**Chỉ hồ sơ Sent lên Kanban**', 'Hồ sơ Not Sent **không bao giờ** xuất hiện — kể cả ô đếm, tìm kiếm, filter, Download All. Chặn ở tầng API.'],
          ['**Liên hệ mở sẵn**', 'Nộp đơn **chính là sự đồng ý của ứng viên**, nên liên hệ trên bảng ứng viên mở sẵn, không tốn credit.'],
          ['**Passed / Not This Time không phải điểm khoá**', 'NTD vẫn kéo thẻ **vào và ra** hai cột cuối được.'],
          ['**Hồ sơ đã Recall**', 'Nhãn thu hồi, toàn bộ thông tin CV **bị khoá** (không xem, không tải, không kéo thẻ), nhận email.'],
          ['**Ứng viên được cập nhật ngay**', 'Mỗi lần kéo thẻ đổi trạng thái ứng viên thấy trên *Việc đã ứng tuyển* ngay, không email lẻ; cuối tuần có 1 email tổng hợp.'],
        ],
      },

      {
        kind: 'example',
        heading: 'Ví dụ — một CV, ba hồ sơ, từ lúc nộp tới lúc thu hồi',
        scenario:
          'Lan tải lên *CV_Lan.pdf* (bản 1.1), file thiếu mục Work Experience dù Lan chọn *Experienced* → **Not Enough Information**. Lan nộp tin *Kế toán* của công ty X, rồi nộp thêm hai tin của công ty Y và Z — cùng bản CV.',
        cols: ['Bước', 'Lan thấy (Việc đã ứng tuyển)', 'Applications (Admin)', 'NTD thấy'],
        rows: [
          ['1 · Nộp ba tin', '*In Review* ×3', '3 dòng Not Enough Information · **Not Sent**, Stage “—”. Ô *Overdue · 24h* bắt đầu đếm sau 24 giờ', 'Không gì cả'],
          ['2 · Operator **Approve** một dòng (hộp thoại: 3 hồ sơ, 3 công ty)', '*Application Received* ×3', 'Cả 3 dòng sang Qualified · **Sent** cùng lúc, Stage *Application Received*', 'X, Y, Z: mỗi công ty một thẻ mới ở cột đầu + email'],
          ['3 · X mở CV, rồi tải CV', 'Đơn X: *Application Viewed* → *Application Saved*', 'Đơn X: ✓ Viewed, ✓ Downloaded', '—'],
          ['4 · X kéo Lan sang *Interview 1*', 'Đơn X: *In Process*', 'Đơn X: Stage *In Process*', 'X: thẻ ở *Interview 1*'],
          ['5 · Y kéo Lan sang *Not This Time*', 'Đơn Y: *Not This Time*', 'Đơn Y: Stage *Not This Time*', '—'],
          ['6 · CS **Recall** đơn Z (lý do *Not a CV*)', 'Cả 3 đơn: *Application Withdrawn*', 'Cả 3 dòng: Rejected · **Recall**; Stage giữ vị trí lúc thu hồi', 'X, Y, Z: nhãn thu hồi, thông tin CV bị khoá, mỗi công ty nhận email'],
        ],
        note: 'Bước 6 là chỗ dễ quên nhất: Recall một hồ sơ thu hồi **mọi** hồ sơ dùng cùng bản CV 1.1 — kể cả đơn X đang ở *Interview 1*. Nếu Lan đã nộp X bằng một **bản CV khác**, đơn X không bị đụng tới.',
      },

      {
        kind: 'open',
        text:
          '**Còn cần chốt.** (1) Nộp lại vào job sau Recall — tài liệu và chữ trên hộp Recall nói khác nhau (**CV review §6**). (2) Hồ sơ nộp trong lúc CV đang bóc tách (~3 phút): chặn nút tạo CV, hay giữ Not Sent rồi tự xử lý. (3) Hồ sơ bị rút do khoá / xoá tài khoản (§6). (4) Hiện tên từng vòng ở cột Stage (*In Process · Interview 1*) là **giai đoạn 2**.',
      },
      {
        kind: 'p',
        text: '**Màn hình thật** — chụp trên dev ngày 08/10/2026, **trước** khi đổi theo tài liệu 14/10 (ảnh còn tab *Rejected*, chưa có cột Viewed / Downloaded).',
      },
      {
        kind: 'shot',
        src: '/shots/rec/applications-list.jpg',
        where: 'Admin',
        caption: 'Danh sách hồ sơ (bản 08/10): bốn ô Overview và các tab trạng thái. Mỗi dòng ghi CV nào (tải lên hay CV Saramin, version mấy).',
      },
      {
        kind: 'shot',
        src: '/shots/rec/application-detail.jpg',
        where: 'Admin',
        caption: 'Chi tiết một hồ sơ **Sent** (bản 08/10): hồ sơ ứng viên, mong muốn công việc, bản CV đúng version đã nộp; bên phải *Contact* và khung *Application* với **CV Status**.',
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
      '**Nộp được không có nghĩa là đã tới nhà tuyển dụng.** CV *Qualified* thì đơn đi ngay (*Sent*); file upload *Cannot Read* / *Not Enough Information* thì đơn được tạo nhưng **giữ lại** (*Not Sent*) tới khi Operator xử lý — ứng viên thấy **In Review**.',
      'Mọi đơn đã nộp nằm ở **Việc đã ứng tuyển** (*My applications*, `/my-profile/applications`), mỗi đơn hiện **1 trong 9 trạng thái** và kèm đúng bản CV đã gửi.',
    ],
    how: [
      'Mở trang chi tiết của bất kỳ tin nào → bấm **Apply**. Panel bên phải mở ra: **Selected CV** (đổi bằng **Change CV**), **Cover letter**, ô đồng ý về xử lý dữ liệu cá nhân → bấm **Apply job**.',
      'Nộp xong, hộp **Job application complete!** hiện danh sách tin tương tự. Tick tối đa 5 tin → **Batch apply** → đọc bước xác nhận *Before you apply to {n} jobs* → **Confirm**.',
      'Kiểm tra phía Admin: đơn vừa nộp hiện ở **Applications** (lọc theo tin), *Not Sent* hay *Sent* tuỳ CV Status.',
    ],
    watch: [
      '**Chưa đăng nhập, hoặc đang đăng nhập bằng tài khoản nhà tuyển dụng** → bấm Apply chỉ mở lời mời đăng nhập, không mở panel.',
      '**Batch apply gửi cùng một CV và không kèm cover letter**, mỗi tin một đơn riêng. Cây bút cạnh tên CV trong hộp chỉ đổi **tên hiển thị** của CV — **không** đổi CV được gửi đi.',
      '**Hộp Batch apply chỉ hiện khi có gợi ý.** Tin vừa nộp không còn tin Open nào cùng ngành nghề thì nộp xong là xong — không phải lỗi.',
      '**Build 08/10 làm mờ mọi CV *Not enough information*, kể cả file tải lên** — trong khi tài liệu 14/10 cho file upload thiếu trường **nộp được** và giữ ở *Not Sent* (*In Review*, AC3). Ứng viên báo *“CV của tôi không chọn được”* thì xem CV Status ở *CV review* / *Talent pool*.',
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
        kind: 'shot',
        src: '/shots/cv/apply-cv-picker.png',
        where: 'Jobseeker site',
        caption: '**Change CV** mở danh sách mọi CV của ứng viên (*Select the resume you wish to apply for.*), mỗi CV có *Edit* và *Preview*; **Upload CV** ở cuối danh sách.',
        note: 'Ảnh chụp trên dev ngày 15/10/2026.',
      },
      {
        kind: 'list',
        items: [
          '**Change CV** mở danh sách **mọi** CV của ứng viên, kể cả CV không hiển thị cho NTD.',
          'CV **Unfinished** bị làm mờ, không chọn được.',
          '**Upload CV** ở cuối danh sách: chuyển sang trang Upload, tải xong quay lại job.',
          'Mỗi ứng viên **chỉ nộp được 1 lần vào mỗi job**. Bấm Apply ở job đã nộp sẽ hiện *You’ve applied for this job* kèm nút **Go to My applications**. Trạng thái sau khi nộp: **Candidate management**.',
        ],
      },
      {
        kind: 'table',
        heading: 'Server kiểm gì khi nhận một lần nộp — theo đúng thứ tự',
        note: 'Mọi kiểm tra chạy **trong một giao dịch**: hỏng ở bước nào thì không có gì được ghi (không đơn nửa vời, không bộ đếm nhảy). Batch apply chạy đúng chuỗi này cho **từng** tin.',
        cols: ['#', 'Kiểm', 'Không đạt thì'],
        rows: [
          ['1', '**Tin còn nhận đơn**: *Open* · Exposure On · công ty Active **và có MST** · chưa qua hạn hiển thị', '*This job posting is no longer available.* — cùng một câu cho tin không tồn tại, bị ẩn hay đã hết hạn; **kể cả người từng nộp tin đó**'],
          ['2', '**Chưa có đơn đang chạy** vào tin này', '*You have already applied to this job.* Mỗi ứng viên **chỉ nộp 1 lần vào mỗi job** — kể cả khi hồ sơ cũ đã bị Recall (*CV review §6*, còn chưa chốt)'],
          ['3', '**Đồng ý đúng phiên bản hiện hành** của văn bản xử lý dữ liệu', 'Bị từ chối — phiên bản cũ (mở panel từ trước khi văn bản đổi) không được ghi nhận'],
          ['4', '**CV thuộc đúng ứng viên** và **chưa bị HQ từ chối**', '*That CV can’t be sent yet. Pick another one.* — panel vẫn mở để chọn CV khác'],
          ['5', 'Tạo đơn, **chụp lại** file + nội dung CV theo đơn, ghi nguồn (UTM / referrer lần chạm đầu)', '—'],
          ['6', '**Gửi ngay hay giữ lại**: CV *Qualified* → đơn *Sent*, thẻ ở cột **Application Received** của tin, công ty nhận email. *Cannot Read* / *Not Enough Information* → *Not Sent* tới khi Operator Approve hoặc Reject', '—'],
        ],
      },
      {
        kind: 'table',
        heading: 'Khi nộp không được',
        cols: ['Tình huống', 'Ứng viên thấy'],
        rows: [
          ['Đã có đơn **đang chạy** vào tin này', '*You have already applied to this job.* Mỗi job chỉ nộp 1 lần, kể cả sau Recall.'],
          ['Tin vừa đóng / hết hạn / bị ẩn trong lúc đang mở panel', '*This job posting is no longer available.*'],
          ['CV không gửi được', '*That CV can’t be sent yet. Pick another one.* — panel vẫn mở để chọn CV khác.'],
          ['Nộp quá **20 lần / phút** (tính theo tài khoản)', '*Too many requests. Please try again in a moment.* Ngoài giới hạn này **không có trần** số đơn.'],
          ['Nội dung quá dài (vượt giới hạn ô)', '*Your input is too long. Please shorten it.*'],
        ],
      },
      {
        kind: 'warn',
        text:
          '**Nộp được không có nghĩa là đã tới nhà tuyển dụng.** Đơn nộp bằng **file upload Cannot Read / Not Enough Information** vẫn được tạo — ứng viên thấy **In Review** — nhưng nằm ở **Not Sent** cho tới khi Operator xử lý: Approve thì đơn tự đi (*Application Received*), Reject thì kết thúc (*Invalid Application*). Đơn đã gửi mà phiên bản CV đó bị Reject / Recall thì bị **thu hồi** (*Application Withdrawn*). Saramin CV không thể chưa đạt — nút Lưu / Nộp bị khoá tới khi đủ trường bắt buộc. Xem **Candidate management**, **CV review** và **Applications**.',
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

      { kind: 'h', text: '§3 · Sau khi nộp — Việc đã ứng tuyển (My applications)', path: '/my-profile/applications' },
      {
        kind: 'table',
        heading: '9 trạng thái ứng viên thấy',
        note: 'Nhãn có màu, theo ngôn ngữ trang (EN / VI), thay cho chữ *Applied* cố định trước đây; hover hoặc bấm vào nhãn hiện mô tả ngắn. Giá trị do hệ thống tính — cách tính đầy đủ ở **Candidate management §6**.',
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
        kind: 'list',
        items: [
          'Ứng viên **không thấy**: CV Status, Application Status, tên cột do NTD đặt, thời điểm NTD xem / tải, lý do Reject / Recall, ghi chú nội bộ.',
          '**Không có** nút sửa, thu hồi hay xóa hồ sơ ở bất kỳ trạng thái nào. Nút **View application** giữ ở mọi trạng thái và mở đúng bản CV đã gửi.',
          'Trạng thái cập nhật **không cần tải lại trang** khi có thay đổi.',
          '**3 thẻ tổng hợp** (đếm theo bộ lọc thời gian đang chọn): *Job applied* — mọi hồ sơ · *Selection in progress* — hồ sơ In Process · *Selected* — hồ sơ Passed.',
          '**Bộ lọc:** *Thời gian* (giữ như hiện tại) · *Tất cả trạng thái* (9 trạng thái, thứ tự 1 → 9) · *Trạng thái tin đăng* (job còn mở / đã đóng — không liên quan tới trạng thái hồ sơ) · *Tìm kiếm* (giữ như hiện tại).',
        ],
      },
      {
        kind: 'table',
        heading: 'Chuyện xảy ra ở phía sau — ứng viên thấy gì',
        note: 'Ứng viên **không bao giờ** nhận email lẻ cho mỗi lần đổi trạng thái — chỉ thấy ngay trên màn hình, cộng **1 email tổng hợp cuối tuần** gom theo nhóm trạng thái.',
        cols: ['Ở phía sau', 'Việc đã ứng tuyển đọc'],
        rows: [
          ['Nộp bằng CV *Qualified* (Saramin CV, hoặc file đọc được và đủ trường)', '*Application Received*'],
          ['Nộp bằng file *Cannot Read* / *Not Enough Information*', '*In Review*'],
          ['Operator **Approve** (từ hồ sơ này hay hồ sơ khác cùng phiên bản CV)', '*Application Received*'],
          ['Operator **Reject**, hồ sơ chưa gửi', '*Invalid Application*'],
          ['NTD mở CV / tải CV khi thẻ ở cột Application Received', '*Application Viewed* / *Application Saved*'],
          ['NTD kéo thẻ sang cột giữa / Passed / Not This Time', '*In Process* / *Passed* / *Not This Time*'],
          ['Admin / CS **Recall** — hoặc cùng phiên bản CV bị Reject ở hồ sơ khác — khi hồ sơ đã gửi', '*Application Withdrawn*'],
          ['Phiên bản CV **khác** bị Reject / Recall', 'Không đổi'],
        ],
      },
      {
        kind: 'open',
        text:
          '**Nộp lại cùng một tin.** Tài liệu *Create CV* và *CV review* (15/10): mỗi ứng viên **chỉ nộp 1 lần vào mỗi job**, kể cả sau Recall / Withdraw. Nhưng hộp Recall ghi *“the candidate must apply again”* và tài liệu *Candidate management* (14/10) ghi “phải nộp hồ sơ mới” — chưa thống nhất (**CV review §6**). Cũng chưa chốt: hồ sơ bị rút do khoá / xoá tài khoản hay xoá CV hiện trạng thái gì.',
      },
      {
        kind: 'open',
        text:
          '**Thư xin việc chưa được lưu lên đơn.** Panel gửi nội dung ô *Cover letter* lên server, nhưng `WebApplyService` chỉ dùng nó khi ứng viên **chưa có CV đại diện nào** (để dựng một hồ sơ tạm) — đơn ứng tuyển không có trường nào giữ thư xin việc, và cột *có thư xin việc* trong file xuất của công ty đọc nội dung hồ sơ, không đọc thư. Với ứng viên đã có CV (gần như mọi người), thư gõ ở panel **không tới nhà tuyển dụng**, kể cả với tin đặt *bắt buộc*. Cần backend thêm trường trên đơn.',
      },
    ],
  },
}

/* ── Module page ──────────────────────────────────────────────────────────────── */

export const JOBS_APPS_MODULE_DOCS: Record<string, ModuleDoc> = {
  /* Status model per the client document 14/10/2026 (Candidate management); screens as BUILT 2026-10-08:
     svn-be ee1db5ea9 · svn-web d8a43a11 · saramin-vn-admin 45954108. */
  'Application management': {
    title: 'Application management — một hồ sơ đi qua ba site',
    lead:
      'Đời một hồ sơ ứng tuyển: **ứng viên** nộp từ trang tin ở site jobseeker → **Admin** kiểm tra CV: CV *Qualified* thì gửi ngay, không thì giữ ở *Not Sent* cho **Operator** Approve / Reject → **nhà tuyển dụng (NTD)** kéo thẻ trên Kanban của tin tới *Passed* hoặc *Not This Time*. Ứng viên thấy 1 trong 9 trạng thái, tính từ cùng dữ liệu đó. Luồng trạng thái đầy đủ: trang **Candidate management** (tài liệu 14/10/2026).',
    headline: [
      '**Một nguồn dữ liệu, ba góc nhìn.** Mỗi hồ sơ lưu **CV Status** (*Qualified · Cannot Read · Not Enough Information · Rejected*), **Application Status** (*Not Sent · Sent · Recall* — chỉ 3 giá trị), **Pipeline Status** (vị trí thẻ) và **2 flag** (Viewed, Downloaded). Admin, NTD và ứng viên chỉ đọc chúng theo cách khác nhau.',
      '**Hồ sơ chỉ tới NTD khi CV Status = Qualified** — ngay lúc nộp, hoặc lúc Operator **Approve**. Approve, Reject và Recall áp cho **mọi hồ sơ dùng cùng phiên bản CV**, ở mọi công ty.',
      '**Ứng viên không tự thu hồi được hồ sơ.** Chỉ Admin / CS **Recall** một hồ sơ đã gửi — không hoàn tác; ứng viên không nộp lại được vào job đó (*CV review §6*). Ứng viên muốn rút đơn thì liên hệ CS (*Withdraw application* — **đang triển khai**).',
    ],
    blocks: [
      { kind: 'h', text: '§0 · Ba site, năm màn hình' },
      {
        kind: 'table',
        cols: ['Màn hình', 'Site · đường dẫn', 'Ai dùng', 'Trả lời câu hỏi'],
        rows: [
          ['**How to apply**', 'Jobseeker site · `/jobs/:slug` (+ hộp Batch apply)', 'Ứng viên', 'Tôi nộp tin này bằng CV nào, và nộp thêm tin tương tự thế nào?'],
          ['**Việc đã ứng tuyển** (*My applications*)', 'Jobseeker site · `/my-profile/applications`', 'Ứng viên', 'Hồ sơ của tôi đang ở đâu — 1 trong 9 trạng thái'],
          ['**Applications**', 'Admin · `/recruitment/applications`', 'Operator, Admin / CS', 'Hồ sơ nào đang bị giữ, hồ sơ nào đã tới NTD, NTD đã xem / tải chưa? Approve · Reject · Recall'],
          ['**CV review**', 'Admin · `/recruitment/cv-review`', 'Operator', 'CV đang nghi ngờ này có gửi được không? — quyết định này kéo theo mọi hồ sơ cùng phiên bản CV'],
          ['**Kanban của job**', 'Company site · `/applicants`', 'NTD', 'Ai đã nộp tin của tôi, thẻ đang ở cột nào?'],
        ],
      },

      { kind: 'h', text: '§1 · Chuỗi một hồ sơ, từng chặng' },
      {
        kind: 'diagram',
        id: 'cm-overview',
      },
      {
        kind: 'table',
        cols: ['#', 'Chặng', 'Ai', 'Kết quả', 'Ứng viên thấy'],
        rows: [
          ['1', 'Bấm **Apply** trên tin *Open*, chọn CV, tick đồng ý, **Apply job**', 'Ứng viên', 'Một hồ sơ; file + nội dung CV chụp lại theo hồ sơ', '—'],
          ['2a', 'CV **Qualified** (Saramin CV, hoặc file đọc được và đủ trường) → **gửi ngay**', 'Hệ thống', '*Sent*, thẻ ở **Application Received**; NTD nhận email', 'Application Received'],
          ['2b', 'File **Cannot Read** / **Not Enough Information** → **giữ lại**', 'Hệ thống', '*Not Sent* — NTD không thấy gì', 'In Review'],
          ['3', '**Approve** hoặc **Reject**', 'Operator', 'Approve: *Sent* (mọi hồ sơ đang chờ cùng phiên bản CV). Reject: *Rejected · Not Sent*', 'Application Received · Invalid Application'],
          ['4', 'NTD mở / tải CV khi thẻ còn ở cột đầu', 'NTD', 'Flag Viewed / Downloaded', 'Application Viewed · Application Saved'],
          ['5', 'Kéo thẻ qua các cột giữa, rồi **Passed** hoặc **Not This Time**', 'NTD', 'Pipeline Status đổi theo cột', 'In Process · Passed · Not This Time'],
          ['6', '**Recall** một hồ sơ đã gửi (bất kỳ cột nào)', 'Admin / CS', '*Rejected · Recall* — mọi hồ sơ đã gửi cùng phiên bản CV. Kết thúc', 'Application Withdrawn'],
        ],
      },

      { kind: 'h', text: '§2 · Các trạng thái trên một hồ sơ' },
      {
        kind: 'table',
        note: 'Đây là bảng nên dùng để viết test case. Năm tổ hợp hợp lệ của CV Status · Application Status và mỗi bên thấy gì nằm ở **Candidate management §2**.',
        cols: ['Nhóm', 'Giá trị', 'Ai ghi', 'Ai thấy'],
        rows: [
          ['**CV Status**', 'Qualified · Cannot Read · Not Enough Information · Rejected', 'Hệ thống (tự động), Operator (Approve / Reject), Admin / CS (Recall)', 'Admin. NTD và ứng viên **không** thấy'],
          ['**Application Status**', 'Not Sent · Sent · Recall', 'Hệ thống (Sent khi Qualified), Admin / CS (Recall)', 'Admin. NTD chỉ thấy hồ sơ *Sent*'],
          ['**Pipeline Status**', 'Application Received · In Process · Passed · Not This Time', '**Chỉ NTD** (kéo thẻ)', 'NTD (với tên cột NTD đặt); Admin đọc ở *Stage · Employer*'],
          ['**2 flag**', '`viewed_at` · `downloaded_at` (lần đầu, không reset)', 'Hành động của NTD — không phải Operator / Admin', 'Admin (cột Viewed, Downloaded)'],
          ['**Trạng thái ứng viên thấy**', '9 trạng thái — tính từ 4 thứ trên', 'Không ai ghi — hệ thống tính', 'Ứng viên (*Việc đã ứng tuyển*)'],
        ],
      },
      {
        kind: 'table',
        heading: 'Mỗi sự việc đổi gì',
        cols: ['Sự việc', 'CV · Application', 'Thẻ trên Kanban', 'Ứng viên thấy', 'NTD thấy'],
        rows: [
          ['Nộp, CV Qualified', 'Qualified · Sent', 'Application Received', 'Application Received', 'Thẻ mới + email'],
          ['Nộp, file Cannot Read / Not Enough Information', '… · Not Sent', '—', 'In Review', 'Không gì'],
          ['Operator Approve', 'Not Sent → Qualified · Sent', 'Application Received', 'Application Received', 'Thẻ mới + email'],
          ['Operator Reject, hồ sơ chưa gửi', 'Rejected · Not Sent', '—', 'Invalid Application', 'Không gì'],
          ['NTD mở CV (thẻ ở cột đầu)', 'Giữ nguyên', 'Giữ nguyên; lưu `viewed_at`', 'Application Viewed', '—'],
          ['NTD tải CV (thẻ ở cột đầu)', 'Giữ nguyên', 'Giữ nguyên; lưu `downloaded_at`', 'Application Saved', '—'],
          ['NTD kéo thẻ sang cột giữa / Passed / Not This Time', 'Giữ Qualified · Sent', 'Cột mới', 'In Process / Passed / Not This Time', 'Thẻ ở cột mới'],
          ['Recall, hoặc cùng phiên bản CV bị Reject ở hồ sơ khác — hồ sơ đã gửi', 'Rejected · Recall', 'Giữ vị trí lúc thu hồi', 'Application Withdrawn', 'Nhãn thu hồi, toàn bộ thông tin CV **bị khoá** (không xem, không tải, không kéo thẻ), nhận email'],
          ['Phiên bản CV khác bị Reject / Recall', 'Không đổi', 'Không đổi', 'Không đổi', 'Không đổi'],
        ],
      },

      { kind: 'h', text: '§3 · Ai đổi được gì' },
      {
        kind: 'table',
        cols: ['Ai', 'Được', 'Không được'],
        rows: [
          ['**Ứng viên**', 'Nộp; xoá CV; khoá / xoá tài khoản', '**Thu hồi**, sửa hay xoá hồ sơ ở bất kỳ trạng thái nào; đổi CV của hồ sơ đã nộp'],
          ['**Operator**', '**Approve** / **Reject** hồ sơ đang chờ (*Applications* hoặc *CV review*)', 'Recall; kéo thẻ; thao tác lên hồ sơ đã Rejected hoặc đã Sent (trừ Recall)'],
          ['**Admin / CS**', '**Recall** hồ sơ đã gửi, cùng Approve / Reject; khoá / xoá tài khoản (*Jobseeker users*)', 'Hoàn tác Recall; kéo thẻ thay NTD'],
          ['**NTD**', 'Kéo thẻ giữa các cột (kể cả **vào và ra** Passed / Not This Time); thêm / xoá / đổi tên cột giữa; mở / tải CV', 'Thấy hay đụng vào hồ sơ *Not Sent*; thao tác với hồ sơ In Review, Invalid Application, Application Withdrawn; xoá / đổi tên 3 cột cố định'],
        ],
      },

      { kind: 'h', text: '§4 · Ai được báo, lúc nào' },
      {
        kind: 'diagram',
        id: 'cm-notify',
      },
      {
        kind: 'table',
        cols: ['Đối tượng', 'Khi nào', 'Kênh'],
        rows: [
          ['**Ứng viên**', 'Mỗi khi trạng thái hiển thị thay đổi', 'Cập nhật ngay trên *Việc đã ứng tuyển*. **Không** gửi email lẻ'],
          ['**Ứng viên**', 'Hàng tuần', '1 email tổng hợp cuối tuần, gom theo nhóm trạng thái'],
          ['**NTD**', 'Hồ sơ chuyển sang **Sent** (CV đạt lúc nộp, hoặc Operator Approve)', 'Email báo có đơn ứng tuyển mới. Hồ sơ Not Sent không gửi email'],
          ['**NTD**', 'Hồ sơ bị thu hồi', '**Email** thông báo; thẻ mang nhãn thu hồi, thông tin CV bị khoá'],
          ['**NTD**', 'Ứng viên khoá / xoá tài khoản, xoá CV (build 08/10)', 'Email + chuông *ngừng sử dụng dữ liệu* — chỉ công ty đang giữ hồ sơ đã gửi'],
        ],
      },

      { kind: 'h', text: '§5 · Hồ sơ mang theo CV nào' },
      {
        kind: 'list',
        items: [
          '**Ứng viên chọn trong thư viện CV** (Saramin CV hoặc file tải lên).',
          '**Mỗi hồ sơ lưu lại phiên bản CV tại thời điểm nộp** — file và một bản chụp nội dung CV. Ứng viên thay file (v.2) thì NTD vẫn giữ v.1 — Admin hiện `v.1/2` ở cột CV.',
          '**Quyết định đi theo phiên bản CV:** Approve / Reject / Recall một hồ sơ thì mọi hồ sơ dùng **cùng phiên bản** đổi cùng lúc; phiên bản khác và CV khác của cùng ứng viên không đổi.',
          '**Ứng viên đọc lại được** đúng bản đã gửi qua *View application*, ở mọi trạng thái.',
        ],
      },

      {
        kind: 'example',
        heading: 'Ví dụ — vì sao “đã nộp” mà công ty nói chưa thấy',
        scenario:
          'Ứng viên Minh gọi CS: *“Tôi nộp tin Kế toán của ABC từ thứ Hai, trang của tôi ghi CV đang xử lý, mà ABC nói không thấy hồ sơ.”*',
        cols: ['Kiểm ở đâu', 'Thấy gì', 'Nghĩa là'],
        rows: [
          ['*Việc đã ứng tuyển* của Minh', '**In Review**', 'Hồ sơ đang chờ Operator — ABC chưa từng nhận, đúng như thiết kế'],
          ['*Applications*, tab *Not sent*, lọc *Job* = tin Kế toán, tìm *Minh*', 'Not Enough Information · **Not Sent**', 'File của Minh thiếu trường bắt buộc'],
          ['*Overview* → *Overdue · 24h*', 'Hồ sơ của Minh nằm trong số đếm', 'Hàng đợi Operator đang trễ'],
          ['Operator **Approve** (hộp thoại: 1 hồ sơ, 1 công ty)', 'Qualified · **Sent**, Stage *Application Received*', 'ABC có thẻ mới ở cột đầu + email; Minh thấy *Application Received*'],
        ],
        note: 'Nếu thay vào đó hồ sơ là **Sent** mà ABC vẫn nói không thấy: xem *Stage · Employer* và cột *Viewed* — có thể người ABC hỏi không có quyền xem ứng viên. Nếu là **Recall**: hồ sơ đã bị thu hồi; Minh thấy *Application Withdrawn*.',
      },

      {
        kind: 'open',
        text:
          '**Những điểm cần chốt.** (1) Nộp lại vào job sau **Recall** — tài liệu và chữ trên hộp Recall nói khác nhau (**CV review §6**). (2) **CV Search Status** — đề xuất chỉ CV Qualified mới *Showing*. (3) Hồ sơ nộp trong lúc CV đang **bóc tách** (~3 phút). (4) Hồ sơ bị rút do **khoá / xoá tài khoản, xoá CV** chưa có trong 9 trạng thái. (5) **Thư xin việc** chưa được lưu lên hồ sơ (xem *How to apply*). (6) Hiện tên từng vòng ở cột Stage là **giai đoạn 2**.',
      },
    ],
  },
}
