/**
 * Bộ test case — "test hết đi" dịch thành một danh sách đếm được.
 *
 * Nguyên tắc chọn case:
 *
 * 1. **Mỗi case phải có một kỳ vọng SAI ĐƯỢC.** "Kiểm tra trang Products" không
 *    phải test case; "Kích hoạt product khi còn thiếu fulfilment → bị từ chối và
 *    thông báo nêu đúng tên field còn trống" thì có.
 * 2. **Case từ chối quan trọng ngang case thành công.** Phần lớn giá trị của hệ
 *    thống này nằm ở những chỗ nó NÓI KHÔNG — hết quota, công ty chưa ACTIVE,
 *    hạ bậc, xoá vai trò đang có người giữ. Đó cũng là phần hay bị bỏ qua nhất
 *    khi chỉ nói "test hết đi".
 * 3. **Kỳ vọng viết theo thứ quan sát được**, không theo thuật ngữ nội bộ: một
 *    con số đổi, một dòng đổi trạng thái, một thông báo hiện ra.
 *
 * P0 = chuỗi chính phải chạy, hoặc hỏng thì mất tiền / mất dữ liệu.
 * P1 = luật bảo vệ tính đúng đắn (chủ yếu là các case từ chối).
 * P2 = màn hình hỗ trợ, không chặn phát hành.
 */

export type Kind = 'happy' | 'refuse' | 'perm' | 'data'
export type Case = {
  id: string
  title: string
  pre?: string
  steps: string
  expect: string
  p: 0 | 1 | 2
  kind: Kind
  page?: string
}
export type Suite = { id: string; module: string; note?: string; cases: Case[] }

