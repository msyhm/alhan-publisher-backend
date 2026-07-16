import { z } from "zod";

export const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional().nullable(),
  comment: z.string({ required_error: "متن نظر الزامی است" }).min(5).max(2000).trim(),
});

export const updateReviewStatusSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"], { required_error: "وضعیت الزامی است" }),
});

export const getReviewsQuerySchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
  page:   z.coerce.number().int().positive().default(1),
  limit:  z.coerce.number().int().min(1).max(100).default(20),
});