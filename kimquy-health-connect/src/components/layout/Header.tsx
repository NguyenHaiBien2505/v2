import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiMenu, FiX, FiUser, FiCalendar, FiLogOut, FiSettings, FiGrid } from 'react-icons/fi';
import { FaHospitalAlt } from 'react-icons/fa';
import { useAuthStore } from '../../store/authStore';
import styles from './Header.module.css';

const Header = () => {
  const { user, profile, isAuthenticated, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Đóng dropdown khi click ngoài
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: '/', label: 'Trang chủ' },
    { path: '/doctors', label: 'Bác sĩ' },
    { path: '/services', label: 'Dịch vụ' },
    { path: '/blog', label: 'Tin tức' },
  ];

  const getDashboardPath = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'DOCTOR': return '/doctor/dashboard';
      case 'ADMIN': return '/admin/dashboard';
      default: return '/patient/dashboard';
    }
  };

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        {/* Logo */}
        <Link to="/" className={styles.logo}>
          <span className={styles.logoIcon}><FaHospitalAlt /></span>
          Kim Quy
        </Link>

        {/* Nav desktop */}
        <nav className={styles.nav}>
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`${styles.navLink} ${isActive(link.path) ? styles.navLinkActive : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className={styles.actions}>
          <button className={styles.btnBooking} onClick={() => navigate('/patient/booking')}>
            Đặt lịch khám
          </button>

          {isAuthenticated && user ? (
            <div className={styles.userMenu} ref={dropRef}>
              <button className={styles.userBtn} onClick={() => setDropdownOpen(!dropdownOpen)}>
                <span className={styles.userAvatar}>
                  {(profile?.fullName || user.username).charAt(0)}
                </span>
                <span>{profile?.fullName?.split(' ').pop() || user.username}</span>
              </button>
              {dropdownOpen && (
                <div className={styles.dropdown}>
                  <Link to={getDashboardPath()} className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                    <FiGrid /> Dashboard
                  </Link>
                  <Link to={`/${user.role.toLowerCase()}/profile`} className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                    <FiUser /> Hồ sơ cá nhân
                  </Link>
                  {user.role === 'PATIENT' && (
                    <Link to="/patient/appointments" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                      <FiCalendar /> Lịch hẹn của tôi
                    </Link>
                  )}
                  {user.role === 'ADMIN' && (
                    <Link to="/admin/settings" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                      <FiSettings /> Cấu hình
                    </Link>
                  )}
                  <div className={styles.dropdownDivider} />
                  <button className={`${styles.dropdownItem} ${styles.dropdownItemDanger}`} onClick={handleLogout}>
                    <FiLogOut /> Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button className={styles.btnLogin} onClick={() => navigate('/login')}>
              Đăng nhập
            </button>
          )}

          {/* Mobile menu toggle */}
          <button className={styles.mobileMenuBtn} onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className={styles.mobileNav}>
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`${styles.navLink} ${isActive(link.path) ? styles.navLinkActive : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
};

export default Header;
