import { route } from '@/server/http';
import { resetPassword } from '@/server/controllers/authController';

export const dynamic = 'force-dynamic';

export const POST = route(resetPassword);
