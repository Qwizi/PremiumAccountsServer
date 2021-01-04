import {HttpService, Inject, Injectable} from '@nestjs/common';
import {THREADS_REPOSITORY} from "./threads.constants";
import {Thread} from "./entities/thread.entity";
import {CreateThreadDto} from "./dto/createThreadDto";
import {ForumsService} from "../forums/forums.service";

@Injectable()
export class ThreadsService {
    constructor(
        @Inject(THREADS_REPOSITORY) private threadsRepository: typeof Thread,
        private forumsService: ForumsService,
        private httpService: HttpService
    ) {}

    async create(createThreadDto: CreateThreadDto): Promise<Thread> {
        return this.threadsRepository.create(createThreadDto);
    }

    async findAll(options?: object): Promise<Thread[]> {
        return options !== null ? this.threadsRepository.findAll(options) : this.threadsRepository.findAll();
    }

    async findOrCreate(options: any ): Promise<any> {
        return this.threadsRepository.findOrCreate(options)
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

    async sync(limit: number = 15) {
        const forums = await this.forumsService.findAll();
        for (let forum of forums) {
            try {
                const response = await this.httpService.get(`
https://epremki.com/syndication.php?fid=${forum.fid}&type=json&limit=${limit}`, {
                    headers: {
                        Cookie: `mybbuser=${process.env.MYBB_COOKIE};`
                    }
                }).toPromise()
                if (response.data.items.length > 0) {
                    for (let threadItem of response.data.items) {
                        const content_html = threadItem.content_html.replace(/<[^>]*>?/gm, "").replace(/Odkryta zawartość:/gm, "");
                        const [thread, threadCreated] = await this.threadsRepository.findOrCreate({where: {
                                tid: threadItem.id
                            },
                            defaults: {
                                url: threadItem.url,
                                title: threadItem.title,
                                content_html: content_html,
                                createdAt: threadItem.date_published,
                                updatedAt: threadItem.date_modified
                            }
                        })
                        if (threadCreated) {
                            forum.$add('threads', thread);
                        }
                    }
                }
            }
            catch (e) {
                console.log(e);
            }
        }
    }
}
