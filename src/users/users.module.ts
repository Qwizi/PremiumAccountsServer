import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import {usersProviders} from "./users.providers";

@Module({
  exports: [UsersService],
  providers: [UsersService, ...usersProviders]
})
export class UsersModule {}
