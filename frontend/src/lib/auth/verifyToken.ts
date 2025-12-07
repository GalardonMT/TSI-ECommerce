import { resolveUser, requireUser } from './serverTokens';

function attachAccessMetadata(user: any, accessToken: string | null, refreshedAccessToken: string | null) {
  if (!user) return null;
  const enriched = { ...user };
  if (accessToken) (enriched as any).access = accessToken;
  if (refreshedAccessToken) (enriched as any).refreshedAccess = refreshedAccessToken;
  return enriched;
}

export async function getUserFromHeaders(headers: Headers): Promise<any | null> {
  const { user, accessToken, refreshedAccessToken } = await resolveUser({ headers });
  if (!user) return null;
  return attachAccessMetadata(user, accessToken, refreshedAccessToken);
}

export async function requireSuperUser(headers: Headers): Promise<any | null> {
  const resolution = await requireUser({ headers }, 'superuser');
  if (!resolution?.user) return null;
  return attachAccessMetadata(resolution.user, resolution.accessToken, resolution.refreshedAccessToken);
}

export async function requireStaff(headers: Headers): Promise<any | null> {
  const resolution = await requireUser({ headers }, 'staff');
  if (!resolution?.user) return null;
  return attachAccessMetadata(resolution.user, resolution.accessToken, resolution.refreshedAccessToken);
}
