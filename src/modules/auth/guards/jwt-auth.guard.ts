import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Thin wrapper around the Passport 'jwt' strategy.
 * Apply to any controller/route that requires a valid Bearer token.
 *
 * @example
 * \@UseGuards(JwtAuthGuard)
 * \@Get('profile')
 * getProfile() {}
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
