import * as z from 'zod';

export const UserResponsePayloadSchema = z.object({
  username: z.string(),
  email: z.string().email(),
  token: z.string(),
});

export type UserResponsePayload = z.infer<typeof UserResponsePayloadSchema>;
