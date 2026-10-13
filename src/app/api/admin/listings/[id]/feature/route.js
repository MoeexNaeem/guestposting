import { withAuth, admin } from '@/server/auth';
import { toggleFeaturedListing } from '@/server/controllers/adminController';

export const dynamic = 'force-dynamic';

export const PUT = withAuth(toggleFeaturedListing, admin);
