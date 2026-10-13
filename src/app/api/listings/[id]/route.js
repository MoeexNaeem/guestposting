import { withAuth, seller } from '@/server/auth';
import { getListingById, updateListing, deleteListing } from '@/server/controllers/listingController';

export const dynamic = 'force-dynamic';

export const GET = withAuth(getListingById);
export const PUT = withAuth(updateListing, seller);
export const DELETE = withAuth(deleteListing, seller);
