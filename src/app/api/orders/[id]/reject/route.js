import { withAuth } from '@/server/auth';
import { rejectOrder } from '@/server/controllers/orderController';

export const dynamic = 'force-dynamic';

export const PUT = withAuth(rejectOrder);
