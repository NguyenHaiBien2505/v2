import { create } from 'zustand';
import axios from 'axios';
import axiosInstance from '../services/axiosInstance';

export type UserRole = 'PATIENT' | 'DOCTOR' | 'ADMIN';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  status: 'ACTIVE' | 'INACTIVE';
  avatarUrl: string;
  createdAt: string;
}

interface BaseProfile {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
}

export interface PatientProfile extends BaseProfile {
  patientCode: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  bloodType?: string;
  allergies?: string;
  medicalHistory?: string;
  address?: string;
}

export interface DoctorProfile extends BaseProfile {
  degree: string;
  bio: string;
  experienceYears: number;
  clinicFee: number;
  avgRating: number;
  totalReviews: number;
  licenseNumber: string;
  specialtyId: number;
  specialtyName: string;
  certificates?: { id: number; name: string; issuedBy: string; issuedYear: number; imageUrl?: string }[];
}

export interface AdminProfile extends BaseProfile {
  department?: string;
}

export type ProfileData = PatientProfile | DoctorProfile | AdminProfile;
export type LoginErrorCode = 'NONE' | 'INVALID_CREDENTIALS' | 'NETWORK_OR_CORS' | 'UNKNOWN';

export const isPatientProfile = (p: ProfileData): p is PatientProfile => 'patientCode' in p;
export const isDoctorProfile = (p: ProfileData): p is DoctorProfile => 'licenseNumber' in p;
export const isAdminProfile = (p: ProfileData): p is AdminProfile => !isPatientProfile(p) && !isDoctorProfile(p);

interface AuthState {
  user: User | null;
  profile: ProfileData | null;
  isAuthenticated: boolean;
  lastLoginError: LoginErrorCode;
  login: (username: string, password: string) => Promise<boolean>;
  register: (data: {
    fullName: string;
    username: string;
    phone: string;
    password: string;
    dateOfBirth?: string;
  }) => Promise<boolean>;
  logout: () => void;
}

type ApiResponse<T> = {
  code: number;
  message?: string;
  result: T;
};

type RoleItem = {
  roleName?: string;
  id?: string;
};

type UserApi = {
  id: string;
  username: string;
  avatarUrl?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  createdAt?: string;
  roles?: RoleItem[];
};

const normalizeRole = (roles: RoleItem[] | undefined): UserRole => {
  const roleName = roles?.[0]?.roleName ?? roles?.[0]?.id ?? 'PATIENT';
  const plain = String(roleName).replace(/^ROLE_/, '');
  if (plain === 'ADMIN' || plain === 'DOCTOR' || plain === 'PATIENT') return plain;
  return 'PATIENT';
};

const mapUser = (raw: UserApi): User => ({
  id: raw.id,
  username: raw.username,
  role: normalizeRole(raw.roles),
  status: raw.status ?? 'ACTIVE',
  avatarUrl: raw.avatarUrl ?? '',
  createdAt: raw.createdAt ?? new Date().toISOString(),
});

const loadProfileForUser = async (user: User): Promise<ProfileData | null> => {
  if (user.role === 'PATIENT') {
    const { data } = await axiosInstance.get<ApiResponse<any>>(`/patients/user/${user.id}`);
    const p = data.result;
    return {
      id: p.id,
      userId: p.user?.id ?? user.id,
      patientCode: p.patientCode,
      fullName: p.fullName,
      phone: p.phone ?? '',
      dateOfBirth: p.dob,
      gender: p.gender,
      bloodType: p.bloodType,
      allergies: p.allergies,
      medicalHistory: p.medicalHistory,
      address: p.address,
    };
  }

  if (user.role === 'DOCTOR') {
    const { data } = await axiosInstance.get<ApiResponse<any>>(`/doctors/user/${user.id}`);
    const d = data.result;
    return {
      id: d.id,
      userId: d.user?.id ?? user.id,
      fullName: d.fullName,
      phone: d.phone ?? '',
      degree: d.degree ?? '',
      bio: d.bio ?? '',
      experienceYears: d.experienceYears ?? 0,
      clinicFee: Number(d.clinicFee ?? 0),
      avgRating: Number(d.averageRating ?? 0),
      totalReviews: Number(d.totalReviews ?? 0),
      licenseNumber: d.licenseNumber ?? '',
      specialtyId: Number(d.specialty?.id ?? 0),
      specialtyName: d.specialty?.name ?? '',
      certificates: [],
    };
  }

  return {
    id: user.id,
    userId: user.id,
    fullName: 'Administrator',
    phone: '',
    department: 'System',
  };
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  isAuthenticated: false,
  lastLoginError: 'NONE',

  login: async (username: string, password: string) => {
    try {
      set({ lastLoginError: 'NONE' });
      const { data } = await axiosInstance.post<ApiResponse<{ token: string; authenticated: boolean }>>('/auth/token-login', {
        username,
        password,
      });

      if (!data.result?.authenticated || !data.result?.token) {
        set({ lastLoginError: 'INVALID_CREDENTIALS' });
        return false;
      }

      localStorage.setItem('accessToken', data.result.token);

      const meResp = await axiosInstance.get<ApiResponse<UserApi>>('/users/my-info');
      const user = mapUser(meResp.data.result);
      const profile = await loadProfileForUser(user);

      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('profile', JSON.stringify(profile));
      set({ user, profile, isAuthenticated: true, lastLoginError: 'NONE' });
      return true;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          set({ lastLoginError: 'INVALID_CREDENTIALS' });
          return false;
        }

        if (!error.response) {
          set({ lastLoginError: 'NETWORK_OR_CORS' });
          return false;
        }
      }

      set({ lastLoginError: 'UNKNOWN' });
      return false;
    }
  },

  register: async (data) => {
    try {
      await axiosInstance.post<ApiResponse<any>>('/patients/register', {
        fullName: data.fullName,
        phone: data.phone,
        username: data.username,
        password: data.password,
        dob: data.dateOfBirth || null,
      });
      return await useAuthStore.getState().login(data.username, data.password);
    } catch {
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('profile');
    set({ user: null, profile: null, isAuthenticated: false });
  },
}));

const savedUser = localStorage.getItem('user');
const savedProfile = localStorage.getItem('profile');
if (savedUser) {
  try {
    const rawUser = JSON.parse(savedUser);
    // Backward compatibility for cached sessions saved before username migration.
    const user: User = rawUser.username
      ? rawUser
      : { ...rawUser, username: rawUser.email ?? '' };
    const profile = savedProfile ? JSON.parse(savedProfile) : null;
    useAuthStore.setState({ user, profile, isAuthenticated: true });
  } catch {
    // ignore invalid cached auth
  }
}
