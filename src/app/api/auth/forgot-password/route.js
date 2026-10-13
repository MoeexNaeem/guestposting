import { route } from '@/server/http';
import { forgotPassword } from '@/server/controllers/authController';

export const dynamic = 'force-dynamic';

export const POST = route(forgotPassword);
