import axiosInstance from './axiosInstance';
import type { Appointment, Banner, BlogPost, MedicalRecord, Notification, Review } from '../data/mockData';

export type AdminUserRow = {
  id: string;
  username: string;
  avatarUrl: string;
  role: 'PATIENT' | 'DOCTOR' | 'ADMIN';
  roles: string[];
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
};

export type AdminDoctorRow = {
  id: string;
  fullName: string;
  username: string;
  degree: string;
  avatarUrl: string;
  bio: string;
  experienceYears: number;
  clinicFee: number;
  licenseNumber: string;
  phone: string;
  specialtyId: number;
  specialtyName: string;
  averageRating: number;
  totalReviews: number;
};

export type ApiResponse<T> = {
  code: number;
  message?: string;
  result: T;
};

export type PageResponse<T> = {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
};

type AppointmentApi = {
  id: number;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: string;
  reason?: string;
  notes?: string;
  queueNumber?: number;
  appointmentType?: string;
  patientId: string;
  patientName?: string;
  patientAvatar?: string;
  doctorId: string;
  doctorName?: string;
  doctorAvatar?: string;
};

type MedicalRecordApi = {
  id: number;
  title?: string;
  date?: string;
  status?: string;
  diagnosis?: string;
  notes?: string;
  patientId: string;
  patientName?: string;
  doctorId: string;
  doctorName?: string;
  appointmentId?: number;
};

type ReviewApi = {
  id: number;
  rating: number;
  comment: string;
  patientName?: string;
  patientAvatar?: string;
  doctorName?: string;
};

type NotificationApi = {
  id: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

type AdminUserApi = {
  id: string;
  username: string;
  avatarUrl?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  createdAt?: string;
  roles?: Array<{ roleName?: string; id?: string }>;
};

type AdminDoctorApi = {
  id: string;
  fullName?: string;
  degree?: string;
  avatarUrl?: string;
  bio?: string;
  experienceYears?: number;
  clinicFee?: number | string;
  licenseNumber?: string;
  phone?: string;
  user?: {
    id?: string;
    username?: string;
    avatarUrl?: string;
  };
  specialty?: {
    id?: number;
    name?: string;
  };
  averageRating?: number;
  totalReviews?: number;
};

type BannerApi = {
  id: number;
  title?: string;
  subtitle?: string;
  imageUrl?: string;
  linkUrl?: string;
  sortOrder?: number;
  isActive?: boolean;
  createdAt?: string;
};

type NewsApi = {
  id: number;
  title?: string;
  excerpt?: string;
  content?: string;
  image?: string;
  category?: string;
  author?: string;
  authorImage?: string;
  publishedAt?: string;
  views?: number;
  featured?: boolean;
};

const mapAdminUser = (u: AdminUserApi): AdminUserRow => {
  const roleNames = (u.roles ?? []).map((r) => String(r.roleName ?? r.id ?? '').replace(/^ROLE_/, ''));
  const role: AdminUserRow['role'] = roleNames.includes('ADMIN')
    ? 'ADMIN'
    : roleNames.includes('DOCTOR')
      ? 'DOCTOR'
      : 'PATIENT';

  return {
    id: u.id,
    username: u.username ?? '',
    avatarUrl: u.avatarUrl ?? '',
    role,
    roles: roleNames,
    status: u.status ?? 'ACTIVE',
    createdAt: u.createdAt ? formatDate(u.createdAt) : '',
  };
};

const mapAdminDoctor = (d: AdminDoctorApi): AdminDoctorRow => ({
  id: d.id,
  fullName: d.fullName ?? '',
  username: d.user?.username ?? '',
  degree: d.degree ?? '',
  avatarUrl: d.avatarUrl ?? d.user?.avatarUrl ?? '',
  bio: d.bio ?? '',
  experienceYears: d.experienceYears ?? 0,
  clinicFee: Number(d.clinicFee ?? 0),
  licenseNumber: d.licenseNumber ?? '',
  phone: d.phone ?? '',
  specialtyId: d.specialty?.id ?? 0,
  specialtyName: d.specialty?.name ?? '',
  averageRating: Number(d.averageRating ?? 0),
  totalReviews: Number(d.totalReviews ?? 0),
});

const mapBanner = (b: BannerApi): Banner => ({
  id: b.id,
  title: b.title ?? '',
  subtitle: b.subtitle ?? '',
  imageUrl: b.imageUrl ?? '',
  linkUrl: b.linkUrl ?? '',
  sortOrder: Number(b.sortOrder ?? 0),
  isActive: Boolean(b.isActive),
  createdAt: b.createdAt ? formatDate(b.createdAt) : '',
});

const slugify = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const mapNews = (n: NewsApi): BlogPost => {
  const created = n.publishedAt ? formatDate(n.publishedAt) : formatDate(new Date().toISOString());
  const title = n.title ?? '';
  return {
    id: n.id,
    title,
    slug: slugify(title),
    excerpt: n.excerpt ?? '',
    content: n.content ?? '',
    thumbnailUrl: n.image ?? '',
    category: n.category ?? 'Tin tuc',
    tags: [],
    isPublished: true,
    publishedAt: n.publishedAt ? formatDate(n.publishedAt) : undefined,
    viewCount: Number(n.views ?? 0),
    createdAt: created,
    authorName: n.author ?? 'Admin',
  };
};

const formatDate = (value?: string): string => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toISOString().slice(0, 10);
};

