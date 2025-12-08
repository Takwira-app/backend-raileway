import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { match_status } from 'generated/prisma/enums';
import { UpdateMatchTeamDto } from 'src/match_teams/dto/update-match_team.dto';


@Injectable()
export class MatchesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateMatchDto, userId: number) {
    const matchDate = new Date(dto.match_date);
    const [hours, minutes] = dto.start_time.split(':');

    matchDate.setHours(Number(hours));
    matchDate.setMinutes(Number(minutes));

    const startTime = matchDate; // Utiliser l'objet Date complet pour start_time
    return this.prisma.matches.create({
      data: {
        ...dto,
        creator_id: userId,
        status: 'pending',
        match_date: matchDate,     // ÉCRASER la valeur string par l'objet Date
        start_time: startTime,
      },
    });
  }


  async findAll(query: any) {
    return this.prisma.matches.findMany({
      where: {
        status: query.status || undefined,
        creator_id: query.creator_id ? Number(query.creator_id) : undefined,
        stadium_id: query.stadium_id ? Number(query.stadium_id) : undefined,
        match_date: query.match_date || undefined,
      },
      include: {
        stadiums: true,
        users: true,
        match_teams: {
          include: { team_players: true },
        },
      },
    });
  }

  async findOne(match_id: number) {
    const match = await this.prisma.matches.findUnique({
      where: { match_id },
      include: {
        stadiums: true,
        users: true,
        match_teams: {
          include: { team_players: true },
        },
      },
    });

    if (!match) throw new NotFoundException('Match not found');
    return match;
  }


  async getJoined(userId: number) {
    return this.prisma.matches.findMany({
      where: {
        match_teams: {
          some: {
            team_players: {
              some: { player_id: userId },
            },
          },
        },
      },
      include: {
        stadiums: true,
        users: true,
        match_teams: true,
      },
    });
  }

  async getMyMatches(userId: number) {
    return this.prisma.matches.findMany({
      where: { creator_id: userId },
      include: {
        stadiums: true,
        match_teams: true,
      },
    });
  }

  async getTeams(matchId: number) {
    return this.prisma.match_teams.findMany({
      where: { match_id: matchId },
      include: {
        team_players: { include: { users: true } },
      },
    });
  }


  async update(match_id: number, dto: UpdateMatchDto, userId: number) {
    const match = await this.prisma.matches.findUnique({ where: { match_id } });

    if (!match) throw new NotFoundException('Match not found');
    if (match.creator_id !== userId)
      throw new ForbiddenException('Not allowed');

    return this.prisma.matches.update({
      where: { match_id },
      data: dto,
    });
  }

  async updateStatus(match_id: number, dto: UpdateStatusDto) {
    return this.prisma.matches.update({
      where: { match_id },
      data: { status: dto.status },
    });
  }


  async remove(match_id: number, userId: number) {
    const match = await this.prisma.matches.findUnique({ where: { match_id } });

    if (!match) throw new NotFoundException('Match not found');
    if (match.creator_id !== userId)
      throw new ForbiddenException('Not allowed');

    return this.prisma.matches.delete({ where: { match_id } });
  }
  async leaveMatch(match_id: number, userId: number) {
    const teamPlayer = await this.prisma.team_players.findFirst({
      where: {
        match_teams: { match_id },
        player_id: userId,
      },
    });

    if (!teamPlayer) throw new NotFoundException('Not in match');

    return this.prisma.team_players.delete({
      where: { match_team_id_player_id: {
          match_team_id: teamPlayer.match_team_id,
          player_id: userId,
        }, },
    });
  }


}
