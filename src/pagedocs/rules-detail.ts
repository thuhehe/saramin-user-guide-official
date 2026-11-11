import type { DocBlock } from '../docs'

/*
 * Rule chi tiết — the detail half of "Danh sách rules" (src/rules.ts).
 *
 * WHY HERE AND NOT THERE. The list page has to be readable in one sitting, so a
 * rule gets one line and four or five lines of summary there. Everything that
 * makes a rule arguable — the edge case, the error code, the date it changed, the
 * reason the obvious alternative was rejected — lives on the module's own Logic
 * page, where someone already reading about that module will meet it in context.
 *
 * THE CONTRACT WITH THE LIST. Every `heading` below must match a RuleEntry's
 * `heading` in src/rules.ts exactly, because the list's link is built from it
 * (anchorId of the heading). `npm run check:rules` fails the build if one drifts.
 *
 * These blocks are APPENDED to each module's existing blocks in docs.ts, so this
 * file never touches the pagedocs another slice owns.
 */

const h = (text: string): DocBlock => ({ kind: 'h', text })
const rule = (heading: string, items: string[]): DocBlock => ({ kind: 'list', heading, items })

const INTRO =
  'Phần này gom các rule của module, lấy từ những gì hai bên đã thống nhất và từ hành vi hệ thống đang chạy. Mỗi mục ở đây là chi tiết của một dòng trong **Danh sách rules** — mở từ đó sang sẽ rơi đúng vào mục.'

