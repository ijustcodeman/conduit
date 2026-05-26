export type LoginUserPayload = {
  email: string;
  password: string;
};

export type LoginUserDto = {
  user: LoginUserPayload;
};
