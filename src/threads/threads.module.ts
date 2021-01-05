import {HttpModule, Module} from '@nestjs/common';
import {threadsFavoriteProviders, threadsNotWorkProviders, threadsProviders} from "./threads.providers";
import { ThreadsService } from './threads.service';
import {ForumsModule} from "../forums/forums.module";
import { ThreadsController } from './threads.controller';
import {ConfigModule} from "@nestjs/config";

@Module({
    imports: [
        ConfigModule.forRoot(),
        HttpModule,
        ForumsModule
    ],
    providers: [
        ThreadsService,
        ...threadsProviders,
        ...threadsNotWorkProviders,
        ...threadsFavoriteProviders
    ],
    exports: [ThreadsService],
    controllers: [ThreadsController]
})
export class ThreadsModule {}
