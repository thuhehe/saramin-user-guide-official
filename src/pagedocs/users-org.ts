import type { PageDoc, ModuleDoc } from '../docs'

/*
 * Users (jobseeker-users, company-users) + Organisation (departments, users, roles).
 *
 * Every claim re-checked on 08/10/2026 against origin/dev:
 *   saramin-vn-admin 45954108 · svn-be ee1db5ea9 · svn-web d8a43a11 (PR #633 merge).
 * Each entry is a full replacement for PAGE_DOCS[key]; existing text kept where still true.
 */

export const USERS_ORG_PAGE_DOCS: Record<string, PageDoc> = {
  'jobseeker-users': {
    logic: [
      '**Một trạng thái tài khoản quyết định mọi cánh cửa phía ứng viên**: đăng nhập được không, ứng tuyển được không, nhà tuyển dụng có tìm thấy họ không.',
      '**Một mã, một quy tắc kênh.** Mọi bước nhạy cảm — tạo tài khoản, đặt lại mật khẩu, xoá tài khoản — được xác nhận bằng **mã 6 số**. Lúc đăng ký mã **luôn đi qua Zalo tới số điện thoại**; quên mật khẩu và xoá tài khoản thì chọn được email.',
      '**Tài khoản chỉ ra đời khi mã được nhập xong** — không có tài khoản “nửa vời”. Vì vậy **trạng thái đầu tiên một tài khoản từng có là Active**. Server vẫn có 4 giá trị (`ACTIVE` · `INACTIVE` · `DEACTIVATED` · `DELETED`) hiện thành 5 nhãn, nhưng *Chưa xác thực* (`INACTIVE`) giờ **chỉ còn sinh ra từ nút Create của HQ**.',
      '**Deactivated là KHOÁ CỬA, không phải thùng rác** — hồ sơ còn nguyên, mở lại được. Nhưng ở bản dựng, khoá **có rút các đơn đang xử lý** (khác Notion — xem §4).',
      '**Delete là cánh cửa một chiều duy nhất.** Dữ liệu cá nhân bị huỷ **trong vòng 72 giờ**, email đã xác thực **không bao giờ dùng lại được**, và HQ chỉ khôi phục được **trước khi lần huỷ chạy**.',
      '**Phase 1 (go-live 21/11/2026):** xoá tài khoản **không rút đơn** — NTD thấy dòng *“Tài khoản đã bị xóa”* nhưng không mở được CV, kể cả CV đã unlock; ứng viên **không xoá được CV** (§5).',
    ],
    how: [
      'Lọc theo tab trạng thái (**All · Active · Deactivated · Deleted**), tìm theo email hoặc tên; lọc thêm theo **cách đăng nhập** và **khoảng ngày đăng ký**.',
      'Mở một tài khoản để xem chi tiết — **lần mở được ghi audit** (`candidate.read`) kèm tên người thao tác.',
      'Tài khoản **Active** → **Deactivate** (lý do không bắt buộc, nhưng nên ghi) hoặc **gửi link đặt lại mật khẩu**.',
      'Tài khoản **Deactivated** hoặc **Withdrawn** → **Reactivate** từ trang chi tiết (với Withdrawn thì làm khi chính ứng viên yêu cầu).',
      'Tài khoản **Deleted** → **Restore**, **chỉ bật khi lần huỷ chưa chạy**. Tra / gỡ chặn email ở tab Deleted.',
    ],
    watch: [
      'Một tài khoản **Active mà CV đang ẩn** là trạng thái **bình thường** — công tắc hiển thị CV độc lập hoàn toàn với trạng thái tài khoản.',
      'Lý do nhập khi khoá là **ghi chú nội bộ, ứng viên không bao giờ thấy**.',
      '**Khoá rút các đơn đang xử lý, và mở lại KHÔNG trả chúng về.** Đừng khoá “thử” một ứng viên đang có đơn.',
      '**Khoá một người KHÔNG từ chối CV của họ.** Muốn gỡ CV khỏi vòng duyệt nữa thì đó là **một quyết định thứ hai, riêng biệt** ở màn hình CV review — hộp thoại khoá chỉ nhắc, nó không tự làm hộ.',
      'Lần huỷ đã chạy thì **không còn gì để khôi phục** — đó là thiết kế, không phải lỗi.',
    ],
    blocks: [
      {
        kind: 'table',
        heading: 'Module này gồm những trang nào',
        note: 'Ba trang đầu nằm ở **Jobseeker site** — HQ không thao tác ở đó, nhưng phải hiểu chúng để trả lời ứng viên.',
        cols: ['Site', 'Trang', 'URL', 'Quy định điều gì'],
        rows: [
          ['Jobseeker', 'Sign up · Sign in', '`/auth/sign-up` · `/auth/sign-in`', 'Tài khoản được tạo, xác thực và đăng nhập thế nào'],
          ['Jobseeker', 'Forgot password', '`/auth/forgot-password`', 'Lấy lại mật khẩu — và cách một tài khoản chỉ có social **có được** mật khẩu'],
          ['Jobseeker', 'Trung tâm hỗ trợ → tab Xoá tài khoản (cũng mở từ Account information)', '`/ho-tro/xoa-tai-khoan` (cũ: `/help/withdraw`)', 'Xoá tài khoản (vĩnh viễn) — quy tắc Phase 1 ở §5'],
          ['Admin', 'Jobseeker users', '`/users/jobseekers`', 'Danh sách: tìm, trạng thái, thao tác hỗ trợ'],
          ['Admin', 'Tab **Deleted** (trước là trang Deleted accounts)', '`/users/jobseekers?status=DELETED`', 'Hồ sơ các tài khoản đã kết thúc; khôi phục khi lần huỷ chưa chạy'],
        ],
      },

      /* §1 */
      { kind: 'h', text: '§1 · Tạo tài khoản', path: '/auth/sign-up' },
      {
        kind: 'table',
        heading: '1.1 Hai đường vào, một bản ghi',
        cols: ['Đường', 'Danh tính tới từ đâu', 'Ứng viên còn phải gõ', 'Xác nhận bằng'],
        rows: [
          ['Email + mật khẩu', 'Ứng viên tự gõ', '9 field · mật khẩu · đồng ý điều khoản', 'Mã OTP qua **Zalo** tới số điện thoại'],
          ['Social — Google · Facebook · LinkedIn · GitHub', 'Nhà cung cấp trả về email đã xác thực, hiện ở dạng khoá. **Nhà cung cấp không trả email** thì ứng viên gõ vào một ô thường', 'Cùng 9 field ở bước hoàn tất — **số điện thoại luôn trống**, vì không nhà cung cấp nào trả về', 'Cùng quy tắc OTP'],
        ],
      },
      {
        kind: 'list',
        items: [
          'Hai đường **kết thúc ở cùng một bản ghi**. Đăng ký social mà bỏ dở bước hoàn tất **không phải là một lượt đăng ký** — không tạo gì, không đếm gì.',
          '**Một email, một tài khoản.** Đăng nhập social bằng một email đã có (và đã xác thực) thì **gắn nhà cung cấp vào tài khoản cũ, không hỏi mã** — không bao giờ tạo tài khoản thứ hai.',
        ],
      },
      {
        kind: 'table',
        heading: '1.2 Chín field',
        note: 'Học vấn (8) và kinh nghiệm (9) chỉ hỏi **con số tổng** — trường học và công việc cụ thể kể trong CV. Nguyện vọng (vị trí, lương, nơi làm) hỏi sau ở onboarding. Mỗi bước một nhóm.',
        cols: ['#', 'Field', 'Vì sao hỏi ở đây'],
        rows: [
          ['1', 'Họ tên — **một ô**, không tách họ/tên', 'Tên nhà tuyển dụng đọc'],
          ['2', 'Email', 'Khoá định danh'],
          ['3', 'Số điện thoại (+84)', 'Thứ nhà tuyển dụng thực sự gọi — và nơi mã OTP được gửi tới'],
          ['4', 'Quốc tịch', '“Người nước ngoài” mở câu hỏi giấy phép lao động'],
          ['5', 'Giới tính', ''],
          ['6', 'Tình trạng hôn nhân', ''],
          ['7', 'Ngày sinh', ''],
          ['8', 'Học vấn cao nhất', 'Chỉ con số tổng'],
          ['9', 'Số năm kinh nghiệm', 'Chỉ con số tổng'],
        ],
      },
      {
        kind: 'warn',
        text:
          'Bảng chín field trên Notion **chỉ có 6 dòng** (thiếu Tình trạng hôn nhân, Học vấn, Kinh nghiệm, và đánh số Ngày sinh là 6). Danh sách đầy đủ ở trên lấy từ requirement `jobseeker-user`.',
      },
      {
        kind: 'table',
        heading: '1.3 + 1.4 Mã OTP — quy tắc giống nhau ở mọi nơi mã xuất hiện',
        cols: ['Quy tắc', 'Giá trị', 'Ứng viên thấy gì'],
        rows: [
          ['Kênh lúc đăng ký', '**Zalo (tin ZNS) tới số điện thoại** — mọi trường hợp, kể cả social', 'Ở Việt Nam số điện thoại là danh tính nhà tuyển dụng dùng; tin Zalo tới tay người thật, không phải hộp thư'],
          ['Mã', '6 số', 'Gõ vào một ô'],
          ['Hiệu lực', '**3 phút**', 'Đồng hồ đếm ngược; tải lại trang thì đếm lại — nên mời *Gửi lại* thay vì giả vờ mã cũ còn chạy'],
          ['Gửi lại', 'Sau **60 giây**; tối đa **3 lần gửi** mỗi mã', 'Nút bị khoá tới hết thời gian chờ'],
          ['Đoán sai', '**3 lần** mỗi mã, rồi mã bị huỷ', '“Yêu cầu mã mới”'],
          ['Khoá số', '**5 mã sai trong 24 giờ** → số đó bị khoá **24 giờ**', 'Một thông báo kèm thời gian; khoá cả việc **xin mã mới**, không chỉ việc đoán'],
          ['Ngân sách gửi', '**3 / giờ · 10 / ngày** mỗi số', 'Chặn người lạ gõ số người khác làm tốn tiền Zalo'],
          ['Mã đã bị thay', 'Mã cũ được **nhận ra nhưng không chấp nhận** — không tốn lượt đoán, không tính vào khoá', '“Mã này đã được thay — dùng tin nhắn mới nhất”'],
        ],
      },
      {
        kind: 'warn',
        text:
          '**Notion vẫn mô tả lựa chọn “Tôi đang sống ở nước ngoài” → mã đi qua email.** Bản dựng **đã bỏ** lối đó ở **cả hai phía**: svn-be (`SignUpRequest.phoneVerificationToken` bắt buộc, `/auth/email/otp` đã xoá) và **svn-web PR #633 “Zalo-only verify” (SRM-903, merge 08/10/2026)** — form đăng ký và màn hoàn tất social không còn ô “ở nước ngoài”, không còn OTP email, số điện thoại luôn gửi dạng E.164. Ứng viên không có số Việt Nam hiện **không đăng ký được** — cần client xác nhận đó là chủ ý. PR này **chỉ áp cho ứng viên**; đăng ký nhà tuyển dụng vẫn xác nhận bằng link email.',
      },
      {
        kind: 'table',
        heading: '1.5 Khi nào tài khoản bắt đầu tồn tại',
        note: 'Không có tài khoản nửa vời. Form đăng ký và màn nhập mã là **một luồng**, và dòng ứng viên chỉ được ghi khi mã được xác nhận. Trước đó **không lưu gì** — không có dòng ở Admin, không giữ chỗ email, không có gì để gửi lại.',
        cols: ['Đường', 'Trước khi mã được xác nhận', 'Sau'],
        rows: [
          ['Email + mật khẩu', 'Chưa có gì. Rời màn nhập mã = bắt đầu lại từ form', 'Tài khoản **Active**'],
          ['Social', 'Chưa có gì cho tới khi bước hoàn tất được gửi **và** mã được xác nhận', 'Tài khoản **Active**'],
        ],
      },

      /* §2 */
      { kind: 'h', text: '§2 · Đăng nhập & quên mật khẩu', path: '/auth/sign-in' },
      {
        kind: 'list',
        heading: '2.1 Đăng nhập',
        items: [
          'Email + mật khẩu, hoặc bất kỳ nhà cung cấp nào đã gắn. Danh sách nhà cung cấp trên tài khoản quyết định nút nào hiện ra.',
          'Lỗi **luôn là cùng một câu** — email hay mật khẩu không đúng — dù email có tồn tại hay không. Form **không bao giờ lộ** một địa chỉ đã đăng ký.',
          'Thử sai nhiều lần bị **giới hạn tần suất: 10 lần / phút theo IP và 10 lần / phút theo email** (trả lỗi tạm thời). **Không có khoá tài khoản** vì sai mật khẩu.',
          'Tài khoản **Deactivated** bị từ chối kèm thông tin liên hệ hỗ trợ. Tài khoản **Deleted** bị từ chối bằng **một thông báo khác** — tài khoản đã bị xoá, không dùng lại được — và **không** chỉ người đó tới hỗ trợ để “mở lại”.',
        ],
      },
      {
        kind: 'table',
        heading: '2.2 Quên mật khẩu — và “đặt mật khẩu”',
        cols: ['Bước', 'Điều xảy ra'],
        rows: [
          ['1', 'Ứng viên nhập email hoặc số điện thoại'],
          ['2', 'Chọn nơi nhận mã: **Zalo tới số điện thoại** (mặc định) hoặc **email**'],
          ['3', 'Mã 6 số, quy tắc như §1.4'],
          ['4', 'Đặt mật khẩu mới: **8–128 ký tự · chữ hoa · số · ký hiệu**, có checklist trực tiếp'],
          ['5', '**Mọi phiên khác bị đăng xuất** — mặc định coi mật khẩu cũ đã lộ'],
        ],
      },
      {
        kind: 'list',
        items: [
          '**Tài khoản chỉ có social thì không có mật khẩu.** “Quên mật khẩu” chính là cách nó **đặt** mật khẩu — cùng luồng, không hỏi mật khẩu cũ. Đó là cách một tài khoản tạo bằng Google có thêm đăng nhập bằng email.',
          '**Email / số không tồn tại thì form BÁO là không tìm thấy tài khoản** (quyết định sản phẩm 28/09/2026).',
        ],
      },
      {
        kind: 'warn',
        text:
          'Notion nói mật khẩu **12+ ký tự**, mã chỉ đi theo quy tắc kênh lúc đăng ký, và form luôn trả lời trung tính *“nếu email tồn tại, chúng tôi đã gửi mã”*. Bản dựng: tối thiểu **8** ký tự (hạ từ 12 ngày 28/09/2026, `StrongPasswordPolicy`), **ứng viên chọn** Zalo hoặc email, và email lạ trả về **không tìm thấy tài khoản** (`RECOVERY_ACCOUNT_NOT_FOUND`).',
      },

      /* §3 */
      { kind: 'h', text: '§3 · Trạng thái tài khoản' },
      {
        kind: 'table',
        heading: 'Bốn giá trị server, năm nhãn — đúng như bản dựng',
        note: 'HQ phân biệt hai loại Deactivated ngay trên màn hình: **Deactivated = HQ khoá**, **Withdrawn = chính ứng viên tự tạm dừng**. Cùng một cái khoá, khác người đổi, khác nhãn. Withdrawn **không có tab riêng** — nó nằm trong tab Deactivated.',
        cols: ['Nhãn', 'Giá trị server', 'Nghĩa', 'Ai đặt', 'Mở lại được?', 'Nhà tuyển dụng thấy gì'],
        rows: [
          ['**Active**', '`ACTIVE`', 'Dùng site bình thường — **trạng thái đầu tiên một tài khoản từng có**', 'Hệ thống, khi đăng ký hoàn tất', '—', 'Bình thường'],
          ['**Chưa xác thực**', '`INACTIVE`', 'Tài khoản chưa có mật khẩu / chưa xác thực', '**Chỉ nút Create của HQ** — đăng ký tự phục vụ không còn tạo ra nó', 'Ứng viên hoàn tất qua link', '—'],
          ['**Deactivated**', '`DEACTIVATED`', 'Cửa bị khoá. Không đăng nhập được; **hồ sơ còn nguyên**', 'HQ (khoá)', '**Có** — HQ mở lại', 'Đơn đang xử lý **bị rút**, mỗi công ty nhận thông báo rút đơn'],
          ['**Withdrawn**', '`DEACTIVATED`', 'Như trên, nhưng do chính ứng viên tạm dừng', 'Chính ứng viên', 'HQ mở lại **khi ứng viên yêu cầu**', 'Như trên'],
          ['**Deleted**', '`DELETED`', 'Kết thúc hẳn. Dữ liệu cá nhân bị huỷ trong 72 giờ', 'Ứng viên (kèm bằng chứng) — hoặc HQ', '**Chỉ HQ, chỉ khi lần huỷ chưa chạy**', 'Phase 1: đơn **không bị rút**, dòng hiện *“Tài khoản đã bị xóa”*, **không mở được CV**; CV đã unlock cũng không xem được (§5)'],
        ],
      },
      {
        kind: 'open',
        text:
          '**Notion nói “ba trạng thái, không phải bốn”** và *Chưa xác thực* không còn ở đâu cả. Đúng với đăng ký tự phục vụ — nhưng `INACTIVE` **vẫn còn** trong `AccountStatus` và vẫn sinh ra khi HQ dùng **Create** (`POST /api/admin/candidates`, tạo tài khoản chưa có mật khẩu). Muốn đúng “ba trạng thái” thì phải bỏ nút Create hoặc cho nó tạo thẳng Active — cần client quyết.',
      },

      /* §4 */
      { kind: 'h', text: '§4 · Deactivate = khoá, không phải xoá' },
      {
        kind: 'table',
        heading: 'Khoá tài khoản đổi gì và KHÔNG đổi gì',
        note: 'Hiểu nhầm phổ biến nhất của module này. Khoá trả lời câu hỏi chính: người này còn đăng nhập được không — nhưng ở bản dựng nó **cũng rút các đơn đang chạy**.',
        cols: ['', 'Đổi', 'Không đổi'],
        rows: [
          ['Đăng nhập', 'Bị từ chối; **mọi phiên đang mở kết thúc ngay**', '—'],
          ['Thông báo', 'Job alert, cập nhật đơn, marketing — **dừng hết**', '—'],
          ['CV search', '**Rời khỏi kho tìm kiếm ngay lập tức**', '—'],
          ['Đơn đang xử lý', '**Bị rút**; mỗi công ty nhận một thông báo rút đơn. **Mở lại không trả đơn về**', '—'],
          ['Đơn đã xong (tuyển / loại)', '—', 'Ở nguyên với nhà tuyển dụng'],
          ['CV nhà tuyển dụng đã mở khoá', '—', '**Vẫn đọc được. Không hoàn tiền, không thu lại**'],
          ['Hồ sơ', '—', 'Giữ nguyên vẹn — tên, CV, lịch sử'],
          ['Email', '—', 'Vẫn thuộc về tài khoản này, **không mở tài khoản mới được**'],
        ],
      },
      {
        kind: 'warn',
        text:
          '**Notion nói khoá “vô hình với nhà tuyển dụng” và đơn đã nộp “ở nguyên, đúng chặng cũ”.** Bản dựng làm khác: cả HQ khoá lẫn ứng viên tự tạm dừng đều gọi `withdrawActiveApplications` (FR-13) và gửi thông báo rút đơn cho từng công ty (`AdminCandidateService.deactivate`, `CandidateAuthService.deactivateMyAccount`). Mở lại thì **không** khôi phục đơn. Đây là khác biệt lớn nhất giữa Notion và bản dựng ở module này — cần client chốt bên nào đúng.',
      },
      {
        kind: 'table',
        heading: 'Ai khoá được, và mở lại thế nào',
        cols: ['Ai', 'Gọi là', 'Cần gì', 'Đảo ngược bằng'],
        rows: [
          ['HQ', 'Deactivate (khoá)', 'Một lý do — **nội bộ, ứng viên không bao giờ thấy**. Bản dựng **không bắt buộc** nhập', 'HQ **Reactivate** — tài khoản về Active với mọi thứ nó có (trừ các đơn đã bị rút)'],
          ['Chính ứng viên', 'Tạm dừng → nhãn **Withdrawn**', 'Notion: bước xác nhận + đăng nhập lại', 'HQ mở lại khi ứng viên yêu cầu'],
        ],
      },
      {
        kind: 'open',
        text:
          '**Tự tạm dừng chưa có trên Jobseeker site.** Backend có `POST /auth/deactivate` nhưng **không hỏi đăng nhập lại**, và chưa trang nào của `svn-web` gọi nó — trên thực tế hiện chỉ có HQ khoá. Lý do khoá của HQ cũng đang **không bắt buộc** (Notion: bắt buộc).',
      },
      {
        kind: 'list',
        items: [
          '**Ứng viên đọc gì:** *“Tài khoản tạm thời bị khóa”* kèm cách liên hệ hỗ trợ. Chữ *tạm thời* là chữ chịu lực — một cái khoá đọc như vĩnh viễn sẽ sinh ra một ticket hoảng loạn từ người chưa mất gì.',
          '**Khoá KHÔNG từ chối CV.** Muốn gỡ một CV lạm dụng khỏi vòng duyệt thì đó là **quyết định thứ hai, riêng** ở CV review — hộp thoại khoá chỉ nhắc, không tự làm.',
        ],
      },

      /* §5 */
      { kind: 'h', text: '§5 · Xoá tài khoản — quy tắc Phase 1', path: '/ho-tro/xoa-tai-khoan' },
      {
        kind: 'p',
        text: 'Theo tài liệu *Xóa tài khoản & Xóa CV – Quy tắc áp dụng Phase 1* (cập nhật 10/11/2026, go-live **21/11/2026**). Nguồn quyết định: call 04/11/2026 Saramin VN (chị Huyền, anh Danh) – BurningBros (chị Thu, Nguyên); luồng xoá tài khoản ghi nhận 06/11. Trạng thái: **đã chốt**, còn điểm cần xác nhận ở cuối mục. Phần bước xác thực, lần huỷ 72 giờ và khôi phục giữ theo bản dựng. **Toàn bộ tài liệu Phase 1, kèm sơ đồ: trang Resume management › Delete account & Delete CV.**',
      },
      {
        kind: 'table',
        heading: 'Tóm tắt nhanh — ứng viên làm được gì ở Phase 1',
        cols: ['Hành động của ứng viên', 'Phase 1 có cho phép?', 'Ảnh hưởng chính'],
        rows: [
          ['**Xoá tài khoản**', '✅ Có', 'Tài khoản bị vô hiệu hoá ngay; NTD không còn xem được CV (kể cả đơn đã nộp và CV đã unlock); NTD nhận email thông báo; dữ liệu cá nhân bị xoá vĩnh viễn sau 72 giờ'],
          ['**Xoá CV**', '❌ Không', 'Ẩn nút Delete. Ứng viên chỉ **Edit** CV — xem **Create CV**'],
          ['**Tắt hiển thị CV với NTD**', '✅ Có', 'NTD đã unlock: còn thấy CV nếu ứng viên đang bật 1 CV khác; không thấy nữa nếu ứng viên tắt hết — xem **Talent pool**'],
        ],
      },
      {
        kind: 'diagram',
        id: 'del-account',
        heading: '5.1 Luồng xử lý và dòng thời gian',
      },
      {
        kind: 'table',
        heading: '5.2 Các bước ứng viên đi qua',
        note: 'Theo bản dựng kiểm ngày **21/10/2026** (trang *Trung tâm hỗ trợ* › tab *Xoá tài khoản*, cần đăng nhập — chi tiết ở **Help center §10**). Đường dẫn cũ `/help/withdraw` từ trang *Account information* (`/my-profile/settings`) dẫn vào cùng luồng.',
        cols: ['Bước', 'Ứng viên thấy gì', 'Bắt buộc'],
        rows: [
          ['**1 · Lưu ý**', 'Số hồ sơ, đơn ứng tuyển, việc đã lưu thật của tài khoản, và các nhóm hậu quả khi xoá', 'Tick *Tôi đã đọc toàn bộ nội dung trên và đồng ý.*'],
          ['**2 · Xác thực**', 'Số điện thoại + mã Zalo (6 số, quy tắc như §1.4)', 'Có'],
          ['**3 · Lý do**', '4 lựa chọn, rồi hộp *Bạn chắc chắn muốn xoá tài khoản?* → **Xoá tài khoản**', 'Lý do không bắt buộc; xác nhận thì có'],
          ['**4 · Xong (T0)**', 'Đăng xuất ngay, trang *Tài khoản đã xoá*, email **JS 8**', '—'],
        ],
      },
      {
        kind: 'table',
        heading: '5.3 Ảnh hưởng theo từng khu vực',
        cols: ['Khu vực', 'Trước khi xoá', 'Sau khi ứng viên xác nhận xoá (T0)'],
        rows: [
          ['**Tài khoản ứng viên**', 'Hoạt động', 'Bị vô hiệu hoá **ngay**, không đăng nhập được; mọi phiên kết thúc'],
          ['**Email gửi ứng viên**', 'Theo lịch (JS 1–7)', 'Ngừng **ngay** khi xác nhận xoá (không đợi hết 72 giờ). Chỉ gửi **JS 8**'],
          ['**Đơn ứng tuyển** (Candidate management của NTD)', 'NTD xem được CV trong đơn', 'Dòng ứng tuyển chuyển sang UI **“Tài khoản đã bị xóa”**; NTD **không xem được CV** nữa. Đơn **không bị rút**'],
          ['**Talent Pool**', 'Ứng viên hiển thị nếu đang bật CV', 'Ứng viên **bị ẩn** khỏi Talent Pool'],
          ['**CV NTD đã unlock**', 'NTD xem được CV', 'NTD **không xem được** nữa; **NTD mất lượt quota** đã dùng để unlock (đã chấp nhận)'],
          ['**Thông báo cho NTD**', '—', '**CO 11**: ứng viên đã xoá tài khoản, NTD vui lòng xoá hồ sơ ứng viên khỏi hệ thống / thư mục của công ty'],
          ['**Dữ liệu cá nhân**', 'Lưu trữ', 'Xoá vĩnh viễn sau **72 giờ** kể từ lúc xác nhận'],
        ],
      },
      {
        kind: 'table',
        heading: '5.4 Email liên quan',
        cols: ['Mã', 'Tên', 'Người nhận', 'Thời điểm'],
        rows: [
          ['**JS 8**', 'Xoá tài khoản thành công', 'Ứng viên', 'Ngay khi xác nhận xoá'],
          ['**CO 11**', 'Ứng viên đã xoá tài khoản', 'Các công ty ứng viên **đã ứng tuyển**', 'Ngay khi xác nhận xoá'],
          ['—', '(không có)', '—', 'Thời điểm xoá dữ liệu sau 72 giờ: **không gửi email**'],
        ],
      },
      {
        kind: 'warn',
        text: '**Nội dung JS 8 đang sai.** Bản hiện tại có câu *“Các đơn ứng tuyển bạn đã thực hiện đã được rút lại”*. Theo quyết định 04/11, đơn ứng tuyển **không bị rút** mà hiển thị trạng thái **“Tài khoản đã bị xóa”** phía NTD — câu này cần sửa.',
      },
      {
        kind: 'list',
        heading: '5.5 Trong vòng 72 giờ — lần huỷ (theo bản dựng)',
        items: [
          '**Huỷ:** họ tên, email gốc, mật khẩu, số điện thoại, ngày sinh, giới tính, ảnh đại diện · toàn bộ nội dung hồ sơ và mọi file CV · ghi chú nhà tuyển dụng viết về ứng viên · việc đã lưu, thông báo, lịch sử xem.',
          '**Giữ, đã ẩn danh:** ID nội bộ, ngày xoá, mã lý do · **mã băm của email** (để chặn đăng ký lại) · **bản ghi đã mua lượt mở CV** — giữ sự kiện mua, bỏ nội dung (NTD không hoàn quota) · số liệu tổng hợp.',
          'Dòng dữ liệu **ở lại nhưng rỗng người** — để email vẫn bị khoá và HQ chứng minh được đã xoá những gì.',
          'Job huỷ chạy **mỗi 5 phút** và xử lý mọi tài khoản đã quá hạn 72 giờ; tài khoản lỗi được **tự thử lại** ở lần chạy sau. **Không gửi email** lúc huỷ.',
        ],
      },
      {
        kind: 'table',
        heading: '5.6 Đăng ký lại và khôi phục (theo bản dựng)',
        cols: ['Câu hỏi', 'Câu trả lời'],
        rows: [
          ['Email đó đăng ký lại được không?', 'Email **đã xác thực**: **bị chặn vĩnh viễn** — kể cả biến thể dấu chấm của Gmail. HQ gỡ chặn được sau khi xác minh danh tính'],
          ['Có trường hợp nào không bị chặn?', '**Có** — email **chưa từng được xác thực** được thả ra lúc huỷ. Xem lưu ý bên dưới'],
          ['Khôi phục tài khoản được không?', 'Chỉ HQ, chỉ **trước khi lần huỷ chạy**'],
          ['Ứng viên xoá CV thay vì xoá tài khoản được không?', '**Không** — Phase 1 không có xoá CV (xem **Create CV**)'],
        ],
      },
      {
        kind: 'warn',
        text:
          '**Hệ quả chưa ai nói tới:** đăng ký giờ xác thực bằng **số điện thoại**, nên phần lớn tài khoản mới có `emailVerified = false`. Theo quy tắc “chỉ chặn email đã xác thực”, **email của đa số tài khoản bị xoá sẽ KHÔNG bị chặn đăng ký lại**.',
      },
      {
        kind: 'table',
        heading: '5.7 Khoá và Xoá, đặt cạnh nhau',
        note: 'Cột *Deactivate* theo bản dựng 08/10 — tài liệu Phase 1 không nói về khoá tài khoản.',
        cols: ['', 'Deactivate', 'Delete (Phase 1)'],
        rows: [
          ['Ai làm', 'HQ (khoá) hoặc ứng viên (tạm dừng)', 'Ứng viên — hoặc HQ'],
          ['Hồ sơ', 'Nguyên vẹn', 'Dữ liệu cá nhân **bị huỷ sau 72 giờ**; giữ lại dòng đã ẩn danh'],
          ['Quay lại được?', 'Có — HQ mở lại', '**Chỉ HQ, chỉ khi lần huỷ chưa chạy**'],
          ['Đơn ứng tuyển', '**Đơn đang xử lý bị rút** (bản dựng)', '**Không bị rút** — dòng hiện *“Tài khoản đã bị xóa”*, NTD không xem được CV'],
          ['CV nhà tuyển dụng đã mở khoá', 'Vẫn đọc được', '**Không xem được nữa**; NTD mất quota'],
          ['Nhà tuyển dụng có được báo?', 'Thông báo rút đơn cho mỗi đơn bị rút', '**CO 11** cho các công ty ứng viên đã ứng tuyển'],
          ['Email gửi ứng viên', 'Dừng hết', 'Dừng ngay; chỉ gửi **JS 8**'],
          ['Email tài khoản', 'Vẫn là của tài khoản này', 'Giữ **mã băm**; không đăng ký lại được **nếu đã xác thực**'],
        ],
      },
      {
        kind: 'open',
        text: '**Còn cần xác nhận (tài liệu Phase 1 §6).** (1) **NTD có còn thấy CV không?** Quyết định 04/11: NTD **không xem được** CV (đơn đã nộp và CV đã unlock). Saramin VN có nhắc một rule khác: NTD vẫn thấy CV nhưng **ẩn thông tin định danh** (tên, email, SĐT, địa chỉ, link MXH) — cần Saramin VN xác nhận bản nào là bản chốt cuối. (2) **Nội dung JS 8:** bỏ câu *“Các đơn ứng tuyển đã được rút lại do việc xóa tài khoản”*, thay bằng nội dung đúng với §5.3. **Có rút đơn khi xoá tài khoản hay không phụ thuộc hai điểm này** (tài liệu §6 #5).',
      },
      {
        kind: 'warn',
        text: '**Build cũ chưa theo quyết định 04/11 (tài liệu Phase 1 §6 #5).** Build 08/10 **rút các đơn đang xử lý** khi xoá tài khoản (`withdrawActiveApplications`) — đúng với câu hiện tại trong JS 8, nhưng khác quyết định 04/11 (NTD thấy *“Tài khoản đã bị xóa”*, đơn không bị rút). **Đừng đổi phần rút đơn của build cho tới khi Saramin VN chốt điểm (1)–(2) ở trên.** Email **mỗi công ty một thư** là đúng: **CO 11** gửi tới từng công ty ứng viên đã ứng tuyển.',
      },

      /* §6 */
      { kind: 'h', text: '§6 · Admin (HQ)', path: '/users/jobseekers' },
      {
        kind: 'table',
        heading: 'Quyền cần có',
        note: '**Trên lưới quyền không có dòng “Jobseeker users”.** Các quyền `candidate:*` nằm ở dòng **Talent pool** (nhóm Recruitment). Theo seed **chỉ HQ Admin** có `candidate:*` — trên vai trò khác ô *Update* / *Export* của Talent pool thường hiện **Partial**; tick ô đó là cấp luôn quyền khoá / xoá tài khoản ứng viên.',
        cols: ['Muốn làm', 'Cần', 'Ô trên lưới (Talent pool)'],
        rows: [
          ['Mở danh sách, thẻ số liệu, trang chi tiết, tab Deleted', '`candidate:read`', 'Read'],
          ['Create · Edit profile · Deactivate / Reactivate · Delete / Restore · Send password reset · Resend verification · tra / gỡ chặn email', '`candidate:manage`', 'Update'],
          ['Export danh sách ứng viên / tài khoản đã xoá', '`candidate:export`', 'Export'],
        ],
      },
      {
        kind: 'list',
        heading: 'Audit để lại',
        items: [
          'Mở trang chi tiết → `candidate.read` kèm tên operator.',
          'Khoá / mở / xoá / khôi phục → `candidate.deactivate` · `candidate.reactivate` · `candidate.delete` · `candidate.restore`, ghi **trạng thái trước → sau** và lý do (nếu nhập). Khoá và xoá đều **thu hồi mọi phiên** ngay.',
          'Edit profile đi qua đúng kiểm tra của ứng viên (master data, ký tự trong tên, giới hạn ≤3) và được ghi audit riêng.',
        ],
      },
      {
        kind: 'table',
        heading: '6.1 Jobseeker users — thao tác theo trạng thái',
        note: 'Đầu trang có **4 thẻ số liệu**: Accounts · Active · Deactivated · New this month. Ngoài ra còn **Create**, **Edit profile**, **Export** và **Resend verification**.',
        cols: ['Trạng thái của dòng', 'Thao tác'],
        rows: [
          ['Active', '**Deactivate** (lý do không bắt buộc) · **Send password reset** · **Delete** (ở trang chi tiết)'],
          ['Deactivated (HQ khoá)', '**Reactivate** — tài khoản về Active'],
          ['Withdrawn (ứng viên tạm dừng)', '**Reactivate** khi ứng viên yêu cầu — **chỉ ở trang chi tiết**, dòng trên danh sách không có nút'],
          ['Deleted', '**Restore** — chỉ bật khi lần huỷ chưa chạy (cần quyền `candidate:manage`)'],
        ],
      },
      {
        kind: 'p',
        text:
          '**Trang chi tiết** gồm: tài khoản và trạng thái, thẻ hồ sơ và nguyện vọng, **danh sách CV** (CV · trạng thái · có trong CV search không · số đơn · ngày thêm), và **các đơn ứng tuyển** (job · công ty · chặng · ngày nộp). **Lần mở trang chi tiết được ghi audit** với tên người thao tác.',
      },
      {
        kind: 'warn',
        text:
          'Notion mô tả **6 thẻ** (thêm Withdrawn, Deleted), lọc theo **nguồn đăng ký**, cột **số nhà tuyển dụng đã mở khoá** mỗi CV, và audit riêng cho việc **mở CV / bỏ che liên hệ**. Bản dựng: **4 thẻ**, **không** có bộ lọc nguồn đăng ký (backend có `signupSource` nhưng UI chưa dùng), **không** có số lượt mở khoá (nằm ở billing), và **không che email** — chỉ ghi audit khi mở trang chi tiết.',
      },
      {
        kind: 'table',
        heading: '6.2 Tab Deleted — /users/jobseekers?status=DELETED',
        note: 'Trước là trang riêng **Deleted accounts**; giờ `/users/deleted-accounts` **chuyển hướng** sang tab này. Ở danh sách đơn ứng tuyển khắp Admin, dòng của ứng viên đã xoá mang nhãn **Deleted account**.',
        cols: ['Cột', 'Nghĩa'],
        rows: [
          ['Jobseeker', 'Tên và email — sau khi huỷ thì đọc là **Erased account**'],
          ['Joined · Signed up via', 'Ngày tham gia, đăng ký bằng đường nào'],
          ['Deleted at', 'Khi tài khoản kết thúc'],
          ['Deleted by', '**Withdrawn** (chính ứng viên) hoặc **HQ**'],
          ['Erasure', '**Pending** (đang trong 72 giờ, kèm hạn) · **Erased** (kèm thời điểm chạy) · **Unknown**'],
          ['Email block', 'Địa chỉ có bị chặn đăng ký lại không'],
          ['Reason', 'Lý do ứng viên chọn, hoặc ghi chú của HQ'],
        ],
      },
      {
        kind: 'list',
        items: [
          'Cũng ở tab này: **tra một email** xem có bị chặn không, và **gỡ chặn** sau khi đã xác minh danh tính (bắt buộc nhập lý do).',
          'Notion còn liệt kê cột **Candidate ID** riêng và trạng thái **Failed**. Bản dựng không có cả hai — tài khoản huỷ lỗi vẫn hiện **Pending** và được thử lại tự động.',
        ],
      },
      {
        kind: 'warn',
        text:
          '**6.3 Những việc HQ không bao giờ làm.** **Không bao giờ xem hoặc đặt mật khẩu** — hành động duy nhất liên quan tới đăng nhập là **gửi link đặt lại**. **Không khôi phục được tài khoản đã huỷ** — sau lần huỷ không còn gì để khôi phục. Notion còn nói HQ **không sửa CV, hồ sơ hay nguyện vọng** — nhưng bản dựng **có** nút **Edit profile** (đi qua đúng kiểm tra của ứng viên, có audit).',
      },

      /* §7 */
      { kind: 'h', text: '§7 · Những thứ liên quan khách nên biết' },
      {
        kind: 'table',
        cols: ['Ở đâu', 'Vì sao quan trọng ở đây'],
        rows: [
          ['Công tắc hiển thị CV (Account settings → Privacy)', '**Độc lập với trạng thái tài khoản.** Active mà CV ẩn là trạng thái bình thường, không phải lỗi. Tắt là rời CV search ngay'],
          ['Mẫu xác nhận đồng ý xử lý dữ liệu (phía nhà tuyển dụng)', 'Cho nhà tuyển dụng **thời hạn lưu 60 tháng của riêng họ** với dữ liệu đã nhận. Saramin có nghĩa vụ **thông báo**; việc thực thi phía họ là trách nhiệm của họ'],
          ['Xoá tài khoản thành viên công ty', 'Luồng **khác hẳn** — xác nhận lại mật khẩu, admin cuối cùng phải bàn giao trước, email giữ **30 ngày** chứ không mãi mãi. Xem Company users'],
          ['Privacy Policy 21/09/2026 (Policy 09-21)', 'Nguồn ràng buộc cho §5: thời hạn xác nhận 02 ngày làm việc, xoá trong 72 giờ, thông báo cho nhà tuyển dụng. **Mục xoá CV** (“rút đơn + gửi mail NTD”) **không còn áp dụng** ở Phase 1 — Saramin VN gỡ hoặc ghi chú *“chưa áp dụng”*; hệ thống không làm theo; không chặn go-live'],
        ],
      },

      /* §8 */
      { kind: 'h', text: '§8 · Kịch bản test gợi ý' },
      {
        kind: 'table',
        note: 'Đã chỉnh theo bản dựng — cột cuối ghi điều **bản dựng** sẽ làm, không phải điều Notion viết.',
        cols: ['Kịch bản', 'Đạt khi'],
        rows: [
          ['Đăng ký bằng số Việt Nam', 'Mã tới qua Zalo; **chưa có dòng nào ở Admin** cho tới khi gõ mã; xác nhận xong tài khoản hiện là **Active**'],
          ['Gõ sai mã 3 lần', 'Mã bị huỷ, màn hình mời lấy mã mới; mã sai thứ 4 và 5 (trên mã mới) **khoá số 24 giờ**, kể cả việc gửi mã'],
          ['Gửi lại, rồi gõ mã đầu tiên', '“Dùng tin nhắn mới nhất” — không mất lượt đoán'],
          ['Quên mật khẩu trên tài khoản chỉ có Google', 'Luồng đặt được mật khẩu; sau đó đăng nhập được bằng email'],
          ['HQ khoá một tài khoản Active có đơn đang chạy', 'Đăng nhập bị từ chối kèm thông báo hỗ trợ; phiên kết thúc; **đơn đang chạy bị rút và công ty nhận thông báo**; CV đã mở khoá vẫn đọc được'],
          ['HQ mở lại tài khoản đó', 'Về Active; **các đơn đã bị rút không quay lại**'],
          ['Bỏ dở màn nhập mã giữa chừng', 'Không tạo gì; email chưa bị giữ; đăng ký lại từ form'],
          ['Ứng viên xoá, có một đơn đang chạy và một đơn bị loại (Phase 1)', 'Cả hai dòng **ở lại** bảng nhà tuyển dụng với UI *“Tài khoản đã bị xóa”*, **không mở được CV**; công ty nhận **CO 11**; ứng viên nhận **JS 8**; ứng viên rời Talent Pool ngay'],
          ['Ứng viên xoá, có công ty đã unlock CV (Phase 1)', 'Công ty đó **không xem được CV nữa**; lượt quota **không hoàn**'],
          ['Ứng viên xoá, rồi chờ đủ 72 giờ (Phase 1)', 'Ứng viên **không nhận thêm email nào** sau JS 8 — kể cả lúc dữ liệu bị huỷ'],
          ['Đăng ký lại bằng email đã xoá (đã xác thực), và bằng biến thể Gmail có dấu chấm', 'Cả hai bị từ chối'],
          ['Đăng ký lại bằng email đã xoá chưa từng xác thực', 'Được phép'],
          ['HQ khôi phục trước khi huỷ · sau khi huỷ', 'Trước: về Active. Sau: Restore bị từ chối (`ACCOUNT_ALREADY_ERASED`)'],
          ['72 giờ sau khi xoá', 'Tên, điện thoại, file CV đã mất; dòng ở lại với mã băm và lý do; các dòng mua lượt mở khoá ở lại, không nội dung; tab Deleted hiện **Erased**'],
        ],
      },
      {
        kind: 'p',
        text:
          '**Nguồn.** Đối chiếu ngày 08/10/2026 trên `origin/dev`: svn-be `664b8a6ec` (đối chiếu lại ở `ee1db5ea9` — 11 commit sau đó không đụng `identity`; `PURGE_DELAY = 72h`, 4 giá trị `AccountStatus`, `withdrawActiveApplications` khi khoá / tự tạm dừng / xoá vẫn đúng), svn-web `d8a43a11` (merge PR #633), saramin-vn-admin `45954108`. Điểm vào: `domain/identity/{OtpChallenge,OtpLockout,OtpSendBudget,AccountLifecycle,AccountStatus,StrongPasswordPolicy}.java`, `CandidateAuthService`, `AdminCandidateService`, `CandidatePurgeService` (job `CandidateHardDeletePurgeJob` mỗi 5 phút, `PURGE_DELAY = 72h` từ commit `e599c9bce` 23/09), `AnonymisedEmail` (HMAC + biến thể Gmail); admin `modules/user/jobseekers/` — `resolveDisplayStatus()`, `use-deleted-columns.tsx`, `deleted-accounts-redirect.tsx`. Tài liệu `svn-be/docs/GLOSSARY.md` và `CANDIDATE_AUTH_FE_GUIDE.md` vẫn tả xác thực email lúc đăng ký và quy tắc mật khẩu cũ — code là thứ đang chạy.',
      },
    ],
  },

  'company-users': {
    logic: [
      'Tài khoản đăng nhập của **phía khách hàng** (nhà tuyển dụng), xem xuyên suốt mọi công ty ở một chỗ. Khác hẳn tài khoản ứng viên (*Jobseeker users*) và tài khoản nhân viên Saramin (*Organisation → Users*).',
      'Một dòng là **một chỗ ngồi (seat) — một tư cách thành viên trong một công ty**. Cùng một người làm cho hai công ty là **hai dòng**. Vì vậy hàng thẻ số liệu có riêng thẻ **Companies**: “1.248 seats” không có nghĩa là 1.248 người.',
      '**Đây không phải danh sách công ty thứ hai, và không phải nơi tạo người.** Không có nút *New user*, không có trang chi tiết: bấm một dòng là mở **hồ sơ công ty** (`/crm/companies/:id`) — tab *Users* ở đó mới là màn hình làm việc hằng ngày, và lời mời luôn phát ra từ đó.',
      '**Trạng thái nằm trên hai trục.** *Active / Disabled* là của **chỗ ngồi** (tắt ở công ty này không đụng tới chỗ ngồi ở công ty khác). *Invited* là của **tài khoản** (đã mời, chưa đặt mật khẩu). *Deleted* là của **cả tài khoản** — mọi chỗ ngồi kết thúc cùng lúc.',
      '**Vai trò ở đây là vai trò của khách, không phải của Saramin.** Mỗi công ty có một vai trò *Super admin* cố định và các vai trò tự đặt; chúng **không bao giờ** cấp được quyền gì trên Admin.',
    ],
    how: [
      'Tìm theo **tên, email hoặc tên công ty**; tab trạng thái **All · Active · Invited · Disabled** và tab riêng **Deleted**; bộ lọc **Company**, **Role** (chỉ bật **sau khi** chọn công ty) và **Joined** (khoảng ngày).',
      'Bấm một dòng → mở hồ sơ công ty, tab *Users*. Ở đó có thêm **Invite user**, **Reset password** và **trình sửa vai trò** của công ty.',
      'Menu ⋮ trên dòng: **Change role** · **Resend invite** (chỉ dòng *Invited*) · **Disable access** / **Re-enable access** · **Delete account**. Mọi thao tác đều hỏi xác nhận và nói rõ cái giá.',
      'Nhân viên khách nghỉ việc → **Disable**, không xoá. Người đó muốn **xoá hẳn** dữ liệu của mình → họ tự xoá trên Company site, hoặc HQ dùng **Delete account**.',
      'Tab **Deleted** → **Restore account** khi lần huỷ dữ liệu chưa chạy; nút **Check email hold** (chỉ hiện ở tab này) tra một địa chỉ có đang bị giữ không.',
    ],
    watch: [
      '**HQ thấy đúng các chỗ ngồi khách thấy trong Members của họ** — nhưng HQ **làm được nhiều hơn**: xoá cả tài khoản, khôi phục tài khoản đã xoá, tra email bị giữ. Company Admin thì không.',
      '**Công ty phải luôn còn ít nhất một Super admin đang hoạt động.** Disable hoặc **hạ vai trò** Super admin cuối cùng bị từ chối (409 *“A company must keep at least one active administrator”*). **Delete account của HQ thì KHÔNG bị chặn** — biên nhận sau đó liệt kê công ty nào vừa mất admin.',
      '**Resend invite làm chết link cũ.** Mỗi tài khoản chỉ có **một link sống**; bấm lại trong **60 giây** bị từ chối (429).',
      '**Bộ lọc Role bị khoá cho tới khi chọn công ty** — vai trò thuộc về từng công ty, hai công ty có thể cùng có một vai trò tên “Recruiter” mà quyền khác nhau.',
      '**Email hiện thô, không che** — mở trang hay Export là chạm dữ liệu cá nhân. Export ghi audit `company_user.read`.',
    ],
    blocks: [
      { kind: 'h', text: '§1 · Màn hình danh sách', path: '/users/company-users' },
      {
        kind: 'table',
        heading: 'Quyền cần có',
        note: 'Trên lưới quyền (*Roles & permissions*) **không có dòng “Company users”** trong nhóm *Users*: quyền nằm ở dòng **Company staff logins** thuộc nhóm **CRM**, vì màn hình làm việc hằng ngày là tab *Users* của hồ sơ công ty. Mọi thao tác ghi đều là **Update**.',
        cols: ['Muốn làm', 'Cần', 'Ô trên lưới (Company staff logins)'],
        rows: [
          ['Mở danh sách, xem thẻ số liệu, tab Deleted', '`company_user:read`', 'Read'],
          ['Change role · Resend invite · Disable / Re-enable · Reset password · **Delete account** · Restore account · Check email hold', '`company_user:manage`', 'Update'],
          ['Export danh sách', '`company_user:manage` **và** `company_user:export`', 'Update + Export'],
        ],
      },
      {
        kind: 'table',
        heading: 'Sáu thẻ số liệu',
        note: 'Thẻ đếm **mọi thứ trong tầm của bạn**, không theo bộ lọc đang chọn. Thẻ *Invited* tô vàng — đó là trạng thái duy nhất có việc cho operator.',
        cols: ['Thẻ', 'Đếm gì'],
        rows: [
          ['**Seats**', 'Mọi chỗ ngồi (một người ở hai công ty = 2)'],
          ['**Active**', 'Đã đặt mật khẩu và đang bật'],
          ['**Invited**', 'Đã mời, chưa đặt mật khẩu'],
          ['**Disabled**', 'Đã tắt quyền truy cập'],
          ['**Companies**', 'Số công ty có **ít nhất một** chỗ ngồi — con số trả lời “bao nhiêu khách có người đăng nhập”'],
          ['**New this month**', 'Chỗ ngồi tạo trong tháng'],
        ],
      },
      {
        kind: 'table',
        heading: 'Các cột',
        note: 'Sắp xếp bằng **tiêu đề cột**, chạy ở server: Member · Company · Last active · Joined. **Role và Status không sắp được** — tên vai trò thuộc từng công ty nên xếp chữ cái vô nghĩa; Status thì đã có tab.',
        cols: ['Cột', 'Nghĩa'],
        rows: [
          ['**Member**', 'Tên trên email; **chỉ email** khi người đó chưa điền tên (hệ thống không bịa tên từ email)'],
          ['**Company**', 'Link sang hồ sơ công ty'],
          ['**Role**', 'Vai trò **của công ty đó**'],
          ['**Status**', '*Active* · *Invited* · *Disabled* (xem §2)'],
          ['**Email verified**', '*Verified* / *Not verified* — người tự đăng ký chưa bấm link xác nhận email thì **chưa đăng nhập được** dù đã được xếp vào công ty'],
          ['**Last active**', 'Tương đối (“3 ngày trước”), rê chuột thấy ngày giờ; **—** nếu chưa từng đăng nhập'],
          ['**Joined**', 'Ngày chỗ ngồi được tạo'],
        ],
      },

      { kind: 'h', text: '§2 · Trạng thái' },
      {
        kind: 'table',
        heading: 'Ba trạng thái chỗ ngồi + một trạng thái tài khoản',
        note: '**Invited thắng Active** trên một chỗ ngồi đang bật mà chưa có mật khẩu — vì nó mang một việc cần làm (“gửi lại, hoặc nhắc họ”). Một chỗ ngồi đã tắt thì chỉ là *Disabled*, bất kể người đó onboard tới đâu. Cùng quy tắc với tab *Users* của hồ sơ công ty — hai màn hình **không bao giờ** nói khác nhau về cùng một chỗ ngồi.',
        cols: ['Trạng thái', 'Nghĩa', 'Vào bằng cách nào', 'Làm gì tiếp'],
        rows: [
          ['**Invited**', 'Chỗ ngồi đang bật, **chưa đặt mật khẩu** — chưa đăng nhập được', 'HQ mời từ hồ sơ công ty, hoặc Company Admin mời từ *Members* trên Company site', '*Resend invite* (link mới, link cũ chết) · *Change role* · *Disable*'],
          ['**Active**', 'Đã đặt mật khẩu, đăng nhập được vào công ty này', 'Người được mời đặt mật khẩu qua link; hoặc người tự đăng ký được HQ xếp vào công ty', '*Change role* · *Reset password* (ở hồ sơ công ty) · *Disable*'],
          ['**Disabled**', 'Quyền vào **công ty này** bị tắt. Tài khoản, vai trò, lịch sử còn nguyên; chỗ ngồi ở công ty khác **không bị ảnh hưởng**', '*Disable access* (HQ hoặc Company Admin)', '*Re-enable access* — quay lại **đúng vai trò cũ**'],
          ['**Deleted** *(tab riêng)*', 'Cả tài khoản kết thúc: **mọi** chỗ ngồi chấm dứt; dữ liệu cá nhân huỷ sau **72 giờ**', 'Người đó tự xoá trên Company site (nhập mật khẩu), hoặc HQ *Delete account*', '*Restore account* — **chỉ HQ, chỉ khi chưa huỷ**'],
        ],
      },
      {
        kind: 'table',
        heading: 'Khi người đó bấm Đăng nhập — câu trả lời theo từng trường hợp',
        note: 'Mọi trường hợp dưới dòng đầu chỉ được trả lời **sau khi mật khẩu đúng** — nên màn hình không bao giờ bảo một người có mật khẩu đúng đi đặt lại mật khẩu.',
        cols: ['Tình huống', 'Mã', 'Người dùng thấy'],
        rows: [
          ['Sai email hoặc mật khẩu', '`SVN-2000`', 'Một câu chung, không lộ email có tồn tại hay không'],
          ['Đăng ký chưa được HQ xử lý', '`SVN-2005`', 'Màn hình **theo dõi yêu cầu đăng ký**, không phải lỗi đăng nhập'],
          ['Email chưa xác nhận (người tự đăng ký)', '`SVN-2003`', 'Lời nhắc + nút gửi lại link xác nhận'],
          ['Chỗ ngồi cuối cùng đã bị tắt', '`SVN-2001`', 'Tài khoản bị khoá — công ty của họ mở lại được'],
          ['Công ty đã bị Archive', '`SVN-2023`', 'Không có gì để tự sửa — liên hệ'],
          ['Tài khoản đã xoá, chưa huỷ', '`SVN-2007`', 'Tài khoản đã xoá — **khác** câu “bị khoá”, vì chỉ HQ mở lại được'],
          ['Thử quá nhiều', '`SVN-1007`', 'Chờ rồi thử lại'],
        ],
      },
      {
        kind: 'warn',
        text:
          '**Disable một chỗ ngồi chỉ khoá đăng nhập khi đó là chỗ ngồi đang bật cuối cùng của người đó.** Người làm cho hai công ty bị tắt ở công ty A vẫn đăng nhập được và làm việc ở công ty B. Đó là chủ đích (`removeMember` kiểm *mọi* membership trước khi tắt tài khoản).',
      },

      { kind: 'h', text: '§3 · Vai trò trong một công ty' },
      {
        kind: 'table',
        heading: 'Super admin và các vai trò tự đặt',
        note: 'Vai trò được **sửa ở hai nơi**: khung *Roles* trong tab *Users* của hồ sơ công ty (HQ), và trình sửa vai trò trên Company site (chỉ Super admin của công ty mở được). Cả hai dùng cùng một logic phía server.',
        cols: ['', 'Super admin (company_admin)', 'Vai trò tự đặt'],
        rows: [
          ['Có ở đâu', '**Mọi công ty đều có**, không xoá được', 'Công ty tự thêm (*Add role*). Công ty mới chỉ có Super admin cho tới khi ai đó thêm vai trò'],
          ['Đổi tên', 'Được — đổi tên tạo **bản riêng** của công ty đó, khách khác không bị ảnh hưởng', 'Được'],
          ['Quyền', '**Cố định = mọi quyền**, kể cả hai quyền không có trên lưới: **giao/tắt tài khoản đồng nghiệp** (`member:manage`) và **thanh toán** (`billing:manage`)', 'Tick trong **7 quyền cố định** dưới đây'],
          ['Xoá', 'Không bao giờ', 'Chỉ khi **không còn ai giữ** (*“N member(s) still hold this role”*)'],
          ['Ai được mời người / sửa vai trò trên Company site', '**Chỉ Super admin**', 'Không vai trò tự đặt nào nhận được quyền đó — có chủ đích'],
        ],
      },
      {
        kind: 'table',
        heading: 'Bảy quyền một vai trò của khách có thể có',
        note: '**Tick một hành động thì quyền “xem” đi kèm tự bật và bị khoá** — không quản lý được thứ mình không xem được. Server áp lại quy tắc này khi lưu, nên một vai trò **không bao giờ ở trạng thái vô lý**.',
        cols: ['Nhóm', 'Quyền (nhãn trên màn hình)', 'Cần kèm'],
        rows: [
          ['Job posts', '*View jobs* `job:read`', '—'],
          ['Job posts', '*Post jobs* `job:post` · *Edit jobs* `job:manage`', '*View jobs*'],
          ['Applications', '*View applications & CVs* `applicant:read`', '—'],
          ['Applications', '*Manage applications* `applicant:manage`', '*View applications & CVs*'],
          ['Resume search', '*Search resumes* `candidate:search`', '—'],
          ['Resume search', '*View / unlock resume detail* `candidate:unlock` — **tiêu credit của khách**', '*Search resumes*'],
        ],
      },
      {
        kind: 'list',
        items: [
          '**Quyền được quyết bởi các quyền vai trò mang, không bởi tên.** Đặt tên “Admin” cho một vai trò tự đặt không cho nó thêm gì.',
          '**Vai trò của khách và vai trò của Saramin là hai không gian tách rời.** Không vai trò nào tạo ở đây xuất hiện được trong *Organisation → Roles*, và ngược lại.',
          '**Change role cũng bị chặn bởi luật Super admin cuối cùng**: hạ Super admin duy nhất xuống vai trò khác bị từ chối y như Disable.',
        ],
      },

      { kind: 'h', text: '§4 · Một người vào công ty bằng ba đường' },
      {
        kind: 'table',
        heading: 'Ba đường, một loại tài khoản',
        note: '**Không đường nào cho HQ đặt hay nhìn thấy mật khẩu của khách.** Lời mời gửi một link dùng một lần; người nhận tự đặt mật khẩu và được đăng nhập ngay.',
        cols: ['Đường', 'Ai làm', 'Cần gì', 'Kết quả'],
        rows: [
          ['**Tự đăng ký** trên Company site', 'Nhà tuyển dụng; HQ xử lý ở **CRM → Sign-ups**', 'Họ tên, email, điện thoại, mật khẩu, MST, tên công ty, ERC (không bắt buộc), đồng ý điều khoản. **Hai cổng**: xác nhận email (link) **và** HQ xếp vào công ty', '*Create company & activate* → người đó là **Super admin** của công ty mới. *Move to existing company* → HQ **chọn vai trò** (mặc định Super admin)'],
          ['**HQ mời** từ hồ sơ công ty → tab *Users* → *Invite user*', 'Người có `company_user:manage`', '**Email + vai trò** (vai trò của công ty đó). Không có ô mật khẩu', 'Chỗ ngồi **Invited**; email chứa link đặt mật khẩu, sống **72 giờ**'],
          ['**Company Admin mời** từ *Members* trên Company site', 'Super admin của công ty', 'Email, tên, vai trò', 'Như trên — **Invited**, link 72 giờ'],
        ],
      },
      {
        kind: 'list',
        items: [
          '**Một email = một tài khoản trên toàn hệ thống khách.** Mời một email đã có tài khoản → *“already registered”* (409). Muốn người đó vào thêm một công ty thứ hai thì đó là việc của HQ ở Sign-ups (*Move to existing company*), không phải một lời mời mới.',
          '**Email của tài khoản đã xoá bị giữ tới 30 ngày sau lần huỷ.** HQ mời hoặc xếp một email đang bị giữ → thông báo *“This email address belongs to a deleted account and can be used again from {date}”* (`SVN-2030`). Trong 72 giờ đầu, câu trả lời đúng thường là **Restore account**, không phải chờ.',
          'Company site **không bao giờ** được biết email đó từng thuộc một tài khoản đã xoá — nó chỉ nhận câu chung *“already registered”*.',
          'Link mời **chỉ một link sống mỗi tài khoản**: Resend / Reset password đều huỷ link trước. Giao thư là *best-effort* — thư không tới thì *Resend invite*.',
        ],
      },

      { kind: 'h', text: '§5 · Đăng nhập và mật khẩu' },
      {
        kind: 'table',
        heading: 'Khác ứng viên ở mọi điểm',
        cols: ['', 'Thành viên công ty', 'Ứng viên (để so sánh)'],
        rows: [
          ['Cách đăng nhập', '**Chỉ email + mật khẩu**, ở tab *Nhà tuyển dụng* của màn đăng nhập chung. Có ô *giữ đăng nhập*', 'Email + mật khẩu, hoặc Google · Facebook · LinkedIn · GitHub'],
          ['Xác thực danh tính', '**Link xác nhận email** (chỉ người tự đăng ký) + HQ duyệt', '**OTP Zalo** tới số điện thoại'],
          ['Quên mật khẩu', 'Nhập email → **link đặt mật khẩu**, sống **1 giờ**. Email lạ vẫn nhận câu trả lời giống hệt (không lộ tài khoản)', 'Mã 6 số qua Zalo hoặc email'],
          ['Luật mật khẩu', '**8–128 ký tự, có chữ cái, số và ký hiệu**; không bắt đầu/kết thúc bằng khoảng trắng; **không trùng email**', '8–128, **chữ hoa** + số + ký hiệu'],
          ['Đổi mật khẩu khi đang đăng nhập', 'Thiết bị này giữ phiên; **mọi phiên khác bị thu hồi**, link đặt mật khẩu đang chờ bị huỷ, có email xác nhận', 'Tương tự'],
        ],
      },
      {
        kind: 'warn',
        text:
          '**svn-web PR #633 (“Zalo-only verify”, SRM-903, merge 08/10/2026) chỉ áp cho ứng viên.** Nó bỏ lựa chọn “Tôi đang sống ở nước ngoài” và OTP email ở luồng đăng ký **ứng viên**. Đăng ký **nhà tuyển dụng** vẫn xác nhận bằng **link email** (`POST /corporate/auth/sign-up` → `verify-email`), và đăng nhập nhà tuyển dụng **không có** OTP Zalo hay social.',
      },
      {
        kind: 'p',
        text:
          '**HQ hỗ trợ mật khẩu thế nào.** Tab *Users* của hồ sơ công ty có **Reset password** — chỉ trên chỗ ngồi **Active** (chỗ ngồi *Invited* thì dùng *Resend invite*; chỗ ngồi *Disabled* bị từ chối: *“restore it before resetting the password”*). Nó gửi cùng loại link 72 giờ, chung **cooldown 60 giây** với Resend invite, và để lại audit `company_member.password_reset` **ghi tên operator** — không bao giờ ghi như thể khách tự yêu cầu. Danh sách *Company users* **không** có nút này.',
      },

      { kind: 'h', text: '§6 · Mỗi thao tác đổi gì' },
      {
        kind: 'table',
        heading: 'Thao tác và hệ quả',
        note: 'Mọi thao tác ghi làm mới **cả** danh sách này **và** tab *Users* của hồ sơ công ty. Mỗi thao tác trên chỗ ngồi ghi một dòng audit `company_member.*` (*invite · resend_invite · password_reset · assign_role · remove · restore*) kèm công ty và người làm.',
        cols: ['Thao tác', 'Ở đâu', 'Đổi gì', 'Không đổi / bị chặn khi'],
        rows: [
          ['**Change role**', 'Danh sách · hồ sơ công ty', 'Vai trò của chỗ ngồi ở công ty đó; quyền mới có hiệu lực ở **lần đăng nhập / làm mới phiên kế tiếp**', 'Chặn khi hạ **Super admin đang hoạt động cuối cùng**'],
          ['**Resend invite**', 'Chỉ dòng *Invited*', 'Gửi link mới 72 giờ; **link cũ chết ngay**', '429 trong 60 giây; 409 nếu tài khoản đã bị xoá'],
          ['**Disable access**', 'Danh sách · hồ sơ công ty', 'Chặn vào **công ty này** ngay; nếu là chỗ ngồi bật cuối cùng thì **tài khoản không đăng nhập được nữa**', 'Tin, ứng viên, CV đã mở khoá **ở lại với công ty**. Chặn với Super admin cuối cùng'],
          ['**Re-enable access**', 'Danh sách · hồ sơ công ty', 'Bật lại với **vai trò cũ**; mở lại cửa đăng nhập', 'Không có chặn admin (chỉ **thêm** quyền)'],
          ['**Reset password**', '**Chỉ hồ sơ công ty**, chỉ dòng *Active*', 'Gửi link đặt mật khẩu 72 giờ', 'Mật khẩu cũ **vẫn chạy** tới khi link được dùng'],
          ['**Delete account**', 'Chỉ danh sách', '**Cả tài khoản**: mọi chỗ ngồi kết thúc, đăng xuất, huỷ dữ liệu cá nhân sau 72 giờ, email giữ thêm 30 ngày sau đó; người đó nhận **biên nhận qua email**', '**Không** có chặn Super admin cuối cùng — biên nhận trên màn hình liệt kê công ty vừa **mất admin** (và công ty **không còn ai**)'],
          ['**Restore account**', 'Tab *Deleted*', 'Trả lại tài khoản và **đúng những chỗ ngồi lần xoá đã kết thúc**; huỷ lịch huỷ dữ liệu', 'Chỗ ngồi đã bị gỡ **trước** lần xoá vẫn gỡ. Không chỗ ngồi nào quay lại → tài khoản về nhưng **không đăng nhập được**'],
        ],
      },

      { kind: 'h', text: '§7 · Xoá tài khoản và tab Deleted', path: '/users/company-users?status=DELETED' },
      {
        kind: 'table',
        heading: 'Hai người được xoá',
        cols: ['', 'Chính người đó (Company site → Account)', 'HQ (*Delete account*)'],
        rows: [
          ['Xác nhận', '**Nhập lại mật khẩu**; sai 5 lần → khoá thử lại 15 phút', 'Hộp xác nhận nói rõ 72 giờ và ngày email được dùng lại'],
          ['Bị chặn khi', 'Là **admin cuối cùng** của một công ty còn người khác → *bàn giao vai trò admin trước* (`SVN-2028`). Là **người cuối cùng** của một công ty (admin hay không) → *liên hệ HQ để đóng tài khoản công ty* (`SVN-2029`)', '**Không chặn** — HQ chính là người xử lý các ca đó'],
          ['Sau khi xoá', 'Đăng xuất ngay; màn hình “tài khoản đã xoá”', 'Biên nhận: thời điểm huỷ, ngày email được dùng lại, **danh sách công ty mất admin** kèm link'],
          ['Ai được báo', 'Chỉ chính người đó (email biên nhận)', 'Như vậy — **không** báo admin khác hay sales rep'],
        ],
      },
      {
        kind: 'table',
        heading: 'Tab Deleted — một dòng là một TÀI KHOẢN',
        note: 'Lọc theo **Erasure** (*All · Pending · Erased*), tìm theo tên/email (chỉ trước khi huỷ). **Không có Export** ở tab này.',
        cols: ['Cột', 'Nghĩa'],
        rows: [
          ['**Member**', 'Tên + email — sau khi huỷ đọc là **Erased account**'],
          ['**Companies**', 'Các công ty **lần xoá đã cắt** (có thể rỗng nếu lúc xoá không còn chỗ ngồi nào)'],
          ['**Deleted at**', 'Thời điểm xoá'],
          ['**Deleted by**', '**Withdrawn** (tự xoá) hoặc **HQ** kèm tên operator'],
          ['**Erasure**', '*Due {ngày giờ}* (còn khôi phục được) · *Erased {ngày giờ}*'],
          ['**Email held until**', 'Ngày email được dùng lại = huỷ + 30 ngày'],
        ],
      },
      {
        kind: 'list',
        heading: 'Những gì ở lại với công ty',
        items: [
          'Tin tuyển dụng, đơn ứng tuyển, CV đã mở khoá, ghi chú, danh sách đã lưu, hoá đơn, credit — **của công ty**, không đi theo người.',
          'Nhãn *“Unlocked by / saved by”* **giữ tên người đó** kể cả sau khi huỷ.',
          '**Trường liên hệ trên tin tuyển dụng** (người liên hệ, email nhận hồ sơ) **không bị đụng tới** — công ty tự sửa.',
          'Lần huỷ có thể chạy **sớm tới 5 phút** trước giờ hẹn (job quét định kỳ). Đừng hứa với khách “khôi phục được tới đúng 14:00”.',
        ],
      },
      {
        kind: 'example',
        heading: 'Ví dụ — Super admin duy nhất của một khách nghỉ việc',
        scenario: 'Công ty ABC có hai người: chị Lan (Super admin) và anh Minh (Recruiter). Chị Lan nghỉ, không ai bàn giao.',
        cols: ['#', 'Ai · ở đâu', 'Điều xảy ra'],
        rows: [
          ['1', 'Chị Lan · Company site → Xoá tài khoản', '**Bị chặn** (`SVN-2028`): còn anh Minh, phải bàn giao Super admin trước'],
          ['2', 'HQ · Company users → dòng chị Lan → *Disable access*', '**Bị chặn** (409): công ty phải còn ít nhất một admin đang hoạt động'],
          ['3', 'HQ · hồ sơ ABC → *Users* → anh Minh → *Change role* → Super admin', 'Anh Minh giờ là admin; ABC có 2 Super admin'],
          ['4', 'HQ · dòng chị Lan → *Disable access*', 'Được. Chị Lan không đăng nhập được; mọi tin chị đăng **vẫn của ABC**'],
          ['5', '*(thay vì 3–4)* HQ · dòng chị Lan → *Delete account*', 'Được ngay — biên nhận báo **“ABC now has no active admin (1 other member)”**. HQ vẫn phải làm bước 3'],
        ],
        note: 'Đường 3 → 4 là đường đúng: không để công ty nào rơi vào trạng thái không có ai mời / tắt được người.',
      },

      { kind: 'h', text: '§8 · Trang này nằm ở đâu trong chuỗi' },
      {
        kind: 'table',
        cols: ['Màn hình', 'Liên quan thế nào'],
        rows: [
          ['**CRM → Customers → hồ sơ công ty → tab Users**', 'Cùng dữ liệu, nhìn từ một công ty. **Nơi duy nhất** có *Invite user*, *Reset password* và trình sửa vai trò của khách. Dấu **Contact** trên một dòng = cùng một người cũng có bản ghi liên hệ — hai danh sách **không sinh ra nhau**'],
          ['**CRM → Sign-ups**', 'Người tự đăng ký **chưa phải** chỗ ngồi. Chỉ khi HQ *Create company & activate* hoặc *Move to existing company* thì một dòng mới xuất hiện ở đây'],
          ['**CRM → Claim requests**', 'Là việc **sales xin quyền phụ trách** một công ty Free data — **không tạo ra tài khoản đăng nhập nào**. Đừng nhầm với “khách xin vào công ty”'],
          ['**CRM → Customers → Archive**', 'Công ty bị archive thì **mọi** thành viên bị từ chối đăng nhập (`SVN-2023`), dù chỗ ngồi vẫn *Active* ở đây'],
          ['**System → Audit log**', 'Các sự kiện `company_member.*`, `company_user.read` (export)'],
          ['**Jobseeker users**', 'Một tập tài khoản **khác hẳn**. Một người có thể vừa là ứng viên vừa là nhà tuyển dụng với hai tài khoản riêng'],
        ],
      },
      {
        kind: 'warn',
        text:
          '**Sửa lại hai điều trang này từng nói.** (1) *“Deactivate giải phóng chỗ ngồi; Reactivate chiếm lại một chỗ và bị chặn nếu công ty đã dùng hết”* — **chưa có trong bản dựng**: không có giới hạn số chỗ ngồi nào (`users-panel.tsx`: *“the seat CAP is not modelled yet”*), Re-enable không bao giờ bị chặn vì hết chỗ. (2) *“Yêu cầu xoá dữ liệu cá nhân đi qua hỗ trợ, không qua nút tự phục vụ”* — **đã khác**: Company site có **tự xoá tài khoản** (bật từ đợt 24/09, `corporate-account-deletion`). Điều vẫn đúng: người dùng **không tự Disable** chỗ ngồi của mình được (400 *“A member cannot remove their own membership”*).',
      },
      {
        kind: 'open',
        text:
          '**Còn để ngỏ.** Giới hạn số chỗ ngồi theo gói (nếu có) — chưa mô hình hoá ở svn-be. Che email trên lưới + audit khi bỏ che — chưa làm (cùng việc với Jobseeker users). Backend có `POST /auth/recovery/find-id/corporate` (tìm tài khoản theo số điện thoại đã xác thực + MST) nhưng svn-web mới có schema, **chưa thấy màn hình gọi nó** — chưa xác minh trên UI.',
      },

      {
        kind: 'p',
        text: '**Đầu kia của tài khoản này — Company site.** Trang admin quản *tư cách thành viên*; còn đây là thứ người đó thực sự đăng nhập vào.',
      },
      {
        kind: 'shot',
        src: '/shots/co-00-landing.jpg',
        where: 'Company site',
        caption: 'Trang nhà tuyển dụng khi **chưa đăng nhập** (`dev.hiring.svn.topdev.asia`). Thanh menu trên cùng chính là toàn bộ những gì một nhà tuyển dụng làm được: **Tin tuyển dụng · Kho ứng viên · Quản lý ứng viên · Sản phẩm tuyển dụng · Đăng tin**.',
        note: 'Hai banner ngang trên trang vẫn là **ảnh tiếng Hàn chưa thay** — nội dung marketing của bản KR, cần bản Việt trước khi khách nhìn thấy.',
      },
      {
        kind: 'shot',
        src: '/shots/co-01-signin.jpg',
        where: 'Company site',
        caption: 'Màn đăng nhập — **một lần đăng nhập cho cả hai site**, chọn tab *Ứng viên* hay *Nhà tuyển dụng*. Đăng nhập phía nhà tuyển dụng được phục vụ bởi `dev.svn.topdev.asia/auth/sign-in?tab=employer` rồi đưa ngược về trang nhà tuyển dụng.',
        note: '**Không có ô đặt mật khẩu ở đây cho người được mời.** Đồng nghiệp vào bằng lời mời qua email và tự đặt mật khẩu — giống hệt cách nhân viên Saramin được tạo tài khoản.',
      },
      {
        kind: 'p',
        text:
          '**Nguồn** (08/10/2026, `origin/dev`): saramin-vn-admin `45954108` — `modules/user/company-users/*`, `modules/crm/companies/{users-panel,invite-user-dialog,company-roles-panel}.tsx`, `docs/features/company-users.md`; svn-be `ee1db5ea9` — `CompanyMembershipService` (invite TTL 72h, cooldown 60s, luật admin cuối cùng), `CompanyUserAuthService` (magic link 1h), `CompanyPermissionCatalog`, `PasswordPolicy`, `V110/V111` (vai trò theo công ty), `docs/COMPANY_USER_DELETION_FE_API.md`; svn-web `d8a43a11` — `features/auth/corporate/lib/sign-in-error.ts`, `const/live-features.ts`.',
      },
    ],
  },

  departments: {
    logic: [
      'Sơ đồ tổ chức nội bộ của Saramin: **cây hai tầng** — một phòng ban, và các team bên trong nó. **Một team đơn giản là một phòng ban có cha** — cùng trang, cùng quyền. **Không có tầng thứ ba.**',
      'Phòng ban trả lời câu hỏi **“người này ngồi ở đâu”**. Nó là một trong ba mảnh ghép: *phòng ban* (ngồi ở đâu) × *vai trò* (được làm gì) × *Edit & sales reach* (sửa và bán được trên công ty nào) — xem **Logic chung — Organisation**.',
      'Trang này **chỉ nói về nhân viên Saramin (HQ operator)**. Người dùng phía công ty trên site nhà tuyển dụng có vai trò riêng và **không bao giờ xuất hiện ở đây**.',
      '**Cây này được hệ thống đọc ở hai chỗ**: phạm vi *Their team’s companies* (ai thấy bản ghi của ai) và **chuỗi duyệt chiết khấu** (yêu cầu đi lên leader team, rồi leader phòng ban). Sửa cây là sửa cả hai.',
    ],
    how: [
      '**New department** để tạo phòng ban gốc; mở phòng ban đó rồi **Add team** để tạo team bên trong.',
      'Mở trang của một nút (`/system/departments/:id`) bằng menu **⋮ → View detail**, hoặc bấm **tên nút** (là một link). ⚠️ **Bấm vào khoảng trống của dòng không còn mở trang nữa** — bản dựng đã bỏ hành vi đó, mọi thao tác dồn vào menu ⋮. Trang nút có danh sách thành viên (mỗi người link sang trang tài khoản), các team con, và hai nút *Add team* / *Delete*.',
      'Menu **⋮** trên một dòng: **View detail · Add team** *(chỉ trên dòng phòng ban)* **· Edit · Delete**.',
      'Đặt **Leader** cho từng nút — **sau khi** đã có người, vì leader phải là một operator đang hoạt động.',
      'Tìm theo **tên nút hoặc tên leader**; tìm trúng một team thì phòng ban của nó vẫn hiện làm ngữ cảnh. Từ trang một nút, *Show these operators in Users* mở danh sách Users đã lọc theo nút đó.',
    ],
    watch: [
      '**Leader một mình không cấp quyền mở trang nào — nhưng nó MỞ RỘNG phạm vi “Their team’s companies”.** Người giữ một vai trò ở phạm vi *Their team’s companies* thấy người ở **nút mình ngồi**, **cộng mọi nút mình làm leader và các team con của nút đó**. Không giữ vai trò phạm vi team thì làm leader không thêm gì. (Sửa lại câu cũ “làm leader không cấp thêm quyền gì cả” — xem hộp lưu ý bên dưới.)',
      '**Parent chỉ chọn được lúc tạo và không đổi được sau đó — không có thao tác “move”.** Muốn chuyển một team sang phòng ban khác: tạo team mới dưới phòng ban đúng → chuyển người sang → xoá team cũ.',
      '**Xoá một nút thì người vẫn còn.** Thành viên giữ nguyên tài khoản và chỉ đơn giản là **không thuộc phòng ban nào** — và vì thế, nếu họ giữ vai trò phạm vi team mà không làm leader nút nào, họ **không còn thấy gì** ở phạm vi đó. Hộp thoại xác nhận có nói rõ việc mất phòng ban.',
      '**Phòng ban còn team thì không xoá được.** Xoá hoặc làm rỗng các team trước — tái cơ cấu **không bao giờ là một thao tác dây chuyền**.',
      'Tên chỉ cần **duy nhất trong cùng một cấp** — hai phòng ban đều có thể có một team tên “Team A”.',
    ],
    blocks: [
      {
        kind: 'warn',
        text:
          '**Trên production (đọc 12/11/2026):** 7 phòng ban gốc đã được migrate sang — *Customer Service* (17 người) · *HCM Sales Team 1* (57) · *HCM Sales Team 2* (36) · *HN (Paused)* (10) · *KR Sales Team* (5) · *Talent Success* (14) · *Team Test* (3). **Chưa nút nào có team con và chưa nút nào có leader.** Hướng dẫn dựng tài khoản thật theo thứ tự nằm ở **Logic chung — Organisation, phần A**.',
      },
      {
        kind: 'table',
        heading: 'Quyền cần có',
        note: 'Dòng **Departments** trong nhóm **Organisation** của lưới quyền. Thẻ *Members* trên trang một nút đọc danh bạ operator nên **cần thêm `user:read`** — thiếu thì thẻ nói rõ, không hiện danh sách rỗng.',
        cols: ['Muốn làm', 'Cần'],
        rows: [
          ['Xem cây, mở trang một nút', '`department:read`'],
          ['*New department* · *Add team*', '`department:create`'],
          ['Đổi tên · đặt / bỏ Leader', '`department:update`'],
          ['*Delete*', '`department:delete`'],
          ['Chuyển **một người** sang nút khác', '`user:move_department` — làm trên **trang người đó** (Users), không ở đây'],
        ],
      },
      {
        kind: 'table',
        heading: 'Ba câu hỏi, ba nơi trả lời',
        note: '**Người dùng là nơi ba thứ gặp nhau.** Một phòng ban tự thân không cấp gì; một vai trò tự thân không với tới ai. Cái một operator thấy hằng ngày là: *các trang vai trò của họ mở ra* × *các bản ghi phạm vi của họ cho phép*.',
        cols: ['Câu hỏi', 'Trả lời ở', 'Ví dụ'],
        rows: [
          ['**Người này ngồi ở đâu?**', '*Departments* → rồi chọn trên người dùng', 'Sales › Sales SVN 2'],
          ['**Họ được làm gì?**', '*Roles* → rồi gán trên người dùng', 'Sale member: đọc + sửa Companies, tạo báo giá…'],
          ['**Sửa được trên dữ liệu nào?**', '**Edit & sales reach** chọn lúc gán vai trò', 'All companies · Their team’s companies · Only their own companies'],
        ],
      },
      {
        kind: 'table',
        heading: 'Thứ tự dựng — mỗi bước cần bước trước',
        cols: ['#', 'Bước', 'Ở đâu', 'Vì sao đúng thứ tự này'],
        rows: [
          ['1', 'Tạo phòng ban, rồi tạo team bên trong', 'Departments → *New department*, rồi *Add team*', 'Chỉ đặt người vào được một nút **đã tồn tại**'],
          ['2', 'Tạo vai trò và tick quyền', 'Roles → *New role*', 'Một lời mời **bắt buộc** mang ít nhất một vai trò'],
          ['3', 'Mời người', 'Users → *Invite user*', 'Chọn phòng ban, vai trò và phạm vi **trong cùng một form**'],
          ['4', 'Đặt leader cho từng phòng ban / team', 'Departments → mở nút → *Leader*', 'Leader phải là operator **đang hoạt động** — người đó phải tồn tại trước'],
        ],
      },

      { kind: 'h', text: '§1 · Danh sách', path: '/system/departments' },
      {
        kind: 'table',
        heading: 'Các cột trong danh sách',
        note: 'Cây được dựng **trước khi** chia trang, nên một trang chứa N phòng ban **cùng các team của chúng** — không bao giờ cắt đôi một phòng ban.',
        cols: ['Cột', 'Nghĩa'],
        rows: [
          ['**Department**', 'Tên — tag *Team* đánh dấu một dòng là team; bấm mũi tên để mở các team'],
          ['**Teams**', 'Phòng ban này có mấy team (trên một dòng team thì là **—**)'],
          ['**Members**', 'Số operator **đặt trực tiếp** trên nút này. Số của một phòng ban **không bao gồm** thành viên của các team con'],
          ['**Leader**', 'Leader của nút, hoặc *No leader*'],
        ],
      },
      {
        kind: 'table',
        heading: 'Form tạo (hộp thoại) — chỉ hai ô',
        note: '**Add team** mở cùng hộp thoại với dòng *“This team will sit inside {phòng ban}”* — cha đã được chọn sẵn và khoá. Dòng team **không có** *Add team*.',
        cols: ['Ô', 'Bắt buộc', 'Luật'],
        rows: [
          ['**Name** / **Team name**', 'Có (*“This field is required.”*)', 'Tối đa 255 ký tự; server cắt khoảng trắng hai đầu. **Trùng tên với một nút cùng cấp → 409**'],
          ['**Leader**', 'Không', 'Chọn trong các operator **đang hoạt động**. Không cần là thành viên của nút. Operator đã vô hiệu hoá → **400** *“Department leader must be an active admin user”*'],
        ],
      },

      { kind: 'h', text: '§2 · Trang một nút', path: '/system/departments/:id' },
      {
        kind: 'table',
        cols: ['Vùng', 'Có gì'],
        rows: [
          ['Đầu trang', 'Tên, tag *Team*, đường dẫn đầy đủ (`Sales › Team A`), *Cancel* / *Save*. **Save chỉ bật khi có gì thật sự khác** — gõ một ký tự rồi xoá đi thì Save tắt lại; khoảng trắng thừa không tính'],
          ['**Details**', '**Name** và **Leader** — hai ô duy nhất sửa được. Xoá Leader là gửi “không có leader” thật sự'],
          ['**Placement**', '*Type* (phòng ban gốc / team) và *Inside* (cha) — **chỉ đọc**, kèm lý do: *“Parent and type cannot be changed once the unit exists.”*'],
          ['**Actions**', '*Add team* (chỉ phòng ban) và *Delete* — Delete bị khoá kèm số team khi còn team'],
          ['**Members**', 'Operator đặt **trực tiếp** trên nút: tên, chức danh, trạng thái, vai trò, link sang trang của họ; cộng một dòng *“N more sit in its teams”*'],
          ['**Teams**', 'Các team con và số thành viên của từng team, mỗi team link sang trang của nó'],
        ],
      },
      {
        kind: 'p',
        text:
          '**Không có thẻ ngày tạo / ngày sửa** — svn-be không trả các trường đó. Lịch sử một nút xem ở *System → Audit log*: `department.create`, `department.update` (ghi các trường đổi), `department.delete`.',
      },

      { kind: 'h', text: '§3 · Một thay đổi trên cây kéo theo gì' },
      {
        kind: 'table',
        cols: ['Bạn làm', 'Hệ quả ngay', 'Hệ quả ở module khác'],
        rows: [
          ['**Tạo** một nút', 'Nút rỗng, chưa ai ngồi', 'Chưa gì — tới khi có người hoặc có leader'],
          ['**Đặt Leader** cho một nút', 'Cột Leader đổi', '(1) Nếu leader giữ vai trò phạm vi *Their team’s companies*: họ **thấy thêm** bản ghi của mọi người trong nút đó (và các team con nếu là phòng ban). (2) **Duyệt chiết khấu**: yêu cầu của người trong team đi tới leader team; team không có leader (hoặc leader chính là người xin) thì **leo lên** leader phòng ban'],
          ['**Bỏ Leader**', 'Cột Leader → *No leader*', 'Người đó mất tầm nhìn team ở nút này; yêu cầu chiết khấu leo lên cấp trên — phòng ban gốc không có leader thì yêu cầu **không tạo được**'],
          ['**Đổi tên**', 'Tên mới ở mọi nơi hiển thị', 'Không đổi quyền gì'],
          ['**Xoá** một nút (không còn team)', 'Thành viên **mất phòng ban**', 'Người đó (nếu không làm leader nút nào) **mất toàn bộ tầm nhìn “team”**; cột phòng ban của họ ở Users đổi thành trống'],
          ['**Xoá operator đang là leader** (ở Users)', 'Nút thành *No leader*', 'Như *Bỏ Leader*'],
        ],
      },
      {
        kind: 'warn',
        text:
          '**Sửa một điều trang này (và trang Logic chung — Organisation) từng nói.** Câu cũ: *“Làm leader của một nút không cấp thêm quyền gì cả”* và kịch bản test *“Đặt leader là người không phải thành viên → leader đó không có thêm tầm nhìn nào”*. Bản dựng (`DepartmentRepositoryAdapter.teamVisibleNodeIds`, svn-be `ee1db5ea9`): tầm nhìn phạm vi team = **nút người đó ngồi** + **mọi nút họ làm leader** + **các team con của nút họ làm leader**. Vậy leader **có** thêm tầm nhìn — **nếu** họ giữ một vai trò ở phạm vi *Their team’s companies*. Điều vẫn đúng: leader **không mở thêm trang nào**, và người không giữ vai trò phạm vi team thì làm leader không đổi gì. Hệ quả thứ hai: **một thành viên thường ngồi ở phòng ban gốc không thấy các team bên dưới** — chỉ leader phòng ban mới thấy xuống team.',
      },
      {
        kind: 'example',
        heading: 'Ví dụ — dựng một team sales',
        scenario: 'Kết quả: nhân viên sales thấy khách của chính mình; team leader thấy của cả team; quản lý thấy toàn bộ Sales. Chuyển một nhân viên sang team kia **chỉ là một thay đổi** — phòng ban trên trang người dùng của họ.',
        cols: ['#', 'Trang', 'Làm gì'],
        rows: [
          ['1', 'Departments', 'Tạo **Sales**; bên trong thêm team **Sales SVN 1** và **Sales SVN 2**'],
          ['2', 'Roles', 'Tạo **Sale member** (Companies: Read + Update · Quotations: Create + Read + Update · **không** Export), rồi **Duplicate** thành **Sale leader** và thêm *Daily activity log: Read*, *Sales dashboard: Read*'],
          ['3', 'Users', 'Mời **quản lý** vào *Sales* với vai trò *Sale leader* ở phạm vi **All companies**'],
          ['4', 'Users', 'Mời **từng leader** vào team của họ với *Sale leader* ở phạm vi **Their team’s companies**'],
          ['5', 'Users', 'Mời **từng nhân viên** vào team của họ với *Sale member* ở phạm vi **Only their own companies**'],
          ['6', 'Departments', 'Mở Sales SVN 1 và 2 → đặt **Leader** cho mỗi team. Đặt quản lý làm **Leader của Sales** để yêu cầu chiết khấu của team không có leader leo lên được tới họ'],
        ],
        note: 'Nếu quản lý ở bước 3 được gán *Their team’s companies* thay vì *All companies*, họ vẫn thấy cả hai team — **vì họ là leader của Sales** (bước 6). Không đặt leader thì họ chỉ thấy người ngồi trực tiếp ở *Sales*.',
      },
      {
        kind: 'table',
        heading: 'Thông báo bạn sẽ gặp',
        cols: ['Thông báo', 'Vì sao', 'Làm gì'],
        rows: [
          ['Hộp xoá: *“This department still has N teams. Delete them first…”* (OK bị khoá)', 'Phòng ban còn team', 'Xoá hoặc làm rỗng từng team trước'],
          ['Hộp xoá: *“Its N members keep their accounts — they are simply left without a department.”*', 'Nút còn người', 'Đọc rồi quyết; chuyển người sang nút khác trước nếu cần giữ tầm nhìn team của họ'],
          ['409 khi lưu tên', 'Trùng tên với nút **cùng cấp**', 'Đặt tên khác'],
          ['400 khi chọn Leader', 'Người đó không còn hoạt động', 'Chọn người khác'],
          ['Thẻ Members: *“…needs the user: read permission”*', 'Vai trò không có `user:read`', 'Xin thêm quyền, hoặc xem ở Users'],
        ],
      },
      {
        kind: 'p',
        text:
          '**Nguồn** (08/10/2026): saramin-vn-admin `45954108` — `modules/system/departments/*`, `docs/features/departments.md`, `i18n/messages/en/departments.json`; svn-be `ee1db5ea9` — `DepartmentService` (luật tên/leader/xoá, `approverFor`), `DepartmentRepositoryAdapter.teamVisibleNodeIds`.',
      },
    ],
  },

  users: {
    logic: [
      'Tài khoản **nhân viên Saramin (HQ operator)** — khác hẳn tài khoản ứng viên (*Users → Jobseeker users*) và tài khoản khách hàng (*Users → Company users*). Ba tập này **không bao giờ lẫn vào nhau**.',
      'Người dùng là **nơi ba mảnh gặp nhau**: phòng ban (ngồi ở đâu) × vai trò (được làm gì) × **Edit & sales reach** chọn lúc gán vai trò (sửa và bán được trên công ty nào). Luật chung ở **Logic chung — Organisation**; trang này nói về màn hình.',
      '**Không có ô mật khẩu.** Tài khoản được tạo ra **không có mật khẩu** và người đó nhận một **link dùng một lần (sống 72 giờ)** để tự đặt. Không ai khác từng biết mật khẩu đó.',
      '**Trạng thái không được lưu, mà suy ra**: chưa đặt mật khẩu → *Pending*; đã đặt → *Active*; bị tắt → *Inactive*.',
    ],
    how: [
      '**Invite user** → họ tên · email · số điện thoại · chức danh · **phòng ban** · **extension** (cho tổng đài) · **ít nhất một vai trò**, mỗi vai trò kèm **Edit & sales reach** của nó.',
      'Lọc danh sách (tìm theo tên hoặc email — **không phân biệt dấu**; lọc theo phòng ban — chọn một phòng ban **bao gồm cả các team của nó**; lọc theo vai trò; và các tab trạng thái có số đếm), rồi mở một người bằng menu **⋮ → View detail** hoặc bấm **tên họ**. ⚠️ **Bấm vào khoảng trống của dòng không còn mở trang nữa.**',
      'Trang của một người (`/system/users/:id`): hồ sơ bên trái (phòng ban, chức danh, điện thoại, extension); bên phải là các hành động tài khoản, khối **Roles & edit and sales reach** có nút Save riêng, và **10 hành động gần nhất** của người đó lấy từ audit log.',
      'Menu ⋮ trên dòng: *View detail* · *Edit* · *Manage roles* · *Reset password* **hoặc** *Resend invite link* (tuỳ trạng thái) · *Activate* / *Deactivate* · *Delete user*.',
    ],
    watch: [
      '**Bạn không đổi được vai trò của chính mình** — phải nhờ một admin khác (403 *“You cannot change your own role assignments”*, kể cả khi lưu mà không đổi gì).',
      '**Chỉ HQ Admin mới phong được HQ Admin cho người khác.** Và một admin không phải HQ **không gán được vai trò mang quyền mà chính họ không có**.',
      '**Không ai gõ mật khẩu hộ người khác.** Người được mời bấm link và tự đặt mật khẩu.',
      'Đổi vai trò của người đang đăng nhập thì họ phải đăng xuất vào lại (hoặc chờ phiên làm mới) mới thấy quyền mới.',
      '**Resend invite có cooldown 60 giây** cho mỗi người — bấm lại quá nhanh sẽ nhận “try again shortly”.',
      '**Phạm vi phải chọn tường minh.** Nút *Add* trong khối vai trò khoá cho tới khi chọn phạm vi — không có mặc định *All companies*. Chọn vai trò mà chưa bấm *Add* thì vai trò đó **không** nằm trong thứ được lưu (form có nhắc).',
      '**Email không đổi được** sau khi mời — nó là định danh tài khoản. Gõ nhầm email thì *Delete user* (chưa làm gì nên xoá được) rồi mời lại.',
    ],
    blocks: [
      {
        kind: 'warn',
        text:
          '**Trên production (đọc 12/11/2026):** **214 tài khoản đã migrate** — **7 Active · 45 Pending · 162 Inactive**, gần như tất cả đang là **“No roles”**. Vậy nên việc chính **không phải là *Invite user***, mà là: mở từng người → gán **vai trò + Edit & sales reach** → **Activate** (tài khoản chưa có mật khẩu nên chuyển sang **Pending**) → **Resend invite link**. Hướng dẫn đầy đủ kèm ảnh ở **Logic chung — Organisation, phần A**.',
      },
      {
        kind: 'table',
        heading: 'Quyền cần có',
        note: 'Trên lưới quyền, trang này là dòng **Operator accounts** (nhóm Organisation) — cố ý **không** gọi là “Users” để khỏi lẫn với *Company staff logins*. Dòng con **Move an operator’s team** nằm ngay dưới.',
        cols: ['Muốn làm', 'Cần'],
        rows: [
          ['Xem danh sách, mở trang một người', '`user:read`'],
          ['*Invite user*', '`user:create`'],
          ['Sửa hồ sơ · *Manage roles* · *Reset password* · *Resend invite* · *Activate/Deactivate*', '`user:update`'],
          ['*Delete user*', '`user:delete`'],
          ['Ô **Department or team** (trên form mời và trang người đó)', '`user:move_department` — quyền riêng, để leader sắp lại team bên dưới mà **không** được đổi tên hay vô hiệu hoá đồng nghiệp'],
          ['Cột / ô **Extension**', '`telephony_call:assign`'],
          ['Thẻ **Recent activity**', '`audit_log:read` ở phạm vi **All companies** — thiếu thì thẻ không hiện'],
        ],
      },

      { kind: 'h', text: '§1 · Danh sách', path: '/system/users' },
      {
        kind: 'table',
        heading: 'Cột',
        cols: ['Cột', 'Nghĩa'],
        rows: [
          ['**User**', 'Tên + email'],
          ['**Department / title**', 'Nút người đó ngồi (đường dẫn đầy đủ) + chức danh'],
          ['**Phone**', 'Số điện thoại, hoặc —'],
          ['**Extension**', '*(chỉ với `telephony_call:assign`)* Máy lẻ Callio. **Not set** = cuộc gọi của người này về **không có ai nhận công** và nằm ở hàng chờ chưa gán — một việc cần sửa, không phải ô trống'],
          ['**Roles**', 'Các vai trò đang giữ'],
          ['**Status**', '*Pending* (vàng) · *Active* (xanh) · *Inactive* (xám)'],
        ],
      },
      {
        kind: 'table',
        heading: 'Bộ lọc — đều nằm trên URL, chia sẻ link là thấy đúng view',
        cols: ['Bộ lọc', 'Chạy ở đâu', 'Lưu ý'],
        rows: [
          ['**Tìm** tên / email', 'Server', 'Không phân biệt dấu: “duc” tìm ra “Đức”. **Không tìm theo tên phòng ban** — dùng bộ lọc phòng ban'],
          ['**Department**', 'Trình duyệt', 'Cây chọn được cả phòng ban lẫn team; chọn phòng ban = phòng ban **và các team của nó**'],
          ['**Role**', 'Server', 'Theo vai trò'],
          ['**Tab trạng thái**', 'Trình duyệt', 'All · Active · Pending · Inactive, mỗi tab có số đếm; đổi tab về trang 1'],
        ],
      },

      { kind: 'h', text: '§2 · Mời một người' },
      {
        kind: 'table',
        heading: 'Form Invite user',
        cols: ['Ô', 'Bắt buộc', 'Luật / ghi chú'],
        rows: [
          ['**Full name**', 'Có', '—'],
          ['**Email**', 'Có, đúng định dạng', 'Link mời gửi tới đây; cũng là **địa chỉ đăng nhập**. Đã có tài khoản với email này → *“An admin user with this email already exists”*'],
          ['**Phone**', 'Không', 'Tối đa 32 ký tự'],
          ['**Title**', 'Không', 'Tối đa 255 ký tự'],
          ['**Department or team**', 'Không', 'Chỉ hiện với `user:move_department`. Chọn **team** nếu người đó thuộc một team — team đã nằm trong phòng ban'],
          ['**Phone extension**', 'Không', 'Chỉ hiện với `telephony_call:assign`. Chọn máy lẻ đang thuộc người khác → *“Saving moves it here; their past calls stay theirs”*'],
          ['**Roles & edit and sales reach**', '**Ít nhất một**', '*“Assign at least one role before sending the invite.”* Mỗi dòng = một vai trò + một phạm vi'],
        ],
      },
      {
        kind: 'list',
        items: [
          '**Mời = tạo tài khoản ngay**, ở trạng thái *Pending*, kèm email chứa link đặt mật khẩu (72 giờ).',
          '**Các vai trò khác phạm vi nhau** thì hệ thống tạo tài khoản **không vai trò** trước rồi ghi danh sách vai trò thật ở bước hai. Bước hai lỗi → bạn được đưa tới trang người đó kèm lỗi, tài khoản đã tồn tại — **đừng mời lại**, sửa vai trò ở đó.',
          '**Extension là phần duy nhất được phép lỗi riêng**: lời mời vẫn đi, một cảnh báo nói máy lẻ chưa gắn — mở người đó và chọn lại.',
          'Chỉ **vai trò toàn hệ thống** chọn được. Một gán vai trò cũ kiểu “@ công ty” vẫn hiện và gỡ được, nhưng **không tạo mới được**.',
        ],
      },

      { kind: 'h', text: '§3 · Trạng thái và vòng đời' },
      {
        kind: 'table',
        heading: 'Ba trạng thái tài khoản',
        cols: ['Trạng thái', 'Nghĩa', 'Vào bằng cách nào', 'Hành động tiếp'],
        rows: [
          ['**Pending**', 'Đã mời, **chưa đặt mật khẩu** — chưa đăng nhập được', '*Invite user*; hoặc *Reset password* trên một người Active', '*Resend invite link* (link mới, link cũ chết; 429 trong 60 giây) · *Deactivate* · *Delete*'],
          ['**Active**', 'Đã đặt mật khẩu, tài khoản đang chạy', 'Người đó đặt mật khẩu qua link', '*Reset password* — **xoá mật khẩu, gửi link mới, đăng xuất họ ở mọi nơi**, dòng về *Pending* · *Deactivate*'],
          ['**Inactive**', 'Bị admin vô hiệu hoá; hồ sơ và lịch sử giữ nguyên', '*Deactivate* — **phiên đang mở bị thu hồi ngay**', '*Activate* — vào lại với **đúng vai trò cũ**'],
        ],
      },
      {
        kind: 'table',
        heading: 'Deactivate và Delete — hai nút, hai nghĩa khác hẳn',
        note: '**Dòng cuối là chủ đích:** lịch sử “ai đã làm việc này” **bắt buộc phải sống sót**. Người đã từng làm việc trong hệ thống thì **chỉ vô hiệu hoá được**, không xoá được.',
        cols: ['', 'Deactivate', 'Delete'],
        rows: [
          ['Quyền', '`user:update`', '`user:delete`'],
          ['Tác dụng', 'Giữ tài khoản, không đăng nhập được, liệt kê là *Inactive*', '**Xoá hẳn tài khoản**, vai trò và lời mời đang chờ; giải phóng email. Nút người đó làm leader thành **không có leader**'],
          ['Dùng cho', 'Người đã nghỉ hoặc đang tạm dừng', 'Lời mời gõ nhầm, trùng lặp, người chưa từng đăng nhập'],
          ['Bị từ chối khi', 'Chính bạn · super-admin gốc · **HQ Admin đang hoạt động cuối cùng**', 'Y như trên, **cộng thêm** bất kỳ ai đã từng làm việc trong hệ thống (tạo công ty, báo giá, đơn hàng, là sales owner của khách, có nhật ký hoạt động…)'],
          ['Lịch sử', 'Còn', 'Dòng audit `user.delete` (email đã che) **vẫn còn** sau khi tài khoản mất'],
        ],
      },
      {
        kind: 'table',
        heading: 'Edit & sales reach — nơi Departments và Roles gặp nhau',
        note: '**Phòng ban chọn trên người dùng + các nút họ làm leader** định nghĩa “team của họ”; **phạm vi chọn trên vai trò** là độ vươn của quyền đó. Đổi một trong ba thì phạm vi **sửa và bán** đổi theo (việc xem công ty thì không). **Một người giữ được hai vai trò ở hai phạm vi khác nhau** — ví dụ Sales ở *Only their own companies* và Marketing ở *All companies*. Một vai trò **tự giới hạn sẵn** thì giữ giới hạn của nó dù bạn chọn rộng hơn.',
        cols: ['Phạm vi', 'Người đó thấy', 'Ai thường giữ'],
        rows: [
          ['**All companies**', 'Mọi bản ghi mà các trang của vai trò đó hiện', 'HQ Admin, quản lý, vận hành'],
          ['**Their team’s companies**', 'Bản ghi của người **ngồi cùng nút** với họ, **cộng** người trong **mọi nút họ làm leader và các team con của nút đó**. Không ngồi đâu và không làm leader đâu → **không thấy gì**', 'Team leader'],
          ['**Only their own companies**', 'Bản ghi được gán **cho đích danh họ** (công ty của họ, báo giá của họ)', 'Nhân viên sales'],
        ],
      },
      {
        kind: 'warn',
        text:
          '**Sửa lại dòng *Their team’s companies*.** Trang này từng ghi “chính phòng ban / team của họ — **và các team bên dưới nó**”. Bản dựng (svn-be `DepartmentRepositoryAdapter.teamVisibleNodeIds`): các team bên dưới chỉ được tính khi người đó **là leader** của phòng ban. Một thành viên thường ngồi ở phòng ban gốc với phạm vi team **chỉ thấy người ngồi trực tiếp ở phòng ban đó**. Ngược lại, leader của một nút thấy nút đó **dù không ngồi ở đó**. Trang *Logic chung — Organisation* §5 còn câu cũ.',
      },

      { kind: 'h', text: '§4 · Trang của một người', path: '/system/users/:id' },
      {
        kind: 'table',
        cols: ['Vùng', 'Có gì'],
        rows: [
          ['Đầu trang', 'Tên + trạng thái, email bên dưới, *Cancel* / *Save* (cần `user:update`, chỉ bật khi form đổi)'],
          ['**Profile**', 'Tên · email (**chỉ đọc**) · điện thoại · chức danh · phòng ban (cần `user:move_department`) · extension (cần `telephony_call:assign`)'],
          ['**Account**', 'Resend invite / Reset password · Deactivate / Activate · Delete — cùng xác nhận và cùng quyền như menu ⋮, kèm một dòng giải thích trạng thái'],
          ['**Roles & edit and sales reach**', '**Save riêng**, ghi đè **toàn bộ** danh sách. Trên trang **của chính bạn** khối này chỉ đọc kèm lý do'],
          ['**Recent activity**', '10 sự kiện audit gần nhất người này gây ra + link mở audit log đã lọc theo họ'],
        ],
      },
      {
        kind: 'list',
        items: [
          '**Trên trang của chính mình, ô phòng ban cần phạm vi *All companies*.** Leader phạm vi team không tự chuyển mình sang nút khác được (ô bị khoá kèm lý do; server trả *“You cannot move yourself to another org node”*); chuyển người khác thì được.',
          '**Không có ngày tạo / lần đăng nhập cuối** — svn-be không trả các trường đó.',
          'Đăng nhập Admin: email + mật khẩu; **5 lần sai trong 15 phút → khoá 15 phút**. Mật khẩu: **8–128 ký tự, có chữ cái, số và ký hiệu**, không trùng email.',
        ],
      },

      {
        kind: 'table',
        heading: 'Các thông báo bạn sẽ gặp',
        cols: ['Thông báo', 'Vì sao', 'Làm gì'],
        rows: [
          ['“N operators still hold this role”', 'Vai trò đang có người giữ', 'Gỡ vai trò khỏi những người đó trước'],
          ['Xoá vai trò toàn quyền cuối cùng bị từ chối', 'Nó sẽ khoá cả console', 'Cấp toàn quyền cho một vai trò khác trước'],
          ['“You cannot change your own role assignments”', 'Bảo vệ chống tự phong quyền', 'Nhờ một admin khác'],
          ['“You cannot move yourself to another org node”', 'Leader phạm vi team tự chuyển mình', 'Nhờ người có phạm vi *All companies*'],
          ['Xoá user bị từ chối, có bản ghi tham chiếu tới họ', 'Họ đã từng làm việc trong hệ thống', '**Deactivate** thay vì xoá'],
          ['Deactivate bị từ chối', 'Chính bạn · super-admin gốc · HQ Admin hoạt động cuối cùng', 'Nhờ người khác / phong HQ Admin khác trước'],
          ['Xoá phòng ban bị từ chối', 'Nó vẫn còn team', 'Xoá hoặc làm rỗng các team trước'],
          ['“An admin user with this email already exists”', 'Lời mời đã gửi rồi', 'Tìm dòng **Pending** → *Resend invite link*'],
          ['Resend invite → “try again shortly”', '**Cooldown 60 giây** cho mỗi người', 'Chờ một phút'],
          ['Resend invite → 409', 'Người đó đã đặt mật khẩu', 'Dùng *Reset password*'],
        ],
      },
      {
        kind: 'table',
        heading: 'Nơi khác liên quan',
        cols: ['Ở đâu', 'Vì sao quan trọng ở đây'],
        rows: [
          ['**System → Audit log**', '**Mọi** lời mời, sửa hồ sơ, đổi vai trò, đặt lại mật khẩu, vô hiệu hoá và xoá đều được ghi kèm **ai đã làm** (`user.invite` · `user.update` · `user.assign_roles` · `user.reset_password` · `user.resend_invite` · `user.delete`)'],
          ['**CRM → Companies**', '*Only their own companies* và *Their team’s companies* quyết định nhân viên sales và leader **sửa và bán** được cho khách nào — **phạm vi cảm nhận rõ nhất ở đây**. Việc *thấy* thì không còn bị chặn (SRM-994)'],
          ['**Call centre**', '**Extension** trên người dùng là thứ nối các cuộc gọi về đúng họ'],
          ['**Departments**', 'Nút người đó ngồi, và các nút họ làm leader, định nghĩa “team” của họ'],
          ['**Company users** (site nhà tuyển dụng)', 'Một tập tài khoản và vai trò **riêng**; không gì trên trang này chạm tới nó'],
        ],
      },
      {
        kind: 'p',
        text:
          '**Nguồn** (08/10/2026): saramin-vn-admin `45954108` — `modules/system/users/*`, `docs/features/users.md`, `i18n/messages/en/users.json`, `configs/admin-pages.config.ts`; svn-be `ee1db5ea9` — `AdminUserManagementService` (link 72h, cooldown 60s, thu hồi phiên khi tắt), `AdminAuthService` (khoá đăng nhập), `PasswordPolicy`.',
      },
    ],
  },

  roles: {
    logic: [
      'Một **vai trò** là một cái tên, một mô tả, và **một lưới quyền**. Danh sách hiện số quyền mỗi vai trò cấp và **bao nhiêu operator đang giữ** nó.',
      '**Mọi vai trò đều sửa được** — kể cả các vai trò có sẵn (tag *Seeded*) như *HQ Admin*: đổi tên, đổi quyền, nhân bản, xoá. **Không có loại “vai trò hệ thống” bị khoá cứng** — chỉ có hai luật chống tự khoá (vai trò đang có người giữ; vai trò toàn quyền cuối cùng).',
      'Quyền dạng `resource:action`. **Phạm vi không đặt ở đây** — nó được chọn lúc **gán vai trò cho một người** ở trang Users.',
      '**Mỗi trang admin là một dòng** trên lưới, gom theo **9 nhóm giống sidebar**. Nhưng vài trang **không nằm ở nhóm bạn đoán**: xem bảng “Tìm dòng của một trang” bên dưới.',
      'Vai trò ở đây **chỉ dành cho nhân viên Saramin**. Vai trò của khách (Super admin, Recruiter…) sửa ở hồ sơ công ty — hai không gian **không bao giờ** gặp nhau.',
    ],
    how: [
      '**New role** (`/system/roles/new`) → đặt tên và mô tả → tick quyền trên lưới theo từng trang → **Create role** lưu tất cả một lần.',
      'Gần giống một vai trò có sẵn thì **Duplicate** — tạo “{tên} (copy)” với **toàn bộ** quyền; đổi tên rồi chỉnh.',
      'Dùng **dòng nhóm** và **Apply to all pages** để tick một hành động trên nhiều trang cùng lúc — khi đang tìm trang, nó chỉ áp cho **các trang khớp tìm kiếm**. Bộ đếm *X / N pages granted* cập nhật ngay, tổng và theo nhóm.',
      'Mở một vai trò bằng menu **⋮ → View detail** hoặc bấm **tên vai trò**. ⚠️ **Bấm vào khoảng trống của dòng không còn mở vai trò nữa**; menu ⋮ có **View detail · Duplicate · Delete**.',
      'Bấm số ở cột **Operators** để xem ai đang giữ vai trò; gỡ vai trò khỏi một người làm ở **Users**, không làm ở đây.',
    ],
    watch: [
      '**Create không bao hàm Read.** Bốn cột C · R · U · D **độc lập** — tick từng cái vai trò cần.',
      '**Export tách khỏi Read có chủ đích**: nhìn thấy các dòng và **mang tất cả chúng ra ngoài** là hai quyết định khác nhau.',
      '**Bạn không cấp được thứ bạn không có.** Một operator không phải HQ Admin chỉ tick được những quyền chính họ đang giữ (server trả 403).',
      '**Vai trò đang có người giữ thì không xoá được** — nút nói rõ bao nhiêu người. Gán lại cho họ trước.',
      '**Vai trò toàn quyền cuối cùng không xoá và không tước được** (toàn quyền = có cả `role:update` **và** `user:update` — cặp cho phép khôi phục mọi quyền khác). Đây là thứ giữ cho console không khoá hết mọi người ra ngoài.',
      '**Hai người sửa cùng một vai trò: lần lưu sau thắng, không cảnh báo gì.** Thống nhất ai sửa.',
      '**Đổi tên an toàn** — mã nội bộ (sinh tự động từ tên lúc tạo) giữ nguyên, nên mọi chỗ tham chiếu vẫn chạy.',
    ],
    blocks: [
      {
        kind: 'warn',
        text:
          '**Trên production (đọc 12/11/2026):** 7 vai trò đã dựng sẵn — *HQ Admin* (315 quyền, **19 người giữ**) · *Sale manager* (95) · *VN Sales* (91) · *VN Operations* (81) · *Sale leader* (56) · *Sale member* (47) · *Team leader* (35). **Ngoài HQ Admin, chưa vai trò nào có người giữ.** Lưới hiện có **78 trang** chia theo **9 nhóm**. Hướng dẫn dựng tài khoản thật theo thứ tự nằm ở **Logic chung — Organisation, phần A**.',
      },
      {
        kind: 'table',
        heading: 'Quyền cần có',
        note: 'Dòng **Roles & permissions** trong nhóm Organisation.',
        cols: ['Muốn làm', 'Cần'],
        rows: [
          ['Xem danh sách, mở một vai trò', '`role:read`'],
          ['*New role* · *Duplicate*', '`role:create`'],
          ['Đổi tên / mô tả · tick quyền trên lưới', '`role:update`'],
          ['*Delete*', '`role:delete`'],
          ['Gán vai trò cho một người', '`user:update` — ở **Users**'],
        ],
      },

      { kind: 'h', text: '§1 · Danh sách', path: '/system/roles' },
      {
        kind: 'table',
        cols: ['Cột', 'Nghĩa'],
        rows: [
          ['**Role**', 'Tên, tag *Seeded* cho vai trò có sẵn từ hệ thống, mô tả một dòng (hoặc *No description.*)'],
          ['**Grants**', 'Số quyền vai trò cấp'],
          ['**Operators**', 'Số người đang giữ — bấm để mở danh sách tên kèm *Open in Users*'],
          ['**Actions**', '*Open role editor* · *Duplicate* · *Delete* — Delete hiện **“Delete (N operators hold it)”** và bị khoá khi còn người giữ'],
        ],
      },

      { kind: 'h', text: '§2 · Tạo và sửa một vai trò', path: '/system/roles/:id' },
      {
        kind: 'table',
        heading: 'Các ô',
        cols: ['Ô', 'Bắt buộc', 'Luật'],
        rows: [
          ['**Name**', 'Có', 'Mã nội bộ được **sinh từ tên** (thêm `_2`, `_3`… nếu trùng) và **không đổi khi đổi tên**'],
          ['**Description**', 'Không', 'Một dòng — vai trò này để làm gì. Xoá trắng là bỏ mô tả'],
          ['**Lưới quyền**', 'Không', 'Lưu cùng lúc với tên khi tạo; khi sửa, lưới có nút *Save* riêng. Quyền không có trong danh mục → 400'],
        ],
      },
      {
        kind: 'table',
        heading: 'Các cột trên lưới quyền',
        note: 'Trên lưới có ghi: *“How far its data reaches is chosen per operator when the role is assigned.”*',
        cols: ['Cột', 'Nghĩa'],
        rows: [
          ['**None**', 'Trạng thái rỗng — tick vào đây là **xoá sạch cả dòng**'],
          ['**Create · Read · Update · Delete**', '**Độc lập với nhau.** Create không bao hàm Read; tick từng cái vai trò cần'],
          ['**Export**', 'Tải danh sách ra file. **Tách khỏi Read có chủ đích** — nhìn thấy và mang đi là hai quyết định'],
        ],
      },
      {
        kind: 'table',
        heading: 'Những thứ trên lưới trông lạ nhưng là chủ đích',
        cols: ['Bạn thấy', 'Nó nghĩa là'],
        rows: [
          ['Một **dấu gạch** trong ô', 'Hành động đó **không tồn tại** cho trang này (ví dụ không có nút xoá nào để cấp quyền)'],
          ['Một dòng **thụt vào** dưới dòng khác', 'Hành động của nó nằm **trên màn hình của trang cha** (*Move an operator’s team* dưới *Operator accounts*…). Tick nó khi trang cha chưa có Read thì hiện chip **Needs {trang} ▸ Read** — vẫn lưu được, nhưng người giữ không mở được màn hình để bấm'],
          ['Chip **Team / Own reach only**', 'Vai trò đang giữ quyền đó ở **phạm vi hẹp**. Tick rồi lưu là **nới ra mọi team** (chip đổi thành *Widens … reach*); bỏ tick để giữ phạm vi hẹp. Bỏ tick một ô như vậy cũng **xoá** phạm vi hẹp của quyền đó'],
          ['**Partial** trên một dòng', 'Một vai trò cũ đang giữ **một phần** các quyền nằm sau một ô. Lưu lại sẽ **giữ nguyên** nó trừ khi bạn động vào ô đó'],
          ['Không có cột **Approve / confirm / mark paid / unlock CV**', 'Chúng **gộp vào Update** trên chính trang của chúng — không có cột “Approve” riêng'],
        ],
      },
      {
        kind: 'table',
        heading: 'Tìm dòng của một trang — những chỗ dễ nhầm',
        note: 'Sidebar có nhóm **Users**, nhưng lưới quyền **không có** nhóm Users. Ô tìm kiếm trên lưới (*Search pages*) là cách nhanh nhất.',
        cols: ['Màn hình (sidebar)', 'Dòng trên lưới', 'Nhóm trên lưới', 'Quyền'],
        rows: [
          ['Users → **Jobseeker users**', '**Talent pool**', 'Recruitment', 'Read = `resume:read` + `candidate:read` · Update gồm `candidate:manage` (khoá / mở / xoá / khôi phục) · Export = `resume:export` + `candidate:export`'],
          ['Users → **Company users**', '**Company staff logins**', 'CRM', 'Read `company_user:read` · Update `company_user:manage` (gồm **xoá tài khoản**) · Export `company_user:export`'],
          ['Organisation → **Users**', '**Operator accounts** (+ dòng con *Move an operator’s team*)', 'Organisation', '`user:*` · `user:move_department`'],
          ['Organisation → **Departments**', '**Departments**', 'Organisation', '`department:*`'],
          ['Organisation → **Roles & permissions**', '**Roles & permissions**', 'Organisation', '`role:*`'],
        ],
      },
      {
        kind: 'warn',
        text:
          '**Hai ô “Partial” sẽ gặp thường xuyên.** `candidate:*` theo seed **chỉ có ở HQ Admin**, nên trên vai trò khác ô *Update* và *Export* của dòng **Talent pool** thường hiện **Partial** (có `resume:*`, thiếu `candidate:*`). Lưu mà không động vào ô đó thì giữ nguyên; tick ô đó là **cấp luôn quyền khoá / xoá tài khoản ứng viên** — một quyết định riêng.',
      },
      {
        kind: 'warn',
        text:
          'Quyền hiển thị ở giao diện chỉ là **trải nghiệm** — nó ẩn nút người dùng không bấm được. **Chặn thật nằm ở server, trên MỌI lời gọi**, kèm cả kiểm tra phạm vi theo từng dòng. Đừng bao giờ coi việc ẩn nút là một lớp bảo mật. Mọi thay đổi vai trò đều vào audit log: `role.create` · `role.duplicate` · `role.update` · `role.replace_permissions` (ghi **quyền nào vào, quyền nào ra**) · `role.delete` (giữ tên vai trò).',
      },
      {
        kind: 'table',
        heading: 'Kịch bản test nên chạy',
        cols: ['Kịch bản', 'Đạt khi'],
        rows: [
          ['Mời một người với đúng một vai trò', 'Họ hiện ở **Pending**; email tới; sau khi đặt mật khẩu họ thành **Active** và **chỉ thấy các trang vai trò đó mở ra**'],
          ['Bỏ tick *Companies: Read* trên vai trò của họ', 'Trang đó **biến khỏi menu của họ** ở lần tải trang kế tiếp'],
          ['Một sales ở *Only their own companies*, một sales khác ở *Their team’s companies*, cùng một team', '**Cả hai đều THẤY mọi công ty** (SRM-994). Khác nhau ở: tab *My team’s* của người sau liệt kê công ty của cả team, và người đầu **không sửa được** công ty của đồng nghiệp (không có nút *Edit / Create quotation*, tab *Products & billing* khoá)'],
          ['Chuyển một user từ Sales SVN 1 sang Sales SVN 2', 'Tầm nhìn “team” của họ **chuyển sang bản ghi của team mới**'],
          ['Thử xoá một vai trò 2 người đang giữ', '**Từ chối**, kèm con số'],
          ['Bỏ `role:update` khỏi vai trò toàn quyền duy nhất', '**Từ chối** (409)'],
          ['Operator không phải HQ Admin tick một quyền họ không có', '**Từ chối** (403)'],
          ['Duplicate *Sale member*', 'Có *Sale member (copy)* với **đúng** các quyền đó, **0 operator**'],
          ['Đổi tên một vai trò đang có người giữ', 'Người giữ **không mất quyền gì**'],
          ['Thử xoá một user đã từng tạo một báo giá', '**Từ chối**; *Deactivate* thì được'],
          ['Thử sửa vai trò của chính mình', '**Từ chối** kèm thông báo'],
          ['Xoá một phòng ban còn team', '**Từ chối**; sau khi xoá hết team thì thành công và **thành viên của nó bị bỏ trống phòng ban**'],
          ['Đặt leader phòng ban là người **không phải thành viên**, giữ vai trò ở *Their team’s companies*', '**Cho phép**; leader đó **thấy bản ghi của người trong phòng ban và các team con** dù không ngồi ở đó (sửa từ kịch bản cũ — xem Departments)'],
          ['Mở *Reset password* trên một user Active', 'Họ **bị đăng xuất ở mọi nơi** và nhận link mới; dòng chuyển về **Pending**'],
        ],
      },
      {
        kind: 'open',
        text:
          '**Trên dev hiện có 19 vai trò** (theo Notion 29/09, chưa đếm lại), gồm *HQ Admin* (287 quyền, 15 operator), *VN Sales Staff*, *VN Sales Leader*, *Sale manager / Sale leader / Sale member*, *Operation*, *Customer Service Role*, *Marketing*, *SEO* và vài vai trò test. **Ma trận vai trò cuối cùng vẫn là quyết định của khách hàng** — lưới thì đã có, ma trận được điền ở tài liệu này chứ không nằm trong code. `docs/features/roles.md` trong repo admin **chưa cập nhật** (vẫn tả *Not grantable*); `admin-pages.config.ts` là chuẩn.',
      },
      {
        kind: 'p',
        text:
          '**Nguồn** (08/10/2026): saramin-vn-admin `45954108` — `configs/admin-pages.config.ts`, `modules/system/roles/*`, `i18n/messages/en/roles.json`; svn-be `ee1db5ea9` — `RoleManagementService` (luật xoá / toàn quyền / leo thang, hậu tố “ (copy)”).',
      },
    ],
  },
}

