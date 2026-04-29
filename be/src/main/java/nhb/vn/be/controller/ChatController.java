package nhb.vn.be.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nhb.vn.be.dto.request.ChatRequest;
import nhb.vn.be.dto.response.APIResponse;
import nhb.vn.be.service.ChatService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    /**
     * API 1: Chat text đơn giản (trả về String thuần)
     * POST /chat
     * Body: { "message": "nội dung" }
     */
    @PostMapping
    public String chat(@RequestBody ChatRequest request) {
        log.info("Chat request: {}", request.message());
        return chatService.chat(request);
    }

    /**
     * API 2: Chat text có hỗ trợ userId (trả về APIResponse wrapper)
     * POST /chat/v2
     * Body: { "message": "nội dung", "userId": "uuid", "conversationId": "optional" }
     */
    @PostMapping("/v2")
    public APIResponse<String> chatV2(@RequestBody ChatRequest request) {
        log.info("Chat v2 request - userId: {}, message: {}", request.userId(), request.message());

        String response = chatService.chat(request);

        return APIResponse.<String>builder()
                .code(0)
                .message("Success")
                .result(response)
                .build();
    }

    /**
     * API 3: Chat với hình ảnh
     * POST /chat/with-image
     * Form-data: file (image), message (text)
     */
    @PostMapping(value = "/with-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public String chatWithImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam("message") String message) {

        log.info("Chat with image - fileName: {}, message: {}", file.getOriginalFilename(), message);
        return chatService.chatWithImage(file, message);
    }

    /**
     * API 4: Chat với hình ảnh (có hỗ trợ userId)
     * POST /chat/with-image/v2
     * Form-data: file, message, userId, conversationId
     */
    @PostMapping(value = "/with-image/v2", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public APIResponse<String> chatWithImageV2(
            @RequestParam("file") MultipartFile file,
            @RequestParam("message") String message,
            @RequestParam(value = "userId", required = false) UUID userId,
            @RequestParam(value = "conversationId", required = false) String conversationId) {

        log.info("Chat with image v2 - userId: {}, fileName: {}", userId, file.getOriginalFilename());

        String response = chatService.chatWithImage(file, message, userId, conversationId);

        return APIResponse.<String>builder()
                .code(0)
                .message("Success")
                .result(response)
                .build();
    }

    @GetMapping("/metrics")
    public APIResponse<Map<String, Object>> getMetrics() {
        return APIResponse.<Map<String, Object>>builder()
                .code(0)
                .message("Success")
                .result(chatService.getChatQualityMetrics())
                .build();
    }

    /**
     * API 5: Chat với AI tư vấn y tế (có system prompt chuyên biệt)
     * POST /chat/medical-advice
     */
//    @PostMapping("/medical-advice")
//    public APIResponse<String> medicalAdvice(@RequestBody ChatRequest request) {
//        log.info("Medical advice request: {}", request.message());
//
//        // Gọi method đặc biệt cho tư vấn y tế
//        String response = chatService.medicalAdvice(request);
//
//        return APIResponse.<String>builder()
//                .code(0)
//                .message("Success")
//                .result(response)
//                .build();
//    }
}