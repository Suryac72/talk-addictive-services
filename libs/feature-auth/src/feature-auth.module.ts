import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthRepository } from './repo/auth.repository';
import { UserSignupUseCase } from './use-cases/signup-user/signup-user.use-case';
import { AuthMapper } from './mapper/auth.mapper';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import {
  AuthService,
  COOKIE_NAME,
  DomainService,
  JwtStrategy,
  QueryBuilder,
} from '@suryac72/api-core-services';
import { JwtModule } from '@nestjs/jwt';
import { UserLoginUseCase } from './use-cases/login-user/login-user.use-case';
import { UserLogoutUseCase } from './use-cases/signout-user/signout-user.use-case';

import { PassportModule } from '@nestjs/passport';
import { FindAllUsersUseCase } from './use-cases/find-all-users/find-all-users.use-case';
import { ChatSchema } from '@app/feature-chat/models/chat.schema';
import { MessageSchema } from '@app/feature-chat/models/message.schema';
import { UserSchema } from '@app/feature-chat/models/user.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET_ID,
      signOptions: {
        expiresIn: process.env.JWT_TOKEN_EXPIRATION,
      },
    }),
    MongooseModule.forRoot(process.env.MONGO_DB_URL, {
      dbName: COOKIE_NAME,
    }),
    MongooseModule.forFeature([{ name: 'Chat', schema: ChatSchema }]),
    MongooseModule.forFeature([{ name: 'Message', schema: MessageSchema }]),
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
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
    QueryBuilder,
    FindAllUsersUseCase
  ],
  exports: [
    JwtStrategy, 
  ],
  controllers: [AuthController],
})
export class FeatureAuthModule {
  constructor() {
  }
}
