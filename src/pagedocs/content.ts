import type { PageDoc, ModuleDoc } from '../docs'

/*
 * Content group + Mega menu pages (except premium-pages), re-checked 08/10/2026 against
 *   saramin-vn-admin 45954108 · svn-be ee1db5ea9 · svn-web d8a43a11 (all origin/dev).
 *
 * Sources per page:
 *   collections   — admin docs/features/collections.md, src/modules/content/collections/*, i18n collections.json;
 *                   svn-be JobCollectionService (archive guard), V422.
 *   zones         — admin docs/features/zones.md, zones.types.ts, i18n zones.json; svn-be PublicZoneController, V448.
 *   site-navigation — admin docs/features/site-navigation.md, nav-target.ts, builtin-menu-labels.ts,
 *                   i18n siteNavigation.json; svn-be V423/V638/V639/V643, PublicSiteLayoutController;
 *                   svn-web lib/nav-builtin-route.ts, features/layout/header/services/header.service.ts.
 *   site-footer   — admin docs/features/site-footer.md; svn-web features/layout/footer/services/footer.service.ts.
 *   site-notices  — admin i18n notices.json, docs/features/notices.md; svn-be AdminSiteNoticeController,
 *                   PublicSiteNoticeController, NoticeCategory, NoticeAudience, V533.
 *   faq           — admin docs/features/faq.md, i18n siteFaq.json, faq-row-actions.tsx; svn-be V457.
 *   pages/boards/blog — admin configs/modules.config.ts, navigation.config.tsx, routes.config.tsx,
 *                   admin-pages.config.ts, docs/be-blocked.md (D-CONT-1).
 *   jobs-pages / korea-global-pages — svn-web app/[lang]/(main)/jobs/{roles,locations,industries,korea,global}/page.tsx,
 *                   features/jobs/board/*, features/jobs/domestic/lib/load-jobs.ts, const/page.ts;
 *                   svn-be JobBoardSection, PgFtsSearchAdapter (BOARD_BAND_PREDICATE, GROUPED_SECTION_TAIL,
 *                   COUNTRY_PREDICATE), PublicSearchController, V557/V560.
 */

