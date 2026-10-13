import { route } from '@/server/http';
import { registerUser } from '@/server/controllers/authController';

export const dynamic = 'force-dynamic';

export const POST = route(registerUser);
