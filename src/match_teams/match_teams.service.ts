import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMatchTeamDto } from './dto/create-match_team.dto';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { UpdateMatchTeamDto } from './dto/update-match_team.dto';

@Injectable()
export class MatchTeamsService {
  constructor(private prisma: PrismaService) {}

  async createTeam(match_id:number,dto: CreateMatchTeamDto) {
    const match = await this.prisma.matches.findUnique({ where: { match_id } });
    if (!match) throw new NotFoundException('Match not found');

    const existingTeams = await this.prisma.match_teams.findMany({
      where: { match_id },
    });
    if (existingTeams.length >= 2){
      throw new ForbiddenException('Maximum number of teams reached');
    }
    const team_number = existingTeams.length + 1; 

    return this.prisma.match_teams.create({
      data: { match_id, team_number  },
    });
  }

  async findOne(team_id: number) {
    const team = this.prisma.match_teams.findUnique({
      where: { match_team_id: team_id },
      include: { team_players: true },
    });

    if (!team) throw new NotFoundException('Match not found');
    return team;
  }

  async joinTeam(team_id : number, player_id: number) {
      const team = await this.prisma.match_teams.findFirst({
        where: { match_team_id: team_id },
        include: { matches: true },
      });
  
      if (!team) throw new NotFoundException('Team not found');
      const alreadyJoined = await this.prisma.team_players.findUnique({
        where: {
          match_team_id_player_id: {
            match_team_id: team_id,
            player_id,
          },
        },
      });
          // 2. Vérifier si le joueur est dans une AUTRE équipe du même match
      const otherTeamsInSameMatch = await this.prisma.match_teams.findMany({
        where: {
          match_id: team.match_id, // Toutes les équipes du même match
          match_team_id: { not: team_id }, // Sauf l'équipe actuelle
        },
      });

      const otherTeamIds = otherTeamsInSameMatch.map(t => t.match_team_id);

      const inOtherTeam = await this.prisma.team_players.findFirst({
        where: {
          player_id,
          match_team_id: { in: otherTeamIds },
        },
      });

      if (inOtherTeam) {
        throw new ForbiddenException(
          'You are already in another team for this match. Leave that team first.'
        );
      }

      // 3. Vérifier si le joueur est le créateur du match
      if (team.matches.creator_id === player_id) {
        throw new ForbiddenException('Match creator cannot join any team');
      }

      // 4. Vérifier la capacité de l'équipe
      const playerCount = await this.prisma.team_players.count({
        where: { match_team_id: team_id },
      });
      
      const maxPerTeam = team.matches.max_players / 2;
      if (playerCount >= maxPerTeam) {
        throw new ForbiddenException('Team is full');
      }

      if (alreadyJoined) {
        throw new ForbiddenException('Player already in this team');
      }

      return this.prisma.team_players.create({
        data: {
          match_team_id: team_id,
          player_id,
        },
      });
    }


  async switchTeam(team_id: number, player_id: number) {
    const newTeam = await this.prisma.match_teams.findFirst({
      where: { match_team_id: team_id },
      include: { matches: true },
    });

    if (!newTeam) throw new NotFoundException('Team not found');

    const currentTeam = await this.prisma.match_teams.findFirst({
      where: {
        match_id: newTeam.match_id,
        team_players: {
          some: {
            player_id: player_id,
          },
        },
      },
    });

    if (currentTeam && currentTeam.match_team_id === team_id) {
      throw new ForbiddenException('You are already in this team');
    }

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

    return this.prisma.team_players.create({
      data: {
        match_team_id: team_id,
        player_id,
      },
    });
  }


  async remove(id: number) {
    const Team = this.prisma.match_teams.findUnique({ where: { match_team_id: id } });
    if (!Team) {
      throw new NotFoundException('Match team not found');
    }

    return this.prisma.match_teams.delete({ where: { match_team_id: id } });
  }

  async leaveTeam(team_id: number,player_id: number) {
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

    return this.prisma.team_players.delete({
      where: {
        match_team_id_player_id: {
          match_team_id: team_id,
          player_id,
        },
      },
    });
  }

  // Players
  
  async getPlayers(team_id: number) {
    return this.prisma.team_players.findMany({
      where: { match_team_id: team_id },
      include: { users: true },
    });
  }

  
  async removePlayer(team_id: number, player_id: number) {
    return this.prisma.team_players.delete({
      where: {
        match_team_id_player_id: {
          match_team_id: team_id,
          player_id,
        },
      },
    });
  }

  async updateTeam(match_id: number, team_number: number, dto: UpdateMatchTeamDto, userId: number) {

    // Find the team first
    const team = await this.prisma.match_teams.findUnique({
      where: { match_id_team_number: { match_id, team_number } },
      include: { matches: true },
    });

    if (!team) throw new NotFoundException("Team not found");

    // Only creator can update
    if (team.matches.creator_id !== userId)
      throw new ForbiddenException("Only match creator can update this team");

    return this.prisma.match_teams.update({
      where: { match_id_team_number: { match_id, team_number } },
      data: dto,
    });
  }


  
}
