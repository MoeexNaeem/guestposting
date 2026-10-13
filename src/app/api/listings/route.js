import { route } from '@/server/http';
import { withAuth, seller } from '@/server/auth';
import { getListings, createListing } from '@/server/controllers/listingController';

export const dynamic = 'force-dynamic';

export const GET = route(getListings);
export const POST = withAuth(createListing, seller);
