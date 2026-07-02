import { UserRole } from '../core/entities/User';

export interface DummyAccount {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  specialization?: string;
}

export const DUMMY_ACCOUNTS: DummyAccount[] = [
  {
    email: 'pasien.goklinik.platform.idn@gmail.com',
    password: 'GoKlinik2026!',
    name: 'Pasien GoKlinik',
    role: UserRole.PATIENT,
  },
  {
    email: 'farmasi.goklinik.platform.idn@gmail.com',
    password: 'GoKlinik2026!',
    name: 'Farmasi GoKlinik',
    role: UserRole.PHARMACY,
  },
  {
    email: 'dokter.goklinik.platform.idn@gmail.com',
    password: 'GoKlinik2026!',
    name: 'Dr. GoKlinik',
    role: UserRole.DOCTOR,
    specialization: 'General Practice',
  },
  {
    email: 'admin.goklinik.platform.idn@gmail.com',
    password: 'GoKlinik2026!',
    name: 'Admin GoKlinik',
    role: UserRole.ADMIN,
  },
];

export const DEFAULT_PASSWORD = 'GoKlinik2026!';
