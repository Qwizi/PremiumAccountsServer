import {HttpService, HttpStatus, Inject, Injectable, OnModuleInit} from '@nestjs/common';
import {EPREMKI_RSS_URL, MYBB_COOKIE_OBJ} from "./forums.constants";
import {Forum} from "./entities/forum.entitiy";
import {CreateForumDto} from "./dto/createForumDto";
import * as cheerio from 'cheerio';
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";

@Injectable()
export class ForumsService {
    constructor(
        @InjectRepository(Forum) private forumsRepository: Repository<Forum>,
        private httpService: HttpService,
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

    async sync() {
        try {
            const response = await this.httpService.get('https://epremki.com/misc.php?action=syndication', {
                headers: {
                    Cookie: `mybbuser=${process.env.MYBB_COOKIE};`
                }
            }).toPromise()
            const htmlData = response.data;
            const $ = cheerio.load(htmlData);

            let forumItems = []
            const ignoreForums = await this.getIgnoreForums();

            $("select[name='forums[]'] option").each(function(i, op) {
                // @ts-ignore
                const name = $(op).text();
                const value = $(op).val();
                if (!ignoreForums.includes(value)) {
                    const replacedName = name.replace(/\s/g, '');
                    const forum = {
                        title: replacedName,
                        fid: value
                    }
                    forumItems.push(forum);
                }
            });
            for (let forum of forumItems) {
                if (!await this.forumsRepository.findOne({where: {fid: forum.fid, title: forum.title}})) {
                    const newForum = await this.forumsRepository.create({fid: forum.fid, title: forum.title});
                    await this.forumsRepository.save(newForum);
                }
            }
        } catch (e) {
            console.log(e)
        }
        // Tworzymy nowa strone
        /*const page = await this.browser.newPage()
        await page.setCookie(MYBB_COOKIE_OBJ);
        // Przechodzimy na adres syndication
        await page.goto(EPREMKI_RSS_URL);

        await page.waitForSelector("select[name='forums[]']");


        // Pobieramy selecta for
        let forumOptions = await page.$$("select[name='forums[]'] > option")
        const ignoreForumsId = await this.getIgnoreForums();
        console.log(forumOptions.length);
        for (let option of forumOptions) {
            // Pobieramy nazwe forum
            // @ts-ignore
            let name = await page.evaluate(el => el.innerHTML, option);

            // Pobieramy id forum
            // @ts-ignore
            let value = await page.evaluate(el => el.value, option);

            // Sprawdzamy tylko te fora ktore chcemy
            if (!ignoreForumsId.includes(value)) {
                // Usuamy &nbsp; z nazwy
                let replaceName = name.replace(/&nbsp;/g, "").replace(" ", "");

                // Sprawdzamy czy forum o danej nazwie i id istnieje jezeli nie to tworzymy nowe forum
                if (!await this.forumsRepository.findOne({where: {fid: value, title: replaceName}})) {
                    const newForum = await this.forumsRepository.create({fid: value, title: replaceName});
                }

                console.log(replaceName);
                console.log(value);
            }
        }
        // Zamykamy strone
        await page.close();
        // Zamykamy przegladarke
        await this.browser.close();
        */
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
            '189'
        ]
    }

}
