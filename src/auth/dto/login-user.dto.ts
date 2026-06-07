import * as z from 'zod';

export const LoginUserPayloadSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const LoginUserDtoSchema = z.object({
  user: LoginUserPayloadSchema,
});

export type LoginUserPayload = z.infer<typeof LoginUserPayloadSchema>;
export type LoginUserDto = z.infer<typeof LoginUserDtoSchema>;
