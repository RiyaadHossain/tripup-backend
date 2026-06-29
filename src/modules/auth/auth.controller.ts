import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
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
   *
   * Response:
   * {
   *   accessToken: string,
   *   user: { id, name, email, role, permissions[] }
   * }
   */
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  /**
   * GET /auth/me/permissions
   * Returns the current user's role and flat permissions list.
   * Intended for the frontend to drive can('module.action') checks.
   *
   * Example response:
   * { role: "Content Manager", permissions: ["services.read", "media.update"] }
   */
  @UseGuards(JwtAuthGuard)
  @Get('me/permissions')
  getMyPermissions(@Request() req: { user: JwtPayload }) {
    return this.authService.getMyPermissions(req.user);
  }
}