const mapAppointment = (a: AppointmentApi): Appointment => ({
  id: a.id,
  patientId: a.patientId,
  patientCode: a.patientName,
  doctorId: a.doctorId,
  doctorName: a.doctorName ?? 'Bac si',
  doctorAvatar: a.doctorAvatar ?? '',
  specialtyName: 'Tong quat',
  serviceName: 'Kham benh',
  appointmentDate: formatDate(a.appointmentDate),
  startTime: a.startTime?.slice(0, 5) ?? '',
  endTime: a.endTime?.slice(0, 5) ?? '',
  status: (a.status as Appointment['status']) ?? 'PENDING',
  reason: a.reason ?? '',
  notes: a.notes,
  queueNumber: a.queueNumber,
  appointmentType: (a.appointmentType as Appointment['appointmentType']) ?? 'FIRST_VISIT',
});

const mapMedicalRecord = (r: MedicalRecordApi): MedicalRecord => ({
  id: r.id,
  appointmentId: r.appointmentId ?? 0,
  patientId: r.patientId,
  patientCode: r.patientName,
  doctorId: r.doctorId,
  doctorName: r.doctorName ?? 'Bac si',
  doctorAvatar: '',
  specialtyName: r.title ?? 'Ho so kham',
  visitDate: formatDate(r.date),
  symptoms: '',
  diagnosis: r.diagnosis ?? '',
  treatmentPlan: r.notes ?? '',
  doctorNote: r.notes ?? '',
  vitals: {
    bloodPressure: '-',
    heartRate: '-',
    temperature: '-',
    weight: '-',
  },
  prescription: [],
  attachments: [],
});

const mapReview = (r: ReviewApi): Review => ({
  id: r.id,
  patientName: r.patientName ?? 'Benh nhan',
  patientAvatar: r.patientAvatar ?? '',
  rating: r.rating,
  comment: r.comment,
  createdAt: new Date().toLocaleDateString('vi-VN'),
  doctorName: r.doctorName,
});

const mapNotification = (n: NotificationApi): Notification => ({
  id: n.id,
  type: n.type,
  title: n.title,
  message: n.message,
  isRead: n.isRead,
  createdAt: n.createdAt,
});

export const getPatientAppointments = async (patientId: string): Promise<Appointment[]> => {
  const { data } = await axiosInstance.get<ApiResponse<PageResponse<AppointmentApi>>>(`/appointments/patients/${patientId}?size=200`);
  return (data.result?.content ?? []).map(mapAppointment);
};

export const getDoctorAppointments = async (doctorId: string): Promise<Appointment[]> => {
  const { data } = await axiosInstance.get<ApiResponse<PageResponse<AppointmentApi>>>(`/appointments/doctors/${doctorId}?size=200`);
  return (data.result?.content ?? []).map(mapAppointment);
};

