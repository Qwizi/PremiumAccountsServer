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
import {PuppeteerModule} from "nest-puppeteer";
import {User} from "../users/entities/user.enitiy";

@Module({
    imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forFeature([Thread, User]),
        BullModule.registerQueue({
            name: 'threads'
        }),
        HttpModule,
        ForumsModule,
        ScheduleModule.forRoot(),
        PuppeteerModule.forRoot({
            headless: true
        })
    ],
    providers: [
        ThreadsService,
        ThreadsProcessor
    ],
    exports: [ThreadsService],
    controllers: [ThreadsController]
})
export class ThreadsModule {}
