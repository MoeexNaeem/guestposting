import { withAuth } from '@/server/auth';
import { updateOrderContent } from '@/server/controllers/orderController';

export const dynamic = 'force-dynamic';

export const PUT = withAuth(updateOrderContent);
