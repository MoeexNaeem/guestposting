import { withAuth } from '@/server/auth';
import { getMyOrders } from '@/server/controllers/orderController';

export const dynamic = 'force-dynamic';

export const GET = withAuth(getMyOrders);
