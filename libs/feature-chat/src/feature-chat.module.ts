import { Module } from '@nestjs/common';
import { FeatureChatService } from './feature-chat.service';
import { ChatController } from './chat.controller';
import {AuthMiddleware, DomainService, JwtStrategy } from '@suryac72/api-core-services';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';
import { FindAllChatUseCase } from './use-cases/find-all-chats/find-all-chats.use-case';
import { ChatRepository } from './repo/chat.repository';
import { ChatMapper } from './mapper/chat.mapper';
import { FindOneChatUseCase } from './use-cases/find-one-chat/find-one-chat.use-case';


@Module({
  imports:[],
  providers: [
    FeatureChatService,
    AuthMiddleware,
    JwtStrategy,
    JwtService,
    PrismaClient,
    FindAllChatUseCase,
    DomainService,
    ChatRepository,
    ChatMapper,
    FindOneChatUseCase,
    AuthMiddleware
  ],
  exports: [JwtStrategy],
  controllers: [ChatController],
})
export class FeatureChatModule {}
