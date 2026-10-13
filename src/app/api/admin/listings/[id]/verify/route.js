import { withAuth, admin } from '@/server/auth';
import { verifyListingMetrics } from '@/server/controllers/adminController';

export const dynamic = 'force-dynamic';

export const PUT = withAuth(verifyListingMetrics, admin);
