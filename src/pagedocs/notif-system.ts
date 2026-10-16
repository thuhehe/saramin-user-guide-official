import type { PageDoc, ModuleDoc, DocBlock } from '../docs'

/*
 * Notifications (5 pages) + System (7 pages) — page docs and the two module docs.
 *
 * Checked against the build on 08/10/2026:
 *   saramin-vn-admin origin/dev 45954108 · svn-be origin/dev ee1db5ea9 · svn-web origin/dev d8a43a11
 * Sources: admin docs/features/{notifications,zalo-templates,general-settings,company-information,
 * master-data,audit-log,analytics-logs,exports}.md, the module code under src/modules/{notifications,
 * system}, navigation.config.tsx; svn-be NotificationEventType, NotificationDispatchService,
 * RuleEmailQueue, NotificationHistoryService, the V4xx seed migrations, docs/DEBT.md (D-NOTI-*,
 * D-ZALO-2, D-AUD-1), docs/api/ADMIN_ZALO.md, docs/crm-company/membership-tier.md,
 * docs/adr/0009-async-list-export.md, application.yml.
 * Where a feature doc lagged its own code, the code won (master data, issuer identity, analytics).
 */

const CHECKED = '`saramin-vn-admin` `origin/dev` 45954108 · `svn-be` ee1db5ea9 · `svn-web` d8a43a11 (08/10/2026)'

/* Master data: one card per tab, the same rows in the same order, so a reader can
   compare two tabs line by line instead of hunting through prose. */
const MD_VI_EN = 'VI và EN (đều bắt buộc)'
const MD_VI_EN_KO = 'VI và EN (đều bắt buộc) · KO'
const MD_DRAG = 'Kéo thả để xếp thứ tự trong ô chọn'
const MD_LIST_IMPORT = 'File .xlsx dạng danh sách (`code`, `name_vi`, `name_en`, `name_ko`, `parent_code`, `action`) — chỉ dòng ghi `delete` mới bị xóa'
const mdTab = (rows: [string, string][]): DocBlock => ({
  kind: 'table',
  cols: ['Mục', 'Logic'],
  rows: rows.map(([k, v]) => [`**${k}**`, v]),
})

