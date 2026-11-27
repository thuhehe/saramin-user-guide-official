/*
 * Main search — danh sách "Kết quả tìm kiếm" trên trang /tim-kiem, ngay dưới
 * section Top search.
 *
 * SAME CONTRACT AS THE REST OF THIS GROUP (Thu, 2026-11-21): a USER GUIDE FOR
 * THE CLIENT. Pure description of how the list orders its jobs. No "Bản yêu
 * cầu", no status markers, no ticket codes, no gap statements, no production
 * measurements, no named employers, no code identifiers. See the header of
 * job-display-logic.ts for the full rule.
 *
 * SHAPE (copied from Top search, Thu asked for "đơn giản như top search"):
 *   1 Tổng quan
 *   2 Bước 1 — Lọc
 *   3 Bước 2 — Chia nhóm theo product (Posting ladder, with link + shot)
 *   4 Bước 3 — Độ khớp từ khoá (only with a keyword)
 *   5 Bước 4 — Làm mới gần nhất  (+ worked example)
 *   6 Các cách sắp xếp khác
 *   7 Khi không có kết quả
 *
 * WHERE EACH RULE COMES FROM — read 2026-11-27, svn-be origin/main 02056e4b2
 * (release v1.0.78), svn-web origin/main of 2026-11-26. Production serves the
 * listing from Elasticsearch (deploy/production/app/api.yml).
 *   - Visibility: EsJobQueryBuilder.visibility() — OPEN, exposed, company
 *     active, company has a tax code, before both deadline and display end.
 *   - Default sort "Đề xuất" with or without a keyword: svn-web defaultSort().
 *     (svn-web docs/features/jobs.md still says "latest without a keyword" —
 *     stale since 2026-09-21.)
 *   - Order: EsJobQueryBuilder.sort() RECOMMENDED =
 *       keyword:    tier, score, refreshed_at desc, id desc
 *       no keyword: tier, refreshed_at desc, id desc
 *     tier = display_order of the job's ACTIVE placement's ACTIVE product while
 *     now is inside starts_at..ends_at; several placements → highest wins;
 *     0 / archived / draft → free (rulings §19, §32).
 *   - Keyword fields and weights: KEYWORD_FIELDS title^8, skills^4,
 *     roles/categories/companyName/levels ^2; body (description + requirements
 *     + benefits, VI and EN) phrase-only, boost 1 (§13a, §35).
 *   - Freshness boost ≤ 5 %, half-life 7 days, keyword only (§34).
 *   - "Cập nhật mới nhất": day of refresh desc, then employer round (§33a).
 *   - Zero results: 20 `popular` jobs, unfiltered; toolbar-filter exception
 *     (search-results-page.tsx).
 *   - Premium section after row 3, page 1, hidden when svn-be sends no tags.
 * Screenshot of the list: Thu's own capture of prod, 27/11/2026.
 * ──────────────────────────────────────────────────────────────────────────── */

import type { PageDoc } from '../docs'

const LADDER_URL = 'https://prod-admin.saramin.vn/system/product-ladder'

