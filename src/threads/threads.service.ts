import {Inject, Injectable} from '@nestjs/common';
import {THREADS_REPOSITORY} from "./threads.constants";
import {Thread} from "./entities/thread.entity";
import {CreateThreadDto} from "./dto/createThreadDto";

@Injectable()
export class ThreadsService {
    constructor(@Inject(THREADS_REPOSITORY) private threadsRepository: typeof Thread) {}

    async create(createThreadDto: CreateThreadDto): Promise<Thread> {
        return this.threadsRepository.create(createThreadDto);
    }

    async findAll(options?: object): Promise<Thread[]> {
        return options !== null ? this.threadsRepository.findAll(options) : this.threadsRepository.findAll();
    }

    async findOne(options: object): Promise<Thread> {
        return this.threadsRepository.findOne(options);
    }

    async update(thread: Thread, createThreadDto: CreateThreadDto): Promise<Thread> {
        await thread.update(createThreadDto)
        return thread;
    }

    async remove(thread: Thread): Promise<any> {
        return thread.destroy()
    }

    async incrementNotWork(thread: Thread) {
        await thread.increment('not_work_count', {by: 1})
    }

    async decrementNotWork(thread: Thread) {
        await thread.decrement('not_work_count', {by: 1})
    }

}
