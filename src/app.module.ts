import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { PrismaService } from './prisma/prisma.service';
import { MatchesModule } from './matches/matches.module';
import { MatchTeamsModule } from './match_teams/match_teams.module';
import { StadiumsModule } from './stadiums/stadiums.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule,
    AuthModule,
    MatchesModule,
    MatchTeamsModule,
    StadiumsModule,],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}