export const NOTIF_SYSTEM_PAGE_DOCS: Record<string, PageDoc> = {
  /* ── Notifications ───────────────────────────────────────────────────────── */
  'notification-rules': {
    logic: [
      'Một quy tắc nối **sự kiện → kênh → nội dung** (một mẫu có sẵn, hoặc gõ thẳng). Đây là phần gửi **tự động**. **Người nhận không chọn trên quy tắc** — chính sự kiện quyết định gửi cho ai: ứng viên, nhà tuyển dụng, hay nhân viên Saramin.',
      'Danh sách sự kiện **cố định trong code svn-be** (16 sự kiện, bảng §1). Không tạo thêm được — tab *Event catalog* cũ đã bỏ; một mã sự kiện lạ bị server từ chối (400), vì một quy tắc nghe một sự kiện không ai phát sẽ **im lặng mãi mãi**.',
      '**Kênh thực gửi hôm nay: chỉ Email.** Form chỉ cho chọn Email (*“Email only.”*). Quy tắc **không tắt được in-app**: thông báo in-app của ứng viên (nộp đơn, đổi chặng hồ sơ) và chuông của nhân viên **luôn được ghi**, có quy tắc hay không. Quy tắc chỉ **thêm** một email.',
      '**Quy tắc mới sinh ra ở trạng thái tắt** — lưu không phải là bắt đầu gửi. Bật công tắc *Active* thì mới gửi. **Mọi quy tắc seed sẵn cũng đang tắt.**',
      'Quy tắc bật mà **không gửi được** (không có nội dung, nghe sự kiện build này không phát, hoặc không còn kênh dùng được) hiện **biểu tượng cảnh báo ở ô Active**, tooltip *“This rule is on but won’t send — check its event, channel and message.”* (cột *Effective* cũ đã bỏ, tín hiệu chuyển vào đây).',
      'Quy tắc bắn **mỗi lần sự kiện xảy ra, ngay lập tức**. Hai ô điều kiện và lịch (`conditionJson` / `scheduleJson`) vẫn được lưu nhưng **không gì đọc chúng** — `{"mode":"weekly"}` trên một quy tắc seed không làm nó gửi theo tuần; nhịp tuần/ngày đến từ **job quét** phát ra chính sự kiện đó.',
      'Quy tắc mở ra **trang riêng, không phải drawer**, vì cần chỗ cho trình soạn nằm cạnh phần xem trước đã dựng.',
    ],
    how: [
      '**Soạn mẫu trước** ở Message templates nếu muốn dùng lại nội dung — quy tắc chỉ trỏ vào mẫu.',
      '**New rule** → phần *Trigger*: *Rule name* · *Trigger event* · *Channels* (Email) → phần *Message*: *Use template* (chỉ liệt kê mẫu **đang Active, cùng kênh**) hoặc *Direct input* (bắt buộc **tiếng Việt**; EN/KO tuỳ chọn) → **Refresh preview** để server dựng bản xem trước với giá trị mẫu → lưu.',
      'Bật **Active** khi đã chắc nội dung. Rồi kiểm ở **Delivery history**, lọc *Source = Rule*.',
      'Muốn dừng tạm: **tắt Active**. **Xoá là mất hẳn** — hộp xác nhận nói đúng thế: *“… stops sending and is removed for good. Pause it to keep it.”*',
    ],
    watch: [
      'Tắt một quy tắc **không** thu hồi những tin đã gửi — nó chỉ ngừng gửi tiếp. Email đã vào hàng đợi (*Queued*) trước lúc tắt **vẫn đi** — bộ gửi chạy mỗi 15 giây và không hỏi lại quy tắc.',
      '**Hai quy tắc bật trên cùng một sự kiện = hai email** cho cùng một người. Không có gì gộp hay chặn trùng.',
      '**Mọi email đi bằng tiếng Việt.** Phần EN/KO soạn ra được lưu nhưng **chưa bao giờ được gửi** — svn-be chưa lưu ngôn ngữ ưa thích của người nhận (D-NOTI-13).',
      'Mẫu mà quy tắc trỏ tới bị **Deactivate** thì mỗi lần sự kiện xảy ra sinh một dòng *Skipped — Template turned off* trong lịch sử, không phải lỗi im lặng.',
      'Sửa hay xoá quy tắc **không ghi vào Audit log** (chỉ gửi tay và Resend được ghi).',
      'Quyền: xem `notification_workflow:read`; tạo / sửa / xoá là `create` / `update` / `delete`. Seed chỉ cấp cho **HQ Admin** — vai trò khác phải được tick ở *Roles & permissions*.',
    ],
    blocks: [
      { kind: 'p', text: `Đối chiếu với build: ${CHECKED}.` },
      { kind: 'h', text: '§1 · Danh mục sự kiện — cái gì gửi gì, cho ai' },
      {
        kind: 'table',
        heading: '16 sự kiện build này phát ra (`NotificationEventType`)',
        note: 'Cột **Quy tắc seed** là tên quy tắc có sẵn trên dev — **tất cả đang tắt**. Kênh duy nhất quy tắc gửi là **Email**. Giờ quét là mặc định cấu hình svn-be, giờ Việt Nam; môi trường có thể đổi.',
        cols: ['Sự kiện (mã)', 'Khi nào', 'Gửi cho', 'Quy tắc seed', 'Ghi chú'],
        rows: [
          ['`application.submitted`', 'Ứng viên nộp đơn thành công', 'Ứng viên', '*Xác nhận ứng tuyển (email)*', 'In-app **luôn** ghi vào chuông ứng viên'],
          ['`application.status_changed`', 'Hồ sơ ứng tuyển được chuyển sang chặng khác (chỉ khi chặng **thật sự đổi**)', 'Ứng viên', '— (không seed)', 'In-app luôn ghi; biến `applicationStatus`'],
          ['`account.activated`', 'Tài khoản ứng viên **dùng được lần đầu** — qua xác minh, Google, hay admin tạo', 'Ứng viên', '*Chào mừng ứng viên mới (email)*', 'Chỉ email'],
          ['`profile.incomplete`', 'Job quét hằng ngày 09:30: tài khoản mới chưa hoàn thiện hồ sơ', 'Ứng viên', '*Nhắc hoàn thiện hồ sơ (email)*', '**Cần đồng ý nhận email marketing**'],
          ['`application.weekly_digest`', 'Thứ Hai 08:00: tổng hợp nơi từng đơn đang đứng', 'Ứng viên', '*Tổng hợp hồ sơ hằng tuần (email)*', '**Cần đồng ý nhận email marketing**'],
          ['`job.alert`', 'Thứ Hai 07:00: gợi ý việc làm cá nhân hoá', 'Ứng viên', '*Gợi ý việc làm hằng tuần (email)*', 'Theo chủ đề *Job Alerts* ứng viên tự bật'],
          ['`candidate.dormant`', 'Job quét hằng ngày 09:45: ứng viên im lặng 30 hoặc 60 ngày', 'Ứng viên', '*Mời ứng viên quay lại (email)*', 'Opt-out: gửi trừ khi ứng viên đã tắt'],
          ['`job.published`', 'Tin đăng lên công khai **lần đầu**', 'Nhà tuyển dụng', '*Kích hoạt tin đăng (email)*', 'Chỉ email'],
          ['`job.expiring`', 'Tin đang mở **còn 3 ngày** là hết hạn', 'Nhà tuyển dụng', '*Nhắc tin đăng sắp hết hạn (email)*', 'Chỉ email'],
          ['`application.received`', 'Có ứng viên nộp vào tin của nhà tuyển dụng', 'Nhà tuyển dụng', '*Báo NTD có đơn mới (email)*', 'Bản sao phía NTD của `application.submitted`'],
          ['`quote.discount_requested`', 'Báo giá cần duyệt chiết khấu', 'Người duyệt (nhân viên)', '*Báo giá cần bạn duyệt chiết khấu (email)*', 'Chuông nhân viên luôn ghi'],
          ['`quote.discount_decided`', 'Người duyệt đã trả lời', 'Rep xin duyệt', '*Kết quả duyệt chiết khấu (email)*', 'Chuông nhân viên luôn ghi'],
          ['`company_claim.decided`', 'Yêu cầu nhận công ty được duyệt / từ chối', 'Rep xin', '*Kết quả yêu cầu nhận công ty (email)*', 'Chuông nhân viên luôn ghi'],
          ['`company.owner_assigned`', 'Rep được **người khác** giao một công ty', 'Rep được giao', '*Bạn được giao phụ trách công ty (email)*', 'Chuông nhân viên luôn ghi'],
          ['`purchase_order.result`', 'PO có kết quả — đã xuất hoá đơn hoặc hết hạn', 'Rep phát hành PO', '*Kết quả đơn hàng (PO) (email)*', 'Chuông nhân viên luôn ghi'],
          ['`quota.shared_spent`', 'Một công ty thành viên dùng một suất từ quota được chia sẻ', 'Công ty tài trợ (Sponsor)', '*Công ty được chia sẻ đã dùng quota (email)*', '**Mỗi lần dùng một email**, không gom'],
        ],
      },
      {
        kind: 'p',
        text: 'Ngoài bảng này còn **mười email giao dịch** (xác minh, đặt lại mật khẩu, lời mời admin, báo hết hạn quota tìm CV…). Chúng **không đi qua quy tắc** và **không tắt được** — chỉ sửa được câu chữ, ở Message templates.',
      },
      { kind: 'h', text: '§2 · Bật / tắt một quy tắc đổi gì' },
      {
        kind: 'table',
        heading: 'Trạng thái một quy tắc',
        cols: ['Trạng thái', 'Nghĩa', 'Vào bằng cách', 'Làm gì tiếp'],
        rows: [
          ['*Inactive*', 'Không gửi gì. Trạng thái **mặc định** của mọi quy tắc mới và mọi quy tắc seed', 'Tạo mới, hoặc tắt công tắc *Active*', 'Sửa, bật, hoặc xoá'],
          ['*Active*', 'Mỗi lần sự kiện xảy ra: với từng người nhận, xếp hàng **một email** (*Queued*), bộ gửi đi trong vòng ~15 giây', 'Bật công tắc *Active* (trên form)', 'Tắt để dừng; theo dõi ở Delivery history'],
          ['*Active* + ⚠', 'Bật nhưng **không thể gửi**: thiếu nội dung, sự kiện không còn được phát, hoặc không có kênh dùng được', 'Quy tắc cũ (trước V415) không có nội dung', 'Mở quy tắc, gắn nội dung, lưu'],
        ],
      },
      {
        kind: 'example',
        heading: 'Bật “Báo NTD có đơn mới”',
        scenario: 'Ops muốn nhà tuyển dụng nhận email mỗi khi có đơn ứng tuyển mới.',
        cols: ['Bước', 'Ai / cái gì', 'Kết quả nhìn thấy'],
        rows: [
          ['1', 'Mở quy tắc seed *Báo NTD có đơn mới (email)* → *Refresh preview* → bật *Active* → lưu', 'Ô Active xanh, không có ⚠'],
          ['2', 'Một ứng viên nộp đơn vào tin của công ty A', 'Ứng viên thấy thông báo in-app (như trước giờ). Svn-be xếp hàng một email `application.received` cho phía công ty A'],
          ['3', 'Bộ gửi chạy (mỗi 15 giây)', 'Delivery history: dòng *Source = Rule*, *Status = Sent*, *Tries = 1*'],
          ['4', 'SMTP lỗi lúc gửi', 'Dòng thành *Failed*, cột *Reason* ghi lỗi. **Không tự thử lại** — phải bấm *Resend*'],
        ],
        note: 'Nếu ở bước 1 quên bật *Active*, bước 2 vẫn tạo in-app cho ứng viên nhưng **không có dòng nào** trong Delivery history — đó là dấu hiệu quy tắc còn tắt.',
      },
      {
        kind: 'open',
        text: '**Kênh Zalo, SMS, push chưa nối vào quy tắc.** Trang Zalo ZNS templates đã có dòng cho mười sự kiện ứng viên/NTD, nhưng bộ gửi thông báo **chưa gửi qua Zalo** (svn-be D-ZALO-2); SMS và push không có nhà cung cấp (D-NOTI-2). Điều kiện và lịch gửi trễ cũng chưa có (D-NOTI-14). Người nhận phía NTD cụ thể là ai trong công ty (người đăng tin hay mọi admin công ty) **chưa xác minh** trong code.',
      },
    ],
  },

  'notification-send': {
    logic: [
      'Gửi **một lần** cho một nhóm người nhận, không tạo quy tắc. Dùng cho thông báo không lặp lại: bảo trì hệ thống, đổi điều khoản, thông báo sự kiện.',
      '**Trang này chính là form** — không có danh sách: kết quả của một lần gửi xem ở **Delivery history** (lọc *Source = Manual*). Nút hành động của trang **làm mới form**, không mở gì cả.',
      '**Chỉ Email.** Svn-be từ chối mọi kênh khác (400) — in-app cần đổi schema bảng thông báo của ứng viên và một PR svn-web đi cùng (D-NOTI-10).',
      '**Ba kiểu đối tượng** (*Target*): *All candidates* · *All company users* · *Specific members* (tối đa **500** người, ứng viên hoặc người dùng công ty — **không bao giờ là nhân viên Saramin**).',
      'Hai kiểu *All…* được **giải ra lúc gửi chạy**, không đóng băng lúc bấm — ai tồn tại lúc đó thì nhận.',
      '**Gửi tay mặc định là email marketing**: chỉ người **đã đồng ý nhận email marketing** mới nhận. Bật **Force send** để bỏ qua đồng ý đó — dành cho thông báo khẩn hoặc bắt buộc, và **được ghi vào Audit log dưới tên người gửi**.',
      '**Không hẹn giờ.** Bấm Send là server nhận ngay (*“Notification accepted — it is being sent in the background”*), rồi bộ quét mỗi 15 giây mở rộng danh sách theo từng trang và xếp hàng từng email. Không có ảnh, không có link chuyển hướng (hai thứ đó chỉ có nghĩa với push).',
    ],
    how: [
      'Phần **Audience**: chọn *Target*. Với *Specific members*, gõ tên hoặc email để tìm và chọn (tối đa 500).',
      'Phần **Message**: *Use template* (mẫu đang Active, kênh Email) hoặc *Direct input* — chỉ **tiếng Việt** là bắt buộc. Biến dùng được chỉ là **biến của người nhận** (tên, email, ngày tham gia, lần truy cập cuối) — gửi tay không có sự kiện nên không có biến đơn hàng, tin đăng…',
      '**Refresh preview** → đọc dòng cảnh báo *“Nothing fills these variables…”* nếu có biến gõ sai.',
      'Bật **Force send** chỉ khi thật sự cần → **Send** → hộp xác nhận nói rõ gửi tới ai (*“It goes to {count} selected member(s) and cannot be recalled.”*) → xác nhận.',
      'Vài phút sau, mở Delivery history lọc *Source = Manual* để đếm *Sent* / *Skipped* / *Failed*.',
    ],
    watch: [
      'Quyền ở đây là **`create`, không phải `read`** — gửi tin cho khách là một hành động, nên người xem được lịch sử chưa chắc gửi được. Seed chỉ cấp cho **HQ Admin**.',
      '**Gửi rồi thì không rút lại được.** Xem kỹ danh sách người nhận trước khi bấm.',
      'Gửi *All candidates* **không có Force send** chỉ tới người đã tick đồng ý marketing — thường là **một phần nhỏ**. Người bị loại **không hiện thành dòng Skipped** (lọc thẳng trong SQL); chỉ gửi *Specific* mới ghi một dòng Skipped cho từng người bị loại.',
      'Chọn một mẫu rồi mẫu đó bị **Deactivate trước khi lô chạy xong** → cả lô **thất bại** (*the message template has been retired*), không gửi tiếp.',
      'Nội dung đi bằng **tiếng Việt**, kể cả khi đã soạn EN/KO (D-NOTI-13).',
    ],
    blocks: [
      { kind: 'p', text: `Đối chiếu với build: ${CHECKED}.` },
      {
        kind: 'table',
        heading: 'Ba kiểu đối tượng',
        cols: ['Target', 'Ai nhận', 'Đồng ý marketing', 'Người bị loại hiện ở đâu'],
        rows: [
          ['*All candidates*', 'Mọi ứng viên có email, **tại lúc lô chạy**', 'Lọc theo đồng ý (trừ khi *Force send*)', 'Không hiện — lọc trong truy vấn'],
          ['*All company users*', 'Mọi người dùng phía công ty có email, tại lúc lô chạy', 'Như trên', 'Không hiện'],
          ['*Specific members*', 'Đúng những người đã chọn (≤ 500), ứng viên **hoặc** người dùng công ty', 'Như trên', 'Mỗi người bị loại = **một dòng *Skipped*** kèm lý do'],
        ],
      },
      {
        kind: 'table',
        heading: 'Một người được chọn mà không nhận — lý do ghi trong lịch sử',
        cols: ['Lý do (cột *Reason*)', 'Nghĩa', 'Làm gì'],
        rows: [
          ['*Marketing consent withheld*', 'Người đó chưa đồng ý nhận email marketing và lần gửi không bật Force send', 'Đúng quy định — chỉ gửi lại bằng Force send nếu là thông báo bắt buộc'],
          ['*No email address*', 'Tài khoản không có địa chỉ email', 'Không làm gì được ở đây'],
          ['*Template turned off*', 'Mẫu đã bị Deactivate', 'Bật lại mẫu hoặc gửi bằng *Direct input*'],
        ],
      },
      {
        kind: 'example',
        heading: 'Báo bảo trì cho 3 nhà tuyển dụng',
        scenario: 'CS cần báo cho 3 người dùng công ty rằng tối nay hệ thống bảo trì. Một người chưa từng đồng ý nhận marketing.',
        cols: ['Bước', 'Thao tác', 'Kết quả'],
        rows: [
          ['1', '*Specific members* → chọn 3 người dùng công ty; *Direct input*, viết tiêu đề + nội dung tiếng Việt', 'Preview hiện tên người nhận mẫu thay cho `{{memberName}}`'],
          ['2', 'Không bật Force send → Send → xác nhận', 'Toast *accepted*. Một lô `notification_manual_batch` được ghi vào Audit log'],
          ['3', '~15–30 giây sau, Delivery history lọc *Manual*', '2 dòng *Sent* · 1 dòng *Skipped — Marketing consent withheld*'],
          ['4', 'Đây là thông báo vận hành bắt buộc → gửi lại riêng cho người thứ ba, **bật Force send**', 'Dòng mới *Sent*; Audit log ghi việc ghi đè đồng ý dưới tên CS'],
        ],
      },
      {
        kind: 'open',
        text: '**Chưa có:** hẹn giờ gửi, kênh in-app (thông báo hàng loạt trong chuông, D-NOTI-10), Zalo / SMS / push, ảnh và link chuyển hướng (D-NOTI-15), và gửi theo ngôn ngữ của người nhận (D-NOTI-13). Không có màn hình liệt kê các lô đã gửi — chỉ có các dòng lẻ trong Delivery history.',
      },
    ],
  },

  'notification-history': {
    logic: [
      'Lịch sử từng email thông báo — mỗi dòng là **một email cho một người**. Đây là nơi trả lời “khách có nhận được không”.',
      'Bảng này **vừa là hàng đợi vừa là nhật ký**: một dòng *Queued* là việc bộ gửi sắp làm; mọi trạng thái khác là kết quả. Hai thứ không thể lệch nhau.',
      'Ghi **cả tự động (Rule) lẫn gửi tay (Manual)**. **Không** có ở đây: mười email giao dịch (xác minh, đặt lại mật khẩu, email hoá đơn…) — nguồn *System* vì thế luôn trống (D-NOTI-11); tin Zalo; và thông báo in-app.',
      'Nội dung trong chi tiết là **đúng bản đã gửi**, lưu lúc gửi — không dựng lại từ mẫu. Sửa mẫu sau đó không đổi gì ở đây.',
      '**Không tự thử lại.** Một email *Failed* đứng yên là *Failed* cho tới khi có người bấm **Resend**.',
    ],
    how: [
      'Lọc theo **ô tìm** (địa chỉ người nhận hoặc tiêu đề), **Status**, **Source** (*Rule* / *Manual* / *System*) và **khoảng ngày** — khoảng ngày tính trọn ngày theo giờ Việt Nam.',
      'Cột: *Queued at · Status · Source · Channel · Recipient · Subject · Reason · Tries*. Phân trang ở server (bảng chỉ dài thêm, không có trần).',
      'Bấm một dòng → hộp **Delivery detail**: nội dung HTML đúng như đã gửi, thời điểm gửi.',
      '**Resend** (cần `notification_history:update`) → xác nhận *“It is queued again for {recipient}. The attempt count is kept.”* → dòng về *Queued*, bộ gửi thử lại trong ~15 giây.',
    ],
    watch: [
      'Khách báo không nhận được thì kiểm ở đây **trước**, rồi mới nghi ngờ quy tắc hay mẫu. Không có dòng nào = quy tắc đang tắt hoặc sự kiện không xảy ra; *Skipped* = cố ý không gửi; *Sent* = đã giao cho máy chủ mail (xem tiếp hộp thư rác của khách).',
      '**Skipped không phải lỗi** — nó tô màu thông tin, không tô đỏ. Resend **bị khoá** trên *Skipped* (gửi lại là gửi đúng thứ mà việc từ chối nhận đã chặn) và trên *Queued*.',
      '**Resend trên một dòng *Sent* sẽ gửi thêm một email nữa** — nút không khoá ở đó.',
      'Bảng chứa **địa chỉ và nội dung thật của người nhận** (dữ liệu cá nhân) và **chưa có hạn xoá** (D-NOTI-9).',
    ],
    blocks: [
      { kind: 'p', text: `Đối chiếu với build: ${CHECKED}.` },
      {
        kind: 'table',
        heading: 'Trạng thái một dòng',
        cols: ['Trạng thái', 'Nghĩa', 'Vào bằng cách', 'Làm gì tiếp'],
        rows: [
          ['*Queued* (`PENDING`)', 'Đang chờ bộ gửi (chạy mỗi 15 giây)', 'Quy tắc bắn, lô gửi tay được mở rộng, hoặc ai đó bấm Resend', 'Chờ. Resend bị khoá'],
          ['*Sent*', 'Máy chủ mail đã nhận email. *Sent at* có giá trị', 'Bộ gửi gửi thành công', 'Xem nội dung. Resend = gửi **thêm** một bản'],
          ['*Failed*', 'Gửi lỗi; *Reason* ghi lỗi, *Tries* +1', 'Máy chủ mail từ chối / lỗi kết nối', '**Resend** (thủ công — không có tự thử lại)'],
          ['*Skipped*', 'Cố ý không gửi: không đồng ý marketing, không có email, hoặc mẫu đã tắt', 'Quyết định lúc xếp hàng', 'Không Resend được. Nếu bắt buộc phải tới: gửi tay với Force send'],
        ],
      },
      {
        kind: 'warn',
        text: '**Giới hạn 3 lần thử.** Bộ gửi chỉ nhận dòng *Queued* có *Tries* < 3, và Resend **giữ nguyên** số lần thử. Một dòng đã thất bại 3 lần mà bấm Resend sẽ về *Queued* rồi **đứng đó mãi** — không bao giờ được gửi. Nếu thấy dòng *Queued* có *Tries = 3*, đó là lý do; gửi lại bằng *Send manually*. (svn-be `NotificationDeliveryJpaRepository.lockPendingIds`, `NotificationDelivery.requeued`.)',
      },
      {
        kind: 'list',
        heading: 'Ghi vào Audit log',
        items: [
          'Mỗi lần **Resend**: `notification_delivery.retry`, kèm trạng thái trước đó.',
          'Mỗi lần **gửi tay**: `notification_manual_batch.send` (kể cả việc bật Force send).',
        ],
      },
    ],
  },

  'notification-templates': {
    logic: [
      'Mẫu nội dung dùng chung cho các quy tắc tự động và các lần gửi tay — **và** là nơi giữ câu chữ của **mười email giao dịch** mà svn-be tự gửi.',
      'Mẫu **tách khỏi** quy tắc: một mẫu dùng cho nhiều quy tắc.',
      'Mỗi mẫu có **Name** (tên người đọc, đổi thoải mái — là thứ các ô chọn hiện) và **Code** (khoá cố định mà code svn-be cầm). **Code không nên đổi.**',
      'Một mẫu giữ **phần thông điệp**, không phải cả email: khung chung — thanh màu thương hiệu, thẻ, dòng chân *“© Saramin. Email tự động — vui lòng không trả lời.”* — do server bọc ngoài lúc gửi, **muốn đổi phải deploy** (D-NOTI-18). Nội dung dán vào là một tài liệu HTML đầy đủ (bắt đầu bằng `<!doctype` / `<html>`) thì được gửi nguyên, không bọc lần nữa.',
      '**Ba ngôn ngữ đều bắt buộc** ở đây (tiêu đề + nội dung VI/EN/KO) — khác quy tắc và gửi tay, nơi chỉ VI là bắt buộc.',
      'Mẫu mở ra **trang riêng** (không phải drawer): sáu ô ngôn ngữ cộng bốn ô khác là một form cần cuộn, và nội dung email cần bề ngang.',
    ],
    how: [
      '**New template** → *Name* · *Code* · *Channel* (Email) · *Active* → phần Message: mỗi tab ngôn ngữ chứa **tiêu đề và nội dung của ngôn ngữ đó** → **Refresh preview** → lưu.',
      'Ô nội dung có công tắc **Rich text | HTML source**. Mẫu dựng bằng bảng HTML (mọi email giao dịch) phải sửa ở **HTML source** — trình soạn rich text không hiểu `<table>`, lưu từ đó sẽ **xoá bố cục**.',
      'Bảng biến luôn hiện phía trên các tab: bấm một biến là **chèn vào đúng chỗ con trỏ** (ô tiêu đề hoặc nội dung vừa focus); chưa focus ô nào thì bấm là **sao chép**.',
      'Phần xem trước do **server dựng** bằng đúng bộ thay biến lúc gửi, theo tab ngôn ngữ đang mở. Biến không ai điền được liệt kê ở *“Nothing fills these variables, so they will go out as written”* — thường là gõ sai.',
      'Ngừng dùng một mẫu: kebab ⋮ → **Deactivate** (bật lại: *Reactivate*). Xoá chỉ được khi không còn quy tắc hay lô gửi tay nào trỏ tới.',
    ],
    watch: [
      'Sửa một mẫu là đổi nội dung của **mọi** quy tắc đang dùng nó — kiểm trước xem có những quy tắc nào.',
      '**Đổi Code của một mẫu giao dịch = email đó lặng lẽ quay về bản mặc định trong code**: svn-be tìm theo code, không thấy thì dùng file gốc, gửi một email trông hoàn hảo — và chỉnh sửa của bạn không bao giờ hiện ra. Form cảnh báo: *“Changing it can break places that use this template.”*',
      '**Deactivate mười email giao dịch không tắt được chúng** — chúng không đi qua quy tắc (D-NOTI-17). Chỉ sửa câu chữ.',
      'Xoá một mẫu đang được dùng → bị từ chối (409): *“A template still used by a rule or manual send can’t be deleted — turn it off instead.”* Code trùng → 409.',
      'Bản EN/KO bắt buộc soạn nhưng **hiện chỉ bản VI được gửi** (D-NOTI-13).',
      'Tạo / sửa / xoá mẫu **không ghi vào Audit log**.',
    ],
    blocks: [
      { kind: 'p', text: `Đối chiếu với build: ${CHECKED}.` },
      {
        kind: 'table',
        heading: 'Bảng danh sách',
        cols: ['Cột', 'Đọc thế nào'],
        rows: [
          ['*Name*', 'Tên hiện trong các ô chọn mẫu'],
          ['*Code*', 'Khoá cố định code svn-be cầm (ví dụ `ntpl_recruitment_application_received`)'],
          ['*Channel*', 'Hôm nay chỉ tạo được Email'],
          ['*Subject (EN)*', 'Tiêu đề tiếng Anh'],
          ['*State*', '*Active* hoặc *Retired* — chỉ đọc; đổi bằng kebab *Deactivate / Reactivate*'],
        ],
      },
      {
        kind: 'table',
        heading: 'Trạng thái một mẫu',
        cols: ['Trạng thái', 'Nghĩa', 'Hệ quả'],
        rows: [
          ['*Active*', 'Dùng được', 'Hiện trong ô chọn của quy tắc và gửi tay'],
          ['*Retired*', 'Đã tắt, vẫn giữ', 'Không chọn mới được. Quy tắc đang trỏ tới → mỗi lần bắn là một dòng *Skipped — Template turned off*. Lô gửi tay đang chạy → thất bại'],
        ],
      },
      {
        kind: 'list',
        heading: 'Mười email giao dịch có mẫu ở đây (sửa câu chữ, không tắt được)',
        items: [
          'Ứng viên: **xác minh email** · **đặt lại mật khẩu** · **đã đổi mật khẩu**.',
          'Nhà tuyển dụng tự đăng ký: **xác minh** · **được duyệt** · **bị từ chối** · **đặt mật khẩu lần đầu** · **đã đổi mật khẩu**.',
          'Nhân viên Saramin: **lời mời admin**.',
          'Khách hàng: **báo quota tìm CV sắp hết hạn**.',
        ],
      },
      {
        kind: 'list',
        heading: 'Biến (`{{token}}`) — bảng biến chỉ hiện những biến hợp với sự kiện / mẫu đang soạn',
        items: [
          '**Người nhận**: `memberName` · `email` · `joinedAt` · `lastActiveAt`.',
          '**Đơn ứng tuyển**: `applicationStatus` (chặng) · `jobTitle` · `companyName` · `applicationLink`.',
          '**Tổng hợp**: `applicationSummary` · `applicationCount` · `jobList` · `jobCount`.',
          '**Tin đăng**: `publishedAt` · `expiresAt` · `daysLeft` · `viewCount` · `applyCount` · `applicantName` · `employerLink`.',
          '**Hành động / sự kiện**: `actionLink` · `personName` · `name` · `changedAt` · `deletedAt` · `reasonBlock`.',
          '**Gói**: `packageName` · `productCode` · `remaining` · `days`.',
          'Biến gõ sai **không gây lỗi** — nó được gửi đi **nguyên văn** (`{{memberNam}}` hiện ra trong email). Đó là lý do phải đọc dòng cảnh báo của phần xem trước.',
        ],
      },
    ],
  },

  'zalo-templates': {
    logic: [
      'Ràng buộc mẫu **Zalo ZNS** theo từng hành động. Mỗi dòng = **một hành động** svn-be có thể gửi Zalo, và ba thứ operator ghi: **Template ID** (Zalo cấp), **Parameter mapping** (tên tham số của mẫu → trường dữ liệu svn-be điền), và **Enabled**. Lưu theo từng dòng.',
      '**Không soạn mẫu ở đây.** ZNS gửi theo mã mẫu, không bao giờ gửi chữ tự do; mọi mẫu được viết và **duyệt trong cổng của Zalo, mất 3–5 ngày làm việc**, không API nào bỏ qua được. Thứ tới màn hình này chỉ là một mã và một danh sách tham số.',
      '**14 hành động seed sẵn**: bốn **OTP** (`otp.signup` · `otp.login` · `otp.password_reset` · `otp.delete_account`) và **mười mã sự kiện thông báo** của ứng viên / NTD (`application.submitted`, `job.alert`…). Mọi dòng seed **khởi đầu tắt**.',
      '**Chỉ ba dòng OTP thật sự được dùng** (khi môi trường nối Zalo): `otp.signup` (đăng ký), `otp.password_reset` (khôi phục), `otp.delete_account` (xoá tài khoản). `otp.login` được seed nhưng không chỗ nào trong svn-be gọi tới. Mười dòng sự kiện **cấu hình được nhưng chưa gửi gì**: bộ gửi thông báo chưa có kênh Zalo (svn-be D-ZALO-2).',
      '**New action** tạo một khoá hành động riêng, gắn tag **Custom** (*“Custom action — nothing is sent for it yet.”*) — chỉ có ích khi một bản phát hành svn-be sau này gọi tới đúng khoá đó. Dòng Custom xoá được; dòng có sẵn chỉ tắt được.',
      '**Thẻ trạng thái kết nối** ở đầu trang: *Provider* (*Not configured* = `none`, hoặc *ZNS*) · *Official Account* (che bớt) · *Token valid until* · *Last token refresh* · *Last reported error*. Nút **Re-authorise** cài một cặp token mới khi chuỗi token bị gãy.',
    ],
    how: [
      'Viết mẫu và gửi duyệt **trong cổng Zalo** → chờ duyệt (3–5 ngày làm việc).',
      'Có mã: điền **Template ID** trên đúng dòng hành động → khai **Parameter mapping** (tên tham số Zalo đã duyệt → trường nguồn; để trống `{}` = “tên hai bên đã khớp”) → **Save** trên dòng.',
      'Kebab ⋮ → **Send a test** tới máy của chính mình — đây là **tin thật, tốn tiền** → đọc kết quả (bảng dưới).',
      'Chỉ khi test *Sent* mới bật **Enabled** → Save.',
      'Thẻ trạng thái báo lỗi token (*Last reported error*) → **Re-authorise** với cặp access/refresh token vừa lấy từ màn đồng ý OAuth của Zalo.',
    ],
    watch: [
      'Mẫu phải được Zalo duyệt trước; hệ thống không tạo mẫu hộ.',
      '**Enabled cần Template ID** — công tắc bị khoá khi ô mã trống (*“Set a template ID first — Zalo has nothing to send without one.”*); xoá mã thì dòng tự tắt.',
      'Test gửi theo **dòng đã lưu**, không theo bản đang sửa. Mỗi lần bấm là **một tin bị tính tiền**; tối đa **5 lần / phút / tài khoản admin**.',
      'Tên tham số khớp **chính xác từng ký tự** với mẫu Zalo — khoảng trắng thừa bị cắt khi lưu; hai dòng mapping trùng tên thì không cho lưu.',
      'Tin Zalo **không có trong Delivery history** — màn này là cấu hình, không phải nhật ký.',
      'Quyền: `zalo_template:read` để xem; `zalo_template:write` để lưu, test và Re-authorise. Seed chỉ cấp cho **HQ Admin** — không ai khác thấy mục menu này.',
    ],
    blocks: [
      { kind: 'p', text: `Đối chiếu với build: ${CHECKED}.` },
      {
        kind: 'warn',
        text: '**Từ 08/10/2026 (SRM-903 — svn-web PR #633, svn-be PR #779): ứng viên đăng ký CHỈ bằng OTP Zalo.** Đăng ký thường và hoàn tất đăng ký qua Google/Facebook đều **bắt buộc** chứng minh số điện thoại bằng OTP Zalo; lựa chọn “tôi sống ở nước ngoài” và OTP qua email lúc đăng ký đã bị bỏ. Nghĩa là trên môi trường chạy Zalo thật (`provider = zns`), dòng **`otp.signup` phải có Template ID và đang Enabled** — tắt nó (hoặc mã sai) là **không ứng viên mới nào đăng ký được**. Quên mật khẩu và xoá tài khoản vẫn giữ cả hai đường điện thoại / email.',
      },
      {
        kind: 'table',
        heading: 'Quy trình duyệt mẫu ZNS — trạng thái một dòng',
        cols: ['Trạng thái dòng', 'Nghĩa', 'Vào bằng cách', 'Làm gì tiếp'],
        rows: [
          ['*Not configured*', 'Chưa có Template ID; *Last updated* ghi *“This binding has never been saved from this screen.”*', 'Mặc định của mọi dòng seed', 'Gửi mẫu lên cổng Zalo, chờ duyệt'],
          ['Có mã, *Enabled* tắt', 'Đã ghi mã và mapping, chưa gửi', 'Điền mã + Save', 'Send a test'],
          ['Có mã, *Enabled* bật', 'Hành động này gửi Zalo (chỉ với dòng OTP; dòng sự kiện vẫn chưa nối)', 'Bật Enabled + Save', 'Theo dõi *Last reported error* trên thẻ trạng thái'],
          ['*Custom*', 'Khoá do operator tạo — không gì gửi cho tới khi svn-be dùng nó', '*New action*', 'Ghi sẵn mã; xoá được'],
        ],
      },
      {
        kind: 'table',
        heading: 'Kết quả một lần Send a test (luôn HTTP 200 — đọc chip, không đọc toast)',
        cols: ['Kết quả', 'Nghĩa', 'Làm gì'],
        rows: [
          ['*Sent*', 'Zalo đã nhận tin', 'Kiểm máy; nếu đúng thì bật Enabled'],
          ['*Failed — retryable*', 'Lỗi tạm thời (giới hạn tốc độ, đường truyền)', 'Thử lại sau — mỗi lần là một tin tính tiền nữa'],
          ['*Blocked — balance or quota*', 'Hết số dư trả trước ZBS, hoặc hết hạn mức ngày/tháng. **Không tự thử lại**', 'Nạp tiền hoặc chờ hạn mức reset. Lý do cũng hiện ở *Last reported error*'],
          ['*Failed — permanent*', 'Số không nhận được ZNS, mẫu cấu hình sai, hoặc OA thiếu quyền', 'Kiểm Template ID, tên tham số, số điện thoại'],
          ['*Not configured*', '**Không phải lỗi**: provider là `none` hoặc dòng chưa Enabled — không gì được gửi', 'Bình thường trên môi trường chưa nối Zalo'],
        ],
      },
      {
        kind: 'table',
        heading: 'Kiểm tra khi lưu (svn-be trả 400 nếu vượt)',
        cols: ['Ô', 'Luật'],
        rows: [
          ['Template ID', '≤ 64 ký tự, chỉ `A–Z a–z 0–9 _ -`'],
          ['Parameter mapping', '≤ 20 dòng; mỗi tên tham số và trường nguồn ≤ 64 ký tự; không trùng tên'],
          ['Enabled', 'Bật mà không có Template ID → 400'],
          ['Số điện thoại test', 'Màn hình nhận `0xxxxxxxxx` / `84xxxxxxxxx` / `+84xxxxxxxxx` (9 chữ số thuê bao); hộp xác nhận nhắc lại số đã chuẩn hoá'],
        ],
      },
      {
        kind: 'list',
        heading: 'Ghi vào Audit log',
        items: [
          '`zalo_template.update` mỗi lần lưu một dòng · `zalo_template.create` / `.delete` cho dòng Custom.',
          '`zalo.template_test` mỗi lần test · `zalo.token_seed` khi cài cặp token.',
        ],
      },
      {
        kind: 'open',
        text: 'Môi trường nào đang chạy `provider = zns` với số dư thật **chưa xác minh** từ code (mặc định cấu hình là `none`; tài liệu admin `docs/features/zalo-templates.md` vẫn ghi “trơ ở mọi môi trường” trong khi svn-be 18/09 đã sửa lại câu “chưa từng nói chuyện với Zalo”). Trước khi SRM-903 lên production cần xác nhận: OA đã xác minh doanh nghiệp, mẫu `otp.signup` đã được duyệt và Enabled, số dư ZBS đủ. Tài liệu admin cũng còn ghi “13 hành động” — build có **14** (thêm `otp.delete_account`).',
      },
    ],
  },

  /* ── System ──────────────────────────────────────────────────────────────── */
  'general-settings': {
    logic: [
      'Một mục menu, **hai tab**: **Recommended job** (trọng số gợi ý việc) và **Currency** (tỉ giá USD→VND). Hai tab cùng đọc một bản ghi ở server nhưng **lưu riêng từng nửa**. Tab đang mở nằm trên URL (`?tab=recommended-jobs` / `?tab=currency`).',
      '**Không sửa tại chỗ — mỗi lần Publish là một phiên bản mới.** Mỗi điểm gợi ý lưu kèm phiên bản trọng số đã sinh ra nó, nên câu hỏi “vì sao điểm khớp tụt từ 92 xuống 84” vẫn trả lời được nhiều tháng sau. Không có nút xoá hay hoàn tác: muốn quay lại thì Publish lại bộ số cũ (thành phiên bản mới).',
      '**Bảy tín hiệu, tổng đúng 100 điểm.** Server từ chối bộ số không tròn 100; tổng chạy hiện liên tục và nút *Publish new version* bị khoá cho tới khi đủ 100.',
      'Tỉ giá **chỉ dùng cho tín hiệu lương của gợi ý việc**: so lương mong muốn của ứng viên với khung lương tin đăng khi hai bên khác đơn vị tiền.',
      'Ba đường dẫn cũ vẫn chuyển hướng về đây: `/system/matching-settings`, `/system/recommended-jobs`, `/system/currency`.',
    ],
    how: [
      '**Recommended job**: sửa điểm từng tín hiệu (đọc gợi ý dưới mỗi ô) → khi tổng = 100/100 → **Publish new version** → xác nhận *“Scores computed from now on use these weights. A published version cannot be edited.”*',
      '**Currency**: gõ số đồng cho 1 USD (tối thiểu 1) → **Publish new rate** → xác nhận *“Salary comparisons from now on use 1 USD = {rate} ₫.”*',
    ],
    watch: [
      'Đổi trọng số / tỉ giá chỉ áp cho **điểm tính từ giờ trở đi** — điểm đã tính giữ phiên bản cũ.',
      'Chưa từng publish tỉ giá thì ô hiện chip *none*: tín hiệu lương **không so được hai đơn vị tiền và cho trọn điểm** — an toàn nhưng mù.',
      'Quyền: `matching_settings:read` để mở, `matching_settings:update` để publish; seed chỉ **HQ Admin**. Một quyền cho cả hai tab.',
      'Publish **không ghi vào Audit log** — lịch sử nằm ở các phiên bản đã lưu, hiện **không có màn hình xem lại**.',
    ],
    blocks: [
      { kind: 'p', text: `Đối chiếu với build: ${CHECKED}.` },
      {
        kind: 'table',
        heading: 'Bảy tín hiệu gợi ý việc (bộ mặc định v3)',
        note: 'Thứ tự trên màn hình là thứ tự độ lớn. Tín hiệu thứ tám *Foreign language* đã bỏ ở v3: tin đăng không có trường yêu cầu ngoại ngữ, nên nó luôn ra 0 — 2 điểm của nó chuyển sang Category/Role.',
        cols: ['Tín hiệu (nhãn trên màn hình)', 'Mặc định', 'Tính thế nào'],
        rows: [
          ['*Skills*', '20', 'Tỉ lệ kỹ năng tin yêu cầu mà CV có. Tin không liệt kê kỹ năng thì điểm chia cho các tín hiệu khác'],
          ['*Years of experience + level*', '22', 'Trọn điểm khi nằm trong khung năm kinh nghiệm của tin, giảm dần dưới mức tối thiểu; tin không có khung thì so cấp bậc'],
          ['*Location + work type*', '21', 'Thành phố ứng viên muốn, hoặc remote khi cả hai bên chấp nhận'],
          ['*Desired job role + category*', '20', 'Đúng vai trò ứng viên chọn; chỉ khớp nhóm ngành thì được một nửa'],
          ['*Expected salary*', '9', 'Mức lương mong muốn nằm trong khung lương tin — **đổi tiền trước** nếu khác đơn vị, bằng tỉ giá tab Currency'],
          ['*Industry*', '5', 'Ngành ứng viên muốn; ngành lân cận được một phần'],
          ['*Education level*', '3', 'Bằng hoặc cao hơn yêu cầu của tin'],
        ],
      },
      {
        kind: 'warn',
        text: '**Tỉ giá ở đây KHÔNG đổi sắp xếp / lọc lương trên trang tìm việc.** Khoá sắp xếp lương của tin đăng dùng một **hằng số cấu hình riêng** của svn-be (`svn.recruitment.salary.usd-to-vnd`, mặc định 25.000, tính lúc lưu tin — D-SAL-2), và công cụ quy đổi lương / tìm ứng viên phía NTD dùng nguồn tỉ giá khác nữa. Đổi số trên tab Currency chỉ đổi **gợi ý việc**. (Bản cũ của trang này nói chung chung “ảnh hưởng cách hệ thống so sánh mức lương” — chính xác là chỉ phần gợi ý.)',
      },
    ],
  },

  'company-information': {
    logic: [
      'Pháp nhân **của chính Saramin** — bên bán, bên phát hành hoá đơn. Một bản ghi duy nhất, là cấu hình chứ không phải danh sách. Menu gọi trang này là **Issuer identity**.',
      'Mọi thứ phần đầu báo giá, đơn hàng (PO) và hoá đơn GTGT nói về **chúng ta**: tên pháp lý **VI và EN**, hai địa chỉ, **MST của Saramin**, logo, các mặc định chứng từ, tài khoản ngân hàng khách chuyển tiền vào.',
      '**Lưu là thêm một phiên bản, không ghi đè.** Mỗi chứng từ giữ đúng phiên bản nó được đóng dấu: báo giá lúc **gửi**, PO lúc **phát hành**, hoá đơn lúc **phát hành**. Sửa trang này **không bao giờ** đổi thứ khách đã nhận — báo giá một năm trước in lại vẫn y hệt.',
      '**Thiếu thông tin là trạng thái bình thường**: form lưu được dù chưa đủ. Nhưng trang hiện băng **“Incomplete — blocks invoicing”** và **liệt kê ô còn thiếu**; lúc đó phát hành hoá đơn GTGT bị từ chối (409) **trước khi cấp số hoá đơn** — không đốt số.',
      'Phần **Customer center** (hotline, giờ làm việc, dòng liên hệ của bộ phận CS) nằm chung màn hình nhưng **không thuộc bản ghi có phiên bản** — đổi hotline không phải đổi pháp nhân. Nó in trên các trang phía nhà tuyển dụng (card trợ giúp, rail console, billing).',
    ],
    how: [
      'Sửa các ô cần đổi → **Save**. Toast *“Saved as a new version. Documents already sent are unchanged.”*; rail bên phải hiện **Version N** và *Updated at*.',
      'Chỉ sửa Customer center thì **không sinh phiên bản mới** — toast *“Customer center updated.”*',
      'Nhìn khung **LETTERHEAD PREVIEW** ở đầu trang để thấy đúng thứ sẽ in.',
    ],
    watch: [
      'Đây **không phải** hồ sơ khách hàng. Sai ở đây là sai trên mọi hoá đơn xuất ra **từ lúc lưu**.',
      'Đổi **VAT rate** chỉ áp cho **chứng từ mới**; chứng từ đã gửi giữ thuế suất của nó. Tiền đi theo **báo giá**, nên một PO mới có thể in tiêu đề thư mới mà vẫn mang thuế suất cũ của báo giá — đúng, không phải lỗi.',
      'Logo: **PNG hoặc WEBP**, tối đa 400 KB, nền trong, kích thước 2× — **SVG bị từ chối** (có thể mang script).',
      'Quyền: `system_settings:read` để xem, `system_settings:update` để lưu — seed chỉ **HQ Admin**.',
    ],
    blocks: [
      { kind: 'p', text: `Đối chiếu với build: ${CHECKED}.` },
      {
        kind: 'table',
        heading: 'Các ô và nơi chúng hiện ra',
        cols: ['Phần', 'Ô', 'Ghi chú'],
        rows: [
          ['*Legal identity*', 'Tên công ty VI · Company name EN', 'Dòng 1 và dòng 2 tiêu đề thư — **luôn in cả hai**. **Bắt buộc để xuất hoá đơn**'],
          ['', 'Mã số thuế / Tax code', 'MST **của Saramin**, không phải của khách. **Bắt buộc để xuất hoá đơn**'],
          ['', 'Địa chỉ VI · Address EN · Website', 'Hai địa chỉ **bắt buộc để xuất hoá đơn**'],
          ['*Brand*', 'Logo', 'PNG/WEBP, ≤ 400 KB'],
          ['*Document defaults*', 'VAT rate', 'Áp cho chứng từ mới'],
          ['', 'Quotation validity', 'Chỉ có *End of month*: báo giá hết hiệu lực ngày cuối tháng nó được lập'],
          ['', 'Support email', 'In ở điều khoản 6 của T&C'],
          ['', 'Quotation no. / Sales order no. format', '**Chỉ đọc** — định dạng số chứng từ do ràng buộc DB quyết định'],
          ['*Bank details*', 'Ngân hàng · Số tài khoản · Chủ tài khoản', 'In trên **đơn hàng (PO)**, không trên hoá đơn — điều khoản mặc định là trả trước 100%. **Cả ba bắt buộc để xuất hoá đơn**'],
          ['*Customer center*', 'Phone (≤ 64) · Opening hours (≤ 255) · Contact line (≤ 1000)', 'Không có phiên bản; mọi ô tuỳ chọn, ô trống thì không in'],
        ],
      },
      {
        kind: 'example',
        heading: 'Đổi tài khoản ngân hàng giữa tháng',
        scenario: 'Kế toán đổi số tài khoản nhận tiền. Bản ghi đang ở Version 3.',
        cols: ['Thời điểm', 'Chứng từ', 'In thông tin ngân hàng nào'],
        rows: [
          ['Trước khi lưu', 'PO-005866 đã phát hành', 'Version 3 — **mãi mãi**, kể cả mở lại sau này'],
          ['Lưu', 'Bản ghi thành Version 4; Audit log ghi `seller_profile.replace`', '—'],
          ['Sau khi lưu', 'PO mới phát hành', 'Version 4 — số tài khoản mới'],
          ['Sau khi lưu', 'Báo giá lập tuần trước, giờ mới **gửi**', 'Version 4 — báo giá được đóng dấu lúc gửi, không lúc lập'],
        ],
      },
      {
        kind: 'warn',
        text: '**Sửa so với bản cũ của trang này.** ① Trang **không có màn hình lịch sử thay đổi** — chỉ hiện số phiên bản hiện tại và thời điểm cập nhật (svn-be có API lịch sử nhưng màn hình không dùng). Muốn biết ai đổi gì: lọc Audit log theo entity `seller_profile`. ② Ô **“Discount needing approval”** đã bị bỏ khỏi màn hình ngày 02/10/2026 (`docs/features/company-information.md` của admin vẫn còn nhắc).',
      },
      {
        kind: 'open',
        text: 'Tài liệu admin còn ghi “PDF export vẫn tắt”, nhưng trang chi tiết PO hiện đã có nút PDF cho PO và hoá đơn. PDF có in theo **phiên bản đã đóng dấu** của chứng từ như màn hình chi tiết hay không — **chưa xác minh**.',
      },
    ],
  },

  'membership-tiers': {
    logic: [
      '**Đã làm thật, không phải trang giữ chỗ.** Đây là chương trình *Khách hàng thân thiết* (SRM-186): **một bậc thang duy nhất, dùng mãi**, sáu hạng cố định. Màn hình chỉ sửa đúng hai thứ: **ngưỡng “From” của từng hạng** và **ghi chú quyền lợi**.',
      '**Hạng của một công ty không ai đặt tay được** — kể cả admin, kể cả qua API. Nó được **tính ra** từ tổng tiền trên các **hoá đơn GTGT đã phát hành** của chính công ty đó trong **năm dương lịch** (giờ VN), bỏ qua hoàn tiền. Muốn một khách lên hạng: sửa ngưỡng, hoặc chờ hoá đơn.',
      '**00:00 ngày 01/01 mọi bộ đếm về 0.** Khách Kim Cương bước sang năm mới với hạng trống; năm cũ vẫn đọc được, không bao giờ bị tính lại.',
      '**“Up to” không phải ô nhập** — nó đọc từ ngưỡng của hạng kế tiếp, nên khe hở hay chồng lấn là thứ bảng không thể có. Hạng cao nhất không có trần (*no limit*).',
      'Cột **Companies in this tier** đếm lại **theo ngưỡng đang gõ, trước khi lưu** — để thấy một thay đổi ngưỡng làm ai đổi hạng **trước** khi cam kết. Số cũ mờ đi trong lúc tính số mới.',
      '**Benefits by tier** là **ghi chú cho CS**, không phải quyền được cấp: hệ thống **không tự cấp, không tự trừ** quyền lợi nào. (Khác với danh mục *Benefits* của tin tuyển dụng ở Master data.)',
    ],
    how: [
      'Sửa ô **From (accumulated ≥)** của hạng cần đổi → đọc cột *Companies in this tier* đổi theo → sửa ghi chú quyền lợi nếu cần → **Save**. *Discard changes* bỏ toàn bộ bản nháp.',
      'Rời trang khi chưa lưu → có hộp nhắc. Không có tự lưu.',
      'Xem hạng của một khách: **CRM → hồ sơ công ty** (thẻ hạng: hạng, số đã tích luỹ, thanh tiến độ “còn X ₫ → hạng kế”), cột *Tier* và bộ lọc hạng trên danh sách Customers.',
    ],
    watch: [
      'Ngưỡng phải **tăng nghiêm ngặt** từ trên xuống — bằng nhau cũng bị từ chối; khi bảng chưa tăng dần, cột đếm không được tính.',
      'Hai người cùng sửa: lần lưu thứ hai bị từ chối nguyên khối — *“Configuration was changed by someone else. Reload.”* Không có gộp.',
      '**Lưu ngưỡng không đổi hạng công ty ngay.** Hạng được tính lại khi **có hoá đơn được phát hành**, khi **svn-be khởi động lại**, và **mỗi đêm 00:20** — mỗi lần là tính lại toàn bộ. Chip hạng trên CRM có thể chậm tới đêm đó.',
      'Quyền: xem `membership_programme:read` (seed: HQ Admin, Team leader, VN Sales — sale cần thấy bậc thang mình đang chào); lưu `membership_programme:update` — **chỉ HQ Admin**.',
    ],
    blocks: [
      { kind: 'p', text: `Đối chiếu với build: ${CHECKED}; logic theo svn-be \`docs/crm-company/membership-tier.md\`.` },
      {
        kind: 'table',
        heading: 'Sáu hạng cố định — không thêm, không xoá, không đổi tên',
        note: 'Ngưỡng là giá trị **khởi tạo** (V226); CS sửa được. Đổi tên một hạng sẽ âm thầm đổi nghĩa mọi báo cáo cũ, nên tên bị khoá.',
        cols: ['Mã', 'Danh hiệu', 'Từ (tích luỹ ≥)', 'Ghi chú'],
        rows: [
          ['`UNTIERED`', 'Chưa có hạng', '0 ₫ (cố định)', 'Trạng thái thật của phần lớn khách mỗi tháng Một — **không có badge** cạnh tên công ty'],
          ['`MEMBER`', 'Thành viên', '30.000.000 ₫', ''],
          ['`BRONZE`', 'Đồng', '50.000.000 ₫', ''],
          ['`SILVER`', 'Bạc', '100.000.000 ₫', ''],
          ['`GOLD`', 'Vàng', '200.000.000 ₫', ''],
          ['`DIAMOND`', 'Kim Cương', '300.000.000 ₫', 'Không có trần'],
        ],
      },
      {
        kind: 'example',
        heading: 'Nâng ngưỡng Bạc giữa năm',
        scenario: 'Công ty A có hai hoá đơn đã phát hành trong năm: 70.000.000 ₫ và 45.000.000 ₫. Ngưỡng Bạc đang là 100.000.000 ₫.',
        cols: ['Bước', 'Việc', 'Hạng của A'],
        rows: [
          ['1', 'Hoá đơn thứ hai được phát hành → tính lại ngay', 'Tích luỹ 115.000.000 ₫ → **Bạc**'],
          ['2', 'HQ Admin gõ ngưỡng Bạc = 120.000.000 ₫ (chưa lưu)', 'Cột đếm: hạng Bạc **giảm 1**, hạng Đồng **tăng 1** — A sẽ rơi xuống'],
          ['3', 'Save → Audit log ghi `membership_programme.save` kèm ngưỡng trước / sau', 'Vẫn hiện **Bạc** cho tới lần tính lại kế tiếp'],
          ['4', '00:20 đêm đó (hoặc hoá đơn kế tiếp của bất kỳ khách nào)', '**Đồng**'],
          ['5', '01/01 năm sau', '**Chưa có hạng**; năm cũ vẫn ghi Đồng'],
        ],
      },
      {
        kind: 'open',
        text: '**Cố ý chưa làm** (svn-be §13): dồn doanh thu công ty con về công ty mẹ · hoàn tiền trừ tích luỹ · tính theo tiền đã thu hay theo PO · ghi đè hạng cho từng khách · quyền lợi có cấu trúc / tự cấp. Tên chương trình cũng không sửa được trên màn hình.',
      },
    ],
  },

  'master-data': {
    logic: [
      'Master data là các **danh mục dùng chung toàn hệ thống**: ngành nghề, kỹ năng, khu vực, cấp bậc, loại hợp đồng… Các ô chọn ở **form tin đăng, hồ sơ công ty (CRM), đăng ký / hồ sơ ứng viên và bộ lọc tìm CV** đều đọc từ đây. **Mọi module khác chỉ đọc** — muốn sửa danh mục thì sửa ở Master data.',
      'Mỗi tab là một danh mục, và **mỗi danh mục có quyền riêng** (`job_category`, `skill`, `region`…, mỗi quyền gồm `read` / `create` / `update` / `delete`). Thiếu quyền đọc danh mục nào thì **chỉ tab đó bị ẩn**, các tab khác vẫn hiện.',
      'Mọi giá trị có **Code** — **tự điền từ tên EN** theo quy tắc riêng của hệ thống, chỉ gồm chữ thường, số và dấu gạch ngang — ký hiệu như `+`, `#` được **viết thành chữ** (vd *C++* → `c-plus-plus`), nên code không bao giờ chứa ký hiệu; duy nhất, sửa được, trùng thì 409 — và **tên VI, tên EN** (cả hai **bắt buộc**, ở mọi danh mục). Tên **KO** chỉ có ở Skills, Business forms, Education levels, Years of experience, Nationalities. Riêng **Business forms**: Code **bị khóa** sau khi tạo. Với tab dạng cây (Job taxonomy, Industries), Code duy nhất **trong cùng cấp cha**.',
      'Hầu hết danh mục **kéo thả** để xếp thứ tự hiển thị trong ô chọn. Ngoại lệ: **Job levels** — thứ tự đó dùng để **chấm điểm khớp** ứng viên với tin, do svn-be giữ.',
      '**Đổi tên luôn an toàn** với danh mục mà bản ghi lưu **mã**. **Xóa** thì mọi danh mục đều có nút, và hệ thống **không kiểm tra giá trị đang được dùng** — trừ Business forms và Job tags (409). Kết quả xóa phụ thuộc bản ghi lưu **mã** hay lưu **chữ** (§1, bảng *Đổi tên và xóa*).',
      'Không có trạng thái Active / Retired chung. Chỉ **Business forms** có công tắc **Active**.',
    ],
    how: [
      'Chọn tab của danh mục cần sửa → tìm theo Code hoặc tên → *New …* hoặc sửa một dòng. Tab cây (Job taxonomy, Industries) thêm cấp con ngay trên dòng cha.',
      'Kỹ năng bị CV viết khác chính tả: mở dòng trên tab **Skills** → thêm **alias** (chỉ Skills có alias). Gộp 2 kỹ năng trùng nghĩa cũng dùng alias, **không xóa cái này rồi sửa tay cái kia**.',
      'Tab **Missing skills**: đọc gợi ý → **Approve** → chọn *thêm alias* hoặc *tạo kỹ năng mới* → *Add and back-fill* → thông báo số alias thêm, số hồ sơ cập nhật, số CV được nhả.',
      'Sửa hàng loạt: **Import / Export** → tải file → sửa → tải lên → đọc bản **xem trước** (số dòng thêm / sửa / xóa / giữ nguyên) → *Apply*. File Excel tải về có sẵn một sheet **Hướng dẫn** ghi cách điền và cách Import / Export — đọc sheet đó trước khi sửa file.',
    ],
    watch: [
      'Mục menu Master data hiện theo quyền `region:read`. Thiếu quyền một tab thì chỉ tab đó vắng — không phải cả trang hỏng.',
      'Ô tìm kiếm bị **xóa khi chuyển tab** — chữ “react” tìm ở Skills không mang sang Industries, nên bảng không bị trống vì lọc nhầm.',
      'Hai người cùng xếp thứ tự một lúc: người lưu sau nhận *“This list changed while you were reordering…”* và danh sách tự tải lại.',
      'Sửa đơn lẻ một dòng **không ghi Audit log**; Import (`master_data.import`) và duyệt Missing skills (`skill_gap.adopt`) thì có.',
      'Import: **chỉ dòng ghi `delete` ở cột `action` mới bị xóa**. Dòng vắng mặt trong file được giữ nguyên.',
    ],
    blocks: [
      { kind: 'p', text: 'Theo tài liệu *Master data* phiên bản 14/10/2026 (Ngô Thái Nguyên, BA/QA). Mỗi tab: **Logic** trước, **Flow** đi kèm khi tab đó chạm tới nhiều module khác.' },

      /* ── §1 Logic chung ─────────────────────────────────────────────────── */
      { kind: 'h', text: '§1 · Logic chung' },
      {
        kind: 'diagram',
        id: 'md-overview',
        heading: 'Flow tổng quan — một nơi ghi, mọi module chỉ đọc',
      },
      {
        kind: 'table',
        heading: 'Trường dữ liệu',
        cols: ['Trường', 'Logic'],
        rows: [
          ['**Code**', '**Tự điền từ tên EN** theo quy tắc riêng: chữ thường, số và dấu gạch ngang; khoảng trắng thành dấu gạch ngang, và **ký hiệu như `+`, `#` được viết thành chữ** thay vì bị bỏ — nên hai tên chỉ khác nhau ở ký hiệu vẫn ra hai code khác nhau. Ví dụ: *Hotels, Travel and Airlines* → `hotels-travel-and-airlines` · *C++* → `c-plus-plus`. **Duy nhất.** Sửa được; trùng code thì bị từ chối (409). Riêng **Business forms**: code bị khóa sau khi tạo. Với tab dạng cây (Job taxonomy, Industries), code duy nhất trong cùng cấp cha'],
          ['**Tên VI**', '**Bắt buộc**'],
          ['**Tên EN**', '**Bắt buộc**'],
          ['**Tên KO**', 'Chỉ có ở Skills, Business forms, Education levels, Years of experience, Nationalities'],
        ],
      },
      {
        kind: 'table',
        heading: 'Đổi tên và xóa — theo cách bản ghi lưu giá trị',
        note: 'Hệ thống **không kiểm tra giá trị đang được dùng** khi xóa, trừ 2 danh mục (Business forms, Job tags).',
        cols: ['Cách bản ghi lưu giá trị', 'Danh mục', 'Khi xóa', 'Khi đổi tên'],
        rows: [
          ['Lưu **mã**', 'Job taxonomy, Job levels, Job types, Contract types, Education levels, Years of experience, Nationalities, Countries, Company highlights', 'Bản ghi đang dùng **hiện trống**, không khôi phục được', 'Bản ghi hiện tên mới'],
          ['Lưu **chữ** (danh mục chỉ là gợi ý)', 'Industries, Benefits, Skills, Company tags', 'Chữ đã lưu trên bản ghi **giữ nguyên**, chỉ mất gợi ý trong ô chọn', 'Bản ghi cũ giữ chữ cũ'],
          ['**Chặn xóa** khi đang dùng (409)', 'Business forms, Job tags', 'Bị từ chối nếu còn công ty / tin đang dùng', 'Bản ghi hiện tên mới'],
          ['Cây khu vực', 'Locations', 'Các vùng con bị **tách khỏi cha**', 'Bản ghi hiện tên mới'],
        ],
      },
      {
        kind: 'diagram',
        id: 'md-delete',
        heading: 'Khi xóa một giá trị',
      },
      {
        kind: 'list',
        heading: 'Import / Export',
        items: [
          'Import / Export **theo từng danh mục**.',
          '**Danh mục dạng danh sách:** file .xlsx có sẵn dữ liệu hiện tại, gồm các cột `code`, `name_vi`, `name_en`, `name_ko`, `parent_code`, `action`.',
          '**Job taxonomy và Industries** dùng template dạng nhánh 9 cột (§3, §4).',
          'Trước khi lưu, hệ thống **xem trước** số dòng thêm / sửa / xóa / giữ nguyên, rồi mới **Apply**.',
          '**Chỉ dòng ghi `delete` ở cột `action` mới bị xóa.** Dòng vắng mặt trong file được giữ nguyên.',
        ],
      },
      {
        kind: 'table',
        heading: 'Lịch sử thay đổi (Audit log)',
        cols: ['Thao tác', 'Ghi Audit log'],
        rows: [
          ['Sửa đơn lẻ một dòng trên màn hình', '**Không**'],
          ['Import (`master_data.import`)', 'Có'],
          ['Duyệt Missing skills (`skill_gap.adopt`)', 'Có'],
        ],
      },

      /* ── §2 Danh sách tab ───────────────────────────────────────────────── */
      { kind: 'h', text: '§2 · Danh sách tab' },
      {
        kind: 'table',
        heading: '17 tab và nơi chúng được đọc',
        note: 'Thứ tự tab theo chủ đề: phân loại công việc → điều kiện một tin → mô tả ứng viên → mô tả công ty → vị trí.',
        cols: ['#', 'Tab', 'Gồm', 'Đọc ở đâu', 'Xóa giá trị đang dùng'],
        rows: [
          ['1', '**Job taxonomy** (§3)', 'Cây 3 cấp: Category → Group → Role / Specialization', 'Form tin đăng, tìm việc, hồ sơ ứng viên', 'Tin đang dùng mất giá trị'],
          ['2', '**Industries** (§4)', 'Cây 3 cấp: Industry → Group → Item', 'Tin đăng, công ty', 'Chỉ mất gợi ý'],
          ['3', '**Job levels** (§5)', 'Cấp bậc', 'Form tin, chấm điểm khớp', 'Tin mất giá trị. **Không kéo thả**'],
          ['4', '**Job types** (§6)', 'Hình thức làm việc', 'Form tin', 'Tin mất giá trị'],
          ['5', '**Contract types** (§7)', 'Loại hợp đồng', 'Form tin', 'Tin mất giá trị'],
          ['6', '**Benefits** (§8)', 'Phúc lợi của một tin', 'Form tin', 'Chữ đã lưu giữ nguyên, chỉ mất gợi ý'],
          ['7', '**Skills** (§9)', 'Kỹ năng, có tên KO và alias', 'Form tin, CV, đọc CV, sàng CV', 'Chỉ mất gợi ý'],
          ['8', '**Missing skills** (§10)', 'Kỹ năng có trong CV thật nhưng danh mục chưa có', 'Duyệt để thêm vào Skills', '—'],
          ['9', '**Company tags** (§11)', 'Thẻ công ty', 'Form *New company* của CRM', 'Chỉ mất gợi ý'],
          ['10', '**Company highlights** (§12)', '76 chip trong 12 nhóm, có ưu tiên', 'Dải so sánh trên trang công ty', 'Xóa được'],
          ['11', '**Countries** (§13)', 'Quốc gia', 'Ô quốc tịch / Country trên form công ty của CRM', 'Xóa được'],
          ['12', '**Business forms** (§14)', 'Loại hình doanh nghiệp, có công tắc *Active*', 'Ô *Business form* trên trang công ty', '**Bị từ chối (409)** khi còn công ty dùng'],
          ['13', '**Job tags** (§15)', 'Thẻ góc dưới trái của thẻ tin trả phí: 9 nhóm, 68 thẻ', 'Ô *Card tag* trên form tin', '**Bị từ chối (409)** khi tin đã đăng còn dùng'],
          ['14', '**Education levels** (§16)', 'Trình độ học vấn', 'Đăng ký / hồ sơ ứng viên, bộ lọc tìm CV, form tin', 'Xóa được'],
          ['15', '**Years of experience** (§17)', 'Số năm kinh nghiệm', 'Đăng ký / hồ sơ ứng viên, bộ lọc tìm CV, form tin', 'Xóa được'],
          ['16', '**Nationalities** (§18)', 'Quốc tịch', 'Đăng ký / hồ sơ ứng viên, bộ lọc tìm CV', 'Xóa được'],
          ['17', '**Locations** (§19)', 'Cây khu vực (~3.300 dòng), lọc theo cấp', 'Mọi ô chọn địa điểm', 'Vùng con bị tách khỏi cha'],
        ],
      },

      /* ── §3 Job taxonomy ────────────────────────────────────────────────── */
      { kind: 'h', text: '§3 · Job taxonomy' },
      {
        kind: 'table',
        heading: 'Cấu trúc 3 cấp',
        note: 'Nghề và chuyên môn là **2 Group ngang hàng** dưới cùng 1 Category, không phải Nghề → Chuyên môn. Dữ liệu hiện tại: khoảng **1.075 nhánh**, **21 Category**, **56 tổ hợp Category + Group** nhưng chỉ **13 tên Group khác nhau** — tên Group và Role lặp lại giữa các Category là bình thường.',
        cols: ['Cấp', 'Tên', 'Ví dụ'],
        rows: [
          ['1', 'Category (Ngành nghề)', 'Kế toán, Thuế & Tài chính / Accounting, Taxation, and Finance'],
          ['2', 'Group (Nhóm)', 'Nghề · Vị trí / Jobs / Occupations, Chuyên môn hóa / Specialization, Workplace…'],
          ['3', 'Role / Specialization', 'Nghề hoặc chuyên môn cụ thể, ví dụ Freight forwarder'],
        ],
      },
      {
        kind: 'list',
        heading: 'Quy tắc cấp',
        items: [
          'Category không có cha. Group luôn thuộc 1 Category. Role luôn thuộc 1 Group.',
          'Role **không được làm cha** của mục khác. Không có cấp 4.',
          'Ô Parent hiện **đường dẫn đầy đủ** (ví dụ “Kế toán, Thuế & Tài chính › Nghề · Vị trí”), vì tên Group lặp lại giữa nhiều Category.',
          'Code cấp 2, cấp 3 có thể trùng giữa các nhánh (ví dụ `jobs-occupations`), nên một code chỉ xác định đúng 1 mục khi **đi kèm code của cấp cha**.',
        ],
      },
      {
        kind: 'table',
        heading: 'Thao tác theo cấp',
        cols: ['Dòng', 'Thao tác'],
        rows: [
          ['**Category**', 'Sửa · Thêm Group · Xóa'],
          ['**Group**', 'Sửa · Thêm Role · Xóa'],
          ['**Role**', 'Sửa · Xóa'],
        ],
      },
      {
        kind: 'table',
        heading: 'Liên quan tới module khác',
        cols: ['Module', 'Dùng thế nào'],
        rows: [
          ['**Form tin đăng** (NTD và Admin)', 'Chọn Category trước, rồi Nghề · Vị trí và Chuyên môn thuộc Category đó'],
          ['**Tìm việc phía ứng viên** (“Chọn ngành nghề”)', 'Lọc job theo Category, Group, Role'],
          ['**Hồ sơ ứng viên / Work preference**', 'Ứng viên chọn ngành nghề mong muốn'],
        ],
      },
      {
        kind: 'diagram',
        id: 'md-taxonomy',
        heading: 'Cây dữ liệu và ảnh hưởng của thay đổi tới tin đăng',
        note: 'Tin lưu **mã**, nên đổi tên an toàn. Xóa thì tin đang dùng **mất giá trị** (*“Jobs using it will show no value.”*), không khôi phục được.',
      },
      {
        kind: 'list',
        heading: 'Import / Export — template dạng nhánh',
        items: [
          'File **9 cột**: 3 cột Code (không bắt buộc) và 6 cột tên (EN + VI cho 3 cấp). Mỗi dòng là **một nhánh** Category → Group → Role.',
          'Dòng chỉ có Category = Category chưa có Group. Dòng có Group mà không có Role = Group chưa có Role.',
          'Category, Group lặp lại trên nhiều dòng phải có tên EN và VI **giống hệt** nhau.',
          '**Thứ tự dòng trong file = thứ tự hiển thị.**',
          'Xem trước: báo lỗi theo số dòng, chưa lưu gì. Apply: dòng hợp lệ được lưu, dòng lỗi bị bỏ qua.',
        ],
      },
      {
        kind: 'table',
        heading: 'Cách hệ thống đọc từng dòng',
        cols: ['Trường hợp', 'Kết quả'],
        rows: [
          ['Có Code', 'Tìm mục theo Code (kèm Code cấp cha), cập nhật tên và thứ tự'],
          ['Code trống', 'Tìm mục cùng tên EN hoặc VI trong cùng cấp cha. Có thì dùng lại, không có thì tạo mới và tự sinh Code từ tên EN'],
          ['Code không tồn tại', 'Báo lỗi dòng, không lưu'],
          ['Code của một mục khác', 'Dòng **ghi đè** lên mục mang Code đó'],
          ['Đổi Code cấp 1 / cấp 2 của một dòng', 'Mục được **chuyển** sang nhánh mới'],
          ['Có Code cấp 3 nhưng thiếu Code cấp 2 / cấp 1; có Code cấp 2 nhưng thiếu Code cấp 1', 'Báo lỗi dòng'],
          ['Mục có trong hệ thống nhưng không có trong file', '**Không bị xóa**, bị đẩy xuống cuối cấp cha'],
        ],
      },
      {
        kind: 'diagram',
        id: 'md-taxonomy-import',
        heading: 'Import theo nhánh',
        note: 'Industries dùng đúng logic này, với Industry → Group → Item.',
      },

      /* ── §4 Industries ──────────────────────────────────────────────────── */
      { kind: 'h', text: '§4 · Industries' },
      {
        kind: 'table',
        heading: 'Cấu trúc 3 cấp',
        note: 'Dữ liệu hiện tại: **10 Industry → 67 Group → 664 Item** (khoảng 740 mục).',
        cols: ['Cấp', 'Tên', 'Ví dụ'],
        rows: [
          ['1', 'Industry (Ngành)', 'Ngành dịch vụ / Service (`service`)'],
          ['2', 'Group (Nhóm)', 'Khách sạn, Du lịch và Hãng hàng không (`hotels-travel-and-airlines`)'],
          ['3', 'Item (Mục)', 'khách sạn / hotel (`hotels-travel-and-airlines-hotel`)'],
        ],
      },
      {
        kind: 'list',
        heading: 'Quy tắc',
        items: [
          '**Item không được làm cha.** Ô Parent chỉ cho chọn Industry hoặc Group, mục cấp 3 hiện mờ. Không có cấp 4.',
          'Ô Parent hiện **đường dẫn đầy đủ**, ví dụ “Ngành dịch vụ › Khách sạn, Du lịch và Hãng hàng không”.',
          'Thêm mới qua nút **New ▾**: *New industry*, *New group*, *New item*. **New item** chọn Industry trước, rồi mới chọn Group.',
          'Industries là **gợi ý**: tên VI của mục được lưu thành **chữ** trên tin đăng và công ty. Xóa: chữ đã lưu giữ nguyên, chỉ mất gợi ý. Đổi tên: bản ghi mới dùng tên mới, bản ghi cũ giữ chữ cũ.',
          '**Import / Export:** template dạng nhánh 9 cột, cùng logic với Job taxonomy (§3): Industry → Group → Item.',
        ],
      },
      {
        kind: 'diagram',
        id: 'md-industries',
        heading: 'Industries lưu chữ, không lưu mã',
      },
      {
        kind: 'table',
        heading: 'Chất lượng dữ liệu hiện tại',
        cols: ['Hiện trạng', 'Số lượng'],
        rows: [
          ['Item chưa có tên tiếng Anh (dữ liệu có sẵn — cần bổ sung, vì tên EN là bắt buộc)', '109'],
          ['Cặp Item trùng tên trong cùng 1 Group', '6 cặp'],
          ['Mục chưa có trên cây (ví dụ casino)', '—'],
        ],
      },

      /* ── §5–§19 · một mục cho mỗi tab, theo đúng thứ tự tab ─────────────────
         Mỗi mục dùng cùng một bảng (mdTab) để so các tab với nhau theo cùng các dòng. */
      { kind: 'h', text: '§5 · Job levels' },
      mdTab([
        ['Gồm', 'Cấp bậc'],
        ['Đọc ở đâu', 'Form tin (NTD và Admin) · **chấm điểm khớp** ứng viên với tin'],
        ['Bản ghi lưu', '**Mã**'],
        ['Tên', MD_VI_EN],
        ['Thứ tự', '**Không kéo thả được** — thứ tự cấp bậc là dữ liệu cho việc chấm điểm, do svn-be giữ'],
        ['Xóa', 'Tin đang dùng **mất giá trị**, không khôi phục được'],
        ['Đổi tên', 'Tin tự hiện tên mới'],
        ['Import / Export', MD_LIST_IMPORT],
      ]),

      { kind: 'h', text: '§6 · Job types' },
      mdTab([
        ['Gồm', 'Hình thức làm việc'],
        ['Đọc ở đâu', 'Form tin (NTD và Admin)'],
        ['Bản ghi lưu', '**Mã**'],
        ['Tên', MD_VI_EN],
        ['Thứ tự', MD_DRAG],
        ['Xóa', 'Tin đang dùng **mất giá trị**, không khôi phục được'],
        ['Đổi tên', 'Tin tự hiện tên mới'],
        ['Import / Export', MD_LIST_IMPORT],
      ]),

      { kind: 'h', text: '§7 · Contract types' },
      mdTab([
        ['Gồm', 'Loại hợp đồng'],
        ['Đọc ở đâu', 'Form tin (NTD và Admin)'],
        ['Bản ghi lưu', '**Mã**'],
        ['Tên', MD_VI_EN],
        ['Thứ tự', MD_DRAG],
        ['Xóa', 'Tin đang dùng **mất giá trị**, không khôi phục được'],
        ['Đổi tên', 'Tin tự hiện tên mới'],
        ['Import / Export', MD_LIST_IMPORT],
      ]),

      { kind: 'h', text: '§8 · Benefits' },
      mdTab([
        ['Gồm', 'Phúc lợi của một tin'],
        ['Đọc ở đâu', 'Form tin (NTD và Admin)'],
        ['Bản ghi lưu', '**Chữ** — danh mục chỉ là gợi ý'],
        ['Tên', MD_VI_EN],
        ['Thứ tự', MD_DRAG],
        ['Xóa', 'Chữ đã lưu trên tin **giữ nguyên**, chỉ mất gợi ý trong ô chọn'],
        ['Đổi tên', 'Tin mới dùng tên mới · tin cũ giữ chữ cũ'],
        ['Import / Export', MD_LIST_IMPORT],
      ]),
      {
        kind: 'warn',
        text: 'Đây là *Benefits* của **tin tuyển dụng** — khác với *Benefits by tier* ở Membership programme (ghi chú quyền lợi theo hạng khách hàng).',
      },

      { kind: 'h', text: '§9 · Skills' },
      mdTab([
        ['Gồm', 'Kỹ năng, kèm **alias** (các cách viết khác của cùng một kỹ năng). Chỉ Skills có alias'],
        ['Đọc ở đâu', 'Form tin · CV · **đọc CV / sàng CV**: khi đọc CV, hệ thống so chữ tự do trong CV với danh sách kỹ năng và alias'],
        ['Bản ghi lưu', '**Chữ** — danh mục chỉ là gợi ý'],
        ['Tên', MD_VI_EN_KO],
        ['Thứ tự', MD_DRAG],
        ['Xóa', 'Chỉ mất gợi ý, chữ đã lưu giữ nguyên'],
        ['Đổi tên', 'Bản ghi cũ giữ chữ cũ'],
        ['Import / Export', MD_LIST_IMPORT],
      ]),
      {
        kind: 'list',
        heading: 'Khi nào dùng alias',
        items: [
          'Kỹ năng bị CV viết khác chính tả: **thêm alias** vào kỹ năng đó, không tạo kỹ năng mới.',
          '**Gộp 2 kỹ năng trùng nghĩa:** chuyển một cái thành alias của cái kia, không xóa cái này rồi sửa tay cái kia.',
          'Kỹ năng CV có mà danh mục chưa có: không cần tự dò — chúng hiện ở tab **Missing skills** (§10).',
        ],
      },

      { kind: 'h', text: '§10 · Missing skills' },
      {
        kind: 'table',
        cols: ['Mục', 'Logic'],
        rows: [
          ['**Gồm**', 'Kỹ năng **xuất hiện trong CV thật** (lấy từ CV đã đọc) mà danh mục Skills **chưa có**'],
          ['**Mỗi dòng**', '**Số CV** có kỹ năng đó và **số CV đang bị giữ vì thiếu điều kiện**'],
          ['**Approve**', '2 lựa chọn: thêm thành **alias** của một kỹ năng đã có, hoặc tạo **kỹ năng mới**'],
          ['**Add and back-fill**', 'Trong **cùng một lần**: gắn lại kỹ năng cho các CV liên quan, **sàng lại** các CV đó, nhả các CV đang bị giữ nếu nay đã đủ điều kiện'],
          ['**Thông báo**', 'Số alias thêm · số hồ sơ cập nhật · số CV được nhả'],
          ['**Audit log**', 'Có — `skill_gap.adopt`'],
          ['**Không có**', 'Thêm tay, kéo thả, Import / Export — tab này chỉ để duyệt'],
        ],
      },
      {
        kind: 'diagram',
        id: 'md-missing-skills',
        heading: 'Từ CV được đọc tới CV được nhả',
      },

      { kind: 'h', text: '§11 · Company tags' },
      mdTab([
        ['Gồm', 'Thẻ công ty'],
        ['Đọc ở đâu', 'Form *New company* của CRM'],
        ['Bản ghi lưu', '**Chữ** — danh mục chỉ là gợi ý'],
        ['Tên', MD_VI_EN],
        ['Thứ tự', MD_DRAG],
        ['Xóa', 'Chữ đã lưu trên công ty **giữ nguyên**, chỉ mất gợi ý'],
        ['Đổi tên', 'Công ty cũ giữ chữ cũ'],
        ['Import / Export', MD_LIST_IMPORT],
      ]),

      { kind: 'h', text: '§12 · Company highlights' },
      mdTab([
        ['Gồm', '**76 chip trong 12 nhóm**, có thứ tự ưu tiên'],
        ['Đọc ở đâu', 'Dải so sánh trên trang công ty'],
        ['Bản ghi lưu', '**Mã**'],
        ['Tên', MD_VI_EN],
        ['Thứ tự', MD_DRAG + ' — đây là thứ tự ưu tiên của chip'],
        ['Xóa', 'Xóa được; công ty đang dùng chip đó **hiện trống**, không khôi phục được'],
        ['Đổi tên', 'Trang công ty hiện tên mới'],
        ['Import / Export', MD_LIST_IMPORT],
      ]),

      { kind: 'h', text: '§13 · Countries' },
      mdTab([
        ['Gồm', 'Quốc gia'],
        ['Đọc ở đâu', 'Ô quốc tịch / *Country* trên form công ty của CRM'],
        ['Bản ghi lưu', '**Mã**'],
        ['Tên', MD_VI_EN],
        ['Thứ tự', MD_DRAG],
        ['Xóa', 'Xóa được; công ty đang dùng **hiện trống**, không khôi phục được'],
        ['Đổi tên', 'Công ty hiện tên mới'],
        ['Import / Export', MD_LIST_IMPORT],
      ]),
      {
        kind: 'warn',
        text: '*Countries* (quốc gia của **công ty**) và *Nationalities* (quốc tịch của **ứng viên**, §18) là **hai danh mục riêng** — sửa cái này không đổi cái kia.',
      },

      { kind: 'h', text: '§14 · Business forms' },
      mdTab([
        ['Gồm', 'Loại hình doanh nghiệp'],
        ['Đọc ở đâu', 'Ô *Business form* trên trang công ty'],
        ['Bản ghi lưu', '**Mã**'],
        ['Tên', MD_VI_EN_KO],
        ['Code', '**Bị khóa sau khi tạo** — danh mục duy nhất như vậy'],
        ['Active', 'Có công tắc **Active** — danh mục duy nhất có. Tắt thì không chọn mới được nữa'],
        ['Thứ tự', MD_DRAG],
        ['Xóa', '**Bị từ chối (409)** khi còn công ty dùng'],
        ['Đổi tên', 'Công ty hiện tên mới'],
        ['Import / Export', MD_LIST_IMPORT],
      ]),
      {
        kind: 'list',
        heading: 'Muốn bỏ một loại hình đang có công ty dùng',
        items: [
          '**Chuyển các công ty đó sang loại khác**, rồi mới xóa; hoặc',
          '**Tắt Active** để loại hình không còn trong ô chọn — không cần xóa.',
        ],
      },

      { kind: 'h', text: '§15 · Job tags' },
      mdTab([
        ['Gồm', 'Thẻ ở góc dưới trái của **thẻ tin trả phí**: **9 nhóm, 68 thẻ**'],
        ['Đọc ở đâu', 'Ô *Card tag* trên form tin'],
        ['Bản ghi lưu', '**Mã**'],
        ['Tên', MD_VI_EN],
        ['Thứ tự', MD_DRAG],
        ['Xóa', '**Bị từ chối (409)** khi tin đã đăng còn dùng — đổi thẻ hoặc gỡ tin trước'],
        ['Đổi tên', 'Thẻ trên tin hiện tên mới'],
        ['Import / Export', MD_LIST_IMPORT],
      ]),

      { kind: 'h', text: '§16 · Education levels' },
      mdTab([
        ['Gồm', 'Trình độ học vấn'],
        ['Đọc ở đâu', 'Đăng ký / hồ sơ ứng viên · bộ lọc tìm CV của NTD · ô *Minimum education level* trên form tin'],
        ['Bản ghi lưu', '**Mã**'],
        ['Tên', MD_VI_EN_KO],
        ['Thứ tự', MD_DRAG],
        ['Xóa', 'Hồ sơ / tin đang dùng **mất giá trị**, không khôi phục được'],
        ['Đổi tên', 'Bản ghi hiện tên mới'],
        ['Import / Export', MD_LIST_IMPORT],
      ]),

      { kind: 'h', text: '§17 · Years of experience' },
      mdTab([
        ['Gồm', 'Các mốc số năm kinh nghiệm (*No experience, Less than 1 year*, từng năm, *Over 20 years*)'],
        ['Đọc ở đâu', 'Đăng ký / hồ sơ ứng viên · bộ lọc tìm CV của NTD · ô *Years of experience (min – max)* trên form tin'],
        ['Bản ghi lưu', '**Mã**'],
        ['Tên', MD_VI_EN_KO],
        ['Thứ tự', MD_DRAG],
        ['Xóa', 'Hồ sơ / tin đang dùng **mất giá trị**, không khôi phục được'],
        ['Đổi tên', 'Bản ghi hiện tên mới'],
        ['Import / Export', MD_LIST_IMPORT],
      ]),

      { kind: 'h', text: '§18 · Nationalities' },
      mdTab([
        ['Gồm', 'Quốc tịch'],
        ['Đọc ở đâu', 'Đăng ký / hồ sơ ứng viên · bộ lọc tìm CV của NTD'],
        ['Bản ghi lưu', '**Mã**'],
        ['Tên', MD_VI_EN_KO],
        ['Thứ tự', MD_DRAG],
        ['Xóa', 'Hồ sơ đang dùng **mất giá trị**, không khôi phục được'],
        ['Đổi tên', 'Bản ghi hiện tên mới'],
        ['Import / Export', MD_LIST_IMPORT],
      ]),
      {
        kind: 'diagram',
        id: 'md-candidate',
        heading: 'Ba danh mục của ứng viên — một giá trị, hai phía dùng',
      },

      { kind: 'h', text: '§19 · Locations' },
      mdTab([
        ['Gồm', 'Cây khu vực khoảng **3.300 dòng**, lọc theo cấp'],
        ['Đọc ở đâu', '**Mọi ô chọn địa điểm** (tin đăng, công ty, ứng viên) · trục *Tỉnh/TP* của trang *Việc làm theo khu vực*'],
        ['Bản ghi lưu', '**Mã**'],
        ['Tên', MD_VI_EN],
        ['Thứ tự', MD_DRAG],
        ['Xóa', 'Các vùng con **bị tách khỏi cha** — vẫn còn trong danh mục, không bị xóa theo'],
        ['Đổi tên', 'Bản ghi hiện tên mới'],
        ['Import / Export', MD_LIST_IMPORT],
      ]),
      {
        kind: 'diagram',
        id: 'md-locations',
        heading: 'Xóa một khu vực cha',
      },
    ],
  },

  'audit-log': {
    logic: [
      'Nhật ký thao tác chạm dữ liệu nhạy cảm và các thay đổi quan trọng — **chỉ thêm, không sửa, không xoá**, **lưu vô thời hạn** (chưa có chính sách giữ, D-AUD-1). Đây là nơi tra khi có khiếu nại “ai đã xem/sửa cái này”.',
      'Ghi cả thao tác của **nhân viên Saramin**, **người dùng công ty** (ví dụ NTD tìm ứng viên, mở khoá CV) và **ứng viên** (đăng nhập, xoá tài khoản), cộng các job tự động.',
      'Mỗi dòng: *Actor* · *Action* · *Entity* · *Entity ID* · thời điểm (giờ VN). Bấm mở rộng một dòng để thấy **mã action / entity thô và payload** svn-be ghi.',
      'Cột **Actor** trả lời theo thứ tự: có admin làm → tên admin; có người khác làm → `User <id>` (thường là người dùng công ty); không ai đăng nhập → hiện **đối tượng** của dòng (*Jobseeker …*, *Admin user unidentified* cho đăng nhập admin thất bại); còn lại là **System** (job quét, đồng bộ hoá đơn điện tử, ngân hàng).',
    ],
    how: [
      'Lọc theo **hành động** (chứa chuỗi, không phân biệt hoa thường — gõ `auth.` để xem mọi sự kiện đăng nhập), **loại đối tượng** (có gợi ý nhưng nhận chuỗi bất kỳ), **người thực hiện** (danh sách nhân viên), **Actor ID** / **Entity ID** (dán id đầy đủ), hoặc **khoảng ngày** (trọn ngày theo giờ VN).',
      'Id hiện rút gọn 8 ký tự — **di chuột để xem đủ, bấm để sao chép**, rồi dán vào ô Actor ID / Entity ID để lần cả vệt của người đó.',
      'Cần đưa ra ngoài: **xuất CSV** đúng bộ lọc đang xem (tải ngay, không qua Export history).',
    ],
    watch: [
      'Đây là nơi tra khi có khiếu nại “ai đã xem/sửa cái này”.',
      'CSV **tối đa 50.000 dòng** (mới nhất). Bị cắt thì có cảnh báo sau khi lưu file — trong file không có gì cho biết.',
      'Chính việc xuất CSV cũng được ghi (`audit_log.export`).',
      'Quyền: `audit_log:read` — seed **chỉ HQ Admin**. Xuất CSV dùng cùng quyền đó.',
      'Ô dropdown người thực hiện chỉ có nhân viên — muốn lọc theo người dùng công ty hay ứng viên thì dán id vào **Actor ID** / **Entity ID**.',
    ],
    blocks: [
      { kind: 'p', text: `Đối chiếu với build: ${CHECKED}.` },
      {
        kind: 'table',
        heading: 'Những gì được ghi (ví dụ mã action, theo nhóm)',
        cols: ['Nhóm', 'Mã action tiêu biểu'],
        rows: [
          ['Đăng nhập & tài khoản', '`auth.login` · `auth.login_failed` · `auth.login_locked` · `auth.otp_requested` / `_verified` / `_failed` · `auth.password_reset_completed` · `account.create`'],
          ['Nhân viên & quyền', '`user.invite` · `user.update` · `user.delete` · `user.assign_roles` · `role.create` / `.update` / `.replace_permissions` / `.delete` · `department.create` / `.update`'],
          ['Dữ liệu ứng viên (PII)', '`candidate.read` · `candidate.search` · `candidate.update` · `candidate.export` · `candidate.purge` · `resume.read` · `resume.unlock` · `resume.contact_reveal` · `candidate_cv.approve` / `.reject` · `applicant.read` · `talent_pool.read`'],
          ['CRM & bán hàng', '`quote.create` / `.revise` / `.transition` · `purchase_order.issue` · `invoice.issue` · `payment.confirm` · `signup.assign` · `company.update`'],
          ['Quota', '`search_quota.activate` · `search_quota.revoke` · `company_tier_quota.grant` · `resume.unlock_refund`'],
          ['Cấu hình', '`seller_profile.replace` · `membership_programme.save` · `master_data.import` · `skill_gap.adopt` · `zalo_template.update`'],
          ['Thông báo', '`notification_manual_batch.send` · `notification_delivery.retry`'],
          ['Xuất dữ liệu', '`<entity>.export_requested` · `<entity>.export` · `export.downloaded` · `audit_log.export`'],
        ],
      },
      {
        kind: 'list',
        heading: 'Những gì KHÔNG được ghi (đã kiểm trong svn-be)',
        items: [
          'Sửa / bật / tắt **quy tắc thông báo** và **mẫu tin**.',
          'Publish **trọng số gợi ý việc** và **tỉ giá** (General settings — lịch sử nằm ở các phiên bản đã lưu).',
          'Thêm / sửa / xoá **từng dòng Master data** (chỉ Import và duyệt Missing skills được ghi).',
        ],
      },
      {
        kind: 'warn',
        text: 'Mở lại một hồ sơ ứng viên **đã mở khoá** được ghi là `resume.contact_reveal` và gán cho **công ty**, không cho người cụ thể — dòng đó hiện tên công ty ở cột Actor (gán theo từng người là nợ BE). Payload cũ ghi `companyId`, payload mới ghi `companyIds` — cả hai đều đọc được.',
      },
    ],
  },

  'analytics-logs': {
    logic: [
      'Log **thô** của tìm kiếm và thẻ hiển thị trên Jobseeker site. Hai tab: **Search log** và **Card & behaviour log**.',
      '**Giai đoạn 1 chỉ hiện những gì đã thu được, đúng như đã thu** — chưa có tỉ lệ, chưa có CTR, chưa phân tích theo thứ hạng. Xử lý số liệu là giai đoạn 2, đã quyết như vậy.',
      'Tám **thẻ đếm** ở đầu: *Searches · Zero-result searches · Impression batches · Jobs impressed · Clicks · Applications · Saves · Suggestion picks*. Một *impression* là **một lô** thẻ tin (thẻ hiện ít nhất một nửa trong một giây); mở rộng dòng để xem từng tin theo thứ hạng.',
      'Kỳ xem **bắt buộc**, tối đa **31 ngày** cho các bảng; **thẻ đếm chỉ phủ 7 ngày cuối** của kỳ đã chọn và nói rõ điều đó (*“Counts cover only the last 7 days…”*).',
      'Dữ liệu svn-be giữ **180 ngày** (xoá theo tháng).',
    ],
    how: [
      'Chọn **Period** (*Last hour · Last 24 hours* (mặc định) *· Last 7 days · Last 31 days · Custom range* — ngày tuỳ chọn tính theo giờ VN) và công tắc **Exclude bots** (mặc định bật, áp cho cả trang).',
      'Đọc các thẻ đếm, rồi mở tab cần xem.',
      '**Search log**: lọc *Keyword contains…*, *Visitor* (đăng nhập / không), *Zero results only*. Cột: thời điểm (có giây) · phiên · từ khoá · bộ lọc · sắp xếp · trang · số kết quả (0 tô đỏ) · ms · thiết bị.',
      '**Card & behaviour log**: lọc *Event* (*Impression · Click · Apply · Save · Suggestion pick*), *Surface* (vùng trên site), *Job ID* (tìm cả bên trong lô impression).',
      'Bấm một mã phiên để lần theo hành vi của phiên đó (drawer, cũ trước mới sau, tối đa 1.000 sự kiện).',
      '**Load more** để tải thêm — không có số trang, không có tổng.',
    ],
    watch: [
      'Đừng đọc trang này như một báo cáo — nó là **dữ liệu thô**. Con số ở đây chưa loại nhiễu và chưa quy đổi thành tỉ lệ nào.',
      'Dòng chân bảng đếm **số dòng đã tải**, không phải số dòng khớp lọc.',
      'Thẻ đếm **không theo bộ lọc của tab** (từ khoá, loại sự kiện…) — chỉ theo kỳ và công tắc bot.',
      'Tin đã xoá vẫn hiện bằng mã kèm *“This job no longer exists”* — nó **đã từng** được hiển thị.',
      'Quyền: `analytics_log:read` — seed chỉ **HQ Admin**.',
    ],
    blocks: [
      { kind: 'p', text: `Đối chiếu với build: ${CHECKED}.` },
      {
        kind: 'open',
        text: 'Việc thu log có công tắc ở svn-be (`svn.analytics.enabled`); cấu hình ghi đây là **công tắc tắt cho production cho tới khi cơ sở đồng ý (consent) được xác nhận** (D-ANL-8). Production hiện bật hay tắt — **chưa xác minh**. Trang trống trên một môi trường thì kiểm công tắc đó trước khi nghi lỗi. Tài liệu admin `analytics-logs.md` còn ghi “mọi request 404 cho tới khi nhánh BE vào dev” — nhánh đó **đã vào dev** (V568).',
      },
    ],
  },

  'export-history': {
    logic: [
      'Mọi lần **Export Excel** trên một danh sách đều **chạy nền ở server**, không xuất ngay tại chỗ. Trang này là danh sách các lần xuất **của chính bạn** — toàn bộ lịch sử, kể cả file đã hết hạn — và nơi tải lại file đã xong.',
      'Bấm Export ở một danh sách là **xếp hàng một việc**, không phải tải ngay — file về khi server làm xong. Tab vừa yêu cầu sẽ **tự lưu file** khi xong (trình duyệt có thể chặn; nút Download ở đây luôn dùng được).',
      'File là **.xlsx**, xuất **toàn bộ** danh sách đúng bộ lọc lúc bấm, **không giới hạn số dòng**. **Mỗi người chỉ có một việc đang chạy cho mỗi loại danh sách** — bấm lần nữa trả về chính việc đó, không tạo việc mới.',
      '**File hết hạn sau 1 ngày** kể từ lúc xong — danh sách luôn thay đổi, file hôm qua trả lời câu hỏi hôm qua, và xuất lại chỉ một cú bấm. Dòng hết hạn vẫn nằm lại với chip *Expired*, không còn nút tải.',
      'Không cần quyền để mở trang — ai đăng nhập cũng thấy **việc của chính mình**. Góc dưới phải còn có **nút nổi** *Recent exports* khi có việc đang chạy hoặc vừa xong trong 10 phút.',
    ],
    how: [
      'Bấm **Export Excel** trên danh sách cần xuất (bảng dưới).',
      'Nút chuyển *Exporting…*; xong thì file tự tải, hoặc mở trang này / nút nổi để tải.',
      'Cột: *Requested · List · Filter · Status · Finished · Expires · Actions*. Trang tự làm mới khi còn dòng *Queued* / *Preparing*.',
      'Lỗi: nút trên danh sách hiện *Failed · Retry* (di chuột xem mã lỗi); ở đây dòng giữ lý do lỗi.',
    ],
    watch: [
      'Xuất dữ liệu có chứa thông tin cá nhân là **thao tác được ghi log**, và thường cần quyền riêng — không phải ai đọc được cũng xuất được.',
      'Nút Export cần **hai quyền**: quyền đọc danh sách (quyết định file chứa những dòng nào — đúng phạm vi bạn thấy) **cộng** `<resource>:export` (cột **Export** trong ma trận Roles). Thiếu một trong hai thì **không có nút**.',
      'Lúc tải, server **kiểm lại quyền**: quyền bị thu sau khi yêu cầu → *“Your access changed since this export was requested — request it again.”* Hết hạn → *“That export has expired. Request it again.”*',
      '**Applications** và **Talent pool** chỉ xuất được với người có phạm vi `all` (danh sách có liên hệ bị paywall — xuất cả hoặc không).',
    ],
    blocks: [
      { kind: 'p', text: `Đối chiếu với build: ${CHECKED}; svn-be ADR-0009.` },
      {
        kind: 'table',
        heading: 'Trạng thái một lần xuất',
        cols: ['Trạng thái', 'Nghĩa', 'Làm gì tiếp'],
        rows: [
          ['*Queued*', 'Đã nhận, chờ worker', 'Chờ; bấm Export lần nữa chỉ trả về việc này'],
          ['*Preparing*', 'Đang ghi file', 'Chờ'],
          ['*Ready*', 'Xong — có *Download*', 'Tải trong vòng 1 ngày. Mỗi lần tải được ghi `export.downloaded`'],
          ['*Failed*', 'Lỗi; lý do giữ trên dòng', 'Bấm *Retry* trên danh sách gốc'],
          ['*Expired*', 'Quá 1 ngày — file đã bị xoá, dòng còn lại', 'Xuất lại'],
        ],
      },
      {
        kind: 'table',
        heading: 'Danh sách nào xuất qua đây',
        cols: ['Nhóm', 'Danh sách (tên trong cột *List*)', 'Quyền export'],
        rows: [
          ['Tuyển dụng', '*Jobs* · *Applications* · *Talent pool* · *CV review*', '`job:export` · `resume:export` · `cv_review:export`'],
          ['CRM', '*Assigned / Free data / Archived companies* (mỗi tab một loại) · *Claim requests* · *Sign-ups* · *Quotations* · *Purchase orders* · *Invoices*', '`company:export` · `company_claim:export` · `signup:export` · `quote:export` · `purchase_order:export` · `invoice:export`'],
          ['Service delivery', '*Quota usage*', '`invoice:export`'],
          ['Users', '*Jobseeker users* · *Deleted accounts* · *Company users*', '`candidate:export` · `company_user:export`'],
          ['Call center', '*Call logs*', '`telephony_call:export`'],
          ['Dashboards', 'Các bảng số đằng sau từng biểu đồ Sales · Sales planning · Product · Marketing', '`dashboard_*:export`'],
        ],
      },
      {
        kind: 'list',
        heading: 'KHÔNG đi qua Export history',
        items: [
          '**Audit log → xuất CSV**: tải ngay, tối đa 50.000 dòng.',
          'Các nút **Export CSV** dựng file **trong trình duyệt** từ các dòng đang hiện (ví dụ bảng xếp hạng gọi) — không có việc ở server, không cần quyền export.',
        ],
      },
    ],
  },
}

