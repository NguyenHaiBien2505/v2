-- DEV seed data for MySQL
-- Each entity has 5 records, except Role has exactly 3 records: ADMIN, DOCTOR, PATIENT.

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE `user_role`;
TRUNCATE TABLE `admin`;
TRUNCATE TABLE `doctor_certificate`;
TRUNCATE TABLE `medical_record`;
TRUNCATE TABLE `prescription_detail`;
TRUNCATE TABLE `prescription`;
TRUNCATE TABLE `review`;
TRUNCATE TABLE `appointment`;
TRUNCATE TABLE `schedule`;
TRUNCATE TABLE `doctor`;
TRUNCATE TABLE `patient`;
TRUNCATE TABLE `users`;
TRUNCATE TABLE `role`;
TRUNCATE TABLE `specialty`;
TRUNCATE TABLE `audit_logs`;
TRUNCATE TABLE `banners`;
TRUNCATE TABLE `medical_services`;
TRUNCATE TABLE `news_articles`;
TRUNCATE TABLE `notifications`;
TRUNCATE TABLE `settings`;
TRUNCATE TABLE `invalidate_token`;

SET FOREIGN_KEY_CHECKS = 1;

-- ROLE (3 records)
INSERT INTO `role` (`id`, `role_name`, `description`) VALUES
(1, 'ADMIN', 'ADMIN_ROLE'),
(2, 'DOCTOR', 'DOCTOR_ROLE'),
(3, 'PATIENT', 'PATIENT_ROLE');

-- USERS (5 records)
INSERT INTO `users` (`id`, `username`, `password`, `avatar_url`, `status`, `created_at`) VALUES
(UUID_TO_BIN('11111111-1111-1111-1111-111111111111'), 'seed_user_01', '123456', 'https://picsum.photos/seed/user1/200/200', 'ACTIVE', NOW()),
(UUID_TO_BIN('22222222-2222-2222-2222-222222222222'), 'seed_user_02', '123456', 'https://picsum.photos/seed/user2/200/200', 'ACTIVE', NOW()),
(UUID_TO_BIN('33333333-3333-3333-3333-333333333333'), 'seed_user_03', '123456', 'https://picsum.photos/seed/user3/200/200', 'ACTIVE', NOW()),
(UUID_TO_BIN('44444444-4444-4444-4444-444444444444'), 'seed_user_04', '123456', 'https://picsum.photos/seed/user4/200/200', 'ACTIVE', NOW()),
(UUID_TO_BIN('55555555-5555-5555-5555-555555555555'), 'seed_user_05', '123456', 'https://picsum.photos/seed/user5/200/200', 'ACTIVE', NOW());

-- USER_ROLE mapping (resolve role id by role_name to avoid FK mismatch)
INSERT INTO `user_role` (`user_id`, `role_id`)
SELECT UUID_TO_BIN('11111111-1111-1111-1111-111111111111'), r.id FROM `role` r WHERE r.role_name = 'ADMIN';
INSERT INTO `user_role` (`user_id`, `role_id`)
SELECT UUID_TO_BIN('11111111-1111-1111-1111-111111111111'), r.id FROM `role` r WHERE r.role_name = 'DOCTOR';
INSERT INTO `user_role` (`user_id`, `role_id`)
SELECT UUID_TO_BIN('11111111-1111-1111-1111-111111111111'), r.id FROM `role` r WHERE r.role_name = 'PATIENT';
INSERT INTO `user_role` (`user_id`, `role_id`)
SELECT UUID_TO_BIN('22222222-2222-2222-2222-222222222222'), r.id FROM `role` r WHERE r.role_name = 'DOCTOR';
INSERT INTO `user_role` (`user_id`, `role_id`)
SELECT UUID_TO_BIN('22222222-2222-2222-2222-222222222222'), r.id FROM `role` r WHERE r.role_name = 'PATIENT';
INSERT INTO `user_role` (`user_id`, `role_id`)
SELECT UUID_TO_BIN('33333333-3333-3333-3333-333333333333'), r.id FROM `role` r WHERE r.role_name = 'DOCTOR';
INSERT INTO `user_role` (`user_id`, `role_id`)
SELECT UUID_TO_BIN('33333333-3333-3333-3333-333333333333'), r.id FROM `role` r WHERE r.role_name = 'PATIENT';
INSERT INTO `user_role` (`user_id`, `role_id`)
SELECT UUID_TO_BIN('44444444-4444-4444-4444-444444444444'), r.id FROM `role` r WHERE r.role_name = 'PATIENT';
INSERT INTO `user_role` (`user_id`, `role_id`)
SELECT UUID_TO_BIN('55555555-5555-5555-5555-555555555555'), r.id FROM `role` r WHERE r.role_name = 'PATIENT';