export const USERS_ORG_MODULE_DOCS: Record<string, ModuleDoc> = {
  Users: {
    title: 'Logic chung — Users',
    lead:
      'Hệ thống có **ba loại tài khoản**, ba bảng riêng, ba cách đăng nhập, ba bộ luật — chúng **không bao giờ lẫn vào nhau**. Nhóm *Users* trên sidebar quản hai loại đầu: **người tìm việc** và **người của công ty khách hàng**. Loại thứ ba — **nhân viên Saramin** — ở *Organisation → Users*.',
    headline: [
      '**Ba loại tài khoản, ba thế giới.** Một email có thể là ứng viên, là thành viên công ty, và là nhân viên Saramin **cùng lúc** — ba tài khoản, ba mật khẩu. Không quyền nào, vai trò nào, trạng thái nào chảy từ loại này sang loại kia.',
      '**Khoá thì đảo ngược được; Xoá là cánh cửa một chiều sau 72 giờ.** Ứng viên và thành viên công ty: dữ liệu cá nhân huỷ **72 giờ** sau khi xoá, chỉ HQ khôi phục được **trước** lần huỷ. Khác nhau ở email: email **đã xác thực** của ứng viên bị **chặn vĩnh viễn**; email thành viên công ty bị **giữ 30 ngày** sau lần huỷ. Nhân viên Saramin thì **không có xoá mềm**: xoá là mất hẳn, và chỉ xoá được người chưa từng làm gì.',
      '**Khoá ứng viên rút đơn của họ; tắt một thành viên công ty thì công việc ở lại với công ty.** Ứng viên bị khoá (hoặc tự tạm dừng) → mọi đơn đang xử lý **bị rút** và mở lại không trả về. Thành viên công ty bị tắt → tin, ứng viên, CV đã mở khoá **vẫn của công ty**.',
    ],
    blocks: [
      {
        kind: 'table',
        heading: 'Ba loại tài khoản, đặt cạnh nhau',
        cols: ['', 'Ứng viên (Jobseeker users)', 'Thành viên công ty (Company users)', 'Nhân viên Saramin (Organisation → Users)'],
        rows: [
          ['Là ai', 'Người tìm việc', 'Người của khách hàng — một dòng là **một chỗ ngồi trong một công ty**', 'HQ operator'],
          ['Đăng nhập vào', 'Jobseeker site', 'Company site (tab *Nhà tuyển dụng* của màn đăng nhập chung)', 'Admin console'],
          ['Ra đời thế nào', '**Tự đăng ký** — tài khoản chỉ tồn tại khi mã OTP Zalo được nhập xong. (HQ có nút *Create*, sinh trạng thái *Chưa xác thực*)', '**Tự đăng ký** (xác nhận email + HQ xếp vào công ty ở Sign-ups) **hoặc được mời** (HQ, hoặc Super admin của công ty)', '**Chỉ được mời** từ *Organisation → Users*'],
          ['Cách đăng nhập', 'Email + mật khẩu, hoặc Google · Facebook · LinkedIn · GitHub', '**Chỉ** email + mật khẩu', '**Chỉ** email + mật khẩu'],
          ['Xác thực danh tính', '**OTP Zalo** tới số điện thoại — bắt buộc (svn-web PR #633, 08/10/2026)', '**Link xác nhận email** (người tự đăng ký) + HQ duyệt', 'Link đặt mật khẩu trong thư mời'],
          ['Luật mật khẩu', '8–128 · **chữ hoa** + số + ký hiệu', '8–128 · chữ cái + số + ký hiệu · ≠ email', '8–128 · chữ cái + số + ký hiệu · ≠ email'],
          ['Quên mật khẩu', 'Mã 6 số qua Zalo hoặc email', 'Link qua email, sống **1 giờ**', 'Admin khác bấm *Reset password* (link 72 giờ)'],
          ['Link mời / đặt mật khẩu do HQ gửi', '*Send password reset*', '**72 giờ**, cooldown 60 giây', '**72 giờ**, cooldown 60 giây'],
          ['Trạng thái', '*Active* · *Chưa xác thực* · *Deactivated* · *Withdrawn* · *Deleted*', 'Chỗ ngồi: *Invited* · *Active* · *Disabled*; tài khoản: *Deleted*', '*Pending* · *Active* · *Inactive*'],
          ['Vai trò', 'Không có', 'Theo **từng công ty**: *Super admin* cố định + vai trò tự đặt trên **7 quyền** cố định', '*Roles & permissions* — lưới theo trang + **Edit & sales reach** khi gán'],
          ['Ai khoá được', 'HQ; hoặc chính ứng viên tự tạm dừng (backend có, Jobseeker site chưa có nút)', 'HQ hoặc Super admin của công ty — **chính người đó thì không**', 'Admin có `user:update` — **không tự khoá mình**, không khoá HQ Admin hoạt động cuối cùng'],
          ['Xoá', 'Ứng viên tự xoá (OTP / mật khẩu) hoặc HQ → huỷ sau 72 giờ', 'Tự xoá (mật khẩu) hoặc HQ → huỷ sau 72 giờ', '**Xoá cứng ngay**, chỉ khi chưa có bản ghi nào tham chiếu'],
          ['Email sau khi xoá', '**Chặn vĩnh viễn** nếu đã xác thực (giữ mã băm); chưa xác thực thì được thả', '**Giữ 30 ngày** sau lần huỷ, rồi dùng lại được', 'Giải phóng ngay'],
          ['Quyền Admin để quản', '`candidate:*` — dòng **Talent pool** trên lưới', '`company_user:*` — dòng **Company staff logins** (nhóm CRM)', '`user:*` — dòng **Operator accounts**'],
        ],
      },
      {
        kind: 'table',
        heading: 'Trạng thái tài khoản ứng viên',
        note: '**Withdrawn** và **Deactivated** là **cùng một cái khoá** (`DEACTIVATED`), phân biệt bằng **ai là người khoá**. Chi tiết đầy đủ ở trang *Jobseeker users* §3.',
        cols: ['Trạng thái', 'Ai gây ra', 'Mở lại được?'],
        rows: [
          ['**Active**', 'Hệ thống, khi đăng ký hoàn tất', '—'],
          ['**Chưa xác thực**', '**Chỉ** nút *Create* của HQ', 'Ứng viên hoàn tất qua link'],
          ['**Deactivated**', 'HQ khoá (lý do không bắt buộc ở bản dựng)', 'Có — HQ mở lại'],
          ['**Withdrawn**', '**Chính ứng viên tự tạm dừng**', 'Có — khi ứng viên yêu cầu'],
          ['**Deleted**', 'Ứng viên (kèm OTP / mật khẩu), hoặc HQ', '**Chỉ trước khi lần huỷ chạy (72 giờ)**'],
        ],
      },
      {
        kind: 'table',
        heading: 'Trạng thái thành viên công ty',
        note: 'Chi tiết ở trang *Company users* §2.',
        cols: ['Trạng thái', 'Thuộc về', 'Ai gây ra', 'Mở lại được?'],
        rows: [
          ['**Invited**', 'Tài khoản (chưa đặt mật khẩu)', 'Lời mời của HQ hoặc Super admin', '—'],
          ['**Active**', 'Chỗ ngồi', 'Người đó đặt mật khẩu; hoặc HQ xếp người tự đăng ký vào công ty', '—'],
          ['**Disabled**', 'Chỗ ngồi — **chỉ công ty đó**', 'HQ hoặc Super admin', 'Có — vai trò cũ'],
          ['**Deleted**', 'Cả tài khoản — mọi chỗ ngồi', 'Chính người đó hoặc HQ', '**Chỉ HQ, chỉ trước khi huỷ (72 giờ)**'],
        ],
      },
      {
        kind: 'warn',
        text:
          'Đừng “reactivate” một tài khoản ứng viên **Withdrawn** như thể HQ khoá nhầm — **chính người dùng đã tắt nó**. Và **khoá một ứng viên không từ chối CV của họ**: muốn gỡ CV khỏi vòng duyệt là **một quyết định riêng** ở màn hình CV review.',
      },
      {
        kind: 'list',
        heading: 'Riêng tư và giới hạn của HQ — đúng cho cả ba loại',
        items: [
          '**HQ không bao giờ xem hoặc đặt mật khẩu của ai** — chỉ gửi được **link đặt lại / link mời**.',
          'Lý do nhập khi khoá / xoá là **ghi chú nội bộ**, người dùng không bao giờ thấy.',
          'Mở trang chi tiết một ứng viên và **Export** danh sách ứng viên hoặc thành viên công ty là **thao tác chạm dữ liệu cá nhân và luôn được ghi audit** kèm tên người thao tác. Email trên hai lưới hiện **chưa được che**.',
          'Mọi thao tác ghi của HQ trên một tài khoản đều để lại dòng audit có **tên operator** — kể cả *Reset password* hộ khách (không bao giờ ghi như thể khách tự yêu cầu).',
        ],
      },
      {
        kind: 'warn',
        text:
          '**Nhân viên khách nghỉ việc thì Disable, không xoá** — tin, ứng viên, CV đã mở khoá của họ **ở lại với công ty**, và **chính người đó không tự Disable mình được**, vì chỗ ngồi thuộc về công ty. **Sửa so với bản trước:** trang này từng nói Disable “giải phóng chỗ ngồi” và Reactivate “bị chặn nếu công ty đã dùng hết” — **bản dựng chưa có giới hạn số chỗ ngồi** nào (svn-be `ee1db5ea9`, admin `users-panel.tsx`), nên Re-enable không bao giờ bị chặn vì lý do đó.',
      },
      {
        kind: 'table',
        heading: 'Màn hình trong nhóm Users',
        cols: ['Màn hình', 'URL', 'Dùng khi'],
        rows: [
          ['**Jobseeker users**', '`/users/jobseekers` (tab *Deleted*: `?status=DELETED`)', 'Hỗ trợ ứng viên: tìm, khoá / mở, gửi link đặt lại mật khẩu, xoá / khôi phục, tra và gỡ chặn email'],
          ['**Company users**', '`/users/company-users` (tab *Deleted*: `?status=DELETED`)', 'Nhìn mọi chỗ ngồi của mọi khách ở một chỗ: đổi vai trò, gửi lại lời mời, tắt / bật, xoá / khôi phục tài khoản, tra email bị giữ. **Mời người và đặt lại mật khẩu thì làm ở hồ sơ công ty**'],
        ],
      },
    ],
  },

  Organisation: {
    title: 'Logic chung — Organisation',
    lead:
      'Ba trang quản trị **người của Saramin (HQ operator)**: **Departments** (ngồi ở đâu), **Roles & permissions** (được làm gì) và **Users** (là ai). Mỗi thiết lập trên ba trang này trả lời đúng một trong ba câu hỏi đó — và **người dùng là nơi ba câu trả lời gặp nhau**.',
    headline: [
      '**Đây là nhân viên Saramin, không phải khách.** Người dùng phía công ty trên site nhà tuyển dụng có tài khoản và vai trò **riêng**, không bao giờ xuất hiện ở đây (họ ở *Users → Company users*; ứng viên ở *Users → Jobseeker users*).',
      '**Cái một operator THẤY = các trang vai trò của họ mở ra. Cái họ SỬA ĐƯỢC = thêm *Edit & sales reach* chọn lúc gán vai trò.** Từ **SRM-994** (lên production 11/11/2026) hai câu này tách hẳn nhau: ai có *Companies \u25b8 Read* đều **xem được mọi công ty**, kể cả *Free data*; phạm vi chỉ chặn **sửa và bán hàng**. Một phòng ban tự thân không cấp gì; một vai trò tự thân không với tới ai. **Làm leader không mở thêm trang nào — nhưng nới phạm vi *Their team\u2019s companies* ra các nút người đó làm leader (xem \u00a75).**',
      '**Thứ tự dựng là bắt buộc: phòng ban → vai trò → mời người → đặt leader.** Không ai gõ mật khẩu hộ ai — lời mời gửi một link dùng một lần để người đó tự đặt.',
    ],
    blocks: [
      /* ══ Phần A — hướng dẫn dựng tài khoản thật trên production (12/11/2026).
         Viết cho khách, theo đúng thứ tự họ sẽ bấm, trên số liệu đọc thẳng từ
         prod-admin.saramin.vn. Phần tham chiếu §0…§9 (theo trang Notion của
         khách) nằm ngay bên dưới và không đổi vai trò. */
      { kind: 'h', text: 'A · Dựng tài khoản thật trên Production — làm theo thứ tự này' },
      {
        kind: 'p',
        text:
          'Phần A viết cho người mở **`prod-admin.saramin.vn`** để bắt đầu cho nhân viên Saramin Việt Nam dùng thật. Mọi con số và ảnh dưới đây chụp thẳng từ **production ngày 12/11/2026**. Phần **§0 … §9** bên dưới là tham chiếu đầy đủ từng màn hình — phần A chỉ là đường đi ngắn nhất.',
      },
      {
        kind: 'table',
        heading: 'Production hiện đã có sẵn những gì',
        note: 'Đọc lúc **12/11/2026** trên `prod-admin.saramin.vn`. Dữ liệu đã được **migrate** sang, nên việc của bạn **không phải tạo mới từ số không** — mà là *kiểm lại · gán vai trò · bật tài khoản*.',
        cols: ['Màn hình', 'URL', 'Đang có gì'],
        rows: [
          [
            '**Departments**',
            '`/system/departments`',
            '**7 nút**, tất cả là phòng ban gốc, **0 team**, **chưa nút nào có leader**: Customer Service (17 người) · HCM Sales Team 1 (57) · HCM Sales Team 2 (36) · HN (Paused) (10) · KR Sales Team (5) · Talent Success (14) · Team Test (3)',
          ],
          [
            '**Roles & permissions**',
            '`/system/roles`',
            '**7 vai trò** đã dựng sẵn: *HQ Admin* (315 quyền — **19 người giữ**) · *Sale manager* (95) · *VN Sales* (91) · *VN Operations* (81) · *Sale leader* (56) · *Sale member* (47) · *Team leader* (35). **Ngoài HQ Admin, chưa vai trò nào có người giữ**',
          ],
          [
            '**Users**',
            '`/system/users`',
            '**214 tài khoản** đã migrate — **7 Active · 45 Pending · 162 Inactive**. Gần như tất cả đang là **“No roles”**, và phần lớn đã có sẵn phòng ban từ dữ liệu cũ',
          ],
        ],
      },
      {
        kind: 'table',
        heading: 'Bốn bước, đúng thứ tự — mỗi bước cần bước trước',
        note: '**Đúng là thứ tự bạn hỏi:** phòng ban → vai trò → người dùng. Chỉ thêm **bước 4** ở cuối, vì leader bắt buộc phải là một operator *đang hoạt động*, nên chỉ đặt được sau khi tài khoản đã bật.',
        cols: ['#', 'Bước', 'Ở đâu', 'Vì sao phải đúng thứ tự này'],
        rows: [
          [
            '1',
            '**Phòng ban** — kiểm lại cây, thêm team nếu cần',
            '*Departments*',
            'Chỉ xếp người vào được một nút **đã tồn tại**. Trên production 7 nút đã có sẵn, nên bước này thường chỉ là *thêm team* hoặc *đổi tên*',
          ],
          [
            '2',
            '**Vai trò** — kiểm 7 vai trò sẵn có, sửa hoặc tạo thêm',
            '*Roles & permissions*',
            'Một tài khoản **bắt buộc** mang **ít nhất một vai trò** — không có vai trò thì không mời và không gán được',
          ],
          [
            '3',
            '**Người dùng** — gán **vai trò + phạm vi**, rồi bật tài khoản',
            '*Users*',
            'Phòng ban · vai trò · phạm vi được chọn **trong cùng một form**. Đây là bước chiếm gần hết thời gian (214 tài khoản)',
          ],
          [
            '4',
            '**Leader** — đặt trưởng cho từng phòng ban / team',
            '*Departments*',
            'Leader phải là operator **đang hoạt động**, nên chỉ đặt được **sau** bước 3. Hiện cả 7 nút đều là *No leader*',
          ],
        ],
      },
      {
        kind: 'warn',
        text:
          '**Một điều nên biết trước khi bắt đầu: phạm vi KHÔNG còn chặn việc xem.** Từ SRM-994 (lên production 11/11/2026), ô phạm vi trong form người dùng đã đổi tên thành **“Edit & sales reach”**. Ai có quyền *Companies ▸ Read* đều **xem được mọi công ty**, kể cả *Free data*. Phạm vi chỉ giới hạn **sửa và bán hàng**: sửa công ty, báo giá, đơn hàng, hoá đơn, nhật ký bán hàng. Chi tiết và hai ví dụ cụ thể ở **mục A4** bên dưới.',
      },

      /* A1 */
      { kind: 'h', text: 'A1 · Bước 1 — Departments (phòng ban)', path: '/system/departments' },
      {
        kind: 'p',
        text:
          '**Phòng ban dùng để làm gì.** Việc chính là **chia tầm nhìn của Sale**: trên *CRM → Companies → tab Assigned* có dải **Mine · My team’s · All**, và “team của tôi” được tính **đúng theo cây phòng ban này**. Ngoài ra cây còn được đọc ở hai chỗ nữa: **chuỗi duyệt chiết khấu** (yêu cầu đi lên leader team, rồi leader phòng ban) và **bộ lọc phòng ban** ở trang Users. Bạn **hoàn toàn có thể tạo phòng ban cho mục đích khác** (Customer Service, Talent Success… đã có sẵn trên production) — nó không bắt buộc phải là đơn vị bán hàng.',
      },
      {
        kind: 'shot',
        src: '/shots/org/01-departments-list.jpg',
        where: 'Admin',
        caption:
          'Production ngày 12/11/2026: **7 phòng ban gốc**, cột *Teams* đều là **0 teams**, cột *Leader* đều là **No leader**. Cột *Members* đếm người **đặt trực tiếp** trên nút đó — không cộng thành viên của các team con.',
      },
      {
        kind: 'table',
        heading: 'Làm gì ở bước này',
        cols: ['Việc', 'Bấm ở đâu', 'Lưu ý'],
        rows: [
          ['**Tạo phòng ban mới**', 'Nút **New department** góc trên phải', 'Chỉ hai ô: *Name* và *Leader*. Leader để trống lúc này cũng được — quay lại đặt ở bước 4'],
          ['**Tạo team bên trong một phòng ban**', 'Menu **⋮** trên dòng → **Add team**', 'Cây **chỉ có hai tầng**: phòng ban, và team bên trong. **Không có tầng thứ ba** — một dòng team không có *Add team*'],
          ['**Mở trang của một nút**', 'Menu **⋮** → **View detail**, hoặc bấm **tên nút** (là một link)', '⚠️ **Bấm vào khoảng trống của dòng không còn mở trang nữa** — khác với bản cũ'],
          ['**Đổi tên / đặt Leader**', 'Menu **⋮** → **Edit**, hoặc sửa trên trang của nút rồi **Save**', '*Save* chỉ bật khi có thay đổi thật'],
          ['**Xoá một nút**', 'Menu **⋮** → **Delete**', 'Còn team thì **không xoá được** — xoá team trước. Xoá nút thì **người vẫn còn**, chỉ là không thuộc phòng ban nào'],
        ],
      },
      {
        kind: 'shot',
        src: '/shots/org/03-department-row-menu.jpg',
        where: 'Admin',
        caption:
          'Menu **⋮** của một dòng phòng ban: **View detail · Add team · Edit · Delete**. Trên một dòng *team* sẽ **không có** *Add team*.',
      },
      {
        kind: 'shot',
        src: '/shots/org/02-new-department.jpg',
        where: 'Admin',
        caption:
          'Hộp **New department** — chỉ **Name** (tối đa 255 ký tự) và **Leader**. Dòng dưới ô Leader nói thẳng điều hay bị hiểu nhầm: *“Any active operator can lead it. Assign the Team leader role to grant access.”* — **đặt làm leader không tự cấp quyền gì**; muốn leader xem được việc của team thì vẫn phải gán vai trò có phạm vi team.',
      },
      {
        kind: 'shot',
        src: '/shots/org/05-add-team.jpg',
        where: 'Admin',
        caption:
          'Hộp **New team** mở từ ⋮ → *Add team*, kèm dòng **“This team will sit inside {phòng ban}”** — cha đã được chọn sẵn và **khoá**. **Parent chỉ chọn được lúc tạo và không đổi được sau đó**: muốn chuyển một team sang phòng ban khác thì tạo team mới dưới phòng ban đúng → chuyển người sang → xoá team cũ.',
      },
      {
        kind: 'shot',
        src: '/shots/org/04-department-detail.jpg',
        where: 'Admin',
        caption:
          'Trang của **HCM Sales Team 1**. Bên trái **Details** (*Name*, *Leader*) là hai ô duy nhất sửa được; **Placement** (*Type*, *Inside*) **chỉ đọc**. Dưới là **Members** — 57 người, tất cả đang *Inactive* và *No roles*, đúng tình trạng sau migrate.',
      },

      /* A2 */
      { kind: 'h', text: 'A2 · Bước 2 — Roles & permissions (vai trò)', path: '/system/roles' },
      {
        kind: 'p',
        text:
          '**Vai trò trả lời câu “người này được vào những trang nào, làm được những hành động nào”** — và **chỉ** câu đó. Nó **không** nói “trên dữ liệu của ai” (cái đó là phạm vi, chọn ở bước 3). Production đã có **7 vai trò dựng sẵn**; bạn nên **dùng lại** và chỉ sửa cho khớp, thay vì tạo mới từ đầu.',
      },
      {
        kind: 'shot',
        src: '/shots/org/10-roles-list.jpg',
        where: 'Admin',
        caption:
          '7 vai trò trên production. Cột **Grants** = số quyền vai trò đó cấp; cột **Operators** = **bao nhiêu người đang giữ** — hiện chỉ *HQ Admin* có người (19). Vai trò đang có người giữ thì **không xoá được**.',
      },
      {
        kind: 'table',
        heading: '7 vai trò dựng sẵn — dùng vai trò nào cho ai',
        note: 'Đây là **gợi ý theo mô tả của chính vai trò đó trên production**, không phải ràng buộc của hệ thống. Ma trận cuối cùng là quyết định của bạn — mở vai trò ra, đọc lưới quyền, sửa cho khớp cách làm việc thật.',
        cols: ['Vai trò', 'Mô tả trên hệ thống', 'Thường dùng cho'],
        rows: [
          ['**HQ Admin** (315)', 'Toàn quyền trên mọi module', 'Quản trị hệ thống. **Chỉ HQ Admin mới phong được HQ Admin cho người khác**'],
          ['**Sale manager** (95)', '*“Sees and works the whole pipeline — no ownership restriction.”*', 'Quản lý kinh doanh nhìn toàn bộ'],
          ['**Sale leader** (56)', '*“Sees the accounts assigned to their own team, plus every team beneath them.”*', 'Trưởng nhóm kinh doanh'],
          ['**Sale member** (47)', '*“Sees only the accounts assigned to them.”*', 'Nhân viên kinh doanh'],
          ['**Team leader** (35)', '*“Sees the sales pipeline and activity of their own team…”*', 'Trưởng nhóm cần xem pipeline mà không cần quyền sửa của Sale leader'],
          ['**VN Sales** (91) · **VN Operations** (81)', 'Bộ quyền cũ theo phòng ban', 'Kiểm lại trước khi dùng — hai vai trò này rộng hơn bộ Sale ở trên'],
        ],
      },
      {
        kind: 'shot',
        src: '/shots/org/11-new-role.jpg',
        where: 'Admin',
        caption:
          'Trang **Create a new role** — tên, mô tả, và **lưới quyền 78 trang** chia theo **9 nhóm đúng như sidebar**. Mỗi trang là một dòng với **None · Create · Read · Update · Delete · Export**, **độc lập với nhau** (Create **không** bao hàm Read). Dấu **—** nghĩa là hành động đó *không tồn tại* cho trang này. Ô **Search pages** và dải **Apply to all pages** dùng để tick hàng loạt; bộ đếm **X / 78 pages granted** chạy ngay.',
      },
      {
        kind: 'list',
        heading: 'Những thứ trên lưới dễ bị hiểu nhầm',
        items: [
          'Một dòng **thụt vào** kèm ký hiệu `└` là **một hành động nằm trên màn hình của trang cha**, không phải một trang riêng — ví dụ *Archive a company* nằm dưới *Companies*, *Move an operator’s team* nằm dưới *Operator accounts*.',
          'Chip **Needs {trang} ▸ Read**: bạn đã tick dòng con nhưng trang cha chưa có Read. **Vẫn lưu được**, nhưng người giữ sẽ **không mở được màn hình** để bấm hành động đó.',
          'Chip **Partial** (và banner *“Some actions are only partly granted”*): vai trò cũ đang giữ **một phần** các quyền sau một ô. **Lưu lại sẽ giữ nguyên** trừ khi bạn tự động vào ô đó.',
          '**Export tách khỏi Read có chủ đích**: nhìn thấy danh sách và mang cả danh sách ra ngoài là hai quyết định khác nhau.',
          '**Bạn không cấp được thứ chính bạn không có.** Một admin không phải HQ Admin chỉ tick được những quyền họ đang giữ.',
          '**Duplicate** sao chép một vai trò cùng **toàn bộ** quyền — cách nhanh nhất để làm biến thể (ví dụ *Sale member* → *Sale member (miền Bắc)*).',
        ],
      },
      {
        kind: 'shot',
        src: '/shots/org/13-role-sale-member.jpg',
        where: 'Admin',
        caption:
          'Vai trò **Sale member** trên production, lọc lưới bằng ô tìm kiếm `compan`. Dòng **Companies** được tick *Create · Read · Update · Export*; nhưng các dòng con **Edit another sales owner’s accounts**, **Edit Free data companies**, **Assign the account owner**, **Archive a company** thì **không**. Đây chính là chỗ “sửa công ty của ai” được quyết định — **cùng với** phạm vi ở bước 3.',
      },
      {
        kind: 'table',
        heading: 'Hai dòng con mới dưới Companies — đáng để ý khi dựng vai trò Sale',
        note: 'Cả hai chỉ có cột **Update**. Chúng trả lời câu *“có bắt buộc phải là chủ công ty mới sửa được không”*, còn phạm vi ở bước 3 trả lời câu *“nhìn xa tới đâu”*. Hai thứ **cộng vào nhau**.',
        cols: ['Dòng', 'Bật thì được gì', 'Tắt thì sao'],
        rows: [
          ['**Edit another sales owner’s accounts**', 'Sửa được công ty **người khác đang làm chủ**', 'Chỉ sửa được công ty **mình là chủ**. Xem công ty của đồng nghiệp và ghi activity lên đó **vẫn bình thường**'],
          ['**Edit Free data companies**', 'Sửa được công ty **chưa có chủ** trong tab *Free data*', 'Công ty *Free data* là **chỉ đọc**. Xin nhận công ty (*Ask for this company*) và ghi activity **vẫn bình thường**'],
        ],
      },
      {
        kind: 'shot',
        src: '/shots/org/12-matrix-companies.jpg',
        where: 'Admin',
        caption:
          'Lưới quyền của một vai trò mới, lọc bằng ô **Search pages** với chữ `compan`: dòng **Companies** và **13 dòng con** của nó. Khi đang lọc, dải tick hàng loạt đổi chữ thành *“Apply to the 14 pages matching the search”* — nó **chỉ áp cho các dòng đang hiện**, không áp cho cả 78 trang.',
      },

      /* A3 */
      { kind: 'h', text: 'A3 · Bước 3 — Users: gán vai trò và phạm vi', path: '/system/users' },
      {
        kind: 'warn',
        text:
          '**Trên production có HAI việc khác nhau ở bước này — đừng nhầm.** (1) **214 tài khoản đã migrate sẵn** → **không mời lại**, mà mở từng người ra gán vai trò + phạm vi rồi **Activate**. (2) Người **chưa có trong danh sách** → dùng **Invite user**. Mời trùng email sẽ bị từ chối: *“An admin user with this email already exists”*.',
      },
      {
        kind: 'shot',
        src: '/shots/org/20-users-list.jpg',
        where: 'Admin',
        caption:
          'Danh sách Users trên production: **214 tài khoản**, tab **All · Pending · Active · Inactive**, lọc theo **phòng ban** (chọn một phòng ban là **gồm cả các team của nó**) và theo **vai trò**. Ô tìm kiếm theo tên hoặc email **không phân biệt dấu**.',
      },
      {
        kind: 'table',
        heading: 'Ba trạng thái, và nút tương ứng trên dòng',
        note: '**Trạng thái không được lưu, mà được suy ra**: bị tắt → *Inactive*; chưa đặt mật khẩu → *Pending*; đã đặt mật khẩu → *Active*. **Không có ô mật khẩu ở bất kỳ đâu** — không ai gõ mật khẩu hộ ai.',
        cols: ['Trạng thái', 'Nghĩa', 'Nút có trên dòng'],
        rows: [
          ['**Inactive** (162 người)', 'Tài khoản đang bị tắt — **đây là tình trạng của gần hết người vừa migrate**', '*Activate* · *Reset password*'],
          ['**Pending** (45 người)', 'Đã bật nhưng **chưa đặt mật khẩu** — chưa đăng nhập được', '*Resend invite link* · *Deactivate*'],
          ['**Active** (7 người)', 'Đã đặt mật khẩu, đang dùng được', '*Reset password* — **xoá mật khẩu, gửi link mới, đăng xuất họ ở mọi nơi**'],
        ],
      },
      {
        kind: 'example',
        heading: 'Mở một tài khoản đã migrate và cho người đó vào dùng — năm thao tác',
        scenario:
          'Lấy một nhân viên kinh doanh ở *HCM Sales Team 1*, đang **Inactive · No roles**. Xong năm bước này họ nhận email đặt mật khẩu và đăng nhập được với đúng quyền.',
        cols: ['#', 'Làm gì', 'Ở đâu'],
        rows: [
          ['1', 'Tìm người đó (gõ tên hoặc email), mở menu **⋮** → **View detail**', 'Users'],
          ['2', 'Kiểm **Department or team** trên hồ sơ — đúng nút họ ngồi thì mới có *My team’s*', 'Trang người đó'],
          ['3', 'Khối **Roles & edit and sales reach**: chọn **vai trò** → chọn **phạm vi** → **Add** → **Save roles**', 'Trang người đó'],
          ['4', 'Bấm **Activate**. Tài khoản chưa có mật khẩu nên chuyển sang **Pending**', 'Trang người đó, khối *Account*'],
          ['5', 'Bấm **Resend invite link** để gửi link đặt mật khẩu', 'Trang người đó, khối *Account*'],
        ],
        note:
          '**Khối vai trò có nút Save riêng** — nó được lưu **tách khỏi** hồ sơ bên trái, và được ghi theo kiểu **thay nguyên danh sách**. **Resend invite link có cooldown 60 giây** mỗi người; bấm lại quá nhanh sẽ nhận *“try again shortly”*.',
      },
      {
        kind: 'shot',
        src: '/shots/org/25-user-row-menu.jpg',
        where: 'Admin',
        caption:
          'Menu **⋮** trên một dòng Users: **View detail · Edit · Manage roles · Reset password *(hoặc Resend invite link nếu đang Pending)* · Activate / Deactivate · Delete user**. ⚠️ **Bấm vào khoảng trống của dòng không còn mở trang nữa** — dùng *View detail* hoặc bấm tên người đó.',
      },
      {
        kind: 'shot',
        src: '/shots/org/27-user-detail.jpg',
        where: 'Admin',
        caption:
          'Trang một tài khoản. Trái: **Profile** — *email là định danh, không đổi được*. Phải trên: **Account** với câu giải thích trạng thái và các nút *Resend invite link · Deactivate · Delete user*. Phải dưới: **Roles & edit and sales reach**, có **nút Save riêng**.',
      },
      {
        kind: 'shot',
        src: '/shots/org/26-manage-roles.jpg',
        where: 'Admin',
        caption:
          'Hộp **Manage roles** mở thẳng từ menu ⋮ — cùng khối vai trò như trên trang chi tiết, dùng khi chỉ cần sửa vai trò mà không cần mở cả trang. Dòng cảnh báo cuối: *“Changes replace the full assignment list”* — danh sách được **ghi đè nguyên khối**, không cộng dồn.',
      },
      {
        kind: 'shot',
        src: '/shots/org/21-invite-user.jpg',
        where: 'Admin',
        caption:
          'Hộp **Invite user** cho người chưa có trong hệ thống: *Full name* và *Email* bắt buộc; *Phone*, *Title*, *Department or team*, *Phone extension* tuỳ chọn; bên dưới là khối **Roles & edit and sales reach** bắt buộc ít nhất một vai trò. **Không có ô mật khẩu** — người được mời nhận một **link dùng một lần (sống 72 giờ)** để tự đặt.',
        note:
          'Hai ô cần quyền riêng mới hiện: **Department or team** cần *Move an operator’s team* (`user:move_department`), **Phone extension** cần quyền gán máy lẻ tổng đài.',
      },

      /* A3b — reach */
      { kind: 'h', text: 'A4 · Edit & sales reach — chọn phạm vi nào cho ai' },
      {
        kind: 'p',
        text:
          '**Đây là thay đổi mới nhất, lên production ngày 11/11/2026 (SRM-994).** Ô trước đây gọi là *Data reach* giờ tên là **“Roles & edit and sales reach”**, và ba lựa chọn đã đổi chữ để nói đúng việc nó làm:',
      },
      {
        kind: 'table',
        heading: 'Tên cũ → tên mới trên màn hình',
        note: '**Chữ “companies” trong cả ba lựa chọn là có chủ đích**: phạm vi này nói về **công ty nào người đó được đụng vào**, không phải về việc họ nhìn thấy gì.',
        cols: ['Trước (tới 10/11/2026)', 'Trên production bây giờ'],
        rows: [
          ['Mục *Roles & data reach*', '**Roles & edit and sales reach**'],
          ['*All data*', '**All companies**'],
          ['*Their team only*', '**Their team’s companies**'],
          ['*Only their own*', '**Only their own companies**'],
        ],
      },
      {
        kind: 'warn',
        text:
          '**Điều quan trọng nhất phải nói với người dùng: phạm vi KHÔNG giới hạn việc XEM nữa.** Chính dòng hướng dẫn trong form nói vậy: *“It does not limit viewing — anyone with Companies ▸ Read sees every company.”* Ai có **Companies ▸ Read** đều **xem được mọi công ty**, kể cả **Free data**. Phạm vi chỉ chặn **sửa và bán hàng**: sửa công ty, tạo/sửa **báo giá · đơn hàng · hoá đơn**, và **nhật ký bán hàng**. Mở một công ty ngoài phạm vi sẽ thấy dòng *“outside your edit and sales reach — you can view it but not change it”* và **không có** nút *Edit / Archive / Create quotation*. ⚠️ **“Xem được hết” chỉ đúng với *CRM → Companies*.** Tab **Products & billing**, **Sales activity log** và việc xếp sign-up vẫn khoá theo phạm vi; **Jobs, Quotations, Purchase orders, Invoices không đổi gì** — vẫn lọc theo phạm vi như cũ. Bảng đầy đủ ở trang *Companies*.',
      },
      {
        kind: 'shot',
        src: '/shots/org/22-reach-options.jpg',
        where: 'Admin',
        caption:
          'Ba lựa chọn trong ô **Pick an edit & sales reach…** trên production: **All companies · Their team’s companies · Only their own companies**. **Không có giá trị mặc định** — nút *Add* bị khoá cho tới khi bạn chọn một cái. Chọn vai trò mà quên bấm *Add* thì vai trò đó **không** nằm trong thứ được lưu (form có dòng nhắc màu vàng).',
      },
      {
        kind: 'table',
        heading: 'Chọn phạm vi nào — quy tắc gọn',
        cols: ['Phạm vi', 'Người đó sửa và bán được cho', 'Gán cho ai'],
        rows: [
          [
            '**All companies**',
            'Mọi công ty, kể cả **Free data**',
            'HQ Admin · **Sale manager** · vận hành · marketing',
          ],
          [
            '**Their team’s companies**',
            'Công ty của **những người ngồi cùng nút** với họ, **cộng** mọi nút họ **làm leader** và các **team con** của nút đó',
            '**Sale leader / trưởng nhóm kinh doanh**',
          ],
          [
            '**Only their own companies**',
            'Chỉ công ty **họ đứng tên chủ**',
            '**Sale member / nhân viên kinh doanh**',
          ],
        ],
        note:
          '**Một người giữ được nhiều vai trò, mỗi vai trò một phạm vi khác nhau** — ví dụ *Sale member* ở *Only their own companies* và *Marketing* ở *All companies*.',
      },
      {
        kind: 'example',
        heading: 'Ví dụ 1 — tạo một **Sale member** (nhân viên kinh doanh)',
        scenario:
          'Chị Lan là nhân viên kinh doanh của *HCM Sales Team 1*. Chị chỉ được sửa và xuất báo giá cho **những công ty chị đang làm chủ**; công ty của đồng nghiệp chị **vẫn xem được** nhưng không sửa được.',
        cols: ['Ô', 'Chọn'],
        rows: [
          ['**Department or team**', 'HCM Sales Team 1'],
          ['**Role**', '**Sale member**'],
          ['**Edit & sales reach**', '**Only their own companies**'],
        ],
        note: 'Bấm **Add** rồi **Save roles** (hoặc **Send invite** nếu đang ở form mời).',
      },
      {
        kind: 'shot',
        src: '/shots/org/23-grant-sale-member-own.jpg',
        where: 'Admin',
        caption:
          'Kết quả của ví dụ 1 trên production: thẻ **Sale member** — **Edits & sells for: Only their own companies**. Bấm biểu tượng ↗ cạnh tên vai trò để mở lưới quyền của vai trò đó ở tab mới; biểu tượng thùng rác để gỡ.',
      },
      {
        kind: 'example',
        heading: 'Ví dụ 2 — tạo một **Sale leader** (trưởng nhóm kinh doanh)',
        scenario:
          'Anh Nam là trưởng nhóm *HCM Sales Team 1*. Anh được sửa và bán trên **công ty của cả nhóm**, không chỉ của riêng mình.',
        cols: ['Ô', 'Chọn'],
        rows: [
          ['**Department or team**', 'HCM Sales Team 1'],
          ['**Role**', '**Sale leader**'],
          ['**Edit & sales reach**', '**Their team’s companies**'],
        ],
        note:
          '**Chưa xong ở đây.** Phải quay lại *Departments* → mở **HCM Sales Team 1** → đặt **Leader = Nam** (bước 4). Không đặt leader thì “team” của anh Nam chỉ là **những người ngồi trực tiếp cùng nút**, và anh **không thấy xuống các team con**.',
      },
      {
        kind: 'shot',
        src: '/shots/org/24-grant-sale-leader-team.jpg',
        where: 'Admin',
        caption:
          'Kết quả của ví dụ 2: thẻ **Sale leader** — **Edits & sells for: Their team’s companies**.',
      },
      {
        kind: 'table',
        heading: 'Dải Mine · My team’s · All trên CRM → Companies — chính là lý do phải có phòng ban',
        note: 'Dải này **chỉ hiện khi có từ 2 lựa chọn trở lên** — một lựa chọn duy nhất là một cái nhãn chứ không phải một lựa chọn, nên hệ thống **ẩn hẳn dải đó đi**.',
        cols: ['Tab', 'Hiện khi nào'],
        rows: [
          ['**Mine**', 'Người đó **đang làm chủ ít nhất một công ty**'],
          ['**My team’s**', 'Người đó **thuộc một phòng ban / team**, **hoặc** đang **làm leader** của một nút'],
          ['**All**', '**Luôn luôn** — mọi người có *Companies ▸ Read* đều có tab này'],
        ],
      },
      {
        kind: 'shot',
        src: '/shots/org/30-companies-tabs.jpg',
        where: 'Admin',
        caption:
          '*CRM → Companies* trên production, nhìn bằng tài khoản **HQ Admin không thuộc phòng ban nào và không làm chủ công ty nào**: chỉ còn ba tab **Assigned · Free data · Archived**, **không có** dải *Mine · My team’s · All* — vì với tài khoản này chỉ còn đúng một lựa chọn (*All*). Xếp tài khoản vào một phòng ban là dải đó hiện ra.',
      },

      /* A5 */
      { kind: 'h', text: 'A5 · Bước 4 — đặt Leader cho từng phòng ban và team', path: '/system/departments' },
      {
        kind: 'table',
        heading: 'Đặt leader làm được hai việc — và không làm việc thứ ba',
        cols: ['', 'Chi tiết'],
        rows: [
          ['**Mở rộng phạm vi “Their team’s companies”**', 'Người giữ vai trò ở phạm vi team sẽ thấy thêm **nút họ làm leader** và **các team con** của nút đó — **kể cả khi họ không ngồi ở nút đó**'],
          ['**Nhận yêu cầu duyệt chiết khấu**', 'Yêu cầu của người trong team đi tới **leader của team**; team không có leader (hoặc leader chính là người xin) thì **leo lên leader của phòng ban**. Phòng ban gốc cũng không có leader thì **yêu cầu không tạo được**'],
          ['❌ **Không** mở thêm trang nào', 'Leader không tự có thêm quyền. Người **không** giữ vai trò nào ở phạm vi team thì làm leader **không đổi gì cả**'],
        ],
      },
      {
        kind: 'p',
        text:
          'Cách làm: *Departments* → menu **⋮** của nút → **Edit** (hoặc **View detail**) → ô **Leader** → chọn người → **Save**. Leader bắt buộc là operator **đang hoạt động** — chọn người đang *Inactive* sẽ bị từ chối với *“Department leader must be an active admin user”*. Leader **không bắt buộc phải là thành viên** của chính nút đó.',
      },

      /* A6 */
      {
        kind: 'table',
        heading: 'Checklist trước khi bàn giao cho người dùng thật',
        cols: ['☐', 'Kiểm gì', 'Đạt khi'],
        rows: [
          ['1', 'Cây phòng ban khớp với tổ chức thật', 'Mỗi người sẽ ngồi vào được đúng một nút đã tồn tại'],
          ['2', 'Mỗi vai trò sắp dùng đã được mở ra đọc lại lưới quyền', 'Không còn vai trò nào “để nguyên vì có sẵn”'],
          ['3', 'Mỗi tài khoản sắp dùng có **ít nhất một vai trò** và **một phạm vi**', 'Cột *Roles* trên danh sách không còn “No roles”'],
          ['4', 'Nhân viên kinh doanh → **Only their own companies**; trưởng nhóm → **Their team’s companies**', 'Mở trang từng người, đọc dòng *Edits & sells for*'],
          ['5', 'Mỗi phòng ban và mỗi team đã có **Leader**', 'Cột *Leader* không còn *No leader*'],
          ['6', 'Tài khoản đã **Activate** và đã **gửi link đặt mật khẩu**', 'Trạng thái chuyển **Inactive → Pending**, và người đó nhận được email'],
          ['7', 'Đăng nhập thử bằng một tài khoản Sale thật', 'Thấy dải **Mine · My team’s · All**; mở công ty của đồng nghiệp thì **xem được, không sửa được**'],
          ['8', 'Còn **ít nhất một** tài khoản HQ Admin đang hoạt động', 'Hệ thống **từ chối** tắt hoặc xoá HQ Admin đang hoạt động cuối cùng'],
        ],
      },
      {
        kind: 'open',
        text:
          '**Chưa chốt:** ma trận “vai trò nào cho chức danh nào” là quyết định của Saramin Việt Nam, không nằm trong code. 7 vai trò dựng sẵn trên production là **điểm xuất phát**, không phải kết luận — đặc biệt là *VN Sales* (91 quyền) và *VN Operations* (81 quyền), hai bộ quyền cũ rộng hơn hẳn bộ *Sale manager / leader / member*. Nên mở từng vai trò ra, đọc lưới, và sửa trước khi gán cho người thật.',
      },

      { kind: 'h', text: 'B · Tham chiếu đầy đủ — theo trang Notion của khách' },
      /* ── The client's Notion page "Roles, Users & Departments", section by
         section — same numbering (§0 … §9) so a tester holding both finds §3 in
         either. Notion was written 29/09/2026 from saramin-vn-admin dev; every
         claim was re-checked against origin/dev 45954108 + svn-be 664b8a6ec
         (08/10/2026). The permission grid moved on 30/09–01/10, so §3 is written
         as built and the Notion wording sits in `warn` blocks. */
      {
        kind: 'p',
        text:
          'Phần dưới đi **theo đúng trang Notion *Roles, Users & Departments*** của khách (viết trên dev 29/09/2026), cùng số mục (§0 … §9). Mọi điều đã được **đối chiếu với build** (`saramin-vn-admin` `origin/dev` 45954108 · `svn-be` 664b8a6ec, 08/10/2026). Chỗ Notion **đi sau build**, trang này ghi theo build và có hộp *lưu ý* nói rõ Notion ghi gì.',
      },
      {
        kind: 'table',
        heading: 'Ba trang Notion nói tới',
        note: 'Trên sidebar ba trang này nằm trong nhóm **Organisation**; URL vẫn giữ tiền tố `/system/…`.',
        cols: ['Trang', 'URL', 'Định nghĩa cái gì'],
        rows: [
          ['**Departments**', '`/system/departments`', 'Operator **ngồi ở đâu** — sơ đồ tổ chức nội bộ của Saramin: phòng ban và các team bên trong'],
          ['**Roles & permissions**', '`/system/roles`', 'Operator **được làm gì** — một tập quyền có tên, theo từng trang'],
          ['**Users**', '`/system/users`', 'Operator **là ai** — tài khoản, phòng ban của họ, và các vai trò họ giữ kèm **Edit & sales reach**'],
        ],
      },
      {
        kind: 'warn',
        text:
          '**Từ 29/09 tới 08/10 lưới quyền (§3) đã đổi — Notion chưa theo kịp.** Lưới giờ **gom nhóm theo đúng sidebar** (9 nhóm; *Organisation* là một nhóm riêng). **Mọi dòng đều tick được** — tag *Not grantable* và *Limited* đã bỏ, cùng với các dòng chỉ đi nhờ quyền trang khác (*Applications*, *Job approval*, *Posting ladder*, *Quota usage*…). Mới có: **dòng con thụt vào** dưới trang cha kèm chip **Needs {trang} ▸ Read** · chip **Team / Own reach only** · mỗi dòng có mô tả và link tới màn hình của nó · tiêu đề cột **đứng yên khi cuộn**. Notion cũng **không nhắc** quyền riêng **Move an operator’s team** (§4). **Thêm một lớp nữa từ 11/11/2026 (SRM-994):** dòng chú thích của lưới đã đổi thành *“Which companies it can change and sell to is chosen per operator when the role is assigned. Companies ▸ Read always covers every company.”*, lưới có thêm ô **Search pages**, và dưới *Companies* có hai dòng con mới **Edit another sales owner’s accounts** và **Edit Free data companies**.',
      },

      /* §0 */
      { kind: 'h', text: '§0 · Các mảnh ghép khớp nhau thế nào' },
      {
        kind: 'table',
        heading: 'Ba câu hỏi, ba nơi trả lời',
        note: '**Người dùng là nơi ba thứ gặp nhau.** Một phòng ban tự thân không cấp gì; một vai trò tự thân không với tới ai. Cái một operator thấy hằng ngày là: *các trang vai trò của họ mở ra* × *các bản ghi phạm vi của họ cho phép*, trong đó “team” nghĩa là **nút họ đang ngồi, cộng các nút họ làm leader và team con của các nút đó**.',
        cols: ['Câu hỏi', 'Trả lời ở', 'Ví dụ'],
        rows: [
          ['**Người này ngồi ở đâu?**', '*Departments* → rồi chọn trên người dùng', 'Sales › Sales SVN 2'],
          ['**Họ được làm gì?**', '*Roles* → rồi gán trên người dùng', 'Sale member: đọc + sửa Companies, tạo báo giá…'],
          ['**Sửa được trên dữ liệu nào?**', '**Edit & sales reach** chọn lúc gán vai trò', 'All companies · Their team\u2019s companies · Only their own companies'],
        ],
      },
      {
        kind: 'warn',
        text:
          '**Sửa theo bản dựng** (svn-be `ee1db5ea9`, `DepartmentRepositoryAdapter.teamVisibleNodeIds`): “team” không chỉ là nút người đó ngồi — leader của một nút cũng được tính nút đó và các team con của nó. Trước đây trang này ghi “làm leader không cấp thêm quyền nào”.',
      },

      /* §1 */
      { kind: 'h', text: '§1 · Thứ tự dựng' },
      {
        kind: 'table',
        heading: 'Làm đúng thứ tự này — mỗi bước cần bước trước',
        cols: ['#', 'Bước', 'Ở đâu', 'Vì sao đúng thứ tự này'],
        rows: [
          ['1', 'Tạo phòng ban, rồi tạo team bên trong', 'Departments → *New department*, rồi *Add team* trên phòng ban', 'Chỉ đặt người vào được một nút **đã tồn tại**'],
          ['2', 'Tạo vai trò và tick quyền', 'Roles → *New role*', 'Một lời mời **bắt buộc** mang ít nhất một vai trò'],
          ['3', 'Mời người', 'Users → *Invite user*', 'Chọn phòng ban, vai trò và phạm vi **trong cùng một form**'],
          ['4', 'Đặt leader cho từng phòng ban / team', 'Departments → mở nút → *Leader*', 'Leader phải là operator **đang hoạt động** — người đó phải tồn tại trước'],
        ],
      },

      /* §2 */
      { kind: 'h', text: '§2 · Departments', path: '/system/departments' },
      {
        kind: 'p',
        text:
          '**Là gì.** Một **cây hai tầng**: phòng ban, và các team bên trong nó. **Một team đơn giản là một phòng ban có cha** — cùng trang, cùng quyền. **Không có tầng thứ ba.**',
      },
      {
        kind: 'table',
        heading: 'Các cột trong danh sách',
        cols: ['Cột', 'Nghĩa'],
        rows: [
          ['**Department**', 'Tên — tag *Team* đánh dấu một dòng là team'],
          ['**Teams**', 'Phòng ban này có mấy team (trên một dòng team thì là **—**)'],
          ['**Members**', 'Số operator **đặt trực tiếp** trên nút này. Số của một phòng ban **không bao gồm** thành viên của các team con'],
          ['**Leader**', 'Leader của nút, hoặc *No leader*'],
        ],
      },
      {
        kind: 'table',
        heading: 'Thiết lập',
        cols: ['Thiết lập', 'Nghĩa'],
        rows: [
          ['**Name**', 'Chỉ cần **duy nhất trong cùng một cấp** — hai phòng ban đều có thể có một team tên “Team A”'],
          ['**Parent**', 'Chỉ chọn **lúc tạo** (phòng ban gốc, hoặc team dưới một phòng ban). **Không đổi được sau đó** — không có thao tác “move”'],
          ['**Leader**', 'Bất kỳ operator **đang hoạt động** nào. **Không cần** là thành viên của nút đó'],
        ],
      },
      {
        kind: 'list',
        heading: 'Luật đáng biết',
        items: [
          '**Làm leader không mở thêm trang nào — nhưng nới phạm vi “Their team’s companies”.** Người giữ một vai trò ở phạm vi *Their team’s companies* thấy người ở nút mình ngồi **cộng mọi nút mình làm leader và các team con của nút đó** (§5). Không giữ vai trò phạm vi team thì làm leader không đổi gì. Leader còn là người nhận **yêu cầu duyệt chiết khấu** của team (team không có leader thì leo lên leader phòng ban).',
          '**Xoá một nút thì người vẫn còn.** Thành viên giữ nguyên tài khoản và chỉ đơn giản là **không thuộc phòng ban nào** — hộp thoại xác nhận nói rõ điều đó.',
          '**Phòng ban còn team thì không xoá được.** Xoá hoặc làm rỗng các team trước — tái cơ cấu **không bao giờ là một thao tác dây chuyền**.',
          '**Chuyển một team sang phòng ban khác:** tạo team mới dưới phòng ban đúng → chuyển người sang → xoá team cũ.',
          'Trang riêng của một nút (`/system/departments/:id`) hiện thành viên (mỗi người link sang trang tài khoản), các team con, và hai nút *Add team* / *Delete*.',
        ],
      },
      {
        kind: 'warn',
        text:
          '**Sửa theo bản dựng** (svn-be `ee1db5ea9`, `DepartmentRepositoryAdapter.teamVisibleNodeIds`): câu cũ “làm leader của một nút không cấp gì cả — ô Leader là thông tin danh bạ” chỉ đúng khi người đó **không** giữ vai trò phạm vi team.',
      },

      /* §3 */
      { kind: 'h', text: '§3 · Roles & permissions', path: '/system/roles' },
      {
        kind: 'p',
        text:
          '**Là gì.** Một vai trò là **một cái tên, một mô tả, và một lưới quyền**. Danh sách hiện số quyền mỗi vai trò cấp (*Grants*) và **bao nhiêu operator đang giữ** nó. **Mọi vai trò** — kể cả các vai trò có sẵn như *HQ Admin* — đều đổi tên, đổi quyền, nhân bản hay xoá được.',
      },
      {
        kind: 'table',
        heading: 'Lưới quyền — mỗi trang admin là một dòng, gom theo nhóm sidebar',
        note: 'Phạm vi **không** đặt ở đây — lưới ghi rõ (bản production, SRM-994): *\u201cSets which pages and actions a role can use. Which companies it can change and sell to is chosen per operator when the role is assigned. Companies \u25b8 Read always covers every company.\u201d* (xem \u00a75). Lưới còn có ô **Search pages** để lọc, và dải **Apply to all pages** đổi thành *\u201cApply to the N pages matching the search\u201d* khi đang lọc.',
        cols: ['Cột', 'Nghĩa'],
        rows: [
          ['**None**', 'Trạng thái rỗng — tick vào đây là **xoá sạch cả dòng**'],
          ['**Create · Read · Update · Delete**', '**Độc lập với nhau.** Create không bao hàm Read; tick từng cái vai trò cần'],
          ['**Export**', 'Tải danh sách ra file. **Tách khỏi Read có chủ đích**: nhìn thấy các dòng và mang tất cả chúng ra ngoài là hai quyết định'],
        ],
      },
      {
        kind: 'table',
        heading: 'Những thứ trên lưới trông lạ nhưng là chủ đích',
        cols: ['Bạn thấy', 'Nó nghĩa là'],
        rows: [
          ['Một **dấu gạch** trong ô', 'Hành động đó **không tồn tại** cho trang này — ví dụ không có nút xoá nào để cấp quyền'],
          ['Một dòng **thụt vào** dưới dòng khác (`└`)', 'Hành động của nó nằm **trên màn hình của trang cha** — *Archive a company* dưới *Companies*, *Discount approval* dưới *Quotations*, *Move an operator’s team* dưới *Operator accounts*…'],
          ['Chip **Needs {trang} ▸ Read**', 'Đã tick dòng con mà trang cha chưa có Read. **Vẫn lưu được** và quyền vẫn được cấp — nhưng người giữ **không mở được màn hình** để bấm nó. Chip không hiện nếu trang cha đã có Read ở phạm vi Team / Own'],
          ['Chip **Partial**', 'Một vai trò cũ đang giữ **một phần** các quyền nằm sau một ô. Lưu lại sẽ **giữ nguyên** trừ khi bạn động vào ô đó'],
          ['Chip **Team / Own reach only**', 'Vai trò đang giữ quyền đó ở **phạm vi hẹp** (vài vai trò seed như *Sale member*). Tick ô đó rồi lưu là **nới ra mọi team** (chip đổi thành *Widens … reach*); bỏ tick để giữ phạm vi hẹp'],
          ['Không có cột **Approve / confirm / mark paid / unlock CV**', 'Chúng **gộp vào Update** trên chính trang của chúng'],
        ],
      },
      {
        kind: 'warn',
        text:
          '**Notion (29/09) còn tả hai tag đã bỏ.** *Not grantable* — trang chưa có quyền riêng, hoặc đi nhờ quyền trang khác (*“Applicants and Job approval ride Jobs”*): từ 01/10 các dòng đó **bị xoá khỏi lưới**, quyền vẫn nằm ở trang chủ của nó (Jobs, Talent pool…). *Limited* — chỉ vài hành động tồn tại: giờ chỉ còn là **dấu gạch** ở các ô không có.',
      },
      {
        kind: 'p',
        text:
          '**Dòng nhóm** và **Apply to all pages** tick một hành động trên nhiều trang cùng lúc. Bộ đếm **X / N pages granted** cập nhật ngay, tổng và theo từng nhóm. **Duplicate** sao chép một vai trò cùng **toàn bộ** quyền — cách nhanh nhất để làm một biến thể.',
      },
      {
        kind: 'list',
        heading: 'Luật đáng biết',
        items: [
          '**Bạn không cấp được thứ bạn không có.** Một operator không phải HQ Admin chỉ tick được những quyền chính họ đang giữ.',
          '**Vai trò đang có người giữ thì không xoá được** — nút nói rõ bao nhiêu người giữ. Gán lại cho họ trước.',
          '**Vai trò toàn quyền cuối cùng không xoá và không tước được** (toàn quyền = được sửa vai trò và người dùng). Đây là thứ giữ cho console không khoá hết mọi người ra ngoài.',
          '**Hai người sửa cùng một vai trò: lần lưu sau thắng, không cảnh báo gì.** Thống nhất ai sửa.',
        ],
      },
      {
        kind: 'open',
        text:
          '**Vai trò trên dev (theo Notion, 29/09):** 19 vai trò, gồm *HQ Admin* (287 quyền, 15 operator), *VN Sales Staff*, *VN Sales Leader*, *Sale manager / Sale leader / Sale member*, *Operation*, *Customer Service Role*, *Marketing*, *SEO* và vài vai trò test. **Ma trận vai trò cuối cùng vẫn là quyết định của khách** — lưới đã có, ma trận được điền ở đây chứ không nằm trong code.',
      },

      /* §4 */
      { kind: 'h', text: '§4 · Users', path: '/system/users' },
      {
        kind: 'p',
        text:
          '**Mời một người.** *Invite user* hỏi: họ tên · email · số điện thoại · chức danh · **phòng ban** · **extension** (cho tổng đài) · **ít nhất một vai trò**, mỗi vai trò kèm **Edit & sales reach** của nó (khối trên form tên là **\u201cRoles & edit and sales reach\u201d**). **Không có ô mật khẩu** — tài khoản được tạo ra không có mật khẩu và người đó nhận một **link dùng một lần** để tự đặt. Không ai khác từng biết mật khẩu đó.',
      },
      {
        kind: 'warn',
        text:
          '**Hai ô trên form cần quyền riêng — Notion không nhắc.** Ô **phòng ban** chỉ hiện với ai có **Move an operator’s team** (`user:move_department`) — một dòng riêng trong lưới, để một leader được sắp xếp lại các team bên dưới mà **không** vì thế được đổi tên hay vô hiệu hoá đồng nghiệp. Ô **extension** chỉ hiện với ai có quyền gán máy lẻ tổng đài (`telephony_call:assign`).',
      },
      {
        kind: 'table',
        heading: 'Trạng thái',
        cols: ['Trạng thái', 'Nghĩa', 'Hành động có trên dòng'],
        rows: [
          ['**Pending**', 'Đã mời, **chưa đặt mật khẩu** — chưa đăng nhập được', '*Resend invite link*'],
          ['**Active**', 'Đã đặt mật khẩu, tài khoản đang chạy', '*Reset password* — **xoá mật khẩu, gửi link mới, đăng xuất họ ở mọi nơi**'],
          ['**Inactive**', 'Bị admin vô hiệu hoá', '*Activate*'],
        ],
      },
      {
        kind: 'table',
        heading: 'Deactivate và Delete — hai nút khác hẳn nhau',
        note: '**Dòng cuối là chủ đích:** lịch sử “ai đã làm việc này” **bắt buộc phải sống sót**. Người đã từng làm việc trong hệ thống thì **chỉ vô hiệu hoá được**.',
        cols: ['', 'Deactivate', 'Delete'],
        rows: [
          ['Tác dụng', 'Giữ tài khoản, không đăng nhập được, liệt kê là *Inactive*', '**Xoá hẳn tài khoản**, giải phóng email'],
          ['Dùng cho', 'Người đã nghỉ hoặc đang tạm dừng', 'Lời mời gõ nhầm, trùng lặp, người chưa từng đăng nhập'],
          ['Bị từ chối khi', 'Chính bạn · super-admin gốc · **HQ Admin đang hoạt động cuối cùng**', 'Y như trên, **cộng thêm** bất kỳ ai đã từng làm việc trong hệ thống (tạo công ty, báo giá, đơn hàng…)'],
        ],
      },
      {
        kind: 'p',
        text:
          '**Trang riêng của một người** (`/system/users/:id`): hồ sơ bên trái (phòng ban, chức danh, điện thoại, extension); bên phải là các hành động tài khoản, khối **Roles & edit and sales reach** có nút *Save* riêng, và **10 hành động gần nhất** của người đó lấy từ audit log.',
      },
      {
        kind: 'list',
        heading: 'Luật đáng biết',
        items: [
          '**Bạn không đổi được vai trò của chính mình** — nhờ một admin khác.',
          '**Chỉ HQ Admin mới phong được HQ Admin** cho người khác.',
          'Một admin không phải HQ **không gán được vai trò mang quyền mà chính họ không có**.',
          '**Trên trang của chính mình, ô phòng ban cần phạm vi *All companies*.** Leader ở phạm vi team không tự chuyển mình sang nút khác được (ô bị khoá kèm lý do); chuyển người khác thì được.',
          '**Bộ lọc:** tìm theo tên hoặc email (**không phân biệt dấu**), phòng ban (chọn một phòng ban **bao gồm cả các team của nó**), vai trò, và các tab trạng thái.',
        ],
      },

      /* §5 */
      { kind: 'h', text: '\u00a75 \u00b7 Edit & sales reach \u2014 nơi Departments và Roles gặp nhau' },
      {
        kind: 'table',
        heading: 'Mỗi vai trò một người giữ được gán kèm một phạm vi',
        note: 'Vậy **phòng ban chọn trên người dùng, cộng các nút họ làm leader, là thứ định nghĩa \u201cteam của họ\u201d**, còn **phạm vi chọn trên vai trò là độ vươn của quyền đó**. Đổi một trong hai thì phạm vi của người đó đổi theo. **Một người giữ được hai vai trò ở hai phạm vi khác nhau** \u2014 ví dụ Sales ở *Only their own companies* và Marketing ở *All companies*. **Phạm vi không chặn việc xem**: ai có *Companies \u25b8 Read* đều thấy mọi công ty.',
        cols: ['Phạm vi (tên trên màn hình)', 'Người đó **sửa và bán** được trên', 'Ai thường giữ'],
        rows: [
          ['**All companies** *(trước: All data)*', 'Mọi bản ghi mà các trang của vai trò đó hiện, kể cả **Free data**', 'HQ Admin, quản lý, vận hành'],
          ['**Their team\u2019s companies** *(trước: Their team only)*', 'Bản ghi thuộc về người **ngồi cùng nút** với họ, **cộng** người trong **mọi nút họ làm leader và các team con của nút đó**. Không ngồi đâu và không làm leader đâu \u2192 **chỉ còn của chính mình**', 'Team leader'],
          ['**Only their own companies** *(trước: Only their own)*', 'Bản ghi được gán **cho đích danh họ** (công ty của họ, báo giá của họ)', 'Nhân viên sales'],
        ],
      },
      {
        kind: 'warn',
        text:
          '**Sửa theo bản dựng** (svn-be `ee1db5ea9`, `DepartmentRepositoryAdapter.teamVisibleNodeIds`): trang này từng ghi *Their team’s companies* = “chính phòng ban / team của họ **và các team bên dưới nó**”. Các team bên dưới chỉ được tính khi người đó **là leader** của phòng ban; một thành viên thường ngồi ở phòng ban gốc chỉ thấy người ngồi trực tiếp ở phòng ban đó.',
      },
      {
        kind: 'warn',
        text:
          '**Tên ô nói “companies”, nhưng nó chặn rộng hơn thế.** Dòng hướng dẫn trong form chỉ kể công ty, báo giá, đơn hàng, hoá đơn và nhật ký bán hàng — đó là chỗ người dùng cảm nhận rõ nhất. Nhưng về cơ chế (svn-be `V295`), phạm vi này là một **nắp trần đặt lên MỌI quyền trong cùng dòng gán đó**, kể cả những quyền không dính gì tới công ty (ví dụ thẻ *Recent activity* trên trang một operator cần `audit_log:read` ở **All companies**). **Một vai trò tự giới hạn sẵn thì giữ giới hạn của nó** dù bạn chọn rộng hơn — chọn *All companies* không nới được một vai trò đã bị bó ở mức Team / Own trên lưới quyền.',
      },

      /* §6 */
      { kind: 'h', text: '§6 · Ví dụ — dựng một team sales' },
      {
        kind: 'example',
        heading: 'Một phòng Sales, hai team, ba tầm nhìn',
        scenario: 'Kết quả: nhân viên sales thấy khách của chính mình; team leader thấy của cả team; quản lý thấy toàn bộ Sales. Chuyển một nhân viên sang team kia **chỉ là một thay đổi** — phòng ban trên trang người dùng của họ.',
        cols: ['#', 'Trang', 'Làm gì'],
        rows: [
          ['1', 'Departments', 'Tạo **Sales**; bên trong thêm team **Sales SVN 1** và **Sales SVN 2**'],
          ['2', 'Roles', 'Tạo **Sale member** (Companies: Read + Update · Quotations: Create + Read + Update · **không** Export), rồi **Duplicate** thành **Sale leader** và thêm *Daily activity log: Read*, *Sales dashboard: Read*'],
          ['3', 'Users', 'Mời **quản lý** vào *Sales* với *Sale leader* ở phạm vi **All companies**'],
          ['4', 'Users', 'Mời **từng leader** vào team của họ với *Sale leader* ở phạm vi **Their team’s companies**'],
          ['5', 'Users', 'Mời **từng nhân viên** vào team của họ với *Sale member* ở phạm vi **Only their own companies**'],
          ['6', 'Departments', 'Mở Sales SVN 1 và 2 → đặt **Leader** cho mỗi team'],
        ],
        note: 'Tên dòng trên lưới theo build hiện tại: Notion ghi *Company accounts*, *Quotes*, *Daily activities*, *Dashboards ▸ Sales* — là cùng các dòng đó trước khi lưới đổi tên theo sidebar.',
      },

      /* §7 */
      { kind: 'h', text: '§7 · Các thông báo bạn sẽ gặp' },
      {
        kind: 'table',
        cols: ['Thông báo', 'Vì sao', 'Làm gì'],
        rows: [
          ['“N operators still hold this role — reassign them first.”', 'Vai trò đang có người giữ', 'Gỡ vai trò khỏi những người đó trước'],
          ['Xoá vai trò toàn quyền cuối cùng bị từ chối', 'Nó sẽ khoá cả console', 'Cấp toàn quyền cho một vai trò khác trước'],
          ['“You cannot change your own role assignments”', 'Bảo vệ chống tự phong quyền', 'Nhờ một admin khác'],
          ['“You cannot move yourself to another org node”', 'Leader phạm vi team tự chuyển mình', 'Nhờ người có phạm vi *All companies*'],
          ['Xoá user bị từ chối, có bản ghi tham chiếu tới họ', 'Họ đã từng làm việc trong hệ thống', '**Deactivate** thay vì xoá'],
          ['Xoá phòng ban bị từ chối', 'Nó vẫn còn team', 'Xoá hoặc làm rỗng các team trước'],
          ['“An admin user with this email already exists”', 'Lời mời đã gửi rồi', 'Tìm dòng **Pending** → *Resend invite link*'],
          ['Resend invite → “try again shortly”', '**Cooldown 60 giây** cho mỗi người', 'Chờ một phút'],
        ],
      },

      /* §8 */
      { kind: 'h', text: '§8 · Những thứ liên quan khách nên biết' },
      {
        kind: 'table',
        cols: ['Ở đâu', 'Vì sao quan trọng ở đây'],
        rows: [
          ['**System → Audit log**', '**Mọi** thay đổi vai trò, thay đổi quyền, lời mời, vô hiệu hoá và xoá đều được ghi kèm **ai đã làm** — trang người dùng hiện 10 cái gần nhất'],
          ['**CRM → Companies**', '*Only their own companies* và *Their team’s companies* quyết định nhân viên sales và leader **sửa và bán** được cho khách nào — **phạm vi cảm nhận rõ nhất ở đây**. Việc *thấy* thì không còn bị chặn (SRM-994)'],
          ['**Call centre**', '**Extension** trên người dùng là thứ nối các cuộc gọi về đúng họ'],
          ['**Company users** (site nhà tuyển dụng)', 'Một tập tài khoản và vai trò **riêng**; không gì trên ba trang này chạm tới nó'],
        ],
      },

      /* §9 */
      { kind: 'h', text: '§9 · Kịch bản test gợi ý' },
      {
        kind: 'table',
        cols: ['Kịch bản', 'Đạt khi'],
        rows: [
          ['Mời một người với đúng một vai trò', 'Họ hiện ở **Pending**; email tới; sau khi đặt mật khẩu họ thành **Active** và **chỉ thấy các trang vai trò đó mở ra**'],
          ['Bỏ tick *Companies: Read* trên vai trò của họ', 'Trang đó **biến khỏi menu của họ** ở lần tải trang kế tiếp'],
          ['Một sales ở *Only their own companies*, một sales khác ở *Their team’s companies*, cùng một team', '**Cả hai đều THẤY mọi công ty** (SRM-994). Khác nhau ở: tab *My team’s* của người sau liệt kê công ty của cả team, và người đầu **không sửa được** công ty của đồng nghiệp (không có nút *Edit / Create quotation*, tab *Products & billing* khoá)'],
          ['Chuyển một user từ Sales SVN 1 sang Sales SVN 2', 'Tầm nhìn “team” của họ **chuyển sang bản ghi của team mới**'],
          ['Thử xoá một vai trò 2 người đang giữ', '**Từ chối**, kèm con số'],
          ['Thử xoá một user đã từng tạo một báo giá', '**Từ chối**; *Deactivate* thì được'],
          ['Thử sửa vai trò của chính mình', '**Từ chối** kèm thông báo'],
          ['Xoá một phòng ban còn team', '**Từ chối**; sau khi xoá hết team thì thành công và **thành viên của nó bị bỏ trống phòng ban**'],
          ['Đặt leader phòng ban là người **không phải thành viên**, giữ vai trò ở *Their team’s companies*', '**Cho phép**; leader đó **thấy bản ghi của người trong phòng ban và các team con** dù không ngồi ở đó'],
          ['Mở *Reset password* trên một user Active', 'Họ **bị đăng xuất ở mọi nơi** và nhận link mới; dòng chuyển về **Pending**'],
          ['*(thêm, theo build)* Vai trò chỉ có **Move an operator’s team**, không có *Operator accounts: Update*', 'Trên trang một operator, **chỉ ô phòng ban sửa được**; phần còn lại chỉ đọc'],
        ],
      },
      {
        kind: 'warn',
        text:
          '**Sửa theo bản dựng** (svn-be `ee1db5ea9`, `DepartmentRepositoryAdapter.teamVisibleNodeIds`): kịch bản cũ ghi leader không phải thành viên “không có thêm tầm nhìn nào”. Với vai trò phạm vi team, leader **có** thấy nút mình làm leader.',
      },
      {
        kind: 'p',
        text:
          '*Nguồn:* Notion *Roles, Users & Departments* (viết từ `saramin-vn-admin` dev 29/09/2026 — `docs/features/roles.md`, `users.md`, `departments.md`, `admin-pages.config.ts`), đối chiếu lại với `origin/dev` 45954108 ngày 08/10/2026. Lưu ý `docs/features/roles.md` trong repo cũng **chưa cập nhật** phần *Not grantable* — code (`admin-pages.config.ts`, commit af136226 ngày 01/10) là chuẩn.',
      },
    ],
  },
}
