import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../store/authStore.ts';
import { uploadAvatar } from '../services/healthApi.ts';
import { FiUpload } from 'react-icons/fi';
import Header from '../components/layout/Header';
import styles from './Auth.module.css';

interface RegisterForm {
  fullName: string;
  username: string;
  email: string;
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
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [error, setError] = useState('');

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);
    setError('');
    const ok = await registerFn({ 
      fullName: data.fullName, 
      username: data.username, 
      email: data.email, 
      phone: data.phone, 
      password: data.password, 
      dateOfBirth: data.dateOfBirth,
      avatarUrl: avatarUrl
    });
    setLoading(false);
    if (ok) {
      navigate('/patient/dashboard');
    } else {
      setError('Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.');
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const url = await uploadAvatar(file);
      setAvatarUrl(url);
    } catch (err) {
      setError('Không thể upload ảnh. Vui lòng thử lại.');
    } finally {
      setUploading(false);
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
            <div className={styles.formGroup} style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <div style={{ width: 100, height: 100, borderRadius: '50%', overflow: 'hidden', background: '#f0f2f5', border: '2px solid #e1e4e8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: 40, color: '#bcc0c4' }}>?</span>
                  )}
                </div>
                <label style={{ position: 'absolute', bottom: 0, right: 0, background: '#fff', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', cursor: 'pointer', border: '1px solid #ddd' }}>
                  <FiUpload size={16} color="#4b5563" />
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} disabled={uploading} />
                </label>
              </div>
              <div style={{ marginTop: 8, fontSize: 13, color: '#6b7280' }}>
                {uploading ? 'Đang tải lên...' : 'Ảnh đại diện (tùy chọn)'}
              </div>
            </div>

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
              <label className={styles.label}>Email</label>
              <input className={styles.input} type="email" placeholder="example@email.com" {...reg('email', { required: 'Vui lòng nhập email', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email không hợp lệ' } })} />
              {errors.email && <div className={styles.error}>{errors.email.message}</div>}
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
