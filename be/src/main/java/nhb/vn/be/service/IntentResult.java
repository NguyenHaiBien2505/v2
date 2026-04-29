package nhb.vn.be.service;

/**
 * Result of intent classification.
 * intent: one of SUGGEST_DOCTOR, CHECK_SCHEDULE, BOOKING, CONFIRM_BOOKING,
 *                CANCEL_BOOKING, VIEW_APPOINTMENTS, HOSPITAL_INFO, MEDICAL_ADVICE
 * extractedEntity: optional entity extracted from the message (e.g. doctor name, specialty)
 */
public record IntentResult(String intent, String extractedEntity) {}
