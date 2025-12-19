// src/matches/matches.controller.ts
import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Put, 
  Param, 
  Delete, 
  Query, 
  ParseIntPipe, 
  UseGuards, 
  Req 
} from '@nestjs/common';
import { MatchesService } from './matches.service';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UpdateMatchTeamDto } from 'src/match_teams/dto/update-match_team.dto';

@Controller('matches')
@UseGuards(JwtAuthGuard)
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Get()
  findAll(@Query() query: any) {
    return this.matchesService.findAll(query);
  }

  @Get('joined')
  getJoined(@Req() req) {
    return this.matchesService.getJoined(req.user.id);
  }

  @Get('created')
  myMatches(@Req() req) {
    return this.matchesService.getMyMatches(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.matchesService.findOne(id);
  }

  @Get(':id/teams')
  getTeams(@Param('id', ParseIntPipe) id: number) {
    return this.matchesService.getTeams(id);
  }

  @Get(':id/chat/participants')
  async getChatParticipants(@Param('id', ParseIntPipe) id: number) {
    return this.matchesService.getChatParticipants(id);
  }

  @Get('pending_requests')
  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles('owner')
  getPendingRequests(@Req() req) {
    return this.matchesService.getPendingRequests(req.user.id);
  }

  @Get('owner/matches')
  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles('owner')
  getOwnerMatches(@Req() req) {
    return this.matchesService.getMatchesForOwner(req.user.id);
  }


  @Post(':id/approve')
  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles('owner')
  approveRequest(@Param('id',ParseIntPipe) id: number, @Body() dto: UpdateMatchDto, @Req() req) {
    return this.matchesService.approveRequest(id, dto, req.user.id);
  }

  @Post(':id/reject')
  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles('owner')
  rejectRequest(@Param('id',ParseIntPipe) id: number, @Body() dto: UpdateMatchDto, @Req() req) {
    return this.matchesService.rejectRequest(id, dto, req.user.id);
  }


  @Post()
  @UseGuards(RolesGuard)
  @Roles('player')
  create(@Body() dto: CreateMatchDto, @Req() req) {
    return this.matchesService.createMatch(dto, req.user.id);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('owner')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMatchDto,
    @Req() req,
  ) {
    return this.matchesService.update(id, dto, req.user.id);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles('owner')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStatusDto,
  ) {
    return this.matchesService.updateStatus(id, dto);
  }

  @Delete(':id/leave')
  leave(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.matchesService.leaveMatch(id, req.user.id);
  }
}