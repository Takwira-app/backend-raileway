import { Module } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { MatchesController } from './matches.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { MatchTeamsModule } from '../match_teams/match_teams.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [MatchTeamsModule,AuthModule],
  controllers: [MatchesController],
  providers: [MatchesService,PrismaService],
  exports: [MatchesService]
  
})
export class MatchesModule {}
