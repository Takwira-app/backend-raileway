import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, Req } from '@nestjs/common';
import { MatchTeamsService } from './match_teams.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('teams')
@UseGuards(JwtAuthGuard)
export class MatchTeamsController {
  constructor(private readonly matchTeamsService: MatchTeamsService) {}

  @Get(':team_id')
  findOne(@Param('team_id',ParseIntPipe) team_id: number) {
    return this.matchTeamsService.findOne(team_id);
  }

  // Players
  
  @Get(':team_id/players')
  getTeamPlayers(@Param('team_id',ParseIntPipe) team_id: number) {
    return this.matchTeamsService.getPlayers(team_id);
  }

  @Delete(':team_id/players/:player_id')
  removePlayerFromTeam(
    @Param('team_id', ParseIntPipe) team_id: number,
    @Param('player_id', ParseIntPipe) player_id: number
  ) {
    return this.matchTeamsService.removePlayer(team_id, player_id);
  }


  @Post(':team_id/join')
  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles('player')
  joinTeam(@Param('team_id',ParseIntPipe) team_id: number,@Req() req) {
      return this.matchTeamsService.joinTeam(team_id, req.user.id);
    }

  @Post(':team_id/switch')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('player')
  async switchTeam(
    @Param('team_id', ParseIntPipe) team_id: number,
    @Req() req
  ) {
    return this.matchTeamsService.switchTeam(team_id, req.user.id);
  }  


  @Delete(':team_id/leave')
  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles('player')
  leave(@Param('team_id',ParseIntPipe) team_id: number,@Req() req) {
    return this.matchTeamsService.leaveTeam(team_id, req.user.id);
  }
}
