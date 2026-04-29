# Requirements Document

## Introduction

Hệ thống chatbot AI hiện tại của KimQuy Health Connect cần được nâng cấp toàn diện để trở nên chuyên nghiệp hơn, hiểu đúng ý định người dùng hơn, và tích hợp dữ liệu thực từ database (bác sĩ, chuyên khoa, lịch khám, lịch hẹn). Mục tiêu là xây dựng một AI Concierge y tế thực sự hữu ích: tư vấn triệu chứng, gợi ý bác sĩ từ DB, đặt lịch khám, xem lịch hẹn, và trả lời thông tin bệnh viện — tất cả với ngữ cảnh hội thoại liên tục và giao diện người dùng thân thiện.

## Glossary

- **Chatbot**: Trợ lý AI tích hợp trong hệ thống KimQuy Health Connect
- **Intent**: Ý định của người dùng được phân loại từ tin nhắn (ví dụ: đặt lịch, tư vấn triệu chứng)
- **BookingSession**: Phiên đặt lịch tạm thời lưu trạng thái hội thoại đặt lịch của người dùng
- **ConversationId**: Định danh duy nhất cho một phiên hội thoại, dùng để duy trì ngữ cảnh
- **SystemPrompt**: Hướng dẫn hệ thống gửi cho AI model để định hình hành vi trả lời
- **SpecialtyContext**: Ngữ cảnh chuyên khoa được phát hiện từ triệu chứng người dùng mô tả
- **ChatMemory**: Bộ nhớ hội thoại lưu lịch sử tin nhắn theo ConversationId
- **Doctor**: Bác sĩ trong hệ thống, có chuyên khoa, lịch làm việc, phí khám
- **Schedule**: Lịch làm việc của bác sĩ trong một ngày cụ thể
- **Appointment**: Lịch hẹn khám đã được đặt bởi bệnh nhân
- **Patient**: Hồ sơ bệnh nhân liên kết với tài khoản người dùng
- **Specialty**: Chuyên khoa y tế (Tim mạch, Thần kinh, Da liễu, v.v.)
- **PaymentLink**: Đường dẫn thanh toán được tạo sau khi đặt lịch thành công
- **NormalizedText**: Văn bản đã được chuẩn hóa (bỏ dấu, chữ thường) để so sánh intent

---

## Requirements

### Requirement 1: Phân tích ý định người dùng chính xác

**User Story:** As a người dùng, I want chatbot hiểu đúng ý định của tôi từ câu hỏi tự nhiên bằng tiếng Việt, so that tôi không cần gõ đúng từ khóa cứng nhắc.

#### Acceptance Criteria

1. WHEN người dùng gửi tin nhắn, THE Chatbot SHALL phân loại ý định vào một trong các nhóm: SUGGEST_DOCTOR, CHECK_SCHEDULE, BOOKING, CONFIRM_BOOKING, CANCEL_BOOKING, VIEW_APPOINTMENTS, HOSPITAL_INFO, MEDICAL_ADVICE.
2. WHEN tin nhắn chứa mô tả triệu chứng (ví dụ: "tôi bị đau đầu", "ho nhiều ngày"), THE Chatbot SHALL ánh xạ triệu chứng sang chuyên khoa phù hợp từ danh sách chuyên khoa trong database.
3. WHEN tin nhắn chứa tên bác sĩ (ví dụ: "bác sĩ Minh", "bs Lan"), THE Chatbot SHALL tìm kiếm bác sĩ trong database theo tên gần đúng (case-insensitive, không dấu).
4. IF tin nhắn không khớp với bất kỳ intent nào, THEN THE Chatbot SHALL chuyển sang xử lý tư vấn y tế tổng quát qua AI model.
5. WHEN người dùng gửi tin nhắn ngắn mơ hồ (ít hơn 3 từ), THE Chatbot SHALL yêu cầu người dùng cung cấp thêm thông tin cụ thể.

---

### Requirement 2: Tư vấn y tế dựa trên triệu chứng với dữ liệu từ database

**User Story:** As a bệnh nhân, I want nhận được tư vấn y tế ban đầu và gợi ý bác sĩ phù hợp từ hệ thống, so that tôi biết nên khám chuyên khoa nào và gặp bác sĩ nào.

#### Acceptance Criteria

1. WHEN người dùng mô tả triệu chứng, THE Chatbot SHALL trả về tư vấn ban đầu bao gồm: đánh giá sơ bộ, hướng dẫn chăm sóc tại nhà, dấu hiệu cần đi khám ngay, và chuyên khoa phù hợp.
2. WHEN chuyên khoa được xác định từ triệu chứng, THE Chatbot SHALL truy vấn database để lấy danh sách tối đa 3 bác sĩ thuộc chuyên khoa đó, sắp xếp theo đánh giá trung bình giảm dần.
3. WHEN hiển thị danh sách bác sĩ gợi ý, THE Chatbot SHALL bao gồm: tên đầy đủ, chuyên khoa, học vị, đánh giá trung bình, số lượt đánh giá, và phí khám từ database.
4. IF không tìm thấy bác sĩ nào trong chuyên khoa được gợi ý, THEN THE Chatbot SHALL thông báo và đề xuất người dùng liên hệ hotline hoặc tìm chuyên khoa khác.
5. WHILE người dùng đang trong phiên hội thoại, THE Chatbot SHALL duy trì ngữ cảnh hội thoại để trả lời các câu hỏi tiếp theo liên quan đến cùng chủ đề.

---

### Requirement 3: Xem lịch rảnh bác sĩ từ database

**User Story:** As a bệnh nhân, I want xem lịch rảnh của bác sĩ cụ thể, so that tôi có thể chọn thời gian phù hợp để đặt lịch.

