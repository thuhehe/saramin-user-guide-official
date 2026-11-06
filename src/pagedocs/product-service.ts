import type { PageDoc, ModuleDoc } from '../docs'

/*
 * Product settings + Service delivery — page-level detail.
 *
 * Each entry REPLACES PAGE_DOCS[key] in docs.ts (spread over it), so every entry
 * starts from the text that was there and adds to it. Shared logic stays on the
 * MODULE page 'Product settings' (client Notion §1–§6) and is pointed at, not
 * repeated.
 *
 * Checked against origin/dev on 08/10/2026:
 *   saramin-vn-admin 45954108 · svn-be ee1db5ea9 · svn-web d8a43a11
 */

export const PRODUCT_SERVICE_PAGE_DOCS: Record<string, PageDoc> = {
  products: {
    logic: [
      'Đây là **catalogue**: mọi món bán được, giá của nó, và **fulfilment** — thứ khách thực sự nhận khi hoá đơn được phát hành. Màn hình này là **định nghĩa**; nó không bao giờ chạm vào số dư của một khách hàng nào.',
      'Field **Type** quyết định hoá đơn giao cái gì, và quyết định luôn những ô fulfilment nào hiện ra bên dưới. Bốn Type: *Job posting · CV search · Placement booking · Manual service*.',
      'Với loại **Job posting**, product **chính là** một bậc tin — không phải hai thứ.',
      'Chỉ product **Active** mới đưa lên báo giá được. **Inactive** là ngừng bán: product biến khỏi báo giá, nhưng mọi đơn cũ trỏ vào nó vẫn nguyên.',
      'Logic chung của cả nhóm (bốn Type, ba đồng hồ, cờ Trial / Free, thứ tự dựng một bậc mới) nằm ở **Logic chung — Product settings** §2. Trang này thêm phần **màn hình**: danh sách, thao tác trên dòng, và các thông báo lỗi.',
      'Quyền: `product:read` để xem (cũng là quyền vào *Posting ladder*), `product:create` / `update` / `delete` cho từng thao tác. Seed mặc định: **hq_admin** và **vn_sales** đủ bốn quyền (chỉnh được ở *Organisation → Roles*). Nút *Activate for the customer* / *Withdraw this package* trên *Quota usage* cũng đòi `product:update`.',
    ],
    how: [
      'Danh sách: tìm theo **mã hoặc tên**; lọc **Type**, **Role**, **Status**. Sắp xếp theo tên, giá, ngày tạo, ngày sửa. Cả catalogue tải một lần rồi lọc trên trình duyệt — không có phân trang phía server.',
      '**New product** → chọn **Type** trong bốn thẻ — đây là bước quyết định mọi thứ phía sau.',
      'Mục **Identity**: **Name** (một ô; *Product code* tự sinh từ Type + Name, chỉ đọc), **Selling unit** (in thành cột *Đơn vị tính* trên báo giá, PO, hoá đơn), **Role** — *Main* hay *Add-on*.',
      'Cũng trong Identity: tick **Trial product** nếu chỉ bán trong báo giá dùng thử, đặt **Status**, viết **Product description** (VI / EN).',
      'Mục **Fulfilment · <Type>**: điền đủ các ô Type đó yêu cầu — xem bảng bên dưới.',
      'Mục **Pricing**: nhập **Price (đ)**, hoặc bật **Free product** nếu là món HQ đăng hộ không cần hoá đơn.',
      'Lưu. Hệ thống **từ chối Active khi fulfilment còn thiếu** và nói đúng ô còn trống; cột *Fulfilment* trong danh sách ghi *Complete / Incomplete*.',
    ],
    watch: [
      'Chọn sai **Type** thì giao sai thứ cho khách, **âm thầm**, và chỉ lộ ra lúc xuất hoá đơn. Đây là field có tầm ảnh hưởng lớn nhất trên màn hình — kiểm lại trước khi lưu.',
      '**Product code không sửa được — bao giờ.** Nó sinh từ Type + Name lúc tạo (tiền tố `JOB` · `SRC` · `PLB` · `MSV`, rồi tên bỏ dấu viết hoa) và không đổi, vì nó được in lên báo giá, PO và hoá đơn. Product cũ giữ mã viết tay cũ (`JOB-TOPJOB`).',
      '**Product đã lên hoá đơn thì bị khoá**: form hiện băng *“This product has already been invoiced”*, và chỉ còn sửa được tên, mô tả, Selling unit và Status. Muốn bán khác đi → tạo product mới.',
      '**Delete** chỉ chạy được với product **chưa từng lên hoá đơn và không nằm trong package nào**. Đã bán → hệ thống bảo chuyển Inactive; nằm trong package → nó nêu tên package, gỡ ra trước rồi mới xoá.',
      '**Duplicate** tạo một bản **Draft** — không bao giờ một dòng Active thứ hai. Kích hoạt nó khi đã sửa xong.',
      '**Free product là một cờ được lưu, không suy ra từ giá 0.** Một dòng khuyến mãi có thể 0 ₫ mà vẫn phải đi ra từ một hoá đơn.',
    ],
    blocks: [
      {
        kind: 'table',
        heading: 'Danh sách — cột nào nói gì',
        cols: ['Cột', 'Nghĩa'],
        rows: [
          ['**Code**', 'Mã SKU tự sinh (`JOB` · `SRC` · `PLB` · `MSV` + tên bỏ dấu). Không bao giờ đổi'],
          ['**Name**', 'Tên catalogue — in lên báo giá, PO, hoá đơn'],
          ['**Type**', '*Job posting · CV search · Placement booking · Manual service*'],
          ['**Role**', '*Main* / *Add-on*'],
          ['**Selling price**', 'Giá bán; product *Free* ghi **Free**'],
          ['**Credits**', 'Chỉ CV search: số CV một lần mua mở được'],
          ['**Fulfilment**', 'Tóm tắt khách nhận gì, hoặc *Incomplete* khi còn thiếu ô bắt buộc, hoặc *Not required*'],
          ['**Status**', '*Active · Draft · Inactive* — bảng trạng thái ở **Logic chung — Product settings**'],
          ['**Created / Updated**', 'Ngày tạo, ngày sửa gần nhất'],
        ],
      },
      {
        kind: 'table',
        heading: 'Thông báo lỗi hay gặp trên form và trên dòng',
        cols: ['Bạn thấy', 'Vì sao', 'Làm gì'],
        rows: [
          ['*Pick a placement before activating this product*', 'Placement booking chưa chọn vùng mà Status = Active', 'Chọn vùng, hoặc lưu Draft'],
          ['*Set a duration / quantity / unit before activating this product*', 'Thiếu ô fulfilment bắt buộc của Type đó', 'Điền ô được nêu tên'],
          ['*Choose where this tier sits on the ladder.*', 'Job posting có *Display duration* mà chưa đặt *Ladder position*', '*Choose position* → kéo → *Use this position*'],
          ['*Pick a placement or remove this row* · *Pick a product or remove this row*', 'Một dòng *Placement slots* / *Includes* còn trống', 'Chọn hoặc xoá dòng đó'],
          ['*Credit amount cannot be negative — enter 1 or more.*', 'CV search nhập số âm', 'Nhập ≥ 1'],
          ['*Pick how long the package lasts*', 'CV search chưa chọn *Validity*', 'Chọn 30 hoặc 90 ngày'],
          ['*This product cannot be deleted* — *already been invoiced*', 'Khách đang giữ quyền lợi cấp từ nó', 'Chuyển **Inactive**'],
          ['*This product cannot be deleted* — *part of n package(s): …*', 'Nằm trong package được nêu tên', 'Gỡ khỏi package trước, rồi xoá'],
          ['Hộp *Delete this product?* — *This cannot be undone.*', 'Product chưa từng bán, không nằm trong package', 'Xoá vĩnh viễn — không có thùng rác'],
        ],
      },
      {
        kind: 'table',
        heading: 'Type — field có tầm với xa nhất',
        note: 'Type quyết định **hoá đơn giao cái gì** và **ai tiêu nó**. Dòng mô tả dưới mỗi thẻ trên form nói đúng điều này.',
        cols: ['Type', 'Mô tả trên thẻ', 'Khách nhận gì lúc hoá đơn Issued', 'Tiêu bằng cách'],
        rows: [
          ['**Job posting**', '*A posting tier — publishing a job spends one slot*', 'N lượt đăng tin ở bậc này', 'Publish một tin ở bậc này'],
          ['**CV search**', '*Unlock quota + validity, spent per CV opened*', 'N credit mở CV, chạy 30 / 90 ngày từ lúc kích hoạt', 'Mở một CV'],
          ['**Placement booking**', '*A time window on a slot, capacity-capped*', 'Một khung ngày trên một vùng Display', 'Đặt một banner / popup ở Boosting'],
          ['**Manual service**', '*Ops fulfils it — creates a task, not an entitlement*', 'N lượt dịch vụ để ops giao tay — theo dõi ở *Service delivery → Manual services*', 'Ops ghi nhận từng lần giao (*Record delivery*)'],
        ],
      },
      {
        kind: 'table',
        heading: 'Fulfilment — Job posting: khối biến một product THÀNH một bậc tin',
        cols: ['Ô trên form', 'Nghĩa'],
        rows: [
          ['**Must be used within — counted from the invoice date**', '6 · 12 · 24 · 36 tháng, mặc định 12. Quota cấp ngay lúc hoá đơn Issued; phần chưa dùng khi cửa sổ đóng thì **hết hạn**.'],
          ['**Display duration (days)**', 'Một tin đã đăng sống bao lâu. Để trống = product không có cửa sổ hiển thị — và khi đó nó **không lên Posting ladder**.'],
          ['**Auto-refresh**', 'Bao lâu một lần tin được đẩy lại lên đầu các danh sách nó xuất hiện: *No auto-refresh · Every 15 days · Every 10 days · Every 5 days · Daily for 7 days, then every 5*. Chỉ có với product *Main*.'],
          ['**Ladder position**', '**Bắt buộc.** Bấm *Choose position* → kéo product tới chỗ nó nên đứng trên thang. Cao hơn = lên trước trong danh sách *Gợi ý*.'],
          ['**Placement slots**', '**Tin bậc này xuất hiện ở vùng nào**, và trong bao lâu của cửa sổ hiển thị — *Whole display window* hay *First 5 / 7 / 10 / 15 / 30 days*. Mỗi vùng một dòng; *Add placement* để thêm. **Đây chính là định nghĩa của bậc.**'],
          ['**Includes**', 'Các product được cấp **kèm**. Khách thấy **một dòng** — đây **không phải** package. Chỉ chọn được product *Add-on*, và add-on đó không được tự có Includes của riêng nó.'],
        ],
      },
      {
        kind: 'warn',
        text:
          '**Perk của thẻ tin không còn khai trên product.** Tag, ảnh hover, ảnh banner, mô tả hover giờ **đi theo vùng** (*Placements*): bậc bán một perk khi một vùng trong *Placement slots* của nó có perk đó. Phủ một vùng có ảnh thì **mọi tin ở bậc này phải có ảnh mới Publish được** — form ghi rõ điều này ngay dưới *Placement slots*.',
      },
      {
        kind: 'table',
        heading: 'Fulfilment — ba Type còn lại',
        cols: ['Type', 'Các ô', 'Điều đáng biết'],
        rows: [
          ['**CV search**', 'Credit amount · Validity (30 / 90 days) · Activation window', '*Credit amount* = một lần mua mở được bao nhiêu CV (không nhận số âm). *Validity* chạy từ lúc **kích hoạt**. *Activation window* là hạn chót để kích hoạt — để trống = 12 tháng (3 với trial). Dòng *≈ X ₫ per CV* là **tính ra** từ giá ÷ số credit, không gõ.'],
          ['**Placement booking**', 'Must be used within · Placement · Duration (days) · Slots consumed', 'Chỉ chào các vùng **Display** (banner, popup). *Slots consumed* = một lần bán chiếm bao nhiêu slot của vùng; để trống = 1.'],
          ['**Manual service**', 'Must be used within · Quantity · Unit', '*Unit* là cách đếm một lần giao: *bài · email · lần*. Hoá đơn cấp **N lượt**, ops ghi nhận từng lượt ở *Manual services*.'],
        ],
      },
      {
        kind: 'table',
        heading: 'Role và Add-on',
        cols: ['Role', 'Nghĩa'],
        rows: [
          ['**Main**', 'Bán độc lập — báo giá được, đặt hàng được, không bao giờ nằm trong product khác. **Mọi bậc tin đều là Main.**'],
          ['**Add-on**', 'Gắn lên trên một tin chính. Vẫn bán như mọi product: picker báo giá xếp add-on vào nhóm riêng, giá riêng, dòng riêng. Trên form tạo tin nó **bị khoá** cho tới khi đã chọn một **hoá đơn** và một *Main product*.'],
          ['**Add-on type**', 'Hiện ngay dưới Role khi chọn Add-on. *Label* — một badge trên tin, chọn *Hot job* hoặc *Super star*. *Display placement* — đưa tin vào vị trí cao cấp — **chưa dùng được** (form ghi *“Not available yet.”*).'],
        ],
      },
      {
        kind: 'table',
        heading: 'Hai cờ hay bị hiểu nhầm',
        cols: ['Cờ', 'Bật thì sao', 'Cái bẫy'],
        rows: [
          ['**Trial product**', 'Product **chỉ** xuất hiện trong báo giá có *Discount programme = Trial package*. Tắt (mặc định): xuất hiện ở **mọi** báo giá **trừ** báo giá trial. Product trial **vẫn có giá** được.', 'Hai tập **không bao giờ trộn**: báo giá trial chỉ chào product trial, không chào product thường và **không chào package**. Đổi một báo giá vào hoặc ra khỏi *Trial package* sẽ **xoá product trên mọi dòng**.'],
          ['**Free product**', 'Giá về 0 và **không sửa được**. HQ đăng hộ cho bất kỳ công ty nào, **không cần hoá đơn, không tiêu quota**. Đây là thứ đổ vào lựa chọn *— none (Free job) —* trên form tạo tin.', 'Nhà tuyển dụng **không bao giờ** thấy nó trên site công ty — họ chỉ đăng được từ thứ đã mua.'],
        ],
      },
      {
        kind: 'table',
        heading: 'Nơi khác quyết định product này có chạy hay không',
        cols: ['Ở đâu', 'Vì sao liên quan'],
        rows: [
          ['**CRM → Quotations**', 'Nơi product được **bán**. Chương trình giảm giá chọn trên chính báo giá: *New / returning customer offer · Quantity discount · Trial package · Special offer*.'],
          ['**CRM → Invoices**', '**Hoá đơn Issued là thời điểm quota được cấp.** Không gì trên trang này tự cấp cái gì.'],
          ['**Service delivery → Quota usage**', 'Nơi kiểm một product đã về tới khách chưa: mỗi dòng là một product do một hoá đơn cấp, kèm *Used / total*, *Left*, *Valid until*.'],
          ['**Recruitment → Jobs → New job**', 'Nơi product bị **tiêu**: chọn công ty → chọn **Invoice** (*“Declared invoices with job-posting quota left”*) → danh sách *Product* chỉ còn các bậc của hoá đơn đó còn lượt. Không chọn hoá đơn thì chỉ còn product **Free**.'],
          ['**Site jobseeker**', 'Bước kiểm cuối: một tin đã đăng xuất hiện **đúng** các vùng mà *Placement slots* của bậc nó liệt kê, và tắt *Exposure* là nó biến khỏi mọi vùng.'],
        ],
      },
      {
        kind: 'example',
        heading: 'Test nhanh Products',
        scenario: 'Sáu phép thử, mỗi cái kiểm một quy tắc ở trên. Làm trên dev, với product tạo riêng để test.',
        cols: ['Làm', 'Đạt khi'],
        rows: [
          ['Tạo product *Job posting*, bỏ trống *Placement slots*, để Status Active → Lưu', '**Bị từ chối**, báo đúng ô còn thiếu'],
          ['Type *Job posting*, Name *Tin Top Job (Tặng)*', '*Product code* hiện `JOB - TIN TOP JOB (TANG)` — tiền tố theo Type, bỏ dấu, viết hoa, giữ `( ) / -`'],
          ['Mở một product **đã lên hoá đơn** → sửa giá', 'Ô giá **bị khoá**, có băng *“This product has already been invoiced”*; tên vẫn sửa được'],
          ['**Delete** một product đang nằm trong package', '**Bị chặn**, thông báo **nêu tên** package'],
          ['**Duplicate** một product Active', 'Bản mới là **Draft**, không lên báo giá cho tới khi kích hoạt'],
          ['Tick *Trial product* → mở một báo giá thường', 'Product **không có** trong picker; đổi báo giá sang *Trial package* thì **có**'],
        ],
      },
      {
        kind: 'p',
        text: '**Màn hình thật** — chụp trên dev ngày 08/10/2026.',
      },
      {
        kind: 'shot',
        src: '/shots/ps/products-list.jpg',
        where: 'Admin',
        caption: 'Catalogue. Cột **Code** tự sinh theo Type (`JOB` · `SRC` · `PLB` · `MSV`); cột **Fulfilment** tóm tắt khách nhận gì — *15 days*, *100 unlocks · 90 days · ≈60.000 ₫/CV*, *14 days · rotate 300s*. Đây là định nghĩa, không phải số dư của ai.',
      },
      {
        kind: 'shot',
        src: '/shots/ps/product-new-type.jpg',
        where: 'Admin',
        caption: '**New product**. **Type** là ô đầu tiên vì nó quyết định mọi ô còn lại; mỗi thẻ ghi luôn nó cấp gì. Ô *Product code* màu xám: tự sinh từ Type + Name, không gõ.',
      },
      {
        kind: 'shot',
        src: '/shots/ps/product-new-identity.jpg',
        where: 'Admin',
        caption: 'Tiếp theo: **Role** (*Main* / *Add-on*), **Trial product**, **Status**, mô tả VI / EN — rồi tới khối **Fulfilment**, mở đầu bằng *Must be used within*.',
      },
      {
        kind: 'shot',
        src: '/shots/ps/product-new-fulfil-1.jpg',
        where: 'Admin',
        caption: 'Fulfilment của **Job posting**: *Display duration*, *Auto-refresh*, **Ladder position** (bắt buộc — chưa đặt thì ghi *Not placed yet*), **Placement slots**, *Includes*, rồi **Pricing**.',
      },
      {
        kind: 'shot',
        src: '/shots/ps/product-new-cv.jpg',
        where: 'Admin',
        caption: 'Đổi Type sang **CV search** thì khối Fulfilment đổi hẳn: *Credit amount*, *Validity* 30 / 90 ngày, *Activation window* (để trống = theo hợp đồng).',
      },
      {
        kind: 'shot',
        src: '/shots/ps/product-edit-top.jpg',
        where: 'Admin',
        caption: 'Mở một product **đã lên hoá đơn**: băng vàng *“This product has already been invoiced”*, và mọi thứ nó bán bị khoá. *Product code* ghi rõ là không bao giờ đổi.',
      },
      {
        kind: 'shot',
        src: '/shots/ps/product-edit-slots.jpg',
        where: 'Admin',
        caption: 'Cùng product đó, phần dưới: **Ladder position** đọc là “nằm giữa bậc X và bậc Y · display order 120”; **Placement slots** có vùng *Trang chủ — Job card basic plus* phủ *Whole display window*; giá bị khoá.',
        note: 'Đây là **chiều sở hữu thật**: product khai nó nuôi vùng nào, chứ không phải vùng khai nó nhận bậc nào.',
      },
      {
        kind: 'shot',
        src: '/shots/ps/product-ladder-popup.jpg',
        where: 'Admin',
        caption: '**Change position** mở thang bậc: kéo product tới chỗ của nó rồi **Use this position**. Số bên phải là *display order* — cao hơn thì lên trước trong danh sách *Gợi ý*.',
      },
    ],
  },

  packages: {
    logic: [
      '**Nhiều product bán chung một dòng, một giá.** Package được định giá **như một khối**, không phải bằng tổng các phần.',
      'Trên báo giá nó là **một dòng**; tới lúc hoá đơn Issued **từng thành phần được cấp riêng**, nên *Quota usage* của khách đọc ra là các product lẻ.',
      'Dùng package khi khách **nên thấy các phần được gộp giá dưới một cái tên**. Khi một product chỉ đơn giản là **kèm thêm** vài add-on trong cùng một dòng, dùng **Includes** trên chính product đó thay vì package.',
      'Logic chung (Premium package, No limit, khi nào dùng Includes) ở **Logic chung — Product settings** §4. Trang này thêm phần màn hình: danh sách, trạng thái, thao tác.',
      'Trên *Quota usage*, mỗi product của package là **một dòng riêng**, và *Invoice value* là giá trị **cả hoá đơn** lặp lại trên từng dòng — giá package **không bao giờ** bị chia cho các thành phần.',
      'Quyền: `bundle:read` để xem; `bundle:create` để tạo; `bundle:update` để sửa **và** Activate / Deactivate (trên màn Roles, quyền duyệt / từ chối package gộp vào cột *Update*). Seed mặc định: **hq_admin** và **vn_sales**. Màn hình **không có nút xoá** package.',
    ],
    how: [
      'Danh sách: tìm theo **tên**, lọc theo **trạng thái** (*Active / Inactive*). Cột *Name · Display name · Components* (từng product kèm *×n* hoặc *Unlimited*, dài thì *+n more*) *· Price* (ghi *Custom price* khi giá khác tổng các phần) *· Status*. Thao tác ở cuối dòng: *Edit*, *Activate* hoặc *Deactivate*.',
      '**New package** → mục **Package**: **Name** (nội bộ — cách console liệt kê và tìm), **Display name** (khách thấy trên báo giá và site; để trống thì lấy Name), **Notes**.',
      'Mục **Components** → **Add component** — ít nhất **hai** product, mỗi dòng một **Qty**, hoặc bật **No limit**.',
      'Mục **Pricing** → **Package price (VND)** điền sẵn bằng tổng thành phần; sửa về giá bán thật. *Sum of parts* và *Implied discount / Implied markup* cập nhật bên dưới.',
      'Tick **Premium package** nếu cần (xem cảnh báo bên dưới) → lưu. Package mới tạo là **Active** ngay.',
      'Ngừng bán: **Deactivate** ở cuối dòng. Bán lại: **Activate** — thất bại nếu có thành phần nào đang Inactive.',
    ],
    watch: [
      'Có **cảnh báo** khi giá package **cao hơn** tổng các phần — không chặn, chỉ nhắc.',
      '**Tạo hoặc kích hoạt package thất bại nếu một product thành phần đang Inactive.** Kích hoạt product đó trước.',
      'Giá một thành phần đổi sau khi dựng package: form báo *“A product’s price has changed since this package was built”* — lưu lại là **mọi dòng cập nhật theo giá hôm nay**. *Sum of parts* là con số **chụp lại lúc lưu**.',
      '**Deactivate không đụng tới đơn cũ** — chỉ là không báo giá được nữa.',
      '**Premium package đi theo PRODUCT, không theo người mua** — xem cảnh báo bên dưới, đây là điểm phản trực giác nhất của màn hình.',
      'Mỗi dòng thành phần **chụp lại giá product lúc lưu**. Đổi giá product sau đó **không** tự đổi package cho tới khi có người mở và lưu lại package.',
    ],
    blocks: [
      {
        kind: 'table',
        heading: 'Trạng thái — màn hình chỉ có hai, server lưu bốn',
        note: 'svn-be còn giữ bốn trạng thái cũ (có bước duyệt). Console **gộp lại thành hai**, đúng như spec: *Active* = bán được, mọi thứ khác = không bán được. Console chỉ ghi `APPROVED` hoặc `ARCHIVED`.',
        cols: ['Trên màn hình', 'Server lưu', 'Nghĩa', 'Vào bằng cách', 'Làm tiếp được gì'],
        rows: [
          ['**Active**', '`APPROVED`', 'Báo giá và đặt hàng được', 'Tạo mới · **Activate** (thất bại nếu có thành phần Inactive, nêu tên nó)', '*Edit* · *Deactivate*'],
          ['**Inactive**', '`ARCHIVED` (hoặc `DRAFT` / `PENDING_APPROVAL` cũ)', 'Không báo giá được; đơn cũ **không bị ảnh hưởng**', '**Deactivate** — hộp xác nhận *“It can no longer be quoted or bought. Past orders are unaffected…”*', '*Edit* · *Activate*'],
        ],
      },
      {
        kind: 'warn',
        text:
          '**Premium package — hai điều phải test kỹ, vì cả hai đều phản trực giác.** (1) **Nó đi theo các PRODUCT, không theo người mua.** Nếu package chứa một bậc tin bán rộng rãi, thì **mọi** tin ở bậc đó lên khu Premium của trang tìm kiếm — kể cả tin mua lẻ, ngoài package (form ghi: *“including ones bought separately”*). (2) **Nó không do placement điều khiển.** Tin vào được khu Premium là **vì cái tick này**, không phải vì bất kỳ cài đặt *Placement slots* nào — đi tìm khu Premium trên trang Placements sẽ không thấy gì.',
      },
      {
        kind: 'table',
        heading: 'No limit — số lượng không giới hạn',
        note: 'Một công tắc **No limit** trên dòng thành phần, **thay cho** ô Qty.',
        cols: ['Quy tắc', 'Chi tiết'],
        rows: [
          ['Bật được khi product **có thời hạn hiệu lực**', '**Không giới hạn về số lượng, có giới hạn về thời gian** — nếu không, một lần bán là số dư vô hạn mãi mãi. Áp dụng cho **cả bốn Type** (*“Every service type supports it.”*).'],
          ['**CV search**: server có thể vẫn từ chối', 'Tuỳ một cấu hình phía máy chủ mà màn hình không đọc được. Công tắc vẫn bật được; nếu server không cho, **lưu sẽ báo lỗi**.'],
          ['**Placement booking**: không giới hạn số **lần đặt**', 'Mỗi lần đặt vẫn phải vừa sức chứa của vùng khi đăng banner.'],
          ['*Sum of parts* **bỏ dòng unlimited ra ngoài**', 'Không có giá nào cho “không giới hạn”. Package bán theo giá bạn đặt; cảnh báo “giá cao hơn tổng các phần” được thay bằng một ghi chú nói rõ điều đó.'],
          ['Hiển thị', 'Cột *Components* trong danh sách đọc là **Unlimited**; *Quota usage* của khách cũng ghi **Unlimited**.'],
        ],
      },
      {
        kind: 'example',
        heading: 'Test nhanh package',
        scenario: 'Năm phép thử cắt qua nhiều màn hình — chỗ bug hay nấp.',
        cols: ['Làm', 'Đạt khi'],
        rows: [
          ['Dựng package gồm 3 product → bán → hoá đơn Issued', 'Báo giá hiện **1 dòng**; *Quota usage* của khách hiện **3 dòng product**'],
          ['Tick *Premium package* trên package chứa bậc X', 'Một tin ở bậc X **mua ngoài package** cũng xuất hiện ở khu Premium'],
          ['Bật *No limit* trên một dòng Job posting', 'Dòng ghi **Unlimited**, không tính vào *Sum of parts*'],
          ['Chuyển một product thành phần sang Inactive → **Activate** package', '**Thất bại**, nêu đúng product đó'],
          ['Tạo package chỉ có **1** component', 'Không lưu được: *“A package must have at least 2 components.”*'],
        ],
      },
      {
        kind: 'p',
        text: '**Màn hình thật** — chụp trên dev ngày 08/10/2026.',
      },
      {
        kind: 'shot',
        src: '/shots/ps/packages-list.jpg',
        where: 'Admin',
        caption: 'Danh sách package. Cột **Components** liệt kê từng product và số lượng (*×1*, *×5*, *Unlimited*); cột **Price** ghi *Custom price* khi giá khác tổng các phần.',
      },
      {
        kind: 'shot',
        src: '/shots/ps/package-new.jpg',
        where: 'Admin',
        caption: '**New package**: *Name* / *Display name*, cờ *Premium package*, bảng **Components** (cần ít nhất 2), rồi **Package price** và *Sum of parts* để đối chiếu.',
      },
      {
        kind: 'shot',
        src: '/shots/ps/package-edit-unlimited.jpg',
        where: 'Admin',
        caption: 'Một package có dòng **No limit**: *Qty* đổi thành *Unlimited*, *Line total* là **—**, và dòng đó không tính vào *Sum of parts* — form ghi rõ điều này dưới giá.',
      },
    ],
  },

  'product-ladder': {
    logic: [
      'Thang bậc tin đăng: **bậc nào đứng trên bậc nào**. Thứ tự đã lưu **chính là sắp xếp “Gợi ý” (Recommended)** trên trang tìm việc: khi tin ở các bậc khác nhau rơi vào cùng một danh sách, tin có bậc **cao hơn trên thang** hiện trước.',
      'Có **hai chỗ** đặt vị trí, và chúng ghi số khác nhau. Trên **form product** (ô *Ladder position*), hệ thống tự tính **một số nằm giữa hai bậc kề**, nên **không bậc nào khác bị xê dịch**. Trên **màn Posting ladder**, một lần kéo **chia lại chính những số display order đang có** theo thứ tự mới — tập số giữ nguyên, nhưng các bậc nằm giữa điểm đi và điểm đến **đổi số** (thứ tự tương đối của chúng thì không đổi).',
      'Số **lớn hơn đứng trên**. *Respace the ladder* đánh lại cả thang theo bước 10: bậc thấp nhất 10, bậc kế 20…, bậc cao nhất lớn nhất.',
      'Thang **chỉ** đổi thứ tự *Gợi ý*. Nó không đổi giá, quota hay perk của bậc nào, và không còn quyết định việc nâng bậc một tin.',
      'Quyền: vào trang chỉ cần `product:read`; **kéo và lưu cần `product:update`** — không có quyền đó thì thang chỉ để xem. Không có dòng quyền riêng cho trang này trên màn Roles.',
    ],
    how: [
      'Mở *Posting ladder* → kéo một bậc tới vị trí mong muốn (hoặc focus vào tay cầm rồi bấm **↑ / ↓**) → xác nhận *“Save this ladder order?”* (hộp nhắc: *“This changes only the "Recommended" ordering on job search.”*).',
      'Cũng đặt được ngay trên form product: ô **Ladder position** → *Choose position* → kéo *This product* tới chỗ của nó → *Use this position*. Ô đọc lại thành một câu: *Top of the ladder, above …* · *Between … and …* · *Bottom of the ladder, below …* · *The only tier on the ladder*, kèm số display order.',
      'Hai bậc trùng số: màn hình hiện băng *“Two rungs share display order …”* và **khoá kéo thả** — bấm **Respace the ladder** (xác nhận *“Respace the whole ladder?”*) trước.',
    ],
    watch: [
      'Server chỉ nhận **cả thang** đúng như lúc màn hình tải. Ai đó thêm / tắt một bậc trong lúc bạn đang kéo → lưu bị từ chối (*“The ladder changed while you were editing it…”*), màn hình tự tải lại — **kéo lại từ đầu**.',
      '**Ladder position là ô bắt buộc** khi tạo một bậc tin — không còn chuyện lưu xong rồi tự rơi xuống đáy.',
      '“Đáy thang” nghĩa là **nằm giữa bậc thấp nhất và 0** — không bao giờ bằng 0 hay âm.',
      'Hết số nguyên trống giữa hai bậc thì form báo *“No free number between … Respace the ladder first.”* — lúc đó mới cần giãn lại cả thang.',
    ],
    blocks: [
      {
        kind: 'list',
        heading: 'Product nào có mặt trên thang',
        items: [
          'Một product là **một bậc** khi nó **loại Job posting**, **Active**, và **có Display duration**. Mọi thứ khác **không phải bậc tin** và không lên thang.',
          'Danh sách **ngắn có chủ đích** — không bộ lọc, không phân trang.',
          'Cột: *Display order · Code · Name · Selling price · Card perks*. Cột **Card perks** (Card tag · Hover photo · Banner photo · Hover description) **chỉ để đọc** — perk đến từ các vùng trong *Placement slots* của bậc, không sửa ở đây.',
          'Chuyển một bậc sang **Inactive** thì nó **rời thang**. Kích hoạt lại thì nó **quay về đúng Display order cũ**.',
        ],
      },
      {
        kind: 'p',
        text:
          'Thứ tự này áp dụng cho **mọi danh sách trộn nhiều bậc trong một vùng**: Job search, Jobs by location, Jobs by category, Jobs by industry — và thứ tự giữa các bậc trong các băng Mega menu.',
      },
      {
        kind: 'warn',
        text:
          '**Đã sửa một câu cũ của trang này.** Bản trước ghi “kéo thả — hệ thống tự tính một số nằm giữa hai bậc kề, nên không bậc nào khác bị xê dịch”. Điều đó **chỉ đúng với ô *Ladder position* trên form product**. Trên màn *Posting ladder*, svn-be (`ProductService.reorder`, chế độ `PERMUTE`) **chia lại các số đang có** theo thứ tự mới, nên các bậc nằm giữa đổi số. Hệ quả thực tế: đừng so số display order trước và sau một lần kéo để đoán “ai đã bị đụng” — hãy so **thứ tự**.',
      },
      {
        kind: 'warn',
        text:
          '**Respace the ladder** đánh số lại **toàn bộ** các bậc thành 10, 20, 30… — **cùng thứ tự, khoảng cách mới** — để chèn được một bậc mới vào giữa hai bậc bất kỳ. Nếu hai bậc trùng Display order, màn hình **nói rõ và từ chối lưu** cho tới khi bạn respace.',
      },
      {
        kind: 'table',
        heading: 'Kiểm bằng cách',
        cols: ['Làm', 'Đạt khi'],
        rows: [
          ['Kéo bậc B lên trên bậc A → Save', 'Trên Job search, sắp xếp *Gợi ý*: tin của **B nằm trên** tin của A. **Giá và perk của product không đổi**'],
          ['Mở hai tab, sắp lại ở cả hai, lưu cả hai', 'Lần lưu **thứ hai bị từ chối** với *“The ladder changed while you were editing it”*, và màn hình **tải lại**'],
          ['Tạo một bậc mới, bỏ trống *Ladder position*', 'Form **không cho lưu**: *“Choose where this tier sits on the ladder.”*'],
          ['Kéo Distinction lên trên Top Job', 'Trong cùng một ngành nghề, tin Distinction giờ **nằm trên** Top Job trong băng *Việc làm xu hướng*'],
        ],
      },
      {
        kind: 'p',
        text: '**Màn hình thật** — chụp trên dev ngày 08/10/2026.',
      },
      {
        kind: 'shot',
        src: '/shots/ps/ladder.jpg',
        where: 'Admin',
        caption: '*Posting ladder* trên dev: kéo tay cầm ☰ bên trái để đổi thứ tự. Cột **Card perks** chỉ để đọc — perk đến từ các vùng trong *Placement slots* của bậc.',
      },
    ],
  },

  placements: {
    logic: [
      'Một dòng = **một vùng hiển thị trên một trang**. Đây là **cấu hình thuần** — không đặt chỗ, không bán gì ở đây.',
      'Chỉ dòng có **Format = Display** mới nhận được banner hoặc popup.',
      '**Page, Key và Format là cố định.** Sửa được: tên, kích thước ảnh, **Number of slides** (= sức chứa), **Rotation period**, và ảnh tham chiếu. **Không có Create, Delete hay Status** — mọi vùng đều đang bật.',
      '**Sức chứa = số quảng cáo được phép chồng nhau trong cùng một ngày** ở vùng đó — và nó **được hệ thống chặn thật** khi đăng.',
      '**Vòng xoay = một lượt quảng cáo kéo dài bao lâu.** Nó quyết định **ai lên trước**, không quyết định ai được chạy.',
      'Logic chung của các ô (Items shown, Rotation period, Creative size, Number of slides) ở **Logic chung — Product settings** §1. Trang này thêm bảng vùng thật đang bật, sức chứa và vòng xoay khi bán banner, và các băng Mega menu.',
      'Quyền: `placement:read` để xem, `placement:update` để sửa (bút chì). Seed mặc định: **chỉ hq_admin**. Từ SRM-818 (svn-be `ffc113398`) **không có xoá** cả ở phía server, và **mọi vùng ở trạng thái Active** — không có công tắc nào để tắt một vùng.',
    ],
    how: [
      'Danh sách: cột *Page · Name · Key · Format · Reference image · Creative size · Number of slides · Items shown · Rotation (s)*; lọc theo **Page** và **Format**, có ô tìm kiếm. Mỗi dòng chỉ có một thao tác: bút chì sửa.',
      'Mở một dòng **Display** → bấm sửa → chỉnh kích thước, sức chứa, vòng xoay, ảnh tham chiếu.',
      'Muốn nhiều khách chia nhau một vùng: **nâng Number of slides ở đây trước**, rồi mới bán.',
    ],
    watch: [
      '**Điền cả rộng và cao là bật kiểm tra kích thước** cho vùng đó; để trống cả hai thì nhận mọi ảnh. **Điền một nửa thì bị từ chối.**',
      '“Placement” có **ba nghĩa** trong hệ thống — xem bảng dưới.',
    ],
    blocks: [
      {
        kind: 'table',
        heading: 'Sức chứa và vòng xoay — đọc kỹ trước khi bán',
        note: 'Hai khái niệm hay bị gộp làm một, và gộp nhầm là hứa sai với khách.',
        cols: ['', 'Sức chứa (Number of slides)', 'Vòng xoay (Rotation period)'],
        rows: [
          ['Trả lời', '**Bao nhiêu quảng cáo được chồng nhau trong cùng ngày**', '**Một lượt kéo dài bao lâu** trước khi đổi sang quảng cáo kế'],
          ['Ảnh hưởng', 'Ai **được chạy** — hệ thống chặn nếu hết chỗ', 'Ai **lên trước** — không chặn ai cả'],
          ['Vùng một-ô', 'Ví dụ sức chứa 6: sáu khách cùng chạy, nhưng người xem **thấy một cái tại một thời điểm**', 'Mỗi 60 s ô đó đổi sang quảng cáo kế; **mọi người trên site trong cùng một lượt thấy cùng một quảng cáo**'],
          ['Vùng slider / cột', 'Mọi quảng cáo đang chạy **đều trên màn hình**', 'Chỉ đổi thứ tự xuất hiện'],
        ],
      },
      {
        kind: 'warn',
        text:
          '**Sức chứa là ĐỘ PHỦ, không phải ĐỘC QUYỀN.** Bán cho khách “banner duy nhất ở trang chi tiết việc làm” nghĩa là vùng đó **không được chứa gì khác** trong những ngày đó — chứ không phải cứ đặt một booking là xong. Chỉ ở vùng **sức chứa = 1** (Home Ribbon, cột phải trang tìm kiếm, trang công ty) thì một booking mới đúng là cả vùng.',
      },
      {
        kind: 'table',
        heading: 'Các vùng đang bật trên dev (30/09/2026)',
        note: 'Cột **Tải lên** là kích thước file nên dùng — **2× ảnh tham chiếu**, sắc nét nhất mà site từng hiển thị. 3× chỉ nặng thêm chứ không đẹp hơn.',
        cols: ['Trang', 'Vùng', 'Kích thước', 'Số slide', 'Vòng xoay', 'Người xem thấy gì', 'Tải lên'],
        rows: [
          ['Home', 'Homepage - Home Hero', '614 × 320', '2', '300 s', 'Slider — mỗi quảng cáo là một slide, **tự trượt mỗi 3 giây**', '1228 × 640'],
          ['Home', 'Homepage - Home Ribbon', '1260 × 48', '1', '60 s', 'Một dải trên header, có màu nền hai bên cho màn rộng', '2520 × 96'],
          ['Home', 'Homepage - Home Middle', '1260 × 60', '2', '60 s', 'Một dải; hiện banner **đứng đầu**, đổi theo chu kỳ', '2520 × 120'],
          ['Home', 'Homepage - Popup', 'tuỳ ý', '1', '—', 'Một popup mỗi người xem, chọn theo đối tượng và ưu tiên', '—'],
          ['Search', 'Trang tìm kiếm — Banner cột phải', '273 × 327', '1', '60 s', 'Một cột bên phải — mọi quảng cáo xếp chồng', '546 × 654'],
          ['Job detail', 'Job detail - Bottom Banner', '728 × 90', '6', '60 s', 'Một ô; hiện banner **đứng đầu**, đổi theo chu kỳ', '1456 × 180'],
          ['Company page', 'Company page - Long banner', '994 × 94', '1', '300 s', 'Một dải trên hồ sơ công ty. **Công ty tự mua thì quảng cáo của họ thay quảng cáo mạng lưới**', '1988 × 188'],
          ['Employer home', 'Home - Top strip', '894 × 64', '6', '60 s', 'Một ô; **chọn ngẫu nhiên mỗi lần tải trang** — Rotation period không tác dụng', '1788 × 128'],
          ['Employer home', 'Home - Mid strip', '1200 × 57', '6', '60 s', 'Một ô; **chọn ngẫu nhiên mỗi lần tải trang** — Rotation period không tác dụng', '2400 × 114'],
          ['Employer home', 'Home - Right rail banner', '243 × 127', '6', '60 s', 'Một ô; **chọn ngẫu nhiên mỗi lần tải trang** — Rotation period không tác dụng', '486 × 254'],
          ['Employer home', 'Home - Recommended talent rail', '282 × 235', '6', '60 s', 'Một ô; **chọn ngẫu nhiên mỗi lần tải trang** — Rotation period không tác dụng', '564 × 470'],
          ['Employer home', 'Home - Service promo card', '840 × 150', '6', '60 s', 'Một ô; **chọn ngẫu nhiên mỗi lần tải trang** — Rotation period không tác dụng', '1680 × 300'],
          ['Candidate mgmt (employer)', 'Candidate management - Left banner', '258 × 136', '6', '60 s', '**Site không còn vẽ ô này** (gỡ 03/10/2026) — đăng vào sẽ không ai thấy', '516 × 272'],
        ],
      },
      {
        kind: 'warn',
        text:
          'Các vùng **Job** (Top job, Super hot job, Distinction, Job card, Top search, Mega menu…) **không bán ở Boosting** — chúng là sản phẩm tin đăng, đi theo bậc tin.',
      },
      {
        kind: 'list',
        heading: 'Ảnh phải vừa — ba quy tắc',
        items: [
          'Rộng **tối thiểu bằng** ảnh tham chiếu: *“This region needs at least 994 px wide (yours is 800 px…)”*.',
          'Đúng **tỉ lệ, sai số 2%**: *“This region needs the shape of 994×94 (yours is 1000×300 — any width is fine at that ratio)”*.',
          'Admin **từ chối file sai** — không bao giờ tự kéo giãn hay tự cắt. Form mở khung crop theo tỉ lệ vùng để bạn chọn phần giữ lại; **để chữ tránh xa mép**.',
          'Vùng để **tuỳ ý kích thước** (popup) không kiểm gì cả — tự thống nhất với designer.',
        ],
      },
      {
        kind: 'table',
        heading: '“Placement” — ba nghĩa, ba nơi, ba vòng đời',
        note: 'Đây là nguồn nhầm lẫn số 1 trong toàn hệ thống: ba thứ khác nhau cùng mang một cái tên.',
        cols: ['Nghĩa', 'Là gì', 'Xem ở đâu'],
        rows: [
          ['**Vùng hiển thị**', 'Cấu hình: kích thước, sức chứa, vòng xoay', '**Trang này**'],
          ['**Bậc một tin đang chiếm**', 'Giao dịch: tin nào, bậc nào, ngày nào, gắn PO nào', 'Trong chi tiết tin — không có trang riêng'],
          ['**Booking banner**', 'Mua một chỗ hiển thị trong một kỳ', 'Service delivery → Boosting'],
        ],
      },
      {
        kind: 'warn',
        text:
          '**Number of slides** (trước đây tên là *Concurrent bookings*) — form giờ nói rõ: **bao nhiêu booking trả tiền được chạy cùng lúc** ở vùng này; để trống = 1. Đủ số booking chồng lên một dải ngày thì booking hay banner mới cho những ngày đó **bị từ chối vì đầy**. Chỉ booking **đã lên lịch** và **đang chạy** mới giữ chỗ.',
      },
          {
        kind: 'table',
        heading: 'Hai loại vùng — Format quyết định form hiện ô nào',
        note: 'Vùng do **team BB seed sẵn**. **Không có Create, không có Delete** — danh sách này *là* bố cục của site, thêm một vùng nghĩa là sửa site. Mọi dòng đều **sửa được** (biểu tượng bút chì).',
        cols: ['Format', 'Cái gì đổ vào', 'Các ô có nghĩa'],
        rows: [
          ['**Job** (content pool)', 'Tin tuyển dụng — qua *Placement slots* của từng product', 'Items shown · Rotation period (s) · Size (px)'],
          ['**Display** (banner / popup)', 'Một creative được đăng dựa trên một lượt đặt chỗ đã trả tiền', 'Creative width × height · **Number of slides** · Rotation period (không có với popup)'],
        ],
      },
      {
        kind: 'table',
        heading: 'Từng cài đặt — và cách kiểm nó',
        cols: ['Cài đặt', 'Nghĩa', 'Kiểm bằng cách'],
        rows: [
          ['**Name**', 'Tên hiển thị tiếng Việt. **Cột chữ tự do duy nhất sửa được.**', 'Đổi tên một vùng; thay đổi **chỉ trong admin**, không có gì trên site công khai bị đổi tiêu đề.'],
          ['**Key**', 'Khoá máy mà site công khai truy vấn theo (`HOMEPAGE_TOP`). **Cố định — không sửa được.**', '—'],
          ['**Items shown**', '**Chính xác** bao nhiêu thẻ vùng này vẽ ra.', 'Đặt N; vùng hiện đúng N, **không bao giờ nhiều hơn**.'],
          ['**Rotation period (s)**', '**Độ dài của một chu kỳ, không phải tốc độ animation.** Trong một chu kỳ thứ tự **đứng yên**; sang chu kỳ mới danh sách **dịch đi một chỗ**: A, B, C → B, C, A → C, A, B. Không phải xáo ngẫu nhiên — qua N chu kỳ, mỗi quảng cáo (hoặc mỗi tin trong pool) dẫn đầu đúng một lần. Để trống = **không bao giờ xoay**; với pool lớn hơn *Items shown* thì phần dư **không bao giờ hiện**.', 'Tải lại trang **trong cùng một chu kỳ** → **cùng thứ tự**. Chờ sang chu kỳ sau → mục đầu tiên chuyển xuống cuối.'],
          ['**Creative size**', 'Chỉ vùng Display. **Đặt cả rộng và cao** để bật chốt chặn upload; để **trống cả hai** thì nhận mọi kích thước. **Chỉ đặt một trong hai là bị từ chối.**', 'Upload banner sai tỉ lệ → **bị từ chối, không tự cắt**.'],
          ['**Number of slides**', 'Chỉ vùng Display — bao nhiêu booking trả tiền được **chạy cùng lúc** ở đây. Để trống = **1**.', 'Thử đặt banner thứ hai vào vùng 1 slide cho khoảng ngày chồng lấn → **bị chặn vì đầy**.'],
          ['**Reference image**', 'Ảnh preview **chỉ dành cho admin** trên dòng. **Không bao giờ** hiện công khai.', '—'],
        ],
      },
      {
        kind: 'p',
        text:
          'Các trang **có vùng**: Home · Search · Job list · Job detail · Company page · Candidate profile và một số trang khác. *(Danh sách placement đầy đủ chốt vào 25/09.)*',
      },
      {
        kind: 'table',
        heading: 'Hai băng “Mega menu” — nguồn của các trang Jobs by roles / locations / industries / Korea / Global',
        note: '**Băng không tự chọn tin.** Nó vẽ **mọi** tin đang mở và đang được phơi mà **product của tin đó phủ vùng placement tương ứng**. Đây là lý do không có và **không nên có** cờ “featured trên trang Roles”: thứ tự chính là thứ các bậc tin được bán.',
        cols: ['Băng trên site', 'Vùng placement', 'Sức chứa tối đa'],
        rows: [
          ['**Đừng bỏ lỡ các việc làm này!**', '`Mega menu page - Don\'t miss these jobs`', '**48 slot** — 12 hàng × 4 thẻ'],
          ['**Việc làm xu hướng**', '`Mega menu page - Trending jobs`', '**30 slot** — 10 hàng × 3 thẻ'],
        ],
      },
      {
        kind: 'table',
        heading: 'Thứ tự bên trong một băng — ba dòng sắp xếp, theo trục riêng của từng trang',
        cols: ['#', 'Dòng sắp xếp', 'Nghĩa'],
        rows: [
          ['1', '**Nhóm đông tin nhất lên trước**', 'Trên *Roles*, ngành nghề đang có nhiều tin nhất dẫn đầu; trên *Location* là tỉnh/TP; trên *Industry* là ngành. **Đếm sống**, không phải danh sách cố định'],
          ['2', 'Rồi tới **thứ hạng của product**', 'Trong một nhóm, bậc **cao hơn trên Thang bậc tin** đứng trước: Top Job trên Distinction trên Basic Plus'],
          ['3', 'Rồi tới **lần auto-refresh gần nhất**', 'Trong một bậc, tin **vừa được product đẩy lên** dẫn đầu — **không phải** tin sửa gần nhất'],
          ['—', '**Quy tắc trải đều**', 'Trong một băng, **không công ty nào chiếm quá ~10 % số thẻ** — một nhà tuyển dụng lớn không thể lấp kín cả băng'],
        ],
        note: '**Korea** và **Global** sắp theo tỉnh/TP (chúng là bảng Location có thêm bộ lọc quốc gia). **Roles** sắp theo ngành nghề. Công ty vào **Korea** khi *CRM → Company → Country* = Hàn Quốc; **mọi quốc gia khác, kể cả để trống, rơi vào Global**.',
      },
      {
        kind: 'table',
        heading: 'HQ điều khiển các trang bảng tin ở đâu',
        cols: ['Cài đặt', 'Ở đâu trong Admin', 'Tác dụng'],
        rows: [
          ['Bậc nào xuất hiện trong băng nào', '**Products → product → Placement slots**', 'Tick / bỏ tick vùng Mega menu tương ứng'],
          ['Băng hiện bao nhiêu thẻ', '**Product settings → Placements → Items shown**', '**Đổi kích thước băng đó trên mọi trang bảng tin cùng lúc**'],
          ['Bậc nào dẫn đầu trong một nhóm', '**Product settings → Posting ladder** — kéo thả', 'Dòng sắp xếp 2'],
          ['Tin được đẩy lên bao lâu một lần', '**Products → product → Auto-refresh**', 'Dòng sắp xếp 3'],
          ['Nhà tuyển dụng nào tính là Hàn Quốc', '**CRM → Company → Country**', 'Korea giữ KR; các nước khác rơi về Global'],
        ],
        note: '**Không gì khác dịch chuyển được các trang này.** Không có bộ chọn tin riêng cho từng trang.',
      },
      {
        kind: 'p',
        text: '**Màn hình thật** — chụp trên dev ngày 08/10/2026.',
      },
      {
        kind: 'shot',
        src: '/shots/ps/placements-list.jpg',
        where: 'Admin',
        caption: 'Danh sách vùng. Cột **Format** (*Display* / *Job*) chia registry làm đôi và quyết định form sửa hiện ô nào. Không có nút tạo, không có nút xoá — chỉ có bút chì sửa.',
      },
      {
        kind: 'shot',
        src: '/shots/ps/placement-edit-display.jpg',
        where: 'Admin',
        caption: 'Sửa một vùng **Display** (*Company page - Long banner*): creative 994 × 94, **Number of slides**, vòng xoay 300 s, ảnh tham chiếu chỉ admin thấy.',
        note: 'Đặt **cả** rộng và cao mới bật được chốt chặn upload; chỉ đặt một trong hai là bị từ chối.',
      },
      {
        kind: 'shot',
        src: '/shots/ps/placement-edit-job.jpg',
        where: 'Admin',
        caption: 'Sửa một vùng **Job** (*Trang chủ — Job card basic*): *Items shown* 30, vòng xoay 300 s. Dòng *Content source* nhắc: bậc nào hiện ở đây là do *Placement slots* của từng product, không phải màn này.',
      },
      {
        kind: 'shot',
        src: '/shots/61-web-job-bands.jpg',
        where: 'Jobseeker site',
        caption: 'Và đây là kết quả trên site công khai — các dải tin mà cấu hình ở trên vẽ ra.',
        note: 'Không ai gán tay tin nào vào dải nào: dải đọc theo **bậc tin**, qua *Placement slots* của product.',
      },
],
  },


  'image-gallery': {
    logic: [
      'Kho ảnh dùng chung để làm **ảnh thẻ tin** — ảnh hover, ảnh banner của tin ở những bậc có perk ảnh. Mỗi ảnh khai **Frame** (*Wordmark · Thumbnail · Photo — portrait*) để picker chỉ chào ảnh đúng khung.',
      '**Topics** nói ảnh chụp **cái gì**; ngành nghề được khớp qua topic, nên một ảnh phục vụ được nhiều ngành mà không gắn cứng vào ngành nào.',
      'HQ mua bản quyền ảnh **một lần**, rồi tin chọn từ kho — thay vì mỗi khách tự nộp ảnh đúng kích thước. Màn hình là một **lưới ảnh** (24 ảnh mỗi trang), không phải bảng: người vận hành đang **chọn hình**. Mỗi thẻ ghi Frame, số tin đang dùng (*n postings*), hạn bản quyền (*Licensed until …*), và nhãn *Archived* nếu đã lưu trữ.',
      'Ảnh được **tiêu ở form tin tuyển dụng** (*Recruitment → Jobs*, khối ảnh thẻ — chỉ hiện khi bậc tin phủ một vùng có perk ảnh, xem *Placements*). Picker ở đó **khoá theo đúng khung** đang cần, mở sẵn lọc theo **ngành của tin**, và **chỉ chào ảnh dùng được** — chưa lưu trữ và bản quyền còn hạn.',
      'Lúc tin **Publish**, ảnh đã chọn được **đóng băng** vào lượt hiển thị đó: lưu trữ ảnh hay bản quyền hết hạn sau này **không đổi** thẻ đang chạy trên site.',
      'Quyền: xem `content_gallery:read`, thêm và import `content_gallery:create`, sửa và lưu trữ `content_gallery:update` — **không có Delete**, lưu trữ là một Update. Seed mặc định: **chỉ hq_admin** (chỉnh được ở *Organisation → Roles*).',
    ],
    how: [
      '**Add image** → chọn file, đặt **Name**, chọn **Frame**, gắn **Topics**, điền **Licensed until** nếu ảnh có hạn bản quyền → lưu.',
      'Nhiều ảnh một lúc: **Import** từ file .xlsx theo mẫu (*Download template*) — mỗi dòng một ảnh, link Google Drive để chế độ *Anyone with the link*, hoặc nhúng ảnh thẳng vào ô.',
      'Import có **bảng xem trước**: mỗi dòng ghi *Ready* hoặc *Error* kèm lý do, sửa được ngay trên bảng. Dòng lỗi bị **bỏ qua**, không chặn cả file → *Import n images* → bảng kết quả ghi từng dòng không vào được.',
      'Lọc: tìm theo **tên ảnh**, **Topic**, **Suits industry** (ngành phù hợp — khớp qua topic), **Frame**, và công tắc **Archived only**. Mặc định chỉ hiện ảnh **chưa lưu trữ**; bật công tắc thì **chỉ** hiện ảnh đã lưu trữ — hai tập không trộn. Bộ lọc và trang nằm trên URL, gửi link là người nhận thấy đúng chỗ đó.',
      'Sửa: bấm vào thẻ → đổi **Name, Frame, Topics, Licensed until**, bật **Archived**. **Xoá ngày bản quyền** là một thay đổi thật (“giờ sở hữu hẳn”), không phải để trống cho có.',
    ],
    watch: [
      '**Form sửa không bao giờ thay file.** Ô ảnh vẫn hiện để bạn biết đang sửa ảnh nào, nhưng file không được gửi đi — kể cả với ảnh **chưa có tin nào dùng**. Muốn đổi hình: **Add image** ảnh mới, rồi lưu trữ ảnh cũ.',
      'Ảnh **hết hạn bản quyền** thì thôi được chào trong picker, nhưng **không bao giờ bị gỡ** khỏi tin đang dùng nó.',
      '**Archived** ẩn ảnh khỏi mọi picker; tin đang dùng vẫn hiện ảnh đó. Form ghi luôn số tin đang dùng ngay dưới công tắc.',
      'Màn kho **vẫn hiện ảnh đã hết bản quyền** (chưa lưu trữ) — để người gia hạn còn thấy. Chỉ picker trên form tin mới lọc chúng ra. Thấy ảnh trong kho **không có nghĩa** là tin chọn được nó.',
      '**Băng vàng “n topics have fewer than 3 usable images”** là cảnh báo sẵn sàng, không phải trang trí: dưới **3 ảnh dùng được** (chưa lưu trữ, bản quyền còn hạn), mọi tin thuộc ngành của topic đó nhận **cùng một bức ảnh** — tệ hơn một khung trống. Ảnh hết bản quyền **tính là thiếu**.',
      'File: **PNG, JPEG hoặc WebP, tối đa 20 MB** (cùng luật với ảnh banner). File chỉ upload **khi bấm Save** — huỷ form thì không để lại gì. Tạo mới mà chưa chọn file: *“Pick an image first — a gallery entry is the picture…”*.',
    ],
    blocks: [
      {
        kind: 'table',
        heading: 'Ba khung ảnh — Frame quyết định ảnh vào được ô nào',
        note: 'Frame dùng **cùng bộ từ** với khung ảnh mà vùng hiển thị bán (perk ảnh trên *Placements*). Picker cho khung ngang **không bao giờ** chào ảnh dọc.',
        cols: ['Frame (nhãn)', 'Mã', 'Lấp perk', 'Ghi chú'],
        rows: [
          ['**Wordmark**', '`WORDMARK`', 'Khung chữ / logo', '**Không import được bằng file** — mẫu import chỉ nhận hai mã ảnh dưới. Thêm từng ảnh bằng *Add image*.'],
          ['**Thumbnail**', '`PHOTO_LANDSCAPE`', '*Banner photo* (ảnh ngang)', '—'],
          ['**Photo — portrait**', '`PHOTO_PORTRAIT`', '*Hover photo* (ảnh dọc)', '—'],
        ],
      },
      {
        kind: 'table',
        heading: 'Vòng đời một ảnh',
        cols: ['Tình trạng', 'Nghĩa', 'Vào bằng cách', 'Picker trên form tin chào?', 'Tin đang dùng'],
        rows: [
          ['**Dùng được**', 'Chưa lưu trữ, bản quyền còn hạn (hoặc sở hữu hẳn)', 'Mặc định khi thêm', '**Có**', 'Hiện'],
          ['**Hết bản quyền**', 'Qua hết ngày *Licensed until* — bản quyền tính tới **cuối ngày** đó', 'Tự động theo ngày', '**Không**', 'Vẫn hiện — không ai gỡ'],
          ['**Archived**', 'Ảnh đã nghỉ hưu', 'Bật *Archived* trên form sửa (cần `content_gallery:update`)', '**Không**', 'Vẫn hiện'],
        ],
        note: 'Tắt *Archived* hoặc đặt lại ngày bản quyền là ảnh **quay lại picker** ngay.',
      },
      {
        kind: 'table',
        heading: 'Import .xlsx — năm cột, cả năm đều bắt buộc',
        note: 'Khác với *Add image*: ở đây **Topics và Licence expiry là bắt buộc**. Thiếu hẳn một cột thì cả file bị từ chối: *“This sheet is missing: … Use the template above.”*',
        cols: ['Cột', 'Luật', 'Lỗi hiện ra trên dòng'],
        rows: [
          ['**Name**', 'Không để trống', '*Name is required*'],
          ['**Image link**', 'Link `drive.google.com` để chế độ *Anyone with the link* — **hoặc** nhúng ảnh thẳng vào ô', '*Image link is required* · *Image link must be a drive.google.com link*'],
          ['**Role**', '`PHOTO_LANDSCAPE` hoặc `PHOTO_PORTRAIT`', '*Role "…" is not PHOTO_LANDSCAPE or PHOTO_PORTRAIT*'],
          ['**Topics**', 'Tên topic tiếng Việt hoặc tiếng Anh, cách nhau bằng `,` hoặc `;`, không phân biệt hoa thường', '*Topics is required* · *Unknown topic(s): …*'],
          ['**Licence expiry**', '`DD/MM/YYYY` hoặc `YYYY-MM-DD`, hoặc một ô ngày của Excel', '*Licence expiry is required* · *Licence expiry "…" is not a valid date*'],
        ],
      },
      {
        kind: 'open',
        text:
          '**Danh sách topic (và topic nào khớp ngành nào) đến từ svn-be; console chỉ đọc nó** (`gallery.service.ts` chỉ có `GET /topics`). Không có màn hình thêm / sửa topic — ai bảo trì danh sách này: chưa xác minh.',
      },
      {
        kind: 'shot',
        src: '/shots/ps/gallery.jpg',
        where: 'Admin',
        caption: 'Kho ảnh. Băng vàng báo **chủ đề nào còn dưới 3 ảnh dùng được** — nơi cần bổ sung ảnh trước. Mỗi ảnh ghi số tin đang dùng và hạn bản quyền.',
      },
    ],
  },

  'discount-programmes': {
    logic: [
      'Các **chương trình giảm giá** mà báo giá áp dụng **tự động** — sales không gõ tay phần trăm. Màn hình này là **chính sách giá**: sửa ở đây là đổi giá mọi sales sẽ báo từ hôm đó.',
      'Mỗi báo giá chọn **một** chương trình, áp cho cả báo giá. Trên dev màn hình này liệt kê **bốn**: *Gói dùng thử* (`TRIAL`) · *Ưu đãi đặc biệt* (`SPECIAL`) · *Chiết khấu theo số lượng (cùng loại)* (`EXISTING-VOLUME`) · *Giảm 50% tất cả các dịch vụ* (`NEWCHURN-50`). Hai cái đầu ghi *“No rate — priced by products, or typed by the rep”*: gói dùng thử khoá giảm giá về 0, còn ưu đãi đặc biệt thì sales gõ tay mọi con số và không cần duyệt.',
      'Mỗi chương trình áp cho một số **trạng thái khách** (*New · Existing · Churn* — cột *Applies to*), có điều kiện riêng, có cờ *Stacks*, và một *Validity* (từ ngày → tới ngày).',
      'Hai kiểu tính: **Volume discount, per product** — tổng số lượng một product trong option quyết định mức giảm cho mọi dòng của nó; **Flat rate per line** — một mức % cho **từng dòng** nằm trong giới hạn số lượng; dòng vượt giới hạn tính đủ giá, các dòng khác **giữ** mức giảm.',
      'Đường API là `/admin/sales/...` dù menu đặt ở *Product settings* — vì đây là **chính sách giá của Sales**: **chỉ báo giá đọc nó** (option báo giá trỏ thẳng vào chương trình). Products không trao đổi dữ liệu gì với màn này.',
      'Quyền: xem `discount_programme:read`, sửa `discount_programme:update`. Seed mặc định: **hq_admin** đủ quyền, **team_leader** chỉ xem. `discount_programme:create` có trên bảng quyền nhưng **không màn hình nào dùng**.',
    ],
    how: [
      'Mở một chương trình → xem *Conditions* và *How it computes* → **Edit**.',
      'Trong form chỉ sửa được **mức giảm và ngày**: *Discount tiers* (From → %) hoặc *Rate*, *Maximum quantity per line*, *First order of the current status only*, *Manager approves from (order-level %)*, *Effective window*.',
      'Danh sách: tìm theo **tên hoặc mã** (không dấu); cột *Programme · Applies to · Discount · Condition · Stacks · Validity · Status*. Chỉ vài dòng nên lọc và phân trang ngay trên trình duyệt.',
      'Lưu là gửi **cả thang** cùng lúc — không sửa lẻ một bậc. Form **không có** ô cho đối tượng, kiểu tính, trạng thái, cờ hay mã: những thứ đó chỉ đổi được bằng một thay đổi phía server.',
    ],
    watch: [
      '**Không có Create, không có Delete** — có chủ đích. Hai chương trình có mức giảm đến từ bảng khuyến mãi của khách; thêm một chương trình là một quyết định sản phẩm, không phải một form. Chương trình đã định giá một báo giá thì không bao giờ xoá được — chỉ đóng bằng ngày.',
      '**Ngưỡng duyệt không còn cố định 10 %.** Mỗi chương trình tự đặt *Manager approves from*: dưới ngưỡng thì **Sales lead** duyệt, từ ngưỡng trở lên thì **Sales manager** duyệt thẳng. Để trống = không cần duyệt.',
      'Ngưỡng duyệt được đọc **lúc bấm gửi báo giá** (*Mark as sent*), không phải lúc tạo nháp: **hạ** ngưỡng là chặn những báo giá nháp đang chờ gửi; **nâng** ngưỡng là thả chúng ra. Người gửi đủ thâm niên thì tự được miễn bước duyệt.',
      '*First order of the current status only*: khách **Churn quay lại** được hưởng lại — tính là PO đầu tiên của **giai đoạn hiện tại**, không phải của cả lịch sử.',
      '**Hai chương trình đang Active cùng phủ một trạng thái khách** thì màn hình hiện băng vàng liệt kê từng cặp. **Trên dev ngày 08/10 băng này đang hiện** (gói dùng thử chồng với ba chương trình kia). Xem hộp *lưu ý* bên dưới: build **không dùng** cột *Applies to* để định giá, nên phần lớn các cặp này là cảnh báo thừa.',
      'Ngoài *Effective window* thì chương trình ngừng áp và báo giá quay về giá đầy đủ. Hai đầu ngày đều tính.',
      '**Cả bốn chương trình trên dev hết hạn 31/12/2026.** Từ **01/01/2027**, nếu không ai dời *Effective window*, mọi báo giá mới **quay về giá đầy đủ** — không có cảnh báo nào trước.',
      '**Sửa ở đây không định giá lại báo giá đã gửi.** Báo giá lưu lại mã và tên chương trình lúc định giá; chỉ báo giá **mới** và báo giá **còn nháp** tính theo số mới (svn-be tính lại mọi mức giảm lúc lưu).',
    ],
    blocks: [
      {
        kind: 'table',
        heading: 'Bốn chương trình — và chế độ tương ứng trên báo giá',
        note: 'Sales không chọn “chương trình” trên báo giá mà chọn **chế độ giảm giá**. Chế độ nào được chào cho khách nào là **cố định trong code** (cột cuối) — xem hộp *lưu ý* bên dưới.',
        cols: ['Chương trình (mã)', 'Chế độ trên báo giá', 'Cách tính', 'Điều kiện', 'Stacks', 'Chế độ được chào cho'],
        rows: [
          ['**Gói dùng thử** (`TRIAL`)', '*Trial package*', 'Không có mức — giá là giá của các product **trial**; cả ba ô giảm (CK dòng, CK tổng đơn, giảm số tiền) khoá về 0', '—', 'No', 'New · Churn'],
          ['**Ưu đãi đặc biệt** (`SPECIAL`)', '*Special offer*', 'Không có mức — rep gõ tay mọi con số; **không qua duyệt**', '—', 'No', 'New · Churn · Existing'],
          ['**Chiết khấu theo số lượng (cùng loại)** (`EXISTING-VOLUME`)', '*Quantity discount*', 'Thang theo **tổng số lượng của cùng một product** trong option: 2 → 25 % · 5 → 30 % · 10 → 35 % · 20 → 40 % · 30 → 45 % · 50 → 50 % · 100 → 60 %. Mức rơi vào **mọi dòng** của product đó; dòng tặng không tính. CK tổng đơn và giảm số tiền: rep gõ', 'Từ 2 cùng product', 'Yes', 'New · Churn · Existing'],
          ['**Giảm 50% tất cả các dịch vụ** (`NEWCHURN-50`)', '*New / returning customer offer*', '50 % trên **mỗi dòng** có số lượng ≤ 5; dòng vượt tính đủ giá. CK tổng đơn khoá 0; giảm số tiền: rep gõ', 'Mỗi dòng ≤ 5 · chỉ PO đầu tiên của trạng thái hiện tại', 'No', 'New · Churn'],
        ],
      },
      {
        kind: 'warn',
        text:
          '**Cột *Applies to* trên màn này không quyết định ai được giảm.** Khi báo giá được định giá, svn-be tìm chương trình **theo mã của chế độ** rep đã chọn, và việc chế độ nào được chào cho khách *New / Existing / Churn* là một bảng **cố định trong code** (`DiscountMode`) — cột *Applies to* **không được đọc**. Vì vậy: sửa *Applies to* trên dev không đổi gì trên báo giá, và băng “hai chương trình cùng phủ một trạng thái” gần như luôn là báo động giả. Khách **New / Churn** được chào cả bốn chế độ (kể cả *Quantity discount* — lối thoát khi đơn quá lớn so với giới hạn 5 / dòng); khách **Existing** chỉ có *Quantity discount* và *Special offer*.',
      },
      {
        kind: 'warn',
        text:
          '**Đã giải quyết câu hỏi cũ về giới hạn số lượng mỗi dòng — build tính theo DÒNG.** Từ SRM-533 (svn-be V656, 29/09), *Giảm 50 %* là **Flat rate per line**: dòng vượt *Maximum quantity per line* **tính đủ giá**, các dòng khác **giữ** 50 %. Báo giá (`discount-programme.ts`) tính đúng như vậy. **Chữ trên chính màn này còn cũ**: trang chi tiết và gợi ý trong form vẫn ghi *“One line over and the whole discount is lost”* và *“… on the order subtotal”* — bỏ qua hai câu đó. Báo giá đã gửi trước thay đổi **giữ nguyên** con số đã gửi.',
      },
      {
        kind: 'table',
        heading: 'Trạng thái chương trình',
        cols: ['Trạng thái', 'Nghĩa', 'Đổi thế nào'],
        rows: [
          ['**Active**', 'Báo giá dùng được — trong *Effective window*', 'Có sẵn từ seed'],
          ['**Draft**', 'Chưa xong, chưa áp', 'Form **không đổi được trạng thái** — chỉ thay đổi phía server'],
          ['**Archived**', 'Đã đóng', 'Như trên. Cách đóng một chương trình từ màn này là **dời ngày kết thúc**'],
        ],
      },
      {
        kind: 'example',
        heading: 'Ví dụ — cùng một đơn, hai chế độ',
        scenario: 'Khách **New**. Option có 2 dòng: **Top Job × 3** và **Basic × 8**. Không có dòng tặng.',
        cols: ['Chế độ', 'Dòng Top Job × 3', 'Dòng Basic × 8', 'Ghi chú'],
        rows: [
          ['*New / returning customer offer* (`NEWCHURN-50`)', '**50 %** (3 ≤ 5)', '**0 %** — vượt giới hạn 5, tính đủ giá', 'Chỉ khi đây là PO đầu tiên của trạng thái hiện tại'],
          ['*Quantity discount* (`EXISTING-VOLUME`)', '**25 %** (tổng 3 → bậc 2)', '**30 %** (tổng 8 → bậc 5)', 'Rep gõ thêm CK tổng đơn thì có thể phải duyệt theo *Manager approves from*'],
        ],
        note: 'Trước SRM-533, dòng Basic × 8 làm **cả báo giá** mất 50 %. Giờ chỉ dòng đó mất.',
      },
      {
        kind: 'shot',
        src: '/shots/ps/discount-list.jpg',
        where: 'Admin',
        caption: 'Danh sách chương trình. Băng vàng phía trên là cảnh báo **chồng chương trình** — hiện đang bật trên dev.',
        note: 'Phần lớn các cặp trong băng là **báo động giả**: build không đọc cột *Applies to* khi định giá (xem hộp *lưu ý* phía trên).',
      },
      {
        kind: 'shot',
        src: '/shots/ps/discount-detail.jpg',
        where: 'Admin',
        caption: 'Chi tiết *Chiết khấu theo số lượng (cùng loại)*: bậc giảm theo **tổng số lượng của cùng một product** trong option — từ 2 cái 25 % tới 100 cái 60 %; dòng tặng không tính. Nút **Edit** chỉ sửa mức giảm và ngày.',
      },
    ],
  },

  'quota-usage': {
    logic: [
      'Trang trả lời: khách **đã mua gì, từng đơn vị đã dùng chưa, dùng vào đâu, hạn tới khi nào**. **Một dòng = một đơn vị** do một hoá đơn GTGT **đã phát hành** bán ra (SRM-1036): dòng hoá đơn *4 × Basic Plus Job* là **4 dòng**, đánh số # 1–4. Không có hoá đơn *Issued* thì không có dòng nào — nên **quà tặng và bảo hành CV search / Manual service không hiện ở đây** (xem §5).',
      'Phủ **bốn loại product** — *Job posting · CV search · Banner · Manual service*. **Job posting** tách thành từng lượt đăng; **một gói CV search, một booking banner, một dịch vụ manual = một dòng**, số đã dùng ghi dưới tên product (*“40 / 100 used”*). Trang này **thay cho** trang cũ *CV search usage*: đường `/system/cv-search-usage` tự chuyển về đây.',
      'Các dòng của **cùng một hoá đơn đứng liền nhau**, hoá đơn **mới nhất lên đầu**, một **đường kẻ đậm** ngăn giữa hai hoá đơn. Không sắp xếp lại được theo cột.',
      'Trang **chủ yếu để đọc**. Thao tác nằm trên dòng **CV search** (⋮: *Activate for the customer*, *Withdraw this package*); dòng **Manual service** có lối tắt *Open in Manual services* — nơi ghi nhận giao thật sự.',
      'Quyền: vào trang cần `invoice:read` — **cùng quyền với Invoices**; không có dòng quyền riêng trên màn Roles. Dòng nào hiện ra theo **phạm vi bán hàng** như danh sách hoá đơn. **Export Excel** cần thêm `invoice:export`; hai thao tác trên dòng CV search cần `product:update`.',
    ],
    how: [
      '**Bốn thẻ trên cùng** — *All units · Unused · Use by ≤ 30 days · Used · Expired*: bấm một thẻ để lọc. Số trên thẻ tính theo **mọi bộ lọc khác** đang bật.',
      'Ô tìm kiếm khớp **khách hàng, product, mã hoá đơn, mã PO**. Nút **Filter** mở thêm: *Internal tag · Product · Product type · Sales · Customer*.',
      'Bật **Hide fully used / expired invoices** để chỉ còn những hoá đơn **còn đơn vị chưa dùng** — danh sách CS còn phải theo dõi.',
      'Muốn biết khách **thật sự** còn đăng được bao nhiêu tin ở một bậc: mở **hồ sơ công ty → Products & billing**. Trang này trả lời câu khác: **hoá đơn nào** đã bán gì, và từng đơn vị đã được **gán** cho tin nào.',
      '**Export Excel** xuất đúng danh sách đang lọc, mỗi đơn vị một dòng, cùng các cột.',
    ],
    watch: [
      '**Dòng Job posting được gán theo thứ tự đăng, không phải số dư thật.** Tin đăng chọn hoá đơn X thì được tính cho X, lần đăng thứ k là đơn vị thứ k. Nhưng quota đăng tin là **một bể chung của công ty theo bậc** và hệ thống **trừ vào phần sắp hết hạn trước**, bất kể hoá đơn nào — nên một đơn vị ghi *Unused* chưa chắc còn dùng được. Xem ví dụ cuối trang.',
      '**Gói CV search thành *Used* ngay khi được kích hoạt**, dù còn credit — số credit thật đã dùng ghi dưới tên product (*“x / y used”*). Một banner thành *Used* khi quảng cáo đã đăng; một manual service khi đã giao **ít nhất một lần**.',
      '**Expired** = chưa dùng mà đã quá *Use by* — phần đó **đã mất**, không phải còn dùng. Đơn vị đã *Used* thì không chuyển sang Expired.',
      '**Không có nút cộng / trừ quota đăng tin tay.** Muốn khách có thêm lượt đăng tin thì bán thêm (báo giá → PO → hoá đơn Issued). **CV search và Manual service thì không cần PO 0 ₫ nữa**: dùng **Gift** hoặc **Warranty** ở hồ sơ công ty (§5). Cách lấy lại duy nhất là *Withdraw this package* — và chỉ cho gói CV search.',
      'Nhãn **Unpaid** cạnh hoá đơn = đơn hàng **còn nợ** một khoản phải thu. Quota vẫn được cấp từ lúc hoá đơn phát hành, không chờ thanh toán.',
    ],
    blocks: [
      { kind: 'h', text: '§1 · Đọc từng cột' },
      {
        kind: 'shot',
        src: '/shots/quota-usage-units.jpg',
        where: 'Admin',
        caption: 'Quota usage — **một dòng một đơn vị**, bốn nhóm cột *Order · Product unit · Usage · Warranty 1*, thẻ đếm và bộ lọc ở trên.',
      },
      {
        kind: 'table',
        note: 'Bốn nhóm cột, đúng như sheet theo dõi cũ của CS. Ba cột nhóm **Usage** do **hệ thống tự điền** khi đơn vị được dùng — không ai gõ tay.',
        cols: ['Nhóm', 'Cột', 'Nghĩa'],
        rows: [
          ['**Order**', '**Invoice no.**', 'Mã hoá đơn, bấm mở hoá đơn. Thêm nhãn **Unpaid** khi đơn hàng còn nợ'],
          ['', '**Invoice status**', 'Trạng thái **của cả hoá đơn** — xem bảng §2'],
          ['', '**Company ID · Company**', 'Mã `CO-…` và tên công ty mua'],
          ['', '**Sales**', 'Owner **của deal** (người trên báo giá), không phải owner hiện tại của công ty'],
          ['**Product unit**', '**#**', 'Số thứ tự đơn vị trong dòng sản phẩm của hoá đơn: 1…N'],
          ['', '**Product · Product type**', 'Tên product và loại. Gói CV / banner / manual service ghi thêm *“x / y used”*; product đi kèm ghi *Included free*'],
          ['', '**Internal tag**', 'Tag của **tin đã dùng đơn vị này** (như danh sách Jobs). Trống khi chưa dùng'],
          ['', '**Invoice date**', 'Ngày phát hành — **lúc quota vào tài khoản**'],
          ['', '**Use by**', 'Hạn phải dùng — cách tính theo từng loại ở §2. Chưa dùng thì ghi thêm *“N days left”*'],
          ['**Usage**', '**Status**', '*Unused · Used · Expired* — xem bảng §2'],
          ['', '**Activated**', 'Ngày đơn vị được dùng: ngày đăng tin · ngày kích hoạt gói CV · ngày banner bắt đầu chạy'],
          ['', '**Job ID**', 'Tin đã dùng đơn vị này, bấm mở tin'],
          ['**Warranty 1**', '**Warranty type · date · job ID**', 'Chỉ có khi **tin của đơn vị này được đăng lại bảo hành** (Job warranty): product, ngày đăng và mã tin bảo hành'],
        ],
      },
      { kind: 'h', text: '§2 · Trạng thái — của từng đơn vị và của cả hoá đơn' },
      {
        kind: 'table',
        heading: 'Status của một đơn vị — suy ra, không nhập tay',
        cols: ['Loại', 'Used khi', 'Expired khi', '*Use by* là'],
        rows: [
          ['**Job posting**', 'Đã có tin (hoặc add-on) đăng bằng đơn vị này', 'Chưa dùng và đã qua *Use by*', 'Ngày hoá đơn + *Must be used within* của product. Product đi kèm: hạn **gần nhất còn sống** của bậc đó trong bể'],
          ['**CV search**', 'Gói **đã kích hoạt** (đang chạy hoặc đã dùng hết)', 'Gói *LAPSED* / *REVOKED*, hoặc chưa kích hoạt mà đã qua hạn', 'Chưa kích hoạt: **hạn kích hoạt**. Đã kích hoạt: **ngày hết hạn sử dụng**'],
          ['**Banner**', 'Quảng cáo đã đăng (*Scheduled / Active / Expired*)', 'Chưa đăng mà đã qua hạn dùng', 'Ngày kết thúc quảng cáo; chưa đăng thì hạn phải dùng'],
          ['**Manual service**', 'Đã giao **ít nhất một lần**', 'Chưa giao lần nào mà đã qua hạn', 'Ngày hoá đơn + thời hạn của product'],
        ],
      },
      {
        kind: 'table',
        heading: 'Invoice status — tính trên mọi đơn vị của hoá đơn',
        note: 'Tính **trước** khi lọc: chọn một product không làm một hoá đơn dùng dở thành *Fully used*.',
        cols: ['Invoice status', 'Khi', 'Nghĩa với CS'],
        rows: [
          ['**In use**', 'Còn ít nhất một đơn vị *Unused*', 'Còn phải theo dõi'],
          ['**Fully used**', 'Mọi đơn vị đều *Used*', 'Không cần quan tâm nữa'],
          ['**Expired**', 'Không còn đơn vị *Unused*, và có đơn vị *Expired*', 'Không cần quan tâm nữa — phần chưa dùng đã mất'],
        ],
      },
      {
        kind: 'table',
        heading: 'Hoá đơn Issued cấp thành gì',
        note: 'Cấp xảy ra **trong cùng một giao dịch** với việc kế toán phát hành hoá đơn. Logic chung ở trang **Logic chung — Product settings**.',
        cols: ['Loại', 'Hoá đơn Issued cấp thành', 'Thành bao nhiêu dòng ở đây'],
        rows: [
          ['**Job posting**', 'N lượt vào **bể của công ty theo bậc**; mỗi hạn là một ngăn riêng', '**N dòng**. Gói *Unlimited*: một dòng cho mỗi lần đăng, hoặc một dòng *Unused* khi chưa đăng'],
          ['**CV search**', 'Một **gói** *PENDING* (chưa chạy), kèm hạn kích hoạt', '**1 dòng** — credit ghi *“x / y used”*'],
          ['**Banner**', 'Một **booking** *Reserved*', '**1 dòng** — chi tiết ở trang **Boosting**'],
          ['**Manual service**', 'Một dòng dịch vụ: *Quantity* × số lượng trên báo giá', '**1 dòng** — giao ghi nhận ở trang **Manual services**'],
        ],
      },
      { kind: 'h', text: '§3 · Gói CV search — trạng thái và hai nút' },
      {
        kind: 'table',
        cols: ['Trạng thái gói', 'Nghĩa', 'Vào bằng cách', 'Nút trên dòng (⋮)'],
        rows: [
          ['**PENDING**', 'Đã cấp, **chưa chạy**: chưa tiêu được, đồng hồ *Validity* chưa bắt đầu', 'Hoá đơn Issued', '*Activate for the customer* · *Withdraw this package*'],
          ['**ACTIVE**', 'Đang chạy — mỗi CV mở trừ 1 credit, từ gói sắp hết hạn trước', 'Khách bấm kích hoạt · HQ bấm *Activate for the customer* · hoặc **tự kích hoạt ở lần mở CV đầu tiên** (gói có hạn kích hoạt sớm nhất được chọn)', '*Withdraw this package*'],
          ['**EXHAUSTED**', 'Đã dùng hết credit', 'Lần mở cuối cùng', '—'],
          ['**LAPSED**', 'Quá hạn kích hoạt khi chưa chạy, hoặc hết *Validity* khi đang chạy', 'Job đêm 03:10', '—'],
          ['**REVOKED**', 'HQ đã thu hồi', '*Withdraw this package*', '—'],
        ],
      },
      {
        kind: 'list',
        heading: 'Hai nút — đọc trước khi bấm',
        items: [
          '**Activate for the customer** — hộp *“Start this package now?”* ghi rõ thời hạn bắt đầu **từ bây giờ** và ngày kết thúc; **không có nút huỷ kích hoạt**. Ghi nhận là **HQ bấm, dưới tên bạn**, không phải khách tự bấm. Bấm sớm là tự đốt thời hạn của khách — chỉ bấm khi khách nhờ.',
          '**Withdraw this package** — hộp ghi đúng số credit khách **mất ngay lập tức**; CV đã mở **vẫn mở**; **tiền không di chuyển ở đây** — hoàn tiền (nếu có) ghi trên hoá đơn. Ô **Why** bắt buộc, tối đa 500 ký tự, và **khách sẽ được báo câu này** — viết câu bạn sẽ nói qua điện thoại. Gói *Unlimited*: hộp ghi khách mất cả gói, và cấp quota lại **không khôi phục** nó.',
          'Cả hai làm mới trang này **và** tab *Products & billing* của công ty.',
        ],
      },
      {
        kind: 'table',
        heading: 'Thư nhắc tự động — chỉ gói CV search có',
        cols: ['Khi', 'Gửi cho gói nào', 'Mốc'],
        rows: [
          ['03:05 hằng đêm', 'Gói **chưa kích hoạt**, sắp qua hạn kích hoạt', '**30 ngày** và **7 ngày** trước hạn'],
          ['09:00 hằng ngày', 'Gói **đang chạy**, còn credit, sắp hết *Validity*', '**14 ngày** và **3 ngày** trước khi hết'],
          ['—', 'Job posting · Banner · Manual service', '**Không có thư nhắc nào** — CS tự canh cột *Use by* và thẻ *Use by ≤ 30 days*'],
        ],
      },
      { kind: 'h', text: '§4 · Hoàn, thu hồi, điều chỉnh — và sổ ghi phía sau' },
      {
        kind: 'table',
        cols: ['Tình huống', 'Điều gì xảy ra', 'Trên trang này'],
        rows: [
          ['Admin **từ chối (rút) một CV** mà công ty đã mở bằng credit', 'Credit được **hoàn về ví credit** của công ty **đã trả** (kể cả khi trả bằng gói được công ty khác chia sẻ), có một dòng sổ ghi lý do. **Không trả về gói** — gói có thể đã hết hạn, trả vào đó là trả một con số không tiêu được', '*Used* của gói **không giảm**'],
          ['HQ **thu hồi gói CV**', 'Credit chưa dùng mất ngay; ghi audit kèm lý do', 'Gói thành *REVOKED*; nút biến khỏi dòng'],
          ['**Tin đã đăng bị đóng / xoá**', 'Lượt đăng **không được trả lại** — build không có đường nào cộng lại bể ngoài hoá đơn', 'Không đổi'],
          ['**Hoá đơn phát hành sai**', '**Không có huỷ hoá đơn hay thu hồi quota trong hệ thống** — sửa trên cổng hoá đơn điện tử; quyền lợi đã cấp giữ nguyên', 'Dòng giữ nguyên'],
          ['Kế toán **bấm Issue hai lần** / mạng gửi lại', 'Không cấp trùng: mỗi dòng cấp chỉ được đánh dấu *đã cấp* một lần', '—'],
        ],
      },
      {
        kind: 'table',
        heading: 'Sổ ghi phía sau trang này',
        note: 'Không có màn hình “sổ cái” riêng trong console. *Quota usage* là góc nhìn **theo từng đơn vị trên hoá đơn**; hồ sơ công ty là góc nhìn **theo product**.',
        cols: ['Loại', 'Ghi ở đâu (svn-be)', 'Ghi gì'],
        rows: [
          ['Job posting', 'Sổ cấp + sổ tiêu của quota bậc tin (`company_tier_quota_spend`)', 'Mỗi lần cấp; mỗi lần đăng / duyệt một tin: bậc, tin, PO, **công ty đã dùng** (khác công ty trả khi dùng quota chia sẻ)'],
          ['CV search', '`credit_ledger` + gói `search_quota_grant`', 'Cấp, tiêu, hoàn, thu hồi'],
          ['Banner', '`placement_booking`', 'Trạng thái booking và số lần đã đặt'],
          ['Manual service', 'Nhật ký giao của dịch vụ', 'Từng lần giao — xem ở trang **Manual services**'],
        ],
      },
      { kind: 'h', text: '§5 · Tặng (Gift) và bảo hành (Warranty) — cấp không cần hoá đơn' },
      {
        kind: 'p',
        text:
          'Từ **12/10/2026** (SRM-941), HQ cấp thẳng **CV search** và **Manual service** cho một công ty mà **không cần báo giá, PO hay hoá đơn** — thay cho cách cũ là tạo **PO 0 ₫**. Có hai loại: **Gift** (tặng, không gắn với đơn nào) và **Warranty** (bảo hành, **thay cho một gói khách đã mua** và luôn gắn với gói gốc). Cả hai **không tạo hoá đơn, không ghi doanh thu**; tên người cấp và lý do được lưu và ghi audit. Vì không có hoá đơn nên **chúng không hiện trên trang Quota usage** — xem ở **hồ sơ công ty → Products & billing** (và trang **Manual services**, cột *Source*). Đối chiếu code ngày 25/10/2026: svn-be `origin/main`, saramin-vn-admin `origin/dev`, svn-web `origin/main`.',
      },
      {
        kind: 'table',
        heading: 'Bốn loại sản phẩm — tặng và bảo hành làm ở đâu',
        cols: ['Loại', 'Tặng (không gắn đơn)', 'Bảo hành (thay cho gói đã mua)', 'Làm ở đâu'],
        rows: [
          ['**CV search**', 'Nút **Gift** ở thẻ *Free products*', '**⋮ → Warranty** trên dòng CV search khách đã mua', 'CRM → Companies → mở công ty → tab **Products & billing**'],
          ['**Manual service**', 'Nút **Gift** ở thẻ *Free products*', '**⋮ → Warranty** trên dòng Manual service khách đã mua', 'Cùng chỗ'],
          ['**Job posting**', 'Đăng tin bằng một product **Free** (ví dụ *Free Job*)', 'Nút **Warranty** trên chi tiết tin (tin **trả phí**, đang *Open* hoặc *Closed*) → tạo **Draft** bảo hành, chọn product Free, rồi đăng', 'Recruitment → **Jobs** → chi tiết tin — hướng dẫn ở trang **Jobs §3.1**'],
          ['**Banner / Popup**', '**New ad → Customer → “— No order (free) —”** rồi chọn **Free product**', '**Chưa có.** Muốn bù cho khách thì tạo quảng cáo mới bằng làn miễn phí — nhưng không có lý do và không liên kết với booking gốc', 'Service delivery → **Boosting** — hướng dẫn ở trang **Boosting, Phần 3**'],
        ],
      },
      {
        kind: 'list',
        heading: 'Trước khi cấp — cần có product Free',
        items: [
          'Tặng chỉ chọn được product **Active**, bật **Free product** và **đúng loại** (CV search hoặc Manual service). Bật ở **Product settings → Products → mở product → Pricing → “Free product”** — bật lên thì giá về 0. Trên dev đã có *Gift CV Search* và *Gift Manual Service*.',
          'Danh sách trống thì hộp báo *“No active free product is set up for this.”* — tạo hoặc bật một product Free trước.',
          'Bảo hành **không cần** product Free: nó dùng **đúng product của gói gốc**.',
        ],
      },
      {
        kind: 'list',
        heading: 'A · Tặng CV search hoặc Manual service',
        items: [
          'Mở **CRM → Companies** → mở công ty → tab **Products & billing** → kéo xuống thẻ **Free products** (*“Gifted products — no invoice”*) → bấm **Gift**.',
          '**What to give**: *CV search package* hoặc *Manual service* (ô này chỉ hiện khi bạn có quyền cấp cả hai).',
          '**Product**: chọn product Free. **Quantity**: ít nhất 1 — **quà không bao giờ là Unlimited**. **Valid for (days)**: điền sẵn theo product; chỉ đổi khi có lý do.',
          '**Reason** (bắt buộc, tối đa 500 ký tự): lưu cùng gói cho người hỏi sau này. **Khách không thấy lý do.**',
          'Bấm **Give** → hộp *“Give this for free?”* nhắc rằng không có hoá đơn, không có doanh thu → **Give** → thông báo *“Gift granted”*. Dòng mới hiện trong **Free products**, ghi *“Gifted <ngày> · <người cấp>”* và lý do.',
        ],
      },
      {
        kind: 'shot',
        src: '/shots/grants/gift-dialog.jpg',
        where: 'Admin',
        caption: 'Hộp **Gift a package**: chọn loại, product Free, số lượng, số ngày hiệu lực và **lý do** (bắt buộc).',
      },
      {
        kind: 'shot',
        src: '/shots/grants/billing-free-products.jpg',
        where: 'Admin',
        caption: 'Thẻ **Free products** cuối tab Products & billing — nút **Gift** ở góc phải, mỗi quà một dòng kèm người cấp và lý do.',
      },
      {
        kind: 'list',
        heading: 'B · Bảo hành CV search hoặc Manual service',
        items: [
          'Cùng tab **Products & billing**, thẻ **Invoiced products** → tìm dòng CV search / Manual service khách đã mua → bấm **⋮** cuối dòng → **Warranty**.',
          'Hộp **Issue a warranty** ghi *“Replace what <công ty> paid for: <product>”*. **Quantity** điền sẵn theo gói gốc — sửa nếu chỉ bù một phần; gói gốc **Unlimited** thì phải tự gõ số. **Valid for (days)** điền sẵn theo gói CV gốc; với Manual service để trống = theo product.',
          '**Reason** (bắt buộc): *“What went wrong with the original.”*',
          'Bấm **Issue warranty** → xác nhận *“Issue this warranty?”* (gói gốc giữ nguyên, không hoá đơn, không doanh thu) → thông báo *“Warranty issued”*.',
          'Dòng bảo hành nằm **ngay dưới dòng gốc**, cùng hoá đơn, có tag **Warranty** và dòng phụ *“<ngày cấp> · <lý do> · valid until <ngày>”*.',
          'Chỉ bảo hành được dòng **Paid** chưa bị thu hồi. **Không** bảo hành một quà tặng hay một bảo hành khác. Một gói gốc bảo hành **nhiều lần** được.',
        ],
      },
      {
        kind: 'shot',
        src: '/shots/grants/line-menu-warranty.jpg',
        where: 'Admin',
        caption: 'Menu **⋮** trên một dòng đã mua: *History · Record · **Warranty***.',
      },
      {
        kind: 'shot',
        src: '/shots/grants/warranty-dialog.jpg',
        where: 'Admin',
        caption: 'Hộp **Issue a warranty**: số lượng điền sẵn từ gói gốc, **lý do** bắt buộc.',
      },
      {
        kind: 'shot',
        src: '/shots/grants/billing-invoiced-warranty.jpg',
        where: 'Admin',
        caption: 'Bảo hành hiện **ngay dưới dòng gốc** trên cùng hoá đơn, tag **Warranty**, kèm ngày cấp · lý do · hạn.',
      },
      {
        kind: 'table',
        heading: 'Sau khi cấp — mỗi loại chạy thế nào',
        cols: ['Loại', 'Lúc cấp', 'Thời hạn tính từ', 'Dùng / ghi nhận', 'Khách thấy gì'],
        rows: [
          ['**CV search** (tặng / bảo hành)', '**Not activated** — chờ, **không có hạn kích hoạt**, không bao giờ hết hạn khi đang chờ', '**Lúc kích hoạt**: khách bấm *Activate*, HQ bấm *Activate for the customer*, hoặc **tự kích hoạt ở lần mở CV đầu tiên**', 'Mỗi CV mở trừ 1. **Chỉ một gói CV chạy một lúc** — gói khác chờ đến khi gói đang chạy dùng hết hoặc hết hạn', 'Trang **Product usage** → nhóm **“Gifts and warranties”**: badge *Gift* / *Warranty*; bảo hành ghi *“For <product>”*; nút **Activate**'],
          ['**Manual service** (tặng / bảo hành)', '**Dùng được ngay**', '**Ngày cấp** + *Valid for*', 'HQ ghi nhận từng lần giao ở **Service delivery → Manual services** (⋮ → *Record*). Hết lượt hoặc quá hạn thì không ghi được nữa', '*“x of y used”* và *“Use by <ngày>”*'],
          ['**Job warranty**', 'Một tin **Draft**, công ty khoá theo tin gốc', 'Theo product Free được chọn', 'HQ đăng; **không trừ quota**, không add-on. Khách không publish / reopen được', 'Nhãn *Warranty* trên tin; dòng *“Warranty Job · n free posts”*'],
          ['**Banner miễn phí**', 'Một quảng cáo như thường', 'Độ dài = số ngày của free product', 'Như mọi quảng cáo', 'Như mọi quảng cáo'],
        ],
      },
      {
        kind: 'shot',
        src: '/shots/72-boosting-new-free.jpg',
        where: 'Admin',
        caption: 'Banner miễn phí: **Boosting → New ad → Customer → “— No order (free) —”** rồi chọn **Free product**.',
      },
      {
        kind: 'shot',
        src: '/shots/grants/manual-services-source.jpg',
        where: 'Admin',
        caption: 'Trang **Manual services** có cột **Source** (*Paid / Gift / Warranty*) — nơi ghi nhận giao cho cả quà và bảo hành.',
      },
      {
        kind: 'table',
        heading: 'Quyền',
        cols: ['Việc', 'Quyền', 'Dòng trên màn Roles'],
        rows: [
          ['Tặng / bảo hành **CV search**', '`search_quota:grant_free`', '**Gift and warranty grants** — mặc định chỉ *hq_admin*'],
          ['Tặng / bảo hành **Manual service**', '`manual_service:grant_free`', 'Cùng dòng'],
          ['Tạo **Job warranty**', '`job:create_warranty`', '**Create warranty job** — *hq_admin*, *vn_ops*'],
          ['Đặt **banner miễn phí**', '`content_display:create`', 'Quyền tạo quảng cáo ở Boosting'],
          ['Kích hoạt hộ / thu hồi gói CV', '`product:update`', '—'],
        ],
        note: 'Thiếu quyền thì **không thấy nút**; gọi API trực tiếp bị từ chối (403).',
      },
      {
        kind: 'table',
        heading: 'Kiểm thử — làm trên dev với công ty test',
        cols: ['#', 'Làm', 'Kết quả đúng'],
        rows: [
          ['1', '**Gift** một gói CV search cho công ty test, có lý do', 'Dòng mới ở **Free products**; danh sách hoá đơn và doanh thu của công ty **không đổi**'],
          ['2', 'Bỏ trống **Product** hoặc **Reason** rồi bấm Give', 'Báo lỗi ngay dưới ô, **không cấp**'],
          ['3', 'Đăng nhập tài khoản công ty → **Product usage** → nhóm **Gifts and warranties**', 'Gói mới *Not activated*, badge *Gift*; **không thấy lý do**'],
          ['4', 'Bấm **Activate** khi công ty **đang có** một gói CV chạy', 'Nút bị khoá, tooltip: chỉ một gói CV chạy một lúc'],
          ['5', 'Bấm **Activate** khi không có gói nào chạy', 'Gói chuyển *In use*, có ngày hết hạn = hôm nay + số ngày hiệu lực'],
          ['6', '**Talent pool → Search talent** → mở ứng viên → **Unlock**', 'Số còn lại của **gói đang chạy** giảm 1'],
          ['7', '**⋮ → Warranty** trên một dòng CV search đã mua', 'Dòng *Warranty* nằm dưới dòng gốc; gói gốc **giữ nguyên số**'],
          ['8', 'Tìm **Warranty** trên một dòng quà tặng', '**Không có** lựa chọn Warranty'],
          ['9', '**Gift** một Manual service → mở **Manual services** → ⋮ → *Record* một lần giao', '*Source* = **Gift**; số đã dùng tăng 1 (*x of y used*)'],
          ['10', 'Đăng nhập admin **không có** quyền *Gift and warranty grants*', 'Không thấy nút **Gift** và mục **Warranty**'],
          ['11', '**Boosting → New ad** → Customer → *— No order (free) —* → Free product → **Publish**', 'Quảng cáo chạy; không hoá đơn'],
          ['12', 'Kiểm tra chéo: mua thường (báo giá → PO → hoá đơn) và **Job warranty**', 'Vẫn chạy như cũ'],
        ],
      },
      {
        kind: 'open',
        text:
          '**Chưa chốt / cần biết (25/10/2026).** (1) **Trang Quota usage không liệt kê quà và bảo hành CV search / Manual service** — nó chỉ có các đơn vị bán trên hoá đơn; cột *Warranty 1* ở đây là **bảo hành tin tuyển dụng**. Muốn nhìn tất cả quà / bảo hành ở một chỗ thì cần thêm cột *Source* hoặc dòng cho chúng. (2) **Banner chưa có bảo hành**: chỉ có làn miễn phí, không lý do, không liên kết booking gốc. (3) **Job warranty không có ô lý do**, trong khi bảo hành CV search / Manual service bắt buộc lý do. (4) Trang **Manual services** có cột *Source* nhưng **chưa lọc được theo Source** và **chưa có export**. (5) Checklist test của Dev trên SRM-941 mô tả bố cục cũ (*“Gifts and warranties”*, nút Warranty cạnh giá, link *“Warranty (n)”*) — SRM-1089 đã đổi thành thẻ **Free products** và **⋮ → Warranty**; hướng dẫn này theo bố cục mới.',
      },
      {
        kind: 'example',
        heading: 'Ví dụ — hai hoá đơn cùng bậc, và vì sao một dòng Unused chưa chắc còn dùng được',
        scenario:
          'Công ty A. **Hoá đơn 1** phát hành **01/03/2026**: 5 tin *Top Job* (dùng trong 12 tháng) + 1 gói CV 100 credit, *Validity* 90 ngày. **Hoá đơn 2** phát hành **01/09/2026**: 2 tin *Top Job* (12 tháng).',
        cols: ['Khi', 'Hệ thống', 'Quota usage hiện'],
        rows: [
          ['01/03 — hoá đơn 1 Issued', 'Bể Top Job: ngăn **5 lượt, hết 01/03/2027**. Gói CV *PENDING*', '6 dòng: Top Job #1–5 *Unused* · CV *Unused* (*Use by* = hạn kích hoạt). Invoice status **In use**'],
          ['05/03 — HR đăng 2 tin Top Job, chọn hoá đơn 1', 'Ngăn 01/03/2027: 5 → 3', 'Top Job #1, #2 **Used**, có *Activated* và *Job ID*'],
          ['10/03 — nhà tuyển dụng mở CV đầu tiên', 'Gói **tự kích hoạt**; 90 ngày chạy từ hôm nay', 'Dòng CV **Used**, *“1 / 100 used”*, *Use by* đổi thành **08/06/2026**'],
          ['01/09 — hoá đơn 2 Issued', 'Mở ngăn mới: **2 lượt, hết 01/09/2027**', 'Thêm 2 dòng Top Job *Unused* của hoá đơn 2'],
          ['10/09 — HR đăng 1 tin, **chọn hoá đơn 2**', 'Hệ thống trừ **ngăn sắp hết hạn trước** (01/03/2027): còn 2 + 2', 'Hoá đơn 2: #1 **Used**. Hoá đơn 1: #3–5 vẫn *Unused* — nhưng ngăn thật chỉ còn **2**'],
          ['02/03/2027 — ngăn hoá đơn 1 hết hạn', '2 lượt **mất**. Bể còn **2** lượt (hết 01/09/2027)', 'Hoá đơn 1: #3–5 **Expired**, Invoice status **Expired**. Hoá đơn 2: #2 *Unused* — trong khi khách thực còn **2**'],
        ],
        note: 'Muốn biết số thật: **hồ sơ công ty → Products & billing**. Muốn biết hoá đơn nào đã bán gì và từng đơn vị dùng vào tin nào: trang này.',
      },
      {
        kind: 'open',
        text:
          '**Không có thư nhắc cho quota đăng tin, banner, manual service** — chỉ gói CV search có (§3). Trang đã có cột *Status* và thẻ *Use by ≤ 30 days* để CS tự canh; có cần gửi nhắc sales trước hạn hay không — chưa ai chốt.',
      },
      {
        kind: 'open',
        text:
          '**svn-be có endpoint cấp tay quota đăng tin** (`POST /api/admin/companies/{id}/posting-tiers/{tierCode}/grant`), nhưng console **không gọi** nó ở đâu cả. Quota cấp qua đường đó **không có hoá đơn**, nên sẽ **không hiện** trên trang này. Có nên gỡ endpoint hay đưa lên màn hình — chưa xác minh với team.',
      },
    ],
  },

  'manual-services': {
    logic: [
      'Mặt **sau bán hàng** của product loại *Manual service*: những thứ hệ thống không tự giao được (đăng bài Facebook, gửi email blast, CSKH) nên **phải có người ghi nhận đã giao**.',
      'Một dòng = **một công ty × một dịch vụ × một PO**, do hệ thống tạo **lúc hoá đơn GTGT Issued** — không ai tạo tay. Cùng một dịch vụ mua hai lần là **hai dòng**, hai hạn, hai nhật ký: gộp lại thì không còn trả lời được “bài này tính vào lần mua nào”.',
      '**Tổng lượt = *Quantity* trên product × số lượng trên dòng báo giá** — *Bài đăng Facebook* (3 bài) mua 2 → **6**. Tên dịch vụ và đơn vị (*bài, email, lần*) **đóng băng lúc mua**: đổi tên product sau đó không đổi dòng cũ. Hạn = lúc phát hành hoá đơn + thời hạn của product; product không bán thời hạn thì *No deadline*.',
      'Dịch vụ bán **trước khi** tính năng này ra đời đã được **backfill** thành dòng với **0 lượt đã giao** — con số 0/N đó là thật thà, không phải đoán.',
      'Cùng dữ liệu hiện ở **hồ sơ công ty → Products & billing** (thẻ *Manual services*, bỏ cột khách hàng) và trên **Quota usage** (dòng loại *Manual service*, có lối tắt *Open in Manual services*). Ghi nhận ở đâu thì cả ba chỗ cập nhật cùng lúc.',
      'Quyền: xem cần `manual_service:read`, ghi nhận cần `manual_service:record` (trên màn Roles là cột *Update* của dòng *Manual services*). Seed mặc định cho **hq_admin, vn_ops, vn_sales**. Rep phạm vi *team / own* chỉ thấy dịch vụ của công ty trong tầm.',
    ],
    how: [
      'Tìm theo **dịch vụ, mã hoặc tên khách**. Lọc **Status** và **Service**. Sắp xếp: *Newest* (mặc định) · *Needs action first* (theo trạng thái rồi hạn gần nhất — dùng như hàng đợi việc) · *Deadline, soonest* · *Most left*.',
      'Giao xong một lần → ⋮ → **Record** → điền **Delivered on**, **Post link**, **What was posted**; ảnh *Screenshot / artwork used* không bắt buộc → nút lưu ghi rõ cái giá: *“Save — deduct 1 bài đăng”* (lượt cuối: *“Save — deduct the last …”*).',
      'Xem lại → ⋮ → **History (n)**: trên cùng là số đã giao / tổng, còn lại, hạn; dưới là từng lần giao, **mới nhất trước** — số thứ tự, ngày, người ghi, ảnh (hoặc ô *no screenshot*), nội dung, link *Open post*. Từ đây cũng bấm *Record delivery* được.',
      'Cột *Valid until* hiện chữ đỏ **“n days left”** khi dòng còn lượt và hạn còn **≤ 14 ngày** — đó là danh sách cần giao gấp hoặc gọi khách.',
    ],
    watch: [
      '**Nhật ký chỉ ghi thêm — không sửa, không xoá.** Ghi nhầm một lần giao thì **không có nút gỡ**; lượt đó đã bị trừ. Kiểm link và ngày trước khi lưu.',
      '**Không có nút cộng / trừ lượt, cũng không thu hồi dịch vụ.** Số lượt là của hoá đơn. Muốn tặng thêm → bán thêm qua báo giá (0 ₫ cũng được).',
      '**Hết hạn mà chưa giao hết thì phần còn lại mất** — trạng thái *Expired*, số *Left* đỏ: khách đã trả tiền mà không nhận. Hệ thống **không gửi nhắc** — đây là dòng phải xử lý trước khi tới hạn.',
      '**Ảnh chụp chỉ upload được khi role có `media:create`** — hiện chỉ hq_admin. Role khác thấy *“Your role cannot upload images.”* và vẫn lưu được không kèm ảnh. Ảnh chỉ upload **khi bấm Save**; upload lỗi thì **không ghi gì cả** (*“The screenshot could not be uploaded, so nothing was recorded…”*).',
      '**Nút Record biến mất** khi dòng không còn *Available* — nhãn trạng thái đã nói vì sao. Tab để mở qua đêm có thể còn hiện nút; bấm thì server từ chối, vì nó tự kiểm lại **còn lượt + còn hạn** ngay lúc ghi.',
    ],
    blocks: [
      {
        kind: 'table',
        heading: 'Trạng thái — tính ra, không bao giờ chọn tay',
        note: 'svn-be tính trạng thái **mỗi lần tải trang**, từ số đã giao, tổng, và hạn. Rê chuột lên nhãn để đọc giải thích.',
        cols: ['Trạng thái (nhãn)', 'Nghĩa', 'Vào bằng cách', 'Ghi nhận được?'],
        rows: [
          ['*Available*', 'Còn lượt, còn hạn', 'Mặc định khi hoá đơn Issued', '**Có** — trạng thái duy nhất'],
          ['*Fully delivered*', 'Đã ghi đủ số lượt, vẫn trong hạn', 'Lần ghi cuối', 'Không'],
          ['*Expired* (đỏ)', 'Quá hạn mà **còn lượt chưa giao** — đã trả tiền, chưa nhận', 'Qua *Valid until*', 'Không'],
          ['*Ended*', 'Giao đủ **và** đã quá hạn — hợp đồng đóng', 'Giao đủ rồi qua hạn', 'Không'],
        ],
      },
      {
        kind: 'table',
        heading: 'Hộp “Record a delivery” — ba ô bắt buộc',
        note: 'Ba ô bắt buộc là ba thứ khách hỏi khi đối soát hoá đơn: **ngày nào, link đâu, đăng cái gì**.',
        cols: ['Ô', 'Bắt buộc', 'Luật / lỗi'],
        rows: [
          ['**Delivered on**', 'Có', '*Enter the day it went out.* Ngày tương lai bị khoá trên lịch (server: *That day has not happened yet.*)'],
          ['**Recorded by**', '—', 'Người đang đăng nhập; chỉ đọc, server tự lấy từ phiên'],
          ['**Post link**', 'Có, ≤ 2048 ký tự', '*Paste the link to what went out.* · *Enter a full http(s) link.*'],
          ['**What was posted**', 'Có, ≤ 4000 ký tự', '*Say what went out.*'],
          ['**Screenshot / artwork used**', 'Không', 'Cần `media:create`'],
        ],
      },
      {
        kind: 'list',
        heading: 'Server trả lời gì khi ghi nhận',
        items: [
          '**409** — dịch vụ đã hết lượt hoặc đã quá hạn (kiểm và trừ trong **một câu lệnh**, nên hai người bấm cùng lúc không thể vượt tổng).',
          '**400** — thiếu link / nội dung, hoặc ngày ở tương lai.',
          '**404** — dịch vụ không tồn tại hoặc nằm ngoài tầm của bạn.',
        ],
      },
      {
        kind: 'example',
        heading: 'Ví dụ — sáu bài Facebook, giao bốn',
        scenario:
          'Khách mua product *Bài đăng Facebook* (*Quantity* 3, *Unit* bài, phải dùng trong 6 tháng) với số lượng **2** trên báo giá. Hoá đơn Issued **01/04/2026**.',
        cols: ['Khi', 'Điều gì xảy ra', 'Ai thấy gì'],
        rows: [
          ['01/04 — hoá đơn Issued', 'Một dòng mới **0/6**, *Available*, hạn khoảng 6 tháng sau', 'Manual services; Quota usage (dòng Manual service 0/6); hồ sơ công ty'],
          ['10/04 — ops đăng bài, bấm **Record**', 'Nhật ký +1, trừ 1 lượt', '**1/6**, *History (1)*'],
          ['…tới giữa tháng 9 mới giao thêm 3 bài', '**4/6**', '*Valid until* hiện đỏ **“n days left”** khi còn ≤ 14 ngày'],
          ['Qua hạn', 'Trạng thái *Expired*, *Left* **2** đỏ; nút *Record* biến mất', 'Hai bài **đã trả tiền mà không giao** — không có nút gia hạn; chỉ còn cách bán bù'],
        ],
      },
      {
        kind: 'open',
        text:
          '**Dịch vụ không giới hạn** (dòng *No limit* trong package, svn-be V515) được server gửi với tổng = trống, nhưng trang này vẫn đọc tổng như một con số (`manual-services.types.ts`: `totalQuota: number`). Cột *Quota* và *Left* hiện gì cho một dòng như vậy — chưa xác minh trên dev.',
      },
    ],
  },

  boosting: {
    logic: [
      '**Rotation period là gì?** Thời gian **một banner đứng đầu** vùng, tính bằng giây. Hết mỗi chu kỳ, banner đứng đầu xuống cuối: A, B, C → B, C, A → C, A, B — qua N chu kỳ, mỗi banner đứng đầu đúng một lần.',
      '**Rotation period đặt ở đâu?** Admin đặt **riêng cho từng vùng**: **Product settings → Placements** → bút chì → **Edit placement** → ô **Rotation period (s)** → **Save**. Để trống = không xoay. Thời gian **chuyển slide** của Home Hero (**3 giây**) thì **cố định trong code**, không đặt ở đây. Chi tiết và ví dụ: **Phần 1** bên dưới.',
      'Trang này dùng để **đặt banner hoặc popup** lên site Saramin từ Admin — và để **đọc trang Placements trước**, để quảng cáo vào đúng vùng, vừa khung và thật sự hiện ra. Nguồn: trang Notion *Banner booking — Boosting & Placements* (viết trên dev 30/09/2026), đối chiếu lại với build `saramin-vn-admin` `origin/dev` 4595410 ngày 08/10/2026.',
      'Banner và popup **gộp một danh sách duy nhất** (trước là trang Displays hai tab) — mọi quảng cáo trả tiền, miễn phí và nội bộ. Nút **New** hỏi **Placement trước** — chọn vùng popup thì thành popup, chọn vùng khác thì thành banner.',
      'Một banner **không bao giờ chỉ là “tải ảnh lên”**. Nó cưỡi trên một **booking** — quyền (trả tiền hoặc miễn phí) chạy một quảng cáo, ở một vùng, trong một số ngày.',
      '**Hoá đơn GTGT phát hành mới tạo ra booking** (trạng thái *Reserved*). Chưa phát hành thì đơn đó **không hiện ra** trong Boosting để chọn.',
      '**Ngày kết thúc không bao giờ gõ tay** với quảng cáo của khách: = ngày bắt đầu + số ngày đã mua trên dòng hàng. Bán 30 ngày là chạy đúng 30 ngày.',
      '**Làn miễn phí:** quảng cáo của khách cũng có thể chạy trên một **Free product**, không cần PO — chọn **“— No order (free) —”**.',
      'Quảng cáo **nội bộ** (Source = **Internal — Saramin VN**: tuyển dụng của chính mình, thông báo, chiến dịch) **không cần booking** — nhưng **vẫn chiếm chỗ** trong vùng.',
      'Quyền: `content_display` — *Read* để xem danh sách, *Create / Update / Delete* cho từng thao tác (banner và popup **một quyền chung** từ svn-be #689). Logic chung về booking sau hoá đơn ở **Logic chung — Service delivery**.',
      'Booking cũng hiện trên **Quota usage** với loại *Banner*: *Used / total* = số lần đã đặt quảng cáo trên booking đó, *Valid until* = ngày kết thúc quảng cáo (chưa đăng thì là hạn phải dùng).',
    ],
    how: [
      'Kiểm trước: khách **đã có PO với dòng Placement booking cho đúng vùng**, và **hoá đơn đã phát hành**.',
      'Kiểm booking **chưa hết hạn dùng** — quá cửa sổ **Must be used within** (mặc định 12 tháng từ ngày hoá đơn) thì thành **Lapsed**, không đăng được.',
      'Kiểm vùng **còn chỗ cho đúng dải ngày** muốn chạy — xem cột Placement · Status · Starts · Ends trên chính danh sách Boosting.',
      'Chuẩn bị ảnh **đúng tỉ lệ vùng, kích thước 2×**, và link đích.',
      'Mở **Service delivery → Boosting** → **+ New** → chọn **Placement** → đặt **Banner name** (chỉ admin thấy) và **Purpose** (không bắt buộc).',
      '**Source = Customer** → tìm công ty → chọn **Order / PO** → chọn **Placement product on the order** (dòng này quyết định vùng và số ngày). Không có PO: chọn **— No order (free) —** rồi một **Free product**.',
      'Đặt **Start date** (để trống = chạy ngay; ngày kết thúc tự điền) → bật **Visible on the site** → tải ảnh và **crop theo khung vùng** → đặt **Link target**.',
      'Bấm **Publish** để lên ngay, hoặc **Save as draft** để lưu rồi đăng sau.',
    ],
    watch: [
      '**Ẩn bằng Visible = Off KHÔNG trả lại chỗ.** Chỉ **Draft · Archive · Delete** mới giải phóng vùng.',
      'Đã **Published** thì **vùng, đơn hàng và dòng hàng bị khoá** — muốn đổi thì phải tạo cái mới. Đổi **ảnh hoặc link** của quảng cáo đang chạy thì được: **Boosting → ⋮ → Edit** — vùng, đơn và ngày giữ nguyên.',
      '**Xoá một quảng cáo còn ngày sẽ trả booking về trạng thái Reserved** — dùng lại được cho quảng cáo khác.',
      'Admin **từ chối ảnh sai**, không bao giờ tự kéo giãn hay tự cắt. Form mở sẵn khung crop theo tỉ lệ vùng — **để chữ tránh xa mép**.',
      'Đăng rồi mà không thấy trên site: kiểm **Visible** · ngày bắt đầu còn ở tương lai · đã hết hạn · vùng một-ô thì **chờ hết một vòng xoay** (60 s hoặc 300 s).',
    ],
    blocks: [
      { kind: 'h', text: 'Phần 1 · Banner booking hoạt động thế nào' },
      {
        kind: 'table',
        heading: 'Rotation period là gì — và đặt ở đâu',
        note: '**Rotation period = thời gian một banner đứng đầu vùng**, tính bằng giây. Hết mỗi chu kỳ, banner đứng đầu xuống cuối: A, B, C → B, C, A → C, A, B. Trong các mốc thời gian dưới đây, **chỉ Rotation period là admin đặt** — thời gian chuyển slide thì không.',
        cols: ['Thời gian', 'Ai quyết định', 'Đổi ở đâu'],
        rows: [
          ['**Banner đứng đầu bao lâu** = Rotation period', '**Admin** đặt, riêng cho từng vùng', '**Product settings → Placements** → bút chì → **Edit placement** → ô **Rotation period (s)** → **Save**. Để trống = không bao giờ xoay. Popup không có ô này. Cần quyền `placement:update` (mặc định chỉ hq_admin)'],
          ['Home Hero chuyển sang slide kế', '**Cố định 3 giây** trong code site', '**Không đổi được** trong admin'],
          ['Chu kỳ bắt đầu lúc nào', '**Theo đồng hồ**: 60 s = mỗi phút tròn; 300 s = 10:00, 10:05, 10:10…', 'Không đổi được — **không** tính từ lúc đăng banner'],
          ['Site nhận thứ tự mới', 'Site giữ danh sách **tối đa 60 giây**', 'Không đổi được — có thể **trễ tới ~1 phút**'],
        ],
      },
      {
        kind: 'shot',
        src: '/shots/ps/placement-edit-display.jpg',
        where: 'Admin',
        caption: '**Product settings → Placements** → bút chì → **Edit placement**: ô **Rotation period (s)** — ở đây vùng *Company page - Long banner*, 300 giây. Danh sách Placements có cột **Rotation (s)** để xem nhanh giá trị của mọi vùng.',
      },
      {
        kind: 'table',
        heading: 'Hai loại banner — có slide và không có slide',
        note: 'Cùng một luật xoay vòng, nhưng người xem thấy rất khác nhau. **Chỉ Home Hero có slide** — mọi vùng còn lại không có. Vài vùng có cách hiện riêng (Search, [CO], Popup): xem bảng **Từng vùng dùng danh sách đó thế nào** ở cuối phần này.',
        cols: ['', 'Banner CÓ slide (slider)', 'Banner KHÔNG có slide'],
        rows: [
          ['Vùng', '**[JS] Homepage - Home Hero**', '**Tất cả các banner còn lại**'],
          ['Trên màn hình', '**Mọi** banner đang chạy đều nằm trong slider, **một** banner mỗi lần — số chấm dưới slider = số banner', '**Một** banner — cái đứng đầu danh sách'],
          ['Banner đổi khi nào', 'Slider **tự trượt mỗi 3 giây**', 'Khi sang **chu kỳ Rotation period** mới — và người xem phải **tải lại trang**'],
          ['Rotation period làm gì', 'Chỉ đổi **slide nào đứng đầu** — slide người xem thấy đầu tiên khi mở trang', 'Đổi **banner nào được hiện**'],
          ['Đang xem có tự đổi không?', '**Có**', '**Không**'],
          ['Mỗi banner được thấy', 'Mỗi vòng slider — 10 banner × 3 giây = **30 giây** một vòng', '**Một chu kỳ** trong mỗi N chu kỳ (N = số banner đang chạy)'],
        ],
      },
      {
        kind: 'diagram',
        id: 'boost-slider',
        heading: 'Ví dụ A — banner có slide: Home Hero, 10 banner, Rotation period 300 giây',
      },
      {
        kind: 'diagram',
        id: 'boost-rotation',
        heading: 'Ví dụ B — banner không có slide: một vùng 1 ô, Rotation period 60 giây',
      },
      {
        kind: 'table',
        heading: 'Từng vùng dùng danh sách đó thế nào',
        note: 'Cùng một danh sách, nhưng mỗi trang vẽ khác nhau — nên câu “60 giây đổi banner” chỉ đúng nguyên văn với **vùng 1 ô**.',
        cols: ['Vùng', 'Hiện bao nhiêu', 'Banner đổi khi nào', 'Đang xem có tự đổi không?'],
        rows: [
          ['Home Ribbon · Home Middle · Job detail bottom · Company page long banner', '**1** — banner đứng đầu', 'Mỗi chu kỳ Rotation period', '**Không** — tải lại trang mới thấy banner kế'],
          ['Home Hero', '**Tất cả**, mỗi cái một slide', 'Slider tự trượt **mỗi 3 giây**; chu kỳ chỉ đổi slide nào đứng đầu', '**Có**'],
          ['Search — cột phải', '**Tất cả**, xếp chồng', 'Chu kỳ đổi banner nào nằm trên cùng', '**Không**'],
          ['5 vùng **[CO] Home** trên site nhà tuyển dụng', '**1**', '**Chọn ngẫu nhiên mỗi lần tải trang** — Rotation period không có tác dụng; hai người tải cùng lúc có thể thấy khác nhau', '**Không**'],
          ['Popup', '**1** mỗi người xem', '**Không xoay**: Priority nhỏ nhất thắng, hoà thì Starts sớm hơn thắng; lọc theo Audience và Frequency', '—'],
          ['Vùng có Rotation period **để trống**', 'tuỳ vùng', '**Không bao giờ xoay** — banner có Starts mới nhất luôn đứng đầu', '—'],
        ],
      },

      { kind: 'h', text: 'Phần 2 · Đặt một banner, từng bước' },
      {
        kind: 'list',
        heading: 'A · Trước khi bắt đầu',
        items: [
          '**Khách đã mua.** Có một PO với dòng sản phẩm *Placement booking* cho đúng vùng bạn muốn, và **hoá đơn GTGT của nó đã phát hành**. Hoá đơn mới là thứ tạo ra booking — trước đó đơn **không hiện** trong Boosting.',
          '**Chưa hết hạn dùng.** Booking phải được dùng trong cửa sổ **Must be used within** của sản phẩm (mặc định **12 tháng từ ngày hoá đơn**). Quá hạn thì thành **Lapsed** và không đăng được.',
          '**Vùng còn chỗ** cho dải ngày bạn muốn — sức chứa của vùng xem ở trang **Placements**. Trên Boosting, dò các cột **Placement, Status, Starts, Ends** để thấy cái gì đang chạy ở đó.',
          '**Có ảnh đúng tỉ lệ vùng** (kích thước 2×), và **link** mà nó phải mở.',
        ],
      },
      {
        kind: 'shot',
        src: '/shots/70-boosting-list.jpg',
        where: 'Admin',
        caption: 'Boosting — mọi banner và popup, trả tiền, miễn phí và nội bộ, trong một danh sách.',
      },
      {
        kind: 'table',
        heading: 'B · Tạo quảng cáo — từng field trên form New ad',
        note: 'Mở **Service delivery → Boosting** → **+ New**. Form hỏi **Source trước** (đối chiếu dev-admin.saramin.vn ngày 18/10/2026); các field dưới theo thứ tự đó.',
        cols: ['Field', 'Điền gì', 'Cần biết'],
        rows: [
          ['**Source**', '**Customer** — đã mua, gắn với một dòng trên PO đã phát hành (hoặc một free product). **Internal — Saramin VN** — quảng cáo nội bộ', 'Chọn Internal thì **không có phần khách hàng**: chọn thẳng **Placement**, rồi nhập **Schedule** (bắt đầu và kết thúc, ngày và giờ)'],
          ['**Banner name**', 'Chỉ admin thấy, ví dụ *Tết 2026 — FPT Software · Home hero*', 'Bắt buộc'],
          ['**Purpose**', 'Vì sao quảng cáo này chạy, ví dụ *Q3 employer branding campaign*', '**Không bắt buộc**, chỉ admin thấy'],
          ['**Customer**', 'Tìm công ty', 'Bất kỳ công ty nào'],
          ['**Order / PO**', 'Đơn đã phát hành mà quảng cáo được mua trên đó', 'Chỉ liệt kê **đơn còn dòng chưa dùng cho vùng này**. Hoặc chọn **— No order (free) —** rồi một **Free product** (ví dụ *Test ABC · 30 days*) để cấp vị trí **không cần PO**. Free product **chỉ chọn được khi tạo mới** — quảng cáo đã có không chuyển sang free được'],
          ['**Placement product on the order**', 'Dòng hàng đã mua. Mỗi dòng đọc *vùng · số ngày · số slot*', 'Dòng mua cho nhiều quảng cáo hiện **“2 of 5 bookings left”** hoặc **“unlimited bookings”**. **Dòng quyết định vùng và số ngày chạy**'],
          ['**Placement**', '**Customer:** không chọn — hiện thành thẻ *tên vùng · trang · kích thước* kèm ảnh tham chiếu, lấy từ dòng hàng hoặc free product. **Internal:** chọn trong danh sách; mỗi lựa chọn đọc *tên · key · trang · kích thước*', 'Vùng popup → thành **popup**; vùng khác → thành **banner**. **Không đổi được sau khi tạo.**'],
          ['**Shown on**', '*(chỉ Company page - Long banner)* **Every company page** — quảng cáo mạng lưới, mọi hồ sơ công ty **trừ công ty đã tự mua**. **One company page** — chỉ hồ sơ của công ty đó', 'One company page thì **phải là công ty đã trả tiền**'],
          ['**Start date**', 'Ngày bắt đầu tính ngày đã trả. **Để trống = ngay bây giờ**', 'Ngày kết thúc **tự điền**: bắt đầu + số ngày trên dòng hàng'],
          ['**Visible on the site**', '**On**', '**Off** giấu một quảng cáo đã đăng mà **không** đưa về Draft — **vẫn giữ chỗ** trong vùng'],
          ['**Image**', 'Tải lên, rồi **crop theo tỉ lệ vùng**', 'Ảnh phải **đúng tỉ lệ vùng** và rộng tối thiểu bằng ảnh tham chiếu — nên tải lên **2×**. Admin từ chối file sai, không tự kéo giãn'],
          ['**Link target**', '**Custom URL** (gõ link), hoặc **Job posting**, **Company profile**, **Company\'s job list** (chọn đối tượng)', 'Với ba loại sau, **site tự dựng link** — không bao giờ cũ. **No link** = quảng cáo không trỏ đi đâu'],
          ['**Band colour (left / right)**', '*(chỉ Home Ribbon)* Màu lấp khoảng trống hai bên artwork trên màn rộng', 'Để trống = không có'],
          ['Nút lưu', '**Publish** để lên ngay, hoặc **Save as draft** để lưu và đăng sau', 'Form không còn ô *Status* (Notion còn ghi “Status → Published → Save”). Đã đăng rồi thì chỉ còn **Save changes**, giữ nguyên trạng thái'],
        ],
      },
      {
        kind: 'shot',
        src: '/shots/71-boosting-new-placement.jpg',
        where: 'Admin',
        caption: 'New ad → **Internal — Saramin VN** → **Placement**: mỗi lựa chọn hiện key, trang và kích thước creative của vùng.',
      },
      {
        kind: 'shot',
        src: '/shots/72-boosting-new-free.jpg',
        where: 'Admin',
        caption: 'New ad → **Customer**, ở đây là làn miễn phí: khách hàng, **“— No order (free) —”**, một free product — và **Placement** tự hiện theo free product đó.',
        note: 'Khách không có đơn nào thì form tự chọn “— No order (free) —”. Có PO thì bạn chọn **đơn** và **dòng sản phẩm** của nó thay vào đó; phần thời gian hiển thị và creative nằm bên dưới.',
      },
      {
        kind: 'table',
        heading: 'C · Sau khi đăng — trạng thái của chính quảng cáo',
        note: 'Quảng cáo có trạng thái riêng, và booking đằng sau nó cũng vậy.',
        cols: ['Trạng thái quảng cáo', 'Nghĩa'],
        rows: [
          ['Draft', 'Đã lưu, chưa lên site. **Vùng, đơn và dòng hàng vẫn đổi được**'],
          ['Review', 'Lưu để người khác duyệt trước. Chưa lên site, y như Draft'],
          ['**Published**', 'Đang chạy (trong dải ngày, Visible = On). **Vùng, đơn và dòng hàng bị khoá**'],
          ['Archived', 'Đã xong. Rời site và **trả lại chỗ**'],
        ],
      },
      {
        kind: 'table',
        heading: '… và trạng thái của booking',
        note: 'Cột cuối là thứ quyết định vùng còn chỗ hay không.',
        cols: ['Trạng thái booking', 'Nghĩa', 'Chiếm chỗ trong vùng?'],
        rows: [
          ['**Reserved**', 'Đã trả tiền, chưa có quảng cáo nào đăng trên nó — đây chính là thứ danh sách Order / PO đưa ra cho bạn chọn', '**Không**'],
          ['**Scheduled**', 'Quảng cáo đã đăng với ngày bắt đầu ở tương lai', '**Có**'],
          ['**Active**', 'Đang hiển thị', '**Có**'],
          ['**Expired**', 'Hết số ngày — quảng cáo tự rời khỏi site', 'Không'],
          ['**Lapsed**', 'Chưa từng dùng trước hạn **Must be used within**', 'Không'],
        ],
      },
      { kind: 'h', text: 'Phần 3 · Banner miễn phí — tặng hoặc bù cho khách' },
      {
        kind: 'p',
        text:
          'Một quảng cáo **của khách** chạy **không cần PO**, dựa trên một product **Free** loại *Placement booking*. Dùng để **tặng** banner, hoặc **bù** cho một booking không chạy được — banner **chưa có đường bảo hành riêng** như CV search / Manual service / Job. **Không hoá đơn, không doanh thu.** Khác với quảng cáo **Internal** (của chính Saramin VN, không gắn công ty): banner miễn phí **thuộc về một công ty khách**. Đối chiếu code ngày 25/10/2026: svn-be `origin/dev` (`AdPublishing.grantFree / holdFree`, V597), saramin-vn-admin `origin/dev`.',
      },
      {
        kind: 'table',
        heading: 'Trước khi bắt đầu — mỗi vùng cần một product Free riêng',
        note: 'Một product Free gắn với **đúng một vùng**: chọn product nào là quảng cáo chạy ở vùng đó. Vùng **chưa có** product Free thì **không tặng được** — tạo trước ở **Product settings → Products**: *Type* = Placement booking, bật **Free product**, chọn vùng và số ngày.',
        cols: ['Product Free trên dev (25/10/2026)', 'Vùng', 'Số ngày'],
        rows: [
          ['Popup trang chủ — 30 ngày (miễn phí)', '[JS] Homepage - Popup', '30'],
          ['Banner trang tìm kiếm — 30 ngày (miễn phí)', 'Trang tìm kiếm — Banner cột phải', '30'],
          ['Banner trang hồ sơ ứng viên — 30 ngày (miễn phí)', '[JS] My page - My page banner', '30'],
          ['Banner trang chi tiết việc làm — 30 ngày (miễn phí)', '[JS] Job detail - Bottom Banner', '30'],
          ['Test ABC', 'Company page - Long banner', '30'],
          ['*(chưa có)*', 'Home Hero · Home Ribbon · Home Middle · các vùng [CO]', '—'],
        ],
      },
      {
        kind: 'list',
        heading: 'Từng bước',
        items: [
          '**Service delivery → Boosting → + New** → **Source = Customer** → chọn **Customer**.',
          '**Order / PO** → chọn **“— No order (free) —”** (*“No purchase order: HQ grants a free placement product to this company instead.”*). Công ty không có đơn nào thì form **tự chọn sẵn** lựa chọn này.',
          '**Free product** → chọn product Free (*“Granted with no purchase order behind it. It sets the display length.”*). Danh sách chỉ có product **Active + Free + loại Placement booking**. **Placement** tự điền theo product.',
          'Vùng *Company page - Long banner* hỏi thêm **Shown on**: *Every company page* hoặc *One company page* (phải là chính công ty được tặng).',
          'Điền **Banner name**, ảnh, link, **Start date** (ngày kết thúc = start + số ngày của product) như quảng cáo thường. Ghi **lý do tặng / bù vào ô Purpose** (chỉ admin thấy) — hệ thống không có ô lý do riêng cho banner.',
          '**Publish** để chạy ngay, hoặc **Save as draft**.',
        ],
      },
      {
        kind: 'shot',
        src: '/shots/banner-free/free-product-list.jpg',
        where: 'Admin',
        caption: 'New ad → Customer → **“— No order (free) —”** → danh sách **Free product**: mỗi product ghi *tên · vùng · số ngày*.',
      },
      {
        kind: 'table',
        heading: 'Luật cần biết',
        cols: ['Điều', 'Luật'],
        rows: [
          ['Sức chứa', 'Lúc **Publish**, banner miễn phí qua **cùng kiểm tra sức chứa** như banner trả tiền — vùng kín thì bị từ chối'],
          ['Bản nháp', '**Không giữ chỗ**. Xoá bản nháp thì booking miễn phí của nó **mất theo**'],
          ['Chỉ khi tạo mới', 'Quảng cáo đã có **không chuyển** sang miễn phí được: *“Only available when creating a new ad — an existing one cannot be switched to a free product.”*'],
          ['Sai vùng', 'Product Free của vùng khác thì bị từ chối: *“That free product is for a different placement.”*'],
          ['Tiền', 'Không hoá đơn, không PO, không doanh thu'],
          ['Quyền', '`content_display:create` — quyền tạo quảng cáo ở Boosting'],
          ['Thấy ở đâu', 'Tab **By placement**: cột loại đơn ghi **Free**, dòng phụ *“Free product · {n} days”*. Booking miễn phí **không hiện** trên trang **Quota usage** (trang đó chỉ có hàng bán trên hoá đơn)'],
        ],
      },
      {
        kind: 'table',
        heading: 'Kiểm thử — làm trên dev với công ty test',
        cols: ['#', 'Làm', 'Kết quả đúng'],
        rows: [
          ['1', 'New ad → Customer = công ty test → *— No order (free) —* → Free product *Job detail* → ảnh → **Publish**', 'Quảng cáo chạy ở *Job detail - Bottom Banner*, đủ 30 ngày; công ty không có hoá đơn mới'],
          ['2', 'Tab **By placement** → mở vùng *Job detail*', 'Dòng quảng cáo có loại **Free**'],
          ['3', 'Tạo banner miễn phí vào vùng đã **kín** sức chứa', 'Bị từ chối vì vùng đầy, như banner trả tiền'],
          ['4', '**Save as draft** rồi xoá bản nháp', 'Không giữ chỗ; booking miễn phí mất theo'],
          ['5', 'Mở một quảng cáo đã có → **Edit**', 'Không đổi được sang *No order (free)*'],
        ],
      },
      {
        kind: 'open',
        text:
          '**Banner chưa có bảo hành thật sự.** Làn miễn phí không có ô lý do, không liên kết với booking gốc, và không đếm được *“bù mấy lần cho booking nào”*. Nếu cần như bảo hành CV search / Job thì phải làm thêm.',
      },
    ],
  },

}

