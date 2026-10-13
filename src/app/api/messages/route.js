import { withAuth } from '@/server/auth';
import { sendMessage } from '@/server/controllers/messageController';

export const dynamic = 'force-dynamic';

export const POST = withAuth(sendMessage);
