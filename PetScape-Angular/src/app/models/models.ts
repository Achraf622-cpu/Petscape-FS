// ── Auth ──────────────────────────────────────────────────────────────────
export interface AuthResponse {
  token: string;
  refreshToken: string;
  email: string;
  firstname: string;
  lastname: string;
  role: 'USER' | 'ADMIN';
  emailVerified?: boolean;
  /** User id from backend; used e.g. for report ownership checks */
  id?: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  passwordConfirmation: string;
}

// ── User ──────────────────────────────────────────────────────────────────
export interface UserResponse {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  role: 'USER' | 'ADMIN';
  emailVerified: boolean;
  banned?: boolean;
  banReason?: string;
  banComment?: string;
  bannedAt?: string;
  bannedUntil?: string;
  createdAt: string;
}

// ── Animal ────────────────────────────────────────────────────────────────
export interface AnimalResponse {
  id: number;
  name: string;
  breed: string;
  age: number;
  gender: 'MALE' | 'FEMALE';
  description: string;
  status: 'AVAILABLE' | 'RESERVED' | 'ADOPTED';
  images: string[];
  speciesId: number;
  speciesName: string;
  createdAt: string;
  updatedAt: string;
}

export interface AnimalRequest {
  name: string;
  breed: string;
  age: number;
  gender: string;
  description: string;
  speciesId: number;
}

// ── Species ───────────────────────────────────────────────────────────────
export interface SpeciesResponse {
  id: number;
  name: string;
  description: string;
}

// ── Adoption Request ──────────────────────────────────────────────────────
export interface AdoptionRequestResponse {
  id: number;
  userId: number;
  userFullName: string;
  animalId: number;
  animalName: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  message: string;
  createdAt: string;
}

// ── Appointment ───────────────────────────────────────────────────────────
export interface AppointmentResponse {
  id: number;
  userId: number;
  userFullName: string;
  animalId: number;
  animalName: string;
  dateTime: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  notes: string;
  createdAt: string;
}

// ── Animal Report ─────────────────────────────────────────────────────────
export interface AnimalReportResponse {
  id: number;
  userId: number;
  userFullName: string;
  /** Derived from isFound: 'LOST' when false, 'FOUND' when true. Optional — backend returns isFound, frontend can map this. */
  type?: 'LOST' | 'FOUND';
  speciesId: number;
  speciesName: string;
  name: string;
  breed: string;
  age: number;
  gender: string;
  description: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  /** Legacy alias — some components may use contactInfo */
  contactInfo?: string;
  image: string | null;
  dateReported: string;
  isFound: boolean;
  status: 'PENDING' | 'RESOLVED' | 'CANCELLED';
  createdAt: string;
}

// ── Notification ──────────────────────────────────────────────────────────
export interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

// ── Donation ──────────────────────────────────────────────────────────────
export interface DonationRequest {
  amount: number;
}

// ── Shared ────────────────────────────────────────────────────────────────
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number; // current page (0-indexed)
  size: number;
  first: boolean;
  last: boolean;
}

export interface ApiError {
  status: number;
  message: string;
  timestamp: string;
  errors?: Record<string, string>;
}
