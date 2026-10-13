'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

// Role rules from the old <ProtectedRoute allowedRoles={...}> wrappers in App.jsx.
const allowedRolesFor = (pathname) => {
  if (pathname === '/admin' || pathname.startsWith('/admin/')) return ['admin'];
  if (
    pathname === '/add-listing' ||
    pathname === '/my-listings' ||
    pathname.startsWith('/edit-listing/')
  ) return ['seller', 'admin'];
  return [];
};

const ProtectedRoute = ({ children }) => {
  'use no memo';
  const pathname = usePathname();
  const router = useRouter();
  // The session lives in localStorage, so nothing renders until the browser
  // can read it (the Vite app was client-only and behaved the same way).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  let redirect = null;
  if (mounted) {
    const userInfoString = localStorage.getItem('userInfo');
    if (!userInfoString) {
      redirect = { to: '/login', replace: false };
    } else {
      const userInfo = JSON.parse(userInfoString);
      const allowedRoles = allowedRolesFor(pathname);
      // RBAC Check: If specific roles are required and user doesn't have them
      if (allowedRoles.length > 0 && !allowedRoles.includes(userInfo.role)) {
        redirect = { to: '/marketplace', replace: true };
      }
    }
  }

  const redirectTo = redirect?.to;
  const redirectReplace = redirect?.replace;
  useEffect(() => {
    if (!redirectTo) return;
    if (redirectReplace) router.replace(redirectTo);
    else router.push(redirectTo);
  }, [redirectTo, redirectReplace, router]);

  if (!mounted || redirect) return null;
  return children;
};

export default ProtectedRoute;
