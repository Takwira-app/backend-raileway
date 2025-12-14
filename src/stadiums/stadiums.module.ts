// src/stadiums/stadiums.module.ts
import { Module } from '@nestjs/common';
import { StadiumsService } from './stadiums.service';
import { StadiumsController } from './stadiums.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule], // Import PrismaModule instead of PrismaService
  controllers: [StadiumsController],
  providers: [StadiumsService],
  exports: [StadiumsService],
})
export class StadiumsModule {}