-- SPECIALTY (5 records)
INSERT INTO `specialty` (`id`, `name`, `icon`, `description`) VALUES
(1, 'Nội tổng quát', 'stethoscope', 'Khám tổng quát và theo dõi sức khỏe định kỳ'),
(2, 'Tim mạch', 'cardiology', 'Chẩn đoán và điều trị bệnh lý tim mạch'),
(3, 'Da liễu', 'dermatology', 'Khám và điều trị các bệnh về da'),
(4, 'Nhi khoa', 'child_care', 'Chăm sóc sức khỏe trẻ em'),
(5, 'Thần kinh', 'neurology', 'Khám và điều trị bệnh lý thần kinh');

-- ADMIN (5 records)
INSERT INTO `admin` (`id`, `full_name`, `phone`, `department`, `user_id`) VALUES
(UUID_TO_BIN('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1'), 'Quản trị viên 1', '092000001', 'Operations', UUID_TO_BIN('11111111-1111-1111-1111-111111111111')),
(UUID_TO_BIN('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2'), 'Quản trị viên 2', '092000002', 'Support', UUID_TO_BIN('22222222-2222-2222-2222-222222222222')),
(UUID_TO_BIN('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3'), 'Quản trị viên 3', '092000003', 'Operations', UUID_TO_BIN('33333333-3333-3333-3333-333333333333')),
(UUID_TO_BIN('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4'), 'Quản trị viên 4', '092000004', 'Support', UUID_TO_BIN('44444444-4444-4444-4444-444444444444')),
(UUID_TO_BIN('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa5'), 'Quản trị viên 5', '092000005', 'Operations', UUID_TO_BIN('55555555-5555-5555-5555-555555555555'));

-- DOCTOR (5 records)
INSERT INTO `doctor` (`id`, `full_name`, `degree`, `avatar_url`, `bio`, `experience_years`, `clinic_fee`, `license_number`, `phone`, `user_id`, `specialty_id`) VALUES
(UUID_TO_BIN('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1'), 'Bác sĩ 1', 'Thạc sĩ Y khoa', 'https://picsum.photos/seed/doctor1/300/300', 'Hồ sơ bác sĩ mẫu 1', 6, 150000, 'LIC-2026-1001', '090000001', UUID_TO_BIN('11111111-1111-1111-1111-111111111111'), 1),
(UUID_TO_BIN('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2'), 'Bác sĩ 2', 'Tiến sĩ Y khoa', 'https://picsum.photos/seed/doctor2/300/300', 'Hồ sơ bác sĩ mẫu 2', 7, 200000, 'LIC-2026-1002', '090000002', UUID_TO_BIN('22222222-2222-2222-2222-222222222222'), 2),
(UUID_TO_BIN('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb3'), 'Bác sĩ 3', 'Thạc sĩ Y khoa', 'https://picsum.photos/seed/doctor3/300/300', 'Hồ sơ bác sĩ mẫu 3', 8, 250000, 'LIC-2026-1003', '090000003', UUID_TO_BIN('33333333-3333-3333-3333-333333333333'), 3),
(UUID_TO_BIN('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb4'), 'Bác sĩ 4', 'Tiến sĩ Y khoa', 'https://picsum.photos/seed/doctor4/300/300', 'Hồ sơ bác sĩ mẫu 4', 9, 300000, 'LIC-2026-1004', '090000004', UUID_TO_BIN('44444444-4444-4444-4444-444444444444'), 4),
(UUID_TO_BIN('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb5'), 'Bác sĩ 5', 'Thạc sĩ Y khoa', 'https://picsum.photos/seed/doctor5/300/300', 'Hồ sơ bác sĩ mẫu 5', 10, 350000, 'LIC-2026-1005', '090000005', UUID_TO_BIN('55555555-5555-5555-5555-555555555555'), 5);

