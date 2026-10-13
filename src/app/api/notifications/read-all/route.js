import { withAuth } from '@/server/auth';
import { markAllRead } from '@/server/controllers/notificationController';

export const dynamic = 'force-dynamic';

export const PUT = withAuth(markAllRead);
