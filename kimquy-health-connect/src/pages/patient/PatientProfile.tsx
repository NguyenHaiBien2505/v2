import { useForm } from 'react-hook-form';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { patientSidebar } from './PatientDashboard';
import { useAuthStore, type PatientProfile as PatientProfileData } from '../../store/authStore';
import styles from './PatientDashboard.module.css';
import authStyles from '../Auth.module.css';

const PatientProfile = () => {
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile) as PatientProfileData | null;
  const patientCode = profile?.patientCode || '00000000';
  const { register, handleSubmit } = useForm({
    defaultValues: {
      fullName: profile?.fullName || '',
      username: user?.username || '',
      phone: profile?.phone || '',
      bloodType: profile?.bloodType || 'O+',
      allergies: profile?.allergies || '',
      medicalHistory: profile?.medicalHistory || '',
    },
  });

  const onSubmit = (data: any) => {
    alert('Đã lưu thông tin! (mock)');
    console.log(data);
  };

  return (
    <DashboardLayout sections={patientSidebar}>
      <h1 className={styles.pageTitle}>Hồ sơ sức khỏe</h1>
      <div style={{ background: 'linear-gradient(135deg, var(--color-primary), #0ea5e9)', color: '#fff', padding: '1rem 1.25rem', borderRadius: 12, marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <div style={{ fontSize: 12, opacity: 0.9 }}>MÃ BỆNH NHÂN</div>
          <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'monospace', letterSpacing: 2 }}>{patientCode}</div>
        </div>
        <div style={{ fontSize: 13, opacity: 0.95, textAlign: 'right' }}>
          Vui lòng cung cấp mã này<br />khi đến phòng khám
        </div>
      </div>
      <div className={styles.tableCard}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className={authStyles.formGroup}>
              <label className={authStyles.label}>Họ và tên</label>
              <input className={authStyles.input} {...register('fullName')} />
            </div>
            <div className={authStyles.formGroup}>
              <label className={authStyles.label}>Tên đăng nhập</label>
              <input className={authStyles.input} {...register('username')} readOnly />
            </div>
            <div className={authStyles.formGroup}>
              <label className={authStyles.label}>Số điện thoại</label>
              <input className={authStyles.input} {...register('phone')} />
            </div>
            <div className={authStyles.formGroup}>
              <label className={authStyles.label}>Nhóm máu</label>
              <input className={authStyles.input} {...register('bloodType')} />
            </div>
          </div>
          <div className={authStyles.formGroup}>
            <label className={authStyles.label}>Tiền sử bệnh</label>
            <textarea className={authStyles.input} style={{ minHeight: 80 }} {...register('medicalHistory')} />
          </div>
          <div className={authStyles.formGroup}>
            <label className={authStyles.label}>Dị ứng</label>
            <textarea className={authStyles.input} style={{ minHeight: 60 }} {...register('allergies')} />
          </div>
          <button type="submit" className={authStyles.btnSubmit} style={{ maxWidth: 200 }}>Lưu thông tin</button>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default PatientProfile;
