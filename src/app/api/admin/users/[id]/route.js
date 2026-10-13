import { withAuth, admin } from '@/server/auth';
import { updateUserByAdmin } from '@/server/controllers/adminController';

export const dynamic = 'force-dynamic';

export const PUT = withAuth(updateUserByAdmin, admin);
