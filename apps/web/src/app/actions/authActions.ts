'use server';

import { cookies } from 'next/headers';
import { adminAuth } from '../../infrastructure/firebase/firebaseAdmin';
import { MongoUserRepository } from '../../infrastructure/database/repositories/MongoUserRepository';
import { UserRole } from '../../core/entities/User';
import { SignJWT } from 'jose';

// Helper: serialize MongoDB documents for Next.js Server Action boundary
// (Date objects are NOT serializable across the wire)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serializeUser(user: any) {
  return JSON.parse(JSON.stringify(user));
}

export async function loginServerAction(idToken: string) {
  try {
    let firebaseUid = 'mock-uid-123';
    let email = 'dummy@goklinik.com';

    // 1. Verify the ID token using Firebase Admin SDK
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const decodedToken = await adminAuth.verifyIdToken(idToken);
      firebaseUid = decodedToken.uid;
      email = decodedToken.email || '';
    } else {
      console.warn('FIREBASE_SERVICE_ACCOUNT not set. Using mock Firebase user for Walking Skeleton.');
      // Simulate Firebase verify
      if (idToken.startsWith('dummy-token-')) {
        const role = idToken.replace('dummy-token-', '');
        firebaseUid = `mock-${role}-uid`;
        email = `${role}@goklinik.com`;
      }
    }

    // Resolve role from dummy token (e.g. 'dummy-token-DOCTOR' → 'DOCTOR')
    const tokenRole = idToken.startsWith('dummy-token-')
      ? (idToken.replace('dummy-token-', '') as UserRole)
      : UserRole.PATIENT;

    // 2. Lookup or create user in MongoDB
    const userRepository = new MongoUserRepository();
    let user = await userRepository.findByFirebaseUid(firebaseUid);
    
    if (!user) {
      user = await userRepository.create({
        firebaseUid,
        email,
        name: email.split('@')[0],
        role: tokenRole,
        hospitalId: 'default-hospital-id',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // 3. Set a session cookie via a custom JWT that includes the role
    const jwtSecret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-key-for-dev-only');
    const sessionJwt = await new SignJWT({ uid: user.id, role: user.role, firebaseUid: user.firebaseUid })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('5d')
      .sign(jwtSecret);

    const cookieStore = await cookies();
    cookieStore.set('session', sessionJwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 5, // 5 days
      path: '/',
    });

    return { success: true, user: serializeUser(user) };
  } catch (error) {
    console.error('Server Action Login Error:', error);
    return { success: false, error: 'Invalid token or server error' };
  }
}

export async function registerAction(data: { name: string; email: string; role: UserRole }) {
  try {
    const userRepository = new MongoUserRepository();
    let user = await userRepository.findByEmail(data.email);
    
    if (user) {
      return { success: false, error: 'Email already exists' };
    }

    const firebaseUid = `mock-${data.role}-${Date.now()}`;
    
    user = await userRepository.create({
      firebaseUid,
      email: data.email,
      name: data.name,
      role: data.role,
      hospitalId: 'default-hospital-id',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 3. Set a session cookie via a custom JWT that includes the role
    const jwtSecret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-key-for-dev-only');
    const sessionJwt = await new SignJWT({ uid: user.id, role: user.role, firebaseUid: user.firebaseUid })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('5d')
      .sign(jwtSecret);

    const cookieStore = await cookies();
    cookieStore.set('session', sessionJwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 5, // 5 days
      path: '/',
    });

    return { success: true, user: serializeUser(user) };
  } catch (error) {
    console.error('Server Action Register Error:', error);
    return { success: false, error: 'Server error during registration' };
  }
}

export async function emailPasswordLoginAction(email: string, password: string) {
  try {
    // 1. Validate against dummy accounts
    const { DUMMY_ACCOUNTS } = await import('../../constants/dummyAccounts');
    const account = DUMMY_ACCOUNTS.find(a => a.email === email && a.password === password);
    
    if (!account) {
      return { success: false, error: 'Email atau password salah' };
    }

    // 2. Mock user completely for Dummy Accounts to bypass MongoDB
    const user = {
      id: `mock-id-${Date.now()}`,
      firebaseUid: `mock-${account.role}-${Date.now()}`,
      email: account.email,
      name: account.name,
      role: account.role,
      hospitalId: 'default-hospital-id',
      specialization: account.specialization,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // 3. Set session cookie
    const jwtSecret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-key-for-dev-only');
    const sessionJwt = await new SignJWT({ uid: user.id, role: user.role, firebaseUid: user.firebaseUid })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('5d')
      .sign(jwtSecret);

    const cookieStore = await cookies();
    cookieStore.set('session', sessionJwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 5,
      path: '/',
    });

    return { success: true, user: serializeUser(user) };
  } catch (error) {
    console.error('Email/Password Login Error:', error);
    return { success: false, error: 'Terjadi kesalahan server' };
  }
}

export async function logoutServerAction() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
  return { success: true };
}
