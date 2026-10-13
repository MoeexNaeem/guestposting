import { route } from '@/server/http';
import { submitContact } from '@/server/controllers/contactController';

export const dynamic = 'force-dynamic';

export const POST = route(submitContact);