export const RULE_DETAIL: Record<string, DocBlock[]> = {
  'Resume management': [
    h('Rule chi tiết'),
    { kind: 'p', text: INTRO },

    rule('Rule — Bốn trạng thái CV và hai bước kiểm', [
      '**Saramin CV** (điền theo form): kiểm ngay khi nộp. Nút Lưu/Nộp bị khoá cho tới khi điền đủ trường bắt buộc, nên trên thực tế không có đường nào tạo ra một Saramin CV thiếu thông tin — nó **luôn** đạt Qualified.',
      '**CV tải lên** (PDF/Word): hệ thống bóc tách rồi kiểm **hai bước theo thứ tự**. Bước 1 — *Readable*: file mở được, không lỗi, không đặt mật khẩu; không đạt thì `Cannot Read`. Bước 2 — *đủ trường bắt buộc*: ứng viên chọn Experienced cần đủ cả Học vấn và Kinh nghiệm, chọn No experience chỉ cần Học vấn; không đạt thì `Not Enough Information`.',
      'Qua cả hai bước thì CV thành **Qualified** và đơn ứng tuyển chuyển sang *Sent*. Hai trạng thái nghi ngờ thì vào hàng đợi **In Review**, đơn giữ ở *Not Sent*.',
      '**Hệ thống không bao giờ tự từ chối CV.** Parse thiếu thông tin chỉ sinh ra một cảnh báo cho Admin. Chuyển sang `Rejected` luôn là thao tác của Operator/CS, kèm lý do và lời nhắn gửi ứng viên.',
      'Trong lúc CV chờ CS duyệt, ứng viên **vẫn dùng CV đó ứng tuyển được**, nhưng hồ sơ chưa tới tay NTD cho đến khi CV đạt Qualified.',
      'Ở phase này ứng viên **không nhìn thấy** trạng thái Not Enough Information — đây là quyết định riêng cho phase, không phải giới hạn kỹ thuật. Nhãn “Chưa được duyệt” chỉ xuất hiện khi CS chủ động từ chối, hoặc khi CS thu hồi một CV đã Qualified.',
    ]),

    rule('Rule — Một unlock trừ bao nhiêu, và trừ của ai', [
      'Một lần mở khoá trừ **đúng 1 quota**, cố định bằng CHECK trong database. Giá không thay đổi theo từng CV; endpoint cho phép ứng viên tự đặt giá CV của mình đã bị gỡ bỏ.',
      'Thao tác **idempotent theo cặp (CV, công ty)**: mở lại cùng một CV không bao giờ trừ lần hai, kể cả khi người dùng bấm nhiều lần hay hai tab cùng bấm.',
      'Admin mở khoá hộ thì tiêu credit của **công ty được chọn**, không phải của admin — admin không có số dư credit, công ty mới có. Thiếu số dư trả `409`.',
      'Đã mở khoá rồi thì dòng đó giữ `unlocked: true` kể cả khi ứng viên sau đó xoá tài khoản: credit đã tiêu, và nói ngược lại sẽ khiến giao diện mời mua lại lần nữa.',
    ]),

    rule('Rule — Gợi ý job và gợi ý ứng viên', [
      '“Tin tuyển dụng phù hợp” là gợi ý dựa trên **profile** của user. Kết quả tìm kiếm ở trang chủ thì hoàn toàn không liên quan profile — hai khối này hay bị so sánh với nhau và kết luận sai.',
      'Ngày 04/11 phía BB xác nhận khối gợi ý ứng viên **đang chưa có logic** và sẽ phải sửa lại. Trước đó đã hứa chia sẻ rule vào 03/11 nhưng chưa gửi.',
      'Hai điều kiện để hoàn thiện và test được: **data migration** (đã xong) và **master data** job category / industry (đang chờ phía khách). Sẽ test tổng thể trên Production.',
      'Các case đã ghi nhận để kiểm lại: chọn UI/UX Designer nhưng gợi ý chuyên viên thủ tục hải quan; profile QA/QC nhưng màn Onboarding không hiện job QA/QC dù production có.',
    ]),

    rule('Rule — Mô hình match score và nguồn skill gợi ý', [
      'Mô hình đã đề xuất: **một cổng cứng** lọc trước, phần còn lại chấm theo **thang 0–100 có trọng số**. Hai phía nhìn thấy hai thứ khác nhau — ứng viên và NTD không đọc cùng một con số.',
      'Skill gợi ý khi NTD tạo job và khi ứng viên tạo CV lấy theo **Job category cấp 3**. Skills hiển thị cả hai cách: ưu tiên related skill trước, bên dưới là các skill còn lại trong danh sách.',
      'Từ khoá khớp các trường **theo thứ hạng**, không ngang nhau. Có những trường chỉ dùng để lọc và không bao giờ được đánh index.',
      'Parse CV lấy **tối đa 20 skill** mỗi CV — cắt bớt chứ không từ chối, nên một CV parse ra bốn mươi skill vẫn vào được, chỉ giữ hai mươi.',
    ]),

    rule('Rule — Che thông tin liên hệ và cờ unlocked', [
      'Caller phạm vi **global** nhận dữ liệu thật. Caller phạm vi **company** hoặc **own** bị che ở phía server, bất kể client làm gì — nên không có cách nào xem trộm bằng devtools.',
      'Khi CV chưa unlock, `fullName` trả về **`null`**, không phải chuỗi che kiểu `N***** T** H**`. Màn hình hiển thị `Ứng viên #{alias}`. Chuỗi che cũ vẫn để lộ chữ cái đầu và số từ trong tên nên đã bỏ.',
      '**Trạng thái khoá chỉ đọc từ cờ `unlocked`**, không bao giờ suy ra từ việc thiếu field — `fullName` vẫn là một key có mặt, chỉ mang giá trị null.',
      'Những thứ **không** bị khoá, vì đó mới là thứ để NTD quyết định có đáng trả tiền hay không: headline, địa điểm, số năm kinh nghiệm, vị trí mong muốn, hai việc gần nhất, học vấn, skills, mức lương mong muốn.',
    ]),

    rule('Rule — Giới hạn số CV và cách đếm', [
      '**Mỗi ứng viên tối đa 20 Saramin CV và 20 Upload CV — tổng 40 CV.** Hai hạn mức **riêng biệt**, mỗi loại đếm riêng, không cộng gộp thành một con số 20 chung.',
      'Tách riêng từng loại là vì Phase 1 **không cho xoá CV** và **không chuyển đổi được** giữa Saramin CV và Upload CV. Một hạn mức gộp sẽ khiến ứng viên đầy Upload CV rồi không tạo nổi Saramin CV nào, mà cũng không có đường gỡ.',
      '**Chạm giới hạn của một loại** thì ứng viên không tạo hoặc upload thêm loại đó được nữa, phải **Edit** một CV cũ cùng loại. Trường hợp đã vượt ngưỡng từ trước là edge case, để **Phase 2** xử lý.',
      '⚠️ **Build chưa khớp.** Hạn mức 20 cho Saramin CV đã đúng (migration V806 — và nó đếm số Saramin CV chứ không đếm résumé, sửa lỗi cũ khiến ứng viên có 18 Saramin CV bị từ chối cái thứ 19). Nhưng **thư viện Upload CV đang không giới hạn**: hạn mức 10 file cũ đã bị gỡ hẳn cùng hạn mức 10 bản parse. Cần thêm lại hạn mức 20, và lần này đặt trên **cả bản parse** — lần trước bỏ nửa vời nên CV thứ 11 upload được rồi nằm đó không có nội dung nào được bóc tách.',
      'Dòng text trên giao diện Quản lý CV hiện còn ghi *“There is no limit on how many CVs you keep”* và *“preview, download or delete”* — cả hai đều sai với Phase 1, cần sửa.',
    ]),

    rule('Rule — Cách tính tổng số năm kinh nghiệm', [
      '**Saramin CV**: theo lựa chọn của ứng viên ở popup “Sửa tổng số kinh nghiệm” — *Nhập trực tiếp* thì lấy đúng số đã nhập, *Tự động tính* thì cộng từ lịch sử làm việc.',
      '**CV tải lên**: **luôn** tự động tính từ lịch sử làm việc, không sửa tay được.',
      'Cách cộng: tính cả tháng bắt đầu và tháng kết thúc, “Present” tính đến tháng hiện tại. Có tick **“Exclude overlapping periods”** (mặc định) thì khoảng trùng chỉ tính một lần; bỏ tick thì cộng dồn.',
      'Khoảng thời gian ghi ngược — ví dụ “2014 – 2012” — bị coi là **không hợp lệ và bỏ qua cả job đó**, nên tổng sẽ thiếu đi đúng khoảng ấy. Đây là nguyên nhân của một bug đã báo: CV ra 12 năm 11 tháng thay vì 14 năm 11 tháng.',
      'Số năm nhập ở **Onboarding** auto-fill vào tổng khi tạo CV đầu tiên; sau đó ứng viên sửa được. CV tiếp theo auto-fill từ CV được cập nhật gần nhất.',
      'Thời gian hiển thị cạnh **từng công việc** chỉ là thời gian của công việc đó, không phải tổng — hay bị đọc nhầm.',
    ]),

    rule('Rule — Bài test tính cách và giới hạn một tháng', [
      'Mỗi tài khoản được cấp **một mã** từ Saramin Hàn Quốc. Muốn làm lại thì phải cấp mã khác — và mã khác thì hệ thống coi như **chưa từng làm bài**, nên lịch sử bài test cũ không còn hiển thị.',
      'Ở luồng bình thường: tháng này làm có dữ liệu, tháng sau quay lại làm thì dữ liệu cũ **vẫn hiển thị**. Chỉ khi cấp mã mới để làm sớm hơn hạn thì mới mất lịch sử.',
      '**Ngày làm bài lấy từ database phía Hàn**, không chỉnh được từ phía mình — kể cả để test. Muốn lùi ngày về một tháng trước để thử lại thì không có đường.',
      'Muốn làm nhiều lần mà vẫn giữ lịch sử thì phải hỏi team Saramin Hàn xem có tài liệu cho việc đó không, rồi mới implement thêm được.',
    ]),



    rule('Rule — Migrate Open to work sang chọn CV', [
      'Hệ thống cũ bật Open to work cho **cả tài khoản**; hệ thống mới thì ứng viên chọn **từng CV** để hiển thị trong Talent pool.',
      'Khi tìm thấy ứng viên, hệ thống cũ cho NTD xem **CV Latest** — và “Latest” ở đây nghĩa là **CV dùng để ứng tuyển gần nhất**, không phải CV tạo mới nhất hay CV sửa gần nhất.',
      'Quy tắc migrate đã chốt: đang bật Open to work → bật hiển thị cho CV dùng để ứng tuyển gần nhất; chưa từng ứng tuyển **hoặc CV đó đã bị xoá** → lấy CV cập nhật gần nhất; không có CV nào → không bật, coi như đang tắt.',
      'Đang tắt Open to work → không bật hiển thị CV nào.',
    ]),

    rule('Rule — CV chưa hoàn thiện sau khi migrate', [
      'Theo quy tắc mới, CV chỉ lên Talent pool khi đạt **Qualified**.',
      'CV được chọn hiển thị mà sau migrate còn thiếu kinh nghiệm hoặc học vấn thì **vẫn giữ lựa chọn hiển thị**, nhưng **chưa lên Talent pool** cho tới khi ứng viên bổ sung đủ và được duyệt.',
      'Khi đó trang Quản lý CV hiện thông báo để ứng viên biết cần sửa gì, và ứng viên **đổi sang CV khác hoặc tắt hiển thị bất cứ lúc nào**.',
      'Trên thẻ CV chỉ giữ **một nút “Chỉnh sửa”**: với CV tải lên thì Chỉnh sửa chính là tải file mới (tạo version mới), với Saramin CV thì là bổ sung thông tin. Muốn tải CV khác đã có nút ở đầu trang — thêm nút “Tải CV mới” ngay đây sẽ tạo một CV riêng và ứng viên lại phải chọn lại CV hiển thị.',
      '❓ Chưa chốt: số lượt ứng tuyển và lượt NTD đã xem **từ nền tảng cũ** có được migrate và đếm vào thẻ CV hay không.',
    ]),
  ],

  'Application management': [
    h('Rule chi tiết'),
    { kind: 'p', text: INTRO },

    rule('Rule — Hai trục trạng thái và thứ tự đè', [
      '**CV status** và **Application status** là hai trục riêng, hiển thị riêng. Một đơn có thể có CV đang chờ duyệt trong khi đơn vẫn nằm ở Not Sent.',
      '**Đơn chỉ tới được công ty sau khi CV đã duyệt.** Trước đó nó ở Not Sent dù ứng viên đã bấm nộp — đây là lý do số đơn ứng viên thấy và số đơn công ty thấy có thể lệch nhau.',
      'Đổi tên trạng thái so với tài liệu cũ: dùng **“Application Received”** cho việc NTD nhận CV, **không** dùng “Screening”. Toàn bộ các vòng ở giữa do NTD tự tạo gọi chung là **“In Process”**, không gán cứng là “Interviewing”.',
      '**Logic đè trạng thái:** ở cột nhận hồ sơ, NTD mở xem thì thành *Application Viewed*, tải file thì thành *Application Saved*. Từ cột thứ hai trở đi, **trạng thái Pipeline luôn đè lên** — khi ứng viên đã vào Pipeline thì NTD xem hay tải lại CV không làm đổi trạng thái hiển thị nữa.',
      '**Kanban chuẩn:** cột đầu cố định (Nhận hồ sơ), các cột giữa linh hoạt do NTD tự thêm bớt sửa, hai cột cuối cố định là **Passed** và **Not this time**.',
      'Màn Applications trên Admin gác bằng quyền **job**, không phải `application` — nên không có resource `application` trong cấu hình quyền và không nên thêm.',
    ]),

    rule('Rule — Phần trăm khớp và ý nghĩa của null', [
      'Con số phần trăm khớp giữa profile ứng viên và JD trên màn hình apply **chưa làm trong phase 1** — đã chốt là Phase 2.',
      'Ở phía Admin, `matchScore: null` nghĩa là **tin tuyển dụng không nêu yêu cầu nào để chấm**, không phải “khớp 0%”. Hiển thị nhầm `null` thành `0` biến một hồ sơ chưa chấm thành một hồ sơ bị loại.',
      '`coreSections` là mẫu số và nó do backend gửi xuống — không bao giờ hardcode ở phía giao diện.',
      'Với dòng của ứng viên đã xoá tài khoản thì không gọi API chấm điểm: nó đọc từ CV, và CV đã bị khoá, nên sẽ trả về lỗi.',
    ]),

    rule('Rule — Giới hạn ứng tuyển hàng loạt', [
      'Một lần **batch apply tối đa 5 job**, theo Saramin Hàn — không phải tất cả job có trong popup.',
      'Email gợi ý việc làm gửi sau khi ứng tuyển hàng loạt lấy theo **job cuối cùng được chọn**, vì mỗi job có skill và khu vực khác nhau nên phải chọn một job gốc.',
      'Khối gợi ý trong email: **tối đa 4 job**, **có loại trừ** job ứng viên đã ứng tuyển và tin đã hết hạn, và **không đủ việc phù hợp thì ẩn cả khối** chứ không hiện số ít hơn.',
      'Tiêu đề email giữ là **“Bạn đã ứng tuyển thành công”**, không dùng “Hồ sơ của bạn đã được gửi đến Nhà tuyển dụng” — vì hồ sơ có thể còn đang chờ kiểm duyệt CV, và câu sau sẽ gây hiểu nhầm khi CV bị từ chối.',
    ]),
  ],

  'Job management': [
    h('Rule chi tiết'),
    { kind: 'p', text: INTRO },

    rule('Rule — Vòng đời tin tuyển dụng và luồng duyệt đã gỡ', [
      'Trạng thái: **Draft · Scheduled · Open · Closed · Expired**, cùng ba thao tác **Reopen**, **Duplicate** và **Warranty**.',
      '**Luồng duyệt job đã bị gỡ bỏ** (svn-be V468, 09/09): không còn hàng đợi duyệt, và trạng thái **Archived không còn tồn tại**. Công ty tự publish là tin lên thẳng.',
      '⚠️ `REVIEW` **vẫn là một JobStatus** và trang chi tiết vẫn render nút Approve/Reject, nhưng không còn luồng nào đẩy job vào đó — nhìn màn hình sẽ tưởng tính năng còn chạy.',
      '**Không có xoá job.** Endpoint xoá không tồn tại trên backend, không có nút xoá trên giao diện, và resource `job` không được cấp quyền `delete`.',
      '**Reopen**: chỉ nội bộ thực hiện trên Admin portal, cho sửa bình thường toàn bộ thông tin job. Nếu chỉ bấm Reopen mà không sửa gì thì **giữ nguyên End date đặt ban đầu** — job publish 1/10 hạn 30/10, đóng ngày 15/10, mở lại ngày 20/10 thì hạn vẫn là 30/10. Job đã đóng **đúng hạn** thì không Reopen được, chỉ Duplicate và Warranty. Không gửi thông báo cho ứng viên đã quan tâm.',
      '**Bảo hành job khác Reopen**: bảo hành là hỗ trợ khách re-post tin đó với **ID mới hoàn toàn**. Tính năng đã thống nhất là sẽ có nhưng **chưa làm**. Warranty job chỉ lọc ra product **free thuộc type Job Posting**, không gồm placement free hay manual service free.',
      '**Exposure là công tắc riêng**, độc lập với trạng thái job. Khi job còn đang Scheduled thì được phép đổi **tất cả** thông tin, và đổi thời gian publish thì End date phải đổi theo.',
      'Công ty post job free mà **không có hoá đơn và gói đăng tin** thì nút Publish bị **disable**, chỉ được Save draft.',
    ]),

    rule('Rule — Posting ladder và thao tác Respace', [
      'Ladder rank quyết định **job của sản phẩm nào hiển thị trên sản phẩm nào** — Top Job trên Distinction, Distinction trên Basic plus, rồi Basic, rồi Free.',
      '**Số rank lớn nhất đứng vị trí cao nhất.**',
      'Áp dụng ở **Job search results** và các trang **Jobs by category / industry / location**.',
      '**“Respace the ladder”** tính lại số thứ tự cho chẵn — 7, 8, 10 thành 10, 20, 30 — vì trong quá trình thêm bớt số có thể bị lẻ. Thứ tự không đổi, nhưng **giá trị mới được ghi ngược lại vào Product**, chứ không chỉ đổi cách hiển thị.',
      'Trước đây thứ hạng set cứng theo sản phẩm; nay có setting này để linh hoạt hơn.',
    ]),

    rule('Rule — Hai khối gợi ý job và quy tắc không trùng', [
      '**“Các công việc tương tự”** = job giống job đang xem. **“Gợi ý việc làm”** = job liên quan đến CV của ứng viên.',
      '**Ưu tiên hiển thị “Các công việc tương tự”** theo logic của nó; job nào đã hiện ở đó thì **không hiện lại** ở “Gợi ý việc làm”.',
      'Nếu đổi “Các công việc tương tự” thành “Việc làm cùng công ty” thì phải biết đánh đổi: mục đầu **luôn** có job để hiện, còn “cùng công ty” mà có **ít hơn 3 job thì không hiển thị gì cả**.',
      'Dưới khối Similar jobs có dải tag từ khoá: tổng hợp từ khoá của một job để user click sang trang tìm kiếm của từ khoá đó và tiếp tục explore — cách hoạt động tương tự Vietnamworks.',
    ]),

    rule('Rule — Nguồn gợi ý của ô tìm kiếm', [
      'Gợi ý lấy **2 kết quả từ Master data (Job categories) + 2 từ Công ty + 2 từ Jobs**. Group nào thiếu kết quả thì bù thêm từ group khác cho **đủ 6**.',
      'Thứ tự trong mỗi group theo **độ phù hợp** với từ khoá đã gõ hoặc dán vào.',
      'Nếu từ khoá **không khớp master data** thì **tắt hẳn popup gợi ý** — không hiện dòng “No suggestions for X — press Enter to search”, vì nó làm người dùng tưởng không có kết quả tìm kiếm nào. Đây cũng là behavior của Saramin Hàn hiện tại.',
      'Việc **mở rộng phạm vi tìm kiếm** ra ngoài master data đang pending vì ảnh hưởng performance; sẽ bàn lại sau khi migration dữ liệu xong.',
    ]),

    rule('Rule — Giới hạn trên form tin tuyển dụng', [
      '**Job title**: dài quá **120 ký tự** thì không hiển thị hết ở cả Job detail lẫn Job list, và Job detail chỉ hiện **tối đa 3 dòng**. Không nên cho gõ dài hơn mức hiển thị được.',
      '**Job level**: multi-select, **tối đa 3** giá trị.',
      '**Dải lương một phía là hợp lệ** — “Từ 15 triệu” là một tin đăng đúng. Đơn vị tiền có VND và USD, nhưng **USD chỉ là đơn vị hiển thị**.',
      '**Work type và Contract type là hai field khác nhau** — giữ đúng hai bảng của khách, không gộp.',
      '**Benefits của job bắt đầu là bản sao bộ benefits của công ty**, sau đó sửa tự do cho riêng job đó.',
      '**Working locations chỉ để hiển thị**, không dùng để xác định job thuộc thành phố nào khi tìm kiếm — việc đó là của field **Location** riêng. Địa chỉ lúc tạo công ty là **địa chỉ xuất hoá đơn**, khác hẳn.',
      '**Contact person trên job tách biệt với contact person của công ty trên CRM** và không sync ngược: contact CRM là người Sale liên hệ để bán, contact trên job là người trực tiếp tuyển dụng.',
    ]),
  ],

  Users: [
    h('Rule chi tiết'),
    { kind: 'p', text: INTRO },

    rule('Rule — Bốn trạng thái tài khoản và cửa sổ 72 giờ', [
      '**Active · Deactivated · Deleted · Erased.**',
      '**Deactivate là rút lui, không phải xoá.** Tài khoản ngừng hoạt động, CV rời CV search ngay, nhưng đơn đã gửi vẫn ở lại phía NTD. Đơn đang xử lý bị rút và công ty nhận **thông báo rút đơn thường**, không phải thông báo xoá tài khoản. Thời gian lưu dữ liệu theo quy định pháp luật chứ không theo thời điểm bấm nút.',
      '**Delete là cửa một chiều.** Dòng tài khoản giữ vĩnh viễn — chính nó giữ chỗ địa chỉ email, nên **email đó không bao giờ đăng ký lại được**, kể cả qua Google, Facebook, LinkedIn hay GitHub.',
      '**Khôi phục chỉ làm được trong 72 giờ** và chỉ HQ admin mới làm được. Job quét chạy **mỗi 5 phút** và lấy mọi tài khoản sẽ quá 72 giờ trước lần chạy kế tiếp — nên thực tế cửa sổ khôi phục là 72 giờ trừ tối đa 5 phút. Hiển thị mốc này là “xoá trước ngày…”, không phải “xoá lúc…”.',
      'Trạng thái độc lập với hiển thị CV: tắt hiển thị CV không làm tài khoản ngừng hoạt động, và ngược lại.',
    ]),

    rule('Rule — Nền pháp lý cho xoá dữ liệu cá nhân', [
      '**Policy 09-21**, mục c: “Xử lý khi có yêu cầu rút đơn ứng tuyển, xoá CV hoặc xoá tài khoản từ phía ứng viên”. Bản tiếng Anh có mục tương ứng là “CV Deletion”.',
      '**Nghị định 356/2025** đặt thời hạn xử lý yêu cầu rút đồng ý và yêu cầu xoá dữ liệu là **20 ngày**.',
      'Các điều cần Legal phía khách xác nhận: **Luật Bảo vệ dữ liệu cá nhân 2025** Điều 25 khoản 1 (dữ liệu trong tuyển dụng), Điều 14 (xoá, huỷ dữ liệu), Điều 10 (rút lại sự đồng ý); **Nghị định 356/2025** Điều 5 khoản 2 và 4, Điều 6 (cách thể hiện và lưu bằng chứng sự đồng ý).',
      '❓ **Chưa chốt: thời hạn lưu CV đã nộp sau khi đơn kết thúc.** Luật yêu cầu xoá khi không còn tuyển dụng, trừ khi có thoả thuận khác. Saramin Hàn lưu **90 ngày kể từ ngày tin tuyển dụng hết hạn** — BB đề xuất lấy mốc này.',
      'Điều kiện để giữ được bản CV đã nộp: cập nhật policy và pop-up để ứng viên được thông báo rõ, và ứng viên vẫn phải có đường yêu cầu xoá toàn bộ dữ liệu.',
    ]),

    rule('Rule — Xoá tài khoản, cửa sổ khôi phục và lần quét xoá', [
      'Xác thực để xoá: **nhập mật khẩu**. Quên mật khẩu thì đặt lại qua link gửi về email rồi quay lại; tài khoản chỉ có social thì re-auth với nhà cung cấp. Mã Zalo **không còn dùng** cho việc này (chốt 11/11).',
      'Ứng viên chọn **lý do xoá** từ danh sách mã có sẵn, kèm ghi chú tự do không bắt buộc. Lý do được **giữ lại sau lần quét xoá** để làm thống kê; ghi chú tự do thì bị xoá.',
      'Sau khi xoá thành công: mọi refresh token bị thu hồi, phiên chết ngay lập tức, và trình duyệt được chuyển sang trang “tài khoản đã xoá”.',
      '**Lần quét xoá huỷ**: hồ sơ (số điện thoại, ngày sinh, giới tính, headline, ảnh đại diện), mọi CV đã parse, thư viện CV và file — kể cả bản đóng băng đã gửi cho công ty — câu trả lời onboarding, token đăng nhập và đặt lại mật khẩu, lịch sử duyệt và gợi ý, tuỳ chọn email, thành viên talent pool, và **ghi chú cùng sao đánh dấu mà công ty viết về người đó**.',
      '**Sống sót**: dòng tài khoản với địa chỉ thay bằng token một chiều; đơn ứng tuyển công ty đã nhận (de-link, giữ trạng thái và ngày); CV công ty **đã trả tiền** unlock, dưới dạng bản rỗng ruột — xoá hẳn sẽ làm bản ghi trừ credit trỏ vào hư không; và các bản ghi đồng ý, trừ thông tin thiết bị.',
    ]),


    rule('Rule — Zalo OTP khi đăng ký', [
      '**Chỉ dùng cho bước đăng ký**, và **chỉ gửi qua số điện thoại.** Kênh EMAIL cùng cơ chế dự phòng “gửi mail khi mã không tới” đã bị gỡ bỏ.',
      'Tài khoản **không có số trên hồ sơ** thì không lấy được mã. Deployment **không có nhà cung cấp Zalo**, hoặc lần gửi không đi được, thì trả 503.',
      'Người dùng phải **gõ lại chính số của mình** để xin mã; sai số thì bị từ chối trước cả bước đếm ngược và hạn mức gửi, nên gõ nhầm không tốn gì.',
      'Mã sống **180 giây**; nút gửi lại bật sau **60 giây**. Mã không bao giờ nằm trong response. Nhập sai nhiều lần thì số bị khoá, mở lại phải nhờ team kỹ thuật.',
      '**Mọi ứng viên đều phải verify số điện thoại qua Zalo khi đăng ký**, kể cả người nước ngoài — checkbox “I live abroad” đã bỏ hẳn, và **email thì không verify**. Đây là đảo ngược so với đề xuất ngày 05/10.',
      '⚠️ **Từ 29/10, Zalo không còn dùng cho đổi mật khẩu và xoá tài khoản** — xem mục dưới.',
    ]),

    rule('Rule — Xác thực khi đổi mật khẩu và xoá tài khoản', [
      '**Xoá tài khoản: xác nhận bằng MẬT KHẨU.** Không dùng mã Zalo nữa.',
      '**Quên mật khẩu thì đi đường email:** luồng quên-mật-khẩu gửi một **link đặt lại về email**, link sống **1 giờ** và **dùng một lần**; đặt lại xong thì quay lại thao tác xoá. Chính việc mở được link là bằng chứng kiểm soát hòm thư.',
      '**Tài khoản chỉ đăng nhập bằng social** (Google / Facebook / LinkedIn / GitHub, chưa từng đặt mật khẩu) thì **re-auth với nhà cung cấp** — đó là yếu tố duy nhất họ có.',
      'Nhập sai mật khẩu **5 lần trong 24 giờ** thì khoá, dùng chung bộ đếm với đường mã cũ; nhập đúng một lần là xoá bộ đếm. Trước SRM-1254 mật khẩu sai không hề bị giới hạn.',
      '⚠️ **Build chưa gỡ đường Zalo.** `/auth/delete/password/verify` đã có từ 29/10 (SRM-1254) và luồng quên-mật-khẩu bằng link email cũng đã về cùng ngày — hai phần đó khớp. Nhưng `/auth/delete/otp` và `/auth/delete/otp/verify` **vẫn đang phục vụ**, và tài liệu FE của backend vẫn mô tả mã Zalo là đường chính. Cần gỡ endpoint và sửa tài liệu trước go-live 21/11, nếu không vẫn còn một đường xoá tài khoản mà rule đã bỏ.',
    ]),

    rule('Rule — Migrate mật khẩu từ hệ thống cũ', [
      'Trên saramin.vn hiện tại: **company user có mật khẩu**, còn **jobseeker đăng ký bằng social login nên không có mật khẩu** — trang đăng ký jobseeker chỉ cho Social login.',
      'Nhưng trong database **vẫn có** một số user jobseeker đăng nhập bằng email và mật khẩu. Số lượng không nhiều, nhưng vẫn phải test luồng reset password khi chuyển sang hệ thống mới.',
      'Cách tạo case test: đăng ký bằng social rồi dùng AMS set mật khẩu cho tài khoản đó.',
      'Bộ tài khoản cần để test: 3 company user, 3 jobseeker có số điện thoại, 3 jobseeker không có số điện thoại.',
    ]),
  ],

  CRM: [
    h('Rule chi tiết'),
    { kind: 'p', text: INTRO },

    rule('Rule — Ba trạng thái xác minh công ty', [
      '**Not verified · Waiting to verify · Verified.**',
      'Khách hàng **chỉ sửa được** thông tin công ty khi còn ở hai trạng thái đầu. Một khi đã **Verified** thì mọi field chuyển sang chỉ đọc với phía NTD, và chỉ Admin sửa được.',
      'Đây là rule hay bị hỏi lại nhất khi NTD gọi lên CS phàn nàn không sửa được thông tin công ty.',
      'Giao diện trang Account information và Company information làm lại theo Saramin Hàn, nhưng **chỉ copy giao diện — field thì dựa trên field CRM của mình**. ❓ Chưa chốt: field nào CRM có mà Sale muốn bỏ (ví dụ Company vision), và field nào Saramin Hàn có mà CRM đang thiếu (ví dụ Company Home page).',
    ]),

    rule('Rule — Chuỗi chứng từ và các mốc hết hạn', [
      '**Quotation → PO → Invoice**, mỗi bước tạo ra từ bước trước, đi một chiều.',
      '**Quotation chỉ sửa được khi chưa xuất PO.** PO thì **không cho sửa**, và **không có thao tác huỷ trên PO**.',
      'Huỷ tác động lên **chứng từ thuế**, không lên đơn: huỷ invoice xong thì PO vẫn đọc là *Issued invoice*, chỉ kèm ghi chú.',
      '**PO hết hạn vào cuối tháng, không phải 30 ngày trượt** — issued 05/07 và 28/07 cùng hết hạn 31/07. Một dòng có thể đọc là *Active* dù đã qua cuối tháng, vì trạng thái do một job định kỳ lật chứ không tính lại lúc đọc.',
      'Thao tác đụng vào **quota đã tiêu** — job đã đăng, CV đã mở — trả `409`.',
      '**Chỉ Sales owner** của công ty mới tạo được báo giá và xuất PO.',
    ]),

    rule('Rule — Khi nào PO và hoá đơn chuyển Overdue', [
      '**PO phải xuất hoá đơn chính thức rồi mới có trạng thái Overdue.** Sau khi xuất, Unpaid đủ **30 ngày** mới chuyển Overdue.',
      '**PO chưa xuất hoá đơn thì cuối tháng tự động Expire** — tạo PO ngày 29/11 mà chưa xuất hoá đơn thì ngày 30/11 PO đó expire.',
      '**Expected payment date chỉ báo ngày mã QR hết hạn.** Nó **không** quyết định Overdue.',
      'Hoá đơn ở trạng thái **Draft** hoặc **Invoice request** — tức chưa xuất chính thức — thì giữ Unpaid và không chuyển Overdue.',
      '⚠️ Rule này đã đổi ba lần trong bảy ngày đầu tháng 11. Có lúc Dev sửa thành “Overdue khi quá Expected payment date” vì task viết như vậy; đã chốt lại và yêu cầu đưa về bản cũ ngày 04/11. Requirement đúng nằm ở task SRM-1080.',
      '**Invoice khi Partially paid vẫn in full tiền**: payment status và invoice không liên quan nhau, trên invoice không thể hiện payment status. Trường hợp này rất ít xảy ra và luôn xuất hoá đơn toàn phần.',
    ]),

    rule('Rule — Ngưỡng duyệt chiết khấu, VAT và luồng 0 đồng', [
      'Ngưỡng cấu hình là **10**. **Total discount của báo giá trên 10% → Sales manager duyệt; từ 10% trở xuống → Sales lead duyệt.**',
      'Hệ thống chỉ có **một VAT rate duy nhất** — không có Mixed VAT, dù tài liệu kỹ thuật ban đầu có nhắc tới.',
      '**Không có trường hợp báo giá chỉ gồm sản phẩm quà tặng.**',
      '**Luồng 0 đồng vẫn chạy đầy đủ**: vẫn tạo PO và Invoice 0 đồng, và vẫn có bước confirm payment 0 đồng. CRM cũ thì có báo giá 0đ nhưng không xuất hoá đơn — hệ thống mới khác ở chỗ này.',
      '❓ Chưa chốt từ 17/09: một line product có quantity lớn hơn 5 thì **cả đơn** mất chiết khấu 50%, hay chỉ line đó. Đã hỏi Sales hai lần, chưa có trả lời.',
    ]),

    rule('Rule — Huỷ hoá đơn, quota và EasyInvoice', [
      'Theo nguyên tắc **không cho huỷ hoá đơn đã xuất**; nhưng nếu bất khả kháng thì **quota bị inactive ngay khi huỷ**.',
      'Trên CRM hoá đơn mang trạng thái mới **Cancelled**. Thao tác này chỉ kế toán làm được, bắt buộc nhập lý do, và không hoàn tác được.',
      '**Bên EasyInvoice trạng thái KHÔNG được cập nhật theo** — kế toán phải tự sang EasyInvoice điều chỉnh theo nguyên tắc kế toán. Lý do: EasyInvoice không có thao tác huỷ, phải điều chỉnh hoặc thay thế khá phức tạp và đòi hỏi nắm rõ luồng, trong khi số case thực tế không nhiều.',
      '**BB không build thêm gì cho việc đồng bộ này** — đây là hành vi có chủ đích, không phải thiếu sót. Đã thông báo cho kế toán phía khách.',
      'Job định kỳ của nhà cung cấp chỉ **gắn cờ** hoá đơn đã bị thay thế, điều chỉnh hay huỷ trên cổng — phát hiện thôi, cả hai chiều đều thủ công.',
    ]),

    rule('Rule — Giới hạn tích hợp Callio', [
      '**Callio không có endpoint nào để quay số**, nên trên console không có nút gọi. `tel:` cũng **cố tình không** dùng làm phương án dự phòng.',
      'Việc **ghép cuộc gọi với công ty được thử lại** ở mỗi lượt chiếu — 10 phút một lần, hoặc khi bấm Sync. Nên một cuộc gọi chưa ghép được hôm nay có thể tự ghép sau khi contact của công ty được lưu.',
      '**Archive** đưa một cuộc gọi đang chờ ra khỏi hàng đợi khi đó không phải việc của sales (spam, gọi nhầm). Có thể Archive hàng loạt.',
      'Số điện thoại trong cuộc gọi được **copy** để người dùng tự dán sang máy gọi; nếu một số khớp nhiều công ty thì nhân viên tự chọn.',
    ]),

    rule('Rule — Kiểm tra mã số thuế khi tạo công ty', [
      '**Bản 01/10 (đã thống nhất):** bỏ verify MST ở phía company user. Verify **chỉ để tham chiếu** trên Admin; thành công hay không **không cản trở** Admin tạo công ty hay company user tạo tài khoản. Nút Verify vẫn giữ trên Admin, verify không ra thì admin tự check lại trên trang tra cứu.',
      'Lý do bỏ ràng buộc: **API tra MST cập nhật không kịp** — công ty thành lập hôm nay hoặc hôm qua sẽ verify không ra, nên ràng buộc theo kết quả sẽ chặn nhầm công ty thật.',
      '**Bản 02/11 (đề xuất, chưa confirm):** bắt buộc kiểm tra MST trước khi tạo công ty, chỉ cho tạo khi kết quả là “Đang hoạt động”, và nếu API chưa cập nhật thì admin chờ thêm khoảng một ngày rồi kiểm lại.',
      '⚠️ Hai bản nói **ngược nhau**, và lý do bỏ ràng buộc hồi tháng 10 vẫn còn nguyên. tran.nguyen chưa confirm bản mới. Nếu siết lại thì phải có đường đi cho công ty mới thành lập.',
    ]),

    rule('Rule — Logo công ty và mục Quy định', [
      'Cách chỉnh logo sau khi upload đã đổi: phải **crop sát trên dưới trái phải** của logo, để khi hiển thị có thể canh giữa hay canh trái đều được.',
      'Một file, **hai khung cố định**, kích thước đã tinh chỉnh để đứng cạnh logo của công ty khác không bị lệch.',
      'Mục **“Quy định”** của doanh nghiệp: **email tuyển dụng là trường bắt buộc** để employer điền và hiển thị ở đó.',
      '**Không hiển thị contact person và số điện thoại** — chỉ hiện tên công ty và email công ty. Field contact person đã **bỏ hẳn**, chỉ còn “Human Resources Department”.',
      'Thông tin công ty ở trang settings chỉ hiển thị ở **Báo giá và Invoice**, không ở đâu khác.',
    ]),
  ],

  'Product settings': [
    h('Rule chi tiết'),
    { kind: 'p', text: INTRO },

    rule('Rule — Quota vào ví ở thời điểm nào', [
      '**Quota chỉ vào ví khi admin xác nhận đã nhận tiền**, không phải lúc công ty bấm mua.',
      'Thấy `Credits: 0` ngay sau khi đặt mua thường là **đơn còn chờ thanh toán**, không phải lỗi ví. Vì vậy màn hình số dư phải hiện **trạng thái đơn** bên cạnh con số — người vừa trả tiền mà thấy 0 sẽ tưởng mất tiền.',
      '**Chỉ hoá đơn GTGT ở trạng thái Issued mới cấp quota.** Báo giá được chấp nhận, PO đã tạo, hoá đơn nháp — đều chưa cấp gì. Và trạng thái thanh toán là chuyện riêng: hoá đơn Issued là cấp, kể cả khi khách chưa trả.',
      '`creditAmount` là công tắc quyết định một product có phải gói credit hay không: **0** là sản phẩm bán thường, **≥1** là mua xong được cấp đúng ngần ấy lượt mở CV khi đơn được xác nhận. Không có cờ “đây có phải bundle không” riêng.',
      '**Type của product quyết định hoá đơn giao cái gì** — lượt đăng tin, credit mở CV, một khung ngày trên vùng banner, hay lượt dịch vụ giao tay. Chọn sai Type là giao sai thứ, âm thầm, và chỉ lộ ra lúc phát hành hoá đơn.',
    ]),

    rule('Rule — Hai mốc thời gian của gói CV search', [
      '**Activation period** tính từ thời điểm **xuất hoá đơn**. **Validity period** (còn gọi là Usage period) tính từ thời điểm **activate gói**.',
      '**Cả hai đều hết hạn vào cuối ngày 23:59.**',
      'Ví dụ đã chốt: xuất hoá đơn 9/11/2026 → activation period 9/11/2026 – 9/11/2027. Activate ngày 9/11/2027 → validity period 9/11/2027 – 9/2/2028.',
      '**Chỉ gói CV search có bước Activate**; mọi sản phẩm khác không có. Gói CV search có bốn trạng thái, và trạng thái thứ tư là trạng thái làm mất tiền của khách.',
      '⚠️ Đang mở: hiện hệ thống **không có “Invoice expiration date”**, chỉ có “Activation expiration date” cho từng sản phẩm. Thu đã nêu cần rà lại điểm này, chưa có kết luận.',
    ]),

    rule('Rule — Placement, Premium 10 ngày và khối Recommended', [
      'Job basic có lên trang chủ hay không **hoàn toàn phụ thuộc placement** đã set cho product đó.',
      'Section **Premium jobs chỉ hiển thị job trong 10 ngày đầu** kể từ khi đăng. Với dữ liệu cũ, section sẽ trông như thiếu job dù job vẫn còn hiệu lực — đây là nguyên nhân chứ không phải thiếu job.',
      'Khối **Recommended job khi chưa đăng nhập** cũng là một **placement lấy từ Products**, không phải thuật toán gợi ý. Tiêu đề lấy từ Saramin Hàn và đổi được.',
      'Placement của vùng banner **không phải** cùng một thứ với placement quyết định bậc tin của một job cụ thể — hai khái niệm trùng tên.',
      '**Product đã lên một hoá đơn thì bị khoá** phần nó bán. Muốn bán khác đi thì tạo product mới và chuyển product cũ sang Inactive — nên các thay đổi placement thường đi kèm việc tạo lại sản phẩm và map lại.',
    ]),
  ],

  'Service delivery': [
    h('Rule chi tiết'),
    { kind: 'p', text: INTRO },

    rule('Rule — Share quota và lý do đang tạm ẩn', [
      'Rule đã thống nhất: chỉ cần trong setting có **share quota với công ty thụ hưởng** thì công ty thụ hưởng được **toàn quyền** sử dụng các hoá đơn mà công ty tài trợ đang có.',
      'Nếu công ty có **hoá đơn dùng riêng** thì ưu tiên hiển thị **trên** hoá đơn được chia sẻ. “Hoá đơn dùng riêng” nghĩa là hoá đơn được tạo tại thời điểm công ty có setting share với công ty khác.',
      '**Đang tạm ẩn ở phase này** theo yêu cầu phía khách: ẩn bảng Share quota trên Products & Billing, ẩn bảng Shared with other Companies, và ẩn checkbox Split usage by company. Lý do khách đưa ra: “chưa có rule, cần thời gian design lại Rule”.',
      '**Tính năng vẫn còn nguyên trong build** — chỉ không hiển thị và không test ở phase này. Phase tới nếu đổi requirement thì làm tiếp.',
      '❓ Chưa chốt và sẽ cần khi mở lại: chi nhánh vừa có gói Search CV riêng vừa được công ty mẹ chia sẻ thì **trừ gói nào trước**. BB đề xuất trừ gói riêng trước, hết mới sang gói chia sẻ, và hiện rõ sẽ trừ gói nào trước khi mở CV. Hỏi 12/10, chưa có trả lời.',
    ]),
  ],

  Content: [
    h('Rule chi tiết'),
    { kind: 'p', text: INTRO },

    rule('Rule — Giới hạn banner và cách rotation chạy', [
      'Hai cột dễ nhầm trên màn Placement: **ITEMS SHOWN** là số banner **có thể upload** — không giới hạn, với mọi loại banner. **NUMBER OF SLIDES** là số banner **hiển thị cùng lúc**; hết lượt thì rotation đẩy ảnh ở hàng chờ lên.',
      'Lỗi báo “3 of 4 / full slot” khi publish banner thứ tư là **bug**, đã sửa và push lên dev ngày 30/10.',
      'Mỗi vùng còn có `concurrentSlots` — bao nhiêu booking được chồng lên nhau, **NULL đọc là 1** — và `rotationSeconds` quyết định sau bao lâu vùng đó xáo lại.',
      '**Kích thước banner lấy trực tiếp từ Admin ▸ System ▸ Placements**, không theo tài liệu hướng dẫn: tài liệu không cập nhật chính xác.',
      '`creativeWidth` và `creativeHeight` hiện **NULL trên mọi vùng**, và NULL ở đây có nghĩa riêng chứ không phải chưa điền.',
    ]),

    rule('Rule — Giới hạn ảnh và nơi được chèn ảnh', [
      '**Mỗi ảnh upload tối đa 20MB, không cần resize trước.** Hệ thống tự chuyển sang **WebP** cho nhẹ, kể cả ảnh nhỏ, nên hiển thị nhanh mà không bị vỡ.',
      'Ảnh chèn trong câu trả lời FAQ và Thông báo hiển thị đầy đủ trên trang Customer center, cả bản Cá nhân lẫn Doanh nghiệp.',
      '**FAQ ở Company information thì không chèn được ảnh hay bảng** — theo Saramin Hàn, đó là dạng hỏi đáp nhanh cần text gọn, khác Help center trên trang jobseeker vốn là dạng bài viết có thể kèm hình.',
      '**Image gallery** là kho ảnh Admin upload sẵn theo Categories image. Khi post job có card artwork thì có **hai lựa chọn — chọn ảnh trong kho hoặc tự upload — không ràng buộc nhau**. Bắt buộc upload từ máy dù đã chọn từ gallery là bug. Gallery **chỉ dùng cho post job có card artwork**, không dùng chỗ nào khác.',
    ]),

    rule('Rule — Những khu vực set cứng theo Saramin Hàn', [
      'Section trên **Employer home** và các card ở giữa đều **set cứng**, follow Saramin Hàn. Chỉ user đăng nhập bằng tài khoản Employer mới thấy section này.',
      '**Footer** của cả trang jobseeker lẫn trang employer giữ theo thiết kế hiện tại của Saramin Hàn.',
      '**Bảng màu lấy trực tiếp từ CSS đang chạy trên saramin.co.kr** nên khớp 100%: Brand `#2D67FF`, Success `#00BE4C`, Warning `#FF9A03`, Error `#FF5656`, Info `#02C6FF`, cùng các dải gray / blue / coral 10–120. Tên biến giữ đúng như bên Hàn.',
      'Muốn đổi những khu vực này — ví dụ chuyển Benefit section sang rich text — thì **phải được CEO confirm trước**, vì đó là cam kết đồng bộ giao diện với Saramin Hàn.',
    ]),

    rule('Rule — Những trang đang tạm ẩn ở phase này', [
      '**Salary & Insight**: tạm ẩn, **không xoá**. Ẩn qua Content ▸ Navigation. Team phía khách sẽ thu thập dữ liệu rồi triển khai sau, và đã đề xuất vài event liên quan tới trang này.',
      '**Dropdown phía jobseeker**: tạm ẩn “Salary Insight”, tắt “Quản lý hồ sơ”, bổ sung “test tính cách”.',
      '**Trang tạo product động**: làm **sau** ngày launch 14/11. Hiện set cứng trước, và cần requirement rõ trước khi làm — Sale yêu cầu vì tháng nào cũng có product mới nên set cứng rất bất tiện.',
      '**Share quota**: ẩn ở Products & Billing, xem mục của module Service delivery.',
      'Cách ẩn thống nhất là **tắt trong setting Navigation**, không xoá trang — để bật lại được mà không cần build lại.',
    ]),
  ],

  Organisation: [
    h('Rule chi tiết'),
    { kind: 'p', text: INTRO },

    rule('Rule — Mô hình quyền theo trang', [
      'Một role là **tập quyền trên các trang** của console, dựng từ một bộ permission ngắn — không phải cây 30 checkbox.',
      '**Thứ tự setup bắt buộc**: phòng ban trước, người sau, role sau cùng.',
      '**Role do team quản lý** chứ không tập trung một đầu mối.',
      '`role.code` **bất biến sau khi tạo**: sinh ra từ tên, cắt xuống 64 ký tự, và hậu tố chống trùng (`_2`, `_3`) nằm **trong** giới hạn đó — tên dài là tên bình thường, không phải lỗi. `name` tối đa 255, `description` tối đa 1024, vượt thì 400 kèm giới hạn trong thông báo.',
      '**Operator và company user là hai dân số tách biệt** — không dùng chung bảng, không dùng chung role.',
    ]),

    rule('Rule — Trần quyền khi cấp và khi gán', [
      '**Không ai cấp được quyền mà chính mình không có** khi thay bộ quyền của một role — kiểm theo từng tuple, vi phạm trả 403.',
      '**Không gán được role chứa quyền mình không có** — nhưng chỉ xét trên các role **được thêm**, không xét toàn bộ payload. Nên gỡ bớt một role của người đang giữ quyền cao hơn mình vẫn làm được.',
      '**Quyền phạm vi `company` hoặc `own` không gán được cho role GLOBAL** (403).',
      '`permissionId` không tồn tại trong request là **400**, không âm thầm bỏ qua. Cả hai route thay toàn bộ đều **bắt buộc gửi danh sách** — gửi thiếu là 400 nêu tên field, muốn xoá sạch thì gửi `[]` tường minh.',
      '**Xoá role thì cascade quyền của nó nhưng không cascade người đang giữ** — khoá ngoại là RESTRICT, nên còn người giữ là chặn thật chứ không phải cảnh báo.',
    ]),

    rule('Rule — Ẩn thay vì báo lỗi, và quyền của màn Applications', [
      '**Không có quyền thì ẩn khỏi giao diện, không báo lỗi.** Áp dụng cho cả nút lẫn cả trang: user được set quyền nào thì chỉ nhìn thấy quyền đó.',
      'Trước đây hệ thống vẫn hiện nút rồi báo lỗi permission khi bấm, gây nhầm lẫn — đã đổi và push lên dev ngày 23/10.',
      'Màn **Applications** gác bằng quyền **`job`**, không phải `application` — nên không có resource `application` trong cấu hình quyền và **không nên thêm**.',
      'Riêng các thao tác trên dòng gác bằng quyền của CV review: **Approve / Reject** bằng `cv_review:decide`, **Recall** bằng `cv_review:recall` ở phạm vi `all`.',
    ]),

    rule('Rule — Data reach và đề xuất bỏ nó', [
      '**Sale member** chỉ thấy công ty của mình, **Sale leader** thấy công ty của cả team, **Sale manager** thấy tất cả.',
      'Phạm vi này quyết định luôn **ai tạo được báo giá cho công ty nào**: mở công ty ngoài phạm vi thì không có nút Create quotation, và mở thẳng link tạo báo giá thì khi lưu sẽ bị chặn.',
      'Bug đã xác nhận: màn **chọn công ty** khi tạo quotation **không lọc theo data reach**, nên chọn được công ty ngoài phạm vi rồi mới bị chặn lúc lưu. Đang sửa để chỉ chọn được công ty có quyền.',
      '**Ẩn tab “My team’s”** nếu user không thuộc phòng ban nào; **ẩn tab “Mine”** nếu không sở hữu công ty nào.',
      '⚠️ **Đề xuất chưa chốt (28/10):** bỏ hẳn setting Data reach. Lý do: trước đây có nó để sale chỉ xem được công ty của mình, nhưng nay sale nào cũng xem được công ty của mọi người và đã có bộ lọc Mine / My team / All, còn quyền tạo báo giá thì luôn thuộc về Sales owner nên không cần set. Chưa ai confirm, nên hai cơ chế vẫn tồn tại song song.',
    ]),
  ],

  System: [
    h('Rule chi tiết'),
    { kind: 'p', text: INTRO },

    rule('Rule — Quy tắc Code và phạm vi trùng', [
      '**Code chỉ cần không trùng trong cùng một cấp cha.** Level 1 và Level 2 trùng code là hợp lệ vì chúng là hai cấp khác nhau.',
      '**Code là bắt buộc** — nó là ID để map dữ liệu — nhưng hệ thống **tự sinh từ `Name_EN`**, nên màn hình bắt nhập tay là bug.',
      '**Không phải tab nào trong Master data cũng có Import/Export Excel.** Tab ít giá trị hoặc nhiều cấp thì sửa trực tiếp trên màn hình nhanh hơn. Phần import được làm kỹ cho **Job Taxonomy** và **Industries**.',
      'File import nên có **cột đánh dấu trường nào bắt buộc** để người nhập biết đường — VI và EN đang là bắt buộc.',
    ]),

    rule('Rule — Quy tắc file import Master data', [
      '**Mục đã có sẵn thì điền Code; mục mới thì để trống Code** — cả Group Code lẫn Item Code — và hệ thống tự tạo.',
      '⚠️ **Dùng code của Group cũ nhưng đổi tên thì hệ thống hiểu là ĐỔI TÊN Group cũ**, không phải tạo nhóm mới. Đây là chỗ dễ làm hỏng dữ liệu nhất: các dòng con vẫn ghi tên cũ sẽ bị báo không khớp, và bấm Apply lúc đó sẽ đổi tên cả nhóm.',
      '**Import dòng trùng với dữ liệu đã có** thì không tạo bản trùng — hệ thống nhận ra là mục cũ và hiển thị số lượng dữ liệu bị coi là trùng, sẽ không thay đổi.',
      'Tự đặt code không có trong hệ thống là nguyên nhân phổ biến của lỗi import.',
    ]),

    rule('Rule — Ngôn ngữ của master data và nội dung', [
      '**Chỉ còn tiếng Anh và tiếng Việt.** Ngôn ngữ phía Jobseeker chỉ có hai, nên cột tiếng Hàn đã bỏ khỏi cả giao diện lẫn file import.',
      'Với mọi field nội dung: **VI bắt buộc, EN trống thì fallback về VI.**',
      'Riêng **mô tả sản phẩm**: tiếng Việt bắt buộc, tiếng Anh không bắt buộc ở mức validation — nhưng **cần EN để báo giá hiển thị song ngữ**, nên thực tế vẫn phải điền. Tài liệu workflow từng ghi Optional, đã sửa.',
      'Các field trên form job cũng theo nguyên tắc song ngữ per-field, có tab ngôn ngữ riêng cho từng trường.',
    ]),

    rule('Rule — Cấu trúc taxonomy và các danh sách chọn', [
      'Mỗi **Job category** có nhiều **Job group cấp 2**, gồm Job roles, Specializations, Work tools.',
      '**Onboarding và Work preference cho user chọn hết các mục cấp 2**, theo cách Saramin Hàn làm — không chỉ chọn job roles.',
      '**Skills quản lý theo từng dòng Job category cấp 3**, để khi NTD tạo job và ứng viên tạo CV thì hệ thống đề xuất được skill liên quan.',
      '**Job taxonomy là master data, không phải chữ tự gõ.** **Benefits cũng là danh sách chọn**, không phải đoạn văn. **Working location là một văn phòng có tên**, lưu trên công ty và dùng lại cho các job sau.',
      '**Industry selection**: cho phép chọn ở level 1, hoặc 2, hoặc 3 — không bắt buộc xuống level 3. ❓ Chưa chốt: giới hạn số industry được chọn (flow cũ cho tối đa 3), và cách tính khi chọn cả một nhánh cấp 2.',
    ]),

    rule('Rule — Những gì cố tình không port từ admin cũ', [
      'Wizard 9 nhóm của AMS, bộ **52 field “meta wizard”** của Saramin Hàn, **pipeline AI giả** (parse → extract → tag → generate chỉ là setTimeout với kết quả cứng), và các **số liệu bịa ra từ hash** — tất cả đã **bỏ hẳn chứ không stub**.',
      'Lý do và danh sách đầy đủ ghi trong `docs/warnings.md` của repo admin. Nguyên tắc chung: thà không có còn hơn có một màn hình trông như chạy mà không chạy.',
      '⚠️ **Hệ quả cần biết**: sửa một job cũ qua form mới sẽ **làm mất meta blob cũ** mà job đó còn mang — đây là quy tắc recompose của backend (gửi `description` mà không gửi `meta` thì `meta` bị xoá). Điều này được cảnh báo bằng banner trong drawer sửa chứ không giấu.',
      'Một số route còn tồn tại nhưng đã rút khỏi menu; mở được bằng link trực tiếp từ trang cha.',
    ]),

    rule('Rule — Bản chốt của Job category và Industry', [
      '**Bản Job category v1.2** đã được duyệt thì **giữ nguyên** — đây là bản chốt.',
      '**Skills hiển thị cả hai cách**: ưu tiên related skill trước, bên dưới là các skill còn lại trong danh sách.',
      '**File Industry bản 29/10 là bản chốt**, sau khi sửa **15 tên tiếng Anh dịch máy sai** từ tiếng Hàn — ví dụ 여신 (cấp tín dụng) bị dịch thành “goddess”, 제지 (sản xuất giấy) thành “restraint”, 조합 (liên hiệp) thành “mixture”.',
      '❓ Còn mở: 53 kỹ năng có chứa dấu “/” — có thể là hai kỹ năng gộp làm một — chưa xác nhận có tách ra hay không.',
    ]),
  ],

  Notifications: [
    h('Rule chi tiết'),
    { kind: 'p', text: INTRO },

    rule('Rule — Nhịp gửi email cho ứng viên', [
      '**Không gửi email lẻ mỗi lần đổi trạng thái.** Ứng viên nhận **một** email tổng hợp cuối tuần, gồm bốn nhóm: Đã gửi đến NTD, NTD đã lưu, Đang xử lý, Không phù hợp.',
      'Trang **“Việc đã ứng tuyển”** thì cập nhật **real-time** — đó mới là nơi ứng viên theo dõi, email chỉ là bản tóm tắt.',
      'Tiêu đề email xác nhận ứng tuyển giữ là **“Bạn đã ứng tuyển thành công”**, không dùng “Hồ sơ của bạn đã được gửi đến Nhà tuyển dụng” — vì hồ sơ có thể còn đang chờ kiểm duyệt CV, và câu sau sẽ gây hiểu nhầm khi CV bị từ chối.',
      'Khối **“Bật trạng thái đang tìm việc”** trong email đổi thành **“Hiển thị CV với nhà tuyển dụng”** (hệ thống mới không còn Open to work), và **chỉ hiện cho ứng viên chưa bật hiển thị CV nào**.',
      '❓ Chưa chốt: email **JS 7** (Mời ứng viên quay lại) và **JS 8** (Xoá tài khoản thành công) chưa có thiết kế mới.',
    ]),

    rule('Rule — Rule thông báo thêm được gì và không tắt được gì', [
      'Backend **luôn** ghi vào feed trong ứng dụng; một rule thông báo chỉ có quyền **thêm kênh** gửi, **không có quyền tắt** kênh nào.',
      '**Gửi thủ công chỉ hỗ trợ EMAIL** — ba kênh còn lại trả 400, vì in-app cần đổi schema trước.',
      '**Event code là contract của backend.** Không còn catalog sự kiện trên Admin để sửa; backend tự validate.',
      'Mỗi event **cố định một loại người nhận**: Jobseeker, Company hoặc Admin.',
      '`active` là một boolean, thay cho bộ bốn trạng thái DRAFT / PAUSED / ARCHIVED trước đây.',
    ]),

    rule('Rule — Email thông báo xoá tài khoản', [
      'Gửi cho **mọi công ty đang giữ dữ liệu** của ứng viên: công ty mà HQ **đã gửi đơn** tới (dù đơn nay ở trạng thái nào), và công ty có **lượt unlock CV còn hiệu lực**. Công ty mà HQ chưa bao giờ gửi đơn thì không được báo.',
      'Trong mỗi công ty, người nhận là **mọi thành viên có quyền quản lý ứng viên** — tin tuyển dụng không có chủ sở hữu là company user nên không có người nào hẹp hơn để chọn.',
      '**Một email cho mỗi công ty cho mỗi lần xoá, không bao giờ gửi hai lần.** Nếu HQ khôi phục rồi ứng viên xoá lại thì đó là một lần xoá mới và các công ty được báo lại.',
      'Nội dung mang: tên và email ứng viên như công ty đã thấy, thời điểm yêu cầu, **căn cứ pháp lý**, bảng các đơn của chính công ty đó kèm kết quả, dòng riêng nếu công ty đã mở khoá CV qua CV Search, và yêu cầu ngừng dùng dữ liệu, ngừng liên hệ, **xoá mọi thứ đã nhận qua Saramin bao gồm cả CV**.',
      '**Operator sửa được wording trong catalogue template nhưng không tắt được** — đây không phải workflow rule mà là nghĩa vụ pháp lý.',
    ]),

    rule('Rule — Hành vi của chuông thông báo sau khi xoá', [
      'Các dòng thông báo loại **xoá tài khoản** và **xoá CV** trỏ tới đơn đã rời board hoặc đã bị ẩn danh, nên **chỉ link về board**, không deep-link vào modal ứng viên.',
      'Mỗi người nhận có **một dòng cho mỗi đơn được liệt kê**, và tên ứng viên **luôn là rỗng** — tên chỉ nằm trong email.',
      'Các dòng **“có đơn mới” cũ** của cùng ứng viên vẫn giữ chỗ nhưng **mất tên kể từ thời điểm xoá**, không phải sau 72 giờ.',
      '**HQ khôi phục tài khoản không trả lại tên** cho các dòng cũ — tên đã bị bỏ khi ứng viên yêu cầu được quên, và khôi phục là hành động của HQ chứ không phải một sự đồng ý mới.',
      'Công ty chỉ có lượt unlock mà chưa từng nhận đơn thì **chưa có dòng chuông nào** — feed hiện yêu cầu phải có job và đơn.',
    ]),

    rule('Rule — Song ngữ và xưng hô trong email', [
      'Thiết kế Figma để phần tiếng Anh dạng **thu gọn / mở rộng**, nhưng **Gmail chặn tương tác đó** nên nút sẽ không hoạt động.',
      'Vì vậy phần tiếng Anh **luôn hiển thị sẵn** bên dưới phần tiếng Việt, và nhãn “English Below” chỉ còn là **đường phân cách**, không bấm được. Áp dụng cho tất cả email ứng viên (JS) và nhà tuyển dụng (CO).',
      'Xưng hô: **“Dear Quý khách hàng & Tên công ty (full legal name)”**, dù gửi một hay nhiều địa chỉ.',
      'Giao diện chung — font, màu, header, footer — áp dụng cho toàn bộ template.',
      'Trạng thái PO **không** hiện trong email gửi khách: Active, Invoice requested, Issued invoice, Expired, Draft invoice đều là trạng thái nội bộ. **Mã QR không nằm trong trình soạn email** — backend gắn vào lúc gửi — và **không in QR lên PO PDF** vì QR có thể hết hạn.',
    ]),
  ],
}
