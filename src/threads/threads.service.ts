import {
    BadRequestException,
    HttpException,
    HttpService,
    HttpStatus,
    Inject,
    Injectable,
    NotFoundException
} from '@nestjs/common';
import {THREADS_FAVORITE_REPOSITORY, THREADS_NOT_WORK_REPOSITORY, THREADS_REPOSITORY} from "./threads.constants";
import {Thread} from "./entities/thread.entity";
import {CreateThreadDto} from "./dto/createThreadDto";
import {ForumsService} from "../forums/forums.service";
import {ThreadNotWork} from "./entities/threadNotWork";
import {User} from "../users/entities/user.enitiy";
import {ThreadFavorite} from "./entities/threadFavorite";

@Injectable()
export class ThreadsService {
    constructor(
        @Inject(THREADS_REPOSITORY) private threadsRepository: typeof Thread,
        @Inject(THREADS_NOT_WORK_REPOSITORY) private threadsNotWorkRepository: typeof ThreadNotWork,
        @Inject(THREADS_FAVORITE_REPOSITORY) private threadsFavoriteRepository: typeof ThreadFavorite,
        private forumsService: ForumsService,
        private httpService: HttpService,

    ) {
    }

    async create(createThreadDto: CreateThreadDto): Promise<Thread> {
        return this.threadsRepository.create(createThreadDto);
    }

    async findAll(options?: object): Promise<Thread[]> {
        return options !== null ? this.threadsRepository.findAll(options) : this.threadsRepository.findAll();
    }

    async findOrCreate(options: any): Promise<any> {
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

    async setThreadNotWork(thread: Thread, user: User) {
        const [threadNotWork, threadNotWorkCreated] = await this.threadsNotWorkRepository.findOrCreate({
            where: {
                threadId: thread.id,
                userId: user.id
            }
        })
        if (threadNotWorkCreated) {
            await thread.$add('not_works', threadNotWork);
        } else {
            throw new HttpException('U have already set this thread not work', HttpStatus.BAD_REQUEST)
        }
    }

    async removeThreadNotWork(thread: Thread, user: User) {
        const threadNotWork = await this.threadsNotWorkRepository.findOne({
            where: {
                threadId: thread.id,
                userId: user.id
            }
        })
        if (!threadNotWork) throw new NotFoundException();
        thread.$remove('not_works', threadNotWork);
        threadNotWork.destroy()
    }

    async addThreadToFavorite(thread: Thread, user: User) {
        const [threadFavorite, threadFavoriteCreated] = await this.threadsFavoriteRepository.findOrCreate({
            where: {
                threadId: thread.id,
                userId: user.id
            }
        })
        if (threadFavoriteCreated) {
            user.$add('favorite_threads', thread)
        } else {
            throw new BadRequestException('U have already add this thread to favorites')
        }
    }

    async removeThreadFromFavorite(thread: Thread, user: User) {
        const threadFavorite = await this.threadsFavoriteRepository.findOne({
            where: {
                threadId: thread.id,
                userId: user.id
            }
        })
        if (!threadFavorite) throw new NotFoundException();
        user.$remove('favorite_threads', thread)
        threadFavorite.destroy()
    }

    async sync(limit: number = 40) {
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
                        const [thread, threadCreated] = await this.threadsRepository.findOrCreate({
                            where: {
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
            } catch (e) {
                console.log(e);
            }
        }
    }
}
