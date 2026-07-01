"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, UserRole } from "@/core/entities/User";

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  // For dummy initialization (mock persisted session)
  useEffect(() => {
    const stored = localStorage.getItem("mock_auth_user");
    if (stored) {
      try {
        const parsedUser = JSON.parse(stored);
        setTimeout(() => {
          setUser(parsedUser);
        }, 0);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const login = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem("mock_auth_user", JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("mock_auth_user");
  };

  const updateProfile = (updates: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updates, updatedAt: new Date() };
    setUser(updated);
    localStorage.setItem("mock_auth_user", JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Expose dummy data
export const DUMMY_USERS: Record<string, User> = {
  [UserRole.PATIENT]: {
    id: "pat-123",
    firebaseUid: "f-pat-123",
    email: "patient@medixai.com",
    name: "John Doe (Patient)",
    role: UserRole.PATIENT,
    hospitalId: "hosp-1",
    medicalRecordNumber: "MRN-998877",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  [UserRole.DOCTOR]: {
    id: "doc-456",
    firebaseUid: "f-doc-456",
    email: "doctor@medixai.com",
    name: "Dr. Sarah Smith",
    role: UserRole.DOCTOR,
    hospitalId: "hosp-1",
    specialization: "Cardiology",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  [UserRole.PHARMACY]: {
    id: "phar-789",
    firebaseUid: "f-phar-789",
    email: "pharmacy@medixai.com",
    name: "Rx Pharmacy",
    role: UserRole.PHARMACY,
    hospitalId: "hosp-1",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  [UserRole.ADMIN]: {
    id: "adm-000",
    firebaseUid: "f-adm-000",
    email: "admin@medixai.com",
    name: "System Admin",
    role: UserRole.ADMIN,
    hospitalId: "hosp-1",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
};