export const CONTENT_PAGE_DOCS: Record<string, PageDoc> = {
  /* ── Collections ─────────────────────────────────────────────────────────── */
  collections: {
    logic: [
      'Một **collection** là **danh sách tin (hoặc công ty) đã lưu lại**, có địa chỉ công khai riêng `/bo-suu-tap/<address>` (EN `/collections/<address>`, KO `/컬렉션/<address>`).',
      'Đây là thứ mà một mục menu như “Korea” hay “Big company”, và **cả hai danh sách của một trang Premium**, thực chất trỏ vào. **Trang Premium không bao giờ tự chứa tin.**',
      '**Cùng một collection có thể nuôi nhiều trang Premium và nhiều mục menu cùng lúc** — nên sửa một collection là đổi **mọi** trang đang dùng nó, **ngay lập tức**.',
      'Hai lựa chọn — **Lists** (Jobs / Companies) và **Membership** (Saved search / Hand-picked) — **cố định sau khi tạo**, vì chúng quyết định form hiện những ô nào.',
      'Ai dùng: người làm nội dung / marketing dựng trang chiến dịch. Quyền `job_collection` (read · create · update · delete), **mặc định chỉ HQ admin có** (seed V422); cấp thêm cho vai trò khác ở *Organisation → Roles*. **Publish và Archive đều là quyền Update** — không có quyền riêng.',
    ],
    how: [
      '**New collection** → **Address** → **Lists** → **Membership** → tên VI / EN / KO (**cả ba đều bắt buộc**).',
      '**Saved search**: đặt bộ lọc theo hai nhóm — *Employer* (company tag, quốc gia, quy mô, ngành, chọn đích danh công ty) và *Posting* (ngành nghề, cấp bậc, hình thức, loại hợp đồng, phúc lợi, tỉnh/TP, từ khoá). Chọn **Order** và **Item limit**.',
      '**Hand-picked**: **Pinned items** → tìm tin theo tiêu đề hoặc công ty → **Add**. Sắp lại bằng ↑ ↓ — **thứ tự ở đây là thứ tự trên trang**.',
      'Đọc **Preview** ở panel phải — số khớp **sống** và vài kết quả đầu, cập nhật theo mỗi lần đổi bộ lọc.',
      '**Save**, rồi **Publish** ở panel Actions (Publish tự lưu trước).',
    ],
    watch: [
      '**Một chiều duy nhất: Draft → Active → Archived.** Collection đã publish **không quay lại Draft được**, và **Archived không có nút Restore** — muốn dùng lại thì dựng collection mới.',
      '**Address đóng băng khi publish**, nên một menu hay một zone đang trỏ vào nó không thể bị đổi hướng âm thầm.',
      '**Kiểm Preview trước khi publish**: một collection không khớp gì **vẫn lưu và publish được**, và trang sẽ rỗng. Ở mức 0 nó cảnh báo “Nothing matches…”.',
      '**Archive bị từ chối khi một zone đã publish còn liệt kê collection này** — thông báo yêu cầu unpublish zone đó hoặc trỏ nó sang collection khác trước.',
      '**Archive KHÔNG bị chặn bởi menu.** Một mục *Site navigation* trỏ vào collection vừa archive sẽ **lặng lẽ biến khỏi menu công khai** (svn-be chỉ phục vụ mục trỏ vào collection Active); trong admin dòng đó bị gắn cờ.',
      'Tin ghim **không tự làm mới**: khi một tin featured đóng lại, phải thay bằng tay.',
    ],
    blocks: [
      {
        kind: 'shot',
        src: '/shots/pp-collections-list.jpg',
        where: 'Admin',
        caption:
          '**Content → Collections.** Ô tìm theo address hoặc tên, lọc *All types* (Jobs/Companies) và *All statuses*. Cột *Membership* nói ngay collection rỗng hay không.',
      },
      {
        kind: 'table',
        heading: 'Bốn tổ hợp — cái nào dùng được ở đâu',
        cols: ['Lists', 'Membership', 'Có?', 'Dùng trên trang Premium'],
        rows: [
          ['Jobs', 'Saved search', 'Có', '**Job list** (khối bắt buộc)'],
          ['Jobs', 'Hand-picked', 'Có', '**Featured jobs** (khối tuỳ chọn)'],
          ['Companies', 'Hand-picked', 'Có', '**Không dùng được trong zone** — zone chỉ chào collection tin. Dùng cho menu.'],
          ['Companies', 'Saved search', '**Không có**', '— (bộ lọc mô tả tin, không mô tả công ty; svn-be trả 400). Chọn *Companies* là form tự khoá về *Hand-picked*.'],
        ],
      },
      {
        kind: 'table',
        heading: 'Danh sách — cột, tìm kiếm, bộ lọc',
        cols: ['Cột', 'Nó nói gì'],
        rows: [
          ['**Collection**', 'Tên, và địa chỉ công khai `/bo-suu-tap/<address>` bên dưới'],
          ['**Lists**', 'Jobs hoặc Companies'],
          ['**Membership**', 'Saved search → *Filters: 1 · Newest first* (mấy bộ lọc, và thứ tự đã lưu). Hand-picked → *Pinned: 10*. “No filters / Nothing pinned — resolves to nothing” nghĩa là collection **rỗng**'],
          ['**Status**', 'Draft · Active · Archived'],
          ['**Last updated**', 'Lần sửa gần nhất'],
          ['**⋮**', 'Hover mới mở. *Edit* luôn có · **Draft** thêm *Publish* (mờ tới khi có ít nhất một bộ lọc hoặc một tin ghim) và *Delete* · **Active** thêm *Archive*'],
        ],
        note: 'Ô tìm khớp **address hoặc bất kỳ tên nào trong ba ngôn ngữ**. Danh sách luôn xếp **mới cập nhật trước** — không cột nào sắp được, không có export. Bỏ trống bộ lọc trạng thái là **gồm cả Archived** (đây là chỗ tìm lại collection đã nghỉ). Muốn biết trang Premium nào dùng collection nào: mở **Content → Zones**, cột *Lists* in ra `Job list: /mb-jobs · Featured: /mb-featured`.',
      },
      {
        kind: 'shot',
        src: '/shots/pp-collection-head.jpg',
        where: 'Admin',
        caption:
          'Đầu form — **Address**, **Lists**, **Membership** (khoá sau khi tạo), rồi tên VI / EN / KO. Bên phải: **Preview** (số khớp) và **Actions** (trạng thái + Publish).',
      },
      {
        kind: 'table',
        heading: 'Các ô quan trọng và quy tắc kiểm tra',
        cols: ['Ô', 'Quy tắc', 'Thông báo khi sai'],
        rows: [
          ['**Address**', '2–63 ký tự: chữ thường, số, gạch ngang, không bắt đầu bằng gạch ngang. **Sửa được khi còn Draft**, khoá từ lúc publish', '“2–63 characters: lowercase letters, digits and hyphens…” · trùng: “That address is already in use.”'],
          ['**Name** VI / EN / KO', '**Cả ba bắt buộc** — khách thấy tên theo ngôn ngữ của họ (và là tiêu đề trang)', '“Every site language needs a name…”'],
          ['**Order** (Saved search)', 'Để trống = thứ tự mặc định. **Hand-picked không có Order** — thứ tự ghim chính là thứ tự', '—'],
          ['**Item limit**', '1–500; trống = không giới hạn. Preview báo “Visitors see the first {n}”', '—'],
          ['**Pinned items**', 'Tối đa **200** món', '“This is the maximum of 200 items.”'],
          ['**Bộ lọc**', 'Mọi trục lưu theo **mã (code)** của master data, không theo id. Mã không tồn tại → 400, Preview in nguyên thông báo của svn-be (nêu tên trục sai)', '“These filters cannot be saved”'],
        ],
        note: 'Một trục lọc mà collection đã có nhưng form không có ô điều khiển sẽ được **giữ nguyên khi lưu** — form ghi rõ “Also filters on …”.',
      },
      {
        kind: 'list',
        heading: 'Saved search — bộ lọc hoạt động như tìm kiếm công khai',
        items: [
          'Chọn **nhiều giá trị trong cùng một bộ lọc** thì **mở rộng** (bất kỳ giá trị nào); **thêm một bộ lọc nữa** thì **thu hẹp** (phải khớp tất cả).',
          'Mọi thứ khớp bộ lọc đều nằm trong collection, **kiểm lại mỗi lượt truy cập**: tin mới tự vào, tin đóng hoặc bị ẩn tự rớt ra.',
          '**Order** — *No saved order · Newest first · Relevance · Highest salary · Lowest salary · Most viewed · Recently posted · Closing soonest.* Đây là **thứ tự mặc định** mà Job list của một trang Premium hiện; khách xem vẫn tự sắp lại được cho riêng họ.',
          '**Item limit** — số món nhiều nhất một khách thăm từng thấy. Để trống = không giới hạn.',
          'Trục *Company country* lọc theo **quốc gia của công ty** (CRM). Tin **đăng ẩn danh** không bao giờ khớp một trục công ty nào (tag, quốc gia, quy mô, ngành).',
        ],
      },
      {
        kind: 'warn',
        text:
          '**Cờ “Not visible” trên một tin ghim.** Một tin chỉ hiện khi nó **đang mở, đang được phơi (exposed) và còn trong cửa sổ đăng**, và công ty của nó **Active + có MST**. Với collection công ty: công ty phải **Active và có MST**. Dòng bị gắn cờ **bị bỏ qua trên site mà không báo gì cho khách thăm**, nên trang ngắn đi một thẻ — dòng vàng phía trên danh sách đếm giúp (“1 of 10 pinned items are not shown on the site”).',
      },
      {
        kind: 'table',
        heading: 'Trạng thái collection',
        cols: ['Trạng thái', 'Nghĩa / trên site', 'Tới bằng cách nào', 'Làm được gì tiếp'],
        rows: [
          ['**Draft**', 'Không hiện (địa chỉ trả “không tìm thấy”, y hệt địa chỉ không tồn tại)', '**New collection** → Save. Create luôn ra Draft', 'Sửa mọi thứ **kể cả address** · Publish · Delete (giải phóng address)'],
          ['**Active**', 'Sống tại `/bo-suu-tap/<address>`, zone và menu dùng được', '**Publish** (tự lưu trước) — cần ≥1 bộ lọc hoặc ≥1 tin ghim', 'Sửa bộ lọc / tin ghim / tên · Archive'],
          ['**Archived**', 'Offline; địa chỉ vẫn giữ chỗ; mục menu trỏ vào bị rớt khỏi menu', '**Archive** — bị chặn nếu một zone Published còn dùng', '**Không gì đưa nó trở lại** — admin không có nút Restore; dựng collection mới. Không xoá được'],
        ],
        note: '**Saved search cần ít nhất một bộ lọc**, **Hand-picked cần ít nhất một tin ghim** — nếu không thì không lưu được. **Save không bao giờ publish**; Publish nằm ở thẻ Actions bên phải (nó tự lưu trước). **Preview** (góc trên phải) mở trang công khai của chính collection — chỉ với collection Active.',
      },
      {
        kind: 'list',
        heading: 'Trước khi động vào một collection mà trang Premium đang dùng',
        items: [
          'Mở **Content → Zones → cột Lists** để xem **những zone nào** đang dùng nó.',
          'Mọi chỉnh sửa (bộ lọc, tin ghim, thứ tự, giới hạn) **sống ngay lập tức trên mọi trang dùng nó** — svn-web đọc collection **không cache**.',
          'Muốn cho một collection nghỉ hưu khi một zone đã publish đang dùng: **tạo và publish collection thay thế → chuyển zone sang nó (Zone editor → The two lists → Save) → rồi mới archive cái cũ.** Hệ thống chặn việc archive sớm hơn.',
          'Một zone **chỉ (tái) xuất bản được khi cả hai collection của nó đang Active**.',
          'Kiểm cả **Content → Site navigation**: không có gì chặn archive một collection mà menu đang trỏ vào — mục đó chỉ lặng lẽ biến mất.',
        ],
      },
      {
        kind: 'example',
        heading: 'Dựng collection “Korean companies” cho một mục menu',
        scenario: 'Marketing muốn một trang liệt kê mọi tin của công ty Hàn Quốc, gắn vào menu.',
        cols: ['Bước', 'Làm gì', 'Kết quả'],
        rows: [
          ['1', 'New collection · address `korean-companies` · Lists *Jobs* · Membership *Saved search* · tên VI/EN/KO', 'Draft, địa chỉ chưa sống'],
          ['2', 'Employer → *Company country* = Hàn Quốc · Order *Newest first*', 'Preview: “N matching this filter set”'],
          ['3', 'Publish (xác nhận)', 'Active; `/bo-suu-tap/korean-companies` sống; address khoá'],
          ['4', 'Site navigation → thêm mục → Points at *Collection* → chọn nó', 'Mục menu hiện trên site trong khoảng một phút'],
          ['5', 'Một công ty Hàn đổi Country sang trống trong CRM', 'Tin của họ **tự rớt** khỏi collection ở lượt truy cập sau — không ai sửa collection'],
        ],
        note: 'Trang `/viec-lam/han-quoc` của mega menu **không** dùng collection này — nó là bảng tin riêng lọc `country = KR` (xem *Mega menu pages → Korea/Global pages*). Hai danh sách có thể khác nhau.',
      },
      {
        kind: 'open',
        text:
          '**Collection công ty trên site.** Trang `/bo-suu-tap/<address>` của một collection *Companies* vẽ ra sao chưa được kiểm trên svn-web d8a43a11 (chưa xác minh).',
      },
    ],
  },

  /* ── Zones ───────────────────────────────────────────────────────────────── */
  zones: {
    logic: [
      'Một **zone** (KR: 채용관, khách gọi là **Premium page**) là **trang tuyển dụng có thương hiệu** cho một nhà tuyển dụng hoặc một chủ đề: banner, vài khối nội dung, một thanh tìm kiếm và **hai danh sách tin**. Nó có địa chỉ riêng trên site jobseeker, và admin dựng nó **hoàn toàn bằng nội dung** — không sửa code cho mỗi chiến dịch.',
      '**Không có layout tuỳ biến.** Template cố định: một topbar + **7 khối**, luôn theo đúng thứ tự này (cộng dải **Partners** dưới banner, thêm từ SRM-790). Khối tuỳ chọn để trống thì **không được vẽ ra** — không có ô rỗng, không có tiêu đề rỗng.',
      'Zone **không chứa tin**. Hai danh sách của nó **trỏ vào Collection** — vì vậy muốn sửa “trang Premium hiện sai công ty”, sửa **collection**, không sửa zone.',
      'Khách thăm không bao giờ thấy được tin nằm ngoài collection: thanh tìm kiếm trên trang **chỉ thu hẹp** danh sách đó.',
      'Trang hiện theo **ngôn ngữ của người xem**: tiêu đề, khối và chữ link đều có ô VI / EN / KO; **tiếng Việt là bắt buộc**.',
      'Quyền `zone` (read · create · update · delete), **mặc định chỉ HQ admin** (seed V448). **Publish, Unpublish, Archive, Restore đều là quyền Update.** Không có quyền riêng cho xuất bản.',
    ],
    how: [
      '**Dựng hai collection trước** (Content → Collections): một *Saved search* cho **Job list** (bắt buộc) và một *Hand-picked* cho **Featured jobs** (tuỳ chọn).',
      '**Content → Zones → New zone** → đặt **address** (chữ thường, số, gạch ngang, 2–63 ký tự — đây chính là URL công khai) → **Title** (VI bắt buộc) → *Owner company* (tuỳ chọn, dùng làm link website dự phòng) → **Save** → zone ra đời ở trạng thái **Draft**.',
      'Đổ các khối từ trên xuống: **Topbar → Partner logo** (PNG/SVG trong suốt, cao ~30px) · **Banner → Add slide** (ảnh desktop bắt buộc, ảnh mobile tuỳ chọn, tối đa 10 slide) · **Partners** (tuỳ chọn) · **Top block** · **Search bar** (tick ít nhất 1 bộ lọc) · **The two lists** · **Bottom block** · **Company link**.',
      'Đọc **Page order** ở panel phải trước khi xuất bản — nó liệt kê các phần kèm giá trị hiện tại (“3 slides on a rotating slider”, “/mb-jobs”, “Not shown”…). Đây là cách nhanh nhất để thấy trang **sẽ thực sự hiện gì**.',
      '**Save** → **Actions → Publish** → xác nhận. Dòng trạng thái đổi thành *Live at …*; bấm **Preview** (góc trên phải) để mở trang thật.',
      'Gắn vào menu (tuỳ chọn): **Content → Site navigation** → thêm mục → đích **Zone** → chọn zone. **Chỉ zone đã Published mới chọn được.**',
    ],
    watch: [
      '**Save không bao giờ xuất bản.** Publish là nút riêng. Trên zone đã Published, **Save cập nhật thẳng trang đang sống** — không có bản nháp song song — và khách thấy trong khoảng một phút.',
      '**Address không đổi được sau khi tạo** — kể cả khi còn Draft (khác collection). Đổi địa chỉ nghĩa là làm một zone mới.',
      '**Archived không bao giờ quay thẳng lại sống**: phải *Restore to draft*, kiểm, rồi mới Publish.',
      '**Preview chỉ chạy trên zone đã Published** — chưa có preview cho bản nháp.',
      'Một tin được ghim nhưng đã đóng hoặc bị ẩn sẽ hiện **Not visible** trong collection và **bị bỏ qua** trên site (ví dụ MB Bank: ghim 10, hiện 9). Nếu **mọi** tin ghim đều bị ẩn thì khối Featured **tự ẩn mình**.',
      'Ảnh trông trắng trong trình soạn **không hẳn là mất**: ảnh được chuyển đổi ngầm vài giây sau khi upload. Kiểm trên trang công khai.',
      '**Unpublish một zone mà menu đang trỏ vào** thì mục menu đó **lặng lẽ biến khỏi menu công khai**; trong *Site navigation* dòng đó bị gắn cờ “This zone is Draft…”.',
    ],
    blocks: [
      {
        kind: 'shot',
        src: '/shots/pp-zones-list.jpg',
        where: 'Admin',
        caption:
          '**Content → Zones** — tìm theo address hoặc tiêu đề, lọc trạng thái. Cột *Lists* in hai collection mỗi zone dùng, cột *Banner* nói đã có slide chưa (*Uploaded* / *Missing*).',
      },
      {
        kind: 'table',
        heading: 'Template cố định — topbar + 7 khối, luôn đúng thứ tự này',
        cols: ['#', 'Khối', 'Bắt buộc?', 'Khách thăm thấy gì', 'Đặt ở đâu trong admin'],
        rows: [
          ['0', '**Topbar**', 'Tuỳ chọn', 'Logo đối tác × saramin, cộng các link trong trang (Overview · Featured jobs · All jobs · More information)', 'Topbar → Partner logo'],
          ['1', '**Banner**', '**Bắt buộc để xuất bản**', 'Slider tràn màn hình, **5 giây mỗi slide**, mỗi slide một ảnh desktop và một ảnh mobile (tối đa 10 slide)', 'Banner → Slides'],
          ['—', '**Partners**', 'Tuỳ chọn', 'Một hàng logo ngay dưới banner — **chỉ ảnh, không chú thích, không bấm được**; tối đa **30** logo, kéo để sắp thứ tự', 'Partners → Partner logos'],
          ['2', '**Top block**', 'Tuỳ chọn', 'Đoạn giới thiệu hoặc một ảnh, nằm giữa banner và thanh tìm kiếm', 'Top block'],
          ['3', '**Search bar**', '**Ít nhất 1 bộ lọc**', 'Tỉnh/TP · Ngành nghề · Cấp bậc · Từ khoá — chỉ **thu hẹp** danh sách tin bên dưới', 'Search bar'],
          ['4', '**Featured jobs**', 'Tuỳ chọn', 'Một hàng thẻ tin', 'The two lists → Featured jobs'],
          ['5', '**Job list**', '**Bắt buộc**', 'Danh sách tin đầy đủ, có phân trang và ô sắp xếp', 'The two lists → Job list'],
          ['6', '**Bottom block**', 'Tuỳ chọn', 'Chữ hoặc một ảnh dưới danh sách tin', 'Bottom block'],
          ['7', '**Company link**', 'Tuỳ chọn', 'Một link sang website của nhà tuyển dụng, kèm ảnh tuỳ chọn. **Tắt đi thì trang dùng website của Owner company** (nếu có)', 'Company link'],
        ],
      },
      {
        kind: 'p',
        text:
          'Các **link trong trang ở topbar chỉ xuất hiện cho những khối thực sự được vẽ** — không có link nào trỏ tới một khối rỗng.',
      },
      {
        kind: 'shot',
        src: '/shots/pp-zone-editor.jpg',
        where: 'Admin',
        caption:
          'Editor của zone — form bên trái theo đúng thứ tự trang; panel phải có **Page order** (mỗi phần và giá trị hiện tại), **Actions** (trạng thái, *Live at …*, Publish) và **Timestamps**.',
      },
      {
        kind: 'table',
        heading: 'Hai danh sách — mỗi cái cần một loại collection riêng',
        note: 'Dựng collection **trước**, rồi mới dựng zone. Picker của zone **chỉ chào collection loại tin đúng kiểu**, xuất bản **từ chối** collection không Active, và **hai danh sách phải là hai collection khác nhau**.',
        cols: ['Khối', 'Loại collection', 'Vì sao'],
        rows: [
          ['**Job list** (bắt buộc)', '**Saved search** — một bộ lọc, chạy lại mỗi lượt truy cập', 'Tin mới **tự vào**; tin đóng/ẩn tự rớt ra. Danh sách chính không nên phải chăm bằng tay.'],
          ['**Featured jobs** (tuỳ chọn)', '**Hand-picked** — đúng những tin bạn ghim, theo thứ tự bạn xếp', 'Chỗ này là **biên tập**. Tin ghim **không tự làm mới**: khi một tin featured đóng lại, phải thay bằng tay.'],
        ],
      },
      {
        kind: 'table',
        heading: 'Trạng thái zone',
        cols: ['Trạng thái', 'Trên site jobseeker', 'Tới bằng cách nào', 'Nút trong panel Actions'],
        rows: [
          ['**Draft**', 'Không hiện (địa chỉ trả “không tìm thấy”)', '**New zone** → Save (luôn ra Draft) · **Unpublish** từ Published · **Restore to draft** từ Archived', 'Publish · Delete'],
          ['**Published**', '**Sống** tại địa chỉ của nó; menu chọn được', '**Publish** — cần ≥1 banner slide đã lưu, và cả hai collection Active, đúng loại', 'Unpublish · Archive'],
          ['**Archived**', 'Không hiện; **địa chỉ vẫn được giữ chỗ**', '**Archive** trên zone Published (API svn-be cho phép từ mọi trạng thái, nhưng panel chỉ chào nút này ở Published)', 'Restore to draft'],
        ],
      },
      {
        kind: 'list',
        heading: 'Điều kiện xuất bản',
        items: [
          'Có **ít nhất một banner slide** (đã lưu).',
          'Cả **hai danh sách** phải đang trỏ vào collection **Active** và **đúng loại** (svn-be kiểm danh sách trước, banner sau).',
          '**Chỉ Draft mới xoá được** — xoá thì địa chỉ được giải phóng. Zone khác: “Only a draft can be deleted. Archive this zone instead.”',
        ],
      },
      {
        kind: 'table',
        heading: 'Địa chỉ công khai — ba ngôn ngữ, ba tiền tố',
        cols: ['Ngôn ngữ', 'Đường dẫn'],
        rows: [
          ['Tiếng Việt', '`/khu-tuyen-dung/<address>`'],
          ['English', '`/zones/<address>`'],
          ['한국어', '`/채용관/<address>`'],
        ],
        note: 'Ví dụ đang sống: **MB Bank** (`/zones/mb-bank`) và **Korean companies — NIPA** (`/zones/nipa`). NIPA không có logo đối tác nên topbar chỉ hiện saramin; thanh tìm kiếm của nó có 3 bộ lọc (không có cấp bậc).',
      },
      {
        kind: 'table',
        heading: 'Kích thước ảnh và xử lý HTML',
        cols: ['Chỗ', 'Quy tắc'],
        rows: [
          ['**Banner**', 'Băng cố định: **1260 × 400** trên desktop (63:20) và **720 × 600** trên mobile (6:5). Ảnh khác tỉ lệ bị **cắt cho vừa** — giữ chữ và logo tránh xa mép. Không có ảnh mobile thì ảnh desktop được dùng luôn trên điện thoại.'],
          ['**Partners**', 'Mỗi logo được cắt theo khung của dải; tối đa 30; alt tối đa 300 ký tự.'],
          ['**Top / Bottom block**', 'Bật *Show this block*; **tắt đi là lưu xong sẽ xoá sạch nội dung khối đó**. Chọn *Text* hay *Image*. Với text, chọn *Rich text* để soạn tại chỗ hoặc *HTML* để dán đoạn có sẵn.'],
          ['**HTML dán vào**', 'Được **làm sạch khi lưu**: bỏ script, style, iframe, form và inline style; giới hạn **20.000 ký tự sau khi làm sạch**. Ô *Preview (server rules)* bên dưới cho thấy phần nào sẽ sống sót.'],
          ['**Partner logo**', 'PNG hoặc SVG **trong suốt**, cao khoảng **30 px**.'],
          ['**Company link**', 'Link **https**, tối đa 1024 ký tự; ảnh tuỳ chọn, rộng **ít nhất 1600 px**. Bỏ ảnh mà giữ link thì link vẫn chạy dạng chữ.'],
        ],
      },
      {
        kind: 'table',
        heading: 'Đổi, gỡ, nghỉ hưu một trang',
        cols: ['Tôi muốn…', 'Làm gì', 'Chuyện gì xảy ra'],
        rows: [
          ['Sửa nội dung trên trang đang sống', 'Sửa khối → **Save**', 'Trang sống cập nhật trong khoảng một phút (svn-be trả `max-age=60` + ETag)'],
          ['Tạm gỡ trang xuống', '**Unpublish**', 'Về Draft; địa chỉ trả “không tìm thấy”; mục menu trỏ vào biến mất'],
          ['Cho một chiến dịch nghỉ', '**Archive**', 'Offline; **địa chỉ vẫn giữ chỗ**'],
          ['Đưa trang đã archive trở lại', '**Restore to draft** → kiểm → **Publish**', 'Không bao giờ quay thẳng lại sống'],
          ['Bỏ một bản nháp', '**Delete** (chỉ Draft)', 'Xoá hẳn; **địa chỉ được giải phóng**'],
          ['Đổi collection phía sau một danh sách', 'The two lists → chọn collection khác → **Save**', 'svn-be kiểm lại danh sách vừa đổi (phải Active, đúng loại) ngay lúc lưu'],
        ],
      },
      {
        kind: 'table',
        heading: 'Gỡ rối',
        cols: ['Triệu chứng', 'Nguyên nhân và cách xử lý'],
        rows: [
          ['Publish bị mờ / báo “Add at least one banner slide and save before publishing.”', 'Thêm một banner slide có ảnh desktop, **Save**, rồi Publish.'],
          ['Publish lỗi “The collection … is not active”', 'Một collection phía sau danh sách đã bị archive hoặc chưa bao giờ publish. Publish lại collection đó, hoặc chọn collection khác.'],
          ['Publish lỗi “Restore this zone to draft before publishing it.”', 'Zone đang Archived. *Restore to draft* trước.'],
          ['Trang công khai báo “không tìm thấy”', 'Zone đang Draft/Archived, hoặc gõ sai địa chỉ. Nhớ đường dẫn tiếng Việt là `/khu-tuyen-dung/<address>`.'],
          ['Nút Preview bị mờ', 'Zone **chưa** Published — chưa có preview cho bản nháp. Trên bản dựng chưa cấu hình địa chỉ site công khai, nút cũng mờ và nói rõ điều đó.'],
          ['Trang hiện tin của **sai công ty**', 'Zone hiện **đúng những gì collection chứa**. Sửa bộ lọc (Saved search) hoặc danh sách ghim (Hand-picked) — **không sửa zone**.'],
          ['Hàng **Featured jobs** biến mất', 'Collection hand-picked rỗng, hoặc **mọi** tin ghim đã đóng/ẩn — khối tự ẩn mình.'],
          ['Ảnh trông trắng trong trình soạn', 'Không hẳn là mất: ảnh đang được chuyển đổi ngầm vài giây. Kiểm trên trang công khai.'],
          ['Các picker của thanh tìm kiếm không hiện số đếm', '**Đúng như thiết kế hiện tại**: số đếm trên trang tìm kiếm chính là toàn site, nên trang zone không hiện.'],
          ['Không archive được collection cũ', 'Một zone Published còn dùng nó. Chuyển zone sang collection mới, Save, rồi mới archive.'],
        ],
      },
      {
        kind: 'open',
        text:
          '**Dữ liệu dev:** hai collection của MB Bank trên dev hiện gồm cả tin của VPBank, Cathay Life và TSB, và Owner company của zone MB Bank đang là VPBank; đó là dữ liệu test. Trang đọc phía khách (từ đầu tới cuối) nằm ở *Mega menu pages → Premium pages*.',
      },
    ],
  },

  /* ── Site navigation ─────────────────────────────────────────────────────── */
  'site-navigation': {
    logic: [
      'Menu đầu trang của **site jobseeker**, sửa được không cần deploy. Một trang, **bốn tab** — mỗi tab là một **vùng menu độc lập** (svn-be gọi là *surface*); sắp xếp ở tab này không đụng tab khác.',
      'Cây menu **tối đa hai cấp**: mục cấp 1 (trục) và mục con. Chỉ mục cấp 1 mới có *Add sub-item*.',
      'Mỗi mục **trỏ tới đúng một đích** (*Points at*): một collection, một zone, một trang của site, một link ngoài, hoặc “coming soon”. Mục **Built-in** là phần khung IA do site sở hữu.',
      'Không có nút Save chung: **mỗi lần lưu trong drawer, mỗi lần bật/tắt cờ, mỗi lần ▲▼ là ghi ngay** vào svn-be. Site jobseeker thấy sau **khoảng một phút** (svn-web cache menu 60 giây).',
      'Quyền `site_menu` (read · create · update · delete), **mặc định chỉ HQ admin** (seed V423); cấp thêm ở *Roles*.',
    ],
    how: [
      'Chọn tab vùng menu (*Mega menu · Tool cards · Support & MY · Employer menu*).',
      '**New item** thêm mục cấp 1; *Add sub-item* trên một mục cấp 1 để thêm mục con. Mục mới **luôn nằm cuối** nhóm anh em của nó — dùng cột **Order** (▲▼) để dời.',
      'Trong drawer: chọn **Points at** → điền đích → **Label** (VI bắt buộc, EN/KO để trống thì rơi về VI) → các ô trình bày của tab đó (badge, icon, mô tả, đường kẻ) → cờ hiển thị → lưu.',
      'Ẩn tạm một mục: tắt **Visible** (hoặc tắt cả PC lẫn Mobile). **Xoá chỉ dành cho mục do người tạo**; mục seed thì ẩn thay vì xoá.',
    ],
    watch: [
      '**Mục trỏ vào collection không Active, hoặc zone không Published, bị loại khỏi menu công khai mà không báo gì cho khách** — trong bảng dòng đó bị gắn cờ (“This collection is Archived, so the row is not served to visitors”). Archive collection / unpublish zone **không bị chặn** bởi menu.',
      '**Mục trỏ vào một collection Active nhưng rỗng vẫn hiện** và dẫn khách tới trang trắng.',
      '**Route key là ô chữ tự do có gợi ý.** Gõ sai một key thì mục đó trên site thành mục “coming soon” bị mờ — không lỗi, không cảnh báo khi lưu.',
      '**Tên của mục Built-in trong admin có thể chỉ hiện key thô** (`korea`, `global`, `jobs.byIndustry`, `jobs.topCompanies`): bảng tên mà admin dùng để dịch key (`builtin-menu-labels.ts`, sửa lần cuối 04/09) chưa biết các key svn-be thêm sau đó (V638–V643). Trên site các mục này vẫn có tên đúng.',
      'Nếu svn-be lỗi hoặc trả dữ liệu site không đọc được, site **lặng lẽ hiện cây menu mẫu cài sẵn** trong code (không phải menu admin đã sửa).',
    ],
    blocks: [
      {
        kind: 'h',
        text: '§1 Bốn vùng menu',
      },
      {
        kind: 'table',
        heading: 'Bốn tab = bốn vùng menu trên site jobseeker',
        cols: ['Tab', 'Surface (svn-be)', 'Là phần nào trên site', 'Ô trình bày riêng'],
        rows: [
          ['**Mega menu**', '`JOBSEEKER_HEADER`', 'Các trục chính trên thanh đầu trang và cột thả xuống của chúng', '**Badge** (vd. “NEW”); **PC / Mobile** bật riêng từng dòng'],
          ['**Tool cards**', '`JOBSEEKER_HEADER_TOOLS`', 'Hàng thẻ công cụ bên cạnh mega menu', '**Icon** (mục cấp 1), **Description**'],
          ['**Support & MY**', '`JOBSEEKER_HEADER_BOTTOM`', 'Phần chân của ngăn menu trên mobile', '**Icon** (mục cấp 2)'],
          ['**Employer menu**', '`JOBSEEKER_HEADER_ENTERPRISE`', 'Menu thả xuống cho nhà tuyển dụng', '**Separator above this row** (đường kẻ phía trên)'],
        ],
        note: 'Form chỉ chào ô nào **thực sự được site đọc** ở tab đó. Một mô tả gõ vào mục Employer menu sẽ được lưu mà không bao giờ hiện — nên form không cho gõ.',
      },
      {
        kind: 'table',
        heading: 'Mega menu hiện tại (seed svn-be, sau V643)',
        cols: ['Trục (cấp 1)', 'Mục con', 'Trang trên site'],
        rows: [
          ['**Việc làm** (`jobs`)', 'Theo khu vực · Theo ngành nghề · Theo ngành · Công ty hàng đầu', '`/viec-lam/dia-diem` · `/viec-lam/nganh-nghe` · `/viec-lam/nganh` · `/viec-lam/cong-ty-hang-dau`'],
          ['**Hàn Quốc** (`korea`)', '— (link thẳng)', '`/viec-lam/han-quoc`'],
          ['**Toàn cầu** (`global`)', '— (link thẳng)', '`/viec-lam/nuoc-ngoai`'],
          ['**Công ty** (`companies`)', '— (link thẳng)', 'Danh bạ công ty'],
          ['**Lương & Công cụ** (`salaryTools`)', 'Thông tin lương · Tính lương Gross ↔ Net · Tạo CV · Quản lý hồ sơ', 'Các trang công cụ'],
        ],
        note: 'Tất cả là **Built-in**: site giữ tên và đường dẫn, admin chỉ sắp thứ tự, ẩn/hiện và gắn badge. Các trang đích được mô tả ở nhóm *Mega menu pages*.',
      },
      {
        kind: 'h',
        text: '§2 Cột, đích và cờ hiển thị',
      },
      {
        kind: 'table',
        heading: 'Cột trong bảng',
        cols: ['Cột', 'Nó nói gì'],
        rows: [
          ['**Item**', 'Nhãn (VI) — mục Built-in hiện tên lấy từ bảng tên của admin, kèm key; mục cấp 2 thụt vào dưới cha'],
          ['**Points at**', 'Loại đích và giá trị; có cờ đỏ/vàng khi collection không Active hoặc zone không Published / đã bị xoá'],
          ['**Visible · PC · Mobile**', 'Ba công tắc, đổi ngay khi bấm (toast “… turned on/off”)'],
          ['**Order**', '▲▼ trong nhóm anh em — gửi **cả nhóm** theo thứ tự mới trong một lần'],
          ['**Actions**', 'Edit · Add sub-item (chỉ cấp 1) · Delete (chỉ mục do người tạo, và không còn mục con)'],
        ],
        note: 'Không phân trang, không tìm kiếm, không sắp theo cột — bảng là **toàn bộ một vùng**, kể cả dòng ẩn. Dòng trên đầu đếm “{n} of {total} rows are hidden from the site.”',
      },
      {
        kind: 'table',
        heading: 'Points at — sáu loại đích',
        cols: ['Loại', 'Lưu gì', 'Quy tắc'],
        rows: [
          ['**Built-in**', 'Một key cố định', '**Không chọn được** — chỉ có ở mục seed. Không đổi nhãn, không đổi đích, không xoá (409)'],
          ['**Collection**', 'Id collection', 'Chọn từ danh sách. **Chỉ được phục vụ khi collection Active**'],
          ['**Zone**', 'Address của zone', '**Chỉ chọn được zone Published** (svn-be từ chối “No published zone has the address …”). Unpublish sau đó → mục bị rớt'],
          ['**Site page**', 'Route key (vd. `search`)', 'Ô chữ tự do có gợi ý; key lạ → mục “coming soon” mờ trên site'],
          ['**External link**', 'URL', '**Chỉ `https://`** — svn-be từ chối mọi thứ khác'],
          ['**Coming soon**', 'Đường dẫn dự kiến', 'Vẽ thành mục **bị vô hiệu**; đường dẫn lưu sẵn cho ngày trang có thật'],
        ],
        note: 'Đổi loại đích là **xoá giá trị cũ** — một mục luôn có đúng một đích.',
      },
      {
        kind: 'table',
        heading: 'Cờ hiển thị — một mục hiện khi nào',
        cols: ['Cờ', 'Tắt đi thì'],
        rows: [
          ['**Visible**', 'Ẩn với mọi khách, mọi thiết bị'],
          ['**PC**', 'Ẩn trên desktop. **Chỉ Mega menu** tách PC/mobile theo từng dòng'],
          ['**Mobile**', 'Ẩn trên mobile. Tắt **cả PC lẫn Mobile** = ẩn ở mọi nơi, trên mọi tab'],
        ],
        note: 'Quy tắc svn-be: hiện khi `Visible` **và** (PC **hoặc** Mobile). Ở ba tab còn lại, tắt một trong hai không có tác dụng — chỉ tắt cả hai mới ẩn.',
      },
      {
        kind: 'h',
        text: '§3 Sắp xếp, xoá và lỗi',
      },
      {
        kind: 'table',
        heading: 'Hành động và hệ quả',
        cols: ['Hành động', 'Hệ quả', 'Lỗi có thể gặp'],
        rows: [
          ['**New item / Add sub-item**', 'Mục mới nằm **cuối** nhóm anh em, xoá được', 'Thêm con dưới mục cấp 2 → 400 (form không cho)'],
          ['**Edit**', 'Ghi ngay; site thấy sau ~1 phút', 'Thiếu nhãn VI: “A Vietnamese label is required — the other two fall back to it.”'],
          ['**▲ / ▼**', 'Gửi lại **toàn bộ nhóm anh em** trong một giao dịch', 'Ai khác vừa đổi menu → 409, bảng tự tải lại: “This menu changed while you were editing. It has been reloaded — reorder again.”'],
          ['**Delete**', 'Xoá hẳn khỏi vùng đó', 'Mục seed (`deletable: false`) → 409 “Hide it instead”; mục còn con → bị chặn'],
          ['**Tắt Visible**', 'Ẩn, giữ nguyên cấu hình — cách đúng để gỡ tạm một mục', '—'],
        ],
      },
      {
        kind: 'example',
        heading: 'Gắn trang chiến dịch MB Bank vào mega menu',
        scenario: 'Zone `mb-bank` đã Published. Marketing muốn một mục “MB Bank tuyển dụng” có badge HOT.',
        cols: ['Bước', 'Làm gì', 'Kết quả'],
        rows: [
          ['1', 'Tab *Mega menu* → *Add sub-item* trên trục **Việc làm**', 'Drawer mở, vị trí “Under Việc làm…”'],
          ['2', 'Points at *Zone* → chọn `mb-bank` · Label VI “MB Bank tuyển dụng” · Badge `HOT`', 'Lưu → mục nằm cuối cột Việc làm'],
          ['3', '▲ hai lần', 'Lên trên “Công ty hàng đầu”'],
          ['4', 'Đợi ~1 phút, mở site', 'Mục hiện trong cột thả xuống của Việc làm'],
          ['5', 'Hết chiến dịch: Archive zone `mb-bank`', 'Mục **tự biến khỏi menu**; trong admin dòng bị gắn cờ — nên xoá hoặc tắt Visible cho gọn'],
        ],
      },
      {
        kind: 'warn',
        text:
          '**Sửa so với bản cũ của trang này:** đích của một mục **không chỉ là collection** — có sáu loại (Built-in, Collection, Zone, Site page, External link, Coming soon), và **không có bước “Lưu” chung**: mỗi thao tác ghi ngay.',
      },
    ],
  },

  /* ── Site footer ─────────────────────────────────────────────────────────── */
  'site-footer': {
    logic: [
      'Chân trang của site. **Một bố cục chân trang dùng cho cả hai site**, còn **nội dung riêng theo surface** — tab **Jobseeker** (các trang của site ứng viên) và tab **Company** (site tuyển dụng `hiring.` và trang catalogue sản phẩm billing).',
      'Mỗi tab xếp form theo đúng thứ tự chân trang vẽ: **Links** (hàng link trên cùng) → **Info** (các dòng chữ xám: trung tâm khách hàng, địa chỉ, đăng ký kinh doanh…) → **Email & social** (nút email, icon Facebook / LinkedIn / YouTube) → **Copyright** (dòng cuối).',
      '**Hai nút Save mỗi tab**: *Save links* cho phần Links (thay cả danh sách), và một Save cho Info + Email & social + Copyright.',
      'Số điện thoại / giờ làm việc của tổng đài **không còn ở đây** — chúng ở *System → Company information → Customer center*.',
      'Quyền `site_footer` (một quyền cho cả hai tab), **mặc định chỉ HQ admin** (seed V424). Không có `site_footer:update` thì mọi thứ chỉ đọc và **không có nút Save**. Create/Delete được seed nhưng không dùng.',
    ],
    how: [
      'Chọn tab **Jobseeker** hoặc **Company**.',
      '**Links**: thêm dòng, gõ **Label** và **URL** theo ngôn ngữ (công tắc VI / EN / KO dùng chung cho bảng), bật/tắt **Visible**, kéo tay nắm hoặc ▲▼ để sắp thứ tự → **Save links**. *Reset* bỏ bản nháp.',
      '**Info / Email & social / Copyright**: sửa → **Save**.',
      'Đợi khoảng một phút rồi kiểm trên site (svn-web cache chân trang 60 giây theo từng surface × ngôn ngữ).',
    ],
    watch: [
      '**Save links thay CẢ danh sách.** Một link đã lưu mà bạn xoá khỏi bảng sẽ **bị xoá thật** khi Save — form hỏi lại, nói rõ bao nhiêu link sẽ mất. Xoá dòng trong bảng chưa đụng gì tới khi Save.',
      '**Đường dẫn `/…` luôn là trang của site jobseeker**, kể cả trên tab Company. Muốn trỏ tới một trang của site tuyển dụng phải dán link `https://` đầy đủ.',
      '“Chưa sẵn sàng” = **tắt Visible** — không còn trạng thái coming soon.',
      'Lỗi chỉ tô đỏ **sau khi bấm Save**; Save lỗi tự chuyển công tắc ngôn ngữ sang ngôn ngữ có vấn đề.',
    ],
    blocks: [
      {
        kind: 'table',
        heading: 'Các phần và quy tắc',
        cols: ['Phần', 'Ô', 'Quy tắc'],
        rows: [
          ['**Links**', 'Label, URL (mỗi ngôn ngữ), Visible, thứ tự', 'Tối đa **50** link. **VI bắt buộc** cho cả label lẫn URL; EN/KO trống thì site dùng VI (ko → en → vi). URL là `https://…` hoặc đường dẫn bắt đầu bằng **một** `/`; từ chối `http:`, `mailto:`, `javascript:`, `//host`, chữ trần; tối đa 1024 ký tự. Trên site: `/` mở cùng tab, `https://` mở tab mới'],
          ['**Info**', 'Rich text mỗi ngôn ngữ', 'Đậm, nghiêng, gạch chân, link, xuống dòng. **Không có danh sách** (dán vào sẽ bị làm phẳng), không heading, không ảnh, không bảng. VI bắt buộc; tối đa 4000 ký tự/ngôn ngữ. svn-be làm sạch HTML khi lưu'],
          ['**Email**', 'Email label, Email link', 'Label VI bắt buộc, tối đa 120. Link là `mailto:…`, `https://…` hoặc `/…`'],
          ['**Social**', 'Facebook, LinkedIn, YouTube', 'Chỉ `https://`. **Để trống = ẩn icon đó**'],
          ['**Copyright**', 'Một dòng mỗi ngôn ngữ', 'VI bắt buộc, tối đa 255'],
        ],
        note: 'Chỉ **tiếng Việt** là bắt buộc, và chỉ ở các ô được vẽ. EN/KO trống thì site rơi về VI — không bao giờ hiện ô trống.',
      },
      {
        kind: 'table',
        heading: 'Tab nào vẽ ở đâu',
        cols: ['Tab', 'Hiện trên'],
        rows: [
          ['**Jobseeker**', 'Các trang của site ứng viên (svn-web)'],
          ['**Company**', 'Site tuyển dụng (`hiring.<domain>`) và catalogue sản phẩm billing'],
        ],
      },
      {
        kind: 'warn',
        text:
          '**Sửa so với bản cũ của trang này:** chân trang **không còn** hai tab “settings” / “groups” (khối link). Từ bản thiết kế lại 06/10 (`FOOTER-CONTRACT.md`), hai tab là **hai surface Jobseeker / Company**; mỗi tab có bốn phần Links · Info · Email & social · Copyright và hai nút Save. Không còn “nhóm link” và không còn đích kiểu menu — link là URL dán vào.',
      },
    ],
  },

  /* ── Notices & events ────────────────────────────────────────────────────── */
  'site-notices': {
    logic: [
      'Bảng thông báo và sự kiện của **trung tâm trợ giúp** (고객센터) trên site jobseeker — phần khách truy cập đọc dưới mục 공지/이벤트: `/ho-tro/thong-bao` (bảng thông báo), `/ho-tro/su-kien` (lưới sự kiện), chi tiết ở `/ho-tro/thong-bao/<id>` (EN `/help/notices`, `/help/events`).',
      'Hai loại nội dung **trong một danh sách** (lọc bằng *Type*): **Notice** — một dòng trên bảng, có **danh mục**, ngày đăng và **lượt xem**; **Event** — một thẻ có **ảnh** và **khoảng ngày** trên lưới sự kiện, mở ra cùng trang chi tiết như notice.',
      'Mỗi bản ghi có **đối tượng** (*Shown to*): *Everyone*, *Jobseekers* hoặc *Employers*. *Everyone* hiện ở **cả hai** tab Jobseeker và Employer của bảng công khai — không phải tab thứ ba.',
      'Viết bằng **ít nhất một** ngôn ngữ; mỗi ngôn ngữ cần **cả tiêu đề lẫn nội dung**. Ngôn ngữ nào không viết thì **khách đọc site bằng ngôn ngữ đó không thấy bản ghi** (không rơi về VI).',
      'Quyền `site_notice` (read · create · update · delete), **mặc định chỉ HQ admin** (seed V533). **Publish, Unpublish, Archive, Pin đều là quyền Update** — và **tạo thẳng ở trạng thái Published cũng cần Update** (không chỉ Create).',
    ],
    how: [
      '**New record** → chọn **Type** (Notice / Event) → **Filed under** (danh mục, chỉ Notice) hoặc **Card artwork** + **Runs from / Runs until** (chỉ Event) → **Shown to** → tiêu đề + nội dung theo ngôn ngữ → trạng thái ban đầu (*Draft* hoặc *Published*) và **Publication date** (tuỳ chọn) → lưu.',
      'Đăng bài đã soạn: thẻ **Publication** ở cột phải → **Publish** (tự lưu trước). Gỡ: **Unpublish** (về Draft). Kết thúc: **Archive**.',
      'Ghim lên đầu: kebab ⋮ trên danh sách → **Pin to the top**.',
    ],
    watch: [
      '**Save không bao giờ publish.** Sau khi tạo, trạng thái và ngày đăng **chỉ đổi bằng thẻ Publication** — hai ô đó bị khoá trong form sửa.',
      '**Type không đổi được sau khi tạo** (đổi qua lại làm mất danh mục hoặc ảnh + ngày). Gõ nhầm loại → tạo bản ghi mới.',
      '**Ngày đăng ở tương lai = hẹn giờ.** Bản ghi Published với ngày tương lai **không hiện** cho tới đúng thời điểm đó; Publish không kéo nó về hôm nay.',
      '**Unpublish rồi Publish lại giữ nguyên ngày đăng gốc** — bài không nhảy lên đầu bảng.',
      'Bài **ghim chỉ đứng đầu trang 1**, vẫn phải qua bộ lọc của khách (tab đối tượng, danh mục, từ khoá) và vẫn tính vào tổng số.',
      '**Delete là vĩnh viễn và mất luôn lượt xem.** Muốn cho nghỉ thì **Archive** (giữ ngày đăng và lượt xem, Publish lại được).',
    ],
    blocks: [
      {
        kind: 'table',
        heading: 'Danh sách — cột và bộ lọc',
        cols: ['Cột', 'Nghĩa'],
        rows: [
          ['**Type**', 'Notice / Event'],
          ['**Filed under**', 'Danh mục (chỉ Notice)'],
          ['**Shown to**', 'Everyone / Jobseekers / Employers'],
          ['**Title**', 'Tiêu đề, kèm các ngôn ngữ đã viết — đó là **tầm với** của bản ghi'],
          ['**Pinned**', '*Pinned* hoặc —'],
          ['**Status**', 'Draft · Published · Archived'],
          ['**Published**', 'Ngày đăng (trống tới lần publish đầu)'],
          ['**Views**', 'Lượt xem — mỗi lần mở trang chi tiết cộng 1'],
        ],
        note: 'Bộ lọc (đều chạy phía server): **Type · Status · Audience · Category · tìm theo tiêu đề** (khớp bất kỳ ngôn ngữ nào). Ở admin, Audience là lọc **bằng đúng giá trị** (chọn Employers chỉ ra bản ghi gửi Employers, không gồm Everyone). Sắp: **ghim trước, rồi mới tạo trước**. Phân trang 20/trang. Không có export.',
      },
      {
        kind: 'table',
        heading: 'Notice và Event — ô nào bắt buộc',
        cols: ['Ô', 'Notice', 'Event'],
        rows: [
          ['**Filed under** (danh mục)', '**Bắt buộc** — Hướng dẫn · Ra mắt · Khác · Cập nhật · Cách sử dụng · Khuyến mãi', '**Không được có**'],
          ['**Card artwork**', 'Không được có', '**Bắt buộc** — tỉ lệ thẻ 308×159, upload **616×318 trở lên**'],
          ['**Runs from / until**', 'Không được có', 'Tuỳ chọn — xem bảng ba dạng ngày bên dưới'],
          ['**Shown to**', 'Bắt buộc', 'Bắt buộc'],
          ['**Title + Body**', '≥ 1 ngôn ngữ, mỗi ngôn ngữ đủ cặp', 'như Notice'],
          ['**Pin to the top**', 'Tuỳ chọn', 'Tuỳ chọn'],
        ],
        note: 'Nội dung là rich text: đoạn, heading h2–h4, danh sách, trích dẫn, bảng, ảnh (upload qua nút ảnh), link. svn-be làm sạch HTML khi lưu.',
      },
      {
        kind: 'table',
        heading: 'Ba dạng ngày của một Event',
        cols: ['Từ', 'Đến', 'Nghĩa trên lưới sự kiện'],
        rows: [
          ['trống', 'trống', '**Thường trực** (“Always on”) — ở trên lưới tới khi unpublish'],
          ['có', 'trống', '**Mở đầu, không kết thúc** — thẻ in ngày bắt đầu, ở trên lưới'],
          ['có', 'có', '**Cố định** — rời lưới **ngày sau ngày kết thúc** (theo giờ Việt Nam). Cùng ngày = sự kiện một ngày'],
          ['trống', 'có', '**Bị từ chối**: “This event ends but never starts”'],
        ],
        note: 'Lưới chỉ hiện sự kiện **đang chạy** (chưa hết hạn), mới nhất trước, tối đa **60** thẻ, không phân trang. Sự kiện chưa bắt đầu vẫn được liệt kê. Trang chi tiết vẫn mở được sau khi sự kiện kết thúc. **Event không lên bảng thông báo.**',
      },
      {
        kind: 'table',
        heading: 'Trạng thái',
        cols: ['Trạng thái', 'Nghĩa', 'Tới bằng cách nào', 'Làm gì tiếp'],
        rows: [
          ['**Draft**', 'Không hiện; chỗ chờ đủ bản dịch', 'Tạo ở Draft · **Unpublish** từ Published', 'Publish · Archive · Delete'],
          ['**Published**', 'Hiện trên bảng/lưới — **khi ngày đăng đã tới**', 'Tạo ở Published (cần quyền Update) · **Publish** (đóng dấu ngày đăng lần đầu nếu chưa có)', 'Unpublish · Archive · Pin/Unpin · Delete'],
          ['**Archived**', 'Đã nghỉ; vắng khỏi mọi trang công khai; giữ ngày đăng và lượt xem', '**Archive** — từ bất kỳ trạng thái nào', '**Publish** đưa trở lại nguyên vẹn · Delete'],
        ],
        note: '*Review* tồn tại trong bộ trạng thái chung nhưng **không tới được** ở module này.',
      },
      {
        kind: 'table',
        heading: 'Thông báo lỗi trước khi lưu',
        cols: ['Lỗi', 'Nghĩa'],
        rows: [
          ['“This record has no language yet”', 'Chưa có ngôn ngữ nào đủ cả tiêu đề lẫn nội dung'],
          ['“One language is only half written”', 'Một ngôn ngữ có tiêu đề mà thiếu nội dung (hoặc ngược lại); form tự mở ngôn ngữ đó'],
          ['“A notice needs a category”', 'Notice thiếu danh mục'],
          ['“An event needs its card artwork”', 'Event thiếu ảnh thẻ'],
          ['“This event ends before it starts”', 'Ngày kết thúc trước ngày bắt đầu'],
        ],
      },
      {
        kind: 'list',
        heading: 'Trên site và độ trễ',
        items: [
          'Bảng thông báo công khai: tab đối tượng (Everyone hiện ở cả hai tab), lọc danh mục, tìm theo tiêu đề **bằng ngôn ngữ đang đọc**; ghim trước, rồi mới đăng trước.',
          'Trang chi tiết có nút **trước / sau** theo ngày đăng **trong cùng loại** (bỏ qua ghim và bộ lọc).',
          'Danh sách và lưới được svn-web cache **60 giây** — bài mới publish xuất hiện trong khoảng một phút. Trang chi tiết **không cache** (để đếm lượt xem).',
        ],
      },
      {
        kind: 'example',
        heading: 'Hẹn giờ thông báo bảo trì',
        scenario: 'Ngày 08/10 soạn thông báo bảo trì hệ thống, muốn hiện lúc 09:00 ngày 10/10 cho cả ứng viên và nhà tuyển dụng.',
        cols: ['Bước', 'Làm gì', 'Kết quả'],
        rows: [
          ['1', 'New record · Type *Notice* · Filed under *Cập nhật* · Shown to *Everyone*', '—'],
          ['2', 'Viết tiêu đề + nội dung VI và EN; bỏ trống KO', 'Khách đọc tiếng Hàn sẽ **không thấy** bài'],
          ['3', 'Status *Published* · Publication date 10/10 09:00 → lưu', 'Published nhưng **chưa hiện** (ngày ở tương lai)'],
          ['4', '10/10 09:00 + tối đa ~1 phút', 'Bài hiện ở tab Jobseeker **và** tab Employer'],
          ['5', 'Bảo trì xong → Archive', 'Rời bảng; giữ lượt xem; Publish lại được nếu cần'],
        ],
      },
      {
        kind: 'open',
        text:
          '**Tài liệu admin chưa cập nhật:** `docs/features/notices.md` (admin 45954108) vẫn ghi “svn-be in flight” — thực tế `AdminSiteNoticeController` đã có trên svn-be ee1db5ea9 (V533). Hành vi trên đây đọc từ controller, chưa chạy thử trên màn hình (chưa xác minh bằng ảnh).',
      },
    ],
  },

  /* ── FAQ ─────────────────────────────────────────────────────────────────── */
  faq: {
    logic: [
      'Các danh sách câu hỏi mà site công khai vẽ. **Hai tab, hai vùng (surface)**: **Company information** — FAQ dưới hồ sơ pháp lý trên trang *company-join* của site tuyển dụng, một danh sách phẳng có thứ tự; **Help centre** — câu hỏi của trung tâm trợ giúp `/ho-tro/cau-hoi`, ba tầng *đối tượng → danh mục → câu hỏi*.',
      'Màn hình này nằm ở *System → FAQ* (`/system/faq`) tới 21/09; đường cũ vẫn chuyển hướng sang `/content/faq`.',
      '**Quy tắc ngôn ngữ ngược với mọi màn hình khác**: một câu hỏi viết bằng **ít nhất một** trong VI/EN/KO (chỉ tiếng Hàn cũng hợp lệ); mỗi ngôn ngữ phải có **cả câu hỏi lẫn câu trả lời**; ngôn ngữ thiếu thì **câu đó bị giấu với khách đọc ngôn ngữ ấy** — không rơi về VI. Cột *Languages* cho biết tầm với.',
      '**Danh mục và từ khoá gợi ý thì ngược lại**: VI bắt buộc, EN/KO thiếu thì rơi về VI (vì chúng là điều hướng — giấu đi là mất đường vào).',
      'Quyền `site_faq` (read · create · update · delete), **mặc định chỉ HQ admin** (seed V457). Riêng với `site_notice` — cấp cái này không cấp cái kia.',
    ],
    how: [
      'Chọn tab **Company information** hoặc **Help centre**.',
      '**Help centre**: chọn đối tượng (*Jobseekers / Employers*) → chọn **danh mục** ở cột trái (hoặc *New* để tạo) → bảng câu hỏi của danh mục đó hiện bên phải.',
      '**New entry** → câu hỏi + câu trả lời theo ngôn ngữ → trạng thái → (Help centre) danh mục và *Show on the help centre home page* → lưu.',
      'Sắp thứ tự: **kéo tay nắm** hoặc ▲▼. Bảng gửi lại **cả nhóm** trong một lần.',
      'Đổi trạng thái từ kebab ⋮: *Publish · Unpublish · Send for review · Archive · Delete* (mỗi cái hỏi xác nhận).',
      '**Recommended searches** (cột trái, dưới danh mục): các chip dưới ô tìm kiếm của trung tâm trợ giúp, dùng chung cho cả hai đối tượng.',
    ],
    watch: [
      '**Danh mục không Published thì giấu MỌI câu bên trong**, kể cả câu đã Published. Đặt danh mục về Draft là cách tắt cả nhóm.',
      'Trang chủ trung tâm trợ giúp chỉ lấy **5 câu “featured” đầu tiên mỗi danh mục**, theo thứ tự trong bảng. Câu featured thứ 6 vẫn bật nhưng **không hiện**.',
      '**Kéo thả bị tắt khi đang lọc trạng thái** — xoá bộ lọc để sắp lại.',
      'Không xoá được danh mục còn câu hỏi: “This category still has entries in it…” — chuyển/xoá câu trước, hoặc đặt danh mục về Draft.',
      'Dòng cảnh báo đầu bảng: “{n} of {total} published entries are missing a language…” — những câu đó vô hình với khách đọc ngôn ngữ thiếu.',
      'Site cache danh sách FAQ **60 giây** — sửa xong đợi khoảng một phút.',
    ],
    blocks: [
      {
        kind: 'table',
        heading: 'Hai vùng FAQ',
        cols: ['Tab', 'Hiện ở đâu', 'Cấu trúc', 'Câu trả lời'],
        rows: [
          ['**Company information**', 'Site tuyển dụng — trang *company-join* (dưới hồ sơ pháp lý, giấy tờ đăng ký)', 'Một danh sách phẳng có thứ tự', '**Chữ thường**, giữ xuống dòng; tối đa **2.000** ký tự'],
          ['**Help centre**', 'Site jobseeker — `/ho-tro`, `/ho-tro/cau-hoi/<id>`, tìm kiếm `/ho-tro/tim-kiem`', 'Đối tượng → danh mục → câu hỏi; thứ tự **trong từng danh mục**', '**Rich text** (ảnh, bảng, heading); tối đa **20.000** ký tự'],
        ],
      },
      {
        kind: 'table',
        heading: 'Cột trong bảng câu hỏi',
        cols: ['Cột', 'Nghĩa'],
        rows: [
          ['**Question**', 'Câu hỏi (ngôn ngữ đầu tiên có)'],
          ['**Languages**', 'Ba chip VI/EN/KO — chip tắt = “hidden from those visitors”'],
          ['**Home block**', '(Help centre) có lên khối trang chủ hay không — chỉ đọc, sửa trong drawer'],
          ['**Status**', 'Draft · Review · Published · Archived'],
          ['**Updated**', 'Lần sửa gần nhất'],
          ['**Order**', 'Tay nắm kéo + ▲▼'],
        ],
        note: 'Không phân trang, không tìm kiếm, không sắp theo cột — bảng là toàn bộ một vùng (hoặc một danh mục). Bộ lọc trạng thái chạy trong trình duyệt.',
      },
      {
        kind: 'table',
        heading: 'Trạng thái của một câu hỏi',
        cols: ['Trạng thái', 'Trên site', 'Tới bằng cách nào', 'Làm gì tiếp'],
        rows: [
          ['**Draft**', 'Không hiện — chỗ chờ đủ bản dịch', 'Tạo · **Unpublish** từ Published/Review', 'Publish · Send for review · Archive · Delete'],
          ['**Review**', 'Không hiện', '**Send for review** (chỉ từ Draft) hoặc chọn trong drawer', 'Publish · Unpublish · Archive · Delete'],
          ['**Published**', '**Hiện** — nếu danh mục cũng Published và đúng ngôn ngữ', '**Publish**', 'Unpublish · Archive · Delete'],
          ['**Archived**', 'Không hiện; giữ nội dung', '**Archive**', 'Publish · Delete'],
        ],
        note: 'Không có cờ “ẩn” riêng — ba trên bốn trạng thái đã là ẩn. Danh mục cũng có trạng thái; danh mục không Published **thắng** trạng thái của câu hỏi.',
      },
      {
        kind: 'warn',
        text:
          '**Sửa so với bản cũ của trang này:** FAQ **không còn chỉ một vùng** — có hai tab, *Company information* và *Help centre*; tab Help centre có danh mục theo đối tượng, cờ trang chủ và từ khoá gợi ý.',
      },
    ],
  },

  /* ── Pages / Boards / Blog — flagged off ─────────────────────────────────── */
  pages: {
    logic: [
      '**Chưa làm.** *Pages* (trang tĩnh dựng bằng khối + phiên bản) **không có backend** trên svn-be (nợ D-CONT-1). Mục menu bị tắt bằng cờ `contentPages = false` trong `modules.config.ts`, nên **sidebar không hiện**.',
      'Gõ thẳng `/content/pages` vẫn mở được, nhưng chỉ ra trang *“Not available yet”*. Không có quyền nào để cấp.',
      'Nhu cầu cũ của màn hình này đã có chỗ khác: **điều khoản, chính sách bảo mật, đồng ý xử lý dữ liệu** nằm ở *Content → Policies* (`/content/policies`, SRM-764); trang chiến dịch nằm ở *Content → Zones*.',
    ],
    how: [
      'Không có thao tác. Muốn sửa nội dung pháp lý → *Content → Policies*. Muốn trang chiến dịch → *Content → Zones*.',
    ],
    blocks: [
      {
        kind: 'open',
        text:
          '**Pages chưa có trên nền mới.** Kiểm ở admin 45954108: `configs/modules.config.ts` (`contentPages: false` — “Page (CMS blocks + versioning) is not implemented on svn-be”), `routes.config.tsx` (không có trang đăng ký → *UnderConstructionPage*). svn-be ee1db5ea9 không có controller trang tĩnh. Thấy màn hình trống thì đó là **chưa làm**, không phải lỗi.',
      },
    ],
  },
  boards: {
    logic: [
      '**Chưa làm.** *Boards* (bảng tin cộng đồng / bài viết 3 ngôn ngữ, ghim) **không có backend** trên svn-be (nợ D-CONT-1). Cờ `contentBoards = false` → sidebar không hiện; gõ thẳng `/content/boards` chỉ ra *“Not available yet”*.',
      'Bảng thông báo của trung tâm trợ giúp **không phải màn hình này** — nó là *Content → Notices & events*, đã chạy thật.',
    ],
    how: ['Không có thao tác. Thông báo / sự kiện cho khách → *Content → Notices & events*.'],
    blocks: [
      {
        kind: 'open',
        text:
          '**Boards chưa có trên nền mới.** Kiểm ở admin 45954108: `modules.config.ts` (`contentBoards: false` — “Board/BoardPost is not implemented on svn-be”), `docs/be-blocked.md` (D-CONT-1). Chưa có quyền, chưa có route trang. Có cần màn hình này nữa không khi Notices & events đã có — chưa ai quyết.',
      },
    ],
  },
  blog: {
    logic: [
      '**Chưa làm.** *Blog / articles* (bài viết 3 ngôn ngữ, loại bài, slug, tác giả, ảnh bìa) **không có màn hình** và **không có API bài viết** trên svn-be (nợ D-CONT-1). Cờ `contentArticles = false` → sidebar không hiện; gõ thẳng `/content/blog` chỉ ra *“Not available yet”*.',
      'Ma trận phân quyền vẫn có dòng **Blog / articles** với quyền `content_article:read` (seed từ V4 cho HQ admin) — cấp nó **không mở ra gì** trong console. Dòng **Content categories** (`cms_content_category`) cũng vậy: có API danh mục nhưng chưa màn hình nào dùng.',
    ],
    how: ['Không có thao tác.'],
    blocks: [
      {
        kind: 'open',
        text:
          '**Blog chưa có trên nền mới.** Kiểm ở admin 45954108: `modules.config.ts` (`contentArticles: false` — “Article is not implemented on svn-be”), `admin-pages.config.ts` (dòng `articles`: “The screen is not built — `/content/blog` renders Not available yet”). svn-be ee1db5ea9: chỉ có `AdminCmsContentCategoryController`, không có controller bài viết. Site jobseeker (svn-web d8a43a11) cũng chưa có trang blog.',
      },
    ],
  },

  /* ── Mega menu pages: Jobs boards ────────────────────────────────────────── */
  'jobs-pages': {
    logic: [
      'Ba trang của mục **Việc làm** trên mega menu — **Theo khu vực**, **Theo ngành nghề**, **Theo ngành** — là **cùng một màn hình** trên site jobseeker. Chúng chỉ khác nhau ở **trục nhóm** mà svn-be dùng để xếp tin, ở ô bắt buộc của thanh tìm kiếm, và ở tiêu đề.',
      'Từ trên xuống: tiêu đề (chỉ desktop) → **thanh tìm kiếm đầy đủ** của trang `/search` (khu vực, ngành nghề/ngành, từ khoá, panel `+` kinh nghiệm/học vấn/lương…) → băng **Đừng bỏ lỡ những tin này!** (3 cột) → băng **Tin tuyển dụng nổi bật** (4 cột) → (chỉ sau khi bấm tìm) **danh sách kết quả** giống `/search` → banner quảng cáo cuối trang. Trên mobile, thanh tìm kiếm được thay bằng panel tìm kiếm mobile.',
      '**Không có màn hình admin riêng** cho các trang này. Admin điều khiển chúng **gián tiếp** qua: sản phẩm tin đăng (bậc nào phủ băng nào), số thẻ của vùng placement, thang bậc tin, auto-refresh, dữ liệu tin và công ty, master data, và mục menu.',
      'Hai băng **không tự chọn tin bằng tay**: một tin vào băng khi **product cao nhất đang chạy của tin đó có tick vùng placement tương ứng** (*Mega menu page - Job list trending* / *… announcement*). Vùng chưa ai tick → băng **rỗng và ẩn hẳn**.',
    ],
    how: [
      'Muốn đổi **bậc nào lên băng nào**: *Product settings → Products → (product) → Placement slots* → thêm/bỏ vùng *Mega menu page - Job list trending* hoặc *… announcement*.',
      'Muốn đổi **số thẻ mỗi băng**: *Product settings → Placements* → hai vùng trên → **Items shown** (đổi cả ba trang cùng lúc; mặc định seed 40 và 15).',
      'Muốn đổi **thứ tự giữa các bậc**: *Product settings → Posting ladder* (kéo thả).',
      'Muốn ẩn / đổi chỗ / gắn badge cho mục menu dẫn tới các trang này: *Content → Site navigation → Mega menu* (các mục Built-in `jobs.byLocation`, `jobs.byRole`, `jobs.byIndustry`).',
      'Kiểm một tin cụ thể không thấy trên băng: xem bảng “Khi nào một tin có mặt trên băng” bên dưới.',
    ],
    watch: [
      '**Tên băng thật trên site** là *Đừng bỏ lỡ những tin này!* và *Tin tuyển dụng nổi bật* (EN *Don’t miss these jobs!* / *Trending jobs*).',
      '**Tin không có bậc trả phí nào đang chạy thì không lên băng nào**, kể cả bậc Free — trừ khi chính product Free có tick vùng announcement. Tin vẫn tìm thấy được qua thanh tìm kiếm.',
      '**“Không công ty nào quá 10 %” là một THỨ TỰ, không phải trần cứng**: tin được xếp theo vòng (mỗi công ty một tin mới nhất, rồi vòng hai…). Khi băng có ít hơn 10 nhà tuyển dụng, một công ty vẫn có thể chiếm nhiều hơn 10 %.',
      '**Nhóm “đông tin nhất lên trước” được đếm sống**, không phải danh sách tỉnh cố định — một tỉnh nhỏ có thể vượt lên.',
      'Banner quảng cáo cuối trang hiện là **ảnh mẫu cố định trong code** (`ads-container.tsx`), chưa nối với *Boosting*.',
      'Các trang này **không khai báo tiêu đề / mô tả SEO riêng** — dùng mặc định của site.',
    ],
    blocks: [
      {
        kind: 'h',
        text: '§1 Ba trang, một màn hình',
      },
      {
        kind: 'table',
        heading: 'Ba trang và chỗ chúng khác nhau',
        cols: ['Trang', 'Đường dẫn (VI · EN/KO)', 'Tiêu đề h1', 'Trục nhóm của hai băng', 'Ô bắt buộc khi bấm tìm'],
        rows: [
          ['**Theo khu vực**', '`/viec-lam/dia-diem` · `/jobs/locations`', 'Theo khu vực / Jobs by locations', '**Tỉnh/TP** có nhiều tin hiển thị nhất lên trước', 'Khu vực (panel khu vực mở sẵn)'],
          ['**Theo ngành nghề**', '`/viec-lam/nganh-nghe` · `/jobs/roles`', 'Theo ngành nghề / Jobs by job roles', '**Category** (cấp 1 của *Job taxonomy*) nhiều tin nhất lên trước', 'Ngành nghề (panel ngành nghề mở sẵn; ô ngành nghề đứng trước ô khu vực)'],
          ['**Theo ngành**', '`/viec-lam/nganh` · `/jobs/industries`', 'Theo ngành / Jobs by industries', '**Ngành cấp cao nhất** của công ty nhiều tin nhất lên trước', 'Ngành (ô nghề được thay bằng cây ngành 3 cấp)'],
        ],
        note: 'Bấm tìm khi thiếu ô bắt buộc thì hiện thông báo thay vì chạy. Một lần tìm mang tối đa **15** khu vực / ngành. Mục cha **Việc làm** trên menu dẫn tới *Theo khu vực*. Mục con thứ tư — **Công ty hàng đầu** (`/viec-lam/cong-ty-hang-dau`) — là trang khác, không thuộc màn hình này.',
      },
      {
        kind: 'table',
        heading: 'Hai băng',
        cols: ['Băng', 'Thứ tự trên trang', 'Ai vào được', 'Số thẻ', 'Vùng placement'],
        rows: [
          ['**Đừng bỏ lỡ những tin này!**', 'Trước (3 cột)', 'Tin có product cao nhất **tick vùng announcement**', '`Items shown` của vùng (seed **15**)', '`placement_mega_menu_page_job_list_announcement` — *Mega menu page - Job list announcement*'],
          ['**Tin tuyển dụng nổi bật**', 'Sau (4 cột)', 'Tin có product cao nhất **tick vùng trending**', '`Items shown` của vùng (seed **40**)', '`placement_mega_menu_page_job_list_trending` — *Mega menu page - Job list trending*'],
        ],
        note: 'Băng **không phân trang**. Băng rỗng thì **không vẽ gì** (không có tiêu đề trên lưới trống). Nếu không đọc được Items shown, site dùng 15 / 40.',
      },
      {
        kind: 'table',
        heading: 'Thứ tự bên trong một băng',
        cols: ['#', 'Khoá sắp xếp', 'Nghĩa'],
        rows: [
          ['1', '**Nhóm đông tin nhất**', 'Theo trục của trang (tỉnh / Category của Job taxonomy / ngành gốc), **đếm trên tin đang hiển thị**'],
          ['2', '**Bậc tin**', '`display_order` của product cao nhất đang chạy — thứ tự kéo ở *Posting ladder*'],
          ['3', '**Trải đều nhà tuyển dụng**', 'Mỗi công ty một tin mới nhất, rồi vòng hai… (luật “≤ 10 %”)'],
          ['4', '**Lần auto-refresh gần nhất**', '`refreshed_at` — **không phải** lần sửa tin gần nhất'],
        ],
      },
      {
        kind: 'h',
        text: '§2 Khi nào một tin có mặt',
      },
      {
        kind: 'table',
        heading: 'Khi nào một tin có mặt trên băng',
        cols: ['Điều kiện', 'Đặt ở đâu', 'Thiếu thì'],
        rows: [
          ['Tin **Open**, **đang phơi (exposure)**, còn trong cửa sổ đăng', '*Recruitment → Jobs*', 'Không ở đâu trên site'],
          ['Công ty **Active** và **có MST**', '*CRM → Customers*', 'Không ở đâu trên site'],
          ['Tin có **một product trả phí đang chạy**, và product cao nhất trong số đó **tick vùng** của băng', '*Product settings → Products → Placement slots*', 'Không lên băng; vẫn ra trong kết quả tìm kiếm'],
          ['Khớp bộ lọc trên URL (nếu khách đã lọc)', 'Thanh tìm kiếm', 'Bị lọc ra'],
          ['Đủ chỗ trong `Items shown`', '*Product settings → Placements*', 'Rơi khỏi băng (không có trang 2)'],
        ],
        note: 'Trục nhóm cần dữ liệu: tỉnh của tin (master data *Locations*), ngành nghề của tin (*Job taxonomy*, cây 3 cấp Category → Group → Role — đếm theo Category), ngành của **công ty** (*Industries*, cây 3 cấp — đếm theo gốc). **Tin ẩn danh không được đếm vào nhóm ngành** (công ty bị giấu).',
      },
      {
        kind: 'table',
        heading: 'HQ điều khiển các trang này ở đâu',
        cols: ['Muốn đổi', 'Ở đâu trong Admin', 'Tác dụng trên site'],
        rows: [
          ['Bậc nào lên băng nào', '*Product settings → Products → (product) → Placement slots*', 'Thêm / bỏ tin của cả bậc khỏi băng — ngay ở lượt tải sau'],
          ['Băng hiện bao nhiêu thẻ', '*Product settings → Placements → Items shown*', 'Đổi kích thước băng trên cả ba trang (và Korea/Global)'],
          ['Bậc nào đứng trước', '*Product settings → Posting ladder*', 'Khoá sắp xếp 2'],
          ['Tin được đẩy lên bao lâu một lần', 'Product → *Auto-refresh*', 'Khoá sắp xếp 4'],
          ['Danh sách tỉnh / ngành nghề / ngành', '*System → Master data* — tab *Locations* / *Job taxonomy* / *Industries*', 'Bộ chọn của thanh tìm kiếm và trục nhóm. svn-web cache master data tới 1 giờ; svn-be gọi xoá cache sau khi lưu cho các danh mục có trong danh sách cho phép (chưa xác minh từng danh mục)'],
          ['Mục menu dẫn tới trang', '*Content → Site navigation → Mega menu*', 'Ẩn / sắp / badge (tên và đường dẫn do site giữ)'],
        ],
      },
      {
        kind: 'example',
        heading: 'Một tin Basic Plus của công ty Hàn Quốc ở TP.HCM',
        scenario: 'Công ty A (Active, có MST, Country = Hàn Quốc) đăng tin “Backend Developer” ở TP.HCM, bậc *Basic Plus*. Product Basic Plus có tick vùng *Mega menu page - Job list trending*.',
        cols: ['Trang', 'Tin ở đâu', 'Vì sao'],
        rows: [
          ['`/viec-lam/dia-diem`', 'Băng **Tin tuyển dụng nổi bật**, trong nhóm TP.HCM', 'Bậc phủ vùng trending; nếu TP.HCM đang có nhiều tin nhất thì nhóm này đứng đầu'],
          ['`/viec-lam/nganh-nghe`', 'Băng **Tin tuyển dụng nổi bật**, trong nhóm IT/phần mềm', 'Cùng băng, khác trục nhóm'],
          ['`/viec-lam/han-quoc`', 'Băng **Tin tuyển dụng nổi bật**', 'Country = KR'],
          ['`/viec-lam/nuoc-ngoai`', '**Không có**', 'Global loại công ty KR'],
          ['Sau khi bỏ tick vùng trending trên product Basic Plus', '**Rời mọi băng**, vẫn ra khi khách bấm tìm', 'Không còn bậc nào của tin phủ vùng'],
        ],
        note: 'Nếu tin này được đăng **ẩn danh**: không lên `/viec-lam/han-quoc`, nhưng **có** trên `/viec-lam/nuoc-ngoai` (xem trang Korea/Global).',
      },
      {
        kind: 'list',
        heading: 'URL, SEO và độ trễ',
        items: [
          'Đường dẫn tiếng Việt `/viec-lam/...`; tiếng Anh và tiếng Hàn **dùng chung** đường dẫn `/jobs/...` — ngôn ngữ đọc từ cookie, không từ đường dẫn.',
          'Bộ lọc nằm trên URL với **đúng các key của `/search`** (`province-code`, `role`, `industry`, `keyword`, `level`…), nên một URL đã lọc chia sẻ được và mở ra đúng kết quả.',
          'Danh sách tin đọc **không cache** (`no-store`) — đổi tick / Items shown / trạng thái tin thấy ngay ở lượt tải sau.',
          'Không có `generateMetadata` riêng: tiêu đề tab và mô tả SEO là mặc định của site.',
        ],
      },
      {
        kind: 'open',
        text:
          '**Tên và số thẻ của hai vùng.** Migration V557/V560 đặt tên *Mega menu page - Job list trending / announcement* với Items shown **40 / 15**. Trang *Placements* của guide này đang ghi tên *Trending jobs / Don’t miss these jobs* và **30 / 48** — có thể là giá trị đã sửa trên dữ liệu dev, chưa xác minh trên DB. **Vùng nào đang được tick trên product nào** cũng là dữ liệu vận hành, không có trong migration (chưa xác minh). Banner cuối trang chưa nối Boosting (`features/jobs/domestic/ui/ads-container.tsx`, TODO).',
      },
    ],
  },

  /* ── Mega menu pages: Korea / Global ─────────────────────────────────────── */
  'korea-global-pages': {
    logic: [
      'Hai mục cấp 1 **Hàn Quốc** và **Toàn cầu** trên mega menu (từ V643 đứng cạnh *Việc làm*, không còn nằm trong nó) dẫn tới **cùng màn hình bảng tin** với *Theo khu vực*, chỉ thêm một **bộ lọc quốc gia của nhà tuyển dụng cố định theo đường dẫn**.',
      '**Korea** (`/viec-lam/han-quoc`, EN/KO `/jobs/korea`, tiêu đề *Công ty Hàn Quốc*) giữ tin của công ty có Country = **KR**. **Global** (`/viec-lam/nuoc-ngoai`, EN/KO `/jobs/global`, tiêu đề *Công ty toàn cầu*) giữ **mọi tin còn lại** — kể cả công ty **Việt Nam** và công ty **để trống** quốc gia. Hai trang cộng lại = toàn bộ bảng tin, không mất tin nào.',
      'Quốc gia lấy từ ô **Country** của công ty — *CRM → Customers → (công ty) → Edit*. Đây là **thuộc tính của công ty, không phải của tin**.',
      'Hai băng xếp theo **tỉnh/TP** (như *Theo khu vực*); thanh tìm kiếm **không có ô bắt buộc**; mọi bộ lọc khác giống `/search`, và **không control nào nới được bộ lọc quốc gia**. Danh sách kết quả sau khi bấm tìm và con số trên nút tìm cũng tính trong phạm vi quốc gia đó.',
    ],
    how: [
      'Đưa một công ty vào **Korea**: *CRM → Customers → (công ty) → Edit → Country* = Hàn Quốc → lưu. Tin của họ chuyển trang ở lượt tải sau.',
      'Đưa ra khỏi Korea: đổi Country sang nước khác hoặc **xoá trống** → tin rơi về **Global**.',
      'Các cài đặt băng (bậc nào lên băng, số thẻ, thứ tự) **dùng chung** với ba trang Jobs — xem *Jobs pages*.',
    ],
    watch: [
      '**Công ty Việt Nam nằm ở trang “Toàn cầu”.** Global nghĩa là “không phải Hàn Quốc”, không phải “nước ngoài”. Đường dẫn VI `/viec-lam/nuoc-ngoai` dễ gây hiểu nhầm.',
      '**Tin đăng ẩn danh không bao giờ ở Korea, và luôn ở Global** — công ty bị giấu nên không trục công ty nào khớp được (SRM-737).',
      'Công ty chọn nước ngoài trong CRM thì ô **tỉnh/TP bị xoá** — tin của họ vẫn có tỉnh của chính tin, nên vẫn vào nhóm tỉnh trên băng.',
      'Trang Korea **không dùng** collection “Korean companies” hay zone NIPA — hai danh sách có thể khác nhau (collection có thể lọc theo company tag thay vì quốc gia).',
    ],
    blocks: [
      {
        kind: 'table',
        heading: 'Quốc gia của công ty → trang nào',
        cols: ['CRM → Country', 'Tin công khai', 'Korea', 'Global'],
        rows: [
          ['Hàn Quốc (KR)', 'Không ẩn danh', '**Có**', 'Không'],
          ['Hàn Quốc (KR)', 'Ẩn danh', 'Không', '**Có**'],
          ['Việt Nam (VN)', 'bất kỳ', 'Không', '**Có**'],
          ['Nước khác (JP, US…)', 'bất kỳ', 'Không', '**Có**'],
          ['**Để trống**', 'bất kỳ', 'Không', '**Có**'],
        ],
        note: 'svn-be: Korea = `country=KR` (công ty không có quốc gia **không** khớp, tin ẩn danh không khớp); Global = `excludeCountry=KR` (công ty không có quốc gia **qua**, tin ẩn danh **qua**).',
      },
      {
        kind: 'table',
        heading: 'Giống và khác ba trang Jobs',
        cols: ['', 'Jobs (3 trang)', 'Korea / Global'],
        rows: [
          ['Màn hình, hai băng, banner cuối', 'Giống', 'Giống'],
          ['Trục nhóm của băng', 'Tỉnh / ngành nghề / ngành', '**Tỉnh/TP**'],
          ['Ô bắt buộc khi tìm', 'Có (khu vực / ngành nghề / ngành)', '**Không**'],
          ['Bộ lọc cố định theo đường dẫn', 'Không', '**Quốc gia công ty**'],
          ['Ai được lên băng', 'Bậc có tick vùng Mega menu page', 'Như bên trái — **cùng hai vùng placement**'],
          ['Vị trí trên menu', 'Con của *Việc làm*', '**Mục cấp 1** (Built-in `korea`, `global`)'],
        ],
      },
      {
        kind: 'example',
        heading: 'Công ty Hàn Quốc chưa khai quốc gia',
        scenario: 'Sales tạo công ty B (Hàn Quốc) nhưng bỏ trống *Country*. Khách phàn nàn: “tin của chúng tôi không có trong mục Hàn Quốc”.',
        cols: ['Bước', 'Kiểm / làm gì', 'Kết quả'],
        rows: [
          ['1', 'Mở `/viec-lam/nuoc-ngoai`', 'Tin của B đang ở **Global** — đúng quy tắc (trống = không phải KR)'],
          ['2', '*CRM → Customers → B → Edit → Country* = Hàn Quốc → lưu', '—'],
          ['3', 'Tải lại `/viec-lam/han-quoc`', 'Tin của B có mặt (nếu bậc của tin phủ vùng băng); rời Global'],
          ['4', 'Nếu vẫn không thấy trên băng', 'Kiểm tin có ẩn danh không, và product của tin có tick vùng *Mega menu page* không — xem *Jobs pages*'],
        ],
      },
      {
        kind: 'open',
        text:
          '**Tên mục menu.** Nhãn “Hàn Quốc” / “Toàn cầu” do svn-web giữ (từ điển `nav.builtin`), admin không sửa được; trong *Site navigation* hai dòng này có thể chỉ hiện key `korea` / `global` (bảng tên của admin chưa cập nhật). Chưa có tiêu đề / mô tả SEO riêng cho hai trang (chưa xác minh có cần không).',
      },
    ],
  },
}

