import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthService } from 'src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';


@Module({
  controllers: [UsersController],
  providers: [UsersService, PrismaService,
    AuthService,JwtService],
  exports: [UsersService]  
})
export class UsersModule {}
