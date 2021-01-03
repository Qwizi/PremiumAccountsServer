import { Module } from '@nestjs/common';
import { ForumsService } from './forums.service';
import { ForumsController } from './forums.controller';
import {forumsProviders} from "./forums.providers";
import {AuthModule} from "../auth/auth.module";

@Module({
  imports: [AuthModule],
  providers: [ForumsService, ...forumsProviders],
  controllers: [ForumsController]
})
export class ForumsModule {}
