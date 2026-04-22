import { Controller, Post, Body, HttpCode, HttpStatus, UnauthorizedException, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser } from './current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() body: any) {
    return this.authService.login(body.email, body.password);
  }

  @Post('register')
  @UseGuards(JwtAuthGuard)
  register(@Body() body: any, @CurrentUser() user: any) {
    return this.authService.register(body, user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@CurrentUser() user: any) {
    return user;
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @Post('switch-tenant')
  switchTenant(@Body() body: any, @CurrentUser() user: any) {
    return this.authService.switchTenant(user.userId, body.targetTenantId);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @Post('return-to-root')
  returnToRoot(@CurrentUser() user: any) {
    return this.authService.returnToRoot(user.userId);
  }
}