-- PATIENT (5 records)
INSERT INTO `patient` (`id`, `patient_code`, `full_name`, `phone`, `address`, `gender`, `blood_type`, `allergies`, `medical_history`, `dob`, `user_id`) VALUES
(UUID_TO_BIN('cccccccc-cccc-cccc-cccc-ccccccccccc1'), 'PT000001', 'Bệnh nhân 1', '091000001', 'Địa chỉ 1', 'MALE', 'A+', 'Không', 'Tiền sử thông thường', '1990-01-10', UUID_TO_BIN('11111111-1111-1111-1111-111111111111')),
(UUID_TO_BIN('cccccccc-cccc-cccc-cccc-ccccccccccc2'), 'PT000002', 'Bệnh nhân 2', '091000002', 'Địa chỉ 2', 'FEMALE', 'O+', 'Không', 'Tiền sử thông thường', '1991-02-11', UUID_TO_BIN('22222222-2222-2222-2222-222222222222')),
(UUID_TO_BIN('cccccccc-cccc-cccc-cccc-ccccccccccc3'), 'PT000003', 'Bệnh nhân 3', '091000003', 'Địa chỉ 3', 'MALE', 'B+', 'Không', 'Tiền sử thông thường', '1992-03-12', UUID_TO_BIN('33333333-3333-3333-3333-333333333333')),
(UUID_TO_BIN('cccccccc-cccc-cccc-cccc-ccccccccccc4'), 'PT000004', 'Bệnh nhân 4', '091000004', 'Địa chỉ 4', 'FEMALE', 'AB+', 'Không', 'Tiền sử thông thường', '1993-04-13', UUID_TO_BIN('44444444-4444-4444-4444-444444444444')),
(UUID_TO_BIN('cccccccc-cccc-cccc-cccc-ccccccccccc5'), 'PT000005', 'Bệnh nhân 5', '091000005', 'Địa chỉ 5', 'MALE', 'O-', 'Không', 'Tiền sử thông thường', '1994-05-14', UUID_TO_BIN('55555555-5555-5555-5555-555555555555'));

-- SCHEDULE (5 records)
INSERT INTO `schedule` (`id`, `work_date`, `start_time`, `end_time`, `max_patient`, `status`, `doctor_id`) VALUES
(1, CURDATE() + INTERVAL 1 DAY, '08:00:00', '11:00:00', 20, 'OPEN', UUID_TO_BIN('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1')),
(2, CURDATE() + INTERVAL 2 DAY, '08:00:00', '11:00:00', 20, 'OPEN', UUID_TO_BIN('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2')),
(3, CURDATE() + INTERVAL 3 DAY, '08:00:00', '11:00:00', 20, 'OPEN', UUID_TO_BIN('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb3')),
(4, CURDATE() + INTERVAL 4 DAY, '08:00:00', '11:00:00', 20, 'OPEN', UUID_TO_BIN('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb4')),
(5, CURDATE() + INTERVAL 5 DAY, '08:00:00', '11:00:00', 20, 'OPEN', UUID_TO_BIN('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb5'));

-- APPOINTMENT (5 records)
INSERT INTO `appointment` (`id`, `appointment_date`, `start_time`, `end_time`, `status`, `reason`, `notes`, `queue_number`, `appointment_type`, `schedule_id`, `patient_id`, `doctor_id`) VALUES
(1, CURDATE() + INTERVAL 1 DAY, '08:00:00', '09:00:00', 'CONFIRMED', 'Khám tổng quát lần 1', 'Ghi chú mẫu 1', 1, 'FIRST_VISIT', 1, UUID_TO_BIN('cccccccc-cccc-cccc-cccc-ccccccccccc1'), UUID_TO_BIN('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1')),
(2, CURDATE() + INTERVAL 2 DAY, '09:00:00', '10:00:00', 'CONFIRMED', 'Khám tổng quát lần 2', 'Ghi chú mẫu 2', 2, 'REVISIT', 2, UUID_TO_BIN('cccccccc-cccc-cccc-cccc-ccccccccccc2'), UUID_TO_BIN('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2')),
(3, CURDATE() + INTERVAL 3 DAY, '10:00:00', '11:00:00', 'PENDING', 'Khám tổng quát lần 3', 'Ghi chú mẫu 3', 3, 'FIRST_VISIT', 3, UUID_TO_BIN('cccccccc-cccc-cccc-cccc-ccccccccccc3'), UUID_TO_BIN('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb3')),
(4, CURDATE() + INTERVAL 4 DAY, '08:30:00', '09:30:00', 'CONFIRMED', 'Khám tổng quát lần 4', 'Ghi chú mẫu 4', 4, 'REVISIT', 4, UUID_TO_BIN('cccccccc-cccc-cccc-cccc-ccccccccccc4'), UUID_TO_BIN('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb4')),
(5, CURDATE() + INTERVAL 5 DAY, '09:30:00', '10:30:00', 'CONFIRMED', 'Khám tổng quát lần 5', 'Ghi chú mẫu 5', 5, 'FIRST_VISIT', 5, UUID_TO_BIN('cccccccc-cccc-cccc-cccc-ccccccccccc5'), UUID_TO_BIN('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb5'));

