package nhb.vn.be.exception;

import lombok.extern.slf4j.Slf4j;
import nhb.vn.be.dto.response.APIResponse;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import jakarta.validation.ConstraintViolation;


import java.nio.file.AccessDeniedException;
import java.util.Map;
import java.util.Objects;

@ControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    private static final String MIN_ATTRIBUTE = "min";

    @ExceptionHandler(value = AppException.class)
    public ResponseEntity<APIResponse<Void>> handleAppException(AppException e) {
        ErrorCode errorCode = e.getErrorCode();
        APIResponse<Void> response = APIResponse.<Void>builder()
                .code(errorCode.getCode())
                .message(e.getMessage())
                .build();
        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(value = MethodArgumentNotValidException.class)
    public ResponseEntity<APIResponse<Void>> handleValidationException(MethodArgumentNotValidException e) {
        String enumKey = e.getFieldError().getDefaultMessage();
        ErrorCode errorCode = ErrorCode.INVALID_KEY;
        Map<String, Object> attributes = null;

        try {
            errorCode = ErrorCode.valueOf(enumKey);
            var constraintViolation = e.getBindingResult()
                    .getAllErrors().getFirst()
                    .unwrap(ConstraintViolation.class);
            attributes = constraintViolation.getConstraintDescriptor().getAttributes();
            log.info(attributes.toString());
        } catch (IllegalArgumentException ignored) {}

        APIResponse<Void> response = APIResponse.<Void>builder()
                .code(errorCode.getCode())
                .message(Objects.nonNull(attributes) ?
                        mapAttribute(errorCode.getMessage(), attributes) :
                        errorCode.getMessage())
                .build();
        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(value = AccessDeniedException.class)
    public ResponseEntity<APIResponse<Void>> handleAccessDeniedException(AccessDeniedException e) {
        ErrorCode errorCode = ErrorCode.UNAUTHORIZED;
        return ResponseEntity.status(403).body(
                APIResponse.<Void>builder()
                        .code(errorCode.getCode())
                        .message(errorCode.getMessage())
                        .build()
        );
    }

    @ExceptionHandler(value = DataIntegrityViolationException.class)
    public ResponseEntity<APIResponse<Void>> handleDataIntegrityViolationException(DataIntegrityViolationException e) {
        ErrorCode errorCode = ErrorCode.DATA_INTEGRITY_VIOLATION;
        return ResponseEntity.badRequest().body(
                APIResponse.<Void>builder()
                        .code(errorCode.getCode())
                        .message(errorCode.getMessage())
                        .build()
        );
    }

    @ExceptionHandler(value = RuntimeException.class)
    public ResponseEntity<APIResponse<Void>> handleRuntimeException(RuntimeException e) {
        ErrorCode errorCode = ErrorCode.UNCATEGORIZED_EXCEPTION;
        return ResponseEntity.badRequest().body(
                APIResponse.<Void>builder()
                        .code(errorCode.getCode())
                        .message(e.getMessage())
                        .build()
        );
    }

    private String mapAttribute(String message, Map<String, Object> attributes) {
        String minValue = String.valueOf(attributes.get(MIN_ATTRIBUTE));
        return message.replace("{" + MIN_ATTRIBUTE + "}", minValue);
    }
}