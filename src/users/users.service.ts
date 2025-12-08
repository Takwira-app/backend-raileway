import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from '../auth/dto/login.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { ConflictException, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { user_role } from 'generated/prisma/enums';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService,
        private authService: AuthService,
    ) {}


    async findAll() { 
    const users = await this.prisma.users.findMany({
      select: {
        user_id: true,
        name: true,
        email: true,
        role: true,
      },
        });
        return users;
    }

    async findAllByRole(role?: user_role) {
        return this.prisma.users.findMany({
            where: role ? { role } : {},
            select: { user_id: true, name: true, email: true, role: true},
        });
    }

    findOne(user_id: number) {
        return this.prisma.users.findUnique({
            where: { user_id },
        });
    }

    async getUserStadiums(user_id: number) {
        const user = await this.findOne(user_id);

        if (!user) throw new NotFoundException('User not found');

        if (user.role !== 'owner') {
          throw new BadRequestException('Only owners can have stadiums');
        }

        return this.prisma.stadiums.findMany({ where: { owner_id: user_id } });

    }

    async getUserMatches(user_id: number) {
        
        const user = await this.findOne(user_id);
        if (!user) throw new NotFoundException('User not found');
        
        if (user.role === 'player') {
            return this.prisma.matches.findMany({
            where: {
                match_teams: {
                some: {
                    team_players: {
                    some: { player_id: user_id }
                    }
                }     
                }
            },
            include: { stadiums: true },
            });
        } return this.prisma.matches.findMany({
            where: { creator_id: user_id },
            include: { stadiums: true },
            }); 
    }

    async update(user_id: number, dto: UpdateUserDto) {
        const user = await this.findOne(user_id);

        const forbiddenFields = ['password', 'password_hash', 'role'];
        forbiddenFields.forEach(field => {
        if (dto[field]) {
            throw new ForbiddenException(`You cannot update '${field}'`);
        }
        });

        if (dto.email) {
            const exists = await this.prisma.users.findUnique({
            where: { email: dto.email },
        });

        if (exists && exists.user_id !== user_id) {
            throw new ConflictException('Email already in use');
        }
        }
        return this.prisma.users.update({
        where: { user_id },
        data: dto,
        });
    }

    async updatePassword(user_id: number, dto: UpdatePasswordDto) {
        const user = await this.prisma.users.findUnique({
        where: { user_id },
        });

        if (!user) {
        throw new NotFoundException(`User with ID ${user_id} not found`);
        }

        // Vérifier l'ancien mot de passe
        const valid = await bcrypt.compare(dto.currentPassword, user.password_hash);

        if (!valid) {
        throw new ForbiddenException('Current password is incorrect');
        }

        // Hasher le nouveau mot de passe
        const newHash = await bcrypt.hash(dto.newPassword, 10);
        await this.prisma.users.update({
        where: { user_id },
        data: { password_hash: newHash },
        });

        return { message: 'Password updated successfully' };
    }

    delete(user_id: number) {
        return this.prisma.users.delete({
            where: { user_id },
        });
    }
}