-- MEDICAL_RECORD (5 records)
INSERT INTO `medical_record` (`id`, `title`, `date`, `status`, `icon`, `icon_bg`, `icon_color`, `diagnosis`, `notes`, `patient_id`, `doctor_id`, `appointment_id`) VALUES
(1, 'Hồ sơ khám 1', CURDATE(), 'hoàn thành', 'medical_services', 'bg-primary-fixed', 'text-primary', 'Chẩn đoán mẫu 1', 'Ghi chú hồ sơ 1', UUID_TO_BIN('cccccccc-cccc-cccc-cccc-ccccccccccc1'), UUID_TO_BIN('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1'), 1),
(2, 'Hồ sơ khám 2', CURDATE(), 'hoàn thành', 'medical_services', 'bg-primary-fixed', 'text-primary', 'Chẩn đoán mẫu 2', 'Ghi chú hồ sơ 2', UUID_TO_BIN('cccccccc-cccc-cccc-cccc-ccccccccccc2'), UUID_TO_BIN('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2'), 2),
(3, 'Hồ sơ khám 3', CURDATE(), 'hoàn thành', 'medical_services', 'bg-primary-fixed', 'text-primary', 'Chẩn đoán mẫu 3', 'Ghi chú hồ sơ 3', UUID_TO_BIN('cccccccc-cccc-cccc-cccc-ccccccccccc3'), UUID_TO_BIN('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb3'), 3),
(4, 'Hồ sơ khám 4', CURDATE(), 'hoàn thành', 'medical_services', 'bg-primary-fixed', 'text-primary', 'Chẩn đoán mẫu 4', 'Ghi chú hồ sơ 4', UUID_TO_BIN('cccccccc-cccc-cccc-cccc-ccccccccccc4'), UUID_TO_BIN('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb4'), 4),
(5, 'Hồ sơ khám 5', CURDATE(), 'hoàn thành', 'medical_services', 'bg-primary-fixed', 'text-primary', 'Chẩn đoán mẫu 5', 'Ghi chú hồ sơ 5', UUID_TO_BIN('cccccccc-cccc-cccc-cccc-ccccccccccc5'), UUID_TO_BIN('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb5'), 5);

-- PRESCRIPTION (5 records)
INSERT INTO `prescription` (`id`, `diagnosis`, `notes`, `appointment_id`) VALUES
(1, 'Chẩn đoán đơn thuốc 1', 'Uống thuốc đúng giờ', 1),
(2, 'Chẩn đoán đơn thuốc 2', 'Uống thuốc đúng giờ', 2),
(3, 'Chẩn đoán đơn thuốc 3', 'Uống thuốc đúng giờ', 3),
(4, 'Chẩn đoán đơn thuốc 4', 'Uống thuốc đúng giờ', 4),
(5, 'Chẩn đoán đơn thuốc 5', 'Uống thuốc đúng giờ', 5);

-- PRESCRIPTION_DETAIL (5 records)
INSERT INTO `prescription_detail` (`id`, `medicine_name`, `frequency`, `dosage`, `duration`, `notes`, `prescription_id`) VALUES
(1, 'Thuốc 1', '2 lần/ngày', '1 viên', '5 ngày', 'Sau ăn', 1),
(2, 'Thuốc 2', '2 lần/ngày', '1 viên', '5 ngày', 'Sau ăn', 2),
(3, 'Thuốc 3', '2 lần/ngày', '1 viên', '5 ngày', 'Sau ăn', 3),
(4, 'Thuốc 4', '2 lần/ngày', '1 viên', '5 ngày', 'Sau ăn', 4),
(5, 'Thuốc 5', '2 lần/ngày', '1 viên', '5 ngày', 'Sau ăn', 5);

