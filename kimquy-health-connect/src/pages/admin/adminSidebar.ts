import { FiCalendar, FiUsers, FiUserPlus, FiSettings, FiFileText, FiStar, FiBarChart2, FiGrid, FiActivity, FiClipboard, FiBell, FiImage, FiShield } from 'react-icons/fi';
import type { SidebarSection } from '../../components/layout/DashboardLayout';

export const adminSidebar: SidebarSection[] = [
  { label: 'Tổng quan', items: [
    { path: '/admin/dashboard', label: 'Dashboard', icon: FiGrid },
  ]},
  { label: 'Quản lý', items: [
    { path: '/admin/users', label: 'Tài khoản', icon: FiUsers },
    { path: '/admin/doctors', label: 'Bác sĩ', icon: FiUserPlus },
    { path: '/admin/appointments', label: 'Lịch hẹn', icon: FiCalendar },
    { path: '/admin/specialties', label: 'Chuyên khoa', icon: FiActivity },
    { path: '/admin/services', label: 'Dịch vụ', icon: FiClipboard },
  ]},
  { label: 'Nội dung', items: [
    { path: '/admin/content', label: 'Bài viết', icon: FiFileText },
    { path: '/admin/banners', label: 'Banner', icon: FiImage },
    { path: '/admin/reviews', label: 'Đánh giá', icon: FiStar },
  ]},
  { label: 'Hệ thống', items: [
    { path: '/admin/notifications', label: 'Thông báo Email/SMS', icon: FiBell },
    { path: '/admin/audit-logs', label: 'Nhật ký hệ thống', icon: FiShield },
    { path: '/admin/settings', label: 'Cấu hình', icon: FiSettings },
    { path: '/admin/reports', label: 'Báo cáo', icon: FiBarChart2 },
  ]},
];
