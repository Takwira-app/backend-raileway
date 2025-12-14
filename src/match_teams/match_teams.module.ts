// ============================================
// src/match_teams/match_teams.module.ts
// ============================================
import { Module, forwardRef } from '@nestjs/common';
import { MatchTeamsService } from './match_teams.service';
import { MatchTeamsController } from './match_teams.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MatchesModule } from 'src/matches/matches.module';

@Module({
  imports: [PrismaModule, forwardRef(() => MatchesModule)],
  controllers: [MatchTeamsController],
  providers: [MatchTeamsService],
  exports: [MatchTeamsService],
})
export class MatchTeamsModule {}
