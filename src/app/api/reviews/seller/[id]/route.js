import { route } from '@/server/http';
import { getSellerReviews } from '@/server/controllers/reviewController';

export const dynamic = 'force-dynamic';

export const GET = route(getSellerReviews);
