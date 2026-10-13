import { withAuth } from '@/server/auth';
import { getOrderMessages } from '@/server/controllers/messageController';

export const dynamic = 'force-dynamic';

export const GET = withAuth(getOrderMessages);
