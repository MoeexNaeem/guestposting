import { withAuth, admin } from '@/server/auth';
import { getLogs } from '@/server/controllers/adminController';

export const dynamic = 'force-dynamic';

export const GET = withAuth(getLogs, admin);
