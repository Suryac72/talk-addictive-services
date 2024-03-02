import { Global, Module } from '@nestjs/common';
import { FeatureChatService } from './feature-chat.service';
import { ChatController } from './chat.controller';
import { AuthMiddleware, COOKIE_NAME, DomainService, JwtStrategy } from '@suryac72/api-core-services';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';
import { ChatRepository } from './repo/chat.repository';
import { ChatMapper } from './mapper/chat.mapper';
import { FindOneChatUseCase } from './use-cases/find-one-chat/find-one-chat.use-case';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatSchema } from './models/chat.schema';
import { MessageSchema } from './models/message.schema';
import { UserSchema } from './models/user.schema';
import { SaveChatUseCase } from './use-cases/save-chat/save-chat.use-case';
import { UserService } from './services/user.service';
import { MessageRepository } from './repo/message.repository';
import { ChatGateway } from './services/chat.gateway';

@Global()
@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_DB_URL, {
      dbName: COOKIE_NAME,
    }),
    MongooseModule.forFeature([{ name: 'Chat', schema: ChatSchema }]),
    MongooseModule.forFeature([{ name: 'Message', schema: MessageSchema }]),
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
  ],
  providers: [
    FeatureChatService,
    AuthMiddleware,
    JwtStrategy,
    JwtService,
    PrismaClient,
    DomainService,
    ChatRepository,
    ChatMapper,
    FindOneChatUseCase,
    AuthMiddleware,
    SaveChatUseCase,
    UserService,
    MessageRepository,
    ChatGateway
  ],
  exports: [JwtStrategy],
  controllers: [ChatController],
})
export class FeatureChatModule {}
