import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { PrismaService } from './prisma/prisma.service';
import { MatchesModule } from './matches/matches.module';
import { MatchTeamsModule } from './match_teams/match_teams.module';
import { StadiumsModule } from './stadiums/stadiums.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), UsersModule, MatchesModule, MatchTeamsModule, StadiumsModule],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
