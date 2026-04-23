import { useEffect, useState } from 'react';
import { FiCalendar, FiClock, FiCheckCircle, FiUsers, FiUser, FiBarChart2, FiChevronLeft, FiChevronRight, FiX, FiPlus } from 'react-icons/fi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { doctorSidebar } from './DoctorDashboard';
import type { Appointment } from '../../data/mockData';
import { useAuthStore } from '../../store/authStore';
import { getDoctorAppointments } from '../../services/healthApi';
import styles from './DoctorSchedule.module.css';

interface WorkDay {
  dayOfWeek: number;
  label: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

interface DayOff {
  id: number;
  date: string;
  reason: string;
}

const initialSchedule: WorkDay[] = [
  { dayOfWeek: 1, label: 'Thứ 2', startTime: '07:00', endTime: '17:00', isActive: true },
  { dayOfWeek: 2, label: 'Thứ 3', startTime: '07:00', endTime: '17:00', isActive: true },
  { dayOfWeek: 3, label: 'Thứ 4', startTime: '07:00', endTime: '17:00', isActive: true },
  { dayOfWeek: 4, label: 'Thứ 5', startTime: '07:00', endTime: '17:00', isActive: true },
  { dayOfWeek: 5, label: 'Thứ 6', startTime: '07:00', endTime: '17:00', isActive: true },
  { dayOfWeek: 6, label: 'Thứ 7', startTime: '08:00', endTime: '12:00', isActive: true },
  { dayOfWeek: 0, label: 'Chủ nhật', startTime: '00:00', endTime: '00:00', isActive: false },
];

const DoctorSchedule = () => {
  const profile = useAuthStore((s) => s.profile) as { id?: string } | null;
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [schedule, setSchedule] = useState<WorkDay[]>(initialSchedule);
  const [daysOff, setDaysOff] = useState<DayOff[]>([
    { id: 1, date: '2026-04-30', reason: 'Ngày lễ' },
    { id: 2, date: '2026-05-01', reason: 'Ngày lễ' },
  ]);
  const [newOffDate, setNewOffDate] = useState('');
  const [newOffReason, setNewOffReason] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 3, 1)); // April 2026

  useEffect(() => {
    const load = async () => {
      if (!profile?.id) return;
      const data = await getDoctorAppointments(profile.id).catch(() => []);
      setAppointments(data);
    };

    load();
  }, [profile?.id]);

  const toggleDay = (idx: number) => {
    const updated = [...schedule];
    updated[idx].isActive = !updated[idx].isActive;
    setSchedule(updated);
  };

  const updateTime = (idx: number, field: 'startTime' | 'endTime', value: string) => {
    const updated = [...schedule];
    updated[idx][field] = value;
    setSchedule(updated);
  };

  const addDayOff = () => {
    if (!newOffDate) return;
    setDaysOff([...daysOff, { id: Date.now(), date: newOffDate, reason: newOffReason }]);
    setNewOffDate('');
    setNewOffReason('');
  };

  const removeDayOff = (id: number) => setDaysOff(daysOff.filter(d => d.id !== id));

  // Calendar helpers
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();
  const today = new Date();
  const monthNames = ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6','Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'];

  const calendarDays: { day: number; isCurrentMonth: boolean; date: string }[] = [];
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    calendarDays.push({ day: d, isCurrentMonth: false, date: `${year}-${String(month).padStart(2,'0')}-${String(d).padStart(2,'0')}` });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push({ day: d, isCurrentMonth: true, date: `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}` });
  }
  const remaining = 42 - calendarDays.length;
  for (let d = 1; d <= remaining; d++) {
    calendarDays.push({ day: d, isCurrentMonth: false, date: `${year}-${String(month+2).padStart(2,'0')}-${String(d).padStart(2,'0')}` });
  }

  const isToday = (date: string) => {
    const t = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
    return date === t;
  };
  const isDayOff = (date: string) => daysOff.some(d => d.date === date);
  const getAppts = (date: string) => appointments.filter(a => a.appointmentDate === date);

  return (
    <DashboardLayout sections={doctorSidebar}>
      <h1 className={styles.pageTitle}>Lịch làm việc</h1>

      <div className={styles.scheduleGrid}>
        {/* Weekly schedule */}
        <div className={styles.card}>
          <div className={styles.cardTitle}>Khung giờ làm việc hàng tuần</div>
          <table className={styles.schedTable}>
            <thead>
              <tr><th>Ngày</th><th>Bắt đầu</th><th>Kết thúc</th><th>Hoạt động</th></tr>
            </thead>
            <tbody>
              {schedule.map((day, idx) => (
                <tr key={day.dayOfWeek}>
                  <td style={{ fontWeight: 600 }}>{day.label}</td>
                  <td>
                    <input type="time" className={styles.timeInput} value={day.startTime}
                      onChange={e => updateTime(idx, 'startTime', e.target.value)}
                      disabled={!day.isActive} />
                  </td>
                  <td>
                    <input type="time" className={styles.timeInput} value={day.endTime}
                      onChange={e => updateTime(idx, 'endTime', e.target.value)}
                      disabled={!day.isActive} />
                  </td>
                  <td>
                    <button className={`${styles.toggleActive} ${day.isActive ? styles.on : styles.off}`}
                      onClick={() => toggleDay(idx)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: '1rem', textAlign: 'right' }}>
            <button className={styles.btnPrimary}>Lưu lịch làm việc</button>
          </div>
        </div>

        {/* Days off */}
        <div className={styles.card}>
          <div className={styles.cardTitle}>Ngày nghỉ / Ngày đặc biệt</div>
          <ul className={styles.dayOffList}>
            {daysOff.map(d => (
              <li key={d.id} className={styles.dayOffItem}>
                <div>
                  <div className={styles.dayOffDate}>{d.date}</div>
                  <div className={styles.dayOffReason}>{d.reason}</div>
                </div>
                <button className={styles.btnRemove} onClick={() => removeDayOff(d.id)}>
                  <FiX /> Xóa
                </button>
              </li>
            ))}
          </ul>
          <div className={styles.addDayOff}>
            <input type="date" value={newOffDate} onChange={e => setNewOffDate(e.target.value)} />
            <input type="text" placeholder="Lý do..." value={newOffReason} onChange={e => setNewOffReason(e.target.value)} />
            <button className={styles.btnPrimary} onClick={addDayOff}><FiPlus /> Thêm</button>
          </div>
        </div>
      </div>

      {/* Monthly calendar view */}
      <div className={styles.card}>
        <div className={styles.calHeader}>
          <h3>{monthNames[month]} {year}</h3>
          <div className={styles.calNav}>
            <button onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}><FiChevronLeft /></button>
            <button onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}><FiChevronRight /></button>
          </div>
        </div>
        <div className={styles.calGrid}>
          {['CN','T2','T3','T4','T5','T6','T7'].map(d => (
            <div key={d} className={styles.calDayHeader}>{d}</div>
          ))}
          {calendarDays.map((cd, i) => {
            const appts = cd.isCurrentMonth ? getAppts(cd.date) : [];
            return (
              <div key={i} className={`${styles.calDay} ${!cd.isCurrentMonth ? styles.calDayOther : ''} ${isToday(cd.date) ? styles.calDayToday : ''} ${isDayOff(cd.date) ? styles.calDayOff : ''}`}>
                <div className={styles.calDayNum}>{cd.day}</div>
                {appts.slice(0, 2).map(a => (
                  <div key={a.id} className={styles.calDayAppt}>{a.startTime} - {a.reason.slice(0, 10)}</div>
                ))}
                {appts.length > 2 && <div style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)' }}>+{appts.length - 2} khác</div>}
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DoctorSchedule;
