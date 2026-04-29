package nhb.vn.be.service;

import net.jqwik.api.*;
import nhb.vn.be.repository.DoctorRepository;
import org.mockito.Mockito;

import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Property-Based Tests for IntentClassifier.
 * Feature: ai-chatbot-upgrade, Property 1: Intent classification completeness
 */
class IntentClassifierPropertyTest {

    private static final Set<String> VALID_INTENTS = Set.of(
            "SUGGEST_DOCTOR",
            "CHECK_SCHEDULE",
            "BOOKING",
            "CONFIRM_BOOKING",
            "CANCEL_BOOKING",
            "VIEW_APPOINTMENTS",
            "HOSPITAL_INFO",
            "MEDICAL_ADVICE"
    );

    private final DoctorRepository doctorRepository = Mockito.mock(DoctorRepository.class);
    private final IntentClassifier classifier;

    IntentClassifierPropertyTest() {
        Mockito.when(doctorRepository.findAll()).thenReturn(List.of());
        classifier = new IntentClassifier(doctorRepository);
    }

        @Example
        void scheduleQuestionsShouldResolveToCheckSchedule() {
                IntentResult result = classifier.classify("Lịch khám của bác sĩ Minh vào ngày mai thế nào?");

                assertThat(result.intent()).isEqualTo("CHECK_SCHEDULE");
        }

        @Example
        void headacheQuestionsShouldResolveToSuggestDoctor() {
                IntentResult result = classifier.classify("Tôi bị đau đầu, nên khám chuyên khoa nào?");

                assertThat(result.intent()).isEqualTo("SUGGEST_DOCTOR");
        }

    // Feature: ai-chatbot-upgrade, Property 1: Intent classification completeness
    // Validates: Requirements 1.1, 1.4
    @Property(tries = 20)
    void intentClassificationCompleteness(@ForAll("nonEmptyNonWhitespaceStrings") String message) {
        IntentResult result = classifier.classify(message);

        assertThat(result)
                .as("classify() must return non-null for message: %s", message)
                .isNotNull();

        assertThat(result.intent())
                .as("intent must be non-null for message: %s", message)
                .isNotNull()
                .isNotEmpty();

        assertThat(VALID_INTENTS)
                .as("intent '%s' must belong to valid intent set for message: %s", result.intent(), message)
                .contains(result.intent());
    }

    @Provide
    Arbitrary<String> nonEmptyNonWhitespaceStrings() {
        // Generate strings that have at least one non-whitespace character
        return Arbitraries.strings()
                .withCharRange('a', 'z')
                .withChars("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 àáâãèéêìíòóôõùúýăđơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ")
                .ofMinLength(1)
                .ofMaxLength(200)
                .filter(s -> !s.isBlank());
    }
}
