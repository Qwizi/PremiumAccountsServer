import { Module } from '@nestjs/common';
import {threadsProviders} from "./threads.providers";
import { ThreadsService } from './threads.service';

@Module({
    providers: [ThreadsService, ...threadsProviders, ]
})
export class ThreadsModule {}
