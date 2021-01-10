import {OnQueueActive, Process, Processor} from "@nestjs/bull";
import {Job} from "bull";
import {Logger} from "@nestjs/common";
import {ThreadsService} from "./threads.service";

@Processor('threads')
export class ThreadsProcessor {
    private readonly logger = new Logger(ThreadsProcessor.name);
    constructor(private readonly threadsService: ThreadsService) {}

    @OnQueueActive()
    onActive(job: Job) {
        console.log(
            `Processing job ${job.id} of type ${job.name} with data ${job.data}...`,
        );
    }

    @Process()
    async syncThreads(job: Job<unknown>) {
        this.logger.log("Job starting")
        await this.threadsService.sync();
        this.logger.log("Job ending")
        return {}
    }
}