import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import {
  ExtractJwt,
  Strategy,
  StrategyOptions,
  JwtFromRequestFunction,
} from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    const jwtFromRequest: JwtFromRequestFunction =
      ExtractJwt.fromAuthHeaderAsBearerToken();

    const options: StrategyOptions = {
      jwtFromRequest,
      secretOrKey: process.env.JWT_SECRET as string,
    };

    super(options);
  }

  validate(payload: { sub: string; email?: string }) {
    return {
      id: payload.sub,
      email: payload.email,
    };
  }
}
