import {Controller, Post} from '@nestjs/common';
import {ThreadsService} from "./threads.service";

@Controller('threads')
export class ThreadsController {
    constructor(private threadsService: ThreadsService) {}

    @Post('sync')
    async sync() {
        return this.threadsService.sync();
    }
}
