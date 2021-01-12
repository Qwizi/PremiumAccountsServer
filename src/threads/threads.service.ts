import {
    HttpService,
    Injectable,
} from '@nestjs/common';
import {Thread} from "./entities/thread.entity";
import {CreateThreadDto} from "./dto/createThreadDto";
import {ForumsService} from "../forums/forums.service";
// import {ThreadNotWork} from "./entities/threadNotWork";
import {User} from "../users/entities/user.enitiy";
// import {ThreadFavorite} from "./entities/threadFavorite";
import {Cron, CronExpression} from "@nestjs/schedule";
import {InjectQueue} from "@nestjs/bull";
import {Queue} from "bull";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {Forum} from "../forums/entities/forum.entitiy";

@Injectable()
export class ThreadsService {
    constructor(
        @InjectRepository(Thread) private threadsRepository: Repository<Thread>,
        // @Inject(THREADS_NOT_WORK_REPOSITORY) private threadsNotWorkRepository: typeof ThreadNotWork,
        // @Inject(THREADS_FAVORITE_REPOSITORY) private threadsFavoriteRepository: typeof ThreadFavorite,
        @InjectQueue('threads') private threadsQueue: Queue,
        private forumsService: ForumsService,
        private httpService: HttpService,
    ) {
    }

    async create(createThreadDto: CreateThreadDto): Promise<Thread> {
        const thread = await this.threadsRepository.create(createThreadDto);
        await this.threadsRepository.save(thread);
        return thread
    }

    async findAll(options?: object): Promise<Thread[]> {
        return options !== null ? this.threadsRepository.find(options) : this.threadsRepository.find();
    }


    async findOne(options: object): Promise<Thread> {
        return this.threadsRepository.findOne(options);
    }

    async update(thread: Thread, createThreadDto: CreateThreadDto): Promise<Thread> {
        if (createThreadDto.tid) thread.tid = createThreadDto.tid;
        if (createThreadDto.title) thread.title = createThreadDto.title;
        if (createThreadDto.url) thread.url = createThreadDto.url;
        if (createThreadDto.content_html) thread.content_html = createThreadDto.content_html;

        return this.threadsRepository.save(thread);
    }

    async delete(thread: Thread): Promise<any> {
        return this.threadsRepository.delete(thread.id);
    }

    async setThreadNotWork(thread: Thread, user: User) {
        /*const [threadNotWork, threadNotWorkCreated] = await this.threadsNotWorkRepository.findOrCreate({
            where: {
                threadId: thread.id,
                userId: user.id
            }
        })
        if (threadNotWorkCreated) {
            await thread.$add('not_works', threadNotWork);
        } else {
            throw new HttpException('U have already set this thread not work', HttpStatus.BAD_REQUEST)
        }*/
    }

    async removeThreadNotWork(thread: Thread, user: User) {
        /*const threadNotWork = await this.threadsNotWorkRepository.findOne({
            where: {
                threadId: thread.id,
                userId: user.id
            }
        })
        if (!threadNotWork) throw new NotFoundException();
        thread.$remove('not_works', threadNotWork);
        threadNotWork.destroy()*/
    }

    async addThreadToFavorite(thread: Thread, user: User) {
        /*const [threadFavorite, threadFavoriteCreated] = await this.threadsFavoriteRepository.findOrCreate({
            where: {
                threadId: thread.id,
                userId: user.id
            }
        })
        if (threadFavoriteCreated) {
            user.$add('favorite_threads', thread)
        } else {
            throw new BadRequestException('U have already add this thread to favorites')
        }*/
    }

    async removeThreadFromFavorite(thread: Thread, user: User) {
        /*const threadFavorite = await this.threadsFavoriteRepository.findOne({
            where: {
                threadId: thread.id,
                userId: user.id
            }
        })
        if (!threadFavorite) throw new NotFoundException();
        user.$remove('favorite_threads', thread)
        threadFavorite.destroy()
         */
    }

    async addThreadsSyncToQueue(limit: number = 40) {
        await this.threadsQueue.add({
            limit: limit
        })
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
                        if (!await this.threadsRepository.findOne({where: {tid: threadItem.id}})) {
                            const newThread = this.threadsRepository.create({
                                tid: threadItem.id,
                                url: threadItem.url,
                                title: threadItem.title,
                                content_html: content_html,
                                created_at: threadItem.date_published,
                                updated_at: threadItem.date_modified
                            })
                            await this.threadsRepository.save(newThread);

                            const forumThreads = await forum.threads;
                            forumThreads.push(newThread);

                            await this.forumsService.save(forum);
                        }
                        /*const [thread, threadCreated] = await this.threadsRepository.findOrCreate({
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
                        }*/
                    }
                }
            } catch (e) {
                console.log(e);
            }
        }
    }

    @Cron(CronExpression.EVERY_2_HOURS)
    async syncThreadsCron() {
        await this.addThreadsSyncToQueue();
    }
}
