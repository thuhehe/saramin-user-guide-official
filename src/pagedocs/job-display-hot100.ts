/*
 * HOT 100 — bảng xếp hạng 100 tin tuyển dụng trên site ứng viên.
 *
 * SAME CONTRACT AS THE REST OF THIS GROUP, set by Thu on 2026-11-21: a USER
 * GUIDE FOR THE CLIENT, read by SALES and by NON-TECHNICAL TESTERS. Pure
 * description of how the board behaves. None of the following belongs on it —
 * "Bản yêu cầu", status lines, ✅ / 🔶 markers, who decided and when, ticket
 * codes, gap statements ("hiện tại lên ngay", "đổi thành"), production
 * measurements, pool sizes, named employers, config advice, internal to-do
 * lists, design provenance. See the header of job-display-logic.ts for the
 * full statement of the rule.
 *
 * VOICE. Sections "1." "2.", plain statements, short table cells, one fact per
 * line, very little bold, NO code identifiers. Never "vẽ" — use "hiện" /
 * "hiển thị".
 *
 * SHAPE:
 *   1 Tổng quan
 *   2 Bước 1 — Tin nào được lên bảng
 *   3 Bước 2 — Mức ứng viên quan tâm
 *   4 Bước 3 — Vị trí cuối cùng  (+ worked example)
 *   5 Dòng Gợi ý
 *   6 Mũi tên và chữ "new"
 *   7 Bộ lọc và khách chưa đăng nhập
 *
 * WHY THIS PAGE IS UNLIKE THE OTHERS IN THE GROUP. Every other area here is a
 * POOL that takes turns: a posting buys its way in and rotation decides when it
 * shows. HOT 100 is a RANKING — the order is itself the content, the reader
 * takes a position and an arrow as a signal, and it is frozen for the day. So
 * the page has to explain a computation, which none of the others do. That is
 * also why it carries a worked example when the group leans against tables:
 * the two rank columns are what a tester will be asked to verify, and nothing
 * shorter than the four rows shows how one beats the other.
 *
 * DELIBERATELY NOT ON THE PAGE, though all of it is in the source material
 * (the client artifact "Xếp hạng HOT 100" and the requirement site):
 *   - the admin configuration screen and its six fields, with the "chỉnh nó
 *     thì sao" column. That is config advice and it is for whoever operates
 *     the board, not for the people selling or testing it. The page says the
 *     numbers are settings and stops there.
 *   - "w = 0 là công tắc tắt, bảng quay về như hiện nay". Two problems: it is
 *     a gap statement, and the claim is FALSE — the same work drops the
 *     placement filter, drops the company spacing and lifts the Gợi ý posting
 *     out, none of which w can undo. Corrected in the ticket and the spec site
 *     on 2026-11-23. Do not put any version of it here.
 *   - the page title and the "?" tooltip copy. Page copy, not logic, and the
 *     title is not settled.
 *   - "tương đương bảng HOT100 của Saramin Hàn Quốc" and every other reference
 *     to the KR board. Design provenance.
 *   - "giai đoạn đầu thứ hạng ít biến động, lượng truy cập còn thấp" — a
 *     production prediction, and it dates the page.
 *   - "vị trí số 10 giờ là một ranh giới có tiền". True and useful, but it is
 *     a sales argument, and Thu removed the sales section from the board
 *     strips page on 22/11 — "để sales tự nói".
 *
 * REVERSED 2026-11-23, LATER THE SAME DAY. Thu ruled that HOT 100 applies
 * the full three-part 10% rule after all — cap at 10% (never below 1), never
 * adjacent, and release the rule when there are not enough other companies.
 * So the page no longer says two postings of one company may sit together; it
 * carries the rule as its own section 5, in the same three parts the client
 * states it in. The requirement and SRM-1711 were changed to match on the same
 * day; before that they said to remove spacing from this board entirely.
 * The note below is kept because the reasoning still holds in reverse — the
 * two pages must not disagree about this rule, whichever way it is settled.
 *
 * THE COMPANY CAP WAS HALF A RULE HERE, and the missing half had to be said
 * out loud. The Jobs-page sections carry one rule in two parts: a company
 * holds at most 10% of the cards AND two of its cards are never adjacent.
 * HOT 100 keeps the cap (10 of 100) and DROPS the spacing — the requirement
 * removes it deliberately and adds, in as many words, "một công ty có thể
 * chiếm nhiều vị trí liền kề, tối đa 10 trong 100. Đây là kết quả đúng,
 * không phải lỗi." The page said the cap and was silent on adjacency, which
 * is the worst of the three options: a tester who read the Trending page
 * first carries its guarantee over and files a bug against correct
 * behaviour. Both halves are now on the page. Thu asked for this on
 * 2026-11-23 ("có rule 10% hiển thị của các job cùng 1 cty chưa?").
 *
 * THE AMPLITUDE IS ~11 BẬC, NOT 10. It is 99w / (1 − w), not w × 100: raising
 * the interest share also shrinks what one tier place is worth, so the two
 * move together. At 0,1 that is 9,9 / 0,9 ≈ 11. The artifact and both other
 * documents said 10 for a while and the ticket said "0,3 ≈ 30" (really ~42);
 * corrected 2026-11-20. The page says "khoảng 11" and gives no table of other
 * ratios — an operator changing the ratio is not this page's reader.
 *
 * SOURCES: the client artifact "Xếp hạng HOT 100" (v10, 20/11/2026) and
 * SARAMIN_REQUIREMENT docs/tasks/hot100-ranking.md + src/data/build/
 * job-management.ts (slug hot100). The board is not built yet, so this page
 * describes the agreed rule, not a shipped screen — which is also why it
 * carries no screenshot.
 * ──────────────────────────────────────────────────────────────────────────── */

