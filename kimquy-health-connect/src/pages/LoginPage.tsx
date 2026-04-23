import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../store/authStore.ts';
import Header from '../components/layout/Header';
import styles from './Auth.module.css';

interface LoginForm {
  username: string;
  password: string;
}

const LoginPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();
  const login = useAuthStore((s) => s.login);
  const lastLoginError = useAuthStore((s) => s.lastLoginError);
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    setError('');
    const ok = await login(data.username, data.password);
    setLoading(false);
    if (ok) {
      const user = useAuthStore.getState().user;
      if (user?.role === 'DOCTOR') navigate('/doctor/dashboard');
      else if (user?.role === 'ADMIN') navigate('/admin/dashboard');
      else navigate('/patient/dashboard');
    } else {
      if (lastLoginError === 'INVALID_CREDENTIALS') {
        setError('Tên đăng nhập hoặc mật khẩu không đúng.');
      } else if (lastLoginError === 'NETWORK_OR_CORS') {
        setError('Không thể kết nối đến máy chủ (CORS/mạng). Vui lòng kiểm tra BE và thử lại.');
      } else {
        setError('Đăng nhập thất bại do lỗi hệ thống. Vui lòng thử lại.');
      }
    }
  };

  return (
    <div>
      <Header />
      <div className={styles.page}>
        <div className={styles.card}>
          <h1 className={styles.title}>Đăng nhập</h1>
          <p className={styles.subtitle}>Chào mừng bạn quay lại Phòng Khám Kim Quy</p>

          {error && <div className={styles.alertError}>{error}</div>}

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Tên đăng nhập</label>
              <input
                className={styles.input}
                type="text"
                placeholder="patient01"
                {...register('username', { required: 'Vui lòng nhập tên đăng nhập' })}
              />
              {errors.username && <div className={styles.error}>{errors.username.message}</div>}
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Mật khẩu</label>
              <input
                className={styles.input}
                type="password"
                placeholder="••••••"
                {...register('password', { required: 'Vui lòng nhập mật khẩu' })}
              />
              {errors.password && <div className={styles.error}>{errors.password.message}</div>}
            </div>
            <Link to="/forgot-password" className={styles.forgotLink}>Quên mật khẩu?</Link>
            <button className={styles.btnSubmit} type="submit" disabled={loading}>
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>
          <div className={styles.footer}>
            Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
          </div>
          <div className={styles.demoAccounts}>
            <h4>Lưu ý đăng nhập:</h4>
            <p>Dùng <strong>username</strong> thay vì email.</p>
            <p>Nếu tài khoản cũ đăng nhập không được, hãy đăng ký tài khoản mới để kiểm tra.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
