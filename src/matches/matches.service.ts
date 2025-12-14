// src/matches/matches.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import * as admin from 'firebase-admin';

@Injectable()
export class MatchesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a match and initialize Firebase chat
   */
  async createMatch(dto: CreateMatchDto, userId: number) {
    // Parse date and time
    const matchDate = new Date(dto.match_date);
    const [hours, minutes] = dto.start_time.split(':');
    matchDate.setHours(Number(hours));
    matchDate.setMinutes(Number(minutes));

    // Create match in PostgreSQL
    const match = await this.prisma.matches.create({
      data: {
        creator_id: userId,
        stadium_id: dto.stadium_id,
        match_date: matchDate,
        start_time: matchDate,
        duration_minutes: dto.duration_minutes || 90,
        max_players: dto.max_players,
        status: 'pending',
      },
    });

    try {
      // Initialize Firebase Realtime Database chat room
      const chatRef = admin.database().ref(`chats/match_${match.match_id}`);
      await chatRef.set({
        match_id: match.match_id,
        created_at: admin.database.ServerValue.TIMESTAMP,
        participants: {
          [userId]: true, // Creator is automatically added
        },
        messages: {},
      });

      // Update match with Firebase chat ID
      await this.prisma.matches.update({
        where: { match_id: match.match_id },
        data: { firebase_chat_id: `match_${match.match_id}` },
      });
    } catch (error) {
      console.error('Failed to create Firebase chat:', error);
      // Don't fail the match creation if Firebase fails
    }

    return match;
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

  /**
   * Get chat participants for a match
   */
  async getChatParticipants(matchId: number) {
    const players = await this.prisma.team_players.findMany({
      where: {
        match_teams: {
          match_id: matchId,
        },
      },
      include: {
        users: {
          select: {
            user_id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return players.map((p) => p.users);
  }

  /**
   * Add player to Firebase chat when they join a match
   */
  async addPlayerToChat(matchId: number, playerId: number) {
    try {
      const match = await this.prisma.matches.findUnique({
        where: { match_id: matchId },
        select: { firebase_chat_id: true },
      });

      if (match?.firebase_chat_id) {
        const chatRef = admin
          .database()
          .ref(`chats/${match.firebase_chat_id}/participants`);
        await chatRef.update({
          [playerId]: true,
        });
      }
    } catch (error) {
      console.error('Failed to add player to Firebase chat:', error);
    }
  }

  /**
   * Remove player from Firebase chat when they leave
   */
  async removePlayerFromChat(matchId: number, playerId: number) {
    try {
      const match = await this.prisma.matches.findUnique({
        where: { match_id: matchId },
        select: { firebase_chat_id: true },
      });

      if (match?.firebase_chat_id) {
        const chatRef = admin
          .database()
          .ref(`chats/${match.firebase_chat_id}/participants/${playerId}`);
        await chatRef.remove();
      }
    } catch (error) {
      console.error('Failed to remove player from Firebase chat:', error);
    }
  }

  async update(match_id: number, dto: UpdateMatchDto, userId: number) {
    const match = await this.prisma.matches.findUnique({
      where: { match_id },
    });

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
    const match = await this.prisma.matches.findUnique({
      where: { match_id },
    });

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
      include: {
        match_teams: true,
      },
    });

    if (!teamPlayer) throw new NotFoundException('Not in match');

    // Remove from Firebase chat
    await this.removePlayerFromChat(match_id, userId);

    return this.prisma.team_players.delete({
      where: {
        match_team_id_player_id: {
          match_team_id: teamPlayer.match_team_id,
          player_id: userId,
        },
      },
    });
  }

  async getPendingRequests(userId: number) {
    return this.prisma.match_teams.findMany({
      where: {
        matches: { creator_id: userId, status: match_status.pending },
      },
      include: {
        matches: true,
        team_players: { include: { users: true } },
      },
    });
  }

  async getMatchesForOwner(ownerId: number) {
  return this.prisma.matches.findMany({
    where: {
      stadiums: {
        owner_id: ownerId,
      },
    },
    include: {
      users: true,     
      stadiums: true,  
    },
    orderBy: {
      match_date: 'asc',
    },
  });
}


  async approveRequest(matchId: number, dto: UpdateMatchDto, userId: number) {

    const match = await this.prisma.matches.update({
      where: { match_id: matchId },
      data: { status: 'approved' },
      include: {
        users: true, 
        stadiums: true
      }
    });

    /*await this.notificationService.createNotification(
      match.creator_id,
      'Match Approved! ',
      `Your match at ${match.stadiums.name} on ${match.match_date} has been approved!`,
    );

    return match;*/

  }

  async rejectRequest(match_id: number, dto: UpdateMatchDto, userId: number) {
    const match = await this.prisma.matches.update({
      where: { match_id: match_id },
      data: { status: 'rejected' },
      include: {
        users: true, 
        stadiums: true
      }
    });

    // Notifier le créateur
    /*await this.notificationService.createNotification(
      match.creator_id,
      'Match Rejected! ',
      `Your match at ${match.stadiums.name} on ${match.match_date} has been rejected!`,
    );*/

    return match;
   
  }
}