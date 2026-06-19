import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

export const capsuleSchema = z
  .object({
    title: z.string().max(100).optional(),
    body: z.string().min(1, "Write something for your future self"),
    isSelf: z.boolean(),
    recipientEmail: z.string().email().optional().or(z.literal("")),
    deliveryAt: z.string().min(1, "Choose a delivery date and time"),
  })
  .refine(
    (data) => data.isSelf || (data.recipientEmail && data.recipientEmail.length > 0),
    { message: "Enter a recipient email", path: ["recipientEmail"] }
  )
  .refine(
    (data) => new Date(data.deliveryAt).getTime() > Date.now(),
    { message: "Delivery must be after the current date and time", path: ["deliveryAt"] }
  );

export type LoginFormData = z.infer<typeof loginSchema>;
export type CapsuleFormData = z.infer<typeof capsuleSchema>;
