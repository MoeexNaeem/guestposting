import { withAuth, seller } from '@/server/auth';
import { getListingById, updateListing } from '@/server/controllers/listingController';

export const dynamic = 'force-dynamic';

export const GET = withAuth(getListingById);
export const PUT = withAuth(updateListing, seller);
