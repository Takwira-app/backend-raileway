// ============================================
// src/matches/matches.module.ts
// ============================================
import { Module, forwardRef } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { MatchesController } from './matches.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MatchTeamsModule } from 'src/match_teams/match_teams.module';

@Module({
  imports: [PrismaModule, forwardRef(() => MatchTeamsModule)],
  controllers: [MatchesController],
  providers: [MatchesService],
  exports: [MatchesService], // IMPORTANT: Export for use in MatchTeamsModule
})
export class MatchesModule {}