export const MAIN_SEARCH_PAGE_DOCS: Record<string, PageDoc> = {
  'main-search': {
    blocks: [
      {
        kind: 'shot',
        src: '/shots/job-display/main-search-list.jpg',
        where: 'Jobseeker site',
        caption: 'Danh sách *Kết quả tìm kiếm* là khung đỏ. Nằm ngay dưới section Top search (*Việc làm dành cho bạn*).',
        note: 'Ảnh để thấy vị trí của danh sách trên trang.',
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '1. Tổng quan' },
      {
        kind: 'p',
        text: 'Danh sách *Kết quả tìm kiếm* hiện **mọi job khớp với tìm kiếm**, job có mua gói hay không đều vào. Gói chỉ quyết định job **đứng ở đâu** trong danh sách.',
      },
      {
        kind: 'table',
        cols: ['Hạng mục', 'Danh sách chạy thế nào'],
        rows: [
          ['Lấy job nào', 'Mọi job đang mở khớp từ khoá và bộ lọc'],
          ['Thứ tự mặc định', '*Đề xuất* — có gõ từ khoá hay không cũng vậy'],
          ['Xếp trước tiên theo', 'Product job đang chạy: product đứng cao hơn trên Posting ladder thì job đứng trước'],
          ['Khi có từ khoá', 'Trong cùng một product: job khớp từ khoá tốt hơn đứng trước'],
          ['Cuối cùng', 'Job làm mới gần nhất đứng trước — không phải ngày sửa'],
          ['Số job một trang', '20, ứng viên đổi được 30 / 40 / 50'],
          ['Một công ty', 'Không giới hạn số job trên một trang'],
        ],
        note: 'Ở trang 1, sau job thứ 3 có thể chen section *Lựa chọn tạo nên khác biệt*. Section đó có luật riêng, không thuộc thứ tự của danh sách này.',
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '2. Bước 1 — Lọc: job nào vào danh sách' },
      {
        kind: 'list',
        items: [
          'Job đang mở và đang hiển thị trên site.',
          'Không gõ, không lọc: mọi job đang mở đều vào.',
          'Có bộ lọc: job phải khớp **mọi** bộ lọc đã chọn — khu vực, ngành nghề, kinh nghiệm, học vấn, mức lương, loại hợp đồng…',
          'Có từ khoá: job phải chứa từ khoá ở một trong các phần: tiêu đề, kỹ năng, vị trí, ngành nghề, cấp bậc, tên công ty, hoặc mô tả / yêu cầu / quyền lợi.',
          'Riêng phần mô tả / yêu cầu / quyền lợi phải chứa **đúng cụm từ đã gõ**. VD: gõ "nhân viên kinh doanh" → mô tả chỉ có chữ "kinh doanh" thì không tính.',
          'Ba nút trên đầu danh sách cũng lọc ở bước này: *Tất cả loại hình* (loại hình doanh nghiệp), *Chỉ việc đã ứng tuyển* và *Ẩn việc đã xem*. Hai nút sau chỉ hiện khi ứng viên đã đăng nhập.',
          'Mua gói hay không **không ảnh hưởng** bước này.',
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '3. Bước 2 — Chia nhóm theo product' },
      {
        kind: 'list',
        items: [
          'Mỗi job vào một nhóm theo product (gói đăng tin) job đang chạy.',
          `Thứ tự các nhóm lấy từ màn **Posting ladder** trong Admin: [System → Posting ladder](${LADDER_URL}). Product nằm cao hơn trên màn này thì job của nó đứng trước trong danh sách.`,
          'Job chạy nhiều product cùng lúc: tính product cao nhất.',
          'Product đã hết hạn hoặc chưa tới ngày bắt đầu, product bị Archived hoặc còn Draft: job về nhóm cuối, cùng job không mua gói.',
          'Thứ tự nhóm tính trên **cả danh sách**, qua mọi trang. Nhóm cao hết job thì mới tới nhóm thấp hơn.',
          'Không có giới hạn số job của một công ty. Một công ty có nhiều job ở nhóm cao có thể chiếm cả trang đầu.',
        ],
      },
      {
        kind: 'shot',
        src: '/shots/job-display/posting-ladder.jpg',
        where: 'Admin',
        caption: 'Màn *Posting ladder*, cột *Display order* là khung đỏ. Số lớn hơn thì product nằm trên, và job của product đó đứng trước trong danh sách *Kết quả tìm kiếm*. Kéo biểu tượng ≡ ở đầu dòng để đổi thứ tự.',
        note: 'Đổi thứ tự ở đây chỉ đổi chỗ đứng của job trong danh sách. Không đổi giá, quota hay section mà product được hiện.',
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '4. Bước 3 — Trong một nhóm: job khớp từ khoá hơn đứng trước' },
      {
        kind: 'p',
        text: 'Bước này **chỉ chạy khi ứng viên gõ từ khoá**. Không gõ thì sang thẳng bước 4.',
      },
      {
        kind: 'table',
        heading: 'Từ khoá nằm ở phần nào thì được bao nhiêu điểm',
        cols: ['Phần chứa từ khoá', 'Mức điểm'],
        rows: [
          ['Tiêu đề', 'Cao nhất — gấp 8 lần mô tả'],
          ['Kỹ năng', 'Gấp 4 lần mô tả'],
          ['Vị trí, ngành nghề, cấp bậc, tên công ty', 'Gấp 2 lần mô tả'],
          ['Mô tả, yêu cầu, quyền lợi', 'Thấp nhất'],
        ],
      },
      {
        kind: 'list',
        items: [
          'Điểm cộng dồn: job chứa từ khoá ở nhiều phần thì điểm cao hơn.',
          'Vì vậy job có từ khoá ở tiêu đề **thường** đứng trên job chỉ có từ khoá ở mô tả — nhưng đây là điểm, không phải chia tầng cứng.',
          'Job vừa làm mới được cộng thêm tối đa 5% điểm, sau 7 ngày còn một nửa. Mức này chỉ đảo chỗ hai job có điểm gần bằng nhau.',
          'Điểm khớp không bao giờ đưa job vượt lên nhóm product cao hơn.',
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '5. Bước 4 — Job làm mới gần nhất đứng trước' },
      {
        kind: 'list',
        items: [
          'Không gõ từ khoá: trong cùng một nhóm product, job làm mới gần nhất đứng trước.',
          'Có gõ từ khoá: chỉ dùng khi hai job bằng điểm khớp.',
          'Làm mới là lần đăng đầu, lần mở lại, hoặc lần *Auto-refresh* của product. Sửa nội dung job **không** đưa job lên.',
        ],
      },
      {
        kind: 'example',
        heading: 'VD: ứng viên gõ "kế toán"',
        scenario: 'Bốn job đều chứa "kế toán". Product A đứng trên product B trên Posting ladder.',
        cols: ['Job', 'Product', 'Từ khoá nằm ở', 'Làm mới', 'Vị trí'],
        rows: [
          ['Job 1', 'A', 'Mô tả', '3 ngày trước', '1'],
          ['Job 2', 'B', 'Tiêu đề', '5 ngày trước', '2'],
          ['Job 3', 'B', 'Mô tả', 'Hôm nay', '3'],
          ['Job 4', 'Không mua gói', 'Tiêu đề', 'Hôm nay', '4'],
        ],
        note: 'Job 1 đứng đầu vì product A cao nhất, dù chỉ khớp ở mô tả. Job 2 đứng trên job 3 vì khớp ở tiêu đề — làm mới hôm nay không bù được. Job 4 khớp tốt và mới nhất nhưng không mua gói nên đứng sau mọi job có gói. Nếu ứng viên không gõ từ khoá, job 3 sẽ đứng trên job 2 vì làm mới gần hơn.',
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '6. Các cách sắp xếp khác' },
      {
        kind: 'table',
        note: 'Chỉ *Đề xuất* xét product. Ba cách còn lại không xét gói.',
        cols: ['Ứng viên chọn', 'Danh sách xếp thế nào'],
        rows: [
          ['Đề xuất (mặc định)', 'Theo bước 2 → 3 → 4 ở trên'],
          ['Cập nhật mới nhất', 'Ngày làm mới gần nhất trước. Trong cùng một ngày, các công ty thay phiên: mỗi công ty 1 job, rồi mỗi công ty job thứ 2…'],
          ['Ngày đăng tin', 'Ngày đăng gần nhất trước'],
          ['Sắp hết hạn', 'Hạn nộp gần nhất trước. Job không có hạn nộp đứng cuối'],
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '7. Khi không có kết quả' },
      {
        kind: 'list',
        items: [
          'Hiện thông báo không tìm thấy, kèm gợi ý cách tìm.',
          'Nếu hệ thống đoán ứng viên gõ nhầm thì hiện thêm dòng *Có phải bạn muốn tìm …?*. Đây chỉ là gợi ý, hệ thống không tự đổi từ khoá.',
          'Bên dưới là 20 job được ứng tuyển nhiều nhất, **không** theo bộ lọc đang chọn.',
          'Trừ khi danh sách trống do ba nút trên đầu danh sách (loại hình, đã ứng tuyển, đã xem): danh sách và các nút vẫn giữ nguyên để ứng viên tắt bớt.',
        ],
      },
      { kind: 'p', text: '*Cập nhật 27/11/2026.*' },
    ],
  },
}
