package nhb.vn.be.service;

import net.jqwik.api.*;
import net.jqwik.api.constraints.IntRange;
import nhb.vn.be.entity.Doctor;
import nhb.vn.be.entity.Schedule;
import nhb.vn.be.entity.Specialty;
import nhb.vn.be.repository.AppointmentRepository;
import nhb.vn.be.repository.DoctorRepository;
import nhb.vn.be.repository.MedicalServiceRepository;
import nhb.vn.be.repository.PatientRepository;
import nhb.vn.be.repository.ScheduleRepository;
import nhb.vn.be.repository.SpecialtyRepository;
import org.mockito.Mockito;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.memory.repository.jdbc.JdbcChatMemoryRepository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Feature: ai-chatbot-upgrade, Property 9: Schedule availability filter
 * Validates: Requirements 3.2
 *
 * For any Schedule entity where bookedCount >= maxPatient,
 * that schedule SHALL NOT appear in the available slots returned by handleCheckSchedule().
 */
class ScheduleAvailabilityPropertyTest {

    private final ChatClient.Builder chatClientBuilder = Mockito.mock(ChatClient.Builder.class);
    private final JdbcChatMemoryRepository jdbcChatMemoryRepository = Mockito.mock(JdbcChatMemoryRepository.class);
    private final DoctorRepository doctorRepository = Mockito.mock(DoctorRepository.class);
    private final SpecialtyRepository specialtyRepository = Mockito.mock(SpecialtyRepository.class);
    private final ScheduleRepository scheduleRepository = Mockito.mock(ScheduleRepository.class);
    private final AppointmentRepository appointmentRepository = Mockito.mock(AppointmentRepository.class);
    private final PatientRepository patientRepository = Mockito.mock(PatientRepository.class);
    private final MedicalServiceRepository medicalServiceRepository = Mockito.mock(MedicalServiceRepository.class);
    private final BookingFlowService bookingFlowService = Mockito.mock(BookingFlowService.class);
    private final DoctorSuggestionHelper doctorSuggestionHelper;
    private final IntentClassifier intentClassifier;
    private final ChatService chatService;

    ScheduleAvailabilityPropertyTest() {
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
                doctorSuggestionHelper
        );
    }

    // Feature: ai-chatbot-upgrade, Property 9: Schedule availability filter
    // Validates: Requirements 3.2
    @Property(tries = 100)
    void fullSchedulesDoNotAppearInAvailableSlots(
            @ForAll("fullSchedules") List<Schedule> fullSchedules,
            @ForAll @IntRange(min = 1, max = 10) int maxPatient) {

        Doctor doctor = buildDoctor();
        String doctorName = doctor.getFullName();

        // All schedules are full (bookedCount >= maxPatient)
        List<Schedule> schedules = fullSchedules.stream()
                .peek(s -> {
                    s.setMaxPatient(maxPatient);
                    s.setDoctor(doctor);
                })
                .toList();

        Mockito.when(doctorRepository.findByFullNameContainingIgnoreCase(doctorName))
                .thenReturn(List.of(doctor));
        Mockito.when(scheduleRepository.findUpcomingSchedulesByDoctorId(
                Mockito.eq(doctor.getId()), Mockito.any(LocalDate.class)))
                .thenReturn(schedules);

        // Each schedule is fully booked: bookedCount == maxPatient
        schedules.forEach(s ->
                Mockito.when(appointmentRepository.countBookedAppointments(s.getId()))
                        .thenReturn(maxPatient));

        // Suggest other doctors returns empty (no other doctors in specialty)
        Mockito.when(doctorRepository.findBySpecialtyNameContaining(Mockito.anyString()))
                .thenReturn(List.of());
        Mockito.when(doctorRepository.findTop3ByOrderByRatingDesc(Mockito.any()))
                .thenReturn(List.of());

        String response = chatService.chat("xem lịch bác sĩ " + doctorName, null, null);

        // Response must NOT contain any date from the full schedules
        for (Schedule s : schedules) {
            String dateStr = s.getWorkDate().toString(); // yyyy-MM-dd
            // The formatted date in response is dd/MM/yyyy — check neither format appears as a slot
            String formattedDate = String.format("%02d/%02d/%d",
                    s.getWorkDate().getDayOfMonth(),
                    s.getWorkDate().getMonthValue(),
                    s.getWorkDate().getYear());
            // The response should indicate no available slots (not list the full schedule as available)
            assertThat(response)
                    .as("Full schedule on %s should not appear as available slot", formattedDate)
                    .doesNotContain("🗓️ **" + formattedDate + "**");
        }

        // Response must indicate no available schedule (not the normal schedule listing header)
        assertThat(response)
                .as("Response should indicate no available slots when all schedules are full")
                .doesNotContain("LỊCH RẢNH CỦA BÁC SĨ");
    }

    @Provide
    Arbitrary<List<Schedule>> fullSchedules() {
        return Arbitraries.integers().between(1, 5).flatMap(count ->
                Arbitraries.integers().between(0, 6).map(daysOffset -> {
                    Schedule s = new Schedule();
                    s.setId((long) (Math.random() * 10000 + 1));
                    s.setWorkDate(LocalDate.now().plusDays(daysOffset));
                    s.setStartTime(LocalTime.of(8, 0));
                    s.setEndTime(LocalTime.of(12, 0));
                    s.setStatus("ACTIVE");
                    return s;
                }).list().ofMinSize(1).ofMaxSize(5)
        );
    }

    private Doctor buildDoctor() {
        Specialty specialty = new Specialty();
        specialty.setId(1L);
        specialty.setName("Nội khoa");

        Doctor doctor = new Doctor();
        doctor.setId(UUID.randomUUID());
        doctor.setFullName("Nguyễn Văn Test");
        doctor.setSpecialty(specialty);
        return doctor;
    }
}
