import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

/**
 * Validates the JWT on every protected request and attaches the decoded
 * payload to `request.user`.
 *
 * The full permissions array is embedded in the token at login time, so no
 * database lookup is needed here — keeping every authenticated request fast.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET ?? 'changeme',
    });
  }

  /** Called by Passport after signature validation. Return value becomes `req.user`. */
  validate(payload: JwtPayload): JwtPayload {
    return payload;
  }
}
