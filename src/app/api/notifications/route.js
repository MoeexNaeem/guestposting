import { withAuth } from '@/server/auth';
import { getNotifications } from '@/server/controllers/notificationController';

export const dynamic = 'force-dynamic';

export const GET = withAuth(getNotifications);
