import { withAuth } from '@/server/auth';
import { createOrder } from '@/server/controllers/orderController';

export const dynamic = 'force-dynamic';

export const POST = withAuth(createOrder);
