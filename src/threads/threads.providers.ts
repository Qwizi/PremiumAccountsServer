import {THREADS_REPOSITORY} from "./threads.constants";
import {Thread} from "./entities/thread.entity";

export const threadsProviders = [
    {
        provide: THREADS_REPOSITORY,
        useValue: Thread
    }
]