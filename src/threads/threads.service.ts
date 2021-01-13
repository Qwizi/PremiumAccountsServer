import {
    HttpException,
    HttpService, HttpStatus,
    Injectable, NotFoundException,
} from '@nestjs/common';
import {Thread} from "./entities/thread.entity";
import {CreateThreadDto} from "./dto/createThreadDto";
import {ForumsService} from "../forums/forums.service";
import {User} from "../users/entities/user.enitiy";
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
        // Szuakmy czy temat nie zostal juz przypadkiem zgloszony przez tego uzytkownika
        if (thread.not_work_users.find(item => item.id === user.id)) {
            throw new HttpException('U have already set this thread not work', HttpStatus.BAD_REQUEST)
        }
        thread.not_work_users.push(user);
        await this.threadsRepository.save(thread);
        return thread
    }

    async removeThreadNotWork(thread: Thread, user: User) {
        if (!thread.not_work_users.find(item => item.id === user.id)) {
            throw new NotFoundException();
        }
        thread.not_work_users = thread.not_work_users.filter(u => u.id !== user.id);
        await this.threadsRepository.save(thread);
        return thread;
    }

    async addThreadToFavorite(thread: Thread, user: User) {
       if (thread.favorite_users.find(item => item.id === user.id)) {
           throw new HttpException('U have already added this thread to favorites', HttpStatus.BAD_REQUEST)
       }
       thread.favorite_users.push(user);
       await this.threadsRepository.save(thread);
       return thread;
    }

    async removeThreadFromFavorite(thread: Thread, user: User) {
        if (!thread.favorite_users.find(item => item.id === user.id)) {
            throw new NotFoundException();
        }
        thread.favorite_users = thread.favorite_users.filter(u => u.id !== user.id);
        await this.threadsRepository.save(thread);
        return thread;
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
