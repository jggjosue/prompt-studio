/** Protección mínima para endpoints de invalidación / stats de caché. */

export function isCacheAdminAuthorized(request: Request): boolean {
  const token = process.env.CACHE_ADMIN_TOKEN?.trim();
  if (!token) {
    return process.env.NODE_ENV === 'development';
  }
  const header = request.headers.get('authorization');
  if (header === `Bearer ${token}`) return true;
  const query = new URL(request.url).searchParams.get('token');
  return query === token;
}
