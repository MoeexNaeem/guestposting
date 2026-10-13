import { withAuth, admin } from '@/server/auth';
import { getAdminListings } from '@/server/controllers/listingController';

export const dynamic = 'force-dynamic';

export const GET = withAuth(getAdminListings, admin);
