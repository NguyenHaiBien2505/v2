import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCheck, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { FaCheckCircle } from 'react-icons/fa';
import Header from '../../components/layout/Header';
import { specialties, doctors, generateTimeSlots } from '../../data/mockData';
import type { Specialty, Doctor, TimeSlot } from '../../data/mockData';
import { useAuthStore } from '../../store/authStore';
import { createAppointment, createAppointmentPayment } from '../../services/healthApi';
import styles from './BookingPage.module.css';

const stepLabels = ['Chuyên khoa', 'Bác sĩ', 'Ngày khám', 'Giờ khám', 'Thông tin', 'Xác nhận'];

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (!error || typeof error !== 'object') return fallback;

  const err = error as {
    message?: string;
    response?: {
      data?: unknown;
    };
  };

  const payload = err.response?.data;
  if (typeof payload === 'string' && payload.trim()) {
    return payload;
  }

  if (payload && typeof payload === 'object') {
    const data = payload as { message?: unknown; error?: unknown };
    if (typeof data.message === 'string' && data.message.trim()) {
      return data.message;
    }
    if (typeof data.error === 'string' && data.error.trim()) {
      return data.error;
    }
  }

  if (typeof err.message === 'string' && err.message.trim()) {
    return err.message;
  }

  return fallback;
};

