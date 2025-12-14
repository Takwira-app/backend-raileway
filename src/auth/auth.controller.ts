// src/auth/auth.controller.ts
import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginUserDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GoogleAuthDto } from './dto/google-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginUserDto) {
    return this.authService.login(dto);
  }

  @Post('google')
  googleAuth(@Body() dto: GoogleAuthDto) {
    return this.authService.googleAuth(dto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  logout() {
    return this.authService.logout();
  }

  @Post('fcm-token')
  @UseGuards(JwtAuthGuard)
  updateFcmToken(@Req() req, @Body('fcmToken') fcmToken: string) {
    return this.authService.updateFcmToken(req.user.id, fcmToken);
  }

  @Post('firebase/custom-token')
  @UseGuards(JwtAuthGuard)
  async getFirebaseCustomToken(@Req() req) {
    return this.authService.getFirebaseCustomToken(req.user.id);
  }
}