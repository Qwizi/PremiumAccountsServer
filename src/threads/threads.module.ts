import {HttpModule, Module} from '@nestjs/common';
import {threadsProviders} from "./threads.providers";
import { ThreadsService } from './threads.service';
import {ForumsModule} from "../forums/forums.module";
import { ThreadsController } from './threads.controller';

@Module({
    imports: [
        HttpModule,
        ForumsModule
    ],
    providers: [ThreadsService, ...threadsProviders, ],
    exports: [ThreadsService],
    controllers: [ThreadsController]
})
export class ThreadsModule {}
