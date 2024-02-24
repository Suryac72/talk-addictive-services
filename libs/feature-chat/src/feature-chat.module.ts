import { Module } from '@nestjs/common';
import { FeatureChatService } from './feature-chat.service';
import { ChatController } from './chat.controller';
import {AuthMiddleware, JwtStrategy } from '@suryac72/api-core-services';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';


@Module({
  imports:[],
  providers: [
    FeatureChatService,
    AuthMiddleware,
    JwtStrategy,
    JwtService,
    PrismaClient,
  ],
  exports: [JwtStrategy],
  controllers: [ChatController],
})
export class FeatureChatModule {}
