import { withAuth } from '@/server/auth';
import { getUserProfile } from '@/server/controllers/userController';

export const dynamic = 'force-dynamic';

export const GET = withAuth(getUserProfile);
