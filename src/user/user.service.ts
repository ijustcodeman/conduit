import { Injectable } from '@nestjs/common';
import { type UserModel } from '../../generated/prisma/models/User';
import { type UpdateUserPayload } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async createUser(user: {
    username: string;
    email: string;
    password: string;
  }): Promise<UserModel> {
    return this.prisma.user.create({
      data: user,
    });
  }

  async findByEmail(email: string): Promise<UserModel | null> {
    return this.prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  // we could merge this together with findByEmail but for testing and
  // debugging purposes we will leave it like that
  async findByUsername(username: string): Promise<UserModel | null> {
    return this.prisma.user.findUnique({
      where: {
        username,
      },
    });
  }

  async findById(id: number): Promise<UserModel | null> {
    return this.prisma.user.findUnique({
      where: {
        id,
      },
    });
  }

  async updateUser(
    id: number,
    user: UpdateUserPayload,
  ): Promise<UserModel> {
    return this.prisma.user.update({
      where: {
        id,
      },
      data: user,
    });
  }
}
