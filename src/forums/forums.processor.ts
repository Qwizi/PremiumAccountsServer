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
        this.logger.log(`Rozpoczynam zadanie ${job.id}`);
    }

    @Process()
    async syncThreads(job: Job<unknown>) {
        this.logger.log("Rozpoczynam synchronizacje for")
        await this.forumsService.sync();
        this.logger.log("Zakonczyłem synchronizacje for");
        return {}
    }
}