export const NOTIF_SYSTEM_MODULE_DOCS: Record<string, ModuleDoc> = {
  Notifications: {
    title: 'Logic chung — Notifications',
    lead:
      'Bốn trang cho một cỗ máy gửi **email** thông báo, cộng trang riêng cho mẫu Zalo. Trước đây là **một trang bốn tab**; giờ mỗi phần là một mục menu và **mỗi phần có quyền riêng**. Cỗ máy thật sự gửi: quy tắc bật thì bắn, gửi tay thì chạy nền, mọi email đều được ghi và gửi lại được.',
    headline: [
      '**Hôm nay chỉ có Email.** In-app của ứng viên và chuông nhân viên luôn được ghi, không bật/tắt bằng quy tắc; Zalo mới chỉ gửi **OTP**; SMS và push không có.',
      '**Mọi quy tắc seed sẵn đều đang tắt, và quy tắc mới cũng sinh ra tắt.** Không thấy email nào đi thì kiểm công tắc *Active* trước.',
      '**Mẫu và quy tắc tách nhau.** Một mẫu dùng cho nhiều quy tắc — nên sửa mẫu là sửa **mọi** nơi đang gửi nó. **Mẫu Zalo không soạn ở đây** — Zalo duyệt mẫu; mình chỉ khai mã mẫu ứng với hành động nào.',
    ],
    blocks: [
      { kind: 'p', text: `Đối chiếu với build: ${CHECKED}.` },
      {
        kind: 'table',
        heading: 'Năm trang, và thứ tự nên dùng chúng',
        cols: ['Trang', 'Dùng khi', 'Quyền (seed chỉ HQ Admin)'],
        rows: [
          ['**Message templates**', '**Làm trước** — soạn nội dung, kiểm phần xem trước; sửa câu chữ mười email giao dịch', '`notification_template:read` (+ `create` / `update` / `delete`)'],
          ['**Automation rules**', 'Nối sự kiện → nội dung; bật / tắt gửi tự động', '`notification_workflow:read` (+ `create` / `update` / `delete`)'],
          ['**Send manually**', 'Gửi một lần, không đáng tạo quy tắc', '`notification_send:create`'],
          ['**Delivery history**', 'Kiểm một thông báo có thật sự đi hay không; gửi lại', '`notification_history:read` (Resend: `update`)'],
          ['**Zalo ZNS templates**', 'Ghi mã mẫu Zalo đã duyệt cho từng hành động; kiểm kết nối Zalo', '`zalo_template:read` / `write`'],
        ],
      },
      {
        kind: 'table',
        heading: 'Một email đi qua những bước nào',
        cols: ['Bước', 'Chuyện gì xảy ra', 'Thấy ở đâu'],
        rows: [
          ['1 · Nguồn', 'Một **sự kiện** xảy ra và có quy tắc *Active* nghe nó — hoặc operator bấm **Send** ở gửi tay', 'Automation rules / Send manually'],
          ['2 · Xếp hàng', 'Với từng người nhận: kiểm có email, kiểm **đồng ý marketing** (nếu sự kiện / lần gửi cần), kiểm mẫu còn Active → một dòng *Queued*, hoặc *Skipped* kèm lý do', 'Delivery history'],
          ['3 · Gửi', 'Bộ gửi chạy **mỗi 15 giây**, nội dung dựng **bằng tiếng Việt** lúc xếp hàng', 'Dòng thành *Sent* hoặc *Failed*'],
          ['4 · Gửi lại', '**Không tự thử lại.** Operator bấm Resend; tối đa 3 lần thử cho một dòng', 'Delivery history; Audit log `notification_delivery.retry`'],
        ],
      },
      {
        kind: 'warn',
        text:
          'Quyền **gửi tay** là `create`, không phải `read` — gửi tin cho khách là một hành động, không phải một lần xem. Người xem được lịch sử chưa chắc gửi được.',
      },
      {
        kind: 'list',
        heading: 'Năm điều hay bị hiểu sai',
        items: [
          '**Ô lịch / điều kiện trên quy tắc không có tác dụng** — quy tắc bắn mỗi lần sự kiện xảy ra, ngay lập tức. Nhịp tuần / ngày đến từ job quét phát sự kiện.',
          '**EN/KO soạn rồi vẫn không được gửi** — mọi email đi bằng tiếng Việt cho tới khi người nhận có ngôn ngữ ưa thích (D-NOTI-13).',
          '**Mười email giao dịch** (xác minh, mật khẩu, lời mời admin, báo hết hạn quota tìm CV) **không đi qua quy tắc**, không tắt được, và **không có trong Delivery history** — chỉ sửa câu chữ ở Message templates.',
          '**Gửi tay mặc định tôn trọng đồng ý marketing** — gửi *All candidates* không bật Force send chỉ tới người đã đồng ý.',
          '**Dòng Zalo cho mười sự kiện chưa gửi gì** — bộ gửi thông báo chưa có kênh Zalo (D-ZALO-2). Chỉ các dòng OTP là thật.',
        ],
      },
      {
        kind: 'warn',
        text:
          '**Từ 08/10/2026 ứng viên chỉ đăng ký được bằng OTP Zalo** (SRM-903, svn-web #633 / svn-be #779). Trên môi trường chạy Zalo thật, dòng `otp.signup` ở Zalo ZNS templates là **điều kiện để có ứng viên mới** — xem trang đó.',
      },
      {
        kind: 'list',
        heading: 'Chuông của nhân viên (góc trên phải admin)',
        items: [
          'Thông báo **của chính người đang đăng nhập** — báo giá cần duyệt chiết khấu, kết quả duyệt, kết quả claim, được giao công ty, kết quả PO. Không phải các trang gửi đi ở trên.',
          'Chỉ hiện **chấm**, không hiện số; kiểm mỗi 60 giây khi tab đang mở. Bấm một dòng là đánh dấu đã đọc và mở đúng màn hình (báo giá, công ty, PO).',
          'Svn-be **xoá thông báo chuông sau 30 ngày**. Quy tắc email cho cùng sự kiện (nếu bật) chỉ **thêm** một email.',
        ],
      },
    ],
  },

  System: {
    title: 'Logic chung — System',
    lead:
      'Cấu hình nền của cả hệ thống: pháp nhân phát hành chứng từ, tham số gợi ý việc, hạng thành viên, dữ liệu danh mục dùng chung — và ba trang **chỉ đọc** để lần vết: Audit log, Search & card logs, Export history. Người, vai trò và phòng ban nằm ở nhóm **Organisation**.',
    headline: [
      '**Server mới là nơi chặn thật.** Giao diện chỉ ẩn nút bạn không dùng được — nên nút bị ẩn gần như luôn là thiếu quyền, không phải bug. Phần lớn quyền ở nhóm này **seed chỉ cho HQ Admin**.',
      '**Issuer identity là pháp nhân CỦA SARAMIN**, không phải hồ sơ khách. Sai ở đó là sai trên mọi hoá đơn xuất ra — nhưng chỉ **từ lúc lưu**: mỗi lần lưu là một phiên bản mới, chứng từ đã gửi giữ phiên bản cũ.',
      '**Hạng thành viên của một công ty không ai đặt tay được.** Nó tính từ hoá đơn đã phát hành trong năm; màn hình chỉ sửa ngưỡng và ghi chú quyền lợi.',
    ],
    blocks: [
      { kind: 'p', text: `Đối chiếu với build: ${CHECKED}.` },
      {
        kind: 'table',
        heading: 'Bảy trang trong nhóm',
        cols: ['Trang', 'Trả lời câu hỏi', 'Quyền mở', 'Ai giữ (seed)'],
        rows: [
          ['**General settings**', 'Gợi ý việc chấm điểm thế nào; 1 USD bằng bao nhiêu đồng (cho gợi ý)', '`matching_settings:read`', 'HQ Admin'],
          ['**Issuer identity**', 'Chứng từ in gì về chúng ta', '`system_settings:read`', 'HQ Admin'],
          ['**Membership tiers**', 'Bao nhiêu doanh thu thì lên hạng nào', '`membership_programme:read`', 'HQ Admin, Team leader, VN Sales (sửa: chỉ HQ Admin)'],
          ['**Master data**', 'Các ô chọn liệt kê những giá trị nào', 'Theo từng tab (`job_category`, `skill`, `region`…)', 'HQ Admin'],
          ['**Audit log**', 'Ai đã xem / sửa cái này', '`audit_log:read`', 'Chỉ HQ Admin'],
          ['**Search & card logs**', 'Người tìm gì, thấy gì, bấm gì (dữ liệu thô)', '`analytics_log:read`', 'HQ Admin'],
          ['**Export history**', 'File tôi đã xuất đâu rồi', 'Không cần quyền — chỉ việc của chính mình', 'Mọi người đăng nhập'],
        ],
      },
      {
        kind: 'table',
        heading: 'Đổi cấu hình thì chuyện gì xảy ra với dữ liệu cũ',
        note: 'Ba kiểu khác nhau — nhầm kiểu là đọc sai báo cáo.',
        cols: ['Kiểu', 'Trang', 'Đổi thì'],
        rows: [
          ['**Thêm phiên bản**', 'Issuer identity · General settings', 'Bản cũ còn nguyên; chứng từ / điểm gợi ý cũ vẫn trỏ vào bản cũ. Không có hoàn tác — lưu lại số cũ là một phiên bản mới'],
          ['**Ghi đè có kiểm toán**', 'Membership tiers', 'Ngưỡng mới áp từ lần tính lại kế tiếp (chậm nhất 00:20); kết quả các năm đã qua không đổi; Audit log giữ ngưỡng trước / sau'],
          ['**Ghi đè thẳng**', 'Master data', 'Đổi tên an toàn (dữ liệu lưu mã). **Xoá** một giá trị đang dùng thường để lại tin trỏ vào hư không — chỉ Job tags và Business forms bị chặn'],
        ],
      },
      {
        kind: 'table',
        heading: 'Quyền — `resource:action` kèm phạm vi',
        note: 'Vai trò và ma trận quyền chỉnh ở **Organisation → Roles & permissions**.',
        cols: ['Phạm vi', 'Nghĩa'],
        rows: [
          ['`all`', 'Không giới hạn — thấy mọi dòng'],
          ['`company`', 'Chỉ những công ty được giao'],
          ['`own`', 'Chỉ dữ liệu của chính người đó'],
        ],
      },
      {
        kind: 'warn',
        text: 'Đổi vai trò của một người **đang đăng nhập** thì quyền mới chỉ áp sau khi phiên của họ nạp lại — bảo họ đăng xuất vào lại nếu thấy chưa đổi.',
      },
      {
        kind: 'list',
        heading: 'Ghi vết',
        items: [
          '**Audit log** ghi thao tác chạm dữ liệu nhạy cảm và thay đổi quan trọng: mở / tìm / mở khoá hồ sơ ứng viên, xuất dữ liệu, phát hành hoá đơn, đổi quyền, lưu Issuer identity, lưu ngưỡng hạng. Lưu **vô thời hạn**. **Không** ghi: sửa quy tắc / mẫu thông báo, publish trọng số và tỉ giá, sửa từng dòng Master data.',
          '**Export history** là nơi duy nhất lấy lại file đã xuất — **file sống 1 ngày**. Mỗi lần xuất và mỗi lần tải đều vào Audit log.',
          'Mọi ngày giờ trong hệ thống hiển thị theo **giờ Việt Nam**, không theo máy người xem — kể cả khoảng ngày của bộ lọc.',
        ],
      },
      {
        kind: 'list',
        heading: 'Dữ liệu nền',
        items: [
          '**Master data** là danh mục dùng chung: ngành nghề, vai trò, chuyên môn, ngành công nghiệp, cấp bậc, kỹ năng, khu vực, thẻ công ty, thẻ tin… Mỗi tab một nhóm và **mỗi nhóm một quyền riêng** — thiếu quyền một tab thì chỉ tab đó vắng, cả trang vẫn chạy.',
          'Tab **Missing skills** lấy đầu vào từ **CV đã đọc**: kỹ năng CV ghi mà danh mục chưa có. Duyệt một dòng là thêm alias / kỹ năng **và** sàng lại các CV đó.',
          '**General settings** giữ trọng số gợi ý việc và **tỉ giá USD→VND** — tỉ giá này **chỉ** tín hiệu lương của gợi ý việc đọc; sắp xếp / lọc lương trên trang tìm việc dùng hằng số cấu hình riêng.',
        ],
      },
    ],
  },
}
