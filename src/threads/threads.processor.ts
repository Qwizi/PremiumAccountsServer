import {OnQueueActive, Process, Processor} from "@nestjs/bull";
import {Job} from "bull";
import {Logger} from "@nestjs/common";
import {ThreadsService} from "./threads.service";

@Processor('threads')
export class ThreadsProcessor {
    private readonly logger = new Logger(ThreadsProcessor.name);
    constructor(private readonly threadsService: ThreadsService) {}

    @Process()
    async syncThreads(job: Job<unknown>) {
        await job.progress(10);
        this.logger.log("Rozpoczynam synchornizacje tematow");
        await this.threadsService.sync(job);
        await job.progress(100);
        this.logger.log("Zakonczylem synchornizacje tematow");
        return {}
    }
}