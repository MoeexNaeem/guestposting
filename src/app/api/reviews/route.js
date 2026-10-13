import { withAuth } from '@/server/auth';
import { createReview } from '@/server/controllers/reviewController';

export const dynamic = 'force-dynamic';

export const POST = withAuth(createReview);
