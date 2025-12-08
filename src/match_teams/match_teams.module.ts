import { Module } from '@nestjs/common';
import { MatchTeamsService } from './match_teams.service';
import { MatchTeamsController } from './match_teams.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [MatchTeamsController],
  providers: [MatchTeamsService,PrismaService],
  exports: [MatchTeamsService]

})
export class MatchTeamsModule {}
