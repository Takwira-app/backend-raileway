import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

// matches.guard.ts
@Injectable()
export class MatchParticipantGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user.userId;
    const matchId = parseInt(request.params.matchId);

    // Check if user is a participant
    const participant = await this.prisma.team_players.findFirst({
      where: {
        player_id: userId,
        match_teams: { match_id: matchId },
      },
    });

    return !!participant;
  }
}