package nhb.vn.be.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nhb.vn.be.dto.response.PaymentResponseDTO;
import nhb.vn.be.entity.Appointment;
import nhb.vn.be.entity.MedicalService;
import nhb.vn.be.entity.Payment;
import nhb.vn.be.enums.PaymentTargetType;
import nhb.vn.be.repository.AppointmentRepository;
import nhb.vn.be.repository.MedicalServiceRepository;
import nhb.vn.be.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import vn.payos.PayOS;
import vn.payos.type.CheckoutResponseData;
import vn.payos.type.ItemData;
import vn.payos.type.PaymentData;
import vn.payos.type.Webhook;

import java.time.LocalDateTime;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    @Value("${payos.client-id}")
    private String clientId;

    @Value("${payos.api-key}")
    private String apiKey;

    @Value("${payos.checksum-key}")
    private String checksumKey;

    @Value("${payos.return-url}")
    private String returnUrl;

    @Value("${payos.cancel-url}")
    private String cancelUrl;

    private final PaymentRepository paymentRepository;
    private final AppointmentRepository appointmentRepository;
    private final MedicalServiceRepository medicalServiceRepository;

    // ================================================================
    // FLOW 1: Khách chọn Appointment → thanh toán
    // ================================================================
    public PaymentResponseDTO createAppointmentPayment(Long appointmentId) throws Exception {

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment không tồn tại: " + appointmentId));

        // Kiểm tra đã có payment PENDING chưa - tránh tạo trùng
        boolean hasPending = paymentRepository
                .existsByTargetTypeAndTargetIdAndStatus(
                        PaymentTargetType.APPOINTMENT, appointmentId, "PENDING");
        if (hasPending) {
            throw new RuntimeException("Appointment này đang có giao dịch chờ thanh toán");
        }

        // Lấy amount từ appointment - dùng clinicFee của doctor
        Long amount = appointment.getDoctor() != null && appointment.getDoctor().getClinicFee() != null
                ? appointment.getDoctor().getClinicFee().longValue()
                : 200000L; // fallback mặc định nếu chưa gắn bác sĩ

        String description = "Thanh toan lich kham #" + appointmentId;

        return buildPaymentAndCallPayOS(
                PaymentTargetType.APPOINTMENT,
                appointmentId,
                amount,
                description
        );
    }

    // ================================================================
    // FLOW 2: Khách chọn MedicalService → thanh toán
    // ================================================================
    public PaymentResponseDTO createMedicalServicePayment(Long medicalServiceId) throws Exception {

        MedicalService service = medicalServiceRepository.findById(medicalServiceId)
                .orElseThrow(() -> new RuntimeException("MedicalService không tồn tại: " + medicalServiceId));

        String description = "Thanh toan dich vu: " + service.getName();

        return buildPaymentAndCallPayOS(
                PaymentTargetType.MEDICAL_SERVICE,
                medicalServiceId,
                service.getPrice(),
                description
        );
    }

    // ================================================================
    // WEBHOOK: PayOS callback - Xử lý với Map (chắc chắn chạy)
    // ================================================================
    public void handleWebhook(Map<String, Object> payload) throws Exception {
        log.info("=== PROCESSING WEBHOOK ===");

        // Lấy data từ payload
        Map<String, Object> data = (Map<String, Object>) payload.get("data");
        if (data == null) {
            throw new RuntimeException("Invalid webhook: missing data");
        }

        // Lấy thông tin từ data
        Long orderCode = Long.valueOf(data.get("orderCode").toString());
        String status = (String) data.get("status");
        String transactionId = (String) data.get("transactionId");

        log.info("OrderCode: {}, Status: {}, TransactionId: {}", orderCode, status, transactionId);

        // Tìm payment
        Payment payment = paymentRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy payment: " + orderCode));

        // Tránh xử lý lại nếu đã PAID rồi
        if ("PAID".equals(payment.getStatus())) {
            log.info("Payment already processed: {}", orderCode);
            return;
        }

        // Xử lý theo status
        if ("PAID".equals(status)) {
            payment.setStatus("PAID");
            payment.setPaidAt(LocalDateTime.now());
            payment.setPayosTransactionId(transactionId);
            paymentRepository.save(payment);
            updateTargetOnSuccess(payment);
            log.info("Payment SUCCESS for order: {}", orderCode);

        } else if ("CANCELLED".equals(status)) {
            payment.setStatus("CANCELLED");
            paymentRepository.save(payment);
            log.info("Payment CANCELLED for order: {}", orderCode);

        } else {
            payment.setStatus("FAILED");
            paymentRepository.save(payment);
            log.info("Payment FAILED for order: {}", orderCode);
        }
    }

    // ================================================================
    // PRIVATE HELPERS
    // ================================================================

    private PaymentResponseDTO buildPaymentAndCallPayOS(
            PaymentTargetType targetType,
            Long targetId,
            Long amount,
            String description) throws Exception {

        // Validation
        if (amount == null || amount <= 0) {
            throw new RuntimeException("Số tiền không hợp lệ: " + amount);
        }

        // Tạo orderCode unique
        long orderCode = Long.parseLong(
                System.currentTimeMillis() + "" + (System.nanoTime() % 100000)
        );

        // Lưu Payment vào DB trước
        Payment payment = Payment.builder()
                .orderCode(orderCode)
                .amount(amount)
                .description(description)
                .status("PENDING")
                .targetType(targetType)
                .targetId(targetId)
                .createdAt(LocalDateTime.now())
                .build();
        paymentRepository.save(payment);

        // Gọi PayOS API
        PayOS payOS = new PayOS(clientId, apiKey, checksumKey);

        ItemData item = ItemData.builder()
                .name(description.length() > 25 ? description.substring(0, 25) : description)
                .quantity(1)
                .price(amount.intValue())
                .build();

        PaymentData paymentData = PaymentData.builder()
                .orderCode(orderCode)
                .amount(amount.intValue())
                .description(description)
                .item(item)
                .returnUrl(returnUrl)
                .cancelUrl(cancelUrl)
                .build();

        CheckoutResponseData response = payOS.createPaymentLink(paymentData);

        // Cập nhật URL và QR từ PayOS trả về
        payment.setCheckoutUrl(response.getCheckoutUrl());
        payment.setQrCode(response.getQrCode());
        paymentRepository.save(payment);

        return PaymentResponseDTO.builder()
                .orderCode(orderCode)
                .amount(amount)
                .description(description)
                .status("PENDING")
                .qrCode(response.getQrCode())
                .checkoutUrl(response.getCheckoutUrl())
                .build();
    }

    private void updateTargetOnSuccess(Payment payment) {
        switch (payment.getTargetType()) {

            case APPOINTMENT -> {
                Appointment appointment = appointmentRepository
                        .findById(payment.getTargetId())
                        .orElseThrow();
                appointment.setStatus("CONFIRMED");
                appointmentRepository.save(appointment);
                log.info("Appointment {} confirmed", payment.getTargetId());
            }

            case MEDICAL_SERVICE -> {
                // MedicalService là danh mục dịch vụ, không cần update status
                // Nếu sau này cần lưu lịch sử mua → tạo thêm bảng OrderHistory
                log.info("Medical service {} purchased", payment.getTargetId());
            }
        }
    }
}