export const getAppointment = async (id: number): Promise<Appointment> => {
  const { data } = await axiosInstance.get<ApiResponse<AppointmentApi>>(`/appointments/${id}`);
  return mapAppointment(data.result);
};

export const createAppointment = async (patientId: string, doctorId: string, payload: {
  appointmentDate: string;
  startTime: string;
  reason: string;
  appointmentType: 'FIRST_VISIT' | 'REVISIT';
}): Promise<Appointment> => {
  const { data } = await axiosInstance.post<ApiResponse<AppointmentApi>>(
    `/appointments/patients/${patientId}/doctors/${doctorId}`,
    payload
  );
  return mapAppointment(data.result);
};

export const updateAppointmentStatus = async (id: number, status: Appointment['status']): Promise<Appointment> => {
  const { data } = await axiosInstance.patch<ApiResponse<AppointmentApi>>(`/appointments/${id}/status?status=${status}`);
  return mapAppointment(data.result);
};

export const cancelAppointment = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/appointments/${id}`);
};

export const getPatientMedicalRecords = async (patientId: string): Promise<MedicalRecord[]> => {
  const { data } = await axiosInstance.get<ApiResponse<PageResponse<MedicalRecordApi>>>(`/medical-records/patients/${patientId}?size=200`);
  return (data.result?.content ?? []).map(mapMedicalRecord);
};

export const getDoctorMedicalRecords = async (doctorId: string): Promise<MedicalRecord[]> => {
  const { data } = await axiosInstance.get<ApiResponse<PageResponse<MedicalRecordApi>>>(`/medical-records/doctors/${doctorId}?size=200`);
  return (data.result?.content ?? []).map(mapMedicalRecord);
};

export const getMedicalRecord = async (id: number): Promise<MedicalRecord> => {
  const { data } = await axiosInstance.get<ApiResponse<MedicalRecordApi>>(`/medical-records/${id}`);
  return mapMedicalRecord(data.result);
};

export const createMedicalRecord = async (payload: {
  title: string;
  date: string;
  status: string;
  diagnosis: string;
  notes: string;
  patientId: string;
  doctorId: string;
  appointmentId: number;
}) => {
  await axiosInstance.post('/medical-records', payload);
};

export const getPatientNotifications = async (patientId: string): Promise<Notification[]> => {
  const { data } = await axiosInstance.get<ApiResponse<PageResponse<NotificationApi>>>(`/notifications/patients/${patientId}?size=200`);
  return (data.result?.content ?? []).map(mapNotification);
};

export const countUnreadNotifications = async (patientId: string): Promise<number> => {
  const { data } = await axiosInstance.get<ApiResponse<number>>(`/notifications/patients/${patientId}/count-unread`);
  return Number(data.result ?? 0);
};

export const markNotificationRead = async (id: number): Promise<void> => {
  await axiosInstance.patch(`/notifications/${id}/read`);
};

export const markAllNotificationsRead = async (patientId: string): Promise<void> => {
  await axiosInstance.patch(`/notifications/patients/${patientId}/read-all`);
};

export const getPatientReviews = async (patientId: string): Promise<Review[]> => {
  const { data } = await axiosInstance.get<ApiResponse<PageResponse<ReviewApi>>>(`/reviews/patients/${patientId}?size=200`);
  return (data.result?.content ?? []).map(mapReview);
};

export const getDoctorReviews = async (doctorId: string): Promise<Review[]> => {
  const { data } = await axiosInstance.get<ApiResponse<PageResponse<ReviewApi>>>(`/reviews/doctors/${doctorId}?size=200`);
  return (data.result?.content ?? []).map(mapReview);
};

export const getAdminReviewsAggregate = async (): Promise<Review[]> => {
  const doctors = await getAdminDoctors();
  const reviewGroups = await Promise.all(doctors.map((doctor) => getDoctorReviews(doctor.id).catch(() => [])));
  return reviewGroups.flat();
};

export const deleteReview = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/reviews/${id}`);
};

