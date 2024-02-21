import { FeatureChatModule } from '@app/feature-chat';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AuthMiddleware } from '@suryac72/api-core-services';


@Module({
  imports: [FeatureChatModule],
  controllers: [],
  providers: [],
})
export class ChatModule {
    configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('*');
  }
}
