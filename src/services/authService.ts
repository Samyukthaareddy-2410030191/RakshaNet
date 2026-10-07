import { AuthUser, JwtSession, UserRole } from '../types';

export const DEMO_PROFILES: Record<UserRole, AuthUser> = {
  ADMIN: {
    id: 'usr-admin-01',
    name: 'Dr. Rajesh Varma',
    email: 'rajesh.varma@ndrf.gov.in',
    role: 'ADMIN',
    badgeId: 'NDRF-NAT-DIR-001',
    department: 'National Disaster Response Force (NDRF) Command HQ',
    phone: '+91 94401 22334',
  },
  COORDINATOR: {
    id: 'usr-coord-01',
    name: 'Inspector Anita Rao',
    email: 'anita.rao@ghmc.gov.in',
    role: 'COORDINATOR',
    badgeId: 'GHMC-DISP-CENTRAL-08',
    department: 'GHMC HYDRAA Disaster Dispatch Operations',
    phone: '+91 98490 11223',
  },
  HOSPITAL: {
    id: 'usr-hosp-01',
    name: 'Dr. S. K. Narayana',
    email: 'sk.narayana@osmania.telangana.gov.in',
    role: 'HOSPITAL',
    badgeId: 'OGH-MED-SUPT-410',
    department: 'Osmania General Hospital Trauma Command',
    phone: '+91 94405 88990',
  },
  VOLUNTEER: {
    id: 'usr-vol-01',
    name: 'Kiran Kumar',
    email: 'kiran.k@redcross.org.in',
    role: 'VOLUNTEER',
    badgeId: 'NDRF-VOL-HYD-409',
    department: 'Indian Red Cross & SDRF Quick Action Volunteer Wing',
    phone: '+91 99887 66554',
  },
  CITIZEN: {
    id: 'usr-cit-01',
    name: 'Venkat Reddy',
    email: 'venkat.reddy@gmail.com',
    role: 'CITIZEN',
    badgeId: 'CIT-HYD-9982',
    department: 'Civilian Emergency User (Tolichowki Resident)',
    phone: '+91 91234 56789',
  },
};

const TOKEN_KEY = 'rakshanet_jwt_token';
const USER_KEY = 'rakshanet_auth_user';

// Client-side JWT generator for Edge / Offline mode fallback
export function createOfflineJwt(user: AuthUser): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    sub: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    badgeId: user.badgeId,
    department: user.department,
    iss: 'rakshanet-edge-authority',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 86400,
  };

  const b64 = (obj: any) =>
    btoa(JSON.stringify(obj))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

  const encodedHeader = b64(header);
  const encodedPayload = b64(payload);
  const simulatedSig = b64({ sig: 'valid-hs256-edge-hash', time: Date.now() });

  return `${encodedHeader}.${encodedPayload}.${simulatedSig}`;
}

export function parseJwt(token: string): any | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    let b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4) b64 += '=';
    return JSON.parse(atob(b64));
  } catch {
    return null;
  }
}

export async function loginUser(role: UserRole, customDetails?: Partial<AuthUser>): Promise<JwtSession> {
  const profile = { ...DEMO_PROFILES[role], ...(customDetails || {}) };

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, demoUser: profile }),
    });

    if (res.ok) {
      const data = await res.json();
      const session: JwtSession = {
        token: data.token,
        user: data.user,
        issuedAt: Date.now(),
        expiresAt: Date.now() + 86400 * 1000,
        algorithm: 'HS256',
        isValid: true,
      };
      localStorage.setItem(TOKEN_KEY, session.token);
      localStorage.setItem(USER_KEY, JSON.stringify(session.user));
      return session;
    }
  } catch (e) {
    console.warn('Backend login unavailable, generating sovereign Edge JWT:', e);
  }

  // Fallback to offline Edge JWT
  const token = createOfflineJwt(profile);
  const session: JwtSession = {
    token,
    user: profile,
    issuedAt: Date.now(),
    expiresAt: Date.now() + 86400 * 1000,
    algorithm: 'HS256 (Edge)',
    isValid: true,
  };
  localStorage.setItem(TOKEN_KEY, session.token);
  localStorage.setItem(USER_KEY, JSON.stringify(session.user));
  return session;
}

export function getInitialSession(): JwtSession {
  try {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUserStr = localStorage.getItem(USER_KEY);
    if (storedToken && storedUserStr) {
      const user = JSON.parse(storedUserStr);
      return {
        token: storedToken,
        user,
        issuedAt: Date.now() - 3600000,
        expiresAt: Date.now() + 82800000,
        algorithm: 'HS256',
        isValid: true,
      };
    }
  } catch {
    // fallback
  }

  // Default to Admin session
  const defaultUser = DEMO_PROFILES.ADMIN;
  const defaultToken = createOfflineJwt(defaultUser);
  return {
    token: defaultToken,
    user: defaultUser,
    issuedAt: Date.now(),
    expiresAt: Date.now() + 86400000,
    algorithm: 'HS256',
    isValid: true,
  };
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
