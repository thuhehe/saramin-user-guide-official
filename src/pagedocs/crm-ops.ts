import type { PageDoc } from '../docs'

/*
 * CRM — the four operations pages: Claim requests, Sign-ups, Company documents, Call logs.
 *
 * Checked against the build on 08/10/2026:
 *   saramin-vn-admin origin/dev 45954108 (incl. PR #560, company-activity call logs)
 *   svn-be           origin/dev ee1db5ea9
 *   svn-web          origin/dev d8a43a11
 *
 * Each entry is a FULL replacement for PAGE_DOCS[key]. Where the code proved an older line
 * wrong, the entry says so in a `warn` rather than quietly changing it.
 */

export const CRM_OPS_PAGE_DOCS: Record<string, PageDoc> = {
  /* ── Claim requests ─────────────────────────────────────────────────────── */
  'company-claims': {
    logic: [
      'Đây là **nhật ký của chính rep** về các yêu cầu nhận công ty từ Free data — **không có nút bấm ở đây**, có chủ đích: quyết định nằm trên hồ sơ công ty (tab yêu cầu của công ty đó), để chỉ có **một chỗ** quyết định.',
      'Free data và Customers là **một bảng ở hai mức hoàn thiện**. Dòng Free data chỉ cần tên công ty, không có chủ, **không được tính vào bất kỳ con số CRM nào**, và **không mang nổi báo giá/PO/hoá đơn**.',
      '“Promote” một dòng **không phải là copy** — nó là **hoàn thiện hồ sơ và gán chủ**.',
      'Hai cấp duyệt kiểm hai thứ khác nhau: **Admin (bước 1)** xem yêu cầu có thật không — lý do đọc được, bằng chứng mở được; **Sales lead (bước 2)** quyết rep này có nên giữ công ty này không. **Chỉ cái “yes” của lead mới ghi dữ liệu.**',
      'Quyền: trang cần `company_claim:read`. Theo seed: *sale_member* chỉ đọc yêu cầu **của mình**; *sale_leader*, *sale_manager*, *hq_admin*, *vn_sales*, *vn_ops* đọc **tất cả**. Xin công ty cần `company_claim:request` (*sale_member/leader/manager*, *hq_admin*). Duyệt bước 1 cần `approve_admin` (*hq_admin*, *vn_ops*); bước 2 cần `approve_lead` — *sale_leader* trong **team mình**, *hq_admin* toàn bộ.',
    ],
    how: [
      'Rep mở công ty trong **Free data** → **Ask for this company** → điền *Request details* (bắt buộc, tối đa 2000 ký tự — placeholder gợi ý ghi lý do + đầu mối liên hệ), *Customer type in Free data* (không bắt buộc), *Link* và/hoặc *Attachment* (PDF/JPEG/PNG, tối đa 10 MB). Yêu cầu nhận số `#N`.',
      '**Admin duyệt bước 1** (*Approve · Admin*) — đọc lý do và bằng chứng, có thể ghi chú cho rep (tối đa 500 ký tự). Bước này **chưa tạo ra gì** và **không gửi thông báo**.',
      '**Sales lead duyệt bước 2** (*Approve · Sales lead*) — đây mới là lần ghi duy nhất: rep thành sales owner, công ty rời Free data, Owner history ghi một dòng *Claimed* kèm ghi chú của người duyệt. Rep nhận thông báo.',
      'Theo dõi kết quả ở trang này: lọc *Mine / All*, tìm theo công ty, rep hoặc đầu mối, lọc theo trạng thái, sắp xếp *mới nhất* (mặc định) hoặc theo tên công ty. Bấm tên công ty để mở thẳng tab yêu cầu trên hồ sơ.',
    ],
    watch: [
      '**Mỗi lúc chỉ một yêu cầu mở trên một công ty.** Rep khác xin cùng công ty sẽ bị từ chối với *“Another request for this company is still waiting on a decision”*.',
      '**Từ chối không phải một trạng thái của công ty** — công ty quay về *Not claimed* và hiện “Rejected N time(s) before”. Ai cũng xin lại được, kể cả chính rep đó.',
      '**Không ai tự duyệt yêu cầu của mình** (*“An approver can never be their own approver”*) — trừ người giữ **cả hai cổng ở phạm vi all** (hiện là *hq_admin*), vì khi đó không có “bên thứ hai” nào để thiếu.',
      '**Admin đã chuyển cho lead thì không từ chối được nữa** (*“An admin cannot refuse a request they passed on”*). Muốn can thiệp lúc đó: dùng *Assign directly* trên hồ sơ — và xem `warn` bên dưới.',
      'Lead chỉ duyệt/từ chối được yêu cầu của rep **trong team mình** — ngoài team là *“That rep is outside your team”*.',
    ],
    blocks: [
      { kind: 'h', text: '§1 Trạng thái một yêu cầu' },
      {
        kind: 'table',
        heading: 'Vòng đời một claim request',
        note: 'Ba nhãn trạng thái chính là ba cột “Waiting · Admin / Waiting · Sales lead / Approved / Rejected” trên trang này.',
        cols: ['Trạng thái', 'Nghĩa', 'Vào bằng cách nào', 'Bước tiếp theo'],
        rows: [
          ['*Waiting · Admin*', 'Admin chưa xem', 'Rep bấm **Ask for this company**', 'Admin: *Approve · Admin* hoặc *Reject*'],
          ['*Waiting · Sales lead*', 'Admin đã chuyển tiếp, lead đang quyết. **Công ty vẫn chưa có chủ**', 'Admin bấm *Approve · Admin*', 'Lead (trong team của rep): *Approve · Sales lead* hoặc *Reject*'],
          ['*Approved*', 'Rep là sales owner, công ty đã ở Customers', 'Lead bấm *Approve · Sales lead*', 'Hết — trạng thái cuối. Muốn đổi chủ thì dùng *Change sales owner* trên hồ sơ'],
          ['*Rejected*', 'Ở cấp nào thì cột Status ghi “Decided by Admin / Sales lead”, kèm ghi chú', '*Reject* ở cổng đang chờ', 'Hết. Công ty về *Not claimed* — ai cũng xin lại được'],
        ],
      },
      {
        kind: 'table',
        heading: 'Trạng thái một dòng Free data — và “bị từ chối” không nằm trong đó',
        cols: ['Dòng hiện', 'Nghĩa', 'Xin được không?'],
        rows: [
          ['**Not claimed**', 'Đang trống — chưa ai hỏi', '**Được**'],
          ['**Waiting · bước 1 · Admin**', 'Một rep đã hỏi, Admin chưa quyết', 'Không — server từ chối yêu cầu thứ hai'],
          ['**Waiting · bước 2 · Sales lead**', 'Admin đã chuyển tiếp, lead đang quyết', 'Không'],
          ['*(bị từ chối)*', '**Không phải một trạng thái.** Yêu cầu bị Rejected, công ty về *Not claimed* kèm “Rejected N lần trước đó”', '**Được** — ai cũng xin lại được'],
        ],
      },
      { kind: 'h', text: '§2 Danh sách' },
      {
        kind: 'table',
        heading: 'Cột trên trang Claim requests',
        cols: ['Cột', 'Hiện gì'],
        rows: [
          ['**Company**', 'Tên công ty (link tới tab yêu cầu trên hồ sơ); dòng dưới là đầu mối · số điện thoại, hoặc số yêu cầu `#N`'],
          ['**Asked by**', 'Rep đã xin; dòng của chính bạn có chữ “(you)”'],
          ['**Sent**', 'Thời điểm gửi'],
          ['**Reason & evidence**', 'Lý do nguyên văn, link bằng chứng; “attachment” nếu có file; cảnh báo vàng *No evidence attached* nếu không có gì'],
          ['**Classification**', 'Loại khách rep chọn (8 loại, ví dụ *Currently hiring on the market*, *Still has an unused Saramin package*) — hoặc “—”'],
          ['**Status**', 'Nhãn trạng thái + “Decided by {Admin/Sales lead} · ai · khi nào” + ghi chú gửi rep'],
        ],
      },
      {
        kind: 'list',
        heading: 'Thanh công cụ và số liệu',
        items: [
          '**Mine / All** — chỉ hiện *All* khi quyền đọc của bạn rộng hơn chính mình. Không có tab *My team*: server chỉ phân biệt được “của tôi” và “mọi thứ tôi được đọc”.',
          '**Overview** (bật/tắt được): *Awaiting decision* (đang chờ ở một trong hai cổng), *Overdue · 24h* (trong số đó, gửi quá 1 ngày), *Approved · 7 days*, *Rejected · 7 days*. Các số này **không** bị bộ lọc trạng thái thu hẹp.',
          '**Export** (`CLAIM_REQUESTS`) theo đúng bộ lọc đang chọn — chạy nền, tải ở trang Exports.',
        ],
      },
      { kind: 'h', text: '§3 Mỗi thao tác làm thay đổi gì' },
      {
        kind: 'table',
        heading: 'Hậu quả của từng nút (tất cả nằm trên hồ sơ công ty)',
        cols: ['Thao tác', 'Ai', 'Ghi gì', 'Thông báo', 'Lỗi thường gặp'],
        rows: [
          ['**Ask for this company**', 'Rep có `request`', 'Một dòng claim `#N`, *Waiting · Admin*. Audit `claim.request`', 'Không', '*“That company already has a sales owner — ask for a transfer instead”* · *“…has been archived and cannot be claimed”* · yêu cầu khác đang mở'],
          ['**Approve · Admin**', '`approve_admin`', 'Chỉ đổi trạng thái → *Waiting · Sales lead*', 'Không', '*“This request is not waiting on an admin”* (đã có người xử lý)'],
          ['**Approve · Sales lead**', '`approve_lead` (team của rep)', 'Trong **một giao dịch**: sales owner = rep, Owner history *Claimed*, claim *Approved*', '**Có** — rep nhận “company_claim.decided”', '*“That company was taken while this request was waiting”* (đã bị gán trực tiếp) · *“…outside your team”*'],
          ['**Reject**', 'Người giữ cổng đang chờ', 'Claim *Rejected* ở cấp đó, kèm ghi chú', '**Có** — rep nhận kết quả và cấp từ chối', 'Admin không từ chối được sau khi đã chuyển tiếp'],
          ['**Assign directly** / *Change sales owner*', '`company:assign`', 'Đổi chủ ngay, Owner history ghi dòng chuyển giao', 'Chủ mới nhận “company assigned”', 'Chọn lại đúng người đang giữ → nút khoá (*That is who already holds it*)'],
        ],
      },
      {
        kind: 'warn',
        text:
          '**Sửa một dòng cũ của trang này:** “đầu mối thành liên hệ #1” khi lead duyệt — **build không làm vậy trên thực tế.** svn-be chỉ tạo liên hệ khi yêu cầu mang *tên + email* đầu mối, mà form *Ask for this company* **không có ô đầu mối** (đầu mối được ghi trong lời mô tả). Kết quả: duyệt xong, công ty **không có liên hệ mới** — chủ mới phải tự đọc lý do và tạo liên hệ. (`CompanyClaimService.fileContactPoint`, `claim-request-dialog.tsx`.)',
      },
      {
        kind: 'warn',
        text:
          '**Sửa một dòng cũ của trang này về cổng MST:** khoá “phải có MST mới duyệt/gán” **chỉ nằm ở giao diện**, và chỉ với công ty thuộc loại có MST Việt Nam (công ty nước ngoài không bị khoá). svn-be **không kiểm MST** ở bước duyệt của lead lẫn ở *Assign directly*. Nút *Reject* thì lúc nào cũng bấm được. Khi viết test: gọi API thẳng sẽ duyệt được một công ty không MST.',
      },
      {
        kind: 'warn',
        text:
          '**“Assign directly” không tự từ chối yêu cầu đang mở — dù màn hình nói có.** Hộp xác nhận ghi *“{rep}’s open request #N will be rejected automatically”*, nhưng `CompanyService.assignOwner` ở svn-be **không đụng tới claim**. Yêu cầu vẫn treo ở *Waiting*; lead bấm duyệt sau đó sẽ nhận *“That company was taken while this request was waiting”*. Sau khi gán trực tiếp, hãy **Reject** yêu cầu đang mở bằng tay để rep nhận được kết quả.',
      },
      {
        kind: 'warn',
        text:
          '**Trả công ty về pool** trên một công ty đang có chủ sẽ nhả nó lại Free data. Chủ hiện tại tự trả được; trả công ty **của người khác** là quyền của người có phạm vi toàn cục. Lần trả đó là **một dòng trong Owner history** (chuỗi hiện *closed* — ngay lúc này không ai chịu trách nhiệm), và dòng về tới pool **mang theo lịch sử** cho người duyệt kế tiếp thấy.',
      },
      {
        kind: 'example',
        heading: 'Một yêu cầu đi trọn hai cổng',
        scenario: 'Rep Lan (team HCM-1) thấy Công ty TNHH Ánh Dương trong Free data đang đăng tin trên thị trường.',
        cols: ['Bước', 'Ai', 'Trên màn hình', 'Dữ liệu'],
        rows: [
          ['1', 'Lan', '*Ask for this company* — lý do + tên/số đầu mối trong mô tả, loại *Currently hiring on the market*, link tin tuyển dụng', 'Claim #57 · *Waiting · Admin*'],
          ['2', 'Admin HQ', 'Mở tab yêu cầu trên hồ sơ, mở link, *Approve · Admin* với ghi chú “Đã kiểm tin đăng”', '#57 → *Waiting · Sales lead*. Chưa ai là chủ'],
          ['3', 'Lead HCM-1', 'Công ty chưa có MST → banner vàng, nút duyệt khoá → *Fill in the tax code* → lưu MST → *Approve · Sales lead*', 'Lan là sales owner; Owner history *Claimed*; #57 *Approved*'],
          ['4', 'Lan', 'Nhận thông báo; trang Claim requests hiện *Approved · Decided by Sales lead*', 'Công ty ở Customers; **chưa có liên hệ** — Lan tự tạo từ mô tả'],
        ],
      },
      { kind: 'p', text: '**Màn hình thật.** Ảnh chụp trước khi trang có thẻ *Overview* và bộ lọc trạng thái dạng chọn; cột và nút *Mine / All* vẫn như ảnh.' },
      {
        kind: 'shot',
        src: '/shots/42-claim-requests.jpg',
        where: 'Admin',
        caption: 'Nhật ký yêu cầu nhận công ty từ Free data — chỉ đọc, quyết định nằm trên hồ sơ công ty.',
      },
    ],
  },

  /* ── Sign-ups ───────────────────────────────────────────────────────────── */
  'sign-ups': {
    logic: [
      'Hộp thư của người tự đăng ký nhà tuyển dụng trên Company site. **Nộp form không tạo ra gì cả** — không công ty, không tài khoản đăng nhập, không sản phẩm. Dòng sign-up là **một yêu cầu**.',
      'Yêu cầu qua **hai cổng độc lập**: (1) người đăng ký **xác thực email** bằng link (tự động, link sống **30 phút**, gửi lại được); (2) HQ **đặt họ vào một công ty** ở màn hình này. Thứ tự nào cũng được — nhưng **phải qua cả hai mới đăng nhập được**.',
      'Màn hình này **không tự tạo công ty**. *Create company & activate* mở **form Create company bình thường**, điền sẵn từ dòng sign-up, vì một công ty dựng từ tên + MST thôi thiếu thông tin người mua, địa chỉ xuất hoá đơn và liên hệ mà hoá đơn GTGT cần.',
      'Quyền: trang cần `signup:read`; ba thao tác cần `signup:resolve`. Theo seed: *hq_admin* và *vn_sales* đọc **toàn bộ** hộp thư; *sale_leader* đọc lead giao cho team mình (+ pool chưa giao); *sale_member* chỉ đọc lead **giao cho mình**. Lead ngoài tầm với trả về “Sign-up not found”, không phải “không có quyền”.',
    ],
    how: [
      'Đọc dòng: *Email verified* (*Verified* / *Awaiting*), cột **Match** (công ty nào đã có MST/tên miền/tên này — và nằm ở *Customers* hay *Free data*), *ERC* (bấm để mở file, link hết hạn nhanh).',
      'Công ty **đã có trong Customers** → ⋮ → **Move to existing company** → chọn công ty (được chọn sẵn từ Match), chọn vai trò (để trống = *Company Admin*) → *Place sign-up*.',
      'Công ty **chưa có** (hoặc Match sai) → ⋮ → **Create company & activate** → form Create company mở với tên, MST, tên/email/điện thoại liên hệ điền sẵn → hoàn thiện và lưu. Lưu xong, hệ thống **tự đặt người đăng ký vào công ty vừa tạo**.',
      'Match chỉ ra công ty **trong Free data** → mở công ty đó, promote/gán chủ trước, rồi quay lại Move.',
      'Rác, trùng, không phải khách thật → ⋮ → **Archive** → ghi lý do (không bắt buộc) — **lý do này được email nguyên văn cho người đăng ký**, nên viết cho họ đọc.',
    ],
    watch: [
      'Chỉ **Move** và **Create company & activate** mới mở được đăng nhập cho người đó — và chỉ khi họ **cũng đã xác thực email**.',
      'Đừng coi một dòng sign-up là một khách hàng. Nó là **một yêu cầu**, và tới khi admin xử lý thì nó chưa là gì trong hệ thống.',
      '**Archive là từ chối thật**: người đăng ký nhận email từ chối ngay, dòng không bị xoá nhưng **không mở lại được**. Họ muốn thử lại thì đăng ký lại bằng email đó (email đã archive được dùng lại).',
      'Một email chỉ có **một** yêu cầu mở hoặc một tài khoản: đăng ký lần hai bằng cùng email bị chặn ngay trên Company site (*“This email already has an account or a sign-up in progress”*).',
    ],
    blocks: [
      { kind: 'h', text: '§1 Trạng thái' },
      {
        kind: 'table',
        heading: 'Vòng đời một dòng sign-up',
        note: 'Cột *Status* và cột *Email verified* là **hai trục riêng**. Bảng dưới là trục Status; trục email chỉ quyết định người đó **đăng nhập** được chưa.',
        cols: ['Trạng thái', 'Nghĩa', 'Vào bằng cách nào', 'Làm gì tiếp'],
        rows: [
          ['*New*', 'Chưa ai xử lý. Có thể đang *Awaiting* (chưa bấm link) hoặc *Verified*', 'Người dùng nộp form trên Company site', '*Move to existing company* · *Create company & activate* · *Archive* — **cả ba đều bấm được dù email chưa xác thực**'],
          ['*Resolved*', 'Đã đặt vào một công ty. Dòng phụ: “Moved to {công ty} · sign-in email sent”', 'Move, hoặc lưu form Create company mở từ sign-up', 'Hết — không có nút. Người dùng đăng nhập được **nếu email đã xác thực**'],
          ['*Archived*', 'Bị từ chối, dòng phụ là lý do', '*Archive*', 'Hết — không mở lại được'],
        ],
      },
      {
        kind: 'warn',
        text:
          '**Sửa một dòng cũ của trang này:** “dòng chưa xác thực email … archive được nhưng **không place được** — server từ chối Move/Create”. **Không còn đúng.** Build hiện tại: xác thực email **chỉ chặn đăng nhập, không chặn việc đặt** (`CompanySignup.placeable()` = còn *New*). HQ đặt được người chưa xác thực; tài khoản được tạo ở trạng thái chưa xác thực, và họ vào được ngay khi bấm link — lúc đó mới nhận email “đã sẵn sàng đăng nhập”.',
      },
      {
        kind: 'warn',
        text:
          '**Sửa thêm:** tài liệu cũ (và `docs/features/sign-ups.md` của repo admin) nói hai hộp thoại hỏi *sales owner*. **Build không hỏi.** Move không gửi sales owner — chủ của công ty đích giữ nguyên; với Create company & activate, chủ là cái bạn chọn trên form Create company.',
      },
      { kind: 'h', text: '§2 Danh sách, lọc, số liệu' },
      {
        kind: 'table',
        heading: 'Cột',
        cols: ['Cột', 'Ghi chú'],
        rows: [
          ['**Full name · Email · Phone**', 'Như người dùng nhập'],
          ['**Tax number**', 'MST họ gõ — Company site đã chặn MST *không tồn tại* hoặc *ngừng hoạt động* theo cổng đăng ký quốc gia, nhưng **không** kiểm MST đã có trên Saramin chưa'],
          ['**Company type**', '*Domestic* / *Abroad*, hoặc “—” cho sign-up sau khi form bỏ câu hỏi này (SRM-727) — “—” nghĩa là **không ai hỏi**, không phải trong nước'],
          ['**ERC**', 'Tên file giấy ĐKKD nếu có (không bắt buộc), hoặc *Not attached*. Bấm là mở ở tab mới'],
          ['**Company name · Hiring**', 'Tên họ gõ; “đang tuyển không?” — **tín hiệu ưu tiên cho sales**, không quyết định gì'],
          ['**Email verified**', '*Verified* (xanh) / *Awaiting* (vàng)'],
          ['**Match**', 'Danh sách công ty khớp, mỗi dòng gắn *Customers* hoặc *Free data*; rê chuột xem **khớp theo gì**'],
          ['**Status · When**', 'Trạng thái + dòng phụ; thời điểm nộp'],
        ],
      },
      {
        kind: 'list',
        heading: 'Lọc và số liệu',
        items: [
          'Tìm theo tên, email, công ty hoặc MST. Lọc *Status* (*New / Resolved / Archived*) và *Email verified* ba trạng thái: tất cả · *Verified (actionable)* · *Awaiting verification*.',
          'Sắp xếp: *Newest* (mặc định), *Oldest*, *Name A → Z*, *Name Z → A*.',
          '**Overview**: *Waiting* (chưa xử lý), *Overdue · 24h* (chờ quá 1 ngày — SLA là 1 ngày làm việc), *Arrived · 7 days*, *Resolved · 7 days*. Đọc hai số cuối cùng nhau: xử lý ít hơn số đến là đang tồn đọng.',
          '**Export** (`SIGNUPS`) theo bộ lọc đang chọn.',
        ],
      },
      {
        kind: 'table',
        heading: 'Cột Match — ba mức tin cậy khác nhau',
        note: '**Cột Match không quyết định gì.** Nó được tính lúc đọc, không lưu; việc duy nhất nó làm là **chọn sẵn công ty trong hộp thoại Move**.',
        cols: ['Khớp theo', 'Độ tin', 'Ghi chú'],
        rows: [
          ['**Mã số thuế** (gốc 10 số)', 'Danh tính', 'Trả về cả trụ sở **và các chi nhánh** cùng gốc MST'],
          ['**Tên miền email công việc**', 'Bằng chứng, không phải chứng cứ', 'So với địa chỉ, website, liên hệ của công ty. Email công cộng (@gmail.com…) **không bao giờ khớp**'],
          ['**Tên công ty gõ tay**', 'Đoán', 'Kiểm lại trước khi đặt ai vào'],
        ],
      },
      { kind: 'h', text: '§3 Ba lựa chọn — mỗi lựa chọn tạo ra gì' },
      {
        kind: 'table',
        heading: 'Ba lựa chọn — và mỗi lựa chọn tạo ra cái gì',
        note: 'Nộp form **không tạo ra bất cứ thứ gì**: không công ty, không tài khoản đăng nhập, không sản phẩm. Ba nút dưới đây là nơi thứ gì đó thực sự được tạo.',
        cols: ['Lựa chọn', 'Dùng khi', 'Tạo ra gì', 'Email cho người đăng ký'],
        rows: [
          ['**Move to existing company**', 'Công ty **đã có trong Customers**', 'Tài khoản đăng nhập (mật khẩu họ chọn lúc đăng ký) + thành viên công ty với vai trò đã chọn (mặc định *Company Admin*). Điền **tên ngắn** nếu công ty chưa có. **ERC đính kèm thành tài liệu của công ty** → công ty thành *Waiting to verify*', '“Đã duyệt — đăng nhập” **nếu email đã xác thực**; nếu chưa, gửi ngay lúc họ bấm link'],
          ['**Create company & activate**', 'Công ty **chưa có**, hoặc không công ty khớp nào đúng', 'Mở form Create company điền sẵn → lưu = **tạo công ty** (đủ kiểm MST như tạo thường) **rồi** Move người đăng ký vào', 'Như Move'],
          ['**Archive**', 'Rác, trùng, không phải khách thật', 'Không gì cả — dòng giữ lại, có audit', '**Email từ chối** kèm lý do bạn ghi'],
        ],
      },
      {
        kind: 'table',
        heading: 'Lỗi khi đặt — và cách gỡ',
        cols: ['Thông báo / tình huống', 'Nguyên nhân', 'Làm gì'],
        rows: [
          ['Hộp Move: *“This tax code reaches no company yet”*', 'Match rỗng', 'Dùng *Create the company first →* (hoặc *Create company & activate*)'],
          ['Hộp Move: *“That company is still in Free data”*', 'Mọi công ty khớp đều chưa có chủ', '*Open the company →*, promote/gán chủ, rồi Move'],
          ['*“This company has no tax code yet — set its MST before placing a sign-up into it”*', 'Công ty đích không có MST', 'Bổ sung MST trên hồ sơ công ty'],
          ['*“You can’t place accounts into this company — it is outside your reach”*', 'Công ty nằm ngoài sổ của bạn', 'Chọn công ty bạn mở được, hoặc nhờ manager'],
          ['Email đã có tài khoản / đang bị giữ', 'Email trùng một tài khoản nhà tuyển dụng, hoặc thuộc tài khoản vừa xoá (giữ 30 ngày)', 'Không đặt được bằng email này'],
          ['Create company lưu được nhưng báo lỗi đặt', 'Công ty **đã được tạo**; chỉ bước đặt người hỏng', '**Đừng tạo lại** (sẽ trùng MST). Quay lại Sign-ups, dùng *Move* vào công ty vừa tạo'],
        ],
      },
      {
        kind: 'warn',
        text:
          'Đối chiếu **MST** trước khi bấm Create — tạo mới trong khi công ty đã tồn tại là tạo ra bản ghi trùng, và sau này hoá đơn với quota sẽ nằm sai chỗ. Form Create company tự chặn MST đã có (và nêu tên công ty đang giữ), nhưng **chi nhánh** (`-001`) là MST khác — nếu Match báo cùng gốc MST, cân nhắc Move vào trụ sở/chi nhánh đã có.',
      },
      {
        kind: 'example',
        heading: 'Một sign-up từ form tới lần đăng nhập đầu',
        scenario: 'Chị Hà đăng ký cho Công ty CP Gỗ Minh Phát, MST 0312345678, đính kèm ERC, lúc 09:00. Saramin chưa có công ty này.',
        cols: ['Lúc', 'Ai / ở đâu', 'Chuyện gì xảy ra'],
        rows: [
          ['09:00', 'Company site', 'MST qua kiểm cổng đăng ký; nộp form → màn “Your request is in”. Email chứa link xác thực (30 phút)'],
          ['09:05', 'Hà bấm link', '*Email verified* = *Verified*. Hà thử đăng nhập → Company site báo yêu cầu **đang chờ duyệt**'],
          ['10:30', 'HQ · Sign-ups', 'Dòng *New*, Match *Not match* → *Create company & activate* → hoàn thiện người mua + địa chỉ hoá đơn, chọn sales owner → lưu'],
          ['10:31', 'Hệ thống', 'Công ty mới; Hà là *Company Admin*; ERC thành tài liệu → công ty *Waiting to verify*; dòng sign-up *Resolved*; Hà nhận email “đăng nhập được”'],
          ['Sau đó', 'Admin · hồ sơ công ty', '**Verify company** sau khi xem ERC → Hà mới **tạo được tin nháp**, Sales mới **xin được hoá đơn GTGT**'],
        ],
      },
      {
        kind: 'open',
        text:
          '**Giao lead cho người khác chưa có nút.** svn-be có quyền và API giao lead (`signup:assign`, V299), và tầm nhìn của *sale_leader/sale_member* phụ thuộc vào việc lead đã được giao cho ai — nhưng trang Sign-ups (build 45954108) **không có thao tác “Hand over”** (chuỗi i18n có, nút thì không). Hệ quả: một *sale_member* chỉ đọc lead của mình sẽ thấy hộp thư rỗng. Cần chốt: thêm nút giao lead, hay để Sign-ups là việc của HQ/vn_sales.',
      },
      {
        kind: 'open',
        text:
          '**Tự duyệt khi Match trúng MST** là câu hỏi mở trong spec, **chưa phải hành vi** — mọi dòng vẫn chờ người bấm.',
      },
      { kind: 'p', text: '**Màn hình thật.** Ảnh chụp trước khi trang có thẻ *Overview*, bộ sắp xếp và các cột *Company type*, *ERC* — phần còn lại như ảnh.' },
      {
        kind: 'shot',
        src: '/shots/41-signups.jpg',
        where: 'Admin',
        caption: 'Hàng đợi đăng ký mới từ site nhà tuyển dụng.',
      },
    ],
  },

  /* ── Company documents ──────────────────────────────────────────────────── */
  'company-documents': {
    logic: [
      '**Trang này đã bị gỡ khỏi console ngày 06/10/2026** (commit `011ff9c5` của saramin-vn-admin): route `/crm/company-documents`, mục menu và hàng đợi đều không còn. Mở đường dẫn cũ sẽ không ra trang nào.',
      'Việc nó từng làm — **xét giấy ĐKKD (ERC) khách nộp** — giờ nằm **trên hồ sơ công ty**: thẻ *Verification documents* (xem file) và nút **Verify company** ở đầu trang (quyền `company:verify`, seed cho *hq_admin* và *vn_ops*; *sale_leader* **không** có).',
      'Xác minh là **một trạng thái của công ty, không phải của từng file**. Hệ thống **chỉ lưu một sự thật** — ai bấm Verify và lúc nào; hai nhãn còn lại được **suy ra** từ việc có giấy tờ dùng được hay không.',
      '**Verified mở khoá hai thứ**: nhà tuyển dụng **tạo tin nháp** trên Company site, và Sales **xin hoá đơn GTGT** cho một PO. Đăng tin công khai có cổng riêng (công ty Active + có MST).',
    ],
    how: [
      'Tìm công ty cần xét: danh sách **Customers** có cột *Verification* — dòng *Waiting to verify* (vàng) là việc đang chờ Saramin.',
      'Mở hồ sơ → thẻ *Verification documents* → mở từng file (link tạo lúc bấm, hết hạn nhanh) → đối chiếu tên pháp lý, MST, địa chỉ với hồ sơ.',
      'Khớp → **Verify company** → xác nhận. Công ty thành *Verified* ngay.',
      'Chưa có giấy tờ (*Unverified*) → hộp thoại không cho Verify mà đưa bạn tới thẻ giấy tờ: xin khách nộp trên Company site, hoặc tự tải file lên (PDF/JPG/PNG, tối đa 10 MB/file).',
    ],
    watch: [
      '**Sửa MST hoặc thông tin người mua (xuất hoá đơn) sẽ tự huỷ Verified** — công ty quay về *Waiting to verify* (hoặc *Unverified*) và phải Verify lại. Sửa địa chỉ liên hệ hay mô tả thì không.',
      '**Không có nút huỷ Verify trên màn hình** (API có, chưa có nút). Verify nhầm thì cách duy nhất từ console là sửa trường danh tính như trên — nên kiểm kỹ trước khi bấm.',
      'File **admin tự tải lên** được tính là đã duyệt ngay; file **khách nộp** từ Company site ở trạng thái chờ. Cả hai đều đủ để công ty thành *Waiting to verify* — chỉ file **bị từ chối** mới không tính.',
    ],
    blocks: [
      {
        kind: 'warn',
        text:
          '**Sửa toàn bộ nội dung cũ của trang này.** Mô tả trước đây (hai tab *Documents* và *Legal changes*, duyệt/từ chối từng giấy tờ, “duyệt xong công ty mới Verified”) là đúng **đến 06/10/2026**. Build hiện tại không còn trang, không còn hai tab, và **không còn thao tác duyệt/từ chối từng file** trong console — chỉ còn **Verify company** trên hồ sơ.',
      },
      { kind: 'h', text: '§1 Ba nhãn xác minh của một công ty' },
      {
        kind: 'table',
        heading: 'Trạng thái xác minh (cột *Verification* trên Customers, nhãn trên hồ sơ và trên Company site)',
        cols: ['Nhãn', 'Nghĩa', 'Vào bằng cách nào', 'Làm gì tiếp'],
        rows: [
          ['*Unverified* (xám) — “Thiếu hồ sơ”', 'Không có giấy tờ dùng được. Bóng ở phía khách', 'Mặc định khi tạo; hoặc mọi file đều bị từ chối', 'Xin khách nộp ERC, hoặc admin tải lên'],
          ['*Waiting to verify* (vàng)', 'Có giấy tờ, **Saramin chưa quyết** — đây là hàng đợi', 'Khách nộp file; admin tải file; ERC đính kèm lúc đăng ký được chuyển sang khi đặt sign-up; hoặc sửa MST/người mua làm mất Verified', '**Verify company**'],
          ['*Verified* (xanh dương, có khiên)', 'Một admin đã xác nhận giấy tờ', '**Verify company**', 'Hết. Tự quay lại hai nhãn trên nếu MST hoặc người mua bị sửa'],
        ],
      },
      {
        kind: 'table',
        heading: 'Verified chặn/mở khoá những gì',
        cols: ['Hành động', 'Chưa Verified', 'Thông báo khi bị chặn'],
        rows: [
          ['Nhà tuyển dụng **tạo tin nháp** (Company site)', '**Bị chặn**', '*“This company is not verified yet (…) — a job cannot be created until its paperwork is verified”*'],
          ['Sales **xin hoá đơn GTGT** cho một PO', '**Bị chặn**', '*“This company is not verified yet — the official invoice cannot be requested until an admin has verified its paperwork”*'],
          ['**Đăng tin công khai**', 'Không xét Verified — xét công ty *Active* + có MST', '—'],
          ['Bấm **Verify company** khi *Unverified*', '409', '*“This company has no paperwork on file yet — there is nothing to verify”*'],
        ],
      },
      { kind: 'h', text: '§2 Giấy tờ đến từ đâu' },
      {
        kind: 'table',
        heading: 'Ba đường một file vào hồ sơ công ty',
        cols: ['Đường', 'Ai', 'Trạng thái file', 'Ghi chú'],
        rows: [
          ['Hồ sơ công ty → *Verification documents*', 'Admin / Sales', 'Duyệt sẵn', 'Business licence · Tax registration · Signed contract; PDF/JPG/PNG ≤ 10 MB. Xoá được (*Remove*). Form Create company cũng có ô này — file tải sau khi công ty được tạo'],
          ['Company site → *Thông tin doanh nghiệp* (`/company-join`)', '*Company Admin* của khách (quyền `company:update` phía khách)', 'Chờ', 'Khách rút lại được khi còn chờ. Hiện nhãn xác minh của công ty ở góc trang'],
          ['ERC đính kèm lúc **đăng ký**', 'Người đăng ký', 'Chờ', 'Chỉ thành tài liệu của công ty **khi sign-up được đặt** vào công ty đó (xem trang Sign-ups)'],
        ],
      },
      {
        kind: 'warn',
        text:
          '**Yêu cầu đổi thông tin pháp lý của khách giờ không ai trả lời được.** Company site vẫn cho *Company Admin* gửi yêu cầu đổi tên pháp lý / MST / địa chỉ (và **khoá các ô đó trong lúc chờ**), nhưng tab *Legal changes* đã bị gỡ cùng trang này và **không có màn hình thay thế**. API svn-be vẫn còn. Khi khách báo “đang chờ duyệt đổi thông tin”: Admin sửa trực tiếp trên hồ sơ công ty (MST sửa được qua form sửa từ SRM-358 — chứng từ đã phát hành giữ mã cũ), còn yêu cầu của khách sẽ **treo ở trạng thái chờ** cho tới khi họ tự rút.',
      },
      {
        kind: 'open',
        text:
          '**Từ chối một file khách nộp** không còn làm được từ console (nút nằm ở trang đã gỡ; thẻ giấy tờ trên hồ sơ cố ý không có duyệt/từ chối). File sai vẫn làm công ty hiện *Waiting to verify*. Cần chốt: thêm *Reject* vào thẻ giấy tờ, hay xử lý ngoài hệ thống. Đã kiểm `company-documents-panel.tsx` và `011ff9c5`.',
      },
      {
        kind: 'example',
        heading: 'Từ lúc khách nộp ERC tới lúc tạo được tin',
        scenario: 'Công ty TNHH Bình An vừa được tạo (không file), Company Admin là anh Tuấn.',
        cols: ['Bước', 'Ai', 'Nhãn xác minh', 'Khách làm được gì'],
        rows: [
          ['1', '—', '*Unverified*', 'Đăng nhập; **không** tạo được tin nháp'],
          ['2', 'Tuấn nộp ERC ở *Thông tin doanh nghiệp*', '*Waiting to verify*', 'Vẫn chưa tạo được tin'],
          ['3', 'Admin mở hồ sơ, xem file, **Verify company**', '*Verified*', 'Tạo tin nháp được; Sales xin được hoá đơn GTGT'],
          ['4', 'Sales sửa MST trên hồ sơ (gõ nhầm)', '*Waiting to verify*', '**Mất** quyền tạo tin nháp và xin hoá đơn cho tới khi Verify lại'],
        ],
      },
    ],
  },

  /* ── Call logs ──────────────────────────────────────────────────────────── */
  'call-logs': {
    logic: [
      'Lịch sử cuộc gọi đồng bộ từ tổng đài **Callio**. Đây là **bản sao, không phải nguồn gốc** — trang không sửa được một cuộc gọi; việc duy nhất là **gắn cuộc gọi vào đúng công ty** khi hệ thống không tự gắn được.',
      '**Chỉ cuộc gọi đi (outbound) được lưu** — từ 07/10/2026; cuộc gọi đến và gọi nội bộ bị bỏ ngay khi về. Dữ liệu cũ hơn có thể còn vài dòng gọi đến.',
      '**Không có dữ liệu khách nào đi sang Callio** (yêu cầu bảo mật của khách hàng): không đồng bộ danh bạ, không đẩy liên hệ. Sales copy số, gọi trong Callio; chỉ **bản ghi cuộc gọi** quay về.',
      '**Một cuộc gọi gắn vào công ty bằng số điện thoại — và chỉ qua bảng Liên hệ.** Số nằm trên **đúng một** công ty (ở một liên hệ của nó) → gắn công ty, và gắn luôn **người liên hệ** nếu đúng một người giữ số đó. Số máy tổng đài (`company.phone`) và số liên hệ chính gõ ở form tạo công ty **không** được dùng để khớp.',
      'Quyền: trang cần `telephony_call:read`. *hq_admin*, *vn_ops*: đọc tất cả + `assign` (Needs assigning, gắn, lưu trữ, Sync) + `listen` (nghe ghi âm). *vn_sales*: chỉ đọc **cuộc gọi của chính mình**, **không** nghe ghi âm, **không** thấy Needs assigning. Export đi theo quyền đọc.',
    ],
    how: [
      '**Gọi**: trên hồ sơ công ty, tab *Activity* → nút **Call** (hoặc biểu tượng điện thoại ở tab *Contacts*) → chọn số → **Call** mở widget gọi của Callio (rep đăng nhập Callio ngay trong widget) và chép số vào clipboard; hoặc **Copy** rồi dán vào Callio. Widget không tải được thì mở `client.callio.vn` ở tab mới.',
      'Cuộc gọi kết thúc → Callio báo về trong khoảng **15 giây**; lịch chạy mỗi **10 phút** đọc lại **3 giờ** gần nhất. Nút **Sync from Callio** chạy đúng hai bước đó ngay (cần quyền `assign`).',
      'Xem: tab **Stats by rep** (mặc định), **All calls**, **Needs assigning**, **Archived**. Lọc theo *Sales owner* (nhiều người), *Status*, *Call duration*, *Company*, khoảng ngày; tìm theo **số điện thoại**; tab *All calls* có thêm lọc *State*.',
      '**Gắn tay** (Needs assigning): *Several companies* → chọn công ty ngay trong ô **Company**; *No company* → ⋮ **Assign**; *No rep* → ⋮ **Set rep**. Không phải việc khách → ⋮ **Archive**.',
    ],
    watch: [
      '**Không gọi điện được từ trang Call logs.** Callio không có API quay số; nút Call ở hồ sơ công ty chỉ **chuyển** sang widget Callio. `tel:` cố ý không dùng — trên Mac nó gọi qua iPhone và Callio **không bao giờ biết** cuộc gọi đó.',
      '**Gọi số tổng đài / số liên hệ chính trên hồ sơ sẽ rơi vào Needs assigning** nếu số đó không nằm trên một *Liên hệ*. Hộp chọn số của nút Call vẫn liệt kê hai số này. Muốn tự gắn: lưu số vào một liên hệ của công ty.',
      'Rep (*vn_sales*) mở trang sẽ thấy tab *Stats by rep* lỗi: bảng xếp hạng là **so sánh giữa người**, server từ chối người chỉ được đọc cuộc gọi của mình. Họ dùng tab *All calls*.',
      'Nút *Play* chỉ hiện với người có `listen`; link ghi âm được lấy mới mỗi lần bấm (link Callio hết hạn ~3 giờ). Callio đã xoá file thì báo *“Callio no longer has a recording for this call”* — không phải lỗi CRM.',
    ],
    blocks: [
      { kind: 'h', text: '§1 Trạng thái gắn của một cuộc gọi (cột *State*)' },
      {
        kind: 'table',
        heading: 'Cột *State* — một cuộc gọi đã nằm trên công ty chưa, và vì sao',
        note: 'Ba trạng thái vàng là **Needs assigning**: mỗi dòng là một cuộc trò chuyện với khách đang **thiếu** trong lịch sử của một công ty. Đó là cảnh báo việc cho người, không phải lỗi đồng bộ.',
        cols: ['State (UI)', 'Nghĩa', 'Vào bằng cách nào', 'Làm gì tiếp'],
        rows: [
          ['*Pending*', 'Vừa về, chưa xử lý', 'Webhook / lịch đồng bộ; hoặc được xếp lại hàng để khớp lại', 'Tự xử lý ở lượt kế tiếp (≤ 10 phút) hoặc khi bấm Sync'],
          ['*On the company*', 'Đã gắn công ty (và người liên hệ nếu xác định được); **đồng hồ Idle của công ty được đặt lại**', 'Cuộc gọi **được nghe máy**, số khớp đúng một công ty, máy lẻ có chủ; hoặc được gắn tay', 'Không có nút. Không lưu trữ, không gắn lại được'],
          ['*No company*', 'Không công ty nào giữ số này', 'Khớp số không ra', '**Assign**, hoặc thêm số vào một liên hệ (lượt sau tự khớp) · **Archive**'],
          ['*Several companies*', 'Nhiều công ty giữ số này', 'Khớp số ra > 1', '**Chọn công ty trong ô Company** (chỉ hiện các công ty đang giữ số) hoặc **Assign** · **Archive**'],
          ['*No rep*', 'Số đã khớp, nhưng **máy lẻ** gọi đi chưa gắn với nhân viên nào', 'Máy lẻ không có chủ tại thời điểm gọi', '**Set rep** — mọi cuộc đang chờ trên máy lẻ đó được xếp lại và gắn ở lượt kế tiếp · **Archive**'],
          ['*Not logged*', 'Cuộc gọi **không ai nghe** (nhỡ, bận, lỗi, bỏ ngang). **Vẫn gắn công ty/người liên hệ** nếu số khớp đúng một — nhưng **không** đặt lại đồng hồ Idle, **không** tính KPI', 'Không được trả lời', 'Không có nút'],
          ['*Archived*', 'Không phải việc khách (spam, nhầm số, việc riêng)', '**Archive this call**, **Archive all calls from this number**, hoặc chọn nhiều → *Archive N selected*', '**Unarchive** — đưa về và khớp lại ngay'],
        ],
      },
      {
        kind: 'warn',
        text:
          '**Hệ thống CÓ khớp lại cuộc gọi đang chờ** — trái với nhận định “build không bao giờ khớp lại” trong ghi chú đề xuất. Mỗi lượt (10 phút hoặc Sync), các cuộc *No company*, *Several companies* và *Not logged* chưa có công ty được **xếp lại hàng** nếu số của chúng **vừa được thêm/sửa trên một liên hệ** sau lần quyết định trước — rồi khớp như cuộc mới. (`CallProjectionService.requeueCallsMatchableAgain`, svn-be SRM-754, sửa thêm 08/10 với cột `projected_at`.) Vậy: **lưu số vào liên hệ là đủ**, không cần gắn tay từng cuộc.',
      },
      { kind: 'h', text: '§2 Một cuộc gọi được gắn vào công ty như thế nào' },
      {
        kind: 'table',
        heading: 'Bảng quyết định của hệ thống, theo thứ tự',
        cols: ['Kiểm', 'Nếu…', 'Kết quả'],
        rows: [
          ['1 · Hướng và kết quả', 'Gọi nội bộ, hoặc **không được nghe máy**', '*Not logged* — vẫn thử khớp số (đúng một công ty → gắn công ty + người liên hệ), không đụng đồng hồ Idle'],
          ['2 · Số bị lưu trữ', 'Số nằm trong danh sách “Archive all calls from this number”', '*Archived* — vẫn gắn công ty nếu số khớp đúng một'],
          ['3 · Khớp số qua **Liên hệ**', '0 công ty / > 1 công ty', '*No company* / *Several companies*'],
          ['4 · Người liên hệ', 'Đúng một liên hệ của công ty đó giữ số', 'Gắn người đó vào cột *Contact person* (hai người cùng số → để trống, không đoán)'],
          ['5 · Ai gọi', 'Máy lẻ chưa có chủ', '*No rep* — **giữ** công ty đã khớp, chờ Set rep'],
          ['6 · Đủ cả', '—', '*On the company* + đặt lại `last contact` của công ty'],
        ],
      },
      {
        kind: 'list',
        heading: 'Gắn tay — ba cách, cùng một luật',
        items: [
          '**Chọn trong ô Company** (*Several companies*): chỉ liệt kê các công ty đang giữ số; xác nhận *“Assign this call to {company}?”* — gắn **cuộc này và mọi cuộc đang chờ khác từ cùng số**. Không có quyền `assign` thì ô chỉ hiện “—”.',
          '**Assign** (*No company* / *Several companies*): chọn *Company* (bắt buộc) và *Contact person* — một liên hệ có sẵn, **+ New contact person** (form liên hệ điền sẵn số của cuộc gọi), hoặc *Company only*. *Also assign every other waiting call from {number}* bật sẵn. Chọn *Company only* hoặc một liên hệ giữ số khác thì **số không được lưu** → các cuộc sau từ số này sẽ lại vào Needs assigning.',
          '**Set rep** (*No rep*): chọn nhân viên dùng máy lẻ đó. Nếu máy lẻ đang thuộc người khác thì bị chuyển — cuộc cũ của họ vẫn là của họ.',
          'Người được ghi công **luôn là chủ máy lẻ đã gọi**, không phải người gắn — để người gắn không “ăn” KPI của người gọi.',
        ],
      },
      { kind: 'h', text: '§3 Danh sách và các tab' },
      {
        kind: 'table',
        heading: 'Cột của All calls / Needs assigning / Archived',
        note: 'Định dạng thời gian `YYYY-MM-DD HH:mm:ss` và thời lượng `HH:mm:ss` cố ý giống CRM cũ, để đối chiếu từng dòng. Mặc định sắp **mới nhất trước**; bấm tiêu đề cột để server sắp lại.',
        cols: ['Cột', 'Hiện gì'],
        rows: [
          ['**Call ID**', 'Mã cuộc gọi của Callio — có nút copy'],
          ['**Record**', 'Nút *Play* (cần `listen`) → trình phát ngay trong dòng'],
          ['**Phone**', 'Số của **phía bên kia** — chính là số dùng để khớp'],
          ['**IPPhone**', 'Máy lẻ đã gọi'],
          ['**Sales owner**', 'Người được ghi công; máy lẻ chưa có chủ hiện “ext {n} — not bound”'],
          ['**Start time · End time**', 'End time trống khi Callio chưa đóng cuộc gọi'],
          ['**Status**', '*Answered* · *Missed* · *Busy* · *Failed* · *Abandoned*'],
          ['**Call duration**', 'Thời gian nói chuyện'],
          ['**Company · Contact person**', 'Công ty và người liên hệ đã gắn; ô Company là hộp chọn khi *Several companies*'],
          ['**State**', 'Xem §1'],
        ],
      },
      {
        kind: 'list',
        heading: 'Tab, lọc, xuất',
        items: [
          '**Stats by rep** — mỗi nhân viên một dòng trong 30 ngày gần nhất: *N of Call out*, *N of Successful Call out*, *N of Rejected Call out*, *N of Call In*, *Talk time*, có dòng *Total*. Bảng xếp hạng đầy đủ ở trang **Ranking**.',
          '**All calls** — mọi cuộc gọi bạn được đọc; lọc thêm *State*. **Needs assigning** = *No company* + *Several companies* + *No rep* (chỉ người có `assign`). **Archived** — chỗ để *Unarchive*. Mỗi tab hiện số dòng theo bộ lọc đang chọn.',
          'Mọi bộ lọc nằm trong URL (`?owner=`, `?outcome=`, `?companyId=`, `?from=`, `?to=`, `?duration=`) — gửi link là người kia thấy đúng bộ lọc. Cột và bộ lọc *Call type* đã bị ẩn (08/10) vì chỉ còn cuộc gọi đi.',
          '**Archive hàng loạt**: tick các cuộc đang chờ (cuộc đã gắn có ô tick bị khoá) → *Archive N selected* — tối đa 200; chỉ lưu trữ **cuộc gọi**, không lưu trữ **số**. Lựa chọn giữ qua các trang, mất khi đổi tab.',
          '**Export** (`CALL_LOGS`) xuất đúng bộ lọc đang xem — file chính là màn hình.',
        ],
      },
      { kind: 'h', text: '§4 Cuộc gọi hiện trên hồ sơ công ty (PR #560, 08/10/2026)' },
      {
        kind: 'list',
        items: [
          'Tab *Activity* của công ty giờ **trộn các cuộc gọi Callio đã gắn vào công ty** với các hoạt động rep ghi tay, mới nhất trước. Một dòng cuộc gọi đọc: **Call** · tên rep · “Callio call”; phần chi tiết là *người liên hệ · số*, nhãn kết quả (*Answered*, *Missed*…), thời lượng `HH:mm:ss` và nút *Play*.',
          'Bao gồm **mọi** cuộc đã mang công ty này — kể cả *Not logged* (không ai nghe) và *Archived* có công ty. Cuộc gọi được tính vào bộ lọc **Sales** và **All**; không có tab Callio riêng.',
          'Chỉ hiện với người có `telephony_call:read`, và theo đúng tầm nhìn đó: *vn_sales* chỉ thấy **cuộc gọi của chính mình** trên công ty. Feed lấy **trang đầu (20 cuộc)** mới nhất; số đếm ở đầu feed cộng cả hoạt động lẫn cuộc gọi.',
          'Cuộc gọi **không** được ghi thành một hoạt động trong DB (từ V293) — feed chỉ đọc chung hai nguồn. Các dòng “Callio sync” cũ (trước V293) bị ẩn để không hiện hai lần.',
        ],
      },
      {
        kind: 'example',
        heading: 'Một cuộc gọi từ nút Call tới feed của công ty',
        scenario: 'Rep Minh (máy lẻ 1203) gọi chị Thu, liên hệ của Công ty Ánh Dương, số 0912 345 678 đã lưu trên liên hệ. Cuộc thứ hai gọi số tổng đài 028 3812 3456 — số này chỉ nằm trên hồ sơ công ty.',
        cols: ['Lúc', 'Chuyện gì xảy ra', 'Call logs', 'Hồ sơ Ánh Dương'],
        rows: [
          ['10:00', 'Activity → *Call* → chọn chị Thu → widget Callio quay số; nói 4 phút', '—', '—'],
          ['10:04', 'Callio báo về; số khớp đúng 1 công ty, 1 liên hệ; máy lẻ 1203 thuộc Minh', '*On the company* · Contact person: Thu', 'Dòng **Call · Minh · Callio call** · *Answered* 00:04:02 · Idle đặt lại'],
          ['10:10', 'Gọi số tổng đài, có người nghe', '*No company* → Needs assigning', 'Không hiện'],
          ['10:15', 'Admin mở Ánh Dương, thêm 028 3812 3456 vào liên hệ “Lễ tân”', 'Lượt kế tiếp (≤ 10:25): cuộc 10:10 về *Pending* → *On the company* · Contact: Lễ tân', 'Cuộc 10:10 xuất hiện trên feed'],
        ],
      },
      {
        kind: 'open',
        text:
          '**Đề xuất “gắn cuộc gọi ngay khi gọi” (07/10/2026) chưa được build.** Spec có luồng: nút **Copy** ghi một “CRM call” rồi ghép với cuộc Callio cùng rep + cùng số trong khoảng −2/+30 phút; cột *Linked by* (CRM call · Number · Rep · Admin / Waiting); rep tự chọn công ty khi số trùng nhiều công ty (quyền mới `telephony_call:pick_own`); nút *Sync from CRM*; mỗi cuộc được nghe máy thành **một** hoạt động bán hàng. Build 45954108 / ee1db5ea9 **không có** các phần này: nút là *Call* (widget) + *Copy* chỉ chép số; chỉ người có `assign` chọn được công ty; gắn chỉ dựa vào số trên liên hệ; nút đồng bộ là *Sync from Callio*. Không có pop-up “You just called…”, khay “Calls to link” hay form *Link* — cả trong build lẫn trong đề xuất đã chốt.',
      },
      {
        kind: 'open',
        text:
          '**Phạm vi `team` của rep đang thực thi là “chỉ của mình”.** *vn_sales* giữ `telephony_call:read` ở phạm vi `team`, nhưng server chỉ phân biệt “all” với “không all” → trưởng nhóm có grant `team` cũng chỉ thấy cuộc của chính mình. Chưa có role nào bị thiếu vì việc này; mở rộng cần thêm phân giải cây tổ chức cho cuộc gọi.',
      },
    ],
  },
}