import type { PageDoc } from '../docs'

export const HOT100_PAGE_DOCS: Record<string, PageDoc> = {
  'hot-100': {
    blocks: [
      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '1. Tổng quan' },
      {
        kind: 'shot',
        src: '/shots/job-display/hot-100.jpg',
        where: 'Jobseeker site',
        caption: 'Trang HOT 100. **Bộ lọc** ở trên, **bảng xếp hạng** ở dưới. Mỗi dòng mở đầu bằng **hạng và mũi tên** (mục 7). Khách chưa đăng nhập dừng ở dòng 10 và thấy nút *Hoàn thiện CV và xem HOT100* (mục 8).',
        note: 'Ảnh môi trường dev ngày 25/11/2026, chưa đăng nhập. Hôm đó không có dòng Gợi ý (mục 6) và mọi dòng đang hiện “-”.',
      },
      {
        kind: 'p',
        text: 'HOT 100 là bảng xếp hạng 100 tin tuyển dụng. Bảng được chốt một lần mỗi đêm và giữ nguyên suốt ngày hôm đó.\n\nMỗi dòng có một số thứ tự và một mũi tên so với hôm qua. Ở trang này thứ tự chính là nội dung, không chỉ là cách sắp xếp.',
      },
      {
        kind: 'table',
        cols: ['Hạng mục', 'Bảng chạy thế nào'],
        rows: [
          ['Số dòng', '100 dòng đánh số, cộng 1 dòng Gợi ý nằm trên dòng 1'],
          ['Chốt lúc', '0h mỗi ngày, giờ Việt Nam. Trong ngày bảng không đổi'],
          ['Thứ tự dựa trên', 'Gói của tin, và mức ứng viên quan tâm tới tin trong 7 ngày gần nhất'],
          ['Tin chưa mua gói', 'Vẫn lên được bảng, xếp sau tin có gói'],
          ['Một công ty giữ mấy dòng', 'Nhiều nhất 10 — tức 10% của bảng. Tin cùng công ty không đứng cạnh nhau'],
          ['Mũi tên', '▲ ▼ so với bảng hôm qua'],
          ['Khách chưa đăng nhập', 'Xem được 10 dòng đầu'],
          ['Ai thấy gì', 'Cùng một thời điểm, mọi ứng viên thấy cùng một bảng'],
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '2. Bước 1 — Tin nào được lên bảng' },
      {
        kind: 'list',
        items: [
          'Tin đang mở và đang hiển thị trên site.',
          'Sắp toàn bộ tin hợp lệ theo gói: gói cao đứng trước. Trong cùng một gói thì tin được làm mới gần đây hơn đứng trước.',
          'Mỗi công ty nhiều nhất 10 tin trên bảng — tức 10% của 100 dòng. Tin thứ 11 trở đi nhường chỗ cho công ty khác. Đây là vế đầu của luật 10%, xem mục 5.',
          'Lấy 101 tin đầu. Một tin trong số đó được nhấc ra làm dòng Gợi ý, nên bảng đánh số vẫn đủ 100 dòng.',
          'Số thứ tự trong danh sách này là **hạng theo gói** của tin — dòng đầu là 1, dòng thứ hai là 2. Đây chỉ là số dòng, không phải một phép tính.',
          'Tin đăng trong ngày chưa lên bảng ngay. Tin vào bảng từ lần chốt 0h kế tiếp.',
        ],
      },
      {
        kind: 'p',
        text: 'Tin chưa mua gói vẫn vào được danh sách, chỉ xếp sau. Gói quyết định tin đứng cao hay thấp, không quyết định tin có được lên trang hay không.',
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '3. Bước 2 — Mức ứng viên quan tâm' },
      {
        kind: 'table',
        note: 'Ba mức điểm và cửa sổ 7 ngày là cấu hình, không viết cứng trong phần mềm.',
        cols: ['Ứng viên làm gì với tin', 'Điểm'],
        rows: [
          ['Xem tin', '1'],
          ['Lưu tin', '3'],
          ['Ứng tuyển', '5'],
        ],
      },
      {
        kind: 'list',
        heading: 'Những lượt không được tính',
        items: [
          'Một người xem một tin nhiều lần trong một ngày chỉ tính 1 lượt xem.',
          'Lượt xem từ chính nhà tuyển dụng sở hữu tin.',
          'Tin đã được lưu rồi bỏ lưu.',
          'Hồ sơ ứng tuyển đã rút hoặc đã xoá.',
        ],
      },
      {
        kind: 'p',
        text: 'Xếp 100 tin theo điểm, điểm cao nhất là hạng 1. Đây là **hạng theo tương tác**.\n\nNhiều tin cùng điểm thì nhận cùng một hạng, không xếp tuỳ ý. Tin chưa có lượt nào đều 0 điểm, nên bảng có thể có rất nhiều tin cùng một hạng theo tương tác.',
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '4. Bước 3 — Vị trí cuối cùng' },
      {
        kind: 'p',
        text: 'Vị trí hiển thị là kết quả trộn hai hạng ở trên: gói chiếm 90%, mức quan tâm chiếm 10%.\n\nVị trí = 0,9 × hạng theo gói + 0,1 × hạng theo tương tác. Tin nào ra số nhỏ hơn thì đứng trên.',
      },
      {
        kind: 'list',
        items: [
          'Gói quyết định vùng mà tin đứng. Mức quan tâm quyết định tin nhích lên hay xuống trong vùng đó.',
          'Với tỉ lệ 90/10, một tin dịch nhiều nhất khoảng 11 bậc so với vị trí mà gói của nó mang lại.',
          'Tỉ lệ này là cấu hình, không viết cứng.',
          'Sau bước này còn một bước cuối: giãn tin cùng công ty ra khỏi hai dòng liền nhau — mục 5.',
        ],
      },
      {
        kind: 'example',
        heading: 'VD: bốn tin P, Q, R, S',
        scenario:
          'Số liệu minh hoạ, không phải dữ liệu thật. Hai cột hạng là kết quả của bước 1 và bước 2.',
        cols: ['Tin', 'Hạng theo gói', 'Hạng theo tương tác', 'Tính ra', 'Vị trí'],
        rows: [
          ['P', '5', '60,5', '4,5 + 6,05 = 10,55', '1'],
          ['Q', '13', '2', '11,7 + 0,2 = 11,90', '2'],
          ['R', '12', '60,5', '10,8 + 6,05 = 16,85', '3'],
          ['S', '20', '1', '18 + 0,1 = 18,10', '4'],
        ],
        note: 'Số 60,5 là hạng chung của nhóm tin chưa có điểm nào. P và R nằm trong nhóm đó.',
      },
      {
        kind: 'list',
        heading: 'Đọc ví dụ này',
        items: [
          'R có hạng theo gói tốt hơn Q — 12 so với 13 — mà vẫn tụt xuống dưới Q, vì ứng viên quan tâm tới Q còn R thì không. Mức quan tâm có tác dụng thật.',
          'S được quan tâm nhất cả bảng nhưng đứng sau P tới 15 bậc gói, nhiều hơn mức mà quan tâm kéo được, nên vẫn không vượt được P. Gói vẫn là yếu tố chính.',
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '5. Luật 10% — mỗi công ty được mấy dòng' },
      {
        kind: 'p',
        text: 'Đây là luật chung cho mọi chỗ hiện việc làm trên site, HOT 100 áp đúng như các section trên ba trang Jobs. Chỉ khác ở chỗ đếm trên cái gì: bên kia đếm trên số thẻ của section, ở đây đếm trên 100 dòng của bảng.',
      },
      {
        kind: 'table',
        cols: ['Vế', 'Nội dung'],
        rows: [
          ['1 — Trần', 'Trong số tin cùng hiện một lúc, mỗi công ty nhiều nhất 10%, thấp nhất 1 tin. Bảng 100 dòng nên trần là 10 tin'],
          ['2 — Giãn', 'Tin của cùng một công ty không đứng cạnh nhau'],
          ['3 — Nới', 'Không còn đủ công ty khác để xen vào thì bỏ luật, hiện hết'],
        ],
      },
      {
        kind: 'list',
        items: [
          'Vế 3 là lý do bảng không bao giờ thiếu dòng. Hàng chỉ còn một hai công ty thì giãn tới đâu hay tới đó, phần còn lại hiện theo đúng thứ tự điểm — không bỏ tin nào ra và không để trống dòng nào.',
          'Vì vế 2, vị trí hiển thị có thể lệch một chút so với thứ tự điểm ở mục 4. Hai tin cùng công ty rơi vào hai dòng liền nhau thì một tin bị đẩy xuống dòng hợp lệ gần nhất.',
          'Mũi tên ▲▼ tính trên vị trí sau khi đã giãn, tức đúng vị trí người đọc nhìn thấy.',
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '6. Dòng Gợi ý' },
      {
        kind: 'list',
        items: [
          'Một dòng nằm trên vị trí số 1, mang nhãn Gợi ý. Không có số thứ tự và không có mũi tên, vì nó không phải một vị trí trên bảng.',
          'Tin được chọn là tin có điểm quan tâm cao nhất trong 101 tin ở bước 1. Đây là dòng duy nhất trên trang thuần theo ứng viên, không tính gói.',
          'Bằng điểm thì tin có hạng theo gói tốt hơn được chọn.',
          'Đúng một dòng.',
          'Tin này không xuất hiện lần thứ hai ở bảng đánh số bên dưới.',
          'Ngày nào không tin nào có điểm thì dòng này không hiện.',
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '7. Mũi tên và chữ “new”' },
      {
        kind: 'table',
        cols: ['Tình huống', 'Hiển thị'],
        rows: [
          ['Hôm qua có trên bảng, nay lên cao hơn', '▲ kèm số bậc'],
          ['Hôm qua có trên bảng, nay xuống thấp hơn', '▼ kèm số bậc'],
          ['Hôm qua có trên bảng, giữ nguyên vị trí', '-'],
          ['Lần đầu lọt vào bảng', 'new'],
          ['Đã từng lên bảng, rớt ra, nay quay lại', '-'],
          ['Đang áp bộ lọc bất kỳ', '- cho toàn bộ dòng'],
        ],
      },
      {
        kind: 'p',
        text: '“new” nghĩa là **lần đầu vào bảng**, không phải tin mới đăng. Một tin đăng từ tuần trước vẫn hiện “new” nếu hôm nay là lần đầu nó lọt vào 100 dòng.\n\nMỗi tin chỉ hiện “new” một lần. Rớt ra rồi quay lại thì hiện “-”.',
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '8. Bộ lọc và khách chưa đăng nhập' },
      {
        kind: 'shot',
        src: '/shots/job-display/hot-100-experience.jpg',
        where: 'Jobseeker site',
        caption: 'Khi đã đăng nhập: hai nút **Mới tốt nghiệp · Có kinh nghiệm** nằm giữa bộ lọc nghề và bảng. Luôn có một nút đang bật.',
        note: 'Ảnh môi trường dev ngày 25/11/2026, đã đăng nhập.',
      },
      {
        kind: 'list',
        heading: 'Bộ lọc kinh nghiệm',
        items: [
          'Hai nút: *Mới tốt nghiệp* và *Có kinh nghiệm*.',
          'Luôn có một nút đang bật, kể cả lúc vừa vào trang. Không có trạng thái “tất cả”, nên người xem không gặp bảng chưa lọc theo kinh nghiệm.',
        ],
      },
      {
        kind: 'list',
        heading: 'Khi đang áp bộ lọc',
        items: [
          'Danh sách đã lọc xếp theo gói rồi tới thời điểm làm mới — không dùng điểm quan tâm.',
          'Cột mũi tên hiện “-” ở mọi dòng, vì danh sách đã lọc không có bảng hôm qua để so.',
        ],
      },
      {
        kind: 'list',
        heading: 'Khách chưa đăng nhập',
        items: [
          'Xem được 10 dòng đầu của bảng đang xem, kể cả khi đã lọc.',
          'Dưới dòng 10 là khối mời đăng nhập. Dòng 11 trở đi không hiện mờ kiểu nhá hàng.',
          'Mũi tên vẫn hiện trên 10 dòng đó.',
          'Chỉ phần hiển thị bị cắt. Hệ thống vẫn tính và lưu đủ 100 vị trí, nếu không thì mũi tên hôm sau sẽ sai.',
        ],
      },
    ],
  },
}
