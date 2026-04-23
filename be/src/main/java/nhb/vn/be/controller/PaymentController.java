package nhb.vn.be.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nhb.vn.be.dto.response.PaymentResponseDTO;
import nhb.vn.be.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final PaymentService paymentService;

    // Flow 1: Thanh toán lịch hẹn
    @PostMapping("/appointment/{appointmentId}")
    public ResponseEntity<PaymentResponseDTO> payAppointment(
            @PathVariable Long appointmentId) throws Exception {
        return ResponseEntity.ok(
                paymentService.createAppointmentPayment(appointmentId));
    }

    // Flow 2: Thanh toán dịch vụ
    @PostMapping("/medical-service/{medicalServiceId}")
    public ResponseEntity<PaymentResponseDTO> payMedicalService(
            @PathVariable Long medicalServiceId) throws Exception {
        return ResponseEntity.ok(
                paymentService.createMedicalServicePayment(medicalServiceId));
    }

    // PayOS gọi về sau khi thanh toán xong
    // Endpoint này phải public, không cần JWT
    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(@RequestBody Map<String, Object> payload) {
        try {
            log.info("Webhook received: {}", payload);
            paymentService.handleWebhook(payload);
            return ResponseEntity.ok("success");
        } catch (Exception e) {
            log.error("Webhook error: ", e);
            return ResponseEntity.badRequest().body("failed: " + e.getMessage());
        }
    }
}