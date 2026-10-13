import { route } from '@/server/http';
import { loginUser } from '@/server/controllers/authController';

export const dynamic = 'force-dynamic';

export const POST = route(loginUser);
