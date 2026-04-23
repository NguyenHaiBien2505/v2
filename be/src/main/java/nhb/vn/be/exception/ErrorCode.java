package nhb.vn.be.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum ErrorCode {
    // General errors
    UNCATEGORIZED_EXCEPTION(9999, "Uncategorized error", HttpStatus.BAD_REQUEST),
    INVALID_KEY(1001, "Invalid message key", HttpStatus.BAD_REQUEST),

    // User errors
    USER_EXISTED(1002, "User already existed", HttpStatus.BAD_REQUEST),
    USER_NOT_EXISTED(1003, "User not existed", HttpStatus.BAD_REQUEST),
    USERNAME_INVALID(1004, "Username must be at least 3 characters", HttpStatus.BAD_REQUEST),
    PASSWORD_INVALID(1005, "Password must be at least 8 characters", HttpStatus.BAD_REQUEST),
    INVALID_DOB(1006, "User must be at least 18 years old", HttpStatus.BAD_REQUEST),

    // Role errors
    ROLE_NOT_EXISTED(2001, "Role not existed", HttpStatus.BAD_REQUEST),

    // Authentication errors
    UNAUTHENTICATED(3001, "Unauthenticated", HttpStatus.BAD_REQUEST),
    UNAUTHORIZED(3002, "You do not have permission", HttpStatus.BAD_REQUEST),

    // Entity errors
    DOCTOR_NOT_EXISTED(4001, "Doctor not existed", HttpStatus.BAD_REQUEST),
    PATIENT_NOT_EXISTED(4002, "Patient not existed", HttpStatus.BAD_REQUEST),
    SPECIALTY_NOT_EXISTED(4003, "Specialty not existed", HttpStatus.BAD_REQUEST),
    APPOINTMENT_NOT_EXISTED(4004, "Appointment not existed", HttpStatus.BAD_REQUEST),
    SCHEDULE_NOT_EXISTED(4005, "Schedule not existed", HttpStatus.BAD_REQUEST),
    MEDICAL_RECORD_NOT_EXISTED(4006, "Medical record not existed", HttpStatus.BAD_REQUEST),
    PRESCRIPTION_NOT_EXISTED(4007, "Prescription not existed", HttpStatus.BAD_REQUEST),
    BANNER_NOT_EXISTED(4008, "Banner not existed", HttpStatus.BAD_REQUEST),
    NEWS_NOT_EXISTED(4009, "News not existed", HttpStatus.BAD_REQUEST),
    SERVICE_NOT_EXISTED(4010, "Service not existed", HttpStatus.BAD_REQUEST),

    // Validation errors
    EMAIL_INVALID(5001, "Invalid email format", HttpStatus.BAD_REQUEST),
    PHONE_INVALID(5002, "Invalid phone number", HttpStatus.BAD_REQUEST),
    APPOINTMENT_CONFLICT(5003, "Appointment time conflict", HttpStatus.BAD_REQUEST),
    SCHEDULE_FULL(5004, "Schedule is full", HttpStatus.BAD_REQUEST),

    // Database errors
    DATA_INTEGRITY_VIOLATION(6001, "Data integrity violation", HttpStatus.BAD_REQUEST);

    private int code;
    private String message;
    private HttpStatusCode httpStatusCode;

    public int getCode() {
        return code;
    }

    public String getMessage() {
        return message;
    }

    ErrorCode(int code, String message, HttpStatusCode httpStatusCode) {
        this.code = code;
        this.message = message;
        this.httpStatusCode = httpStatusCode;
    }
}