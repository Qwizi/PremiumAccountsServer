import {HttpModule, Module} from '@nestjs/common';
import {threadsFavoriteProviders, threadsNotWorkProviders, threadsProviders} from "./threads.providers";
import { ThreadsService } from './threads.service';
import {ForumsModule} from "../forums/forums.module";
import { ThreadsController } from './threads.controller';
import {ConfigModule} from "@nestjs/config";
import {ScheduleModule} from "@nestjs/schedule";
import {BullModule} from "@nestjs/bull";
import {ThreadsProcessor} from "./threads.processor";

@Module({
    imports: [
        ConfigModule.forRoot(),
        BullModule.registerQueue({
            name: 'threads'
        }),
        HttpModule,
        ForumsModule,
        ScheduleModule.forRoot(),
    ],
    providers: [
        ThreadsService,
        ThreadsProcessor,
        ...threadsProviders,
        ...threadsNotWorkProviders,
        ...threadsFavoriteProviders
    ],
    exports: [ThreadsService],
    controllers: [ThreadsController]
})
export class ThreadsModule {}
