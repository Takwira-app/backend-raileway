import { Module } from '@nestjs/common';
import { StadiumsService } from './stadiums.service';
import { StadiumsController } from './stadiums.controller';
import { AuthService } from 'src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [StadiumsController],
  providers: [StadiumsService, PrismaService, AuthService,JwtService],
  exports: [StadiumsService]
})
export class StadiumsModule {}
