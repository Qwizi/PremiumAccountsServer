import {Body, Controller, HttpException, HttpStatus, Post} from '@nestjs/common';
import {ThreadsService} from "./threads.service";
import {SearchThreadDto} from "./dto/searchThreadDto";
import {Op} from 'sequelize';

@Controller('threads')
export class ThreadsController {
    constructor(private threadsService: ThreadsService) {
    }

    @Post('sync')
    async sync() {
        return this.threadsService.sync();
    }

    @Post('search')
    async search(@Body() searchThreadDto: SearchThreadDto) {
        const threads = await this.threadsService.findAll({
            where: {
                title: {
                    [Op.substring]: searchThreadDto.name
                },
                content_html: {
                    [Op.substring]: ':'
                }
            },
            order: [
                ['updatedAt', 'DESC']
            ]
        })
        if (!threads) throw new HttpException('Thread not found', HttpStatus.NOT_FOUND)
        return threads;
    }
}
