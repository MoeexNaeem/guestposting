'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Unknown URLs go back to the landing page, like the old <Route path="*"> did.
export default function NotFound() {
  const router = useRouter();
  useEffect(() => {
    router.push('/');
  }, [router]);
  return null;
}
