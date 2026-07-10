export const PUBLIC_PATHS = ['/', '/login', '/register', '/forgot-password', '/reset-password'];

export function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith('/reset-password'));
}
