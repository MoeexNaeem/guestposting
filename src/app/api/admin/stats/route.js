import { withAuth, admin } from '@/server/auth';
import { getPlatformStats } from '@/server/controllers/adminController';

export const dynamic = 'force-dynamic';

export const GET = withAuth(getPlatformStats, admin);
