import { withAuth, admin } from '@/server/auth';
import { updateListingStatus } from '@/server/controllers/listingController';

export const dynamic = 'force-dynamic';

export const PUT = withAuth(updateListingStatus, admin);
