import { z } from "genkit";

export const chatInputSchema = z.object({
  message: z.string().min(1).max(500),
  timezone: z.string().optional(),
});

export const chartPayloadSchema = z.object({
  type: z.enum(["pie", "line"]),
  title: z.string(),
  labels: z.array(z.string()),
  values: z.array(z.number()),
});

export const chatOutputSchema = z.object({
  reply: z.string(),
  chart: chartPayloadSchema.optional(),
});

export const upstreamUserSchema = z
  .object({
    id: z.number(),
    name: z.string(),
    email: z.string(),
    status: z.string(),
  })
  .passthrough();

export const upstreamUsersResponseSchema = z
  .object({
    data: z.array(upstreamUserSchema),
    pagination: z
      .object({
        total_pages: z.number().optional(),
      })
      .passthrough()
      .optional(),
  })
  .passthrough();
