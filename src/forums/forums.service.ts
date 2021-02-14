import {Injectable} from '@nestjs/common';
import {MYBB_COOKIE_OBJ} from "./forums.constants";
import {Forum} from "./entities/forum.entitiy";
import {CreateForumDto} from "./dto/createForumDto";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {InjectQueue} from "@nestjs/bull";
import {Queue} from "bull";
import {InjectBrowser} from "nest-puppeteer";
import {Browser, Page} from "puppeteer";
import {Logger} from "@nestjs/common";

@Injectable()
export class ForumsService {
    private logger = new Logger("ForumsService");
    constructor(
        @InjectRepository(Forum) private forumsRepository: Repository<Forum>,
        @InjectQueue('forums') private forumsQueue: Queue,
        @InjectBrowser() private readonly browser: Browser,
    ) {}

    async save(forum: Forum) {
        return this.forumsRepository.save(forum);
    }

    async create(createForumDto: CreateForumDto): Promise<Forum> {
        const forum = await this.forumsRepository.create(createForumDto);
        await this.forumsRepository.save(forum);
        return forum;
    }

    async findAll(options?: object): Promise<Forum[]> {
        return options !== null ? this.forumsRepository.find(options): this.forumsRepository.find();
    }

    async findOne(options: object): Promise<Forum> {
        return this.forumsRepository.findOne(options);
    }

    async update(forum: Forum, createForumDto: CreateForumDto): Promise<Forum> {
        if (createForumDto.fid) forum.fid = createForumDto.fid;
        if (createForumDto.title) forum.title = createForumDto.title
        return this.forumsRepository.save(forum);
    }

    async delete(forum: Forum) {
        return this.forumsRepository.delete(forum.id);
    }

    async getForumsOptions(page: Page) {
        try {
            const selector = "select[name='forums[]'] option";
            await page.waitForSelector(selector);
            let forumItems = [];
            const ignoreForums = await this.getIgnoreForums();
            return await page.evaluate(async (selector, forumItems, ignoreForums) => {
                const forums = document.querySelectorAll(selector);
                forums.forEach(forum => {
                    if (!ignoreForums.includes(forum.value)) {
                        const replacedForumName = forum.innerText.replace(/\s/g, '');
                        forumItems.push({
                            title: replacedForumName,
                            fid: forum.value
                        })
                    }
                })
                return forumItems;
            }, selector, forumItems, ignoreForums);
        } catch (e) {
            console.log(e);
        }
    }

    async sync() {
        try {
            const page = await this.browser.newPage();
            this.logger.log("Otwarlem nowa karte");

            const epremki_url = 'https://epremki.com/misc.php?action=syndication';
            await page.setCookie(MYBB_COOKIE_OBJ);
            await page.goto(epremki_url);
            this.logger.log(`Przeszedlem na strone ${await page.title()}`);

            const forums = await this.getForumsOptions(page);
            console.log(forums);
            this.logger.log(`Ilosc pobranych for (${forums.length})`);
            this.logger.log(JSON.stringify(forums));
            await page.close();
            this.logger.log("Zamknalem strone");
            await this.browser.close();
            this.logger.log("Zamknalem przegladarke");

            this.logger.log("Zaczynam zapisywac fora do bazy");
            for await (let forum of forums) {
                if (!await this.forumsRepository.findOne({where: {fid: forum.fid, title: forum.title}})) {
                    const newForum = await this.forumsRepository.create({fid: forum.fid, title: forum.title});
                    await this.forumsRepository.save(newForum);
                    this.logger.log(`Forum [${forum.title} | ${forum.fid}] zostalo zapisane w bazie`);
                } else {
                    this.logger.log(`Forum [${forum.title} | ${forum.fid}] juz istnieje w naszej bazie`);
                }
            }
            this.logger.log("Zakonczylem zapisywac fora w bazie");
        } catch (e) {
            this.logger.error(e.message);
        }
    }

    async addForumsSyncToQueue() {
        return this.forumsQueue.add({});
    }

    async getIgnoreForums() {
        return [
            'all',
            '1',
            '3',
            '4',
            '207',
            '5',
            '9',
            '13',
            '18',
            '21',
            '89',
            '132',
            '133',
            '134',
            '25',
            '26',
            '27',
            '28',
            '121',
            '105',
            '123',
            '126',
            '127',
            '30',
            '31',
            '37',
            '32',
            '33',
            '34',
            '35',
            '36',
            '103',
            '104',
            '38',
            '138',
            '109',
            '41',
            '45',
            '49',
            '115',
            '52',
            '94',
            '56',
            '99',
            '128',
            '130',
            '131',
            '140',
            '210',
            '168',
            '169',
            '141',
            '145',
            '149',
            '156',
            '152',
            '160',
            '167',
            '209',
            '170',
            '166',
            '165',
            '57',
            '58',
            '59',
            '60',
            '61',
            '81',
            '102',
            '189',
            '113',
            '112',
            '118',
            '135',
            '106',
            '124',
            '125',
            '139',
            '139',
            '117',
            '116',
            '119',
            '181',
            '180',
            '154',
            '153',
            '201',
            '202',
            '208',
            '155',
        ]
    }

}