export const CONTENT_MODULE_DOCS: Record<string, ModuleDoc> = {
  Content: {
    title: 'Logic chung — Content',
    lead:
      'Nội dung biên tập trên site công khai: bộ sưu tập tin, trang chiến dịch, menu, chân trang, văn bản pháp lý, thông báo và FAQ. **Banner và popup không còn ở đây** — chúng đã chuyển sang Service delivery → Boosting, vì chúng là thứ khách **mua**, không phải thứ mình **viết**.',
    headline: [
      '**Collection lưu ĐIỀU KIỆN, không lưu danh sách.** Tin mới khớp thì tự vào, tin hết hạn thì tự rơi ra — nên một mục menu có thể rỗng đi mà không ai đụng vào.',
      '**Sửa một collection là sửa mọi nơi đang dùng nó.** Menu, zone, trang chiến dịch — tất cả đổi theo.',
      '**Save không bao giờ publish** ở Collections, Zones, Notices — xuất bản là một nút riêng. Ở Site navigation, Footer, FAQ thì **mỗi lần lưu là sống luôn** (sau tối đa ~1 phút cache).',
    ],
    blocks: [
      {
        kind: 'table',
        heading: 'Các màn hình trong Content — và chúng nuôi phần nào của site',
        cols: ['Màn hình', 'Đường dẫn', 'Nuôi gì trên site', 'Quyền'],
        rows: [
          ['**Collections**', '/content/collections', '`/bo-suu-tap/<address>`; danh sách của zone; đích của mục menu', '`job_collection`'],
          ['**Zones**', '/content/zones', 'Trang Premium `/khu-tuyen-dung/<address>`', '`zone`'],
          ['**Site navigation**', '/content/navigation', 'Menu đầu trang jobseeker (4 vùng)', '`site_menu`'],
          ['**Site footer**', '/content/footer', 'Chân trang site jobseeker và site tuyển dụng', '`site_footer`'],
          ['**Policies**', '/content/policies', 'Điều khoản, chính sách bảo mật, đồng ý xử lý dữ liệu — có phiên bản (SRM-764)', '`terms_document`'],
          ['**Notices & events**', '/content/notices', '`/ho-tro/thong-bao`, `/ho-tro/su-kien`', '`site_notice`'],
          ['**FAQ**', '/content/faq', '`/ho-tro` (Help centre) và FAQ trang *company-join* của site tuyển dụng', '`site_faq`'],
          ['*Pages · Boards · Blog*', '/content/pages · boards · blog', '**Chưa làm** — ẩn khỏi sidebar bằng cờ', '—'],
        ],
        note: 'Mọi quyền trên được seed **chỉ cho HQ admin**. Vai trò khác phải được cấp ở *Organisation → Roles*. Xuất bản / gỡ / lưu trữ đều ăn theo quyền **Update** — không có cột quyền riêng.',
      },
      {
        kind: 'table',
        heading: 'Ba lớp, và lớp nào chứa nội dung thật',
        note: 'Chỉ lớp đầu chứa điều kiện chọn tin. Hai lớp sau chỉ **bố cục** và **trỏ tới**.',
        cols: ['Lớp', 'Là gì', 'Chứa gì'],
        rows: [
          ['**Collection**', 'Bộ tin / bộ công ty đã đặt tên, gọi theo address', '**Điều kiện lọc** hoặc **danh sách ghim** — đây là nơi nội dung thật sự được quyết định'],
          ['**Zone**', 'Trang chiến dịch có đường dẫn công khai riêng', 'Bố cục các khối, **hai danh sách trỏ vào hai collection**'],
          ['**Site navigation**', 'Menu đầu trang', 'Các mục, mỗi mục trỏ vào một collection, một zone, một trang site hoặc một link'],
        ],
      },
      {
        kind: 'warn',
        text:
          'Vì collection lưu **điều kiện** chứ không lưu danh sách, nó **rỗng đi được mà không ai đụng vào**: điều kiện quá hẹp, hoặc các tin khớp hết hạn cùng lúc. Một mục menu trỏ vào collection **Active nhưng rỗng vẫn hiện trên site** và dẫn người dùng tới trang trắng. Preview lúc tạo chỉ nói được hôm nay, không nói được tháng sau.',
      },
      {
        kind: 'table',
        heading: 'Ai chặn ai khi gỡ nội dung',
        cols: ['Hành động', 'Bị chặn khi', 'Không bị chặn, nhưng hệ quả là'],
        rows: [
          ['Archive một **collection**', 'Một **zone Published** còn dùng nó', 'Mục menu trỏ vào nó **biến khỏi menu** công khai'],
          ['Unpublish / Archive một **zone**', '—', 'Mục menu trỏ vào nó **biến khỏi menu** công khai'],
          ['Publish một **zone**', 'Thiếu banner, hoặc một trong hai collection không Active / sai loại', '—'],
          ['Đặt **danh mục FAQ** về Draft', '—', 'Mọi câu hỏi trong đó **biến khỏi site**, kể cả câu Published'],
        ],
      },
      {
        kind: 'table',
        heading: 'Hai quy tắc ngôn ngữ — đừng lẫn',
        cols: ['Quy tắc', 'Áp dụng cho', 'Thiếu một ngôn ngữ thì'],
        rows: [
          ['**VI bắt buộc, EN/KO rơi về VI**', 'Nhãn menu, chân trang, tiêu đề zone, danh mục FAQ, từ khoá gợi ý', 'Khách thấy chữ tiếng Việt'],
          ['**Cả ba tên bắt buộc**', 'Tên collection', 'Không lưu được'],
          ['**≥ 1 ngôn ngữ, mỗi ngôn ngữ đủ cặp; thiếu thì GIẤU**', 'Câu hỏi FAQ, thông báo / sự kiện', 'Khách đọc ngôn ngữ đó **không thấy** bản ghi'],
        ],
      },
      {
        kind: 'table',
        heading: 'Bao lâu thì site thấy thay đổi',
        cols: ['Nội dung', 'Độ trễ', 'Vì sao'],
        rows: [
          ['Collection (trang và danh sách trong zone)', '**Ngay**', 'svn-web đọc không cache (dữ liệu theo từng người dùng)'],
          ['Zone (phần khung: banner, khối, link)', '≤ ~1 phút', 'svn-be `max-age=60` + ETag'],
          ['Menu, chân trang', '≤ ~1 phút', 'svn-web cache 60 giây; không có nút xoá cache'],
          ['Danh sách thông báo, lưới sự kiện, FAQ', '≤ ~1 phút', 'svn-web cache 60 giây; trang chi tiết thì không cache'],
        ],
      },
      {
        kind: 'table',
        heading: 'Vòng đời — mỗi màn hình một bộ trạng thái',
        cols: ['Màn hình', 'Trạng thái', 'Quay lại được?'],
        rows: [
          ['**Collections**', 'Draft → Active → Archived', '**Không** — một chiều; Archived không Restore'],
          ['**Zones**', 'Draft ⇄ Published → Archived → (Restore) Draft', 'Có, nhưng Archived phải qua Draft'],
          ['**Notices & events**', 'Draft ⇄ Published ⇄ Archived', 'Có — Publish đưa Archived trở lại nguyên vẹn'],
          ['**FAQ**', 'Draft · Review · Published · Archived', 'Có — chuyển tự do qua kebab'],
          ['**Menu / Footer**', 'Không có trạng thái — chỉ cờ *Visible*', '—'],
        ],
      },
      {
        kind: 'list',
        heading: 'Address là hợp đồng với site công khai',
        items: [
          'Address của collection và zone là thứ **site công khai gọi** — đổi address là **gãy mọi link đã phát ra ngoài**. Collection khoá address khi publish; zone khoá **ngay khi tạo**.',
          'Address đã dùng (kể cả của bản Archived) **bị giữ chỗ** — trùng vào thì lưu hỏng. Chỉ xoá bản Draft mới giải phóng nó.',
          'Zone trông rỗng thường **không phải lỗi của zone**: kiểm các collection bên trong nó trước.',
        ],
      },
      {
        kind: 'list',
        heading: 'Phần chưa chạy trên nền mới',
        items: [
          '**Pages · Boards · Blog** chưa có backend thật (D-CONT-1) — chúng bị tắt bằng cờ tính năng nên không có trong sidebar; gõ thẳng URL chỉ ra “Not available yet”. Thấy chúng trống thì đó là **chưa làm xong**, không phải hỏng.',
          'Văn bản pháp lý đã có chỗ ở **Policies**; bảng thông báo đã có chỗ ở **Notices & events** — hai nhu cầu cũ của Pages / Boards.',
        ],
      },
    ],
  },

  'Mega menu pages': {
    title: 'Logic chung — Mega menu pages',
    lead:
      'Các trang của **site jobseeker** mà khách vào từ mega menu. Không trang nào có màn hình admin riêng: admin **chỉ cấp dữ liệu** — menu, collection, zone, sản phẩm tin đăng, vùng placement, quốc gia của công ty — và site tự lắp trang từ đó.',
    headline: [
      '**Trang Premium lấy tin từ Collection; các bảng tin Jobs / Korea / Global lấy tin từ TÌM KIẾM + bậc tin.** Hai cơ chế khác hẳn nhau — sửa collection không đổi gì trên `/viec-lam/...`, và tick vùng placement không đổi gì trên trang Premium.',
      '**Một tin lên băng của bảng tin khi product cao nhất của nó tick vùng *Mega menu page*.** Vùng chưa ai tick thì băng rỗng và ẩn hẳn.',
      '**Korea = công ty có Country Hàn Quốc; Global = mọi thứ còn lại**, kể cả công ty Việt Nam, công ty để trống quốc gia và mọi tin ẩn danh.',
    ],
    blocks: [
      {
        kind: 'table',
        heading: 'Trang nào trên site — màn hình admin nào nuôi nó',
        cols: ['Trang trên site', 'Đường dẫn VI', 'Nuôi bởi'],
        rows: [
          ['**Mega menu** (đầu trang)', '— (mọi trang)', '*Content → Site navigation* — ẩn/sắp/badge mục Built-in; thêm mục trỏ collection / zone / link'],
          ['**Premium pages** (zone)', '`/khu-tuyen-dung/<address>`', '*Content → Zones* (khung trang) + *Content → Collections* (hai danh sách tin)'],
          ['**Theo khu vực / ngành nghề / ngành**', '`/viec-lam/dia-diem` · `/viec-lam/nganh-nghe` · `/viec-lam/nganh`', '*Products → Placement slots* (bậc nào lên băng) · *Placements → Items shown* (số thẻ) · *Posting ladder* (thứ tự bậc) · *Recruitment → Jobs* và *CRM* (tin, công ty) · *Master data* (*Locations*, *Job taxonomy*, *Industries*)'],
          ['**Hàn Quốc / Toàn cầu**', '`/viec-lam/han-quoc` · `/viec-lam/nuoc-ngoai`', 'Như ba trang trên + *CRM → Customers → Country*'],
          ['**Collection đứng riêng**', '`/bo-suu-tap/<address>`', '*Content → Collections*'],
        ],
        note: 'Tiếng Anh và tiếng Hàn dùng chung đường dẫn tiếng Anh (`/jobs/roles`, `/jobs/korea`, `/zones/<address>` — riêng zone tiếng Hàn là `/채용관/<address>`); ngôn ngữ đọc từ cookie.',
      },
      {
        kind: 'table',
        heading: 'Hai cách một trang chọn tin',
        cols: ['', 'Premium page (zone)', 'Bảng tin Jobs / Korea / Global'],
        rows: [
          ['Tin đến từ đâu', 'Hai **collection** (Saved search + Hand-picked)', '**Tìm kiếm công khai** + bộ lọc của trang'],
          ['Ai quyết định tin nào lên', 'Người dựng collection', '**Bậc tin đã bán**: product tick vùng *Mega menu page - Job list trending / announcement*'],
          ['Thứ tự', 'Order của collection / thứ tự ghim', 'Nhóm đông tin nhất → bậc → trải đều công ty → auto-refresh'],
          ['Khách lọc được', 'Chỉ thu hẹp trong collection', 'Toàn bộ bộ lọc của `/search`'],
          ['Độ trễ', 'Ngay (collection), ~1 phút (khung zone)', 'Ngay (không cache)'],
        ],
      },
      {
        kind: 'list',
        heading: 'Điều kiện chung để một tin hiện ở BẤT KỲ trang nào',
        items: [
          'Tin **Open**, **exposure bật**, còn trong cửa sổ đăng (*Recruitment → Jobs*).',
          'Công ty **Active** và **có MST** (*CRM*). Công ty chưa có MST thì không tin nào của họ lên site.',
          'Tin ẩn danh không khớp bất kỳ bộ lọc **công ty** nào (tag, quốc gia, quy mô, ngành) — nhưng vẫn qua được bộ lọc **loại trừ** (Global).',
        ],
      },
      {
        kind: 'open',
        text:
          'Kiểm ở svn-web d8a43a11 · svn-be ee1db5ea9. **Còn mở:** banner quảng cáo cuối các bảng tin là ảnh mẫu trong code (chưa nối Boosting); các bảng tin chưa có tiêu đề / mô tả SEO riêng; bảng tên mục Built-in trong admin chưa có `korea`, `global`, `jobs.byIndustry`, `jobs.topCompanies`.',
      },
    ],
  },
}
