import { withAuth, admin } from '@/server/auth';
import { approveListing } from '@/server/controllers/listingController';

export const dynamic = 'force-dynamic';

export const PUT = withAuth(approveListing, admin);
