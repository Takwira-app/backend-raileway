import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginUserDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.users.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Email already exists');
    const hashed = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.users.create({
      data: {
        name: dto.name,
        email: dto.email,
        password_hash: hashed,
        role: dto.role,
      },
    });

    return this.signToken(user.user_id, user.role);
  }

  async login(dto: LoginUserDto) {
    const user = await this.prisma.users.findUnique({
      where: { email: dto.email },
    });

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.password_hash);

    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const token = this.signToken(user.user_id, user.role)

    return {user,token} ;
  }

  signToken(userId: number, role: string) {
    const payload = { sub: userId, role };

    const token = this.jwt.sign(payload);

    

    return { access_token: token  };
  }
}