-- REVIEW (5 records)
INSERT INTO `review` (`id`, `rating`, `comment`, `patient_id`, `doctor_id`) VALUES
(1, 5, 'Bác sĩ tư vấn rất tốt', UUID_TO_BIN('cccccccc-cccc-cccc-cccc-ccccccccccc1'), UUID_TO_BIN('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1')),
(2, 4, 'Khám nhanh và chi tiết', UUID_TO_BIN('cccccccc-cccc-cccc-cccc-ccccccccccc2'), UUID_TO_BIN('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2')),
(3, 5, 'Rất hài lòng', UUID_TO_BIN('cccccccc-cccc-cccc-cccc-ccccccccccc3'), UUID_TO_BIN('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb3')),
(4, 4, 'Dịch vụ ổn', UUID_TO_BIN('cccccccc-cccc-cccc-cccc-ccccccccccc4'), UUID_TO_BIN('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb4')),
(5, 5, 'Sẽ quay lại', UUID_TO_BIN('cccccccc-cccc-cccc-cccc-ccccccccccc5'), UUID_TO_BIN('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb5'));

-- DOCTOR_CERTIFICATE (5 records)
INSERT INTO `doctor_certificate` (`id`, `name`, `issued_by`, `issued_year`, `image_url`, `doctor_id`) VALUES
(1, 'Chứng chỉ 1', 'Đại học Y Hà Nội', 2018, 'https://picsum.photos/seed/cert1/300/200', UUID_TO_BIN('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1')),
(2, 'Chứng chỉ 2', 'Đại học Y Hà Nội', 2019, 'https://picsum.photos/seed/cert2/300/200', UUID_TO_BIN('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2')),
(3, 'Chứng chỉ 3', 'Đại học Y Hà Nội', 2020, 'https://picsum.photos/seed/cert3/300/200', UUID_TO_BIN('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb3')),
(4, 'Chứng chỉ 4', 'Đại học Y Hà Nội', 2021, 'https://picsum.photos/seed/cert4/300/200', UUID_TO_BIN('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb4')),
(5, 'Chứng chỉ 5', 'Đại học Y Hà Nội', 2022, 'https://picsum.photos/seed/cert5/300/200', UUID_TO_BIN('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb5'));

-- AUDIT_LOGS (5 records)
INSERT INTO `audit_logs` (`id`, `user_id`, `user_name`, `action`, `entity`, `entity_id`, `old_value`, `new_value`, `ip_address`, `created_at`) VALUES
(1, 1, 'seed_user_01', 'CREATE', 'Appointment', 1, '{}', '{"status":"CONFIRMED"}', '127.0.0.1', NOW()),
(2, 2, 'seed_user_02', 'UPDATE', 'Appointment', 2, '{"status":"PENDING"}', '{"status":"CONFIRMED"}', '127.0.0.2', NOW()),
(3, 3, 'seed_user_03', 'CREATE', 'Prescription', 3, '{}', '{"diagnosis":"..."}', '127.0.0.3', NOW()),
(4, 4, 'seed_user_04', 'UPDATE', 'MedicalRecord', 4, '{"notes":"old"}', '{"notes":"new"}', '127.0.0.4', NOW()),
(5, 5, 'seed_user_05', 'CREATE', 'Review', 5, '{}', '{"rating":5}', '127.0.0.5', NOW());

-- BANNERS (5 records)
INSERT INTO `banners` (`id`, `title`, `subtitle`, `image_url`, `link_url`, `sort_order`, `is_active`, `created_at`) VALUES
(1, 'Banner 1', 'Phụ đề 1', 'https://picsum.photos/seed/banner1/1200/400', 'https://example.com/banner/1', 1, 1, NOW()),
(2, 'Banner 2', 'Phụ đề 2', 'https://picsum.photos/seed/banner2/1200/400', 'https://example.com/banner/2', 2, 1, NOW()),
(3, 'Banner 3', 'Phụ đề 3', 'https://picsum.photos/seed/banner3/1200/400', 'https://example.com/banner/3', 3, 1, NOW()),
(4, 'Banner 4', 'Phụ đề 4', 'https://picsum.photos/seed/banner4/1200/400', 'https://example.com/banner/4', 4, 1, NOW()),
(5, 'Banner 5', 'Phụ đề 5', 'https://picsum.photos/seed/banner5/1200/400', 'https://example.com/banner/5', 5, 1, NOW());