const BookingPage = () => {
  const navigate = useNavigate();
  const profile = useAuthStore((s) => s.profile) as { id?: string } | null;
  const [step, setStep] = useState(0);
  const [selectedSpec, setSelectedSpec] = useState<Specialty | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [bookingFinished, setBookingFinished] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Lọc bác sĩ theo chuyên khoa
  const filteredDocs = useMemo(() => {
    if (!selectedSpec) return doctors;
    return doctors.filter((d) => d.specialty.id === selectedSpec.id);
  }, [selectedSpec]);

  // Tạo calendar cho tháng hiện tại
  const [calMonth, setCalMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const calDays = useMemo(() => {
    const { year, month } = calMonth;
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: { day: number; disabled: boolean }[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 0; i < firstDay; i++) days.push({ day: 0, disabled: true });
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      days.push({ day: d, disabled: date < today || date.getDay() === 0 });
    }
    return days;
  }, [calMonth]);

  const slots = useMemo(() => generateTimeSlots(selectedDate), [selectedDate]);

  const canNext = () => {
    switch (step) {
      case 0: return !!selectedSpec;
      case 1: return true; // bác sĩ có thể bỏ qua
      case 2: return !!selectedDate;
      case 3: return !!selectedSlot;
      case 4: return reason.trim().length > 0;
      default: return true;
    }
  };

  const handleNext = async () => {
    if (step === 5) {
      if (!profile?.id || !selectedDate || !selectedSlot) {
        alert('Vui lòng đăng nhập và chọn đầy đủ ngày giờ khám trước khi thanh toán.');
        if (!profile?.id) navigate('/login');
        return;
      }
      const doctor = selectedDoc || filteredDocs[0];
      if (!doctor) return;
      setSubmitting(true);
      let createdAppointmentId: number | null = null;
      try {
        const appointment = await createAppointment(profile.id, String(doctor.id), {
          appointmentDate: selectedDate,
          startTime: `${selectedSlot.time}:00`,
          reason,
          appointmentType: 'FIRST_VISIT',
        });
        createdAppointmentId = appointment.id;

        const payment = await createAppointmentPayment(appointment.id);
        if (!payment.checkoutUrl) {
          throw new Error('Backend did not return checkoutUrl');
        }

        setBookingFinished(true);
        localStorage.setItem('pendingPayment', JSON.stringify({
          ...payment,
          source: 'appointment',
        }));
        navigate('/payment/checkout');
      } catch (error) {
        console.error(error);
        const message = getErrorMessage(error, 'Không thể khởi tạo thanh toán. Vui lòng thử lại.');
        if (createdAppointmentId) {
          alert(`Đặt lịch thành công nhưng tạo thanh toán thất bại: ${message}`);
          navigate(`/patient/appointments/${createdAppointmentId}`);
        } else {
          alert(message);
        }
      } finally {
        setSubmitting(false);
      }
      return;
    }
    setStep((s) => s + 1);
  };

  const monthNames = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
  const dayLabels = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

  if (bookingFinished) {
    return (
      <div>
        <Header />
        <div className={styles.page}>
          <div className={styles.container}>
            <div className={styles.card}>
              <div className={styles.success}>
                <div className={styles.successIcon}><FaCheckCircle /></div>
                <h2 className={styles.successTitle}>Đang chuyển sang thanh toán...</h2>
                <p className={styles.successMsg}>
                  Lịch hẹn đã được ghi nhận. Hệ thống đang mở cổng thanh toán PayOS.
                </p>
                <button className={styles.btnSuccess} onClick={() => navigate('/patient/appointments')}>
                  Quay lại lịch hẹn
                </button>
                <button className={styles.btnSuccess} style={{ background: 'var(--color-secondary)' }} onClick={() => navigate('/')}>
                  Về trang chủ
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className={styles.page}>
        <div className={styles.container}>
          <h1 className={styles.title}>Đặt lịch khám</h1>

          {/* Stepper */}
          <div className={styles.stepper}>
            {stepLabels.map((label, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div className={`${styles.step} ${idx === step ? styles.stepActive : ''} ${idx < step ? styles.stepDone : ''}`}>
                  <span className={styles.stepNum}>{idx < step ? <FiCheck /> : idx + 1}</span>
                  <span>{label}</span>
                </div>
                {idx < stepLabels.length - 1 && <span className={styles.stepLine} />}
              </div>
            ))}
          </div>

          <div className={styles.card}>
            {/* Step 1: Chọn chuyên khoa */}
            {step === 0 && (
              <>
                <h2 className={styles.cardTitle}>Chọn chuyên khoa</h2>
                <div className={styles.optionsGrid}>
                  {specialties.map((spec) => (
                    <div
                      key={spec.id}
                      className={`${styles.option} ${selectedSpec?.id === spec.id ? styles.optionSelected : ''}`}
                      onClick={() => setSelectedSpec(spec)}
                    >
                      <div className={styles.optionName}>{spec.name}</div>
                      <div className={styles.optionDesc}>{spec.description}</div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Step 2: Chọn bác sĩ */}
            {step === 1 && (
              <>
                <h2 className={styles.cardTitle}>Chọn bác sĩ (hoặc bỏ qua)</h2>
                <div className={styles.optionsGrid}>
                  {filteredDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className={`${styles.option} ${selectedDoc?.id === doc.id ? styles.optionSelected : ''}`}
                      onClick={() => setSelectedDoc(doc)}
                    >
                      <div className={styles.docOption}>
                        <img src={doc.avatarUrl} alt={doc.fullName} />
                        <div>
                          <div className={styles.optionName}>{doc.fullName}</div>
                          <div className={styles.optionDesc}>{doc.degree} • ⭐ {doc.avgRating}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Step 3: Chọn ngày */}
            {step === 2 && (
              <>
                <h2 className={styles.cardTitle}>Chọn ngày khám</h2>
                <div className={styles.calendarNav}>
                  <button onClick={() => setCalMonth((p) => {
                    const d = new Date(p.year, p.month - 1);
                    return { year: d.getFullYear(), month: d.getMonth() };
                  })}><FiChevronLeft /></button>
                  <strong>{monthNames[calMonth.month]} {calMonth.year}</strong>
                  <button onClick={() => setCalMonth((p) => {
                    const d = new Date(p.year, p.month + 1);
                    return { year: d.getFullYear(), month: d.getMonth() };
                  })}><FiChevronRight /></button>
                </div>
                <div className={styles.calendarGrid}>
                  {dayLabels.map((d) => <div key={d} className={styles.calDayLabel}>{d}</div>)}
                  {calDays.map((d, i) => {
                    if (d.day === 0) return <div key={i} />;
                    const dateStr = `${calMonth.year}-${String(calMonth.month + 1).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`;
                    const isToday = dateStr === new Date().toISOString().slice(0, 10);
                    return (
                      <div
                        key={i}
                        className={`${styles.calDay} ${d.disabled ? styles.calDayDisabled : ''} ${selectedDate === dateStr ? styles.calDaySelected : ''} ${isToday ? styles.calDayToday : ''}`}
                        onClick={() => !d.disabled && setSelectedDate(dateStr)}
                      >
                        {d.day}
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* Step 4: Chọn giờ */}
            {step === 3 && (
              <>
                <h2 className={styles.cardTitle}>Chọn giờ khám – {selectedDate}</h2>
                <div className={styles.slotsGrid}>
                  {slots.map((s) => (
                    <div
                      key={s.time}
                      className={`${styles.slot} ${!s.available ? styles.slotBooked : ''} ${selectedSlot?.time === s.time ? styles.slotSelected : ''}`}
                      onClick={() => s.available && setSelectedSlot(s)}
                    >
                      {s.time}
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Step 5: Lý do khám */}
            {step === 4 && (
              <>
                <h2 className={styles.cardTitle}>Thông tin khám</h2>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Lý do khám *</label>
                  <textarea className={styles.textarea} placeholder="Mô tả triệu chứng hoặc lý do khám..." value={reason} onChange={(e) => setReason(e.target.value)} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Ghi chú thêm</label>
                  <textarea className={styles.textarea} placeholder="Tiền sử bệnh, dị ứng thuốc..." value={notes} onChange={(e) => setNotes(e.target.value)} />
                </div>
              </>
            )}

            {/* Step 6: Xác nhận */}
            {step === 5 && (
              <>
                <h2 className={styles.cardTitle}>Xác nhận thông tin đặt lịch</h2>
                <div className={styles.summary}>
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>Chuyên khoa</span>
                    <span className={styles.summaryValue}>{selectedSpec?.name}</span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>Bác sĩ</span>
                    <span className={styles.summaryValue}>{selectedDoc?.fullName || 'Hệ thống tự gán'}</span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>Ngày khám</span>
                    <span className={styles.summaryValue}>{selectedDate}</span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>Giờ khám</span>
                    <span className={styles.summaryValue}>{selectedSlot?.time}</span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>Lý do</span>
                    <span className={styles.summaryValue}>{reason}</span>
                  </div>
                  {notes && (
                    <div className={styles.summaryRow}>
                      <span className={styles.summaryLabel}>Ghi chú</span>
                      <span className={styles.summaryValue}>{notes}</span>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Nav buttons */}
            <div className={styles.nav}>
              {step > 0 ? (
                <button className={styles.btnPrev} onClick={() => setStep((s) => s - 1)}>← Quay lại</button>
              ) : <div />}
              <button className={styles.btnNext} onClick={handleNext} disabled={!canNext() || submitting}>
                {step === 5 ? (submitting ? 'Đang gửi...' : 'Xác nhận đặt lịch') : 'Tiếp tục →'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
