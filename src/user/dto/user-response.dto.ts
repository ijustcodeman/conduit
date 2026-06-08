import * as z from 'zod';

export const UserResponsePayloadSchema = z.object({
  username: z.string(),
  email: z.email(),
  token: z.string(),
  bio: z.string(),
  image: z.string(),
});

export type UserResponsePayload = z.infer<typeof UserResponsePayloadSchema>;
