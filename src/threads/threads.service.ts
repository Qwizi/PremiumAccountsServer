import {HttpException, HttpService, HttpStatus, Injectable, Logger, NotFoundException,} from '@nestjs/common';
import {Thread} from "./entities/thread.entity";
import {CreateThreadDto} from "./dto/createThreadDto";
import {ForumsService} from "../forums/forums.service";
import {User} from "../users/entities/user.enitiy";
import {Cron, CronExpression} from "@nestjs/schedule";
import {InjectQueue} from "@nestjs/bull";
import {Queue} from "bull";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {InjectBrowser} from "nest-puppeteer";
import {Browser, Page} from "puppeteer";
import {MYBB_COOKIE_OBJ} from "../forums/forums.constants";
import {Forum} from "../forums/entities/forum.entitiy";

@Injectable()
export class ThreadsService {
    private readonly logger = new Logger(ThreadsService.name);

    constructor(
        @InjectRepository(Thread) private threadsRepository: Repository<Thread>,
        @InjectQueue('threads') private threadsQueue: Queue,
        @InjectBrowser() private readonly browser: Browser,
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

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async getThreadContent(page: Page, url: string) {
        await page.setCookie(MYBB_COOKIE_OBJ);
        await page.goto(url);

        try {
            const thxInfoMsgSelectors = "div.info_thx.message";
            await page.waitForSelector(thxInfoMsgSelectors)
            return await page.evaluate((thxInfoMsgSelectors) => {
                const msg = document.querySelector(thxInfoMsgSelectors);
                return msg.textContent
            }, thxInfoMsgSelectors)
        } catch (e) {
            const postBodySelectors = "div.post_body > div > div";
            await page.waitForSelector(postBodySelectors)
            return await page.evaluate((postBodySelectors) => {
                const msg = document.querySelector(postBodySelectors);
                return msg.textContent
            }, postBodySelectors)
        }
    }

    async createPages(currentUrls: Thread[]) {
        for await (let url of currentUrls) {
            // Otwieramy 5 nowych kart
            await this.browser.newPage();
        }
        // Pobieramy otwarte karty
        let pagesCreated = await this.browser.pages();
        // Usuwaamy pierwsza karte, poniewaz przegladarka musi byc otwarta
        pagesCreated.shift();

        this.logger.debug(`Utworzonych stron ${pagesCreated.length}`)

        for (let i = 0; i <= currentUrls.length; i++) {
            try {
                if (currentUrls.length >= pagesCreated.length) {
                    const page = pagesCreated[i];
                    if (page) {
                        await pagesCreated[i].bringToFront();
                        const thread = currentUrls[i];
                        if (thread) {
                            let content_html = await this.getThreadContent(pagesCreated[i], currentUrls[i].url);
                            thread.is_visible = true;
                            thread.content_html = content_html;
                            await this.threadsRepository.save(thread);
                            this.logger.debug(`Thread content ${thread.content_html}`)
                        }

                    }
                    //await this.sleep(5000);
                }
            } catch (e) {
                const page = pagesCreated[i];
                if (page !== undefined) {
                    await pagesCreated[i].close();
                }
            }
        }

        return pagesCreated;
    }

    async getThreadsToScrappContent(forum: Forum) {
        let items = await this.threadsRepository.find({where: {forum: forum.id, content_html: '', is_visible: false}});
        this.logger.debug(`(${forum.fid} - ${forum.title}) Ilosc: ${items.length}`);
        return items;
    }

    async openPages() {
        let forums = await this.forumsService.findAll();
        for await (let forum of forums) {
            let items = await this.getThreadsToScrappContent(forum);
            if (items.length > 0) {
                this.logger.debug(`${items.map(item => {
                    return item.title
                }).join(', \n')}`);
                // Url ktore sa aktualne przetwarzane
                let currentUrls = [];
                this.logger.debug(`Itemy na poczatku ${items.length}, ${items.map(item => {
                    return item.url
                }).join(',')}`);
                // Dopuki
                while (items.length > 0) {
                    if (items.length >= 15) {
                        currentUrls = items.slice(Math.max(items.length - 15, 0))
                        this.logger.debug(`CurrentUrls gdy jest wiecej niz 5. ${currentUrls.length}, ${currentUrls.map(item => {
                            return item.url
                        }).join(',')}`)

                        const pagesCreated = await this.createPages(currentUrls);

                        // Zaamykamy otwarte karty
                        for await (let page of pagesCreated) {
                            await page.close();
                        }

                        // usuwamy z listy itemow aktualne juz sprawdzone itemy
                        items = items.filter(item => !currentUrls.includes(item))
                        this.logger.debug(`Itemy po usunieciu ${items.length}, ${items.map(item => {
                            return item.url
                        }).join(',')}`)
                    } else {
                        // Sytuacja gdy pozostalych itemow jest mniej niz 5
                        currentUrls = items;

                        await this.createPages(currentUrls);

                        const pagesCreated = await this.createPages(currentUrls);

                        // Zaamykamy otwarte karty
                        for await (let page of pagesCreated) {
                            await page.close();
                        }

                        this.logger.debug(`CurrentUrls gdy jest mniej niz 5. ${currentUrls.length}, ${currentUrls.map(item => {
                            return item.url
                        }).join(',')}`)
                        items = [];
                        this.logger.debug(`Itemy po usunieciu ${items.length}, ${items.map(item => {
                            return item.url
                        }).join(',')}`)
                    }
                }
            }
        }
    }

    async createThreads(limit: number = 40) {
        const forums = await this.forumsService.findAll();
        for await (let forum of forums) {
            try {
                const response = await this.httpService.get(`
https://epremki.com/syndication.php?fid=${forum.fid}&type=json&limit=${limit}`, {
                    headers: {
                        Cookie: `mybbuser=${process.env.MYBB_COOKIE};`
                    }
                }).toPromise()
                if (response.data.items.length > 0) {
                    for await (let threadItem of response.data.items) {
                        if (!await this.threadsRepository.findOne({where: {tid: threadItem.id}})) {
                            const newThread = this.threadsRepository.create({
                                tid: threadItem.id,
                                url: threadItem.url,
                                title: threadItem.title,
                                //content_html: content_html,
                                created_at: threadItem.date_published,
                                updated_at: threadItem.date_modified,
                                is_visible: false
                            })

                            await this.threadsRepository.save(newThread);

                            const forumThreads = await forum.threads;
                            forumThreads.push(newThread);

                            await this.forumsService.save(forum);
                            this.logger.debug(`Thread -> ${newThread.title}`);
                        } else {
                            this.logger.debug(`Thread[Exist] -> ${threadItem.title}`);
                        }
                    }
                }
            } catch (e) {
                console.log(e);
            }
        }
    }

    async sync(limit: number = 40) {
        await this.createThreads(limit);
        await this.openPages();
    }

    @Cron(CronExpression.EVERY_2_HOURS)
    async syncThreadsCron() {
        await this.addThreadsSyncToQueue();
    }
}
