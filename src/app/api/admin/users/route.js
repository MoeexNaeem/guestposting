import { withAuth, admin } from '@/server/auth';
import { getAllUsers } from '@/server/controllers/adminController';

export const dynamic = 'force-dynamic';

export const GET = withAuth(getAllUsers, admin);
