import * as z from 'zod';
import { UserResponsePayloadSchema } from '../../user/dto/user-response.dto';

export const AuthResponseSchema = z.object({
  user: UserResponsePayloadSchema,
});

export type AuthResponse = z.infer<typeof AuthResponseSchema>;
