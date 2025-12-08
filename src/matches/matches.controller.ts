import { Controller, Get, Post, Body, Patch,Put, Param, Delete, Query, ParseIntPipe, UseGuards, Req, Request } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { MatchTeamsService } from 'src/match_teams/match_teams.service';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { CreateMatchTeamDto } from 'src/match_teams/dto/create-match_team.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { AuthGuard } from '@nestjs/passport';
import { UpdateMatchTeamDto } from 'src/match_teams/dto/update-match_team.dto';

@Controller('matches')
@UseGuards(JwtAuthGuard)
export class MatchesController {
  constructor(private readonly service: MatchesService
    ,private readonly matchTeamsService: MatchTeamsService
  ) {}


  @Get()
  findAll(@Query() query: any) {
    return this.service.findAll(query);
  }

  @Get('joined')
  getJoined(@Req() req) {
    console.log('User ID type:', typeof req.user.id, 'Value:', req.user.id);
    return this.service.getJoined(req.user.id);
  }

  @Get('created')
  myMatches(@Req() req) {
    return this.service.getMyMatches(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id',ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  
  @Get(':id/teams')
  getTeams(@Param('id',ParseIntPipe) id: number) {
    return this.service.getTeams(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles('player')
  createMatch(@Body() dto: CreateMatchDto,@Request() req) {
    console.log("REQ USER:", req.user);
    return this.service.create(dto, req.user.id);
  }



  @Put(':id')
  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles('owner')
  update(@Param('id',ParseIntPipe) id: number, @Body() dto: UpdateMatchDto,@Req() req) {
    return this.service.update(id, dto, req.user.id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles('owner')
  updateStatus(@Param('id',ParseIntPipe) id: number, @Body() dto: UpdateStatusDto) {
    return this.service.updateStatus(id, dto);
  }


  @Delete(':id/leave')
  leave(@Param('id',ParseIntPipe) id: number,@Req() req) {
    return this.service.leaveMatch(id, req.user.id);
  }



}
