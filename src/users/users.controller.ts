import { Controller, Get, Post, Put,Patch, Delete,Param, Query, Body, ParseIntPipe, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { user_role } from 'generated/prisma/enums';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}
    
    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    findAll(@Query('role') role?: user_role) {
    if (role) {
      return this.usersService.findAllByRole(role);
    }
    return this.usersService.findAll();
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.usersService.findOne(id);
    }

    @Get(':id/stadiums')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('owner')
    getUserStadiums(@Param('id', ParseIntPipe) id: number) {
        return this.usersService.getUserStadiums(id);
    }

    @Get(':id/matches')
    @UseGuards(JwtAuthGuard)
    getUserMatches(@Param('id', ParseIntPipe) id: number) {
        return this.usersService.getUserMatches(id);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserDto, @Req() req:any) {
        if (+req.user.id !== id)
            return { error: 'You can only update your own profile' };
        return this.usersService.update(id, dto);
    }

    @Patch(':id/password')
    @UseGuards(JwtAuthGuard)
    updatePassword(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePasswordDto, @Req() req:any) {
        if (+req.user.id !== id)
            return { error: 'You can only update your own password' };
        return this.usersService.updatePassword(id, dto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.usersService.delete(id);
    }    




}
