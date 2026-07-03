import { NextResponse } from 'next/server';
import { adminAuth } from '@/infrastructure/firebase/firebaseAdmin';
import { PrismaUserRepository } from '@/infrastructure/database/repositories/PrismaUserRepository';
import { UserRole } from '@/core/entities/User';

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string; // Firebase UID
    role: UserRole;
    email: string;
  };
}

export const withAuth = (
  handler: (req: AuthenticatedRequest, ...args: unknown[]) => Promise<NextResponse>,
  allowedRoles?: UserRole[]
) => {
  return async (req: AuthenticatedRequest, ...args: unknown[]) => {
    try {
      const authHeader = req.headers.get('Authorization');
      if (!authHeader?.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Unauthorized: Missing token' }, { status: 401 });
      }

      const token = authHeader.split('Bearer ')[1];
      
      let decodedToken;
      try {
        // --- DEV MODE MOCK TOKEN BYPASS ---
        if (process.env.NODE_ENV === 'development' && token.startsWith('mock-')) {
          const role = token.split('mock-')[1].toUpperCase() as UserRole;
          
          if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
            return NextResponse.json({ error: `Forbidden: Requires one of roles [${allowedRoles.join(',')}]` }, { status: 403 });
          }

          req.user = {
            uid: `mock-${role.toLowerCase()}-id`,
            email: `mock-${role.toLowerCase()}@hospital.com`,
            role: role
          };
          return await handler(req, ...args);
        }
        // --- END DEV MODE BYPASS ---

        decodedToken = await adminAuth.verifyIdToken(token);
      } catch (_e) {
        return NextResponse.json({ error: 'Unauthorized: Invalid Firebase token' }, { status: 401 });
      }

      // 2. Query PostgreSQL using Firebase UID
      const userRepo = new PrismaUserRepository();
      const user = await userRepo.findByFirebaseUid(decodedToken.uid);

      if (!user) {
        return NextResponse.json({ error: 'Forbidden: User profile not found in MongoDB' }, { status: 403 });
      }

      // 3. Check Role Permissions
      if (allowedRoles && allowedRoles.length > 0) {
        if (!allowedRoles.includes(user.role)) {
          return NextResponse.json({ error: `Forbidden: Requires one of roles [${allowedRoles.join(',')}]` }, { status: 403 });
        }
      }

      // 4. Inject User Context
      req.user = {
        uid: decodedToken.uid,
        email: user.email,
        role: user.role
      };

      // 5. Execute Request
      return await handler(req, ...args);
    } catch (error) {
      console.error('[AuthMiddleware] Error:', error);
      return NextResponse.json({ error: 'Internal Server Error during authorization' }, { status: 500 });
    }
  };
};
