import * as z from "zod";

export const userAuthSchema = z.object({
  email: z.string().email(),
  acceptTerms: z.boolean().optional(),
});

export const userRegisterSchema = userAuthSchema.extend({
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: "You must accept the terms and conditions" }),
  }),
});
