import axiosInstance from '../services/axiosInstance';

export const formatPatientCode = (id: number | string) => String(id).padStart(8, '0');

export interface Specialty {
  id: number;
  name: string;
  description: string;
  iconUrl: string;
  isActive: boolean;
}

export interface DoctorCertificate {
  id: number;
  doctorId: number | string;
  name: string;
  issuedBy: string;
  issuedYear: number;
  imageUrl?: string;
}

export interface Doctor {
  id: number | string;
  userId: number | string;
  fullName: string;
  avatarUrl: string;
  specialty: Specialty;
  bio: string;
  experienceYears: number;
  degree: string;
  clinicFee: number;
  avgRating: number;
  totalReviews: number;
  licenseNumber: string;
  certificates?: DoctorCertificate[];
}

export interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  specialtyId?: number;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export type AppointmentType = 'FIRST_VISIT' | 'REVISIT';

export interface Appointment {
  id: number;
  patientId: number | string;
  patientCode?: string;
  doctorId: number | string;
  doctorName: string;
  doctorAvatar: string;
  specialtyName: string;
  serviceName: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  reason: string;
  notes?: string;
  queueNumber?: number;
  appointmentType: AppointmentType;
}

export interface Review {
  id: number;
  patientName: string;
  patientAvatar: string;
  rating: number;
  comment: string;
  createdAt: string;
  doctorName?: string;
}

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  thumbnailUrl: string;
  category: string;
  tags: string[];
  isPublished: boolean;
  publishedAt?: string;
  viewCount: number;
  createdAt: string;
  authorName: string;
}

export interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface PrescriptionItem {
  drugName: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  note?: string;
}

export interface MedicalRecord {
  id: number;
  appointmentId: number;
  patientId: number | string;
  patientCode?: string;
  doctorId: number | string;
  doctorName: string;
  doctorAvatar: string;
  specialtyName: string;
  visitDate: string;
  symptoms: string;
  diagnosis: string;
  icdCode?: string;
  treatmentPlan: string;
  doctorNote: string;
  vitals: {
    bloodPressure: string;
    heartRate: string;
    temperature: string;
    weight: string;
  };
  prescription: PrescriptionItem[];
  attachments: { name: string; url: string }[];
  followUpDate?: string;
}

export interface TreatmentMilestone {
  id: number;
  date: string;
  title: string;
  description: string;
  status: 'DONE' | 'IN_PROGRESS' | 'UPCOMING';
  doctorName?: string;
}

export interface TreatmentPlan {
  id: number;
  patientId: number | string;
  title: string;
  doctorName: string;
  specialtyName: string;
  startDate: string;
  expectedEndDate: string;
  status: 'ACTIVE' | 'COMPLETED' | 'PAUSED';
  progressPercent: number;
  description: string;
  milestones: TreatmentMilestone[];
}

