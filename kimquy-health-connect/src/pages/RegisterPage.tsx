import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../store/authStore.ts';
import Header from '../components/layout/Header';
import styles from './Auth.module.css';

interface RegisterForm {
  fullName: string;
  username: string;
  phone: string;
  dateOfBirth: string;
  password: string;
  confirmPassword: string;
}

const RegisterPage = () => {
  const { register: reg, handleSubmit, watch, formState: { errors } } = useForm<RegisterForm>();
  const registerFn = useAuthStore((s) => s.register);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);
    setError('');
    const ok = await registerFn({ fullName: data.fullName, username: data.username, phone: data.phone, password: data.password, dateOfBirth: data.dateOfBirth });
    setLoading(false);
    if (ok) {
      navigate('/patient/dashboard');
    } else {
      setError('Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.');
    }
  };

  return (
    <div>
      <Header />
      <div className={styles.page}>
        <div className={styles.card} style={{ maxWidth: 500 }}>
          <h1 className={styles.title}>Đăng ký</h1>
          <p className={styles.subtitle}>Tạo tài khoản để đặt lịch khám nhanh chóng</p>

          {error && <div className={styles.alertError}>{error}</div>}

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Họ và tên</label>
              <input className={styles.input} placeholder="Nguyễn Văn A" {...reg('fullName', { required: 'Vui lòng nhập họ tên' })} />
              {errors.fullName && <div className={styles.error}>{errors.fullName.message}</div>}
            </div>
            <div className={styles.row}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Tên đăng nhập</label>
                <input className={styles.input} placeholder="patient01" {...reg('username', { required: 'Vui lòng nhập tên đăng nhập' })} />
                {errors.username && <div className={styles.error}>{errors.username.message}</div>}
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Số điện thoại</label>
                <input className={styles.input} placeholder="0901234567" {...reg('phone', { required: 'Vui lòng nhập SĐT' })} />
                {errors.phone && <div className={styles.error}>{errors.phone.message}</div>}
              </div>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Ngày sinh</label>
              <input className={styles.input} type="date" {...reg('dateOfBirth')} />
            </div>
            <div className={styles.row}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Mật khẩu</label>
                <input className={styles.input} type="password" placeholder="••••••" {...reg('password', { required: 'Vui lòng nhập mật khẩu', minLength: { value: 6, message: 'Tối thiểu 6 ký tự' } })} />
                {errors.password && <div className={styles.error}>{errors.password.message}</div>}
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Xác nhận mật khẩu</label>
                <input className={styles.input} type="password" placeholder="••••••" {...reg('confirmPassword', { validate: (v) => v === watch('password') || 'Mật khẩu không khớp' })} />
                {errors.confirmPassword && <div className={styles.error}>{errors.confirmPassword.message}</div>}
              </div>
            </div>
            <button className={styles.btnSubmit} type="submit" disabled={loading}>
              {loading ? 'Đang tạo tài khoản...' : 'Đăng ký'}
            </button>
          </form>
          <div className={styles.footer}>
            Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
