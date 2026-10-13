import { withAuth, seller } from '@/server/auth';
import { getMyListings } from '@/server/controllers/listingController';

export const dynamic = 'force-dynamic';

export const GET = withAuth(getMyListings, seller);