-- MEDICAL_SERVICES (5 records)
INSERT INTO `medical_services` (`id`, `name`, `description`, `icon`, `category`, `price`, `image`, `created_at`, `updated_at`) VALUES
(1, 'Dịch vụ 1', 'Mô tả dịch vụ 1', 'medical_services', 'KHAM', '100000', 'https://picsum.photos/seed/service1/400/250', NOW(), NOW()),
(2, 'Dịch vụ 2', 'Mô tả dịch vụ 2', 'medical_services', 'XET_NGHIEM', '150000', 'https://picsum.photos/seed/service2/400/250', NOW(), NOW()),
(3, 'Dịch vụ 3', 'Mô tả dịch vụ 3', 'medical_services', 'KHAM', '200000', 'https://picsum.photos/seed/service3/400/250', NOW(), NOW()),
(4, 'Dịch vụ 4', 'Mô tả dịch vụ 4', 'medical_services', 'XET_NGHIEM', '250000', 'https://picsum.photos/seed/service4/400/250', NOW(), NOW()),
(5, 'Dịch vụ 5', 'Mô tả dịch vụ 5', 'medical_services', 'KHAM', '300000', 'https://picsum.photos/seed/service5/400/250', NOW(), NOW());

-- NEWS_ARTICLES (5 records)
INSERT INTO `news_articles` (`id`, `title`, `excerpt`, `content`, `image`, `category`, `author`, `author_image`, `published_at`, `views`, `featured`) VALUES
(1, 'Tin tức y tế 1', 'Tóm tắt bài viết 1', 'Nội dung chi tiết bài viết 1', 'https://picsum.photos/seed/news1/640/360', 'SUC_KHOE', 'Tác giả 1', 'https://picsum.photos/seed/author1/120/120', NOW(), 100, 1),
(2, 'Tin tức y tế 2', 'Tóm tắt bài viết 2', 'Nội dung chi tiết bài viết 2', 'https://picsum.photos/seed/news2/640/360', 'TU_VAN', 'Tác giả 2', 'https://picsum.photos/seed/author2/120/120', NOW(), 150, 0),
(3, 'Tin tức y tế 3', 'Tóm tắt bài viết 3', 'Nội dung chi tiết bài viết 3', 'https://picsum.photos/seed/news3/640/360', 'SUC_KHOE', 'Tác giả 3', 'https://picsum.photos/seed/author3/120/120', NOW(), 200, 0),
(4, 'Tin tức y tế 4', 'Tóm tắt bài viết 4', 'Nội dung chi tiết bài viết 4', 'https://picsum.photos/seed/news4/640/360', 'TU_VAN', 'Tác giả 4', 'https://picsum.photos/seed/author4/120/120', NOW(), 250, 0),
(5, 'Tin tức y tế 5', 'Tóm tắt bài viết 5', 'Nội dung chi tiết bài viết 5', 'https://picsum.photos/seed/news5/640/360', 'SUC_KHOE', 'Tác giả 5', 'https://picsum.photos/seed/author5/120/120', NOW(), 300, 0);

-- NOTIFICATIONS (5 records)
INSERT INTO `notifications` (`id`, `type`, `title`, `message`, `is_read`, `patient_id`, `created_at`) VALUES
(1, 'APPOINTMENT', 'Thông báo 1', 'Nội dung thông báo 1', 0, 'PT000001', NOW()),
(2, 'SYSTEM', 'Thông báo 2', 'Nội dung thông báo 2', 0, 'PT000002', NOW()),
(3, 'APPOINTMENT', 'Thông báo 3', 'Nội dung thông báo 3', 1, 'PT000003', NOW()),
(4, 'SYSTEM', 'Thông báo 4', 'Nội dung thông báo 4', 0, 'PT000004', NOW()),
(5, 'APPOINTMENT', 'Thông báo 5', 'Nội dung thông báo 5', 1, 'PT000005', NOW());

-- SETTINGS (5 records)
INSERT INTO `settings` (`setting_key`, `value`, `value_type`, `description`, `updated_at`) VALUES
('site_name', 'NHB Clinic', 'STRING', 'Tên hệ thống', NOW()),
('support_phone', '19001001', 'STRING', 'Số hotline', NOW()),
('default_language', 'vi', 'STRING', 'Ngôn ngữ mặc định', NOW()),
('appointment_slot_minutes', '30', 'NUMBER', 'Độ dài mỗi khung giờ', NOW()),
('maintenance_mode', 'false', 'BOOLEAN', 'Trạng thái bảo trì', NOW());

-- INVALIDATE_TOKEN (5 records)
INSERT INTO `invalidate_token` (`id`, `expiration_time`) VALUES
('seed-token-1', NOW() + INTERVAL 1 DAY),
('seed-token-2', NOW() + INTERVAL 2 DAY),
('seed-token-3', NOW() + INTERVAL 3 DAY),
('seed-token-4', NOW() + INTERVAL 4 DAY),
('seed-token-5', NOW() + INTERVAL 5 DAY);
