import { withAuth, seller } from '@/server/auth';
import { bulkUploadListings } from '@/server/controllers/listingController';

export const dynamic = 'force-dynamic';

export const POST = withAuth(bulkUploadListings, seller);
