import { withAuth } from '@/server/auth';
import { getMySales } from '@/server/controllers/orderController';

export const dynamic = 'force-dynamic';

export const GET = withAuth(getMySales);
