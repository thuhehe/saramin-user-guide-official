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

  /* Notices & events — ONE page from the Admin screen (Content → Notices & events) to
     the jobseeker pages it feeds (/help/notices, /help/events). Merged 21/10/2026 with the
     former `help-notices` entry; /trang/help-notices redirects here. */
  'site-notices': {
    logic: [
      '**Một nội dung, hai nơi.** Đăng ở Admin — *Content → Notices & events*; hiện ở tab **Notices & events** của trung tâm hỗ trợ trên site ứng viên. **Notice** → một dòng trên **bảng thông báo** (`/help/notices`), **Event** → một thẻ trên **lưới sự kiện** (`/help/events`). Một bản ghi là một trong hai, không bao giờ cả hai.',
      '**Đối tượng.** *Shown to* ở Admin = tab *Tất cả · Cá nhân · Doanh nghiệp* của bảng. *Everyone* hiện ở **cả hai** tab Cá nhân và Doanh nghiệp, không phải tab thứ ba.',
      'Viết bằng **ít nhất một** ngôn ngữ; mỗi ngôn ngữ cần **cả tiêu đề lẫn nội dung**. Ngôn ngữ nào không viết thì **khách đọc site bằng ngôn ngữ đó không thấy bản ghi** (không rơi về VI).',
      '**Bài ghim** đứng đầu **trang 1**, và cột danh mục của nó ghi **Thông báo** in đậm thay cho danh mục thật.',
      '**Sự kiện hết hạn tự biến mất khỏi lưới** — không có nhãn *Đang diễn ra / Đã kết thúc*. Đường link chi tiết của nó vẫn mở được.',
      'Quyền `site_notice` (read · create · update · delete), **mặc định chỉ HQ admin** (seed V533). **Publish, Unpublish, Archive, Pin đều là quyền Update** — và **tạo thẳng ở trạng thái Published cũng cần Update** (không chỉ Create).',
    ],
    how: [
      '**Admin:** *Content → Notices & events* → **New record** → chọn **Notice** (kèm danh mục) hoặc **Event** (kèm ảnh thẻ và ngày chạy) → **Shown to** → tiêu đề + nội dung ở VI (rồi EN, KO).',
      'Bấm **Save** — bài **chưa** lên site.',
      'Ở thẻ **Publication** bên phải, bấm **Publish** → xác nhận.',
      '**Đợi khoảng 1 phút**, mở `dev-saramin.saramin.vn/help/notices` (Notice) hoặc `/help/events` (Event), đúng tab đối tượng.',
      'Không thấy? Bảng kiểm ở **§9**. Chi tiết từng thao tác ở Phần 1, khách thấy gì ở Phần 2.',
    ],
    watch: [
      '**Save không bao giờ publish.** Sau khi tạo, trạng thái và ngày đăng **chỉ đổi bằng thẻ Publication** — hai ô đó bị khoá trong form sửa.',
      '**Type không đổi được sau khi tạo** (đổi qua lại làm mất danh mục hoặc ảnh + ngày). Gõ nhầm loại → tạo bản ghi mới.',
      '**Ngày đăng ở tương lai = hẹn giờ.** Bản ghi Published với ngày tương lai **không hiện** cho tới đúng thời điểm đó; Publish không kéo nó về hôm nay.',
      '**Unpublish rồi Publish lại giữ nguyên ngày đăng gốc** — bài không nhảy lên đầu bảng.',
      'Bài **ghim chỉ đứng đầu trang 1**, vẫn phải qua bộ lọc của khách (tab đối tượng, danh mục, từ khoá) và vẫn tính vào tổng số.',
      '**Delete là vĩnh viễn và mất luôn lượt xem.** Muốn cho nghỉ thì **Archive** (giữ ngày đăng và lượt xem, Publish lại được).',
      '**Đổi danh mục chưa lọc ngay** — phải bấm **Tìm**.',
      '**Từ khoá chỉ tìm trong tiêu đề**, và không nhận các ký tự `! # @ % ^ & * $ ) [ ] : ; ’ " . , /` (hiện dòng báo ngay dưới ô). Dấu `(` thì được.',
      '**Bấm Danh sách ở trang chi tiết là về bảng từ đầu** — bộ lọc, từ khoá và số trang đang chọn bị mất.',
      '**Bài hẹn giờ không hiện tới đúng giờ.** Operator đặt ngày đăng ở tương lai thì bài nằm ẩn tới thời điểm đó. Sự kiện thì khác: **ngày bắt đầu ở tương lai vẫn hiện thẻ**, chỉ ngày kết thúc mới quyết định ẩn.',
      '**Mỗi lần mở trang chi tiết cộng 1 lượt xem**, kể cả khi chính Operator mở để kiểm tra.',
    ],
    blocks: [
      {
        kind: 'table',
        heading: 'Một nội dung, hai nơi',
        cols: ['', 'Ở đâu', 'Ai dùng'],
        rows: [
          ['**Đăng**', 'Admin — *Content → Notices & events* (`dev-admin.saramin.vn/content/notices`)', 'Operator HQ (quyền *Notices & events*)'],
          ['**Hiện — Notice**', 'Site ứng viên — tab **Notices & events** → **bảng thông báo**: `dev-saramin.saramin.vn/help/notices` (VI `/ho-tro/thong-bao`); chi tiết `/ho-tro/thong-bao/<id>`', 'Khách, không cần đăng nhập'],
          ['**Hiện — Event**', 'Cùng tab → **lưới sự kiện**: `/help/events` (VI `/ho-tro/su-kien`)', 'Khách, không cần đăng nhập'],
        ],
      },
      { kind: 'h', text: 'Phần 1 · Trên Admin — từng bước' },
      {
        kind: 'p',
        text:
          'Phần này dành cho người **đăng bài lên trang *Notices & events*** của trung tâm hỗ trợ (`/ho-tro/thong-bao`, `/ho-tro/su-kien`) trên site ứng viên. Mọi bài đều đăng ở *Content → Notices & events*. Cần quyền **Notices & events** (`site_notice`): *Create* để tạo, **Update** để sửa **và cũng để Publish, Unpublish, Archive, ghim**; *Delete* để xoá. Mặc định chỉ HQ admin có.',
      },
      {
        kind: 'table',
        heading: 'Cái gì trên Admin thành cái gì trên site',
        cols: ['Trên Admin', 'Trên site — Notices & events'],
        rows: [
          ['**Type = Notice**', 'Một dòng trên **bảng thông báo** (`/ho-tro/thong-bao`)'],
          ['**Type = Event**', 'Một thẻ có ảnh trên **lưới sự kiện** (`/ho-tro/su-kien`)'],
          ['**Shown to** — *Jobseekers* / *Employers* / *Everyone*', 'Tab đối tượng của bảng. *Everyone* hiện ở **cả hai** tab, không phải tab thứ ba'],
          ['**Filed under** (*Guide · Launch · Other · Update · How to · Promotion*)', 'Cột danh mục đầu bảng và bộ lọc danh mục (*Hướng dẫn · Ra mắt · Khác · Cập nhật · Cách sử dụng · Khuyến mãi*)'],
          ['**Pin to the top**', 'Đứng đầu **trang 1** của bảng'],
          ['**Publication date**', 'Ngày đăng in trên dòng — và lúc bài bắt đầu hiện'],
          ['**Views**', 'Mỗi lần khách mở trang chi tiết cộng 1'],
        ],
      },
      {
        kind: 'shot',
        src: '/shots/help-admin/ntc-01-list.jpg',
        where: 'Admin',
        caption: 'Danh sách — xếp **đúng như bảng trên site**: bài ghim trước, rồi mới nhất. **Filter** lọc theo *Type · Status · Audience · Category*; ô *Search by title* tìm theo tiêu đề (nhấn Enter). Bấm một dòng để mở.',
      },
      { kind: 'h', text: '§1 · Đăng một thông báo (Notice)' },
      {
        kind: 'list',
        items: [
          '**Bước 1.** Vào *Content → Notices & events* → bấm **New record** (góc phải). Trang **New record** mở ra.',
          '**Bước 2.** **Type** — để **Notice**. Chọn kỹ: **loại không đổi được sau khi lưu**.',
          '**Bước 3.** **Filed under** — chọn danh mục (bắt buộc với Notice).',
          '**Bước 4.** **Shown to** — *Everyone* (mặc định), *Jobseekers* hoặc *Employers*.',
          '**Bước 5.** **Pin to the top** — bật nếu muốn bài đứng đầu bảng (xem §4).',
          '**Bước 6.** **Title** — tiêu đề ở tab **VI** (tối đa 300 ký tự). **Body** — nội dung trong khung soạn thảo (heading, in đậm, danh sách, link, bảng, chèn ảnh). Bấm **EN**, **KO** và viết tiếp cho từng ngôn ngữ muốn có.',
          '**Bước 7.** Phần **Publication**: để **Status = Draft**, **Publication date** trống. Bấm **Save** (góc trên phải). Toast *Draft created*, trang chuyển sang **Edit record**.',
          '**Bước 8.** Ở thẻ **Publication** bên phải, bấm **Publish** → xác nhận *Publish this record?* → **Publish**. Toast *Record is now live on the help centre board*; thẻ đổi thành *Live — visitors can read this on the help centre board now.*',
        ],
      },
      {
        kind: 'shot',
        src: '/shots/help-admin/ntc-02-new-notice.jpg',
        where: 'Admin',
        caption: '**New record**, loại *Notice*: *What this is* (loại, danh mục, đối tượng, ghim) rồi *Title and body*. Thẻ **Publication** bên phải còn trống — **chưa lưu thì chưa có nút Publish**.',
      },
      {
        kind: 'shot',
        src: '/shots/help-admin/ntc-04-publication.jpg',
        where: 'Admin',
        caption: 'Cuối form: tiêu đề và nội dung theo tab VI · EN · KO, rồi khối **Publication** — *Status* và *Publication date*. Dòng nhắc: **Save không bao giờ publish**.',
      },
      {
        kind: 'warn',
        text:
          '**Save không bao giờ đăng bài.** Chỉ nút **Publish** ở thẻ *Publication* mới đưa bài lên site (nó tự lưu form trước). Cách tắt: lúc tạo chọn luôn **Status = Published** rồi Save — bài lên ngay với ngày hôm nay (cần quyền *Update*), dù toast vẫn ghi *Draft created*. Sau lần lưu đầu, *Status* và *Publication date* **bị khoá trong form** — chỉ đổi bằng thẻ Publication.',
      },
      {
        kind: 'warn',
        text:
          '**Ngôn ngữ nào không viết thì khách đọc site bằng ngôn ngữ đó KHÔNG thấy bài.** Mỗi ngôn ngữ đã gõ phải đủ **cả tiêu đề lẫn nội dung** — thiếu một nửa thì Save báo *One language is only half written* và tự mở tab đó. Cột *Title* của danh sách in các ngôn ngữ bài đã có (*VI · EN · KO*).',
      },
      { kind: 'h', text: '§2 · Đăng một sự kiện (Event)' },
      {
        kind: 'list',
        items: [
          '**Bước 1.** **New record** → **Type = Event**. Ô *Filed under* biến mất (sự kiện không có danh mục); khối **Event card** hiện ra.',
          '**Bước 2.** **Shown to** và **Pin to the top** — như Notice.',
          '**Bước 3.** **Card artwork** (bắt buộc) — kéo ảnh vào ô hoặc bấm để chọn file. Ảnh **rộng từ 616×318** trở lên, tối đa **20 MB**. Hộp **Crop image** mở ra, khung cắt **khoá đúng tỉ lệ thẻ** — kéo chọn phần muốn hiện → **Save**. Ảnh chỉ thật sự tải lên khi lưu bài.',
          '**Bước 4.** **Runs from / Runs until** — chọn theo bảng dưới. Dòng chữ dưới hai ô đổi theo, nói rõ sự kiện sẽ chạy kiểu gì.',
          '**Bước 5.** **Title** + **Body** theo từng ngôn ngữ, như Notice.',
          '**Bước 6.** **Save**, rồi **Publish** ở thẻ *Publication* — như §1, bước 7–8.',
        ],
      },
      {
        kind: 'shot',
        src: '/shots/help-admin/ntc-03-new-event.jpg',
        where: 'Admin',
        caption: 'Loại *Event*: khối **Event card** — ô ảnh thẻ (*Upload at 616×318 or wider*) và hai ô ngày **Runs from / Runs until**.',
      },
      {
        kind: 'table',
        heading: 'Chọn ngày cho sự kiện',
        cols: ['Runs from', 'Runs until', 'Trên lưới sự kiện'],
        rows: [
          ['trống', 'trống', '**Always on** — ở trên lưới tới khi bạn Unpublish'],
          ['có', 'trống', 'Chạy từ ngày bắt đầu, **không có ngày kết thúc**'],
          ['có', 'có', '**Đợt cố định** — tự rời lưới **ngày sau** ngày kết thúc. Cùng một ngày = sự kiện một ngày'],
          ['trống', 'có', '**Không lưu được** — *This event ends but never starts*'],
        ],
        note: 'Hết đợt, sự kiện tự rời lưới nhưng **trang chi tiết vẫn mở được** và bài vẫn *Published* ở Admin — Archive nếu muốn dọn hẳn.',
      },
      { kind: 'h', text: '§3 · Hẹn giờ đăng' },
      {
        kind: 'list',
        items: [
          '**Bước 1.** Lúc tạo bài, ở khối **Publication** đặt **Publication date** ở **tương lai** (ngày + giờ).',
          '**Bước 2.** Chọn **Status**: *Published* để hẹn luôn — hoặc *Draft* nếu còn chờ duyệt, rồi bấm **Publish** khi sẵn sàng (Publish **giữ nguyên** ngày hẹn).',
          '**Bước 3.** **Save**. Bài *Published* với ngày tương lai **chưa hiện** — nó lên site đúng giờ đã đặt (cộng tối đa ~1 phút bộ nhớ đệm).',
        ],
      },
      {
        kind: 'p',
        text:
          '**Phải đặt ngày ngay lúc tạo.** Sau lần lưu đầu, ô *Publication date* bị khoá (*Set when first published*); bài nháp **không có ngày** thì Publish đóng dấu **ngay lúc bấm**. Lỡ lưu nháp mà chưa đặt ngày thì tạo một bản ghi mới có ngày hẹn và xoá bản nháp. Ví dụ đầy đủ: bảng *Hẹn giờ thông báo bảo trì* ở Phần 2.',
      },
      { kind: 'h', text: '§4 · Ghim lên đầu bảng' },
      {
        kind: 'list',
        items: [
          '**Cách 1 — từ danh sách:** ⋮ cuối dòng → **Pin to the top** → xác nhận **Pin**. Bỏ ghim: ⋮ → **Remove from the top** → **Remove** (bài về đúng chỗ theo ngày).',
          '**Cách 2 — trong form:** bật / tắt **Pin to the top** → **Save**.',
          'Bài ghim chỉ đứng đầu **trang 1**, và vẫn phải khớp tab / danh mục / từ khoá khách đang lọc. Ghim nhiều bài thì chúng xếp với nhau theo ngày đăng.',
        ],
      },
      { kind: 'h', text: '§5 · Sửa, gỡ, cất, xoá' },
      {
        kind: 'list',
        items: [
          '**Sửa nội dung:** bấm vào dòng → trang **Edit record** → sửa → **Save** (toast *Record saved*). Bài đang *Published* hiện bản mới luôn.',
          '**Đổi trạng thái:** thẻ **Publication** bên phải trang sửa, hoặc ⋮ trên danh sách. Mỗi nút hỏi xác nhận.',
        ],
      },
      {
        kind: 'shot',
        src: '/shots/help-admin/ntc-05-edit-publication.jpg',
        where: 'Admin',
        caption: '**Edit record** của một bài đang chạy: *Type* đã khoá (*Can’t be changed after creation*); thẻ **Publication** ghi *Live…* và có **Unpublish · Archive · Delete**. Bài nháp thì thẻ có **Publish · Archive · Delete**.',
      },
      {
        kind: 'table',
        heading: 'Nút trên thẻ Publication (và ⋮ trên danh sách)',
        cols: ['Nút', 'Có khi', 'Kết quả'],
        rows: [
          ['**Publish**', 'Bài chưa *Published*', 'Lên bảng / lưới ngay. Lần đầu publish thì đóng dấu ngày đăng hôm nay; publish lại bài đã có ngày thì **giữ ngày gốc** (không nhảy lên đầu)'],
          ['**Unpublish**', 'Bài *Published*', 'Gỡ khỏi site, về **Draft**'],
          ['**Archive**', 'Bài chưa *Archived*', 'Gỡ khỏi site, **giữ ngày đăng và lượt xem**; Publish lại được nguyên vẹn'],
          ['**Delete**', 'Luôn có (chữ đỏ, cần quyền *Delete*)', '**Xoá vĩnh viễn** cả bài, bản dịch và lượt xem — muốn cho nghỉ thì **Archive**'],
          ['**Pin to the top / Remove from the top**', 'Chỉ trên ⋮ của danh sách', 'Xem §4'],
        ],
      },
      {
        kind: 'p',
        text:
          '**Gõ nhầm loại (Notice ↔ Event)?** Không đổi được — tạo bản ghi mới đúng loại, rồi xoá hoặc Archive bản cũ.',
      },
      { kind: 'h', text: 'Phần 2 · Trên site ứng viên — khách thấy gì' },
      { kind: 'h', text: '§6 · Bảng thông báo', path: '/ho-tro/thong-bao' },
      {
        kind: 'shot',
        src: '/shots/help/help-09-notices.jpg',
        where: 'Jobseeker site',
        caption: 'Ba tab đối tượng, thanh lọc (*Tổng N kết quả* · danh mục · từ khoá · **Tìm** · xoá lọc), rồi bảng ba cột: **danh mục · tiêu đề · ngày đăng**. Bốn dòng đầu in đậm *Thông báo* là bài ghim.',
      },
      {
        kind: 'table',
        heading: 'Bảng thông báo — từng phần',
        cols: ['Phần', 'Nghĩa'],
        rows: [
          ['**Tất cả · Cá nhân · Doanh nghiệp**', 'Lọc theo đối tượng (`?audience=all | person | company`). Bài *Everyone* có mặt ở cả ba tab.'],
          ['**Ô danh mục**', '*Tất cả · Hướng dẫn · Ra mắt · Khác · Cập nhật · Cách sử dụng · Khuyến mãi*.'],
          ['**Ô từ khoá**', '*Nhập từ khoá không chứa ký tự đặc biệt.* — chỉ khớp tiêu đề.'],
          ['**Bảng**', 'Không có hàng tiêu đề cột. Ngày theo dạng **YYYY.MM.DD**. Bài ghim lên đầu trang 1 và vẫn tính vào tổng. Không có kết quả: *Không có kết quả nào.*'],
          ['**Phân trang**', '20 bài/trang.'],
        ],
      },
      { kind: 'h', text: '§7 · Trang chi tiết', path: '/ho-tro/thong-bao/<id>' },
      {
        kind: 'shot',
        src: '/shots/help/help-11-notice-detail.jpg',
        where: 'Jobseeker site',
        caption: 'Tiêu đề, *Ngày đăng · Lượt xem*, nội dung, nút **Danh sách**, và hai thẻ bài trước / bài sau.',
        note: 'Không có ngày *Cập nhật* (khác trang câu hỏi FAQ). Bài trước / sau là bài **cùng loại**, xếp theo ngày đăng. Sự kiện dùng chung trang này; **Danh sách** từ một sự kiện thì về lưới sự kiện.',
      },
      { kind: 'h', text: '§8 · Lưới sự kiện', path: '/ho-tro/su-kien' },
      {
        kind: 'shot',
        src: '/shots/help/help-10-events.jpg',
        where: 'Jobseeker site',
        caption: 'Mỗi sự kiện một thẻ, 3 thẻ/hàng trên máy tính: ảnh, tiêu đề, thời gian chạy, *Đối tượng*. Không có bộ lọc, tìm kiếm hay phân trang.',
        note: '**Ảnh thẻ đang trống trên dev (21/10)** — các bản ghi mẫu chưa có ảnh tải lên. Ở admin, ảnh thẻ là bắt buộc với Event (tối thiểu 616×318).',
      },
      {
        kind: 'table',
        heading: 'Dòng thời gian trên thẻ sự kiện',
        cols: ['Dữ liệu ở admin', 'Thẻ ghi'],
        rows: [
          ['Có ngày bắt đầu và kết thúc', '`2026-10-01 ~ 2026-11-30`'],
          ['Có ngày bắt đầu, không có ngày kết thúc', '*Từ 2026-09-15*'],
          ['Không có ngày nào', '*Thường xuyên*'],
          ['Ngày kết thúc đã qua', 'Thẻ **biến mất** khỏi lưới (link chi tiết vẫn mở được)'],
        ],
        note: 'Dòng *Đối tượng*: *Tất cả thành viên · Thành viên cá nhân · Thành viên doanh nghiệp*.',
      },
      { kind: 'h', text: '§9 · Kiểm trên site — và khi không thấy' },
      {
        kind: 'p',
        text:
          'Mở `https://dev-saramin.saramin.vn/ho-tro/thong-bao` (Notice) hoặc `/ho-tro/su-kien` (Event) — không cần đăng nhập. Danh sách và lưới được giữ trong bộ nhớ đệm **60 giây**, nên bài mới hiện sau khoảng **1 phút**; trang chi tiết thì hiện ngay.',
      },
      {
        kind: 'table',
        heading: 'Đã đăng mà không thấy trên site — kiểm theo thứ tự',
        cols: ['#', 'Kiểm', 'Ở đâu'],
        rows: [
          ['1', 'Bài có **Published** chưa? (Save không đăng)', 'Cột *Status* · thẻ *Publication* ghi *Live…*'],
          ['2', '**Publication date** có ở tương lai không?', 'Cột *Published* của danh sách'],
          ['3', 'Bài có viết **bằng ngôn ngữ đang đọc** không?', 'Dòng *VI · EN · KO* dưới tiêu đề'],
          ['4', 'Đang xem đúng **tab đối tượng** chưa?', '*Shown to* — *Jobseekers* chỉ ở tab ứng viên, *Employers* chỉ ở tab doanh nghiệp'],
          ['5', '(Event) Đợt chạy đã **hết** chưa?', '*Runs until* — rời lưới ngày sau ngày kết thúc'],
          ['6', 'Đang lọc **danh mục / từ khoá** trên site không?', 'Từ khoá chỉ tìm trong **tiêu đề**, bằng ngôn ngữ đang đọc'],
          ['7', 'Đã quá **1 phút** chưa?', 'Tải lại trang'],
        ],
      },
      { kind: 'h', text: 'Phần 3 · Tra cứu' },
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
          '**Tài liệu admin chưa cập nhật:** `docs/features/notices.md` (admin 45954108) vẫn ghi “svn-be in flight” — thực tế `AdminSiteNoticeController` đã có trên svn-be ee1db5ea9 (V533). Màn hình đã mở và chụp trên dev-admin.saramin.vn ngày 21/10/2026 (admin 322830e3) — mở form, **không lưu** bản ghi nào; các bước Phần 1 khớp với màn hình.',
      },
      {
        kind: 'list',
        heading: 'Chưa làm — theo quyết định, không phải lỗi',
        items: [
          'Tệp đính kèm trong thông báo.',
          'Nhãn *Mới* cho bài vừa đăng.',
          'Tab *Đang diễn ra / Đã kết thúc / Người thắng*, nút tham gia sự kiện.',
        ],
      },
      {
        kind: 'warn',
        text: '**Nguồn và độ mới.** Viết theo build, kiểm ngày **21/10/2026** với svn-web `178a3709` · svn-be `7cb93f053` · admin `ce90a489` (nhánh `origin/dev`). Ảnh chụp cùng ngày trên `dev-saramin.saramin.vn`, chưa đăng nhập, tiếng Việt.',
      },
    ],
  },

  /* FAQ — Company information. ONE page from the Admin screen (Content → FAQ, tab Company
     information) to the Employer site page it feeds (/company-join, section "Company
     information FAQ"). Screens 22/10/2026: dev-admin (forms opened, nothing saved) and
     dev-hiring signed in as a company user (page viewed, nothing changed). Code: svn-web
     74511ba38 features/hiring/company/, saramin-vn-admin 322830e3 src/modules/system/faq/.
     The Help centre tab of the same screen lives on 'help-center'. */
  faq: {
    logic: [
      '**Một nội dung, hai nơi.** Nhập ở Admin — *Content → FAQ*, tab **Company information**; hiện ở trang **Company information** của **site nhà tuyển dụng** (`dev-hiring.saramin.vn/company-join`, VI `/thong-tin-doanh-nghiep`), trong mục **Company information FAQ** (*Câu hỏi thường gặp về thông tin doanh nghiệp*) ở **cuối trang**, dưới hồ sơ pháp lý và giấy tờ đăng ký.',
      '**Một danh sách chung cho mọi công ty.** Không có danh mục, không theo công ty, không theo gói: mọi nhà tuyển dụng mở trang này đều thấy cùng một danh sách (theo ngôn ngữ họ đang đọc), **đúng thứ tự trong bảng Admin**.',
      '**Tab *Help centre* của cùng màn này là chuyện khác** — nó nuôi trang *How can we help?* của site ứng viên. Xem trang **How can we help?** của guide này.',
      '**Ngôn ngữ:** một câu hỏi viết bằng **ít nhất một** trong VI / EN / KO, mỗi ngôn ngữ đủ **cả câu hỏi lẫn câu trả lời**; ngôn ngữ thiếu thì câu đó **bị giấu** với nhà tuyển dụng đọc ngôn ngữ ấy (không rơi về VI).',
      'Trang Company information **cần đăng nhập** bằng tài khoản nhà tuyển dụng; mọi thành viên đang gắn với công ty đều xem được, không cần quyền riêng. Riêng phần FAQ là dữ liệu công khai — nó không phụ thuộc hồ sơ công ty.',
      'Quyền ở Admin: **FAQ** (`site_faq` — read · create · update · delete), **mặc định chỉ HQ admin**. Cùng quyền với tab Help centre. Màn hình nằm ở *System → FAQ* (`/system/faq`) tới 21/09; đường cũ vẫn chuyển sang `/content/faq`.',
    ],
    how: [
      '**Admin:** *Content → FAQ* → tab **Company information** → **New entry**.',
      'Viết **Question** + **Answer** ở VI (rồi EN, KO) → **Status = Published** → **Save**.',
      'Kéo câu hỏi tới đúng chỗ trong bảng — **thứ tự bảng là thứ tự trên trang**.',
      '**Đợi khoảng 1 phút**, đăng nhập `dev-hiring.saramin.vn` bằng tài khoản nhà tuyển dụng → menu tài khoản (góc phải) → **Company information** → cuộn xuống cuối trang.',
      'Không thấy? Bảng kiểm ở **§5**. Chi tiết từng thao tác ở Phần 1, nhà tuyển dụng thấy gì ở Phần 2.',
    ],
    watch: [
      '**Không câu nào *Published* bằng ngôn ngữ đang đọc thì cả mục FAQ biến mất** — kể cả tiêu đề *Company information FAQ*. Đó là chủ đích (một tiêu đề trên khoảng trống trông như trang hỏng), không phải lỗi.',
      '**Câu trả lời là chữ thường**: không in đậm, không link, không ảnh, tối đa **2.000** ký tự. Ô ở Admin ghi *Line breaks are kept*, nhưng trang nhà tuyển dụng **có thể gộp các dòng thành một đoạn** (xem §4) — viết mỗi câu trả lời thành một đoạn cho chắc.',
      '**Server lỗi thì trang hiện 6 câu mẫu cài sẵn trong code** — trông y như thật (bản gốc của 6 câu đang có ở Admin). Thấy trên trang một câu đã chuyển sang Draft ở Admin, hoặc đủ 6 câu khi Admin chỉ có 4 câu Published, thì báo dev kiểm tra kết nối — đừng đi sửa nội dung.',
      '**Kéo thả bị tắt khi đang lọc trạng thái** — bấm **All** để sắp lại.',
      'Dòng cảnh báo đầu bảng *“{n} of {total} published entries are missing a language…”* — những câu đó vô hình với nhà tuyển dụng đọc ngôn ngữ thiếu.',
      'Site giữ danh sách trong bộ nhớ đệm **60 giây** — sửa xong đợi khoảng một phút.',
    ],
    blocks: [
      {
        kind: 'table',
        heading: 'Một nội dung, hai nơi',
        cols: ['', 'Ở đâu', 'Ai dùng'],
        rows: [
          ['**Nhập**', 'Admin — *Content → FAQ* → tab **Company information** (`dev-admin.saramin.vn/content/faq`)', 'Operator HQ (quyền *FAQ*)'],
          ['**Hiện**', 'Site nhà tuyển dụng — trang **Company information** (`dev-hiring.saramin.vn/company-join`, VI `/thong-tin-doanh-nghiep`), mục **Company information FAQ** cuối trang', 'Nhà tuyển dụng đã đăng nhập — mọi thành viên của công ty'],
        ],
      },

      { kind: 'h', text: 'Phần 1 · Trên Admin — từng bước' },
      {
        kind: 'table',
        heading: 'Cái gì trên Admin thành cái gì trên trang nhà tuyển dụng',
        cols: ['Trên Admin (Content → FAQ → Company information)', 'Trên trang Company information'],
        rows: [
          ['Một dòng trong bảng, trạng thái **Published**', 'Một ô có chữ **Q** đỏ trong mục *Company information FAQ*'],
          ['Thứ tự trong bảng (tay nắm ⠿ / ▲▼)', 'Thứ tự các ô, từ trên xuống'],
          ['**Question**', 'Dòng in đậm của ô — luôn hiện'],
          ['**Answer**', 'Phần chữ mở ra khi bấm vào ô'],
          ['Chip **VI · EN · KO** của dòng', 'Ngôn ngữ nào nhà tuyển dụng thấy được câu này (chip mờ = không thấy)'],
          ['*Draft · Review · Archived*', '**Không hiện**'],
        ],
      },
      {
        kind: 'shot',
        src: '/shots/help-admin/faq-01-company.jpg',
        where: 'Admin',
        caption: '*Content → FAQ* → tab **Company information**: 6 câu, 4 *Published* và 2 *Draft* (22/10). Không có danh mục hay cột trái — chỉ một bảng phẳng, kéo tay nắm ⠿ hoặc ▲▼ để sắp.',
      },

      { kind: 'h', text: '§1 · Thêm một câu hỏi' },
      {
        kind: 'list',
        items: [
          '**Bước 1.** Vào *Content → FAQ* → tab **Company information** (tab mở sẵn khi vào màn).',
          '**Bước 2.** Bấm **New entry**. Ngăn kéo **New FAQ entry** mở ra bên phải.',
          '**Bước 3.** **Question** — gõ câu hỏi ở tab **VI** (tối đa 300 ký tự).',
          '**Bước 4.** **Answer** — gõ câu trả lời (chữ thường, tối đa **2.000** ký tự, có bộ đếm).',
          '**Bước 5.** Bấm **EN**, rồi **KO**, và lặp lại bước 3–4 cho từng ngôn ngữ muốn có. Hai ô **đổi tab cùng nhau**.',
          '**Bước 6.** **Status** — **Published** để hiện ngay; để **Draft** nếu còn chờ bản dịch.',
          '**Bước 7.** Bấm **Save**. Toast *FAQ entry created*; câu mới nằm **cuối** bảng — tức là **cuối** danh sách trên trang. Kéo lên nếu cần (§2).',
        ],
      },
      {
        kind: 'shot',
        src: '/shots/help-admin/faq-07-company-new.jpg',
        where: 'Admin',
        caption: '**New FAQ entry** ở tab Company information: chỉ có *Question*, *Answer* (ô chữ thường, *0 / 2000*) và *Status* — không có danh mục, không có công tắc trang chủ như tab Help centre.',
      },
      {
        kind: 'warn',
        text:
          '**Ngôn ngữ nào không viết thì nhà tuyển dụng đọc site bằng ngôn ngữ đó KHÔNG thấy câu hỏi** — không tự lấy bản tiếng Việt thay. Mỗi ngôn ngữ đã gõ phải có **đủ cả câu hỏi lẫn câu trả lời**; thiếu một nửa thì Save báo *This answer needs its question in {locale} too* và tự mở tab ngôn ngữ đó.',
      },

      { kind: 'h', text: '§2 · Sắp thứ tự, sửa, ẩn, xoá' },
      {
        kind: 'list',
        items: [
          '**Sắp thứ tự:** kéo **tay nắm** ⠿ ở đầu dòng, hoặc bấm **▲ / ▼** ở cột *Order*. Lưu ngay — toast *FAQ order saved*. Đang lọc trạng thái thì kéo thả **tắt** (*Clear the status filter to reorder*) — bấm **All** trước.',
          '**Sửa nội dung:** bấm vào dòng → sửa → **Save** (toast *FAQ entry saved*). Câu đang *Published* hiện bản mới sau khoảng 1 phút.',
          '**Đổi trạng thái:** nút **⋮** cuối dòng — mỗi lựa chọn hỏi xác nhận trước khi chạy.',
        ],
      },
      {
        kind: 'table',
        heading: 'Nút ⋮ của một câu hỏi',
        cols: ['Chọn', 'Có khi', 'Kết quả trên trang nhà tuyển dụng'],
        rows: [
          ['**Edit**', 'Luôn có', 'Mở ngăn kéo sửa'],
          ['**Publish**', 'Câu chưa *Published*', '**Hiện** — với các ngôn ngữ đã viết đủ (hộp xác nhận liệt kê chúng)'],
          ['**Unpublish**', '*Published* hoặc *Review*', 'Gỡ khỏi trang, về **Draft**; nội dung giữ nguyên'],
          ['**Send for review**', 'Chỉ *Draft*', 'Không hiện; đánh dấu chờ người duyệt'],
          ['**Archive**', 'Chưa *Archived*', 'Gỡ khỏi trang, cất đi; **Publish lại được**'],
          ['**Delete**', 'Luôn có (chữ đỏ)', '**Xoá vĩnh viễn** cả câu và mọi bản dịch — muốn giữ thì Archive'],
        ],
      },

      { kind: 'h', text: 'Phần 2 · Trên site nhà tuyển dụng — họ thấy gì' },
      { kind: 'h', text: '§3 · Mở trang Company information', path: '/company-join' },
      {
        kind: 'list',
        items: [
          'Đăng nhập `dev-hiring.saramin.vn` bằng tài khoản nhà tuyển dụng (chưa đăng nhập thì bị chuyển sang trang đăng nhập, tab *Employer*).',
          'Bấm **tên công ty / tên mình** ở góc phải thanh trên → **Company information** (mục đầu tiên của menu).',
          'Trang **Company information management** mở ra: *Company information* (hồ sơ pháp lý), *Basic information*, giấy tờ đăng ký, rồi **Company information FAQ** ở **cuối trang**.',
        ],
      },
      {
        kind: 'shot',
        src: '/shots/help-admin/cfaq-03-account-menu.jpg',
        where: 'Company site',
        caption: 'Menu tài khoản của nhà tuyển dụng → **Company information**. Trang này giữ hồ sơ pháp lý của công ty; công ty đã *Verified* thì hồ sơ bị khoá, chỉ Saramin sửa được.',
      },

      { kind: 'h', text: '§4 · Mục Company information FAQ' },
      {
        kind: 'list',
        items: [
          'Mỗi câu *Published* là **một ô** có chữ **Q** đỏ và câu hỏi in đậm, **đúng thứ tự** bảng Admin.',
          'Tất cả **đóng sẵn**. Bấm một ô thì câu trả lời mở ngay bên dưới; **mỗi lúc chỉ mở một ô** — mở ô khác thì ô trước tự đóng. Bấm lại để đóng.',
          'Không có tìm kiếm, không có lượt xem, không có trang riêng cho từng câu.',
          'Tiêu đề mục: *Company information FAQ* (EN) · *Câu hỏi thường gặp về thông tin doanh nghiệp* (VI).',
        ],
      },
      {
        kind: 'shot',
        src: '/shots/help-admin/cfaq-02-faq-open.jpg',
        where: 'Company site',
        caption: 'Cuối trang Company information, công ty DatVietVAC (22/10): đúng **4** câu — chính là 4 câu *Published* ở Admin, cùng thứ tự; 2 câu *Draft* không hiện. Câu đầu đang mở.',
      },
      {
        kind: 'open',
        text:
          '**Có thể là lỗi — chưa kiểm trên dev:** ô *Answer* ở Admin ghi *Line breaks are kept*, nhưng trang nhà tuyển dụng vẽ câu trả lời **không kèm kiểu giữ xuống dòng** (`company-faq.tsx`, svn-web 74511ba38) — một câu trả lời nhiều dòng nhiều khả năng hiện thành **một đoạn liền**. Cần thử: lưu một câu trả lời hai dòng ở Draft → Publish → xem trang. Nếu đúng là gộp dòng, sửa phía web (thêm `whitespace-pre-line`) hoặc bỏ câu *Line breaks are kept* ở Admin.',
      },

      { kind: 'h', text: '§5 · Kiểm trên trang — và khi không thấy' },
      {
        kind: 'table',
        heading: 'Đã lưu mà không thấy trên trang — kiểm theo thứ tự',
        cols: ['#', 'Kiểm', 'Ở đâu'],
        rows: [
          ['1', 'Câu hỏi có **Published** chưa?', 'Cột *Status* của dòng'],
          ['2', 'Câu có viết **bằng ngôn ngữ đang đọc** không? (đổi ngôn ngữ ở góc trên trang: EN · VI · KO)', 'Cột *Languages* — chip mờ là ngôn ngữ chưa viết'],
          ['3', 'Đang xem đúng tab **Company information** ở Admin chưa? (tab *Help centre* là trang khác)', 'Tab đầu màn FAQ'],
          ['4', 'Đã quá **1 phút** chưa?', 'Tải lại trang'],
          ['5', 'Trang hiện **đủ 6 câu** dù Admin chỉ có 4 câu Published?', 'Trang đang dùng bản mẫu vì không gọi được server — báo dev'],
        ],
      },

      { kind: 'h', text: 'Phần 3 · Tra cứu' },
      {
        kind: 'table',
        heading: 'Hai vùng FAQ — cùng một màn hình Admin',
        cols: ['Tab', 'Hiện ở đâu', 'Cấu trúc', 'Câu trả lời'],
        rows: [
          ['**Company information**', 'Site nhà tuyển dụng — trang *Company information* (`/company-join`), cuối trang', 'Một danh sách phẳng có thứ tự, chung cho mọi công ty', '**Chữ thường**; tối đa **2.000** ký tự'],
          ['**Help centre**', 'Site ứng viên — *How can we help?* (`/help`) — xem trang **How can we help?**', 'Đối tượng → danh mục → câu hỏi; thứ tự **trong từng danh mục**', '**Rich text** (ảnh, bảng, heading); tối đa **20.000** ký tự'],
        ],
      },
      {
        kind: 'table',
        heading: 'Trạng thái của một câu hỏi',
        cols: ['Trạng thái', 'Trên trang', 'Tới bằng cách nào', 'Làm gì tiếp'],
        rows: [
          ['**Draft**', 'Không hiện — chỗ chờ đủ bản dịch', 'Tạo · **Unpublish**', 'Publish · Send for review · Archive · Delete'],
          ['**Review**', 'Không hiện', '**Send for review** (chỉ từ Draft) hoặc chọn trong ngăn kéo', 'Publish · Unpublish · Archive · Delete'],
          ['**Published**', '**Hiện** — với ngôn ngữ đã viết đủ', '**Publish**', 'Unpublish · Archive · Delete'],
          ['**Archived**', 'Không hiện; giữ nội dung', '**Archive**', 'Publish · Delete'],
        ],
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
  /* How can we help? — ONE page from the Admin screen that feeds it (Content → FAQ,
     tab Help centre) to the jobseeker page (/help). Merged 21/10/2026 from the former
     `faq` (help-centre half) and `help-center` entries; /trang/help-center keeps working. */
  'help-center': {
    logic: [
      '**Một nội dung, hai nơi.** Nhập ở Admin — *Content → FAQ*, tab **Help centre**; hiện ở trang **How can we help?** của site ứng viên (`/help`, VI `/ho-tro`). Không câu nào viết cứng trong code: muốn đổi trang này thì đổi ở Admin.',
      '**Trung tâm hỗ trợ** của site jobseeker, tab **Chúng tôi có thể giúp gì?** — `/ho-tro` (EN `/help`). Công khai: **không cần đăng nhập**, trừ tab *Xoá tài khoản*. Ứng viên và nhà tuyển dụng dùng **chung một trang**; nhà tuyển dụng bấm **Doanh nghiệp**.',
      '**Cá nhân / Doanh nghiệp là hai bộ danh mục riêng**, mỗi bên 7 danh mục. Trang chủ vẽ **mỗi danh mục một khối**, mỗi khối tối đa **5 câu** — chỉ những câu Operator bật *Show on the help centre home page*, theo đúng thứ tự trong bảng admin.',
      '**Bấm câu hỏi thì câu trả lời mở ngay tại chỗ** (accordion), mỗi lúc chỉ mở một câu. Mở kiểu này **không tính lượt xem**. Chỉ khi mở câu hỏi từ **kết quả tìm kiếm** thì mới sang trang riêng `/ho-tro/cau-hoi/<id>` và cộng 1 lượt xem.',
      '**Quy tắc ngôn ngữ ngược với mọi màn hình khác**: một câu hỏi viết bằng **ít nhất một** trong VI/EN/KO (chỉ tiếng Hàn cũng hợp lệ); mỗi ngôn ngữ phải có **cả câu hỏi lẫn câu trả lời**; ngôn ngữ thiếu thì **câu đó bị giấu với khách đọc ngôn ngữ ấy** — không rơi về VI. Cột *Languages* cho biết tầm với.',
      '**Danh mục và từ khoá gợi ý thì ngược lại**: VI bắt buộc, EN/KO thiếu thì rơi về VI (vì chúng là điều hướng — giấu đi là mất đường vào).',
      'Quyền `site_faq` (read · create · update · delete), **mặc định chỉ HQ admin** (seed V457). Riêng với `site_notice` — cấp cái này không cấp cái kia.',
      '**Tab *Company information* của cùng màn FAQ không thuộc trang này** — nó nuôi trang Company information của site nhà tuyển dụng. Xem *FAQ — Company information*.',
    ],
    how: [
      '**Admin:** *Content → FAQ* → tab **Help centre** → **Jobseekers** (tab *Individual* của site) hoặc **Employers** (tab *Company*).',
      'Bấm **danh mục** ở cột trái → **New entry** → viết **Question** + **Answer** ở VI (rồi EN, KO) → bật *Show on the help centre home page* nếu muốn lên trang chủ → **Status = Published** → **Save**.',
      '**Đợi khoảng 1 phút**, mở `dev-saramin.saramin.vn/help` → đúng tab *Individual* / *Company* → câu hỏi có trong danh mục, và (nếu bật) trong khối *… — frequently asked*.',
      'Không thấy? Bảng kiểm ở **§11**. Chi tiết từng thao tác ở Phần 1, khách thấy gì ở Phần 2.',
    ],
    watch: [
      '**Danh mục không Published thì giấu MỌI câu bên trong**, kể cả câu đã Published. Đặt danh mục về Draft là cách tắt cả nhóm.',
      '**Một khối có thể hiện tiêu đề mà không có câu nào** nếu danh mục có câu hỏi nhưng chưa câu nào được bật *Show on the help centre home page*. Sửa ở admin: bật cờ đó cho vài câu.',
      '**Câu thứ 6 trở đi của một danh mục không hiện trên trang chủ**, dù đã bật cờ home page. Khách thấy chúng qua **Xem thêm**.',
      '**Kéo thả bị tắt khi đang lọc trạng thái** — xoá bộ lọc để sắp lại.',
      'Dòng cảnh báo đầu bảng: “{n} of {total} published entries are missing a language…” — những câu đó vô hình với khách đọc ngôn ngữ thiếu.',
      '**Sửa ở admin, đợi khoảng 1 phút.** Trang chủ và kết quả tìm kiếm được cache 60 giây; site không được báo khi Operator bấm Publish.',
      '**Giới hạn 20 ký tự chỉ kiểm khi bấm tìm.** Ô vẫn cho gõ dài hơn; bấm tìm thì hiện dòng *Nhập tối đa 20 ký tự.* và không tìm. Bấm tìm với ô trống thì ra **toàn bộ** câu hỏi.',
      '**Tìm kiếm quét cả Cá nhân lẫn Doanh nghiệp**, cả câu hỏi lẫn nội dung trả lời, chỉ trong ngôn ngữ đang đọc. Câu khớp ở tiêu đề xếp trước.',
      '**“Tìm ID” không còn.** Tab vẫn tên *Tìm ID / mật khẩu* nhưng chỉ đặt lại **mật khẩu**, và chỉ cho **ứng viên**, bằng **số điện thoại** (không phải email). Nhà tuyển dụng quên mật khẩu dùng trang đăng nhập của site tuyển dụng.',
      '**Xoá tài khoản là xoá thật.** Ứng viên không tự khôi phục được; CS chỉ huỷ được trong **72 giờ**. Email đó bị chặn đăng ký và đăng nhập lại, đơn ứng tuyển đang chạy bị rút.',
      '**svn-be không trả lời thì trang hiện nội dung mẫu** — câu hỏi trông như thật nhưng là dữ liệu giả trong code. Thấy câu lạ không có trong admin thì báo dev kiểm tra kết nối, đừng đi sửa nội dung.',
    ],
    blocks: [
      {
        kind: 'table',
        heading: 'Một nội dung, hai nơi',
        cols: ['', 'Ở đâu', 'Ai dùng'],
        rows: [
          ['**Nhập**', 'Admin — *Content → FAQ* → tab **Help centre** (`dev-admin.saramin.vn/content/faq`)', 'Operator HQ (quyền *FAQ*)'],
          ['**Hiện**', 'Site ứng viên — **How can we help?**: `dev-saramin.saramin.vn/help` (VI `/ho-tro`); trang một câu hỏi `/ho-tro/cau-hoi/<id>`; tìm kiếm `/ho-tro/tim-kiem`', 'Khách — ứng viên **và** nhà tuyển dụng, không cần đăng nhập'],
        ],
      },
      { kind: 'h', text: 'Phần 1 · Trên Admin — từng bước' },
      {
        kind: 'p',
        text:
          'Phần này dành cho người **sửa nội dung trang *How can we help?*** (`/ho-tro`, EN `/help`) trên site ứng viên. Mọi thứ trên trang đó — danh mục, câu hỏi, khối *frequently asked*, chip *Suggested* — đều nhập ở **một** màn: *Content → FAQ*, tab **Help centre**. Tab kia của cùng màn, **Company information**, nuôi site nhà tuyển dụng — xem trang *FAQ — Company information*. Cần quyền **FAQ** (`site_faq`): *View* để xem, *Create / Update / Delete* để sửa; mặc định chỉ HQ admin có. Nút nào không có quyền thì **ẩn hẳn**, không mờ.',
      },
      {
        kind: 'table',
        heading: 'Cái gì trên Admin thành cái gì trên site',
        cols: ['Trên Admin (Content → FAQ → Help centre)', 'Trên site — How can we help?'],
        rows: [
          ['Nút **Jobseekers** / **Employers** đầu tab', 'Hai tab **Individual** / **Company** (*Cá nhân* / *Doanh nghiệp*) — mỗi bên một bộ danh mục riêng'],
          ['Cột **Categories**, theo thứ tự trong cột', 'Hàng **chip danh mục** sau chip *All*, và thứ tự các khối *… — frequently asked*'],
          ['Bảng câu hỏi của một danh mục, theo thứ tự trong bảng', 'Danh sách câu hỏi khi khách bấm danh mục đó (20 câu/trang)'],
          ['Công tắc **Show on the help centre home page** của câu hỏi', 'Câu đó lên **khối của danh mục** ở trang chủ trợ giúp — **5 câu bật đầu tiên** theo thứ tự bảng'],
          ['Cột **Recommended searches**', 'Các chip **Suggested** dưới ô tìm kiếm — **dùng chung** cho cả Individual và Company'],
          ['Tab **Company information**', '**Không** thuộc trang này — là FAQ dưới hồ sơ pháp lý trên trang công ty của site tuyển dụng'],
        ],
      },
      {
        kind: 'shot',
        src: '/shots/help-admin/faq-02-helpcentre.jpg',
        where: 'Admin',
        caption: '*Content → FAQ* → tab **Help centre** → **Jobseekers**. Trái: **Categories** (bấm một dòng để mở) và **Recommended searches**. Phải: câu hỏi của danh mục đang chọn — cột *Home block* là công tắc trang chủ.',
      },
      { kind: 'h', text: '§1 · Thêm một câu hỏi' },
      {
        kind: 'list',
        items: [
          '**Bước 1.** Vào *Content → FAQ* → tab **Help centre**.',
          '**Bước 2.** Chọn **Jobseekers** (cho tab *Individual* của site) hoặc **Employers** (cho tab *Company*).',
          '**Bước 3.** Ở cột **Categories**, bấm vào danh mục sẽ chứa câu hỏi. Chưa chọn danh mục thì nút *New entry* bị khoá.',
          '**Bước 4.** Bấm **New entry** (góc phải bảng). Ngăn kéo **New FAQ entry** mở ra bên phải.',
          '**Bước 5.** **Category** — đã điền sẵn danh mục đang chọn; đổi được nếu cần.',
          '**Bước 6.** **Show on the help centre home page** — bật nếu muốn câu này lên khối của danh mục ở trang chủ trợ giúp (xem §2).',
          '**Bước 7.** **Question** — gõ câu hỏi ở tab **VI** (tối đa 300 ký tự). **Answer** — gõ câu trả lời trong khung soạn thảo: có heading, in đậm, danh sách, link, bảng và nút chèn ảnh.',
          '**Bước 8.** Bấm **EN**, rồi **KO**, và lặp lại bước 7 cho từng ngôn ngữ muốn có. Hai ô Question và Answer **đổi tab cùng nhau**.',
          '**Bước 9.** **Status** — để **Draft** nếu còn chờ bản dịch hoặc người duyệt; chọn **Published** nếu muốn hiện ngay.',
          '**Bước 10.** Bấm **Save**. Toast *FAQ entry created*; câu mới nằm **cuối** bảng của danh mục — kéo lên nếu cần (§3).',
        ],
      },
      {
        kind: 'shot',
        src: '/shots/help-admin/faq-03-new-entry.jpg',
        where: 'Admin',
        caption: 'Ngăn kéo **New FAQ entry**: *Where it appears* (danh mục, công tắc trang chủ) → *Question and answer* (tab VI · EN · KO) → *Publication* (trạng thái) → **Save**.',
      },
      {
        kind: 'warn',
        text:
          '**Ngôn ngữ nào không viết thì khách đọc site bằng ngôn ngữ đó KHÔNG thấy câu hỏi** — không tự lấy bản tiếng Việt thay. Mỗi ngôn ngữ đã gõ phải có **đủ cả câu hỏi lẫn câu trả lời**; thiếu một nửa thì Save báo *This answer needs its question in {locale} too* và tự mở tab ngôn ngữ đó. Trang khách mặc định đọc tiếng Việt, nên **luôn viết VI**.',
      },
      {
        kind: 'p',
        text:
          '**Câu trả lời tối đa 20.000 ký tự — tính cả mã định dạng**, không chỉ chữ nhìn thấy. Ảnh và bảng ăn giới hạn rất nhanh; quá thì Save báo *This answer is {length} characters. The limit is 20000.* — tách thành hai câu hỏi.',
      },
      { kind: 'h', text: '§2 · Đưa câu hỏi lên trang chủ trợ giúp' },
      {
        kind: 'list',
        items: [
          '**Bước 1.** Mở câu hỏi: bấm vào dòng của nó (hoặc ⋮ → **Edit**).',
          '**Bước 2.** Bật **Show on the help centre home page** → **Save**. Cột *Home block* của dòng đổi thành **On**.',
          '**Bước 3.** Kéo câu đó lên trong bảng (§3) nếu danh mục đã có từ 5 câu bật trở lên.',
        ],
      },
      {
        kind: 'warn',
        text:
          '**Mỗi khối trang chủ chỉ có 5 câu: 5 câu *On* đầu tiên theo thứ tự trong bảng.** Bật câu thứ 6 vẫn được, cột vẫn ghi *On*, nhưng nó **không hiện** — không có cảnh báo nào. Muốn đổi câu nào lên trang chủ thì **sắp lại thứ tự**, hoặc tắt bớt một câu.',
      },
      { kind: 'h', text: '§3 · Sắp thứ tự, sửa, ẩn, xoá câu hỏi' },
      {
        kind: 'list',
        items: [
          '**Sắp thứ tự:** kéo **tay nắm** ⠿ ở đầu dòng, hoặc bấm **▲ / ▼** ở cột *Order*. Lưu ngay — toast *FAQ order saved*. Đang lọc theo trạng thái (*Published / Draft…*) thì kéo thả **tắt**, dòng gợi ý đổi thành *Clear the status filter to reorder* — bấm **All** trước.',
          '**Sửa nội dung:** bấm vào dòng → sửa → **Save** (toast *FAQ entry saved*). Câu đang *Published* thì sửa xong **hiện luôn** bản mới.',
          '**Đổi trạng thái:** nút **⋮** cuối dòng. Mỗi lựa chọn hỏi xác nhận trước khi chạy — bảng dưới.',
        ],
      },
      {
        kind: 'table',
        heading: 'Nút ⋮ của một câu hỏi',
        cols: ['Chọn', 'Có khi', 'Kết quả trên site'],
        rows: [
          ['**Edit**', 'Luôn có', 'Mở ngăn kéo sửa'],
          ['**Publish**', 'Câu chưa *Published*', '**Hiện** — với các ngôn ngữ đã viết đủ (hộp xác nhận liệt kê chúng)'],
          ['**Unpublish**', '*Published* hoặc *Review*', 'Gỡ khỏi site, về **Draft**; nội dung giữ nguyên'],
          ['**Send for review**', 'Chỉ *Draft*', 'Không hiện; đánh dấu chờ người duyệt'],
          ['**Archive**', 'Chưa *Archived*', 'Gỡ khỏi site, cất đi; **Publish lại được**'],
          ['**Delete**', 'Luôn có (chữ đỏ)', '**Xoá vĩnh viễn** cả câu và mọi bản dịch — muốn giữ thì Archive'],
        ],
      },
      { kind: 'h', text: '§4 · Thêm, sửa, ẩn danh mục' },
      {
        kind: 'list',
        items: [
          '**Bước 1.** Chọn đúng **Jobseekers** hoặc **Employers** — danh mục **gắn cố định** vào đối tượng lúc tạo, sau này không chuyển được.',
          '**Bước 2.** Bấm **+ New** cạnh chữ *Categories*. Hộp **New category** mở ra.',
          '**Bước 3.** **Name (VI)** — bắt buộc, tối đa 120 ký tự. **Name (EN)** / **Name (KO)** — tuỳ chọn; để trống thì site hiện tên tiếng Việt.',
          '**Bước 4.** **Status** — **Published** để hiện; *Draft* để soạn trước.',
          '**Bước 5.** **Save** (toast *Category created*). Danh mục mới nằm cuối cột; kéo tay nắm hoặc ▲▼ để đổi chỗ — đó cũng là thứ tự chip trên site.',
          '**Sửa / ẩn:** ⋮ trên dòng danh mục → **Edit** → đổi tên hoặc **Status** → Save. Danh mục chỉ có hai lựa chọn: *Edit* và *Delete* — trạng thái đổi trong hộp Edit.',
        ],
      },
      {
        kind: 'shot',
        src: '/shots/help-admin/faq-04-new-category.jpg',
        where: 'Admin',
        caption: 'Hộp **New category** — chỉ tên tiếng Việt là bắt buộc; dòng dưới *Status* nhắc rằng danh mục không *Published* thì **giấu mọi câu bên trong**.',
      },
      {
        kind: 'warn',
        text:
          '**Danh mục không *Published* thì giấu MỌI câu bên trong, kể cả câu đã *Published*.** Đây là cách tắt cả nhóm một lần. Ngược lại, **không xoá được danh mục còn câu hỏi** — hộp *This category cannot be deleted yet* chỉ có nút *Close*: chuyển hoặc xoá câu trước, hoặc đặt danh mục về Draft.',
      },
      { kind: 'h', text: '§5 · Từ khoá gợi ý (chip Suggested)' },
      {
        kind: 'list',
        items: [
          '**Thêm:** bấm **+ New** cạnh *Recommended searches* → **Keyword (VI)** bắt buộc, EN / KO tuỳ chọn (tối đa 120 ký tự) → **Save**.',
          '**Đổi thứ tự:** kéo tay nắm hoặc ▲▼ — chip trên site đi đúng thứ tự này.',
          '**Sửa / xoá:** ⋮ → *Edit* hoặc *Delete*.',
          'Một danh sách cho **cả hai** đối tượng. Không giới hạn số chip — thiết kế mẫu dùng **4**, nhiều hơn thì hàng chip dài ra.',
        ],
      },
      {
        kind: 'shot',
        src: '/shots/help-admin/faq-05-new-keyword.jpg',
        where: 'Admin',
        caption: 'Hộp **New recommended search**. Chip chưa có bản dịch vẫn hiện — bằng chữ tiếng Việt, không bao giờ bị ẩn.',
      },
      {
        kind: 'p',
        text:
          '**Giữ mỗi từ khoá trong 20 ký tự.** Ô tìm kiếm trên site chỉ nhận 20 ký tự, và server **lặng lẽ cắt** từ khoá dài hơn về 20 ký tự đầu — bấm một chip dài sẽ tìm theo nửa đầu của nó, không báo lỗi.',
      },
      { kind: 'h', text: 'Phần 2 · Trên site ứng viên — khách thấy gì' },
      { kind: 'h', text: '§6 · Trang chủ trợ giúp', path: '/ho-tro' },
      {
        kind: 'shot',
        src: '/shots/help/help-01-home.jpg',
        where: 'Jobseeker site',
        caption: 'Từ trên xuống: hai tab lớn, ba tab con, ô tìm kiếm + **Từ khoá gợi ý**, công tắc **Cá nhân / Doanh nghiệp**, các viên danh mục, rồi mỗi danh mục một khối *— câu hỏi thường gặp* với nút **Xem thêm**.',
      },
      {
        kind: 'table',
        heading: 'Từng phần trên trang',
        cols: ['Phần', 'Nghĩa', 'Lấy từ đâu ở admin'],
        rows: [
          ['**Hai tab lớn**', '*Chúng tôi có thể giúp gì?* (trang này) · *Thông báo & sự kiện* (`/ho-tro/thong-bao`)', '—'],
          ['**Ba tab con**', '*Trợ giúp* (trang này) · *Tìm ID / mật khẩu* (rời sang `/auth/forgot-password`) · *Xoá tài khoản* (`/ho-tro/xoa-tai-khoan`, cần đăng nhập)', '—'],
          ['**Ô tìm kiếm**', 'Tối đa 20 ký tự. Kết quả ở `/ho-tro/tim-kiem` (xem §3).', '—'],
          ['**Từ khoá gợi ý**', 'Các chip dưới ô tìm. Bấm chip = tìm đúng từ đó. **Một danh sách chung** cho cả Cá nhân lẫn Doanh nghiệp.', '*FAQ → Recommended searches*'],
          ['**Cá nhân / Doanh nghiệp**', 'Đổi bộ danh mục. Đây là đường link (`?audience=company`), không phải nút lọc tại chỗ — trang tải lại.', '*FAQ → Audience: Jobseekers / Employers*'],
          ['**Viên danh mục**', '*Tất cả* + mọi danh mục **Published** của đối tượng đang chọn. Bấm một viên = mở toàn bộ danh mục đó.', '*FAQ → Categories* (thứ tự kéo thả)'],
          ['**Khối câu hỏi**', 'Mỗi danh mục một khối, tối đa 5 câu đã bật *home page*. Danh mục không có câu nào bằng ngôn ngữ đang đọc thì **không có khối**.', '*FAQ → Show on the help centre home page*'],
          ['**Xem thêm**', 'Chỉ hiện khi danh mục còn câu chưa hiện. Mở `/ho-tro?category=<id>`: toàn bộ câu, 20/trang, phân trang theo cụm 10 trang.', '—'],
        ],
      },
      {
        kind: 'shot',
        src: '/shots/help/help-02-company.jpg',
        where: 'Jobseeker site',
        caption: 'Bấm **Doanh nghiệp**: cùng bố cục, bộ danh mục và câu hỏi của nhà tuyển dụng.',
      },
      { kind: 'h', text: '§7 · Mở một danh mục và đọc câu trả lời', path: '/ho-tro?category=<id>' },
      {
        kind: 'shot',
        src: '/shots/help/help-03-category.jpg',
        where: 'Jobseeker site',
        caption: 'Bấm một viên danh mục hoặc **Xem thêm**: chỉ còn danh mục đó, toàn bộ câu hỏi, 20 câu/trang.',
      },
      {
        kind: 'shot',
        src: '/shots/help/help-06-faq-open.jpg',
        where: 'Jobseeker site',
        caption: 'Bấm câu hỏi: câu trả lời mở ngay tại chỗ, dưới là *Ngày đăng · Cập nhật · Lượt xem*. Bấm câu khác thì câu đang mở tự đóng.',
        note: 'Trên điện thoại chỉ hiện *Ngày đăng*; *Cập nhật* và *Lượt xem* bị ẩn.',
      },
      { kind: 'h', text: '§8 · Tìm kiếm', path: '/ho-tro/tim-kiem?keyword=…' },
      {
        kind: 'shot',
        src: '/shots/help/help-04-search.jpg',
        where: 'Jobseeker site',
        caption: 'Kết quả: *Kết quả tìm kiếm trợ giúp · Tổng N kết quả*. Mỗi dòng: **Q** (câu hỏi, từ khoá in đậm), **A** (đoạn trích câu trả lời), danh mục và ngày cập nhật. Bấm dòng nào thì sang trang riêng của câu đó.',
        note: 'Trang kết quả chỉ có tiêu đề *Trung tâm hỗ trợ*, không có hai tab lớn và ba tab con.',
      },
      {
        kind: 'shot',
        src: '/shots/help/help-05-search-empty.jpg',
        where: 'Jobseeker site',
        caption: 'Không có câu nào khớp: *Tổng 0 kết quả* · *Không có kết quả nào.*',
      },
      {
        kind: 'table',
        heading: 'Trang riêng của một câu hỏi — /ho-tro/cau-hoi/<id>',
        cols: ['Phần', 'Nghĩa'],
        rows: [
          ['**Đầu trang**', 'Chữ nhỏ *Trợ giúp*, câu hỏi, *Ngày đăng · Cập nhật · Lượt xem*. Không có tiêu đề *Trung tâm hỗ trợ* và không có tab.'],
          ['**Nội dung**', 'Câu trả lời đầy đủ (có thể có ảnh, bảng, tiêu đề). **Mỗi lần mở trang cộng 1 lượt xem.**'],
          ['**Câu trước / câu sau**', 'Trong cùng danh mục. Hết thì ghi *Không có bài trước / sau*.'],
          ['**Danh sách**', 'Về toàn bộ câu của danh mục đó.'],
        ],
      },
      { kind: 'h', text: '§9 · Tìm ID / mật khẩu', path: '/auth/forgot-password' },
      {
        kind: 'shot',
        src: '/shots/help/help-08-forgot.jpg',
        where: 'Jobseeker site',
        caption: 'Bấm tab *Tìm ID / mật khẩu* là **rời trung tâm hỗ trợ** sang trang *Tìm mật khẩu cho ứng viên*: nhập số điện thoại → **Xác thực** → nhập mã 6 số → **Đặt lại mật khẩu** → nhập mật khẩu mới hai lần.',
        note: 'Đặt lại xong, mọi thiết bị khác đang đăng nhập tài khoản đó bị đăng xuất. Mã được gửi qua **Zalo** tới số điện thoại của tài khoản — số điện thoại là cách xác minh duy nhất.',
      },
      { kind: 'h', text: '§10 · Xoá tài khoản', path: '/ho-tro/xoa-tai-khoan' },
      {
        kind: 'table',
        heading: 'Ba bước trên một màn hình — chỉ cho ứng viên đã đăng nhập',
        cols: ['Bước', 'Ứng viên thấy gì', 'Bắt buộc'],
        rows: [
          ['**1 · Lưu ý**', 'Số **hồ sơ, đơn ứng tuyển, việc đã lưu** thật của tài khoản, và 4 nhóm hậu quả khi xoá.', 'Tick *Tôi đã đọc toàn bộ nội dung trên và đồng ý.*'],
          ['**2 · Xác thực**', 'Số điện thoại + mã Zalo.', 'Có'],
          ['**3 · Lý do**', '4 lựa chọn, rồi hộp xác nhận *Bạn chắc chắn muốn xoá tài khoản?* → **Xoá tài khoản**.', 'Lý do không bắt buộc; xác nhận thì có'],
        ],
        note: 'Xoá xong, site chuyển sang trang *Tài khoản đã xoá*. Chưa đăng nhập mà bấm tab này thì bị đưa sang trang đăng nhập. Nhà tuyển dụng không xoá tài khoản ở đây — họ xoá trong trang quản lý tài khoản của site tuyển dụng.',
      },
      { kind: 'h', text: '§11 · Kiểm trên site — và khi không thấy' },
      {
        kind: 'p',
        text:
          'Mở `https://dev-saramin.saramin.vn/ho-tro` (không cần đăng nhập) — **đợi khoảng 1 phút**, vì site giữ danh sách FAQ trong bộ nhớ đệm 60 giây. Đổi ngôn ngữ ở góc trên (VI · EN · KO) để kiểm từng bản dịch.',
      },
      {
        kind: 'table',
        heading: 'Đã lưu mà không thấy trên site — kiểm theo thứ tự',
        cols: ['#', 'Kiểm', 'Ở đâu'],
        rows: [
          ['1', 'Câu hỏi có **Published** chưa?', 'Cột *Status* của dòng'],
          ['2', '**Danh mục** của nó có Published không?', 'Dòng chữ nhỏ dưới tên danh mục: *Published · N entries*'],
          ['3', 'Câu có viết **bằng ngôn ngữ đang đọc** không?', 'Cột *Languages* — chip mờ là ngôn ngữ chưa viết'],
          ['4', 'Đang xem đúng tab **Individual / Company** chưa?', 'Nút *Jobseekers / Employers* ở Admin'],
          ['5', '(Trang chủ) Câu có nằm trong **5 câu *On* đầu tiên** của danh mục không?', 'Cột *Home block* + thứ tự bảng'],
          ['6', 'Đã quá **1 phút** chưa?', 'Tải lại trang'],
        ],
      },
      { kind: 'h', text: 'Phần 3 · Tra cứu' },
      {
        kind: 'table',
        heading: 'Danh mục mặc định (seed)',
        cols: ['Cá nhân', 'Doanh nghiệp'],
        rows: [
          ['Thông tin tài khoản, ID và mật khẩu', 'Đăng và quản lý tin tuyển dụng'],
          ['Đăng và quản lý hồ sơ', 'Dịch vụ trả phí và thanh toán'],
          ['Ứng tuyển và quản lý hồ sơ ứng tuyển', 'Kho ứng viên'],
          ['Tìm kiếm và quản lý tin tuyển dụng', 'Tài khoản và thông tin công ty, ID và mật khẩu'],
          ['Đăng ký và huỷ tài khoản', 'Đăng ký và huỷ tài khoản'],
          ['Gợi ý việc làm và tìm kiếm đã lưu', 'Quản lý ứng viên và phỏng vấn'],
          ['Dịch vụ thành viên khác', 'Dịch vụ thành viên khác'],
        ],
        note: 'Đây là bộ danh mục hệ thống tạo sẵn. Operator đổi tên, thêm, ẩn và sắp lại ở admin — nên thứ tự trên dev có thể khác bảng này.',
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
        kind: 'list',
        heading: 'Chưa làm — theo quyết định, không phải lỗi',
        items: [
          'Gửi câu hỏi qua email, báo lỗi, báo nội dung vi phạm, *câu hỏi của tôi*, liên hệ hợp tác.',
          'Tìm ID (đã gỡ ngày 21/09).',
          'Ô tìm kiếm nhắc từ khi đang gõ.',
        ],
      },
      {
        kind: 'open',
        text: '**Có thể là lỗi, chưa kiểm trên dev:** từ trang riêng của một câu hỏi **Doanh nghiệp**, bấm **Danh sách** sẽ quay về danh mục đó nhưng công tắc lại đứng ở **Cá nhân** và không viên danh mục nào sáng — vì đường link không mang theo đối tượng. Đọc thấy trong code (`faq-detail-page.tsx`), cần QA xác nhận.',
      },
      {
        kind: 'warn',
        text: '**Nguồn và độ mới.** Viết theo build, kiểm ngày **21/10/2026** với svn-web `178a3709` · svn-be `7cb93f053` · admin `ce90a489` (nhánh `origin/dev`). Ảnh chụp cùng ngày trên `dev-saramin.saramin.vn`, **chưa đăng nhập**, giao diện tiếng Việt — nên tab *Xoá tài khoản* không có ảnh (trang đó bắt đăng nhập).',
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
