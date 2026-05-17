import { useEffect, useState } from 'react';
import { FiCalendar, FiClock, FiCheckCircle, FiUsers, FiUser, FiBarChart2, FiChevronLeft, FiChevronRight, FiX, FiPlus, FiTrash2 } from 'react-icons/fi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { doctorSidebar } from './DoctorDashboard';
import NotificationDialog from '../../components/NotificationDialog';
import type { Appointment } from '../../data/mockData';
import { useAuthStore } from '../../store/authStore';
import { getDoctorAppointments, createDoctorSchedule, getDoctorSchedulesApi, deleteScheduleApi, ScheduleResponseApi } from '../../services/healthApi';
import { useNotification } from '../../hooks/useNotification';
import styles from './DoctorSchedule.module.css';

const DoctorSchedule = () => {
  const profile = useAuthStore((s) => s.profile) as { id?: string } | null;
  const { notification, showSuccess, showError, closeNotification } = useNotification();
  
  // Data state
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctorSchedules, setDoctorSchedules] = useState<ScheduleResponseApi[]>([]);
  
  // Form state
  const [formData, setFormData] = useState({
    workDate: '',
    startTime: '07:00',
    endTime: '17:00',
    maxPatient: 10,
    isDayOff: false
  });
  const [saving, setSaving] = useState(false);

  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));

  const loadData = async () => {
    if (!profile?.id) return;
    try {
      const [apptsData, schedData] = await Promise.all([
        getDoctorAppointments(profile.id).catch(() => []),
        getDoctorSchedulesApi(profile.id, 0, 200).catch(() => ({ content: [] as ScheduleResponseApi[] }))
      ]);
      setAppointments(apptsData);
      setDoctorSchedules(schedData.content || []);
    } catch (error) {
      console.error('Failed to load schedule', error);
    }
  };

  useEffect(() => {
    loadData();
    // Default workDate to today
    const today = new Date();
    setFormData(prev => ({
      ...prev,
      workDate: `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`
    }));
  }, [profile?.id]);

  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) {
      showError('Lỗi', 'Không tìm thấy thông tin bác sĩ.');
      return;
    }
    if (!formData.workDate) {
      showError('Lỗi', 'Vui lòng chọn ngày.');
      return;
    }
    
    setSaving(true);
    try {
      const payload = {
        workDate: formData.workDate,
        startTime: formData.isDayOff ? '00:00:00' : (formData.startTime.length === 5 ? `${formData.startTime}:00` : formData.startTime),
        endTime: formData.isDayOff ? '00:00:00' : (formData.endTime.length === 5 ? `${formData.endTime}:00` : formData.endTime),
        maxPatient: formData.isDayOff ? 0 : Number(formData.maxPatient),
        status: formData.isDayOff ? 'INACTIVE' : 'ACTIVE',
      };

      await createDoctorSchedule(profile.id, payload);
      showSuccess('Thành công', 'Đã lưu lịch làm việc thành công.');
      loadData();
    } catch (error) {
      showError('Lỗi', 'Không thể lưu lịch làm việc.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSchedule = async (id: number) => {
    if (!window.confirm('Bạn có chắc muốn xóa lịch của ngày này?')) return;
    try {
      await deleteScheduleApi(id);
      showSuccess('Thành công', 'Đã xóa lịch làm việc.');
      loadData();
    } catch (error) {
      showError('Lỗi', 'Không thể xóa lịch.');
    }
  };

  // Calendar helpers
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();
  const todayDate = new Date();
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
    const t = `${todayDate.getFullYear()}-${String(todayDate.getMonth()+1).padStart(2,'0')}-${String(todayDate.getDate()).padStart(2,'0')}`;
    return date === t;
  };
  
  const getAppts = (date: string) => appointments.filter(a => a.appointmentDate === date);
  const getScheduleForDate = (date: string) => doctorSchedules.find(s => s.workDate === date);

  return (
    <DashboardLayout sections={doctorSidebar}>
      <h1 className={styles.pageTitle}>Lịch làm việc</h1>

      <div className={styles.scheduleGrid}>
        {/* Form Create Schedule */}
        <div className={styles.card}>
          <div className={styles.cardTitle}>Tạo / Cập nhật lịch làm việc</div>
          <form className={styles.scheduleForm} onSubmit={handleSaveSchedule}>
            <div className={styles.formGroup}>
              <label>Ngày</label>
              <input 
                type="date" 
                className={styles.inputField} 
                value={formData.workDate} 
                onChange={e => setFormData({...formData, workDate: e.target.value})} 
                required 
              />
            </div>
            
            <div className={styles.formGroupCheckbox}>
              <label className={styles.checkboxLabel}>
                <input 
                  type="checkbox" 
                  checked={formData.isDayOff} 
                  onChange={e => setFormData({...formData, isDayOff: e.target.checked})} 
                />
                Đánh dấu là ngày nghỉ (Không nhận bệnh nhân)
              </label>
            </div>

            {!formData.isDayOff && (
              <div className={styles.timeInputsRow}>
                <div className={styles.formGroup}>
                  <label>Giờ bắt đầu</label>
                  <input 
                    type="time" 
                    className={styles.inputField} 
                    value={formData.startTime} 
                    onChange={e => setFormData({...formData, startTime: e.target.value})} 
                    required={!formData.isDayOff} 
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Giờ kết thúc</label>
                  <input 
                    type="time" 
                    className={styles.inputField} 
                    value={formData.endTime} 
                    onChange={e => setFormData({...formData, endTime: e.target.value})} 
                    required={!formData.isDayOff} 
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Số bệnh nhân tối đa</label>
                  <input 
                    type="number" 
                    min="1"
                    className={styles.inputField} 
                    value={formData.maxPatient} 
                    onChange={e => setFormData({...formData, maxPatient: Number(e.target.value)})} 
                    required={!formData.isDayOff} 
                  />
                </div>
              </div>
            )}
            
            <button type="submit" className={styles.btnPrimary} disabled={saving}>
              {saving ? 'Đang lưu...' : 'Lưu lịch'}
            </button>
          </form>
        </div>

        {/* List of upcoming schedules */}
        <div className={styles.card}>
          <div className={styles.cardTitle}>Danh sách lịch sắp tới</div>
          <div className={styles.tableContainer}>
            <table className={styles.schedTable}>
              <thead>
                <tr>
                  <th>Ngày</th>
                  <th>Trạng thái</th>
                  <th>Thời gian</th>
                  <th>Khách tối đa</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {doctorSchedules.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '1rem' }}>Chưa có lịch nào.</td>
                  </tr>
                )}
                {doctorSchedules.slice(0, 10).map((s) => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 600 }}>{s.workDate}</td>
                    <td>
                      {s.status === 'ACTIVE' ? (
                        <span className={styles.badgeActive}>Làm việc</span>
                      ) : (
                        <span className={styles.badgeInactive}>Ngày nghỉ</span>
                      )}
                    </td>
                    <td>
                      {s.status === 'ACTIVE' ? `${s.startTime.slice(0,5)} - ${s.endTime.slice(0,5)}` : '-'}
                    </td>
                    <td>{s.status === 'ACTIVE' ? s.maxPatient : '-'}</td>
                    <td>
                      <button 
                        className={styles.btnIconDelete} 
                        onClick={() => handleDeleteSchedule(s.id)}
                        title="Xóa lịch"
                      >
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {doctorSchedules.length > 10 && (
              <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
                Hiển thị 10 lịch gần nhất. Hãy xem trên lịch để thấy toàn bộ.
              </div>
            )}
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
            const sched = cd.isCurrentMonth ? getScheduleForDate(cd.date) : undefined;
            const isDayOff = sched?.status === 'INACTIVE';
            
            return (
              <div 
                key={i} 
                className={`${styles.calDay} ${!cd.isCurrentMonth ? styles.calDayOther : ''} ${isToday(cd.date) ? styles.calDayToday : ''} ${isDayOff ? styles.calDayOff : ''}`}
                onClick={() => {
                  if (cd.isCurrentMonth) {
                    setFormData(prev => ({ ...prev, workDate: cd.date, isDayOff: isDayOff }));
                  }
                }}
                style={{ cursor: cd.isCurrentMonth ? 'pointer' : 'default' }}
              >
                <div className={styles.calDayNum}>{cd.day}</div>
                {sched && sched.status === 'ACTIVE' && (
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-primary)', fontWeight: 600, marginBottom: '2px' }}>
                     {sched.startTime.slice(0,5)} - {sched.endTime.slice(0,5)}
                  </div>
                )}
                {isDayOff && (
                   <div style={{ fontSize: '0.7rem', color: 'var(--color-danger)', fontWeight: 600, marginBottom: '2px' }}>
                     Nghỉ làm
                   </div>
                )}
                {appts.slice(0, 2).map(a => (
                  <div key={a.id} className={styles.calDayAppt}>{a.startTime} - {a.reason.slice(0, 10)}</div>
                ))}
                {appts.length > 2 && <div style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)' }}>+{appts.length - 2} khác</div>}
              </div>
            );
          })}
        </div>
      </div>

      <NotificationDialog {...notification} onClose={closeNotification} />
    </DashboardLayout>
  );
};

export default DoctorSchedule;
