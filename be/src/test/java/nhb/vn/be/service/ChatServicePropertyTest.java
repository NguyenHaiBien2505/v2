package nhb.vn.be.service;

import net.jqwik.api.*;
import nhb.vn.be.repository.AppointmentRepository;
import nhb.vn.be.repository.DoctorRepository;
import nhb.vn.be.repository.MedicalServiceRepository;
import nhb.vn.be.repository.PatientRepository;
import nhb.vn.be.repository.ScheduleRepository;
import nhb.vn.be.repository.SpecialtyRepository;
import org.mockito.Mockito;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.memory.repository.jdbc.JdbcChatMemoryRepository;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Property-Based Tests for ChatService.
 * Feature: ai-chatbot-upgrade, Property 7: Empty/whitespace message rejection
 */
class ChatServicePropertyTest {

    // ── Mocks ────────────────────────────────────────────────────────────────
    private final ChatClient.Builder chatClientBuilder = Mockito.mock(ChatClient.Builder.class);
    private final JdbcChatMemoryRepository jdbcChatMemoryRepository = Mockito.mock(JdbcChatMemoryRepository.class);
    private final DoctorRepository doctorRepository = Mockito.mock(DoctorRepository.class);
    private final SpecialtyRepository specialtyRepository = Mockito.mock(SpecialtyRepository.class);
    private final ScheduleRepository scheduleRepository = Mockito.mock(ScheduleRepository.class);
    private final AppointmentRepository appointmentRepository = Mockito.mock(AppointmentRepository.class);
    private final PatientRepository patientRepository = Mockito.mock(PatientRepository.class);
    private final MedicalServiceRepository medicalServiceRepository = Mockito.mock(MedicalServiceRepository.class);
    private final IntentClassifier intentClassifier;
    private final BookingFlowService bookingFlowService = Mockito.mock(BookingFlowService.class);
    private final DoctorSuggestionHelper doctorSuggestionHelper;

    private final ChatService chatService;

    ChatServicePropertyTest() {
        Mockito.when(doctorRepository.findAll()).thenReturn(List.of());
        intentClassifier = new IntentClassifier(doctorRepository);

        doctorSuggestionHelper = new DoctorSuggestionHelper(doctorRepository, specialtyRepository);

        chatService = new ChatService(
                chatClientBuilder,
                jdbcChatMemoryRepository,
                doctorRepository,
                specialtyRepository,
                scheduleRepository,
                appointmentRepository,
                patientRepository,
                medicalServiceRepository,
                intentClassifier,
                bookingFlowService,
                doctorSuggestionHelper);
    }

    // Feature: ai-chatbot-upgrade, Property 7: Empty/whitespace message rejection
    // Validates: Requirements 7.3
    @Property(tries = 100)
    void emptyOrWhitespaceMessageReturnsGuidanceWithoutCallingAI(
            @ForAll("nullEmptyOrWhitespaceStrings") String message) {

        String response = chatService.chat(message, null, null);

        // Must return a non-empty guidance string
        assertThat(response)
                .as("Response must be non-empty for blank/null message: '%s'", message)
                .isNotNull()
                .isNotBlank();

        // AI (ChatClient.Builder) must NOT have been called
        Mockito.verify(chatClientBuilder, Mockito.never()).build();
    }

    @Provide
    Arbitrary<String> nullEmptyOrWhitespaceStrings() {
        // Mix of: null, empty string, strings of only whitespace characters
        Arbitrary<String> nullArb = Arbitraries.just(null);
        Arbitrary<String> emptyArb = Arbitraries.just("");
        Arbitrary<String> whitespaceArb = Arbitraries.strings()
                .withChars(" \t\n\r")
                .ofMinLength(1)
                .ofMaxLength(20);

        return Arbitraries.oneOf(nullArb, emptyArb, whitespaceArb);
    }
}
