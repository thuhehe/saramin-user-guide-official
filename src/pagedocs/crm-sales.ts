import type { PageDoc, ModuleDoc } from '../docs'

/*
 * CRM — the selling half: Companies, Pipeline, Quotations, Purchase orders, Invoices.
 *
 * Each entry REPLACES PAGE_DOCS[key] wholesale. The shared logic of the chain (five status axes,
 * the document chain, numbering, roles) lives once in MODULE_DOCS.CRM and is pointed at, not
 * repeated. What lives here is what one screen does.
 *
 * Checked against origin/dev on 2026-10-08:
 *   saramin-vn-admin 45954108 · svn-be ee1db5ea9 (svn-web d8a43a11 not needed for this slice).
 * Main sources: admin src/modules/crm/{companies,pipeline,quotations,purchase-orders,invoices}/,
 * src/i18n/messages/en/*.json, src/configs/admin-pages.config.ts; svn-be
 * docs/crm-company/{quote-po-invoice,pipeline}.md, domain/sales/{Quote,QuoteStatus,DiscountMode}.java,
 * InvoiceService, PurchaseOrderEmailService, QuoteQueryRepository.onTheBoard, V674.
 */

export const CRM_SALES_PAGE_DOCS: Record<string, PageDoc> = {
  /* ───────────────────────────── Companies ───────────────────────────── */
  companies: {
    logic: [
      'Một hồ sơ công ty là gốc của mọi thứ bán được cho khách đó: báo giá, PO, hoá đơn, quota, tin tuyển dụng.',
      'Ba trạng thái công ty nằm trên **cùng một mục menu, ba tab**: *Assigned* (có sales owner) · *Free data* (chưa ai giữ) · *Archived*. Cùng một bảng, cùng quyền `company:read`, cùng trang chi tiết `/crm/companies/:id`.',
      'Quota khách đang giữ xem ở tab **Products & billing** trong chính hồ sơ này.',
      'Năm trục trạng thái của công ty (Company status · Customer status · Verification · Pipeline · Sales owner) được giải thích **một lần** ở *Logic chung — CRM*. Trang này chỉ nói màn hình làm gì với chúng.',
    ],
    how: [
      '**+ New company** (cần `company:create`) — trên tab *Assigned* tạo công ty có owner; trên tab *Free data* cùng nút đó tạo dòng **chưa có owner** (`?unassigned=1`).',
      'Form tạo: **Tên pháp lý** luôn bắt buộc. Với công ty có owner còn bắt buộc **MST** (chỉ khi *Company type = Domestic* / buyer *Vietnamese business*), **Địa chỉ đăng ký**, **tên người liên hệ** và **điện thoại HOẶC email** (một trong hai là đủ). Dòng Free data chỉ cần tên.',
      'Bấm **Check** cạnh MST để tra cổng đăng ký kinh doanh quốc gia: điền sẵn tên và địa chỉ; MST **đã ngừng hoạt động thì không tạo được**.',
      'Xác minh: khách (hoặc nhân viên) tải giấy ĐKKD vào *Company documents* → người có `company:verify` bấm **Verify company** trên hồ sơ → công ty thành **Verified**.',
      'Xem khách đã mua gì và còn bao nhiêu: mở công ty → tab **Products & billing**.',
      'Bán tiếp: từ trong hồ sơ công ty bấm **+ Create quotation** (không có trên dòng Free data).',
    ],
    watch: [
      'MST trùng sẽ bị từ chối kèm link sang công ty đang giữ MST đó — mở công ty đó, đừng tạo bản thứ hai.',
      'Công ty chưa **Verified** thì không đăng tin được, dù đã có quota — và sales cũng **không bấm được Request official invoice** trên PO của nó.',
      '**MST chỉ ghi một lần.** Sau khi lưu, không màn hình nào trong admin sửa được MST — gõ sai là phải xử lý như bản ghi trùng (Archive lý do *Duplicate / created by mistake*) rồi tạo lại.',
      '**Archive là lối ra cuối cùng trên giao diện.** Không có nút *Restore* ở đâu cả (xem cảnh báo bên dưới).',
      'Rep mở công ty của người khác thấy banner *read-only* và mọi nút sửa biến mất — **không phải lỗi**, đó là quyền `company:update_others` mà rep thường không có.',
    ],
    blocks: [
      { kind: 'h', text: '§1 · Danh sách — ba tab', path: '/crm/companies' },
      {
        kind: 'table',
        heading: 'Ba tab, ba bộ cột riêng',
        note: 'Mỗi tab nhớ cột ẩn/hiện riêng, nên ẩn một cột ở tab này không ẩn ở tab kia. Đường dẫn cũ `/crm/free-data` và `/crm/companies/archived` tự chuyển về đúng tab.',
        cols: ['Tab', 'Chứa gì', 'Cột', 'Lọc / tìm / sắp xếp'],
        rows: [
          [
            '**Assigned** (mặc định)',
            'Công ty *Active* có sales owner — sổ khách hàng',
            'Name · Company ID · Industry · Location · Owner · Status (khách hàng) · Verified · Tier 2026 · Pipeline · Idle · Latest note · Total revenue · Latest revenue',
            'Tìm theo tên, tên ngắn, MST. Lọc trên đầu cột: trạng thái khách, chặng pipeline, hạng (kể cả *No tier*), ngành, khu vực, owner. Tab *Mine / My team’s / All*. Sắp: mới nhất (mặc định) · lâu chưa liên hệ · tên · doanh thu · hạng',
          ],
          [
            '**Free data**',
            'Công ty *Active* **không có owner** — bể dữ liệu',
            'Company · Company ID · Contact person · Email · Phone · Tax code (unverified) · Province · Industry · Source · Status (*Not claimed* / *Waiting · step 1 · Admin* / *Waiting · step 2 · Sales lead*)',
            'Tìm tên, tên ngắn, MST. MST ở đây **chưa xác minh** — nó đến từ danh bạ công khai và được kiểm lại khi có người claim',
          ],
          [
            '**Archived**',
            'Công ty đã nghỉ — sổ đăng ký, luôn là tab cuối và không bao giờ mở mặc định',
            'Name · Company ID · Reason · Note · Archived on · Archived by · Owner · Total revenue',
            'Lọc lý do, owner. **Không giới hạn theo sổ của bạn**: “công ty này bị archive vì sao” thường được hỏi về công ty không phải của mình',
          ],
        ],
      },
      {
        kind: 'list',
        heading: 'Thanh công cụ trên đầu danh sách',
        items: [
          '**Overview** — bật/tắt bốn thẻ số liệu cho cả sổ: *My customers* · *New* (đã thắng nhưng chưa phát sinh giao dịch — cuộc gọi onboarding) · *Churn risk* (12 tháng không có đơn mới) · *Unassigned* (Free data chưa ai giữ).',
          '**Bulk upload** — **khác nhau theo tab**, có chủ đích. Trên *Free data*: tải file .xlsx để **tạo** công ty mới; mọi dòng vào Free data không có owner, MST đã có trong hệ thống thì **bỏ qua, không ghi đè**; lỗi từng dòng báo theo số dòng (*No legal name · Invalid tax code · Tax code exists · Twice in this file*). Trên *Assigned*: file hai cột **Company ID + email sales** để **chuyển owner** cho công ty đã có — không tạo gì; ô email trống bị từ chối, **không** hiểu thành “trả về pool”.',
          'Cả hai upload đều **xem trước rồi mới ghi**: màn hình báo “N trên M dòng sẽ được tạo/gán, chưa có gì thay đổi” trước khi bấm áp dụng.',
          '**Export** (quyền `company:export`) xuất đúng tập đang lọc, cho cả ba tab.',
          'Cột **Idle** đổi màu cảnh báo khi lâu không liên hệ. Đồng hồ này chỉ chạy lại khi có **liên hệ thật**: hoạt động sales ghi tay, hoặc cuộc gọi Callio đã gắn vào công ty. Đăng tin hay mở CV **không** làm mới nó.',
          'Cột **Pipeline** đọc từ **một thẻ đại diện** của công ty (thẻ đang mở, nếu không thì thẻ đóng gần nhất), kèm chữ *won* / *lost* khi thẻ đó đã đóng.',
        ],
      },

      { kind: 'h', text: '§2 · Tạo công ty', path: '/crm/companies/new' },
      {
        kind: 'table',
        heading: 'Trường nào bắt buộc — phụ thuộc loại công ty và tab',
        note: 'Dòng Free data (`?unassigned=1`) chỉ bắt buộc **tên pháp lý**; mọi trường khác để trống được. Các thông báo lỗi trích nguyên văn từ console.',
        cols: ['Trường', 'Công ty có owner', 'Luật / thông báo'],
        rows: [
          ['**Company type**', 'Chọn sẵn *Domestic*', '*Domestic* hay *Foreign* quyết định các loại người mua hoá đơn được chào bên dưới'],
          ['**Buyer type** (Thông tin xuất hoá đơn)', 'Chọn sẵn *Vietnamese business*', 'Bốn loại: *Vietnamese business · Foreign business · Individual with CCCD · Individual without CCCD*. Cá nhân có CCCD cần **họ tên + CCCD 9–12 số**; cá nhân không CCCD thì hoá đơn chỉ in “Bán cho người tiêu dùng” và người mua **không khấu trừ chi phí được**'],
          ['**MST**', 'Bắt buộc với công ty trong nước', '10 số, hoặc 10 số + `-001` cho chi nhánh — *“Tax code must be 10 digits, optionally followed by “-” and 3 digits.”* Tra cổng: *not found* / *no longer operating* (chặn tạo) / *cannot be verified right now* (thử lại). Công ty nước ngoài không có ô MST, chỉ có *Foreign tax ID (reference)* tuỳ chọn'],
          ['**Tên pháp lý**', 'Bắt buộc (cả Free data)', 'In lên mọi chứng từ. **Tên ngắn** được gợi ý tự động (bỏ loại hình, viết hoa) — gõ tay thì thôi gợi ý'],
          ['**Địa chỉ đăng ký**', 'Bắt buộc', 'Là địa chỉ in trên hoá đơn của tổ chức'],
          ['**Người liên hệ**', 'Tên bắt buộc; **điện thoại hoặc email**, một trong hai', '*“Give a phone number or an email — either one is enough”*'],
          ['**Sales owner**', 'Tuỳ chọn', '**Để trống thì công ty vào Free data**, kể cả khi tạo từ tab Assigned'],
          ['Ngành, quy mô, quốc gia, tỉnh, website, nguồn lead, sản phẩm quan tâm, giá trị ước tính, mô tả, phúc lợi', 'Tuỳ chọn', 'Phúc lợi khai ở đây được **chép sẵn vào tin tuyển dụng đầu tiên**'],
        ],
      },
      {
        kind: 'table',
        heading: 'Kiểm MST — bốn kết quả, và chỉ một cái chặn lưu',
        note:
          'Chỉ **trùng nguyên MST đầy đủ** mới là trùng lặp và mới chặn lưu. **Trùng 10 số gốc KHÔNG phải trùng lặp** — đó là chi nhánh của cùng một pháp nhân, hoặc hai công ty tình cờ đụng nhau. Form không phán xét chuyện đó, nó liệt kê ra để rep tự quyết. Chặn ở đây là chặn nhầm một khách hàng mới hợp lệ.',
        cols: ['Kết quả', 'Rep thấy gì', 'Chặn lưu?'],
        rows: [
          ['Trùng nguyên MST', 'Báo lỗi, nêu tên công ty đang tồn tại, kèm link mở nó', '**Có** — công ty này đã có rồi'],
          ['Trùng 10 số gốc', 'Danh sách mọi công ty trên gốc đó: tên, MST đầy đủ, địa điểm, sales owner. Mỗi dòng cho liên kết theo hai chiều.', 'Không'],
          ['Tên pháp lý gần giống, MST khác', 'Cùng danh sách đó, khớp theo tên', 'Không'],
          ['Không trùng gì', 'Không hiện gì cả', 'Không'],
        ],
      },
      {
        kind: 'list',
        heading: 'Liên kết công ty mẹ / công ty con',
        items: [
          'Hai nút trên mỗi dòng có **số lượng khác nhau có chủ đích**: “**là con của**” chỉ đặt được trên **một** dòng (chọn dòng khác thì dòng cũ nhả ra), còn “**là mẹ của**” đặt được trên **nhiều** dòng cùng lúc. Đúng như dữ liệu: một công ty chỉ có một mẹ, nhưng có bao nhiêu con cũng được.',
          'Dùng cả hai chiều cùng lúc là hợp lệ — nghĩa là công ty mới nằm **giữa** một tập đoàn. Hệ thống kiểm cả chuỗi và **từ chối liên kết nào khiến một công ty thành tổ tiên của chính nó**.',
          'Liên kết là **tuỳ chọn và không bao giờ chặn lưu**. Rep bỏ qua danh sách thì tạo ra một bản ghi độc lập — và đó là kết quả **đúng** khi hai công ty thật sự chỉ tình cờ trùng gốc MST.',
          'Chi nhánh (cùng gốc 10 số, đuôi -001) và công ty con (MST khác hẳn) **lưu giống hệt nhau** — cùng một trường công ty mẹ. Nhãn hiển thị là suy ra từ việc so hai mã số thuế.',
          'Sau khi tạo, liên kết sửa ở *Overview → Affiliated companies*; sơ đồ tập đoàn đọc tối đa 100 thành viên.',
        ],
      },
      {
        kind: 'warn',
        text:
          '**Liên kết không kế thừa bất cứ thứ gì, theo bất kỳ chiều nào.** Mỗi bản ghi giữ MST riêng, gói/quota riêng, báo giá riêng, hoá đơn riêng, người dùng riêng và sales owner riêng. **Một chi nhánh không bao giờ tiêu được quota của công ty mẹ** — muốn vậy thì dùng *Shared quota* (§4).',
      },

      { kind: 'h', text: '§3 · Hồ sơ công ty', path: '/crm/companies/:id' },
      {
        kind: 'table',
        heading: 'Nút trên đầu hồ sơ — ai thấy, làm gì',
        note: 'Hồ sơ **đã archive là chỉ đọc toàn bộ**: mọi nút dưới đây ẩn đi, chỉ còn nút quay lại.',
        cols: ['Nút', 'Hiện khi', 'Quyền', 'Tác dụng'],
        rows: [
          ['**Return to the pool**', 'Chính bạn là sales owner', '`company:assign`', 'Thả công ty về Free data, ghi vào *Owner history*. Một cú bấm, không cần duyệt'],
          ['**Archive**', 'Công ty có owner, chưa archive', '`company:archive`', 'Hỏi **lý do** (bắt buộc): *Bankrupt / dissolved · Merged into another company · Duplicate / created by mistake · Violation — stop serving them · Other* + ghi chú. Công ty rời *Assigned* sang tab *Archived*, hồ sơ thành chỉ đọc; mọi liên kết Shared quota tự đóng'],
          ['**Verify company**', 'Chưa *Verified*', '`company:verify`', 'Có giấy → hỏi xác nhận rồi Verify. **Chưa có giấy** → hộp thoại nói vì sao không làm được và đưa tới *Company documents*. Mở khoá đăng tin và *Request official invoice*'],
          ['**View on jobseeker**', 'Công ty *Active*', '`company:read`', 'Mở trang công ty công khai'],
          ['**+ Create quotation**', 'Công ty **không** ở Free data', '`quote:create`', 'Mở form báo giá với công ty chọn sẵn. Báo giá ghi tên sales owner, nên báo giá cho dòng Free data sẽ là cửa sau để chiếm công ty — vì vậy phải claim trước'],
          ['**Ask for this company** / **Review**', 'Công ty ở Free data (banner vàng)', '`company_claim:request` / `:read`', 'Mở yêu cầu claim, hoặc đi tới tab *Claim requests* nếu đã có người xin'],
        ],
      },
      {
        kind: 'list',
        heading: 'Đầu hồ sơ đọc thế nào',
        items: [
          'Nhãn cạnh tên: **trạng thái khách** (*New · Existing · Churn*) — hoặc với dòng Free data là *Not claimed / Waiting for approval* · trạng thái công ty (chỉ hiện khi khác *Active*) · **xác minh** (*Unverified · Waiting to verify · Verified*, luôn hiện) · **hạng thành viên** (chỉ khi có hạng thật).',
          '**Không còn chip chặng pipeline trên đầu hồ sơ**: một công ty có thể có nhiều báo giá đang mở, mỗi cái một chặng. Chặng xem trên từng báo giá hoặc trên bảng Pipeline.',
          '**Hàng số liệu** (không hiện với dòng Free data) tóm tắt tài khoản: hạng, khách từ ngày nào, tin đang mở, quota tin còn lại, lượt mở CV (lượt mở CV chỉ hiện với ai có `credit:read`), sales owner.',
          'Banner xanh *read-only* = công ty của rep khác; banner vàng gạch = Free data; banner cam/đỏ = đã archive (đỏ khi lý do là *Violation*), kèm ai archive, khi nào.',
        ],
      },
      {
        kind: 'table',
        heading: 'Các tab của hồ sơ',
        cols: ['Tab', 'Nội dung', 'Ghi chú'],
        rows: [
          ['**Overview**', 'Hồ sơ (Company ID, loại công ty, tên pháp lý, MST, địa chỉ đăng ký, tên ngắn) · thông tin xuất hoá đơn · ngành/quy mô/quốc gia/tỉnh/tag/website/điện thoại · liên hệ chính · khối Sales (owner, Idle, nguồn lead, sản phẩm quan tâm, giá trị ước tính) · *Affiliated companies* · *Shared quota* · *Company documents* · **bảng Activity** bên phải', 'Nút *Edit* sửa tại chỗ. Đổi owner nằm trong form sửa và cần `company:assign`'],
          ['**Contacts**', 'Người liên hệ (vai trò: Company owner · HR manager · HR staff). Biểu tượng điện thoại gọi qua Callio', '**Liên hệ ≠ tài khoản đăng nhập** — xem *Logic chung*'],
          ['**Users**', 'Tài khoản đăng nhập của chính khách: mời qua email (link đặt mật khẩu dùng một lần), *Resend invite* (chờ 60 giây giữa hai lần), đổi vai trò, bật/tắt', 'Trạng thái *Invited* vẫn là *active* — tắt người đang được mời sẽ làm hỏng chính link của họ'],
          ['**Products & billing**', 'Khách **đang giữ** gì theo từng product: số slot còn, đã dùng, hạn. Đơn đã tạo nhưng chưa có hoá đơn đếm riêng', 'Nơi xác nhận quota đã về sau khi hoá đơn Issued'],
          ['**Company page**', 'Trình sửa trang tuyển dụng công khai + danh sách việc còn thiếu để publish', 'Sửa cần `company_page:update`; publish cần `company_page:publish` — hai quyền riêng'],
          ['**Jobs**', 'Số tin đang mở + 5 tin gần nhất', '—'],
          ['**Claim requests**', 'Lịch sử xin công ty này từ Free data; nơi Admin / Sales lead duyệt', 'Xem *Logic chung — CRM* và trang *Claim requests*'],
          ['**Owner history**', 'Chuỗi người phụ trách: tạo · gán · bàn giao · trả về pool · claim', 'Luôn có, kể cả công ty đã thả về pool'],
          ['*Applications* · *Resumes*', 'Chỉ hiện khi công ty có tin. **Hiện mới là ô trống “chưa có”**', 'Chưa build — xem ứng viên ở *Applicants*'],
        ],
      },
      {
        kind: 'table',
        heading: 'Bảng Activity — “mọi thứ đã xảy ra trên tài khoản này”',
        note: 'Nằm ở cột phải của tab **Overview** (không phải một tab riêng). Từ 08/10/2026 (admin PR #560, SRM-754) bảng này gộp cả **cuộc gọi Callio đã gắn vào công ty**, mới nhất trước.',
        cols: ['Dòng', 'Ai tạo', 'Cần gì'],
        rows: [
          ['**Chat**', 'Rep ghi tay', 'Kênh (*Zalo · Facebook Messenger · Email · SMS · Zalo OA · Phone · Other*) **bắt buộc** + nội dung **bắt buộc**'],
          ['**Call**', 'Rep ghi tay', 'Ghi chú **tuỳ chọn** — ghi được cả khi chưa có gì để tóm tắt'],
          ['**Meeting**', 'Rep ghi tay', 'Ngày (từ **ngày 1 tháng này tới hôm nay** — không ghi trước được, không lùi về tháng trước), giờ, thời lượng, hình thức (*tại văn phòng khách · tại văn phòng Saramin · Google Meet · Zoom · Other*), nội dung'],
          ['**Callio call**', 'Đồng bộ tự động', 'Cần quyền `telephony_call:read` mới thấy. Hiện kết quả cuộc gọi, thời lượng nói, nút nghe ghi âm'],
          ['Đính kèm', 'Rep', 'Ảnh JPG/PNG ≤ 5 MB (tải lên ngay khi chọn) hoặc link email'],
        ],
      },
      {
        kind: 'list',
        heading: 'Luật của bảng Activity',
        items: [
          '**Chỉ ghi được trên công ty có owner và chưa archive.** Free data: *“Ask for it first — only its sales owner logs activities.”* Archived: *“Its activity feed is closed to new entries.”* Rep ghi lên công ty của đồng nghiệp **được** (quyền `company_activity:create`), chỉ sửa hồ sơ thì không.',
          '**Không sửa, không xoá** một dòng activity — đây là sổ ghi những gì đã nói với khách.',
          'Nút **Call** mở danh sách số gọi được (liên hệ + số tổng đài + SĐT liên hệ chính trên hồ sơ), có *Call* qua widget Callio và *Copy number*. Admin **không tự đặt cuộc gọi** — cuộc gọi diễn ra trong Callio và tự quay về bảng này qua đồng bộ.',
          'Bộ lọc *All · Sales · Client · System*: hiện chỉ có dòng **Sales** và cuộc gọi Callio; *Client* và *System* trả về rỗng vì chưa có nguồn.',
        ],
      },

      { kind: 'h', text: '§4 · Shared quota (Sponsor / Beneficiary)' },
      {
        kind: 'list',
        items: [
          'Đã build (SRM-738). Khối **Shared quota** trên tab *Overview* của công ty **trả tiền** (*sponsor*). Quyền riêng `company:share_quota`.',
          'Gõ **đúng Company ID** (`CO-XXXXXXX`) của công ty sẽ tiêu quota → *Add ID*. Không tìm theo tên. Bảy trường hợp bị từ chối, mỗi cái một câu riêng: sai định dạng · không có công ty · chính nó · đã archive · đã là sponsor · đã là beneficiary · đã liên kết. Đồ thị chỉ sâu **một tầng**.',
          'Chia sẻ **đăng tin (tier + add-on) và lượt mở CV**. **Không** chia sẻ placement booking và manual service.',
          'Beneficiary chỉ thấy số hoá đơn và phần mình đã dùng — **không thấy tổng, số còn lại, số tiền hay mã PO** của sponsor.',
          '*Remove* chỉ chặn **lần dùng sau**: tin đã đăng chạy tới hết hạn, không hoàn gì. Archive một trong hai bên tự đóng liên kết.',
          'Đây **không phải** quan hệ mẹ con và không tạo ra quan hệ đó. Chi tiết luật: *Logic chung — CRM*.',
        ],
      },

      {
        kind: 'warn',
        text:
          '**Đính chính: không có nút Restore.** Trước đây trang này và *Logic chung* nói công ty archive “Restore được”. Ở build hiện tại **không màn hình nào** gọi được việc khôi phục — cả hồ sơ lẫn tab Archived (svn-be có endpoint `unarchive`, admin có hàm gọi nhưng chưa gắn nút nào, có chủ đích từ 26/08/2026). Archive nhầm thì phải nhờ đội kỹ thuật.',
      },
      {
        kind: 'warn',
        text:
          '**Không có chức năng gộp (merge) hai công ty.** Bản ghi trùng được xử lý bằng Archive với lý do *Duplicate / created by mistake* hoặc *Merged into another company*; báo giá, PO, hoá đơn và quota ở bản ghi cũ **không chuyển sang** bản còn lại.',
      },
      {
        kind: 'open',
        text:
          '**Chip pipeline trên danh sách có thể lệch với bảng Pipeline.** Bảng Pipeline đã ẩn thẻ có báo giá hết hạn (D-SLS-25), nhưng cột *Pipeline* của danh sách công ty vẫn chọn “thẻ đại diện” theo luật cũ, nên có thể hiện chặng của một báo giá đã hết hạn. Ghi trong svn-be `docs/DEBT.md` D-SLS-25 ②, chưa sửa.',
      },
      {
        kind: 'p',
        text: '**Màn hình thật.**',
      },
      {
        kind: 'shot',
        src: '/shots/crm/customers-assigned.jpg',
        where: 'Admin',
        caption: '**Companies**: bốn ô đếm (*My customers · New · Churn risk · Unassigned*), ba tab **Assigned · Free data · Archived**, phạm vi *Mine / My team’s / All*. Cột *Status* là trạng thái khách (*Existing* / *New*), cột *Verified* là xác minh — hai trục khác nhau.',
      },
      {
        kind: 'shot',
        src: '/shots/crm/customers-freedata.jpg',
        where: 'Admin',
        caption: 'Tab **Free data**: công ty chưa có owner. MST tô vàng vì **chưa xác minh** (lấy từ danh bạ công khai, kiểm lại khi có người nhận).',
      },
      {
        kind: 'shot',
        src: '/shots/crm/company-new.jpg',
        where: 'Admin',
        caption: '**New company** — loại công ty quyết định MST nghĩa là gì; nút **Check** tra MST và điền địa chỉ đăng ký. Bên dưới: liên hệ chính, thông tin xuất hoá đơn.',
      },
      {
        kind: 'shot',
        src: '/shots/crm/company-overview.jpg',
        where: 'Admin',
        caption: 'Hồ sơ một công ty: nhãn *Existing* · *Verified* · hạng *Member*, hàng số liệu (hạng 2026, khách từ năm nào, tin đang mở, quota tin, lượt mở CV, sales owner), các tab, và bảng **Activity** bên phải. Nút tạo duy nhất: **Create quotation**.',
      },
      {
        kind: 'shot',
        src: '/shots/crm/freedata-claim-tab.jpg',
        where: 'Admin',
        caption: 'Một công ty **Free data**: nhãn *Not claimed* · *Unverified*, nút **Ask for this company** trên băng vàng, và tab *Claim requests* có thẻ **Assign directly · Admin** — gán thẳng, không cần duyệt.',
      },
      {
        kind: 'shot',
        src: '/shots/crm/company-billing.jpg',
        where: 'Admin',
        caption: 'Tab **Products & billing**: bảng trên — *What this company holds, by product* (tổng · đã dùng · còn · hết hạn); bảng dưới — *Purchases, by invoice*.',
        note: 'Sau khi phát hành hoá đơn, đây là màn hình để xác nhận quota đã về thật, chứ không chỉ tin vào toast báo thành công.',
      },
      {
        kind: 'shot',
        src: '/shots/crm/company-billing-invoices.jpg',
        where: 'Admin',
        caption: '*Purchases, by invoice*: mỗi hoá đơn một khối — số pháp lý **1C26TTD/0170**, mã nội bộ **INV-003522-10-2026**, ngày phát hành, rồi từng dòng với thanh *đã dùng / tổng*. Dòng tặng có nhãn *Gift*.',
        note: '**Lỗi hiển thị trên dev (08/10):** dòng *Banner Hero trang chủ 14 ngày* (Placement booking) đang ghi “1 CV unlocks” — đúng ra là một khung ngày banner.',
      },
    ],
  },

  /* ───────────────────────────── Pipeline ───────────────────────────── */
  pipeline: {
    logic: [
      'Bảng sáu cột theo chặng bán, kéo thả để chuyển chặng. **Mỗi thẻ là một báo giá** — không có bản ghi “deal” riêng; bấm số báo giá trên thẻ là mở chính báo giá đó.',
      '**Một công ty có thể có nhiều thẻ cùng lúc**: báo giá v1, v2 sau đàm phán, hay hai gói chào song song — mỗi báo giá một thẻ. Số thẻ **không bằng** số công ty.',
      'Ai thấy thẻ nào: quyền `quote:read` theo phạm vi — *own* chỉ thẻ mình là sales owner, *company* các công ty được giao, *all* toàn bộ (sales lead / admin). Lọc ở server, không phải ẩn ở trình duyệt.',
    ],
    how: [
      'Thẻ **tự xuất hiện** ở *Proposal* ngay khi lưu báo giá (kể cả còn Draft). Không có nút “New deal”.',
      'Kéo thẻ giữa **Proposal ⇄ Qualified ⇄ Negotiation** — tự do, cả hai chiều.',
      'Thua: kéo thẻ vào **Lost** → bắt buộc chọn lý do (+ ghi chú ≤ 500 ký tự). Kéo ra khỏi Lost là mở lại thẻ ở cột vừa thả.',
      '*PO* và *Invoice* **không kéo vào được**: chứng từ tự đẩy thẻ sang (Issue PO → PO; kế toán phát hành hoá đơn → Invoice + thắng).',
      'Lọc: tìm theo công ty · *Mine / My team’s / All* · bộ lọc *Owner · Industry · Raised between · Waiting on a discount decision · Lapsing within 7 days*.',
    ],
    watch: [
      'Không có bản ghi “deal” tách biệt để sửa — mọi nội dung nằm ở báo giá.',
      'Kéo thẻ sang cột **Lost** **không** làm khách thành Churn; thắng một deal cũng **không** tự làm khách thành Existing. **Hoá đơn** mới đổi trục đó.',
      'Một công ty vừa **Existing** vừa đang **Negotiation** là tài khoản khoẻ mạnh — khách cũ đang mua tiếp — không phải dữ liệu mâu thuẫn.',
      '**Hết hạn không phải Lost.** Báo giá hết tháng mà chưa ra PO thì thẻ **biến khỏi bảng** — không lý do, không ai quyết định, không tính vào tỷ lệ thua.',
      'Thẻ **thắng** (cột Invoice) và thẻ **Lost** **nằm lại trên bảng vô thời hạn** — chưa có luật tự dọn sau N ngày (xem *open* bên dưới).',
    ],
    blocks: [
      {
        kind: 'table',
        heading: 'Sáu cột — ai đưa thẻ vào, ai đưa ra',
        note: '“Lost” **không phải một chặng**: thẻ thua giữ nguyên chặng nó dừng và chỉ đổi trạng thái sang LOST; bảng gom chúng vào một cột cho dễ nhìn. Kéo vào PO/Invoice bị từ chối với câu *“PO and Invoice are written when the document is issued — they cannot be set by hand.”*',
        cols: ['Cột', 'Vào bằng', 'Ra bằng', 'Ai'],
        rows: [
          ['**Proposal**', 'Lưu báo giá mới (kể cả *Duplicate*); hoặc kéo lùi về', 'Kéo, hoặc Lost', 'Hệ thống / Sales'],
          ['**Qualified**', 'Kéo', 'Kéo, hoặc Lost', 'Sales'],
          ['**Negotiation**', 'Kéo', 'Kéo, Lost, hoặc **Issue PO**', 'Sales'],
          ['**PO**', '*Issue PO* trên báo giá', 'Chỉ bằng hoá đơn được phát hành. Vẫn đóng Lost được (từ trang báo giá)', '**Chỉ hệ thống**'],
          ['**Invoice**', 'Kế toán phát hành hoá đơn chính thức — thẻ **thắng (WON)**', '**Không có đường ra.** Bán lại = báo giá mới', '**Chỉ hệ thống**'],
          ['**Lost**', 'Kéo vào, hoặc *Mark as lost* trên báo giá — **luôn kèm lý do**', 'Kéo ra = mở lại, **chỉ khi báo giá chưa ra PO**', 'Sales'],
        ],
      },
      {
        kind: 'table',
        heading: 'Khi nào thẻ biến khỏi bảng',
        note: 'Đây là luật của **bảng**; danh sách *Quotations* vẫn hiện đủ mọi báo giá, kể cả hết hạn.',
        cols: ['Tình huống', 'Còn trên bảng?', 'Vì sao'],
        rows: [
          ['Báo giá đang mở, chưa hết hạn', 'Có', 'Việc đang làm'],
          ['Báo giá **hết hạn** (cuối tháng, chưa ra PO)', '**Không**', 'Hết thời gian là lối ra im lặng'],
          ['Đã ra PO nhưng **mọi PO đều Expired**', '**Không**', 'Một thẻ nằm ở cột PO với đơn không ai xuất hoá đơn được nữa không còn là việc'],
          ['Thẻ **Lost**', 'Có, mãi mãi', 'Lost là quyết định có lý do, xếp trên mọi lối ra theo thời gian'],
          ['Thẻ **Won** (cột Invoice)', 'Có, mãi mãi', 'Cửa sổ 30 ngày của mô hình cũ chưa được chốt lại cho từng báo giá'],
        ],
      },
      {
        kind: 'list',
        heading: 'Đọc một thẻ và một cột',
        items: [
          'Thẻ đọc từ trên xuống: **số báo giá** (link tới báo giá — thứ duy nhất trên thẻ là duy nhất) · tên công ty (link tới hồ sơ) · ngành · **giá trị** · ngày hoạt động gần nhất.',
          '**Giá trị thẻ = một option** của báo giá (option khách đã chọn, nếu chưa thì option **cao nhất**), sau VAT — **không bao giờ cộng các option**. Báo giá có hai option 6.588.000 ₫ và 2.926.800 ₫ hiện 6.588.000 ₫.',
          '**Tổng đầu cột** = tổng giá trị các thẻ **đang nằm trong cột đó**, bất kể trạng thái — nên cột Invoice và Lost cũng có tổng thật.',
          '**Ngày hoạt động gần nhất** chỉ đổi khi thẻ được tạo hoặc kéo. Ghi cuộc gọi / chat trên hồ sơ công ty **không** làm mới ngày này.',
          'Lý do thua (6): *Lost to competitor · Price / over budget · No budget this cycle · No response / went silent · Not a fit · Internal approval rejected*.',
          '**Không có job nền nào tự đóng thẻ thành Lost.** Đóng thua luôn là một người, kèm lý do — nếu không tỷ lệ thắng/thua thành số rác.',
          'Bộ lọc *Owner* và *team* chạy ở server (để khớp đúng phễu của *Sales dashboard*); *Industry / kỳ / chờ duyệt / sắp hết hạn* lọc trên trình duyệt. *Team* chỉ đến qua link (ví dụ từ dashboard) — team ngoài phạm vi của bạn thì bị bỏ khỏi URL kèm cảnh báo.',
          '*Lapsing within 7 days* bỏ qua báo giá đã ra PO hoặc đã hết hạn — chúng không còn hạn để đuổi theo.',
        ],
      },
      {
        kind: 'example',
        heading: 'Ví dụ — một thẻ đi từ đầu đến cuối',
        scenario: 'Rep Lan báo giá cho Công ty CP Công nghệ VinaTech trong tháng 10/2026.',
        cols: ['Ngày', 'Việc', 'Trạng thái báo giá', 'Cột trên bảng', 'Thẻ'],
        rows: [
          ['06/10', 'Lan lưu báo giá QUO-009923-10-2026', 'Draft', 'Proposal', 'Mở'],
          ['07/10', '*Mark as sent*', 'Sent', 'Proposal', 'Mở'],
          ['09/10 → 13/10', 'Kéo sang Qualified, rồi Negotiation', 'Sent', 'Negotiation', 'Mở'],
          ['14/10', '*Issue PO* option B', 'Issued to PO', '**PO** (tự nhảy)', 'Mở'],
          ['22/10', 'Kế toán phát hành hoá đơn', 'Issued to PO', '**Invoice** (tự nhảy)', '**Won**'],
          ['Nhánh khác: 20/10', 'Khách chọn đối thủ — Lan kéo vào Lost, lý do *Lost to competitor*', 'Sent', 'Lost', 'Lost — khách vẫn là *New*'],
          ['Nhánh khác: 31/10', 'Không ai làm gì, hết tháng', 'Expired (máy quét)', '**Biến khỏi bảng**', 'Vẫn “mở” — không phải Lost'],
        ],
      },
      {
        kind: 'open',
        text:
          '**Thẻ đã đóng nằm lại vĩnh viễn.** Mô hình cũ ẩn thẻ đóng sau 30 ngày; từ khi thẻ = báo giá (19/08/2026) luật này chưa được chốt lại, nên cột Invoice và Lost dài ra mãi. Câu hỏi cho khách: có áp cửa sổ 30 ngày **theo từng báo giá** không? (svn-be `docs/DEBT.md` D-SLS-25 ①).',
      },
      {
        kind: 'open',
        text:
          '**Huy hiệu “Awaiting reply”** có trong bản dịch nhưng không bao giờ sáng: chưa có nơi nào ghi chiều liên hệ *inbound*. Đã cố ý bỏ khỏi thẻ.',
      },
      {
        kind: 'p',
        text: '**Màn hình thật.**',
      },
      {
        kind: 'shot',
        src: '/shots/crm/pipeline.jpg',
        where: 'Admin',
        caption: '**Pipeline**: mỗi thẻ là một báo giá (số `QUO-…`, công ty, ngành, giá trị một option, ngày). Đầu cột ghi số thẻ và tổng giá trị. Cột *Lost* nằm ngoài khung bên phải — cuộn ngang để thấy.',
      },
    ],
  },

  /* ───────────────────────────── Quotations ───────────────────────────── */
  quotations: {
    logic: [
      'Một báo giá có **1–3 option**, khách chọn đúng **một**. Các option là phương án thay thế nhau, không cộng dồn.',
      'Mỗi dòng trong option trỏ vào một **Product** hoặc **Package** đã khai ở Products — không gõ tay tên sản phẩm.',
      '**Báo giá chính là thẻ trên Pipeline**: lưu báo giá là tạo thẻ ở *Proposal*. Thông tin pipeline (chặng, thắng/thua) nằm trên chính báo giá.',
      'Mỗi báo giá chạy dưới **đúng một chương trình chiết khấu** (*discount mode*) rep chọn, và mode quyết định ô chiết khấu nào rep được gõ, ô nào chương trình tự tính, ô nào khoá ở 0.',
      'Báo giá **không cấp gì**. Nó chỉ trở thành cam kết khi *Issue PO*, và chỉ cấp quota khi hoá đơn *Issued* — xem *Logic chung — CRM*.',
    ],
    how: [
      'Tạo từ hồ sơ công ty: mở công ty → **+ Create quotation** (hoặc **New quotation** trên danh sách rồi chọn công ty — tìm theo tên hoặc MST).',
      'Chọn **Discount programme** (mode) trước, rồi thêm option, mỗi option thêm dòng sản phẩm / quà tặng — tổng tiền tự tính.',
      '**Save draft**. Nếu chiết khấu cần duyệt, hệ thống **tự gửi yêu cầu** cho đúng người duyệt — rep không phải bấm gì thêm.',
      'Gửi khách (PDF qua *View PDF*), rồi bấm **Mark as sent**.',
      'Khách chốt → bấm **Issue PO** và chọn **đúng option khách nhận**. PO được dựng ngay từ option đó.',
    ],
    watch: [
      'Dựng PO từ nhầm option là sai cả số tiền lẫn quota sẽ cấp.',
      '**Báo giá hết hiệu lực thì không dựng PO được.** Phải **Duplicate** ra bản nháp mới — và điều này chặn ở server, không phải chỉ ẩn nút.',
      '**Đính chính ngưỡng duyệt (từ 02/10/2026, svn-be V674):** chiết khấu tổng đơn **dưới 10%** → Sales lead duyệt; **từ 10% trở lên** → **thẳng Sales manager**. Trước đây trang này ghi “≤ 10% lead, > 10% manager” — mốc 10% nay thuộc về manager.',
      '**Đính chính: báo giá đã Sent vẫn sửa được số liệu** (nút *Edit*) cho tới khi ra PO hoặc hết hạn. Chỉ *Mark as sent* là riêng của Draft. Hệ quả: khách đang cầm PDF bản cũ có thể khác bản trên hệ thống — khi điều đó quan trọng, dùng **Duplicate** thay vì sửa.',
      'Rep **hạ đơn giá** thay vì gõ % thì **không đi qua duyệt** — duyệt chỉ đọc % tổng đơn. Đây là quyết định đã chốt (D-SLS-27), không phải lỗi.',
    ],
    blocks: [
      { kind: 'h', text: '§1 · Vòng đời báo giá', path: '/crm/quotations/:id' },
      {
        kind: 'table',
        heading: 'Bốn trạng thái báo giá',
        note: 'Không có trạng thái *Accepted*: option khách chọn được ghi lại **cùng lúc** với việc ra PO. Không có *Rejected*: khách từ chối thì báo giá tự hết hạn cuối tháng, hoặc rep đóng Lost trên pipeline.',
        cols: ['Trạng thái', 'Nghĩa', 'Tới bằng', 'Làm gì tiếp được'],
        rows: [
          ['**Draft**', 'Đang soạn. Đã có thẻ ở *Proposal*', 'Lưu báo giá mới, hoặc *Duplicate*', '*Edit* · đổi mode · *Mark as sent* (bị chặn nếu chiết khấu đang chờ duyệt / bị từ chối) · *Duplicate* · *Mark as lost*'],
          ['**Sent**', 'Đã gửi khách (qua kênh nào cũng được — rep tự khai)', 'Rep bấm *Mark as sent*', '*Edit* số liệu (duyệt lại nếu cần) · **Issue PO** · *Duplicate* · *Mark as lost*'],
          ['**Issued to PO**', 'Một option đã được nhận và PO đã tồn tại. **Điểm cuối** — số liệu đóng băng', 'Rep bấm *Issue PO*. Lần thứ hai bị từ chối', '*View the order* · *Duplicate* (bán lại / bán thêm)'],
          ['**Expired**', 'Hết tháng mà chưa có PO. **Không phải Lost**', 'Hệ thống — máy quét chạy **mỗi giờ** (phút :05)', 'Chỉ *Duplicate*. Thẻ biến khỏi bảng Pipeline, trạng thái khách không đổi'],
        ],
      },
      {
        kind: 'table',
        heading: 'Ngoài trạng thái chứng từ: thẻ thắng / thua',
        note: 'Trục *thẻ* (Open · Won · Lost) chạy song song với trạng thái chứng từ. Thẻ **đóng** thì **chứng từ cũng đóng băng**: Edit, đổi mode, Mark as sent đều bị vô hiệu — chỉ *Duplicate* còn dùng được.',
        cols: ['Thẻ', 'Gây ra bởi', 'Hệ quả trên báo giá'],
        rows: [
          ['**Lost**', '*Mark as lost* trên báo giá hoặc kéo vào Lost trên bảng — luôn kèm lý do', 'Banner *“closed lost, so its figures are frozen”*. Muốn làm tiếp: kéo thẻ ra khỏi Lost trên Pipeline (chỉ được khi chưa ra PO)'],
          ['**Won**', 'Kế toán phát hành hoá đơn của PO dựng từ báo giá này', 'Banner *“closed won”* — số liệu là thứ hoá đơn đã dựa vào'],
        ],
      },
      {
        kind: 'warn',
        text:
          '**Hạn báo giá LUÔN là ngày cuối tháng hiện tại** (giờ Việt Nam) — không phải 30 ngày trượt. Báo giá lập ngày 05/07 và ngày 28/07 **cùng hết hạn 31/07**. Header form ghi *“end of month · N days left”*. Số báo giá cấp lúc lưu, theo dãy liên tục `QUO-{6 số}-{tháng}-{năm}`.',
      },

      { kind: 'h', text: '§2 · Builder — option, dòng, chiết khấu', path: '/crm/quotations/new' },
      {
        kind: 'list',
        heading: 'Ràng buộc trên builder',
        items: [
          '**Tối đa 3 option.** Mỗi option phải có **sản phẩm trên mọi dòng** và **ít nhất một dòng có tính tiền** (*“Option N needs a product on every line and at least one paid line.”*).',
          'Dòng **Gift** giá 0 ₫, **không cho đặt giá** — nhưng **vẫn cấp đủ số lượng** khi hoá đơn phát hành, và thừa hưởng hạn kích hoạt dài nhất của các dòng có phí cùng đơn.',
          'Một dòng có thể là **Package**: báo một giá, ruột không in lên chứng từ; ruột được bung ra lúc *Issue PO*. Package không bung được (đã archive…) thì *Issue PO* bị từ chối.',
          'Đánh dấu một option **Recommended**. Có tiêu đề option tuỳ chọn.',
          '**Không có tổng cộng toàn báo giá** và không được cộng các option lại. *Quotation value* = option cao nhất (hoặc option đã chọn).',
          'Thông tin khách (tên pháp lý, MST, liên hệ, email) **in từ hồ sơ công ty** — sai thì sửa ở đó, không sửa trên báo giá.',
          '**Thuế VAT** lấy từ hồ sơ người bán (mặc định 8%) và **chụp lại** vào báo giá lúc tạo — đổi thuế suất sau đó không đổi báo giá đã có.',
          '*Internal note* — ghi chú nội bộ, **không in** ra PDF.',
        ],
      },
      {
        kind: 'table',
        heading: 'Bốn chương trình chiết khấu (mode) — chọn một cho cả báo giá',
        note: 'Ô nào gõ được do **server công bố** theo mode, form chỉ đọc. Trạng thái khách (*New / Churn / Existing*) chỉ quyết định mode nào **được chào**. Khách *Existing* chỉ có hai mode. Bậc thang dưới đây là bậc seed ban đầu (V187); con số thật xem ở *Products → Discount programmes*.',
        cols: ['Mode (tên trên màn hình)', 'Chào cho', 'CK dòng', 'CK tổng đơn', 'Giảm số tiền (₫)', 'Đi duyệt?'],
        rows: [
          ['*New / returning customer offer*', 'New · Churn', 'Chương trình: **50%** cho mỗi dòng có phí **≤ 5 đơn vị**; dòng > 5 tính đủ giá, các dòng khác giữ 50%', 'Khoá 0', 'Rep gõ', 'Không'],
          ['*Quantity discount*', 'New · Churn · Existing', 'Chương trình: bậc thang theo **tổng số lượng của từng product** trong option (2+ → 25% · 5+ → 30% · 10+ → 35% · 20+ → 40% · 30+ → 45% · 50+ → 50% · 100+ → 60%); quà không tính', '**Rep gõ**', 'Rep gõ', '**Có** — chỉ % tổng đơn'],
          ['*Trial package*', 'New · Churn', 'Khoá 0', 'Khoá 0', 'Khoá 0', 'Không. Chỉ chọn được **SKU dùng thử** (ví dụ `JOB-TRIAL-SOLD` 500.000 ₫, `CV-TRIAL` 300.000 ₫); hạn kích hoạt **3 tháng** thay vì 12'],
          ['*Special offer*', 'New · Churn · Existing', 'Rep gõ', 'Rep gõ', 'Rep gõ', '**Không gì cả** — quyết định minh thị của khách hàng'],
        ],
      },
      {
        kind: 'list',
        heading: 'Đổi mode và ưu đãi một lần',
        items: [
          '**Đổi mode xoá sạch mọi con số chiết khấu.** Đổi **vào hoặc ra** *Trial package* thì xoá luôn **mọi dòng** — báo giá dùng thử chỉ chứa SKU dùng thử, báo giá thường không chứa SKU nào trong số đó. Builder cảnh báo trước khi xoá.',
          '*New / returning customer offer* là **ưu đãi một lần mỗi đợt** khách ở trạng thái New/Churn. Đã dùng rồi thì mode hiện nhưng **bị khoá**, kèm mã PO đã dùng nó: *“Already used on {PO}… quote it under Quantity discount or Special offer.”*',
          'Khách New/Churn được báo theo *Quantity discount* — lối thoát khi đơn quá lớn cho trần 5 đơn vị.',
        ],
      },
      {
        kind: 'table',
        heading: 'Công thức tiền của một option — thứ tự là luật',
        note: 'Bước 3 và 4 **không đổi chỗ được**: trừ số tiền phẳng trước phần trăm sẽ làm nó đáng giá hơn. **VAT tính trên số đã trừ chiết khấu** — tính trên tạm tính là thu thừa tiền khách trên một chứng từ thuế. PO và hoá đơn **chép nguyên** các con số này, không tính lại.',
        cols: ['#', 'Bước', 'Công thức'],
        rows: [
          ['1', 'Thành tiền dòng', 'SL × đơn giá × (1 − CK dòng %)'],
          ['2', '**Subtotal**', 'Σ thành tiền dòng'],
          ['3', '*Additional Discount* (CK tổng đơn)', 'Subtotal × CK tổng đơn %'],
          ['4', '*Amount off* (giảm số tiền)', 'min(số rep gõ, Subtotal − bước 3) — **bị cắt**, không bị từ chối; option chạm 0 ₫ được, âm thì không'],
          ['5', '**After discount**', 'Subtotal − bước 3 − bước 4'],
          ['6', 'VAT', 'After discount × VAT %'],
          ['7', '**Total after VAT**', 'After discount + VAT · kèm số tiền bằng chữ'],
        ],
      },
      {
        kind: 'example',
        heading: 'Ví dụ — một báo giá hai option dưới *Quantity discount*',
        scenario:
          'Báo giá QUO-009923-10-2026 cho VinaTech, lập 06/10/2026, hết hạn **31/10/2026**. Giá niêm yết giả định: Tin Basic 2.710.000 ₫. Rep gõ CK tổng đơn 8% và giảm 205.800 ₫ trên option B.',
        cols: ['Bước', 'Option A — 5 Tin Basic', 'Option B — 10 Tin Basic + 1 Tin Basic tặng'],
        rows: [
          ['Bậc thang (theo SL product)', '5+ → 30%', '10+ → 35% (dòng tặng **không** tính vào bậc)'],
          ['Thành tiền dòng', '13.550.000 × 70% = **9.485.000**', '27.100.000 × 65% = **17.615.000** · dòng tặng 0'],
          ['CK tổng đơn', '0', '8% × 17.615.000 = 1.409.200'],
          ['Giảm số tiền', '0', '205.800'],
          ['After discount', '9.485.000', '**16.000.000**'],
          ['VAT 8%', '758.800', '1.280.000'],
          ['**Total after VAT**', '**10.243.800**', '**17.280.000**'],
          ['Duyệt?', 'Không (không có CK tổng đơn)', '8% < 10% → **Sales lead** của rep. Nếu rep gõ 12% → **Sales manager**'],
        ],
        note:
          '*Quotation value* trên danh sách và thẻ pipeline là **17.280.000 ₫** (option cao nhất) — **không phải 27.523.800 ₫**. Khách chọn B thì PO và hoá đơn mang đúng 17.280.000 ₫, và khi hoá đơn phát hành khách nhận **11 slot Tin Basic** (10 mua + 1 tặng).',
      },

      { kind: 'h', text: '§3 · Duyệt chiết khấu' },
      {
        kind: 'table',
        heading: 'Ai phải duyệt — chỉ một con số đi duyệt: % tổng đơn dưới *Quantity discount*',
        note: 'Định tuyến đọc **option có % cao nhất** (người duyệt phải ký được trường hợp xấu nhất): 8% và 18% trên hai option → đi **thẳng** manager. Yêu cầu nêu **đích danh** người duyệt theo sơ đồ tổ chức (trưởng nhóm của rep, hoặc trưởng phòng với mức của manager).',
        cols: ['Tình huống', 'Ai duyệt'],
        rows: [
          ['CK tổng đơn **dưới 10%**, rep gõ', '**Sales lead** (quyền `quote:approve_discount_lead`)'],
          ['CK tổng đơn dưới 10%, chính **lead** gõ', 'Không ai — vốn là quyết định của họ'],
          ['CK tổng đơn **từ 10% trở lên**, rep **hoặc lead** gõ', '**Sales manager** (quyền `quote:approve_discount`) — thẳng lên, không xếp sau lead'],
          ['Bất kỳ mức nào do **manager** gõ', 'Không ai'],
          ['Bậc thang trên dòng · giảm số tiền · 50% khách mới · *Special offer* · *Trial*', 'Không ai'],
        ],
      },
      {
        kind: 'list',
        heading: 'Luồng duyệt trên màn hình',
        items: [
          'Yêu cầu duyệt được **server tự tạo** khi lưu, khi *Duplicate* và mỗi lần sửa số liệu — rep không bấm “xin duyệt”. Người được nêu tên nhận thông báo.',
          'Thanh trạng thái trên trang báo giá: *“{programme} {pct}% off the order — waiting on {role}”* / *approved by* / *refused by*, kèm ai xin, ai quyết, khi nào.',
          'Người duyệt thấy **Approve {pct}%** và **Refuse discount** (lý do bắt buộc — rep đọc lý do trước khi định giá lại). Manager được quyết thay một yêu cầu đã gửi cho lead (khi lead vắng); lead **không** quyết được yêu cầu đã vượt lên manager.',
          'Người duyệt tìm việc của mình bằng bộ lọc **Waiting on me** trên danh sách Quotations (chỉ hiện với ai có quyền duyệt). Bộ lọc *Waiting on a discount decision* trên Pipeline cho cả team.',
          'Bị **Refuse**: báo giá vẫn là Draft sửa được. Sửa số → yêu cầu mới tự tạo theo mức mới.',
          '**Duyệt gắn với một con số.** Đã duyệt 8% rồi sửa thành 12% thì duyệt mất hiệu lực: *“the discount changed after it was approved — it was approved at 8% and now offers 12%”*. Cùng câu chặn cả *Mark as sent* lẫn *Issue PO*.',
          'Chưa duyệt mà bấm gửi: *“this quotation offers 12% off the order and needs approval from SALES_MANAGER before it can be sent”*.',
        ],
      },

      { kind: 'h', text: '§4 · Issue PO — biến một option thành đơn hàng' },
      {
        kind: 'table',
        heading: 'Hộp thoại Issue PO hỏi gì',
        note: 'Chỉ bấm được khi báo giá **Sent**, thẻ chưa đóng, và chiết khấu (nếu có) đã được duyệt đúng mức hiện tại.',
        cols: ['Phần', 'Trường', 'Tác dụng'],
        rows: [
          ['Option', '*Which option did the customer accept?*', 'Option đó được chép **nguyên văn** sang PO (dòng, tiền, VAT, chiết khấu). Hai option kia không bao giờ thành đơn'],
          ['*VAT billing*', 'Loại người mua + họ tên / CCCD (cá nhân) · *Also make this the company’s default*', 'Đổi **người nhận hoá đơn** cho riêng đơn này. Tên pháp lý, MST, địa chỉ đăng ký vẫn lấy từ hồ sơ công ty. Tick “default” thì ghi ngược về hồ sơ, cùng lúc với PO'],
          ['*Payment*', '*Payment terms*: 100% in advance (mặc định) · 50 / 50 · Net 30 after invoice', '**Chỉ in lên đơn** — không chia khoản thu: đơn thu một số tiền, trả thiếu thì hiện *Partially paid*'],
          ['*Payment*', '*Payment method* (Woori bank · Woori Manual · Megapay — cho khách nước ngoài · Other) · *Expected payment date* — **bắt buộc**', 'Chưa chọn ngày thì nút *Issue PO* bị khoá. Với **Woori bank**, QR gửi qua email hết hạn **23:59 ngày này**. Ngày này **không phải** hạn thanh toán — Overdue chỉ đếm từ hoá đơn chính thức + 30 ngày (xem *Purchase order §2*)'],
        ],
      },
      {
        kind: 'list',
        heading: 'Issue PO làm gì, cùng một lúc',
        items: [
          'Báo giá → *Issued to PO*, ghi lại option đã chọn; thẻ nhảy sang cột **PO**.',
          'Tạo PO `PO-{6 số}-{tháng}-{năm}` ở *Active*, hết hạn **cuối tháng phát hành**.',
          '**Đóng băng kế hoạch cấp phát**: slot đăng tin theo tier, credit mở CV, placement booking — đọc từ catalogue **tại lúc này**. Sửa product sau đó không đổi thứ khách sẽ nhận.',
          'Chụp hồ sơ xuất hoá đơn của công ty và tiêu đề người bán (phiên bản đang dùng).',
          '**Không cấp gì cho khách.** Không slot, không credit, trạng thái khách không đổi.',
        ],
      },

      { kind: 'h', text: '§5 · Danh sách', path: '/crm/quotations' },
      {
        kind: 'list',
        items: [
          'Cột: *Quotation · Customer · Company ID · Sales owner · Products · Options · Value · Status · Pipeline · Created · Expires*. Cờ duyệt (*8% · waiting on Sales lead*) hiện cạnh trạng thái.',
          'Tìm theo **tên khách** (không dấu cũng được) hoặc **số báo giá** (`9923`, `QUO-009923` đều ra). **Tên sản phẩm không tìm được.**',
          'Lọc: trạng thái · *Raised between* (theo ngày tạo, không theo hạn) · *Waiting on me* · *Mine / My team’s / All*. Sắp: *Newest · Oldest · Almost expires · Highest value · Lowest value*.',
          '**Overview** bật bốn thẻ: *Awaiting customer* (đã gửi, chưa ra đơn) · *Expiring · 7 days* · *Value awaiting* · *Won · 30 days*.',
          '**Export** cần `quote:export`. Rep **đọc** được cả sổ bán hàng trong phạm vi nhưng chỉ **sửa** báo giá thuộc tài khoản mình — nút hành động tự ẩn trên báo giá không phải của mình.',
          'Không có nút xoá trên giao diện (API chỉ cho xoá Draft).',
        ],
      },
      {
        kind: 'example',
        heading: 'Ví dụ — vì sao option là “chọn một”, không phải “mua tất”',
        scenario:
          'Sales gửi Vạn Phát một báo giá ba option: **A** — 5 Top Job (60tr) · **B** — 10 Basic + 2 Top Job (55tr) · **C** — gói 12 tháng (120tr). Khách trả lời “ok em chốt option B”.',
        cols: ['Option', 'Sau khi khách chốt B', 'Nếu dựng PO nhầm từ A'],
        rows: [
          ['A — 5 Top Job', '**Bị loại**', 'PO ghi 60tr thay vì 55tr'],
          ['**B — 10 Basic + 2 Top Job**', 'Chọn B trong hộp thoại **Issue PO**', '—'],
          ['C — gói 12 tháng', '**Bị loại**', '—'],
          ['**Hệ quả nếu nhầm**', '—', 'Khách nhận hoá đơn **sai số tiền**, và khi phát hành thì được cấp **5 slot Top Job** thay vì **10 Basic + 2 Top Job** — sai cả tiền lẫn hàng'],
        ],
        note:
          'Ba option **không cộng dồn**. Sai lầm hay gặp là đọc báo giá như một bảng giá rồi dựng PO từ dòng nào trông quen nhất. PO **chép nguyên** option được chọn, nên chọn đúng option ở bước này là chọn đúng cả hoá đơn lẫn quota sẽ cấp. PO không sửa dòng được — chọn nhầm thì phải *Duplicate* báo giá và ra PO mới; PO nhầm tự hết hạn cuối tháng.',
      },
      {
        kind: 'p',
        text: '**Màn hình thật.**',
      },
      {
        kind: 'shot',
        src: '/shots/crm/quotation-new.jpg',
        where: 'Admin',
        caption: '**New quotation**: phần đầu tự điền — số báo giá *“Assigned on save”*, hạn **31/10/2026 (cuối tháng)**, người lập. Chọn công ty xong mới hiện phần option.',
      },
      {
        kind: 'shot',
        src: '/shots/crm/quotation-detail.jpg',
        where: 'Admin',
        caption: 'Báo giá đã **Issued to PO**, pipeline *Invoice*: băng xanh nói số liệu đã khoá vì hoá đơn dựng từ đó. Option 1 có nhãn *Recommended* · *Accepted*; dòng tặng 0 ₫; giảm 5 %, VAT 8 %, tổng bằng chữ.',
      },
      {
        kind: 'shot',
        src: '/shots/crm/quotations-list.jpg',
        where: 'Admin',
        caption: 'Danh sách báo giá: bốn ô (*Awaiting customer · Expiring 7 days · Value awaiting · Won 30 days*), nút *Waiting on me* cho người duyệt.',
      },
    ],
  },

  /* ───────────────────────────── Purchase orders ───────────────────────────── */
  'purchase-order': {
    logic: [
      'PO là đơn đã cam kết, dựng từ đúng option khách đã chọn. **PO chưa cấp quota.** Đây là lúc deal “thắng cam kết” — thẻ pipeline sang cột PO — nhưng khách vẫn có 0 slot.',
      'Danh sách chỉ để đọc — không có nút tạo mới ở đây. PO chỉ sinh ra từ nút **Issue PO** trên báo giá.',
      'PO là **nửa thương mại**; hoá đơn là **nửa thuế** của cùng một đơn. Trạng thái hoá đơn được **suy ra từ trạng thái PO** — hai chứng từ không bao giờ nói khác nhau.',
      'Trang chi tiết PO là nơi **sales** làm phần giấy tờ của mình: gửi đơn cho khách, xuất hoá đơn nháp, chuyển kế toán. **Phát hành** hoá đơn thì ở trang Invoice, chỉ kế toán.',
    ],
    how: [
      'Mở PO từ báo giá (*View the order*) hoặc từ danh sách.',
      'Kiểm nội dung: dòng hàng, số lượng, đơn giá, chiết khấu, VAT, tổng, người nhận hoá đơn.',
      '**Send the order to the customer** — email kèm PDF *XÁC NHẬN ĐƠN HÀNG*; phương thức **Woori bank** thì kèm thêm **mã QR thanh toán**, hết hạn 23:59 ngày *Expected payment date*.',
      '(Tuỳ chọn) **Export draft invoice** — xem bản nháp hoá đơn do nhà cung cấp HĐĐT dàn trang.',
      '**Request official invoice** — đẩy sang hàng đợi kế toán. Công ty phải **Verified**.',
    ],
    watch: [
      'PO đã có mà khách vẫn không đăng tin được là **đúng** — quota chỉ vào khi hoá đơn Issued.',
      'Danh sách **không có nút tạo mới**, và đó là chủ đích: PO chỉ sinh ra từ một option báo giá đã được chọn.',
      'PO **không sửa được dòng, giá, người mua** — khách đang cầm bản y hệt. Cần đổi thì *Duplicate* báo giá → gửi → Issue PO mới. PO cũ **không huỷ được**: nó tự hết hiệu lực **cuối tháng phát hành**.',
      '**Đính chính: không có “Edit services”.** *Logic chung* và tài liệu cũ nói sửa dịch vụ được khi PO còn Active — build hiện tại **không có** nút hay endpoint nào cho việc đó. Chỉ sửa được ba trường thanh toán (xem bên dưới).',
      '**Đính chính: ô “số PO của chính khách” không còn trên màn hình.** Số đó vẫn in ra nếu đã có từ trước, nhưng hiện không ai nhập được (endpoint còn, không có nút gọi).',
    ],
    blocks: [
      { kind: 'h', text: '§1 · Vòng đời PO', path: '/crm/purchase-orders/:id' },
      {
        kind: 'table',
        heading: 'Năm trạng thái PO — ba bước tiến, một lối thoát',
        note: 'Không có *Cancelled*, không có nút huỷ, không xoá. Cách duy nhất một PO “chết” là **hết hạn** — và lúc đó nó chưa từng cấp gì nên không có gì để thu hồi.',
        cols: ['Trạng thái', 'Hoá đơn bên dưới', 'Tới bằng', 'Ai', 'Làm gì tiếp được'],
        rows: [
          ['**Active**', '— chưa có', '*Issue PO* từ báo giá. **Thắng cam kết, cấp 0 thứ**', 'Sales', 'Gửi đơn · sửa thanh toán · *Export draft invoice* · *Request official invoice*'],
          ['**Draft invoice**', 'Draft', '*Export draft invoice* — bản làm việc, **không số pháp lý**, không cấp gì. **Tuỳ chọn**', 'Sales', 'Gửi đơn · sửa thanh toán · *Request official invoice*'],
          ['**Invoice requested**', 'Requested', '*Request official invoice* — vào hàng đợi kế toán. Từ Active hoặc Draft invoice', 'Sales — công ty phải **Verified**', 'Chờ kế toán. Vẫn xuất lại được bản nháp PDF'],
          ['**Issued invoice**', 'Issued', 'Kế toán phát hành trên trang Invoice. **Sản phẩm vào tài khoản cùng lúc.** Điểm cuối', '**Chỉ kế toán**', '*View invoice* · ghi nhận thanh toán'],
          ['**Expired**', 'Archived', 'Qua **cuối tháng** mà chưa có hoá đơn chính thức — từ bất kỳ trạng thái nào trong ba cái đầu', 'Hệ thống (quét **mỗi giờ**, phút :25)', 'Không gì. Ra PO mới từ một báo giá còn sống'],
        ],
      },
      {
        kind: 'warn',
        text:
          '**Hạn là CUỐI THÁNG, không phải 30 ngày trượt** — PO lập 05/07 và 28/07 cùng hết hạn 31/07, đúng quy tắc của báo giá. Dòng có thể vẫn đọc là *Active* vài giờ sau cuối tháng trước khi máy quét chạy (danh sách đánh dấu ⚠, header ghi *“Lapsed … the sweep has not marked it Expired yet”*), nhưng **server đã từ chối** mọi bước giấy tờ: *“Purchase order has expired and cannot be invoiced”*. **“Đã chuyển kế toán” không giữ được PO qua tháng** — chỉ hoá đơn đã phát hành mới làm được.',
      },
      {
        kind: 'table',
        heading: 'Các nút trên trang chi tiết PO',
        note: 'Thẻ pipeline của báo giá đã bị đóng **Lost** thì PO **đóng băng**: các nút bị vô hiệu, banner nói PO vẫn tự hết hạn cuối tháng.',
        cols: ['Nút', 'Khi nào', 'Quyền', 'Tác dụng'],
        rows: [
          ['**Send the order to the customer** (biểu tượng thư)', 'Mọi trạng thái còn sống', '`purchase_order:update`', 'Soạn email: *To* (liên hệ của công ty), *CC* (liên hệ + chủ deal), tiêu đề, **PDF đơn hàng đính kèm**, link điều khoản, nội dung từ template *Notifications* `purchase_order.send_to_customer`. Phương thức **Woori bank**: email kèm **QR thanh toán**, hết hạn **23:59 ngày Expected payment date** — gửi lần đầu là **mở khoản thu ở ngân hàng**. Phương thức khác: không có QR. Không đổi trạng thái PO; gửi lại được (*“This order has been emailed before”*)'],
          ['**View PDF**', 'Luôn', '`purchase_order:read`', 'PDF *XÁC NHẬN ĐƠN HÀNG* dựng từ chính số liệu đã đóng băng của PO'],
          ['**Edit payment details**', 'Chưa có hoá đơn chính thức', '`purchase_order:update`', 'Sửa đúng **ba** trường: điều khoản, phương thức, *Expected payment date* (vẫn **bắt buộc**). **Điều khoản khoá** khi ngân hàng đã giữ khoản thu cho đơn này; **ngày khoá** khi QR đã gửi (*“Fixed — the payment QR was sent with this date and expires at 23:59 on it.”*) vì QR không gửi lại được'],
          ['**Export draft invoice**', 'Active / Draft invoice / Invoice requested, chưa xuất nháp', '`purchase_order:update`', 'Tạo chứng từ hoá đơn (cấp mã `INV-…` nội bộ) nếu chưa có, đẩy bản nháp **lên nhà cung cấp HĐĐT** (chưa ký, chưa số, chưa khai) rồi mở PDF. Xong thì nút đổi thành nhãn **Draft exported**'],
          ['**Request official invoice**', 'Active hoặc Draft invoice', '`purchase_order:update`', 'Sang *Invoice requested*. Công ty chưa Verified → nút khoá kèm giải thích; server trả *“This company is not verified yet — the official invoice cannot be requested until an admin has verified its paperwork”*'],
          ['**View invoice** / **View draft invoice**', 'Khi chứng từ hoá đơn đã tồn tại', '`invoice:read`', 'Sang trang Invoice'],
        ],
      },
      {
        kind: 'list',
        heading: 'Header PO và danh sách đọc thế nào',
        items: [
          'Header: *Purchase order* + nhãn trạng thái + nhãn thanh toán + **một câu** nói trạng thái nghĩa là gì lúc này (*Valid until … month end* · *With accounting — still lapses …* · *Expired … raise a new PO* · *Products are on the customer’s account*).',
          'Một thẻ chứa cả chứng từ: số PO, người bán bên trái, người nhận bên phải (tên, MST, địa chỉ), bảng dòng và thang tiền (Subtotal · Additional Discount · Amount off · After discount · VAT · Total after VAT · bằng chữ). Dòng quà ghi *Gift*.',
          'Danh sách: *PO · Customer · Company ID · Quotation · Total · Status · Payment · Invoices · Payment terms · Method · Expected payment date · Issued · Expires*. Tìm theo số PO, số báo giá, khách. Lọc trạng thái, *To invoice (requested)*, *Raised between*, *Mine / My team’s / All*. Export cần `purchase_order:export`.',
          '**Overview**: *Not invoiced* (Active + nháp + đã chuyển — một sự thật: chưa xuất hoá đơn) · *Expiring · 7 days* · *Value not invoiced* · *Invoiced · 30 days*.',
        ],
      },

      { kind: 'h', text: '§2 · Thanh toán — Payment status và dòng QR' },
      {
        kind: 'table',
        heading: 'Payment status — 4 nhãn, cùng một dữ liệu trên PO và Invoice',
        note: 'Thanh toán **thuộc về đơn hàng**: PO list, Invoice list và hai trang chi tiết luôn hiện **cùng một nhãn**, đọc từ các khoản tiền đã về (ngân hàng báo về hoặc kế toán xác nhận). **Không ai chọn nhãn bằng tay**, và **việc xuất hoá đơn không bao giờ bị chặn bởi thanh toán**. Theo SRM-1080, có trên dev từ 22/10/2026.',
        cols: ['Nhãn', 'Khi nào'],
        rows: [
          ['*Unpaid*', 'Chưa ghi nhận đồng nào. Mặc định từ lúc Issue PO'],
          ['*Partially paid*', 'Đã về một phần, còn nợ. **Giữ nguyên tới khi trả đủ — không bao giờ chuyển Overdue**'],
          ['*Paid*', 'Đã về đủ'],
          ['*Overdue +N d*', 'Hoá đơn **chính thức** đã phát hành **từ 30 ngày trở lên** mà vẫn **Unpaid**. Ngày phát hành là ngày 0 (giờ VN): ngày 30 hiện *Overdue +0d*, ngày 31 *+1d*. Tự chuyển, không ai bấm. Rê chuột vào nhãn: *“Was due … — 30 days after the official invoice — and nothing has arrived”*'],
        ],
      },
      {
        kind: 'warn',
        text:
          '**Overdue chỉ đếm từ hoá đơn chính thức + 30 ngày.** Không đếm từ ngày PO, không theo điều khoản thanh toán, không theo *Expected payment date*, và QR hết hạn **không** làm đơn trễ. Hoá đơn còn *Draft* hay *Invoice requested* thì **chưa có hạn** — để 45 ngày vẫn là *Unpaid* (tooltip: *“No official invoice yet, so nothing is due”*). Trước 22/10/2026 hạn tính theo điều khoản thanh toán; spec cũ là 14 ngày từ ngày PO — cả hai đã bỏ.',
      },
      {
        kind: 'table',
        heading: 'Expected payment date và QR Woori bank',
        note: '**QR không phải một trạng thái** — không có cột “QR payment status”. QR chỉ là một dòng thông báo.',
        cols: ['', 'Quy tắc'],
        rows: [
          ['**Expected payment date**', 'Ngày dự kiến khách trả. **Bắt buộc** khi Issue PO — chưa chọn thì nút *Issue PO* bị khoá (server cũng chặn). Với **Woori bank** đây cũng là **ngày QR hết hạn, 23:59 giờ VN**. **Không** dùng để tính Overdue'],
          ['**Khi nào có QR**', 'Chỉ khi phương thức = **Woori bank** và sales đã bấm **Send the order to the customer**. Phương thức khác (*Woori Manual*, *Megapay*, *Other*): không có QR, không có dòng QR, không có ghi chú QR'],
          ['**Sửa ngày**', '*Edit payment details* — ngày vẫn bắt buộc. **QR đã gửi thì ngày bị khoá**, vì QR không gửi lại được'],
          ['**QR hết hạn**', 'Hết hẳn — **không có nút gửi lại**, không tạo QR mới. Khách chuyển khoản như thường, kế toán *Confirm payment* trên Invoice. QR hết hạn **không đổi** Payment status'],
          ['**Khách trả qua QR**', 'Ngân hàng báo về → hệ thống tự ghi tiền, đơn chuyển *Paid*, dòng QR thành *Paid by QR*. Kế toán **không cần** bấm *Confirm payment*'],
        ],
      },
      {
        kind: 'table',
        heading: 'Dòng QR hiện ở đâu',
        cols: ['Nơi', 'Hiện gì'],
        rows: [
          ['**PO detail** (dưới header)', 'Một dòng, chỉ đọc, **không có nút**: *“QR sent dd/mm · expires 23:59 on dd/mm”* → đỏ *“QR expired dd/mm — the customer has not paid by QR”* → xanh *“Paid by QR on dd/mm”*'],
          ['**Invoice detail**', 'Cùng dòng đó, chỉ đọc'],
          ['**PO list · Invoice list**', '**Không có cột QR.** Ghi chú nhỏ dưới nhãn Payment: *“QR expires dd Mon”* hoặc đỏ *“QR expired dd Mon”*. Đơn không phải Woori bank: không có ghi chú'],
        ],
      },
      {
        kind: 'example',
        heading: 'Ví dụ — QR và Overdue là hai mốc độc lập',
        scenario:
          'PO Woori bank **17.280.000 ₫**, *Expected payment date* **31/10/2026**. Sales gửi email kèm QR ngày **20/10**; kế toán phát hành hoá đơn chính thức ngày **25/10** (ngày 0).',
        cols: ['Ngày', 'Việc', 'Payment status', 'Dòng QR (PO detail)'],
        rows: [
          ['20/10', 'Gửi email kèm QR', 'Unpaid', '*QR sent 20/10 · expires 23:59 on 31/10*'],
          ['25/10', 'Hoá đơn chính thức phát hành', 'Unpaid', 'Như trên'],
          ['01/11', 'QR hết hạn, khách chưa trả. Hoá đơn mới **7 ngày**', '**Unpaid** — không phải Overdue', 'Đỏ *QR expired 31/10 — the customer has not paid by QR*'],
          ['23/11', 'Ngày 29 của hoá đơn', 'Unpaid', 'Đỏ, như trên'],
          ['24/11', 'Ngày 30 của hoá đơn', '**Overdue +0d**', 'Đỏ, như trên'],
          ['26/11', 'Khách chuyển khoản đủ, kế toán *Confirm payment*', '**Paid**', 'Vẫn đỏ *QR expired 31/10* — lịch sử, không mâu thuẫn'],
          ['Nhánh khác', '28/10 khách quét QR, ngân hàng báo về', '**Paid**', 'Xanh *Paid by QR on 28/10*'],
        ],
        note: 'QR hết hạn chỉ đổi dòng QR. Trễ hạn chỉ đếm từ hoá đơn chính thức.',
      },
      {
        kind: 'list',
        items: [
          '**Điều khoản thanh toán** (100% trả trước, 50/50, Net 30) **chỉ in trên đơn** — không chia khoản thu: đơn thu **một số tiền**, trả thiếu thì hiện *Partially paid*.',
          'Khoản thu ở ngân hàng được mở khi **gửi đơn cho khách lần đầu** (lỗi ngân hàng hiện ngay trước mặt người gửi), hoặc lặng lẽ khi **hoá đơn được phát hành**.',
          'Tiền về qua **webhook của ngân hàng**; một job mỗi giờ (phút :55) dò lại những khoản callback bị mất. Một mã giao dịch ngân hàng chỉ ghi **một lần**.',
          'Tiền về tài khoản thường hoặc tiền mặt → kế toán bấm **Confirm payment** trên trang Invoice (quyền `purchase_order:confirm_payment`, của kế toán, không phải của sales). Xác nhận trên Invoice → nhãn trên PO đổi **ngay**.',
        ],
      },
      {
        kind: 'example',
        heading: 'Ví dụ — một PO 50/50 qua cả tháng',
        scenario:
          'Báo giá QUO-009923-10-2026, khách VinaTech (đã Verified) chọn option B — **17.280.000 ₫**. Rep Lan bấm Issue PO ngày **14/10/2026**, điều khoản **50 / 50**.',
        cols: ['Ngày', 'Việc', 'PO', 'Hoá đơn', 'Thanh toán', 'Khách có gì'],
        rows: [
          ['14/10', 'Issue PO → **PO-005871-10-2026**, hết hạn 31/10', 'Active', '—', 'Unpaid', '0 slot'],
          ['14/10', 'Lan *Send the order to the customer* (Woori bank) — QR trong email, đơn thu **một khoản 17.280.000 ₫**', 'Active', '—', 'Unpaid', '0 slot'],
          ['15/10', 'Khách chuyển khoản đợt 1 (8.640.000 ₫), kế toán *Confirm payment*', 'Active', '—', '**Partially paid**', '0 slot — tiền về **không** cấp gì'],
          ['17/10', 'Lan *Export draft invoice* → INV-003402-10-2026 (chưa số pháp lý)', 'Draft invoice', 'Draft', 'Partially paid', '0 slot'],
          ['20/10', 'Lan *Request official invoice*', 'Invoice requested', 'Requested', 'Partially paid', '0 slot'],
          ['22/10', 'Kế toán phát hành → số pháp lý **1C26TAA/0041**', '**Issued invoice**', '**Issued**', 'Partially paid', '**11 slot Tin Basic**, hạn kích hoạt **22/10/2027**'],
          ['20/11', 'Đợt 2 về', 'Issued invoice', 'Issued', '**Paid**', 'Không đổi'],
          ['Nhánh khác', 'Kế toán chưa phát hành trước **31/10 23:59**', '**Expired** (lượt quét kế tiếp)', '**Archived**', 'Tiền đợt 1 đã về nằm trên một đơn không có hoá đơn — người phải xử lý', '0 slot. Phải Duplicate báo giá sang tháng 11'],
        ],
        note: 'Ba ngày dễ bị lấy nhầm làm mốc cấp quota: ngày PO (14/10), ngày tiền về (15/10), ngày hoá đơn (22/10). Chỉ **ngày hoá đơn** đúng.',
      },
      {
        kind: 'warn',
        text:
          '**PO là “đã thắng deal”, không phải “đã giao hàng”.** Nó không tạo tài khoản, không cấp quota, không bật trang công ty. Trạng thái khách hàng cũng **không đổi** ở bước này. Mọi thứ đó chờ kế toán phát hành hoá đơn.',
      },
      {
        kind: 'open',
        text:
          '**Đơn hết hạn nhưng đã nhận tiền.** Gửi đơn là mở khoản thu ngay, nên một đơn hết hạn cuối tháng mà chưa xuất hoá đơn vẫn có thể đã nhận tiền. Hệ thống không tự hoàn hay chuyển tiền đó sang đơn mới — chưa có quy trình chính thức cho kế toán (svn-be `PurchaseOrderEmailService`, ghi chú “a person’s problem to sort out”).',
      },
      {
        kind: 'open',
        text:
          '**Thông báo trong hộp thoại Edit payment details** vẫn nói *“cancel this order and issue a new one”* — nhưng PO không có huỷ. Câu chữ cần sửa thành “để PO tự hết hạn và ra PO mới từ báo giá mới”.',
      },
      {
        kind: 'p',
        text: '**Màn hình thật.**',
      },
      {
        kind: 'shot',
        src: '/shots/crm/po-detail.jpg',
        where: 'Admin',
        caption: 'PO đã có hoá đơn: nhãn *Issued invoice* · *Draft exported* · *Unpaid* — ba trục riêng. Hai bên có MST, link về báo giá và option, ngày phát hành và hạn (*cuối tháng*).',
        note: 'Khối bên bán là dữ liệu của *System → Issuer identity* — trên dev đang là tên test “…LIMITED_TEEST”.',
      },
      {
        kind: 'shot',
        src: '/shots/crm/po-list.jpg',
        where: 'Admin',
        caption: 'Danh sách PO: bốn ô (*Not invoiced · Expiring 7 days · Value not invoiced · Invoiced 30 days*); cột *Status* là trạng thái PO, cột cuối là thanh toán.',
      },
    ],
  },

  /* ───────────────────────────── Invoices ───────────────────────────── */
  invoice: {
    logic: [
      'Phát hành hoá đơn (**Issued**) là hành động cấp quota cho công ty. Đây là mốc quan trọng nhất toàn hệ thống.',
      'Hoá đơn **không được soạn ở đây**: chứng từ hoá đơn sinh ra từ trang PO (khi xuất nháp hoặc chuyển kế toán), trang này chỉ **phát hành**, xem PDF và ghi nhận thanh toán.',
      'Quyền phát hành tách khỏi quyền đọc — `invoice:issue` hiện chỉ *HQ admin* giữ (thay cho vai trò Kế toán chưa tạo), **cố ý không** giao cho sales: người có chỉ tiêu phụ thuộc việc chốt deal không được là người bấm nút giao hàng.',
      'Hoá đơn **không có trạng thái riêng** — nó đọc từ PO. Chuỗi trạng thái và bảng so sánh PO / hoá đơn: xem *Logic chung — CRM*.',
    ],
    how: [
      'Mở hoá đơn ở trạng thái *Invoice requested* (lọc trạng thái trên danh sách, hoặc từ PO → *View draft invoice*).',
      'Kiểm thông tin xuất hoá đơn: tên đơn vị, MST, địa chỉ, dòng hàng, tổng.',
      'Bấm **Issue official invoice** → xác nhận. Ngày phát hành là **hôm nay**; số pháp lý do nhà cung cấp HĐĐT trả về.',
      'Mở **Preview PDF** để lấy bản đã **ký số** của nhà cung cấp.',
      'Kiểm lại: mở công ty → tab **Products & billing** xem quota đã vào chưa.',
    ],
    watch: [
      'Danh sách hoá đơn là **chỉ đọc**; không có “tạo hoá đơn mới”.',
      'Sau khi phát hành, mở lại hồ sơ công ty để xác nhận quota có thật — đừng tin mỗi thông báo thành công.',
      '**Hoá đơn đã phát hành thì không sửa được, và trong admin KHÔNG CÓ nút Huỷ.** Sai thì huỷ + biên bản + xuất lại trên **cổng của nhà cung cấp hoá đơn điện tử**, ngoài hệ thống này. **Quota đã cấp không có đường nào thu hồi.**',
      '**Đính chính: email gửi khách đã chuyển sang trang PO** (29/09/2026). Hộp thoại phát hành giờ chỉ là một câu xác nhận — không còn ô người nhận, không đính PDF, **phát hành không gửi email**. Gửi khách: PO → *Send the order to the customer*.',
      'Thẻ pipeline của báo giá đã bị đóng **Lost** thì nút phát hành bị khoá và server từ chối — mở lại thẻ trước nếu đóng nhầm.',
    ],
    blocks: [
      { kind: 'h', text: '§1 · Trạng thái và các nút', path: '/crm/invoices/:id' },
      {
        kind: 'table',
        heading: 'Bốn trạng thái hoá đơn — không cái nào được lưu',
        note: 'Trạng thái hoá đơn **suy ra từ PO của nó mỗi lần đọc**. Không có gì trên màn hình này đặt được nó; lọc theo trạng thái hoá đơn thực chất là lọc PO bên dưới. PO *Active* thì **chưa có** hoá đơn nào.',
        cols: ['Hoá đơn', 'PO tương ứng', 'Nghĩa', 'Nút có trên trang'],
        rows: [
          ['**Draft**', 'Draft invoice', 'Tài liệu làm việc, **không số pháp lý**. Cấp 0 thứ', '*Export draft invoice* / *Preview draft PDF* · *Confirm payment* · chữ *“Not requested by sales yet”* thay cho nút phát hành'],
          ['**Invoice requested**', 'Invoice requested', 'Đang trong hàng đợi kế toán. **Vẫn chưa cấp gì**, và đồng hồ cuối tháng **vẫn chạy**', '**Issue official invoice** · PDF nháp · *Confirm payment*'],
          ['**Issued**', 'Issued invoice', 'Đã khai với nhà cung cấp, **có số pháp lý**, bất biến. **Sản phẩm đã cấp**', '*Preview PDF* (bản ký số) · *Confirm payment*'],
          ['**Archived**', 'Expired', 'PO hết hạn trước. **Chưa từng cấp gì nên không có gì để thu hồi**', 'Không có PDF'],
        ],
      },
      {
        kind: 'list',
        heading: 'Bấm Issue official invoice — điều gì phải đúng',
        items: [
          'Quyền `invoice:issue` và hoá đơn ở **Invoice requested** — kế toán **không** phát hành được hoá đơn mà sales chưa chuyển sang.',
          'PO **chưa quá cuối tháng** (kiểm theo ngày thật, không chờ máy quét).',
          'Người mua cần MST (*Vietnamese business*) thì phải có MST: *“Cannot issue a VAT invoice without the customer’s tax code (MST)”*. Ba loại người mua còn lại không cần.',
          '**Hồ sơ người bán** (*System › Issuer identity*) phải đủ, kể cả tài khoản ngân hàng.',
          'Thẻ pipeline **không Lost**.',
          'Mọi kiểm tra chạy **trước** khi gọi nhà cung cấp — hồ sơ người bán thiếu thì không tốn số pháp lý nào.',
        ],
      },
      {
        kind: 'table',
        heading: 'Bảy hệ quả của một cú bấm — cùng một giao dịch',
        note: 'Cấp phát chạy **ngay trong giao dịch phát hành**, không chờ job nền: khách đăng tin được **ngay**. Sau khi giao dịch xong, hệ thống lặng lẽ mở khoản thu ở ngân hàng (nếu chưa có) — ngân hàng lỗi thì chỉ là “chưa có QR”, không bao giờ làm hỏng việc phát hành.',
        cols: ['#', 'Xảy ra gì', 'Thấy ở đâu'],
        rows: [
          ['1', 'Hoá đơn được khai: **số pháp lý**, ngày phát hành, người phát hành, **Activate by**', 'Trang này, danh sách hoá đơn'],
          ['2', '**Slot đăng tin** theo tier vào tài khoản', 'Công ty → *Products & billing*'],
          ['3', '**Credit mở CV** vào tài khoản', '*Products & billing*, *CV search usage*'],
          ['4', '**Placement booking** được giữ chỗ (RESERVED)', '*Placements*'],
          ['5', 'Thẻ pipeline → **Invoice**, **thắng**', '*Pipeline*'],
          ['6', 'Khách **New → Existing** (hoặc Churn → Existing), doanh thu cộng dồn, đồng hồ 12 tháng chạy lại', 'Hồ sơ công ty'],
          ['7', '**Hạng thành viên** tính lại cho năm chương trình', 'Hồ sơ công ty, cột *Tier*'],
        ],
      },
      {
        kind: 'list',
        heading: 'Hai số, một PDF, và Activate by',
        items: [
          'Luôn có **hai số**: mã nội bộ `INV-…` (cấp từ lúc tạo nháp) và **số pháp lý** của nhà cung cấp (EasyInvoice, ví dụ `1C26TAA/0041`, có lúc phát hành, kèm mã tra cứu cho người mua). **Không ai gõ số pháp lý** trong vận hành thường ngày. Bản nháp hết hạn **không tiêu số nào** của dãy thuế.',
          '**PDF** là bản **ký số** của nhà cung cấp, lấy trực tiếp mỗi lần bấm — không có bản tự dàn trang nào thay được. Trước khi phát hành, cùng nút đó đẩy bản nháp lên nhà cung cấp rồi mở PDF nháp.',
          '**Activate by** = ngày phát hành + **12 tháng** theo mặc định; **3 tháng** với báo giá *Trial package*; dài hơn nếu một product trong đơn tự khai cửa sổ dài hơn. Con số **chốt từ lúc Issue PO**. Quota đã trả tiền chưa dùng tới hạn này thì hết.',
          'Phát hành lặp (double-click, mạng chập, hai kế toán cùng bấm) **không cấp hai lần**: PO chỉ chuyển trạng thái được một lần, mỗi dòng kế hoạch cấp phát chỉ đóng dấu một lần, và việc gọi nhà cung cấp lấy mã hoá đơn làm khoá — lần gọi lại thu hồi kết quả cũ thay vì nộp chứng từ thứ hai.',
          'Một job mỗi giờ (phút :45) hỏi nhà cung cấp về hoá đơn đã nộp và **gắn cờ** hoá đơn bị thay thế / điều chỉnh / huỷ trên cổng. Chỉ **phát hiện** — không có gì trong hệ thống tự sửa theo.',
        ],
      },

      { kind: 'h', text: '§2 · Ghi nhận thanh toán' },
      {
        kind: 'list',
        items: [
          '**Confirm payment** (quyền `purchase_order:confirm_payment`) — cho tiền ngân hàng không báo về: chuyển vào tài khoản thường, tiền mặt, hoặc callback bị mất.',
          'Hỏi: **Amount received** (mặc định = số còn lại) · **Deposited on** · **Bank transaction ID** (tuỳ chọn — bỏ trống cho tiền mặt, hệ thống tự sinh mã `MANUAL-…`) · **Note**. **Số tiền quyết định nhãn**: ít hơn số còn lại → *Partially paid*; bằng → *Paid*. Một nút, không có “confirm một phần” riêng.',
          'Xác nhận được cả trên hoá đơn **Draft** (khách trả trước khi xuất hoá đơn là bình thường) → *Paid*, và giữ *Paid* khi phát hành chính thức sau đó. Xác nhận trên Invoice → nhãn trên PO đổi **ngay**.',
          'Đơn Woori bank có thêm **dòng QR** (chỉ đọc) dưới header; khách trả qua QR thì ngân hàng tự báo về, **không cần** Confirm payment. Quy tắc Payment status, Overdue và QR: xem trang **Purchase order §2**.',
          'Mã giao dịch là **danh tính của khoản tiền**: nhập trùng → bị từ chối; webhook đến sau cho cùng giao dịch → bị bỏ qua. Không trả một đơn hai lần.',
          'Số tiền lệch vẫn **được ghi**, kèm cờ trong audit log — trả thiếu, trả thừa đều có thật.',
          'Nút **tắt** khi đơn đã *Paid*. **Payment history** dưới chứng từ liệt kê mọi khoản đã về (ngân hàng hay ghi tay, ngày, số tiền, ghi chú).',
          'Ghi nhận thanh toán **không bao giờ cấp thêm quota**.',
        ],
      },

      { kind: 'h', text: '§3 · Danh sách', path: '/crm/invoices' },
      {
        kind: 'list',
        items: [
          'Cột: *Invoice · legal no. · Customer · Company ID · Sales owner · From PO · Total · Status · Payment · Payment terms · Method · Expected payment date · Issued · Activate by*.',
          'Tìm theo mã hoá đơn, số pháp lý, số PO hoặc khách. Lọc trạng thái, *Raised between* (theo **ngày tạo**, không phải ngày phát hành), *Mine / My team’s / All*. Export cần `invoice:export`.',
          '**Overview**: *Not issued* (nháp + đã chuyển) · *Stuck 7+ days* (tạo hơn một tuần mà chưa phát hành) · *Issued value · 30 days* · *Issued · 30 days*.',
          'Sales có `invoice:read` — xem được hoá đơn và PDF ký số của khách mình, nhưng không phát hành.',
        ],
      },
      {
        kind: 'example',
        heading: 'Ví dụ — một buổi sáng của kế toán',
        scenario: 'Thứ Năm 29/10/2026. Kế toán mở *Invoices*, lọc *Invoice requested*: ba dòng.',
        cols: ['Hoá đơn', 'Tình huống', 'Kết quả khi bấm Issue'],
        rows: [
          ['INV-003402-10-2026 · VinaTech', 'Đủ điều kiện', 'Số pháp lý về, khách có slot ngay, thẻ pipeline thắng'],
          ['INV-003405-10-2026 · khách cá nhân có CCCD', 'Không có MST — đúng với loại người mua này', 'Phát hành bình thường; hoá đơn in CCCD, không in ô MST'],
          ['INV-003409-10-2026 · Vạn Phát', 'Rep đã đóng Lost thẻ sau khi chuyển kế toán', 'Nút **khoá**, banner nói phải mở lại thẻ. Không ai làm gì → PO hết hạn **31/10**, hoá đơn thành *Archived*, không cấp gì'],
        ],
        note: 'Mọi hoá đơn *Invoice requested* chưa phát hành tới **31/10 23:59** đều chết theo PO. Hàng đợi của kế toán dồn vào cuối tháng là chuyện bình thường; bỏ sót một dòng nghĩa là sales phải làm lại từ báo giá.',
      },
      {
        kind: 'open',
        text:
          '**Khách nhận hoá đơn ký số bằng cách nào?** Từ 29/09/2026 phát hành không gửi email nữa, và email trên PO đính kèm **PDF đơn hàng**, không phải hoá đơn ký số. Chưa xác minh nhà cung cấp HĐĐT có tự gửi cho người mua không; hiện kế toán/sales phải tải *Preview PDF* và gửi tay.',
      },
      {
        kind: 'open',
        text:
          '**Nhãn “issue date + 12 months”** dưới *Activate by* là chữ cố định trên màn hình — sai với báo giá *Trial package* (3 tháng) và product tự khai cửa sổ dài hơn. Ngày hiển thị là đúng; chỉ dòng chú thích sai.',
      },
      {
        kind: 'p',
        text: '**Màn hình thật.** Đây là màn hình quan trọng nhất trong toàn hệ thống — bấm nút ở đây là lúc khách có quyền lợi.',
      },
      {
        kind: 'shot',
        src: '/shots/crm/invoice-detail.jpg',
        where: 'Admin',
        caption: 'Hoá đơn **Issued** cạnh **Unpaid** — hai việc khác nhau. Số pháp lý *1C26TTD/0170* do nhà cung cấp cấp, *Activate by* = ngày phát hành + 12 tháng, ghi chú *“Immutable — and there is no cancel”*.',
      },
      {
        kind: 'shot',
        src: '/shots/crm/invoices-list.jpg',
        where: 'Admin',
        caption: 'Danh sách hoá đơn: cột đầu ghi mã nội bộ `INV-…` kèm số pháp lý bên dưới; ô *Stuck 7+ days* đếm hoá đơn chờ kế toán quá lâu.',
      },
    ],
  },
}

