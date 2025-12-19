import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { PrismaService } from './prisma/prisma.service';
import { MatchesModule } from './matches/matches.module';
import { MatchTeamsModule } from './match_teams/match_teams.module';
import { StadiumsModule } from './stadiums/stadiums.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { FirebaseModule } from './firebase/firebase.module'; // ADD THIS


@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule,
    AuthModule,
    FirebaseModule, 
    MatchesModule,
    MatchTeamsModule,
    StadiumsModule,
    UsersModule],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}

