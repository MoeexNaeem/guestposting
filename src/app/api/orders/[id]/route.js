import { withAuth } from '@/server/auth';
import { getOrderById } from '@/server/controllers/orderController';

export const dynamic = 'force-dynamic';

export const GET = withAuth(getOrderById);