export const PRODUCT_SERVICE_MODULE_DOCS: Record<string, ModuleDoc> = {
  'Service delivery': {
    title: 'Logic chung — Service delivery',
    lead:
      'Mặt **sau hoá đơn** của mọi sản phẩm. *Product settings* định nghĩa thứ bán; *CRM* bán nó; **khoảnh khắc kế toán phát hành hoá đơn GTGT**, mỗi dòng trên hoá đơn biến thành một **quyền lợi** trên tài khoản khách. Nhóm này là nơi đọc và giao quyền lợi đó: đã cấp gì, dùng tới đâu, cái gì phải giao bằng tay, banner nào đang chạy.',
    headline: [
      '**Một dòng Quota usage = một quyền lợi do MỘT hoá đơn đã phát hành cấp ra.** Không có hoá đơn thì không có dòng nào. Cấp xảy ra **trong cùng giao dịch** với việc phát hành — khách đăng tin được ngay giây sau — và bấm Issue hai lần **không** cấp hai lần.',
      '**Không có đường lùi.** Hoá đơn *Issued* không huỷ được trong hệ thống; quyền lợi đã cấp không thu về, không cộng trừ tay. Ngoại lệ duy nhất: **Withdraw** một gói CV search (trên Quota usage). Lượt đăng tin của tin đã đóng **không** được trả lại.',
      '**Manual service không tự giao được, và hết hạn là mất — im lặng.** Trả tiền chỉ mở ra một nhiệm vụ; phải có người ghi nhận đã giao. Chỉ gói CV có thư nhắc trước hạn; quota đăng tin, booking banner và dịch vụ giao tay hết hạn **không ai được báo**.',
    ],
    blocks: [
      {
        kind: 'table',
        heading: 'Ba trang, ba câu hỏi',
        cols: ['Trang', 'Trả lời câu hỏi', 'Quyền vào'],
        rows: [
          ['**Quota usage**', 'Khách đã được cấp gì, còn bao nhiêu, hạn tới khi nào — **cả bốn loại**, theo từng hoá đơn', '`invoice:read` (cùng quyền với Invoices)'],
          ['**Manual services**', 'Còn nợ khách lượt giao nào chưa làm; nhật ký từng lần giao', '`manual_service:read`; ghi nhận: `manual_service:record`'],
          ['**Boosting**', 'Banner và popup nào đang chạy ở vùng nào, trên booking nào', '`content_display:*`'],
        ],
      },
      {
        kind: 'list',
        heading: 'Lúc kế toán bấm Issue — hệ thống làm gì, trong một giao dịch',
        items: [
          '**Lấy “kế hoạch cấp” mà PO đã đóng băng lúc tạo PO** — mỗi dòng PO thành một hoặc nhiều dòng cấp. Package tách thành từng product; product có *Includes* kéo theo product đi kèm (chỉ **một tầng**, không lồng sâu hơn).',
          '**Đánh dấu từng dòng cấp là “đã cấp”** — chỉ dòng **chưa** cấp mới khớp, nên một lần Issue lặp lại (bấm đúp, mạng gửi lại) không chạm tới dòng nào nữa.',
          '**Giao mỗi dòng cho đúng chủ của nó theo loại** — bảng dưới. Mỗi bên chỉ ghi vào sổ của chính mình.',
          'Sau đó mới phát sự kiện `invoice.issued` — **chỉ để thông báo**, không phải cơ chế cấp. Không có độ trễ giữa “hoá đơn đã phát hành” và “khách dùng được”.',
        ],
      },
      {
        kind: 'table',
        heading: 'Bốn loại — cấp thành gì, tiêu ở đâu, hết hạn thế nào',
        note: 'Ba đồng hồ (cấp · phải dùng trong · thời gian hiển thị) giải thích ở **Logic chung — Product settings**. Bảng này nói **cái gì xảy ra sau hoá đơn**.',
        cols: ['Type của product', 'Hoá đơn cấp thành', 'Tiêu khi', 'Hạn', 'Xem / làm ở đâu'],
        rows: [
          ['**Job posting**', 'N lượt vào **bể của công ty theo bậc** — mỗi hạn một ngăn riêng', 'Publish một tin (HQ hoặc nhà tuyển dụng) trừ 1 lượt; add-on trừ lượt của nó. **Ngăn sắp hết hạn bị trừ trước**, bất kể tin chọn hoá đơn nào. Product *Free* không trừ gì', 'Ngày hoá đơn + *Must be used within*. Kiểm **lúc tiêu** — không có job dọn', '*Quota usage* (theo hoá đơn) · hồ sơ công ty → *Products & billing* (số dư thật)'],
          ['**CV search**', 'Một **gói** *PENDING* (chưa chạy)', 'Mở một CV trừ 1 credit, từ gói đang chạy sắp hết hạn trước. **Lần mở đầu tiên tự kích hoạt** gói chờ có hạn kích hoạt sớm nhất', 'Kích hoạt trước *Activation window* (12 tháng, 3 với trial); chạy *Validity* 30 / 90 ngày **từ lúc kích hoạt**', '*Quota usage* → *Activate for the customer* / *Withdraw this package*'],
          ['**Placement booking**', 'Một **booking** *Reserved*', 'Đăng một banner / popup trên booking đó', 'Dùng trước *Must be used within*; chạy *Duration* ngày từ ngày bắt đầu', '*Boosting*'],
          ['**Manual service**', 'Một dòng dịch vụ N lượt (*Quantity* × số lượng trên báo giá)', 'Ops **ghi nhận** một lần giao', 'Ngày hoá đơn + thời hạn của product', '*Manual services*'],
        ],
      },
      {
        kind: 'table',
        heading: 'Những việc chạy nền',
        cols: ['Việc', 'Khi', 'Làm gì'],
        rows: [
          ['Nhắc kích hoạt gói CV', '03:05 hằng đêm', 'Thư cho khách **30** và **7** ngày trước hạn kích hoạt'],
          ['Dọn gói CV', '03:10 hằng đêm', 'Gói quá hạn kích hoạt hoặc hết *Validity* → *LAPSED*'],
          ['Đối soát ví credit', '03:20 hằng đêm', 'Tính lại ví credit của công ty từ các gói còn sống'],
          ['Nhắc hết hạn gói CV', '09:00 hằng ngày', 'Thư cho khách **14** và **3** ngày trước khi gói đang chạy hết hạn mà còn credit'],
          ['Quét booking banner', 'Mỗi phút', 'Chuyển booking theo ngày: *Scheduled → Active → Expired*'],
          ['Quota đăng tin · manual service', '—', '**Không có job.** Hạn quota đăng tin được kiểm lúc tiêu; trạng thái manual service tính lúc đọc'],
        ],
      },
      {
        kind: 'table',
        heading: 'Đảo ngược và điều chỉnh — cái gì có, cái gì không',
        cols: ['Muốn', 'Có không', 'Ghi chú'],
        rows: [
          ['Huỷ một hoá đơn đã Issued', '**Không**', 'Quyết định có chủ đích (D-SLS-21): sửa trên cổng hoá đơn điện tử; quyền lợi đã cấp giữ nguyên'],
          ['Thu hồi gói CV', '**Có** — *Withdraw this package*', 'Credit chưa dùng mất ngay; CV đã mở vẫn mở; bắt buộc ghi lý do (khách được báo); tiền **không** tự hoàn'],
          ['Hoàn credit mở CV', '**Tự động**', 'Khi Admin từ chối một CV mà công ty đã mở bằng credit: credit về **ví** của công ty đã trả, có dòng sổ'],
          ['Trả lượt đăng tin khi tin đóng / xoá', '**Không**', 'Không có đường nào cộng lại bể ngoài hoá đơn'],
          ['Cộng / trừ quota tay', '**Không có nút**', 'svn-be có endpoint cấp tay quota đăng tin; console không gọi'],
          ['Sửa / xoá một lần giao manual service', '**Không**', 'Nhật ký chỉ ghi thêm'],
          ['Trả chỗ banner', '**Có**', '*Draft · Archive · Delete* quảng cáo. Delete một quảng cáo còn ngày → booking về *Reserved*. Ẩn bằng *Visible = Off* **không** trả chỗ'],
        ],
      },
      {
        kind: 'example',
        heading: 'Ví dụ — một hoá đơn, bốn loại quyền lợi',
        scenario:
          'Hoá đơn phát hành **01/03/2026** gồm: package *Gói Tăng Trưởng* (**5 tin Top Job** + **1 gói CV 100 credit, 90 ngày**), **1 Main banner 14 ngày**, **3 bài Facebook**.',
        cols: ['Khi', 'Hệ thống', 'Ai thấy gì'],
        rows: [
          ['01/03 — kế toán Issue', 'Cấp cùng lúc: bể Top Job +5 (hết 01/03/2027) · gói CV *PENDING* · booking *Reserved* · dịch vụ Facebook 0/3', '*Quota usage*: **4 dòng** (package tách làm 2), cùng *Invoice value*'],
          ['02/03 — HR đăng 1 tin Top Job', 'Bể −1', 'Top Job **1/5**'],
          ['05/03 — ops dựng banner trên Boosting, bắt đầu 10/03', 'Booking *Scheduled* → *Active* ngày 10/03 → *Expired* ngày 24/03, tự động', 'Banner **1/1**'],
          ['12/03 — nhà tuyển dụng mở CV đầu tiên', 'Gói **tự kích hoạt**, chạy tới **10/06/2026**', 'CV **1/100**, *Valid until* 10/06/2026'],
          ['20/03 — ops ghi nhận bài Facebook đầu', 'Nhật ký +1', '*Manual services* **1/3**'],
          ['27/05 — 14 ngày trước hạn', 'Thư nhắc khách: gói CV sắp hết, còn credit', '—'],
          ['10/06 — hết *Validity*', 'Đêm đó gói → *LAPSED*; credit còn lại **mất**', '*Left* vẫn hiện số — đọc cùng *Valid until*'],
        ],
      },
      {
        kind: 'warn',
        text:
          'Hai đồng hồ cần canh trên Quota usage: **cửa sổ kích hoạt** (quota chưa dùng sẽ hết hiệu lực) và **thời hạn sử dụng** (gói đang chạy sắp hết). Đồng hồ thứ hai gấp hơn — còn 40 lượt CV chưa mở mà gói hết hạn trong 7 ngày là **một cuộc gọi của sales**, không phải một email.',
      },
      {
        kind: 'warn',
        text:
          '**Tên cũ còn rơi rớt.** Trang *CV search usage* đã gộp vào **Quota usage** (đường cũ tự chuyển). Tài liệu và code của admin vẫn gọi nhóm này là *Products & Packages ▸ …*; menu hiện ghi **Service delivery**.',
      },
    ],
  },
}
