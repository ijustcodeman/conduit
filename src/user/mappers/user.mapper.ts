import { type UserModel } from '../../../generated/prisma/models/User';
import { type UserResponsePayload } from '../dto/user-response.dto';

// takes UserModel but only keeps username and email and
// merges this together with the token
type UserWithToken = Pick<UserModel, 'username' | 'email'> & {
  token: string;
};

export function toUserResponsePayload(user: UserWithToken): UserResponsePayload {
  return {
    username: user.username,
    email: user.email,
    token: user.token,
  };
}
