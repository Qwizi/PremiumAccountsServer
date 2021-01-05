import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import {usersProviders} from "./users.providers";
import { UsersController } from './users.controller';

@Module({
  exports: [UsersService],
  providers: [UsersService, ...usersProviders],
  controllers: [UsersController]
})
export class UsersModule {}
