import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().trim().min(1, "請輸入帳號"),
  password: z.string().min(1, "請輸入密碼"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
