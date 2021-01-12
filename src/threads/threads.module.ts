import {HttpModule, Module} from '@nestjs/common';
import { ThreadsService } from './threads.service';
import {ForumsModule} from "../forums/forums.module";
import { ThreadsController } from './threads.controller';
import {ConfigModule} from "@nestjs/config";
import {ScheduleModule} from "@nestjs/schedule";
import {BullModule} from "@nestjs/bull";
import {ThreadsProcessor} from "./threads.processor";
import {TypeOrmModule} from "@nestjs/typeorm";
import {Thread} from "./entities/thread.entity";
import {FavoriteThread} from "./entities/favoriteThread.entity";
import {ThreadNotWork} from "./entities/threadNotWork";

@Module({
    imports: [
        ConfigModule.forRoot(),
        BullModule.registerQueue({
            name: 'threads'
        }),
        HttpModule,
        ForumsModule,
        ScheduleModule.forRoot(),
        TypeOrmModule.forFeature([Thread, FavoriteThread, ThreadNotWork])
    ],
    providers: [
        ThreadsService,
        ThreadsProcessor
    ],
    exports: [ThreadsService],
    controllers: [ThreadsController]
})
export class ThreadsModule {}
