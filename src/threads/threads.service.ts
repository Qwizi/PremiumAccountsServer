import {HttpException, HttpStatus, Injectable, Logger, NotFoundException,} from '@nestjs/common';
import {Thread} from "./entities/thread.entity";
import {CreateThreadDto} from "./dto/createThreadDto";
import {ForumsService} from "../forums/forums.service";
import {User} from "../users/entities/user.enitiy";
import {Cron, CronExpression} from "@nestjs/schedule";
import {InjectQueue} from "@nestjs/bull";
import {Job, Queue} from "bull";
import {InjectRepository} from "@nestjs/typeorm";
import {Like, Repository} from "typeorm";
import {InjectBrowser} from "nest-puppeteer";
import {Browser, Page} from "puppeteer";
import {MYBB_COOKIE_OBJ} from "../forums/forums.constants";
import {Forum} from "../forums/entities/forum.entitiy";
import {handle, openPageWithProxy} from "../app.uitils";
import {SearchThreadDto} from "./dto/searchThreadDto";
import {IPaginationOptions, paginate, Pagination} from "nestjs-typeorm-paginate";

@Injectable()
export class ThreadsService {
    private readonly logger = new Logger(ThreadsService.name);

    constructor(
        @InjectRepository(Thread) private threadsRepository: Repository<Thread>,
        @InjectQueue('threads') private threadsQueue: Queue,
        @InjectBrowser() private readonly browser: Browser,
        private forumsService: ForumsService
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

    async search(searchThreadDto: SearchThreadDto, options: IPaginationOptions): Promise<Pagination<Thread>> {
        return paginate<Thread>(this.threadsRepository, options, {
            where: {
                title: Like(`%${searchThreadDto.name}%`),
                is_visible: true
            },
            order: {
                updated_at: "DESC"
            },
            relations: ["favorite_users"]
        })
    }

    async sync(job: Job<unknown>, limit: number = 40) {

        const createPages = async (number: number) => {
            for (let i = 0; i <= number; i++) {
                await this.browser.newPage();
            }
        }

        const closePages = async () => {
            const pages = await this.browser.pages();
            pages.shift();
            for await (let page of pages) {
                await page.close();
            }
        }

        const getCreatedPages = async () => {
            const pages = await this.browser.pages();
            pages.shift();
            return pages;
        }

        const focusPagesAndScrapData = async (currentThreads: Thread[]) => {
            const createdPages = await getCreatedPages();

            for (let i = 0; i <= currentThreads.length; i++) {
                try {
                    if (currentThreads.length >= createdPages.length) {
                        const page = createdPages[i];
                        if (page) {
                            await createdPages[i].bringToFront();
                            const thread = currentThreads[i];
                            if (thread) {
                                let content_html = await getThreadContent(page, thread.url);
                                await updateThreadContent(thread, content_html);
                                this.logger.debug(`Thread [${thread.title}] -> [${thread.content_html}]`)
                            }

                        }
                        //await this.sleep(5000);
                    }
                } catch (e) {
                    const page = createdPages[i];
                    if (page !== undefined) {
                        await createdPages[i].close();
                    }
                }
            }
        }

        const getCurrentActionThreads = async (threads: Thread[], number: number = 15) => {
            return threads.slice(Math.max(threads.length - number, 0))
        }

        const removeCurrentActionThreads = async (threads: Thread[], currentThreads: Thread[]) => {
            return threads.filter(item => !currentThreads.includes(item))
        }

        const getMessageFromPost = async (page: Page, selector: string) => {
            return await page.evaluate((selector) => {
                const msg = document.querySelector(selector);
                return msg.textContent
            }, selector)
        }

        const getThreadContent = async (page: Page, url: string) => {
            try {
                const selector = "div.info_thx.message";
                const p = await openPageWithProxy(page, url);
                //await p.setCookie(MYBB_COOKIE_OBJ);
                //await p.goto(url);
                await p.waitForSelector(selector, {timeout: 5000});
                return getMessageFromPost(p, "div.info_thx.message");
            } catch (e) {
                try {
                    const selector = "div.post_body > div > div";
                    //await p.setCookie(MYBB_COOKIE_OBJ);
                    //await p.goto(url);
                    const p = await openPageWithProxy(page, url);
                    await p.waitForSelector(selector, {timeout: 5000});
                    return getMessageFromPost(p, "div.post_body > div > div");
                } catch (e) {
                    this.logger.debug(`Selector not found`)
                }
            }
        }

        const getThreadsWithoutContent = async (forum: Forum) => {
            let threads = await this.threadsRepository.find({
                where: {
                    forum: forum.id,
                    content_html: '',
                    is_visible: false
                }
            });
            this.logger.log(`(${forum.fid} - ${forum.title}) Ilosc: ${threads.length}`);
            return threads;
        }

        const fetchThreads = async (forum: Forum, limit: number) => {
            try {
                const epremki_url = `https://epremki.com/syndication.php?fid=${forum.fid}&type=json&limit=${limit}`;
                this.logger.log(`Zaczynam pobierac tematy z forum [${forum.title} | ${forum.fid}]`);
                const p = await this.browser.newPage();
                const page = await openPageWithProxy(p, epremki_url);
                await page.goto(epremki_url);
                const response = await page.evaluate(() => {
                    return JSON.parse(document.querySelector("body").innerText);
                });
                this.logger.log(`Ilosc pobranych tematow (${response.items.length})`);
                await page.close();
                this.logger.log(`Zakonczylem pobieranie tematow z forum [${forum.title} | ${forum.fid}]`);
                return response.items;
            } catch (e) {
                this.logger.error(e.message)
            }
        }

        const createThread = async (createThreadDto: CreateThreadDto, forum: Forum) => {
            try {
                const newThread = this.threadsRepository.create({
                    tid: createThreadDto.tid,
                    url: createThreadDto.url,
                    title: createThreadDto.title,
                    //content_html: content_html,
                    created_at: createThreadDto.created_at,
                    updated_at: createThreadDto.updated_at,
                    is_visible: false
                })

                await this.threadsRepository.save(newThread);

                const forumThreads = await forum.threads;
                forumThreads.push(newThread);

                await this.forumsService.save(forum);
                return newThread;
            } catch (e) {
                this.logger.error(e.message);
            }
        }

        const updateThreadContent = async (thread, content_html: string) => {
            thread.is_visible = true;
            thread.content_html = content_html;
            await this.threadsRepository.save(thread);
        }

        const createThreads = async (forums: Forum[], limit: number = 40) => {
            try {
                for await (let forum of forums) {
                    const threads = await fetchThreads(forum, limit);
                    if (threads.length > 0) {
                        for await (let thread of threads) {
                            if (!await this.threadsRepository.findOne({where: {tid: thread.id}})) {
                                const newThread = await createThread({
                                    tid: thread.id,
                                    url: thread.url,
                                    title: thread.title,
                                    //content_html: content_html,
                                    created_at: thread.created_at,
                                    updated_at: thread.updated_at,
                                    is_visible: false
                                }, forum)
                                const page = await this.browser.newPage();
                                await page.bringToFront();
                                let content_html = await getThreadContent(page, newThread.url);
                                await updateThreadContent(newThread, content_html);
                                this.logger.log(`Temat [${thread.title} | ${content_html}] zostal stworzony`)
                                await page.close();
                            } else {
                                this.logger.log(`Temat [${thread.title}] juz istnieje w naszej bazie`)
                            }
                        }
                    }
                }
            } catch (e) {
                this.logger.error(e.message);
            }
        }

        const openPages = async (forums: Forum[]) => {
            for await (let forum of forums) {
                let threads = await getThreadsWithoutContent(forum);
                if (threads.length > 0) {
                    let currentThreads = [];
                    while (threads.length > 0) {
                        if (threads.length >= 15) {
                            currentThreads = await getCurrentActionThreads(threads);
                            await createPages(currentThreads.length);
                            await focusPagesAndScrapData(currentThreads);
                            currentThreads = await removeCurrentActionThreads(threads, currentThreads);
                        } else {
                            currentThreads = threads
                            await createPages(threads.length);
                            await focusPagesAndScrapData(threads);
                            threads = [];
                        }
                    }
                }
            }
        }
        try {
            const forums = await this.forumsService.findAll();
            this.logger.log(`Ilosc dostepnych for (${forums.length})`);
            await job.progress(50);

            if (forums.length > 0) {
                await createThreads(forums, limit);
            }
        } catch (e) {
            this.logger.error(e.message);
        }
    }

    @Cron(CronExpression.EVERY_2_HOURS)
    async syncThreadsCron() {
        return this.addThreadsSyncToQueue();
    }
}
