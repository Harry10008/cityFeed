import { z } from 'zod';

export const CreateAppReviewDto = z.object({
  rating: z.number().min(1).max(5),
  title: z.string().min(1).max(100),
  comment: z.string().min(1).max(1000),
  version: z.string().min(1),
  platform: z.enum(['ios', 'android', 'web'])
});

export const CreateVenueReviewDto = z.object({
  venueId: z.string().min(1),
  rating: z.number().min(1).max(5),
  title: z.string().min(1).max(100),
  comment: z.string().min(1).max(1000),
  photos: z.array(z.string().url()).optional()
});

export const UpdateReviewDto = z.object({
  rating: z.number().min(1).max(5).optional(),
  title: z.string().min(1).max(100).optional(),
  comment: z.string().min(1).max(1000).optional(),
  photos: z.array(z.string().url()).optional()
});

export const ReportReviewDto = z.object({
  reason: z.string().min(1).max(200)
});

export type CreateAppReviewRequest = z.infer<typeof CreateAppReviewDto>;
export type CreateVenueReviewRequest = z.infer<typeof CreateVenueReviewDto>;
export type UpdateReviewRequest = z.infer<typeof UpdateReviewDto>;
export type ReportReviewRequest = z.infer<typeof ReportReviewDto>; 