export type RegisterUserPayload = {
  username: string;
  email: string;
  password: string;
};

export type RegisterUserDto = {
  user: RegisterUserPayload;
};
