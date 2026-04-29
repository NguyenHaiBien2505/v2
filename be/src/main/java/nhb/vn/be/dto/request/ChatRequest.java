package nhb.vn.be.dto.request;

import java.util.UUID;

// ChatRequest.java
public record ChatRequest(
        String message,
        UUID userId,           // ID của Patient hoặc User
        String conversationId  // tuỳ chọn, nếu không có thì tự sinh
) {}