// src/stadiums/stadiums.controller.ts
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
  Req,
} from '@nestjs/common';
import { StadiumsService } from './stadiums.service';
import { CreateStadiumDto } from './dto/create-stadium.dto';
import { UpdateStadiumDto } from './dto/update-stadium.dto';
import { UpdateStadiumStatusDto } from './dto/update-stadium-status.dto';
import { UpdateStadiumPhotosDto } from './dto/update-stadium-photos.dto';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('stadiums')
@UseGuards(JwtAuthGuard)
export class StadiumsController {
  constructor(private readonly stadiumsService: StadiumsService) {}

  @Get()
  findAll(@Query() query: any) {
    return this.stadiumsService.findAll(query);
  }

  @Get('myStadiums')
  @UseGuards(RolesGuard)
  @Roles('owner')
  getMyStadiums(@Req() req) {
    return this.stadiumsService.getMyStadiums(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.stadiumsService.findOne(id);
  }

  @Get(':stadium_id/availability')
  getAvailability(@Param('stadium_id', ParseIntPipe) stadium_id: number) {
    return this.stadiumsService.getAvailability(stadium_id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('owner')
  create(@Body() createStadiumDto: CreateStadiumDto, @Req() req) {
    return this.stadiumsService.create(createStadiumDto, req.user.id);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('owner')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStadiumDto: UpdateStadiumDto,
    @Req() req,
  ) {
    return this.stadiumsService.update(id, updateStadiumDto, req.user.id);
  }

  @Put(':id/photos')
  @UseGuards(RolesGuard)
  @Roles('owner')
  async updateStadiumPhotos(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePhotosDto: UpdateStadiumPhotosDto,
    @Req() req,
  ) {
    return this.stadiumsService.updatePhotos(
      id,
      updatePhotosDto.photos,
      req.user.id,
    );
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles('owner')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStadiumStatusDto,
    @Req() req,
  ) {
    return this.stadiumsService.updateStatus(id, dto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('owner')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.stadiumsService.remove(id, req.user.id);
  }
}