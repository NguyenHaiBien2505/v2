package nhb.vn.be.controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import nhb.vn.be.dto.response.APIResponse;
import nhb.vn.be.exception.AppException;
import nhb.vn.be.exception.ErrorCode;
import nhb.vn.be.service.UserService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/upload")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FileUploadController {

    final UserService userService;

    @Value("${app.upload.dir:uploads/avatars}")
    String uploadDir;

    @Value("${app.base-url:http://localhost:8080/api/v2}")
    String baseUrl;

    private static final List<String> ALLOWED_TYPES = List.of(
            "image/jpeg", "image/png", "image/gif", "image/webp"
    );
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    /**
     * Upload avatar ảnh lên server, cập nhật avatarUrl của user hiện tại.
     * Trả về URL công khai của ảnh đã upload.
     */
    @PostMapping("/avatar")
    public APIResponse<String> uploadAvatar(@RequestParam("file") MultipartFile file) {
        log.info("Received upload request for file: {}, size: {}, type: {}", 
                file.getOriginalFilename(), file.getSize(), file.getContentType());

        // Validate file
        if (file.isEmpty()) {
            log.error("Upload failed: File is empty");
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            log.error("Upload failed: Invalid content type {}", contentType);
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            log.error("Upload failed: File size {} exceeds limit", file.getSize());
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        try {
            // Xác định thư mục upload relative to project root
            Path root = Paths.get("").toAbsolutePath();
            Path uploadPath = root.resolve(uploadDir).normalize();
            
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
                log.info("Created upload directory: {}", uploadPath);
            }

            // Tạo tên file unique
            String originalFilename = file.getOriginalFilename();
            String extension = ".jpg"; 
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String newFilename = UUID.randomUUID().toString() + extension;

            // Lưu file
            Path filePath = uploadPath.resolve(newFilename);
            try (var inputStream = file.getInputStream()) {
                Files.copy(inputStream, filePath, StandardCopyOption.REPLACE_EXISTING);
            }

            // Tạo public URL
            String avatarUrl = baseUrl + "/avatars/" + newFilename;

            log.info("File saved to: {}, public URL: {}", filePath, avatarUrl);
            return APIResponse.<String>builder()
                    .result(avatarUrl)
                    .build();

        } catch (Exception e) {
            log.error("Failed to save file to disk", e);
            return APIResponse.<String>builder()
                    .code(500)
                    .message("Server error: " + e.getMessage())
                    .build();
        }
    }
}
