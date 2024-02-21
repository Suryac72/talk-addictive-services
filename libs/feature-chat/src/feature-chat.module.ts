import { Module } from '@nestjs/common';
import { FeatureChatService } from './feature-chat.service';
import { ChatController } from './chat.controller';

@Module({
  providers: [FeatureChatService],
  exports: [FeatureChatService],
  controllers:[ChatController]
})
export class FeatureChatModule {}
