import { withAuth } from '@/server/auth';
import { markAsRead } from '@/server/controllers/notificationController';

export const dynamic = 'force-dynamic';

export const PUT = withAuth(markAsRead);