export const getAdminAppointmentsAggregate = async (): Promise<Appointment[]> => {
  const doctorsResp = await axiosInstance.get<ApiResponse<PageResponse<{ id: string }>>>(`/doctors?page=0&size=200`);
  const doctorIds = (doctorsResp.data.result?.content ?? []).map((d) => d.id);
  const responses = await Promise.all(
    doctorIds.map((doctorId) =>
      axiosInstance
        .get<ApiResponse<PageResponse<AppointmentApi>>>(`/appointments/doctors/${doctorId}?size=200`)
        .then((res) => res.data.result?.content ?? [])
        .catch(() => [])
    )
  );

  const merged = responses.flat().map(mapAppointment);
  const byId = new Map<number, Appointment>();
  merged.forEach((item) => {
    byId.set(item.id, item);
  });

  return Array.from(byId.values()).sort((a, b) => {
    const ad = `${a.appointmentDate}T${a.startTime}`;
    const bd = `${b.appointmentDate}T${b.startTime}`;
    return bd.localeCompare(ad);
  });
};

export const getAdminUsers = async (): Promise<AdminUserRow[]> => {
  const { data } = await axiosInstance.get<ApiResponse<PageResponse<AdminUserApi>>>(`/users?page=0&size=200`);
  return (data.result?.content ?? []).map(mapAdminUser);
};

export const createAdminUser = async (payload: {
  username: string;
  password: string;
  avatarUrl?: string;
  roles?: string[];
}): Promise<AdminUserRow> => {
  const { data } = await axiosInstance.post<ApiResponse<AdminUserApi>>('/users', payload);
  return mapAdminUser(data.result);
};

export const updateAdminUser = async (
  id: string,
  payload: {
    password?: string;
    avatarUrl?: string;
    status?: 'ACTIVE' | 'INACTIVE';
    roles?: string[];
  }
): Promise<AdminUserRow> => {
  const { data } = await axiosInstance.put<ApiResponse<AdminUserApi>>(`/users/${id}`, payload);
  return mapAdminUser(data.result);
};

export const deleteAdminUser = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/users/${id}`);
};

export const getAdminDoctors = async (): Promise<AdminDoctorRow[]> => {
  const { data } = await axiosInstance.get<ApiResponse<PageResponse<AdminDoctorApi>>>(`/doctors?page=0&size=200`);
  return (data.result?.content ?? []).map(mapAdminDoctor);
};

export const createAdminDoctor = async (payload: {
  fullName: string;
  username: string;
  password: string;
  degree: string;
  avatarUrl?: string;
  bio: string;
  experienceYears: number;
  clinicFee: number;
  licenseNumber: string;
  phone: string;
  specialtyId: number;
}): Promise<AdminDoctorRow> => {
  const { data } = await axiosInstance.post<ApiResponse<AdminDoctorApi>>('/doctors', payload);
  return mapAdminDoctor(data.result);
};

export const updateAdminDoctor = async (
  id: string,
  payload: {
    fullName: string;
    degree: string;
    avatarUrl?: string;
    bio: string;
    experienceYears: number;
    clinicFee: number;
    licenseNumber: string;
    phone: string;
    specialtyId: number;
  }
): Promise<AdminDoctorRow> => {
  const { data } = await axiosInstance.put<ApiResponse<AdminDoctorApi>>(`/doctors/${id}`, payload);
  return mapAdminDoctor(data.result);
};

export const deleteAdminDoctor = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/doctors/${id}`);
};

export const getAdminBanners = async (): Promise<Banner[]> => {
  const { data } = await axiosInstance.get<ApiResponse<PageResponse<BannerApi>>>(`/banners?page=0&size=200`);
  return (data.result?.content ?? []).map(mapBanner);
};

export const createAdminBanner = async (payload: {
  title: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl?: string;
  sortOrder: number;
  isActive: boolean;
}): Promise<Banner> => {
  const { data } = await axiosInstance.post<ApiResponse<BannerApi>>('/banners', payload);
  return mapBanner(data.result);
};