#### Acceptance Criteria

1. WHEN người dùng yêu cầu xem lịch của một bác sĩ, THE Chatbot SHALL truy vấn database để lấy các Schedule có ngày làm việc từ hôm nay trở đi của bác sĩ đó.
2. WHEN hiển thị lịch rảnh, THE Chatbot SHALL chỉ hiển thị các khung giờ còn chỗ trống (số lượng Appointment đã đặt nhỏ hơn maxPatient của Schedule), tối đa 5 lịch gần nhất.
3. IF bác sĩ không có lịch rảnh trong 7 ngày tới, THEN THE Chatbot SHALL thông báo và gợi ý bác sĩ khác cùng chuyên khoa.
4. WHEN tên bác sĩ không tìm thấy trong database, THE Chatbot SHALL thông báo lỗi rõ ràng và gợi ý người dùng dùng lệnh "Gợi ý bác sĩ" để xem danh sách.

---

### Requirement 4: Đặt lịch khám qua hội thoại

**User Story:** As a bệnh nhân đã đăng nhập, I want đặt lịch khám trực tiếp qua chatbot, so that tôi không cần rời khỏi giao diện chat để đặt lịch.

#### Acceptance Criteria

1. WHEN người dùng chưa đăng nhập yêu cầu đặt lịch, THE Chatbot SHALL từ chối và hướng dẫn đăng nhập trước.
2. WHEN người dùng đã đăng nhập yêu cầu đặt lịch với tên bác sĩ, THE Chatbot SHALL tạo BookingSession và hỏi ngày giờ khám.
3. WHEN người dùng cung cấp ngày và giờ hợp lệ, THE Chatbot SHALL kiểm tra lịch rảnh trong database và tạo Appointment nếu còn chỗ.
4. WHEN đặt lịch thành công, THE Chatbot SHALL trả về thông tin xác nhận đầy đủ: mã lịch hẹn, tên bác sĩ, ngày giờ, phí khám, và đường dẫn thanh toán PayOS.
5. IF khung giờ đã đầy hoặc bị trùng, THEN THE Chatbot SHALL thông báo lỗi cụ thể và gợi ý khung giờ khác từ lịch rảnh trong database.
6. WHEN người dùng cung cấp giờ ngoài khung làm việc (trước 8h, giữa 12h-14h, sau 17h), THE Chatbot SHALL từ chối và nhắc lại khung giờ hợp lệ.

---

### Requirement 5: Xem lịch hẹn đã đặt

**User Story:** As a bệnh nhân đã đăng nhập, I want xem danh sách lịch hẹn của mình qua chatbot, so that tôi theo dõi được lịch khám sắp tới.

#### Acceptance Criteria

1. WHEN bệnh nhân đã đăng nhập yêu cầu xem lịch hẹn, THE Chatbot SHALL truy vấn database để lấy danh sách Appointment sắp tới của bệnh nhân đó.
2. WHEN hiển thị lịch hẹn, THE Chatbot SHALL bao gồm: mã lịch hẹn, tên bác sĩ, ngày giờ, trạng thái (PENDING/CONFIRMED/COMPLETED/CANCELLED).
3. IF bệnh nhân chưa có lịch hẹn nào, THEN THE Chatbot SHALL thông báo và gợi ý đặt lịch mới.
4. WHEN người dùng chưa đăng nhập yêu cầu xem lịch hẹn, THE Chatbot SHALL yêu cầu đăng nhập trước.

---

### Requirement 6: Giao diện người dùng thân thiện và chuyên nghiệp

**User Story:** As a người dùng, I want giao diện chatbot trực quan, dễ dùng và hiển thị nội dung rõ ràng, so that tôi có trải nghiệm tốt khi tương tác với chatbot.

#### Acceptance Criteria

1. WHEN tin nhắn bot chứa định dạng Markdown (bold, bullet, xuống dòng), THE Chatbot UI SHALL render đúng định dạng thay vì hiển thị ký tự thô.
2. WHEN bot đang xử lý tin nhắn, THE Chatbot UI SHALL hiển thị chỉ báo "đang gõ" (typing indicator) để người dùng biết hệ thống đang phản hồi.
3. WHEN người dùng gửi tin nhắn, THE Chatbot UI SHALL cuộn tự động xuống tin nhắn mới nhất.
4. WHEN danh sách bác sĩ được hiển thị, THE Chatbot UI SHALL render thông tin bác sĩ dưới dạng card có cấu trúc rõ ràng.
5. THE Chatbot UI SHALL hỗ trợ giao diện responsive trên cả desktop và mobile.

---

### Requirement 7: Xử lý lỗi và fallback chuyên nghiệp

**User Story:** As a người dùng, I want chatbot xử lý lỗi một cách lịch sự và hữu ích, so that tôi không bị bỏ lại với thông báo lỗi kỹ thuật khó hiểu.

#### Acceptance Criteria

1. IF kết nối đến AI model thất bại, THEN THE Chatbot SHALL trả về thông báo thân thiện và gợi ý các hành động thay thế (hotline, đặt lịch trực tiếp).
2. IF truy vấn database thất bại, THEN THE Chatbot SHALL ghi log lỗi và trả về thông báo lỗi không tiết lộ thông tin kỹ thuật nội bộ.
3. WHEN người dùng gửi tin nhắn trống hoặc chỉ chứa khoảng trắng, THE Chatbot SHALL bỏ qua và không xử lý.
4. IF BookingSession hết hạn hoặc không tồn tại khi người dùng xác nhận đặt lịch, THEN THE Chatbot SHALL thông báo và hướng dẫn bắt đầu lại quy trình đặt lịch.