/* MODULE_DOCS['CRM'] copied verbatim from docs.ts, with ONLY the claims the 2026-10-08 build
   check proved stale corrected — each correction also carries a `warn`. */
export const CRM_SALES_MODULE_DOCS: Record<string, ModuleDoc> = {
  CRM: {
    title: 'Logic chung — CRM',
    lead:
      'CRM là luồng bán: một công ty có người phụ trách, rồi một chuỗi ba chứng từ nối tiếp — **Báo giá → PO → Hoá đơn GTGT** — mỗi chứng từ chỉ dựng được từ chứng từ trước nó. Chỉ mắt xích cuối cùng mới đổi được quyền sử dụng của khách.',
    headline: [
      '**Chỉ hoá đơn GTGT ở trạng thái Issued mới cấp quota.** Không phải PO (đó là lúc deal “thắng”, nhưng không cấp gì), không phải hoá đơn nháp, không phải lúc tiền về. Kế toán bấm Issue là sản phẩm vào tài khoản khách ngay giây đó.',
      '**Một bảng công ty, chỉ Admin tạo công ty.** Sales không bao giờ tạo công ty — chỉ có thể xin một công ty từ Free data (hai cấp duyệt) hoặc được Admin gán. **Sign-up là luồng riêng, của một NGƯỜI**: Admin đặt người đó vào một công ty đã ở Assigned (*Move*) hoặc tạo công ty mới cho họ (*Create*) — lúc đó mới **đăng nhập** được; Admin Verify mới **đăng tin và xin hoá đơn** được.',
      '**Các trạng thái nằm trên những trục riêng, không trục nào kéo trục nào.** Trạng thái công ty, trạng thái khách hàng, xác minh, chặng pipeline, trạng thái từng chứng từ và thanh toán — mỗi cái trả lời một câu hỏi khác. Mất deal không đổi trạng thái khách; hoá đơn chưa trả tiền vẫn là hoá đơn đã phát hành.',
    ],
    blocks: [
      {
        kind: 'diagram',
        id: 'crm-chain',
        heading: 'Toàn cảnh — từ một công ty tới lúc sản phẩm vào tài khoản',
        note: 'Đọc từ trên xuống. Mọi màn hình bên dưới là **một bước** trên sơ đồ này. Ô xanh lá là khoảnh khắc duy nhất có thứ đổi chủ.',
      },
      {
        kind: 'table',
        heading: 'Các màn hình trong CRM',
        cols: ['Màn hình', 'Đường dẫn', 'Làm gì'],
        rows: [
          ['**Customers**', '/crm/companies', 'Sổ công ty — một bảng, ba tab: **Assigned · Free data · Archived**'],
          ['**Hồ sơ công ty**', '/crm/companies/:id', 'Mọi thứ về một công ty: liên hệ, tài khoản đăng nhập, quota, claim, lịch sử owner, nút **Verify company**, nút **+ Create quotation**'],
          ['**Sign-ups**', '/crm/sign-ups', 'Nhà tuyển dụng tự đăng ký trên Company site, chờ Admin xử lý'],
          ['**Claim requests**', '/crm/company-claims', 'Nhật ký của chính rep: các lần xin công ty Free data và kết quả'],
          ['**Pipeline**', '/crm/pipeline', 'Bảng deal — sáu cột'],
          ['**Quotations**', '/crm/quotations', 'Báo giá: 1–3 option có giá'],
          ['**Purchase orders**', '/crm/purchase-orders', 'Đơn đã cam kết, dựng từ option khách chấp nhận'],
          ['**Invoices**', '/crm/invoices', 'Hoá đơn GTGT điện tử — phát hành nó là thứ cấp sản phẩm'],
        ],
      },

      /* ── companies ── */
      {
        kind: 'table',
        heading: 'Một công ty vào hệ thống bằng hai cửa — cả hai đều có Admin',
        note: 'Sign-up **không** phải cửa thứ ba: nó chỉ đặt một người vào một công ty đã ở Customers · Assigned. Xem phần **Sign-ups** bên dưới — có sơ đồ riêng.',
        cols: ['Cửa', 'Ai làm', 'Cần gì', 'Vào đâu'],
        rows: [
          ['**A · Customers → + New company**', 'Admin', 'Tên pháp lý · **MST** (nút *Check* tra cổng đăng ký kinh doanh quốc gia và điền sẵn địa chỉ) · thông tin xuất hoá đơn · liên hệ chính · sales owner. **Để trống owner thì công ty vào Free data**', 'Assigned (hoặc Free data)'],
          ['**B · Free data → Ask for this company**', 'Sales xin; Admin rồi Sales lead duyệt', 'Lý do, loại khách, bằng chứng (link hoặc file). Công ty phải có MST thì Sales lead mới duyệt được', 'Assigned — rep thành sales owner'],
        ],
      },
      {
        kind: 'diagram',
        id: 'crm-intake',
        heading: 'Công ty: tạo ở đâu, và từ Free data sang Customers · Assigned',
        note: 'Sơ đồ này **chỉ vẽ công ty**. Người tự đăng ký và trạng thái xác minh có sơ đồ riêng ở phần Sign-ups bên dưới — ba sơ đồ, ba câu hỏi, không chồng lên nhau.',
      },
      {
        kind: 'list',
        heading: 'Luật áp cho mọi cửa',
        items: [
          '**MST chỉ ghi một lần, không trùng toàn hệ thống**: 10 số, hoặc 10 số + `-001` cho chi nhánh. Trùng thì bị từ chối và hệ thống **nêu tên công ty đang giữ MST đó**. Công ty không có MST **không bao giờ** đăng tin công khai hay xuất hoá đơn được.',
          '**Công ty nước ngoài** không có MST Việt Nam — form không hỏi; hoá đơn vẫn cần tên pháp lý và địa chỉ.',
          '**Tên ngắn** gợi ý từ tên pháp lý (bỏ loại hình, viết hoa) và in trên danh sách; **tên pháp lý** là thứ in lên mọi chứng từ.',
          '**Công ty mẹ / con** là liên kết giữa hai hồ sơ đầy đủ. **Không gì được chia sẻ hay thừa kế xuống dưới** — mỗi công ty giữ MST, quota, hoá đơn và sales owner của riêng nó. Muốn một công ty tiêu quota của công ty khác thì dùng **Shared quota** (bên dưới), không phải quan hệ mẹ con.',
          'Công ty nhận mã `CO-` **ngay khi tạo** và mã đó **không đổi** suốt đời: lead → khách hàng → rời bỏ → quay lại.',
        ],
      },
      {
        kind: 'table',
        heading: 'Năm trục trạng thái trên một công ty — không trục nào kéo trục nào',
        note: 'Mỗi trục do **một bên khác nhau** đặt. Đây là bảng nên dùng để viết test case.',
        cols: ['Trục', 'Giá trị', 'Ai đặt', 'Ghi chú'],
        rows: [
          ['**Company status**', 'Active · Archived', 'Admin / Sales lead', 'Active là mặc định, **kể cả khách đã rời**. Archive cần **lý do từ danh sách cố định** (*Bankrupt / dissolved · Merged into another company · Duplicate / created by mistake* …) và **không khôi phục được trên giao diện** (không có nút Restore). **Không có trạng thái “Inactive”**'],
          ['**Customer status**', 'New · Existing · Churn', '**Chỉ hệ thống**', 'New từ lúc tạo → **Existing khi hoá đơn GTGT đầu tiên Issued** → Churn sau 12 tháng không có đơn mới. Kéo lại được khách thì về **Existing**, không về New'],
          ['**Verification**', 'Unverified · Waiting to verify · Verified', 'Khách tải ERC (tự suy ra) · Admin bấm Verify', 'Verified = Admin đã bấm. Waiting = chưa Verify nhưng **đã có ERC**. Unverified = chưa có giấy'],
          ['**Pipeline**', 'Not in pipeline · Proposal · Qualified · Negotiation · PO · Invoice', 'Sales (3 chặng đầu) · Hệ thống (PO, Invoice)', 'Đọc từ **một thẻ đại diện** — mỗi báo giá là một thẻ, công ty có thể có nhiều thẻ; thẻ đang mở được ưu tiên, nếu không thì thẻ đóng gần nhất. **“Lost” không phải một chặng** — deal thua giữ nguyên chặng nó dừng'],
          ['**Sales owner**', 'chưa gán (Free data) · một rep', 'Admin / duyệt claim / bàn giao', 'Chưa gán = Free data. Mọi thay đổi ghi vào **Owner history**'],
        ],
      },
      {
        kind: 'warn',
        text:
          'Trạng thái pipeline và trạng thái khách hàng **độc lập**. Mất một deal không làm đổi trạng thái khách; thắng deal cũng không tự làm khách thành Existing — **hoá đơn** mới làm. Một công ty vừa *Existing* vừa đang *Negotiation* là một tài khoản khoẻ mạnh, không phải lỗi dữ liệu.',
      },
      {
        kind: 'warn',
        text:
          '**Đính chính (build 08/10/2026):** không có nút *Restore* cho công ty đã archive — svn-be có endpoint nhưng không màn hình nào gọi. Và công ty **không có một chặng pipeline duy nhất**: mỗi báo giá là một thẻ, chip trên danh sách chỉ đọc một thẻ đại diện.',
      },
      {
        kind: 'table',
        heading: 'Hạng thành viên — trục duy nhất thuần số học',
        note: 'Tính theo giá trị đơn đã thanh toán trong năm chương trình.',
        cols: ['Hạng', 'Từ', 'Dưới'],
        rows: [
          ['— (chưa có hạng)', '0 ₫', '30.000.000 ₫'],
          ['Member', '30.000.000 ₫', '50.000.000 ₫'],
          ['Bronze', '50.000.000 ₫', '100.000.000 ₫'],
          ['Silver', '100.000.000 ₫', '200.000.000 ₫'],
          ['Gold', '200.000.000 ₫', '300.000.000 ₫'],
          ['Diamond', '300.000.000 ₫', '—'],
        ],
      },
      {
        kind: 'list',
        heading: 'Đọc hồ sơ một công ty',
        items: [
          '**Hàng số liệu** là tóm tắt tài khoản: hạng thành viên, khách từ ngày nào, số tin đang mở, quota tin còn lại (mọi bậc), lượt mở CV, sales owner.',
          '**Nút trên đầu**: Archive · **Verify company** (chỉ khi chưa Verified) · View on jobseeker · **+ Create quotation** — nút tạo **duy nhất** trên hồ sơ, vì công ty nào, trạng thái nào cũng báo giá được. **Không có nút Tạo PO**, không có nút “Chuyển thành khách hàng”: PO đi ra từ báo giá, còn “thành khách hàng” là do hoá đơn.',
          '**Các tab**: Overview · Contacts · Users (tài khoản đăng nhập của chính khách — mời qua email, không bao giờ trao mật khẩu) · **Products & billing** · Company page · Jobs · Claim requests · Owner history · Applications · Resumes.',
          '**Người liên hệ ≠ tài khoản đăng nhập.** Hai danh sách độc lập: liên hệ là người mình gọi; tài khoản là người dùng được hệ thống. Xoá liên hệ không xoá tài khoản.',
        ],
      },
      {
        kind: 'list',
        heading: 'Products & billing — nơi xác nhận khách đã nhận được gì',
        items: [
          'Sau khi kế toán phát hành hoá đơn, đọc kết quả ở đây: **Purchases, by invoice** liệt kê từng hoá đơn đã Issued (số pháp lý · mã `INV-` nội bộ · ngày phát hành) cùng các dòng sản phẩm — số slot, hạn dùng, đã dùng N/M.',
          'Đơn đã tạo mà **chưa có hoá đơn** được đếm ở một dòng riêng — **chưa cấp gì** từ chúng.',
          'Quota chỉ đổi vì **ba lý do**: hoá đơn Issued cấp nó · đăng tin tiêu nó · mở CV trừ credit. **Không có cấp tay** — số quota đổi vì lý do nào khác là bug.',
        ],
      },
      {
        kind: 'shot',
        src: '/shots/crm/company-billing.jpg',
        where: 'Admin',
        caption: 'Tab **Products & billing** trên dev: thứ khách đang giữ theo từng product, rồi từng hoá đơn đã Issued và các dòng nó cấp.',
      },

      {
        kind: 'warn',
        text:
          '**Đính chính:** nút *Call* không còn ở đầu hồ sơ — nó nằm trong **bảng Activity** ở cột phải tab *Overview*, cùng chỗ với nhật ký chat / gọi / gặp và các cuộc gọi Callio đã gắn vào công ty (admin PR #560, 08/10/2026).',
      },
      /* ── Free data & sign-ups ── */
      {
        kind: 'table',
        heading: 'Free data — hai trạng thái chờ, và “bị từ chối” không phải một trạng thái',
        note: 'Free data và Customers là **một bảng, hai mức độ đầy đủ**. Dòng Free data chỉ cần tên công ty, MST chưa xác minh, **không có owner** — và không mang được báo giá, PO hay hoá đơn nào.',
        cols: ['Dòng ghi', 'Nghĩa', 'Xin được không?'],
        rows: [
          ['**Not claimed**', 'Chưa ai xin', 'Được — *Ask for this company* trên hồ sơ'],
          ['**Waiting · step 1 · Admin**', 'Một rep đã xin; Admin chưa quyết', 'Không — **mỗi lúc một yêu cầu**; nút biến mất với mọi người khác'],
          ['**Waiting · step 2 · Sales lead**', 'Admin đã cho qua; Sales lead quyết', 'Không'],
          ['*(bị từ chối)*', '**Không phải trạng thái.** Yêu cầu là *Rejected*; công ty về *Not claimed* và ghi *“Rejected N time(s) before”*', 'Được — ai cũng xin lại được, kể cả rep cũ'],
        ],
      },
      {
        kind: 'list',
        heading: 'Duyệt claim — ai làm gì',
        items: [
          '**Bước 1 · Admin**: đọc lý do, bằng chứng, người liên hệ → *Approve · Admin* (chuyển cho lead; **chưa tạo gì**) hoặc *Reject* (dừng hẳn).',
          '**Bước 2 · Sales lead**: *Approve · Sales lead* là **lần ghi duy nhất** — rep thành sales owner, người liên hệ thành liên hệ #1, công ty rời Free data, mọi yêu cầu mở khác bị từ chối. *Reject* ở bước này cũng dừng hẳn, **không trả về Admin**.',
          '**Bỏ qua cả hai bước**: Admin dùng *Assign directly · Admin* trên tab Claim requests — chọn rep → *Assign now*. Yêu cầu đang mở tự bị từ chối kèm ghi chú nêu người được gán.',
          '**Cổng MST** nằm ở nút tạo ra owner — *Approve* của lead và *Assign* của Admin — không ở bước 1 (bước 1 không tạo gì). Thiếu MST thì nút bị khoá (*Fill in the tax code*); *Reject* lúc nào cũng bấm được.',
          '**Return to the pool** trên một công ty đã có owner thả nó về Free data, ghi vào Owner history, và công ty về pool **kèm lịch sử** cho người duyệt sau đọc.',
          'Rep theo dõi ở **CRM → Claim requests** — chỉ đọc, không có nút, có chủ đích: quyết định nằm trên hồ sơ công ty.',
        ],
      },
      {
        kind: 'shot',
        src: '/shots/crm/freedata-claim-tab.jpg',
        where: 'Admin',
        caption: 'Một công ty Free data: *Not claimed* · *Unverified*, nút **Ask for this company**, và thẻ **Assign directly · Admin**.',
      },
      {
        kind: 'table',
        heading: 'Sign-ups — ba hành động, dòng nào cũng phải được xử lý',
        note: 'Luồng này **độc lập** với sơ đồ Free data / Customers ở trên: nó đặt một **người** vào một công ty, không chuyển công ty nào.',
        cols: ['Hành động (menu ⋯)', 'Khi nào', 'Làm gì'],
        rows: [
          ['**Move to existing company**', 'Cột *Match* chỉ ra một công ty ở Customers · Assigned — **hoặc** một công ty Free data **sau khi** đã đưa nó sang Assigned (xem dưới)', 'Chọn công ty đích (chọn sẵn theo MST, đổi được) + vai trò (để trống = Company Admin) → *Place sign-up*. Tạo login **bên trong công ty đó**, gửi mail đăng nhập. Không tạo công ty mới'],
          ['**Create company & activate**', 'Công ty thật sự mới', 'Mở form **New company** điền sẵn từ dòng sign-up; lưu là đồng thời kích hoạt người đó làm admin đầu tiên. Công ty vào ở *Unverified*'],
          ['**Archive**', 'Spam, test, trùng', 'Từ chối, kèm lý do (gửi email cho người đăng ký). Không login, không công ty'],
        ],
      },
      {
        kind: 'diagram',
        id: 'crm-signup',
        heading: 'Sign-up — từ lúc đăng ký tới lúc đăng nhập được',
        note: 'Công ty khách nêu **còn ở Free data** thì là **hai bước**, không phải hành động thứ tư: ① trên hồ sơ công ty Free data, Admin **Assign directly** (cần MST) để đưa nó sang Assigned; ② quay lại Sign-ups → **Move to existing company**. Đúng như hộp thoại Move nói: *“That company is still in Free data … Promote it to Customers first, then come back.”*',
      },
      {
        kind: 'shot',
        src: '/shots/crm/signups.jpg',
        where: 'Admin',
        caption: 'Màn **Sign-ups** trên dev — hành động nằm ở menu ⋯ cuối mỗi dòng.',
      },
      {
        kind: 'list',
        heading: 'Hai điều về Sign-ups hay bị hiểu sai',
        items: [
          '**Cột Match không quyết định gì.** Nó chỉ báo, lúc đọc, MST (hoặc tên miền email, hoặc tên) đã thuộc công ty nào — gắn nhãn *Customers* hay *Free data* — và chọn sẵn công ty đó trong Move. Email miễn phí (@gmail.com) **không bao giờ** khớp.',
          'Dòng **chưa xác minh email** vẫn hiện, ghi *Awaiting*. Archive được, nhưng **không Move / Create được** — server từ chối dù màn hình có cho bấm.',
          'Hộp thoại Move dừng ở hai trường hợp và nói rõ vì sao: *“This tax code reaches no company yet”* (tạo công ty trước) và *“That company is still in Free data”* (đưa sang Customers trước).',
        ],
      },
      {
        kind: 'diagram',
        id: 'crm-verify',
        heading: 'Trạng thái xác minh công ty — Unverified → Waiting to verify → Verified',
        note: 'Bắt đầu **sau khi** người đăng ký đã được Move / Create. Ba nhãn này giống hệt nhau ở danh sách Customers (cột và bộ lọc), trên hồ sơ công ty, và cạnh tên công ty trên Company site.',
      },
      {
        kind: 'table',
        heading: 'Ba trạng thái xác minh',
        cols: ['Trạng thái', 'Nghĩa', 'Vào trạng thái này khi', 'Ai phải làm tiếp'],
        rows: [
          ['**Unverified**', 'Chưa Verify, **chưa có giấy ĐKKD** trên hồ sơ', 'Công ty vừa được tạo (Create, hoặc + New company) mà chưa có giấy', '**Khách** — tải giấy ở Company information (hoặc Admin tải hộ ở thẻ Company documents trên hồ sơ)'],
          ['**Waiting to verify**', 'Chưa Verify, nhưng **đã có giấy** để xét', 'Tự động khi file giấy đầu tiên được tải lên — không ai bấm gì · hoặc Admin sửa dữ liệu định danh của công ty đã Verified', '**Admin** — đối chiếu giấy với tên pháp lý, MST, địa chỉ rồi bấm **Verify company**'],
          ['**Verified**', 'Admin đã bấm Verify', 'Admin bấm **Verify company** trên hồ sơ (chỉ chạy khi đang Waiting)', 'Không ai — cho tới khi Admin sửa dữ liệu định danh'],
        ],
      },
      {
        kind: 'table',
        heading: 'Xác minh công ty gate ĐÚNG HAI thứ — không hơn',
        note: 'Đây là chỗ hay bị hiểu rộng ra. Chưa Verified thì khách vẫn đăng nhập, đọc, sửa thông tin, nhận báo giá và ký PO bình thường.',
        cols: ['Hành động', 'Chưa Verified', 'Đã Verified'],
        rows: [
          ['Nhà tuyển dụng đăng tin (Publish **hoặc** lưu nháp)', '**Bị chặn** — trang đòi giấy ĐKKD', 'Được'],
          ['Sales bấm **Request official invoice** trên PO', '**Bị chặn**, có tooltip giải thích (chặn cả ở server)', 'Được'],
          ['Đăng nhập · đọc · tải ERC · sửa Company information · báo giá · Issue PO · **admin đăng tin hộ khách**', 'Được', 'Được'],
        ],
      },
      {
        kind: 'warn',
        text:
          '**Admin sửa dữ liệu định danh của công ty đã Verified (tên pháp lý, MST, địa chỉ đăng ký) sẽ đẩy nó về Waiting to verify** — lặng lẽ, chỉ đổi cái nhãn. Lúc đó khách **mất quyền đăng tin** và sales **mất nút xin hoá đơn**, cho tới khi có người bấm Verify lại. Sau khi Verified, Company information phía khách chỉ còn **đọc** (vẫn tải giấy lên được).',
      },
      {
        kind: 'warn',
        text:
          '**Trang Company documents đã bị gỡ ngày 06/10/2026.** Hàng đợi duyệt từng file (Approve / Refuse) và hàng đợi *Legal changes* đi cùng nó, **không có gì thay thế**. Giấy ĐKKD giờ chỉ xem ở **thẻ Company documents trên hồ sơ công ty**, và quyết định duy nhất là nút **Verify company**. Hệ quả: một file khách nộp sai **không từ chối được** trong console — công ty vẫn hiện *Waiting to verify*.',
      },

      /* ── documents ── */
      {
        kind: 'table',
        heading: 'Chuỗi chứng từ — ai tạo, tạo ở đâu, để lại gì',
        note: 'Mỗi bước dựng từ bước trước. Không gõ lại gì, và tổng hoá đơn = tổng PO = tổng option khách chấp nhận, **tới từng đồng**.',
        cols: ['Bước', 'Tạo ở đâu', 'Ai làm', 'Để lại gì'],
        rows: [
          ['Báo giá', 'Hồ sơ công ty → **+ Create quotation** (hoặc + New quotation trên danh sách)', 'Sales', '1–3 option để khách chọn một. Lưu báo giá đầu tiên là tạo deal ở **Proposal**'],
          ['PO', 'Báo giá → **Issue PO** → chọn option khách chấp nhận', 'Sales', 'Cam kết mua + yêu cầu thanh toán. Deal thắng. **Chưa cấp quota**'],
          ['Hoá đơn nháp *(tuỳ chọn)*', 'PO → **Export draft invoice**', 'Sales', 'Bản làm việc, không số pháp lý, **không cấp gì**'],
          ['Yêu cầu hoá đơn', 'PO → **Request official invoice**', 'Sales — **công ty phải Verified**', 'Đưa vào hàng đợi của kế toán'],
          ['Hoá đơn GTGT', 'Trang hoá đơn → **Issue**', '**Chỉ kế toán**', 'Số pháp lý từ nhà cung cấp HĐĐT · **quota vào tài khoản ngay**'],
        ],
      },
      {
        kind: 'table',
        heading: 'Báo giá — bốn trạng thái',
        cols: ['Trạng thái', 'Nghĩa', 'Đi tiếp bằng'],
        rows: [
          ['**Draft**', 'Đang soạn — trạng thái **duy nhất** gửi được (*Mark as sent*). Sửa được. Đã có trên pipeline ở Proposal', 'Sales: *Save draft* → *Mark as sent*'],
          ['**Sent**', 'Đã gửi khách (qua bất kỳ kênh nào — sales tự khai). **Vẫn sửa được số liệu** (*Edit*) cho tới khi ra PO hoặc hết hạn', 'Sales: *Issue PO* và chọn option khách chấp nhận'],
          ['**Issued to PO**', 'Một option đã được chấp nhận và PO đã có. **Trạng thái cuối**', 'Tự động khi Issue PO. Bấm Issue PO lần hai → bị từ chối'],
          ['**Expired**', 'Qua **cuối tháng** mà chưa có PO', 'Hệ thống. Thẻ rời bảng pipeline — **không phải Lost**: không lý do, không đổi trạng thái khách. *Duplicate* để có bản nháp mới'],
        ],
      },
      {
        kind: 'warn',
        text:
          '**Đính chính:** báo giá *Sent* **vẫn sửa được số liệu** (svn-be `QuoteStatus.isRevisable` = Draft + Sent); chỉ *Mark as sent* là riêng của Draft. Sửa thì duyệt chiết khấu được tính lại. Báo giá hết hạn làm **thẻ** rời bảng, không phải công ty.',
      },
      {
        kind: 'list',
        heading: 'Trong form báo giá',
        items: [
          '**Số báo giá** cấp lúc lưu, từ dãy liên tục `QUO-{số}-{tháng}-{năm}`. **Hạn** = ngày cuối của tháng hiện tại, luôn luôn.',
          'Thông tin khách (tên pháp lý, MST, địa chỉ xuất hoá đơn, liên hệ) in từ hồ sơ công ty — **sai thì sửa ở hồ sơ**, không sửa ở đây.',
          'Mỗi option có **+ Line item** (dịch vụ từ catalogue *Active* · số lượng · đơn giá · giảm giá) và **+ Gift** (giá 0, không đặt giá được). Option là **phương án thay thế nhau** — không có tổng chung, không gì được cộng các option lại. Đánh dấu một option *Recommended*. Mỗi option cần ít nhất một dòng có tiền.',
          '**Discount programme** — chọn **một** cho cả báo giá: *New / returning customer offer · Quantity discount · Trial package · Special offer*. Mức giảm tổng đơn cần duyệt theo **ngưỡng của chính chương trình**: dưới ngưỡng **Sales lead** duyệt, từ ngưỡng trở lên **Sales manager** duyệt thẳng (không qua lead). Đổi % sau khi đã duyệt → duyệt bị huỷ và chuyển lại. Xem *Product settings → Discount programmes*.',
          'Chọn **Trial package** thì mọi dòng chỉ được chọn product dùng thử.',
          'Tổng: Subtotal · Discount · Amount off · After discount · VAT 8 % · Total after VAT · số tiền bằng chữ.',
          'Một báo giá cũng có thể **đóng thua** (*Mark as lost*, hoặc kéo thẻ pipeline sang Lost) — luôn kèm lý do; số liệu bị đóng băng.',
        ],
      },
      {
        kind: 'table',
        heading: 'PO — năm trạng thái, một chiều tiến, một lối ra',
        note: 'Không có nút tạo PO trống, **không sửa dòng** (chỉ sửa được điều khoản, phương thức, ngày hẹn trả), **không xoá, không huỷ**. PO tồn tại chỉ vì một option được chấp nhận.',
        cols: ['Trạng thái PO', 'Hoá đơn bên dưới', 'Tới bằng', 'Ai'],
        rows: [
          ['**Active**', '— chưa có', '*Issue PO* từ option khách chấp nhận. Thắng, **chưa cấp gì**', 'Sales'],
          ['**Draft invoice**', 'Draft', '*Export draft invoice* — bản làm việc, không số pháp lý, không cấp gì. Tuỳ chọn', 'Sales'],
          ['**Invoice requested**', 'Invoice requested', '*Request official invoice* — chuyển vào hàng đợi kế toán. Từ Active hoặc Draft invoice', 'Sales — cần công ty **Verified**'],
          ['**Issued invoice**', 'Issued', 'Kế toán phát hành trên trang hoá đơn. **Sản phẩm vào tài khoản cùng lúc.** Trạng thái cuối', '**Chỉ kế toán**'],
          ['**Expired**', 'Archived', 'Qua cuối tháng mà chưa có hoá đơn chính thức — từ Active, Draft invoice hoặc Invoice requested. Không ai bấm', 'Hệ thống (quét mỗi giờ)'],
        ],
      },
      {
        kind: 'list',
        heading: 'Điều đáng biết về PO',
        items: [
          '**Hết hạn cuối tháng, không phải 30 ngày trôi** — PO ngày 05/07 và ngày 28/07 cùng hết hạn 31/07, giống luật của báo giá. Ngay sau nửa đêm cuối tháng, một dòng có thể vẫn ghi *Active* vài giờ trước khi lượt quét đánh dấu — nhưng nút phát hành đã từ chối.',
          '**Thanh toán không phải trạng thái.** Huy hiệu và cột ghi *Unpaid / Partially paid / Paid* (và *Overdue +N d* khi hoá đơn **chính thức** đã 30 ngày mà chưa có đồng nào — SRM-1080). Việc xuất hoá đơn **không bao giờ** bị chặn bởi thanh toán.',
          '**Không có Edit services.** Dòng, giá, người mua của PO cố định; chỉ *Edit payment details* (điều khoản · phương thức · ngày hẹn trả) sửa được, tới khi có hoá đơn chính thức.',
          'Hộp thoại **Issue PO** hỏi thêm thứ báo giá không có: **điều khoản thanh toán** (100 % trả trước mặc định, 50/50 hoặc Net 30 — chỉ in trên đơn, không chia khoản thu), phương thức, và **Expected payment date — bắt buộc**, chưa chọn thì không bấm được *Issue PO* (với Woori bank, đó là ngày QR hết hạn). **Số PO của chính khách** hiện **không nhập được** trên giao diện (chỉ hiện nếu đã có từ trước) — nó không đổi gì cả.',
        ],
      },
      {
        kind: 'warn',
        text:
          '**Đính chính:** không có *Edit services* trên PO (không nút, không endpoint) và ô số PO của khách đã bị gỡ khỏi màn hình. Muốn đổi dịch vụ: *Duplicate* báo giá → gửi → Issue PO mới; PO cũ tự hết hạn cuối tháng.',
      },
      {
        kind: 'table',
        heading: 'Hoá đơn — bốn trạng thái, không trạng thái nào được lưu riêng',
        note: 'Trạng thái hoá đơn **suy ra từ PO** mỗi lần đọc — không gì trên màn hình hoá đơn đặt được trạng thái. `/crm/invoices/new` không tồn tại: hoá đơn được chuẩn bị từ PO, chỉ được **phát hành** ở đây.',
        cols: ['Hoá đơn', 'PO', 'Nghĩa'],
        rows: [
          ['**Draft**', 'Draft invoice', 'Bản làm việc, không số pháp lý. **Không cấp gì.** Xem trước PDF nháp được'],
          ['**Invoice requested**', 'Invoice requested', 'Trong hàng đợi kế toán. Vẫn không cấp gì; đồng hồ cuối tháng vẫn chạy'],
          ['**Issued**', 'Issued invoice', 'Đã khai với nhà cung cấp, có số pháp lý, **bất biến**. Sản phẩm được cấp · deal thắng · khách New → Existing · *Activate by* = ngày phát hành + 12 tháng'],
          ['**Archived**', 'Expired', 'PO hết hạn trước. Chưa từng cấp gì, nên **không có gì để thu hồi**'],
        ],
      },
      {
        kind: 'list',
        heading: 'Phát hành hoá đơn — chỉ kế toán',
        items: [
          'Quyền `invoice:issue` thuộc HQ admin / kế toán và **cố tình không giao cho sales**: người có chỉ tiêu phụ thuộc việc chốt deal **không được** là người bấm nút giao hàng cho khách.',
          'Hộp thoại phát hành chỉ là **một câu xác nhận**, ngày phát hành là hôm nay. **Phát hành không gửi email.** Email cho khách (liên hệ của công ty, CC liên hệ + người phụ trách deal, PDF đơn hàng, **mã QR thanh toán**, link điều khoản) gửi từ trang **PO** → *Send the order to the customer*.',
          '**Số pháp lý do nhà cung cấp hoá đơn điện tử (EasyInvoice) cấp** và trả về kèm mã tra cứu — **không ai gõ tay**. Luôn có hai số: số của mình (`INV-…`, cấp từ lúc nháp) và số pháp lý (có lúc phát hành). Nháp hết hạn không tiêu số nào của dãy thuế.',
          '**Confirm a customer transfer** ghi nhận tiền (đợt, số tiền, ngày, mã giao dịch ngân hàng): đổi *Unpaid → Partially paid / Paid* và **không bao giờ cấp quota lần nữa**.',
          '**Không có nút Huỷ** ở bất kỳ đâu trong module, không có trạng thái *Cancelled*. Hoá đơn phát hành sai được đính chính trên **cổng của nhà cung cấp hoá đơn điện tử**, ngoài hệ thống.',
        ],
      },
      {
        kind: 'shot',
        src: '/shots/crm/invoice-detail.jpg',
        where: 'Admin',
        caption: 'Một hoá đơn **Issued** và **Unpaid** cùng lúc — số pháp lý từ nhà cung cấp, *Activate by* = ngày phát hành + 12 tháng, không có nút huỷ.',
      },
      {
        kind: 'warn',
        text:
          '**Đính chính:** từ 29/09/2026 email gửi khách **chuyển sang trang PO**; hộp thoại phát hành hoá đơn không còn là trình soạn email và phát hành không gửi gì.',
      },
      {
        kind: 'table',
        heading: 'PO và Hoá đơn GTGT khác nhau chỗ nào',
        note: 'PO nói “anh đã đồng ý mua, vui lòng thanh toán”. Hoá đơn nói “đây là chứng từ cơ quan thuế công nhận cho giao dịch này”. Gửi PO cho khách mà nói đó là hoá đơn là sai lầm đắt nhất ở đây: khách không kê khai VAT được.',
        cols: ['', 'PO / Đơn hàng', 'Hoá đơn GTGT'],
        rows: [
          ['Bản chất', 'Chứng từ thương mại — cam kết + yêu cầu trả tiền', 'Chứng từ thuế — bằng chứng pháp lý một giao dịch chịu thuế'],
          ['Ràng buộc giữa', 'Mình và khách', 'Mình và **cơ quan thuế**'],
          ['Đánh số', 'Dãy số của mình — `PO-005864-08-2026`', 'Dãy pháp lý của **nhà cung cấp HĐĐT**, cấp tự động khi phát hành'],
          ['Sửa / huỷ', 'Không — PO không dùng thì **tự hết hạn cuối tháng**', '**Không trong admin** — đính chính trên cổng nhà cung cấp'],
          ['Ai sở hữu', 'Sales', '**Chỉ kế toán**'],
          ['Tác dụng', 'Deal = thắng', 'Cấp quota · khách thành Existing · bắt đầu đồng hồ “phải dùng trong”'],
        ],
      },
      {
        kind: 'table',
        heading: 'Đánh số — hai loại mã, hai luật ngược nhau',
        note: 'Mã **bản ghi** (công ty) phải **không đoán được**, vì dãy số sẽ để lộ mình có bao nhiêu khách. Mã **chứng từ** phải **liên tục và có ngày**, vì đó là thứ làm nó lưu trữ được, đọc qua điện thoại được, và — với hoá đơn — hợp pháp.',
        cols: ['Loại', 'Định dạng', 'Ví dụ', 'Liên tục?'],
        rows: [
          ['Công ty (bản ghi)', 'CO- + 6 ký tự mã hoá + 1 ký tự kiểm tra', 'CO-P9FCEPD', '**Không** — xáo trộn có chủ đích'],
          ['Báo giá', 'QUO-{6 số}-{tháng}-{năm}', 'QUO-009909-07-2026', 'Có, không đứt'],
          ['PO', 'PO-{6 số}-{tháng}-{năm}', 'PO-005864-08-2026', 'Có'],
          ['Hoá đơn GTGT', 'Dãy của nhà cung cấp HĐĐT · kèm mã nội bộ INV-…', '1C26TTD-173', 'Có — **luật bắt buộc**'],
          ['Số PO của chính khách', 'Chữ tự do, ghi đúng như khách đưa', 'PO-VP/2026/044', 'Của khách'],
        ],
      },
      {
        kind: 'example',
        heading: 'Ví dụ chạy thật — một đơn hàng, ba mốc ngày',
        scenario:
          'Công ty Vạn Phát chốt mua **10 slot Top Job**. Sales Issue PO ngày **05/01/2026**, khách chuyển tiền ngày **12/01**, kế toán phát hành hoá đơn GTGT ngày **20/01/2026**. Product Top Job khai *Must be used within* **12 tháng**.',
        cols: ['Mốc', 'Ngày', 'Quota khách có', 'Vì sao'],
        rows: [
          ['Issue PO', '05/01', '**0**', 'PO là cam kết, không cấp gì. Deal chuyển thành “thắng”, chỉ vậy thôi.'],
          ['Tiền về tài khoản', '12/01', '**0**', 'Thanh toán **không** phải sự kiện cấp quota. Khách gọi hỏi lúc này — câu trả lời là “chờ kế toán phát hành hoá đơn”.'],
          ['Hoá đơn Issued', '**20/01**', '**10 slot**', 'Mốc duy nhất cấp quota. Cấp **ngay**, không hàng đợi.'],
          ['Hạn phải dùng', '**20/01/2027**', '—', 'Ngày hoá đơn + 12 tháng. Không phải từ ngày PO (05/01), không phải ngày trả tiền (12/01).'],
          ['Đăng tin thứ nhất', '03/02', '9 slot còn', 'Tin chạy theo *Display duration* của bậc. Chín slot còn lại **đứng yên**, vẫn đếm tới 20/01/2027.'],
          ['Đăng tin thứ hai', '10/09', '8 slot còn', 'Tám tháng sau vẫn hợp lệ.'],
          ['Tới hạn còn 3 slot chưa dùng', '20/01/2027', '**0**', 'Ba slot **hết hiệu lực, không hoàn tiền**.'],
        ],
        note: 'Ba ngày dễ bị lấy nhầm làm mốc: ngày PO, ngày tiền về, ngày hoá đơn. Chỉ **ngày hoá đơn** đúng.',
      },

      /* ── pipeline ── */
      {
        kind: 'table',
        heading: 'Pipeline — sáu cột, ai được đưa thẻ vào',
        note: 'Mỗi thẻ **là một báo giá** — không có bản ghi deal riêng; bấm thẻ là mở báo giá. Bộ lọc: Mine / My team’s / All, owner, ngành, kỳ, đang chờ duyệt, sắp hết hạn.',
        cols: ['Cột', 'Ai đưa thẻ vào', 'Bằng cách'],
        rows: [
          ['**Proposal**', 'Hệ thống / Sales', 'Tạo khi lưu báo giá đầu tiên; hoặc kéo lùi về'],
          ['**Qualified · Negotiation**', 'Sales', 'Kéo — tới hoặc lùi'],
          ['**PO**', '**Chỉ hệ thống**', 'Khi *Issue PO*. Kéo vào bị từ chối, có giải thích'],
          ['**Invoice**', '**Chỉ hệ thống**', 'Khi hoá đơn chính thức Issued — đóng deal **thắng**. Thẻ đã thắng không kéo được; bán lại là một deal mới'],
          ['**Lost**', 'Sales', 'Kéo vào, hoặc *Close as lost* — **luôn kèm lý do** (đối thủ · giá · hết ngân sách kỳ này · không phản hồi · không phù hợp · nội bộ khách không duyệt). Kéo ra khỏi Lost là mở lại ở cột đó'],
        ],
      },
      {
        kind: 'list',
        heading: 'Luật của pipeline',
        items: [
          '**Mỗi báo giá là một thẻ** — một công ty có thể có nhiều thẻ đang mở cùng lúc (báo giá v1, v2, hai gói song song).',
          '**Giá trị thẻ = một option** của báo giá đang sống (option được chấp nhận, nếu chưa thì option cao nhất) — **không bao giờ cộng các option**. Tổng cột chỉ đếm deal đang mở.',
          '**Hết hạn không phải Lost.** Báo giá hết hạn cuối tháng (hoặc mọi PO của nó hết hạn) thì thẻ rời bảng, vẫn giữ chặng và không tính là thua.',
          '**Không có job nào tự đóng deal.** Đóng thua là việc của một người, kèm lý do.',
        ],
      },
      {
        kind: 'shot',
        src: '/shots/crm/pipeline.jpg',
        where: 'Admin',
        caption: 'Bảng **Pipeline** trên dev — mỗi thẻ là một báo giá.',
      },

      {
        kind: 'warn',
        text:
          '**Đính chính:** luật “mỗi công ty tối đa một deal đang mở” đã bỏ cùng bảng deal (19/08/2026). Thẻ = báo giá; số thẻ không bằng số công ty.',
      },
      /* ── shared quota ── */
      {
        kind: 'list',
        heading: 'Shared quota — một công ty tiêu quota của công ty khác',
        items: [
          'Trên hồ sơ công ty **tài trợ** (*sponsor*), mục **Shared quota**: gõ **đúng Company ID** (`CO-XXXXXXX`) của công ty sẽ tiêu quota → *Add ID*. Không tìm theo tên, có chủ đích.',
          'Công ty được thêm phải tồn tại, đang active, **không tự là sponsor**, không phải chính nó, chưa được liên kết. Một công ty có thể tiêu quota của **nhiều** sponsor.',
          'Chỉ chia sẻ **quyền tiêu số dư đã có hoá đơn** — không gì khác. Mỗi bên vẫn là một khách hàng riêng, với hoá đơn, doanh số và hạng riêng. **Đây không phải quan hệ công ty mẹ.**',
          '*Remove* chỉ chặn **lần dùng tiếp theo**: tin đã đăng chạy tới hết hạn, không thu hồi gì. Liên kết đã gỡ vẫn giữ trong lịch sử (*Removed {ngày}*).',
          'Sponsor thấy từng công ty đã dùng bao nhiêu, dòng nào, lần cuối khi nào; huy hiệu *sponsor · N companies* / *beneficiary · N sponsors* hiện trên hồ sơ.',
        ],
      },

      /* ── roles ── */
      {
        kind: 'table',
        heading: 'Ai làm được gì',
        cols: ['Vai trò', 'Làm được', 'KHÔNG làm được'],
        rows: [
          ['Sales rep', 'Xin công ty ở Free data · tạo/gửi báo giá · Issue PO · Export draft invoice · Request official invoice · ghi hoạt động · kéo thẻ 3 chặng đầu · đóng deal thua', '**Tạo công ty** · duyệt claim · gán owner · Verify · **phát hành hoá đơn** · sửa dòng / giá của bất kỳ PO nào'],
          ['Sales lead', 'Mọi thứ rep làm được, trên sổ của team · **duyệt claim bước 2** · duyệt chiết khấu dưới ngưỡng của chương trình · Archive công ty', 'Phát hành hoá đơn · duyệt claim bước 1'],
          ['Sales manager', 'Duyệt chiết khấu **từ ngưỡng trở lên**', '—'],
          ['Admin (HQ)', 'Tạo công ty · **duyệt claim bước 1** · Assign directly / đổi owner · xử lý Sign-ups · **Verify** · Archive', 'Phát hành hoá đơn (trừ khi kiêm kế toán)'],
          ['Kế toán', '**Phát hành hoá đơn** · xác nhận thanh toán', '**Tạo hoặc sửa** bất kỳ chứng từ nào trong ba loại'],
          ['Nhà tuyển dụng (Company site)', 'Đăng ký · tải ERC · sửa Company information tới khi Verified · đăng tin khi đã Verified', 'Đăng nhập trước khi được xử lý · đăng tin trước khi Verified · thấy bất cứ thứ gì của CRM'],
        ],
      },

      /* ── tests ── */
      {
        kind: 'example',
        heading: 'Kịch bản test đầu–cuối',
        scenario: 'Mười kịch bản cắt qua nhiều màn hình — mỗi cái kiểm một luật ở trên. Chạy trên dev với công ty tạo riêng để test.',
        cols: ['#', 'Kịch bản', 'Đạt khi'],
        rows: [
          ['1', 'Nhà tuyển dụng đăng ký kèm ERC → xác minh email → Admin *Create company & activate* → khách đăng nhập → Admin *Verify company* → khách đăng tin', 'Đăng nhập bị từ chối trước khi xử lý; Post job khoá trước khi Verify; cả hai mở sau đó; dòng Sign-ups ghi *Resolved*'],
          ['2', 'Cùng công ty: tạo báo giá 2 option → *Mark as sent* → *Issue PO* option 2 → *Request official invoice* → kế toán *Issue*', 'PO = option 2 tới từng đồng; *Products & billing* hiện sản phẩm; khách *Existing*; thẻ pipeline ở *Invoice*, thắng'],
          ['3', 'Rep xin một công ty Free data → Admin duyệt → Sales lead duyệt', 'Công ty ở *Assigned*, rep là owner, liên hệ #1 có, rời Free data; nhật ký của rep ghi *Approved*'],
          ['4', 'Như trên nhưng Sales lead từ chối kèm ghi chú', 'Công ty về *Not claimed* · *Rejected 1 time before*; rep đọc được ghi chú; xin lại được'],
          ['5', 'Để PO ở *Invoice requested* qua cuối tháng', 'PO *Expired*, hoá đơn *Archived*, không cấp quota, báo giá vẫn *Issued to PO*'],
          ['6', 'Công ty Verified: Admin sửa tên pháp lý → lưu', '*Waiting to verify* ở cả hai site; Post job khoá; Request official invoice khoá; Verify mở lại cả ba'],
          ['7', 'Chiết khấu vượt ngưỡng của chương trình, do Sales lead nhập', 'Chuyển tới Sales manager, lead không tự duyệt được; *Mark as sent* bị chặn tới khi duyệt'],
          ['8', 'Xác nhận thanh toán hai lần trên một hoá đơn', 'Lần hai bị chặn khi đã trả đủ; quota không đổi cả hai lần'],
          ['9', 'Archive một công ty đang có deal mở', 'Công ty rời *Assigned*, hồ sơ thành chỉ đọc; không có nút khôi phục'],
          ['10', 'Hai rep cùng xin một dòng Free data', 'Rep thứ hai không thấy nút *Ask* khi yêu cầu đầu còn mở'],
        ],
      },

      /* ── open ── */
      {
        kind: 'open',
        text:
          '**Huỷ hoá đơn / thu hồi quota.** Requirement mô tả huỷ hoá đơn kèm thu hồi quota; **build đã bỏ hẳn chức năng huỷ** — đính chính làm trên cổng nhà cung cấp. Cần khách xác nhận “sửa trên cổng” là quy trình chính thức.',
      },
      {
        kind: 'open',
        text:
          '**Từ chối giấy tờ sai.** Từ khi trang Company documents bị gỡ (06/10), không còn cách nào từ chối một file khách nộp sai trong console. Thêm *Reject* vào thẻ giấy tờ trên hồ sơ, hay xử lý ngoài hệ thống?',
      },
      {
        kind: 'open',
        text:
          '**Sales owner khi xử lý sign-up.** Move không hỏi owner (công ty đích đã có). *Create company & activate* dùng ô owner của form — để trống thì công ty mới vào **Free data**. Khách có chấp nhận điều này cho công ty tự đăng ký không?',
      },
      {
        kind: 'open',
        text:
          '**Ghi chú khi từ chối claim** — build cho ghi chú tuỳ chọn; requirement nói không thu lý do. Giữ ghi chú không?',
      },
      {
        kind: 'open',
        text:
          '**Quota hết hạn mà chưa dùng.** Hết im lặng · nhắc khách ở mốc 60 / 30 / 7 ngày · hay để sales gia hạn. Để quota đã trả tiền hết hạn mà không báo trước là phương án dễ sinh tranh chấp nhất.',
      },
    ],
  },
}