export const updateAdminBanner = async (
  id: number,
  payload: {
    title: string;
    subtitle?: string;
    imageUrl: string;
    linkUrl?: string;
    sortOrder: number;
    isActive: boolean;
  }
): Promise<Banner> => {
  const { data } = await axiosInstance.put<ApiResponse<BannerApi>>(`/banners/${id}`, payload);
  return mapBanner(data.result);
};

export const deleteAdminBanner = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/banners/${id}`);
};

export const getAdminNews = async (): Promise<BlogPost[]> => {
  const { data } = await axiosInstance.get<ApiResponse<PageResponse<NewsApi>>>(`/news?page=0&size=200`);
  return (data.result?.content ?? []).map(mapNews);
};

export const createAdminNews = async (payload: {
  title: string;
  excerpt?: string;
  content: string;
  thumbnailUrl?: string;
  category?: string;
  authorName?: string;
  publishedAt?: string;
  featured?: boolean;
}): Promise<BlogPost> => {
  const { data } = await axiosInstance.post<ApiResponse<NewsApi>>('/news', {
    title: payload.title,
    excerpt: payload.excerpt,
    content: payload.content,
    image: payload.thumbnailUrl,
    category: payload.category,
    author: payload.authorName,
    publishedAt: payload.publishedAt,
    featured: payload.featured,
  });
  return mapNews(data.result);
};

export const updateAdminNews = async (
  id: number,
  payload: {
    title: string;
    excerpt?: string;
    content: string;
    thumbnailUrl?: string;
    category?: string;
    authorName?: string;
    publishedAt?: string;
    featured?: boolean;
  }
): Promise<BlogPost> => {
  const { data } = await axiosInstance.put<ApiResponse<NewsApi>>(`/news/${id}`, {
    title: payload.title,
    excerpt: payload.excerpt,
    content: payload.content,
    image: payload.thumbnailUrl,
    category: payload.category,
    author: payload.authorName,
    publishedAt: payload.publishedAt,
    featured: payload.featured,
  });
  return mapNews(data.result);
};

export const deleteAdminNews = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/news/${id}`);
};

// Specialties
type SpecialtyApi = {
  id: number;
  name: string;
  icon?: string;
  description?: string;
  isActive?: boolean;
};

export const getAllSpecialties = async (): Promise<SpecialtyApi[]> => {
  const { data } = await axiosInstance.get<ApiResponse<PageResponse<SpecialtyApi>>>(`/specialties?page=0&size=200`);
  return data.result?.content ?? [];
};

export const createSpecialty = async (payload: { name: string; icon?: string; description?: string }) => {
  const { data } = await axiosInstance.post<ApiResponse<SpecialtyApi>>('/specialties', payload);
  return data.result;
};

export const updateSpecialty = async (id: number, payload: { name: string; icon?: string; description?: string }) => {
  const { data } = await axiosInstance.put<ApiResponse<SpecialtyApi>>(`/specialties/${id}`, payload);
  return data.result;
};

export const deleteSpecialty = async (id: number) => {
  await axiosInstance.delete(`/specialties/${id}`);
};

// Medical services
type MedicalServiceApi = {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  category?: string;
  price?: string;
  image?: string;
};

export const getAllMedicalServices = async (): Promise<MedicalServiceApi[]> => {
  const { data } = await axiosInstance.get<ApiResponse<PageResponse<MedicalServiceApi>>>(`/medical-services?page=0&size=200`);
  return data.result?.content ?? [];
};

export const createMedicalServiceApi = async (payload: { name: string; description?: string; icon?: string; category?: string; price?: string; image?: string }) => {
  const { data } = await axiosInstance.post<ApiResponse<MedicalServiceApi>>('/medical-services', payload);
  return data.result;
};

export const updateMedicalServiceApi = async (id: number, payload: { name: string; description?: string; icon?: string; category?: string; price?: string; image?: string }) => {
  const { data } = await axiosInstance.put<ApiResponse<MedicalServiceApi>>(`/medical-services/${id}`, payload);
  return data.result;
};

export const deleteMedicalServiceApi = async (id: number) => {
  await axiosInstance.delete(`/medical-services/${id}`);
};
