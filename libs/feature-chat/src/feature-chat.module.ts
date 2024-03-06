import { Global, Logger, Module } from '@nestjs/common';
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
import { SendMessageUseCase } from './use-cases/send-message/send-message.use-case';
import { FindAllMessageUseCase } from './use-cases/find-all-message/find-all-message.use-case';
import { AddToGroupChatUseCase } from './use-cases/add-to-group-chat/add-to-group-chat.use-case';
import { RemoveUserFromGroupUseCase } from './use-cases/remove-from-group-chat/remove-from-group-chat.use-case';
import { RenameGroupChatUseCase } from './use-cases/rename-group-chat/rename-group-chat.use-case';
import { CreateGroupChatUseCase } from './use-cases/create-group-chat/create-group-chat.use-case';
import { MessageController } from './message.controller';
import { MessageMapper } from './mapper/message.mapper';

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
    ChatGateway,
    SendMessageUseCase,
    FindAllMessageUseCase,
    AddToGroupChatUseCase,
    RemoveUserFromGroupUseCase,
    RenameGroupChatUseCase,
    CreateGroupChatUseCase,
    Logger,
    MessageMapper
  ],
  exports: [JwtStrategy],
  controllers: [ChatController,MessageController],
})
export class FeatureChatModule {}
