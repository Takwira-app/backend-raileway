// src/match_teams/match_teams.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMatchTeamDto } from './dto/create-match_team.dto';
import { UpdateMatchTeamDto } from './dto/update-match_team.dto';
import { MatchesService } from 'src/matches/matches.service';

@Injectable()
export class MatchTeamsService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => MatchesService))
    private matchesService: MatchesService,
  ) {}

  // ============================
  // CREATE TEAM
  // ============================
  async createTeam(match_id: number, dto: CreateMatchTeamDto) {
    const match = await this.prisma.matches.findUnique({
      where: { match_id },
    });

    if (!match) throw new NotFoundException('Match not found');

    const existingTeams = await this.prisma.match_teams.findMany({
      where: { match_id },
    });

    if (existingTeams.length >= 2)
      throw new ForbiddenException('Maximum number of teams reached');

    const team_number = existingTeams.length + 1;

    return this.prisma.match_teams.create({
      data: {
        match_id,
        ...dto,
      },
    });
  }

  // ============================
  // FIND ONE TEAM
  // ============================
  async findOne(team_id: number) {
    const team = await this.prisma.match_teams.findUnique({
      where: { match_team_id: team_id },
      include: {
        team_players: { include: { users: true } },
      },
    });

    if (!team) throw new NotFoundException('Match team not found');
    return team;
  }

  // ============================
  // JOIN TEAM
  // ============================
  async joinTeam(team_id: number, player_id: number) {
    const team = await this.prisma.match_teams.findUnique({
      where: { match_team_id: team_id },
      include: { matches: true },
    });

    if (!team) throw new NotFoundException('Team not found');

    // Already in this team
    const alreadyJoined = await this.prisma.team_players.findUnique({
      where: {
        match_team_id_player_id: {
          match_team_id: team_id,
          player_id,
        },
      },
    });

    if (alreadyJoined)
      throw new ForbiddenException('Player already in this team');

    // In another team of same match
    const inOtherTeam = await this.prisma.team_players.findFirst({
      where: {
        player_id,
        match_teams: {
          match_id: team.match_id,
        },
      },
    });

    if (inOtherTeam)
      throw new ForbiddenException(
        'You are already in another team for this match',
      );

    // Team capacity
    const playerCount = await this.prisma.team_players.count({
      where: { match_team_id: team_id },
    });

    const maxPerTeam = team.matches.max_players / 2;
    if (playerCount >= maxPerTeam)
      throw new ForbiddenException('Team is full');

    // Add to Firebase chat (using MatchesService)
    await this.matchesService.addPlayerToChat(team.match_id, player_id);

    return this.prisma.team_players.create({
      data: {
        match_team_id: team_id,
        player_id,
      },
    });
  }

  // ============================
  // SWITCH TEAM
  // ============================
  async switchTeam(team_id: number, player_id: number) {
    const newTeam = await this.prisma.match_teams.findUnique({
      where: { match_team_id: team_id },
      include: { matches: true },
    });

    if (!newTeam) throw new NotFoundException('Team not found');

    const currentTeam = await this.prisma.match_teams.findFirst({
      where: {
        match_id: newTeam.match_id,
        team_players: { some: { player_id } },
      },
    });

    if (currentTeam?.match_team_id === team_id)
      throw new ForbiddenException('You are already in this team');

    if (currentTeam) {
      await this.prisma.team_players.delete({
        where: {
          match_team_id_player_id: {
            match_team_id: currentTeam.match_team_id,
            player_id,
          },
        },
      });
    }

    // Player stays in chat when switching teams (match-based chat)
    // No need to add/remove from Firebase chat

    return this.prisma.team_players.create({
      data: {
        match_team_id: team_id,
        player_id,
      },
    });
  }

  // ============================
  // LEAVE TEAM
  // ============================
  async leaveTeam(team_id: number, player_id: number) {
    const team = await this.prisma.match_teams.findUnique({
      where: { match_team_id: team_id },
    });

    if (!team) throw new NotFoundException('Team not found');

    const membership = await this.prisma.team_players.findUnique({
      where: {
        match_team_id_player_id: {
          match_team_id: team_id,
          player_id,
        },
      },
    });

    if (!membership)
      throw new NotFoundException('Player is not in this team');

    // Remove from Firebase chat (using MatchesService)
    await this.matchesService.removePlayerFromChat(team.match_id, player_id);

    return this.prisma.team_players.delete({
      where: {
        match_team_id_player_id: {
          match_team_id: team_id,
          player_id,
        },
      },
    });
  }

  // ============================
  // DELETE TEAM
  // ============================
  async remove(team_id: number) {
    const team = await this.prisma.match_teams.findUnique({
      where: { match_team_id: team_id },
    });

    if (!team) throw new NotFoundException('Match team not found');

    return this.prisma.match_teams.delete({
      where: { match_team_id: team_id },
    });
  }

  // ============================
  // GET PLAYERS
  // ============================
  async getPlayers(team_id: number) {
    return this.prisma.team_players.findMany({
      where: { match_team_id: team_id },
      include: { users: true },
    });
  }

  // ============================
  // REMOVE PLAYER (ADMIN)
  // ============================
  async removePlayer(team_id: number, player_id: number) {
    const team = await this.prisma.match_teams.findUnique({
      where: { match_team_id: team_id },
    });

    if (!team) throw new NotFoundException('Team not found');

    // Remove from Firebase chat
    await this.matchesService.removePlayerFromChat(team.match_id, player_id);

    return this.prisma.team_players.delete({
      where: {
        match_team_id_player_id: {
          match_team_id: team_id,
          player_id,
        },
      },
    });
  }

  // ============================
  // UPDATE TEAM
  // ============================
  async updateTeam(
    match_id: number,
    team_number: number,
    dto: UpdateMatchTeamDto,
    userId: number,
  ) {
    const team = await this.prisma.match_teams.findUnique({
      where: {
        match_id_team_number: { match_id, team_number },
      },
      include: { matches: true },
    });

    if (!team) throw new NotFoundException('Team not found');

    if (team.matches.creator_id !== userId)
      throw new ForbiddenException(
        'Only match creator can update this team',
      );

    return this.prisma.match_teams.update({
      where: {
        match_id_team_number: { match_id, team_number },
      },
      data: dto,
    });
  }
}