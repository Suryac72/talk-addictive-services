import { NestFactory } from '@nestjs/core';
import { ChatModule } from './chat.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(ChatModule,{cors:true});
  await app.listen(3401);
}
bootstrap();
