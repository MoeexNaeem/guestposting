import { withAuth } from '@/server/auth';
import { markOrderPublished } from '@/server/controllers/orderController';

export const dynamic = 'force-dynamic';

export const PUT = withAuth(markOrderPublished);
