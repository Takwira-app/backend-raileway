// src/auth/auth.service.ts
import { 
  Injectable, 
  UnauthorizedException, 
  ConflictException, 
  BadRequestException 
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginUserDto } from './dto/login.dto';
import { GoogleAuthDto } from './dto/google-auth.dto';
import * as admin from 'firebase-admin';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  /**
   * Traditional email/password registration
   */
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

  /**
   * Traditional email/password login
   */
  async login(dto: LoginUserDto) {
    const user = await this.prisma.users.findUnique({
      where: { email: dto.email },
    });

    if (!user) throw new UnauthorizedException('Invalid credentials');

    // Check if user registered with Google (no password)
    if (user.google_id && !user.password_hash) {
      throw new UnauthorizedException('Please sign in with Google');
    }

    // Check if password exists (for users registered before nullable password_hash)
    if (!user.password_hash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(dto.password, user.password_hash);

    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const token = this.signToken(user.user_id, user.role);

    return { user, token };
  }

  /**
   * Google OAuth login/registration
   */
  async googleAuth(dto: GoogleAuthDto) {
    try {
      // Verify the Firebase ID token
      const decodedToken = await admin.auth().verifyIdToken(dto.idToken);
      
      const { uid, email, name } = decodedToken;

      if (!email) {
        throw new BadRequestException('Email not provided by Google');
      }

      // Check if user exists
      let user = await this.prisma.users.findUnique({
        where: { email },
      });

      if (user) {
        // Existing user - update google_id if not set
        if (!user.google_id) {
          user = await this.prisma.users.update({
            where: { user_id: user.user_id },
            data: { google_id: uid },
          });
        }
      } else {
        // New user - role is required
        if (!dto.role) {
          throw new BadRequestException('Role is required for new users');
        }

        // Create new user
        user = await this.prisma.users.create({
          data: {
            name: name || email.split('@')[0],
            email,
            google_id: uid,
            role: dto.role,
            password_hash: null, // No password for Google auth
          },
        });
      }

      const token = this.signToken(user.user_id, user.role);

      return { user, token };
    } catch (error) {
      console.error('Google Auth Error:', error);
      
      if (error.code === 'auth/id-token-expired') {
        throw new UnauthorizedException('Token expired');
      }
      if (error.code === 'auth/argument-error') {
        throw new UnauthorizedException('Invalid token format');
      }
      
      // Re-throw if it's already a NestJS exception
      if (error instanceof BadRequestException || error instanceof UnauthorizedException) {
        throw error;
      }
      
      throw new UnauthorizedException('Invalid Google token');
    }
  }

  /**
   * Update FCM token for push notifications
   */
  async updateFcmToken(userId: number, fcmToken: string) {
    return this.prisma.users.update({
      where: { user_id: userId },
      data: { fcm_token: fcmToken },
    });
  }

  /**
   * Get Firebase custom token for chat authentication
   */
  async getFirebaseCustomToken(userId: number) {
    try {
      const customToken = await admin.auth().createCustomToken(userId.toString());
      return { customToken };
    } catch (error) {
      console.error('Custom token error:', error);
      throw new UnauthorizedException('Failed to create custom token');
    }
  }

  /**
   * Sign JWT token
   */
  signToken(userId: number, role: string) {
    const payload = { 
      sub: userId, 
      id: userId,  // Add 'id' for compatibility with req.user.id
      role 
    };
    const token = this.jwt.sign(payload);
    return { access_token: token };
  }

  /**
   * Logout (client-side only for JWT)
   */
  logout() {
    return { message: 'Logout successful. Please remove token from client.' };
  }
}