import { route } from '@/server/http';
import { getPublicSellerProfile } from '@/server/controllers/userController';

export const dynamic = 'force-dynamic';

export const GET = route(getPublicSellerProfile);
