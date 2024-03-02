import { FeatureAuthModule } from '@app/feature-auth';
import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AuthMiddleware } from '@suryac72/api-core-services';
@Module({
  imports: [FeatureAuthModule],
  controllers: [],
  providers: [],
})
export class AuthModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes({ path: '/auth/all', method: RequestMethod.GET });
  }
}
