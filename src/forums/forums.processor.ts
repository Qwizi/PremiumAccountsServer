import {OnQueueActive, Process, Processor} from "@nestjs/bull";
import {Job} from "bull";
import {Logger} from "@nestjs/common";
import {ForumsService} from "./forums.service";

@Processor('forums')
export class ForumsProcessor {
    private readonly logger = new Logger(ForumsProcessor.name);
    constructor(private readonly forumsService: ForumsService) {}

    @OnQueueActive()
    onActive(job: Job) {
        console.log(
            `Processing job ${job.id} of type ${job.name} with data ${job.data}...`,
        );
    }

    @Process()
    async syncThreads(job: Job<unknown>) {
        this.logger.log("Start sync forums")
        await this.forumsService.sync();
        this.logger.log("End sync forums")
        return {}
    }
}