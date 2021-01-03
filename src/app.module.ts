import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import {ConfigModule} from "@nestjs/config";
import { ForumsModule } from './forums/forums.module';

@Module({
  imports: [ConfigModule.forRoot({isGlobal: true}), DatabaseModule, UsersModule, AuthModule, ForumsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
