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


    rule('Rule — Xoá tài khoản, cửa sổ khôi phục và lần quét xoá', [
      'Xác thực để xoá: **nhập lại mật khẩu**, hoặc **re-auth với nhà cung cấp** nếu tài khoản chỉ đăng nhập bằng social. Tài khoản quyết định dùng yếu tố nào, không phải người dùng chọn. Quên mật khẩu thì đặt lại qua link gửi về email rồi quay lại. Mã Zalo **không còn dùng** cho việc này (chốt 11/11).',
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
      '**Xoá tài khoản luôn đòi chứng minh lại danh tính** — phiên đang đăng nhập không đủ. Đây là điểm khác căn bản so với *Deactivate*, vốn chỉ cần đang đăng nhập.',
      '**Tài khoản CÓ mật khẩu → phải nhập lại mật khẩu đó.** **Tài khoản chỉ đăng nhập bằng social** (Google / Facebook / LinkedIn / GitHub, chưa từng đặt mật khẩu) **→ re-auth với nhà cung cấp**, bằng một lần đăng nhập mới.',
      '⚠️ **Chính tài khoản quyết định dùng yếu tố nào, không phải client chọn.** Tài khoản đã có mật khẩu thì **không** được thay bằng social login. Lý do ghi thẳng trong code: nếu cho chọn, một phiên bị chiếm quyền có thể đi vòng qua đúng cái yếu tố mà chủ tài khoản đang nắm.',
      'Không đưa yếu tố nào thì **403** và **tài khoản không bị đụng tới**. Mật khẩu sai trả lỗi riêng; sai **5 lần trong 24 giờ** thì khoá, dùng chung bộ đếm với đường mã cũ, và nhập đúng một lần là xoá bộ đếm. Trước SRM-1254 mật khẩu sai không bị giới hạn lần nào.',
      '**Một bằng chứng là đủ, đó là toàn bộ cánh cổng** (chốt 28/09). Trước đó mỗi nhánh còn đòi thêm một hòm thư đã xác thực, nhưng yêu cầu đó không bảo vệ điều gì — địa chỉ chưa xác thực được giải phóng khi quét xoá, chỉ địa chỉ đã xác thực mới giữ chỗ — trong khi một tài khoản đăng ký nhầm địa chỉ thì không còn đường tự xoá.',
      '**Quên mật khẩu là luồng riêng, đi bằng email:** gửi một **link đặt lại về hòm thư**, link sống **1 giờ** và **dùng một lần**; đặt lại xong thì quay lại thao tác xoá. Chính việc mở được link là bằng chứng kiểm soát hòm thư. Từ 29/10 một tài khoản đã xác thực điện thoại cũng được gửi mail — trước đó thì không.',
      '⚠️ **Build chưa gỡ đường Zalo.** `/auth/delete/otp` và `/auth/delete/otp/verify` vẫn đang phục vụ, và `requireFreshProof` còn thử `otpTicket` **trước** cả hai yếu tố trên. Tài liệu FE của backend vẫn mô tả mã Zalo là đường chính. Cần gỡ endpoint và sửa tài liệu trước go-live 21/11, nếu không vẫn còn một đường xoá tài khoản mà rule đã bỏ.',
      'Zalo **vẫn giữ ở bước đăng ký** — mọi ứng viên vẫn phải xác thực số điện thoại khi tạo tài khoản.',
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

    rule('Rule — Placement và khối Recommended', [
      'Job basic có lên trang chủ hay không **hoàn toàn phụ thuộc placement** đã set cho product đó.',
      'Khối **Recommended job khi chưa đăng nhập** cũng là một **placement lấy từ Products**, không phải thuật toán gợi ý. Tiêu đề lấy từ Saramin Hàn và đổi được.',
      'Placement của vùng banner **không phải** cùng một thứ với placement quyết định bậc tin của một job cụ thể — hai khái niệm trùng tên.',
      '**Product đã lên một hoá đơn thì bị khoá** phần nó bán. Muốn bán khác đi thì tạo product mới và chuyển product cũ sang Inactive — nên các thay đổi placement thường đi kèm việc tạo lại sản phẩm và map lại.',
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


    rule('Rule — Những trang đang tạm ẩn ở phase này', [
      '**Salary & Insight**: tạm ẩn, **không xoá**. Ẩn qua Content ▸ Navigation. Team phía khách sẽ thu thập dữ liệu rồi triển khai sau, và đã đề xuất vài event liên quan tới trang này.',
      '**Dropdown phía jobseeker**: tạm ẩn “Salary Insight”, tắt “Quản lý hồ sơ”, bổ sung “test tính cách”.',
      '**Trang tạo product động**: làm **sau** ngày launch 14/11. Hiện set cứng trước, và cần requirement rõ trước khi làm — Sale yêu cầu vì tháng nào cũng có product mới nên set cứng rất bất tiện.',
      '**Share quota**: ẩn bảng Share quota, bảng Shared with other Companies và checkbox Split usage by company trên Products & Billing. Tính năng còn nguyên trong code, chỉ không hiện và không test ở phase này.',
      'Cách ẩn thống nhất là **tắt trong setting Navigation**, không xoá trang — để bật lại được mà không cần build lại.',
    ]),
  ],



}
