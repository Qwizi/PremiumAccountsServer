import {THREADS_NOT_WORK_REPOSITORY, THREADS_REPOSITORY} from "./threads.constants";
import {Thread} from "./entities/thread.entity";
import {ThreadNotWork} from "./entities/threadNotWork";

export const threadsProviders = [
    {
        provide: THREADS_REPOSITORY,
        useValue: Thread
    }
]

export const threadsNotWorkProviders = [
    {
        provide: THREADS_NOT_WORK_REPOSITORY,
        useValue: ThreadNotWork
    }
]