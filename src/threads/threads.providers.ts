import {THREADS_FAVORITE_REPOSITORY, THREADS_NOT_WORK_REPOSITORY, THREADS_REPOSITORY} from "./threads.constants";
import {Thread} from "./entities/thread.entity";
import {ThreadNotWork} from "./entities/threadNotWork";
import {ThreadFavorite} from "./entities/threadFavorite";

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

export const threadsFavoriteProviders = [
    {
        provide: THREADS_FAVORITE_REPOSITORY,
        useValue: ThreadFavorite
    }
]