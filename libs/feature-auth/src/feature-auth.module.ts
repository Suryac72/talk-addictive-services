import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthRepository } from './repo/auth.repository';
import { UserSignupUseCase } from './use-cases/signup-user/signup-user.use-case';
import { AuthMapper } from './mapper/auth.mapper';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import {
  AuthService,
  DomainService,
  JwtStrategy,
} from '@suryac72/api-core-services';
import { JwtModule } from '@nestjs/jwt';
import { UserLoginUseCase } from './use-cases/login-user/login-user.use-case';
import { UserLogoutUseCase } from './use-cases/signout-user/signout-user.use-case';

import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET_ID,
      signOptions: {
        expiresIn: process.env.JWT_TOKEN_EXPIRATION,
      },
    }),
    PassportModule,
  ],
  providers: [
    DomainService,
    AuthRepository,
    UserSignupUseCase,
    AuthMapper,
    PrismaClient,
    ConfigService,
    AuthService,
    UserLoginUseCase,
    UserLogoutUseCase,
    JwtStrategy,
  ],
  exports: [
    JwtStrategy, 
  ],
  controllers: [AuthController],
})
export class FeatureAuthModule {
  constructor() {
    console.log(process.env.JWT_SECRET);
  }
}
