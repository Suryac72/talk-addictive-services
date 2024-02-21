import { FeatureAuthModule } from '@app/feature-auth';
import { Module } from '@nestjs/common';
@Module({
  imports: [FeatureAuthModule],
  controllers: [],
  providers: [],
})
export class AuthModule {}