export interface Banner {
  id: number;
  title?: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: number;
  userId?: number;
  userName?: string;
  action: string;
  entity?: string;
  entityId?: number;
  oldValue?: unknown;
  newValue?: unknown;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface RefreshToken {
  id: number;
  userId: number;
  userName: string;
  token: string;
  deviceInfo: string;
  expiresAt: string;
  revoked: boolean;
  createdAt: string;
}

export type SettingValueType = 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON';

export interface Setting {
  key: string;
  value: string;
  valueType: SettingValueType;
  description?: string;
  updatedAt: string;
}

type ApiResponse<T> = {
  code: number;
  message?: string;
  result: T;
};

type PageResponse<T> = {
  content: T[];
};

const safeApi = async <T>(action: () => Promise<T>, fallback: T): Promise<T> => {
  try {
    return await action();
  } catch {
    return fallback;
  }
};

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');

const parsePrice = (value?: string | number): number => {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  const normalized = String(value).replace(/[^\d.]/g, '');
  return Number(normalized || 0);
};

const mapSpecialty = (s: any): Specialty => ({
  id: Number(s.id),
  name: s.name ?? '',
  description: s.description ?? '',
  iconUrl: s.icon ?? '',
  isActive: true,
});

const mapDoctor = (d: any): Doctor => ({
  id: d.id,
  userId: d.user?.id ?? d.id,
  fullName: d.fullName ?? '',
  avatarUrl: d.avatarUrl ?? '',
  specialty: mapSpecialty(d.specialty ?? {}),
  bio: d.bio ?? '',
  experienceYears: Number(d.experienceYears ?? 0),
  degree: d.degree ?? '',
  clinicFee: Number(d.clinicFee ?? 0),
  avgRating: Number(d.averageRating ?? 0),
  totalReviews: Number(d.totalReviews ?? 0),
  licenseNumber: d.licenseNumber ?? '',
  certificates: [],
});

const mapNews = (n: any): BlogPost => ({
  id: Number(n.id),
  title: n.title ?? '',
  slug: toSlug(n.title ?? `news-${n.id}`),
  excerpt: n.excerpt ?? '',
  content: n.content ?? '',
  thumbnailUrl: n.image ?? '',
  category: n.category ?? 'Sức khỏe',
  tags: [],
  isPublished: true,
  publishedAt: n.publishedAt ?? '',
  viewCount: Number(n.views ?? 0),
  createdAt: n.publishedAt ? new Date(n.publishedAt).toLocaleDateString('vi-VN') : '',
  authorName: n.author ?? 'Kim Quy',
});

const mapBanner = (b: any): Banner => ({
  id: Number(b.id),
  title: b.title ?? '',
  subtitle: b.subtitle ?? '',
  imageUrl: b.imageUrl ?? '',
  linkUrl: b.linkUrl ?? '',
  sortOrder: Number(b.sortOrder ?? 0),
  isActive: Boolean(b.isActive),
  createdAt: b.createdAt ? new Date(b.createdAt).toLocaleDateString('vi-VN') : '',
});

const mapService = (s: any): Service => ({
  id: Number(s.id),
  name: s.name ?? '',
  description: s.description ?? '',
  price: parsePrice(s.price),
  durationMinutes: 30,
});

const loadSpecialties = async (): Promise<Specialty[]> => {
  return safeApi(async () => {
    const { data } = await axiosInstance.get<ApiResponse<any[]>>('/specialties/list');
    return (data.result ?? []).map(mapSpecialty);
  }, []);
};

const loadDoctors = async (): Promise<Doctor[]> => {
  return safeApi(async () => {
    const { data } = await axiosInstance.get<ApiResponse<PageResponse<any>>>('/doctors?page=0&size=100');
    return (data.result?.content ?? []).map(mapDoctor);
  }, []);
};

const loadBlogPosts = async (): Promise<BlogPost[]> => {
  return safeApi(async () => {
    const { data } = await axiosInstance.get<ApiResponse<PageResponse<any>>>('/news?page=0&size=20');
    return (data.result?.content ?? []).map(mapNews);
  }, []);
};

const loadBanners = async (): Promise<Banner[]> => {
  return safeApi(async () => {
    const { data } = await axiosInstance.get<ApiResponse<any[]>>('/banners');
    return (data.result ?? []).map(mapBanner).sort((a, b) => a.sortOrder - b.sortOrder);
  }, []);
};

const loadServices = async (): Promise<Service[]> => {
  return safeApi(async () => {
    const { data } = await axiosInstance.get<ApiResponse<PageResponse<any>>>('/medical-services?page=0&size=100');
    return (data.result?.content ?? []).map(mapService);
  }, []);
};

const loadReviewsFromDoctors = (items: Doctor[]): Review[] => {
  return items.flatMap((doc) => {
    const set = (doc as any).reviews ?? [];
    return Array.from(set).map((r: any) => ({
      id: Number(r.id),
      patientName: r.patientName ?? 'Ẩn danh',
      patientAvatar: r.patientAvatar ?? '',
      rating: Number(r.rating ?? 0),
      comment: r.comment ?? '',
      createdAt: new Date().toLocaleDateString('vi-VN'),
      doctorName: r.doctorName ?? doc.fullName,
    }));
  });
};

const loadedSpecialties = await loadSpecialties();
const loadedDoctors = await loadDoctors();
const loadedBlogPosts = await loadBlogPosts();
const loadedBanners = await loadBanners();
const loadedServices = await loadServices();

export const specialties: Specialty[] = loadedSpecialties;
export const doctors: Doctor[] = loadedDoctors;
export const blogPosts: BlogPost[] = loadedBlogPosts;
export const banners: Banner[] = loadedBanners;
export const services: Service[] = loadedServices;
export const reviews: Review[] = loadReviewsFromDoctors(loadedDoctors);

export const appointments: Appointment[] = [];
export const notifications: Notification[] = [];
export const medicalRecords: MedicalRecord[] = [];
export const treatmentPlans: TreatmentPlan[] = [];
export const auditLogs: AuditLog[] = [];
export const refreshTokens: RefreshToken[] = [];
export const defaultSettings: Setting[] = [];

export const generateTimeSlots = (_date: string): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const startHour = 7;
  const endHour = 17;

  for (let hour = startHour; hour < endHour; hour += 1) {
    for (const minute of [0, 30]) {
      const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      slots.push({ time, available: Math.random() > 0.3 });
    }
  }

  return slots;
};