export const SUITES: Suite[] = [
  /* ── A ─────────────────────────────────────────────────────────────────── */
  {
    id: 'PRD',
    module: 'Product settings — sản phẩm, gói, vùng hiển thị, thang bậc',
    note: 'Đây là nơi mọi thứ phía sau được định nghĩa. Sai ở đây thì sai lặng lẽ và chỉ lộ ra lúc xuất hoá đơn.',
    cases: [
      { id: 'PRD-01', p: 0, kind: 'happy', page: 'products', title: 'Tạo product cho cả 4 Type', steps: 'Tạo lần lượt Job posting · CV search · Boosting service · Manual service.', expect: 'Mỗi Type hiện **đúng bộ ô fulfilment của nó**, không thừa không thiếu.' },
      { id: 'PRD-02', p: 1, kind: 'refuse', page: 'products', title: 'Kích hoạt khi fulfilment còn thiếu', steps: 'Để trống một ô fulfilment bắt buộc → chuyển Active.', expect: '**Bị từ chối**, và thông báo **nêu đúng tên field** còn trống.' },
      { id: 'PRD-03', p: 1, kind: 'data', page: 'products', title: 'Product ID khoá sau lần bán đầu', steps: 'Sửa Product ID của một sản phẩm **chưa bán**, rồi của một sản phẩm **đã bán**.', expect: 'Chưa bán: sửa được. Đã bán: **khoá**, không sửa được.' },
      { id: 'PRD-04', p: 0, kind: 'happy', page: 'products', title: 'Placement slots định nghĩa chỗ hiển thị', steps: 'Gán cho một bậc tin một vùng, coverage *Whole display window*. Bán, phát hành hoá đơn, đăng một tin.', expect: 'Tin xuất hiện **ở đúng vùng đó và không ở vùng nào khác**.' },
      { id: 'PRD-05', p: 1, kind: 'data', page: 'products', title: 'Phủ Top search bán kèm cả hai card perk', steps: 'Tick *Top search* trong Placement slots của một bậc.', expect: 'Cả hai card perk **tự bật**; và từ đó **mọi tin bậc này cần ảnh mới đăng được**.' },
      { id: 'PRD-06', p: 0, kind: 'happy', page: 'products', title: 'Free product — đăng không cần PO', steps: 'Bật *Free product*. Đăng tin cho một công ty, **không chọn PO**.', expect: 'Danh sách chỉ còn sản phẩm Free; đăng thành công; **không trừ quota của ai**.' },
      { id: 'PRD-07', p: 1, kind: 'perm', page: 'products', title: 'Free product vô hình với nhà tuyển dụng', steps: 'Đăng nhập Company site, thử đăng tin.', expect: 'Sản phẩm Free **không xuất hiện** — họ chỉ đăng được từ thứ đã mua.' },
      { id: 'PRD-08', p: 1, kind: 'data', page: 'products', title: 'Trial product chỉ ở báo giá Trial', steps: 'Mở một báo giá thường, rồi một báo giá có *Discount programme = Trial package*.', expect: 'Báo giá thường: **không thấy**. Báo giá trial: **chỉ thấy sản phẩm trial**, không có sản phẩm thường và không có package.' },
      { id: 'PRD-09', p: 1, kind: 'data', page: 'products', title: 'Đổi chương trình reset dòng báo giá', steps: 'Trong báo giá đã có dòng, đổi sang/ra khỏi *Trial package*.', expect: 'Product trên **mọi dòng bị reset**. Thử gửi thẳng API cũng bị **chặn ở server**.' },
      { id: 'PRD-10', p: 1, kind: 'data', page: 'products', title: 'Free là cờ, không phải giá 0', steps: 'Đặt một sản phẩm **không** Free nhưng giá 0 ₫.', expect: 'Vẫn **phải đi ra từ một PO** — không rơi vào lane miễn phí.' },
      { id: 'PRD-11', p: 0, kind: 'happy', page: 'packages', title: 'Package: 1 dòng → nhiều quyền lợi', steps: 'Dựng package 3 sản phẩm, bán, phát hành hoá đơn.', expect: 'Báo giá hiện **1 dòng**; *Products & billing* của công ty hiện **3 sản phẩm** riêng.' },
      { id: 'PRD-12', p: 1, kind: 'data', page: 'packages', title: 'Premium package đi theo sản phẩm', steps: 'Tick *Premium package* cho package chứa bậc X. Bán bậc X **lẻ** cho công ty khác, đăng tin.', expect: 'Tin mua lẻ đó **cũng** xuất hiện ở khu Premium.' },
      { id: 'PRD-13', p: 1, kind: 'refuse', page: 'packages', title: 'No limit chỉ cho Job posting có hiệu lực', steps: 'Bật *No limit* trên một dòng CV search.', expect: '**Bị từ chối** — công tắc chỉ dùng được với Job posting có cửa sổ hiệu lực.' },
      { id: 'PRD-14', p: 1, kind: 'refuse', page: 'packages', title: 'Kích hoạt package có thành phần Inactive', steps: 'Chuyển một sản phẩm thành phần sang Inactive, rồi kích hoạt package.', expect: '**Thất bại**, thông báo **nêu đích danh** sản phẩm đó.' },
      { id: 'PRD-15', p: 0, kind: 'happy', page: 'product-ladder', title: 'Kéo thang đổi thứ tự Gợi ý', steps: 'Kéo bậc B lên trên bậc A, lưu. Mở Job search, sắp xếp *Gợi ý*.', expect: 'Tin của B **nằm trên** tin của A. Giá, thứ hạng, perk **không đổi**.' },
      { id: 'PRD-16', p: 1, kind: 'refuse', page: 'product-ladder', title: 'Hai tab cùng sửa thang', steps: 'Mở 2 tab, sắp lại ở cả hai, lưu cả hai.', expect: 'Lần lưu thứ hai **bị từ chối** ("the ladder changed…") và màn hình tải lại.' },
      { id: 'PRD-17', p: 2, kind: 'data', page: 'product-ladder', title: 'Vào / ra khỏi thang', steps: 'Chuyển một bậc sang Inactive rồi Active lại. Tạo một product Job posting **không** có Display duration.', expect: 'Inactive **rời thang**, Active lại **về đúng vị trí cũ**. Product không có Display duration **không bao giờ lên thang**.' },
      { id: 'PRD-18', p: 0, kind: 'happy', page: 'placements', title: 'Items shown là con số tuyệt đối', steps: 'Đặt *Items shown* = 8 cho một vùng đang có 30 tin đủ điều kiện.', expect: 'Vùng hiện **đúng 8 thẻ**, không bao giờ nhiều hơn.' },
      { id: 'PRD-19', p: 1, kind: 'data', page: 'placements', title: 'Vòng xoay ổn định trong một chu kỳ', steps: 'Đặt *Rotation period* = 60s. Tải lại trang công khai vài lần trong một phút, rồi chờ sang phút sau.', expect: 'Trong cùng chu kỳ: **cùng thứ tự**. Sang chu kỳ mới: **thứ tự khác**.' },
      { id: 'PRD-20', p: 1, kind: 'refuse', page: 'placements', title: 'Chốt chặn kích thước creative', steps: 'Đặt **cả** rộng và cao cho một vùng Display → upload ảnh sai tỉ lệ. Rồi thử đặt **chỉ một** trong hai.', expect: 'Ảnh sai tỉ lệ **bị từ chối, không tự cắt**. Đặt một chiều: **bị từ chối**.' },
      { id: 'PRD-21', p: 0, kind: 'refuse', page: 'placements', title: 'Sức chứa vùng được chặn thật', steps: 'Vùng có *Concurrent bookings* = 1. Đặt banner thứ hai cho khoảng ngày **chồng lấn**.', expect: '**Bị chặn** — không bán chồng quá sức chứa.' },
      { id: 'PRD-22', p: 1, kind: 'data', page: 'placements', title: 'Vùng Inactive thì tắt hẳn', steps: 'Chuyển một vùng sang Inactive.', expect: 'Băng đó **biến khỏi trang công khai**, kể cả khi vẫn còn tin đủ điều kiện.' },
    ],
  },

  /* ── B ─────────────────────────────────────────────────────────────────── */
  {
    id: 'CRM',
    module: 'CRM — khách hàng, báo giá, PO, hoá đơn',
    note: 'Mốc duy nhất đáng nhớ: **phát hành hoá đơn** là lúc quyền lợi được cấp. Mọi case ở đây xoay quanh việc chứng minh điều đó đúng — và chỉ đúng ở đó.',
    cases: [
      { id: 'CRM-01', p: 0, kind: 'happy', page: 'companies', title: 'Tạo khách hàng có MST', steps: 'Tạo công ty với MST hợp lệ.', expect: 'Lưu được; công ty vào được trạng thái **ACTIVE**.' },
      { id: 'CRM-02', p: 1, kind: 'refuse', page: 'companies', title: 'MST trùng', steps: 'Tạo công ty thứ hai với **cùng MST**.', expect: '**Bị từ chối**, và màn hình **link sang công ty đã tồn tại**.' },
      { id: 'CRM-03', p: 1, kind: 'refuse', page: 'companies', title: 'Công ty chưa có MST không vào được ACTIVE', steps: 'Tạo công ty **không** MST (phải có nickname) → thử chuyển ACTIVE.', expect: 'Mặc định **PROSPECT**; chuyển ACTIVE **bị từ chối**.' },
      { id: 'CRM-04', p: 1, kind: 'data', page: 'companies', title: 'MST sửa được nhưng không xoá được', steps: 'Sửa MST sai thành đúng. Rồi thử xoá trắng về rỗng.', expect: 'Sửa: **được**. Xoá trắng: **bị từ chối**.' },
      { id: 'CRM-05', p: 0, kind: 'happy', page: 'quotations', title: 'Báo giá nhiều option', steps: 'Dựng báo giá 2–3 option khác giá.', expect: 'Option là **phương án thay thế nhau** — tổng không cộng dồn.' },
      { id: 'CRM-06', p: 0, kind: 'happy', page: 'quotations', title: 'Issue PO từ option được chấp nhận', steps: 'Chấp nhận một option → Issue PO.', expect: 'PO ra đời ở **ACTIVE**, dựng đúng theo option đã chọn.' },
      { id: 'CRM-07', p: 1, kind: 'refuse', page: 'quotations', title: 'Issue PO lần hai', steps: 'Bấm Issue PO lần nữa trên cùng báo giá.', expect: '**Bị từ chối** — chỉ dùng được một lần.' },
      { id: 'CRM-08', p: 0, kind: 'data', page: 'purchase-order', title: 'PO ACTIVE chưa cấp gì', steps: 'Ghi lại quota **trước**. Issue PO. Mở lại *Products & billing*.', expect: 'Quota **không đổi**. Đây là case dễ bị bỏ qua nhất và là hiểu nhầm phổ biến nhất.' },
      { id: 'CRM-09', p: 0, kind: 'happy', page: 'invoice', title: 'Phát hành hoá đơn cấp quota', steps: 'Request official invoice → Issue official invoice. Mở *Products & billing*.', expect: 'Nhận số hoá đơn hợp pháp; quota **tăng đúng số lượng đã bán**, kèm hạn dùng.' },
      { id: 'CRM-10', p: 0, kind: 'refuse', page: 'invoice', title: 'Phát hành hai lần không cấp đôi', steps: 'Bấm Issue hai lần (double-click, hoặc refresh rồi bấm lại).', expect: 'Quota **chỉ tăng một lần**. Đây là case mất tiền nếu sai.' },
      { id: 'CRM-11', p: 1, kind: 'data', page: 'invoice', title: 'Hoá đơn đã phát hành là điểm cuối', steps: 'Tìm nút huỷ / hoàn trên hoá đơn đã Issued.', expect: '**Không có** — hệ thống hiện tại không có huỷ. Sửa sai nằm ở cổng nhà cung cấp hoá đơn điện tử.' },
      { id: 'CRM-12', p: 1, kind: 'data', page: 'purchase-order', title: 'PO hết hạn cuối tháng', steps: 'Xem PO phát hành đầu tháng và PO phát hành cuối tháng.', expect: 'Cả hai **cùng hết hạn ngày cuối tháng** — không phải 30 ngày trôi.' },
      { id: 'CRM-13', p: 2, kind: 'happy', page: 'sign-ups', title: 'Duyệt đăng ký mới', steps: 'Từ Company site đăng ký một công ty mới → duyệt ở Admin.', expect: 'Công ty xuất hiện trong danh sách khách hàng.' },
      { id: 'CRM-14', p: 2, kind: 'happy', page: 'company-claims', title: 'Duyệt claim công ty có sẵn', steps: 'Gửi yêu cầu nhận quyền quản lý → duyệt.', expect: 'Người gửi trở thành thành viên của công ty đó.' },
      { id: 'CRM-15', p: 2, kind: 'data', page: 'membership-tiers', title: 'Hạng thành viên theo ngưỡng', steps: 'Đối chiếu doanh số một công ty với ngưỡng đã cấu hình.', expect: 'Hạng khớp ngưỡng, không đặt tay.' },
      { id: 'CRM-16', p: 1, kind: 'happy', page: 'quota-usage', title: 'Nạp credit phía công ty', steps: 'Company site đặt mua gói credit → Admin xác nhận đã nhận tiền.', expect: 'Đơn dừng ở **chờ chuyển khoản**; credit **chỉ vào sau khi admin xác nhận**.' },
    ],
  },

  /* ── C ─────────────────────────────────────────────────────────────────── */
  {
    id: 'JOB',
    module: 'Tin tuyển dụng — đăng, nâng bậc, hiển thị',
    cases: [
      { id: 'JOB-01', p: 0, kind: 'happy', page: 'jobs', title: 'Đăng tin từ PO đã trả tiền', steps: 'New job → chọn công ty → chọn PO → chọn Main product → Post now.', expect: 'Danh sách Main product **chỉ còn dòng đã trả tiền của PO đó**; tin sang OPEN; quota **giảm đúng 1 slot của bậc đó**.' },
      { id: 'JOB-02', p: 0, kind: 'refuse', page: 'jobs', title: 'Hết quota giữa chừng', steps: 'Tiêu hết quota bằng một tin khác **trong lúc** đang điền form, rồi bấm Post.', expect: 'Tin vẫn được **lưu thành DRAFT**, bước publish bị từ chối, **nội dung không mất** — đổi PO/sản phẩm rồi đăng lại được.' },
      { id: 'JOB-03', p: 0, kind: 'refuse', page: 'jobs', title: 'Công ty chưa ACTIVE', steps: 'Thử đưa tin của một công ty **không** ACTIVE vào OPEN.', expect: '**Bị từ chối**, có thông báo lỗi.' },
      { id: 'JOB-04', p: 0, kind: 'happy', page: 'jobs', title: 'Exposure độc lập với status', steps: 'Tin đang OPEN → tắt Exposure → tải lại trang công khai → bật lại.', expect: 'Tắt: **biến mất** khỏi site dù vẫn OPEN. Bật: hiện lại.' },
      { id: 'JOB-05', p: 0, kind: 'happy', page: 'jobs', title: 'Nâng bậc', steps: 'Mở tin OPEN → Upgrade tier → chọn bậc cao hơn.', expect: 'Chỉ chào bậc **cao hơn**; *Current tier* đổi; trừ quota bậc mới; tin lên dải cao cấp hơn.' },
      { id: 'JOB-06', p: 1, kind: 'refuse', page: 'jobs', title: 'Hạ bậc / nâng tin miễn phí', steps: 'Thử nâng sang bậc **thấp hơn**. Thử nâng một tin **miễn phí** lên bậc trả phí.', expect: 'Cả hai **bị từ chối**.' },
      { id: 'JOB-07', p: 1, kind: 'data', page: 'jobs', title: 'Bốn trạng thái, không có hàng đợi duyệt', steps: 'Xem các tab trạng thái. Đăng tin từ Company site.', expect: 'Đúng **4 tab**: Draft · Schedule · Open · Closed. Tin công ty tự đăng **đi thẳng vào OPEN**, không qua duyệt. Không còn trạng thái Archived.' },
      { id: 'JOB-08', p: 1, kind: 'data', page: 'jobs', title: 'Tổng All bằng tổng các tab', steps: 'Cộng số đếm từng tab, so với tab All.', expect: 'Bằng nhau. Lệch nghĩa là có dòng **không bộ lọc nào chạm tới**.' },
      { id: 'JOB-09', p: 1, kind: 'data', page: 'jobs', title: 'Đóng tin', steps: 'Close một tin đang OPEN.', expect: 'Rời khỏi mọi vùng hiển thị; vị trí tin chuyển sang hết hạn.' },
      { id: 'JOB-10', p: 2, kind: 'data', page: 'jobs', title: 'Hẹn giờ đăng', steps: 'Đăng với ngày giờ tương lai.', expect: 'Vào **SCHEDULE**, chưa hiện công khai; tới giờ thì sang OPEN.' },
      { id: 'JOB-11', p: 1, kind: 'data', page: 'placements', title: 'Hai băng Mega menu', steps: 'Bỏ tick vùng *Trending* trên một bậc. Xem các trang Jobs by roles / locations / Korea / Global.', expect: 'Tin bậc đó **rời băng Trending** trên mọi trang bảng tin, nhưng **vẫn ra trong kết quả tìm kiếm**.' },
      { id: 'JOB-12', p: 1, kind: 'data', page: 'placements', title: 'Quy tắc trải đều', steps: 'Đăng ~20 tin cùng một công ty, cùng một bậc.', expect: 'Một băng hiện **tối đa ~10%** số thẻ cho một công ty; phần còn lại nằm ở kết quả tìm kiếm.' },
      { id: 'JOB-13', p: 1, kind: 'data', page: 'companies', title: 'Korea và Global theo quốc gia công ty', steps: 'Đặt Country = Hàn Quốc cho một công ty; để trống cho một công ty khác.', expect: 'Hàn Quốc → trang **Korea**. Mọi nước khác **kể cả để trống** → **Global**. Hai số cộng lại bằng tổng.' },
    ],
  },

  /* ── D ─────────────────────────────────────────────────────────────────── */
  {
    id: 'CV',
    module: 'CV & đơn ứng tuyển — vòng duyệt',
    note: 'Trục quan trọng nhất: trạng thái CV là **sự thật duy nhất được lưu**; việc gửi đơn và hiển thị trong tìm kiếm đều **suy ra** từ nó. Không màn hình nào đặt tay hai thứ sau.',
    cases: [
      { id: 'CV-01', p: 0, kind: 'happy', page: 'cv-review', title: 'Công thức máy quét — nhánh kinh nghiệm', steps: 'Tải lên CV có **1 kinh nghiệm**, không học vấn, không dự án.', expect: '**Đạt** ngay, không vào hàng đợi.' },
      { id: 'CV-02', p: 0, kind: 'refuse', page: 'cv-review', title: 'Công thức — học vấn một mình KHÔNG đủ', steps: 'Tải lên CV **chỉ có học vấn**, không kinh nghiệm, không dự án.', expect: '**Chưa đủ thông tin** — nhánh học vấn cần **cả dự án**. Đây là chỗ hay hiểu sai nhất.' },
      { id: 'CV-03', p: 0, kind: 'happy', page: 'cv-review', title: 'Công thức — học vấn + dự án', steps: 'Tải lên CV có **1 học vấn và 1 dự án**, không kinh nghiệm.', expect: '**Đạt**.' },
      { id: 'CV-04', p: 1, kind: 'data', page: 'cv-review', title: 'Kỹ năng không còn chặn', steps: 'Tải lên CV đạt công thức nhưng **không có kỹ năng nào**.', expect: '**Đạt**. Nếu màn hình còn ghi lý do kiểu "thiếu N kỹ năng" thì **backend chưa cập nhật** — ghi nhận và báo.' },
      { id: 'CV-05', p: 0, kind: 'data', page: 'cv-review', title: 'File không đọc được chữ', steps: 'Tải lên một PDF **ảnh scan** không có lớp chữ.', expect: '**Không đọc được** — kiểm trước mọi điều kiện khác.' },
      { id: 'CV-06', p: 0, kind: 'happy', page: 'cv-review', title: 'CV tải lên nghi ngờ vẫn nộp đơn được', steps: 'Với CV *Chưa đủ thông tin*, nộp đơn vào 3 tin.', expect: 'Nộp **thành công**; ứng viên thấy "Đã nộp" bình thường; nhà tuyển dụng **chưa thấy gì**.' },
      { id: 'CV-07', p: 0, kind: 'refuse', page: 'cv-review', title: 'CV Saramin nghi ngờ KHÔNG nộp được', steps: 'Soạn CV Saramin dưới công thức, thử chọn nó ở bước nộp.', expect: '**Không chọn được**; ép gửi thì server **từ chối**. Khác hẳn CV tải lên.' },
      { id: 'CV-08', p: 0, kind: 'happy', page: 'cv-review', title: 'Duyệt giải phóng TẤT CẢ đơn', steps: 'Duyệt CV đang giữ 3 đơn.', expect: 'Cả 3 đơn sang **Đã gửi** cùng lúc; toast **in ra đúng số đơn**; CV vào tìm kiếm nếu ứng viên đã bật.' },
      { id: 'CV-09', p: 0, kind: 'data', page: 'cv-review', title: 'Từ chối — đơn đang giữ và đơn đã gửi', steps: 'CV có 1 đơn **đã gửi** và 2 đơn **đang giữ** → Từ chối.', expect: 'Đơn đang giữ: **không được gửi** vĩnh viễn. Đơn đã gửi **bằng đúng version đó**: **thu hồi**. Lượt mở khoá đã trả tiền: **hoàn lại**.' },
      { id: 'CV-10', p: 0, kind: 'data', page: 'cv-review', title: 'Thu hồi chỉ chạm version bị từ chối', steps: 'Gửi v.1 cho NTD A. Ứng viên thay thành v.2. Từ chối v.2.', expect: 'NTD A **vẫn giữ nguyên v.1** — họ chưa từng được gửi v.2.' },
      { id: 'CV-11', p: 1, kind: 'data', page: 'cv-review', title: 'Version mới không rửa được từ chối', steps: 'Sau khi từ chối, ứng viên tải file mới **đạt công thức**.', expect: 'Quay lại **Cần duyệt** (v.2/2), **không tự duyệt**; lần từ chối cũ còn trong lịch sử.' },
      { id: 'CV-12', p: 1, kind: 'data', page: 'cv-review', title: 'Version cũ tự rời hàng đợi', steps: 'CV v.1 đang chờ duyệt → ứng viên thay bằng v.2 **đạt**.', expect: 'Dòng v.1 **tự rời hàng đợi**; đơn đang giữ đi luôn với v.2; CV không vào hàng đợi.' },
      { id: 'CV-13', p: 1, kind: 'data', page: 'cv-review', title: 'Đổi lý do viết đè lời nhắn', steps: 'Trong hộp thoại từ chối, chọn lý do A, sửa lời nhắn, rồi đổi sang lý do B.', expect: 'Lời nhắn **bị viết đè** theo lý do B. Phải chọn lý do **trước** rồi mới sửa chữ.' },
      { id: 'CV-14', p: 1, kind: 'refuse', page: 'cv-review', title: 'Ghi chú nội bộ bắt buộc', steps: 'Bấm Duyệt hoặc Từ chối mà **bỏ trống** ghi chú nội bộ.', expect: '**Không cho lưu**.' },
      { id: 'CV-15', p: 1, kind: 'happy', page: 'cv-review', title: 'Gỡ một quyết định', steps: 'Mở tab Đã từ chối → Duyệt (gỡ từ chối).', expect: 'CV thành **Đạt** và trở lại tìm kiếm. **Đơn đã mất không được khôi phục**, đơn đã thu hồi **không tự gửi lại**.' },
      { id: 'CV-16', p: 1, kind: 'data', page: 'applicants', title: 'Vì sao đơn còn Chờ', steps: 'Mở một đơn đang Chờ.', expect: 'Hiện **trạng thái CV** bên cạnh và link sang CV review. **Không có nút Gửi / Chuyển tiếp** ở bất kỳ đâu.' },
      { id: 'CV-17', p: 1, kind: 'data', page: 'jobseeker-users', title: 'Khoá tài khoản không đụng CV và đơn', steps: 'Khoá một ứng viên đã có đơn đã gửi.', expect: 'Không đăng nhập được, rời tìm kiếm CV. Nhưng CV **không bị từ chối**, đơn đã giao **vẫn nguyên**, lượt mở khoá **không hoàn**.' },
      { id: 'CV-18', p: 1, kind: 'data', page: 'jobseeker-users', title: 'Ứng viên xoá tài khoản', steps: 'Ứng viên tự xoá tài khoản.', expect: 'Thứ đã tới tay NTD **giữ nguyên**, gắn nhãn tài khoản không còn tồn tại; **không thu hồi, không hoàn tiền**; đơn đang giữ không bao giờ đi.' },
      { id: 'CV-19', p: 1, kind: 'data', page: 'talent-pool', title: 'Trạng thái hiển thị là suy ra', steps: 'Trong kho ứng viên, tìm cách đặt tay *Đang hiển thị*. Rồi lọc *Đạt* + *Ẩn*.', expect: 'Không đặt tay được. Bộ lọc mâu thuẫn **trả về rỗng** và nói rõ hai bộ lọc nào đang chọi nhau.' },
    ],
  },

  /* ── E ─────────────────────────────────────────────────────────────────── */
  {
    id: 'CO',
    module: 'Company site — bảng ứng viên, kho ứng viên, credit',
    cases: [
      { id: 'CO-01', p: 0, kind: 'happy', page: 'talent-pool', title: 'Lưu là miễn phí', steps: 'Tìm ứng viên → Lưu vào folder. Ghi lại số credit trước/sau.', expect: 'Thẻ vào cột *Saved*, **vẫn che**, số dư **không đổi**.' },
      { id: 'CO-02', p: 0, kind: 'happy', page: 'talent-pool', title: 'Kéo ra khỏi Saved = 1 credit', steps: 'Kéo thẻ ra khỏi cột Saved → xác nhận.', expect: 'Hộp thoại nêu số dư; trừ **đúng 1**; lộ tên, điện thoại, email, file CV.' },
      { id: 'CO-03', p: 0, kind: 'happy', page: 'talent-pool', title: 'Người đã mở khoá thì miễn phí mãi', steps: 'Lưu đúng người đó vào folder thứ hai, kéo ra. Archive rồi lưu lại.', expect: '**Không hộp thoại, không trừ tiền** lần nào nữa.' },
      { id: 'CO-04', p: 0, kind: 'refuse', page: 'talent-pool', title: 'Hết credit', steps: 'Đưa số dư về 0 → kéo một thẻ đang khoá ra khỏi Saved.', expect: '**Bị từ chối**; thẻ **ở lại cột Saved**; có link nạp thêm.' },
      { id: 'CO-05', p: 1, kind: 'refuse', page: 'talent-pool', title: 'Mở khoá hàng loạt khi thiếu credit', steps: 'Chọn nhiều thẻ → Unlock, với số dư **không đủ cho tất cả**.', expect: 'Phần vượt **bị từ chối**; **không trừ nửa vời**; người đã mở khoá bị bỏ qua, không tính tiền.' },
      { id: 'CO-06', p: 1, kind: 'refuse', page: 'talent-pool', title: 'Không kéo ngược về Saved', steps: 'Kéo một thẻ đã rời Saved trở lại cột Saved.', expect: '**Không cho** — có thông báo.' },
      { id: 'CO-07', p: 1, kind: 'refuse', page: 'talent-pool', title: 'Ứng viên đã xoá tài khoản', steps: 'Thử mở khoá lần đầu một ứng viên đã xoá tài khoản. Rồi thử với người **đã** mở khoá từ trước.', expect: 'Lần đầu: **bị từ chối**. Người đã mở khoá: **không ảnh hưởng**.' },
      { id: 'CO-08', p: 1, kind: 'data', page: 'talent-pool', title: 'Tìm theo tên chỉ thấy người đã mở khoá', steps: 'Tìm tên thật của một ứng viên **đang khoá**, rồi của một người **đã mở khoá**.', expect: 'Đang khoá: **không ra**. Đã mở khoá: ra.' },
      { id: 'CO-09', p: 1, kind: 'data', page: 'applicants', title: 'Luật chặng tuyển dụng', steps: 'Thêm chặng tới khi đủ 8; thử xoá cột đầu/cuối; thử xoá một chặng **còn người**; nhảy cóc 2 chặng.', expect: 'Chặn ở **8**; cột đầu và cuối **chỉ đổi tên được**; chặng còn người **không xoá được**; nhảy cóc **hợp lệ**.' },
      { id: 'CO-10', p: 1, kind: 'refuse', page: 'applicants', title: 'Hired / Rejected là điểm cuối', steps: 'Đưa một ứng viên sang Hired → thử kéo ngược lại.', expect: '**Bị từ chối** ("đơn đã đóng"); danh sách tải lại.' },
      { id: 'CO-11', p: 1, kind: 'data', page: 'applicants', title: 'Dòng bị Saramin thu hồi', steps: 'Admin thu hồi một đơn đã gửi → xem dòng đó trên bảng của NTD.', expect: 'Gắn nhãn thu hồi, các ô đọc là **đã bị giữ lại**, **mọi thao tác trên dòng bị từ chối** (kể cả thao tác hàng loạt bỏ qua nó).' },
      { id: 'CO-12', p: 2, kind: 'data', page: 'applicants', title: 'Đếm ngày ở một chặng', steps: 'Chuyển một ứng viên sang chặng X, rồi chuyển **lại chính chặng X**.', expect: 'Bộ đếm ngày **không reset**.' },
      { id: 'CO-13', p: 1, kind: 'perm', page: 'company-users', title: 'Xuất file ẩn danh người chưa mở khoá', steps: 'Xuất danh sách một folder có cả người đã và chưa mở khoá.', expect: 'File mở bằng mật khẩu tài khoản; người chưa mở khoá **bị ẩn danh** (che tên, không liên hệ); thông báo nói rõ bao nhiêu dòng bị ẩn.' },
      { id: 'CO-14', p: 1, kind: 'perm', page: 'company-users', title: 'Vai trò phía công ty', steps: 'Đăng nhập bằng thành viên **không** có quyền quản lý.', expect: 'Bảng ở chế độ **chỉ đọc**; tab kho ứng viên báo không có quyền.' },
      { id: 'CO-15', p: 2, kind: 'happy', page: 'company-users', title: 'Mời đồng nghiệp', steps: 'Mời một thành viên mới bằng email + vai trò.', expect: 'Người được mời **tự đặt mật khẩu** qua link; không ai gõ hộ.' },
    ],
  },

  /* ── F ─────────────────────────────────────────────────────────────────── */
  {
    id: 'CNT',
    module: 'Nội dung — collection, zone, banner',
    cases: [
      { id: 'CNT-01', p: 1, kind: 'happy', page: 'collections', title: 'Collection bộ lọc tự cập nhật', steps: 'Tạo *Saved search*, xem Preview đếm. Đăng thêm một tin khớp bộ lọc.', expect: 'Số đếm **tăng theo**; tin mới **tự vào**; tin đóng/ẩn **tự rớt ra**.' },
      { id: 'CNT-02', p: 1, kind: 'data', page: 'collections', title: 'Collection ghim tay giữ thứ tự', steps: 'Tạo *Hand-picked*, ghim 5 tin, sắp thứ tự. Đóng một tin đã ghim.', expect: 'Trang hiện **đúng thứ tự ghim**; tin đã đóng gắn cờ **không hiện** và bị bỏ qua, có dòng đếm nhắc.' },
      { id: 'CNT-03', p: 1, kind: 'refuse', page: 'collections', title: 'Trạng thái một chiều', steps: 'Publish một collection → thử đưa về Draft. Archive → tìm nút khôi phục.', expect: 'Không về Draft được; **không có nút khôi phục** từ Archived.' },
      { id: 'CNT-04', p: 1, kind: 'refuse', page: 'collections', title: 'Archive khi zone đang dùng', steps: 'Archive một collection đang được một **zone đã publish** sử dụng.', expect: '**Bị từ chối**, thông báo bảo gỡ zone hoặc trỏ sang collection khác trước.' },
      { id: 'CNT-05', p: 1, kind: 'data', page: 'collections', title: 'Collection rỗng vẫn publish được', steps: 'Publish một collection mà Preview đếm **0**.', expect: 'Vẫn publish được và **trang sẽ rỗng** — có cảnh báo. Đây là bẫy, không phải lỗi.' },
      { id: 'CNT-06', p: 1, kind: 'happy', page: 'zones', title: 'Dựng và xuất bản zone', steps: 'Tạo zone, đủ banner + hai collection, Publish, bấm Preview.', expect: 'Trang công khai sống ở đúng địa chỉ; khối tuỳ chọn để trống **không được vẽ ra**.' },
      { id: 'CNT-07', p: 1, kind: 'refuse', page: 'zones', title: 'Điều kiện xuất bản', steps: 'Thử publish khi **chưa có banner**; rồi khi một collection **đang Archived**.', expect: 'Cả hai **bị từ chối**, thông báo nêu đúng lý do.' },
      { id: 'CNT-08', p: 1, kind: 'data', page: 'zones', title: 'Sửa zone đang sống là sửa thẳng', steps: 'Sửa một khối trên zone **đã Published** → Save.', expect: '**Không có bản nháp song song** — trang công khai đổi trong khoảng một phút.' },
      { id: 'CNT-09', p: 2, kind: 'refuse', page: 'zones', title: 'Preview chỉ chạy trên zone đã publish', steps: 'Bấm Preview trên một zone **Draft**.', expect: 'Nút **mờ / không dùng được**.' },
      { id: 'CNT-10', p: 2, kind: 'data', page: 'site-navigation', title: 'Mục menu khi zone bị gỡ', steps: 'Gắn một zone vào menu → Unpublish zone đó.', expect: 'Mục menu **lặng lẽ biến khỏi menu công khai**; dòng trong admin nói rõ.' },
      { id: 'CNT-11', p: 1, kind: 'happy', page: 'boosting', title: 'Đặt chỗ banner trọn vòng', steps: 'Tạo booking → tải creative đúng kích thước → xuất bản → xem trang công khai.', expect: 'Banner chạy đúng khoảng ngày, xoay theo chu kỳ của vùng.' },
    ],
  },

  /* ── G ─────────────────────────────────────────────────────────────────── */
  {
    id: 'ORG',
    module: 'Phân quyền — phòng ban, vai trò, tài khoản nhân viên',
    note: 'Nhóm này phải test bằng **tài khoản thật của từng vai trò**, không phải bằng HQ Admin rồi suy đoán.',
    cases: [
      { id: 'ORG-01', p: 1, kind: 'happy', page: 'departments', title: 'Cây hai tầng', steps: 'Tạo phòng ban → tạo team bên trong → thử tạo tầng thứ ba.', expect: 'Hai tầng; **không có tầng ba**.' },
      { id: 'ORG-02', p: 1, kind: 'refuse', page: 'departments', title: 'Xoá phòng ban còn team', steps: 'Xoá một phòng ban vẫn còn team.', expect: '**Bị từ chối**. Xoá hết team thì được, và **thành viên bị bỏ trống phòng ban**, không mất tài khoản.' },
      { id: 'ORG-03', p: 1, kind: 'data', page: 'departments', title: 'Parent không đổi được', steps: 'Tìm cách chuyển một team sang phòng ban khác.', expect: '**Không có thao tác move** — phải tạo mới, chuyển người, xoá cũ.' },
      { id: 'ORG-04', p: 1, kind: 'perm', page: 'departments', title: 'Leader không cấp quyền', steps: 'Đặt một người làm leader, **không** đổi vai trò. Đăng nhập bằng tài khoản đó.', expect: '**Không thấy thêm gì** so với trước.' },
      { id: 'ORG-05', p: 0, kind: 'perm', page: 'roles', title: 'Bỏ quyền Read là mất trang', steps: 'Bỏ tick Read một trang trên vai trò → đăng nhập lại bằng tài khoản giữ vai trò đó.', expect: 'Trang **biến khỏi menu** ở lần tải kế tiếp.' },
      { id: 'ORG-06', p: 1, kind: 'perm', page: 'roles', title: 'C/R/U/D độc lập', steps: 'Cấp **chỉ Create**, không Read, cho một trang.', expect: 'Tạo được nhưng **không đọc được danh sách** — Create **không bao hàm** Read.' },
      { id: 'ORG-07', p: 1, kind: 'perm', page: 'roles', title: 'Export tách khỏi Read', steps: 'Cấp Read nhưng **không** Export.', expect: 'Xem được danh sách, **không tải file ra được**.' },
      { id: 'ORG-08', p: 0, kind: 'refuse', page: 'roles', title: 'Không cấp được thứ mình không có', steps: 'Đăng nhập bằng một admin **không phải** HQ Admin → thử tick một quyền họ không giữ.', expect: '**Không cho**.' },
      { id: 'ORG-09', p: 0, kind: 'refuse', page: 'roles', title: 'Vai trò toàn quyền cuối cùng', steps: 'Thử xoá / tước quyền vai trò toàn quyền **cuối cùng**.', expect: '**Bị từ chối** — đây là thứ giữ cho console không khoá hết mọi người.' },
      { id: 'ORG-10', p: 1, kind: 'refuse', page: 'roles', title: 'Xoá vai trò đang có người giữ', steps: 'Xoá một vai trò 2 người đang giữ.', expect: '**Bị từ chối**, thông báo **kèm con số**.' },
      { id: 'ORG-11', p: 0, kind: 'perm', page: 'users', title: 'Ba mức phạm vi dữ liệu', steps: 'Một sales ở *chỉ của riêng họ*, một sales khác ở *team của họ*, cùng một team. Đăng nhập lần lượt.', expect: 'Người đầu thấy khách **của mình**; người sau thấy **của cả hai**.' },
      { id: 'ORG-12', p: 1, kind: 'perm', page: 'users', title: 'Chuyển team đổi tầm nhìn', steps: 'Chuyển một người sang team khác.', expect: 'Tầm nhìn "team" **chuyển sang bản ghi của team mới**.' },
      { id: 'ORG-13', p: 1, kind: 'refuse', page: 'users', title: 'Không sửa vai trò của chính mình', steps: 'Tự sửa vai trò của tài khoản đang đăng nhập.', expect: '**Bị từ chối** kèm thông báo.' },
      { id: 'ORG-14', p: 1, kind: 'refuse', page: 'users', title: 'Xoá người đã từng làm việc', steps: 'Xoá một tài khoản **đã tạo báo giá**. Rồi Deactivate chính người đó.', expect: 'Xoá **bị từ chối** (lịch sử phải sống); **Deactivate thì được**.' },
      { id: 'ORG-15', p: 1, kind: 'happy', page: 'users', title: 'Mời và đặt lại mật khẩu', steps: 'Mời một người → họ đặt mật khẩu → dùng Reset password trên tài khoản đó.', expect: 'Pending → Active. Reset: **đăng xuất ở mọi nơi**, dòng về **Pending**, nhận link mới.' },
      { id: 'ORG-16', p: 2, kind: 'refuse', page: 'users', title: 'Cooldown gửi lại lời mời', steps: 'Bấm Resend invite hai lần liên tiếp.', expect: 'Lần hai báo **chờ một lát** — cooldown 60 giây, không phải lỗi.' },
    ],
  },

  /* ── H ─────────────────────────────────────────────────────────────────── */
  {
    id: 'SYS',
    module: 'Hệ thống & vận hành',
    cases: [
      { id: 'SYS-01', p: 1, kind: 'data', page: 'master-data', title: 'Sửa master data lan ra mọi màn hình', steps: 'Đổi tên một giá trị master data → mở các màn hình đang dùng nó.', expect: 'Đổi theo ở **mọi nơi**.' },
      { id: 'SYS-02', p: 2, kind: 'happy', page: 'master-data', title: 'Tạo nhanh ngay trong dropdown', steps: 'Ở một ô chọn có master data, dùng tuỳ chọn tạo mới ngay tại chỗ.', expect: 'Giá trị mới dùng được ngay, và **có mặt trong trang master data**.' },
      { id: 'SYS-03', p: 0, kind: 'data', page: 'audit-log', title: 'Nhật ký ghi đủ hành vi nhạy cảm', steps: 'Lần lượt: đổi vai trò, mời người, khoá người, xoá, mở hồ sơ ứng viên, xuất file. Rồi mở Audit log.', expect: '**Mọi** việc trên đều có dòng, kèm **ai làm và lúc nào**.' },
      { id: 'SYS-04', p: 1, kind: 'perm', page: 'export-history', title: 'Xuất dữ liệu được ghi lại', steps: 'Xuất một danh sách rồi mở lịch sử export.', expect: 'Có dòng tương ứng; quyền Export **tách riêng** khỏi quyền đọc.' },
      { id: 'SYS-05', p: 2, kind: 'data', page: 'dashboard-sales', title: 'Dashboard khớp dữ liệu nguồn', steps: 'Đối chiếu vài con số trên dashboard với danh sách gốc.', expect: 'Khớp. Lệch thì ghi rõ lệch ở số nào.' },
      { id: 'SYS-06', p: 2, kind: 'data', page: 'call-logs', title: 'Tổng đài gắn đúng người', steps: 'Kiểm extension trên tài khoản nhân viên so với nhật ký cuộc gọi.', expect: 'Cuộc gọi **nối về đúng người** qua extension.' },
      { id: 'SYS-07', p: 2, kind: 'happy', page: 'notification-rules', title: 'Thông báo chạy', steps: 'Bật một quy tắc → tạo sự kiện kích hoạt → xem lịch sử gửi.', expect: 'Có bản ghi gửi, dùng đúng mẫu.' },
      { id: 'SYS-08', p: 1, kind: 'data', page: 'general-settings', title: 'Ngày giờ theo múi giờ Việt Nam', steps: 'Đối chiếu một mốc thời gian ở nhiều màn hình khác nhau.', expect: 'Mọi nơi hiện **cùng một giờ Việt Nam**, không lệch múi.' },
    ],
  },
]

export const ALL_CASES = SUITES.flatMap((s) => s.cases)
