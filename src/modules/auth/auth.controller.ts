import { Body, Controller, Get, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /auth/register
   * Creates a new user account (no role assigned by default).
   * A Super Admin can later assign a role via PATCH /users/:id.
   */
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  /**
   * POST /auth/login
   * Authenticates the user and returns a signed JWT containing the user's
   * role and the full list of permission strings.
   */
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  /**
   * PATCH /auth/update-password
   * Allows a logged-in user to change their password and resets needPasswordChange.
   */
  @UseGuards(JwtAuthGuard)
  @Patch('update-password')
  updatePassword(@Request() req: { user: JwtPayload }, @Body() dto: UpdatePasswordDto) {
    return this.authService.updatePassword(req.user.sub, dto);
  }

  /**
   * POST /auth/forgot-password
   * Sends a password reset email if the account exists.
   */
  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  /**
   * POST /auth/reset-password
   * Resets the password using a valid token from the email.
   */
  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  /**
   * GET /auth/me/permissions
   * Returns the current user's role and flat permissions list.
   */
  @UseGuards(JwtAuthGuard)
  @Get('me/permissions')
  getMyPermissions(@Request() req: { user: JwtPayload }) {
    return this.authService.getMyPermissions(req.user);
  }
}
