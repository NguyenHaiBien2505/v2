# Implementation Plan

- [x] 1. Refactor IntentClassifier thành class độc lập





  - Tạo `IntentClassifier.java` trong package `service`, tách toàn bộ logic phân loại intent ra khỏi `ChatService`
  - Implement normalized text matching (bỏ dấu, lowercase) cho tất cả intent keywords
  - Implement context-aware priority: nếu có BookingSession đang chờ → ưu tiên CONFIRM_BOOKING
  - Fallback về MEDICAL_ADVICE nếu không match bất kỳ intent nào
  - _Requirements: 1.1, 1.4_

- [x] 1.1 Viết property test cho IntentClassifier (Property 1)

  - Thêm dependency `jqwik` vào `pom.xml`
  - **Property 1: Intent classification completeness**
  - **Validates: Requirements 1.1, 1.4**
  - Generate random non-empty strings, assert kết quả là non-null và thuộc tập intent hợp lệ

- [ ]* 1.2 Viết property test cho symptom mapping (Property 2)
  - **Property 2: Symptom-to-specialty mapping consistency**
  - **Validates: Requirements 1.2, 2.1**
  - Generate strings chứa known symptom keywords, assert intent là SUGGEST_DOCTOR hoặc MEDICAL_ADVICE và specialty non-null

- [x] 2. Nâng cấp DoctorSuggestionHelper
  - Hợp nhất toàn bộ symptom-to-specialty map từ `ChatService` vào `DoctorSuggestionHelper` (single source of truth)
  - Implement `buildDoctorListMarkdown(List<Doctor>)` trả về Markdown có cấu trúc: tên, chuyên khoa, học vị, đánh giá, phí khám
  - Implement `suggestDoctorsBySpecialty(String specialty)` truy vấn DB, sắp xếp theo rating giảm dần, tối đa 3 bác sĩ
  - Xử lý fallback khi không tìm thấy bác sĩ: thông báo + gợi ý hotline
  - _Requirements: 2.2, 2.3, 2.4_

- [ ]* 2.1 Viết property test cho doctor suggestion output (Property 4)
  - **Property 4: Doctor suggestion output completeness**
  - **Validates: Requirements 2.3**
  - Generate random Doctor lists, assert output Markdown chứa fullName, specialty, clinicFee của từng bác sĩ

- [ ]* 2.2 Viết property test cho doctor list fallback (Property 3)
  - **Property 3: Doctor list non-empty fallback**
  - **Validates: Requirements 2.2, 2.4**
  - Generate random specialty name strings, assert kết quả trả về non-null (không throw exception)

- [x] 3. Tạo BookingFlowService
  - Tạo `BookingFlowService.java`, tách toàn bộ booking flow ra khỏi `ChatService`
  - Implement `startBooking()`, `confirmBooking()`, `cancelBooking()`, `hasActiveSession()`
  - Implement TTL 30 phút cho BookingSession bằng `ScheduledExecutorService` hoặc `@Scheduled`
  - Xử lý unauthenticated booking: trả về message chứa "đăng nhập"
  - Xử lý conflict lịch hẹn: thông báo + gợi ý khung giờ khác
  - Xử lý giờ ngoài khung làm việc (trước 8h, 12h-14h, sau 17h)
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 7.4_

- [ ]* 3.1 Viết property test cho booking authentication (Property 5)
  - **Property 5: Booking requires authentication**
  - **Validates: Requirements 4.1**
  - Generate booking requests với null userId, assert response chứa "đăng nhập"

- [ ]* 3.2 Viết property test cho BookingSession TTL (Property 6)
  - **Property 6: BookingSession TTL cleanup**
  - **Validates: Requirements 7.4**
  - Generate sessions với timestamp > 30 phút trước, assert `hasActiveSession()` trả về false sau cleanup

- [x] 4. Refactor ChatService thành orchestrator
  - Inject `IntentClassifier`, `BookingFlowService`, `DoctorSuggestionHelper` vào `ChatService`
  - Xóa toàn bộ inline intent logic và booking logic khỏi `ChatService`
  - Implement dispatch pattern: gọi đúng handler dựa vào intent result
  - Inject dữ liệu DB (danh sách chuyên khoa, top bác sĩ) vào SystemPrompt khi gọi AI
  - Implement empty/whitespace message guard: trả về guidance string, không gọi AI
  - Implement retry 1 lần khi AI call thất bại, fallback message thân thiện
  - _Requirements: 1.1, 1.4, 7.1, 7.2, 7.3_

- [ ]* 4.1 Viết property test cho empty message rejection (Property 7)
  - **Property 7: Empty/whitespace message rejection**
  - **Validates: Requirements 7.3**
  - Generate null/empty/whitespace strings, assert response non-empty và AI không được gọi

- [x] 5. Implement handleCheckSchedule với schedule availability filter
  - Implement `handleCheckSchedule()` trong `ChatService` (hoặc tách thành `ScheduleQueryService`)
  - Truy vấn DB lấy Schedule từ hôm nay trở đi của bác sĩ
  - Filter chỉ giữ lại slot còn chỗ (bookedCount < maxPatient), tối đa 5 lịch gần nhất
  - Xử lý không có lịch rảnh trong 7 ngày: thông báo + gợi ý bác sĩ khác cùng chuyên khoa
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ]* 5.1 Viết property test cho schedule availability filter (Property 9)
  - **Property 9: Schedule availability filter**
  - **Validates: Requirements 3.2**
  - Generate Schedule entities với bookedCount >= maxPatient, assert chúng không xuất hiện trong kết quả

- [x] 6. Implement handleViewAppointments
  - Implement `handleViewAppointments()` truy vấn DB lấy Appointment sắp tới của patient
  - Format output Markdown: mã lịch hẹn, tên bác sĩ, ngày giờ, trạng thái
  - Xử lý unauthenticated: yêu cầu đăng nhập
  - Xử lý không có lịch hẹn: thông báo + gợi ý đặt lịch mới
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 7. Checkpoint — Đảm bảo tất cả tests backend pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Refactor ChatbotPage.tsx — Thêm Markdown rendering
  - Cài đặt `react-markdown` và `remark-gfm` vào `kimquy-health-connect`
  - Tạo `MessageBubble` component riêng với props `{ role, text, time }`
  - Bot messages render qua `<ReactMarkdown remarkPlugins={[remarkGfm]}>`
  - User messages render plain text
  - _Requirements: 6.1, 6.4_

- [ ]* 8.1 Viết property test cho Markdown rendering (Property 8)
  - Cài đặt `fast-check` vào `kimquy-health-connect`
  - **Property 8: Markdown rendering correctness**
  - **Validates: Requirements 6.1**
  - Generate strings với `**bold**` patterns, render qua MessageBubble, assert output chứa `<strong>`

- [x] 9. Thêm TypingIndicator và auto-scroll vào ChatbotPage.tsx
  - Tạo `TypingIndicator` component (3 chấm nhảy CSS animation)
  - Hiển thị TypingIndicator khi đang chờ response từ backend
  - Implement auto-scroll xuống tin nhắn mới nhất sau mỗi message
  - _Requirements: 6.2, 6.3_

- [x] 10. Đảm bảo responsive UI
  - Kiểm tra và fix layout ChatbotPage trên mobile (< 768px) và desktop
  - Đảm bảo MessageBubble, TypingIndicator hiển thị đúng trên cả hai breakpoint
  - _Requirements: 6.5_

- [x] 11. Final Checkpoint — Đảm bảo tất cả tests pass
  - Ensure all tests pass, ask the user if questions arise.
